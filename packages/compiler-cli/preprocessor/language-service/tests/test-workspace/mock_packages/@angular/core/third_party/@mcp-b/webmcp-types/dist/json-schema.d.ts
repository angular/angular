import type { InputSchema, WebMcpToolInput } from './common.js';
import type { JsonSchemaType as McpJsonSchema } from '../../../@modelcontextprotocol/server/index.js';
/** JSON Schema Draft 2020-12 accepted by the inference helpers. */
export type JsonSchemaForInference = McpJsonSchema;
type JsonSchemaType = 'string' | 'number' | 'integer' | 'boolean' | 'null' | 'object' | 'array';
type Simplify<T> = {
    [K in keyof T]: T[K];
} & {};
type EmptyObject = Record<never, never>;
type ConstValue<TSchema> = TSchema extends {
    const: infer TValue;
} ? TValue : never;
type EnumValue<TSchema> = TSchema extends {
    enum: readonly (infer TValue)[];
} ? TValue : never;
type Properties<TSchema> = TSchema extends {
    properties: infer TProperties extends Readonly<Record<string, unknown>>;
} ? TProperties : EmptyObject;
type RequiredKeys<TSchema> = TSchema extends {
    required: readonly (infer TKey extends string)[];
} ? string extends TKey ? never : Extract<TKey, keyof Properties<TSchema>> : never;
type AdditionalProperties<TSchema> = TSchema extends {
    additionalProperties: false;
} ? keyof Properties<TSchema> extends never ? Record<string, never> : EmptyObject : keyof Properties<TSchema> extends never ? TSchema extends {
    additionalProperties: infer TAdditional extends object;
} ? Record<string, InferJsonSchema<TAdditional>> : Record<string, unknown> : Record<string, unknown>;
type InferObject<TSchema> = Simplify<{
    -readonly [K in keyof Properties<TSchema> as K extends RequiredKeys<TSchema> ? K : never]-?: InferJsonSchema<Properties<TSchema>[K]>;
} & {
    -readonly [K in keyof Properties<TSchema> as K extends RequiredKeys<TSchema> ? never : K]?: InferJsonSchema<Properties<TSchema>[K]>;
} & AdditionalProperties<TSchema>>;
type TypeKeyword<TSchema> = TSchema extends {
    type: infer TType;
} ? TType : TSchema extends {
    properties: unknown;
} | {
    required: unknown;
} | {
    additionalProperties: unknown;
} ? 'object' : never;
type TypeOptions<TSchema> = TypeKeyword<TSchema> extends readonly unknown[] ? Extract<TypeKeyword<TSchema>[number], JsonSchemaType> : Extract<TypeKeyword<TSchema>, JsonSchemaType>;
type InferType<TSchema, TType extends JsonSchemaType> = TType extends 'object' ? InferObject<TSchema> : TType extends 'array' ? TSchema extends {
    items: infer TItems;
} ? InferJsonSchema<TItems>[] : unknown[] : TType extends 'string' ? string : TType extends 'number' | 'integer' ? number : TType extends 'boolean' ? boolean : TType extends 'null' ? null : unknown;
/** Infers a TypeScript value from the supported JSON Schema keywords. */
export type InferJsonSchema<TSchema> = TSchema extends false ? never : TSchema extends true ? unknown : [InputSchema] extends [TSchema] ? unknown : [ConstValue<TSchema>] extends [never] ? [EnumValue<TSchema>] extends [never] ? TypeOptions<TSchema> extends never ? unknown : InferType<TSchema, TypeOptions<TSchema>> : EnumValue<TSchema> : ConstValue<TSchema>;
/** Infers the object or array passed to a WebMCP tool callback. */
export type InferArgsFromInputSchema<TSchema> = [
    Extract<Exclude<InferJsonSchema<TSchema>, null | undefined>, WebMcpToolInput>
] extends [never] ? WebMcpToolInput : Extract<Exclude<InferJsonSchema<TSchema>, null | undefined>, WebMcpToolInput>;
export {};
//# sourceMappingURL=json-schema.d.ts.map