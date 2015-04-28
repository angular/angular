import {isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import {ListWrapper, MapWrapper, Set, SetWrapper, List} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {
  ASTWithSource, AST, AstTransformer, AccessMember, LiteralArray, ImplicitReceiver
} from 'angular2/change_detection';

import {RenderProtoView} from './proto_view';
import {ElementBinder, Event} from './element_binder';
import {setterFactory} from './property_setter_factory';

import * as api from '../../api';
import * as directDomRenderer from '../direct_dom_renderer';

import {NG_BINDING_CLASS, EVENT_TARGET_SEPARATOR} from '../util';

export class ProtoViewBuilder {
  rootElement;
  variableBindings: Map<string, string>;
  elements:List<ElementBinderBuilder>;
  imperativeRendererId:string;

  constructor(rootElement) {
    this.rootElement = rootElement;
    this.elements = [];
    this.variableBindings = MapWrapper.create();
    this.imperativeRendererId = null;
  }

  setImperativeRendererId(id:string):ProtoViewBuilder {
    this.imperativeRendererId = id;
    return this;
  }

  bindElement(element, description = null):ElementBinderBuilder {
    var builder = new ElementBinderBuilder(this.elements.length, element, description);
    ListWrapper.push(this.elements, builder);
    DOM.addClass(element, NG_BINDING_CLASS);

    return builder;
  }

  bindVariable(name, value) {
    // Store the variable map from value to variable, reflecting how it will be used later by
    // RenderView. When a local is set to the view, a lookup for the variable name will take place keyed
    // by the "value", or exported identifier. For example, ng-repeat sets a view local of "index".
    // When this occurs, a lookup keyed by "index" must occur to find if there is a var referencing
    // it.
    MapWrapper.set(this.variableBindings, value, name);
  }

  build():api.ProtoViewDto {
    var renderElementBinders = [];

    var apiElementBinders = [];
    ListWrapper.forEach(this.elements, (ebb) => {
      var propertySetters = MapWrapper.create();

      var apiDirectiveBinders = ListWrapper.map(ebb.directives, (dbb) => {
        ebb.eventBuilder.merge(dbb.eventBuilder);

        MapWrapper.forEach(dbb.hostPropertyBindings, (_, hostPropertyName) => {
          MapWrapper.set(propertySetters, hostPropertyName, setterFactory(hostPropertyName));
        });

        return new api.DirectiveBinder({
          directiveIndex: dbb.directiveIndex,
          propertyBindings: dbb.propertyBindings,
          eventBindings: dbb.eventBindings,
          hostPropertyBindings: dbb.hostPropertyBindings
        });
      });

      MapWrapper.forEach(ebb.propertyBindings, (_, propertyName) => {
        MapWrapper.set(propertySetters, propertyName, setterFactory(propertyName));
      });

      var nestedProtoView =
          isPresent(ebb.nestedProtoView) ? ebb.nestedProtoView.build() : null;
      var parentIndex = isPresent(ebb.parent) ? ebb.parent.index : -1;
      ListWrapper.push(apiElementBinders, new api.ElementBinder({
        index: ebb.index, parentIndex:parentIndex, distanceToParent:ebb.distanceToParent,
        directives: apiDirectiveBinders,
        nestedProtoView: nestedProtoView,
        propertyBindings: ebb.propertyBindings, variableBindings: ebb.variableBindings,
        eventBindings: ebb.eventBindings,
        textBindings: ebb.textBindings,
        readAttributes: ebb.readAttributes
      }));
      ListWrapper.push(renderElementBinders, new ElementBinder({
        textNodeIndices: ebb.textBindingIndices,
        contentTagSelector: ebb.contentTagSelector,
        parentIndex: parentIndex,
        distanceToParent: ebb.distanceToParent,
        nestedProtoView: isPresent(nestedProtoView) ? nestedProtoView.render.delegate : null,
        componentId: ebb.componentId,
        eventLocals: new LiteralArray(ebb.eventBuilder.buildEventLocals()),
        localEvents: ebb.eventBuilder.buildLocalEvents(),
        globalEvents: ebb.eventBuilder.buildGlobalEvents(),
        propertySetters: propertySetters
      }));
    });
    return new api.ProtoViewDto({
      render: new directDomRenderer.DirectDomProtoViewRef(new RenderProtoView({
        element: this.rootElement,
        elementBinders: renderElementBinders,
        imperativeRendererId: this.imperativeRendererId
      })),
      elementBinders: apiElementBinders,
      variableBindings: this.variableBindings
    });
  }
}

export class ElementBinderBuilder {
  element;
  index:number;
  parent:ElementBinderBuilder;
  distanceToParent:number;
  directives:List<DirectiveBuilder>;
  nestedProtoView:ProtoViewBuilder;
  propertyBindings: Map<string, ASTWithSource>;
  variableBindings: Map<string, string>;
  eventBindings: List<api.EventBinding>;
  eventBuilder: EventBuilder;
  textBindingIndices: List<number>;
  textBindings: List<ASTWithSource>;
  contentTagSelector:string;
  readAttributes: Map<string, string>;
  componentId: string;

  constructor(index, element, description) {
    this.element = element;
    this.index = index;
    this.parent = null;
    this.distanceToParent = 0;
    this.directives = [];
    this.nestedProtoView = null;
    this.propertyBindings = MapWrapper.create();
    this.variableBindings = MapWrapper.create();
    this.eventBindings = ListWrapper.create();
    this.eventBuilder = new EventBuilder();
    this.textBindings = [];
    this.textBindingIndices = [];
    this.contentTagSelector = null;
    this.componentId = null;
    this.readAttributes = MapWrapper.create();
  }

  setParent(parent:ElementBinderBuilder, distanceToParent):ElementBinderBuilder {
    this.parent = parent;
    if (isPresent(parent)) {
      this.distanceToParent = distanceToParent;
    }
    return this;
  }

  readAttribute(attrName:string) {
    if (isBlank(MapWrapper.get(this.readAttributes, attrName))) {
      MapWrapper.set(this.readAttributes, attrName, DOM.getAttribute(this.element, attrName));
    }
  }

  bindDirective(directiveIndex:number):DirectiveBuilder {
    var directive = new DirectiveBuilder(directiveIndex);
    ListWrapper.push(this.directives, directive);
    return directive;
  }

  bindNestedProtoView(rootElement):ProtoViewBuilder {
    if (isPresent(this.nestedProtoView)) {
      throw new BaseException('Only one nested view per element is allowed');
    }
    this.nestedProtoView = new ProtoViewBuilder(rootElement);
    return this.nestedProtoView;
  }

  bindProperty(name, expression) {
    MapWrapper.set(this.propertyBindings, name, expression);

    //TODO: required for Dart transformers. Remove when Dart transformers
    //run all the steps of the render compiler
    setterFactory(name);
  }

  bindVariable(name, value) {
    // When current is a view root, the variable bindings are set to the *nested* proto view.
    // The root view conceptually signifies a new "block scope" (the nested view), to which
    // the variables are bound.
    if (isPresent(this.nestedProtoView)) {
      this.nestedProtoView.bindVariable(name, value);
    } else {
      // Store the variable map from value to variable, reflecting how it will be used later by
      // RenderView. When a local is set to the view, a lookup for the variable name will take place keyed
      // by the "value", or exported identifier. For example, ng-repeat sets a view local of "index".
      // When this occurs, a lookup keyed by "index" must occur to find if there is a var referencing
      // it.
      MapWrapper.set(this.variableBindings, value, name);
    }
  }

  bindEvent(name, expression, target = null) {
    ListWrapper.push(this.eventBindings, this.eventBuilder.add(name, expression, target));
  }

  bindText(index, expression) {
    ListWrapper.push(this.textBindingIndices, index);
    ListWrapper.push(this.textBindings, expression);
  }

  setContentTagSelector(value:string) {
    this.contentTagSelector = value;
  }

  setComponentId(componentId:string) {
    this.componentId = componentId;
  }
}

export class DirectiveBuilder {
  directiveIndex:number;
  propertyBindings: Map<string, ASTWithSource>;
  hostPropertyBindings: Map<string, ASTWithSource>;
  eventBindings: List<api.EventBinding>;
  eventBuilder: EventBuilder;

  constructor(directiveIndex) {
    this.directiveIndex = directiveIndex;
    this.propertyBindings = MapWrapper.create();
    this.hostPropertyBindings = MapWrapper.create();
    this.eventBindings = ListWrapper.create();
    this.eventBuilder = new EventBuilder();
  }

  bindProperty(name, expression) {
    MapWrapper.set(this.propertyBindings, name, expression);
  }

  bindHostProperty(name, expression) {
    MapWrapper.set(this.hostPropertyBindings, name, expression);
  }

  bindEvent(name, expression, target = null) {
    ListWrapper.push(this.eventBindings, this.eventBuilder.add(name, expression, target));
  }
}

export class EventBuilder extends AstTransformer {
  locals: List<AST>;
  localEvents: List<Event>;
  globalEvents: List<Event>;
  _implicitReceiver: AST;

  constructor() {
    super();
    this.locals = [];
    this.localEvents = [];
    this.globalEvents = [];
    this._implicitReceiver = new ImplicitReceiver();
  }

  add(name: string, source: ASTWithSource, target: string): api.EventBinding {
    // TODO(tbosch): reenable this when we are parsing element properties
    // out of action expressions
    // var adjustedAst = astWithSource.ast.visit(this);
    var adjustedAst = source.ast;
    var fullName = isPresent(target) ? target + EVENT_TARGET_SEPARATOR + name : name;
    var result = new api.EventBinding(fullName, new ASTWithSource(adjustedAst, source.source, source.location));
    var event = new Event(name, target, fullName);
    if (isBlank(target)) {
      ListWrapper.push(this.localEvents, event);
    } else {
      ListWrapper.push(this.globalEvents, event);
    }
    return result;
  }

  visitAccessMember(ast:AccessMember) {
    var isEventAccess = false;
    var current = ast;
    while (!isEventAccess && (current instanceof AccessMember)) {
      if (current.name == '$event') {
        isEventAccess = true;
      }
      current = current.receiver;
    }

    if (isEventAccess) {
      ListWrapper.push(this.locals, ast);
      var index = this.locals.length - 1;
      return new AccessMember(this._implicitReceiver, `${index}`, (arr) => arr[index], null);
    } else {
      return ast;
    }
  }

  buildEventLocals() {
    return this.locals;
  }

  buildLocalEvents() {
    return this.localEvents;
  }

  buildGlobalEvents() {
    return this.globalEvents;
  }

  merge(eventBuilder: EventBuilder) {
    this._merge(this.localEvents, eventBuilder.localEvents);
    this._merge(this.globalEvents, eventBuilder.globalEvents);
    ListWrapper.concat(this.locals, eventBuilder.locals);
  }

  _merge(host: List<Event>, tobeAdded: List<Event>) {
    var names = ListWrapper.create();
    for (var i = 0; i < host.length; i++) {
      ListWrapper.push(names, host[i].fullName);
    }
    for (var j = 0; j < tobeAdded.length; j++) {
      if (!ListWrapper.contains(names, tobeAdded[j].fullName)) {
        ListWrapper.push(host, tobeAdded[j]);
      }
    }
  }
}
