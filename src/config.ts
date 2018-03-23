import { log }   from 'brolog'
if (process) {
  log.level(process.env['BROLOG_LEVEL'] as any)
}

// https://github.com/Microsoft/TypeScript/issues/14151#issuecomment-280812617
if (!(<any>Symbol).asyncIterator) {
  ; (<any>Symbol).asyncIterator = Symbol.for('Symbol.asyncIterator')
}

let pkg: {
  version: string,
} | undefined

try {
  pkg = require('../package.json')
} catch (e) {
  //
}

if (!pkg) {
  try {
    pkg = require('../../package.json')
  } catch (e) {
    //
  }
}

export const VERSION = pkg ? pkg.version : 'unknown'

export {
  log,
}
