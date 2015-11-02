import {CompileTypeMetadata, CompileTemplateMetadata} from './directive_metadata';
import {SourceModule, SourceExpression, moduleRef} from './source_module';
import {ViewEncapsulation} from 'angular2/src/core/metadata/view';
import {XHR} from 'angular2/src/compiler/xhr';
import {IS_DART, StringWrapper, isBlank} from 'angular2/src/facade/lang';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';
import {ShadowCss} from 'angular2/src/compiler/shadow_css';
import {UrlResolver} from 'angular2/src/compiler/url_resolver';
import {extractStyleUrls} from './style_url_resolver';
import {
  escapeSingleQuoteString,
  codeGenExportVariable,
  codeGenToString,
  MODULE_SUFFIX
} from './util';
import {Injectable} from 'angular2/src/core/di';
import {COMPONENT_VARIABLE, HOST_ATTR, CONTENT_ATTR} from 'angular2/src/core/render/view_factory';

@Injectable()
export class StyleCompiler {
  private _styleCache: Map<string, Promise<string[]>> = new Map<string, Promise<string[]>>();
  private _shadowCss: ShadowCss = new ShadowCss();

  constructor(private _xhr: XHR, private _urlResolver: UrlResolver) {}

  compileComponentRuntime(template: CompileTemplateMetadata): Promise<Array<string | any[]>> {
    var styles = template.styles;
    var styleAbsUrls = template.styleUrls;
    return this._loadStyles(styles, styleAbsUrls,
                            template.encapsulation === ViewEncapsulation.Emulated);
  }

  compileComponentCodeGen(template: CompileTemplateMetadata): SourceExpression {
    var shim = template.encapsulation === ViewEncapsulation.Emulated;
    return this._styleCodeGen(template.styles, template.styleUrls, shim);
  }

  compileStylesheetCodeGen(stylesheetUrl: string, cssText: string): SourceModule[] {
    var styleWithImports = extractStyleUrls(this._urlResolver, stylesheetUrl, cssText);
    return [
      this._styleModule(
          stylesheetUrl, false,
          this._styleCodeGen([styleWithImports.style], styleWithImports.styleUrls, false)),
      this._styleModule(stylesheetUrl, true, this._styleCodeGen([styleWithImports.style],
                                                                styleWithImports.styleUrls, true))
    ];
  }

  clearCache() { this._styleCache.clear(); }

  private _loadStyles(plainStyles: string[], absUrls: string[],
                      encapsulate: boolean): Promise<Array<string | any[]>> {
    var promises = absUrls.map((absUrl) => {
      var cacheKey = `${absUrl}${encapsulate ? '.shim' : ''}`;
      var result = this._styleCache.get(cacheKey);
      if (isBlank(result)) {
        result = this._xhr.get(absUrl).then((style) => {
          var styleWithImports = extractStyleUrls(this._urlResolver, absUrl, style);
          return this._loadStyles([styleWithImports.style], styleWithImports.styleUrls,
                                  encapsulate);
        });
        this._styleCache.set(cacheKey, result);
      }
      return result;
    });
    return PromiseWrapper.all(promises).then((nestedStyles: string[][]) => {
      var result: Array<string | any[]> =
          plainStyles.map(plainStyle => this._shimIfNeeded(plainStyle, encapsulate));
      nestedStyles.forEach(styles => result.push(styles));
      return result;
    });
  }

  private _styleCodeGen(plainStyles: string[], absUrls: string[], shim: boolean): SourceExpression {
    var arrayPrefix = IS_DART ? `const` : '';
    var styleExpressions = plainStyles.map(
        plainStyle => escapeSingleQuoteString(this._shimIfNeeded(plainStyle, shim)));

    for (var i = 0; i < absUrls.length; i++) {
      var moduleUrl = this._createModuleUrl(absUrls[i], shim);
      styleExpressions.push(`${moduleRef(moduleUrl)}STYLES`);
    }
    var expressionSource = `${arrayPrefix} [${styleExpressions.join(',')}]`;
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
