import boto3
import json
import os
from botocore.exceptions import ClientError
from flask import Flask, request, jsonify
import speech_recognition as sr
import tempfile
from pydub import AudioSegment

app = Flask(__name__)

# Initialize AWS clients
bedrock_runtime = boto3.client(
    service_name='bedrock-runtime',
    region_name='us-west-2',
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
    aws_session_token=os.environ.get('AWS_SESSION_TOKEN')
)

@app.route('/voice', methods=['POST'])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']

    # Save the audio file to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio_file:
        temp_audio_path = temp_audio_file.name

    try:
        # Convert the audio file to WAV format using pydub
        audio = AudioSegment.from_file(audio_file)
        audio.export(temp_audio_path, format="wav")

        # Transcribe the audio using speech recognition
        recognizer = sr.Recognizer()
        with sr.AudioFile(temp_audio_path) as source:
            audio_data = recognizer.record(source)

        # Convert audio to text
        question = recognizer.recognize_google(audio_data)
        print("Transcribed text:", question)
        
        # Call Bedrock API with the transcribed question
        bedrock_response = query_bedrock(question)

        return jsonify({"response": bedrock_response}), 200
    except sr.UnknownValueError:
        return jsonify({"error": "Sorry, I couldn't understand that."}), 400
    except sr.RequestError:
        return jsonify({"error": "Error with the speech recognition service."}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)

def query_bedrock(question, context=""):
    prompt = f"""Human: Given the following context (if any), please answer the question. If there's no context, treat it as a general conversation.

Context: {context}

Question: {question}"""

    try:
        response = bedrock_runtime.invoke_model(
            body=json.dumps({"inputText": prompt}),
            modelId="amazon.titan-tg1-large",
            accept="application/json",
            contentType="application/json"
        )

        response_body = response['body'].read().decode('utf-8')
        response_json = json.loads(response_body)
        output_text = response_json['results'][0].get('outputText', '')

        return output_text
    except ClientError as e:
        print(f"Error querying Bedrock: {e}")
        return "Error querying the Bedrock model."

if __name__ == '__main__':
    app.run(debug=True, port=5000)
