import { OpenRouter } from "@openrouter/sdk";
import type { OpenAIModel } from "../types/OpenAIModel";
import type { PollinationsModelsResponse } from "../types/PollinationsModelsResponse";
import type { ModelsListResponse } from "@openrouter/sdk/models";
import type { DumoInferenceModel } from "../types/ModelsResponse";
import GenerateDescription from "./GenerateDescription";

const openRouter = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

let cache = {
    lastUpdated: 0,
    data: {} as { pollinations: Array<PollinationsModelsResponse>, openrouter: ModelsListResponse }
};

export async function GetModelsFromProviders(): Promise<{ pollinations: Array<PollinationsModelsResponse>, openrouter: ModelsListResponse }> {
    if (cache.lastUpdated >= Date.now()) {
        return cache.data;
    }

    const openRouterModels = await openRouter.models.list();
    const pollinationsModels = await fetch('https://text.pollinations.ai/models').then(data => data.json()) as Array<PollinationsModelsResponse>;

    const final = { pollinations: pollinationsModels, openrouter: openRouterModels };

    cache.lastUpdated = Date.now() + 60 * 60 * 1000;
    cache.data = final;
    return final;
}

export async function GetModelsOpenAI(): Promise<{ object: string, data: Array<OpenAIModel> }> {
    const models = await GetModelsFromProviders();

    let response = {
        object: 'list',
        data: [] as Array<OpenAIModel>
    };

    // handle openrouter first
    for (const model of models.openrouter.data) {
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
    for (const model of models.pollinations) {
        if (['anonymous', 'seed'].includes(model.tier)) {
            response.data.push({
                id: model.name,
                object: 'model',
                created: 0,
                owned_by: 'pollinations'
            });
        }
    }

    return response;
}

export async function GetModels(): Promise<Array<DumoInferenceModel>> {
    const models = await GetModelsFromProviders();

    let results: Array<DumoInferenceModel> = [];

    //handle openrouters
    for(const model of models.openrouter.data) {
        if (model.pricing.prompt === "0" && model.pricing.completion === "0") {
            results.push({
                id: model.id,
                friendlyName: model.name,
                created: model.created,
                description: {
                    aiGenerated: false,
                    text: model.description ?? 'No description available'
                },
                inputModalities: model.architecture.inputModalities as Array<'text' | 'image' | 'audio' | 'video'>,
                outputModalities: model.architecture.outputModalities as Array<'text' | 'image'>,
                supportsTools: model.supportedParameters.includes('tools'),
                supportedParameters: model.supportedParameters
            });
        }
    }

    //handle pollinations
    for(const model of models.pollinations) {
        if (['anonymous', 'seed'].includes(model.tier)) {
            const description = await GenerateDescription(model.description);

            const result = {
                id: model.name,
                friendlyName: model.description,
                created: 0,
                description: {
                    aiGenerated: !!description,
                    text: description ?? 'No description available'
                },
                inputModalities: model.input_modalities,
                outputModalities: model.output_modalities,
                supportsTools: model.tools,
                supportedParameters: [
                    'seed',
                    'temperature',
                    'max_tokens',
                    'reasoning_effort'
                ]
            };

            if (result.supportsTools) result.supportedParameters.push('tools');

            results.push(result);
        }
    }

    return results;
}