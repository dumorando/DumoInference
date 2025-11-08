import Elysia from "elysia";
import { GetModels } from "../misc/GetModels";

export default new Elysia({ prefix: '/v2' })
    .get('/models', async () => {
        return await GetModels();
    });