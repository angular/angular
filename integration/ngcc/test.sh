#!/bin/bash

set -x

PATH=$PATH:$(npm bin)

ivy-ngcc node_modules/@angular/common
cp -r node_modules_ngtsc/* node_modules/
ngc -p tsconfig-app.json

