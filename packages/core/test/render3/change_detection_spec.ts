/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '../../testing';
import {withBody} from '@angular/private/testing';

import {Component, RendererFactory2} from '../../src/core';

describe('change detection', () => {
  it(
    'should call begin and end when the renderer factory implements them',
    withBody('<my-comp></my-comp>', () => {
      const log: string[] = [];
      @Component({
        selector: 'my-comp',
        template: '{{ value }}',
      })
      class MyComponent {
        get value(): string {
          log.push('detect changes');
          return 'works';
        }
      }

      const rendererFactory = TestBed.inject(RendererFactory2);
      rendererFactory.begin = () => log.push('begin');
      rendererFactory.end = () => log.push('end');

      const fixture = TestBed.createComponent(MyComponent);
      log.length = 0;
      fixture.changeDetectorRef.detectChanges();

      expect(fixture.nativeElement.innerHTML).toEqual('works');

      expect(log).toEqual([
        'begin',
        'detect changes', // regular change detection cycle
        'end',
      ]);
    }),
  );
});
