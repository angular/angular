import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatChipsModule} from '../index';
import {MatChipRowHarness} from './chip-row-harness';

let fixture: ComponentFixture<ChipRowHarnessTest>;
let loader: HarnessLoader;

describe('MatChipRowHarness', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatChipsModule],
      declarations: [ChipRowHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(ChipRowHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should get correct number of chip harnesses', async () => {
    const harnesses = await loader.getAllHarnesses(MatChipRowHarness);
    expect(harnesses.length).toBe(2);
  });
});

@Component({
  template: `
    <mat-chip-grid #grid>
      <mat-basic-chip-row> Basic Chip Row </mat-basic-chip-row>
      <mat-chip-row> Chip Row </mat-chip-row>
      <input [matChipInputFor]="grid" />
    </mat-chip-grid>
  `
})
class ChipRowHarnessTest {}

