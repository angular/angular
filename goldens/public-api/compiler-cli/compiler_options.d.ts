export interface BazelAndG3Options {
    annotateForClosureCompiler?: boolean;
    generateDeepReexports?: boolean;
}

export interface I18nOptions {
    enableI18nLegacyMessageIdFormat?: boolean;
    i18nInLocale?: string;
    i18nNormalizeLineEndingsInICUs?: boolean;
    i18nUseExternalIds?: boolean;
}

export interface LegacyNgcOptions {
    allowEmptyCodegenFiles?: boolean;
    flatModuleId?: string;
    flatModuleOutFile?: string;
    fullTemplateTypeCheck?: boolean;
    preserveWhitespaces?: boolean;
    strictInjectionParameters?: boolean;
}

export interface MiscOptions {
    compileNonExportedClasses?: boolean;
    disableTypeScriptVersionCheck?: boolean;
}

export interface NgcCompatibilityOptions {
    enableIvy?: boolean | 'ngtsc';
    generateNgFactoryShims?: boolean;
    generateNgSummaryShims?: boolean;
}

export interface StrictTemplateOptions {
    strictAttributeTypes?: boolean;
    strictContextGenerics?: boolean;
    strictDomEventTypes?: boolean;
    strictDomLocalRefTypes?: boolean;
    strictInputAccessModifiers?: boolean;
    strictInputTypes?: boolean;
    strictLiteralTypes?: boolean;
    strictNullInputTypes?: boolean;
    strictOutputEventTypes?: boolean;
    strictSafeNavigationTypes?: boolean;
    strictTemplates?: boolean;
}
