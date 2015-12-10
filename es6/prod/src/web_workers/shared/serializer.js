var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isArray, isPresent, serializeEnum } from "angular2/src/facade/lang";
import { BaseException } from 'angular2/src/facade/exceptions';
import { Map, StringMapWrapper, MapWrapper } from "angular2/src/facade/collection";
import { RenderProtoViewRef, RenderViewRef, RenderFragmentRef, RenderComponentTemplate } from "angular2/src/core/render/api";
import { WebWorkerElementRef, WebWorkerTemplateCmd, WebWorkerTextCmd, WebWorkerNgContentCmd, WebWorkerBeginElementCmd, WebWorkerEndElementCmd, WebWorkerBeginComponentCmd, WebWorkerEndComponentCmd, WebWorkerEmbeddedTemplateCmd } from 'angular2/src/web_workers/shared/api';
import { Injectable } from "angular2/src/core/di";
import { RenderProtoViewRefStore } from 'angular2/src/web_workers/shared/render_proto_view_ref_store';
import { RenderViewWithFragmentsStore } from 'angular2/src/web_workers/shared/render_view_with_fragments_store';
import { ViewEncapsulation, VIEW_ENCAPSULATION_VALUES } from 'angular2/src/core/metadata/view';
// PRIMITIVE is any type that does not need to be serialized (string, number, boolean)
// We set it to String so that it is considered a Type.
export const PRIMITIVE = String;
export let Serializer = class {
    constructor(_protoViewStore, _renderViewStore) {
        this._protoViewStore = _protoViewStore;
        this._renderViewStore = _renderViewStore;
    }
    serialize(obj, type) {
        if (!isPresent(obj)) {
            return null;
        }
        if (isArray(obj)) {
            return obj.map(v => this.serialize(v, type));
        }
        if (type == PRIMITIVE) {
            return obj;
        }
        if (type == RenderProtoViewRef) {
            return this._protoViewStore.serialize(obj);
        }
        else if (type == RenderViewRef) {
            return this._renderViewStore.serializeRenderViewRef(obj);
        }
        else if (type == RenderFragmentRef) {
            return this._renderViewStore.serializeRenderFragmentRef(obj);
        }
        else if (type == WebWorkerElementRef) {
            return this._serializeWorkerElementRef(obj);
        }
        else if (type == WebWorkerTemplateCmd) {
            return serializeTemplateCmd(obj);
        }
        else if (type === RenderComponentTemplate) {
            return this._serializeRenderTemplate(obj);
        }
        else if (type === ViewEncapsulation) {
            return serializeEnum(obj);
        }
        else {
            throw new BaseException("No serializer for " + type.toString());
        }
    }
    deserialize(map, type, data) {
        if (!isPresent(map)) {
            return null;
        }
        if (isArray(map)) {
            var obj = [];
            map.forEach(val => obj.push(this.deserialize(val, type, data)));
            return obj;
        }
        if (type == PRIMITIVE) {
            return map;
        }
        if (type == RenderProtoViewRef) {
            return this._protoViewStore.deserialize(map);
        }
        else if (type == RenderViewRef) {
            return this._renderViewStore.deserializeRenderViewRef(map);
        }
        else if (type == RenderFragmentRef) {
            return this._renderViewStore.deserializeRenderFragmentRef(map);
        }
        else if (type == WebWorkerElementRef) {
            return this._deserializeWorkerElementRef(map);
        }
        else if (type == WebWorkerTemplateCmd) {
            return deserializeTemplateCmd(map);
        }
        else if (type === RenderComponentTemplate) {
            return this._deserializeRenderTemplate(map);
        }
        else if (type === ViewEncapsulation) {
            return VIEW_ENCAPSULATION_VALUES[map];
        }
        else {
            throw new BaseException("No deserializer for " + type.toString());
        }
    }
    mapToObject(map, type) {
        var object = {};
        var serialize = isPresent(type);
        map.forEach((value, key) => {
            if (serialize) {
                object[key] = this.serialize(value, type);
            }
            else {
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
    objectToMap(obj, type, data) {
        if (isPresent(type)) {
            var map = new Map();
            StringMapWrapper.forEach(obj, (val, key) => { map.set(key, this.deserialize(val, type, data)); });
            return map;
        }
        else {
            return MapWrapper.createFromStringMap(obj);
        }
    }
    allocateRenderViews(fragmentCount) { this._renderViewStore.allocate(fragmentCount); }
    _serializeWorkerElementRef(elementRef) {
        return {
            'renderView': this.serialize(elementRef.renderView, RenderViewRef),
            'boundElementIndex': elementRef.boundElementIndex
        };
    }
    _deserializeWorkerElementRef(map) {
        return new WebWorkerElementRef(this.deserialize(map['renderView'], RenderViewRef), map['boundElementIndex']);
    }
    _serializeRenderTemplate(obj) {
        return {
            'id': obj.id,
            'shortId': obj.shortId,
            'encapsulation': this.serialize(obj.encapsulation, ViewEncapsulation),
            'commands': this.serialize(obj.commands, WebWorkerTemplateCmd),
            'styles': this.serialize(obj.styles, PRIMITIVE)
        };
    }
    _deserializeRenderTemplate(map) {
        return new RenderComponentTemplate(map['id'], map['shortId'], this.deserialize(map['encapsulation'], ViewEncapsulation), this.deserialize(map['commands'], WebWorkerTemplateCmd), this.deserialize(map['styles'], PRIMITIVE));
    }
};
Serializer = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [RenderProtoViewRefStore, RenderViewWithFragmentsStore])
], Serializer);
function serializeTemplateCmd(cmd) {
    return cmd.visit(RENDER_TEMPLATE_CMD_SERIALIZER, null);
}
function deserializeTemplateCmd(data) {
    return RENDER_TEMPLATE_CMD_DESERIALIZERS[data['deserializerIndex']](data);
}
class RenderTemplateCmdSerializer {
    visitText(cmd, context) {
        return {
            'deserializerIndex': 0,
            'isBound': cmd.isBound,
            'ngContentIndex': cmd.ngContentIndex,
            'value': cmd.value
        };
    }
    visitNgContent(cmd, context) {
        return { 'deserializerIndex': 1, 'index': cmd.index, 'ngContentIndex': cmd.ngContentIndex };
    }
    visitBeginElement(cmd, context) {
        return {
            'deserializerIndex': 2,
            'isBound': cmd.isBound,
            'ngContentIndex': cmd.ngContentIndex,
            'name': cmd.name,
            'attrNameAndValues': cmd.attrNameAndValues,
            'eventTargetAndNames': cmd.eventTargetAndNames
        };
    }
    visitEndElement(context) { return { 'deserializerIndex': 3 }; }
    visitBeginComponent(cmd, context) {
        return {
            'deserializerIndex': 4,
            'isBound': cmd.isBound,
            'ngContentIndex': cmd.ngContentIndex,
            'name': cmd.name,
            'attrNameAndValues': cmd.attrNameAndValues,
            'eventTargetAndNames': cmd.eventTargetAndNames,
            'templateId': cmd.templateId
        };
    }
    visitEndComponent(context) { return { 'deserializerIndex': 5 }; }
    visitEmbeddedTemplate(cmd, context) {
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
        (data) => new WebWorkerTextCmd(data['isBound'], data['ngContentIndex'], data['value']),
        (data) => new WebWorkerNgContentCmd(data['index'], data['ngContentIndex']),
        (data) => new WebWorkerBeginElementCmd(data['isBound'], data['ngContentIndex'], data['name'], data['attrNameAndValues'], data['eventTargetAndNames']),
        (data) => new WebWorkerEndElementCmd(),
        (data) => new WebWorkerBeginComponentCmd(data['isBound'], data['ngContentIndex'], data['name'], data['attrNameAndValues'], data['eventTargetAndNames'], data['templateId']),
        (data) => new WebWorkerEndComponentCmd(),
        (data) => new WebWorkerEmbeddedTemplateCmd(data['isBound'], data['ngContentIndex'], data['name'], data['attrNameAndValues'], data['eventTargetAndNames'], data['isMerged'], data['children'].map(childData => deserializeTemplateCmd(childData))),
];
