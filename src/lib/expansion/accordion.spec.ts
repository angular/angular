import {async, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatExpansionModule} from './index';


describe('CdkAccordion', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatExpansionModule
      ],
      declarations: [
        SetOfItems
      ],
    });
    TestBed.compileComponents();
  }));

  it('should ensure only one item is expanded at a time', () => {
    const fixture = TestBed.createComponent(SetOfItems);
    const items = fixture.debugElement.queryAll(By.css('.mat-expansion-panel'));

    fixture.componentInstance.firstPanelExpanded = true;
    fixture.detectChanges();
    expect(items[0].classes['mat-expanded']).toBeTruthy();
    expect(items[1].classes['mat-expanded']).toBeFalsy();

    fixture.componentInstance.secondPanelExpanded = true;
    fixture.detectChanges();
    expect(items[0].classes['mat-expanded']).toBeFalsy();
    expect(items[1].classes['mat-expanded']).toBeTruthy();
  });

  it('should allow multiple items to be expanded simultaneously', () => {
    const fixture = TestBed.createComponent(SetOfItems);
    const panels = fixture.debugElement.queryAll(By.css('.mat-expansion-panel'));

    fixture.componentInstance.multi = true;
    fixture.componentInstance.firstPanelExpanded = true;
    fixture.componentInstance.secondPanelExpanded = true;
    fixture.detectChanges();
    expect(panels[0].classes['mat-expanded']).toBeTruthy();
    expect(panels[1].classes['mat-expanded']).toBeTruthy();
  });
});


@Component({template: `
  <mat-accordion [multi]="multi">
    <mat-expansion-panel [expanded]="firstPanelExpanded">
      <mat-expansion-panel-header>Summary</mat-expansion-panel-header>
      <p>Content</p>
    </mat-expansion-panel>
    <mat-expansion-panel [expanded]="secondPanelExpanded">
      <mat-expansion-panel-header>Summary</mat-expansion-panel-header>
      <p>Content</p>
    </mat-expansion-panel>
  </mat-accordion>`})
class SetOfItems {
  multi: boolean = false;
  firstPanelExpanded: boolean = false;
  secondPanelExpanded: boolean = false;
}
