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

(async function () {
  describe('lifecycle hooks examples', () => {
    it('should work with ngOnInit', async () => {
      // #docregion OnInit
      @Component({
        selector: 'my-cmp',
        template: `...`,
      })
      class MyComponent implements OnInit {
        ngOnInit() {
          // ...
        }
      }
      // #enddocregion

      expect(await createAndLogComponent(MyComponent)).toEqual([['ngOnInit', []]]);
    });

    it('should work with ngDoCheck', async () => {
      // #docregion DoCheck
      @Component({
        selector: 'my-cmp',
        template: `...`,
      })
      class MyComponent implements DoCheck {
        ngDoCheck() {
          // ...
        }
      }
      // #enddocregion

      expect(await createAndLogComponent(MyComponent)).toEqual([['ngDoCheck', []]]);
    });

    it('should work with ngAfterContentChecked', async () => {
      // #docregion AfterContentChecked
      @Component({
        selector: 'my-cmp',
        template: `...`,
      })
      class MyComponent implements AfterContentChecked {
        ngAfterContentChecked() {
          // ...
        }
      }
      // #enddocregion

      expect(await createAndLogComponent(MyComponent)).toEqual([['ngAfterContentChecked', []]]);
    });

    it('should work with ngAfterContentInit', async () => {
      // #docregion AfterContentInit
      @Component({
        selector: 'my-cmp',
        template: `...`,
      })
      class MyComponent implements AfterContentInit {
        ngAfterContentInit() {
          // ...
        }
      }
      // #enddocregion

      expect(await createAndLogComponent(MyComponent)).toEqual([['ngAfterContentInit', []]]);
    });

    it('should work with ngAfterViewChecked', async () => {
      // #docregion AfterViewChecked
      @Component({
        selector: 'my-cmp',
        template: `...`,
      })
      class MyComponent implements AfterViewChecked {
        ngAfterViewChecked() {
          // ...
        }
      }
      // #enddocregion

      expect(await createAndLogComponent(MyComponent)).toEqual([['ngAfterViewChecked', []]]);
    });

    it('should work with ngAfterViewInit', async () => {
      // #docregion AfterViewInit
      @Component({
        selector: 'my-cmp',
        template: `...`,
      })
      class MyComponent implements AfterViewInit {
        ngAfterViewInit() {
          // ...
        }
      }
      // #enddocregion

      expect(await createAndLogComponent(MyComponent)).toEqual([['ngAfterViewInit', []]]);
    });

    it('should work with ngOnDestroy', async () => {
      // #docregion OnDestroy
      @Component({
        selector: 'my-cmp',
        template: `...`,
      })
      class MyComponent implements OnDestroy {
        ngOnDestroy() {
          // ...
        }
      }
      // #enddocregion

      expect(await createAndLogComponent(MyComponent)).toEqual([['ngOnDestroy', []]]);
    });

    it('should work with ngOnChanges', async () => {
      // #docregion OnChanges
      @Component({
        selector: 'my-cmp',
        template: `...`,
      })
      class MyComponent implements OnChanges {
        @Input() prop: number = 0;

        ngOnChanges(changes: SimpleChanges) {
          // changes.prop contains the old and the new value...
        }
      }
      // #enddocregion

      const log = await createAndLogComponent(MyComponent, ['prop']);
      expect(log.length).toBe(1);
      expect(log[0][0]).toBe('ngOnChanges');
      const changes: SimpleChanges = log[0][1][0];
      expect(changes['prop'].currentValue).toBe(true);
    });
  });

  async function createAndLogComponent(clazz: Type<any>, inputs: string[] = []): Promise<any[]> {
    const log: any[] = [];
    createLoggingSpiesFromProto(clazz, log);

    const inputBindings = inputs.map((input) => `[${input}] = true`).join(' ');

    @Component({
      template: `<my-cmp ${inputBindings}></my-cmp>`,
      imports: [clazz],
    })
    class ParentComponent {}

    const fixture = TestBed.configureTestingModule({
      imports: [ParentComponent],
    }).createComponent(ParentComponent);
    await fixture.whenStable();
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
