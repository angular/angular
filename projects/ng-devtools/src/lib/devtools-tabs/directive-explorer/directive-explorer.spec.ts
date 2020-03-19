import { DirectiveExplorerComponent } from './directive-explorer.component';
import { ComponentExplorerViewQuery } from 'protocol';
import { IndexedNode } from './directive-forest/index-forest';
import SpyObj = jasmine.SpyObj;
import { ElementPropertyResolver } from './property-resolver/element-property-resolver';

describe('DirectiveExplorerComponent', () => {
  let messageBusMock: any;
  let comp: DirectiveExplorerComponent;
  let applicationOperationsSpy: any;
  let snackBarSpy: any;

  beforeEach(() => {
    applicationOperationsSpy = jasmine.createSpyObj('_appOperations', ['viewSource', 'selectDomElement']);
    snackBarSpy = jasmine.createSpyObj('_snackBar', ['show']);
    messageBusMock = jasmine.createSpyObj('messageBus', ['on', 'once', 'emit', 'destroy']);
    comp = new DirectiveExplorerComponent(
      applicationOperationsSpy,
      snackBarSpy,
      messageBusMock,
      new ElementPropertyResolver(messageBusMock)
    );
  });

  it('should create instance from class', () => {
    expect(comp).toBeTruthy();
  });

  it('subscribe to backend events', () => {
    comp.subscribeToBackendEvents();
    expect(messageBusMock.on).toHaveBeenCalledTimes(5);
    expect(messageBusMock.on).toHaveBeenCalledWith('elementDirectivesProperties', jasmine.any(Function));
    expect(messageBusMock.on).toHaveBeenCalledWith('latestComponentExplorerView', jasmine.any(Function));
    expect(messageBusMock.on).toHaveBeenCalledWith('highlightComponentInTreeFromElement', jasmine.any(Function));
    expect(messageBusMock.on).toHaveBeenCalledWith('removeHighlightFromComponentTree', jasmine.any(Function));
    expect(messageBusMock.on).toHaveBeenCalledWith('componentTreeDirty', jasmine.any(Function));
  });

  describe('refresh', () => {
    it('should emit getLatestComponentExplorerView event on refresh', () => {
      comp.refresh();
      expect(messageBusMock.emit).toHaveBeenCalledTimes(1);
    });

    it('should emit getLatestComponentExplorerView event with null view query', () => {
      comp.refresh();
      const nullViewQuery: ComponentExplorerViewQuery = { selectedElement: null, expandedProperties: null };
      expect(messageBusMock.emit).toHaveBeenCalledWith('getLatestComponentExplorerView', [nullViewQuery]);
    });

    it('should emit getLatestComponentExplorerView event on refresh with view query no properties', () => {
      const currentSelectedElement = jasmine.createSpyObj('currentSelectedElement', ['position', 'children']);
      currentSelectedElement.position = [0];
      currentSelectedElement.children = [];
      comp.currentSelectedElement = currentSelectedElement;
      const propertyTab = {
        propertyTabBody: {
          propertyViews: jasmine.createSpyObj('propertyTab', ['toArray']),
        },
      };
      comp.refresh();
      const viewQuery: ComponentExplorerViewQuery = {
        selectedElement: comp.currentSelectedElement.position,
        expandedProperties: {},
      };
      expect(messageBusMock.emit).toHaveBeenCalledWith('getLatestComponentExplorerView', [viewQuery]);
    });
  });

  describe('node selection event', () => {
    let nodeMock: SpyObj<IndexedNode>;

    beforeEach(() => {
      nodeMock = jasmine.createSpyObj('node', ['position', 'children']);
    });

    it('sets current selected element', () => {
      comp.handleNodeSelection(nodeMock);
      expect(comp.currentSelectedElement).toBe(nodeMock);
    });

    it('fires node selection events', () => {
      nodeMock.position = [0];
      comp.handleNodeSelection(nodeMock);
      expect(messageBusMock.emit).toHaveBeenCalledTimes(2);
      expect(messageBusMock.emit).toHaveBeenCalledWith('getElementDirectivesProperties', [nodeMock.position]);
      expect(messageBusMock.emit).toHaveBeenCalledWith('setSelectedComponent', [nodeMock.position]);
    });
  });
});
