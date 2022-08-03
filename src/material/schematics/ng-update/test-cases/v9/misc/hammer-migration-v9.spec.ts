import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {addPackageToPackageJson} from '@angular/cdk/schematics/ng-add/package-config';
import {createTestCaseSetup} from '@angular/cdk/schematics/testing';
import {MIGRATION_PATH} from '../../../../paths';
import {gestureConfigTemplate} from '../../../migrations/hammer-gestures-v9/gesture-config-template';

// Copied from `cdk/testing/private` which is ESM-only at this point. We temporarily copy
// this helper as the ESM/CJS interop for schematic code with `cdk/testing/private` is
// significantly more difficult and prone to mistakes with file resolution in devkit rules.
// TODO(ESM): use the helper from `cdk/testing` when devmode is equal to prodmode.
export function dedent(strings: TemplateStringsArray, ...values: any[]) {
  let joinedString = '';
  for (let i = 0; i < values.length; i++) {
    joinedString += `${strings[i]}${values[i]}`;
  }
  joinedString += strings[strings.length - 1];

  const matches = joinedString.match(/^[ \t]*(?=\S)/gm);
  if (matches === null) {
    return joinedString;
  }

  const minLineIndent = Math.min(...matches.map(el => el.length));
  const omitMinIndentRegex = new RegExp(`^[ \\t]{${minLineIndent}}`, 'gm');
  return minLineIndent > 0 ? joinedString.replace(omitMinIndentRegex, '') : joinedString;
}

interface PackageJson {
  dependencies: Record<string, string | undefined>;
}

describe('v9 HammerJS removal', () => {
  let runner: SchematicTestRunner;
  let tree: UnitTestTree;
  let writeFile: (filePath: string, text: string) => void;
  let runMigration: () => Promise<{logOutput: string}>;

  beforeEach(async () => {
    const testSetup = await createTestCaseSetup('migration-v9', MIGRATION_PATH, []);

    runner = testSetup.runner;
    tree = testSetup.appTree;
    runMigration = testSetup.runFixers;
    writeFile = testSetup.writeFile;
  });

  function appendContent(filePath: string, text: string) {
    writeFile(filePath, text + tree.readContent(filePath));
  }

  function writeHammerTypes() {
    writeFile(
      '/node_modules/@types/hammerjs/index.d.ts',
      `
      declare var Hammer: any;
    `,
    );
  }

  function getDependencyVersion(name: string): string | undefined {
    return (JSON.parse(tree.readContent('/package.json')) as PackageJson).dependencies[name];
  }

  it('should not throw if project tsconfig does not have explicit root file names', async () => {
    // Generates a second project in the workspace. This is necessary to ensure that the
    // migration runs logic to determine the correct workspace project.
    await runner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'application',
        {name: 'second-project'},
        tree,
      )
      .toPromise();
    // Overwrite the default tsconfig to not specify any explicit source files. This replicates
    // the scenario observed in: https://github.com/angular/components/issues/18504.
    writeFile(
      '/projects/cdk-testing/tsconfig.app.json',
      JSON.stringify({
        extends: '../../tsconfig.json',
        compilerOptions: {
          outDir: '../../out-tsc/app',
          types: [],
        },
      }),
    );
    addPackageToPackageJson(tree, 'hammerjs', '0.0.0');
    await expectAsync(runMigration()).not.toBeRejected();
  });

  describe('hammerjs not used', () => {
    it('should remove hammerjs from "package.json" file', async () => {
      addPackageToPackageJson(tree, 'hammerjs', '0.0.0');

      expect(getDependencyVersion('hammerjs')).toBe('0.0.0');

      await runMigration();

      expect(getDependencyVersion('hammerjs')).toBeUndefined();

      // expect that there is a "node-package" install task. The task is
      // needed to update the lock file.
      expect(runner.tasks.some(t => t.name === 'node-package')).toBe(true);
    });

    it('should remove import to load hammerjs', async () => {
      appendContent(
        '/projects/cdk-testing/src/main.ts',
        `
        import 'hammerjs';
      `,
      );

      const {logOutput} = await runMigration();

      expect(tree.readContent('/projects/cdk-testing/src/main.ts')).not.toContain('hammerjs');
      expect(logOutput).toContain(
        'General notice: The HammerJS v9 migration for Angular Components is not able to ' +
          'migrate tests. Please manually clean up tests in your project if they rely on HammerJS.',
      );
    });

    it('should remove empty named import to load hammerjs', async () => {
      appendContent(
        '/projects/cdk-testing/src/main.ts',
        `
        import {} 'hammerjs';
      `,
      );

      await runMigration();

      expect(tree.readContent('/projects/cdk-testing/src/main.ts')).not.toContain('hammerjs');
    });

    it('should remove references to gesture config', async () => {
      writeFile(
        '/projects/cdk-testing/src/test.module.ts',
        dedent`
        import {NgModule} from '@angular/core';
        import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser'; // some comment
        import {GestureConfig} from '@angular/material/core';

        @NgModule({
          providers: [
            {provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig},
            OtherProvider,
          ]
        })
        export class TestModule {}
      `,
      );

      await runMigration();

      expect(tree.readContent('/projects/cdk-testing/src/test.module.ts')).toContain(dedent`
        import {NgModule} from '@angular/core';

        @NgModule({
          providers: [
            OtherProvider,
          ]
        })
        export class TestModule {}`);
    });

    it('should remove references to HammerModule', async () => {
      writeFile(
        '/projects/cdk-testing/src/test.module.ts',
        dedent`
        import {NgModule} from '@angular/core';
        import {
          HAMMER_GESTURE_CONFIG,
          HammerModule
        } from '@angular/platform-browser'; // some comment
        import {GestureConfig} from '@angular/material/core';

        @NgModule({
          providers: [
            {provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig},
            OtherProvider,
          ],
          imports: [
            HammerModule,
            OtherModule
          ],
        })
        export class TestModule {}
      `,
      );

      await runMigration();

      expect(tree.readContent('/projects/cdk-testing/src/test.module.ts')).toContain(dedent`
        import {NgModule} from '@angular/core';

        @NgModule({
          providers: [
            OtherProvider,
          ],
          imports: [
            OtherModule
          ],
        })
        export class TestModule {}`);
    });

    it('should remove references to gesture config if imports are aliased', async () => {
      writeFile(
        '/projects/cdk-testing/src/test.module.ts',
        dedent`
        import {NgModule} from '@angular/core';
        import {
          HAMMER_GESTURE_CONFIG as configToken
        } from '@angular/platform-browser'; // some comment
        import {GestureConfig as gestureConfig} from '@angular/material/core';

        @NgModule({
          providers: [
            {provide: configToken, useClass: gestureConfig},
            OtherProvider,
          ]
        })
        export class TestModule {}
      `,
      );

      await runMigration();

      expect(tree.readContent('/projects/cdk-testing/src/test.module.ts')).toContain(dedent`
        import {NgModule} from '@angular/core';

        @NgModule({
          providers: [
            OtherProvider,
          ]
        })
        export class TestModule {}`);
    });

    it('should report error if unable to remove reference to gesture config', async () => {
      writeFile(
        '/projects/cdk-testing/src/test.module.ts',
        dedent`
        import {NgModule} from '@angular/core';
        import {NOT_KNOWN_TOKEN, HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
        import {GestureConfig} from '@angular/material/core';

        const myProvider = {provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig}

        @NgModule({
          providers: [
            {provide: NOT_KNOWN_TOKEN, useClass: GestureConfig},
            {provide: HAMMER_GESTURE_CONFIG, useFactory: () => GestureConfig},
            OtherProvider,
          ]
        })
        export class TestModule {
          constructor() {
            doSomethingWith(GestureConfig);
          }
        }
      `,
      );

      const {logOutput} = await runMigration();

      expect(logOutput).toContain(
        `projects/cdk-testing/src/test.module.ts@5:20 - ` +
          `Unable to delete provider definition for "GestureConfig" completely. ` +
          `Please clean up the provider.`,
      );
      expect(logOutput).toContain(
        `projects/cdk-testing/src/test.module.ts@9:42 - ` +
          `Cannot remove reference to "GestureConfig". Please remove manually.`,
      );
      expect(logOutput).toContain(
        `projects/cdk-testing/src/test.module.ts@10:56 - ` +
          `Cannot remove reference to "GestureConfig". Please remove manually.`,
      );
      expect(logOutput).toContain(
        `projects/cdk-testing/src/test.module.ts@16:21 - ` +
          `Cannot remove reference to "GestureConfig". Please remove manually.`,
      );
      expect(tree.readContent('/projects/cdk-testing/src/test.module.ts')).toContain(dedent`
        import {NgModule} from '@angular/core';
        import {NOT_KNOWN_TOKEN, HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';

        const myProvider = /* TODO: remove */ {}

        @NgModule({
          providers: [
            {provide: NOT_KNOWN_TOKEN, useClass: GestureConfig},
            {provide: HAMMER_GESTURE_CONFIG, useFactory: () => GestureConfig},
            OtherProvider,
          ]
        })
        export class TestModule {
          constructor() {
            doSomethingWith(GestureConfig);
          }
        }`);
    });

    it('should preserve import for hammer gesture token if used elsewhere', async () => {
      writeFile(
        '/projects/cdk-testing/src/test.module.ts',
        dedent`
        import {NgModule, Inject} from '@angular/core';
        import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
        import {GestureConfig} from '@angular/material/core';

        @NgModule({
          providers: [
            {provide: ProviderAbove},
            {provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig},
            OtherProvider,
          ]
        })
        export class TestModule {
          constructor(@Inject(HAMMER_GESTURE_CONFIG) config?: any) {
            console.log(config);
          }
        }
      `,
      );

      await runMigration();

      expect(tree.readContent('/projects/cdk-testing/src/test.module.ts')).toContain(dedent`
        import {NgModule, Inject} from '@angular/core';
        import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';

        @NgModule({
          providers: [
            {provide: ProviderAbove},
            OtherProvider,
          ]
        })
        export class TestModule {`);
    });

    it('should remove import scripts in project index files if found', async () => {
      // tslint:disable:max-line-length
      writeFile(
        '/projects/cdk-testing/src/index.html',
        dedent`
        <!doctype html>
        <html lang="en">
            <head>
                <title>Hello</title>
                <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.js"></script>
                <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js"></script>
                <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/core-js/latest/core.js"></script>
                <script type="text/javascript" src="node_modules/hammerjs/dist/hammer.js"></script>
                <script type="text/javascript" src="https://hammerjs.github.io/dist/hammer.min.js"></script>
            </head>
            <body>
                <app-root></app-root>
            </body>
            <script src="some-other-script.js"></script>
            <script src="https://ajax.googleapis.com/ajax/libs/hammerjs/2.0.8/hammer.min.js"></script>
        </html>
      `,
      );

      await runMigration();

      expect(tree.readContent('/projects/cdk-testing/src/index.html')).toContain(dedent`
        <!doctype html>
        <html lang="en">
            <head>
                <title>Hello</title>
                <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/core-js/latest/core.js"></script>
            </head>
            <body>
                <app-root></app-root>
            </body>
            <script src="some-other-script.js"></script>
        </html>`);
      // tslint:enable:max-line-length
    });
  });

  describe('hammerjs used programmatically', () => {
    beforeEach(() => {
      appendContent(
        '/projects/cdk-testing/src/main.ts',
        `
        import 'hammerjs';
      `,
      );
    });

    it('should detect global reference to Hammer through types', async () => {
      writeHammerTypes();
      writeFile(
        '/projects/cdk-testing/src/app/hammer.ts',
        `
        export function createHammerInstance(el: HTMLElement) {
          // this works since there are types for HammerJS installed.
          return new Hammer(el);
        }
      `,
      );

      const {logOutput} = await runMigration();

      expect(tree.readContent('/projects/cdk-testing/src/main.ts')).toContain(`import 'hammerjs';`);
      expect(logOutput).toContain(
        'General notice: The HammerJS v9 migration for Angular Components is not able to ' +
          'migrate tests. Please manually clean up tests in your project if they rely on the ' +
          'deprecated Angular Material gesture config.',
      );
    });

    it('should ignore global reference to Hammer if not resolved to known types', async () => {
      writeHammerTypes();
      writeFile(
        '/projects/cdk-testing/src/app/hammer.ts',
        `
        import {Hammer} from 'workbench';

        export function createWorkbenchHammer() {
          return new Hammer();
        }
      `,
      );

      await runMigration();

      expect(tree.readContent('/projects/cdk-testing/src/main.ts')).not.toContain(
        `import 'hammerjs';`,
      );
    });

    it('should not create gesture config if hammer is only used programmatically', async () => {
      writeFile(
        '/projects/cdk-testing/src/app/hammer.ts',
        `
        export function createHammerInstance(el: HTMLElement) {
          return new (window as any).Hammer(el);
        }
      `,
      );

      await runMigration();

      expect(tree.exists('/projects/cdk-testing/src/gesture-config.ts')).toBe(false);
      expect(tree.readContent('/projects/cdk-testing/src/main.ts')).toContain(`import 'hammerjs';`);
    });

    it('should remove gesture config setup if hammer is only used programmatically', async () => {
      writeFile(
        '/projects/cdk-testing/src/app/hammer.ts',
        `
        export function createHammerInstance(el: HTMLElement) {
          return new (window as any).Hammer(el);
        }
      `,
      );

      writeFile(
        '/projects/cdk-testing/src/test.module.ts',
        dedent`
        import {NgModule} from '@angular/core';
        import {HAMMER_GESTURE_CONFIG, HammerModule} from '@angular/platform-browser';
        import {GestureConfig} from '@angular/material/core';

        @NgModule({
          providers: [
            {provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig},
            OtherProvider,
          ],
          imports: [HammerModule],
        })
        export class TestModule {}
      `,
      );

      await runMigration();

      expect(tree.exists('/projects/cdk-testing/src/gesture-config.ts')).toBe(false);
      expect(tree.readContent('/projects/cdk-testing/src/main.ts')).toContain(`import 'hammerjs';`);
      expect(tree.readContent('/projects/cdk-testing/src/test.module.ts')).toContain(dedent`
        import {NgModule} from '@angular/core';

        @NgModule({
          providers: [
            OtherProvider,
          ],
          imports: [],
        })
        export class TestModule {}`);
    });
  });

  describe('used in template with standard HammerJS events', () => {
    beforeEach(() => {
      appendContent(
        '/projects/cdk-testing/src/main.ts',
        `
        import 'hammerjs';
      `,
      );
    });

    it('should not create gesture config file', async () => {
      writeFile(
        '/projects/cdk-testing/src/app/app.component.html',
        `
        <span (panstart)="onPanStart()"></span>
      `,
      );

      await runMigration();

      expect(tree.readContent('/projects/cdk-testing/src/main.ts')).toContain(`import 'hammerjs';`);
      expect(tree.exists('/projects/cdk-testing/src/gesture-config.ts')).toBe(false);
    });

    it('should not setup custom gesture config provider in root module', async () => {
      writeFile(
        '/projects/cdk-testing/src/app/app.component.html',
        `
        <span (panstart)="onPanStart()"></span>
      `,
      );

      await runMigration();

      expect(tree.readContent('/projects/cdk-testing/src/app/app.module.ts')).toContain(dedent`\
        import { NgModule } from '@angular/core';
        import { BrowserModule, HammerModule } from '@angular/platform-browser';

        import { AppComponent } from './app.component';

        @NgModule({
          declarations: [
            AppComponent
          ],
          imports: [
            BrowserModule,
            HammerModule
          ],
          providers: [],
          bootstrap: [AppComponent]
        })
        export class AppModule { }`);
    });

    it('should remove references to the deprecated gesture config', async () => {
      writeFile(
        '/projects/cdk-testing/src/app/app.component.html',
        `
        <span (panstart)="onPanStart()"></span>
      `,
      );

      writeFile(
        '/projects/cdk-testing/src/test.module.ts',
        dedent`
        import {NgModule} from '@angular/core';
        import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
        import {GestureConfig} from '@angular/material/core';

        @NgModule({
          providers: [{provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig}]
        })
        export class TestModule {}
      `,
      );

      await runMigration();

      expect(tree.readContent('/projects/cdk-testing/src/test.module.ts')).toContain(dedent`
        import {NgModule} from '@angular/core';

        @NgModule({
          providers: []
        })
        export class TestModule {}`);
    });
  });

  describe('used in template with custom Material gesture events', () => {
    beforeEach(() => {
      appendContent(
        '/projects/cdk-testing/src/main.ts',
        `
        import 'hammerjs';
      `,
      );
    });

    it('should create gesture config file', async () => {
      writeFile(
        '/projects/cdk-testing/src/app/app.component.html',
        `
        <span (panstart)="onPanStart()">
          <span (longpress)="onPress()"></span>
        </span>
      `,
      );

      await runMigration();

      expect(tree.readContent('/projects/cdk-testing/src/main.ts')).toContain(`import 'hammerjs';`);
      expect(tree.exists('/projects/cdk-testing/src/gesture-config.ts')).toBe(true);
      expect(tree.readContent('/projects/cdk-testing/src/gesture-config.ts')).toBe(
        gestureConfigTemplate,
      );
    });

    it('should create gesture config file if used in inline template', async () => {
      writeFile(
        '/projects/cdk-testing/src/app/test.component.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          template: \`<span (slide)="onSlide()"></span>\`
        })
        export class TestComponent {}
      `,
      );

      await runMigration();

      expect(tree.readContent('/projects/cdk-testing/src/main.ts')).toContain(`import 'hammerjs';`);
      expect(tree.exists('/projects/cdk-testing/src/gesture-config.ts')).toBe(true);
      expect(tree.readContent('/projects/cdk-testing/src/gesture-config.ts')).toBe(
        gestureConfigTemplate,
      );
    });

    it('should print a notice message if hammer is only used in template', async () => {
      writeFile(
        '/projects/cdk-testing/src/app/app.component.html',
        `
        <!--
            This event could also be a component output! So it's ambiguous unless
            we instantiate the AOT compiler to understand how the template will be
            interpreted. This is out of scope for this migration and in the worst
            case we just keep HammerJS.. and the app will continue to work.
        -->
        <my-comp (slide)="onSlide()"></my-comp>
      `,
      );

      const {logOutput} = await runMigration();

      expect(logOutput).toContain(
        'The HammerJS v9 migration for Angular Components migrated the project to ' +
          'keep HammerJS installed, but detected ambiguous usage of HammerJS. Please manually ' +
          'check if you can remove HammerJS from your application.',
      );
    });

    it('should create gesture config file if used in template and programmatically', async () => {
      writeFile(
        '/projects/cdk-testing/src/app/app.component.html',
        `
        <span (slide)="onSlide($event)"></span>
      `,
      );

      writeFile(
        '/projects/cdk-testing/src/app/hammer.ts',
        `
        export function createHammerInstance(el: HTMLElement) {
          return new (window as any).Hammer(el);
        }
      `,
      );

      await runMigration();

      expect(tree.readContent('/projects/cdk-testing/src/main.ts')).toContain(`import 'hammerjs';`);
      expect(tree.exists('/projects/cdk-testing/src/gesture-config.ts')).toBe(true);
      expect(tree.readContent('/projects/cdk-testing/src/gesture-config.ts')).toBe(
        gestureConfigTemplate,
      );
    });

    it('should create gesture config file with different name if it would conflict', async () => {
      writeFile(
        '/projects/cdk-testing/src/app/app.component.html',
        `
        <span (slideright)="onSlideRight()"></span>
      `,
      );

      // unlikely case that someone has a file named "gesture-config" in the
      // project sources root. Though we want to perform the migration
      // successfully so we just generate a unique file name.
      writeFile('/projects/cdk-testing/src/gesture-config.ts', '');

      await runMigration();

      expect(tree.readContent('/projects/cdk-testing/src/main.ts')).toContain(`import 'hammerjs';`);
      expect(tree.exists('/projects/cdk-testing/src/gesture-config-1.ts')).toBe(true);
      expect(tree.readContent('/projects/cdk-testing/src/gesture-config-1.ts')).toBe(
        gestureConfigTemplate,
      );
    });

    it('should rewrite references to gesture config', async () => {
      writeFile(
        '/projects/cdk-testing/src/app/app.component.html',
        `
        <span (slidestart)="onSlideStart()"></span>
      `,
      );

      writeFile(
        '/projects/cdk-testing/src/nested/test.module.ts',
        dedent`
        import {NgModule} from '@angular/core';
        import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
        import {GestureConfig} from '@angular/material/core'; // some-comment

        @NgModule({
          providers: [
            {provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig},
            OtherProvider,
          ]
        })
        export class TestModule {}
      `,
      );

      await runMigration();

      expect(tree.readContent('/projects/cdk-testing/src/main.ts')).toContain(`import 'hammerjs';`);
      expect(tree.exists('/projects/cdk-testing/src/gesture-config.ts')).toBe(true);
      expect(tree.readContent('/projects/cdk-testing/src/nested/test.module.ts')).toContain(dedent`
        import {NgModule} from '@angular/core';
        import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
        import { GestureConfig } from "../gesture-config"; // some-comment

        @NgModule({
          providers: [
            {provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig},
            OtherProvider,
          ]
        })
        export class TestModule {}`);
    });

    it('should rewrite references to gesture config without causing conflicts', async () => {
      writeFile(
        '/projects/cdk-testing/src/app/app.component.html',
        `
        <span (slideend)="onSlideEnd()"></span>
      `,
      );

      writeFile(
        '/projects/cdk-testing/src/test.module.ts',
        dedent`
        import {NgModule} from '@angular/core';
        import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
        import {GestureConfig} from 'ngx-hammer-events';
        import * as core from '@angular/material/core';

        @NgModule({
          providers: [
            {provide: HAMMER_GESTURE_CONFIG, useClass: core.GestureConfig},
          ]
        })
        export class TestModule {}
      `,
      );

      await runMigration();

      expect(tree.readContent('/projects/cdk-testing/src/main.ts')).toContain(`import 'hammerjs';`);
      expect(tree.exists('/projects/cdk-testing/src/gesture-config.ts')).toBe(true);
      expect(tree.readContent('/projects/cdk-testing/src/test.module.ts')).toContain(dedent`
        import {NgModule} from '@angular/core';
        import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
        import {GestureConfig} from 'ngx-hammer-events';
        import * as core from '@angular/material/core';
        import { GestureConfig as GestureConfig_1 } from "./gesture-config";

        @NgModule({
          providers: [
            {provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig_1},
          ]
        })
        export class TestModule {}`);
    });

    it('should set up Hammer gestures in app module', async () => {
      writeFile(
        '/projects/cdk-testing/src/app/app.component.html',
        `
        <span (longpress)="onLongPress($event)"></span>
      `,
      );

      await runMigration();

      expect(tree.readContent('/projects/cdk-testing/src/main.ts')).toContain(`import 'hammerjs';`);
      expect(tree.exists('/projects/cdk-testing/src/gesture-config.ts')).toBe(true);

      // tslint:disable:max-line-length
      expect(tree.readContent('/projects/cdk-testing/src/app/app.module.ts')).toContain(dedent`\
        import { NgModule } from '@angular/core';
        import { BrowserModule, HAMMER_GESTURE_CONFIG, HammerModule } from '@angular/platform-browser';

        import { AppComponent } from './app.component';
        import { GestureConfig } from "../gesture-config";

        @NgModule({
          declarations: [
            AppComponent
          ],
          imports: [
            BrowserModule,
            HammerModule
          ],
          providers: [
            { provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig }
          ],
          bootstrap: [AppComponent]
        })
        export class AppModule { }`);
      // tslint:enable:max-line-length
    });

    it(
      'should add gesture config provider to app module if module is referenced through ' +
        're-exports in bootstrap',
      async () => {
        writeFile(
          '/projects/cdk-testing/src/app/app.component.html',
          `
        <span (slide)="onSlide($event)"></span>
      `,
        );

        writeFile(
          '/projects/cdk-testing/src/main.ts',
          `
        import 'hammerjs';
        import { enableProdMode } from '@angular/core';
        import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

        import { AppModule } from './app/';
        import { environment } from './environments/environment';

        if (environment.production) {
          enableProdMode();
        }

        platformBrowserDynamic().bootstrapModule(AppModule)
          .catch(err => console.error(err));
      `,
        );

        writeFile('/projects/cdk-testing/src/app/index.ts', `export * from './app.module';`);

        await runMigration();

        expect(tree.readContent('/projects/cdk-testing/src/main.ts')).toContain(
          `import 'hammerjs';`,
        );
        expect(tree.exists('/projects/cdk-testing/src/gesture-config.ts')).toBe(true);

        // tslint:disable:max-line-length
        expect(tree.readContent('/projects/cdk-testing/src/app/app.module.ts')).toContain(dedent`\
        import { NgModule } from '@angular/core';
        import { BrowserModule, HAMMER_GESTURE_CONFIG, HammerModule } from '@angular/platform-browser';

        import { AppComponent } from './app.component';
        import { GestureConfig } from "../gesture-config";

        @NgModule({
          declarations: [
            AppComponent
          ],
          imports: [
            BrowserModule,
            HammerModule
          ],
          providers: [
            { provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig }
          ],
          bootstrap: [AppComponent]
        })
        export class AppModule { }`);
        // tslint:enable:max-line-length
      },
    );

    it('should not add gesture config provider multiple times if already provided', async () => {
      writeFile(
        '/projects/cdk-testing/src/app/app.component.html',
        `
        <span (slide)="onSlide($event)"></span>
      `,
      );

      writeFile(
        '/projects/cdk-testing/src/app/app.module.ts',
        dedent`
        import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
        import {NgModule} from '@angular/core';
        import {GestureConfig} from '@angular/material/core';

        @NgModule({
          providers: [
            {
              provide: HAMMER_GESTURE_CONFIG,
              useClass: GestureConfig
            },
          ],
        })
        export class AppModule {}`,
      );

      await runMigration();

      expect(tree.readContent('/projects/cdk-testing/src/main.ts')).toContain(`import 'hammerjs';`);
      expect(tree.exists('/projects/cdk-testing/src/gesture-config.ts')).toBe(true);
      expect(tree.readContent('/projects/cdk-testing/src/app/app.module.ts')).toContain(dedent`
        import { HAMMER_GESTURE_CONFIG, HammerModule } from '@angular/platform-browser';
        import {NgModule} from '@angular/core';
        import { GestureConfig } from "../gesture-config";

        @NgModule({
          providers: [
            {
              provide: HAMMER_GESTURE_CONFIG,
              useClass: GestureConfig
            },
          ],
          imports: [
            HammerModule
          ],
        })
        export class AppModule {}`);
    });

    it('should not add HammerModule multiple times if already provided', async () => {
      writeFile(
        '/projects/cdk-testing/src/app/app.component.html',
        `
        <span (slide)="onSlide($event)"></span>
      `,
      );

      writeFile(
        '/projects/cdk-testing/src/app/app.module.ts',
        dedent`
        import {HammerModule as myHammerModule} from '@angular/platform-browser';
        import {NgModule} from '@angular/core';

        @NgModule({
          imports: [myHammerModule],
        })
        export class AppModule {}
      `,
      );

      await runMigration();

      expect(tree.readContent('/projects/cdk-testing/src/main.ts')).toContain(`import 'hammerjs';`);
      expect(tree.exists('/projects/cdk-testing/src/gesture-config.ts')).toBe(true);
      // tslint:disable:max-line-length
      expect(tree.readContent('/projects/cdk-testing/src/app/app.module.ts')).toContain(dedent`
        import { HammerModule as myHammerModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
        import {NgModule} from '@angular/core';
        import { GestureConfig } from "../gesture-config";

        @NgModule({
          imports: [myHammerModule],
          providers: [
            { provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig }
          ],
        })
        export class AppModule {}`);
      // tslint:enable:max-line-length
    });
  });

  it('should not remove hammerjs if test target compilation scope does not contain hammerjs usage', async () => {
    addPackageToPackageJson(tree, 'hammerjs', '0.0.0');
    expect(getDependencyVersion('hammerjs')).toBe('0.0.0');

    // we simulate a case where a component does not have any tests for. In that case,
    // the test target compilation scope does not include "test.component.ts" and the
    // migration would detect **no** usage of HammerJS, hence removing it. This is
    // something we avoid by just ignoring test target compilation scopes.
    writeFile(
      '/projects/cdk-testing/src/app/test.component.ts',
      `
          import {Component} from '@angular/core';

          @Component({
            template: \`<span (slide)="onSlide()"></span>\`
          })
          export class TestComponent {}
        `,
    );

    await runMigration();

    expect(getDependencyVersion('hammerjs')).toBe('0.0.0');
  });

  it(
    'should not remove hammerjs from "package.json" file if used in one project while ' +
      'unused in other project',
    async () => {
      addPackageToPackageJson(tree, 'hammerjs', '0.0.0');

      expect(getDependencyVersion('hammerjs')).toBe('0.0.0');

      await runner
        .runExternalSchematicAsync(
          '@schematics/angular',
          'application',
          {name: 'second-project'},
          tree,
        )
        .toPromise();

      // Ensure the "second-project" will be detected with using HammerJS.
      writeFile(
        '/projects/second-project/src/main.ts',
        `
      new (window as any).Hammer(document.body);
    `,
      );

      await runMigration();

      expect(runner.tasks.some(t => t.name === 'node-package')).toBe(false);
      expect(getDependencyVersion('hammerjs')).toBe('0.0.0');
    },
  );

  describe('with custom gesture config', () => {
    beforeEach(() => {
      addPackageToPackageJson(tree, 'hammerjs', '0.0.0');
      appendContent('/projects/cdk-testing/src/main.ts', `import 'hammerjs';`);
    });

    it('should not setup copied gesture config if hammer is used in template', async () => {
      writeFile(
        '/projects/cdk-testing/src/test.component.ts',
        dedent`
        import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
        import {NgModule} from '@angular/core';
        import {CustomGestureConfig} from "../gesture-config";

        @NgModule({
          providers: [
            {
              provide: HAMMER_GESTURE_CONFIG,
              useClass: CustomGestureConfig
            },
          ],
        })
        export class TestModule {}
      `,
      );

      writeFile(
        '/projects/cdk-testing/src/app/app.component.html',
        `
        <span (longpress)="onPress()"></span>
      `,
      );

      await runMigration();

      expect(tree.exists('/projects/cdk-testing/src/gesture-config.ts')).toBe(false);
      expect(tree.readContent('/projects/cdk-testing/src/main.ts')).toContain('hammerjs');
      expect(runner.tasks.some(t => t.name === 'node-package')).toBe(false);
      expect(tree.readContent('/projects/cdk-testing/src/test.component.ts')).toContain(dedent`
        import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
        import {NgModule} from '@angular/core';
        import {CustomGestureConfig} from "../gesture-config";

        @NgModule({
          providers: [
            {
              provide: HAMMER_GESTURE_CONFIG,
              useClass: CustomGestureConfig
            },
          ],
        })
        export class TestModule {}`);
    });

    it(
      'should warn if hammer is used in template and references to Material gesture config ' +
        'were detected',
      async () => {
        writeFile(
          '/projects/cdk-testing/src/test.component.ts',
          dedent`
          import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
          import {NgModule} from '@angular/core';
          import {CustomGestureConfig} from "../gesture-config";

          @NgModule({
            providers: [
              {
                provide: HAMMER_GESTURE_CONFIG,
                useClass: CustomGestureConfig
              },
            ],
          })
          export class TestModule {}
        `,
        );

        const subModuleFileContent = dedent`
          import {NgModule} from '@angular/core';
          import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
          import {GestureConfig} from '@angular/material/core';

          @NgModule({
            providers: [
              {
                provide: HAMMER_GESTURE_CONFIG,
                useClass: GestureConfig
              },
            ],
          })
          export class SubModule {}
        `;

        writeFile('/projects/cdk-testing/src/sub.module.ts', subModuleFileContent);
        writeFile(
          '/projects/cdk-testing/src/app/app.component.html',
          `
          <span (longpress)="onPress()"></span>
        `,
        );

        const {logOutput} = await runMigration();

        expect(logOutput).toContain(
          'This target cannot be migrated completely. Please manually remove references ' +
            'to the deprecated Angular Material gesture config.',
        );
        expect(runner.tasks.some(t => t.name === 'node-package')).toBe(false);
        expect(tree.readContent('/projects/cdk-testing/src/main.ts')).toContain('hammerjs');
        expect(tree.readContent('/projects/cdk-testing/src/test.component.ts')).toContain(dedent`
          import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
          import {NgModule} from '@angular/core';
          import {CustomGestureConfig} from "../gesture-config";

          @NgModule({
            providers: [
              {
                provide: HAMMER_GESTURE_CONFIG,
                useClass: CustomGestureConfig
              },
            ],
          })
          export class TestModule {}`);
        expect(tree.readContent('/projects/cdk-testing/src/sub.module.ts')).toBe(
          subModuleFileContent,
        );
      },
    );

    it('should not remove hammerjs if no usage could be detected', async () => {
      writeFile(
        '/projects/cdk-testing/src/test.component.ts',
        dedent`
        import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
        import {NgModule} from '@angular/core';
        import {CustomGestureConfig} from "../gesture-config";

        @NgModule({
          providers: [
            {
              provide: HAMMER_GESTURE_CONFIG,
              useClass: CustomGestureConfig
            },
          ],
        })
        export class TestModule {}
      `,
      );

      writeFile(
        '/projects/cdk-testing/src/sub.component.ts',
        dedent`
        import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
        import {NgModule} from '@angular/core';
        import {GestureConfig} from '@angular/material/core';

        @NgModule({
          providers: [
            {
              provide: HAMMER_GESTURE_CONFIG,
              useClass: GestureConfig
            },
          ],
        })
        export class SubModule {}
      `,
      );

      const {logOutput} = await runMigration();

      expect(logOutput).toContain(
        'This target cannot be migrated completely, but all references to the ' +
          'deprecated Angular Material gesture have been removed.',
      );
      expect(runner.tasks.some(t => t.name === 'node-package')).toBe(false);
      expect(tree.readContent('/projects/cdk-testing/src/main.ts')).toContain('hammerjs');
      expect(tree.readContent('/projects/cdk-testing/src/test.component.ts')).toContain(dedent`
        import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
        import {NgModule} from '@angular/core';
        import {CustomGestureConfig} from "../gesture-config";

        @NgModule({
          providers: [
            {
              provide: HAMMER_GESTURE_CONFIG,
              useClass: CustomGestureConfig
            },
          ],
        })
        export class TestModule {}`);
      expect(tree.readContent('/projects/cdk-testing/src/sub.component.ts')).toContain(dedent`
        import {NgModule} from '@angular/core';

        @NgModule({
          providers: [
          ],
        })
        export class SubModule {}`);
    });
  });
});
