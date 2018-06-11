import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {join} from 'path';
import {Tree} from '@angular-devkit/schematics';
import {createTestApp} from '../utils/testing';
import {getFileContent} from '@schematics/angular/utility/test';

const collectionPath = join(__dirname, '../collection.json');

describe('material-dashboard-schematic', () => {
  let runner: SchematicTestRunner;
  const options = {
    name: 'foo',
    path: 'app',
    sourceDir: 'src',
    inlineStyle: false,
    inlineTemplate: false,
    changeDetection: 'Default',
    styleext: 'css',
    spec: true,
    module: undefined,
    export: false,
    prefix: undefined,
    viewEncapsulation: undefined,
  };

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', collectionPath);
  });

  it('should create dashboard files and add them to module', () => {
    const tree = runner.runSchematic('dashboard', { ...options }, createTestApp());
    const files = tree.files;

    expect(files).toContain('/src/app/foo/foo.component.css');
    expect(files).toContain('/src/app/foo/foo.component.html');
    expect(files).toContain('/src/app/foo/foo.component.spec.ts');
    expect(files).toContain('/src/app/foo/foo.component.ts');

    const moduleContent = getFileContent(tree, '/src/app/app.module.ts');
    expect(moduleContent).toMatch(/import.*Foo.*from '.\/foo\/foo.component'/);
    expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+FooComponent\r?\n/m);
  });

  it('should add dashboard imports to module', () => {
    const tree = runner.runSchematic('materialDashboard', { ...options }, createTestApp());
    const moduleContent = getFileContent(tree, '/src/app/app.module.ts');

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
