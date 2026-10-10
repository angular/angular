import * as fs from 'node:fs/promises';
import {readConfiguration} from '@angular/compiler-cli';
import {API, Snapshot} from '@typescript/native-preview/unstable/async';
import {HybridCompiler} from '../../../packages/compiler-cli/preprocessor/src/hybrid_compiler.js';
import {NapiAnalyzer} from '../../../packages/compiler-cli/preprocessor/src/analyzer_napi.js';
import {buildTypeCheckingConfig} from '../../../packages/compiler-cli/preprocessor/src/tcb';
import {LanguageService} from '../../../packages/compiler-cli/preprocessor/language-service/src/language_service';
import {TsGoFacade} from '../../../packages/compiler-cli/preprocessor/language-service/src/facade';
import {
  FileInvalidation,
  FileUpdateType,
} from '../../../packages/compiler-cli/preprocessor/src/types.js';
import {canonicalizePath as normalizePath} from '../../../packages/compiler-cli/preprocessor/language-service/src/utils.js';

export interface ProjectInstance {
  tsconfigPath: string;
  hybridCompiler: HybridCompiler;
  languageService: LanguageService;
  rootNames: Set<string>;
}

export interface ProjectManagerOptions {
  facade: TsGoFacade;
  api?: API;
  nodeModulesPathOverride?: string;
  onLog?: (msg: string) => void;
  onError?: (msg: string) => void;
}

export class ProjectManager {
  private projects = new Map<string, ProjectInstance>();
  private pendingProjects = new Map<string, Promise<ProjectInstance | null>>();
  private facade: TsGoFacade;
  private api?: API;
  private currentSnapshot?: Snapshot;
  private nodeModulesPathOverride?: string;
  /**
   * Document/file mutations that have been received but not yet applied. They are
   * driven by LSP notifications, which nothing awaits, so a request that arrives in
   * the meantime must not be served against stale state.
   */
  private pendingMutations = new Set<Promise<void>>();
  private log: (msg: string) => void;
  private err: (msg: string) => void;

  constructor(options: ProjectManagerOptions) {
    this.facade = options.facade;
    this.api = options.api;
    this.nodeModulesPathOverride = options.nodeModulesPathOverride;
    this.log = options.onLog ?? (() => {});
    this.err = options.onError ?? (() => {});
  }

  setApi(api: API): void {
    this.api = api;
    this.currentSnapshot = undefined;
  }

  getApi(): API | undefined {
    return this.api;
  }

  getLoadedProjects(): readonly ProjectInstance[] {
    return Array.from(this.projects.values());
  }

  async getLoadedProject(tsconfigPath: string): Promise<ProjectInstance | undefined> {
    return this.projects.get(await normalizePath(tsconfigPath));
  }

  /** Resolves the project owning `filePath`, after any in-flight mutations have settled. */
  async getProjectForFile(filePath: string): Promise<ProjectInstance | null> {
    await Promise.allSettled(this.pendingMutations);
    return this.lookupProjectForFile(filePath);
  }

  /** Runs `mutation`, tracking it so that requests issued meanwhile wait for it. */
  private async trackMutation(mutation: () => Promise<void>): Promise<void> {
    const pending = mutation();
    this.pendingMutations.add(pending);
    try {
      await pending;
    } finally {
      this.pendingMutations.delete(pending);
    }
  }

  private async lookupProjectForFile(filePath: string): Promise<ProjectInstance | null> {
    const normFilePath = await normalizePath(filePath);

    if (normFilePath.endsWith('.json')) {
      return this.getOrCreateProject(normFilePath);
    }

    // 1. Check if any already-loaded project owns this file (HTML template or TS source)
    const loadedProjects = Array.from(this.projects.values());
    if (!normFilePath.endsWith('.html')) {
      for (const project of loadedProjects) {
        if (project.rootNames.has(normFilePath)) {
          return project;
        }
      }
    } else {
      for (const project of loadedProjects) {
        if (project.hybridCompiler.getTsFileForTemplate(normFilePath)) {
          return project;
        }
      }
      await Promise.all(loadedProjects.map((p) => p.hybridCompiler.ensureReady()));
      for (const project of loadedProjects) {
        if (project.hybridCompiler.getTsFileForTemplate(normFilePath)) {
          return project;
        }
      }
    }

    // 2. Resolve owning tsconfig (TS-Go automatically resolves solution configs to leaf projects)
    const tsconfigPath = await this.resolveTsconfigPath(normFilePath);
    if (!tsconfigPath) {
      return null;
    }

    const project = await this.getOrCreateProject(tsconfigPath);
    if (!project) {
      return null;
    }

    // 3. Verify template ownership for HTML files
    if (
      normFilePath.endsWith('.html') &&
      !project.hybridCompiler.getTsFileForTemplate(normFilePath)
    ) {
      return null;
    }

    if (!normFilePath.endsWith('.html')) {
      project.rootNames.add(normFilePath);
    }

    return project;
  }

  private async getOrCreateProject(tsconfigPath: string): Promise<ProjectInstance | null> {
    const normPath = await normalizePath(tsconfigPath);
    const existing = this.projects.get(normPath);
    if (existing) {
      return existing;
    }
    if (this.pendingProjects.has(normPath)) {
      return this.pendingProjects.get(normPath)!;
    }
    const creationPromise = this.createProject(normPath);
    this.pendingProjects.set(normPath, creationPromise);
    try {
      return await creationPromise;
    } finally {
      this.pendingProjects.delete(normPath);
    }
  }

  private async createProject(rawTsconfigPath: string): Promise<ProjectInstance | null> {
    const tsconfigPath = await normalizePath(rawTsconfigPath);
    if (!(await pathExists(tsconfigPath))) {
      this.log(`tsconfig does not exist: ${tsconfigPath}`);
      return null;
    }

    this.log(`Initializing HybridCompiler for ${tsconfigPath}...`);
    try {
      const config = readConfiguration(tsconfigPath);
      const tcbConfig = buildTypeCheckingConfig(config.options, true);

      const analyzer = await NapiAnalyzer.create(tsconfigPath, {
        nodeModulesPathOverride: this.nodeModulesPathOverride,
      });

      const hybridCompiler = new HybridCompiler(analyzer, {
        tcbConfig,
        templateParseOptions: {
          preserveWhitespaces: true,
          preserveLineEndings: true,
          preserveSignificantWhitespace: true,
          leadingTriviaChars: [],
        },
        legacyOptionalChaining: config.options?.legacyOptionalChaining,
      });

      await hybridCompiler.init();

      const languageService = new LanguageService(hybridCompiler, this.facade);
      const rootNames = new Set(await Promise.all(config.rootNames.map((f) => normalizePath(f))));
      const project: ProjectInstance = {
        tsconfigPath,
        hybridCompiler,
        languageService,
        rootNames,
      };

      this.projects.set(tsconfigPath, project);
      this.log(`Project initialized for ${tsconfigPath} (${rootNames.size} files)`);

      return project;
    } catch (e) {
      this.err(`Failed to initialize HybridCompiler for ${tsconfigPath}: ${e}`);
      return null;
    }
  }

  private async resolveTsconfigPath(filePath: string): Promise<string | null> {
    const normFilePath = await normalizePath(filePath);
    if (!this.api) {
      return null;
    }

    try {
      let targetPath = normFilePath;
      if (normFilePath.endsWith('.html')) {
        targetPath = normFilePath.replace(/\.html$/, '.ts');
        if (!(await this.facade.isDocumentOpen(targetPath))) {
          const content = await fs.readFile(targetPath, 'utf8').catch(() => null);
          if (content !== null) {
            await this.facade.ensureDocument(targetPath, content);
          }
        }
      }

      this.currentSnapshot = await this.api.updateSnapshot();
      const defaultProject = await this.currentSnapshot.getDefaultProjectForFile(targetPath);
      if (defaultProject?.configFileName && (await pathExists(defaultProject.configFileName))) {
        return await normalizePath(defaultProject.configFileName);
      }
    } catch {}

    return null;
  }

  updateFileContent(updates: {filePath: string; content: string}[]): Promise<void> {
    return this.trackMutation(async () => {
      const updatesPerCompiler = new Map<HybridCompiler, {filePath: string; content: string}[]>();

      for (const update of updates) {
        if (update.filePath.endsWith('.ngtypecheck.ts')) {
          continue;
        }

        const project = await this.lookupProjectForFile(update.filePath);
        const compilers = project
          ? [project.hybridCompiler]
          : Array.from(this.projects.values()).map((p) => p.hybridCompiler);

        for (const compiler of compilers) {
          const list = updatesPerCompiler.get(compiler) ?? [];
          list.push(update);
          updatesPerCompiler.set(compiler, list);
        }
      }

      await Promise.all(
        Array.from(updatesPerCompiler.entries()).map(([compiler, compilerUpdates]) =>
          compiler.updateFileContent(compilerUpdates),
        ),
      );
    });
  }

  invalidateFiles(invalidations: FileInvalidation[]): Promise<void> {
    return this.trackMutation(async () => {
      for (const inv of invalidations) {
        const normInvPath = await normalizePath(inv.filePath);
        if (normInvPath.endsWith('.json') && inv.updateType === FileUpdateType.Deleted) {
          if (this.projects.has(normInvPath)) {
            this.log(`Disposing project for deleted config: ${normInvPath}`);
            this.projects.delete(normInvPath);
          }
        }
        if (inv.updateType === FileUpdateType.Deleted) {
          for (const project of this.projects.values()) {
            project.rootNames.delete(normInvPath);
          }
        }
      }

      await Promise.all(
        Array.from(this.projects.values()).map((project) =>
          project.hybridCompiler.invalidateFiles(invalidations),
        ),
      );
    });
  }

  onDidClose(filePath: string): Promise<void> {
    return this.trackMutation(async () => {
      const project = await this.lookupProjectForFile(filePath);
      const compilers = project
        ? [project.hybridCompiler]
        : Array.from(this.projects.values()).map((p) => p.hybridCompiler);
      await Promise.all(
        compilers.map((p) => p.invalidateFiles([{filePath, updateType: FileUpdateType.Changed}])),
      );
    });
  }
}

function pathExists(p: string) {
  return fs.access(p).then(
    () => true,
    () => false,
  );
}
