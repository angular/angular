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
Object.defineProperty(exports, '__esModule', {value: true});
exports.TcbContentProvider = exports.ANGULAR_SCHEME = void 0;
const vscode = __importStar(require('vscode'));
exports.ANGULAR_SCHEME = 'ng';
/**
 * Allocate a provider of documents corresponding to the `ng` URI scheme,
 * which we will use to provide a virtual document with the TCB contents.
 *
 * We use a virtual document provider rather than opening an untitled file to
 * ensure the buffer remains readonly (https://github.com/microsoft/vscode/issues/4873).
 */
class TcbContentProvider {
  constructor() {
    /**
     * Event emitter used to notify VSCode of a change to the TCB virtual document,
     * prompting it to re-evaluate the document content. This is needed to bust
     * VSCode's document cache if someone requests a TCB that was previously opened.
     * https://code.visualstudio.com/api/extension-guides/virtual-documents#update-virtual-documents
     */
    this.onDidChangeEmitter = new vscode.EventEmitter();
    /**
     * Name of the typecheck file.
     */
    this.tcbFile = null;
    /**
     * Content of the entire typecheck file.
     */
    this.tcbContent = null;
    /**
     * This callback is invoked only when user explicitly requests to view or
     * update typecheck file. We do not automatically update the typecheck document
     * when the source file changes.
     */
    this.onDidChange = this.onDidChangeEmitter.event;
  }
  provideTextDocumentContent(uri, token) {
    var _a;
    if (
      uri.toString() !== ((_a = this.tcbFile) === null || _a === void 0 ? void 0 : _a.toString())
    ) {
      return null;
    }
    return this.tcbContent;
  }
  update(uri, content) {
    this.tcbFile = uri;
    this.tcbContent = content;
    this.onDidChangeEmitter.fire(uri);
  }
  clear() {
    this.tcbFile = null;
    this.tcbContent = null;
  }
}
exports.TcbContentProvider = TcbContentProvider;
//# sourceMappingURL=providers.js.map
