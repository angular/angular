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
import * as shx from 'shelljs';

describe('static-queries migration with usage strategy', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;
  let warnOutput: string[] = [];

  // Enables the query usage strategy when running the `static-query` migration. By
  // default the schematic runs the template strategy and there is currently no easy
  // way to pass options to the migration without using environment variables.
  beforeAll(() => process.env['NG_STATIC_QUERY_USAGE_STRATEGY'] = 'true');
  afterAll(() => process.env['NG_STATIC_QUERY_USAGE_STRATEGY'] = '');

  beforeEach(() => {
    runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile('/tsconfig.json', JSON.stringify({
      compilerOptions: {
        lib: ['es2015'],
      },
    }));
    writeFile('/angular.json', JSON.stringify({
      projects: {t: {architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
    }));

    warnOutput = [];
    runner.logger.subscribe(logEntry => {
      if (logEntry.level === 'warn') {
        warnOutput.push(logEntry.message);
      }
    });

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

  describe('ViewChild', () => {
    createQueryTests('ViewChild');

    it('should mark view queries used in "ngAfterContentInit" as static', async () => {
      writeFile('/index.ts', `
        import {Component, ViewChild} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @ViewChild('test') query: any;

          ngAfterContentInit() {
            this.query.classList.add('test');
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@ViewChild('test', { static: true }) query: any;`);
    });

    it('should mark view queries used in "ngAfterContentChecked" as static', async () => {
      writeFile('/index.ts', `
        import {Component, ViewChild} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @ViewChild('test') query: any;

          ngAfterContentChecked() {
            this.query.classList.add('test');
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@ViewChild('test', { static: true }) query: any;`);
    });
  });

  describe('ContentChild', () => {
    createQueryTests('ContentChild');

    it('should not mark content queries used in "ngAfterContentInit" as static', async () => {
      writeFile('/index.ts', `
        import {Component, ContentChild} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @ContentChild('test') query: any;

          ngAfterContentInit() {
            this.query.classList.add('test');
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@ContentChild('test', { static: false }) query: any;`);
    });

    it('should not mark content queries used in "ngAfterContentInit" as static (BOM)', async () => {
      writeFile('/index.ts', `\uFEFF
        import {Component, ContentChild} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @ContentChild('test') query: any;

          ngAfterContentInit() {
            this.query.classList.add('test');
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@ContentChild('test', { static: false }) query: any;`);
    });

    it('should not mark content queries used in "ngAfterContentChecked" as static', async () => {
      writeFile('/index.ts', `
        import {Component, ContentChild} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @ContentChild('test') query: any;

          ngAfterContentChecked() {
            this.query.classList.add('test');
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@ContentChild('test', { static: false }) query: any;`);
    });
  });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematicAsync('migration-v8-static-queries', {}, tree).toPromise();
  }

  function createQueryTests(queryType: 'ViewChild'|'ContentChild') {
    it('should mark queries as dynamic', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @${queryType}('test') unused: any;
          @${queryType}('dynamic') dynamic: any;

          onClick() {
            this.dynamicQuery.classList.add('test');
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: false }) unused: any;`);
      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('dynamic', { static: false }) dynamic: any`);
    });

    it('should mark queries used in "ngOnChanges" as static', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @${queryType}('test') query: any;

          ngOnChanges() {
            this.query.classList.add('test');
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should mark queries used in "ngOnInit" as static', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @${queryType}('test') query: any;

          ngOnInit() {
            this.query.classList.add('test');
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should mark queries used in "ngDoCheck" as static', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @${queryType}('test') query: any;

          ngDoCheck() {
            this.query.classList.add('test');
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should keep existing query options when updating timing', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @${queryType}('test', { /* test */ read: null }) query: any;

          ngOnInit() {
            this.query.classList.add('test');
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { /* test */ read: null, static: true }) query: any;`);
    });

    it('should add a todo for queries declared on setter', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @${queryType}('test')
          set query(result: any) {};
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', /* TODO: add static flag */ {})`);
      expect(warnOutput.length).toBe(1);
      expect(warnOutput[0])
          .toMatch(/index.ts@6:11: Queries defined on accessors cannot be analyzed.$/);
    });

    it('should add a todo for queries declared on getter', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @${queryType}('test')
          get query() { return null; }
          set query(result: any) {}
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', /* TODO: add static flag */ {})`);
      expect(warnOutput.length).toBe(1);
      expect(warnOutput[0])
          .toMatch(/index.ts@6:11: Queries defined on accessors cannot be analyzed.$/);
    });

    it('should not overwrite existing explicit query timing', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @${queryType}('test', {static: /* untouched */ someVal}) query: any;
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', {static: /* untouched */ someVal}) query: any;`);
    });

    it('should detect queries used in deep method chain', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          // We intentionally add this comma for the second parameter in order
          // to ensure that the migration does not incorrectly create an invalid
          // decorator call with three parameters. e.g. "ViewQuery('test', {...}, )"
          @${queryType}('test', ) query: any;

          ngOnInit() {
            this.a();
          }

          a() {
            this.b();
          }

          b() {
            this.c();
          }

          c() {
            console.log(this.query);
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should properly exit if recursive function is analyzed', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @${queryType}('test') query: any;

          ngOnInit() {
            this.recursive();
          }

          recursive() {
            this.recursive();
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: false }) query: any;`);
    });

    it('should detect queries used in newly instantiated classes', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @${queryType}('test') query: any;
          @${queryType}('test') query2: any;

          ngOnInit() {
            new A(this);

            new class Inline {
              constructor(private ctx: MyComp) {
                this.a();
              }

              a() {
                this.ctx.query2.useStatically();
              }
            }(this);
          }
        }

        export class A {
          constructor(ctx: MyComp) {
            ctx.query.test();
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query2: any;`);
    });

    it('should detect queries used in parenthesized new expressions', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @${queryType}('test') query: any;

          ngOnInit() {
            new ((A))(this);
          }
        }

        export class A {
          constructor(ctx: MyComp) {
            ctx.query.test();
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should detect queries in lifecycle hook with string literal name', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @${queryType}('test') query: any;

          'ngOnInit'() {
            this.query.test();
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should detect static queries within nested inheritance', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @${queryType}('test') query: any;
        }

        export class A extends MyComp {}
        export class B extends A {

          ngOnInit() {
            this.query.testFn();
          }

        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should detect static queries used within input setters', async () => {
      writeFile('/index.ts', `
        import {Component, Input, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @${queryType}('test') query: any;

          @Input()
          get myVal() { return null; }
          set myVal(newVal: any) {
            this.query.classList.add('setter');
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should detect inputs defined in metadata', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({
          template: '<span #test></span>',
          inputs: ["myVal"],
        })
        export class MyComp {
          @${queryType}('test') query: any;

          // We don't use the input decorator here as we want to verify
          // that it properly detects the input through the component metadata.
          get myVal() { return null; }
          set myVal(newVal: any) {
            this.query.classList.add('setter');
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should detect aliased inputs declared in metadata', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({
          template: '<span #test></span>',
          inputs: ['prop: publicName'],
        })
        export class MyComp {
          @${queryType}('test') query: any;

          set prop(val: any) {
            this.query.test();
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should not mark query as static if query is used in non-input setter', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @${queryType}('test') query: any;

          set myProperty(val: any) {
            this.query.test();
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: false }) query: any;`);
    });

    it('should detect input decorator on setter', async () => {
      writeFile('/index.ts', `
        import {Input, Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @${queryType}('test') query: any;

          get myProperty() { return null; }

          // Usually the decorator is set on the get accessor, but it's also possible
          // to declare the input on the setter. This ensures that it is handled properly.
          @Input()
          set myProperty(val: any) {
            this.query.test();
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should detect setter inputs in derived classes', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({
          template: '<span #test></span>',
          inputs: ['childSetter'],
        })
        export class MyComp {
          protected @${queryType}('test') query: any;
        }

        export class B extends MyComp {
          set childSetter(newVal: any) {
            this.query.test();
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should properly detect static query in external derived class', async () => {
      writeFile('/src/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @${queryType}('test') query: any;
        }
      `);

      writeFile('/src/external.ts', `
        import {MyComp} from './index';

        export class ExternalComp extends MyComp {
          ngOnInit() {
            this.query.test();
          }
        }
      `);

      // Move the tsconfig into a subdirectory. This ensures that the update is properly
      // recorded for TypeScript projects not at the schematic tree root.
      host.sync.rename(normalize('/tsconfig.json'), normalize('/src/tsconfig.json'));
      writeFile('/angular.json', JSON.stringify({
        projects: {t: {architect: {build: {options: {tsConfig: './src/tsconfig.json'}}}}}
      }));

      await runMigration();

      expect(tree.readContent('/src/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should not mark queries used in promises as static', async () => {
      writeFile('/es2015.dom.d.ts', `
        interface PromiseConstructor {
          resolve(): Promise<unknown>;
          reject(): Promise<unknown>;
        }

        interface Promise {
          then(cb: Function): Promise<unknown>;
          catch(cb: Function): Promise<unknown>;
        }

        declare var Promise: PromiseConstructor;
      `);
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          private @${queryType}('test') query: any;
          private @${queryType}('test') query2: any;

          ngOnInit() {
            const a = Promise.resolve();

            Promise.resolve().then(() => {
              this.query.doSomething();
            });

            Promise.reject().catch(() => {
              this.query.doSomething();
            });

            a.then(() => {}).then(() => {
              this.query.doSomething();
            });

            Promise.resolve().then(this.createPromiseCb());
          }

          createPromiseCb() {
            this.query2.doSomething();
            return () => { /* empty callback */}
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: false }) query: any;`);
      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query2: any;`);
    });

    it('should handle function callbacks which statically access queries', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          private @${queryType}('test') query: any;

          ngOnInit() {
            this.callSync(() => this.query.doSomething());
          }

          callSync(cb: Function) {
            this.callSync2(cb);
          }

          callSync2(cb: Function) {
            cb();
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should handle class instantiations with specified callbacks that access queries',
       async () => {
         writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';
        import {External} from './external';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          private @${queryType}('test') query: any;

          ngOnInit() {
            new External(() => this.query.doSomething());
          }
        }
      `);

         writeFile('/external.ts', `
        export class External {
          constructor(cb: () => void) {
            // Add extra parentheses to ensure that expression is unwrapped.
            ((cb))();
          }
        }
      `);

         await runMigration();

         expect(tree.readContent('/index.ts'))
             .toContain(`@${queryType}('test', { static: true }) query: any;`);
       });

    it('should handle nested functions with arguments from parent closure', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          private @${queryType}('test') query: any;

          ngOnInit() {
            this.callSync(() => this.query.doSomething());
          }

          callSync(cb: Function) {
            function callSyncNested() {
              // The "cb" identifier comes from the "callSync" function.
              cb();
            }

            callSyncNested();
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should not mark queries used in setTimeout as static', async () => {
      writeFile('/lib.dom.d.ts', `declare function setTimeout(cb: Function);`);
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          private @${queryType}('test') query: any;
          private @${queryType}('test') query2: any;
          private @${queryType}('test') query3: any;

          ngOnInit() {
            setTimeout(function() {
              this.query.doSomething();
            });

            setTimeout(createCallback(this));
          }
        }

        function createCallback(instance: MyComp) {
          instance.query2.doSomething();
          return () => instance.query3.doSomething();
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: false }) query: any;`);
      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query2: any;`);
      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: false }) query3: any;`);
    });

    it('should not mark queries used in "addEventListener" as static', async () => {
      writeFile('/lib.dom.d.ts', `
        interface HTMLElement {
          addEventListener(cb: Function);
        }
      `);
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          private @${queryType}('test') query: any;

          constructor(private elementRef: HTMLElement) {}

          ngOnInit() {
            this.elementRef.addEventListener(() => {
              this.query.classList.add('test');
            });
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: false }) query: any;`);
    });

    it('should not mark queries used in "requestAnimationFrame" as static', async () => {
      writeFile('/lib.dom.d.ts', `declare function requestAnimationFrame(cb: Function);`);
      writeFile('/index.ts', `
        import {Component, ElementRef, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          private @${queryType}('test') query: any;

          constructor(private elementRef: ElementRef) {}

          ngOnInit() {
            requestAnimationFrame(() => {
              this.query.classList.add('test');
            });
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: false }) query: any;`);
    });

    it('should mark queries used in immediately-invoked function expression as static',
       async () => {
         writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          private @${queryType}('test') query: any;
          private @${queryType}('test') query2: any;

          ngOnInit() {
            (() => {
              this.query.usedStatically();
            })();

            (function(ctx) {
              ctx.query2.useStatically();
            })(this);
          }
        }
      `);

         await runMigration();

         expect(tree.readContent('/index.ts'))
             .toContain(`@${queryType}('test', { static: true }) query: any;`);
         expect(tree.readContent('/index.ts'))
             .toContain(`@${queryType}('test', { static: true }) query2: any;`);
       });

    it('should detect static queries used in external function-like declaration', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';
        import {externalFn} from './external';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          private @${queryType}('test') query: any;

          ngOnInit() {
            externalFn(this);
          }
        }
      `);

      writeFile('/external.ts', `
        import {MyComp} from './index';

        export function externalFn(ctx: MyComp) {
          ctx.query.usedStatically();
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should detect static queries used through getter property access', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          private @${queryType}('test') query: any;

          get myProp() {
            return this.query.myValue;
          }

          ngOnInit() {
            this.myProp.test();
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should detect static queries used through external getter access', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';
        import {External} from './external';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          @${queryType}('test') query: any;

          private external = new External(this);

          get myProp() {
            return this.query.myValue;
          }

          ngOnInit() {
            console.log(this.external.query);
          }
        }
      `);

      writeFile('/external.ts', `
        import {MyComp} from './index';

        export class External {
          constructor(private comp: MyComp) {}

          set query() { /** noop */ }
          get query() { return this.comp.query; }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should not mark queries as static if a value is assigned to accessor property',
       async () => {
         writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          private @${queryType}('test') query: any;

          set myProp(value: any) { /* noop */}
          get myProp() {
            return this.query.myValue;
          }

          ngOnInit() {
            this.myProp = true;
          }
        }
      `);

         await runMigration();

         expect(tree.readContent('/index.ts'))
             .toContain(`@${queryType}('test', { static: false }) query: any;`);
       });

    it('should mark queries as static if non-input setter uses query', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          private @${queryType}('test') query: any;

          get myProp() { return null; }
          set myProp(value: any) {
            this.query.doSomething();
          }

          ngOnInit() {
            this.myProp = 'newValue';
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should check setter and getter when using compound assignment', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          private @${queryType}('test') query: any;
          private @${queryType}('test') query2: any;

          get myProp() { return this.query2 }
          set myProp(value: any) {
            this.query.doSomething();
          }

          ngOnInit() {
            this.myProp *= 5;
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query2: any;`);
    });

    it('should check getters when using comparison operator in binary expression', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          private @${queryType}('test') query: any;

          get myProp() { return this.query }
          set myProp(value: any) { /* noop */ }

          ngOnInit() {
            if (this.myProp === 3) {
              // noop
            }
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should check derived abstract class methods', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        export abstract class RootBaseClass {
          abstract getQuery(): any;

          ngOnInit() {
            this.getQuery().doSomething();
          }
        }

        export abstract class BaseClass extends RootBaseClass {
          abstract getQuery2(): any;

          getQuery() {
            this.getQuery2();
          }
        }

        @Component({template: '<span #test></span>'})
        export class Subclass extends BaseClass {
          @${queryType}('test') query: any;

          getQuery2(): any {
            return this.query;
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should detect queries accessed through deep abstract class method', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        export abstract class RootBaseClass {
          abstract getQuery(): any;

          ngOnInit() {
            this.getQuery().doSomething();
          }
        }

        export abstract class BaseClass extends RootBaseClass {
          /* additional layer of indirection */
        }

        @Component({template: '<span #test></span>'})
        export class Subclass extends BaseClass {
          @${queryType}('test') query: any;

          getQuery(): any {
            return this.query;
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should detect queries accessed through abstract property getter', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        export abstract class BaseClass {
          abstract myQuery: any;

          ngOnInit() {
            this.myQuery.doSomething();
          }
        }

        @Component({template: '<span #test></span>'})
        export class Subclass extends BaseClass {
          @${queryType}('test') query: any;

          get myQuery() { return this.query; }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should detect queries accessed through abstract property setter', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        export abstract class BaseClass {
          abstract myQuery: any;

          ngOnInit() {
            this.myQuery = "trigger";
          }
        }

        @Component({template: '<span #test></span>'})
        export class Subclass extends BaseClass {
          @${queryType}('test') query: any;

          set myQuery(val: any) { this.query.doSomething() }
          get myQuery() { /* noop */ }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should detect query usage in abstract class methods accessing inherited query',
       async () => {
         writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        export abstract class RootBaseClass {
          abstract getQuery(): any;

          ngOnInit() {
            this.getQuery().doSomething();
          }
        }

        export abstract class BaseClass extends RootBaseClass {
          @${queryType}('test') query: any;
          abstract getQuery2(): any;

          getQuery() {
            this.getQuery2();
          }
        }

        @Component({template: '<span #test></span>'})
        export class Subclass extends BaseClass {

          getQuery2(): any {
            return this.query;
          }
        }
      `);

         await runMigration();

         expect(tree.readContent('/index.ts'))
             .toContain(`@${queryType}('test', { static: true }) query: any;`);
       });

    it('should detect query usage within component template', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({templateUrl: 'my-template.html'})
        export class MyComponent {
          @${queryType}('test') query: any;
        }
      `);

      writeFile(`/my-template.html`, `
        <foo #test></foo>
        <comp [dir]="query"></comp>
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should detect query usage with nested property read within component template',
       async () => {
         writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({templateUrl: 'my-template.html'})
        export class MyComponent {
          @${queryType}('test') query: any;
        }
      `);

         writeFile(`/my-template.html`, `
        <foo #test></foo>
        <comp [dir]="query.someProperty"></comp>
      `);

         await runMigration();

         expect(tree.readContent('/index.ts'))
             .toContain(`@${queryType}('test', { static: true }) query: any;`);
       });

    it('should not mark query as static if template has template reference with same name',
       async () => {
         writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({templateUrl: 'my-template.html'})
        export class MyComponent {
          @${queryType}('test') query: any;
        }
      `);

         writeFile(`/my-template.html`, `
        <foo #test></foo>
        <same-name #query></same-name>
        <!-- In that case the "query" from the component cannot be referenced. -->
        <comp [dir]="query"></comp>
      `);

         await runMigration();

         expect(tree.readContent('/index.ts'))
             .toContain(`@${queryType}('test', { static: false }) query: any;`);
       });

    it('should not mark query as static if template has property read with query name but different receiver',
       async () => {
         writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({templateUrl: 'my-template.html'})
        export class MyComponent {
          myObject: {someProp: any};
          @${queryType}('test') someProp: any;
        }
      `);

         // This test ensures that we don't accidentally treat template property reads
         // which do not refer to the query of the component instance, but have the same
         // "render3Ast.PropertyRead" name, as references to the query declaration.
         writeFile(`/my-template.html`, `
        <foo #test></foo>
        <comp [dir]="myObject.someProp"></comp>
      `);

         await runMigration();

         expect(tree.readContent('/index.ts'))
             .toContain(`@${queryType}('test', { static: false }) someProp: any;`);
       });

    it('should ignore queries accessed within <ng-template> element', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({templateUrl: 'my-template.html'})
        export class MyComponent {
          @${queryType}('test') query: any;
        }
      `);

      writeFile(`/my-template.html`, `
        <foo #test></foo>

        <ng-template>
          <my-comp [myInput]="query"></my-comp>
        </ng-template>
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: false }) query: any;`);
    });

    it('should detect inherited queries used in templates', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        export class ParentClass {
          @${queryType}('test') query: any;
        }

        @Component({templateUrl: 'my-template.html'})
        export class MyComponent extends ParentClass {}
      `);

      writeFile(`/my-template.html`, `
        <foo #test></foo>
        <my-comp [myInput]="query"></my-comp>
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should mark queries which could be accessed statically within third-party calls as ambiguous',
       async () => {
         writeFile('/index.ts', `
            import {Component, ${queryType}} from '@angular/core';
            import {thirdPartySync} from 'my-lib';

            @Component({template: '<span>Template</span>'})
            export class MyComponent {
              @${queryType}('test') query: any;
              @${queryType}('test') query2: any;

              ngOnInit() {
                const myVarFn = () => this.query2.doSomething();

                thirdPartySync(() => this.query.doSomething());
                thirdPartySync(myVarFn);
              }
            }
          `);

         writeFile(
             '/node_modules/my-lib/index.d.ts', `export function thirdPartySync(fn: Function);`);

         await runMigration();

         expect(tree.readContent('/index.ts'))
             .toContain(`@${
                 queryType}('test', /* TODO: check static flag */ { static: true }) query: any;`);
         expect(tree.readContent('/index.ts'))
             .toContain(`@${
                 queryType}('test', /* TODO: check static flag */ { static: true }) query2: any;`);
         expect(warnOutput.length).toBe(2);
         expect(warnOutput[0]).toContain('Query timing is ambiguous.');
         expect(warnOutput[1]).toContain('Query timing is ambiguous.');
       });

    it('should mark queries which could be accessed statically within third-party new expressions as ambiguous',
       async () => {
         writeFile('/index.ts', `
            import {Component, ${queryType}} from '@angular/core';
            import {ThirdParty} from 'my-lib';

            @Component({template: '<span>Template</span>'})
            export class MyComponent {
              @${queryType}('test') query: any;

              ngOnInit() {
                new ThirdParty(() => this.query.doSomething());
              }
            }
          `);

         writeFile('/node_modules/my-lib/index.d.ts', `
            export declare class ThirdParty {
              constructor(cb: Function);
            }
          `);

         await runMigration();

         expect(tree.readContent('/index.ts'))
             .toContain(`@${
                 queryType}('test', /* TODO: check static flag */ { static: true }) query: any;`);
         expect(warnOutput.length).toBe(1);
         expect(warnOutput[0])
             .toContain(
                 'Query timing is ambiguous. Please check if the query can be marked as dynamic');
       });

    it('should properly handle multiple tsconfig files', async () => {
      writeFile('/src/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span #test></span>'})
        export class MyComp {
          private @${queryType}('test') query: any;
        }
      `);

      writeFile('/src/tsconfig.json', JSON.stringify({
        compilerOptions: {
          lib: ['es2015'],
        }
      }));

      // The migration runs for "/tsconfig.json" and "/src/tsconfig.json" which both
      // contain the "src/index.ts" file. This test ensures that we don't incorrectly
      // apply the code transformation multiple times with outdated offsets.
      await runMigration();

      expect(tree.readContent('/src/index.ts'))
          .toContain(`@${queryType}('test', { static: false }) query: any;`);
    });

    it('should support function call with default parameter value', async () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';

        @Component({template: '<span>Test</span>'})
        export class MyComponent {
          @${queryType}('test') query: any;

          ngOnInit() {
            this.myFunction();
          }

          myFunction(unused?: string, cb = () => this.query.doSomething) {
            cb();
          }
        }
      `);

      await runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });
  }
});
