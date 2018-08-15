// #docplaster
import { async, fakeAsync, ComponentFixture, TestBed, tick } from '@angular/core/testing';

// #docregion import-marbles
import { cold, getTestScheduler } from 'jasmine-marbles';
// #enddocregion import-marbles

import { TwainService } from './twain.service';
import { TwainComponent } from './twain.component';


describe('TwainComponent (marbles)', () => {
  let component: TwainComponent;
  let fixture: ComponentFixture<TwainComponent>;
  let getQuoteSpy: jasmine.Spy;
  let quoteEl: HTMLElement;
  let testQuote: string;

  // Helper function to get the error message element value
  // An *ngIf keeps it out of the DOM until there is an error
  const errorMessage = () => {
    const el = fixture.nativeElement.querySelector('.error');
    return el ? el.textContent : null;
  };

  beforeEach(() => {
    // Create a fake TwainService object with a `getQuote()` spy
    const twainService = jasmine.createSpyObj('TwainService', ['getQuote']);
    getQuoteSpy = twainService.getQuote;

    TestBed.configureTestingModule({
      declarations: [ TwainComponent ],
      providers:    [
        { provide: TwainService, useValue: twainService }
      ]
    });

    fixture = TestBed.createComponent(TwainComponent);
    component = fixture.componentInstance;
    quoteEl = fixture.nativeElement.querySelector('.twain');
    testQuote = 'Test Quote';
  });

  // A synchronous test that simulates async behavior
  // #docregion get-quote-test
  it('should show quote after getQuote (marbles)', () => {
    // observable test quote value and complete(), after delay
    // #docregion test-quote-marbles
    const q$ = cold('---x|', { x: testQuote });
    // #enddocregion test-quote-marbles
    getQuoteSpy.and.returnValue( q$ );

    fixture.detectChanges(); // ngOnInit()
    expect(quoteEl.textContent).toBe('...', 'should show placeholder');

    // #docregion test-scheduler-flush
    getTestScheduler().flush(); // flush the observables
    // #enddocregion test-scheduler-flush

    fixture.detectChanges(); // update view

    expect(quoteEl.textContent).toBe(testQuote, 'should show quote');
    expect(errorMessage()).toBeNull('should not show error');
  });
  // #enddocregion get-quote-test

  // Still need fakeAsync() because of component's setTimeout()
  // #docregion error-test
  it('should display error when TwainService fails', fakeAsync(() => {
    // observable error after delay
    // #docregion error-marbles
    const q$ = cold('---#|', null, new Error('TwainService test failure'));
    // #enddocregion error-marbles
    getQuoteSpy.and.returnValue( q$ );

    fixture.detectChanges(); // ngOnInit()
    expect(quoteEl.textContent).toBe('...', 'should show placeholder');

    getTestScheduler().flush(); // flush the observables
    tick();                     // component shows error after a setTimeout()
    fixture.detectChanges();    // update error message

    expect(errorMessage()).toMatch(/test failure/, 'should display error');
    expect(quoteEl.textContent).toBe('...', 'should show placeholder');
  }));
  // #enddocregion error-test
});
