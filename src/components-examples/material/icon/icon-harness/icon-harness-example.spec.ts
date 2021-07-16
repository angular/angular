import {TestBed, ComponentFixture} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {IconHarnessExample} from './icon-harness-example';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {MatIconHarness} from '@angular/material/icon/testing';
import {DomSanitizer} from '@angular/platform-browser';


describe('IconHarnessExample', () => {
  let fixture: ComponentFixture<IconHarnessExample>;
  let loader: HarnessLoader;

  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
      teardown: {destroyAfterEach: true}
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatIconModule],
      declarations: [IconHarnessExample]
    }).compileComponents();
    const registry = TestBed.inject(MatIconRegistry);
    const sanitizer = TestBed.inject(DomSanitizer);

    // We use `bypassSecurityTrustHtml` exclusively for testing here.
    registry.addSvgIconLiteralInNamespace('svgIcons', 'svgIcon',
      sanitizer.bypassSecurityTrustHtml('<svg></svg>'));

    fixture = TestBed.createComponent(IconHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all icon harnesses', async () => {
    const icons = await loader.getAllHarnesses(MatIconHarness);
    expect(icons.length).toBe(3);
  });

  it('should get the name of an icon', async () => {
    const icons = await loader.getAllHarnesses(MatIconHarness);
    const names = await parallel(() => icons.map(icon => icon.getName()));
    expect(names).toEqual(['fontIcon', 'svgIcon', 'ligature_icon']);
  });

  it('should get the namespace of an icon', async () => {
    const icons = await loader.getAllHarnesses(MatIconHarness);
    const namespaces = await parallel(() => icons.map(icon => icon.getNamespace()));
    expect(namespaces).toEqual(['fontIcons', 'svgIcons', null]);
  });

  it('should get whether an icon is inline', async () => {
    const icons = await loader.getAllHarnesses(MatIconHarness);
    const inlineStates = await parallel(() => icons.map(icon => icon.isInline()));
    expect(inlineStates).toEqual([false, false, true]);
  });
});
