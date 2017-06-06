import { CompileIdentifierMetadata } from './compile_metadata';
export declare class CompilerConfig {
    genDebugInfo: boolean;
    logBindingUpdate: boolean;
    useJit: boolean;
    renderTypes: RenderTypes;
    constructor(genDebugInfo: boolean, logBindingUpdate: boolean, useJit: boolean, renderTypes?: RenderTypes);
}
/**
 * Types used for the renderer.
 * Can be replaced to specialize the generated output to a specific renderer
 * to help tree shaking.
 */
export declare abstract class RenderTypes {
    renderer: CompileIdentifierMetadata;
    renderText: CompileIdentifierMetadata;
    renderElement: CompileIdentifierMetadata;
    renderComment: CompileIdentifierMetadata;
    renderNode: CompileIdentifierMetadata;
    renderEvent: CompileIdentifierMetadata;
}
export declare class DefaultRenderTypes implements RenderTypes {
    renderer: CompileIdentifierMetadata;
    renderText: any;
    renderElement: any;
    renderComment: any;
    renderNode: any;
    renderEvent: any;
}
