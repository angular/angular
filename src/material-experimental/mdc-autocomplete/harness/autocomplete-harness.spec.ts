import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component, Type} from '@angular/core';
import {ComponentFixture, TestBed, inject} from '@angular/core/testing';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {OverlayContainer} from '@angular/cdk/overlay';
import {MatAutocompleteModule as MatMdcAutocompleteModule} from '../index';
import {MatAutocompleteHarness} from './autocomplete-harness';
import {MatAutocompleteHarness as MatMdcAutocompleteHarness} from './mdc-autocomplete-harness';

let fixture: ComponentFixture<AutocompleteHarnessTest>;
let loader: HarnessLoader;
let harness: typeof MatAutocompleteHarness;
let overlayContainer: OverlayContainer;

describe('MatAutocompleteHarness', () => {
  describe('non-MDC-based', () => {
    beforeEach(async () => {
      await prepareTests(MatAutocompleteModule, AutocompleteHarnessTest);
      harness = MatAutocompleteHarness;
    });

    runTests();
  });

  describe('MDC-based', () => {
    beforeEach(async () => {
      await prepareTests(MatMdcAutocompleteModule, AutocompleteHarnessTest);
      // Public APIs are the same as MatAutocompleteHarness, but cast
      // is necessary because of different private fields.
      harness = MatMdcAutocompleteHarness as any;
    });

    // TODO: enable after MDC autocomplete is implemented
    // runTests();
  });
});

/** Shared test setup logic. */
async function prepareTests(moduleType: Type<any>, fixtureType: Type<any>) {
  await TestBed.configureTestingModule({
    imports: [moduleType],
    declarations: [fixtureType],
  }).compileComponents();

  fixture = TestBed.createComponent(fixtureType);
  fixture.detectChanges();
  loader = TestbedHarnessEnvironment.loader(fixture);
  inject([OverlayContainer], (oc: OverlayContainer) => {
    overlayContainer = oc;
  })();
}

/** Shared tests to run on both the original and MDC-based autocomplete. */
function runTests() {
  afterEach(() => {
    // Angular won't call this for us so we need to do it ourselves to avoid leaks.
    overlayContainer.ngOnDestroy();
    overlayContainer = null!;
  });

  it('should load all autocomplete harnesses', async () => {
    const inputs = await loader.getAllHarnesses(harness);
    expect(inputs.length).toBe(5);
  });

  it('should be able to get text inside the input', async () => {
    const input = await loader.getHarness(harness.with({selector: '#prefilled'}));
    expect(await input.getText()).toBe('Prefilled value');
  });

  it('should get disabled state', async () => {
    const enabled = await loader.getHarness(harness.with({selector: '#plain'}));
    const disabled = await loader.getHarness(harness.with({selector: '#disabled'}));

    expect(await enabled.isDisabled()).toBe(false);
    expect(await disabled.isDisabled()).toBe(true);
  });

  it('should focus and blur an input', async () => {
    const input = await loader.getHarness(harness.with({selector: '#plain'}));
    expect(getActiveElementId()).not.toBe('plain');
    await input.focus();
    expect(getActiveElementId()).toBe('plain');
    await input.blur();
    expect(getActiveElementId()).not.toBe('plain');
  });

  it('should be able to type in an input', async () => {
    const input = await loader.getHarness(harness.with({selector: '#plain'}));
    await input.enterText('Hello there');
    expect(await input.getText()).toBe('Hello there');
  });

  it('should be able to get the autocomplete panel', async () => {
    const input = await loader.getHarness(harness.with({selector: '#plain'}));
    await input.focus();
    expect(await input.getPanel()).toBeTruthy();
  });

  it('should be able to get the autocomplete panel options', async () => {
    const input = await loader.getHarness(harness.with({selector: '#plain'}));
    await input.focus();
    const options = await input.getOptions();

    expect(options.length).toBe(11);
    expect(await options[5].text()).toBe('New York');
  });

  it('should be able to get the autocomplete panel groups', async () => {
    const input = await loader.getHarness(harness.with({selector: '#grouped'}));
    await input.focus();
    const groups = await input.getOptionGroups();
    const options = await input.getOptions();

    expect(groups.length).toBe(3);
    expect(options.length).toBe(11);
  });

  it('should be able to get the autocomplete panel', async () => {
    // Focusing without any options will render the panel, but it'll be invisible.
    fixture.componentInstance.states = [];
    fixture.detectChanges();

    const input = await loader.getHarness(harness.with({selector: '#plain'}));
    await input.focus();
    expect(await input.isPanelVisible()).toBe(false);
  });

  it('should be able to get whether the autocomplete is open', async () => {
    const input = await loader.getHarness(harness.with({selector: '#plain'}));

    expect(await input.isOpen()).toBe(false);
    await input.focus();
    expect(await input.isOpen()).toBe(true);
  });

}

function getActiveElementId() {
  return document.activeElement ? document.activeElement.id : '';
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
  `
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
      states: this.states.slice(0, 3)
    },
    {
      name: 'Two',
      states: this.states.slice(3, 7)
    },
    {
      name: 'Three',
      states: this.states.slice(7)
    }
  ];
}

