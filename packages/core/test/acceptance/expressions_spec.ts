/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '../../src/core';
import {TestBed} from '../../testing';

describe('expressions', () => {
  it('should support nullish coalescing operator', async () => {
    // Nullish should not pass a null value (as hinted by the TCB)
    // https://github.com/angular/angular/issues/37622

    @Component({
      template: `{{ method(prop?.field) === undefined }}`,
    })
    class App {
      prop: {field: string} | undefined = undefined;
      method(param: string | undefined) {
        // unexpected null should never happen
        return param === null ? 'unexpected null' : param;
      }
    }

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.innerHTML).toEqual('true');
  });

  it('should return null for safe calls when using the $safeNavigationMigration magic function', async () => {
    @Component({
      template: `{{ method($safeNavigationMigration(prop?.field)) }}`,
    })
    class App {
      prop: {field: string} | undefined = undefined;
      method(param: string | undefined) {
        // unexpected null should never happen
        return param === null ? 'unexpected null' : param;
      }
    }

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.innerHTML).toEqual('unexpected null');
  });

  // Note: tests in this suite have `prettier-ignore` since Prettier hasn't
  // been updated to handle the new syntax at the time of writing.
  describe('increment/decrement operators', () => {
    it('should support increment and decrement operators in templates', async () => {
      @Component({
        // prettier-ignore
        template: `
          <button class="postfix-increment" (click)="a++"></button>
          <button class="prefix-increment" (click)="++b"></button>
          <button class="postfix-decrement" (click)="c--"></button>
          <button class="prefix-decrement" (click)="--d"></button>
          <div class="output">{{ a }}-{{ b }}-{{ c }}-{{ d }}</div>
        `,
      })
      class App {
        a = 0;
        b = 0;
        c = 10;
        d = 10;
      }

      const fixture = TestBed.createComponent(App);
      const root = fixture.nativeElement;
      const output = root.querySelector('.output');
      await fixture.whenStable();
      expect(output.textContent).toBe('0-0-10-10');

      root.querySelector('.postfix-increment').click();
      root.querySelector('.prefix-increment').click();
      root.querySelector('.postfix-decrement').click();
      root.querySelector('.prefix-decrement').click();
      await fixture.whenStable();

      expect(fixture.componentInstance.a).toBe(1);
      expect(fixture.componentInstance.b).toBe(1);
      expect(fixture.componentInstance.c).toBe(9);
      expect(fixture.componentInstance.d).toBe(9);
      expect(output.textContent).toBe('1-1-9-9');
    });

    it('should support increment and decrement on object properties and array items', async () => {
      @Component({
        // prettier-ignore
        template: `
          <button class="object-postfix-increment" (click)="obj.count++"></button>
          <button class="object-prefix-decrement" (click)="--obj.count"></button>
          <button class="array-postfix-increment" (click)="items[0]++"></button>
          <button class="array-prefix-decrement" (click)="--items[index]"></button>
          <div class="output">{{ obj.count }}-{{ items[0] }}-{{ items[1] }}</div>
        `,
      })
      class App {
        obj = {count: 5};
        items = [10, 20];
        index = 1;
      }

      const fixture = TestBed.createComponent(App);
      const root = fixture.nativeElement;
      const output = root.querySelector('.output');
      await fixture.whenStable();
      expect(output.textContent).toBe('5-10-20');

      root.querySelector('.object-postfix-increment').click();
      root.querySelector('.array-postfix-increment').click();
      await fixture.whenStable();

      expect(fixture.componentInstance.obj.count).toBe(6);
      expect(fixture.componentInstance.items[0]).toBe(11);
      expect(output.textContent).toBe('6-11-20');

      root.querySelector('.object-prefix-decrement').click();
      root.querySelector('.array-prefix-decrement').click();
      await fixture.whenStable();

      expect(fixture.componentInstance.obj.count).toBe(5);
      expect(fixture.componentInstance.items[1]).toBe(19);
      expect(output.textContent).toBe('5-11-19');
    });

    it('should evaluate postfix updates to the value before the update', async () => {
      @Component({
        // prettier-ignore
        template: `
          <button class="postfix" (click)="captured = capture(counter++)"></button>
          <button class="prefix" (click)="captured = capture(++counter)"></button>
          <div class="output">{{ counter }}-{{ captured }}</div>
        `,
      })
      class App {
        counter = 0;
        captured = 0;
        capture(value: number) {
          return value;
        }
      }

      const fixture = TestBed.createComponent(App);
      const root = fixture.nativeElement;
      const output = root.querySelector('.output');
      await fixture.whenStable();

      fixture.nativeElement.querySelector('.postfix').click();
      await fixture.whenStable();
      expect(output.textContent).toBe('1-0');

      fixture.nativeElement.querySelector('.prefix').click();
      await fixture.whenStable();
      expect(output.textContent).toBe('2-2');
    });

    it('should support increment and decrement inside arrow functions in event bindings', async () => {
      @Component({
        template: `
          <button (click)="execute(() => counter++)">Click</button>
          <div class="output">{{ counter }}</div>
        `,
      })
      class App {
        counter = 0;
        execute(fn: () => void) {
          fn();
        }
      }

      const fixture = TestBed.createComponent(App);
      const output = fixture.nativeElement.querySelector('.output');
      await fixture.whenStable();
      expect(output.textContent).toBe('0');

      fixture.nativeElement.querySelector('button').click();
      await fixture.whenStable();

      expect(fixture.componentInstance.counter).toBe(1);
      expect(output.textContent).toBe('1');
    });

    it('should evaluate ambiguous usages of `+` and `-` similarly to native JS', async () => {
      @Component({
        // prettier-ignore
        template: `
          <button class="one" (click)="one = a+++b"></button>
          <button class="two" (click)="two = c- --d"></button>
          <button class="three" (click)="three = e+++ +f"></button>
        `,
      })
      class App {
        a = 5;
        b = 3;
        c = 5;
        d = 3;
        e = 5;
        f = 3;
        one = 0;
        two = 0;
        three = 0;
      }

      const fixture = TestBed.createComponent(App);
      const {nativeElement: root, componentInstance: instance} = fixture;
      await fixture.whenStable();

      // `a+++b` is `(a++) + b`, not `a + (+(+b))`.
      root.querySelector('.one').click();
      await fixture.whenStable();
      expect(instance.one).toBe(8);
      expect(instance.a).toBe(6);

      // `c- --d` is `c - (--d)`.
      root.querySelector('.two').click();
      await fixture.whenStable();
      expect(instance.two).toBe(3);
      expect(instance.c).toBe(5);
      expect(instance.d).toBe(2);

      // `e+++ +f` is `(e++) + (+f)`.
      root.querySelector('.three').click();
      await fixture.whenStable();
      expect(instance.three).toBe(8);
      expect(instance.e).toBe(6);
    });

    it('should give ++ and -- the same precedence as native JS', async () => {
      @Component({
        // prettier-ignore
        template: `
          <button class="negate" (click)="negated = -a++"></button>
          <button class="not" (click)="notted = !b++"></button>
          <button class="exponentiation-left" (click)="expLeft = c++ ** 2"></button>
          <button class="exponentiation-right" (click)="expRight = 2 ** d++"></button>
        `,
      })
      class App {
        a = 5;
        b = 0;
        c = 5;
        d = 3;
        negated = 0;
        notted = false;
        expLeft = 0;
        expRight = 0;
      }

      const fixture = TestBed.createComponent(App);
      const {nativeElement: root, componentInstance: instance} = fixture;
      await fixture.whenStable();

      // `-a++` is `-(a++)`, so it negates the value from before the increment.
      root.querySelector('.negate').click();
      await fixture.whenStable();
      expect(instance.negated).toBe(-5);
      expect(instance.a).toBe(6);

      // `!b++` is `!(b++)`, so it negates the value from before the increment.
      root.querySelector('.not').click();
      await fixture.whenStable();
      expect(instance.notted).toBe(true);
      expect(instance.b).toBe(1);

      // Unlike other unary operators, `++`/`--` are allowed on the left-hand side of `**`.
      root.querySelector('.exponentiation-left').click();
      await fixture.whenStable();
      expect(instance.expLeft).toBe(25);
      expect(instance.c).toBe(6);

      root.querySelector('.exponentiation-right').click();
      await fixture.whenStable();
      expect(instance.expRight).toBe(8);
      expect(instance.d).toBe(4);
    });

    it('should evaluate multiple updates of the same value from left to right', async () => {
      @Component({
        // prettier-ignore
        template: `
          <button class="add" (click)="added = a++ + ++a"></button>
          <button class="subtract" (click)="subtracted = b++ - b--"></button>
        `,
      })
      class App {
        a = 5;
        b = 5;
        added = 0;
        subtracted = 0;
      }

      const fixture = TestBed.createComponent(App);
      const {nativeElement: root, componentInstance: instance} = fixture;
      await fixture.whenStable();

      // `a++ + ++a` is `5 + 7`.
      root.querySelector('.add').click();
      await fixture.whenStable();
      expect(instance.added).toBe(12);
      expect(instance.a).toBe(7);

      // `b++ - b--` is `5 - 6`.
      root.querySelector('.subtract').click();
      await fixture.whenStable();
      expect(instance.subtracted).toBe(-1);
      expect(instance.b).toBe(5);
    });
  });
});
