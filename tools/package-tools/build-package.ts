import {join} from 'path';
import {buildConfig} from './build-config';
import {compileEntryPoint} from './compile-entry-point';

const {packagesDir, outputDir} = buildConfig;

/** Name of the tsconfig file that is responsible for building the tests. */
const testsTsconfigName = 'tsconfig-tests.json';

export class BuildPackage {
  /** Path to the package sources. */
  sourceDir: string;

  /** Path to the package output. */
  outputDir: string;

  constructor(readonly name: string, readonly dependencies: BuildPackage[] = []) {
    this.sourceDir = join(packagesDir, name);
    this.outputDir = join(outputDir, 'packages', name);
  }

  /** Compiles the TypeScript test source files for the package. */
  async compileTests() {
    return compileEntryPoint(this, testsTsconfigName);
  }
}
