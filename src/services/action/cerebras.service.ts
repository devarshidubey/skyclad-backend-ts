import Cerebras from "@cerebras/cerebras_cloud_sdk";
import logger from "../../utils/logger.js";

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
        console.log(accumulated);
        return JSON.parse(accumulated);
    } catch (e) {
        throw new Error("Invalid JSON returned from Cerebras");
    }
}
