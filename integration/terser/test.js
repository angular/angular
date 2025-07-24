const readFileSync = require('fs').readFileSync;
const writeFileSync = require('fs').writeFileSync;
const resolve = require('path').resolve;
const Terser = require('terser');

async function test() {
  const outputPath = resolve(__dirname, './core.min.js');
  const pathToCoreFesm2020 = resolve(__dirname, './node_modules/@angular/core/fesm2022/core.mjs');
  const coreFesm2022Content = readFileSync(pathToCoreFesm2020, 'utf8');

  const GLOBAL_DEFS_FOR_TERSER = (await import('@angular/compiler-cli')).GLOBAL_DEFS_FOR_TERSER;

  // Ensure that Terser global_defs exported by compiler-cli work.
  const terserOpts = {
    compress: {
      module: true,
      global_defs: GLOBAL_DEFS_FOR_TERSER,
    },
  };
  const result = await Terser.minify(coreFesm2022Content, terserOpts);
  writeFileSync(outputPath, result.code);

  for (const def of Object.keys(GLOBAL_DEFS_FOR_TERSER)) {
    if (result.code.includes(def)) {
      throw (
        `'${def}' should have been removed from core bundle, but was still there.\n` +
        `See output at ${outputPath}.`
      );
    }
  }

  console.info('Output looks good.');
}

test().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
