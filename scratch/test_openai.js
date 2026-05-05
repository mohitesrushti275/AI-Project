import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function test() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: "Say hello" }],
    });
    console.log("OpenAI Response:", completion.choices[0].message.content);
  } catch (err) {
    console.error("OpenAI Error:", err.message);
  }
}

test();
