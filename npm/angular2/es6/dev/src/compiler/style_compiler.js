var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { CompileIdentifierMetadata } from './compile_metadata';
import * as o from './output/output_ast';
import { ViewEncapsulation } from 'angular2/src/core/metadata/view';
import { ShadowCss } from 'angular2/src/compiler/shadow_css';
import { UrlResolver } from 'angular2/src/compiler/url_resolver';
import { extractStyleUrls } from './style_url_resolver';
import { Injectable } from 'angular2/src/core/di';
import { isPresent } from 'angular2/src/facade/lang';
const COMPONENT_VARIABLE = '%COMP%';
const HOST_ATTR = `_nghost-${COMPONENT_VARIABLE}`;
const CONTENT_ATTR = `_ngcontent-${COMPONENT_VARIABLE}`;
export class StylesCompileDependency {
    constructor(sourceUrl, isShimmed, valuePlaceholder) {
        this.sourceUrl = sourceUrl;
        this.isShimmed = isShimmed;
        this.valuePlaceholder = valuePlaceholder;
    }
}
export class StylesCompileResult {
    constructor(statements, stylesVar, dependencies) {
        this.statements = statements;
        this.stylesVar = stylesVar;
        this.dependencies = dependencies;
    }
}
export let StyleCompiler = class StyleCompiler {
    constructor(_urlResolver) {
        this._urlResolver = _urlResolver;
        this._shadowCss = new ShadowCss();
    }
    compileComponent(comp) {
        var shim = comp.template.encapsulation === ViewEncapsulation.Emulated;
        return this._compileStyles(getStylesVarName(comp), comp.template.styles, comp.template.styleUrls, shim);
    }
    compileStylesheet(stylesheetUrl, cssText, isShimmed) {
        var styleWithImports = extractStyleUrls(this._urlResolver, stylesheetUrl, cssText);
        return this._compileStyles(getStylesVarName(null), [styleWithImports.style], styleWithImports.styleUrls, isShimmed);
    }
    _compileStyles(stylesVar, plainStyles, absUrls, shim) {
        var styleExpressions = plainStyles.map(plainStyle => o.literal(this._shimIfNeeded(plainStyle, shim)));
        var dependencies = [];
        for (var i = 0; i < absUrls.length; i++) {
            var identifier = new CompileIdentifierMetadata({ name: getStylesVarName(null) });
            dependencies.push(new StylesCompileDependency(absUrls[i], shim, identifier));
            styleExpressions.push(new o.ExternalExpr(identifier));
        }
        // styles variable contains plain strings and arrays of other styles arrays (recursive),
        // so we set its type to dynamic.
        var stmt = o.variable(stylesVar)
            .set(o.literalArr(styleExpressions, new o.ArrayType(o.DYNAMIC_TYPE, [o.TypeModifier.Const])))
            .toDeclStmt(null, [o.StmtModifier.Final]);
        return new StylesCompileResult([stmt], stylesVar, dependencies);
    }
    _shimIfNeeded(style, shim) {
        return shim ? this._shadowCss.shimCssText(style, CONTENT_ATTR, HOST_ATTR) : style;
    }
};
StyleCompiler = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [UrlResolver])
], StyleCompiler);
function getStylesVarName(component) {
    var result = `styles`;
    if (isPresent(component)) {
        result += `_${component.type.name}`;
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVfY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9zcmMvY29tcGlsZXIvc3R5bGVfY29tcGlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFFTCx5QkFBeUIsRUFFMUIsTUFBTSxvQkFBb0I7T0FDcEIsS0FBSyxDQUFDLE1BQU0scUJBQXFCO09BQ2pDLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxpQ0FBaUM7T0FDMUQsRUFBQyxTQUFTLEVBQUMsTUFBTSxrQ0FBa0M7T0FDbkQsRUFBQyxXQUFXLEVBQUMsTUFBTSxvQ0FBb0M7T0FDdkQsRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQjtPQUM5QyxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtPQUN4QyxFQUFDLFNBQVMsRUFBQyxNQUFNLDBCQUEwQjtBQUVsRCxNQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQztBQUNwQyxNQUFNLFNBQVMsR0FBc0IsV0FBVyxrQkFBa0IsRUFBRSxDQUFDO0FBQ3JFLE1BQU0sWUFBWSxHQUFzQixjQUFjLGtCQUFrQixFQUFFLENBQUM7QUFFM0U7SUFDRSxZQUFtQixTQUFpQixFQUFTLFNBQWtCLEVBQzVDLGdCQUEyQztRQUQzQyxjQUFTLEdBQVQsU0FBUyxDQUFRO1FBQVMsY0FBUyxHQUFULFNBQVMsQ0FBUztRQUM1QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQTJCO0lBQUcsQ0FBQztBQUNwRSxDQUFDO0FBRUQ7SUFDRSxZQUFtQixVQUF5QixFQUFTLFNBQWlCLEVBQ25ELFlBQXVDO1FBRHZDLGVBQVUsR0FBVixVQUFVLENBQWU7UUFBUyxjQUFTLEdBQVQsU0FBUyxDQUFRO1FBQ25ELGlCQUFZLEdBQVosWUFBWSxDQUEyQjtJQUFHLENBQUM7QUFDaEUsQ0FBQztBQUdEO0lBR0UsWUFBb0IsWUFBeUI7UUFBekIs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LENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLE1BQU0sSUFBSSxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdEMsQ0FBQztJQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDaEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhLFxuICBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLFxuICBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFcbn0gZnJvbSAnLi9jb21waWxlX21ldGFkYXRhJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge1ZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS92aWV3JztcbmltcG9ydCB7U2hhZG93Q3NzfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvc2hhZG93X2Nzcyc7XG5pbXBvcnQge1VybFJlc29sdmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvdXJsX3Jlc29sdmVyJztcbmltcG9ydCB7ZXh0cmFjdFN0eWxlVXJsc30gZnJvbSAnLi9zdHlsZV91cmxfcmVzb2x2ZXInO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge2lzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuY29uc3QgQ09NUE9ORU5UX1ZBUklBQkxFID0gJyVDT01QJSc7XG5jb25zdCBIT1NUX0FUVFIgPSAvKkB0czJkYXJ0X2NvbnN0Ki8gYF9uZ2hvc3QtJHtDT01QT05FTlRfVkFSSUFCTEV9YDtcbmNvbnN0IENPTlRFTlRfQVRUUiA9IC8qQHRzMmRhcnRfY29uc3QqLyBgX25nY29udGVudC0ke0NPTVBPTkVOVF9WQVJJQUJMRX1gO1xuXG5leHBvcnQgY2xhc3MgU3R5bGVzQ29tcGlsZURlcGVuZGVuY3kge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgc291cmNlVXJsOiBzdHJpbmcsIHB1YmxpYyBpc1NoaW1tZWQ6IGJvb2xlYW4sXG4gICAgICAgICAgICAgIHB1YmxpYyB2YWx1ZVBsYWNlaG9sZGVyOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgU3R5bGVzQ29tcGlsZVJlc3VsdCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdLCBwdWJsaWMgc3R5bGVzVmFyOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHB1YmxpYyBkZXBlbmRlbmNpZXM6IFN0eWxlc0NvbXBpbGVEZXBlbmRlbmN5W10pIHt9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTdHlsZUNvbXBpbGVyIHtcbiAgcHJpdmF0ZSBfc2hhZG93Q3NzOiBTaGFkb3dDc3MgPSBuZXcgU2hhZG93Q3NzKCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdXJsUmVzb2x2ZXI6IFVybFJlc29sdmVyKSB7fVxuXG4gIGNvbXBpbGVDb21wb25lbnQoY29tcDogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhKTogU3R5bGVzQ29tcGlsZVJlc3VsdCB7XG4gICAgdmFyIHNoaW0gPSBjb21wLnRlbXBsYXRlLmVuY2Fwc3VsYXRpb24gPT09IFZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkO1xuICAgIHJldHVybiB0aGlzLl9jb21waWxlU3R5bGVzKGdldFN0eWxlc1Zhck5hbWUoY29tcCksIGNvbXAudGVtcGxhdGUuc3R5bGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXAudGVtcGxhdGUuc3R5bGVVcmxzLCBzaGltKTtcbiAgfVxuXG4gIGNvbXBpbGVTdHlsZXNoZWV0KHN0eWxlc2hlZXRVcmw6IHN0cmluZywgY3NzVGV4dDogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICBpc1NoaW1tZWQ6IGJvb2xlYW4pOiBTdHlsZXNDb21waWxlUmVzdWx0IHtcbiAgICB2YXIgc3R5bGVXaXRoSW1wb3J0cyA9IGV4dHJhY3RTdHlsZVVybHModGhpcy5fdXJsUmVzb2x2ZXIsIHN0eWxlc2hlZXRVcmwsIGNzc1RleHQpO1xuICAgIHJldHVybiB0aGlzLl9jb21waWxlU3R5bGVzKGdldFN0eWxlc1Zhck5hbWUobnVsbCksIFtzdHlsZVdpdGhJbXBvcnRzLnN0eWxlXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZVdpdGhJbXBvcnRzLnN0eWxlVXJscywgaXNTaGltbWVkKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbXBpbGVTdHlsZXMoc3R5bGVzVmFyOiBzdHJpbmcsIHBsYWluU3R5bGVzOiBzdHJpbmdbXSwgYWJzVXJsczogc3RyaW5nW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgc2hpbTogYm9vbGVhbik6IFN0eWxlc0NvbXBpbGVSZXN1bHQge1xuICAgIHZhciBzdHlsZUV4cHJlc3Npb25zID1cbiAgICAgICAgcGxhaW5TdHlsZXMubWFwKHBsYWluU3R5bGUgPT4gby5saXRlcmFsKHRoaXMuX3NoaW1JZk5lZWRlZChwbGFpblN0eWxlLCBzaGltKSkpO1xuICAgIHZhciBkZXBlbmRlbmNpZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFic1VybHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbmV3IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoe25hbWU6IGdldFN0eWxlc1Zhck5hbWUobnVsbCl9KTtcbiAgICAgIGRlcGVuZGVuY2llcy5wdXNoKG5ldyBTdHlsZXNDb21waWxlRGVwZW5kZW5jeShhYnNVcmxzW2ldLCBzaGltLCBpZGVudGlmaWVyKSk7XG4gICAgICBzdHlsZUV4cHJlc3Npb25zLnB1c2gobmV3IG8uRXh0ZXJuYWxFeHByKGlkZW50aWZpZXIpKTtcbiAgICB9XG4gICAgLy8gc3R5bGVzIHZhcmlhYmxlIGNvbnRhaW5zIHBsYWluIHN0cmluZ3MgYW5kIGFycmF5cyBvZiBvdGhlciBzdHlsZXMgYXJyYXlzIChyZWN1cnNpdmUpLFxuICAgIC8vIHNvIHdlIHNldCBpdHMgdHlwZSB0byBkeW5hbWljLlxuICAgIHZhciBzdG10ID0gby52YXJpYWJsZShzdHlsZXNWYXIpXG4gICAgICAgICAgICAgICAgICAgLnNldChvLmxpdGVyYWxBcnIoc3R5bGVFeHByZXNzaW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgby5BcnJheVR5cGUoby5EWU5BTUlDX1RZUEUsIFtvLlR5cGVNb2RpZmllci5Db25zdF0pKSlcbiAgICAgICAgICAgICAgICAgICAudG9EZWNsU3RtdChudWxsLCBbby5TdG10TW9kaWZpZXIuRmluYWxdKTtcbiAgICByZXR1cm4gbmV3IFN0eWxlc0NvbXBpbGVSZXN1bHQoW3N0bXRdLCBzdHlsZXNWYXIsIGRlcGVuZGVuY2llcyk7XG4gIH1cblxuICBwcml2YXRlIF9zaGltSWZOZWVkZWQoc3R5bGU6IHN0cmluZywgc2hpbTogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgcmV0dXJuIHNoaW0gPyB0aGlzLl9zaGFkb3dDc3Muc2hpbUNzc1RleHQoc3R5bGUsIENPTlRFTlRfQVRUUiwgSE9TVF9BVFRSKSA6IHN0eWxlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFN0eWxlc1Zhck5hbWUoY29tcG9uZW50OiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEpOiBzdHJpbmcge1xuICB2YXIgcmVzdWx0ID0gYHN0eWxlc2A7XG4gIGlmIChpc1ByZXNlbnQoY29tcG9uZW50KSkge1xuICAgIHJlc3VsdCArPSBgXyR7Y29tcG9uZW50LnR5cGUubmFtZX1gO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59Il19