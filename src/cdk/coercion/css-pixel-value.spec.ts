import {coerceCssPixelValue} from './css-pixel-value';

describe('coerceCssPixelValue', () => {
  it('should add pixel units to a number value', () => {
    expect(coerceCssPixelValue(1337)).toBe('1337px');
  });

  it('should ignore string values', () => {
    expect(coerceCssPixelValue('1337rem')).toBe('1337rem');
  });

  it('should return an empty string for null', () => {
    expect(coerceCssPixelValue(null)).toBe('');
  });

  it('should return an empty string for undefined', () => {
    expect(coerceCssPixelValue(undefined)).toBe('');
  });
});
