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
describe('Angular Ivy LS completions', () => {
  beforeAll(async () => {
    await (0, helper_1.activate)(helper_1.FOO_TEMPLATE_URI);
  });
  it(`does not duplicate HTML completions in external templates`, async () => {
    var _a, _b;
    const position = new vscode.Position(0, 0);
    const completionItem = await vscode.commands.executeCommand(
      helper_1.COMPLETION_COMMAND,
      helper_1.FOO_TEMPLATE_URI,
      position,
    );
    const regionCompletions =
      (_b =
        (_a =
          completionItem === null || completionItem === void 0 ? void 0 : completionItem.items) ===
          null || _a === void 0
          ? void 0
          : _a.filter((i) => i.label === '#region')) !== null && _b !== void 0
        ? _b
        : [];
    expect(regionCompletions.length).toBe(1);
  });
});
//# sourceMappingURL=completion_spec.js.map
