library angular2.src.web_workers.shared.serializer;

import "package:angular2/src/facade/lang.dart"
    show Type, isArray, isPresent, serializeEnum, deserializeEnum;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "package:angular2/src/facade/collection.dart"
    show Map, StringMapWrapper, MapWrapper;
import "package:angular2/src/core/render/api.dart"
    show
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
        RenderEmbeddedTemplateCmd,
        RenderComponentTemplate;
import "package:angular2/src/web_workers/shared/api.dart"
    show
        WebWorkerElementRef,
        WebWorkerTemplateCmd,
        WebWorkerTextCmd,
        WebWorkerNgContentCmd,
        WebWorkerBeginElementCmd,
        WebWorkerEndElementCmd,
        WebWorkerBeginComponentCmd,
        WebWorkerEndComponentCmd,
        WebWorkerEmbeddedTemplateCmd;
import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/web_workers/shared/render_proto_view_ref_store.dart"
    show RenderProtoViewRefStore;
import "package:angular2/src/web_workers/shared/render_view_with_fragments_store.dart"
    show RenderViewWithFragmentsStore;
import "package:angular2/src/core/metadata/view.dart"
    show ViewEncapsulation, VIEW_ENCAPSULATION_VALUES;
// PRIMITIVE is any type that does not need to be serialized (string, number, boolean)

// We set it to String so that it is considered a Type.
const Type PRIMITIVE = String;

@Injectable()
class Serializer {
  RenderProtoViewRefStore _protoViewStore;
  RenderViewWithFragmentsStore _renderViewStore;
  Serializer(this._protoViewStore, this._renderViewStore) {}
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
    } else if (identical(type, RenderComponentTemplate)) {
      return this._serializeRenderTemplate(obj);
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
    } else if (identical(type, RenderComponentTemplate)) {
      return this._deserializeRenderTemplate(map);
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

  allocateRenderViews(num fragmentCount) {
    this._renderViewStore.allocate(fragmentCount);
  }

  Map<String, dynamic> _serializeWorkerElementRef(RenderElementRef elementRef) {
    return {
      "renderView": this.serialize(elementRef.renderView, RenderViewRef),
      "boundElementIndex": elementRef.boundElementIndex
    };
  }

  RenderElementRef _deserializeWorkerElementRef(Map<String, dynamic> map) {
    return new WebWorkerElementRef(
        this.deserialize(map["renderView"], RenderViewRef),
        map["boundElementIndex"]);
  }

  Object _serializeRenderTemplate(RenderComponentTemplate obj) {
    return {
      "id": obj.id,
      "shortId": obj.shortId,
      "encapsulation": this.serialize(obj.encapsulation, ViewEncapsulation),
      "commands": this.serialize(obj.commands, WebWorkerTemplateCmd),
      "styles": this.serialize(obj.styles, PRIMITIVE)
    };
  }

  RenderComponentTemplate _deserializeRenderTemplate(Map<String, dynamic> map) {
    return new RenderComponentTemplate(
        map["id"],
        map["shortId"],
        this.deserialize(map["encapsulation"], ViewEncapsulation),
        this.deserialize(map["commands"], WebWorkerTemplateCmd),
        this.deserialize(map["styles"], PRIMITIVE));
  }
}

Object serializeTemplateCmd(RenderTemplateCmd cmd) {
  return cmd.visit(RENDER_TEMPLATE_CMD_SERIALIZER, null);
}

RenderTemplateCmd deserializeTemplateCmd(Map<String, dynamic> data) {
  return RENDER_TEMPLATE_CMD_DESERIALIZERS[data["deserializerIndex"]](data);
}

class RenderTemplateCmdSerializer implements RenderCommandVisitor {
  dynamic visitText(RenderTextCmd cmd, dynamic context) {
    return {
      "deserializerIndex": 0,
      "isBound": cmd.isBound,
      "ngContentIndex": cmd.ngContentIndex,
      "value": cmd.value
    };
  }

  dynamic visitNgContent(RenderNgContentCmd cmd, dynamic context) {
    return {
      "deserializerIndex": 1,
      "index": cmd.index,
      "ngContentIndex": cmd.ngContentIndex
    };
  }

  dynamic visitBeginElement(RenderBeginElementCmd cmd, dynamic context) {
    return {
      "deserializerIndex": 2,
      "isBound": cmd.isBound,
      "ngContentIndex": cmd.ngContentIndex,
      "name": cmd.name,
      "attrNameAndValues": cmd.attrNameAndValues,
      "eventTargetAndNames": cmd.eventTargetAndNames
    };
  }

  dynamic visitEndElement(dynamic context) {
    return {"deserializerIndex": 3};
  }

  dynamic visitBeginComponent(RenderBeginComponentCmd cmd, dynamic context) {
    return {
      "deserializerIndex": 4,
      "isBound": cmd.isBound,
      "ngContentIndex": cmd.ngContentIndex,
      "name": cmd.name,
      "attrNameAndValues": cmd.attrNameAndValues,
      "eventTargetAndNames": cmd.eventTargetAndNames,
      "templateId": cmd.templateId
    };
  }

  dynamic visitEndComponent(dynamic context) {
    return {"deserializerIndex": 5};
  }

  dynamic visitEmbeddedTemplate(
      RenderEmbeddedTemplateCmd cmd, dynamic context) {
    var children =
        cmd.children.map((child) => child.visit(this, null)).toList();
    return {
      "deserializerIndex": 6,
      "isBound": cmd.isBound,
      "ngContentIndex": cmd.ngContentIndex,
      "name": cmd.name,
      "attrNameAndValues": cmd.attrNameAndValues,
      "eventTargetAndNames": cmd.eventTargetAndNames,
      "isMerged": cmd.isMerged,
      "children": children
    };
  }
}

var RENDER_TEMPLATE_CMD_SERIALIZER = new RenderTemplateCmdSerializer();
var RENDER_TEMPLATE_CMD_DESERIALIZERS = [
  (Map<String, dynamic> data) => new WebWorkerTextCmd(
      data["isBound"], data["ngContentIndex"], data["value"]),
  (Map<String, dynamic> data) =>
      new WebWorkerNgContentCmd(data["index"], data["ngContentIndex"]),
  (Map<String, dynamic> data) => new WebWorkerBeginElementCmd(
      data["isBound"],
      data["ngContentIndex"],
      data["name"],
      data["attrNameAndValues"],
      data["eventTargetAndNames"]),
  (Map<String, dynamic> data) => new WebWorkerEndElementCmd(),
  (Map<String, dynamic> data) => new WebWorkerBeginComponentCmd(
      data["isBound"],
      data["ngContentIndex"],
      data["name"],
      data["attrNameAndValues"],
      data["eventTargetAndNames"],
      data["templateId"]),
  (Map<String, dynamic> data) => new WebWorkerEndComponentCmd(),
  (Map<String, dynamic> data) => new WebWorkerEmbeddedTemplateCmd(
      data["isBound"],
      data["ngContentIndex"],
      data["name"],
      data["attrNameAndValues"],
      data["eventTargetAndNames"],
      data["isMerged"],
      ((data["children"] as List<dynamic>))
          .map((childData) => deserializeTemplateCmd(childData))
          .toList())
];
