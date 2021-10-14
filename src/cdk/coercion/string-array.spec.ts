import {coerceStringArray} from '@angular/cdk/coercion/string-array';

describe('coerceStringArray', () => {
  it('should split a string', () => {
    expect(coerceStringArray('x y  z 1')).toEqual(['x', 'y', 'z', '1']);
  });

  it('should map values to string in an array', () => {
    expect(
      coerceStringArray(['x', 1, true, null, undefined, ['arr', 'ay'], {data: false}]),
    ).toEqual(['x', '1', 'true', 'null', 'undefined', 'arr,ay', '[object Object]']);
  });

  it('should work with a custom delimiter', () => {
    expect(coerceStringArray('1::2::3::4', '::')).toEqual(['1', '2', '3', '4']);
  });

  it('should trim values and remove empty values', () => {
    expect(coerceStringArray(',  x,  ,, ', ',')).toEqual(['x']);
  });

  it('should map non-string values to string', () => {
    expect(coerceStringArray(0)).toEqual(['0']);
  });

  it('should return an empty array for null', () => {
    expect(coerceStringArray(null)).toEqual([]);
  });

  it('should return an empty array for undefined', () => {
    expect(coerceStringArray(undefined)).toEqual([]);
  });
});
