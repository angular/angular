import {TestBed, ComponentFixture} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatToolbarHarness} from '@angular/material/toolbar/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {MatToolbarModule} from '@angular/material/toolbar';
import {ToolbarHarnessExample} from './toolbar-harness-example';
import {MatIconModule} from '@angular/material/icon';

describe('ToolbarHarnessExample', () => {
  let fixture: ComponentFixture<ToolbarHarnessExample>;
  let loader: HarnessLoader;

  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
      teardown: {destroyAfterEach: true}
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatToolbarModule, MatIconModule],
      declarations: [ToolbarHarnessExample]
    }).compileComponents();
    fixture = TestBed.createComponent(ToolbarHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should find all toolbars', async () => {
    const toolbars = await loader.getAllHarnesses(MatToolbarHarness);

    expect(toolbars.length).toBe(2);
  });

  it('should find toolbar with text', async () => {
    const toolbars = await loader.getAllHarnesses(MatToolbarHarness.with({text: 'My App'}));

    expect(toolbars.length).toBe(1);
    expect(await toolbars[0].hasMultipleRows()).toBeFalse();
  });

  it('should find toolbar with regex', async () => {
    const toolbars = await loader.getAllHarnesses(MatToolbarHarness.with({text: /Row/}));

    expect(toolbars.length).toBe(1);
    expect(await toolbars[0].hasMultipleRows()).toBeTrue();
  });

  it('should get toolbar text', async () => {
    const toolbars = await loader.getAllHarnesses(MatToolbarHarness);

    expect(await toolbars[0].getRowsAsText()).toEqual(['My App']);
    expect(await toolbars[1].getRowsAsText()).toEqual([
      'Row 1',
      'Row 2 Button 1  Button 2'
    ]);
  });
});
