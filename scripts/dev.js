import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const frontend = spawn('npm', ['run', 'dev:frontend'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: false,
})

const backend = spawn('npm', ['--prefix', 'server', 'run', 'start'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: false,
})

const stopAll = () => {
  frontend.kill('SIGTERM')
  backend.kill('SIGTERM')
}

frontend.on('exit', (code) => {
  if (code !== 0) {
    stopAll()
    process.exit(code ?? 1)
  }
})

backend.on('exit', (code) => {
  if (code !== 0) {
    stopAll()
    process.exit(code ?? 1)
  }
})

process.on('SIGINT', () => {
  stopAll()
  process.exit(0)
})

process.on('SIGTERM', () => {
  stopAll()
  process.exit(0)
})
