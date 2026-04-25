import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load the service .env when tests run from the monorepo root
const envPath = resolve(__dirname, '../.env')
const lines = readFileSync(envPath, 'utf-8').split('\n')

for (const line of lines) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eq = trimmed.indexOf('=')
  if (eq === -1) continue
  const key = trimmed.slice(0, eq).trim()
  const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
  if (!(key in process.env)) process.env[key] = value
}
