AI Receipt Parser

This is a full-stack web app where users can upload a receipt image and extract structured data like vendor name, date, line items, and total amount.

Users can review, edit, and save the corrected receipt data. The project uses OCR + Local LLM (Ollama with Llama3:8b) + SQLite for persistence.

Run Locally

1. Install dependencies
npm install

2. Install Ollama (Local LLM)
https://ollama.com/download

3. Start Ollama server (IMPORTANT)
Open system terminal / CMD:
ollama serve

4. Pull model (one-time setup)
ollama pull llama3:8b

5. Run the project
npm run dev

6. Open browser
http://localhost:3000

Notes:
- Make sure Ollama server is running before starting the app
- First request may take longer due to model warm-up


----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

5 Design Decisions-

1. What is a line item?
For this project, I treated a line item as a single product entry on the receipt basically something the user actually bought.

Each item includes:
- description
- quantity
- unit price
- total price


2. What happens when the LLM returns malformed output?
LLMs can sometimes return messy or invalid JSON, so I didn’t rely on it blindly.

I added a simple fallback approach:
- First, try to clean and extract valid JSON from the response
- If that still fails, return a default structured object

So the app never crashes and always gives some usable output, even if it’s not perfect.


3. How do you handle low confidence extractions?
Receipts can vary a lot blurry images, unusual formats etc.

Instead of failing in such cases, I:
- Allow partial data extraction
-Fill missing fields with fallback values
- Let the user manually edit everything afterward


4. How does the user know what to correct?
I kept this simple, all extracted fields are directly editable.

The user can:
-Review the extracted data
-Make corrections inline
- Save the updated version


5. Which model did you pick and why?
I used a local LLM (llama3:8b via Ollama).

The main reason was to keep the project easy to run locally without needing any API key. It also keeps all data on the user’s machine, which is better for privacy.

The tradeoff is that it is a bit slower than cloud models and may not always be perfectly accurate, but for this assignment I focused on keeping things simple and easy to run.






