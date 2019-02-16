// #docplaster
import { async, fakeAsync, ComponentFixture, TestBed, tick } from '@angular/core/testing';

// #docregion import-marbles
import { cold, getTestScheduler } from 'jasmine-marbles';
// #enddocregion import-marbles

import { TwainService }   from './twain.service';
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
    // 옵저버블은 약간 지연된 후 테스트 문장을 전달하고 종료됩니다.
    // #docregion test-quote-marbles
    const q$ = cold('---x|', { x: testQuote });
    // #enddocregion test-quote-marbles
    getQuoteSpy.and.returnValue( q$ );

    fixture.detectChanges(); // ngOnInit()
    expect(quoteEl.textContent).toBe('...', 'should show placeholder');

    // #docregion test-scheduler-flush
    getTestScheduler().flush(); // 옵저버블을 실행합니다.
    // #enddocregion test-scheduler-flush

    fixture.detectChanges(); // 화면을 갱신합니다.

    expect(quoteEl.textContent).toBe(testQuote, 'should show quote');
    expect(errorMessage()).toBeNull('should not show error');
  });
  // #enddocregion get-quote-test

  // Still need fakeAsync() because of component's setTimeout()
  // #docregion error-test
  it('should display error when TwainService fails', fakeAsync(() => {
    // 옵저버블은 약간 지연된 후 에러를 전달하고 종료됩니다.
    // #docregion error-marbles
    const q$ = cold('---#|', null, new Error('TwainService test failure'));
    // #enddocregion error-marbles
    getQuoteSpy.and.returnValue( q$ );

    fixture.detectChanges(); // ngOnInit()
    expect(quoteEl.textContent).toBe('...', 'should show placeholder');

    getTestScheduler().flush(); // 옵저버블을 실행합니다.
    tick();                     // 컴포넌트가 사용하는 setTimeout()을 처리합니다.
    fixture.detectChanges();    // 화면을 갱신합니다.

    expect(errorMessage()).toMatch(/test failure/, 'should display error');
    expect(quoteEl.textContent).toBe('...', 'should show placeholder');
  }));
  // #enddocregion error-test
});
