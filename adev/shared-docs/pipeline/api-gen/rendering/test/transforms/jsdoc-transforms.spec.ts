import {addHtmlAdditionalLinks} from '../../transforms/jsdoc-transforms';

// @ts-ignore This compiles fine, but Webstorm doesn't like the ESM import in a CJS context.
describe('jsdoc transforms', () => {
  it('should transform links', () => {
    const entry = addHtmlAdditionalLinks({
      jsdocTags: [
        {
          name: 'see',
          comment: '[Angular](https://angular.io)',
        },
        {
          name: 'see',
          comment: '[Angular](https://angular.io "Angular")',
        },
        {
          name: 'see',
          comment: '{@link Route}',
        },
        {
          name: 'see',
          comment: '{@link Route Something else}',
        },
      ],
      moduleName: 'test',
    });

    expect(entry.additionalLinks[0]).toEqual({
      label: 'Angular',
      url: 'https://angular.io',
      title: undefined,
    });

    expect(entry.additionalLinks[1]).toEqual({
      label: 'Angular',
      url: 'https://angular.io',
      title: 'Angular',
    });

    expect(entry.additionalLinks[2]).toEqual({
      label: 'Route',
      url: 'api/test/Route',
    });

    expect(entry.additionalLinks[3]).toEqual({
      label: 'Something else',
      url: 'api/test/Route',
    });
  });
});
