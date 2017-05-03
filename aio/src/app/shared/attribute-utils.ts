// Utilities for processing HTML element attributes
import { ElementRef } from '@angular/core';

interface StringMap { [index: string]: string; }

/**
 * Get attribute map from element or ElementRef `attributes`.
 * Attribute map keys are forced lowercase for case-insensitive lookup.
 * @param el The source of the attributes
 */
export function getAttrs(el:  HTMLElement | ElementRef): StringMap {
  const attrs: NamedNodeMap = el instanceof ElementRef ? el.nativeElement.attributes : el.attributes;
  const attrMap = {};
  Object.keys(attrs).forEach(key =>
    attrMap[(attrs[key] as Attr).name.toLowerCase()] = (attrs[key] as Attr).value);
  return attrMap;
}

/**
 * Return the attribute that matches `attr`.
 * @param attr Name of the attribute or a string of candidate attribute names
 */
export function getAttrValue(attrs: StringMap, attr: string | string[] = ''): string {
  return attrs[typeof attr === 'string' ?
    attr.toLowerCase() :
    attr.find(a => attrs[a.toLowerCase()] !== undefined)
  ];
}

/**
 * Return the boolean state of an attribute value (if supplied)
 * @param attrValue The string value of some attribute (or undefined if attribute not present)
 * @param def Default boolean value when attribute is undefined.
 */
export function boolFromValue(attrValue: string, def: boolean = false) {
  // tslint:disable-next-line:triple-equals
  return attrValue == undefined ? def :  attrValue.trim() !== 'false';
}

/**
 * Return the boolean state of attribute from an element
 * @param el The source of the attributes
 * @param atty Name of the attribute or a string of candidate attribute names
 * @param def Default boolean value when attribute is undefined.
 */
export function getBoolFromAttribute(
  el:  HTMLElement | ElementRef,
  attr: string | string[],
  def: boolean = false): boolean {
  return boolFromValue(getAttrValue(getAttrs(el), attr), def);
}
