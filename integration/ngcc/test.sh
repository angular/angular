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

# Did it replace the PRE_R3 markers correctly?
  grep "= SWITCH_COMPILE_COMPONENT__POST_R3__" node_modules/@angular/core/fesm2015/core.js
  if [[ $? != 0 ]]; then exit 1; fi
  grep "= SWITCH_COMPILE_COMPONENT__POST_R3__" node_modules/@angular/core/fesm5/core.js
  if [[ $? != 0 ]]; then exit 1; fi

# Did it compile @angular/core/ApplicationModule correctly?
  grep "ApplicationModule.ngModuleDef = defineNgModule" node_modules/@angular/core/fesm2015/core.js
  if [[ $? != 0 ]]; then exit 1; fi
  grep "ApplicationModule.ngModuleDef = defineNgModule" node_modules/@angular/core/fesm5/core.js
  if [[ $? != 0 ]]; then exit 1; fi
  grep "ApplicationModule.ngModuleDef = ɵngcc0.defineNgModule" node_modules/@angular/core/esm2015/src/application_module.js
  if [[ $? != 0 ]]; then exit 1; fi
  grep "ApplicationModule.ngModuleDef = ɵngcc0.defineNgModule" node_modules/@angular/core/esm5/src/application_module.js
  if [[ $? != 0 ]]; then exit 1; fi

# Did it transform @angular/core typing files correctly?
  grep "import [*] as ɵngcc0 from './r3_symbols';" node_modules/@angular/core/src/application_module.d.ts
  if [[ $? != 0 ]]; then exit 1; fi
  grep "static ngInjectorDef: ɵngcc0.InjectorDef<ApplicationModule>;" node_modules/@angular/core/src/application_module.d.ts
  if [[ $? != 0 ]]; then exit 1; fi

# Did it generate a base factory call for synthesized constructors correctly?
  grep "const ɵMatTable_BaseFactory = ɵngcc0.ɵgetInheritedFactory(MatTable);" node_modules/@angular/material/esm2015/table.js
  if [[ $? != 0 ]]; then exit 1; fi
  grep "const ɵMatTable_BaseFactory = ɵngcc0.ɵgetInheritedFactory(MatTable);" node_modules/@angular/material/esm5/table.es5.js
  if [[ $? != 0 ]]; then exit 1; fi

# Can it be safely run again (as a noop)?
ivy-ngcc

# Now try compiling the app using the ngcc compiled libraries
ngc -p tsconfig-app.json

# Did it compile the main.ts correctly (including the ngIf and MatButton directives)?
  grep "directives: \[.*\.NgIf.*\]" dist/src/main.js
  if [[ $? != 0 ]]; then exit 1; fi
  grep "directives: \[.*\.MatButton.*\]" dist/src/main.js
  if [[ $? != 0 ]]; then exit 1; fi
