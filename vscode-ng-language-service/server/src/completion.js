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
exports.readNgCompletionData = readNgCompletionData;
exports.tsCompletionEntryToLspCompletionItem = tsCompletionEntryToLspCompletionItem;
const lsp = __importStar(require('vscode-languageserver'));
const utils_1 = require('./utils');
// TODO: Move this to `@angular/language-service`.
var CompletionKind;
(function (CompletionKind) {
  CompletionKind['attribute'] = 'attribute';
  CompletionKind['block'] = 'block';
  CompletionKind['htmlAttribute'] = 'html attribute';
  CompletionKind['property'] = 'property';
  CompletionKind['component'] = 'component';
  CompletionKind['directive'] = 'directive';
  CompletionKind['element'] = 'element';
  CompletionKind['event'] = 'event';
  CompletionKind['key'] = 'key';
  CompletionKind['method'] = 'method';
  CompletionKind['pipe'] = 'pipe';
  CompletionKind['type'] = 'type';
  CompletionKind['reference'] = 'reference';
  CompletionKind['variable'] = 'variable';
  CompletionKind['entity'] = 'entity';
})(CompletionKind || (CompletionKind = {}));
/**
 * Extract `NgCompletionOriginData` from an `lsp.CompletionItem` if present.
 */
function readNgCompletionData(item) {
  if (item.data === undefined) {
    return null;
  }
  // Validate that `item.data.kind` is actually the right tag, and narrow its type in the process.
  const data = item.data;
  if (data.kind !== 'ngCompletionOriginData') {
    return null;
  }
  return data;
}
/**
 * Convert Angular's CompletionKind to LSP CompletionItemKind.
 * @param kind Angular's CompletionKind
 */
function ngCompletionKindToLspCompletionItemKind(kind) {
  switch (kind) {
    case CompletionKind.attribute:
    case CompletionKind.htmlAttribute:
    case CompletionKind.property:
    case CompletionKind.event:
      return lsp.CompletionItemKind.Property;
    case CompletionKind.directive:
    case CompletionKind.component:
    case CompletionKind.element:
    case CompletionKind.key:
      return lsp.CompletionItemKind.Class;
    case CompletionKind.method:
      return lsp.CompletionItemKind.Method;
    case CompletionKind.pipe:
      return lsp.CompletionItemKind.Function;
    case CompletionKind.type:
      return lsp.CompletionItemKind.Interface;
    case CompletionKind.reference:
    case CompletionKind.variable:
      return lsp.CompletionItemKind.Variable;
    case CompletionKind.block:
      return lsp.CompletionItemKind.Keyword;
    case CompletionKind.entity:
    default:
      return lsp.CompletionItemKind.Text;
  }
}
/**
 * Convert ts.CompletionEntry to LSP Completion Item.
 * @param entry completion entry
 * @param position position where completion is requested.
 * @param scriptInfo
 */
function tsCompletionEntryToLspCompletionItem(entry, position, scriptInfo) {
  const item = lsp.CompletionItem.create(entry.name);
  // Even though `entry.kind` is typed as ts.ScriptElementKind, it's
  // really Angular's CompletionKind. This is because ts.ScriptElementKind does
  // not sufficiently capture the HTML entities.
  // This is a limitation of being a tsserver plugin.
  const kind = entry.kind;
  item.kind = ngCompletionKindToLspCompletionItemKind(kind);
  item.detail = entry.kind;
  item.sortText = entry.sortText;
  // Text that actually gets inserted to the document. It could be different
  // from 'entry.name'. For example, a method name could be 'greet', but the
  // insertText is 'greet()'.
  const insertText = entry.insertText || entry.name;
  item.textEdit = createTextEdit(scriptInfo, entry, position, insertText);
  // If the user enables the config `includeAutomaticOptionalChainCompletions`, the `insertText`
  // range will include the dot. the `insertText` should be assigned to the `filterText` to filter
  // the completion items.
  item.filterText = entry.insertText;
  if (entry.isSnippet) {
    item.insertTextFormat = lsp.InsertTextFormat.Snippet;
  }
  item.data = {
    kind: 'ngCompletionOriginData',
    filePath: scriptInfo.fileName,
    position,
    tsData: entry.data,
  };
  return item;
}
function createTextEdit(scriptInfo, entry, position, insertText) {
  if (entry.replacementSpan === undefined) {
    return lsp.TextEdit.insert(position, insertText);
  } else {
    /**
     * The Angular Language Service does not return `InsertReplaceEdit`.
     * There is no need to allow the developer to choose how to insert the completion.
     *
     * For example, `<button (c|) />`.
     *                       ^^__________Insert edit
     *                       ^^ ^________Replace edit
     *
     * If the LS returns the `InsertReplaceEdit` as shown above, selecting "Insert" by the developer
     * results in `(click)="")`, and selecting "Replace" results in `(click)=""`.
     *
     * Now in the vscode, the default `editor.suggest.insertMode` value for HTML is `Replace`, for
     * ts is `Insert`, So this leads to a bug in the ts file.
     *
     * Fixes https://github.com/angular/vscode-ng-language-service/issues/2137
     */
    return lsp.TextEdit.replace(
      (0, utils_1.tsTextSpanToLspRange)(scriptInfo, entry.replacementSpan),
      insertText,
    );
  }
}
//# sourceMappingURL=completion.js.map
