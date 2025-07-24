// tslint:disable

import {DebugElement, Input} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

function it(msg: string, fn: () => void) {}
const harness = {
  query<T>(v: T): DebugElement {
    return null!;
  },
};

class SubDir {
  @Input() name = 'John';
  @Input() name2 = '';
}

class MyComp {
  @Input() hello = '';
}

it('should work', () => {
  const fixture = TestBed.createComponent(MyComp);
  // `.componentInstance` is using `any` :O
  const sub = fixture.debugElement.query(By.directive(SubDir)).componentInstance;

  expect(sub.name).toBe('John');
});

it('should work2', () => {
  const fixture = TestBed.createComponent(MyComp);
  // `.componentInstance` is using `any` :O
  const sub = harness.query(SubDir).componentInstance;

  expect(sub.name2).toBe('John');
});
