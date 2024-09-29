import os
import boto3
import json

# Load AWS credentials from environment variables
aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
aws_session_token = os.getenv('AWS_SESSION_TOKEN')  # Optional, only if using temporary credentials
region_name = os.getenv('AWS_REGION', 'us-west-2')

# Create a client for AWS Bedrock
bedrock_client = boto3.client(
    'bedrock-runtime',
    region_name=region_name,
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key,
    aws_session_token=aws_session_token
)

# Specify the model ID for invocation
model_id = "amazon.titan-tg1-large"

# Define the request payload
request_payload = {
    "prompt": "Please summarize the following text: Artificial Intelligence is transforming the world of technology...",
    "max_tokens_to_sample": 500,
    "temperature": 0.7,
    "top_p": 1.0,
}

try:
    # Invoke the Bedrock model
    response = bedrock_client.invoke_model(
        modelId=model_id,
        body=json.dumps(request_payload),
        accept="application/json",
        contentType="application/json"
    )

    # Parse and print the response
    response_body = json.loads(response['body'].read())
    completion = response_body.get('completion', '')
    print("Model Response:", completion)

except Exception as e:
    print(f"Error invoking model: {e}")
