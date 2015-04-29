import {
  ComponentAnnotation,
  DirectiveAnnotation
} from '../annotations/annotations';
import {ViewAnnotation} from '../annotations/view';
import {AncestorAnnotation, ParentAnnotation} from '../annotations/visibility';
import {AttributeAnnotation, QueryAnnotation} from '../annotations/di';
import {global} from 'angular2/src/facade/lang';

function makeDecorator(annotationCls) {
  return function(...args) {
    var Reflect = global.Reflect;
    if (!(Reflect && Reflect.getMetadata)) {
      throw 'reflect-metadata shim is required when using class decorators';
    }
    var annotationInstance = new annotationCls(...args);
    return function(cls) {
      var annotations = Reflect.getMetadata('annotations', cls);
      annotations = annotations || [];
      annotations.push(annotationInstance);
      Reflect.defineMetadata('annotations', annotations, cls);
      return cls;
    }
  }
}

function makeParamDecorator(annotationCls) {
  return function(...args) {
    var Reflect = global.Reflect;
    if (!(Reflect && Reflect.getMetadata)) {
      throw 'reflect-metadata shim is required when using parameter decorators';
    }
    var annotationInstance = new annotationCls(...args);
    return function(cls, unusedKey, index) {
      var parameters = Reflect.getMetadata('parameters', cls);
      parameters = parameters || [];
      // there might be gaps if some in between parameters do not have annotations.
      // we pad with nulls.
      while (parameters.length <= index) {
        parameters.push(null);
      }
      parameters[index] = annotationInstance;
      Reflect.defineMetadata('parameters', parameters, cls);
      return cls;
    }
  }
}

/* from annotations */
export var Component = makeDecorator(ComponentAnnotation);
export var Decorator = makeDecorator(DirectiveAnnotation);

/* from view */
export var View = makeDecorator(ViewAnnotation);

/* from visibility */
export var Ancestor = makeParamDecorator(AncestorAnnotation);
export var Parent = makeParamDecorator(ParentAnnotation);

/* from di */
export var Attribute = makeParamDecorator(AttributeAnnotation);
export var Query = makeParamDecorator(QueryAnnotation);
