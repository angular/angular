import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';

import {GreetComponent} from './greet.component';

describe('greet component', () => {
  it('should allow binding to an input', () => {
    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('Initial - initial-unset');

    fixture.componentInstance.firstName = 'John';
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('John - initial-unset');
  });
});

@Component({
  standalone: true,
  template: `<greet [firstName]="firstName" />`,
  imports: [GreetComponent],
})
class TestCmp {
  firstName = 'Initial';
}
