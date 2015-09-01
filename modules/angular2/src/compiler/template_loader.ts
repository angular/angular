import {TypeMetadata, TemplateMetadata, ViewEncapsulation} from './api';
import {isPresent} from 'angular2/src/core/facade/lang';
import {Promise, PromiseWrapper} from 'angular2/src/core/facade/async';

import {XHR} from 'angular2/src/core/render/xhr';
import {UrlResolver} from 'angular2/src/core/services/url_resolver';
import {StyleUrlResolver} from './style_url_resolver';

import {
  HtmlAstVisitor,
  HtmlElementAst,
  HtmlTextAst,
  HtmlAttrAst,
  HtmlAst,
  htmlVisitAll
} from './html_ast';
import {HtmlParser} from './html_parser';

const NG_CONTENT_SELECT_ATTR = 'select';
const NG_CONTENT_ELEMENT = 'ng-content';
const LINK_ELEMENT = 'link';
const LINK_STYLE_REL_ATTR = 'rel';
const LINK_STYLE_HREF_ATTR = 'href';
const LINK_STYLE_REL_VALUE = 'stylesheet';
const STYLE_ELEMENT = 'style';

export class TemplateLoader {
  constructor(private _xhr: XHR, private _urlResolver: UrlResolver,
              private _styleUrlResolver: StyleUrlResolver, private _domParser: HtmlParser) {}

  loadTemplate(directiveType: TypeMetadata, encapsulation: ViewEncapsulation, template: string,
               templateUrl: string, styles: string[],
               styleUrls: string[]): Promise<TemplateMetadata> {
    if (isPresent(template)) {
      return PromiseWrapper.resolve(this.createTemplateFromString(
          directiveType, encapsulation, template, directiveType.typeUrl, styles, styleUrls));
    } else {
      var sourceAbsUrl = this._urlResolver.resolve(directiveType.typeUrl, templateUrl);
      return this._xhr.get(sourceAbsUrl)
          .then(templateContent =>
                    this.createTemplateFromString(directiveType, encapsulation, templateContent,
                                                  sourceAbsUrl, styles, styleUrls));
    }
  }

  createTemplateFromString(directiveType: TypeMetadata, encapsulation: ViewEncapsulation,
                           template: string, templateSourceUrl: string, styles: string[],
                           styleUrls: string[]): TemplateMetadata {
    var domNodes = this._domParser.parse(template, directiveType.typeName);
    var visitor = new TemplatePreparseVisitor();
    var remainingNodes = htmlVisitAll(visitor, domNodes);
    var allStyles = styles.concat(visitor.styles);
    var allStyleUrls = styleUrls.concat(visitor.styleUrls);
    allStyles = allStyles.map(style => {
      var styleWithImports = this._styleUrlResolver.extractImports(style);
      styleWithImports.styleUrls.forEach(styleUrl => allStyleUrls.push(styleUrl));
      return styleWithImports.style;
    });

    var allResolvedStyles =
        allStyles.map(style => this._styleUrlResolver.resolveUrls(style, templateSourceUrl));
    var allStyleAbsUrls =
        allStyleUrls.map(styleUrl => this._urlResolver.resolve(templateSourceUrl, styleUrl));
    return new TemplateMetadata({
      encapsulation: encapsulation,
      nodes: remainingNodes,
      styles: allResolvedStyles,
      styleAbsUrls: allStyleAbsUrls,
      ngContentSelectors: visitor.ngContentSelectors
    });
  }
}

class TemplatePreparseVisitor implements HtmlAstVisitor {
  ngContentSelectors: string[] = [];
  styles: string[] = [];
  styleUrls: string[] = [];

  visitElement(ast: HtmlElementAst): HtmlElementAst {
    var selectAttr = null;
    var hrefAttr = null;
    var relAttr = null;
    ast.attrs.forEach(attr => {
      if (attr.name == NG_CONTENT_SELECT_ATTR) {
        selectAttr = attr.value;
      } else if (attr.name == LINK_STYLE_HREF_ATTR) {
        hrefAttr = attr.value;
      } else if (attr.name == LINK_STYLE_REL_ATTR) {
        relAttr = attr.value;
      }
    });
    var nodeName = ast.name;
    var keepElement = true;
    if (nodeName == NG_CONTENT_ELEMENT) {
      this.ngContentSelectors.push(selectAttr);
    } else if (nodeName == STYLE_ELEMENT) {
      keepElement = false;
      var textContent = '';
      ast.children.forEach(child => {
        if (child instanceof HtmlTextAst) {
          textContent += (<HtmlTextAst>child).value;
        }
      });
      this.styles.push(textContent);
    } else if (nodeName == LINK_ELEMENT && relAttr == LINK_STYLE_REL_VALUE) {
      keepElement = false;
      this.styleUrls.push(hrefAttr);
    }
    if (keepElement) {
      return new HtmlElementAst(ast.name, ast.attrs, htmlVisitAll(this, ast.children),
                                ast.sourceInfo);
    } else {
      return null;
    }
  }
  visitAttr(ast: HtmlAttrAst): HtmlAttrAst { return ast; }
  visitText(ast: HtmlTextAst): HtmlTextAst { return ast; }
}
