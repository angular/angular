/**
 * The point of this reader is to tag all the files that are going to be used as examples in the
 * documentation.
 * Later on we can extract the regions, via "shredding"; and we can also construct runnable examples
 * for passing to Stackblitz and the like.
 */
module.exports = function exampleFileReader() {
  return {
    name: 'exampleFileReader',
    getDocs: function(fileInfo) {
      return [{docType: 'example-file', content: fileInfo.content, startingLine: 1}];
    }
  };
};
