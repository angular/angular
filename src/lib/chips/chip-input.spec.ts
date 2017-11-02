import {Directionality} from '@angular/cdk/bidi';
import {ENTER, COMMA} from '@angular/cdk/keycodes';
import {PlatformModule} from '@angular/cdk/platform';
import {createKeyboardEvent} from '@angular/cdk/testing';
import {Component, DebugElement} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MatChipInput, MatChipInputEvent} from './chip-input';
import {MatChipsModule} from './index';


describe('MatChipInput', () => {
  let fixture: ComponentFixture<any>;
  let testChipInput: TestChipInput;
  let inputDebugElement: DebugElement;
  let inputNativeElement: HTMLElement;
  let chipInputDirective: MatChipInput;

  let dir = 'ltr';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatChipsModule, PlatformModule],
      declarations: [TestChipInput],
      providers: [{
        provide: Directionality, useFactory: () => {
          return {value: dir.toLowerCase()};
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
    chipInputDirective = inputDebugElement.injector.get(MatChipInput) as MatChipInput;
    inputNativeElement = inputDebugElement.nativeElement;
  }));

  describe('basic behavior', () => {
    it('emits the (chipEnd) on enter keyup', () => {
      let ENTER_EVENT = createKeyboardEvent('keydown', ENTER, inputNativeElement) as any;

      spyOn(testChipInput, 'add');

      chipInputDirective._keydown(ENTER_EVENT);
      expect(testChipInput.add).toHaveBeenCalled();
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

  describe('[separatorKeysCodes]', () => {
    it('does not emit (chipEnd) when a non-separator key is pressed', () => {
      let ENTER_EVENT = createKeyboardEvent('keydown', ENTER, inputNativeElement) as any;
      spyOn(testChipInput, 'add');

      testChipInput.separatorKeys = [COMMA];
      fixture.detectChanges();

      chipInputDirective._keydown(ENTER_EVENT);
      expect(testChipInput.add).not.toHaveBeenCalled();
    });

    it('emits (chipEnd) when a custom separator keys is pressed', () => {
      let COMMA_EVENT = createKeyboardEvent('keydown', COMMA, inputNativeElement) as any;
      spyOn(testChipInput, 'add');

      testChipInput.separatorKeys = [COMMA];
      fixture.detectChanges();

      chipInputDirective._keydown(COMMA_EVENT);
      expect(testChipInput.add).toHaveBeenCalled();
    });
  });
});

@Component({
  template: `
    <mat-chip-list #chipList>
    </mat-chip-list>
    <input matInput [matChipInputFor]="chipList"
              [matChipInputAddOnBlur]="addOnBlur"
              [matChipInputSeparatorKeyCodes]="separatorKeys"
              (matChipInputTokenEnd)="add($event)" />
  `
})
class TestChipInput {
  addOnBlur: boolean = false;
  separatorKeys: number[] = [ENTER];

  add(_: MatChipInputEvent) {
  }
}
