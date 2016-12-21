let supportedInputTypes: Set<string>;

/** @returns The input types supported by this browser. */
export function getSupportedInputTypes(): Set<string> {
  if (!supportedInputTypes) {
    let featureTestInput = document.createElement('input');
    supportedInputTypes = new Set([
      'button',
      'checkbox',
      'color',
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
