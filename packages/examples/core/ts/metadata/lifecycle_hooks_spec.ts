/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  Component,
  DoCheck,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  Type,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';

(function () {
  describe('lifecycle hooks examples', () => {
    it('should work with ngOnInit', () => {
      // #docregion OnInit
      @Component({
        selector: 'my-cmp',
        template: `...`,
        standalone: false,
      })
      class MyComponent implements OnInit {
        ngOnInit() {
          // ...
        }
      }
      // #enddocregion

      expect(createAndLogComponent(MyComponent)).toEqual([['ngOnInit', []]]);
    });

    it('should work with ngDoCheck', () => {
      // #docregion DoCheck
      @Component({
        selector: 'my-cmp',
        template: `...`,
        standalone: false,
      })
      class MyComponent implements DoCheck {
        ngDoCheck() {
          // ...
        }
      }
      // #enddocregion

      expect(createAndLogComponent(MyComponent)).toEqual([['ngDoCheck', []]]);
    });

    it('should work with ngAfterContentChecked', () => {
      // #docregion AfterContentChecked
      @Component({
        selector: 'my-cmp',
        template: `...`,
        standalone: false,
      })
      class MyComponent implements AfterContentChecked {
        ngAfterContentChecked() {
          // ...
        }
      }
      // #enddocregion

      expect(createAndLogComponent(MyComponent)).toEqual([['ngAfterContentChecked', []]]);
    });

    it('should work with ngAfterContentInit', () => {
      // #docregion AfterContentInit
      @Component({
        selector: 'my-cmp',
        template: `...`,
        standalone: false,
      })
      class MyComponent implements AfterContentInit {
        ngAfterContentInit() {
          // ...
        }
      }
      // #enddocregion

      expect(createAndLogComponent(MyComponent)).toEqual([['ngAfterContentInit', []]]);
    });

    it('should work with ngAfterViewChecked', () => {
      // #docregion AfterViewChecked
      @Component({
        selector: 'my-cmp',
        template: `...`,
        standalone: false,
      })
      class MyComponent implements AfterViewChecked {
        ngAfterViewChecked() {
          // ...
        }
      }
      // #enddocregion

      expect(createAndLogComponent(MyComponent)).toEqual([['ngAfterViewChecked', []]]);
    });

    it('should work with ngAfterViewInit', () => {
      // #docregion AfterViewInit
      @Component({
        selector: 'my-cmp',
        template: `...`,
        standalone: false,
      })
      class MyComponent implements AfterViewInit {
        ngAfterViewInit() {
          // ...
        }
      }
      // #enddocregion

      expect(createAndLogComponent(MyComponent)).toEqual([['ngAfterViewInit', []]]);
    });

    it('should work with ngOnDestroy', () => {
      // #docregion OnDestroy
      @Component({
        selector: 'my-cmp',
        template: `...`,
        standalone: false,
      })
      class MyComponent implements OnDestroy {
        ngOnDestroy() {
          // ...
        }
      }
      // #enddocregion

      expect(createAndLogComponent(MyComponent)).toEqual([['ngOnDestroy', []]]);
    });

    it('should work with ngOnChanges', () => {
      // #docregion OnChanges
      @Component({
        selector: 'my-cmp',
        template: `...`,
        standalone: false,
      })
      class MyComponent implements OnChanges {
        @Input() prop: number = 0;

        ngOnChanges(changes: SimpleChanges) {
          // changes.prop contains the old and the new value...
        }
      }
      // #enddocregion

      const log = createAndLogComponent(MyComponent, ['prop']);
      expect(log.length).toBe(1);
      expect(log[0][0]).toBe('ngOnChanges');
      const changes: SimpleChanges = log[0][1][0];
      expect(changes['prop'].currentValue).toBe(true);
    });
  });

  function createAndLogComponent(clazz: Type<any>, inputs: string[] = []): any[] {
    const log: any[] = [];
    createLoggingSpiesFromProto(clazz, log);

    const inputBindings = inputs.map((input) => `[${input}] = true`).join(' ');

    @Component({
      template: `<my-cmp ${inputBindings}></my-cmp>`,
      standalone: false,
    })
    class ParentComponent {}

    const fixture = TestBed.configureTestingModule({
      declarations: [ParentComponent, clazz],
    }).createComponent(ParentComponent);
    fixture.detectChanges();
    fixture.destroy();
    return log;
  }

  function createLoggingSpiesFromProto(clazz: Type<any>, log: any[]) {
    const proto = clazz.prototype;
    // For ES2015+ classes, members are not enumerable in the prototype.
    Object.getOwnPropertyNames(proto).forEach((method) => {
      if (method === 'constructor') {
        return;
      }

      proto[method] = (...args: any[]) => {
        log.push([method, args]);
      };
    });
  }
})();
