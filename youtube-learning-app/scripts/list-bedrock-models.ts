import { BedrockClient, ListFoundationModelsCommand } from '@aws-sdk/client-bedrock';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const client = new BedrockClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function listBedrockModels() {
  try {
    const command = new ListFoundationModelsCommand({
      byProvider: 'Anthropic',
    });
    
    const response = await client.send(command);
    
    console.log('\n=== Available Anthropic Claude Models in AWS Bedrock ===\n');
    
    if (response.modelSummaries) {
      response.modelSummaries.forEach((model) => {
        console.log(`Model ID: ${model.modelId}`);
        console.log(`Model Name: ${model.modelName}`);
        console.log(`Provider: ${model.providerName}`);
        console.log(`Input Modalities: ${model.inputModalities?.join(', ')}`);
        console.log(`Output Modalities: ${model.outputModalities?.join(', ')}`);
        console.log('---');
      });
    }
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

listBedrockModels();
