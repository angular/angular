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
exports.FOO_TEMPLATE_URI =
  exports.APP_COMPONENT_URI =
  exports.DEFINITION_COMMAND =
  exports.HOVER_COMMAND =
  exports.COMPLETION_COMMAND =
    void 0;
exports.activate = activate;
const vscode = __importStar(require('vscode'));
const test_constants_1 = require('../test_constants');
exports.COMPLETION_COMMAND = 'vscode.executeCompletionItemProvider';
exports.HOVER_COMMAND = 'vscode.executeHoverProvider';
exports.DEFINITION_COMMAND = 'vscode.executeDefinitionProvider';
exports.APP_COMPONENT_URI = vscode.Uri.file(test_constants_1.APP_COMPONENT);
exports.FOO_TEMPLATE_URI = vscode.Uri.file(test_constants_1.FOO_TEMPLATE);
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function activate(uri) {
  // set default timeout to 30 seconds
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
  await vscode.window.showTextDocument(uri);
  await waitForDefinitionsToBeAvailable(20);
}
async function waitForDefinitionsToBeAvailable(maxSeconds) {
  let tries = 0;
  while (tries < maxSeconds) {
    const position = new vscode.Position(4, 25);
    // For a complete list of standard commands, see
    // https://code.visualstudio.com/api/references/commands
    const definitions = await vscode.commands.executeCommand(
      exports.DEFINITION_COMMAND,
      exports.APP_COMPONENT_URI,
      position,
    );
    if (definitions && definitions.length > 0) {
      return;
    }
    tries++;
    await sleep(1000);
  }
}
//# sourceMappingURL=helper.js.map
