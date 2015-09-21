import {
  TypeMetadata,
  TemplateMetadata,
  NormalizedDirectiveMetadata,
  NormalizedTemplateMetadata
} from './directive_metadata';
import {isPresent, isBlank} from 'angular2/src/core/facade/lang';
import {Promise, PromiseWrapper} from 'angular2/src/core/facade/async';

import {XHR} from 'angular2/src/core/render/xhr';
import {UrlResolver} from 'angular2/src/core/services/url_resolver';
import {resolveStyleUrls} from './style_url_resolver';
import {Injectable} from 'angular2/src/core/di';

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

@Injectable()
export class TemplateNormalizer {
  constructor(private _xhr: XHR, private _urlResolver: UrlResolver,
              private _domParser: HtmlParser) {}

  normalizeTemplate(directiveType: TypeMetadata,
                    template: TemplateMetadata): Promise<NormalizedTemplateMetadata> {
    if (isPresent(template.template)) {
      return PromiseWrapper.resolve(this.normalizeLoadedTemplate(
          directiveType, template, template.template, directiveType.moduleId));
    } else {
      var sourceAbsUrl = this._urlResolver.resolve(directiveType.moduleId, template.templateUrl);
      return this._xhr.get(sourceAbsUrl)
          .then(templateContent => this.normalizeLoadedTemplate(directiveType, template,
                                                                templateContent, sourceAbsUrl));
    }
  }

  normalizeLoadedTemplate(directiveType: TypeMetadata, templateMeta: TemplateMetadata,
                          template: string, templateAbsUrl: string): NormalizedTemplateMetadata {
    var domNodes = this._domParser.parse(template, directiveType.name);
    var visitor = new TemplatePreparseVisitor();
    var remainingNodes = htmlVisitAll(visitor, domNodes);
    var allStyles = templateMeta.styles.concat(visitor.styles);

    var allStyleAbsUrls =
        visitor.styleUrls.map(url => this._urlResolver.resolve(templateAbsUrl, url))
            .concat(templateMeta.styleUrls.map(
                url => this._urlResolver.resolve(directiveType.moduleId, url)));

    var allResolvedStyles = allStyles.map(style => {
      var styleWithImports = resolveStyleUrls(this._urlResolver, templateAbsUrl, style);
      styleWithImports.styleUrls.forEach(styleUrl => allStyleAbsUrls.push(styleUrl));
      return styleWithImports.style;
    });
    return new NormalizedTemplateMetadata({
      encapsulation: templateMeta.encapsulation,
      template: this._domParser.unparse(remainingNodes),
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

  visitElement(ast: HtmlElementAst, context: any): HtmlElementAst {
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
      this.ngContentSelectors.push(normalizeNgContentSelect(selectAttr));
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
  visitAttr(ast: HtmlAttrAst, context: any): HtmlAttrAst { return ast; }
  visitText(ast: HtmlTextAst, context: any): HtmlTextAst { return ast; }
}

function normalizeNgContentSelect(selectAttr: string): string {
  if (isBlank(selectAttr) || selectAttr.length === 0) {
    return '*';
  }
  return selectAttr;
}