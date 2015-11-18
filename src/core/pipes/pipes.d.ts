import { Injector } from 'angular2/src/core/di';
import { PipeProvider } from './pipe_provider';
import * as cd from 'angular2/src/core/change_detection/pipes';
export declare class ProtoPipes {
    /**
    * Map of {@link PipeMetadata} names to {@link PipeMetadata} implementations.
    */
    config: {
        [key: string]: PipeProvider;
    };
    static fromProviders(providers: PipeProvider[]): ProtoPipes;
    constructor(
        /**
        * Map of {@link PipeMetadata} names to {@link PipeMetadata} implementations.
        */
        config: {
        [key: string]: PipeProvider;
    });
    get(name: string): PipeProvider;
}
export declare class Pipes implements cd.Pipes {
    proto: ProtoPipes;
    injector: Injector;
    constructor(proto: ProtoPipes, injector: Injector);
    get(name: string): cd.SelectedPipe;
}
