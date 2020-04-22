/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {WatchCollectionPipe} from '@angular/common';
import {Component, Input, ViewChild} from '@angular/core';
import {TestBed} from '@angular/core/testing';

fdescribe('WatchCollectionPipe', () => {
  describe('using arrays', () => {
    @Component({selector: 'inner-comp', template: '...'})
    class InnerComp {
      public counter = 0;
      private _value: string[]|null = null;

      @Input('value')
      set value(val: string[]|null) {
        this.counter++;
        this._value = val;
      }

      get value(): string[]|null {
        return this._value;
      }
    }

    @Component({template: '<inner-comp #inner [value]="value | watchCollection"></inner-comp>'})
    class App {
      value: string[]|null = null;

      @ViewChild('inner') public inner!: InnerComp;
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [App, InnerComp, WatchCollectionPipe],
      });
    });

    it('should watch arrays and provide a new array each time the collection changes', () => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const component = fixture.componentInstance;
      const innerComponent = component.inner;

      expect(innerComponent.value).toEqual(null);
      component.value = ['1', '2', '3'];

      fixture.detectChanges();
      expect(innerComponent.value).not.toBe(component.value);
      expect(innerComponent.value).toEqual(['1', '2', '3']);

      component.value.pop();
      fixture.detectChanges();
      expect(innerComponent.value).not.toBe(component.value);
      expect(innerComponent.value).toEqual(['1', '2']);

      component.value.push('3');
      fixture.detectChanges();
      expect(innerComponent.value).not.toBe(component.value);
      expect(innerComponent.value).toEqual(['1', '2', '3']);

      component.value.unshift('0');
      fixture.detectChanges();
      expect(innerComponent.value).not.toBe(component.value);
      expect(innerComponent.value).toEqual(['0', '1', '2', '3']);
    });

    it('should not emit a collection change if the contents do not change', () => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const component = fixture.componentInstance;
      const innerComponent = component.inner;

      component.value = ['a', 'b', 'c'];
      innerComponent.counter = 0;
      fixture.detectChanges();

      expect(innerComponent.counter).toEqual(1);
      fixture.detectChanges();

      expect(innerComponent.counter).toEqual(1);
      component.value.push('d');
      fixture.detectChanges();

      expect(innerComponent.counter).toEqual(2);
    });

    it('should emit a collection change if the order of entries within the array change', () => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const component = fixture.componentInstance;
      const innerComponent = component.inner;
      component.value = ['a', 'b', 'c'];

      fixture.detectChanges();
      expect(innerComponent.value).toEqual(['a', 'b', 'c']);

      swapValues(component.value, 0, 2);
      expect(component.value).toEqual(['c', 'b', 'a']);
      expect(innerComponent.value).toEqual(['a', 'b', 'c']);
      fixture.detectChanges();

      expect(innerComponent.value).toEqual(['c', 'b', 'a']);
    });
  });

  describe('using maps', () => {
    @Component({selector: 'inner-comp', template: '...'})
    class InnerComp {
      private _value: {[key: string]: any}|null = null;

      public counter = 0;

      @Input('value')
      set value(val: {[key: string]: any}|null) {
        this.counter++;
        this._value = val;
      }

      get value(): {[key: string]: any}|null {
        return this._value;
      }
    }

    @Component({template: '<inner-comp #inner [value]="value | watchCollection"></inner-comp>'})
    class App {
      value: {[key: string]: any}|null = null;

      @ViewChild('inner') public inner!: InnerComp;
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [App, InnerComp, WatchCollectionPipe],
      });
    });

    it('should watch maps and provide a new map each time the collection changes', () => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const component = fixture.componentInstance;
      const innerComponent = component.inner;

      expect(innerComponent.value).toEqual(null);
      component.value = {one: 1, two: 2};

      fixture.detectChanges();
      expect(innerComponent.value).toBe(component.value);
      expect(innerComponent.value).toEqual({one: 1, two: 2});

      delete component.value['one'];
      fixture.detectChanges();
      expect(innerComponent.value).not.toBe(component.value);
      expect(innerComponent.value).toEqual({two: 2});

      component.value['one'] = 1;
      fixture.detectChanges();
      expect(innerComponent.value).not.toBe(component.value);
      expect(innerComponent.value).toEqual({one: 1, two: 2});

      component.value['three'] = 3;
      fixture.detectChanges();
      expect(innerComponent.value).not.toBe(component.value);
      expect(innerComponent.value).toEqual({one: 1, two: 2, three: 3});
    });

    it('should not emit a collection change if the contents do not change', () => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const component = fixture.componentInstance;
      const innerComponent = component.inner;

      component.value = {one: 1, two: 2};
      innerComponent.counter = 0;
      fixture.detectChanges();

      expect(innerComponent.counter).toEqual(1);
      fixture.detectChanges();

      expect(innerComponent.counter).toEqual(1);
      component.value['three'] = 3;
      fixture.detectChanges();

      expect(innerComponent.counter).toEqual(2);
    });
  });

  describe('using non collection values', () => {
    @Component({selector: 'inner-comp', template: '...'})
    class InnerComp {
      private _value: string|number|null = null;

      public counter = 0;

      @Input('value')
      set value(val: string|number|null) {
        this.counter++;
        this._value = val;
      }

      get value() {
        return this._value;
      }
    }

    @Component({template: '<inner-comp #inner [value]="value | watchCollection"></inner-comp>'})
    class App {
      value: string|number|null = null;

      @ViewChild('inner') public inner!: InnerComp;
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [App, InnerComp, WatchCollectionPipe],
      });
    });

    it('should watch non collection values for changes', () => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const component = fixture.componentInstance;
      const innerComponent = component.inner;

      expect(innerComponent.value).toEqual(null);
      component.value = 1;

      fixture.detectChanges();
      expect(innerComponent.value).toEqual(1);

      component.value = 2;

      fixture.detectChanges();
      expect(innerComponent.value).toEqual(2);

      component.value = '3';

      fixture.detectChanges();
      expect(innerComponent.value).toEqual('3');

      component.value = null;

      fixture.detectChanges();
      expect(innerComponent.value).toEqual(null);
    });

    it('should not emit an input change if the value has not changed', () => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const component = fixture.componentInstance;
      const innerComponent = component.inner;

      component.value = 1;
      innerComponent.counter = 0;
      fixture.detectChanges();

      expect(innerComponent.counter).toEqual(1);
      fixture.detectChanges();

      expect(innerComponent.counter).toEqual(1);
      component.value = 3;
      fixture.detectChanges();

      expect(innerComponent.counter).toEqual(2);
    });
  });

  describe('using a mix of arrays and maps', () => {
    @Component({selector: 'inner-comp', template: '...'})
    class InnerComp {
      private _value: {[key: string]: any}|string[]|null = null;

      @Input('value')
      set value(val: {[key: string]: any}|string[]|null) {
        this._value = val;
      }

      get value() {
        return this._value;
      }
    }

    @Component({template: '<inner-comp #inner [value]="value | watchCollection"></inner-comp>'})
    class App {
      value: {[key: string]: any}|string[]|null = null;

      @ViewChild('inner') public inner!: InnerComp;
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [App, InnerComp, WatchCollectionPipe],
      });
    });

    it('should switch watching from a map to an array', () => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const component = fixture.componentInstance;
      const innerComponent = component.inner;

      component.value = {one: 1, two: 2};
      fixture.detectChanges();
      expect(innerComponent.value).toEqual({one: 1, two: 2});

      component.value['three'] = 3;
      fixture.detectChanges();
      expect(innerComponent.value).toEqual({one: 1, two: 2, three: 3});

      component.value = ['one', 'two'];
      fixture.detectChanges();
      expect(innerComponent.value).toEqual(['one', 'two']);

      component.value.push('three');
      fixture.detectChanges();
      expect(innerComponent.value).toEqual(['one', 'two', 'three']);
    });
  });

  describe('using ngFor', () => {
    fit('should signal to ngFor when a collection changes', () => {
      @Component({
        template: `
        <div *ngFor="let item of items | watchCollection"> {{ item }} </div>
      `
      })
      class App {
        items: any[] = [
          'one',
          'two',
          'three',
        ];
      }

      TestBed.configureTestingModule({
        declarations: [App, WatchCollectionPipe],
      });

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const component = fixture.componentInstance;
      const element = fixture.nativeElement;
      expect(element.textContent.trim().replace(/\s+/g, ',')).toEqual('one,two,three');

      component.items.push('four');
      fixture.detectChanges();

      expect(element.textContent.trim().replace(/\s+/g, ',')).toEqual('one,two,three,four');
    });
  });
});

function swapValues(arr: any[], indexA: number, indexB: number) {
  const tmp = arr[indexA];
  arr[indexA] = arr[indexB];
  arr[indexB] = tmp;
}
