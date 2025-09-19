type LogLevel = "INFO" | "WARN" | "ERROR" | "CRITICAL"

// Browser-compatible UUID generation
function generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID()
    }
    // Fallback UUID v4 generation for browsers without crypto.randomUUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

interface TelemetryUser {
    userId?: string | null
    userRole?: "SM" | "DM" | "FM" | "ADMIN" | "COST_ANALYST" | "AI_AGENT" | null
    clientIp?: string | null
}

interface TelemetryEnvelope {
    timestamp: string
    logLevel: LogLevel
    serviceName: string
    correlationId: string
    eventName: string
    user?: TelemetryUser
    payload: Record<string, unknown>
}

interface TelemetryContext {
    level?: LogLevel
    serviceName: string
    correlationId: string
    user?: TelemetryUser
}

// DEV_ANALYTICS flag - only emit telemetry in development
const DEV_ANALYTICS = import.meta.env.DEV || import.meta.env.VITE_DEV_ANALYTICS === 'true'

// Generate or retrieve correlation ID
let globalCorrelationId: string | null = null

export function getCorrelationId(): string {
    if (!globalCorrelationId) {
        globalCorrelationId = generateUUID()
    }
    return globalCorrelationId
}

export function setCorrelationId(id: string): void {
    globalCorrelationId = id
}

/**
 * Emit telemetry event following SupplySync v10 envelope schema
 */
export function emit(
    eventName: string,
    payload: Record<string, unknown>,
    ctx: TelemetryContext
): void {
    if (!DEV_ANALYTICS) {
        return // Skip telemetry emission if not in dev mode
    }

    const envelope: TelemetryEnvelope = {
        timestamp: new Date().toISOString(),
        logLevel: ctx.level ?? "INFO",
        serviceName: ctx.serviceName,
        correlationId: ctx.correlationId,
        eventName,
        user: ctx.user,
        payload
    }

    // Emit to stdout for CloudWatch/Firehose ingestion (as per v10 spec)
    console.log(JSON.stringify(envelope))
}

/**
 * Product Detail Page specific telemetry events
 */
export const pdpTelemetry = {
    viewProduct(data: { productId: string; sku: string; category: string }, user?: TelemetryUser): void {
        emit("ViewProduct", data, {
            serviceName: "web-app",
            correlationId: getCorrelationId(),
            user
        })
    },

    addToCart(data: { productId: string; sku: string; qty: number }, user?: TelemetryUser): void {
        emit("AddToCart", data, {
            serviceName: "web-app",
            correlationId: getCorrelationId(),
            user
        })
    }
}