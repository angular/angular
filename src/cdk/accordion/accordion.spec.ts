import {waitForAsync, TestBed} from '@angular/core/testing';
import {Component, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CdkAccordion} from './accordion';
import {CdkAccordionItem} from './accordion-item';
import {CdkAccordionModule} from './accordion-module';

describe('CdkAccordion', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, CdkAccordionModule],
      declarations: [SetOfItems, NestedItems],
    });
    TestBed.compileComponents();
  }));

  it('should ensure only one item is expanded at a time', () => {
    const fixture = TestBed.createComponent(SetOfItems);
    const [firstPanel, secondPanel] = fixture.debugElement
      .queryAll(By.directive(CdkAccordionItem))
      .map(el => el.injector.get<CdkAccordionItem>(CdkAccordionItem));

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
      .map(el => el.injector.get<CdkAccordionItem>(CdkAccordionItem));

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
    fixture.detectChanges();
    const innerItem = fixture.componentInstance.innerItem;
    const outerItem = fixture.componentInstance.outerItem;

    expect(innerItem.accordion).not.toBe(outerItem.accordion);
  });

  it('should be able to expand and collapse all items in multiple mode', () => {
    const fixture = TestBed.createComponent(SetOfItems);
    fixture.componentInstance.multi = true;
    fixture.detectChanges();
    fixture.componentInstance.accordion.openAll();
    fixture.detectChanges();

    expect(fixture.componentInstance.items.toArray().every(item => item.expanded)).toBe(true);

    fixture.componentInstance.accordion.closeAll();
    fixture.detectChanges();

    expect(fixture.componentInstance.items.toArray().some(item => item.expanded)).toBe(false);
  });

  it('should not be able to expand all items if multiple mode is off', () => {
    const fixture = TestBed.createComponent(SetOfItems);
    fixture.componentInstance.multi = false;
    fixture.detectChanges();
    fixture.componentInstance.accordion.openAll();
    fixture.detectChanges();

    expect(fixture.componentInstance.items.toArray().some(item => item.expanded)).toBe(false);
  });

  it('should be able to use closeAll even if multiple mode is disabled', () => {
    const fixture = TestBed.createComponent(SetOfItems);
    fixture.componentInstance.multi = false;
    fixture.detectChanges();
    const item = fixture.componentInstance.items.first;

    item.expanded = true;
    fixture.detectChanges();

    fixture.componentInstance.accordion.closeAll();
    fixture.detectChanges();

    expect(item.expanded).toBe(false);
  });

  it('should complete the accordion observables on destroy', () => {
    const fixture = TestBed.createComponent(SetOfItems);
    fixture.detectChanges();
    const stateSpy = jasmine.createSpy('stateChanges complete spy');
    const openCloseSpy = jasmine.createSpy('openCloseAllActions complete spy');

    fixture.componentInstance.accordion._stateChanges.subscribe({complete: stateSpy});
    fixture.componentInstance.accordion._openCloseAllActions.subscribe({complete: openCloseSpy});
    fixture.destroy();

    expect(stateSpy).toHaveBeenCalled();
    expect(openCloseSpy).toHaveBeenCalled();
  });
});

@Component({
  template: `
  <cdk-accordion [multi]="multi">
    <cdk-accordion-item></cdk-accordion-item>
    <cdk-accordion-item></cdk-accordion-item>
  </cdk-accordion>`,
})
class SetOfItems {
  @ViewChild(CdkAccordion) accordion: CdkAccordion;
  @ViewChildren(CdkAccordionItem) items: QueryList<CdkAccordionItem>;
  multi: boolean = false;
}

@Component({
  template: `
  <cdk-accordion>
    <cdk-accordion-item #outerItem="cdkAccordionItem">
      <cdk-accordion-item #innerItem="cdkAccordionItem"></cdk-accordion-item>
    </cdk-accordion-item>
  </cdk-accordion>`,
})
class NestedItems {
  @ViewChild('outerItem') outerItem: CdkAccordionItem;
  @ViewChild('innerItem') innerItem: CdkAccordionItem;
}
