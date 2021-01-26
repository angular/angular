/**
 * @reviewed <date-string>
 *
 * Use this tag-def to indicate the date when this document was last reviewed.
 * The date-string will be passed to the `Date()` constructor.
 */
module.exports = function() {
  return {
    name: 'reviewed',
    transforms(doc, tag, value) {
      return {
        date: new Date(value),
      };
    }
  };
};
