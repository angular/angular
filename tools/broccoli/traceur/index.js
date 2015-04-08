var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var traceur = require('../../transpiler');
var walkSync = require('walk-sync');
var Writer = require('broccoli-writer');
var xtend = require('xtend');
var TraceurFilter = (function (_super) {
    __extends(TraceurFilter, _super);
    function TraceurFilter(inputTree, destExtension, options) {
        if (destExtension === void 0) { destExtension = '.js'; }
        if (options === void 0) { options = {}; }
        this.inputTree = inputTree;
        this.destExtension = destExtension;
        this.options = options;
    }
    TraceurFilter.prototype.write = function (readTree, destDir) {
        var _this = this;
        return readTree(this.inputTree).then(function (srcDir) {
            walkSync(srcDir).filter(function (filepath) {
                var extension = path.extname(filepath).toLowerCase();
                return extension === '.js' || extension === '.es6';
            }).map(function (filepath) {
                var options = xtend({
                    filename: filepath
                }, _this.options);
                var fsOpts = {
                    encoding: 'utf-8'
                };
                var sourcecode = fs.readFileSync(path.join(srcDir, filepath), fsOpts);
                var result = traceur.compile(options, filepath, sourcecode);
                // TODO: we should fix the sourceMappingURL written by Traceur instead of overriding
                // (but we might switch to typescript first)
                result.js = result.js + '\n//# sourceMappingURL=./' + path.basename(filepath).replace(/\.es6$/, '') + (_this.destExtension === '.js' ? '.js.map' : '.map');
                var destFilepath = filepath.replace(/\.\w+$/, _this.destExtension);
                var destFile = path.join(destDir, destFilepath);
                fse.mkdirsSync(path.dirname(destFile));
                var destMap = path.join(destDir, filepath + '.map');
                fs.writeFileSync(destFile, result.js, fsOpts);
                result.sourceMap.file = destFilepath;
                fs.writeFileSync(destMap, JSON.stringify(result.sourceMap), fsOpts);
            });
        });
    };
    TraceurFilter.RUNTIME_PATH = traceur.RUNTIME_PATH;
    return TraceurFilter;
})(Writer);
module.exports = TraceurFilter;
//# sourceMappingURL=index.js.map