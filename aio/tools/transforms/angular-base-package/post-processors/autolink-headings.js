const has = require('hast-util-has-property');
const is = require('hast-util-is-element');
const slug = require('rehype-slug');
const visit = require('unist-util-visit');

/**
 * Get remark to add IDs to headings and inject anchors into them.
 * This is a stripped-down equivalent of [rehype-autolink-headings](https://github.com/wooorm/rehype-autolink-headings)
 * that supports ignoring headings with the `no-anchor` class.
 */
const HEADINGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
const NO_ANCHOR_CLASS = 'no-anchor';

const clone = obj => JSON.parse(JSON.stringify(obj));
const hasClass = (node, cls) => {
  const className = node.properties.className;
  return className && className.includes(cls);
};

const link = options =>
  tree => visit(tree, node => {
    if (is(node, HEADINGS) && has(node, 'id') && !hasClass(node, NO_ANCHOR_CLASS)) {
      node.children.push({
        type: 'element',
        tagName: 'a',
        properties: Object.assign(clone(options.properties), {href: `#${node.properties.id}`}),
        children: clone(options.content)
      });
    }
  });

module.exports = [
  slug,
  [link, {
    properties: {
      title: 'Link to this heading',
      className: ['header-link'],
      'aria-hidden': 'true'
    },
    content: [
      {
        type: 'element',
        tagName: 'i',
        properties: {className: ['material-icons']},
        children: [{ type: 'text', value: 'link' }]
      }
    ]
  }]
];
