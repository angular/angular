import {join} from 'path';
import {writeFileSync} from 'fs';

/** Creates a package.json for a secondary entry-point with the different bundle locations. */
export function createEntryPointPackageJson(destDir: string, packageName: string,
                                            entryPointName: string) {
  const content = {
    name: `@angular/${packageName}/${entryPointName}`,
    typings: `../${entryPointName}.d.ts`,
    main: `../bundles/${packageName}-${entryPointName}.umd.js`,
    module: `../esm5/${entryPointName}.es5.js`,
    es2015: `../esm2015/${entryPointName}.js`,
  };

  writeFileSync(join(destDir, 'package.json'), JSON.stringify(content, null, 2), 'utf-8');
}
