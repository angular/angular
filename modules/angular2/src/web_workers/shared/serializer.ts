import {
  Type,
  isArray,
  isPresent,
  serializeEnum,
  deserializeEnum
} from "angular2/src/core/facade/lang";
import {BaseException, WrappedException} from 'angular2/src/core/facade/exceptions';

import {Map, StringMapWrapper, MapWrapper} from "angular2/src/core/facade/collection";
import {
  RenderProtoViewRef,
  RenderViewRef,
  RenderFragmentRef,
  RenderElementRef,
  RenderTemplateCmd,
  RenderCommandVisitor,
  RenderTextCmd,
  RenderNgContentCmd,
  RenderBeginElementCmd,
  RenderBeginComponentCmd,
  RenderEmbeddedTemplateCmd
} from "angular2/src/core/render/api";
import {
  WebWorkerElementRef,
  WebWorkerTemplateCmd,
  WebWorkerTextCmd,
  WebWorkerNgContentCmd,
  WebWorkerBeginElementCmd,
  WebWorkerEndElementCmd,
  WebWorkerBeginComponentCmd,
  WebWorkerEndComponentCmd,
  WebWorkerEmbeddedTemplateCmd
} from 'angular2/src/web_workers/shared/api';
import {Injectable} from "angular2/src/core/di";
import {RenderProtoViewRefStore} from 'angular2/src/web_workers/shared/render_proto_view_ref_store';
import {
  RenderViewWithFragmentsStore
} from 'angular2/src/web_workers/shared/render_view_with_fragments_store';

// PRIMITIVE is any type that does not need to be serialized (string, number, boolean)
// We set it to String so that it is considered a Type.
export const PRIMITIVE: Type = String;

@Injectable()
export class Serializer {
  constructor(private _protoViewStore: RenderProtoViewRefStore,
              private _renderViewStore: RenderViewWithFragmentsStore) {}

  serialize(obj: any, type: Type): Object {
    if (!isPresent(obj)) {
      return null;
    }
    if (isArray(obj)) {
      return (<any[]>obj).map(v => this.serialize(v, type));
    }
    if (type == PRIMITIVE) {
      return obj;
    }
    if (type == RenderProtoViewRef) {
      return this._protoViewStore.serialize(obj);
    } else if (type == RenderViewRef) {
      return this._renderViewStore.serializeRenderViewRef(obj);
    } else if (type == RenderFragmentRef) {
      return this._renderViewStore.serializeRenderFragmentRef(obj);
    } else if (type == WebWorkerElementRef) {
      return this._serializeWorkerElementRef(obj);
    } else if (type == WebWorkerTemplateCmd) {
      return serializeTemplateCmd(obj);
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
      (<any[]>map).forEach(val => obj.push(this.deserialize(val, type, data)));
      return obj;
    }
    if (type == PRIMITIVE) {
      return map;
    }

    if (type == RenderProtoViewRef) {
      return this._protoViewStore.deserialize(map);
    } else if (type == RenderViewRef) {
      return this._renderViewStore.deserializeRenderViewRef(map);
    } else if (type == RenderFragmentRef) {
      return this._renderViewStore.deserializeRenderFragmentRef(map);
    } else if (type == WebWorkerElementRef) {
      return this._deserializeWorkerElementRef(map);
    } else if (type == WebWorkerTemplateCmd) {
      return deserializeTemplateCmd(map);
    } else {
      throw new BaseException("No deserializer for " + type.toString());
    }
  }

  mapToObject(map: Map<string, any>, type?: Type): Object {
    var object = {};
    var serialize = isPresent(type);

    map.forEach((value, key) => {
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
  objectToMap(obj: {[key: string]: any}, type?: Type, data?: any): Map<string, any> {
    if (isPresent(type)) {
      var map = new Map<string, any>();
      StringMapWrapper.forEach(obj,
                               (val, key) => { map.set(key, this.deserialize(val, type, data)); });
      return map;
    } else {
      return MapWrapper.createFromStringMap(obj);
    }
  }

  allocateRenderViews(fragmentCount: number) { this._renderViewStore.allocate(fragmentCount); }

  private _serializeWorkerElementRef(elementRef: RenderElementRef): {[key: string]: any} {
    return {
      'renderView': this.serialize(elementRef.renderView, RenderViewRef),
      'boundElementIndex': elementRef.boundElementIndex
    };
  }

  private _deserializeWorkerElementRef(map: {[key: string]: any}): RenderElementRef {
    return new WebWorkerElementRef(this.deserialize(map['renderView'], RenderViewRef),
                                   map['boundElementIndex']);
  }
}

function serializeTemplateCmd(cmd: RenderTemplateCmd): Object {
  return cmd.visit(RENDER_TEMPLATE_CMD_SERIALIZER, null);
}

function deserializeTemplateCmd(data: {[key: string]: any}): RenderTemplateCmd {
  return RENDER_TEMPLATE_CMD_DESERIALIZERS[data['deserializerIndex']](data);
}

class RenderTemplateCmdSerializer implements RenderCommandVisitor {
  visitText(cmd: RenderTextCmd, context: any): any {
    return {
      'deserializerIndex': 0,
      'isBound': cmd.isBound,
      'ngContentIndex': cmd.ngContentIndex,
      'value': cmd.value
    };
  }
  visitNgContent(cmd: RenderNgContentCmd, context: any): any {
    return {'deserializerIndex': 1, 'index': cmd.index, 'ngContentIndex': cmd.ngContentIndex};
  }
  visitBeginElement(cmd: RenderBeginElementCmd, context: any): any {
    return {
      'deserializerIndex': 2,
      'isBound': cmd.isBound,
      'ngContentIndex': cmd.ngContentIndex,
      'name': cmd.name,
      'attrNameAndValues': cmd.attrNameAndValues,
      'eventTargetAndNames': cmd.eventTargetAndNames
    };
  }
  visitEndElement(context: any): any { return {'deserializerIndex': 3}; }
  visitBeginComponent(cmd: RenderBeginComponentCmd, context: any): any {
    return {
      'deserializerIndex': 4,
      'isBound': cmd.isBound,
      'ngContentIndex': cmd.ngContentIndex,
      'name': cmd.name,
      'attrNameAndValues': cmd.attrNameAndValues,
      'eventTargetAndNames': cmd.eventTargetAndNames,
      'nativeShadow': cmd.nativeShadow,
      'templateId': cmd.templateId
    };
  }
  visitEndComponent(context: any): any { return {'deserializerIndex': 5}; }
  visitEmbeddedTemplate(cmd: RenderEmbeddedTemplateCmd, context: any): any {
    var children = cmd.children.map(child => child.visit(this, null));
    return {
      'deserializerIndex': 6,
      'isBound': cmd.isBound,
      'ngContentIndex': cmd.ngContentIndex,
      'name': cmd.name,
      'attrNameAndValues': cmd.attrNameAndValues,
      'eventTargetAndNames': cmd.eventTargetAndNames,
      'isMerged': cmd.isMerged,
      'children': children
    };
  }
}

var RENDER_TEMPLATE_CMD_SERIALIZER = new RenderTemplateCmdSerializer();

var RENDER_TEMPLATE_CMD_DESERIALIZERS = [
  (data: {[key: string]: any}) =>
      new WebWorkerTextCmd(data['isBound'], data['ngContentIndex'], data['value']),
  (data: {[key: string]: any}) => new WebWorkerNgContentCmd(data['index'], data['ngContentIndex']),
  (data: {[key: string]: any}) =>
      new WebWorkerBeginElementCmd(data['isBound'], data['ngContentIndex'], data['name'],
                                   data['attrNameAndValues'], data['eventTargetAndNames']),
  (data: {[key: string]: any}) => new WebWorkerEndElementCmd(),
  (data: {[key: string]: any}) => new WebWorkerBeginComponentCmd(
      data['isBound'], data['ngContentIndex'], data['name'], data['attrNameAndValues'],
      data['eventTargetAndNames'], data['nativeShadow'], data['templateId']),
  (data: {[key: string]: any}) => new WebWorkerEndComponentCmd(),
  (data: {[key: string]: any}) => new WebWorkerEmbeddedTemplateCmd(
      data['isBound'], data['ngContentIndex'], data['name'], data['attrNameAndValues'],
      data['eventTargetAndNames'], data['isMerged'],
      (<any[]>data['children']).map(childData => deserializeTemplateCmd(childData))),
];
