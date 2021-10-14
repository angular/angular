import {DocsMarkdownRenderer} from './docs-marked-renderer';

describe('DocsMarkdownRenderer', () => {
  let renderer: DocsMarkdownRenderer;
  beforeEach(() => {
    renderer = new DocsMarkdownRenderer();
  });

  it('generates regular headings for h1 and h2', () => {
    expect(renderer.heading('a', 1, 'ignored')).toEqual('<h1>a</h1>');
    expect(renderer.heading('b', 2, 'ignored')).toEqual('<h2>b</h2>');
  });

  it('creates header link for h3 and h4 headings', () => {
    const heading3 = renderer.heading('heading text', 3, 'link-id');
    expectEqualIgnoreLeadingWhitespace(
      heading3,
      `
        <h3 id="link-id" class="docs-header-link">
          <span header-link="link-id"></span>
          heading text
        </h3>
      `,
    );
    const heading4 = renderer.heading('heading text', 4, 'second-link-id');
    expectEqualIgnoreLeadingWhitespace(
      heading4,
      `
        <h4 id="second-link-id" class="docs-header-link">
          <span header-link="second-link-id"></span>
          heading text
        </h4>
      `,
    );
  });

  it('handles duplicate ids for headings', () => {
    expect(renderer.heading('first', 3, 'id')).toContain('id="id"');
    expect(renderer.heading('second', 3, 'id')).toContain('id="id-1"');
  });

  it('generates links', () => {
    expect(renderer.link('something', 'some title', 'some text')).toEqual(
      '<a href="guide/something" title="some title">some text</a>',
    );
    expect(renderer.link('guide/something', 'some title', 'some text')).toEqual(
      '<a href="guide/something" title="some title">some text</a>',
    );
    expect(renderer.link('#some-hash', 'some title', 'some text')).toEqual(
      '<a href="#some-hash" title="some title">some text</a>',
    );
    expect(renderer.link('http://google.com', 'some title', 'some text')).toEqual(
      '<a href="http://google.com" title="some title">some text</a>',
    );
  });

  it('generates html using new API', () => {
    const result = renderer.html(`<!-- example(
         {
          "example": "exampleName",
          "file": "example-html.html",
          "region": "some-region"
         }
        ) -->`);
    expectEqualIgnoreLeadingWhitespace(
      result,
      `<div material-docs-example="exampleName"
          file="example-html.html"
          region="some-region"></div>`,
    );
  });

  it('generates html using new API with no region', () => {
    const result = renderer.html(`<!-- example(
         {
          "example": "exampleName",
          "file": "example-html.html",
         }
        ) -->`);
    expectEqualIgnoreLeadingWhitespace(
      result,
      `<div material-docs-example="exampleName"
          file="example-html.html"></div>`,
    );
  });

  it('generates html using new API with no file and no region', () => {
    const result = renderer.html(`<!-- example(
         {
          "example": "exampleName",
         }
        ) -->`);
    expectEqualIgnoreLeadingWhitespace(result, `<div material-docs-example="exampleName"></div>`);
  });

  it('generates html using old API', () => {
    expect(renderer.html('<!-- example(name) -->')).toEqual(
      '<div material-docs-example="name"></div>',
    );
  });

  it('allows id links with matching id element', () => {
    let output = renderer.link('#my-id', 'link title', 'link text');
    output += renderer.heading('heading text', 3, 'my-id');
    const result = renderer.finalizeOutput(output, 'filename.html');
    expect(result).toEqual(jasmine.stringMatching(/<div class="docs-markdown"/));
  });

  it('does not allow id links with no matching id element', () => {
    spyOn(console, 'error');
    spyOn(process, 'exit');
    let output = renderer.link('#my-id', 'link title', 'link text');
    renderer.finalizeOutput(output, 'filename.html');
    expect((console.error as jasmine.Spy).calls.allArgs()).toEqual([
      [jasmine.stringMatching(/Could not process file: filename.html.*/)],
      [jasmine.stringMatching(/.*Found link to "my-id". This heading does not exist./)],
    ]);
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  function expectEqualIgnoreLeadingWhitespace(actual: string, expected: string) {
    expect(stripLeadingWhitespace(actual)).toEqual(stripLeadingWhitespace(expected));
  }

  function stripLeadingWhitespace(s: string) {
    return s.replace(/^\s*/gm, '');
  }
});
