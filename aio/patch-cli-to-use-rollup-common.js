// This is a patch to force Angular CLI's --experimental-rollup-pass to support the commonChunk option.
// It was always supported in the first place, we were just being conservative with chunk options at the time.

const execSync = require('child_process').execSync;
execSync(`sed -i 's/options\.commonChunk/false/g' node_modules/@angular-devkit/build-angular/src/utils/webpack-browser-config.js`)
