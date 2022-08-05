import {Component, DebugElement, QueryList} from '@angular/core';
import {waitForAsync, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {CommonModule} from '@angular/common';
import {By} from '@angular/platform-browser';
import {MatChip, MatChipSet, MatChipsModule} from './index';

describe('MDC-based MatChipSet', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatChipsModule, CommonModule],
      declarations: [BasicChipSet, IndirectDescendantsChipSet],
    });

    TestBed.compileComponents();
  }));

  describe('BasicChipSet', () => {
    let fixture: ComponentFixture<any>;
    let chipSetDebugElement: DebugElement;
    let chipSetNativeElement: HTMLElement;
    let chipSetInstance: MatChipSet;
    let chips: QueryList<MatChip>;

    describe('basic behaviors', () => {
      beforeEach(() => {
        fixture = TestBed.createComponent(BasicChipSet);
        fixture.detectChanges();

        chipSetDebugElement = fixture.debugElement.query(By.directive(MatChipSet))!;
        chipSetNativeElement = chipSetDebugElement.nativeElement;
        chipSetInstance = chipSetDebugElement.componentInstance;
        chips = chipSetInstance._chips;
      });

      it('should add the `mat-mdc-chip-set` class', () => {
        expect(chipSetNativeElement.classList).toContain('mat-mdc-chip-set');
      });

      it('should toggle the chips disabled state based on whether it is disabled', () => {
        expect(chips.toArray().every(chip => chip.disabled)).toBe(false);

        chipSetInstance.disabled = true;
        fixture.detectChanges();

        expect(chips.toArray().every(chip => chip.disabled)).toBe(true);

        chipSetInstance.disabled = false;
        fixture.detectChanges();

        expect(chips.toArray().every(chip => chip.disabled)).toBe(false);
      });

      it('should disable a chip that is added after the set became disabled', fakeAsync(() => {
        expect(chips.toArray().every(chip => chip.disabled)).toBe(false);

        chipSetInstance.disabled = true;
        fixture.detectChanges();

        expect(chips.toArray().every(chip => chip.disabled)).toBe(true);

        fixture.componentInstance.chips.push(5, 6);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(chips.toArray().every(chip => chip.disabled)).toBe(true);
      }));

      it('should have role presentation by default', () => {
        expect(chipSetNativeElement.getAttribute('role')).toBe('presentation');
      });

      it('should allow a custom role to be specified', () => {
        chipSetInstance.role = 'list';
        fixture.detectChanges();
        expect(chipSetNativeElement.getAttribute('role')).toBe('list');
      });
    });
  });

  it('should sync the disabled state to indirect descendant chips', () => {
    const fixture = TestBed.createComponent(IndirectDescendantsChipSet);
    fixture.detectChanges();

    const chipSetDebugElement = fixture.debugElement.query(By.directive(MatChipSet))!;
    const chipSetInstance = chipSetDebugElement.componentInstance;
    const chips: QueryList<MatChip> = chipSetInstance._chips;

    expect(chips.toArray().every(chip => chip.disabled)).toBe(false);

    chipSetInstance.disabled = true;
    fixture.detectChanges();

    expect(chips.toArray().every(chip => chip.disabled)).toBe(true);

    chipSetInstance.disabled = false;
    fixture.detectChanges();

    expect(chips.toArray().every(chip => chip.disabled)).toBe(false);
  });
});

@Component({
  template: `
      <mat-chip-set>
        <mat-chip *ngFor="let i of chips">
          {{name}} {{i + 1}}
        </mat-chip>
      </mat-chip-set>
  `,
})
class BasicChipSet {
  name: string = 'Test';
  chips = [0, 1, 2, 3, 4];
}

@Component({
  template: `
    <mat-chip-set>
      <ng-container [ngSwitch]="true">
        <mat-chip *ngFor="let i of chips">
          {{name}} {{i + 1}}
        </mat-chip>
      </ng-container>
    </mat-chip-set>
  `,
})
class IndirectDescendantsChipSet extends BasicChipSet {}
