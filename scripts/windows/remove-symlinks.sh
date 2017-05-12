#!/usr/bin/env bash

cd `dirname $0`

CORE_SRC_ANIMATION_DIR=./../../packages/core/src/animation
UPGRADE_STATIC_DIR=./../../packages/upgrade/static
rm ${CORE_SRC_ANIMATION_DIR}/dsl.ts
rm ${UPGRADE_STATIC_DIR}/src
mv ${CORE_SRC_ANIMATION_DIR}/dsl.ts.old ${CORE_SRC_ANIMATION_DIR}/dsl.ts
mv ${UPGRADE_STATIC_DIR}/src.old ${UPGRADE_STATIC_DIR}/src
