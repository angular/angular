import {
  Type,
  isArray,
  isPresent,
  serializeEnum,
  deserializeEnum,
  BaseException
} from "angular2/src/core/facade/lang";
import {
  ListWrapper,
  Map,
  StringMap,
  StringMapWrapper,
  MapWrapper
} from "angular2/src/core/facade/collection";
import {
  ProtoViewDto,
  RenderDirectiveMetadata,
  RenderElementBinder,
  DirectiveBinder,
  ElementPropertyBinding,
  EventBinding,
  ViewDefinition,
  RenderProtoViewRef,
  RenderProtoViewMergeMapping,
  RenderViewRef,
  RenderFragmentRef,
  RenderElementRef,
  ViewType,
  ViewEncapsulation,
  PropertyBindingType
} from "angular2/src/core/render/api";
import {WebWorkerElementRef} from 'angular2/src/web_workers/shared/api';
import {AST, ASTWithSource} from 'angular2/src/core/change_detection/change_detection';
import {Parser} from "angular2/src/core/change_detection/parser/parser";
import {Injectable} from "angular2/di";
import {RenderProtoViewRefStore} from 'angular2/src/web_workers/shared/render_proto_view_ref_store';
import {
  RenderViewWithFragmentsStore
} from 'angular2/src/web_workers/shared/render_view_with_fragments_store';

// PRIMITIVE is any type that does not need to be serialized (string, number, boolean)
// We set it to String so that it is considered a Type.
export const PRIMITIVE: Type = String;

@Injectable()
export class Serializer {
  private _enumRegistry: Map<any, Map<number, any>>;
  constructor(private _parser: Parser, private _protoViewStore: RenderProtoViewRefStore,
              private _renderViewStore: RenderViewWithFragmentsStore) {
    this._enumRegistry = new Map<any, Map<number, any>>();

    var viewTypeMap = new Map<number, any>();
    viewTypeMap[0] = ViewType.HOST;
    viewTypeMap[1] = ViewType.COMPONENT;
    viewTypeMap[2] = ViewType.EMBEDDED;
    this._enumRegistry.set(ViewType, viewTypeMap);

    var viewEncapsulationMap = new Map<number, any>();
    viewEncapsulationMap[0] = ViewEncapsulation.Emulated;
    viewEncapsulationMap[1] = ViewEncapsulation.Native;
    viewEncapsulationMap[2] = ViewEncapsulation.None;
    this._enumRegistry.set(ViewEncapsulation, viewEncapsulationMap);

    var propertyBindingTypeMap = new Map<number, any>();
    propertyBindingTypeMap[0] = PropertyBindingType.PROPERTY;
    propertyBindingTypeMap[1] = PropertyBindingType.ATTRIBUTE;
    propertyBindingTypeMap[2] = PropertyBindingType.CLASS;
    propertyBindingTypeMap[3] = PropertyBindingType.STYLE;
    this._enumRegistry.set(PropertyBindingType, propertyBindingTypeMap);
  }

  serialize(obj: any, type: Type): Object {
    if (!isPresent(obj)) {
      return null;
    }
    if (isArray(obj)) {
      var serializedObj = [];
      ListWrapper.forEach(obj, (val) => { serializedObj.push(this.serialize(val, type)); });
      return serializedObj;
    }
    if (type == PRIMITIVE) {
      return obj;
    }
    if (type == ViewDefinition) {
      return this._serializeViewDefinition(obj);
    } else if (type == DirectiveBinder) {
      return this._serializeDirectiveBinder(obj);
    } else if (type == ProtoViewDto) {
      return this._serializeProtoViewDto(obj);
    } else if (type == RenderElementBinder) {
      return this._serializeElementBinder(obj);
    } else if (type == RenderDirectiveMetadata) {
      return this._serializeDirectiveMetadata(obj);
    } else if (type == ASTWithSource) {
      return this._serializeASTWithSource(obj);
    } else if (type == RenderProtoViewRef) {
      return this._protoViewStore.serialize(obj);
    } else if (type == RenderProtoViewMergeMapping) {
      return this._serializeRenderProtoViewMergeMapping(obj);
    } else if (type == RenderViewRef) {
      return this._renderViewStore.serializeRenderViewRef(obj);
    } else if (type == RenderFragmentRef) {
      return this._renderViewStore.serializeRenderFragmentRef(obj);
    } else if (type == WebWorkerElementRef) {
      return this._serializeWorkerElementRef(obj);
    } else if (type == ElementPropertyBinding) {
      return this._serializeElementPropertyBinding(obj);
    } else if (type == EventBinding) {
      return this._serializeEventBinding(obj);
    } else {
      throw new BaseException("No serializer for " + type.toString());
    }
  }

  deserialize(map: any, type: Type, data?: any): any {
    if (!isPresent(map)) {
      return null;
    }
    if (isArray(map)) {
      var obj: any[] = [];
      ListWrapper.forEach(map, (val) => { obj.push(this.deserialize(val, type, data)); });
      return obj;
    }
    if (type == PRIMITIVE) {
      return map;
    }

    if (type == ViewDefinition) {
      return this._deserializeViewDefinition(map);
    } else if (type == DirectiveBinder) {
      return this._deserializeDirectiveBinder(map);
    } else if (type == ProtoViewDto) {
      return this._deserializeProtoViewDto(map);
    } else if (type == RenderDirectiveMetadata) {
      return this._deserializeDirectiveMetadata(map);
    } else if (type == RenderElementBinder) {
      return this._deserializeElementBinder(map);
    } else if (type == ASTWithSource) {
      return this._deserializeASTWithSource(map, data);
    } else if (type == RenderProtoViewRef) {
      return this._protoViewStore.deserialize(map);
    } else if (type == RenderProtoViewMergeMapping) {
      return this._deserializeRenderProtoViewMergeMapping(map);
    } else if (type == RenderViewRef) {
      return this._renderViewStore.deserializeRenderViewRef(map);
    } else if (type == RenderFragmentRef) {
      return this._renderViewStore.deserializeRenderFragmentRef(map);
    } else if (type == WebWorkerElementRef) {
      return this._deserializeWorkerElementRef(map);
    } else if (type == EventBinding) {
      return this._deserializeEventBinding(map);
    } else if (type == ElementPropertyBinding) {
      return this._deserializeElementPropertyBinding(map);
    } else {
      throw new BaseException("No deserializer for " + type.toString());
    }
  }

  mapToObject(map: Map<string, any>, type?: Type): Object {
    var object = {};
    var serialize = isPresent(type);

    MapWrapper.forEach(map, (value, key) => {
      if (serialize) {
        object[key] = this.serialize(value, type);
      } else {
        object[key] = value;
      }
    });
    return object;
  }

  /*
   * Transforms a Javascript object (StringMap) into a Map<string, V>
   * If the values need to be deserialized pass in their type
   * and they will be deserialized before being placed in the map
   */
  objectToMap(obj: StringMap<string, any>, type?: Type, data?: any): Map<string, any> {
    if (isPresent(type)) {
      var map: Map<string, any> = new Map();
      StringMapWrapper.forEach(obj,
                               (val, key) => { map.set(key, this.deserialize(val, type, data)); });
      return map;
    } else {
      return MapWrapper.createFromStringMap(obj);
    }
  }

  allocateRenderViews(fragmentCount: number) { this._renderViewStore.allocate(fragmentCount); }

  private _serializeElementPropertyBinding(binding:
                                               ElementPropertyBinding): StringMap<string, any> {
    return {
      'type': serializeEnum(binding.type),
      'astWithSource': this.serialize(binding.astWithSource, ASTWithSource),
      'property': binding.property,
      'unit': binding.unit
    };
  }

  private _deserializeElementPropertyBinding(map: StringMap<string, any>): ElementPropertyBinding {
    var type = deserializeEnum(map['type'], this._enumRegistry.get(PropertyBindingType));
    var ast = this.deserialize(map['astWithSource'], ASTWithSource, "binding");
    return new ElementPropertyBinding(type, ast, map['property'], map['unit']);
  }

  private _serializeEventBinding(binding: EventBinding): StringMap<string, any> {
    return {'fullName': binding.fullName, 'source': this.serialize(binding.source, ASTWithSource)};
  }

  private _deserializeEventBinding(map: StringMap<string, any>): EventBinding {
    return new EventBinding(map['fullName'],
                            this.deserialize(map['source'], ASTWithSource, "action"));
  }

  private _serializeWorkerElementRef(elementRef: RenderElementRef): StringMap<string, any> {
    return {
      'renderView': this.serialize(elementRef.renderView, RenderViewRef),
      'renderBoundElementIndex': elementRef.renderBoundElementIndex
    };
  }

  private _deserializeWorkerElementRef(map: StringMap<string, any>): RenderElementRef {
    return new WebWorkerElementRef(this.deserialize(map['renderView'], RenderViewRef),
                                   map['renderBoundElementIndex']);
  }

  private _serializeRenderProtoViewMergeMapping(mapping: RenderProtoViewMergeMapping): Object {
    return {
      'mergedProtoViewRef': this._protoViewStore.serialize(mapping.mergedProtoViewRef),
      'fragmentCount': mapping.fragmentCount,
      'mappedElementIndices': mapping.mappedElementIndices,
      'mappedElementCount': mapping.mappedElementCount,
      'mappedTextIndices': mapping.mappedTextIndices,
      'hostElementIndicesByViewIndex': mapping.hostElementIndicesByViewIndex,
      'nestedViewCountByViewIndex': mapping.nestedViewCountByViewIndex
    };
  }

  private _deserializeRenderProtoViewMergeMapping(obj: StringMap<string, any>):
      RenderProtoViewMergeMapping {
    return new RenderProtoViewMergeMapping(
        this._protoViewStore.deserialize(obj['mergedProtoViewRef']), obj['fragmentCount'],
        obj['mappedElementIndices'], obj['mappedElementCount'], obj['mappedTextIndices'],
        obj['hostElementIndicesByViewIndex'], obj['nestedViewCountByViewIndex']);
  }

  private _serializeASTWithSource(tree: ASTWithSource): Object {
    return {'input': tree.source, 'location': tree.location};
  }

  private _deserializeASTWithSource(obj: StringMap<string, any>, data: string): AST {
    // TODO: make ASTs serializable
    var ast: AST;
    switch (data) {
      case "action":
        ast = this._parser.parseAction(obj['input'], obj['location']);
        break;
      case "binding":
        ast = this._parser.parseBinding(obj['input'], obj['location']);
        break;
      case "interpolation":
        ast = this._parser.parseInterpolation(obj['input'], obj['location']);
        break;
      default:
        throw "No AST deserializer for " + data;
    }
    return ast;
  }

  private _serializeViewDefinition(view: ViewDefinition): Object {
    return {
      'componentId': view.componentId,
      'templateAbsUrl': view.templateAbsUrl,
      'template': view.template,
      'directives': this.serialize(view.directives, RenderDirectiveMetadata),
      'styleAbsUrls': view.styleAbsUrls,
      'styles': view.styles,
      'encapsulation': serializeEnum(view.encapsulation)
    };
  }

  private _deserializeViewDefinition(obj: StringMap<string, any>): ViewDefinition {
    return new ViewDefinition({
      componentId: obj['componentId'],
      templateAbsUrl: obj['templateAbsUrl'], template: obj['template'],
      directives: this.deserialize(obj['directives'], RenderDirectiveMetadata),
      styleAbsUrls: obj['styleAbsUrls'],
      styles: obj['styles'],
      encapsulation:
          deserializeEnum(obj['encapsulation'], this._enumRegistry.get(ViewEncapsulation))
    });
  }

  private _serializeDirectiveBinder(binder: DirectiveBinder): Object {
    return {
      'directiveIndex': binder.directiveIndex,
      'propertyBindings': this.mapToObject(binder.propertyBindings, ASTWithSource),
      'eventBindings': this.serialize(binder.eventBindings, EventBinding),
      'hostPropertyBindings': this.serialize(binder.hostPropertyBindings, ElementPropertyBinding)
    };
  }

  private _deserializeDirectiveBinder(obj: StringMap<string, any>): DirectiveBinder {
    return new DirectiveBinder({
      directiveIndex: obj['directiveIndex'],
      propertyBindings: this.objectToMap(obj['propertyBindings'], ASTWithSource, "binding"),
      eventBindings: this.deserialize(obj['eventBindings'], EventBinding),
      hostPropertyBindings: this.deserialize(obj['hostPropertyBindings'], ElementPropertyBinding)
    });
  }

  private _serializeElementBinder(binder: RenderElementBinder): Object {
    return {
      'index': binder.index,
      'parentIndex': binder.parentIndex,
      'distanceToParent': binder.distanceToParent,
      'directives': this.serialize(binder.directives, DirectiveBinder),
      'nestedProtoView': this.serialize(binder.nestedProtoView, ProtoViewDto),
      'propertyBindings': this.serialize(binder.propertyBindings, ElementPropertyBinding),
      'variableBindings': this.mapToObject(binder.variableBindings),
      'eventBindings': this.serialize(binder.eventBindings, EventBinding),
      'readAttributes': this.mapToObject(binder.readAttributes)
    };
  }

  private _deserializeElementBinder(obj: StringMap<string, any>): RenderElementBinder {
    return new RenderElementBinder({
      index: obj['index'],
      parentIndex: obj['parentIndex'],
      distanceToParent: obj['distanceToParent'],
      directives: this.deserialize(obj['directives'], DirectiveBinder),
      nestedProtoView: this.deserialize(obj['nestedProtoView'], ProtoViewDto),
      propertyBindings: this.deserialize(obj['propertyBindings'], ElementPropertyBinding),
      variableBindings: this.objectToMap(obj['variableBindings']),
      eventBindings: this.deserialize(obj['eventBindings'], EventBinding),
      readAttributes: this.objectToMap(obj['readAttributes'])
    });
  }

  private _serializeProtoViewDto(view: ProtoViewDto): Object {
    return {
      'render': this._protoViewStore.serialize(view.render),
      'elementBinders': this.serialize(view.elementBinders, RenderElementBinder),
      'variableBindings': this.mapToObject(view.variableBindings),
      'type': serializeEnum(view.type),
      'textBindings': this.serialize(view.textBindings, ASTWithSource),
      'transitiveNgContentCount': view.transitiveNgContentCount
    };
  }

  private _deserializeProtoViewDto(obj: StringMap<string, any>): ProtoViewDto {
    return new ProtoViewDto({
      render: this._protoViewStore.deserialize(obj["render"]),
      elementBinders: this.deserialize(obj['elementBinders'], RenderElementBinder),
      variableBindings: this.objectToMap(obj['variableBindings']),
      textBindings: this.deserialize(obj['textBindings'], ASTWithSource, "interpolation"),
      type: deserializeEnum(obj['type'], this._enumRegistry.get(ViewType)),
      transitiveNgContentCount: obj['transitiveNgContentCount']
    });
  }

  private _serializeDirectiveMetadata(meta: RenderDirectiveMetadata): Object {
    var obj = {
      'id': meta.id,
      'selector': meta.selector,
      'compileChildren': meta.compileChildren,
      'events': meta.events,
      'properties': meta.properties,
      'readAttributes': meta.readAttributes,
      'type': meta.type,
      'callOnDestroy': meta.callOnDestroy,
      'callOnChanges': meta.callOnChanges,
      'callDoCheck': meta.callDoCheck,
      'callOnInit': meta.callOnInit,
      'callAfterContentChecked': meta.callAfterContentChecked,
      'changeDetection': meta.changeDetection,
      'exportAs': meta.exportAs,
      'hostProperties': this.mapToObject(meta.hostProperties),
      'hostListeners': this.mapToObject(meta.hostListeners),
      'hostAttributes': this.mapToObject(meta.hostAttributes)
    };
    return obj;
  }
  private _deserializeDirectiveMetadata(obj: StringMap<string, any>): RenderDirectiveMetadata {
    return new RenderDirectiveMetadata({
      id: obj['id'],
      selector: obj['selector'],
      compileChildren: obj['compileChildren'],
      hostProperties: this.objectToMap(obj['hostProperties']),
      hostListeners: this.objectToMap(obj['hostListeners']),
      hostAttributes: this.objectToMap(obj['hostAttributes']),
      properties: obj['properties'],
      readAttributes: obj['readAttributes'],
      type: obj['type'],
      exportAs: obj['exportAs'],
      callOnDestroy: obj['callOnDestroy'],
      callOnChanges: obj['callOnChanges'],
      callDoCheck: obj['callDoCheck'],
      callOnInit: obj['callOnInit'],
      callAfterContentChecked: obj['callAfterContentChecked'],
      changeDetection: obj['changeDetection'],
      events: obj['events']
    });
  }
}
