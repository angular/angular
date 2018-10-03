#!/bin/bash

set -e -x

PATH=$PATH:$(npm bin)

ivy-ngcc --help

# node --inspect-brk $(npm bin)/ivy-ngcc -f esm2015
ivy-ngcc

# Did it add the appropriate build markers?
  # - fesm2015
  ls node_modules/@angular/common | grep __modified_by_ngcc_for_fesm2015
  if [[ $? != 0 ]]; then exit 1; fi
  # - esm2015
  ls node_modules/@angular/common | grep __modified_by_ngcc_for_esm2015
  if [[ $? != 0 ]]; then exit 1; fi

# Did it replace the NGCC_PRE markers correctly?
  grep "= R3_COMPILE_COMPONENT__POST_NGCC__" node_modules/@angular/core/fesm2015/core.js
  if [[ $? != 0 ]]; then exit 1; fi
  grep "= R3_COMPILE_COMPONENT__POST_NGCC__" node_modules/@angular/core/fesm5/core.js
  if [[ $? != 0 ]]; then exit 1; fi

# Did it compile @angular/core/ApplicationModule correctly?
  grep "ApplicationModule.ngModuleDef = ɵdefineNgModule" node_modules/@angular/core/fesm2015/core.js
  if [[ $? != 0 ]]; then exit 1; fi
  grep "ApplicationModule.ngModuleDef = ɵdefineNgModule" node_modules/@angular/core/fesm5/core.js
  if [[ $? != 0 ]]; then exit 1; fi
  grep "ApplicationModule.ngModuleDef = ɵngcc0.ɵdefineNgModule" node_modules/@angular/core/esm2015/src/application_module.js
  if [[ $? != 0 ]]; then exit 1; fi
  grep "ApplicationModule.ngModuleDef = ɵngcc0.ɵdefineNgModule" node_modules/@angular/core/esm5/src/application_module.js
  if [[ $? != 0 ]]; then exit 1; fi

# Can it be safely run again (as a noop)?
ivy-ngcc

# Now try compiling the app using the ngcc compiled libraries
ngc -p tsconfig-app.json

# Did it compile the main.ts correctly?
  grep "directives: \[\S*\.NgIf\]" dist/src/main.js
  if [[ $? != 0 ]]; then exit 1; fi
