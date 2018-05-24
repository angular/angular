import {async, TestBed} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CdkAccordionModule, CdkAccordionItem} from './public-api';

describe('CdkAccordion', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        CdkAccordionModule
      ],
      declarations: [
        SetOfItems,
        NestedItems,
      ],
    });
    TestBed.compileComponents();
  }));

  it('should ensure only one item is expanded at a time', () => {
    const fixture = TestBed.createComponent(SetOfItems);
    const [firstPanel, secondPanel] = fixture.debugElement
      .queryAll(By.directive(CdkAccordionItem))
      .map(el => {
        return el.injector.get(CdkAccordionItem) as CdkAccordionItem;
      });

    firstPanel.open();
    fixture.detectChanges();
    expect(firstPanel.expanded).toBeTruthy();
    expect(secondPanel.expanded).toBeFalsy();

    secondPanel.open();
    fixture.detectChanges();
    expect(firstPanel.expanded).toBeFalsy();
    expect(secondPanel.expanded).toBeTruthy();
  });

  it('should allow multiple items to be expanded simultaneously', () => {
    const fixture = TestBed.createComponent(SetOfItems);
    const [firstPanel, secondPanel] = fixture.debugElement
      .queryAll(By.directive(CdkAccordionItem))
      .map(el => {
        return el.injector.get(CdkAccordionItem) as CdkAccordionItem;
      });

    fixture.componentInstance.multi = true;
    fixture.detectChanges();
    firstPanel.expanded = true;
    secondPanel.expanded = true;
    fixture.detectChanges();
    expect(firstPanel.expanded).toBeTruthy();
    expect(secondPanel.expanded).toBeTruthy();
  });

  it('should not register nested items to the same accordion', () => {
    const fixture = TestBed.createComponent(NestedItems);
    const innerItem = fixture.componentInstance.innerItem;
    const outerItem = fixture.componentInstance.outerItem;

    expect(innerItem.accordion).not.toBe(outerItem.accordion);
  });
});

@Component({template: `
  <cdk-accordion [multi]="multi">
    <cdk-accordion-item #item1></cdk-accordion-item>
    <cdk-accordion-item #item2></cdk-accordion-item>
  </cdk-accordion>`})
class SetOfItems {
  @ViewChild('item1') item1;
  @ViewChild('item2') item2;
  multi: boolean = false;
}


@Component({template: `
  <cdk-accordion>
    <cdk-accordion-item #outerItem="cdkAccordionItem">
      <cdk-accordion-item #innerItem="cdkAccordionItem"></cdk-accordion-item>
    </cdk-accordion-item>
  </cdk-accordion>`})
class NestedItems {
  @ViewChild('outerItem') outerItem: CdkAccordionItem;
  @ViewChild('innerItem') innerItem: CdkAccordionItem;
}
