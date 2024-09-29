import {
  BedrockRuntimeClient,
  ConverseCommand,
  Message,
} from '@aws-sdk/client-bedrock-runtime';

const historyToString = (history: string[]) => {
  return history.join('\n\n');
};

export const callClaudeConverse = async (
  history: string[],
  systemPrompt: string,
) => {
  const client = new BedrockRuntimeClient({
    region: process.env.AWS_DEFAULT_REGION as string,
    credentials: {
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      sessionToken: process.env.AWS_SESSION_TOKEN as string,
    },
  });

  const modelId = process.env.MODEL_ID as string;
  const conversation: Message[] = [
    {
      role: 'user',
      content: [{ text: historyToString(history) }],
    },
  ];

  const response = await client.send(
    new ConverseCommand({
      modelId: modelId,
      messages: conversation,
      system: [{ text: systemPrompt }],
    }),
  );

  return response.output?.message?.content?.at(0)?.text as string;
};
