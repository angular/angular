import {Promise, PromiseWrapper} from 'angular2/src/core/facade/async';
import {isPresent, global, StringWrapper} from 'angular2/src/core/facade/lang';

var evalCounter = 0;
var MODULE_URL_REGEX = /^package:(.*)\.js/;

function nextModuleId() {
  return `evalScript${evalCounter++}`;
}

export function evalModule(moduleSource: string, imports: string[][], args: any[]): Promise<any> {
  var moduleId = nextModuleId();
  var moduleSourceWithImports = [];
  var importModuleIds = [];
  imports.forEach(sourceImport => {
    var modUrl = sourceImport[0];
    var modMatch = MODULE_URL_REGEX.exec(modUrl);
    if (!modMatch) {
      throw new Error(`Module url ${modUrl} does not match the pattern ${MODULE_URL_REGEX}`);
    }
    var modId = modMatch[1];

    var modAlias = sourceImport[1];
    importModuleIds.push(modId);
    // Note: After transpilation to commonJS and loading this file in a browser
    // using SystemJS, the loader might get confused by the presence of require,
    // and attempt to load "+ modName +.js" !?!
    // A simple string concat manages to prevent that, but that is one compiler
    // optimaztion away from breaking again. Proceed with caution!
    moduleSourceWithImports.push(`var ${modAlias} = require` + `('${modId}');`);
  });
  moduleSourceWithImports.push(moduleSource);

  var moduleBody = new Function('require', 'exports', 'module', moduleSourceWithImports.join('\n'));
  var System = global['System'];
  if (isPresent(System) && isPresent(System.registerDynamic)) {
    System.registerDynamic(moduleId, importModuleIds, false, moduleBody);
    return <Promise<any>>System.import(moduleId).then((module) => module.run(args));
  } else {
    var exports = {};
    moduleBody(require, exports, {});
    return PromiseWrapper.resolve(exports['run'](args));
  }
}
