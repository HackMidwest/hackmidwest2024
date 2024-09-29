import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from '@aws-sdk/client-bedrock-runtime';
import { PinataSDK } from 'pinata';
import { v4 } from 'uuid';

const pinata = new PinataSDK({
  pinataJwt: `${import.meta.env.VITE_PINATA_JWT}`,
  pinataGateway: `${import.meta.env.VITE_GATEWAY_URL}`,
});

export const callStableImage = async (prompt: string) => {
  const client = new BedrockRuntimeClient({
    region: process.env.AWS_DEFAULT_REGION as string,
    credentials: {
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      sessionToken: process.env.AWS_SESSION_TOKEN as string,
    },
  });

  const modelId = process.env.IMAGE_MODEL_ID as string;
  const enclosed_prompt = 'Human: ' + prompt + '\n\nAssistant:';

  const modelInput: InvokeModelCommandInput = {
    modelId: modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      prompt: enclosed_prompt,
    }),
  };

  const response = (await client.send(new InvokeModelCommand(modelInput))).body;

  const blob = new Blob([response]);
  const file = new File([blob], v4());

  const upload = await pinata.upload.file(file);

  const signedUrl = await pinata.gateways.createSignedURL({
    cid: upload.cid,
    expires: 30 * 60, // seconds the link is valid for
  });

  return signedUrl;
};
