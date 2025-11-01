import Elysia from "elysia";
import GetModels from "./misc/GetModels";
import ChatCompletions from "./misc/ChatCompletions";

new Elysia()
    .get('/v1beta/models', async () => {
        return await GetModels();
    })
    .use(ChatCompletions)
    .listen(8080, () => console.log(`listening on http://localhost:8080`));