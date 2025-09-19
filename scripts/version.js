#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read version from VERSION file
const versionPath = path.join(__dirname, '..', 'VERSION')
let version = 'dev'

try {
    if (fs.existsSync(versionPath)) {
        version = fs.readFileSync(versionPath, 'utf8').trim()
    }
} catch (error) {
    console.warn('Could not read VERSION file, using "dev"')
}

// Update .env file
const envPath = path.join(__dirname, '..', '.env')
let envContent = ''

try {
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8')
    }
} catch (error) {
    // .env doesn't exist, will create new
}

// Remove existing APP_VERSION line and add new one
const envLines = envContent.split('\n').filter(line => !line.startsWith('APP_VERSION='))
envLines.push(`APP_VERSION=${version}`)

// Write updated .env
fs.writeFileSync(envPath, envLines.join('\n'))

console.log(`✅ Injected APP_VERSION=${version} into .env`)