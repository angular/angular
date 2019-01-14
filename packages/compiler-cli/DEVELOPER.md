
# Legacy docs for @angular/compiler-cli Developers

*Note from Igor: This doc is likely outdated now but I'm keeping it around because
offline_compiler_test.sh need to be converted to bazel/circleci (or deleted) and these docs seem
relevant to anyone who needs to understand those tests. Once that's done this file can be deleted.*


```
# Build Angular and the compiler
./build.sh

# Run the test once
# (First edit the LINKABLE_PKGS to use npm link instead of npm install)
$ ./scripts/ci/offline_compiler_test.sh

# Keep a package fresh in watch mode
./node_modules/.bin/tsc -p packages/compiler/tsconfig-build.json -w

# Recompile @angular/core module (needs to use tsc-ext to keep the metadata)
$ export NODE_PATH=${NODE_PATH}:$(pwd)/dist/all:$(pwd)/dist/tools
$ node dist/tools/@angular/compiler-cli/src/main -p packages/core/tsconfig-build.json

# Iterate on the test
$ cd /tmp/wherever/e2e_test.1464388257/
$ ./node_modules/.bin/ngc
$ ./node_modules/.bin/jasmine test/*_spec.js
```
