const readFileSync = require('fs').readFileSync;
const writeFileSync = require('fs').writeFileSync;
const resolve = require('path').resolve;
const Terser = require('terser');
const GLOBAL_DEFS_FOR_TERSER = require('@angular/compiler-cli').GLOBAL_DEFS_FOR_TERSER;

const outputPath = resolve(__dirname, './core.min.js');
const pathToCoreFesm5 = resolve(__dirname, './node_modules/@angular/core/fesm5/core.js');
const coreFesm5Content = readFileSync(pathToCoreFesm5, 'utf8');
// Ensure that Terser global_defs exported by compiler-cli work.
const terserOpts = {
  compress: {
    module: true,
    global_defs: GLOBAL_DEFS_FOR_TERSER
  }
};
const result = Terser.minify(coreFesm5Content, terserOpts);
writeFileSync(outputPath, result.code);

for (const def of Object.keys(GLOBAL_DEFS_FOR_TERSER)) {
  if (result.code.includes(def)) {
    throw `'${def}' should have been removed from core bundle, but was still there.\n` +
      `See output at ${outputPath}.`;
  }
}