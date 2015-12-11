library angular2.src.compiler.template_parser;

import "package:angular2/src/facade/collection.dart"
    show ListWrapper, StringMapWrapper, SetWrapper;
import "package:angular2/src/facade/lang.dart"
    show RegExpWrapper, isPresent, StringWrapper, isBlank;
import "package:angular2/core.dart"
    show Injectable, Inject, OpaqueToken, Optional;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/core/change_detection/change_detection.dart"
    show Parser, AST, ASTWithSource;
import "package:angular2/src/core/change_detection/parser/ast.dart"
    show TemplateBinding;
import "directive_metadata.dart" show CompileDirectiveMetadata;
import "html_parser.dart" show HtmlParser;
import "html_tags.dart" show splitNsName;
import "parse_util.dart" show ParseSourceSpan, ParseError, ParseLocation;
import "template_ast.dart"
    show
        ElementAst,
        BoundElementPropertyAst,
        BoundEventAst,
        VariableAst,
        TemplateAst,
        TemplateAstVisitor,
        templateVisitAll,
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
import "util.dart" show splitAtColon;
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
var PROPERTY_PARTS_SEPARATOR = ".";
const ATTRIBUTE_PREFIX = "attr";
const CLASS_PREFIX = "class";
const STYLE_PREFIX = "style";
var TEXT_CSS_SELECTOR = CssSelector.parse("*")[0];
const TEMPLATE_TRANSFORMS = const OpaqueToken("TemplateTransforms");

class TemplateParseError extends ParseError {
  TemplateParseError(String message, ParseLocation location)
      : super(location, message) {
    /* super call moved to initializer */;
  }
}

@Injectable()
class TemplateParser {
  Parser _exprParser;
  ElementSchemaRegistry _schemaRegistry;
  HtmlParser _htmlParser;
  List<TemplateAstVisitor> transforms;
  TemplateParser(this._exprParser, this._schemaRegistry, this._htmlParser,
      @Optional() @Inject(TEMPLATE_TRANSFORMS) this.transforms) {}
  List<TemplateAst> parse(String template,
      List<CompileDirectiveMetadata> directives, String templateUrl) {
    var parseVisitor = new TemplateParseVisitor(
        directives, this._exprParser, this._schemaRegistry);
    var htmlAstWithErrors = this._htmlParser.parse(template, templateUrl);
    var result = htmlVisitAll(
        parseVisitor, htmlAstWithErrors.rootNodes, EMPTY_COMPONENT);
    List<ParseError> errors = (new List.from(htmlAstWithErrors.errors)
      ..addAll(parseVisitor.errors));
    if (errors.length > 0) {
      var errorString = errors.join("\n");
      throw new BaseException('''Template parse errors:
${ errorString}''');
    }
    if (isPresent(this.transforms)) {
      this.transforms.forEach((TemplateAstVisitor transform) {
        result = templateVisitAll(transform, result);
      });
    }
    return result;
  }
}

class TemplateParseVisitor implements HtmlAstVisitor {
  Parser _exprParser;
  ElementSchemaRegistry _schemaRegistry;
  SelectorMatcher selectorMatcher;
  List<TemplateParseError> errors = [];
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
  _reportError(String message, ParseSourceSpan sourceSpan) {
    this.errors.add(new TemplateParseError(message, sourceSpan.start));
  }

  ASTWithSource _parseInterpolation(String value, ParseSourceSpan sourceSpan) {
    var sourceInfo = sourceSpan.start.toString();
    try {
      return this._exprParser.parseInterpolation(value, sourceInfo);
    } catch (e, e_stack) {
      this._reportError('''${ e}''', sourceSpan);
      return this._exprParser.wrapLiteralPrimitive("ERROR", sourceInfo);
    }
  }

  ASTWithSource _parseAction(String value, ParseSourceSpan sourceSpan) {
    var sourceInfo = sourceSpan.start.toString();
    try {
      return this._exprParser.parseAction(value, sourceInfo);
    } catch (e, e_stack) {
      this._reportError('''${ e}''', sourceSpan);
      return this._exprParser.wrapLiteralPrimitive("ERROR", sourceInfo);
    }
  }

  ASTWithSource _parseBinding(String value, ParseSourceSpan sourceSpan) {
    var sourceInfo = sourceSpan.start.toString();
    try {
      return this._exprParser.parseBinding(value, sourceInfo);
    } catch (e, e_stack) {
      this._reportError('''${ e}''', sourceSpan);
      return this._exprParser.wrapLiteralPrimitive("ERROR", sourceInfo);
    }
  }

  List<TemplateBinding> _parseTemplateBindings(
      String value, ParseSourceSpan sourceSpan) {
    var sourceInfo = sourceSpan.start.toString();
    try {
      return this._exprParser.parseTemplateBindings(value, sourceInfo);
    } catch (e, e_stack) {
      this._reportError('''${ e}''', sourceSpan);
      return [];
    }
  }

  dynamic visitText(HtmlTextAst ast, Component component) {
    var ngContentIndex = component.findNgContentIndex(TEXT_CSS_SELECTOR);
    var expr = this._parseInterpolation(ast.value, ast.sourceSpan);
    if (isPresent(expr)) {
      return new BoundTextAst(expr, ngContentIndex, ast.sourceSpan);
    } else {
      return new TextAst(ast.value, ngContentIndex, ast.sourceSpan);
    }
  }

  dynamic visitAttr(HtmlAttrAst ast, dynamic contex) {
    return new AttrAst(ast.name, ast.value, ast.sourceSpan);
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

      // them in the StyleCompiler
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
    var lcElName = splitNsName(nodeName.toLowerCase())[1];
    var isTemplateElement = lcElName == TEMPLATE_ELEMENT;
    var elementCssSelector = createElementCssSelector(nodeName, matchableAttrs);
    var directives = this._createDirectiveAsts(
        element.name,
        this._parseDirectives(this.selectorMatcher, elementCssSelector),
        elementOrDirectiveProps,
        isTemplateElement ? [] : vars,
        element.sourceSpan);
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
      if (isPresent(element.children) && element.children.length > 0) {
        this._reportError(
            '''<ng-content> element cannot have content. <ng-content> must be immediately followed by </ng-content>''',
            element.sourceSpan);
      }
      parsedElement = new NgContentAst(
          this.ngContentCount++, elementNgContentIndex, element.sourceSpan);
    } else if (isTemplateElement) {
      this._assertAllEventsPublishedByDirectives(directives, events);
      this._assertNoComponentsNorElementBindingsOnTemplate(
          directives, elementProps, element.sourceSpan);
      parsedElement = new EmbeddedTemplateAst(attrs, events, vars, directives,
          children, elementNgContentIndex, element.sourceSpan);
    } else {
      this._assertOnlyOneComponent(directives, element.sourceSpan);
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
          element.sourceSpan);
    }
    if (hasInlineTemplates) {
      var templateCssSelector =
          createElementCssSelector(TEMPLATE_ELEMENT, templateMatchableAttrs);
      var templateDirectives = this._createDirectiveAsts(
          element.name,
          this._parseDirectives(this.selectorMatcher, templateCssSelector),
          templateElementOrDirectiveProps,
          [],
          element.sourceSpan);
      List<BoundElementPropertyAst> templateElementProps = this
          ._createElementPropertyAsts(element.name,
              templateElementOrDirectiveProps, templateDirectives);
      this._assertNoComponentsNorElementBindingsOnTemplate(
          templateDirectives, templateElementProps, element.sourceSpan);
      parsedElement = new EmbeddedTemplateAst(
          [],
          [],
          templateVars,
          templateDirectives,
          [parsedElement],
          component.findNgContentIndex(templateCssSelector),
          element.sourceSpan);
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
          this._parseTemplateBindings(templateBindingsSource, attr.sourceSpan);
      for (var i = 0; i < bindings.length; i++) {
        var binding = bindings[i];
        if (binding.keyIsVar) {
          targetVars
              .add(new VariableAst(binding.key, binding.name, attr.sourceSpan));
          targetMatchableAttrs.add([binding.key, binding.name]);
        } else if (isPresent(binding.expression)) {
          this._parsePropertyAst(binding.key, binding.expression,
              attr.sourceSpan, targetMatchableAttrs, targetProps);
        } else {
          targetMatchableAttrs.add([binding.key, ""]);
          this._parseLiteralAttr(
              binding.key, null, attr.sourceSpan, targetProps);
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
        this._parseProperty(bindParts[5], attrValue, attr.sourceSpan,
            targetMatchableAttrs, targetProps);
      } else if (isPresent(bindParts[2])) {
        var identifier = bindParts[5];
        this._parseVariable(identifier, attrValue, attr.sourceSpan, targetVars);
      } else if (isPresent(bindParts[3])) {
        this._parseEvent(bindParts[5], attrValue, attr.sourceSpan,
            targetMatchableAttrs, targetEvents);
      } else if (isPresent(bindParts[4])) {
        this._parseProperty(bindParts[5], attrValue, attr.sourceSpan,
            targetMatchableAttrs, targetProps);
        this._parseAssignmentEvent(bindParts[5], attrValue, attr.sourceSpan,
            targetMatchableAttrs, targetEvents);
      } else if (isPresent(bindParts[6])) {
        this._parseProperty(bindParts[6], attrValue, attr.sourceSpan,
            targetMatchableAttrs, targetProps);
        this._parseAssignmentEvent(bindParts[6], attrValue, attr.sourceSpan,
            targetMatchableAttrs, targetEvents);
      } else if (isPresent(bindParts[7])) {
        this._parseProperty(bindParts[7], attrValue, attr.sourceSpan,
            targetMatchableAttrs, targetProps);
      } else if (isPresent(bindParts[8])) {
        this._parseEvent(bindParts[8], attrValue, attr.sourceSpan,
            targetMatchableAttrs, targetEvents);
      }
    } else {
      hasBinding = this._parsePropertyInterpolation(attrName, attrValue,
          attr.sourceSpan, targetMatchableAttrs, targetProps);
    }
    if (!hasBinding) {
      this._parseLiteralAttr(attrName, attrValue, attr.sourceSpan, targetProps);
    }
    return hasBinding;
  }

  String _normalizeAttributeName(String attrName) {
    return attrName.toLowerCase().startsWith("data-")
        ? attrName.substring(5)
        : attrName;
  }

  _parseVariable(String identifier, String value, ParseSourceSpan sourceSpan,
      List<VariableAst> targetVars) {
    if (identifier.indexOf("-") > -1) {
      this._reportError('''"-" is not allowed in variable names''', sourceSpan);
    }
    targetVars.add(new VariableAst(identifier, value, sourceSpan));
  }

  _parseProperty(
      String name,
      String expression,
      ParseSourceSpan sourceSpan,
      List<List<String>> targetMatchableAttrs,
      List<BoundElementOrDirectiveProperty> targetProps) {
    this._parsePropertyAst(name, this._parseBinding(expression, sourceSpan),
        sourceSpan, targetMatchableAttrs, targetProps);
  }

  bool _parsePropertyInterpolation(
      String name,
      String value,
      ParseSourceSpan sourceSpan,
      List<List<String>> targetMatchableAttrs,
      List<BoundElementOrDirectiveProperty> targetProps) {
    var expr = this._parseInterpolation(value, sourceSpan);
    if (isPresent(expr)) {
      this._parsePropertyAst(
          name, expr, sourceSpan, targetMatchableAttrs, targetProps);
      return true;
    }
    return false;
  }

  _parsePropertyAst(
      String name,
      ASTWithSource ast,
      ParseSourceSpan sourceSpan,
      List<List<String>> targetMatchableAttrs,
      List<BoundElementOrDirectiveProperty> targetProps) {
    targetMatchableAttrs.add([name, ast.source]);
    targetProps
        .add(new BoundElementOrDirectiveProperty(name, ast, false, sourceSpan));
  }

  _parseAssignmentEvent(
      String name,
      String expression,
      ParseSourceSpan sourceSpan,
      List<List<String>> targetMatchableAttrs,
      List<BoundEventAst> targetEvents) {
    this._parseEvent('''${ name}Change''', '''${ expression}=\$event''',
        sourceSpan, targetMatchableAttrs, targetEvents);
  }

  _parseEvent(
      String name,
      String expression,
      ParseSourceSpan sourceSpan,
      List<List<String>> targetMatchableAttrs,
      List<BoundEventAst> targetEvents) {
    // long format: 'target: eventName'
    var parts = splitAtColon(name, [null, name]);
    var target = parts[0];
    var eventName = parts[1];
    targetEvents.add(new BoundEventAst(eventName, target,
        this._parseAction(expression, sourceSpan), sourceSpan));
  }

  _parseLiteralAttr(String name, String value, ParseSourceSpan sourceSpan,
      List<BoundElementOrDirectiveProperty> targetProps) {
    targetProps.add(new BoundElementOrDirectiveProperty(name,
        this._exprParser.wrapLiteralPrimitive(value, ""), true, sourceSpan));
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
      ParseSourceSpan sourceSpan) {
    var matchedVariables = new Set<String>();
    var directiveAsts = directives.map((CompileDirectiveMetadata directive) {
      List<BoundElementPropertyAst> hostProperties = [];
      List<BoundEventAst> hostEvents = [];
      List<BoundDirectivePropertyAst> directiveProperties = [];
      this._createDirectiveHostPropertyAsts(
          elementName, directive.hostProperties, sourceSpan, hostProperties);
      this._createDirectiveHostEventAsts(
          directive.hostListeners, sourceSpan, hostEvents);
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
          hostEvents, exportAsVars, sourceSpan);
    }).toList();
    possibleExportAsVars.forEach((varAst) {
      if (varAst.value.length > 0 &&
          !SetWrapper.has(matchedVariables, varAst.name)) {
        this._reportError(
            '''There is no directive with "exportAs" set to "${ varAst . value}"''',
            varAst.sourceSpan);
      }
    });
    return directiveAsts;
  }

  _createDirectiveHostPropertyAsts(
      String elementName,
      Map<String, String> hostProps,
      ParseSourceSpan sourceSpan,
      List<BoundElementPropertyAst> targetPropertyAsts) {
    if (isPresent(hostProps)) {
      StringMapWrapper.forEach(hostProps, (expression, propName) {
        var exprAst = this._parseBinding(expression, sourceSpan);
        targetPropertyAsts.add(this._createElementPropertyAst(
            elementName, propName, exprAst, sourceSpan));
      });
    }
  }

  _createDirectiveHostEventAsts(Map<String, String> hostListeners,
      ParseSourceSpan sourceSpan, List<BoundEventAst> targetEventAsts) {
    if (isPresent(hostListeners)) {
      StringMapWrapper.forEach(hostListeners, (expression, propName) {
        this._parseEvent(propName, expression, sourceSpan, [], targetEventAsts);
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
        var prevValue = boundPropsByName[boundProp.name];
        if (isBlank(prevValue) || prevValue.isLiteral) {
          // give [a]="b" a higher precedence than a="b" on the same element
          boundPropsByName[boundProp.name] = boundProp;
        }
      });
      StringMapWrapper.forEach(directiveProperties,
          (String elProp, String dirProp) {
        var boundProp = boundPropsByName[elProp];
        // Bindings are optional, so this binding only needs to be set up if an expression is given.
        if (isPresent(boundProp)) {
          targetBoundDirectiveProps.add(new BoundDirectivePropertyAst(dirProp,
              boundProp.name, boundProp.expression, boundProp.sourceSpan));
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
            elementName, prop.name, prop.expression, prop.sourceSpan));
      }
    });
    return boundElementProps;
  }

  BoundElementPropertyAst _createElementPropertyAst(
      String elementName, String name, AST ast, ParseSourceSpan sourceSpan) {
    var unit = null;
    var bindingType;
    var boundPropertyName;
    var parts = name.split(PROPERTY_PARTS_SEPARATOR);
    if (identical(parts.length, 1)) {
      boundPropertyName = this._schemaRegistry.getMappedPropName(parts[0]);
      bindingType = PropertyBindingType.Property;
      if (!this._schemaRegistry.hasProperty(elementName, boundPropertyName)) {
        this._reportError(
            '''Can\'t bind to \'${ boundPropertyName}\' since it isn\'t a known native property''',
            sourceSpan);
      }
    } else {
      if (parts[0] == ATTRIBUTE_PREFIX) {
        boundPropertyName = parts[1];
        bindingType = PropertyBindingType.Attribute;
      } else if (parts[0] == CLASS_PREFIX) {
        boundPropertyName = parts[1];
        bindingType = PropertyBindingType.Class;
      } else if (parts[0] == STYLE_PREFIX) {
        unit = parts.length > 2 ? parts[2] : null;
        boundPropertyName = parts[1];
        bindingType = PropertyBindingType.Style;
      } else {
        this._reportError('''Invalid property name \'${ name}\'''', sourceSpan);
        bindingType = null;
      }
    }
    return new BoundElementPropertyAst(
        boundPropertyName, bindingType, ast, unit, sourceSpan);
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

  _assertOnlyOneComponent(
      List<DirectiveAst> directives, ParseSourceSpan sourceSpan) {
    var componentTypeNames = this._findComponentDirectiveNames(directives);
    if (componentTypeNames.length > 1) {
      this._reportError(
          '''More than one component: ${ componentTypeNames . join ( "," )}''',
          sourceSpan);
    }
  }

  _assertNoComponentsNorElementBindingsOnTemplate(List<DirectiveAst> directives,
      List<BoundElementPropertyAst> elementProps, ParseSourceSpan sourceSpan) {
    List<String> componentTypeNames =
        this._findComponentDirectiveNames(directives);
    if (componentTypeNames.length > 0) {
      this._reportError(
          '''Components on an embedded template: ${ componentTypeNames . join ( "," )}''',
          sourceSpan);
    }
    elementProps.forEach((prop) {
      this._reportError(
          '''Property binding ${ prop . name} not used by any directive on an embedded template''',
          sourceSpan);
    });
  }

  _assertAllEventsPublishedByDirectives(
      List<DirectiveAst> directives, List<BoundEventAst> events) {
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
            '''Event binding ${ event . fullName} not emitted by any directive on an embedded template''',
            event.sourceSpan);
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
        [], children, ngContentIndex, ast.sourceSpan);
  }

  AttrAst visitAttr(HtmlAttrAst ast, dynamic context) {
    return new AttrAst(ast.name, ast.value, ast.sourceSpan);
  }

  TextAst visitText(HtmlTextAst ast, Component component) {
    var ngContentIndex = component.findNgContentIndex(TEXT_CSS_SELECTOR);
    return new TextAst(ast.value, ngContentIndex, ast.sourceSpan);
  }
}

class BoundElementOrDirectiveProperty {
  String name;
  AST expression;
  bool isLiteral;
  ParseSourceSpan sourceSpan;
  BoundElementOrDirectiveProperty(
      this.name, this.expression, this.isLiteral, this.sourceSpan) {}
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
  var elNameNoNs = splitNsName(elementName)[1];
  cssSelector.setElement(elNameNoNs);
  for (var i = 0; i < matchableAttrs.length; i++) {
    var attrName = matchableAttrs[i][0];
    var attrNameNoNs = splitNsName(attrName)[1];
    var attrValue = matchableAttrs[i][1];
    cssSelector.addAttribute(attrNameNoNs, attrValue);
    if (attrName.toLowerCase() == CLASS_ATTR) {
      var classes = splitClasses(attrValue);
      classes.forEach((className) => cssSelector.addClassName(className));
    }
  }
  return cssSelector;
}

var EMPTY_COMPONENT = new Component(new SelectorMatcher(), null);
var NON_BINDABLE_VISITOR = new NonBindableVisitor();
