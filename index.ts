import Elysia from "elysia";
import getPort from "./misc/GetPort";
import cors from "@elysiajs/cors";
import v1beta from './src/v1beta';
import v2 from "./src/v2";

const PORT = getPort();

new Elysia()
    .use(cors())
    .use(v1beta)
    .use(v2)
    .listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));