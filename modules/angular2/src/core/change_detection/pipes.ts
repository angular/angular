import {PipeTransform} from './pipe_transform';

export interface Pipes { get(name: string): SelectedPipe; }

export class SelectedPipe {
  constructor(public pipe: PipeTransform, public pure: boolean) {}
}