import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {Schema} from './schema';
import {getFileContent} from '@schematics/angular/utility/test';
import {collectionPath, createTestApp} from '../utils/testing';

describe('material-nav-schematic', () => {
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

  // TODO(devversion): Temporarily disabled because @angular-devkit/schematics is not able to
  // find the template files for the schematic. As soon as we find a way to properly reference
  // those files, we can re-enable this test.
  xit('should create nav files and add them to module', () => {
    const tree = runner.runSchematic('nav', { ...options }, createTestApp());
    const files = tree.files;

    expect(files).toContain('/projects/material/src/app/foo/foo.component.css');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.html');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.ts');

    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');
    expect(moduleContent).toMatch(/import.*Foo.*from '.\/foo\/foo.component'/);
    expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+FooComponent\r?\n/m);
  });

  it('should add nav imports to module', () => {
    const tree = runner.runSchematic('nav', { ...options }, createTestApp());
    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');

    expect(moduleContent).toContain('LayoutModule');
    expect(moduleContent).toContain('MatToolbarModule');
    expect(moduleContent).toContain('MatButtonModule');
    expect(moduleContent).toContain('MatSidenavModule');
    expect(moduleContent).toContain('MatIconModule');
    expect(moduleContent).toContain('MatListModule');

    expect(moduleContent).toContain(`import { LayoutModule } from '@angular/cdk/layout';`);
    expect(moduleContent).toContain(
      `import { MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule, ` +
      `MatListModule } from '@angular/material';`);
  });

});
