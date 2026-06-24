require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  try {
     const result = await model.generateContent("hello");
     console.log(result.response.text());
  } catch (e) {
     console.error("1.5-flash error", e.message);
  }

  const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
  try {
     const result = await model2.generateContent("hello");
     console.log(result.response.text());
  } catch (e) {
     console.error("pro error", e.message);
  }
}

run();
