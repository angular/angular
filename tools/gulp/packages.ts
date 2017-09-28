import {BuildPackage, buildConfig} from 'material2-build-tools';
import {join} from 'path';

export const cdkPackage = new BuildPackage('cdk');
export const materialPackage = new BuildPackage('material', [cdkPackage]);
export const examplesPackage = new BuildPackage('material-examples', [materialPackage, cdkPackage]);
export const momentAdapterPackage = new BuildPackage('material-moment-adapter', [materialPackage]);

// The material package re-exports its secondary entry-points at the root so that all of the
// components can still be imported through `@angular/material`.
materialPackage.exportsSecondaryEntryPointsAtRoot = true;

// To avoid refactoring of the project the material package will map to the source path `lib/`.
materialPackage.sourceDir = join(buildConfig.packagesDir, 'lib');

// Some CDK secondary entry-points include SCSS files that should be exposed individually at the
// release output root. This is different in the Material package because here a full SCSS bundle
// will be generated.
cdkPackage.copySecondaryEntryPointStylesToRoot = true;
