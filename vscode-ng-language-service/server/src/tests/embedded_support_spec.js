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
const ts = __importStar(require('typescript'));
const embedded_support_1 = require('../embedded_support');
function assertEmbeddedHTMLContent(value, expectedContent) {
  const sf = ts.createSourceFile('temp', value, ts.ScriptTarget.ESNext, true /* setParentNodes */);
  const virtualContent = (0, embedded_support_1.getHTMLVirtualContent)(sf);
  expect(virtualContent).toEqual(expectedContent);
}
describe('server embedded support', () => {
  it('strips everything but the template string literal', () => {
    assertEmbeddedHTMLContent(
      `@Component({template: 'abc123'}) export class MyCmp`,
      `                       abc123                      `,
    );
  });
  it('can locate multiple template literals', () => {
    assertEmbeddedHTMLContent(
      `@Component({template: 'abc123'}) @Component({template: 'xyz789'})`,
      `                       abc123                           xyz789   `,
    );
  });
  it('works as expected for CRLF', () => {
    assertEmbeddedHTMLContent(
      `@Component({template: 'abc123'})\r\nexport class MyComponent {}`,
      `                       abc123   \ \n                           `,
    );
    // Note that the \r is replaced with a whitespace. As long as we preserve the same document
    // length and line break locations, our results will be just fine. It doesn't matter that we
    // have an extra whitespace character at the end of the line for folding ranges.
  });
});
//# sourceMappingURL=embedded_support_spec.js.map
