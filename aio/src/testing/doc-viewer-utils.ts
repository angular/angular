import { Component, NgModule, ViewChild } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

import { Observable } from 'rxjs';

import { DocumentContents } from 'app/documents/document.service';
import { DocViewerComponent } from 'app/layout/doc-viewer/doc-viewer.component';
import { Logger } from 'app/shared/logger.service';
import { TocService } from 'app/shared/toc.service';
import { MockLogger } from 'testing/logger.service';
import { ElementsLoader } from 'app/custom-elements/elements-loader';


////////////////////////////////////////////////////////////////////////////////////////////////////
/// `TestDocViewerComponent` (for exposing internal `DocViewerComponent` methods as public).     ///
/// Only used for type-casting; the actual implementation is irrelevant.                         ///
////////////////////////////////////////////////////////////////////////////////////////////////////

export class TestDocViewerComponent extends DocViewerComponent {
  currViewContainer: HTMLElement;
  nextViewContainer: HTMLElement;

  // Only used for type-casting; the actual implementation is irrelevant.
  prepareTitleAndToc(_targetElem: HTMLElement, _docId: string): () => void { return null as any; }

  // Only used for type-casting; the actual implementation is irrelevant.
  render(_doc: DocumentContents): Observable<void> { return null as any; }

  // Only used for type-casting; the actual implementation is irrelevant.
  swapViews(_onInsertedCb?: () => void): Observable<void> { return null as any; }
}


////////////////////////////////////////////////////////////////////////////////////////////////////
/// `TestModule` and `TestParentComponent`.                                                      ///
////////////////////////////////////////////////////////////////////////////////////////////////////

// Test parent component.
@Component({
  selector: 'aio-test',
  template: '<aio-doc-viewer [doc]="currentDoc">Test Component</aio-doc-viewer>',
})
export class TestParentComponent {
  currentDoc?: DocumentContents|null;
  @ViewChild(DocViewerComponent, {static: true}) docViewer: DocViewerComponent;
}

// Mock services.
export class MockTitle {
  setTitle = jasmine.createSpy('Title#reset');
}

export class MockMeta {
  addTag = jasmine.createSpy('Meta#addTag');
  removeTag = jasmine.createSpy('Meta#removeTag');
}

export class MockTocService {
  genToc = jasmine.createSpy('TocService#genToc');
  reset = jasmine.createSpy('TocService#reset');
}

export class MockElementsLoader {
  loadContainedCustomElements =
      jasmine.createSpy('MockElementsLoader#loadContainedCustomElements');
}

@NgModule({
  declarations: [
    DocViewerComponent,
    TestParentComponent,
  ],
  providers: [
    { provide: Logger, useClass: MockLogger },
    { provide: Title, useClass: MockTitle },
    { provide: Meta, useClass: MockMeta },
    { provide: TocService, useClass: MockTocService },
    { provide: ElementsLoader, useClass: MockElementsLoader },
  ],
})
export class TestModule { }


////////////////////////////////////////////////////////////////////////////////////////////////////
/// An observable with spies to test subscribing/unsubscribing.                                  ///
////////////////////////////////////////////////////////////////////////////////////////////////////

export class ObservableWithSubscriptionSpies<T = void> extends Observable<T> {
  unsubscribeSpies: jasmine.Spy[] = [];
  subscribeSpy = spyOn(this as Observable<T>, 'subscribe').and.callFake(() => {
    const subscription = super.subscribe({
      next: () => ((window as any).mylogs || ((window as any).mylogs = [])).push('[ObservableWithSpies] subscribe next'),
      error: err => ((window as any).mylogs || ((window as any).mylogs = [])).push(`[ObservableWithSpies] subscribe error: ${err}`),
      complete: () => ((window as any).mylogs || ((window as any).mylogs = [])).push('[ObservableWithSpies] subscribe complete'),
    });
    const unsubscribe = subscription.unsubscribe;
    const unsubscribeSpy = spyOn(subscription, 'unsubscribe').and.callFake(() => {
      ((window as any).mylogs || ((window as any).mylogs = [])).push('[ObservableWithSpies] unsubscribe ' + this.unsubscribeSpies.length);
      return unsubscribe.call(subscription);
    });
    this.unsubscribeSpies.push(unsubscribeSpy);
    ((window as any).mylogs || ((window as any).mylogs = [])).push('[ObservableWithSpies] subscribe ' + this.unsubscribeSpies.length);
    return subscription;
  });

  constructor(subscribe = () => undefined) { super(subscribe); }
}


export const newObservableWithSubscriptionSpies = () => {
  const unsubscribeSpy = jasmine.createSpy('unsubscribe').and.callFake(() => {
    ((window as any).mylogs || ((window as any).mylogs = [])).push('[ObservableWithSpies] unsubscribe');
  });
  const subscribeSpy = jasmine.createSpy('subscribe').and.callFake(() => {
    ((window as any).mylogs || ((window as any).mylogs = [])).push('[ObservableWithSpies] subscribe');
    return unsubscribeSpy;
  });

  return {
    observable: new Observable(subscribeSpy),
    subscribeSpy,
    unsubscribeSpy,
  };
};
