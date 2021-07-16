import {TestBed, ComponentFixture} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatButtonHarness} from '@angular/material/button/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {MatButtonModule} from '@angular/material/button';
import {ButtonHarnessExample} from './button-harness-example';

describe('ButtonHarnessExample', () => {
  let fixture: ComponentFixture<ButtonHarnessExample>;
  let loader: HarnessLoader;
  let buttonHarness = MatButtonHarness;

  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
      teardown: {destroyAfterEach: true}
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatButtonModule],
      declarations: [ButtonHarnessExample]
    }).compileComponents();
    fixture = TestBed.createComponent(ButtonHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all button harnesses', async () => {
      const buttons = await loader.getAllHarnesses(MatButtonHarness);
      expect(buttons.length).toBe(1);
    }
  );

  it('should load button with exact text', async () => {
    const buttons = await loader.getAllHarnesses(buttonHarness.with({text: 'Basic button'}));
    expect(buttons.length).toBe(1);
    expect(await buttons[0].getText()).toBe('Basic button');
  });

  it('should click a button', async () => {
    const button = await loader.getHarness(buttonHarness.with({text: 'Basic button'}));
    await button.click();
    expect(fixture.componentInstance.clicked).toBe(true);
  });
});
