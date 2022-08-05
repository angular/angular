import {Component, DebugElement} from '@angular/core';
import {waitForAsync, TestBed, ComponentFixture} from '@angular/core/testing';
import {MatChipEditInput, MatChipsModule} from './index';
import {By} from '@angular/platform-browser';

describe('MDC-based MatChipEditInput', () => {
  const DEFAULT_INITIAL_VALUE = 'INITIAL_VALUE';

  let fixture: ComponentFixture<any>;
  let inputDebugElement: DebugElement;
  let inputInstance: MatChipEditInput;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatChipsModule],
      declarations: [ChipEditInputContainer],
    });

    TestBed.compileComponents();

    fixture = TestBed.createComponent(ChipEditInputContainer);
    inputDebugElement = fixture.debugElement.query(By.directive(MatChipEditInput))!;
    inputInstance = inputDebugElement.injector.get<MatChipEditInput>(MatChipEditInput);
  }));

  describe('on initialization', () => {
    it('should set the initial input text', () => {
      inputInstance.initialize(DEFAULT_INITIAL_VALUE);
      expect(inputInstance.getNativeElement().textContent).toEqual(DEFAULT_INITIAL_VALUE);
    });

    it('should focus the input', () => {
      inputInstance.initialize(DEFAULT_INITIAL_VALUE);
      expect(document.activeElement).toEqual(inputInstance.getNativeElement());
    });
  });

  it('should update the internal value as it is set', () => {
    inputInstance.initialize(DEFAULT_INITIAL_VALUE);
    const newValue = 'NEW_VALUE';
    inputInstance.setValue(newValue);
    expect(inputInstance.getValue()).toEqual(newValue);
  });
});

@Component({
  template: `<mat-chip><span matChipEditInput></span></mat-chip>`,
})
class ChipEditInputContainer {}
