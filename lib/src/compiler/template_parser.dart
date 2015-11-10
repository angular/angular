library angular2.src.compiler.template_parser;

import "package:angular2/src/facade/collection.dart"
    show MapWrapper, ListWrapper, StringMapWrapper, SetWrapper;
import "package:angular2/src/facade/lang.dart"
    show
        RegExpWrapper,
        isPresent,
        StringWrapper,
        StringJoiner,
        stringify,
        assertionsEnabled,
        isBlank;
import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/core/change_detection/change_detection.dart"
    show Parser, AST, ASTWithSource;
import "package:angular2/src/core/change_detection/parser/ast.dart"
    show TemplateBinding;
import "directive_metadata.dart" show CompileDirectiveMetadata;
import "html_parser.dart" show HtmlParser;
import "template_ast.dart"
    show
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
        BoundDirectivePropertyAst;
import "package:angular2/src/compiler/selector.dart"
    show CssSelector, SelectorMatcher;
import "package:angular2/src/compiler/schema/element_schema_registry.dart"
    show ElementSchemaRegistry;
import "template_preparser.dart"
    show preparseElement, PreparsedElement, PreparsedElementType;
import "style_url_resolver.dart" show isStyleUrlResolvable;
import "html_ast.dart"
    show
        HtmlAstVisitor,
        HtmlAst,
        HtmlElementAst,
        HtmlAttrAst,
        HtmlTextAst,
        htmlVisitAll;
import "util.dart" show dashCaseToCamelCase, camelCaseToDashCase, splitAtColon;
// Group 1 = "bind-"

// Group 2 = "var-" or "#"

// Group 3 = "on-"

// Group 4 = "bindon-"

// Group 5 = the identifier after "bind-", "var-/#", or "on-"

// Group 6 = idenitifer inside [()]

// Group 7 = idenitifer inside []

// Group 8 = identifier inside ()
var BIND_NAME_REGEXP = new RegExp(
    r'^(?:(?:(?:(bind-)|(var-|#)|(on-)|(bindon-))(.+))|\[\(([^\)]+)\)\]|\[([^\]]+)\]|\(([^\)]+)\))$');
const TEMPLATE_ELEMENT = "template";
const TEMPLATE_ATTR = "template";
const TEMPLATE_ATTR_PREFIX = "*";
const CLASS_ATTR = "class";
var PROPERTY_PARTS_SEPARATOR = new RegExp("\\.");
const ATTRIBUTE_PREFIX = "attr";
const CLASS_PREFIX = "class";
const STYLE_PREFIX = "style";
var TEXT_CSS_SELECTOR = CssSelector.parse("*")[0];

@Injectable()
class TemplateParser {
  Parser _exprParser;
  ElementSchemaRegistry _schemaRegistry;
  HtmlParser _htmlParser;
  TemplateParser(this._exprParser, this._schemaRegistry, this._htmlParser) {}
  List<TemplateAst> parse(String template,
      List<CompileDirectiveMetadata> directives, String sourceInfo) {
    var parseVisitor = new TemplateParseVisitor(
        directives, this._exprParser, this._schemaRegistry);
    var result = htmlVisitAll(parseVisitor,
        this._htmlParser.parse(template, sourceInfo), EMPTY_COMPONENT);
    if (parseVisitor.errors.length > 0) {
      var errorString = parseVisitor.errors.join("\n");
      throw new BaseException('''Template parse errors:
${ errorString}''');
    }
    return result;
  }
}

class TemplateParseVisitor implements HtmlAstVisitor {
  Parser _exprParser;
  ElementSchemaRegistry _schemaRegistry;
  SelectorMatcher selectorMatcher;
  List<String> errors = [];
  var directivesIndex = new Map<CompileDirectiveMetadata, num>();
  num ngContentCount = 0;
  TemplateParseVisitor(List<CompileDirectiveMetadata> directives,
      this._exprParser, this._schemaRegistry) {
    this.selectorMatcher = new SelectorMatcher();
    ListWrapper.forEachWithIndex(directives,
        (CompileDirectiveMetadata directive, num index) {
      var selector = CssSelector.parse(directive.selector);
      this.selectorMatcher.addSelectables(selector, directive);
      this.directivesIndex[directive] = index;
    });
  }
  _reportError(String message) {
    this.errors.add(message);
  }

  ASTWithSource _parseInterpolation(String value, String sourceInfo) {
    try {
      return this._exprParser.parseInterpolation(value, sourceInfo);
    } catch (e, e_stack) {
      this._reportError('''${ e}''');
      return this._exprParser.wrapLiteralPrimitive("ERROR", sourceInfo);
    }
  }

  ASTWithSource _parseAction(String value, String sourceInfo) {
    try {
      return this._exprParser.parseAction(value, sourceInfo);
    } catch (e, e_stack) {
      this._reportError('''${ e}''');
      return this._exprParser.wrapLiteralPrimitive("ERROR", sourceInfo);
    }
  }

  ASTWithSource _parseBinding(String value, String sourceInfo) {
    try {
      return this._exprParser.parseBinding(value, sourceInfo);
    } catch (e, e_stack) {
      this._reportError('''${ e}''');
      return this._exprParser.wrapLiteralPrimitive("ERROR", sourceInfo);
    }
  }

  List<TemplateBinding> _parseTemplateBindings(
      String value, String sourceInfo) {
    try {
      return this._exprParser.parseTemplateBindings(value, sourceInfo);
    } catch (e, e_stack) {
      this._reportError('''${ e}''');
      return [];
    }
  }

  dynamic visitText(HtmlTextAst ast, Component component) {
    var ngContentIndex = component.findNgContentIndex(TEXT_CSS_SELECTOR);
    var expr = this._parseInterpolation(ast.value, ast.sourceInfo);
    if (isPresent(expr)) {
      return new BoundTextAst(expr, ngContentIndex, ast.sourceInfo);
    } else {
      return new TextAst(ast.value, ngContentIndex, ast.sourceInfo);
    }
  }

  dynamic visitAttr(HtmlAttrAst ast, dynamic contex) {
    return new AttrAst(ast.name, ast.value, ast.sourceInfo);
  }

  dynamic visitElement(HtmlElementAst element, Component component) {
    var nodeName = element.name;
    var preparsedElement = preparseElement(element);
    if (identical(preparsedElement.type, PreparsedElementType.SCRIPT) ||
        identical(preparsedElement.type, PreparsedElementType.STYLE)) {
      // Skipping <script> for security reasons

      // Skipping <style> as we already processed them

      // in the StyleCompiler
      return null;
    }
    if (identical(preparsedElement.type, PreparsedElementType.STYLESHEET) &&
        isStyleUrlResolvable(preparsedElement.hrefAttr)) {
      // Skipping stylesheets with either relative urls or package scheme as we already processed

      // them

      // in the StyleCompiler
      return null;
    }
    List<List<String>> matchableAttrs = [];
    List<BoundElementOrDirectiveProperty> elementOrDirectiveProps = [];
    List<VariableAst> vars = [];
    List<BoundEventAst> events = [];
    List<BoundElementOrDirectiveProperty> templateElementOrDirectiveProps = [];
    List<VariableAst> templateVars = [];
    List<List<String>> templateMatchableAttrs = [];
    var hasInlineTemplates = false;
    var attrs = [];
    element.attrs.forEach((attr) {
      matchableAttrs.add([attr.name, attr.value]);
      var hasBinding = this._parseAttr(
          attr, matchableAttrs, elementOrDirectiveProps, events, vars);
      var hasTemplateBinding = this._parseInlineTemplateBinding(
          attr,
          templateMatchableAttrs,
          templateElementOrDirectiveProps,
          templateVars);
      if (!hasBinding && !hasTemplateBinding) {
        // don't include the bindings as attributes as well in the AST
        attrs.add(this.visitAttr(attr, null));
      }
      if (hasTemplateBinding) {
        hasInlineTemplates = true;
      }
    });
    var isTemplateElement = nodeName == TEMPLATE_ELEMENT;
    var elementCssSelector = createElementCssSelector(nodeName, matchableAttrs);
    var directives = this._createDirectiveAsts(
        element.name,
        this._parseDirectives(this.selectorMatcher, elementCssSelector),
        elementOrDirectiveProps,
        isTemplateElement ? [] : vars,
        element.sourceInfo);
    List<BoundElementPropertyAst> elementProps = this
        ._createElementPropertyAsts(
            element.name, elementOrDirectiveProps, directives);
    var children = htmlVisitAll(
        preparsedElement.nonBindable ? NON_BINDABLE_VISITOR : this,
        element.children,
        Component.create(directives));
    var elementNgContentIndex = hasInlineTemplates
        ? null
        : component.findNgContentIndex(elementCssSelector);
    var parsedElement;
    if (identical(preparsedElement.type, PreparsedElementType.NG_CONTENT)) {
      parsedElement = new NgContentAst(
          this.ngContentCount++, elementNgContentIndex, element.sourceInfo);
    } else if (isTemplateElement) {
      this._assertAllEventsPublishedByDirectives(
          directives, events, element.sourceInfo);
      this._assertNoComponentsNorElementBindingsOnTemplate(
          directives, elementProps, element.sourceInfo);
      parsedElement = new EmbeddedTemplateAst(attrs, events, vars, directives,
          children, elementNgContentIndex, element.sourceInfo);
    } else {
      this._assertOnlyOneComponent(directives, element.sourceInfo);
      var elementExportAsVars =
          vars.where((varAst) => identical(varAst.value.length, 0)).toList();
      parsedElement = new ElementAst(
          nodeName,
          attrs,
          elementProps,
          events,
          elementExportAsVars,
          directives,
          children,
          elementNgContentIndex,
          element.sourceInfo);
    }
    if (hasInlineTemplates) {
      var templateCssSelector =
          createElementCssSelector(TEMPLATE_ELEMENT, templateMatchableAttrs);
      var templateDirectives = this._createDirectiveAsts(
          element.name,
          this._parseDirectives(this.selectorMatcher, templateCssSelector),
          templateElementOrDirectiveProps,
          [],
          element.sourceInfo);
      List<BoundElementPropertyAst> templateElementProps = this
          ._createElementPropertyAsts(element.name,
              templateElementOrDirectiveProps, templateDirectives);
      this._assertNoComponentsNorElementBindingsOnTemplate(
          templateDirectives, templateElementProps, element.sourceInfo);
      parsedElement = new EmbeddedTemplateAst(
          [],
          [],
          templateVars,
          templateDirectives,
          [parsedElement],
          component.findNgContentIndex(templateCssSelector),
          element.sourceInfo);
    }
    return parsedElement;
  }

  bool _parseInlineTemplateBinding(
      HtmlAttrAst attr,
      List<List<String>> targetMatchableAttrs,
      List<BoundElementOrDirectiveProperty> targetProps,
      List<VariableAst> targetVars) {
    var templateBindingsSource = null;
    if (attr.name == TEMPLATE_ATTR) {
      templateBindingsSource = attr.value;
    } else if (attr.name.startsWith(TEMPLATE_ATTR_PREFIX)) {
      var key = attr.name.substring(TEMPLATE_ATTR_PREFIX.length);
      templateBindingsSource =
          (attr.value.length == 0) ? key : key + " " + attr.value;
    }
    if (isPresent(templateBindingsSource)) {
      var bindings =
          this._parseTemplateBindings(templateBindingsSource, attr.sourceInfo);
      for (var i = 0; i < bindings.length; i++) {
        var binding = bindings[i];
        var dashCaseKey = camelCaseToDashCase(binding.key);
        if (binding.keyIsVar) {
          targetVars.add(new VariableAst(
              dashCaseToCamelCase(binding.key), binding.name, attr.sourceInfo));
          targetMatchableAttrs.add([dashCaseKey, binding.name]);
        } else if (isPresent(binding.expression)) {
          this._parsePropertyAst(dashCaseKey, binding.expression,
              attr.sourceInfo, targetMatchableAttrs, targetProps);
        } else {
          targetMatchableAttrs.add([dashCaseKey, ""]);
          this._parseLiteralAttr(
              dashCaseKey, null, attr.sourceInfo, targetProps);
        }
      }
      return true;
    }
    return false;
  }

  bool _parseAttr(
      HtmlAttrAst attr,
      List<List<String>> targetMatchableAttrs,
      List<BoundElementOrDirectiveProperty> targetProps,
      List<BoundEventAst> targetEvents,
      List<VariableAst> targetVars) {
    var attrName = this._normalizeAttributeName(attr.name);
    var attrValue = attr.value;
    var bindParts = RegExpWrapper.firstMatch(BIND_NAME_REGEXP, attrName);
    var hasBinding = false;
    if (isPresent(bindParts)) {
      hasBinding = true;
      if (isPresent(bindParts[1])) {
        this._parseProperty(bindParts[5], attrValue, attr.sourceInfo,
            targetMatchableAttrs, targetProps);
      } else if (isPresent(bindParts[2])) {
        var identifier = bindParts[5];
        this._parseVariable(identifier, attrValue, attr.sourceInfo, targetVars);
      } else if (isPresent(bindParts[3])) {
        this._parseEvent(bindParts[5], attrValue, attr.sourceInfo,
            targetMatchableAttrs, targetEvents);
      } else if (isPresent(bindParts[4])) {
        this._parseProperty(bindParts[5], attrValue, attr.sourceInfo,
            targetMatchableAttrs, targetProps);
        this._parseAssignmentEvent(bindParts[5], attrValue, attr.sourceInfo,
            targetMatchableAttrs, targetEvents);
      } else if (isPresent(bindParts[6])) {
        this._parseProperty(bindParts[6], attrValue, attr.sourceInfo,
            targetMatchableAttrs, targetProps);
        this._parseAssignmentEvent(bindParts[6], attrValue, attr.sourceInfo,
            targetMatchableAttrs, targetEvents);
      } else if (isPresent(bindParts[7])) {
        this._parseProperty(bindParts[7], attrValue, attr.sourceInfo,
            targetMatchableAttrs, targetProps);
      } else if (isPresent(bindParts[8])) {
        this._parseEvent(bindParts[8], attrValue, attr.sourceInfo,
            targetMatchableAttrs, targetEvents);
      }
    } else {
      hasBinding = this._parsePropertyInterpolation(attrName, attrValue,
          attr.sourceInfo, targetMatchableAttrs, targetProps);
    }
    if (!hasBinding) {
      this._parseLiteralAttr(attrName, attrValue, attr.sourceInfo, targetProps);
    }
    return hasBinding;
  }

  String _normalizeAttributeName(String attrName) {
    return attrName.startsWith("data-") ? attrName.substring(5) : attrName;
  }

  _parseVariable(String identifier, String value, dynamic sourceInfo,
      List<VariableAst> targetVars) {
    targetVars.add(
        new VariableAst(dashCaseToCamelCase(identifier), value, sourceInfo));
  }

  _parseProperty(
      String name,
      String expression,
      dynamic sourceInfo,
      List<List<String>> targetMatchableAttrs,
      List<BoundElementOrDirectiveProperty> targetProps) {
    this._parsePropertyAst(name, this._parseBinding(expression, sourceInfo),
        sourceInfo, targetMatchableAttrs, targetProps);
  }

  bool _parsePropertyInterpolation(
      String name,
      String value,
      dynamic sourceInfo,
      List<List<String>> targetMatchableAttrs,
      List<BoundElementOrDirectiveProperty> targetProps) {
    var expr = this._parseInterpolation(value, sourceInfo);
    if (isPresent(expr)) {
      this._parsePropertyAst(
          name, expr, sourceInfo, targetMatchableAttrs, targetProps);
      return true;
    }
    return false;
  }

  _parsePropertyAst(
      String name,
      ASTWithSource ast,
      dynamic sourceInfo,
      List<List<String>> targetMatchableAttrs,
      List<BoundElementOrDirectiveProperty> targetProps) {
    targetMatchableAttrs.add([name, ast.source]);
    targetProps
        .add(new BoundElementOrDirectiveProperty(name, ast, false, sourceInfo));
  }

  _parseAssignmentEvent(
      String name,
      String expression,
      String sourceInfo,
      List<List<String>> targetMatchableAttrs,
      List<BoundEventAst> targetEvents) {
    this._parseEvent('''${ name}-change''', '''${ expression}=\$event''',
        sourceInfo, targetMatchableAttrs, targetEvents);
  }

  _parseEvent(
      String name,
      String expression,
      String sourceInfo,
      List<List<String>> targetMatchableAttrs,
      List<BoundEventAst> targetEvents) {
    // long format: 'target: eventName'
    var parts = splitAtColon(name, [null, name]);
    var target = parts[0];
    var eventName = parts[1];
    targetEvents.add(new BoundEventAst(dashCaseToCamelCase(eventName), target,
        this._parseAction(expression, sourceInfo), sourceInfo));
  }

  _parseLiteralAttr(String name, String value, String sourceInfo,
      List<BoundElementOrDirectiveProperty> targetProps) {
    targetProps.add(new BoundElementOrDirectiveProperty(
        dashCaseToCamelCase(name),
        this._exprParser.wrapLiteralPrimitive(value, sourceInfo),
        true,
        sourceInfo));
  }

  List<CompileDirectiveMetadata> _parseDirectives(
      SelectorMatcher selectorMatcher, CssSelector elementCssSelector) {
    var directives = [];
    selectorMatcher.match(elementCssSelector, (selector, directive) {
      directives.add(directive);
    });
    // Need to sort the directives so that we get consistent results throughout,

    // as selectorMatcher uses Maps inside.

    // Also need to make components the first directive in the array
    ListWrapper.sort(directives,
        (CompileDirectiveMetadata dir1, CompileDirectiveMetadata dir2) {
      var dir1Comp = dir1.isComponent;
      var dir2Comp = dir2.isComponent;
      if (dir1Comp && !dir2Comp) {
        return -1;
      } else if (!dir1Comp && dir2Comp) {
        return 1;
      } else {
        return this.directivesIndex[dir1] - this.directivesIndex[dir2];
      }
    });
    return directives;
  }

  List<DirectiveAst> _createDirectiveAsts(
      String elementName,
      List<CompileDirectiveMetadata> directives,
      List<BoundElementOrDirectiveProperty> props,
      List<VariableAst> possibleExportAsVars,
      String sourceInfo) {
    var matchedVariables = new Set<String>();
    var directiveAsts = directives.map((CompileDirectiveMetadata directive) {
      List<BoundElementPropertyAst> hostProperties = [];
      List<BoundEventAst> hostEvents = [];
      List<BoundDirectivePropertyAst> directiveProperties = [];
      this._createDirectiveHostPropertyAsts(
          elementName, directive.hostProperties, sourceInfo, hostProperties);
      this._createDirectiveHostEventAsts(
          directive.hostListeners, sourceInfo, hostEvents);
      this._createDirectivePropertyAsts(
          directive.inputs, props, directiveProperties);
      var exportAsVars = [];
      possibleExportAsVars.forEach((varAst) {
        if ((identical(varAst.value.length, 0) && directive.isComponent) ||
            (directive.exportAs == varAst.value)) {
          exportAsVars.add(varAst);
          matchedVariables.add(varAst.name);
        }
      });
      return new DirectiveAst(directive, directiveProperties, hostProperties,
          hostEvents, exportAsVars, sourceInfo);
    }).toList();
    possibleExportAsVars.forEach((varAst) {
      if (varAst.value.length > 0 &&
          !SetWrapper.has(matchedVariables, varAst.name)) {
        this._reportError(
            '''There is no directive with "exportAs" set to "${ varAst . value}" at ${ varAst . sourceInfo}''');
      }
    });
    return directiveAsts;
  }

  _createDirectiveHostPropertyAsts(
      String elementName,
      Map<String, String> hostProps,
      String sourceInfo,
      List<BoundElementPropertyAst> targetPropertyAsts) {
    if (isPresent(hostProps)) {
      StringMapWrapper.forEach(hostProps, (expression, propName) {
        var exprAst = this._parseBinding(expression, sourceInfo);
        targetPropertyAsts.add(this._createElementPropertyAst(
            elementName, propName, exprAst, sourceInfo));
      });
    }
  }

  _createDirectiveHostEventAsts(Map<String, String> hostListeners,
      String sourceInfo, List<BoundEventAst> targetEventAsts) {
    if (isPresent(hostListeners)) {
      StringMapWrapper.forEach(hostListeners, (expression, propName) {
        this._parseEvent(propName, expression, sourceInfo, [], targetEventAsts);
      });
    }
  }

  _createDirectivePropertyAsts(
      Map<String, String> directiveProperties,
      List<BoundElementOrDirectiveProperty> boundProps,
      List<BoundDirectivePropertyAst> targetBoundDirectiveProps) {
    if (isPresent(directiveProperties)) {
      var boundPropsByName = new Map<String, BoundElementOrDirectiveProperty>();
      boundProps.forEach((boundProp) {
        var key = dashCaseToCamelCase(boundProp.name);
        var prevValue = boundPropsByName[boundProp.name];
        if (isBlank(prevValue) || prevValue.isLiteral) {
          // give [a]="b" a higher precedence thatn a="b" on the same element
          boundPropsByName[key] = boundProp;
        }
      });
      StringMapWrapper.forEach(directiveProperties,
          (String elProp, String dirProp) {
        elProp = dashCaseToCamelCase(elProp);
        var boundProp = boundPropsByName[elProp];
        // Bindings are optional, so this binding only needs to be set up if an expression is given.
        if (isPresent(boundProp)) {
          targetBoundDirectiveProps.add(new BoundDirectivePropertyAst(dirProp,
              boundProp.name, boundProp.expression, boundProp.sourceInfo));
        }
      });
    }
  }

  List<BoundElementPropertyAst> _createElementPropertyAsts(
      String elementName,
      List<BoundElementOrDirectiveProperty> props,
      List<DirectiveAst> directives) {
    List<BoundElementPropertyAst> boundElementProps = [];
    var boundDirectivePropsIndex = new Map<String, BoundDirectivePropertyAst>();
    directives.forEach((DirectiveAst directive) {
      directive.inputs.forEach((BoundDirectivePropertyAst prop) {
        boundDirectivePropsIndex[prop.templateName] = prop;
      });
    });
    props.forEach((BoundElementOrDirectiveProperty prop) {
      if (!prop.isLiteral && isBlank(boundDirectivePropsIndex[prop.name])) {
        boundElementProps.add(this._createElementPropertyAst(
            elementName, prop.name, prop.expression, prop.sourceInfo));
      }
    });
    return boundElementProps;
  }

  BoundElementPropertyAst _createElementPropertyAst(
      String elementName, String name, AST ast, dynamic sourceInfo) {
    var unit = null;
    var bindingType;
    var boundPropertyName;
    var parts = StringWrapper.split(name, PROPERTY_PARTS_SEPARATOR);
    if (identical(parts.length, 1)) {
      boundPropertyName =
          this._schemaRegistry.getMappedPropName(dashCaseToCamelCase(parts[0]));
      bindingType = PropertyBindingType.Property;
      if (!this._schemaRegistry.hasProperty(elementName, boundPropertyName)) {
        this._reportError(
            '''Can\'t bind to \'${ boundPropertyName}\' since it isn\'t a known native property in ${ sourceInfo}''');
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
      this._reportError('''Invalid property name ${ name} in ${ sourceInfo}''');
      bindingType = null;
    }
    return new BoundElementPropertyAst(
        boundPropertyName, bindingType, ast, unit, sourceInfo);
  }

  List<String> _findComponentDirectiveNames(List<DirectiveAst> directives) {
    List<String> componentTypeNames = [];
    directives.forEach((directive) {
      var typeName = directive.directive.type.name;
      if (directive.directive.isComponent) {
        componentTypeNames.add(typeName);
      }
    });
    return componentTypeNames;
  }

  _assertOnlyOneComponent(List<DirectiveAst> directives, String sourceInfo) {
    var componentTypeNames = this._findComponentDirectiveNames(directives);
    if (componentTypeNames.length > 1) {
      this._reportError(
          '''More than one component: ${ componentTypeNames . join ( "," )} in ${ sourceInfo}''');
    }
  }

  _assertNoComponentsNorElementBindingsOnTemplate(List<DirectiveAst> directives,
      List<BoundElementPropertyAst> elementProps, String sourceInfo) {
    List<String> componentTypeNames =
        this._findComponentDirectiveNames(directives);
    if (componentTypeNames.length > 0) {
      this._reportError(
          '''Components on an embedded template: ${ componentTypeNames . join ( "," )} in ${ sourceInfo}''');
    }
    elementProps.forEach((prop) {
      this._reportError(
          '''Property binding ${ prop . name} not used by any directive on an embedded template in ${ prop . sourceInfo}''');
    });
  }

  _assertAllEventsPublishedByDirectives(List<DirectiveAst> directives,
      List<BoundEventAst> events, String sourceInfo) {
    var allDirectiveEvents = new Set<String>();
    directives.forEach((directive) {
      StringMapWrapper.forEach(directive.directive.outputs, (eventName, _) {
        allDirectiveEvents.add(eventName);
      });
    });
    events.forEach((event) {
      if (isPresent(event.target) ||
          !SetWrapper.has(allDirectiveEvents, event.name)) {
        this._reportError(
            '''Event binding ${ event . fullName} not emitted by any directive on an embedded template in ${ sourceInfo}''');
      }
    });
  }
}

class NonBindableVisitor implements HtmlAstVisitor {
  ElementAst visitElement(HtmlElementAst ast, Component component) {
    var preparsedElement = preparseElement(ast);
    if (identical(preparsedElement.type, PreparsedElementType.SCRIPT) ||
        identical(preparsedElement.type, PreparsedElementType.STYLE) ||
        identical(preparsedElement.type, PreparsedElementType.STYLESHEET)) {
      // Skipping <script> for security reasons

      // Skipping <style> and stylesheets as we already processed them

      // in the StyleCompiler
      return null;
    }
    var attrNameAndValues =
        ast.attrs.map((attrAst) => [attrAst.name, attrAst.value]).toList();
    var selector = createElementCssSelector(ast.name, attrNameAndValues);
    var ngContentIndex = component.findNgContentIndex(selector);
    var children = htmlVisitAll(this, ast.children, EMPTY_COMPONENT);
    return new ElementAst(ast.name, htmlVisitAll(this, ast.attrs), [], [], [],
        [], children, ngContentIndex, ast.sourceInfo);
  }

  AttrAst visitAttr(HtmlAttrAst ast, dynamic context) {
    return new AttrAst(ast.name, ast.value, ast.sourceInfo);
  }

  TextAst visitText(HtmlTextAst ast, Component component) {
    var ngContentIndex = component.findNgContentIndex(TEXT_CSS_SELECTOR);
    return new TextAst(ast.value, ngContentIndex, ast.sourceInfo);
  }
}

class BoundElementOrDirectiveProperty {
  String name;
  AST expression;
  bool isLiteral;
  String sourceInfo;
  BoundElementOrDirectiveProperty(
      this.name, this.expression, this.isLiteral, this.sourceInfo) {}
}

List<String> splitClasses(String classAttrValue) {
  return StringWrapper.split(classAttrValue.trim(), new RegExp(r'\s+'));
}

class Component {
  SelectorMatcher ngContentIndexMatcher;
  num wildcardNgContentIndex;
  static Component create(List<DirectiveAst> directives) {
    if (identical(directives.length, 0) ||
        !directives[0].directive.isComponent) {
      return EMPTY_COMPONENT;
    }
    var matcher = new SelectorMatcher();
    var ngContentSelectors =
        directives[0].directive.template.ngContentSelectors;
    var wildcardNgContentIndex = null;
    for (var i = 0; i < ngContentSelectors.length; i++) {
      var selector = ngContentSelectors[i];
      if (StringWrapper.equals(selector, "*")) {
        wildcardNgContentIndex = i;
      } else {
        matcher.addSelectables(CssSelector.parse(ngContentSelectors[i]), i);
      }
    }
    return new Component(matcher, wildcardNgContentIndex);
  }

  Component(this.ngContentIndexMatcher, this.wildcardNgContentIndex) {}
  num findNgContentIndex(CssSelector selector) {
    var ngContentIndices = [];
    this.ngContentIndexMatcher.match(selector, (selector, ngContentIndex) {
      ngContentIndices.add(ngContentIndex);
    });
    ListWrapper.sort(ngContentIndices);
    if (isPresent(this.wildcardNgContentIndex)) {
      ngContentIndices.add(this.wildcardNgContentIndex);
    }
    return ngContentIndices.length > 0 ? ngContentIndices[0] : null;
  }
}

CssSelector createElementCssSelector(
    String elementName, List<List<String>> matchableAttrs) {
  var cssSelector = new CssSelector();
  cssSelector.setElement(elementName);
  for (var i = 0; i < matchableAttrs.length; i++) {
    var attrName = matchableAttrs[i][0].toLowerCase();
    var attrValue = matchableAttrs[i][1];
    cssSelector.addAttribute(attrName, attrValue);
    if (attrName == CLASS_ATTR) {
      var classes = splitClasses(attrValue);
      classes.forEach((className) => cssSelector.addClassName(className));
    }
  }
  return cssSelector;
}

var EMPTY_COMPONENT = new Component(new SelectorMatcher(), null);
var NON_BINDABLE_VISITOR = new NonBindableVisitor();
