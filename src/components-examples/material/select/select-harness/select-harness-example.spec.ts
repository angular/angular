import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatLegacySelectHarness} from '@angular/material/legacy-select/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {MatLegacySelectModule} from '@angular/material/legacy-select';
import {SelectHarnessExample} from './select-harness-example';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('SelectHarnessExample', () => {
  let fixture: ComponentFixture<SelectHarnessExample>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatLegacySelectModule, NoopAnimationsModule],
      declarations: [SelectHarnessExample],
    }).compileComponents();
    fixture = TestBed.createComponent(SelectHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all select harnesses', async () => {
    const selects = await loader.getAllHarnesses(MatLegacySelectHarness);
    expect(selects.length).toBe(1);
  });

  it('should be able to check whether a select is in multi-selection mode', async () => {
    const select = await loader.getHarness(MatLegacySelectHarness);

    expect(await select.isMultiple()).toBe(false);
  });

  it('should be able to open and close a select', async () => {
    const select = await loader.getHarness(MatLegacySelectHarness);

    expect(await select.isOpen()).toBe(false);

    await select.open();
    expect(await select.isOpen()).toBe(true);

    await select.close();
    expect(await select.isOpen()).toBe(false);
  });

  it('should be able to get the value text from a select', async () => {
    const select = await loader.getHarness(MatLegacySelectHarness);
    await select.open();
    const options = await select.getOptions();

    await options[2].click();

    expect(await select.getValueText()).toBe('Tacos');
  });
});
