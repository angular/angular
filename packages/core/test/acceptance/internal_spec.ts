/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  createComponent,
  Directive,
  EnvironmentInjector,
  ɵgetClosestComponentName as getClosestComponentName,
  ViewChild,
  ViewContainerRef,
} from '../../src/core';
import {TestBed} from '../../testing';

describe('internal utilities', () => {
  describe('getClosestComponentName', () => {
    it('should get the name from a node placed inside a root component', () => {
      @Component({
        template: `<section><div class="target"></div></section>`,
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(getClosestComponentName(fixture.nativeElement)).toBe('App');
      expect(getClosestComponentName(fixture.nativeElement.querySelector('.target'))).toBe('App');
    });

    it('should get the name from a node placed inside a component', () => {
      @Component({
        selector: 'comp',
        template: `<section><div class="target"></div></section>`,
      })
      class Comp {}

      @Component({
        template: `<comp/>`,
        imports: [Comp],
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(getClosestComponentName(fixture.nativeElement.querySelector('comp'))).toBe('Comp');
      expect(getClosestComponentName(fixture.nativeElement.querySelector('.target'))).toBe('Comp');
    });

    it('should get the name from a node placed inside a repeated component', () => {
      @Component({
        selector: 'comp',
        template: `<section><div class="target"></div></section>`,
      })
      class Comp {}

      @Component({
        template: `
          @for (current of [1]; track $index) {
            <comp/>
          }
        `,
        imports: [Comp],
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(getClosestComponentName(fixture.nativeElement.querySelector('comp'))).toBe('Comp');
      expect(getClosestComponentName(fixture.nativeElement.querySelector('.target'))).toBe('Comp');
    });

    it('should get the name from a node that has a directive', () => {
      @Directive({
        selector: 'dir',
      })
      class Dir {}

      @Component({
        template: `<section><dir class="target"></dir></section>`,
        imports: [Dir],
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(getClosestComponentName(fixture.nativeElement)).toBe('App');
      expect(getClosestComponentName(fixture.nativeElement.querySelector('.target'))).toBe('App');
    });

    it('should return null when not placed in a component', () => {
      @Component({
        template: '',
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(getClosestComponentName(document.body)).toBe(null);
    });

    it('should get the name from a node placed inside a dynamically-created component through ViewContainerRef', () => {
      @Component({
        selector: 'comp',
        template: `<section><div class="target"></div></section>`,
      })
      class Comp {}

      @Component({
        template: `<ng-container #insertionPoint/>`,
      })
      class App {
        @ViewChild('insertionPoint', {read: ViewContainerRef}) vcr!: ViewContainerRef;
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const ref = fixture.componentInstance.vcr.createComponent(Comp);
      fixture.detectChanges();

      expect(getClosestComponentName(fixture.nativeElement.querySelector('comp'))).toBe('Comp');
      expect(getClosestComponentName(fixture.nativeElement.querySelector('.target'))).toBe('Comp');
      ref.destroy();
    });

    it('should get the name from a node placed inside a dynamically-created component through createComponent', () => {
      @Component({
        selector: 'comp',
        template: `<section><div class="target"></div></section>`,
      })
      class Comp {}

      TestBed.configureTestingModule({});
      const ref = createComponent(Comp, {environmentInjector: TestBed.inject(EnvironmentInjector)});
      ref.changeDetectorRef.detectChanges();

      expect(getClosestComponentName(ref.location.nativeElement)).toBe('Comp');
      expect(getClosestComponentName(ref.location.nativeElement.querySelector('.target'))).toBe(
        'Comp',
      );
      ref.destroy();
    });
  });
});
