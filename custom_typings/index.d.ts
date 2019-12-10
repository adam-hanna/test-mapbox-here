declare module 'oauth-sign' {
    export function hmacsign256 (httpMethod: string, base_uri: string, params: any, consumer_secret?: string, token_secret?: string)
}

