import {HarnessLoader} from '@angular/cdk-experimental/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk-experimental/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatChipsModule} from '../index';
import {MatChipInputHarness} from './chip-input';

let fixture: ComponentFixture<ChipInputHarnessTest>;
let loader: HarnessLoader;

describe('MatChipInputHarness', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatChipsModule],
      declarations: [ChipInputHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(ChipInputHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should get correct number of chip input harnesses', async () => {
    const harnesses = await loader.getAllHarnesses(MatChipInputHarness);
    expect(harnesses.length).toBe(2);
  });

  it('should get the disabled state', async () => {
    const harnesses = await loader.getAllHarnesses(MatChipInputHarness);
    expect(await harnesses[0].isDisabled()).toBe(false);
    expect(await harnesses[1].isDisabled()).toBe(true);
  });
});

@Component({
  template: `
    <mat-chip-grid #grid1>
      <input [matChipInputFor]="grid1" />
    </mat-chip-grid>

    <mat-chip-grid #grid2>
      <input [matChipInputFor]="grid2" disabled />
    </mat-chip-grid>
  `
})
class ChipInputHarnessTest {}

