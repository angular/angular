import {async, inject, TestBed} from '@angular/core/testing';
import {DateAdapter, JAN, MatNativeDateModule} from '@angular/material/core';
import {coerceDateProperty} from './index';


describe('coerceDateProperty', () => {
  let adapter: DateAdapter<Date>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatNativeDateModule],
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([DateAdapter], (dateAdapter: DateAdapter<Date>) => {
    adapter = dateAdapter;
  }));

  it('should pass through existing date', () => {
    const d = new Date(2017, JAN, 1);
    expect(coerceDateProperty(adapter, d)).toBe(d);
  });

  it('should pass through invalid date', () => {
    const d = new Date(NaN);
    expect(coerceDateProperty(adapter, d)).toBe(d);
  });

  it('should pass through null and undefined', () => {
    expect(coerceDateProperty(adapter, null)).toBeNull();
    expect(coerceDateProperty(adapter, undefined)).toBeUndefined();
  });

  it('should coerce empty string to null', () => {
    expect(coerceDateProperty(adapter, '')).toBe(null);
  });

  it('should coerce ISO 8601 string to date', () => {
    let isoString = '2017-01-01T00:00:00Z';
    expect(coerceDateProperty(adapter, isoString)).toEqual(new Date(isoString));
  });

  it('should throw when given a number', () => {
    expect(() => coerceDateProperty(adapter, 5)).toThrow();
    expect(() => coerceDateProperty(adapter, 0)).toThrow();
  });

  it('should throw when given a string with incorrect format', () => {
    expect(() => coerceDateProperty(adapter, '1/1/2017')).toThrow();
    expect(() => coerceDateProperty(adapter, 'hello')).toThrow();
  });
});
