/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_ENV: string
    readonly VITE_API_BASE?: string
    readonly VITE_TELEMETRY?: 'on' | 'off' | string
    readonly VITE_POSTHOG_KEY?: string
    readonly VITE_POSTHOG_HOST?: string
    readonly VITE_ENABLE_MOCKS?: 'true' | 'false' | string
}
interface ImportMeta { readonly env: ImportMetaEnv }