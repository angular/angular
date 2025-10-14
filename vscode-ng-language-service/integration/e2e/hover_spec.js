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
const vscode = __importStar(require('vscode'));
const helper_1 = require('./helper');
// This hover tests appear to be the only flaky ones in the suite. Disable until they can
// consistently pass.
xdescribe('Angular Ivy LS quick info', () => {
  beforeAll(async () => {
    await (0, helper_1.activate)(helper_1.FOO_TEMPLATE_URI);
  });
  it(`returns quick info from built in extension for class in template`, async () => {
    const position = new vscode.Position(1, 8);
    const quickInfo = await vscode.commands.executeCommand(
      helper_1.HOVER_COMMAND,
      helper_1.FOO_TEMPLATE_URI,
      position,
    );
    expect(quickInfo === null || quickInfo === void 0 ? void 0 : quickInfo.length).toBe(1);
  });
});
//# sourceMappingURL=hover_spec.js.map
