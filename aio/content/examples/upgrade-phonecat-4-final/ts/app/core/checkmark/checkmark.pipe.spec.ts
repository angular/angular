import { CheckmarkPipe } from './checkmark.pipe';

describe('CheckmarkPipe', function() {

  it('should convert boolean values to unicode checkmark or cross', function () {
    const checkmarkPipe = new CheckmarkPipe();
    expect(checkmarkPipe.transform(true)).toBe('\u2713');
    expect(checkmarkPipe.transform(false)).toBe('\u2718');
  });
});
