import { ProfilerFrame } from 'protocol';

export interface RecordFormatter {
  format: (records: ProfilerFrame[]) => any;
}
