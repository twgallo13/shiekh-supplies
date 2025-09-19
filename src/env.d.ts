/// <reference types="vite/client" />

// Extend the variables we actually read in the app
interface ImportMetaEnv {
    readonly VITE_APP_ENV?: string
    readonly VITE_TELEMETRY?: 'on' | 'off' | string
    readonly VITE_POSTHOG_KEY?: string
    readonly VITE_POSTHOG_HOST?: string
    readonly VITE_DEV_ANALYTICS?: string
    readonly VITE_APP_VERSION?: string
    readonly DEV?: boolean
    readonly PROD?: boolean
    readonly MODE?: string
    // add more VITE_* here if telemetry.ts or others need them
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}