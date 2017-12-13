import {async, TestBed, fakeAsync, tick, ComponentFixture} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatExpansionModule, MatExpansionPanel} from './index';


describe('MatExpansionPanel', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatExpansionModule
      ],
      declarations: [
        PanelWithContent,
        PanelWithContentInNgIf,
        PanelWithCustomMargin,
        LazyPanelWithContent,
        LazyPanelOpenOnLoad,
      ],
    });
    TestBed.compileComponents();
  }));

  it('should expand and collapse the panel', () => {
    const fixture = TestBed.createComponent(PanelWithContent);
    const contentEl = fixture.debugElement.query(By.css('.mat-expansion-panel-content'));
    const headerEl = fixture.debugElement.query(By.css('.mat-expansion-panel-header'));
    fixture.detectChanges();
    expect(headerEl.classes['mat-expanded']).toBeFalsy();
    expect(contentEl.classes['mat-expanded']).toBeFalsy();

    fixture.componentInstance.expanded = true;
    fixture.detectChanges();
    expect(headerEl.classes['mat-expanded']).toBeTruthy();
    expect(contentEl.classes['mat-expanded']).toBeTruthy();
  });

  it('should be able to render panel content lazily', fakeAsync(() => {
    let fixture = TestBed.createComponent(LazyPanelWithContent);
    let content = fixture.debugElement.query(By.css('.mat-expansion-panel-content')).nativeElement;
    fixture.detectChanges();

    expect(content.textContent.trim()).toBe('', 'Expected content element to be empty.');

    fixture.componentInstance.expanded = true;
    fixture.detectChanges();

    expect(content.textContent.trim())
        .toContain('Some content', 'Expected content to be rendered.');
  }));

  it('should render the content for a lazy-loaded panel that is opened on init', fakeAsync(() => {
    let fixture = TestBed.createComponent(LazyPanelOpenOnLoad);
    let content = fixture.debugElement.query(By.css('.mat-expansion-panel-content')).nativeElement;
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

  it('creates a unique panel id for each panel', () => {
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

  it('should not override the panel margin if it is not inside an accordion', fakeAsync(() => {
    let fixture = TestBed.createComponent(PanelWithCustomMargin);
    fixture.detectChanges();

    let panel = fixture.debugElement.query(By.css('mat-expansion-panel'));
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

    it('make sure accordion item runs ngOnDestroy when expansion panel is destroyed', () => {
      let fixture = TestBed.createComponent(PanelWithContentInNgIf);
      fixture.detectChanges();
      let destroyedOk = false;
      fixture.componentInstance.panel.destroyed.subscribe(() => destroyedOk = true);
      fixture.componentInstance.expansionShown = false;
      fixture.detectChanges();
      expect(destroyedOk).toBe(true);
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
  expanded: boolean = false;
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
