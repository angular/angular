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

      docTypes = this.docTypes;


      docs = _.filter(docs, function(doc) {

        if (docTypes.indexOf(doc.docType) === -1) return true;
        if (!doc.publicModule) return false;

        updateModule(doc);

        return true;
      });

      docs = _.filter(docs, function(doc) {
        return doc.docType !== 'module' || doc.isPublic;
      });
      return docs;
    }
  };


  function updateModule(classDoc) {

    var originalModule = classDoc.moduleDoc;
    var publicModule = modules[classDoc.publicModule];

    if (!publicModule) {
      throw new Error('Missing module definition: "' + classDoc.publicModule + '"\n' +
                      'Referenced in class: "' + classDoc.moduleDoc.id + '/' + classDoc.name + '"');
    }

    publicModule.isPublic = true;

    _.remove(classDoc.moduleDoc.exports, function(doc) { return doc === classDoc; });
    classDoc.moduleDoc = publicModule;
    publicModule.exports.push(classDoc);

  }
};