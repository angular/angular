#!/usr/bin/env bash

cd `dirname $0`

while read PACKAGE
do
  DESTDIR=./../../modules/\@angular/${PACKAGE}/src
  mv ${DESTDIR}/facade ${DESTDIR}/facade.old
  cmd <<< "mklink \"..\\..\\modules\\\@angular\\"${PACKAGE}"\\src\\facade\" \"..\\..\\facade\\src\\\""
done < packages.txt
