import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();

/* =========================
   MIDDLEWARES
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   CHECK API KEY
========================= */
if (!process.env.GROQ_API_KEY) {
    console.error("❌ GROQ_API_KEY manquante dans .env");
    process.exit(1);
}

/* =========================
   GROQ INIT
========================= */
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/* =========================
   ROUTE IA
========================= */
app.post("/ai", async (req, res) => {
    try {
        const { text, lang } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Texte manquant" });
        }

        const response = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content:
                        lang === "fr"
                            ? "Tu es un assistant qui transforme des messages en texte professionnel, poli et clair en français."
                            : "You are an assistant that transforms messages into professional, clear and polite English text."
                },
                {
                    role: "user",
                    content: text
                }
            ],
        });

        res.json({
            result: response.choices[0].message.content
        });

    } catch (err) {
        console.error("❌ ERREUR GROQ:", err.message);
        res.status(500).json({
            error: "Erreur serveur IA"
        });
    }
});

/* =========================
   ROUTE TEST
========================= */
app.get("/", (req, res) => {
    res.send("🚀 WapMsg AI Server is running...");
});

/* =========================
   START SERVER
========================= */
app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});