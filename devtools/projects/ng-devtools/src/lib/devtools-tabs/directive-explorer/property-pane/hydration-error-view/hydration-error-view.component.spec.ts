/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {
  HydrationErrorViewComponent,
  MismatchedHydrationStatus,
} from './hydration-error-view.component';

function createComponent(hydration: MismatchedHydrationStatus): {
  fixture: ComponentFixture<HydrationErrorViewComponent>;
  component: HydrationErrorViewComponent;
} {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({imports: [HydrationErrorViewComponent]});
  const fixture = TestBed.createComponent(HydrationErrorViewComponent);
  fixture.componentRef.setInput('hydration', hydration);
  fixture.detectChanges();
  return {fixture, component: fixture.componentInstance};
}

describe('HydrationErrorViewComponent', () => {
  it('should render expected and actual snippets and highlight marker lines', () => {
    const {fixture} = createComponent({
      status: 'mismatched',
      errorCode: 'NG0500',
      hasActualNode: true,
      expectedNodeDetails: '<div>\n  <b>…</b>  <-- AT THIS LOCATION\n</div>',
      actualNodeDetails: '<div>\n  <span>…</span>  <-- AT THIS LOCATION\n</div>',
    });

    expect(fixture.debugElement.query(By.css('.error-code')).nativeElement.textContent.trim()).toBe(
      'NG0500',
    );
    const docsLink = fixture.debugElement.query(By.css('.docs-link'))
      .nativeElement as HTMLAnchorElement;
    expect(docsLink.href).toBe('https://angular.dev/errors/NG0500');

    const expectedHighlighted = fixture.debugElement.queryAll(
      By.css('.dom-snippet.expected .snippet-line.highlighted'),
    );
    expect(expectedHighlighted.length).toBe(1);
    expect(expectedHighlighted[0].nativeElement.textContent).toContain('<b>');

    const actualHighlighted = fixture.debugElement.queryAll(
      By.css('.dom-snippet.actual .snippet-line.highlighted'),
    );
    expect(actualHighlighted.length).toBe(1);
    expect(actualHighlighted[0].nativeElement.textContent).toContain('<span>');
  });

  it('should reject malformed error codes and fall back to the hydration guide URL', () => {
    const {fixture} = createComponent({
      status: 'mismatched',
      errorCode: '../evil',
      expectedNodeDetails: '<div></div>',
      actualNodeDetails: null,
    });

    expect(fixture.debugElement.query(By.css('.error-code'))).toBeNull();
    const docsLink = fixture.debugElement.query(By.css('.docs-link'))
      .nativeElement as HTMLAnchorElement;
    expect(docsLink.href).toBe('https://angular.dev/guide/hydration');
  });

  it('should label the inspect button according to hasActualNode and isParentFallback', () => {
    const legacy = createComponent({
      status: 'mismatched',
      expectedNodeDetails: null,
      actualNodeDetails: null,
    });
    expect(
      legacy.fixture.debugElement.query(By.css('.action-btn')).nativeElement.textContent,
    ).toContain('Inspect host');

    const missing = createComponent({
      status: 'mismatched',
      hasActualNode: true,
      isParentFallback: true,
      expectedNodeDetails: '<div><b>…</b>  <-- AT THIS LOCATION</div>',
      actualNodeDetails: null,
    });
    expect(
      missing.fixture.debugElement.query(By.css('.action-btn')).nativeElement.textContent,
    ).toContain('Inspect parent');
    expect(missing.fixture.debugElement.query(By.css('.note')).nativeElement.textContent).toContain(
      'missing',
    );

    const exact = createComponent({
      status: 'mismatched',
      hasActualNode: true,
      expectedNodeDetails: '<b></b>',
      actualNodeDetails: '<span></span>',
    });
    expect(
      exact.fixture.debugElement.query(By.css('.action-btn')).nativeElement.textContent,
    ).toContain('Inspect DOM node');
  });

  it('should emit inspect, log, and hover highlight events', () => {
    const {fixture, component} = createComponent({
      status: 'mismatched',
      hasActualNode: true,
      expectedNodeDetails: '<b></b>',
      actualNodeDetails: '<span></span>',
    });

    const inspectSpy = jasmine.createSpy('inspect');
    const logSpy = jasmine.createSpy('log');
    const highlightSpy = jasmine.createSpy('highlight');
    const unhighlightSpy = jasmine.createSpy('unhighlight');

    component.inspectDomNode.subscribe(inspectSpy);
    component.logDomNode.subscribe(logSpy);
    component.highlightDomNode.subscribe(highlightSpy);
    component.unhighlightDomNode.subscribe(unhighlightSpy);

    const [inspectBtn, logBtn] = fixture.debugElement.queryAll(By.css('.action-btn'));
    inspectBtn.nativeElement.click();
    logBtn.nativeElement.click();
    inspectBtn.triggerEventHandler('mouseenter', {});
    inspectBtn.triggerEventHandler('mouseleave', {});

    expect(inspectSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(highlightSpy).toHaveBeenCalledTimes(1);
    expect(unhighlightSpy).toHaveBeenCalledTimes(1);
  });
});
