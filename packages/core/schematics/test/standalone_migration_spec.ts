/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getSystemPath, normalize, virtualFs} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import {HostTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing/index.js';
import {resolve} from 'node:path';
import shx from 'shelljs';

describe('standalone migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration(mode: string, path = './') {
    return runner.runSchematic('standalone-migration', {mode, path}, tree);
  }

  function stripWhitespace(content: string) {
    return content.replace(/\s+/g, '');
  }

  const collectionJsonPath = resolve('../collection.json');
  beforeEach(() => {
    runner = new SchematicTestRunner('test', collectionJsonPath);
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile(
      '/tsconfig.json',
      JSON.stringify({
        compilerOptions: {
          lib: ['es2015'],
          strictNullChecks: true,
        },
      }),
    );

    writeFile(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}},
      }),
    );

    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile(
      '/node_modules/@angular/core/index.d.ts',
      `
      export declare class PlatformRef {
        bootstrapModule(module: any): any;
      }

      export declare function forwardRef<T>(fn: () => T): T;
    `,
    );

    writeFile(
      '/node_modules/@angular/platform-browser/index.d.ts',
      `
      import {PlatformRef} from '@angular/core';

      export const platformBrowser: () => PlatformRef;
    `,
    );

    writeFile(
      '/node_modules/@angular/platform-browser/animations/index.d.ts',
      `
      import {ModuleWithProviders} from '@angular/core';

      export declare class BrowserAnimationsModule {
        static withConfig(config: any): ModuleWithProviders<BrowserAnimationsModule>;
      }

      export declare class NoopAnimationsModule {}
    `,
    );

    writeFile(
      '/node_modules/@angular/platform-browser-dynamic/index.d.ts',
      `
      import {PlatformRef} from '@angular/core';

      export const platformBrowserDynamic: () => PlatformRef;
    `,
    );

    writeFile(
      '/node_modules/@angular/common/index.d.ts',
      `
      import {ɵɵDirectiveDeclaration, ɵɵNgModuleDeclaration} from '@angular/core';

      export declare class NgIf {
        ngIf: any;
        ngIfThen: TemplateRef<any>|null;
        ngIfElse: TemplateRef<any>|null;
        static ɵdir: ɵɵDirectiveDeclaration<NgIf, '[ngIf]', never, {
          'ngIf': 'ngIf';
          'ngIfThen': 'ngIfThen';
          'ngIfElse': 'ngIfElse';
        }, {}, never, never, true>;
      }

      export declare class NgForOf {
        ngForOf: any;

        static ɵdir: ɵɵDirectiveDeclaration<NgForOf, '[ngFor][ngForOf]', never, {
          'ngForOf': 'ngForOf';
        }, {}, never, never, true>;
      }

      export declare class CommonModule {
        static ɵmod: ɵɵNgModuleDeclaration<CommonModule, never,
          [typeof NgIf, typeof NgForOf], [typeof NgIf, typeof NgForOf]>;
      }

      export {NgForOf as NgFor};
    `,
    );

    writeFile(
      '/node_modules/@angular/router/index.d.ts',
      `
      import {ModuleWithProviders, ɵɵDirectiveDeclaration, ɵɵNgModuleDeclaration} from '@angular/core';

      export declare class RouterLink {
        // Router link is intentionally not standalone.
        static ɵdir: ɵɵDirectiveDeclaration<RouterLink, '[routerLink]', never, {}, {}, never, never, false>;
      }

      export declare class RouterModule {
        static forRoot(routes: any[], config?: any): ModuleWithProviders<RouterModule>;
        static ɵmod: ɵɵNgModuleDeclaration<CommonModule, [typeof RouterLink], [], [typeof RouterLink]>;
      }
    `,
    );

    writeFile(
      '/node_modules/@angular/common/http/index.d.ts',
      `
      import {ModuleWithProviders} from '@angular/core';

      export declare class HttpClientModule {
          static ɵfac: i0.ɵɵFactoryDeclaration<HttpClientModule, never>;
          static ɵmod: i0.ɵɵNgModuleDeclaration<HttpClientModule, never, never, never>;
          static ɵinj: i0.ɵɵInjectorDeclaration<HttpClientModule>;
      }
    `,
    );

    writeFile(
      '/node_modules/@angular/core/testing/index.d.ts',
      `
      export declare class TestBed {
        static configureTestingModule(config: any): any;
      }
    `,
    );

    const fakeCatalyst = `export declare function setupModule(config: any);`;
    writeFile('/node_modules/some_internal_path/angular/testing/catalyst/index.d.ts', fakeCatalyst);
    writeFile(
      '/node_modules/some_internal_path/angular/testing/catalyst/fake_async/index.d.ts',
      fakeCatalyst,
    );
    writeFile(
      '/node_modules/some_internal_path/angular/testing/catalyst/async/index.d.ts',
      fakeCatalyst,
    );

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

  it('should throw an error if no files match the passed-in path', async () => {
    let error: string | null = null;

    writeFile(
      'dir.ts',
      `
      import {Directive} from '@angular/core';

      @Directive({selector: '[dir]'})
      export class MyDir {}
    `,
    );

    try {
      await runMigration('convert-to-standalone', './foo');
    } catch (e: any) {
      error = e.message;
    }

    expect(error).toMatch(
      /Could not find any files to migrate under the path .*\/foo\. Cannot run the standalone migration/,
    );
  });

  it('should throw an error if a path outside of the project is passed in', async () => {
    let error: string | null = null;

    writeFile(
      'dir.ts',
      `
      import {Directive} from '@angular/core';

      @Directive({selector: '[dir]'})
      export class MyDir {}
    `,
    );

    try {
      await runMigration('convert-to-standalone', '../foo');
    } catch (e: any) {
      error = e.message;
    }

    expect(error).toBe('Cannot run standalone migration outside of the current project.');
  });

  it('should throw an error if the passed in path is a file', async () => {
    let error: string | null = null;

    writeFile('dir.ts', '');

    try {
      await runMigration('convert-to-standalone', './dir.ts');
    } catch (e: any) {
      error = e.message;
    }

    expect(error).toMatch(
      /Migration path .*\/dir\.ts has to be a directory\. Cannot run the standalone migration/,
    );
  });

  it('should create an `imports` array if the module does not have one already', async () => {
    writeFile(
      'module.ts',
      `
      import {NgModule, Directive} from '@angular/core';

      @Directive({selector: '[dir]'})
      export class MyDir {}

      @NgModule({declarations: [MyDir]})
      export class Mod {}
    `,
    );

    await runMigration('convert-to-standalone');

    expect(stripWhitespace(tree.readContent('module.ts'))).toContain(
      stripWhitespace(`@NgModule({imports: [MyDir]})`),
    );
  });

  it('should combine the `declarations` array with a static `imports` array', async () => {
    writeFile(
      'module.ts',
      `
      import {NgModule, Directive} from '@angular/core';
      import {CommonModule} from '@angular/common';

      @Directive({selector: '[dir]'})
      export class MyDir {}

      @NgModule({declarations: [MyDir], imports: [CommonModule]})
      export class Mod {}
    `,
    );

    await runMigration('convert-to-standalone');

    expect(stripWhitespace(tree.readContent('module.ts'))).toContain(
      stripWhitespace(`@NgModule({imports: [CommonModule, MyDir]})`),
    );
  });

  it('should combine a `declarations` array with a spread expression into the `imports`', async () => {
    writeFile(
      'module.ts',
      `
        import {NgModule, Directive} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Directive({selector: '[dir]'})
        export class MyDir {}

        @Directive({selector: '[dir]'})
        export class MyOtherDir {}

        const extraDeclarations = [MyOtherDir];

        @NgModule({declarations: [MyDir, ...extraDeclarations], imports: [CommonModule]})
        export class Mod {}
      `,
    );

    await runMigration('convert-to-standalone');

    expect(stripWhitespace(tree.readContent('module.ts'))).toContain(
      stripWhitespace(`@NgModule({imports: [CommonModule, MyDir, ...extraDeclarations]})`),
    );
  });

  it('should combine a `declarations` array with an `imports` array that has a spread expression', async () => {
    writeFile(
      'module.ts',
      `
        import {NgModule, Directive} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Directive({selector: '[dir]'})
        export class MyDir {}

        @Directive({selector: '[dir]', standalone: true})
        export class MyOtherDir {}

        const extraImports = [MyOtherDir];

        @NgModule({declarations: [MyDir], imports: [CommonModule, ...extraImports]})
        export class Mod {}
      `,
    );

    await runMigration('convert-to-standalone');

    expect(stripWhitespace(tree.readContent('module.ts'))).toContain(
      stripWhitespace(`@NgModule({imports: [CommonModule, ...extraImports, MyDir]})`),
    );
  });

  it('should use a spread expression if the `declarations` is an expression when combining with the `imports`', async () => {
    writeFile(
      'module.ts',
      `
        import {NgModule, Directive} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Directive({selector: '[dir]'})
        export class MyDir {}

        const DECLARATIONS = [MyDir];

        @NgModule({declarations: DECLARATIONS, imports: [CommonModule]})
        export class Mod {}
      `,
    );

    await runMigration('convert-to-standalone');

    expect(stripWhitespace(tree.readContent('module.ts'))).toContain(
      stripWhitespace(`@NgModule({imports: [CommonModule, ...DECLARATIONS]})`),
    );
  });

  it('should use a spread expression if the `imports` is an expression when combining with the `declarations`', async () => {
    writeFile(
      'module.ts',
      `
        import {NgModule, Directive} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Directive({selector: '[dir]'})
        export class MyDir {}

        const IMPORTS = [CommonModule];

        @NgModule({declarations: [MyDir], imports: IMPORTS})
        export class Mod {}
      `,
    );

    await runMigration('convert-to-standalone');

    expect(stripWhitespace(tree.readContent('module.ts'))).toContain(
      stripWhitespace(`@NgModule({imports: [...IMPORTS, MyDir]})`),
    );
  });

  it('should use a spread expression if both the `declarations` and the `imports` are not static arrays', async () => {
    writeFile(
      'module.ts',
      `
        import {NgModule, Directive} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Directive({selector: '[dir]'})
        export class MyDir {}

        const IMPORTS = [CommonModule];
        const DECLARATIONS = [MyDir];

        @NgModule({declarations: DECLARATIONS, imports: IMPORTS})
        export class Mod {}
      `,
    );

    await runMigration('convert-to-standalone');

    expect(stripWhitespace(tree.readContent('module.ts'))).toContain(
      stripWhitespace(`@NgModule({imports: [...IMPORTS, ...DECLARATIONS]})`),
    );
  });

  it('should convert a directive in the same file as its module to standalone', async () => {
    writeFile(
      'module.ts',
      `
      import {NgModule, Directive} from '@angular/core';

      @Directive({selector: '[dir]', standalone: false})
      export class MyDir {}

      @NgModule({declarations: [MyDir], exports: [MyDir]})
      export class Mod {}
    `,
    );

    await runMigration('convert-to-standalone');

    const result = tree.readContent('module.ts');

    expect(stripWhitespace(result)).toContain(stripWhitespace(`@Directive({selector: '[dir]'})`));
    expect(stripWhitespace(result)).toContain(
      stripWhitespace(`@NgModule({imports: [MyDir], exports: [MyDir]})`),
    );
  });

  it('should convert a pipe in the same file as its module to standalone', async () => {
    writeFile(
      'module.ts',
      `
      import {NgModule, Pipe} from '@angular/core';

      @Pipe({name: 'myPipe', standalone: false})
      export class MyPipe {}

      @NgModule({declarations: [MyPipe], exports: [MyPipe]})
      export class Mod {}
    `,
    );

    await runMigration('convert-to-standalone');

    const result = tree.readContent('module.ts');

    expect(stripWhitespace(result)).toContain(stripWhitespace(`@Pipe({name: 'myPipe'})`));
    expect(stripWhitespace(result)).toContain(
      stripWhitespace(`@NgModule({imports: [MyPipe], exports: [MyPipe]})`),
    );
  });

  it('should only migrate declarations under a specific path', async () => {
    const content = `
      import {NgModule, Directive} from '@angular/core';

      @Directive({selector: '[dir]', standalone: false})
      export class MyDir {}

      @NgModule({declarations: [MyDir], exports: [MyDir]})
      export class Mod {}
    `;

    writeFile('./apps/app-1/module.ts', content);
    writeFile('./apps/app-2/module.ts', content);

    await runMigration('convert-to-standalone', './apps/app-2');

    expect(tree.readContent('./apps/app-1/module.ts')).toContain('standalone: false');
    expect(tree.readContent('./apps/app-2/module.ts')).toContain(`@Directive({ selector: '[dir]'`);
  });

  it('should convert a directive in a different file from its module to standalone', async () => {
    writeFile(
      'module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyDir} from './dir';

      @NgModule({declarations: [MyDir], exports: [MyDir]})
      export class Mod {}
    `,
    );

    writeFile(
      'dir.ts',
      `
      import {Directive} from '@angular/core';

      @Directive({selector: '[dir]', standalone: false})
      export class MyDir {}
    `,
    );

    await runMigration('convert-to-standalone');

    expect(stripWhitespace(tree.readContent('module.ts'))).toContain(
      stripWhitespace(`@NgModule({imports: [MyDir], exports: [MyDir]})`),
    );
    expect(stripWhitespace(tree.readContent('dir.ts'))).toContain(
      stripWhitespace(`@Directive({selector: '[dir]'})`),
    );
  });

  it('should convert a component with no template dependencies to standalone', async () => {
    writeFile(
      'module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyComp} from './comp';

      @NgModule({declarations: [MyComp], exports: [MyComp]})
      export class Mod {}
    `,
    );

    writeFile(
      'comp.ts',
      `
      import {Component} from '@angular/core';

      @Component({selector: 'my-comp', template: '<h1>Hello</h1>', standalone: false})
      export class MyComp {}
    `,
    );

    await runMigration('convert-to-standalone');

    expect(stripWhitespace(tree.readContent('module.ts'))).toContain(
      stripWhitespace(`@NgModule({imports: [MyComp], exports: [MyComp]})`),
    );
    expect(stripWhitespace(tree.readContent('comp.ts'))).toContain(
      stripWhitespace(`
        @Component({
          selector: 'my-comp',
          template: '<h1>Hello</h1>'
        })
      `),
    );
  });

  it('should add imports to dependencies within the same module', async () => {
    writeFile(
      'module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyComp} from './comp';
      import {MyButton} from './button';
      import {MyTooltip} from './tooltip';

      @NgModule({declarations: [MyComp, MyButton, MyTooltip], exports: [MyComp]})
      export class Mod {}
    `,
    );

    writeFile(
      'comp.ts',
      `
      import {Component} from '@angular/core';

      @Component({selector: 'my-comp', template: '<my-button tooltip="Click me">Hello</my-button>', standalone: false})
      export class MyComp {}
    `,
    );

    writeFile(
      'button.ts',
      `
      import {Component} from '@angular/core';

      @Component({selector: 'my-button', template: '<ng-content></ng-content>', standalone: false})
      export class MyButton {}
    `,
    );

    writeFile(
      'tooltip.ts',
      `
      import {Directive} from '@angular/core';

      @Directive({selector: '[tooltip]', standalone: false})
      export class MyTooltip {}
    `,
    );

    await runMigration('convert-to-standalone');

    const myCompContent = tree.readContent('comp.ts');

    expect(myCompContent).toContain(`import { MyButton } from './button';`);
    expect(myCompContent).toContain(`import { MyTooltip } from './tooltip';`);
    expect(stripWhitespace(myCompContent)).toContain(
      stripWhitespace(`
      @Component({
        selector: 'my-comp',
        template: '<my-button tooltip="Click me">Hello</my-button>',
        imports: [MyButton, MyTooltip]
      })
    `),
    );
    expect(stripWhitespace(tree.readContent('module.ts'))).toContain(
      stripWhitespace(`@NgModule({imports: [MyComp, MyButton, MyTooltip], exports: [MyComp]})`),
    );
    expect(stripWhitespace(tree.readContent('button.ts'))).toContain(
      stripWhitespace(`@Component({selector: 'my-button', template: '<ng-content></ng-content>'})`),
    );
    expect(stripWhitespace(tree.readContent('tooltip.ts'))).toContain(
      stripWhitespace(`@Directive({selector: '[tooltip]'})`),
    );
  });

  it('should reuse existing import statements when adding imports to a component', async () => {
    writeFile(
      'module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyComp} from './comp';
      import {MyButton} from './button';

      @NgModule({declarations: [MyComp, MyButton], exports: [MyComp]})
      export class Mod {}
    `,
    );

    writeFile(
      'comp.ts',
      `
      import {Component} from '@angular/core';
      import {helper} from './button';

      helper();

      @Component({selector: 'my-comp', template: '<my-button>Hello</my-button>', standalone: false})
      export class MyComp {}
    `,
    );

    writeFile(
      'button.ts',
      `
      import {Component} from '@angular/core';

      @Component({selector: 'my-button', template: '<ng-content></ng-content>', standalone: false})
      export class MyButton {}

      export function helper() {}
    `,
    );

    await runMigration('convert-to-standalone');

    const myCompContent = tree.readContent('comp.ts');

    expect(myCompContent).toContain(`import { helper, MyButton } from './button';`);
    expect(stripWhitespace(myCompContent)).toContain(
      stripWhitespace(`
      @Component({
        selector: 'my-comp',
        template: '<my-button>Hello</my-button>',
        imports: [MyButton]
      })
    `),
    );
  });

  it('should refer to pre-existing standalone dependencies directly when adding to the `imports`', async () => {
    writeFile(
      'module.ts',
      `
        import {NgModule} from '@angular/core';
        import {MyComp} from './comp';
        import {MyButton} from './button';

        @NgModule({imports: [MyButton], declarations: [MyComp], exports: [MyComp]})
        export class Mod {}
      `,
    );

    writeFile(
      'comp.ts',
      `
        import {Component} from '@angular/core';

        @Component({selector: 'my-comp', template: '<my-button>Hello</my-button>', standalone: false})
        export class MyComp {}
      `,
    );

    writeFile(
      'button.ts',
      `
        import {Component} from '@angular/core';
        import {MyComp} from './comp';

        @Component({selector: 'my-button', template: '<ng-content></ng-content>', standalone: true})
        export class MyButton {}
      `,
    );

    await runMigration('convert-to-standalone');
    const myCompContent = tree.readContent('comp.ts');

    expect(myCompContent).toContain(`import { MyButton } from './button';`);
    expect(stripWhitespace(myCompContent)).toContain(
      stripWhitespace(`
         @Component({
           selector: 'my-comp',
           template: '<my-button>Hello</my-button>',
           imports: [MyButton]
         })
       `),
    );
    expect(stripWhitespace(tree.readContent('module.ts'))).toContain(
      stripWhitespace('@NgModule({imports: [MyButton, MyComp], exports: [MyComp]})'),
    );
  });

  it('should refer to dependencies being handled in the same migration directly', async () => {
    writeFile(
      'module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyComp} from './comp';
      import {ButtonModule} from './button.module';

      @NgModule({imports: [ButtonModule], declarations: [MyComp], exports: [MyComp]})
      export class Mod {}
    `,
    );

    writeFile(
      'button.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyButton} from './button';

      @NgModule({declarations: [MyButton], exports: [MyButton]})
      export class ButtonModule {}
    `,
    );

    writeFile(
      'comp.ts',
      `
      import {Component} from '@angular/core';

      @Component({selector: 'my-comp', template: '<my-button>Hello</my-button>', standalone: false})
      export class MyComp {}
    `,
    );

    writeFile(
      'button.ts',
      `
      import {Component} from '@angular/core';

      @Component({selector: 'my-button', template: '<ng-content></ng-content>', standalone: false})
      export class MyButton {}
    `,
    );

    await runMigration('convert-to-standalone');

    const myCompContent = tree.readContent('comp.ts');

    expect(myCompContent).toContain(`import { MyButton } from './button';`);
    expect(stripWhitespace(myCompContent)).toContain(
      stripWhitespace(`
      @Component({
        selector: 'my-comp',
        template: '<my-button>Hello</my-button>',
        imports: [MyButton]
      })
    `),
    );
    expect(stripWhitespace(tree.readContent('button.ts'))).toContain(
      stripWhitespace(`
      @Component({
        selector: 'my-button',
        template: '<ng-content></ng-content>'
      })
    `),
    );
    expect(stripWhitespace(tree.readContent('module.ts'))).toContain(
      stripWhitespace(`
      @NgModule({imports: [ButtonModule, MyComp], exports: [MyComp]})
    `),
    );
    expect(stripWhitespace(tree.readContent('button.module.ts'))).toContain(
      stripWhitespace(`
      @NgModule({imports: [MyButton], exports: [MyButton]})
    `),
    );
  });

  it('should refer to dependencies by their module if they have been excluded from the migration', async () => {
    writeFile(
      './should-migrate/module.ts',
      `
        import {NgModule} from '@angular/core';
        import {MyComp} from './comp';
        import {ButtonModule} from '../do-not-migrate/button.module';

        @NgModule({imports: [ButtonModule], declarations: [MyComp], exports: [MyComp]})
        export class Mod {}
      `,
    );

    writeFile(
      './do-not-migrate/button.module.ts',
      `
        import {NgModule} from '@angular/core';
        import {MyButton} from './button';

        @NgModule({declarations: [MyButton], exports: [MyButton]})
        export class ButtonModule {}
      `,
    );

    writeFile(
      './should-migrate/comp.ts',
      `
        import {Component} from '@angular/core';

        @Component({selector: 'my-comp', template: '<my-button>Hello</my-button>', standalone: false})
        export class MyComp {}
      `,
    );

    writeFile(
      './do-not-migrate/button.ts',
      `
        import {Component} from '@angular/core';

        @Component({selector: 'my-button', template: '<ng-content></ng-content>', standalone: false})
        export class MyButton {}
      `,
    );

    await runMigration('convert-to-standalone', './should-migrate');

    const myCompContent = tree.readContent('./should-migrate/comp.ts');

    expect(myCompContent).toContain(
      `import { ButtonModule } from '../do-not-migrate/button.module';`,
    );
    expect(stripWhitespace(myCompContent)).toContain(
      stripWhitespace(`
        @Component({
          selector: 'my-comp',
          template: '<my-button>Hello</my-button>',
          imports: [ButtonModule]
        })
      `),
    );
    expect(stripWhitespace(tree.readContent('./should-migrate/module.ts'))).toContain(
      stripWhitespace(`@NgModule({imports: [ButtonModule, MyComp], exports: [MyComp]})`),
    );
    expect(tree.readContent('./do-not-migrate/button.ts')).toContain('standalone: false');
    expect(stripWhitespace(tree.readContent('./do-not-migrate/button.module.ts'))).toContain(
      stripWhitespace(`@NgModule({declarations: [MyButton], exports: [MyButton]})`),
    );
  });

  it('should add imports to dependencies within the same module', async () => {
    writeFile(
      'module.ts',
      `
        import {NgModule} from '@angular/core';
        import {MyComp} from './comp';
        import {MyButton} from './button';
        import {MyTooltip} from './tooltip';

        @NgModule({declarations: [MyComp, MyButton, MyTooltip], exports: [MyComp]})
        export class Mod {}
      `,
    );

    writeFile(
      'comp.ts',
      `
        import {Component} from '@angular/core';

        @Component({selector: 'my-comp', template: '<my-button tooltip="Click me">Hello</my-button>', standalone: false})
        export class MyComp {}
      `,
    );

    writeFile(
      'button.ts',
      `
        import {Component} from '@angular/core';

        @Component({selector: 'my-button', template: '<ng-content></ng-content>', standalone: false})
        export class MyButton {}
      `,
    );

    writeFile(
      'tooltip.ts',
      `
        import {Directive} from '@angular/core';

        @Directive({selector: '[tooltip]', standalone: false})
        export class MyTooltip {}
      `,
    );

    await runMigration('convert-to-standalone');

    const myCompContent = tree.readContent('comp.ts');

    expect(myCompContent).toContain(`import { MyButton } from './button';`);
    expect(myCompContent).toContain(`import { MyTooltip } from './tooltip';`);
    expect(stripWhitespace(myCompContent)).toContain(
      stripWhitespace(`
        @Component({
          selector: 'my-comp',
          template: '<my-button tooltip="Click me">Hello</my-button>',
          imports: [MyButton, MyTooltip]
        })
      `),
    );
    expect(stripWhitespace(tree.readContent('module.ts'))).toContain(
      stripWhitespace(`@NgModule({imports: [MyComp, MyButton, MyTooltip], exports: [MyComp]})`),
    );
    expect(stripWhitespace(tree.readContent('button.ts'))).toContain(
      stripWhitespace(`@Component({selector: 'my-button', template: '<ng-content></ng-content>'})`),
    );
    expect(stripWhitespace(tree.readContent('tooltip.ts'))).toContain(
      stripWhitespace(`@Directive({selector: '[tooltip]'})`),
    );
  });

  it('should add imports to external dependencies', async () => {
    writeFile(
      'module.ts',
      `
      import {NgModule} from '@angular/core';
      import {CommonModule} from '@angular/common';
      import {MyComp, MyOtherComp} from './comp';

      @NgModule({imports: [CommonModule], declarations: [MyComp, MyOtherComp], exports: [MyComp]})
      export class Mod {}
    `,
    );

    writeFile(
      'comp.ts',
      `
      import {Component} from '@angular/core';

      @Component({
        selector: 'my-comp',
        template: \`
          <div *ngFor="let message of messages">
            <span *ngIf="message">{{message}}</span>
          </div>
        \`,
        standalone: false
      })
      export class MyComp {
        messages = ['hello', 'hi'];
      }

      @Component({
        selector: 'my-other-comp',
        template: '<div *ngIf="isShown"></div>',
        standalone: false
      })
      export class MyOtherComp {
        isShown = true;
      }
    `,
    );

    await runMigration('convert-to-standalone');

    const myCompContent = tree.readContent('comp.ts');

    expect(myCompContent).toContain(`import { NgFor, NgIf } from '@angular/common';`);
    expect(stripWhitespace(myCompContent)).toContain(
      stripWhitespace(`
      @Component({
        selector: 'my-comp',
        template: \`
          <div *ngFor="let message of messages">
            <span *ngIf="message">{{message}}</span>
          </div>
        \`,
        imports: [NgFor, NgIf]
      })
    `),
    );
    expect(stripWhitespace(myCompContent)).toContain(
      stripWhitespace(`
      @Component({
        selector: 'my-other-comp',
        template: '<div *ngIf="isShown"></div>',
        imports: [NgIf]
      })
    `),
    );
    expect(stripWhitespace(tree.readContent('module.ts'))).toContain(
      stripWhitespace(
        `@NgModule({imports: [CommonModule, MyComp, MyOtherComp], exports: [MyComp]})`,
      ),
    );
  });

  it('should add imports to pipes that are used in the template', async () => {
    writeFile(
      'module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyComp} from './comp';
      import {MyPipe} from './pipe';

      @NgModule({declarations: [MyComp, MyPipe], exports: [MyComp]})
      export class Mod {}
    `,
    );

    writeFile(
      'comp.ts',
      `
      import {Component} from '@angular/core';

      @Component({selector: 'my-comp', template: '{{"hello" | myPipe}}', standalone: false})
      export class MyComp {}
    `,
    );

    writeFile(
      'pipe.ts',
      `
      import {Pipe} from '@angular/core';

      @Pipe({name: 'myPipe', standalone: false})
      export class MyPipe {
        transform() {}
      }
    `,
    );

    await runMigration('convert-to-standalone');

    const myCompContent = tree.readContent('comp.ts');

    expect(myCompContent).toContain(`import { MyPipe } from './pipe';`);
    expect(stripWhitespace(myCompContent)).toContain(
      stripWhitespace(`
      @Component({
        selector: 'my-comp',
        template: '{{"hello" | myPipe}}',
        imports: [MyPipe]
      })
    `),
    );
    expect(stripWhitespace(tree.readContent('module.ts'))).toContain(
      stripWhitespace(`@NgModule({imports: [MyComp, MyPipe], exports: [MyComp]})`),
    );
    expect(stripWhitespace(tree.readContent('pipe.ts'))).toContain(
      stripWhitespace(`@Pipe({name: 'myPipe'})`),
    );
  });

  it('should migrate tests with an inline NgModule', async () => {
    writeFile(
      'app.spec.ts',
      `
      import {NgModule, Component} from '@angular/core';
      import {TestBed} from '@angular/core/testing';

      describe('bootstrapping an app', () => {
        it('should work', () => {
          @Component({selector: 'hello', template: 'Hello', standalone: false})
          class Hello {}

          @Component({template: '<hello></hello>', standalone: false})
          class App {}

          @NgModule({declarations: [App, Hello], exports: [App, Hello]})
          class Mod {}

          TestBed.configureTestingModule({imports: [Mod]});
          const fixture = TestBed.createComponent(App);
          expect(fixture.nativeElement.innerHTML).toBe('<hello>Hello</hello>');
        });
      });
    `,
    );

    await runMigration('convert-to-standalone');

    const content = stripWhitespace(tree.readContent('app.spec.ts'));

    expect(content).toContain(
      stripWhitespace(`
      @Component({selector: 'hello', template: 'Hello'})
      class Hello {}
    `),
    );

    expect(content).toContain(
      stripWhitespace(`
      @Component({template: '<hello></hello>', imports: [Hello]})
      class App {}
    `),
    );

    expect(content).toContain(
      stripWhitespace(`
      @NgModule({imports: [App, Hello], exports: [App, Hello]})
      class Mod {}
    `),
    );
  });

  it('should migrate tests where the declaration is already standalone', async () => {
    writeFile(
      'comp.ts',
      `
      import {Component} from '@angular/core';

      @Component({selector: 'comp', template: '', standalone: true})
      export class MyComp {}
    `,
    );

    writeFile(
      'app.spec.ts',
      `
      import {TestBed} from '@angular/core/testing';
      import {MyComp} from './comp';

      describe('bootstrapping an app', () => {
        it('should work', () => {
          TestBed.configureTestingModule({declarations: [MyComp]});
          expect(() => TestBed.createComponent(MyComp)).not.toThrow();
        });
      });
    `,
    );

    await runMigration('convert-to-standalone');

    expect(stripWhitespace(tree.readContent('app.spec.ts'))).toContain(
      stripWhitespace(`
      import {TestBed} from '@angular/core/testing';
      import {MyComp} from './comp';

      describe('bootstrapping an app', () => {
        it('should work', () => {
          TestBed.configureTestingModule({imports: [MyComp]});
          expect(() => TestBed.createComponent(MyComp)).not.toThrow();
        });
      });
    `),
    );
  });

  it('should import the module that declares a template dependency', async () => {
    writeFile(
      './should-migrate/module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyComp} from './comp';
      import {ButtonModule} from '../do-not-migrate/button.module';

      @NgModule({imports: [ButtonModule], declarations: [MyComp]})
      export class Mod {}
    `,
    );

    writeFile(
      './should-migrate/comp.ts',
      `
      import {Component} from '@angular/core';

      @Component({selector: 'my-comp', template: '<my-button>Hello</my-button>', standalone: false})
      export class MyComp {}
    `,
    );

    writeFile(
      './do-not-migrate/button.module.ts',
      `
      import {NgModule, forwardRef} from '@angular/core';
      import {MyButton} from './button';

      @NgModule({
        imports: [forwardRef(() => ButtonModule)],
        exports: [forwardRef(() => ButtonModule)]
      })
      export class ExporterModule {}

      @NgModule({declarations: [MyButton], exports: [MyButton]})
      export class ButtonModule {}
    `,
    );

    writeFile(
      './do-not-migrate/button.ts',
      `
      import {Component} from '@angular/core';

      @Component({selector: 'my-button', template: '<ng-content></ng-content>', standalone: false})
      export class MyButton {}
    `,
    );

    await runMigration('convert-to-standalone', './should-migrate');

    const myCompContent = tree.readContent('./should-migrate/comp.ts');
    expect(myCompContent).toContain(
      `import { ButtonModule } from '../do-not-migrate/button.module';`,
    );
    expect(myCompContent).toContain('imports: [ButtonModule]');
  });

  it('should not reference internal modules', async () => {
    writeFile(
      './should-migrate/module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyComp} from './comp';
      import {ɵButtonModule} from '../do-not-migrate/button.module';

      @NgModule({imports: [ɵButtonModule], declarations: [MyComp]})
      export class Mod {}
    `,
    );

    writeFile(
      './should-migrate/comp.ts',
      `
      import {Component} from '@angular/core';

      @Component({selector: 'my-comp', template: '<my-button>Hello</my-button>', standalone: false})
      export class MyComp {}
    `,
    );

    writeFile(
      './do-not-migrate/button.module.ts',
      `
      import {NgModule, forwardRef} from '@angular/core';
      import {MyButton} from './button';

      @NgModule({
        imports: [forwardRef(() => ɵButtonModule)],
        exports: [forwardRef(() => ɵButtonModule)]
      })
      export class ExporterModule {}

      @NgModule({declarations: [MyButton], exports: [MyButton]})
      export class ɵButtonModule {}
    `,
    );

    writeFile(
      './do-not-migrate/button.ts',
      `
      import {Component} from '@angular/core';

      @Component({selector: 'my-button', template: '<ng-content></ng-content>', standalone: false})
      export class MyButton {}
    `,
    );

    await runMigration('convert-to-standalone', './should-migrate');

    const myCompContent = tree.readContent('./should-migrate/comp.ts');
    expect(myCompContent).toContain(
      `import { ExporterModule } from '../do-not-migrate/button.module';`,
    );
    expect(myCompContent).toContain('imports: [ExporterModule]');
  });

  it('should migrate tests with a component declared through TestBed', async () => {
    writeFile(
      'app.spec.ts',
      `
      import {NgModule, Component} from '@angular/core';
      import {TestBed} from '@angular/core/testing';
      import {ButtonModule} from './button.module';
      import {MatCardModule} from '@angular/material/card';

      describe('bootstrapping an app', () => {
        it('should work', () => {
          TestBed.configureTestingModule({
            declarations: [App, Hello],
            imports: [ButtonModule, MatCardModule]
          });
          const fixture = TestBed.createComponent(App);
          expect(fixture.nativeElement.innerHTML).toBe('<hello>Hello</hello>');
        });

        it('should work in a different way', () => {
          TestBed.configureTestingModule({declarations: [App, Hello], imports: [MatCardModule]});
          const fixture = TestBed.createComponent(App);
          expect(fixture.nativeElement.innerHTML).toBe('<hello>Hello</hello>');
        });
      });

      @Component({selector: 'hello', template: 'Hello', standalone: false})
      class Hello {}

      @Component({template: '<hello></hello>', standalone: false})
      class App {}
    `,
    );

    await runMigration('convert-to-standalone');

    const content = stripWhitespace(tree.readContent('app.spec.ts'));

    expect(content).toContain(
      stripWhitespace(`
      @Component({
        selector: 'hello',
        template: 'Hello',
        imports: [ButtonModule, MatCardModule]
      })
      class Hello {}
    `),
    );

    expect(content).toContain(
      stripWhitespace(`
      @Component({
        template: '<hello></hello>',
        imports: [ButtonModule, MatCardModule]
      })
      class App {}
    `),
    );

    expect(content).toContain(
      stripWhitespace(`
      it('should work', () => {
        TestBed.configureTestingModule({
          imports: [ButtonModule, MatCardModule, App, Hello]
        });
        const fixture = TestBed.createComponent(App);
        expect(fixture.nativeElement.innerHTML).toBe('<hello>Hello</hello>');
      });
    `),
    );

    expect(content).toContain(
      stripWhitespace(`
      it('should work in a different way', () => {
        TestBed.configureTestingModule({imports: [MatCardModule, App, Hello]});
        const fixture = TestBed.createComponent(App);
        expect(fixture.nativeElement.innerHTML).toBe('<hello>Hello</hello>');
      });
    `),
    );
  });

  it('should not add ModuleWithProviders imports to the `imports` in a test', async () => {
    writeFile(
      'app.spec.ts',
      `
      import {NgModule, Component} from '@angular/core';
      import {TestBed} from '@angular/core/testing';
      import {MatCardModule} from '@angular/material/card';

      describe('bootstrapping an app', () => {
        it('should work', () => {
          TestBed.configureTestingModule({
            declarations: [App],
            imports: [MatCardModule.forRoot({})]
          });
          const fixture = TestBed.createComponent(App);
          expect(fixture.nativeElement.innerHTML).toBe('hello');
        });
      });

      @Component({template: 'hello', standalone: false})
      class App {}
    `,
    );

    await runMigration('convert-to-standalone');

    const content = stripWhitespace(tree.readContent('app.spec.ts'));

    expect(content).toContain(
      stripWhitespace(`
      @Component({template: 'hello'})
      class App {}
    `),
    );

    expect(content).toContain(
      stripWhitespace(`
      it('should work', () => {
        TestBed.configureTestingModule({
          imports: [MatCardModule.forRoot({}), App]
        });
        const fixture = TestBed.createComponent(App);
        expect(fixture.nativeElement.innerHTML).toBe('hello');
      });
    `),
    );
  });

  it('should not change testing objects with no declarations', async () => {
    const initialContent = `
      import {NgModule, Component} from '@angular/core';
      import {TestBed} from '@angular/core/testing';
      import {ButtonModule} from './button.module';
      import {MatCardModule} from '@angular/material/card';

      describe('bootstrapping an app', () => {
        it('should work', () => {
          TestBed.configureTestingModule({
            imports: [ButtonModule, MatCardModule]
          });
          const fixture = TestBed.createComponent(App);
          expect(fixture.nativeElement.innerHTML).toBe('<hello>Hello</hello>');
        });
      });

      @Component({template: 'hello', standalone: false})
      class App {}
    `;

    writeFile('app.spec.ts', initialContent);

    await runMigration('convert-to-standalone');

    expect(tree.readContent('app.spec.ts')).toBe(initialContent);
  });

  [
    {name: 'plain', path: 'some_internal_path/angular/testing/catalyst'},
    {name: 'fakeAsync', path: 'some_internal_path/angular/testing/catalyst/fake_async'},
    {name: 'async', path: 'some_internal_path/angular/testing/catalyst/async'},
  ].forEach(({name, path}) => {
    it(`[${name}] should migrate tests with a component declared through Catalyst`, async () => {
      writeFile(
        'app.spec.ts',
        `
        import {NgModule, Component} from '@angular/core';
        import {bootstrapTemplate, setupModule} from '${path}';
        import {ButtonModule} from './button.module';
        import {MatCardModule} from '@angular/material/card';

        describe('bootstrapping an app', () => {
          it('should work', () => {
            setupModule({
              declarations: [App, Hello],
              imports: [ButtonModule, MatCardModule]
            });
            const fixture = bootstrapTemplate(App);
            expect(fixture.nativeElement.innerHTML).toBe('<hello>Hello</hello>');
          });

          it('should work in a different way', () => {
            setupModule({declarations: [App, Hello], imports: [MatCardModule]});
            const fixture = bootstrapTemplate(App);
            expect(fixture.nativeElement.innerHTML).toBe('<hello>Hello</hello>');
          });
        });

        @Component({selector: 'hello', template: 'Hello', standalone: false})
        class Hello {}

        @Component({template: '<hello></hello>', standalone: false})
        class App {}
      `,
      );

      await runMigration('convert-to-standalone');

      const content = stripWhitespace(tree.readContent('app.spec.ts'));

      expect(content).toContain(
        stripWhitespace(`
        @Component({
          selector: 'hello',
          template: 'Hello',
          imports: [ButtonModule, MatCardModule]
        })
        class Hello {}
      `),
      );

      expect(content).toContain(
        stripWhitespace(`
        @Component({
          template: '<hello></hello>',
          imports: [ButtonModule, MatCardModule]
        })
        class App {}
      `),
      );

      expect(content).toContain(
        stripWhitespace(`
        it('should work', () => {
          setupModule({
            imports: [ButtonModule, MatCardModule, App, Hello]
          });
          const fixture = bootstrapTemplate(App);
          expect(fixture.nativeElement.innerHTML).toBe('<hello>Hello</hello>');
        });
      `),
      );

      expect(content).toContain(
        stripWhitespace(`
        it('should work in a different way', () => {
          setupModule({imports: [MatCardModule, App, Hello]});
          const fixture = bootstrapTemplate(App);
          expect(fixture.nativeElement.innerHTML).toBe('<hello>Hello</hello>');
        });
      `),
      );
    });
  });

  it('should not copy over the NoopAnimationsModule into the imports of a test component', async () => {
    writeFile(
      'app.spec.ts',
      `
          import {NgModule, Component} from '@angular/core';
          import {TestBed} from '@angular/core/testing';
          import {MatCardModule} from '@angular/material/card';
          import {NoopAnimationsModule} from '@angular/platform-browser/animations';

          describe('bootstrapping an app', () => {
            it('should work', () => {
              TestBed.configureTestingModule({
                imports: [MatCardModule, NoopAnimationsModule],
                declarations: [App]
              });
              const fixture = TestBed.createComponent(App);
              expect(fixture.nativeElement.innerHTML).toBe('<hello>Hello</hello>');
            });
          });

          @Component({template: 'hello'})
          class App {}
        `,
    );

    await runMigration('convert-to-standalone');

    const content = stripWhitespace(tree.readContent('app.spec.ts'));

    expect(content).toContain(
      stripWhitespace(`
          TestBed.configureTestingModule({
            imports: [MatCardModule, NoopAnimationsModule, App]
          });
        `),
    );
    expect(content).toContain(
      stripWhitespace(`
          @Component({template: 'hello', imports: [MatCardModule]})
          class App {}
        `),
    );
  });

  it('should not copy over the BrowserAnimationsModule into the imports of a test component', async () => {
    writeFile(
      'app.spec.ts',
      `
          import {NgModule, Component} from '@angular/core';
          import {TestBed} from '@angular/core/testing';
          import {MatCardModule} from '@angular/material/card';
          import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

          describe('bootstrapping an app', () => {
            it('should work', () => {
              TestBed.configureTestingModule({
                imports: [MatCardModule, BrowserAnimationsModule],
                declarations: [App]
              });
              const fixture = TestBed.createComponent(App);
              expect(fixture.nativeElement.innerHTML).toBe('<hello>Hello</hello>');
            });
          });

          @Component({template: 'hello', standalone: false})
          class App {}
        `,
    );

    await runMigration('convert-to-standalone');

    const content = stripWhitespace(tree.readContent('app.spec.ts'));

    expect(content).toContain(
      stripWhitespace(`
          TestBed.configureTestingModule({
            imports: [MatCardModule, BrowserAnimationsModule, App]
          });
        `),
    );
    expect(content).toContain(
      stripWhitespace(`
          @Component({template: 'hello', imports: [MatCardModule]})
          class App {}
        `),
    );
  });

  it('should not move declarations that are not being migrated out of the declarations array', async () => {
    const appComponentContent = `
        import {Component} from '@angular/core';

        @Component({selector: 'app', template: '', standalone: false})
        export class AppComponent {}
      `;

    const appModuleContent = `
        import {NgModule} from '@angular/core';
        import {AppComponent} from './app.component';

        @NgModule({declarations: [AppComponent], bootstrap: [AppComponent]})
        export class AppModule {}
      `;

    writeFile('app.component.ts', appComponentContent);
    writeFile('app.module.ts', appModuleContent);

    writeFile(
      'app.spec.ts',
      `
        import {Component} from '@angular/core';
        import {TestBed} from '@angular/core/testing';
        import {ButtonModule} from './button.module';
        import {MatCardModule} from '@angular/material/card';
        import {AppComponent} from './app.component';

        describe('bootstrapping an app', () => {
          it('should work', () => {
            TestBed.configureTestingModule({
              declarations: [AppComponent, TestComp],
              imports: [ButtonModule, MatCardModule]
            });
            const fixture = TestBed.createComponent(App);
            expect(fixture.nativeElement.innerHTML).toBe('');
          });
        });

        @Component({template: '', standalone: false})
        class TestComp {}
      `,
    );

    await runMigration('convert-to-standalone');

    const testContent = stripWhitespace(tree.readContent('app.spec.ts'));

    expect(tree.readContent('app.module.ts')).toBe(appModuleContent);
    expect(tree.readContent('app.component.ts')).toBe(appComponentContent);
    expect(testContent).toContain(
      stripWhitespace(`
        it('should work', () => {
          TestBed.configureTestingModule({
            declarations: [AppComponent],
            imports: [ButtonModule, MatCardModule, TestComp]
          });
          const fixture = TestBed.createComponent(App);
          expect(fixture.nativeElement.innerHTML).toBe('');
        });
      `),
    );
    expect(testContent).toContain(
      stripWhitespace(`
        @Component({
          template: '',
          imports: [ButtonModule, MatCardModule]
        })
        class TestComp {}
      `),
    );
  });

  it('should not migrate `configureTestingModule` with a non-array expression in the `declarations` field', async () => {
    const initialContent = `
          import {NgModule, Component} from '@angular/core';
          import {TestBed} from '@angular/core/testing';
          import {ButtonModule} from './button.module';
          import {MatCardModule} from '@angular/material/card';

          function setup(declarations: any[], imports: any[]) {
            TestBed.configureTestingModule({
              declarations: declarations,
              imports,
            });
            return TestBed.createComponent(App);
          }

          describe('bootstrapping an app', () => {
            it('should work', () => {
              const fixture = setup([App, Hello], [ButtonModule, MatCardModule]);
              expect(fixture.nativeElement.innerHTML).toBe('<hello>Hello</hello>');
            });

            it('should work in a different way', () => {
              const fixture = setup([App, Hello], [MatCardModule]);
              expect(fixture.nativeElement.innerHTML).toBe('<hello>Hello</hello>');
            });
          });

          @Component({selector: 'hello', template: 'Hello'})
          class Hello {}

          @Component({template: '<hello></hello>'})
          class App {}
        `;

    writeFile('app.spec.ts', initialContent);

    await runMigration('convert-to-standalone');

    expect(tree.readContent('app.spec.ts')).toBe(initialContent);
  });

  it('should not migrate modules with a `bootstrap` array', async () => {
    const initialModule = `
      import {NgModule, Component} from '@angular/core';

      @Component({selector: 'root-comp', template: 'hello'})
      export class RootComp {}

      @NgModule({declarations: [RootComp], bootstrap: [RootComp]})
      export class Mod {}
    `;

    writeFile('module.ts', initialModule);

    await runMigration('convert-to-standalone');

    expect(tree.readContent('module.ts')).toBe(initialModule);
  });

  it('should migrate a module with an empty `bootstrap` array', async () => {
    writeFile(
      'module.ts',
      `
      import {NgModule, Component} from '@angular/core';

      @Component({selector: 'root-comp', template: 'hello', standalone: false})
      export class RootComp {}

      @NgModule({declarations: [RootComp], bootstrap: []})
      export class Mod {}
    `,
    );

    await runMigration('convert-to-standalone');

    expect(stripWhitespace(tree.readContent('module.ts'))).toBe(
      stripWhitespace(`
      import {NgModule, Component} from '@angular/core';

      @Component({selector: 'root-comp', template: 'hello'})
      export class RootComp {}

      @NgModule({imports: [RootComp], bootstrap: []})
      export class Mod {}
    `),
    );
  });

  it('should migrate declarations that are not being bootstrapped in a root module', async () => {
    writeFile(
      'dir.ts',
      `
      import {Directive} from '@angular/core';

      @Directive({selector: '[foo]', standalone: false})
      export class MyDir {}
    `,
    );

    writeFile(
      'module.ts',
      `
      import {NgModule, Component} from '@angular/core';
      import {MyDir} from './dir';

      @Component({selector: 'root-comp', template: 'hello', standalone: false})
      export class RootComp {}

      @NgModule({declarations: [RootComp, MyDir], bootstrap: [RootComp]})
      export class Mod {}
    `,
    );

    await runMigration('convert-to-standalone');

    expect(stripWhitespace(tree.readContent('dir.ts'))).toBe(
      stripWhitespace(`
      import {Directive} from '@angular/core';

      @Directive({selector: '[foo]'})
      export class MyDir {}
    `),
    );

    expect(stripWhitespace(tree.readContent('module.ts'))).toBe(
      stripWhitespace(`
      import {NgModule, Component} from '@angular/core';
      import {MyDir} from './dir';

      @Component({selector: 'root-comp', template: 'hello', standalone: false})
      export class RootComp {}

      @NgModule({imports: [MyDir], declarations: [RootComp], bootstrap: [RootComp]})
      export class Mod {}
    `),
    );
  });

  it('should generate a forwardRef for forward reference within the same file', async () => {
    writeFile(
      'decls.ts',
      `
      import {Component, Directive} from '@angular/core';

      @Component({
        selector: 'comp',
        template: '<div my-dir></div>',
        standalone: false
      })
      export class MyComp {}

      @Directive({selector: '[my-dir]', standalone: false})
      export class MyDir {}
    `,
    );

    writeFile(
      'module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyComp, MyDir} from './decls';

      @NgModule({declarations: [MyComp, MyDir]})
      export class Mod {}
    `,
    );

    await runMigration('convert-to-standalone');

    expect(stripWhitespace(tree.readContent('decls.ts'))).toEqual(
      stripWhitespace(`
      import {Component, Directive, forwardRef} from '@angular/core';

      @Component({
        selector: 'comp',
        template: '<div my-dir></div>',
        imports: [forwardRef(() => MyDir)]
      })
      export class MyComp {}

      @Directive({selector: '[my-dir]'})
      export class MyDir {}
    `),
    );
  });

  it('should not generate a forwardRef for a self import', async () => {
    writeFile(
      'decls.ts',
      `
      import {Component} from '@angular/core';

      @Component({
        selector: 'comp',
        template: '<comp/>',
        standalone: false,
      })
      export class MyComp {}
    `,
    );

    writeFile(
      'module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyComp} from './decls';

      @NgModule({declarations: [MyComp]})
      export class Mod {}
    `,
    );

    await runMigration('convert-to-standalone');

    expect(stripWhitespace(tree.readContent('decls.ts'))).toEqual(
      stripWhitespace(`
      import {Component} from '@angular/core';

      @Component({
        selector: 'comp',
        template: '<comp/>',
      })
      export class MyComp {}
    `),
    );
  });

  it('should not generate a forwardRef when adding an imported module dependency', async () => {
    writeFile(
      './comp.ts',
      `
      import {Component, NgModule} from '@angular/core';
      import {RouterModule} from '@angular/router';

      @Component({
        selector: 'comp',
        template: '<div routerLink="/"></div>',
        standalone: false
      })
      export class MyComp {}

      @NgModule({imports: [RouterModule], declarations: [MyComp]})
      export class Mod {}
    `,
    );

    await runMigration('convert-to-standalone');

    expect(stripWhitespace(tree.readContent('comp.ts'))).toEqual(
      stripWhitespace(`
      import {Component, NgModule} from '@angular/core';
      import {RouterModule} from '@angular/router';

      @Component({
        selector: 'comp',
        template: '<div routerLink="/"></div>',
        imports: [RouterModule]
      })
      export class MyComp {}

      @NgModule({imports: [RouterModule, MyComp]})
      export class Mod {}
    `),
    );
  });

  it('should not duplicate doc strings', async () => {
    writeFile(
      'module.ts',
      `
      import {NgModule, Directive} from '@angular/core';

      /** Directive used for testing. */
      @Directive({selector: '[dir]', standalone: false})
      export class MyDir {}

      /** Module used for testing. */
      @NgModule({declarations: [MyDir]})
      export class Mod {}
    `,
    );

    await runMigration('convert-to-standalone');

    expect(stripWhitespace(tree.readContent('module.ts'))).toBe(
      stripWhitespace(`
      import {NgModule, Directive} from '@angular/core';

      /** Directive used for testing. */
      @Directive({selector: '[dir]'})
      export class MyDir {}

      /** Module used for testing. */
      @NgModule({imports: [MyDir]})
      export class Mod {}
    `),
    );
  });

  it('should use the generated alias if a conflicting symbol already exists', async () => {
    writeFile(
      'module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyComp} from './comp';
      import {MyButton} from './button';

      @NgModule({declarations: [MyComp, MyButton], exports: [MyComp]})
      export class Mod {}
    `,
    );

    writeFile(
      'comp.ts',
      `
      import {Component} from '@angular/core';
      import {MyButton} from '@external/button';

      MyButton.sayHello();

      @Component({selector: 'my-comp', template: '<my-button>Hello</my-button>', standalone: false})
      export class MyComp {}
    `,
    );

    writeFile(
      'button.ts',
      `
      import {Component} from '@angular/core';

      @Component({selector: 'my-button', template: '<ng-content></ng-content>', standalone: false})
      export class MyButton {}
    `,
    );

    await runMigration('convert-to-standalone');

    expect(stripWhitespace(tree.readContent('comp.ts'))).toBe(
      stripWhitespace(`
      import {Component} from '@angular/core';
      import {MyButton} from '@external/button';
      import {MyButton as MyButton_1} from './button';

      MyButton.sayHello();

      @Component({
        selector: 'my-comp', template: '<my-button>Hello</my-button>',
        imports: [MyButton_1]
      })
      export class MyComp {}
    `),
    );
  });

  it('should preserve the trailing comma when adding an `imports` array', async () => {
    writeFile(
      'module.ts',
      `
      import {NgModule, Directive} from '@angular/core';

      @Directive({selector: '[dir]', standalone: false})
      export class MyDir {}

      @NgModule({
        declarations: [MyDir],
        exports: [MyDir],
      })
      export class Mod {}
    `,
    );

    await runMigration('convert-to-standalone');

    expect(stripWhitespace(tree.readContent('module.ts'))).toContain(
      stripWhitespace(`
      @NgModule({
        imports: [MyDir],
        exports: [MyDir],
      })
    `),
    );
  });

  it('should preserve the trailing comma when adding to an existing `imports` array', async () => {
    writeFile(
      'module.ts',
      `
      import {NgModule, Directive} from '@angular/core';
      import {CommonModule} from '@angular/common';
      import {RouterModule} from '@angular/router';

      @Directive({selector: '[dir]', standalone: false})
      export class MyDir {}

      @NgModule({
        imports: [
          CommonModule,
          RouterModule,
        ],
        declarations: [MyDir],
        exports: [MyDir],
      })
      export class Mod {}
    `,
    );

    await runMigration('convert-to-standalone');

    expect(stripWhitespace(tree.readContent('module.ts'))).toContain(
      stripWhitespace(`
      @NgModule({
        imports: [
          CommonModule,
          RouterModule,
          MyDir,
        ],
        exports: [MyDir],
      })
    `),
    );
  });

  it('should preserve the trailing comma when marking a directive as standalone', async () => {
    writeFile(
      'module.ts',
      `
      import {NgModule, Directive} from '@angular/core';

      @Directive({
        selector: '[dir]',
        exportAs: 'dir',
        standalone: false,
      })
      export class MyDir {}

      @NgModule({declarations: [MyDir]})
      export class Mod {}
    `,
    );

    await runMigration('convert-to-standalone');

    expect(stripWhitespace(tree.readContent('module.ts'))).toContain(
      stripWhitespace(`
      @Directive({
        selector: '[dir]',
        exportAs: 'dir',
      })
    `),
    );
  });

  it('should add a trailing comma when generating an imports array in a component', async () => {
    writeFile(
      'module.ts',
      `
      import {NgModule, Directive, Component} from '@angular/core';

      @Directive({selector: '[dir-one]', standalone: false})
      export class DirOne {}

      @Directive({selector: '[dir-two]', standalone: false})
      export class DirTwo {}

      @Directive({selector: '[dir-three]', standalone: false})
      export class DirThree {}

      @Component({
        selector: 'my-comp',
        template: '<div dir-one dir-two dir-three></div>',
        standalone: false,
      })
      export class MyComp {}

      @NgModule({declarations: [DirOne, DirTwo, DirThree, MyComp]})
      export class Mod {}
    `,
    );

    await runMigration('convert-to-standalone');

    expect(stripWhitespace(tree.readContent('module.ts'))).toContain(
      stripWhitespace(`
      @Component({
        selector: 'my-comp',
        template: '<div dir-one dir-two dir-three></div>',
        imports: [
          DirOne,
          DirTwo,
          DirThree,
        ],
      })
    `),
    );
  });

  it('should handle a directive that is explicitly standalone: false', async () => {
    writeFile(
      'module.ts',
      `
      import {NgModule, Directive} from '@angular/core';

      @Directive({selector: '[dir]', standalone: false})
      export class MyDir {}

      @NgModule({declarations: [MyDir], exports: [MyDir]})
      export class Mod {}
    `,
    );

    await runMigration('convert-to-standalone');

    const result = tree.readContent('module.ts');

    expect(stripWhitespace(result)).toContain(stripWhitespace(`@Directive({selector: '[dir]'})`));
    expect(stripWhitespace(result)).toContain(
      stripWhitespace(`@NgModule({imports: [MyDir], exports: [MyDir]})`),
    );
  });

  it('should remove a module that only has imports and exports', async () => {
    writeFile(
      'app.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyComp} from './comp';
      import {ButtonModule} from './button.module';

      @NgModule({imports: [ButtonModule], declarations: [MyComp], exports: [ButtonModule, MyComp]})
      export class AppModule {}
    `,
    );

    writeFile(
      'button.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyButton} from './button';

      @NgModule({imports: [MyButton], exports: [MyButton]})
      export class ButtonModule {}
    `,
    );

    writeFile(
      'comp.ts',
      `
      import {Component} from '@angular/core';

      @Component({selector: 'my-comp', template: '<my-button>Hello</my-button>', standalone: false})
      export class MyComp {}
    `,
    );

    writeFile(
      'button.ts',
      `
      import {Component} from '@angular/core';

      @Component({selector: 'my-button', template: '<ng-content></ng-content>', standalone: true})
      export class MyButton {}
    `,
    );

    await runMigration('prune-ng-modules');

    const appModule = tree.readContent('app.module.ts');

    expect(tree.exists('button.module.ts')).toBe(false);
    expect(appModule).not.toContain('ButtonModule');
    expect(stripWhitespace(appModule)).toContain(
      stripWhitespace(`
      @NgModule({imports: [], declarations: [MyComp], exports: [MyComp]})
      export class AppModule {}
    `),
    );
  });

  it('should not remove a module that has declarations', async () => {
    const initialAppModule = `
      import {NgModule} from '@angular/core';
      import {MyComp} from './comp';
      import {ButtonModule} from './button.module';

      @NgModule({declarations: [MyComp]})
      export class AppModule {}
    `;

    writeFile('app.module.ts', initialAppModule);
    writeFile(
      'comp.ts',
      `
      import {Component} from '@angular/core';

      @Component({selector: 'my-comp', template: 'Hello', standalone: false})
      export class MyComp {}
    `,
    );

    await runMigration('prune-ng-modules');

    expect(tree.readContent('app.module.ts')).toBe(initialAppModule);
  });

  it('should not remove a module that bootstraps a component', async () => {
    const initialAppModule = `
      import {NgModule} from '@angular/core';
      import {MyComp} from './comp';
      import {ButtonModule} from './button.module';

      @NgModule({bootstrap: [MyComp]})
      export class AppModule {}
    `;

    writeFile('app.module.ts', initialAppModule);
    writeFile(
      'comp.ts',
      `
      import {Component} from '@angular/core';

      @Component({selector: 'my-comp', template: 'Hello', standalone: false})
      export class MyComp {}
    `,
    );

    await runMigration('prune-ng-modules');

    expect(tree.readContent('app.module.ts')).toBe(initialAppModule);
  });

  it('should not remove a module that has providers', async () => {
    const initialAppModule = `
      import {NgModule, InjectionToken} from '@angular/core';

      const token = new InjectionToken('token');

      @NgModule({providers: [{provide: token, useValue: 123}]})
      export class AppModule {}
    `;

    writeFile('app.module.ts', initialAppModule);

    await runMigration('prune-ng-modules');

    expect(tree.readContent('app.module.ts')).toBe(initialAppModule);
  });

  it('should not remove a module that imports a ModuleWithProviders', async () => {
    const initialAppModule = `
      import {NgModule} from '@angular/core';
      import {RouterModule} from '@angular/router';

      @NgModule({imports: [RouterModule.forRoot([])]})
      export class RoutingModule {}
    `;

    writeFile('app.module.ts', initialAppModule);

    await runMigration('prune-ng-modules');

    expect(tree.readContent('app.module.ts')).toBe(initialAppModule);
  });

  it('should not remove a module that has class members', async () => {
    const initialAppModule = `
      import {NgModule} from '@angular/core';
      import {ButtonModule} from './button.module';

      @NgModule()
      export class AppModule {
        sum(a: number, b: number) {
          return a + b;
        }
      }
    `;

    writeFile('app.module.ts', initialAppModule);
    await runMigration('prune-ng-modules');

    expect(tree.readContent('app.module.ts')).toBe(initialAppModule);
  });

  it('should remove a module that only has an empty constructor', async () => {
    writeFile(
      'app.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {ButtonModule} from './button.module';

      @NgModule()
      export class AppModule {
        constructor() {
        }
      }
    `,
    );
    await runMigration('prune-ng-modules');

    expect(tree.exists('app.module.ts')).toBe(false);
  });

  it('should remove a module with no arguments passed into NgModule', async () => {
    writeFile(
      'app.module.ts',
      `
      import {NgModule} from '@angular/core';

      @NgModule()
      export class AppModule {}
    `,
    );
    await runMigration('prune-ng-modules');

    expect(tree.exists('app.module.ts')).toBe(false);
  });

  it('should remove a module file where there is unexported code', async () => {
    writeFile(
      'app.module.ts',
      `
      import {NgModule} from '@angular/core';

      const ONE = 1;
      const TWO = 2;

      console.log(ONE + TWO);

      @NgModule()
      export class AppModule {}
    `,
    );
    await runMigration('prune-ng-modules');

    expect(tree.exists('app.module.ts')).toBe(false);
  });

  it('should remove a module that passes empty arrays into `declarations`, `providers` and `bootstrap`', async () => {
    writeFile(
      'app.module.ts',
      `
          import {NgModule} from '@angular/core';
          import {ButtonModule} from './button.module';

          @NgModule({declarations: [], providers: [], bootstrap: []})
          export class AppModule {}
        `,
    );
    await runMigration('prune-ng-modules');

    expect(tree.exists('app.module.ts')).toBe(false);
  });

  it('should remove a chain of modules that all depend on each other', async () => {
    writeFile(
      'a.module.ts',
      `
      import {NgModule} from '@angular/core';

      @NgModule({})
      export class ModuleA {}
    `,
    );

    writeFile(
      'b.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {ModuleA} from './a.module';

      @NgModule({imports: [ModuleA]})
      export class ModuleB {}
    `,
    );

    writeFile(
      'c.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {ModuleB} from './b.module';

      @NgModule({imports: [ModuleB]})
      export class ModuleC {}
    `,
    );

    writeFile(
      'app.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyDir} from './dir';
      import {ModuleC} from './c.module';

      @NgModule({imports: [ModuleC], declarations: [MyDir]})
      export class AppModule {}
    `,
    );

    writeFile(
      'dir.ts',
      `
      import {Directive} from '@angular/core';

      @Directive({selector: '[myDir]'})
      export class MyDir {}
    `,
    );

    await runMigration('prune-ng-modules');

    const appModule = tree.readContent('app.module.ts');

    expect(tree.exists('a.module.ts')).toBe(false);
    expect(tree.exists('b.module.ts')).toBe(false);
    expect(tree.exists('c.module.ts')).toBe(false);
    expect(appModule).not.toContain('ModuleC');
    expect(stripWhitespace(appModule)).toContain(
      stripWhitespace(`
      @NgModule({imports: [], declarations: [MyDir]})
      export class AppModule {}
    `),
    );
  });

  it('should not remove a chain of modules if a module in the chain cannot be removed because it has providers', async () => {
    const moduleAContent = `
          import {NgModule, InjectionToken} from '@angular/core';

          export const token = new InjectionToken<any>('token');

          @NgModule({providers: [{provide: token, useValue: 123}]})
          export class ModuleA {}
        `;

    const moduleBContent = `
          import {NgModule} from '@angular/core';
          import {ModuleA} from './a.module';

          @NgModule({imports: [ModuleA]})
          export class ModuleB {}
        `;

    const moduleCContent = `
          import {NgModule} from '@angular/core';
          import {ModuleB} from './b.module';

          @NgModule({imports: [ModuleB]})
          export class ModuleC {}
        `;

    const appModuleContent = `
          import {NgModule} from '@angular/core';
          import {MyDir} from './dir';
          import {ModuleC} from './c.module';

          @NgModule({imports: [ModuleC], declarations: [MyDir]})
          export class AppModule {}
        `;

    writeFile('a.module.ts', moduleAContent);
    writeFile('b.module.ts', moduleBContent);
    writeFile('c.module.ts', moduleCContent);
    writeFile('app.module.ts', appModuleContent);
    writeFile(
      'dir.ts',
      `
          import {Directive} from '@angular/core';

          @Directive({selector: '[myDir]'})
          export class MyDir {}
        `,
    );

    await runMigration('prune-ng-modules');

    expect(tree.readContent('a.module.ts')).toBe(moduleAContent);
    expect(tree.readContent('b.module.ts')).toBe(moduleBContent);
    expect(tree.readContent('c.module.ts')).toBe(moduleCContent);
    expect(tree.readContent('app.module.ts')).toBe(appModuleContent);
  });

  it('should not remove a chain of modules if a module in the chain cannot be removed because it is importing a ModuleWithProviders', async () => {
    const moduleAContent = `
          import {NgModule} from '@angular/core';

          @NgModule({imports: [RouterModule.forRoot([{path: '/foo'}])]})
          export class ModuleA {}
        `;

    const moduleBContent = `
          import {NgModule} from '@angular/core';
          import {ModuleA} from './a.module';

          @NgModule({imports: [ModuleA]})
          export class ModuleB {}
        `;

    const moduleCContent = `
          import {NgModule} from '@angular/core';
          import {ModuleB} from './b.module';

          @NgModule({imports: [ModuleB]})
          export class ModuleC {}
        `;

    const appModuleContent = `
          import {NgModule} from '@angular/core';
          import {MyDir} from './dir';
          import {ModuleC} from './c.module';

          @NgModule({imports: [ModuleC], declarations: [MyDir]})
          export class AppModule {}
        `;

    writeFile('a.module.ts', moduleAContent);
    writeFile('b.module.ts', moduleBContent);
    writeFile('c.module.ts', moduleCContent);
    writeFile('app.module.ts', appModuleContent);
    writeFile(
      'dir.ts',
      `
          import {Directive} from '@angular/core';

          @Directive({selector: '[myDir]'})
          export class MyDir {}
        `,
    );

    await runMigration('prune-ng-modules');

    expect(tree.readContent('a.module.ts')).toBe(moduleAContent);
    expect(tree.readContent('b.module.ts')).toBe(moduleBContent);
    expect(tree.readContent('c.module.ts')).toBe(moduleCContent);
    expect(tree.readContent('app.module.ts')).toBe(appModuleContent);
  });

  it('should not remove the module file if it contains other exported code', async () => {
    writeFile(
      'app.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyComp} from './comp';
      import {sum, ButtonModule, multiply} from './button.module';

      @NgModule({imports: [ButtonModule], declarations: [MyComp], exports: [ButtonModule, MyComp]})
      export class AppModule {}

      console.log(sum(1, 2), multiply(3, 4));
    `,
    );

    writeFile(
      'button.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyButton} from './button';

      export function sum(a: number, b: number) {
        return a + b;
      }

      @NgModule({imports: [MyButton], exports: [MyButton]})
      export class ButtonModule {}

      export function multiply(a: number, b: number) {
        return a * b;
      }
    `,
    );

    writeFile(
      'comp.ts',
      `
      import {Component} from '@angular/core';

      @Component({selector: 'my-comp', template: '<my-button>Hello</my-button>'})
      export class MyComp {}
    `,
    );

    writeFile(
      'button.ts',
      `
      import {Component} from '@angular/core';

      @Component({selector: 'my-button', template: '<ng-content></ng-content>', standalone: true})
      export class MyButton {}
    `,
    );

    await runMigration('prune-ng-modules');

    expect(stripWhitespace(tree.readContent('button.module.ts'))).toBe(
      stripWhitespace(`
      import {NgModule} from '@angular/core';
      import {MyButton} from './button';

      export function sum(a: number, b: number) {
        return a + b;
      }

      export function multiply(a: number, b: number) {
        return a * b;
      }
    `),
    );
    expect(stripWhitespace(tree.readContent('app.module.ts'))).toBe(
      stripWhitespace(`
      import {NgModule} from '@angular/core';
      import {MyComp} from './comp';
      import {sum, multiply} from './button.module';

      @NgModule({imports: [], declarations: [MyComp], exports: [MyComp]})
      export class AppModule {}

      console.log(sum(1, 2), multiply(3, 4));
    `),
    );
  });

  it('should delete a file that contains multiple modules that are being deleted', async () => {
    writeFile(
      'app.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyComp} from './comp';
      import {ButtonModule, TooltipModule} from './shared-modules';

      @NgModule({
        imports: [ButtonModule, TooltipModule],
        declarations: [MyComp],
        exports: [ButtonModule, MyComp, TooltipModule]
      })
      export class AppModule {}
    `,
    );

    writeFile(
      'comp.ts',
      `
      import {Component} from '@angular/core';

      @Component({selector: 'my-comp', template: ''})
      export class MyComp {}
    `,
    );

    writeFile(
      'shared-modules.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyButton} from './button';
      import {MyTooltip} from './tooltip';

      @NgModule({imports: [MyButton], exports: [MyButton]})
      export class ButtonModule {}

      @NgModule({imports: [MyTooltip], exports: [MyTooltip]})
      export class TooltipModule {}
    `,
    );

    writeFile(
      'button.ts',
      `
      import {Directive} from '@angular/core';

      @Directive({selector: '[my-button]' standalone: true})
      export class MyButton {}
    `,
    );

    writeFile(
      'tooltip.ts',
      `
      import {Directive} from '@angular/core';

      @Directive({selector: '[my-tooltip]' standalone: true})
      export class MyTooltip {}
    `,
    );

    await runMigration('prune-ng-modules');

    const appModule = tree.readContent('app.module.ts');

    expect(tree.exists('shared-modules.ts')).toBe(false);
    expect(appModule).not.toContain('ButtonModule');
    expect(appModule).not.toContain('TooltipModule');
    expect(stripWhitespace(appModule)).toContain(
      stripWhitespace(`
      @NgModule({
        imports: [],
        declarations: [MyComp],
        exports: [MyComp]
      })
      export class AppModule {}
    `),
    );
  });

  it('should preserve an import that has one NgModule that is being deleted, in addition to a named import', async () => {
    writeFile(
      'app.module.ts',
      `
          import {NgModule} from '@angular/core';
          import {MyComp} from './comp';
          import Foo, {ButtonModule} from './button.module';

          @NgModule({imports: [ButtonModule], declarations: [MyComp], exports: [ButtonModule, MyComp]})
          export class AppModule {}
        `,
    );

    writeFile(
      'button.module.ts',
      `
          import {NgModule} from '@angular/core';
          import {MyButton} from './button';

          @NgModule({imports: [MyButton], exports: [MyButton]})
          export class ButtonModule {}
        `,
    );

    writeFile(
      'comp.ts',
      `
          import {Component} from '@angular/core';

          @Component({selector: 'my-comp', template: '<my-button>Hello</my-button>'})
          export class MyComp {}
        `,
    );

    writeFile(
      'button.ts',
      `
          import {Component} from '@angular/core';

          @Component({selector: 'my-button', template: '<ng-content></ng-content>', standalone: true})
          export class MyButton {}
        `,
    );

    await runMigration('prune-ng-modules');

    expect(tree.exists('button.module.ts')).toBe(false);
    expect(tree.readContent('app.module.ts')).toContain(`import Foo from './button.module';`);
  });

  it('should remove module references from export expressions', async () => {
    writeFile(
      'app.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyComp} from './comp';

      @NgModule({imports: [MyComp]})
      export class AppModule {}
    `,
    );

    writeFile(
      'button.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyButton} from './button';

      @NgModule({imports: [MyButton], exports: [MyButton]})
      export class ButtonModule {}
    `,
    );

    writeFile(
      'comp.ts',
      `
      import {Component} from '@angular/core';
      import {MyButton} from './button';

      @Component({
        selector: 'my-comp',
        template: '<my-button>Hello</my-button>',
        standalone: true,
        imports: [MyButton]
      })
      export class MyComp {}
    `,
    );

    writeFile(
      'button.ts',
      `
      import {Component} from '@angular/core';

      @Component({selector: 'my-button', template: '<ng-content></ng-content>', standalone: true})
      export class MyButton {}
    `,
    );

    writeFile(
      'index.ts',
      `
      export {AppModule} from './app.module';
      export {MyComp} from './comp';
      export {ButtonModule} from './button.module';
      export {MyButton} from './button';
    `,
    );

    await runMigration('prune-ng-modules');

    expect(tree.exists('app.module.ts')).toBe(false);
    expect(tree.exists('button.module.ts')).toBe(false);
    expect(stripWhitespace(tree.readContent('index.ts'))).toBe(
      stripWhitespace(`
      export {MyComp} from './comp';
      export {MyButton} from './button';
    `),
    );
  });

  it('should remove barrel export if the corresponding file is deleted', async () => {
    writeFile(
      'app.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyComp} from './comp';

      @NgModule({imports: [MyComp]})
      export class AppModule {}
    `,
    );

    writeFile(
      'button.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyButton} from './button';

      @NgModule({imports: [MyButton], exports: [MyButton]})
      export class ButtonModule {}
    `,
    );

    writeFile(
      'comp.ts',
      `
      import {Component} from '@angular/core';
      import {MyButton} from './button';

      @Component({
        selector: 'my-comp',
        template: '<my-button>Hello</my-button>',
        standalone: true,
        imports: [MyButton]
      })
      export class MyComp {}
    `,
    );

    writeFile(
      'button.ts',
      `
      import {Component} from '@angular/core';

      @Component({selector: 'my-button', template: '<ng-content></ng-content>', standalone: true})
      export class MyButton {}
    `,
    );

    writeFile(
      'index.ts',
      `
      export * from './app.module';
      export {MyComp} from './comp';
      export {ButtonModule} from './button.module';
    `,
    );

    await runMigration('prune-ng-modules');

    expect(tree.exists('app.module.ts')).toBe(false);
    expect(tree.exists('button.module.ts')).toBe(false);
    expect(stripWhitespace(tree.readContent('index.ts'))).toBe(
      stripWhitespace(`
      export {MyComp} from './comp';
    `),
    );
  });

  it('should remove barrel files referring to other barrel files that were deleted', async () => {
    writeFile(
      'app.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyDir} from './dir';

      @NgModule({imports: [MyDir]})
      export class AppModule {}
    `,
    );

    writeFile(
      'dir.ts',
      `
      import {Directive} from '@angular/core';

      @Directive({selector: '[dir]', standalone: true})
      export class MyDir {}
    `,
    );

    writeFile('index.ts', `export * from './app.module';`);
    writeFile('index-2.ts', `export * from './index';`);
    writeFile('index-3.ts', `export * from './index-2';`);

    await runMigration('prune-ng-modules');

    expect(tree.exists('index.ts')).toBe(false);
    expect(tree.exists('index-2.ts')).toBe(false);
    expect(tree.exists('index-3.ts')).toBe(false);
  });

  it('should not delete dependent barrel files if they have some barrel exports that will not be removed', async () => {
    writeFile(
      'app.module.ts',
      `
        import {NgModule} from '@angular/core';
        import {MyDir} from './dir';

        @NgModule({imports: [MyDir]})
        export class AppModule {}
      `,
    );

    writeFile(
      'dir.ts',
      `
        import {Directive} from '@angular/core';

        @Directive({selector: '[dir]', standalone: true})
        export class MyDir {}
      `,
    );

    writeFile(
      'utils.ts',
      `
        export function sum(a: number, b: number) { return a + b; }
      `,
    );

    writeFile('index.ts', `export * from './app.module';`);
    writeFile(
      'index-2.ts',
      `
        export * from './index';
        export * from './utils';
      `,
    );
    writeFile('index-3.ts', `export * from './index-2';`);

    await runMigration('prune-ng-modules');

    expect(tree.exists('index.ts')).toBe(false);
    expect(stripWhitespace(tree.readContent('index-2.ts'))).toBe(
      stripWhitespace(`export * from './utils';`),
    );
    expect(stripWhitespace(tree.readContent('index-3.ts'))).toBe(
      stripWhitespace(`export * from './index-2';`),
    );
  });

  it('should add a comment to locations that cannot be removed automatically', async () => {
    writeFile(
      'app.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {MyComp} from './comp';
      import {ButtonModule} from './button.module';

      console.log(ButtonModule);

      if (typeof ButtonModule !== 'undefined') {
        console.log('Exists!');
      }

      export const FOO = ButtonModule;

      @NgModule({imports: [ButtonModule], declarations: [MyComp], exports: [ButtonModule, MyComp]})
      export class AppModule {}
    `,
    );

    writeFile(
      'button.module.ts',
      `
      import {NgModule} from '@angular/core';

      @NgModule()
      export class ButtonModule {}
    `,
    );

    writeFile(
      'comp.ts',
      `
      import {Component} from '@angular/core';

      @Component({selector: 'my-comp', template: 'Hello'})
      export class MyComp {}
    `,
    );

    await runMigration('prune-ng-modules');

    expect(tree.exists('button.module.ts')).toBe(false);
    expect(stripWhitespace(tree.readContent('app.module.ts'))).toBe(
      stripWhitespace(`
      import {NgModule} from '@angular/core';
      import {MyComp} from './comp';

      console.log( /* TODO(standalone-migration): clean up removed NgModule reference manually. */ ButtonModule);

      if (typeof  /* TODO(standalone-migration): clean up removed NgModule reference manually. */ ButtonModule !== 'undefined') {
        console.log('Exists!');
      }

      export const FOO =  /* TODO(standalone-migration): clean up removed NgModule reference manually. */ ButtonModule;

      @NgModule({imports: [], declarations: [MyComp], exports: [MyComp]})
      export class AppModule {}
    `),
    );
  });

  it('should preserve the trailing comma when deleting a module', async () => {
    const initialAppModule = `
      import {NgModule, InjectionToken} from '@angular/core';
      import {CommonModule} from '@angular/common';
      import {RouterModule} from '@angular/router';

      const token = new InjectionToken('token');

      @NgModule()
      export class ToDelete {}

      @NgModule({
        imports: [
          CommonModule,
          ToDelete,
          RouterModule,
        ],
        providers: [{provide: token, useValue: 123}],
      })
      export class AppModule {}
    `;

    writeFile('app.module.ts', initialAppModule);

    await runMigration('prune-ng-modules');

    expect(stripWhitespace(tree.readContent('app.module.ts'))).toContain(
      stripWhitespace(`
      @NgModule({
        imports: [
          CommonModule,
          RouterModule,
        ],
        providers: [{provide: token, useValue: 123}],
      })
    `),
    );
  });

  it('should replace any leftover NgModule classes in imports arrays with the exports used in the template', async () => {
    writeFile(
      'button.module.ts',
      `
      import {NgModule, Directive} from '@angular/core';
      import {MyDir, MyButton} from './used';
      import {Unused} from './unused';

      @NgModule({imports: [MyButton, MyDir, Unused], exports: [MyButton, MyDir, Unused]})
      export class ButtonModule {}
    `,
    );

    // Declared in the module, but not used.
    writeFile(
      'unused.ts',
      `
        import {Directive} from '@angular/core';

        @Directive({selector: '[unused]', standalone: true})
        export class Unused {}
      `,
    );

    writeFile(
      'used.ts',
      `
        import {Directive, Component} from '@angular/core';

        @Directive({selector: '[my-dir]', standalone: true})
        export class MyDir {}

        @Component({selector: 'my-button', template: '<ng-content/>', standalone: true})
        export class MyButton {}
      `,
    );

    writeFile(
      'unrelated.ts',
      `
        import {Directive} from '@angular/core';

        @Directive({selector: '[unrelated]', standalone: true})
        export class Unrelated {}
      `,
    );

    writeFile(
      'comp.ts',
      `
      import {Component} from '@angular/core';
      import {ButtonModule} from './button.module';
      import {Unrelated} from './unrelated';

      @Component({
        selector: 'my-comp',
        template: '<my-button my-dir unrelated>Hello</my-button>',
        imports: [ButtonModule, Unrelated],
        standalone: true,
      })
      export class MyComp {}
    `,
    );

    await runMigration('prune-ng-modules');

    expect(tree.exists('button.module.ts')).toBe(false);
    expect(stripWhitespace(tree.readContent('comp.ts'))).toBe(
      stripWhitespace(`
      import {Component} from '@angular/core';
      import {Unrelated} from './unrelated';
      import {MyButton, MyDir} from './used';

      @Component({
        selector: 'my-comp',
        template: '<my-button my-dir unrelated>Hello</my-button>',
        imports: [MyButton, MyDir, Unrelated],
        standalone: true,
      })
      export class MyComp {}
    `),
    );
  });

  it('should replace any leftover NgModule classes in testing module imports arrays with the module exports', async () => {
    writeFile(
      'button.module.ts',
      `
      import {NgModule, Directive} from '@angular/core';
      import {MyDir, MyButton} from './decls';

      @NgModule({imports: [MyButton, MyDir], exports: [MyButton, MyDir]})
      export class ButtonModule {}
    `,
    );

    writeFile(
      'decls.ts',
      `
        import {Directive, Component} from '@angular/core';

        @Directive({selector: '[my-dir]', standalone: true})
        export class MyDir {}

        @Component({selector: 'my-button', template: '<ng-content/>', standalone: true})
        export class MyButton {}
      `,
    );

    writeFile(
      'test.ts',
      `
      import {bootstrapTemplate, setupModule} from 'some_internal_path/angular/testing/catalyst/fake_async';
      import {ButtonModule} from './button.module';

      describe('bootstrapping an app', () => {
        beforeEach(() => {
          setupModule({
            imports: [ButtonModule]
          });
        });

        it('should work', () => {
          bootstrapTemplate('<my-button my-dir/>');
        });
      });
    `,
    );

    await runMigration('prune-ng-modules');

    expect(tree.exists('button.module.ts')).toBe(false);
    expect(stripWhitespace(tree.readContent('test.ts'))).toBe(
      stripWhitespace(`
        import {bootstrapTemplate, setupModule} from 'some_internal_path/angular/testing/catalyst/fake_async';
        import {MyButton, MyDir} from './decls';

        describe('bootstrapping an app', () => {
          beforeEach(() => {
            setupModule({
              imports: [MyButton, MyDir]
            });
          });

          it('should work', () => {
            bootstrapTemplate('<my-button my-dir/>');
          });
        });
    `),
    );
  });

  it('should remove leftover NgModule that does not have any exports', async () => {
    writeFile(
      'button.module.ts',
      `
      import {NgModule, Directive} from '@angular/core';

      @NgModule({imports: [], exports: []})
      export class ButtonModule {}
    `,
    );

    writeFile(
      'test.ts',
      `
      import {bootstrap, setupModule} from 'some_internal_path/angular/testing/catalyst/fake_async';
      import {ButtonModule} from './button.module';

      describe('bootstrapping an app', () => {
        beforeEach(() => {
          setupModule({
            imports: [ButtonModule]
          });
        });
      });
    `,
    );

    await runMigration('prune-ng-modules');

    expect(tree.exists('button.module.ts')).toBe(false);
    expect(stripWhitespace(tree.readContent('test.ts'))).toBe(
      stripWhitespace(`
        import {bootstrap, setupModule} from 'some_internal_path/angular/testing/catalyst/fake_async';

        describe('bootstrapping an app', () => {
          beforeEach(() => {
            setupModule({
              imports: []
            });
          });
        });
    `),
    );
  });

  it('should not duplicate imports when replacing leftover module with its imports', async () => {
    writeFile(
      'button.module.ts',
      `
      import {NgModule, Directive} from '@angular/core';
      import {MyButton} from './decls';

      @NgModule({exports: [MyButton]})
      export class ButtonModule {}
    `,
    );

    writeFile(
      'decls.ts',
      `
        import {Directive, Component} from '@angular/core';

        @Component({selector: 'my-button', template: '<ng-content/>', standalone: true})
        export class MyButton {}
      `,
    );

    writeFile(
      'test.ts',
      `
      import {bootstrapTemplate, setupModule} from 'some_internal_path/angular/testing/catalyst/fake_async';
      import {ButtonModule} from './button.module';
      import {MyButton} from './decls';

      describe('bootstrapping an app', () => {
        beforeEach(() => {
          setupModule({
            imports: [ButtonModule, MyButton]
          });
        });

        it('should work', () => {
          bootstrapTemplate('<my-button/>');
        });
      });
    `,
    );

    await runMigration('prune-ng-modules');

    expect(tree.exists('button.module.ts')).toBe(false);
    expect(stripWhitespace(tree.readContent('test.ts'))).toBe(
      stripWhitespace(`
        import {bootstrapTemplate, setupModule} from 'some_internal_path/angular/testing/catalyst/fake_async';
        import {MyButton} from './decls';

        describe('bootstrapping an app', () => {
          beforeEach(() => {
            setupModule({
              imports: [MyButton]
            });
          });

          it('should work', () => {
            bootstrapTemplate('<my-button/>');
          });
        });
    `),
    );
  });

  it('should switch a platformBrowser().bootstrapModule call to bootstrapApplication', async () => {
    writeFile(
      'main.ts',
      `
      import {AppModule} from './app/app.module';
      import {platformBrowser} from '@angular/platform-browser';

      platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
    `,
    );

    writeFile(
      './app/app.module.ts',
      `
      import {NgModule, Component} from '@angular/core';

      @Component({template: 'hello', standalone: false})
      export class AppComponent {}

      @NgModule({declarations: [AppComponent], bootstrap: [AppComponent]})
      export class AppModule {}
    `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
      import {AppComponent} from './app/app.module';
      import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';

      bootstrapApplication(AppComponent).catch(e => console.error(e));
    `),
    );

    expect(stripWhitespace(tree.readContent('./app/app.module.ts'))).toBe(
      stripWhitespace(`
      import {NgModule, Component} from '@angular/core';

      @Component({template: 'hello'})
      export class AppComponent {}
    `),
    );
  });

  it('should switch a platformBrowserDynamic().bootstrapModule call to bootstrapApplication', async () => {
    writeFile(
      'main.ts',
      `
          import {AppModule} from './app/app.module';
          import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

          platformBrowserDynamic().bootstrapModule(AppModule).catch(e => console.error(e));
        `,
    );

    writeFile(
      './app/app.module.ts',
      `
          import {NgModule, Component} from '@angular/core';

          @Component({template: 'hello', standalone: false})
          export class AppComponent {}

          @NgModule({declarations: [AppComponent], bootstrap: [AppComponent]})
          export class AppModule {}
        `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
          import {AppComponent} from './app/app.module';
          import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
          import {bootstrapApplication} from '@angular/platform-browser';

          bootstrapApplication(AppComponent).catch(e => console.error(e));
        `),
    );

    expect(stripWhitespace(tree.readContent('./app/app.module.ts'))).toBe(
      stripWhitespace(`
          import {NgModule, Component} from '@angular/core';

          @Component({template: 'hello'})
          export class AppComponent {}
        `),
    );
  });

  it('should switch a PlatformRef.bootstrapModule call to bootstrapApplication', async () => {
    writeFile(
      'main.ts',
      `
      import {AppModule} from './app/app.module';
      import {PlatformRef} from '@angular/core';

      const foo: PlatformRef = null!;

      foo.bootstrapModule(AppModule).catch(e => console.error(e));
    `,
    );

    writeFile(
      './app/app.module.ts',
      `
      import {NgModule, Component} from '@angular/core';

      @Component({template: 'hello', standalone: false})
      export class AppComponent {}

      @NgModule({declarations: [AppComponent], bootstrap: [AppComponent]})
      export class AppModule {}
    `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
      import {AppComponent} from './app/app.module';
      import {PlatformRef} from '@angular/core';
      import {bootstrapApplication} from '@angular/platform-browser';

      const foo: PlatformRef = null!;

      bootstrapApplication(AppComponent).catch(e => console.error(e));
    `),
    );

    expect(stripWhitespace(tree.readContent('./app/app.module.ts'))).toBe(
      stripWhitespace(`
      import {NgModule, Component} from '@angular/core';

      @Component({template: 'hello'})
      export class AppComponent {}
    `),
    );
  });

  it('should convert the root module declarations to standalone', async () => {
    writeFile(
      'main.ts',
      `
      import {AppModule} from './app/app.module';
      import {platformBrowser} from '@angular/platform-browser';

      platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
    `,
    );

    writeFile(
      './app/app.component.ts',
      `
      import {Component} from '@angular/core';

      @Component({template: '<div *ngIf="show" dir>hello</div>', standalone: false})
      export class AppComponent {
        show = true;
      }
    `,
    );

    writeFile(
      './app/dir.ts',
      `
      import {Directive} from '@angular/core';

      @Directive({selector: '[dir]', standalone: false})
      export class Dir {}
    `,
    );

    writeFile(
      './app/app.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {CommonModule} from '@angular/common';
      import {AppComponent} from './app.component';
      import {Dir} from './dir';

      @NgModule({
        imports: [CommonModule],
        declarations: [AppComponent, Dir],
        bootstrap: [AppComponent]
      })
      export class AppModule {}
    `,
    );

    await runMigration('standalone-bootstrap');

    expect(tree.exists('./app/app.module.ts')).toBe(false);
    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
      import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
      import {CommonModule} from '@angular/common';
      import {AppComponent} from './app/app.component';
      import {importProvidersFrom} from '@angular/core';

      bootstrapApplication(AppComponent, {
        providers: [importProvidersFrom(CommonModule)]
      }).catch(e => console.error(e));
    `),
    );

    expect(stripWhitespace(tree.readContent('./app/app.component.ts'))).toBe(
      stripWhitespace(`
      import {Component} from '@angular/core';
      import {NgIf} from '@angular/common';
      import {Dir} from './dir';

      @Component({
        template: '<div *ngIf="show" dir>hello</div>',
        imports: [NgIf, Dir]
      })
      export class AppComponent {
        show = true;
      }
    `),
    );

    expect(stripWhitespace(tree.readContent('./app/dir.ts'))).toBe(
      stripWhitespace(`
      import {Directive} from '@angular/core';

      @Directive({selector: '[dir]'})
      export class Dir {}
    `),
    );
  });

  it('should migrate the root component tests when converting to standalone', async () => {
    writeFile(
      'main.ts',
      `
      import {AppModule} from './app/app.module';
      import {platformBrowser} from '@angular/platform-browser';

      platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
    `,
    );

    writeFile(
      './app/app.component.ts',
      `
      import {Component} from '@angular/core';

      @Component({template: 'hello', standalone: false})
      export class AppComponent {}
    `,
    );

    writeFile(
      './app/app.component.spec.ts',
      `
      import {TestBed} from '@angular/core/testing';
      import {AppComponent} from './app.component';

      describe('bootstrapping an app', () => {
        it('should work', () => {
          TestBed.configureTestingModule({declarations: [AppComponent]});
          const fixture = TestBed.createComponent(AppComponent);
          expect(fixture.nativeElement.innerHTML).toBe('hello');
        });
      });
    `,
    );

    writeFile(
      './app/app.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {AppComponent} from './app.component';

      @NgModule({declarations: [AppComponent], bootstrap: [AppComponent]})
      export class AppModule {}
    `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('./app/app.component.ts'))).toBe(
      stripWhitespace(`
      import {Component} from '@angular/core';

      @Component({template: 'hello'})
      export class AppComponent {}
    `),
    );

    expect(stripWhitespace(tree.readContent('./app/app.component.spec.ts'))).toBe(
      stripWhitespace(`
      import {TestBed} from '@angular/core/testing';
      import {AppComponent} from './app.component';

      describe('bootstrapping an app', () => {
        it('should work', () => {
          TestBed.configureTestingModule({imports: [AppComponent]});
          const fixture = TestBed.createComponent(AppComponent);
          expect(fixture.nativeElement.innerHTML).toBe('hello');
        });
      });
    `),
    );
  });

  it('should copy providers and the symbols they depend on to the main file', async () => {
    writeFile(
      'main.ts',
      `
      import {AppModule} from './app/app.module';
      import {platformBrowser} from '@angular/platform-browser';

      platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
    `,
    );

    writeFile(
      './app/app.module.ts',
      `
      import {NgModule, Component, InjectionToken} from '@angular/core';
      import {externalToken} from './externals/token';
      import {externalToken as aliasedExternalToken} from './externals/other-token';
      import {ExternalInterface} from '@external/interfaces';
      import {InternalInterface} from './interfaces/internal-interface';

      const internalToken = new InjectionToken<string>('internalToken');
      export const exportedToken = new InjectionToken<InternalInterface>('exportedToken');

      export class ExportedClass {}

      export function exportedFactory(value: InternalInterface) {
        return value.foo;
      }

      const unexportedExtraProviders = [
        {provide: aliasedExternalToken, useFactory: (value: ExternalInterface) => value.foo}
      ];

      export const exportedExtraProviders = [
        {provide: exportedToken, useClass: ExportedClass}
      ];

      @Component({template: 'hello', standalone: false})
      export class AppComponent {}

      @NgModule({
        declarations: [AppComponent],
        bootstrap: [AppComponent],
        providers: [
          {provide: internalToken, useValue: 'hello'},
          {provide: externalToken, useValue: 123, multi: true},
          {provide: externalToken, useFactory: exportedFactory, multi: true},
          ...unexportedExtraProviders,
          ...exportedExtraProviders
        ]
      })
      export class AppModule {}
    `,
    );

    await runMigration('standalone-bootstrap');

    // Note that this leaves a couple of unused imports from `app.module`.
    // The schematic optimizes for safety, rather than avoiding unused imports.
    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
      import {exportedToken, exportedExtraProviders, ExportedClass, exportedFactory, AppComponent} from './app/app.module';
      import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
      import {InjectionToken} from '@angular/core';
      import {InternalInterface} from './app/interfaces/internal-interface';
      import {externalToken} from './app/externals/token';
      import {externalToken as aliasedExternalToken} from './app/externals/other-token';
      import {ExternalInterface} from '@external/interfaces';

      const internalToken = new InjectionToken<string>('internalToken');
      const unexportedExtraProviders = [
        {provide: aliasedExternalToken, useFactory: (value: ExternalInterface) => value.foo}
      ];

      bootstrapApplication(AppComponent, {
        providers: [
            {provide: internalToken, useValue: 'hello'},
            {provide: externalToken, useValue: 123, multi: true},
            {provide: externalToken, useFactory: exportedFactory, multi: true},
            ...unexportedExtraProviders,
            ...exportedExtraProviders
        ]
      }).catch(e => console.error(e));
    `),
    );

    expect(stripWhitespace(tree.readContent('./app/app.module.ts'))).toBe(
      stripWhitespace(`
      import {NgModule, Component, InjectionToken} from '@angular/core';
      import {externalToken} from './externals/token';
      import {externalToken as aliasedExternalToken} from './externals/other-token';
      import {ExternalInterface} from '@external/interfaces';
      import {InternalInterface} from './interfaces/internal-interface';

      const internalToken = new InjectionToken<string>('internalToken');
      export const exportedToken = new InjectionToken<InternalInterface>('exportedToken');

      export class ExportedClass {}

      export function exportedFactory(value: InternalInterface) {
        return value.foo;
      }

      const unexportedExtraProviders = [
        {provide: aliasedExternalToken, useFactory: (value: ExternalInterface) => value.foo}
      ];

      export const exportedExtraProviders = [
        {provide: exportedToken, useClass: ExportedClass}
      ];

      @Component({template: 'hello'})
      export class AppComponent {}
    `),
    );
  });

  it('should not copy over non-declaration references to the main file', async () => {
    writeFile(
      'main.ts',
      `
      import {AppModule} from './app/app.module';
      import {platformBrowser} from '@angular/platform-browser';

      platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
    `,
    );

    writeFile(
      './app/app.module.ts',
      `
      import {NgModule, Component, InjectionToken} from '@angular/core';

      export const token = new InjectionToken<string>('token');

      console.log(token);

      @Component({template: 'hello', standalone: false})
      export class AppComponent {}

      @NgModule({
        declarations: [AppComponent],
        bootstrap: [AppComponent],
        providers: [{provide: token, useValue: 'hello'}]
      })
      export class AppModule {}
    `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
      import {token, AppComponent} from './app/app.module';
      import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
      import {InjectionToken} from '@angular/core';

      bootstrapApplication(AppComponent, {
        providers: [{ provide: token, useValue: 'hello' }]
      }).catch(e => console.error(e));
    `),
    );

    expect(stripWhitespace(tree.readContent('./app/app.module.ts'))).toBe(
      stripWhitespace(`
      import {NgModule, Component, InjectionToken} from '@angular/core';

      export const token = new InjectionToken<string>('token');

      console.log(token);

      @Component({template: 'hello'})
      export class AppComponent {}
    `),
    );
  });

  it('should update dynamic imports from the `providers` that are copied to the main file', async () => {
    writeFile(
      'main.ts',
      `
          import {AppModule} from './app/app.module';
          import {platformBrowser} from '@angular/platform-browser';

          platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
        `,
    );

    writeFile(
      './app/app.module.ts',
      `
          import {NgModule, Component} from '@angular/core';
          import {ROUTES} from '@angular/router';

          @Component({template: 'hello', standalone: false})
          export class AppComponent {}

          @NgModule({
            declarations: [AppComponent],
            bootstrap: [AppComponent],
            providers: [{
              provide: ROUTES,
              useValue: [
                {path: 'internal-comp', loadComponent: () => import('../routes/internal-comp').then(c => c.InternalComp)},
                {path: 'external-comp', loadComponent: () => import('@external/external-comp').then(c => c.ExternalComp)}
              ]
            }]
          })
          export class AppModule {}
        `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
          import {AppComponent} from './app/app.module';
          import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
          import {ROUTES} from '@angular/router';

          bootstrapApplication(AppComponent, {
            providers: [{
              provide: ROUTES,
              useValue: [
                {path: 'internal-comp', loadComponent: () => import("./routes/internal-comp").then(c => c.InternalComp)},
                {path: 'external-comp', loadComponent: () => import('@external/external-comp').then(c => c.ExternalComp)}
              ]
            }]
          }).catch(e => console.error(e));
        `),
    );
  });

  it('should copy modules from the `imports` array to the `providers` and wrap them in `importProvidersFrom`', async () => {
    writeFile(
      'main.ts',
      `
        import {AppModule} from './app/app.module';
        import {platformBrowser} from '@angular/platform-browser';

        platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
      `,
    );

    writeFile(
      'token.ts',
      `
        import {InjectionToken} from '@angular/core';
        export const token = new InjectionToken<string>('token');
      `,
    );

    writeFile(
      './modules/internal.module.ts',
      `
        import {NgModule} from '@angular/core';
        import {token} from '../token';

        @NgModule({providers: [{provide: token, useValue: 'InternalModule'}]})
        export class InternalModule {}
      `,
    );

    writeFile(
      './app/app.module.ts',
      `
        import {NgModule, Component} from '@angular/core';
        import {CommonModule} from '@angular/common';
        import {InternalModule} from '../modules/internal.module';
        import {token} from '../token';

        @Component({template: 'hello', standalone: true})
        export class AppComponent {}

        @NgModule({providers: [{provide: token, useValue: 'SameFileModule'}]})
        export class SameFileModule {}

        @NgModule({
          imports: [CommonModule, InternalModule, SameFileModule],
          declarations: [AppComponent],
          bootstrap: [AppComponent]
        })
        export class AppModule {}
      `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
        import {SameFileModule, AppComponent} from './app/app.module';
        import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
        import {CommonModule} from '@angular/common';
        import {InternalModule} from './modules/internal.module';
        import {NgModule, importProvidersFrom} from '@angular/core';
        import {token} from './token';

        bootstrapApplication(AppComponent, {
          providers: [importProvidersFrom(CommonModule, InternalModule, SameFileModule)]
        }).catch(e => console.error(e));
      `),
    );
  });

  it('should switch RouterModule.forRoot calls with one argument to provideRouter', async () => {
    writeFile(
      'main.ts',
      `
      import {AppModule} from './app/app.module';
      import {platformBrowser} from '@angular/platform-browser';

      platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
    `,
    );

    writeFile(
      './app/app.module.ts',
      `
      import {NgModule, Component} from '@angular/core';
      import {RouterModule} from '@angular/router';

      @Component({template: 'hello', standalone: false})
      export class AppComponent {}

      @NgModule({
        declarations: [AppComponent],
        bootstrap: [AppComponent],
        imports: [
          RouterModule.forRoot([
            {path: 'internal-comp', loadComponent: () => import("./routes/internal-comp").then(c => c.InternalComp) },
            {path: 'external-comp', loadComponent: () => import('@external/external-comp').then(c => c.ExternalComp) }
          ])
        ]
      })
      export class AppModule {}
    `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
      import {AppComponent} from './app/app.module';
      import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
      import {provideRouter} from '@angular/router';

      bootstrapApplication(AppComponent, {
        providers: [provideRouter([
          {path: 'internal-comp', loadComponent: () => import("./app/routes/internal-comp").then(c => c.InternalComp)},
          {path: 'external-comp', loadComponent: () => import('@external/external-comp').then(c => c.ExternalComp)}
        ])]
      }).catch(e => console.error(e));
    `),
    );
  });

  it('should migrate a RouterModule.forRoot call with an empty config', async () => {
    writeFile(
      'main.ts',
      `
      import {AppModule} from './app/app.module';
      import {platformBrowser} from '@angular/platform-browser';

      platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
    `,
    );

    writeFile(
      './app/app.module.ts',
      `
      import {NgModule, Component} from '@angular/core';
      import {RouterModule} from '@angular/router';
      import {APP_ROUTES} from './routes';

      @Component({template: 'hello', standalone: false})
      export class AppComponent {}

      @NgModule({
        declarations: [AppComponent],
        bootstrap: [AppComponent],
        imports: [RouterModule.forRoot(APP_ROUTES, {})]
      })
      export class AppModule {}
    `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
      import {AppComponent} from './app/app.module';
      import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
      import {provideRouter} from '@angular/router';
      import {APP_ROUTES} from './app/routes';

      bootstrapApplication(AppComponent, {
        providers: [provideRouter(APP_ROUTES)]
      }).catch(e => console.error(e));
    `),
    );
  });

  it('should migrate a router config with a preloadingStrategy to withPreloading', async () => {
    writeFile(
      'main.ts',
      `
      import {AppModule} from './app/app.module';
      import {platformBrowser} from '@angular/platform-browser';

      platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
    `,
    );

    writeFile(
      './app/app.module.ts',
      `
      import {NgModule, Component} from '@angular/core';
      import {RouterModule} from '@angular/router';
      import {of} from 'rxjs';

      @Component({template: 'hello', standalone: false})
      export class AppComponent {}

      @NgModule({
        declarations: [AppComponent],
        bootstrap: [AppComponent],
        imports: [RouterModule.forRoot([], {
          preloadingStrategy: () => of(true)
        })]
      })
      export class AppModule {}
    `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
      import {AppComponent} from './app/app.module';
      import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
      import {withPreloading, provideRouter} from '@angular/router';
      import {of} from 'rxjs';

      bootstrapApplication(AppComponent, {
        providers: [provideRouter([], withPreloading(() => of(true)))]
      }).catch(e => console.error(e));
    `),
    );
  });

  it('should migrate a router config with enableTracing to withDebugTracing', async () => {
    writeFile(
      'main.ts',
      `
      import {AppModule} from './app/app.module';
      import {platformBrowser} from '@angular/platform-browser';

      platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
    `,
    );

    writeFile(
      './app/app.module.ts',
      `
      import {NgModule, Component} from '@angular/core';
      import {RouterModule} from '@angular/router';

      @Component({template: 'hello', standalone: false})
      export class AppComponent {}

      @NgModule({
        declarations: [AppComponent],
        bootstrap: [AppComponent],
        imports: [RouterModule.forRoot([], {
          enableTracing: true
        })]
      })
      export class AppModule {}
    `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
      import {AppComponent} from './app/app.module';
      import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
      import {withDebugTracing, provideRouter} from '@angular/router';

      bootstrapApplication(AppComponent, {
        providers: [provideRouter([], withDebugTracing())]
      }).catch(e => console.error(e));
    `),
    );
  });

  it('should migrate a router config with `initialNavigation: "enabledBlocking"` to withEnabledBlockingInitialNavigation', async () => {
    writeFile(
      'main.ts',
      `
          import {AppModule} from './app/app.module';
          import {platformBrowser} from '@angular/platform-browser';

          platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
        `,
    );

    writeFile(
      './app/app.module.ts',
      `
          import {NgModule, Component} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @Component({template: 'hello', standalone: false})
          export class AppComponent {}

          @NgModule({
            declarations: [AppComponent],
            bootstrap: [AppComponent],
            imports: [RouterModule.forRoot([], {
              initialNavigation: 'enabledBlocking'
            })]
          })
          export class AppModule {}
        `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
          import {AppComponent} from './app/app.module';
          import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
          import {withEnabledBlockingInitialNavigation, provideRouter} from '@angular/router';

          bootstrapApplication(AppComponent, {
            providers: [provideRouter([], withEnabledBlockingInitialNavigation())]
          }).catch(e => console.error(e));
        `),
    );
  });

  it('should migrate a router config with `initialNavigation: "enabled"` to withEnabledBlockingInitialNavigation', async () => {
    writeFile(
      'main.ts',
      `
          import {AppModule} from './app/app.module';
          import {platformBrowser} from '@angular/platform-browser';

          platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
        `,
    );

    writeFile(
      './app/app.module.ts',
      `
          import {NgModule, Component} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @Component({template: 'hello', standalone: false})
          export class AppComponent {}

          @NgModule({
            declarations: [AppComponent],
            bootstrap: [AppComponent],
            imports: [RouterModule.forRoot([], {
              initialNavigation: 'enabled'
            })]
          })
          export class AppModule {}
        `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
          import {AppComponent} from './app/app.module';
          import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
          import {withEnabledBlockingInitialNavigation, provideRouter} from '@angular/router';

          bootstrapApplication(AppComponent, {
            providers: [provideRouter([], withEnabledBlockingInitialNavigation())]
          }).catch(e => console.error(e));
        `),
    );
  });

  it('should migrate a router config with `initialNavigation: "disabled"` to withDisabledInitialNavigation', async () => {
    writeFile(
      'main.ts',
      `
          import {AppModule} from './app/app.module';
          import {platformBrowser} from '@angular/platform-browser';

          platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
        `,
    );

    writeFile(
      './app/app.module.ts',
      `
          import {NgModule, Component} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @Component({template: 'hello', standalone: false})
          export class AppComponent {}

          @NgModule({
            declarations: [AppComponent],
            bootstrap: [AppComponent],
            imports: [RouterModule.forRoot([], {
              initialNavigation: 'disabled'
            })]
          })
          export class AppModule {}
        `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
          import {AppComponent} from './app/app.module';
          import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
          import {withDisabledInitialNavigation, provideRouter} from '@angular/router';

          bootstrapApplication(AppComponent, {
            providers: [provideRouter([], withDisabledInitialNavigation())]
          }).catch(e => console.error(e));
        `),
    );
  });

  it('should migrate a router config with useHash to withHashLocation', async () => {
    writeFile(
      'main.ts',
      `
      import {AppModule} from './app/app.module';
      import {platformBrowser} from '@angular/platform-browser';

      platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
    `,
    );

    writeFile(
      './app/app.module.ts',
      `
      import {NgModule, Component} from '@angular/core';
      import {RouterModule} from '@angular/router';

      @Component({template: 'hello', standalone: false})
      export class AppComponent {}

      @NgModule({
        declarations: [AppComponent],
        bootstrap: [AppComponent],
        imports: [RouterModule.forRoot([], {
          useHash: true
        })]
      })
      export class AppModule {}
    `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
      import {AppComponent} from './app/app.module';
      import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
      import {withHashLocation, provideRouter} from '@angular/router';

      bootstrapApplication(AppComponent, {
        providers: [provideRouter([], withHashLocation())]
      }).catch(e => console.error(e));
    `),
    );
  });

  it('should migrate a router config with errorHandler to withNavigationErrorHandler', async () => {
    writeFile(
      'main.ts',
      `
          import {AppModule} from './app/app.module';
          import {platformBrowser} from '@angular/platform-browser';

          platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
        `,
    );

    writeFile(
      './app/app.module.ts',
      `
          import {NgModule, Component} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @Component({template: 'hello', standalone: false})
          export class AppComponent {}

          @NgModule({
            declarations: [AppComponent],
            bootstrap: [AppComponent],
            imports: [RouterModule.forRoot([], {
              errorHandler: () => {}
            })]
          })
          export class AppModule {}
        `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
          import {AppComponent} from './app/app.module';
          import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
          import {withNavigationErrorHandler, provideRouter} from '@angular/router';

          bootstrapApplication(AppComponent, {
            providers: [provideRouter([], withNavigationErrorHandler(() => {}))]
          }).catch(e => console.error(e));
        `),
    );
  });

  it('should combine the anchorScrolling and scrollPositionRestoration of a router config into withInMemoryScrolling', async () => {
    writeFile(
      'main.ts',
      `
          import {AppModule} from './app/app.module';
          import {platformBrowser} from '@angular/platform-browser';

          platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
        `,
    );

    writeFile(
      './app/app.module.ts',
      `
          import {NgModule, Component} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @Component({template: 'hello', standalone: false})
          export class AppComponent {}

          @NgModule({
            declarations: [AppComponent],
            bootstrap: [AppComponent],
            imports: [RouterModule.forRoot([], {
              anchorScrolling: 'enabled',
              scrollPositionRestoration: 'top'
            })]
          })
          export class AppModule {}
        `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
          import {AppComponent} from './app/app.module';
          import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
          import {withInMemoryScrolling, provideRouter} from '@angular/router';

          bootstrapApplication(AppComponent, {
            providers: [provideRouter([], withInMemoryScrolling({
              anchorScrolling: 'enabled',
              scrollPositionRestoration: 'top'
            }))]
          }).catch(e => console.error(e));
        `),
    );
  });

  it('should copy properties that do not map to a feature into withRouterConfig', async () => {
    writeFile(
      'main.ts',
      `
      import {AppModule} from './app/app.module';
      import {platformBrowser} from '@angular/platform-browser';

      platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
    `,
    );

    writeFile(
      './app/app.module.ts',
      `
      import {NgModule, Component} from '@angular/core';
      import {RouterModule} from '@angular/router';

      @Component({template: 'hello'})
      export class AppComponent {}

      @NgModule({
        declarations: [AppComponent],
        bootstrap: [AppComponent],
        imports: [RouterModule.forRoot([], {
          canceledNavigationResolution: 'replace',
          useHash: true,
          paramsInheritanceStrategy: 'always'
        })]
      })
      export class AppModule {}
    `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
      import {AppComponent} from './app/app.module';
      import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
      import {withHashLocation, withRouterConfig, provideRouter} from '@angular/router';

      bootstrapApplication(AppComponent, {
        providers: [provideRouter([], withHashLocation(), withRouterConfig({
          canceledNavigationResolution: 'replace',
          paramsInheritanceStrategy: 'always'
        }))]
      }).catch(e => console.error(e));
    `),
    );
  });

  it('should preserve a RouterModule.forRoot where the config cannot be statically analyzed', async () => {
    writeFile(
      'main.ts',
      `
        import {AppModule} from './app/app.module';
        import {platformBrowser} from '@angular/platform-browser';

        platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
      `,
    );

    writeFile(
      './app/app.module.ts',
      `
        import {NgModule, Component} from '@angular/core';
        import {RouterModule} from '@angular/router';

        @Component({template: 'hello'})
        export class AppComponent {}

        const extraOptions = {useHash: true};

        @NgModule({
          declarations: [AppComponent],
          bootstrap: [AppComponent],
          imports: [RouterModule.forRoot([], {
            enableTracing: true,
            ...extraOptions
          })]
        })
        export class AppModule {}
      `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
        import {AppComponent} from './app/app.module';
        import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
        import {RouterModule} from '@angular/router';
        import {importProvidersFrom} from '@angular/core';

        const extraOptions = {useHash: true};

        bootstrapApplication(AppComponent, {
          providers: [importProvidersFrom(RouterModule.forRoot([], {
            enableTracing: true,
            ...extraOptions
          }))]
        }).catch(e => console.error(e));
      `),
    );
  });

  it('should convert BrowserAnimationsModule references to provideAnimations', async () => {
    writeFile(
      'main.ts',
      `
      import {AppModule} from './app/app.module';
      import {platformBrowser} from '@angular/platform-browser';

      platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
    `,
    );

    writeFile(
      './app/app.module.ts',
      `
      import {NgModule, Component} from '@angular/core';
      import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

      @Component({template: 'hello'})
      export class AppComponent {}

      @NgModule({
        declarations: [AppComponent],
        bootstrap: [AppComponent],
        imports: [BrowserAnimationsModule]
      })
      export class AppModule {}
    `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
      import {AppComponent} from './app/app.module';
      import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
      import {provideAnimations} from '@angular/platform-browser/animations';

      bootstrapApplication(AppComponent, {
        providers: [provideAnimations()]
      }).catch(e => console.error(e));
    `),
    );
  });

  it('should preserve BrowserAnimationsModule.withConfig calls', async () => {
    writeFile(
      'main.ts',
      `
      import {AppModule} from './app/app.module';
      import {platformBrowser} from '@angular/platform-browser';

      platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
    `,
    );

    writeFile(
      './app/app.module.ts',
      `
      import {NgModule, Component} from '@angular/core';
      import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

      @Component({template: 'hello'})
      export class AppComponent {}

      @NgModule({
        declarations: [AppComponent],
        bootstrap: [AppComponent],
        imports: [BrowserAnimationsModule.withConfig({disableAnimations: true})]
      })
      export class AppModule {}
    `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
      import {AppComponent} from './app/app.module';
      import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
      import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
      import {importProvidersFrom} from '@angular/core';

      bootstrapApplication(AppComponent, {
        providers: [importProvidersFrom(BrowserAnimationsModule.withConfig({disableAnimations: true}))]
      }).catch(e => console.error(e));
    `),
    );
  });

  it('should convert NoopAnimationsModule references to provideNoopAnimations', async () => {
    writeFile(
      'main.ts',
      `
      import {AppModule} from './app/app.module';
      import {platformBrowser} from '@angular/platform-browser';

      platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
    `,
    );

    writeFile(
      './app/app.module.ts',
      `
      import {NgModule, Component} from '@angular/core';
      import {NoopAnimationsModule} from '@angular/platform-browser/animations';

      @Component({template: 'hello'})
      export class AppComponent {}

      @NgModule({
        declarations: [AppComponent],
        bootstrap: [AppComponent],
        imports: [NoopAnimationsModule]
      })
      export class AppModule {}
    `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
      import {AppComponent} from './app/app.module';
      import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
      import {provideNoopAnimations} from '@angular/platform-browser/animations';

      bootstrapApplication(AppComponent, {
        providers: [provideNoopAnimations()]
      }).catch(e => console.error(e));
    `),
    );
  });

  it('should convert HttpClientModule references to provideHttpClient(withInterceptorsFromDi())', async () => {
    writeFile(
      'main.ts',
      `
      import {AppModule} from './app/app.module';
      import {platformBrowser} from '@angular/platform-browser';

      platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
    `,
    );

    writeFile(
      './app/app.module.ts',
      `
      import {NgModule, Component} from '@angular/core';
      import {HttpClientModule} from '@angular/common/http';

      @Component({template: 'hello'})
      export class AppComponent {}

      @NgModule({
        declarations: [AppComponent],
        bootstrap: [AppComponent],
        imports: [HttpClientModule]
      })
      export class AppModule {}
    `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
      import {AppComponent} from './app/app.module';
      import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
      import {withInterceptorsFromDi, provideHttpClient} from '@angular/common/http';

      bootstrapApplication(AppComponent, {
        providers: [provideHttpClient(withInterceptorsFromDi())]
      }).catch(e => console.error(e));
    `),
    );
  });

  it('should omit standalone directives from the imports array from the importProvidersFrom call', async () => {
    writeFile(
      'main.ts',
      `
        import {AppModule} from './app/app.module';
        import {platformBrowser} from '@angular/platform-browser';

        platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
      `,
    );

    writeFile(
      './app/app.module.ts',
      `
        import {NgModule, Component, Directive} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Directive({selector: '[dir]', standalone: true})
        export class Dir {}

        @Component({template: '<span dir></span>', standalone: false})
        export class AppComponent {}

        @NgModule({imports: [Dir, CommonModule], declarations: [AppComponent], bootstrap: [AppComponent]})
        export class AppModule {}
      `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
        import {AppComponent} from './app/app.module';
        import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
        import {CommonModule} from '@angular/common';
        import {importProvidersFrom} from '@angular/core';

        bootstrapApplication(AppComponent, {
          providers: [importProvidersFrom(CommonModule)]
        }).catch(e => console.error(e));
      `),
    );

    expect(stripWhitespace(tree.readContent('./app/app.module.ts'))).toContain(
      stripWhitespace(`
        @Component({template: '<span dir></span>', imports: [Dir]})
        export class AppComponent {}
      `),
    );
  });

  it('should be able to migrate a bootstrapModule call where the root component does not belong to the bootstrapped component', async () => {
    writeFile(
      'main.ts',
      `
        import {AppModule} from './app/app.module';
        import {platformBrowser} from '@angular/platform-browser';

        platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
      `,
    );

    writeFile(
      './app/root.module.ts',
      `
        import {NgModule, Component, InjectionToken} from '@angular/core';

        const token = new InjectionToken<string>('token');

        @Component({selector: 'root-comp', template: '', standalone: true})
        export class Root {}

        @NgModule({
          imports: [Root],
          exports: [Root],
          providers: [{provide: token, useValue: 'hello'}]
        })
        export class RootModule {}
      `,
    );

    writeFile(
      './app/app.module.ts',
      `
        import {NgModule, Component} from '@angular/core';
        import {RootModule, Root} from './root.module';

        @NgModule({
          imports: [RootModule],
          bootstrap: [Root]
        })
        export class AppModule {}
      `,
    );

    await runMigration('standalone-bootstrap');

    expect(tree.exists('./app/app.module.ts')).toBe(false);
    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
        import {platformBrowser, bootstrapApplication} from '@angular/platform-browser';
        import {RootModule, Root} from './app/root.module';
        import {importProvidersFrom} from '@angular/core';

        bootstrapApplication(Root, {
          providers: [importProvidersFrom(RootModule)]
        }).catch(e => console.error(e));
      `),
    );
  });

  it('should add Protractor support if any tests are detected', async () => {
    writeFile(
      'main.ts',
      `
      import {AppModule} from './app/app.module';
      import {platformBrowser} from '@angular/platform-browser';

      platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
    `,
    );

    writeFile(
      './app/app.module.ts',
      `
      import {NgModule, Component} from '@angular/core';

      @Component({selector: 'app', template: 'hello'})
      export class AppComponent {}

      @NgModule({declarations: [AppComponent], bootstrap: [AppComponent]})
      export class AppModule {}
    `,
    );

    writeFile(
      './app/app.e2e.spec.ts',
      `
      import {browser, by, element} from 'protractor';

      describe('app', () => {
        beforeAll(async () => {
          await browser.get(browser.params.testUrl);
        });

        it('should work', async () => {
          const rootSelector = element(by.css('app'));
          expect(await rootSelector.isPresent()).toBe(true);
        });
      });
    `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
      import {AppComponent} from './app/app.module';
      import {platformBrowser, provideProtractorTestingSupport, bootstrapApplication} from '@angular/platform-browser';

      bootstrapApplication(AppComponent, {
        providers: [provideProtractorTestingSupport()]
      }).catch(e => console.error(e));
    `),
    );
  });

  it('should add Protractor support if any tests with deep imports are detected', async () => {
    writeFile(
      'main.ts',
      `
      import {AppModule} from './app/app.module';
      import {platformBrowser} from '@angular/platform-browser';

      platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
    `,
    );

    writeFile(
      './app/app.module.ts',
      `
      import {NgModule, Component} from '@angular/core';

      @Component({selector: 'app', template: 'hello'})
      export class AppComponent {}

      @NgModule({declarations: [AppComponent], bootstrap: [AppComponent]})
      export class AppModule {}
    `,
    );

    writeFile(
      './app/app.e2e.spec.ts',
      `
      import {browser, by, element} from 'protractor/some/deep-import';

      describe('app', () => {
        beforeAll(async () => {
          await browser.get(browser.params.testUrl);
        });

        it('should work', async () => {
          const rootSelector = element(by.css('app'));
          expect(await rootSelector.isPresent()).toBe(true);
        });
      });
    `,
    );

    await runMigration('standalone-bootstrap');

    expect(stripWhitespace(tree.readContent('main.ts'))).toBe(
      stripWhitespace(`
      import {AppComponent} from './app/app.module';
      import {platformBrowser, provideProtractorTestingSupport, bootstrapApplication} from '@angular/platform-browser';

      bootstrapApplication(AppComponent, {
        providers: [provideProtractorTestingSupport()]
      }).catch(e => console.error(e));
    `),
    );
  });
});
