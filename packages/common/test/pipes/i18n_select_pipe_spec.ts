/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {I18nSelectPipe} from '@angular/common';
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';

{
  describe('I18nSelectPipe', () => {
    const pipe: I18nSelectPipe = new I18nSelectPipe();
    const mapping = {'male': 'Invite him.', 'female': 'Invite her.', 'other': 'Invite them.'};

    describe('transform', () => {
      it('should return the "male" text if value is "male"', () => {
        const val = pipe.transform('male', mapping);
        expect(val).toEqual('Invite him.');
      });

      it('should return the "female" text if value is "female"', () => {
        const val = pipe.transform('female', mapping);
        expect(val).toEqual('Invite her.');
      });

      it('should return the "other" text if value is neither "male" nor "female"', () => {
        expect(pipe.transform('Anything else', mapping)).toEqual('Invite them.');
      });

      it('should return an empty text if value is null or undefined', () => {
        expect(pipe.transform(null, mapping)).toEqual('');
        expect(pipe.transform(void 0, mapping)).toEqual('');
      });

      it('should throw on bad arguments', () => {
        expect(() => pipe.transform('male', 'hey' as any)).toThrowError();
      });

      it('should be available as a standalone pipe', () => {
        @Component({
          selector: 'test-component',
          imports: [I18nSelectPipe],
          template: '{{ value | i18nSelect:mapping }}',
          standalone: true,
        })
        class TestComponent {
          value = 'other';
          mapping = mapping;
        }

        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();

        const content = fixture.nativeElement.textContent;
        expect(content).toBe('Invite them.');
      });
    });
  });
}
