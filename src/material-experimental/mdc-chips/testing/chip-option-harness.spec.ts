import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatChipsModule} from '../index';
import {MatChipOptionHarness} from './chip-option-harness';

let fixture: ComponentFixture<ChipOptionHarnessTest>;
let loader: HarnessLoader;

describe('MatChipOptionHarness', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatChipsModule],
      declarations: [ChipOptionHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(ChipOptionHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should get correct number of chip harnesses', async () => {
    const harnesses = await loader.getAllHarnesses(MatChipOptionHarness);
    expect(harnesses.length).toBe(4);
  });

  it('should get whether the chip is selected', async () => {
    const harnesses = await loader.getAllHarnesses(MatChipOptionHarness);
    expect(await harnesses[0].isSelected()).toBe(false);
    expect(await harnesses[1].isSelected()).toBe(false);
    expect(await harnesses[2].isSelected()).toBe(true);
  });

  it('should get the disabled state', async () => {
    const harnesses = await loader.getAllHarnesses(MatChipOptionHarness);
    expect(await harnesses[0].isDisabled()).toBe(false);
    expect(await harnesses[3].isDisabled()).toBe(true);
  });

  it('should get the chip text content', async () => {
    const harnesses = await loader.getAllHarnesses(MatChipOptionHarness);
    expect(await harnesses[0].getText()).toBe('Basic Chip Option');
    expect(await harnesses[1].getText()).toBe('Chip Option');
    expect(await harnesses[2].getText()).toBe('Selected Chip Option');
    expect(await harnesses[3].getText()).toBe('Chip Option');
  });
});

@Component({
  template: `
    <mat-chip-listbox>
      <mat-basic-chip-option> Basic Chip Option </mat-basic-chip-option>
      <mat-chip-option> <mat-chip-avatar>C</mat-chip-avatar>Chip Option </mat-chip-option>
      <mat-chip-option selected>
        Selected Chip Option
        <span matChipTrailingIcon>trailing_icon</span>
      </mat-chip-option>
      <mat-chip-option disabled>
        Chip Option
        <span matChipRemove>remove_icon</span>
      </mat-chip-option>
    </mat-chip-listbox>
  `
})
class ChipOptionHarnessTest {}

