import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {migrationCollection} from '../utils/testing';

describe('material-nav-schematic', () => {
  let runner: SchematicTestRunner;

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', migrationCollection);
  });

});
