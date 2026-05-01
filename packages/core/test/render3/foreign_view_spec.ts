/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  Directive,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ɵcreateAndInsertForeignView,
} from '@angular/core';
import {TestBed} from '../../testing';
import {HEADER_OFFSET, TVIEW, TViewType} from '../../src/render3/interfaces/view';

@Component({
  template: `
    <div #container></div>
    <div #container2></div>
  `,
})
class TestComponent {
  @ViewChild('container', {read: ViewContainerRef, static: true}) vcr!: ViewContainerRef;
  @ViewChild('container2', {read: ViewContainerRef, static: true}) vcr2!: ViewContainerRef;
}

@Directive({
  selector: '[foreign]',
})
class ForeignDirective {
  constructor(vcr: ViewContainerRef) {
    const viewRef = ɵcreateAndInsertForeignView(vcr, 0);
    const head = viewRef.head;

    const span = document.createElement('span');
    span.textContent = 'foreign node';
    head.after(span);
  }
}

@Component({
  template: `
    <ng-template #tmpl>
      <ng-container foreign></ng-container>
    </ng-template>
    <div #target></div>
  `,
  imports: [ForeignDirective],
})
class TestTemplateComponent {
  @ViewChild('tmpl', {read: TemplateRef, static: true}) tmpl!: TemplateRef<any>;
  @ViewChild('target', {read: ViewContainerRef, static: true}) target!: ViewContainerRef;
}

describe('foreign views', () => {
  it('should create a foreign view inside a ViewContainerRef', () => {
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const vcr = fixture.componentInstance.vcr;
    expect(vcr).toBeDefined();

    const viewRef = ɵcreateAndInsertForeignView(vcr, 0);
    const foreignLView = (viewRef as any)._lView; // internal LView!

    expect(foreignLView).toBeDefined();
    const tView = foreignLView[TVIEW];
    expect(tView.type).toBe(TViewType.Foreign);

    // Verify slots
    const headTNode = tView.firstChild!;
    expect(headTNode.index).toBe(HEADER_OFFSET);

    const tailTNode = headTNode.next!;
    expect(tailTNode.index).toBe(HEADER_OFFSET + 1);

    const headComment = foreignLView[headTNode.index];
    expect(headComment).toBeDefined();

    const tailComment = foreignLView[tailTNode.index];
    expect(tailComment).toBeDefined();
  });

  it('should support moving foreign views between containers', () => {
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const vcr = fixture.componentInstance.vcr;
    const vcr2 = fixture.componentInstance.vcr2;
    expect(vcr).toBeDefined();
    expect(vcr2).toBeDefined();

    const viewRef = ɵcreateAndInsertForeignView(vcr, 0);
    const foreignLView = (viewRef as any)._lView; // internal LView!

    const tView = foreignLView[TVIEW];
    const tailTNode = tView.firstChild!.next!;
    const headComment = foreignLView[tView.firstChild!.index];
    const tailComment = foreignLView[tailTNode.index];

    // Mock some foreign elements between head and tail
    const doc = (foreignLView[0] as any).ownerDocument;
    const span1 = doc.createElement('span');
    const span2 = doc.createElement('span');
    const parentNode = (headComment as any).parentNode;

    parentNode.insertBefore(span1, tailComment);
    parentNode.insertBefore(span2, tailComment);

    const initialParentCount = parentNode.childNodes.length;

    // 1. Detach view using public API
    const retrievedViewRef = vcr.get(0)!;
    expect(retrievedViewRef).toBeDefined();
    vcr.detach(0);

    expect(parentNode.childNodes.length).toBe(initialParentCount - 4); // minus head, span1, span2, tail

    // 2. Reattach view to container2
    vcr2.insert(viewRef);

    expect(fixture.nativeElement.innerHTML).toBe(
      '<div></div><!--container--><div></div><!----><span></span><span></span><!----><!--container-->',
    );
  });

  it('should not break when triggering change detection on host', () => {
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const vcr = fixture.componentInstance.vcr;
    ɵcreateAndInsertForeignView(vcr, 0);

    // Trigger change detection again - should not throw
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should support foreign views inside ng-template', () => {
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(TestTemplateComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    const viewRef = comp.target.createEmbeddedView(comp.tmpl);
    fixture.detectChanges();

    // Verify the foreign element is there
    expect(fixture.nativeElement.innerHTML).toContain('<span>foreign node</span>');

    // Verify rootNodes of the outer embedded view includes the span!
    const rootNodes = viewRef.rootNodes;
    const hasSpan = rootNodes.some((node: any) => node.nodeName === 'SPAN');
    expect(hasSpan).toBeTrue();
  });
});
