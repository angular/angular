import { PipeTransform } from './pipe_transform';
export interface Pipes {
    get(name: string): SelectedPipe;
}
export declare class SelectedPipe {
    pipe: PipeTransform;
    pure: boolean;
    constructor(pipe: PipeTransform, pure: boolean);
}
