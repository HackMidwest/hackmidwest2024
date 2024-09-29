from flask import Flask, request, jsonify
from flask_cors import CORS
import boto3
import json
import os
import logging
import re

# Setup logging
logging.basicConfig(level=logging.INFO)

app = Flask(__name__)

# Enable CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}})

# Configure the Bedrock client
bedrock_runtime = boto3.client(
    service_name="bedrock-runtime",
    region_name='us-west-2',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    aws_session_token=os.getenv('AWS_SESSION_TOKEN')
)

def generate_flashcards(topic):
    """Invoke the Bedrock model to generate flashcards based on the topic."""

    # Prepare the input prompt for generating flashcards
    prompt = f"Generate 9 flashcards in Q&A format about the following topic: {topic}. Format the output as a JSON array of objects, each with 'question' and 'answer' keys."

    # Construct the request body
    body = json.dumps({
        "inputText": prompt,
        "textGenerationConfig": {
            "maxTokenCount": 1000,
            "temperature": 0.7,
            "topP": 0.8,
            "stopSequences": []
        }
    })

    try:
        logging.info("Attempting to invoke Bedrock model for flashcard generation with prompt:")
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
        response_body = response['body'].read().decode('utf-8')
        
        # Log the response for debugging
        logging.info(f"Full response body from Bedrock: {response_body}")

        # Parse the response JSON
        response_json = json.loads(response_body)
        output_text = response_json['results'][0].get('outputText', '')

        # Use regex to extract the JSON content between the backticks
        match = re.search(r'```tabular-data-json\s*\n({.*?})\n```', output_text, re.DOTALL)
        if not match:
            logging.error("No JSON found in the model response.")
            return []

        # Extract and parse the JSON part
        flashcards_json = match.group(1)

        # Log the extracted JSON before parsing
        logging.info(f"Extracted JSON: {flashcards_json}")

        # Parse and return the flashcards as a list of objects
        return json.loads(flashcards_json).get("rows", [])

    except json.JSONDecodeError as json_error:
        logging.error(f"Error decoding flashcards JSON from model output: {json_error}")
        return []
    except Exception as e:
        logging.error(f"Error invoking Bedrock model: {e}")
        raise

@app.route('/generate', methods=['POST'])
def generate_flashcards_route():
    try:
        data = request.get_json()
        if not data or 'prompt' not in data:
            return jsonify({'error': 'Invalid input. Missing "prompt" field.'}), 400

        topic = data['prompt']
        flashcards = generate_flashcards(topic)

        return jsonify({'flashcards': flashcards}), 200
    except Exception as e:
        logging.error(f"Error generating flashcards: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5044)
