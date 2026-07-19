#!/usr/bin/env node
/**
 * Resolve Codegenkit package root for FE helper imports (lifecycle / remove).
 * Engines live in the toolkit — not under this repo's codegen/.
 */
import { accessSync, constants } from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

export function resolveCodegenkitRoot() {
  if (process.env.CODEGENKIT_PACKAGE_ROOT) {
    return path.resolve(process.env.CODEGENKIT_PACKAGE_ROOT)
  }

  try {
    return path.dirname(require.resolve('@platform/codegenkit/package.json'))
  } catch {
    // not linked into this package
  }

  const candidates = [
    path.resolve(repoRoot, '../codegenkit'),
    path.join(os.homedir(), '.platform-dna/packages/codegenkit'),
  ]

  for (const candidate of candidates) {
    try {
      accessSync(path.join(candidate, 'package.json'), constants.R_OK)
      return candidate
    } catch {
      // try next
    }
  }

  throw new Error(
    'Codegenkit package not found. Install via platform-dna, set CODEGENKIT_PACKAGE_ROOT, or place a sibling ../codegenkit checkout.'
  )
}

/** Absolute file URL for adapters/nextjs/codegen/runners/lib/<file> */
export function nextjsCodegenLibUrl(file) {
  const full = path.join(
    resolveCodegenkitRoot(),
    'adapters/nextjs/codegen/runners/lib',
    file
  )
  accessSync(full, constants.R_OK)
  return pathToFileURL(full).href
}
