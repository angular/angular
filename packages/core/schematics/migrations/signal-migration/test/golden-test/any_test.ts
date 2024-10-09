// tslint:disable

import {Input} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

function it(msg: string, fn: () => void) {}

class SubDir {
  @Input() name = 'John';
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
