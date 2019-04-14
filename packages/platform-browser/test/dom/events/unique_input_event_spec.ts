/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {beforeEach, describe, expect, it} from '@angular/core/testing/src/testing_internal';
import {UniqueInputEventPlugin} from '@angular/platform-browser/src/dom/events/unique_input_event';

import {dispatchEvent, el} from '../../../testing/src/browser_util';


describe('UniqueInputEventPlugin', () => {
  if (isNode) return;

  let doc: any;
  let inputElement: HTMLInputElement;
  beforeEach(() => {
    doc = getDOM().supportsDOMEvents() ? document : getDOM().createHtmlDocument();
    inputElement = el('<input type="text">') as HTMLInputElement;
  });

  it('should work only if config is provided', () => {
    const pluginWithoutConfig = new UniqueInputEventPlugin(doc);
    expect(pluginWithoutConfig.supports('input')).toBe(false);

    const pluginWithConfig = new UniqueInputEventPlugin(doc, {});
    expect(pluginWithConfig.supports('input')).toBe(true);
  });

  it('should work only on elements which are allowed by config', () => {
    const plugin = new UniqueInputEventPlugin(doc, {
      shouldApplyToElement: (element: Element) => element instanceof HTMLInputElement,
      shouldTrustEvent: () => false,
    });

    const enabledHandler = jasmine.createSpy('enabledHandler');
    plugin.addEventListener(inputElement, 'input', enabledHandler);
    dispatchEvent(inputElement, 'input');
    expect(enabledHandler).not.toHaveBeenCalled();

    const disabledHandler = jasmine.createSpy('enabledHandler');
    const textAreaElement = el('<textarea></textarea>');
    plugin.addEventListener(textAreaElement, 'input', disabledHandler);
    dispatchEvent(textAreaElement, 'input');
    expect(disabledHandler).toHaveBeenCalled();
  });

  it('should trust events which are allowed by config', () => {
    const trustAllPlugin = new UniqueInputEventPlugin(doc, {
      shouldTrustEvent: () => true,
    });
    const enabledHandler = jasmine.createSpy('enabledHandler');
    trustAllPlugin.addEventListener(inputElement, 'input', enabledHandler);
    dispatchEvent(inputElement, 'input');
    expect(enabledHandler).toHaveBeenCalled();

    const trustNonePlugin = new UniqueInputEventPlugin(doc, {
      shouldTrustEvent: () => false,
    });
    const disabledHandler = jasmine.createSpy('enabledHandler');
    trustNonePlugin.addEventListener(inputElement, 'input', enabledHandler);
    dispatchEvent(inputElement, 'input');
    expect(disabledHandler).not.toHaveBeenCalled();
  });


  describe('input event', () => {
    let plugin: UniqueInputEventPlugin;
    let handler: (event: Event) => void;
    beforeEach(() => {
      plugin = new UniqueInputEventPlugin(doc, {
        shouldTrustEvent: () => false,
      });
      handler = jasmine.createSpy('handler');
    });

    it('should not fire input event when value is not changed', () => {
      plugin.addEventListener(inputElement, 'input', handler);
      dispatchEvent(inputElement, 'input');
      expect(handler).not.toHaveBeenCalled();
    });

    it('should fire input event when value is changed after listener added', () => {
      inputElement.value = '1';
      plugin.addEventListener(inputElement, 'input', handler);
      inputElement.value = '2';
      dispatchEvent(inputElement, 'input');
      expect(handler).toHaveBeenCalled();
    });

    it('should fire input event when value changed by keyboard event', () => {
      inputElement.value = '1';
      plugin.addEventListener(inputElement, 'input', handler);
      inputElement.value = '2';
      dispatchEvent(inputElement, 'keydown');
      inputElement.value = '3';
      dispatchEvent(inputElement, 'input');
      expect(handler).toHaveBeenCalled();
    });

    it('should fire input event when value changed by input event', () => {
      inputElement.value = '1';
      plugin.addEventListener(inputElement, 'input', handler);
      inputElement.value = '2';
      dispatchEvent(inputElement, 'input');
      inputElement.value = '3';
      dispatchEvent(inputElement, 'input');
      expect(handler).toHaveBeenCalled();
    });
  });
});
