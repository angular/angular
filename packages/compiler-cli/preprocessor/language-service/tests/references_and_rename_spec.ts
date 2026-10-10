/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TsGoFacade} from '../src/facade';
import * as path from 'path';
import * as fs from 'node:fs/promises';
import * as rpc from 'vscode-jsonrpc/node';
import {fileURLToPath} from 'node:url';
import {Location} from 'vscode-languageserver';

import {TestEnv, getTestWorkspacePath, startTestServer} from './test_helpers';
import {TestFileManager} from './test_file_manager';
import {positionToOffset} from '../../src/tcb_ls_util.js';

function assertFileNames(locations: Location[] | null, expectedFileNames: string[]) {
  expect(locations).not.toBeNull();
  const fileNames = locations!.map((l) => {
    const p = l.uri.startsWith('file:') ? fileURLToPath(l.uri) : l.uri;
    return path.basename(p);
  });
  expect(fileNames.sort()).toEqual([...expectedFileNames].sort());
}

async function assertTextSpans(
  locations: Location[] | null,
  expectedTexts: string[],
  getFileContent: (filePath: string) => Promise<string>,
) {
  expect(locations).not.toBeNull();
  const actualTexts = await Promise.all(
    locations!.map(async (l) => {
      const filePath = l.uri.startsWith('file:') ? fileURLToPath(l.uri) : l.uri;
      const content = await getFileContent(filePath);
      const start = positionToOffset(content, l.range.start);
      const end = positionToOffset(content, l.range.end);
      return content.substring(start, end);
    }),
  );
  expect(actualTexts.sort()).toEqual([...expectedTexts].sort());
}

describe('References and Rename with TS 7 binary', () => {
  let connection: rpc.MessageConnection;
  let facade: TsGoFacade;
  let serverCleanup: () => Promise<void>;
  let env: TestEnv;

  const testWorkspacePath = getTestWorkspacePath();

  beforeAll(async () => {
    await fs.mkdir(testWorkspacePath, {recursive: true});

    const server = await startTestServer(testWorkspacePath);
    facade = server.facade;
    connection = server.connection;
    serverCleanup = server.cleanup;
  });

  beforeEach(() => {
    const fileManager = new TestFileManager(testWorkspacePath);
    env = new TestEnv(facade, fileManager, connection);
  });

  afterAll(async () => {
    await serverCleanup();
  });

  describe('cursor is on binding in component class', () => {
    it('gets component member references from TS file and external template', async () => {
      await env.createFile('app.html', '{{myProp}}');
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          templateUrl: './app.html',
          standalone: true,
        })
        export class AppCmp {
          myP¦rop!: string;
        }
      `;

      await env.run('app.ts', appTsContent, async (ls, filePath) => {
        const refs = await env.getReferencesAtPosition(ls, filePath);
        expect(refs).not.toBeNull();
        expect(refs!.length).toBe(2);
        assertFileNames(refs, ['app.html', 'app.ts']);
        await assertTextSpans(refs, ['myProp', 'myProp'], (f) => env.getFileContent(f));
      });
    });

    it('gets rename locations from TS file and external template', async () => {
      await env.createFile('app.html', '{{myProp}}');
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          templateUrl: './app.html',
          standalone: true,
        })
        export class AppCmp {
          myP¦rop!: string;
        }
      `;

      await env.run('app.ts', appTsContent, async (ls, filePath) => {
        const renameLocations = await env.findRenameLocations(ls, filePath);
        expect(renameLocations).not.toBeNull();
        expect(renameLocations!.length).toBe(2);
        assertFileNames(renameLocations, ['app.html', 'app.ts']);
        await assertTextSpans(renameLocations, ['myProp', 'myProp'], (f) => env.getFileContent(f));
      });
    });
  });

  describe('when cursor is on binding in an external template', () => {
    it('gets references', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          templateUrl: './app.html',
          standalone: true,
        })
        export class AppCmp {
          myProp = '';
        }
      `;
      await env.createFile('app.ts', appTsContent);
      const appHtmlContent = '{{myP¦rop}}';

      await env.run('app.html', appHtmlContent, async (ls, filePath) => {
        const refs = await env.getReferencesAtPosition(ls, filePath);
        expect(refs).not.toBeNull();
        expect(refs!.length).toBe(2);
        assertFileNames(refs, ['app.html', 'app.ts']);
        await assertTextSpans(refs, ['myProp', 'myProp'], (f) => env.getFileContent(f));
      });
    });

    it('gets rename locations', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          templateUrl: './app.html',
          standalone: true,
        })
        export class AppCmp {
          myProp = '';
        }
      `;
      await env.createFile('app.ts', appTsContent);
      const appHtmlContent = '{{myP¦rop}}';

      await env.run('app.html', appHtmlContent, async (ls, filePath) => {
        const renameLocations = await env.findRenameLocations(ls, filePath);
        expect(renameLocations).not.toBeNull();
        expect(renameLocations!.length).toBe(2);
        assertFileNames(renameLocations, ['app.html', 'app.ts']);
        await assertTextSpans(renameLocations, ['myProp', 'myProp'], (f) => env.getFileContent(f));
      });
    });
  });

  describe('when cursor is on binding in an inline template', () => {
    it('gets references and rename locations', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{myP¦rop}}',
          standalone: true,
        })
        export class AppCmp {
          myProp = '';
        }
      `;

      await env.run('app.ts', appTsContent, async (ls, filePath) => {
        const refs = await env.getReferencesAtPosition(ls, filePath);
        expect(refs).not.toBeNull();
        expect(refs!.length).toBe(2);
        assertFileNames(refs, ['app.ts', 'app.ts']);
        await assertTextSpans(refs, ['myProp', 'myProp'], (f) => env.getFileContent(f));

        const renameLocs = await env.findRenameLocations(ls, filePath);
        expect(renameLocs).not.toBeNull();
        expect(renameLocs!.length).toBe(2);
      });
    });
  });

  describe('function calls and arguments in template', () => {
    it('gets references and rename locations for method', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{myFn¦(val)}}',
          standalone: true,
        })
        export class AppCmp {
          val = 1;
          myFn(x: number) { return x; }
        }
      `;

      await env.run('app.ts', appTsContent, async (ls, filePath) => {
        const refs = await env.getReferencesAtPosition(ls, filePath);
        expect(refs).not.toBeNull();
        expect(refs!.length).toBe(2);
        await assertTextSpans(refs, ['myFn', 'myFn'], (f) => env.getFileContent(f));

        const renameLocs = await env.findRenameLocations(ls, filePath);
        expect(renameLocs).not.toBeNull();
        expect(renameLocs!.length).toBe(2);
        await assertTextSpans(renameLocs, ['myFn', 'myFn'], (f) => env.getFileContent(f));
      });
    });
  });

  describe('template event bindings and $event', () => {
    it('gets references and rename locations for event handler method without including synthetic $event parameter', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<button (click)="handle¦Click($event)">Click</button>',
          standalone: true,
        })
        export class AppCmp {
          handleClick(e: any) {}
        }
      `;

      await env.run('app.ts', appTsContent, async (ls, filePath) => {
        const refs = await env.getReferencesAtPosition(ls, filePath);
        expect(refs).not.toBeNull();
        expect(refs!.length).toBe(2);
        await assertTextSpans(refs, ['handleClick', 'handleClick'], (f) => env.getFileContent(f));

        const renameLocs = await env.findRenameLocations(ls, filePath);
        expect(renameLocs).not.toBeNull();
        expect(renameLocs!.length).toBe(2);
        await assertTextSpans(renameLocs, ['handleClick', 'handleClick'], (f) =>
          env.getFileContent(f),
        );
      });
    });
  });

  describe('keyed reads and keyed writes', () => {
    it('gets references and rename locations for property inside keyed read', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{myObj["myP¦rop"]}}',
          standalone: true,
        })
        export class AppCmp {
          myObj = {myProp: 'hello'};
        }
      `;

      await env.run('app.ts', appTsContent, async (ls, filePath) => {
        const refs = await env.getReferencesAtPosition(ls, filePath);
        expect(refs).not.toBeNull();
        expect(refs!.length).toBe(2);
        await assertTextSpans(refs, ['myProp', 'myProp'], (f) => env.getFileContent(f));

        const renameLocs = await env.findRenameLocations(ls, filePath);
        expect(renameLocs).not.toBeNull();
        expect(renameLocs!.length).toBe(2);
        await assertTextSpans(renameLocs, ['myProp', 'myProp'], (f) => env.getFileContent(f));
      });
    });
  });

  describe('element references (#ref)', () => {
    it('gets references and rename locations for template element reference', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<input #my¦Input /> {{myInput.value}}',
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('app.ts', appTsContent, async (ls, filePath) => {
        const refs = await env.getReferencesAtPosition(ls, filePath);
        expect(refs).not.toBeNull();
        expect(refs!.length).toBe(2);
        await assertTextSpans(refs, ['myInput', 'myInput'], (f) => env.getFileContent(f));

        const renameLocs = await env.findRenameLocations(ls, filePath);
        expect(renameLocs).not.toBeNull();
        expect(renameLocs!.length).toBe(2);
        await assertTextSpans(renameLocs, ['myInput', 'myInput'], (f) => env.getFileContent(f));
      });
    });

    it('gets references and rename locations when cursor is on usage of template element reference', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<input #myInput /> {{myI¦nput.value}}',
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('app.ts', appTsContent, async (ls, filePath) => {
        const refs = await env.getReferencesAtPosition(ls, filePath);
        expect(refs).not.toBeNull();
        expect(refs!.length).toBe(2);
        await assertTextSpans(refs, ['myInput', 'myInput'], (f) => env.getFileContent(f));

        const renameLocs = await env.findRenameLocations(ls, filePath);
        expect(renameLocs).not.toBeNull();
        expect(renameLocs!.length).toBe(2);
        await assertTextSpans(renameLocs, ['myInput', 'myInput'], (f) => env.getFileContent(f));
      });
    });
  });

  describe('let declarations (@let)', () => {
    it('gets references and rename locations for @let declaration', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@let my¦Var = 10; {{myVar + 1}}',
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('app.ts', appTsContent, async (ls, filePath) => {
        const refs = await env.getReferencesAtPosition(ls, filePath);
        expect(refs).not.toBeNull();
        expect(refs!.length).toBe(2);
        await assertTextSpans(refs, ['myVar', 'myVar'], (f) => env.getFileContent(f));

        const renameLocs = await env.findRenameLocations(ls, filePath);
        expect(renameLocs).not.toBeNull();
        expect(renameLocs!.length).toBe(2);
        await assertTextSpans(renameLocs, ['myVar', 'myVar'], (f) => env.getFileContent(f));
      });
    });

    it('gets references and rename locations when cursor is on usage of @let variable', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@let myVar = 10; {{myV¦ar + 1}}',
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('app.ts', appTsContent, async (ls, filePath) => {
        const refs = await env.getReferencesAtPosition(ls, filePath);
        expect(refs).not.toBeNull();
        expect(refs!.length).toBe(2);
        await assertTextSpans(refs, ['myVar', 'myVar'], (f) => env.getFileContent(f));

        const renameLocs = await env.findRenameLocations(ls, filePath);
        expect(renameLocs).not.toBeNull();
        expect(renameLocs!.length).toBe(2);
        await assertTextSpans(renameLocs, ['myVar', 'myVar'], (f) => env.getFileContent(f));
      });
    });
  });

  describe('pipes', () => {
    it('gets references and rename locations for pipe from template usage', async () => {
      const pipeTsContent = `
        import {Pipe, PipeTransform} from '@angular/core';

        @Pipe({
          name: 'myPipe',
          standalone: true,
        })
        export class MyPipe implements PipeTransform {
          transform(value: string): string {
            return value;
          }
        }
      `;
      await env.createFile('pipe.ts', pipeTsContent);

      const appTsContent = `
        import {Component} from '@angular/core';
        import {MyPipe} from './pipe';

        @Component({
          selector: 'app-cmp',
          template: '{{"hello" | myP¦ipe}}',
          standalone: true,
          imports: [MyPipe],
        })
        export class AppCmp {}
      `;

      await env.run('app.ts', appTsContent, async (ls, filePath) => {
        const refs = await env.getReferencesAtPosition(ls, filePath);
        expect(refs).not.toBeNull();
        expect(refs!.length).toBe(2);
        assertFileNames(refs, ['app.ts', 'pipe.ts']);
        await assertTextSpans(refs, ['myPipe', 'myPipe'], (f) => env.getFileContent(f));

        const renameLocs = await env.findRenameLocations(ls, filePath);
        expect(renameLocs).not.toBeNull();
        expect(renameLocs!.length).toBe(2);
        assertFileNames(renameLocs, ['app.ts', 'pipe.ts']);
        await assertTextSpans(renameLocs, ['myPipe', 'myPipe'], (f) => env.getFileContent(f));
      });
    });

    it('gets references and rename locations when cursor is on pipe name string in @Pipe decorator', async () => {
      const appTsContent = `
        import {Component, Pipe, PipeTransform} from '@angular/core';

        @Pipe({
          name: 'myP¦ipe',
          standalone: true,
        })
        export class MyPipe implements PipeTransform {
          transform(value: string): string {
            return value;
          }
        }

        @Component({
          selector: 'app-cmp',
          template: '{{"hello" | myPipe}}',
          standalone: true,
          imports: [MyPipe],
        })
        export class AppCmp {}
      `;

      await env.run('app.ts', appTsContent, async (ls, filePath) => {
        const refs = await env.getReferencesAtPosition(ls, filePath);
        expect(refs).not.toBeNull();
        expect(refs!.length).toBe(2);
        await assertTextSpans(refs, ['myPipe', 'myPipe'], (f) => env.getFileContent(f));

        const renameLocs = await env.findRenameLocations(ls, filePath);
        expect(renameLocs).not.toBeNull();
        expect(renameLocs!.length).toBe(2);
        await assertTextSpans(renameLocs, ['myPipe', 'myPipe'], (f) => env.getFileContent(f));
      });
    });
  });

  describe('inputs and outputs', () => {
    it('gets references and rename locations for @Input property', async () => {
      const dirTsContent = `
        import {Directive, Input} from '@angular/core';

        @Directive({
          selector: '[myInpDir]',
          standalone: true,
        })
        export class MyInpDir {
          @Input() myInp: string = '';
        }
      `;
      await env.createFile('inp_dir.ts', dirTsContent);

      const appTsContent = `
        import {Component} from '@angular/core';
        import {MyInpDir} from './inp_dir';

        @Component({
          selector: 'app-cmp',
          template: '<div myInpDir [myI¦np]="val"></div>',
          standalone: true,
          imports: [MyInpDir],
        })
        export class AppCmp {
          val = 'hello';
        }
      `;

      await env.run('app.ts', appTsContent, async (ls, filePath) => {
        const refs = await env.getReferencesAtPosition(ls, filePath);
        expect(refs).not.toBeNull();
        expect(refs!.length).toBe(2);
        assertFileNames(refs, ['app.ts', 'inp_dir.ts']);
        await assertTextSpans(refs, ['myInp', 'myInp'], (f) => env.getFileContent(f));

        const renameLocs = await env.findRenameLocations(ls, filePath);
        expect(renameLocs).not.toBeNull();
        expect(renameLocs!.length).toBe(2);
        assertFileNames(renameLocs, ['app.ts', 'inp_dir.ts']);
        await assertTextSpans(renameLocs, ['myInp', 'myInp'], (f) => env.getFileContent(f));
      });
    });

    it('gets references and rename locations for @Output property', async () => {
      const dirTsContent = `
        import {Directive, Output, EventEmitter} from '@angular/core';

        @Directive({
          selector: '[myOutDir]',
          standalone: true,
        })
        export class MyOutDir {
          @Output() myOut = new EventEmitter<string>();
        }
      `;
      await env.createFile('out_dir.ts', dirTsContent);

      const appTsContent = `
        import {Component} from '@angular/core';
        import {MyOutDir} from './out_dir';

        @Component({
          selector: 'app-cmp',
          template: '<div myOutDir (myO¦ut)="val = $event"></div>',
          standalone: true,
          imports: [MyOutDir],
        })
        export class AppCmp {
          val = 'hello';
        }
      `;

      await env.run('app.ts', appTsContent, async (ls, filePath) => {
        const refs = await env.getReferencesAtPosition(ls, filePath);
        expect(refs).not.toBeNull();
        expect(refs!.length).toBe(2);
        assertFileNames(refs, ['app.ts', 'out_dir.ts']);
        await assertTextSpans(refs, ['myOut', 'myOut'], (f) => env.getFileContent(f));

        const renameLocs = await env.findRenameLocations(ls, filePath);
        expect(renameLocs).not.toBeNull();
        expect(renameLocs!.length).toBe(2);
        assertFileNames(renameLocs, ['app.ts', 'out_dir.ts']);
        await assertTextSpans(renameLocs, ['myOut', 'myOut'], (f) => env.getFileContent(f));
      });
    });
  });

  describe('host directives', () => {
    it('gets references and rename locations for host directive @Input property', async () => {
      const hostDirTsContent = `
        import {Directive, Input} from '@angular/core';

        @Directive({
          standalone: true,
        })
        export class HostDir {
          @Input() hostInp: string = '';
        }
      `;
      await env.createFile('host_dir_ref_test.ts', hostDirTsContent);

      const dirTsContent = `
        import {Directive} from '@angular/core';
        import {HostDir} from './host_dir_ref_test';

        @Directive({
          selector: '[myDir]',
          standalone: true,
          hostDirectives: [{
            directive: HostDir,
            inputs: ['hostInp'],
          }],
        })
        export class MyDir {}
      `;
      await env.createFile('my_dir_ref_test.ts', dirTsContent);

      const appTsContent = `
        import {Component} from '@angular/core';
        import {MyDir} from './my_dir_ref_test';

        @Component({
          selector: 'app-cmp',
          template: '<div myDir [hostI¦np]="val"></div>',
          standalone: true,
          imports: [MyDir],
        })
        export class AppCmp {
          val = 'hello';
        }
      `;

      await env.run('app_host_dir_ref_test.ts', appTsContent, async (ls, filePath) => {
        const refs = await env.getReferencesAtPosition(ls, filePath);
        expect(refs).not.toBeNull();
        expect(refs!.length).toBe(2);
        assertFileNames(refs, ['app_host_dir_ref_test.ts', 'host_dir_ref_test.ts']);
        await assertTextSpans(refs, ['hostInp', 'hostInp'], (f) => env.getFileContent(f));

        const renameLocs = await env.findRenameLocations(ls, filePath);
        expect(renameLocs).not.toBeNull();
        expect(renameLocs!.length).toBe(2);
        assertFileNames(renameLocs, ['app_host_dir_ref_test.ts', 'host_dir_ref_test.ts']);
        await assertTextSpans(renameLocs, ['hostInp', 'hostInp'], (f) => env.getFileContent(f));
      });
    });

    it('gets references and rename locations for aliased host directive @Input property', async () => {
      const hostDirTsContent = `
        import {Directive, Input} from '@angular/core';

        @Directive({
          standalone: true,
        })
        export class HostDir {
          @Input() originalInp: string = '';
        }
      `;
      await env.createFile('host_dir_alias_ref_test.ts', hostDirTsContent);

      const dirTsContent = `
        import {Directive} from '@angular/core';
        import {HostDir} from './host_dir_alias_ref_test';

        @Directive({
          selector: '[myDir]',
          standalone: true,
          hostDirectives: [{
            directive: HostDir,
            inputs: ['originalInp: customAlias'],
          }],
        })
        export class MyDir {}
      `;
      await env.createFile('my_dir_alias_ref_test.ts', dirTsContent);

      const appTsContent = `
        import {Component} from '@angular/core';
        import {MyDir} from './my_dir_alias_ref_test';

        @Component({
          selector: 'app-cmp',
          template: '<div myDir [customA¦lias]="val"></div>',
          standalone: true,
          imports: [MyDir],
        })
        export class AppCmp {
          val = 'hello';
        }
      `;

      await env.run('app_host_dir_alias_ref_test.ts', appTsContent, async (ls, filePath) => {
        const refs = await env.getReferencesAtPosition(ls, filePath);
        expect(refs).not.toBeNull();
        expect(refs!.length).toBe(2);
        assertFileNames(refs, ['app_host_dir_alias_ref_test.ts', 'host_dir_alias_ref_test.ts']);
        await assertTextSpans(refs, ['customAlias', 'originalInp'], (f) => env.getFileContent(f));

        const renameLocs = await env.findRenameLocations(ls, filePath);
        expect(renameLocs).not.toBeNull();
        expect(renameLocs!.length).toBe(2);
        assertFileNames(renameLocs, [
          'app_host_dir_alias_ref_test.ts',
          'host_dir_alias_ref_test.ts',
        ]);
        await assertTextSpans(renameLocs, ['customAlias', 'originalInp'], (f) =>
          env.getFileContent(f),
        );
      });
    });

    it('gets references and rename locations for host directive @Output property', async () => {
      const hostDirTsContent = `
        import {Directive, Output, EventEmitter} from '@angular/core';

        @Directive({
          standalone: true,
        })
        export class HostDir {
          @Output() hostOut = new EventEmitter<string>();
        }
      `;
      await env.createFile('host_dir_out_ref_test.ts', hostDirTsContent);

      const dirTsContent = `
        import {Directive} from '@angular/core';
        import {HostDir} from './host_dir_out_ref_test';

        @Directive({
          selector: '[myDir]',
          standalone: true,
          hostDirectives: [{
            directive: HostDir,
            outputs: ['hostOut'],
          }],
        })
        export class MyDir {}
      `;
      await env.createFile('my_dir_out_ref_test.ts', dirTsContent);

      const appTsContent = `
        import {Component} from '@angular/core';
        import {MyDir} from './my_dir_out_ref_test';

        @Component({
          selector: 'app-cmp',
          template: '<div myDir (hostO¦ut)="val = $event"></div>',
          standalone: true,
          imports: [MyDir],
        })
        export class AppCmp {
          val = 'hello';
        }
      `;

      await env.run('app_host_dir_out_ref_test.ts', appTsContent, async (ls, filePath) => {
        const refs = await env.getReferencesAtPosition(ls, filePath);
        expect(refs).not.toBeNull();
        expect(refs!.length).toBe(2);
        assertFileNames(refs, ['app_host_dir_out_ref_test.ts', 'host_dir_out_ref_test.ts']);
        await assertTextSpans(refs, ['hostOut', 'hostOut'], (f) => env.getFileContent(f));

        const renameLocs = await env.findRenameLocations(ls, filePath);
        expect(renameLocs).not.toBeNull();
        expect(renameLocs!.length).toBe(2);
        assertFileNames(renameLocs, ['app_host_dir_out_ref_test.ts', 'host_dir_out_ref_test.ts']);
        await assertTextSpans(renameLocs, ['hostOut', 'hostOut'], (f) => env.getFileContent(f));
      });
    });

    it('gets references and rename locations for chained host directive in multi-directory setup', async () => {
      const innerHostTs = `
        import {Directive, Input} from '@angular/core';

        @Directive({
          standalone: true,
        })
        export class NestedHostDir {
          @Input() nestedInp: string = '';
        }
      `;
      await env.createFile('directives/nested/nested_host_dir.ts', innerHostTs);

      const wrapperDirTs = `
        import {Directive} from '@angular/core';
        import {NestedHostDir} from './nested/nested_host_dir';

        @Directive({
          selector: '[wrapperDir]',
          standalone: true,
          hostDirectives: [{
            directive: NestedHostDir,
            inputs: ['nestedInp: aliasedNestedInp'],
          }],
        })
        export class WrapperDir {}
      `;
      await env.createFile('directives/wrapper_dir.ts', wrapperDirTs);

      const appTsContent = `
        import {Component} from '@angular/core';
        import {WrapperDir} from '../directives/wrapper_dir';

        @Component({
          selector: 'app-cmp',
          template: '<div wrapperDir [aliasedNe¦stedInp]="val"></div>',
          standalone: true,
          imports: [WrapperDir],
        })
        export class AppCmp {
          val = 'hello';
        }
      `;

      await env.run('components/app_chained_ref_test.ts', appTsContent, async (ls, filePath) => {
        const refs = await env.getReferencesAtPosition(ls, filePath);
        expect(refs).not.toBeNull();
        expect(refs!.length).toBe(2);
        assertFileNames(refs, ['app_chained_ref_test.ts', 'nested_host_dir.ts']);
        await assertTextSpans(refs, ['aliasedNestedInp', 'nestedInp'], (f) =>
          env.getFileContent(f),
        );

        const renameLocs = await env.findRenameLocations(ls, filePath);
        expect(renameLocs).not.toBeNull();
        expect(renameLocs!.length).toBe(2);
        assertFileNames(renameLocs, ['app_chained_ref_test.ts', 'nested_host_dir.ts']);
        await assertTextSpans(renameLocs, ['aliasedNestedInp', 'nestedInp'], (f) =>
          env.getFileContent(f),
        );
      });
    });
  });

  describe('getRenameInfo (prepareRename)', () => {
    it('returns rename info for template property read', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{myP¦rop}}',
          standalone: true,
        })
        export class AppCmp {
          myProp = '';
        }
      `;

      await env.run('app.ts', appTsContent, async (ls, filePath) => {
        const info = await env.getRenameInfo(ls, filePath);
        expect(info).not.toBeNull();
        expect(info!.canRename).toBe(true);
        expect(info!.displayName).toBe('myProp');
      });
    });

    it('returns canRename: false for un-renameable locations', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<div>¦</div>',
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('app.ts', appTsContent, async (ls, filePath) => {
        const info = await env.getRenameInfo(ls, filePath);
        expect(info).not.toBeNull();
        expect(info!.canRename).toBe(false);
      });
    });
  });
});
