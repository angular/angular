import {
  async,
  fakeAsync,
  tick,
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {NgModel, FormsModule, ReactiveFormsModule, FormControl} from '@angular/forms';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {
  MatButtonToggleGroup,
  MatButtonToggle,
  MatButtonToggleGroupMultiple,
  MatButtonToggleChange,
  MatButtonToggleModule,
} from './index';


describe('MatButtonToggle with forms', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatButtonToggleModule, FormsModule, ReactiveFormsModule],
      declarations: [
        ButtonToggleGroupWithNgModel,
        ButtonToggleGroupWithFormControl,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('using FormControl', () => {
    let fixture: ComponentFixture<ButtonToggleGroupWithFormControl>;
    let groupDebugElement: DebugElement;
    let groupInstance: MatButtonToggleGroup;
    let testComponent: ButtonToggleGroupWithFormControl;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(ButtonToggleGroupWithFormControl);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      groupDebugElement = fixture.debugElement.query(By.directive(MatButtonToggleGroup));
      groupInstance = groupDebugElement.injector.get<MatButtonToggleGroup>(MatButtonToggleGroup);
    }));

    it('should toggle the disabled state', () => {
      testComponent.control.disable();

      expect(groupInstance.disabled).toBe(true);

      testComponent.control.enable();

      expect(groupInstance.disabled).toBe(false);
    });

    it('should set the value', () => {
      testComponent.control.setValue('green');

      expect(groupInstance.value).toBe('green');

      testComponent.control.setValue('red');

      expect(groupInstance.value).toBe('red');
    });

    it('should register the on change callback', () => {
      let spy = jasmine.createSpy('onChange callback');

      testComponent.control.registerOnChange(spy);
      testComponent.control.setValue('blue');

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('button toggle group with ngModel and change event', () => {
    let fixture: ComponentFixture<ButtonToggleGroupWithNgModel>;
    let groupDebugElement: DebugElement;
    let groupNativeElement: HTMLElement;
    let buttonToggleDebugElements: DebugElement[];
    let buttonToggleNativeElements: HTMLElement[];
    let groupInstance: MatButtonToggleGroup;
    let buttonToggleInstances: MatButtonToggle[];
    let testComponent: ButtonToggleGroupWithNgModel;
    let groupNgModel: NgModel;
    let buttonToggleLabels: HTMLElement[];

    beforeEach(async(() => {
      fixture = TestBed.createComponent(ButtonToggleGroupWithNgModel);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;

      groupDebugElement = fixture.debugElement.query(By.directive(MatButtonToggleGroup));
      groupNativeElement = groupDebugElement.nativeElement;
      groupInstance = groupDebugElement.injector.get<MatButtonToggleGroup>(MatButtonToggleGroup);
      groupNgModel = groupDebugElement.injector.get<NgModel>(NgModel);

      buttonToggleDebugElements = fixture.debugElement.queryAll(By.directive(MatButtonToggle));
      buttonToggleNativeElements =
        buttonToggleDebugElements.map(debugEl => debugEl.nativeElement);
      buttonToggleInstances = buttonToggleDebugElements.map(debugEl => debugEl.componentInstance);
      buttonToggleLabels = buttonToggleDebugElements.map(
        debugEl => debugEl.query(By.css('label')).nativeElement);

      fixture.detectChanges();
    }));

    it('should update the model before firing change event', fakeAsync(() => {
      expect(testComponent.modelValue).toBeUndefined();
      expect(testComponent.lastEvent).toBeUndefined();

      buttonToggleLabels[0].click();
      fixture.detectChanges();

      tick();
      expect(testComponent.modelValue).toBe('red');
      expect(testComponent.lastEvent.value).toBe('red');
    }));

    it('should set individual radio names based on the group name', () => {
      expect(groupInstance.name).toBeTruthy();
      for (let buttonToggle of buttonToggleInstances) {
        expect(buttonToggle.name).toBe(groupInstance.name);
      }

      groupInstance.name = 'new name';
      for (let buttonToggle of buttonToggleInstances) {
        expect(buttonToggle.name).toBe(groupInstance.name);
      }
    });

    it('should check the corresponding button toggle on a group value change', () => {
      expect(groupInstance.value).toBeFalsy();
      for (let buttonToggle of buttonToggleInstances) {
        expect(buttonToggle.checked).toBeFalsy();
      }

      groupInstance.value = 'red';
      for (let buttonToggle of buttonToggleInstances) {
        expect(buttonToggle.checked).toBe(groupInstance.value === buttonToggle.value);
      }
      expect(groupInstance.selected!.value).toBe(groupInstance.value);
    });

    it('should have the correct FormControl state initially and after interaction',
      fakeAsync(() => {
        expect(groupNgModel.valid).toBe(true);
        expect(groupNgModel.pristine).toBe(true);
        expect(groupNgModel.touched).toBe(false);

        buttonToggleInstances[1].checked = true;
        fixture.detectChanges();
        tick();

        expect(groupNgModel.valid).toBe(true);
        expect(groupNgModel.pristine).toBe(true);
        expect(groupNgModel.touched).toBe(false);

        buttonToggleLabels[2].click();
        fixture.detectChanges();
        tick();

        expect(groupNgModel.valid).toBe(true);
        expect(groupNgModel.pristine).toBe(false);
        expect(groupNgModel.touched).toBe(true);
      }));

    it('should update the ngModel value when selecting a button toggle', fakeAsync(() => {
      buttonToggleLabels[1].click();
      fixture.detectChanges();

      tick();

      expect(testComponent.modelValue).toBe('green');
    }));
  });

});

describe('MatButtonToggle without forms', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatButtonToggleModule],
      declarations: [
        ButtonTogglesInsideButtonToggleGroup,
        ButtonTogglesInsideButtonToggleGroupMultiple,
        ButtonToggleGroupWithInitialValue,
        StandaloneButtonToggle,
        ButtonToggleWithAriaLabel,
        ButtonToggleWithAriaLabelledby,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('inside of an exclusive selection group', () => {

    let fixture: ComponentFixture<ButtonTogglesInsideButtonToggleGroup>;
    let groupDebugElement: DebugElement;
    let groupNativeElement: HTMLElement;
    let buttonToggleDebugElements: DebugElement[];
    let buttonToggleNativeElements: HTMLElement[];
    let buttonToggleLabelElements: HTMLLabelElement[];
    let groupInstance: MatButtonToggleGroup;
    let buttonToggleInstances: MatButtonToggle[];
    let testComponent: ButtonTogglesInsideButtonToggleGroup;

    beforeEach(() => {
      fixture = TestBed.createComponent(ButtonTogglesInsideButtonToggleGroup);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      groupDebugElement = fixture.debugElement.query(By.directive(MatButtonToggleGroup));
      groupNativeElement = groupDebugElement.nativeElement;
      groupInstance = groupDebugElement.injector.get<MatButtonToggleGroup>(MatButtonToggleGroup);

      buttonToggleDebugElements = fixture.debugElement.queryAll(By.directive(MatButtonToggle));

      buttonToggleNativeElements = buttonToggleDebugElements
        .map(debugEl => debugEl.nativeElement);

      buttonToggleLabelElements = fixture.debugElement.queryAll(By.css('label'))
        .map(debugEl => debugEl.nativeElement);

      buttonToggleInstances = buttonToggleDebugElements.map(debugEl => debugEl.componentInstance);
    });

    it('should set individual button toggle names based on the group name', () => {
      expect(groupInstance.name).toBeTruthy();
      for (let buttonToggle of buttonToggleInstances) {
        expect(buttonToggle.name).toBe(groupInstance.name);
      }
    });

    it('should disable click interactions when the group is disabled', () => {
      testComponent.isGroupDisabled = true;
      fixture.detectChanges();

      buttonToggleNativeElements[0].click();
      expect(buttonToggleInstances[0].checked).toBe(false);
      expect(buttonToggleInstances[0].disabled).toBe(true);

      testComponent.isGroupDisabled = false;
      fixture.detectChanges();

      expect(buttonToggleInstances[0].disabled).toBe(false);

      buttonToggleLabelElements[0].click();
      fixture.detectChanges();

      expect(buttonToggleInstances[0].checked).toBe(true);
    });

    it('should update the group value when one of the toggles changes', () => {
      expect(groupInstance.value).toBeFalsy();
      buttonToggleLabelElements[0].click();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('test1');
      expect(groupInstance.selected).toBe(buttonToggleInstances[0]);
    });

    it('should propagate the value change back up via a two-way binding', () => {
      expect(groupInstance.value).toBeFalsy();
      buttonToggleLabelElements[0].click();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('test1');
      expect(testComponent.groupValue).toBe('test1');
    });

    it('should update the group and toggles when one of the button toggles is clicked', () => {
      expect(groupInstance.value).toBeFalsy();
      buttonToggleLabelElements[0].click();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('test1');
      expect(groupInstance.selected).toBe(buttonToggleInstances[0]);
      expect(buttonToggleInstances[0].checked).toBe(true);
      expect(buttonToggleInstances[1].checked).toBe(false);

      buttonToggleLabelElements[1].click();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('test2');
      expect(groupInstance.selected).toBe(buttonToggleInstances[1]);
      expect(buttonToggleInstances[0].checked).toBe(false);
      expect(buttonToggleInstances[1].checked).toBe(true);
    });

    it('should check a button toggle upon interaction with underlying native radio button', () => {
      buttonToggleLabelElements[0].click();
      fixture.detectChanges();

      expect(buttonToggleInstances[0].checked).toBe(true);
      expect(groupInstance.value);
    });

    it('should change the vertical state', () => {
      expect(groupNativeElement.classList).not.toContain('mat-button-toggle-vertical');

      groupInstance.vertical = true;
      fixture.detectChanges();

      expect(groupNativeElement.classList).toContain('mat-button-toggle-vertical');
    });

    it('should emit a change event from button toggles', fakeAsync(() => {
      expect(buttonToggleInstances[0].checked).toBe(false);

      let changeSpy = jasmine.createSpy('button-toggle change listener');
      buttonToggleInstances[0].change.subscribe(changeSpy);


      buttonToggleLabelElements[0].click();
      fixture.detectChanges();
      tick();
      expect(changeSpy).toHaveBeenCalled();

      buttonToggleLabelElements[0].click();
      fixture.detectChanges();
      tick();

      // The default browser behavior is to not emit a change event, when the value was set
      // to false. That's because the current input type is set to `radio`
      expect(changeSpy).toHaveBeenCalledTimes(1);
    }));

    it('should emit a change event from the button toggle group', fakeAsync(() => {
      expect(groupInstance.value).toBeFalsy();

      let changeSpy = jasmine.createSpy('button-toggle-group change listener');
      groupInstance.change.subscribe(changeSpy);

      buttonToggleLabelElements[0].click();
      fixture.detectChanges();
      tick();
      expect(changeSpy).toHaveBeenCalled();

      buttonToggleLabelElements[1].click();
      fixture.detectChanges();
      tick();
      expect(changeSpy).toHaveBeenCalledTimes(2);
    }));

    it('should update the group and button toggles when updating the group value', () => {
      expect(groupInstance.value).toBeFalsy();

      testComponent.groupValue = 'test1';
      fixture.detectChanges();

      expect(groupInstance.value).toBe('test1');
      expect(groupInstance.selected).toBe(buttonToggleInstances[0]);
      expect(buttonToggleInstances[0].checked).toBe(true);
      expect(buttonToggleInstances[1].checked).toBe(false);

      testComponent.groupValue = 'test2';
      fixture.detectChanges();

      expect(groupInstance.value).toBe('test2');
      expect(groupInstance.selected).toBe(buttonToggleInstances[1]);
      expect(buttonToggleInstances[0].checked).toBe(false);
      expect(buttonToggleInstances[1].checked).toBe(true);
    });

    it('should deselect all of the checkboxes when the group value is cleared', () => {
      buttonToggleInstances[0].checked = true;

      expect(groupInstance.value).toBeTruthy();

      groupInstance.value = null;

      expect(buttonToggleInstances.every(toggle => !toggle.checked)).toBe(true);
    });
  });

  describe('with initial value and change event', () => {

    it('should not fire an initial change event', () => {
      let fixture = TestBed.createComponent(ButtonToggleGroupWithInitialValue);
      let testComponent = fixture.debugElement.componentInstance;
      let groupDebugElement = fixture.debugElement.query(By.directive(MatButtonToggleGroup));
      let groupInstance: MatButtonToggleGroup = groupDebugElement.injector
          .get<MatButtonToggleGroup>(MatButtonToggleGroup);

      fixture.detectChanges();

      expect(groupInstance.value).toBe('red');
      expect(testComponent.lastEvent).toBeFalsy();

      groupInstance.value = 'green';
      fixture.detectChanges();

      expect(groupInstance.value).toBe('green');
      expect(testComponent.lastEvent).toBeFalsy();
    });

  });

  describe('inside of a multiple selection group', () => {
    let fixture: ComponentFixture<ButtonTogglesInsideButtonToggleGroupMultiple>;
    let groupDebugElement: DebugElement;
    let groupNativeElement: HTMLElement;
    let buttonToggleDebugElements: DebugElement[];
    let buttonToggleNativeElements: HTMLElement[];
    let buttonToggleLabelElements: HTMLLabelElement[];
    let groupInstance: MatButtonToggleGroupMultiple;
    let buttonToggleInstances: MatButtonToggle[];
    let testComponent: ButtonTogglesInsideButtonToggleGroupMultiple;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(ButtonTogglesInsideButtonToggleGroupMultiple);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      groupDebugElement = fixture.debugElement.query(By.directive(MatButtonToggleGroupMultiple));
      groupNativeElement = groupDebugElement.nativeElement;
      groupInstance = groupDebugElement.injector.get<MatButtonToggleGroupMultiple>(
          MatButtonToggleGroupMultiple);

      buttonToggleDebugElements = fixture.debugElement.queryAll(By.directive(MatButtonToggle));
      buttonToggleNativeElements = buttonToggleDebugElements
        .map(debugEl => debugEl.nativeElement);
      buttonToggleLabelElements = fixture.debugElement.queryAll(By.css('label'))
        .map(debugEl => debugEl.nativeElement);
      buttonToggleInstances = buttonToggleDebugElements.map(debugEl => debugEl.componentInstance);
    }));

    it('should disable click interactions when the group is disabled', () => {
      testComponent.isGroupDisabled = true;
      fixture.detectChanges();

      buttonToggleNativeElements[0].click();
      expect(buttonToggleInstances[0].checked).toBe(false);
    });

    it('should check a button toggle when clicked', () => {
      expect(buttonToggleInstances.every(buttonToggle => !buttonToggle.checked)).toBe(true);

      let nativeCheckboxLabel = buttonToggleDebugElements[0].query(By.css('label')).nativeElement;

      nativeCheckboxLabel.click();
      expect(buttonToggleInstances[0].checked).toBe(true);
    });

    it('should allow for multiple toggles to be selected', () => {
      buttonToggleInstances[0].checked = true;
      fixture.detectChanges();
      expect(buttonToggleInstances[0].checked).toBe(true);

      buttonToggleInstances[1].checked = true;
      fixture.detectChanges();
      expect(buttonToggleInstances[1].checked).toBe(true);
      expect(buttonToggleInstances[0].checked).toBe(true);
    });

    it('should check a button toggle upon interaction with underlying native checkbox', () => {
      let nativeCheckboxInput = buttonToggleDebugElements[0].query(By.css('input')).nativeElement;

      nativeCheckboxInput.click();
      fixture.detectChanges();

      expect(buttonToggleInstances[0].checked).toBe(true);
    });

    it('should change the vertical state', () => {
      expect(groupNativeElement.classList).not.toContain('mat-button-toggle-vertical');

      groupInstance.vertical = true;
      fixture.detectChanges();

      expect(groupNativeElement.classList).toContain('mat-button-toggle-vertical');
    });

    it('should deselect a button toggle when selected twice', () => {
      buttonToggleNativeElements[0].click();
      fixture.detectChanges();

      buttonToggleNativeElements[0].click();
      fixture.detectChanges();

      expect(buttonToggleInstances[0].checked).toBe(false);
    });

    it('should emit a change event for state changes', fakeAsync(() => {

      expect(buttonToggleInstances[0].checked).toBe(false);

      let changeSpy = jasmine.createSpy('button-toggle change listener');
      buttonToggleInstances[0].change.subscribe(changeSpy);

      buttonToggleLabelElements[0].click();
      fixture.detectChanges();
      tick();
      expect(changeSpy).toHaveBeenCalled();

      buttonToggleLabelElements[0].click();
      fixture.detectChanges();
      tick();

      // The default browser behavior is to emit an event, when the value was set
      // to false. That's because the current input type is set to `checkbox` when
      // using the multiple mode.
      expect(changeSpy).toHaveBeenCalledTimes(2);
    }));

  });

  describe('as standalone', () => {
    let fixture: ComponentFixture<StandaloneButtonToggle>;
    let buttonToggleDebugElement: DebugElement;
    let buttonToggleNativeElement: HTMLElement;
    let buttonToggleLabelElement: HTMLLabelElement;
    let buttonToggleInstance: MatButtonToggle;
    let testComponent: StandaloneButtonToggle;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(StandaloneButtonToggle);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      buttonToggleDebugElement = fixture.debugElement.query(By.directive(MatButtonToggle));
      buttonToggleNativeElement = buttonToggleDebugElement.nativeElement;
      buttonToggleLabelElement = fixture.debugElement.query(By.css('label')).nativeElement;
      buttonToggleInstance = buttonToggleDebugElement.componentInstance;
    }));

    it('should toggle when clicked', () => {
      buttonToggleLabelElement.click();

      fixture.detectChanges();

      expect(buttonToggleInstance.checked).toBe(true);

      buttonToggleLabelElement.click();
      fixture.detectChanges();

      expect(buttonToggleInstance.checked).toBe(false);
    });

    it('should emit a change event for state changes', fakeAsync(() => {

      expect(buttonToggleInstance.checked).toBe(false);

      let changeSpy = jasmine.createSpy('button-toggle change listener');
      buttonToggleInstance.change.subscribe(changeSpy);

      buttonToggleLabelElement.click();
      fixture.detectChanges();
      tick();
      expect(changeSpy).toHaveBeenCalled();

      buttonToggleLabelElement.click();
      fixture.detectChanges();
      tick();

      // The default browser behavior is to emit an event, when the value was set
      // to false. That's because the current input type is set to `checkbox`.
      expect(changeSpy).toHaveBeenCalledTimes(2);
    }));

    it('should focus on underlying input element when focus() is called', () => {
      let nativeRadioInput = buttonToggleDebugElement.query(By.css('input')).nativeElement;
      expect(document.activeElement).not.toBe(nativeRadioInput);

      buttonToggleInstance.focus();
      fixture.detectChanges();

      expect(document.activeElement).toBe(nativeRadioInput);
    });

  });

  describe('with provided aria-label ', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let inputElement: HTMLInputElement;

    it('should use the provided aria-label', () => {
      let fixture = TestBed.createComponent(ButtonToggleWithAriaLabel);
      checkboxDebugElement = fixture.debugElement.query(By.directive(MatButtonToggle));
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      inputElement = checkboxNativeElement.querySelector('input') as HTMLInputElement;

      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-label')).toBe('Super effective');
    });
  });

  describe('with provided aria-labelledby ', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let inputElement: HTMLInputElement;

    it('should use the provided aria-labelledby', () => {
      let fixture = TestBed.createComponent(ButtonToggleWithAriaLabelledby);
      checkboxDebugElement = fixture.debugElement.query(By.directive(MatButtonToggle));
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      inputElement = checkboxNativeElement.querySelector('input') as HTMLInputElement;

      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-labelledby')).toBe('some-id');
    });

    it('should not assign aria-labelledby if none is provided', () => {
      let fixture = TestBed.createComponent(StandaloneButtonToggle);
      checkboxDebugElement = fixture.debugElement.query(By.directive(MatButtonToggle));
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      inputElement = checkboxNativeElement.querySelector('input') as HTMLInputElement;

      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-labelledby')).toBe(null);
    });
  });
});

@Component({
  template: `
  <mat-button-toggle-group [disabled]="isGroupDisabled"
                           [vertical]="isVertical"
                           [(value)]="groupValue">
    <mat-button-toggle value="test1">Test1</mat-button-toggle>
    <mat-button-toggle value="test2">Test2</mat-button-toggle>
    <mat-button-toggle value="test3">Test3</mat-button-toggle>
  </mat-button-toggle-group>
  `
})
class ButtonTogglesInsideButtonToggleGroup {
  isGroupDisabled: boolean = false;
  isVertical: boolean = false;
  groupValue: string;
}

@Component({
  template: `
  <mat-button-toggle-group [(ngModel)]="modelValue" (change)="lastEvent = $event">
    <mat-button-toggle *ngFor="let option of options" [value]="option.value">
      {{option.label}}
    </mat-button-toggle>
  </mat-button-toggle-group>
  `
})
class ButtonToggleGroupWithNgModel {
  modelValue: string;
  options = [
    {label: 'Red', value: 'red'},
    {label: 'Green', value: 'green'},
    {label: 'Blue', value: 'blue'},
  ];
  lastEvent: MatButtonToggleChange;
}

@Component({
  template: `
  <mat-button-toggle-group [disabled]="isGroupDisabled" [vertical]="isVertical" multiple>
    <mat-button-toggle value="eggs">Eggs</mat-button-toggle>
    <mat-button-toggle value="flour">Flour</mat-button-toggle>
    <mat-button-toggle value="sugar">Sugar</mat-button-toggle>
  </mat-button-toggle-group>
  `
})
class ButtonTogglesInsideButtonToggleGroupMultiple {
  isGroupDisabled: boolean = false;
  isVertical: boolean = false;
}

@Component({
  template: `
  <mat-button-toggle>Yes</mat-button-toggle>
  `
})
class StandaloneButtonToggle { }

@Component({
  template: `
  <mat-button-toggle-group (change)="lastEvent = $event" value="red">
    <mat-button-toggle value="red">Value Red</mat-button-toggle>
    <mat-button-toggle value="green">Value Green</mat-button-toggle>
  </mat-button-toggle-group>
  `
})
class ButtonToggleGroupWithInitialValue {
  lastEvent: MatButtonToggleChange;
}

@Component({
  template: `
  <mat-button-toggle-group [formControl]="control">
    <mat-button-toggle value="red">Value Red</mat-button-toggle>
    <mat-button-toggle value="green">Value Green</mat-button-toggle>
    <mat-button-toggle value="blue">Value Blue</mat-button-toggle>
  </mat-button-toggle-group>
  `
})
class ButtonToggleGroupWithFormControl {
  control = new FormControl();
}

/** Simple test component with an aria-label set. */
@Component({
  template: `<mat-button-toggle aria-label="Super effective"></mat-button-toggle>`
})
class ButtonToggleWithAriaLabel { }

/** Simple test component with an aria-label set. */
@Component({
  template: `<mat-button-toggle aria-labelledby="some-id"></mat-button-toggle>`
})
class ButtonToggleWithAriaLabelledby {}
