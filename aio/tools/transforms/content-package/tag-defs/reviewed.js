/**
 * @reviewed <date-string>
 *
 * Use this tag-def to indicate the date when this document was last reviewed.
 * The date-string will be passed to the `Date()` constructor.
 */
module.exports = function(createDocMessage) {
  return {
    name: 'reviewed',
    transforms(doc, tag, value) {
      if (!/^\d{4}-\d{1,2}-\d{1,2}/.test(value.trim())) {
        throw new Error(createDocMessage(
          `Tag Error: @${tag.tagName} tag is missing the required date in the form "yyyy-mm-dd" but got "${value}"\n`,
          doc));
      }
      return {
        date: new Date(value),
      };
    }
  };
};
