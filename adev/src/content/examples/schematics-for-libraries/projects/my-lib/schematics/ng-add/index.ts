import {Rule} from '@angular-devkit/schematics';
import {addRootImport} from '@schematics/angular/utility';
import {Schema} from './schema';

export function ngAdd(options: Schema): Rule {
  // Add an import `MyLibModule` from `my-lib` to the root of the user's project.
  return addRootImport(
    options.project,
    ({code, external}) => code`${external('MyLibModule', 'my-lib')}`,
  );
}
