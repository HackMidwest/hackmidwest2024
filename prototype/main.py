import os
import boto3
import json
from dotenv import load_dotenv

load_dotenv()

# Get AWS credentials from environment variables
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION', 'us-west-2')  

# Initialize the Bedrock Runtime client with credentials
bedrock_runtime = boto3.client(
    'bedrock-runtime',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

def llm_call(prompt):
    # Set the model ID for Claude 3 Haiku
    model_id = "anthropic.claude-3-haiku-20240307-v1:0"

    # Prepare the request body
    request_body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 1000,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    }

    # Invoke the model
    response = bedrock_runtime.invoke_model(
        modelId=model_id,
        body=json.dumps(request_body)
    )

    # Parse and return the response
    response_body = json.loads(response['body'].read())
    return response_body['content'][0]['text']

def embeddings_call(text):
    # Set the model ID for Titan Text Embeddings V2
    model_id = "amazon.titan-embed-text-v2:0"

    # Prepare the request body
    request_body = {
        "inputText": text
    }

    # Invoke the model
    response = bedrock_runtime.invoke_model(
        modelId=model_id,
        body=json.dumps(request_body)
    )

    # Parse and return the response
    response_body = json.loads(response['body'].read())
    return response_body['embedding']

# Example usage
if __name__ == "__main__":
    llm_prompt = "Explain the concept of machine learning in one sentence."
    llm_response = llm_call(llm_prompt)
    print("LLM Response:", llm_response)

    embedding_text = "This is a sample text for embedding."
    embedding = embeddings_call(embedding_text)
    print(f"Embedding (first 5 dimensions out of {len(embedding)}):", embedding[:5])
