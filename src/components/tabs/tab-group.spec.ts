import {
    it,
    expect,
    beforeEach,
    inject,
    describe,
    async
} from '@angular/core/testing';
import {TestComponentBuilder, ComponentFixture} from '@angular/compiler/testing';
import {MD_TABS_DIRECTIVES, MdTabGroup} from './tabs';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {Observable} from 'rxjs/Observable';

describe('MdTabGroup', () => {
  let builder: TestComponentBuilder;
  let fixture: ComponentFixture<SimpleTabsTestApp>;

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb;
  }));

  describe('basic behavior', () => {
    beforeEach(async(() => {
      builder.createAsync(SimpleTabsTestApp).then(f => {
        fixture = f;
      });
    }));

    it('should default to the first tab', () => {
      checkSelectedIndex(1);
    });

    it('should change selected index on click', () => {
      let component = fixture.debugElement.componentInstance;
      component.selectedIndex = 0;
      checkSelectedIndex(0);

      // select the second tab
      let tabLabel = fixture.debugElement.query(By.css('.md-tab-label:nth-of-type(2)'));
      tabLabel.nativeElement.click();
      checkSelectedIndex(1);

      // select the third tab
      tabLabel = fixture.debugElement.query(By.css('.md-tab-label:nth-of-type(3)'));
      tabLabel.nativeElement.click();
      checkSelectedIndex(2);
    });

    it('should cycle through tab focus with focusNextTab/focusPreviousTab functions', () => {
      let tabComponent = fixture.debugElement.query(By.css('md-tab-group')).componentInstance;
      tabComponent.focusIndex = 0;
      fixture.detectChanges();
      expect(tabComponent.focusIndex).toBe(0);

      tabComponent.focusNextTab();
      fixture.detectChanges();
      expect(tabComponent.focusIndex).toBe(1);

      tabComponent.focusNextTab();
      fixture.detectChanges();
      expect(tabComponent.focusIndex).toBe(2);

      tabComponent.focusNextTab();
      fixture.detectChanges();
      expect(tabComponent.focusIndex).toBe(2); // should stop at 2

      tabComponent.focusPreviousTab();
      fixture.detectChanges();
      expect(tabComponent.focusIndex).toBe(1);

      tabComponent.focusPreviousTab();
      fixture.detectChanges();
      expect(tabComponent.focusIndex).toBe(0);

      tabComponent.focusPreviousTab();
      fixture.detectChanges();
      expect(tabComponent.focusIndex).toBe(0); // should stop at 0
    });

    it('should change tabs based on selectedIndex', () => {
      let component = fixture.debugElement.componentInstance;
      checkSelectedIndex(1);

      component.selectedIndex = 2;
      checkSelectedIndex(2);
    });
  });

  describe('async tabs', () => {
    beforeEach(async(() => {
      builder.createAsync(AsyncTabsTestApp).then(f => fixture = f);
    }));

    it('should show tabs when they are available', async(() => {
      let labels = fixture.debugElement.queryAll(By.css('.md-tab-label'));

      expect(labels.length).toBe(0);

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        fixture.detectChanges();
        labels = fixture.debugElement.queryAll(By.css('.md-tab-label'));
        expect(labels.length).toBe(2);
      });
    }));
  });

  /**
   * Checks that the `selectedIndex` has been updated; checks that the label and body have the
   * `md-active` class
   */
  function checkSelectedIndex(index: number) {
    fixture.detectChanges();

    let tabComponent: MdTabGroup = fixture.debugElement
        .query(By.css('md-tab-group')).componentInstance;
    expect(tabComponent.selectedIndex).toBe(index);

    let tabLabelElement = fixture.debugElement
        .query(By.css(`.md-tab-label:nth-of-type(${index + 1})`)).nativeElement;
    expect(tabLabelElement.classList.contains('md-active')).toBe(true);

    let tabContentElement = fixture.debugElement
        .query(By.css(`#${tabLabelElement.id}`)).nativeElement;
    expect(tabContentElement.classList.contains('md-active')).toBe(true);
  }
});

@Component({
  selector: 'test-app',
  template: `
    <md-tab-group class="tab-group" [selectedIndex]="selectedIndex">
      <md-tab>
        <template md-tab-label>Tab One</template>
        <template md-tab-content>Tab one content</template>
      </md-tab>
      <md-tab>
        <template md-tab-label>Tab Two</template>
        <template md-tab-content>Tab two content</template>
      </md-tab>
      <md-tab>
        <template md-tab-label>Tab Three</template>
        <template md-tab-content>Tab three content</template>
      </md-tab>
    </md-tab-group>
  `,
  directives: [MD_TABS_DIRECTIVES]
})
class SimpleTabsTestApp {
  selectedIndex: number = 1;
}

@Component({
  selector: 'test-app',
  template: `
    <md-tab-group class="tab-group">
      <md-tab *ngFor="let tab of tabs | async">
        <template md-tab-label>{{ tab.label }}</template>
        <template md-tab-content>{{ tab.content }}</template>
      </md-tab>
   </md-tab-group>
  `,
  directives: [MD_TABS_DIRECTIVES]
})
class AsyncTabsTestApp {
  private _tabs = [
    { label: 'one', content: 'one' },
    { label: 'two', content: 'two' }
  ];

  tabs: Observable<any>;

  constructor() {
    this.tabs = Observable.create((observer: any) => {
      requestAnimationFrame(() => observer.next(this._tabs));
    });
  }
}
