import {Directionality} from '@angular/cdk/bidi';
import {BACKSPACE, DELETE, SPACE} from '@angular/cdk/keycodes';
import {createKeyboardEvent} from '@angular/cdk/testing';
import {Component, DebugElement} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MatChip, MatChipEvent, MatChipList, MatChipSelectionChange, MatChipsModule} from './index';


describe('Chips', () => {
  let fixture: ComponentFixture<any>;
  let chipDebugElement: DebugElement;
  let chipListNativeElement: HTMLElement;
  let chipNativeElement: HTMLElement;
  let chipInstance: MatChip;

  let dir = 'ltr';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatChipsModule],
      declarations: [BasicChip, SingleChip],
      providers: [{
        provide: Directionality, useFactory: () => ({value: dir})
      }]
    });

    TestBed.compileComponents();
  }));

  describe('MatBasicChip', () => {

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicChip);
      fixture.detectChanges();

      chipDebugElement = fixture.debugElement.query(By.directive(MatChip));
      chipNativeElement = chipDebugElement.nativeElement;
      chipInstance = chipDebugElement.injector.get(MatChip);

      document.body.appendChild(chipNativeElement);
    });

    afterEach(() => {
      document.body.removeChild(chipNativeElement);
    });

    it('adds the `mat-basic-chip` class', () => {
      expect(chipNativeElement.classList).toContain('mat-chip');
      expect(chipNativeElement.classList).toContain('mat-basic-chip');
    });
  });

  describe('MatChip', () => {
    let testComponent: SingleChip;

    beforeEach(() => {
      fixture = TestBed.createComponent(SingleChip);
      fixture.detectChanges();

      chipDebugElement = fixture.debugElement.query(By.directive(MatChip));
      chipListNativeElement = fixture.debugElement.query(By.directive(MatChipList)).nativeElement;
      chipNativeElement = chipDebugElement.nativeElement;
      chipInstance = chipDebugElement.injector.get(MatChip);
      testComponent = fixture.debugElement.componentInstance;

      document.body.appendChild(chipNativeElement);
    });

    afterEach(() => {
      document.body.removeChild(chipNativeElement);
    });

    describe('basic behaviors', () => {

      it('adds the `mat-chip` class', () => {
        expect(chipNativeElement.classList).toContain('mat-chip');
      });

      it('does not add the `mat-basic-chip` class', () => {
        expect(chipNativeElement.classList).not.toContain('mat-basic-chip');
      });

      it('emits focus on click', () => {
        spyOn(chipInstance, 'focus').and.callThrough();

        chipNativeElement.click();

        expect(chipInstance.focus).toHaveBeenCalledTimes(1);
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

      it('allows selection', () => {
        spyOn(testComponent, 'chipSelectionChange');
        expect(chipNativeElement.classList).not.toContain('mat-chip-selected');

        testComponent.selected = true;
        fixture.detectChanges();

        expect(chipNativeElement.classList).toContain('mat-chip-selected');
        expect(testComponent.chipSelectionChange)
            .toHaveBeenCalledWith({source: chipInstance, isUserInput: false, selected: true});
      });

      it('allows removal', () => {
        spyOn(testComponent, 'chipRemove');

        chipInstance.remove();
        fixture.detectChanges();

        expect(testComponent.chipRemove).toHaveBeenCalledWith({chip: chipInstance});
      });
    });

    describe('keyboard behavior', () => {

      describe('when selectable is true', () => {
        beforeEach(() => {
          testComponent.selectable = true;
          fixture.detectChanges();
        });

        it('should selects/deselects the currently focused chip on SPACE', () => {
          const SPACE_EVENT: KeyboardEvent = createKeyboardEvent('keydown', SPACE) as KeyboardEvent;
          const CHIP_SELECTED_EVENT: MatChipSelectionChange = {
            source: chipInstance,
            isUserInput: true,
            selected: true
          };

          const CHIP_DESELECTED_EVENT: MatChipSelectionChange = {
            source: chipInstance,
            isUserInput: true,
            selected: false
          };

          spyOn(testComponent, 'chipSelectionChange');

          // Use the spacebar to select the chip
          chipInstance._handleKeydown(SPACE_EVENT);
          fixture.detectChanges();

          expect(chipInstance.selected).toBeTruthy();
          expect(testComponent.chipSelectionChange).toHaveBeenCalledTimes(1);
          expect(testComponent.chipSelectionChange).toHaveBeenCalledWith(CHIP_SELECTED_EVENT);

          // Use the spacebar to deselect the chip
          chipInstance._handleKeydown(SPACE_EVENT);
          fixture.detectChanges();

          expect(chipInstance.selected).toBeFalsy();
          expect(testComponent.chipSelectionChange).toHaveBeenCalledTimes(2);
          expect(testComponent.chipSelectionChange).toHaveBeenCalledWith(CHIP_DESELECTED_EVENT);
        });

        it('should have correct aria-selected', () => {
          expect(chipNativeElement.getAttribute('aria-selected')).toBe('false');

          testComponent.selected = true;
          fixture.detectChanges();

          expect(chipNativeElement.getAttribute('aria-selected')).toBe('true');
        });
      });

      describe('when selectable is false', () => {
        beforeEach(() => {
          testComponent.selectable = false;
          fixture.detectChanges();
        });

        it('SPACE ignores selection', () => {
          const SPACE_EVENT: KeyboardEvent = createKeyboardEvent('keydown', SPACE) as KeyboardEvent;

          spyOn(testComponent, 'chipSelectionChange');

          // Use the spacebar to attempt to select the chip
          chipInstance._handleKeydown(SPACE_EVENT);
          fixture.detectChanges();

          expect(chipInstance.selected).toBeFalsy();
          expect(testComponent.chipSelectionChange).not.toHaveBeenCalled();
        });

        it('should not have the aria-selected attribute', () => {
          expect(chipNativeElement.hasAttribute('aria-selected')).toBe(false);
        });
      });

      describe('when removable is true', () => {
        beforeEach(() => {
          testComponent.removable = true;
          fixture.detectChanges();
        });

        it('DELETE emits the (remove) event', () => {
          const DELETE_EVENT = createKeyboardEvent('keydown', DELETE) as KeyboardEvent;

          spyOn(testComponent, 'chipRemove');

          // Use the delete to remove the chip
          chipInstance._handleKeydown(DELETE_EVENT);
          fixture.detectChanges();

          expect(testComponent.chipRemove).toHaveBeenCalled();
        });

        it('BACKSPACE emits the (remove) event', () => {
          const BACKSPACE_EVENT = createKeyboardEvent('keydown', BACKSPACE) as KeyboardEvent;

          spyOn(testComponent, 'chipRemove');

          // Use the delete to remove the chip
          chipInstance._handleKeydown(BACKSPACE_EVENT);
          fixture.detectChanges();

          expect(testComponent.chipRemove).toHaveBeenCalled();
        });
      });

      describe('when removable is false', () => {
        beforeEach(() => {
          testComponent.removable = false;
          fixture.detectChanges();
        });

        it('DELETE does not emit the (remove) event', () => {
          const DELETE_EVENT = createKeyboardEvent('keydown', DELETE) as KeyboardEvent;

          spyOn(testComponent, 'chipRemove');

          // Use the delete to remove the chip
          chipInstance._handleKeydown(DELETE_EVENT);
          fixture.detectChanges();

          expect(testComponent.chipRemove).not.toHaveBeenCalled();
        });

        it('BACKSPACE does not emit the (remove) event', () => {
          const BACKSPACE_EVENT = createKeyboardEvent('keydown', BACKSPACE) as KeyboardEvent;

          spyOn(testComponent, 'chipRemove');

          // Use the delete to remove the chip
          chipInstance._handleKeydown(BACKSPACE_EVENT);
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

      it('should make disabled chips non-focusable', () => {
        expect(chipNativeElement.getAttribute('tabindex')).toBe('-1');

        testComponent.disabled = true;
        fixture.detectChanges();

        expect(chipNativeElement.getAttribute('tabindex')).toBeFalsy();
      });

    });
  });
});

@Component({
  template: `
    <mat-chip-list>
      <div *ngIf="shouldShow">
        <mat-chip [selectable]="selectable" [removable]="removable"
                 [color]="color" [selected]="selected" [disabled]="disabled"
                 (focus)="chipFocus($event)" (destroyed)="chipDestroy($event)"
                 (selectionChange)="chipSelectionChange($event)"
                 (removed)="chipRemove($event)">
          {{name}}
        </mat-chip>
      </div>
    </mat-chip-list>`
})
class SingleChip {
  disabled: boolean = false;
  name: string = 'Test';
  color: string = 'primary';
  selected: boolean = false;
  selectable: boolean = true;
  removable: boolean = true;
  shouldShow: boolean = true;

  chipFocus: (event?: MatChipEvent) => void = () => {};
  chipDestroy: (event?: MatChipEvent) => void = () => {};
  chipSelectionChange: (event?: MatChipSelectionChange) => void = () => {};
  chipRemove: (event?: MatChipEvent) => void = () => {};
}

@Component({
  template: `<mat-basic-chip>{{name}}</mat-basic-chip>`
})
class BasicChip {
}
