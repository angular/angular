import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDividerModule} from '@angular/material/divider';
import {MatDividerHarness} from './divider-harness';

/** Shared tests to run on both the original and MDC-based dividers. */
export function runHarnessTests(
  dividerModule: typeof MatDividerModule,
  dividerHarness: typeof MatDividerHarness,
) {
  let fixture: ComponentFixture<DividerHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [dividerModule],
      declarations: [DividerHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(DividerHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all divider harnesses', async () => {
    const dividers = await loader.getAllHarnesses(dividerHarness);
    expect(dividers.length).toBe(2);
  });

  it('should check if divider is inset', async () => {
    const dividers = await loader.getAllHarnesses(dividerHarness);
    expect(await dividers[0].isInset()).toBe(false);
    expect(await dividers[1].isInset()).toBe(true);
  });

  it('should get divider orientation', async () => {
    const dividers = await loader.getAllHarnesses(dividerHarness);
    expect(await dividers[0].getOrientation()).toBe('horizontal');
    expect(await dividers[1].getOrientation()).toBe('vertical');
  });
}

@Component({
  template: `
    <mat-divider></mat-divider>
    <mat-divider inset vertical></mat-divider>
  `,
})
class DividerHarnessTest {}
