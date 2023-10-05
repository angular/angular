/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('control flow - for', () => {
  it('should create, remove and move views corresponding to items in a collection', () => {
    @Component({
      template: '@for ((item of items); track item; let idx = $index) {{{item}}({{idx}})|}',
    })
    class TestComponent {
      items = [1, 2, 3];
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('1(0)|2(1)|3(2)|');

    fixture.componentInstance.items.pop();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('1(0)|2(1)|');

    fixture.componentInstance.items.push(3);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('1(0)|2(1)|3(2)|');

    fixture.componentInstance.items[0] = 3;
    fixture.componentInstance.items[2] = 1;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('3(0)|2(1)|1(2)|');
  });

  it('should work correctly with trackBy index', () => {
    @Component({
      template: '@for ((item of items); track idx; let idx = $index) {{{item}}({{idx}})|}',
    })
    class TestComponent {
      items = [1, 2, 3];
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('1(0)|2(1)|3(2)|');

    fixture.componentInstance.items.pop();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('1(0)|2(1)|');

    fixture.componentInstance.items.push(3);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('1(0)|2(1)|3(2)|');

    fixture.componentInstance.items[0] = 3;
    fixture.componentInstance.items[2] = 1;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('3(0)|2(1)|1(2)|');
  });

  it('should support empty blocks', () => {
    @Component({
      template: '@for ((item of items); track idx; let idx = $index) {|} @empty {Empty}',
    })
    class TestComponent {
      items: number[]|null|undefined = [1, 2, 3];
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('|||');

    fixture.componentInstance.items = [];
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('Empty');

    fixture.componentInstance.items = [0, 1];
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('||');

    fixture.componentInstance.items = null;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('Empty');

    fixture.componentInstance.items = [0];
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('|');

    fixture.componentInstance.items = undefined;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('Empty');
  });

  describe('trackBy', () => {
    it('should have access to the host context in the track function', () => {
      let offsetReads = 0;

      @Component({template: '@for ((item of items); track $index + offset) {{{item}}}'})
      class TestComponent {
        items = ['a', 'b', 'c'];

        get offset() {
          offsetReads++;
          return 0;
        }
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('abc');
      expect(offsetReads).toBeGreaterThan(0);

      const prevReads = offsetReads;
      // explicitly modify the DOM text node to make sure that the list reconciliation algorithm
      // based on tracking indices overrides it.
      fixture.debugElement.childNodes[1].nativeNode.data = 'x';
      fixture.componentInstance.items.shift();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('bc');
      expect(offsetReads).toBeGreaterThan(prevReads);
    });

    it('should be able to access component properties in the tracking function from a loop at the root of the template',
       () => {
         const calls = new Set();

         @Component({
           template: `@for ((item of items); track trackingFn(item, compProp)) {{{item}}}`,
         })
         class TestComponent {
           items = ['a', 'b'];
           compProp = 'hello';

           trackingFn(item: string, message: string) {
             calls.add(`${item}:${message}`);
             return item;
           }
         }

         const fixture = TestBed.createComponent(TestComponent);
         fixture.detectChanges();
         expect([...calls].sort()).toEqual(['a:hello', 'b:hello']);
       });

    it('should be able to access component properties in the tracking function from a nested template',
       () => {
         const calls = new Set();

         @Component({
           template: `
                    @if (true) {
                      @if (true) {
                        @if (true) {
                          @for ((item of items); track trackingFn(item, compProp)) {{{item}}}
                        }
                      }
                    }
                   `,
         })
         class TestComponent {
           items = ['a', 'b'];
           compProp = 'hello';

           trackingFn(item: string, message: string) {
             calls.add(`${item}:${message}`);
             return item;
           }
         }

         const fixture = TestBed.createComponent(TestComponent);
         fixture.detectChanges();
         expect([...calls].sort()).toEqual(['a:hello', 'b:hello']);
       });
  });

  describe('list diffing and view operations', () => {
    it('should delete views in the middle', () => {
      @Component({
        template: '@for (item of items; track item; let idx = $index) {{{item}}({{idx}})|}',
      })
      class TestComponent {
        items = [1, 2, 3];
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('1(0)|2(1)|3(2)|');

      // delete in the middle
      fixture.componentInstance.items.splice(1, 1);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('1(0)|3(1)|');
    });

    it('should insert views in the middle', () => {
      @Component({
        template: '@for (item of items; track item; let idx = $index) {{{item}}({{idx}})|}',
      })
      class TestComponent {
        items = [1, 3];
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('1(0)|3(1)|');


      // add in the middle
      fixture.componentInstance.items.splice(1, 0, 2);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('1(0)|2(1)|3(2)|');
    });

    it('should replace different items', () => {
      @Component({
        template: '@for (item of items; track item; let idx = $index) {{{item}}({{idx}})|}',
      })
      class TestComponent {
        items = [1, 2, 3];
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('1(0)|2(1)|3(2)|');


      // an item in the middle stays the same, the rest gets replaced
      fixture.componentInstance.items = [5, 2, 7];
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('5(0)|2(1)|7(2)|');
    });

    it('should move and delete items', () => {
      @Component({
        template: '@for (item of items; track item; let idx = $index) {{{item}}({{idx}})|}',
      })
      class TestComponent {
        items = [1, 2, 3, 4, 5, 6];
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges(false);
      expect(fixture.nativeElement.textContent).toBe('1(0)|2(1)|3(2)|4(3)|5(4)|6(5)|');

      // move 5 and do some other delete other operations
      fixture.componentInstance.items = [5, 3, 7];
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('5(0)|3(1)|7(2)|');
    });
  });
});
