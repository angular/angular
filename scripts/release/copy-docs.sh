#!/bin/bash

# Copy docs to material docs site

# Run this script after `gulp docs`
# Need to specify destination folder
# Use OVERVIEW.html when possible. If there's no OVERVIEW file exists, use README.html

usage='Usage: copy-docs.sh $destinationFolder'
if [ $# -ne 1 ]; then
  echo "Missing destination folder. $usage"
  exit
fi

originFolder=./dist/docs/
destFolder=$1

if [ ! -w $destFolder ]; then
  echo "Invalid destination folder. $usage"
  exit
fi

for file in $originFolder*
do
  name=${file#$originFolder}
  overviewFile=$originFolder$name/$name.html
  readmeFile=$originFolder$name/README.html
  destFile=$destFolder/$name.html
  if [ -f $overviewFile ]; then
    cp $overviewFile $destFile
    echo "Copied $overviewFile to $destFile"
  elif [ -f $readmeFile ]; then
    cp $readmeFile $destFile
    echo "Copied $readmeFile to $destFile"
  fi
done
