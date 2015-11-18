import { StringWrapper, isBlank } from 'angular2/src/facade/lang';
var MODULE_REGEXP = /#MODULE\[([^\]]*)\]/g;
export function moduleRef(moduleUrl) {
    return `#MODULE[${moduleUrl}]`;
}
export class SourceModule {
    constructor(moduleUrl, sourceWithModuleRefs) {
        this.moduleUrl = moduleUrl;
        this.sourceWithModuleRefs = sourceWithModuleRefs;
    }
    getSourceWithImports() {
        var moduleAliases = {};
        var imports = [];
        var newSource = StringWrapper.replaceAllMapped(this.sourceWithModuleRefs, MODULE_REGEXP, (match) => {
            var moduleUrl = match[1];
            var alias = moduleAliases[moduleUrl];
            if (isBlank(alias)) {
                if (moduleUrl == this.moduleUrl) {
                    alias = '';
                }
                else {
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
    constructor(declarations, expression) {
        this.declarations = declarations;
        this.expression = expression;
    }
}
export class SourceExpressions {
    constructor(declarations, expressions) {
        this.declarations = declarations;
        this.expressions = expressions;
    }
}
export class SourceWithImports {
    constructor(source, imports) {
        this.source = source;
        this.imports = imports;
    }
}
//# sourceMappingURL=source_module.js.map