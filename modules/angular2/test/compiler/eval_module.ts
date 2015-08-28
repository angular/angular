import {Promise, PromiseWrapper} from 'angular2/src/core/facade/async';
import {isPresent, global} from 'angular2/src/core/facade/lang';

var evalCounter = 0;

function nextModuleName() {
  return `evalScript${evalCounter++}`;
}

export function evalModule(moduleSource: string, moduleImports: string[][], args: any[]):
    Promise<any> {
  var moduleName = nextModuleName();
  var moduleSourceWithImports = [];
  var importModuleNames = [];
  moduleImports.forEach(sourceImport => {
    var modName = sourceImport[0];
    var modAlias = sourceImport[1];
    importModuleNames.push(modName);
    moduleSourceWithImports.push(`var ${modAlias} = require('${modName}');`);
  });
  moduleSourceWithImports.push(moduleSource);

  var moduleBody = new Function('require', 'exports', 'module', moduleSourceWithImports.join('\n'));
  var System = global['System'];
  if (isPresent(System) && isPresent(System.registerDynamic)) {
    System.registerDynamic(moduleName, importModuleNames, false, moduleBody);
    return <Promise<any>>System.import(moduleName).then((module) => module.run(args));
  } else {
    var exports = {};
    moduleBody(require, exports, {});
    return PromiseWrapper.resolve(exports['run'](args));
  }
}
