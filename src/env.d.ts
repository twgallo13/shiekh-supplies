/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DEV_ANALYTICS?: string
    readonly VITE_APP_VERSION?: string
    readonly DEV?: boolean
    readonly PROD?: boolean
    readonly MODE?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}