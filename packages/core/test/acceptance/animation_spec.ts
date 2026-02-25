/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgFor} from '@angular/common';
import {ViewEncapsulation} from '@angular/compiler';
import {
  AfterViewInit,
  AnimationCallbackEvent,
  ApplicationRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  createComponent as createComponentFn,
  createEnvironmentInjector,
  Directive,
  ElementRef,
  EnvironmentInjector,
  ErrorHandler,
  inject,
  NgModule,
  OnDestroy,
  provideZonelessChangeDetection,
  signal,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {isNode} from '@angular/private/testing';
import {tickAnimationFrames} from '../animation_utils/tick_animation_frames';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ComponentRef} from '@angular/core/src/render3';

@NgModule({
  providers: [provideZonelessChangeDetection()],
})
export class TestModule {}

describe('Animation', () => {
  if (isNode) {
    it('should pass', () => expect(true).toBe(true));
    return;
  }

  beforeEach(() => {
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment([BrowserTestingModule, TestModule], platformBrowserTesting());
  });

  afterEach(() => {
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(
      [BrowserTestingModule, NoopAnimationsModule, TestModule],
      platformBrowserTesting(),
    );
  });

  afterAll(() => {
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(
      [BrowserTestingModule, NoopAnimationsModule, TestModule],
      platformBrowserTesting(),
    );
  });

  describe('animate.leave', () => {
    const styles = `
    .fade {
      animation: fade-out 1ms;
    }
    @keyframes fade-out {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
    `;

    it('should delay element removal when an animation is specified', fakeAsync(() => {
      const logSpy = jasmine.createSpy('logSpy');
      @Component({
        selector: 'test-cmp',
        styles: styles,
        template:
          '<div>@if (show()) {<p animate.leave="fade" (animationend)="logMe($event)">I should fade</p>}</div>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(true);

        logMe(event: AnimationEvent) {
          logSpy();
        }
      }

      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      const paragragh = fixture.debugElement.query(By.css('p'));

      expect(fixture.nativeElement.outerHTML).not.toContain('class="fade"');
      cmp.show.set(false);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.show()).toBeFalsy();
      fixture.detectChanges();
      expect(fixture.nativeElement.outerHTML).toContain('class="fade"');
      fixture.detectChanges();
      paragragh.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-out'}),
      );
      tick();
      expect(fixture.nativeElement.outerHTML).not.toContain('class="fade"');
      expect(logSpy).toHaveBeenCalled();
    }));

    it('should remove right away when animations are disabled', fakeAsync(() => {
      @Component({
        selector: 'test-cmp',
        styles: styles,
        template: '<div>@if (show()) {<p animate.leave="fade" #el>I should fade</p>}</div>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(true);
        @ViewChild('el', {read: ElementRef}) el!: ElementRef<HTMLParagraphElement>;
      }

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      cmp.show.set(false);
      tickAnimationFrames(1);
      fixture.detectChanges();
      expect(cmp.show()).toBeFalsy();
      expect(cmp.el).toBeUndefined();
    }));

    it('should remove right away when classes have no animations', fakeAsync(() => {
      @Component({
        selector: 'test-cmp',
        styles: styles,
        template: '<div>@if (show()) {<p animate.leave="not-a-class" #el>I should fade</p>}</div>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(true);
        @ViewChild('el', {read: ElementRef}) el!: ElementRef<HTMLParagraphElement>;
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      cmp.show.set(false);
      tickAnimationFrames(1);
      fixture.detectChanges();
      expect(cmp.show()).toBeFalsy();
      expect(cmp.el).toBeUndefined();
    }));

    it('should support string arrays', fakeAsync(() => {
      const multiple = `
        .slide-out {
          animation: slide-out 2ms;
        }
        .fade {
          animation: fade-out 1ms;
        }
        @keyframes slide-out {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(10px);
          }
        }
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `;
      @Component({
        selector: 'test-cmp',
        styles: multiple,
        template:
          '<div>@if (show()) {<p [animate.leave]="classArray" #el>I should slide out</p>}</div>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(true);
        classArray = ['slide-out', 'fade'];
        @ViewChild('el', {read: ElementRef}) el!: ElementRef<HTMLParagraphElement>;
      }

      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      const paragragh = fixture.debugElement.query(By.css('p'));

      expect(fixture.nativeElement.outerHTML).not.toContain('class="slide-out fade"');
      cmp.show.set(false);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.show()).toBeFalsy();
      fixture.detectChanges();
      expect(fixture.nativeElement.outerHTML).toContain('class="slide-out fade"');
      fixture.detectChanges();
      paragragh.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-out'}),
      );
      paragragh.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'slide-out'}),
      );
      tick();
      expect(fixture.nativeElement.outerHTML).not.toContain('class="slide-out fade"');
    }));

    it('should support binding strings with spaces', fakeAsync(() => {
      const multiple = `
        .slide-out {
          animation: slide-out 2ms;
        }
        .fade {
          animation: fade-out 1ms;
        }
        @keyframes slide-out {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(10px);
          }
        }
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `;
      @Component({
        selector: 'test-cmp',
        styles: multiple,
        template: `<div>
          @if (show()) {
            <p [animate.leave]="'slide-out fade'" #el>I should slide out</p>
          }
        </div>`,
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(true);
        @ViewChild('el', {read: ElementRef}) el!: ElementRef<HTMLParagraphElement>;
      }

      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      const paragragh = fixture.debugElement.query(By.css('p'));

      expect(fixture.nativeElement.outerHTML).not.toContain('class="slide-out fade"');
      cmp.show.set(false);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.show()).toBeFalsy();
      fixture.detectChanges();
      expect(fixture.nativeElement.outerHTML).toContain('class="slide-out fade"');
      fixture.detectChanges();
      paragragh.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-out'}),
      );
      paragragh.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'slide-out'}),
      );
      tick();
      expect(fixture.nativeElement.outerHTML).not.toContain('class="slide-out fade"');
    }));

    it('should support multiple classes as a single string with spaces', fakeAsync(() => {
      const multiple = `
        .slide-out {
          animation: slide-out 2ms;
        }
        .fade {
          animation: fade-out 1ms;
        }
        @keyframes slide-out {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(10px);
          }
        }
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `;
      @Component({
        selector: 'test-cmp',
        styles: multiple,
        template:
          '<div>@if (show()) {<p animate.leave="slide-out fade" #el>I should slide out</p>}</div>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(true);
        @ViewChild('el', {read: ElementRef}) el!: ElementRef<HTMLParagraphElement>;
      }

      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      const paragragh = fixture.debugElement.query(By.css('p'));

      expect(fixture.nativeElement.outerHTML).not.toContain('class="slide-out fade"');
      cmp.show.set(false);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.show()).toBeFalsy();
      fixture.detectChanges();
      expect(fixture.nativeElement.outerHTML).toContain('class="slide-out fade"');
      fixture.detectChanges();
      paragragh.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-out'}),
      );
      paragragh.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'slide-out'}),
      );
      tick();
      expect(fixture.nativeElement.outerHTML).not.toContain('class="slide-out fade"');
    }));

    it('should support function syntax', fakeAsync(() => {
      @Component({
        selector: 'test-cmp',
        styles: styles,
        template:
          '<div>@if (show()) {<p (animate.leave)="animateFn($event)" class="slide-in" #el>I should slide out</p>}</div>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(true);
        animateFn = (event: AnimationCallbackEvent) => {
          event.target.classList.remove('slide-in');
        };
        @ViewChild('el', {read: ElementRef}) el!: ElementRef<HTMLParagraphElement>;
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      cmp.show.set(false);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.show()).toBeFalsy();
      expect(fixture.debugElement.nativeElement.outerHTML).not.toContain('class="slide-in"');
    }));

    it('should be host bindable', fakeAsync(() => {
      @Component({
        selector: 'fade-cmp',
        host: {'animate.leave': 'fade'},
        template: '<p>I should fade</p>',
        encapsulation: ViewEncapsulation.None,
      })
      class FadeComponent {}

      @Component({
        selector: 'test-cmp',
        styles: styles,
        imports: [FadeComponent],
        template: '@if (show()) { <fade-cmp /> }',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(true);
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      const fadeCmp = fixture.debugElement.query(By.css('fade-cmp'));

      expect(fixture.nativeElement.outerHTML).not.toContain('class="fade"');
      cmp.show.set(false);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.show()).toBeFalsy();
      expect(fixture.nativeElement.outerHTML).toContain('class="fade"');
      fixture.detectChanges();
      fadeCmp.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-out'}),
      );
      tick();
      expect(fixture.nativeElement.outerHTML).not.toContain('class="fade"');
    }));

    it('should be host bindable with brackets', fakeAsync(() => {
      @Component({
        selector: 'fade-cmp',
        host: {'[animate.leave]': 'fade()'},
        template: '<p>I should fade</p>',
        encapsulation: ViewEncapsulation.None,
      })
      class FadeComponent {
        fade = signal('fade');
      }

      @Component({
        selector: 'test-cmp',
        styles: styles,
        imports: [FadeComponent],
        template: '@if (show()) { <fade-cmp /> }',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(true);
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      const fadeCmp = fixture.debugElement.query(By.css('fade-cmp'));

      expect(fixture.nativeElement.outerHTML).not.toContain('class="fade"');
      cmp.show.set(false);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.show()).toBeFalsy();
      expect(fixture.nativeElement.outerHTML).toContain('class="fade"');
      fixture.detectChanges();
      fadeCmp.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-out'}),
      );
      tick();
      expect(fixture.nativeElement.outerHTML).not.toContain('class="fade"');
    }));

    it('should be host bindable with events', fakeAsync(() => {
      const fadeCalled = jasmine.createSpy('fadeCalled');
      @Component({
        selector: 'fade-cmp',
        styles: styles,
        host: {'(animate.leave)': 'fadeIn($event)'},
        template: '<p>I should fade</p>',
        encapsulation: ViewEncapsulation.None,
      })
      class FadeComponent {
        fadeIn(event: AnimationCallbackEvent) {
          fadeCalled();
          event.target.classList.add('fade');
          event.animationComplete();
        }
      }

      @Component({
        selector: 'test-cmp',
        imports: [FadeComponent],
        template: '@if (show()) { <fade-cmp /> }',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(true);
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();

      expect(fixture.nativeElement.outerHTML).not.toContain('class="fade"');
      cmp.show.set(false);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.show()).toBeFalsy();
      fixture.detectChanges();
      expect(fadeCalled).toHaveBeenCalled();
    }));

    it('should compose class list when host binding and regular binding', fakeAsync(() => {
      const multiple = `
        .slide-out {
          animation: slide-out 2ms;
        }
        .fade {
          animation: fade-out 1ms;
        }
        @keyframes slide-out {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(10px);
          }
        }
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `;
      @Component({
        selector: 'child-cmp',
        host: {'[animate.leave]': 'slide()'},
        template: '<p>I should fade</p>',
        encapsulation: ViewEncapsulation.None,
      })
      class ChildComponent {
        slide = signal('slide-out');
      }

      @Component({
        selector: 'test-cmp',
        styles: multiple,
        imports: [ChildComponent],
        template: '@if (show()) { <child-cmp [animate.leave]="fadeExp" /> }',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        fadeExp = 'fade';
        show = signal(true);
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      const childCmp = fixture.debugElement.query(By.css('child-cmp'));

      expect(childCmp.nativeElement.className).not.toContain('fade');
      expect(childCmp.nativeElement.className).not.toContain('slide-out');
      cmp.show.set(false);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.show()).toBeFalsy();
      expect(childCmp.nativeElement.className).toContain('fade');
      expect(childCmp.nativeElement.className).toContain('slide-out');

      childCmp.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-out'}),
      );
      childCmp.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'slide-out'}),
      );
      tick();

      expect(fixture.nativeElement.outerHTML).not.toContain('fade');
      expect(fixture.nativeElement.outerHTML).not.toContain('slide-out');
      expect(fixture.debugElement.query(By.css('child-cmp'))).toBeNull();
    }));

    it('should compose class list when host binding on a directive and regular binding', fakeAsync(() => {
      const multiple = `
        .slide-out {
          animation: slide-out 2ms;
        }
        .fade {
          animation: fade-out 1ms;
        }
        @keyframes slide-out {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(10px);
          }
        }
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `;
      @Directive({
        selector: '[dir]',
        host: {'[animate.leave]': 'clazz'},
      })
      class StuffDirective {
        clazz = 'slide-out';
      }

      @Component({
        selector: 'child-cmp',
        styles: multiple,
        template: '<p>I should fade</p>',
        encapsulation: ViewEncapsulation.None,
      })
      class ChildComponent {}

      @Component({
        selector: 'test-cmp',
        styles: multiple,
        imports: [ChildComponent, StuffDirective],
        template: '@if (show()) { <child-cmp dir /> }',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(true);
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      const childCmp = fixture.debugElement.query(By.css('child-cmp'));

      expect(childCmp.nativeElement.className).not.toContain('slide-out');
      cmp.show.set(false);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.show()).toBeFalsy();
      fixture.detectChanges();
      expect(childCmp.nativeElement.className).toContain('slide-out');
      fixture.detectChanges();

      childCmp.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'slide-out'}),
      );
      tick();
      expect(fixture.nativeElement.outerHTML).not.toContain('slide-out');
      expect(fixture.debugElement.query(By.css('child-cmp'))).toBeNull();
    }));

    it('should compose class list when host binding a string and regular class strings', fakeAsync(() => {
      const multiple = `
        .slide-out {
          animation: slide-out 2ms;
        }
        .fade {
          animation: fade-out 1ms;
        }
        @keyframes slide-out {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(10px);
          }
        }
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `;
      @Component({
        selector: 'child-cmp',
        host: {'animate.leave': 'slide-out'},
        template: '<p>I should fade</p>',
        encapsulation: ViewEncapsulation.None,
      })
      class ChildComponent {}

      @Component({
        selector: 'test-cmp',
        styles: multiple,
        imports: [ChildComponent],
        template: '@if (show()) { <child-cmp animate.leave="fade" /> }',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(true);
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      const childCmp = fixture.debugElement.query(By.css('child-cmp'));

      expect(childCmp.nativeElement.className).not.toContain('slide-out fade');
      cmp.show.set(false);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.show()).toBeFalsy();
      fixture.detectChanges();
      expect(childCmp.nativeElement.className).toContain('slide-out fade');
      fixture.detectChanges();

      childCmp.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-out'}),
      );
      childCmp.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'slide-out'}),
      );

      expect(fixture.nativeElement.outerHTML).not.toContain('slide-out fade ');
      expect(fixture.debugElement.query(By.css('child-cmp'))).toBeNull();
    }));

    it('should await the longest animation when multiple transitions are present', fakeAsync(() => {
      const multiple = `
        .slide-out {
          grid-template-rows: 0fr;
          overflow: hidden;
          opacity: 0;
          translate: 0 -60px;
          margin-top: -16px;
          transition: grid-template-rows 1s ease 400ms, margin-top 1s ease 400ms,
            opacity 400ms ease, translate 400ms ease;
        }
      `;
      @Component({
        selector: 'test-cmp',
        styles: multiple,
        template: '@if (show()) { <div animate.leave="slide-out"><p>Element with text</p></div> }',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(true);
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      const div = fixture.debugElement.query(By.css('div'));

      expect(div.nativeElement.className).not.toContain('slide-out');
      cmp.show.set(false);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.show()).toBeFalsy();
      fixture.detectChanges();
      expect(div.nativeElement.className).toContain('slide-out');
      fixture.detectChanges();

      div.nativeElement.dispatchEvent(
        new TransitionEvent('transitionend', {propertyName: 'opacity'}),
      );
      div.nativeElement.dispatchEvent(
        new TransitionEvent('transitionend', {propertyName: 'translate'}),
      );

      expect(fixture.nativeElement.outerHTML).toContain('slide-out');

      div.nativeElement.dispatchEvent(
        new TransitionEvent('transitionend', {propertyName: 'margin-top'}),
      );
      div.nativeElement.dispatchEvent(
        new TransitionEvent('transitionend', {propertyName: 'grid-template-rows'}),
      );
      tick();
      expect(fixture.nativeElement.outerHTML).not.toContain('slide-out');
      expect(fixture.debugElement.query(By.css('div'))).toBeNull();
    }));

    describe('legacy animations compatibility', () => {
      beforeAll(() => {
        TestBed.resetTestEnvironment();
        TestBed.initTestEnvironment(
          [BrowserTestingModule, NoopAnimationsModule, TestModule],
          platformBrowserTesting(),
        );
      });

      const styles = `
      .fade {
        animation: fade-out 1ms;
      }
      @keyframes fade-out {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
      `;

      it('should have the same exact timing when AnimationsModule is present', fakeAsync(() => {
        const logSpy = jasmine.createSpy('logSpy');
        @Component({
          selector: 'test-cmp',
          styles: styles,
          template:
            '<div>@if (show()) {<p animate.leave="fade" (animationend)="logMe($event)">I should fade</p>}</div>',
          encapsulation: ViewEncapsulation.None,
        })
        class TestComponent {
          show = signal(true);

          logMe(event: AnimationEvent) {
            logSpy();
          }
        }

        TestBed.configureTestingModule({animationsEnabled: true});

        const fixture = TestBed.createComponent(TestComponent);
        const cmp = fixture.componentInstance;
        fixture.detectChanges();
        const paragragh = fixture.debugElement.query(By.css('p'));

        expect(fixture.nativeElement.outerHTML).not.toContain('class="fade"');
        cmp.show.set(false);
        fixture.detectChanges();
        tickAnimationFrames(1);
        expect(cmp.show()).toBeFalsy();
        fixture.detectChanges();
        expect(fixture.nativeElement.outerHTML).toContain('class="fade"');
        fixture.detectChanges();
        paragragh.nativeElement.dispatchEvent(
          new AnimationEvent('animationend', {animationName: 'fade-out'}),
        );
        tick();
        expect(fixture.nativeElement.outerHTML).not.toContain('class="fade"');
        expect(logSpy).toHaveBeenCalled();
      }));
    });

    it('should not remove an element when it is moved in a @for loop (simulated CDK drag)', fakeAsync(() => {
      @Component({
        selector: 'test-cmp',
        template: `
          <div>
            @for (item of items(); track item) {
              <p animate.leave="fade" class="item">{{ item }}</p>
            }
          </div>
        `,
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        items = signal([1, 2, 3]);
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();

      let paragraphs = fixture.debugElement.queryAll(By.css('p'));
      expect(paragraphs.length).toBe(3);
      expect(paragraphs[0].nativeElement.textContent).toBe('1');
      expect(paragraphs[1].nativeElement.textContent).toBe('2');
      expect(paragraphs[2].nativeElement.textContent).toBe('3');

      // Simulate CDK Drag & Drop: the DOM node is natively moved to a different parent (e.g. CDK overlay)
      // during drag! We mock the parentNode getter to simulate this without breaking the actual DOM structure
      // that Angular's ListReconciler expects for nativeInsertBefore.
      const p1 = paragraphs[0].nativeElement;
      const originalParent = p1.parentNode;
      Object.defineProperty(p1, 'parentNode', {get: () => document.body, configurable: true});

      // Swap item 1 and 2
      cmp.items.set([2, 1, 3]);
      fixture.detectChanges();
      tickAnimationFrames(1);

      // Restore the property so subsequent DOM operations or teardowns don't fail
      Object.defineProperty(p1, 'parentNode', {get: () => originalParent, configurable: true});

      fixture.detectChanges();

      paragraphs = fixture.debugElement.queryAll(By.css('p'));
      expect(paragraphs.length).toBe(3);
    }));
  });

  describe('animate.enter', () => {
    const styles = `
    .slide-in {
      animation: slide-in 1ms;
    }
    .fade-in {
      animation: fade-in 2ms;
    }
    @keyframes slide-in {
      from {
        transform: translateX(-10px);
      }
      to {
        transform: translateX(0);
      }
    }
    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    `;

    it('should apply classes on entry when animation is specified with no control flow', fakeAsync(() => {
      @Component({
        selector: 'test-cmp',
        styles: styles,
        template: '<div><p animate.enter="slide-in" #el>I should slide in</p></div>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        @ViewChild('el', {read: ElementRef}) el!: ElementRef<HTMLParagraphElement>;
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.el.nativeElement.outerHTML).toContain('class="slide-in"');
    }));

    it('should call animation function on entry when animation is specified with no control flow', fakeAsync(() => {
      @Component({
        selector: 'test-cmp',
        styles: styles,
        template: '<div><p (animate.enter)="slideIn($event)">I should slide in</p></div>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        count = signal(0);
        slideIn(event: AnimationCallbackEvent) {
          this.count.update((c) => (c += 1));
          event.animationComplete();
        }
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.count()).toBe(1);
    }));

    it('should call animation function only once on entry when animation is specified with control flow', fakeAsync(() => {
      @Component({
        selector: 'test-cmp',
        styles: styles,
        template:
          '<div>@if(show()) {<p (animate.enter)="slideIn($event)">I should slide in</p>}</div>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        count = signal(0);
        show = signal(false);
        slideIn(event: AnimationCallbackEvent) {
          this.count.update((c) => (c += 1));
          event.animationComplete();
        }
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.count()).toBe(0);

      cmp.show.update((s) => !s);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.count()).toBe(1);
    }));

    it('should apply classes on entry when animation is specified', fakeAsync(() => {
      @Component({
        selector: 'test-cmp',
        styles: styles,
        template: '<div>@if (show()) {<p animate.enter="slide-in" #el>I should slide in</p>}</div>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(false);
        @ViewChild('el', {read: ElementRef}) el!: ElementRef<HTMLParagraphElement>;
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      cmp.show.set(true);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.show()).toBeTruthy();
      expect(cmp.el.nativeElement.outerHTML).toContain('class="slide-in"');
    }));

    it('should support binding syntax', fakeAsync(() => {
      @Component({
        selector: 'test-cmp',
        styles: styles,
        template:
          '<div>@if (show()) {<p [animate.enter]="slide()" #el>I should slide in</p>}</div>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(false);
        slide = signal('slide-in');
        @ViewChild('el', {read: ElementRef}) el!: ElementRef<HTMLParagraphElement>;
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      cmp.show.set(true);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.show()).toBeTruthy();
      expect(cmp.el.nativeElement.outerHTML).toContain('class="slide-in"');
    }));

    it('should remove classes when animation is done', fakeAsync(() => {
      @Component({
        selector: 'test-cmp',
        styles: styles,
        template: '<div>@if (show()) {<p animate.enter="slide-in" #el>I should slide in</p>}</div>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(false);
        @ViewChild('el', {read: ElementRef}) el!: ElementRef<HTMLParagraphElement>;
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      cmp.show.set(true);
      fixture.detectChanges();
      tickAnimationFrames(1);
      const paragraph = fixture.debugElement.query(By.css('p'));

      paragraph.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
      expect(cmp.show()).toBeTruthy();
      paragraph.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'slide-in'}),
      );
      expect(cmp.el.nativeElement.outerHTML).not.toContain('class="slide-in"');
    }));

    it('should support function syntax', fakeAsync(() => {
      @Component({
        selector: 'test-cmp',
        styles: styles,
        template:
          '<div>@if (show()) {<p (animate.enter)="animateFn($event)" #el>I should slide in</p>}</div>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(false);
        animateFn = (event: AnimationCallbackEvent) => {
          event.target.classList.add('slide-in');
        };
        @ViewChild('el', {read: ElementRef}) el!: ElementRef<HTMLParagraphElement>;
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      cmp.show.set(true);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.show()).toBeTruthy();
      const paragraph = fixture.debugElement.query(By.css('p'));
      expect(cmp.el.nativeElement.outerHTML).toContain('class="slide-in"');
      paragraph.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
      paragraph.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-in'}),
      );
      expect(cmp.el.nativeElement.outerHTML).not.toContain('class="slide-in fade-in"');
    }));

    it('should support string arrays', fakeAsync(() => {
      const multiple = `
      .slide-in {
        animation: slide-in 1ms;
      }
      .fade-in {
        animation: fade-in 2ms;
      }
      @keyframes slide-in {
        from {
          transform: translateX(-10px);
        }
        to {
          transform: translateX(0);
        }
      }
      @keyframes fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      `;
      @Component({
        selector: 'test-cmp',
        styles: multiple,
        template:
          '<div>@if (show()) {<p [animate.enter]="classArray" #el>I should slide in</p>}</div>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(false);
        classArray = ['slide-in', 'fade-in'];
        @ViewChild('el', {read: ElementRef}) el!: ElementRef<HTMLParagraphElement>;
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      expect(cmp.show()).toBeFalsy();
      cmp.show.set(true);
      fixture.detectChanges();
      tickAnimationFrames(1);
      const paragraph = fixture.debugElement.query(By.css('p'));
      expect(cmp.show()).toBeTruthy();
      expect(cmp.el.nativeElement.outerHTML).toContain('class="slide-in fade-in"');
      paragraph.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
      paragraph.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-in'}),
      );
      expect(cmp.el.nativeElement.outerHTML).not.toContain('class="slide-in fade-in"');
    }));

    it('should support binding to a string with a space', fakeAsync(() => {
      const multiple = `
      .slide-in {
        animation: slide-in 1ms;
      }
      .fade-in {
        animation: fade-in 2ms;
      }
      @keyframes slide-in {
        from {
          transform: translateX(-10px);
        }
        to {
          transform: translateX(0);
        }
      }
      @keyframes fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      `;
      @Component({
        selector: 'test-cmp',
        styles: multiple,
        template: `<div>
          @if (show()) {
            <p [animate.enter]="'slide-in fade-in'" #el>I should slide in</p>
          }
        </div>`,
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(false);
        @ViewChild('el', {read: ElementRef}) el!: ElementRef<HTMLParagraphElement>;
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      expect(cmp.show()).toBeFalsy();
      cmp.show.set(true);
      fixture.detectChanges();
      tickAnimationFrames(1);
      const paragraph = fixture.debugElement.query(By.css('p'));
      expect(cmp.show()).toBeTruthy();
      expect(cmp.el.nativeElement.outerHTML).toContain('class="slide-in fade-in"');
      paragraph.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
      paragraph.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-in'}),
      );
      expect(cmp.el.nativeElement.outerHTML).not.toContain('class="slide-in fade-in"');
    }));

    it('should support multiple classes as a single string separated by a space', fakeAsync(() => {
      const multiple = `
      .slide-in {
        animation: slide-in 1ms;
      }
      .fade-in {
        animation: fade-in 2ms;
      }
      @keyframes slide-in {
        from {
          transform: translateX(-10px);
        }
        to {
          transform: translateX(0);
        }
      }
      @keyframes fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      `;
      @Component({
        selector: 'test-cmp',
        styles: multiple,
        template:
          '<div>@if (show()) {<p animate.enter="slide-in fade-in" #el>I should slide in</p>}</div>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(false);
        @ViewChild('el', {read: ElementRef}) el!: ElementRef<HTMLParagraphElement>;
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      cmp.show.set(true);
      fixture.detectChanges();
      tickAnimationFrames(1);
      const paragraph = fixture.debugElement.query(By.css('p'));
      expect(cmp.show()).toBeTruthy();
      expect(cmp.el.nativeElement.outerHTML).toContain('class="slide-in fade-in"');
      fixture.detectChanges();
      paragraph.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
      paragraph.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-in'}),
      );
      expect(cmp.el.nativeElement.outerHTML).not.toContain('class="slide-in fade-in"');
    }));

    it('should support multiple classes as a single string separated by a space', fakeAsync(() => {
      const multiple = `
      .slide-in {
        animation: slide-in 1ms;
      }
      .fade-in {
        animation: fade-in 2ms;
      }
      @keyframes slide-in {
        from {
          transform: translateX(-10px);
        }
        to {
          transform: translateX(0);
        }
      }
      @keyframes fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      `;
      @Component({
        selector: 'test-cmp',
        styles: multiple,
        template:
          '<div>@if (show()) {<p animate.enter="slide-in fade-in" #el>I should slide in</p>}</div>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(false);
        @ViewChild('el', {read: ElementRef}) el!: ElementRef<HTMLParagraphElement>;
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      cmp.show.set(true);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.show()).toBeTruthy();
      expect(cmp.el.nativeElement.outerHTML).toContain('class="slide-in fade-in"');
      const paragraph = fixture.debugElement.query(By.css('p'));
      paragraph.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
      paragraph.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'slide-in'}),
      );
      paragraph.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-in'}),
      );
      expect(fixture.debugElement.nativeElement.className).not.toContain('fade-in');
      expect(fixture.debugElement.nativeElement.className).not.toContain('slide-in');
    }));

    it('should remove right away when animations are disabled', fakeAsync(() => {
      @Component({
        selector: 'test-cmp',
        styles: styles,
        template: '<div>@if (show()) {<p animate.enter="slide-in" #el>I should fade</p>}</div>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(false);
        @ViewChild('el', {read: ElementRef}) el!: ElementRef<HTMLParagraphElement>;
      }

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      cmp.show.set(true);
      fixture.detectChanges();
      expect(cmp.show()).toBeTruthy();
      expect(cmp.el.nativeElement.outerHTML).not.toContain('class="slide-in"');
    }));

    it('should remove right away when no classes have animations', fakeAsync(() => {
      @Component({
        selector: 'test-cmp',
        styles: styles,
        template: '<div>@if (show()) {<p animate.enter="not-a-class" #el>I should fade</p>}</div>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(false);
        @ViewChild('el', {read: ElementRef}) el!: ElementRef<HTMLParagraphElement>;
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      cmp.show.set(true);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.show()).toBeTruthy();
      expect(cmp.el.nativeElement.outerHTML).not.toContain('class="not-a-class"');
    }));

    it('should be host bindable', fakeAsync(() => {
      @Component({
        selector: 'child-cmp',
        host: {'animate.enter': 'slide-in'},
        template: '<p>I should fade</p>',
        encapsulation: ViewEncapsulation.None,
      })
      class ChildComponent {}

      @Component({
        selector: 'test-cmp',
        styles: styles,
        imports: [ChildComponent],
        host: {'animate.enter': 'slide-in'},
        template: '<child-cmp />',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {}
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      tickAnimationFrames(1);

      expect(fixture.debugElement.nativeElement.outerHTML).toContain('class="slide-in"');
      const paragraph = fixture.debugElement.query(By.css('p'));
      paragraph.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
      paragraph.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'slide-in'}),
      );
      expect(fixture.debugElement.nativeElement.outerHTML).toContain('class="slide-in"');
    }));

    it('should be host bindable with brackets', fakeAsync(() => {
      @Component({
        selector: 'child-cmp',
        host: {'[animate.enter]': 'slideIn()'},
        template: '<p>I should fade</p>',
        encapsulation: ViewEncapsulation.None,
      })
      class ChildComponent {
        slideIn = signal('slide-in');
      }

      @Component({
        selector: 'test-cmp',
        styles: styles,
        imports: [ChildComponent],
        template: '<child-cmp />',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {}
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      tickAnimationFrames(1);

      expect(fixture.debugElement.nativeElement.outerHTML).toContain('class="slide-in"');
      const paragraph = fixture.debugElement.query(By.css('p'));
      paragraph.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
      paragraph.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'slide-in'}),
      );
      expect(fixture.debugElement.nativeElement.outerHTML).toContain('class="slide-in"');
    }));

    it('should be host bindable with events', fakeAsync(() => {
      const slideInCalled = jasmine.createSpy('slideInCalled');
      @Component({
        selector: 'child-cmp',
        host: {'(animate.enter)': 'slideIn($event)'},
        template: '<p>I should fade</p>',
        encapsulation: ViewEncapsulation.None,
      })
      class ChildComponent {
        slideIn(event: AnimationCallbackEvent) {
          slideInCalled();
          event.target.classList.add('slide-in');
          event.animationComplete();
        }
      }

      @Component({
        selector: 'test-cmp',
        styles: styles,
        imports: [ChildComponent],
        template: '<child-cmp />',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        slideIn(event: AnimationCallbackEvent) {
          slideInCalled();
          event.target.classList.add('slide-in');
          event.animationComplete();
        }
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(slideInCalled).toHaveBeenCalled();
    }));

    it('should compose class list when host binding and regular binding', fakeAsync(() => {
      @Component({
        selector: 'child-cmp',
        host: {'[animate.enter]': 'clazz'},
        template: '<p>I should fade</p>',
        encapsulation: ViewEncapsulation.None,
      })
      class ChildComponent {
        clazz = 'slide-in';
      }

      @Component({
        selector: 'test-cmp',
        styles: styles,
        imports: [ChildComponent],
        template: '<child-cmp [animate.enter]="fadeExp" />',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        fadeExp = 'fade-in';
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      const childCmp = fixture.debugElement.query(By.css('child-cmp'));

      expect(childCmp.nativeElement.className).toContain('slide-in');
      expect(childCmp.nativeElement.className).toContain('fade-in');
      tickAnimationFrames(1);

      childCmp.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
      childCmp.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-in'}),
      );
      childCmp.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'slide-in'}),
      );
      expect(childCmp.nativeElement.className).not.toContain('slide-in');
      expect(childCmp.nativeElement.className).not.toContain('fade-in');
    }));

    it('should compose class list when host binding a string and regular class strings', fakeAsync(() => {
      @Component({
        selector: 'child-cmp',
        host: {'animate.enter': 'slide-in'},
        template: '<p>I should fade</p>',
        encapsulation: ViewEncapsulation.None,
      })
      class ChildComponent {}

      @Component({
        selector: 'test-cmp',
        styles: styles,
        imports: [ChildComponent],
        template: '<child-cmp animate.enter="fade-in" />',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {}
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      tickAnimationFrames(1);
      const childCmp = fixture.debugElement.query(By.css('child-cmp'));

      expect(childCmp.nativeElement.className).toContain('slide-in fade-in');
      childCmp.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
      childCmp.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-in'}),
      );
      childCmp.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'slide-in'}),
      );
      fixture.detectChanges();
      expect(childCmp.nativeElement.className).not.toContain('slide-in fade-in');
    }));

    it('should reset leave animation and not duplicate node when toggled quickly', fakeAsync(() => {
      const animateStyles = `
        .slide-in {
          animation: slide-in 500ms;
        }
        .fade {
          animation: fade-out 500ms;
        }
        @keyframes slide-in {
          from {
            transform: translateX(-10px);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `;

      @Component({
        selector: 'test-cmp',
        styles: animateStyles,
        template:
          '<div>@if (show()) {<p animate.enter="slide-in" animate.leave="fade" #el>I should slide in</p>}</div>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(false);
        @ViewChild('el', {read: ElementRef}) el!: ElementRef<HTMLParagraphElement>;
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      tickAnimationFrames(1);
      cmp.show.set(true);
      fixture.detectChanges();
      expect(cmp.show()).toBeTruthy();
      cmp.show.set(false);
      tickAnimationFrames(1);
      fixture.detectChanges();
      expect(cmp.show()).toBeFalsy();
      cmp.show.set(true);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.show()).toBeTruthy();
      fixture.detectChanges();
      tickAnimationFrames(1);
      const paragraphs = fixture.debugElement.queryAll(By.css('p'));
      expect(paragraphs.length).toBe(1);
    }));

    it('should reset leave animation and not duplicate node when toggled quickly using event bindings', fakeAsync(() => {
      const animateStyles = `
        .slide-in {
          animation: slide-in 500ms;
        }
        .fade {
          animation: fade-out 500ms;
        }
        @keyframes slide-in {
          from {
            transform: translateX(-10px);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `;

      @Component({
        selector: 'test-cmp',
        styles: animateStyles,
        template:
          '<div>@if (show()) {<p (animate.enter)="slideIn($event)" (animate.leave)="fade($event)" #el>I should slide in</p>}</div>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(false);
        @ViewChild('el', {read: ElementRef}) el!: ElementRef<HTMLParagraphElement>;

        slideIn(event: AnimationCallbackEvent) {
          event.target.classList.add('slide-in');
          setTimeout(() => event.animationComplete(), 500);
        }

        fade(event: AnimationCallbackEvent) {
          event.target.classList.add('fade');
          setTimeout(() => event.animationComplete(), 500);
        }
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      tickAnimationFrames(1);
      cmp.show.set(true);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.show()).toBeTruthy();
      cmp.show.set(false);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.show()).toBeFalsy();
      cmp.show.set(true);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.show()).toBeTruthy();
      const paragraphs = fixture.debugElement.queryAll(By.css('p'));
      expect(paragraphs.length).toBe(1);
    }));

    it('should reset leave animation and not duplicate node when toggled programmatically very quickly', fakeAsync(() => {
      const animateStyles = `
        .fade {
          animation: fade-out 500ms;
        }
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `;

      @Component({
        selector: 'test-cmp',
        styles: animateStyles,
        template: '<div>@if (show()) {<p animate.leave="fade">I should fade</p>}</div>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(false);
        cdr = inject(ChangeDetectorRef);

        toggle() {
          this.show.update((s) => !s);
          setTimeout(() => {
            this.show.update((s) => !s);
            this.cdr.detectChanges();

            setTimeout(() => {
              this.show.update((s) => !s);
              this.cdr.detectChanges();
            });
          });
        }
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      cmp.toggle();
      fixture.detectChanges();
      tickAnimationFrames(1);
      const paragraphs = fixture.debugElement.queryAll(By.css('p'));
      expect(paragraphs.length).toBe(1);
    }));

    it('should always run animations for `@for` loops when adding and removing quickly', fakeAsync(() => {
      const animateStyles = `
        .slide-in {
          animation: slide-in 500ms;
        }
        .fade {
          animation: fade-out 500ms;
        }
        @keyframes slide-in {
          from {
            transform: translateX(-10px);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `;

      @Component({
        selector: 'test-cmp',
        styles: animateStyles,
        template: `
          <div>
            @for (item of items; track item) {
              <p animate.enter="slide-in" animate.leave="fade" #el>I should slide in {{ item }}.</p>
            }
          </div>
        `,
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        items = [1, 2, 3];
        @ViewChild('el', {read: ElementRef}) el!: ElementRef<HTMLParagraphElement>;
        max = 3;

        addremove() {
          this.max++;
          this.items.splice(this.items.length, 0, this.max);
          this.items.splice(0, 1);
        }
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      tickAnimationFrames(1);
      const paragraphs = fixture.debugElement.queryAll(By.css('p'));
      paragraphs.forEach((p) => {
        p.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
        p.nativeElement.dispatchEvent(
          new AnimationEvent('animationend', {animationName: 'slide-in'}),
        );
      });
      cmp.addremove();
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      tickAnimationFrames(1);

      expect(fixture.debugElement.queryAll(By.css('p.fade')).length).toBe(1);
      expect(fixture.debugElement.queryAll(By.css('p.slide-in')).length).toBe(1);
      expect(fixture.debugElement.queryAll(By.css('p')).length).toBe(4);
    }));

    it('should run leave and enter animations for `@for` loops when adding / removing simultaneously', fakeAsync(() => {
      const animateStyles = `
        .slide-in {
          animation: slide-in 500ms;
        }
        .fade {
          animation: fade-out 500ms;
        }
        @keyframes slide-in {
          from {
            transform: translateX(-10px);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `;

      @Component({
        selector: 'test-cmp',
        styles: animateStyles,
        template: `
          <div>
            @for (item of items(); track item) {
              <p id="item-{{ item }}" animate.enter="slide-in" animate.leave="fade">
                I should slide in {{ item }}.
              </p>
            }
          </div>
        `,
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        items = signal([1, 2, 3]);

        addremove() {
          this.items.update((l) => l.slice(1).concat([l.at(-1)! + 1]));
        }
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      tickAnimationFrames(1);
      const paragraphs = fixture.debugElement.queryAll(By.css('p'));
      paragraphs.forEach((p) => {
        p.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
        p.nativeElement.dispatchEvent(
          new AnimationEvent('animationend', {animationName: 'slide-in'}),
        );
      });
      cmp.addremove();
      fixture.detectChanges();
      tickAnimationFrames(1);

      const first = fixture.debugElement.query(By.css('p#item-1'));
      const last = fixture.debugElement.query(By.css('p#item-4'));
      first.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
      last.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
      expect(fixture.debugElement.queryAll(By.css('p.fade')).length).toBe(1);
      expect(fixture.debugElement.queryAll(By.css('p.slide-in')).length).toBe(1);

      last.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'slide-in'}),
      );
      first.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-out'}),
      );
      fixture.detectChanges();
      tickAnimationFrames(1);
      tick();

      expect(fixture.debugElement.queryAll(By.css('p')).length).toBe(3);
      expect(fixture.debugElement.queryAll(By.css('p.slide-in')).length).toBe(0);
      expect(fixture.debugElement.queryAll(By.css('p.fade')).length).toBe(0);
    }));

    it('should run leave and enter animations for `@for` loops when adding / removing simultaneously with leave function', fakeAsync(() => {
      const animateStyles = `
        .slide-in {
          animation: slide-in 500ms;
        }
        .fade {
          animation: fade-out 500ms;
        }
        @keyframes slide-in {
          from {
            transform: translateX(-10px);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `;

      @Component({
        selector: 'test-cmp',
        styles: animateStyles,
        template: `
          <div>
            @for (item of items(); track item) {
              <p id="item-{{ item }}" animate.enter="slide-in" (animate.leave)="fadeOut($event)">
                I should slide in {{ item }}.
              </p>
            }
          </div>
        `,
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        items = signal([1, 2, 3]);

        addremove() {
          this.items.update((l) => l.slice(1).concat([l.at(-1)! + 1]));
        }

        fadeOut(event: AnimationCallbackEvent) {
          event.target.classList.add('fade');
          setTimeout(() => event.animationComplete(), 500);
        }
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      tickAnimationFrames(1);
      const paragraphs = fixture.debugElement.queryAll(By.css('p'));
      paragraphs.forEach((p) => {
        p.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
        p.nativeElement.dispatchEvent(
          new AnimationEvent('animationend', {animationName: 'slide-in'}),
        );
      });
      cmp.addremove();
      fixture.detectChanges();
      tickAnimationFrames(1);

      const first = fixture.debugElement.query(By.css('p#item-1'));
      const last = fixture.debugElement.query(By.css('p#item-4'));
      first.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
      last.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
      expect(fixture.debugElement.queryAll(By.css('p.fade')).length).toBe(1);
      expect(fixture.debugElement.queryAll(By.css('p.slide-in')).length).toBe(1);

      last.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'slide-in'}),
      );
      first.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-out'}),
      );
      fixture.detectChanges();
      tickAnimationFrames(1);
      tick();

      expect(fixture.debugElement.queryAll(By.css('p')).length).toBe(3);
      expect(fixture.debugElement.queryAll(By.css('p.slide-in')).length).toBe(0);
      expect(fixture.debugElement.queryAll(By.css('p.fade')).length).toBe(0);
    }));

    it('should always run animations for custom repeater loops when adding and removing quickly', fakeAsync(() => {
      const animateStyles = `
        .slide-in {
          animation: slide-in 500ms;
        }
        .fade {
          animation: fade-out 500ms;
        }
        @keyframes slide-in {
          from {
            transform: translateX(-10px);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `;

      @Component({
        selector: 'test-cmp',
        styles: animateStyles,
        imports: [NgFor],
        template: `
          <div>
            <ng-container *ngFor="let item of items; trackBy: trackByIndex; let i = index">
              <p animate.enter="slide-in" animate.leave="fade" #el>I should slide in {{ item }}.</p>
            </ng-container>
          </div>
        `,
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        items = [1, 2, 3];
        @ViewChild('el', {read: ElementRef}) el!: ElementRef<HTMLParagraphElement>;
        max = 3;

        addremove() {
          this.max++;
          this.items.splice(this.items.length, 0, this.max);
          this.items.splice(0, 1);
        }
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      tickAnimationFrames(1);
      const paragraphs = fixture.debugElement.queryAll(By.css('p'));
      paragraphs.forEach((p) => {
        p.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
        p.nativeElement.dispatchEvent(
          new AnimationEvent('animationend', {animationName: 'slide-in'}),
        );
      });
      cmp.addremove();
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      tickAnimationFrames(1);

      expect(fixture.debugElement.queryAll(By.css('p.fade')).length).toBe(1);
      expect(fixture.debugElement.queryAll(By.css('p.slide-in')).length).toBe(1);
      expect(fixture.debugElement.queryAll(By.css('p')).length).toBe(4);
    }));

    it('should only remove one element in reactive `@for` loops when removing the second to last item', fakeAsync(() => {
      const animateStyles = `
        .fade {
          animation: fade-out 500ms;
        }
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `;

      @Component({
        selector: 'test-cmp',
        styles: animateStyles,
        template: `
          <div>
            @for (item of shown(); track item) {
              <p animate.leave="fade" #el>I should slide in {{ item }}.</p>
            }
          </div>
        `,
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        items = signal([1, 2, 3, 4, 5, 6]);
        shown = computed(() => this.items().slice(0, 3));
        @ViewChild('el', {read: ElementRef}) el!: ElementRef<HTMLParagraphElement>;
        max = 6;

        removeSecondToLast() {
          this.items.update((old) => {
            const newList = [...old];
            newList.splice(1, 1);
            return newList;
          });
        }
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      cmp.removeSecondToLast();
      fixture.detectChanges();
      tickAnimationFrames(1);

      expect(fixture.debugElement.queryAll(By.css('p.fade')).length).toBe(1);
      expect(fixture.debugElement.queryAll(By.css('p')).length).toBe(4);
      fixture.debugElement
        .query(By.css('p.fade'))
        .nativeElement.dispatchEvent(
          new AnimationEvent('animationend', {animationName: 'fade-out'}),
        );
      tick();
      expect(fixture.debugElement.queryAll(By.css('p')).length).toBe(3);
    }));

    it('should not remove elements when swapping or moving nodes', fakeAsync(() => {
      const animateSpy = jasmine.createSpy('animateSpy');
      @Component({
        selector: 'test-cmp',
        template: `
          <div>
            @for (item of items; track item.id) {
              <p (animate.leave)="animate($event)" #el>{{ item.id }}</p>
            }
          </div>
        `,
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        items = [{id: 1}, {id: 2}, {id: 3}];
        private cd = inject(ChangeDetectorRef);

        animate(event: AnimationCallbackEvent) {
          animateSpy();
          event.animationComplete();
        }

        shuffle() {
          this.items = this.shuffleArray(this.items);
          this.cd.markForCheck();
        }

        shuffleArray<T>(array: readonly T[]): T[] {
          return [array[1], array[2], array[0]];
        }
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      cmp.shuffle();
      fixture.detectChanges();
      expect(animateSpy).not.toHaveBeenCalled();
      expect(fixture.debugElement.queryAll(By.css('p')).length).toBe(3);
    }));

    it('should not remove elements when child element animations finish', fakeAsync(() => {
      const animateStyles = `
        .fade {
          animation: fade-out 500ms;
        }
        .flash {
          animation: flash 200ms;
        }
        @keyframes flash {
          from {
            background-color: rgba(255, 255, 255, 1);
          }
          to {
            background-color: rgba(255, 255, 255, 0);;
          }
        }
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `;

      @Component({
        selector: 'test-cmp',
        styles: animateStyles,
        template: `
          <div>
            @if (show()) {
              <p animate.leave="fade" #el>
                I should slide in.
                <button [class]="buttonClass()" (click)="flash()">click me</button>
              </p>
            }
          </div>
        `,
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(true);
        buttonClass = signal('');
        flash() {
          this.show.update((val) => !val);
          this.buttonClass.set('flash');
        }
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      cmp.flash();
      fixture.detectChanges();
      tickAnimationFrames(1);

      fixture.debugElement
        .query(By.css('button'))
        .nativeElement.dispatchEvent(
          new AnimationEvent('animationend', {animationName: 'flash', bubbles: true}),
        );
      tick();
      expect(fixture.debugElement.queryAll(By.css('p')).length).toBe(1);
      fixture.debugElement
        .query(By.css('p'))
        .nativeElement.dispatchEvent(
          new AnimationEvent('animationend', {animationName: 'fade-out', bubbles: true}),
        );
      tick();
      expect(fixture.debugElement.queryAll(By.css('p')).length).toBe(0);
    }));
  });

  describe('animation queue timing', () => {
    it('should run animations with a fresh componentRef after destroy', fakeAsync(() => {
      const animateStyles = `
        .fade {
          animation: fade-out 500ms;
        }
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `;

      @Component({
        selector: 'app-control-panel',
        template: `
          @if (step() === 0) {
            <p class="not-here" [animate.leave]="'fade-out'">THIS SHOULD NOT BE HERE</p>
          }
          @if (step() === 1) {
            <p class="all-there-is">THIS SHOULD BE ALL THERE IS</p>
          }
        `,
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class StepperComponent {
        readonly step = signal(0);
      }

      @Component({
        selector: 'app-dynamic',
        template: `<ng-container #dynamicComponent></ng-container>`,
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class DynamicComponent implements AfterViewInit, OnDestroy {
        @ViewChild('dynamicComponent', {read: ViewContainerRef})
        dynamicComponent!: ViewContainerRef;

        constructor() {
          this.componentRef = null;
        }

        protected componentRef: ComponentRef<StepperComponent> | null;

        ngAfterViewInit(): void {
          this.componentRef = this.dynamicComponent.createComponent(
            StepperComponent,
          ) as ComponentRef<StepperComponent>;
          this.componentRef!.changeDetectorRef.detectChanges();

          this.componentRef!.instance.step.set(1);
        }

        ngOnDestroy(): void {
          this.componentRef?.destroy();
        }
      }

      @Component({
        selector: 'test-cmp',
        imports: [DynamicComponent],
        template: `
          <div>
            @if (show()) {
              <app-dynamic />
            }
          </div>
        `,
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(true);

        toggleOverlay() {
          this.show.update((show) => !show);
        }
      }
      TestBed.configureTestingModule({animationsEnabled: true});

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('p.all-there-is'))).not.toBeNull();
      expect(fixture.debugElement.query(By.css('p.not-here.fade-out'))).not.toBeNull();

      // Finish the leave animation to ensure it is removed
      tickAnimationFrames(1);

      // verify element is removed post animation
      expect(fixture.debugElement.query(By.css('p.not-here'))).toBeNull();

      cmp.toggleOverlay();
      fixture.detectChanges();

      // show is false. Nothing should be present.
      expect(fixture.debugElement.query(By.css('p.all-there-is'))).toBeNull();
      expect(fixture.debugElement.query(By.css('p.not-here'))).toBeNull();

      cmp.toggleOverlay();
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('p.not-here'))).not.toBeNull();

      tickAnimationFrames(1);

      // show is true. Only one element should be present.
      expect(fixture.debugElement.query(By.css('p.all-there-is'))).not.toBeNull();
      expect(fixture.debugElement.query(By.css('p.not-here'))).toBeNull();
    }));

    it('should not throw INJECTOR_ALREADY_DESTROYED when lView injector is destroyed before animation queue runs', fakeAsync(() => {
      const animateStyles = `
        .fade-out {
          animation: fade-out 100ms;
        }
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `;

      @Component({
        selector: 'animated-child',
        template: `
          @if (show()) {
            <div class="item" animate.leave="fade-out">Item</div>
          }
        `,
        styles: [animateStyles],
        encapsulation: ViewEncapsulation.None,
      })
      class AnimatedChild {
        show = signal(true);
      }

      TestBed.configureTestingModule({animationsEnabled: true});
      const rootEnvInjector = TestBed.inject(EnvironmentInjector);
      const childEnvInjector = createEnvironmentInjector([], rootEnvInjector);
      const appRef = TestBed.inject(ApplicationRef);
      const errorHandler = TestBed.inject(ErrorHandler);
      spyOn(errorHandler, 'handleError');

      const hostEl = document.createElement('animated-child');
      const compRef = createComponentFn(AnimatedChild, {
        environmentInjector: childEnvInjector,
        hostElement: hostEl,
      });
      appRef.attachView(compRef.hostView);
      appRef.tick();
      tickAnimationFrames(1);

      expect(hostEl.querySelector('.item')).not.toBeNull();

      // Trigger leave animation via local detectChanges (queues animation
      // without flushing the queue - afterNextRender only runs during tick)
      compRef.instance.show.set(false);
      compRef.changeDetectorRef.detectChanges();

      // Destroy the child injector before the animation queue flushes.
      // This simulates what happens when a component's lView injector is
      // destroyed while leave animations are pending.
      childEnvInjector.destroy();

      // Tick to flush the animation queue. Without the fix, the animation
      // function would call lView[INJECTOR].get(NgZone) which delegates to
      // the destroyed childEnvInjector, throwing NG0205.
      appRef.tick();
      tickAnimationFrames(1);

      expect(errorHandler.handleError).not.toHaveBeenCalled();
    }));
  });

  describe('animation element duplication', () => {
    it('should not duplicate elements when using dynamic components in overlay-like containers', fakeAsync(() => {
      const animateStyles = `
        .example-menu {
          display: inline-flex;
          flex-direction: column;
          min-width: 180px;
          max-width: 280px;
          padding: 6px 0;
        }
        .open {
          animation: open 10ms;
        }
        .close {
          animation: open 10ms reverse;
        }
        @keyframes open {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `;

      @Component({
        selector: 'dynamic-menu',
        styles: [animateStyles],
        template: `
          <ng-template #menu>
            <div class="example-menu" animate.enter="open" animate.leave="close">
              <div>Menu</div>
            </div>
          </ng-template>
        `,
        changeDetection: ChangeDetectionStrategy.OnPush,
        encapsulation: ViewEncapsulation.None,
      })
      class MenuComponent {
        @ViewChild('menu') menuTpl!: TemplateRef<unknown>;
        vcr = inject(ViewContainerRef);
        opened = false;
        private currentPane: HTMLElement | null = null;

        toggle() {
          if (this.opened) {
            this.close();
          } else {
            this.open();
          }
        }

        open() {
          this.opened = true;
          const viewRef = this.vcr.createEmbeddedView(this.menuTpl);
          // Simulate CDK DomPortalOutlet: after creating the view, move
          // the root nodes to a new "overlay pane" div, just like CDK
          // Overlay does with outletElement.appendChild(rootNode).
          const pane = document.createElement('div');
          pane.className = 'overlay-pane';
          document.body.appendChild(pane);
          for (const node of viewRef.rootNodes) {
            pane.appendChild(node);
          }
          this.currentPane = pane;
        }

        close() {
          this.opened = false;
          this.vcr.clear();
          // CDK Overlay may or may not remove the pane immediately
        }
      }

      @Component({
        selector: 'test-cmp',
        imports: [MenuComponent],
        template: ` <dynamic-menu /> `,
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {}

      TestBed.configureTestingModule({animationsEnabled: true});
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const cmp = fixture.debugElement.query(By.css('dynamic-menu')).componentInstance;

      // Query from document since overlay panes are appended to body
      const countMenus = () => document.querySelectorAll('.example-menu').length;

      // Helper to complete the leave animation for all leaving menu elements
      const finishLeaveAnimations = () => {
        tickAnimationFrames(1);
        document.querySelectorAll('.example-menu.close').forEach((el) => {
          el.dispatchEvent(new AnimationEvent('animationend', {animationName: 'open'}));
        });
        tick();
      };

      // Simulate rapid clicking with CD between each toggle
      for (let i = 0; i < 20; i++) {
        cmp.toggle();
        fixture.detectChanges();
        tickAnimationFrames(1);
        // At no point should there be more than one menu element
        expect(countMenus()).toBeLessThanOrEqual(1);
      }

      // Complete any remaining leave animations
      finishLeaveAnimations();
      fixture.detectChanges();

      // 20 toggles (even) = closed = 0 elements
      expect(countMenus()).toBe(0);

      // Clean up overlay panes
      document.querySelectorAll('.overlay-pane').forEach((p) => p.remove());
    }));
  });
});
