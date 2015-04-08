var _ = require('lodash');

module.exports = function filterPublicDocs(modules) {
  return {
    $runAfter: ['tags-parsed'],
    $runBefore: ['computing-ids'],
    docTypes: [],
    $validate: {
      docTypes: { presence: true }
    },
    $process: function(docs) {

      var extraPublicDocs = [];
      docTypes = this.docTypes;

      _.forEach(docs, function(doc) {

        if (docTypes.indexOf(doc.docType) === -1 || !doc.publicModule) return;

        var publicModule = modules[doc.publicModule];

        if (!publicModule) {
          throw new Error('Missing module definition: "' + doc.publicModule + '"\n' +
                          'Referenced in class: "' + doc.moduleDoc.id + '/' + doc.name + '"');
        } else {

          // Ensure module is marked as public
          publicModule.isPublic = true;

          // Add a clone of export to its "public" module
          var publicDoc = _.clone(doc);
          publicDoc.moduleDoc = publicModule;
          publicModule.exports.push(publicDoc);
          extraPublicDocs.push(publicDoc);
        }
      });

      // Filter out the documents that are not public
      docs = _.filter(docs, function(doc) {

        if (doc.docType === 'module') {
          // doc is a module - is it public?
          return doc.isPublic;
        }

        if (docTypes.indexOf(doc.docType) === -1) {
          // doc is not a type we care about
          return true;
        }

        // doc is in a public module
        return doc.moduleDoc && doc.moduleDoc.isPublic;

      });

      docs = docs.concat(extraPublicDocs);

      return docs;
    }
  };


};