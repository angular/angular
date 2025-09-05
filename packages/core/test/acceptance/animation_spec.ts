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
  AnimationCallbackEvent,
  Component,
  Directive,
  ElementRef,
  signal,
  ViewChild,
} from '@angular/core';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {isNode} from '@angular/private/testing';

/** Ticks the specified amount of `requestAnimationFrame`-s. */
export function tickAnimationFrames(amount: number) {
  tick(16.6 * amount); // Angular turns rAF calls into 16.6ms timeouts in tests.
}

describe('Animation', () => {
  if (isNode) {
    it('should pass', () => expect(true).toBe(true));
    return;
  }

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
        template: `<div>@if (show()) {<p [animate.leave]="'slide-out fade'" #el>I should slide out</p>}</div>`,
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
        styles: styles,
        host: {'animate.leave': 'fade'},
        template: '<p>I should fade</p>',
        encapsulation: ViewEncapsulation.None,
      })
      class FadeComponent {}

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
      const fadeCmp = fixture.debugElement.query(By.css('fade-cmp'));

      expect(fixture.nativeElement.outerHTML).not.toContain('class="fade"');
      cmp.show.set(false);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.show()).toBeFalsy();
      fixture.detectChanges();
      expect(fixture.nativeElement.outerHTML).toContain('class="fade"');
      fixture.detectChanges();
      fadeCmp.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-out'}),
      );
      expect(fixture.nativeElement.outerHTML).not.toContain('class="fade"');
    }));

    it('should be host bindable with brackets', fakeAsync(() => {
      @Component({
        selector: 'fade-cmp',
        styles: styles,
        host: {'[animate.leave]': 'fade()'},
        template: '<p>I should fade</p>',
        encapsulation: ViewEncapsulation.None,
      })
      class FadeComponent {
        fade = signal('fade');
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
      const fadeCmp = fixture.debugElement.query(By.css('fade-cmp'));

      expect(fixture.nativeElement.outerHTML).not.toContain('class="fade"');
      cmp.show.set(false);
      fixture.detectChanges();
      tickAnimationFrames(1);
      expect(cmp.show()).toBeFalsy();
      fixture.detectChanges();
      expect(fixture.nativeElement.outerHTML).toContain('class="fade"');
      fixture.detectChanges();
      fadeCmp.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-out'}),
      );
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
        styles: multiple,
        host: {'[animate.leave]': 'clazz'},
        template: '<p>I should fade</p>',
        encapsulation: ViewEncapsulation.None,
      })
      class ChildComponent {
        clazz = 'slide-out';
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
      fixture.detectChanges();
      expect(childCmp.nativeElement.className).toContain('fade');
      expect(childCmp.nativeElement.className).toContain('slide-out');
      fixture.detectChanges();

      childCmp.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-out'}),
      );
      childCmp.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'slide-out'}),
      );

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
        styles: multiple,
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
        template: `<div>@if (show()) {<p [animate.enter]="'slide-in fade-in'" #el>I should slide in</p>}</div>`,
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

    it('should support multple classes as a single string separated by a space', fakeAsync(() => {
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

    it('should support multple classes as a single string separated by a space', fakeAsync(() => {
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
        selector: 'test-cmp',
        styles: styles,
        host: {'animate.enter': 'slide-in'},
        template: '<p>I should fade</p>',
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
        selector: 'test-cmp',
        styles: styles,
        host: {'[animate.enter]': 'slideIn()'},
        template: '<p>I should fade</p>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        slideIn = signal('slide-in');
      }
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
        selector: 'test-cmp',
        styles: styles,
        host: {'(animate.enter)': 'slideIn($event)'},
        template: '<p>I should fade</p>',
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
        styles: styles,
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
        styles: styles,
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
              <p animate.enter="slide-in" animate.leave="fade" #el>I should slide in {{item}}.</p>
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
      fixture.detectChanges();
      tickAnimationFrames(1);

      expect(fixture.debugElement.queryAll(By.css('p.fade')).length).toBe(1);
      expect(fixture.debugElement.queryAll(By.css('p.slide-in')).length).toBe(1);
      expect(fixture.debugElement.queryAll(By.css('p')).length).toBe(4);
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
            <ng-container *ngFor="let item of items; trackBy: trackByIndex; let i=index">
              <p animate.enter="slide-in" animate.leave="fade" #el>I should slide in {{item}}.</p>
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
      fixture.detectChanges();
      tickAnimationFrames(1);

      expect(fixture.debugElement.queryAll(By.css('p.fade')).length).toBe(1);
      expect(fixture.debugElement.queryAll(By.css('p.slide-in')).length).toBe(1);
      expect(fixture.debugElement.queryAll(By.css('p')).length).toBe(4);
    }));
  });
});
