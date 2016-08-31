#!/usr/bin/env bash

cd `dirname $0`

while read RAW_PACKAGE
do
  PACKAGE=${RAW_PACKAGE: : -1}
  DESTDIR=./../../modules/\@angular/${PACKAGE}
  mv ${DESTDIR}/facade ${DESTDIR}/facade.old
  cmd <<< "mklink \"..\\..\\modules\\\@angular\\"${PACKAGE}"\\facade\" \"..\\..\\facade\\src\\\""
done < packages.txt
