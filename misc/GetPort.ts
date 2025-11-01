import fs from 'fs';

function getPort(): number {
    if (fs.existsSync('_dumointernal.json')) {
        const settings = JSON.parse(fs.readFileSync('_dumointernal.json', 'utf8'));
        if (settings.port) {
            return settings.port;
        } else {
            return 8080;
        }
    } else {
        return 8080;
    }
}

export default getPort;