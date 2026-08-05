/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Creates an ESBuild plugin that configures various Angular optimization.
 * The optimization plugins usually run in the Angular CLI compilation pipeline.
 *
 * @param {import('./esbuild-plugin').OptimizationOptions} opts Options
 */
export function createEsbuildAngularOptimizePlugin(opts) {
  return {
    name: 'ng-optimize-esbuild',
    setup: async (build) => {
      const {JavaScriptTransformer} = (await import('@angular/build/private')).default;
      const javascriptTransformer = new JavaScriptTransformer(
        {
          jit: false,
          advancedOptimizations: !!opts.optimize,
          sourcemap: !!build.initialOptions.sourcemap,
        },
        /** maxWorkers */ 2,
      );

      build.onLoad({filter: /\.[cm]?js$/}, async (args) => {
        const sideEffects = opts.optimize?.isSideEffectFree
          ? !opts.optimize.isSideEffectFree(args.path)
          : true;

        const contents = await javascriptTransformer.transformFile(
          args.path,
          /** skipLinker */ !opts.enableLinker,
          sideEffects,
        );

        return {contents};
      });

      build.onDispose(() => {
        void javascriptTransformer.close();
      });
    },
  };
}
