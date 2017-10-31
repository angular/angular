import {Component} from '@angular/core';
import {TestBed, async, ComponentFixture} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MatToolbarModule} from './index';

describe('MatToolbar', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatToolbarModule],
      declarations: [ToolbarSingleRow, ToolbarMultipleRows, ToolbarMixedRowModes],
    });

    TestBed.compileComponents();
  }));

  describe('with single row', () => {
    let fixture: ComponentFixture<ToolbarSingleRow>;
    let testComponent: ToolbarSingleRow;
    let toolbarElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(ToolbarSingleRow);
      testComponent = fixture.debugElement.componentInstance;
      toolbarElement = fixture.debugElement.query(By.css('.mat-toolbar')).nativeElement;
    });

    it('should apply class based on color attribute', () => {
      testComponent.toolbarColor = 'primary';
      fixture.detectChanges();

      expect(toolbarElement.classList.contains('mat-primary')).toBe(true);

      testComponent.toolbarColor = 'accent';
      fixture.detectChanges();

      expect(toolbarElement.classList.contains('mat-primary')).toBe(false);
      expect(toolbarElement.classList.contains('mat-accent')).toBe(true);

      testComponent.toolbarColor = 'warn';
      fixture.detectChanges();

      expect(toolbarElement.classList.contains('mat-accent')).toBe(false);
      expect(toolbarElement.classList.contains('mat-warn')).toBe(true);
    });

    it('should not wrap the first row contents inside of a generated element', () => {
      expect(toolbarElement.firstElementChild!.tagName).toBe('SPAN',
          'Expected the <span> element of the first row to be a direct child of the toolbar');
    });
  });

  describe('with multiple rows', () => {

    it('should project each toolbar-row element inside of the toolbar', () => {
      const fixture = TestBed.createComponent(ToolbarMultipleRows);
      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css('.mat-toolbar > .mat-toolbar-row')).length)
        .toBe(2, 'Expected one toolbar row to be present while no content is projected.');
    });

    it('should throw an error if different toolbar modes are mixed', () => {
      expect(() => {
        const fixture = TestBed.createComponent(ToolbarMixedRowModes);
        fixture.detectChanges();
      }).toThrowError(/attempting to combine different/i);
    });

    it('should throw an error if a toolbar-row is added later', () => {
      const fixture = TestBed.createComponent(ToolbarMixedRowModes);

      fixture.componentInstance.showToolbarRow = false;
      fixture.detectChanges();

      expect(() => {
        fixture.componentInstance.showToolbarRow = true;
        fixture.detectChanges();
      }).toThrowError(/attempting to combine different/i);
    });
  });

});


@Component({
  template: `
    <mat-toolbar [color]="toolbarColor">
      <span>First Row</span>
    </mat-toolbar>
  `
})
class ToolbarSingleRow {
  toolbarColor: string;
}

@Component({
  template: `
    <mat-toolbar>
      <mat-toolbar-row>First Row</mat-toolbar-row>
      <mat-toolbar-row>Second Row</mat-toolbar-row>
    </mat-toolbar>
  `
})
class ToolbarMultipleRows {}

@Component({
  template: `
    <mat-toolbar>
      First Row
      <mat-toolbar-row *ngIf="showToolbarRow">Second Row</mat-toolbar-row>
    </mat-toolbar>
  `
})
class ToolbarMixedRowModes {
  showToolbarRow: boolean = true;
}
