export { log }   from 'brolog'

// https://github.com/Microsoft/TypeScript/issues/14151#issuecomment-280812617
if (!(<any>Symbol).asyncIterator) {
  (<any>Symbol).asyncIterator = Symbol.for('Symbol.asyncIterator')
}

/**
 * export VRESION
 */
export const VERSION = require('../package.json').version

/**
 * Auth0 idToken Schema
 */
export interface GraphCoolIdToken {
  'https://graph.cool/token'?: string,
}
