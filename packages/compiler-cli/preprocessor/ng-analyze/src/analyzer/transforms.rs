use std::collections::HashMap;

use oxc_ast::ast::{
    Declaration, ExportDefaultDeclarationKind, Expression, FormalParameters, Function,
    IdentifierReference, Program, Statement, TSType, TSTypeName, TSTypeParameterDeclaration,
    TSTypeReference,
};
use oxc_ast::AstKind;
use oxc_ast_visit::{walk, Visit};
use oxc_semantic::{Semantic, SymbolId};
use oxc_span::{GetSpan, Span};
use oxc_syntax::symbol::SymbolFlags;

use super::class_data::ValueIssue;
use super::ImportKind;
use crate::evaluator::value::{DeclKind, DynamicReason};
use crate::evaluator::{evaluate_expression, wrong_type_detail, EvalInput, ResolvedValue};
use crate::query::QueryCtx;
use crate::ResourceResolverFs;

pub enum ExtractedTransformType {
    Type(oxc_span::Span),
    Expression(oxc_span::Span),
}

pub fn extract_transform_type(expr: &Expression<'_>) -> Option<ExtractedTransformType> {
    match expr {
        Expression::ArrowFunctionExpression(_) | Expression::FunctionExpression(_) => {
            extract_transform_type_from_expr(expr).map(ExtractedTransformType::Type)
        }
        _ => {
            use oxc_span::GetSpan;
            Some(ExtractedTransformType::Expression(expr.span()))
        }
    }
}

fn extract_transform_type_from_expr(expr: &Expression<'_>) -> Option<oxc_span::Span> {
    let params = match expr {
        Expression::ArrowFunctionExpression(arrow) => &arrow.params,
        Expression::FunctionExpression(func) => &func.params,
        _ => return None,
    };
    transform_type_from_params(params)
}

pub fn transform_type_from_params(
    params: &oxc_ast::ast::FormalParameters<'_>,
) -> Option<oxc_span::Span> {
    use oxc_span::GetSpan;
    if params.items.is_empty() && params.rest.is_none() {
        return Some(oxc_span::Span::default());
    }
    let param = params.items.first()?;
    let type_ann = param.type_annotation.as_ref()?;
    Some(type_ann.type_annotation.span())
}

/// What ngtsc reads from a function used as a decorator input transform
/// (`ReflectionHost.getDefinitionOfFunction`).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct FunctionFacts {
    pub is_generic: bool,
    /// Its call signatures: the overloads when it has any, else one.
    pub signature_count: usize,
    /// The first parameter after a `this` parameter.
    pub first_param: FirstParam,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum FirstParam {
    Absent,
    Untyped,
    Rest,
    Typed {
        type_span: Span,
        /// The first type it references that is declared in its file but not exported from it.
        unexported: Option<UnexportedType>,
    },
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct UnexportedType {
    pub name: String,
    pub decl_span: Span,
}

impl FunctionFacts {
    fn of(
        params: &FormalParameters<'_>,
        type_parameters: Option<&TSTypeParameterDeclaration<'_>>,
        signature_count: usize,
        semantic: &Semantic<'_>,
    ) -> Self {
        let first_param = match (params.items.first(), &params.rest) {
            (Some(param), _) => match &param.type_annotation {
                Some(annotation) => typed_param(&annotation.type_annotation, semantic),
                None => FirstParam::Untyped,
            },
            (None, Some(rest)) if rest.type_annotation.is_none() => FirstParam::Untyped,
            (None, Some(_)) => FirstParam::Rest,
            (None, None) => FirstParam::Absent,
        };
        Self {
            is_generic: type_parameters.is_some_and(|params| !params.params.is_empty()),
            signature_count,
            first_param,
        }
    }

    /// Facts for an arrow function or function expression written in place.
    fn of_expression(expr: &Expression<'_>, semantic: &Semantic<'_>) -> Option<Self> {
        match expr {
            Expression::ArrowFunctionExpression(arrow) => Some(Self::of(
                &arrow.params,
                arrow.type_parameters.as_deref(),
                1,
                semantic,
            )),
            Expression::FunctionExpression(function) => Some(Self::of(
                &function.params,
                function.type_parameters.as_deref(),
                1,
                semantic,
            )),
            _ => None,
        }
    }
}

fn typed_param(ty: &TSType<'_>, semantic: &Semantic<'_>) -> FirstParam {
    let mut finder = UnexportedTypeFinder {
        semantic,
        found: None,
    };
    finder.visit_ts_type(ty);
    FirstParam::Typed {
        type_span: ty.span(),
        unexported: finder.found,
    }
}

/// Finds the type references ngtsc's `assertEmittableInputType` rejects within the context file:
/// identifiers naming a declaration of the file that it does not statically export.
struct UnexportedTypeFinder<'s, 'a> {
    semantic: &'s Semantic<'a>,
    found: Option<UnexportedType>,
}

impl<'a> Visit<'a> for UnexportedTypeFinder<'_, 'a> {
    fn visit_ts_type_reference(&mut self, it: &TSTypeReference<'a>) {
        if self.found.is_some() {
            return;
        }
        if let TSTypeName::IdentifierReference(ident) = &it.type_name {
            self.check(ident);
        }
        walk::walk_ts_type_reference(self, it);
    }
}

impl UnexportedTypeFinder<'_, '_> {
    fn check(&mut self, ident: &IdentifierReference<'_>) {
        let scoping = self.semantic.scoping();
        let Some(symbol_id) = ident
            .reference_id
            .get()
            .and_then(|id| scoping.get_reference(id).symbol_id())
        else {
            // A global: ngtsc emits it as an ambient reference.
            return;
        };
        let flags = scoping.symbol_flags(symbol_id);
        // Imports name a declaration exported by another file. Type parameters only occur in
        // generic functions, which are rejected before the type is looked at.
        if flags
            .intersects(SymbolFlags::Import | SymbolFlags::TypeImport | SymbolFlags::TypeParameter)
        {
            return;
        }
        if is_statically_exported(symbol_id, self.semantic) {
            return;
        }
        self.found = Some(UnexportedType {
            name: scoping.symbol_name(symbol_id).to_string(),
            decl_span: self.semantic.symbol_declaration(symbol_id).kind().span(),
        });
    }
}

/// Whether a declaration is exported from its file, by an `export` modifier or through an export
/// list or `export default`, as ngtsc's `ReflectionHost.isStaticallyExported`.
fn is_statically_exported(symbol_id: SymbolId, semantic: &Semantic<'_>) -> bool {
    let nodes = semantic.nodes();
    let is_export = |kind: AstKind<'_>| {
        matches!(
            kind,
            AstKind::ExportDeclaration(_)
                | AstKind::ExportDefaultDeclaration(_)
                | AstKind::ExportSpecifier(_)
        )
    };
    let is_decl_exported = |node_id| {
        let decl_id = match nodes.kind(node_id) {
            AstKind::VariableDeclarator(_) => nodes.parent_id(node_id),
            _ => node_id,
        };
        is_export(nodes.parent_kind(decl_id))
    };
    let declaration = semantic.symbol_declaration(symbol_id);
    if is_decl_exported(declaration.id()) {
        return true;
    }
    let scoping = semantic.scoping();
    if scoping
        .symbol_redeclarations(symbol_id)
        .iter()
        .any(|redecl| is_decl_exported(redecl.declaration))
    {
        return true;
    }
    scoping
        .get_resolved_references(symbol_id)
        .any(|reference| is_export(nodes.parent_kind(reference.node_id())))
}

/// [`FunctionFacts`] for the function declarations at the top level of a file, by name.
pub(crate) fn collect_function_facts(
    program: &Program<'_>,
    semantic: &Semantic<'_>,
) -> HashMap<String, FunctionFacts> {
    let mut declarations: Vec<(&str, Vec<&Function<'_>>)> = Vec::new();
    for statement in &program.body {
        let function = match statement {
            Statement::FunctionDeclaration(function) => function,
            Statement::ExportDeclaration(export) => match &export.declaration {
                Declaration::FunctionDeclaration(function) => function,
                _ => continue,
            },
            Statement::ExportDefaultDeclaration(export) => match &export.declaration {
                ExportDefaultDeclarationKind::FunctionDeclaration(function) => function,
                _ => continue,
            },
            _ => continue,
        };
        let Some(id) = &function.id else {
            continue;
        };
        match declarations
            .iter_mut()
            .find(|(name, _)| *name == id.name.as_str())
        {
            Some((_, overloads)) => overloads.push(function),
            None => declarations.push((id.name.as_str(), vec![function])),
        }
    }
    declarations
        .into_iter()
        .map(|(name, functions)| {
            let overloads = functions.iter().filter(|f| f.body.is_none()).count();
            let first = functions[0];
            let facts = FunctionFacts::of(
                &first.params,
                first.type_parameters.as_deref(),
                overloads.max(1),
                semantic,
            );
            (name.to_string(), facts)
        })
        .collect()
}

/// A decorator input's `transform`, for the checks of ngtsc's
/// `parseDecoratorInputTransformFunction` that need the function's definition.
#[derive(Clone, Debug)]
pub struct InputTransformSite {
    /// The class property of the input.
    pub input: String,
    /// The `transform` expression, where ngtsc reports the function's problems.
    pub value_span: Span,
    pub target: TransformTarget,
    /// The class also declares a static `ngAcceptInputType_<input>` member.
    pub conflicting_coercion: bool,
    /// The first problem with the transform function, found by Stage 2.
    pub issue: Option<ValueIssue>,
}

/// What a transform evaluates to, as far as ngtsc's reflector can read a function from it.
#[derive(Clone, Debug)]
pub enum TransformTarget {
    /// An arrow function or function expression written in place.
    Inline(FunctionFacts),
    /// A function declared under this name in the class's file.
    Local(String),
    /// A function imported from another file.
    Imported {
        specifier: String,
        export_name: String,
    },
    /// A value without a function definition (`getDefinitionOfFunction` returns `null`); the
    /// detail of the error.
    NotAFunction(String),
    /// A value the analyzer cannot see through.
    Unknown,
}

impl InputTransformSite {
    /// Classify the `transform` expression `expr` of `input`. `Err` carries the error detail when
    /// the value is neither a reference nor a dynamic value, which ngtsc rejects in every
    /// compilation mode.
    pub(crate) fn new(
        input: &str,
        expr: &Expression<'_>,
        eval: &EvalInput<'_, '_>,
    ) -> Result<Self, String> {
        Ok(Self {
            input: input.to_string(),
            value_span: expr.span(),
            target: classify_transform(expr, eval)?,
            conflicting_coercion: false,
            issue: None,
        })
    }

    /// The coercion member type cannot be derived from the transform.
    pub fn is_invalid(&self) -> bool {
        self.conflicting_coercion
            || self.issue.is_some()
            || matches!(self.target, TransformTarget::NotAFunction(_))
    }
}

fn classify_transform(
    expr: &Expression<'_>,
    eval: &EvalInput<'_, '_>,
) -> Result<TransformTarget, String> {
    if let Some(facts) = FunctionFacts::of_expression(expr, eval.semantic) {
        return Ok(TransformTarget::Inline(facts));
    }
    let value = evaluate_expression(expr, eval);
    let target = match value.unwrap_named() {
        ResolvedValue::Reference(reference)
            if reference.kind == DeclKind::Function && reference.file == eval.file =>
        {
            TransformTarget::Local(reference.name.clone())
        }
        // TODO(parity): ngtsc reads the definition of a static method and of a function
        // declared in another file, which Syntax mode cannot reach.
        ResolvedValue::Reference(reference)
            if matches!(reference.kind, DeclKind::Function | DeclKind::StaticMethod) =>
        {
            TransformTarget::Unknown
        }
        ResolvedValue::Dynamic(dynamic) if declared_elsewhere(dynamic) => TransformTarget::Unknown,
        ResolvedValue::Reference(_) | ResolvedValue::Dynamic(_) => {
            TransformTarget::NotAFunction(wrong_type_detail(&value))
        }
        ResolvedValue::Incomplete(_) => imported_function(expr, eval),
        ResolvedValue::KnownFn(_) | ResolvedValue::Synthetic(_) => TransformTarget::Unknown,
        _ => return Err(wrong_type_detail(&value)),
    };
    Ok(target)
}

/// The dynamic value stems from a declaration the analyzer cannot read, which ngtsc may still
/// resolve to a function: a global from the TypeScript libs (`parseInt`) or a library class.
// TODO(parity): ngtsc reads the definitions of such functions too.
fn declared_elsewhere(dynamic: &crate::evaluator::value::DynamicValue) -> bool {
    match &dynamic.reason {
        DynamicReason::DynamicInput(inner) => declared_elsewhere(inner),
        DynamicReason::UnknownIdentifier(_) | DynamicReason::ExternalReference(_) => true,
        _ => false,
    }
}

/// The import an identifier transform names, which Stage 2 resolves to its declaration.
fn imported_function(expr: &Expression<'_>, eval: &EvalInput<'_, '_>) -> TransformTarget {
    let Expression::Identifier(ident) = expr else {
        return TransformTarget::Unknown;
    };
    let Some(import) = eval.import_map.get(ident.name.as_str()) else {
        return TransformTarget::Unknown;
    };
    let export_name = match &import.kind {
        ImportKind::Named(name) => name.clone(),
        ImportKind::Default => "default".to_string(),
        ImportKind::Namespace => return TransformTarget::Unknown,
    };
    TransformTarget::Imported {
        specifier: import.source.clone(),
        export_name,
    }
}

/// Where the function a transform names is declared, relative to the class.
enum Declared {
    /// Written in place or declared in the class's file.
    InFile,
    /// Declared in another source file.
    OtherFile,
    /// Declared in a `.d.ts` file.
    Declarations,
}

impl InputTransformSite {
    /// Stage 2: the first problem ngtsc's `parseDecoratorInputTransformFunction` reports for
    /// this transform outside local compilation.
    pub(crate) async fn resolve_issue<Fs: ResourceResolverFs + Clone + 'static>(
        &mut self,
        file_facts: &HashMap<String, FunctionFacts>,
        file_path: &std::path::Path,
        ctx: &QueryCtx<Fs>,
    ) {
        let (facts, detail, declared) = match &self.target {
            TransformTarget::Inline(facts) => (
                facts.clone(),
                "Value could not be determined statically.".to_string(),
                Declared::InFile,
            ),
            TransformTarget::Local(name) => {
                let Some(facts) = file_facts.get(name) else {
                    return;
                };
                (facts.clone(), reference_detail(name), Declared::InFile)
            }
            TransformTarget::Imported {
                specifier,
                export_name,
            } => {
                let Some((facts, declared)) =
                    imported_function_facts(specifier, export_name, file_path, ctx).await
                else {
                    return;
                };
                let facts = match facts {
                    Ok(facts) => facts,
                    // TODO(parity): `.d.ts` values other than top-level `declare function`s
                    // (e.g. `declare const`) are not modelled.
                    Err(_) if matches!(declared, Declared::Declarations) => return,
                    Err(detail) => {
                        self.issue = Some(not_a_function(self.value_span, detail));
                        return;
                    }
                };
                (facts, reference_detail(export_name), declared)
            }
            TransformTarget::NotAFunction(detail) => {
                self.issue = Some(not_a_function(self.value_span, detail.clone()));
                return;
            }
            TransformTarget::Unknown => return,
        };
        self.issue = self.definition_issue(&facts, detail, declared);
    }

    fn definition_issue(
        &self,
        facts: &FunctionFacts,
        detail: String,
        declared: Declared,
    ) -> Option<ValueIssue> {
        let wrong_type = |message: &str| {
            Some(ValueIssue::wrong_type_with_detail(
                self.value_span,
                message,
                &detail,
            ))
        };
        if facts.is_generic {
            return wrong_type("Input transform function cannot be generic");
        }
        if facts.signature_count > 1 {
            return wrong_type("Input transform function cannot have multiple signatures");
        }
        if self.conflicting_coercion {
            return Some(ValueIssue::conflicting_input_transform(
                self.value_span,
                &self.input,
            ));
        }
        let (type_span, unexported) = match &facts.first_param {
            FirstParam::Absent => return None,
            FirstParam::Untyped => {
                return wrong_type("Input transform function first parameter must have a type")
            }
            FirstParam::Rest => {
                return wrong_type(
                    "Input transform function first parameter cannot be a spread parameter",
                )
            }
            FirstParam::Typed {
                type_span,
                unexported,
            } => (*type_span, unexported.as_ref()?),
        };
        match declared {
            Declared::InFile => Some(ValueIssue::symbol_not_exported(
                type_span,
                unexported.decl_span,
            )),
            // TODO(parity): ngtsc reports this on the type reference, in the function's file.
            Declared::OtherFile => Some(ValueIssue::import_generation_failure(
                self.value_span,
                &unexported.name,
            )),
            // TODO(parity): ngtsc also checks that `.d.ts` types can be imported.
            Declared::Declarations => None,
        }
    }
}

fn reference_detail(name: &str) -> String {
    format!("Value is a reference to '{name}'.")
}

fn not_a_function(span: Span, detail: String) -> ValueIssue {
    ValueIssue::wrong_type_with_detail(span, "Input transform must be a function", &detail)
}

/// The facts of the function `export_name` of `specifier` names from `file_path`, or the error
/// detail when it is not a function declaration; `None` when the import cannot be followed.
async fn imported_function_facts<Fs: ResourceResolverFs + Clone + 'static>(
    specifier: &str,
    export_name: &str,
    file_path: &std::path::Path,
    ctx: &QueryCtx<Fs>,
) -> Option<(Result<FunctionFacts, String>, Declared)> {
    let mut visited = std::collections::HashSet::new();
    let Ok(Some(resolved)) = crate::evaluator::cross_file::cross_file_resolve(
        ctx,
        file_path,
        Some(specifier),
        export_name.to_owned(),
        &mut visited,
    )
    .await
    else {
        return None;
    };
    let declared = if crate::utils::is_dts(&resolved.file_path) {
        Declared::Declarations
    } else {
        Declared::OtherFile
    };
    let file_id = ctx.engine.intern_path(&resolved.file_path);
    let syntax = ctx.analyze_file_syntax(file_id).await;
    let parsed = ctx.parse_file(file_id).await;
    let symbol_name = {
        let guard = parsed.lock().unwrap();
        guard
            .borrow_dependent()
            .semantic
            .scoping()
            .symbol_name(resolved.symbol_id)
            .to_string()
    };
    let facts = syntax
        .function_facts
        .get(&symbol_name)
        .cloned()
        .ok_or_else(|| {
            // ngtsc evaluates a variable to its initializer, which is dynamic for a function value.
            if resolved
                .flags
                .intersects(SymbolFlags::Class | SymbolFlags::Enum | SymbolFlags::Function)
            {
                reference_detail(&symbol_name)
            } else {
                "Value could not be determined statically.".to_string()
            }
        });
    Some((facts, declared))
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_allocator::Allocator;
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    #[test]
    fn test_extract_transform_type_inline_arrow() {
        let allocator = Allocator::default();
        let source_type = SourceType::ts();
        let ret = Parser::new(
            &allocator,
            "const arrow = (v: string | number) => v;",
            source_type,
        )
        .parse();
        let statement = &ret.program.body[0];
        let oxc_ast::ast::Statement::VariableDeclaration(var) = statement else {
            panic!("Expected variable declaration");
        };
        let expr = var.declarations[0].init.as_ref().unwrap();

        let res = extract_transform_type(expr).unwrap();
        let ExtractedTransformType::Type(span) = res else {
            panic!("Expected Type variant");
        };
        assert_eq!(
            span.source_text("const arrow = (v: string | number) => v;"),
            "string | number"
        );
    }

    #[test]
    fn test_extract_transform_type_reference() {
        let allocator = Allocator::default();
        let source_type = SourceType::ts();
        let ret = Parser::new(&allocator, "const ref = myTransform;", source_type).parse();
        let statement = &ret.program.body[0];
        let oxc_ast::ast::Statement::VariableDeclaration(var) = statement else {
            panic!("Expected variable declaration");
        };
        let expr = var.declarations[0].init.as_ref().unwrap();

        let res = extract_transform_type(expr).unwrap();
        let ExtractedTransformType::Expression(span) = res else {
            panic!("Expected Expression variant");
        };
        assert_eq!(span.source_text("const ref = myTransform;"), "myTransform");
    }
}
