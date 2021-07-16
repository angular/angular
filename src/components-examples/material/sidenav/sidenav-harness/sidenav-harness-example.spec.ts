import {TestBed, ComponentFixture} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {
  MatDrawerHarness,
  MatDrawerContainerHarness,
  MatDrawerContentHarness} from '@angular/material/sidenav/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {MatSidenavModule} from '@angular/material/sidenav';
import {SidenavHarnessExample} from './sidenav-harness-example';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('SidenavHarnessExample', () => {
  let fixture: ComponentFixture<SidenavHarnessExample>;
  let loader: HarnessLoader;

  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
      teardown: {destroyAfterEach: true}
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatSidenavModule, NoopAnimationsModule],
      declarations: [SidenavHarnessExample]
    }).compileComponents();

    fixture = TestBed.createComponent(SidenavHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all drawer harnesses', async () => {
    const drawers = await loader.getAllHarnesses(MatDrawerHarness);
    expect(drawers.length).toBe(1);
  });

  it('should be able to get the mode of a drawer', async () => {
    const drawer = await loader.getHarness(MatDrawerHarness);

    expect(await drawer.getMode()).toBe('side');
  });

  it('should get the drawers within a container', async () => {
    const container = await loader.getHarness(MatDrawerContainerHarness);
    const drawer = await container.getDrawers();

    expect(await (await drawer[0].host()).text()).toBe('Hello from the drawer');
  });

  it('should get the content of a container', async () => {
    const container = await loader.getHarness(MatDrawerContainerHarness);
    const content = await container.getContent();
    expect(await (await content.host()).text()).toBe('Hello from the content');
  });

  it('should load all drawer content harnesses', async () => {
    const contentElements = await loader.getAllHarnesses(MatDrawerContentHarness);
    expect(contentElements.length).toBe(1);
  });
});
