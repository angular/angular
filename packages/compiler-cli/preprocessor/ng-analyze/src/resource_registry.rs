use crate::fs::{normalize_path, normalize_path_structural};
use oxc_semantic::SymbolId;
use std::collections::{HashMap, HashSet};
use std::path::PathBuf;
use std::sync::RwLock;

#[derive(Default)]
pub struct ResourceRegistry {
    /// Map from template path to list of components (.ts files) that use it.
    /// NOTE: Keys are case-folded (lowercased on Windows/macOS) to support case-insensitive
    /// lookups, while values retain their original case to avoid leaking lowercased paths
    /// back to TypeScript/Go which expect exact case matches.
    pub template_to_components: RwLock<HashMap<PathBuf, Vec<(PathBuf, SymbolId)>>>,
    /// Map from file (.ts file) path to list of templates it uses.
    pub file_to_templates: RwLock<HashMap<PathBuf, HashSet<PathBuf>>>,
}

// https://github.com/angular/angular/blob/c64ee96e0cfa6311af6b8fc1786a79e226c0260f/packages/compiler-cli/src/ngtsc/metadata/src/resource_registry.ts
impl ResourceRegistry {
    pub fn register_template(
        &self,
        template_path: PathBuf,
        component_path: PathBuf,
        symbol_id: SymbolId,
    ) {
        let case_fold_template = normalize_path(&template_path).into_owned();
        let case_fold_component = normalize_path(&component_path).into_owned();
        let norm_comp = normalize_path_structural(&component_path);

        // Update template -> components map (use folded key, but store original normalized path)
        {
            let mut write_tpl = self.template_to_components.write().unwrap();
            let vec = write_tpl.entry(case_fold_template.clone()).or_default();
            vec.push((norm_comp.into_owned(), symbol_id));
        }

        // Update file -> templates map (use folded key, but store original normalized path)
        {
            let mut write_file = self.file_to_templates.write().unwrap();
            let templates = write_file.entry(case_fold_component).or_default();
            templates.insert(case_fold_template);
        }
    }

    pub fn get_components_for_template(
        &self,
        template_path: &std::path::Path,
    ) -> Option<Vec<(PathBuf, SymbolId)>> {
        let map_key = crate::fs::normalize_path(template_path);
        let read = self.template_to_components.read().unwrap();
        read.get(&*map_key).cloned()
    }

    pub fn unregister_ts_file(&self, ts_path: &std::path::Path) {
        let map_key = normalize_path(ts_path).into_owned();

        let templates = {
            let mut write_file = self.file_to_templates.write().unwrap();
            write_file.remove(&map_key)
        };

        let Some(templates) = templates else {
            return;
        };

        let mut write_tpl = self.template_to_components.write().unwrap();
        for template in templates {
            use std::collections::hash_map::Entry;
            let Entry::Occupied(mut e) = write_tpl.entry(template) else {
                continue;
            };

            e.get_mut()
                .retain(|(path, _)| normalize_path(path) != map_key);
            if e.get().is_empty() {
                e.remove();
            }
        }
    }

    pub fn register_resources<'a>(
        &self,
        file_path: &std::path::Path,
        classes: impl IntoIterator<Item = &'a crate::analyzer::ClassData>,
    ) {
        self.unregister_ts_file(file_path);
        for cls in classes {
            let Some(component) = cls.as_component() else {
                continue;
            };
            if let Some(ref template_url) = component.template_url {
                self.register_template(
                    std::path::PathBuf::from(&template_url.resolved_path),
                    file_path.to_path_buf(),
                    cls.reference_id.symbol,
                );
            }
            if let Some(ref style_urls) = component.style_urls {
                for style_url in style_urls {
                    self.register_template(
                        std::path::PathBuf::from(&style_url.resolved_path),
                        file_path.to_path_buf(),
                        cls.reference_id.symbol,
                    );
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::{Analyzer, AnalyzerOptions, FileInvalidation, FileUpdate, FileUpdateType};
    use oxc_semantic::SymbolId;
    use std::path::{Path, PathBuf};

    #[test]
    fn test_resource_registry_normalization() {
        let registry = super::ResourceRegistry::default();

        // Test case-insensitivity on Win/Mac and case-sensitivity on Linux
        registry.register_template(
            PathBuf::from("/Project/App.component.html"),
            PathBuf::from("/Project/App.ts"),
            SymbolId::from(123),
        );

        #[cfg(any(target_os = "windows", target_os = "macos"))]
        {
            // Forward lookup should be case insensitive - maybe templateUrl was written with
            // mismatching case.
            let components =
                registry.get_components_for_template(Path::new("/project/app.component.html"));
            assert!(components.is_some());
            let comps = components.unwrap();
            assert_eq!(comps.len(), 1);
            // Values should retain original case!
            assert_eq!(comps[0].0, PathBuf::from("/Project/App.ts"));
        }

        #[cfg(not(any(target_os = "windows", target_os = "macos")))]
        {
            let components =
                registry.get_components_for_template(Path::new("/project/app.component.html"));
            assert!(components.is_none());
        }

        // Test structural normalization (removing ./)
        registry.register_template(
            PathBuf::from("/Project/./app.html"),
            PathBuf::from("/Project/./app.ts"),
            SymbolId::from(123),
        );

        let components = registry.get_components_for_template(Path::new("/Project/app.html"));
        assert!(components.is_some());
        let comps = components.unwrap();
        assert_eq!(comps.len(), 1);
        // Values should be normalized (no ./)
        assert_eq!(comps[0].0, PathBuf::from("/Project/app.ts"));
    }

    #[test]
    fn test_resource_registry_unregistration() {
        let registry = super::ResourceRegistry::default();

        // Register with mixed case
        registry.register_template(
            PathBuf::from("/Project/App.component.html"),
            PathBuf::from("/Project/App.ts"),
            SymbolId::from(123),
        );

        // Verify it is registered
        let components =
            registry.get_components_for_template(Path::new("/Project/App.component.html"));
        assert!(components.is_some());

        // Unregister with different case on Windows/Mac
        #[cfg(any(target_os = "windows", target_os = "macos"))]
        {
            registry.unregister_ts_file(Path::new("/project/app.ts")); // lowercase!

            // Should be removed!
            let components_after =
                registry.get_components_for_template(Path::new("/Project/App.component.html"));
            assert!(components_after.is_none());
        }

        // Unregister with exact case on Linux
        #[cfg(not(any(target_os = "windows", target_os = "macos")))]
        {
            // Try to unregister with different case (should NOT remove on Linux!)
            registry.unregister_ts_file(Path::new("/project/app.ts"));

            // Should STILL BE REGISTERED!
            let components_after =
                registry.get_components_for_template(Path::new("/Project/App.component.html"));
            assert!(components_after.is_some());

            // Now unregister with exact case
            registry.unregister_ts_file(Path::new("/Project/App.ts"));

            // Should be removed!
            let components_after_exact =
                registry.get_components_for_template(Path::new("/Project/App.component.html"));
            assert!(components_after_exact.is_none());
        }
    }

    #[test]
    fn test_resource_registry_population() {
        let mut virtual_files = std::collections::HashMap::new();
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

        // Consume the result from the background thread
        let result = futures::executor::block_on(iterator.next()).unwrap();
        assert!(result.is_some());
        assert_eq!(result.unwrap().files[0].file_path, "/project/app.ts");

        let components =
            analyzer.get_ts_file_for_template("/project/app.component.html".to_string());
        assert!(components.is_some());
        let comps = components.unwrap();
        assert_eq!(comps.len(), 1);
        assert_eq!(comps[0].ts_file_path, "/project/app.ts");
    }

    #[test]
    fn test_resource_registry_invalidation() {
        let mut virtual_files = std::collections::HashMap::new();
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

        let components =
            analyzer.get_ts_file_for_template("/project/app.component.html".to_string());
        assert!(components.is_some());

        // invalidating a virtual file causes it to be entirely removed. We will no longer
        // have an associaton to the template
        analyzer
            .invalidate_files(vec![FileInvalidation {
                file_path: "/project/app.ts".to_string(),
                update_type: FileUpdateType::Deleted,
            }])
            .unwrap();

        let components_after =
            analyzer.get_ts_file_for_template("/project/app.component.html".to_string());
        assert!(components_after.is_none());
    }

    #[test]
    fn test_resource_registry_update() {
        let mut virtual_files = std::collections::HashMap::new();
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

        let components =
            analyzer.get_ts_file_for_template("/project/app.component.html".to_string());
        assert!(components.is_some());
        let comps = components.unwrap();
        assert_eq!(comps.len(), 1);
        assert_eq!(comps[0].ts_file_path, "/project/app.ts");

        // Now update the file to use a different template
        let update = FileUpdate {
            file_path: "/project/app.ts".to_string(),
            content: r#"
                import {Component} from '@angular/core';
                @Component({
                    templateUrl: './new.component.html'
                })
                export class AppComponent {}
            "#
            .to_string(),
        };

        analyzer.update_file_content(vec![update]).unwrap();
        let mut rx = analyzer
            .analyze_delta_core(crate::compiler::analyzer::get_global_pool().clone())
            .unwrap();
        use futures::StreamExt;
        futures::executor::block_on(async { while rx.next().await.is_some() {} });

        // The old template should be unregistered
        let old_components =
            analyzer.get_ts_file_for_template("/project/app.component.html".to_string());
        assert!(old_components.is_none());

        // The new template should be registered
        let new_components =
            analyzer.get_ts_file_for_template("/project/new.component.html".to_string());
        assert!(new_components.is_some());
        let new_comps = new_components.unwrap();
        assert_eq!(new_comps.len(), 1);
        assert_eq!(new_comps[0].ts_file_path, "/project/app.ts");
    }
}
