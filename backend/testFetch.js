require('dotenv').config();

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  const prompt = "hello";
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    
    if (!response.ok) {
      const err = await response.text();
      console.error("HTTP Error", response.status, err);
      return;
    }
    
    const data = await response.json();
    console.log(data);
  } catch (e) {
    console.error("Network error", e.message);
  }
}
run();
