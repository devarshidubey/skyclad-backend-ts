import Cerebras from "@cerebras/cerebras_cloud_sdk";
import logger from "../../utils/logger.js";
import HTTPError from "../../utils/HTTPError.js";

interface CerebrasChunk {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
}

async function getCerebrasClient() {
    const cerebras = new Cerebras({
        apiKey: process.env.CEREBRAS_API_KEY!,
    });
    return cerebras;
}


export async function askCerebras(llmPrompt: string) {
    const cerebras = await getCerebrasClient();
    const stream = await cerebras.chat.completions.create({
        model: "qwen-3-235b-a22b-instruct-2507",
        messages: [{ role: "user", content: llmPrompt }],
        stream: true,
        temperature: 0.7,
        top_p: 0.8,
        max_completion_tokens: 500,
    });

    let accumulated = "";
    for await (const chunk of stream as AsyncIterable<CerebrasChunk>) {
        accumulated += chunk.choices?.[0]?.delta?.content || "";
    }

    try {
        //console.log(accumulated);
        return JSON.parse(accumulated);
    } catch (e) {
        throw new Error("Invalid JSON returned from Cerebras");
    }
}

export async function askCerebrasWithRetry(prompt: string, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await askCerebras(prompt);
        } catch (err: any) {
            if (err.message.includes("429")) {
                await new Promise(res => setTimeout(res, delay * Math.pow(2, i))); // exponential backoff
                continue;
            }
            throw err;
        }
    }
    throw new HTTPError(429, "AI Agent rate limited due to high traffic");
}
