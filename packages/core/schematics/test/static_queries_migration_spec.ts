/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getSystemPath, normalize, virtualFs} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import {HostTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import * as shx from 'shelljs';

describe('static-queries migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  beforeEach(() => {
    runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile('/tsconfig.json', JSON.stringify({
      compilerOptions: {
        lib: ['es2015'],
      }
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

  describe('ViewChild', () => {
    createQueryTests('ViewChild');

    it('should mark view queries used in "ngAfterContentInit" as static', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@ViewChild('test', { static: true }) query: any;`);
    });

    it('should mark view queries used in "ngAfterContentChecked" as static', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@ViewChild('test', { static: true }) query: any;`);
    });
  });

  describe('ContentChild', () => {
    createQueryTests('ContentChild');

    it('should not mark content queries used in "ngAfterContentInit" as static', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@ContentChild('test', { static: false }) query: any;`);
    });

    it('should not mark content queries used in "ngAfterContentChecked" as static', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@ContentChild('test', { static: false }) query: any;`);
    });
  });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() { runner.runSchematic('migration-v8-static-queries', {}, tree); }

  function createQueryTests(queryType: 'ViewChild' | 'ContentChild') {
    it('should mark queries as dynamic', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: false }) unused: any;`);
      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('dynamic', { static: false }) dynamic: any`);
    });

    it('should mark queries used in "ngOnChanges" as static', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should mark queries used in "ngOnInit" as static', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should mark queries used in "ngDoCheck" as static', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should keep existing query options when updating timing', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { /* test */ read: null, static: true }) query: any;`);
    });

    it('should not overwrite existing explicit query timing', () => {
      writeFile('/index.ts', `
        import {Component, ${queryType}} from '@angular/core';
        
        @Component({template: '<span #test></span>'})
        export class MyComp {
          @${queryType}('test', {static: /* untouched */ someVal}) query: any;
        }
      `);

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', {static: /* untouched */ someVal}) query: any;`);
    });

    it('should detect queries used in deep method chain', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should properly exit if recursive function is analyzed', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: false }) query: any;`);
    });

    it('should detect queries used in newly instantiated classes', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query2: any;`);
    });

    it('should detect queries used in parenthesized new expressions', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should detect queries in lifecycle hook with string literal name', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should detect static queries within nested inheritance', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should detect static queries used within input setters', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should detect inputs defined in metadata', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should detect aliased inputs declared in metadata', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should not mark query as static if query is used in non-input setter', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: false }) query: any;`);
    });

    it('should detect input decorator on setter', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should detect setter inputs in derived classes', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should properly detect static query in external derived class', () => {
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

      runMigration();

      expect(tree.readContent('/src/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should not mark queries used in promises as static', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: false }) query: any;`);
      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query2: any;`);
    });

    it('should not mark queries used in setTimeout as static', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: false }) query: any;`);
      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query2: any;`);
      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: false }) query3: any;`);
    });

    it('should not mark queries used in "addEventListener" as static', () => {
      writeFile('/index.ts', `
        import {Component, ElementRef, ${queryType}} from '@angular/core';
                        
        @Component({template: '<span #test></span>'})
        export class MyComp {
          private @${queryType}('test') query: any;
        
          constructor(private elementRef: ElementRef) {}
        
          ngOnInit() {
            this.elementRef.addEventListener(() => {
              this.query.classList.add('test');
            });
          }
        }
      `);

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: false }) query: any;`);
    });

    it('should not mark queries used in "requestAnimationFrame" as static', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: false }) query: any;`);
    });

    it('should mark queries used in immediately-invoked function expression as static', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query2: any;`);
    });

    it('should detect static queries used in external function-like declaration', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should detect static queries used through getter property access', () => {
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

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should detect static queries used through external getter access', () => {
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
          
          get query() { return this.comp.query; }
        }
      `);

      runMigration();

      expect(tree.readContent('/index.ts'))
          .toContain(`@${queryType}('test', { static: true }) query: any;`);
    });

    it('should properly handle multiple tsconfig files', () => {
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
      runMigration();

      expect(tree.readContent('/src/index.ts'))
          .toContain(`@${queryType}('test', { static: false }) query: any;`);
    });
  }
});
