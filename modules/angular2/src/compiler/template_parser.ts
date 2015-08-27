import {MapWrapper, ListWrapper} from 'angular2/src/core/facade/collection';
import {
  RegExpWrapper,
  isPresent,
  StringWrapper,
  BaseException,
  StringJoiner,
  stringify,
  assertionsEnabled,
  isBlank
} from 'angular2/src/core/facade/lang';

import {Parser, AST, ASTWithSource} from 'angular2/src/core/change_detection/change_detection';

import {DirectiveMetadata} from './api';
import {
  ElementAst,
  BoundPropertyAst,
  BoundEventAst,
  VariableAst,
  TemplateAst,
  TextAst,
  BoundTextAst,
  EmbeddedTemplateAst,
  AttrAst,
  NgContentAst
} from './template_ast';
import {CssSelector, SelectorMatcher} from 'angular2/src/core/render/dom/compiler/selector';

import {
  HtmlAstVisitor,
  HtmlAst,
  HtmlElementAst,
  HtmlAttrAst,
  HtmlTextAst,
  htmlVisitAll
} from './html_ast';

import {dashCaseToCamelCase} from './util';

// Group 1 = "bind-"
// Group 2 = "var-" or "#"
// Group 3 = "on-"
// Group 4 = "bindon-"
// Group 5 = the identifier after "bind-", "var-/#", or "on-"
// Group 6 = idenitifer inside [()]
// Group 7 = idenitifer inside []
// Group 8 = identifier inside ()
var BIND_NAME_REGEXP =
    /^(?:(?:(?:(bind-)|(var-|#)|(on-)|(bindon-))(.+))|\[\(([^\)]+)\)\]|\[([^\]]+)\]|\(([^\)]+)\))$/g;

const NG_CONTENT_SELECT_ATTR = 'select';
const NG_CONTENT_ELEMENT = 'ng-content';
const TEMPLATE_ELEMENT = 'template';
const TEMPLATE_ATTR = 'template';
const TEMPLATE_ATTR_PREFIX = '*';
const CLASS_ATTR = 'class';
const IMPLICIT_VAR_NAME = '$implicit';

export class TemplateParser {
  constructor(private _exprParser: Parser) {}

  parse(domNodes: HtmlAst[], directives: DirectiveMetadata[]): TemplateAst[] {
    var parseVisitor = new TemplateParseVisitor(directives, this._exprParser);
    return htmlVisitAll(parseVisitor, domNodes);
  }
}

class TemplateParseVisitor implements HtmlAstVisitor {
  selectorMatcher: SelectorMatcher;
  constructor(directives: DirectiveMetadata[], private _exprParser: Parser) {
    this.selectorMatcher = new SelectorMatcher();
    directives.forEach(directive => {
      var selector = CssSelector.parse(directive.selector);
      this.selectorMatcher.addSelectables(selector, directive);
    });
  }

  visitText(ast: HtmlTextAst): any {
    var expr = this._exprParser.parseInterpolation(ast.value, ast.sourceInfo);
    if (isPresent(expr)) {
      return new BoundTextAst(expr, ast.sourceInfo);
    } else {
      return new TextAst(ast.value, ast.sourceInfo);
    }
  }

  visitAttr(ast: HtmlAttrAst): any { return new AttrAst(ast.name, ast.value, ast.sourceInfo); }

  visitElement(element: HtmlElementAst): any {
    var nodeName = element.name;
    var matchableAttrs: string[][] = [];
    var props: BoundPropertyAst[] = [];
    var vars: VariableAst[] = [];
    var events: BoundEventAst[] = [];

    var templateProps: BoundPropertyAst[] = [];
    var templateVars: VariableAst[] = [];
    var templateMatchableAttrs: string[][] = [];
    var hasInlineTemplates = false;
    var attrs = [];
    var selectAttr = null;
    element.attrs.forEach(attr => {
      matchableAttrs.push([attr.name, attr.value]);
      if (attr.name == NG_CONTENT_SELECT_ATTR) {
        selectAttr = attr.value;
      }
      var hasBinding = this._parseAttr(attr, matchableAttrs, props, events, vars);
      var hasTemplateBinding = this._parseInlineTemplateBinding(attr, templateMatchableAttrs,
                                                                templateProps, templateVars);
      if (!hasBinding && !hasTemplateBinding) {
        // don't include the bindings as attributes as well in the AST
        attrs.push(this.visitAttr(attr));
      }
      if (hasTemplateBinding) {
        hasInlineTemplates = true;
      }
    });
    var directives = this._parseDirectives(this.selectorMatcher, nodeName, matchableAttrs);
    var children = htmlVisitAll(this, element.children);
    var parsedElement;
    if (nodeName == NG_CONTENT_ELEMENT) {
      parsedElement = new NgContentAst(selectAttr, element.sourceInfo);
    } else if (nodeName == TEMPLATE_ELEMENT) {
      parsedElement =
          new EmbeddedTemplateAst(attrs, props, vars, directives, children, element.sourceInfo);
    } else {
      parsedElement =
          new ElementAst(attrs, props, events, vars, directives, children, element.sourceInfo);
    }
    if (hasInlineTemplates) {
      var templateDirectives =
          this._parseDirectives(this.selectorMatcher, TEMPLATE_ELEMENT, templateMatchableAttrs);
      parsedElement = new EmbeddedTemplateAst([], templateProps, templateVars, templateDirectives,
                                              [parsedElement], element.sourceInfo);
    }
    return parsedElement;
  }

  private _parseInlineTemplateBinding(attr: HtmlAttrAst, matchableAttrs: string[][],
                                      props: BoundPropertyAst[], vars: VariableAst[]): boolean {
    var templateBindingsSource = null;
    if (attr.name == TEMPLATE_ATTR) {
      templateBindingsSource = attr.value;
    } else if (StringWrapper.startsWith(attr.name, TEMPLATE_ATTR_PREFIX)) {
      var key = StringWrapper.substring(attr.name, TEMPLATE_ATTR_PREFIX.length);  // remove the star
      templateBindingsSource = (attr.value.length == 0) ? key : key + ' ' + attr.value;
    }
    if (isPresent(templateBindingsSource)) {
      var bindings =
          this._exprParser.parseTemplateBindings(templateBindingsSource, attr.sourceInfo);
      for (var i = 0; i < bindings.length; i++) {
        var binding = bindings[i];
        if (binding.keyIsVar) {
          vars.push(
              new VariableAst(dashCaseToCamelCase(binding.key), binding.name, attr.sourceInfo));
          matchableAttrs.push([binding.key, binding.name]);
        } else if (isPresent(binding.expression)) {
          props.push(new BoundPropertyAst(dashCaseToCamelCase(binding.key), binding.expression,
                                          attr.sourceInfo));
          matchableAttrs.push([binding.key, binding.expression.source]);
        } else {
          matchableAttrs.push([binding.key, '']);
        }
      }
      return true;
    }
    return false;
  }

  private _parseAttr(attr: HtmlAttrAst, matchableAttrs: string[][], props: BoundPropertyAst[],
                     events: BoundEventAst[], vars: VariableAst[]): boolean {
    var attrName = this._normalizeAttributeName(attr.name);
    var attrValue = attr.value;
    var bindParts = RegExpWrapper.firstMatch(BIND_NAME_REGEXP, attrName);
    var hasBinding = false;
    if (isPresent(bindParts)) {
      hasBinding = true;
      if (isPresent(bindParts[1])) {  // match: bind-prop
        this._parseProperty(bindParts[5], attrValue, attr.sourceInfo, matchableAttrs, props);

      } else if (isPresent(
                     bindParts[2])) {  // match: var-name / var-name="iden" / #name / #name="iden"
        var identifier = bindParts[5];
        var value = attrValue.length === 0 ? IMPLICIT_VAR_NAME : attrValue;
        this._parseVariable(identifier, value, attr.sourceInfo, matchableAttrs, vars);

      } else if (isPresent(bindParts[3])) {  // match: on-event
        this._parseEvent(bindParts[5], attrValue, attr.sourceInfo, matchableAttrs, events);

      } else if (isPresent(bindParts[4])) {  // match: bindon-prop
        this._parseProperty(bindParts[5], attrValue, attr.sourceInfo, matchableAttrs, props);
        this._parseAssignmentEvent(bindParts[5], attrValue, attr.sourceInfo, matchableAttrs,
                                   events);

      } else if (isPresent(bindParts[6])) {  // match: [(expr)]
        this._parseProperty(bindParts[6], attrValue, attr.sourceInfo, matchableAttrs, props);
        this._parseAssignmentEvent(bindParts[6], attrValue, attr.sourceInfo, matchableAttrs,
                                   events);

      } else if (isPresent(bindParts[7])) {  // match: [expr]
        this._parseProperty(bindParts[7], attrValue, attr.sourceInfo, matchableAttrs, props);

      } else if (isPresent(bindParts[8])) {  // match: (event)
        this._parseEvent(bindParts[8], attrValue, attr.sourceInfo, matchableAttrs, events);
      }
    } else {
      hasBinding = this._parsePropertyInterpolation(attrName, attrValue, attr.sourceInfo,
                                                    matchableAttrs, props);
    }
    return hasBinding;
  }

  private _normalizeAttributeName(attrName: string): string {
    return StringWrapper.startsWith(attrName, 'data-') ? StringWrapper.substring(attrName, 5) :
                                                         attrName;
  }

  private _parseVariable(identifier: string, value: string, sourceInfo: any,
                         matchableAttrs: string[][], vars: VariableAst[]) {
    vars.push(new VariableAst(dashCaseToCamelCase(identifier), value, sourceInfo));
    matchableAttrs.push([identifier, value]);
  }

  private _parseProperty(name: string, expression: string, sourceInfo: any,
                         matchableAttrs: string[][], props: BoundPropertyAst[]) {
    this._parsePropertyAst(name, this._exprParser.parseBinding(expression, sourceInfo), sourceInfo,
                           matchableAttrs, props);
  }

  private _parsePropertyInterpolation(name: string, value: string, sourceInfo: any,
                                      matchableAttrs: string[][],
                                      props: BoundPropertyAst[]): boolean {
    var expr = this._exprParser.parseInterpolation(value, sourceInfo);
    if (isPresent(expr)) {
      this._parsePropertyAst(name, expr, sourceInfo, matchableAttrs, props);
      return true;
    }
    return false;
  }

  private _parsePropertyAst(name: string, ast: ASTWithSource, sourceInfo: any,
                            matchableAttrs: string[][], props: BoundPropertyAst[]) {
    props.push(new BoundPropertyAst(dashCaseToCamelCase(name), ast, sourceInfo));
    matchableAttrs.push([name, ast.source]);
  }

  private _parseAssignmentEvent(name: string, expression: string, sourceInfo: string,
                                matchableAttrs: string[][], events: BoundEventAst[]) {
    this._parseEvent(name, `${expression}=$event`, sourceInfo, matchableAttrs, events);
  }

  private _parseEvent(name: string, expression: string, sourceInfo: string,
                      matchableAttrs: string[][], events: BoundEventAst[]) {
    events.push(new BoundEventAst(dashCaseToCamelCase(name),
                                  this._exprParser.parseAction(expression, sourceInfo),
                                  sourceInfo));
    // Don't detect directives for event names for now,
    // so don't add the event name to the matchableAttrs
  }

  private _parseDirectives(selectorMatcher: SelectorMatcher, elementName: string,
                           matchableAttrs: string[][]): DirectiveMetadata[] {
    var cssSelector = new CssSelector();

    cssSelector.setElement(elementName);
    for (var i = 0; i < matchableAttrs.length; i++) {
      var attrName = matchableAttrs[i][0].toLowerCase();
      var attrValue = matchableAttrs[i][1];
      cssSelector.addAttribute(attrName, attrValue);
      if (attrName == CLASS_ATTR) {
        var classes = splitClasses(attrValue);
        classes.forEach(className => cssSelector.addClassName(className));
      }
    }
    var directives = [];
    selectorMatcher.match(cssSelector, (selector, directive) => { directives.push(directive); });
    // Need to sort the directives so that we get consistent results throughout,
    // as selectorMatcher uses Maps inside.
    // Also need to make components the first directive in the array
    ListWrapper.sort(directives, (dir1: DirectiveMetadata, dir2: DirectiveMetadata) => {
      var dir1Comp = dir1.isComponent;
      var dir2Comp = dir2.isComponent;
      if (dir1Comp && !dir2Comp) {
        return -1;
      } else if (!dir1Comp && dir2Comp) {
        return 1;
      } else {
        return StringWrapper.compare(dir1.type.typeName, dir2.type.typeName);
      }
    });
    return directives;
  }
}

export function splitClasses(classAttrValue: string): string[] {
  return StringWrapper.split(classAttrValue.trim(), /\s+/g);
}
