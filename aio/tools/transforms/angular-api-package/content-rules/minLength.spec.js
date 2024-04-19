const createMinLengthRule = require('./minLength');

describe('createMinLength rule', () => {

  const defaultRule = createMinLengthRule();
  const atLeast5CharsRule = createMinLengthRule(5);

  it('should return `undefined` if the length of the property value is long enough', () => {
    expect(defaultRule({}, 'description', 'abc')).toBeUndefined();
    expect(atLeast5CharsRule({}, 'description', 'abcde')).toBeUndefined();
  });

  it('should return an error message if length of the property value is not long enough', () => {
    expect(defaultRule({}, 'description', 'a'))
      .toEqual('Invalid "description" property: "a". It must have at least 2 characters.');
    expect(atLeast5CharsRule({}, 'description', 'abcd'))
      .toEqual('Invalid "description" property: "abcd". It must have at least 5 characters.');
  });
});
