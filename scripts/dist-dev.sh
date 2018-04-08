#!/usr/bin/env bash
set -e

npm run lint
npm run ng:packagr

cp -Ra dist/* ../app/node_modules/@chatie/db/
