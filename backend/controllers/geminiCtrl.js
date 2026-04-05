const { GoogleGenerativeAI } = require("@google/generative-ai");
const Transaction = require("../model/Transaction");
require("dotenv").config();

// Using the working model name from your other project (VoxSphere)
// We'll use 'gemini-1.5-flash' as the primary and 'gemini-2.0-flash' as a modern fallback.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const geminiController = {
  //! Extract category details from voice input
  extractCategoryFromVoice: async (req, res) => {
    try {
      const { input } = req.body;
      if (!input) return res.status(400).json({ error: "Input is required" });

      const prompt = `
        You will be given a user command like "Add shopping as expense".
        Extract the type and name in JSON format:
        { "type": "expense", "name": "shopping" }
        Command: ${input}
        If you cannot extract it, return an empty object {}. Return ONLY JSON.
      `;

      // Try multiple models to ensure compatibility with your API key
      const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-pro"];
      let text = "";

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          text = await result.response.text();
          if (text) break;
        } catch (err) {
          console.warn(`Model ${modelName} failed, trying next...`);
        }
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const json = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      res.json({ category: json });
    } catch (error) {
      console.error("Gemini Category Extraction Error:", error);
      res.status(500).json({ error: "Something went wrong", detail: error.message });
    }
  },

  //! Extract transaction details from voice input
  extractTransactionFromVoice: async (req, res) => {
    try {
      const { input } = req.body;
      if (!input) return res.status(400).json({ error: "Input is required" });

      const today = new Date().toISOString().slice(0, 10);
      const prompt = `
        Extract a financial transaction from this voice input: "${input}"
        Return this JSON format ONLY:
        {
          "type": "income" or "expense",
          "amount": number,
          "category": "string",
          "date": "yyyy-mm-dd",
          "description": "short summary"
        }
        Today is ${today}. Use this to resolve relative dates like "yesterday".
        If you cannot extract data, return {}. Return ONLY JSON.
      `;

      const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-pro"];
      let text = "";

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          text = await result.response.text();
          if (text) break;
        } catch (err) {
          console.warn(`Model ${modelName} failed:`, err.message);
        }
      }

      if (!text) throw new Error("All Gemini models failed to respond. Please check your API key.");

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const json = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      res.json({ transaction: json });
    } catch (error) {
      console.error("Gemini Transaction Extraction Error:", error);
      res.status(500).json({ error: "Something went wrong", detail: error.message });
    }
  },

  //! Handle generic AI chat
  sendUserChatToGemini: async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required" });

      // Fetch user's latest transactions to provide context
      const transactions = await Transaction.find({ user: req.user }).sort({ date: -1 }).limit(10);
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      const contextPrompt = `
        You are a helpful personal finance assistant. 
        Here is some of the user's recent transaction data:
        ${JSON.stringify(transactions)}
        Summary of these 10 transactions: Total Income: ${totalIncome}, Total Expense: ${totalExpense}.
        
        User Question: "${prompt}"
        Please answer the question based on the provided data or general financial advice if the data isn't relevant.
        Keep the response concise and friendly.
      `;

      const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-pro"];
      let text = "";

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(contextPrompt);
          text = await result.response.text();
          if (text) break;
        } catch (err) {
          console.warn(`Model ${modelName} failed for chat:`, err.message);
        }
      }

      if (!text) throw new Error("Could not get a response from Gemini. Please try again.");

      res.json({ reply: text });
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      res.status(500).json({ error: "Failed to process chat", detail: error.message });
    }
  },

  //! Initialize chat session with user data
  sendUserDataToGemini: async (req, res) => {
    try {
      // Limit transactions to avoid prompt blowup
      const transactions = await Transaction.find({ user: req.user }).sort({ date: -1 }).limit(20);
      const dataString = JSON.stringify(transactions);
      
      const prompt = `Here is my recent financial data: ${dataString}. Acknowledge this data and say 'How can I assist you today?'`;

      const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-pro"];
      let text = "";

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          text = await result.response.text();
          if (text) break;
        } catch (err) {
          console.warn(`Model ${modelName} failed for init:`, err.message);
        }
      }

      if (!text) throw new Error("Initialization failed");

      res.json({ message: "Data sent", reply: text });
    } catch (error) {
      console.error("Gemini Init Error:", error);
      res.status(500).json({ error: "Failed to initialize", detail: error.message });
    }
  }
};

module.exports = geminiController;
