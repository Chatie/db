#!/usr/bin/env bash
set -e

npm run lint
npm run ng:packagr

#rm -fr @chatie/db/node_modules

cp -Rav @chatie/db/* ../app/node_modules/@chatie/db/
