#!/usr/bin/env bash

cd `dirname $0`

UPGRADE_STATIC_DIR=./../../packages/upgrade/static
rm ${UPGRADE_STATIC_DIR}/src
mv ${UPGRADE_STATIC_DIR}/src.old ${UPGRADE_STATIC_DIR}/src
