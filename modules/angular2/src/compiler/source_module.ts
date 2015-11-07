import {StringWrapper, isBlank} from 'angular2/src/facade/lang';

var MODULE_REGEXP = /#MODULE\[([^\]]*)\]/g;

export function moduleRef(moduleUrl): string {
  return `#MODULE[${moduleUrl}]`;
}

export class SourceModule {
  constructor(public moduleUrl: string, public sourceWithModuleRefs: string) {}

  getSourceWithImports(): SourceWithImports {
    var moduleAliases = {};
    var imports: string[][] = [];
    var newSource =
        StringWrapper.replaceAllMapped(this.sourceWithModuleRefs, MODULE_REGEXP, (match) => {
          var moduleUrl = match[1];
          var alias = moduleAliases[moduleUrl];
          if (isBlank(alias)) {
            if (moduleUrl == this.moduleUrl) {
              alias = '';
            } else {
              alias = `import${imports.length}`;
              imports.push([moduleUrl, alias]);
            }
            moduleAliases[moduleUrl] = alias;
          }
          return alias.length > 0 ? `${alias}.` : '';
        });
    return new SourceWithImports(newSource, imports);
  }
}

export class SourceExpression {
  constructor(public declarations: string[], public expression: string) {}
}

export class SourceExpressions {
  constructor(public declarations: string[], public expressions: string[]) {}
}

export class SourceWithImports {
  constructor(public source: string, public imports: string[][]) {}
}
