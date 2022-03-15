const visit = require('unist-util-visit');
const is = require('hast-util-is-element');
const source = require('unist-util-source');

/**
 * Add the width and height of the image to the `img` tag if they are
 * not already provided. This helps prevent jank when the page is
 * rendered before the image has downloaded.
 *
 * If there is no `src` attribute on an image, or it is not possible
 * to load the image file indicated by the `src` then a warning is emitted.
 */
module.exports = function addImageDimensions(getImageDimensions) {
  return function addImageDimensionsImpl()  {
    return (ast, file) => {
      visit(ast, node => {

        if (!is(node, 'img')) {
          return;
        }

        const props = node.properties;
        const src = props.src;
        if (!src) {
          file.message('Missing src in image tag `' + source(node, file) + '`');
          return;
        }

        try {
          const dimensions = getImageDimensions(addImageDimensionsImpl.basePaths, src);
          if (props.width === undefined && props.height === undefined) {
            props.width = '' + dimensions.width;
            props.height = '' + dimensions.height;
          }
        } catch(e) {
          if (e.code === 'ENOENT') {
            file.fail('Unable to load src in image tag `' + source(node, file) + '`');
          } else {
            file.fail(e.message);
          }
        }
      });
    };
  };
};
