/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ViewEncapsulation} from '@angular/compiler';
import {
  AnimationCallbackEvent,
  ANIMATIONS_DISABLED,
  Component,
  ElementRef,
  signal,
  ViewChild,
} from '@angular/core';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {isNode} from '@angular/private/testing';

describe('Animation', () => {
  if (isNode) {
    it('should pass', () => expect(true).toBe(true));
    return;
  }

  describe('animate.leave', () => {
    const styles = `
    .fade {
      animation: fade-out 1s;
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

    it('should delay element removal when an animation is specified', () => {
      @Component({
        selector: 'test-cmp',
        styles: styles,
        template: '<div>@if (show()) {<p animate.leave="fade">I should fade</p>}</div>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {
        show = signal(true);
      }

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      const paragragh = fixture.debugElement.query(By.css('p'));

      expect(fixture.nativeElement.outerHTML).not.toContain('class="fade"');
      cmp.show.set(false);
      fixture.detectChanges();
      expect(cmp.show()).toBeFalsy();
      fixture.detectChanges();
      paragragh.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
      expect(fixture.nativeElement.outerHTML).toContain('class="fade"');
      fixture.detectChanges();
      paragragh.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-out'}),
      );
      expect(fixture.nativeElement.outerHTML).not.toContain('class="fade"');
    }, 100_000);

    it('should remove right away when animations are disabled', () => {
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

      TestBed.configureTestingModule({
        providers: [{provide: ANIMATIONS_DISABLED, useValue: true}],
      });
      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      cmp.show.set(false);
      fixture.detectChanges();
      expect(cmp.show()).toBeFalsy();
      expect(cmp.el).toBeUndefined();
    });

    it('should support string arrays', () => {
      const multiple = `
        .slide-out {
          animation: slide-out 2s;
        }
        .fade {
          animation: fade-out 1s;
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

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      const paragragh = fixture.debugElement.query(By.css('p'));

      expect(fixture.nativeElement.outerHTML).not.toContain('class="slide-out fade"');
      cmp.show.set(false);
      fixture.detectChanges();
      expect(cmp.show()).toBeFalsy();
      fixture.detectChanges();
      paragragh.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
      expect(fixture.nativeElement.outerHTML).toContain('class="slide-out fade"');
      fixture.detectChanges();
      paragragh.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-out'}),
      );
      paragragh.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'slide-out'}),
      );
      expect(fixture.nativeElement.outerHTML).not.toContain('class="slide-out fade"');
    });

    it('should support function syntax', () => {
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

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      cmp.show.set(false);
      fixture.detectChanges();
      expect(cmp.show()).toBeFalsy();
      expect(fixture.debugElement.nativeElement.outerHTML).not.toContain('class="slide-in"');
    });

    it('should be host bindable', () => {
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

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      const fadeCmp = fixture.debugElement.query(By.css('fade-cmp'));

      expect(fixture.nativeElement.outerHTML).not.toContain('class="fade"');
      cmp.show.set(false);
      fixture.detectChanges();
      expect(cmp.show()).toBeFalsy();
      fixture.detectChanges();
      fadeCmp.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
      expect(fixture.nativeElement.outerHTML).toContain('class="fade"');
      fixture.detectChanges();
      fadeCmp.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'fade-out'}),
      );
      expect(fixture.nativeElement.outerHTML).not.toContain('class="fade"');
    });

    it('should compose class list when host binding and regular binding', () => {
      const multiple = `
        .slide-out {
          animation: slide-out 2s;
        }
        .fade {
          animation: fade-out 1s;
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

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      const childCmp = fixture.debugElement.query(By.css('child-cmp'));

      expect(childCmp.nativeElement.className).not.toContain('fade');
      expect(childCmp.nativeElement.className).not.toContain('slide-out');
      cmp.show.set(false);
      fixture.detectChanges();
      expect(cmp.show()).toBeFalsy();
      fixture.detectChanges();
      childCmp.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
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
    });

    it('should compose class list when host binding a string and regular class strings', () => {
      const multiple = `
        .slide-out {
          animation: slide-out 2s;
        }
        .fade {
          animation: fade-out 1s;
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

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      const childCmp = fixture.debugElement.query(By.css('child-cmp'));

      expect(childCmp.nativeElement.className).not.toContain('slide-out fade');
      cmp.show.set(false);
      fixture.detectChanges();
      expect(cmp.show()).toBeFalsy();
      fixture.detectChanges();
      childCmp.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
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
    });
  });

  describe('animate.enter', () => {
    const styles = `
    .slide-in {
      animation: slide-in 1s;
    }
    .fade-in {
      animation: fade-in 2s;
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

    it('should apply classes on entry when animation is specified', () => {
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

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      cmp.show.set(true);
      fixture.detectChanges();
      expect(cmp.show()).toBeTruthy();
      expect(cmp.el.nativeElement.outerHTML).toContain('class="slide-in"');
    });

    it('should support binding syntax', () => {
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

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      cmp.show.set(true);
      fixture.detectChanges();
      expect(cmp.show()).toBeTruthy();
      expect(cmp.el.nativeElement.outerHTML).toContain('class="slide-in"');
    });

    it('should remove classes when animation is done', () => {
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

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      cmp.show.set(true);
      fixture.detectChanges();
      const paragraph = fixture.debugElement.query(By.css('p'));

      paragraph.nativeElement.dispatchEvent(new AnimationEvent('animationstart'));
      expect(cmp.show()).toBeTruthy();
      paragraph.nativeElement.dispatchEvent(
        new AnimationEvent('animationend', {animationName: 'slide-in'}),
      );
      expect(cmp.el.nativeElement.outerHTML).not.toContain('class="slide-in"');
    });

    it('should support function syntax', () => {
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

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      cmp.show.set(true);
      fixture.detectChanges();
      expect(cmp.show()).toBeTruthy();
      expect(cmp.el.nativeElement.outerHTML).toContain('class="slide-in"');
    });

    it('should support string arrays', () => {
      const multiple = `
      .slide-in {
        animation: slide-in 1s;
      }
      .fade-in {
        animation: fade-in 2s;
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

      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      cmp.show.set(true);
      fixture.detectChanges();
      expect(cmp.show()).toBeTruthy();
      expect(cmp.el.nativeElement.outerHTML).toContain('class="slide-in fade-in"');
    });

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

      TestBed.configureTestingModule({
        providers: [{provide: ANIMATIONS_DISABLED, useValue: true}],
      });
      const fixture = TestBed.createComponent(TestComponent);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      cmp.show.set(true);
      fixture.detectChanges();
      expect(cmp.show()).toBeTruthy();
      tick();
      expect(cmp.el.nativeElement.outerHTML).not.toContain('class="slide-in"');
    }));

    it('should be host bindable', () => {
      @Component({
        selector: 'test-cmp',
        styles: styles,
        host: {'animate.enter': 'slide-in'},
        template: '<p>I should fade</p>',
        encapsulation: ViewEncapsulation.None,
      })
      class TestComponent {}

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.outerHTML).toContain('class="slide-in"');
    });

    it('should compose class list when host binding and regular binding', () => {
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
      })
      class TestComponent {
        fadeExp = 'fade-in';
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      const childCmp = fixture.debugElement.query(By.css('child-cmp'));

      expect(childCmp.nativeElement.className).toContain('slide-in');
      expect(childCmp.nativeElement.className).toContain('fade-in');
    });

    it('should compose class list when host binding a string and regular class strings', () => {
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
      })
      class TestComponent {}

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      const childCmp = fixture.debugElement.query(By.css('child-cmp'));

      expect(childCmp.nativeElement.className).toContain('slide-in fade-in');
    });
  });
});
