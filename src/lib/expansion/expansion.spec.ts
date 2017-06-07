import {async, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MdExpansionModule} from './index';


describe('MdExpansionPanel', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MdExpansionModule
      ],
      declarations: [
        PanelWithContent
      ],
    });
    TestBed.compileComponents();
  }));

  it('should expanded and collapse the panel', () => {
    let fixture = TestBed.createComponent(PanelWithContent);
    let contentEl = fixture.debugElement.query(By.css('.mat-expansion-panel-content'));
    let headerEl = fixture.debugElement.query(By.css('.mat-expansion-panel-header'));
    fixture.detectChanges();
    expect(headerEl.classes['mat-expanded']).toBeFalsy();
    expect(contentEl.classes['mat-expanded']).toBeFalsy();

    fixture.componentInstance.expanded = true;
    fixture.detectChanges();
    expect(headerEl.classes['mat-expanded']).toBeTruthy();
    expect(contentEl.classes['mat-expanded']).toBeTruthy();
  });

  it('emit correct events for change in panel expanded state', () => {
    let fixture = TestBed.createComponent(PanelWithContent);
    fixture.componentInstance.expanded = true;
    fixture.detectChanges();
    expect(fixture.componentInstance.openCallback).toHaveBeenCalled();

    fixture.componentInstance.expanded = false;
    fixture.detectChanges();
    expect(fixture.componentInstance.closeCallback).toHaveBeenCalled();
  });

  it('creates a unique panel id for each panel', () => {
    let fixtureOne = TestBed.createComponent(PanelWithContent);
    let headerElOne = fixtureOne.nativeElement.querySelector('.mat-expansion-panel-header');
    let fixtureTwo = TestBed.createComponent(PanelWithContent);
    let headerElTwo = fixtureTwo.nativeElement.querySelector('.mat-expansion-panel-header');
    fixtureOne.detectChanges();
    fixtureTwo.detectChanges();

    let panelIdOne = headerElOne.getAttribute('aria-controls');
    let panelIdTwo = headerElTwo.getAttribute('aria-controls');
    expect(panelIdOne).not.toBe(panelIdTwo);
  });
});


@Component({template: `
  <md-expansion-panel [expanded]="expanded"
                      (opened)="openCallback()"
                      (closed)="closeCallback()">
    <md-expansion-panel-header>Panel Title</md-expansion-panel-header>
    <p>Some content</p>
  </md-expansion-panel>`})
class PanelWithContent {
  expanded: boolean = false;
  openCallback = jasmine.createSpy('openCallback');
  closeCallback = jasmine.createSpy('closeCallback');
}
