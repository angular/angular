import {createKeyboardEvent} from '@angular/cdk/testing';
import {hasModifierKey} from './modifiers';

describe('keyboard modifiers', () => {
  it('should check whether the alt key is pressed', () => {
    const event = createKeyboardEvent('keydown', 0);
    const altEvent = createKeyboardEvent('keydown', 0, '', undefined, {alt: true});

    expect(hasModifierKey(event)).toBe(false);
    expect(hasModifierKey(altEvent)).toBe(true);
  });

  it('should check whether the shift key is pressed', () => {
    const event = createKeyboardEvent('keydown', 0);
    const shiftEvent = createKeyboardEvent('keydown', 0, '', undefined, {shift: true});

    expect(hasModifierKey(event)).toBe(false);
    expect(hasModifierKey(shiftEvent)).toBe(true);
  });

  it('should check whether the meta key is pressed', () => {
    const event = createKeyboardEvent('keydown', 0);
    const metaEvent = createKeyboardEvent('keydown', 0, '', undefined, {meta: true});

    expect(hasModifierKey(event)).toBe(false);
    expect(hasModifierKey(metaEvent)).toBe(true);
  });

  it('should check whether the ctrl key is pressed', () => {
    const event = createKeyboardEvent('keydown', 0);
    const ctrlEvent = createKeyboardEvent('keydown', 0, '', undefined, {control: true});

    expect(hasModifierKey(event)).toBe(false);
    expect(hasModifierKey(ctrlEvent)).toBe(true);
  });

  it('should check if a particular modifier key is pressed', () => {
    const ctrlEvent = createKeyboardEvent('keydown', 0, '', undefined, {control: true});
    const ctrlAltEvent = createKeyboardEvent(
        'keydown', 0, '', undefined, {control: true, alt: true});

    expect(hasModifierKey(ctrlEvent, 'altKey')).toBe(false);
    expect(hasModifierKey(ctrlAltEvent, 'altKey')).toBe(true);
  });

  it('should check if multiple specific modifier keys are pressed', () => {
    const ctrlEvent = createKeyboardEvent('keydown', 0, '', undefined, {control: true});
    const ctrlAltShiftEvent = createKeyboardEvent(
        'keydown', 0, '', undefined, {control: true, alt: true, shift: true});

    expect(hasModifierKey(ctrlEvent, 'altKey', 'shiftKey')).toBe(false);
    expect(hasModifierKey(ctrlAltShiftEvent, 'altKey', 'shiftKey')).toBe(true);
  });
});
