import {HtmlParser} from 'angular2/src/compiler/html_parser';
import {ParseSourceSpan, ParseError} from 'angular2/src/compiler/parse_util';
import {
  HtmlAst,
  HtmlAstVisitor,
  HtmlElementAst,
  HtmlAttrAst,
  HtmlTextAst,
  HtmlCommentAst,
  htmlVisitAll
} from 'angular2/src/compiler/html_ast';
import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {StringMapWrapper} from 'angular2/src/facade/collection';
import {Parser} from 'angular2/src/core/change_detection/parser/parser';
import {Interpolation} from 'angular2/src/core/change_detection/parser/ast';
import {Message, id} from './message';

const I18N_ATTR = "i18n";
const I18N_ATTR_PREFIX = "i18n-";

/**
 * All messages extracted from a template.
 */
export class ExtractionResult {
  constructor(public messages: Message[], public errors: ParseError[]) {}
}

/**
 * An extraction error.
 */
export class I18nExtractionError extends ParseError {
  constructor(span: ParseSourceSpan, msg: string) { super(span, msg); }
}

/**
 * Removes duplicate messages.
 *
 * E.g.
 *
 * ```
 *  var m = [new Message("message", "meaning", "desc1"), new Message("message", "meaning",
 * "desc2")];
 *  expect(removeDuplicates(m)).toEqual([new Message("message", "meaning", "desc1")]);
 * ```
 */
export function removeDuplicates(messages: Message[]): Message[] {
  let uniq: {[key: string]: Message} = {};
  messages.forEach(m => {
    if (!StringMapWrapper.contains(uniq, id(m))) {
      uniq[id(m)] = m;
    }
  });
  return StringMapWrapper.values(uniq);
}

/**
 * Extracts all messages from a template.
 *
 * It works like this. First, the extractor uses the provided html parser to get
 * the html AST of the template. Then it partitions the root nodes into parts.
 * Everything between two i18n comments becomes a single part. Every other nodes becomes
 * a part too.
 *
 * We process every part as follows. Say we have a part A.
 *
 * If the part has the i18n attribute, it gets converted into a message.
 * And we do not recurse into that part, except to extract messages from the attributes.
 *
 * If the part doesn't have the i18n attribute, we recurse into that part and
 * partition its children.
 *
 * While walking the AST we also remove i18n attributes from messages.
 */
export class MessageExtractor {
  messages: Message[];
  errors: ParseError[];

  constructor(private _htmlParser: HtmlParser, private _parser: Parser) {}

  extract(template: string, sourceUrl: string): ExtractionResult {
    this.messages = [];
    this.errors = [];

    let res = this._htmlParser.parse(template, sourceUrl);
    if (res.errors.length > 0) {
      return new ExtractionResult([], res.errors);
    } else {
      let ps = this._partition(res.rootNodes);
      ps.forEach(p => this._extractMessagesFromPart(p));
      return new ExtractionResult(this.messages, this.errors);
    }
  }

  private _extractMessagesFromPart(p: _Part): void {
    if (p.hasI18n) {
      this.messages.push(new Message(_stringifyNodes(p.children, this._parser), _meaning(p.i18n),
                                     _description(p.i18n)));
      this._recurseToExtractMessagesFromAttributes(p.children);
    } else {
      this._recurse(p.children);
    }

    if (isPresent(p.rootElement)) {
      this._extractMessagesFromAttributes(p.rootElement);
    }
  }

  private _recurse(nodes: HtmlAst[]): void {
    let ps = this._partition(nodes);
    ps.forEach(p => this._extractMessagesFromPart(p));
  }

  private _recurseToExtractMessagesFromAttributes(nodes: HtmlAst[]): void {
    nodes.forEach(n => {
      if (n instanceof HtmlElementAst) {
        this._extractMessagesFromAttributes(n);
        this._recurseToExtractMessagesFromAttributes(n.children);
      }
    });
  }

  private _extractMessagesFromAttributes(p: HtmlElementAst): void {
    p.attrs.forEach(attr => {
      if (attr.name.startsWith(I18N_ATTR_PREFIX)) {
        let expectedName = attr.name.substring(5);
        let matching = p.attrs.filter(a => a.name == expectedName);

        if (matching.length > 0) {
          let value = _removeInterpolation(matching[0].value, p.sourceSpan, this._parser);
          this.messages.push(new Message(value, _meaning(attr.value), _description(attr.value)));
        } else {
          this.errors.push(
              new I18nExtractionError(p.sourceSpan, `Missing attribute '${expectedName}'.`));
        }
      }
    });
  }

  // Man, this is so ugly!
  private _partition(nodes: HtmlAst[]): _Part[] {
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
            this.errors.push(
                new I18nExtractionError(n.sourceSpan, "Missing closing 'i18n' comment."));
            break;
          }
        }
        res.push(new _Part(null, temp, i18n, true));

      } else if (n instanceof HtmlElementAst) {
        let i18n = _findI18nAttr(n);
        res.push(new _Part(n, n.children, isPresent(i18n) ? i18n.value : null, isPresent(i18n)));
      }
    }

    return res;
  }
}

class _Part {
  constructor(public rootElement: HtmlElementAst, public children: HtmlAst[], public i18n: string,
              public hasI18n: boolean) {}
}

function _isOpeningComment(n: HtmlAst): boolean {
  return n instanceof HtmlCommentAst && isPresent(n.value) && n.value.startsWith("i18n:");
}

function _isClosingComment(n: HtmlAst): boolean {
  return n instanceof HtmlCommentAst && isPresent(n.value) && n.value == "/i18n";
}

function _stringifyNodes(nodes: HtmlAst[], parser: Parser) {
  let visitor = new _StringifyVisitor(parser);
  return htmlVisitAll(visitor, nodes).join("");
}

class _StringifyVisitor implements HtmlAstVisitor {
  constructor(private _parser: Parser) {}

  visitElement(ast: HtmlElementAst, context: any): any {
    let attrs = this._join(htmlVisitAll(this, ast.attrs), " ");
    let children = this._join(htmlVisitAll(this, ast.children), "");
    return `<${ast.name} ${attrs}>${children}</${ast.name}>`;
  }

  visitAttr(ast: HtmlAttrAst, context: any): any {
    if (ast.name.startsWith(I18N_ATTR_PREFIX)) {
      return "";
    } else {
      return `${ast.name}="${ast.value}"`;
    }
  }

  visitText(ast: HtmlTextAst, context: any): any {
    return _removeInterpolation(ast.value, ast.sourceSpan, this._parser);
  }

  visitComment(ast: HtmlCommentAst, context: any): any { return ""; }

  private _join(strs: string[], str: string): string {
    return strs.filter(s => s.length > 0).join(str);
  }
}

function _removeInterpolation(value: string, source: ParseSourceSpan, parser: Parser): string {
  try {
    let parsed = parser.parseInterpolation(value, source.toString());
    if (isPresent(parsed)) {
      let ast: Interpolation = <any>parsed.ast;
      let res = "";
      for (let i = 0; i < ast.strings.length; ++i) {
        res += ast.strings[i];
        if (i != ast.strings.length - 1) {
          res += `{{I${i}}}`;
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

function _findI18nAttr(p: HtmlElementAst): HtmlAttrAst {
  let i18n = p.attrs.filter(a => a.name == I18N_ATTR);
  return i18n.length == 0 ? null : i18n[0];
}

function _meaning(i18n: string): string {
  if (isBlank(i18n) || i18n == "") return null;
  return i18n.split("|")[0];
}

function _description(i18n: string): string {
  if (isBlank(i18n) || i18n == "") return null;
  let parts = i18n.split("|");
  return parts.length > 1 ? parts[1] : null;
}