import {join} from 'path';
import {PackageBundler} from './build-bundles';
import {buildConfig} from './build-config';
import {
  addImportAsToAllMetadata,
  compileEntryPoint,
  renamePrivateReExportsToBeUnique,
} from './compile-entry-point';
import {getSecondaryEntryPointsForPackage} from './secondary-entry-points';

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

  /** Whether the build package has schematics or not. */
  hasSchematics = false;

  /** Path to the entry file of the package in the output directory. */
  readonly entryFilePath: string;

  /** Package bundler instance. */
  private bundler = new PackageBundler(this);

  /** Secondary entry-points partitioned by their build depth. */
  get secondaryEntryPointsByDepth(): string[][] {
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
    return compileEntryPoint(this, testsTsconfigName)
      .then(() => addImportAsToAllMetadata(this));
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

  /** Stores the secondary entry-points for this package if they haven't been computed already. */
  private cacheSecondaryEntryPoints() {
    if (!this._secondaryEntryPoints) {
      this._secondaryEntryPointsByDepth = getSecondaryEntryPointsForPackage(this);
      this._secondaryEntryPoints =
        this._secondaryEntryPointsByDepth.reduce((list, p) => list.concat(p), []);
    }
  }
}
