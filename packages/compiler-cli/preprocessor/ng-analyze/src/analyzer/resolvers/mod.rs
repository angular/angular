pub mod forward_ref;
pub mod module_with_providers;

pub use forward_ref::ForwardRefResolver;
pub use module_with_providers::ModuleWithProvidersResolver;

use crate::evaluator::foreign::ForeignFunctionResolver;

/// Default set of Angular foreign function resolvers (`forwardRef` + `ModuleWithProviders`).
///
/// Mirrors upstream `@angular/compiler-cli` resolver combinations.
pub fn angular_foreign_resolvers() -> &'static [&'static dyn ForeignFunctionResolver] {
    static FORWARD_REF: ForwardRefResolver = ForwardRefResolver;
    static MODULE_WITH_PROVIDERS: ModuleWithProvidersResolver = ModuleWithProvidersResolver;
    static RESOLVERS: [&dyn ForeignFunctionResolver; 2] = [&FORWARD_REF, &MODULE_WITH_PROVIDERS];
    &RESOLVERS
}
