import {nodeResolve} from '@rollup/plugin-node-resolve';
import {babel} from '@rollup/plugin-babel';
import {ConsoleLogger, NodeJSFileSystem, LogLevel} from '@angular/compiler-cli';
import {createEs2015LinkerPlugin} from '@angular/compiler-cli/linker/babel';

/** File system used by the Angular linker plugin. */
const fileSystem = new NodeJSFileSystem();
/** Logger used by the Angular linker plugin. */
const logger = new ConsoleLogger(LogLevel.info);
/** Linker babel plugin. */
const linkerPlugin = createEs2015LinkerPlugin({
  fileSystem,
  logger,
  linkerJitMode: false,
});

export default {
  input: './built/src/main.js',
  output: {
    file: './dist/bundle.js',
  },
  // Rollup treeshaking has issues with https://github.com/angular/angular/blob/addd7f6249d54e258109f139fad1db0d0250352c/packages/core/src/linker/query_list.ts#L192
  // see: https://github.com/rollup/rollup/issues/4895
  treeshake: false,
  plugins: [
    nodeResolve(),
    babel({plugins: [linkerPlugin]}),
  ]
}
