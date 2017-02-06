let supportedInputTypes: Set<string>;

/** @returns The input types supported by this browser. */
export function getSupportedInputTypes(): Set<string> {
  if (!supportedInputTypes) {
    let featureTestInput = document.createElement('input');
    supportedInputTypes = new Set([
      // `color` must come first. Chrome 56 shows a warning if we change the type to `color` after
      // first changing it to something else:
      // The specified value "" does not conform to the required format.
      // The format is "#rrggbb" where rr, gg, bb are two-digit hexadecimal numbers.
      'color',
      'button',
      'checkbox',
      'date',
      'datetime-local',
      'email',
      'file',
      'hidden',
      'image',
      'month',
      'number',
      'password',
      'radio',
      'range',
      'reset',
      'search',
      'submit',
      'tel',
      'text',
      'time',
      'url',
      'week',
    ].filter(value => {
      featureTestInput.setAttribute('type', value);
      return featureTestInput.type === value;
    }));
  }
  return supportedInputTypes;
}
