library angular2.src.compiler.template_preparser;

import "html_ast.dart" show HtmlElementAst;
import "package:angular2/src/facade/lang.dart" show isBlank, isPresent;

const NG_CONTENT_SELECT_ATTR = "select";
const NG_CONTENT_ELEMENT = "ng-content";
const LINK_ELEMENT = "link";
const LINK_STYLE_REL_ATTR = "rel";
const LINK_STYLE_HREF_ATTR = "href";
const LINK_STYLE_REL_VALUE = "stylesheet";
const STYLE_ELEMENT = "style";
const SCRIPT_ELEMENT = "script";
const NG_NON_BINDABLE_ATTR = "ng-non-bindable";
PreparsedElement preparseElement(HtmlElementAst ast) {
  var selectAttr = null;
  var hrefAttr = null;
  var relAttr = null;
  var nonBindable = false;
  ast.attrs.forEach((attr) {
    if (attr.name == NG_CONTENT_SELECT_ATTR) {
      selectAttr = attr.value;
    } else if (attr.name == LINK_STYLE_HREF_ATTR) {
      hrefAttr = attr.value;
    } else if (attr.name == LINK_STYLE_REL_ATTR) {
      relAttr = attr.value;
    } else if (attr.name == NG_NON_BINDABLE_ATTR) {
      nonBindable = true;
    }
  });
  selectAttr = normalizeNgContentSelect(selectAttr);
  var nodeName = ast.name;
  var type = PreparsedElementType.OTHER;
  if (nodeName == NG_CONTENT_ELEMENT) {
    type = PreparsedElementType.NG_CONTENT;
  } else if (nodeName == STYLE_ELEMENT) {
    type = PreparsedElementType.STYLE;
  } else if (nodeName == SCRIPT_ELEMENT) {
    type = PreparsedElementType.SCRIPT;
  } else if (nodeName == LINK_ELEMENT && relAttr == LINK_STYLE_REL_VALUE) {
    type = PreparsedElementType.STYLESHEET;
  }
  return new PreparsedElement(type, selectAttr, hrefAttr, nonBindable);
}

enum PreparsedElementType { NG_CONTENT, STYLE, STYLESHEET, SCRIPT, OTHER }

class PreparsedElement {
  PreparsedElementType type;
  String selectAttr;
  String hrefAttr;
  bool nonBindable;
  PreparsedElement(
      this.type, this.selectAttr, this.hrefAttr, this.nonBindable) {}
}

String normalizeNgContentSelect(String selectAttr) {
  if (isBlank(selectAttr) || identical(selectAttr.length, 0)) {
    return "*";
  }
  return selectAttr;
}
