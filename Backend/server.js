import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import "dotenv/config.js";

const app = express();
const PORT = process.env.PORT || 3001;
const TOKEN = process.env.LANGFLOW_TOKEN || "MISSING_TOKEN";
const RUN_URL =
    "https://api.langflow.astra.datastax.com/lf/a48cecd7-4c9c-477a-ada8-fbf3176fb25a/api/v1/run/a603a3b8-10c4-4b67-9245-0013260aac11";

app.use(cors({ origin: true }));
app.use(express.json());

app.post("/runFlow", async (req, res) => {
    try {
        const lfRes = await fetch(RUN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
                input_value: req.body.message,
                input_type: "chat",
                output_type: "chat",
                session_id: "user_1"
            })
        });

        const raw = await lfRes.text();          // read as text first

        if (!lfRes.ok) {
            console.error("Langflow error", lfRes.status, raw);
            return res.status(lfRes.status).json({
                error: "Langflow error",
                details: raw || lfRes.statusText
            });
        }

        let data;
        try {
            data = JSON.parse(raw);
        } catch (err) {
            console.error("JSON parse fail:", err, raw);
            return res.status(500).json({ error: "Bad JSON from Langflow" });
        }

        console.log("Langflow response status:", lfRes);
        const output = data.outputs[0].outputs[0].artifacts.message;
        console.log(data.outputs[0].outputs[0].artifacts.message)
        res.json({ result: output ?? "[empty reply]" });
    } catch (e) {
        console.error("Proxy crashed:", e);
        res.status(500).json({ error: "Proxy failed", details: e.message });
    }
});

app.listen(PORT, () =>
    console.log(`Langflow proxy running → http://localhost:${PORT}`)
);



