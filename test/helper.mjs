import { exec as ex } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

let __dirname = path.dirname(fileURLToPath(import.meta.url))
var BUNYAN = path.resolve(__dirname, '../bin/bunyan.mjs');

export function exec(parameter, prefix = 'node', bunnyboy = BUNYAN) {
  let command = `${prefix} ${bunnyboy} ${parameter}`
  return new Promise(function(res, rej) {
    ex(command,
      function (err, stdout, stderr) {
        if (err) {
          err.stdout = stdout
          err.stderr = stderr
          return rej(err)
        }
        res({
          stdout,
          stderr,
        })
      }
    )
  })
}

export function dirname(file) {
  return path.resolve(__dirname + file)
}
