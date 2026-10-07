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

describe('QuickInfo with TS 7 binary', () => {
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

  it('should _not_ get quick info for TypeScript code', async () => {
    // The LS is only expected to provide quick info for Angular-related code.
    // Providing quick info for TS code will result in duplicate hover info because
    // the existing TS language service will provide its own hover and the editor
    // does not de-deuplicate it
    const appTsContent = `
        import {Component} from '@angular/core';
        @Component({
          selector: 'app-elements-test',
          template: '<button></button>',
          standalone: true,
        })
        export class A¦ppElementsTestComponent {}
      `;

    await env.run('app_elements_test.ts', appTsContent, async (ls, filePath) => {
      await env.expectHoverAtCursor(ls, filePath, null);
    });
  });

  describe('1. Elements', () => {
    it('should get quick info for native elements', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';
        @Component({
          selector: 'app-elements-test',
          template: '<¦button></button>',
          standalone: true,
        })
        export class AppElementsTestComponent {}
      `;

      await env.run('app_elements_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['HTMLButtonElement']);
      });
    });

    it('should work for directives which match native element tags', async () => {
      const appTsContent = `
        import {Component, Directive, Input} from '@angular/core';

        @Directive({
          selector: 'button[custom-button][compound]',
          standalone: true,
        })
        export class CompoundCustomButtonDirective {
          @Input() config?: {color?: string};
        }

        @Component({
          selector: 'app-elements-dir-test',
          template: '<¦button compound custom-button></button>',
          standalone: true,
          imports: [CompoundCustomButtonDirective],
        })
        export class AppElementsDirTestComponent {}
      `;

      await env.run('app_elements_dir_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['CompoundCustomButtonDirective']);
      });
    });
  });
  describe('2. Templates', () => {
    it('should get quick info for ng-template', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';
        @Component({
          selector: 'app-templates-test',
          template: '<¦ng-template></ng-template>',
          standalone: true,
        })
        export class AppTemplatesTestComponent {}
      `;

      await env.run('app_templates_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, [
          '(template) ng-template',
          'The `<ng-template>` is an Angular element for rendering HTML.',
        ]);
      });
    });
  });
  describe('3. Directives', () => {
    it('should get quick info for directives', async () => {
      const appTsContent = `
        import {Component, Directive} from '@angular/core';

        @Directive({
          selector: '[string-model]',
          standalone: true,
        })
        export class StringModel {
          model!: string;
        }

        @Component({
          selector: 'app-cmp',
          template: '<div ¦string-model></div>',
          standalone: true,
          imports: [StringModel],
        })
        export class AppCmp {
        }
      `;

      await env.run('app_directives_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['StringModel']);
      });
    });

    it('should get quick info for components', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        /**
         * This Component provides the \`test-comp\` selector.
         */
        @Component({
          selector: 'test-comp',
          template: '<div></div>',
          standalone: true,
        })
        export class TestComponent {
          name!: string;
        }

        @Component({
          selector: 'app-cmp',
          template: '<¦test-comp></test-comp>',
          standalone: true,
          imports: [TestComponent],
        })
        export class AppCmp {
        }
      `;

      await env.run('app_components_test.ts', appTsContent, async (ls, filePath) => {
        await ls.getTcb(filePath, {line: 0, character: 0});
        await env.expectHoverAtCursor(ls, filePath, [
          'TestComponent',
          'This Component provides the `test-comp` selector.',
        ]);
      });
    });

    it('should get quick info for components with bound attributes', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        /**
         * This Component provides the \`test-comp\` selector.
         */
        @Component({
          selector: 'test-comp',
          template: '<div></div>',
          standalone: true,
        })
        export class TestComponent {
          name!: string;
        }

        @Component({
          selector: 'app-cmp',
          template: '<¦test-comp [attr.id]="\\'1\\' + \\'2\\'" [attr.name]="\\'myName\\'"></test-comp>',
          standalone: true,
          imports: [TestComponent],
        })
        export class AppCmp {
        }
      `;

      await env.run('app_components_bound_attrs_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, [
          'TestComponent',
          'This Component provides the `test-comp` selector.',
        ]);
      });
    });

    it('should get quick info for structural directives', async () => {
      const appTsContent = `
        import {Component, Directive, Input} from '@angular/core';

        @Directive({
          selector: '[ngFor][ngForOf]',
          standalone: true,
        })
        export class NgForOf<T, U> {
          @Input() ngForOf!: U;
        }

        @Component({
          selector: 'app-cmp',
          template: '<div *¦ngFor="let item of heroes"></div>',
          standalone: true,
          imports: [NgForOf],
        })
        export class AppCmp {
          heroes!: string[];
        }
      `;

      await env.run('app_structural_directives_test.ts', appTsContent, async (ls, filePath) => {
        await ls.getTcb(filePath, {line: 0, character: 0});
        await env.expectHoverAtCursor(ls, filePath, ['NgForOf']);
      });
    });

    it('should get quick info for compound selectors', async () => {
      const appTsContent = `
        import {Directive, Component} from '@angular/core';

        @Directive({
          selector: 'button[custom]',
          standalone: true,
        })
        export class CompoundCustomButtonDirective {
          config?: {color?: string};
        }

        @Component({
          selector: 'app-cmp',
          template: '<button ¦custom></button>',
          standalone: true,
          imports: [CompoundCustomButtonDirective],
        })
        export class AppCmp {
        }
      `;

      await env.run('app_compound_selectors_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['CompoundCustomButtonDirective']);
      });
    });

    it('should get tags and documentation for directives', async () => {
      const appTsContent = `
        import {Component, Directive} from '@angular/core';

        /**
         * Don't use me
         * @deprecated use the new thing
         */
        @Directive({
          selector: '[deprecated]',
          standalone: true,
        })
        export class DeprecatedDirective {}

        @Component({
          selector: 'app-cmp',
          template: '<div ¦deprecated></div>',
          standalone: true,
          imports: [DeprecatedDirective],
        })
        export class AppCmp {
        }
      `;

      await env.run('app_tags_docs_test.ts', appTsContent, async (ls, filePath) => {
        await ls.getTcb(filePath, {line: 0, character: 0});
        await env.expectHoverAtCursor(ls, filePath, [
          'DeprecatedDirective',
          "Don't use me",
          '@deprecated',
        ]);
      });
    });
  });
  describe('4. Bindings', () => {
    it('should get quick info for input providers', async () => {
      const appTsContent = `
        import {Component, Input} from '@angular/core';

        @Component({
          selector: 'test-comp',
          template: '<div>Testing: {{name}}</div>',
          standalone: true,
        })
        export class TestComponent {
          @Input('tcName') name!: string;
        }

        @Component({
          selector: 'app-cmp',
          template: '<test-comp [¦tcName]="name"></test-comp>',
          standalone: true,
          imports: [TestComponent],
        })
        export class AppCmp {
          name!: string;
        }
      `;

      await env.run('app_bindings_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['TestComponent.name', 'string']);
      });
    });

    it('should work for bind- syntax', async () => {
      const appTsContent = `
        import {Component, Input} from '@angular/core';

        @Component({
          selector: 'test-comp',
          template: '<div></div>',
          standalone: true,
        })
        export class TestComponent {
          @Input('tcName') name!: string;
        }

        @Component({
          selector: 'app-cmp',
          template: '<test-comp bind-¦tcName="name"></test-comp>',
          standalone: true,
          imports: [TestComponent],
        })
        export class AppCmp {
          name!: string;
        }
      `;

      await env.run('app_bind_syntax.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['TestComponent.name', 'string']);
      });
    });

    it('should work for on- syntax', async () => {
      const appTsContent = `
        import {Component, Output, EventEmitter} from '@angular/core';

        @Component({
          selector: 'test-comp',
          template: '<div></div>',
          standalone: true,
        })
        export class TestComponent {
          @Output() test = new EventEmitter<void>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<test-comp on-¦test="myClick()"></test-comp>',
          standalone: true,
          imports: [TestComponent],
        })
        export class AppCmp {
          myClick() {}
        }
      `;

      await env.run('app_on_syntax.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['TestComponent.test', 'EventEmitter']);
      });
    });

    it('should work for signal-based two-way binding', async () => {
      const appTsContent = `
        import {Component, model} from '@angular/core';

        @Component({
          selector: 'test-comp',
          template: '<div></div>',
          standalone: true,
        })
        export class TestComponent {
          signalModel = model<string>('');
        }

        @Component({
          selector: 'app-cmp',
          template: '<test-comp [(sig¦nalModel)]="signalValue"></test-comp>',
          standalone: true,
          imports: [TestComponent],
        })
        export class AppCmp {
          signalValue = 'hello';
        }
      `;

      await env.run('app_signal_two_way.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['TestComponent.signalModel', 'ModelSignal']);
      });
    });

    it('should work for $event from native elements', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<div (click)="myClick($ev¦ent)"></div>',
          standalone: true,
        })
        export class AppCmp {
          myClick(event: MouseEvent) {}
        }
      `;

      await env.run('app_event_native.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['$event', 'PointerEvent']);
      });
    });

    it('should work for click event on native element', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<div (cli¦ck)="myClick($event)"></div>',
          standalone: true,
        })
        export class AppCmp {
          myClick(event: MouseEvent) {}
        }
      `;

      await env.run('app_click_native.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['addEventListener']);
      });
    });

    it('should get quick info for structural directive inputs ngForOf', async () => {
      const appTsContent = `
        import {Component, Directive, Input, IterableDiffers, ViewContainerRef, TemplateRef} from '@angular/core';

        @Directive({
          selector: '[ngFor][ngForOf]',
          standalone: true,
        })
        export class NgForOf<T, U> {
          @Input() ngForOf!: U;
        }

        @Component({
          selector: 'app-cmp',
          template: '<div *ngFor="let item ¦of heroes"></div>',
          standalone: true,
          imports: [NgForOf],
        })
        export class AppCmp {
          heroes!: string[];
        }
      `;

      await env.run('app_bindings_ngfor_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['NgForOf', 'ngForOf', 'string[]']);
      });
    });

    it('should get quick info for two-way binding providers', async () => {
      const appTsContent = `
        import {Component, Directive, Input, Output, EventEmitter} from '@angular/core';

        @Directive({
          selector: '[string-model]',
          standalone: true,
        })
        export class StringModel {
          @Input() model!: string;
          @Output() modelChange = new EventEmitter<string>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<div string-model [(¦model)]="title"></div>',
          standalone: true,
          imports: [StringModel],
        })
        export class AppCmp {
          title!: string;
        }
      `;

      await env.run('app_bindings_twoway_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['StringModel.model', 'string']);
      });
    });

    it('should get quick info for event providers', async () => {
      const appTsContent = `
        import {Component, EventEmitter, Output} from '@angular/core';

        @Component({
          selector: 'test-comp',
          template: '<div></div>',
          standalone: true,
        })
        export class TestComponent {
          @Output('test') testEvent = new EventEmitter<string>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<test-comp (¦test)="myClick($event)"></test-comp>',
          standalone: true,
          imports: [TestComponent],
        })
        export class AppCmp {
          myClick(event: string) {}
        }
      `;

      await env.run('app_bindings_event_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['TestComponent.testEvent', 'EventEmitter']);
      });
    });

    it('should get quick info for $event from EventEmitter', async () => {
      const appTsContent = `
        import {Component, EventEmitter, Output, Directive} from '@angular/core';

        @Directive({
          selector: '[string-model]',
          standalone: true,
        })
        export class StringModel {
          @Output() modelChange = new EventEmitter<string>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<div string-model (modelChange)="myClick(¦$event)"></div>',
          standalone: true,
          imports: [StringModel],
        })
        export class AppCmp {
          myClick(event: string) {}
        }
      `;

      await env.run('app_bindings_event_param_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['$event', 'string']);
      });
    });
  });
  describe('5. References', () => {
    it('should get quick info for element reference declarations', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<div #¦chart></div>',
          standalone: true,
        })
        export class AppCmp {
        }
      `;

      await env.run('app_refs_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['chart', 'HTMLDivElement']);
      });
    });

    it('should get quick info for directive references', async () => {
      const appTsContent = `
        import {Component, Directive} from '@angular/core';

        @Directive({
          selector: '[string-model]',
          exportAs: 'stringModel',
          standalone: true,
        })
        export class StringModel {
          model!: string;
        }

        @Component({
          selector: 'app-cmp',
          template: '<div string-model #¦dirRef="stringModel"></div>',
          standalone: true,
          imports: [StringModel],
        })
        export class AppCmp {
        }
      `;

      await env.run('app_refs_dir_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['StringModel']);
      });
    });

    it('should get quick info for ref- syntax', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<div ref-¦chart></div>',
          standalone: true,
        })
        export class AppCmp {
        }
      `;

      await env.run('app_refs_ref_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['chart', 'HTMLDivElement']);
      });
    });
  });
  describe('6. Variables', () => {
    it('should work for array members', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        interface Hero {
          id: number;
          name: string;
        }

        @Component({
          selector: 'app-cmp',
          template: '@let hero = heroes[0]; {{¦hero}}',
          standalone: true,
        })
        export class AppCmp {
          heroes!: Hero[];
        }
      `;

      await env.run('app_variables_array_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['hero', 'Hero']);
      });
    });

    it('should work for ReadonlyArray members', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        interface Hero {
          id: number;
          name: string;
        }

        @Component({
          selector: 'app-cmp',
          template: '@let hero = heroProp; {{¦hero}}',
          standalone: true,
        })
        export class AppCmp {
          heroProp!: Readonly<Hero>;
        }
      `;

      await env.run('app_variables_readonly_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['hero', 'Readonly<Hero>']);
      });
    });

    it('should work for const array members', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@let name = constObj.name; {{¦name}}',
          standalone: true,
        })
        export class AppCmp {
          constObj = { name: "name" } as const;
        }
      `;

      await env.run('app_variables_const_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['name', '"name"']);
      });
    });

    it('should work for safe keyed reads', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@let keyedRead = constNamesOptional?.[0]; {{¦keyedRead}}',
          standalone: true,
        })
        export class AppCmp {
          constNamesOptional?: [{readonly name: 'name'}];
        }
      `;

      await env.run('app_variables_safe_keyed_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['keyedRead', "'name'"]);
      });
    });

    it('should work for template literal interpolations', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@let name = constObj.name; {{ \`Hello \${¦name}\` }}',
          standalone: true,
        })
        export class AppCmp {
          constObj = { name: 'name' } as const;
        }
      `;

      await env.run('app_variables_literal_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['name', '"name"']);
      });
    });
  });
  describe('7. Pipes', () => {
    it('should get quick info for pipes', async () => {
      const appTsContent = `
        import {Component, Pipe, PipeTransform} from '@angular/core';

        @Pipe({
          name: 'myDate',
          standalone: true,
        })
        export class MyDatePipe implements PipeTransform {
          transform(value: any, format: string): any { return null; }
        }

        @Component({
          selector: 'app-cmp',
          template: '<div>{{ birthday | ¦myDate:"MM/dd/yy" }}</div>',
          standalone: true,
          imports: [MyDatePipe],
        })
        export class AppCmp {
          birthday = new Date();
        }
      `;

      await env.run('app_pipes_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['MyDatePipe']);
      });
    });
  });
  describe('8. Expressions', () => {
    it('should get quick info for component property', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{¦title}}',
          standalone: true,
        })
        export class AppCmp {
          title: string = 'hello';
        }
      `;

      await env.run('app_expr_prop.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['AppCmp.title', 'string']);
      });
    });

    it('should work for members in attribute interpolation', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<div title="{{ti¦tle}}"></div>',
          standalone: true,
        })
        export class AppCmp {
          title: string = 'hello';
        }
      `;

      await env.run('app_expr_attr_interp.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['AppCmp.title', 'string']);
      });
    });

    it('should work for members of input binding', async () => {
      const appTsContent = `
        import {Component, Input} from '@angular/core';

        @Component({
          selector: 'test-comp',
          template: '<div></div>',
          standalone: true,
        })
        export class TestComponent {
          @Input('tcName') name!: string;
        }

        @Component({
          selector: 'app-cmp',
          template: '<test-comp [tcName]="ti¦tle"></test-comp>',
          standalone: true,
          imports: [TestComponent],
        })
        export class AppCmp {
          title: string = 'hello';
        }
      `;

      await env.run('app_expr_input_bind.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['AppCmp.title', 'string']);
      });
    });

    it('should work for members of event binding', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<div (click)="ti¦tle=$event"></div>',
          standalone: true,
        })
        export class AppCmp {
          title: any;
        }
      `;

      await env.run('app_expr_event_bind.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['AppCmp.title', 'any']);
      });
    });

    it('should work for safe signal calls', async () => {
      const appTsContent = `
        import {Component, signal} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{something?.va¦lue()}}',
          standalone: true,
        })
        export class AppCmp {
          something?: { value: () => string } = { value: signal('hello') };
        }
      `;

      await env.run('app_expr_safe_signal.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['value', '() => string']);
      });
    });

    it('should work for accessed properties in writes', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<div (click)="he¦ro.id = 2"></div>',
          standalone: true,
        })
        export class AppCmp {
          hero = { id: 1 };
        }
      `;

      await env.run('app_expr_prop_write.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['hero', '{ id: number; }']);
      });
    });

    it('should work for method call arguments', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<div (click)="setTitle(he¦ro.name)"></div>',
          standalone: true,
        })
        export class AppCmp {
          hero = { name: 'Angular' };
          setTitle(name: string) {}
        }
      `;

      await env.run('app_expr_method_args.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['hero', '{ name: string; }']);
      });
    });

    it('should work for members of two-way binding', async () => {
      const appTsContent = `
        import {Component, Input, Output, EventEmitter} from '@angular/core';

        @Component({
          selector: 'test-comp',
          template: '<div></div>',
          standalone: true,
        })
        export class TestComponent {
          @Input() model!: string;
          @Output() modelChange = new EventEmitter<string>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<test-comp [(model)]="ti¦tle"></test-comp>',
          standalone: true,
          imports: [TestComponent],
        })
        export class AppCmp {
          title: string = 'hello';
        }
      `;

      await env.run('app_expr_two_way.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['AppCmp.title', 'string']);
      });
    });

    it('should work for in operator', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{ "key" in her¦oes }}',
          standalone: true,
        })
        export class AppCmp {
          heroes = { key: 'Angular' };
        }
      `;

      await env.run('app_expr_in_op.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['heroes', '{ key: string; }']);
      });
    });

    it('should work for parenthesized exponentiation expression', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{ (-any¦Value) ** 2 }}',
          standalone: true,
        })
        export class AppCmp {
          anyValue = 2;
        }
      `;

      await env.run('app_expr_pow.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['anyValue', 'number']);
      });
    });

    it('should work for object literal with shorthand property declarations', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{ { ti¦tle } }}',
          standalone: true,
        })
        export class AppCmp {
          title = 'hello';
        }
      `;

      await env.run('app_expr_obj_shorthand.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['title', 'string']);
      });
    });

    it('should work for accessed property reads', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{title.¦length}}',
          standalone: true,
        })
        export class AppCmp {
          title: string = 'hello';
        }
      `;

      await env.run('app_expr_prop_read.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['number']);
      });
    });

    it('should work for accessed function calls', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{someObject.¦someMethod()}}',
          standalone: true,
        })
        export class AppCmp {
          someObject = {
            someMethod: () => 1
          };
        }
      `;

      await env.run('app_expr_func_call.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['someMethod']);
      });
    });

    it('should work for accessed very nested function calls', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{someObject.nested.¦helloWorld().nestedMethod()}}',
          standalone: true,
        })
        export class AppCmp {
          someObject = {
            nested: {
              helloWorld: () => ({
                nestedMethod: () => 1
              })
            }
          };
        }
      `;

      await env.run('app_expr_nested_func.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['helloWorld']);
      });
    });

    it('should find input binding on text attribute', async () => {
      const appTsContent = `
        import {Component, Input} from '@angular/core';

        @Component({
          selector: 'test-comp',
          template: '',
          standalone: true,
        })
        export class TestComponent {
          @Input() name!: string;
        }

        @Component({
          selector: 'app-cmp',
          template: '<test-comp ¦name="hello"></test-comp>',
          standalone: true,
          imports: [TestComponent],
        })
        export class AppCmp {}
      `;

      await env.run('app_expr_text_attr.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['TestComponent.name', 'string']);
      });
    });

    it('should work for method calls', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{¦setTitle("title")}}',
          standalone: true,
        })
        export class AppCmp {
          setTitle(newTitle: string) {}
        }
      `;

      await env.run('app_expr_method_call.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['setTitle']);
      });
    });

    it('should work for safe method calls', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{something?.¦myFunc()}}',
          standalone: true,
        })
        export class AppCmp {
          something?: { myFunc: () => void };
        }
      `;

      await env.run('app_expr_safe_method.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['myFunc']);
      });
    });

    it('should work for signal calls', async () => {
      const appTsContent = `
        import {Component, signal} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{something.¦value()}}',
          standalone: true,
        })
        export class AppCmp {
          something = {
            value: signal(0)
          };
        }
      `;

      await env.run('app_expr_signal.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['value']);
      });
    });

    it('should work for the $any() cast function', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '{{¦$any(title)}}',
          standalone: true,
        })
        export class AppCmp {
          title: string = 'hello';
        }
      `;

      await env.run('app_expr_any.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['$any']);
      });
    });

    it('should work with void operator', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<div (click)="¦myClick(null)"></div>',
          standalone: true,
        })
        export class AppCmp {
          myClick(event: any) {}
        }
      `;

      await env.run('app_expr_void.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['myClick']);
      });
    });

    it('should work for tagged template literal tag', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '<div>{{ some¦Tag\`text\` }}</div>',
          standalone: true,
        })
        export class AppCmp {
          someTag = (strings: TemplateStringsArray, ...args: any[]) => '';
        }
      `;

      await env.run('app_expr_tagged_template.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['someTag']);
      });
    });
  });
  describe('9. Blocks (Control Flow)', () => {
    it('should work for @defer block', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@de¦fer { } @placeholder { <input /> }',
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('app_blocks_defer.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['(block) @defer']);
      });
    });

    it('should work for @defer with condition', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@defer (wh¦en condition) { }',
          standalone: true,
        })
        export class AppCmp {
          condition = true;
        }
      `;

      await env.run('app_blocks_defer_cond.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['(keyword) when']);
      });
    });

    it('should work for idle with timeout', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@defer (on id¦le; prefetch on idle) { }',
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('app_blocks_idle_timeout.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['(trigger) idle']);
      });
    });

    it('should work for prefetch and hydrate modifiers', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@defer (on idle; pref¦etch on idle) { }',
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('app_blocks_prefetch.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['(keyword) prefetch']);
      });
    });

    it('should work for comma-separated list in implicit variable assignment for @for', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@for (item of items; track item; let i = $index, ¦e = $even) {}',
          standalone: true,
        })
        export class AppCmp {
          items = [];
        }
      `;

      await env.run('app_blocks_for_comma.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['e', 'boolean']);
      });
    });

    it('should work for narrowed @if block alias variable', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@if (user(); as u¦ser) { {{user.name}} }',
          standalone: true,
        })
        export class AppCmp {
          user = () => ({ name: 'Angular' }) as { name: string } | null;
        }
      `;

      await env.run('app_blocks_if_narrowed.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['user', '{ name: string; }']);
      });
    });

    it('should work for function call in @if block alias variable', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@if (get¦User(); as user) { }',
          standalone: true,
        })
        export class AppCmp {
          getUser() { return { name: 'Angular' }; }
        }
      `;

      await env.run('app_blocks_if_func.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['AppCmp.getUser', ': { name: string; }']);
      });
    });

    it('should work for @else if block alias variable', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@if (false) { } @else if (user(); as u¦ser) { }',
          standalone: true,
        })
        export class AppCmp {
          user = () => ({ name: 'Angular' });
        }
      `;

      await env.run('app_blocks_else_if.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['user', '{ name: string; }']);
      });
    });

    it('should work for @placeholder block', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@defer { } @pla¦ceholder { <input /> }',
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('app_blocks_placeholder.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['(block) @placeholder']);
      });
    });

    it('should work for @loading block', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@defer { } @load¦ing { <input /> }',
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('app_blocks_loading.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['(block) @loading']);
      });
    });

    it('should work for @error block', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@defer { } @err¦or { <input /> }',
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('app_blocks_error.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['(block) @error']);
      });
    });

    it('should work for viewport trigger', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@defer (on vie¦wport(x)) { } <div #x></div>',
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('app_blocks_viewport.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['(trigger) viewport']);
      });
    });

    it('should work for immediate trigger', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@defer (on imme¦diate) {}',
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('app_blocks_immediate.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['(trigger) immediate']);
      });
    });

    it('should work for idle trigger', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@defer (on i¦dle) { }',
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('app_blocks_idle.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['(trigger) idle']);
      });
    });

    it('should work for hover trigger', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@defer (on hov¦er(x)) { } <div #x></div>',
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('app_blocks_hover.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['(trigger) hover']);
      });
    });

    it('should work for timer trigger', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@defer (on tim¦er(100)) { }',
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('app_blocks_timer.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['(trigger) timer']);
      });
    });

    it('should work for interaction trigger', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@defer (on interactio¦n(x)) { } <div #x></div>',
          standalone: true,
        })
        export class AppCmp {}
      `;

      await env.run('app_blocks_interaction.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['(trigger) interaction']);
      });
    });

    it('should work for when keyword', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@defer (whe¦n title) { }',
          standalone: true,
        })
        export class AppCmp {
          title = true;
        }
      `;

      await env.run('app_blocks_when.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['(keyword) when']);
      });
    });

    it('should work for @empty block', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@for (item of items; track item) {} @em¦pty {}',
          standalone: true,
        })
        export class AppCmp {
          items = [];
        }
      `;

      await env.run('app_blocks_empty.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['(block) @empty']);
      });
    });

    it('should work for track keyword', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: '@for (item of items; tr¦ack item) {}',
          standalone: true,
        })
        export class AppCmp {
          items = [];
        }
      `;

      await env.run('app_blocks_track.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['(keyword) track']);
      });
    });

    it('should get quick info for implicit variable assignment ($index)', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: \`
            @for (item of items; track item; let i = $index) {
              {{¦i}}
            }
          \`,
          standalone: true,
        })
        export class AppCmp {
          items = ['a', 'b'];
        }
      `;

      await env.run('app_blocks_for_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['number']);
      });
    });

    it('should get quick info for @if block alias variable', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          template: \`
            @if (users; as ¦u) {
              {{u[0].name}}
            }
          \`,
          standalone: true,
        })
        export class AppCmp {
          users: [{readonly name: 'name'}] = [{name: 'name'}];
        }
      `;

      await env.run('app_blocks_if_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ["'name'"]);
      });
    });
  });
  describe('10. Let declarations', () => {
    it('should get quick info for @let declarations', async () => {
      const appTsContent = `
        import {Component} from '@angular/core';
        @Component({
          selector: 'app-let',
          template: '@let name = "Frodo"; {{¦name}}',
          standalone: true,
        })
        export class AppLetComponent {}
      `;

      await env.run('app_let.ts', appTsContent, async (ls, filePath) => {
        // Target the second 'name' in the template '{{name}}'
        await env.expectHoverAtCursor(ls, filePath, ['Frodo']);
      });
    });

    it('should get quick info for @let declarations initialized with narrowed property', async () => {
      const appTsContent = `
        import {Component, Input} from '@angular/core';
        @Component({
          selector: 'app-let-narrowed',
          template: '@if (value !== undefined) { @let name = value; {{¦name}} }',
          standalone: true,
        })
        export class AppLetNarrowedComponent {
          @Input() value: string | undefined;
        }
      `;

      await env.run('app_let_narrowed.ts', appTsContent, async (ls, filePath) => {
        // Target the last 'name' in the template '{{name}}'
        await env.expectHoverAtCursor(ls, filePath, ['string']);
      });
    });
  });
  describe('11. Host bindings', () => {
    it('should handle host property binding', async () => {
      const appText = `
        import {Component} from '@angular/core';
        @Component({
          selector: 'app-root',
          template: '',
          host: {
            '[title]': 'myT¦itle'
          }
        })
        export class AppCmp {
          myTitle = 'hello';
        }
      `;

      await env.run('app_host_bindings.ts', appText, async (ls, filePath) => {
        env.compiler!.getParsedTemplate(filePath, 'AppCmp');
        await env.expectHoverAtCursor(ls, filePath, ['AppCmp.myTitle', 'string']);
      });
    });

    it('should handle host listener', async () => {
      const appText = `
        import {Component} from '@angular/core';
        @Component({
          selector: 'app-root',
          template: '',
          host: {
            '(click)': 'handleC¦lick($event)'
          }
        })
        export class AppCmp {
          handleClick(event: any) {}
        }
      `;

      await env.run('app_host_bindings.ts', appText, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['AppCmp.handleClick', 'event: any']);
      });
    });

    it('should handle host listener parameter', async () => {
      const appText = `
        import {Component} from '@angular/core';
        @Component({
          selector: 'app-root',
          template: '',
          host: {
            '(click)': 'handleClick($ev¦ent)'
          }
        })
        export class AppCmp {
          handleClick(event: PointerEvent) {}
        }
      `;

      await env.run('app_host_bindings.ts', appText, async (ls, filePath) => {
        env.compiler!.getParsedTemplate(filePath, 'AppCmp');
        await env.expectHoverAtCursor(ls, filePath, ['$event', 'PointerEvent']);
      });
    });

    it('should handle host binding on a directive', async () => {
      const appText = `
        import {Directive, Component} from '@angular/core';
        @Directive({
          selector: '[myDir]',
          host: {
            '[title]': '¦myTitle'
          },
          standalone: true,
        })
        export class MyDir {
          myTitle = 'hello';
        }

        @Component({
          template: '<div myDir></div>',
          standalone: true,
          imports: [MyDir],
        })
        export class AppCmp {}
      `;

      await env.run('app_host_bindings.ts', appText, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['MyDir.myTitle', 'string']);
      });
    });
  });
  describe('12. Generics', () => {
    it('should get quick info for the generic input of a directive', async () => {
      const appTsContent = `
        import {Component, Directive, Input} from '@angular/core';

        @Directive({
          selector: '[generic-dir]',
          standalone: true,
        })
        export class GenericDir<T> {
          @Input() input!: T;
        }

        @Component({
          selector: 'app-cmp',
          template: '<div generic-dir [¦input]="name"></div>',
          standalone: true,
          imports: [GenericDir],
        })
        export class AppCmp {
          name: string = 'hello';
        }
      `;

      await env.run('app_generics_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['GenericDir', 'input', 'string']);
      });
    });

    it('should get quick info for generic component', async () => {
      const appTsContent = `
        import {Component, Input} from '@angular/core';

        @Component({
          selector: 'generic-cmp',
          template: '<div></div>',
          standalone: true,
        })
        export class GenericCmp<T> {
          @Input() data!: T;
        }

        @Component({
          selector: 'app-cmp',
          template: '<generic-cmp [¦data]="age"></generic-cmp>',
          standalone: true,
          imports: [GenericCmp],
        })
        export class AppCmp {
          age: number = 42;
        }
      `;

      await env.run('app_generics_cmp_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['GenericCmp', 'data', 'number']);
      });
    });
  });
  describe('13. Non-strict compiler options', () => {
    it('should find input binding on text attribute when strictAttributeTypes is false', async () => {
      const appTsContent = `
        import {Component, Input} from '@angular/core';

        @Component({
          selector: 'test-comp',
          template: '<div></div>',
          standalone: true,
        })
        export class TestComponent {
          @Input() name!: string;
        }

        @Component({
          selector: 'app-cmp',
          template: '<test-comp ¦name="title"></test-comp>',
          standalone: true,
          imports: [TestComponent],
        })
        export class AppCmp {}
      `;

      await env.run(
        'app_non_strict_attr.ts',
        appTsContent,
        async (ls, filePath) => {
          await env.expectHoverAtCursor(ls, filePath, ['TestComponent.name', 'string']);
        },
        {strictTemplates: false},
      );
    });

    it('can still get quick info when strictOutputEventTypes is false', async () => {
      const appTsContent = `
        import {Component, EventEmitter, Output} from '@angular/core';

        @Component({
          selector: 'test-comp',
          template: '<div></div>',
          standalone: true,
        })
        export class TestComponent {
          @Output() testEvent = new EventEmitter<string>();
        }

        @Component({
          selector: 'app-cmp',
          template: '<test-comp (¦testEvent)="myClick($event)"></test-comp>',
          standalone: true,
          imports: [TestComponent],
        })
        export class AppCmp {
          myClick(event: string) {}
        }
      `;

      await env.run(
        'app_non_strict_event.ts',
        appTsContent,
        async (ls, filePath) => {
          await env.expectHoverAtCursor(ls, filePath, ['TestComponent.testEvent', 'EventEmitter']);
        },
        {strictOutputEventTypes: false},
      );
    });

    it('should work for pipes even if checkTypeOfPipes is false', async () => {
      const appTsContent = `
        import {Component, Pipe, PipeTransform} from '@angular/core';

        @Pipe({
          name: 'date',
          standalone: true,
        })
        export class DatePipe implements PipeTransform {
          transform(value: any, ...args: any[]): any { return null; }
        }

        @Component({
          selector: 'app-cmp',
          template: '<div>{{ birthday | ¦date:"MM/dd/yy" }}</div>',
          standalone: true,
          imports: [DatePipe],
        })
        export class AppCmp {
          birthday = new Date();
        }
      `;

      await env.run(
        'app_non_strict_pipe.ts',
        appTsContent,
        async (ls, filePath) => {
          await env.expectHoverAtCursor(ls, filePath, ['DatePipe.transform']);
        },
        {strictTemplates: false},
      );
    });
  });
  describe('14. Selectorless', () => {
    it('should work for selectorless components', async () => {
      const appContent = `
        import { Component } from '@angular/core';

        @Component({
          template: '',
          standalone: true,
        })
        export class TestComponent {
          name!: string;
        }

        @Component({
          selector: 'app-root',
          template: '<Test¦Component></TestComponent>',
          standalone: true,
          imports: [TestComponent],
        })
        export class AppComponent {}
      `;
      await env.run(
        'app_sel_comps.ts',
        appContent,
        async (ls, filePath) => {
          await env.expectHoverAtCursor(ls, filePath, ['TestComponent']);
        },
        {enableSelectorless: true},
      );
    });

    it('should work for selectorless directives', async () => {
      const appContent = `
        import { Directive, Component } from '@angular/core';

        @Directive({
          standalone: true,
        })
        export class TestDirective {
          value!: number;
        }

        @Component({
          selector: 'app-root',
          template: '<div @Test¦Directive></div>',
          standalone: true,
          imports: [TestDirective],
        })
        export class AppComponent {}
      `;
      await env.run(
        'app_sel_dirs.ts',
        appContent,
        async (ls, filePath) => {
          await env.expectHoverAtCursor(ls, filePath, ['(directive) TestDirective']);
        },
        {enableSelectorless: true},
      );
    });

    it('should work for selectorless component input', async () => {
      const appContent = `
        import { Component, Input } from '@angular/core';

        @Component({
          template: '<div></div>',
          standalone: true,
        })
        export class TestComponent {
          @Input('heroName') heroName!: string;
        }

        @Component({
          selector: 'app-root',
          template: '<TestComponent [¦heroName]="hello"></TestComponent>',
          standalone: true,
          imports: [TestComponent],
        })
        export class AppComponent {
          hello = 'world';
        }
      `;
      await env.run(
        'app_sel_comp_input.ts',
        appContent,
        async (ls, filePath) => {
          await env.expectHoverAtCursor(ls, filePath, ['TestComponent.heroName', 'string']);
        },
        {enableSelectorless: true},
      );
    });

    it('should work for selectorless component output', async () => {
      const appContent = `
        import { Component, Output, EventEmitter } from '@angular/core';

        @Component({
          template: '',
          standalone: true,
        })
        export class TestComponent {
          @Output() testEvent = new EventEmitter<string>();
        }

        @Component({
          selector: 'app-root',
          template: '<TestComponent (¦testEvent)="onEvent()"></TestComponent>',
          standalone: true,
          imports: [TestComponent],
        })
        export class AppComponent {
          onEvent() {}
        }
      `;
      await env.run(
        'app_sel_comp_output.ts',
        appContent,
        async (ls, filePath) => {
          await env.expectHoverAtCursor(ls, filePath, ['TestComponent.testEvent', 'EventEmitter']);
        },
        {enableSelectorless: true},
      );
    });

    it('should work for selectorless directive input', async () => {
      const appContent = `
        import { Directive, Component, Input } from '@angular/core';

        @Directive({
          standalone: true,
        })
        export class TestDirective {
          @Input() value!: number;
        }

        @Component({
          selector: 'app-root',
          template: '<div @TestDirective([¦value]="123")></div>',
          standalone: true,
          imports: [TestDirective],
        })
        export class AppComponent {}
      `;
      await env.run(
        'app_sel_dir_input.ts',
        appContent,
        async (ls, filePath) => {
          await env.expectHoverAtCursor(ls, filePath, ['TestDirective.value', 'number']);
        },
        {enableSelectorless: true},
      );
    });

    it('should work for selectorless directive output', async () => {
      const appContent = `
        import { Directive, Component, Output, EventEmitter } from '@angular/core';

        @Directive({
          standalone: true,
        })
        export class TestDirective {
          @Output() dirEvent = new EventEmitter<number>();
        }

        @Component({
          selector: 'app-root',
          template: '<div @TestDirective((¦dirEvent)="onEvent()")></div>',
          standalone: true,
          imports: [TestDirective],
        })
        export class AppComponent {
          onEvent() {}
        }
      `;
      await env.run(
        'app_sel_dir_output.ts',
        appContent,
        async (ls, filePath) => {
          await env.expectHoverAtCursor(ls, filePath, ['TestDirective.dirEvent', 'EventEmitter']);
        },
        {enableSelectorless: true},
      );
    });

    it('should work for selectorless component references', async () => {
      const appContent = `
        import { Component } from '@angular/core';

        @Component({
          template: '',
          standalone: true,
        })
        export class TestComponent {
          name!: string;
        }

        @Component({
          selector: 'app-root',
          template: '<TestComponent #¦myRef></TestComponent>',
          standalone: true,
          imports: [TestComponent],
        })
        export class AppComponent {}
      `;
      await env.run(
        'app_sel_comp_ref.ts',
        appContent,
        async (ls, filePath) => {
          await env.expectHoverAtCursor(ls, filePath, ['TestComponent']);
        },
        {enableSelectorless: true},
      );
    });

    it('should work for selectorless directive references', async () => {
      const appContent = `
        import { Directive, Component } from '@angular/core';

        @Directive({
          exportAs: 'myDir',
          standalone: true,
        })
        export class TestDirective {
          value!: number;
        }

        @Component({
          selector: 'app-root',
          template: '<div @TestDirective(#¦myRef)></div>',
          standalone: true,
          imports: [TestDirective],
        })
        export class AppComponent {}
      `;
      await env.run(
        'app_sel_dir_ref.ts',
        appContent,
        async (ls, filePath) => {
          await env.expectHoverAtCursor(ls, filePath, ['TestDirective']);
        },
        {enableSelectorless: true},
      );
    });
  });
  describe('15. Duplicate Classes', () => {
    it('should work when multiple classes have the same name in the same file', async () => {
      const content1 = `
        import { Component, Input } from '@angular/core';

        export function test1() {
          @Component({
            selector: 'test-cmp',
            template: '<div>{{f¦oo}}</div>',
            standalone: true,
          })
          class TestComponent {
            foo = 'foo_val';
          }
        }

        export function test2() {
          @Component({
            selector: 'test-cmp',
            template: '<div>{{bar}}</div>',
            standalone: true,
          })
          class TestComponent {
            bar = 'bar_val';
          }
        }
      `;
      await env.run('app_dup_classes_1.ts', content1, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['(property) TestComponent.foo: string']);
      });

      const content2 = content1.replace('f¦oo', 'foo').replace('{{bar}}', '{{b¦ar}}');
      await env.run('app_dup_classes_2.ts', content2, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['(property) TestComponent.bar: string']);
      });
    });
  });

  describe('16. Host Directives', () => {
    it('should get quick info for host directive input', async () => {
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

      await env.run('app_host_dir_hover_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['(property) HostDir.hostInput: string']);
      });
    });

    it('should get quick info for aliased host directive input', async () => {
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

      await env.run('app_host_dir_aliased_hover_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['(property) HostDir.originalInput: string']);
      });
    });

    it('should get quick info for host directive output', async () => {
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

      await env.run('app_host_dir_output_hover_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, [
          '(property) HostDir.hostOutput: EventEmitter<string>',
        ]);
      });
    });

    it('should get quick info for chained host directive in multi-directory setup', async () => {
      const innerHostTs = `
        import {Directive, Input} from '@angular/core';

        @Directive({
          standalone: true,
        })
        export class InnerHostDir {
          @Input() innerCount: number = 0;
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
            inputs: ['innerCount: chainedCount']
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
          template: '<div wrapperDir [chainedC¦ount]="num"></div>',
          standalone: true,
          imports: [WrapperDir],
        })
        export class AppCmp {
          num = 42;
        }
      `;

      await env.run('components/app_chained_hover_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, ['(property) InnerHostDir.innerCount: number']);
      });
    });

    it('should get quick info for host directive on component itself', async () => {
      const hostDirTs = `
        import {Directive, Input} from '@angular/core';

        @Directive({
          standalone: true,
        })
        export class TooltipHostDir {
          @Input() tooltipText: string = '';
        }
      `;
      await env.createFile('directives/tooltip_host_dir.ts', hostDirTs);

      const appTsContent = `
        import {Component} from '@angular/core';
        import {TooltipHostDir} from '../directives/tooltip_host_dir';

        @Component({
          selector: 'custom-btn',
          template: '<button><ng-content></ng-content></button>',
          standalone: true,
          hostDirectives: [{
            directive: TooltipHostDir,
            inputs: ['tooltipText: btnTooltip']
          }],
        })
        export class CustomBtn {}

        @Component({
          selector: 'app-cmp',
          template: '<custom-btn [btnToo¦ltip]="msg">Click</custom-btn>',
          standalone: true,
          imports: [CustomBtn],
        })
        export class AppCmp {
          msg = 'Save changes';
        }
      `;

      await env.run('components/custom_btn_hover_test.ts', appTsContent, async (ls, filePath) => {
        await env.expectHoverAtCursor(ls, filePath, [
          '(property) TooltipHostDir.tooltipText: string',
        ]);
      });
    });
  });
});
