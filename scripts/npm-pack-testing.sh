#!/usr/bin/env bash
set -e

npm run dist
npm run pack

TMPDIR="/tmp/npm-pack-testing.$$"
mkdir "$TMPDIR"
mv *-*.*.*.tgz "$TMPDIR"
cp tests/fixtures/smoke-testing.ts "$TMPDIR"

cd $TMPDIR
npm init -y
npm install *-*.*.*.tgz \
  @angular/commo \
  @angular/core \
  @auth0/angular-jwt \
  @chatie/graphql \
  @types/node \
  auth-angular \
  auth0-lock \
  auth0-js \
  brolog \
  graphql-tag \
  jwt-decode \
  rxjs \
  state-switch \
  typescript@latest

./node_modules/.bin/tsc \
  --lib esnext,dom \
  --noEmitOnError \
  --noImplicitAny \
  --skipLibCheck \
  smoke-testing.ts

./node_modules/.bin/chatie-graphql-local-stop
./node_modules/.bin/chatie-graphql-local-start

# node --harmony_async_iteration smoke-testing.js
node smoke-testing.js

# (for i in {1..3}; do node smoke-testing.js && break || sleep 1; done)
