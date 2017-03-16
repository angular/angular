#!/usr/bin/env bash

cd `dirname $0`

DESTDIR=./../../packages/core/src/animation
rm ${DESTDIR}/dsl.ts
mv ${DESTDIR}/dsl.ts.old ${DESTDIR}/dsl.ts
