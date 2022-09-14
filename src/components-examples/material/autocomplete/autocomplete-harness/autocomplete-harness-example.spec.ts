import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatAutocompleteHarness} from '@angular/material/autocomplete/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {AutocompleteHarnessExample} from './autocomplete-harness-example';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('AutocompleteHarnessExample', () => {
  let fixture: ComponentFixture<AutocompleteHarnessExample>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatAutocompleteModule, NoopAnimationsModule],
      declarations: [AutocompleteHarnessExample],
    }).compileComponents();
    fixture = TestBed.createComponent(AutocompleteHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all autocomplete harnesses', async () => {
    const autocompletes = await loader.getAllHarnesses(MatAutocompleteHarness);
    expect(autocompletes.length).toBe(2);
  });

  it('should get disabled state', async () => {
    const enabled = await loader.getHarness(MatAutocompleteHarness.with({selector: '#plain'}));
    const disabled = await loader.getHarness(MatAutocompleteHarness.with({selector: '#disabled'}));

    expect(await enabled.isDisabled()).toBe(false);
    expect(await disabled.isDisabled()).toBe(true);
  });

  it('should focus and blur an input', async () => {
    const input = await loader.getHarness(MatAutocompleteHarness.with({selector: '#plain'}));
    expect(await input.isFocused()).toBe(false);
    await input.focus();
    expect(await input.isFocused()).toBe(true);
    await input.blur();
    expect(await input.isFocused()).toBe(false);
  });

  it('should be able to type in an input', async () => {
    const input = await loader.getHarness(MatAutocompleteHarness.with({selector: '#plain'}));
    await input.enterText('Hello there');
    expect(await input.getValue()).toBe('Hello there');
  });

  it('should be able to get filtered options', async () => {
    const input = await loader.getHarness(MatAutocompleteHarness.with({selector: '#plain'}));
    await input.focus();
    const options = await input.getOptions({text: /New/});

    expect(options.length).toBe(1);
    expect(await options[0].getText()).toBe('New York');
  });
});
