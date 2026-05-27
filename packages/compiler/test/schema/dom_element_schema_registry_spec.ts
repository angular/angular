/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DomElementSchemaRegistry} from '../../src/schema/dom_element_schema_registry';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, SecurityContext} from '@angular/core';
import {isNode} from '@angular/private/testing';

import {Element} from '../../src/ml_parser/ast';
import {HtmlParser} from '../../src/ml_parser/html_parser';

import {extractSchema} from './schema_extractor';

describe('DOMElementSchema', () => {
  let registry: DomElementSchemaRegistry;
  beforeEach(() => {
    registry = new DomElementSchemaRegistry();
  });

  it('should detect elements', () => {
    expect(registry.hasElement('div', [])).toBeTruthy();
    expect(registry.hasElement('b', [])).toBeTruthy();
    expect(registry.hasElement('ng-container', [])).toBeTruthy();
    expect(registry.hasElement('ng-content', [])).toBeTruthy();

    expect(registry.hasElement('my-cmp', [])).toBeFalsy();
    expect(registry.hasElement('abc', [])).toBeFalsy();
  });

  // https://github.com/angular/angular/issues/11219
  it('should detect elements missing from chrome', () => {
    expect(registry.hasElement('data', [])).toBeTruthy();
    expect(registry.hasElement('menuitem', [])).toBeTruthy();
    expect(registry.hasElement('summary', [])).toBeTruthy();
    expect(registry.hasElement('time', [])).toBeTruthy();
  });

  it('should detect properties on regular elements', () => {
    expect(registry.hasProperty('div', 'id', [])).toBeTruthy();
    expect(registry.hasProperty('div', 'title', [])).toBeTruthy();
    expect(registry.hasProperty('div', 'inert', [])).toBeTruthy();
    expect(registry.hasProperty('h1', 'align', [])).toBeTruthy();
    expect(registry.hasProperty('h2', 'align', [])).toBeTruthy();
    expect(registry.hasProperty('h3', 'align', [])).toBeTruthy();
    expect(registry.hasProperty('h4', 'align', [])).toBeTruthy();
    expect(registry.hasProperty('h5', 'align', [])).toBeTruthy();
    expect(registry.hasProperty('h6', 'align', [])).toBeTruthy();
    expect(registry.hasProperty('h7', 'align', [])).toBeFalsy();
    expect(registry.hasProperty('textarea', 'disabled', [])).toBeTruthy();
    expect(registry.hasProperty('input', 'disabled', [])).toBeTruthy();
    expect(registry.hasProperty('div', 'unknown', [])).toBeFalsy();
  });

  // https://github.com/angular/angular/issues/11219
  it('should detect properties on elements missing from Chrome', () => {
    expect(registry.hasProperty('data', 'value', [])).toBeTruthy();

    expect(registry.hasProperty('menuitem', 'type', [])).toBeTruthy();
    expect(registry.hasProperty('menuitem', 'default', [])).toBeTruthy();

    expect(registry.hasProperty('time', 'dateTime', [])).toBeTruthy();
  });

  it('should detect different kinds of types', () => {
    // inheritance: video => media => [HTMLElement] => [Element]
    expect(registry.hasProperty('video', 'className', [])).toBeTruthy(); // from [Element]
    expect(registry.hasProperty('video', 'id', [])).toBeTruthy(); // string
    expect(registry.hasProperty('video', 'scrollLeft', [])).toBeTruthy(); // number
    expect(registry.hasProperty('video', 'height', [])).toBeTruthy(); // number
    expect(registry.hasProperty('video', 'autoplay', [])).toBeTruthy(); // boolean
    expect(registry.hasProperty('video', 'classList', [])).toBeTruthy(); // object
    // from *; but events are not properties
    expect(registry.hasProperty('video', 'click', [])).toBeFalsy();
  });

  it('should treat custom elements as an unknown element by default', () => {
    expect(registry.hasProperty('custom-like', 'unknown', [])).toBe(false);
    expect(registry.hasProperty('custom-like', 'className', [])).toBeTruthy();
    expect(registry.hasProperty('custom-like', 'style', [])).toBeTruthy();
    expect(registry.hasProperty('custom-like', 'id', [])).toBeTruthy();
  });

  it('should return true for custom-like elements if the CUSTOM_ELEMENTS_SCHEMA was used', () => {
    expect(registry.hasProperty('custom-like', 'unknown', [CUSTOM_ELEMENTS_SCHEMA])).toBeTruthy();

    expect(registry.hasElement('custom-like', [CUSTOM_ELEMENTS_SCHEMA])).toBeTruthy();
  });

  it('should return true for all elements if the NO_ERRORS_SCHEMA was used', () => {
    expect(registry.hasProperty('custom-like', 'unknown', [NO_ERRORS_SCHEMA])).toBeTruthy();
    expect(registry.hasProperty('a', 'unknown', [NO_ERRORS_SCHEMA])).toBeTruthy();

    expect(registry.hasElement('custom-like', [NO_ERRORS_SCHEMA])).toBeTruthy();
    expect(registry.hasElement('unknown', [NO_ERRORS_SCHEMA])).toBeTruthy();
  });

  it('should re-map property names that are specified in DOM facade', () => {
    expect(registry.getMappedPropName('readonly')).toEqual('readOnly');
  });

  it('should not re-map property names that are not specified in DOM facade', () => {
    expect(registry.getMappedPropName('title')).toEqual('title');
    expect(registry.getMappedPropName('exotic-unknown')).toEqual('exotic-unknown');
  });

  it('should return an error message when asserting event properties', () => {
    let report = registry.validateProperty('onClick');
    expect(report.error).toBeTruthy();
    expect(report.msg).toEqual(
      `Binding to event property 'onClick' is disallowed for security reasons, please use (Click)=...
If 'onClick' is a directive input, make sure the directive is imported by the current module.`,
    );

    report = registry.validateProperty('onAnything');
    expect(report.error).toBeTruthy();
    expect(report.msg).toEqual(
      `Binding to event property 'onAnything' is disallowed for security reasons, please use (Anything)=...
If 'onAnything' is a directive input, make sure the directive is imported by the current module.`,
    );
  });

  it('should return an error message when asserting event attributes', () => {
    let report = registry.validateAttribute('onClick');
    expect(report.error).toBeTruthy();
    expect(report.msg).toEqual(
      `Binding to event attribute 'onClick' is disallowed for security reasons, please use (Click)=...`,
    );

    report = registry.validateAttribute('onAnything');
    expect(report.error).toBeTruthy();
    expect(report.msg).toEqual(
      `Binding to event attribute 'onAnything' is disallowed for security reasons, please use (Anything)=...`,
    );
  });

  it('should not return an error message when asserting non-event properties or attributes', () => {
    let report = registry.validateProperty('title');
    expect(report.error).toBeFalsy();
    expect(report.msg).not.toBeDefined();

    report = registry.validateProperty('exotic-unknown');
    expect(report.error).toBeFalsy();
    expect(report.msg).not.toBeDefined();
  });

  it('should return security contexts for elements', () => {
    expect(registry.securityContext('iframe', 'srcdoc', false)).toBe(SecurityContext.HTML);
    expect(registry.securityContext('p', 'innerHTML', false)).toBe(SecurityContext.HTML);
    expect(registry.securityContext('a', 'href', false)).toBe(SecurityContext.URL);
    expect(registry.securityContext('a', 'style', false)).toBe(SecurityContext.STYLE);
    expect(registry.securityContext('ins', 'cite', false)).toBe(SecurityContext.URL);
    expect(registry.securityContext('base', 'href', false)).toBe(SecurityContext.RESOURCE_URL);
  });

  it('should detect properties on namespaced elements', () => {
    const htmlAst = new HtmlParser().parse('<svg:style>', 'TestComp');
    const nodeName = (<Element>htmlAst.rootNodes[0]).name;
    expect(registry.hasProperty(nodeName, 'type', [])).toBeTruthy();
  });

  it('should check security contexts case insensitive', () => {
    expect(registry.securityContext('p', 'iNnErHtMl', false)).toBe(SecurityContext.HTML);
    expect(registry.securityContext('p', 'formaction', false)).toBe(SecurityContext.URL);
    expect(registry.securityContext('p', 'formAction', false)).toBe(SecurityContext.URL);
  });

  it('should check security contexts for attributes', () => {
    expect(registry.securityContext('p', 'innerHtml', true)).toBe(SecurityContext.HTML);
    expect(registry.securityContext('p', 'formaction', true)).toBe(SecurityContext.URL);
  });

  describe('Angular custom elements', () => {
    it('should support <ng-container>', () => {
      expect(registry.hasProperty('ng-container', 'id', [])).toBeFalsy();
    });

    it('should support <ng-content>', () => {
      expect(registry.hasProperty('ng-content', 'id', [])).toBeFalsy();
      expect(registry.hasProperty('ng-content', 'select', [])).toBeFalsy();
    });
  });

  if (!isNode) {
    it('generate a new schema', () => {
      let schema = '\n';
      extractSchema()!.forEach((props, name) => {
        schema += `'${name}|${props.join(',')}',\n`;
      });
      // Uncomment this line to see:
      // the generated schema which can then be pasted to the DomElementSchemaRegistry
      // console.log(schema);
    });
  }

  describe('normalizeAnimationStyleProperty', () => {
    it('should normalize the given CSS property to camelCase', () => {
      expect(registry.normalizeAnimationStyleProperty('border-radius')).toBe('borderRadius');
      expect(registry.normalizeAnimationStyleProperty('zIndex')).toBe('zIndex');
      expect(registry.normalizeAnimationStyleProperty('-webkit-animation')).toBe('WebkitAnimation');
    });
  });

  describe('normalizeAnimationStyleValue', () => {
    it('should normalize the given dimensional CSS style value to contain a PX value when numeric', () => {
      expect(
        registry.normalizeAnimationStyleValue('borderRadius', 'border-radius', 10)['value'],
      ).toBe('10px');
    });

    it('should not normalize any values that are of zero', () => {
      expect(registry.normalizeAnimationStyleValue('opacity', 'opacity', 0)['value']).toBe('0');
      expect(registry.normalizeAnimationStyleValue('width', 'width', 0)['value']).toBe('0');
    });

    it("should retain the given dimensional CSS style value's unit if it already exists", () => {
      expect(
        registry.normalizeAnimationStyleValue('borderRadius', 'border-radius', '10em')['value'],
      ).toBe('10em');
    });

    it('should trim the provided CSS style value', () => {
      expect(registry.normalizeAnimationStyleValue('color', 'color', '   red ')['value']).toBe(
        'red',
      );
    });

    it('should stringify all non dimensional numeric style values', () => {
      expect(registry.normalizeAnimationStyleValue('zIndex', 'zIndex', 10)['value']).toBe('10');
      expect(registry.normalizeAnimationStyleValue('opacity', 'opacity', 0.5)['value']).toBe('0.5');
    });
  });
});
