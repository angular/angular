/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ApplicationOperations} from '../../application-operations';
import {DirectivePosition, MessageBus, PropType, PropertyQueryTypes} from '../../../../../protocol';

import {DirectiveExplorerComponent} from './directive-explorer.component';
import {DirectiveForestComponent} from './directive-forest/directive-forest.component';
import {IndexedNode} from './directive-forest/index-forest';

import SpyObj = jasmine.SpyObj;
import {By} from '@angular/platform-browser';
import {FrameManager} from '../../application-services/frame_manager';
import {Component, CUSTOM_ELEMENTS_SCHEMA, output, input} from '@angular/core';
import {ElementPropertyResolver, FlatNode} from './property-resolver/element-property-resolver';
import {BreadcrumbsComponent} from './directive-forest/breadcrumbs/breadcrumbs.component';
import {PropertyTabComponent} from './property-tab/property-tab.component';

@Component({
  selector: 'ng-directive-forest',
  template: '',
})
class MockDirectiveForestComponent {
  readonly forest = input<IndexedNode[]>([]);
  readonly currentSelectedElement = input<IndexedNode | null>(null);
  readonly showCommentNodes = input(false);
  readonly selectNode = output<IndexedNode>();
  readonly selectDomElement = output<IndexedNode>();
  readonly setParents = output<IndexedNode>();
  readonly highlightComponent = output<IndexedNode>();
  readonly removeComponentHighlight = output<void>();
  readonly toggleInspector = output<void>();
}

@Component({
  selector: 'ng-breadcrumbs',
  template: '',
})
class MockBreadcrumbsComponent {
  readonly parents = input<IndexedNode[]>([]);
  readonly handleSelect = output<any>();
  readonly mouseLeaveNode = output<any>();
  readonly mouseOverNode = output<any>();
}

@Component({
  selector: 'ng-property-tab',
  template: '',
})
class MockPropertyTabComponent {
  readonly currentSelectedElement = input<IndexedNode | null>(null);
  readonly inspect = output<{node: FlatNode; directivePosition: DirectivePosition}>();
  readonly viewSource = output<string>();
}

describe('DirectiveExplorerComponent', () => {
  let messageBusMock: SpyObj<any>;
  let fixture: ComponentFixture<DirectiveExplorerComponent>;
  let comp: DirectiveExplorerComponent;
  let applicationOperationsSpy: SpyObj<ApplicationOperations>;
  let contentScriptConnected = (frameId: number, name: string, url: string) => {};
  let frameConnected = (frameId: number) => {};

  beforeEach(() => {
    applicationOperationsSpy = jasmine.createSpyObj<ApplicationOperations>('_appOperations', [
      'viewSource',
      'selectDomElement',
      'inspect',
    ]);

    messageBusMock = jasmine.createSpyObj('messageBus', ['on', 'once', 'emit', 'destroy']);

    messageBusMock.on.and.callFake((topic: string, cb: Function) => {
      if (topic === 'contentScriptConnected') {
        contentScriptConnected = cb as (frameId: number, name: string, url: string) => void;
      }
      if (topic === 'frameConnected') {
        frameConnected = cb as (frameId: number) => void;
      }
    });
    messageBusMock.emit.and.callFake((topic: string, args: any[]) => {
      if (topic === 'enableFrameConnection') {
        frameConnected(args[0]);
      }
    });

    TestBed.configureTestingModule({
      providers: [
        {provide: ApplicationOperations, useValue: applicationOperationsSpy},
        {provide: MessageBus, useValue: messageBusMock},
        {
          provide: ElementPropertyResolver,
          useValue: new ElementPropertyResolver(messageBusMock),
        },
        {provide: FrameManager, useFactory: () => FrameManager.initialize(123)},
      ],
    }).overrideComponent(DirectiveExplorerComponent, {
      add: {schemas: [CUSTOM_ELEMENTS_SCHEMA]},
      remove: {imports: [DirectiveForestComponent]},
    });

    fixture = TestBed.overrideComponent(DirectiveExplorerComponent, {
      remove: {imports: [DirectiveForestComponent, BreadcrumbsComponent, PropertyTabComponent]},
      add: {
        imports: [MockDirectiveForestComponent, MockBreadcrumbsComponent, MockPropertyTabComponent],
      },
    }).createComponent(DirectiveExplorerComponent);
    comp = fixture.componentInstance;

    TestBed.inject(FrameManager);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create instance from class', () => {
    expect(comp).toBeTruthy();
  });

  it('subscribe to backend events', () => {
    expect(messageBusMock.on).toHaveBeenCalledWith(
      'latestComponentExplorerView',
      jasmine.any(Function),
    );
    expect(messageBusMock.on).toHaveBeenCalledWith('componentTreeDirty', jasmine.any(Function));
  });

  describe('refresh', () => {
    it('should emit getLatestComponentExplorerView event on refresh', () => {
      comp.refresh();
      expect(messageBusMock.emit).toHaveBeenCalledWith('getLatestComponentExplorerView', [
        undefined,
      ]);
    });

    it('should emit getLatestComponentExplorerView event with null view query', () => {
      comp.refresh();
      expect(messageBusMock.emit).toHaveBeenCalledWith('getLatestComponentExplorerView', [
        undefined,
      ]);
    });

    it('should emit getLatestComponentExplorerView event on refresh with view query no properties', () => {
      const currentSelectedElement = jasmine.createSpyObj('currentSelectedElement', [
        'position',
        'children',
      ]);
      currentSelectedElement.position = [0];
      currentSelectedElement.children = [];
      comp.currentSelectedElement.set(currentSelectedElement);
      comp.refresh();
      expect(comp.currentSelectedElement()).toBeTruthy();
      expect(messageBusMock.emit).toHaveBeenCalledWith('getLatestComponentExplorerView', [
        undefined,
      ]);
    });
  });

  describe('node selection event', () => {
    let nodeMock: SpyObj<IndexedNode>;

    beforeEach(() => {
      nodeMock = jasmine.createSpyObj('node', ['position', 'children']);
    });

    it('fires node selection events', () => {
      const position = [0];
      nodeMock.position = position;
      comp.handleNodeSelection(nodeMock);
      expect(messageBusMock.emit).toHaveBeenCalledWith('setSelectedComponent', [nodeMock.position]);
      expect(messageBusMock.emit).toHaveBeenCalledWith('getLatestComponentExplorerView', [
        {
          selectedElement: position,
          propertyQuery: {
            type: PropertyQueryTypes.All,
          },
        },
      ]);
    });
  });

  describe('hydration', () => {
    it('should highlight hydration nodes', () => {
      comp.hightlightHydrationNodes();
      expect(messageBusMock.emit).toHaveBeenCalledWith('createHydrationOverlay');

      comp.removeHydrationNodesHightlights();
      expect(messageBusMock.emit).toHaveBeenCalledWith('removeHydrationOverlay');
    });

    it('should show hydration slide toggle', () => {
      fixture.componentRef.setInput('isHydrationEnabled', true);
      fixture.detectChanges();
      const toggle = fixture.debugElement.query(By.css('mat-slide-toggle'));
      expect(toggle).toBeTruthy();

      fixture.componentRef.setInput('isHydrationEnabled', false);
      fixture.detectChanges();
      const toggle2 = fixture.debugElement.query(By.css('mat-slide-toggle'));
      expect(toggle2).toBeFalsy();
    });
  });

  describe('applicaton operations', () => {
    describe('view source', () => {
      it('should not call application operations view source if no frames are detected', () => {
        const directiveName = 'test';
        comp.currentSelectedElement.set({
          directives: [{name: directiveName}],
          position: [0],
          children: [] as IndexedNode[],
        } as IndexedNode);
        comp.viewSource(directiveName);
        expect(applicationOperationsSpy.viewSource).toHaveBeenCalledTimes(0);
      });

      it('should not call application operations view source if a frame is selected that does not have a unique url on the page', () => {
        contentScriptConnected(0, 'test1', 'http://localhost:4200/url');
        contentScriptConnected(1, 'test2', 'http://localhost:4200/url');

        const directiveName = 'test';
        comp.currentSelectedElement.set({
          directives: [{name: directiveName}],
          position: [0],
          children: [] as IndexedNode[],
        } as IndexedNode);

        comp.viewSource(directiveName);

        expect(applicationOperationsSpy.viewSource).toHaveBeenCalledTimes(0);
        expect(messageBusMock.emit).toHaveBeenCalledWith('enableFrameConnection', [0, 123]);
        expect(messageBusMock.emit).toHaveBeenCalledWith('log', [
          {
            level: 'warn',
            message: `The currently inspected frame does not have a unique url on this page. Cannot view source.`,
          },
        ]);
      });

      it('should call application operations view source if a frame is selected that has a unique url on the page', () => {
        contentScriptConnected(0, 'test1', 'http://localhost:4200/url');
        contentScriptConnected(1, 'test2', 'http://localhost:4200/url2');

        const directiveName = 'test';
        comp.currentSelectedElement.set({
          directives: [{name: directiveName}],
          position: [0],
          children: [] as IndexedNode[],
        } as IndexedNode);

        comp.viewSource(directiveName);

        expect(applicationOperationsSpy.viewSource).toHaveBeenCalledTimes(1);
        expect(messageBusMock.emit).toHaveBeenCalledWith('enableFrameConnection', [0, 123]);
        expect(applicationOperationsSpy.viewSource).toHaveBeenCalledWith(
          [0], // current selected element position
          {name: 'test1', id: 0, url: new URL('http://localhost:4200/url')},
          0, // directive index
        );
      });
    });

    describe('select dom element', () => {
      it('should not call application operations select dom element if no frames are detected', () => {
        comp.handleSelectDomElement({position: [0], children: [] as IndexedNode[]} as IndexedNode);
        expect(applicationOperationsSpy.selectDomElement).toHaveBeenCalledTimes(0);
      });

      it('should not call application operations select dom element if a frame is selected that does not have a unique url on the page', () => {
        contentScriptConnected(0, 'test1', 'http://localhost:4200/url');
        contentScriptConnected(1, 'test2', 'http://localhost:4200/url');

        comp.handleSelectDomElement({position: [0], children: [] as IndexedNode[]} as IndexedNode);

        expect(applicationOperationsSpy.selectDomElement).toHaveBeenCalledTimes(0);
        expect(messageBusMock.emit).toHaveBeenCalledWith('enableFrameConnection', [0, 123]);
        expect(messageBusMock.emit).toHaveBeenCalledWith('log', [
          {
            level: 'warn',
            message: `The currently inspected frame does not have a unique url on this page. Cannot select DOM element.`,
          },
        ]);
      });

      it('should call application operations select dom element if a frame is selected that has a unique url on the page', () => {
        contentScriptConnected(0, 'test1', 'http://localhost:4200/url');
        contentScriptConnected(1, 'test2', 'http://localhost:4200/url2');

        comp.handleSelectDomElement({position: [0], children: [] as IndexedNode[]} as IndexedNode);

        expect(applicationOperationsSpy.selectDomElement).toHaveBeenCalledTimes(1);
        expect(messageBusMock.emit).toHaveBeenCalledWith('enableFrameConnection', [0, 123]);
        expect(applicationOperationsSpy.selectDomElement).toHaveBeenCalledWith(
          [0], // current selected element position
          {name: 'test1', id: 0, url: new URL('http://localhost:4200/url')},
        );
      });
    });

    describe('inspect', () => {
      let node: FlatNode;
      let directivePosition: DirectivePosition;

      beforeEach(() => {
        node = {
          expandable: true,
          prop: {
            name: 'foo',
            parent: null,
            descriptor: {
              expandable: true,
              editable: false,
              type: PropType.String,
              preview: 'preview',
              containerType: null,
            },
          },
          level: 1,
        };
        directivePosition = {element: [0], directive: 0};
      });

      it('should not call application operations inspect if no frames are detected', () => {
        comp.inspect({node, directivePosition});
        expect(applicationOperationsSpy.selectDomElement).toHaveBeenCalledTimes(0);
      });

      it('should not call application operations inspect if a frame is selected that does not have a unique url on the page', () => {
        contentScriptConnected(0, 'test1', 'http://localhost:4200/url');
        contentScriptConnected(1, 'test2', 'http://localhost:4200/url');

        comp.inspect({node, directivePosition});

        expect(applicationOperationsSpy.inspect).toHaveBeenCalledTimes(0);
        expect(messageBusMock.emit).toHaveBeenCalledWith('enableFrameConnection', [0, 123]);
        expect(messageBusMock.emit).toHaveBeenCalledWith('log', [
          {
            level: 'warn',
            message: `The currently inspected frame does not have a unique url on this page. Cannot inspect object.`,
          },
        ]);
      });

      it('should call application operations inspect if a frame is selected that has a unique url on the page', () => {
        contentScriptConnected(0, 'test1', 'http://localhost:4200/url');
        contentScriptConnected(1, 'test2', 'http://localhost:4200/url2');

        comp.inspect({node, directivePosition});

        expect(applicationOperationsSpy.inspect).toHaveBeenCalledTimes(1);
        expect(messageBusMock.emit).toHaveBeenCalledWith('enableFrameConnection', [0, 123]);
        expect(applicationOperationsSpy.inspect).toHaveBeenCalledWith(directivePosition, ['foo'], {
          name: 'test1',
          id: 0,
          url: new URL('http://localhost:4200/url'),
        });
      });
    });
  });
});
