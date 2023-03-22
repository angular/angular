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
    file: './built/bundle.js',
    format: 'iife'
  },
  plugins: [
    nodeResolve(),
    babel({plugins: [linkerPlugin]}),
  ]
}