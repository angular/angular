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

const COMPONENT_VARIABLE = '%COMP%';
const HOST_ATTR = `_nghost-${COMPONENT_VARIABLE}`;
const CONTENT_ATTR = `_ngcontent-${COMPONENT_VARIABLE}`;

@Injectable()
export class StyleCompiler {
  private _styleCache: Map<string, Promise<string[]>> = new Map<string, Promise<string[]>>();
  private _shadowCss: ShadowCss = new ShadowCss();

  constructor(private _xhr: XHR, private _urlResolver: UrlResolver) {}

  compileComponentRuntime(template: CompileTemplateMetadata): Promise<Array<string | any[]>> {
    var styles = template.styles;
    var styleAbsUrls = template.styleUrls;
    var encapsulation = template.encapsulation;
    return this._loadStyles(styles, styleAbsUrls, encapsulation);
  }

  compileComponentCodeGen(template: CompileTemplateMetadata): SourceExpression {
    return this._styleCodeGen(template.styles, template.styleUrls, template.encapsulation);
  }

  compileStylesheetCodeGen(stylesheetUrl: string, cssText: string): SourceModule[] {
    var styleWithImports = extractStyleUrls(this._urlResolver, stylesheetUrl, cssText);

    var encapsulations = [
      ViewEncapsulation.None,
      ViewEncapsulation.Emulated,
      ViewEncapsulation.EmulatedLegacy,
    ];

    return encapsulations.map(encapsulation => {
      var srcExp =
          this._styleCodeGen([styleWithImports.style], styleWithImports.styleUrls, encapsulation);
      return this._styleModule(stylesheetUrl, encapsulation, srcExp);
    });
  }

  clearCache() { this._styleCache.clear(); }

  private _loadStyles(plainStyles: string[], absUrls: string[],
                      encapsulation: ViewEncapsulation): Promise<Array<string | any[]>> {
    var promises = absUrls.map((absUrl) => {
      var cacheKey = `${absUrl}${this._getEncapsulationSuffix(encapsulation)}`;
      var result = this._styleCache.get(cacheKey);
      if (isBlank(result)) {
        result = this._xhr.get(absUrl).then((style) => {
          var styleWithImports = extractStyleUrls(this._urlResolver, absUrl, style);
          return this._loadStyles([styleWithImports.style], styleWithImports.styleUrls,
                                  encapsulation);
        });
        this._styleCache.set(cacheKey, result);
      }
      return result;
    });

    return PromiseWrapper.all(promises).then((nestedStyles: string[][]) => {
      var result: Array<string | any[]> =
          plainStyles.map(plainStyle => this._shimIfNeeded(plainStyle, encapsulation));
      nestedStyles.forEach(styles => result.push(styles));
      return result;
    });
  }

  private _styleCodeGen(plainStyles: string[], absUrls: string[],
                        encapsulation: ViewEncapsulation): SourceExpression {
    var arrayPrefix = IS_DART ? `const` : '';
    var styleExpressions = plainStyles.map(
        plainStyle => escapeSingleQuoteString(this._shimIfNeeded(plainStyle, encapsulation)));

    for (var i = 0; i < absUrls.length; i++) {
      var moduleUrl = this._createModuleUrl(absUrls[i], encapsulation);
      styleExpressions.push(`${moduleRef(moduleUrl)}STYLES`);
    }
    var expressionSource = `${arrayPrefix} [${styleExpressions.join(',')}]`;
    return new SourceExpression([], expressionSource);
  }

  private _styleModule(stylesheetUrl: string, encapsulation: ViewEncapsulation,
                       expression: SourceExpression): SourceModule {
    var moduleSource = `
      ${expression.declarations.join('\n')}
      ${codeGenExportVariable('STYLES')}${expression.expression};
    `;
    return new SourceModule(this._createModuleUrl(stylesheetUrl, encapsulation), moduleSource);
  }

  private _shimIfNeeded(style: string, encapsulation: ViewEncapsulation): string {
    if (encapsulation === ViewEncapsulation.Emulated) {
      return this._shadowCss.shimCssText(style, CONTENT_ATTR, HOST_ATTR, false);
    }
    if (encapsulation === ViewEncapsulation.EmulatedLegacy) {
      return this._shadowCss.shimCssText(style, CONTENT_ATTR, HOST_ATTR, true);
    }
    return style;
  }

  private _createModuleUrl(stylesheetUrl: string, encapsulation: ViewEncapsulation): string {
    return `${stylesheetUrl}${this._getEncapsulationSuffix(encapsulation)}${MODULE_SUFFIX}`;
  }

  private _getEncapsulationSuffix(encapsulation: ViewEncapsulation): string {
    if (encapsulation === ViewEncapsulation.Emulated) return '.shim';
    if (encapsulation === ViewEncapsulation.EmulatedLegacy) return '.shimlegacy';
    return '';
  }
}
