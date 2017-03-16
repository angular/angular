#!/usr/bin/env bash

cd `dirname $0`

DESTDIR=./../../packages/core/src/animation
mv ${DESTDIR}/dsl.ts ${DESTDIR}/dsl.ts.old
cmd <<< "mklink \"..\\..\\packages\\core\\src\\animation\\dsl.ts\" \"..\\..\\..\\animations\\src\\animation_metadata.ts\""
