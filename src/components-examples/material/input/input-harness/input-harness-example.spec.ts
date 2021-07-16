import {TestBed, ComponentFixture} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatInputHarness} from '@angular/material/input/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {MatInputModule} from '@angular/material/input';
import {InputHarnessExample} from './input-harness-example';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from '@angular/forms';

describe('InputHarnessExample', () => {
  let fixture: ComponentFixture<InputHarnessExample>;
  let loader: HarnessLoader;

  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
      teardown: {destroyAfterEach: true}
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatInputModule, NoopAnimationsModule, ReactiveFormsModule],
      declarations: [InputHarnessExample]
    }).compileComponents();
    fixture = TestBed.createComponent(InputHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all input harnesses', async () => {
    const inputs = await loader.getAllHarnesses(MatInputHarness);
    expect(inputs.length).toBe(3);
  });

  it('should load input with a specific value', async () => {
    const inputs = await loader.getAllHarnesses(MatInputHarness.with({value: 'Sushi'}));
    expect(inputs.length).toBe(1);
  });

  it('should be able to set value of input', async () => {
    const inputs = await loader.getAllHarnesses(MatInputHarness);
    const input = inputs[0];
    expect(await input.getValue()).toBe('Sushi');

    await input.setValue('');

    expect(await input.getValue()).toBe('');
  });

  it('should be able to get disabled state', async () => {
    const inputs = await loader.getAllHarnesses(MatInputHarness);
    expect(inputs.length).toBe(3);

    expect(await inputs[0].isDisabled()).toBe(false);
    expect(await inputs[1].isDisabled()).toBe(false);
    expect(await inputs[2].isDisabled()).toBe(false);

    fixture.componentInstance.disabled = true;

    expect(await inputs[1].isDisabled()).toBe(true);
  });

  it('should be able to get type of input', async () => {
    const inputs = await loader.getAllHarnesses(MatInputHarness);
    expect(inputs.length).toBe(3);

    expect(await inputs[0].getType()).toBe('text');
    expect(await inputs[1].getType()).toBe('number');
    expect(await inputs[2].getType()).toBe('textarea');

    fixture.componentInstance.inputType = 'text';

    expect(await inputs[1].getType()).toBe('text');
  });
});
