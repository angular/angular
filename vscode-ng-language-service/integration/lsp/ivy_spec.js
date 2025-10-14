'use strict';
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', {enumerable: true, value: v});
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : {'default': mod};
  };
Object.defineProperty(exports, '__esModule', {value: true});
const node_url_1 = require('node:url');
const node_fs_1 = __importDefault(require('node:fs'));
const promises_1 = require('node:fs/promises');
const node_path_1 = require('node:path');
const promises_2 = require('node:timers/promises');
const lsp = __importStar(require('vscode-languageserver-protocol'));
const notifications_1 = require('../../common/notifications');
const requests_1 = require('../../common/requests');
const test_constants_1 = require('../test_constants');
const test_utils_1 = require('./test_utils');
describe('Angular Ivy language server', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; /* 10 seconds */
  let client;
  beforeEach(async () => {
    await initServer({});
  });
  afterEach(() => {
    client.dispose();
  });
  async function initServer(options) {
    client = (0, test_utils_1.createConnection)(Object.assign({ivy: true}, options));
    // If debugging, set to
    // - lsp.Trace.Messages to inspect request/response/notification, or
    // - lsp.Trace.Verbose to inspect payload
    client.trace(lsp.Trace.Off, (0, test_utils_1.createTracer)());
    client.listen();
    await (0, test_utils_1.initializeServer)(client);
  }
  it('should handle hover on inline template', async () => {
    (0, test_utils_1.openTextDocument)(client, test_constants_1.APP_COMPONENT);
    const response = await client.sendRequest(lsp.HoverRequest.type, {
      textDocument: {
        uri: test_constants_1.APP_COMPONENT_URI,
      },
      position: {line: 4, character: 25},
    });
    expect(response === null || response === void 0 ? void 0 : response.contents).toContain({
      language: 'typescript',
      value: '(property) AppComponent.name: string',
    });
  });
  it('should show diagnostics for inline template on open', async () => {
    (0, test_utils_1.openTextDocument)(client, test_constants_1.APP_COMPONENT);
    const diagnostics = await getDiagnosticsForFile(client, test_constants_1.APP_COMPONENT);
    expect(diagnostics.length).toBe(0);
  });
  it('should show diagnostics for external template on open', async () => {
    client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
      textDocument: {
        uri: test_constants_1.FOO_TEMPLATE_URI,
        languageId: 'html',
        version: 1,
        text: `{{ doesnotexist }}`,
      },
    });
    const diagnostics = await getDiagnosticsForFile(client, test_constants_1.FOO_TEMPLATE);
    expect(diagnostics.length).toBe(1);
    expect(diagnostics[0].message).toBe(
      `Property 'doesnotexist' does not exist on type 'FooComponent'.`,
    );
    expect(diagnostics[0].relatedInformation).toBeDefined();
    expect(diagnostics[0].relatedInformation.length).toBe(1);
    expect(diagnostics[0].relatedInformation[0].message).toBe(
      `Error occurs in the template of component FooComponent.`,
    );
    expect(diagnostics[0].relatedInformation[0].location.uri).toBe(
      test_constants_1.FOO_COMPONENT_URI,
    );
  });
  it('should support request cancellation', async () => {
    (0, test_utils_1.openTextDocument)(client, test_constants_1.APP_COMPONENT);
    // Send a request and immediately cancel it
    const promise = client.sendRequest(lsp.HoverRequest.type, {
      textDocument: {
        uri: test_constants_1.FOO_COMPONENT_URI,
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
        uri: test_constants_1.FOO_TEMPLATE_URI,
        languageId: 'html',
        version: 1,
        text: `<div *ngIf="false"></div>`,
      },
    });
    const response = await client.sendRequest(lsp.DefinitionRequest.type, {
      textDocument: {
        uri: test_constants_1.FOO_TEMPLATE_URI,
      },
      position: {line: 0, character: 7},
    });
    // 2 results - the NgIf class and the ngIf input
    expect(response).toHaveSize(2);
    const {targetUri} = response[0];
    // This can be hashed
    expect(targetUri).toMatch(/angular\/common\/common_module.*\.d\.ts$/);
    // Open the `.d.ts` file
    (0, test_utils_1.openTextDocument)(client, (0, node_url_1.fileURLToPath)(targetUri));
    // try a hover operation again on *ngIf
    const hoverResponse = await client.sendRequest(lsp.HoverRequest.type, {
      textDocument: {
        uri: test_constants_1.FOO_TEMPLATE_URI,
      },
      position: {line: 0, character: 7},
    });
    expect(
      hoverResponse === null || hoverResponse === void 0 ? void 0 : hoverResponse.contents,
    ).toContain({
      language: 'typescript',
      value: 'deprecated,declare (property) NgIf<boolean>.ngIf: boolean',
    });
  });
  it('goes to definition of original source when compiled with source maps', async () => {
    client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
      textDocument: {
        uri: test_constants_1.FOO_TEMPLATE_URI,
        languageId: 'html',
        version: 1,
        text: `<lib-post></lib-post>`,
      },
    });
    const response = await client.sendRequest(lsp.DefinitionRequest.type, {
      textDocument: {
        uri: test_constants_1.FOO_TEMPLATE_URI,
      },
      position: {line: 0, character: 1},
    });
    expect(Array.isArray(response)).toBe(true);
    const {targetUri} = response[0];
    expect(targetUri).toContain('libs/post/src/lib/post.component.ts');
  });
  it('provides folding ranges for inline templates', async () => {
    (0, test_utils_1.openTextDocument)(
      client,
      test_constants_1.APP_COMPONENT,
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
    const response = await client.sendRequest(lsp.FoldingRangeRequest.type, {
      textDocument: {
        uri: test_constants_1.APP_COMPONENT_URI,
      },
    });
    expect(Array.isArray(response)).toBe(true);
    // 1 folding range for the div, 1 for the span
    expect(response.length).toEqual(2);
    expect(response).toContain({startLine: 6, endLine: 9});
    expect(response).toContain({startLine: 7, endLine: 8});
  });
  it('provides folding ranges for control flow', async () => {
    (0, test_utils_1.openTextDocument)(
      client,
      test_constants_1.APP_COMPONENT,
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
    const response = await client.sendRequest(lsp.FoldingRangeRequest.type, {
      textDocument: {
        uri: test_constants_1.APP_COMPONENT_URI,
      },
    });
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
          uri: test_constants_1.FOO_TEMPLATE_URI,
          languageId: 'html',
          version: 1,
          text: `{{ title.toString() }}`,
        },
      });
      const response = await client.sendRequest(lsp.SignatureHelpRequest.type, {
        textDocument: {
          uri: test_constants_1.FOO_TEMPLATE_URI,
        },
        position: {line: 0, character: 18},
      });
      expect(response).not.toBeNull();
      expect(response.signatures.length).toEqual(1);
      expect(response.signatures[0].label).toContain('(): string');
    });
    it('should show signature help with multiple arguments', async () => {
      client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
        textDocument: {
          uri: test_constants_1.FOO_TEMPLATE_URI,
          languageId: 'html',
          version: 1,
          text: `{{ title.substr(0, ) }}`,
        },
      });
      const response = await client.sendRequest(lsp.SignatureHelpRequest.type, {
        textDocument: {
          uri: test_constants_1.FOO_TEMPLATE_URI,
        },
        position: {line: 0, character: 19},
      });
      expect(response).not.toBeNull();
      expect(response.signatures.length).toEqual(1);
      expect(response.signatures[0].label).toContain('(from: number, length?: number): string');
      expect(response.signatures[0].parameters).not.toBeUndefined();
      expect(response.activeParameter).toBe(1);
      const label = response.signatures[0].label;
      const paramLabels = response.signatures[0].parameters.map((param) => {
        const [start, end] = param.label;
        return label.substring(start, end);
      });
      expect(paramLabels).toEqual(['from: number', 'length?: number']);
    });
  });
  describe('project reload', () => {
    let newProjectRoot;
    let dummy;
    let APP_COMPONENT_PATH_TMP;
    beforeAll(async () => {
      const tmpDir = (0, test_constants_1.makeTempDir)();
      newProjectRoot = (0, node_path_1.join)(
        tmpDir,
        (0, node_path_1.basename)(test_constants_1.PROJECT_PATH),
      );
      dummy = `${newProjectRoot}/node_modules/__foo__`;
      APP_COMPONENT_PATH_TMP = (0, node_path_1.join)(newProjectRoot, 'app/app.component.ts');
      await (0, promises_1.cp)(test_constants_1.PROJECT_PATH, newProjectRoot, {
        recursive: true,
        mode: node_fs_1.default.constants.COPYFILE_FICLONE,
      });
    });
    afterEach(() => {
      node_fs_1.default.unlinkSync(dummy);
    });
    it('should retain typecheck files', async () => {
      (0, test_utils_1.openTextDocument)(client, APP_COMPONENT_PATH_TMP);
      // Create a file in node_modules, this will trigger a project reload via
      // the directory watcher
      node_fs_1.default.writeFileSync(dummy, '');
      // Project reload happens after 250ms delay
      // https://github.com/microsoft/TypeScript/blob/3c32f6e154ead6749b76ec9c19cbfdd2acad97d6/src/server/editorServices.ts#L957
      await (0, promises_2.setTimeout)(500);
      // The following operation would result in compiler crash if typecheck
      // files are not retained after project reload
      const diagnostics = await getDiagnosticsForFile(client, APP_COMPONENT_PATH_TMP);
      expect(diagnostics.length).toBe(0);
    });
  });
  describe('completions', () => {
    it('for events', async () => {
      (0, test_utils_1.openTextDocument)(
        client,
        test_constants_1.FOO_TEMPLATE,
        `<my-app ()></my-app>`,
      );
      const response = await client.sendRequest(lsp.CompletionRequest.type, {
        textDocument: {
          uri: test_constants_1.FOO_TEMPLATE_URI,
        },
        position: {line: 0, character: 9},
      });
      const outputCompletion = response.find((i) => i.label === '(appOutput)');
      expect(outputCompletion.kind).toEqual(lsp.CompletionItemKind.Property);
      // // replace range includes the closing )
      expect(outputCompletion.textEdit.range).toEqual({
        start: {line: 0, character: 8},
        end: {line: 0, character: 10},
      });
    });
  });
  describe('renaming', () => {
    describe('from template files', () => {
      beforeEach(async () => {
        (0, test_utils_1.openTextDocument)(client, test_constants_1.FOO_TEMPLATE);
      });
      it('should handle prepare rename request for property read', async () => {
        const response = await client.sendRequest(lsp.PrepareRenameRequest.type, {
          textDocument: {
            uri: test_constants_1.FOO_TEMPLATE_URI,
          },
          position: {line: 0, character: 3},
        });
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
        var _a, _b, _c, _d;
        const response = await client.sendRequest(lsp.RenameRequest.type, {
          textDocument: {
            uri: test_constants_1.FOO_TEMPLATE_URI,
          },
          position: {line: 0, character: 3},
          newName: 'subtitle',
        });
        expect(response).not.toBeNull();
        expect(
          (_a = response === null || response === void 0 ? void 0 : response.changes) === null ||
            _a === void 0
            ? void 0
            : _a[test_constants_1.FOO_TEMPLATE_URI].length,
        ).toBe(1);
        expect(
          (_b = response === null || response === void 0 ? void 0 : response.changes) === null ||
            _b === void 0
            ? void 0
            : _b[test_constants_1.FOO_TEMPLATE_URI],
        ).toContain(expectedRenameInTemplate);
        expect(
          (_c = response === null || response === void 0 ? void 0 : response.changes) === null ||
            _c === void 0
            ? void 0
            : _c[test_constants_1.FOO_COMPONENT_URI].length,
        ).toBe(1);
        expect(
          (_d = response === null || response === void 0 ? void 0 : response.changes) === null ||
            _d === void 0
            ? void 0
            : _d[test_constants_1.FOO_COMPONENT_URI],
        ).toContain(expectedRenameInComponent);
      });
    });
    describe('from typescript files', () => {
      beforeEach(async () => {
        (0, test_utils_1.openTextDocument)(client, test_constants_1.APP_COMPONENT);
      });
      it('should handle prepare rename request for inline template property read', async () => {
        const response = await client.sendRequest(lsp.PrepareRenameRequest.type, {
          textDocument: {
            uri: test_constants_1.APP_COMPONENT_URI,
          },
          position: {line: 4, character: 25},
        });
        expect(response.range).toEqual({
          start: {line: 4, character: 25},
          end: {line: 4, character: 29},
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
            start: {line: 4, character: 25},
            end: {line: 4, character: 29},
          },
          newText: 'surname',
        };
        it('should handle rename request for property read in a template', async () => {
          var _a, _b, _c;
          const response = await client.sendRequest(lsp.RenameRequest.type, {
            textDocument: {
              uri: test_constants_1.APP_COMPONENT_URI,
            },
            position: {line: 4, character: 25},
            newName: 'surname',
          });
          expect(response).not.toBeNull();
          expect(
            (_a = response === null || response === void 0 ? void 0 : response.changes) === null ||
              _a === void 0
              ? void 0
              : _a[test_constants_1.APP_COMPONENT_URI].length,
          ).toBe(2);
          expect(
            (_b = response === null || response === void 0 ? void 0 : response.changes) === null ||
              _b === void 0
              ? void 0
              : _b[test_constants_1.APP_COMPONENT_URI],
          ).toContain(expectedRenameInComponent);
          expect(
            (_c = response === null || response === void 0 ? void 0 : response.changes) === null ||
              _c === void 0
              ? void 0
              : _c[test_constants_1.APP_COMPONENT_URI],
          ).toContain(expectedRenameInTemplate);
        });
        it('should handle rename request for property in the component', async () => {
          var _a, _b, _c;
          const response = await client.sendRequest(lsp.RenameRequest.type, {
            textDocument: {
              uri: test_constants_1.APP_COMPONENT_URI,
            },
            position: {line: 8, character: 4},
            newName: 'surname',
          });
          expect(response).not.toBeNull();
          expect(
            (_a = response === null || response === void 0 ? void 0 : response.changes) === null ||
              _a === void 0
              ? void 0
              : _a[test_constants_1.APP_COMPONENT_URI].length,
          ).toBe(2);
          expect(
            (_b = response === null || response === void 0 ? void 0 : response.changes) === null ||
              _b === void 0
              ? void 0
              : _b[test_constants_1.APP_COMPONENT_URI],
          ).toContain(expectedRenameInComponent);
          expect(
            (_c = response === null || response === void 0 ? void 0 : response.changes) === null ||
              _c === void 0
              ? void 0
              : _c[test_constants_1.APP_COMPONENT_URI],
          ).toContain(expectedRenameInTemplate);
        });
      });
    });
  });
  describe('compiler options', () => {
    describe('strictTemplates: false', () => {
      let newProjectRoot;
      let TSCONFIG_PATH_TMP;
      let APP_COMPONENT_PATH_TMP;
      let FOO_COMPONENT_URI_TMP;
      beforeAll(async () => {
        const tmpDir = (0, test_constants_1.makeTempDir)();
        newProjectRoot = (0, node_path_1.join)(
          tmpDir,
          (0, node_path_1.basename)(test_constants_1.PROJECT_PATH),
        );
        TSCONFIG_PATH_TMP = (0, node_path_1.join)(newProjectRoot, 'tsconfig.json');
        APP_COMPONENT_PATH_TMP = (0, node_path_1.join)(newProjectRoot, 'app/app.component.ts');
        FOO_COMPONENT_URI_TMP = (0, node_url_1.pathToFileURL)(
          (0, node_path_1.join)(newProjectRoot, 'app/foo.component.ts'),
        ).href;
        await (0, promises_1.cp)(test_constants_1.PROJECT_PATH, newProjectRoot, {
          recursive: true,
          mode: node_fs_1.default.constants.COPYFILE_FICLONE,
          filter: (src) => src !== test_constants_1.TSCONFIG,
        });
        // set strictTemplates=false;
        const originalConfig = await (0, promises_1.readFile)(test_constants_1.TSCONFIG, 'utf-8');
        const config = JSON.parse(originalConfig);
        config.angularCompilerOptions.strictTemplates = false;
        await (0, promises_1.writeFile)(TSCONFIG_PATH_TMP, JSON.stringify(config, null, 2));
      });
      beforeEach(() => {
        (0, test_utils_1.openTextDocument)(client, APP_COMPONENT_PATH_TMP);
      });
      it('should suggest strict mode', async () => {
        const configFilePath = await onSuggestStrictMode(client);
        expect(configFilePath).toBe(TSCONFIG_PATH_TMP);
      });
      it('should disable renaming when strict mode is disabled', async () => {
        await onSuggestStrictMode(client);
        const prepareRenameResponse = await client.sendRequest(lsp.PrepareRenameRequest.type, {
          textDocument: {
            uri: FOO_COMPONENT_URI_TMP,
          },
          position: {line: 4, character: 25},
        });
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
    (0, test_utils_1.openTextDocument)(client, test_constants_1.FOO_TEMPLATE);
    const response = await client.sendRequest(requests_1.GetTcbRequest, {
      textDocument: {
        uri: test_constants_1.FOO_TEMPLATE_URI,
      },
      position: {line: 0, character: 3},
    });
    expect(response).toBeDefined();
  });
  it('should handle goToComponent request', async () => {
    (0, test_utils_1.openTextDocument)(client, test_constants_1.FOO_TEMPLATE);
    const response = await client.sendRequest(requests_1.GetComponentsWithTemplateFile, {
      textDocument: {
        uri: test_constants_1.FOO_TEMPLATE_URI,
      },
    });
    expect(response).toBeDefined();
  });
  it('should handle GetTemplateLocationForComponent request', async () => {
    (0, test_utils_1.openTextDocument)(client, test_constants_1.FOO_TEMPLATE);
    const response = await client.sendRequest(requests_1.GetTemplateLocationForComponent, {
      textDocument: {
        uri: test_constants_1.FOO_COMPONENT_URI,
      },
      position: {line: 6, character: 0},
    });
    expect(response).toBeDefined();
    expect(response.uri).toContain('foo.component.html');
  });
  it('should handle GetTemplateLocationForComponent request when not in component', async () => {
    (0, test_utils_1.openTextDocument)(client, test_constants_1.FOO_TEMPLATE);
    const response = await client.sendRequest(requests_1.GetTemplateLocationForComponent, {
      textDocument: {
        uri: test_constants_1.FOO_COMPONENT_URI,
      },
      position: {line: 1, character: 0},
    });
    expect(response).toBeNull();
  });
  it('should handle apps where standalone is not enabled by default (pre v19)', async () => {
    await initServer({angularCoreVersion: '18.0.0'});
    const moduleFile = (0, node_path_1.join)(
      test_constants_1.PRE_STANDALONE_PROJECT_PATH,
      'app/app.module.ts',
    );
    (0, test_utils_1.openTextDocument)(client, moduleFile);
    const diagnostics = await getDiagnosticsForFile(client, moduleFile);
    expect(diagnostics.length).toBe(0);
  });
  it('should provide a "go to component" codelens', async () => {
    var _a;
    (0, test_utils_1.openTextDocument)(client, test_constants_1.FOO_TEMPLATE);
    const codeLensResponse = await client.sendRequest(lsp.CodeLensRequest.type, {
      textDocument: {
        uri: test_constants_1.FOO_TEMPLATE_URI,
      },
    });
    expect(codeLensResponse).toBeDefined();
    const [codeLens] = codeLensResponse;
    expect(codeLens.data.uri).toEqual(test_constants_1.FOO_TEMPLATE_URI);
    const codeLensResolveResponse = await client.sendRequest(
      lsp.CodeLensResolveRequest.type,
      codeLensResponse[0],
    );
    expect(codeLensResolveResponse).toBeDefined();
    expect(
      (_a =
        codeLensResolveResponse === null || codeLensResolveResponse === void 0
          ? void 0
          : codeLensResolveResponse.command) === null || _a === void 0
        ? void 0
        : _a.title,
    ).toEqual('Go to component');
  });
  it('detects an Angular project', async () => {
    (0, test_utils_1.openTextDocument)(client, test_constants_1.FOO_TEMPLATE);
    const templateResponse = await client.sendRequest(requests_1.IsInAngularProject, {
      textDocument: {
        uri: test_constants_1.FOO_TEMPLATE_URI,
      },
    });
    expect(templateResponse).toBe(true);
    const componentResponse = await client.sendRequest(requests_1.IsInAngularProject, {
      textDocument: {
        uri: test_constants_1.FOO_COMPONENT_URI,
      },
    });
    expect(componentResponse).toBe(true);
  });
  describe('auto-import component', () => {
    it('should generate import in the different file', async () => {
      var _a, _b, _c;
      (0, test_utils_1.openTextDocument)(client, test_constants_1.FOO_TEMPLATE, `<bar-`);
      const response = await client.sendRequest(lsp.CompletionRequest.type, {
        textDocument: {
          uri: test_constants_1.FOO_TEMPLATE_URI,
        },
        position: {line: 0, character: 5},
      });
      const libPostResponse = response.find((res) => res.label === 'bar-component');
      const detail = await client.sendRequest(lsp.CompletionResolveRequest.type, libPostResponse);
      expect((_a = detail.command) === null || _a === void 0 ? void 0 : _a.command).toEqual(
        'angular.applyCompletionCodeAction',
      );
      expect(
        (_c = (_b = detail.command) === null || _b === void 0 ? void 0 : _b.arguments) === null ||
          _c === void 0
          ? void 0
          : _c[0],
      ).toEqual([
        {
          'changes': {
            [test_constants_1.APP_COMPONENT_MODULE_URI]: [
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
      (0, test_utils_1.openTextDocument)(client, test_constants_1.BAR_COMPONENT);
      const response = await client.sendRequest(lsp.CompletionRequest.type, {
        textDocument: {
          uri: test_constants_1.BAR_COMPONENT_URI,
        },
        position: {line: 13, character: 14},
      });
      const libPostResponse = response.find((res) => res.label === 'baz-component');
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
  let client;
  beforeEach(async () => {
    client = (0, test_utils_1.createConnection)({
      ivy: true,
      includeAutomaticOptionalChainCompletions: true,
    });
    // If debugging, set to
    // - lsp.Trace.Messages to inspect request/response/notification, or
    // - lsp.Trace.Verbose to inspect payload
    client.trace(lsp.Trace.Off, (0, test_utils_1.createTracer)());
    client.listen();
    await (0, test_utils_1.initializeServer)(client);
  });
  afterEach(() => {
    client.dispose();
  });
  it('should work on nullable symbol', async () => {
    (0, test_utils_1.openTextDocument)(
      client,
      test_constants_1.FOO_COMPONENT,
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
    (0, test_utils_1.openTextDocument)(client, test_constants_1.FOO_TEMPLATE, `{{ person.n }}`);
    const response = await client.sendRequest(lsp.CompletionRequest.type, {
      textDocument: {
        uri: test_constants_1.FOO_TEMPLATE_URI,
      },
      position: {line: 0, character: 11},
    });
    const completion = response.find((i) => i.label === 'name');
    expect(completion.kind).toEqual(lsp.CompletionItemKind.Property);
    expect(completion.textEdit.newText).toEqual('?.name');
  });
  it('should work on NonNullable symbol', async () => {
    (0, test_utils_1.openTextDocument)(client, test_constants_1.FOO_TEMPLATE, `{{ title.substr }}`);
    const response = await client.sendRequest(lsp.CompletionRequest.type, {
      textDocument: {
        uri: test_constants_1.FOO_TEMPLATE_URI,
      },
      position: {line: 0, character: 15},
    });
    const completion = response.find((i) => i.label === 'substr');
    expect(completion.kind).toEqual(lsp.CompletionItemKind.Method);
    expect(completion.textEdit.newText).toEqual('substr');
  });
});
describe('insert snippet text', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; /* 10 seconds */
  let client;
  beforeEach(async () => {
    client = (0, test_utils_1.createConnection)({
      ivy: true,
      includeCompletionsWithSnippetText: true,
    });
    // If debugging, set to
    // - lsp.Trace.Messages to inspect request/response/notification, or
    // - lsp.Trace.Verbose to inspect payload
    client.trace(lsp.Trace.Off, (0, test_utils_1.createTracer)());
    client.listen();
    await (0, test_utils_1.initializeServer)(client);
  });
  afterEach(() => {
    client.dispose();
  });
  it('should be able to complete for an attribute with the value is empty', async () => {
    (0, test_utils_1.openTextDocument)(
      client,
      test_constants_1.FOO_TEMPLATE,
      `<my-app appOut></my-app>`,
    );
    const response = await client.sendRequest(lsp.CompletionRequest.type, {
      textDocument: {
        uri: test_constants_1.FOO_TEMPLATE_URI,
      },
      position: {line: 0, character: 14},
    });
    const completion = response.find((i) => i.label === '(appOutput)');
    expect(completion.kind).toEqual(lsp.CompletionItemKind.Property);
    expect(completion.insertTextFormat).toEqual(lsp.InsertTextFormat.Snippet);
    expect(completion.textEdit.newText).toEqual('(appOutput)="$1"');
  });
  it('should not be included in the completion for an attribute with a value', async () => {
    (0, test_utils_1.openTextDocument)(
      client,
      test_constants_1.FOO_TEMPLATE,
      `<my-app [appInput]="1"></my-app>`,
    );
    const response = await client.sendRequest(lsp.CompletionRequest.type, {
      textDocument: {
        uri: test_constants_1.FOO_TEMPLATE_URI,
      },
      position: {line: 0, character: 17},
    });
    const completion = response.find((i) => i.label === 'appInput');
    expect(completion.kind).toEqual(lsp.CompletionItemKind.Property);
    expect(completion.insertTextFormat).toBeUndefined;
    expect(completion.textEdit.newText).toEqual('appInput');
  });
});
describe('code fixes', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; /* 10 seconds */
  let client;
  beforeEach(async () => {
    client = (0, test_utils_1.createConnection)({
      ivy: true,
      includeCompletionsWithSnippetText: true,
    });
    // If debugging, set to
    // - lsp.Trace.Messages to inspect request/response/notification, or
    // - lsp.Trace.Verbose to inspect payload
    client.trace(lsp.Trace.Off, (0, test_utils_1.createTracer)());
    client.listen();
    await (0, test_utils_1.initializeServer)(client);
  });
  afterEach(() => {
    client.dispose();
  });
  it('should fix error when property does not exist on type', async () => {
    (0, test_utils_1.openTextDocument)(client, test_constants_1.FOO_TEMPLATE, `{{titl}}`);
    const diags = await getDiagnosticsForFile(client, test_constants_1.FOO_TEMPLATE);
    const codeActions = await client.sendRequest(lsp.CodeActionRequest.type, {
      textDocument: {
        uri: test_constants_1.FOO_TEMPLATE_URI,
      },
      range: lsp.Range.create(lsp.Position.create(0, 3), lsp.Position.create(0, 3)),
      context: lsp.CodeActionContext.create(diags),
    });
    const expectedCodeActionInTemplate = {
      'edit': {
        'changes': {
          [test_constants_1.FOO_TEMPLATE_URI]: [
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
    (0, test_utils_1.openTextDocument)(client, test_constants_1.FOO_TEMPLATE, template);
    const diags = await getDiagnosticsForFile(client, test_constants_1.FOO_TEMPLATE);
    const codeActions = await client.sendRequest(lsp.CodeActionRequest.type, {
      textDocument: {
        uri: test_constants_1.FOO_TEMPLATE_URI,
      },
      range: lsp.Range.create(
        lsp.Position.create(0, 0),
        lsp.Position.create(0, template.length - 1),
      ),
      context: lsp.CodeActionContext.create(diags),
    });
    const expectedCodeActionInTemplate = {
      'edit': {
        'changes': {
          [test_constants_1.FOO_TEMPLATE_URI]: [
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
      (0, test_utils_1.openTextDocument)(
        client,
        test_constants_1.FOO_COMPONENT,
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
          document: lsp.TextDocumentIdentifier.create(test_constants_1.FOO_COMPONENT_URI),
        },
      });
      const expectedFixSpellingInTemplate = {
        'edit': {
          'changes': {
            [test_constants_1.FOO_COMPONENT_URI]: [
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
            document: lsp.TextDocumentIdentifier.create(test_constants_1.FOO_COMPONENT_URI),
          },
        },
      );
      const expectedFixMissingMemberInComponent = {
        'edit': {
          'changes': {
            [test_constants_1.FOO_COMPONENT_URI]: [
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
function onSuggestStrictMode(client) {
  return new Promise((resolve) => {
    client.onNotification(notifications_1.SuggestStrictMode, (params) => {
      resolve(params.configFilePath);
    });
  });
}
function getDiagnosticsForFile(client, fileName) {
  return new Promise((resolve) => {
    client.onNotification(lsp.PublishDiagnosticsNotification.type, (params) => {
      if (params.uri === (0, node_url_1.pathToFileURL)(fileName).href) {
        resolve(params.diagnostics);
      }
    });
  });
}
//# sourceMappingURL=ivy_spec.js.map
