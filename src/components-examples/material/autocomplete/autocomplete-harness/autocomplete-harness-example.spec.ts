import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatLegacyAutocompleteHarness} from '@angular/material/legacy-autocomplete/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {MatLegacyAutocompleteModule} from '@angular/material/legacy-autocomplete';
import {AutocompleteHarnessExample} from './autocomplete-harness-example';

describe('AutocompleteHarnessExample', () => {
  let fixture: ComponentFixture<AutocompleteHarnessExample>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatLegacyAutocompleteModule],
      declarations: [AutocompleteHarnessExample],
    }).compileComponents();
    fixture = TestBed.createComponent(AutocompleteHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all autocomplete harnesses', async () => {
    const autocompletes = await loader.getAllHarnesses(MatLegacyAutocompleteHarness);
    expect(autocompletes.length).toBe(2);
  });

  it('should get disabled state', async () => {
    const enabled = await loader.getHarness(
      MatLegacyAutocompleteHarness.with({selector: '#plain'}),
    );
    const disabled = await loader.getHarness(
      MatLegacyAutocompleteHarness.with({selector: '#disabled'}),
    );

    expect(await enabled.isDisabled()).toBe(false);
    expect(await disabled.isDisabled()).toBe(true);
  });

  it('should focus and blur an input', async () => {
    const input = await loader.getHarness(MatLegacyAutocompleteHarness.with({selector: '#plain'}));
    expect(await input.isFocused()).toBe(false);
    await input.focus();
    expect(await input.isFocused()).toBe(true);
    await input.blur();
    expect(await input.isFocused()).toBe(false);
  });

  it('should be able to type in an input', async () => {
    const input = await loader.getHarness(MatLegacyAutocompleteHarness.with({selector: '#plain'}));
    await input.enterText('Hello there');
    expect(await input.getValue()).toBe('Hello there');
  });

  it('should be able to get filtered options', async () => {
    const input = await loader.getHarness(MatLegacyAutocompleteHarness.with({selector: '#plain'}));
    await input.focus();
    const options = await input.getOptions({text: /New/});

    expect(options.length).toBe(1);
    expect(await options[0].getText()).toBe('New York');
  });
});
