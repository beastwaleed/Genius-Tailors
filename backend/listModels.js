require('dotenv').config();

async function run() {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
  const data = await response.json();
  if (data.models) {
    console.log(data.models.map(m => m.name));
  } else {
    console.error(data);
  }
}

run();
