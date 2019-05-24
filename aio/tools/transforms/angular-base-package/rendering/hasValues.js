module.exports = function hasValues() {
  return {
    name: 'hasValues',
    process: function(list, property) {
      if (!list || !Array.isArray(list)) return false;
      return list.some(item => readProperty(item, property.split('.'), 0));
    }
  };
};

/**
 * Search deeply into an object via a collection of property segments, starting at the
 * indexed segment.
 *
 * E.g. if `obj = { a: { b: { c: 10 }}}` then
 *  `readProperty(obj, ['a', 'b', 'c'], 0)` will return true;
 * but
 *  `readProperty(obj, ['a', 'd'], 0)` will return false;
 */
function readProperty(obj, propertySegments, index) {
  const value = obj[propertySegments[index]];
  return !!value && (index === propertySegments.length - 1 || readProperty(value, propertySegments, index + 1));
}
