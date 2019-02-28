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
    runner = new SchematicTestRunner('test', require.resolve('../../migrations.json'));
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

  // Create tests for "ViewChild" and "ContentChild".
  createQueryTests('ViewChild');
  createQueryTests('ContentChild');

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
          .toContain(`@${queryType}('test', { static: false }) query2: any;`);
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
  }
});
