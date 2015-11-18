var async_1 = require('angular2/src/facade/async');
var lang_1 = require('angular2/src/facade/lang');
var evalCounter = 0;
var MODULE_URL_REGEX = /^package:(.*)\.js/;
function nextModuleId() {
    return "evalScript" + evalCounter++;
}
function evalModule(moduleSource, imports, args) {
    var moduleId = nextModuleId();
    var moduleSourceWithImports = [];
    var importModuleIds = [];
    imports.forEach(function (sourceImport) {
        var modUrl = sourceImport[0];
        var modMatch = MODULE_URL_REGEX.exec(modUrl);
        if (!modMatch) {
            throw new Error("Module url " + modUrl + " does not match the pattern " + MODULE_URL_REGEX);
        }
        var modId = modMatch[1];
        var modAlias = sourceImport[1];
        importModuleIds.push(modId);
        // Note: After transpilation to commonJS and loading this file in a browser
        // using SystemJS, the loader might get confused by the presence of require,
        // and attempt to load "+ modName +.js" !?!
        // A simple string concat manages to prevent that, but that is one compiler
        // optimaztion away from breaking again. Proceed with caution!
        moduleSourceWithImports.push(("var " + modAlias + " = require") + ("('" + modId + "');"));
    });
    moduleSourceWithImports.push(moduleSource);
    var moduleBody = new Function('require', 'exports', 'module', moduleSourceWithImports.join('\n'));
    var System = lang_1.global['System'];
    if (lang_1.isPresent(System) && lang_1.isPresent(System.registerDynamic)) {
        System.registerDynamic(moduleId, importModuleIds, false, moduleBody);
        return System.import(moduleId).then(function (module) { return module.run(args); });
    }
    else {
        var exports = {};
        moduleBody(require, exports, {});
        return async_1.PromiseWrapper.resolve(exports['run'](args));
    }
}
exports.evalModule = evalModule;
//# sourceMappingURL=eval_module.js.map