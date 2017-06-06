import { RootRenderer, RenderComponentType } from 'angular2/src/core/render/api';
import { ViewEncapsulation } from 'angular2/src/core/metadata/view';
export declare class ViewUtils {
    private _renderer;
    private _appId;
    private _nextCompTypeId;
    constructor(_renderer: RootRenderer, _appId: string);
    /**
     * Used by the generated code
     */
    createRenderComponentType(templateUrl: string, slotCount: number, encapsulation: ViewEncapsulation, styles: Array<string | any[]>): RenderComponentType;
}
export declare function flattenNestedViewRenderNodes(nodes: any[]): any[];
export declare function ensureSlotCount(projectableNodes: any[][], expectedSlotCount: number): any[][];
export declare const MAX_INTERPOLATION_VALUES: number;
export declare function interpolate(valueCount: number, c0: string, a1: any, c1: string, a2?: any, c2?: string, a3?: any, c3?: string, a4?: any, c4?: string, a5?: any, c5?: string, a6?: any, c6?: string, a7?: any, c7?: string, a8?: any, c8?: string, a9?: any, c9?: string): string;
export declare function checkBinding(throwOnChange: boolean, oldValue: any, newValue: any): boolean;
export declare function arrayLooseIdentical(a: any[], b: any[]): boolean;
export declare function mapLooseIdentical<V>(m1: {
    [key: string]: V;
}, m2: {
    [key: string]: V;
}): boolean;
export declare function castByValue<T>(input: any, value: T): T;
export declare const EMPTY_ARRAY: any[];
export declare const EMPTY_MAP: {};
export declare function pureProxy1<P0, R>(fn: (p0: P0) => R): (p0: P0) => R;
export declare function pureProxy2<P0, P1, R>(fn: (p0: P0, p1: P1) => R): (p0: P0, p1: P1) => R;
export declare function pureProxy3<P0, P1, P2, R>(fn: (p0: P0, p1: P1, p2: P2) => R): (p0: P0, p1: P1, p2: P2) => R;
export declare function pureProxy4<P0, P1, P2, P3, R>(fn: (p0: P0, p1: P1, p2: P2, p3: P3) => R): (p0: P0, p1: P1, p2: P2, p3: P3) => R;
export declare function pureProxy5<P0, P1, P2, P3, P4, R>(fn: (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4) => R): (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4) => R;
export declare function pureProxy6<P0, P1, P2, P3, P4, P5, R>(fn: (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5) => R): (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5) => R;
export declare function pureProxy7<P0, P1, P2, P3, P4, P5, P6, R>(fn: (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => R): (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => R;
export declare function pureProxy8<P0, P1, P2, P3, P4, P5, P6, P7, R>(fn: (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7) => R): (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7) => R;
export declare function pureProxy9<P0, P1, P2, P3, P4, P5, P6, P7, P8, R>(fn: (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7, p8: P8) => R): (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7, p8: P8) => R;
export declare function pureProxy10<P0, P1, P2, P3, P4, P5, P6, P7, P8, P9, R>(fn: (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7, p8: P8, p9: P9) => R): (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7, p8: P8, p9: P9) => R;
