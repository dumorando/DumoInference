export interface PollinationsModelsResponse {
    name: string,
    description: string,
    maxInputChars: number,
    voices?: Array<string>,
    tier: string,
    community: boolean,
    input_modalities: Array<'text' | 'image' | 'audio'>,
    output_modalities: Array<'text' | 'image'>,
    tools: boolean,
    aliases: Array<string>,
    vision: boolean,
    audio: boolean
}