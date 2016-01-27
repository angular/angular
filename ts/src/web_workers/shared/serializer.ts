import {Type, isArray, isPresent, serializeEnum, deserializeEnum} from "angular2/src/facade/lang";
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';

import {Map, StringMapWrapper, MapWrapper} from "angular2/src/facade/collection";
import {RenderComponentType} from "angular2/src/core/render/api";
import {Injectable} from "angular2/src/core/di";
import {RenderStore} from 'angular2/src/web_workers/shared/render_store';
import {ViewEncapsulation, VIEW_ENCAPSULATION_VALUES} from 'angular2/src/core/metadata/view';

// PRIMITIVE is any type that does not need to be serialized (string, number, boolean)
// We set it to String so that it is considered a Type.
export const PRIMITIVE: Type = String;

@Injectable()
export class Serializer {
  constructor(private _renderStore: RenderStore) {}

  serialize(obj: any, type: any): Object {
    if (!isPresent(obj)) {
      return null;
    }
    if (isArray(obj)) {
      return (<any[]>obj).map(v => this.serialize(v, type));
    }
    if (type == PRIMITIVE) {
      return obj;
    }
    if (type == RenderStoreObject) {
      return this._renderStore.serialize(obj);
    } else if (type === RenderComponentType) {
      return this._serializeRenderComponentType(obj);
    } else if (type === ViewEncapsulation) {
      return serializeEnum(obj);
    } else {
      throw new BaseException("No serializer for " + type.toString());
    }
  }

  deserialize(map: any, type: any, data?: any): any {
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

    if (type == RenderStoreObject) {
      return this._renderStore.deserialize(map);
    } else if (type === RenderComponentType) {
      return this._deserializeRenderComponentType(map);
    } else if (type === ViewEncapsulation) {
      return VIEW_ENCAPSULATION_VALUES[map];
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

  private _serializeRenderComponentType(obj: RenderComponentType): Object {
    return {
      'id': obj.id,
      'encapsulation': this.serialize(obj.encapsulation, ViewEncapsulation),
      'styles': this.serialize(obj.styles, PRIMITIVE)
    };
  }

  private _deserializeRenderComponentType(map: {[key: string]: any}): RenderComponentType {
    return new RenderComponentType(map['id'],
                                   this.deserialize(map['encapsulation'], ViewEncapsulation),
                                   this.deserialize(map['styles'], PRIMITIVE));
  }
}


export class RenderStoreObject {}