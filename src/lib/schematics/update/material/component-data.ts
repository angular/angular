export interface MaterialExportAsNameData {
  /** The exportAs name to replace. */
  replace: string;
  /** The new exportAs name. */
  replaceWith: string;
}

export interface MaterialElementSelectorData {
  /** The element name to replace. */
  replace: string;
  /** The new name for the element. */
  replaceWith: string;
}

export interface MaterialCssNameData {
  /** The CSS name to replace. */
  replace: string;
  /** The new CSS name. */
  replaceWith: string;
  /** Whitelist where this replacement is made. If omitted it is made in all files. */
  whitelist: {
    /** Replace this name in CSS files. */
    css?: boolean,
    /** Replace this name in HTML files. */
    html?: boolean,
    /** Replace this name in TypeScript strings. */
    strings?: boolean
  }
}

export interface MaterialAttributeSelectorData {
  /** The attribute name to replace. */
  replace: string;
  /** The new name for the attribute. */
  replaceWith: string;
}

export interface MaterialPropertyNameData {
  /** The property name to replace. */
  replace: string;
  /** The new name for the property. */
  replaceWith: string;
  /** Whitelist where this replacement is made. If omitted it is made for all Classes. */
  whitelist: {
    /** Replace the property only when its type is one of the given Classes. */
    classes?: string[];
  }
}

export interface MaterialClassNameData {
  /** The Class name to replace. */
  replace: string;
  /** The new name for the Class. */
  replaceWith: string;
}

export interface MaterialInputNameData {
  /** The @Input() name to replace. */
  replace: string;
  /** The new name for the @Input(). */
  replaceWith: string;
  /** Whitelist where this replacement is made. If omitted it is made in all HTML & CSS */
  whitelist?: {
    /** Limit to elements with any of these element tags. */
    elements?: string[],
    /** Limit to elements with any of these attributes. */
    attributes?: string[],
    /** Whether to ignore CSS attribute selectors when doing this replacement. */
    css?: boolean,
  }
}

export interface MaterialOutputNameData {
  /** The @Output() name to replace. */
  replace: string;
  /** The new name for the @Output(). */
  replaceWith: string;
  /** Whitelist where this replacement is made. If omitted it is made in all HTML & CSS */
  whitelist?: {
    /** Limit to elements with any of these element tags. */
    elements?: string[],
    /** Limit to elements with any of these attributes. */
    attributes?: string[],
    /** Whether to ignore CSS attribute selectors when doing this replacement. */
    css?: boolean,
  }
}

export interface MaterialMethodCallData {
  className: string;
  method: string;
  invalidArgCounts: {
    count: number,
    message: string
  }[]
}

type Changes<T> = {
  pr: string;
  changes: T[]
}

function getChanges<T>(allChanges: Changes<T>[]): T[] {
  return allChanges.reduce((result, changes) => result.concat(changes.changes), []);
}

/** Export the class name data as part of a module. This means that the data is cached. */
export const classNames = getChanges<MaterialClassNameData>(require('./data/class-names.json'));

/** Export the input names data as part of a module. This means that the data is cached. */
export const inputNames = getChanges<MaterialInputNameData>(require('./data/input-names.json'));

/** Export the output names data as part of a module. This means that the data is cached. */
export const outputNames = getChanges<MaterialOutputNameData>(require('./data/output-names.json'));

/** Export the element selectors data as part of a module. This means that the data is cached. */
export const elementSelectors =
    getChanges<MaterialElementSelectorData>(require('./data/element-selectors.json'));

/** Export the attribute selectors data as part of a module. This means that the data is cached. */
export const exportAsNames =
    getChanges<MaterialExportAsNameData>(require('./data/export-as-names.json'));

/** Export the attribute selectors data as part of a module. This means that the data is cached. */
export const attributeSelectors =
    getChanges<MaterialAttributeSelectorData>(require('./data/attribute-selectors.json'));

/** Export the property names as part of a module. This means that the data is cached. */
export const propertyNames =
    getChanges<MaterialPropertyNameData>(require('./data/property-names.json'));

export const methodCallChecks =
    getChanges<MaterialMethodCallData>(require('./data/method-call-checks.json'));

export const cssNames = getChanges<MaterialCssNameData>(require('./data/css-names.json'));
