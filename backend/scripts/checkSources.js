import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.NEWS_API_KEY;
const URL = `https://newsdata.io/api/1/sources?apikey=${API_KEY}&country=in`;

async function findSources() {
  try {
    const res = await fetch(URL);
    const data = await res.json();
    if (data.status === "success") {
      console.log("Sources found:", data.results.length);
      const itSources = data.results.filter(s => s.name.toLowerCase().includes("india today"));
      console.log("India Today sources:", JSON.stringify(itSources, null, 2));
    } else {
      console.error("API Error:", data);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

findSources();
