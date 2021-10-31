/**
 * Documents attributes that can appear on "special elements", such as `select` on `<ng-content>`.
 *
 * For example:
 *
 * ```
 * @elementAttribute select="selector"
 *
 * Only select elements from the projected content that match the given CSS `selector`.
 * ```
 */
module.exports = function() {
  return {
    name: 'elementAttribute',
    docProperty: 'attributes',
    multi: true,
    transforms(doc, tag, value) {
      const startOfDescription = value.indexOf('\n');
      const name = value.substring(0, startOfDescription).trim();
      const description = value.substring(startOfDescription).trim();
      return {name, description};
    }
  };
};
