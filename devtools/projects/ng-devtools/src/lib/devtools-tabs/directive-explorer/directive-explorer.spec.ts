/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Events, MessageBus, PropertyQueryTypes} from 'protocol';

import {ApplicationOperations} from '../../application-operations';

import {DirectiveExplorerComponent} from './directive-explorer.component';
import {DirectiveForestComponent} from './directive-forest/directive-forest.component';
import {IndexedNode} from './directive-forest/index-forest';
import {ElementPropertyResolver} from './property-resolver/element-property-resolver';

import SpyObj = jasmine.SpyObj;
import {By} from '@angular/platform-browser';

describe('DirectiveExplorerComponent', () => {
  let messageBusMock: SpyObj<MessageBus<Events>>;
  let fixture: ComponentFixture<DirectiveExplorerComponent>;
  let comp: DirectiveExplorerComponent;
  let applicationOperationsSpy: SpyObj<ApplicationOperations>;

  beforeEach(() => {
    applicationOperationsSpy = jasmine.createSpyObj<ApplicationOperations>('_appOperations', [
      'viewSource',
      'selectDomElement',
    ]);
    messageBusMock = jasmine.createSpyObj<MessageBus<Events>>('messageBus', [
      'on',
      'once',
      'emit',
      'destroy',
    ]);

    TestBed.configureTestingModule({
      providers: [
        {provide: ApplicationOperations, useValue: applicationOperationsSpy},
        {provide: MessageBus, useValue: messageBusMock},
        {
          provide: ElementPropertyResolver,
          useValue: new ElementPropertyResolver(messageBusMock),
        },
      ],
    }).overrideComponent(DirectiveExplorerComponent, {
      add: {schemas: [CUSTOM_ELEMENTS_SCHEMA]},
      remove: {imports: [DirectiveForestComponent]},
    });

    fixture = TestBed.createComponent(DirectiveExplorerComponent);
    comp = fixture.componentInstance;
  });

  it('should create instance from class', () => {
    expect(comp).toBeTruthy();
  });

  it('subscribe to backend events', () => {
    comp.subscribeToBackendEvents();
    expect(messageBusMock.on).toHaveBeenCalledTimes(2);
    expect(messageBusMock.on).toHaveBeenCalledWith(
      'latestComponentExplorerView',
      jasmine.any(Function),
    );
    expect(messageBusMock.on).toHaveBeenCalledWith('componentTreeDirty', jasmine.any(Function));
  });

  describe('refresh', () => {
    it('should emit getLatestComponentExplorerView event on refresh', () => {
      comp.refresh();
      expect(messageBusMock.emit).toHaveBeenCalledTimes(1);
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
      comp.currentSelectedElement = currentSelectedElement;
      comp.refresh();
      expect(comp.currentSelectedElement).toBeTruthy();
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
      expect(messageBusMock.emit).toHaveBeenCalledTimes(2);
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
      expect(messageBusMock.emit).toHaveBeenCalledTimes(1);
      expect(messageBusMock.emit).toHaveBeenCalledWith('createHydrationOverlay');

      comp.removeHydrationNodesHightlights();
      expect(messageBusMock.emit).toHaveBeenCalledTimes(2);
      expect(messageBusMock.emit).toHaveBeenCalledWith('removeHydrationOverlay');
    });

    it('should show hydration slide toggle', () => {
      comp.isHydrationEnabled = true;
      fixture.detectChanges();
      const toggle = fixture.debugElement.query(By.css('mat-slide-toggle'));
      expect(toggle).toBeTruthy();

      comp.isHydrationEnabled = false;
      fixture.detectChanges();
      const toggle2 = fixture.debugElement.query(By.css('mat-slide-toggle'));
      expect(toggle2).toBeFalsy();
    });
  });
});
