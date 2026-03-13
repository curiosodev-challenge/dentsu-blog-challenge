#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DEFAULT_API_BASE_URL = 'https://tech-test-backend.dwsbrazil.io'
const ENV_KEY = 'VITE_API_BASE_URL'

const projectRoot = process.cwd()
const envLocalPath = join(projectRoot, '.env.local')
const envOverridePath = join(projectRoot, '.env.override')
const nodeModulesPath = join(projectRoot, 'node_modules')
const lockfilePath = join(projectRoot, 'package-lock.json')

const args = new Set(process.argv.slice(2))
const shouldSkipInstall = args.has('--skip-install')
const shouldSkipDev = args.has('--skip-dev')
const forceInstall = args.has('--force-install')

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function log(message) {
  console.log(`[bootstrap] ${message}`)
}

function readFileOrNull(filePath) {
  if (!existsSync(filePath)) {
    return null
  }

  return readFileSync(filePath, 'utf8')
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getEnvValue(content, key) {
  const pattern = new RegExp(`^\\s*${escapeRegex(key)}\\s*=\\s*(.*)\\s*$`, 'm')
  const match = content.match(pattern)

  if (!match) {
    return null
  }

  return match[1].trim().replace(/^['"]|['"]$/g, '')
}

function setEnvValue(content, key, value) {
  const line = `${key}=${value}`
  const pattern = new RegExp(`^\\s*${escapeRegex(key)}\\s*=.*$`, 'm')

  if (pattern.test(content)) {
    return content.replace(pattern, line)
  }

  if (!content) {
    return `${line}\n`
  }

  const needsTrailingNewline = !content.endsWith('\n')
  return `${content}${needsTrailingNewline ? '\n' : ''}${line}\n`
}

function runBlocking(command, commandArgs) {
  const result = spawnSync(command, commandArgs, {
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

function ensureEnvOverride() {
  const existingContent = readFileOrNull(envOverridePath)

  if (existingContent === null) {
    const initialContent = `${ENV_KEY}=${DEFAULT_API_BASE_URL}\n`
    writeFileSync(envOverridePath, initialContent, 'utf8')
    log('Created .env.override with the default API base URL.')
    return DEFAULT_API_BASE_URL
  }

  const currentValue = getEnvValue(existingContent, ENV_KEY)
  if (currentValue) {
    log('Using existing .env.override configuration.')
    return currentValue
  }

  const updatedContent = setEnvValue(existingContent, ENV_KEY, DEFAULT_API_BASE_URL)
  writeFileSync(envOverridePath, updatedContent, 'utf8')
  log('Added missing VITE_API_BASE_URL to .env.override.')
  return DEFAULT_API_BASE_URL
}

function ensureEnvLocalFile(fallbackValue) {
  const existingContent = readFileOrNull(envLocalPath)

  if (existingContent === null) {
    writeFileSync(envLocalPath, `${ENV_KEY}=${fallbackValue}\n`, 'utf8')
    log('Created .env.local from .env.override settings.')
    return
  }

  const currentValue = getEnvValue(existingContent, ENV_KEY)
  if (currentValue) {
    log('Keeping existing VITE_API_BASE_URL value from .env.local.')
    return
  }

  const updatedContent = setEnvValue(existingContent, ENV_KEY, fallbackValue)
  writeFileSync(envLocalPath, updatedContent, 'utf8')
  log('Updated empty/missing VITE_API_BASE_URL in .env.local using .env.override.')
}

function installDependenciesIfNeeded() {
  if (shouldSkipInstall) {
    log('Skipping dependency installation (--skip-install).')
    return
  }

  if (!forceInstall && existsSync(nodeModulesPath)) {
    log('node_modules already exists. Skipping install. Use --force-install to reinstall.')
    return
  }

  if (existsSync(lockfilePath)) {
    log('Installing dependencies with npm ci...')
    runBlocking(npmCmd, ['ci'])
    return
  }

  log('Installing dependencies with npm install...')
  runBlocking(npmCmd, ['install'])
}

function startDevServer() {
  if (shouldSkipDev) {
    log('Skipping development server startup (--skip-dev).')
    return
  }

  log('Starting development server...')
  const child = spawn(npmCmd, ['run', 'dev'], { stdio: 'inherit' })

  const forwardSignal = (signal) => {
    if (!child.killed) {
      child.kill(signal)
    }
  }

  process.on('SIGINT', () => forwardSignal('SIGINT'))
  process.on('SIGTERM', () => forwardSignal('SIGTERM'))

  child.on('close', (code) => {
    process.exit(code ?? 0)
  })
}

installDependenciesIfNeeded()
const apiBaseUrl = ensureEnvOverride()
ensureEnvLocalFile(apiBaseUrl)
startDevServer()
