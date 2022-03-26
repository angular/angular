import {Directionality} from '@angular/cdk/bidi';
import {BACKSPACE, DELETE, ENTER} from '@angular/cdk/keycodes';
import {
  createKeyboardEvent,
  dispatchEvent,
  dispatchFakeEvent,
  dispatchKeyboardEvent,
} from '../../cdk/testing/private';
import {Component, DebugElement, ElementRef, ViewChild} from '@angular/core';
import {waitForAsync, ComponentFixture, TestBed, flush, fakeAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Subject} from 'rxjs';
import {
  MatChipEditedEvent,
  MatChipEditInput,
  MatChipEvent,
  MatChipGrid,
  MatChipRow,
  MatChipsModule,
} from './index';

describe('MDC-based Row Chips', () => {
  let fixture: ComponentFixture<any>;
  let chipDebugElement: DebugElement;
  let chipNativeElement: HTMLElement;
  let chipInstance: MatChipRow;

  let dir = 'ltr';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatChipsModule],
      declarations: [SingleChip],
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

  describe('MatChipRow', () => {
    let testComponent: SingleChip;

    beforeEach(() => {
      fixture = TestBed.createComponent(SingleChip);
      fixture.detectChanges();

      chipDebugElement = fixture.debugElement.query(By.directive(MatChipRow))!;
      chipNativeElement = chipDebugElement.nativeElement;
      chipInstance = chipDebugElement.injector.get<MatChipRow>(MatChipRow);
      testComponent = fixture.debugElement.componentInstance;
    });

    describe('basic behaviors', () => {
      it('adds the `mat-mdc-chip` class', () => {
        expect(chipNativeElement.classList).toContain('mat-mdc-chip');
      });

      it('does not add the `mat-basic-chip` class', () => {
        expect(chipNativeElement.classList).not.toContain('mat-basic-chip');
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

      it('should prevent the default click action', () => {
        const event = dispatchFakeEvent(chipNativeElement, 'mousedown');
        fixture.detectChanges();

        expect(event.defaultPrevented).toBe(true);
      });

      it('should have the correct role', () => {
        expect(chipNativeElement.getAttribute('role')).toBe('row');
      });

      it('should be able to set a custom role', () => {
        chipInstance.role = 'button';
        fixture.detectChanges();

        expect(chipNativeElement.getAttribute('role')).toBe('button');
      });
    });

    describe('keyboard behavior', () => {
      describe('when removable is true', () => {
        beforeEach(() => {
          testComponent.removable = true;
          fixture.detectChanges();
        });

        it('DELETE emits the (removed) event', () => {
          const DELETE_EVENT = createKeyboardEvent('keydown', DELETE);

          spyOn(testComponent, 'chipRemove');

          chipInstance._keydown(DELETE_EVENT);
          fixture.detectChanges();

          expect(testComponent.chipRemove).toHaveBeenCalled();
        });

        it('BACKSPACE emits the (removed) event', () => {
          const BACKSPACE_EVENT = createKeyboardEvent('keydown', BACKSPACE);

          spyOn(testComponent, 'chipRemove');

          chipInstance._keydown(BACKSPACE_EVENT);
          fixture.detectChanges();

          expect(testComponent.chipRemove).toHaveBeenCalled();
        });
      });

      describe('when removable is false', () => {
        beforeEach(() => {
          testComponent.removable = false;
          fixture.detectChanges();
        });

        it('DELETE does not emit the (removed) event', () => {
          const DELETE_EVENT = createKeyboardEvent('keydown', DELETE);

          spyOn(testComponent, 'chipRemove');

          chipInstance._keydown(DELETE_EVENT);
          fixture.detectChanges();

          expect(testComponent.chipRemove).not.toHaveBeenCalled();
        });

        it('BACKSPACE does not emit the (removed) event', () => {
          const BACKSPACE_EVENT = createKeyboardEvent('keydown', BACKSPACE);

          spyOn(testComponent, 'chipRemove');

          // Use the delete to remove the chip
          chipInstance._keydown(BACKSPACE_EVENT);
          fixture.detectChanges();

          expect(testComponent.chipRemove).not.toHaveBeenCalled();
        });
      });

      it('should update the aria-label for disabled chips', () => {
        const primaryActionElement = chipNativeElement.querySelector(
          '.mdc-evolution-chip__action--primary',
        )!;

        expect(primaryActionElement.getAttribute('aria-disabled')).toBe('false');

        testComponent.disabled = true;
        fixture.detectChanges();

        expect(primaryActionElement.getAttribute('aria-disabled')).toBe('true');
      });

      describe('focus management', () => {
        it('sends focus to first grid cell on mousedown', () => {
          dispatchFakeEvent(chipNativeElement, 'mousedown');
          fixture.detectChanges();

          expect(document.activeElement).toHaveClass('mdc-evolution-chip__action--primary');
        });

        it('emits focus only once for multiple focus() calls', () => {
          let counter = 0;
          chipInstance._onFocus.subscribe(() => {
            counter++;
          });

          chipInstance.focus();
          chipInstance.focus();
          fixture.detectChanges();

          expect(counter).toBe(1);
        });
      });
    });

    describe('editable behavior', () => {
      beforeEach(() => {
        testComponent.editable = true;
        fixture.detectChanges();
      });

      it('should begin editing on double click', () => {
        expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeFalsy();
        dispatchFakeEvent(chipNativeElement, 'dblclick');
        fixture.detectChanges();
        expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeTruthy();
      });

      it('should begin editing on ENTER', () => {
        expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeFalsy();
        dispatchKeyboardEvent(chipNativeElement, 'keydown', ENTER);
        fixture.detectChanges();
        expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeTruthy();
      });
    });

    describe('editing behavior', () => {
      let editInputInstance: MatChipEditInput;
      let primaryAction: HTMLElement;

      beforeEach(fakeAsync(() => {
        testComponent.editable = true;
        fixture.detectChanges();
        dispatchFakeEvent(chipNativeElement, 'dblclick');
        fixture.detectChanges();
        flush();

        spyOn(testComponent, 'chipEdit');
        const editInputDebugElement = fixture.debugElement.query(By.directive(MatChipEditInput))!;
        editInputInstance = editInputDebugElement.injector.get<MatChipEditInput>(MatChipEditInput);
        primaryAction = chipNativeElement.querySelector('.mdc-evolution-chip__action--primary')!;
      }));

      function keyDownOnPrimaryAction(keyCode: number, key: string) {
        const keyDownEvent = createKeyboardEvent('keydown', keyCode, key);
        dispatchEvent(primaryAction, keyDownEvent);
        fixture.detectChanges();
      }

      function getEditInput(): HTMLElement {
        return chipNativeElement.querySelector('.mat-chip-edit-input')!;
      }

      it('should not delete the chip on DELETE or BACKSPACE', () => {
        spyOn(testComponent, 'chipDestroy');
        keyDownOnPrimaryAction(DELETE, 'Delete');
        keyDownOnPrimaryAction(BACKSPACE, 'Backspace');
        expect(testComponent.chipDestroy).not.toHaveBeenCalled();
      });

      it('should stop editing on focusout', fakeAsync(() => {
        dispatchFakeEvent(primaryAction, 'focusout', true);
        flush();
        expect(testComponent.chipEdit).toHaveBeenCalled();
      }));

      it('should stop editing on ENTER', fakeAsync(() => {
        dispatchKeyboardEvent(getEditInput(), 'keydown', ENTER);
        fixture.detectChanges();
        flush();
        expect(testComponent.chipEdit).toHaveBeenCalled();
      }));

      it('should emit the new chip value when editing completes', fakeAsync(() => {
        const chipValue = 'chip value';
        editInputInstance.setValue(chipValue);
        dispatchKeyboardEvent(getEditInput(), 'keydown', ENTER);
        flush();
        const expectedValue = jasmine.objectContaining({value: chipValue});
        expect(testComponent.chipEdit).toHaveBeenCalledWith(expectedValue);
      }));

      it('should use the projected edit input if provided', () => {
        expect(editInputInstance.getNativeElement()).toHaveClass('projected-edit-input');
      });

      it('should use the default edit input if none is projected', () => {
        keyDownOnPrimaryAction(ENTER, 'Enter');
        testComponent.useCustomEditInput = false;
        fixture.detectChanges();
        dispatchFakeEvent(chipNativeElement, 'dblclick');
        fixture.detectChanges();
        const editInputDebugElement = fixture.debugElement.query(By.directive(MatChipEditInput))!;
        const editInputNoProject =
          editInputDebugElement.injector.get<MatChipEditInput>(MatChipEditInput);
        expect(editInputNoProject.getNativeElement()).not.toHaveClass('projected-edit-input');
      });

      it('should focus the chip content if the edit input has focus on completion', fakeAsync(() => {
        const chipValue = 'chip value';
        editInputInstance.setValue(chipValue);
        dispatchKeyboardEvent(getEditInput(), 'keydown', ENTER);
        fixture.detectChanges();
        flush();
        expect(document.activeElement).toBe(primaryAction);
      }));

      it('should focus the chip content if the body has focus on completion', fakeAsync(() => {
        const chipValue = 'chip value';
        editInputInstance.setValue(chipValue);
        (document.activeElement as HTMLElement).blur();
        dispatchKeyboardEvent(getEditInput(), 'keydown', ENTER);
        fixture.detectChanges();
        flush();
        expect(document.activeElement).toBe(primaryAction);
      }));

      it('should not change focus if another element has focus on completion', fakeAsync(() => {
        const chipValue = 'chip value';
        editInputInstance.setValue(chipValue);
        testComponent.chipInput.nativeElement.focus();
        keyDownOnPrimaryAction(ENTER, 'Enter');
        flush();
        expect(document.activeElement).not.toBe(primaryAction);
      }));
    });
  });
});

@Component({
  template: `
    <mat-chip-grid #chipGrid>
      <div *ngIf="shouldShow">
        <mat-chip-row [removable]="removable"
                 [color]="color" [disabled]="disabled" [editable]="editable"
                 (destroyed)="chipDestroy($event)"
                 (removed)="chipRemove($event)" (edited)="chipEdit($event)">
          {{name}}
          <button matChipRemove>x</button>
          <span *ngIf="useCustomEditInput" class="projected-edit-input" matChipEditInput></span>
        </mat-chip-row>
        <input matInput [matChipInputFor]="chipGrid" #chipInput>
      </div>
    </mat-chip-grid>`,
})
class SingleChip {
  @ViewChild(MatChipGrid) chipList: MatChipGrid;
  @ViewChild('chipInput') chipInput: ElementRef;
  disabled: boolean = false;
  name: string = 'Test';
  color: string = 'primary';
  removable: boolean = true;
  shouldShow: boolean = true;
  editable: boolean = false;
  useCustomEditInput: boolean = true;

  chipDestroy: (event?: MatChipEvent) => void = () => {};
  chipRemove: (event?: MatChipEvent) => void = () => {};
  chipEdit: (event?: MatChipEditedEvent) => void = () => {};
}
