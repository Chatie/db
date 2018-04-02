export { log }   from 'brolog'

// https://github.com/Microsoft/TypeScript/issues/14151#issuecomment-280812617
if (!(<any>Symbol).asyncIterator) {
  (<any>Symbol).asyncIterator = Symbol.for('Symbol.asyncIterator')
}

/**
 * export VRESION
 */
export const VERSION = myVersion()

/**
 * Helper Functions
 */
function myVersion(): string {
  let pkg: {
    version: string,
  } | undefined

  const MAX_DEPTH = 3
  for (let n = 0; n < MAX_DEPTH; n++) {
    if (pkg) {
      return pkg.version || 'unknown'
    }
    const pkgFile = '../'.repeat(n) + './package.json'

    try {
      pkg = require(pkgFile)
    } catch (e) { /* fail safe */ }
  }
  return 'not found'
}
