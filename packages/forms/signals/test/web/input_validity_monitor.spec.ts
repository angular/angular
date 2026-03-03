/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {InputValidityMonitor} from '../../src/directive/input_validity_monitor';

describe('InputValidityMonitor', () => {
  let monitor: InputValidityMonitor;

  beforeEach(() => {
    monitor = TestBed.inject(InputValidityMonitor);
  });

  describe('Document injected styles', () => {
    it('appends exactly one <style> tag to document.head when tracking multiple inputs', () => {
      const input1 = document.createElement('input');
      const input2 = document.createElement('input');

      // Add to body so element.getRootNode() === document
      document.body.appendChild(input1);
      document.body.appendChild(input2);

      const initialStyleCount = document.head.querySelectorAll('style').length;

      monitor.watchValidity(input1, () => {});
      const stylesAfterFirst = document.head.querySelectorAll('style').length;
      expect(stylesAfterFirst).toBe(initialStyleCount + 1);

      monitor.watchValidity(input2, () => {});
      const stylesAfterSecond = document.head.querySelectorAll('style').length;
      expect(stylesAfterSecond).toBe(initialStyleCount + 1); // Deduped, count should not increase

      document.body.removeChild(input1);
      document.body.removeChild(input2);
    });

    it('removes the <style> from document.head upon destruction', () => {
      const input = document.createElement('input');
      document.body.appendChild(input);

      const initialStyleCount = document.head.querySelectorAll('style').length;

      monitor.watchValidity(input, () => {});
      expect(document.head.querySelectorAll('style').length).toBe(initialStyleCount + 1);

      (monitor as any).ngOnDestroy();
      expect(document.head.querySelectorAll('style').length).toBe(initialStyleCount);

      document.body.removeChild(input);
    });
  });

  describe('Shadow DOM injected styles', () => {
    it('appends exactly one <style> tag to a ShadowRoot when tracking multiple inputs inside it', () => {
      const host = document.createElement('div');
      document.body.appendChild(host);
      const targetShadowRoot = host.attachShadow({mode: 'open'});

      const input1 = document.createElement('input');
      const input2 = document.createElement('input');
      targetShadowRoot.appendChild(input1);
      targetShadowRoot.appendChild(input2);

      // Verify no styles are present
      expect(targetShadowRoot.querySelectorAll('style').length).toBe(0);

      monitor.watchValidity(input1, () => {});
      expect(targetShadowRoot.querySelectorAll('style').length).toBe(1);

      monitor.watchValidity(input2, () => {});
      expect(targetShadowRoot.querySelectorAll('style').length).toBe(1); // Deduped

      document.body.removeChild(host);
    });

    it('tracks styles across different ShadowRoots independently without duplicating', () => {
      const host1 = document.createElement('div');
      const targetShadowRoot1 = host1.attachShadow({mode: 'open'});
      const input1 = document.createElement('input');
      targetShadowRoot1.appendChild(input1);

      const host2 = document.createElement('div');
      const targetShadowRoot2 = host2.attachShadow({mode: 'open'});
      const input2 = document.createElement('input');
      targetShadowRoot2.appendChild(input2);

      document.body.appendChild(host1);
      document.body.appendChild(host2);

      monitor.watchValidity(input1, () => {});
      monitor.watchValidity(input2, () => {});

      expect(targetShadowRoot1.querySelectorAll('style').length).toBe(1);
      expect(targetShadowRoot2.querySelectorAll('style').length).toBe(1);

      document.body.removeChild(host1);
      document.body.removeChild(host2);
    });
  });
  describe('isBadInput', () => {
    it('should return false when validity.badInput is not set or false', () => {
      const element = document.createElement('input');
      expect(monitor.isBadInput(element)).toBe(false);

      const input = document.createElement('input');
      expect(monitor.isBadInput(input)).toBe(false);
    });

    it('should return value of validity.badInput when available', () => {
      // Create a fake element that simulates the `validity` property
      // since we cannot programmatically set `.validity.badInput` on a real DOM node here without an actual user event
      const fakeInput = {
        validity: {
          badInput: true,
        },
      } as unknown as HTMLInputElement;
      expect(monitor.isBadInput(fakeInput)).toBe(true);
    });
  });
});
