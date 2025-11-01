import { OpenRouter } from "@openrouter/sdk";
import type { OpenAIModel } from "../types/OpenAIModel";
import type { PollinationsModelsResponse } from "../types/PollinationsModelsResponse";

const openRouter = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
let cache = {
    lastUpdated: 0,
    data: {} as { object: string, data: Array<OpenAIModel> }
};

export default async function GetModels(): Promise<{ object: string, data: Array<OpenAIModel> }> {
    if (cache.lastUpdated >= Date.now()) {
        return cache.data;
    }

    const openRouterModels = await openRouter.models.list();
    const pollinationsModels = await fetch('https://text.pollinations.ai/models').then(data => data.json()) as Array<PollinationsModelsResponse>;
    let response = {
        object: 'list',
        data: [] as Array<OpenAIModel>
    };

    // handle openrouter first
    for (const model of openRouterModels.data) {
        if (model.pricing.prompt === "0" && model.pricing.completion === "0") {
            response.data.push({
                id: model.id,
                object: 'model',
                created: model.created,
                owned_by: model.id.split('/')[0]!
            });
        }
    }

    // pollinations
    for (const model of pollinationsModels) {
        if (['anonymous', 'seed'].includes(model.tier)) {
            response.data.push({
                id: model.name,
                object: 'model',
                created: 0,
                owned_by: 'pollinations'
            });
        }
    }

    cache.lastUpdated = Date.now() + 60 * 60 * 1000;
    cache.data = response;

    return response;
}