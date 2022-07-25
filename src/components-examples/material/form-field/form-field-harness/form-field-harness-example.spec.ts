import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatLegacyFormFieldHarness} from '@angular/material/legacy-form-field/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {FormFieldHarnessExample} from './form-field-harness-example';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {ReactiveFormsModule} from '@angular/forms';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatLegacyInputHarness} from '@angular/material/legacy-input/testing';

describe('FormFieldHarnessExample', () => {
  let fixture: ComponentFixture<FormFieldHarnessExample>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatLegacyFormFieldModule,
        MatLegacyInputModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      declarations: [FormFieldHarnessExample],
    }).compileComponents();
    fixture = TestBed.createComponent(FormFieldHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should be able to load harnesses', async () => {
    const formFields = await loader.getAllHarnesses(MatLegacyFormFieldHarness);
    expect(formFields.length).toBe(1);
  });

  it('should be able to get control of form-field', async () => {
    const formField = await loader.getHarness(MatLegacyFormFieldHarness);
    expect((await formField.getControl()) instanceof MatLegacyInputHarness).toBe(true);
  });

  it('should be able to get error messages and hints of form-field', async () => {
    const formField = await loader.getHarness(MatLegacyFormFieldHarness);
    expect(await formField.getTextErrors()).toEqual([]);
    expect(await formField.getTextHints()).toEqual(['Hint']);

    fixture.componentInstance.requiredControl.setValue('');
    await ((await formField.getControl()) as MatLegacyInputHarness)?.blur();
    expect(await formField.getTextErrors()).toEqual(['Error']);
    expect(await formField.getTextHints()).toEqual([]);
  });

  it('should be able to check if form field is invalid', async () => {
    const formField = await loader.getHarness(MatLegacyFormFieldHarness);
    expect(await formField.isControlValid()).toBe(true);

    fixture.componentInstance.requiredControl.setValue('');
    expect(await formField.isControlValid()).toBe(false);
  });
});
