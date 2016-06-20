#!/usr/bin/env bash

cd `dirname $0`

while read PACKAGE
do
  DESTDIR=./../../modules/\@angular/${PACKAGE}/src
  rm ${DESTDIR}/facade
  mv ${DESTDIR}/facade.old ${DESTDIR}/facade
done < packages.txt
