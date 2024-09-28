import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({
  region: process.env.AWS_DEFAULT_REGION as string,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    sessionToken: process.env.AWS_SESSION_TOKEN as string,
  },
});

const modelId = process.env.IMAGE_MODEL_ID as string;
const prompt = '"Rubber Duck"';
const enclosed_prompt = 'Human: ' + prompt + '\n\nAssistant:';
const modelInput: InvokeModelCommandInput = {
  modelId: modelId,
  contentType: 'application/json',
  accept: 'application/json',
  body: JSON.stringify({
    prompt: enclosed_prompt,
  }),
};

client.send(new InvokeModelCommand(modelInput)).then(console.log);
