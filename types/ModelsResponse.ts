export interface DumoInferenceModel {
    id: string,
    friendlyName: string,
    created: number,
    description: {
        aiGenerated: boolean,
        text: string
    },
    inputModalities: Array<'text' | 'image' | 'audio' | 'video'>,
    outputModalities: Array<'text' | 'image'>,
    supportsTools: boolean,
    supportedParameters: Array<string>
}