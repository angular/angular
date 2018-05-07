const createNoMarkdownHeadings = require('./noMarkdownHeadings');

describe('createNoMarkdownHeadings rule', () => {

  const noMarkdownHeadings = createNoMarkdownHeadings();

  it('should return `undefined` if there is no heading in a value', () => {
    expect(noMarkdownHeadings({}, 'description', 'some ## text'))
      .toBeUndefined();
  });

  it('should return an error message if there is a markdown heading in a single line value', () => {
    expect(noMarkdownHeadings({}, 'description', '# heading 1'))
        .toEqual('Invalid headings found in "description" property: "# heading 1".');
  });

  it('should return an error message if there is a markdown heading in a multiline value', () => {
    expect(noMarkdownHeadings({}, 'description', 'some text\n# heading 1'))
        .toEqual('Invalid headings found in "description" property: "# heading 1".');
  });

  it('should cope with up to 3 spaces before the heading marker', () => {
    expect(noMarkdownHeadings({}, 'description', ' # heading 1'))
        .toEqual('Invalid headings found in "description" property: " # heading 1".');
    expect(noMarkdownHeadings({}, 'description', '  # heading 1'))
        .toEqual('Invalid headings found in "description" property: "  # heading 1".');
    expect(noMarkdownHeadings({}, 'description', '   # heading 1'))
        .toEqual('Invalid headings found in "description" property: "   # heading 1".');
  });

  it('should return an error message for each heading found', () => {
    expect(noMarkdownHeadings({}, 'description', '# heading 1\nsome text\n## heading 2\nmore text\n### heading 3'))
        .toEqual('Invalid headings found in "description" property: "# heading 1", "## heading 2" and "### heading 3".');
  });

  describe('(specified heading levels)', () => {
    it('should take heading levels into account', () => {
      const noTopLevelHeadings = createNoMarkdownHeadings(1);
      expect(noTopLevelHeadings({}, 'description', '# top level'))
        .toEqual('Invalid headings found in "description" property: "# top level".');
      expect(noTopLevelHeadings({}, 'description', '## second level'))
        .toBeUndefined();
      expect(noTopLevelHeadings({}, 'description', '### third level'))
        .toBeUndefined();
      expect(noTopLevelHeadings({}, 'description', '#### fourth level'))
        .toBeUndefined();

      const allowLevel3Headings = createNoMarkdownHeadings(1, 2, '4,');
      expect(allowLevel3Headings({}, 'description', '# top level'))
        .toEqual('Invalid headings found in "description" property: "# top level".');
      expect(allowLevel3Headings({}, 'description', '## second level'))
        .toEqual('Invalid headings found in "description" property: "## second level".');
      expect(allowLevel3Headings({}, 'description', '### third level'))
        .toBeUndefined();
      expect(allowLevel3Headings({}, 'description', '#### fourth level'))
      .toEqual('Invalid headings found in "description" property: "#### fourth level".');
    });
  });
});
