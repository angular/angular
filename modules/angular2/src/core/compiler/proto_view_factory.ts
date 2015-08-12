import {Injectable} from 'angular2/di';

import {List, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {isPresent, isBlank, BaseException, assertionsEnabled} from 'angular2/src/facade/lang';
import {reflector} from 'angular2/src/reflection/reflection';

import {
  ChangeDetection,
  DirectiveIndex,
  BindingRecord,
  DirectiveRecord,
  ProtoChangeDetector,
  DEFAULT,
  ChangeDetectorDefinition,
  ASTWithSource
} from 'angular2/src/change_detection/change_detection';

import {PipeBinding} from 'angular2/src/core/pipes/pipe_binding';
import {ProtoPipes} from 'angular2/src/core/pipes/pipes';

import * as renderApi from 'angular2/src/render/api';
import {AppProtoView} from './view';
import {ElementBinder} from './element_binder';
import {ProtoElementInjector, DirectiveBinding} from './element_injector';

export class BindingRecordsCreator {
  _directiveRecordsMap: Map<number, DirectiveRecord> = new Map();

  getEventBindingRecords(elementBinders: List<renderApi.ElementBinder>,
                         allDirectiveMetadatas: renderApi.DirectiveMetadata[]): BindingRecord[] {
    var res = [];
    for (var boundElementIndex = 0; boundElementIndex < elementBinders.length;
         boundElementIndex++) {
      var renderElementBinder = elementBinders[boundElementIndex];

      this._createTemplateEventRecords(res, renderElementBinder, boundElementIndex);
      this._createHostEventRecords(res, renderElementBinder, allDirectiveMetadatas,
                                   boundElementIndex);
    }
    return res;
  }

  private _createTemplateEventRecords(res: BindingRecord[],
                                      renderElementBinder: renderApi.ElementBinder,
                                      boundElementIndex: number): void {
    renderElementBinder.eventBindings.forEach(eb => {
      res.push(BindingRecord.createForEvent(eb.source, eb.fullName, boundElementIndex));
    });
  }

  private _createHostEventRecords(res: BindingRecord[],
                                  renderElementBinder: renderApi.ElementBinder,
                                  allDirectiveMetadatas: renderApi.DirectiveMetadata[],
                                  boundElementIndex: number): void {
    for (var i = 0; i < renderElementBinder.directives.length; ++i) {
      var dir = renderElementBinder.directives[i];
      var directiveMetadata = allDirectiveMetadatas[dir.directiveIndex];
      var dirRecord = this._getDirectiveRecord(boundElementIndex, i, directiveMetadata);
      dir.eventBindings.forEach(heb => {
        res.push(
            BindingRecord.createForHostEvent(heb.source, heb.fullName, dirRecord.directiveIndex));
      });
    }
  }

  getPropertyBindingRecords(textBindings: List<ASTWithSource>,
                            elementBinders: List<renderApi.ElementBinder>,
                            allDirectiveMetadatas:
                                List<renderApi.DirectiveMetadata>): List<BindingRecord> {
    var bindings = [];

    this._createTextNodeRecords(bindings, textBindings);
    for (var boundElementIndex = 0; boundElementIndex < elementBinders.length;
         boundElementIndex++) {
      var renderElementBinder = elementBinders[boundElementIndex];
      this._createElementPropertyRecords(bindings, boundElementIndex, renderElementBinder);
      this._createDirectiveRecords(bindings, boundElementIndex, renderElementBinder.directives,
                                   allDirectiveMetadatas);
    }

    return bindings;
  }

  getDirectiveRecords(elementBinders: List<renderApi.ElementBinder>,
                      allDirectiveMetadatas:
                          List<renderApi.DirectiveMetadata>): List<DirectiveRecord> {
    var directiveRecords = [];

    for (var elementIndex = 0; elementIndex < elementBinders.length; ++elementIndex) {
      var dirs = elementBinders[elementIndex].directives;
      for (var dirIndex = 0; dirIndex < dirs.length; ++dirIndex) {
        directiveRecords.push(this._getDirectiveRecord(
            elementIndex, dirIndex, allDirectiveMetadatas[dirs[dirIndex].directiveIndex]));
      }
    }

    return directiveRecords;
  }

  _createTextNodeRecords(bindings: List<BindingRecord>, textBindings: List<ASTWithSource>) {
    for (var i = 0; i < textBindings.length; i++) {
      bindings.push(BindingRecord.createForTextNode(textBindings[i], i));
    }
  }

  _createElementPropertyRecords(bindings: List<BindingRecord>, boundElementIndex: number,
                                renderElementBinder: renderApi.ElementBinder) {
    ListWrapper.forEach(renderElementBinder.propertyBindings, (binding) => {
      if (binding.type === renderApi.PropertyBindingType.PROPERTY) {
        bindings.push(BindingRecord.createForElementProperty(binding.astWithSource,
                                                             boundElementIndex, binding.property));
      } else if (binding.type === renderApi.PropertyBindingType.ATTRIBUTE) {
        bindings.push(BindingRecord.createForElementAttribute(binding.astWithSource,
                                                              boundElementIndex, binding.property));
      } else if (binding.type === renderApi.PropertyBindingType.CLASS) {
        bindings.push(BindingRecord.createForElementClass(binding.astWithSource, boundElementIndex,
                                                          binding.property));
      } else if (binding.type === renderApi.PropertyBindingType.STYLE) {
        bindings.push(BindingRecord.createForElementStyle(binding.astWithSource, boundElementIndex,
                                                          binding.property, binding.unit));
      }
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
        bindings.push(
            BindingRecord.createForDirective(astWithSource, propertyName, setter, directiveRecord));
      });

      if (directiveRecord.callOnChange) {
        bindings.push(BindingRecord.createDirectiveOnChange(directiveRecord));
      }
      if (directiveRecord.callOnInit) {
        bindings.push(BindingRecord.createDirectiveOnInit(directiveRecord));
      }
      if (directiveRecord.callOnCheck) {
        bindings.push(BindingRecord.createDirectiveOnCheck(directiveRecord));
      }
    }

    for (var i = 0; i < directiveBinders.length; i++) {
      var directiveBinder = directiveBinders[i];
      // host properties
      ListWrapper.forEach(directiveBinder.hostPropertyBindings, (binding) => {
        var dirIndex = new DirectiveIndex(boundElementIndex, i);
        if (binding.type === renderApi.PropertyBindingType.PROPERTY) {
          bindings.push(BindingRecord.createForHostProperty(dirIndex, binding.astWithSource,
                                                            binding.property));
        } else if (binding.type === renderApi.PropertyBindingType.ATTRIBUTE) {
          bindings.push(BindingRecord.createForHostAttribute(dirIndex, binding.astWithSource,
                                                             binding.property));
        } else if (binding.type === renderApi.PropertyBindingType.CLASS) {
          bindings.push(
              BindingRecord.createForHostClass(dirIndex, binding.astWithSource, binding.property));
        } else if (binding.type === renderApi.PropertyBindingType.STYLE) {
          bindings.push(BindingRecord.createForHostStyle(dirIndex, binding.astWithSource,
                                                         binding.property, binding.unit));
        }
      });
    }
  }

  _getDirectiveRecord(boundElementIndex: number, directiveIndex: number,
                      directiveMetadata: renderApi.DirectiveMetadata): DirectiveRecord {
    var id = boundElementIndex * 100 + directiveIndex;

    if (!this._directiveRecordsMap.has(id)) {
      this._directiveRecordsMap.set(
          id, new DirectiveRecord({
            directiveIndex: new DirectiveIndex(boundElementIndex, directiveIndex),
            callOnAllChangesDone: directiveMetadata.callOnAllChangesDone,
            callOnChange: directiveMetadata.callOnChange,
            callOnCheck: directiveMetadata.callOnCheck,
            callOnInit: directiveMetadata.callOnInit,
            changeDetection: directiveMetadata.changeDetection
          }));
    }

    return this._directiveRecordsMap.get(id);
  }
}

@Injectable()
export class ProtoViewFactory {
  /**
   * @private
   */
  constructor(public _changeDetection: ChangeDetection) {}

  createAppProtoViews(hostComponentBinding: DirectiveBinding,
                      rootRenderProtoView: renderApi.ProtoViewDto,
                      allDirectives: List<DirectiveBinding>, pipes: PipeBinding[]): AppProtoView[] {
    var allRenderDirectiveMetadata =
        ListWrapper.map(allDirectives, directiveBinding => directiveBinding.metadata);
    var nestedPvsWithIndex = _collectNestedProtoViews(rootRenderProtoView);
    var nestedPvVariableBindings = _collectNestedProtoViewsVariableBindings(nestedPvsWithIndex);
    var nestedPvVariableNames = _collectNestedProtoViewsVariableNames(nestedPvsWithIndex);

    var changeDetectorDefs =
        _getChangeDetectorDefinitions(hostComponentBinding.metadata, nestedPvsWithIndex,
                                      nestedPvVariableNames, allRenderDirectiveMetadata);
    var protoChangeDetectors = ListWrapper.map(
        changeDetectorDefs,
        changeDetectorDef => this._changeDetection.createProtoChangeDetector(changeDetectorDef));
    var appProtoViews = ListWrapper.createFixedSize(nestedPvsWithIndex.length);
    ListWrapper.forEach(nestedPvsWithIndex, (pvWithIndex: RenderProtoViewWithIndex) => {
      var appProtoView =
          _createAppProtoView(pvWithIndex.renderProtoView, protoChangeDetectors[pvWithIndex.index],
                              nestedPvVariableBindings[pvWithIndex.index], allDirectives, pipes);
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
  var nestedPvVariableNames = _collectNestedProtoViewsVariableNames(nestedPvsWithIndex);
  return _getChangeDetectorDefinitions(hostComponentMetadata, nestedPvsWithIndex,
                                       nestedPvVariableNames, allRenderDirectiveMetadata);
}

function _collectNestedProtoViews(
    renderProtoView: renderApi.ProtoViewDto, parentIndex: number = null, boundElementIndex = null,
    result: List<RenderProtoViewWithIndex> = null): List<RenderProtoViewWithIndex> {
  if (isBlank(result)) {
    result = [];
  }
  // reserve the place in the array
  result.push(
      new RenderProtoViewWithIndex(renderProtoView, result.length, parentIndex, boundElementIndex));
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
    var propBindingRecords = bindingRecordsCreator.getPropertyBindingRecords(
        pvWithIndex.renderProtoView.textBindings, elementBinders, allRenderDirectiveMetadata);
    var eventBindingRecords =
        bindingRecordsCreator.getEventBindingRecords(elementBinders, allRenderDirectiveMetadata);
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
    return new ChangeDetectorDefinition(id, strategyName, variableNames, propBindingRecords,
                                        eventBindingRecords, directiveRecords, assertionsEnabled());
  });
}

function _createAppProtoView(
    renderProtoView: renderApi.ProtoViewDto, protoChangeDetector: ProtoChangeDetector,
    variableBindings: Map<string, string>, allDirectives: List<DirectiveBinding>,
    pipes: PipeBinding[]): AppProtoView {
  var elementBinders = renderProtoView.elementBinders;
  // Embedded ProtoViews that contain `<ng-content>` will be merged into their parents and use
  // a RenderFragmentRef. I.e. renderProtoView.transitiveNgContentCount > 0.
  var protoPipes = new ProtoPipes(pipes);
  var protoView = new AppProtoView(
      renderProtoView.type, renderProtoView.transitiveNgContentCount > 0, renderProtoView.render,
      protoChangeDetector, variableBindings, createVariableLocations(elementBinders),
      renderProtoView.textBindings.length, protoPipes);
  _createElementBinders(protoView, elementBinders, allDirectives);
  return protoView;
}

function _collectNestedProtoViewsVariableBindings(
    nestedPvsWithIndex: List<RenderProtoViewWithIndex>): List<Map<string, string>> {
  return ListWrapper.map(nestedPvsWithIndex, (pvWithIndex) => {
    return _createVariableBindings(pvWithIndex.renderProtoView);
  });
}

function _createVariableBindings(renderProtoView): Map<string, string> {
  var variableBindings = new Map();
  MapWrapper.forEach(renderProtoView.variableBindings,
                     (mappedName, varName) => { variableBindings.set(varName, mappedName); });
  return variableBindings;
}

function _collectNestedProtoViewsVariableNames(nestedPvsWithIndex: List<RenderProtoViewWithIndex>):
    List<List<string>> {
  var nestedPvVariableNames = ListWrapper.createFixedSize(nestedPvsWithIndex.length);
  ListWrapper.forEach(nestedPvsWithIndex, (pvWithIndex) => {
    var parentVariableNames =
        isPresent(pvWithIndex.parentIndex) ? nestedPvVariableNames[pvWithIndex.parentIndex] : null;
    nestedPvVariableNames[pvWithIndex.index] =
        _createVariableNames(parentVariableNames, pvWithIndex.renderProtoView);
  });
  return nestedPvVariableNames;
}

function _createVariableNames(parentVariableNames: List<string>, renderProtoView): List<string> {
  var res =
      isBlank(parentVariableNames) ? <List<string>>[] : ListWrapper.clone(parentVariableNames);
  MapWrapper.forEach(renderProtoView.variableBindings,
                     (mappedName, varName) => { res.push(mappedName); });
  ListWrapper.forEach(renderProtoView.elementBinders, binder => {
    MapWrapper.forEach(binder.variableBindings,
                       (mappedName: string, varName: string) => { res.push(mappedName); });
  });
  return res;
}

export function createVariableLocations(elementBinders: List<renderApi.ElementBinder>):
    Map<string, number> {
  var variableLocations = new Map();
  for (var i = 0; i < elementBinders.length; i++) {
    var binder = elementBinders[i];
    MapWrapper.forEach(binder.variableBindings,
                       (mappedName, varName) => { variableLocations.set(mappedName, i); });
  }
  return variableLocations;
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
  return new ParentProtoElementInjectorWithDistance(null, 0);
}

function _createProtoElementInjector(binderIndex, parentPeiWithDistance, renderElementBinder,
                                     componentDirectiveBinding, directiveBindings) {
  var protoElementInjector = null;
  // Create a protoElementInjector for any element that either has bindings *or* has one
  // or more var- defined *or* for <template> elements:
  // - Elements with a var- defined need a their own element injector
  //   so that, when hydrating, $implicit can be set to the element.
  // - <template> elements need their own ElementInjector so that we can query their TemplateRef
  var hasVariables = MapWrapper.size(renderElementBinder.variableBindings) > 0;
  if (directiveBindings.length > 0 || hasVariables ||
      isPresent(renderElementBinder.nestedProtoView)) {
    var directiveVariableBindings =
        createDirectiveVariableBindings(renderElementBinder, directiveBindings);
    protoElementInjector =
        ProtoElementInjector.create(parentPeiWithDistance.protoElementInjector, binderIndex,
                                    directiveBindings, isPresent(componentDirectiveBinding),
                                    parentPeiWithDistance.distance, directiveVariableBindings);
    protoElementInjector.attributes = renderElementBinder.readAttributes;
  }
  return protoElementInjector;
}

function _createElementBinder(protoView: AppProtoView, boundElementIndex, renderElementBinder,
                              protoElementInjector, componentDirectiveBinding, directiveBindings):
    ElementBinder {
  var parent = null;
  if (renderElementBinder.parentIndex !== -1) {
    parent = protoView.elementBinders[renderElementBinder.parentIndex];
  }
  var elBinder = protoView.bindElement(parent, renderElementBinder.distanceToParent,
                                       protoElementInjector, componentDirectiveBinding);
  // The view's locals needs to have a full set of variable names at construction time
  // in order to prevent new variables from being set later in the lifecycle. Since we don't want
  // to actually create variable bindings for the $implicit bindings, add to the
  // protoLocals manually.
  MapWrapper.forEach(renderElementBinder.variableBindings,
                     (mappedName, varName) => { protoView.protoLocals.set(mappedName, null); });
  return elBinder;
}

export function createDirectiveVariableBindings(renderElementBinder: renderApi.ElementBinder,
                                                directiveBindings: List<DirectiveBinding>):
    Map<string, number> {
  var directiveVariableBindings = new Map();
  MapWrapper.forEach(renderElementBinder.variableBindings, (templateName, exportAs) => {
    var dirIndex = _findDirectiveIndexByExportAs(renderElementBinder, directiveBindings, exportAs);
    directiveVariableBindings.set(templateName, dirIndex);
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

class RenderProtoViewWithIndex {
  constructor(public renderProtoView: renderApi.ProtoViewDto, public index: number,
              public parentIndex: number, public boundElementIndex: number) {}
}

class ParentProtoElementInjectorWithDistance {
  constructor(public protoElementInjector: ProtoElementInjector, public distance: number) {}
}
