import * as ts from 'typescript';
import {Symbols} from '../src/symbols';
import {MockSymbol, MockVariableDeclaration} from './typescript.mocks';

describe('Symbols', () => {
  let symbols: Symbols;
  const someValue = 'some-value';
  const someSymbol = MockSymbol.of('some-symbol');
  const aliasSymbol = new MockSymbol('some-symbol', someSymbol.getDeclarations()[0]);
  const missingSymbol = MockSymbol.of('some-other-symbol');

  beforeEach(() => symbols = new Symbols());

  it('should be able to add a symbol', () => symbols.set(someSymbol, someValue));

  beforeEach(() => symbols.set(someSymbol, someValue));

  it('should be able to `has` a symbol', () => expect(symbols.has(someSymbol)).toBeTruthy());
  it('should be able to `get` a symbol value',
     () => expect(symbols.get(someSymbol)).toBe(someValue));
  it('should be able to `has` an alias symbol',
     () => expect(symbols.has(aliasSymbol)).toBeTruthy());
  it('should be able to `get` a symbol value',
     () => expect(symbols.get(aliasSymbol)).toBe(someValue));
  it('should be able to determine symbol is missing',
     () => expect(symbols.has(missingSymbol)).toBeFalsy());
  it('should return undefined from `get` for a missing symbol',
     () => expect(symbols.get(missingSymbol)).toBeUndefined());
});