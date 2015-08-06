import {Type, ComponentMetadata} from 'angular2/angular2';
import {stringify} from 'upgrade/src/util';

var COMPONENT_SELECTOR = /^[\w|-]*$/;
var SKEWER_CASE = /-(\w)/g;

interface Reflect {
  getOwnMetadata(name: string, type: Function): any;
  defineMetadata(name: string, value: any, cls: Type): void;
}
var Reflect: Reflect = <Reflect>(<any>window).Reflect;
if (!(Reflect && (<any>Reflect)['getOwnMetadata'])) {
  throw 'reflect-metadata shim is required when using class decorators';
}

export function getComponentSelector(type: Type): string {
  var selector = getTypeMetadata(type).selector;
  if (!selector.match(COMPONENT_SELECTOR)) {
    throw new Error('Only selectors matching element names are supported, got: ' + selector);
  }
  return selector.replace(SKEWER_CASE, (all, letter: string) => letter.toUpperCase());
}

export function getTypeMetadata(type: Type): ComponentMetadata {
  var annotations = Reflect.getOwnMetadata('annotations', type) || [];
  for (var i = 0; i < annotations.length; i++) {
    var annotation = annotations[i];
    if (annotation instanceof ComponentMetadata) return annotation;
  }
  throw new Error("Missing @Component metadata on type: " + stringify(type));
}
