const renderMarkdownFactory = require('./renderMarkdown');

describe('remark: renderMarkdown service', () => {
  let renderMarkdown;
  beforeEach(() => {
    renderMarkdown = renderMarkdownFactory();
  });

  it('should convert markdown to HTML', () => {
    const content = '# heading 1\n' +
        '\n' +
        'A paragraph with **bold** and _italic_.\n' +
        '\n' +
        '* List item 1\n' +
        '* List item 2';
    const output = renderMarkdown(content);

    expect(output).toEqual(
        '<h1>heading 1</h1>\n' +
        '<p>A paragraph with <strong>bold</strong> and <em>italic</em>.</p>\n' +
        '<ul>\n' +
        '<li>List item 1</li>\n' +
        '<li>List item 2</li>\n' +
        '</ul>\n');
  });

  it('should not process markdown inside inline tags', () => {
    const content = '* list item {@link some_url_path}';
    const output = renderMarkdown(content);
    expect(output).toEqual('<ul>\n<li>list item {@link some_url_path}</li>\n</ul>\n');
  });

  it('should not put block level inline tags inside paragraphs', () => {
    const content = 'A paragraph.\n' +
        '\n' +
        '{@example blah **blah** blah }\n' +
        '\n' +
        'Another paragraph {@link _containing_ } an inline tag';
    const output = renderMarkdown(content);
    expect(output).toEqual(
        '<p>A paragraph.</p>\n' +
        '{@example blah **blah** blah }\n' +
        '<p>Another paragraph {@link _containing_ } an inline tag</p>\n');
  });

  it('should not format the contents of tags marked as unformatted ', () => {
    const content = '<code-example>\n\n  **abc**\n\n  def\n</code-example>\n\n<code-tabs><code-pane>\n\n  **abc**\n\n  def\n</code-pane></code-tabs>';
    const output = renderMarkdown(content);
    expect(output).toEqual('<code-example>\n\n  **abc**\n\n  def\n</code-example>\n<code-tabs><code-pane>\n\n  **abc**\n\n  def\n</code-pane></code-tabs>\n');
  });

  it('should handle recursive tags marked as unformatted', () => {
    const content = '<code-example>\n\n  <code-example>\n\n  **abc**\n\n  def\n\n</code-example>\n\n</code-example>\n\nhij\n\n<code-example>\n\nklm</code-example>';
    const output = renderMarkdown(content);
    expect(output).toEqual('<code-example>\n\n  <code-example>\n\n  **abc**\n\n  def\n\n</code-example>\n\n</code-example>\n<p>hij</p>\n<code-example>\n\nklm</code-example>\n');
  });

  it('should raise an error if a tag marked as unformatted is not closed', () => {
    const content = '<code-example path="xxx">\n\n  **abc**\n\n  def\n<code-example>\n\n\n\n  **abc**\n\n  def\n</code-example>';
    expect(() => renderMarkdown(content)).toThrowError('Unmatched plain HTML block tag <code-example path="xxx">');
  });

  it('should not remove spaces after anchor tags', () => {
    var input =
        'A aa aaa aaaa aaaaa aaaaaa aaaaaaa aaaaaaaa aaaaaaaaa aaaaaaaaaa aaaaaaaaaaa\n' +
        '[foo](path/to/foo) bbb.';
    var output =
        '<p>' +
        'A aa aaa aaaa aaaaa aaaaaa aaaaaaa aaaaaaaa aaaaaaaaa aaaaaaaaaa aaaaaaaaaaa\n' +
        '<a href="path/to/foo">foo</a> bbb.' +
        '</p>\n';

    expect(renderMarkdown(input)).toEqual(output);
  });

  it('should not format indented text as code', () => {
    const content = 'some text\n\n    indented text\n\nother text';
    const output = renderMarkdown(content);
    expect(output).toEqual('<p>some text</p>\n<p>    indented text</p>\n<p>other text</p>\n');
  });

  it('should format triple backtick code blocks as `code-example` tags', () => {
    const content =
    '```ts\n' +
    '  class MyClass {\n' +
    '    method1() { ... }\n' +
    '  }\n' +
    '```';
    const output = renderMarkdown(content);
    expect(output).toEqual(
    '<code-example language="ts">\n' +
    '  class MyClass {\n' +
    '    method1() { ... }\n' +
    '  }\n' +
    '</code-example>\n'
    );
  });
});
