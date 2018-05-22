import {async, TestBed} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatExpansionModule, MatAccordion} from './index';


describe('MatAccordion', () => {
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

  it('should expand or collapse all enabled items', () => {
    const fixture = TestBed.createComponent(SetOfItems);
    const panels = fixture.debugElement.queryAll(By.css('.mat-expansion-panel'));

    fixture.componentInstance.multi = true;
    fixture.componentInstance.secondPanelExpanded = true;
    fixture.detectChanges();
    expect(panels[0].classes['mat-expanded']).toBeFalsy();
    expect(panels[1].classes['mat-expanded']).toBeTruthy();

    fixture.componentInstance.accordion.openAll();
    fixture.detectChanges();
    expect(panels[0].classes['mat-expanded']).toBeTruthy();
    expect(panels[1].classes['mat-expanded']).toBeTruthy();

    fixture.componentInstance.accordion.closeAll();
    fixture.detectChanges();
    expect(panels[0].classes['mat-expanded']).toBeFalsy();
    expect(panels[1].classes['mat-expanded']).toBeFalsy();
  });

  it('should not expand or collapse disabled items', () => {
    const fixture = TestBed.createComponent(SetOfItems);
    const panels = fixture.debugElement.queryAll(By.css('.mat-expansion-panel'));

    fixture.componentInstance.multi = true;
    fixture.componentInstance.secondPanelDisabled = true;
    fixture.detectChanges();
    fixture.componentInstance.accordion.openAll();
    fixture.detectChanges();
    expect(panels[0].classes['mat-expanded']).toBeTruthy();
    expect(panels[1].classes['mat-expanded']).toBeFalsy();

    fixture.componentInstance.accordion.closeAll();
    fixture.detectChanges();
    expect(panels[0].classes['mat-expanded']).toBeFalsy();
    expect(panels[1].classes['mat-expanded']).toBeFalsy();

  });

  it('should correctly apply the displayMode provided', () => {
    const fixture = TestBed.createComponent(SetOfItems);
    const firstPanel = fixture.debugElement.queryAll(By.css('.mat-expansion-panel'))[0];

    fixture.componentInstance.firstPanelExpanded = true;
    fixture.detectChanges();
    expect(firstPanel.classes['mat-expansion-panel-spacing']).toBeTruthy();

    fixture.componentInstance.displayMode = 'flat';
    fixture.detectChanges();
    expect(firstPanel.classes['mat-expansion-panel-spacing']).toBeFalsy();
  });

  it('should correctly apply the togglePosition provided', () => {
    const fixture = TestBed.createComponent(SetOfItems);
    fixture.detectChanges();
    const firstPanelHeader =
        fixture.debugElement.queryAll(By.css('.mat-expansion-indicator-container'))[0];

    expect(firstPanelHeader.classes['mat-expansion-indicator-container-before']).toBeFalsy();

    fixture.componentInstance.togglePosition = 'before';
    fixture.detectChanges();
    expect(firstPanelHeader.classes['mat-expansion-indicator-container-before']).toBeTruthy();
  });
});


@Component({template: `
  <mat-accordion [multi]="multi" [displayMode]="displayMode" [togglePosition]="togglePosition">
    <mat-expansion-panel [expanded]="firstPanelExpanded">
      <mat-expansion-panel-header>Summary</mat-expansion-panel-header>
      <p>Content</p>
    </mat-expansion-panel>
    <mat-expansion-panel [expanded]="secondPanelExpanded" [disabled]="secondPanelDisabled">
      <mat-expansion-panel-header>Summary</mat-expansion-panel-header>
      <p>Content</p>
    </mat-expansion-panel>
  </mat-accordion>`})
class SetOfItems {
  @ViewChild(MatAccordion) accordion: MatAccordion;

  multi: boolean = false;
  displayMode = 'default';
  togglePosition = 'after';
  firstPanelExpanded: boolean = false;
  secondPanelExpanded: boolean = false;
  secondPanelDisabled: boolean = false;
}
