import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {Component, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {By} from '@angular/platform-browser';
import {dispatchFakeEvent} from '@angular/cdk/testing';
import {Observable} from 'rxjs/Observable';
import {MatTab, MatTabGroup, MatTabHeaderPosition, MatTabsModule} from './index';


describe('MatTabGroup', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatTabsModule, NoopAnimationsModule],
      declarations: [
        SimpleTabsTestApp,
        SimpleDynamicTabsTestApp,
        BindedTabsTestApp,
        AsyncTabsTestApp,
        DisabledTabsTestApp,
        TabGroupWithSimpleApi,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('basic behavior', () => {
    let fixture: ComponentFixture<SimpleTabsTestApp>;
    let element: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleTabsTestApp);
      element = fixture.nativeElement;
    });

    it('should default to the first tab', () => {
      checkSelectedIndex(1, fixture);
    });

    it('will properly load content on first change detection pass', () => {
      fixture.detectChanges();
      expect(element.querySelectorAll('.mat-tab-body')[1].querySelectorAll('span').length).toBe(3);
    });

    it('should change selected index on click', () => {
      let component = fixture.debugElement.componentInstance;
      component.selectedIndex = 0;
      checkSelectedIndex(0, fixture);

      // select the second tab
      let tabLabel = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[1];
      tabLabel.nativeElement.click();
      checkSelectedIndex(1, fixture);

      // select the third tab
      tabLabel = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[2];
      tabLabel.nativeElement.click();
      checkSelectedIndex(2, fixture);
    });

    it('should support two-way binding for selectedIndex', async(() => {
      let component = fixture.componentInstance;
      component.selectedIndex = 0;

      fixture.detectChanges();

      let tabLabel = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[1];
      tabLabel.nativeElement.click();

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.selectedIndex).toBe(1);
      });
    }));

    it('should set to correct tab on fast change', async(() => {
      let component = fixture.componentInstance;
      component.selectedIndex = 0;
      fixture.detectChanges();

      setTimeout(() => {
        component.selectedIndex = 1;
        fixture.detectChanges();

        setTimeout(() => {
          component.selectedIndex = 0;
          fixture.detectChanges();
          fixture.whenStable().then(() => {
            expect(component.selectedIndex).toBe(0);
          });
        }, 1);
      }, 1);
    }));

    it('should change tabs based on selectedIndex', fakeAsync(() => {
      let component = fixture.componentInstance;
      let tabComponent = fixture.debugElement.query(By.css('mat-tab-group')).componentInstance;

      spyOn(component, 'handleSelection').and.callThrough();

      checkSelectedIndex(1, fixture);

      tabComponent.selectedIndex = 2;

      checkSelectedIndex(2, fixture);
      tick();

      expect(component.handleSelection).toHaveBeenCalledTimes(1);
      expect(component.selectEvent.index).toBe(2);
    }));

    it('should update tab positions when selected index is changed', () => {
      fixture.detectChanges();
      const component: MatTabGroup =
          fixture.debugElement.query(By.css('mat-tab-group')).componentInstance;
      const tabs: MatTab[] = component._tabs.toArray();

      expect(tabs[0].position).toBeLessThan(0);
      expect(tabs[1].position).toBe(0);
      expect(tabs[2].position).toBeGreaterThan(0);

      // Move to third tab
      component.selectedIndex = 2;
      fixture.detectChanges();
      expect(tabs[0].position).toBeLessThan(0);
      expect(tabs[1].position).toBeLessThan(0);
      expect(tabs[2].position).toBe(0);

      // Move to the first tab
      component.selectedIndex = 0;
      fixture.detectChanges();
      expect(tabs[0].position).toBe(0);
      expect(tabs[1].position).toBeGreaterThan(0);
      expect(tabs[2].position).toBeGreaterThan(0);
    });

    it('should clamp the selected index to the size of the number of tabs', () => {
      fixture.detectChanges();
      const component: MatTabGroup =
          fixture.debugElement.query(By.css('mat-tab-group')).componentInstance;

      // Set the index to be negative, expect first tab selected
      fixture.componentInstance.selectedIndex = -1;
      fixture.detectChanges();
      expect(component.selectedIndex).toBe(0);

      // Set the index beyond the size of the tabs, expect last tab selected
      fixture.componentInstance.selectedIndex = 3;
      fixture.detectChanges();
      expect(component.selectedIndex).toBe(2);
    });

    it('should not crash when setting the selected index to NaN', () => {
      let component = fixture.debugElement.componentInstance;

      expect(() => {
        component.selectedIndex = NaN;
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should show ripples for tab-group labels', () => {
      fixture.detectChanges();

      const testElement = fixture.nativeElement;
      const tabLabel = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[1];

      expect(testElement.querySelectorAll('.mat-ripple-element').length)
        .toBe(0, 'Expected no ripples to show up initially.');

      dispatchFakeEvent(tabLabel.nativeElement, 'mousedown');
      dispatchFakeEvent(tabLabel.nativeElement, 'mouseup');

      expect(testElement.querySelectorAll('.mat-ripple-element').length)
        .toBe(1, 'Expected one ripple to show up on label mousedown.');
    });

    it('should allow disabling ripples for tab-group labels', () => {
      fixture.componentInstance.disableRipple = true;
      fixture.detectChanges();

      const testElement = fixture.nativeElement;
      const tabLabel = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[1];

      expect(testElement.querySelectorAll('.mat-ripple-element').length)
        .toBe(0, 'Expected no ripples to show up initially.');

      dispatchFakeEvent(tabLabel.nativeElement, 'mousedown');
      dispatchFakeEvent(tabLabel.nativeElement, 'mouseup');

      expect(testElement.querySelectorAll('.mat-ripple-element').length)
        .toBe(0, 'Expected no ripple to show up on label mousedown.');
    });

    it('should set the isActive flag on each of the tabs', () => {
      fixture.detectChanges();

      const tabs = fixture.componentInstance.tabs.toArray();

      expect(tabs[0].isActive).toBe(false);
      expect(tabs[1].isActive).toBe(true);
      expect(tabs[2].isActive).toBe(false);

      fixture.componentInstance.selectedIndex = 2;
      fixture.detectChanges();

      expect(tabs[0].isActive).toBe(false);
      expect(tabs[1].isActive).toBe(false);
      expect(tabs[2].isActive).toBe(true);
    });

    it('should fire animation done event', fakeAsync(() => {
      fixture.detectChanges();

      spyOn(fixture.componentInstance, 'animationDone');
      let tabLabel = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[1];
      tabLabel.nativeElement.click();
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance.animationDone).toHaveBeenCalled();
    }));
  });

  describe('disable tabs', () => {
    let fixture: ComponentFixture<DisabledTabsTestApp>;
    beforeEach(() => {
      fixture = TestBed.createComponent(DisabledTabsTestApp);
    });

    it('should have one disabled tab', () => {
      fixture.detectChanges();
      const labels = fixture.debugElement.queryAll(By.css('.mat-tab-disabled'));
      expect(labels.length).toBe(1);
    });

    it('should set the disabled flag on tab', () => {
      fixture.detectChanges();

      const tabs = fixture.componentInstance.tabs.toArray();
      let labels = fixture.debugElement.queryAll(By.css('.mat-tab-disabled'));
      expect(tabs[2].disabled).toBe(false);
      expect(labels.length).toBe(1);

      fixture.componentInstance.isDisabled = true;
      fixture.detectChanges();

      expect(tabs[2].disabled).toBe(true);
      labels = fixture.debugElement.queryAll(By.css('.mat-tab-disabled'));
      expect(labels.length).toBe(2);
    });
  });

  describe('dynamic binding tabs', () => {
    let fixture: ComponentFixture<SimpleDynamicTabsTestApp>;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(SimpleDynamicTabsTestApp);
      fixture.detectChanges();
    }));

    it('should be able to add a new tab, select it, and have correct origin position', () => {
      fixture.detectChanges();
      const component: MatTabGroup =
          fixture.debugElement.query(By.css('mat-tab-group')).componentInstance;

      let tabs: MatTab[] = component._tabs.toArray();
      expect(tabs[0].origin).toBe(null);
      expect(tabs[1].origin).toBe(0);
      expect(tabs[2].origin).toBe(null);

      // Add a new tab on the right and select it, expect an origin >= than 0 (animate right)
      fixture.componentInstance.tabs.push({label: 'New tab', content: 'to right of index'});
      fixture.componentInstance.selectedIndex = 4;
      fixture.detectChanges();

      tabs = component._tabs.toArray();
      expect(tabs[3].origin).toBeGreaterThanOrEqual(0);

      // Add a new tab in the beginning and select it, expect an origin < than 0 (animate left)
      fixture.componentInstance.tabs.push({label: 'New tab', content: 'to left of index'});
      fixture.componentInstance.selectedIndex = 0;
      fixture.detectChanges();

      tabs = component._tabs.toArray();
      expect(tabs[0].origin).toBeLessThan(0);
    });


    it('should update selected index if the last tab removed while selected', () => {
      fixture.detectChanges();
      const component: MatTabGroup =
          fixture.debugElement.query(By.css('mat-tab-group')).componentInstance;

      const numberOfTabs = component._tabs.length;
      fixture.componentInstance.selectedIndex = numberOfTabs - 1;
      fixture.detectChanges();

      // Remove last tab while last tab is selected, expect next tab over to be selected
      fixture.componentInstance.tabs.pop();
      fixture.detectChanges();

      expect(component.selectedIndex).toBe(numberOfTabs - 2);
    });

  });

  describe('async tabs', () => {
    let fixture: ComponentFixture<AsyncTabsTestApp>;

    it('should show tabs when they are available', async(() => {
      fixture = TestBed.createComponent(AsyncTabsTestApp);

      let labels = fixture.debugElement.queryAll(By.css('.mat-tab-label'));

      expect(labels.length).toBe(0);

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        fixture.detectChanges();
        labels = fixture.debugElement.queryAll(By.css('.mat-tab-label'));
        expect(labels.length).toBe(2);
      });
    }));
  });

  describe('with simple api', () => {
    let fixture: ComponentFixture<TabGroupWithSimpleApi>;
    let tabGroup: MatTabGroup;

    beforeEach(() => {
      fixture = TestBed.createComponent(TabGroupWithSimpleApi);
      fixture.detectChanges();

      tabGroup =
          fixture.debugElement.query(By.directive(MatTabGroup)).componentInstance as MatTabGroup;
    });

    it('should support a tab-group with the simple api', async(() => {
      expect(getSelectedLabel(fixture).textContent).toMatch('Junk food');
      expect(getSelectedContent(fixture).textContent).toMatch('Pizza, fries');

      tabGroup.selectedIndex = 2;
      fixture.detectChanges();
      // Use whenStable to wait for async observables and change detection to run in content.
      fixture.whenStable().then(() => {

        expect(getSelectedLabel(fixture).textContent).toMatch('Fruit');
        expect(getSelectedContent(fixture).textContent).toMatch('Apples, grapes');

        fixture.componentInstance.otherLabel = 'Chips';
        fixture.componentInstance.otherContent = 'Salt, vinegar';
        fixture.detectChanges();

        expect(getSelectedLabel(fixture).textContent).toMatch('Chips');
        expect(getSelectedContent(fixture).textContent).toMatch('Salt, vinegar');
      });
    }));

    it('should support @ViewChild in the tab content', () => {
      expect(fixture.componentInstance.legumes).toBeTruthy();
    });

    it('should only have the active tab in the DOM', async(() => {
      expect(fixture.nativeElement.textContent).toContain('Pizza, fries');
      expect(fixture.nativeElement.textContent).not.toContain('Peanuts');

      tabGroup.selectedIndex = 3;
      fixture.detectChanges();
      // Use whenStable to wait for async observables and change detection to run in content.
      fixture.whenStable().then(() => {
        expect(fixture.nativeElement.textContent).not.toContain('Pizza, fries');
        expect(fixture.nativeElement.textContent).toContain('Peanuts');
      });
    }));

    it('should support setting the header position', () => {
      let tabGroupNode = fixture.debugElement.query(By.css('mat-tab-group')).nativeElement;

      expect(tabGroupNode.classList).not.toContain('mat-tab-group-inverted-header');

      tabGroup.headerPosition = 'below';
      fixture.detectChanges();

      expect(tabGroupNode.classList).toContain('mat-tab-group-inverted-header');
    });
  });

  /**
   * Checks that the `selectedIndex` has been updated; checks that the label and body have their
   * respective `active` classes
   */
  function checkSelectedIndex(expectedIndex: number, fixture: ComponentFixture<any>) {
    fixture.detectChanges();

    let tabComponent: MatTabGroup = fixture.debugElement
        .query(By.css('mat-tab-group')).componentInstance;
    expect(tabComponent.selectedIndex).toBe(expectedIndex);

    let tabLabelElement = fixture.debugElement
        .query(By.css(`.mat-tab-label:nth-of-type(${expectedIndex + 1})`)).nativeElement;
    expect(tabLabelElement.classList.contains('mat-tab-label-active')).toBe(true);

    let tabContentElement = fixture.debugElement
        .query(By.css(`mat-tab-body:nth-of-type(${expectedIndex + 1})`)).nativeElement;
    expect(tabContentElement.classList.contains('mat-tab-body-active')).toBe(true);
  }

  function getSelectedLabel(fixture: ComponentFixture<any>): HTMLElement {
    return fixture.nativeElement.querySelector('.mat-tab-label-active');
  }

  function getSelectedContent(fixture: ComponentFixture<any>): HTMLElement {
    return fixture.nativeElement.querySelector('.mat-tab-body-active');
  }
});


describe('nested MatTabGroup with enabled animations', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatTabsModule, BrowserAnimationsModule],
      declarations: [NestedTabs]
    });

    TestBed.compileComponents();
  }));

  it('should not throw when creating a component with nested tab groups', async(() => {
    expect(() => {
      let fixture = TestBed.createComponent(NestedTabs);
      fixture.detectChanges();
    }).not.toThrow();
  }));
});


@Component({
  template: `
    <mat-tab-group class="tab-group"
        [(selectedIndex)]="selectedIndex"
        [headerPosition]="headerPosition"
        [disableRipple]="disableRipple"
        (animationDone)="animationDone()"
        (focusChange)="handleFocus($event)"
        (selectedTabChange)="handleSelection($event)">
      <mat-tab>
        <ng-template mat-tab-label>Tab One</ng-template>
        Tab one content
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>Tab Two</ng-template>
        <span>Tab </span><span>two</span><span>content</span>
      </mat-tab>
      <mat-tab>
        <ng-template mat-tab-label>Tab Three</ng-template>
        Tab three content
      </mat-tab>
    </mat-tab-group>
  `
})
class SimpleTabsTestApp {
  @ViewChildren(MatTab) tabs: QueryList<MatTab>;
  selectedIndex: number = 1;
  focusEvent: any;
  selectEvent: any;
  disableRipple: boolean = false;
  headerPosition: MatTabHeaderPosition = 'above';
  handleFocus(event: any) {
    this.focusEvent = event;
  }
  handleSelection(event: any) {
    this.selectEvent = event;
  }
  animationDone() { }
}

@Component({
  template: `
    <mat-tab-group class="tab-group"
        [(selectedIndex)]="selectedIndex"
        (focusChange)="handleFocus($event)"
        (selectedTabChange)="handleSelection($event)">
      <mat-tab *ngFor="let tab of tabs">
        <ng-template mat-tab-label>{{tab.label}}</ng-template>
        {{tab.content}}
      </mat-tab>
    </mat-tab-group>
  `
})
class SimpleDynamicTabsTestApp {
  tabs = [
    {label: 'Label 1', content: 'Content 1'},
    {label: 'Label 2', content: 'Content 2'},
    {label: 'Label 3', content: 'Content 3'},
  ];
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
  template: `
    <mat-tab-group class="tab-group" [(selectedIndex)]="selectedIndex">
      <mat-tab *ngFor="let tab of tabs" label="{{tab.label}}">
        {{tab.content}}
      </mat-tab>
    </mat-tab-group>
  `
})
class BindedTabsTestApp {
  tabs = [
    { label: 'one', content: 'one' },
    { label: 'two', content: 'two' }
  ];
  selectedIndex = 0;

  addNewActiveTab(): void {
    this.tabs.push({
      label: 'new tab',
      content: 'new content'
    });
    this.selectedIndex = this.tabs.length - 1;
  }
}

@Component({
  selector: 'test-app',
  template: `
    <mat-tab-group class="tab-group">
      <mat-tab>
        <ng-template mat-tab-label>Tab One</ng-template>
        Tab one content
      </mat-tab>
      <mat-tab disabled>
        <ng-template mat-tab-label>Tab Two</ng-template>
        Tab two content
      </mat-tab>
      <mat-tab [disabled]="isDisabled">
        <ng-template mat-tab-label>Tab Three</ng-template>
        Tab three content
      </mat-tab>
    </mat-tab-group>
  `,
})
class DisabledTabsTestApp {
  @ViewChildren(MatTab) tabs: QueryList<MatTab>;
  isDisabled = false;
}

@Component({
  template: `
    <mat-tab-group class="tab-group">
      <mat-tab *ngFor="let tab of tabs | async">
        <ng-template mat-tab-label>{{ tab.label }}</ng-template>
        {{ tab.content }}
      </mat-tab>
   </mat-tab-group>
  `
})
class AsyncTabsTestApp {
  private _tabs = [
    { label: 'one', content: 'one' },
    { label: 'two', content: 'two' }
  ];

  tabs: Observable<any>;

  ngOnInit() {
    // Use ngOnInit because there is some issue with scheduling the async task in the constructor.
    this.tabs = Observable.create((observer: any) => {
      requestAnimationFrame(() => observer.next(this._tabs));
    });
  }
}


@Component({
  template: `
  <mat-tab-group>
    <mat-tab label="Junk food"> Pizza, fries </mat-tab>
    <mat-tab label="Vegetables"> Broccoli, spinach </mat-tab>
    <mat-tab [label]="otherLabel"> {{otherContent}} </mat-tab>
    <mat-tab label="Legumes"> <p #legumes>Peanuts</p> </mat-tab>
  </mat-tab-group>
  `
})
class TabGroupWithSimpleApi {
  otherLabel = 'Fruit';
  otherContent = 'Apples, grapes';
  @ViewChild('legumes') legumes: any;
}


@Component({
  selector: 'nested-tabs',
  template: `
    <mat-tab-group>
      <mat-tab label="One">Tab one content</mat-tab>
      <mat-tab label="Two">
        Tab two content
         <mat-tab-group [dynamicHeight]="true">
          <mat-tab label="Inner tab one">Inner content one</mat-tab>
          <mat-tab label="Inner tab two">Inner content two</mat-tab>
        </mat-tab-group>
      </mat-tab>
    </mat-tab-group>
  `,
})
class NestedTabs {}

