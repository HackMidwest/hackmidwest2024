import os
import json
import boto3
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import PyPDF2
import docx
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains on all routes (consider restricting in production)

# Configure the Bedrock client
bedrock_runtime = boto3.client(
    service_name="bedrock-runtime",
    region_name='us-west-2',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    aws_session_token=os.getenv('AWS_SESSION_TOKEN')
)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'docx'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    """Check if the file type is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def read_file(file_path):
    """Read the content of the uploaded file."""
    _, extension = os.path.splitext(file_path)
    try:
        if extension == '.txt':
            with open(file_path, 'r') as file:
                return file.read()
        elif extension == '.pdf':
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                return ' '.join([page.extract_text() for page in pdf_reader.pages])
        elif extension == '.docx':
            doc = docx.Document(file_path)
            return ' '.join([para.text for para in doc.paragraphs])
    except Exception as e:
        logging.error(f"Error reading the file: {e}")
        raise

def generate_summary(text):
    """Generate a summary using the Bedrock model."""

    # Truncate the input text if it's too lengthy for the model
    max_input_length = 4000  # Adjusted for Titan model's typical input length
    if len(text) > max_input_length:
        logging.info(f"Truncating text to {max_input_length} characters.")
        text = text[:max_input_length]

    # Prepare the input text that the model expects
    prompt = f"Summarize the following text in a concise manner:\n\n{text}\n\nSummary:"

    body = json.dumps({
        "inputText": prompt,
        "textGenerationConfig": {
            "maxTokenCount": 1000,
            "temperature": 0.7,
            "topP": 0.9,
            "stopSequences": []
        }
    })

    try:
        logging.info("Attempting to invoke Bedrock model with prompt:")
        logging.info(prompt)

        # Invoke the model with the correct parameters and updated body format
        response = bedrock_runtime.invoke_model(
            body=body,
            modelId="amazon.titan-tg1-large",
            accept="application/json",
            contentType="application/json"
        )

        logging.info("Model invoked successfully.")
        # Extract the response body correctly
        response_body = json.loads(response['body'].read())

        # Extract the summary from the response
        summary = response_body.get('results', [{}])[0].get('outputText', '').strip()
        if not summary:
            logging.error("Received an empty response from the model.")
        return summary

    except Exception as e:
        logging.error(f"Error invoking Bedrock model: {e}")
        raise


@app.route('/mindmap', methods=['POST'])
def upload_file():
    """Upload a file and generate a mind map summary."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        try:
            text = read_file(file_path)
            summary = generate_summary(text)
            os.remove(file_path)  # Remove the file after processing
            return jsonify({'summary': summary}), 200
        except Exception as e:
            logging.error(f"Error processing file: {e}")  # Use logging instead of print
            os.remove(file_path)  # Remove the file if an error occurs
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'File type not allowed'}), 400

if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True, port=5000)