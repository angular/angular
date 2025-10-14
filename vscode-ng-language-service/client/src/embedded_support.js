'use strict';
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
exports.isNotTypescriptOrSupportedDecoratorField = isNotTypescriptOrSupportedDecoratorField;
exports.isInsideStringLiteral = isInsideStringLiteral;
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const ts = __importStar(require('typescript'));
const ANGULAR_PROPERTY_ASSIGNMENTS = new Set([
  'template',
  'templateUrl',
  'styleUrls',
  'styleUrl',
  'host',
]);
/**
 * Determines if the position is inside a decorator
 * property that supports language service features.
 */
function isNotTypescriptOrSupportedDecoratorField(document, position) {
  if (document.languageId !== 'typescript') {
    return true;
  }
  return isPropertyAssignmentToStringOrStringInArray(
    document.getText(),
    document.offsetAt(position),
    ANGULAR_PROPERTY_ASSIGNMENTS,
  );
}
/**
 * Determines if the position is inside a string literal. Returns `true` if the document language is
 * not TypeScript.
 */
function isInsideStringLiteral(document, position) {
  if (document.languageId !== 'typescript') {
    return true;
  }
  const offset = document.offsetAt(position);
  const scanner = ts.createScanner(ts.ScriptTarget.ESNext, true /* skipTrivia */);
  scanner.setText(document.getText());
  let token = scanner.scan();
  while (token !== ts.SyntaxKind.EndOfFileToken && scanner.getStartPos() < offset) {
    const isStringToken =
      token === ts.SyntaxKind.StringLiteral ||
      token === ts.SyntaxKind.NoSubstitutionTemplateLiteral;
    const isCursorInToken =
      scanner.getStartPos() <= offset &&
      scanner.getStartPos() + scanner.getTokenText().length >= offset;
    if (isCursorInToken && isStringToken) {
      return true;
    }
    token = scanner.scan();
  }
  return false;
}
/**
 * Basic scanner to determine if we're inside a string of a property with one of the given names.
 *
 * This scanner is not currently robust or perfect but provides us with an accurate answer _most_ of
 * the time.
 *
 * False positives are OK here. Though this will give some false positives for determining if a
 * position is within an Angular context, i.e. an object like `{template: ''}` that is not inside an
 * `@Component` or `{styleUrls: [someFunction('stringL¦iteral')]}`, the @angular/language-service
 * will always give us the correct answer. This helper gives us a quick win for optimizing the
 * number of requests we send to the server.
 *
 * TODO(atscott): tagged templates don't work: #1872 /
 * https://github.com/Microsoft/TypeScript/issues/20055
 */
function isPropertyAssignmentToStringOrStringInArray(
  documentText,
  offset,
  propertyAssignmentNames,
) {
  const scanner = ts.createScanner(ts.ScriptTarget.ESNext, true /* skipTrivia */);
  scanner.setText(documentText);
  let token = scanner.scan();
  let lastToken;
  let lastTokenText;
  let unclosedBraces = 0;
  let unclosedBrackets = 0;
  let propertyAssignmentContext = false;
  while (token !== ts.SyntaxKind.EndOfFileToken && scanner.getStartPos() < offset) {
    if (
      lastToken === ts.SyntaxKind.Identifier &&
      lastTokenText !== undefined &&
      token === ts.SyntaxKind.ColonToken &&
      propertyAssignmentNames.has(lastTokenText)
    ) {
      propertyAssignmentContext = true;
      token = scanner.scan();
      continue;
    }
    if (unclosedBraces === 0 && unclosedBrackets === 0 && isPropertyAssignmentTerminator(token)) {
      propertyAssignmentContext = false;
    }
    if (token === ts.SyntaxKind.OpenBracketToken) {
      unclosedBrackets++;
    } else if (token === ts.SyntaxKind.OpenBraceToken) {
      unclosedBraces++;
    } else if (token === ts.SyntaxKind.CloseBracketToken) {
      unclosedBrackets--;
    } else if (token === ts.SyntaxKind.CloseBraceToken) {
      unclosedBraces--;
    }
    const isStringToken =
      token === ts.SyntaxKind.StringLiteral ||
      token === ts.SyntaxKind.NoSubstitutionTemplateLiteral;
    const isCursorInToken =
      scanner.getStartPos() <= offset &&
      scanner.getStartPos() + scanner.getTokenText().length >= offset;
    if (propertyAssignmentContext && isCursorInToken && isStringToken) {
      return true;
    }
    lastTokenText = scanner.getTokenText();
    lastToken = token;
    token = scanner.scan();
  }
  return false;
}
function isPropertyAssignmentTerminator(token) {
  return (
    token === ts.SyntaxKind.EndOfFileToken ||
    token === ts.SyntaxKind.CommaToken ||
    token === ts.SyntaxKind.SemicolonToken ||
    token === ts.SyntaxKind.CloseBraceToken
  );
}
//# sourceMappingURL=embedded_support.js.map
