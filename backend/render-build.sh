#!/usr/bin/env bash
set -o errexit

# install deps (all, not just prod)
npm install

# generate prisma client
npx prisma generate

# build typescript
npm run build
