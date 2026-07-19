#!/usr/bin/env node
/**
 * Temporary bridge: run the contractgen engine parked in Codegenkit
 * (adapters/nextjs/contractgen) until the kit ships a real contract-gen CLI.
 * See codegenkit/TODO-CONTRACTGEN.md.
 */
import { accessSync, constants } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { resolveCodegenkitRoot } from './lib/resolve-codegenkit.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const argv = process.argv.slice(2)
const registryMode = argv.includes('--registry')
const engineArgs = argv.filter((arg) => arg !== '--registry')

const runner = path.join(
  resolveCodegenkitRoot(),
  'adapters/nextjs/contractgen/runners',
  registryMode ? 'validate-registry.mjs' : 'generate.mjs'
)
accessSync(runner, constants.R_OK)

const result = spawnSync(process.execPath, [runner, ...engineArgs], {
  cwd: repoRoot,
  stdio: 'inherit',
  env: { ...process.env, CODEGENKIT_ROOT: repoRoot },
})

process.exit(result.status ?? 1)
