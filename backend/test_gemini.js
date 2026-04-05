const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listAllModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // The listModels method is not directly on genAI in the same way, 
        // it requires a different initialization or is part of a different subpackage.
        // Actually, most keys support gemini-1.5-flash.
        // Let's try gemini-1.5-flash-8b
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
        const result = await model.generateContent("test");
        console.log("Success with gemini-1.5-flash-8b:", result.response.text());
    } catch (e) {
        console.error("Gemini Error:", e.message);
    }
}

listAllModels();
