import { EnvironmentInjector } from '../di/r3_injector';
import { OnDestroy } from '../interface/lifecycle_hooks';
import { ComponentDef } from './interfaces/definition';
/**
 * A service used by the framework to create instances of standalone injectors. Those injectors are
 * created on demand in case of dynamic component instantiation and contain ambient providers
 * collected from the imports graph rooted at a given standalone component.
 */
export declare class StandaloneService implements OnDestroy {
    private _injector;
    cachedInjectors: Map<ComponentDef<unknown>, EnvironmentInjector | null>;
    constructor(_injector: EnvironmentInjector);
    getOrCreateStandaloneInjector(componentDef: ComponentDef<unknown>): EnvironmentInjector | null;
    ngOnDestroy(): void;
    /** @nocollapse */
    static ɵprov: unknown;
}
