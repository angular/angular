import { CompileIdentifierMetadata, createHostComponentMeta } from './compile_metadata';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ListWrapper } from 'angular2/src/facade/collection';
import * as o from './output/output_ast';
import { ComponentFactory } from 'angular2/src/core/linker/component_factory';
import { MODULE_SUFFIX } from './util';
var _COMPONENT_FACTORY_IDENTIFIER = new CompileIdentifierMetadata({
    name: 'ComponentFactory',
    runtime: ComponentFactory,
    moduleUrl: `asset:angular2/lib/src/core/linker/component_factory${MODULE_SUFFIX}`
});
export class SourceModule {
    constructor(moduleUrl, source) {
        this.moduleUrl = moduleUrl;
        this.source = source;
    }
}
export class NormalizedComponentWithViewDirectives {
    constructor(component, directives, pipes) {
        this.component = component;
        this.directives = directives;
        this.pipes = pipes;
    }
}
export class OfflineCompiler {
    constructor(_directiveNormalizer, _templateParser, _styleCompiler, _viewCompiler, _outputEmitter) {
        this._directiveNormalizer = _directiveNormalizer;
        this._templateParser = _templateParser;
        this._styleCompiler = _styleCompiler;
        this._viewCompiler = _viewCompiler;
        this._outputEmitter = _outputEmitter;
    }
    normalizeDirectiveMetadata(directive) {
        return this._directiveNormalizer.normalizeDirective(directive);
    }
    compileTemplates(components) {
        if (components.length === 0) {
            throw new BaseException('No components given');
        }
        var statements = [];
        var exportedVars = [];
        var moduleUrl = _templateModuleUrl(components[0].component);
        components.forEach(componentWithDirs => {
            var compMeta = componentWithDirs.component;
            _assertComponent(compMeta);
            var compViewFactoryVar = this._compileComponent(compMeta, componentWithDirs.directives, componentWithDirs.pipes, statements);
            exportedVars.push(compViewFactoryVar);
            var hostMeta = createHostComponentMeta(compMeta.type, compMeta.selector);
            var hostViewFactoryVar = this._compileComponent(hostMeta, [compMeta], [], statements);
            var compFactoryVar = `${compMeta.type.name}NgFactory`;
            statements.push(o.variable(compFactoryVar)
                .set(o.importExpr(_COMPONENT_FACTORY_IDENTIFIER, [o.importType(compMeta.type)])
                .instantiate([
                o.literal(compMeta.selector),
                o.variable(hostViewFactoryVar),
                o.importExpr(compMeta.type)
            ], o.importType(_COMPONENT_FACTORY_IDENTIFIER, [o.importType(compMeta.type)], [o.TypeModifier.Const])))
                .toDeclStmt(null, [o.StmtModifier.Final]));
            exportedVars.push(compFactoryVar);
        });
        return this._codegenSourceModule(moduleUrl, statements, exportedVars);
    }
    compileStylesheet(stylesheetUrl, cssText) {
        var plainStyles = this._styleCompiler.compileStylesheet(stylesheetUrl, cssText, false);
        var shimStyles = this._styleCompiler.compileStylesheet(stylesheetUrl, cssText, true);
        return [
            this._codegenSourceModule(_stylesModuleUrl(stylesheetUrl, false), _resolveStyleStatements(plainStyles), [plainStyles.stylesVar]),
            this._codegenSourceModule(_stylesModuleUrl(stylesheetUrl, true), _resolveStyleStatements(shimStyles), [shimStyles.stylesVar])
        ];
    }
    _compileComponent(compMeta, directives, pipes, targetStatements) {
        var styleResult = this._styleCompiler.compileComponent(compMeta);
        var parsedTemplate = this._templateParser.parse(compMeta, compMeta.template.template, directives, pipes, compMeta.type.name);
        var viewResult = this._viewCompiler.compileComponent(compMeta, parsedTemplate, o.variable(styleResult.stylesVar), pipes);
        ListWrapper.addAll(targetStatements, _resolveStyleStatements(styleResult));
        ListWrapper.addAll(targetStatements, _resolveViewStatements(viewResult));
        return viewResult.viewFactoryVar;
    }
    _codegenSourceModule(moduleUrl, statements, exportedVars) {
        return new SourceModule(moduleUrl, this._outputEmitter.emitStatements(moduleUrl, statements, exportedVars));
    }
}
function _resolveViewStatements(compileResult) {
    compileResult.dependencies.forEach((dep) => { dep.factoryPlaceholder.moduleUrl = _templateModuleUrl(dep.comp); });
    return compileResult.statements;
}
function _resolveStyleStatements(compileResult) {
    compileResult.dependencies.forEach((dep) => {
        dep.valuePlaceholder.moduleUrl = _stylesModuleUrl(dep.sourceUrl, dep.isShimmed);
    });
    return compileResult.statements;
}
function _templateModuleUrl(comp) {
    var moduleUrl = comp.type.moduleUrl;
    var urlWithoutSuffix = moduleUrl.substring(0, moduleUrl.length - MODULE_SUFFIX.length);
    return `${urlWithoutSuffix}.ngfactory${MODULE_SUFFIX}`;
}
function _stylesModuleUrl(stylesheetUrl, shim) {
    return shim ? `${stylesheetUrl}.shim${MODULE_SUFFIX}` : `${stylesheetUrl}${MODULE_SUFFIX}`;
}
function _assertComponent(meta) {
    if (!meta.isComponent) {
        throw new BaseException(`Could not compile '${meta.type.name}' because it is not a component.`);
    }
}
