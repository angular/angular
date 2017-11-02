#!/usr/bin/env bash

cd `dirname $0`

CORE_SRC_ANIMATION_DIR=./../../packages/core/src/animation
UPGRADE_STATIC_DIR=./../../packages/upgrade/static
mv ${CORE_SRC_ANIMATION_DIR}/dsl.ts ${CORE_SRC_ANIMATION_DIR}/dsl.ts.old
mv ${UPGRADE_STATIC_DIR}/src ${UPGRADE_STATIC_DIR}/src.old
cmd <<< "mklink \"..\\..\\packages\\core\\src\\animation\\dsl.ts\" \"..\\..\\..\\animations\\src\\animation_metadata.ts\""
cmd <<< "mklink /d \"..\\..\\packages\\upgrade\\static\\src\" \"..\\src\""
