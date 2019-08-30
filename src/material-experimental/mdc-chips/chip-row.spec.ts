import {Directionality} from '@angular/cdk/bidi';
import {BACKSPACE, DELETE} from '@angular/cdk/keycodes';
import {createKeyboardEvent, createFakeEvent, dispatchFakeEvent} from '@angular/cdk/testing';
import {Component, DebugElement, ViewChild} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_RIPPLE_GLOBAL_OPTIONS, RippleGlobalOptions} from '@angular/material/core';
import {By} from '@angular/platform-browser';
import {Subject} from 'rxjs';
import {MatChipEvent, MatChipGrid, MatChipRow, MatChipsModule} from './index';


describe('Row Chips', () => {
  let fixture: ComponentFixture<any>;
  let chipDebugElement: DebugElement;
  let chipNativeElement: HTMLElement;
  let chipInstance: MatChipRow;
  let globalRippleOptions: RippleGlobalOptions;

  let dir = 'ltr';

  beforeEach(async(() => {
    globalRippleOptions = {};
    TestBed.configureTestingModule({
      imports: [MatChipsModule],
      declarations: [SingleChip],
      providers: [
        {provide: MAT_RIPPLE_GLOBAL_OPTIONS, useFactory: () => globalRippleOptions},
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

      document.body.appendChild(chipNativeElement);
    });

    afterEach(() => {
      document.body.removeChild(chipNativeElement);
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

        const fakeEvent = Object.assign(createFakeEvent('transitionend'), {propertyName: 'width'});
        chipNativeElement.dispatchEvent(fakeEvent);

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
          const DELETE_EVENT = createKeyboardEvent('keydown', DELETE) as KeyboardEvent;

          spyOn(testComponent, 'chipRemove');

          chipInstance._keydown(DELETE_EVENT);
          fixture.detectChanges();

          const fakeEvent = Object.assign(createFakeEvent('transitionend'),
            {propertyName: 'width'});
          chipNativeElement.dispatchEvent(fakeEvent);

          expect(testComponent.chipRemove).toHaveBeenCalled();
        });

        it('BACKSPACE emits the (removed) event', () => {
          const BACKSPACE_EVENT = createKeyboardEvent('keydown', BACKSPACE) as KeyboardEvent;

          spyOn(testComponent, 'chipRemove');

          chipInstance._keydown(BACKSPACE_EVENT);
          fixture.detectChanges();

          const fakeEvent = Object.assign(createFakeEvent('transitionend'),
            {propertyName: 'width'});
          chipNativeElement.dispatchEvent(fakeEvent);

          expect(testComponent.chipRemove).toHaveBeenCalled();
        });
      });

      describe('when removable is false', () => {
        beforeEach(() => {
          testComponent.removable = false;
          fixture.detectChanges();
        });

        it('DELETE does not emit the (removed) event', () => {
          const DELETE_EVENT = createKeyboardEvent('keydown', DELETE) as KeyboardEvent;

          spyOn(testComponent, 'chipRemove');

          chipInstance._keydown(DELETE_EVENT);
          fixture.detectChanges();

          const fakeEvent = Object.assign(createFakeEvent('transitionend'),
            {propertyName: 'width'});
          chipNativeElement.dispatchEvent(fakeEvent);

          expect(testComponent.chipRemove).not.toHaveBeenCalled();
        });

        it('BACKSPACE does not emit the (removed) event', () => {
          const BACKSPACE_EVENT = createKeyboardEvent('keydown', BACKSPACE) as KeyboardEvent;

          spyOn(testComponent, 'chipRemove');

          // Use the delete to remove the chip
          chipInstance._keydown(BACKSPACE_EVENT);
          fixture.detectChanges();

          const fakeEvent = Object.assign(createFakeEvent('transitionend'),
            {propertyName: 'width'});
          chipNativeElement.dispatchEvent(fakeEvent);

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

          expect(document.activeElement!.classList.contains('mat-chip-row-focusable-text-content'))
              .toBe(true);
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
  });
});

@Component({
  template: `
    <mat-chip-grid #chipGrid>
      <div *ngIf="shouldShow">
        <mat-chip-row [removable]="removable"
                 [color]="color" [disabled]="disabled"
                 (focus)="chipFocus($event)" (destroyed)="chipDestroy($event)"
                 (removed)="chipRemove($event)">
          {{name}}
        </mat-chip-row>
        <input matInput [matChipInputFor]="chipGrid">
      </div>
    </mat-chip-grid>`
})
class SingleChip {
  @ViewChild(MatChipGrid, {static: false}) chipList: MatChipGrid;
  disabled: boolean = false;
  name: string = 'Test';
  color: string = 'primary';
  removable: boolean = true;
  shouldShow: boolean = true;

  chipFocus: (event?: MatChipEvent) => void = () => {};
  chipDestroy: (event?: MatChipEvent) => void = () => {};
  chipRemove: (event?: MatChipEvent) => void = () => {};
}
