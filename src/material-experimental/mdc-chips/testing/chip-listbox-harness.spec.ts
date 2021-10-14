import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatChipsModule} from '../index';
import {MatChipListboxHarness} from './chip-listbox-harness';

describe('MatChipListboxHarness', () => {
  let fixture: ComponentFixture<ChipListboxHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatChipsModule],
      declarations: [ChipListboxHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(ChipListboxHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should get correct number of listbox harnesses', async () => {
    const harnesses = await loader.getAllHarnesses(MatChipListboxHarness);
    expect(harnesses.length).toBe(1);
  });

  it('should get the number of options', async () => {
    const harness = await loader.getHarness(MatChipListboxHarness);
    expect((await harness.getChips()).length).toBe(4);
  });

  it('should get whether the listbox is in multi-selection mode', async () => {
    const harness = await loader.getHarness(MatChipListboxHarness);
    expect(await harness.isMultiple()).toBe(false);

    fixture.componentInstance.isMultiple = true;
    expect(await harness.isMultiple()).toBe(true);
  });

  it('should get whether the listbox is disabled', async () => {
    const harness = await loader.getHarness(MatChipListboxHarness);
    expect(await harness.isDisabled()).toBe(false);

    fixture.componentInstance.disabled = true;
    expect(await harness.isDisabled()).toBe(true);
  });

  it('should get whether the listbox is required', async () => {
    const harness = await loader.getHarness(MatChipListboxHarness);
    expect(await harness.isRequired()).toBe(false);

    fixture.componentInstance.required = true;
    expect(await harness.isRequired()).toBe(true);
  });

  it('should get selection when no options are selected', async () => {
    const harness = await loader.getHarness(MatChipListboxHarness);
    const selectedOptions = await harness.getChips({selected: true});
    expect(selectedOptions.length).toBe(0);
  });

  it('should get selection in single-selection mode', async () => {
    fixture.componentInstance.options[0].selected = true;
    fixture.detectChanges();

    const harness = await loader.getHarness(MatChipListboxHarness);
    const selectedOptions = await harness.getChips({selected: true});
    expect(selectedOptions.length).toBe(1);
    expect(await selectedOptions[0].getText()).toContain('Blue');
  });

  it('should get selection in multi-selection mode', async () => {
    fixture.componentInstance.isMultiple = true;
    fixture.componentInstance.options[0].selected = true;
    fixture.componentInstance.options[1].selected = true;
    fixture.detectChanges();

    const harness = await loader.getHarness(MatChipListboxHarness);
    const selectedOptions = await harness.getChips({selected: true});
    expect(selectedOptions.length).toBe(2);
    expect(await selectedOptions[0].getText()).toContain('Blue');
    expect(await selectedOptions[1].getText()).toContain('Green');
  });

  it('should be able to select specific options', async () => {
    fixture.componentInstance.isMultiple = true;
    fixture.detectChanges();

    const harness = await loader.getHarness(MatChipListboxHarness);
    expect(await harness.getChips({selected: true})).toEqual([]);

    await harness.selectChips({text: /Blue|Yellow/});
    const selectedOptions = await harness.getChips({selected: true});
    const selectedText = await parallel(() => selectedOptions.map(option => option.getText()));

    expect(selectedText).toEqual(['Blue', 'Yellow']);
  });
});

@Component({
  template: `
    <mat-chip-listbox [multiple]="isMultiple" [disabled]="disabled" [required]="required">
      <mat-chip-option *ngFor="let option of options" [selected]="option.selected">
        {{option.text}}
      </mat-chip-option>
    </mat-chip-listbox>
  `,
})
class ChipListboxHarnessTest {
  isMultiple = false;
  disabled = false;
  required = false;
  options = [
    {text: 'Blue', selected: false},
    {text: 'Green', selected: false},
    {text: 'Red', selected: false},
    {text: 'Yellow', selected: false},
  ];
}
