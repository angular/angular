import {
  NESTED_FORMATTED_FLAMEGRAPH_RECORD,
  NESTED_RECORD,
  SIMPLE_FORMATTED_FLAMEGRAPH_RECORD,
  SIMPLE_FORMATTED_WEBTREEGRAPH_RECORD,
  SIMPLE_RECORD,
} from '../record-formatter-spec-constants';
import { AppEntry } from '../record-formatter';
import { WebtreegraphFormatter, WebtreegraphNode } from './webtreegraph-formatter';

const formatter = new WebtreegraphFormatter();

describe('addFrame cases', () => {
  let entry: AppEntry<WebtreegraphNode>;

  beforeEach(() => {
    entry = {
      app: [],
      timeSpent: 0,
      source: '',
    };
  });

  it('add frame for simple case', () => {
    formatter.addFrame(entry.app, SIMPLE_RECORD);
    expect(entry.app).toEqual(SIMPLE_FORMATTED_WEBTREEGRAPH_RECORD);
  });
});
