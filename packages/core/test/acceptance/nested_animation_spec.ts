/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, signal, ViewEncapsulation, OnDestroy, destroyPlatform} from '@angular/core';
import {TestBed, fakeAsync, tick} from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {tickAnimationFrames} from '../animation_utils/tick_animation_frames';

describe('Nested animate.leave', () => {
  beforeEach(() => {
    destroyPlatform();
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(
      [BrowserTestingModule, NoopAnimationsModule],
      platformBrowserTesting(),
    );
  });

  it('should wait for nested animations inside @if', fakeAsync(() => {
    const styles = `
      .fade {
        animation: fade-out 500ms;
      }
      @keyframes fade-out {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;

    @Component({
      selector: 'test-cmp',
      template: `
        <div>
          @if (show()) {
            <div class="parent">
              <div animate.leave="fade" class="child">Child</div>
            </div>
          }
        </div>
      `,
      styles: [styles],
      encapsulation: ViewEncapsulation.None,
    })
    class TestCmp {
      show = signal(true);
    }

    TestBed.configureTestingModule({animationsEnabled: true});
    const fixture = TestBed.createComponent(TestCmp);
    const cmp = fixture.componentInstance;
    fixture.detectChanges();

    const child = fixture.nativeElement.querySelector('.child');
    expect(child).toBeTruthy();

    cmp.show.set(false);
    fixture.detectChanges();
    tickAnimationFrames(1);

    // In current Angular, this likely fails immediately because parent is removed, taking child with it.
    // We expect child to remain if we support nested animations.
    const childAfter = fixture.nativeElement.querySelector('.child');

    // This expectation confirms if it works or fails.
    // If it works, childAfter is NOT null.
    // If it fails (current behavior), childAfter IS null.

    // We want to prove it fails currently, so we expect rejection or we just assert strict truth.
    // I will use strict truth to demonstrate failure.
    expect(childAfter).withContext('Child element should persist during animation').not.toBeNull();
    if (childAfter) {
      expect(childAfter.classList.contains('fade'))
        .withContext('Child should get animation class')
        .toBeTruthy();

      // Simulate end
      childAfter.dispatchEvent(new AnimationEvent('animationend', {animationName: 'fade-out'}));
      tick();
    }
  }));

  it('should support nested host bindings', fakeAsync(() => {
    const styles = `
      .fade {
        animation: fade-out 500ms;
      }
      @keyframes fade-out {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;

    @Component({
      selector: 'fade-cmp',
      host: {'animate.leave': 'fade'},
      template: '<p>I should fade</p>',
      encapsulation: ViewEncapsulation.None,
    })
    class FadeComponent {}

    @Component({
      selector: 'test-cmp',
      styles: [styles],
      imports: [FadeComponent],
      template: `
        <div>
          @if (show()) {
            <div class="parent">
              <fade-cmp class="child" />
            </div>
          }
        </div>
      `,
      encapsulation: ViewEncapsulation.None,
    })
    class TestCmp {
      show = signal(true);
    }

    TestBed.configureTestingModule({animationsEnabled: true});
    const fixture = TestBed.createComponent(TestCmp);
    const cmp = fixture.componentInstance;
    fixture.detectChanges();

    const child = fixture.nativeElement.querySelector('.child');
    expect(child).toBeTruthy();

    cmp.show.set(false);
    fixture.detectChanges();
    tickAnimationFrames(1);

    const childAfter = fixture.nativeElement.querySelector('.child');
    expect(childAfter).withContext('Child element should persist during animation').not.toBeNull();

    if (childAfter) {
      expect(childAfter.classList.contains('fade'))
        .withContext('Child should get animation class from host binding')
        .toBeTruthy();

      childAfter.dispatchEvent(new AnimationEvent('animationend', {animationName: 'fade-out'}));
      tick();

      const childFinal = fixture.nativeElement.querySelector('.child');
      expect(childFinal).toBeNull();
    }
  }));

  it('should support nested function syntax', fakeAsync(() => {
    let completeFn: Function | undefined;
    @Component({
      selector: 'test-cmp',
      template: `
        <div>
          @if (show()) {
            <div class="parent">
              <div (animate.leave)="animateFn($event)" class="child">Child</div>
            </div>
          }
        </div>
      `,
      encapsulation: ViewEncapsulation.None,
    })
    class TestCmp {
      show = signal(true);
      animateFn = (event: any) => {
        event.target.classList.add('custom-anim');
        completeFn = event.animationComplete;
      };
    }

    TestBed.configureTestingModule({animationsEnabled: true});
    const fixture = TestBed.createComponent(TestCmp);
    const cmp = fixture.componentInstance;
    fixture.detectChanges();

    cmp.show.set(false);
    fixture.detectChanges();
    tickAnimationFrames(1);

    const childAfter = fixture.nativeElement.querySelector('.child');
    expect(childAfter).withContext('Child element should persist during animation').not.toBeNull();

    if (childAfter) {
      expect(childAfter.classList.contains('custom-anim'))
        .withContext('Child should get class from animation function')
        .toBeTruthy();

      expect(completeFn).withContext('animationComplete should be captured').toBeDefined();
      completeFn!();

      tick();
      const childFinal = fixture.nativeElement.querySelector('.child');
      expect(childFinal).toBeNull();
    }
  }));

  it('should support nested animate.leave with component host binding (GitHub #66476)', fakeAsync(() => {
    // Reproduction from https://github.com/angular/angular/issues/66476
    // Structure: Host -> @if -> Child -> Popup (with host animation)

    const styles = `
      .popup-overlay {
        animation: fade-in 0.3s;
      }
      .popup-overlay-leave {
        animation: fade-out 0.3s;
      }
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes fade-out {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;

    @Component({
      selector: 'app-popup',
      template: `
        <div class="popup-overlay" animate.leave="popup-overlay-leave">
          <div class="popup">
            <ng-content></ng-content>
          </div>
        </div>
      `,
      styles: [styles],
      encapsulation: ViewEncapsulation.None,
      host: {
        '(animate.leave)': 'animateLeave($event)',
      },
    })
    class PopupComponent {
      animateLeave(event: any) {
        // In the issue, they use setTimeout to call animationComplete.
        // We simulate this async completion.
        setTimeout(() => event.animationComplete(), 300);
      }
    }

    @Component({
      selector: 'app-child',
      template: ` <app-popup> Projected content. </app-popup> `,
      imports: [PopupComponent],
    })
    class ChildComponent {}

    @Component({
      selector: 'app-host',
      template: `
        @if (showChild()) {
          <app-child></app-child>
        }
      `,
      imports: [ChildComponent],
    })
    class HostComponent {
      showChild = signal(true);
    }

    TestBed.configureTestingModule({animationsEnabled: true});
    const fixture = TestBed.createComponent(HostComponent);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    const popup = fixture.nativeElement.querySelector('app-popup');
    expect(popup).toBeTruthy();

    host.showChild.set(false);
    fixture.detectChanges();
    tickAnimationFrames(1);

    const popupAfter = fixture.nativeElement.querySelector('app-popup');
    expect(popupAfter).withContext('Popup should persist due to host animation').not.toBeNull();

    // Advance time for the setTimeout in animateLeave
    tick(300);

    // The nested animation needs to complete as well.
    // Query the nested element (popup overlay) that has the animation.
    const popupOverlay = fixture.nativeElement.querySelector('.popup-overlay');
    if (popupOverlay) {
      popupOverlay.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-out', bubbles: true}),
      );
      tick();
    }

    // Attempt to verify removal
    const popupFinal = fixture.nativeElement.querySelector('app-popup');
    expect(popupFinal).toBeFalsy();
  }));

  it('should not throw "Injector destroyed" when a parent with leave animations is destroyed with nested components', async () => {
    @Component({
      selector: 'child-comp',
      standalone: true,
      template: '<div>Child</div>',
    })
    class ChildComp implements OnDestroy {
      ngOnDestroy() {}
    }

    @Component({
      selector: 'parent-comp',
      standalone: true,
      imports: [ChildComp],
      template: `
        <div animate.leave="leaving">
          <child-comp />
        </div>
      `,
    })
    class ParentComp {
      leaving = () => ({promise: Promise.resolve()});
    }

    TestBed.configureTestingModule({});

    const fixture = TestBed.createComponent(ParentComp);
    fixture.detectChanges();

    // Before the fix, the framework would recursively dive into ChildComp's
    // internal view to collect animations. During a full destruction of the
    // component tree, this could lead to starting animations or async tasks
    // that resolve after the component's injector is already gone.
    fixture.destroy();

    // If we reach here without an exception, the regression is prevented.
  });

  it('should still support nested animations within the same template', () => {
    // This test ensures that while we stopped recursing into component views,
    // we still support nested elements within the same view having animations.

    @Component({
      selector: 'nested-view-comp',
      standalone: true,
      template: `
        <div animate.leave="leaving">
          @if (showNested) {
            <div animate.leave="leaving">Nested</div>
          }
        </div>
      `,
    })
    class NestedViewComp {
      showNested = true;
      leaving = () => ({promise: Promise.resolve()});
    }

    TestBed.configureTestingModule({});

    const fixture = TestBed.createComponent(NestedViewComp);
    fixture.detectChanges();

    // This should not throw and correctly handle the nested animations.
    fixture.destroy();
  });
});
