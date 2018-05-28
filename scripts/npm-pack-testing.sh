#!/usr/bin/env bash
set -e


npm run dist
npm pack

TMPDIR="/tmp/npm-pack-testing.$$"
mkdir "$TMPDIR"
mv *-*.*.*.tgz "$TMPDIR"
cp tests/fixtures/smoke-testing.ts "$TMPDIR"

cd $TMPDIR
npm init -y
npm install *-*.*.*.tgz \
  @angular/core \
  @types/node \
  auth-angular \
  brolog \
  rxjs \
  state-switch \
  typescript@latest

./node_modules/.bin/tsc \
  --lib esnext,dom \
  --noEmitOnError \
  --noImplicitAny \
  --skipLibCheck \
  smoke-testing.ts

./node_modules/.bin/chatie-graphql-local-restart
node --harmony_async_iteration smoke-testing.js

# (for i in {1..3}; do node smoke-testing.js && break || sleep 1; done)
