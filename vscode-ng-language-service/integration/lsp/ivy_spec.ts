/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {fileURLToPath, pathToFileURL} from 'node:url';
import fs from 'node:fs';
import {cp, readFile, writeFile} from 'node:fs/promises';
import {basename, join} from 'node:path';
import {setTimeout} from 'node:timers/promises';
import {MessageConnection} from 'vscode-jsonrpc';
import * as lsp from 'vscode-languageserver-protocol';

import {SuggestStrictMode, SuggestStrictModeParams} from '../../common/notifications';
import {
  GetComponentsWithTemplateFile,
  GetTcbRequest,
  GetTemplateLocationForComponent,
  IsInAngularProject,
} from '../../common/requests';
import {
  APP_COMPONENT,
  APP_COMPONENT_MODULE,
  APP_COMPONENT_MODULE_URI,
  APP_COMPONENT_URI,
  BAR_COMPONENT,
  BAR_COMPONENT_URI,
  FOO_COMPONENT,
  FOO_COMPONENT_URI,
  FOO_TEMPLATE,
  FOO_TEMPLATE_URI,
  makeTempDir,
  PROJECT_PATH,
  TSCONFIG,
} from '../test_constants';

import {
  createConnection,
  createTracer,
  initializeServer,
  openTextDocument,
  ServerOptions,
} from './test_utils.js';

describe('Angular language server', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; /* 10 seconds */

  let client: MessageConnection;

  beforeEach(async () => {
    await initServer({});
  });

  afterEach(() => {
    client.dispose();
  });

  async function initServer(options: Partial<ServerOptions>) {
    client = createConnection({
      ...options,
    });
    // If debugging, set to
    // - lsp.Trace.Messages to inspect request/response/notification, or
    // - lsp.Trace.Verbose to inspect payload
    client.trace(lsp.Trace.Off, createTracer());
    client.listen();
    await initializeServer(client);
  }

  it('should handle hover on inline template', async () => {
    openTextDocument(client, APP_COMPONENT);
    const response = await client.sendRequest(lsp.HoverRequest.type, {
      textDocument: {
        uri: APP_COMPONENT_URI,
      },
      position: {line: 4, character: 26},
    });
    expect(response?.contents).toContain({
      language: 'typescript',
      value: '(property) AppComponent.name: string',
    });
  });

  it('should show diagnostics for inline template on open', async () => {
    openTextDocument(client, APP_COMPONENT);
    const diagnostics = await getDiagnosticsForFile(client, APP_COMPONENT);
    expect(diagnostics.length).toBe(0);
  });

  it('should show diagnostics for external template on open', async () => {
    client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
      textDocument: {
        uri: FOO_TEMPLATE_URI,
        languageId: 'html',
        version: 1,
        text: `{{ doesnotexist }}`,
      },
    });
    const diagnostics = await getDiagnosticsForFile(client, FOO_TEMPLATE);
    expect(diagnostics.length).toBe(1);
    expect(diagnostics[0].message).toBe(
      `Property 'doesnotexist' does not exist on type 'FooComponent'.`,
    );
    expect(diagnostics[0].relatedInformation).toBeDefined();
    expect(diagnostics[0].relatedInformation!.length).toBe(1);
    expect(diagnostics[0].relatedInformation![0].message).toBe(
      `Error occurs in the template of component FooComponent.`,
    );
    expect(diagnostics[0].relatedInformation![0].location.uri).toBe(FOO_COMPONENT_URI);
  });

  it('should support request cancellation', async () => {
    openTextDocument(client, APP_COMPONENT);
    // Send a request and immediately cancel it
    const promise = client.sendRequest(lsp.HoverRequest.type, {
      textDocument: {
        uri: FOO_COMPONENT_URI,
      },
      position: {line: 4, character: 25},
    });
    // Request above is tagged with ID = 1
    client.sendNotification('$/cancelRequest', {id: 1});
    await expectAsync(promise).toBeRejectedWith(
      jasmine.objectContaining({
        code: lsp.LSPErrorCodes.RequestCancelled,
      }),
    );
  });

  it('does not break after opening `.d.ts` file from external template', async () => {
    client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
      textDocument: {
        uri: FOO_TEMPLATE_URI,
        languageId: 'html',
        version: 1,
        text: `<div *ngIf="false"></div>`,
      },
    });
    const response = (await client.sendRequest(lsp.DefinitionRequest.type, {
      textDocument: {
        uri: FOO_TEMPLATE_URI,
      },
      position: {line: 0, character: 7},
    })) as lsp.LocationLink[];
    // 2 results - the NgIf class and the ngIf input
    expect(response).toHaveSize(2);
    const {targetUri} = response[0];

    expect(targetUri).toContain('angular/common/types/_common_module-chunk.d.ts');

    // Open the `.d.ts` file
    openTextDocument(client, fileURLToPath(targetUri));
    // try a hover operation again on *ngIf
    const hoverResponse = await client.sendRequest(lsp.HoverRequest.type, {
      textDocument: {
        uri: FOO_TEMPLATE_URI,
      },
      position: {line: 0, character: 7},
    });
    expect(hoverResponse?.contents).toContain({
      language: 'typescript',
      value: 'deprecated,declare (property) NgIf<boolean>.ngIf: boolean',
    });
  });

  it('goes to definition of original source when compiled with source maps', async () => {
    client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
      textDocument: {
        uri: FOO_TEMPLATE_URI,
        languageId: 'html',
        version: 1,
        text: `<lib-post></lib-post>`,
      },
    });
    const response = (await client.sendRequest(lsp.DefinitionRequest.type, {
      textDocument: {
        uri: FOO_TEMPLATE_URI,
      },
      position: {line: 0, character: 1},
    })) as lsp.LocationLink[];
    expect(Array.isArray(response)).toBe(true);
    const {targetUri} = response[0];
    expect(targetUri).toContain('libs/post/src/lib/post.component.ts');
  });

  it('provides folding ranges for inline templates', async () => {
    openTextDocument(
      client,
      APP_COMPONENT,
      `
import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'my-app',
  template: \`
  <div>
    <span>
      Hello {{name}}
    </span>
  </div>\`,
})
export class AppComponent {
  name = 'Angular';
  @Input() appInput = '';
  @Output() appOutput = new EventEmitter<string>();
}`,
    );
    const response = (await client.sendRequest(lsp.FoldingRangeRequest.type, {
      textDocument: {
        uri: APP_COMPONENT_URI,
      },
    })) as lsp.FoldingRange[];
    expect(Array.isArray(response)).toBe(true);
    // 1 folding range for the div, 1 for the span
    expect(response.length).toEqual(2);
    expect(response).toContain({startLine: 6, endLine: 9});
    expect(response).toContain({startLine: 7, endLine: 8});
  });

  it('provides folding ranges for control flow', async () => {
    openTextDocument(
      client,
      APP_COMPONENT,
      `
import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'my-app',
  template: \`
  @if (1) {
    1
  } @else {
    2
  }

  @switch (name) {
    @case ('') {
      3
    } @default {
      4
    }
  }5

  @defer {
    6
  } @placeholder {
    7
  } @error {
    8
  } @loading {
    9
  }

  @for (item of items; track $index) {
    10
  } @empty {
    11
  }
  \`,
})
export class AppComponent {
  name = 'Angular';
  items = [];
}`,
    );
    const response = (await client.sendRequest(lsp.FoldingRangeRequest.type, {
      textDocument: {
        uri: APP_COMPONENT_URI,
      },
    })) as lsp.FoldingRange[];
    expect(Array.isArray(response)).toBe(true);
    // 2 folding ranges for the if/else, 3 for the switch, 4 for defer, 2 for repeater
    expect(response.length).toEqual(11);
    expect(response).toContain({startLine: 6, endLine: 7}); // if
    expect(response).toContain({startLine: 8, endLine: 9}); // else
    expect(response).toContain({startLine: 12, endLine: 17}); // switch
    expect(response).toContain({startLine: 13, endLine: 14}); // case
    expect(response).toContain({startLine: 15, endLine: 16}); // default
    expect(response).toContain({startLine: 20, endLine: 21}); // defer
    expect(response).toContain({startLine: 22, endLine: 23}); // placeholder
    expect(response).toContain({startLine: 24, endLine: 25}); // error
    expect(response).toContain({startLine: 26, endLine: 27}); // loading
    expect(response).toContain({startLine: 30, endLine: 31}); // for
    expect(response).toContain({startLine: 32, endLine: 33}); // empty
  });

  it('provides document symbols for TypeScript files (default: filtered to components)', async () => {
    openTextDocument(
      client,
      APP_COMPONENT,
      `
import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'my-app',
  template: '<div>{{name}}</div>',
})
export class AppComponent {
  name = 'Angular';

  constructor() {}

  greet(): string {
    return 'Hello, ' + this.name;
  }
}`,
    );
    const response = (await client.sendRequest(lsp.DocumentSymbolRequest.type, {
      textDocument: {
        uri: APP_COMPONENT_URI,
      },
    })) as lsp.DocumentSymbol[];
    expect(Array.isArray(response)).toBe(true);
    // Only component classes with templates are shown, without TypeScript children (methods, properties)
    const appComponentSymbol = response.find((s) => s.name === 'AppComponent');
    expect(appComponentSymbol).toBeDefined();
    expect(appComponentSymbol!.kind).toBe(lsp.SymbolKind.Class);
    // Class should only have template children, not TypeScript symbols
    expect(appComponentSymbol!.children).toBeDefined();
    // Should have (template) container with template symbols
    const templateSymbol = appComponentSymbol!.children!.find((c) => c.name === '(template)');
    expect(templateSymbol).toBeDefined();
    expect(templateSymbol!.kind).toBe(lsp.SymbolKind.Namespace);
    // Should NOT have TypeScript method/property children
    const nameSymbol = appComponentSymbol!.children!.find((c) => c.name === 'name');
    expect(nameSymbol).toBeUndefined();
    const constructorSymbol = appComponentSymbol!.children!.find((c) => c.name === 'constructor');
    expect(constructorSymbol).toBeUndefined();
    const greetSymbol = appComponentSymbol!.children!.find((c) => c.name === 'greet');
    expect(greetSymbol).toBeUndefined();
  });

  it('handles multiple components in a single file', async () => {
    openTextDocument(
      client,
      APP_COMPONENT,
      `
import {Component} from '@angular/core';

@Component({
  selector: 'first-comp',
  template: '<h1>First</h1>',
})
export class FirstComponent {
  value = 1;
}

@Component({
  selector: 'second-comp',
  template: '<h2>Second</h2>',
})
export class SecondComponent {
  value = 2;
}`,
    );
    const response = (await client.sendRequest(lsp.DocumentSymbolRequest.type, {
      textDocument: {
        uri: APP_COMPONENT_URI,
      },
    })) as lsp.DocumentSymbol[];
    expect(Array.isArray(response)).toBe(true);
    // Both components should be present
    const firstSymbol = response.find((s) => s.name === 'FirstComponent');
    expect(firstSymbol).toBeDefined();
    expect(firstSymbol!.kind).toBe(lsp.SymbolKind.Class);
    const firstTemplateSymbol = firstSymbol!.children!.find((c) => c.name === '(template)');
    expect(firstTemplateSymbol).toBeDefined();

    const secondSymbol = response.find((s) => s.name === 'SecondComponent');
    expect(secondSymbol).toBeDefined();
    expect(secondSymbol!.kind).toBe(lsp.SymbolKind.Class);
    const secondTemplateSymbol = secondSymbol!.children!.find((c) => c.name === '(template)');
    expect(secondTemplateSymbol).toBeDefined();

    // Neither should have TypeScript property children by default
    const firstValue = firstSymbol!.children!.find((c) => c.name === 'value');
    expect(firstValue).toBeUndefined();
    const secondValue = secondSymbol!.children!.find((c) => c.name === 'value');
    expect(secondValue).toBeUndefined();
  });

  it('returns empty symbols for TypeScript files without Angular templates', async () => {
    openTextDocument(
      client,
      APP_COMPONENT,
      `
// A regular TypeScript file with no Angular components
export interface User {
  name: string;
  age: number;
}

export function greet(user: User): string {
  return 'Hello, ' + user.name;
}

export class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }
}`,
    );
    const response = (await client.sendRequest(lsp.DocumentSymbolRequest.type, {
      textDocument: {
        uri: APP_COMPONENT_URI,
      },
    })) as lsp.DocumentSymbol[];
    expect(Array.isArray(response)).toBe(true);
    // With default filtering, no symbols should be returned for non-Angular files
    // (TypeScript LS handles these files instead)
    expect(response.length).toBe(0);
  });

  it('provides document symbols for Angular templates with control flow', async () => {
    openTextDocument(
      client,
      APP_COMPONENT,
      `
import {Component} from '@angular/core';

@Component({
  selector: 'my-app',
  template: \`
    @if (showContent) {
      <div class="container">
        <router-outlet></router-outlet>
      </div>
    } @else {
      <p>No content</p>
    }

    @for (item of items; track item) {
      <span #itemRef>{{ item }}</span>
    } @empty {
      <p>No items</p>
    }

    @let message = 'Hello';
    <ng-content select="header"></ng-content>
  \`,
})
export class AppComponent {
  showContent = true;
  items = [1, 2, 3];
}`,
    );
    const response = (await client.sendRequest(lsp.DocumentSymbolRequest.type, {
      textDocument: {
        uri: APP_COMPONENT_URI,
      },
    })) as lsp.DocumentSymbol[];

    expect(Array.isArray(response)).toBe(true);

    // Should contain the class symbol
    const appComponentSymbol = response.find((s) => s.name === 'AppComponent');
    expect(appComponentSymbol).toBeDefined();
    expect(appComponentSymbol!.kind).toBe(lsp.SymbolKind.Class);

    // The class should have a (template) child containing Angular template symbols
    const templateSymbol = appComponentSymbol!.children?.find((c) => c.name === '(template)');
    expect(templateSymbol).toBeDefined();
    expect(templateSymbol!.kind).toBe(lsp.SymbolKind.Namespace);
    expect(templateSymbol!.children).toBeDefined();

    // Check for @if block (now shows actual expression)
    const ifSymbol = templateSymbol!.children!.find((c) => c.name === '@if (showContent)');
    expect(ifSymbol).toBeDefined();
    expect(ifSymbol!.kind).toBe(lsp.SymbolKind.Struct); // Control flow → Struct

    // Check for @else block
    const elseSymbol = templateSymbol!.children!.find((c) => c.name === '@else');
    expect(elseSymbol).toBeDefined();

    // Check for @for block (now shows actual expression)
    const forSymbol = templateSymbol!.children!.find((c) => c.name === '@for (item of items)');
    expect(forSymbol).toBeDefined();
    expect(forSymbol!.kind).toBe(lsp.SymbolKind.Array); // @for loop → Array

    // Check for @let declaration
    const letSymbol = templateSymbol!.children!.find((c) => c.name === '@let message');
    expect(letSymbol).toBeDefined();
    expect(letSymbol!.kind).toBe(lsp.SymbolKind.Variable);

    // Check for ng-content
    const ngContentSymbol = templateSymbol!.children!.find((c) => c.name.includes('ng-content'));
    expect(ngContentSymbol).toBeDefined();
  });

  it('provides document symbols for external HTML template files', async () => {
    openTextDocument(
      client,
      FOO_TEMPLATE,
      `
@if (condition) {
  <div>
    <router-outlet name="primary"></router-outlet>
  </div>
}

@for (item of items; track item) {
  <span #ref>{{ item }}</span>
} @empty {
  <p>Empty</p>
}

@defer {
  <heavy-component></heavy-component>
} @placeholder {
  <p>Loading...</p>
}
`,
    );
    const response = (await client.sendRequest(lsp.DocumentSymbolRequest.type, {
      textDocument: {
        uri: FOO_TEMPLATE_URI,
      },
    })) as lsp.DocumentSymbol[];

    expect(Array.isArray(response)).toBe(true);

    // External templates should have template symbols at the root level
    // Check for @if block (now shows actual expression)
    const ifSymbol = response.find((s) => s.name === '@if (condition)');
    expect(ifSymbol).toBeDefined();
    expect(ifSymbol!.kind).toBe(lsp.SymbolKind.Struct); // Control flow → Struct

    // Check for @for block (now shows actual expression)
    const forSymbol = response.find((s) => s.name === '@for (item of items)');
    expect(forSymbol).toBeDefined();

    // Check for @defer block
    const deferSymbol = response.find((s) => s.name === '@defer');
    expect(deferSymbol).toBeDefined();
    expect(deferSymbol!.children).toBeDefined();

    // @defer should have @placeholder as a child
    const placeholderSymbol = deferSymbol!.children!.find((c) => c.name === '@placeholder');
    expect(placeholderSymbol).toBeDefined();
  });

  it('provides document symbols for @else if branches', async () => {
    openTextDocument(
      client,
      APP_COMPONENT,
      `
import {Component} from '@angular/core';

@Component({
  selector: 'my-app',
  template: \`
    @if (status === 'active') {
      <p>Active</p>
    } @else if (status === 'pending') {
      <p>Pending</p>
    } @else if (status === 'error') {
      <p>Error</p>
    } @else {
      <p>Unknown</p>
    }
  \`,
})
export class AppComponent {
  status = 'active';
}`,
    );
    const response = (await client.sendRequest(lsp.DocumentSymbolRequest.type, {
      textDocument: {
        uri: APP_COMPONENT_URI,
      },
    })) as lsp.DocumentSymbol[];

    const appComponentSymbol = response.find((s) => s.name === 'AppComponent');
    const templateSymbol = appComponentSymbol!.children?.find((c) => c.name === '(template)');
    expect(templateSymbol).toBeDefined();

    // Check for @if block
    const ifSymbol = templateSymbol!.children!.find((c) =>
      c.name.startsWith("@if (status === 'active')"),
    );
    expect(ifSymbol).toBeDefined();

    // Check for @else if blocks (should show actual condition)
    const elseIfPending = templateSymbol!.children!.find((c) =>
      c.name.includes("@else if (status === 'pending')"),
    );
    expect(elseIfPending).toBeDefined();

    const elseIfError = templateSymbol!.children!.find((c) =>
      c.name.includes("@else if (status === 'error')"),
    );
    expect(elseIfError).toBeDefined();

    // Check for @else block
    const elseSymbol = templateSymbol!.children!.find((c) => c.name === '@else');
    expect(elseSymbol).toBeDefined();
  });

  it('provides document symbols for @switch with case fall-through', async () => {
    openTextDocument(
      client,
      APP_COMPONENT,
      `
import {Component} from '@angular/core';

@Component({
  selector: 'my-app',
  template: \`
    @switch (color) {
      @case ('red') {
        <p>Red color</p>
      }
      @case ('green') {
        <p>Green color</p>
      }
      @default {
        <p>Unknown color</p>
      }
    }
  \`,
})
export class AppComponent {
  color = 'red';
}`,
    );
    const response = (await client.sendRequest(lsp.DocumentSymbolRequest.type, {
      textDocument: {
        uri: APP_COMPONENT_URI,
      },
    })) as lsp.DocumentSymbol[];

    const appComponentSymbol = response.find((s) => s.name === 'AppComponent');
    const templateSymbol = appComponentSymbol!.children?.find((c) => c.name === '(template)');
    expect(templateSymbol).toBeDefined();

    // Check for @switch block (should show actual expression)
    const switchSymbol = templateSymbol!.children!.find((c) => c.name === '@switch (color)');
    expect(switchSymbol).toBeDefined();
    expect(switchSymbol!.children).toBeDefined();

    // Check for @case blocks (should show actual case values)
    const caseRed = switchSymbol!.children!.find((c) => c.name.includes("@case ('red')"));
    expect(caseRed).toBeDefined();

    const caseGreen = switchSymbol!.children!.find((c) => c.name.includes("@case ('green')"));
    expect(caseGreen).toBeDefined();

    // Check for @default
    const defaultCase = switchSymbol!.children!.find((c) => c.name === '@default');
    expect(defaultCase).toBeDefined();
  });

  it('provides document symbols for @for with context variables', async () => {
    openTextDocument(
      client,
      APP_COMPONENT,
      `
import {Component} from '@angular/core';

@Component({
  selector: 'my-app',
  template: \`
    @for (item of items; track item.id; let i = $index; let first = $first; let last = $last) {
      <div>{{ i }}: {{ item.name }}</div>
    } @empty {
      <div>No items</div>
    }
  \`,
})
export class AppComponent {
  items = [{id: 1, name: 'A'}, {id: 2, name: 'B'}];
}`,
    );
    const response = (await client.sendRequest(lsp.DocumentSymbolRequest.type, {
      textDocument: {
        uri: APP_COMPONENT_URI,
      },
    })) as lsp.DocumentSymbol[];

    const appComponentSymbol = response.find((s) => s.name === 'AppComponent');
    const templateSymbol = appComponentSymbol!.children?.find((c) => c.name === '(template)');
    expect(templateSymbol).toBeDefined();

    // Check for @for block (shows loop variable and collection)
    const forSymbol = templateSymbol!.children!.find((c) => c.name.includes('@for (item of'));
    expect(forSymbol).toBeDefined();
    expect(forSymbol!.children).toBeDefined();

    // Check for loop item variable
    const itemVar = forSymbol!.children!.find((c) => c.name === 'let item');
    expect(itemVar).toBeDefined();

    // Check for context variables (aliased)
    const indexVar = forSymbol!.children!.find((c) => c.name === 'let i');
    expect(indexVar).toBeDefined();

    const firstVar = forSymbol!.children!.find((c) => c.name === 'let first');
    expect(firstVar).toBeDefined();

    const lastVar = forSymbol!.children!.find((c) => c.name === 'let last');
    expect(lastVar).toBeDefined();

    // Check for @empty block
    const emptySymbol = forSymbol!.children!.find((c) => c.name === '@empty');
    expect(emptySymbol).toBeDefined();
  });

  it('provides document symbols for @if with expression alias', async () => {
    openTextDocument(
      client,
      APP_COMPONENT,
      `
import {Component} from '@angular/core';

@Component({
  selector: 'my-app',
  template: \`
    @if (user$ | async; as user) {
      <p>Welcome, {{ user.name }}</p>
    }
  \`,
})
export class AppComponent {
  user$ = of({name: 'Test'});
}`,
    );
    const response = (await client.sendRequest(lsp.DocumentSymbolRequest.type, {
      textDocument: {
        uri: APP_COMPONENT_URI,
      },
    })) as lsp.DocumentSymbol[];

    const appComponentSymbol = response.find((s) => s.name === 'AppComponent');
    const templateSymbol = appComponentSymbol!.children?.find((c) => c.name === '(template)');
    expect(templateSymbol).toBeDefined();

    // Check for @if block with alias (shows expression and alias)
    const ifSymbol = templateSymbol!.children!.find(
      (c) => c.name.includes('@if') && c.name.includes('as user'),
    );
    expect(ifSymbol).toBeDefined();
    expect(ifSymbol!.children).toBeDefined();

    // Check for alias variable
    const aliasVar = ifSymbol!.children!.find((c) => c.name === 'let user');
    expect(aliasVar).toBeDefined();
  });

  it('provides document symbols for @defer with triggers', async () => {
    openTextDocument(
      client,
      APP_COMPONENT,
      `
import {Component} from '@angular/core';

@Component({
  selector: 'my-app',
  template: \`
    @defer (on viewport) {
      <p>Loaded</p>
    } @placeholder {
      <p>Placeholder</p>
    } @loading {
      <p>Loading...</p>
    } @error {
      <p>Error!</p>
    }
  \`,
})
export class AppComponent {
  value = 'test';
}`,
    );
    const response = (await client.sendRequest(lsp.DocumentSymbolRequest.type, {
      textDocument: {
        uri: APP_COMPONENT_URI,
      },
    })) as lsp.DocumentSymbol[];

    const appComponentSymbol = response.find((s) => s.name === 'AppComponent');
    expect(appComponentSymbol).toBeDefined();

    const templateSymbol = appComponentSymbol!.children?.find((c) => c.name === '(template)');
    expect(templateSymbol).toBeDefined();

    // Check for @defer block with trigger info
    const deferSymbol = templateSymbol!.children!.find((c) => c.name.includes('@defer'));
    expect(deferSymbol).toBeDefined();
    expect(deferSymbol!.name).toContain('on viewport');
    expect(deferSymbol!.children).toBeDefined();

    // Check for @placeholder
    const placeholderSymbol = deferSymbol!.children!.find((c) => c.name.includes('@placeholder'));
    expect(placeholderSymbol).toBeDefined();

    // Check for @loading
    const loadingSymbol = deferSymbol!.children!.find((c) => c.name.includes('@loading'));
    expect(loadingSymbol).toBeDefined();

    // Check for @error
    const errorSymbol = deferSymbol!.children!.find((c) => c.name === '@error');
    expect(errorSymbol).toBeDefined();
  });

  it('provides document symbols for *ngFor structural directive', async () => {
    openTextDocument(
      client,
      APP_COMPONENT,
      `
import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'my-app',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <ul>
      <li *ngFor="let item of items; let i = index; let isFirst = first">
        {{ i }}: {{ item }}
      </li>
    </ul>
  \`,
})
export class AppComponent {
  items = ['a', 'b', 'c'];
}`,
    );
    const response = (await client.sendRequest(lsp.DocumentSymbolRequest.type, {
      textDocument: {
        uri: APP_COMPONENT_URI,
      },
    })) as lsp.DocumentSymbol[];

    const appComponentSymbol = response.find((s) => s.name === 'AppComponent');
    const templateSymbol = appComponentSymbol!.children?.find((c) => c.name === '(template)');
    expect(templateSymbol).toBeDefined();

    // Find the <ul> element
    const ulSymbol = templateSymbol!.children!.find((c) => c.name === '<ul>');
    expect(ulSymbol).toBeDefined();

    // Check for *ngFor directive (should show like control flow)
    const ngForSymbol = ulSymbol!.children!.find((c) => c.name.includes('*ngFor'));
    expect(ngForSymbol).toBeDefined();
    expect(ngForSymbol!.name).toContain('let item of');

    // Check for let- variables as children
    expect(ngForSymbol!.children).toBeDefined();
    const itemVar = ngForSymbol!.children!.find((c) => c.name === 'let item');
    expect(itemVar).toBeDefined();

    const indexVar = ngForSymbol!.children!.find((c) => c.name === 'let i');
    expect(indexVar).toBeDefined();

    const firstVar = ngForSymbol!.children!.find((c) => c.name === 'let isFirst');
    expect(firstVar).toBeDefined();
  });

  it('provides document symbols for *ngIf structural directive', async () => {
    openTextDocument(
      client,
      APP_COMPONENT,
      `
import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'my-app',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div *ngIf="isVisible; else notVisible">
      Visible content
    </div>
    <ng-template #notVisible>
      <p>Not visible</p>
    </ng-template>
  \`,
})
export class AppComponent {
  isVisible = true;
}`,
    );
    const response = (await client.sendRequest(lsp.DocumentSymbolRequest.type, {
      textDocument: {
        uri: APP_COMPONENT_URI,
      },
    })) as lsp.DocumentSymbol[];

    const appComponentSymbol = response.find((s) => s.name === 'AppComponent');
    const templateSymbol = appComponentSymbol!.children?.find((c) => c.name === '(template)');
    expect(templateSymbol).toBeDefined();

    // Check for *ngIf directive (should show the condition)
    const ngIfSymbol = templateSymbol!.children!.find((c) => c.name.includes('*ngIf'));
    expect(ngIfSymbol).toBeDefined();
    expect(ngIfSymbol!.name).toContain('isVisible');

    // Check for ng-template with reference
    const ngTemplateSymbol = templateSymbol!.children!.find((c) => c.name === '<ng-template>');
    expect(ngTemplateSymbol).toBeDefined();

    // Check for the #notVisible reference
    const notVisibleRef = ngTemplateSymbol!.children!.find((c) => c.name === '#notVisible');
    expect(notVisibleRef).toBeDefined();
  });

  it('provides document symbols for @if with expression alias', async () => {
    openTextDocument(
      client,
      APP_COMPONENT,
      `
import {Component} from '@angular/core';

@Component({
  selector: 'my-app',
  standalone: true,
  template: \`
    @if (user; as currentUser) {
      <div>Hello, {{ currentUser.name }}!</div>
    } @else if (guestName; as name) {
      <div>Welcome, {{ name }}!</div>
    } @else {
      <div>Anonymous</div>
    }
  \`,
})
export class AppComponent {
  user = { name: 'John' };
  guestName = '';
}`,
    );
    const response = (await client.sendRequest(lsp.DocumentSymbolRequest.type, {
      textDocument: {
        uri: APP_COMPONENT_URI,
      },
    })) as lsp.DocumentSymbol[];

    const appComponentSymbol = response.find((s) => s.name === 'AppComponent');
    const templateSymbol = appComponentSymbol!.children?.find((c) => c.name === '(template)');
    expect(templateSymbol).toBeDefined();

    // Check for @if block with alias
    const ifSymbol = templateSymbol!.children!.find(
      (c) => c.name.includes('@if') && c.name.includes('currentUser'),
    );
    expect(ifSymbol).toBeDefined();
    expect(ifSymbol!.name).toContain('as currentUser');

    // The alias should appear exactly once as a child
    const currentUserAliases = ifSymbol!.children!.filter((c) => c.name === 'let currentUser');
    expect(currentUserAliases.length).toBe(1);

    // Check for @else if block with alias
    const elseIfSymbol = templateSymbol!.children!.find(
      (c) => c.name.includes('@else if') && c.name.includes('name'),
    );
    expect(elseIfSymbol).toBeDefined();
    expect(elseIfSymbol!.name).toContain('as name');

    // The alias should appear exactly once
    const nameAliases = elseIfSymbol!.children!.filter((c) => c.name === 'let name');
    expect(nameAliases.length).toBe(1);

    // Check for @else block (no alias)
    const elseSymbol = templateSymbol!.children!.find((c) => c.name === '@else');
    expect(elseSymbol).toBeDefined();
  });

  it('provides document symbols for nested @if with alias inside @for', async () => {
    // Test case similar to user's template structure
    openTextDocument(
      client,
      APP_COMPONENT,
      `
import {Component} from '@angular/core';

@Component({
  selector: 'my-app',
  standalone: true,
  template: \`
    @for (category of categories; track category.name) {
      <div class="category">
        @for (test of category.tests; track test.name; let i = $index) {
          @if (!test.passed; as tr) {
            <div class="failed">{{ tr }}</div>
          }
        }
      </div>
    }
  \`,
})
export class AppComponent {
  categories = [
    { name: 'Category 1', tests: [{ name: 'Test 1', passed: true }, { name: 'Test 2', passed: false }] }
  ];
}`,
    );
    const response = (await client.sendRequest(lsp.DocumentSymbolRequest.type, {
      textDocument: {
        uri: APP_COMPONENT_URI,
      },
    })) as lsp.DocumentSymbol[];

    const appComponentSymbol = response.find((s) => s.name === 'AppComponent');
    const templateSymbol = appComponentSymbol!.children?.find((c) => c.name === '(template)');
    expect(templateSymbol).toBeDefined();

    // Find the outer @for - name is "@for (category of categories)"
    const outerForSymbol = templateSymbol!.children!.find(
      (c) => c.name.startsWith('@for') && c.name.includes('category'),
    );
    expect(outerForSymbol).toBeDefined();

    // Find the <div> inside outer @for
    const divSymbol = outerForSymbol!.children!.find((c) => c.name === '<div>');
    expect(divSymbol).toBeDefined();

    // Find nested @for inside <div> - name is "@for (test of category.tests)"
    const nestedForSymbol = divSymbol!.children!.find(
      (c) => c.name.startsWith('@for') && c.name.includes('test of'),
    );
    expect(nestedForSymbol).toBeDefined();

    // Check for 'let test' and 'let i' (explicit alias for $index)
    const testVar = nestedForSymbol!.children!.filter((c) => c.name === 'let test');
    expect(testVar.length).toBe(1);
    const indexVar = nestedForSymbol!.children!.filter((c) => c.name === 'let i');
    expect(indexVar.length).toBe(1);

    // Find @if with alias inside nested @for - name is "@if (!test.passed; as tr)"
    const ifSymbol = nestedForSymbol!.children!.find(
      (c) => c.name.startsWith('@if') && c.name.includes('as tr'),
    );
    expect(ifSymbol).toBeDefined();

    // The 'tr' alias should appear exactly once
    const trAliases = ifSymbol!.children!.filter((c) => c.name === 'let tr');
    expect(trAliases.length).toBe(1);
  });

  it('provides document symbols for component without "Component" suffix', async () => {
    // Test that components like "NxWelcome" (without "Component" suffix) still get template symbols
    openTextDocument(
      client,
      APP_COMPONENT,
      `
import {Component} from '@angular/core';

@Component({
  selector: 'app-welcome',
  template: \`
    @if (title) {
      <span>{{ title }}</span>
    }
  \`,
})
export class Welcome {
  title = 'Hello';
}`,
    );
    const response = (await client.sendRequest(lsp.DocumentSymbolRequest.type, {
      textDocument: {
        uri: APP_COMPONENT_URI,
      },
    })) as lsp.DocumentSymbol[];

    // Should contain the class symbol
    const welcomeSymbol = response.find((s) => s.name === 'Welcome');
    expect(welcomeSymbol).toBeDefined();
    expect(welcomeSymbol!.kind).toBe(lsp.SymbolKind.Class);

    // The class should have a (template) child containing Angular template symbols
    const templateSymbol = welcomeSymbol!.children?.find((c) => c.name === '(template)');
    expect(templateSymbol).toBeDefined();
    expect(templateSymbol!.kind).toBe(lsp.SymbolKind.Namespace);

    // Check for @if block
    const ifSymbol = templateSymbol!.children!.find((c) => c.name === '@if (title)');
    expect(ifSymbol).toBeDefined();
  });

  it('provides document symbols for multiple components in one file', async () => {
    // Test that files with multiple components (common in tests/storybooks) work correctly
    openTextDocument(
      client,
      APP_COMPONENT,
      `
import {Component} from '@angular/core';

@Component({
  selector: 'app-button',
  template: \`<button>{{ label }}</button>\`,
})
export class ButtonComponent {
  label = 'Click me';
}

@Component({
  selector: 'app-input',
  template: \`<input [placeholder]="hint" />\`,
})
export class InputComponent {
  hint = 'Type here';
}`,
    );
    const response = (await client.sendRequest(lsp.DocumentSymbolRequest.type, {
      textDocument: {
        uri: APP_COMPONENT_URI,
      },
    })) as lsp.DocumentSymbol[];

    // Should contain both class symbols
    const buttonSymbol = response.find((s) => s.name === 'ButtonComponent');
    expect(buttonSymbol).toBeDefined();
    expect(buttonSymbol!.kind).toBe(lsp.SymbolKind.Class);

    const inputSymbol = response.find((s) => s.name === 'InputComponent');
    expect(inputSymbol).toBeDefined();
    expect(inputSymbol!.kind).toBe(lsp.SymbolKind.Class);

    // ButtonComponent should have its own (template) with <button>
    const buttonTemplate = buttonSymbol!.children?.find((c) => c.name === '(template)');
    expect(buttonTemplate).toBeDefined();
    const buttonElement = buttonTemplate!.children!.find((c) => c.name === '<button>');
    expect(buttonElement).toBeDefined();

    // InputComponent should have its own (template) with <input>
    const inputTemplate = inputSymbol!.children?.find((c) => c.name === '(template)');
    expect(inputTemplate).toBeDefined();
    const inputElement = inputTemplate!.children!.find((c) => c.name === '<input>');
    expect(inputElement).toBeDefined();
  });

  describe('signature help', () => {
    it('should show signature help for an empty call', async () => {
      client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
          languageId: 'html',
          version: 1,
          text: `{{ title.toString() }}`,
        },
      });
      const response = (await client.sendRequest(lsp.SignatureHelpRequest.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
        },
        position: {line: 0, character: 18},
      }))!;
      expect(response).not.toBeNull();
      expect(response.signatures.length).toEqual(1);
      expect(response.signatures[0].label).toContain('(): string');
    });

    it('should show signature help with multiple arguments', async () => {
      client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
          languageId: 'html',
          version: 1,
          text: `{{ title.substr(0, ) }}`,
        },
      });
      const response = (await client.sendRequest(lsp.SignatureHelpRequest.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
        },
        position: {line: 0, character: 19},
      }))!;
      expect(response).not.toBeNull();
      expect(response.signatures.length).toEqual(1);
      expect(response.signatures[0].label).toContain('(from: number, length?: number): string');
      expect(response.signatures[0].parameters).not.toBeUndefined();
      expect(response.activeParameter).toBe(1);

      const label = response.signatures[0].label;
      const paramLabels = response.signatures[0].parameters!.map((param) => {
        const [start, end] = param.label as [number, number];
        return label.substring(start, end);
      });
      expect(paramLabels).toEqual(['from: number', 'length?: number']);
    });
  });

  describe('project reload', () => {
    let newProjectRoot: string;
    let dummy: string;
    let APP_COMPONENT_PATH_TMP: string;

    beforeAll(async () => {
      const tmpDir = makeTempDir();
      newProjectRoot = join(tmpDir, basename(PROJECT_PATH));
      dummy = `${newProjectRoot}/node_modules/__foo__`;
      APP_COMPONENT_PATH_TMP = join(newProjectRoot, 'app/app.component.ts');
      await cp(PROJECT_PATH, newProjectRoot, {
        recursive: true,
        mode: fs.constants.COPYFILE_FICLONE,
      });
    });

    afterEach(() => {
      fs.unlinkSync(dummy);
    });

    it('should retain typecheck files', async () => {
      openTextDocument(client, APP_COMPONENT_PATH_TMP);
      // Create a file in node_modules, this will trigger a project reload via
      // the directory watcher
      fs.writeFileSync(dummy, '');
      // Project reload happens after 250ms delay
      // https://github.com/microsoft/TypeScript/blob/3c32f6e154ead6749b76ec9c19cbfdd2acad97d6/src/server/editorServices.ts#L957
      await setTimeout(500);
      // The following operation would result in compiler crash if typecheck
      // files are not retained after project reload
      const diagnostics = await getDiagnosticsForFile(client, APP_COMPONENT_PATH_TMP);
      expect(diagnostics.length).toBe(0);
    });
  });

  describe('completions', () => {
    it('for events', async () => {
      openTextDocument(client, FOO_TEMPLATE, `<my-app ()></my-app>`);
      const response = (await client.sendRequest(lsp.CompletionRequest.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
        },
        position: {line: 0, character: 9},
      })) as lsp.CompletionItem[];
      const outputCompletion = response.find((i) => i.label === '(appOutput)')!;
      expect(outputCompletion.kind).toEqual(lsp.CompletionItemKind.Property);
      // // replace range includes the closing )
      expect((outputCompletion.textEdit as lsp.TextEdit).range).toEqual({
        start: {line: 0, character: 8},
        end: {line: 0, character: 10},
      });
    });
  });

  describe('renaming', () => {
    describe('from template files', () => {
      beforeEach(async () => {
        openTextDocument(client, FOO_TEMPLATE);
      });

      it('should handle prepare rename request for property read', async () => {
        const response = (await client.sendRequest(lsp.PrepareRenameRequest.type, {
          textDocument: {
            uri: FOO_TEMPLATE_URI,
          },
          position: {line: 0, character: 3},
        })) as {range: lsp.Range; placeholder: string};
        expect(response.range).toEqual({
          start: {line: 0, character: 2},
          end: {line: 0, character: 7},
        });
        expect(response.placeholder).toEqual('title');
      });

      const expectedRenameInComponent = {
        range: {
          start: {line: 7, character: 2},
          end: {line: 7, character: 7},
        },
        newText: 'subtitle',
      };
      const expectedRenameInTemplate = {
        range: {
          start: {line: 0, character: 2},
          end: {line: 0, character: 7},
        },
        newText: 'subtitle',
      };

      it('should handle rename request for property read', async () => {
        const response = await client.sendRequest(lsp.RenameRequest.type, {
          textDocument: {
            uri: FOO_TEMPLATE_URI,
          },
          position: {line: 0, character: 3},
          newName: 'subtitle',
        });
        expect(response).not.toBeNull();
        expect(response?.changes?.[FOO_TEMPLATE_URI].length).toBe(1);
        expect(response?.changes?.[FOO_TEMPLATE_URI]).toContain(expectedRenameInTemplate);
        expect(response?.changes?.[FOO_COMPONENT_URI].length).toBe(1);
        expect(response?.changes?.[FOO_COMPONENT_URI]).toContain(expectedRenameInComponent);
      });
    });

    describe('from typescript files', () => {
      beforeEach(async () => {
        openTextDocument(client, APP_COMPONENT);
      });

      it('should handle prepare rename request for inline template property read', async () => {
        const response = (await client.sendRequest(lsp.PrepareRenameRequest.type, {
          textDocument: {
            uri: APP_COMPONENT_URI,
          },
          position: {line: 4, character: 26},
        })) as {range: lsp.Range; placeholder: string};
        expect(response.range).toEqual({
          start: {line: 4, character: 26},
          end: {line: 4, character: 30},
        });
        expect(response.placeholder).toEqual('name');
      });

      describe('property rename', () => {
        const expectedRenameInComponent = {
          range: {
            start: {line: 8, character: 2},
            end: {line: 8, character: 6},
          },
          newText: 'surname',
        };
        const expectedRenameInTemplate = {
          range: {
            start: {line: 4, character: 26},
            end: {line: 4, character: 30},
          },
          newText: 'surname',
        };

        it('should handle rename request for property read in a template', async () => {
          const response = await client.sendRequest(lsp.RenameRequest.type, {
            textDocument: {
              uri: APP_COMPONENT_URI,
            },
            position: {line: 4, character: 26},
            newName: 'surname',
          });
          expect(response).not.toBeNull();
          expect(response?.changes?.[APP_COMPONENT_URI].length).toBe(2);
          expect(response?.changes?.[APP_COMPONENT_URI]).toContain(expectedRenameInComponent);
          expect(response?.changes?.[APP_COMPONENT_URI]).toContain(expectedRenameInTemplate);
        });

        it('should handle rename request for property in the component', async () => {
          const response = await client.sendRequest(lsp.RenameRequest.type, {
            textDocument: {
              uri: APP_COMPONENT_URI,
            },
            position: {line: 8, character: 4},
            newName: 'surname',
          });
          expect(response).not.toBeNull();
          expect(response?.changes?.[APP_COMPONENT_URI].length).toBe(2);
          expect(response?.changes?.[APP_COMPONENT_URI]).toContain(expectedRenameInComponent);
          expect(response?.changes?.[APP_COMPONENT_URI]).toContain(expectedRenameInTemplate);
        });
      });
    });
  });

  describe('compiler options', () => {
    describe('strictTemplates: false', () => {
      let newProjectRoot: string;
      let TSCONFIG_PATH_TMP: string;
      let APP_COMPONENT_PATH_TMP: string;
      let FOO_COMPONENT_URI_TMP: string;

      beforeAll(async () => {
        const tmpDir = makeTempDir();
        newProjectRoot = join(tmpDir, basename(PROJECT_PATH));
        TSCONFIG_PATH_TMP = join(newProjectRoot, 'tsconfig.json');
        APP_COMPONENT_PATH_TMP = join(newProjectRoot, 'app/app.component.ts');
        FOO_COMPONENT_URI_TMP = pathToFileURL(join(newProjectRoot, 'app/foo.component.ts')).href;

        await cp(PROJECT_PATH, newProjectRoot, {
          recursive: true,
          mode: fs.constants.COPYFILE_FICLONE,
          filter: (src) => src !== TSCONFIG,
        });

        // set strictTemplates=false;
        const originalConfig = await readFile(TSCONFIG, 'utf-8');
        const config = JSON.parse(originalConfig);
        config.angularCompilerOptions.strictTemplates = false;
        await writeFile(TSCONFIG_PATH_TMP, JSON.stringify(config, null, 2));
      });

      beforeEach(() => {
        openTextDocument(client, APP_COMPONENT_PATH_TMP);
      });

      it('should suggest strict mode', async () => {
        const configFilePath = await onSuggestStrictMode(client);
        expect(configFilePath).toBe(TSCONFIG_PATH_TMP);
      });

      it('should disable renaming when strict mode is disabled', async () => {
        await onSuggestStrictMode(client);

        const prepareRenameResponse = (await client.sendRequest(lsp.PrepareRenameRequest.type, {
          textDocument: {
            uri: FOO_COMPONENT_URI_TMP,
          },
          position: {line: 4, character: 25},
        })) as {range: lsp.Range; placeholder: string};
        expect(prepareRenameResponse).toBeNull();

        const renameResponse = await client.sendRequest(lsp.RenameRequest.type, {
          textDocument: {
            uri: FOO_COMPONENT_URI_TMP,
          },
          position: {line: 4, character: 25},
          newName: 'surname',
        });
        expect(renameResponse).toBeNull();
      });
    });
  });

  it('should handle getTcb request', async () => {
    openTextDocument(client, FOO_TEMPLATE);
    const response = await client.sendRequest(GetTcbRequest, {
      textDocument: {
        uri: FOO_TEMPLATE_URI,
      },
      position: {line: 0, character: 3},
    });
    expect(response).toBeDefined();
  });

  it('should handle goToComponent request', async () => {
    openTextDocument(client, FOO_TEMPLATE);
    const response = await client.sendRequest(GetComponentsWithTemplateFile, {
      textDocument: {
        uri: FOO_TEMPLATE_URI,
      },
    });
    expect(response).toBeDefined();
  });

  it('should handle GetTemplateLocationForComponent request', async () => {
    openTextDocument(client, FOO_TEMPLATE);
    const response = await client.sendRequest(GetTemplateLocationForComponent, {
      textDocument: {
        uri: FOO_COMPONENT_URI,
      },
      position: {line: 6, character: 0},
    });
    expect(response).toBeDefined();
    expect(response.uri).toContain('foo.component.html');
  });

  it('should handle GetTemplateLocationForComponent request when not in component', async () => {
    openTextDocument(client, FOO_TEMPLATE);
    const response = await client.sendRequest(GetTemplateLocationForComponent, {
      textDocument: {
        uri: FOO_COMPONENT_URI,
      },
      position: {line: 1, character: 0},
    });
    expect(response).toBeNull();
  });

  it('should provide a "go to component" codelens', async () => {
    openTextDocument(client, FOO_TEMPLATE);
    const codeLensResponse = await client.sendRequest(lsp.CodeLensRequest.type, {
      textDocument: {
        uri: FOO_TEMPLATE_URI,
      },
    });
    expect(codeLensResponse).toBeDefined();
    const [codeLens] = codeLensResponse!;
    expect(codeLens.data.uri).toEqual(FOO_TEMPLATE_URI);

    const codeLensResolveResponse = await client.sendRequest(
      lsp.CodeLensResolveRequest.type,
      codeLensResponse![0],
    );
    expect(codeLensResolveResponse).toBeDefined();
    expect(codeLensResolveResponse?.command?.title).toEqual('Go to component');
  });

  it('detects an Angular project', async () => {
    openTextDocument(client, FOO_TEMPLATE);
    const templateResponse = await client.sendRequest(IsInAngularProject, {
      textDocument: {
        uri: FOO_TEMPLATE_URI,
      },
    });
    expect(templateResponse).toBe(true);
    const componentResponse = await client.sendRequest(IsInAngularProject, {
      textDocument: {
        uri: FOO_COMPONENT_URI,
      },
    });
    expect(componentResponse).toBe(true);
  });

  describe('auto-import component', () => {
    it('should generate import in the different file', async () => {
      openTextDocument(client, FOO_TEMPLATE, `<bar-`);
      const response = (await client.sendRequest(lsp.CompletionRequest.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
        },
        position: {line: 0, character: 5},
      })) as lsp.CompletionItem[];
      const libPostResponse = response.find((res) => res.label === 'bar-component')!;
      const detail = await client.sendRequest(lsp.CompletionResolveRequest.type, libPostResponse);
      expect(detail.command?.command).toEqual('angular.applyCompletionCodeAction');
      expect(detail.command?.arguments?.[0]).toEqual([
        {
          'changes': {
            [APP_COMPONENT_MODULE_URI]: [
              {
                'newText': '\nimport { BarComponent } from "./bar.component";',
                'range': {
                  'start': {'line': 5, 'character': 45},
                  'end': {'line': 5, 'character': 45},
                },
              },
              {
                'newText': 'imports: [CommonModule, PostModule, BarComponent]',
                'range': {
                  'start': {'line': 8, 'character': 2},
                  'end': {'line': 8, 'character': 37},
                },
              },
            ],
          },
        },
      ]);
    });

    it('should generate import in the current file', async () => {
      openTextDocument(client, BAR_COMPONENT);
      const response = (await client.sendRequest(lsp.CompletionRequest.type, {
        textDocument: {
          uri: BAR_COMPONENT_URI,
        },
        position: {line: 13, character: 14},
      })) as lsp.CompletionItem[];
      const libPostResponse = response.find((res) => res.label === 'baz-component')!;
      const detail = await client.sendRequest(lsp.CompletionResolveRequest.type, libPostResponse);
      expect(detail.additionalTextEdits).toEqual([
        {
          'newText': ',\n  imports: [BazComponent]',
          'range': {'start': {'line': 14, 'character': 18}, 'end': {'line': 14, 'character': 18}},
        },
      ]);
    });
  });
});

describe('auto-apply optional chaining', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; /* 10 seconds */

  let client: MessageConnection;
  beforeEach(async () => {
    client = createConnection({
      includeAutomaticOptionalChainCompletions: true,
    });
    // If debugging, set to
    // - lsp.Trace.Messages to inspect request/response/notification, or
    // - lsp.Trace.Verbose to inspect payload
    client.trace(lsp.Trace.Off, createTracer());
    client.listen();
    await initializeServer(client);
  });

  afterEach(() => {
    client.dispose();
  });

  it('should work on nullable symbol', async () => {
    openTextDocument(
      client,
      FOO_COMPONENT,
      `
    import {Component} from '@angular/core';
    @Component({
      templateUrl: 'foo.component.html',
    })
    export class FooComponent {
      person?: undefined|{name: string};
    }
    `,
    );
    openTextDocument(client, FOO_TEMPLATE, `{{ person.n }}`);
    const response = (await client.sendRequest(lsp.CompletionRequest.type, {
      textDocument: {
        uri: FOO_TEMPLATE_URI,
      },
      position: {line: 0, character: 11},
    })) as lsp.CompletionItem[];
    const completion = response.find((i) => i.label === 'name')!;
    expect(completion.kind).toEqual(lsp.CompletionItemKind.Property);
    expect((completion.textEdit as lsp.TextEdit).newText).toEqual('?.name');
  });

  it('should work on NonNullable symbol', async () => {
    openTextDocument(client, FOO_TEMPLATE, `{{ title.substr }}`);
    const response = (await client.sendRequest(lsp.CompletionRequest.type, {
      textDocument: {
        uri: FOO_TEMPLATE_URI,
      },
      position: {line: 0, character: 15},
    })) as lsp.CompletionItem[];
    const completion = response.find((i) => i.label === 'substr')!;
    expect(completion.kind).toEqual(lsp.CompletionItemKind.Method);
    expect((completion.textEdit as lsp.TextEdit).newText).toEqual('substr');
  });
});

describe('insert snippet text', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; /* 10 seconds */

  let client: MessageConnection;
  beforeEach(async () => {
    client = createConnection({
      includeCompletionsWithSnippetText: true,
    });
    // If debugging, set to
    // - lsp.Trace.Messages to inspect request/response/notification, or
    // - lsp.Trace.Verbose to inspect payload
    client.trace(lsp.Trace.Off, createTracer());
    client.listen();
    await initializeServer(client);
  });

  afterEach(() => {
    client.dispose();
  });

  it('should be able to complete for an attribute with the value is empty', async () => {
    openTextDocument(client, FOO_TEMPLATE, `<my-app appOut></my-app>`);
    const response = (await client.sendRequest(lsp.CompletionRequest.type, {
      textDocument: {
        uri: FOO_TEMPLATE_URI,
      },
      position: {line: 0, character: 14},
    })) as lsp.CompletionItem[];
    const completion = response.find((i) => i.label === '(appOutput)')!;
    expect(completion.kind).toEqual(lsp.CompletionItemKind.Property);
    expect(completion.insertTextFormat).toEqual(lsp.InsertTextFormat.Snippet);
    expect((completion.textEdit as lsp.TextEdit).newText).toEqual('(appOutput)="$1"');
  });

  it('should not be included in the completion for an attribute with a value', async () => {
    openTextDocument(client, FOO_TEMPLATE, `<my-app [appInput]="1"></my-app>`);
    const response = (await client.sendRequest(lsp.CompletionRequest.type, {
      textDocument: {
        uri: FOO_TEMPLATE_URI,
      },
      position: {line: 0, character: 17},
    })) as lsp.CompletionItem[];
    const completion = response.find((i) => i.label === 'appInput')!;
    expect(completion.kind).toEqual(lsp.CompletionItemKind.Property);
    expect(completion.insertTextFormat).toBeUndefined;
    expect((completion.textEdit as lsp.TextEdit).newText).toEqual('appInput');
  });
});

describe('code fixes', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; /* 10 seconds */

  let client: MessageConnection;
  beforeEach(async () => {
    client = createConnection({
      includeCompletionsWithSnippetText: true,
    });
    // If debugging, set to
    // - lsp.Trace.Messages to inspect request/response/notification, or
    // - lsp.Trace.Verbose to inspect payload
    client.trace(lsp.Trace.Off, createTracer());
    client.listen();
    await initializeServer(client);
  });

  afterEach(() => {
    client.dispose();
  });

  it('should fix error when property does not exist on type', async () => {
    openTextDocument(client, FOO_TEMPLATE, `{{titl}}`);
    const diags = await getDiagnosticsForFile(client, FOO_TEMPLATE);
    const codeActions = (await client.sendRequest(lsp.CodeActionRequest.type, {
      textDocument: {
        uri: FOO_TEMPLATE_URI,
      },
      range: lsp.Range.create(lsp.Position.create(0, 3), lsp.Position.create(0, 3)),
      context: lsp.CodeActionContext.create(diags),
    })) as lsp.CodeAction[];
    const expectedCodeActionInTemplate = {
      'edit': {
        'changes': {
          [FOO_TEMPLATE_URI]: [
            {
              'newText': 'title',
              'range': {'start': {'line': 0, 'character': 2}, 'end': {'line': 0, 'character': 6}},
            },
          ],
        },
      },
    };
    expect(codeActions).toContain(jasmine.objectContaining(expectedCodeActionInTemplate));
  });

  it('should fix error when the range the user selects is larger than the diagnostic', async () => {
    const template = `<span>{{titl}}</span>`;
    openTextDocument(client, FOO_TEMPLATE, template);
    const diags = await getDiagnosticsForFile(client, FOO_TEMPLATE);
    const codeActions = (await client.sendRequest(lsp.CodeActionRequest.type, {
      textDocument: {
        uri: FOO_TEMPLATE_URI,
      },
      range: lsp.Range.create(
        lsp.Position.create(0, 0),
        lsp.Position.create(0, template.length - 1),
      ),
      context: lsp.CodeActionContext.create(diags),
    })) as lsp.CodeAction[];
    const expectedCodeActionInTemplate = {
      'edit': {
        'changes': {
          [FOO_TEMPLATE_URI]: [
            {
              'newText': 'title',
              'range': {'start': {'line': 0, 'character': 8}, 'end': {'line': 0, 'character': 12}},
            },
          ],
        },
      },
    };
    expect(codeActions).toContain(jasmine.objectContaining(expectedCodeActionInTemplate));
  });

  describe('should work', () => {
    beforeEach(async () => {
      openTextDocument(
        client,
        FOO_COMPONENT,
        `
      import {Component, NgModule} from '@angular/core';
      @Component({
        template: '{{tite}}{{bannr}}',
      })
      export class AppComponent {
        title = '';
        banner = '';
      }
    `,
      );
    });

    it('for "fixSpelling"', async () => {
      const fixSpellingCodeAction = await client.sendRequest(lsp.CodeActionResolveRequest.type, {
        title: '',
        data: {
          fixId: 'fixSpelling',
          document: lsp.TextDocumentIdentifier.create(FOO_COMPONENT_URI),
        },
      });
      const expectedFixSpellingInTemplate = {
        'edit': {
          'changes': {
            [FOO_COMPONENT_URI]: [
              {
                'newText': 'title',
                'range': {
                  'start': {'line': 3, 'character': 21},
                  'end': {'line': 3, 'character': 25},
                },
              },
              {
                'newText': 'banner',
                'range': {
                  'start': {'line': 3, 'character': 29},
                  'end': {'line': 3, 'character': 34},
                },
              },
            ],
          },
        },
      };
      expect(fixSpellingCodeAction).toEqual(
        jasmine.objectContaining(expectedFixSpellingInTemplate),
      );
    });

    it('for "fixMissingMember"', async () => {
      const fixMissingMemberCodeAction = await client.sendRequest(
        lsp.CodeActionResolveRequest.type,
        {
          title: '',
          data: {
            fixId: 'fixMissingMember',
            document: lsp.TextDocumentIdentifier.create(FOO_COMPONENT_URI),
          },
        },
      );
      const expectedFixMissingMemberInComponent = {
        'edit': {
          'changes': {
            [FOO_COMPONENT_URI]: [
              {
                'newText': 'tite: any;\n',
                'range': {'start': {'line': 8, 'character': 0}, 'end': {'line': 8, 'character': 0}},
              },
              {
                'newText': 'bannr: any;\n',
                'range': {'start': {'line': 8, 'character': 0}, 'end': {'line': 8, 'character': 0}},
              },
            ],
          },
        },
      };
      expect(fixMissingMemberCodeAction).toEqual(
        jasmine.objectContaining(expectedFixMissingMemberInComponent),
      );
    });
  });
});

function onSuggestStrictMode(client: MessageConnection): Promise<string> {
  return new Promise((resolve) => {
    client.onNotification(SuggestStrictMode, (params: SuggestStrictModeParams) => {
      resolve(params.configFilePath);
    });
  });
}

function getDiagnosticsForFile(
  client: MessageConnection,
  fileName: string,
): Promise<lsp.Diagnostic[]> {
  return new Promise((resolve) => {
    client.onNotification(
      lsp.PublishDiagnosticsNotification.type,
      (params: lsp.PublishDiagnosticsParams) => {
        if (params.uri === pathToFileURL(fileName).href) {
          resolve(params.diagnostics);
        }
      },
    );
  });
}
