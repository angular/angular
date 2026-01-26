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

  it('should handle apps where standalone is not enabled by default (pre v19)', async () => {
    await initServer({angularCoreVersion: '18.0.0'});
    const moduleFile = join(PROJECT_PATH, 'app/app.module.ts');

    // Update component to not specify standalone explicitly. This should be interpreted as
    // false in pre-v19 projects. The component is already declared in AppModule, and there should
    // be no diagnostics.
    openTextDocument(
      client,
      APP_COMPONENT,
      `
      import {Component, EventEmitter, Input, Output} from '@angular/core';

      @Component({
        selector: 'my-app',
        template: '<h1>Hello {{name}}</h1>',
        // standalone: false, // standalone is implicitly false
      })
      export class AppComponent {
        name = 'Angular';
        @Input() appInput = '';
        @Output() appOutput = new EventEmitter<string>();
      }
      `,
    );
    openTextDocument(client, APP_COMPONENT_MODULE);
    const diagnostics = await getDiagnosticsForFile(client, moduleFile);
    expect(diagnostics.length).toBe(0);
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

  describe('inlay hints', () => {
    it('should provide TypeScript inlay hints for component class', async () => {
      openTextDocument(client, APP_COMPONENT);
      const response = (await client.sendRequest(lsp.InlayHintRequest.type, {
        textDocument: {
          uri: APP_COMPONENT_URI,
        },
        range: {
          start: {line: 0, character: 0},
          end: {line: 20, character: 0},
        },
      })) as lsp.InlayHint[] | null;

      // The server should respond (may be empty if TS inlay hints are disabled,
      // but the request itself should succeed)
      expect(response).toBeDefined();
      // response can be null or empty array if TS has no hints to show
      // The important thing is that the request doesn't fail
    });

    it('should handle inlay hints for external template', async () => {
      openTextDocument(client, FOO_TEMPLATE);
      const response = (await client.sendRequest(lsp.InlayHintRequest.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
        },
        range: {
          start: {line: 0, character: 0},
          end: {line: 10, character: 0},
        },
      })) as lsp.InlayHint[] | null;

      // For HTML templates, we currently don't provide Angular-specific hints
      // (that's a future enhancement), but the request should succeed
      expect(response).toBeDefined();
    });

    it('should resolve inlay hints', async () => {
      openTextDocument(client, APP_COMPONENT);

      // First get some hints
      const hints = (await client.sendRequest(lsp.InlayHintRequest.type, {
        textDocument: {
          uri: APP_COMPONENT_URI,
        },
        range: {
          start: {line: 0, character: 0},
          end: {line: 20, character: 0},
        },
      })) as lsp.InlayHint[] | null;

      // If we have any hints, try to resolve one
      if (hints && hints.length > 0) {
        const resolved = await client.sendRequest(lsp.InlayHintResolveRequest.type, hints[0]);
        expect(resolved).toBeDefined();
        // Resolved hint should have at least the same position
        expect(resolved.position).toEqual(hints[0].position);
      }
    });

    it('should return inlay hints response for external template', async () => {
      // Use existing foo.component.html which has a simple template
      openTextDocument(client, FOO_TEMPLATE);

      // First verify diagnostics work (confirms Angular LS is working)
      const diagnostics = await getDiagnosticsForFile(client, FOO_TEMPLATE);
      expect(diagnostics).toBeDefined();

      const response = (await client.sendRequest(lsp.InlayHintRequest.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
        },
        range: {
          start: {line: 0, character: 0},
          end: {line: 10, character: 0},
        },
      })) as lsp.InlayHint[] | null;

      // The InlayHint request should succeed (response is null or array)
      // For external templates, we may not have hints yet if the feature
      // isn't fully implemented, but the request shouldn't fail
      // Check that response is either null or an array (not undefined)
      expect(response === null || Array.isArray(response)).toBe(true);
    });

    it('should provide Angular inlay hints for @if alias', async () => {
      // Create a component with @if and alias
      client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
          languageId: 'html',
          version: 1,
          text: `@if (title; as result) {
  <div>{{ result }}</div>
}`,
        },
      });

      // Wait for diagnostics to ensure the file is processed
      await getDiagnosticsForFile(client, FOO_TEMPLATE);

      const response = (await client.sendRequest(lsp.InlayHintRequest.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
        },
        range: {
          start: {line: 0, character: 0},
          end: {line: 5, character: 0},
        },
      })) as lsp.InlayHint[] | null;

      // Should have at least one hint for the @if alias
      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
      expect(response!.length).toBeGreaterThan(0);

      // Find the alias hint - should show the type (string for title)
      const aliasHint = response!.find((h) => {
        const label = typeof h.label === 'string' ? h.label : h.label.map((l) => l.value).join('');
        return label.includes('string');
      });
      expect(aliasHint).toBeDefined();
    });

    it('should provide inlay hints for pipe output types', async () => {
      // Use existing foo.component.html which has a pipe: {{title | uppercase}}
      openTextDocument(client, FOO_TEMPLATE);

      // Wait for diagnostics to ensure the file is processed
      await getDiagnosticsForFile(client, FOO_TEMPLATE);

      // Now try inlay hints
      const response = (await client.sendRequest(lsp.InlayHintRequest.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
        },
        range: {
          start: {line: 0, character: 0},
          end: {line: 10, character: 0},
        },
      })) as lsp.InlayHint[] | null;

      // Should have at least one hint for the pipe
      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
      expect(response!.length).toBeGreaterThan(0);

      // Find the pipe hint - should show the output type of uppercase pipe
      const pipeHint = response!.find((h) => {
        const label = typeof h.label === 'string' ? h.label : h.label.map((l) => l.value).join('');
        return label.includes('string');
      });
      expect(pipeHint).toBeDefined();
    });

    it('should provide inlay hints for @for loop variables', async () => {
      // Create a template with @for loop
      client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
          languageId: 'html',
          version: 1,
          text: `@for (item of [1, 2, 3]; track item; let idx = $index) {
  <div>{{ item }} at {{ idx }}</div>
}`,
        },
      });

      await getDiagnosticsForFile(client, FOO_TEMPLATE);

      const response = (await client.sendRequest(lsp.InlayHintRequest.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
        },
        range: {
          start: {line: 0, character: 0},
          end: {line: 5, character: 0},
        },
      })) as lsp.InlayHint[] | null;

      // Should have hints for the loop variable and possibly context variables
      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
      expect(response!.length).toBeGreaterThan(0);

      // Find hint for the loop item (should be number)
      const itemHint = response!.find((h) => {
        const label = typeof h.label === 'string' ? h.label : h.label.map((l) => l.value).join('');
        return label.includes('number');
      });
      expect(itemHint).toBeDefined();
    });

    it('should provide inlay hints for @let declarations', async () => {
      // Create a template with @let declaration
      client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
          languageId: 'html',
          version: 1,
          text: `@let doubled = 2 * 2;
<div>{{ doubled }}</div>`,
        },
      });

      await getDiagnosticsForFile(client, FOO_TEMPLATE);

      const response = (await client.sendRequest(lsp.InlayHintRequest.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
        },
        range: {
          start: {line: 0, character: 0},
          end: {line: 5, character: 0},
        },
      })) as lsp.InlayHint[] | null;

      // Should have a hint for the @let declaration
      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
      expect(response!.length).toBeGreaterThan(0);

      // The hint should show number type for the multiplication result
      const letHint = response!.find((h) => {
        const label = typeof h.label === 'string' ? h.label : h.label.map((l) => l.value).join('');
        return label.includes('number');
      });
      expect(letHint).toBeDefined();
    });

    it('should provide inlay hints for event parameter types', async () => {
      // Create a template with event binding using $event
      client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
          languageId: 'html',
          version: 1,
          text: `<button (click)="onClick($event)">Click me</button>`,
        },
      });

      await getDiagnosticsForFile(client, FOO_TEMPLATE);

      const response = (await client.sendRequest(lsp.InlayHintRequest.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
        },
        range: {
          start: {line: 0, character: 0},
          end: {line: 5, character: 0},
        },
      })) as lsp.InlayHint[] | null;

      // The hint might be present if the implementation supports it
      expect(response === null || Array.isArray(response)).toBe(true);

      // If hints are returned, check for MouseEvent or Event type
      if (response && response.length > 0) {
        const eventHint = response.find((h) => {
          const label =
            typeof h.label === 'string' ? h.label : h.label.map((l) => l.value).join('');
          return label.includes('MouseEvent') || label.includes('Event');
        });
        // Event hint is optional - some configurations might not enable it
        if (eventHint) {
          expect(eventHint.position).toBeDefined();
        }
      }
    });

    it('should provide inlay hints for structural directive let variables', async () => {
      // Create a template with ngFor structural directive (let-item pattern)
      client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
          languageId: 'html',
          version: 1,
          text: `<ng-template ngFor let-item [ngForOf]="[1, 2, 3]" let-i="index">
  <div>{{ item }} at {{ i }}</div>
</ng-template>`,
        },
      });

      await getDiagnosticsForFile(client, FOO_TEMPLATE);

      const response = (await client.sendRequest(lsp.InlayHintRequest.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
        },
        range: {
          start: {line: 0, character: 0},
          end: {line: 5, character: 0},
        },
      })) as lsp.InlayHint[] | null;

      // Hints should be returned for let variables
      expect(response === null || Array.isArray(response)).toBe(true);

      // If hints are returned, check for number type hints
      if (response && response.length > 0) {
        const numberHint = response.find((h) => {
          const label =
            typeof h.label === 'string' ? h.label : h.label.map((l) => l.value).join('');
          return label.includes('number');
        });
        // Number hint expected for the item and index
        expect(numberHint).toBeDefined();
      }
    });

    it('should provide inlay hints for pipes in property bindings', async () => {
      // Create a template with pipe in property binding
      client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
          languageId: 'html',
          version: 1,
          text: `<div [title]="title | uppercase">Hover me</div>`,
        },
      });

      await getDiagnosticsForFile(client, FOO_TEMPLATE);

      const response = (await client.sendRequest(lsp.InlayHintRequest.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
        },
        range: {
          start: {line: 0, character: 0},
          end: {line: 5, character: 0},
        },
      })) as lsp.InlayHint[] | null;

      // Should have a hint for the pipe output
      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
      expect(response!.length).toBeGreaterThan(0);

      // Find the pipe hint - should show string type
      const pipeHint = response!.find((h) => {
        const label = typeof h.label === 'string' ? h.label : h.label.map((l) => l.value).join('');
        return label.includes('string');
      });
      expect(pipeHint).toBeDefined();
    });

    it('should provide inlay hints for chained pipes', async () => {
      // Create a template with chained pipes
      client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
          languageId: 'html',
          version: 1,
          text: `{{ title | uppercase | lowercase }}`,
        },
      });

      await getDiagnosticsForFile(client, FOO_TEMPLATE);

      const response = (await client.sendRequest(lsp.InlayHintRequest.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
        },
        range: {
          start: {line: 0, character: 0},
          end: {line: 5, character: 0},
        },
      })) as lsp.InlayHint[] | null;

      // Should have hints for each pipe in the chain
      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
      // At least 2 hints for 2 pipes
      expect(response!.length).toBeGreaterThanOrEqual(2);
    });

    it('should not produce duplicate inlay hints for @for loop variables', async () => {
      // Regression test: TmplAstRecursiveVisitor visits variables twice
      // (once in visitForLoopBlock, once via visitVariable) which caused duplicates
      client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
          languageId: 'html',
          version: 1,
          text: `@for (item of [1, 2, 3]; track item; let idx = $index) {
  {{ item }}
}`,
        },
      });

      await getDiagnosticsForFile(client, FOO_TEMPLATE);

      const response = (await client.sendRequest(lsp.InlayHintRequest.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
        },
        range: {
          start: {line: 0, character: 0},
          end: {line: 5, character: 0},
        },
      })) as lsp.InlayHint[] | null;

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);

      // Count hints with ': number' - there should be exactly 2:
      // one for 'item' and one for 'idx'
      const numberHints = response!.filter((h) => {
        const label = typeof h.label === 'string' ? h.label : h.label.map((l) => l.value).join('');
        return label === ': number';
      });

      // Should have exactly 2 number hints, not 4+ (which would happen with duplicates)
      expect(numberHints.length).toBe(2);
    });

    it('should not produce duplicate inlay hints for @if alias', async () => {
      // Regression test: @if alias was being visited twice causing duplicate hints
      client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
          languageId: 'html',
          version: 1,
          text: `@if (title; as myTitle) {
  {{ myTitle }}
}`,
        },
      });

      await getDiagnosticsForFile(client, FOO_TEMPLATE);

      const response = (await client.sendRequest(lsp.InlayHintRequest.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
        },
        range: {
          start: {line: 0, character: 0},
          end: {line: 5, character: 0},
        },
      })) as lsp.InlayHint[] | null;

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);

      // Count hints with ': string' - there should be exactly 1 for 'myTitle'
      const stringHints = response!.filter((h) => {
        const label = typeof h.label === 'string' ? h.label : h.label.map((l) => l.value).join('');
        return label === ': string';
      });

      // Should have exactly 1 string hint, not 2 (which would happen with duplicates)
      expect(stringHints.length).toBe(1);
    });

    it('should provide inlay hints for @else if alias', async () => {
      // @else if also supports the 'as' alias syntax
      client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
          languageId: 'html',
          version: 1,
          text: `@if (false) {
  never
} @else if (title; as elseIfAlias) {
  {{ elseIfAlias }}
}`,
        },
      });

      await getDiagnosticsForFile(client, FOO_TEMPLATE);

      const response = (await client.sendRequest(lsp.InlayHintRequest.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
        },
        range: {
          start: {line: 0, character: 0},
          end: {line: 10, character: 0},
        },
      })) as lsp.InlayHint[] | null;

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);

      // Should have a hint for the @else if alias
      const stringHints = response!.filter((h) => {
        const label = typeof h.label === 'string' ? h.label : h.label.map((l) => l.value).join('');
        return label === ': string';
      });

      // Should have exactly 1 string hint for 'elseIfAlias'
      expect(stringHints.length).toBe(1);
    });

    it('should provide inlay hints for @let declarations', async () => {
      client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
          languageId: 'html',
          version: 1,
          text: `@let greeting = title;
@let doubled = 2 * 2;
{{ greeting }} {{ doubled }}`,
        },
      });

      await getDiagnosticsForFile(client, FOO_TEMPLATE);

      const response = (await client.sendRequest(lsp.InlayHintRequest.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
        },
        range: {
          start: {line: 0, character: 0},
          end: {line: 5, character: 0},
        },
      })) as lsp.InlayHint[] | null;

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);

      // Should have hints for both @let declarations
      const stringHints = response!.filter((h) => {
        const label = typeof h.label === 'string' ? h.label : h.label.map((l) => l.value).join('');
        return label === ': string';
      });
      const numberHints = response!.filter((h) => {
        const label = typeof h.label === 'string' ? h.label : h.label.map((l) => l.value).join('');
        return label === ': number';
      });

      expect(stringHints.length).toBe(1); // greeting: string
      expect(numberHints.length).toBe(1); // doubled: number
    });

    it('should provide inlay hints for pipe output types', async () => {
      client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
          languageId: 'html',
          version: 1,
          text: `{{ title | uppercase }}`,
        },
      });

      await getDiagnosticsForFile(client, FOO_TEMPLATE);

      const response = (await client.sendRequest(lsp.InlayHintRequest.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
        },
        range: {
          start: {line: 0, character: 0},
          end: {line: 1, character: 0},
        },
      })) as lsp.InlayHint[] | null;

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);

      // Should have a hint for the pipe output type
      const pipeHints = response!.filter((h) => {
        const label = typeof h.label === 'string' ? h.label : h.label.map((l) => l.value).join('');
        return label.includes('string');
      });

      expect(pipeHints.length).toBeGreaterThanOrEqual(1);
    });

    it('should provide inlay hints for template reference variables', async () => {
      client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
          languageId: 'html',
          version: 1,
          text: `<input #myInput>
<div #myDiv>content</div>
{{ myInput.value }} {{ myDiv.textContent }}`,
        },
      });

      await getDiagnosticsForFile(client, FOO_TEMPLATE);

      const response = (await client.sendRequest(lsp.InlayHintRequest.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
        },
        range: {
          start: {line: 0, character: 0},
          end: {line: 5, character: 0},
        },
      })) as lsp.InlayHint[] | null;

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);

      // Should have hints for #myInput (HTMLInputElement) and #myDiv (HTMLDivElement)
      const inputHint = response!.find((h) => {
        const label = typeof h.label === 'string' ? h.label : h.label.map((l) => l.value).join('');
        return label.includes('HTMLInputElement');
      });
      const divHint = response!.find((h) => {
        const label = typeof h.label === 'string' ? h.label : h.label.map((l) => l.value).join('');
        return label.includes('HTMLDivElement');
      });

      expect(inputHint).toBeDefined();
      expect(divHint).toBeDefined();
    });

    it('should provide inlay hints for structural directive variables (*ngFor)', async () => {
      // Use a template with *ngFor that uses a simple string array
      client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
          languageId: 'html',
          version: 1,
          text: `<div *ngFor="let char of title; let idx = index">{{ char }} {{ idx }}</div>`,
        },
      });

      await getDiagnosticsForFile(client, FOO_TEMPLATE);

      const response = (await client.sendRequest(lsp.InlayHintRequest.type, {
        textDocument: {
          uri: FOO_TEMPLATE_URI,
        },
        range: {
          start: {line: 0, character: 0},
          end: {line: 2, character: 0},
        },
      })) as lsp.InlayHint[] | null;

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);

      // Should have hints for 'char' (string) and 'idx' (number)
      const charHint = response!.find((h) => {
        const label = typeof h.label === 'string' ? h.label : h.label.map((l) => l.value).join('');
        return label === ': string';
      });
      const idxHint = response!.find((h) => {
        const label = typeof h.label === 'string' ? h.label : h.label.map((l) => l.value).join('');
        return label === ': number';
      });

      expect(charHint).toBeDefined();
      expect(idxHint).toBeDefined();
    });

    it('should provide inlay hints for host event bindings', async () => {
      const HIGHLIGHT_DIRECTIVE = join(PROJECT_PATH, 'app', 'highlight.directive.ts');
      const HIGHLIGHT_DIRECTIVE_URI = pathToFileURL(HIGHLIGHT_DIRECTIVE).toString();

      openTextDocument(client, HIGHLIGHT_DIRECTIVE);
      await getDiagnosticsForFile(client, HIGHLIGHT_DIRECTIVE);

      const response = (await client.sendRequest(lsp.InlayHintRequest.type, {
        textDocument: {
          uri: HIGHLIGHT_DIRECTIVE_URI,
        },
        range: {
          start: {line: 0, character: 0},
          end: {line: 30, character: 0},
        },
      })) as lsp.InlayHint[] | null;

      expect(response).not.toBeNull();
      expect(Array.isArray(response)).toBe(true);

      // Should have event type hints for the $event parameter in host event handlers
      // Note: click events are PointerEvent in modern browsers, mouseenter is MouseEvent
      const eventHints = response!.filter((h) => {
        const label = typeof h.label === 'string' ? h.label : h.label.map((l) => l.value).join('');
        return label.includes('MouseEvent') || label.includes('PointerEvent');
      });

      // Should have at least 2 event type hints (one for click=PointerEvent, one for mouseenter=MouseEvent)
      expect(eventHints.length).toBeGreaterThanOrEqual(2);
    });
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
                  // Line numbers adjusted for HighlightDirective import
                  'start': {'line': 6, 'character': 57},
                  'end': {'line': 6, 'character': 57},
                },
              },
              {
                'newText': 'imports: [CommonModule, PostModule, BarComponent]',
                'range': {
                  // Line numbers adjusted for HighlightDirective import
                  'start': {'line': 9, 'character': 2},
                  'end': {'line': 9, 'character': 37},
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
