import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatAutocompleteHarness} from '@angular/material/autocomplete/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

/**
 * Function that can be used to run the shared autocomplete harness tests for either the non-MDC or
 * MDC based autocomplete harness.
 */
export function runHarnessTests(
  autocompleteModule: typeof MatAutocompleteModule,
  autocompleteHarness: typeof MatAutocompleteHarness,
) {
  let fixture: ComponentFixture<AutocompleteHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, autocompleteModule],
      declarations: [AutocompleteHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(AutocompleteHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all autocomplete harnesses', async () => {
    const inputs = await loader.getAllHarnesses(autocompleteHarness);
    expect(inputs.length).toBe(5);
  });

  it('should load harness for autocomplete with value', async () => {
    const ac = await loader.getHarness(autocompleteHarness.with({value: /Prefilled/}));
    const id = await (await ac.host()).getAttribute('id');
    expect(id).toBe('prefilled');
  });

  it('should be able to get value of the input', async () => {
    const input = await loader.getHarness(autocompleteHarness.with({selector: '#prefilled'}));
    expect(await input.getValue()).toBe('Prefilled value');
  });

  it('should get disabled state', async () => {
    const enabled = await loader.getHarness(autocompleteHarness.with({selector: '#plain'}));
    const disabled = await loader.getHarness(autocompleteHarness.with({selector: '#disabled'}));

    expect(await enabled.isDisabled()).toBe(false);
    expect(await disabled.isDisabled()).toBe(true);
  });

  it('should focus and blur an input', async () => {
    const input = await loader.getHarness(autocompleteHarness.with({selector: '#plain'}));
    expect(await input.isFocused()).toBe(false);
    await input.focus();
    expect(await input.isFocused()).toBe(true);
    await input.blur();
    expect(await input.isFocused()).toBe(false);
  });

  it('should be able to type in an input', async () => {
    const input = await loader.getHarness(autocompleteHarness.with({selector: '#plain'}));
    await input.enterText('Hello there');
    expect(await input.getValue()).toBe('Hello there');
  });

  it('should be able to get the autocomplete panel options', async () => {
    const input = await loader.getHarness(autocompleteHarness.with({selector: '#plain'}));
    await input.focus();
    const options = await input.getOptions();

    expect(options.length).toBe(11);
    expect(await options[5].getText()).toBe('New York');
  });

  it('should be able to get filtered options', async () => {
    const input = await loader.getHarness(autocompleteHarness.with({selector: '#plain'}));
    await input.focus();
    const options = await input.getOptions({text: /New/});

    expect(options.length).toBe(1);
    expect(await options[0].getText()).toBe('New York');
  });

  it('should be able to get the autocomplete panel groups', async () => {
    const input = await loader.getHarness(autocompleteHarness.with({selector: '#grouped'}));
    await input.focus();
    const groups = await input.getOptionGroups();
    const options = await input.getOptions();

    expect(groups.length).toBe(3);
    expect(options.length).toBe(14);
  });

  it('should be able to get the autocomplete panel groups', async () => {
    const input = await loader.getHarness(autocompleteHarness.with({selector: '#plain'}));
    await input.focus();

    const input2 = await loader.getHarness(autocompleteHarness.with({selector: '#grouped'}));
    await input2.focus();

    const options = await input.getOptions();
    const options2 = await input2.getOptions();

    expect(options.length).toBe(11);
    expect(options2.length).toBe(14);
  });

  it('should be able to get filtered panel groups', async () => {
    const input = await loader.getHarness(autocompleteHarness.with({selector: '#grouped'}));
    await input.focus();
    const groups = await input.getOptionGroups({labelText: 'Two'});

    expect(groups.length).toBe(1);
    expect(await groups[0].getLabelText()).toBe('Two');
  });

  it('should be able to get whether the autocomplete is open', async () => {
    const input = await loader.getHarness(autocompleteHarness.with({selector: '#plain'}));

    expect(await input.isOpen()).toBe(false);
    await input.focus();
    expect(await input.isOpen()).toBe(true);
  });

  it('should be able to select option', async () => {
    const input = await loader.getHarness(autocompleteHarness.with({selector: '#plain'}));
    await input.selectOption({text: 'New York'});
    expect(await input.getValue()).toBe('NY');
  });

  it('should throw when selecting an option that is not available', async () => {
    const input = await loader.getHarness(autocompleteHarness.with({selector: '#plain'}));
    await input.enterText('New');
    await expectAsync(input.selectOption({text: 'Texas'})).toBeRejectedWithError(
      /Could not find a mat-option matching {"text":"Texas"}/,
    );
  });
}

@Component({
  template: `
    <mat-autocomplete #autocomplete="matAutocomplete">
      <mat-option *ngFor="let state of states" [value]="state.code">{{ state.name }}</mat-option>
    </mat-autocomplete>

    <mat-autocomplete #groupedAutocomplete="matAutocomplete">
      <mat-optgroup *ngFor="let group of stateGroups" [label]="group.name">
        <mat-option
          *ngFor="let state of group.states"
          [value]="state.code">{{ state.name }}</mat-option>
      </mat-optgroup>
    </mat-autocomplete>

    <input id="plain" [matAutocomplete]="autocomplete">
    <input id="disabled" disabled [matAutocomplete]="autocomplete">
    <textarea id="textarea" [matAutocomplete]="autocomplete"></textarea>
    <input id="prefilled" [matAutocomplete]="autocomplete" value="Prefilled value">
    <input id="grouped" [matAutocomplete]="groupedAutocomplete">
  `,
})
class AutocompleteHarnessTest {
  states = [
    {code: 'AL', name: 'Alabama'},
    {code: 'CA', name: 'California'},
    {code: 'FL', name: 'Florida'},
    {code: 'KS', name: 'Kansas'},
    {code: 'MA', name: 'Massachusetts'},
    {code: 'NY', name: 'New York'},
    {code: 'OR', name: 'Oregon'},
    {code: 'PA', name: 'Pennsylvania'},
    {code: 'TN', name: 'Tennessee'},
    {code: 'VA', name: 'Virginia'},
    {code: 'WY', name: 'Wyoming'},
  ];

  stateGroups = [
    {
      name: 'One',
      states: [
        {code: 'IA', name: 'Iowa'},
        {code: 'KS', name: 'Kansas'},
        {code: 'KY', name: 'Kentucky'},
        {code: 'LA', name: 'Louisiana'},
        {code: 'ME', name: 'Maine'},
      ],
    },
    {
      name: 'Two',
      states: [
        {code: 'RI', name: 'Rhode Island'},
        {code: 'SC', name: 'South Carolina'},
        {code: 'SD', name: 'South Dakota'},
        {code: 'TN', name: 'Tennessee'},
        {code: 'TX', name: 'Texas'},
      ],
    },
    {
      name: 'Three',
      states: [
        {code: 'UT', name: 'Utah'},
        {code: 'WA', name: 'Washington'},
        {code: 'WV', name: 'West Virginia'},
        {code: 'WI', name: 'Wisconsin'},
      ],
    },
  ];
}
