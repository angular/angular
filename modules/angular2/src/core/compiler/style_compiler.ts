import {CompileTypeMetadata, CompileTemplateMetadata} from './directive_metadata';
import {SourceModule, SourceExpression, moduleRef} from './source_module';
import {ViewEncapsulation} from 'angular2/src/core/metadata/view';
import {XHR} from 'angular2/src/core/compiler/xhr';
import {StringWrapper, isBlank} from 'angular2/src/core/facade/lang';
import {PromiseWrapper, Promise} from 'angular2/src/core/facade/async';
import {ShadowCss} from 'angular2/src/core/compiler/shadow_css';
import {UrlResolver} from 'angular2/src/core/compiler/url_resolver';
import {resolveStyleUrls} from './style_url_resolver';
import {
  escapeSingleQuoteString,
  IS_DART,
  codeGenConcatArray,
  codeGenMapArray,
  codeGenReplaceAll,
  codeGenExportVariable,
  codeGenToString,
  MODULE_SUFFIX
} from './util';
import {Injectable} from 'angular2/src/core/di';

const COMPONENT_VARIABLE = '%COMP%';
var COMPONENT_REGEX = /%COMP%/g;
const HOST_ATTR = `_nghost-${COMPONENT_VARIABLE}`;
const HOST_ATTR_EXPR = `'_nghost-'+${COMPONENT_VARIABLE}`;
const CONTENT_ATTR = `_ngcontent-${COMPONENT_VARIABLE}`;
const CONTENT_ATTR_EXPR = `'_ngcontent-'+${COMPONENT_VARIABLE}`;

@Injectable()
export class StyleCompiler {
  private _styleCache: Map<string, Promise<string[]>> = new Map<string, Promise<string[]>>();
  private _shadowCss: ShadowCss = new ShadowCss();

  constructor(private _xhr: XHR, private _urlResolver: UrlResolver) {}

  compileComponentRuntime(appId: string, templateId: number,
                          template: CompileTemplateMetadata): Promise<string[]> {
    var styles = template.styles;
    var styleAbsUrls = template.styleUrls;
    return this._loadStyles(styles, styleAbsUrls,
                            template.encapsulation === ViewEncapsulation.Emulated)
        .then(styles => styles.map(style => StringWrapper.replaceAll(
                                       style, COMPONENT_REGEX, componentId(appId, templateId))));
  }

  compileComponentCodeGen(appIdExpression: string, templateIdExpression: string,
                          template: CompileTemplateMetadata): SourceExpression {
    var shim = template.encapsulation === ViewEncapsulation.Emulated;
    var suffix;
    if (shim) {
      suffix = codeGenMapArray(
          ['style'],
          `style${codeGenReplaceAll(COMPONENT_VARIABLE, componentIdExpression(appIdExpression, templateIdExpression))}`);
    } else {
      suffix = '';
    }
    return this._styleCodeGen(template.styles, template.styleUrls, shim, suffix);
  }

  compileStylesheetCodeGen(stylesheetUrl: string, cssText: string): SourceModule[] {
    var styleWithImports = resolveStyleUrls(this._urlResolver, stylesheetUrl, cssText);
    return [
      this._styleModule(
          stylesheetUrl, false,
          this._styleCodeGen([styleWithImports.style], styleWithImports.styleUrls, false, '')),
      this._styleModule(
          stylesheetUrl, true,
          this._styleCodeGen([styleWithImports.style], styleWithImports.styleUrls, true, ''))
    ];
  }

  clearCache() { this._styleCache.clear(); }

  private _loadStyles(plainStyles: string[], absUrls: string[],
                      encapsulate: boolean): Promise<string[]> {
    var promises = absUrls.map((absUrl) => {
      var cacheKey = `${absUrl}${encapsulate ? '.shim' : ''}`;
      var result = this._styleCache.get(cacheKey);
      if (isBlank(result)) {
        result = this._xhr.get(absUrl).then((style) => {
          var styleWithImports = resolveStyleUrls(this._urlResolver, absUrl, style);
          return this._loadStyles([styleWithImports.style], styleWithImports.styleUrls,
                                  encapsulate);
        });
        this._styleCache.set(cacheKey, result);
      }
      return result;
    });
    return PromiseWrapper.all(promises).then((nestedStyles: string[][]) => {
      var result = plainStyles.map(plainStyle => this._shimIfNeeded(plainStyle, encapsulate));
      nestedStyles.forEach(styles => styles.forEach(style => result.push(style)));
      return result;
    });
  }

  private _styleCodeGen(plainStyles: string[], absUrls: string[], shim: boolean,
                        suffix: string): SourceExpression {
    var expressionSource = `(`;
    expressionSource +=
        `[${plainStyles.map( plainStyle => escapeSingleQuoteString(this._shimIfNeeded(plainStyle, shim)) ).join(',')}]`;
    for (var i = 0; i < absUrls.length; i++) {
      var moduleUrl = this._createModuleUrl(absUrls[i], shim);
      expressionSource += codeGenConcatArray(`${moduleRef(moduleUrl)}STYLES`);
    }
    expressionSource += `)${suffix}`;
    return new SourceExpression([], expressionSource);
  }

  private _styleModule(stylesheetUrl: string, shim: boolean,
                       expression: SourceExpression): SourceModule {
    var moduleSource = `
      ${expression.declarations.join('\n')}
      ${codeGenExportVariable('STYLES')}${expression.expression};
    `;
    return new SourceModule(this._createModuleUrl(stylesheetUrl, shim), moduleSource);
  }

  private _shimIfNeeded(style: string, shim: boolean): string {
    return shim ? this._shadowCss.shimCssText(style, CONTENT_ATTR, HOST_ATTR) : style;
  }

  private _createModuleUrl(stylesheetUrl: string, shim: boolean): string {
    return shim ? `${stylesheetUrl}.shim${MODULE_SUFFIX}` : `${stylesheetUrl}${MODULE_SUFFIX}`;
  }
}

export function shimContentAttribute(appId: string, templateId: number): string {
  return StringWrapper.replaceAll(CONTENT_ATTR, COMPONENT_REGEX, componentId(appId, templateId));
}

export function shimContentAttributeExpr(appIdExpr: string, templateIdExpr: string): string {
  return StringWrapper.replaceAll(CONTENT_ATTR_EXPR, COMPONENT_REGEX,
                                  componentIdExpression(appIdExpr, templateIdExpr));
}

export function shimHostAttribute(appId: string, templateId: number): string {
  return StringWrapper.replaceAll(HOST_ATTR, COMPONENT_REGEX, componentId(appId, templateId));
}

export function shimHostAttributeExpr(appIdExpr: string, templateIdExpr: string): string {
  return StringWrapper.replaceAll(HOST_ATTR_EXPR, COMPONENT_REGEX,
                                  componentIdExpression(appIdExpr, templateIdExpr));
}

function componentId(appId: string, templateId: number): string {
  return `${appId}-${templateId}`;
}

function componentIdExpression(appIdExpression: string, templateIdExpression: string): string {
  return `${appIdExpression}+'-'+${codeGenToString(templateIdExpression)}`;
}
