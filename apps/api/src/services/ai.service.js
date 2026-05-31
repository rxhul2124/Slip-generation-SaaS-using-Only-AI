import { GoogleGenAI, Type } from "@google/genai";
import { config } from "dotenv";

config();

const apiKey = process.env.GEMINI_API_KEY;
// We instantiate the client only when needed so the server doesn't crash if the key is missing on boot
let aiClient = null;

function getClient() {
  if (!aiClient) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const elementSchema = {
  type: Type.OBJECT,
  properties: {
    type: {
      type: Type.STRING,
      description: "The type of the element. Allowed values: field, barcode, qr, box, line, logo",
    },
    label: {
      type: Type.STRING,
      description: "A human-readable label for the field, e.g., 'Customer Name', 'Quantity', 'Notes'",
    },
    field: {
      type: Type.STRING,
      description: "The canonical data field. Map to one of: companyName, product.name, quantity, serialNumber, barcodeValue, qrPayload, customer.name, destination, notes, generatedDate. If none match, invent a reasonable camelCase name.",
    },
    x: {
      type: Type.NUMBER,
      description: "X coordinate of the top-left corner in millimeters. Assume standard 4x6 inch label is 100mm wide by 150mm tall.",
    },
    y: {
      type: Type.NUMBER,
      description: "Y coordinate of the top-left corner in millimeters.",
    },
    width: {
      type: Type.NUMBER,
      description: "Width of the element in millimeters.",
    },
    height: {
      type: Type.NUMBER,
      description: "Height of the element in millimeters.",
    }
  },
  required: ["type", "label", "field", "x", "y", "width", "height"],
};

export const aiService = {
  /**
   * Analyzes a slip image and extracts the layout bounding boxes as a template array.
   * @param {Buffer} imageBuffer - The image data
   * @param {string} mimeType - The mime type of the image (e.g. image/png, image/jpeg)
   * @returns {Promise<Array>} The layout elements
   */
  async extractTemplateFromImage(imageBuffer, mimeType) {
    const ai = getClient();
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType,
              },
            },
            {
              text: `Analyze this image of a packing slip, shipping label, or invoice.
Identify all the logical layout blocks (e.g., Company Logo, Header Text, Ship To Address, Product Name, Quantity, Barcodes, QR Codes, Notes, Borders, Separator Lines).
For each block, return a precise bounding box (x, y, width, height) in millimeters. 
Assume the total document canvas is exactly 100mm wide and scales height proportionally (or use 150mm for a standard 4x6 label). 
Return the result strictly as a JSON array of objects.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: elementSchema,
          description: "List of layout elements detected in the slip",
        },
        temperature: 0.1, // Low temperature for deterministic layout extraction
        maxOutputTokens: 8192,
      },
    });

    try {
      const text = response.text;
      return JSON.parse(text);
    } catch (err) {
      console.error("Failed to parse Gemini response:", err);
      throw new Error("Failed to extract template layout from the image. Details: " + err.message);
    }
  },
};
