import * as path from 'path';
import * as rpc from 'vscode-jsonrpc/node';
import {CompletionItemKind} from 'vscode-languageserver';
import {TestEnv, startTestServer} from './test_helpers';
import {TestFileManager} from '../../packages/compiler-cli/preprocessor/language-service/tests/test_file_manager';

const testWorkspacePath = path.join(__dirname, 'test-workspace');

describe('LSP Completions', () => {
  let connection: rpc.MessageConnection;
  let tsgoConnection: rpc.MessageConnection;
  let serverCleanup: () => Promise<void>;
  let env: TestEnv;

  beforeAll(async () => {
    const result = await startTestServer(testWorkspacePath);
    connection = result.connection;
    tsgoConnection = result.tsgoConnection;
    serverCleanup = result.cleanup;
  });

  afterAll(async () => {
    await serverCleanup();
  });

  beforeEach(() => {
    const fileManager = new TestFileManager(testWorkspacePath);
    env = new TestEnv(connection, tsgoConnection, fileManager);
  });

  afterEach(async () => {
    await env.cleanup();
  });

  it('should provide completions in inline template expression', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-comp-test',
        template: '<div>{{ ¦ }}</div>',
        standalone: true,
      })
      export class AppCompTestComponent {
        myProperty: string = 'hello';
        myMethod(): void {}
      }
    `;

    await env.run('app_comp_test.ts', appTsContent, async (filePath) => {
      await env.expectCompletionsAtCursor(filePath, [
        {label: 'myProperty', kind: CompletionItemKind.Property},
        {label: 'myMethod', kind: CompletionItemKind.Method},
      ]);
    });
  });

  it('should provide completions in external template', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-ext-comp',
        templateUrl: './app_ext_comp.component.html',
        standalone: true,
      })
      export class AppExtCompComponent {
        heroName: string = 'Angular';
      }
    `;
    const templateContent = '<span>{{ ¦ }}</span>';

    const tsName = 'app_ext_comp.component.ts';
    const htmlName = 'app_ext_comp.component.html';

    await env.run(htmlName, templateContent, async (htmlPath) => {
      const tsPath = await env.createFile(tsName, appTsContent);
      await env.openFile(tsPath, appTsContent);

      await env.expectCompletionsAtCursor(htmlPath, [
        {label: 'heroName', kind: CompletionItemKind.Property},
      ]);
    });
  });

  it('should provide attribute and binding completions', async () => {
    const appTsContent = `
      import {Component, Directive, Input, Output, EventEmitter} from '@angular/core';
      @Directive({
        selector: '[customDir]',
        standalone: true,
      })
      export class CustomDirective {
        @Input() customInput!: string;
        @Output() customOutput = new EventEmitter<void>();
      }

      @Component({
        selector: 'app-binding-comp',
        template: '<button customDir ¦></button>',
        imports: [CustomDirective],
        standalone: true,
      })
      export class AppBindingCompComponent {}
    `;

    await env.run('app_binding_comp.ts', appTsContent, async (filePath) => {
      await env.expectCompletionsAtCursor(filePath, [
        {label: '[customInput]', kind: CompletionItemKind.Property},
        {label: '(customOutput)', kind: CompletionItemKind.Event},
        {label: '(click)', kind: CompletionItemKind.Event},
        {label: '[title]', kind: CompletionItemKind.Property},
      ]);
    });
  });

  it('should provide control flow block completions', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-block-comp',
        template: '<div>@¦</div>',
        standalone: true,
      })
      export class AppBlockCompComponent {}
    `;

    await env.run('app_block_comp.ts', appTsContent, async (filePath) => {
      await env.expectCompletionsAtCursor(filePath, [
        {label: 'if', kind: CompletionItemKind.Keyword},
        {label: 'for', kind: CompletionItemKind.Keyword},
        {label: 'switch', kind: CompletionItemKind.Keyword},
        {label: 'defer', kind: CompletionItemKind.Keyword},
      ]);
    });
  });

  it('should provide completions for @let declarations in template', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-let-comp',
        template: '@let userGreeting = "Welcome"; <div>{{ ¦ }}</div>',
        standalone: true,
      })
      export class AppLetCompComponent {}
    `;

    await env.run('app_let_comp.ts', appTsContent, async (filePath) => {
      await env.expectCompletionsAtCursor(filePath, [
        {label: 'userGreeting', kind: CompletionItemKind.Variable},
      ]);
    });
  });

  it('should provide completions for @for loop variables and class members', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-for-comp',
        template: '@for (route of routes; track $index) { {{ rou¦ }} }',
        standalone: true,
      })
      export class AppForCompComponent {
        routes: string[] = ['/home', '/about'];
      }
    `;

    await env.run('app_for_comp.ts', appTsContent, async (filePath) => {
      await env.expectCompletionsAtCursor(filePath, [
        {label: 'route', kind: CompletionItemKind.Variable},
        {label: 'routes', kind: CompletionItemKind.Property},
        {label: '$index', kind: CompletionItemKind.Variable},
      ]);
    });
  });

  it('should update completions incrementally when class members are added', async () => {
    const appTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-inc-comp',
        template: '<div>{{ ¦ }}</div>',
        standalone: true,
      })
      export class AppIncCompComponent {
        initialProp = 123;
      }
    `;

    await env.run('app_inc_comp.ts', appTsContent, async (filePath) => {
      await env.expectCompletionsAtCursor(filePath, [
        {label: 'initialProp', kind: CompletionItemKind.Property},
      ]);

      // Edit file to add dynamic property
      const updatedContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-inc-comp',
        template: '<div>{{ ¦ }}</div>',
        standalone: true,
      })
      export class AppIncCompComponent {
        initialProp = 123;
        dynamicallyAddedProp = 'hello';
      }
    `;
      await env.editFile(filePath, updatedContent, 'virtual');

      await env.expectCompletionsAtCursor(filePath, [
        {label: 'initialProp', kind: CompletionItemKind.Property},
        {label: 'dynamicallyAddedProp', kind: CompletionItemKind.Property},
      ]);
    });
  });
});
