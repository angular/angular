use crate::evaluator::foreign::{
    strip_dts_alias_suffix, ForeignFunctionResolver, FunctionTarget, ResolveTypeName, TypeNameRef,
};
use crate::evaluator::interpreter::EvalInput;
use crate::evaluator::value::{
    DeclKind, DynamicReason, ResolvedValue, SyntheticValue, ValueReference,
};
use crate::utils::ANGULAR_CORE;
use oxc_ast::ast::{IdentifierReference, TSSignature, TSType, TSTypeQueryExprName};
use oxc_span::Span;
use oxc_syntax::symbol::SymbolFlags;

/// `Module.forRoot(...)`-style calls whose declaration's return type names the resulting
/// NgModule: `ModuleWithProviders<T>` or an intersection containing `{ngModule: typeof T}`.
///
/// Mirror of `@angular/compiler-cli`'s `createModuleWithProvidersResolver` in
/// `packages/compiler-cli/src/ngtsc/annotations/ng_module/src/module_with_providers.ts`.
///
/// The structural `.ts` form (`static forRoot() { return {ngModule: X, ...}; }`) needs no
/// recognizer — single-return body evaluation yields a `Map` with an `ngModule` key; consumers
/// check both shapes, as upstream does.
pub struct ModuleWithProvidersResolver;

impl ModuleWithProvidersResolver {
    /// `_reflectModuleFromTypeParam`: `ModuleWithProviders<T>` → `T`.
    fn module_from_type_param<'r, 'a>(
        ty: &'r TSType<'a>,
        input: &EvalInput<'a, '_>,
    ) -> Option<MwpTypeOutcome<'r, 'a>> {
        let TSType::TSTypeReference(reference) = ty else {
            return None;
        };
        let name = TypeNameRef::from_type_name(&reference.type_name)?;
        if strip_dts_alias_suffix(name.rightmost_name()) != "ModuleWithProviders" {
            return None;
        }
        if !Self::provenance_allows_core(&name, input) {
            return None;
        }
        let Some(type_arguments) = &reference.type_arguments else {
            // Upstream raises FatalDiagnosticError NGMODULE_MODULE_WITH_PROVIDERS_MISSING_GENERIC.
            return Some(MwpTypeOutcome::MissingGeneric);
        };
        if type_arguments.params.len() != 1 {
            return Some(MwpTypeOutcome::MissingGeneric);
        }
        Self::type_to_name(&type_arguments.params[0]).map(MwpTypeOutcome::Module)
    }

    /// `_reflectModuleFromLiteralType`: `... & {ngModule: typeof T}` → `T`.
    fn module_from_literal_type<'r, 'a>(ty: &'r TSType<'a>) -> Option<TypeNameRef<'r, 'a>> {
        let TSType::TSIntersectionType(intersection) = ty else {
            return None;
        };
        for member_type in &intersection.types {
            let TSType::TSTypeLiteral(literal) = member_type else {
                continue;
            };
            for signature in &literal.members {
                let TSSignature::TSPropertySignature(property) = signature else {
                    continue;
                };
                let Some(key) = crate::analyzer::utils::extract_property_key(&property.key) else {
                    continue;
                };
                if key != "ngModule" {
                    continue;
                }
                let Some(annotation) = &property.type_annotation else {
                    continue;
                };
                if let Some(name) = Self::type_to_name(&annotation.type_annotation) {
                    return Some(name);
                }
            }
        }
        None
    }

    /// Extract the named type from `T`, `typeof T`, or a reference to `T`.
    fn type_to_name<'r, 'a>(ty: &'r TSType<'a>) -> Option<TypeNameRef<'r, 'a>> {
        match ty {
            TSType::TSTypeReference(reference) => TypeNameRef::from_type_name(&reference.type_name),
            TSType::TSTypeQuery(query) => match &query.expr_name {
                TSTypeQueryExprName::IdentifierReference(ident) => Some(TypeNameRef::Ident(ident)),
                TSTypeQueryExprName::QualifiedName(qualified) => {
                    Some(TypeNameRef::Qualified(qualified))
                }
                _ => None,
            },
            _ => None,
        }
    }

    /// Check that the `ModuleWithProviders` name plausibly refers to `@angular/core`'s.
    /// When the binding can be traced to an import, its source must be `@angular/core`; an
    /// untraceable name (common in `.d.ts` with local ambient declarations) is trusted, like
    /// upstream's fallback.
    fn provenance_allows_core<'a>(name: &TypeNameRef<'_, 'a>, input: &EvalInput<'a, '_>) -> bool {
        let ident = match name {
            TypeNameRef::Ident(ident) => *ident,
            TypeNameRef::Qualified(qualified) => {
                let Some(ident) =
                    crate::analyzer::utils::get_leftmost_identifier_in_qualified(qualified)
                else {
                    return false;
                };
                ident
            }
        };
        let Some(source) = import_source_of(ident, input) else {
            return true; // Untraceable: trust the name.
        };
        source == ANGULAR_CORE
    }
}

enum MwpTypeOutcome<'r, 'a> {
    Module(TypeNameRef<'r, 'a>),
    MissingGeneric,
}

impl ForeignFunctionResolver for ModuleWithProvidersResolver {
    fn resolve_function_call<'a>(
        &self,
        target: &FunctionTarget<'a>,
        _callee: &ValueReference,
        call_span: Span,
        _args: &[ResolvedValue],
        input: &EvalInput<'a, '_>,
        resolve_type: ResolveTypeName<'_, 'a>,
    ) -> Option<ResolvedValue> {
        let annotation = target.return_type()?;
        let ty = &annotation.type_annotation;

        let module_name = match Self::module_from_type_param(ty, input) {
            Some(MwpTypeOutcome::Module(name)) => Some(name),
            Some(MwpTypeOutcome::MissingGeneric) => {
                return Some(ResolvedValue::dynamic(
                    input.file,
                    call_span,
                    DynamicReason::Unknown,
                ));
            }
            None => Self::module_from_literal_type(ty),
        }?;

        let resolved = resolve_type(module_name);
        match resolved {
            ResolvedValue::Reference(ng_module) if ng_module.kind == DeclKind::Class => Some(
                ResolvedValue::Synthetic(SyntheticValue::ModuleWithProviders {
                    ng_module,
                    call_span,
                    call_file: input.file,
                }),
            ),
            // The module type is itself an import: propagate the hole; the driver resolves it
            // and the recognizer re-runs to completion on the next pass.
            ResolvedValue::Incomplete(_) => Some(resolved),
            _ => None,
        }
    }
}

/// Trace an identifier (value or type position) to the module specifier it was imported from,
/// if it is an import binding.
fn import_source_of<'a>(
    ident: &IdentifierReference<'a>,
    input: &EvalInput<'a, '_>,
) -> Option<String> {
    let ref_id = ident.reference_id.get()?;
    let scoping = input.semantic.scoping();
    let symbol_id = scoping.get_reference(ref_id).symbol_id()?;
    if !scoping
        .symbol_flags(symbol_id)
        .contains(SymbolFlags::Import)
    {
        return None;
    }
    let local_name = scoping.symbol_name(symbol_id);
    input
        .import_map
        .get(local_name)
        .map(|imported| imported.source.clone())
}
