const { mergeProperties, mapObject, parseAttributes, renderAttributes } = require('./utils');

describe('utils', () => {
  describe('mapObject', () => {
    it('creates a new object', () => {
      const testObj = { a: 1 };
      const mappedObj = mapObject(testObj, (key, value) => value);
      expect(mappedObj).toEqual(testObj);
      expect(mappedObj).not.toBe(testObj);
    });

    it('maps the values via the mapper function', () => {
      const testObj = { a: 1, b: 2 };
      const mappedObj = mapObject(testObj, (key, value) => value * 2);
      expect(mappedObj).toEqual({ a: 2, b: 4 });
    });
  });

  describe('parseAttributes', () => {
    it('should parse empty string', () => {
      const attrs = parseAttributes('');
      expect(attrs).toEqual({ });
    });

    it('should parse blank string', () => {
      const attrs = parseAttributes('  ');
      expect(attrs).toEqual({ });
    });

    it('should parse double quoted attributes', () => {
      const attrs = parseAttributes('a="one" b="two"');
      expect(attrs).toEqual({ a: 'one', b: 'two' });
    });

    it('should parse empty quoted attributes', () => {
      const attrs = parseAttributes('a="" b="two"');
      expect(attrs).toEqual({ a: '', b: 'two' });
    });

    it('should parse single quoted attributes', () => {
      const attrs = parseAttributes('a=\'one\' b=\'two\'');
      expect(attrs).toEqual({ a: 'one', b: 'two' });
    });

    it('should ignore whitespace', () => {
      const attrs = parseAttributes('   a = "one"   b  =  "two"   ');
      expect(attrs).toEqual({ a: 'one', b: 'two' });
    });

    it('should parse attributes with quotes within quotes', () => {
      const attrs = parseAttributes('a=\'o"n"e\' b="t\'w\'o"');
      expect(attrs).toEqual({ a: 'o"n"e', b: 't\'w\'o' });
    });

    it('should parse attributes with spaces in their values', () => {
      const attrs = parseAttributes('a="one and two" b="three and four"');
      expect(attrs).toEqual({ a: 'one and two', b: 'three and four' });
    });

    it('should parse empty attributes', () => {
      const attrs = parseAttributes('a b="two"');
      expect(attrs).toEqual({ a: true, b: 'two' });
    });

    it('should parse unquoted attributes', () => {
      const attrs = parseAttributes('a=one b=two');
      expect(attrs).toEqual({ a: 'one', b: 'two' });
    });

    it('should complain if a quoted attribute is not closed', () => {
      expect(() => parseAttributes('a="" b="two')).toThrowError(
        'Unterminated quoted attribute value in `a="" b="two`. Starting at 8. Expected a " but got "end of string".'
      );
    });
  });

  describe('renderAttributes', () => {
    it('should convert key-value map to a strong that can be used in HTML', () => {
      expect(renderAttributes({ foo: 'bar', moo: 'car' })).toEqual(' foo="bar" moo="car"');
    });

    it('should handle boolean values', () => {
      expect(renderAttributes({ foo: 'bar', loo: true, moo: false }))
          .toEqual(' foo="bar" loo');
    });

    it('should escape double quotes inside the value', () => {
      expect(renderAttributes({ foo: 'bar "car"' })).toEqual(' foo="bar &quot;car&quot;"');
    });

    it('should not escape single quotes inside the value', () => {
      expect(renderAttributes({ foo: 'bar \'car\'' })).toEqual(' foo="bar \'car\'"');
    });

    it('should handle an empty object', () => {
      expect(renderAttributes({ })).toEqual('');
    });
  });

  describe('mergeProperties', () => {
    it('should write specified properties from the source to the target', () => {
      const source = { a: 1, b: 2, c: 3 };
      const target = { };
      mergeProperties(target, source, ['a', 'b']);
      expect(target).toEqual({ a: 1, b: 2 });
    });

    it('should not overwrite target properties that are not specified', () => {
      const source = { a: 1, b: 2, c: 3 };
      const target = { b: 10 };
      mergeProperties(target, source, ['a']);
      expect(target).toEqual({ a: 1, b: 10 });
    });

    it('should not overwrite target properties that are specified but do not exist in the source', () => {
      const source = { a: 1 };
      const target = { b: 10 };
      mergeProperties(target, source, ['a', 'b']);
      expect(target).toEqual({ a: 1, b: 10 });
    });

    it('should overwrite target properties even if they are `undefined` in the source', () => {
      const source = { a: undefined };
      const target = { a: 10 };
      mergeProperties(target, source, ['a']);
      expect(target).toEqual({ a: undefined });
    });
  });
});
