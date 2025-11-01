import Elysia, { sse, status } from "elysia";
import GetModels from "./GetModels";
import OpenAI from "openai";
import z from 'zod';

const handler = new Elysia({ prefix: '/v1beta/chat/completions'})
    .post('/', async function*({ body, set }) {
        const models = (await GetModels()).data.map(item => item.id);

        if (!models.includes(body.model)) {
            return status(400, {
                error: {
                    message: `${body.model} is not a valid model ID`,
                    code: 400
                }
            });
        }

        const sdk = new OpenAI({
            baseURL: body.model.includes('/') ? 'https://openrouter.ai/api/v1' : 'https://text.pollinations.ai/v1',
            apiKey: body.model.includes('/') ? process.env.OPENROUTER_API_KEY : process.env.POLLINATIONS_API_KEY
        });

        if (body.stream) {
            try {
                // @ts-expect-error
                const response = sdk.chat.completions.stream(body);
                set.headers['content-type'] = 'text/event-stream';

                for await (const chunk of response) {
                    yield sse(JSON.stringify(chunk));
                }
            } catch (error) {
                const err = error as { status?: number, response?: { status?: number } };
                const statusCode = err.status ?? err.response?.status ?? 500;
                return status(statusCode, {
                    error: {
                        message: (error as Error).message,
                        code: statusCode
                    }
                });
            }
        } else {
            try {
                const response = await sdk.chat.completions.create(body);

                return response;
            } catch (error) {
                const err = error as { status?: number, response?: { status?: number } };
                const statusCode = err.status ?? err.response?.status ?? 500;
                return status(statusCode, {
                    error: {
                        message: (error as Error).message,
                        code: statusCode
                    }
                });
            }
        }
    }, {
        body: z.object({
            model: z.string(),
            messages: z.array(z.any()),
            stream: z.boolean().optional()
        })
    });

export default handler;