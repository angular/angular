#!/bin/bash

git diff --name-only upstream/master packages/ | grep \.ts$ | grep -v \.d\.ts$ | while read file
do
  if [ -f $file ]
  then
    node_modules/.bin/clang-format -i $file
  fi
done
