/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync, writeFileSync} from 'fs';
import {dirname, join} from 'path';
import * as shx from 'shelljs';
import {Configuration, Linter} from 'tslint';

describe('Google3 ActivatedRouteSnapshot.fragment TSLint rule', () => {
  const rulesDirectory =
      dirname(require.resolve('../../migrations/google3/activatedRouteSnapshotFragmentRule'));

  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(process.env['TEST_TMPDIR']!, 'google3-test');
    shx.mkdir('-p', tmpDir);

    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('router.d.ts', `
      export declare class ActivatedRoute {
        get children(): ActivatedRoute[];
        fragment: Observable<string | null>;
        snapshot: ActivatedRouteSnapshot;
        url: Observable<UrlSegment[]>;
      }

      export declare class ActivatedRouteSnapshot {
        fragment: string | null;
        url: UrlSegment[];
      }
    `);

    writeFile('tsconfig.json', JSON.stringify({
      compilerOptions: {
        module: 'es2015',
        baseUrl: './',
        strictNullChecks: true,
        paths: {
          '@angular/router': ['router.d.ts'],
        }
      },
    }));
  });

  afterEach(() => shx.rm('-r', tmpDir));

  function runTSLint(fix: boolean) {
    const program = Linter.createProgram(join(tmpDir, 'tsconfig.json'));
    const linter = new Linter({fix, rulesDirectory: [rulesDirectory]}, program);
    const config =
        Configuration.parseConfigFile({rules: {'activated-route-snapshot-fragment': true}});

    program.getRootFileNames().forEach(fileName => {
      linter.lint(fileName, program.getSourceFile(fileName)!.getFullText(), config);
    });

    return linter;
  }

  function writeFile(fileName: string, content: string) {
    writeFileSync(join(tmpDir, fileName), content);
  }

  function getFile(fileName: string) {
    return readFileSync(join(tmpDir, fileName), 'utf8');
  }

  it('should flag accesses to `ActivatedRouteSnapshot.fragment`', () => {
    writeFile('/index.ts', `
      import {ActivatedRoute} from '@angular/router';

      class App {
        private _route: ActivatedRoute;

        ngOnInit() {
          this._route.fragment.subscribe();
        }

        getFragment() {
          return this._route.snapshot.fragment.foo;
        }
      }
  `);

    const linter = runTSLint(false);
    const failures = linter.getResult().failures.map(failure => failure.getFailure());
    expect(failures).toEqual(['`ActivatedRouteSnapshot.fragment` is nullable.']);
  });

  it('should add non-null assertions to accesses of `ActivatedRouteSnapshot.fragment`', () => {
    writeFile('/index.ts', `
      import {ActivatedRoute} from '@angular/router';

      class App {
        private _route: ActivatedRoute;

        getFragment() {
          return this._getSnapshot().fragment.foo;
        }

        private _getSnapshot() {
          return this._route.snapshot;
        }
      }
    `);

    runTSLint(true);

    expect(getFile('/index.ts')).toContain('return this._getSnapshot().fragment!.foo');
  });

  it('should not add non-null assertions to accesses of `ActivatedRouteSnapshot.fragment` if there is one already',
     () => {
       writeFile('/index.ts', `
        import {ActivatedRoute} from '@angular/router';

        class App {
          private _route: ActivatedRoute;

          getFragment() {
            return this._route.snapshot.fragment!.foo;
          }
        }
      `);

       runTSLint(true);

       expect(getFile('/index.ts')).toContain('return this._route.snapshot.fragment!.foo;');
     });

  it('should not add non-null assertions if the `ActivatedRouteSnapshot.fragment` has been null checked in an if statement',
     () => {
       writeFile('/index.ts', `
        import {ActivatedRouteSnapshot} from '@angular/router';

        function getFragmentValue(snapshot: ActivatedRouteSnapshot) {
          if (snapshot.fragment) {
            return snapshot.fragment.value;
          }

          return null;
        }
      `);

       runTSLint(true);

       const content = getFile('/index.ts');
       expect(content).toContain(`if (snapshot.fragment) {`);
       expect(content).toContain(`return snapshot.fragment.value;`);
     });

  it('should not add non-null assertions if the `ActivatedRouteSnapshot.fragment` has been null checked in an else if statement',
     () => {
       writeFile('/index.ts', `
        import {ActivatedRouteSnapshot} from '@angular/router';

        function getSnapshotValue(foo: boolean, snapshot: ActivatedRouteSnapshot) {
          if (foo) {
            return foo;
          } else if (snapshot.fragment) {
            return snapshot.fragment.value;
          }

          return null;
        }
      `);

       runTSLint(true);

       const content = getFile('/index.ts');
       expect(content).toContain(`} else if (snapshot.fragment) {`);
       expect(content).toContain(`return snapshot.fragment.value;`);
     });

  it('should not add non-null assertions if the `ActivatedRouteSnapshot.fragment` has been null checked in a ternary expression',
     () => {
       writeFile('/index.ts', `
        import {ActivatedRouteSnapshot} from '@angular/router';

        function getSnapshotValue(snapshot: ActivatedRouteSnapshot) {
          return snapshot.fragment ? snapshot.fragment.value : null;
        }
      `);

       runTSLint(true);

       expect(getFile('/index.ts'))
           .toContain(`return snapshot.fragment ? snapshot.fragment.value : null;`);
     });

  it('should not add non-null assertion to `ActivatedRouteSnapshot.fragment` if there is a safe access',
     () => {
       writeFile('/index.ts', `
        import {ActivatedRouteSnapshot} from '@angular/router';

        function getSnapshotValue(snapshot: ActivatedRouteSnapshot) {
          return snapshot.fragment?.value;
        }
      `);

       runTSLint(true);
       expect(getFile('/index.ts')).toContain(`return snapshot.fragment?.value;`);
     });
});
