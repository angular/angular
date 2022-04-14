import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatChipsModule} from '../index';
import {MatChipGridHarness} from './chip-grid-harness';

describe('MatChipGridHarness', () => {
  let fixture: ComponentFixture<ChipGridHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatChipsModule, ReactiveFormsModule],
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
    const harness = await loader.getHarness(MatChipGridHarness);
    const rows = await harness.getRows();
    expect(rows.length).toBe(3);
  });

  it('should get the chip input harness', async () => {
    const harness = await loader.getHarness(MatChipGridHarness);
    const input = await harness.getInput();
    expect(input).not.toBe(null);
  });

  it('should get whether the grid is disabled', async () => {
    const harness = await loader.getHarness(MatChipGridHarness);
    expect(await harness.isDisabled()).toBe(false);

    fixture.componentInstance.control.disable();
    expect(await harness.isDisabled()).toBe(true);
  });

  it('should get whether the grid is required', async () => {
    const harness = await loader.getHarness(MatChipGridHarness);
    expect(await harness.isRequired()).toBe(false);

    fixture.componentInstance.required = true;
    expect(await harness.isRequired()).toBe(true);
  });

  it('should get whether the grid is invalid', async () => {
    const harness = await loader.getHarness(MatChipGridHarness);
    expect(await harness.isInvalid()).toBe(false);

    // Mark the control as touched since the default error
    // state matcher only activates after a control is touched.
    fixture.componentInstance.control.markAsTouched();
    fixture.componentInstance.control.setValue(null);

    expect(await harness.isInvalid()).toBe(true);
  });
});

@Component({
  template: `
    <mat-chip-grid [formControl]="control" [required]="required" #grid>
      <mat-chip-row>Chip A</mat-chip-row>
      <mat-chip-row>Chip B</mat-chip-row>
      <mat-chip-row>Chip C</mat-chip-row>
      <input [matChipInputFor]="grid"/>
    </mat-chip-grid>
  `,
})
class ChipGridHarnessTest {
  control = new FormControl('value', [Validators.required]);
  required = false;
}
