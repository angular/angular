// #docplaster
// #docregion
import { TitleCasePipe } from './title-case.pipe';

// #docregion excerpt, mini-excerpt
describe('TitleCasePipe', () => {
  // This pipe is a pure, stateless function so no need for BeforeEach
  let pipe = new TitleCasePipe();

  it('transforms "abc" to "Abc"', () => {
    expect(pipe.transform('abc')).toBe('Abc');
  });
// #enddocregion mini-excerpt

  it('transforms "abc def" to "Abc Def"', () => {
    expect(pipe.transform('abc def')).toBe('Abc Def');
  });

  // ... more tests ...
// #enddocregion excerpt
  it('leaves "Abc Def" unchanged', () => {
    expect(pipe.transform('Abc Def')).toBe('Abc Def');
  });

  it('transforms "abc-def" to "Abc-def"', () => {
    expect(pipe.transform('abc-def')).toBe('Abc-def');
  });

  it('transforms "   abc   def" to "   Abc   Def" (preserves spaces) ', () => {
    expect(pipe.transform('   abc   def')).toBe('   Abc   Def');
  });
// #docregion excerpt, mini-excerpt
});
// #enddocregion excerpt, mini-excerpt
