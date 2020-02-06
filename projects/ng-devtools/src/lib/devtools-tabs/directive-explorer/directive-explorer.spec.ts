import { DirectiveExplorerComponent } from './directive-explorer.component';
import { ComponentExplorerViewQuery } from 'protocol';
import { IndexedNode } from './directive-forest/index-forest';
import SpyObj = jasmine.SpyObj;
import Spy = jasmine.Spy;
import { TestBed } from '@angular/core/testing';

describe('DirectiveExplorerComponent', () => {
  let messageBusMock;
  let comp: DirectiveExplorerComponent;

  beforeEach(() => {
    comp = TestBed.createComponent(DirectiveExplorerComponent).componentInstance;
    messageBusMock = jasmine.createSpyObj('messageBus', ['on', 'once', 'emit', 'destroy']);
    comp.messageBus = messageBusMock;
  });

  it('should create instance from class', () => {
    expect(comp).toBeTruthy();
  });

  it('return value in item for name tracking', () => {
    const item = { key: 'value' };
    const value = comp.nameTracking(0, item);
    expect(value).toBe(item.key);
  });

  it('subscribe to backend events', () => {
    comp.subscribeToBackendEvents();
    expect(comp.messageBus.on).toHaveBeenCalledTimes(2);
    expect(comp.messageBus.on).toHaveBeenCalledWith('elementDirectivesProperties', jasmine.any(Function));
    expect(comp.messageBus.on).toHaveBeenCalledWith('latestComponentExplorerView', jasmine.any(Function));
  });

  describe('refresh', () => {
    it('should emit getLatestComponentExplorerView event on refresh', () => {
      comp.refresh();
      expect(comp.messageBus.emit).toHaveBeenCalledTimes(1);
    });

    it('should emit getLatestComponentExplorerView event with null view query', () => {
      comp.refresh();
      const nullViewQuery: ComponentExplorerViewQuery = { selectedElement: null, expandedProperties: null };
      expect(comp.messageBus.emit).toHaveBeenCalledWith('getLatestComponentExplorerView', [nullViewQuery]);
    });

    it('should emit getLatestComponentExplorerView event on refresh with view query no properties', () => {
      const currentSelectedElement = jasmine.createSpyObj('currentSelectedElement', ['id', 'children'])
      currentSelectedElement.id = [0];
      currentSelectedElement.children = [];
      comp.currentSelectedElement = currentSelectedElement;
      comp.propertyViews = jasmine.createSpyObj('propertyViews', ['toArray']);
      (comp.propertyViews.toArray as Spy).and.returnValue([]);
      comp.refresh();
      const viewQuery: ComponentExplorerViewQuery = { selectedElement: comp.currentSelectedElement.id, expandedProperties: {} };
      expect(comp.messageBus.emit).toHaveBeenCalledWith('getLatestComponentExplorerView', [viewQuery]);
    });
  });

  describe('node selection event', () => {
    let nodeMock: SpyObj<IndexedNode>;

    beforeEach(() => {
      nodeMock = jasmine.createSpyObj('node', ['id', 'children']);
    });

    it('sets current selected element', () => {
      comp.handleNodeSelection(nodeMock);
      expect(comp.currentSelectedElement).toBe(nodeMock);
    });

    it('fires node selection events', () => {
      nodeMock.id = [0];
      comp.handleNodeSelection(nodeMock);
      expect(comp.messageBus.emit).toHaveBeenCalledTimes(2);
      expect(comp.messageBus.emit).toHaveBeenCalledWith('getElementDirectivesProperties', [nodeMock.id]);
      expect(comp.messageBus.emit).toHaveBeenCalledWith('setSelectedComponent', [nodeMock.id]);
    });
  });
});
