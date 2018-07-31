import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {migrationCollection, createTestApp} from '../utils/testing';

describe('material-nav-schematic', () => {
  let runner: SchematicTestRunner;

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', migrationCollection);
  });

  it('should remove the temp directory', () => {
    const tree = runner.runSchematic('migration-01', {}, createTestApp());
    const files = tree.files;

    expect(files.find(file => file.includes('angular_material_temp_schematics')))
      .toBeFalsy('Expected the temporary directory for the schematics to be deleted');
  });

});
