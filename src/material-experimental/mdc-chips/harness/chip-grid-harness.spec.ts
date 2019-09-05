import {HarnessLoader} from '@angular/cdk-experimental/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk-experimental/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatChipsModule} from '../index';
import {MatChipGridHarness} from './chip-grid-harness';

let fixture: ComponentFixture<ChipGridHarnessTest>;
let loader: HarnessLoader;

describe('MatChipGridHarness', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatChipsModule],
      declarations: [ChipGridHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(ChipGridHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should get correct number of grid harnesses', async () => {
    const harnesses = await loader.getAllHarnesses(MatChipGridHarness);
    expect(harnesses.length).toBe(1);
  });

  it('should get correct number of rows', async () => {
    const harnesses = await loader.getAllHarnesses(MatChipGridHarness);
    const rows = await harnesses[0].getRows();
    expect(rows.length).toBe(3);
  });

  it('should get the chip input harness', async () => {
    const harnesses = await loader.getAllHarnesses(MatChipGridHarness);
    const input = await harnesses[0].getTextInput();
    expect(input).not.toBe(null);
  });
});

@Component({
  template: `
    <mat-chip-grid #grid>
      <mat-chip-row> Chip A </mat-chip-row>
      <mat-chip-row> Chip B </mat-chip-row>
      <mat-chip-row> Chip C </mat-chip-row>
      <input [matChipInputFor]="grid" />
    </mat-chip-grid>
  `
})
class ChipGridHarnessTest {}

