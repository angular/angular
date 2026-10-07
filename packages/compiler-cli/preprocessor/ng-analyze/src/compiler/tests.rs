use super::*;
use crate::fs::OverlayFileSystem;
use crate::types::{AnalysisResult, AnalyzerOptions, FileInvalidation, FileUpdate, FileUpdateType};
use crate::utils::create_resolver_with_fs;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;

#[test]
fn test_update_file_content() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        r#"
            import {Component} from '@angular/core';
            @Component({
                selector: 'app-root',
                template: '<h1>Hello</h1>'
            })
            export class AppComponent {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(false),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();

    let content = analyzer.get_file_content("/project/app.ts".to_string());
    assert!(content.is_ok());
    let content_str = content.unwrap();
    assert!(content_str.contains("Hello"));
    assert!(!content_str.contains("Hello Updated"));

    let update = FileUpdate {
        file_path: "/project/app.ts".to_string(),
        content: r#"
            import {Component} from '@angular/core';
            @Component({
                selector: 'app-root',
                template: '<h1>Hello Updated</h1>'
            })
            export class AppComponent {}
        "#
        .to_string(),
    };

    analyzer.update_file_content(vec![update]).unwrap();

    let result = analyzer.get_metadata_for_file("/project/app.ts".to_string());
    assert!(result.is_some());
    let analysis = result.unwrap();
    assert_eq!(analysis.file_path, "/project/app.ts");

    let content = analyzer.get_file_content("/project/app.ts".to_string());
    assert!(content.is_ok());
    assert!(content.unwrap().contains("Hello Updated"));
}

#[derive(Clone)]
struct DelayedFileSystem {
    fs: OverlayFileSystem,
    delayed_path: PathBuf,
    delay_ms: u64,
}

impl DelayedFileSystem {
    fn new(fs: OverlayFileSystem, delayed_path: &str, delay_ms: u64) -> Self {
        Self {
            fs,
            delayed_path: PathBuf::from(delayed_path),
            delay_ms,
        }
    }
}

impl oxc_resolver::FileSystem for DelayedFileSystem {
    fn new() -> Self {
        panic!("Not supported");
    }

    fn read(&self, path: &Path) -> std::io::Result<Vec<u8>> {
        if path == self.delayed_path {
            std::thread::sleep(std::time::Duration::from_millis(self.delay_ms));
        }
        self.fs.read(path)
    }

    fn read_to_string(&self, path: &Path) -> std::io::Result<String> {
        if path == self.delayed_path {
            std::thread::sleep(std::time::Duration::from_millis(self.delay_ms));
        }
        self.fs.read_to_string(path)
    }

    fn metadata(&self, path: &Path) -> std::io::Result<oxc_resolver::FileMetadata> {
        self.fs.metadata(path)
    }

    fn symlink_metadata(&self, path: &Path) -> std::io::Result<oxc_resolver::FileMetadata> {
        self.fs.symlink_metadata(path)
    }

    fn read_link(&self, path: &Path) -> std::result::Result<PathBuf, oxc_resolver::ResolveError> {
        self.fs.read_link(path)
    }

    fn canonicalize(&self, path: &Path) -> std::io::Result<PathBuf> {
        self.fs.canonicalize(path)
    }
}

impl crate::ResourceResolverFs for DelayedFileSystem {
    fn root_dirs(&self) -> Vec<PathBuf> {
        Vec::new()
    }
}

fn run_async_compiler_test<Fs: crate::ResourceResolverFs + Clone + 'static>(
    entrypoints: Vec<PathBuf>,
    fs: Fs,
    resolver: Arc<oxc_resolver::ResolverGeneric<Fs>>,
    final_sender: std::sync::mpsc::Sender<AnalysisResult>,
) {
    let pool = futures::executor::ThreadPool::builder()
        .pool_size(2)
        .create()
        .unwrap();

    let resource_registry = Arc::new(crate::resource_registry::ResourceRegistry::default());
    let engine = crate::query::QueryEngine::new_default(
        fs.clone(),
        resolver.clone(),
        resource_registry.clone(),
        Arc::new(std::sync::RwLock::new(entrypoints.clone())),
    );

    let mut queue = std::collections::VecDeque::from(entrypoints.clone());
    let mut seen_files: std::collections::HashSet<PathBuf> =
        std::collections::HashSet::from_iter(entrypoints.clone());
    let (batch_sender, batch_receiver) = std::sync::mpsc::channel();

    while !queue.is_empty() {
        let mut batch_count = 0;

        while let Some(file_path) = queue.pop_front() {
            let engine = engine.clone();
            let tx = batch_sender.clone();

            pool.spawn_ok(async move {
                let resolved = engine.analyze_optimized(file_path.clone()).await;
                let _ = tx.send((file_path, resolved));
            });
            batch_count += 1;
        }

        for _ in 0..batch_count {
            let (_file_path, resolved) = batch_receiver.recv().unwrap();

            let parse_res = engine.parse_file_by_id_blocking(resolved.file_id);
            let source_text = parse_res.lock().unwrap().borrow_owner().source_text.clone();

            let path_lookup = |id| engine.lookup_path(id);
            let declaring_exports = engine.declaring_export_names_blocking(&resolved);
            let cx = crate::analyzer::WireContext {
                mode: crate::analyzer::WireMode::Semantic,
                source_text: &source_text,
                converter: &resolved.converter,
                reference_strategy: &*engine.reference_strategy,
                path_lookup: Some(&path_lookup),
                declaring_exports: &declaring_exports,
            };

            let _ = final_sender.send(
                resolved
                    .to_wire(&cx)
                    .expect("semantic wire projection invariant"),
            );

            // Walk the file's resolved direct imports (graph edges) to discover the next files.
            for dep_path in &resolved.resolved_dependencies {
                if seen_files.insert(dep_path.clone()) {
                    queue.push_back(dep_path.clone());
                }
            }
        }
    }
}

#[test]
fn test_async_streaming_behavior() {
    let fs = OverlayFileSystem::new_with_overlay();
    fs.upsert_file(
        PathBuf::from("/project/tsconfig.json"),
        r#"{"files": ["a.ts", "b.ts"]}"#.to_string(),
    );
    fs.upsert_file(
        PathBuf::from("/project/a.ts"),
        "export class A {}".to_string(),
    );
    fs.upsert_file(
        PathBuf::from("/project/b.ts"),
        "export class B {}".to_string(),
    );

    // Delay b.ts's read so a.ts (trivial) must stream first. The delay is generous because the
    // self-driving queries run on the *shared global* thread pool — under parallel `cargo test`
    // load a.ts can be briefly starved, so the margin must clear that contention, not just b's read.
    let delayed_fs = DelayedFileSystem::new(fs, "/project/b.ts", 250);
    let resolver = Arc::new(create_resolver_with_fs(
        Path::new("/project/tsconfig.json"),
        delayed_fs.clone(),
        false,
        None,
    ));

    let (final_sender, receiver) = std::sync::mpsc::channel();

    run_async_compiler_test(
        vec![
            PathBuf::from("/project/a.ts"),
            PathBuf::from("/project/b.ts"),
        ],
        delayed_fs,
        resolver,
        final_sender,
    );

    let start = std::time::Instant::now();

    // We expect to receive A first because B is delayed
    let first = receiver.recv().unwrap();
    let elapsed = start.elapsed();

    assert_eq!(first.file_path, "/project/a.ts");
    // a.ts streamed without waiting for b.ts's 250ms-delayed read (streaming, not batch-at-end).
    assert!(
        elapsed < std::time::Duration::from_millis(250),
        "Expected a.ts to stream before b.ts's delay elapsed, but took {:?}",
        elapsed
    );

    let second = receiver.recv().unwrap();
    assert_eq!(second.file_path, "/project/b.ts");
}

#[test]
fn test_invalidate_files_html_returns_affected_ts() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        r#"
            import {Component} from '@angular/core';
            @Component({
                templateUrl: './app.component.html'
            })
            export class AppComponent {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/app.component.html".to_string(),
        "<h1>Hello</h1>".to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(false),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze().unwrap();

    // Consume the result
    let result = futures::executor::block_on(iterator.next()).unwrap();
    assert!(result.is_some());

    // Invalidate the HTML file
    let affected = analyzer
        .invalidate_files(vec![FileInvalidation {
            file_path: "/project/app.component.html".to_string(),
            update_type: FileUpdateType::Changed,
        }])
        .unwrap();

    // Check that the TS file is returned as affected
    assert_eq!(affected.len(), 1);
    assert_eq!(affected[0], "/project/app.ts");

    // The TS file was NOT re-analyzed because it was just an edit (Changed),
    // but we still have the analysis from the original cache (updated in place).
    let ts_metadata = analyzer.get_metadata_for_file("/project/app.ts".to_string());
    assert!(ts_metadata.is_some());
}

#[test]
fn test_invalidate_files_html_template_deletion_edge_case() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        r#"
            import {Component} from '@angular/core';
            @Component({
                templateUrl: './app.component.html'
            })
            export class AppComponent {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/app.component.html".to_string(),
        "<h1>Hello</h1>".to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(false),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze().unwrap();

    // Consume the result
    let result = futures::executor::block_on(iterator.next()).unwrap();
    assert!(result.is_some());

    let affected = analyzer
        .invalidate_files(vec![FileInvalidation {
            file_path: "/project/app.component.html".to_string(),
            update_type: FileUpdateType::Deleted,
        }])
        .unwrap();

    assert_eq!(affected.len(), 1);
    assert_eq!(affected[0], "/project/app.ts");

    // Verify that the TS file WAS re-analyzed (even though the template was deleted, the TS file exists).
    let ts_metadata = analyzer.get_metadata_for_file("/project/app.ts".to_string());
    assert!(ts_metadata.is_some());

    // Verify that the association is still in the registry (NGTSC behavior: references are preserved).
    let components_after =
        analyzer.get_ts_file_for_template("/project/app.component.html".to_string());
    assert!(components_after.is_some());
}

#[test]
fn test_invalidate_files_html_multiple_components() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.ts", "admin.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        r#"
            import {Component} from '@angular/core';
            @Component({
                selector: 'app-root',
                templateUrl: './shared.component.html'
            })
            export class AppComponent {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/admin.ts".to_string(),
        r#"
            import {Component} from '@angular/core';
            @Component({
                selector: 'app-admin',
                templateUrl: './shared.component.html'
            })
            export class AdminComponent {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/shared.component.html".to_string(),
        "<h1>Hello Shared</h1>".to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(false),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze().unwrap();

    // Consume results
    let mut count = 0;
    while futures::executor::block_on(iterator.next())
        .unwrap()
        .is_some()
    {
        count += 1;
    }
    assert_eq!(count, 2);

    // Invalidate the shared HTML file
    let affected = analyzer
        .invalidate_files(vec![FileInvalidation {
            file_path: "/project/shared.component.html".to_string(),
            update_type: FileUpdateType::Changed,
        }])
        .unwrap();

    // Check that BOTH TS files are returned as affected
    assert_eq!(affected.len(), 2);
    assert!(affected.contains(&"/project/app.ts".to_string()));
    assert!(affected.contains(&"/project/admin.ts".to_string()));
}

#[test]
fn test_invalidate_files_unregistered_file() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        r#"
            import {Component} from '@angular/core';
            @Component({
                selector: 'app-root',
                template: '<h1>Hello</h1>'
            })
            export class AppComponent {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(false),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze().unwrap();

    // Consume the result
    let result = futures::executor::block_on(iterator.next()).unwrap();
    assert!(result.is_some());

    // Invalidate a file that is not in the registry
    let affected = analyzer
        .invalidate_files(vec![FileInvalidation {
            file_path: "/project/random.html".to_string(),
            update_type: FileUpdateType::Changed,
        }])
        .unwrap();

    // Check that no files are affected
    assert_eq!(affected.len(), 0);
}

#[test]
fn test_invalidate_files_multiple_components_in_one_file() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        r#"
            import {Component} from '@angular/core';

            @Component({
                selector: 'app-root',
                templateUrl: './app.component.html'
            })
            export class AppComponent {}

            @Component({
                selector: 'app-admin',
                templateUrl: './admin.component.html'
            })
            export class AdminComponent {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/app.component.html".to_string(),
        "<h1>Hello App</h1>".to_string(),
    );
    virtual_files.insert(
        "/project/admin.component.html".to_string(),
        "<h1>Hello Admin</h1>".to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(false),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze().unwrap();

    // Consume results
    let result = futures::executor::block_on(iterator.next()).unwrap();
    assert!(result.is_some());

    // Verify both are registered
    let app_comps = analyzer.get_ts_file_for_template("/project/app.component.html".to_string());
    assert!(app_comps.is_some());
    let app_v = app_comps.unwrap();
    assert_eq!(app_v.len(), 1);
    assert_eq!(app_v[0].ts_file_path, "/project/app.ts");

    let admin_comps =
        analyzer.get_ts_file_for_template("/project/admin.component.html".to_string());
    assert!(admin_comps.is_some());
    let admin_v = admin_comps.unwrap();
    assert_eq!(admin_v.len(), 1);
    assert_eq!(admin_v[0].ts_file_path, "/project/app.ts");

    // Invalidate the TS file
    let affected = analyzer
        .invalidate_files(vec![FileInvalidation {
            file_path: "/project/app.ts".to_string(),
            update_type: FileUpdateType::Deleted,
        }])
        .unwrap();

    // Check that the TS file is returned as affected
    assert_eq!(affected.len(), 1);
    assert_eq!(affected[0], "/project/app.ts");

    // Verify both templates are unregistered
    let app_comps_after =
        analyzer.get_ts_file_for_template("/project/app.component.html".to_string());
    assert!(app_comps_after.is_none());

    let admin_comps_after =
        analyzer.get_ts_file_for_template("/project/admin.component.html".to_string());
    assert!(admin_comps_after.is_none());
}

#[test]
fn test_invalidate_files_html_partial_file_invalidation() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        r#"
            import {Component} from '@angular/core';

            @Component({
                templateUrl: './app.component.html'
            })
            export class AppComponent {}

            @Component({
                templateUrl: './admin.component.html'
            })
            export class AdminComponent {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/app.component.html".to_string(),
        "<h1>Hello App</h1>".to_string(),
    );
    virtual_files.insert(
        "/project/admin.component.html".to_string(),
        "<h1>Hello Admin</h1>".to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(false),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze().unwrap();

    // Consume results
    let result = futures::executor::block_on(iterator.next()).unwrap();
    assert!(result.is_some());

    // Invalidate ONLY the app HTML file
    let affected = analyzer
        .invalidate_files(vec![FileInvalidation {
            file_path: "/project/app.component.html".to_string(),
            update_type: FileUpdateType::Deleted,
        }])
        .unwrap();

    // Check that the TS file is returned as affected
    assert_eq!(affected.len(), 1);
    assert_eq!(affected[0], "/project/app.ts");

    // Verify that the TS file WAS re-analyzed
    let ts_metadata = analyzer.get_metadata_for_file("/project/app.ts".to_string());
    assert!(ts_metadata.is_some());

    // Verify that BOTH templates are still registered in the registry (references preserved)
    let app_comps = analyzer.get_ts_file_for_template("/project/app.component.html".to_string());
    assert!(app_comps.is_some());

    let admin_comps =
        analyzer.get_ts_file_for_template("/project/admin.component.html".to_string());
    assert!(admin_comps.is_some());
}

#[test]
fn test_resource_registry_missing_template_file() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        r#"
            import {Component} from '@angular/core';
            @Component({
                selector: 'app-root',
                templateUrl: './missing.component.html'
            })
            export class AppComponent {}
        "#
        .to_string(),
    );
    // Note: We do NOT create /project/missing.component.html

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(false),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze().unwrap();

    // Consume the result
    let result = futures::executor::block_on(iterator.next()).unwrap();
    assert!(result.is_some());
    assert_eq!(result.unwrap().files[0].file_path, "/project/app.ts");

    // Verify that the association is still in the registry even though the file was missing
    let components =
        analyzer.get_ts_file_for_template("/project/missing.component.html".to_string());
    assert!(components.is_some());
    let comps = components.unwrap();
    assert_eq!(comps.len(), 1);
    assert_eq!(comps[0].ts_file_path, "/project/app.ts");
}

#[test]
fn test_analysis_cancellation() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["a.ts"]}"#.to_string(),
    );
    virtual_files.insert("/project/a.ts".to_string(), "export class A {}".to_string());

    let fs = OverlayFileSystem::new_with_overlay();
    for (path, content) in &virtual_files {
        fs.upsert_file(PathBuf::from(path), content.clone());
    }

    // Delay a.ts by 100ms
    fs.set_delay(PathBuf::from("/project/a.ts"), 100);

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(false),
        virtual_files: None,
        ..Default::default()
    };

    let analyzer = Analyzer::new_core_with_fs(options, fs).unwrap();

    // Start streaming analysis
    let iterator = analyzer.analyze().unwrap();

    // Trigger update to cancel while a.ts is delayed
    let update = FileUpdate {
        file_path: "/project/a.ts".to_string(),
        content: "export class A { updated = true; }".to_string(),
    };

    std::thread::sleep(std::time::Duration::from_millis(50));
    analyzer.update_file_content(vec![update]).unwrap();

    // The next() call should return None because a.ts's analysis was canceled
    let result = futures::executor::block_on(iterator.next()).unwrap();
    assert!(result.is_none());
}

#[test]
fn test_dynamic_optimization_switching_no_panic() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        r#"
            import {Component} from '@angular/core';
            @Component({
                selector: 'app-root',
                template: '<h1>Dynamic Switching</h1>'
            })
            export class AppComponent {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(false), // Explicitly initialized with unoptimized!
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();

    // Perform unoptimized analysis first
    let iter1 = analyzer.analyze().unwrap();
    let res1 = futures::executor::block_on(iter1.next()).unwrap();
    assert!(res1.is_some());
    assert_eq!(res1.unwrap().files[0].file_path, "/project/app.ts");

    // Now dynamically switch to optimized analysis! Should NOT panic because self.compiler is always initialized.
    let iter2 = analyzer.analyze_optimized().unwrap();
    let res2 = futures::executor::block_on(iter2.next()).unwrap();
    assert!(res2.is_some());
    assert_eq!(res2.unwrap().files[0].file_path, "/project/app.ts");
}

#[test]
fn test_utf16_imports_end() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        "// José is here 😊\nimport {Component} from '@angular/core';\n@Component({\n    selector: 'app-root',\n    template: '<h1>Hello</h1>'\n})\nexport class AppComponent {}\n"
            .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(false),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze().unwrap();
    while futures::executor::block_on(iterator.next())
        .unwrap()
        .is_some()
    {}

    let result = analyzer.get_metadata_for_file("/project/app.ts".to_string());
    assert!(result.is_some());
    let analysis = result.unwrap();

    // Expected UTF-16 offset of the end of the import block:
    // "// José is here 😊\n" -> 19 chars (é is 1, 😊 is 2)
    // "import {Component} from '@angular/core';\n" -> 40 chars (without newline)
    // The span.end of the import statement points to the character after ';', which is '\n' at index 59.
    // Total UTF-16 offset = 59.
    // UTF-8 offset would be 62.
    assert_eq!(analysis.imports_end, 59);
}

/// Slices `text` the way a JS consumer slices a string: by UTF-16 code unit offsets.
fn slice_utf16(text: &str, start: u32, end: u32) -> String {
    let units: Vec<u16> = text.encode_utf16().collect();
    String::from_utf16(&units[start as usize..end as usize]).unwrap()
}

/// A `.d.ts` declaration's `nameSpan` reaches the TypeScript layer, which indexes the file's
/// JS string with it, so it must be a UTF-16 offset like every other wire span. Non-ASCII
/// text ahead of the class (a license header is typical) makes UTF-8 byte offsets diverge.
#[test]
fn test_utf16_dts_declaration_name_span() {
    let dts_source = "// © ünïcode 🎉\nimport * as i0 from '@angular/core';\nexport declare class LibDir {\n  static ɵdir: i0.ɵɵDirectiveDeclaration<LibDir, \"[lib]\", never, {}, {}, never, never, true, never>;\n  static ɵfac: i0.ɵɵFactoryDeclaration<LibDir, never>;\n}\nexport declare class LibModule {\n  static ɵmod: i0.ɵɵNgModuleDeclaration<LibModule, never, never, never>;\n}\n";

    for optimize in [false, true] {
        let mut virtual_files = HashMap::new();
        virtual_files.insert(
            "/project/tsconfig.json".to_string(),
            r#"{"files": ["app.ts", "lib.d.ts"]}"#.to_string(),
        );
        virtual_files.insert("/project/lib.d.ts".to_string(), dts_source.to_string());
        virtual_files.insert(
            "/project/app.ts".to_string(),
            r#"
            import {Component} from '@angular/core';
            import {LibDir, LibModule} from './lib';

            @Component({
                selector: 'app-root',
                template: '<div lib></div>',
                imports: [LibDir, LibModule],
            })
            export class AppComponent {}
            "#
            .to_string(),
        );

        let options = AnalyzerOptions {
            tsconfig_path: "/project/tsconfig.json".to_string(),
            optimize: Some(optimize),
            virtual_files: Some(virtual_files),
            ..Default::default()
        };
        let analyzer = Analyzer::new(options).unwrap();

        let mut results = Vec::new();
        if optimize {
            let iterator = analyzer.analyze_optimized().unwrap();
            while let Ok(Some(chunk)) = futures::executor::block_on(iterator.next()) {
                results.extend(chunk.files);
            }
        } else {
            let iterator = analyzer.analyze().unwrap();
            while futures::executor::block_on(iterator.next())
                .unwrap()
                .is_some()
            {}
            results.push(
                analyzer
                    .get_metadata_for_file("/project/app.ts".to_string())
                    .expect("app.ts metadata"),
            );
        }

        let app_meta = results
            .iter()
            .find(|res| res.file_path == "/project/app.ts")
            .expect("app.ts metadata");
        let component = app_meta
            .classes
            .iter()
            .find(|c| c.class_name.as_deref() == Some("AppComponent"))
            .and_then(|c| c.component.as_ref())
            .expect("AppComponent metadata");
        let decls = component
            .resolved_declarations
            .as_ref()
            .expect("resolved_declarations should exist");

        for name in ["LibDir", "LibModule"] {
            let decl = decls
                .iter()
                .find(|d| d.name == name)
                .unwrap_or_else(|| panic!("{name} declaration (optimize={optimize})"));
            assert_eq!(
                slice_utf16(dts_source, decl.name_span.start, decl.name_span.end),
                name,
                "nameSpan {:?} of {name} must be UTF-16 offsets into lib.d.ts (optimize={optimize})",
                decl.name_span
            );
        }
    }
}

#[test]
fn test_injectable_with_deps() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        r#"
            import {Injectable, Optional, Self, SkipSelf, Host, Inject, InjectionToken} from '@angular/core';
            const MY_TOKEN = new InjectionToken('MY_TOKEN');
            @Injectable({
                providedIn: 'root',
                useFactory: (a: any, b: any, c: any, d: any, e: any, f: any, g: any) => {},
                deps: [
                    SomeService,
                    [new Optional(), OptionalService],
                    [new Self(), SelfService],
                    [new SkipSelf(), SkipSelfService],
                    [new Host(), HostService],
                    [new Inject(MY_TOKEN)],
                    [new Optional(), new Inject(MY_TOKEN)],
                ]
            })
            export class MyService {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(false),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze().unwrap();
    let _res = futures::executor::block_on(iterator.next()).unwrap();

    let metadata = analyzer
        .get_metadata_for_file("/project/app.ts".to_string())
        .unwrap();
    let class_meta = &metadata.classes[0];

    let injectable = class_meta.injectable.as_ref().unwrap();
    let deps = injectable.deps.as_ref().unwrap();

    assert_eq!(deps.len(), 7);

    let content = analyzer
        .get_file_content("/project/app.ts".to_string())
        .unwrap();
    let get_token = |span: crate::types::metadata::SpanMetadata| {
        content[span.start as usize..span.end as usize].to_string()
    };

    // SomeService
    assert_eq!(get_token(deps[0].token_span.unwrap()), "SomeService");
    assert!(!deps[0].optional);
    assert!(!deps[0].self_qualifier);
    assert!(!deps[0].skip_self);
    assert!(!deps[0].host);

    // [new Optional(), OptionalService]
    assert_eq!(get_token(deps[1].token_span.unwrap()), "OptionalService");
    assert!(deps[1].optional);
    assert!(!deps[1].self_qualifier);
    assert!(!deps[1].skip_self);
    assert!(!deps[1].host);

    // [new Self(), SelfService]
    assert_eq!(get_token(deps[2].token_span.unwrap()), "SelfService");
    assert!(!deps[2].optional);
    assert!(deps[2].self_qualifier);
    assert!(!deps[2].skip_self);
    assert!(!deps[2].host);

    // [new SkipSelf(), SkipSelfService]
    assert_eq!(get_token(deps[3].token_span.unwrap()), "SkipSelfService");
    assert!(!deps[3].optional);
    assert!(!deps[3].self_qualifier);
    assert!(deps[3].skip_self);
    assert!(!deps[3].host);

    // [new Host(), HostService]
    assert_eq!(get_token(deps[4].token_span.unwrap()), "HostService");
    assert!(!deps[4].optional);
    assert!(!deps[4].self_qualifier);
    assert!(!deps[4].skip_self);
    assert!(!deps[4].host);

    // [new Inject(MY_TOKEN)]
    assert_eq!(get_token(deps[5].token_span.unwrap()), "MY_TOKEN");
    assert!(!deps[5].optional);
    assert!(!deps[5].self_qualifier);
    assert!(!deps[5].skip_self);
    assert!(!deps[5].host);

    // [new Optional(), new Inject(MY_TOKEN)]
    assert_eq!(get_token(deps[6].token_span.unwrap()), "MY_TOKEN");
    assert!(deps[6].optional);
    assert!(!deps[6].self_qualifier);
    assert!(!deps[6].skip_self);
    assert!(!deps[6].host);
}

#[test]
fn test_allowed_sources_allows_dts() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        r#"
            import {Component, NgModule} from '@angular/core';
            import {ActivatedRoute, RouterModule} from './router';

            @Component({
                selector: 'app-root',
                template: '<h1>Hello</h1>',
                standalone: false,
            })
            export class AppComponent {
                constructor(private route: ActivatedRoute) {}
            }

            @NgModule({
                declarations: [AppComponent],
                imports: [RouterModule.forRoot([])],
                bootstrap: [AppComponent]
            })
            export class AppModule {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/router.d.ts".to_string(),
        r#"
            import * as i0 from '@angular/core';
            export declare class ActivatedRoute {
                static ɵprov: any;
            }
            export declare class RouterModule {
                static forRoot(routes: any[]): i0.ModuleWithProviders<RouterModule>;
                static ɵmod: i0.ɵɵNgModuleDeclaration<RouterModule, never, never, never>;
            }
        "#
        .to_string(),
    );

    // Only allow tsconfig.json and app.ts (blocked: router.d.ts)
    let allowed_sources = vec![
        "/project/tsconfig.json".to_string(),
        "/project/app.ts".to_string(),
    ];

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        node_modules_path_override: None,
        allowed_sources: Some(allowed_sources),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze_optimized().unwrap();

    let mut results = Vec::new();
    while let Some(chunk) = futures::executor::block_on(iterator.next()).unwrap() {
        for file in chunk.files {
            results.push(file);
        }
    }

    // Verify that the imports of AppModule are resolved successfully and not treated as Dynamic!
    let app_module_analysis = results
        .iter()
        .find(|res| res.file_path == "/project/app.ts")
        .unwrap();
    let app_module_class = app_module_analysis
        .classes
        .iter()
        .find(|c| c.class_name.as_deref() == Some("AppModule"))
        .unwrap();
    let ng_module = app_module_class
        .ng_module
        .as_ref()
        .expect("AppModule should be an NgModule");
    let imports = ng_module
        .imports
        .as_ref()
        .expect("AppModule should have imports");

    // We expect RouterModule to be in the imports list, resolved as imported!
    assert_eq!(imports.len(), 1);
    let importable = imports[0]
        .typecheck_import
        .as_ref()
        .expect("RouterModule is declared in another file");
    assert_eq!(importable.symbol, "RouterModule");
    assert_eq!(importable.specifier, "./router");
}

#[test]
fn test_resource_files_in_entrypoints_and_metadata() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.ts", "app.component.html", "app.component.css"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        r#"
            import {Component} from '@angular/core';
            @Component({
                templateUrl: './app.component.html',
                styleUrls: ['./app.component.css']
            })
            export class AppComponent {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/app.component.html".to_string(),
        "<h1>Hello</h1>".to_string(),
    );
    virtual_files.insert(
        "/project/app.component.css".to_string(),
        ".app-component { background-color: color(from var(--primary) srgb r g b/.38); }"
            .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(false),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Arc::new(Analyzer::new(options).unwrap());

    // Asking for metadata on the TS file returns the component analysis without attempting to parse resource files
    let ts_meta = analyzer
        .get_metadata_for_file("/project/app.ts".to_string())
        .expect("app.ts should return valid metadata");
    assert_eq!(ts_meta.classes.len(), 1);
    assert_eq!(
        ts_meta.classes[0].class_name.as_deref(),
        Some("AppComponent")
    );
}

/// Resources and other non-source files carry no class metadata, so asking for it answers `None`.
/// It must not panic: over N-API a panic here aborts the host Node process, and in the sidecar it
/// kills the child with every in-flight request unanswered.
#[test]
fn test_get_metadata_for_file_on_non_source_path_returns_none() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        r#"
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', templateUrl: './app.component.html', styleUrls: ['./app.component.css'] })
        export class AppComponent {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/app.component.html".to_string(),
        "<h1>Hello</h1>".to_string(),
    );
    virtual_files.insert(
        "/project/app.component.css".to_string(),
        "h1 { color: red; }".to_string(),
    );
    virtual_files.insert(
        "/project/data.json".to_string(),
        r#"{"key": "value"}"#.to_string(),
    );
    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(false),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };
    let analyzer = Analyzer::new(options).unwrap();

    for resource in [
        "/project/app.component.html",
        "/project/app.component.css",
        "/project/data.json",
        "/project/tsconfig.json",
        "/project/README",
    ] {
        assert!(
            analyzer
                .get_metadata_for_file(resource.to_string())
                .is_none(),
            "expected no metadata for {resource}"
        );
    }

    // The analyzer is still usable afterwards.
    let ts_meta = analyzer
        .get_metadata_for_file("/project/app.ts".to_string())
        .expect("app.ts should return valid metadata");
    assert_eq!(ts_meta.classes.len(), 1);
}

/// A source path that names no file has no metadata. Answering an empty `AnalysisResult` instead
/// would be indistinguishable from a real file that declares no classes.
#[test]
fn test_get_metadata_for_file_on_missing_file_returns_none() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        "export class Plain {}".to_string(),
    );
    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(false),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };
    let analyzer = Analyzer::new(options).unwrap();

    assert!(analyzer
        .get_metadata_for_file("/project/missing.ts".to_string())
        .is_none());
    // An existing source with no classes still answers, with an empty result.
    let plain = analyzer
        .get_metadata_for_file("/project/app.ts".to_string())
        .expect("app.ts exists");
    assert!(plain.classes.is_empty());
}

#[test]
fn test_ngmodule_array_spread_imports_resolution() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.ts", "extra_modules.ts", "module_a.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/module_a.ts".to_string(),
        r#"
            import {NgModule} from '@angular/core';
            @NgModule({})
            export class ModuleA {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/extra_modules.ts".to_string(),
        r#"
            import {NgModule} from '@angular/core';
            @NgModule({})
            export class ModuleB {}
            export const ExtraModules = [ModuleB];
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        r#"
            import {Component, NgModule} from '@angular/core';
            import {ModuleA} from './module_a';
            import {ExtraModules} from './extra_modules';

            @Component({
                selector: 'my-comp',
                template: '<div>Test</div>',
                standalone: true,
            })
            export class MyComponent {}

            @NgModule({
                imports: [
                    ModuleA,
                    ...ExtraModules,
                    MyComponent,
                ],
                exports: [
                    MyComponent,
                ],
            })
            export class MyModule {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze_optimized().unwrap();

    let mut results = Vec::new();
    while let Some(chunk) = futures::executor::block_on(iterator.next()).unwrap() {
        for file in chunk.files {
            results.push(file);
        }
    }

    let app_meta = results
        .iter()
        .find(|res| res.file_path == "/project/app.ts")
        .unwrap();
    let my_module = app_meta
        .classes
        .iter()
        .find(|c| c.class_name.as_deref() == Some("MyModule"))
        .unwrap();
    let ng_module = my_module.ng_module.as_ref().expect("MyModule metadata");
    let imports = ng_module.imports.as_ref().expect("imports metadata");
    let names: Vec<&str> = imports
        .iter()
        .map(|r| {
            r.local_alias
                .as_deref()
                .or_else(|| r.typecheck_import.as_ref().map(|i| i.symbol.as_str()))
                .unwrap()
        })
        .collect();

    assert_eq!(names, vec!["ModuleA", "ModuleB", "MyComponent"]);
}

#[test]
fn test_ngmodule_dts_tuple_typeof_array_spread() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.ts", "extra_modules.d.ts", "modules.d.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/modules.d.ts".to_string(),
        r#"
            import * as i0 from '@angular/core';
            export declare class ModuleC {
                static ɵmod: i0.ɵɵNgModuleDeclaration<ModuleC, never, never, never>;
            }
            export declare class ModuleD {
                static ɵmod: i0.ɵɵNgModuleDeclaration<ModuleD, never, never, never>;
            }
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/extra_modules.d.ts".to_string(),
        r#"
            import {ModuleC, ModuleD} from './modules';
            export declare const ExtraModules: [typeof ModuleC, typeof ModuleD];
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        r#"
            import {Component, NgModule} from '@angular/core';
            import {ExtraModules} from './extra_modules';

            @Component({
                selector: 'my-comp',
                template: '<div>Test</div>',
                standalone: true,
            })
            export class MyComponent {}

            @NgModule({
                imports: [
                    ...ExtraModules,
                    MyComponent,
                ],
                exports: [
                    MyComponent,
                ],
            })
            export class MyModule {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze_optimized().unwrap();

    let mut results = Vec::new();
    while let Ok(Some(chunk)) = futures::executor::block_on(iterator.next()) {
        for file in chunk.files {
            results.push(file);
        }
    }

    let file_paths: Vec<&str> = results.iter().map(|res| res.file_path.as_str()).collect();
    println!("results file_paths: {:?}", file_paths);
    let app_meta = results
        .iter()
        .find(|res| res.file_path == "/project/app.ts")
        .expect("app.ts metadata");
    let my_module = app_meta
        .classes
        .iter()
        .find(|c| c.class_name.as_deref() == Some("MyModule"))
        .unwrap();
    let ng_module = my_module.ng_module.as_ref().expect("MyModule metadata");
    let imports = ng_module
        .imports
        .as_ref()
        .expect("imports metadata should exist");
    let names: Vec<&str> = imports
        .iter()
        .map(|r| {
            r.local_alias
                .as_deref()
                .or_else(|| r.typecheck_import.as_ref().map(|i| i.symbol.as_str()))
                .unwrap()
        })
        .collect();

    assert_eq!(names, vec!["ModuleC", "ModuleD", "MyComponent"]);
}

#[test]
fn test_component_dts_readonly_tuple_typeof_array_spread() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.ts", "directives.d.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/directives.d.ts".to_string(),
        r#"
            import * as i0 from '@angular/core';
            export declare class DirA {
                static ɵdir: i0.ɵɵDirectiveDeclaration<DirA, '[dirA]', never, {}, {}, never, never, true>;
            }
            export declare class DirB {
                static ɵdir: i0.ɵɵDirectiveDeclaration<DirB, '[dirB]', never, {}, {}, never, never, true>;
            }
            export declare const READONLY_DEPS: readonly [typeof DirA, typeof DirB];
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        r#"
            import {Component} from '@angular/core';
            import {READONLY_DEPS} from './directives';

            @Component({
                selector: 'my-comp',
                template: '<div dirA dirB>Test</div>',
                standalone: true,
                imports: [
                    ...READONLY_DEPS,
                ],
            })
            export class MyComponent {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze_optimized().unwrap();

    let mut results = Vec::new();
    while let Ok(Some(chunk)) = futures::executor::block_on(iterator.next()) {
        for file in chunk.files {
            results.push(file);
        }
    }

    let app_meta = results
        .iter()
        .find(|res| res.file_path == "/project/app.ts")
        .expect("app.ts metadata");
    let my_component = app_meta
        .classes
        .iter()
        .find(|c| c.class_name.as_deref() == Some("MyComponent"))
        .unwrap();
    let component = my_component
        .component
        .as_ref()
        .expect("MyComponent metadata");
    assert!(component.raw_imports_span.is_none());
    let decls = component
        .resolved_declarations
        .as_ref()
        .expect("resolved_declarations should exist");
    let names: Vec<&str> = decls.iter().map(|d| d.name.as_str()).collect();
    assert_eq!(names, vec!["DirA", "DirB"]);
}

/// ngtsc's `ComponentDecoratorHandler` gives a component without a selector, or with an empty
/// one, the default selector `ng-component`; a directive gets none. Both the scope
/// declarations and the component's own metadata must carry that effective selector, so that
/// emit matching and the type-check block agree with ngtsc.
#[test]
fn test_selectorless_component_gets_default_selector() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        r#"
            import {Component, Directive} from '@angular/core';

            @Component({template: '<span></span>'})
            export class NoSelector {}

            @Component({selector: '', template: '<span></span>'})
            export class EmptySelector {}

            @Directive({})
            export class NoSelectorDir {}

            @Component({
                selector: 'app-root',
                imports: [NoSelector, EmptySelector, NoSelectorDir],
                template: '<ng-component></ng-component>',
            })
            export class App {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let meta = analyzer
        .get_metadata_for_file("/project/app.ts".to_string())
        .expect("app.ts metadata");
    let component = |name: &str| {
        meta.classes
            .iter()
            .find(|c| c.class_name.as_deref() == Some(name))
            .and_then(|c| c.component.as_ref())
            .unwrap_or_else(|| panic!("{name} component metadata"))
    };

    assert_eq!(
        component("NoSelector").selector.as_deref(),
        Some("ng-component")
    );
    assert_eq!(
        component("EmptySelector").selector.as_deref(),
        Some("ng-component")
    );

    let decls = component("App")
        .resolved_declarations
        .as_ref()
        .expect("resolved_declarations should exist");
    let selectors: Vec<(&str, Option<&str>)> = decls
        .iter()
        .map(|d| (d.name.as_str(), d.selector.as_deref()))
        .collect();
    assert_eq!(
        selectors,
        vec![
            ("NoSelector", Some("ng-component")),
            ("EmptySelector", Some("ng-component")),
            ("NoSelectorDir", None),
        ]
    );
}

#[test]
fn test_unresolvable_selector_diagnostic() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.component.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';
            const DYNAMIC_SELECTOR = 'app-' + Math.random();

            @Component({
                selector: DYNAMIC_SELECTOR,
                template: '<div></div>',
                standalone: true,
            })
            export class BadComponent {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let res = analyzer.get_metadata_for_file("/project/app.component.ts".to_string());
    let meta = res.expect("app.component.ts metadata");
    assert_eq!(meta.diagnostics.len(), 1);
    let diag = &meta.diagnostics[0];
    assert_eq!(diag.code, 1010);
    assert_eq!(diag.category, 1);
    assert_eq!(diag.message_text, "selector must be a string");
}

#[test]
fn test_invalid_style_urls_diagnostic_ng2021() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.component.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';

            @Component({
                selector: 'app-bad-styles',
                template: '<div></div>',
                styleUrl: './single.css',
                styleUrls: ['./multiple.css'],
                standalone: true,
            })
            export class BadStylesComponent {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/single.css".to_string(),
        ".single { color: red; }".to_string(),
    );
    virtual_files.insert(
        "/project/multiple.css".to_string(),
        ".multiple { color: blue; }".to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let res = analyzer.get_metadata_for_file("/project/app.component.ts".to_string());
    let meta = res.expect("app.component.ts metadata");
    assert_eq!(meta.diagnostics.len(), 1);
    let diag = &meta.diagnostics[0];
    assert_eq!(diag.code, 2021);
    assert_eq!(diag.category, 1);
    assert_eq!(
        diag.message_text,
        "@Component cannot define both `styleUrl` and `styleUrls`. Use `styleUrl` if the component has one stylesheet, or `styleUrls` if it has multiple"
    );
}

#[test]
fn test_missing_template_resource_diagnostic_ng2008() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.component.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';

            @Component({
                selector: 'app-missing-template',
                templateUrl: './nonexistent.html',
                standalone: true,
            })
            export class MissingTemplateComponent {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let res = analyzer.get_metadata_for_file("/project/app.component.ts".to_string());
    let meta = res.expect("app.component.ts metadata");
    assert_eq!(meta.diagnostics.len(), 1);
    let diag = &meta.diagnostics[0];
    assert_eq!(diag.code, 2008);
    assert_eq!(diag.category, 1);
    assert!(diag
        .message_text
        .contains("Could not find template file './nonexistent.html'."));
}

#[test]
fn test_missing_style_resource_diagnostic_ng2008() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.component.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';

            @Component({
                selector: 'app-missing-style',
                template: '<div></div>',
                styleUrl: './nonexistent.css',
                standalone: true,
            })
            export class MissingStyleComponent {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let res = analyzer.get_metadata_for_file("/project/app.component.ts".to_string());
    let meta = res.expect("app.component.ts metadata");
    assert_eq!(meta.diagnostics.len(), 1);
    let diag = &meta.diagnostics[0];
    assert_eq!(diag.code, 2008);
    assert_eq!(diag.category, 1);
    assert!(diag
        .message_text
        .contains("Could not find stylesheet file './nonexistent.css'."));
}

#[test]
fn test_missing_pipe_name_diagnostic_ng2002() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["test.pipe.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/test.pipe.ts".to_string(),
        r#"
            import { Pipe, PipeTransform } from '@angular/core';

            @Pipe({
                pure: true,
            })
            export class NamelessPipe implements PipeTransform {
                transform(value: any) { return value; }
            }
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let res = analyzer.get_metadata_for_file("/project/test.pipe.ts".to_string());
    let meta = res.expect("test.pipe.ts metadata");
    assert_eq!(meta.diagnostics.len(), 1);
    let diag = &meta.diagnostics[0];
    assert_eq!(diag.code, 2002);
    assert_eq!(diag.category, 1);
    assert!(diag
        .message_text
        .contains("@Pipe decorator is missing name field"));
}

#[test]
fn test_missing_directive_selector_diagnostic_ng2004() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["test.directive.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/test.directive.ts".to_string(),
        r#"
            import { Directive } from '@angular/core';

            @Directive({
                selector: '',
            })
            export class EmptySelectorDirective {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let res = analyzer.get_metadata_for_file("/project/test.directive.ts".to_string());
    let meta = res.expect("test.directive.ts metadata");
    assert_eq!(meta.diagnostics.len(), 1);
    let diag = &meta.diagnostics[0];
    assert_eq!(diag.code, 2004);
    assert_eq!(diag.category, 1);
    assert!(diag
        .message_text
        .contains("Directive EmptySelectorDirective has no selector, please add it!"));
}

#[test]
fn test_cross_file_selector_in_optimized_mode() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.component.ts", "constants.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/constants.ts".to_string(),
        r#"export const SELECTOR = 'app-custom';"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';
            import { SELECTOR } from './constants';

            @Component({
                selector: SELECTOR,
                template: '<div></div>',
                standalone: true,
            })
            export class CustomComponent {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let res = analyzer.get_metadata_for_file("/project/app.component.ts".to_string());
    let meta = res.expect("app.component.ts metadata");
    assert_eq!(meta.diagnostics.len(), 0);
    assert_eq!(
        meta.classes[0].component.as_ref().unwrap().selector,
        Some("app-custom".to_string())
    );
}

#[test]
fn test_cross_file_selector_in_non_optimized_mode() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.component.ts", "constants.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/constants.ts".to_string(),
        r#"export const SELECTOR = 'app-custom';"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';
            import { SELECTOR } from './constants';

            @Component({
                selector: SELECTOR,
                template: '<div></div>',
                standalone: true,
            })
            export class CustomComponent {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(false),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze().unwrap();
    let mut all_files = Vec::new();
    while let Ok(Some(chunk)) = futures::executor::block_on(iterator.next()) {
        all_files.extend(chunk.files);
    }

    let app_meta = all_files
        .iter()
        .find(|f| f.file_path.contains("app.component.ts"))
        .expect("app.component.ts in chunk");

    // Like ngtsc's local compilation, imported constants are evaluated.
    assert_eq!(app_meta.diagnostics.len(), 0);
    assert_eq!(
        app_meta.classes[0].component.as_ref().unwrap().selector,
        Some("app-custom".to_string())
    );
}

#[test]
fn test_unresolvable_selector_in_non_optimized_mode() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.component.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';
            import { SELECTOR } from 'external-lib';

            @Component({
                selector: SELECTOR,
                template: '<div></div>',
            })
            export class CustomComponent {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(false),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze().unwrap();
    let mut all_files = Vec::new();
    while let Ok(Some(chunk)) = futures::executor::block_on(iterator.next()) {
        all_files.extend(chunk.files);
    }

    let app_meta = all_files
        .iter()
        .find(|f| f.file_path.contains("app.component.ts"))
        .expect("app.component.ts in chunk");

    // TODO(parity): ngtsc reports NG11001 for imports outside the compilation unit.
    assert_eq!(app_meta.diagnostics.len(), 1);
    assert_eq!(app_meta.diagnostics[0].code, 1010);
}

/// A component whose `styles` use template-literal arithmetic, an imported constant, an
/// imported spread and an array-destructured binding.
fn styles_evaluation_files() -> HashMap<String, String> {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["test.component.ts", "styles.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/styles.ts".to_string(),
        r#"
            export const BORDER = 2;
            export const SHARED_STYLES = ['.a { margin: 0; }', `.b { gap: ${BORDER * 4}px; }`];
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/test.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';
            import { BORDER, SHARED_STYLES } from './styles';

            const HEIGHT = 1000;
            const SIZE = 100;
            const [FIRST_STYLE] = ['.c { color: red; }', '.d {}'];

            @Component({
                selector: 'test-cmp',
                template: '<div class="box"></div>',
                styles: [
                    `:host { height: ${HEIGHT}px; border: ${BORDER}px solid black; }`,
                    `.box { top: ${HEIGHT / 2 - SIZE / 2}px; width: ${SIZE % 30 + SIZE * 2}px; }`,
                    ...SHARED_STYLES,
                    FIRST_STYLE,
                ],
            })
            export class TestComponent {}
        "#
        .to_string(),
    );
    virtual_files
}

fn expected_evaluated_styles() -> Option<Vec<String>> {
    Some(
        [
            ":host { height: 1000px; border: 2px solid black; }",
            ".box { top: 450px; width: 210px; }",
            ".a { margin: 0; }",
            ".b { gap: 8px; }",
            ".c { color: red; }",
        ]
        .map(str::to_string)
        .to_vec(),
    )
}

#[test]
fn test_styles_fold_arithmetic_and_imported_constants_in_optimized_mode() {
    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(styles_evaluation_files()),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let meta = analyzer
        .get_metadata_for_file("/project/test.component.ts".to_string())
        .expect("test.component.ts metadata");
    assert_eq!(meta.diagnostics.len(), 0);
    assert_eq!(
        meta.classes[0].component.as_ref().unwrap().styles,
        expected_evaluated_styles()
    );
}

#[test]
fn test_styles_fold_arithmetic_and_imported_constants_in_non_optimized_mode() {
    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(false),
        virtual_files: Some(styles_evaluation_files()),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze().unwrap();
    let mut all_files = Vec::new();
    while let Ok(Some(chunk)) = futures::executor::block_on(iterator.next()) {
        all_files.extend(chunk.files);
    }
    let test_meta = all_files
        .iter()
        .find(|f| f.file_path.contains("test.component.ts"))
        .expect("test.component.ts in chunk");

    // Local compilation still resolves constants imported from the compilation unit.
    assert_eq!(test_meta.diagnostics.len(), 0);
    assert_eq!(
        test_meta.classes[0].component.as_ref().unwrap().styles,
        expected_evaluated_styles()
    );
}

/// A `styles` value that does not fully evaluate is `NG1010` on the `styles` expression.
#[test]
fn test_unresolvable_styles_diagnostic_ng1010() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["a.component.ts", "b.component.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/a.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';

            @Component({
                selector: 'cmp-a',
                template: '<div></div>',
                styles: ['.a {}', `.b { top: ${Math.random()}px; }`],
            })
            export class ComponentA {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/b.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';

            @Component({
                selector: 'cmp-b',
                template: '<div></div>',
                styles: 42 as any,
            })
            export class ComponentB {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files.clone()),
        ..Default::default()
    };
    let analyzer = Analyzer::new(options).unwrap();

    let cases = [
        (
            "/project/a.component.ts",
            "Failed to resolve styles at position 1 to a string",
            "['.a {}', `.b { top: ${Math.random()}px; }`]",
        ),
        (
            "/project/b.component.ts",
            "Failed to resolve @Component.styles to a string or an array of strings",
            "42 as any",
        ),
    ];
    for (path, message, node_text) in cases {
        let meta = analyzer
            .get_metadata_for_file(path.to_string())
            .unwrap_or_else(|| panic!("{path} metadata"));
        assert_eq!(meta.diagnostics.len(), 1, "{path}");
        let diag = &meta.diagnostics[0];
        assert_eq!(diag.code, 1010);
        assert_eq!(diag.category, 1);
        assert_eq!(diag.message_text, message);
        // ASCII sources, so UTF-16 offsets equal byte offsets.
        let span = diag.span.as_ref().expect("diagnostic span");
        let source = &virtual_files[path];
        assert_eq!(&source[span.start as usize..span.end as usize], node_text);
        assert_eq!(meta.classes[0].component.as_ref().unwrap().styles, None);
    }
}

#[test]
fn test_cross_file_invalid_selector_in_optimized_mode() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.component.ts", "constants.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/constants.ts".to_string(),
        r#"export const SELECTOR = 12345;"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';
            import { SELECTOR } from './constants';

            @Component({
                selector: SELECTOR,
                template: '<div></div>',
                standalone: true,
            })
            export class BadCustomComponent {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let res = analyzer.get_metadata_for_file("/project/app.component.ts".to_string());
    let meta = res.expect("app.component.ts metadata");
    assert_eq!(meta.diagnostics.len(), 1);
    assert_eq!(meta.diagnostics[0].code, 1010);
    assert_eq!(
        meta.diagnostics[0].message_text,
        "selector must be a string"
    );
}

#[test]
fn test_cross_file_empty_directive_selector_in_optimized_mode() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["test.directive.ts", "constants.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/constants.ts".to_string(),
        r#"export const EMPTY_SEL = '';"#.to_string(),
    );
    virtual_files.insert(
        "/project/test.directive.ts".to_string(),
        r#"
            import { Directive } from '@angular/core';
            import { EMPTY_SEL } from './constants';

            @Directive({
                selector: EMPTY_SEL,
            })
            export class EmptyConstDirective {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let res = analyzer.get_metadata_for_file("/project/test.directive.ts".to_string());
    let meta = res.expect("test.directive.ts metadata");
    assert_eq!(meta.diagnostics.len(), 1);
    assert_eq!(meta.diagnostics[0].code, 2004);
    assert!(meta.diagnostics[0]
        .message_text
        .contains("Directive EmptyConstDirective has no selector, please add it!"));
}

#[test]
fn test_shadow_dom_selector_diagnostics_ng2009() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["no-hyphen.component.ts", "upper-case.component.ts", "attr-selector.component.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/no-hyphen.component.ts".to_string(),
        r#"
            import { Component, ViewEncapsulation } from '@angular/core';

            @Component({
                selector: 'widget',
                template: '<div></div>',
                encapsulation: ViewEncapsulation.ShadowDom,
                standalone: true,
            })
            export class NoHyphenComponent {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/upper-case.component.ts".to_string(),
        r#"
            import { Component, ViewEncapsulation } from '@angular/core';

            @Component({
                selector: 'appWidget',
                template: '<div></div>',
                encapsulation: ViewEncapsulation.ShadowDom,
                standalone: true,
            })
            export class UpperCaseComponent {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/attr-selector.component.ts".to_string(),
        r#"
            import { Component, ViewEncapsulation } from '@angular/core';

            @Component({
                selector: 'widget[foo]',
                template: '<div></div>',
                encapsulation: ViewEncapsulation.ShadowDom,
                standalone: true,
            })
            export class AttrSelectorComponent {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();

    let meta = analyzer
        .get_metadata_for_file("/project/no-hyphen.component.ts".to_string())
        .expect("no-hyphen metadata");
    assert_eq!(meta.diagnostics.len(), 1);
    assert_eq!(meta.diagnostics[0].code, 2009);
    assert_eq!(
        meta.diagnostics[0].message_text,
        "Selector of a component that uses ViewEncapsulation.ShadowDom must contain a hyphen."
    );

    let meta = analyzer
        .get_metadata_for_file("/project/upper-case.component.ts".to_string())
        .expect("upper-case metadata");
    assert_eq!(meta.diagnostics.len(), 1);
    assert_eq!(meta.diagnostics[0].code, 2009);
    assert_eq!(
        meta.diagnostics[0].message_text,
        "Selector of a ShadowDom-encapsulated component must all be in lower case."
    );

    // Attribute selectors are deliberately exempt, matching the reference's escape hatch.
    let meta = analyzer
        .get_metadata_for_file("/project/attr-selector.component.ts".to_string())
        .expect("attr-selector metadata");
    assert_eq!(meta.diagnostics.len(), 0);
}

#[test]
fn test_pipe_field_diagnostics_ng1010() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["bad.pipe.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/bad.pipe.ts".to_string(),
        r#"
            import { Pipe } from '@angular/core';

            declare function pipeName(): string;
            declare function isPure(): boolean;

            @Pipe({
                name: pipeName(),
                pure: isPure(),
            })
            export class BadPipe {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let meta = analyzer
        .get_metadata_for_file("/project/bad.pipe.ts".to_string())
        .expect("bad.pipe.ts metadata");
    let messages: Vec<_> = meta
        .diagnostics
        .iter()
        .map(|d| {
            assert_eq!(d.code, 1010);
            d.message_text.as_str()
        })
        .collect();
    assert_eq!(
        messages,
        vec![
            "@Pipe.name must be a string",
            "@Pipe.pure must be a boolean"
        ]
    );
}

#[test]
fn test_empty_pipe_name_is_not_missing() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["empty.pipe.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/empty.pipe.ts".to_string(),
        r#"
            import { Pipe } from '@angular/core';

            @Pipe({
                name: '',
            })
            export class EmptyNamePipe {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let meta = analyzer
        .get_metadata_for_file("/project/empty.pipe.ts".to_string())
        .expect("empty.pipe.ts metadata");
    // ngtsc's pipe handler accepts an empty string as a name — NG2002 is only for a
    // missing `name` property.
    assert_eq!(meta.diagnostics.len(), 0);
}

#[test]
fn test_dynamic_standalone_flag_diagnostic_ng1010() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["bad.directive.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/bad.directive.ts".to_string(),
        r#"
            import { Directive } from '@angular/core';

            declare function isStandalone(): boolean;

            @Directive({
                selector: '[appBad]',
                standalone: isStandalone(),
            })
            export class BadDirective {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let meta = analyzer
        .get_metadata_for_file("/project/bad.directive.ts".to_string())
        .expect("bad.directive.ts metadata");
    assert_eq!(meta.diagnostics.len(), 1);
    assert_eq!(meta.diagnostics[0].code, 1010);
    assert_eq!(
        meta.diagnostics[0].message_text,
        "standalone flag must be a boolean"
    );
}

#[test]
fn test_dynamic_host_listener_args_diagnostic_ng1010() {
    // Matches ngtsc behavior in:
    // packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L742-L754
    // packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L1091-L1105
    // where isStringArrayOrDie rejects @HostListener arguments that do not statically
    // resolve to a string array with ErrorCode.VALUE_HAS_WRONG_TYPE (NG1010).
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["bad.directive.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/bad.directive.ts".to_string(),
        r#"
            import { Directive, HostListener } from '@angular/core';

            declare function getArg(): string;

            @Directive({
                selector: '[appBad]',
                standalone: true,
            })
            export class BadDirective {
                @HostListener('click', [getArg()])
                onClick(arg: any) {}
            }
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let meta = analyzer
        .get_metadata_for_file("/project/bad.directive.ts".to_string())
        .expect("bad.directive.ts metadata");
    assert_eq!(meta.diagnostics.len(), 1);
    assert_eq!(meta.diagnostics[0].code, 1010);
    assert_eq!(
        meta.diagnostics[0].message_text,
        "Failed to resolve @HostListener.args at position 0 to a string"
    );
}

#[test]
fn test_non_array_host_listener_args_diagnostic_ng1010() {
    // Matches ngtsc behavior in:
    // packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L742-L754
    // where @HostListener rejects a second argument that is not a string array
    // with ErrorCode.VALUE_HAS_WRONG_TYPE (NG1010).
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["bad.directive.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/bad.directive.ts".to_string(),
        r#"
            import { Directive, HostListener } from '@angular/core';

            @Directive({
                selector: '[appBad]',
                standalone: true,
            })
            export class BadDirective {
                @HostListener('click', 'notAnArray' as any)
                onClick() {}
            }
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let meta = analyzer
        .get_metadata_for_file("/project/bad.directive.ts".to_string())
        .expect("bad.directive.ts metadata");
    assert_eq!(meta.diagnostics.len(), 1);
    assert_eq!(meta.diagnostics[0].code, 1010);
    assert_eq!(
        meta.diagnostics[0].message_text,
        "@HostListener's second argument must be a string array"
    );
}

#[test]
fn test_missing_template_diagnostic_ng2001() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.component.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';

            @Component({
                selector: 'app-root',
                standalone: true,
            })
            export class AppComponent {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let res = analyzer.get_metadata_for_file("/project/app.component.ts".to_string());
    let meta = res.expect("app.component.ts metadata");
    assert_eq!(meta.diagnostics.len(), 1);
    let diag = &meta.diagnostics[0];
    assert_eq!(diag.code, 2001);
    assert_eq!(diag.category, 1);
    assert_eq!(
        diag.message_text,
        "@Component is missing a template. Add either a `template` or `templateUrl`"
    );
}

#[test]
fn test_dynamic_template_diagnostic_ng1010() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.component.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';

            @Component({
                selector: 'app-root',
                template: '<div>' + Math.random() + '</div>',
                standalone: true,
            })
            export class AppComponent {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let res = analyzer.get_metadata_for_file("/project/app.component.ts".to_string());
    let meta = res.expect("app.component.ts metadata");
    assert_eq!(meta.diagnostics.len(), 1);
    let diag = &meta.diagnostics[0];
    assert_eq!(diag.code, 1010);
    assert_eq!(diag.category, 1);
    assert_eq!(diag.message_text, "template must be a string");
}

#[test]
fn test_dynamic_template_url_diagnostic_ng1010() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.component.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';

            @Component({
                selector: 'app-root',
                templateUrl: './app-' + Math.random() + '.html',
                standalone: true,
            })
            export class AppComponent {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let res = analyzer.get_metadata_for_file("/project/app.component.ts".to_string());
    let meta = res.expect("app.component.ts metadata");
    assert_eq!(meta.diagnostics.len(), 1);
    let diag = &meta.diagnostics[0];
    assert_eq!(diag.code, 1010);
    assert_eq!(diag.category, 1);
    assert_eq!(diag.message_text, "templateUrl must be a string");
}

#[test]
fn test_template_url_takes_precedence_over_dynamic_template() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.component.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';

            @Component({
                selector: 'app-root',
                templateUrl: './app.component.html',
                template: '<div>' + Math.random() + '</div>',
                standalone: true,
            })
            export class AppComponent {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/app.component.html".to_string(),
        "<span>ok</span>".to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let res = analyzer.get_metadata_for_file("/project/app.component.ts".to_string());
    let meta = res.expect("app.component.ts metadata");
    // ngtsc's parseTemplateDeclaration never inspects `template` when `templateUrl` is
    // present, so the dynamic inline template is not an error here.
    assert_eq!(meta.diagnostics.len(), 0);
}

#[test]
fn test_foreign_imports_shape_diagnostics_ng1010() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.component.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';

            declare const bad: unknown;
            declare function two(a: unknown, b: unknown): unknown;
            declare const obj: { member(c: unknown): unknown };
            declare function fn(x: unknown): unknown;
            declare function ok(x: unknown): unknown;
            declare const A: unknown, B: unknown, C: unknown;
            declare const x: { y: unknown };
            declare class Kept {}

            @Component({
                selector: 'app-root',
                template: '<div></div>',
                standalone: true,
                foreignImports: [bad, two(A, B), obj.member(C), fn(x.y), ok(Kept)],
            })
            export class AppComponent {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let res = analyzer.get_metadata_for_file("/project/app.component.ts".to_string());
    let meta = res.expect("app.component.ts metadata");

    let messages: Vec<_> = meta
        .diagnostics
        .iter()
        .map(|d| {
            assert_eq!(d.code, 1010);
            assert_eq!(d.category, 1);
            d.message_text.as_str()
        })
        .collect();
    assert_eq!(
        messages,
        vec![
            "Each foreign import must be a call expression, e.g. 'myImport(MyComponent)'.",
            "Foreign import calls must receive exactly one argument, e.g. 'myImport(MyComponent)'.",
            "The foreign import function must be a simple identifier, e.g. 'myImport(MyComponent)'.",
            "The component reference passed to the foreign import must be a simple identifier, e.g. 'myImport(MyComponent)'.",
        ]
    );

    // The well-formed trailing entry is still extracted.
    let component = meta.classes[0].component.as_ref().unwrap();
    let foreign = component.foreign_imports.as_ref().unwrap();
    assert_eq!(foreign.len(), 1);
    assert_eq!(foreign[0].name, "Kept");
}

#[test]
fn test_foreign_imports_non_array_diagnostic_ng1010() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.component.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';

            declare const SHARED_IMPORTS: unknown;

            @Component({
                selector: 'app-root',
                template: '<div></div>',
                standalone: true,
                foreignImports: SHARED_IMPORTS,
            })
            export class AppComponent {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let res = analyzer.get_metadata_for_file("/project/app.component.ts".to_string());
    let meta = res.expect("app.component.ts metadata");
    assert_eq!(meta.diagnostics.len(), 1);
    let diag = &meta.diagnostics[0];
    assert_eq!(diag.code, 1010);
    assert_eq!(diag.category, 1);
    assert_eq!(
        diag.message_text,
        "'foreignImports' must be an array of foreign imports, e.g. 'foreignImports: [myImport(MyComponent)]'."
    );
}

#[test]
fn test_imports_on_non_standalone_component_ng2010() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.component.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';

            @Component({
                selector: 'app-other',
                template: '<span></span>',
                standalone: true,
            })
            export class OtherComponent {}

            @Component({
                selector: 'app-root',
                template: '<div></div>',
                standalone: false,
                imports: [OtherComponent],
            })
            export class AppComponent {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let res = analyzer.get_metadata_for_file("/project/app.component.ts".to_string());
    let meta = res.expect("app.component.ts metadata");
    assert_eq!(meta.diagnostics.len(), 1);
    let diag = &meta.diagnostics[0];
    assert_eq!(diag.code, 2010);
    assert_eq!(diag.category, 1);
    assert_eq!(
        diag.message_text,
        "'imports' is only valid on a component that is standalone."
    );
}

#[test]
fn test_foreign_imports_on_non_standalone_component_ng2010() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.component.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/app.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';

            declare const bad: unknown;

            @Component({
                selector: 'app-root',
                template: '<div></div>',
                standalone: false,
                foreignImports: [bad],
            })
            export class AppComponent {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let res = analyzer.get_metadata_for_file("/project/app.component.ts".to_string());
    let meta = res.expect("app.component.ts metadata");
    // ngtsc reports only the standalone violation and poisons the component, so the
    // malformed-entry NG1010s do not fire alongside it.
    assert_eq!(meta.diagnostics.len(), 1);
    let diag = &meta.diagnostics[0];
    assert_eq!(diag.code, 2010);
    assert_eq!(diag.category, 1);
    assert_eq!(
        diag.message_text,
        "'foreignImports' is only valid on a component that is standalone."
    );
}

/// Two NgModules that both declare the same component, directive and pipe. ngc rejects this with
/// NG6007 on each declared class.
fn duplicate_declaration_project() -> HashMap<String, String> {
    let module = |name: &str| {
        format!(
            r#"import {{NgModule}} from '@angular/core';
import {{C}} from './c.component';
import {{D}} from './d.directive';
import {{P}} from './p.pipe';
@NgModule({{declarations: [C, D, P]}})
export class {name} {{}}
"#
        )
    };
    [
        (
            "/project/tsconfig.json",
            r#"{"files": ["m1.module.ts", "m2.module.ts", "c.component.ts", "d.directive.ts", "p.pipe.ts"]}"#
                .to_string(),
        ),
        ("/project/m1.module.ts", module("M1Module")),
        ("/project/m2.module.ts", module("M2Module")),
        (
            "/project/c.component.ts",
            "import {Component} from '@angular/core';\n\
             @Component({selector: 'c', template: '<div d></div>', standalone: false})\n\
             export class C {}\n"
                .to_string(),
        ),
        (
            "/project/d.directive.ts",
            "import {Directive} from '@angular/core';\n\
             @Directive({selector: '[d]', standalone: false})\n\
             export class D {}\n"
                .to_string(),
        ),
        (
            "/project/p.pipe.ts",
            "import {Pipe} from '@angular/core';\n\
             @Pipe({name: 'p', standalone: false})\n\
             export class P {}\n"
                .to_string(),
        ),
    ]
    .into_iter()
    .map(|(path, content)| (path.to_string(), content))
    .collect()
}

/// A class declared by two NgModules has no declaring module and no compilation scope, and is
/// reported as NG6007 on its name — ngtsc's `LocalModuleScopeRegistry` moves it from
/// `declarationToModule` to `duplicateDeclarations`, so `getScopeForComponent` returns null and
/// `getDirectiveDiagnostics` / the pipe handler's `resolve` report `makeDuplicateDeclarationError`.
/// The declaring modules themselves get no diagnostic.
#[test]
fn test_duplicate_ngmodule_declaration_ng6007() {
    let files = duplicate_declaration_project();
    let analyzer = Analyzer::new(AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(files.clone()),
        ..Default::default()
    })
    .unwrap();

    for (file, class_name, kind) in [
        ("/project/c.component.ts", "C", "Component"),
        ("/project/d.directive.ts", "D", "Directive"),
        ("/project/p.pipe.ts", "P", "Pipe"),
    ] {
        let meta = analyzer
            .get_metadata_for_file(file.to_string())
            .expect("declaration metadata");
        let class = meta
            .classes
            .iter()
            .find(|c| c.class_name.as_deref() == Some(class_name))
            .expect("declared class");
        let declaring_ng_module = class
            .component
            .as_ref()
            .and_then(|c| c.declaring_ng_module.as_ref())
            .or_else(|| {
                class
                    .directive
                    .as_ref()
                    .and_then(|d| d.declaring_ng_module.as_ref())
            })
            .or_else(|| {
                class
                    .pipe
                    .as_ref()
                    .and_then(|p| p.declaring_ng_module.as_ref())
            });
        assert!(
            declaring_ng_module.is_none(),
            "{class_name} is declared twice and must have no declaring NgModule, got {:?}",
            declaring_ng_module.map(|m| &m.file_path)
        );

        assert_eq!(meta.diagnostics.len(), 1, "{:?}", meta.diagnostics);
        let diag = &meta.diagnostics[0];
        assert_eq!(diag.code, 6007);
        assert_eq!(diag.category, 1);
        assert_eq!(
            diag.message_text,
            format!("The {kind} '{class_name}' is declared by more than one NgModule.")
        );
        let name_start = files[file]
            .find(&format!("class {class_name} "))
            .expect("class declaration")
            + "class ".len();
        let span = diag.span.as_ref().expect("diagnostic span");
        assert_eq!(
            (span.start as usize, span.end as usize),
            (name_start, name_start + class_name.len()),
            "NG6007 is reported on the class name"
        );
    }

    // No scope: the component compiles with no template dependencies, as with a null
    // `getScopeForComponent`.
    let c = analyzer
        .get_metadata_for_file("/project/c.component.ts".to_string())
        .unwrap();
    let component = c.classes[0].component.as_ref().unwrap();
    assert_eq!(
        component
            .resolved_declarations
            .as_ref()
            .map(|decls| decls.len()),
        Some(0),
        "a duplicate declaration has no compilation scope"
    );

    for module in ["/project/m1.module.ts", "/project/m2.module.ts"] {
        let meta = analyzer.get_metadata_for_file(module.to_string()).unwrap();
        assert!(
            meta.diagnostics.is_empty(),
            "{module}: {:?}",
            meta.diagnostics
        );
    }
}

/// Which module owned a duplicate declaration used to be whichever the component mapping visited
/// last, and that order came from a `HashSet` of tsconfig files: it changed between runs, and
/// with it the component's scope and the optimized chunk partition. Every run must now agree —
/// no owner, and each duplicate declaration streamed in its own chunk rather than grouped with
/// whichever module happened to complete first.
#[test]
fn test_duplicate_ngmodule_declaration_is_deterministic() {
    let run = || {
        let analyzer = Analyzer::new(AnalyzerOptions {
            tsconfig_path: "/project/tsconfig.json".to_string(),
            optimize: Some(true),
            virtual_files: Some(duplicate_declaration_project()),
            ..Default::default()
        })
        .unwrap();
        let iterator = analyzer.analyze_optimized().unwrap();
        let mut chunks: Vec<Vec<String>> = Vec::new();
        let mut owners: Vec<(String, Option<String>)> = Vec::new();
        while let Some(chunk) = futures::executor::block_on(iterator.next()).unwrap() {
            let mut paths: Vec<String> = chunk.files.iter().map(|f| f.file_path.clone()).collect();
            paths.sort();
            chunks.push(paths);
            for class in chunk.files.iter().flat_map(|f| f.classes.iter()) {
                let owner = class
                    .component
                    .as_ref()
                    .and_then(|c| c.declaring_ng_module.as_ref())
                    .or_else(|| {
                        class
                            .directive
                            .as_ref()
                            .and_then(|d| d.declaring_ng_module.as_ref())
                    })
                    .or_else(|| {
                        class
                            .pipe
                            .as_ref()
                            .and_then(|p| p.declaring_ng_module.as_ref())
                    })
                    .map(|m| m.file_path.clone());
                owners.push((class.class_name.clone().unwrap_or_default(), owner));
            }
        }
        chunks.sort();
        owners.sort();
        (chunks, owners)
    };

    let expected_chunks: Vec<Vec<String>> = [
        "/project/c.component.ts",
        "/project/d.directive.ts",
        "/project/m1.module.ts",
        "/project/m2.module.ts",
        "/project/p.pipe.ts",
    ]
    .iter()
    .map(|path| vec![path.to_string()])
    .collect();
    let expected_owners: Vec<(String, Option<String>)> = ["C", "D", "M1Module", "M2Module", "P"]
        .iter()
        .map(|name| (name.to_string(), None))
        .collect();

    for attempt in 0..8 {
        let (chunks, owners) = run();
        assert_eq!(
            owners, expected_owners,
            "run {attempt}: declaring NgModules"
        );
        assert_eq!(chunks, expected_chunks, "run {attempt}: chunk partition");
    }
}

#[test]
fn test_compilation_chunk_with_prefix_imports_and_cycles() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"compilerOptions": {"rootDirs": ["/project"], "paths": {"google3/*": ["*"]}}, "files": ["app.module.ts", "a.component.ts", "b.component.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/a.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';

            @Component({
                selector: 'comp-a',
                template: '<comp-b></comp-b>',
                standalone: false,
            })
            export class CompA {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/b.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';

            @Component({
                selector: 'comp-b',
                template: '<comp-a></comp-a>',
                standalone: false,
            })
            export class CompB {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/app.module.ts".to_string(),
        r#"
            import { NgModule } from '@angular/core';
            import { CompA } from 'google3/a.component';
            import { CompB } from 'google3/b.component';

            @NgModule({
                declarations: [CompA, CompB],
                exports: [CompA, CompB],
            })
            export class AppModule {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        workspace_name: Some("google3".to_string()),
        root_dirs: Some(vec!["/project".to_string()]),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze_optimized().unwrap();

    let mut chunks = Vec::new();
    while let Some(chunk) = futures::executor::block_on(iterator.next()).unwrap() {
        chunks.push(chunk);
    }

    assert_eq!(
        chunks.len(),
        1,
        "Expected all declared files to be in a single chunk"
    );
    assert_eq!(
        chunks[0].files.len(),
        3,
        "Chunk should contain AppModule, CompA, and CompB"
    );

    let file_paths: Vec<&str> = chunks[0]
        .files
        .iter()
        .map(|f| f.file_path.as_str())
        .collect();
    assert!(file_paths.contains(&"/project/app.module.ts"));
    assert!(file_paths.contains(&"/project/a.component.ts"));
    assert!(file_paths.contains(&"/project/b.component.ts"));
}

#[test]
fn test_compilation_chunk_with_tsconfig_paths() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{
            "compilerOptions": {
                "baseUrl": ".",
                "paths": {
                    "@components/*": ["components/*"]
                }
            },
            "files": ["app.module.ts", "components/a.component.ts", "components/b.component.ts"]
        }"#
        .to_string(),
    );
    virtual_files.insert(
        "/project/components/a.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';

            @Component({
                selector: 'comp-a',
                template: '<div>A</div>',
                standalone: false,
            })
            export class CompA {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/components/b.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';

            @Component({
                selector: 'comp-b',
                template: '<div>B</div>',
                standalone: false,
            })
            export class CompB {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/app.module.ts".to_string(),
        r#"
            import { NgModule } from '@angular/core';
            import { CompA } from '@components/a.component';
            import { CompB } from '@components/b.component';

            @NgModule({
                declarations: [CompA, CompB],
                exports: [CompA, CompB],
            })
            export class AppModule {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze_optimized().unwrap();

    let mut chunks = Vec::new();
    while let Some(chunk) = futures::executor::block_on(iterator.next()).unwrap() {
        chunks.push(chunk);
    }

    assert_eq!(
        chunks.len(),
        1,
        "Expected all declared files to be in a single chunk"
    );
    assert_eq!(
        chunks[0].files.len(),
        3,
        "Chunk should contain AppModule, CompA, and CompB"
    );

    let file_paths: Vec<&str> = chunks[0]
        .files
        .iter()
        .map(|f| f.file_path.as_str())
        .collect();
    assert!(file_paths.contains(&"/project/app.module.ts"));
    assert!(file_paths.contains(&"/project/components/a.component.ts"));
    assert!(file_paths.contains(&"/project/components/b.component.ts"));
}

#[test]
fn test_syntax_mode_emits_one_file_per_chunk() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.module.ts", "a.component.ts", "b.component.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/a.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';

            @Component({
                selector: 'comp-a',
                template: '<div>A</div>',
                standalone: false,
            })
            export class CompA {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/b.component.ts".to_string(),
        r#"
            import { Component } from '@angular/core';

            @Component({
                selector: 'comp-b',
                template: '<div>B</div>',
                standalone: false,
            })
            export class CompB {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/app.module.ts".to_string(),
        r#"
            import { NgModule } from '@angular/core';
            import { CompA } from './a.component';
            import { CompB } from './b.component';

            @NgModule({
                declarations: [CompA, CompB],
                exports: [CompA, CompB],
            })
            export class AppModule {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(false),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze().unwrap();

    let mut chunks = Vec::new();
    while let Some(chunk) = futures::executor::block_on(iterator.next()).unwrap() {
        chunks.push(chunk);
    }

    assert_eq!(
        chunks.len(),
        3,
        "In syntax mode, every file should be emitted in its own chunk (1 file per chunk)"
    );
    for chunk in &chunks {
        assert_eq!(
            chunk.files.len(),
            1,
            "Each chunk in syntax mode should contain exactly 1 file"
        );
        assert!(
            chunk.static_edges.is_none(),
            "Syntax mode should have no intra-chunk static edges"
        );
    }
}

/// Names of a resolved host directive list, in declaration order.
fn host_directive_names(hds: &[crate::ResolvedHostDirectiveMetadata]) -> Vec<&str> {
    hds.iter().map(|hd| hd.directive.name.as_str()).collect()
}

/// A host directive's exposed bindings, as `public:binding` pairs.
fn host_directive_bindings(bindings: &Option<Vec<crate::HostDirectiveBinding>>) -> Vec<String> {
    bindings
        .iter()
        .flatten()
        .map(|b| format!("{}:{}", b.public_name, b.binding_name))
        .collect()
}

#[test]
fn test_host_directives_resolved_declarations_cross_file_and_chained() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["components/app.ts", "directives/dir_a.ts", "directives/host_b.ts", "directives/nested/host_c.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/directives/nested/host_c.ts".to_string(),
        r#"
            import {Directive, Input} from '@angular/core';
            @Directive({
                standalone: true,
            })
            export class HostDirC {
                @Input() inputC: string = '';
            }
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/directives/host_b.ts".to_string(),
        r#"
            import {Directive, Input} from '@angular/core';
            import {HostDirC} from './nested/host_c';
            @Directive({
                standalone: true,
                hostDirectives: [{
                    directive: HostDirC,
                    inputs: ['inputC: aliasC'],
                }],
            })
            export class HostDirB {
                @Input() inputB: string = '';
            }
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/directives/dir_a.ts".to_string(),
        r#"
            import {Directive} from '@angular/core';
            import {HostDirB} from './host_b';
            @Directive({
                selector: '[dirA]',
                standalone: true,
                hostDirectives: [{
                    directive: HostDirB,
                    inputs: ['inputB', 'aliasC: finalAliasC'],
                }],
            })
            export class DirA {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/components/app.ts".to_string(),
        r#"
            import {Component} from '@angular/core';
            import {DirA} from '../directives/dir_a';
            @Component({
                selector: 'app-cmp',
                template: '<div dirA [inputB]="val" [finalAliasC]="val"></div>',
                standalone: true,
                imports: [DirA],
            })
            export class AppCmp {
                val = 'hello';
            }
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze_optimized().unwrap();

    let mut results = Vec::new();
    while let Ok(Some(chunk)) = futures::executor::block_on(iterator.next()) {
        for file in chunk.files {
            results.push(file);
        }
    }

    let app_meta = results
        .iter()
        .find(|res| res.file_path == "/project/components/app.ts")
        .expect("app.ts metadata");
    let app_class = app_meta
        .classes
        .iter()
        .find(|c| c.class_name.as_deref() == Some("AppCmp"))
        .unwrap();
    let component = app_class
        .component
        .as_ref()
        .expect("AppCmp component metadata");
    let decls = component
        .resolved_declarations
        .as_ref()
        .expect("resolved_declarations should exist");

    // Host directives are not part of the consumer's scope (ngtsc's `createMatcherFromScope`):
    // they hang off the directive that declares them, chain included.
    let decl_names: Vec<&str> = decls.iter().map(|d| d.name.as_str()).collect();
    assert_eq!(decl_names, vec!["DirA"]);

    let dir_a_hosts = decls[0]
        .resolved_host_directives
        .as_ref()
        .expect("DirA's host directives should be resolved");
    assert_eq!(host_directive_names(dir_a_hosts), vec!["HostDirB"]);
    assert_eq!(
        host_directive_bindings(&dir_a_hosts[0].inputs),
        vec!["inputB:inputB", "aliasC:finalAliasC"]
    );

    let host_b_hosts = dir_a_hosts[0]
        .directive
        .resolved_host_directives
        .as_ref()
        .expect("HostDirB's chained host directives should be resolved");
    assert_eq!(host_directive_names(host_b_hosts), vec!["HostDirC"]);
    assert_eq!(
        host_directive_bindings(&host_b_hosts[0].inputs),
        vec!["inputC:aliasC"]
    );
    assert!(host_b_hosts[0].directive.resolved_host_directives.is_none());
}

#[test]
fn test_host_directives_on_component_itself() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.ts", "host.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/host.ts".to_string(),
        r#"
            import {Directive, Input} from '@angular/core';
            @Directive({
                standalone: true,
            })
            export class HostDir {
                @Input() hostInp: string = '';
            }
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        r#"
            import {Component} from '@angular/core';
            import {HostDir} from './host';
            @Component({
                selector: 'app-cmp',
                template: '<div>Test</div>',
                standalone: true,
                hostDirectives: [{
                    directive: HostDir,
                    inputs: ['hostInp'],
                }],
            })
            export class AppCmp {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze_optimized().unwrap();

    let mut results = Vec::new();
    while let Ok(Some(chunk)) = futures::executor::block_on(iterator.next()) {
        for file in chunk.files {
            results.push(file);
        }
    }

    let app_meta = results
        .iter()
        .find(|res| res.file_path == "/project/app.ts")
        .expect("app.ts metadata");
    let app_class = app_meta
        .classes
        .iter()
        .find(|c| c.class_name.as_deref() == Some("AppCmp"))
        .unwrap();
    let component = app_class
        .component
        .as_ref()
        .expect("AppCmp component metadata");
    // The component's own host directive goes on its host element, not into its template scope.
    let own_hosts = component
        .resolved_host_directives
        .as_ref()
        .expect("the component's own host directives should be resolved");
    assert_eq!(host_directive_names(own_hosts), vec!["HostDir"]);
    assert_eq!(
        host_directive_bindings(&own_hosts[0].inputs),
        vec!["hostInp:hostInp"]
    );
    assert!(component
        .resolved_declarations
        .iter()
        .flatten()
        .all(|d| d.name != "HostDir"));
}

#[test]
fn test_host_directives_cycle_prevention() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.ts", "dir_a.ts", "dir_b.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/dir_a.ts".to_string(),
        r#"
            import {Directive} from '@angular/core';
            import {DirB} from './dir_b';
            @Directive({
                selector: '[dirA]',
                standalone: true,
                hostDirectives: [DirB],
            })
            export class DirA {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/dir_b.ts".to_string(),
        r#"
            import {Directive} from '@angular/core';
            import {DirA} from './dir_a';
            @Directive({
                selector: '[dirB]',
                standalone: true,
                hostDirectives: [DirA],
            })
            export class DirB {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        r#"
            import {Component} from '@angular/core';
            import {DirA} from './dir_a';
            @Component({
                selector: 'app-cmp',
                template: '<div dirA></div>',
                standalone: true,
                imports: [DirA],
            })
            export class AppCmp {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze_optimized().unwrap();

    let mut results = Vec::new();
    while let Ok(Some(chunk)) = futures::executor::block_on(iterator.next()) {
        for file in chunk.files {
            results.push(file);
        }
    }

    let app_meta = results
        .iter()
        .find(|res| res.file_path == "/project/app.ts")
        .expect("app.ts metadata");
    let app_class = app_meta
        .classes
        .iter()
        .find(|c| c.class_name.as_deref() == Some("AppCmp"))
        .unwrap();
    let component = app_class
        .component
        .as_ref()
        .expect("AppCmp component metadata");
    let decls = component
        .resolved_declarations
        .as_ref()
        .expect("resolved_declarations should exist");

    let decl_names: Vec<&str> = decls.iter().map(|d| d.name.as_str()).collect();
    assert_eq!(decl_names, vec!["DirA"]);

    // The walk stops where the chain would re-enter a directive already on it.
    let dir_a_hosts = decls[0]
        .resolved_host_directives
        .as_ref()
        .expect("DirA's host directives should be resolved");
    assert_eq!(host_directive_names(dir_a_hosts), vec!["DirB"]);
    let dir_b_hosts = dir_a_hosts[0]
        .directive
        .resolved_host_directives
        .as_ref()
        .expect("DirB declares host directives");
    assert!(host_directive_names(dir_b_hosts).is_empty());
}

#[test]
fn test_inherited_input_and_output_same_name() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["base.d.ts", "child.d.ts", "app.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/base.d.ts".to_string(),
        r#"
            import * as i0 from "@angular/core";
            export declare abstract class BaseSetting<T> {
                static ɵdir: i0.ɵɵDirectiveDeclaration<BaseSetting<any>, never, never, { "value": { "alias": "value"; "required": true; "isSignal": true; }; }, { "value": "valueChange"; }, never, never, true, never>;
            }
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/child.d.ts".to_string(),
        r#"
            import * as i0 from "@angular/core";
            import { BaseSetting } from "./base";
            export declare class ChildControl extends BaseSetting<string> {
                static ɵcmp: i0.ɵɵComponentDeclaration<ChildControl, "child-ctrl", never, {}, {}, never, never, true, never>;
            }
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        r#"
            import {Component} from '@angular/core';
            import {ChildControl} from './child';
            @Component({
                selector: 'app-cmp',
                template: '<child-ctrl></child-ctrl>',
                standalone: true,
                imports: [ChildControl],
            })
            export class AppCmp {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze_optimized().unwrap();

    let mut results = Vec::new();
    while let Ok(Some(chunk)) = futures::executor::block_on(iterator.next()) {
        for file in chunk.files {
            results.push(file);
        }
    }

    let app_meta = results
        .iter()
        .find(|res| res.file_path == "/project/app.ts")
        .expect("app.ts metadata");
    let app_class = app_meta
        .classes
        .iter()
        .find(|c| c.class_name.as_deref() == Some("AppCmp"))
        .unwrap();
    let component = app_class
        .component
        .as_ref()
        .expect("AppCmp component metadata");
    let decls = component
        .resolved_declarations
        .as_ref()
        .expect("resolved_declarations should exist");

    let child_decl = decls
        .iter()
        .find(|d| d.name == "ChildControl")
        .expect("ChildControl declaration");

    let flattened_fields = child_decl
        .flattened_fields
        .as_ref()
        .expect("flattened_fields should exist");

    let has_input_value = flattened_fields
        .iter()
        .any(|f| f.kind == "input" && f.input.as_ref().map(|i| i.name.as_str()) == Some("value"));
    let has_output_value = flattened_fields
        .iter()
        .any(|f| f.kind == "output" && f.output.as_ref().map(|o| o.name.as_str()) == Some("value"));

    assert!(
        has_input_value,
        "Expected flattened_fields to contain input 'value'"
    );
    assert!(
        has_output_value,
        "Expected flattened_fields to contain output 'value'"
    );
}

#[test]
fn test_inherited_model() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["base.ts", "child.ts", "app.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/base.ts".to_string(),
        r#"
            import {Directive, model} from '@angular/core';
            @Directive({selector: '[base]'})
            export class BaseDirective {
                val = model(0);
            }
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/child.ts".to_string(),
        r#"
            import {Component} from '@angular/core';
            import {BaseDirective} from './base';
            @Component({
                selector: 'child-cmp',
                template: '',
                standalone: true,
            })
            export class ChildComponent extends BaseDirective {}
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        r#"
            import {Component} from '@angular/core';
            import {ChildComponent} from './child';
            @Component({
                selector: 'app-cmp',
                template: '<child-cmp></child-cmp>',
                standalone: true,
                imports: [ChildComponent],
            })
            export class AppCmp {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };

    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze_optimized().unwrap();

    let mut results = Vec::new();
    while let Ok(Some(chunk)) = futures::executor::block_on(iterator.next()) {
        for file in chunk.files {
            results.push(file);
        }
    }

    let app_meta = results
        .iter()
        .find(|res| res.file_path == "/project/app.ts")
        .expect("app.ts metadata");
    let app_class = app_meta
        .classes
        .iter()
        .find(|c| c.class_name.as_deref() == Some("AppCmp"))
        .unwrap();
    let component = app_class
        .component
        .as_ref()
        .expect("AppCmp component metadata");
    let decls = component
        .resolved_declarations
        .as_ref()
        .expect("resolved_declarations should exist");

    let child_decl = decls
        .iter()
        .find(|d| d.name == "ChildComponent")
        .expect("ChildComponent declaration");

    let flattened_fields = child_decl
        .flattened_fields
        .as_ref()
        .expect("flattened_fields should exist");

    let has_input_val = flattened_fields
        .iter()
        .any(|f| f.kind == "input" && f.input.as_ref().map(|i| i.name.as_str()) == Some("val"));
    let has_output_val = flattened_fields.iter().any(|f| {
        f.kind == "output"
            && f.output.as_ref().map(|o| o.name.as_str()) == Some("val")
            && f.output.as_ref().and_then(|o| o.alias.as_deref()) == Some("valChange")
    });

    assert!(
        has_input_val,
        "Expected flattened_fields to contain input 'val'"
    );
    assert!(
        has_output_val,
        "Expected flattened_fields to contain output 'val' aliased to 'valChange'"
    );
}

#[test]
fn test_legacy_inputs_outputs_through_imported_constant() {
    let mut virtual_files = HashMap::new();
    virtual_files.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["app.ts", "common.ts"]}"#.to_string(),
    );
    virtual_files.insert(
        "/project/common.ts".to_string(),
        r#"
            export const POPOVER_EDIT_INPUTS = [
                {name: 'template', alias: 'matPopoverEdit'},
                {name: 'context', alias: 'matPopoverEditContext'},
            ];
            export const BASE_OUTPUTS = ['opened', 'closed: matClosed'];
        "#
        .to_string(),
    );
    virtual_files.insert(
        "/project/app.ts".to_string(),
        r#"
            import {Component, Directive} from '@angular/core';
            import {POPOVER_EDIT_INPUTS, BASE_OUTPUTS} from './common';

            const LOCAL_INPUTS = ['size: matSize'];

            @Directive({
                selector: '[matPopoverEdit]',
                inputs: [...POPOVER_EDIT_INPUTS, 'disabled'],
                outputs: BASE_OUTPUTS,
            })
            export class MatPopoverEdit {
                template: unknown;
            }

            @Component({selector: 'my-comp', template: '', inputs: LOCAL_INPUTS})
            export class MyComponent {}
        "#
        .to_string(),
    );

    let options = AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(virtual_files),
        ..Default::default()
    };
    let analyzer = Analyzer::new(options).unwrap();
    let iterator = analyzer.analyze_optimized().unwrap();
    let mut results = Vec::new();
    while let Some(chunk) = futures::executor::block_on(iterator.next()).unwrap() {
        results.extend(chunk.files);
    }

    let app = results
        .iter()
        .find(|res| res.file_path == "/project/app.ts")
        .expect("app.ts result");
    let class = |name: &str| {
        app.classes
            .iter()
            .find(|c| c.class_name.as_deref() == Some(name))
            .unwrap_or_else(|| panic!("{name} metadata"))
    };

    let directive = class("MatPopoverEdit");
    let inputs: Vec<(&str, Option<&str>, bool)> = directive
        .inputs
        .iter()
        .map(|i| {
            (
                i.name.as_str(),
                i.alias.as_deref(),
                i.property_span.is_some(),
            )
        })
        .collect();
    assert_eq!(
        inputs,
        vec![
            ("template", Some("matPopoverEdit"), true),
            ("context", Some("matPopoverEditContext"), false),
            ("disabled", None, false),
        ]
    );
    let outputs: Vec<(&str, Option<&str>)> = directive
        .outputs
        .iter()
        .map(|o| (o.name.as_str(), o.alias.as_deref()))
        .collect();
    assert_eq!(
        outputs,
        vec![("opened", None), ("closed", Some("matClosed"))]
    );

    let component = class("MyComponent");
    let inputs: Vec<(&str, Option<&str>)> = component
        .inputs
        .iter()
        .map(|i| (i.name.as_str(), i.alias.as_deref()))
        .collect();
    assert_eq!(inputs, vec![("size", Some("matSize"))]);
}

/// `app.ts` declares a standalone component that imports `LibDir` from `LIB_SPECIFIER`.
const LIB_CONSUMER_APP: &str = r#"
    import {Component} from '@angular/core';
    import {LibDir} from 'LIB_SPECIFIER';
    @Component({
        selector: 'app-cmp',
        template: '<div libOld libNew></div>',
        standalone: true,
        imports: [LibDir],
    })
    export class AppCmp {}
"#;

/// A `.d.ts` exposing `LibDir` the way a compiled Angular library does (via `ɵdir`).
fn lib_dts(selector: &str) -> String {
    format!(
        r#"
            import * as i0 from '@angular/core';
            export declare class LibDir {{
                static ɵdir: i0.ɵɵDirectiveDeclaration<LibDir, "{selector}", never, {{}}, {{}}, never, never, true, never>;
            }}
        "#
    )
}

/// A TS source (`.mts`, `.tsx`, ...) declaring `LibDir` with a decorator.
fn lib_source(selector: &str) -> String {
    format!(
        r#"
            import {{Directive}} from '@angular/core';
            @Directive({{selector: '{selector}', standalone: true}})
            export class LibDir {{}}
        "#
    )
}

fn consumer_analyzer(
    root: &str,
    lib_specifier: &str,
    mut virtual_files: HashMap<String, String>,
) -> Analyzer {
    virtual_files.insert(
        format!("{root}/app.ts"),
        LIB_CONSUMER_APP.replace("LIB_SPECIFIER", lib_specifier),
    );
    virtual_files.insert(
        format!("{root}/tsconfig.json"),
        r#"{"files": ["app.ts"]}"#.to_string(),
    );
    Analyzer::new(AnalyzerOptions {
        tsconfig_path: format!("{root}/tsconfig.json"),
        optimize: Some(false),
        virtual_files: Some(virtual_files),
        ..Default::default()
    })
    .unwrap()
}

/// The selector `AppCmp` sees for its imported `LibDir`, read through `get_metadata_for_file`.
fn imported_lib_dir_selector(analyzer: &Analyzer, app_path: &str) -> Option<String> {
    let app_meta = analyzer.get_metadata_for_file(app_path.to_string())?;
    let app_class = app_meta
        .classes
        .iter()
        .find(|c| c.class_name.as_deref() == Some("AppCmp"))?;
    let decls = app_class
        .component
        .as_ref()?
        .resolved_declarations
        .as_ref()?;
    decls
        .iter()
        .find(|d| d.name == "LibDir")
        .and_then(|d| d.selector.clone())
}

/// Editing a `.d.ts` must evict its cached parse and every query that depended on it, exactly as
/// editing a `.ts` source does: a library typings change (e.g. after `npm install`) is a
/// dependency change for every consumer.
#[test]
fn test_update_file_content_dts_invalidates_dependents() {
    let analyzer = consumer_analyzer(
        "/project",
        "./lib",
        HashMap::from([("/project/lib.d.ts".to_string(), lib_dts("[libOld]"))]),
    );
    assert_eq!(
        imported_lib_dir_selector(&analyzer, "/project/app.ts").as_deref(),
        Some("[libOld]")
    );

    let invalidated = analyzer
        .update_file_content(vec![FileUpdate {
            file_path: "/project/lib.d.ts".to_string(),
            content: lib_dts("[libNew]"),
        }])
        .unwrap();
    assert_eq!(invalidated, vec!["/project/lib.d.ts".to_string()]);

    assert_eq!(
        imported_lib_dir_selector(&analyzer, "/project/app.ts").as_deref(),
        Some("[libNew]"),
        "the consumer must see the edited .d.ts, not the cached parse"
    );
}

/// `.mts`/`.tsx` are TS sources the analyzer reads (`is_ts_file`), so editing one must evict it too.
#[test]
fn test_update_file_content_non_dot_ts_sources_invalidate_dependents() {
    for (lib_file, specifier) in [("lib.mts", "./lib.mjs"), ("lib.tsx", "./lib")] {
        let lib_path = format!("/project/{lib_file}");
        let analyzer = consumer_analyzer(
            "/project",
            specifier,
            HashMap::from([(lib_path.clone(), lib_source("[libOld]"))]),
        );
        assert_eq!(
            imported_lib_dir_selector(&analyzer, "/project/app.ts").as_deref(),
            Some("[libOld]"),
            "{lib_file}: initial selector"
        );

        analyzer
            .update_file_content(vec![FileUpdate {
                file_path: lib_path.clone(),
                content: lib_source("[libNew]"),
            }])
            .unwrap();

        assert_eq!(
            imported_lib_dir_selector(&analyzer, "/project/app.ts").as_deref(),
            Some("[libNew]"),
            "{lib_file}: the consumer must see the edited file, not the cached parse"
        );
    }
}

/// The language server routes on-disk `.d.ts` changes (watched files) to `invalidate_files`, which
/// must evict the file's cached queries so the new disk contents are re-read.
#[test]
fn test_invalidate_files_dts_invalidates_dependents() {
    let dir = tempfile::TempDir::new().unwrap();
    let root = dir.path().canonicalize().unwrap();
    let root_str = root.to_string_lossy().into_owned();
    let lib_path = root.join("lib.d.ts");
    std::fs::write(&lib_path, lib_dts("[libOld]")).unwrap();
    let lib_path_str = lib_path.to_string_lossy().into_owned();
    let app_path = format!("{root_str}/app.ts");

    let analyzer = consumer_analyzer(&root_str, "./lib", HashMap::new());
    assert_eq!(
        imported_lib_dir_selector(&analyzer, &app_path).as_deref(),
        Some("[libOld]")
    );

    std::fs::write(&lib_path, lib_dts("[libNew]")).unwrap();
    let invalidated = analyzer
        .invalidate_files(vec![FileInvalidation {
            file_path: lib_path_str.clone(),
            update_type: FileUpdateType::Changed,
        }])
        .unwrap();

    assert_eq!(
        imported_lib_dir_selector(&analyzer, &app_path).as_deref(),
        Some("[libNew]"),
        "the consumer must see the new on-disk .d.ts, not the cached parse"
    );
    // The host drops its per-file caches for every returned path.
    assert_eq!(invalidated, vec![lib_path_str]);
}

/// The Angular CLI's `tsconfig.app.json` lists only `main.ts`; the NgModule and everything it
/// declares join the program because `main.ts` imports them. `C1`'s template matches `D`, which
/// `MModule` declares next to it.
pub(super) fn cli_shaped_ngmodule_project() -> HashMap<String, String> {
    let files = [
        ("/project/tsconfig.json", r#"{"files": ["main.ts"]}"#),
        (
            "/project/main.ts",
            r#"
                import {MModule} from './m.module';
                export const root = MModule;
            "#,
        ),
        (
            "/project/m.module.ts",
            r#"
                import {NgModule} from '@angular/core';
                import {C1} from './c1.component';
                import {C2} from './c2.component';
                import {D} from './d.directive';
                @NgModule({declarations: [C1, C2, D]})
                export class MModule {}
            "#,
        ),
        (
            "/project/c1.component.ts",
            r#"
                import {Component} from '@angular/core';
                @Component({selector: 'c1', template: '<div d></div>', standalone: false})
                export class C1 {}
            "#,
        ),
        (
            "/project/c2.component.ts",
            r#"
                import {Component} from '@angular/core';
                @Component({selector: 'c2', template: '<span d></span>', standalone: false})
                export class C2 {}
            "#,
        ),
        (
            "/project/d.directive.ts",
            r#"
                import {Directive} from '@angular/core';
                @Directive({selector: '[d]', standalone: false})
                export class D {}
            "#,
        ),
    ];
    files
        .into_iter()
        .map(|(path, content)| (path.to_string(), content.to_string()))
        .collect()
}

/// An NgModule reached from the tsconfig root files only through imports still owns its
/// declarations. ngtsc analyzes every file of the program (the roots plus their import closure),
/// so `LocalModuleScopeRegistry` learns `C1`'s declaring module and `C1` compiles with
/// `dependencies: [D]`.
#[test]
fn test_ngmodule_reached_through_imports_owns_its_declarations() {
    let analyzer = Analyzer::new(AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(cli_shaped_ngmodule_project()),
        ..Default::default()
    })
    .unwrap();

    for (file, class_name) in [
        ("/project/c1.component.ts", "C1"),
        ("/project/c2.component.ts", "C2"),
    ] {
        let metadata = analyzer
            .get_metadata_for_file(file.to_string())
            .expect("component metadata");
        let component = metadata
            .classes
            .iter()
            .find(|c| c.class_name.as_deref() == Some(class_name))
            .and_then(|c| c.component.as_ref())
            .expect("component class");
        assert_eq!(
            component
                .declaring_ng_module
                .as_ref()
                .map(|m| m.file_path.as_str()),
            Some("/project/m.module.ts"),
            "{class_name} must be owned by MModule"
        );
        let declarations: Vec<&str> = component
            .resolved_declarations
            .as_ref()
            .expect("resolved_declarations")
            .iter()
            .map(|d| d.name.as_str())
            .collect();
        assert!(
            declarations.contains(&"D"),
            "{class_name}'s scope must include D, got {declarations:?}"
        );
    }

    let metadata = analyzer
        .get_metadata_for_file("/project/d.directive.ts".to_string())
        .expect("directive metadata");
    let directive = metadata
        .classes
        .iter()
        .find(|c| c.class_name.as_deref() == Some("D"))
        .and_then(|c| c.directive.as_ref())
        .expect("directive class");
    assert_eq!(
        directive
            .declaring_ng_module
            .as_ref()
            .map(|m| m.file_path.as_str()),
        Some("/project/m.module.ts"),
        "D must be owned by MModule"
    );
}

/// The component → NgModule mapping reads NgModules outside the root files, so it must record
/// them as dependencies: editing one re-derives the owner of an already-analyzed component,
/// exactly as a fresh analyzer over the edited files would.
#[test]
fn test_editing_ngmodule_reached_through_imports_refreshes_declaring_module() {
    let declaring_module_of_c1 = |analyzer: &Analyzer| {
        let metadata = analyzer
            .get_metadata_for_file("/project/c1.component.ts".to_string())
            .expect("c1 metadata");
        metadata
            .classes
            .iter()
            .find(|c| c.class_name.as_deref() == Some("C1"))
            .and_then(|c| c.component.as_ref())
            .expect("C1 component")
            .declaring_ng_module
            .as_ref()
            .map(|m| m.file_path.clone())
    };
    let analyzer_for = |files: HashMap<String, String>| {
        Analyzer::new(AnalyzerOptions {
            tsconfig_path: "/project/tsconfig.json".to_string(),
            optimize: Some(true),
            virtual_files: Some(files),
            ..Default::default()
        })
        .unwrap()
    };

    let module_without_c1 = r#"
        import {NgModule} from '@angular/core';
        import {C2} from './c2.component';
        import {D} from './d.directive';
        @NgModule({declarations: [C2, D]})
        export class MModule {}
    "#;
    let mut files = cli_shaped_ngmodule_project();
    let module_with_c1 = files["/project/m.module.ts"].clone();
    files.insert(
        "/project/m.module.ts".to_string(),
        module_without_c1.to_string(),
    );

    let analyzer = analyzer_for(files.clone());
    assert_eq!(declaring_module_of_c1(&analyzer), None);

    analyzer
        .update_file_content(vec![FileUpdate {
            file_path: "/project/m.module.ts".to_string(),
            content: module_with_c1.clone(),
        }])
        .unwrap();
    files.insert("/project/m.module.ts".to_string(), module_with_c1);
    let fresh = declaring_module_of_c1(&analyzer_for(files));
    assert_eq!(fresh.as_deref(), Some("/project/m.module.ts"));
    assert_eq!(declaring_module_of_c1(&analyzer), fresh);

    analyzer
        .update_file_content(vec![FileUpdate {
            file_path: "/project/m.module.ts".to_string(),
            content: module_without_c1.to_string(),
        }])
        .unwrap();
    assert_eq!(declaring_module_of_c1(&analyzer), None);
}

/// The Angular CLI's lazy feature-module pattern: `main.ts` statically imports the routes, and the
/// router reaches `lazy/lazy.module.ts` only through `loadChildren`'s dynamic import, written here
/// as `lazy_import`. `LazyCmp`'s template matches `LazyDir`, which `LazyModule` declares next to
/// it. `directive_prelude` is spliced into `lazy.directive.ts` above `LazyDir`.
fn lazy_ngmodule_project(lazy_import: &str, directive_prelude: &str) -> HashMap<String, String> {
    let routes = r#"
        export const routes = [
            {path: 'lazy', loadChildren: () => LAZY_IMPORT.then((m) => m.LazyModule)},
        ];
    "#
    .replace("LAZY_IMPORT", lazy_import);
    let directive = r#"
        import {Directive} from '@angular/core';
        DIRECTIVE_PRELUDE
        @Directive({selector: '[lazyDir]', standalone: false})
        export class LazyDir {}
    "#
    .replace("DIRECTIVE_PRELUDE", directive_prelude);
    let module = r#"
        import {NgModule} from '@angular/core';
        import {LazyCmp} from './lazy.component';
        import {LazyDir} from './lazy.directive';
        @NgModule({declarations: [LazyCmp, LazyDir]})
        export class LazyModule {}
    "#;
    let component = r#"
        import {Component} from '@angular/core';
        @Component({selector: 'lazy-cmp', template: '<div lazyDir></div>', standalone: false})
        export class LazyCmp {}
    "#;
    let main = r#"
        import {routes} from './app.routes';
        export const root = routes;
    "#;
    [
        (
            "/project/tsconfig.json",
            r#"{"files": ["main.ts"]}"#.to_string(),
        ),
        ("/project/main.ts", main.to_string()),
        ("/project/app.routes.ts", routes),
        ("/project/lazy/lazy.module.ts", module.to_string()),
        ("/project/lazy/lazy.component.ts", component.to_string()),
        ("/project/lazy/lazy.directive.ts", directive),
    ]
    .into_iter()
    .map(|(path, content)| (path.to_string(), content))
    .collect()
}

/// `LazyCmp`'s component metadata, fetched on demand as the language service and `processFile` do.
fn lazy_component_metadata(
    files: HashMap<String, String>,
) -> crate::types::metadata::ComponentMetadata {
    let analyzer = Analyzer::new(AnalyzerOptions {
        tsconfig_path: "/project/tsconfig.json".to_string(),
        optimize: Some(true),
        virtual_files: Some(files),
        ..Default::default()
    })
    .unwrap();
    analyzer
        .get_metadata_for_file("/project/lazy/lazy.component.ts".to_string())
        .expect("LazyCmp metadata")
        .classes
        .into_iter()
        .find(|c| c.class_name.as_deref() == Some("LazyCmp"))
        .and_then(|c| c.component)
        .expect("LazyCmp component")
}

/// A dynamic `import()` with a string-literal-like specifier puts its target into the TypeScript
/// program (`collectExternalModuleReferences`), so ngtsc analyzes a lazy-loaded NgModule like any
/// other: `ngc` compiles `LazyCmp` with `dependencies: [LazyDir]` for both spellings below.
#[test]
fn test_ngmodule_reached_through_dynamic_import_owns_its_declarations() {
    for lazy_import in [
        "import('./lazy/lazy.module')",
        "import(`./lazy/lazy.module`)",
    ] {
        let component = lazy_component_metadata(lazy_ngmodule_project(lazy_import, ""));
        assert_eq!(
            component
                .declaring_ng_module
                .as_ref()
                .map(|m| m.file_path.as_str()),
            Some("/project/lazy/lazy.module.ts"),
            "{lazy_import}: LazyCmp must be owned by LazyModule"
        );
        let declarations: Vec<&str> = component
            .resolved_declarations
            .as_ref()
            .expect("resolved_declarations")
            .iter()
            .map(|d| d.name.as_str())
            .collect();
        assert!(
            declarations.contains(&"LazyDir"),
            "{lazy_import}: LazyCmp's scope must include LazyDir, got {declarations:?}"
        );
    }
}

/// A literal import type brings its target into the program too (`isLiteralImportTypeNode`):
/// with `app.routes.ts` naming `lazy.module.ts` only in a type, `ngc` still compiles all five files
/// and `LazyCmp` with `dependencies: [LazyDir]`, for both spellings below.
#[test]
fn test_ngmodule_reached_through_import_type_owns_its_declarations() {
    for type_reference in [
        "export type Lazy = import('./lazy/lazy.module').LazyModule;",
        "export type LazyExports = typeof import('./lazy/lazy.module');",
    ] {
        let mut files = lazy_ngmodule_project("import('./lazy/lazy.module')", "");
        files.insert(
            "/project/app.routes.ts".to_string(),
            format!("{type_reference}\nexport const routes: unknown[] = [];\n"),
        );
        let component = lazy_component_metadata(files);
        assert_eq!(
            component
                .declaring_ng_module
                .as_ref()
                .map(|m| m.file_path.as_str()),
            Some("/project/lazy/lazy.module.ts"),
            "{type_reference}: LazyCmp must be owned by LazyModule"
        );
    }
}

/// Cycle detection must see the static imports *inside* a lazy-loaded subtree, and must not count
/// the dynamic `import()` that reaches it. With `lazy.directive.ts` statically importing
/// `lazy.component.ts`, `ngc` falls back to remote scoping
/// (`ɵɵsetComponentScope(LazyCmp, [LazyDir], [])`); with a dynamic `import()` back-edge instead,
/// it emits `dependencies: [LazyDir]` directly — ngtsc's `ImportGraph` scans static imports only.
#[test]
fn test_import_cycle_inside_lazy_loaded_ngmodule() {
    for (directive_prelude, cycle_prone) in [
        (
            "import {LazyCmp} from './lazy.component';\nexport const host = LazyCmp;",
            Some(true),
        ),
        (
            "export const loadHost = () => import('./lazy.component');",
            None,
        ),
    ] {
        let component = lazy_component_metadata(lazy_ngmodule_project(
            "import('./lazy/lazy.module')",
            directive_prelude,
        ));
        let lazy_dir = component
            .resolved_declarations
            .as_ref()
            .expect("resolved_declarations")
            .iter()
            .find(|d| d.name == "LazyDir")
            .unwrap_or_else(|| panic!("{directive_prelude}: LazyCmp's scope must include LazyDir"));
        assert_eq!(lazy_dir.cycle_prone, cycle_prone, "{directive_prelude}");
    }
}

/// The streaming coordinator emits every file of the program, lazy-loaded ones included, as `ngc`
/// does — otherwise `ngp --out` drops the lazy chunk's sources from the output. Covers local mode
/// grouping chunks by NgModule (`generateExtraImportsInLocalMode`) too: there `LazyModule` lies
/// outside the tsconfig roots, so its declarations are streamed as ownerless and the module's
/// chunk must still be flushed.
#[test]
fn test_streaming_includes_files_reached_through_dynamic_import() {
    let files = lazy_ngmodule_project("import('./lazy/lazy.module')", "");
    let mut chunked_local = files.clone();
    chunked_local.insert(
        "/project/tsconfig.json".to_string(),
        r#"{"files": ["main.ts"], "angularCompilerOptions": {"generateExtraImportsInLocalMode": true}}"#
            .to_string(),
    );
    for (mode, files, optimize) in [
        ("local", &files, false),
        ("local, chunked by NgModule", &chunked_local, false),
        ("optimized", &files, true),
    ] {
        let entries: Vec<(&str, &str)> = files
            .iter()
            .map(|(path, content)| (path.as_str(), content.as_str()))
            .collect();
        let results = crate::test_utils::run_analyzer(
            crate::test_utils::create_test_fs(&entries),
            "/project/tsconfig.json",
            optimize,
        );
        let mut streamed: Vec<&str> = results.iter().map(|r| r.file_path.as_str()).collect();
        streamed.sort_unstable();
        assert_eq!(
            streamed,
            [
                "/project/app.routes.ts",
                "/project/lazy/lazy.component.ts",
                "/project/lazy/lazy.directive.ts",
                "/project/lazy/lazy.module.ts",
                "/project/main.ts",
            ],
            "{mode}"
        );
    }
}
