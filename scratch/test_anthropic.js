import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const models = [
  "claude-3-5-sonnet-20241022",
  "claude-3-5-sonnet-20240620",
  "claude-3-opus-20240229",
  "claude-3-sonnet-20240229",
  "claude-3-haiku-20240307",
  "claude-2.1",
  "claude-2.0",
  "claude-instant-1.2"
];

async function test() {
  for (const model of models) {
    try {
      console.log(`Testing model: ${model}...`);
      const completion = await anthropic.messages.create({
        model: model,
        max_tokens: 10,
        messages: [{ role: "user", content: "Hi" }],
      });
      console.log(`✅ Success with ${model}`);
      process.exit(0);
    } catch (err) {
      console.log(`❌ Fail with ${model}: ${err.message}`);
    }
  }
}

test();
