/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule, SlicePipe} from '../../index';
import {Component} from '@angular/core';
import {TestBed, waitForAsync} from '@angular/core/testing';
import {expect} from '@angular/private/testing/matchers';

describe('SlicePipe', () => {
  let list: number[];
  let str: string;
  let pipe: SlicePipe;

  beforeEach(() => {
    list = [1, 2, 3, 4, 5];
    str = 'tuvwxyz';
    pipe = new SlicePipe();
  });

  describe('supports', () => {
    it('should support strings', () => {
      expect(() => pipe.transform(str, 0)).not.toThrow();
    });
    it('should support lists', () => {
      expect(() => pipe.transform(list, 0)).not.toThrow();
    });
    it('should support readonly lists', () => {
      expect(() => pipe.transform(list as ReadonlyArray<number>, 0)).not.toThrow();
    });

    it('should not support other objects', () => {
      // so we cast as `any` to check that it throws for unsupported objects // this would not compile
      expect(() => pipe.transform({} as any, 0)).toThrow();
    });
  });

  describe('transform', () => {
    it('should return null if the value is null', () => {
      expect(pipe.transform(null, 1)).toBe(null);
    });

    it('should return null if the value is undefined', () => {
      expect(pipe.transform(undefined, 1)).toBe(null);
    });

    it('should return all items after START index when START is positive and END is omitted', () => {
      expect(pipe.transform(list, 3)).toEqual([4, 5]);
      expect(pipe.transform(str, 3)).toEqual('wxyz');
    });

    it('should return last START items when START is negative and END is omitted', () => {
      expect(pipe.transform(list, -3)).toEqual([3, 4, 5]);
      expect(pipe.transform(str, -3)).toEqual('xyz');
    });

    it('should return all items between START and END index when START and END are positive', () => {
      expect(pipe.transform(list, 1, 3)).toEqual([2, 3]);
      expect(pipe.transform(str, 1, 3)).toEqual('uv');
    });

    it('should return all items between START and END from the end when START and END are negative', () => {
      expect(pipe.transform(list, -4, -2)).toEqual([2, 3]);
      expect(pipe.transform(str, -4, -2)).toEqual('wx');
    });

    it('should return an empty value if START is greater than END', () => {
      expect(pipe.transform(list, 4, 2)).toEqual([]);
      expect(pipe.transform(str, 4, 2)).toEqual('');
    });

    it('should return an empty value if START greater than input length', () => {
      expect(pipe.transform(list, 99)).toEqual([]);
      expect(pipe.transform(str, 99)).toEqual('');
    });

    it('should return entire input if START is negative and greater than input length', () => {
      expect(pipe.transform(list, -99)).toEqual([1, 2, 3, 4, 5]);
      expect(pipe.transform(str, -99)).toEqual('tuvwxyz');
    });

    it('should not modify the input list', () => {
      expect(pipe.transform(list, 2)).toEqual([3, 4, 5]);
      expect(list).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('integration', () => {
    @Component({
      selector: 'test-comp',
      template: '{{(data | slice:1).join(",") }}',
      standalone: false,
    })
    class TestComp {
      data: any;
    }

    beforeEach(() => {
      TestBed.configureTestingModule({declarations: [TestComp], imports: [CommonModule]});
    });

    it('should work with mutable arrays', waitForAsync(() => {
      const fixture = TestBed.createComponent(TestComp);
      const mutable: number[] = [1, 2];
      fixture.componentInstance.data = mutable;
      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('2');

      mutable.push(3);
      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('2,3');
    }));
  });

  it('should be available as a standalone pipe', () => {
    @Component({
      selector: 'test-component',
      imports: [SlicePipe],
      template: '{{ title | slice:0:5 }}',
    })
    class TestComponent {
      title = 'Hello World!';
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;
    expect(content).toBe('Hello');
  });
});
