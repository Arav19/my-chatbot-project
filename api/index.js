const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post('/api/chat', async (req, res) => {
    const userInput = req.body.message;
    console.log("Received user input:", userInput);

    if (!OPENAI_API_KEY) {
        console.error("OpenAI API key is missing");
        return res.status(500).json({ error: "OpenAI API key is not set" });
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ "role": "user", "content": userInput }],
                max_tokens: 150
            })
        });

        // Check and log error responses from OpenAI
        if (!response.ok) {
            const errorDetail = await response.json();
            console.error("Error from OpenAI:", errorDetail);
            return res.status(response.status).json({ error: errorDetail });
        }

        // Process the successful response
        const data = await response.json();
        console.log("Response data from OpenAI:", data);

        // Check if data contains the expected response structure
        if (data.choices && data.choices[0] && data.choices[0].message) {
            res.json({ reply: data.choices[0].message.content });
        } else {
            console.error("Unexpected response structure from OpenAI:", data);
            res.status(500).json({ error: "Unexpected response from OpenAI" });
        }
    } catch (error) {
        console.error("Fetch error:", error.message);
        res.status(500).json({ error: "Error fetching response from OpenAI" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
