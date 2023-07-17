
/**
 * This service is used by the autoLinkCode post-processor to filter out pipe docs
 * where the matching word is the pipe name and is not preceded by a pipe
 */
module.exports = function filterPipes() {
  return (docs, words, index) =>
    docs.filter(doc =>
      doc.docType !== 'pipe' ||
      doc.pipeOptions.name !== '\'' + words[index] + '\'' ||
      index === 0 ||
      words[index - 1].trim() === '|');
};
