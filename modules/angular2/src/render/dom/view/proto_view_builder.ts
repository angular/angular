import {isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import {ListWrapper, MapWrapper, Set, SetWrapper, List} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {
  ASTWithSource,
  AST,
  AstTransformer,
  AccessMember,
  LiteralArray,
  ImplicitReceiver
} from 'angular2/change_detection';

import {DomProtoView, DomProtoViewRef, resolveInternalDomProtoView} from './proto_view';
import {ElementBinder, Event, HostAction} from './element_binder';
import {PropertySetterFactory} from './property_setter_factory';

import * as api from '../../api';

import {NG_BINDING_CLASS, EVENT_TARGET_SEPARATOR} from '../util';

export class ProtoViewBuilder {
  variableBindings: Map<string, string> = new Map();
  elements: List<ElementBinderBuilder> = [];

  constructor(public rootElement, public type: api.ViewType) {}

  bindElement(element, description = null): ElementBinderBuilder {
    var builder = new ElementBinderBuilder(this.elements.length, element, description);
    this.elements.push(builder);
    DOM.addClass(element, NG_BINDING_CLASS);

    return builder;
  }

  bindVariable(name, value) {
    // Store the variable map from value to variable, reflecting how it will be used later by
    // DomView. When a local is set to the view, a lookup for the variable name will take place
    // keyed
    // by the "value", or exported identifier. For example, ng-for sets a view local of "index".
    // When this occurs, a lookup keyed by "index" must occur to find if there is a var referencing
    // it.
    this.variableBindings.set(value, name);
  }

  build(setterFactory: PropertySetterFactory): api.ProtoViewDto {
    var renderElementBinders = [];

    var apiElementBinders = [];
    var transitiveContentTagCount = 0;
    var boundTextNodeCount = 0;
    ListWrapper.forEach(this.elements, (ebb: ElementBinderBuilder) => {
      var propertySetters = new Map();
      var hostActions = new Map();

      var apiDirectiveBinders = ListWrapper.map(ebb.directives, (dbb: DirectiveBuilder) => {
        ebb.eventBuilder.merge(dbb.eventBuilder);

        MapWrapper.forEach(dbb.hostPropertyBindings, (_, hostPropertyName) => {
          propertySetters.set(hostPropertyName,
                              setterFactory.createSetter(ebb.element, isPresent(ebb.componentId),
                                                         hostPropertyName));
        });

        ListWrapper.forEach(dbb.hostActions, (hostAction) => {
          hostActions.set(hostAction.actionExpression, hostAction.expression);
        });

        return new api.DirectiveBinder({
          directiveIndex: dbb.directiveIndex,
          propertyBindings: dbb.propertyBindings,
          eventBindings: dbb.eventBindings,
          hostPropertyBindings: dbb.hostPropertyBindings
        });
      });

      MapWrapper.forEach(ebb.propertyBindings, (_, propertyName) => {
        var propSetter =
            setterFactory.createSetter(ebb.element, isPresent(ebb.componentId), propertyName);

        if (propSetter === PropertySetterFactory.noopSetter) {
          if (!SetWrapper.has(ebb.propertyBindingsToDirectives, propertyName)) {
            throw new BaseException(
                `Can't bind to '${propertyName}' since it isn't a know property of the '${DOM.tagName(ebb.element).toLowerCase()}' element and there are no matching directives with a corresponding property`);
          }
        }

        propertySetters.set(propertyName, propSetter);
      });

      var nestedProtoView =
          isPresent(ebb.nestedProtoView) ? ebb.nestedProtoView.build(setterFactory) : null;
      var nestedRenderProtoView =
          isPresent(nestedProtoView) ? resolveInternalDomProtoView(nestedProtoView.render) : null;
      if (isPresent(nestedRenderProtoView)) {
        transitiveContentTagCount += nestedRenderProtoView.transitiveContentTagCount;
      }
      if (isPresent(ebb.contentTagSelector)) {
        transitiveContentTagCount++;
      }
      var parentIndex = isPresent(ebb.parent) ? ebb.parent.index : -1;
      apiElementBinders.push(new api.ElementBinder({
        index: ebb.index,
        parentIndex: parentIndex,
        distanceToParent: ebb.distanceToParent,
        directives: apiDirectiveBinders,
        nestedProtoView: nestedProtoView,
        propertyBindings: ebb.propertyBindings,
        variableBindings: ebb.variableBindings,
        eventBindings: ebb.eventBindings,
        textBindings: ebb.textBindings,
        readAttributes: ebb.readAttributes
      }));
      var childNodeInfo = this._analyzeChildNodes(ebb.element, ebb.textBindingNodes);
      boundTextNodeCount += ebb.textBindingNodes.length;
      renderElementBinders.push(new ElementBinder({
        textNodeIndices: childNodeInfo.boundTextNodeIndices,
        contentTagSelector: ebb.contentTagSelector,
        parentIndex: parentIndex,
        distanceToParent: ebb.distanceToParent,
        nestedProtoView:
            isPresent(nestedProtoView) ? resolveInternalDomProtoView(nestedProtoView.render) : null,
        componentId: ebb.componentId,
        eventLocals: new LiteralArray(ebb.eventBuilder.buildEventLocals()),
        localEvents: ebb.eventBuilder.buildLocalEvents(),
        globalEvents: ebb.eventBuilder.buildGlobalEvents(),
        hostActions: hostActions,
        propertySetters: propertySetters,
        elementIsEmpty: childNodeInfo.elementIsEmpty
      }));
    });
    return new api.ProtoViewDto({
      render: new DomProtoViewRef(new DomProtoView({
        element: this.rootElement,
        elementBinders: renderElementBinders,
        transitiveContentTagCount: transitiveContentTagCount,
        boundTextNodeCount: boundTextNodeCount
      })),
      type: this.type,
      elementBinders: apiElementBinders,
      variableBindings: this.variableBindings
    });
  }

  // Note: We need to calculate the next node indices not until the compilation is complete,
  // as the compiler might change the order of elements.
  private _analyzeChildNodes(parentElement: /*element*/ any,
                             boundTextNodes: List</*node*/ any>): _ChildNodesInfo {
    var childNodes = DOM.childNodes(DOM.templateAwareRoot(parentElement));
    var boundTextNodeIndices = [];
    var indexInBoundTextNodes = 0;
    var elementIsEmpty = true;
    for (var i = 0; i < childNodes.length; i++) {
      var node = childNodes[i];
      if (indexInBoundTextNodes < boundTextNodes.length &&
          node === boundTextNodes[indexInBoundTextNodes]) {
        boundTextNodeIndices.push(i);
        indexInBoundTextNodes++;
        elementIsEmpty = false;
      } else if ((DOM.isTextNode(node) && DOM.getText(node).trim().length > 0) ||
                 (DOM.isElementNode(node))) {
        elementIsEmpty = false;
      }
    }
    return new _ChildNodesInfo(boundTextNodeIndices, elementIsEmpty);
  }
}

class _ChildNodesInfo {
  constructor(public boundTextNodeIndices: List<number>, public elementIsEmpty: boolean) {}
}

export class ElementBinderBuilder {
  parent: ElementBinderBuilder = null;
  distanceToParent: number = 0;
  directives: List<DirectiveBuilder> = [];
  nestedProtoView: ProtoViewBuilder = null;
  propertyBindings: Map<string, ASTWithSource> = new Map();
  variableBindings: Map<string, string> = new Map();
  propertyBindingsToDirectives: Set<string> = new Set();
  eventBindings: List<api.EventBinding> = [];
  eventBuilder: EventBuilder = new EventBuilder();
  textBindingNodes: List</*node*/ any> = [];
  textBindings: List<ASTWithSource> = [];
  contentTagSelector: string = null;
  readAttributes: Map<string, string> = new Map();
  componentId: string = null;

  constructor(public index: number, public element, description: string) {}

  setParent(parent: ElementBinderBuilder, distanceToParent): ElementBinderBuilder {
    this.parent = parent;
    if (isPresent(parent)) {
      this.distanceToParent = distanceToParent;
    }
    return this;
  }

  readAttribute(attrName: string) {
    if (isBlank(this.readAttributes.get(attrName))) {
      this.readAttributes.set(attrName, DOM.getAttribute(this.element, attrName));
    }
  }

  bindDirective(directiveIndex: number): DirectiveBuilder {
    var directive = new DirectiveBuilder(directiveIndex);
    this.directives.push(directive);
    return directive;
  }

  bindNestedProtoView(rootElement): ProtoViewBuilder {
    if (isPresent(this.nestedProtoView)) {
      throw new BaseException('Only one nested view per element is allowed');
    }
    this.nestedProtoView = new ProtoViewBuilder(rootElement, api.ViewType.EMBEDDED);
    return this.nestedProtoView;
  }

  bindProperty(name, expression) { this.propertyBindings.set(name, expression); }

  bindPropertyToDirective(name: string) {
    // we are filling in a set of property names that are bound to a property
    // of at least one directive. This allows us to report "dangling" bindings.
    this.propertyBindingsToDirectives.add(name);
  }

  bindVariable(name, value) {
    // When current is a view root, the variable bindings are set to the *nested* proto view.
    // The root view conceptually signifies a new "block scope" (the nested view), to which
    // the variables are bound.
    if (isPresent(this.nestedProtoView)) {
      this.nestedProtoView.bindVariable(name, value);
    } else {
      // Store the variable map from value to variable, reflecting how it will be used later by
      // DomView. When a local is set to the view, a lookup for the variable name will take place
      // keyed
      // by the "value", or exported identifier. For example, ng-for sets a view local of "index".
      // When this occurs, a lookup keyed by "index" must occur to find if there is a var
      // referencing
      // it.
      this.variableBindings.set(value, name);
    }
  }

  bindEvent(name, expression, target = null) {
    this.eventBindings.push(this.eventBuilder.add(name, expression, target));
  }

  bindText(textNode, expression) {
    this.textBindingNodes.push(textNode);
    this.textBindings.push(expression);
  }

  setContentTagSelector(value: string) { this.contentTagSelector = value; }

  setComponentId(componentId: string) { this.componentId = componentId; }
}

export class DirectiveBuilder {
  propertyBindings: Map<string, ASTWithSource> = new Map();
  hostPropertyBindings: Map<string, ASTWithSource> = new Map();
  hostActions: List<HostAction> = [];
  eventBindings: List<api.EventBinding> = [];
  eventBuilder: EventBuilder = new EventBuilder();

  constructor(public directiveIndex: number) {}

  bindProperty(name, expression) { this.propertyBindings.set(name, expression); }

  bindHostProperty(name, expression) { this.hostPropertyBindings.set(name, expression); }

  bindHostAction(actionName: string, actionExpression: string, expression: ASTWithSource) {
    this.hostActions.push(new HostAction(actionName, actionExpression, expression));
  }

  bindEvent(name, expression, target = null) {
    this.eventBindings.push(this.eventBuilder.add(name, expression, target));
  }
}

export class EventBuilder extends AstTransformer {
  locals: List<AST> = [];
  localEvents: List<Event> = [];
  globalEvents: List<Event> = [];
  _implicitReceiver: AST = new ImplicitReceiver();

  constructor() { super(); }

  add(name: string, source: ASTWithSource, target: string): api.EventBinding {
    // TODO(tbosch): reenable this when we are parsing element properties
    // out of action expressions
    // var adjustedAst = astWithSource.ast.visit(this);
    var adjustedAst = source.ast;
    var fullName = isPresent(target) ? target + EVENT_TARGET_SEPARATOR + name : name;
    var result = new api.EventBinding(
        fullName, new ASTWithSource(adjustedAst, source.source, source.location));
    var event = new Event(name, target, fullName);
    if (isBlank(target)) {
      this.localEvents.push(event);
    } else {
      this.globalEvents.push(event);
    }
    return result;
  }

  visitAccessMember(ast: AccessMember) {
    var isEventAccess = false;
    var current: AST = ast;
    while (!isEventAccess && (current instanceof AccessMember)) {
      var am = <AccessMember>current;
      if (am.name == '$event') {
        isEventAccess = true;
      }
      current = am.receiver;
    }

    if (isEventAccess) {
      this.locals.push(ast);
      var index = this.locals.length - 1;
      return new AccessMember(this._implicitReceiver, `${index}`, (arr) => arr[index], null);
    } else {
      return ast;
    }
  }

  buildEventLocals() { return this.locals; }

  buildLocalEvents() { return this.localEvents; }

  buildGlobalEvents() { return this.globalEvents; }

  merge(eventBuilder: EventBuilder) {
    this._merge(this.localEvents, eventBuilder.localEvents);
    this._merge(this.globalEvents, eventBuilder.globalEvents);
    ListWrapper.concat(this.locals, eventBuilder.locals);
  }

  _merge(host: List<Event>, tobeAdded: List<Event>) {
    var names = [];
    for (var i = 0; i < host.length; i++) {
      names.push(host[i].fullName);
    }
    for (var j = 0; j < tobeAdded.length; j++) {
      if (!ListWrapper.contains(names, tobeAdded[j].fullName)) {
        host.push(tobeAdded[j]);
      }
    }
  }
}
