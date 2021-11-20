import {NodeJSFileSystem, ConsoleLogger, LogLevel} from '@angular/compiler-cli';
import {createEs2015LinkerPlugin} from '@angular/compiler-cli/linker/babel';
import babel from '@babel/core';
import fs from 'fs';

const linkerBabelPlugin = createEs2015LinkerPlugin({
  fileSystem: new NodeJSFileSystem(),
  logger: new ConsoleLogger(LogLevel.warn),
  linkerJitMode: false,
});

const linkerEsbuildPlugin = {
  name: 'ng-linker-esbuild',
  setup: build => {
    build.onLoad({filter: /fesm2020/}, async args => {
      const filePath = args.path;
      const content = await fs.promises.readFile(filePath, 'utf8');
      const {code} = await babel.transformAsync(content, {
        filename: filePath,
        filenameRelative: filePath,
        plugins: [linkerBabelPlugin],
        sourceMaps: 'inline',
        compact: false,
      });

      return {contents: code};
    });
  },
};

export default {
  // Prefer `.mjs` files over `.js` files. Otherwise the devmode ES5 CommonJS
  // files might get picked up by ESBuild.
  resolveExtensions: ['.mjs', '.js'],
  // `tslib` sets the `module` condition to resolve to ESM.
  conditions: ['es2020', 'es2015', 'module'],
  // This ensures that we prioritize ES2020. RxJS would otherwise use the ESM5 output.
  mainFields: ['es2020', 'es2015', 'module', 'main'],
  format: 'iife',
  plugins: [linkerEsbuildPlugin],
};
