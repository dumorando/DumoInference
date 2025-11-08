import Elysia from "elysia";
import { GetModelsOpenAI } from "../misc/GetModels";
import ChatCompletions from "../misc/ChatCompletions";

export default new Elysia({ prefix: '/v1beta' })
    .get('/v1beta/models', async () => {
        return await GetModelsOpenAI();
    })
    .use(ChatCompletions);