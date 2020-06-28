// This is a patch to force Angular CLI's --experimental-rollup-pass to also use a closure compiler pass.
// @ampproject/rollup-plugin-closure-compiler needs to be installed at the toplevel.

const execSync = require('child_process').execSync;
execSync(`sed -i 's/rollupOptions = {}/rollupOptions = {plugins:[require("@ampproject\\/rollup-plugin-closure-compiler")()]}/g' node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/common.js`)
