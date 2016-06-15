import {AngularCompilerOptions} from '@angular/tsc-wrapped';
import tpl from './generated_component_resolver_template';
var ejs = require('ejs');
var path = require('path');

export function buildComponentResolverSource(options: AngularCompilerOptions):
    GeneratedComponentResolverOutput {
  var resolverOptions = options.componentResolver;

  var rootDir = options.genDir;
  var finalStr = '';
  var filePath: string = resolverOptions.out;
  var dirPrefix = path.relative(path.dirname(filePath), '.');

  var componentImports: {[key: string]: string[]} = {};
  var importPaths = resolverOptions.imports || {};
  for (var p in importPaths) {
    var cmps = importPaths[p];
    var finalPath = path.join(dirPrefix, p);
    var data: string[] = Array.isArray(cmps) ? cmps : [cmps];
    componentImports[finalPath] = data;
  }

  var templateOptions = {imports: componentImports};

  var content = ejs.render(tpl, templateOptions, {});
  return new GeneratedComponentResolverOutput(filePath, content);
}

export class GeneratedComponentResolverOutput {
  constructor(public filePath: string, public content: string) {}
}
