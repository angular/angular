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
import {TextDocument} from 'vscode-languageserver-textdocument';

import {TestEnv, startTestServer} from './test_helpers';
import {TestFileManager} from './test_file_manager';

describe('Definitions with TS 7 binary', () => {
  let connection: rpc.MessageConnection;
  let facade: TsGoFacade;
  let serverCleanup: () => Promise<void>;
  let env: TestEnv;

  const testWorkspacePath = path.resolve(__dirname, 'test-workspace');

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

  it('should get definition for component', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'test-comp',
        template: '<div></div>',
        standalone: true,
      })
      export class TestComponent {}

      @Component({
        selector: 'app-cmp',
        template: '<¦test-comp></test-comp>',
        standalone: true,
        imports: [TestComponent],
      })
      export class AppCmp {}
    `;

    await env.run('app_components_def_test.ts', appTsContent, async (ls, filePath) => {
      await ls.getTcb(filePath, {line: 0, character: 0});
      await env.expectDefinitionAtCursor(ls, filePath, 'app_components_def_test.ts');
    });
  });

  it('should get definition for a let declaration', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'app-cmp',
        template: '@let foo = {value: 123}; {{fo¦o.value}}',
        standalone: true,
      })
      export class AppCmp {}
    `;

    await env.run('app_let_def_test.ts', appTsContent, async (ls, filePath) => {
      await ls.getTcb(filePath, {line: 0, character: 0});
      await env.expectDefinitionAtCursor(ls, filePath, 'app_let_def_test.ts');
    });
  });

  it('gets definition for template reference in overridden template', async () => {
    const appHtmlContent = '<input #myInput /> {{myIn¦put.value}}';
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'app-cmp',
        templateUrl: './app.html',
        standalone: true,
      })
      export class AppCmp {}
    `;

    await env.createFile('app.ts', appTsContent);

    await env.run('app.html', appHtmlContent, async (ls, filePath) => {
      await ls.getTcb(filePath, {line: 0, character: 0});
      await env.expectDefinitionAtCursor(ls, filePath, 'app.html');
    });
  });

  it('returns the pipe definitions when checkTypeOfPipes is false', async () => {
    const appHtmlContent = '{{"hello" | my¦Pipe}}';
    const appTsContent = `
      import {Component, Pipe, PipeTransform} from '@angular/core';

      @Pipe({
        name: 'myPipe',
        standalone: true,
      })
      export class MyPipe implements PipeTransform {
        transform(value: string): string {
          return value;
        }
      }

      @Component({
        selector: 'app-cmp',
        templateUrl: './pipe_test.html',
        standalone: true,
        imports: [MyPipe],
      })
      export class AppCmp {}
    `;

    await env.createFile('pipe_test.ts', appTsContent);
    await env.openFile(`file://${path.join(testWorkspacePath, 'pipe_test.ts')}`, appTsContent);

    await env.run(
      'pipe_test.html',
      appHtmlContent,
      async (ls, filePath) => {
        await ls.getTcb(filePath, {line: 0, character: 0});
        await env.expectDefinitionAtCursor(ls, filePath, 'pipe_test.ts');
      },
      {strictTemplates: false},
    );
  });

  it('gets definitions for all inputs when attribute matches more than one', async () => {
    const appHtmlContent = '<div dir inpu¦tA="abc"></div>';
    const appTsContent = `
      import {Component} from '@angular/core';
      import {MyDir} from './dir';
      import {MyDir2} from './dir2';

      @Component({
        selector: 'app-cmp',
        templateUrl: './app.html',
        standalone: true,
        imports: [MyDir, MyDir2],
      })
      export class AppCmp {}
    `;

    const dirTsContent = `
      import {Directive, Input} from '@angular/core';

      @Directive({
        selector: '[dir]',
        standalone: true,
      })
      export class MyDir {
        @Input() inputA!: any;
      }
    `;

    const dir2TsContent = `
      import {Directive, Input} from '@angular/core';

      @Directive({
        selector: '[dir]',
        standalone: true,
      })
      export class MyDir2 {
        @Input() inputA!: any;
      }
    `;

    await env.createFile('app.ts', appTsContent);
    await env.createFile('dir.ts', dirTsContent);
    await env.createFile('dir2.ts', dir2TsContent);

    await env.run('app.html', appHtmlContent, async (ls, filePath) => {
      await ls.getTcb(filePath, {line: 0, character: 0});

      const fileContent = await env.getFileContent(filePath);
      const doc = TextDocument.create(`file://${filePath}`, 'typescript', 0, fileContent);
      const position = doc.positionAt(env.getCursorOffset()!);
      const result = await ls.getDefinition(
        filePath,
        env.getCursorOffset()!,
        position,
        fileContent,
      );

      expect(result).toBeTruthy();
      const locations = Array.isArray(result) ? result : [result];
      const fileNames = locations.map((l: any) => l.uri || l.targetUri);
      expect(fileNames.some((f: string) => f && f.includes('dir.ts'))).toBe(true);
      expect(fileNames.some((f: string) => f && f.includes('dir2.ts'))).toBe(true);
    });
  });

  it('gets definitions for all signal-inputs when attribute matches more than one', async () => {
    const appHtmlContent = '<div dir inpu¦tA="abc"></div>';
    const appTsContent = `
      import {Component} from '@angular/core';
      import {MyDir} from './dir';
      import {MyDir2} from './dir2';

      @Component({
        selector: 'app-cmp',
        templateUrl: './app.html',
        standalone: true,
        imports: [MyDir, MyDir2],
      })
      export class AppCmp {}
    `;

    const dirTsContent = `
      import {Directive, input} from '@angular/core';

      @Directive({
        selector: '[dir]',
        standalone: true,
      })
      export class MyDir {
        inputA = input<any>();
      }
    `;

    const dir2TsContent = `
      import {Directive, input} from '@angular/core';

      @Directive({
        selector: '[dir]',
        standalone: true,
      })
      export class MyDir2 {
        inputA = input<any>();
      }
    `;

    await env.createFile('app.ts', appTsContent);
    const dirPath = await env.createFile('dir.ts', dirTsContent);
    await env.openFile(dirPath, dirTsContent);
    const dir2Path = await env.createFile('dir2.ts', dir2TsContent);
    await env.openFile(dir2Path, dir2TsContent);

    await env.run('app.html', appHtmlContent, async (ls, filePath) => {
      await ls.getTcb(filePath, {line: 0, character: 0});

      const fileContent = await env.getFileContent(filePath);
      const doc = TextDocument.create(`file://${filePath}`, 'typescript', 0, fileContent);
      const position = doc.positionAt(env.getCursorOffset()!);
      const result = await ls.getDefinition(
        filePath,
        env.getCursorOffset()!,
        position,
        fileContent,
      );

      expect(result).toBeTruthy();
      const locations = Array.isArray(result) ? result : [result];
      const fileNames = locations.map((l: any) => l.uri || l.targetUri);
      expect(fileNames.some((f: string) => f && f.includes('dir.ts'))).toBe(true);
      expect(fileNames.some((f: string) => f && f.includes('dir2.ts'))).toBe(true);
    });
  });

  it('gets definition for property of variable declared in template', async () => {
    const appHtmlContent = `
      <ng-container *ngIf="{prop: myVal} as myVar">
        {{myVar.pro¦p.name}}
      </ng-container>
    `;
    const appTsContent = `
      import {Component} from '@angular/core';
      import {CommonModule} from '@angular/common';

      @Component({
        selector: 'app-cmp',
        templateUrl: './app.html',
        standalone: true,
        imports: [CommonModule],
      })
      export class AppCmp {
        myVal = {name: 'Andrew'};
      }
    `;

    await env.createFile('app.ts', appTsContent);
    await env.openFile(`file://${path.join(testWorkspacePath, 'app.ts')}`, appTsContent);

    await env.run('app.html', appHtmlContent, async (ls, filePath) => {
      await env.expectDefinitionAtCursor(ls, filePath, 'app.html');
    });
  });

  it('gets definition for component property access in an arrow function', async () => {
    const appHtmlContent = '{{() => compon¦entProp + 1}}';
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'app-cmp',
        templateUrl: './app.html',
        standalone: true,
      })
      export class AppCmp {
        componentProp = 123;
      }
    `;

    await env.createFile('app.ts', appTsContent);
    await env.openFile(`file://${path.join(testWorkspacePath, 'app.ts')}`, appTsContent);

    await env.run('app.html', appHtmlContent, async (ls, filePath) => {
      await ls.getTcb(filePath, {line: 0, character: 0});
      await env.expectDefinitionAtCursor(ls, filePath, 'app.ts');
    });
  });

  it('gets definition for parameter access in an arrow function', async () => {
    const appHtmlContent = '{{(val) => va¦l + 1}}';
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'app-cmp',
        templateUrl: './app.html',
        standalone: true,
      })
      export class AppCmp {}
    `;

    await env.createFile('app.ts', appTsContent);

    await env.run('app.html', appHtmlContent, async (ls, filePath) => {
      await ls.getTcb(filePath, {line: 0, character: 0});
      await env.expectDefinitionAtCursor(ls, filePath, 'app.html');
    });
  });

  describe('when an input has a dollar sign', () => {
    it('can get definitions for input', async () => {
      const appTsContent = `
        import {Component, Input} from '@angular/core';

        @Component({
          selector: 'dollar-cmp',
          template: '',
          standalone: true,
        })
        export class DollarCmp {
          @Input() obs$!: string;
        }

        @Component({
          selector: 'app-cmp',
          template: '<dollar-cmp [ob¦s$]="greeting"></dollar-cmp>',
          standalone: true,
          imports: [DollarCmp],
        })
        export class AppCmp {
          greeting = 'hello';
        }
      `;

      await env.run('app_let_def_test.ts', appTsContent, async (ls, filePath) => {
        await ls.getTcb(filePath, {line: 0, character: 0});
        await env.expectDefinitionAtCursor(ls, filePath, 'app_let_def_test.ts');
      });
    });

    it('can get definitions for component', async () => {
      const appTsContent = `
        import {Component, Input} from '@angular/core';

        @Component({
          selector: 'dollar-cmp',
          template: '',
          standalone: true,
        })
        export class DollarCmp {
          @Input() obs$!: string;
        }

        @Component({
          selector: 'app-cmp',
          template: '<dollar-cm¦p [obs$]="greeting"></dollar-cmp>',
          standalone: true,
          imports: [DollarCmp],
        })
        export class AppCmp {
          greeting = 'hello';
        }
      `;

      await env.run('app_let_def_test.ts', appTsContent, async (ls, filePath) => {
        await ls.getTcb(filePath, {line: 0, character: 0});
        await env.expectDefinitionAtCursor(ls, filePath, 'app_let_def_test.ts');
      });
    });
  });

  describe('when a selector and input of a directive have a dollar sign', () => {
    it('can get definitions', async () => {
      const appTsContent = `
        import {Component, Directive, Input} from '@angular/core';

        @Directive({
          selector: '[dollar\\\\$]',
          standalone: true,
        })
        export class DollarDir {
          @Input() dollar$!: string;
        }

        @Component({
          selector: 'app-cmp',
          template: '<div [dollar¦$]="greeting"></div>',
          standalone: true,
          imports: [DollarDir],
        })
        export class AppCmp {
          greeting = 'hello';
        }
      `;

      await env.run('app_let_def_test.ts', appTsContent, async (ls, filePath) => {
        await ls.getTcb(filePath, {line: 0, character: 0});
        await env.expectDefinitionAtCursor(ls, filePath, 'app_let_def_test.ts');
      });
    });
  });

  describe('Host bindings', () => {
    it('gets definition for a host binding value of a component', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<div></div>',
          standalone: true,
          host: {
            '[title]': 'tit¦le'
          }
        })
        export class AppCmp {
          title = 'app';
        }
      `;

      await env.run('app_let_def_test.ts', appTsContent, async (ls, filePath) => {
        await ls.getTcb(filePath, {line: 0, character: 0});
        await env.expectDefinitionAtCursor(ls, filePath, 'app_let_def_test.ts');
      });
    });

    it('gets definition for a host listener of a component', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<div></div>',
          standalone: true,
          host: {
            '(click)': 'handleC¦lick()'
          }
        })
        export class AppCmp {
          handleClick() {}
        }
      `;

      await env.run('app_let_def_test.ts', appTsContent, async (ls, filePath) => {
        await ls.getTcb(filePath, {line: 0, character: 0});
        await env.expectDefinitionAtCursor(ls, filePath, 'app_let_def_test.ts');
      });
    });
  });

  describe('Selectorless tests', () => {
    it('gets definition for selectorless component', async () => {
      const appHtmlContent = '<Dep¦/>';
      const appTsContent = `
        import {Component} from '@angular/core';
        import {Dep} from './dep';

        @Component({
          selector: 'app-cmp',
          templateUrl: './app.html',
          standalone: true,
          imports: [Dep],
        })
        export class AppCmp {}
      `;

      const depTsContent = `
        import {Component} from '@angular/core';

        @Component({
          template: '',
          standalone: true,
        })
        export class Dep {}
      `;

      await env.createFile('app.ts', appTsContent);
      await env.createFile('dep.ts', depTsContent);

      await env.run(
        'app.html',
        appHtmlContent,
        async (ls, filePath) => {
          await ls.getTcb(filePath, {line: 0, character: 0});
          await env.expectDefinitionAtCursor(ls, filePath, 'dep.ts');
        },
        {enableSelectorless: true},
      );
    });

    it('gets definition for selectorless directive', async () => {
      const appHtmlContent = '<div @De¦p></div>';
      const appTsContent = `
        import {Component} from '@angular/core';
        import {Dep} from './dep';

        @Component({
          selector: 'app-cmp',
          templateUrl: './app.html',
          standalone: true,
          imports: [Dep],
        })
        export class AppCmp {}
      `;

      const depTsContent = `
        import {Directive} from '@angular/core';

        @Directive({
          standalone: true,
        })
        export class Dep {}
      `;

      await env.createFile('app.ts', appTsContent);
      await env.createFile('dep.ts', depTsContent);

      await env.run(
        'app.html',
        appHtmlContent,
        async (ls, filePath) => {
          await ls.getTcb(filePath, {line: 0, character: 0});
          await env.expectDefinitionAtCursor(ls, filePath, 'dep.ts');
        },
        {enableSelectorless: true},
      );
    });

    it('gets definition of selectorless component input', async () => {
      const appContent = `
        import {Component, Input} from '@angular/core';

        @Component({
          template: '',
          standalone: true,
        })
        export class Dep {
          @Input() someInput: any;
        }

        @Component({
          selector: 'app-cmp',
          template: '<Dep [someInpu¦t]="123"/>',
          standalone: true,
          imports: [Dep],
        })
        export class AppCmp {}
      `;

      await env.run(
        'app.ts',
        appContent,
        async (ls, filePath) => {
          await ls.getTcb(filePath, {line: 0, character: 0});
          await env.expectDefinitionAtCursor(ls, filePath, 'app.ts');
        },
        {enableSelectorless: true},
      );
    });

    it('gets definition of selectorless directive input', async () => {
      const appContent = `
        import {Component, Directive, Input} from '@angular/core';

        @Directive({
          standalone: true,
        })
        export class Dep {
          @Input() someInput: any;
        }

        @Component({
          selector: 'app-cmp',
          template: '<div @Dep([someInpu¦t]="123")></div>',
          standalone: true,
          imports: [Dep],
        })
        export class AppCmp {}
      `;

      await env.run(
        'app.ts',
        appContent,
        async (ls, filePath) => {
          await ls.getTcb(filePath, {line: 0, character: 0});
          await env.expectDefinitionAtCursor(ls, filePath, 'app.ts');
        },
        {enableSelectorless: true},
      );
    });

    it('gets definition of selectorless component output', async () => {
      const appContent = `
        import {Component, Output, EventEmitter} from '@angular/core';

        @Component({
          template: '',
          standalone: true,
        })
        export class Dep {
          @Output() someEvent = new EventEmitter<void>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<Dep (someEv¦ent)="handler()"/>',
          standalone: true,
          imports: [Dep],
        })
        export class AppCmp {
          handler() {}
        }
      `;

      await env.run(
        'app.ts',
        appContent,
        async (ls, filePath) => {
          await ls.getTcb(filePath, {line: 0, character: 0});
          await env.expectDefinitionAtCursor(ls, filePath, 'app.ts');
        },
        {enableSelectorless: true},
      );
    });

    it('gets definition of selectorless directive output', async () => {
      const appContent = `
        import {Component, Directive, Output, EventEmitter} from '@angular/core';

        @Directive({
          standalone: true,
        })
        export class Dep {
          @Output() someEvent = new EventEmitter<void>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<div @Dep((someEv¦ent)="handler()")></div>',
          standalone: true,
          imports: [Dep],
        })
        export class AppCmp {
          handler() {}
        }
      `;

      await env.run(
        'app.ts',
        appContent,
        async (ls, filePath) => {
          await ls.getTcb(filePath, {line: 0, character: 0});
          await env.expectDefinitionAtCursor(ls, filePath, 'app.ts');
        },
        {enableSelectorless: true},
      );
    });
  });

  xit('should go to the pre-compiled style sheet', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'app-cmp',
        template: '',
        styleUrls: ['./style.sc¦ss'],
        standalone: true,
      })
      export class AppCmp {}
    `;

    await env.createFile('style.scss', '');

    await env.run('app.ts', appTsContent, async (ls, filePath) => {
      await ls.getTcb(filePath, {line: 0, character: 0});
      await env.expectDefinitionAtCursor(ls, filePath, 'style.scss');
    });
  });

  xit('should go to the external template file', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'app-cmp',
        templateUrl: './app.ht¦ml',
        standalone: true,
      })
      export class AppCmp {
        name = 'Bob';
      }
    `;

    const cursorOffset = appTsContent.indexOf('¦');
    // Place {{name}} such that it spans across the cursorOffset
    const appHtmlContent = ' '.repeat(cursorOffset - 2) + '{{name}}';
    await env.createFile('app.html', appHtmlContent);

    const appTsPath = await env.createFile('app.ts', appTsContent);
    await env.openFile(`file://${appTsPath}`, appTsContent);

    await env.run('app.ts', appTsContent, async (ls, filePath) => {
      await ls.getTcb(filePath, {line: 0, character: 0});

      const doc = TextDocument.create(`file://${filePath}`, 'typescript', 0, appTsContent);
      const position = doc.positionAt(cursorOffset);

      const finalContent = appTsContent.replace('¦', '');
      const result = await ls.getDefinition(filePath, cursorOffset, position, finalContent);

      expect(result).toBeTruthy();
      const locations = Array.isArray(result) ? result : [result];
      expect(locations.length).toBe(1);
      const loc = locations[0];
      expect(loc.uri || loc.targetUri).toContain('app.html');

      const range = loc.range || loc.targetRange;
      expect(range).toEqual({
        start: {line: 0, character: 0},
        end: {line: 0, character: 0},
      });
    });
  });

  it('gets definitions for all outputs when attribute matches more than one', async () => {
    const appHtmlContent = '<div dir (someEv¦ent)="doSomething()"></div>';
    const appTsContent = `
      import {Component} from '@angular/core';
      import {MyDir} from './dir';
      import {MyDir2} from './dir2';

      @Component({
        selector: 'app-cmp',
        templateUrl: './app.html',
        standalone: true,
        imports: [MyDir, MyDir2],
      })
      export class AppCmp {
        doSomething() {}
      }
    `;

    const dirTsContent = `
      import {Directive, Output, EventEmitter} from '@angular/core';

      @Directive({
        selector: '[dir]',
        standalone: true,
      })
      export class MyDir {
        @Output() someEvent = new EventEmitter<void>();
      }
    `;

    const dir2TsContent = `
      import {Directive, Output, EventEmitter} from '@angular/core';

      @Directive({
        selector: '[dir]',
        standalone: true,
      })
      export class MyDir2 {
        @Output() someEvent = new EventEmitter<void>();
      }
    `;

    await env.createFile('app.ts', appTsContent);
    await env.createFile('dir.ts', dirTsContent);
    await env.createFile('dir2.ts', dir2TsContent);

    await env.run('app.html', appHtmlContent, async (ls, filePath) => {
      await ls.getTcb(filePath, {line: 0, character: 0});

      const doc = TextDocument.create(`file://${filePath}`, 'typescript', 0, appHtmlContent);
      const position = doc.positionAt(appHtmlContent.indexOf('¦'));
      const result = await ls.getDefinition(
        filePath,
        appHtmlContent.indexOf('¦'),
        position,
        appHtmlContent,
      );

      expect(result).toBeTruthy();
      const locations = Array.isArray(result) ? result : [result];
      const fileNames = locations.map((l: any) => l.uri || l.targetUri);
      expect(fileNames.some((f: string) => f && f.includes('dir.ts'))).toBe(true);
      expect(fileNames.some((f: string) => f && f.includes('dir2.ts'))).toBe(true);
    });
  });

  it('gets definitions for all model inputs when attribute matches more than one in a static attribute', async () => {
    const appContent = `
      import {Component, Directive, model} from '@angular/core';

      @Directive({
        selector: '[dir]',
        standalone: true,
      })
      export class MyDir {
        inputA = model('');
      }

      @Directive({
        selector: '[dir]',
        standalone: true,
      })
      export class MyDir2 {
        inputA = model('');
      }

      @Component({
        selector: 'app-cmp',
        template: '<div dir inpu¦tA="abc"></div>',
        standalone: true,
        imports: [MyDir, MyDir2],
      })
      export class AppCmp {}
    `;

    await env.run('app.ts', appContent, async (ls, filePath) => {
      const doc = TextDocument.create(`file://${filePath}`, 'typescript', 0, appContent);
      const position = doc.positionAt(appContent.indexOf('¦'));
      const result = await ls.getDefinition(
        filePath,
        appContent.indexOf('¦'),
        position,
        appContent,
      );

      expect(result).toBeTruthy();
      const locations = Array.isArray(result) ? result : [result];
      const fileNames = locations.map((l: any) => l.uri || l.targetUri);
      expect(fileNames.some((f: string) => f && f.includes('app.ts'))).toBe(true);
    });
  });

  it('gets definitions for all model inputs when attribute matches more than one in a two-way binding', async () => {
    const appContent = `
      import {Component, Directive, model} from '@angular/core';

      @Directive({
        selector: '[dir]',
        standalone: true,
      })
      export class MyDir {
        inputA = model('');
      }

      @Directive({
        selector: '[dir]',
        standalone: true,
      })
      export class MyDir2 {
        inputA = model('');
      }

      @Component({
        selector: 'app-cmp',
        template: '<div dir [(inpu¦tA)]="abc"></div>',
        standalone: true,
        imports: [MyDir, MyDir2],
      })
      export class AppCmp {
        abc = 'test';
      }
    `;

    await env.run('app.ts', appContent, async (ls, filePath) => {
      const doc = TextDocument.create(`file://${filePath}`, 'typescript', 0, appContent);
      const position = doc.positionAt(appContent.indexOf('¦'));
      const result = await ls.getDefinition(
        filePath,
        appContent.indexOf('¦'),
        position,
        appContent,
      );

      expect(result).toBeTruthy();
      const locations = Array.isArray(result) ? result : [result];
      const fileNames = locations.map((l: any) => l.uri || l.targetUri);
      expect(fileNames.some((f: string) => f && f.includes('app.ts'))).toBe(true);
    });
  });

  it('gets definition for a method in a void expression', async () => {
    const appHtmlContent = '<div (click)="void doSomet¦hing()"></div>';
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'app-cmp',
        templateUrl: './app.html',
        standalone: true,
      })
      export class AppCmp {
        doSomething() {}
      }
    `;

    await env.createFile('app.ts', appTsContent);
    await env.openFile(`file://${path.join(testWorkspacePath, 'app.ts')}`, appTsContent);

    await env.run('app.html', appHtmlContent, async (ls, filePath) => {
      await ls.getTcb(filePath, {line: 0, character: 0});
      await env.expectDefinitionAtCursor(ls, filePath, 'app.ts');
    });
  });

  it('gets definition for a tagged template literal expression', async () => {
    const appHtmlContent = '{{ tag`Hello, ${na¦me}!` }}';
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'app-cmp',
        templateUrl: './app.html',
        standalone: true,
      })
      export class AppCmp {
        name = 'Bob';
        tag = (...args: unknown[]) => '';
      }
    `;

    await env.createFile('app.ts', appTsContent);
    await env.openFile(`file://${path.join(testWorkspacePath, 'app.ts')}`, appTsContent);

    await env.run('app.html', appHtmlContent, async (ls, filePath) => {
      await ls.getTcb(filePath, {line: 0, character: 0});
      await env.expectDefinitionAtCursor(ls, filePath, 'app.ts');
    });
  });

  it('gets definition for a tagged template literal tag', async () => {
    const appHtmlContent = '{{ t¦ag`Hello, ${name}!` }}';
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'app-cmp',
        templateUrl: './app.html',
        standalone: true,
      })
      export class AppCmp {
        name = 'Bob';
        tag = (...args: unknown[]) => '';
      }
    `;

    await env.createFile('app.ts', appTsContent);
    await env.openFile(`file://${path.join(testWorkspacePath, 'app.ts')}`, appTsContent);

    await env.run('app.html', appHtmlContent, async (ls, filePath) => {
      await ls.getTcb(filePath, {line: 0, character: 0});
      await env.expectDefinitionAtCursor(ls, filePath, 'app.ts');
    });
  });

  it('gets definition for a host binding value of a directive', async () => {
    const dirTsContent = `
      import {Directive} from '@angular/core';

      @Directive({
        selector: '[my-dir]',
        standalone: true,
        host: {
          '[title]': 'myT¦itle',
        }
      })
      export class MyDir {
        myTitle = 'hello';
      }
    `;

    await env.run('dir.ts', dirTsContent, async (ls, filePath) => {
      await ls.getTcb(filePath, {line: 0, character: 0});
      await env.expectDefinitionAtCursor(ls, filePath, 'dir.ts');
    });
  });

  it('gets definition for a property in a "in" expression', async () => {
    const appHtmlContent = `<div>{{'foo' in myO¦bj}}</div>`;
    const appTsContent = `
      import {Component} from '@angular/core';

      @Component({
        selector: 'app-cmp',
        templateUrl: './app.html',
        standalone: true,
      })
      export class AppCmp {
        myObj: {foo: string} = {foo: 'bar'};
      }
    `;

    await env.createFile('app.ts', appTsContent);
    await env.openFile(`file://${path.join(testWorkspacePath, 'app.ts')}`, appTsContent);

    await env.run('app.html', appHtmlContent, async (ls, filePath) => {
      await ls.getTcb(filePath, {line: 0, character: 0});
      await env.expectDefinitionAtCursor(ls, filePath, 'app.ts');
    });
  });

  it('gets definition for host directive input', async () => {
    const appTsContent = `
      import {Component, Directive, Input} from '@angular/core';

      @Directive({
        standalone: true,
      })
      export class HostDir {
        @Input() hostInput = 'hello';
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{
          directive: HostDir,
          inputs: ['hostInput']
        }],
        standalone: true,
      })
      export class Dir {}

      @Component({
        selector: 'app-cmp',
        template: '<div dir [hostI¦nput]="val"></div>',
        standalone: true,
        imports: [Dir],
      })
      export class AppCmp {
        val = 'test';
      }
    `;

    await env.run('app_host_dir_def_test.ts', appTsContent, async (ls, filePath) => {
      await ls.getTcb(filePath, {line: 0, character: 0});
      await env.expectDefinitionAtCursor(ls, filePath, 'app_host_dir_def_test.ts');
    });
  });

  it('gets definition for aliased host directive input', async () => {
    const appTsContent = `
      import {Component, Directive, Input} from '@angular/core';

      @Directive({
        standalone: true,
      })
      export class HostDir {
        @Input() originalInput = 'hello';
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{
          directive: HostDir,
          inputs: ['originalInput: customAlias']
        }],
        standalone: true,
      })
      export class Dir {}

      @Component({
        selector: 'app-cmp',
        template: '<div dir [customA¦lias]="val"></div>',
        standalone: true,
        imports: [Dir],
      })
      export class AppCmp {
        val = 'test';
      }
    `;

    await env.run('app_host_dir_aliased_def_test.ts', appTsContent, async (ls, filePath) => {
      await ls.getTcb(filePath, {line: 0, character: 0});
      await env.expectDefinitionAtCursor(ls, filePath, 'app_host_dir_aliased_def_test.ts');
    });
  });

  it('gets definition for host directive output', async () => {
    const appTsContent = `
      import {Component, Directive, Output, EventEmitter} from '@angular/core';

      @Directive({
        standalone: true,
      })
      export class HostDir {
        @Output() hostOutput = new EventEmitter<string>();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{
          directive: HostDir,
          outputs: ['hostOutput']
        }],
        standalone: true,
      })
      export class Dir {}

      @Component({
        selector: 'app-cmp',
        template: '<div dir (hostO¦utput)="handleClick($event)"></div>',
        standalone: true,
        imports: [Dir],
      })
      export class AppCmp {
        handleClick(val: string) {}
      }
    `;

    await env.run('app_host_dir_output_def_test.ts', appTsContent, async (ls, filePath) => {
      await ls.getTcb(filePath, {line: 0, character: 0});
      await env.expectDefinitionAtCursor(ls, filePath, 'app_host_dir_output_def_test.ts');
    });
  });

  it('gets definition for chained host directive input in multi-directory setup', async () => {
    const innerHostTs = `
      import {Directive, Input} from '@angular/core';

      @Directive({
        standalone: true,
      })
      export class InnerHostDir {
        @Input() innerInput = 'inner';
      }
    `;
    await env.createFile('directives/nested/inner_host_dir.ts', innerHostTs);

    const wrapperDirTs = `
      import {Directive} from '@angular/core';
      import {InnerHostDir} from './nested/inner_host_dir';

      @Directive({
        selector: '[wrapperDir]',
        hostDirectives: [{
          directive: InnerHostDir,
          inputs: ['innerInput: chainedAlias']
        }],
        standalone: true,
      })
      export class WrapperDir {}
    `;
    await env.createFile('directives/wrapper_dir.ts', wrapperDirTs);

    const appTsContent = `
      import {Component} from '@angular/core';
      import {WrapperDir} from '../directives/wrapper_dir';

      @Component({
        selector: 'app-cmp',
        template: '<div wrapperDir [chainedA¦lias]="val"></div>',
        standalone: true,
        imports: [WrapperDir],
      })
      export class AppCmp {
        val = 'test';
      }
    `;

    await env.run('components/app_multi_dir_def_test.ts', appTsContent, async (ls, filePath) => {
      await ls.getTcb(filePath, {line: 0, character: 0});
      await env.expectDefinitionAtCursor(ls, filePath, 'inner_host_dir.ts');
    });
  });

  it('gets definition for host directive on component itself', async () => {
    const hostDirTs = `
      import {Directive, Input} from '@angular/core';

      @Directive({
        standalone: true,
      })
      export class SelfHostDir {
        @Input() selfHostInput = 'self';
      }
    `;
    await env.createFile('directives/self_host_dir.ts', hostDirTs);

    const appTsContent = `
      import {Component} from '@angular/core';
      import {SelfHostDir} from '../directives/self_host_dir';

      @Component({
        selector: 'app-cmp',
        template: '<div>Hello</div>',
        standalone: true,
        hostDirectives: [{
          directive: SelfHostDir,
          inputs: ['selfHostInput']
        }],
      })
      export class AppCmp {}

      @Component({
        selector: 'parent-cmp',
        template: '<app-cmp [selfHostI¦nput]="val"></app-cmp>',
        standalone: true,
        imports: [AppCmp],
      })
      export class ParentCmp {
        val = 'test';
      }
    `;

    await env.run('components/parent_cmp_def_test.ts', appTsContent, async (ls, filePath) => {
      await ls.getTcb(filePath, {line: 0, character: 0});
      await env.expectDefinitionAtCursor(ls, filePath, 'self_host_dir.ts');
    });
  });
});
