import {
  BedrockRuntimeClient,
  ConverseCommand,
  Message,
} from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({
  region: process.env.AWS_DEFAULT_REGION as string,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    sessionToken: process.env.AWS_SESSION_TOKEN as string,
  },
});

const modelId = process.env.MODEL_ID as string;
const prompt = "What is 'rubber duck debugging'";

const conversation: Message[] = [
  {
    role: 'user',
    content: [{ text: prompt }],
  },
];

client
  .send(new ConverseCommand({ modelId: modelId, messages: conversation }))
  .then(console.log);
