import { InsertionTrie } from './insertion-trie';

describe('InsertionTrie', () => {
  it('should insert and verify existence', () => {
    const trie = new InsertionTrie();
    trie.insert([]);
    expect(trie.exists([])).toBeTrue();

    expect(trie.exists([1, 2])).toBeFalse();
    trie.insert([1, 2]);
    expect(trie.exists([1, 2])).toBeTrue();

    expect(trie.exists([1])).toBeFalse();
    trie.insert([1]);
    expect(trie.exists([1])).toBeTrue();

    expect(trie.exists([1, 1])).toBeFalse();
    trie.insert([1, 1]);
    expect(trie.exists([1, 1])).toBeTrue();

    expect(trie.exists([2, 1])).toBeFalse();
    trie.insert([2, 1]);
    expect(trie.exists([2, 1])).toBeTrue();
  });
});
