import {coerceBooleanProperty} from './boolean-property';

describe('coerceBooleanProperty', () => {

  it('should coerce undefined to false', () => {
    expect(coerceBooleanProperty(undefined)).toBe(false);
  });

  it('should coerce null to false', () => {
    expect(coerceBooleanProperty(null)).toBe(false);
  });

  it('should coerce the empty string to true', () => {
    expect(coerceBooleanProperty('')).toBe(true);
  });

  it('should coerce zero to true', () => {
    expect(coerceBooleanProperty(0)).toBe(true);
  });

  it('should coerce the string "false" to false', () => {
    expect(coerceBooleanProperty('false')).toBe(false);
  });

  it('should coerce the boolean false to false', () => {
    expect(coerceBooleanProperty(false)).toBe(false);
  });

  it('should coerce the boolean true to true', () => {
    expect(coerceBooleanProperty(true)).toBe(true);
  });

  it('should coerce the string "true" to true', () => {
    expect(coerceBooleanProperty('true')).toBe(true);
  });

  it('should coerce an arbitrary string to true', () => {
    expect(coerceBooleanProperty('pink')).toBe(true);
  });

  it('should coerce an object to true', () => {
    expect(coerceBooleanProperty({})).toBe(true);
  });

  it('should coerce an array to true', () => {
    expect(coerceBooleanProperty([])).toBe(true);
  });

});
