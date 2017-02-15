/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Component, CUSTOM_ELEMENTS_SCHEMA, DebugElement, EventEmitter, Input, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/delay';

import { Doc, DocMetadata, NavEngine, NavMapService, NavMap, NavNode } from '../nav-engine';
import { SidenavComponent } from './sidenav.component';

//// Test Components ///
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'md-sidenav',
  template: ''
})
export class FakeMdSideNavComponent {
  _isOpen = false;
  @Input() opened: boolean;
  @Input() mode: 'side' | 'over';
  toggle = jasmine.createSpy('toggle');
}

@Component({
  selector: 'aio-doc-viewer',
  template: ''
})
export class FakeDocViewerComponent {
  @Input() doc: Doc;
}

//// Tests /////
describe('SidenavComponent', () => {
  let component: SidenavComponent;
  let fixture: ComponentFixture<SidenavComponent>;

  let fakeDoc: Doc;
  let fakeNode: NavNode;
  let fakeNavMap: NavMap;
  let navEngine: NavEngine;
  let navMapService: NavMapService;
  let navigateSpy: jasmine.Spy;

  beforeEach(async(() => {
    fakeDoc = {
      metadata: {docId: 'fake'} as DocMetadata,
      content: 'Fake content'
    };

    navEngine = {
      currentDoc: of(fakeDoc).delay(0).take(1),
      navigate: (docId: string) => { }
    } as NavEngine;
    navigateSpy = spyOn(navEngine, 'navigate');

    fakeNode = {
      id: 42,
      docId: fakeDoc.metadata.docId,
      navTitle: 'Fakery',
      docPath: 'content/fake.hmlt'
    } as NavNode;

    fakeNavMap  = {
      nodes: [fakeNode],
      docs: new Map<string, NavNode>([[fakeNode.docId, fakeNode]])
    };

    navMapService = {
      navMap: of(fakeNavMap).delay(0).take(1)
    } as NavMapService;

    TestBed.configureTestingModule({
      declarations: [
        SidenavComponent,
        FakeMdSideNavComponent,
        FakeDocViewerComponent
     ],
      providers: [
        {provide: NavEngine, useValue: navEngine },
        {provide: NavMapService, useValue: navMapService }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('#currentDoc', () => {
    it('should have "currentDoc" after a tick', fakeAsync(() => {
      component.currentDoc.subscribe(doc => {
        expect(doc).toBe(fakeDoc);
      });
      tick();
    }));
    it('should set "currentDocId" as side effect', fakeAsync(() => {
      component.currentDoc.subscribe(doc => {
        expect(component.currentDocId).toEqual(fakeDoc.metadata.docId);
      });
      tick();
    }));
  });

  describe('#nodes', () => {
    it('should have "nodes" after a tick', fakeAsync(() => {
      component.nodes.subscribe(nodes => {
        expect(nodes).toEqual(fakeNavMap.nodes);
      });
      tick();
    }));
  });

  describe('#selectedNode', () => {
    // Simulate when user clicks a left nav link in a `NavItemComponent`
    // which calls `emit` on the selectedNode navigates
    // all of this synchronously
    it('should call navigate after emitting a node', () => {
      expect(navigateSpy.calls.count()).toBe(0, 'before emit');
      component.selectedNode.emit(fakeNode);
      expect(navigateSpy.calls.count()).toBe(1, 'after emit');
    });

    it('should raise event when currentDoc changes', done => {
      component.selectedNode.subscribe((node: NavNode) => {
        expect(node.docId).toBe(fakeDoc.metadata.docId);
        done();
      });
    });
  });

  describe('#onResize', () => {
    it('should go into side-by-side when width > 600', () => {
      component.onResize(601);
      expect(component.isSideBySide).toBe(true);
    });

    it('should emit overlay mode when width > 600', () => {
      component.isOverlayMode.subscribe(isOverlay =>
        expect(isOverlay).toBe(false)
      );
      component.onResize(601);
    });
      it('should go into side-by-side when width == 600', () => {
      component.onResize(600);
      expect(component.isSideBySide).toBe(false);
    });

    it('should emit overlay mode when width == 600', () => {
      component.isOverlayMode.subscribe(isOverlay =>
        expect(isOverlay).toBe(true)
      );
      component.onResize(600);
    });
  });

  describe('-> MdSideNav', () => {

    let mdSideNavComponent: FakeMdSideNavComponent;

    beforeEach(() => {
      mdSideNavComponent = fixture.debugElement
        .query(By.directive(FakeMdSideNavComponent))
        .componentInstance as FakeMdSideNavComponent;
    });

    it('toggle should call through to MdSideNav toggle', () => {
      const calls = mdSideNavComponent.toggle.calls;
      expect(calls.count()).toBe(0, 'before toggle');
      component.toggle();
      expect(calls.count()).toBe(1, 'after toggle');
    });

    it('should be opened when width > 600', () => {
      component.onResize(601);
      fixture.detectChanges();
      expect(mdSideNavComponent.opened).toBe(true);
    });

    it('should be not open when width == 600', () => {
      component.onResize(600);
      fixture.detectChanges();
      expect(mdSideNavComponent.opened).toBe(false);
    });
  });

  describe('-> DocViewer', () => {
    let docViewer: FakeDocViewerComponent;

    beforeEach(() => {
      docViewer = fixture.debugElement
        .query(By.directive(FakeDocViewerComponent))
        .componentInstance as FakeDocViewerComponent;
    });

    it('should not have a document at the start', () => {
      expect(docViewer.doc).toBeNull();
    });

    // Doesn't work with fakeAsync and async complains about the delay timer (setInterval);
    // it('should have a document after NavEngine has a current doc', (fakeAsync(() => {
    //   tick();
    //   fixture.detectChanges();
    //   expect(docViewer.doc).toBe(fakeDoc);
    // })));

    // Must go old school with setTimeout and `done`
    it('should have a document after NavEngine has a current doc', (done => {
      setTimeout(() => {
        fixture.detectChanges();
        expect(docViewer.doc).toBe(fakeDoc);
        done();
      }, 1);
    }));

  });
});
