export const config = {
  // The MDC slider is temporarily disabled.
  skippedPackages: ['mdc-slider'],
  skippedTests: {
    'mdc-autocomplete': [
      // Tests something that isn't supported by the MDC form field.
      'should hide the label with a preselected form control value and a disabled floating label',
    ],
    'mdc-button': [
      // The MDC button doesn't use `FocusMonitor` so it can't support passing in a focus origin.
      'should be able to focus button with a specific focus origin',
      'should not change focus origin if origin not specified',
    ],
    'mdc-checkbox': [
      // These tests are verifying implementation details that are not relevant for MDC.
      'should transition unchecked -> checked -> unchecked',
      'should transition unchecked -> indeterminate -> unchecked',
      'should transition indeterminate -> checked',
      'should not apply transition classes when there is no state change',
      'should not initially have any transition classes',
      'should not have transition classes when animation ends',
      'should toggle checkbox disabledness correctly',
      'should remove margin for checkbox without a label',
      'should not remove margin if initial label is set through binding',
      'should re-add margin if label is added asynchronously',
      'should properly update margin if label content is projected',
      'should transition correctly from initially checked to indeterminate',

      // TODO: the focus origin behavior needs to be implemented in the MDC checkbox
      'should not change focus origin if origin not specified',
    ],
    'mdc-chips': [
      // The chain of events for dispatching the remove event in the MDC
      // chips is different so we have a different set of tests.
      'should emit (removed) on click',
      'should not remove if parent chip is disabled',

      // This test checks something that isn't supported in the MDC form field.
      'should propagate the dynamic `placeholder` value to the form field',

      // Disabled, because the MDC-based chip input doesn't deal with focus escaping anymore.
      'should not allow focus to escape when tabbing backwards',

      // Disabled, because preventing the default action isn't required.
      'should prevent the default click action when the chip is disabled',
    ],
    'mdc-dialog': [
      // These tests are verifying implementation details that are not relevant for MDC.
      'should set the proper animation states',
    ],
    'mdc-input': [
      // These tests are verifying either implementation details that aren't relevant
      // for MDC, or features that we've decided not to support in the MDC input.
      'should default to floating label type provided by global default options',
      "validates there's only one placeholder",
      'supports placeholder attribute',
      'should not render the native placeholder when its value is mirrored in the label',
      'supports placeholder element',
      'supports placeholder required star',
      'should hide the required star if input is disabled',
      'should hide the required star from screen readers',
      'hide placeholder required star when set to hide the required marker',
      'should always float the label when floatLabel is set to true',
      'should never float the label when floatLabel is set to false',
      'should be able to animate the label up and lock it in position',
      'should not throw when trying to animate and lock too early',
      'should only show the native placeholder, when there is a label, on focus',
      'should always show the native placeholder when floatLabel is set to "always"',
      'should not show the native placeholder when floatLabel is set to "never"',
      'should not throw when there is a default ngIf on the label element',
      'should not throw when there is a default ngIf on the input element',
      'legacy appearance should promote placeholder to label',
      'non-legacy appearances should not promote placeholder to label',
      'legacy appearance should respect float never',
      'non-legacy appearances should not respect float never',
      'should recalculate gaps when switching to outline appearance after init',
      'should calculate the gap when starting off in RTL',
      'should not set an outline gap if the label is empty',
      'should calculate the gaps if the default appearance is provided through DI',
      'should update the outline gap when the prefix/suffix is added or removed',
      'should calculate the outline gaps if the element starts off invisible',
      'should update the outline gap if the direction changes',
      'should update the outline gap correctly if the direction changes multiple times',
      'should calculate the outline gaps inside the shadow DOM',
      'should recalculate the outline gap when the label changes to empty after init',
      'should be legacy appearance if no default options provided',
      'should be legacy appearance if empty default options provided',
    ],
    'mdc-list': [
      // TODO: these tests need to be double-checked for missing functionality.
      'should not apply any additional class to a list without lines',
      'should not add the mat-list-single-selected-option class (in multiple mode)',
      'should not move focus to the first item if focus originated from a mouse interaction',
      'should allow focus to escape when tabbing away',
      'should restore focus if active option is destroyed',
      'should not attempt to focus the next option when the destroyed option was not focused',
      'should use `compareWith` function when updating option selection state',
      'should only be in the tab order if it has options',

      // MDC does not support SHIFT + ARROW for item selection. Tracked as a feature request:
      // https://github.com/material-components/material-components-web/issues/6364.
      'should focus and toggle the next item when pressing SHIFT + UP_ARROW',
      'should focus and toggle the next item when pressing SHIFT + DOWN_ARROW',

      // MDC does not respect modifier keys, so these tests would fail.
      // Tracked with: https://github.com/material-components/material-components-web/issues/6365.
      'should not be able to toggle an item when pressing a modifier key',
      'should not change focus when pressing HOME with a modifier key',
      'should not change focus when pressing END with a modifier key',

      // MDC-based list does not support more than three lines.
      'should apply a particular class to lists with more than 3 lines',
    ],
    'mdc-progress-bar': [
      // These tests are verifying implementation details that are not relevant for MDC.
      'should return the transform attribute for bufferValue and mode',
      'should prefix SVG references with the current path',
      'should account for location hash when prefixing the SVG references',
      'should not be able to tab into the underlying SVG element',
      'should use latest path when prefixing the SVG references',
    ],
    'mdc-progress-spinner': [
      // These tests are verifying implementation details that are not relevant for MDC.
      'should use different `circle` elements depending on the mode',
      'should add a style tag with the indeterminate animation to the document ' +
        'head when using a non-default diameter',
      'should handle creating animation style tags based on a floating point diameter',
      'should add the indeterminate animation style tag to the Shadow root',
      'should not duplicate style tags inside the Shadow root',
      'should add the indeterminate animation style tag to the Shadow root if the ' +
        'element is inside an ngIf',
    ],
    'mdc-select': [
      // These tests are excluded, because they're verifying the functionality that positions
      // the select panel over the trigger which isn't supported in the MDC select.
      'should set the width of the overlay based on a larger trigger width',
      'should float the label when the panel is open and unselected',
      'should be able to disable the floating label',
      'should align the first option with trigger text if no option is selected',
      'should align a selected option too high to be centered with the trigger text',
      'should align a selected option in the middle with the trigger text',
      'should align a selected option at the scroll max with the trigger text',
      'should account for preceding label groups when aligning the option',
      'should account for indirect preceding label groups when aligning the option',
      'should adjust position of centered option if there is little space above',
      'should adjust position of centered option if there is little space below',
      'should fall back to "above" positioning if scroll adjustment will not help',
      'should fall back to "below" positioning if scroll adjustment won\'t help',
      'should stay within the viewport when overflowing on the left in ltr',
      'should stay within the viewport when overflowing on the left in rtl',
      'should stay within the viewport when overflowing on the right in ltr',
      'should stay within the viewport when overflowing on the right in rtl',
      'should keep the position within the viewport on repeat openings',
      'should align the first option properly when scrolled',
      'should align a centered option properly when scrolled',
      'should align a centered option properly when scrolling while the panel is open',
      'should fall back to "above" positioning properly when scrolled',
      'should fall back to "below" positioning properly when scrolled',
      'should align the trigger and the selected option on the x-axis in ltr',
      'should align the trigger and the selected option on the x-axis in rtl',
      'should adjust for the checkbox in ltr',
      'should adjust for the checkbox in rtl',
      'should adjust for the group padding in ltr',
      'should adjust for the group padding in rtl',
      'should not adjust if all options are within a group, except the selected one',
      'should align the first option to the trigger, if nothing is selected',
      'should not adjust if option centering is disabled any option under a group is selected',
    ],
    'mdc-slide-toggle': [
      // These tests are verifying implementation details that are not relevant for MDC.
      'should remove margin for slide-toggle without a label',
      'should not remove margin if initial label is set through binding',
      'should re-add margin if label is added asynchronously',
      'should properly update margin if label content is projected',

      // The MDC slide toggle uses a `button` which isn't able to block form submission.
      'should prevent the form from submit when being required',

      // TODO: the focus origin functionality has to be implemented for the MDC slide toggle.
      'should not change focus origin if origin not specified',
    ],
    'mdc-snack-bar': [
      // These tests are verifying implementation details that are not relevant for MDC.
      'should set the animation state to visible on entry',
      'should set the animation state to complete on exit',
      'should set the old snack bar animation state to complete and the new snack bar ' +
        'animation state to visible on entry of new snack bar',
    ],
    'mdc-tabs': [
      // These tests are excluded because they are verifying behavior that is not supported in MDC.
      'should have no explicit roles',
      'should not setup aria-controls',
      'should not manage aria-selected',
      'should not activate a link when space is pressed',
      'should manage aria-current',
      'should support the native tabindex attribute',
      'should support binding to the tabIndex',
    ],
  } as {[key: string]: string[]},
};
