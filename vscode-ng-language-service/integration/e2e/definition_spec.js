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
const test_constants_1 = require('../test_constants');
const helper_1 = require('./helper');
const DEFINITION_COMMAND = 'vscode.executeDefinitionProvider';
const APP_COMPONENT_URI = vscode.Uri.file(test_constants_1.APP_COMPONENT);
describe('Angular Ivy LS', () => {
  beforeAll(async () => {
    await (0, helper_1.activate)(APP_COMPONENT_URI);
  }, 25000 /* 25 seconds */);
  it(`returns definition for variable in template`, async () => {
    // vscode Position is zero-based
    //   template: `<h1>Hello {{name}}</h1>`,
    //                          ^-------- here
    const position = new vscode.Position(4, 25);
    // For a complete list of standard commands, see
    // https://code.visualstudio.com/api/references/commands
    const definitions = await vscode.commands.executeCommand(
      DEFINITION_COMMAND,
      APP_COMPONENT_URI,
      position,
    );
    expect(definitions === null || definitions === void 0 ? void 0 : definitions.length).toBe(1);
    const def = definitions[0];
    expect(def.targetUri.fsPath).toBe(test_constants_1.APP_COMPONENT); // in the same document
    const {start, end} = def.targetRange;
    // Should start and end on line 6
    expect(start.line).toBe(7);
    expect(end.line).toBe(7);
    expect(start.character).toBe(2);
    expect(end.character).toBe(start.character + `name`.length);
  });
});
//# sourceMappingURL=definition_spec.js.map
