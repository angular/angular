import {mixinColor} from './color';
import {ElementRef} from '@angular/core';

describe('MixinColor', () => {
  it('should augment an existing class with a color property', () => {
    const classWithColor = mixinColor(TestClass);
    const instance = new classWithColor();

    expect(instance.color)
      .withContext('Expected the mixed-into class to have a color property')
      .toBeFalsy();

    instance.color = 'accent';

    expect(instance.color)
      .withContext('Expected the mixed-into class to have an updated color property')
      .toBe('accent');
  });

  it('should remove old color classes if new color is set', () => {
    const classWithColor = mixinColor(TestClass);
    const instance = new classWithColor();

    expect(instance.testElement.classList.length)
      .withContext('Expected the element to not have any classes at initialization')
      .toBe(0);

    instance.color = 'primary';

    expect(instance.testElement.classList)
      .withContext('Expected the element to have the "mat-primary" class set')
      .toContain('mat-primary');

    instance.color = 'accent';

    expect(instance.testElement.classList).not.toContain(
      'mat-primary',
      'Expected the element to no longer have "mat-primary" set.',
    );
    expect(instance.testElement.classList)
      .withContext('Expected the element to have the "mat-accent" class set')
      .toContain('mat-accent');
  });

  it('should allow having no color set', () => {
    const classWithColor = mixinColor(TestClass);
    const instance = new classWithColor();

    expect(instance.testElement.classList.length)
      .withContext('Expected the element to not have any classes at initialization')
      .toBe(0);

    instance.color = 'primary';

    expect(instance.testElement.classList)
      .withContext('Expected the element to have the "mat-primary" class set')
      .toContain('mat-primary');

    instance.color = undefined;

    expect(instance.testElement.classList.length)
      .withContext('Expected the element to have no color class set.')
      .toBe(0);
  });

  it('should allow having a default color if specified', () => {
    const classWithColor = mixinColor(TestClass, 'accent');
    const instance = new classWithColor();

    expect(instance.testElement.classList)
      .withContext('Expected the element to have the "mat-accent" class by default.')
      .toContain('mat-accent');

    instance.color = undefined;

    expect(instance.testElement.classList)
      .withContext('Expected the default color "mat-accent" to be set.')
      .toContain('mat-accent');
  });

  it('should allow for the default color to change after init', () => {
    const classWithColor = mixinColor(TestClass, 'accent');
    const instance = new classWithColor();

    expect(instance.testElement.classList).toContain('mat-accent');

    instance.defaultColor = 'warn';
    instance.color = undefined;

    expect(instance.testElement.classList).toContain('mat-warn');
  });
});

class TestClass {
  testElement: HTMLElement = document.createElement('div');

  /** Fake instance of an ElementRef. */
  _elementRef = new ElementRef<HTMLElement>(this.testElement);
}
