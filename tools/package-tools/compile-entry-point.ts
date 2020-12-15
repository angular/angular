import * as chalk from 'chalk';
import {join} from 'path';
import {BuildPackage} from './build-package';
import {tsCompile} from './ts-compile';

/** Compiles the TypeScript sources of a primary or secondary entry point. */
export async function compileEntryPoint(buildPackage: BuildPackage, tsconfigName: string,
                                        secondaryEntryPoint = '', es5OutputPath?: string) {
  const entryPointPath = join(buildPackage.sourceDir, secondaryEntryPoint);
  const entryPointTsconfigPath = join(entryPointPath, tsconfigName);
  const ngcFlags = ['-p', entryPointTsconfigPath];

  if (es5OutputPath) {
    ngcFlags.push('--outDir', es5OutputPath, '--target', 'ES5');
  }

  // TODO: ideally we'd use ngc here to build the library code in AOT. This
  // would speed up tests since only test component would be compiled in JIT.
  // Blocked on: https://github.com/angular/angular/issues/33724
  return tsCompile('tsc', ngcFlags).catch(() => {
    const error = chalk.red(
        `Failed to compile ${secondaryEntryPoint} using ${entryPointTsconfigPath}`);
    console.error(error);
    return Promise.reject(error);
  });
}
