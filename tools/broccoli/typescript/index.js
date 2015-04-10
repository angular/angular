var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var fs = require('fs');
var path = require('path');
var ts = require('typescript');
var walkSync = require('walk-sync');
var Writer = require('broccoli-writer');
var xtend = require('xtend');
var TSCompiler = (function (_super) {
    __extends(TSCompiler, _super);
    function TSCompiler(inputTree, options) {
        if (options === void 0) { options = {}; }
        _super.call(this, inputTree, options);
        this.inputTree = inputTree;
        this.options = options;
    }
    TSCompiler.prototype.write = function (readTree, destDir) {
        var options = xtend({
            outDir: destDir
        }, this.options);
        if (this.options.outDir) {
            options.outDir = path.resolve(destDir, options.outDir);
        }
        if (options.out) {
            options.out = path.resolve(destDir, options.out);
        }
        options.target = ts.ScriptTarget[options.target];
        return readTree(this.inputTree).then(function (srcDir) {
            var files = walkSync(srcDir).filter(function (filepath) {
                return path.extname(filepath).toLowerCase() === '.ts';
            }).map(function (filepath) {
                return path.resolve(srcDir, filepath);
            });
            if (files.length > 0) {
                var program = ts.createProgram(files, options);
                var emitResult = program.emit();
                var allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
                var errMsg = '';
                allDiagnostics.forEach(function (diagnostic) {
                    var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
                    if (!diagnostic.file) {
                        errMsg += "\n" + message;
                        return;
                    }
                    var _a = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start), line = _a.line, character = _a.character;
                    errMsg += "\n" + diagnostic.file.fileName + " (" + (line + 1) + "," + (character + 1) + "): " + message;
                });
                if (emitResult.emitSkipped) {
                    throw new Error(errMsg);
                }
            }
        });
    };
    return TSCompiler;
})(Writer);
module.exports = TSCompiler;
//# sourceMappingURL=index.js.map