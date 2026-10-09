//! Unit tests for the partial evaluator core (pure, single-file: no filesystem, no queries).

use super::interpreter::{evaluate_expression, EvalInput, EvalMode};
use super::value::*;
use super::ImportKind;
use crate::analyzer::extract_import_map;
use crate::query::{FileId, FileIdInterner};
use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_semantic::SemanticBuilder;
use oxc_span::SourceType;

const TEST_FILE: &str = "/test/file.ts";

/// Parse `source` and evaluate the final expression statement with the given env.
/// Declarations (consts, enums, classes, functions, imports) above it are visible.
fn eval_source_with_env(source: &str, env: &ResolvedEnv, mode: EvalMode) -> ResolvedValue {
    let allocator = Allocator::default();
    let source_type = SourceType::ts();
    let ret = Parser::new(&allocator, source, source_type).parse();
    assert!(
        ret.diagnostics.is_empty(),
        "test source failed to parse: {:?}",
        ret.diagnostics
    );
    let semantic = SemanticBuilder::new()
        .with_build_nodes(true)
        .build(&ret.program)
        .semantic;
    let import_map = extract_import_map(&ret.module_record);

    let interner = FileIdInterner::new();
    let file = interner.intern_path(TEST_FILE);

    let last_expr = ret
        .program
        .body
        .iter()
        .rev()
        .find_map(|stmt| match stmt {
            oxc_ast::ast::Statement::ExpressionStatement(expr_stmt) => Some(&expr_stmt.expression),
            _ => None,
        })
        .expect("test source must end with an expression statement");

    let input = EvalInput {
        semantic: &semantic,
        file,
        import_map: &import_map,
        mode,
        env,
        foreign: crate::analyzer::resolvers::angular_foreign_resolvers(),
    };
    evaluate_expression(last_expr, &input)
}

fn eval_source(source: &str) -> ResolvedValue {
    eval_source_with_env(source, &ResolvedEnv::new(), EvalMode::Syntax)
}

fn assert_string(value: &ResolvedValue, expected: &str) {
    let ResolvedValue::String(s) = value else {
        panic!("expected String({expected:?}), got {value:?}");
    };
    assert_eq!(s, expected);
}

fn assert_number(value: &ResolvedValue, expected: f64) {
    let ResolvedValue::Number(n) = value else {
        panic!("expected Number({expected}), got {value:?}");
    };
    assert_eq!(*n, expected);
}

fn dynamic_reason(value: &ResolvedValue) -> &DynamicReason {
    let ResolvedValue::Dynamic(d) = value.unwrap_named() else {
        panic!("expected Dynamic, got {value:?}");
    };
    &d.reason
}

fn root_reason(value: &ResolvedValue) -> &DynamicReason {
    let ResolvedValue::Dynamic(d) = value.unwrap_named() else {
        panic!("expected Dynamic, got {value:?}");
    };
    &d.root_cause().reason
}

fn test_file_id() -> FileId {
    // The interner in eval_source interns TEST_FILE first, so its id is always 0.
    0
}

// ==================================================================== literals & templates

#[test]
fn literals() {
    // Parenthesized: a leading bare string literal statement parses as a directive prologue.
    assert_string(&eval_source("('hello');"), "hello");
    assert_number(&eval_source("42;"), 42.0);
    assert_number(&eval_source("4.5;"), 4.5);
    assert_eq!(eval_source("true;"), ResolvedValue::Boolean(true));
    assert_eq!(eval_source("null;"), ResolvedValue::Null);
    assert_eq!(eval_source("undefined;"), ResolvedValue::Undefined);
}

#[test]
fn template_literals() {
    assert_string(&eval_source("`plain`;"), "plain");
    assert_string(
        &eval_source("const NAME = 'world'; `hello ${NAME}!`;"),
        "hello world!",
    );
    // Integral numbers render without a fractional part.
    assert_string(&eval_source("const N = 1.0; `n=${N}`;"), "n=1");
    assert_string(
        &eval_source("`${true} ${null} ${undefined}`;"),
        "true null undefined",
    );
    // A non-primitive substitution makes the string dynamic.
    let value = eval_source("const OBJ = {a: 1}; `x${OBJ}`;");
    assert!(matches!(root_reason(&value), DynamicReason::DynamicString));
}

// ==================================================================== operators

#[test]
fn arithmetic_operators() {
    assert_number(&eval_source("1 + 2;"), 3.0);
    assert_number(&eval_source("5 - 2;"), 3.0);
    assert_number(&eval_source("3 * 4;"), 12.0);
    assert_number(&eval_source("10 / 4;"), 2.5);
    assert_number(&eval_source("10 % 3;"), 1.0);
    assert_number(&eval_source("2 ** 10;"), 1024.0);
}

#[test]
fn string_concatenation_coercion() {
    assert_string(&eval_source("'a' + 'b';"), "ab");
    assert_string(&eval_source("'n=' + 1;"), "n=1");
    assert_string(&eval_source("1 + 'n';"), "1n");
    assert_string(&eval_source("'v=' + true;"), "v=true");
    assert_string(&eval_source("'v=' + null;"), "v=null");
}

#[test]
fn bitwise_operators() {
    assert_number(&eval_source("12 & 10;"), 8.0);
    assert_number(&eval_source("12 | 10;"), 14.0);
    assert_number(&eval_source("12 ^ 10;"), 6.0);
    assert_number(&eval_source("~5;"), -6.0);
    assert_number(&eval_source("1 << 4;"), 16.0);
    assert_number(&eval_source("-16 >> 2;"), -4.0);
    // ToUint32 edge: -1 >>> 0 is 4294967295.
    assert_number(&eval_source("-1 >>> 0;"), 4_294_967_295.0);
}

#[test]
fn comparison_operators() {
    assert_eq!(eval_source("1 < 2;"), ResolvedValue::Boolean(true));
    assert_eq!(eval_source("2 <= 2;"), ResolvedValue::Boolean(true));
    assert_eq!(eval_source("'a' < 'b';"), ResolvedValue::Boolean(true));
    assert_eq!(eval_source("3 > 4;"), ResolvedValue::Boolean(false));
    assert_eq!(eval_source("1 === 1;"), ResolvedValue::Boolean(true));
    assert_eq!(eval_source("1 !== 2;"), ResolvedValue::Boolean(true));
    assert_eq!(
        eval_source("null == undefined;"),
        ResolvedValue::Boolean(true)
    );
    assert_eq!(
        eval_source("null === undefined;"),
        ResolvedValue::Boolean(false)
    );
    assert_eq!(eval_source("'1' == 1;"), ResolvedValue::Boolean(true));
}

#[test]
fn logical_operators() {
    // && / || return the un-coerced operand.
    assert_string(&eval_source("true && 'yes';"), "yes");
    assert_eq!(
        eval_source("false && 'yes';"),
        ResolvedValue::Boolean(false)
    );
    assert_string(&eval_source("false || 'fallback';"), "fallback");
    assert_string(&eval_source("'first' || 'second';"), "first");
    assert_eq!(eval_source("!'nonempty';"), ResolvedValue::Boolean(false));
    assert_eq!(eval_source("!0;"), ResolvedValue::Boolean(true));
    // Parity pin: ?? is unsupported upstream too.
    let value = eval_source("null ?? 'x';");
    assert!(matches!(
        dynamic_reason(&value),
        DynamicReason::UnsupportedSyntax
    ));
}

#[test]
fn unary_operators() {
    assert_number(&eval_source("-5;"), -5.0);
    assert_number(&eval_source("+'3';"), 3.0);
    let value = eval_source("typeof 'x';");
    assert!(matches!(
        dynamic_reason(&value),
        DynamicReason::UnsupportedSyntax
    ));
}

#[test]
fn conditional_expression() {
    assert_string(&eval_source("true ? 'a' : 'b';"), "a");
    assert_string(&eval_source("0 ? 'a' : 'b';"), "b");
}

// ==================================================================== arrays & objects

#[test]
fn arrays_with_spread() {
    let value = eval_source("const INNER = [2, 3]; [1, ...INNER, 4];");
    let ResolvedValue::Array(items) = &value else {
        panic!("expected array, got {value:?}");
    };
    assert_eq!(items.len(), 4);
    assert_number(&items[0], 1.0);
    assert_number(&items[1], 2.0);
    assert_number(&items[2], 3.0);
    assert_number(&items[3], 4.0);
}

#[test]
fn spread_of_non_array_is_invalid() {
    let value = eval_source("const X = 5; [...X];");
    let ResolvedValue::Array(items) = &value else {
        panic!("expected array, got {value:?}");
    };
    assert!(matches!(
        dynamic_reason(&items[0]),
        DynamicReason::InvalidExpressionType
    ));
}

#[test]
fn objects_with_spread_and_computed_keys() {
    let value = eval_source("const BASE = {a: 1}; const K = 'c'; ({...BASE, b: 2, [K]: 3});");
    let ResolvedValue::Map(map) = &value else {
        panic!("expected map, got {value:?}");
    };
    assert_number(map.get("a").unwrap(), 1.0);
    assert_number(map.get("b").unwrap(), 2.0);
    assert_number(map.get("c").unwrap(), 3.0);
    // Shorthand properties.
    let value = eval_source("const x = 7; ({x});");
    let ResolvedValue::Map(map) = &value else {
        panic!("expected map, got {value:?}");
    };
    assert_number(map.get("x").unwrap(), 7.0);
}

// ==================================================================== local declarations

#[test]
fn chained_local_constants() {
    assert_string(&eval_source("const B = 'value'; const A = B; A;"), "value");
}

#[test]
fn cyclic_local_constants_terminate() {
    // Regression for the cycle guard that resolve_local_expression lacks. Note: `const a = b;
    // const b = a;` is a TDZ error at runtime; what matters here is termination, not the value.
    let value = eval_source("const a: any = b; const b: any = a; a;");
    assert!(value.is_dynamic());
}

#[test]
fn property_and_element_access() {
    assert_number(&eval_source("const A = [10, 20]; A.length;"), 2.0);
    assert_number(&eval_source("const A = [10, 20]; A[1];"), 20.0);
    assert_eq!(
        eval_source("const A = [10]; A[5];"),
        ResolvedValue::Undefined
    );
    assert_number(&eval_source("const O = {k: 9}; O.k;"), 9.0);
    assert_eq!(
        eval_source("const O = {k: 9}; O.missing;"),
        ResolvedValue::Undefined
    );
}

#[test]
fn known_fns() {
    let value = eval_source("const A = [1, 2]; A.slice();");
    let ResolvedValue::Array(items) = &value else {
        panic!("expected array, got {value:?}");
    };
    assert_eq!(items.len(), 2);

    let value = eval_source("const A = [1]; A.concat([2, 3], 4);");
    let ResolvedValue::Array(items) = &value else {
        panic!("expected array, got {value:?}");
    };
    assert_eq!(items.len(), 4);
    assert_number(&items[3], 4.0);

    assert_string(&eval_source("'a'.concat('b', 1);"), "ab1");
}

#[test]
fn slice_with_arguments_is_dynamic() {
    // Parity pin: upstream `ArraySliceBuiltinFn` supports only the zero-argument form.
    assert!(matches!(
        dynamic_reason(&eval_source("const A = [1, 2, 3]; A.slice(1);")),
        DynamicReason::Unknown
    ));
    assert!(matches!(
        dynamic_reason(&eval_source("const A = [1, 2, 3]; A.slice(0, 2);")),
        DynamicReason::Unknown
    ));
}

#[test]
fn concat_with_dynamic_argument_chains() {
    // Array concat chains a dynamic argument into the result rather than poisoning the call.
    let value = eval_source("const A = [1]; A.concat(window);");
    let ResolvedValue::Array(items) = &value else {
        panic!("expected array, got {value:?}");
    };
    assert_eq!(items.len(), 2);
    assert!(matches!(
        dynamic_reason(&items[1]),
        DynamicReason::DynamicInput(_)
    ));
    assert!(matches!(
        root_reason(&items[1]),
        DynamicReason::UnknownIdentifier(name) if name == "window"
    ));

    // String concat instead makes the whole call dynamic, with reason Unknown.
    assert!(matches!(
        dynamic_reason(&eval_source("'a'.concat(window);")),
        DynamicReason::Unknown
    ));
}

#[test]
fn class_static_members() {
    assert_string(
        &eval_source("class C { static NAME = 'c-name'; } C.NAME;"),
        "c-name",
    );
    let value = eval_source("class C { static make() { return 1; } } C.make;");
    let ResolvedValue::Reference(reference) = &value else {
        panic!("expected reference, got {value:?}");
    };
    assert_eq!(reference.kind, DeclKind::StaticMethod);
    assert_eq!(reference.name, "C");
    assert_eq!(reference.member.as_deref(), Some("make"));
    // Missing static member is undefined (JS semantics).
    assert_eq!(
        eval_source("class C {} C.missing;"),
        ResolvedValue::Undefined
    );
}

// ==================================================================== destructuring

#[test]
fn destructured_object_declarations() {
    // Shorthand, aliased and nested object patterns all walk back to the initializer.
    let all = "const {a, b, c, d} = {a: 0, b: 1, c: 2, d: 3};";
    for (name, expected) in [("a", 0.0), ("b", 1.0), ("c", 2.0), ("d", 3.0)] {
        assert_number(&eval_source(&format!("{all} {name};")), expected);
    }
    assert_number(&eval_source("const {a: value} = {a: 5}; value;"), 5.0);
    assert_number(
        &eval_source("const {a: {b: {c}}} = {a: {b: {c: 0}}}; c;"),
        0.0,
    );
    // A destructured binding is itself resolvable through another declaration.
    assert_number(&eval_source("const {a} = {a: 2}; const e = a; e;"), 2.0);
}

#[test]
fn destructured_array_declarations() {
    assert_number(&eval_source("const [a, b, c] = [0, 1, 2]; c;"), 2.0);
    assert_number(&eval_source("const [[[a]]] = [[[1]]]; a;"), 1.0);
    assert_number(
        &eval_source("const {a: {b: [[c]]}} = {a: {b: [[1337]]}}; c;"),
        1337.0,
    );
    // Elisions still occupy their index, including inside a nested pattern.
    assert_number(&eval_source("const [, , third] = [0, 1, 2]; third;"), 2.0);
    assert_number(&eval_source("const [, {b}] = [0, {b: 5}]; b;"), 5.0);
    // Reading past the end of the initializer is `undefined`, as in JS.
    assert_eq!(
        eval_source("const [a, b] = [0]; b;"),
        ResolvedValue::Undefined
    );
}

#[test]
fn destructuring_cycles_terminate() {
    // The `visiting` guard has no upstream counterpart (ngtsc would recurse until it
    // overflows); we bail to Dynamic instead. Mutually recursive destructured constants must
    // terminate, and must not poison unrelated bindings evaluated afterwards.
    let cyclic = "const {a} = {a: b}; const {b} = {b: a};";
    assert!(matches!(
        root_reason(&eval_source(&format!("{cyclic} a;"))),
        DynamicReason::Unknown | DynamicReason::UnknownIdentifier(_)
    ));
    assert_number(
        &eval_source(&format!("{cyclic} const {{c}} = {{c: 4}}; c;")),
        4.0,
    );
}

#[test]
fn destructured_defaults_are_not_evaluated() {
    // Upstream ignores a binding element's initializer: a present property wins, and a missing
    // one resolves to `undefined` rather than to the default.
    assert_number(&eval_source("const {a = 9} = {a: 1}; a;"), 1.0);
    assert_eq!(
        eval_source("const {a = 9} = {b: 1}; a;"),
        ResolvedValue::Undefined
    );
    assert_number(&eval_source("const {a: [b] = []} = {a: [7]}; b;"), 7.0);
}

#[test]
fn destructured_rest_elements_use_their_own_position() {
    // A rest binding is keyed by its own name (objects) or its index (arrays), matching ngtsc
    // however unlike the runtime result that is.
    assert_number(
        &eval_source("const {a, ...rest} = {a: 0, rest: 8}; rest;"),
        8.0,
    );
    assert_number(&eval_source("const [a, ...rest] = [0, 9]; rest;"), 9.0);
    // An elision before the rest still advances its index.
    assert_number(&eval_source("const [, ...rest] = [0, 7]; rest;"), 7.0);
    // Nothing at the rest position, so `undefined` — not an empty collection.
    assert_eq!(
        eval_source("const [a, ...rest] = [0]; rest;"),
        ResolvedValue::Undefined
    );
    assert_eq!(
        eval_source("const {a, ...rest} = {a: 0}; rest;"),
        ResolvedValue::Undefined
    );
}

#[test]
fn destructured_non_identifier_keys_are_dynamic() {
    // Upstream requires `ts.isIdentifier(element.propertyName || element.name)`.
    let cases = [
        "const {'a-b': v} = {'a-b': 1}; v;",
        "const {0: v} = {0: 1}; v;",
        "const K = 'a'; const {[K]: v} = {a: 1}; v;",
    ];
    for case in cases {
        assert!(
            matches!(root_reason(&eval_source(case)), DynamicReason::Unknown),
            "expected Dynamic(Unknown) for {case}"
        );
    }
    // A sibling binding with a resolvable key is unaffected.
    assert_number(&eval_source("const {'a-b': v, c} = {c: 3}; c;"), 3.0);
}

#[test]
fn destructuring_a_dynamic_initializer_stays_dynamic() {
    // Upstream: `resolves unknown values in a destructured variable declaration as dynamic
    // values`.
    assert!(matches!(
        root_reason(&eval_source("const {a: {b}} = window; b;")),
        DynamicReason::UnknownIdentifier(name) if name == "window"
    ));
}

// ==================================================================== enums

#[test]
fn enum_members() {
    let value = eval_source("enum E { A = 5, B } E.B;");
    let ResolvedValue::EnumValue(ev) = &value else {
        panic!("expected enum value, got {value:?}");
    };
    assert_eq!(ev.name, "B");
    // Parity quirk pin: uninitialized members resolve to their INDEX (1), not 6.
    assert_number(&ev.resolved, 1.0);

    let value = eval_source("enum E { A = 'x' } E.A;");
    let ResolvedValue::EnumValue(ev) = &value else {
        panic!("expected enum value, got {value:?}");
    };
    assert_string(&ev.resolved, "x");
}

#[test]
fn enum_values_unwrap_in_operations() {
    assert_string(
        &eval_source("enum E { A = 'val' } 'prefix-' + E.A;"),
        "prefix-val",
    );
    assert_string(&eval_source("enum E { A = 2 } `n=${E.A}`;"), "n=2");
}

// ==================================================================== functions

#[test]
fn single_return_function_call() {
    assert_number(
        &eval_source("function add(a, b) { return a + b; } add(1, 2);"),
        3.0,
    );
}

#[test]
fn default_and_rest_params() {
    assert_number(
        &eval_source("function f(a, b = 10) { return a + b; } f(1);"),
        11.0,
    );
    let value = eval_source("function f(...xs) { return xs; } f(1, 2, 3);");
    let ResolvedValue::Array(items) = &value else {
        panic!("expected array, got {value:?}");
    };
    assert_eq!(items.len(), 3);
    // Missing argument without default is undefined.
    assert_eq!(
        eval_source("function f(a) { return a; } f();"),
        ResolvedValue::Undefined
    );
}

#[test]
fn complex_function_body_is_dynamic() {
    let value = eval_source("function f() { const x = 1; return x; } f();");
    assert!(matches!(
        root_reason(&value),
        DynamicReason::ComplexFunctionCall
    ));
}

#[test]
fn static_method_call_structural_mwp() {
    // The structural ModuleWithProviders form needs no recognizer: single-return body
    // evaluation yields a Map with an ngModule Reference.
    let value = eval_source(
        "class M {}\nclass R { static forRoot() { return { ngModule: M, providers: [] }; } }\nR.forRoot();",
    );
    let ResolvedValue::Map(map) = &value else {
        panic!("expected map, got {value:?}");
    };
    let ResolvedValue::Reference(reference) = map.get("ngModule").unwrap() else {
        panic!("expected ngModule reference");
    };
    assert_eq!(reference.name, "M");
    assert_eq!(reference.kind, DeclKind::Class);
}

// ==================================================================== dynamic cases

#[test]
fn unknown_globals_and_unsupported_syntax() {
    let value = eval_source("window;");
    assert!(matches!(
        dynamic_reason(&value),
        DynamicReason::UnknownIdentifier(name) if name == "window"
    ));
    let value = eval_source("class C {} new C();");
    assert!(matches!(
        dynamic_reason(&value),
        DynamicReason::UnsupportedSyntax
    ));
    // Calling a non-callable.
    let value = eval_source("const N = 4; N();");
    assert!(matches!(
        dynamic_reason(&value),
        DynamicReason::InvalidExpressionType
    ));
}

#[test]
fn dynamic_chains_to_root_cause() {
    let value = eval_source("const A = [window]; A;");
    let ResolvedValue::Array(items) = &value else {
        panic!("expected array, got {value:?}");
    };
    assert!(matches!(
        root_reason(&items[0]),
        DynamicReason::UnknownIdentifier(_)
    ));
}

// ==================================================================== incomplete holes

#[test]
fn import_in_value_position_is_a_hole() {
    let value = eval_source("import { X } from './x';\nconst A = [X];\nA;");
    let ResolvedValue::Array(items) = &value else {
        panic!("expected array, got {value:?}");
    };
    let ResolvedValue::Incomplete(hole) = &items[0] else {
        panic!("expected hole, got {:?}", items[0]);
    };
    assert!(hole.transparent);
    let IncompleteDep::Reference(unresolved) = &hole.dep else {
        panic!("expected reference dep");
    };
    assert_eq!(unresolved.specifier, "./x");
    assert_eq!(unresolved.symbol, ImportKind::Named("X".to_string()));

    let holes = collect_holes(&value);
    assert_eq!(holes.len(), 1);
}

#[test]
fn aliased_import_keeps_original_name() {
    let value = eval_source("import { X as Y } from './x';\nY;");
    let ResolvedValue::Incomplete(hole) = value.unwrap_named() else {
        panic!("expected hole, got {value:?}");
    };
    let IncompleteDep::Reference(unresolved) = &hole.dep else {
        panic!("expected reference dep");
    };
    assert_eq!(unresolved.symbol, ImportKind::Named("X".to_string()));
}

#[test]
fn namespace_member_refines_to_named_hole() {
    let value = eval_source("import * as ns from './x';\nns.Foo;");
    let ResolvedValue::Incomplete(hole) = value.unwrap_named() else {
        panic!("expected hole, got {value:?}");
    };
    let IncompleteDep::Reference(unresolved) = &hole.dep else {
        panic!("expected reference dep");
    };
    assert_eq!(unresolved.symbol, ImportKind::Named("Foo".to_string()));
}

#[test]
fn same_import_shares_one_hole_key() {
    let value = eval_source("import { X } from './x';\n[X, X];");
    let holes = collect_holes(&value);
    assert_eq!(holes.len(), 1);
}

#[test]
fn spread_of_hole_is_not_transparent() {
    let value = eval_source("import { ARR } from './x';\n[1, ...ARR];");
    let ResolvedValue::Array(items) = &value else {
        panic!("expected array, got {value:?}");
    };
    let ResolvedValue::Incomplete(hole) = &items[1] else {
        panic!("expected hole, got {:?}", items[1]);
    };
    assert!(!hole.transparent, "spread holes must force a re-run");
    assert_eq!(hole.spread, Some(SpreadArgument::Dependency));
    assert!(hole.is_env_value());
}

#[test]
fn access_on_a_hole_is_not_a_spread_of_it() {
    // `ARR[0]` and `...ARR` propagate the same import's hole; only the spread may take the
    // import's value, and only the spread splices.
    let value = eval_source("import { ARR } from './x';\n[ARR[0], ...ARR.slice()];");
    let ResolvedValue::Array(items) = &value else {
        panic!("expected array, got {value:?}");
    };
    let ResolvedValue::Incomplete(element) = &items[0] else {
        panic!("expected hole, got {:?}", items[0]);
    };
    assert_eq!(element.spread, None);
    assert!(!element.is_env_value());
    let ResolvedValue::Incomplete(spread) = &items[1] else {
        panic!("expected hole, got {:?}", items[1]);
    };
    assert_eq!(spread.spread, Some(SpreadArgument::Expression));
    assert!(!spread.is_env_value());
    assert_eq!(element.key(), spread.key());
}

#[test]
fn env_fills_holes_on_rerun() {
    let source = "import { X } from './x';\n[X];";
    let first = eval_source(source);
    let holes = collect_holes(&first);
    assert_eq!(holes.len(), 1);

    let mut env = ResolvedEnv::new();
    env.insert(holes[0].key(), ResolvedValue::String("resolved".into()));

    // Fast path: transparent hole substitution on the owned tree.
    let substituted = substitute(first, &env, &std::collections::HashMap::new());
    let ResolvedValue::Array(items) = &substituted else {
        panic!("expected array");
    };
    assert_string(&items[0], "resolved");

    // Re-run path: the interpreter consults the env in Semantic mode.
    let rerun = eval_source_with_env(source, &env, EvalMode::Semantic);
    let ResolvedValue::Array(items) = &rerun else {
        panic!("expected array, got {rerun:?}");
    };
    assert_string(&items[0], "resolved");
}

#[test]
fn holes_inside_known_fn_receiver_collect_and_substitute() {
    // Holes inside an uncalled builtin's captured receiver must collect and substitute.
    let source = "import { X } from './x';\nconst A = [1, X];\nA.concat;";
    let first = eval_source(source);
    let holes = collect_holes(&first);
    assert_eq!(holes.len(), 1);

    let mut env = ResolvedEnv::new();
    env.insert(holes[0].key(), ResolvedValue::Number(2.0));
    let substituted = substitute(first, &env, &std::collections::HashMap::new());
    assert!(!substituted.contains_incomplete());
    let ResolvedValue::KnownFn(KnownFn::ArrayConcat(items)) = substituted.unwrap_named() else {
        panic!("expected ArrayConcat, got {substituted:?}");
    };
    assert_number(&items[1], 2.0);
}

#[test]
fn named_spread_hole_in_known_fn_receiver_flattens() {
    // A `Named`-wrapped non-transparent hole in a builtin receiver whose substitution yields
    // an array splices like the plain-array arm, not nested as a single element.
    let file = test_file_id();
    let callee = ValueReference {
        file,
        name: "load".to_string(),
        member: None,
        reference_id: None,
        span: oxc_span::Span::new(0, 4),
        kind: DeclKind::Function,
        owning_reference: None,
        synthetic: false,
        aliases: Vec::new(),
        is_default_export: false,
    };
    let hole = IncompleteValue {
        file,
        span: oxc_span::Span::new(10, 20),
        node_id: None,
        dep: IncompleteDep::Call {
            callee,
            args: Vec::new(),
        },
        transparent: false,
        spread: Some(SpreadArgument::Dependency),
        synthetic: false,
    };
    let key = hole.key();
    let value = ResolvedValue::KnownFn(KnownFn::ArraySlice(vec![
        ResolvedValue::Number(1.0),
        ResolvedValue::Named {
            span: oxc_span::Span::new(10, 20),
            value: Box::new(ResolvedValue::Incomplete(Box::new(hole))),
            synthetic: false,
        },
    ]));

    let mut env = ResolvedEnv::new();
    env.insert(
        key,
        ResolvedValue::Array(vec![ResolvedValue::Number(2.0), ResolvedValue::Number(3.0)]),
    );
    let substituted = substitute(value, &env, &std::collections::HashMap::new());
    let ResolvedValue::KnownFn(KnownFn::ArraySlice(items)) = &substituted else {
        panic!("expected ArraySlice, got {substituted:?}");
    };
    assert_eq!(items.len(), 3);
    assert_number(&items[1], 2.0);
    assert_number(&items[2], 3.0);
}

#[test]
fn syntax_mode_ignores_env() {
    let source = "import { X } from './x';\nX;";
    let first = eval_source(source);
    let key = collect_holes(&first)[0].key();
    let mut env = ResolvedEnv::new();
    env.insert(key, ResolvedValue::String("resolved".into()));
    // Same env, but Syntax mode: still a hole.
    let value = eval_source_with_env(source, &env, EvalMode::Syntax);
    assert!(value.is_incomplete());
}

// ==================================================================== forwardRef

#[test]
fn forward_ref_arrow() {
    let value = eval_source(
        "import { forwardRef } from '@angular/core';\nclass C {}\nforwardRef(() => C);",
    );
    let ResolvedValue::Reference(reference) = &value else {
        panic!("expected reference, got {value:?}");
    };
    assert_eq!(reference.name, "C");
    assert_eq!(reference.kind, DeclKind::Class);
    assert!(reference.synthetic);
}

#[test]
fn forward_ref_function_expression_and_alias() {
    let value = eval_source(
        "import { forwardRef as fref } from '@angular/core';\nclass C {}\nfref(function() { return C; });",
    );
    let ResolvedValue::Reference(reference) = &value else {
        panic!("expected reference, got {value:?}");
    };
    assert_eq!(reference.name, "C");

    // dts-bundler aliasing: import { forwardRef$1 } resolves via the suffix strip.
    let value = eval_source(
        "import { forwardRef$1 as forwardRef } from '@angular/core';\nclass C {}\nforwardRef(() => C);",
    );
    assert!(matches!(value, ResolvedValue::Reference(_)));
}

#[test]
fn forward_ref_wrong_source_is_not_recognized() {
    let value =
        eval_source("import { forwardRef } from 'other-lib';\nclass C {}\nforwardRef(() => C);");
    // The callee hole propagates (non-transparent) instead of being expanded.
    assert!(value.is_incomplete());
}

#[test]
fn forward_ref_to_imported_symbol_composes() {
    // forwardRef(() => ImportedThing): the expansion itself produces a hole.
    let value = eval_source(
        "import { forwardRef } from '@angular/core';\nimport { T } from './t';\nforwardRef(() => T);",
    );
    assert!(value.is_incomplete());
}

// ==================================================================== call holes (driver contract)

#[test]
fn foreign_static_call_three_pass_staging() {
    // Pass 1: `RouterModule` is an import → Reference hole.
    let source = "import { RouterModule } from '@angular/router';\nRouterModule.forRoot([1]);";
    let pass1 = eval_source(source);
    let holes = collect_holes(&pass1);
    assert_eq!(holes.len(), 1);
    let import_key = holes[0].key();
    assert!(matches!(&import_key, HoleKey::Reference(_)));

    // Pass 2: env provides the foreign class reference → Member hole.
    let other_file = 99;
    let router_ref = ValueReference {
        file: other_file,
        name: "RouterModule".to_string(),
        member: None,
        reference_id: None,
        span: oxc_span::Span::new(0, 0),
        kind: DeclKind::Class,
        owning_reference: None,
        synthetic: false,
        aliases: Vec::new(),
        is_default_export: false,
    };
    let mut env = ResolvedEnv::new();
    env.insert(import_key, ResolvedValue::Reference(router_ref.clone()));
    let pass2 = eval_source_with_env(source, &env, EvalMode::Semantic);
    let holes = collect_holes(&pass2);
    assert_eq!(holes.len(), 1);
    let HoleKey::Member { base, member } = holes[0].key() else {
        panic!("expected member hole, got {:?}", holes[0].key());
    };
    assert_eq!(base, router_ref);
    assert_eq!(member, "forRoot");

    // Pass 3: env provides the static method reference → Call hole with evaluated args.
    let method_ref = ValueReference {
        member: Some("forRoot".to_string()),
        kind: DeclKind::StaticMethod,
        ..router_ref.clone()
    };
    env.insert(holes[0].key(), ResolvedValue::Reference(method_ref.clone()));
    let pass3 = eval_source_with_env(source, &env, EvalMode::Semantic);
    let holes = collect_holes(&pass3);
    assert_eq!(holes.len(), 1);
    let IncompleteDep::Call { callee, args } = &holes[0].dep else {
        panic!("expected call hole, got {:?}", holes[0].dep);
    };
    assert_eq!(callee, &method_ref);
    assert_eq!(args.len(), 1);

    // Final pass: env provides the call result; the tree completes.
    env.insert(
        holes[0].key(),
        ResolvedValue::String("module-with-providers".into()),
    );
    let final_pass = eval_source_with_env(source, &env, EvalMode::Semantic);
    assert_string(&final_pass, "module-with-providers");
    assert!(collect_holes(&final_pass).is_empty());
}

#[test]
fn call_hole_fingerprint_distinguishes_args() {
    let file = test_file_id();
    let callee = ValueReference {
        file,
        name: "f".to_string(),
        member: None,
        reference_id: None,
        span: oxc_span::Span::new(0, 0),
        kind: DeclKind::Function,
        owning_reference: None,
        synthetic: false,
        aliases: Vec::new(),
        is_default_export: false,
    };
    let key_a = IncompleteValue {
        file,
        span: oxc_span::Span::new(0, 0),
        node_id: None,
        dep: IncompleteDep::Call {
            callee: callee.clone(),
            args: vec![ResolvedValue::Number(1.0)],
        },
        transparent: true,
        spread: None,
        synthetic: false,
    }
    .key();
    let key_b = IncompleteValue {
        file,
        span: oxc_span::Span::new(0, 0),
        node_id: None,
        dep: IncompleteDep::Call {
            callee,
            args: vec![ResolvedValue::Number(2.0)],
        },
        transparent: true,
        spread: None,
        synthetic: false,
    }
    .key();
    assert_ne!(key_a, key_b);
}

// ==================================================================== ModuleWithProviders

#[test]
fn mwp_return_type_annotation() {
    let value = eval_source(
        "import { ModuleWithProviders } from '@angular/core';\n\
         class M {}\n\
         declare function withM(): ModuleWithProviders<M>;\n\
         withM();",
    );
    let ResolvedValue::Synthetic(SyntheticValue::ModuleWithProviders { ng_module, .. }) = &value
    else {
        panic!("expected ModuleWithProviders synthetic, got {value:?}");
    };
    assert_eq!(ng_module.name, "M");
}

#[test]
fn mwp_intersection_literal_type() {
    let value = eval_source(
        "class M {}\n\
         declare function withM(): { providers: unknown[] } & { ngModule: typeof M };\n\
         withM();",
    );
    let ResolvedValue::Synthetic(SyntheticValue::ModuleWithProviders { ng_module, .. }) = &value
    else {
        panic!("expected ModuleWithProviders synthetic, got {value:?}");
    };
    assert_eq!(ng_module.name, "M");
}

#[test]
fn mwp_missing_generic_is_dynamic() {
    let value = eval_source(
        "import { ModuleWithProviders } from '@angular/core';\n\
         declare function withM(): ModuleWithProviders;\n\
         withM();",
    );
    assert!(value.is_dynamic());
}

#[test]
fn bodyless_function_without_mwp_is_external_reference() {
    let value = eval_source("declare function f(): number;\nf();");
    assert!(matches!(
        dynamic_reason(&value),
        DynamicReason::ExternalReference(reference) if reference.name == "f"
    ));
}

// ==================================================================== misc

#[test]
fn fingerprint_stability() {
    let a = ResolvedValue::Array(vec![
        ResolvedValue::Number(1.0),
        ResolvedValue::String("x".into()),
    ]);
    let b = ResolvedValue::Array(vec![
        ResolvedValue::Number(1.0),
        ResolvedValue::String("x".into()),
    ]);
    assert_eq!(fingerprint(&a), fingerprint(&b));
    let c = ResolvedValue::Array(vec![ResolvedValue::Number(2.0)]);
    assert_ne!(fingerprint(&a), fingerprint(&c));
}

#[test]
fn js_number_formatting() {
    assert_eq!(js_number_to_string(1.0), "1");
    assert_eq!(js_number_to_string(1.5), "1.5");
    assert_eq!(js_number_to_string(-0.0), "0");
    assert_eq!(js_number_to_string(f64::NAN), "NaN");
    assert_eq!(js_number_to_string(f64::INFINITY), "Infinity");
}

fn eval_type_source(source: &str) -> ResolvedValue {
    let allocator = Allocator::default();
    let source_type = SourceType::ts();
    let ret = Parser::new(&allocator, source, source_type).parse();
    assert!(
        ret.diagnostics.is_empty(),
        "test source failed to parse: {:?}",
        ret.diagnostics
    );
    let semantic = SemanticBuilder::new()
        .with_build_nodes(true)
        .build(&ret.program)
        .semantic;
    let import_map = extract_import_map(&ret.module_record);

    let interner = FileIdInterner::new();
    let file = interner.intern_path(TEST_FILE);

    // Find the type alias declaration
    let type_alias = ret
        .program
        .body
        .iter()
        .rev()
        .find_map(|stmt| match stmt {
            oxc_ast::ast::Statement::TSTypeAliasDeclaration(decl) => Some(&decl.type_annotation),
            _ => None,
        })
        .expect("test source must end with a type alias declaration");

    let input = EvalInput {
        semantic: &semantic,
        file,
        import_map: &import_map,
        mode: EvalMode::Syntax,
        env: &ResolvedEnv::new(),
        foreign: crate::analyzer::resolvers::angular_foreign_resolvers(),
    };
    super::interpreter::evaluate_type(type_alias, &input)
}

#[test]
fn test_type_evaluation() {
    let source = r#"
        const X = 42;
        import * as i1 from './foo';
        type T = [typeof X, typeof i1.NgIf];
    "#;
    let val = eval_type_source(source);
    let ResolvedValue::Array(items) = val else {
        panic!("expected Array, got {val:?}");
    };
    assert_eq!(items.len(), 2);
    assert_number(&items[0], 42.0);

    // Second element should be an Incomplete reference to NgIf in i1
    let ResolvedValue::Incomplete(hole) = &items[1] else {
        panic!("expected Incomplete, got {:?}", items[1]);
    };
    let IncompleteDep::Reference(unresolved) = &hole.dep else {
        panic!("expected IncompleteDep::Reference, got {:?}", hole.dep);
    };
    let ImportKind::Named(name) = &unresolved.symbol else {
        panic!("expected Named import symbol, got {:?}", unresolved.symbol);
    };
    assert_eq!(name, "NgIf");
}

#[test]
fn test_readonly_type_evaluation() {
    let source = r#"
        const X = 42;
        import * as i1 from './foo';
        type T = readonly [typeof X, typeof i1.NgIf];
    "#;
    let val = eval_type_source(source);
    let ResolvedValue::Array(items) = val else {
        panic!("expected Array, got {val:?}");
    };
    assert_eq!(items.len(), 2);
    assert_number(&items[0], 42.0);

    let ResolvedValue::Incomplete(hole) = &items[1] else {
        panic!("expected Incomplete, got {:?}", items[1]);
    };
    let IncompleteDep::Reference(unresolved) = &hole.dep else {
        panic!("expected IncompleteDep::Reference, got {:?}", hole.dep);
    };
    let ImportKind::Named(name) = &unresolved.symbol else {
        panic!("expected Named import symbol, got {:?}", unresolved.symbol);
    };
    assert_eq!(name, "NgIf");
}

#[test]
fn test_declared_readonly_tuple_evaluation() {
    let source = r#"
        class Breadcrumbs {}
        class BreadcrumbsItem {}
        declare const BREADCRUMBS: readonly [typeof Breadcrumbs, typeof BreadcrumbsItem];
        BREADCRUMBS;
    "#;
    let val = eval_source(source);
    let ResolvedValue::Array(items) = val else {
        panic!("expected Array, got {val:?}");
    };
    assert_eq!(items.len(), 2);
    let ResolvedValue::Reference(ref1) = &items[0] else {
        panic!("expected Reference, got {:?}", items[0]);
    };
    assert_eq!(ref1.name, "Breadcrumbs");
    let ResolvedValue::Reference(ref2) = &items[1] else {
        panic!("expected Reference, got {:?}", items[1]);
    };
    assert_eq!(ref2.name, "BreadcrumbsItem");
}

#[test]
fn test_unsupported_type_operator_evaluation() {
    let source = r#"
        const X = 42;
        type T = keyof typeof X;
    "#;
    let val = eval_type_source(source);
    let ResolvedValue::Dynamic(dyn_val) = val else {
        panic!("expected Dynamic, got {val:?}");
    };
    assert!(matches!(dyn_val.reason, DynamicReason::UnsupportedSyntax));
}

#[test]
fn dynamic_value_is_anchored_on_the_referencing_node() {
    // `visitExpression` re-anchors a dynamic result on the referencing node (`BAR_CONST`), not
    // the initializer (`getBar()`), for consumers that emit the node verbatim.
    // https://github.com/angular/angular/blob/1c9c453/packages/compiler-cli/src/ngtsc/partial_evaluator/src/interpreter.ts#L155-L158
    let source = "function getBar() { return window.x; }\nconst BAR_CONST = getBar();\nBAR_CONST;";
    let value = eval_source(source);
    let ResolvedValue::Dynamic(dynamic) = value.unwrap_named() else {
        panic!("expected Dynamic, got {value:?}");
    };
    let reference_start = source.rfind("BAR_CONST;").unwrap() as u32;
    assert_eq!(
        dynamic.span,
        oxc_span::Span::new(reference_start, reference_start + "BAR_CONST".len() as u32)
    );
    assert!(matches!(dynamic.reason, DynamicReason::DynamicInput(_)));

    // A dynamic produced *by* the node keeps its own span rather than wrapping itself.
    let value = eval_source("window;");
    let ResolvedValue::Dynamic(dynamic) = value.unwrap_named() else {
        panic!("expected Dynamic, got {value:?}");
    };
    assert_eq!(dynamic.span, oxc_span::Span::new(0, 6));
    assert!(matches!(
        dynamic.reason,
        DynamicReason::UnknownIdentifier(ref name) if name == "window"
    ));
}

/// Evaluate the final expression statement of `consumer` in Syntax mode, then complete it
/// across files via `evaluate_value_completely`.
fn complete_across_files(files: &[(&str, &str)], consumer: &str) -> ResolvedValue {
    use crate::query::{QueryContext, QueryEngine};
    use std::path::PathBuf;
    use std::sync::Arc;

    let fs = crate::test_utils::create_test_fs(files);
    let resolver = Arc::new(oxc_resolver::ResolverGeneric::new_with_file_system(
        fs.clone(),
        oxc_resolver::ResolveOptions {
            extensions: vec![".ts".into(), ".d.ts".into()],
            ..oxc_resolver::ResolveOptions::default()
        },
    ));
    let registry = Arc::new(crate::resource_registry::ResourceRegistry::default());
    let entrypoints = Arc::new(std::sync::RwLock::new(vec![PathBuf::from(consumer)]));
    let engine = QueryEngine::new_default(fs, resolver, registry, entrypoints);
    let file = engine.intern_path(consumer);
    let ctx = QueryContext::new(engine);
    let foreign = crate::analyzer::resolvers::angular_foreign_resolvers();
    futures::executor::block_on(async move {
        let parsed = ctx.parse_file(file).await;
        let syntax = {
            let guard = parsed.lock().expect("ParsedFile lock poisoned");
            let dep = guard.borrow_dependent();
            let import_map = extract_import_map(&dep.module_record);
            let last_expr = dep
                .program
                .body
                .iter()
                .rev()
                .find_map(|stmt| match stmt {
                    oxc_ast::ast::Statement::ExpressionStatement(s) => Some(&s.expression),
                    _ => None,
                })
                .expect("consumer must end with an expression statement");
            let env = ResolvedEnv::new();
            let input = EvalInput::new(dep, &import_map, file, EvalMode::Syntax, &env, foreign);
            evaluate_expression(last_expr, &input)
        };
        super::evaluate_value_completely(&ctx, &syntax, foreign).await
    })
}

const LIST_FILES: [(&str, &str); 5] = [
    ("/app/a.ts", "export class A {}"),
    ("/app/b.ts", "export class B {}"),
    ("/app/c.ts", "export class C {}"),
    (
        "/app/list.ts",
        "import { A } from './a';\nimport { B } from './b';\nexport const LIST = [A, B];",
    ),
    (
        "/app/make.ts",
        "import { A } from './a';\nimport { B } from './b';\n\
         export function make() { return [A, B]; }",
    ),
];

/// Complete `consumer` (the source of `/app/consumer.ts`) against [`LIST_FILES`].
fn complete_list_consumer(consumer: &str) -> ResolvedValue {
    let mut files = LIST_FILES.to_vec();
    files.push(("/app/consumer.ts", consumer));
    complete_across_files(&files, "/app/consumer.ts")
}

/// The class names of an array of references; panics on anything else.
fn reference_names(value: &ResolvedValue) -> Vec<String> {
    let ResolvedValue::Array(items) = value.unwrap_named() else {
        panic!("expected an array, got {value:?}");
    };
    items
        .iter()
        .map(|item| {
            let ResolvedValue::Reference(reference) = item.unwrap_named() else {
                panic!("expected a reference, got {item:?} in {value:?}");
            };
            reference.name.clone()
        })
        .collect()
}

const LIST_IMPORTS: &str = "import { LIST } from './list';\n\
                            import { A } from './a';\n\
                            import { C } from './c';\n";

#[test]
fn imported_array_spread_is_spliced() {
    let value = complete_list_consumer(&format!("{LIST_IMPORTS}[...LIST, C];"));
    assert_eq!(reference_names(&value), ["A", "B", "C"]);
}

#[test]
fn imported_array_spread_through_a_parameter_is_spliced() {
    let value = complete_list_consumer(&format!(
        "{LIST_IMPORTS}function withC(xs: any[]) {{ return [...xs, C]; }}\nwithC(LIST);"
    ));
    assert_eq!(reference_names(&value), ["A", "B", "C"]);
}

#[test]
fn spread_of_an_imported_call_is_spliced() {
    let value = complete_list_consumer(
        "import { make } from './make';\nimport { C } from './c';\n[...make(), C];",
    );
    assert_eq!(reference_names(&value), ["A", "B", "C"]);
}

#[test]
fn element_access_through_a_parameter_is_never_the_whole_array() {
    // TODO(parity): ngtsc evaluates this to `[A]`; re-evaluating `xs[0]` without the `xs`
    // parameter binding falls back to `Dynamic` rather than returning the whole array.
    let value = complete_list_consumer(&format!(
        "{LIST_IMPORTS}function first(xs: any[]) {{ return xs[0]; }}\n[first(LIST)];"
    ));
    let ResolvedValue::Array(items) = &value else {
        panic!("expected an array, got {value:?}");
    };
    assert_eq!(items.len(), 1, "got {value:?}");
    assert!(items[0].is_dynamic(), "got {value:?}");
}

#[test]
fn element_access_on_imported_array() {
    let value = complete_list_consumer(&format!("{LIST_IMPORTS}[LIST[0]];"));
    assert_eq!(reference_names(&value), ["A"]);
    let value = complete_list_consumer(&format!("{LIST_IMPORTS}[LIST[1], C];"));
    assert_eq!(reference_names(&value), ["B", "C"]);
}

#[test]
fn element_access_on_namespace_imported_array() {
    let value = complete_list_consumer(
        "import * as ns from './list';\nimport { C } from './c';\n[ns.LIST[0]];",
    );
    assert_eq!(reference_names(&value), ["A"]);
}

#[test]
fn concat_on_imported_array() {
    let value = complete_list_consumer(&format!("{LIST_IMPORTS}LIST.concat([C]);"));
    assert_eq!(reference_names(&value), ["A", "B", "C"]);
}

#[test]
fn conditional_on_imported_array() {
    let value = complete_list_consumer(&format!("{LIST_IMPORTS}[LIST.length > 5 ? A : C];"));
    assert_eq!(reference_names(&value), ["C"]);
}

#[test]
fn unsupported_method_on_imported_array_is_dynamic() {
    // `Array.prototype.filter` is not a builtin the evaluator models, so the spread is
    // dynamic — never the unfiltered array.
    let value = complete_list_consumer(&format!("{LIST_IMPORTS}[...LIST.filter(Boolean), C];"));
    let ResolvedValue::Array(items) = &value else {
        panic!("expected an array, got {value:?}");
    };
    assert_eq!(items.len(), 2, "got {value:?}");
    assert!(items[0].is_dynamic(), "got {value:?}");
    let ResolvedValue::Reference(c) = items[1].unwrap_named() else {
        panic!("expected a reference, got {:?}", items[1]);
    };
    assert_eq!(c.name, "C");
}

#[test]
fn destructured_element_of_imported_array() {
    let value = complete_list_consumer(&format!("{LIST_IMPORTS}const [first] = LIST;\n[first];"));
    assert_eq!(reference_names(&value), ["A"]);
}

#[test]
fn array_shape_around_an_imported_spread() {
    // The element count and positions of an array holding a spread of an import are unknown
    // until the import resolves; reading them must wait for it.
    let value = complete_list_consumer(&format!("{LIST_IMPORTS}[[C, ...LIST][1]];"));
    assert_eq!(reference_names(&value), ["A"]);
    let value = complete_list_consumer(&format!("{LIST_IMPORTS}[C, ...LIST].length;"));
    assert_number(&value, 3.0);
}
