import * as readPkgUp from 'read-pkg-up'

import { log }   from 'brolog'
log.level(process.env['BROLOG_LEVEL'] as any)

// https://github.com/Microsoft/TypeScript/issues/14151#issuecomment-280812617
; (<any>Symbol).asyncIterator = Symbol.asyncIterator || Symbol.for('Symbol.asyncIterator')

const pkg = readPkgUp.sync({ cwd: __dirname }).pkg
export const VERSION = pkg.version

export {
  log,
}
