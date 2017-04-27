const slug = require('rehype-slug');
const link = require('rehype-autolink-headings');

/**
 * Get remark to inject anchors into headings
 */
module.exports = [
  slug,
  [link, {
    properties: {
      title: 'Link to this heading',
      className: ['header-link'],
      'aria-hidden': 'true'
    },
    content: {
      type: 'element',
      tagName: 'i',
      properties: {className: ['material-icons']},
      children: [{ type: 'text', value: 'link' }]
    }
  }]
];
