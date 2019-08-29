import {HarnessLoader} from '@angular/cdk-experimental/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk-experimental/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatChipsModule} from '../index';
import {MatChipListboxHarness} from './chip-listbox-harness';

let fixture: ComponentFixture<ChipListboxHarnessTest>;
let loader: HarnessLoader;

describe('MatChipListboxHarness', () => {
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
    const harnesses = await loader.getAllHarnesses(MatChipListboxHarness);
    expect ((await harnesses[0].getOptions()).length).toBe(4);
  });

  describe('should get selection', async () => {
    it('with no selected options', async () => {
      const harnesses = await loader.getAllHarnesses(MatChipListboxHarness);
      const selectedOption = await harnesses[0].getSelected();
      expect(await selectedOption.length).toBe(0);
    });

    it('with a single selected option', async () => {
      fixture.componentInstance.options[0].selected = true;
      fixture.detectChanges();

      const harnesses = await loader.getAllHarnesses(MatChipListboxHarness);
      const selectedOption = await harnesses[0].getSelected();
      expect(await selectedOption.length).toBe(1);
      expect(await selectedOption[0].getText()).toContain('Blue');
    });

    it('with multiple selected options', async () => {
      fixture.componentInstance.enableMultipleSelection = true;
      fixture.componentInstance.options[0].selected = true;
      fixture.componentInstance.options[1].selected = true;
      fixture.detectChanges();

      const harnesses = (await loader.getAllHarnesses(MatChipListboxHarness));
      const selectedOption = await harnesses[0].getSelected();
      expect(await selectedOption.length).toBe(2);
      expect(await selectedOption[0].getText()).toContain('Blue');
      expect(await selectedOption[1].getText()).toContain('Green');
    });
  });
});

interface ExampleOption {
  selected: boolean;
  text: string;
}

@Component({
  template: `
    <mat-chip-listbox [multiple]="enableMultipleSelection">
      <mat-chip-option *ngFor="let option of options" [selected]="option.selected">
        {{option.text}}
      </mat-chip-option>
    </mat-chip-listbox>
  `
})
class ChipListboxHarnessTest {
  enableMultipleSelection = false;
  options: ExampleOption[] = [
    {text: 'Blue', selected: false},
    {text: 'Green', selected: false},
    {text: 'Red', selected: false},
    {text: 'Yellow', selected: false},
  ];
}

