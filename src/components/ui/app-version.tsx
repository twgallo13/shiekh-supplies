import * as React from "react"

interface AppVersionProps {
    className?: string
}

export function AppVersion({ className = "" }: AppVersionProps) {
    const version = process.env.APP_VERSION || "dev"

    return (
        <div className={`fixed bottom-4 right-4 text-xs opacity-60 pointer-events-none select-none ${className}`}>
            v{version}
        </div>
    )
}