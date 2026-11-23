use crate::analyzer::utils::expand_forward_ref;
use crate::analyzer::{ImportKind, ImportedSymbol};
use crate::evaluator::foreign::{strip_dts_alias_suffix, ForeignFunctionResolver, ResolveExpr};
use crate::evaluator::value::{ResolvedValue, ValueReference};
use crate::utils::ANGULAR_CORE;
use oxc_ast::ast::CallExpression;

/// `forwardRef(() => X)` evaluates to `X` (marked synthetic).
///
/// Mirror of `@angular/compiler-cli`'s `createForwardRefResolver` in
/// `packages/compiler-cli/src/ngtsc/annotations/common/src/util.ts`.
///
/// Recognition requires the callee to be the `forwardRef` export of `@angular/core` (modulo `$N`
/// aliasing) with exactly one argument.
pub struct ForwardRefResolver;

impl ForwardRefResolver {
    fn is_forward_ref_import(target: &ImportedSymbol) -> bool {
        if target.source != ANGULAR_CORE {
            return false;
        }
        let ImportKind::Named(name) = &target.kind else {
            return false;
        };
        strip_dts_alias_suffix(name) == "forwardRef"
    }
}

impl ForeignFunctionResolver for ForwardRefResolver {
    fn resolve_reference_call<'a>(
        &self,
        callee: &ValueReference,
        call: &CallExpression<'a>,
        resolve: ResolveExpr<'_, 'a>,
    ) -> Option<ResolvedValue> {
        let owning = callee.owning_reference.as_ref()?;
        if owning.specifier() != ANGULAR_CORE
            || strip_dts_alias_suffix(owning.export_name()) != "forwardRef"
        {
            return None;
        }
        if call.arguments.len() != 1 {
            return None;
        }
        let expanded = expand_forward_ref(call.arguments[0].as_expression()?)?;
        Some(resolve(expanded))
    }

    fn resolve_import_call<'a>(
        &self,
        target: &ImportedSymbol,
        call: &CallExpression<'a>,
        resolve: ResolveExpr<'_, 'a>,
    ) -> Option<ResolvedValue> {
        if !Self::is_forward_ref_import(target) {
            return None;
        }
        if call.arguments.len() != 1 {
            return None;
        }
        let expanded = expand_forward_ref(call.arguments[0].as_expression()?)?;
        Some(resolve(expanded))
    }
}
