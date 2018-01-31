/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactory, EventEmitter} from '@angular/core';

import {NgElementImpl, NgElementWithProps} from './ng-element';
import {NgElementApplicationContext} from './ng-element-application-context';
import {camelToKebabCase, throwError} from './utils';

export interface NgElementConstructor<T, P> {
  readonly is: string;
  readonly observedAttributes: string[];

  upgrade(host: HTMLElement): NgElementWithProps<T, P>;

  new (): NgElementWithProps<T, P>;
}

export interface NgElementConstructorInternal<T, P> extends NgElementConstructor<T, P> {
  readonly onConnected: EventEmitter<NgElementWithProps<T, P>>;
  readonly onDisconnected: EventEmitter<NgElementWithProps<T, P>>;
  upgrade(host: HTMLElement, ignoreUpgraded?: boolean): NgElementWithProps<T, P>;
}

type WithProperties<P> = {
  [property in keyof P]: P[property]
};

// For more info on `PotentialCustomElementName` rules see:
// https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
const PCEN_RE = createPcenRe();
const PCEN_BLACKLIST = [
  'annotation-xml',
  'color-profile',
  'font-face',
  'font-face-src',
  'font-face-uri',
  'font-face-format',
  'font-face-name',
  'missing-glyph',
];

export function createNgElementConstructor<T, P>(
    appContext: NgElementApplicationContext,
    componentFactory: ComponentFactory<T>): NgElementConstructorInternal<T, P> {
  const selector = componentFactory.selector;

  if (!isPotentialCustomElementName(selector)) {
    throwError(
        `Using '${selector}' as a custom element name is not allowed. ` +
        'See https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name for more info.');
  }

  const inputs = componentFactory.inputs.map(({propName, templateName}) => ({
                                               propName,
                                               attrName: camelToKebabCase(templateName),
                                             }));
  const outputs = componentFactory.outputs.map(({propName, templateName}) => ({
                                                 propName,
                                                 eventName: templateName,
                                               }));

  // Note: According to the spec, this needs to be an ES2015 class
  // (i.e. not transpiled to an ES5 constructor function).
  // TODO(gkalpak): Document that if you are using ES5 sources you need to include a polyfill (e.g.
  //                https://github.com/webcomponents/custom-elements/blob/32f043c3a/src/native-shim.js).
  class NgElementConstructorImpl extends NgElementImpl<T> {
    static readonly is = selector;
    static readonly observedAttributes = inputs.map(input => input.attrName);
    static readonly onConnected = new EventEmitter<NgElementWithProps<T, P>>();
    static readonly onDisconnected = new EventEmitter<NgElementWithProps<T, P>>();

    static upgrade(host: HTMLElement, ignoreUpgraded = false): NgElementWithProps<T, P> {
      const ngElement = new NgElementConstructorImpl();

      ngElement.setHost(host);
      ngElement.connectedCallback(ignoreUpgraded);

      return ngElement as typeof ngElement & WithProperties<P>;
    }

    constructor() {
      super(appContext, componentFactory, inputs, outputs);

      const ngElement = this as this & WithProperties<P>;
      this.onConnected.subscribe(() => NgElementConstructorImpl.onConnected.emit(ngElement));
      this.onDisconnected.subscribe(() => NgElementConstructorImpl.onDisconnected.emit(ngElement));
    }
  }

  inputs.forEach(({propName}) => {
    Object.defineProperty(NgElementConstructorImpl.prototype, propName, {
      get: function(this: NgElementImpl<any>) { return this.getInputValue(propName); },
      set: function(this: NgElementImpl<any>, newValue: any) {
        this.setInputValue(propName, newValue);
      },
      configurable: true,
      enumerable: true,
    });
  });

  return NgElementConstructorImpl as typeof NgElementConstructorImpl & {
    new (): NgElementConstructorImpl&WithProperties<P>;
  };
}

function createPcenRe() {
  // According to [the
  // spec](https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name),
  // `pcenChar` is allowed to contain Unicode characters in the 10000-EFFFF range. But in order to
  // match this characters with a RegExp, we need the implementation to support the `u` flag.
  // On browsers that do not support it, valid PotentialCustomElementNames using characters in the
  // 10000-EFFFF range will still cause an error (but these characters are not expected to be used
  // in practice).
  let pcenChar = '-.0-9_a-z\\u00B7\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u037D\\u037F-\\u1FFF' +
      '\\u200C-\\u200D\\u203F-\\u2040\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF' +
      '\\uF900-\\uFDCF\\uFDF0-\\uFFFD';
  let flags = '';

  if (RegExp.prototype.hasOwnProperty('unicode')) {
    pcenChar += '\\u{10000}-\\u{EFFFF}';
    flags += 'u';
  }

  return RegExp(`^[a-z][${pcenChar}]*-[${pcenChar}]*$`, flags);
}

function isPotentialCustomElementName(name: string): boolean {
  return PCEN_RE.test(name) && (PCEN_BLACKLIST.indexOf(name) === -1);
}
