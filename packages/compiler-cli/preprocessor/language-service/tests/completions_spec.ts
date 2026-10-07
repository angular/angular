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
import {CompletionItemKind} from 'vscode-languageserver';

import {
  TestEnv,
  startTestServer,
  expectContain,
  expectAll,
  expectDoesNotContain,
  expectReplacementText,
  expectContainInsertText,
  expectContainInsertTextWithSnippet,
  expectDoesNotContainInsertTextWithSnippet,
  toText,
} from './test_helpers';
import {TestFileManager} from './test_file_manager';

describe('Completions with TS 7 binary', () => {
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

  describe('in the global scope', () => {
    it('should complete an interpolation', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{ti¦}}',
          standalone: true,
        })
        export class AppCmp {
          title = 'App';
          hero = 123;
        }
      `;

      await env.run('global_interp_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Property, ['title', 'hero']);
      });
    });

    it('should complete an empty interpolation', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{ ¦ }}',
          standalone: true,
        })
        export class AppCmp {
          title = 'App';
          hero = 123;
        }
      `;

      await env.run('global_empty_interp_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Property, ['title', 'hero']);
      });
    });

    it('should complete a property binding', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<h1 [title]="ti¦"></h1>',
          standalone: true,
        })
        export class AppCmp {
          title = 'App';
          hero = 123;
        }
      `;

      await env.run('global_prop_binding_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Property, ['title', 'hero']);
      });
    });

    it('should complete an empty property binding', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<h1 [title]="¦"></h1>',
          standalone: true,
        })
        export class AppCmp {
          title = 'App';
          hero = 123;
        }
      `;

      await env.run('global_empty_prop_binding_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Property, ['title', 'hero']);
      });
    });

    it('should retrieve details for completions', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{ti¦}}',
          standalone: true,
        })
        export class AppCmp {
          /** This is the title of AppCmp */
          title = 'App';
        }
      `;

      await env.run('global_details_test.ts', appTs, async (ls, filePath) => {
        const details = await env.getCompletionEntryDetails(ls, filePath, 'title');
        expect(details).toBeDefined();
        expect(details?.detail).toContain('title: string');
        expect(toText(details?.documentation)).toContain('This is the title of AppCmp');
      });
    });

    it('should return reference completions', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<div #todo></div>{{t¦}}',
          standalone: true,
        })
        export class AppCmp {
          title = 'App';
        }
      `;

      await env.run('global_ref_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Property, ['title']);
        expectContain(completions, CompletionItemKind.Variable, ['todo']);
      });
    });

    it('should return variable completions', async () => {
      const appTs = `
        import {Component, Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';

        @Directive({
          selector: '[ngFor][ngForOf]',
          standalone: true,
        })
        export class NgForOf<T> {
          @Input() ngForOf!: T[];
          static ngTemplateContextGuard<T>(dir: NgForOf<T>, ctx: any): ctx is { $implicit: T, ngForOf: T[] } {
            return true;
          }
        }

        @Component({
          selector: 'app-cmp',
          template: '<div *ngFor="let hero of heroes">{{h¦}}</div>',
          standalone: true,
          imports: [NgForOf],
        })
        export class AppCmp {
          heroes = ['a'];
        }
      `;

      await env.run('global_var_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Property, ['heroes']);
        expectContain(completions, CompletionItemKind.Variable, ['hero']);
      });
    });

    it('should return completions inside nested structural directives', async () => {
      const appTs = `
        import {Component, Directive, Input} from '@angular/core';

        @Directive({
          selector: '[ngFor][ngForOf]',
          standalone: true,
        })
        export class NgForOf<T> {
          @Input() ngForOf!: T[];
        }

        @Directive({
          selector: '[ngIf]',
          standalone: true,
        })
        export class NgIf {
          @Input() ngIf!: any;
        }

        @Component({
          selector: 'app-cmp',
          template: '<div *ngFor="let hero of heroes"><div *ngIf="showDetails">{{h¦}}</div></div>',
          standalone: true,
          imports: [NgForOf, NgIf],
        })
        export class AppCmp {
          heroes = ['a'];
          showDetails = true;
        }
      `;

      await env.run('nested_structural_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Property, ['heroes']);
        expectContain(completions, CompletionItemKind.Variable, ['hero']);
      });
    });

    it('should return completions in mixed structural and block control flow', async () => {
      const appTs = `
        import {Component, Directive, Input} from '@angular/core';

        @Directive({
          selector: '[ngIf]',
          standalone: true,
        })
        export class NgIf {
          @Input() ngIf!: any;
        }

        @Component({
          selector: 'app-cmp',
          template: '<div *ngIf="true">@for (item of items; track item) { {{it¦}} }</div>',
          standalone: true,
          imports: [NgIf],
        })
        export class AppCmp {
          items = ['a'];
        }
      `;

      await env.run('mixed_structural_block_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Property, ['items']);
        expectContain(completions, CompletionItemKind.Variable, ['item']);
      });
    });

    it('should return completions inside an event binding', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<button (click)="t¦"></button>',
          standalone: true,
        })
        export class AppCmp {
          title = 'App';
        }
      `;

      await env.run('global_event_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Property, ['title']);
      });
    });

    it('should return completions inside an empty event binding', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<button (click)="¦"></button>',
          standalone: true,
        })
        export class AppCmp {
          title = 'App';
        }
      `;

      await env.run('global_empty_event_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Property, ['title']);
      });
    });

    it('should return completions inside RHS of two-way binding', async () => {
      const appTs = `
        import {Component, Directive, EventEmitter, Input, Output} from '@angular/core';

        @Directive({
          selector: '[model]',
          standalone: true,
        })
        export class ModelDir {
          @Input() model: any;
          @Output() modelChange = new EventEmitter<any>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<h1 [(model)]="t¦"></h1>',
          standalone: true,
          imports: [ModelDir],
        })
        export class AppCmp {
          title = 'App';
        }
      `;

      await env.run('global_twoway_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Property, ['title']);
      });
    });

    it('should not include trailing quote inside RHS of two-way binding', async () => {
      const appTs = `
        import {Component, Directive, EventEmitter, Input, Output} from '@angular/core';

        @Directive({
          selector: '[model]',
          standalone: true,
        })
        export class ModelDir {
          @Input() model: any;
          @Output() modelChange = new EventEmitter<any>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<h1 [(model)]="title.¦"></h1>',
          standalone: true,
          imports: [ModelDir],
        })
        export class AppCmp {
          title = 'App';
        }
      `;

      await env.run('global_twoway_quote_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Method, ['charAt']);
      });
    });

    it('should return completions inside an empty RHS of a two-way binding', async () => {
      const appTs = `
        import {Component, Directive, EventEmitter, Input, Output} from '@angular/core';

        @Directive({
          selector: '[model]',
          standalone: true,
        })
        export class ModelDir {
          @Input() model: any;
          @Output() modelChange = new EventEmitter<any>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<h1 [(model)]="¦"></h1>',
          standalone: true,
          imports: [ModelDir],
        })
        export class AppCmp {
          title = 'App';
        }
      `;

      await env.run('global_twoway_empty_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Property, ['title']);
      });
    });

    // Skipped: Synthesizing quoted string/number literal values at bare unquoted expression positions
    // requires TS Program/TypeChecker contextual type inspection, which is unavailable in standard LSP without ts.Program.
    xit('should return completions of string literals, number literals, true, false, null and undefined', async () => {
      const appTs = `
        import {Component, Directive, Input} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          @Input() myInput!: 'foo' | 42 | null | undefined;
        }

        @Component({
          selector: 'app-cmp',
          template: '<input dir [myInput]="¦">',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('global_literals_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Value, [`'foo'`, '42']);
        expectContain(completions, CompletionItemKind.Keyword, ['null']);
        expectContain(completions, CompletionItemKind.Variable, ['undefined']);
      });
    });

    // Skipped: Modifying symbol literal completions require TS Program/TypeChecker internal APIs.
    xit('should return completions of literals when user modifies symbol', async () => {
      const appTs = `
        import {Component, Directive, Input} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          @Input() myInput!: 'foo' | 42 | null | undefined;
        }

        @Component({
          selector: 'app-cmp',
          template: '<input dir [myInput]="a¦">',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('global_literals_modify_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Value, [`'foo'`, '42']);
      });
    });

    it('should complete an arrow function in an expression', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{() => ti¦}}',
          standalone: true,
        })
        export class AppCmp {
          title = 'App';
          hero = 123;
        }
      `;

      await env.run('arrow_func_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Property, ['title', 'hero']);
      });
    });

    it('should provide completions for access of a parameter in an arrow function', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{((value) => value.¦)(foo)}}',
          standalone: true,
        })
        export class AppCmp {
          foo = {a: 1, b: 'test'};
        }
      `;

      await env.run('arrow_param_access_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Property, ['a', 'b']);
      });
    });
  });

  describe('signal inputs', () => {
    it('should complete property access', async () => {
      const appTs = `
        import {Component, Directive, input} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          myInput = input<'foo' | 42 | null>();
        }

        @Component({
          selector: 'app-cmp',
          template: \`<input dir [myInput]="'foo'.¦">\`,
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('signal_input_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Method, ['charAt', 'toLowerCase']);
      });
    });

    // Skipped: Synthesizing quoted string/number literal values at bare unquoted expression positions
    // requires TS Program/TypeChecker contextual type inspection, which is unavailable in standard LSP without ts.Program.
    xit('should return completions of string literals, number literals, null and undefined in signal input binding', async () => {
      const appTs = `
        import {Component, Directive, input} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          myInput = input<'foo' | 42 | null>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<input dir [myInput]="¦">',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('signal_input_literals_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Value, [`'foo'`, '42']);
        expectContain(completions, CompletionItemKind.Keyword, ['null']);
        expectContain(completions, CompletionItemKind.Variable, ['undefined']);
      });
    });

    // Skipped: Modifying symbol literal completions require TS Program/TypeChecker internal APIs.
    xit('should return completions of literals when modifying signal input binding', async () => {
      const appTs = `
        import {Component, Directive, input} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          myInput = input<'foo' | 42 | null>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<input dir [myInput]="a¦">',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('signal_input_modify_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Value, [`'foo'`, '42']);
      });
    });

    it('should complete a string union type in binding without brackets', async () => {
      const appTs = `
        import {Component, Directive, input} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          myInput = input<'foo' | 'bar'>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<input dir myInput="foo¦">',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('signal_unbracketed_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Value, ['foo']);
      });
    });
  });

  describe('initializer-based output() API', () => {
    it('should return event completion', async () => {
      const appTs = `
        import {Component, Directive, output} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          bla = output<string>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<button dir ¦></button>',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('output_event_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Event, ['(bla)']);
      });
    });

    it('should return property access completions in output handler', async () => {
      const appTs = `
        import {Component, Directive, output} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          bla = output<string>();
        }

        @Component({
          selector: 'app-cmp',
          template: \`<input dir (bla)="'foo'.¦">\`,
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('output_handler_prop_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Method, ['charAt', 'toLowerCase']);
      });
    });

    it('should complete $event in output event binding', async () => {
      const appTs = `
        import {Component, Directive, output} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          bla = output<string>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<input dir (bla)="$event.¦">',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('output_event_param_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Method, ['charAt', 'toLowerCase']);
      });
    });
  });

  describe('initializer-based outputFromObservable() API', () => {
    it('should return event completion', async () => {
      const appTs = `
        import {Component, Directive} from '@angular/core';
        import {outputFromObservable} from '@angular/core/rxjs-interop';
        import {Subject} from 'rxjs';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          bla = outputFromObservable(new Subject<string>());
        }

        @Component({
          selector: 'app-cmp',
          template: '<button dir ¦></button>',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('output_obs_event_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Event, ['(bla)']);
      });
    });

    it('should return property access completions in observable output handler', async () => {
      const appTs = `
        import {Component, Directive} from '@angular/core';
        import {outputFromObservable} from '@angular/core/rxjs-interop';
        import {Subject} from 'rxjs';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          bla = outputFromObservable(new Subject<string>());
        }

        @Component({
          selector: 'app-cmp',
          template: \`<input dir (bla)="'foo'.¦">\`,
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('output_obs_prop_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Method, ['charAt', 'toLowerCase']);
      });
    });

    // Skipped: Resolving generic observable payload type across RxJS library boundaries
    // requires TS Program/TypeChecker symbols, which is unavailable in standard LSP without ts.Program.
    xit('should complete $event in observable output event binding', async () => {
      const appTs = `
        import {Component, Directive} from '@angular/core';
        import {outputFromObservable} from '@angular/core/rxjs-interop';
        import {Subject} from 'rxjs';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          bla = outputFromObservable(new Subject<string>());
        }

        @Component({
          selector: 'app-cmp',
          template: '<input dir (bla)="$event.¦">',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('output_obs_param_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Method, ['charAt', 'toLowerCase']);
      });
    });
  });

  describe('model inputs', () => {
    it('should return completions for properties, events, and 2-way', async () => {
      const appTs = `
        import {Component, Directive, model} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          twoWayValue = model<string>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<button dir ¦></button>',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('model_bindings_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Property, ['[twoWayValue]']);
        expectContain(completions, CompletionItemKind.Property, ['[(twoWayValue)]']);
        expectContain(completions, CompletionItemKind.Event, ['(twoWayValueChange)']);
      });
    });

    it('should return property access completions in property side of model binding', async () => {
      const appTs = `
        import {Component, Directive, model} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          twoWayValue = model<string>();
        }

        @Component({
          selector: 'app-cmp',
          template: \`<input dir [twoWayValue]="'foo'.¦">\`,
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('model_prop_side_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Method, ['charAt', 'toLowerCase']);
      });
    });

    it('should return property access completions in event side of model binding', async () => {
      const appTs = `
        import {Component, Directive, model} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          twoWayValue = model<string>();
        }

        @Component({
          selector: 'app-cmp',
          template: \`<input dir (twoWayValueChange)="'foo'.¦">\`,
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('model_event_side_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Method, ['charAt', 'toLowerCase']);
      });
    });

    it('should return property access completions in two-way model binding', async () => {
      const appTs = `
        import {Component, Directive, model} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          twoWayValue = model<string>();
        }

        @Component({
          selector: 'app-cmp',
          template: \`<input dir [(twoWayValue)]="'foo'.¦">\`,
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('model_twoway_prop_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Method, ['charAt', 'toLowerCase']);
      });
    });

    it('should return completions for $event in twoWayValueChange', async () => {
      const appTs = `
        import {Component, Directive, model} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          twoWayValue = model<string>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<input dir (twoWayValueChange)="$event.¦">',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('model_event_param_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Method, ['charAt', 'toLowerCase']);
      });
    });
  });

  describe('for blocks', () => {
    const prefixes = ['@', '@i'];

    describe('at top level', () => {
      for (const prefix of prefixes) {
        it(`in empty file (with prefix ${prefix})`, async () => {
          const appTs = `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: '${prefix}¦',
              standalone: true,
            })
            export class AppCmp {}
          `;

          await env.run(
            `block_top_empty_${prefix.replace('@', '')}.ts`,
            appTs,
            async (ls, filePath) => {
              const completions = await env.getCompletionsAtPosition(ls, filePath);
              expectContain(completions, CompletionItemKind.Keyword, ['if']);
            },
          );
        });

        it(`after text (with prefix ${prefix})`, async () => {
          const appTs = `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: 'foo ${prefix}¦',
              standalone: true,
            })
            export class AppCmp {}
          `;

          await env.run(
            `block_top_after_text_${prefix.replace('@', '')}.ts`,
            appTs,
            async (ls, filePath) => {
              const completions = await env.getCompletionsAtPosition(ls, filePath);
              expectContain(completions, CompletionItemKind.Keyword, ['if']);
            },
          );
        });

        it(`before text (with prefix ${prefix})`, async () => {
          const appTs = `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: '${prefix}¦ foo',
              standalone: true,
            })
            export class AppCmp {}
          `;

          await env.run(
            `block_top_before_text_${prefix.replace('@', '')}.ts`,
            appTs,
            async (ls, filePath) => {
              const completions = await env.getCompletionsAtPosition(ls, filePath);
              expectContain(completions, CompletionItemKind.Keyword, ['if']);
            },
          );
        });

        it(`after newline (with prefix ${prefix})`, async () => {
          const appTs = `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`foo
${prefix}¦\`,
              standalone: true,
            })
            export class AppCmp {}
          `;

          await env.run(
            `block_top_after_newline_${prefix.replace('@', '')}.ts`,
            appTs,
            async (ls, filePath) => {
              const completions = await env.getCompletionsAtPosition(ls, filePath);
              expectContain(completions, CompletionItemKind.Keyword, ['if']);
            },
          );
        });

        it(`before newline (with prefix ${prefix})`, async () => {
          const appTs = `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`${prefix}¦
foo\`,
              standalone: true,
            })
            export class AppCmp {}
          `;

          await env.run(
            `block_top_before_newline_${prefix.replace('@', '')}.ts`,
            appTs,
            async (ls, filePath) => {
              const completions = await env.getCompletionsAtPosition(ls, filePath);
              expectContain(completions, CompletionItemKind.Keyword, ['if']);
            },
          );
        });

        it(`in a practical case, on its own line (with prefix ${prefix})`, async () => {
          const appTs = `
            import {Component} from '@angular/core';

            @Component({
              selector: 'app-cmp',
              template: \`<div></div>
  ${prefix}¦
<span></span>\`,
              standalone: true,
            })
            export class AppCmp {}
          `;

          await env.run(
            `block_top_practical_${prefix.replace('@', '')}.ts`,
            appTs,
            async (ls, filePath) => {
              const completions = await env.getCompletionsAtPosition(ls, filePath);
              expectContain(completions, CompletionItemKind.Keyword, ['if']);
            },
          );
        });
      }
    });

    it('inside if', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@if (1) { @s¦ }',
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('block_switch_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Keyword, ['switch']);
      });
    });

    it('inside switch', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@switch (1) { @c¦ }',
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('block_case_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Keyword, ['case', 'default']);
      });
    });

    it('should provide completions for loop item and context variables inside @for loop', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@for (route of routes; track $index) { {{rou¦}} }',
          standalone: true,
        })
        export class AppCmp {
          routes: string[] = [];
        }
      `;

      await env.run('for_loop_var_completion.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Variable, ['route', '$index']);
        expectContain(completions, CompletionItemKind.Property, ['routes']);
      });
    });

    it('should provide completions for alias variable inside @if block', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@if (userProfile; as user) { {{us¦}} }',
          standalone: true,
        })
        export class AppCmp {
          userProfile = {name: 'Angular'};
        }
      `;

      await env.run('if_alias_completion.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Variable, ['user']);
        expectContain(completions, CompletionItemKind.Property, ['userProfile']);
      });
    });

    it('should not provide completions for loop item inside @empty block', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@for (route of routes; track $index) { {{route}} } @empty { {{rou¦}} }',
          standalone: true,
        })
        export class AppCmp {
          routes: string[] = [];
        }
      `;

      await env.run('for_empty_completion.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectDoesNotContain(completions, CompletionItemKind.Variable, ['route']);
        expectContain(completions, CompletionItemKind.Property, ['routes']);
      });
    });
  });

  describe('in an expression scope', () => {
    it('should complete property read', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{name.f¦}}',
          standalone: true,
        })
        export class AppCmp {
          name = {first: 'John', last: 'Doe'};
        }
      `;

      await env.run('expr_prop_read_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectAll(completions, {
          first: CompletionItemKind.Property,
          last: CompletionItemKind.Property,
        });
      });
    });

    it('should complete empty property access', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{name.¦}}',
          standalone: true,
        })
        export class AppCmp {
          name = {first: 'John', last: 'Doe'};
        }
      `;

      await env.run('expr_empty_prop_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectAll(completions, {
          first: CompletionItemKind.Property,
          last: CompletionItemKind.Property,
        });
      });
    });

    it('should return completions in a property write expression', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: \`<button (click)="name.fi¦ = 'test'"></button>\`,
          standalone: true,
        })
        export class AppCmp {
          name = {first: 'John', last: 'Doe'};
        }
      `;

      await env.run('expr_prop_write_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectAll(completions, {
          first: CompletionItemKind.Property,
          last: CompletionItemKind.Property,
        });
      });
    });

    it('should return completions in a method call expression', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{name.f¦()}}',
          standalone: true,
        })
        export class AppCmp {
          name = {
            first: 'John',
            full(): string { return 'John Doe'; }
          };
        }
      `;

      await env.run('expr_method_call_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectAll(completions, {
          first: CompletionItemKind.Property,
          full: CompletionItemKind.Method,
        });
      });
    });

    it('should return completions in an empty method call expression', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{name.¦()}}',
          standalone: true,
        })
        export class AppCmp {
          name = {
            first: 'John',
            full(): string { return 'John Doe'; }
          };
        }
      `;

      await env.run('expr_empty_method_call_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectAll(completions, {
          first: CompletionItemKind.Property,
          full: CompletionItemKind.Method,
        });
      });
    });

    it('should complete safe property navigation', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{name?.f¦}}',
          standalone: true,
        })
        export class AppCmp {
          name?: {first: string; last: string};
        }
      `;

      await env.run('expr_safe_prop_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectAll(completions, {
          first: CompletionItemKind.Property,
          last: CompletionItemKind.Property,
        });
      });
    });

    it('should complete empty safe property navigation', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{name?.¦}}',
          standalone: true,
        })
        export class AppCmp {
          name?: {first: string; last: string};
        }
      `;

      await env.run('expr_empty_safe_prop_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectAll(completions, {
          first: CompletionItemKind.Property,
          last: CompletionItemKind.Property,
        });
      });
    });

    it('should return completions in a safe method call context', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{name?.f¦()}}',
          standalone: true,
        })
        export class AppCmp {
          name?: {
            first: string;
            full(): string;
          };
        }
      `;

      await env.run('expr_safe_method_call_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectAll(completions, {
          first: CompletionItemKind.Property,
          full: CompletionItemKind.Method,
        });
      });
    });
  });

  describe('element tag scope', () => {
    it('should not return DOM completions for external/inline template', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<div¦>',
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('tag_dom_exclusion_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectDoesNotContain(completions, CompletionItemKind.Snippet, ['div', 'span']);
      });
    });

    it('should return directive completions', async () => {
      const appTs = `
        import {Component, Directive} from '@angular/core';

        /** This is another directive. */
        @Directive({
          selector: 'other-dir',
          standalone: true,
        })
        export class OtherDir {}

        @Component({
          selector: 'app-cmp',
          template: '<div¦>',
          standalone: true,
          imports: [OtherDir],
        })
        export class AppCmp {}
      `;

      await env.run('tag_dir_completion_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Class, ['other-dir']);
      });
    });

    it('should complete component selector', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'other-cmp',
          template: '<div>Hello</div>',
          standalone: true,
        })
        export class OtherCmp {}

        @Component({
          selector: 'app-cmp',
          template: '<div¦>',
          standalone: true,
          imports: [OtherCmp],
        })
        export class AppCmp {}
      `;

      await env.run('tag_component_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Class, ['other-cmp']);
      });
    });

    xit('should return component completions not imported (requires whole-program auto-import code actions)', async () => {
      // In TS 7 / standard LSP, auto-import code actions for unimported standalone components require
      // workspace-level symbol indexing and AST code actions, which are handled at the editor/extension layer.
    });

    it('should return completions for an incomplete tag', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'other-cmp',
          template: 'unimportant',
          standalone: true,
        })
        export class OtherCmp {}

        @Component({
          selector: 'app-cmp',
          template: '<other¦',
          standalone: true,
          imports: [OtherCmp],
        })
        export class AppCmp {}
      `;

      await env.run('tag_incomplete_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Class, ['other-cmp']);
      });
    });

    it('should return completions with a blank open tag', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'other-cmp',
          template: 'unimportant',
          standalone: true,
        })
        export class OtherCmp {}

        @Component({
          selector: 'app-cmp',
          template: '<¦',
          standalone: true,
          imports: [OtherCmp],
        })
        export class AppCmp {}
      `;

      await env.run('tag_blank_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Class, ['other-cmp']);
      });
    });

    it('should return completions with a blank open tag a character before', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'other-cmp',
          template: 'unimportant',
          standalone: true,
        })
        export class OtherCmp {}

        @Component({
          selector: 'app-cmp',
          template: 'a <¦',
          standalone: true,
          imports: [OtherCmp],
        })
        export class AppCmp {}
      `;

      await env.run('tag_blank_char_before_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Class, ['other-cmp']);
      });
    });

    it('should not return completions when cursor is not after the open tag', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'other-cmp',
          template: 'unimportant',
          standalone: true,
        })
        export class OtherCmp {}

        @Component({
          selector: 'app-cmp',
          template: '<  ¦       ',
          standalone: true,
          imports: [OtherCmp],
        })
        export class AppCmp {}
      `;

      await env.run('tag_negative_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expect(completions).toBeNull();
      });
    });
  });

  describe('element attribute scope', () => {
    describe('dom completions', () => {
      it('should return DOM completions', async () => {
        const appTs = `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: '<input ¦>',
            standalone: true,
          })
          export class AppCmp {}
        `;

        await env.run('attr_dom_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Property, ['[value]']);
          expectDoesNotContain(completions, CompletionItemKind.Field, ['value']);
        });
      });

      it('should return event completion', async () => {
        const appTs = `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: '<button ¦></button>',
            standalone: true,
          })
          export class AppCmp {}
        `;

        await env.run('attr_dom_event_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Event, ['(click)']);
        });
      });

      it('should return event completion for self closing tag', async () => {
        const appTs = `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: '<br ¦ />',
            standalone: true,
          })
          export class AppCmp {}
        `;

        await env.run('attr_dom_self_closing_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Event, ['(click)']);
        });
      });

      it('should not return element completions in end tag', async () => {
        const appTs = `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: '<button ></¦button>',
            standalone: true,
          })
          export class AppCmp {}
        `;

        await env.run('attr_end_tag_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expect(completions).toBeNull();
        });
      });

      it('should not return element completions in between start and end tag', async () => {
        const appTs = `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: '<button>¦</button>',
            standalone: true,
          })
          export class AppCmp {}
        `;

        await env.run('attr_between_tags_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expect(completions).toBeNull();
        });
      });

      it('should return event completion with empty parens', async () => {
        const appTs = `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: '<button (¦)></button>',
            standalone: true,
          })
          export class AppCmp {}
        `;

        await env.run('attr_empty_parens_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Event, ['(click)']);
        });
      });

      it('should return completions for a partial attribute', async () => {
        const appTs = `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: '<input val¦>',
            standalone: true,
          })
          export class AppCmp {}
        `;

        await env.run('attr_partial_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Property, ['[value]']);
          expectDoesNotContain(completions, CompletionItemKind.Field, ['value']);
        });
      });

      it('should return completions for a partial property binding', async () => {
        const appTs = `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: '<input [val¦]>',
            standalone: true,
          })
          export class AppCmp {}
        `;

        await env.run('attr_partial_prop_binding_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Property, ['value']);
        });
      });

      it('should return completions inside an event binding', async () => {
        const appTs = `
          import {Component} from '@angular/core';

          @Component({
            selector: 'app-cmp',
            template: \`<button (cl¦)=''></button>\`,
            standalone: true,
          })
          export class AppCmp {}
        `;

        await env.run('attr_event_binding_name_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Event, ['(click)']);
        });
      });
    });

    describe('directive present', () => {
      it('should return directive inputs and outputs when present', async () => {
        const appTs = `
          import {Component, Directive, Input, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: true,
          })
          export class Dir {
            @Input() myInput!: string;
            @Output() myOutput = new EventEmitter<string>();
          }

          @Component({
            selector: 'app-cmp',
            template: '<input dir ¦>',
            standalone: true,
            imports: [Dir],
          })
          export class AppCmp {}
        `;

        await env.run('attr_dir_present_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Property, ['[myInput]']);
          expectContain(completions, CompletionItemKind.Field, ['myInput']);
          expectContain(completions, CompletionItemKind.Event, ['(myOutput)']);
        });
      });

      it('should return directive input completions for a partial attribute', async () => {
        const appTs = `
          import {Component, Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: true,
          })
          export class Dir {
            @Input() myInput!: string;
          }

          @Component({
            selector: 'app-cmp',
            template: '<input dir my¦>',
            standalone: true,
            imports: [Dir],
          })
          export class AppCmp {}
        `;

        await env.run('attr_dir_partial_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Property, ['[myInput]']);
          expectContain(completions, CompletionItemKind.Field, ['myInput']);
        });
      });

      it('should return input completions for a partial property binding', async () => {
        const appTs = `
          import {Component, Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: true,
          })
          export class Dir {
            @Input() myInput!: string;
          }

          @Component({
            selector: 'app-cmp',
            template: '<input dir [my¦]>',
            standalone: true,
            imports: [Dir],
          })
          export class AppCmp {}
        `;

        await env.run('attr_dir_partial_binding_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Property, ['myInput']);
        });
      });

      it('should return completion for input coming from a host directive', async () => {
        const appTs = `
          import {Component, Directive, Input} from '@angular/core';

          @Directive({
            standalone: true,
          })
          export class HostDir {
            @Input() myInput = 'foo';
          }

          @Directive({
            selector: '[dir]',
            hostDirectives: [{
              directive: HostDir,
              inputs: ['myInput']
            }],
            standalone: true,
          })
          export class Dir {}

          @Component({
            selector: 'app-cmp',
            template: '<input dir my¦>',
            standalone: true,
            imports: [Dir],
          })
          export class AppCmp {}
        `;

        await env.run('attr_host_dir_input_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Property, ['[myInput]']);
        });
      });

      it('should not return completion for hidden host directive input', async () => {
        const appTs = `
          import {Component, Directive, Input} from '@angular/core';

          @Directive({
            standalone: true,
          })
          export class HostDir {
            @Input() myInput = 'foo';
          }

          @Directive({
            selector: '[dir]',
            hostDirectives: [HostDir],
            standalone: true,
          })
          export class Dir {}

          @Component({
            selector: 'app-cmp',
            template: '<input dir my¦>',
            standalone: true,
            imports: [Dir],
          })
          export class AppCmp {}
        `;

        await env.run('attr_hidden_host_dir_input_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectDoesNotContain(completions, CompletionItemKind.Property, ['[myInput]']);
        });
      });

      it('should return completion for aliased host directive input', async () => {
        const appTs = `
          import {Component, Directive, Input} from '@angular/core';

          @Directive({
            standalone: true,
          })
          export class HostDir {
            @Input() myInput = 'foo';
          }

          @Directive({
            selector: '[dir]',
            hostDirectives: [{
              directive: HostDir,
              inputs: ['myInput: alias']
            }],
            standalone: true,
          })
          export class Dir {}

          @Component({
            selector: 'app-cmp',
            template: '<input dir ali¦>',
            standalone: true,
            imports: [Dir],
          })
          export class AppCmp {}
        `;

        await env.run('attr_aliased_host_dir_input_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Property, ['[alias]']);
        });
      });

      it('should return completion for aliased host directive input with public name', async () => {
        const appTs = `
          import {Component, Directive, Input} from '@angular/core';

          @Directive({
            standalone: true,
          })
          export class HostDir {
            @Input('myPublicInput') myInput = 'foo';
          }

          @Directive({
            selector: '[dir]',
            hostDirectives: [{
              directive: HostDir,
              inputs: ['myPublicInput: alias']
            }],
            standalone: true,
          })
          export class Dir {}

          @Component({
            selector: 'app-cmp',
            template: '<input dir ali¦>',
            standalone: true,
            imports: [Dir],
          })
          export class AppCmp {}
        `;

        await env.run('attr_aliased_public_host_dir_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Property, ['[alias]']);
        });
      });

      it('should return completion for chained host directive input', async () => {
        const appTs = `
          import {Component, Directive, Input} from '@angular/core';

          @Directive({
            standalone: true,
          })
          export class InnerHostDir {
            @Input() innerInput = 'val';
          }

          @Directive({
            hostDirectives: [{
              directive: InnerHostDir,
              inputs: ['innerInput: innerAlias']
            }],
            standalone: true,
          })
          export class MiddleHostDir {
            @Input() middleInput = 'val2';
          }

          @Directive({
            selector: '[dir]',
            hostDirectives: [{
              directive: MiddleHostDir,
              inputs: ['middleInput: middleAlias']
            }],
            standalone: true,
          })
          export class Dir {}

          @Component({
            selector: 'app-cmp',
            template: '<input dir inn¦>',
            standalone: true,
            imports: [Dir],
          })
          export class AppCmp {}
        `;

        await env.run('attr_chained_host_dir_input_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Property, ['[innerAlias]']);
        });
      });
    });

    describe('structural directive present', () => {
      it('should return structural directive present', async () => {
        const appTs = `
          import {Component, Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';

          @Directive({
            selector: '[ngFor][ngForOf]',
            standalone: true,
          })
          export class NgForOf<T> {
            constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef<any>) {}
            @Input() ngForOf!: T[];
          }

          @Component({
            selector: 'app-cmp',
            template: '<div ¦></div>',
            standalone: true,
            imports: [NgForOf],
          })
          export class AppCmp {
            heroes = ['a'];
          }
        `;

        await env.run('attr_structural_present_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Class, ['*ngFor']);
        });
      });

      it('should return structural directive completions for an existing non-structural attribute', async () => {
        const appTs = `
          import {Component, Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';

          @Directive({
            selector: '[ngFor][ngForOf]',
            standalone: true,
          })
          export class NgForOf<T> {
            constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef<any>) {}
            @Input() ngForOf!: T[];
          }

          @Component({
            selector: 'app-cmp',
            template: '<li ng¦></li>',
            standalone: true,
            imports: [NgForOf],
          })
          export class AppCmp {}
        `;

        await env.run('attr_structural_existing_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Class, ['*ngFor']);
        });
      });

      it('should return structural directive completions for an existing structural attribute', async () => {
        const appTs = `
          import {Component, Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';

          @Directive({
            selector: '[ngFor][ngForOf]',
            standalone: true,
          })
          export class NgForOf<T> {
            constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef<any>) {}
            @Input() ngForOf!: T[];
          }

          @Component({
            selector: 'app-cmp',
            template: '<li *ng¦></li>',
            standalone: true,
            imports: [NgForOf],
          })
          export class AppCmp {}
        `;

        await env.run('attr_structural_marker_prefix_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Class, ['ngFor']);
        });
      });

      it('should return structural directive completions for just the structural marker', async () => {
        const appTs = `
          import {Component, Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';

          @Directive({
            selector: '[ngFor][ngForOf]',
            standalone: true,
          })
          export class NgForOf<T> {
            constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef<any>) {}
            @Input() ngForOf!: T[];
          }

          @Component({
            selector: 'app-cmp',
            template: '<li *¦></li>',
            standalone: true,
            imports: [NgForOf],
          })
          export class AppCmp {}
        `;

        await env.run('attr_structural_just_marker_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Class, ['ngFor']);
        });
      });
    });

    describe('directive not present (hypothetical match)', () => {
      it('should return input completions for a new attribute', async () => {
        const appTs = `
          import {Component, Directive, Input} from '@angular/core';

          @Directive({
            selector: '[myInput]',
            standalone: true,
          })
          export class Dir {
            @Input() myInput!: string;
          }

          @Component({
            selector: 'app-cmp',
            template: '<input ¦>',
            standalone: true,
            imports: [Dir],
          })
          export class AppCmp {}
        `;

        await env.run('attr_not_present_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Property, ['[myInput]']);
          expectContain(completions, CompletionItemKind.Field, ['myInput']);
        });
      });

      it('should return input completions for a partial attribute', async () => {
        const appTs = `
          import {Component, Directive, Input} from '@angular/core';

          @Directive({
            selector: '[myInput]',
            standalone: true,
          })
          export class Dir {
            @Input() myInput!: string;
          }

          @Component({
            selector: 'app-cmp',
            template: '<input my¦>',
            standalone: true,
            imports: [Dir],
          })
          export class AppCmp {}
        `;

        await env.run('attr_not_present_partial_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Property, ['[myInput]']);
          expectContain(completions, CompletionItemKind.Field, ['myInput']);
        });
      });

      it('should return input completions for a partial property binding', async () => {
        const appTs = `
          import {Component, Directive, Input} from '@angular/core';

          @Directive({
            selector: '[myInput]',
            standalone: true,
          })
          export class Dir {
            @Input() myInput!: string;
          }

          @Component({
            selector: 'app-cmp',
            template: '<input [my¦]>',
            standalone: true,
            imports: [Dir],
          })
          export class AppCmp {}
        `;

        await env.run('attr_not_present_partial_prop_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Property, ['myInput']);
        });
      });
    });

    describe('outputs and two-way bindings', () => {
      it('should return output completions for an empty binding', async () => {
        const appTs = `
          import {Component, Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: true,
          })
          export class Dir {
            @Output() myOutput = new EventEmitter<any>();
          }

          @Component({
            selector: 'app-cmp',
            template: '<input dir ¦>',
            standalone: true,
            imports: [Dir],
          })
          export class AppCmp {}
        `;

        await env.run('attr_output_empty_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Event, ['(myOutput)']);
        });
      });

      it('should return output completions for a partial event binding', async () => {
        const appTs = `
          import {Component, Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: true,
          })
          export class Dir {
            @Output() myOutput = new EventEmitter<any>();
          }

          @Component({
            selector: 'app-cmp',
            template: '<input dir (my¦)>',
            standalone: true,
            imports: [Dir],
          })
          export class AppCmp {}
        `;

        await env.run('attr_output_partial_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Event, ['myOutput']);
        });
      });

      it('should return completions inside LHS of partially complete two-way binding', async () => {
        const appTs = `
          import {Component, Directive, Input, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: true,
          })
          export class Dir {
            @Input() model: any;
            @Output() modelChange = new EventEmitter<any>();
            @Input() otherInput: any;
            @Output() otherOutput = new EventEmitter<any>();
          }

          @Component({
            selector: 'app-cmp',
            template: '<h1 dir [(mod¦)]></h1>',
            standalone: true,
            imports: [Dir],
          })
          export class AppCmp {}
        `;

        await env.run('attr_twoway_lhs_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Property, ['model']);
          expectDoesNotContain(completions, CompletionItemKind.Event, ['modelChange']);
          expectDoesNotContain(completions, CompletionItemKind.Property, ['otherInput']);
          expectDoesNotContain(completions, CompletionItemKind.Event, ['otherOutput']);
        });
      });

      it('should return input completions for a binding property name alias', async () => {
        const appTs = `
          import {Component, Directive, Input, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: true,
          })
          export class Dir {
            @Input('customModel') model: any;
            @Output('customModelChange') update = new EventEmitter<any>();
          }

          @Component({
            selector: 'app-cmp',
            template: '<h1 dir [customModel¦]></h1>',
            standalone: true,
            imports: [Dir],
          })
          export class AppCmp {}
        `;

        await env.run('attr_alias_input_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Property, ['customModel']);
        });
      });

      it('should return output completions for a binding property name alias', async () => {
        const appTs = `
          import {Component, Directive, Input, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: true,
          })
          export class Dir {
            @Input('customModel') model: any;
            @Output('customModelChange') update = new EventEmitter<any>();
          }

          @Component({
            selector: 'app-cmp',
            template: '<h1 dir (customModel¦)></h1>',
            standalone: true,
            imports: [Dir],
          })
          export class AppCmp {}
        `;

        await env.run('attr_alias_output_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Event, ['customModelChange']);
        });
      });

      it('should return completion for output coming from a host directive', async () => {
        const appTs = `
          import {Component, Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            standalone: true,
          })
          export class HostDir {
            @Output() myOutput = new EventEmitter<any>();
          }

          @Directive({
            selector: '[dir]',
            hostDirectives: [{
              directive: HostDir,
              outputs: ['myOutput']
            }],
            standalone: true,
          })
          export class Dir {}

          @Component({
            selector: 'app-cmp',
            template: '<input dir (my¦)>',
            standalone: true,
            imports: [Dir],
          })
          export class AppCmp {}
        `;

        await env.run('attr_host_dir_output_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Event, ['(myOutput)']);
        });
      });

      it('should not return completion for hidden host directive output', async () => {
        const appTs = `
          import {Component, Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            standalone: true,
          })
          export class HostDir {
            @Output() myOutput = new EventEmitter<any>();
          }

          @Directive({
            selector: '[dir]',
            hostDirectives: [HostDir],
            standalone: true,
          })
          export class Dir {}

          @Component({
            selector: 'app-cmp',
            template: '<input dir (my¦)>',
            standalone: true,
            imports: [Dir],
          })
          export class AppCmp {}
        `;

        await env.run('attr_hidden_host_dir_output_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectDoesNotContain(completions, CompletionItemKind.Event, ['(myOutput)']);
        });
      });

      it('should return completion for aliased host directive output with public name', async () => {
        const appTs = `
          import {Component, Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            standalone: true,
          })
          export class HostDir {
            @Output('myPublicOutput') myOutput = new EventEmitter<any>();
          }

          @Directive({
            selector: '[dir]',
            hostDirectives: [{
              directive: HostDir,
              outputs: ['myPublicOutput: alias']
            }],
            standalone: true,
          })
          export class Dir {}

          @Component({
            selector: 'app-cmp',
            template: '<input dir (ali¦)>',
            standalone: true,
            imports: [Dir],
          })
          export class AppCmp {}
        `;

        await env.run('attr_aliased_host_dir_output_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Event, ['(alias)']);
        });
      });

      it('should return completion for chained host directive output', async () => {
        const appTs = `
          import {Component, Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            standalone: true,
          })
          export class InnerHostDir {
            @Output() innerOutput = new EventEmitter<any>();
          }

          @Directive({
            hostDirectives: [{
              directive: InnerHostDir,
              outputs: ['innerOutput: innerAlias']
            }],
            standalone: true,
          })
          export class MiddleHostDir {
            @Output() middleOutput = new EventEmitter<any>();
          }

          @Directive({
            selector: '[dir]',
            hostDirectives: [{
              directive: MiddleHostDir,
              outputs: ['middleOutput: middleAlias']
            }],
            standalone: true,
          })
          export class Dir {}

          @Component({
            selector: 'app-cmp',
            template: '<input dir (inn¦)>',
            standalone: true,
            imports: [Dir],
          })
          export class AppCmp {}
        `;

        await env.run('attr_chained_host_dir_output_test.ts', appTs, async (ls, filePath) => {
          const completions = await env.getCompletionsAtPosition(ls, filePath);
          expectContain(completions, CompletionItemKind.Event, ['(innerAlias)']);
        });
      });
    });

    xit('element attribute out of scope (auto-import code actions)', () => {
      // In TS 7 / standard LSP, auto-importing out-of-scope directives requires whole-program indexing.
    });

    xit('animations', () => {
      // Animation trigger metadata (animations: [trigger(...)]) is not yet parsed by ng-analyze analyzer.
    });
  });

  describe('pipe scope', () => {
    it('should complete pipe name', async () => {
      const appTs = `
        import {Component, Pipe, PipeTransform} from '@angular/core';

        @Pipe({
          name: 'somePipe',
          standalone: true,
        })
        export class SomePipe implements PipeTransform {
          transform(value: any) { return value; }
        }

        @Component({
          selector: 'app-cmp',
          template: '{{ foo | some¦ }}',
          standalone: true,
          imports: [SomePipe],
        })
        export class AppCmp {
          foo = 'test';
        }
      `;

      await env.run('pipe_name_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Function, ['somePipe']);
      });
    });

    it('should complete empty pipe binding', async () => {
      const appTs = `
        import {Component, Pipe, PipeTransform} from '@angular/core';

        @Pipe({
          name: 'somePipe',
          standalone: true,
        })
        export class SomePipe implements PipeTransform {
          transform(value: any) { return value; }
        }

        @Component({
          selector: 'app-cmp',
          template: '{{ foo | ¦ }}',
          standalone: true,
          imports: [SomePipe],
        })
        export class AppCmp {
          foo = 'test';
        }
      `;

      await env.run('pipe_empty_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Function, ['somePipe']);
      });
    });

    it('should not return extraneous completions', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{ foo | some¦ }}',
          standalone: true,
        })
        export class AppCmp {
          foo = 'test';
        }
      `;

      await env.run('pipe_no_extraneous_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expect(completions?.items.length).toBe(0);
      });
    });
  });

  describe('literal primitive scope', () => {
    it('should complete a string union type in square brackets binding', async () => {
      const appTs = `
        import {Component, Directive, Input} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          @Input() myInput!: 'foo' | 'bar';
        }

        @Component({
          selector: 'app-cmp',
          template: \`<input dir [myInput]="'foo¦'">\`,
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('literal_bracketed_string_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Value, ['foo']);
      });
    });

    it('should complete a string union type in binding without brackets', async () => {
      const appTs = `
        import {Component, Directive, Input} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          @Input() myInput!: 'foo' | 'bar';
        }

        @Component({
          selector: 'app-cmp',
          template: '<input dir myInput="foo¦">',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('literal_unbracketed_string_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Value, ['foo']);
      });
    });

    it('should complete a string union type in binding without brackets when cursor is at start', async () => {
      const appTs = `
        import {Component, Directive, Input} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          @Input() myInput!: 'foo' | 'bar';
        }

        @Component({
          selector: 'app-cmp',
          template: '<input dir myInput="¦foo">',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('literal_unbracketed_start_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Value, ['foo']);
      });
    });

    it('should complete a string union type in pipe argument', async () => {
      const appTs = `
        import {Component, Pipe, PipeTransform} from '@angular/core';

        @Pipe({
          name: 'unionTypePipe',
          standalone: true,
        })
        export class UnionTypePipe implements PipeTransform {
          transform(value: string, config: 'foo' | 'bar'): string {
            return value;
          }
        }

        @Component({
          selector: 'app-cmp',
          template: \`<input [title]="'foo' | unionTypePipe:'bar¦'">\`,
          standalone: true,
          imports: [UnionTypePipe],
        })
        export class AppCmp {}
      `;

      await env.run('literal_pipe_arg_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Value, ['bar']);
      });
    });

    it('should complete a number union type', async () => {
      const appTs = `
        import {Component, Directive, Input} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          @Input() myInput!: 42 | 100;
        }

        @Component({
          selector: 'app-cmp',
          template: '<input dir [myInput]="42¦">',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('literal_number_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Value, ['42']);
      });
    });
  });

  xit('auto-apply optional chaining', () => {
    // includeAutomaticOptionalChainCompletions requires in-process ts.TypeChecker access.
  });

  describe('insert snippet text', () => {
    it('should insert snippet for [input]', async () => {
      const appTs = `
        import {Component, Directive, Input} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          @Input() myInput!: string;
        }

        @Component({
          selector: 'app-cmp',
          template: '<button dir ¦></button>',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('snippet_input_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContainInsertTextWithSnippet(completions, CompletionItemKind.Property, [
          '[myInput]="$1"',
        ]);
      });
    });

    it('should insert snippet for output on empty attribute', async () => {
      const appTs = `
        import {Component, Directive, Output, EventEmitter} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          @Output() myOutput = new EventEmitter<string>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<input dir ¦>',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('snippet_output_empty_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContainInsertTextWithSnippet(completions, CompletionItemKind.Event, [
          '(myOutput)="$1"',
        ]);
      });
    });

    it('should insert snippet for output on partial attribute', async () => {
      const appTs = `
        import {Component, Directive, Output, EventEmitter} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          @Output() myOutput = new EventEmitter<string>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<input dir my¦>',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('snippet_output_partial_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContainInsertTextWithSnippet(completions, CompletionItemKind.Event, [
          '(myOutput)="$1"',
        ]);
      });
    });

    it('should insert snippet for event binding with empty value', async () => {
      const appTs = `
        import {Component, Directive, Output, EventEmitter} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          @Output() myOutput = new EventEmitter<string>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<input dir (¦)="">',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('snippet_event_empty_val_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContainInsertTextWithSnippet(completions, CompletionItemKind.Event, [
          '(myOutput)="$1"',
        ]);
      });
    });

    it('should insert snippet for event binding without value', async () => {
      const appTs = `
        import {Component, Directive, Output, EventEmitter} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          @Output() myOutput = new EventEmitter<string>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<input dir (¦)>',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('snippet_event_no_val_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContainInsertTextWithSnippet(completions, CompletionItemKind.Event, [
          '(myOutput)="$1"',
        ]);
      });
    });

    it('should insert snippet for DOM event binding', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<input (cli¦)>',
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('snippet_dom_event_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContainInsertTextWithSnippet(completions, CompletionItemKind.Event, ['(click)="$1"']);
      });
    });

    it('should insert snippet for property binding with empty value', async () => {
      const appTs = `
        import {Component, Directive, Input} from '@angular/core';

        @Directive({
          selector: '[myInput]',
          standalone: true,
        })
        export class Dir {
          @Input() myInput!: string;
        }

        @Component({
          selector: 'app-cmp',
          template: '<input [my¦]="">',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('snippet_prop_empty_val_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContainInsertTextWithSnippet(completions, CompletionItemKind.Property, [
          '[myInput]="$1"',
        ]);
      });
    });

    it('should insert snippet for property binding without value', async () => {
      const appTs = `
        import {Component, Directive, Input} from '@angular/core';

        @Directive({
          selector: '[myInput]',
          standalone: true,
        })
        export class Dir {
          @Input() myInput!: string;
        }

        @Component({
          selector: 'app-cmp',
          template: '<input [my¦]>',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('snippet_prop_no_val_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContainInsertTextWithSnippet(completions, CompletionItemKind.Property, [
          '[myInput]="$1"',
        ]);
      });
    });

    it('should insert snippet for DOM property binding', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<input [val¦]>',
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('snippet_dom_prop_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContainInsertTextWithSnippet(completions, CompletionItemKind.Property, [
          '[value]="$1"',
        ]);
      });
    });

    it('should insert snippet for two-way binding with empty value', async () => {
      const appTs = `
        import {Component, Directive, Input, Output, EventEmitter} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          @Input() model: any;
          @Output() modelChange = new EventEmitter<any>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<h1 dir [(mod¦)]=""></h1>',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('snippet_twoway_empty_val_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContainInsertTextWithSnippet(completions, CompletionItemKind.Property, [
          '[(model)]="$1"',
        ]);
      });
    });

    it('should insert snippet for two-way binding without value', async () => {
      const appTs = `
        import {Component, Directive, Input, Output, EventEmitter} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: true,
        })
        export class Dir {
          @Input() model: any;
          @Output() modelChange = new EventEmitter<any>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<h1 dir [(mod¦)]></h1>',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('snippet_twoway_no_val_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContainInsertTextWithSnippet(completions, CompletionItemKind.Property, [
          '[(model)]="$1"',
        ]);
      });
    });

    it('should insert snippet for structural directive without value', async () => {
      const appTs = `
        import {Component, Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';

        @Directive({
          selector: '[ngFor][ngForOf]',
          standalone: true,
        })
        export class NgForOf<T> {
          constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef<any>) {}
          @Input() ngForOf!: T[];
        }

        @Component({
          selector: 'app-cmp',
          template: '<input dir *ngFor¦>',
          standalone: true,
          imports: [NgForOf],
        })
        export class AppCmp {}
      `;

      await env.run('snippet_structural_no_val_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContainInsertTextWithSnippet(completions, CompletionItemKind.Class, ['ngFor="$1"']);
      });
    });

    it('should not insert snippet for attribute with an existing value', async () => {
      const appTs = `
        import {Component, Directive, Input} from '@angular/core';

        @Directive({
          selector: '[myInput]',
          standalone: true,
        })
        export class Dir {
          @Input() myInput!: string;
        }

        @Component({
          selector: 'app-cmp',
          template: '<input dir myInput¦="1">',
          standalone: true,
          imports: [Dir],
        })
        export class AppCmp {}
      `;

      await env.run('snippet_attr_existing_val_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Field, ['myInput']);
        expectDoesNotContainInsertTextWithSnippet(completions, CompletionItemKind.Field, [
          'myInput="$1"',
        ]);
      });
    });

    it('should not insert snippet for directive attribute without input', async () => {
      const appTs = `
        import {Component, Directive, Input} from '@angular/core';

        @Directive({
          selector: 'button[mat-button]',
          standalone: true,
        })
        export class MatButton {
          @Input() color!: string;
        }

        @Component({
          selector: 'app-cmp',
          template: '<button mat-¦></button>',
          standalone: true,
          imports: [MatButton],
        })
        export class AppCmp {}
      `;

      await env.run('snippet_dir_no_input_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Class, ['mat-button']);
        expectDoesNotContainInsertTextWithSnippet(completions, CompletionItemKind.Class, [
          'mat-button="$1"',
        ]);
      });
    });

    it('should insert snippet for blocks', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@¦',
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('snippet_block_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContainInsertTextWithSnippet(completions, CompletionItemKind.Keyword, [
          'for (${1:item} of ${2:items}; track ${3:\\$index}) {$4}',
        ]);
      });
    });
  });

  describe('let declarations', () => {
    it('should return let declarations in template scope', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: \`@let message = 'hello'; {{mess¦}}\`,
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('let_template_scope_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Variable, ['message']);
      });
    });

    it('should complete empty let declaration with semicolon', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@let foo = ¦;',
          standalone: true,
        })
        export class AppCmp {
          title = 'App';
          hero = 123;
        }
      `;

      await env.run('let_empty_semi_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Property, ['title', 'hero']);
      });
    });

    it('should complete single let declaration without semicolon', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@let foo = ¦',
          standalone: true,
        })
        export class AppCmp {
          title = 'App';
          hero = 123;
        }
      `;

      await env.run('let_empty_no_semi_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Property, ['title', 'hero']);
      });
    });

    it('should complete a let declaration property in the global scope', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: \`@let hobbit = {name: 'Frodo', age: 53}; {{hobbit.¦}}\`,
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('let_prop_access_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Property, ['age', 'name']);
      });
    });

    it('should complete a shadowed let declaration property', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: \`@let hobbit = {name: 'Frodo', age: 53}; @if (true) { @let hobbit = {hasRing: true, size: 'small'}; {{hobbit.¦}} }\`,
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('let_shadowed_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Property, ['hasRing', 'size']);
      });
    });
  });

  describe('host bindings', () => {
    it('should complete property host binding expressions', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<div></div>',
          host: {
            '[attr.id]': 'ti¦',
          },
          standalone: true,
        })
        export class AppCmp {
          title = 'App';
          hero = 123;
        }
      `;

      await env.run('host_binding_prop_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Property, ['title', 'hero']);
      });
    });

    it('should complete listener host binding expressions', async () => {
      const appTs = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<div></div>',
          host: {
            '(click)': 't¦',
          },
          standalone: true,
        })
        export class AppCmp {
          title = 'App';
          hero = 123;
        }
      `;

      await env.run('host_binding_listener_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Property, ['title', 'hero']);
      });
    });

    it('should complete inside host of a directive', async () => {
      const appTs = `
        import {Directive} from '@angular/core';

        @Directive({
          selector: '[dir]',
          host: {
            '[title]': 'ti¦',
          },
          standalone: true,
        })
        export class Dir {
          title = 'App';
          hero = 123;
        }
      `;

      await env.run('host_binding_dir_test.ts', appTs, async (ls, filePath) => {
        const completions = await env.getCompletionsAtPosition(ls, filePath);
        expectContain(completions, CompletionItemKind.Property, ['title', 'hero']);
      });
    });
  });
});
