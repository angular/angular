import {Injectable} from 'angular2/di';
import {List, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {reflector} from 'angular2/src/reflection/reflection';

import {ChangeDetection, DirectiveIndex, BindingRecord, DirectiveRecord, ProtoChangeDetector} from 'angular2/change_detection';
import {Component} from '../annotations_impl/annotations';

import * as renderApi from 'angular2/src/render/api';
import {AppProtoView} from './view';
import {ProtoElementInjector, DirectiveBinding} from './element_injector';


class BindingRecordsCreator {
  _directiveRecordsMap;
  _textNodeIndex:number;

  constructor() {
    this._directiveRecordsMap = MapWrapper.create();
    this._textNodeIndex = 0;
  }

  getBindingRecords(elementBinders:List<renderApi.ElementBinder>, sortedDirectives:List<SortedDirectives>):List<BindingRecord> {
    var bindings = [];

    for (var boundElementIndex = 0; boundElementIndex < elementBinders.length; boundElementIndex++) {
      var renderElementBinder = elementBinders[boundElementIndex];
      bindings = ListWrapper.concat(bindings, this._createTextNodeRecords(renderElementBinder));
      bindings = ListWrapper.concat(bindings, this._createElementPropertyRecords(boundElementIndex, renderElementBinder));
      bindings = ListWrapper.concat(bindings, this._createDirectiveRecords(boundElementIndex, sortedDirectives[boundElementIndex]));
    }
    
    return bindings;
  }

  getDirectiveRecords(sortedDirectives:List<SortedDirectives>): List {
    var directiveRecords = [];

    for (var elementIndex = 0; elementIndex < sortedDirectives.length; ++elementIndex) {
      var dirs = sortedDirectives[elementIndex].directives;
      for (var dirIndex = 0; dirIndex < dirs.length; ++dirIndex) {
        ListWrapper.push(directiveRecords, this._getDirectiveRecord(elementIndex, dirIndex, dirs[dirIndex]));
      }
    }

    return directiveRecords;
  }

  _createTextNodeRecords(renderElementBinder:renderApi.ElementBinder) {
    if (isBlank(renderElementBinder.textBindings)) return [];
    return ListWrapper.map(renderElementBinder.textBindings, b => BindingRecord.createForTextNode(b, this._textNodeIndex++));
  }

  _createElementPropertyRecords(boundElementIndex:number, renderElementBinder:renderApi.ElementBinder) {
    var res = [];
    MapWrapper.forEach(renderElementBinder.propertyBindings, (astWithSource, propertyName) => {
      ListWrapper.push(res, BindingRecord.createForElement(astWithSource, boundElementIndex, propertyName));
    });
    return res;
  }

  _createDirectiveRecords(boundElementIndex:number, sortedDirectives:SortedDirectives) {
    var res = [];
    for (var i = 0; i < sortedDirectives.renderDirectives.length; i++) {
      var directiveBinder = sortedDirectives.renderDirectives[i];

      // directive properties
      MapWrapper.forEach(directiveBinder.propertyBindings, (astWithSource, propertyName) => {
        // TODO: these setters should eventually be created by change detection, to make
        // it monomorphic!
        var setter = reflector.setter(propertyName);
        var directiveRecord = this._getDirectiveRecord(boundElementIndex, i, sortedDirectives.directives[i]);
        var b = BindingRecord.createForDirective(astWithSource, propertyName, setter, directiveRecord);
        ListWrapper.push(res, b);
      });

      // host properties
      MapWrapper.forEach(directiveBinder.hostPropertyBindings, (astWithSource, propertyName) => {
        var dirIndex = new DirectiveIndex(boundElementIndex, i);
        var b = BindingRecord.createForHostProperty(dirIndex, astWithSource, propertyName);
        ListWrapper.push(res, b);
      });
    }
    return res;
  }

  _getDirectiveRecord(boundElementIndex:number, directiveIndex:number, binding:DirectiveBinding): DirectiveRecord {
    var id = boundElementIndex * 100 + directiveIndex;

    if (!MapWrapper.contains(this._directiveRecordsMap, id)) {
      var changeDetection = binding.changeDetection;

      MapWrapper.set(this._directiveRecordsMap, id,
        new DirectiveRecord(new DirectiveIndex(boundElementIndex, directiveIndex),
          binding.callOnAllChangesDone, binding.callOnChange, changeDetection));
    }

    return MapWrapper.get(this._directiveRecordsMap, id);
  }
}


@Injectable()
export class ProtoViewFactory {
  _changeDetection:ChangeDetection;

  constructor(changeDetection:ChangeDetection) {
    this._changeDetection = changeDetection;
  }

  createProtoView(parentProtoView:AppProtoView, componentBinding:DirectiveBinding,
                  renderProtoView: renderApi.ProtoViewDto, directives:List<DirectiveBinding>):AppProtoView {

    var elementBinders = renderProtoView.elementBinders;
    var sortedDirectives = ListWrapper.map(elementBinders, b => new SortedDirectives(b.directives, directives));

    var variableBindings = this._createVariableBindings(renderProtoView);
    var protoLocals = this._createProtoLocals(renderProtoView);
    var variableNames = this._createVariableNames(parentProtoView, protoLocals);
    var protoChangeDetector = this._createProtoChangeDetector(elementBinders, sortedDirectives, componentBinding, variableNames);
    var protoView = new AppProtoView(renderProtoView.render, protoChangeDetector, variableBindings, protoLocals, variableNames);

    // TODO: vsavkin refactor to pass element binders into proto view
    this._createElementBinders(protoView, elementBinders, sortedDirectives)
    this._bindDirectiveEvents(protoView, sortedDirectives);

    return protoView;
  }

  _createProtoLocals(renderProtoView):Map {
    var protoLocals = MapWrapper.create();
    MapWrapper.forEach(renderProtoView.variableBindings, (mappedName, varName) => {
      MapWrapper.set(protoLocals, mappedName, null);
    });
    return protoLocals;
  }

  _createVariableBindings(renderProtoView):Map {
    var variableBindings = MapWrapper.create();
    MapWrapper.forEach(renderProtoView.variableBindings, (mappedName, varName) => {
      MapWrapper.set(variableBindings, varName, mappedName);
    });
    return variableBindings;
  }

  _createVariableNames(parentProtoView, protoLocals):List {
    var variableNames = isPresent(parentProtoView) ? ListWrapper.clone(parentProtoView.variableNames) : [];
    MapWrapper.forEach(protoLocals, (v, local) => {
      ListWrapper.push(variableNames, local);
    });
    return variableNames;
  }

  _createProtoChangeDetector(elementBinders, sortedDirectives, componentBinding, variableNames):ProtoChangeDetector {
    var bindingRecordsCreator = new BindingRecordsCreator();
    var bindingRecords = bindingRecordsCreator.getBindingRecords(elementBinders, sortedDirectives);
    var directiveRecords = bindingRecordsCreator.getDirectiveRecords(sortedDirectives);

    var changeDetection = null;
    var name = 'root';
    if (isPresent(componentBinding)) {
      var componentAnnotation:Component = componentBinding.annotation;
      changeDetection = componentAnnotation.changeDetection;
      name = 'dummy';
    }

    return this._changeDetection.createProtoChangeDetector(
      name,
      bindingRecords,
      variableNames,
      directiveRecords,
      changeDetection
    );
  }

  _createElementBinders(protoView, elementBinders, sortedDirectives) {
    for (var i=0; i<elementBinders.length; i++) {
      var renderElementBinder = elementBinders[i];
      var dirs = sortedDirectives[i];

      var parentPeiWithDistance = this._findParentProtoElementInjectorWithDistance(
          i, protoView.elementBinders, elementBinders);
      var protoElementInjector = this._createProtoElementInjector(
          i, parentPeiWithDistance, dirs, renderElementBinder);

      this._createElementBinder(protoView, i, renderElementBinder, protoElementInjector, dirs);
    }
  }

  _findParentProtoElementInjectorWithDistance(binderIndex, elementBinders, renderElementBinders) {
    var distance = 0;
    do {
      var renderElementBinder = renderElementBinders[binderIndex];
      binderIndex = renderElementBinder.parentIndex;
      if (binderIndex !== -1) {
        distance += renderElementBinder.distanceToParent;
        var elementBinder = elementBinders[binderIndex];
        if (isPresent(elementBinder.protoElementInjector)) {
          return new ParentProtoElementInjectorWithDistance(elementBinder.protoElementInjector, distance);
        }
      }
    } while (binderIndex !== -1);
    return new ParentProtoElementInjectorWithDistance(null, -1);
  }

  _createProtoElementInjector(binderIndex, parentPeiWithDistance, sortedDirectives, renderElementBinder) {
    var protoElementInjector = null;
    // Create a protoElementInjector for any element that either has bindings *or* has one
    // or more var- defined. Elements with a var- defined need a their own element injector
    // so that, when hydrating, $implicit can be set to the element.
    var hasVariables = MapWrapper.size(renderElementBinder.variableBindings) > 0;
    if (sortedDirectives.directives.length > 0 || hasVariables) {
      protoElementInjector = new ProtoElementInjector(
          parentPeiWithDistance.protoElementInjector, binderIndex,
          sortedDirectives.directives,
          isPresent(sortedDirectives.componentDirective), parentPeiWithDistance.distance
      );
      protoElementInjector.attributes = renderElementBinder.readAttributes;
      if (hasVariables) {
        protoElementInjector.exportComponent = isPresent(sortedDirectives.componentDirective);
        protoElementInjector.exportElement = isBlank(sortedDirectives.componentDirective);

        // experiment
        var exportImplicitName = MapWrapper.get(renderElementBinder.variableBindings, '\$implicit');
        if (isPresent(exportImplicitName)) {
          protoElementInjector.exportImplicitName = exportImplicitName;
        }
      }
    }
    return protoElementInjector;
  }

  _createElementBinder(protoView, boundElementIndex, renderElementBinder, protoElementInjector, sortedDirectives) {
    var parent = null;
    if (renderElementBinder.parentIndex !== -1) {
      parent = protoView.elementBinders[renderElementBinder.parentIndex];
    }
    var elBinder = protoView.bindElement(
      parent,
      renderElementBinder.distanceToParent,
      protoElementInjector,
      sortedDirectives.componentDirective
    );
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

  _bindDirectiveEvents(protoView, sortedDirectives:List<SortedDirectives>) {
    for (var boundElementIndex = 0; boundElementIndex < sortedDirectives.length; ++boundElementIndex) {
      var dirs = sortedDirectives[boundElementIndex].renderDirectives;
      for (var i = 0; i < dirs.length; i++) {
        var directiveBinder = dirs[i];

        // directive events
        protoView.bindEvent(directiveBinder.eventBindings, boundElementIndex, i);
      }
    }
  }
}

class SortedDirectives {
  componentDirective: DirectiveBinding;
  renderDirectives: List<renderApi.DirectiveBinder>;
  directives: List<DirectiveBinding>;

  constructor(renderDirectives, allDirectives) {
    this.renderDirectives = [];
    this.directives = [];
    this.componentDirective = null;
    ListWrapper.forEach(renderDirectives, (renderDirectiveBinder) => {
      var directiveBinding = allDirectives[renderDirectiveBinder.directiveIndex];
      if (directiveBinding.annotation instanceof Component) {
        // component directives need to be the first binding in ElementInjectors!
        this.componentDirective = directiveBinding;
        ListWrapper.insert(this.renderDirectives, 0, renderDirectiveBinder);
        ListWrapper.insert(this.directives, 0, directiveBinding);
      } else {
        ListWrapper.push(this.renderDirectives, renderDirectiveBinder);
        ListWrapper.push(this.directives, directiveBinding);
      }
    });

  }
}

class ParentProtoElementInjectorWithDistance {
  protoElementInjector:ProtoElementInjector;
  distance:number;
  constructor(protoElementInjector:ProtoElementInjector, distance:number) {
    this.protoElementInjector = protoElementInjector;
    this.distance = distance;
  }
}
