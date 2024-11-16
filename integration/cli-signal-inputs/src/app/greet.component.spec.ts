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

  it('should emit an event for the click output', () => {
    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(fixture.componentInstance.clickCount).toBe(1);
    expect(fixture.componentInstance.clickCount2).toBe(1);
  });
});

@Component({
  standalone: true,
  template: `
    <greet [firstName]="firstName" (clickFromInside)="clickCount = clickCount + 1"
           (clickFromInside2)="clickCount2 = clickCount2 + 1"/>
  `,
  imports: [GreetComponent],
})
class TestCmp {
  clickCount = 0;
  clickCount2 = 0;
  firstName = 'Initial';
}
