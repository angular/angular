library angular2.src.compiler.template_normalizer;

import "directive_metadata.dart"
    show CompileTypeMetadata, CompileDirectiveMetadata, CompileTemplateMetadata;
import "package:angular2/src/facade/lang.dart" show isPresent, isBlank;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/facade/async.dart" show Future, PromiseWrapper;
import "package:angular2/src/compiler/xhr.dart" show XHR;
import "package:angular2/src/compiler/url_resolver.dart" show UrlResolver;
import "style_url_resolver.dart" show extractStyleUrls, isStyleUrlResolvable;
import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/core/metadata/view.dart" show ViewEncapsulation;
import "html_ast.dart"
    show
        HtmlAstVisitor,
        HtmlElementAst,
        HtmlTextAst,
        HtmlAttrAst,
        HtmlAst,
        htmlVisitAll;
import "html_parser.dart" show HtmlParser;
import "template_preparser.dart"
    show preparseElement, PreparsedElement, PreparsedElementType;

@Injectable()
class TemplateNormalizer {
  XHR _xhr;
  UrlResolver _urlResolver;
  HtmlParser _domParser;
  TemplateNormalizer(this._xhr, this._urlResolver, this._domParser) {}
  Future<CompileTemplateMetadata> normalizeTemplate(
      CompileTypeMetadata directiveType, CompileTemplateMetadata template) {
    if (isPresent(template.template)) {
      return PromiseWrapper.resolve(this.normalizeLoadedTemplate(
          directiveType, template, template.template, directiveType.moduleUrl));
    } else if (isPresent(template.templateUrl)) {
      var sourceAbsUrl = this
          ._urlResolver
          .resolve(directiveType.moduleUrl, template.templateUrl);
      return this._xhr.get(sourceAbsUrl).then((templateContent) => this
          .normalizeLoadedTemplate(
              directiveType, template, templateContent, sourceAbsUrl));
    } else {
      throw new BaseException(
          '''No template specified for component ${ directiveType . name}''');
    }
  }

  CompileTemplateMetadata normalizeLoadedTemplate(
      CompileTypeMetadata directiveType,
      CompileTemplateMetadata templateMeta,
      String template,
      String templateAbsUrl) {
    var domNodes = this._domParser.parse(template, directiveType.name);
    var visitor = new TemplatePreparseVisitor();
    htmlVisitAll(visitor, domNodes);
    var allStyles = (new List.from(templateMeta.styles)
      ..addAll(visitor.styles));
    var allStyleAbsUrls = (new List.from(visitor.styleUrls
        .where(isStyleUrlResolvable)
        .toList()
        .map((url) => this._urlResolver.resolve(templateAbsUrl, url))
        .toList())
      ..addAll(templateMeta.styleUrls
          .where(isStyleUrlResolvable)
          .toList()
          .map((url) => this._urlResolver.resolve(directiveType.moduleUrl, url))
          .toList()));
    var allResolvedStyles = allStyles.map((style) {
      var styleWithImports =
          extractStyleUrls(this._urlResolver, templateAbsUrl, style);
      styleWithImports.styleUrls
          .forEach((styleUrl) => allStyleAbsUrls.add(styleUrl));
      return styleWithImports.style;
    }).toList();
    var encapsulation = templateMeta.encapsulation;
    if (identical(encapsulation, ViewEncapsulation.Emulated) &&
        identical(allResolvedStyles.length, 0) &&
        identical(allStyleAbsUrls.length, 0)) {
      encapsulation = ViewEncapsulation.None;
    }
    return new CompileTemplateMetadata(
        encapsulation: encapsulation,
        template: template,
        templateUrl: templateAbsUrl,
        styles: allResolvedStyles,
        styleUrls: allStyleAbsUrls,
        ngContentSelectors: visitor.ngContentSelectors);
  }
}

class TemplatePreparseVisitor implements HtmlAstVisitor {
  List<String> ngContentSelectors = [];
  List<String> styles = [];
  List<String> styleUrls = [];
  num ngNonBindableStackCount = 0;
  dynamic visitElement(HtmlElementAst ast, dynamic context) {
    var preparsedElement = preparseElement(ast);
    switch (preparsedElement.type) {
      case PreparsedElementType.NG_CONTENT:
        if (identical(this.ngNonBindableStackCount, 0)) {
          this.ngContentSelectors.add(preparsedElement.selectAttr);
        }
        break;
      case PreparsedElementType.STYLE:
        var textContent = "";
        ast.children.forEach((child) {
          if (child is HtmlTextAst) {
            textContent += ((child as HtmlTextAst)).value;
          }
        });
        this.styles.add(textContent);
        break;
      case PreparsedElementType.STYLESHEET:
        this.styleUrls.add(preparsedElement.hrefAttr);
        break;
    }
    if (preparsedElement.nonBindable) {
      this.ngNonBindableStackCount++;
    }
    htmlVisitAll(this, ast.children);
    if (preparsedElement.nonBindable) {
      this.ngNonBindableStackCount--;
    }
    return null;
  }

  dynamic visitAttr(HtmlAttrAst ast, dynamic context) {
    return null;
  }

  dynamic visitText(HtmlTextAst ast, dynamic context) {
    return null;
  }
}
