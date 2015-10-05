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

export interface AttrProp {
  prop: string;
  attr: string;
  bracketAttr: string;
  bracketParanAttr: string;
  parenAttr: string;
  onAttr: string;
  bindAttr: string;
  bindonAttr: string;
}

export interface ComponentInfo {
  selector: string;
  inputs: AttrProp[];
  outputs: AttrProp[];
}

export function getComponentInfo(type: Type): string {
  var resolvedMetadata: DirectiveMetadata = directiveResolver.resolve(type);
  var selector = resolvedMetadata.selector;
  if (!selector.match(COMPONENT_SELECTOR)) {
    throw new Error('Only selectors matching element names are supported, got: ' + selector);
  }
  var selector = selector.replace(SKEWER_CASE, (all, letter: string) => letter.toUpperCase());
  return {
    type: type,
    selector: selector,
    inputs: parseFields(resolvedMetadata.inputs),
    outputs: parseFields(resolvedMetadata.outputs)
  };
}

export function parseFields(names: string[]): AttrProp[] {
  var attrProps: AttrProp[] = [];
  if (names) {
    for (var i = 0; i < names.length; i++) {
      var parts = names[i].split(':');
      var prop = parts[0].trim();
      var attr = (parts[1] || parts[0]).trim();
      var Attr = attr.charAt(0).toUpperCase() + attr.substr(1);
      attrProps.push({
        prop: prop,
        attr: attr,
        bracketAttr: `[${attr}]`,
        parenAttr: `(${attr})`,
        bracketParanAttr: `[(${attr})]`
        onAttr: `on${Attr}`,
        bindAttr: `bind${Attr}`,
        bindonAttr: `bindon${Attr}`
      });
    }
  }
  return attrProps;
}
