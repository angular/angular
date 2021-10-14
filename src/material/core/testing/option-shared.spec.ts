import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component, ViewChildren, QueryList} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {
  MatOption,
  MatOptionModule,
  MAT_OPTION_PARENT_COMPONENT,
  MatOptionParentComponent,
} from '@angular/material/core';
import {MatOptionHarness} from './option-harness';

/** Shared tests to run on both the original and MDC-based options. */
export function runHarnessTests(
  optionModule: typeof MatOptionModule,
  optionHarness: typeof MatOptionHarness,
  optionComponent: typeof MatOption,
) {
  let fixture: ComponentFixture<OptionHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [optionModule],
      declarations: [OptionHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(OptionHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all option harnesses', async () => {
    const options = await loader.getAllHarnesses(optionHarness);
    expect(options.length).toBe(2);
  });

  it('should filter options by text', async () => {
    const options = await loader.getAllHarnesses(optionHarness.with({text: 'Disabled option'}));
    expect(options.length).toBe(1);
  });

  it('should filter options text by a pattern', async () => {
    const options = await loader.getAllHarnesses(optionHarness.with({text: /option/}));
    expect(options.length).toBe(2);
  });

  it('should filter options text by its selected state', async () => {
    const options = await loader.getAllHarnesses(optionHarness);
    let selectedOptions = await loader.getAllHarnesses(optionHarness.with({isSelected: true}));

    expect(options.length).toBe(2);
    expect(selectedOptions.length).toBe(0);

    await options[0].click();

    selectedOptions = await loader.getAllHarnesses(optionHarness.with({isSelected: true}));

    expect(selectedOptions.length).toBe(1);
  });

  it('should get the text of options', async () => {
    const options = await loader.getAllHarnesses(optionHarness);
    const texts = await parallel(() => options.map(option => option.getText()));
    expect(texts).toEqual(['Plain option', 'Disabled option']);
  });

  it('should get whether an option is disabled', async () => {
    const options = await loader.getAllHarnesses(optionHarness);
    const disabledStates = await parallel(() => options.map(option => option.isDisabled()));
    expect(disabledStates).toEqual([false, true]);
  });

  it('should get whether an option is selected', async () => {
    const option = await loader.getHarness(optionHarness);

    expect(await option.isSelected()).toBe(false);

    await option.click();

    expect(await option.isSelected()).toBe(true);
  });

  it('should get whether an option is active', async () => {
    const option = await loader.getHarness(optionHarness);

    expect(await option.isActive()).toBe(false);

    // Set the option as active programmatically since
    // it's usually the parent component that does it.
    fixture.componentInstance.options.first.setActiveStyles();
    fixture.detectChanges();

    expect(await option.isActive()).toBe(true);
  });

  it('should get whether an option is in multi-selection mode', async () => {
    const option = await loader.getHarness(optionHarness);

    expect(await option.isMultiple()).toBe(false);

    // Options take their `multiple` state from the parent component.
    fixture.componentInstance.multiple = true;
    fixture.detectChanges();

    expect(await option.isMultiple()).toBe(true);
  });

  @Component({
    providers: [
      {
        provide: MAT_OPTION_PARENT_COMPONENT,
        useExisting: OptionHarnessTest,
      },
    ],
    template: `
      <mat-option>Plain option</mat-option>
      <mat-option disabled>Disabled option</mat-option>
    `,
  })
  class OptionHarnessTest implements MatOptionParentComponent {
    @ViewChildren(optionComponent) options: QueryList<{setActiveStyles(): void}>;
    multiple = false;
  }
}
