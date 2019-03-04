import {async, TestBed, fakeAsync, tick, ComponentFixture, flush} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {
  MatExpansionModule,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MAT_EXPANSION_PANEL_DEFAULT_OPTIONS,
} from './index';
import {SPACE, ENTER} from '@angular/cdk/keycodes';
import {dispatchKeyboardEvent, createKeyboardEvent, dispatchEvent} from '@angular/cdk/testing';


describe('MatExpansionPanel', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatExpansionModule,
        NoopAnimationsModule,
      ],
      declarations: [
        PanelWithContent,
        PanelWithContentInNgIf,
        PanelWithCustomMargin,
        LazyPanelWithContent,
        LazyPanelOpenOnLoad,
        PanelWithTwoWayBinding,
      ],
    });
    TestBed.compileComponents();
  }));

  it('should expand and collapse the panel', fakeAsync(() => {
    const fixture = TestBed.createComponent(PanelWithContent);
    const headerEl = fixture.nativeElement.querySelector('.mat-expansion-panel-header');
    fixture.detectChanges();

    expect(headerEl.classList).not.toContain('mat-expanded');

    fixture.componentInstance.expanded = true;
    fixture.detectChanges();
    flush();

    expect(headerEl.classList).toContain('mat-expanded');
  }));

  it('should be able to render panel content lazily', fakeAsync(() => {
    const fixture = TestBed.createComponent(LazyPanelWithContent);
    const content = fixture.debugElement.query(
      By.css('.mat-expansion-panel-content')).nativeElement;
    fixture.detectChanges();

    expect(content.textContent.trim()).toBe('', 'Expected content element to be empty.');

    fixture.componentInstance.expanded = true;
    fixture.detectChanges();

    expect(content.textContent.trim())
        .toContain('Some content', 'Expected content to be rendered.');
  }));

  it('should render the content for a lazy-loaded panel that is opened on init', fakeAsync(() => {
    const fixture = TestBed.createComponent(LazyPanelOpenOnLoad);
    const content = fixture.debugElement.query(
      By.css('.mat-expansion-panel-content')).nativeElement;
    fixture.detectChanges();

    expect(content.textContent.trim())
        .toContain('Some content', 'Expected content to be rendered.');
  }));

  it('emit correct events for change in panel expanded state', () => {
    const fixture = TestBed.createComponent(PanelWithContent);
    fixture.componentInstance.expanded = true;
    fixture.detectChanges();
    expect(fixture.componentInstance.openCallback).toHaveBeenCalled();

    fixture.componentInstance.expanded = false;
    fixture.detectChanges();
    expect(fixture.componentInstance.closeCallback).toHaveBeenCalled();
  });

  it('should create a unique panel id for each panel', () => {
    const fixtureOne = TestBed.createComponent(PanelWithContent);
    const headerElOne = fixtureOne.nativeElement.querySelector('.mat-expansion-panel-header');
    const fixtureTwo = TestBed.createComponent(PanelWithContent);
    const headerElTwo = fixtureTwo.nativeElement.querySelector('.mat-expansion-panel-header');
    fixtureOne.detectChanges();
    fixtureTwo.detectChanges();

    const panelIdOne = headerElOne.getAttribute('aria-controls');
    const panelIdTwo = headerElTwo.getAttribute('aria-controls');
    expect(panelIdOne).not.toBe(panelIdTwo);
  });

  it('should set `aria-labelledby` of the content to the header id', () => {
    const fixture = TestBed.createComponent(PanelWithContent);
    const headerEl = fixture.nativeElement.querySelector('.mat-expansion-panel-header');
    const contentEl = fixture.nativeElement.querySelector('.mat-expansion-panel-content');

    fixture.detectChanges();

    const headerId = headerEl.getAttribute('id');
    const contentLabel = contentEl.getAttribute('aria-labelledby');

    expect(headerId).toBeTruthy();
    expect(contentLabel).toBeTruthy();
    expect(headerId).toBe(contentLabel);
  });

  it('should set the proper role on the content element', () => {
    const fixture = TestBed.createComponent(PanelWithContent);
    const contentEl = fixture.nativeElement.querySelector('.mat-expansion-panel-content');

    expect(contentEl.getAttribute('role')).toBe('region');
  });

  it('should toggle the panel when pressing SPACE on the header', () => {
    const fixture = TestBed.createComponent(PanelWithContent);
    fixture.detectChanges();
    const headerEl = fixture.nativeElement.querySelector('.mat-expansion-panel-header');

    spyOn(fixture.componentInstance.panel, 'toggle');

    const event = dispatchKeyboardEvent(headerEl, 'keydown', SPACE);

    fixture.detectChanges();

    expect(fixture.componentInstance.panel.toggle).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  it('should toggle the panel when pressing ENTER on the header', () => {
    const fixture = TestBed.createComponent(PanelWithContent);
    fixture.detectChanges();
    const headerEl = fixture.nativeElement.querySelector('.mat-expansion-panel-header');

    spyOn(fixture.componentInstance.panel, 'toggle');

    const event = dispatchKeyboardEvent(headerEl, 'keydown', ENTER);

    fixture.detectChanges();

    expect(fixture.componentInstance.panel.toggle).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  it('should not toggle if a modifier key is pressed', () => {
    const fixture = TestBed.createComponent(PanelWithContent);
    fixture.detectChanges();
    const headerEl = fixture.nativeElement.querySelector('.mat-expansion-panel-header');

    spyOn(fixture.componentInstance.panel, 'toggle');

    ['altKey', 'metaKey', 'shiftKey', 'ctrlKey'].forEach(modifier => {
      const event = createKeyboardEvent('keydown', ENTER);
      Object.defineProperty(event, modifier, {get: () => true});

      dispatchEvent(headerEl, event);
      fixture.detectChanges();

      expect(fixture.componentInstance.panel.toggle).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });
  });

  it('should not be able to focus content while closed', fakeAsync(() => {
    const fixture = TestBed.createComponent(PanelWithContent);
    fixture.componentInstance.expanded = true;
    fixture.detectChanges();
    tick(250);

    const button = fixture.debugElement.query(By.css('button')).nativeElement;

    button.focus();
    expect(document.activeElement).toBe(button, 'Expected button to start off focusable.');

    button.blur();
    fixture.componentInstance.expanded = false;
    fixture.detectChanges();
    tick(250);

    button.focus();
    expect(document.activeElement).not.toBe(button, 'Expected button to no longer be focusable.');
  }));

  it('should restore focus to header if focused element is inside panel on close', fakeAsync(() => {
    const fixture = TestBed.createComponent(PanelWithContent);
    fixture.componentInstance.expanded = true;
    fixture.detectChanges();
    tick(250);

    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    const header = fixture.debugElement.query(By.css('mat-expansion-panel-header')).nativeElement;

    button.focus();
    expect(document.activeElement).toBe(button, 'Expected button to start off focusable.');

    fixture.componentInstance.expanded = false;
    fixture.detectChanges();
    tick(250);

    expect(document.activeElement).toBe(header, 'Expected header to be focused.');
  }));

  it('should not override the panel margin if it is not inside an accordion', fakeAsync(() => {
    const fixture = TestBed.createComponent(PanelWithCustomMargin);
    fixture.detectChanges();

    const panel = fixture.debugElement.query(By.css('mat-expansion-panel'));
    let styles = getComputedStyle(panel.nativeElement);

    expect(panel.componentInstance._hasSpacing()).toBe(false);
    expect(styles.marginTop).toBe('13px');
    expect(styles.marginBottom).toBe('13px');
    expect(styles.marginLeft).toBe('37px');
    expect(styles.marginRight).toBe('37px');

    fixture.componentInstance.expanded = true;
    fixture.detectChanges();
    tick(250);

    styles = getComputedStyle(panel.nativeElement);

    expect(panel.componentInstance._hasSpacing()).toBe(false);
    expect(styles.marginTop).toBe('13px');
    expect(styles.marginBottom).toBe('13px');
    expect(styles.marginLeft).toBe('37px');
    expect(styles.marginRight).toBe('37px');
  }));

  it('should be able to hide the toggle', () => {
    const fixture = TestBed.createComponent(PanelWithContent);
    const header = fixture.debugElement.query(By.css('.mat-expansion-panel-header')).nativeElement;

    fixture.detectChanges();

    expect(header.querySelector('.mat-expansion-indicator'))
        .toBeTruthy('Expected indicator to be shown.');

    fixture.componentInstance.hideToggle = true;
    fixture.detectChanges();

    expect(header.querySelector('.mat-expansion-indicator'))
        .toBeFalsy('Expected indicator to be hidden.');
  });

  it('should update the indicator rotation when the expanded state is toggled programmatically',
    fakeAsync(() => {
      const fixture = TestBed.createComponent(PanelWithContent);

      fixture.detectChanges();
      tick(250);

      const arrow = fixture.debugElement.query(By.css('.mat-expansion-indicator')).nativeElement;

      expect(arrow.style.transform).toBe('rotate(0deg)', 'Expected no rotation.');

      fixture.componentInstance.expanded = true;
      fixture.detectChanges();
      tick(250);

      expect(arrow.style.transform).toBe('rotate(180deg)', 'Expected 180 degree rotation.');
    }));

  it('should make sure accordion item runs ngOnDestroy when expansion panel is destroyed', () => {
    const fixture = TestBed.createComponent(PanelWithContentInNgIf);
    fixture.detectChanges();
    let destroyedOk = false;
    fixture.componentInstance.panel.destroyed.subscribe(() => destroyedOk = true);
    fixture.componentInstance.expansionShown = false;
    fixture.detectChanges();
    expect(destroyedOk).toBe(true);
  });

  it('should support two-way binding of the `expanded` property', () => {
    const fixture = TestBed.createComponent(PanelWithTwoWayBinding);
    const header = fixture.debugElement.query(By.css('mat-expansion-panel-header')).nativeElement;

    fixture.detectChanges();
    expect(fixture.componentInstance.expanded).toBe(false);

    header.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.expanded).toBe(true);

    header.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.expanded).toBe(false);
  });



  it('should emit events for body expanding and collapsing animations', fakeAsync(() => {
    const fixture = TestBed.createComponent(PanelWithContent);
    fixture.detectChanges();
    let afterExpand = 0;
    let afterCollapse = 0;
    fixture.componentInstance.panel.afterExpand.subscribe(() => afterExpand++);
    fixture.componentInstance.panel.afterCollapse.subscribe(() => afterCollapse++);

    fixture.componentInstance.expanded = true;
    fixture.detectChanges();
    flush();
    expect(afterExpand).toBe(1);
    expect(afterCollapse).toBe(0);

    fixture.componentInstance.expanded = false;
    fixture.detectChanges();
    flush();
    expect(afterExpand).toBe(1);
    expect(afterCollapse).toBe(1);
  }));

  it('should be able to set the default options through the injection token', () => {
    TestBed
      .resetTestingModule()
      .configureTestingModule({
        imports: [MatExpansionModule, NoopAnimationsModule],
        declarations: [PanelWithTwoWayBinding],
        providers: [{
          provide: MAT_EXPANSION_PANEL_DEFAULT_OPTIONS,
          useValue: {
            hideToggle: true,
            expandedHeight: '10px',
            collapsedHeight: '16px'
          }
        }]
      })
      .compileComponents();

    const fixture = TestBed.createComponent(PanelWithTwoWayBinding);
    fixture.detectChanges();

    const panel = fixture.debugElement.query(By.directive(MatExpansionPanel));
    const header = fixture.debugElement.query(By.directive(MatExpansionPanelHeader));

    expect(panel.componentInstance.hideToggle).toBe(true);
    expect(header.componentInstance.expandedHeight).toBe('10px');
    expect(header.componentInstance.collapsedHeight).toBe('16px');
  });

  describe('disabled state', () => {
    let fixture: ComponentFixture<PanelWithContent>;
    let panel: HTMLElement;
    let header: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(PanelWithContent);
      fixture.detectChanges();
      panel = fixture.debugElement.query(By.css('mat-expansion-panel')).nativeElement;
      header = fixture.debugElement.query(By.css('mat-expansion-panel-header')).nativeElement;
    });

    it('should toggle the aria-disabled attribute on the header', () => {
      expect(header.getAttribute('aria-disabled')).toBe('false');

      fixture.componentInstance.disabled = true;
      fixture.detectChanges();

      expect(header.getAttribute('aria-disabled')).toBe('true');
    });

    it('should toggle the expansion indicator', () => {
      expect(panel.querySelector('.mat-expansion-indicator')).toBeTruthy();

      fixture.componentInstance.disabled = true;
      fixture.detectChanges();

      expect(panel.querySelector('.mat-expansion-indicator')).toBeFalsy();
    });

    it('should not be able to toggle the panel via a user action if disabled', () => {
      expect(fixture.componentInstance.panel.expanded).toBe(false);
      expect(header.classList).not.toContain('mat-expanded');

      fixture.componentInstance.disabled = true;
      fixture.detectChanges();

      header.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.panel.expanded).toBe(false);
      expect(header.classList).not.toContain('mat-expanded');
    });

    it('should be able to toggle a disabled expansion panel programmatically', () => {
      expect(fixture.componentInstance.panel.expanded).toBe(false);
      expect(header.classList).not.toContain('mat-expanded');

      fixture.componentInstance.disabled = true;
      fixture.detectChanges();

      fixture.componentInstance.expanded = true;
      fixture.detectChanges();

      expect(fixture.componentInstance.panel.expanded).toBe(true);
      expect(header.classList).toContain('mat-expanded');
    });

  });
});


@Component({
  template: `
  <mat-expansion-panel [expanded]="expanded"
                      [hideToggle]="hideToggle"
                      [disabled]="disabled"
                      (opened)="openCallback()"
                      (closed)="closeCallback()">
    <mat-expansion-panel-header>Panel Title</mat-expansion-panel-header>
    <p>Some content</p>
    <button>I am a button</button>
  </mat-expansion-panel>`
})
class PanelWithContent {
  expanded = false;
  hideToggle = false;
  disabled = false;
  openCallback = jasmine.createSpy('openCallback');
  closeCallback = jasmine.createSpy('closeCallback');
  @ViewChild(MatExpansionPanel) panel: MatExpansionPanel;
}

@Component({
  template: `
  <div *ngIf="expansionShown">
    <mat-expansion-panel>
      <mat-expansion-panel-header>Panel Title</mat-expansion-panel-header>
    </mat-expansion-panel>
  </div>`
})
class PanelWithContentInNgIf {
  expansionShown = true;
  @ViewChild(MatExpansionPanel) panel: MatExpansionPanel;
}

@Component({
  styles: [
    `mat-expansion-panel {
      margin: 13px 37px;
    }`
  ],
  template: `
  <mat-expansion-panel [expanded]="expanded">
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolores officia, aliquam dicta
    corrupti maxime voluptate accusamus impedit atque incidunt pariatur.
  </mat-expansion-panel>`
})
class PanelWithCustomMargin {
  expanded = false;
}

@Component({
  template: `
  <mat-expansion-panel [expanded]="expanded">
    <mat-expansion-panel-header>Panel Title</mat-expansion-panel-header>

    <ng-template matExpansionPanelContent>
      <p>Some content</p>
      <button>I am a button</button>
    </ng-template>
  </mat-expansion-panel>`
})
class LazyPanelWithContent {
  expanded = false;
}

@Component({
  template: `
  <mat-expansion-panel [expanded]="true">
    <mat-expansion-panel-header>Panel Title</mat-expansion-panel-header>

    <ng-template matExpansionPanelContent>
      <p>Some content</p>
    </ng-template>
  </mat-expansion-panel>`
})
class LazyPanelOpenOnLoad {}


@Component({
  template: `
  <mat-expansion-panel [(expanded)]="expanded">
    <mat-expansion-panel-header>Panel Title</mat-expansion-panel-header>
  </mat-expansion-panel>`
})
class PanelWithTwoWayBinding {
  expanded = false;
}
