import {TestBed, ComponentFixture} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatCheckboxHarness} from '@angular/material/checkbox/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {CheckboxHarnessExample} from './checkbox-harness-example';

describe('CheckboxHarnessExample', () => {
  let fixture: ComponentFixture<CheckboxHarnessExample>;
  let loader: HarnessLoader;

  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
      teardown: {destroyAfterEach: true}
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatCheckboxModule, ReactiveFormsModule],
      declarations: [CheckboxHarnessExample]
    }).compileComponents();
    fixture = TestBed.createComponent(CheckboxHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load checkbox with name', async () => {
    const checkboxes = await loader.getAllHarnesses(MatCheckboxHarness.with({name: 'first-name'}));
    expect(checkboxes.length).toBe(1);
    expect(await checkboxes[0].getLabelText()).toBe('First');
  });

  it('should get checked state', async () => {
    const [checkedCheckbox, uncheckedCheckbox] = await loader.getAllHarnesses(MatCheckboxHarness);
    expect(await checkedCheckbox.isChecked()).toBe(true);
    expect(await uncheckedCheckbox.isChecked()).toBe(false);
  });

  it('should get name', async () => {
    const checkbox = await loader.getHarness(MatCheckboxHarness.with({label: 'First'}));
    expect(await checkbox.getName()).toBe('first-name');
  });

  it('should get label text', async () => {
    const [firstCheckbox, secondCheckbox] = await loader.getAllHarnesses(MatCheckboxHarness);
    expect(await firstCheckbox.getLabelText()).toBe('First');
    expect(await secondCheckbox.getLabelText()).toBe('Second');
  });

  it('should toggle checkbox', async () => {
    fixture.componentInstance.disabled = false;
    const [checkedCheckbox, uncheckedCheckbox] = await loader.getAllHarnesses(MatCheckboxHarness);
    await checkedCheckbox.toggle();
    await uncheckedCheckbox.toggle();
    expect(await checkedCheckbox.isChecked()).toBe(false);
    expect(await uncheckedCheckbox.isChecked()).toBe(true);
  });
});
