import {join} from 'path';
import {red} from 'chalk';
import {PackageBundler} from './build-bundles';
import {buildConfig} from './build-config';
import {getSecondaryEntryPointsForPackage} from './secondary-entry-points';
import {compileEntryPoint, renamePrivateReExportsToBeUnique} from './compile-entry-point';
import {ngcCompile} from './ngc-compile';

const {packagesDir, outputDir} = buildConfig;

/** Name of the tsconfig file that is responsible for building an ES2015 package. */
const buildTsconfigName = 'tsconfig-build.json';

/** Name of the tsconfig file that is responsible for building the tests. */
const testsTsconfigName = 'tsconfig-tests.json';

export class BuildPackage {
  /** Path to the package sources. */
  sourceDir: string;

  /** Path to the ES2015 package output. */
  outputDir: string;

  /** Path to the ES5 package output. */
  esm5OutputDir: string;

  /** Whether this package will re-export its secondary-entry points at the root module. */
  exportsSecondaryEntryPointsAtRoot = false;

  /** Whether the secondary entry-point styles should be copied to the release output. */
  copySecondaryEntryPointStylesToRoot = false;

  /** Path to the entry file of the package in the output directory. */
  readonly entryFilePath: string;

  /** Path to the tsconfig file, which will be used to build the package. */
  private readonly tsconfigBuild: string;

  /** Path to the tsconfig file, which will be used to build the tests. */
  private readonly tsconfigTests: string;

  /** Package bundler instance. */
  private bundler = new PackageBundler(this);

  /** Secondary entry-points partitioned by their build depth. */
  private get secondaryEntryPointsByDepth(): string[][] {
    this.cacheSecondaryEntryPoints();
    return this._secondaryEntryPointsByDepth;
  }
  private _secondaryEntryPointsByDepth: string[][];

  /** Secondary entry points for the package. */
  get secondaryEntryPoints(): string[] {
    this.cacheSecondaryEntryPoints();
    return this._secondaryEntryPoints;
  }
  private _secondaryEntryPoints: string[];

  constructor(readonly name: string, readonly dependencies: BuildPackage[] = []) {
    this.sourceDir = join(packagesDir, name);
    this.outputDir = join(outputDir, 'packages', name);
    this.esm5OutputDir = join(outputDir, 'packages', name, 'esm5');

    this.tsconfigBuild = join(this.sourceDir, buildTsconfigName);
    this.tsconfigTests = join(this.sourceDir, testsTsconfigName);

    this.entryFilePath = join(this.outputDir, 'index.js');
  }

  /** Compiles the package sources with all secondary entry points. */
  async compile() {
    // Compile all secondary entry-points with the same depth in parallel, and each separate depth
    // group in sequence. This will look something like:
    // Depth 0: coercion, platform, keycodes, bidi
    // Depth 1: a11y, scrolling
    // Depth 2: overlay
    for (const entryPointGroup of this.secondaryEntryPointsByDepth) {
      await Promise.all(entryPointGroup.map(p => this._compileBothTargets(p)));
    }

    // Compile the primary entry-point.
    await this._compileBothTargets();
  }

  /** Compiles the TypeScript test source files for the package. */
  async compileTests() {
    await this._compileTestEntryPoint(testsTsconfigName);
  }

  /** Creates all bundles for the package and all associated entry points. */
  async createBundles() {
    await this.bundler.createBundles();
  }

  /** Compiles TS into both ES2015 and ES5, then updates exports. */
  private async _compileBothTargets(p = '') {
    return compileEntryPoint(this, buildTsconfigName, p)
      .then(() => compileEntryPoint(this, buildTsconfigName, p, this.esm5OutputDir))
      .then(() => renamePrivateReExportsToBeUnique(this, p));
  }

  /** Compiles the TypeScript sources of a primary or secondary entry point. */
  private _compileTestEntryPoint(tsconfigName: string, secondaryEntryPoint = ''): Promise<any> {
    const entryPointPath = join(this.sourceDir, secondaryEntryPoint);
    const entryPointTsconfigPath = join(entryPointPath, tsconfigName);

    return ngcCompile(['-p', entryPointTsconfigPath]).catch(() => {
      const error = red(`Failed to compile ${secondaryEntryPoint} using ${entryPointTsconfigPath}`);
      console.error(error);
      return Promise.reject(error);
    });
  }

  /** Stores the secondary entry-points for this package if they haven't been computed already. */
  private cacheSecondaryEntryPoints() {
    if (!this._secondaryEntryPoints) {
      this._secondaryEntryPointsByDepth = getSecondaryEntryPointsForPackage(this);
      this._secondaryEntryPoints =
        this._secondaryEntryPointsByDepth.reduce((list, p) => list.concat(p), []);
    }
  }
}
