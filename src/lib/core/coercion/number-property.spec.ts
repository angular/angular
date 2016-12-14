import {coerceNumberProperty} from './number-property';


describe('coerceNumberProperty', () => {
  it('should coerce undefined to 0 or default', () => {
    expect(coerceNumberProperty(undefined)).toBe(0);
    expect(coerceNumberProperty(undefined, 111)).toBe(111);
  });

  it('should coerce null to 0 or default', () => {
    expect(coerceNumberProperty(null)).toBe(0);
    expect(coerceNumberProperty(null, 111)).toBe(111);
  });

  it('should coerce true to 0 or default', () => {
    expect(coerceNumberProperty(true)).toBe(0);
    expect(coerceNumberProperty(true, 111)).toBe(111);
  });

  it('should coerce false to 0 or default', () => {
    expect(coerceNumberProperty(false)).toBe(0);
    expect(coerceNumberProperty(false, 111)).toBe(111);

  });

  it('should coerce the empty string to 0 or default', () => {
    expect(coerceNumberProperty('')).toBe(0);
    expect(coerceNumberProperty('', 111)).toBe(111);

  });

  it('should coerce the string "1" to 1', () => {
    expect(coerceNumberProperty('1')).toBe(1);
    expect(coerceNumberProperty('1', 111)).toBe(1);
  });

  it('should coerce the string "123.456" to 123.456', () => {
    expect(coerceNumberProperty('123.456')).toBe(123.456);
    expect(coerceNumberProperty('123.456', 111)).toBe(123.456);
  });

  it('should coerce the string "-123.456" to -123.456', () => {
    expect(coerceNumberProperty('-123.456')).toBe(-123.456);
    expect(coerceNumberProperty('-123.456', 111)).toBe(-123.456);
  });

  it('should coerce an arbitrary string to 0 or default', () => {
    expect(coerceNumberProperty('pink')).toBe(0);
    expect(coerceNumberProperty('pink', 111)).toBe(111);
  });

  it('should coerce an arbitrary string prefixed with a number to 0 or default', () => {
    expect(coerceNumberProperty('123pink')).toBe(0);
    expect(coerceNumberProperty('123pink', 111)).toBe(111);
  });

  it('should coerce the number 1 to 1', () => {
    expect(coerceNumberProperty(1)).toBe(1);
    expect(coerceNumberProperty(1, 111)).toBe(1);
  });

  it('should coerce the number 123.456 to 123.456', () => {
    expect(coerceNumberProperty(123.456)).toBe(123.456);
    expect(coerceNumberProperty(123.456, 111)).toBe(123.456);
  });

  it('should coerce the number -123.456 to -123.456', () => {
    expect(coerceNumberProperty(-123.456)).toBe(-123.456);
    expect(coerceNumberProperty(-123.456, 111)).toBe(-123.456);
  });

  it('should coerce an object to 0 or default', () => {
    expect(coerceNumberProperty({})).toBe(0);
    expect(coerceNumberProperty({}, 111)).toBe(111);
  });

  it('should coerce an array to 0 or default', () => {
    expect(coerceNumberProperty([])).toBe(0);
    expect(coerceNumberProperty([], 111)).toBe(111);
  });
});
