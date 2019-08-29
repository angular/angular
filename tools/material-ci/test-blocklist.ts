/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// clang-format off
// tslint:disable

interface BlocklistEntry {
  /** Description on why the given test is disabled. */
  notes: string;
  /** Optional error that has been thrown in the test. */
  error?: string;
}

/**
 * List of tests that should not run in the Angular component test suites. This should
 * be empty in the components repository, but the file will be overwritten if the framework
 * repository runs the Angular component test suites against the latest snapshots. This is
 * helpful because sometimes breaking changes that break individual tests land in the framework
 * repository. It should be possible to disable these tests until the component repository
 * migrated the broken tests.
 */
export const testBlocklist: {[testName: string]: BlocklistEntry} = {
  "MatSlideToggle without forms with dragging should not emit a change event when the value did not change": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlideToggle without forms with dragging should ignore clicks on the label element while dragging": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlideToggle without forms with dragging should drag from end to start": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlideToggle without forms with dragging should drag from end to start in RTL": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlideToggle without forms with dragging should update the checked property of the input": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlideToggle without forms with dragging should not drag when disabled": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlideToggle without forms with dragging should emit a change event after drag": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlideToggle without forms with dragging should drag from start to end": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlideToggle without forms with dragging should drag from start to end in RTL": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlideToggle without forms custom action configuration should not change value on dragging when drag action is noop": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider slider with thumb label should update the thumb label text on slide": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider slider with set step should truncate long decimal values when using a decimal step": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider slider with set step should not add decimals to the value if it is a whole number": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider slider with set step should set the correct step value on slide": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider slider with set step should round the value inside the label based on the provided step": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider slider with set step should snap the thumb and fill to a step on slide": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider slider with set value should set the correct value on slide": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider slider with ngModel should update the model on slide": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider slider with input event should emit an input event while sliding": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider standard slider should add and remove the mat-slider-sliding class when sliding": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider standard slider should not change value without emitting a change event": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider standard slider should update the value on a slide": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider standard slider should slide to the max value when the steps do not divide evenly into it": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider standard slider should set the value as max when sliding past the track": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider standard slider should update the track fill on slide": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider standard slider should set the value as min when sliding before the track": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider slider as a custom form control should update the control on slide": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider slider with set min and max should set the correct value on slide": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider slider with set min and max should snap the fill to the nearest value on slide": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider disabled slider should not add the mat-slider-sliding class on slide when disabled": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider disabled slider should not emit change when disabled": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider disabled slider should not change the value on slide when disabled": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider slider with change handler should emit change on slide": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
  "MatSlider slider with change handler should not emit multiple changes for same value": {
    "error": "Unknown",
    "notes": "Restore when Material has included HammerModule or removed dep on Hammer"
  },
};

// clang-format on
