#!/bin/bash

# Do not immediately exit on error to allow the `assertSucceeded` function to handle the error.
#
# NOTE:
# Each statement should be followed by an `assert*` or `exit 1` statement.
set +e -x

function assertFailed {
  if [[ $? -eq 0 ]]; then
    echo "FAIL: $1";
    exit 1;
  fi
}

function assertSucceeded {
  if [[ $? -ne 0 ]]; then
    echo "FAIL: $1";
    exit 1;
  fi
}

function assertEquals {
  local value1=$1;
  local value2=$2;

  if [[ "$value1" != "$value2" ]]; then
    echo "FAIL: Expected '$value1' to equal '$value2'."
    exit 1;
  fi
}

function assertNotEquals {
  local value1=$1;
  local value2=$2;

  if [[ "$value1" == "$value2" ]]; then
    echo "FAIL: Expected '$value1' not to equal '$value2'."
    exit 1;
  fi
}

ngcc --help
assertSucceeded "Expected 'ngcc --help' to succeed."

ngcc --unknown-option 2>&1 | grep 'Unknown arguments: unknown-option, unknownOption'
assertSucceeded "Expected ngcc to report bad option."

# node --inspect-brk $(npm bin)/ngcc -f esm2015
# Run ngcc and check it logged compilation output as expected
ngcc | grep 'Compiling'
assertSucceeded "Expected 'ngcc' to log 'Compiling'."


# Did it add the appropriate build markers?

  # - esm2015
  cat node_modules/@angular/common/package.json | awk 'ORS=" "' | grep '"__processed_by_ivy_ngcc__":[^}]*"esm2015": "'
  assertSucceeded "Expected 'ngcc' to add build marker for 'esm2015' in '@angular/common'."

  # - fesm2015
  cat node_modules/@angular/common/package.json | awk 'ORS=" "' | grep '"__processed_by_ivy_ngcc__":[^}]*"fesm2015": "'
  assertSucceeded "Expected 'ngcc' to add build marker for 'fesm2015' in '@angular/common'."

  # `es2015` is an alias of `fesm2015`.
  cat node_modules/@angular/common/package.json | awk 'ORS=" "' | grep '"__processed_by_ivy_ngcc__":[^}]*"es2015": "'
  assertSucceeded "Expected 'ngcc' to add build marker for 'es2015' in '@angular/common'."

  # `module` is an alias of `fesm2015`
  cat node_modules/@angular/common/package.json | awk 'ORS=" "' | grep '"__processed_by_ivy_ngcc__":[^}]*"module": "'
  assertSucceeded "Expected 'ngcc' to add build marker for 'module' in '@angular/common'."

# Did it replace the PRE_R3 markers correctly?
  grep "= SWITCH_COMPILE_COMPONENT__POST_R3__" node_modules/@angular/core/fesm2015/core.js
  assertSucceeded "Expected 'ngcc' to replace 'SWITCH_COMPILE_COMPONENT__PRE_R3__' in '@angular/core' (fesm2015)."

  grep "= SWITCH_COMPILE_COMPONENT__POST_R3__" node_modules/@angular/core/bundles/core.umd.js
  assertSucceeded "Expected 'ngcc' to replace 'SWITCH_COMPILE_COMPONENT__PRE_R3__' in '@angular/core' (main)."


# Did it compile @angular/core/ApplicationModule correctly?
  grep "ApplicationModule.ɵmod = /\*@__PURE__\*/ ɵɵdefineNgModule" node_modules/@angular/core/fesm2015/core.js
  assertSucceeded "Expected 'ngcc' to correctly compile 'ApplicationModule' in '@angular/core' (fesm2015)."

  grep "ApplicationModule.ɵmod = /\*@__PURE__\*/ ɵɵdefineNgModule" node_modules/@angular/core/bundles/core.umd.js
  assertSucceeded "Expected 'ngcc' to correctly compile 'ApplicationModule' in '@angular/core' (main)."

  grep "ApplicationModule.ɵmod = /\*@__PURE__\*/ ɵngcc0.ɵɵdefineNgModule" node_modules/@angular/core/esm2015/src/application_module.js
  assertSucceeded "Expected 'ngcc' to correctly compile 'ApplicationModule' in '@angular/core' (esm2015)."

# Did it place the `setClassMetadata` call correctly?
  cat node_modules/@angular/core/fesm2015/core.js | awk 'ORS=" "' | grep "ApplicationRef.ctorParameters.*setClassMetadata(ApplicationRef"
  assertSucceeded "Expected 'ngcc' to place 'setClassMetadata' after static properties like 'ctorParameters' in '@angular/core' (fesm2015)."


# Did it transform @angular/core typing files correctly?
  grep "import [*] as ɵngcc0 from './src/r3_symbols';" node_modules/@angular/core/core.d.ts
  assertSucceeded "Expected 'ngcc' to add an import for 'src/r3_symbols' in '@angular/core' typings."

  grep "static ɵinj: ɵngcc0.ɵɵInjectorDeclaration<ApplicationModule>;" node_modules/@angular/core/core.d.ts
  assertSucceeded "Expected 'ngcc' to add a definition for 'ApplicationModule.ɵinj' in '@angular/core' typings."


# Did it generate a base factory call for synthesized constructors correctly?
  grep "/\*@__PURE__\*/ function () { let ɵMatTable_BaseFactory; return function MatTable_Factory(t) { return (ɵMatTable_BaseFactory || (ɵMatTable_BaseFactory = ɵngcc0.ɵɵgetInheritedFactory(MatTable)))(t || MatTable); }; }();" node_modules/@angular/material/esm2015/table/table.js
  assertSucceeded "Expected 'ngcc' to generate a base factory for 'MatTable' in '@angular/material' (esm2015)."

  grep "/\*@__PURE__\*/ function () { var ɵMatTable_BaseFactory; return function MatTable_Factory(t) { return (ɵMatTable_BaseFactory || (ɵMatTable_BaseFactory = ɵngcc0.ɵɵgetInheritedFactory(MatTable)))(t || MatTable); }; }();" node_modules/@angular/material/esm5/table/table.js
  assertSucceeded "Expected 'ngcc' to generate a base factory for 'MatTable' in '@angular/material' (esm5)."


# Did it generate an abstract directive definition for undecorated classes with inputs and view queries?
  grep "_MatMenuBase.ɵdir = /\*@__PURE__\*/ ɵngcc0.ɵɵdefineDirective({ type: _MatMenuBase" node_modules/@angular/material/esm2015/menu/menu.js
  assertSucceeded "Expected 'ngcc' to generate an abstract directive definition for 'MatMenuBase' in '@angular/material' (esm2015)."

  grep "_MatMenuBase.ɵdir = /\*@__PURE__\*/ ɵngcc0.ɵɵdefineDirective({ type: _MatMenuBase" node_modules/@angular/material/esm5/menu/menu.js
  assertSucceeded "Expected 'ngcc' to generate an abstract directive definition for 'MatMenuBase' in '@angular/material' (esm5)."


# TODO: This assertion is disabled because @angular/common no longer contains __decorate calls.
#       We should either remove this assertion or use a syntentic JS file as input.
#       Discuss with the ngcc folks.
# Did it handle namespace imported decorators in UMD using `__decorate` syntax?
  #grep "type: i0.Injectable" node_modules/@angular/common/bundles/common.umd.js
  #assertSucceeded "Expected 'ngcc' to correctly handle '__decorate' syntax in '@angular/common' (umd)."

# TODO: This assertion is disabled because @angular/common no longer contains __decorate calls.
#       We should either remove this assertion or use a syntentic JS file as input.
#       Discuss with the ngcc folks.
  # (and ensure the @angular/common package is indeed using `__decorate` syntax)
  #grep "JsonPipe = __decorate(" node_modules/@angular/common/bundles/common.umd.js.__ivy_ngcc_bak
  #assertSucceeded "Expected '@angular/common' (umd) to actually use '__decorate' syntax."


# Did it handle namespace imported decorators in UMD using static properties?
  grep "type: i0.Injectable," node_modules/@angular/cdk/bundles/cdk-a11y.umd.js
  assertSucceeded "Expected 'ngcc' to correctly handle decorators via static properties in '@angular/cdk/a11y' (umd)."

  # (and ensure the @angular/cdk/a11y package is indeed using static properties)
  grep "FocusMonitor.decorators =" node_modules/@angular/cdk/bundles/cdk-a11y.umd.js.__ivy_ngcc_bak
  assertSucceeded "Expected '@angular/cdk/a11y' (umd) to actually have decorators via static properties."


# Did it transform imports in UMD correctly?
# (E.g. no trailing commas, so that it remains compatible with legacy browsers, such as IE11.)
  grep "factory(exports, require('rxjs'), require('rxjs/operators'))" node_modules/@angular/core/bundles/core.umd.js
  assertSucceeded "Expected 'ngcc' to not add trailing commas to CommonJS block in UMD."

  grep "define('@angular/core', \['exports', 'rxjs', 'rxjs/operators'], factory)" node_modules/@angular/core/bundles/core.umd.js
  assertSucceeded "Expected 'ngcc' to not add trailing commas to AMD block in UMD."

  grep "factory((global.ng = global.ng || {}, global.ng.core = {}), global.rxjs, global.rxjs.operators)" node_modules/@angular/core/bundles/core.umd.js
  assertSucceeded "Expected 'ngcc' to not add trailing commas to globals block in UMD."

  grep "(this, (function (exports, rxjs, operators) {" node_modules/@angular/core/bundles/core.umd.js
  assertSucceeded "Expected 'ngcc' to not add trailing commas to factory function parameters in UMD."


# Can it correctly clean up and re-compile when dependencies are already compiled by a different version?
  readonly actualNgccVersion=`node --print "require('@angular/compiler-cli/package.json').version"`
  readonly mockNgccVersion="3.0.0"

  # Mock the ngcc version marker on a package to make it appear as if it is compiled by a different ngcc version.
  node mock-ngcc-version-marker @angular/material/button $mockNgccVersion
  assertSucceeded "Expected to successfully mock the 'ngcc' version marker in '@angular/material/button'."
  assertEquals $mockNgccVersion `node --print "require('@angular/material/button/package.json').__processed_by_ivy_ngcc__.main"`
  assertEquals 1 `cat node_modules/@angular/material/button/button.d.ts | grep 'import \* as ɵngcc0' | wc -l`

  # Re-compile packages (which requires cleaning up those compiled by a different ngcc version).
  ngcc --properties main
  assertSucceeded "Expected 'ngcc' to successfully re-compile the packages."

  # Ensure previously compiled packages were correctly cleaned up (i.e. no multiple
  # `import ... ɵngcc0` statements) and re-compiled by the current ngcc version.
  assertEquals $actualNgccVersion `node --print "require('@angular/material/button/package.json').__processed_by_ivy_ngcc__.main"`
  assertEquals 1 `cat node_modules/@angular/material/button/button.d.ts | grep 'import \* as ɵngcc0' | wc -l`


# Can it compile `@angular/platform-server` in UMD + typings without errors?
# (The CLI prefers the `main` property (which maps to UMD) over `module` when compiling `@angular/platform-server`.
# See https://github.com/angular/angular-cli/blob/e36853338/packages/angular_devkit/build_angular/src/angular-cli-files/models/webpack-configs/server.ts#L34)
  if [[ -z "$cache" ]]; then
    cache=".yarn_local_cache"
  fi
  rm -rf node_modules/@angular/platform-server && \
    yarn install --cache-folder $cache --check-files && \
    test -d node_modules/@angular/platform-server
  assertSucceeded "Expected to re-install '@angular/platform-server'."

  ngcc --properties main --target @angular/platform-server
  assertSucceeded "Expected 'ngcc' to successfully compile '@angular/platform-server' (main)."


# Can it be safely run again (as a noop)?
# And check that it logged skipping compilation as expected
ngcc -l debug | grep 'Skipping'
assertSucceeded "Expected 'ngcc -l debug' to successfully rerun (as a noop) and log 'Skipping'."

# Does it process the tasks in parallel?
ngcc -l debug | grep 'Running ngcc on ClusterExecutor'
assertSucceeded "Expected 'ngcc -l debug' to run in parallel mode (using 'ClusterExecutor')."

# Check that running it with logging level error outputs nothing
ngcc -l error | grep '.'
assertFailed "Expected 'ngcc -l error' to not output anything."

# Does running it with --formats fail?
ngcc --formats fesm2015
assertFailed "Expected 'ngcc --formats fesm2015' to fail (since '--formats' is deprecated)."

# Does it timeout if there is another ngcc process running
LOCKFILE=node_modules/@angular/compiler-cli/ngcc/__ngcc_lock_file__
touch $LOCKFILE
trap "[[ -f $LOCKFILE ]] && rm $LOCKFILE" EXIT
ngcc
exitCode=$?
assertEquals $exitCode 177
rm $LOCKFILE

# Now try compiling the app using the ngcc compiled libraries
ngc -p tsconfig-app.json
assertSucceeded "Expected the app to successfully compile with the ngcc-processed libraries."

# Did it compile the main.ts correctly (including the ngIf and MatButton directives)?
  grep "directives: \[.*\.NgIf.*\]" dist/src/main.js
  assertSucceeded "Expected the compiled app's 'main.ts' to list 'NgIf' in 'directives'."

  grep "directives: \[.*\.MatButton.*\]" dist/src/main.js
  assertSucceeded "Expected the compiled app's 'main.ts' to list 'MatButton' in 'directives'."


# 'ivy-ngcc' should fail with an appropriate error message.
  ivy-ngcc
  assertFailed "Expected 'ivy-ngcc' to fail (since it was renamed to 'ngcc')."

  ivy-ngcc 2>&1 | grep "Error: The 'ivy-ngcc' command was renamed to just 'ngcc'. Please update your usage."
  assertSucceeded "Expected 'ivy-ngcc' to show an appropriate error message."
