import {Directionality} from '@angular/cdk/bidi';
import {Component, DebugElement, ViewChild} from '@angular/core';
import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {MatRipple} from '@angular/material-experimental/mdc-core';
import {By} from '@angular/platform-browser';
import {Subject} from 'rxjs';
import {MatChip, MatChipEvent, MatChipSet, MatChipsModule} from './index';

describe('MDC-based MatChip', () => {
  let fixture: ComponentFixture<any>;
  let chipDebugElement: DebugElement;
  let chipNativeElement: HTMLElement;
  let chipInstance: MatChip;
  let chipRippleDebugElement: DebugElement;
  let chipRippleInstance: MatRipple;

  let dir = 'ltr';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatChipsModule],
      declarations: [
        BasicChip,
        SingleChip,
        BasicChipWithStaticTabindex,
        BasicChipWithBoundTabindex,
      ],
      providers: [
        {
          provide: Directionality,
          useFactory: () => ({
            value: dir,
            change: new Subject(),
          }),
        },
      ],
    });

    TestBed.compileComponents();
  }));

  describe('MatBasicChip', () => {
    it('adds a class to indicate that it is a basic chip', () => {
      fixture = TestBed.createComponent(BasicChip);
      fixture.detectChanges();

      const chip = fixture.nativeElement.querySelector('mat-basic-chip');
      expect(chip.classList).toContain('mat-mdc-basic-chip');
    });

    it('should be able to set a static tabindex', () => {
      fixture = TestBed.createComponent(BasicChipWithStaticTabindex);
      fixture.detectChanges();

      const chip = fixture.nativeElement.querySelector('mat-basic-chip');
      expect(chip.getAttribute('tabindex')).toBe('3');
    });

    it('should be able to set a dynamic tabindex', () => {
      fixture = TestBed.createComponent(BasicChipWithBoundTabindex);
      fixture.detectChanges();

      const chip = fixture.nativeElement.querySelector('mat-basic-chip');

      expect(chip.getAttribute('tabindex')).toBe('12');

      fixture.componentInstance.tabindex = 15;
      fixture.detectChanges();

      expect(chip.getAttribute('tabindex')).toBe('15');
    });

    it('should have its ripple disabled', () => {
      fixture = TestBed.createComponent(BasicChip);
      fixture.detectChanges();
      chipDebugElement = fixture.debugElement.query(By.directive(MatChip))!;
      chipRippleDebugElement = chipDebugElement.query(By.directive(MatRipple))!;
      chipRippleInstance = chipRippleDebugElement.injector.get<MatRipple>(MatRipple);
      expect(chipRippleInstance.disabled)
        .withContext('Expected basic chip ripples to be disabled.')
        .toBe(true);
    });
  });

  describe('MatChip', () => {
    let testComponent: SingleChip;
    let primaryAction: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SingleChip);
      fixture.detectChanges();

      chipDebugElement = fixture.debugElement.query(By.directive(MatChip))!;
      chipNativeElement = chipDebugElement.nativeElement;
      chipInstance = chipDebugElement.injector.get<MatChip>(MatChip);
      chipRippleDebugElement = chipDebugElement.query(By.directive(MatRipple))!;
      chipRippleInstance = chipRippleDebugElement.injector.get<MatRipple>(MatRipple);
      testComponent = fixture.debugElement.componentInstance;
      primaryAction = chipNativeElement.querySelector('.mdc-evolution-chip__action--primary')!;
    });

    it('adds the `mat-chip` class', () => {
      expect(chipNativeElement.classList).toContain('mat-mdc-chip');
    });

    it('does not add the `mat-basic-chip` class', () => {
      expect(chipNativeElement.classList).not.toContain('mat-mdc-basic-chip');
    });

    it('emits destroy on destruction', () => {
      spyOn(testComponent, 'chipDestroy').and.callThrough();

      // Force a destroy callback
      testComponent.shouldShow = false;
      fixture.detectChanges();

      expect(testComponent.chipDestroy).toHaveBeenCalledTimes(1);
    });

    it('allows color customization', () => {
      expect(chipNativeElement.classList).toContain('mat-primary');

      testComponent.color = 'warn';
      fixture.detectChanges();

      expect(chipNativeElement.classList).not.toContain('mat-primary');
      expect(chipNativeElement.classList).toContain('mat-warn');
    });

    it('allows removal', () => {
      spyOn(testComponent, 'chipRemove');

      chipInstance.remove();
      fixture.detectChanges();

      expect(testComponent.chipRemove).toHaveBeenCalledWith({chip: chipInstance});
    });

    it('should be able to disable ripples with the `[rippleDisabled]` input', () => {
      expect(chipRippleInstance.disabled)
        .withContext('Expected chip ripples to be enabled.')
        .toBe(false);

      testComponent.rippleDisabled = true;
      fixture.detectChanges();

      expect(chipRippleInstance.disabled)
        .withContext('Expected chip ripples to be disabled.')
        .toBe(true);
    });

    it('should disable ripples when the chip is disabled', () => {
      expect(chipRippleInstance.disabled)
        .withContext('Expected chip ripples to be enabled.')
        .toBe(false);

      testComponent.disabled = true;
      fixture.detectChanges();

      expect(chipRippleInstance.disabled)
        .withContext('Expected chip ripples to be disabled.')
        .toBe(true);
    });

    it('should make disabled chips non-focusable', () => {
      testComponent.disabled = true;
      fixture.detectChanges();
      expect(primaryAction.hasAttribute('tabindex')).toBe(false);
    });

    it('should return the chip text if value is undefined', () => {
      expect(chipInstance.value.trim()).toBe(fixture.componentInstance.name);
    });

    it('should return the chip value if defined', () => {
      fixture.componentInstance.value = 123;
      fixture.detectChanges();

      expect(chipInstance.value).toBe(123);
    });

    it('should return the chip value if set to null', () => {
      fixture.componentInstance.value = null;
      fixture.detectChanges();

      expect(chipInstance.value).toBeNull();
    });
  });
});

@Component({
  template: `
    <mat-chip-set>
      <div *ngIf="shouldShow">
        <mat-chip [removable]="removable"
                 [color]="color" [disabled]="disabled"
                 (destroyed)="chipDestroy($event)"
                 (removed)="chipRemove($event)" [value]="value" [disableRipple]="rippleDisabled">
          {{name}}
        </mat-chip>
      </div>
    </mat-chip-set>`,
})
class SingleChip {
  @ViewChild(MatChipSet) chipList: MatChipSet;
  disabled: boolean = false;
  name: string = 'Test';
  color: string = 'primary';
  removable: boolean = true;
  shouldShow: boolean = true;
  value: any;
  rippleDisabled: boolean = false;

  chipDestroy: (event?: MatChipEvent) => void = () => {};
  chipRemove: (event?: MatChipEvent) => void = () => {};
}

@Component({
  template: `<mat-basic-chip>Hello</mat-basic-chip>`,
})
class BasicChip {}

@Component({
  template: `<mat-basic-chip role="button" tabindex="3">Hello</mat-basic-chip>`,
})
class BasicChipWithStaticTabindex {}

@Component({
  template: `<mat-basic-chip role="button" [tabIndex]="tabindex">Hello</mat-basic-chip>`,
})
class BasicChipWithBoundTabindex {
  tabindex = 12;
}
