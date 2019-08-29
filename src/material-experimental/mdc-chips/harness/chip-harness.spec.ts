import {HarnessLoader} from '@angular/cdk-experimental/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk-experimental/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatChipsModule} from '../index';
import {MatChipHarness} from './chip-harness';

let fixture: ComponentFixture<ChipHarnessTest>;
let loader: HarnessLoader;

describe('MatChipHarness', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatChipsModule],
      declarations: [ChipHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(ChipHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should get correct number of chip harnesses', async () => {
    const harnesses = await loader.getAllHarnesses(MatChipHarness);
    expect(harnesses.length).toBe(3);
  });

  it('should get the chip text content', async () => {
    const harnesses = await loader.getAllHarnesses(MatChipHarness);
    expect(await harnesses[0].getText()).toBe('Basic Chip');
    expect(await harnesses[1].getText()).toBe('Chip');
    expect(await harnesses[2].getText()).toBe('Disabled Chip');
  });
});

@Component({
  template: `
    <mat-basic-chip> Basic Chip </mat-basic-chip>
    <mat-chip> Chip </mat-chip>
    <mat-chip disabled> Disabled Chip </mat-chip>
  `
})
class ChipHarnessTest {}

