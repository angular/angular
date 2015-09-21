import {StringWrapper, isBlank} from 'angular2/src/core/facade/lang';

var MODULE_REGEXP = /#MODULE\[([^\]]*)\]/g;

export function moduleRef(moduleId): string {
  return `#MODULE[${moduleId}]`;
}

export class SourceModule {
  constructor(public moduleId: string, public sourceWithModuleRefs: string) {}

  getSourceWithImports(): SourceWithImports {
    var moduleAliases = {};
    var imports: string[][] = [];
    var newSource =
        StringWrapper.replaceAllMapped(this.sourceWithModuleRefs, MODULE_REGEXP, (match) => {
          var moduleId = match[1];
          var alias = moduleAliases[moduleId];
          if (isBlank(alias)) {
            if (moduleId == this.moduleId) {
              alias = '';
            } else {
              alias = `import${imports.length}`;
              imports.push([moduleId, alias]);
            }
            moduleAliases[moduleId] = alias;
          }
          return alias.length > 0 ? `${alias}.` : '';
        });
    return new SourceWithImports(newSource, imports);
  }
}

export class SourceExpression {
  constructor(public declarations: string[], public expression: string) {}
}

export class SourceWithImports {
  constructor(public source: string, public imports: string[][]) {}
}
