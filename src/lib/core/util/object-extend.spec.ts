import {extendObject} from './object-extend';


describe('extendObject', () => {
  it('should extend an object', () => {
    let extended = extendObject({}, {x: 123});

    expect(extended).toEqual({x: 123});
  });

  it('should overwrite existing properties', () => {
    let extended = extendObject({x: 456}, {x: 123});

    expect(extended).toEqual({x: 123});
  });

  it('should add additional properties', () => {
    let extended = extendObject({x: 456}, {y: 123});

    expect(extended).toEqual({x: 456, y: 123});
  });

  it('should extend from multiple sources', () => {
    let extended = extendObject({}, {x: 123}, {y: 456});

    expect(extended).toEqual({x: 123, y: 456});
  });

  it('should overwrite properties from the later source', () => {
    let extended = extendObject({}, {x: 123}, {x: 456});

    expect(extended).toEqual({x: 456});
  });

  it('should treat null and undefined sources as empty objects', () => {
    let extended = extendObject({}, null, {x: 123}, undefined, {y: 456});

    expect(extended).toEqual({x: 123, y: 456});
  });

  it('should throw an error when the dest object is null', () => {
    expect(() => extendObject(null, {x: 123}))
        .toThrowError('Cannot convert undefined or null to object');
  });

  it('should throw an error when the dest object is undefined', () => {
    expect(() => extendObject(undefined, {x: 123}))
        .toThrowError('Cannot convert undefined or null to object');
  });
});
