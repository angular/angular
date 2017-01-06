#!/usr/bin/env bash

cd `dirname $0`

while read RAW_PACKAGE || [[ -n "$RAW_PACKAGE" ]]
do
  PACKAGE=${RAW_PACKAGE%$'\r'}
  DESTDIR=./../../modules/\@angular/${PACKAGE}
  rm ${DESTDIR}/facade
  mv ${DESTDIR}/facade.old ${DESTDIR}/facade
done < packages.txt
