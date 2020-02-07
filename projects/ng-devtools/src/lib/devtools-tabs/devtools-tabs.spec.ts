import { DevToolsTabsComponent } from './devtools-tabs.component';
import { DevToolsTabModule } from './devtools-tabs.module';
import { TestBed, async } from '@angular/core/testing';

describe('DevtoolsTabsComponent', () => {
  let messageBusMock;
  let comp: DevToolsTabsComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DevToolsTabsComponent],
      imports: [DevToolsTabModule],
    }).compileComponents();
    comp = TestBed.createComponent(DevToolsTabsComponent).componentInstance;
    messageBusMock = jasmine.createSpyObj('messageBus', ['on', 'once', 'emit', 'destroy']);
  }));

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
    comp.messageBus = messageBusMock;
    comp.toggleInspector();
    expect(comp.messageBus.emit).toHaveBeenCalledTimes(1);
    expect(comp.messageBus.emit).toHaveBeenCalledWith('inspectorStart');
    comp.toggleInspector();
    expect(comp.messageBus.emit).toHaveBeenCalledTimes(2);
    expect(comp.messageBus.emit).toHaveBeenCalledWith('inspectorEnd');
  });

  it('calls child refresh method', () => {
    comp.directiveExplorer = jasmine.createSpyObj('directiveExplorer', ['refresh']);
    comp.refresh();
    expect(comp.directiveExplorer.refresh).toHaveBeenCalledTimes(1);
  });
});
