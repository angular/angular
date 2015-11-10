library angular2.src.compiler.style_compiler;

import "directive_metadata.dart"
    show CompileTypeMetadata, CompileTemplateMetadata;
import "source_module.dart" show SourceModule, SourceExpression, moduleRef;
import "package:angular2/src/core/metadata/view.dart" show ViewEncapsulation;
import "package:angular2/src/compiler/xhr.dart" show XHR;
import "package:angular2/src/facade/lang.dart"
    show IS_DART, StringWrapper, isBlank;
import "package:angular2/src/facade/async.dart" show PromiseWrapper, Future;
import "package:angular2/src/compiler/shadow_css.dart" show ShadowCss;
import "package:angular2/src/compiler/url_resolver.dart" show UrlResolver;
import "style_url_resolver.dart" show extractStyleUrls;
import "util.dart"
    show
        escapeSingleQuoteString,
        codeGenExportVariable,
        codeGenToString,
        MODULE_SUFFIX;
import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/core/render/view_factory.dart"
    show COMPONENT_VARIABLE, HOST_ATTR, CONTENT_ATTR;

@Injectable()
class StyleCompiler {
  XHR _xhr;
  UrlResolver _urlResolver;
  Map<String, Future<List<String>>> _styleCache =
      new Map<String, Future<List<String>>>();
  ShadowCss _shadowCss = new ShadowCss();
  StyleCompiler(this._xhr, this._urlResolver) {}
  Future<
      List<dynamic /* String | List < dynamic > */ >> compileComponentRuntime(
      CompileTemplateMetadata template) {
    var styles = template.styles;
    var styleAbsUrls = template.styleUrls;
    return this._loadStyles(styles, styleAbsUrls,
        identical(template.encapsulation, ViewEncapsulation.Emulated));
  }

  SourceExpression compileComponentCodeGen(CompileTemplateMetadata template) {
    var shim = identical(template.encapsulation, ViewEncapsulation.Emulated);
    return this._styleCodeGen(template.styles, template.styleUrls, shim);
  }

  List<SourceModule> compileStylesheetCodeGen(
      String stylesheetUrl, String cssText) {
    var styleWithImports =
        extractStyleUrls(this._urlResolver, stylesheetUrl, cssText);
    return [
      this._styleModule(
          stylesheetUrl,
          false,
          this._styleCodeGen(
              [styleWithImports.style], styleWithImports.styleUrls, false)),
      this._styleModule(
          stylesheetUrl,
          true,
          this._styleCodeGen(
              [styleWithImports.style], styleWithImports.styleUrls, true))
    ];
  }

  clearCache() {
    this._styleCache.clear();
  }

  Future<List<dynamic /* String | List < dynamic > */ >> _loadStyles(
      List<String> plainStyles, List<String> absUrls, bool encapsulate) {
    var promises = absUrls.map((absUrl) {
      var cacheKey = '''${ absUrl}${ encapsulate ? ".shim" : ""}''';
      var result = this._styleCache[cacheKey];
      if (isBlank(result)) {
        result = this._xhr.get(absUrl).then((style) {
          var styleWithImports =
              extractStyleUrls(this._urlResolver, absUrl, style);
          return this._loadStyles([styleWithImports.style],
              styleWithImports.styleUrls, encapsulate);
        });
        this._styleCache[cacheKey] = result;
      }
      return result;
    }).toList();
    return PromiseWrapper.all(promises).then((List<List<String>> nestedStyles) {
      List<dynamic /* String | List < dynamic > */ > result = plainStyles
          .map((plainStyle) => this._shimIfNeeded(plainStyle, encapsulate))
          .toList();
      nestedStyles.forEach((styles) => result.add(styles));
      return result;
    });
  }

  SourceExpression _styleCodeGen(
      List<String> plainStyles, List<String> absUrls, bool shim) {
    var arrayPrefix = IS_DART ? '''const''' : "";
    var styleExpressions = plainStyles
        .map((plainStyle) =>
            escapeSingleQuoteString(this._shimIfNeeded(plainStyle, shim)))
        .toList();
    for (var i = 0; i < absUrls.length; i++) {
      var moduleUrl = this._createModuleUrl(absUrls[i], shim);
      styleExpressions.add('''${ moduleRef ( moduleUrl )}STYLES''');
    }
    var expressionSource =
        '''${ arrayPrefix} [${ styleExpressions . join ( "," )}]''';
    return new SourceExpression([], expressionSource);
  }

  SourceModule _styleModule(
      String stylesheetUrl, bool shim, SourceExpression expression) {
    var moduleSource = '''
      ${ expression . declarations . join ( "\n" )}
      ${ codeGenExportVariable ( "STYLES" )}${ expression . expression};
    ''';
    return new SourceModule(
        this._createModuleUrl(stylesheetUrl, shim), moduleSource);
  }

  String _shimIfNeeded(String style, bool shim) {
    return shim
        ? this._shadowCss.shimCssText(style, CONTENT_ATTR, HOST_ATTR)
        : style;
  }

  String _createModuleUrl(String stylesheetUrl, bool shim) {
    return shim
        ? '''${ stylesheetUrl}.shim${ MODULE_SUFFIX}'''
        : '''${ stylesheetUrl}${ MODULE_SUFFIX}''';
  }
}
