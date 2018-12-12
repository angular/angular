import {Directionality} from '@angular/cdk/bidi';
import {ENTER, COMMA} from '@angular/cdk/keycodes';
import {PlatformModule} from '@angular/cdk/platform';
import {createKeyboardEvent} from '@angular/cdk/testing';
import {Component, DebugElement, ViewChild} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatFormFieldModule} from '@angular/material/form-field';
import {Subject} from 'rxjs';
import {MatChipInput, MatChipInputEvent} from './chip-input';
import {MatChipsModule} from './index';
import {MAT_CHIPS_DEFAULT_OPTIONS, MatChipsDefaultOptions} from './chip-default-options';
import {MatChipList} from './chip-list';


describe('MatChipInput', () => {
  let fixture: ComponentFixture<any>;
  let testChipInput: TestChipInput;
  let inputDebugElement: DebugElement;
  let inputNativeElement: HTMLElement;
  let chipInputDirective: MatChipInput;
  let dir = 'ltr';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [PlatformModule, MatChipsModule, MatFormFieldModule, NoopAnimationsModule],
      declarations: [TestChipInput],
      providers: [{
        provide: Directionality, useFactory: () => {
          return {
            value: dir.toLowerCase(),
            change: new Subject()
          };
        }
      }]
    });

    TestBed.compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TestChipInput);
    testChipInput = fixture.debugElement.componentInstance;
    fixture.detectChanges();

    inputDebugElement = fixture.debugElement.query(By.directive(MatChipInput));
    chipInputDirective = inputDebugElement.injector.get<MatChipInput>(MatChipInput);
    inputNativeElement = inputDebugElement.nativeElement;
  }));

  describe('basic behavior', () => {
    it('emits the (chipEnd) on enter keyup', () => {
      let ENTER_EVENT = createKeyboardEvent('keydown', ENTER, inputNativeElement);

      spyOn(testChipInput, 'add');

      chipInputDirective._keydown(ENTER_EVENT);
      expect(testChipInput.add).toHaveBeenCalled();
    });

    it('should have a default id', () => {
      expect(inputNativeElement.getAttribute('id')).toBeTruthy();
    });

    it('should allow binding to the `placeholder` input', () => {
      expect(inputNativeElement.hasAttribute('placeholder')).toBe(false);

      testChipInput.placeholder = 'bound placeholder';
      fixture.detectChanges();

      expect(inputNativeElement.getAttribute('placeholder')).toBe('bound placeholder');
    });

    it('should propagate the dynamic `placeholder` value to the form field', () => {
      fixture.componentInstance.placeholder = 'add a chip';
      fixture.detectChanges();

      const label: HTMLElement = fixture.nativeElement.querySelector('.mat-form-field-label');

      expect(label).toBeTruthy();
      expect(label.textContent).toContain('add a chip');

      fixture.componentInstance.placeholder = 'or don\'t';
      fixture.detectChanges();

      expect(label.textContent).toContain('or don\'t');
    });

    it('should become disabled if the chip list is disabled', () => {
      expect(inputNativeElement.hasAttribute('disabled')).toBe(false);
      expect(chipInputDirective.disabled).toBe(false);

      fixture.componentInstance.chipListInstance.disabled = true;
      fixture.detectChanges();

      expect(inputNativeElement.getAttribute('disabled')).toBe('true');
      expect(chipInputDirective.disabled).toBe(true);
    });

  });

  describe('[addOnBlur]', () => {
    it('allows (chipEnd) when true', () => {
      spyOn(testChipInput, 'add');

      testChipInput.addOnBlur = true;
      fixture.detectChanges();

      chipInputDirective._blur();
      expect(testChipInput.add).toHaveBeenCalled();
    });

    it('disallows (chipEnd) when false', () => {
      spyOn(testChipInput, 'add');

      testChipInput.addOnBlur = false;
      fixture.detectChanges();

      chipInputDirective._blur();
      expect(testChipInput.add).not.toHaveBeenCalled();
    });
  });

  describe('[separatorKeyCodes]', () => {
    it('does not emit (chipEnd) when a non-separator key is pressed', () => {
      let ENTER_EVENT = createKeyboardEvent('keydown', ENTER, inputNativeElement);
      spyOn(testChipInput, 'add');

      chipInputDirective.separatorKeyCodes = [COMMA];
      fixture.detectChanges();

      chipInputDirective._keydown(ENTER_EVENT);
      expect(testChipInput.add).not.toHaveBeenCalled();
    });

    it('emits (chipEnd) when a custom separator keys is pressed', () => {
      let COMMA_EVENT = createKeyboardEvent('keydown', COMMA, inputNativeElement);
      spyOn(testChipInput, 'add');

      chipInputDirective.separatorKeyCodes = [COMMA];
      fixture.detectChanges();

      chipInputDirective._keydown(COMMA_EVENT);
      expect(testChipInput.add).toHaveBeenCalled();
    });

    it('emits accepts the custom separator keys in a Set', () => {
      let COMMA_EVENT = createKeyboardEvent('keydown', COMMA, inputNativeElement);
      spyOn(testChipInput, 'add');

      chipInputDirective.separatorKeyCodes = new Set([COMMA]);
      fixture.detectChanges();

      chipInputDirective._keydown(COMMA_EVENT);
      expect(testChipInput.add).toHaveBeenCalled();
    });

    it('emits (chipEnd) when the separator keys are configured globally', () => {
      fixture.destroy();

      TestBed
        .resetTestingModule()
        .configureTestingModule({
          imports: [MatChipsModule, MatFormFieldModule, PlatformModule, NoopAnimationsModule],
          declarations: [TestChipInput],
          providers: [{
            provide: MAT_CHIPS_DEFAULT_OPTIONS,
            useValue: ({separatorKeyCodes: [COMMA]} as MatChipsDefaultOptions)
          }]
        })
        .compileComponents();

      fixture = TestBed.createComponent(TestChipInput);
      testChipInput = fixture.debugElement.componentInstance;
      fixture.detectChanges();

      inputDebugElement = fixture.debugElement.query(By.directive(MatChipInput));
      chipInputDirective = inputDebugElement.injector.get<MatChipInput>(MatChipInput);
      inputNativeElement = inputDebugElement.nativeElement;

      spyOn(testChipInput, 'add');
      fixture.detectChanges();

      chipInputDirective._keydown(createKeyboardEvent('keydown', COMMA, inputNativeElement));
      expect(testChipInput.add).toHaveBeenCalled();
    });

    it('should not emit the chipEnd event if a separator is pressed with a modifier key', () => {
      const ENTER_EVENT = createKeyboardEvent('keydown', ENTER, inputNativeElement);
      Object.defineProperty(ENTER_EVENT, 'shiftKey', {get: () => true});
      spyOn(testChipInput, 'add');

      chipInputDirective.separatorKeyCodes = [ENTER];
      fixture.detectChanges();

      chipInputDirective._keydown(ENTER_EVENT);
      expect(testChipInput.add).not.toHaveBeenCalled();
    });

  });
});

@Component({
  template: `
    <mat-form-field>
      <mat-chip-list #chipList>
      </mat-chip-list>
      <input matInput [matChipInputFor]="chipList"
                [matChipInputAddOnBlur]="addOnBlur"
                (matChipInputTokenEnd)="add($event)"
                [placeholder]="placeholder" />
    </mat-form-field>
  `
})
class TestChipInput {
  @ViewChild(MatChipList) chipListInstance: MatChipList;
  addOnBlur: boolean = false;
  placeholder = '';

  add(_: MatChipInputEvent) {
  }
}
