import {NgModule, ModuleWithProviders} from '@angular/core';
import {MdSelect} from './select';
import {MdOption} from './option';
export * from './select';

@NgModule({
    imports: [],
    exports: [MdSelect, MdOption],
    declarations: [MdSelect, MdOption],
})
export class MdSelectModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: MdSelectModule,
            providers: []
        };
    }
}
