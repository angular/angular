module.exports = function extractPipeParams(createDocMessage) {
  return {
    $runAfter: ['extractDecoratedClassesProcessor'],
    $runBefore: ['docs-processed'],
    $process(docs) {
      docs.forEach(doc => {
        if (doc.docType === 'pipe') {
          const transformFn = doc.members && doc.members.find(member => member.name === 'transform');
          if (!transformFn) {
            throw new Error(createDocMessage('Missing `transform` method - pipes must implement PipeTransform interface', doc));
          }
          doc.pipeName = doc.pipeOptions.name.replace(/^["']|["']$/g, '');
          doc.valueParam = transformFn.parameterDocs[0];
          doc.pipeParams = transformFn.parameterDocs.slice(1);
        }
      });
    }
  };
};
