library angular2.src.compiler.html_tags;

import "package:angular2/src/facade/lang.dart"
    show isPresent, isBlank, normalizeBool;
// see http://www.w3.org/TR/html51/syntax.html#named-character-references

// see https://html.spec.whatwg.org/multipage/entities.json

// This list is not exhaustive to keep the compiler footprint low.

// The `&#123;` / `&#x1ab;` syntax should be used when the named character reference does not exist.
const NAMED_ENTITIES = const {
  "lt": "<",
  "gt": ">",
  "nbsp": " ",
  "amp": "&",
  "Aacute": "Á",
  "Acirc": "Â",
  "Agrave": "À",
  "Atilde": "Ã",
  "Auml": "Ä",
  "Ccedil": "Ç",
  "Eacute": "É",
  "Ecirc": "Ê",
  "Egrave": "È",
  "Euml": "Ë",
  "Iacute": "Í",
  "Icirc": "Î",
  "Igrave": "Ì",
  "Iuml": "Ï",
  "Oacute": "Ó",
  "Ocirc": "Ô",
  "Ograve": "Ò",
  "Otilde": "Õ",
  "Ouml": "Ö",
  "Uacute": "Ú",
  "Ucirc": "Û",
  "Ugrave": "Ù",
  "Uuml": "Ü",
  "aacute": "á",
  "acirc": "â",
  "agrave": "à",
  "atilde": "ã",
  "auml": "ä",
  "ccedil": "ç",
  "eacute": "é",
  "ecirc": "ê",
  "egrave": "è",
  "euml": "ë",
  "iacute": "í",
  "icirc": "î",
  "igrave": "ì",
  "iuml": "ï",
  "oacute": "ó",
  "ocirc": "ô",
  "ograve": "ò",
  "otilde": "õ",
  "ouml": "ö",
  "uacute": "ú",
  "ucirc": "û",
  "ugrave": "ù",
  "uuml": "ü"
};
enum HtmlTagContentType { RAW_TEXT, ESCAPABLE_RAW_TEXT, PARSABLE_DATA }

class HtmlTagDefinition {
  Map<String, bool> closedByChildren = {};
  bool closedByParent = false;
  Map<String, bool> requiredParents;
  String parentToAdd;
  String implicitNamespacePrefix;
  HtmlTagContentType contentType;
  HtmlTagDefinition(
      {closedByChildren,
      requiredParents,
      implicitNamespacePrefix,
      contentType,
      closedByParent}) {
    if (isPresent(closedByChildren) && closedByChildren.length > 0) {
      closedByChildren
          .forEach((tagName) => this.closedByChildren[tagName] = true);
    }
    this.closedByParent = normalizeBool(closedByParent);
    if (isPresent(requiredParents) && requiredParents.length > 0) {
      this.requiredParents = {};
      this.parentToAdd = requiredParents[0];
      requiredParents
          .forEach((tagName) => this.requiredParents[tagName] = true);
    }
    this.implicitNamespacePrefix = implicitNamespacePrefix;
    this.contentType =
        isPresent(contentType) ? contentType : HtmlTagContentType.PARSABLE_DATA;
  }
  bool requireExtraParent(String currentParent) {
    return isPresent(this.requiredParents) &&
        (isBlank(currentParent) ||
            this.requiredParents[currentParent.toLowerCase()] != true);
  }

  bool isClosedByChild(String name) {
    return normalizeBool(this.closedByChildren["*"]) ||
        normalizeBool(this.closedByChildren[name.toLowerCase()]);
  }
}
// see http://www.w3.org/TR/html51/syntax.html#optional-tags

// This implementation does not fully conform to the HTML5 spec.
Map<String, HtmlTagDefinition> TAG_DEFINITIONS = {
  "link": new HtmlTagDefinition(closedByChildren: ["*"], closedByParent: true),
  "ng-content":
      new HtmlTagDefinition(closedByChildren: ["*"], closedByParent: true),
  "img": new HtmlTagDefinition(closedByChildren: ["*"], closedByParent: true),
  "input": new HtmlTagDefinition(closedByChildren: ["*"], closedByParent: true),
  "hr": new HtmlTagDefinition(closedByChildren: ["*"], closedByParent: true),
  "br": new HtmlTagDefinition(closedByChildren: ["*"], closedByParent: true),
  "wbr": new HtmlTagDefinition(closedByChildren: ["*"], closedByParent: true),
  "p": new HtmlTagDefinition(closedByChildren: [
    "address",
    "article",
    "aside",
    "blockquote",
    "div",
    "dl",
    "fieldset",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "header",
    "hgroup",
    "hr",
    "main",
    "nav",
    "ol",
    "p",
    "pre",
    "section",
    "table",
    "ul"
  ], closedByParent: true),
  "thead": new HtmlTagDefinition(closedByChildren: ["tbody", "tfoot"]),
  "tbody": new HtmlTagDefinition(
      closedByChildren: ["tbody", "tfoot"], closedByParent: true),
  "tfoot":
      new HtmlTagDefinition(closedByChildren: ["tbody"], closedByParent: true),
  "tr": new HtmlTagDefinition(
      closedByChildren: ["tr"],
      requiredParents: ["tbody", "tfoot", "thead"],
      closedByParent: true),
  "td": new HtmlTagDefinition(
      closedByChildren: ["td", "th"], closedByParent: true),
  "th": new HtmlTagDefinition(
      closedByChildren: ["td", "th"], closedByParent: true),
  "col": new HtmlTagDefinition(
      closedByChildren: ["col"], requiredParents: ["colgroup"]),
  "svg": new HtmlTagDefinition(implicitNamespacePrefix: "svg"),
  "math": new HtmlTagDefinition(implicitNamespacePrefix: "math"),
  "li": new HtmlTagDefinition(closedByChildren: ["li"], closedByParent: true),
  "dt": new HtmlTagDefinition(closedByChildren: ["dt", "dd"]),
  "dd": new HtmlTagDefinition(
      closedByChildren: ["dt", "dd"], closedByParent: true),
  "rb": new HtmlTagDefinition(
      closedByChildren: ["rb", "rt", "rtc", "rp"], closedByParent: true),
  "rt": new HtmlTagDefinition(
      closedByChildren: ["rb", "rt", "rtc", "rp"], closedByParent: true),
  "rtc": new HtmlTagDefinition(
      closedByChildren: ["rb", "rtc", "rp"], closedByParent: true),
  "rp": new HtmlTagDefinition(
      closedByChildren: ["rb", "rt", "rtc", "rp"], closedByParent: true),
  "optgroup": new HtmlTagDefinition(
      closedByChildren: ["optgroup"], closedByParent: true),
  "option": new HtmlTagDefinition(
      closedByChildren: ["option", "optgroup"], closedByParent: true),
  "style": new HtmlTagDefinition(contentType: HtmlTagContentType.RAW_TEXT),
  "script": new HtmlTagDefinition(contentType: HtmlTagContentType.RAW_TEXT),
  "title":
      new HtmlTagDefinition(contentType: HtmlTagContentType.ESCAPABLE_RAW_TEXT),
  "textarea":
      new HtmlTagDefinition(contentType: HtmlTagContentType.ESCAPABLE_RAW_TEXT)
};
var DEFAULT_TAG_DEFINITION = new HtmlTagDefinition();
HtmlTagDefinition getHtmlTagDefinition(String tagName) {
  var result = TAG_DEFINITIONS[tagName.toLowerCase()];
  return isPresent(result) ? result : DEFAULT_TAG_DEFINITION;
}
