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

describe('Pull-based diagnostics (LSP 3.17)', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; /* 10 seconds */

  let client: MessageConnection;
  /**
   * Promise that resolves when the server sends a workspace/diagnostic/refresh request.
   * This is more reliable than a fixed setTimeout as it waits for the server signal.
   */
  let diagnosticRefreshPromise: Promise<void>;
  let resolveDiagnosticRefresh: () => void;

  /**
   * Wait for the server to signal it's ready for diagnostics to be pulled.
   * The server sends workspace/diagnostic/refresh after processing document changes.
   * This replaces fixed setTimeout waits with event-driven synchronization.
   */
  function waitForDiagnosticRefresh(): Promise<void> {
    return diagnosticRefreshPromise;
  }

  /**
   * Reset the diagnostic refresh promise for the next wait cycle.
   * Should be called after consuming a refresh signal.
   */
  function resetDiagnosticRefresh(): void {
    diagnosticRefreshPromise = new Promise((resolve) => {
      resolveDiagnosticRefresh = resolve;
    });
  }

  beforeEach(async () => {
    // Initialize the diagnostic refresh promise
    resetDiagnosticRefresh();

    client = createConnection({});
    // If debugging, set to
    // - lsp.Trace.Messages to inspect request/response/notification, or
    // - lsp.Trace.Verbose to inspect payload
    client.trace(lsp.Trace.Off, createTracer());

    // Handle the workspace/diagnostic/refresh request from the server.
    // Resolves the promise so tests can await this signal instead of using setTimeout.
    client.onRequest(lsp.DiagnosticRefreshRequest.type, () => {
      resolveDiagnosticRefresh();
      // Reset for next wait cycle
      resetDiagnosticRefresh();
    });

    client.listen();
    // Initialize with pull diagnostics enabled
    await initializeServer(client, {enablePullDiagnostics: true});
  });

  afterEach(() => {
    client.dispose();
  });

  it('should return diagnostics via textDocument/diagnostic', async () => {
    // Open a document with an error
    client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
      textDocument: {
        uri: FOO_TEMPLATE_URI,
        languageId: 'html',
        version: 1,
        text: `{{ doesnotexist }}`,
      },
    });

    // Wait for the server to signal it's ready for diagnostics to be pulled
    await waitForDiagnosticRefresh();

    // Request pull diagnostics
    const response = await client.sendRequest(lsp.DocumentDiagnosticRequest.type, {
      textDocument: {uri: FOO_TEMPLATE_URI},
    });

    expect(response.kind).toBe(lsp.DocumentDiagnosticReportKind.Full);
    const fullResponse = response as lsp.FullDocumentDiagnosticReport;
    expect(fullResponse.items.length).toBe(1);
    expect(fullResponse.items[0].message).toBe(
      `Property 'doesnotexist' does not exist on type 'FooComponent'.`,
    );
    expect(fullResponse.resultId).toBeDefined();
  });

  it('should return unchanged report when document has not changed', async () => {
    // Open a document with an error
    client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
      textDocument: {
        uri: FOO_TEMPLATE_URI,
        languageId: 'html',
        version: 1,
        text: `{{ doesnotexist }}`,
      },
    });

    // Wait for the server to signal it's ready
    await waitForDiagnosticRefresh();

    // First request to get the resultId
    const firstResponse = await client.sendRequest(lsp.DocumentDiagnosticRequest.type, {
      textDocument: {uri: FOO_TEMPLATE_URI},
    });

    expect(firstResponse.kind).toBe(lsp.DocumentDiagnosticReportKind.Full);
    const fullResponse = firstResponse as lsp.FullDocumentDiagnosticReport;
    const resultId = fullResponse.resultId;
    expect(resultId).toBeDefined();

    // Second request with the previous resultId
    const secondResponse = await client.sendRequest(lsp.DocumentDiagnosticRequest.type, {
      textDocument: {uri: FOO_TEMPLATE_URI},
      previousResultId: resultId,
    });

    // Should return unchanged since document hasn't been modified
    expect(secondResponse.kind).toBe(lsp.DocumentDiagnosticReportKind.Unchanged);
    expect((secondResponse as lsp.UnchangedDocumentDiagnosticReport).resultId).toBe(resultId!);
  });

  it('should return full report when document changes', async () => {
    // Open a document with an error
    client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
      textDocument: {
        uri: FOO_TEMPLATE_URI,
        languageId: 'html',
        version: 1,
        text: `{{ doesnotexist }}`,
      },
    });

    // Wait for the server to signal it's ready
    await waitForDiagnosticRefresh();

    // First request to get the resultId
    const firstResponse = await client.sendRequest(lsp.DocumentDiagnosticRequest.type, {
      textDocument: {uri: FOO_TEMPLATE_URI},
    });

    expect(firstResponse.kind).toBe(lsp.DocumentDiagnosticReportKind.Full);
    const resultId = (firstResponse as lsp.FullDocumentDiagnosticReport).resultId;

    // Change the document
    client.sendNotification(lsp.DidChangeTextDocumentNotification.type, {
      textDocument: {
        uri: FOO_TEMPLATE_URI,
        version: 2,
      },
      contentChanges: [{text: `{{ alsoDoesNotExist }}`}],
    });

    // Wait for the server to signal it's ready after document change
    await waitForDiagnosticRefresh();

    // Request with previous resultId - should get full report since document changed
    const secondResponse = await client.sendRequest(lsp.DocumentDiagnosticRequest.type, {
      textDocument: {uri: FOO_TEMPLATE_URI},
      previousResultId: resultId,
    });

    expect(secondResponse.kind).toBe(lsp.DocumentDiagnosticReportKind.Full);
    const fullResponse = secondResponse as lsp.FullDocumentDiagnosticReport;
    expect(fullResponse.items[0].message).toContain('alsoDoesNotExist');
  });

  it('should return diagnostics for valid template', async () => {
    // Open the app component which should have no errors
    openTextDocument(client, APP_COMPONENT);

    // Wait for the server to signal it's ready
    await waitForDiagnosticRefresh();

    const response = await client.sendRequest(lsp.DocumentDiagnosticRequest.type, {
      textDocument: {uri: APP_COMPONENT_URI},
    });

    expect(response.kind).toBe(lsp.DocumentDiagnosticReportKind.Full);
    const fullResponse = response as lsp.FullDocumentDiagnosticReport;
    expect(fullResponse.items.length).toBe(0);
  });

  it('should include relatedInformation in diagnostics', async () => {
    // Open a template with an error
    client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
      textDocument: {
        uri: FOO_TEMPLATE_URI,
        languageId: 'html',
        version: 1,
        text: `{{ doesnotexist }}`,
      },
    });

    // Wait for the server to signal it's ready
    await waitForDiagnosticRefresh();

    const response = await client.sendRequest(lsp.DocumentDiagnosticRequest.type, {
      textDocument: {uri: FOO_TEMPLATE_URI},
    });

    expect(response.kind).toBe(lsp.DocumentDiagnosticReportKind.Full);
    const fullResponse = response as lsp.FullDocumentDiagnosticReport;
    expect(fullResponse.items.length).toBe(1);
    expect(fullResponse.items[0].relatedInformation).toBeDefined();
    expect(fullResponse.items[0].relatedInformation!.length).toBe(1);
    expect(fullResponse.items[0].relatedInformation![0].message).toBe(
      `Error occurs in the template of component FooComponent.`,
    );
  });

  it('should handle workspace/diagnostic request', async () => {
    // Open multiple files
    openTextDocument(client, APP_COMPONENT);
    client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
      textDocument: {
        uri: FOO_TEMPLATE_URI,
        languageId: 'html',
        version: 1,
        text: `{{ doesnotexist }}`,
      },
    });

    // Wait for the server to signal it's ready (may receive multiple refresh signals)
    await waitForDiagnosticRefresh();

    // Request workspace diagnostics
    const response = await client.sendRequest(lsp.WorkspaceDiagnosticRequest.type, {
      previousResultIds: [],
    });

    expect(response.items).toBeDefined();
    expect(response.items.length).toBeGreaterThanOrEqual(2);

    // Find the FOO_TEMPLATE in the results
    const fooTemplateDiag = response.items.find((item) => item.uri === FOO_TEMPLATE_URI);
    expect(fooTemplateDiag).toBeDefined();
    expect(fooTemplateDiag!.kind).toBe(lsp.DocumentDiagnosticReportKind.Full);
    const fullReport = fooTemplateDiag as lsp.WorkspaceFullDocumentDiagnosticReport;
    expect(fullReport.items.length).toBe(1);
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
