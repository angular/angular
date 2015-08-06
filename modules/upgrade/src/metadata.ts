import {Type, ComponentMetadata, DirectiveResolver, DirectiveMetadata} from 'angular2/angular2';
import {stringify} from 'upgrade/src/util';

var COMPONENT_SELECTOR = /^[\w|-]*$/;
var SKEWER_CASE = /-(\w)/g;
var directiveResolver = new DirectiveResolver();

interface Reflect {
  getOwnMetadata(name: string, type: Function): any;
  defineMetadata(name: string, value: any, cls: Type): void;
}
var Reflect: Reflect = <Reflect>(<any>window).Reflect;
if (!(Reflect && (<any>Reflect)['getOwnMetadata'])) {
  throw 'reflect-metadata shim is required when using class decorators';
}

export function getComponentSelector(type: Type): string {
  var resolvedMetadata: DirectiveMetadata = directiveResolver.resolve(type);
  var selector = resolvedMetadata.selector;
  if (!selector.match(COMPONENT_SELECTOR)) {
    throw new Error('Only selectors matching element names are supported, got: ' + selector);
  }
  return selector.replace(SKEWER_CASE, (all, letter: string) => letter.toUpperCase());
}
