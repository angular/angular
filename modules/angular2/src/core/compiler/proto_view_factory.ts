import {Injectable} from 'angular2/di';

import {List, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import {reflector} from 'angular2/src/reflection/reflection';

import {
  ChangeDetection,
  DirectiveIndex,
  BindingRecord,
  DirectiveRecord,
  ProtoChangeDetector,
  DEFAULT,
  ChangeDetectorDefinition
} from 'angular2/change_detection';

import * as renderApi from 'angular2/src/render/api';
import {AppProtoView} from './view';
import {ElementBinder} from './element_binder';
import {ProtoElementInjector, DirectiveBinding} from './element_injector';

class BindingRecordsCreator {
  _directiveRecordsMap: Map<number, DirectiveRecord> = MapWrapper.create();
  _textNodeIndex: number = 0;

  getBindingRecords(elementBinders: List<renderApi.ElementBinder>,
                    allDirectiveMetadatas: List<renderApi.DirectiveMetadata>): List<BindingRecord> {
    var bindings = [];

    for (var boundElementIndex = 0; boundElementIndex < elementBinders.length;
         boundElementIndex++) {
      var renderElementBinder = elementBinders[boundElementIndex];
      this._createTextNodeRecords(bindings, renderElementBinder);
      this._createElementPropertyRecords(bindings, boundElementIndex, renderElementBinder);
      this._createDirectiveRecords(bindings, boundElementIndex, renderElementBinder.directives,
                                   allDirectiveMetadatas);
    }

    return bindings;
  }

  getDirectiveRecords(
      elementBinders: List<renderApi.ElementBinder>,
      allDirectiveMetadatas: List<renderApi.DirectiveMetadata>): List<DirectiveRecord> {
    var directiveRecords = [];

    for (var elementIndex = 0; elementIndex < elementBinders.length; ++elementIndex) {
      var dirs = elementBinders[elementIndex].directives;
      for (var dirIndex = 0; dirIndex < dirs.length; ++dirIndex) {
        ListWrapper.push(
            directiveRecords,
            this._getDirectiveRecord(elementIndex, dirIndex,
                                     allDirectiveMetadatas[dirs[dirIndex].directiveIndex]));
      }
    }

    return directiveRecords;
  }

  _createTextNodeRecords(bindings: List<BindingRecord>,
                         renderElementBinder: renderApi.ElementBinder) {
    if (isBlank(renderElementBinder.textBindings)) return;

    ListWrapper.forEach(renderElementBinder.textBindings, (b) => {
      ListWrapper.push(bindings, BindingRecord.createForTextNode(b, this._textNodeIndex++));
    });
  }

  _createElementPropertyRecords(bindings: List<BindingRecord>, boundElementIndex: number,
                                renderElementBinder: renderApi.ElementBinder) {
    MapWrapper.forEach(renderElementBinder.propertyBindings, (astWithSource, propertyName) => {
      ListWrapper.push(
          bindings, BindingRecord.createForElement(astWithSource, boundElementIndex, propertyName));
    });
  }

  _createDirectiveRecords(bindings: List<BindingRecord>, boundElementIndex: number,
                          directiveBinders: List<renderApi.DirectiveBinder>,
                          allDirectiveMetadatas: List<renderApi.DirectiveMetadata>) {
    for (var i = 0; i < directiveBinders.length; i++) {
      var directiveBinder = directiveBinders[i];
      var directiveMetadata = allDirectiveMetadatas[directiveBinder.directiveIndex];
      var directiveRecord = this._getDirectiveRecord(boundElementIndex, i, directiveMetadata);

      // directive properties
      MapWrapper.forEach(directiveBinder.propertyBindings, (astWithSource, propertyName) => {
        // TODO: these setters should eventually be created by change detection, to make
        // it monomorphic!
        var setter = reflector.setter(propertyName);
        ListWrapper.push(bindings, BindingRecord.createForDirective(astWithSource, propertyName,
                                                                    setter, directiveRecord));
      });

      if (directiveRecord.callOnChange) {
        ListWrapper.push(bindings, BindingRecord.createDirectiveOnChange(directiveRecord));
      }
      if (directiveRecord.callOnInit) {
        ListWrapper.push(bindings, BindingRecord.createDirectiveOnInit(directiveRecord));
      }
      if (directiveRecord.callOnCheck) {
        ListWrapper.push(bindings, BindingRecord.createDirectiveOnCheck(directiveRecord));
      }
    }

    for (var i = 0; i < directiveBinders.length; i++) {
      var directiveBinder = directiveBinders[i];
      // host properties
      MapWrapper.forEach(directiveBinder.hostPropertyBindings, (astWithSource, propertyName) => {
        var dirIndex = new DirectiveIndex(boundElementIndex, i);
        ListWrapper.push(
            bindings, BindingRecord.createForHostProperty(dirIndex, astWithSource, propertyName));
      });
    }
  }

  _getDirectiveRecord(boundElementIndex: number, directiveIndex: number,
                      directiveMetadata: renderApi.DirectiveMetadata): DirectiveRecord {
    var id = boundElementIndex * 100 + directiveIndex;

    if (!MapWrapper.contains(this._directiveRecordsMap, id)) {
      MapWrapper.set(this._directiveRecordsMap, id, new DirectiveRecord({
                       directiveIndex: new DirectiveIndex(boundElementIndex, directiveIndex),
                       callOnAllChangesDone: directiveMetadata.callOnAllChangesDone,
                       callOnChange: directiveMetadata.callOnChange,
                       callOnCheck: directiveMetadata.callOnCheck,
                       callOnInit: directiveMetadata.callOnInit,
                       changeDetection: directiveMetadata.changeDetection
                     }));
    }

    return MapWrapper.get(this._directiveRecordsMap, id);
  }
}

@Injectable()
export class ProtoViewFactory {
  constructor(public _changeDetection: ChangeDetection) {}

  createAppProtoViews(hostComponentBinding: DirectiveBinding,
                      rootRenderProtoView: renderApi.ProtoViewDto,
                      allDirectives: List<DirectiveBinding>): List<AppProtoView> {
    var allRenderDirectiveMetadata =
        ListWrapper.map(allDirectives, directiveBinding => directiveBinding.metadata);
    var nestedPvsWithIndex = _collectNestedProtoViews(rootRenderProtoView);
    var nestedPvVariableBindings = _collectNestedProtoViewsVariableBindings(nestedPvsWithIndex);
    var nestedPvVariableNames =
        _collectNestedProtoViewsVariableNames(nestedPvsWithIndex, nestedPvVariableBindings);
    var changeDetectorDefs =
        _getChangeDetectorDefinitions(hostComponentBinding.metadata, nestedPvsWithIndex,
                                      nestedPvVariableNames, allRenderDirectiveMetadata);
    var protoChangeDetectors = ListWrapper.map(
        changeDetectorDefs,
        changeDetectorDef => this._changeDetection.createProtoChangeDetector(changeDetectorDef));
    var appProtoViews = ListWrapper.createFixedSize(nestedPvsWithIndex.length);
    ListWrapper.forEach(nestedPvsWithIndex, (pvWithIndex) => {
      var appProtoView =
          _createAppProtoView(pvWithIndex.renderProtoView, protoChangeDetectors[pvWithIndex.index],
                              nestedPvVariableBindings[pvWithIndex.index], allDirectives);
      if (isPresent(pvWithIndex.parentIndex)) {
        var parentView = appProtoViews[pvWithIndex.parentIndex];
        parentView.elementBinders[pvWithIndex.boundElementIndex].nestedProtoView = appProtoView;
      }
      appProtoViews[pvWithIndex.index] = appProtoView;
    });
    return appProtoViews;
  }
}

/**
 * Returns the data needed to create ChangeDetectors
 * for the given ProtoView and all nested ProtoViews.
 */
export function getChangeDetectorDefinitions(
    hostComponentMetadata: renderApi.DirectiveMetadata, rootRenderProtoView: renderApi.ProtoViewDto,
    allRenderDirectiveMetadata: List<renderApi.DirectiveMetadata>): List<ChangeDetectorDefinition> {
  var nestedPvsWithIndex = _collectNestedProtoViews(rootRenderProtoView);
  var nestedPvVariableBindings = _collectNestedProtoViewsVariableBindings(nestedPvsWithIndex);
  var nestedPvVariableNames =
      _collectNestedProtoViewsVariableNames(nestedPvsWithIndex, nestedPvVariableBindings);

  return _getChangeDetectorDefinitions(hostComponentMetadata, nestedPvsWithIndex,
                                       nestedPvVariableNames, allRenderDirectiveMetadata);
}

function _collectNestedProtoViews(
    renderProtoView: renderApi.ProtoViewDto, parentIndex: number = null, boundElementIndex = null,
    result: List<RenderProtoViewWithIndex> = null): List<RenderProtoViewWithIndex> {
  if (isBlank(result)) {
    result = [];
  }
  ListWrapper.push(result, new RenderProtoViewWithIndex(renderProtoView, result.length, parentIndex,
                                                        boundElementIndex));
  var currentIndex = result.length - 1;
  var childBoundElementIndex = 0;
  ListWrapper.forEach(renderProtoView.elementBinders, (elementBinder) => {
    if (isPresent(elementBinder.nestedProtoView)) {
      _collectNestedProtoViews(elementBinder.nestedProtoView, currentIndex, childBoundElementIndex,
                               result);
    }
    childBoundElementIndex++;
  });
  return result;
}

function _getChangeDetectorDefinitions(
    hostComponentMetadata: renderApi.DirectiveMetadata,
    nestedPvsWithIndex: List<RenderProtoViewWithIndex>, nestedPvVariableNames: List<List<string>>,
    allRenderDirectiveMetadata: List<renderApi.DirectiveMetadata>): List<ChangeDetectorDefinition> {
  return ListWrapper.map(nestedPvsWithIndex, (pvWithIndex) => {
    var elementBinders = pvWithIndex.renderProtoView.elementBinders;
    var bindingRecordsCreator = new BindingRecordsCreator();
    var bindingRecords =
        bindingRecordsCreator.getBindingRecords(elementBinders, allRenderDirectiveMetadata);
    var directiveRecords =
        bindingRecordsCreator.getDirectiveRecords(elementBinders, allRenderDirectiveMetadata);
    var strategyName = DEFAULT;
    var typeString;
    if (pvWithIndex.renderProtoView.type === renderApi.ViewType.COMPONENT) {
      strategyName = hostComponentMetadata.changeDetection;
      typeString = 'comp';
    } else if (pvWithIndex.renderProtoView.type === renderApi.ViewType.HOST) {
      typeString = 'host';
    } else {
      typeString = 'embedded';
    }
    var id = `${hostComponentMetadata.id}_${typeString}_${pvWithIndex.index}`;
    var variableNames = nestedPvVariableNames[pvWithIndex.index];
    return new ChangeDetectorDefinition(id, strategyName, variableNames, bindingRecords,
                                        directiveRecords);
  });
}

function _createAppProtoView(
    renderProtoView: renderApi.ProtoViewDto, protoChangeDetector: ProtoChangeDetector,
    variableBindings: Map<string, string>, allDirectives: List<DirectiveBinding>): AppProtoView {
  var elementBinders = renderProtoView.elementBinders;
  var protoView = new AppProtoView(renderProtoView.render, protoChangeDetector, variableBindings);

  // TODO: vsavkin refactor to pass element binders into proto view
  _createElementBinders(protoView, elementBinders, allDirectives);
  _bindDirectiveEvents(protoView, elementBinders);

  return protoView;
}

function _collectNestedProtoViewsVariableBindings(
    nestedPvsWithIndex: List<RenderProtoViewWithIndex>): List<Map<string, string>> {
  return ListWrapper.map(nestedPvsWithIndex, (pvWithIndex) => {
    return _createVariableBindings(pvWithIndex.renderProtoView);
  });
}

function _createVariableBindings(renderProtoView): Map<string, string> {
  var variableBindings = MapWrapper.create();
  MapWrapper.forEach(renderProtoView.variableBindings, (mappedName, varName) => {
    MapWrapper.set(variableBindings, varName, mappedName);
  });
  ListWrapper.forEach(renderProtoView.elementBinders, binder => {
    MapWrapper.forEach(binder.variableBindings, (mappedName, varName) => {
      MapWrapper.set(variableBindings, varName, mappedName);
    });
  });
  return variableBindings;
}

function _collectNestedProtoViewsVariableNames(
    nestedPvsWithIndex: List<RenderProtoViewWithIndex>,
    nestedPvVariableBindings: List<Map<string, string>>): List<List<string>> {
  var nestedPvVariableNames = ListWrapper.createFixedSize(nestedPvsWithIndex.length);
  ListWrapper.forEach(nestedPvsWithIndex, (pvWithIndex) => {
    var parentVariableNames =
        isPresent(pvWithIndex.parentIndex) ? nestedPvVariableNames[pvWithIndex.parentIndex] : null;
    nestedPvVariableNames[pvWithIndex.index] =
        _createVariableNames(parentVariableNames, nestedPvVariableBindings[pvWithIndex.index]);
  });
  return nestedPvVariableNames;
}

function _createVariableNames(parentVariableNames, variableBindings): List<string> {
  var variableNames = isPresent(parentVariableNames) ? ListWrapper.clone(parentVariableNames) : [];
  MapWrapper.forEach(variableBindings, (local, v) => { ListWrapper.push(variableNames, local); });
  return variableNames;
}

function _createElementBinders(protoView, elementBinders, allDirectiveBindings) {
  for (var i = 0; i < elementBinders.length; i++) {
    var renderElementBinder = elementBinders[i];
    var dirs = elementBinders[i].directives;

    var parentPeiWithDistance =
        _findParentProtoElementInjectorWithDistance(i, protoView.elementBinders, elementBinders);
    var directiveBindings =
        ListWrapper.map(dirs, (dir) => allDirectiveBindings[dir.directiveIndex]);
    var componentDirectiveBinding = null;
    if (directiveBindings.length > 0) {
      if (directiveBindings[0].metadata.type === renderApi.DirectiveMetadata.COMPONENT_TYPE) {
        componentDirectiveBinding = directiveBindings[0];
      }
    }
    var protoElementInjector =
        _createProtoElementInjector(i, parentPeiWithDistance, renderElementBinder,
                                    componentDirectiveBinding, directiveBindings);

    _createElementBinder(protoView, i, renderElementBinder, protoElementInjector,
                         componentDirectiveBinding, directiveBindings);
  }
}

function _findParentProtoElementInjectorWithDistance(
    binderIndex, elementBinders, renderElementBinders): ParentProtoElementInjectorWithDistance {
  var distance = 0;
  do {
    var renderElementBinder = renderElementBinders[binderIndex];
    binderIndex = renderElementBinder.parentIndex;
    if (binderIndex !== -1) {
      distance += renderElementBinder.distanceToParent;
      var elementBinder = elementBinders[binderIndex];
      if (isPresent(elementBinder.protoElementInjector)) {
        return new ParentProtoElementInjectorWithDistance(elementBinder.protoElementInjector,
                                                          distance);
      }
    }
  } while (binderIndex !== -1);
  return new ParentProtoElementInjectorWithDistance(null, -1);
}

function _createProtoElementInjector(binderIndex, parentPeiWithDistance, renderElementBinder,
                                     componentDirectiveBinding, directiveBindings) {
  var protoElementInjector = null;
  // Create a protoElementInjector for any element that either has bindings *or* has one
  // or more var- defined. Elements with a var- defined need a their own element injector
  // so that, when hydrating, $implicit can be set to the element.
  var hasVariables = MapWrapper.size(renderElementBinder.variableBindings) > 0;
  if (directiveBindings.length > 0 || hasVariables) {
    protoElementInjector = ProtoElementInjector.create(
        parentPeiWithDistance.protoElementInjector, binderIndex, directiveBindings,
        isPresent(componentDirectiveBinding), parentPeiWithDistance.distance);
    protoElementInjector.attributes = renderElementBinder.readAttributes;
  }
  return protoElementInjector;
}

function _createElementBinder(protoView, boundElementIndex, renderElementBinder,
                              protoElementInjector, componentDirectiveBinding,
                              directiveBindings): ElementBinder {
  var parent = null;
  if (renderElementBinder.parentIndex !== -1) {
    parent = protoView.elementBinders[renderElementBinder.parentIndex];
  }

  var directiveVariableBindings =
      createDirectiveVariableBindings(renderElementBinder, directiveBindings);
  var elBinder =
      protoView.bindElement(parent, renderElementBinder.distanceToParent, protoElementInjector,
                            directiveVariableBindings, componentDirectiveBinding);
  protoView.bindEvent(renderElementBinder.eventBindings, boundElementIndex, -1);
  // variables
  // The view's locals needs to have a full set of variable names at construction time
  // in order to prevent new variables from being set later in the lifecycle. Since we don't want
  // to actually create variable bindings for the $implicit bindings, add to the
  // protoLocals manually.
  MapWrapper.forEach(renderElementBinder.variableBindings, (mappedName, varName) => {
    MapWrapper.set(protoView.protoLocals, mappedName, null);
  });
  return elBinder;
}

export function createDirectiveVariableBindings(
    renderElementBinder: renderApi.ElementBinder,
    directiveBindings: List<DirectiveBinding>): Map<String, number> {
  var directiveVariableBindings = MapWrapper.create();
  MapWrapper.forEach(renderElementBinder.variableBindings, (templateName, exportAs) => {
    var dirIndex = _findDirectiveIndexByExportAs(renderElementBinder, directiveBindings, exportAs);
    MapWrapper.set(directiveVariableBindings, templateName, dirIndex);
  });
  return directiveVariableBindings;
}

function _findDirectiveIndexByExportAs(renderElementBinder, directiveBindings, exportAs) {
  var matchedDirectiveIndex = null;
  var matchedDirective;

  for (var i = 0; i < directiveBindings.length; ++i) {
    var directive = directiveBindings[i];

    if (_directiveExportAs(directive) == exportAs) {
      if (isPresent(matchedDirective)) {
        throw new BaseException(
            `More than one directive have exportAs = '${exportAs}'. Directives: [${matchedDirective.displayName}, ${directive.displayName}]`);
      }

      matchedDirectiveIndex = i;
      matchedDirective = directive;
    }
  }

  if (isBlank(matchedDirective) && exportAs !== "$implicit") {
    throw new BaseException(`Cannot find directive with exportAs = '${exportAs}'`);
  }

  return matchedDirectiveIndex;
}

function _directiveExportAs(directive): string {
  var directiveExportAs = directive.metadata.exportAs;
  if (isBlank(directiveExportAs) &&
      directive.metadata.type === renderApi.DirectiveMetadata.COMPONENT_TYPE) {
    return "$implicit";
  } else {
    return directiveExportAs;
  }
}

function _bindDirectiveEvents(protoView, elementBinders: List<renderApi.ElementBinder>) {
  for (var boundElementIndex = 0; boundElementIndex < elementBinders.length; ++boundElementIndex) {
    var dirs = elementBinders[boundElementIndex].directives;
    for (var i = 0; i < dirs.length; i++) {
      var directiveBinder = dirs[i];

      // directive events
      protoView.bindEvent(directiveBinder.eventBindings, boundElementIndex, i);
    }
  }
}


class RenderProtoViewWithIndex {
  constructor(public renderProtoView: renderApi.ProtoViewDto, public index: number,
              public parentIndex: number, public boundElementIndex: number) {}
}

class ParentProtoElementInjectorWithDistance {
  constructor(public protoElementInjector: ProtoElementInjector, public distance: number) {}
}
