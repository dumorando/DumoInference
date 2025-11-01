import Elysia from "elysia";
import GetModels from "./misc/GetModels";
import ChatCompletions from "./misc/ChatCompletions";
import getPort from "./misc/GetPort";
import cors from "@elysiajs/cors";

const PORT = getPort();

new Elysia()
    .use(cors())
    .get('/v1beta/models', async () => {
        return await GetModels();
    })
    .use(ChatCompletions)
    .listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));