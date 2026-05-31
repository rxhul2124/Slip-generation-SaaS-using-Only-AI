import { GoogleGenAI } from "@google/genai";
import { config } from "dotenv";

config();

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Hello",
    });
    console.log("SUCCESS:", response.text());
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

test();
