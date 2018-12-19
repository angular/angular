import {ElementRef} from '@angular/core';
import {coerceElement} from './element';

describe('coerceElement', () => {
  it('should coerce an ElementRef into an element', () => {
    const ref = new ElementRef(document.body);
    expect(coerceElement(ref)).toBe(document.body);
  });

  it('should return the element, if a native element is passed in', () => {
    expect(coerceElement(document.body)).toBe(document.body);
  });
});
