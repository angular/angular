import {DirectiveMetadata, SourceModule, ViewEncapsulation} from './api';
import {XHR} from 'angular2/src/core/render/xhr';
import {StringWrapper, isJsObject, isBlank} from 'angular2/src/core/facade/lang';
import {PromiseWrapper, Promise} from 'angular2/src/core/facade/async';
import {ShadowCss} from 'angular2/src/core/render/dom/compiler/shadow_css';
import {UrlResolver} from 'angular2/src/core/services/url_resolver';
import {resolveStyleUrls} from './style_url_resolver';

const COMPONENT_VARIABLE = '%COMP%';
var COMPONENT_REGEX = /%COMP%/g;
const HOST_ATTR = `_nghost-${COMPONENT_VARIABLE}`;
const CONTENT_ATTR = `_ngcontent-${COMPONENT_VARIABLE}`;
var ESCAPE_STRING_RE = /'|\\|\n/g;
var IS_DART = !isJsObject({});

export class StyleCompiler {
  private _styleCache: Map<string, Promise<string[]>> = new Map<string, Promise<string[]>>();
  private _shadowCss: ShadowCss = new ShadowCss();

  constructor(private _xhr: XHR, private _urlResolver: UrlResolver) {}

  compileComponentRuntime(component: DirectiveMetadata): Promise<string[]> {
    var styles = component.template.styles;
    var styleAbsUrls = component.template.styleAbsUrls;
    return this._loadStyles(styles, styleAbsUrls,
                            component.template.encapsulation === ViewEncapsulation.Emulated)
        .then(styles => styles.map(style => StringWrapper.replaceAll(style, COMPONENT_REGEX,
                                                                     `${component.type.id}`)));
  }

  compileComponentCodeGen(component: DirectiveMetadata): SourceModule {
    var shim = component.template.encapsulation === ViewEncapsulation.Emulated;
    var suffix;
    if (shim) {
      var componentId = `${ component.type.id}`;
      suffix =
          codeGenMapArray(['style'], `style${codeGenReplaceAll(COMPONENT_VARIABLE, componentId)}`);
    } else {
      suffix = '';
    }
    return this._styleCodeGen(`$component.type.typeUrl}.styles`, component.template.styles,
                              component.template.styleAbsUrls, shim, suffix);
  }

  compileStylesheetCodeGen(moduleName: string, cssText: string): SourceModule[] {
    var styleWithImports = resolveStyleUrls(this._urlResolver, moduleName, cssText);
    return [
      this._styleCodeGen(moduleName, [styleWithImports.style], styleWithImports.styleUrls, false,
                         ''),
      this._styleCodeGen(moduleName, [styleWithImports.style], styleWithImports.styleUrls, true, '')
    ];
  }

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

  private _styleCodeGen(moduleName: string, plainStyles: string[], absUrls: string[], shim: boolean,
                        suffix: string): SourceModule {
    var imports: string[][] = [];
    var moduleSource = `var STYLES = (`;
    moduleSource +=
        `[${plainStyles.map( plainStyle => escapeString(this._shimIfNeeded(plainStyle, shim)) ).join(',')}]`;
    for (var i = 0; i < absUrls.length; i++) {
      var url = absUrls[i];
      var moduleAlias = `import${i}`;
      imports.push([this._shimModuleName(url, shim), moduleAlias]);
      moduleSource += `${codeGenConcatArray(moduleAlias+'.STYLES')}`;
    }
    moduleSource += `)${suffix};`;
    return new SourceModule(this._shimModuleName(moduleName, shim), moduleSource, imports);
  }

  private _shimIfNeeded(style: string, shim: boolean): string {
    return shim ? this._shadowCss.shimCssText(style, CONTENT_ATTR, HOST_ATTR) : style;
  }

  private _shimModuleName(originalUrl: string, shim: boolean): string {
    return shim ? `${originalUrl}.shim` : originalUrl;
  }
}

function escapeString(input: string): string {
  var escapedInput = StringWrapper.replaceAllMapped(input, ESCAPE_STRING_RE, (match) => {
    if (match[0] == "'" || match[0] == '\\') {
      return `\\${match[0]}`;
    } else {
      return '\\n';
    }
  });
  return `'${escapedInput}'`;
}

function codeGenConcatArray(expression: string): string {
  return `${IS_DART ? '..addAll' : '.concat'}(${expression})`;
}

function codeGenMapArray(argNames: string[], callback: string): string {
  if (IS_DART) {
    return `.map( (${argNames.join(',')}) => ${callback} ).toList()`;
  } else {
    return `.map(function(${argNames.join(',')}) { return ${callback}; })`;
  }
}

function codeGenReplaceAll(pattern: string, value: string): string {
  if (IS_DART) {
    return `.replaceAll('${pattern}', '${value}')`;
  } else {
    return `.replace(/${pattern}/g, '${value}')`;
  }
}