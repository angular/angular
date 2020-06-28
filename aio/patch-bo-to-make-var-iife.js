// This is a workaround for https://github.com/ampproject/rollup-plugin-closure-compiler/issues/92.
// When running `yarn rollup-closure` you'll see these errors:

// Error: Google Closure Compiler exit 2: D:\sandbox\rollup-closure-cli\node_modules\google-closure-compiler-windows\compiler.exe --language_out=NO_TRANSPILE --assume_function_wrapper=true --warning_le
// vel=QUIET --module_resolution=NODE --externs=C:\Users\kamik\AppData\Local\Temp\d911a140-4ab7-4c4f-8510-d13ba110acc6 --externs=./externs.js --jscomp_off=nonStandardJsDocs --js=C:\Users\kamik\AppData\
// Local\Temp\befcc503-a328-46b6-b852-82be404accc3 --create_source_map=C:\Users\kamik\AppData\Local\Temp\272778d7-46a7-43ed-9f49-10096135ff2d

// C:/Users/kamik/AppData/Local/Temp/befcc503-a328-46b6-b852-82be404accc3:17328: ERROR - [JSC_BLOCK_SCOPED_DECL_MULTIPLY_DECLARED_ERROR] Duplicate let / const / class / function declaration in the same
//  scope is not allowed.
// let Console = /*@__PURE__*/ (() => {
//     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

// C:/Users/kamik/AppData/Local/Temp/befcc503-a328-46b6-b852-82be404accc3:19857: ERROR - [JSC_BLOCK_SCOPED_DECL_MULTIPLY_DECLARED_ERROR] Duplicate let / const / class / function declaration in the same
//  scope is not allowed.
// let Location = /*@__PURE__*/ (() => {
//     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

// 2 error(s), 0 warning(s)

// This error means we're using Console and Location, but GCC already has global definitions for those names. Since they are here declared via let
// (or class, if BO isn't used), there's a duplicate declaration that should lead to a SyntaxError. It doesn't actually lead to one in a browser though.
// Luckily, BO already processes these classes to add the pure IIFE.
// By editing `node_modules/@angular-devkit/build-optimizer/src/transforms/wrap-enums.js` and removing `, ts.NodeFlags.Let`, a `var` declaration will be
// used instead, which doesn't seem to bother GCC much.
const execSync = require('child_process').execSync;
execSync(`sed -i 's/, ts\.NodeFlags\.Let//g' node_modules/@angular-devkit/build-optimizer/src/transforms/wrap-enums.js`)
