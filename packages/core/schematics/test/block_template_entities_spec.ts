/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getSystemPath, normalize, virtualFs} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import {HostTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {runfiles} from '@bazel/runfiles';
import shx from 'shelljs';

describe('Block template entities migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('block-template-entities', {}, tree);
  }

  beforeEach(() => {
    runner = new SchematicTestRunner('test', runfiles.resolvePackageRelative('../migrations.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile('/tsconfig.json', '{}');
    writeFile('/angular.json', JSON.stringify({
      version: 1,
      projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
    }));

    previousWorkingDir = shx.pwd();
    tmpDirPath = getSystemPath(host.root);

    // Switch into the temporary directory path. This allows us to run
    // the schematic against our custom unit test tree.
    shx.cd(tmpDirPath);
  });

  afterEach(() => {
    shx.cd(previousWorkingDir);
    shx.rm('-r', tmpDirPath);
  });

  it('should migrate an inline template', async () => {
    writeFile('/comp.ts', `
      import {Component} from '@angular/core';

      @Component({
        template: \`<div><span>My email is admin@test.com</span></div><h1>This is a brace }</h1>\`
      })
      class Comp {}
    `);

    await runMigration();
    const content = tree.readContent('/comp.ts');

    expect(content).toContain(
        'template: `<div><span>My email is admin&#64;test.com</span></div><h1>This is a brace &#125;</h1>`');
  });

  it('should migrate multiple inline templates in the same file', async () => {
    writeFile('/comp.ts', `
      import {Component} from '@angular/core';

      @Component({
        template: \`<div><span>My email is admin@test.com</span></div><h1>This is a brace }</h1>\`
      })
      class Comp {}

      @Component({
        template: \`<button>}<span>@@</span></button><h1>}</h1>\`
      })
      class OtherComp {}
    `);

    await runMigration();
    const content = tree.readContent('/comp.ts');

    expect(content).toContain(
        'template: `<div><span>My email is admin&#64;test.com</span></div><h1>This is a brace &#125;</h1>`');
    expect(content).toContain(
        'template: `<button>&#125;<span>&#64;&#64;</span></button><h1>&#125;</h1>`');
  });

  it('should migrate an external template', async () => {
    writeFile('/comp.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './comp.html'
      })
      class Comp {}
    `);

    writeFile('/comp.html', [
      `<div>`,
      `<span>My email is admin@test.com</span>`,
      `</div>`,
      `<h1>`,
      `This is a brace }`,
      `</h1>`,
    ].join('\n'));

    await runMigration();
    const content = tree.readContent('/comp.html');

    expect(content).toBe([
      `<div>`,
      `<span>My email is admin&#64;test.com</span>`,
      `</div>`,
      `<h1>`,
      `This is a brace &#125;`,
      `</h1>`,
    ].join('\n'));
  });

  it('should migrate a template referenced by multiple components', async () => {
    writeFile('/comp.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './comp.html'
      })
      class Comp {}
    `);

    writeFile('/other-comp.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './comp.html'
      })
      class OtherComp {}
    `);

    writeFile('/comp.html', [
      `<div>`,
      `<span>My email is admin@test.com</span>`,
      `</div>`,
      `<h1>`,
      `This is a brace }`,
      `</h1>`,
    ].join('\n'));

    await runMigration();
    const content = tree.readContent('/comp.html');

    expect(content).toBe([
      `<div>`,
      `<span>My email is admin&#64;test.com</span>`,
      `</div>`,
      `<h1>`,
      `This is a brace &#125;`,
      `</h1>`,
    ].join('\n'));
  });

  it('should migrate entities in a element that has interpolations', async () => {
    writeFile('/comp.ts', `
      import {Component} from '@angular/core';

      @Component({
        template: \`<div>@ {{'@'}} } {{"}"}} @}</div>\`
      })
      class Comp {}
    `);

    await runMigration();
    const content = tree.readContent('/comp.ts');

    expect(content).toContain('template: `<div>&#64; {{\'@\'}} &#125; {{"}"}} &#64;&#125;</div>`');
  });

  it('should preserve characters in element attributes', async () => {
    writeFile('/comp.ts', `
      import {Component} from '@angular/core';

      @Component({
        template: \`<div @someAnimation [@someAnimation.done]="foo()" someAttr="}">@}</div>\`
      })
      class Comp {}
    `);

    await runMigration();
    const content = tree.readContent('/comp.ts');

    expect(content).toContain(
        'template: `<div @someAnimation [@someAnimation.done]="foo()" someAttr="}">&#64;&#125;</div>`');
  });

  it('should preserve preserve braces in ICU expressions in element attributes', async () => {
    writeFile('/comp.ts', `
      import {Component} from '@angular/core';

      @Component({
        // Extra } at the end is on purpose to verify that it still gets picked up.
        template: \`<div>{one.two, three, =4 {four} =5 {five} foo {bar}}}</div>\`
      })
      class Comp {}
    `);

    await runMigration();
    const content = tree.readContent('/comp.ts');

    expect(content).toContain(
        'template: `<div>{one.two, three, =4 {four} =5 {five} foo {bar}}&#125;</div>`');
  });

  it('should preserve templates that already use the entities', async () => {
    writeFile('/comp.ts', `
      import {Component} from '@angular/core';

      @Component({
        template: \`<div><span>My email is admin&#64;test.com</span></div><h1>This is a brace &#125;</h1>\`
      })
      class Comp {}
    `);

    await runMigration();
    const content = tree.readContent('/comp.ts');

    expect(content).toContain(
        'template: `<div><span>My email is admin&#64;test.com</span></div><h1>This is a brace &#125;</h1>`');
  });

  it('should preserve templates that contain errors', async () => {
    writeFile('/comp.ts', `
      import {Component} from '@angular/core';

      @Component({
        template: \`@</span>\`
      })
      class Comp {}
    `);

    await runMigration();
    const content = tree.readContent('/comp.ts');

    expect(content).toContain('template: `@</span>`');
  });

  it('should not stop the migration if a file cannot be read', async () => {
    writeFile('/comp.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './does-not-exist.html'
      })
      class BrokenComp {}
    `);

    writeFile('/other-comp.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './comp.html'
      })
      class Comp {}
    `);

    writeFile('/comp.html', 'My email is admin@test.com');

    await runMigration();
    const content = tree.readContent('/comp.html');

    expect(content).toBe('My email is admin&#64;test.com');
  });

  it('should migrate a component that is not at the top level', async () => {
    writeFile('/comp.ts', `
      import {Component} from '@angular/core';

      function foo() {
        @Component({
          template: \`<div><span>My email is admin@test.com</span></div><h1>This is a brace }</h1>\`
        })
        class Comp {}
      }
    `);

    await runMigration();
    const content = tree.readContent('/comp.ts');

    expect(content).toContain(
        'template: `<div><span>My email is admin&#64;test.com</span></div><h1>This is a brace &#125;</h1>`');
  });
});
