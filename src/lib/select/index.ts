import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdSelect} from './select';
import {MdOption} from './option';
import {OverlayModule} from '../core/overlay/overlay-directives';
import {MdRippleModule} from '../core/ripple/ripple';
import {OVERLAY_PROVIDERS} from '../core/overlay/overlay';
export * from './select';

@NgModule({
    imports: [CommonModule, OverlayModule, MdRippleModule],
    exports: [MdSelect, MdOption],
    declarations: [MdSelect, MdOption],
})
export class MdSelectModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: MdSelectModule,
            providers: [OVERLAY_PROVIDERS]
        };
    }
}
