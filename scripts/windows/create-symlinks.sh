#!/usr/bin/env bash

cd `dirname $0`

UPGRADE_STATIC_DIR=./../../packages/upgrade/static
mv ${UPGRADE_STATIC_DIR}/src ${UPGRADE_STATIC_DIR}/src.old
cmd <<< "mklink /d \"..\\..\\packages\\upgrade\\static\\src\" \"..\\src\""
