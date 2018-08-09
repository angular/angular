import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {collectionPath, createTestApp} from '../test-setup/test-app';
import {getFileContent} from '@schematics/angular/utility/test';
import {Schema} from './schema';

describe('material-dashboard-schematic', () => {
  let runner: SchematicTestRunner;
  const options: Schema = {
    name: 'foo',
    project: 'material',
    changeDetection: 'Default',
    styleext: 'css',
    spec: true,
    export: false,
  };

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', collectionPath);
  });

  it('should create dashboard files and add them to module', () => {
    const tree = runner.runSchematic('dashboard', { ...options }, createTestApp());
    const files = tree.files;

    expect(files).toContain('/projects/material/src/app/foo/foo.component.css');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.html');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.ts');

    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');
    expect(moduleContent).toMatch(/import.*Foo.*from '.\/foo\/foo.component'/);
    expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+FooComponent\r?\n/m);
  });

  it('should add dashboard imports to module', () => {
    const tree = runner.runSchematic('dashboard', { ...options }, createTestApp());
    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');

    expect(moduleContent).toContain('MatGridListModule');
    expect(moduleContent).toContain('MatCardModule');
    expect(moduleContent).toContain('MatMenuModule');
    expect(moduleContent).toContain('MatIconModule');
    expect(moduleContent).toContain('MatButtonModule');

    expect(moduleContent).toContain(
      // tslint:disable-next-line
      `import { MatGridListModule, MatCardModule, MatMenuModule, MatIconModule, MatButtonModule } from '@angular/material';`);
  });

});
