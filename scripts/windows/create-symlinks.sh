#!/usr/bin/env bash

cd `dirname $0`

CORE_SRC_ANIMATION_DIR=./../../packages/core/src/animation
UPGRADE_STATIC_DIR=./../../packages/upgrade/static

mv ${CORE_SRC_ANIMATION_DIR}/dsl.ts ${CORE_SRC_ANIMATION_DIR}/dsl.ts.old
mv ${UPGRADE_STATIC_DIR}/src ${UPGRADE_STATIC_DIR}/src.old

#make sure that the target locations exist
mkdir -p $CORE_SRC_ANIMATION_DIR
mkdir -p $UPGRADE_STATIC_DIR

pushd .
cd $CORE_SRC_ANIMATION_DIR
cmd <<< "mklink dsl.ts \"..\\..\\..\\animations\\src\\animation_metadata.ts\""

popd
cd $UPGRADE_STATIC_DIR
cmd <<< "mklink /d \"src\" \"..\\src\""
