import {
  ComponentAnnotation,
  DecoratorAnnotation
} from '../annotations/annotations';
import {ViewAnnotation} from '../annotations/view';
import {AncestorAnnotation, ParentAnnotation} from '../annotations/visibility';
import {AttributeAnnotation, QueryAnnotation} from '../annotations/di';

function makeDecorator(annotationCls) {
  return function(...args) {
    if (!(window.Reflect && !window.Reflect.getMetadata)) throw 'reflect-metadata shim is required';
    var annotationInstance = new annotationCls(...args);
    var Reflect = window.Reflect;
    return function(cls) {
      var annotations = Reflect.getMetadata('annotations', cls);
      annotations = annotations || [];
      annotations.push(annotationInstance);
      Reflect.defineMetadata('annotations', annotations, cls);
      return cls;
    }
  }
}

/* from annotations */
export var Component = makeDecorator(ComponentAnnotation);
export var Decorator = makeDecorator(DecoratorAnnotation);

/* from di */
export var Attribute = makeDecorator(AttributeAnnotation);
export var Query = makeDecorator(QueryAnnotation);

/* from view */
export var View = makeDecorator(ViewAnnotation);

/* from visiblity */
export var Ancestor = makeDecorator(AncestorAnnotation);
export var Parent = makeDecorator(ParentAnnotation);
