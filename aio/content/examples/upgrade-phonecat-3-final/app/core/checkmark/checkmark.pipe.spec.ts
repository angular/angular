import { CheckmarkPipe } from './checkmark.pipe';

describe('CheckmarkPipe', () => {

  it('should convert boolean values to unicode checkmark or cross', () => {
    const checkmarkPipe = new CheckmarkPipe();
    expect(checkmarkPipe.transform(true)).toBe('\u2713');
    expect(checkmarkPipe.transform(false)).toBe('\u2718');
  });
});
