import {visitElements, parseTemplate, replaceStartTag, replaceEndTag} from './tree-traversal';

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
});
