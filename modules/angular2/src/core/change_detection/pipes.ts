import {PipeTransform} from './pipe_transform';

export interface Pipes { get(name: string): PipeTransform; }