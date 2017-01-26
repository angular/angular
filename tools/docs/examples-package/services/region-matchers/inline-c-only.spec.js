const matcher = require('./inline-c-only');

describe('inline-c-only region-matcher', () => {
  it('should match start annotations', () => {
    let matches;

    matches = matcher.regionStartMatcher.exec('// #docregion A b c');
    expect(matches).not.toBeNull();
    expect(matches[1]).toEqual('A b c');

    matches = matcher.regionStartMatcher.exec('//#docregion A b c');
    expect(matches).not.toBeNull();
    expect(matches[1]).toEqual('A b c');

    matches = matcher.regionStartMatcher.exec('// #docregion');
    expect(matches).not.toBeNull();
    expect(matches[1]).toEqual('');
  });

  it('should match end annotations', () => {
    let matches;

    matches = matcher.regionEndMatcher.exec('// #enddocregion A b c');
    expect(matches).not.toBeNull();
    expect(matches[1]).toEqual('A b c');

    matches = matcher.regionEndMatcher.exec('//#enddocregion A b c');
    expect(matches).not.toBeNull();
    expect(matches[1]).toEqual('A b c');

    matches = matcher.regionEndMatcher.exec('// #enddocregion');
    expect(matches).not.toBeNull();
    expect(matches[1]).toEqual('');
  });

  it('should match plaster annotations', () => {
    let matches;

    matches = matcher.plasterMatcher.exec('// #docplaster A b c');
    expect(matches).not.toBeNull();
    expect(matches[1]).toEqual('A b c');

    matches = matcher.plasterMatcher.exec('//#docplaster A b c');
    expect(matches).not.toBeNull();
    expect(matches[1]).toEqual('A b c');

    matches = matcher.plasterMatcher.exec('// #docplaster');
    expect(matches).not.toBeNull();
    expect(matches[1]).toEqual('');
  });

  it('should create a plaster comment', () => {
    expect(matcher.createPlasterComment('... elided ...')).toEqual('// ... elided ...');
  });
});