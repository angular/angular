library angular2.src.compiler.html_tags;

import "package:angular2/src/facade/lang.dart"
    show isPresent, isBlank, normalizeBool;
// see http://www.w3.org/TR/html51/syntax.html#named-character-references

// see https://html.spec.whatwg.org/multipage/entities.json

// This list is not exhaustive to keep the compiler footprint low.

// The `&#123;` / `&#x1ab;` syntax should be used when the named character reference does not exist.
const NAMED_ENTITIES = const {
  "Aacute": "Á",
  "aacute": "á",
  "Acirc": "Â",
  "acirc": "â",
  "acute": "´",
  "AElig": "Æ",
  "aelig": "æ",
  "Agrave": "À",
  "agrave": "à",
  "alefsym": "ℵ",
  "Alpha": "Α",
  "alpha": "α",
  "amp": "&",
  "and": "∧",
  "ang": "∠",
  "apos": "'",
  "Aring": "Å",
  "aring": "å",
  "asymp": "≈",
  "Atilde": "Ã",
  "atilde": "ã",
  "Auml": "Ä",
  "auml": "ä",
  "bdquo": "„",
  "Beta": "Β",
  "beta": "β",
  "brvbar": "¦",
  "bull": "•",
  "cap": "∩",
  "Ccedil": "Ç",
  "ccedil": "ç",
  "cedil": "¸",
  "cent": "¢",
  "Chi": "Χ",
  "chi": "χ",
  "circ": "ˆ",
  "clubs": "♣",
  "cong": "≅",
  "copy": "©",
  "crarr": "↵",
  "cup": "∪",
  "curren": "¤",
  "dagger": "†",
  "Dagger": "‡",
  "darr": "↓",
  "dArr": "⇓",
  "deg": "°",
  "Delta": "Δ",
  "delta": "δ",
  "diams": "♦",
  "divide": "÷",
  "Eacute": "É",
  "eacute": "é",
  "Ecirc": "Ê",
  "ecirc": "ê",
  "Egrave": "È",
  "egrave": "è",
  "empty": "∅",
  "emsp": " ",
  "ensp": " ",
  "Epsilon": "Ε",
  "epsilon": "ε",
  "equiv": "≡",
  "Eta": "Η",
  "eta": "η",
  "ETH": "Ð",
  "eth": "ð",
  "Euml": "Ë",
  "euml": "ë",
  "euro": "€",
  "exist": "∃",
  "fnof": "ƒ",
  "forall": "∀",
  "frac12": "½",
  "frac14": "¼",
  "frac34": "¾",
  "frasl": "⁄",
  "Gamma": "Γ",
  "gamma": "γ",
  "ge": "≥",
  "gt": ">",
  "harr": "↔",
  "hArr": "⇔",
  "hearts": "♥",
  "hellip": "…",
  "Iacute": "Í",
  "iacute": "í",
  "Icirc": "Î",
  "icirc": "î",
  "iexcl": "¡",
  "Igrave": "Ì",
  "igrave": "ì",
  "image": "ℑ",
  "infin": "∞",
  "int": "∫",
  "Iota": "Ι",
  "iota": "ι",
  "iquest": "¿",
  "isin": "∈",
  "Iuml": "Ï",
  "iuml": "ï",
  "Kappa": "Κ",
  "kappa": "κ",
  "Lambda": "Λ",
  "lambda": "λ",
  "lang": "⟨",
  "laquo": "«",
  "larr": "←",
  "lArr": "⇐",
  "lceil": "⌈",
  "ldquo": "“",
  "le": "≤",
  "lfloor": "⌊",
  "lowast": "∗",
  "loz": "◊",
  "lrm": "‎",
  "lsaquo": "‹",
  "lsquo": "‘",
  "lt": "<",
  "macr": "¯",
  "mdash": "—",
  "micro": "µ",
  "middot": "·",
  "minus": "−",
  "Mu": "Μ",
  "mu": "μ",
  "nabla": "∇",
  "nbsp": " ",
  "ndash": "–",
  "ne": "≠",
  "ni": "∋",
  "not": "¬",
  "notin": "∉",
  "nsub": "⊄",
  "Ntilde": "Ñ",
  "ntilde": "ñ",
  "Nu": "Ν",
  "nu": "ν",
  "Oacute": "Ó",
  "oacute": "ó",
  "Ocirc": "Ô",
  "ocirc": "ô",
  "OElig": "Œ",
  "oelig": "œ",
  "Ograve": "Ò",
  "ograve": "ò",
  "oline": "‾",
  "Omega": "Ω",
  "omega": "ω",
  "Omicron": "Ο",
  "omicron": "ο",
  "oplus": "⊕",
  "or": "∨",
  "ordf": "ª",
  "ordm": "º",
  "Oslash": "Ø",
  "oslash": "ø",
  "Otilde": "Õ",
  "otilde": "õ",
  "otimes": "⊗",
  "Ouml": "Ö",
  "ouml": "ö",
  "para": "¶",
  "permil": "‰",
  "perp": "⊥",
  "Phi": "Φ",
  "phi": "φ",
  "Pi": "Π",
  "pi": "π",
  "piv": "ϖ",
  "plusmn": "±",
  "pound": "£",
  "prime": "′",
  "Prime": "″",
  "prod": "∏",
  "prop": "∝",
  "Psi": "Ψ",
  "psi": "ψ",
  "quot": "\"",
  "radic": "√",
  "rang": "⟩",
  "raquo": "»",
  "rarr": "→",
  "rArr": "⇒",
  "rceil": "⌉",
  "rdquo": "”",
  "real": "ℜ",
  "reg": "®",
  "rfloor": "⌋",
  "Rho": "Ρ",
  "rho": "ρ",
  "rlm": "‏",
  "rsaquo": "›",
  "rsquo": "’",
  "sbquo": "‚",
  "Scaron": "Š",
  "scaron": "š",
  "sdot": "⋅",
  "sect": "§",
  "shy": "­",
  "Sigma": "Σ",
  "sigma": "σ",
  "sigmaf": "ς",
  "sim": "∼",
  "spades": "♠",
  "sub": "⊂",
  "sube": "⊆",
  "sum": "∑",
  "sup": "⊃",
  "sup1": "¹",
  "sup2": "²",
  "sup3": "³",
  "supe": "⊇",
  "szlig": "ß",
  "Tau": "Τ",
  "tau": "τ",
  "there4": "∴",
  "Theta": "Θ",
  "theta": "θ",
  "thetasym": "ϑ",
  "thinsp": " ",
  "THORN": "Þ",
  "thorn": "þ",
  "tilde": "˜",
  "times": "×",
  "trade": "™",
  "Uacute": "Ú",
  "uacute": "ú",
  "uarr": "↑",
  "uArr": "⇑",
  "Ucirc": "Û",
  "ucirc": "û",
  "Ugrave": "Ù",
  "ugrave": "ù",
  "uml": "¨",
  "upsih": "ϒ",
  "Upsilon": "Υ",
  "upsilon": "υ",
  "Uuml": "Ü",
  "uuml": "ü",
  "weierp": "℘",
  "Xi": "Ξ",
  "xi": "ξ",
  "Yacute": "Ý",
  "yacute": "ý",
  "yen": "¥",
  "yuml": "ÿ",
  "Yuml": "Ÿ",
  "Zeta": "Ζ",
  "zeta": "ζ",
  "zwj": "‍",
  "zwnj": "‌"
};
enum HtmlTagContentType { RAW_TEXT, ESCAPABLE_RAW_TEXT, PARSABLE_DATA }

class HtmlTagDefinition {
  Map<String, bool> closedByChildren = {};
  bool closedByParent = false;
  Map<String, bool> requiredParents;
  String parentToAdd;
  String implicitNamespacePrefix;
  HtmlTagContentType contentType;
  bool isVoid;
  HtmlTagDefinition(
      {closedByChildren,
      requiredParents,
      implicitNamespacePrefix,
      contentType,
      closedByParent,
      isVoid}) {
    if (isPresent(closedByChildren) && closedByChildren.length > 0) {
      closedByChildren
          .forEach((tagName) => this.closedByChildren[tagName] = true);
    }
    this.isVoid = normalizeBool(isVoid);
    this.closedByParent = normalizeBool(closedByParent) || this.isVoid;
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
    return this.isVoid ||
        normalizeBool(this.closedByChildren[name.toLowerCase()]);
  }
}
// see http://www.w3.org/TR/html51/syntax.html#optional-tags

// This implementation does not fully conform to the HTML5 spec.
Map<String, HtmlTagDefinition> TAG_DEFINITIONS = {
  "area": new HtmlTagDefinition(isVoid: true),
  "embed": new HtmlTagDefinition(isVoid: true),
  "link": new HtmlTagDefinition(isVoid: true),
  "img": new HtmlTagDefinition(isVoid: true),
  "input": new HtmlTagDefinition(isVoid: true),
  "param": new HtmlTagDefinition(isVoid: true),
  "hr": new HtmlTagDefinition(isVoid: true),
  "br": new HtmlTagDefinition(isVoid: true),
  "source": new HtmlTagDefinition(isVoid: true),
  "track": new HtmlTagDefinition(isVoid: true),
  "wbr": new HtmlTagDefinition(isVoid: true),
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
  "col": new HtmlTagDefinition(requiredParents: ["colgroup"], isVoid: true),
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
