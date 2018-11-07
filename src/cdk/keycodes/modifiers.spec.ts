import {createKeyboardEvent} from '@angular/cdk/testing';
import {hasModifierKey} from './modifiers';

describe('keyboard modifiers', () => {
  it('should check whether the alt key is pressed', () => {
    const event = createKeyboardEvent('keydown', 0);

    expect(hasModifierKey(event)).toBe(false);
    Object.defineProperty(event, 'altKey', {get: () => true});
    expect(hasModifierKey(event)).toBe(true);
  });

  it('should check whether the shift key is pressed', () => {
    const event = createKeyboardEvent('keydown', 0);

    expect(hasModifierKey(event)).toBe(false);
    Object.defineProperty(event, 'shiftKey', {get: () => true});
    expect(hasModifierKey(event)).toBe(true);
  });

  it('should check whether the meta key is pressed', () => {
    const event = createKeyboardEvent('keydown', 0);

    expect(hasModifierKey(event)).toBe(false);
    Object.defineProperty(event, 'metaKey', {get: () => true});
    expect(hasModifierKey(event)).toBe(true);
  });

  it('should check whether the ctrl key is pressed', () => {
    const event = createKeyboardEvent('keydown', 0);

    expect(hasModifierKey(event)).toBe(false);
    Object.defineProperty(event, 'ctrlKey', {get: () => true});
    expect(hasModifierKey(event)).toBe(true);
  });

  it('should check if a particular modifier key is pressed', () => {
    const event = createKeyboardEvent('keydown', 0);
    Object.defineProperty(event, 'ctrlKey', {get: () => true});

    expect(hasModifierKey(event, 'altKey')).toBe(false);
    Object.defineProperty(event, 'altKey', {get: () => true});
    expect(hasModifierKey(event, 'altKey')).toBe(true);
  });

  it('should check if multiple specific modifier keys are pressed', () => {
    const event = createKeyboardEvent('keydown', 0);
    Object.defineProperty(event, 'ctrlKey', {get: () => true});

    expect(hasModifierKey(event, 'altKey', 'shiftKey')).toBe(false);
    Object.defineProperty(event, 'altKey', {get: () => true});
    Object.defineProperty(event, 'shiftKey', {get: () => true});
    expect(hasModifierKey(event, 'altKey', 'shiftKey')).toBe(true);
  });

});
