const CODE_EXAMPLES = /<([a-zA-Z]+-[a-zA-Z-]*)\b[\s\S]*?>[^<]*<\/\1>/g;

/**
 * ShowdownJS does not understand custom element so wraps the start and end
 * tags in a paragraphs:
 * ```
 * <p><code-example></p>
 * <p></code-example></p>
 * ```
 *
 * This hack searches for custom tags and effectively prevents ShowdownJS from parsing them
 */
module.exports = function() {

  const tags = [];

  return [
    {
      type: 'lang',
      regex: CODE_EXAMPLES,
      replace: (match) => {
        tags.push(match);
        const i = tags.length - 1;
        return `%%CUSTOMTAGS${i}%%`;
      }
    },
    {
      type: 'output',
      filter: (text) => {
        tags.forEach((tag, i) => {
          const r = new RegExp(`<p>%%CUSTOMTAGS${i}%%</p>`);
          text = text.replace(r, tag);
        });
        return text;
      }
    }
  ];
};
