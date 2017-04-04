const INLINE_TAG = /(\{@[^\s\}]+[^\}]*\})/;

/**
 * ShowdownJS does not understand JS doc inline tags so processes them like normal text.
 * This can result in weirdness:
 *
 * ```
 * {@link my_path/my_file}
 * ```
 *
 * ends up as
 *
 * ```
 * {@link my<em>path/my</em>file}
 * ```
 *
 * This hack searches for inline tags and effectively prevents ShowdownJS from parsing them
 */
module.exports = function() {

  const tags = [];

  return [
    {
      type: 'lang',
      regex: INLINE_TAG,
      replace: (match) => {
        tags.push(match);
        const i = tags.length - 1;
        return `%%INLINETAG${i}%%`;
      }
    },
    {
      type: 'output',
      filter: (text) => {
        tags.forEach((tag, i) => {
          const r = new RegExp(`(<p>)?%%INLINETAG${i}%%(</p>)?`);
          text = text.replace(r, function(match, start) {
            let output = tag;
            if (start) {
              output = `<div>${output}</div>`;
            }
            return output;
          });
        });
        return text;
      }
    }
  ];
};
