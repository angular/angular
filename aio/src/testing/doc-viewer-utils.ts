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

  prepareTitleAndToc(targetElem: HTMLElement, docId: string): () => void { return null as any; }
  render(doc: DocumentContents): Observable<void> { return null as any; }
  swapViews(onInsertedCb?: () => void): Observable<void> { return null as any; }
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
  @ViewChild(DocViewerComponent) docViewer: DocViewerComponent;
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
  subscribeSpy = spyOn(this, 'subscribe').and.callFake((...args: any[]) => {
    const subscription = super.subscribe(...args);
    const unsubscribeSpy = spyOn(subscription, 'unsubscribe').and.callThrough();
    this.unsubscribeSpies.push(unsubscribeSpy);
    return subscription;
  });

  constructor(subscriber = () => undefined) { super(subscriber); }
}
