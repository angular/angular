import {MapWrapper, ListWrapper, StringMapWrapper} from 'angular2/src/core/facade/collection';
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
import {TemplateBinding} from 'angular2/src/core/change_detection/parser/ast';

import {DirectiveMetadata} from './api';
import {
  ElementAst,
  BoundElementPropertyAst,
  BoundEventAst,
  VariableAst,
  TemplateAst,
  TextAst,
  BoundTextAst,
  EmbeddedTemplateAst,
  AttrAst,
  NgContentAst,
  PropertyBindingType,
  DirectiveAst,
  BoundDirectivePropertyAst
} from './template_ast';
import {CssSelector, SelectorMatcher} from 'angular2/src/core/render/dom/compiler/selector';

import {ElementSchemaRegistry} from 'angular2/src/core/render/dom/schema/element_schema_registry';

import {
  HtmlAstVisitor,
  HtmlAst,
  HtmlElementAst,
  HtmlAttrAst,
  HtmlTextAst,
  htmlVisitAll
} from './html_ast';

import {dashCaseToCamelCase, camelCaseToDashCase} from './util';

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

var PROPERTY_PARTS_SEPARATOR = new RegExp('\\.');
const ATTRIBUTE_PREFIX = 'attr';
const CLASS_PREFIX = 'class';
const STYLE_PREFIX = 'style';

export class TemplateParser {
  constructor(private _exprParser: Parser, private _schemaRegistry: ElementSchemaRegistry) {}

  parse(domNodes: HtmlAst[], directives: DirectiveMetadata[]): TemplateAst[] {
    var parseVisitor = new TemplateParseVisitor(directives, this._exprParser, this._schemaRegistry);
    var result = htmlVisitAll(parseVisitor, domNodes);
    if (parseVisitor.errors.length > 0) {
      var errorString = parseVisitor.errors.join('\n');
      throw new BaseException(`Template parse errors:\n${errorString}`);
    }
    return result;
  }
}

class TemplateParseVisitor implements HtmlAstVisitor {
  selectorMatcher: SelectorMatcher;
  errors: string[] = [];
  constructor(directives: DirectiveMetadata[], private _exprParser: Parser,
              private _schemaRegistry: ElementSchemaRegistry) {
    this.selectorMatcher = new SelectorMatcher();
    directives.forEach(directive => {
      var selector = CssSelector.parse(directive.selector);
      this.selectorMatcher.addSelectables(selector, directive);
    });
  }

  private _reportError(message: string) { this.errors.push(message); }

  private _parseInterpolation(value: string, sourceInfo: string): ASTWithSource {
    try {
      return this._exprParser.parseInterpolation(value, sourceInfo);
    } catch (e) {
      this._reportError(`${e}`);  // sourceInfo is already contained in the AST
      return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
    }
  }

  private _parseAction(value: string, sourceInfo: string): ASTWithSource {
    try {
      return this._exprParser.parseAction(value, sourceInfo);
    } catch (e) {
      this._reportError(`${e}`);  // sourceInfo is already contained in the AST
      return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
    }
  }

  private _parseBinding(value: string, sourceInfo: string): ASTWithSource {
    try {
      return this._exprParser.parseBinding(value, sourceInfo);
    } catch (e) {
      this._reportError(`${e}`);  // sourceInfo is already contained in the AST
      return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
    }
  }

  private _parseTemplateBindings(value: string, sourceInfo: string): TemplateBinding[] {
    try {
      return this._exprParser.parseTemplateBindings(value, sourceInfo);
    } catch (e) {
      this._reportError(`${e}`);  // sourceInfo is already contained in the AST
      return [];
    }
  }

  visitText(ast: HtmlTextAst): any {
    var expr = this._parseInterpolation(ast.value, ast.sourceInfo);
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
    var elementOrDirectiveProps: BoundElementOrDirectiveProperty[] = [];
    var vars: VariableAst[] = [];
    var events: BoundEventAst[] = [];

    var templateElementOrDirectiveProps: BoundElementOrDirectiveProperty[] = [];
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
      var hasBinding = this._parseAttr(attr, matchableAttrs, elementOrDirectiveProps, events, vars);
      var hasTemplateBinding = this._parseInlineTemplateBinding(
          attr, templateMatchableAttrs, templateElementOrDirectiveProps, templateVars);
      if (!hasBinding && !hasTemplateBinding) {
        // don't include the bindings as attributes as well in the AST
        attrs.push(this.visitAttr(attr));
      }
      if (hasTemplateBinding) {
        hasInlineTemplates = true;
      }
    });
    var directives = this._createDirectiveAsts(
        element.name, this._parseDirectives(this.selectorMatcher, nodeName, matchableAttrs),
        elementOrDirectiveProps, element.sourceInfo);
    var elementProps: BoundElementPropertyAst[] =
        this._createElementPropertyAsts(element.name, elementOrDirectiveProps, directives);
    var children = htmlVisitAll(this, element.children);
    var parsedElement;
    if (nodeName == NG_CONTENT_ELEMENT) {
      parsedElement = new NgContentAst(selectAttr, element.sourceInfo);
    } else if (nodeName == TEMPLATE_ELEMENT) {
      this._assertNoComponentsNorElementBindingsOnTemplate(directives, elementProps, events,
                                                           element.sourceInfo);
      parsedElement =
          new EmbeddedTemplateAst(attrs, vars, directives, children, element.sourceInfo);
    } else {
      this._assertOnlyOneComponent(directives, element.sourceInfo);
      parsedElement = new ElementAst(attrs, elementProps, events, vars, directives, children,
                                     element.sourceInfo);
    }
    if (hasInlineTemplates) {
      var templateDirectives = this._createDirectiveAsts(
          element.name,
          this._parseDirectives(this.selectorMatcher, TEMPLATE_ELEMENT, templateMatchableAttrs),
          templateElementOrDirectiveProps, element.sourceInfo);
      var templateElementProps: BoundElementPropertyAst[] = this._createElementPropertyAsts(
          element.name, templateElementOrDirectiveProps, templateDirectives);
      this._assertNoComponentsNorElementBindingsOnTemplate(templateDirectives, templateElementProps,
                                                           [], element.sourceInfo);
      parsedElement = new EmbeddedTemplateAst([], templateVars, templateDirectives, [parsedElement],
                                              element.sourceInfo);
    }
    return parsedElement;
  }

  private _parseInlineTemplateBinding(attr: HtmlAttrAst, targetMatchableAttrs: string[][],
                                      targetProps: BoundElementOrDirectiveProperty[],
                                      targetVars: VariableAst[]): boolean {
    var templateBindingsSource = null;
    if (attr.name == TEMPLATE_ATTR) {
      templateBindingsSource = attr.value;
    } else if (StringWrapper.startsWith(attr.name, TEMPLATE_ATTR_PREFIX)) {
      var key = StringWrapper.substring(attr.name, TEMPLATE_ATTR_PREFIX.length);  // remove the star
      templateBindingsSource = (attr.value.length == 0) ? key : key + ' ' + attr.value;
    }
    if (isPresent(templateBindingsSource)) {
      var bindings = this._parseTemplateBindings(templateBindingsSource, attr.sourceInfo);
      for (var i = 0; i < bindings.length; i++) {
        var binding = bindings[i];
        var dashCaseKey = camelCaseToDashCase(binding.key);
        if (binding.keyIsVar) {
          targetVars.push(
              new VariableAst(dashCaseToCamelCase(binding.key), binding.name, attr.sourceInfo));
          targetMatchableAttrs.push([dashCaseKey, binding.name]);
        } else if (isPresent(binding.expression)) {
          this._parsePropertyAst(dashCaseKey, binding.expression, attr.sourceInfo,
                                 targetMatchableAttrs, targetProps);
        } else {
          targetMatchableAttrs.push([dashCaseKey, '']);
        }
      }
      return true;
    }
    return false;
  }

  private _parseAttr(attr: HtmlAttrAst, targetMatchableAttrs: string[][],
                     targetProps: BoundElementOrDirectiveProperty[], targetEvents: BoundEventAst[],
                     targetVars: VariableAst[]): boolean {
    var attrName = this._normalizeAttributeName(attr.name);
    var attrValue = attr.value;
    var bindParts = RegExpWrapper.firstMatch(BIND_NAME_REGEXP, attrName);
    var hasBinding = false;
    if (isPresent(bindParts)) {
      hasBinding = true;
      if (isPresent(bindParts[1])) {  // match: bind-prop
        this._parseProperty(bindParts[5], attrValue, attr.sourceInfo, targetMatchableAttrs,
                            targetProps);

      } else if (isPresent(
                     bindParts[2])) {  // match: var-name / var-name="iden" / #name / #name="iden"
        var identifier = bindParts[5];
        var value = attrValue.length === 0 ? IMPLICIT_VAR_NAME : attrValue;
        this._parseVariable(identifier, value, attr.sourceInfo, targetMatchableAttrs, targetVars);

      } else if (isPresent(bindParts[3])) {  // match: on-event
        this._parseEvent(bindParts[5], attrValue, attr.sourceInfo, targetMatchableAttrs,
                         targetEvents);

      } else if (isPresent(bindParts[4])) {  // match: bindon-prop
        this._parseProperty(bindParts[5], attrValue, attr.sourceInfo, targetMatchableAttrs,
                            targetProps);
        this._parseAssignmentEvent(bindParts[5], attrValue, attr.sourceInfo, targetMatchableAttrs,
                                   targetEvents);

      } else if (isPresent(bindParts[6])) {  // match: [(expr)]
        this._parseProperty(bindParts[6], attrValue, attr.sourceInfo, targetMatchableAttrs,
                            targetProps);
        this._parseAssignmentEvent(bindParts[6], attrValue, attr.sourceInfo, targetMatchableAttrs,
                                   targetEvents);

      } else if (isPresent(bindParts[7])) {  // match: [expr]
        this._parseProperty(bindParts[7], attrValue, attr.sourceInfo, targetMatchableAttrs,
                            targetProps);

      } else if (isPresent(bindParts[8])) {  // match: (event)
        this._parseEvent(bindParts[8], attrValue, attr.sourceInfo, targetMatchableAttrs,
                         targetEvents);
      }
    } else {
      hasBinding = this._parsePropertyInterpolation(attrName, attrValue, attr.sourceInfo,
                                                    targetMatchableAttrs, targetProps);
    }
    if (!hasBinding) {
      this._parseLiteralAttr(attrName, attrValue, attr.sourceInfo, targetProps);
    }
    return hasBinding;
  }

  private _normalizeAttributeName(attrName: string): string {
    return StringWrapper.startsWith(attrName, 'data-') ? StringWrapper.substring(attrName, 5) :
                                                         attrName;
  }

  private _parseVariable(identifier: string, value: string, sourceInfo: any,
                         targetMatchableAttrs: string[][], targetVars: VariableAst[]) {
    targetVars.push(new VariableAst(dashCaseToCamelCase(identifier), value, sourceInfo));
    targetMatchableAttrs.push([identifier, value]);
  }

  private _parseProperty(name: string, expression: string, sourceInfo: any,
                         targetMatchableAttrs: string[][],
                         targetProps: BoundElementOrDirectiveProperty[]) {
    this._parsePropertyAst(name, this._parseBinding(expression, sourceInfo), sourceInfo,
                           targetMatchableAttrs, targetProps);
  }

  private _parsePropertyInterpolation(name: string, value: string, sourceInfo: any,
                                      targetMatchableAttrs: string[][],
                                      targetProps: BoundElementOrDirectiveProperty[]): boolean {
    var expr = this._parseInterpolation(value, sourceInfo);
    if (isPresent(expr)) {
      this._parsePropertyAst(name, expr, sourceInfo, targetMatchableAttrs, targetProps);
      return true;
    }
    return false;
  }

  private _parsePropertyAst(name: string, ast: ASTWithSource, sourceInfo: any,
                            targetMatchableAttrs: string[][],
                            targetProps: BoundElementOrDirectiveProperty[]) {
    targetMatchableAttrs.push([name, ast.source]);
    targetProps.push(new BoundElementOrDirectiveProperty(name, ast, false, sourceInfo));
  }

  private _parseAssignmentEvent(name: string, expression: string, sourceInfo: string,
                                targetMatchableAttrs: string[][], targetEvents: BoundEventAst[]) {
    this._parseEvent(name, `${expression}=$event`, sourceInfo, targetMatchableAttrs, targetEvents);
  }

  private _parseEvent(name: string, expression: string, sourceInfo: string,
                      targetMatchableAttrs: string[][], targetEvents: BoundEventAst[]) {
    // long format: 'target: eventName'
    var parts = splitAtColon(name, [null, name]);
    var target = parts[0];
    var eventName = parts[1];
    targetEvents.push(new BoundEventAst(dashCaseToCamelCase(eventName), target,
                                        this._parseAction(expression, sourceInfo), sourceInfo));
    // Don't detect directives for event names for now,
    // so don't add the event name to the matchableAttrs
  }

  private _parseLiteralAttr(name: string, value: string, sourceInfo: string,
                            targetProps: BoundElementOrDirectiveProperty[]) {
    targetProps.push(new BoundElementOrDirectiveProperty(
        dashCaseToCamelCase(name), this._exprParser.wrapLiteralPrimitive(value, sourceInfo), true,
        sourceInfo));
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

  private _createDirectiveAsts(elementName: string, directives: DirectiveMetadata[],
                               props: BoundElementOrDirectiveProperty[],
                               sourceInfo: string): DirectiveAst[] {
    return directives.map((directive: DirectiveMetadata) => {
      var hostProperties: BoundElementPropertyAst[] = [];
      var hostEvents: BoundEventAst[] = [];
      var directiveProperties: BoundDirectivePropertyAst[] = [];
      var changeDetection = directive.changeDetection;
      if (isPresent(changeDetection)) {
        this._createDirectiveHostPropertyAsts(elementName, changeDetection.hostProperties,
                                              sourceInfo, hostProperties);
        this._createDirectiveHostEventAsts(changeDetection.hostListeners, sourceInfo, hostEvents);
        this._createDirectivePropertyAsts(changeDetection.properties, props, directiveProperties);
      }
      return new DirectiveAst(directive, directiveProperties, hostProperties, hostEvents,
                              sourceInfo);
    });
  }

  private _createDirectiveHostPropertyAsts(elementName: string,
                                           hostProps: StringMap<string, string>, sourceInfo: string,
                                           targetPropertyAsts: BoundElementPropertyAst[]) {
    if (isPresent(hostProps)) {
      StringMapWrapper.forEach(hostProps, (expression, propName) => {
        var exprAst = this._parseBinding(expression, sourceInfo);
        targetPropertyAsts.push(
            this._createElementPropertyAst(elementName, propName, exprAst, sourceInfo));
      });
    }
  }

  private _createDirectiveHostEventAsts(hostListeners: StringMap<string, string>,
                                        sourceInfo: string, targetEventAsts: BoundEventAst[]) {
    if (isPresent(hostListeners)) {
      StringMapWrapper.forEach(hostListeners, (expression, propName) => {
        this._parseEvent(propName, expression, sourceInfo, [], targetEventAsts);
      });
    }
  }

  private _createDirectivePropertyAsts(directiveProperties: string[],
                                       boundProps: BoundElementOrDirectiveProperty[],
                                       targetBoundDirectiveProps: BoundDirectivePropertyAst[]) {
    if (isPresent(directiveProperties)) {
      var boundPropsByName: Map<string, BoundElementOrDirectiveProperty> = new Map();
      boundProps.forEach(boundProp =>
                             boundPropsByName.set(dashCaseToCamelCase(boundProp.name), boundProp));

      directiveProperties.forEach((bindConfig: string) => {
        // canonical syntax: `dirProp: elProp`
        // if there is no `:`, use dirProp = elProp
        var parts = splitAtColon(bindConfig, [bindConfig, bindConfig]);
        var dirProp = parts[0];
        var elProp = dashCaseToCamelCase(parts[1]);
        var boundProp = boundPropsByName.get(elProp);

        // Bindings are optional, so this binding only needs to be set up if an expression is given.
        if (isPresent(boundProp)) {
          targetBoundDirectiveProps.push(new BoundDirectivePropertyAst(
              dirProp, boundProp.name, boundProp.expression, boundProp.sourceInfo));
        }
      });
    }
  }

  private _createElementPropertyAsts(elementName: string, props: BoundElementOrDirectiveProperty[],
                                     directives: DirectiveAst[]): BoundElementPropertyAst[] {
    var boundElementProps: BoundElementPropertyAst[] = [];
    var boundDirectivePropsIndex: Map<string, BoundDirectivePropertyAst> = new Map();
    directives.forEach((directive: DirectiveAst) => {
      directive.properties.forEach((prop: BoundDirectivePropertyAst) => {
        boundDirectivePropsIndex.set(prop.templateName, prop);
      });
    });
    props.forEach((prop: BoundElementOrDirectiveProperty) => {
      if (!prop.isLiteral && isBlank(boundDirectivePropsIndex.get(prop.name))) {
        boundElementProps.push(this._createElementPropertyAst(elementName, prop.name,
                                                              prop.expression, prop.sourceInfo));
      }
    });
    return boundElementProps;
  }

  private _createElementPropertyAst(elementName: string, name: string, ast: AST,
                                    sourceInfo: any): BoundElementPropertyAst {
    var unit = null;
    var bindingType;
    var boundPropertyName;
    var parts = StringWrapper.split(name, PROPERTY_PARTS_SEPARATOR);
    if (parts.length === 1) {
      boundPropertyName = this._schemaRegistry.getMappedPropName(dashCaseToCamelCase(parts[0]));
      bindingType = PropertyBindingType.Property;
      if (!this._schemaRegistry.hasProperty(elementName, boundPropertyName)) {
        this._reportError(
            `Can't bind to '${boundPropertyName}' since it isn't a known native property in ${sourceInfo}`);
      }
    } else if (parts[0] == ATTRIBUTE_PREFIX) {
      boundPropertyName = dashCaseToCamelCase(parts[1]);
      bindingType = PropertyBindingType.Attribute;
    } else if (parts[0] == CLASS_PREFIX) {
      // keep original case!
      boundPropertyName = parts[1];
      bindingType = PropertyBindingType.Class;
    } else if (parts[0] == STYLE_PREFIX) {
      unit = parts.length > 2 ? parts[2] : null;
      boundPropertyName = dashCaseToCamelCase(parts[1]);
      bindingType = PropertyBindingType.Style;
    } else {
      this._reportError(`Invalid property name ${name} in ${sourceInfo}`);
      bindingType = null;
    }
    return new BoundElementPropertyAst(boundPropertyName, bindingType, ast, unit, sourceInfo);
  }


  private _findComponentDirectiveNames(directives: DirectiveAst[]): string[] {
    var componentTypeNames: string[] = [];
    directives.forEach(directive => {
      var typeName = directive.directive.type.typeName;
      if (directive.directive.isComponent) {
        componentTypeNames.push(typeName);
      }
    });
    return componentTypeNames;
  }

  private _assertOnlyOneComponent(directives: DirectiveAst[], sourceInfo: string) {
    var componentTypeNames = this._findComponentDirectiveNames(directives);
    if (componentTypeNames.length > 1) {
      this._reportError(
          `More than one component: ${componentTypeNames.join(',')} in ${sourceInfo}`);
    }
  }

  _assertNoComponentsNorElementBindingsOnTemplate(directives: DirectiveAst[],
                                                  elementProps: BoundElementPropertyAst[],
                                                  events: BoundEventAst[], sourceInfo: string) {
    var componentTypeNames: string[] = this._findComponentDirectiveNames(directives);
    if (componentTypeNames.length > 0) {
      this._reportError(
          `Components on an embedded template: ${componentTypeNames.join(',')} in ${sourceInfo}`);
    }
    elementProps.forEach(prop => {
      this._reportError(
          `Property binding ${prop.name} not used by any directive on an embedded template in ${prop.sourceInfo}`);
    });
    events.forEach(event => {
      this._reportError(
          `Event binding ${event.name} on an embedded template in ${event.sourceInfo}`);
    });
  }
}

class BoundElementOrDirectiveProperty {
  constructor(public name: string, public expression: AST, public isLiteral: boolean,
              public sourceInfo: string) {}
}

class ParseError {
  constructor(public message: string, public sourceInfo: string) {}
}

export function splitClasses(classAttrValue: string): string[] {
  return StringWrapper.split(classAttrValue.trim(), /\s+/g);
}

export function splitAtColon(input: string, defaultValues: string[]): string[] {
  var parts = StringWrapper.split(input.trim(), /\s*:\s*/g);
  if (parts.length > 1) {
    return parts;
  } else {
    return defaultValues;
  }
}