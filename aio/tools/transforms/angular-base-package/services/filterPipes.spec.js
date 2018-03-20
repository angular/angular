const filterPipes = require('./filterPipes')();

describe('filterPipes', () => {
  it('should ignore docs that are not pipes', () => {
    const docs = [{ docType: 'class', name: 'B', pipeOptions: { name: '\'b\'' } }];
    const words = ['A', 'b', 'B', 'C'];
    const filteredDocs = [{ docType: 'class', name: 'B', pipeOptions: { name: '\'b\'' } }];
    expect(filterPipes(docs, words, 1)).toEqual(filteredDocs);
    expect(filterPipes(docs, words, 2)).toEqual(filteredDocs);
  });

  it('should ignore docs that are pipes but do not match the pipe name', () => {
    const docs = [{ docType: 'pipe', name: 'B', pipeOptions: { name: '\'b\'' } }];
    const words = ['A', 'B', 'C'];
    const filteredDocs = [{ docType: 'pipe', name: 'B', pipeOptions: { name: '\'b\'' } }];
    expect(filterPipes(docs, words, 1)).toEqual(filteredDocs);
  });

  it('should ignore docs that are pipes, match the pipe name and are preceded by a pipe character', () => {
    const docs = [{ docType: 'pipe', name: 'B', pipeOptions: { name: '\'b\'' } }];
    const words = ['A', '|', 'b', 'C'];
    const filteredDocs = [{ docType: 'pipe', name: 'B', pipeOptions: { name: '\'b\'' } }];
    expect(filterPipes(docs, words, 2)).toEqual(filteredDocs);
  });

  it('should filter out docs that are pipes, match the pipe name but are not preceded by a pipe character', () => {
    const docs = [
      { docType: 'pipe', name: 'B', pipeOptions: { name: '\'b\'' } },
      { docType: 'class', name: 'B' }
    ];
    const words = ['A', 'b', 'C'];
    const index = 1;
    const filteredDocs = [{ docType: 'class', name: 'B' }];
    expect(filterPipes(docs, words, index)).toEqual(filteredDocs);
  });
});
