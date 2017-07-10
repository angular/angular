import { CommonModule } from '@angular/common';
import { Component, DebugElement, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MdTabGroup, MdTabsModule } from '@angular/material';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { CodeTabsComponent } from './code-tabs.component';


describe('CodeTabsComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let hostComponent: HostComponent;
  let codeTabsDe: DebugElement;
  let codeTabsComponent: CodeTabsComponent;

  const createComponentBasic = (codeTabsContent = '') => {
    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    codeTabsDe = fixture.debugElement.children[0];
    codeTabsComponent = codeTabsDe.componentInstance;

    // Copy the CodeTab's innerHTML (content)
    // into the `codeTabsContent` property as the DocViewer does.
    codeTabsDe.nativeElement.codeTabsContent = codeTabsContent;
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeTabsComponent, HostComponent, TestCodeComponent ],
      imports: [ CommonModule ],
      schemas: [ NO_ERRORS_SCHEMA ],
    });
  });

  it('should create CodeTabsComponent', () => {
    createComponentBasic();
    expect(codeTabsComponent).toBeTruthy('CodeTabsComponent');
  });

  describe('(tab labels)', () => {
    let labelElems: HTMLSpanElement[];

    const createComponent = (codeTabsContent?: string) => {
      createComponentBasic(codeTabsContent);
      const labelDes = codeTabsDe.queryAll(By.css('.mat-tab-label'));
      labelElems = labelDes.map(de => de.nativeElement.querySelector('span'));
    };

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [ MdTabsModule, NoopAnimationsModule ]
      });
    });

    it('should create a label for each tab', () => {
      createComponent(`
        <code-pane>foo</code-pane>
        <code-pane>bar</code-pane>
        <code-pane>baz</code-pane>
      `);

      expect(labelElems.length).toBe(3);
    });

    it('should use the `title` as label', () => {
      createComponent(`
        <code-pane title="foo-title">foo</code-pane>
        <code-pane title="bar-title">bar</code-pane>
      `);
      const texts = labelElems.map(s => s.textContent);

      expect(texts).toEqual(['foo-title', 'bar-title']);
    });

    it('should add the `class` to the label element', () => {
      createComponent(`
        <code-pane class="foo-class">foo</code-pane>
        <code-pane class="bar-class">bar</code-pane>
      `);
      const classes = labelElems.map(s => s.className);

      expect(classes).toEqual(['foo-class', 'bar-class']);
    });

    it('should disable ripple effect on tab labels', () => {
      createComponent();
      const tabsGroupComponent = codeTabsDe.query(By.directive(MdTabGroup)).componentInstance;

      expect(tabsGroupComponent.disableRipple).toBe(true);
    });
  });

  describe('(tab content)', () => {
    let codeDes: DebugElement[];
    let codeComponents: TestCodeComponent[];

    const createComponent = (codeTabsContent?: string) => {
      createComponentBasic(codeTabsContent);
      codeDes = codeTabsDe.queryAll(By.directive(TestCodeComponent));
      codeComponents = codeDes.map(de => de.componentInstance);
    };

    it('should pass `class` to CodeComponent (<aio-code>)', () => {
      createComponent(`
        <code-pane class="foo-class">foo</code-pane>
        <code-pane class="bar-class">bar</code-pane>
      `);
      const classes = codeDes.map(de => de.nativeElement.className);

      expect(classes).toEqual(['foo-class', 'bar-class']);
    });

    it('should pass content to CodeComponent (<aio-code>)', () => {
      createComponent(`
        <code-pane>foo</code-pane>
        <code-pane>bar</code-pane>
      `);
      const codes = codeComponents.map(c => c.code);

      expect(codes).toEqual(['foo', 'bar']);
    });

    it('should pass `language` to CodeComponent (<aio-code>)', () => {
      createComponent(`
        <code-pane language="foo-lang">foo</code-pane>
        <code-pane language="bar-lang">bar</code-pane>
      `);
      const langs = codeComponents.map(c => c.language);

      expect(langs).toEqual(['foo-lang', 'bar-lang']);
    });

    it('should pass `linenums` to CodeComponent (<aio-code>)', () => {
      createComponent(`
        <code-pane linenums="foo-lnums">foo</code-pane>
        <code-pane linenums="bar-lnums">bar</code-pane>
        <code-pane linenums="">baz</code-pane>
        <code-pane linenums>qux</code-pane>
      `);
      const lnums = codeComponents.map(c => c.linenums);

      expect(lnums).toEqual(['foo-lnums', 'bar-lnums', '', '']);
    });

    it('should use the default value (if present on <code-tabs>) if `linenums` is not specified', () => {
      TestBed.overrideComponent(HostComponent, {
        set: { template: '<code-tabs linenums="default-lnums"></code-tabs>' }
      });

      createComponent(`
        <code-pane linenums="foo-lnums">foo</code-pane>
        <code-pane linenums>bar</code-pane>
        <code-pane>baz</code-pane>
      `);
      const lnums = codeComponents.map(c => c.linenums);

      expect(lnums).toEqual(['foo-lnums', '', 'default-lnums']);
    });

    it('should pass `path` to CodeComponent (<aio-code>)', () => {
      createComponent(`
        <code-pane path="foo-path">foo</code-pane>
        <code-pane path="bar-path">bar</code-pane>
      `);
      const paths = codeComponents.map(c => c.path);

      expect(paths).toEqual(['foo-path', 'bar-path']);
    });

    it('should default to an empty string if `path` is not spcified', () => {
      createComponent(`
        <code-pane>foo</code-pane>
        <code-pane>bar</code-pane>
      `);
      const paths = codeComponents.map(c => c.path);

      expect(paths).toEqual(['', '']);
    });

    it('should pass `region` to CodeComponent (<aio-code>)', () => {
      createComponent(`
        <code-pane region="foo-region">foo</code-pane>
        <code-pane region="bar-region">bar</code-pane>
      `);
      const regions = codeComponents.map(c => c.region);

      expect(regions).toEqual(['foo-region', 'bar-region']);
    });

    it('should default to an empty string if `region` is not spcified', () => {
      createComponent(`
        <code-pane>foo</code-pane>
        <code-pane>bar</code-pane>
      `);
      const regions = codeComponents.map(c => c.region);

      expect(regions).toEqual(['', '']);
    });

    it('should pass `title` to CodeComponent (<aio-code>)', () => {
      createComponent(`
        <code-pane title="foo-title">foo</code-pane>
        <code-pane title="bar-title">bar</code-pane>
      `);
      const titles = codeComponents.map(c => c.title);

      expect(titles).toEqual(['foo-title', 'bar-title']);
    });
  });
});

//// Test helpers ////
@Component({
  selector: 'aio-code',
  template: `
    <div>lang: {{ language }}</div>
    <div>linenums: {{ linenums }}</div>
    code: <pre>{{ someCode }}</pre>
  `
})
class TestCodeComponent {
  @Input() code = '';
  @Input() hideCopy: boolean;
  @Input() language: string;
  @Input() linenums: string;
  @Input() path: string;
  @Input() region: string;
  @Input() title: string;

  get someCode() {
    if (this.code && this.code.length > 30) {
      return `${this.code.substring(0, 30)}...`;
    }

    return this.code;
  }
}

@Component({
  selector: 'aio-host-comp',
  template: `<code-tabs></code-tabs>`
})
class HostComponent {}
