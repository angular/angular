import {
  addAttribute,
  visitElements,
  parseTemplate,
  replaceStartTag,
  replaceEndTag,
} from './tree-traversal';

function runTagNameDuplicationTest(html: string, result: string): void {
  visitElements(
    parseTemplate(html).nodes,
    node => {
      html = replaceEndTag(html, node, node.name.repeat(2));
    },
    node => {
      html = replaceStartTag(html, node, node.name.repeat(2));
    },
  );
  expect(html).toBe(result);
}

function runAddAttributeTest(html: string, result: string): void {
  visitElements(parseTemplate(html).nodes, undefined, node => {
    html = addAttribute(html, node, 'attr', 'val');
  });
  expect(html).toBe(result);
}

describe('#visitElements', () => {
  describe('tag name replacements', () => {
    it('should handle basic cases', async () => {
      runTagNameDuplicationTest('<a></a>', '<aa></aa>');
    });

    it('should handle multiple same line', async () => {
      runTagNameDuplicationTest('<a></a><b></b>', '<aa></aa><bb></bb>');
    });

    it('should handle multiple same line nested', async () => {
      runTagNameDuplicationTest('<a><b></b></a>', '<aa><bb></bb></aa>');
    });

    it('should handle multiple same line nested and unnested', async () => {
      runTagNameDuplicationTest('<a><b></b><c></c></a>', '<aa><bb></bb><cc></cc></aa>');
    });

    it('should handle multiple multi-line', async () => {
      runTagNameDuplicationTest(
        `
          <a></a>
          <b></b>
        `,
        `
          <aa></aa>
          <bb></bb>
        `,
      );
    });

    it('should handle multiple multi-line nested', async () => {
      runTagNameDuplicationTest(
        `
          <a>
            <b></b>
          </a>
        `,
        `
          <aa>
            <bb></bb>
          </aa>
        `,
      );
    });

    it('should handle multiple multi-line nested and unnested', async () => {
      runTagNameDuplicationTest(
        `
          <a>
            <b></b>
            <c></c>
          </a>
        `,
        `
          <aa>
            <bb></bb>
            <cc></cc>
          </aa>
        `,
      );
    });
  });

  describe('add attribute tests', () => {
    it('should handle single element', async () => {
      runAddAttributeTest('<a></a>', '<a attr="val"></a>');
    });

    it('should handle multiple unnested', async () => {
      runAddAttributeTest('<a></a><b></b>', '<a attr="val"></a><b attr="val"></b>');
    });

    it('should handle multiple nested', async () => {
      runAddAttributeTest('<a><b></b></a>', '<a attr="val"><b attr="val"></b></a>');
    });

    it('should handle multiple nested and unnested', async () => {
      runAddAttributeTest(
        '<a><b></b><c></c></a>',
        '<a attr="val"><b attr="val"></b><c attr="val"></c></a>',
      );
    });

    it('should handle adding multiple attrs to a single element', async () => {
      let html = '<a></a>';
      visitElements(parseTemplate(html).nodes, undefined, node => {
        html = addAttribute(html, node, 'attr1', 'val1');
        html = addAttribute(html, node, 'attr2', 'val2');
      });
      expect(html).toBe('<a attr2="val2" attr1="val1"></a>');
    });

    it('should replace value of existing attribute', async () => {
      runAddAttributeTest('<a attr="default"></a>', '<a attr="val"></a>');
    });

    it('should add value to existing attribute that does not have a value', async () => {
      runAddAttributeTest('<a attr></a>', '<a attr="val"></a>');
    });
  });

  it('should match indentation', async () => {
    runAddAttributeTest(
      `
        <a
          class="a"
          aria-label="a"
          aria-describedby="a"
        ></a>
      `,
      `
        <a
          attr="val"
          class="a"
          aria-label="a"
          aria-describedby="a"
        ></a>
      `,
    );
  });

  it('should match indentation w/ multiple attrs', async () => {
    let html = `
      <a
        class="a"
        aria-label="a"
        aria-describedby="a"
      ></a>
    `;
    visitElements(parseTemplate(html).nodes, undefined, node => {
      html = addAttribute(html, node, 'attr1', 'val1');
      html = addAttribute(html, node, 'attr2', 'val2');
    });
    expect(html).toBe(`
      <a
        attr2="val2"
        attr1="val1"
        class="a"
        aria-label="a"
        aria-describedby="a"
      ></a>
    `);
  });
});
