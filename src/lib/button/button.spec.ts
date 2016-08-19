import {
  async,
  TestBed,
} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdButtonModule} from './button';


describe('MdButton', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdButtonModule],
      declarations: [TestApp],
    });

    TestBed.compileComponents();
  }));

  // General button tests
  it('should apply class based on color attribute', () => {
    let fixture = TestBed.createComponent(TestApp);

    let testComponent = fixture.debugElement.componentInstance;
    let buttonDebugElement = fixture.debugElement.query(By.css('button'));
    let aDebugElement = fixture.debugElement.query(By.css('a'));

    testComponent.buttonColor = 'primary';
    fixture.detectChanges();
    expect(buttonDebugElement.nativeElement.classList.contains('md-primary')).toBe(true);
    expect(aDebugElement.nativeElement.classList.contains('md-primary')).toBe(true);

    testComponent.buttonColor = 'accent';
    fixture.detectChanges();
    expect(buttonDebugElement.nativeElement.classList.contains('md-accent')).toBe(true);
    expect(aDebugElement.nativeElement.classList.contains('md-accent')).toBe(true);
  });

  it('should should not clear previous defined classes', () => {
    let fixture = TestBed.createComponent(TestApp);
    let testComponent = fixture.debugElement.componentInstance;
    let buttonDebugElement = fixture.debugElement.query(By.css('button'));

    buttonDebugElement.nativeElement.classList.add('custom-class');

    testComponent.buttonColor = 'primary';
    fixture.detectChanges();

    expect(buttonDebugElement.nativeElement.classList.contains('md-primary')).toBe(true);
    expect(buttonDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);

    testComponent.buttonColor = 'accent';
    fixture.detectChanges();

    expect(buttonDebugElement.nativeElement.classList.contains('md-primary')).toBe(false);
    expect(buttonDebugElement.nativeElement.classList.contains('md-accent')).toBe(true);
    expect(buttonDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);

  });

  // Regular button tests
  describe('button[md-button]', () => {
    it('should handle a click on the button', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('button'));

      buttonDebugElement.nativeElement.click();
      expect(testComponent.clickCount).toBe(1);
    });

    it('should not increment if disabled', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('button'));

      testComponent.isDisabled = true;
      fixture.detectChanges();

      buttonDebugElement.nativeElement.click();

      expect(testComponent.clickCount).toBe(0);
    });

  });

  // Anchor button tests
  describe('a[md-button]', () => {
    it('should not redirect if disabled', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('a'));

      testComponent.isDisabled = true;
      fixture.detectChanges();

      buttonDebugElement.nativeElement.click();
    });

    it('should remove tabindex if disabled', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('a'));
      expect(buttonDebugElement.nativeElement.getAttribute('tabIndex')).toBe(null);

      testComponent.isDisabled = true;
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.getAttribute('tabIndex')).toBe('-1');
    });

    it('should add aria-disabled attribute if disabled', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('a'));
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.getAttribute('aria-disabled')).toBe('false');

      testComponent.isDisabled = true;
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.getAttribute('aria-disabled')).toBe('true');
    });

  });
});

/** Test component that contains an MdButton. */
@Component({
  selector: 'test-app',
  template: `
    <button md-button type="button" (click)="increment()"
      [disabled]="isDisabled" [color]="buttonColor" [disableRipple]="rippleDisabled">
      Go
    </button>
    <a href="http://www.google.com" md-button [disabled]="isDisabled" [color]="buttonColor">Link</a>
  `
})
class TestApp {
  clickCount: number = 0;
  isDisabled: boolean = false;
  rippleDisabled: boolean = false;

  increment() {
    this.clickCount++;
  }
}
