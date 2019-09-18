import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatChipsModule} from '../index';
import {MatChipSetHarness} from './chip-set-harness';

let fixture: ComponentFixture<ChipSetHarnessTest>;
let loader: HarnessLoader;

describe('MatChipSetHarness', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatChipsModule],
      declarations: [ChipSetHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(ChipSetHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should get correct number of set harnesses', async () => {
    const harnesses = await loader.getAllHarnesses(MatChipSetHarness);
    expect(harnesses.length).toBe(1);
  });

  it('should get correct number of chips', async () => {
    const harnesses = await loader.getAllHarnesses(MatChipSetHarness);
    const chips = await harnesses[0].getChips();
    expect(chips.length).toBe(3);
  });
});

@Component({
  template: `
    <mat-chip-set>
      <mat-chip> Chip A </mat-chip>
      <mat-chip> Chip B </mat-chip>
      <mat-chip> Chip C </mat-chip>
    </mat-chip-set>
  `
})
class ChipSetHarnessTest {}

