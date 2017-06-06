import {ParseSourceSpan, ParseError} from 'angular2/src/compiler/parse_util';
import {
  HtmlAst,
  HtmlAstVisitor,
  HtmlElementAst,
  HtmlAttrAst,
  HtmlTextAst,
  HtmlCommentAst,
  HtmlExpansionAst,
  HtmlExpansionCaseAst,
  htmlVisitAll
} from 'angular2/src/compiler/html_ast';
import {isPresent, isBlank, StringWrapper} from 'angular2/src/facade/lang';
import {Message} from './message';
import {Parser} from 'angular2/src/compiler/expression_parser/parser';

export const I18N_ATTR = "i18n";
export const I18N_ATTR_PREFIX = "i18n-";
var CUSTOM_PH_EXP = /\/\/[\s\S]*i18n[\s\S]*\([\s\S]*ph[\s\S]*=[\s\S]*"([\s\S]*?)"[\s\S]*\)/g;

/**
 * An i18n error.
 */
export class I18nError extends ParseError {
  constructor(span: ParseSourceSpan, msg: string) { super(span, msg); }
}


// Man, this is so ugly!
export function partition(nodes: HtmlAst[], errors: ParseError[]): Part[] {
  let res = [];

  for (let i = 0; i < nodes.length; ++i) {
    let n = nodes[i];
    let temp = [];
    if (_isOpeningComment(n)) {
      let i18n = (<HtmlCommentAst>n).value.substring(5).trim();
      i++;
      while (!_isClosingComment(nodes[i])) {
        temp.push(nodes[i++]);
        if (i === nodes.length) {
          errors.push(new I18nError(n.sourceSpan, "Missing closing 'i18n' comment."));
          break;
        }
      }
      res.push(new Part(null, null, temp, i18n, true));

    } else if (n instanceof HtmlElementAst) {
      let i18n = _findI18nAttr(n);
      res.push(new Part(n, null, n.children, isPresent(i18n) ? i18n.value : null, isPresent(i18n)));
    } else if (n instanceof HtmlTextAst) {
      res.push(new Part(null, n, null, null, false));
    }
  }

  return res;
}

export class Part {
  constructor(public rootElement: HtmlElementAst, public rootTextNode: HtmlTextAst,
              public children: HtmlAst[], public i18n: string, public hasI18n: boolean) {}

  get sourceSpan(): ParseSourceSpan {
    if (isPresent(this.rootElement))
      return this.rootElement.sourceSpan;
    else if (isPresent(this.rootTextNode))
      return this.rootTextNode.sourceSpan;
    else
      return this.children[0].sourceSpan;
  }

  createMessage(parser: Parser): Message {
    return new Message(stringifyNodes(this.children, parser), meaning(this.i18n),
                       description(this.i18n));
  }
}

function _isOpeningComment(n: HtmlAst): boolean {
  return n instanceof HtmlCommentAst && isPresent(n.value) && n.value.startsWith("i18n:");
}

function _isClosingComment(n: HtmlAst): boolean {
  return n instanceof HtmlCommentAst && isPresent(n.value) && n.value == "/i18n";
}

function _findI18nAttr(p: HtmlElementAst): HtmlAttrAst {
  let i18n = p.attrs.filter(a => a.name == I18N_ATTR);
  return i18n.length == 0 ? null : i18n[0];
}

export function meaning(i18n: string): string {
  if (isBlank(i18n) || i18n == "") return null;
  return i18n.split("|")[0];
}

export function description(i18n: string): string {
  if (isBlank(i18n) || i18n == "") return null;
  let parts = i18n.split("|");
  return parts.length > 1 ? parts[1] : null;
}

export function messageFromAttribute(parser: Parser, p: HtmlElementAst,
                                     attr: HtmlAttrAst): Message {
  let expectedName = attr.name.substring(5);
  let matching = p.attrs.filter(a => a.name == expectedName);

  if (matching.length > 0) {
    let value = removeInterpolation(matching[0].value, matching[0].sourceSpan, parser);
    return new Message(value, meaning(attr.value), description(attr.value));
  } else {
    throw new I18nError(p.sourceSpan, `Missing attribute '${expectedName}'.`);
  }
}

export function removeInterpolation(value: string, source: ParseSourceSpan,
                                    parser: Parser): string {
  try {
    let parsed = parser.splitInterpolation(value, source.toString());
    let usedNames = new Map<string, number>();
    if (isPresent(parsed)) {
      let res = "";
      for (let i = 0; i < parsed.strings.length; ++i) {
        res += parsed.strings[i];
        if (i != parsed.strings.length - 1) {
          let customPhName = getPhNameFromBinding(parsed.expressions[i], i);
          customPhName = dedupePhName(usedNames, customPhName);
          res += `<ph name="${customPhName}"/>`;
        }
      }
      return res;
    } else {
      return value;
    }
  } catch (e) {
    return value;
  }
}

export function getPhNameFromBinding(input: string, index: number): string {
  let customPhMatch = StringWrapper.split(input, CUSTOM_PH_EXP);
  return customPhMatch.length > 1 ? customPhMatch[1] : `${index}`;
}

export function dedupePhName(usedNames: Map<string, number>, name: string): string {
  let duplicateNameCount = usedNames.get(name);
  if (isPresent(duplicateNameCount)) {
    usedNames.set(name, duplicateNameCount + 1);
    return `${name}_${duplicateNameCount}`;
  } else {
    usedNames.set(name, 1);
    return name;
  }
}

export function stringifyNodes(nodes: HtmlAst[], parser: Parser): string {
  let visitor = new _StringifyVisitor(parser);
  return htmlVisitAll(visitor, nodes).join("");
}

class _StringifyVisitor implements HtmlAstVisitor {
  private _index: number = 0;
  constructor(private _parser: Parser) {}

  visitElement(ast: HtmlElementAst, context: any): any {
    let name = this._index++;
    let children = this._join(htmlVisitAll(this, ast.children), "");
    return `<ph name="e${name}">${children}</ph>`;
  }

  visitAttr(ast: HtmlAttrAst, context: any): any { return null; }

  visitText(ast: HtmlTextAst, context: any): any {
    let index = this._index++;
    let noInterpolation = removeInterpolation(ast.value, ast.sourceSpan, this._parser);
    if (noInterpolation != ast.value) {
      return `<ph name="t${index}">${noInterpolation}</ph>`;
    } else {
      return ast.value;
    }
  }

  visitComment(ast: HtmlCommentAst, context: any): any { return ""; }

  visitExpansion(ast: HtmlExpansionAst, context: any): any { return null; }

  visitExpansionCase(ast: HtmlExpansionCaseAst, context: any): any { return null; }

  private _join(strs: string[], str: string): string {
    return strs.filter(s => s.length > 0).join(str);
  }
}
