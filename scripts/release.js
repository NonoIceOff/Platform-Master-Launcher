'use strict'

const { spawnSync } = require('node:child_process')
const { readFileSync } = require('node:fs')
const path = require('node:path')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const bump = process.argv[2]
const VALID = ['patch', 'minor', 'major']

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', windowsHide: true, ...opts })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

function gitOutput(args) {
  const result = spawnSync('git', args, { encoding: 'utf8', windowsHide: true })
  if (result.status !== 0) process.exit(result.status ?? 1)
  return result.stdout.trim()
}

function isGitDirty() {
  const result = spawnSync('git', ['status', '--porcelain'], { encoding: 'utf8', windowsHide: true })
  return result.stdout.trim().length > 0
}

if (!VALID.includes(bump)) {
  console.error(`\nUsage: npm run release -- ${VALID.join('|')}\n`)
  console.error('Exemples:')
  console.error('  npm run release -- patch   → 1.0.4 → 1.0.5')
  console.error('  npm run release -- minor   → 1.0.4 → 1.1.0')
  console.error('  npm run release -- major   → 1.0.4 → 2.0.0\n')
  process.exit(1)
}

if (!process.env.GH_TOKEN) {
  console.error('\n❌ GH_TOKEN manquant.')
  console.error('Crée un token GitHub (permission repo) et ajoute-le dans .env :')
  console.error('  GH_TOKEN=ghp_xxxxxxxx\n')
  process.exit(1)
}

if (isGitDirty()) {
  console.log('📦 Commit des changements en cours...')
  run('git', ['add', '-A'])
  run('git', ['commit', '-m', 'chore: prepare release'])
}

console.log(`\n🔢 Incrément ${bump}...`)
run(npmCmd, ['version', bump, '-m', 'Release v%s'])

const pkg = JSON.parse(readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'))
const version = pkg.version
const branch = gitOutput(['rev-parse', '--abbrev-ref', 'HEAD'])

console.log(`\n🏗️  Build + publication GitHub v${version}...`)
run(npmCmd, ['run', 'build:win', '--', '--publish', 'always'], {
  env: { ...process.env, GH_TOKEN: process.env.GH_TOKEN }
})

console.log('\n🚀 Push git + tag...')
run('git', ['push', 'origin', branch])
run('git', ['push', 'origin', `v${version}`])

console.log(`\n✅ Release v${version} publiée !`)
console.log(`   https://github.com/NonoIceOff/Platform-Master-Launcher/releases/tag/v${version}\n`)
