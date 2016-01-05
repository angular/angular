library angular2.src.web_workers.shared.serializer;

import "package:angular2/src/facade/lang.dart"
    show Type, isArray, isPresent, serializeEnum, deserializeEnum;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "package:angular2/src/facade/collection.dart"
    show Map, StringMapWrapper, MapWrapper;
import "package:angular2/src/core/render/api.dart" show RenderComponentType;
import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/web_workers/shared/render_store.dart"
    show RenderStore;
import "package:angular2/src/core/metadata/view.dart"
    show ViewEncapsulation, VIEW_ENCAPSULATION_VALUES;
// PRIMITIVE is any type that does not need to be serialized (string, number, boolean)

// We set it to String so that it is considered a Type.
const Type PRIMITIVE = String;

@Injectable()
class Serializer {
  RenderStore _renderStore;
  Serializer(this._renderStore) {}
  Object serialize(dynamic obj, dynamic type) {
    if (!isPresent(obj)) {
      return null;
    }
    if (isArray(obj)) {
      return ((obj as List<dynamic>))
          .map((v) => this.serialize(v, type))
          .toList();
    }
    if (type == PRIMITIVE) {
      return obj;
    }
    if (type == RenderStoreObject) {
      return this._renderStore.serialize(obj);
    } else if (identical(type, RenderComponentType)) {
      return this._serializeRenderComponentType(obj);
    } else if (identical(type, ViewEncapsulation)) {
      return serializeEnum(obj);
    } else {
      throw new BaseException("No serializer for " + type.toString());
    }
  }

  dynamic deserialize(dynamic map, dynamic type, [dynamic data]) {
    if (!isPresent(map)) {
      return null;
    }
    if (isArray(map)) {
      List<dynamic> obj = [];
      ((map as List<dynamic>))
          .forEach((val) => obj.add(this.deserialize(val, type, data)));
      return obj;
    }
    if (type == PRIMITIVE) {
      return map;
    }
    if (type == RenderStoreObject) {
      return this._renderStore.deserialize(map);
    } else if (identical(type, RenderComponentType)) {
      return this._deserializeRenderComponentType(map);
    } else if (identical(type, ViewEncapsulation)) {
      return VIEW_ENCAPSULATION_VALUES[map];
    } else {
      throw new BaseException("No deserializer for " + type.toString());
    }
  }

  Object mapToObject(Map<String, dynamic> map, [Type type]) {
    var object = {};
    var serialize = isPresent(type);
    map.forEach((key, value) {
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
  Map<String, dynamic> objectToMap(Map<String, dynamic> obj,
      [Type type, dynamic data]) {
    if (isPresent(type)) {
      var map = new Map<String, dynamic>();
      StringMapWrapper.forEach(obj, (val, key) {
        map[key] = this.deserialize(val, type, data);
      });
      return map;
    } else {
      return MapWrapper.createFromStringMap(obj);
    }
  }

  Object _serializeRenderComponentType(RenderComponentType obj) {
    return {
      "id": obj.id,
      "encapsulation": this.serialize(obj.encapsulation, ViewEncapsulation),
      "styles": this.serialize(obj.styles, PRIMITIVE)
    };
  }

  RenderComponentType _deserializeRenderComponentType(
      Map<String, dynamic> map) {
    return new RenderComponentType(
        map["id"],
        this.deserialize(map["encapsulation"], ViewEncapsulation),
        this.deserialize(map["styles"], PRIMITIVE));
  }
}

class RenderStoreObject {}
