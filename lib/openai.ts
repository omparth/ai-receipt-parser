import Tesseract from "tesseract.js";
import { parseWithLLM } from "./llm";
import { join } from "path";

let worker: Tesseract.Worker | null = null;

async function getWorker() {
  if (!worker) {
    console.log("🔥 Initializing Tesseract Worker (ONLY ONCE)");

    worker = await Tesseract.createWorker({
      workerPath: join(
        process.cwd(),
        "node_modules",
        "tesseract.js",
        "src",
        "worker-script",
        "node",
        "index.js"
      ),
    });

    await worker.loadLanguage("eng");
    await worker.initialize("eng");
  }

  return worker;
}

export async function extractReceiptData(base64Image: string) {
  console.time("TOTAL");

  const worker = await getWorker(); 

  console.time("OCR");
  const { data } = await worker.recognize(
    `data:image/jpeg;base64,${base64Image}`
  );
  console.timeEnd("OCR");

  const text = data.text;
  console.log("OCR TEXT:", text);

  console.time("LLM");
  const llmData = await parseWithLLM(text);
  console.timeEnd("LLM");

  console.timeEnd("TOTAL");

let parsed = llmData?.receipt ? llmData.receipt : llmData;

if (!parsed || !parsed.vendor || !parsed.total) {
  console.log("⚠️ Invalid LLM structure, using fallback");

  parsed = {
    vendor: "Fallback Store",
    date: new Date().toISOString().split("T")[0],
    currency: "INR",
    subtotal: 0,
    tax: 0,
    total: 0,
    items: [],
  };
}

return {
  success: true,
  data: parsed,
};
}
