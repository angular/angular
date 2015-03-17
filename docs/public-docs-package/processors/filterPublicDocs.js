var _ = require('lodash');

module.exports = function filterPublicDocs(modules) {
  return {
    $runAfter: ['tags-parsed'],
    $runBefore: ['computing-ids'],
    $process: function(docs) {

      //console.log('filterPublicDocs', Object.keys(modules));


      docs = _.filter(docs, function(doc) {
        if (doc.docType !== 'class') return true;
        if (!doc.publicModule) return false;

        //console.log('CLASS:', doc.name, doc.moduleDoc.id);
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

    //console.log('UPDATE CLASS', classDoc.id, originalModule.id, publicModule.id);

    _.remove(classDoc.moduleDoc.exports, function(doc) { return doc === classDoc; });
    classDoc.moduleDoc = publicModule;
    publicModule.exports.push(classDoc);

  }
};