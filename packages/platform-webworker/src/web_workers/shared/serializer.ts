/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, RenderComponentType, RendererType2, Type, ɵstringify as stringify} from '@angular/core';
import {RenderStore} from './render_store';


/**
 * @experimental WebWorker support in Angular is currently experimental.
 */
export const enum SerializerTypes {
  // RendererType2
  RENDERER_TYPE_2,
  // Primitive types
  PRIMITIVE,
  // An object stored in a RenderStore
  RENDER_STORE_OBJECT,
}

/**
 * Any type that does not need to be serialized (string, number, boolean)
 *
 * @experimental WebWorker support in Angular is currently experimental.
 * @deprecated in v4. Use SerializerTypes.PRIMITIVE instead
 */
export const PRIMITIVE = SerializerTypes.PRIMITIVE;

export class LocationType {
  constructor(
      public href: string, public protocol: string, public host: string, public hostname: string,
      public port: string, public pathname: string|null, public search: string, public hash: string,
      public origin: string) {}
}

@Injectable()
export class Serializer {
  constructor(private _renderStore: RenderStore) {}

  serialize(obj: any, type: Type<any>|SerializerTypes = SerializerTypes.PRIMITIVE): Object {
    if (obj == null || type === SerializerTypes.PRIMITIVE) {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(v => this.serialize(v, type));
    }
    if (type === SerializerTypes.RENDER_STORE_OBJECT) {
      return this._renderStore.serialize(obj) !;
    }
    if (type === RenderComponentType) {
      return this._serializeRenderComponentType(obj);
    }
    if (type === SerializerTypes.RENDERER_TYPE_2) {
      return this._serializeRendererType2(obj);
    }
    if (type === LocationType) {
      return this._serializeLocation(obj);
    }
    throw new Error(`No serializer for type ${stringify(type)}`);
  }

  deserialize(map: any, type: Type<any>|SerializerTypes = SerializerTypes.PRIMITIVE, data?: any):
      any {
    if (map == null || type === SerializerTypes.PRIMITIVE) {
      return map;
    }
    if (Array.isArray(map)) {
      return map.map(val => this.deserialize(val, type, data));
    }
    if (type === SerializerTypes.RENDER_STORE_OBJECT) {
      return this._renderStore.deserialize(map);
    }
    if (type === RenderComponentType) {
      return this._deserializeRenderComponentType(map);
    }
    if (type === SerializerTypes.RENDERER_TYPE_2) {
      return this._deserializeRendererType2(map);
    }
    if (type === LocationType) {
      return this._deserializeLocation(map);
    }
    throw new Error(`No deserializer for type ${stringify(type)}`);
  }

  private _serializeLocation(loc: LocationType): Object {
    return {
      'href': loc.href,
      'protocol': loc.protocol,
      'host': loc.host,
      'hostname': loc.hostname,
      'port': loc.port,
      'pathname': loc.pathname,
      'search': loc.search,
      'hash': loc.hash,
      'origin': loc.origin,
    };
  }

  private _deserializeLocation(loc: {[key: string]: any}): LocationType {
    return new LocationType(
        loc['href'], loc['protocol'], loc['host'], loc['hostname'], loc['port'], loc['pathname'],
        loc['search'], loc['hash'], loc['origin']);
  }

  private _serializeRenderComponentType(type: RenderComponentType): Object {
    return {
      'id': type.id,
      'templateUrl': type.templateUrl,
      'slotCount': type.slotCount,
      'encapsulation': this.serialize(type.encapsulation),
      'styles': this.serialize(type.styles),
    };
  }

  private _deserializeRenderComponentType(props: {[key: string]: any}): RenderComponentType {
    return new RenderComponentType(
        props['id'], props['templateUrl'], props['slotCount'],
        this.deserialize(props['encapsulation']), this.deserialize(props['styles']), {});
  }

  private _serializeRendererType2(type: RendererType2): {[key: string]: any} {
    return {
      'id': type.id,
      'encapsulation': this.serialize(type.encapsulation),
      'styles': this.serialize(type.styles),
      'data': this.serialize(type.data),
    };
  }

  private _deserializeRendererType2(props: {[key: string]: any}): RendererType2 {
    return {
      id: props['id'],
      encapsulation: props['encapsulation'],
      styles: this.deserialize(props['styles']),
      data: this.deserialize(props['data'])
    };
  }
}
