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

import {TestEnv, getTestWorkspacePath, startTestServer} from './test_helpers';
import {TestFileManager} from './test_file_manager';

describe('Signature Help with TS 7 binary', () => {
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

  afterEach(async () => {
    await env.cleanup();
  });

  afterAll(async () => {
    await serverCleanup();
  });

  it('should handle an empty argument list', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'main-cmp',
        template: '{{ foo() }}',
        standalone: true,
      })
      export class MainCmp {
        foo(alpha: string, beta: number): string {
          return 'blah';
        }
      }
    `;

    await env.run(
      'sig_empty_args.ts',
      appTsContent.replace('foo()', 'foo(¦)'),
      async (ls, filePath) => {
        const help = await env.getSignatureHelp(ls, filePath);
        expect(help).not.toBeNull();
        expect(help!.signatures.length).toBe(1);
        expect(help!.signatures[0].label).toContain('foo(alpha: string, beta: number)');
        expect(help!.signatures[0].parameters).toBeDefined();
        expect(help!.signatures[0].parameters!.length).toBe(2);
        expect(help!.activeParameter === 0 || help!.activeParameter === undefined).toBe(true);
      },
    );
  });

  it('should handle a single argument', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'main-cmp',
        template: '{{ foo("test"¦) }}',
        standalone: true,
      })
      export class MainCmp {
        foo(alpha: string, beta: number): string {
          return 'blah';
        }
      }
    `;

    await env.run('sig_single_arg.ts', appTsContent, async (ls, filePath) => {
      const help = await env.getSignatureHelp(ls, filePath);
      expect(help).not.toBeNull();
      expect(help!.signatures.length).toBe(1);
      expect(help!.signatures[0].label).toContain('foo(alpha: string, beta: number)');
      expect(help!.activeParameter).toBe(0);
    });
  });

  it('should handle a position within the first of two arguments', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'main-cmp',
        template: '{{ foo("te¦st", 3) }}',
        standalone: true,
      })
      export class MainCmp {
        foo(alpha: string, beta: number): string {
          return 'blah';
        }
      }
    `;

    await env.run('sig_first_of_two.ts', appTsContent, async (ls, filePath) => {
      const help = await env.getSignatureHelp(ls, filePath);
      expect(help).not.toBeNull();
      expect(help!.signatures.length).toBe(1);
      expect(help!.signatures[0].label).toContain('foo(alpha: string, beta: number)');
      expect(help!.activeParameter).toBe(0);
    });
  });

  it('should handle a position within the second of two arguments', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'main-cmp',
        template: '{{ foo("test", 1 +¦ 2) }}',
        standalone: true,
      })
      export class MainCmp {
        foo(alpha: string, beta: number): string {
          return 'blah';
        }
      }
    `;

    await env.run('sig_second_of_two.ts', appTsContent, async (ls, filePath) => {
      const help = await env.getSignatureHelp(ls, filePath);
      expect(help).not.toBeNull();
      expect(help!.signatures.length).toBe(1);
      expect(help!.signatures[0].label).toContain('foo(alpha: string, beta: number)');
      expect(help!.activeParameter).toBe(1);
    });
  });

  it('should handle a position within a new, EmptyExpr argument', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'main-cmp',
        template: '{{ foo("test", ¦) }}',
        standalone: true,
      })
      export class MainCmp {
        foo(alpha: string, beta: number): string {
          return 'blah';
        }
      }
    `;

    await env.run('sig_empty_expr.ts', appTsContent, async (ls, filePath) => {
      const help = await env.getSignatureHelp(ls, filePath);
      expect(help).not.toBeNull();
      expect(help!.signatures.length).toBe(1);
      expect(help!.signatures[0].label).toContain('foo(alpha: string, beta: number)');
      expect(help!.activeParameter).toBe(1);
    });
  });

  it('should handle a single argument if the function is nested', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'main-cmp',
        template: '{{ someObj.foo("test"¦) }}',
        standalone: true,
      })
      export class MainCmp {
        someObj = {
          foo(alpha: string, beta: number): string {
            return 'blah';
          },
        };
      }
    `;

    await env.run('sig_nested_prop.ts', appTsContent, async (ls, filePath) => {
      const help = await env.getSignatureHelp(ls, filePath);
      expect(help).not.toBeNull();
      expect(help!.signatures.length).toBe(1);
      expect(help!.signatures[0].label).toContain('foo(alpha: string, beta: number)');
      expect(help!.activeParameter).toBe(0);
    });
  });

  it('should handle external templates', async () => {
    await env.createFile('sig_external.html', '<div>{{ foo("test", ¦) }}</div>');
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'main-cmp',
        templateUrl: './sig_external.html',
        standalone: true,
      })
      export class MainCmp {
        foo(alpha: string, beta: number): string {
          return 'blah';
        }
      }
    `;

    await env.createFile('sig_external.ts', appTsContent);
    const ls = await env.getLanguageService();
    const htmlPath = path.join(testWorkspacePath, 'sig_external.html');
    const help = await env.getSignatureHelp(ls, htmlPath);

    expect(help).not.toBeNull();
    expect(help!.signatures.length).toBe(1);
    expect(help!.signatures[0].label).toContain('foo(alpha: string, beta: number)');
    expect(help!.activeParameter).toBe(1);
  });

  it('should handle event bindings', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'main-cmp',
        template: '<button (click)="handleClick($event, ¦)">Click</button>',
        standalone: true,
      })
      export class MainCmp {
        handleClick(evt: MouseEvent, extra: number): void {}
      }
    `;

    await env.run('sig_event_binding.ts', appTsContent, async (ls, filePath) => {
      const help = await env.getSignatureHelp(ls, filePath);
      expect(help).not.toBeNull();
      expect(help!.signatures.length).toBe(1);
      expect(help!.signatures[0].label).toContain('handleClick(evt: MouseEvent, extra: number)');
      expect(help!.activeParameter).toBe(1);
    });
  });

  it('should handle method overloads', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'main-cmp',
        template: '{{ overloadFn(123, ¦) }}',
        standalone: true,
      })
      export class MainCmp {
        overloadFn(val: string): string;
        overloadFn(val: number, mult: number): number;
        overloadFn(val: string | number, mult?: number): string | number {
          return val;
        }
      }
    `;

    await env.run('sig_overloads.ts', appTsContent, async (ls, filePath) => {
      const help = await env.getSignatureHelp(ls, filePath);
      expect(help).not.toBeNull();
      expect(help!.signatures.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should handle safe method call', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'main-cmp',
        template: '{{ someObj?.foo("hello"¦) }}',
        standalone: true,
      })
      export class MainCmp {
        someObj?: {
          foo(val: string): void;
        };
      }
    `;

    await env.run('sig_safe_call.ts', appTsContent, async (ls, filePath) => {
      const help = await env.getSignatureHelp(ls, filePath);
      expect(help).not.toBeNull();
      expect(help!.signatures.length).toBe(1);
      expect(help!.signatures[0].label).toContain('foo(val: string)');
      expect(help!.activeParameter).toBe(0);
    });
  });

  it('should return null when cursor is on non-call expression', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'main-cmp',
        template: '{{ myP¦rop }}',
        standalone: true,
      })
      export class MainCmp {
        myProp = 'hello';
      }
    `;

    await env.run('sig_non_call.ts', appTsContent, async (ls, filePath) => {
      const help = await env.getSignatureHelp(ls, filePath);
      expect(help).toBeNull();
    });
  });

  it('should return null when cursor is on HTML element tag', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'main-cmp',
        template: '<d¦iv>Hello</div>',
        standalone: true,
      })
      export class MainCmp {}
    `;

    await env.run('sig_element_tag.ts', appTsContent, async (ls, filePath) => {
      const help = await env.getSignatureHelp(ls, filePath);
      expect(help).toBeNull();
    });
  });

  it('should handle nested function calls', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'main-cmp',
        template: '{{ outer(inner(¦)) }}',
        standalone: true,
      })
      export class MainCmp {
        outer(val: number): string {
          return 'outer';
        }
        inner(text: string): number {
          return 42;
        }
      }
    `;

    await env.run('sig_nested_calls.ts', appTsContent, async (ls, filePath) => {
      const help = await env.getSignatureHelp(ls, filePath);
      expect(help).not.toBeNull();
      expect(help!.signatures.length).toBe(1);
      expect(help!.signatures[0].label).toContain('inner(text: string)');
      expect(help!.activeParameter === 0 || help!.activeParameter === undefined).toBe(true);
    });
  });

  it('should clean up TCB-specific imports and prefixes from signature help', async () => {
    await env.createFile('types.ts', 'export interface CustomData { id: number; }');
    const appTsContent = `
      import {Component} from '@angular/core';
      import {CustomData} from './types';

      @Component({
        selector: 'main-cmp',
        template: '{{ processData(¦) }}',
        standalone: true,
      })
      export class MainCmp {
        processData(data: CustomData): CustomData {
          return data;
        }
      }
    `;

    await env.run('sig_tcb_cleanup.ts', appTsContent, async (ls, filePath) => {
      const help = await env.getSignatureHelp(ls, filePath);
      expect(help).not.toBeNull();
      expect(help!.signatures.length).toBe(1);
      const label = help!.signatures[0].label;
      expect(label).not.toMatch(/\bi[0-9]+\./);
      expect(label).not.toMatch(/_t[0-9]+/);
      expect(label).toContain('processData(data: CustomData): CustomData');
    });
  });
});
