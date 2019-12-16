export declare function _isNumberValue(value: any): boolean;

export declare type BooleanInput = string | boolean | null | undefined;

export declare function coerceArray<T>(value: T | T[]): T[];

export declare function coerceBooleanProperty(value: any): boolean;

export declare function coerceCssPixelValue(value: any): string;

export declare function coerceElement<T>(elementOrRef: ElementRef<T> | T): T;

export declare function coerceNumberProperty(value: any): number;
export declare function coerceNumberProperty<D>(value: any, fallback: D): number | D;

export declare type NumberInput = string | number | null | undefined;
