/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, DebugElement, ElementRef, viewChild} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {SplitAreaDirective, SplitComponent} from '../../vendor/angular-split/public_api';
import {ResponsiveSplitConfig, ResponsiveSplitDirective} from './responsive-split.directive';

@Component({
  selector: 'ng-test-cmp',
  imports: [SplitComponent, SplitAreaDirective, ResponsiveSplitDirective],
  template: `
    <as-split #host [ngResponsiveSplit]="config">
      <as-split-area>
        <p>Foo</p>
      </as-split-area>
      <as-split-area>
        <p>Bar</p>
      </as-split-area>
    </as-split>
  `,
})
class TestComponent {
  readonly split = viewChild.required(SplitComponent);
  readonly host = viewChild.required<ElementRef>('host');

  readonly config: ResponsiveSplitConfig = {
    defaultDirection: 'horizontal',
    aspectRatioBreakpoint: 1.5,
    breakpointDirection: 'vertical',
  };
}

function initTestComponent(
  width: number,
  height: number,
): {host: DebugElement; split: SplitComponent} {
  TestBed.configureTestingModule({
    imports: [TestComponent, SplitComponent, SplitAreaDirective, ResponsiveSplitDirective],
  });
  const fixture = TestBed.createComponent(TestComponent);

  const host = fixture.debugElement.query(By.css('as-split'));
  const split = host.componentInstance;

  host.nativeElement.style.width = width + 'px';
  host.nativeElement.style.height = height + 'px';

  fixture.detectChanges();

  return {
    host,
    split,
  };
}

describe('responsive-split', () => {
  it('should use horizontal direction (ratio == 1)', () => {
    const {split} = initTestComponent(200, 200);

    expect(split.direction).toEqual('horizontal');
  });

  it('should use horizontal direction (ratio == 1.49)', () => {
    const {split} = initTestComponent(299, 200);

    expect(split.direction).toEqual('horizontal');
  });

  it('should use vertical direction (ratio == 1.5)', () => {
    const {split} = initTestComponent(350, 200);

    expect(split.direction).toEqual('vertical');
  });

  it('should use vertical direction (ratio == 2)', () => {
    const {split} = initTestComponent(400, 200);

    expect(split.direction).toEqual('vertical');
  });
});
