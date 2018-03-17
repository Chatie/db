#!/usr/bin/env ts-node
import * as dotenv from 'dotenv'
dotenv.config()

import { spawn }  from 'child_process'
import * as path  from 'path'

import * as glob  from 'glob'
import {
  ENDPOINTS,
}               from '@chatie/graphql'

import {
  log,
}               from '../src/config'

const GENERATED_SCHEMAS_DIR = 'generated-schemas/'
const JSON_SCHEMA_FILE  = path.join(GENERATED_SCHEMAS_DIR, 'downloaded-schema.json')

async function main() {
  log.verbose('GenerateSchema', 'main()')

  const simpleEndpoint = ENDPOINTS.simple
  log.silly('GenerateSchema', 'main() simple endpoint: %s', simpleEndpoint)

  await introspectSchema(simpleEndpoint, JSON_SCHEMA_FILE)
  console.log(`${JSON_SCHEMA_FILE} generated`)

  glob('src/**/*-store.graphql.ts', (err, matches) => {
    // src/hostie-store.graphql.ts
    // ->
    // src/hostie-schema.ts
    if (err) {
      throw err
    }
    matches.forEach(async match => {
      const schemaFile = match
                          .replace('-store.graphql.ts', '-schema.ts')
                          .replace(/^src\/[^\/]+\//, GENERATED_SCHEMAS_DIR)
      await generate(JSON_SCHEMA_FILE, match, schemaFile)
      console.log(`${match} => ${schemaFile} generated`)
    })
  })
}

async function introspectSchema(
  endpoint:       string,
  jsonSchemaFile: string,
) {
  log.verbose('GenerateSchema', 'introspectSchema(endpoint=%s, jsonSchemaFile=%s)',
                                endpoint,
                                jsonSchemaFile,
              )
  // introspect GitHub API and save the result to `schema.json`
  const child = spawn('apollo-codegen', [
    'introspect-schema',
    endpoint,
    '--output',
    jsonSchemaFile,
    '--header',
    'Authorization: bearer ' + process.env.GRAPHCOOL_ROOT_TOKEN,
  ], {
    stdio: 'inherit',
  })
  // child.stderr.pipe(process.stderr)
  await new Promise((resolve, reject) =>
    child.once(
      'exit',
      code => code === 0 ? resolve() : reject(code),
    ),
  )
}

async function generate(
  jsonSchemaFile: string,
  tsGqlFile:      string,
  tsSchemaFile:   string,
) {
  log.verbose('GenerateSchema', 'generate(jsonSchemaFile: %s, tsSchemaFile: %s)',
                                jsonSchemaFile,
                                tsSchemaFile,
              )
  // inpsect actual queries in `index.ts` and generate TypeScript types in `schema.ts`
  const child = spawn('apollo-codegen', [
    'generate',
    tsGqlFile,
    '--schema',
    jsonSchemaFile,
    '--target',
    'typescript',
    '--tag-name',
    'gql',
    '--output',
    tsSchemaFile,
    '--add-typename',
  ], {
    stdio: 'inherit',
  })
  // child.stderr.pipe(process.stderr)
  await new Promise((resolve, reject) =>
    child.once(
      'exit',
      code => code === 0 ? resolve() : reject(code),
    ),
  )
}

main()
.then(() => log.verbose('GenerateSchema', 'SUCCEED!'))
.catch(e => {
  log.error('GenerateSchema', 'ERROR: %s', e)
  process.exit(1)
})
