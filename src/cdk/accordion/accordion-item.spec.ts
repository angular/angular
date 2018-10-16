import {async, TestBed, ComponentFixture} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CdkAccordionModule, CdkAccordionItem} from './public-api';

describe('CdkAccordionItem', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        CdkAccordionModule
      ],
      declarations: [
        SingleItem,
        ItemGroupWithoutAccordion,
        ItemGroupWithAccordion
      ],
    });
    TestBed.compileComponents();
  }));

  describe('single item', () => {
    let fixture: ComponentFixture<SingleItem>;
    let item: CdkAccordionItem;

    beforeEach(() => {
      fixture = TestBed.createComponent(SingleItem);
      item = fixture.debugElement
        .query(By.directive(CdkAccordionItem))
        .injector.get<CdkAccordionItem>(CdkAccordionItem);
    });

    describe('that is not disabled', () => {
      beforeEach(() => {
        item.disabled = false;
      });

      it('should toggle its expanded state', () => {
        expect(item.expanded).toBe(false);
        item.toggle();
        expect(item.expanded).toBe(true);
        item.toggle();
        expect(item.expanded).toBe(false);
      });

      it('should set its expanded state to expanded', () => {
        item.expanded = false;
        item.open();
        expect(item.expanded).toBe(true);
      });

      it('should set its expanded state to closed', () => {
        item.expanded = true;
        item.close();
        expect(item.expanded).toBe(false);
      });

      it('should emit a closed event', () => {
        item.open();
        fixture.detectChanges();
        spyOn(item.closed, 'emit');
        item.close();
        fixture.detectChanges();
        expect(item.closed.emit).toHaveBeenCalled();
      });

      it('should not emit a closed event when the item is closed already', () => {
        expect(item.expanded).toBe(false);
        spyOn(item.closed, 'emit');
        item.close();
        fixture.detectChanges();
        expect(item.closed.emit).not.toHaveBeenCalled();
      });

      it('should emit an opened event', () => {
        spyOn(item.opened, 'emit');
        item.open();
        fixture.detectChanges();
        expect(item.opened.emit).toHaveBeenCalled();
      });

      it('should emit a destroyed event', () => {
        spyOn(item.destroyed, 'emit');
        item.ngOnDestroy();
        fixture.detectChanges();
        expect(item.destroyed.emit).toHaveBeenCalled();
      });
    });

    describe('that is disabled', () => {
      beforeEach(() => {
        item.disabled = true;
      });

      it('should not toggle its expanded state', () => {
        expect(item.expanded).toBe(false);
        item.toggle();
        expect(item.expanded).toBe(false);
      });

      it('should not set its expanded state to expanded', () => {
        item.expanded = false;
        item.open();
        expect(item.expanded).toBe(false);
      });

      it('should not set its expanded state to closed', () => {
        item.expanded = true;
        item.close();
        expect(item.expanded).toBe(true);
      });

      it('should not emit a closed event', () => {
        spyOn(item.closed, 'emit');
        item.close();
        fixture.detectChanges();
        expect(item.closed.emit).not.toHaveBeenCalled();
      });

      it('should not emit an opened event', () => {
        spyOn(item.opened, 'emit');
        item.open();
        fixture.detectChanges();
        expect(item.opened.emit).not.toHaveBeenCalled();
      });

      it('should emit a destroyed event', () => {
        spyOn(item.destroyed, 'emit');
        item.ngOnDestroy();
        fixture.detectChanges();
        expect(item.destroyed.emit).toHaveBeenCalled();
      });
    });

    it('should emit to and complete the `destroyed` stream on destroy', () => {
      const emitSpy = jasmine.createSpy('emit spy');
      const completeSpy = jasmine.createSpy('complete spy');
      const subscription = item.destroyed.subscribe(emitSpy, undefined, completeSpy);

      fixture.detectChanges();
      fixture.destroy();

      expect(emitSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();

      subscription.unsubscribe();
    });

    it('should complete the `opened` stream on destroy', () => {
      const completeSpy = jasmine.createSpy('complete spy');
      const subscription = item.opened.subscribe(() => {}, undefined, completeSpy);

      fixture.detectChanges();
      fixture.destroy();

      expect(completeSpy).toHaveBeenCalled();

      subscription.unsubscribe();
    });

    it('should complete the `closed` stream on destroy', () => {
      const completeSpy = jasmine.createSpy('complete spy');
      const subscription = item.closed.subscribe(() => {}, undefined, completeSpy);

      fixture.detectChanges();
      fixture.destroy();

      expect(completeSpy).toHaveBeenCalled();

      subscription.unsubscribe();
    });

  });

  describe('items without accordion', () => {
    let fixture: ComponentFixture<SingleItem>;
    let firstItem: CdkAccordionItem;
    let secondItem: CdkAccordionItem;

    beforeEach(() => {
      fixture = TestBed.createComponent(ItemGroupWithoutAccordion);
      [firstItem, secondItem] = fixture.debugElement
        .queryAll(By.directive(CdkAccordionItem))
        .map(el => el.injector.get<CdkAccordionItem>(CdkAccordionItem));
    });

    it('should not change expanded state based on unrelated items', () => {
      expect(firstItem.expanded).toBe(false);
      expect(secondItem.expanded).toBe(false);
      firstItem.open();
      fixture.detectChanges();
      expect(firstItem.expanded).toBe(true);
      expect(secondItem.expanded).toBe(false);
      secondItem.open();
      fixture.detectChanges();
      expect(firstItem.expanded).toBe(true);
      expect(secondItem.expanded).toBe(true);
    });

    it('should not change expanded state for disabled items', () => {
      firstItem.disabled = true;
      expect(firstItem.expanded).toBe(false);
      expect(secondItem.expanded).toBe(false);
      firstItem.open();
      fixture.detectChanges();
      expect(firstItem.expanded).toBe(false);
      expect(secondItem.expanded).toBe(false);
      secondItem.open();
      fixture.detectChanges();
      expect(firstItem.expanded).toBe(false);
      expect(secondItem.expanded).toBe(true);
    });
  });


  describe('items in accordion', () => {
    let fixture: ComponentFixture<SingleItem>;
    let firstItem: CdkAccordionItem;
    let secondItem: CdkAccordionItem;

    beforeEach(() => {
      fixture = TestBed.createComponent(ItemGroupWithAccordion);
      [firstItem, secondItem] = fixture.debugElement
        .queryAll(By.directive(CdkAccordionItem))
        .map(el => el.injector.get<CdkAccordionItem>(CdkAccordionItem));
    });

    it('should change expanded state based on related items', () => {
      expect(firstItem.expanded).toBe(false);
      expect(secondItem.expanded).toBe(false);
      firstItem.open();
      fixture.detectChanges();
      expect(firstItem.expanded).toBe(true);
      expect(secondItem.expanded).toBe(false);
      secondItem.open();
      fixture.detectChanges();
      expect(firstItem.expanded).toBe(false);
      expect(secondItem.expanded).toBe(true);
    });
  });
});

@Component({
  template: `<cdk-accordion-item #item1></cdk-accordion-item>`
})
class SingleItem {}

@Component({
  template: `
    <cdk-accordion-item #item1></cdk-accordion-item>
    <cdk-accordion-item #item2></cdk-accordion-item>
  `
})
class ItemGroupWithoutAccordion {}

@Component({
  template: `
    <cdk-accordion>
      <cdk-accordion-item #item1></cdk-accordion-item>
      <cdk-accordion-item #item2></cdk-accordion-item>
    </cdk-accordion>
  `
})
class ItemGroupWithAccordion {}
