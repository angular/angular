import { DevToolsTabsComponent } from './devtools-tabs.component';
import { ApplicationEnvironment } from 'ng-devtools';
import { Events, MessageBus } from 'protocol';

describe('DevtoolsTabsComponent', () => {
  let messageBusMock: MessageBus<Events>;
  let applicationEnvironmentMock: ApplicationEnvironment;
  let comp: DevToolsTabsComponent;

  beforeEach(() => {
    messageBusMock = jasmine.createSpyObj('messageBus', ['on', 'once', 'emit', 'destroy']);
    applicationEnvironmentMock = jasmine.createSpyObj('applicationEnvironment', ['environment']);

    comp = new DevToolsTabsComponent(messageBusMock, applicationEnvironmentMock);
  });

  it('should create instance from class', () => {
    expect(comp).toBeTruthy();
  });

  it('toggles inspector flag', () => {
    expect(comp.inspectorRunning).toBe(false);
    comp.toggleInspectorState();
    expect(comp.inspectorRunning).toBe(true);
    comp.toggleInspectorState();
    expect(comp.inspectorRunning).toBe(false);
  });

  it('emits inspector event', () => {
    comp.tabGroup = jasmine.createSpyObj('tabGroup', ['selectedIndex']);
    comp.toggleInspector();
    expect(messageBusMock.emit).toHaveBeenCalledTimes(1);
    expect(messageBusMock.emit).toHaveBeenCalledWith('inspectorStart');
    comp.toggleInspector();
    expect(messageBusMock.emit).toHaveBeenCalledTimes(2);
    expect(messageBusMock.emit).toHaveBeenCalledWith('inspectorEnd');
  });

  it('calls child refresh method', () => {
    comp.directiveExplorer = jasmine.createSpyObj('directiveExplorer', ['refresh']);
    comp.refresh();
    expect(comp.directiveExplorer.refresh).toHaveBeenCalledTimes(1);
  });
});
