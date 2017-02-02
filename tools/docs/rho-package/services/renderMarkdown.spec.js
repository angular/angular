const renderMarkdownFactory = require('./renderMarkdown');
const renderMarkdown = renderMarkdownFactory();

describe('rho: renderMarkdown service', () => {
  it('should convert markdown to HTML', () => {
    const content = '# heading 1\n' +
        '\n' +
        'A paragraph with *bold* and _italic_.\n' +
        '\n' +
        '* List item 1\n' +
        '* List item 2';
    const output = renderMarkdown(content);

    expect(output).toEqual(
        '<h1>heading 1</h1>\n' +
        '<p>A paragraph with <strong>bold</strong> and <em>italic</em>.</p>\n' +
        '<ul>\n' +
        '  <li>List item 1</li>\n' +
        '  <li>List item 2</li>\n' +
        '</ul>\n');
  });

  it('should not process markdown inside inline tags', () => {
    const content = '# heading {@link some_url_path}';
    const output = renderMarkdown(content);
    expect(output).toEqual('<h1>heading {@link some_url_path}</h1>\n');
  });

  it('should not put block level inline tags inside paragraphs', () => {
    const content = 'A paragraph.\n' +
        '\n' +
        '{@example blah **blah** blah }\n' +
        '\n' +
        'Another paragraph';
    const output = renderMarkdown(content);
    expect(output).toEqual(
        '<p>A paragraph.</p>\n' +
        '<div>{@example blah **blah** blah }</div>\n' +
        '<p>Another paragraph</p>\n');
  });
});
