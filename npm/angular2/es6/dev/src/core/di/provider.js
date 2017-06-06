import { normalizeBool, isType, isBlank, isFunction, stringify } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
/**
 * Describes how the {@link Injector} should instantiate a given token.
 *
 * See {@link provide}.
 *
 * ### Example ([live demo](http://plnkr.co/edit/GNAyj6K6PfYg2NBzgwZ5?p%3Dpreview&p=preview))
 *
 * ```javascript
 * var injector = Injector.resolveAndCreate([
 *   new Provider("message", { useValue: 'Hello' })
 * ]);
 *
 * expect(injector.get("message")).toEqual('Hello');
 * ```
 * @ts2dart_const
 */
export class Provider {
    constructor(token, { useClass, useValue, useExisting, useFactory, deps, multi }) {
        this.token = token;
        this.useClass = useClass;
        this.useValue = useValue;
        this.useExisting = useExisting;
        this.useFactory = useFactory;
        this.dependencies = deps;
        this._multi = multi;
    }
    // TODO: Provide a full working example after alpha38 is released.
    /**
     * Creates multiple providers matching the same token (a multi-provider).
     *
     * Multi-providers are used for creating pluggable service, where the system comes
     * with some default providers, and the user can register additional providers.
     * The combination of the default providers and the additional providers will be
     * used to drive the behavior of the system.
     *
     * ### Example
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   new Provider("Strings", { useValue: "String1", multi: true}),
     *   new Provider("Strings", { useValue: "String2", multi: true})
     * ]);
     *
     * expect(injector.get("Strings")).toEqual(["String1", "String2"]);
     * ```
     *
     * Multi-providers and regular providers cannot be mixed. The following
     * will throw an exception:
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   new Provider("Strings", { useValue: "String1", multi: true }),
     *   new Provider("Strings", { useValue: "String2"})
     * ]);
     * ```
     */
    get multi() { return normalizeBool(this._multi); }
}
/**
 * See {@link Provider} instead.
 *
 * @deprecated
 * @ts2dart_const
 */
export class Binding extends Provider {
    constructor(token, { toClass, toValue, toAlias, toFactory, deps, multi }) {
        super(token, {
            useClass: toClass,
            useValue: toValue,
            useExisting: toAlias,
            useFactory: toFactory,
            deps: deps,
            multi: multi
        });
    }
    /**
     * @deprecated
     */
    get toClass() { return this.useClass; }
    /**
     * @deprecated
     */
    get toAlias() { return this.useExisting; }
    /**
     * @deprecated
     */
    get toFactory() { return this.useFactory; }
    /**
     * @deprecated
     */
    get toValue() { return this.useValue; }
}
/**
 * Creates a {@link Provider}.
 *
 * To construct a {@link Provider}, bind a `token` to either a class, a value, a factory function,
 * or
 * to an existing `token`.
 * See {@link ProviderBuilder} for more details.
 *
 * The `token` is most commonly a class or {@link OpaqueToken-class.html}.
 *
 * @deprecated
 */
export function bind(token) {
    return new ProviderBuilder(token);
}
/**
 * Helper class for the {@link bind} function.
 */
export class ProviderBuilder {
    constructor(token) {
        this.token = token;
    }
    /**
     * Binds a DI token to a class.
     *
     * ### Example ([live demo](http://plnkr.co/edit/ZpBCSYqv6e2ud5KXLdxQ?p=preview))
     *
     * Because `toAlias` and `toClass` are often confused, the example contains
     * both use cases for easy comparison.
     *
     * ```typescript
     * class Vehicle {}
     *
     * class Car extends Vehicle {}
     *
     * var injectorClass = Injector.resolveAndCreate([
     *   Car,
     *   provide(Vehicle, {useClass: Car})
     * ]);
     * var injectorAlias = Injector.resolveAndCreate([
     *   Car,
     *   provide(Vehicle, {useExisting: Car})
     * ]);
     *
     * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
     * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
     *
     * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
     * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
     * ```
     */
    toClass(type) {
        if (!isType(type)) {
            throw new BaseException(`Trying to create a class provider but "${stringify(type)}" is not a class!`);
        }
        return new Provider(this.token, { useClass: type });
    }
    /**
     * Binds a DI token to a value.
     *
     * ### Example ([live demo](http://plnkr.co/edit/G024PFHmDL0cJFgfZK8O?p=preview))
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   provide('message', {useValue: 'Hello'})
     * ]);
     *
     * expect(injector.get('message')).toEqual('Hello');
     * ```
     */
    toValue(value) { return new Provider(this.token, { useValue: value }); }
    /**
     * Binds a DI token to an existing token.
     *
     * Angular will return the same instance as if the provided token was used. (This is
     * in contrast to `useClass` where a separate instance of `useClass` will be returned.)
     *
     * ### Example ([live demo](http://plnkr.co/edit/uBaoF2pN5cfc5AfZapNw?p=preview))
     *
     * Because `toAlias` and `toClass` are often confused, the example contains
     * both use cases for easy comparison.
     *
     * ```typescript
     * class Vehicle {}
     *
     * class Car extends Vehicle {}
     *
     * var injectorAlias = Injector.resolveAndCreate([
     *   Car,
     *   provide(Vehicle, {useExisting: Car})
     * ]);
     * var injectorClass = Injector.resolveAndCreate([
     *   Car,
     *   provide(Vehicle, {useClass: Car})
     * ]);
     *
     * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
     * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
     *
     * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
     * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
     * ```
     */
    toAlias(aliasToken) {
        if (isBlank(aliasToken)) {
            throw new BaseException(`Can not alias ${stringify(this.token)} to a blank value!`);
        }
        return new Provider(this.token, { useExisting: aliasToken });
    }
    /**
     * Binds a DI token to a function which computes the value.
     *
     * ### Example ([live demo](http://plnkr.co/edit/OejNIfTT3zb1iBxaIYOb?p=preview))
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   provide(Number, {useFactory: () => { return 1+2; }}),
     *   provide(String, {useFactory: (v) => { return "Value: " + v; }, deps: [Number]})
     * ]);
     *
     * expect(injector.get(Number)).toEqual(3);
     * expect(injector.get(String)).toEqual('Value: 3');
     * ```
     */
    toFactory(factory, dependencies) {
        if (!isFunction(factory)) {
            throw new BaseException(`Trying to create a factory provider but "${stringify(factory)}" is not a function!`);
        }
        return new Provider(this.token, { useFactory: factory, deps: dependencies });
    }
}
/**
 * Creates a {@link Provider}.
 *
 * See {@link Provider} for more details.
 *
 * <!-- TODO: improve the docs -->
 */
export function provide(token, { useClass, useValue, useExisting, useFactory, deps, multi }) {
    return new Provider(token, {
        useClass: useClass,
        useValue: useValue,
        useExisting: useExisting,
        useFactory: useFactory,
        deps: deps,
        multi: multi
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9kaS9wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTyxFQUNMLGFBQWEsRUFFYixNQUFNLEVBQ04sT0FBTyxFQUNQLFVBQVUsRUFDVixTQUFTLEVBQ1YsTUFBTSwwQkFBMEI7T0FDMUIsRUFBQyxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7QUFFNUQ7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBQ0g7SUFrSUUsWUFBWSxLQUFLLEVBQUUsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFPM0U7UUFDQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUMvQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUN6QixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUN0QixDQUFDO0lBRUQsa0VBQWtFO0lBQ2xFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BNEJHO0lBQ0gsSUFBSSxLQUFLLEtBQWMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdELENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILDZCQUE2QixRQUFRO0lBQ25DLFlBQVksS0FBSyxFQUFFLEVBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFL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RjtJQUNDLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUU7UUFDekIsUUFBUSxFQUFFLFFBQVE7UUFDbEIsUUFBUSxFQUFFLFFBQVE7UUFDbEIsV0FBVyxFQUFFLFdBQVc7UUFDeEIsVUFBVSxFQUFFLFVBQVU7UUFDdEIsSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsS0FBSztLQUNiLENBQUMsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBub3JtYWxpemVCb29sLFxuICBUeXBlLFxuICBpc1R5cGUsXG4gIGlzQmxhbmssXG4gIGlzRnVuY3Rpb24sXG4gIHN0cmluZ2lmeVxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuXG4vKipcbiAqIERlc2NyaWJlcyBob3cgdGhlIHtAbGluayBJbmplY3Rvcn0gc2hvdWxkIGluc3RhbnRpYXRlIGEgZ2l2ZW4gdG9rZW4uXG4gKlxuICogU2VlIHtAbGluayBwcm92aWRlfS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvR05BeWo2SzZQZllnMk5Cemd3WjU/cCUzRHByZXZpZXcmcD1wcmV2aWV3KSlcbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAqICAgbmV3IFByb3ZpZGVyKFwibWVzc2FnZVwiLCB7IHVzZVZhbHVlOiAnSGVsbG8nIH0pXG4gKiBdKTtcbiAqXG4gKiBleHBlY3QoaW5qZWN0b3IuZ2V0KFwibWVzc2FnZVwiKSkudG9FcXVhbCgnSGVsbG8nKTtcbiAqIGBgYFxuICogQHRzMmRhcnRfY29uc3RcbiAqL1xuZXhwb3J0IGNsYXNzIFByb3ZpZGVyIHtcbiAgLyoqXG4gICAqIFRva2VuIHVzZWQgd2hlbiByZXRyaWV2aW5nIHRoaXMgcHJvdmlkZXIuIFVzdWFsbHksIGl0IGlzIGEgdHlwZSB7QGxpbmsgVHlwZX0uXG4gICAqL1xuICB0b2tlbjtcblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhbiBpbXBsZW1lbnRhdGlvbiBjbGFzcy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1JTVEc4NnFnbW94Q3lqOVNXUHdZP3A9cHJldmlldykpXG4gICAqXG4gICAqIEJlY2F1c2UgYHVzZUV4aXN0aW5nYCBhbmQgYHVzZUNsYXNzYCBhcmUgb2Z0ZW4gY29uZnVzZWQsIHRoZSBleGFtcGxlIGNvbnRhaW5zXG4gICAqIGJvdGggdXNlIGNhc2VzIGZvciBlYXN5IGNvbXBhcmlzb24uXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY2xhc3MgVmVoaWNsZSB7fVxuICAgKlxuICAgKiBjbGFzcyBDYXIgZXh0ZW5kcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIHZhciBpbmplY3RvckNsYXNzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIHtwcm92aWRlOiBWZWhpY2xlLCAgdXNlQ2xhc3M6IENhciB9XG4gICAqIF0pO1xuICAgKiB2YXIgaW5qZWN0b3JBbGlhcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICB7cHJvdmlkZTogVmVoaWNsZSwgIHVzZUV4aXN0aW5nOiBDYXIgfVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpKS5ub3QudG9CZShpbmplY3RvckNsYXNzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkpLnRvQmUoaW5qZWN0b3JBbGlhcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICogYGBgXG4gICAqL1xuICB1c2VDbGFzczogVHlwZTtcblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhIHZhbHVlLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvVUZWc01WUUlEZTdsNHdhV3ppRVM/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgamF2YXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBuZXcgUHJvdmlkZXIoXCJtZXNzYWdlXCIsIHsgdXNlVmFsdWU6ICdIZWxsbycgfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoXCJtZXNzYWdlXCIpKS50b0VxdWFsKCdIZWxsbycpO1xuICAgKiBgYGBcbiAgICovXG4gIHVzZVZhbHVlO1xuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGFuIGV4aXN0aW5nIHRva2VuLlxuICAgKlxuICAgKiB7QGxpbmsgSW5qZWN0b3J9IHJldHVybnMgdGhlIHNhbWUgaW5zdGFuY2UgYXMgaWYgdGhlIHByb3ZpZGVkIHRva2VuIHdhcyB1c2VkLlxuICAgKiBUaGlzIGlzIGluIGNvbnRyYXN0IHRvIGB1c2VDbGFzc2Agd2hlcmUgYSBzZXBhcmF0ZSBpbnN0YW5jZSBvZiBgdXNlQ2xhc3NgIGlzIHJldHVybmVkLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvUXNhdHNPSko2UDhUMmZNZTlncjg/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogQmVjYXVzZSBgdXNlRXhpc3RpbmdgIGFuZCBgdXNlQ2xhc3NgIGFyZSBvZnRlbiBjb25mdXNlZCB0aGUgZXhhbXBsZSBjb250YWluc1xuICAgKiBib3RoIHVzZSBjYXNlcyBmb3IgZWFzeSBjb21wYXJpc29uLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNsYXNzIFZlaGljbGUge31cbiAgICpcbiAgICogY2xhc3MgQ2FyIGV4dGVuZHMgVmVoaWNsZSB7fVxuICAgKlxuICAgKiB2YXIgaW5qZWN0b3JBbGlhcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICB7cHJvdmlkZTogVmVoaWNsZSwgIHVzZUV4aXN0aW5nOiBDYXIgfVxuICAgKiBdKTtcbiAgICogdmFyIGluamVjdG9yQ2xhc3MgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAge3Byb3ZpZGU6IFZlaGljbGUsICB1c2VDbGFzczogQ2FyIH1cbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSkudG9CZShpbmplY3RvckFsaWFzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JDbGFzcy5nZXQoVmVoaWNsZSkpLm5vdC50b0JlKGluamVjdG9yQ2xhc3MuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JDbGFzcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqIGBgYFxuICAgKi9cbiAgdXNlRXhpc3Rpbmc7XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYSBmdW5jdGlvbiB3aGljaCBjb21wdXRlcyB0aGUgdmFsdWUuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9TY294eTBwSk5xS0dBUFpZMVZWQz9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIHtwcm92aWRlOiBOdW1iZXIsICB1c2VGYWN0b3J5OiAoKSA9PiB7IHJldHVybiAxKzI7IH19LFxuICAgKiAgIG5ldyBQcm92aWRlcihTdHJpbmcsIHsgdXNlRmFjdG9yeTogKHZhbHVlKSA9PiB7IHJldHVybiBcIlZhbHVlOiBcIiArIHZhbHVlOyB9LFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgZGVwczogW051bWJlcl0gfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoTnVtYmVyKSkudG9FcXVhbCgzKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChTdHJpbmcpKS50b0VxdWFsKCdWYWx1ZTogMycpO1xuICAgKiBgYGBcbiAgICpcbiAgICogVXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIGRlcGVuZGVuY2llcy5cbiAgICovXG4gIHVzZUZhY3Rvcnk6IEZ1bmN0aW9uO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgYSBzZXQgb2YgZGVwZW5kZW5jaWVzXG4gICAqIChhcyBgdG9rZW5gcykgd2hpY2ggc2hvdWxkIGJlIGluamVjdGVkIGludG8gdGhlIGZhY3RvcnkgZnVuY3Rpb24uXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9TY294eTBwSk5xS0dBUFpZMVZWQz9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIHtwcm92aWRlOiBOdW1iZXIsICB1c2VGYWN0b3J5OiAoKSA9PiB7IHJldHVybiAxKzI7IH19LFxuICAgKiAgIG5ldyBQcm92aWRlcihTdHJpbmcsIHsgdXNlRmFjdG9yeTogKHZhbHVlKSA9PiB7IHJldHVybiBcIlZhbHVlOiBcIiArIHZhbHVlOyB9LFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgZGVwczogW051bWJlcl0gfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoTnVtYmVyKSkudG9FcXVhbCgzKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChTdHJpbmcpKS50b0VxdWFsKCdWYWx1ZTogMycpO1xuICAgKiBgYGBcbiAgICpcbiAgICogVXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIGB1c2VGYWN0b3J5YC5cbiAgICovXG4gIGRlcGVuZGVuY2llczogT2JqZWN0W107XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbXVsdGk6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IodG9rZW4sIHt1c2VDbGFzcywgdXNlVmFsdWUsIHVzZUV4aXN0aW5nLCB1c2VGYWN0b3J5LCBkZXBzLCBtdWx0aX06IHtcbiAgICB1c2VDbGFzcz86IFR5cGUsXG4gICAgdXNlVmFsdWU/OiBhbnksXG4gICAgdXNlRXhpc3Rpbmc/OiBhbnksXG4gICAgdXNlRmFjdG9yeT86IEZ1bmN0aW9uLFxuICAgIGRlcHM/OiBPYmplY3RbXSxcbiAgICBtdWx0aT86IGJvb2xlYW5cbiAgfSkge1xuICAgIHRoaXMudG9rZW4gPSB0b2tlbjtcbiAgICB0aGlzLnVzZUNsYXNzID0gdXNlQ2xhc3M7XG4gICAgdGhpcy51c2VWYWx1ZSA9IHVzZVZhbHVlO1xuICAgIHRoaXMudXNlRXhpc3RpbmcgPSB1c2VFeGlzdGluZztcbiAgICB0aGlzLnVzZUZhY3RvcnkgPSB1c2VGYWN0b3J5O1xuICAgIHRoaXMuZGVwZW5kZW5jaWVzID0gZGVwcztcbiAgICB0aGlzLl9tdWx0aSA9IG11bHRpO1xuICB9XG5cbiAgLy8gVE9ETzogUHJvdmlkZSBhIGZ1bGwgd29ya2luZyBleGFtcGxlIGFmdGVyIGFscGhhMzggaXMgcmVsZWFzZWQuXG4gIC8qKlxuICAgKiBDcmVhdGVzIG11bHRpcGxlIHByb3ZpZGVycyBtYXRjaGluZyB0aGUgc2FtZSB0b2tlbiAoYSBtdWx0aS1wcm92aWRlcikuXG4gICAqXG4gICAqIE11bHRpLXByb3ZpZGVycyBhcmUgdXNlZCBmb3IgY3JlYXRpbmcgcGx1Z2dhYmxlIHNlcnZpY2UsIHdoZXJlIHRoZSBzeXN0ZW0gY29tZXNcbiAgICogd2l0aCBzb21lIGRlZmF1bHQgcHJvdmlkZXJzLCBhbmQgdGhlIHVzZXIgY2FuIHJlZ2lzdGVyIGFkZGl0aW9uYWwgcHJvdmlkZXJzLlxuICAgKiBUaGUgY29tYmluYXRpb24gb2YgdGhlIGRlZmF1bHQgcHJvdmlkZXJzIGFuZCB0aGUgYWRkaXRpb25hbCBwcm92aWRlcnMgd2lsbCBiZVxuICAgKiB1c2VkIHRvIGRyaXZlIHRoZSBiZWhhdmlvciBvZiB0aGUgc3lzdGVtLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIG5ldyBQcm92aWRlcihcIlN0cmluZ3NcIiwgeyB1c2VWYWx1ZTogXCJTdHJpbmcxXCIsIG11bHRpOiB0cnVlfSksXG4gICAqICAgbmV3IFByb3ZpZGVyKFwiU3RyaW5nc1wiLCB7IHVzZVZhbHVlOiBcIlN0cmluZzJcIiwgbXVsdGk6IHRydWV9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChcIlN0cmluZ3NcIikpLnRvRXF1YWwoW1wiU3RyaW5nMVwiLCBcIlN0cmluZzJcIl0pO1xuICAgKiBgYGBcbiAgICpcbiAgICogTXVsdGktcHJvdmlkZXJzIGFuZCByZWd1bGFyIHByb3ZpZGVycyBjYW5ub3QgYmUgbWl4ZWQuIFRoZSBmb2xsb3dpbmdcbiAgICogd2lsbCB0aHJvdyBhbiBleGNlcHRpb246XG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgbmV3IFByb3ZpZGVyKFwiU3RyaW5nc1wiLCB7IHVzZVZhbHVlOiBcIlN0cmluZzFcIiwgbXVsdGk6IHRydWUgfSksXG4gICAqICAgbmV3IFByb3ZpZGVyKFwiU3RyaW5nc1wiLCB7IHVzZVZhbHVlOiBcIlN0cmluZzJcIn0pXG4gICAqIF0pO1xuICAgKiBgYGBcbiAgICovXG4gIGdldCBtdWx0aSgpOiBib29sZWFuIHsgcmV0dXJuIG5vcm1hbGl6ZUJvb2wodGhpcy5fbXVsdGkpOyB9XG59XG5cbi8qKlxuICogU2VlIHtAbGluayBQcm92aWRlcn0gaW5zdGVhZC5cbiAqXG4gKiBAZGVwcmVjYXRlZFxuICogQHRzMmRhcnRfY29uc3RcbiAqL1xuZXhwb3J0IGNsYXNzIEJpbmRpbmcgZXh0ZW5kcyBQcm92aWRlciB7XG4gIGNvbnN0cnVjdG9yKHRva2VuLCB7dG9DbGFzcywgdG9WYWx1ZSwgdG9BbGlhcywgdG9GYWN0b3J5LCBkZXBzLCBtdWx0aX06IHtcbiAgICB0b0NsYXNzPzogVHlwZSxcbiAgICB0b1ZhbHVlPzogYW55LFxuICAgIHRvQWxpYXM/OiBhbnksXG4gICAgdG9GYWN0b3J5OiBGdW5jdGlvbiwgZGVwcz86IE9iamVjdFtdLCBtdWx0aT86IGJvb2xlYW5cbiAgfSkge1xuICAgIHN1cGVyKHRva2VuLCB7XG4gICAgICB1c2VDbGFzczogdG9DbGFzcyxcbiAgICAgIHVzZVZhbHVlOiB0b1ZhbHVlLFxuICAgICAgdXNlRXhpc3Rpbmc6IHRvQWxpYXMsXG4gICAgICB1c2VGYWN0b3J5OiB0b0ZhY3RvcnksXG4gICAgICBkZXBzOiBkZXBzLFxuICAgICAgbXVsdGk6IG11bHRpXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIGdldCB0b0NsYXNzKCkgeyByZXR1cm4gdGhpcy51c2VDbGFzczsgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgZ2V0IHRvQWxpYXMoKSB7IHJldHVybiB0aGlzLnVzZUV4aXN0aW5nOyB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBnZXQgdG9GYWN0b3J5KCkgeyByZXR1cm4gdGhpcy51c2VGYWN0b3J5OyB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBnZXQgdG9WYWx1ZSgpIHsgcmV0dXJuIHRoaXMudXNlVmFsdWU7IH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEge0BsaW5rIFByb3ZpZGVyfS5cbiAqXG4gKiBUbyBjb25zdHJ1Y3QgYSB7QGxpbmsgUHJvdmlkZXJ9LCBiaW5kIGEgYHRva2VuYCB0byBlaXRoZXIgYSBjbGFzcywgYSB2YWx1ZSwgYSBmYWN0b3J5IGZ1bmN0aW9uLFxuICogb3JcbiAqIHRvIGFuIGV4aXN0aW5nIGB0b2tlbmAuXG4gKiBTZWUge0BsaW5rIFByb3ZpZGVyQnVpbGRlcn0gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBUaGUgYHRva2VuYCBpcyBtb3N0IGNvbW1vbmx5IGEgY2xhc3Mgb3Ige0BsaW5rIE9wYXF1ZVRva2VuLWNsYXNzLmh0bWx9LlxuICpcbiAqIEBkZXByZWNhdGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5kKHRva2VuKTogUHJvdmlkZXJCdWlsZGVyIHtcbiAgcmV0dXJuIG5ldyBQcm92aWRlckJ1aWxkZXIodG9rZW4pO1xufVxuXG4vKipcbiAqIEhlbHBlciBjbGFzcyBmb3IgdGhlIHtAbGluayBiaW5kfSBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFByb3ZpZGVyQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0b2tlbikge31cblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhIGNsYXNzLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvWnBCQ1NZcXY2ZTJ1ZDVLWExkeFE/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogQmVjYXVzZSBgdG9BbGlhc2AgYW5kIGB0b0NsYXNzYCBhcmUgb2Z0ZW4gY29uZnVzZWQsIHRoZSBleGFtcGxlIGNvbnRhaW5zXG4gICAqIGJvdGggdXNlIGNhc2VzIGZvciBlYXN5IGNvbXBhcmlzb24uXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY2xhc3MgVmVoaWNsZSB7fVxuICAgKlxuICAgKiBjbGFzcyBDYXIgZXh0ZW5kcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIHZhciBpbmplY3RvckNsYXNzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIHByb3ZpZGUoVmVoaWNsZSwge3VzZUNsYXNzOiBDYXJ9KVxuICAgKiBdKTtcbiAgICogdmFyIGluamVjdG9yQWxpYXMgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgcHJvdmlkZShWZWhpY2xlLCB7dXNlRXhpc3Rpbmc6IENhcn0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JDbGFzcy5nZXQoVmVoaWNsZSkpLm5vdC50b0JlKGluamVjdG9yQ2xhc3MuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JDbGFzcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSkudG9CZShpbmplY3RvckFsaWFzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKiBgYGBcbiAgICovXG4gIHRvQ2xhc3ModHlwZTogVHlwZSk6IFByb3ZpZGVyIHtcbiAgICBpZiAoIWlzVHlwZSh0eXBlKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgYFRyeWluZyB0byBjcmVhdGUgYSBjbGFzcyBwcm92aWRlciBidXQgXCIke3N0cmluZ2lmeSh0eXBlKX1cIiBpcyBub3QgYSBjbGFzcyFgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm92aWRlcih0aGlzLnRva2VuLCB7dXNlQ2xhc3M6IHR5cGV9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGEgdmFsdWUuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9HMDI0UEZIbURMMGNKRmdmWks4Tz9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIHByb3ZpZGUoJ21lc3NhZ2UnLCB7dXNlVmFsdWU6ICdIZWxsbyd9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yLmdldCgnbWVzc2FnZScpKS50b0VxdWFsKCdIZWxsbycpO1xuICAgKiBgYGBcbiAgICovXG4gIHRvVmFsdWUodmFsdWU6IGFueSk6IFByb3ZpZGVyIHsgcmV0dXJuIG5ldyBQcm92aWRlcih0aGlzLnRva2VuLCB7dXNlVmFsdWU6IHZhbHVlfSk7IH1cblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhbiBleGlzdGluZyB0b2tlbi5cbiAgICpcbiAgICogQW5ndWxhciB3aWxsIHJldHVybiB0aGUgc2FtZSBpbnN0YW5jZSBhcyBpZiB0aGUgcHJvdmlkZWQgdG9rZW4gd2FzIHVzZWQuIChUaGlzIGlzXG4gICAqIGluIGNvbnRyYXN0IHRvIGB1c2VDbGFzc2Agd2hlcmUgYSBzZXBhcmF0ZSBpbnN0YW5jZSBvZiBgdXNlQ2xhc3NgIHdpbGwgYmUgcmV0dXJuZWQuKVxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvdUJhb0YycE41Y2ZjNUFmWmFwTnc/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogQmVjYXVzZSBgdG9BbGlhc2AgYW5kIGB0b0NsYXNzYCBhcmUgb2Z0ZW4gY29uZnVzZWQsIHRoZSBleGFtcGxlIGNvbnRhaW5zXG4gICAqIGJvdGggdXNlIGNhc2VzIGZvciBlYXN5IGNvbXBhcmlzb24uXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY2xhc3MgVmVoaWNsZSB7fVxuICAgKlxuICAgKiBjbGFzcyBDYXIgZXh0ZW5kcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIHZhciBpbmplY3RvckFsaWFzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIHByb3ZpZGUoVmVoaWNsZSwge3VzZUV4aXN0aW5nOiBDYXJ9KVxuICAgKiBdKTtcbiAgICogdmFyIGluamVjdG9yQ2xhc3MgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgcHJvdmlkZShWZWhpY2xlLCB7dXNlQ2xhc3M6IENhcn0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkpLnRvQmUoaW5qZWN0b3JBbGlhcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpKS5ub3QudG9CZShpbmplY3RvckNsYXNzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKiBgYGBcbiAgICovXG4gIHRvQWxpYXMoYWxpYXNUb2tlbjogLypUeXBlKi8gYW55KTogUHJvdmlkZXIge1xuICAgIGlmIChpc0JsYW5rKGFsaWFzVG9rZW4pKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgQ2FuIG5vdCBhbGlhcyAke3N0cmluZ2lmeSh0aGlzLnRva2VuKX0gdG8gYSBibGFuayB2YWx1ZSFgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm92aWRlcih0aGlzLnRva2VuLCB7dXNlRXhpc3Rpbmc6IGFsaWFzVG9rZW59KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGEgZnVuY3Rpb24gd2hpY2ggY29tcHV0ZXMgdGhlIHZhbHVlLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvT2VqTklmVFQzemIxaUJ4YUlZT2I/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBwcm92aWRlKE51bWJlciwge3VzZUZhY3Rvcnk6ICgpID0+IHsgcmV0dXJuIDErMjsgfX0pLFxuICAgKiAgIHByb3ZpZGUoU3RyaW5nLCB7dXNlRmFjdG9yeTogKHYpID0+IHsgcmV0dXJuIFwiVmFsdWU6IFwiICsgdjsgfSwgZGVwczogW051bWJlcl19KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChOdW1iZXIpKS50b0VxdWFsKDMpO1xuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KFN0cmluZykpLnRvRXF1YWwoJ1ZhbHVlOiAzJyk7XG4gICAqIGBgYFxuICAgKi9cbiAgdG9GYWN0b3J5KGZhY3Rvcnk6IEZ1bmN0aW9uLCBkZXBlbmRlbmNpZXM/OiBhbnlbXSk6IFByb3ZpZGVyIHtcbiAgICBpZiAoIWlzRnVuY3Rpb24oZmFjdG9yeSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgIGBUcnlpbmcgdG8gY3JlYXRlIGEgZmFjdG9yeSBwcm92aWRlciBidXQgXCIke3N0cmluZ2lmeShmYWN0b3J5KX1cIiBpcyBub3QgYSBmdW5jdGlvbiFgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm92aWRlcih0aGlzLnRva2VuLCB7dXNlRmFjdG9yeTogZmFjdG9yeSwgZGVwczogZGVwZW5kZW5jaWVzfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEge0BsaW5rIFByb3ZpZGVyfS5cbiAqXG4gKiBTZWUge0BsaW5rIFByb3ZpZGVyfSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIDwhLS0gVE9ETzogaW1wcm92ZSB0aGUgZG9jcyAtLT5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGUodG9rZW4sIHt1c2VDbGFzcywgdXNlVmFsdWUsIHVzZUV4aXN0aW5nLCB1c2VGYWN0b3J5LCBkZXBzLCBtdWx0aX06IHtcbiAgdXNlQ2xhc3M/OiBUeXBlLFxuICB1c2VWYWx1ZT86IGFueSxcbiAgdXNlRXhpc3Rpbmc/OiBhbnksXG4gIHVzZUZhY3Rvcnk/OiBGdW5jdGlvbixcbiAgZGVwcz86IE9iamVjdFtdLFxuICBtdWx0aT86IGJvb2xlYW5cbn0pOiBQcm92aWRlciB7XG4gIHJldHVybiBuZXcgUHJvdmlkZXIodG9rZW4sIHtcbiAgICB1c2VDbGFzczogdXNlQ2xhc3MsXG4gICAgdXNlVmFsdWU6IHVzZVZhbHVlLFxuICAgIHVzZUV4aXN0aW5nOiB1c2VFeGlzdGluZyxcbiAgICB1c2VGYWN0b3J5OiB1c2VGYWN0b3J5LFxuICAgIGRlcHM6IGRlcHMsXG4gICAgbXVsdGk6IG11bHRpXG4gIH0pO1xufVxuIl19