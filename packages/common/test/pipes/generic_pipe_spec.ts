/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { GenericPipe } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('GenericPipe', () => {

  it('test method with context and head arguments', () => {
    @Component({
      template: '{{ 3 | generic: multiply }}',
      standalone: true,
      imports: [GenericPipe],
    })
    class TestComponent {
      public y = 2;
      multiply(x: number): number {
        return x * this.y;
      }
    }
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('6');
  });

  it('test method with context and tail arguments', () => {
    @Component({
      template: '{{ 3 | generic: multiply:3 }}',
      standalone: true,
      imports: [GenericPipe],
    })
    class TestComponent {
      public y = 2;
      multiply(x: number, z: number): number {
        return x * this.y * z;
      }
    }
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('18');
  });

  it('test method with context and tail arguments with additional one', () => {
    @Component({
      template: '{{ 3 | generic: multiply:3:time }}',
      standalone: true,
      imports: [GenericPipe],
    })
    class TestComponent {
      public y = 2;
      public time: number = Date.now();
      multiply(x: number, z: number): number {
        return x * this.y * z;
      }
    }
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('18');
  });


  it('test method with context and without arguments', () => {
    @Component({
      template: '{{ undefined | generic: test }}',
      standalone: true,
      imports: [GenericPipe],
    })
    class TestComponent {
      public y = 2;
      test(): number {
        return this.y;
      }
    }
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('2');
  });

  it('test pipe transform with basic method without arguments', () => {
    const pipe = new GenericPipe({ context: this } as any);
    const fn = () => {
      return 4;
    };
    expect(pipe.transform(undefined, fn)).toBe(4);
  });

  it('test pipe transform with basic method with arg', () => {
    const y = 2;
    const pipe = new GenericPipe({ context: this } as any);
    const fn = (x: number) => {
      return x * y;
    };
    expect(pipe.transform(2, fn)).toBe(4);
  });

  it('test pipe transform with basic method with arg and additional arg', () => {
    const pipe = new GenericPipe({ context: this } as any);
    const fn = (x: number) => {
      return x * 3;
    };
    expect(pipe.transform(2, fn, [1])).toBe(6);
  });

});