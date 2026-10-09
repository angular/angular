//! Test utilities for the analyzer
//!
//! Provides helper functions for creating test filesystems and running analyzer tests.

use crate::fs::OverlayFileSystem;
use crate::AnalysisResult;
use futures::StreamExt;

use oxc_resolver::{FileSystem, TsConfig};
use std::path::{Path, PathBuf};

use oxc_allocator::Allocator;
use oxc_ast::ast::{Expression, Statement};
use oxc_parser::Parser;
use oxc_semantic::{Semantic, SemanticBuilder};
use oxc_span::SourceType;

/// Create a test filesystem with the given `(path, content)` virtual files.
pub fn create_test_fs(files: &[(&str, &str)]) -> OverlayFileSystem {
    let fs = OverlayFileSystem::new_with_overlay();
    for (path, content) in files {
        fs.upsert_file(PathBuf::from(*path), content.to_string());
    }
    fs
}

/// Preserved for future parity tests that resolve real `@angular/core` from `node_modules`.
#[allow(dead_code)]
pub fn create_test_fs_with_fallback(files: &[(&str, &str)]) -> OverlayFileSystem {
    let fs = OverlayFileSystem::new_with_overlay();
    for (path, content) in files {
        fs.upsert_file(PathBuf::from(*path), content.to_string());
    }
    fs
}

/// Run the analyzer on a test filesystem and collect all results.
pub fn run_analyzer(
    fs: OverlayFileSystem,
    tsconfig_path: &str,
    optimize: bool,
) -> Vec<AnalysisResult> {
    let tsconfig_path = PathBuf::from(tsconfig_path);

    // Parse tsconfig.json
    let json = fs
        .read_to_string(&tsconfig_path)
        .expect("tsconfig.json must exist in virtual filesystem");
    let config = TsConfig::parse(true, &tsconfig_path, &tsconfig_path, json)
        .expect("Failed to parse tsconfig");

    let _files: Vec<PathBuf> = config.files.expect("tsconfig must have files array");
    let _base_dir = tsconfig_path
        .parent()
        .unwrap_or(Path::new("/"))
        .to_path_buf();

    let options = crate::AnalyzerOptions {
        tsconfig_path: tsconfig_path.to_string_lossy().into_owned(),
        optimize: Some(optimize),
        ..Default::default()
    };

    let analyzer = crate::Analyzer::new_core_with_fs(options, fs).unwrap();
    #[cfg(not(target_arch = "wasm32"))]
    let spawner = crate::compiler::analyzer::get_global_pool().clone();
    #[cfg(target_arch = "wasm32")]
    let spawner = {
        let mut pool = futures::executor::LocalPool::new();
        pool.spawner()
    };

    let mut rx = if optimize {
        analyzer.analyze_optimized_core(spawner).unwrap()
    } else {
        analyzer.analyze_core(spawner).unwrap()
    };
    futures::executor::block_on(async {
        let mut results = Vec::new();
        while let Some(chunk) = rx.next().await {
            results.extend(chunk.unwrap().files);
        }
        results
    })
}

/// Assert that a class with the given name exists in the results
pub fn assert_class_exists(results: &[AnalysisResult], class_name: &str) {
    let found = results.iter().any(|r| {
        r.classes
            .iter()
            .any(|c| c.class_name.as_deref() == Some(class_name))
    });
    assert!(found, "Expected to find class '{}' in results", class_name);
}

/// Find a class by name in the results
pub fn find_class<'a>(
    results: &'a [AnalysisResult],
    class_name: &str,
) -> Option<&'a crate::ClassMetadata> {
    results.iter().find_map(|r| {
        r.classes
            .iter()
            .find(|c| c.class_name.as_deref() == Some(class_name))
    })
}

/// Run a closure with the parsed expression and its Semantic model
pub fn with_expression_semantic<F>(source: &str, f: F)
where
    F: FnOnce(&Expression, &Semantic),
{
    let allocator = Allocator::default();
    let source_type = SourceType::default().with_typescript(true);
    let ret = Parser::new(&allocator, source, source_type).parse();
    let semantic_ret = SemanticBuilder::new()
        .with_build_nodes(true)
        .build(&ret.program);
    let stmt = ret
        .program
        .body
        .first()
        .expect("Expected at least one statement");
    let Statement::ExpressionStatement(expr_stmt) = stmt else {
        panic!("Expected an ExpressionStatement");
    };
    f(&expr_stmt.expression, &semantic_ret.semantic);
}

#[cfg(test)]
mod tests {
    use super::*;

    use std::collections::HashSet;

    fn slice_span(source: &str, span: &crate::types::metadata::SpanMetadata) -> String {
        source[span.start as usize..span.end as usize].to_string()
    }

    #[test]
    fn test_create_test_fs() {
        let fs = create_test_fs(&[
            ("/test/app.ts", "console.log('hello');"),
            ("/test/util.ts", "export const x = 1;"),
        ]);

        let content = fs.read_to_string(Path::new("/test/app.ts")).unwrap();
        assert_eq!(content, "console.log('hello');");

        let content = fs.read_to_string(Path::new("/test/util.ts")).unwrap();
        assert_eq!(content, "export const x = 1;");
    }

    #[test]
    fn test_analyzer_with_simple_injectable() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["service.ts"]}"#,
            ),
            (
                "/test/service.ts",
                r#"
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MyService {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        assert_eq!(results.len(), 1);
        let class = find_class(&results, "MyService").expect("MyService should exist");
        assert!(class.injectable.is_some());
        let provided_in = class
            .injectable
            .as_ref()
            .unwrap()
            .provided_in
            .as_ref()
            .unwrap();
        let source = r#"
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MyService {}
"#;
        assert_eq!(slice_span(source, &provided_in.span), "'root'");
        assert!(!provided_in.is_forward_ref);
    }

    #[test]
    fn test_analyzer_with_simple_service() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["service.ts"]}"#,
            ),
            (
                "/test/service.ts",
                r#"
import { Service } from '@angular/core';

@Service()
export class MyService {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        assert_eq!(results.len(), 1);
        let class = find_class(&results, "MyService").expect("MyService should exist");
        assert!(class.service.is_some());
        let service = class.service.as_ref().unwrap();
        assert!(service.auto_provided.is_none());
        assert!(service.factory.is_none());
    }

    #[test]
    fn test_analyzer_with_service_options() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["service.ts"]}"#,
            ),
            (
                "/test/service.ts",
                r#"
import { Service } from '@angular/core';

@Service({ autoProvided: false, factory: () => new MyService() })
export class MyService {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        assert_eq!(results.len(), 1);
        let class = find_class(&results, "MyService").expect("MyService should exist");
        assert!(class.service.is_some());
        let service = class.service.as_ref().unwrap();
        assert_eq!(service.auto_provided, Some(false));
        assert!(service.factory.is_some());
        let source = r#"
import { Service } from '@angular/core';

@Service({ autoProvided: false, factory: () => new MyService() })
export class MyService {}
"#;
        assert_eq!(
            slice_span(source, &service.factory.as_ref().unwrap().span),
            "() => new MyService()"
        );
    }

    #[test]
    fn test_component_extraction() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts"]}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    template: '<div>Hello World</div>',
    standalone: true,
})
export class AppComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        assert_eq!(results.len(), 1);
        let class = find_class(&results, "AppComponent").expect("AppComponent should exist");
        assert!(class.component.is_some());
        let component = class.component.as_ref().unwrap();
        assert_eq!(component.selector, Some("app-root".to_string()));
        assert_eq!(
            component.template,
            Some("<div>Hello World</div>".to_string())
        );
        assert!(component.standalone);
    }

    #[test]
    fn test_component_schemas() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts"]}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

const OTHER_SCHEMAS = [NO_ERRORS_SCHEMA];

@Component({
    selector: 'app-root',
    template: '<custom-element></custom-element>',
    standalone: false,
    schemas: [CUSTOM_ELEMENTS_SCHEMA, , ...OTHER_SCHEMAS],
})
export class AppComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        assert_eq!(results.len(), 1);
        let class = find_class(&results, "AppComponent").expect("AppComponent should exist");
        assert!(class.component.is_some());
        let component = class.component.as_ref().unwrap();
        // The parser should extract `CUSTOM_ELEMENTS_SCHEMA` and `NO_ERRORS_SCHEMA` (from the resolved spread),
        // completely ignoring the elision (empty slot `, ,`).
        assert_eq!(
            component.schemas,
            Some(vec![
                "CUSTOM_ELEMENTS_SCHEMA".to_string(),
                "NO_ERRORS_SCHEMA".to_string()
            ])
        );
        assert!(!component.standalone);
    }

    #[test]
    fn test_component_animations() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts"]}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component, trigger } from '@angular/core';

@Component({
    selector: 'app-root',
    template: '<div></div>',
    standalone: true,
    animations: [
        trigger('myTrigger', []),
        trigger('otherTrigger', []),
        someDynamicAnimation(),
    ],
})
export class AppComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        assert_eq!(results.len(), 1);
        let class = find_class(&results, "AppComponent").expect("AppComponent should exist");
        assert!(class.component.is_some());
        let component = class.component.as_ref().unwrap();

        assert!(component.animation_trigger_names.is_some());
        let anim_meta = component.animation_trigger_names.as_ref().unwrap();
        assert_eq!(
            anim_meta.static_trigger_names,
            vec!["myTrigger", "otherTrigger"]
        );
        assert!(anim_meta.includes_dynamic_animations);
    }

    #[test]
    fn test_component_animations_static_only() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts"]}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component, trigger } from '@angular/core';

@Component({
    selector: 'app-root',
    template: '<div></div>',
    standalone: true,
    animations: [
        trigger('myTrigger', []),
        trigger('otherTrigger', []),
    ],
})
export class AppComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        assert_eq!(results.len(), 1);
        let class = find_class(&results, "AppComponent").expect("AppComponent should exist");
        let component = class.component.as_ref().unwrap();

        let anim_meta = component.animation_trigger_names.as_ref().unwrap();
        assert_eq!(
            anim_meta.static_trigger_names,
            vec!["myTrigger", "otherTrigger"]
        );
        assert!(!anim_meta.includes_dynamic_animations);
    }

    #[test]
    fn test_component_animations_non_array() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts"]}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component } from '@angular/core';

const ANIMATIONS = 'invalid';

@Component({
    selector: 'app-root',
    template: '<div></div>',
    standalone: true,
    animations: ANIMATIONS,
})
export class AppComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        assert_eq!(results.len(), 1);
        let class = find_class(&results, "AppComponent").expect("AppComponent should exist");
        let component = class.component.as_ref().unwrap();

        let anim_meta = component.animation_trigger_names.as_ref().unwrap();
        assert!(anim_meta.static_trigger_names.is_empty());
        assert!(anim_meta.includes_dynamic_animations);
    }

    #[test]
    fn test_component_animations_resolved_constant() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts"]}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component, trigger } from '@angular/core';

const MY_ANIMATIONS = [trigger('myTrigger', [])];

@Component({
    selector: 'app-root',
    template: '<div></div>',
    standalone: true,
    animations: MY_ANIMATIONS,
})
export class AppComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        assert_eq!(results.len(), 1);
        let class = find_class(&results, "AppComponent").expect("AppComponent should exist");
        let component = class.component.as_ref().unwrap();

        let anim_meta = component.animation_trigger_names.as_ref().unwrap();
        assert_eq!(anim_meta.static_trigger_names, vec!["myTrigger"]);
        assert!(!anim_meta.includes_dynamic_animations);
    }

    #[test]
    fn test_component_animations_resolved_constant_with_cast() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts"]}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component, trigger } from '@angular/core';

const MY_ANIMATIONS = [trigger('myTrigger', [])] as const;

@Component({
    selector: 'app-root',
    template: '<div></div>',
    standalone: true,
    animations: MY_ANIMATIONS,
})
export class AppComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        assert_eq!(results.len(), 1);
        let class = find_class(&results, "AppComponent").expect("AppComponent should exist");
        let component = class.component.as_ref().unwrap();

        let anim_meta = component.animation_trigger_names.as_ref().unwrap();
        assert_eq!(anim_meta.static_trigger_names, vec!["myTrigger"]);
        assert!(!anim_meta.includes_dynamic_animations);
    }

    #[test]
    fn test_component_animations_chained_resolution() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts"]}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component, trigger } from '@angular/core';

const ANIM_INTERNAL = [trigger('myTrigger', [])];
const MY_ANIMATIONS = ANIM_INTERNAL;

@Component({
    selector: 'app-root',
    template: '<div></div>',
    standalone: true,
    animations: MY_ANIMATIONS,
})
export class AppComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        assert_eq!(results.len(), 1);
        let class = find_class(&results, "AppComponent").expect("AppComponent should exist");
        let component = class.component.as_ref().unwrap();

        let anim_meta = component.animation_trigger_names.as_ref().unwrap();
        assert_eq!(anim_meta.static_trigger_names, vec!["myTrigger"]);
        assert!(!anim_meta.includes_dynamic_animations);
    }

    #[test]
    fn test_component_animations_nested_arrays() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts"]}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component, trigger } from '@angular/core';

@Component({
    selector: 'app-root',
    template: '<div></div>',
    standalone: true,
    animations: [
        trigger('rootTrigger', []),
        [
            trigger('nestedTrigger1', []),
            [
                trigger('deepTrigger', []),
            ],
            trigger('nestedTrigger2', []),
        ],
    ],
})
export class AppComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        assert_eq!(results.len(), 1);
        let class = find_class(&results, "AppComponent").expect("AppComponent should exist");
        let component = class.component.as_ref().unwrap();

        let anim_meta = component.animation_trigger_names.as_ref().unwrap();
        assert_eq!(
            anim_meta.static_trigger_names,
            vec![
                "rootTrigger",
                "nestedTrigger1",
                "deepTrigger",
                "nestedTrigger2"
            ]
        );
        assert!(!anim_meta.includes_dynamic_animations);
    }

    #[test]
    fn test_component_animations_mixed_order() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts"]}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component, trigger } from '@angular/core';

@Component({
    selector: 'app-root',
    template: '<div></div>',
    standalone: true,
    animations: [
        someDynamicAnimation(),
        trigger('myTrigger', []),
    ],
})
export class AppComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        assert_eq!(results.len(), 1);
        let class = find_class(&results, "AppComponent").expect("AppComponent should exist");
        let component = class.component.as_ref().unwrap();

        let anim_meta = component.animation_trigger_names.as_ref().unwrap();
        assert_eq!(anim_meta.static_trigger_names, vec!["myTrigger"]);
        assert!(anim_meta.includes_dynamic_animations);
    }

    #[test]
    fn test_directive_extraction() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["highlight.directive.ts"]}"#,
            ),
            (
                "/test/highlight.directive.ts",
                r#"
import { Directive } from '@angular/core';

@Directive({
    selector: '[appHighlight]',
    standalone: true,
})
export class HighlightDirective {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        assert_eq!(results.len(), 1);
        let class =
            find_class(&results, "HighlightDirective").expect("HighlightDirective should exist");
        assert!(class.directive.is_some());
        let directive = class.directive.as_ref().unwrap();
        assert_eq!(directive.selector, Some("[appHighlight]".to_string()));
        assert!(directive.standalone);
    }

    #[test]
    fn test_pipe_extraction() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["upcase.pipe.ts"]}"#,
            ),
            (
                "/test/upcase.pipe.ts",
                r#"
import { Pipe } from '@angular/core';

@Pipe({
    name: 'upcase',
    pure: true,
    standalone: true,
})
export class UpcasePipe {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        assert_eq!(results.len(), 1);
        let class = find_class(&results, "UpcasePipe").expect("UpcasePipe should exist");
        assert!(class.pipe.is_some());
        let pipe = class.pipe.as_ref().unwrap();
        assert_eq!(pipe.name, "upcase");
        assert_eq!(pipe.pure, Some(true));
        assert_eq!(pipe.standalone, Some(true));
    }

    #[test]
    fn test_decorator_inputs_outputs() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["button.component.ts"]}"#,
            ),
            (
                "/test/button.component.ts",
                r#"
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-button',
    template: '<button (click)="onClick.emit()">{{label}}</button>',
    standalone: true,
})
export class ButtonComponent {
    @Input() label: string = '';
    @Input({ required: true }) disabled: boolean = false;
    @Input('buttonType') type: string = 'button';
    @Output() onClick = new EventEmitter<void>();
    @Output('buttonClicked') clicked = new EventEmitter<void>();
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        assert_eq!(results.len(), 1);
        let class = find_class(&results, "ButtonComponent").expect("ButtonComponent should exist");

        // Check inputs
        assert_eq!(class.inputs.len(), 3);
        let label_input = class.inputs.iter().find(|i| i.name == "label").unwrap();
        assert!(!label_input.required);
        assert!(!label_input.is_signal);
        assert!(label_input.alias.is_none());

        let disabled_input = class.inputs.iter().find(|i| i.name == "disabled").unwrap();
        assert!(disabled_input.required);

        let type_input = class.inputs.iter().find(|i| i.name == "type").unwrap();
        assert_eq!(type_input.alias, Some("buttonType".to_string()));

        // Check outputs
        assert_eq!(class.outputs.len(), 2);
        let on_click = class.outputs.iter().find(|o| o.name == "onClick").unwrap();
        assert!(on_click.alias.is_none());

        let clicked = class.outputs.iter().find(|o| o.name == "clicked").unwrap();
        assert_eq!(clicked.alias, Some("buttonClicked".to_string()));
    }

    /// The wire's prepared member surface: model() expansion, coercion marking, query
    /// ordering, the consolidated removal-span list, and the coercion member block.
    #[test]
    fn test_prepared_member_surface() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["prep.component.ts"]}"#,
            ),
            (
                "/test/prep.component.ts",
                r#"
import {
  Component, Input, Output, EventEmitter, model, booleanAttribute,
  ContentChild, ContentChildren, ViewChild, ViewChildren, contentChildren, viewChild,
  HostBinding, HostListener,
} from '@angular/core';

@Component({
    selector: 'app-prep',
    template: '<span></span>',
    standalone: true,
})
export class PrepComponent {
    @ContentChildren('items') items: any;
    @ContentChild('one') one: any;
    itemsSignal = contentChildren('sig');
    @ViewChildren('vMany') vMany: any;
    @ViewChild('vOne') vOne: any;
    vSignal = viewChild('vSig');
    @Input({ transform: booleanAttribute }) flag: boolean = false;
    @Input({ transform: (v: string | number) => String(v) }) typed: string = '';
    @Input() plain = '';
    value = model(0);
    aliased = model(1, { alias: 'val' });
    @Output() done = new EventEmitter<void>();
    @HostBinding('class.active') active = false;
    @HostListener('click') onClick() {}
    static ngAcceptInputType_plain: string | number;
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let class = find_class(&results, "PrepComponent").expect("PrepComponent should exist");

        // model() members expand to a signal input + `<name>Change` output.
        let input_names: Vec<&str> = class.inputs.iter().map(|i| i.name.as_str()).collect();
        assert_eq!(
            input_names,
            vec!["flag", "typed", "plain", "value", "aliased"]
        );
        let value_input = class.inputs.iter().find(|i| i.name == "value").unwrap();
        assert!(value_input.is_signal);
        assert!(value_input.decorator_span.is_none());
        let output_names: Vec<(&str, Option<&str>)> = class
            .outputs
            .iter()
            .map(|o| (o.name.as_str(), o.alias.as_deref()))
            .collect();
        // Outputs keep field order: the model() members precede @Output() done in the class.
        assert_eq!(
            output_names,
            vec![
                ("value", Some("valueChange")),
                ("aliased", Some("valChange")),
                ("done", None),
            ]
        );

        // A `static ngAcceptInputType_<name>` member marks the matching input coerced.
        assert!(
            class
                .inputs
                .iter()
                .find(|i| i.name == "plain")
                .unwrap()
                .is_coerced
        );
        assert!(
            !class
                .inputs
                .iter()
                .find(|i| i.name == "flag")
                .unwrap()
                .is_coerced
        );

        // Queries are sorted signal-first, then `first`, then the rest.
        let content_query_names: Vec<&str> = class
            .queries
            .iter()
            .map(|q| q.property_name.as_str())
            .collect();
        assert_eq!(content_query_names, vec!["itemsSignal", "one", "items"]);
        let view_query_names: Vec<&str> = class
            .view_queries
            .iter()
            .map(|q| q.property_name.as_str())
            .collect();
        assert_eq!(view_query_names, vec!["vSignal", "vOne", "vMany"]);

        // The removal list covers the class decorator plus every member decorator:
        // @Component + 3 inputs + 1 output + 4 decorator-based queries + @HostBinding +
        // @HostListener (signal members carry no decorator to remove).
        assert_eq!(class.removal_spans.len(), 11);
        assert!(class.removal_spans.iter().all(|span| span.start < span.end));
        // The class decorator span leads the list: it starts before every member decorator.
        assert!(class.removal_spans[1..]
            .iter()
            .all(|span| class.removal_spans[0].start < span.start));

        // The coercion member block: expression transforms wrap in Parameters<typeof ...>,
        // typed-arrow transforms splice the parameter type.
        assert_eq!(
            class.coercion_members,
            "  // @ts-ignore\n  declare static ngAcceptInputType_flag: Parameters<typeof booleanAttribute>[0];\n\
             \x20 // @ts-ignore\n  declare static ngAcceptInputType_typed: string | number;\n"
        );
    }

    /// Order guarantees of the prepared member surface that a single-entry-per-bucket
    /// fixture cannot see: stability *within* each query sort bucket, the exact
    /// removal-span concatenation order (class decorators, then inputs, outputs, queries,
    /// view queries, host bindings, host listeners — the order the processor's removal
    /// loops ran in), and coercion marking of a `model()`-expanded input.
    #[test]
    fn test_prepared_member_ordering_guarantees() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["order.component.ts"]}"#,
            ),
            (
                "/test/order.component.ts",
                r#"
import {
  Component, Input, Output, EventEmitter, model,
  ContentChild, ContentChildren, ViewChild, ViewChildren, contentChildren, viewChild,
  HostBinding, HostListener,
} from '@angular/core';

@Component({
    selector: 'app-order',
    template: '<span></span>',
    standalone: true,
})
export class OrderComponent {
    @ContentChildren('a') qa: any;
    @ContentChild('b') qb: any;
    @ContentChildren('c') qc: any;
    @ContentChild('d') qd: any;
    sigB = contentChildren('sb');
    sigA = contentChildren('sa');
    @ViewChildren('va') va: any;
    @ViewChild('vb') vb: any;
    @ViewChildren('vc') vc: any;
    @ViewChild('vd') vd: any;
    @Input() i1 = '';
    @Input() i2 = '';
    value = model(0);
    @Output() o1 = new EventEmitter<void>();
    @HostBinding('class.active') active = false;
    @HostListener('click') onClick() {}
    static ngAcceptInputType_value: string | number;
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let class = find_class(&results, "OrderComponent").expect("OrderComponent should exist");

        // Within each bucket the original member order is preserved (stable sort): signals
        // in declaration order (sigB before sigA), then `first` queries, then the rest.
        let content_query_names: Vec<&str> = class
            .queries
            .iter()
            .map(|q| q.property_name.as_str())
            .collect();
        assert_eq!(
            content_query_names,
            vec!["sigB", "sigA", "qb", "qd", "qa", "qc"]
        );
        let view_query_names: Vec<&str> = class
            .view_queries
            .iter()
            .map(|q| q.property_name.as_str())
            .collect();
        assert_eq!(view_query_names, vec!["vb", "vd", "va", "vc"]);

        // A model()-expanded input participates in `ngAcceptInputType_` coercion marking
        // exactly like a decorator input.
        let value_input = class.inputs.iter().find(|i| i.name == "value").unwrap();
        assert!(value_input.is_coerced);

        // Every member decorator is in the removal list (extended over trailing whitespace),
        // alongside the class's own. Order doesn't matter.
        let mut expected_member_spans: Vec<crate::types::metadata::SpanMetadata> = class
            .inputs
            .iter()
            .filter_map(|i| i.decorator_span)
            .chain(class.outputs.iter().filter_map(|o| o.decorator_span))
            .chain(class.queries.iter().filter_map(|q| q.decorator_span))
            .chain(class.view_queries.iter().filter_map(|q| q.decorator_span))
            .chain(class.host_bindings.iter().map(|b| b.decorator_span))
            .chain(class.host_listeners.iter().map(|l| l.decorator_span))
            .collect();
        let mut actual_spans = class.removal_spans.clone();
        actual_spans.sort_by_key(|s| (s.start, s.end));
        expected_member_spans.sort_by_key(|s| (s.start, s.end));
        assert_eq!(actual_spans.len(), 1 + expected_member_spans.len());
        assert!(expected_member_spans.iter().all(|decorator| actual_spans
            .iter()
            .any(|removal| removal.start == decorator.start && removal.end >= decorator.end)));
    }

    /// The syntax projection, which backs local compilation. `encapsulation` resolves
    /// through the textual fallback that mirrors ngtsc's local-compilation resolver;
    /// `changeDetection` is never resolved there, only spanned for verbatim emission.
    #[test]
    fn test_encapsulation_change_detection_textual_fallback() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["a.ts", "b.ts", "c.ts"]}"#,
            ),
            (
                "/test/a.ts",
                r#"
import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'a-cmp',
    template: '',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class ACmp {}
"#,
            ),
            (
                "/test/b.ts",
                r#"
import { Component } from '@angular/core';
import * as core from '@angular/core';

@Component({
    selector: 'b-cmp',
    template: '',
    encapsulation: core.ViewEncapsulation.ExperimentalIsolatedShadowDom,
    changeDetection: core.ChangeDetectionStrategy.OnPush,
})
export class BCmp {}
"#,
            ),
            (
                "/test/c.ts",
                r#"
import { Component, ViewEncapsulation as VE } from '@angular/core';

declare const dynamicEncapsulation: any;

@Component({
    selector: 'c-cmp',
    template: '',
    // An aliased enum import is invisible to the textual resolver (and the enum's
    // declaration is unreachable here), so this lowers to "unresolved" and the consumer's
    // Emulated default — matching ngtsc local compilation, and unlike the old substring
    // hack which matched any text containing "None".
    encapsulation: VE.None,
    changeDetection: dynamicEncapsulation,
})
export class CCmp {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        let a = find_class(&results, "ACmp")
            .unwrap()
            .component
            .as_ref()
            .unwrap();
        assert_eq!(a.encapsulation, Some(2)); // ViewEncapsulation.None
        assert_eq!(
            a.change_detection.as_deref(),
            Some("ChangeDetectionStrategy.Default")
        );

        let b = find_class(&results, "BCmp")
            .unwrap()
            .component
            .as_ref()
            .unwrap();
        assert_eq!(b.encapsulation, Some(4)); // ExperimentalIsolatedShadowDom
        assert_eq!(
            b.change_detection.as_deref(),
            Some("core.ChangeDetectionStrategy.OnPush")
        );

        let c = find_class(&results, "CCmp")
            .unwrap()
            .component
            .as_ref()
            .unwrap();
        assert_eq!(c.encapsulation, None);
        // Unresolvable in any mode, and carried through regardless: local compilation emits
        // the expression as written.
        assert_eq!(c.change_detection.as_deref(), Some("dynamicEncapsulation"));
    }

    /// With a resolvable `@angular/core` in the program, the partial evaluator resolves the
    /// member value itself — including through an import alias, where the textual resolver
    /// cannot. This is the full-compilation `resolveEnumValue` path.
    #[test]
    fn test_encapsulation_resolved_through_evaluator() {
        let core_dts = r#"
export declare enum ViewEncapsulation {
    Emulated = 0,
    None = 2,
    ShadowDom = 3,
    ExperimentalIsolatedShadowDom = 4
}
export declare enum ChangeDetectionStrategy {
    OnPush = 0,
    Eager = 1,
    Default = 1
}
export interface Component { new (obj: any): any; }
export declare const Component: any;
"#;
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["aliased.ts"]}"#,
            ),
            (
                "/test/node_modules/@angular/core/package.json",
                r#"{"name": "@angular/core", "types": "./index.d.ts"}"#,
            ),
            ("/test/node_modules/@angular/core/index.d.ts", core_dts),
            (
                "/test/aliased.ts",
                r#"
import { Component, ViewEncapsulation as VE, ChangeDetectionStrategy as CD } from '@angular/core';

@Component({
    selector: 'aliased-cmp',
    template: '',
    encapsulation: VE.ShadowDom,
    changeDetection: CD.Eager,
})
export class AliasedCmp {}

@Component({
    selector: 'on-push-cmp',
    template: '',
    changeDetection: CD.OnPush,
})
export class OnPushCmp {}
"#,
            ),
        ]);

        // Optimize mode runs the semantic driver, which chases the import into the package's
        // `.d.ts` enum declarations.
        let results = run_analyzer(fs, "/test/tsconfig.json", true);
        let cmp = find_class(&results, "AliasedCmp")
            .unwrap()
            .component
            .as_ref()
            .unwrap();
        assert_eq!(cmp.encapsulation, Some(3)); // VE.ShadowDom through the alias
        assert_eq!(cmp.change_detection.as_deref(), Some("1"));

        // `OnPush` is the default strategy, so it drops out of the wire entirely rather than
        // transporting as `"0"`: upstream emits no `changeDetection` field for it.
        let on_push = find_class(&results, "OnPushCmp")
            .unwrap()
            .component
            .as_ref()
            .unwrap();
        assert_eq!(on_push.change_detection, None);
    }

    /// The published `@angular/core` package does not declare its enums in the entry
    /// `.d.ts`: they live in a chunk file and the entry re-exports them under a `$N`
    /// bundler alias (`import { ViewEncapsulation as ViewEncapsulation$1 } from
    /// './chunk.js'; export { ViewEncapsulation$1 as ViewEncapsulation };`). The evaluator
    /// path must resolve through that hop exactly like a flat entry-file declaration.
    #[test]
    fn test_encapsulation_resolved_through_chunked_core() {
        let chunk_dts = r#"
export declare enum ViewEncapsulation {
    Emulated = 0,
    None = 2,
    ShadowDom = 3,
    ExperimentalIsolatedShadowDom = 4
}
export declare enum ChangeDetectionStrategy {
    OnPush = 0,
    Eager = 1,
    Default = 1
}
"#;
        let index_dts = r#"
import { ViewEncapsulation as ViewEncapsulation$1, ChangeDetectionStrategy as ChangeDetectionStrategy$1 } from './test-chunk.js';
export { ViewEncapsulation$1 as ViewEncapsulation, ChangeDetectionStrategy$1 as ChangeDetectionStrategy };
export interface Component { new (obj: any): any; }
export declare const Component: any;
"#;
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["aliased.ts", "indirect.ts"]}"#,
            ),
            (
                "/test/node_modules/@angular/core/package.json",
                r#"{"name": "@angular/core", "types": "./index.d.ts"}"#,
            ),
            ("/test/node_modules/@angular/core/index.d.ts", index_dts),
            (
                "/test/node_modules/@angular/core/test-chunk.d.ts",
                chunk_dts,
            ),
            (
                "/test/aliased.ts",
                r#"
import { Component, ViewEncapsulation as VE, ChangeDetectionStrategy as CD } from '@angular/core';

@Component({
    selector: 'aliased-cmp',
    template: '',
    encapsulation: VE.None,
    changeDetection: CD.Default,
})
export class AliasedCmp {}
"#,
            ),
            (
                "/test/indirect.ts",
                r#"
import { Component, ViewEncapsulation } from '@angular/core';

const enc = ViewEncapsulation.ShadowDom;

@Component({
    selector: 'indirect-cmp',
    template: '',
    encapsulation: enc,
})
export class IndirectCmp {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);
        let cmp = find_class(&results, "AliasedCmp")
            .unwrap()
            .component
            .as_ref()
            .unwrap();
        assert_eq!(cmp.encapsulation, Some(2)); // VE.None through alias + chunk re-export
        assert_eq!(cmp.change_detection.as_deref(), Some("1"));

        // A local `const` holding the member is invisible to the textual resolver; only the
        // evaluator path can produce this answer.
        let indirect = find_class(&results, "IndirectCmp")
            .unwrap()
            .component
            .as_ref()
            .unwrap();
        assert_eq!(indirect.encapsulation, Some(3));
    }

    /// A *user* enum member sharing `ViewEncapsulation`'s name, resolved per compilation
    /// mode as ngtsc does. Full compilation evaluates the expression, rejects the foreign
    /// enum (diagnostic upstream, consumer default here). Local compilation never evaluates
    /// anything — `resolveEncapsulationEnumValueLocally` is a textual match, so it takes the
    /// text at face value and is blind to both the foreign enum and the import alias.
    #[test]
    fn test_user_enum_resolution_per_compilation_mode() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["own-enum.ts", "renamed-import.ts"]}"#,
            ),
            (
                "/test/enums.ts",
                r#"
export enum MyEnum { None = 0 }
"#,
            ),
            (
                "/test/own-enum.ts",
                r#"
import { Component } from '@angular/core';

// Same declared name as core's enum, different numbering (None = 5, not 2).
enum ViewEncapsulation { None = 5 }

@Component({
    selector: 'own-enum-cmp',
    template: '',
    encapsulation: ViewEncapsulation.None,
})
export class OwnEnumCmp {}
"#,
            ),
            (
                "/test/renamed-import.ts",
                r#"
import { Component } from '@angular/core';
import { MyEnum as ViewEncapsulation } from './enums';

@Component({
    selector: 'renamed-cmp',
    template: '',
    encapsulation: ViewEncapsulation.None,
})
export class RenamedCmp {}
"#,
            ),
        ]);

        for optimize in [false, true] {
            let results = run_analyzer(fs.clone(), "/test/tsconfig.json", optimize);
            let encapsulation = |name: &str| {
                find_class(&results, name)
                    .unwrap()
                    .component
                    .as_ref()
                    .unwrap()
                    .encapsulation
            };
            // Full compilation rejects both foreign enums. Local compilation reads the text
            // `ViewEncapsulation.None` in both — in the second an import alias renamed a
            // foreign enum into the name, which a textual match cannot see.
            let (own, renamed) = if optimize {
                (None, None)
            } else {
                (Some(2), Some(2))
            };
            assert_eq!(encapsulation("OwnEnumCmp"), own, "optimize={optimize}");
            assert_eq!(encapsulation("RenamedCmp"), renamed, "optimize={optimize}");
        }
    }

    #[test]
    fn test_signal_inputs_outputs() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["counter.component.ts"]}"#,
            ),
            (
                "/test/counter.component.ts",
                r#"
import { Component, input, output, model } from '@angular/core';

@Component({
    selector: 'app-counter',
    template: '<span>{{count()}}</span>',
    standalone: true,
})
export class CounterComponent {
    count = input(0);
    requiredName = input.required<string>();
    aliasedInput = input(0, { alias: 'customAlias' });
    increment = output<number>();
    aliasedOutput = output<void>({ alias: 'customOutput' });
    value = model(0);
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        assert_eq!(results.len(), 1);
        let class =
            find_class(&results, "CounterComponent").expect("CounterComponent should exist");

        // Check signal inputs
        let count_input = class.inputs.iter().find(|i| i.name == "count").unwrap();
        assert!(count_input.is_signal);
        assert!(!count_input.required);
        assert!(count_input.decorator_span.is_none()); // Signal inputs don't have decorator spans

        let required_input = class
            .inputs
            .iter()
            .find(|i| i.name == "requiredName")
            .unwrap();
        assert!(required_input.is_signal);
        assert!(required_input.required);

        let aliased_input = class
            .inputs
            .iter()
            .find(|i| i.name == "aliasedInput")
            .unwrap();
        assert!(aliased_input.is_signal);
        assert_eq!(aliased_input.alias, Some("customAlias".to_string()));

        // Check signal outputs
        let increment_output = class
            .outputs
            .iter()
            .find(|o| o.name == "increment")
            .unwrap();
        assert!(increment_output.alias.is_none());

        let aliased_output = class
            .outputs
            .iter()
            .find(|o| o.name == "aliasedOutput")
            .unwrap();
        assert_eq!(aliased_output.alias, Some("customOutput".to_string()));

        // Check model (should be both input and output)
        let model_input = class.inputs.iter().find(|i| i.name == "value").unwrap();
        assert!(model_input.is_signal);

        let model_output = class.outputs.iter().find(|o| o.name == "value").unwrap();
        assert_eq!(model_output.alias.as_deref(), Some("valueChange"));
        assert!(model_output.decorator_span.is_none());
    }

    #[test]
    fn test_constructor_params_extraction() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["service.ts"]}"#,
            ),
            (
                "/test/service.ts",
                r#"
import { Injectable } from '@angular/core';

class Logger {}
class HttpClient {}

@Injectable({ providedIn: 'root' })
export class DataService {
    constructor(
        private logger: Logger,
        private http: HttpClient,
    ) {}
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        let class = find_class(&results, "DataService").expect("DataService should exist");
        assert!(class.constructor_params.is_some());
        let params = class.constructor_params.as_ref().unwrap();
        assert_eq!(params.len(), 2);
        assert_eq!(params[0].type_name.as_deref(), Some("Logger"));
        assert!(!params[0].is_type_only);
        assert_eq!(params[1].type_name.as_deref(), Some("HttpClient"));
        assert!(!params[1].is_type_only);
    }

    #[test]
    fn test_constructor_params_type_only_detection() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["service.ts"]}"#,
            ),
            (
                "/test/service.ts",
                r#"
import { Injectable } from '@angular/core';

interface LoggerConfig {
    level: string;
}

type LogFormat = 'json' | 'text';

class Logger {}

@Injectable({ providedIn: 'root' })
export class DataService {
    constructor(
        private logger: Logger,
        private config: LoggerConfig,
        private format: LogFormat,
        private partialConfig?: Partial<DataService>,
        private record?: Record<string, any>,
        private element?: Element,
        private window?: Window,
    ) {}
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let class = find_class(&results, "DataService").expect("DataService should exist");
        let params = class.constructor_params.as_ref().unwrap();
        assert_eq!(params.len(), 7);

        // Logger is a class — has a runtime value
        assert_eq!(params[0].type_name.as_deref(), Some("Logger"));
        assert!(!params[0].is_type_only);

        // LoggerConfig is an interface — type-only, no runtime value
        assert_eq!(params[1].type_name.as_deref(), Some("LoggerConfig"));
        assert!(params[1].is_type_only);

        // LogFormat is a type alias — type-only, no runtime value
        assert_eq!(params[2].type_name.as_deref(), Some("LogFormat"));
        assert!(params[2].is_type_only);

        // Partial is a TypeScript built-in utility type — type-only, no runtime value
        assert_eq!(params[3].type_name.as_deref(), Some("Partial"));
        assert!(params[3].is_type_only);

        // Record is a TypeScript built-in utility type — type-only, no runtime value
        assert_eq!(params[4].type_name.as_deref(), Some("Record"));
        assert!(params[4].is_type_only);

        // Element is an ambient/global value — preserved for runtime DI injection
        assert_eq!(params[5].type_name.as_deref(), Some("Element"));
        assert!(!params[5].is_type_only);

        // Window is an ambient/global value — preserved for runtime DI injection
        assert_eq!(params[6].type_name.as_deref(), Some("Window"));
        assert!(!params[6].is_type_only);
    }

    #[test]
    fn test_constructor_params_union_null_unwrap() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["service.ts"]}"#,
            ),
            (
                "/test/service.ts",
                r#"
import { Injectable } from '@angular/core';

class Logger {}

@Injectable({ providedIn: 'root' })
export class DataService {
    constructor(
        private logger: Logger | null,
    ) {}
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let class = find_class(&results, "DataService").expect("DataService should exist");
        let params = class.constructor_params.as_ref().unwrap();
        assert_eq!(params.len(), 1);
        assert_eq!(params[0].type_name.as_deref(), Some("Logger"));
        assert!(!params[0].is_type_only);
    }

    #[test]
    fn test_constructor_params_import_type_detection() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["service.ts"]}"#,
            ),
            (
                "/test/service.ts",
                r#"
import { Injectable } from '@angular/core';
import type { SomeConfig } from './config';

class Logger {}

@Injectable({ providedIn: 'root' })
export class DataService {
    constructor(
        private logger: Logger,
        private config: SomeConfig,
    ) {}
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let class = find_class(&results, "DataService").expect("DataService should exist");
        let params = class.constructor_params.as_ref().unwrap();
        assert_eq!(params.len(), 2);

        // Logger is a class — has a runtime value
        assert!(!params[0].is_type_only);

        // SomeConfig is imported via `import type` — always type-only
        assert!(params[1].is_type_only);
    }

    #[test]
    fn test_cross_file_type_only_di_token_in_optimize_mode() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {"strict": true}, "files": ["config.ts", "user.service.ts"]}"#,
            ),
            (
                "/test/config.ts",
                r#"
export type ServiceOptions = {
  verbose: boolean;
};

export class Logger {}
"#,
            ),
            (
                "/test/user.service.ts",
                r#"
import { Injectable } from '@angular/core';
import { ServiceOptions, Logger } from './config';

@Injectable({ providedIn: 'root' })
export class UserIncompatibleOptionsService {
  constructor(private options: ServiceOptions, private logger: Logger) {}
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);
        let class_meta = find_class(&results, "UserIncompatibleOptionsService")
            .expect("UserIncompatibleOptionsService should exist");
        let params = class_meta.constructor_params.as_ref().unwrap();
        assert!(
            params[0].is_type_only,
            "ServiceOptions should be detected as type-only in optimize mode"
        );
        assert!(
            !params[1].is_type_only,
            "Logger class should NOT be detected as type-only in optimize mode"
        );
    }

    /// `is_value_verified` is what lets `ɵsetClassMetadata` drop the `@ts-ignore` on a parameter
    /// type, so it must be set only when the consumer's binding is known to reach a runtime value.
    fn value_kind_fixture() -> OverlayFileSystem {
        create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {"strict": true}, "files": ["user.service.ts"]}"#,
            ),
            (
                "/test/classes.ts",
                r#"
export class Direct {}
export class ImportedAsType {}
export class ExportedAsType {}
export class ReexportedAsType {}
export class RenamedImport {}
export class RenamedInline {}
export class DefaultTyped {}
export interface Config {}
"#,
            ),
            (
                // Each type-only export here renames, so the name the consumer asks for is not the
                // name this file binds.
                "/test/renamed.ts",
                r#"
import { RenamedImport, RenamedInline } from './classes';
export type { RenamedImport as RenamedExportType };
export { type RenamedInline as RenamedInlineType };
class LocalRenamed {}
export type { LocalRenamed as LocalRenamedType };
class Both {}
export { Both as BothValue };
export type { Both };
"#,
            ),
            (
                "/test/forward.ts",
                r#"
export { RenamedExportType as Forwarded } from './renamed';
"#,
            ),
            (
                "/test/default_type.ts",
                r#"
import { DefaultTyped } from './classes';
export type { DefaultTyped as default };
"#,
            ),
            (
                "/test/namespaces.ts",
                r#"
import type * as typeNs from './classes';
import * as valueNs from './classes';
import * as plainNs from './classes';
export { typeNs, plainNs };
export type { valueNs };
"#,
            ),
            (
                "/test/node_modules/pkg/package.json",
                r#"{"name": "pkg", "types": "index.d.ts"}"#,
            ),
            (
                "/test/node_modules/pkg/index.d.ts",
                r#"
export declare class PkgClass {}
export interface PkgInterface {}
"#,
            ),
            (
                "/test/barrel.ts",
                r#"
import type { ImportedAsType } from './classes';
import { ExportedAsType } from './classes';
export { Direct, Config } from './classes';
export { ImportedAsType };
export type { ExportedAsType };
export type { ReexportedAsType } from './classes';
class DeclaredAsType {}
export type { DeclaredAsType };
"#,
            ),
            (
                "/test/user.service.ts",
                r#"
import { Injectable } from '@angular/core';
import {
  Direct,
  Config,
  ImportedAsType,
  ExportedAsType,
  ReexportedAsType,
  DeclaredAsType,
} from './barrel';
import {
  RenamedExportType,
  RenamedInlineType,
  LocalRenamedType,
  BothValue,
  Both,
} from './renamed';
import { Forwarded } from './forward';
import DefaultTyped from './default_type';
import * as ns from './namespaces';
import { PkgClass, PkgInterface } from 'pkg';
import * as pkg from 'pkg';

class Local {}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(
    private local: Local,
    private direct: Direct,
    private config: Config,
    private importedAsType: ImportedAsType,
    private exportedAsType: ExportedAsType,
    private reexportedAsType: ReexportedAsType,
    private declaredAsType: DeclaredAsType,
    private renamedExportType: RenamedExportType,
    private renamedInlineType: RenamedInlineType,
    private localRenamedType: LocalRenamedType,
    private bothValue: BothValue,
    private both: Both,
    private forwarded: Forwarded,
    private defaultTyped: DefaultTyped,
    private typeNs: ns.typeNs.Direct,
    private valueNs: ns.valueNs.Direct,
    private plainNs: ns.plainNs.Direct,
    private pkgClass: PkgClass,
    private pkgInterface: PkgInterface,
    private qualifiedPkgClass: pkg.PkgClass,
  ) {}
}
"#,
            ),
        ])
    }

    /// `(type_name, is_type_only, is_value_verified)` for each `UserService` constructor parameter.
    fn value_kinds(optimize: bool) -> Vec<(String, bool, bool)> {
        let results = run_analyzer(value_kind_fixture(), "/test/tsconfig.json", optimize);
        let class_meta = find_class(&results, "UserService").expect("UserService should exist");
        class_meta
            .constructor_params
            .as_ref()
            .unwrap()
            .iter()
            .map(|p| {
                (
                    p.type_name.clone().unwrap(),
                    p.is_type_only,
                    p.is_value_verified,
                )
            })
            .collect()
    }

    fn kind(name: &str, is_type_only: bool, is_value_verified: bool) -> (String, bool, bool) {
        (name.to_string(), is_type_only, is_value_verified)
    }

    #[test]
    fn test_value_verified_in_standard_mode() {
        // Single-file analysis can only prove a class declared in the same file; every import is
        // emitted optimistically under a guard.
        assert_eq!(
            value_kinds(false),
            vec![
                kind("Local", false, true),
                kind("Direct", false, false),
                kind("Config", false, false),
                kind("ImportedAsType", false, false),
                kind("ExportedAsType", false, false),
                kind("ReexportedAsType", false, false),
                kind("DeclaredAsType", false, false),
                kind("RenamedExportType", false, false),
                kind("RenamedInlineType", false, false),
                kind("LocalRenamedType", false, false),
                kind("BothValue", false, false),
                kind("Both", false, false),
                kind("Forwarded", false, false),
                kind("DefaultTyped", false, false),
                kind("ns.typeNs.Direct", false, false),
                kind("ns.valueNs.Direct", false, false),
                kind("ns.plainNs.Direct", false, false),
                kind("PkgClass", false, false),
                kind("PkgInterface", false, false),
                kind("pkg.PkgClass", false, false),
            ]
        );
    }

    #[test]
    fn test_value_verified_in_optimize_mode() {
        // Optimize mode chases each import. Only `Direct` reaches a class through files that all
        // hand the value on; each `*AsType` class sits behind a barrel that re-exports it in type
        // position only, so it stays unverified (and guarded) rather than becoming type-only.
        assert_eq!(
            value_kinds(true),
            vec![
                kind("Local", false, true),
                kind("Direct", false, true),
                kind("Config", true, false),
                kind("ImportedAsType", false, false),
                kind("ExportedAsType", false, false),
                kind("ReexportedAsType", false, false),
                kind("DeclaredAsType", false, false),
                // A renaming export is judged by the name it exports, not the name it binds:
                // `export type { X as Y }` makes `Y` type-only, and `export type { Both }` does
                // not taint `export { Both as BothValue }`.
                kind("RenamedExportType", false, false),
                kind("RenamedInlineType", false, false),
                kind("LocalRenamedType", false, false),
                kind("BothValue", false, true),
                kind("Both", false, false),
                // A plain re-export further down the chain does not launder a type-only hop.
                kind("Forwarded", false, false),
                kind("DefaultTyped", false, false),
                // `ns.typeNs` and `ns.valueNs` are namespaces the barrel binds or exports in type
                // position, so reaching `Direct` through them is no value either.
                kind("ns.typeNs.Direct", false, false),
                kind("ns.valueNs.Direct", false, false),
                kind("ns.plainNs.Direct", false, true),
                // `export declare class` in a `.d.ts` is an ambient *value* declaration, even
                // though oxc records its export entry as TypeScript-only syntax.
                kind("PkgClass", false, true),
                kind("PkgInterface", true, false),
                kind("pkg.PkgClass", false, true),
            ]
        );
    }

    #[test]
    fn test_value_verified_local_class_shadows_reexported_interface() {
        // `export { Foo } from './iface'` binds nothing here, so `Foo` in the constructor is the
        // local class. The chase looks at a file's exports before its root bindings and would
        // report the interface as `TypeOnly`, so the cross-file pass must leave a parameter the
        // in-file pass already verified alone, or it ends up both verified and type-only.
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {"strict": true}, "files": ["user.service.ts"]}"#,
            ),
            ("/test/iface.ts", "export interface Foo {}\n"),
            (
                "/test/user.service.ts",
                r#"
import { Injectable } from '@angular/core';
export { Foo } from './iface';

class Foo {}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private foo: Foo) {}
}
"#,
            ),
        ]);
        for optimize in [false, true] {
            let results = run_analyzer(fs.clone(), "/test/tsconfig.json", optimize);
            let class_meta = find_class(&results, "UserService").expect("UserService should exist");
            let param = &class_meta.constructor_params.as_ref().unwrap()[0];
            assert!(
                !param.is_type_only && param.is_value_verified,
                "optimize={optimize}: expected a verified value, got is_type_only={} is_value_verified={}",
                param.is_type_only,
                param.is_value_verified,
            );
        }
    }

    #[test]
    fn test_constructor_params_qualified_type_detection() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts"]}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Injectable } from '@angular/core';
import * as ns from './service';
import type * as typeNs from './service';

@Injectable({ providedIn: 'root' })
export class DataService {
    constructor(
        private logger: ns.Logger,
        private config: ns.LoggerConfig,
        private reexported: ns.ReexportedService,
        private typeOnlyNsLogger: typeNs.Logger,
    ) {}
}
"#,
            ),
            (
                "/test/service.ts",
                r#"
export class Logger {}
export interface LoggerConfig {}
export { ReexportedService } from './other';
"#,
            ),
            (
                "/test/other.ts",
                r#"
export class ReexportedService {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);
        let class = find_class(&results, "DataService").expect("DataService should exist");
        let params = class.constructor_params.as_ref().unwrap();
        assert_eq!(params.len(), 4);

        // ns.Logger is a class — has a runtime value
        assert_eq!(params[0].type_name.as_deref(), Some("ns.Logger"));
        assert!(!params[0].is_type_only);

        // ns.LoggerConfig is an interface — type-only, no runtime value
        assert_eq!(params[1].type_name.as_deref(), Some("ns.LoggerConfig"));
        assert!(params[1].is_type_only);

        // ns.ReexportedService is re-exported from another file — has a runtime value
        assert_eq!(params[2].type_name.as_deref(), Some("ns.ReexportedService"));
        assert!(!params[2].is_type_only);

        // typeNs.Logger is imported with `import type * as typeNs` — type-only import
        assert_eq!(params[3].type_name.as_deref(), Some("typeNs.Logger"));
        assert!(params[3].is_type_only);
    }

    #[test]
    fn test_constructor_params_ambient_and_local_namespace_type_detection() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts"]}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Injectable } from '@angular/core';
import * as core from '@angular/core';

namespace LocalTypeOnlyNs {
    export interface Config {}
}

namespace LocalValueNs {
    export class Service {}
}

declare namespace AmbientDeclaredNs {
    export interface Options {}
}

@Injectable({ providedIn: 'root' })
export class DataService {
    constructor(
        private gtag: Gtag.Gtag,
        private ngZone: core.NgZone,
        private localTypeConfig: LocalTypeOnlyNs.Config,
        private localVal: LocalValueNs.Service,
        private ambientOptions: AmbientDeclaredNs.Options,
    ) {}
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let class = find_class(&results, "DataService").expect("DataService should exist");
        let params = class.constructor_params.as_ref().unwrap();
        assert_eq!(params.len(), 5);

        // 1. Ambient namespace (Gtag.Gtag) — unimported with no local value, treated as type-only
        assert_eq!(params[0].type_name.as_deref(), Some("Gtag.Gtag"));
        assert!(params[0].is_type_only);

        // 2. Imported namespace (core.NgZone) — imported, treated as value in single-file phase
        assert_eq!(params[1].type_name.as_deref(), Some("core.NgZone"));
        assert!(!params[1].is_type_only);

        // 3. Local namespace with only types (LocalTypeOnlyNs.Config) — type-only
        assert_eq!(
            params[2].type_name.as_deref(),
            Some("LocalTypeOnlyNs.Config")
        );
        assert!(params[2].is_type_only);

        // 4. Local namespace with runtime value (LocalValueNs.Service) — value
        assert_eq!(params[3].type_name.as_deref(), Some("LocalValueNs.Service"));
        assert!(!params[3].is_type_only);

        // 5. Ambient declared namespace (AmbientDeclaredNs.Options) — type-only
        assert_eq!(
            params[4].type_name.as_deref(),
            Some("AmbientDeclaredNs.Options")
        );
        assert!(params[4].is_type_only);
    }

    #[test]
    fn test_multi_file_import_discovery() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts"]}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component } from '@angular/core';
import { ButtonComponent } from './button.component';

@Component({
    selector: 'app-root',
    template: '<app-button></app-button>',
    standalone: true,
    imports: [ButtonComponent],
})
export class AppComponent {}
"#,
            ),
            (
                "/test/button.component.ts",
                r#"
import { Component } from '@angular/core';

@Component({
    selector: 'app-button',
    template: '<button>Click me</button>',
    standalone: true,
})
export class ButtonComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        // Both files should be analyzed (import discovery)
        assert_eq!(results.len(), 2);
        assert_class_exists(&results, "AppComponent");
        assert_class_exists(&results, "ButtonComponent");
    }

    #[test]
    fn test_injectable_without_provided_in() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["service.ts"]}"#,
            ),
            (
                "/test/service.ts",
                r#"
import { Injectable } from '@angular/core';

@Injectable()
export class SimpleService {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        let class = find_class(&results, "SimpleService").expect("SimpleService should exist");
        assert!(class.injectable.is_some());
        assert!(class.injectable.as_ref().unwrap().provided_in.is_none());
    }

    #[test]
    fn test_component_with_template_url() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts"]}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: true,
})
export class AppComponent {}
"#,
            ),
            ("/test/app.component.html", "<div>Hello World</div>"),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        let class = find_class(&results, "AppComponent").expect("AppComponent should exist");
        assert!(class.component.is_some());
        let component = class.component.as_ref().unwrap();
        let t_url = component.template_url.as_ref().unwrap();
        assert_eq!(t_url.url, "./app.component.html");
        assert_eq!(t_url.resolved_path, "/test/app.component.html");
        assert_eq!(
            component.template,
            Some("<div>Hello World</div>".to_string())
        );
    }

    #[test]
    fn test_component_template_literal() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts"]}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    template: `
      <div>
        Hello World
      </div>
    `,
    standalone: true,
})
export class AppComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        let class_meta = find_class(&results, "AppComponent").expect("AppComponent should exist");
        assert!(class_meta.component.is_some());
        let component = class_meta.component.as_ref().unwrap();

        // Should extract the template content (whitespace handling might vary, but it should be Some)
        assert!(
            component.template.is_some(),
            "Template should be extracted from template literal"
        );
        let template = component.template.as_ref().unwrap();
        assert!(template.contains("Hello World"));
        assert!(
            !component.template_dynamic,
            "A fully static template literal must not be flagged dynamic"
        );
    }

    /// Regression test: an inline `template` that is a template literal with a
    /// runtime `${...}` substitution (e.g. a closure parameter) cannot be statically
    /// evaluated. ngtsc raises a fatal diagnostic for such templates; we must flag it
    /// (`template_dynamic`) so the pipeline errors instead of silently emitting an
    /// EMPTY template (which renders nothing and broke 264 runtime security tests —
    /// see scratch/acceptance-fixes/02-security-spec-cluster.md).
    #[test]
    fn test_component_dynamic_template_literal_flagged() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts"]}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component } from '@angular/core';

export function make(attr: string) {
    @Component({
        selector: 'app-root',
        template: `<iframe src="x" [${attr}]="''"></iframe>`,
        standalone: true,
    })
    class AppComponent {}
    return AppComponent;
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        let class_meta = find_class(&results, "AppComponent").expect("AppComponent should exist");
        let component = class_meta.component.as_ref().unwrap();
        assert_eq!(
            component.template, None,
            "Dynamic template must not be constant-folded"
        );
        assert!(
            component.template_dynamic,
            "Non-static inline template must be flagged template_dynamic"
        );
    }

    /// Counterpart: substitutions that resolve to constants must still be folded
    /// (mirrors the `non_literal_template_with_substitution` compliance case).
    #[test]
    fn test_component_const_substitution_template_literal_not_flagged() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts"]}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component } from '@angular/core';

const greeting = 'Hello!';
const myTemplate = `<div>${greeting}</div>`;

@Component({
    selector: 'app-root',
    template: myTemplate,
    standalone: true,
})
export class AppComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        let class_meta = find_class(&results, "AppComponent").expect("AppComponent should exist");
        let component = class_meta.component.as_ref().unwrap();
        assert_eq!(
            component.template,
            Some("<div>Hello!</div>".to_string()),
            "Constant substitutions must still be folded"
        );
        assert!(!component.template_dynamic);
    }

    /// Only a `template` written as a string literal or a no-substitution template literal is
    /// mapped `direct`ly onto the component file (ngtsc's `extractTemplate`); the content span
    /// then covers the literal's source text between its delimiters, escapes and all. Every
    /// other expression is `indirect` and carries no content span.
    #[test]
    fn test_component_template_content_span_only_for_direct_literals() {
        let source = r#"
import { Component } from '@angular/core';

const TPL = '<i>{{ c }}</i>';
const TAG = 'b';

@Component({ selector: 'a-cmp', template: '<p>\u00e9\n\'</p>{{ a }}', standalone: true })
export class ACmp {}

@Component({ selector: 'b-cmp', template: `<p>
</p>{{ b }}`, standalone: true })
export class BCmp {}

@Component({ selector: 'c-cmp', template: TPL, standalone: true })
export class CCmp {}

@Component({ selector: 'd-cmp', template: `<${TAG}>{{ d }}</${TAG}>`, standalone: true })
export class DCmp {}

@Component({ selector: 'e-cmp', template: ('<p>{{ e }}</p>'), standalone: true })
export class ECmp {}
"#;
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts"]}"#,
            ),
            ("/test/app.component.ts", source),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let content_text = |class_name: &str| {
            let class_meta = find_class(&results, class_name).expect("class should exist");
            let component = class_meta.component.as_ref().unwrap();
            component
                .template_content_span
                .as_ref()
                .map(|span| source[span.start as usize..span.end as usize].to_string())
        };

        assert_eq!(
            content_text("ACmp").as_deref(),
            Some(r"<p>\u00e9\n\'</p>{{ a }}")
        );
        assert_eq!(content_text("BCmp").as_deref(), Some("<p>\n</p>{{ b }}"));
        assert_eq!(content_text("CCmp"), None, "an identifier is indirect");
        assert_eq!(content_text("DCmp"), None, "substitutions are indirect");
        assert_eq!(
            content_text("ECmp"),
            None,
            "a parenthesized literal is indirect"
        );
    }

    #[test]
    fn test_component_cross_file_template_literal_interpolation() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts", "constants.ts"]}"#,
            ),
            (
                "/test/constants.ts",
                r#"
export const GREETING = 'Hello!';
"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component } from '@angular/core';
import { GREETING } from './constants';

@Component({
    selector: 'app-root',
    template: `<p>${GREETING}</p>`,
    standalone: true,
})
export class AppComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);

        let class_meta = find_class(&results, "AppComponent").expect("AppComponent should exist");
        let component = class_meta.component.as_ref().unwrap();
        assert_eq!(
            component.template,
            Some("<p>Hello!</p>".to_string()),
            "Cross-file template literal interpolation must be folded in optimize mode"
        );
        assert!(!component.template_dynamic);
    }

    /// Numeric, boolean, and null literals used as templates are non-string primitives
    /// and must be flagged as template_dynamic (ngtsc: "template must be a string").
    #[test]
    fn test_component_primitive_number_template_flagged() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts"]}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    template: 123 as any,
    standalone: true,
})
export class AppComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        let class_meta = find_class(&results, "AppComponent").expect("AppComponent should exist");
        let component = class_meta.component.as_ref().unwrap();
        assert_eq!(component.template, None);
        assert!(component.template_dynamic);
    }

    #[test]
    fn test_constructor_injection_args() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["service.ts"]}"#,
            ),
            (
                "/test/service.ts",
                r#"
import { Injectable, Inject } from '@angular/core';

export const TOKEN = 'TOKEN';
export const Namespace = { Token: 'NSToken' };

@Injectable()
export class Service {
    constructor(
        @Inject('literal-token') public literal: string,
        @Inject(TOKEN) public token: string,
        @Inject(Namespace.Token) public nsToken: string,
    ) {}
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let class_meta = find_class(&results, "Service").expect("Service should exist");
        let params = class_meta.constructor_params.as_ref().unwrap();

        assert_eq!(params.len(), 3);

        // Check literal
        let literal_dec = &params[0].decorators[0];
        assert_eq!(literal_dec.name, "Inject");
        let literal_arg = &literal_dec.args.as_ref().unwrap()[0];
        assert_eq!(literal_arg.value, "literal-token");
        assert!(literal_arg.is_literal);

        // Check token identifier
        let token_dec = &params[1].decorators[0];
        let token_arg = &token_dec.args.as_ref().unwrap()[0];
        assert_eq!(token_arg.value, "TOKEN");
        assert!(!token_arg.is_literal);

        // Check namespace token
        let ns_dec = &params[2].decorators[0];
        let ns_arg = &ns_dec.args.as_ref().unwrap()[0];
        assert_eq!(ns_arg.value, "Namespace.Token");
        assert!(!ns_arg.is_literal);
    }

    #[test]
    fn test_type_parameters_extraction() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["generic.component.ts"]}"#,
            ),
            (
                "/test/generic.component.ts",
                r#"
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-generic',
    template: '',
    standalone: true,
})
export class GenericComponent<T, U = string> {
    @Input() value: T | null = null;
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        assert_eq!(results.len(), 1, "Expected 1 result from analyzer");
        let class_meta =
            find_class(&results, "GenericComponent").expect("GenericComponent should exist");

        // Check type parameters
        assert!(
            class_meta.type_parameters.is_some(),
            "Type parameters should be extracted"
        );
        let params = class_meta.type_parameters.as_ref().unwrap();
        assert_eq!(params.len(), 2);

        assert_eq!(params[0].name, "T");
        assert_eq!(params[0].representation, "T");
        assert_eq!(params[0].representation_with_default, "T = any");
        assert!(!params[0].has_default);

        assert_eq!(params[1].name, "U");
        assert_eq!(params[1].representation, "U = string");
        assert_eq!(params[1].representation_with_default, "U = string");
        assert!(params[1].has_default);
    }

    #[test]
    fn test_type_parameters_with_constraints() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["constrained.component.ts"]}"#,
            ),
            (
                "/test/constrained.component.ts",
                r#"
import { Component } from '@angular/core';

@Component({
    selector: 'app-constrained',
    template: '',
    standalone: true,
})
export class ConstrainedComponent<T extends object, U extends T = T> {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        let class_meta = find_class(&results, "ConstrainedComponent")
            .expect("ConstrainedComponent should exist");
        let params = class_meta.type_parameters.as_ref().unwrap();
        assert_eq!(params.len(), 2);

        // T extends object
        assert_eq!(params[0].name, "T");
        assert_eq!(params[0].representation, "T extends object");
        assert_eq!(
            params[0].representation_with_default,
            "T extends object = any"
        );
        assert!(!params[0].has_default);

        // U extends T = T
        assert_eq!(params[1].name, "U");
        assert_eq!(params[1].representation, "U extends T = T");
        assert_eq!(params[1].representation_with_default, "U extends T = T");
        assert!(params[1].has_default);
    }

    #[test]
    fn test_type_parameters_multiline_and_comments() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["complex.component.ts"]}"#,
            ),
            (
                "/test/complex.component.ts",
                r#"
import { Component } from '@angular/core';

@Component({
    selector: 'app-complex',
    template: '',
    standalone: true,
})
export class ComplexComponent<
    T /* foobar */ extends Record<string, any> = {},
    U = T,
> {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        let class_meta =
            find_class(&results, "ComplexComponent").expect("ComplexComponent should exist");
        let params = class_meta.type_parameters.as_ref().unwrap();
        assert_eq!(params.len(), 2);

        // T /* foobar */ extends Record<string, any> = {}
        assert_eq!(params[0].name, "T");
        assert_eq!(
            params[0].representation,
            "T /* foobar */ extends Record<string, any> = {}"
        );
        assert_eq!(
            params[0].representation_with_default,
            "T /* foobar */ extends Record<string, any> = {}"
        );
        assert!(params[0].has_default);

        // U = T
        assert_eq!(params[1].name, "U");
        assert_eq!(params[1].representation, "U = T");
        assert_eq!(params[1].representation_with_default, "U = T");
        assert!(params[1].has_default);
    }

    #[test]
    fn test_type_parameters_with_imported_type_refs() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts", "models.ts"]}"#,
            ),
            (
                "/test/models.ts",
                r#"
export interface SelectionModel<T> {}
export interface DefaultItem {}
"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component } from '@angular/core';
import { SelectionModel, DefaultItem } from './models';

@Component({
    selector: 'app-root',
    template: '',
    standalone: true,
})
export class SelectionComponent<T extends SelectionModel<unknown> = DefaultItem> {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        let class_meta =
            find_class(&results, "SelectionComponent").expect("SelectionComponent should exist");
        let params = class_meta.type_parameters.as_ref().unwrap();
        assert_eq!(params.len(), 1);

        assert_eq!(params[0].name, "T");
        let type_refs = params[0]
            .type_refs
            .as_ref()
            .expect("type_refs should be present");
        assert_eq!(type_refs.len(), 2);
        assert_eq!(type_refs[0].name, "SelectionModel");
        assert_eq!(type_refs[0].module_specifier, "./models");
        assert_eq!(type_refs[0].symbol, "SelectionModel");
        assert_eq!(type_refs[1].name, "DefaultItem");
        assert_eq!(type_refs[1].module_specifier, "./models");
        assert_eq!(type_refs[1].symbol, "DefaultItem");
    }

    #[test]
    fn test_type_parameters_with_various_import_kinds() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts", "models.ts", "default_model.ts"]}"#,
            ),
            (
                "/test/models.ts",
                r#"
export interface SelectionModel<T> {}
export interface DefaultItem {}
export const defaultSelection = { id: 'default' };
export enum ProtoFormat { JSPB = 0 }
export type ProtoFormatType = { [ProtoFormat.JSPB]: string };
"#,
            ),
            (
                "/test/default_model.ts",
                r#"
export default interface DefaultFallback {}
"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component } from '@angular/core';
import { SelectionModel as CustomModel, defaultSelection, ProtoFormat, ProtoFormatType } from './models';
import * as models from './models';
import DefaultFallback from './default_model';

export interface LocalType {}

@Component({
    selector: 'app-root',
    template: '',
    standalone: true,
})
export class ComplexSelectionComponent<
    T extends CustomModel<unknown> = models.SelectionModel<DefaultFallback>,
    U extends typeof defaultSelection = typeof defaultSelection,
    V extends LocalType = LocalType,
    W extends ProtoFormatType[F] = any,
    F extends ProtoFormat = ProtoFormat.JSPB,
> {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        let class_meta = find_class(&results, "ComplexSelectionComponent")
            .expect("ComplexSelectionComponent should exist");
        let params = class_meta.type_parameters.as_ref().unwrap();
        assert_eq!(params.len(), 5);

        // T: aliased named import + namespace qualified import + default import
        assert_eq!(params[0].name, "T");
        let type_refs_0 = params[0].type_refs.as_ref().unwrap();
        assert_eq!(type_refs_0.len(), 3);
        assert_eq!(type_refs_0[0].name, "CustomModel");
        assert_eq!(type_refs_0[0].module_specifier, "./models");
        assert_eq!(type_refs_0[0].symbol, "SelectionModel");
        assert_eq!(type_refs_0[1].name, "models.SelectionModel");
        assert_eq!(type_refs_0[1].module_specifier, "./models");
        assert_eq!(type_refs_0[1].symbol, "SelectionModel");
        assert_eq!(type_refs_0[2].name, "DefaultFallback");
        assert_eq!(type_refs_0[2].module_specifier, "./default_model");
        assert_eq!(type_refs_0[2].symbol, "default");

        // U: typeof query with imported value (in constraint and default)
        assert_eq!(params[1].name, "U");
        let type_refs_1 = params[1].type_refs.as_ref().unwrap();
        assert_eq!(type_refs_1.len(), 2);
        assert_eq!(type_refs_1[0].name, "defaultSelection");
        assert_eq!(type_refs_1[0].module_specifier, "./models");
        assert_eq!(type_refs_1[0].symbol, "defaultSelection");
        assert_eq!(type_refs_1[1].name, "defaultSelection");
        assert_eq!(type_refs_1[1].module_specifier, "./models");
        assert_eq!(type_refs_1[1].symbol, "defaultSelection");

        // V: local exported type (in constraint and default)
        assert_eq!(params[2].name, "V");
        let type_refs_2 = params[2].type_refs.as_ref().unwrap();
        assert_eq!(type_refs_2.len(), 2);
        assert_eq!(type_refs_2[0].name, "LocalType");
        assert_eq!(type_refs_2[0].module_specifier, "");
        assert_eq!(type_refs_2[0].symbol, "LocalType");
        assert_eq!(type_refs_2[1].name, "LocalType");
        assert_eq!(type_refs_2[1].module_specifier, "");
        assert_eq!(type_refs_2[1].symbol, "LocalType");

        // W: ProtoFormatType[F]
        assert_eq!(params[3].name, "W");
        let type_refs_3 = params[3].type_refs.as_ref().unwrap();
        assert_eq!(type_refs_3.len(), 1);
        assert_eq!(type_refs_3[0].name, "ProtoFormatType");
        assert_eq!(type_refs_3[0].module_specifier, "./models");
        assert_eq!(type_refs_3[0].symbol, "ProtoFormatType");

        // F: ProtoFormat with ProtoFormat.JSPB default
        assert_eq!(params[4].name, "F");
        assert_eq!(
            params[4].representation,
            "F extends ProtoFormat = ProtoFormat.JSPB"
        );
        assert_eq!(
            params[4].representation_with_default,
            "F extends ProtoFormat = ProtoFormat.JSPB"
        );
        let type_refs_4 = params[4].type_refs.as_ref().unwrap();
        assert_eq!(type_refs_4.len(), 2);
        assert_eq!(type_refs_4[0].name, "ProtoFormat");
        assert_eq!(type_refs_4[0].module_specifier, "./models");
        assert_eq!(type_refs_4[0].symbol, "ProtoFormat");
        assert_eq!(type_refs_4[1].name, "ProtoFormat.JSPB");
        assert_eq!(type_refs_4[1].module_specifier, "./models");
        assert_eq!(type_refs_4[1].symbol, "ProtoFormat.JSPB");
    }

    #[test]
    fn test_dts_type_parameters_with_unexported_type_alias() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["teleport.d.ts"]}"#,
            ),
            (
                "/test/teleport.d.ts",
                r#"
import * as i0 from '@angular/core';

type PortalComponentType = any;

export declare class FireTeleportalOutlet<C extends PortalComponentType, D> {
    static ɵdir: i0.ɵɵDirectiveDeclaration<FireTeleportalOutlet<any, any>, "[fireTeleportalOutlet]", never, {}, {}, never, never, true, never>;
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        let class_meta = find_class(&results, "FireTeleportalOutlet")
            .expect("FireTeleportalOutlet should exist");
        assert!(class_meta.has_non_exported_bounds);
        let params = class_meta.type_parameters.as_ref().unwrap();
        assert_eq!(params.len(), 2);
        assert_eq!(params[0].name, "C");
        assert!(params[0].type_refs.is_none());
    }

    #[test]
    fn test_dts_type_parameters_with_exported_type_alias() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["teleport.d.ts"]}"#,
            ),
            (
                "/test/teleport.d.ts",
                r#"
import * as i0 from '@angular/core';

export type PortalComponentType = any;

export declare class FireTeleportalOutlet<C extends PortalComponentType, D> {
    static ɵdir: i0.ɵɵDirectiveDeclaration<FireTeleportalOutlet<any, any>, "[fireTeleportalOutlet]", never, {}, {}, never, never, true, never>;
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        let class_meta = find_class(&results, "FireTeleportalOutlet")
            .expect("FireTeleportalOutlet should exist");
        assert!(!class_meta.has_non_exported_bounds);
    }

    #[test]
    fn test_dts_type_parameters_with_named_export_list() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["teleport.d.ts"]}"#,
            ),
            (
                "/test/teleport.d.ts",
                r#"
import * as i0 from '@angular/core';

type PortalComponentType = any;
export type { PortalComponentType };

export declare class FireTeleportalOutlet<C extends PortalComponentType, D> {
    static ɵdir: i0.ɵɵDirectiveDeclaration<FireTeleportalOutlet<any, any>, "[fireTeleportalOutlet]", never, {}, {}, never, never, true, never>;
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        let class_meta = find_class(&results, "FireTeleportalOutlet")
            .expect("FireTeleportalOutlet should exist");
        assert!(!class_meta.has_non_exported_bounds);
    }

    #[test]
    fn test_cross_file_transform_type() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts"]}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component, Input, input } from '@angular/core';
import { myBooleanTransform } from './transforms';

@Component({
    selector: 'app-root',
    template: '',
    standalone: true,
})
export class AppComponent {
    @Input({ transform: myBooleanTransform }) decoratorInput: boolean = false;
    signalInput = input(false, { transform: myBooleanTransform });
}
"#,
            ),
            (
                "/test/transforms.ts",
                r#"
export function myBooleanTransform(value: string | boolean): boolean {
    return value === '' || value === true || value === 'true';
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        let class = find_class(&results, "AppComponent").expect("AppComponent should exist");

        let app_source = "\nimport { Component, Input, input } from '@angular/core';\nimport { myBooleanTransform } from './transforms';\n\n@Component({\n    selector: 'app-root',\n    template: '',\n    standalone: true,\n})\nexport class AppComponent {\n    @Input({ transform: myBooleanTransform }) decoratorInput: boolean = false;\n    signalInput = input(false, { transform: myBooleanTransform });\n}\n";

        // Assert decorator input
        let dec_in = class
            .inputs
            .iter()
            .find(|i| i.name == "decoratorInput")
            .unwrap();
        let dec_t = dec_in.transform.as_ref().unwrap();
        assert_eq!(dec_t.kind, "expression");
        assert_eq!(
            &app_source[dec_t.span.start as usize..dec_t.span.end as usize],
            "myBooleanTransform"
        );

        // Assert signal input
        let sig_in = class
            .inputs
            .iter()
            .find(|i| i.name == "signalInput")
            .unwrap();
        let sig_t = sig_in.transform.as_ref().unwrap();
        assert_eq!(sig_t.kind, "expression");
        assert_eq!(
            &app_source[sig_t.span.start as usize..sig_t.span.end as usize],
            "myBooleanTransform"
        );
    }

    #[test]
    fn test_cross_file_transform_type_advanced() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts"]}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component, Input, input } from '@angular/core';
// Aliased import
import { arrowTransform as aliasedTransform } from './transforms';
// Regular import for function expression
import { funcExprTransform } from './transforms';

@Component({
    selector: 'app-root',
    template: '',
    standalone: true,
})
export class AppComponent {
    @Input({ transform: aliasedTransform }) aliasedInput: unknown;
    signalInput = input(0, { transform: funcExprTransform });
}
"#,
            ),
            (
                "/test/transforms.ts",
                r#"
// Arrow function
export const arrowTransform = (val: number | string) => val;

// Function expression assigned to const
export const funcExprTransform = function(val: boolean | null) { return val; };
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        let class = find_class(&results, "AppComponent").expect("AppComponent should exist");

        let app_source = "\nimport { Component, Input, input } from '@angular/core';\n// Aliased import\nimport { arrowTransform as aliasedTransform } from './transforms';\n// Regular import for function expression\nimport { funcExprTransform } from './transforms';\n\n@Component({\n    selector: 'app-root',\n    template: '',\n    standalone: true,\n})\nexport class AppComponent {\n    @Input({ transform: aliasedTransform }) aliasedInput: unknown;\n    signalInput = input(0, { transform: funcExprTransform });\n}\n";

        let aliased = class
            .inputs
            .iter()
            .find(|i| i.name == "aliasedInput")
            .unwrap();
        let aliased_t = aliased.transform.as_ref().unwrap();
        assert_eq!(aliased_t.kind, "expression");
        assert_eq!(
            &app_source[aliased_t.span.start as usize..aliased_t.span.end as usize],
            "aliasedTransform"
        );

        let func_expr = class
            .inputs
            .iter()
            .find(|i| i.name == "signalInput")
            .unwrap();
        let func_t = func_expr.transform.as_ref().unwrap();
        assert_eq!(func_t.kind, "expression");
        assert_eq!(
            &app_source[func_t.span.start as usize..func_t.span.end as usize],
            "funcExprTransform"
        );
    }

    #[test]
    fn test_cross_file_transform_type_qualified() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts"]}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component, Input, input } from '@angular/core';
import { qualifiedTransform } from './transforms';

@Component({
    selector: 'app-root',
    template: '',
    standalone: true,
})
export class AppComponent {
    @Input({ transform: qualifiedTransform }) myInput: unknown;
}
"#,
            ),
            (
                "/test/transforms.ts",
                r#"
export namespace MyLib {
    export type SpecialType<T> = T;
}

export function qualifiedTransform(val: MyLib.SpecialType<string>): string {
    return val;
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let class = find_class(&results, "AppComponent").expect("AppComponent should exist");
        let app_source = "\nimport { Component, Input, input } from '@angular/core';\nimport { qualifiedTransform } from './transforms';\n\n@Component({\n    selector: 'app-root',\n    template: '',\n    standalone: true,\n})\nexport class AppComponent {\n    @Input({ transform: qualifiedTransform }) myInput: unknown;\n}\n";

        let my_in = class.inputs.iter().find(|i| i.name == "myInput").unwrap();
        let my_t = my_in.transform.as_ref().unwrap();
        assert_eq!(my_t.kind, "expression");
        assert_eq!(
            &app_source[my_t.span.start as usize..my_t.span.end as usize],
            "qualifiedTransform"
        );
    }
    #[test]
    fn test_name_span_extraction() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["app.component.ts"]}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    template: '<div>Test Name Span</div>',
    standalone: true,
})
export class AppComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        assert_eq!(results.len(), 1);

        let class_meta = find_class(&results, "AppComponent").expect("AppComponent should exist");
        assert!(
            class_meta.name_span.is_some(),
            "name_span should not be None"
        );
        let span = class_meta.name_span.as_ref().unwrap();

        assert!(span.start > 0);
        assert!(span.end > span.start);
    }

    #[test]
    fn test_tsconfig_paths_directory_resolution() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{
                    "compilerOptions": {
                        "baseUrl": ".",
                        "paths": {
                            "@components": ["libs/components/src"]
                        }
                    },
                    "files": ["app.component.ts"]
                }"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component } from '@angular/core';
import { DialogComponent } from '@components';

@Component({
    selector: 'app-root',
    template: '<app-dialog></app-dialog>',
    standalone: true,
    imports: [DialogComponent],
})
export class AppComponent {}
"#,
            ),
            (
                "/test/libs/components/src/index.ts",
                r#"
import { Component } from '@angular/core';

@Component({
    selector: 'app-dialog',
    template: '<div>Dialog</div>',
    standalone: true,
})
export class DialogComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        assert_eq!(results.len(), 2, "Expected 2 files to be analyzed");
        assert_class_exists(&results, "AppComponent");
        assert_class_exists(&results, "DialogComponent");
    }

    #[test]
    fn test_local_imports_resolution_name() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "files": ["app.ts"]
}"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: '',
})
export class TestComponent {}

@Component({
  selector: 'app-root',
  standalone: true,
  template: '<TestComponent></TestComponent>',
  imports: [TestComponent],
})
export class AppComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);

        assert_eq!(results.len(), 1);
        let class = find_class(&results, "AppComponent").expect("AppComponent should exist");
        assert!(class.component.is_some());
        let component = class.component.as_ref().unwrap();
        assert!(component.resolved_declarations.is_some());
        let resolved = component.resolved_declarations.as_ref().unwrap();
        assert_eq!(resolved.len(), 1);
        assert_eq!(resolved[0].name, "TestComponent");
        assert!(component.raw_imports_span.is_none());
        assert!(component.imports_factory_span.is_some());
    }

    #[test]
    fn test_component_imported_const_array_in_imports() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true
  },
  "files": ["app.component.ts", "icons.ts"]
}"#,
            ),
            (
                "/test/icons.ts",
                r#"
import { Directive, Component } from '@angular/core';

@Component({
  selector: 'mat-icon',
  template: '',
})
export class MatIcon {}

@Directive({
  selector: 'mat-icon[fontIcon]',
})
export class GafeMatIconImpl {}

export const GafeMatIcon = [MatIcon, GafeMatIconImpl] as const;
"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component } from '@angular/core';
import { GafeMatIcon } from './icons';

@Component({
  selector: 'app-root',
  standalone: true,
  template: '<mat-icon></mat-icon>',
  imports: [GafeMatIcon],
})
export class AppComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);

        let class_meta = find_class(&results, "AppComponent").expect("AppComponent should exist");
        let component = class_meta.component.as_ref().unwrap();
        assert!(component.resolved_declarations.is_some());
        let resolved = component.resolved_declarations.as_ref().unwrap();
        assert_eq!(resolved.len(), 2);
        assert!(component.raw_imports_span.is_none());
    }

    #[test]
    fn test_slider_header_imports() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true
  },
  "files": [
    "slider_header.ts",
    "icons.ts",
    "button_module.ts",
    "menu_module.ts",
    "tooltip.ts"
  ]
}"#,
            ),
            (
                "/test/icons.ts",
                r#"
import { Directive, Component } from '@angular/core';

@Component({
  selector: 'mat-icon',
  template: '',
})
export class MatIcon {}

@Directive({
  selector: 'mat-icon[fontIcon]',
})
export class GafeMatIconImpl {}

export const GafeMatIcon = [MatIcon, GafeMatIconImpl] as const;
"#,
            ),
            (
                "/test/button_module.ts",
                r#"
import { NgModule, Directive } from '@angular/core';

@Directive({ selector: 'button[mat-icon-button]' })
export class MatIconButton {}

@Directive({ selector: 'button[gm2-button]' })
export class Gm2Button {}

@NgModule({
  declarations: [Gm2Button],
  exports: [Gm2Button],
})
export class Gm2ButtonModule {}
"#,
            ),
            (
                "/test/menu_module.ts",
                r#"
import { NgModule, Directive, Component } from '@angular/core';

@Directive({ selector: '[matMenuTriggerFor]' })
export class MatMenuTrigger {}

@Component({ selector: 'mat-menu', template: '' })
export class MatMenu {}

@Directive({ selector: '[gm2MatMenuTrigger]' })
export class Gm2MatMenuTrigger {}

@NgModule({
  declarations: [Gm2MatMenuTrigger],
  exports: [Gm2MatMenuTrigger],
})
export class Gm2MenuModule {}
"#,
            ),
            (
                "/test/tooltip.ts",
                r#"
import { Directive } from '@angular/core';

@Directive({ selector: '[matTooltip]' })
export class MatTooltip {}

@Directive({ selector: '[gm2Tooltip]' })
export class Gm2Tooltip {}
"#,
            ),
            (
                "/test/slider_header.ts",
                r#"
import { Component, Directive } from '@angular/core';
import { Gm2ButtonModule } from './button_module';
import { Gm2MenuModule } from './menu_module';
import { Gm2Tooltip } from './tooltip';
import { GafeMatIcon } from './icons';
import { MatIconButton } from './button_module';
import { MatMenu, MatMenuTrigger } from './menu_module';
import { MatTooltip } from './tooltip';

@Directive({ selector: '[ngIf]' })
export class NgIf {}

@Component({
  selector: 'mdx-slider-header',
  template: '',
  imports: [
    Gm2ButtonModule,
    Gm2MenuModule,
    Gm2Tooltip,
    GafeMatIcon,
    MatIconButton,
    MatMenu,
    MatMenuTrigger,
    MatTooltip,
    NgIf,
  ],
})
export class SliderHeader {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);

        let class_meta = find_class(&results, "SliderHeader").expect("SliderHeader should exist");
        let component = class_meta.component.as_ref().unwrap();
        assert!(component.resolved_declarations.is_some());
        let resolved = component.resolved_declarations.as_ref().unwrap();
        assert_eq!(resolved.len(), 12);
        assert!(component.raw_imports_span.is_none());
    }

    #[test]
    fn test_local_dts_module_exports_declaring_file_path() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true
  },
  "files": ["app.component.ts"]
}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component } from '@angular/core';
import { ChildModule } from './child.module';

@Component({
  selector: 'app-root',
  standalone: true,
  template: '<app-child></app-child>',
  imports: [ChildModule],
})
export class AppComponent {}
"#,
            ),
            (
                "/test/child.module.d.ts",
                r#"
import * as i0 from "@angular/core";
import { ChildComponent } from './child.component';

export declare class ChildModule {
    static ɵmod: i0.ɵɵNgModuleDeclaration<ChildModule, [typeof ChildComponent], never, [typeof ChildComponent]>;
}
"#,
            ),
            (
                "/test/child.component.d.ts",
                r#"
import * as i0 from "@angular/core";

export declare class ChildComponent {
    static ɵcmp: i0.ɵɵComponentDeclaration<ChildComponent, "app-child", never, {}, {}, never, never, true, never>;
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);

        let class_meta = find_class(&results, "AppComponent").expect("AppComponent should exist");
        let component = class_meta.component.as_ref().unwrap();
        let resolved = component.resolved_declarations.as_ref().unwrap();
        assert_eq!(resolved.len(), 2);

        let child_module = resolved.iter().find(|d| d.name == "ChildModule").unwrap();
        assert_eq!(child_module.declaration_type, "ngmodule");
        assert_eq!(
            child_module
                .r#ref
                .typecheck_import
                .as_ref()
                .map(|i| i.specifier.as_str()),
            Some("./child.module")
        );

        let child_component = resolved
            .iter()
            .find(|d| d.name == "ChildComponent")
            .unwrap();
        assert_eq!(child_component.declaration_type, "component");
        assert_eq!(
            child_component
                .r#ref
                .typecheck_import
                .as_ref()
                .map(|i| i.specifier.as_str()),
            Some("./child.component")
        );
        // Reached through the module's scope, not imported here: the consumer has no name
        // for it, so it is emitted through a namespace import of its declared export name.
        assert_eq!(
            child_component
                .r#ref
                .typecheck_import
                .as_ref()
                .map(|i| i.symbol.as_str()),
            Some("ChildComponent")
        );
        assert_eq!(
            child_component
                .r#ref
                .consumer_import
                .as_ref()
                .map(|i| i.specifier.as_str()),
            Some("./child.component")
        );
        assert!(child_component.r#ref.local_alias.is_none());
    }

    #[test]
    fn test_dts_transitive_module_exports() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true
  },
  "files": ["app.component.ts"]
}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component } from '@angular/core';
import { MainModule } from './main.module';

@Component({
  selector: 'app-root',
  standalone: true,
  template: '<sub-comp></sub-comp>',
  imports: [MainModule],
})
export class AppComponent {}
"#,
            ),
            (
                "/test/main.module.d.ts",
                r#"
import * as i0 from "@angular/core";
import { SubModule } from './sub.module';

export declare class MainModule {
    static ɵmod: i0.ɵɵNgModuleDeclaration<MainModule, never, never, [typeof SubModule]>;
}
"#,
            ),
            (
                "/test/sub.module.d.ts",
                r#"
import * as i0 from "@angular/core";
import { SubComponent } from './sub.component';

export declare class SubModule {
    static ɵmod: i0.ɵɵNgModuleDeclaration<SubModule, [typeof SubComponent], never, [typeof SubComponent]>;
}
"#,
            ),
            (
                "/test/sub.component.d.ts",
                r#"
import * as i0 from "@angular/core";

export declare class SubComponent {
    static ɵcmp: i0.ɵɵComponentDeclaration<SubComponent, "sub-comp", never, {}, {}, never, never, true, never>;
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);

        let class_meta = find_class(&results, "AppComponent").expect("AppComponent should exist");
        let component = class_meta.component.as_ref().unwrap();
        let resolved = component.resolved_declarations.as_ref().unwrap();
        assert_eq!(resolved.len(), 2);

        let main_module = resolved.iter().find(|d| d.name == "MainModule").unwrap();
        assert_eq!(main_module.declaration_type, "ngmodule");
        assert_eq!(
            main_module
                .r#ref
                .typecheck_import
                .as_ref()
                .map(|i| i.specifier.as_str()),
            Some("./main.module")
        );

        let sub_component = resolved.iter().find(|d| d.name == "SubComponent").unwrap();
        assert_eq!(sub_component.declaration_type, "component");
        assert_eq!(
            sub_component
                .r#ref
                .typecheck_import
                .as_ref()
                .map(|i| i.specifier.as_str()),
            Some("./sub.component")
        );
        assert_eq!(
            sub_component
                .r#ref
                .typecheck_import
                .as_ref()
                .map(|i| i.symbol.as_str()),
            Some("SubComponent")
        );
        assert_eq!(
            sub_component
                .r#ref
                .consumer_import
                .as_ref()
                .map(|i| i.specifier.as_str()),
            Some("./sub.component")
        );
        assert!(sub_component.r#ref.local_alias.is_none());
    }

    #[test]
    fn test_class_inheritance_flattening_local() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true
  },
  "files": ["app.component.ts"]
}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component, Input, Directive } from '@angular/core';

@Directive({
  selector: '[parent-dir]',
})
export class ParentDirective {
  @Input() parentInput!: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  template: '<child-dir></child-dir>',
  imports: [ChildDirective],
})
export class AppComponent {}

@Directive({
  selector: '[child-dir]',
  standalone: true,
})
export class ChildDirective extends ParentDirective {
  @Input() childInput!: string;
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);

        // 1. Verify ChildDirective metadata in AppComponent's resolved declarations
        let app_meta = find_class(&results, "AppComponent").expect("AppComponent should exist");
        let component = app_meta.component.as_ref().unwrap();
        let resolved = component.resolved_declarations.as_ref().unwrap();
        assert_eq!(resolved.len(), 1);
        let child_decl = &resolved[0];
        assert_eq!(child_decl.name, "ChildDirective");

        // Local fields: only childInput
        let fields = child_decl.fields.as_ref().unwrap();
        assert_eq!(fields.len(), 1);
        assert_eq!(fields[0].input.as_ref().unwrap().name, "childInput");

        // Flattened fields: both childInput and parentInput
        let flattened = child_decl.flattened_fields.as_ref().unwrap();
        assert_eq!(flattened.len(), 2);
        let names: HashSet<_> = flattened
            .iter()
            .map(|f| f.input.as_ref().unwrap().name.as_str())
            .collect();
        assert!(names.contains("childInput"));
        assert!(names.contains("parentInput"));

        // 2. Verify ChildDirective local metadata in AnalysisResult.classes: MUST ONLY have childInput
        let child_meta =
            find_class(&results, "ChildDirective").expect("ChildDirective should exist");
        assert_eq!(child_meta.fields.len(), 1);
        assert_eq!(
            child_meta.fields[0].input.as_ref().unwrap().name,
            "childInput"
        );
    }

    #[test]
    fn test_class_inheritance_flattening_dts() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true
  },
  "files": ["app.component.ts"]
}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component, Input, Directive } from '@angular/core';
import { ParentDirective } from './parent.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  template: '<child-dir></child-dir>',
  imports: [ChildDirective],
})
export class AppComponent {}

@Directive({
  selector: '[child-dir]',
  standalone: true,
})
export class ChildDirective extends ParentDirective {
  @Input() childInput!: string;
}
"#,
            ),
            (
                "/test/parent.directive.d.ts",
                r#"
import * as i0 from "@angular/core";

export declare class ParentDirective {
    parentInput: string;
    static ɵdir: i0.ɵɵDirectiveDeclaration<ParentDirective, "[parent-dir]", never, { "parentInput": { "alias": "parentInput"; "required": false; }; }, {}, never, never, true, never>;
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);

        let app_meta = find_class(&results, "AppComponent").expect("AppComponent should exist");
        let component = app_meta.component.as_ref().unwrap();
        let resolved = component.resolved_declarations.as_ref().unwrap();
        assert_eq!(resolved.len(), 1);
        let child_decl = &resolved[0];

        // Local fields: only childInput
        let fields = child_decl.fields.as_ref().unwrap();
        assert_eq!(fields.len(), 1);
        assert_eq!(fields[0].input.as_ref().unwrap().name, "childInput");

        // Flattened fields: both childInput and parentInput
        let flattened = child_decl.flattened_fields.as_ref().unwrap();
        assert_eq!(flattened.len(), 2);
        let names: HashSet<_> = flattened
            .iter()
            .map(|f| f.input.as_ref().unwrap().name.as_str())
            .collect();
        assert!(names.contains("childInput"));
        assert!(names.contains("parentInput"));
    }

    fn io_field_names(fields: &[crate::AngularFieldMetadata]) -> HashSet<&str> {
        fields
            .iter()
            .filter_map(|f| {
                f.input
                    .as_ref()
                    .map(|i| i.name.as_str())
                    .or_else(|| f.output.as_ref().map(|o| o.name.as_str()))
            })
            .collect()
    }

    fn only_resolved_flattened_fields(results: &[crate::AnalysisResult]) -> HashSet<&str> {
        let app_meta = find_class(results, "AppComponent").expect("AppComponent should exist");
        let resolved = app_meta
            .component
            .as_ref()
            .and_then(|c| c.resolved_declarations.as_ref())
            .expect("AppComponent should have resolved declarations");
        assert_eq!(resolved.len(), 1);
        io_field_names(resolved[0].flattened_fields.as_ref().unwrap())
    }

    #[test]
    fn test_class_inheritance_flattening_aliased_import() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true
  },
  "files": ["app.ts"]
}"#,
            ),
            (
                "/test/base.ts",
                r#"
import { Directive, EventEmitter, Input, Output } from '@angular/core';

@Directive()
export class BaseDirective {
  @Input() value = '';
  @Output() readonly valueChange = new EventEmitter<string>();
}
"#,
            ),
            (
                "/test/child.ts",
                r#"
import { Component, EventEmitter, Output } from '@angular/core';
import { BaseDirective as AliasedBase } from './base';

@Component({
  selector: 'child-comp',
  template: '',
})
export class ChildComponent extends AliasedBase {
  @Output() readonly selected = new EventEmitter<number>();
}
"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Component } from '@angular/core';
import { ChildComponent as AliasedChild } from './child';

@Component({
  selector: 'app-root',
  template: `<child-comp (valueChange)="onValueChange($event)"></child-comp>`,
  imports: [AliasedChild],
})
export class AppComponent {
  onValueChange(value: string) {}
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);

        let child = find_class(&results, "ChildComponent").expect("ChildComponent should exist");
        let super_class = child
            .super_class
            .as_ref()
            .expect("super_class should be set");
        assert_eq!(super_class.local_name, "AliasedBase");
        assert_eq!(super_class.export_name(), "BaseDirective");
        assert_eq!(super_class.import_source.as_deref(), Some("./base"));

        assert_eq!(
            only_resolved_flattened_fields(&results),
            HashSet::from(["selected", "value", "valueChange"])
        );
    }

    #[test]
    fn test_class_inheritance_flattening_aliased_import_between_dts() {
        // As above, with both classes read from `.d.ts` files.
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true
  },
  "files": ["app.ts"]
}"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Component } from '@angular/core';
import { ChildComponent } from './child';

@Component({
  selector: 'app-root',
  template: '<child-comp></child-comp>',
  imports: [ChildComponent],
})
export class AppComponent {}
"#,
            ),
            (
                "/test/child.d.ts",
                r#"
import * as i0 from "@angular/core";
import { BaseDirective as AliasedBase } from './base';

export declare class ChildComponent extends AliasedBase {
    selected: i0.EventEmitter<number>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ChildComponent, "child-comp", never, {}, { "selected": "selected"; }, never, never, true, never>;
}
"#,
            ),
            (
                "/test/base.d.ts",
                r#"
import * as i0 from "@angular/core";

export declare class BaseDirective {
    valueChange: i0.EventEmitter<string>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<BaseDirective, never, never, {}, { "valueChange": "valueChange"; }, never, never, true, never>;
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);

        assert_eq!(
            only_resolved_flattened_fields(&results),
            HashSet::from(["selected", "valueChange"])
        );
    }

    #[test]
    fn test_class_inheritance_flattening_default_import() {
        // A default-imported base class must be looked up as `default`.
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true
  },
  "files": ["app.ts"]
}"#,
            ),
            (
                "/test/base.ts",
                r#"
import { Directive, Input } from '@angular/core';

@Directive()
export default class BaseDirective {
  @Input() parentInput = '';
}
"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Component, Directive, Input } from '@angular/core';
import Base from './base';

@Directive({ selector: '[child-dir]' })
export class ChildDirective extends Base {
  @Input() childInput = '';
}

@Component({
  selector: 'app-root',
  template: '<div child-dir></div>',
  imports: [ChildDirective],
})
export class AppComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);

        let child = find_class(&results, "ChildDirective").expect("ChildDirective should exist");
        let super_class = child
            .super_class
            .as_ref()
            .expect("super_class should be set");
        assert_eq!(super_class.export_name(), "default");

        assert_eq!(
            only_resolved_flattened_fields(&results),
            HashSet::from(["childInput", "parentInput"])
        );
    }

    #[test]
    fn test_class_inheritance_cycle_detection() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true
  },
  "files": ["app.component.ts"]
}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component, Input, Directive } from '@angular/core';

@Directive({
  selector: '[b-dir]',
})
export class BDirective extends ADirective {
  @Input() bInput!: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  template: '<b-dir></b-dir>',
  imports: [BDirective],
})
export class AppComponent {}

@Directive({
  selector: '[a-dir]',
})
export class ADirective extends BDirective {
  @Input() aInput!: string;
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);

        let app_meta = find_class(&results, "AppComponent").expect("AppComponent should exist");
        let component = app_meta.component.as_ref().unwrap();
        let resolved = component.resolved_declarations.as_ref().unwrap();
        assert_eq!(resolved.len(), 1);

        let b_decl = &resolved[0];
        assert_eq!(b_decl.name, "BDirective");
        let flattened = b_decl.flattened_fields.as_ref().unwrap();
        assert!(flattened.len() >= 2);
    }

    #[test]
    fn test_inherited_factory_only_without_local_constructor() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true
  },
  "files": ["app.ts"]
}"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Injectable } from '@angular/core';

export class BaseClass {
  constructor(public arg: string) {}
}

@Injectable()
export class SubClassWithConstructor extends BaseClass {
  constructor(arg: string, public extra: number) {
    super(arg);
  }
}

@Injectable()
export class SubClassWithoutConstructor extends BaseClass {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);

        let with_constructor = find_class(&results, "SubClassWithConstructor")
            .expect("SubClassWithConstructor should exist");
        assert!(
            with_constructor.uses_inheritance,
            "SubClassWithConstructor has base class, should flag uses_inheritance"
        );
        assert!(
            with_constructor.constructor_params.is_some(),
            "SubClassWithConstructor has constructor params"
        );

        let without_constructor = find_class(&results, "SubClassWithoutConstructor")
            .expect("SubClassWithoutConstructor should exist");
        assert!(
            without_constructor.uses_inheritance,
            "SubClassWithoutConstructor has base class, should flag uses_inheritance"
        );
        assert!(
            without_constructor.constructor_params.is_none(),
            "SubClassWithoutConstructor has no constructor params"
        );
    }

    #[test]
    fn test_local_ngmodule_preservation() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true
  },
  "files": ["app.ts"]
}"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Component, Directive, NgModule } from '@angular/core';

@Directive({
  selector: '[my-dir]',
  standalone: false,
})
export class MyDirective {}

@NgModule({
  declarations: [MyDirective],
  exports: [MyDirective],
})
export class MyModule {}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MyModule],
  template: '<div my-dir></div>',
})
export class AppComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);

        let class_meta = find_class(&results, "AppComponent").expect("AppComponent should exist");
        let component = class_meta.component.as_ref().unwrap();
        let resolved = component.resolved_declarations.as_ref().unwrap();
        assert_eq!(resolved.len(), 2);

        let my_module = resolved.iter().find(|d| d.name == "MyModule").unwrap();
        assert_eq!(my_module.declaration_type, "ngmodule");
        // Declared in this very file, so there is nothing to import.
        assert!(my_module.r#ref.consumer_import.is_none());
        assert_eq!(my_module.r#ref.local_alias.as_deref(), Some("MyModule"));

        let my_directive = resolved.iter().find(|d| d.name == "MyDirective").unwrap();
        assert_eq!(my_directive.declaration_type, "directive");
        assert!(my_directive.r#ref.consumer_import.is_none());
        assert_eq!(
            my_directive.r#ref.local_alias.as_deref(),
            Some("MyDirective")
        );
    }

    #[test]
    fn test_class_metadata_decorators_extraction() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["comp.ts"]}"#,
            ),
            (
                "/test/comp.ts",
                r#"
import { Component, Input, Output, Inject } from '@angular/core';
declare function CustomDec(...args: any[]): any;

@Component({
    selector: 'my-comp',
    template: ''
})
export class MyComp {
    @Input('myAlias') inputProp: string;
    @Output() outputProp: any;
    @CustomDec({ foo: 'bar' }) customProp: number;
    'string-literal-prop' = 123;
    @Input() 'decorated-literal': string;

    constructor(@Inject('TOKEN') @CustomDec() param: any) {}
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let class_meta = find_class(&results, "MyComp").expect("MyComp should exist");

        // Verify member decorators
        let member_decorators = class_meta.member_decorators.as_ref().unwrap();
        assert_eq!(member_decorators.len(), 4);

        let input_member = member_decorators
            .iter()
            .find(|m| m.property_name == "inputProp")
            .unwrap();
        assert!(!input_member.is_string_literal);
        assert_eq!(input_member.decorators.len(), 1);
        assert_eq!(input_member.decorators[0].name, "Input");
        assert!(input_member.decorators[0].is_angular);
        assert!(input_member.decorators[0].args_span.is_some());
        assert!(input_member.decorators[0].decorator_span.is_some());

        let output_member = member_decorators
            .iter()
            .find(|m| m.property_name == "outputProp")
            .unwrap();
        assert!(!output_member.is_string_literal);
        assert_eq!(output_member.decorators.len(), 1);
        assert_eq!(output_member.decorators[0].name, "Output");
        assert!(output_member.decorators[0].is_angular);
        assert!(output_member.decorators[0].args_span.is_none());
        assert!(output_member.decorators[0].decorator_span.is_some());

        let custom_member = member_decorators
            .iter()
            .find(|m| m.property_name == "customProp")
            .unwrap();
        assert!(!custom_member.is_string_literal);
        assert_eq!(custom_member.decorators.len(), 1);
        assert_eq!(custom_member.decorators[0].name, "CustomDec");
        assert!(!custom_member.decorators[0].is_angular);
        assert!(custom_member.decorators[0].args_span.is_none());
        assert!(custom_member.decorators[0].decorator_span.is_none());

        let literal_member = member_decorators
            .iter()
            .find(|m| m.property_name == "decorated-literal")
            .unwrap();
        assert!(literal_member.is_string_literal);
        assert_eq!(literal_member.decorators.len(), 1);
        assert!(literal_member.decorators[0].is_angular);
        assert!(literal_member.decorators[0].decorator_span.is_some());

        // Verify undecorated string-literal-prop is omitted
        assert!(member_decorators
            .iter()
            .all(|m| m.property_name != "string-literal-prop"));

        // Verify constructor parameter decorators
        let ctor_params = class_meta.constructor_params.as_ref().unwrap();
        assert_eq!(ctor_params.len(), 1);
        assert_eq!(ctor_params[0].decorators.len(), 2);
        assert!(ctor_params[0].type_name.is_none());
        assert!(ctor_params[0].is_type_only);

        let inject_dec = ctor_params[0]
            .decorators
            .iter()
            .find(|d| d.name == "Inject")
            .unwrap();
        assert!(inject_dec.is_angular);
        assert!(inject_dec.args_span.is_some());

        let custom_dec = ctor_params[0]
            .decorators
            .iter()
            .find(|d| d.name == "CustomDec")
            .unwrap();
        assert!(!custom_dec.is_angular);
        assert!(custom_dec.args_span.is_none());
        assert!(custom_dec.args.is_none());
        assert!(custom_dec.decorator_span.is_none());
    }

    #[test]
    fn test_di_property_decorators_removal_spans() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{ "compilerOptions": { "strict": true }, "files": ["main.ts"] }"#,
            ),
            (
                "/test/main.ts",
                r#"
import { Injectable, Optional, Host, Self, SkipSelf, Inject, Pipe, NgModule } from '@angular/core';

function CustomDec() { return (target: any, key?: any) => {}; }

@Injectable({ providedIn: 'root' })
export class StylingService {
    @Optional()
    @CustomDec()
    private readonly ratesBrandingService = null;

    @Host()
    @Self()
    @SkipSelf()
    @Inject('TOKEN')
    otherProp = null;
}

@Pipe({ name: 'myPipe' })
export class MyPipe {
    @Optional() dep = null;
}

@NgModule({})
export class MyModule {
    @Self() dep = null;
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        let svc = find_class(&results, "StylingService").expect("StylingService should exist");
        // 1 class decorator (@Injectable) + 5 Angular property decorators (@Optional, @Host, @Self, @SkipSelf, @Inject)
        // (@CustomDec is not an Angular decorator so it must not be in removal_spans)
        assert_eq!(svc.removal_spans.len(), 6);

        let pipe = find_class(&results, "MyPipe").expect("MyPipe should exist");
        // 1 class decorator (@Pipe) + 1 Angular property decorator (@Optional)
        assert_eq!(pipe.removal_spans.len(), 2);

        let module = find_class(&results, "MyModule").expect("MyModule should exist");
        // 1 class decorator (@NgModule) + 1 Angular property decorator (@Self)
        assert_eq!(module.removal_spans.len(), 2);
    }

    #[test]
    fn test_class_metadata_decorators_strips_generic_type_arguments() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {}, "files": ["comp.ts"]}"#,
            ),
            (
                "/test/comp.ts",
                r#"
import { Component, ViewChild, Inject } from '@angular/core';

class ChildComponent<T, U = any> {}
const TOKEN = {};
function factory<T>() {}
class InjectionToken<T> { constructor(desc: string) {} }

@Component({
    selector: 'my-comp',
    template: ''
})
export class MyComp<T, U> {
    @ViewChild(ChildComponent<T>) child!: ChildComponent<T>;
    @ViewChild(ChildComponent<T>, { static: true }) childStatic!: ChildComponent<T>;
    @ViewChild(ChildComponent) nonGenericChild!: ChildComponent;
    @ViewChild(ChildComponent<T /* comment */, U>) childMultiType!: ChildComponent<T, U>;
    @ViewChild(factory<T>()) childCallExpr!: any;
    @ViewChild(ChildComponent, { read: TOKEN<T> }) childOptionType!: any;

    constructor(
        @Inject(TOKEN<T>) token: any,
        @Inject(new InjectionToken<T>('desc')) tokenNew: any,
    ) {}
}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let class_meta = find_class(&results, "MyComp").expect("MyComp should exist");
        let member_decorators = class_meta.member_decorators.as_ref().unwrap();

        let child = member_decorators
            .iter()
            .find(|m| m.property_name == "child")
            .unwrap();
        assert_eq!(
            child.decorators[0].args_string.as_deref(),
            Some("ChildComponent")
        );

        let child_static = member_decorators
            .iter()
            .find(|m| m.property_name == "childStatic")
            .unwrap();
        assert_eq!(
            child_static.decorators[0].args_string.as_deref(),
            Some("ChildComponent, { static: true }")
        );

        let non_generic = member_decorators
            .iter()
            .find(|m| m.property_name == "nonGenericChild")
            .unwrap();
        assert!(non_generic.decorators[0].args_string.is_none());
        assert!(non_generic.decorators[0].args_span.is_some());

        let child_multi_type = member_decorators
            .iter()
            .find(|m| m.property_name == "childMultiType")
            .unwrap();
        assert_eq!(
            child_multi_type.decorators[0].args_string.as_deref(),
            Some("ChildComponent")
        );

        let child_call_expr = member_decorators
            .iter()
            .find(|m| m.property_name == "childCallExpr")
            .unwrap();
        assert_eq!(
            child_call_expr.decorators[0].args_string.as_deref(),
            Some("factory()")
        );

        let child_option_type = member_decorators
            .iter()
            .find(|m| m.property_name == "childOptionType")
            .unwrap();
        assert_eq!(
            child_option_type.decorators[0].args_string.as_deref(),
            Some("ChildComponent, { read: TOKEN }")
        );

        let ctor_params = class_meta.constructor_params.as_ref().unwrap();
        assert_eq!(
            ctor_params[0].decorators[0].args_string.as_deref(),
            Some("TOKEN")
        );
        assert_eq!(
            ctor_params[1].decorators[0].args_string.as_deref(),
            Some("new InjectionToken('desc')")
        );
    }

    #[test]
    fn test_ngmodule_unresolved_external_imports_in_optimize_mode() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true
  },
  "files": ["pipe.ts", "app.ts"]
}"#,
            ),
            (
                "/test/pipe.ts",
                r#"
import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'async',
  standalone: false,
})
export class AsyncPipe implements PipeTransform {
  transform(value: any): any { return value; }
}

@NgModule({
  declarations: [AsyncPipe],
  exports: [AsyncPipe],
})
export class PipeModule {}
"#,
            ),
            (
                "/test/app.ts",
                r#"
import { Component, NgModule } from '@angular/core';
import { PipeModule } from './pipe';
import { ExternalModule } from '@third-party/external';

@Component({
  selector: 'labels-panel',
  template: '<div>{{ data | async }}</div>',
  standalone: false,
})
export class LabelsPanel {
  data: any;
}

@NgModule({
  declarations: [LabelsPanel],
  exports: [LabelsPanel],
  imports: [PipeModule, ExternalModule],
})
export class LabelsPanelModule {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);

        let class_meta =
            find_class(&results, "LabelsPanelModule").expect("LabelsPanelModule should exist");
        let ng_module = class_meta.ng_module.as_ref().unwrap();
        let imports = ng_module
            .imports
            .as_ref()
            .expect("imports should not be dropped to null");
        assert_eq!(
            imports.len(),
            2,
            "Both PipeModule and ExternalModule should be preserved in imports"
        );

        let pipe_mod = imports
            .iter()
            .find(|r| r.local_alias.as_deref() == Some("PipeModule"))
            .expect("PipeModule ref should exist");
        assert_eq!(pipe_mod.local_alias.as_deref(), Some("PipeModule"));
        assert!(
            pipe_mod.typecheck_import.is_some(),
            "PipeModule should have a typecheck_import reference from ./pipe"
        );
        let pipe_importable = pipe_mod.typecheck_import.as_ref().unwrap();
        assert_eq!(pipe_importable.specifier, "./pipe");
        assert_eq!(pipe_importable.symbol, "PipeModule");

        let ext_mod = imports
            .iter()
            .find(|r| r.local_alias.as_deref() == Some("ExternalModule"))
            .expect("ExternalModule ref should exist");
        assert_eq!(ext_mod.local_alias.as_deref(), Some("ExternalModule"));

        // Non-standalone component declared in an NgModule with unresolved external imports
        // must leave resolved_declarations as None so Ivy uses runtime NgModule scoping.
        let comp_meta =
            find_class(&results, "LabelsPanel").expect("LabelsPanel component should exist");
        let comp = comp_meta.component.as_ref().unwrap();
        assert!(
            comp.resolved_declarations.is_none(),
            "resolved_declarations should be None when declaring module has unresolvable imports, got: {:?}",
            comp.resolved_declarations
        );
    }

    #[test]
    fn test_dts_syntax_error_tolerance() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true
  },
  "files": ["app.component.ts", "broken.d.ts"]
}"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component } from '@angular/core';
import { BrokenType, BrokenDtsDirective } from './broken';

@Component({
  selector: 'app-comp',
  standalone: true,
  imports: [BrokenDtsDirective],
  template: '<div brokenDir>Hello</div>',
})
export class AppComponent {
  prop?: BrokenType;
}
"#,
            ),
            (
                "/test/broken.d.ts",
                "import * as i0 from '@angular/core';\n\nexport declare interface BrokenType {\n  '\n': boolean;\n  '\r': boolean;\n}\n\nexport declare class BrokenDtsDirective {\n  static ɵdir: i0.ɵɵDirectiveDeclaration<BrokenDtsDirective, '[brokenDir]', never, {}, {}, never, never, true, never>;\n  static ɵfac: i0.ɵɵFactoryDeclaration<BrokenDtsDirective, never>;\n}\n",
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);
        let class_meta = find_class(&results, "AppComponent").expect("AppComponent should exist");
        assert!(class_meta.component.is_some());
        let comp = class_meta.component.as_ref().unwrap();
        assert!(comp.imports_factory_span.is_some());
        assert_eq!(comp.template.as_deref(), Some("<div brokenDir>Hello</div>"));
    }

    #[test]
    fn test_component_deferred_imports_array() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true
  },
  "files": ["app.component.ts", "deferred.ts"]
}"#,
            ),
            (
                "/test/deferred.ts",
                r#"
import { Component } from '@angular/core';
@Component({
  selector: 'deferred-comp',
  standalone: true,
  template: '<div>Deferred</div>',
})
export class DeferredComp {}
"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component } from '@angular/core';
import { DeferredComp } from './deferred';

@Component({
  selector: 'app-comp',
  standalone: true,
  deferredImports: [DeferredComp],
  template: '@defer { <deferred-comp /> }',
})
export class AppComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);
        let class_meta = find_class(&results, "AppComponent").expect("AppComponent should exist");
        assert!(class_meta.component.is_some());
        let comp = class_meta.component.as_ref().unwrap();
        assert!(comp.deferred_imports_span.is_some());
        assert!(comp.resolved_deferred_declarations.is_some());
        let resolved = comp.resolved_deferred_declarations.as_ref().unwrap();
        assert_eq!(resolved.len(), 1);
        assert_eq!(resolved[0].name, "DeferredComp");
        assert!(resolved[0].is_explicitly_deferred);
        assert!(resolved[0].deferred_blocks.is_none());
    }

    #[test]
    fn test_component_deferred_imports_object_dictionary() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true
  },
  "files": ["app.component.ts", "deferred-a.ts", "deferred-b.ts"]
}"#,
            ),
            (
                "/test/deferred-a.ts",
                r#"
import { Component } from '@angular/core';
@Component({
  selector: 'deferred-a',
  standalone: true,
  template: '<div>A</div>',
})
export class DeferredA {}
"#,
            ),
            (
                "/test/deferred-b.ts",
                r#"
import { Component } from '@angular/core';
@Component({
  selector: 'deferred-b',
  standalone: true,
  template: '<div>B</div>',
})
export class DeferredB {}
"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component } from '@angular/core';
import { DeferredA } from './deferred-a';
import { DeferredB } from './deferred-b';

@Component({
  selector: 'app-comp',
  standalone: true,
  deferredImports: {
    blockA: [DeferredA],
    blockB: [DeferredB, DeferredA],
  },
  template: `
    @defer (name blockA) { <deferred-a /> }
    @defer (name blockB) { <deferred-b /> <deferred-a /> }
  `,
})
export class AppComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);
        let class_meta = find_class(&results, "AppComponent").expect("AppComponent should exist");
        assert!(class_meta.component.is_some());
        let comp = class_meta.component.as_ref().unwrap();
        assert!(comp.deferred_imports_span.is_some());
        assert!(comp.resolved_deferred_declarations.is_some());
        let resolved = comp.resolved_deferred_declarations.as_ref().unwrap();
        // Flattened and deduplicated: 2 declarations (DeferredA and DeferredB)
        assert_eq!(resolved.len(), 2);

        assert!(comp.resolved_deferred_declarations_by_block.is_some());
        let by_block = comp
            .resolved_deferred_declarations_by_block
            .as_ref()
            .unwrap();
        assert_eq!(by_block.len(), 2);
        assert_eq!(by_block.get("blockA").unwrap().len(), 1);
        assert_eq!(by_block.get("blockB").unwrap().len(), 2);

        let def_a = resolved.iter().find(|d| d.name == "DeferredA").unwrap();
        assert!(def_a.is_explicitly_deferred);
        let blocks_a = def_a.deferred_blocks.as_ref().unwrap();
        assert!(blocks_a.contains(&"blockA".to_string()));
        assert!(blocks_a.contains(&"blockB".to_string()));

        let def_b = resolved.iter().find(|d| d.name == "DeferredB").unwrap();
        assert!(def_b.is_explicitly_deferred);
        let blocks_b = def_b.deferred_blocks.as_ref().unwrap();
        assert_eq!(blocks_b, &vec!["blockB".to_string()]);
    }

    /// Two distinct classes named `Widget`, declared in different files, must stay distinct
    /// dependencies when one is imported eagerly and the other through `deferredImports`, and
    /// when both are deferred into different named blocks.
    #[test]
    fn test_component_deferred_imports_same_name_distinct_classes() {
        let widget = |selector: &str| {
            format!(
                r#"
import {{ Component }} from '@angular/core';
@Component({{ selector: '{selector}', standalone: true, template: '' }})
export class Widget {{}}
"#
            )
        };
        let widget_a = widget("widget-a");
        let widget_b = widget("widget-b");
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true
  },
  "files": ["mixed.component.ts", "split.component.ts", "a.ts", "b.ts"]
}"#,
            ),
            ("/test/a.ts", widget_a.as_str()),
            ("/test/b.ts", widget_b.as_str()),
            (
                "/test/mixed.component.ts",
                r#"
import { Component } from '@angular/core';
import { Widget } from './a';
import { Widget as WidgetB } from './b';

@Component({
  selector: 'app-mixed',
  standalone: true,
  imports: [Widget],
  deferredImports: [WidgetB],
  template: '<widget-a /> @defer { <widget-b /> }',
})
export class MixedComponent {}
"#,
            ),
            (
                "/test/split.component.ts",
                r#"
import { Component } from '@angular/core';
import { Widget } from './a';
import { Widget as WidgetB } from './b';

@Component({
  selector: 'app-split',
  standalone: true,
  deferredImports: {
    first: [Widget],
    second: [WidgetB],
  },
  template: `
    @defer (name first) { <widget-a /> }
    @defer (name second) { <widget-b /> }
  `,
})
export class SplitComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);
        let selectors = |decls: &[crate::types::api::DeclarationMetadata]| {
            let mut selectors: Vec<String> =
                decls.iter().filter_map(|d| d.selector.clone()).collect();
            selectors.sort();
            selectors
        };

        let mixed = find_class(&results, "MixedComponent").expect("MixedComponent should exist");
        let mixed = mixed.component.as_ref().unwrap();
        let scope = mixed.resolved_declarations.as_ref().unwrap();
        assert_eq!(selectors(scope), vec!["widget-a", "widget-b"]);
        let deferred = scope
            .iter()
            .find(|d| d.selector.as_deref() == Some("widget-b"))
            .unwrap();
        assert!(deferred.is_explicitly_deferred);

        let split = find_class(&results, "SplitComponent").expect("SplitComponent should exist");
        let split = split.component.as_ref().unwrap();
        let by_block = split
            .resolved_deferred_declarations_by_block
            .as_ref()
            .unwrap();
        assert_eq!(selectors(by_block.get("first").unwrap()), vec!["widget-a"]);
        assert_eq!(selectors(by_block.get("second").unwrap()), vec!["widget-b"]);
        for decl in split.resolved_deferred_declarations.as_ref().unwrap() {
            let expected_block = match decl.selector.as_deref() {
                Some("widget-a") => "first",
                Some("widget-b") => "second",
                other => panic!("unexpected deferred declaration {other:?}"),
            };
            assert_eq!(
                decl.deferred_blocks.as_deref(),
                Some([expected_block.to_string()].as_slice())
            );
        }
    }

    #[allow(clippy::type_complexity)]
    fn wire_refs(
        refs: &[crate::types::metadata::ReferenceMetadata],
    ) -> Vec<(Option<&str>, Option<&str>, Option<&str>)> {
        refs.iter()
            .map(|r| {
                (
                    r.local_alias.as_deref(),
                    r.typecheck_import.as_ref().map(|i| i.symbol.as_str()),
                    r.typecheck_import.as_ref().map(|i| i.specifier.as_str()),
                )
            })
            .collect()
    }

    fn aliased_deferred_imports_fs(component: &str) -> crate::fs::OverlayFileSystem {
        create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{"compilerOptions": {"strict": true}, "files": ["app.component.ts", "eager.ts", "deferred.ts", "direct.ts"]}"#,
            ),
            (
                "/test/eager.ts",
                r#"
import { Component } from '@angular/core';
@Component({ selector: 'eager-comp', standalone: true, template: '' })
export class EagerComp {}
"#,
            ),
            (
                "/test/deferred.ts",
                r#"
import { Component } from '@angular/core';
@Component({ selector: 'aliased-deferred', standalone: true, template: '' })
export class DeferredComp {}
"#,
            ),
            (
                "/test/direct.ts",
                r#"
import { Component } from '@angular/core';
@Component({ selector: 'direct-deferred', standalone: true, template: '' })
export class DirectDeferred {}
"#,
            ),
            ("/test/app.component.ts", component),
        ])
    }

    #[test]
    fn local_mode_projects_aliased_imports_with_their_exported_name() {
        let fs = aliased_deferred_imports_fs(
            r#"
import { Component } from '@angular/core';
import { EagerComp as AliasedEager } from './eager';
import { DeferredComp as AliasedDeferred } from './deferred';
import { DirectDeferred } from './direct';

@Component({
  selector: 'app-comp',
  standalone: true,
  imports: [AliasedEager],
  deferredImports: [AliasedDeferred, DirectDeferred],
  template: '@defer { <aliased-deferred /><direct-deferred /> }',
})
export class AppComponent {}
"#,
        );

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let class_meta = find_class(&results, "AppComponent").expect("AppComponent should exist");
        let comp = class_meta
            .component
            .as_ref()
            .expect("AppComponent is a component");

        assert!(comp.resolved_declarations.is_none());
        assert!(comp.resolved_deferred_declarations.is_none());

        assert_eq!(
            wire_refs(comp.imports.as_ref().expect("imports projected")),
            vec![(Some("AliasedEager"), Some("EagerComp"), Some("./eager"))],
        );

        assert_eq!(
            wire_refs(
                comp.deferred_imports
                    .as_ref()
                    .expect("deferredImports projected")
            ),
            vec![
                (
                    Some("AliasedDeferred"),
                    Some("DeferredComp"),
                    Some("./deferred")
                ),
                (
                    Some("DirectDeferred"),
                    Some("DirectDeferred"),
                    Some("./direct")
                ),
            ],
        );
    }

    #[test]
    fn local_mode_projects_aliased_imports_per_block() {
        let fs = aliased_deferred_imports_fs(
            r#"
import { Component } from '@angular/core';
import { DeferredComp as AliasedDeferred } from './deferred';
import { DirectDeferred } from './direct';

@Component({
  selector: 'app-comp',
  standalone: true,
  deferredImports: {
    blockA: [AliasedDeferred],
    blockB: [AliasedDeferred, DirectDeferred],
  },
  template: `
    @defer (name blockA) { <aliased-deferred /> }
    @defer (name blockB) { <aliased-deferred /><direct-deferred /> }
  `,
})
export class AppComponent {}
"#,
        );

        let results = run_analyzer(fs, "/test/tsconfig.json", false);
        let class_meta = find_class(&results, "AppComponent").expect("AppComponent should exist");
        let comp = class_meta
            .component
            .as_ref()
            .expect("AppComponent is a component");

        assert!(comp.resolved_deferred_declarations_by_block.is_none());

        let by_block = comp
            .deferred_imports_by_block
            .as_ref()
            .expect("deferredImports dictionary projected");
        assert_eq!(by_block.len(), 2);

        let aliased = (
            Some("AliasedDeferred"),
            Some("DeferredComp"),
            Some("./deferred"),
        );
        assert_eq!(
            wire_refs(by_block.get("blockA").expect("blockA projected")),
            vec![aliased],
        );
        assert_eq!(
            wire_refs(by_block.get("blockB").expect("blockB projected")),
            vec![
                aliased,
                (
                    Some("DirectDeferred"),
                    Some("DirectDeferred"),
                    Some("./direct")
                ),
            ],
        );
    }

    #[test]
    fn test_component_deferred_imports_non_standalone_rejected() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true
  },
  "files": ["app.component.ts", "deferred.ts"]
}"#,
            ),
            (
                "/test/deferred.ts",
                r#"
import { Component } from '@angular/core';
@Component({
  selector: 'deferred-comp',
  standalone: true,
  template: '<div>Deferred</div>',
})
export class DeferredComp {}
"#,
            ),
            (
                "/test/app.component.ts",
                r#"
import { Component } from '@angular/core';
import { DeferredComp } from './deferred';

@Component({
  selector: 'app-comp',
  standalone: false,
  deferredImports: {
    block: [DeferredComp],
  },
  template: '<div>App</div>',
})
export class AppComponent {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);
        let file_res = results
            .iter()
            .find(|r| r.file_path.contains("app.component.ts"))
            .unwrap();
        assert!(!file_res.diagnostics.is_empty());
        let diag = file_res
            .diagnostics
            .iter()
            .find(|d| d.code == 2010)
            .expect("NG2010 expected");
        assert!(diag
            .message_text
            .contains("'deferredImports' is only valid on a component that is standalone."));
    }

    #[test]
    fn test_ngmodule_conditional_spread_exports() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true
  },
  "files": ["test.ts", "universe_configs.d.ts"]
}"#,
            ),
            (
                "/test/universe_configs.d.ts",
                r#"
export declare function isFeatureEnabled(): boolean;
"#,
            ),
            (
                "/test/test.ts",
                r#"
import { NgModule } from '@angular/core';
import { VeLoggingModule } from './ve_logging_module';
import { isFeatureEnabled } from './universe_configs';
import { NoopVeLoggingDirectives } from './noop_ve_directives';

const moduleExports = isFeatureEnabled() ? [VeLoggingModule] : [];
const directives = isFeatureEnabled() ? [] : [NoopVeLoggingDirectives];

@NgModule({
  exports: [...directives, ...moduleExports],
})
export class ZammEventTrackerModule {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);
        let class_meta = find_class(&results, "ZammEventTrackerModule")
            .expect("ZammEventTrackerModule should exist");
        let ng_module = class_meta.ng_module.as_ref().unwrap();
        assert!(
            ng_module.exports.is_none(),
            "exports should be None when dynamic conditional spreads cannot be resolved"
        );
        assert!(
            ng_module.exports_span.is_some(),
            "exports_span should be preserved"
        );
        assert_eq!(
            ng_module
                .local_exports_element_spans
                .as_ref()
                .unwrap()
                .len(),
            2,
            "both spread elements should be captured in local_exports_element_spans"
        );
    }

    #[test]
    fn test_generate_extra_imports_in_local_mode() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{
  "compilerOptions": {},
  "angularCompilerOptions": {"generateExtraImportsInLocalMode": true},
  "files": ["module.ts", "components/main_comp.ts", "components/sibling.ts", "same_file.ts"]
}"#,
            ),
            (
                "/test/ext/external.ts",
                r#"
import { Component, NgModule } from '@angular/core';

@Component({ selector: 'ext-comp', template: '', standalone: false })
export class ExtComp {}

@NgModule({ declarations: [ExtComp], exports: [ExtComp] })
export class ExtModule {}
"#,
            ),
            (
                "/test/module.ts",
                r#"
import { NgModule } from '@angular/core';
import { ExtModule } from './ext/external';
import { MainComp, SameFilePipe } from './components/main_comp';
import { SiblingComp } from './components/sibling';

@NgModule({
  declarations: [MainComp, SiblingComp, SameFilePipe],
  imports: [ExtModule],
})
export class AppModule {}
"#,
            ),
            (
                "/test/components/main_comp.ts",
                r#"
import { Component, Pipe } from '@angular/core';

@Component({
  selector: 'main-comp',
  template: '<sibling></sibling><ext-comp></ext-comp>{{ 1 | samefile }}',
  standalone: false,
})
export class MainComp {}

@Pipe({ name: 'samefile', standalone: false })
export class SameFilePipe {}
"#,
            ),
            (
                "/test/components/sibling.ts",
                r#"
import { Component } from '@angular/core';

@Component({ selector: 'sibling', template: '', standalone: false })
export class SiblingComp {}
"#,
            ),
            (
                "/test/same_file.ts",
                r#"
import { Component, NgModule } from '@angular/core';

@Component({ selector: 'same-file-comp', template: '', standalone: false })
export class SameFileComp {}

@NgModule({ declarations: [SameFileComp] })
export class SameFileModule {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", false);

        let main = find_class(&results, "MainComp").expect("MainComp should exist");
        let main_comp = main.component.as_ref().expect("MainComp is a @Component");

        // `@NgModule.imports` pointing outside the compilation unit become global extra
        // imports, rebased from the NgModule's directory (`/test`) to the component's
        // (`/test/components`).
        assert_eq!(
            main_comp.local_compilation_extra_imports.as_deref(),
            Some(["../ext/external".to_string()].as_slice()),
            "external NgModule imports should be rebased onto the component's directory"
        );

        // Only declarations that are in the compilation unit *and* in another file survive.
        let declarations = main_comp
            .resolved_declarations
            .as_ref()
            .expect("resolved_declarations should be populated for the marked component");
        let names: Vec<&str> = declarations.iter().map(|d| d.name.as_str()).collect();
        assert_eq!(
            names,
            vec!["SiblingComp"],
            "ExtComp is outside the compilation unit and SameFilePipe shares MainComp's file"
        );
        assert_eq!(
            declarations[0]
                .r#ref
                .consumer_import
                .as_ref()
                .map(|i| i.specifier.as_str()),
            Some("./sibling"),
            "the emitted specifier must already be in the consuming component's frame"
        );

        // A component declared by an `@NgModule` in its own file is never marked.
        let same_file = find_class(&results, "SameFileComp").expect("SameFileComp should exist");
        assert!(
            same_file
                .component
                .as_ref()
                .expect("SameFileComp is a @Component")
                .local_compilation_extra_imports
                .is_none(),
            "a component sharing a file with its NgModule gets no extra imports"
        );
    }

    #[test]
    fn test_isolated_dts_consumption_with_return_type_and_local_const() {
        let fs = create_test_fs(&[
            (
                "/test/tsconfig.json",
                r#"{ "compilerOptions": {}, "files": ["consumer.ts"] }"#,
            ),
            (
                "/test/foo.d.ts",
                r#"
import * as i0 from '@angular/core';
import { ModuleWithProviders } from '@angular/core';

export declare class FooPipe {
    static ɵfac: i0.ɵɵFactoryDeclaration<FooPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<FooPipe, "foo", false>;
}

export declare class FooModule {
    static forRoot(): ModuleWithProviders<FooModule>;
    static ɵfac: i0.ɵɵFactoryDeclaration<FooModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<FooModule, [typeof FooPipe], never, [typeof FooPipe]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<FooModule>;
}
"#,
            ),
            (
                "/test/permissions_checker.d.ts",
                r#"
import * as i0 from '@angular/core';
import * as i1 from './foo';

export declare class PermissionsChecker {
    static ɵfac: i0.ɵɵFactoryDeclaration<PermissionsChecker, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PermissionsChecker, "permissions-checker", never, {}, { "stateChange": "stateChange" }, never, never, false, never>;
}

export declare class PermissionsCheckerModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<PermissionsCheckerModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<PermissionsCheckerModule, never, [typeof NG_MODULE_IMPORTS], [typeof PermissionsChecker, ReturnType<typeof i1.FooModule.forRoot>]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<PermissionsCheckerModule>;
}
"#,
            ),
            (
                "/test/consumer.ts",
                r#"
import { Component, NgModule } from '@angular/core';
import { PermissionsCheckerModule } from './permissions_checker';

@Component({
    selector: 'requirements-checker',
    template: '<permissions-checker></permissions-checker>{{ 1 | foo }}',
    standalone: false,
})
export class RequirementsChecker {}

@NgModule({
    declarations: [RequirementsChecker],
    imports: [PermissionsCheckerModule],
})
export class RequirementsCheckerModule {}
"#,
            ),
        ]);

        let results = run_analyzer(fs, "/test/tsconfig.json", true);
        let comp_meta =
            find_class(&results, "RequirementsChecker").expect("RequirementsChecker should exist");
        let comp = comp_meta.component.as_ref().unwrap();
        let resolved = comp
            .resolved_declarations
            .as_ref()
            .expect("resolved_declarations should be populated");
        let names: Vec<&str> = resolved.iter().map(|d| d.name.as_str()).collect();
        assert!(
            names.contains(&"PermissionsChecker"),
            "PermissionsChecker should be resolved from isolated .d.ts exports: {names:?}"
        );
        assert!(
            names.contains(&"FooPipe"),
            "FooPipe should be resolved through ReturnType<typeof i1.FooModule.forRoot> in isolated .d.ts exports: {names:?}"
        );
    }

    fn compile_non_exported_classes_fs(option: &str) -> crate::fs::OverlayFileSystem {
        let tsconfig = format!(r#"{{"compilerOptions": {{}}, {option} "files": ["test.ts"]}}"#);
        create_test_fs(&[
            ("/test/tsconfig.json", tsconfig.as_str()),
            (
                "/test/test.ts",
                r#"
import { Component, Directive, Injectable, NgModule, Pipe } from '@angular/core';

@Directive({ selector: '[local]', standalone: false })
class LocalDir {}

@Pipe({ name: 'local', standalone: false })
class LocalPipe {}

@Injectable()
class LocalService {}

@Component({ selector: 'standalone-local', template: '' })
class StandaloneLocal {}

@Directive({ selector: '[exported]', standalone: false })
export class ExportedDir {}

@NgModule({})
class LocalModule {}
"#,
            ),
        ])
    }

    fn analyzed_class_names(results: &[crate::AnalysisResult]) -> Vec<String> {
        let mut names: Vec<String> = results
            .iter()
            .flat_map(|r| r.classes.iter())
            .filter_map(|c| c.class_name.clone())
            .collect();
        names.sort();
        names
    }

    #[test]
    fn compile_non_exported_classes_false_skips_non_exported_non_standalone() {
        let fs = compile_non_exported_classes_fs(
            r#""angularCompilerOptions": {"compileNonExportedClasses": false},"#,
        );
        let results = run_analyzer(fs, "/test/tsconfig.json", true);
        assert_eq!(
            analyzed_class_names(&results),
            vec!["ExportedDir", "StandaloneLocal"],
        );
    }

    #[test]
    fn compile_non_exported_classes_defaults_to_true() {
        let fs = compile_non_exported_classes_fs("");
        let results = run_analyzer(fs, "/test/tsconfig.json", true);
        assert_eq!(analyzed_class_names(&results).len(), 6);
    }
}
