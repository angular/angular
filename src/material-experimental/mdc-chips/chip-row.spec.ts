import {Directionality} from '@angular/cdk/bidi';
import {BACKSPACE, DELETE, RIGHT_ARROW, ENTER} from '@angular/cdk/keycodes';
import {
  createKeyboardEvent,
  dispatchEvent,
  dispatchFakeEvent,
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
  MatChipRemove,
  MatChipRow,
  MatChipsModule,
} from './index';


describe('MDC-based Row Chips', () => {
  let fixture: ComponentFixture<any>;
  let chipDebugElement: DebugElement;
  let chipNativeElement: HTMLElement;
  let chipInstance: MatChipRow;
  let removeIconInstance: MatChipRemove;

  let dir = 'ltr';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatChipsModule],
      declarations: [SingleChip],
      providers: [
        {provide: Directionality, useFactory: () => ({
          value: dir,
          change: new Subject()
        })},
      ]
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

      const removeIconDebugElement = fixture.debugElement.query(By.directive(MatChipRemove))!;
      removeIconInstance = removeIconDebugElement.injector.get<MatChipRemove>(MatChipRemove);
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

        it('arrow key navigation does not emit the (removed) event', () => {
          const ARROW_KEY_EVENT = createKeyboardEvent('keydown', RIGHT_ARROW);

          spyOn(testComponent, 'chipRemove');

          removeIconInstance.interaction.next(ARROW_KEY_EVENT);
          fixture.detectChanges();

          expect(testComponent.chipRemove).not.toHaveBeenCalled();
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
        expect(chipNativeElement.getAttribute('aria-disabled')).toBe('false');

        testComponent.disabled = true;
        fixture.detectChanges();

        expect(chipNativeElement.getAttribute('aria-disabled')).toBe('true');
      });

      describe('focus management', () => {
        it('sends focus to first grid cell on mousedown', () => {
          dispatchFakeEvent(chipNativeElement, 'mousedown');
          fixture.detectChanges();

          expect(document.activeElement).toHaveClass('mat-mdc-chip-row-focusable-text-content');
        });

        it('emits focus only once for multiple focus() calls', () => {
          let counter = 0;
          chipInstance._onFocus.subscribe(() => {
            counter ++ ;
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

      it('should apply the mdc-chip--editable class', () => {
        expect(chipNativeElement.classList).toContain('mdc-chip--editable');
      });

      it('should begin editing on double click', () => {
        dispatchFakeEvent(chipNativeElement, 'dblclick');
        expect(chipNativeElement.classList).toContain('mdc-chip--editing');
      });

      it('should begin editing on ENTER', () => {
        chipInstance.focus();
        const primaryActionElement = chipNativeElement.querySelector('.mdc-chip__primary-action')!;
        const enterEvent = createKeyboardEvent('keydown', ENTER, 'Enter');
        dispatchEvent(primaryActionElement, enterEvent);
        expect(chipNativeElement.classList).toContain('mdc-chip--editing');
      });
    });

    describe('editing behavior', () => {
      let editInputInstance: MatChipEditInput;
      let chipContentElement: HTMLElement;

      beforeEach(() => {
        testComponent.editable = true;
        fixture.detectChanges();
        dispatchFakeEvent(chipNativeElement, 'dblclick');
        spyOn(testComponent, 'chipEdit');
        fixture.detectChanges();

        const editInputDebugElement = fixture.debugElement.query(By.directive(MatChipEditInput))!;
        editInputInstance = editInputDebugElement.injector.get<MatChipEditInput>(MatChipEditInput);

        const chipContentSelector = '.mat-mdc-chip-row-focusable-text-content';
        chipContentElement = chipNativeElement.querySelector(chipContentSelector) as HTMLElement;
      });

      function keyDownOnPrimaryAction(keyCode: number, key: string) {
        const primaryActionElement = chipNativeElement.querySelector('.mdc-chip__primary-action')!;
        const keyDownEvent = createKeyboardEvent('keydown', keyCode, key);
        dispatchEvent(primaryActionElement, keyDownEvent);
      }

      it('should not delete the chip on DELETE or BACKSPACE', () => {
        spyOn(testComponent, 'chipDestroy');
        keyDownOnPrimaryAction(DELETE, 'Delete');
        keyDownOnPrimaryAction(BACKSPACE, 'Backspace');
        expect(testComponent.chipDestroy).not.toHaveBeenCalled();
      });

      it('should ignore mousedown events', () => {
        spyOn(testComponent, 'chipFocus');
        dispatchFakeEvent(chipNativeElement, 'mousedown');
        expect(testComponent.chipFocus).not.toHaveBeenCalled();
      });

      it('should stop editing on focusout', fakeAsync(() => {
        const primaryActionElement = chipNativeElement.querySelector('.mdc-chip__primary-action')!;
        dispatchFakeEvent(primaryActionElement, 'focusout', true);
        flush();
        expect(chipNativeElement.classList).not.toContain('mdc-chip--editing');
        expect(testComponent.chipEdit).toHaveBeenCalled();
      }));

      it('should stop editing on ENTER', () => {
        keyDownOnPrimaryAction(ENTER, 'Enter');
        expect(chipNativeElement.classList).not.toContain('mdc-chip--editing');
        expect(testComponent.chipEdit).toHaveBeenCalled();
      });

      it('should emit the new chip value when editing completes', () => {
        const chipValue = 'chip value';
        editInputInstance.setValue(chipValue);
        keyDownOnPrimaryAction(ENTER, 'Enter');
        const expectedValue = jasmine.objectContaining({value: chipValue});
        expect(testComponent.chipEdit).toHaveBeenCalledWith(expectedValue);
      });

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

      it('should focus the chip content if the edit input has focus on completion', () => {
        const chipValue = 'chip value';
        editInputInstance.setValue(chipValue);
        keyDownOnPrimaryAction(ENTER, 'Enter');
        expect(document.activeElement).toBe(chipContentElement);
      });

      it('should focus the chip content if the body has focus on completion', () => {
        const chipValue = 'chip value';
        editInputInstance.setValue(chipValue);
        (document.activeElement as HTMLElement).blur();
        keyDownOnPrimaryAction(ENTER, 'Enter');
        expect(document.activeElement).toBe(chipContentElement);
      });

      it('should not change focus if another element has focus on completion', () => {
        const chipValue = 'chip value';
        editInputInstance.setValue(chipValue);
        testComponent.chipInput.nativeElement.focus();
        keyDownOnPrimaryAction(ENTER, 'Enter');
        expect(document.activeElement).not.toBe(chipContentElement);
      });
    });
  });
});

@Component({
  template: `
    <mat-chip-grid #chipGrid>
      <div *ngIf="shouldShow">
        <mat-chip-row [removable]="removable"
                 [color]="color" [disabled]="disabled" [editable]="editable"
                 (focus)="chipFocus($event)" (destroyed)="chipDestroy($event)"
                 (removed)="chipRemove($event)" (edited)="chipEdit($event)">
          {{name}}
          <button matChipRemove>x</button>
          <span *ngIf="useCustomEditInput" class="projected-edit-input" matChipEditInput></span>
        </mat-chip-row>
        <input matInput [matChipInputFor]="chipGrid" #chipInput>
      </div>
    </mat-chip-grid>`
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

  chipFocus: (event?: MatChipEvent) => void = () => {};
  chipDestroy: (event?: MatChipEvent) => void = () => {};
  chipRemove: (event?: MatChipEvent) => void = () => {};
  chipEdit: (event?: MatChipEditedEvent) => void = () => {};
}
