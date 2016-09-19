import {NgModule, ModuleWithProviders} from '@angular/core';
import {MdSelect} from './select';
export * from './select';

@NgModule({
    imports: [],
    exports: [MdSelect],
    declarations: [MdSelect],
})
export class MdSelectModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: MdSelectModule,
            providers: []
        };
    }
}
