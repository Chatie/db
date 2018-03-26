#!/usr/bin/env bash
set -e

npm run dist
cp -Rav dist/* ../app/node_modules/\@chatie/db/dist/

echo
echo #################
echo OVERWRIT SUCCEED!
echo #################
echo
