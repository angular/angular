import {async, fakeAsync, tick, ComponentFixture, TestBed} from '@angular/core/testing';
import {MdTabGroup, MdTabsModule} from './tabs';
import {Component, ViewChild} from '@angular/core';
import {By} from '@angular/platform-browser';
import {Observable} from 'rxjs/Observable';


describe('MdTabGroup', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdTabsModule.forRoot()],
      declarations: [
        SimpleTabsTestApp,
        AsyncTabsTestApp,
        DisabledTabsTestApp,
        TabGroupWithSimpleApi,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('basic behavior', () => {
    let fixture: ComponentFixture<SimpleTabsTestApp>;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleTabsTestApp);
    });

    it('should default to the first tab', () => {
      checkSelectedIndex(1, fixture);
    });

    it('should change selected index on click', () => {
      let component = fixture.debugElement.componentInstance;
      component.selectedIndex = 0;
      checkSelectedIndex(0, fixture);

      // select the second tab
      let tabLabel = fixture.debugElement.queryAll(By.css('.md-tab-label'))[1];
      tabLabel.nativeElement.click();
      checkSelectedIndex(1, fixture);

      // select the third tab
      tabLabel = fixture.debugElement.queryAll(By.css('.md-tab-label'))[2];
      tabLabel.nativeElement.click();
      checkSelectedIndex(2, fixture);
    });

    it('should support two-way binding for selectedIndex', async(() => {
      let component = fixture.componentInstance;
      component.selectedIndex = 0;

      fixture.detectChanges();

      let tabLabel = fixture.debugElement.queryAll(By.css('.md-tab-label'))[1];
      tabLabel.nativeElement.click();

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.selectedIndex).toBe(1);
      });
    }));

    it('should cycle tab focus with focusNextTab/focusPreviousTab functions', fakeAsync(() => {
      let testComponent = fixture.componentInstance;
      let tabComponent = fixture.debugElement.query(By.css('md-tab-group')).componentInstance;

      spyOn(testComponent, 'handleFocus').and.callThrough();
      fixture.detectChanges();

      tabComponent.focusIndex = 0;
      fixture.detectChanges();
      tick();
      expect(tabComponent.focusIndex).toBe(0);
      expect(testComponent.handleFocus).toHaveBeenCalledTimes(1);
      expect(testComponent.focusEvent.index).toBe(0);

      tabComponent.focusNextTab();
      fixture.detectChanges();
      tick();
      expect(tabComponent.focusIndex).toBe(1);
      expect(testComponent.handleFocus).toHaveBeenCalledTimes(2);
      expect(testComponent.focusEvent.index).toBe(1);

      tabComponent.focusNextTab();
      fixture.detectChanges();
      tick();
      expect(tabComponent.focusIndex).toBe(2);
      expect(testComponent.handleFocus).toHaveBeenCalledTimes(3);
      expect(testComponent.focusEvent.index).toBe(2);

      tabComponent.focusNextTab();
      fixture.detectChanges();
      tick();
      expect(tabComponent.focusIndex).toBe(2); // should stop at 2
      expect(testComponent.handleFocus).toHaveBeenCalledTimes(3);
      expect(testComponent.focusEvent.index).toBe(2);

      tabComponent.focusPreviousTab();
      fixture.detectChanges();
      tick();
      expect(tabComponent.focusIndex).toBe(1);
      expect(testComponent.handleFocus).toHaveBeenCalledTimes(4);
      expect(testComponent.focusEvent.index).toBe(1);

      tabComponent.focusPreviousTab();
      fixture.detectChanges();
      tick();
      expect(tabComponent.focusIndex).toBe(0);
      expect(testComponent.handleFocus).toHaveBeenCalledTimes(5);
      expect(testComponent.focusEvent.index).toBe(0);

      tabComponent.focusPreviousTab();
      fixture.detectChanges();
      tick();
      expect(tabComponent.focusIndex).toBe(0); // should stop at 0
      expect(testComponent.handleFocus).toHaveBeenCalledTimes(5);
      expect(testComponent.focusEvent.index).toBe(0);
    }));

    it('should change tabs based on selectedIndex', fakeAsync(() => {
      let component = fixture.componentInstance;
      let tabComponent = fixture.debugElement.query(By.css('md-tab-group')).componentInstance;

      spyOn(component, 'handleSelection').and.callThrough();

      checkSelectedIndex(1, fixture);

      tabComponent.selectedIndex = 2;

      checkSelectedIndex(2, fixture);
      tick();

      expect(component.handleSelection).toHaveBeenCalledTimes(1);
      expect(component.selectEvent.index).toBe(2);
    }));
  });

  describe('disabled tabs', () => {
    let fixture: ComponentFixture<DisabledTabsTestApp>;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(DisabledTabsTestApp);
      fixture.detectChanges();
    }));

    it('should disable the second tab', () => {
      let labels = fixture.debugElement.queryAll(By.css('.md-tab-label'));

      expect(labels[1].nativeElement.classList.contains('md-tab-disabled')).toBeTruthy();
    });

    it('should skip over disabled tabs when navigating by keyboard', () => {
      let component: MdTabGroup = fixture.debugElement.query(By.css('md-tab-group'))
          .componentInstance;

      component.focusIndex = 0;
      component.focusNextTab();

      expect(component.focusIndex).toBe(2);

      component.focusNextTab();
      expect(component.focusIndex).toBe(2);

      component.focusPreviousTab();
      expect(component.focusIndex).toBe(0);

      component.focusPreviousTab();
      expect(component.focusIndex).toBe(0);
    });

    it('should ignore attempts to select a disabled tab', () => {
      let component: MdTabGroup = fixture.debugElement.query(By.css('md-tab-group'))
          .componentInstance;

      component.selectedIndex = 0;
      expect(component.selectedIndex).toBe(0);

      component.selectedIndex = 1;
      expect(component.selectedIndex).toBe(0);
    });

    it('should ignore attempts to focus a disabled tab', () => {
      let component: MdTabGroup = fixture.debugElement.query(By.css('md-tab-group'))
          .componentInstance;

      component.focusIndex = 0;
      expect(component.focusIndex).toBe(0);

      component.focusIndex = 1;
      expect(component.focusIndex).toBe(0);
    });

    it('should ignore attempts to set invalid selectedIndex', () => {
      let component: MdTabGroup = fixture.debugElement.query(By.css('md-tab-group'))
          .componentInstance;

      component.selectedIndex = 0;
      expect(component.selectedIndex).toBe(0);

      component.selectedIndex = -1;
      expect(component.selectedIndex).toBe(0);

      component.selectedIndex = 4;
      expect(component.selectedIndex).toBe(0);
    });

    it('should ignore attempts to set invalid focusIndex', () => {
      let component: MdTabGroup = fixture.debugElement.query(By.css('md-tab-group'))
          .componentInstance;

      component.focusIndex = 0;
      expect(component.focusIndex).toBe(0);

      component.focusIndex = -1;
      expect(component.focusIndex).toBe(0);

      component.focusIndex = 4;
      expect(component.focusIndex).toBe(0);
    });
  });

  describe('async tabs', () => {
    let fixture: ComponentFixture<AsyncTabsTestApp>;

    it('should show tabs when they are available', async(() => {
      fixture = TestBed.createComponent(AsyncTabsTestApp);

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

  describe('with simple api', () => {
    let fixture: ComponentFixture<TabGroupWithSimpleApi>;
    let tabGroup: MdTabGroup;

    beforeEach(() => {
      fixture = TestBed.createComponent(TabGroupWithSimpleApi);
      fixture.detectChanges();

      tabGroup =
          fixture.debugElement.query(By.directive(MdTabGroup)).componentInstance as MdTabGroup;
    });

    it('should support a tab-group with the simple api', () => {
      expect(getSelectedLabel(fixture).textContent).toMatch('Junk food');
      expect(getSelectedContent(fixture).textContent).toMatch('Pizza, fries');

      tabGroup.selectedIndex = 2;
      fixture.detectChanges();

      expect(getSelectedLabel(fixture).textContent).toMatch('Fruit');
      expect(getSelectedContent(fixture).textContent).toMatch('Apples, grapes');

      fixture.componentInstance.otherLabel = 'Chips';
      fixture.componentInstance.otherContent = 'Salt, vinegar';
      fixture.detectChanges();

      expect(getSelectedLabel(fixture).textContent).toMatch('Chips');
      expect(getSelectedContent(fixture).textContent).toMatch('Salt, vinegar');
    });

    it('should support @ViewChild in the tab content', () => {
      expect(fixture.componentInstance.legumes).toBeTruthy();
    });
  });

  /**
   * Checks that the `selectedIndex` has been updated; checks that the label and body have the
   * `md-tab-active` class
   */
  function checkSelectedIndex(index: number, fixture: ComponentFixture<any>) {
    fixture.detectChanges();

    let tabComponent: MdTabGroup = fixture.debugElement
        .query(By.css('md-tab-group')).componentInstance;
    expect(tabComponent.selectedIndex).toBe(index);

    let tabLabelElement = fixture.debugElement
        .query(By.css(`.md-tab-label:nth-of-type(${index + 1})`)).nativeElement;
    expect(tabLabelElement.classList.contains('md-tab-active')).toBe(true);

    let tabContentElement = fixture.debugElement
        .query(By.css(`#${tabLabelElement.id}`)).nativeElement;
    expect(tabContentElement.classList.contains('md-tab-active')).toBe(true);
  }

  function getSelectedLabel(fixture: ComponentFixture<any>): HTMLElement {
    return fixture.nativeElement.querySelector('.md-tab-label.md-tab-active');
  }

  function getSelectedContent(fixture: ComponentFixture<any>): HTMLElement {
    return fixture.nativeElement.querySelector('.md-tab-body.md-tab-active');
  }
});

@Component({
  template: `
    <md-tab-group class="tab-group"
        [(selectedIndex)]="selectedIndex"
        (focusChange)="handleFocus($event)"
        (selectChange)="handleSelection($event)">
      <md-tab>
        <template md-tab-label>Tab One</template>
        Tab one content
      </md-tab>
      <md-tab>
        <template md-tab-label>Tab Two</template>
        Tab two content
      </md-tab>
      <md-tab>
        <template md-tab-label>Tab Three</template>
        Tab three content
      </md-tab>
    </md-tab-group>
  `
})
class SimpleTabsTestApp {
  selectedIndex: number = 1;
  focusEvent: any;
  selectEvent: any;
  handleFocus(event: any) {
    this.focusEvent = event;
  }
  handleSelection(event: any) {
    this.selectEvent = event;
  }
}

@Component({
  selector: 'test-app',
  template: `
    <md-tab-group class="tab-group">
      <md-tab>
        <template md-tab-label>Tab One</template>
        Tab one content
      </md-tab>
      <md-tab disabled>
        <template md-tab-label>Tab Two</template>
        Tab two content
      </md-tab>
      <md-tab>
        <template md-tab-label>Tab Three</template>
        Tab three content
      </md-tab>
    </md-tab-group>
  `,
})
class DisabledTabsTestApp {}

@Component({
  template: `
    <md-tab-group class="tab-group">
      <md-tab *ngFor="let tab of tabs | async">
        <template md-tab-label>{{ tab.label }}</template>
        {{ tab.content }}
      </md-tab>
   </md-tab-group>
  `
})
class AsyncTabsTestApp {
  private _tabs = [
    { label: 'one', content: 'one' },
    { label: 'two', content: 'two' }
  ];

  tabs: Observable<any>;

  // Use ngOnInit because there is some issue with scheduling the async task in the constructor.
  ngOnInit() {
    this.tabs = Observable.create((observer: any) => {
      requestAnimationFrame(() => observer.next(this._tabs));
    });
  }
}


@Component({
  template: `
  <md-tab-group>
    <md-tab label="Junk food"> Pizza, fries </md-tab>
    <md-tab label="Vegetables"> Broccoli, spinach </md-tab>
    <md-tab [label]="otherLabel"> {{otherContent}} </md-tab>
    <md-tab label="Legumes"> <p #legumes>Peanuts</p> </md-tab>
  </md-tab-group>
  `
})
class TabGroupWithSimpleApi {
  otherLabel = 'Fruit';
  otherContent = 'Apples, grapes';
  @ViewChild('legumes') legumes: any;
}
