/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ComponentType } from '../../../../../../../../protocol';
export declare class ComponentMetadataComponent {
    readonly currentSelectedComponent: import("@angular/core").InputSignal<ComponentType>;
    private _nestedProps;
    angularViewEncapsulationModes: string[];
    acxViewEncapsulationModes: string[];
    readonly controller: import("@angular/core").Signal<import("../../../property-resolver/directive-property-resolver").DirectivePropertyResolver | undefined>;
    readonly viewEncapsulation: import("@angular/core").Signal<string | undefined>;
    readonly changeDetectionStrategy: import("@angular/core").Signal<"OnPush" | "Default" | undefined>;
}
