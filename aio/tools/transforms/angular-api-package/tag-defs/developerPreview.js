/**
 * Use this tag to indicate that an API is in Developer Preview. 
 */
 module.exports = function() {
  return {
    name: 'developerPreview',
    transforms: function() { return true; }
  };
};
