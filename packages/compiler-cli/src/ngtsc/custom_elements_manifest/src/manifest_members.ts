/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ErrorCode} from '../../diagnostics';
import {CheckTypeFailure, computeCheckType} from './check_type';
import {
  AttributeRecord,
  EventRecord,
  ManifestCheckType,
  ManifestDeclaration,
  ManifestWarning,
  ParseContext,
  PropertyRecord,
} from './schema';
import {
  propertyTypeFallbackEffect,
  manifestMessage,
  typeFallbackEffect,
} from './manifest_diagnostics';
import {isObject, MAX_TYPE_TEXT_LENGTH, typeTextOf} from './type_text';

/**
 * The check type for local references to an element class exported as `importedName` from
 * `modulePath` in the manifest's package. Returns no type when the manifest has no package.
 */
export function instanceCheckType(
  importedName: string,
  modulePath: string,
  context: ParseContext,
): {instanceCheckType?: ManifestCheckType} {
  if (context.owningPackage === null) {
    return {};
  }
  const result = computeCheckType(
    {text: importedName, references: [{name: importedName, module: modulePath}]},
    context.owningPackage,
  );
  if (result.checkType === null) {
    return {};
  }
  return {
    instanceCheckType: {
      ...result,
      originalText: importedName,
      subject: `element class '${importedName}' in '${modulePath}'`,
      warningSubject: `element class '${importedName}' in '${modulePath}'`,
      fallbackEffect: typeFallbackEffect('element'),
    },
  };
}

export function extractDeclarationSchema(
  {node: declaration, modulePath: containingModule}: ManifestDeclaration,
  tagName: string,
  {
    properties,
    attributes,
    events,
    unbindableProperties,
  }: {
    properties: Map<string, PropertyRecord>;
    attributes: Map<string, AttributeRecord>;
    events: Map<string, EventRecord>;
    unbindableProperties: Set<string>;
  },
  context: ParseContext,
): void {
  const {manifestLabel, warnings} = context;
  const membersByName = new Map<string, {[key: string]: unknown}>();
  if (Array.isArray(declaration['members'])) {
    for (const member of declaration['members']) {
      if (isObject(member) && member['kind'] === 'field' && typeof member['name'] === 'string') {
        membersByName.set(member['name'], member);
      }
    }
  }
  const declaredAttributeNames = new Set(
    Array.isArray(declaration['attributes'])
      ? declaration['attributes']
          .filter((attribute): attribute is {[key: string]: unknown} => isObject(attribute))
          .map((attribute) => attribute['name'])
          .filter((name): name is string => typeof name === 'string')
      : [],
  );
  if (Array.isArray(declaration['members'])) {
    for (const member of declaration['members']) {
      if (!isObject(member) || member['kind'] !== 'field' || typeof member['name'] !== 'string') {
        continue;
      }
      const memberName = member['name'];
      const invalidModifier = invalidFieldModifier(member);
      if (invalidModifier !== null) {
        warnings.push({
          code: ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID_STRUCTURE,
          subject: `${tagName}.${memberName}`,
          message: manifestMessage(
            manifestLabel,
            `the property '${memberName}' on '${tagName}' has an invalid ` +
              `"${invalidModifier.name}" value, ${JSON.stringify(invalidModifier.value)}. Angular ` +
              `ignores the property, so ` +
              `binding to it is an error.`,
          ),
        });
        unbindableProperties.add(memberName);
        continue;
      }
      const bindable = !(
        member['static'] === true ||
        member['privacy'] === 'private' ||
        member['privacy'] === 'protected' ||
        // Exclude readonly fields so the schema checker rejects bindings that assign to them.
        member['readonly'] === true
      );
      const linkedAttribute =
        typeof member['attribute'] === 'string' && declaredAttributeNames.has(member['attribute'])
          ? member['attribute']
          : null;
      let typeRecord: ReturnType<typeof toTypeRecord> | null = null;
      const getTypeRecord = (): ReturnType<typeof toTypeRecord> =>
        (typeRecord ??= toTypeRecord(member, containingModule, {
          context,
          tagName,
          declarationKind: 'property',
          declarationName: memberName,
          fallbackEffect: propertyTypeFallbackEffect(bindable, linkedAttribute),
        }));
      if (typeof member['attribute'] === 'string' && member['attribute'].length > 0) {
        if (declaredAttributeNames.has(member['attribute'])) {
          attributes.set(member['attribute'], {
            ...getTypeRecord(),
            ...readDocs(member),
            property: memberName,
          });
        } else {
          warnings.push({
            code: ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID_STRUCTURE,
            subject: `${tagName}.${memberName}`,
            message: manifestMessage(
              manifestLabel,
              `the property '${memberName}' on '${tagName}' has "attribute": ` +
                `"${member['attribute']}", but the "attributes" array of '${tagName}' does not ` +
                `list '${member['attribute']}'. Angular uses the property without the attribute.`,
            ),
          });
        }
      }
      if (!bindable) {
        unbindableProperties.add(memberName);
        continue;
      }
      properties.set(memberName, {
        ...getTypeRecord(),
        ...readDocs(member),
      });
    }
  }

  if (Array.isArray(declaration['attributes'])) {
    for (const attribute of declaration['attributes']) {
      if (!isObject(attribute) || typeof attribute['name'] !== 'string') {
        continue;
      }
      const inheritedAttribute = attributes.get(attribute['name']);
      const hasExplicitType = Object.prototype.hasOwnProperty.call(attribute, 'type');
      const requestedFieldName =
        typeof attribute['fieldName'] === 'string' && attribute['fieldName'].length > 0
          ? attribute['fieldName']
          : undefined;
      const relatedMember =
        requestedFieldName === undefined ? undefined : membersByName.get(requestedFieldName);
      const hasValidFieldRelationship =
        requestedFieldName === undefined || relatedMember !== undefined;
      if (!hasValidFieldRelationship) {
        warnings.push({
          code: ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID_STRUCTURE,
          subject: `${tagName}.${attribute['name']}`,
          message: manifestMessage(
            manifestLabel,
            `the attribute '${attribute['name']}' on '${tagName}' has "fieldName": ` +
              `"${requestedFieldName}", but '${tagName}' has no property '${requestedFieldName}'. ` +
              `Angular still knows the attribute, but it gets nothing from the property, including ` +
              `its type.`,
          ),
        });
      }
      const inheritedWithoutType =
        inheritedAttribute === undefined
          ? undefined
          : ((record) => {
              const {
                checkType: _checkType,
                typeText: _typeText,
                typeWarning: _warning,
                ...rest
              } = record;
              return rest;
            })(inheritedAttribute);
      // An attribute with its own type doesn't take the type of a property's class member.
      const linkedProperty = hasExplicitType
        ? undefined
        : (requestedFieldName ?? inheritedAttribute?.property);
      const {property: _property, ...inherited} =
        (hasValidFieldRelationship
          ? hasExplicitType
            ? inheritedWithoutType
            : inheritedAttribute
          : undefined) ?? {};
      attributes.set(attribute['name'], {
        ...inherited,
        ...toTypeRecord(attribute, containingModule, {
          context,
          tagName,
          declarationKind: 'attribute',
          declarationName: attribute['name'],
          fallbackEffect: typeFallbackEffect('attribute'),
        }),
        ...readDocs(attribute),
        ...(hasValidFieldRelationship && linkedProperty !== undefined
          ? {property: linkedProperty}
          : {}),
      });
    }
  }

  if (Array.isArray(declaration['events'])) {
    for (const event of declaration['events']) {
      if (!isObject(event) || typeof event['name'] !== 'string') {
        continue;
      }
      events.set(event['name'], {
        ...validateManifestType(event['type'], containingModule, {
          context,
          tagName,
          declarationKind: 'event',
          declarationName: event['name'],
          fallbackEffect: typeFallbackEffect('event'),
        }),
        ...readTypeText(event['type']),
        ...readDocs(event),
      });
    }
  }
}

function invalidFieldModifier(member: {
  [key: string]: unknown;
}): {name: 'privacy' | 'static' | 'readonly'; value: unknown} | null {
  const privacy = member['privacy'];
  if (
    privacy !== undefined &&
    privacy !== 'public' &&
    privacy !== 'private' &&
    privacy !== 'protected'
  ) {
    return {name: 'privacy', value: privacy};
  }
  const isStatic = member['static'];
  if (isStatic !== undefined && typeof isStatic !== 'boolean') {
    return {name: 'static', value: isStatic};
  }
  const readonly = member['readonly'];
  if (readonly !== undefined && typeof readonly !== 'boolean') {
    return {name: 'readonly', value: readonly};
  }
  return null;
}

/** Extracts a declaration's check type and display metadata. */
function toTypeRecord(
  entry: {[key: string]: unknown},
  containingModule: string | null,
  warningContext: TypeWarningContext,
): {
  checkType?: ManifestCheckType;
  typeWarning?: ManifestWarning;
  typeText?: string;
  default?: string;
} {
  const type = entry['type'];
  const defaultValue = entry['default'];
  return {
    ...validateManifestType(
      type,
      containingModule,
      warningContext,
      Object.prototype.hasOwnProperty.call(entry, 'type'),
    ),
    ...readTypeText(type),
    ...(typeof defaultValue === 'string' ? {default: defaultValue} : {}),
  };
}

interface TypeWarningContext {
  context: ParseContext;
  tagName: string;
  declarationKind: 'property' | 'attribute' | 'event';
  /** What Angular does if the type cannot be used. */
  fallbackEffect: string;
  declarationName: string;
}

/**
 * Validates a CEM type. Returns the check type, or an `unusableType` warning for a rejected type.
 * A missing type produces a warning only when the entry has a `type` field. The caller reports the
 * warning unless the element class provides the type.
 */
function validateManifestType(
  type: unknown,
  containingModule: string | null,
  {context, tagName, declarationKind, declarationName, fallbackEffect}: TypeWarningContext,
  explicitlyDeclared = false,
): {checkType?: ManifestCheckType; typeWarning?: ManifestWarning} {
  const result = computeCheckType(
    type,
    context.owningPackage,
    containingModule,
    context.parsedTypes,
  );
  if (result.checkType !== null) {
    return {
      checkType: {
        ...result,
        originalText: typeTextOf(type)!.trim(),
        subject: `${declarationKind} '${declarationName}' on '${tagName}'`,
        warningSubject: `${tagName}.${declarationName}`,
        fallbackEffect,
      },
    };
  }
  if (result.failure === CheckTypeFailure.MissingTypeText && !explicitlyDeclared) {
    return {};
  }
  return {
    typeWarning: {
      code: ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNUSABLE_TYPE,
      subject: `${tagName}.${declarationName}`,
      message: manifestMessage(
        context.manifestLabel,
        `the type of the ${declarationKind} '${declarationName}' on '${tagName}' cannot be used ` +
          `for type checking: ${unusableTypeReason(typeTextOf(type), result.failure)}. ` +
          fallbackEffect,
      ),
    },
  };
}

function unusableTypeReason(text: string | undefined, failure: CheckTypeFailure): string {
  switch (failure) {
    case CheckTypeFailure.MissingTypeText:
      return `it has no "text" string`;
    case CheckTypeFailure.EmptyTypeText:
      return `its "text" is empty`;
    case CheckTypeFailure.TypeTextTooLong:
      return `${formatTypeText(text!)} is longer than ${MAX_TYPE_TEXT_LENGTH} characters`;
    case CheckTypeFailure.UnusableTypeReference:
      return (
        `${formatTypeText(text!)} contains a name whose "type.references" entries cannot be ` +
        `used. A reference needs a valid "package" or "module", "start" and "end" offsets that ` +
        `match the name if it has them, and the same source as other references to that name`
      );
    case CheckTypeFailure.UnsupportedTypeText:
      return (
        `${formatTypeText(text!)} uses syntax or characters that Angular does not support, such ` +
        `as a function type or a qualified name`
      );
  }
}

/** Quotes type text for a message, shortened to 100 characters. */
function formatTypeText(text: string): string {
  const trimmed = text.trim();
  return JSON.stringify(trimmed.length <= 100 ? trimmed : `${trimmed.slice(0, 99)}…`);
}

/**
 * Keeps the declared type text, if it is within the size limit, for the language service to
 * display. It isn't used for type checking.
 */
function readTypeText(type: unknown): {typeText?: string} {
  const text = typeTextOf(type)?.trim();
  return text !== undefined && text.length > 0 && text.length <= MAX_TYPE_TEXT_LENGTH
    ? {typeText: text}
    : {};
}

/**
 * Reads `deprecated` and `description` from declarations, members, attributes, and events.
 * Deprecation may be `true` or a reason string. Uses `summary` when no description is present.
 */
export function readDocs(entry: {[key: string]: unknown}): {
  deprecated?: true | string;
  description?: string;
} {
  const docs: {deprecated?: true | string; description?: string} = {};
  const deprecated = entry['deprecated'];
  if (deprecated === true || (typeof deprecated === 'string' && deprecated.length > 0)) {
    docs.deprecated = deprecated;
  }
  const description = entry['description'];
  const summary = entry['summary'];
  if (typeof description === 'string' && description.trim().length > 0) {
    docs.description = description;
  } else if (typeof summary === 'string' && summary.trim().length > 0) {
    docs.description = summary;
  }
  return docs;
}
