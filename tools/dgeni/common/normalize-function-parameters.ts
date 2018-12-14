import {
  ParameterContainer,
  ParamTag,
} from 'dgeni-packages/typescript/api-doc-types/ParameterContainer';
import {ApiDoc} from 'dgeni-packages/typescript/api-doc-types/ApiDoc';

export interface NormalizedFunctionParameters {
  params?: FunctionParameterInfo[];
}

export interface FunctionParameterInfo extends ParamTag {
  type: string;
  isOptional: boolean;
}

/**
 * Generic type that represents Dgeni method members and standalone functions. Also it the type
 * combines the normalized function document so that we can update the doc with type checking.
 */
export type DefaultFunctionDoc = NormalizedFunctionParameters & ParameterContainer & ApiDoc;

/**
 * The `parameters` property are the parameters extracted from TypeScript and are strings
 * of the form "propertyName: propertyType" (literally what's written in the source).
 *
 * The `params` property is pulled from the `@param` JsDoc tag. We need to merge
 * the information of these to get name + type + description.
 *
 * We will use the `params` property to store the final normalized form since it is already
 * an object.
 */
export function normalizeFunctionParameters(doc: DefaultFunctionDoc) {
  if (doc.parameters) {
    doc.parameters.forEach(parameter => {
      let [parameterName, parameterType] = parameter.split(':');

      // If the parameter is optional, the name here will contain a '?'. We store whether the
      // parameter is optional and remove the '?' for comparison.
      let isOptional = false;
      if (parameterName.includes('?')) {
        isOptional = true;
        parameterName = parameterName.replace('?', '');
      }

      doc.params = doc.params || [];

      if (!parameterType) {
        console.warn(`Missing parameter type information (${parameterName}) in ` +
          `${doc.fileInfo.relativePath}:${doc.startingLine}`);
        return;
      }

      const existingParameterInfo = doc.params.find(p => p.name == parameterName);

      if (!existingParameterInfo) {
        doc.params.push({
          name: parameterName,
          type: parameterType.trim(),
          isOptional: isOptional,
          description: ''
        });
      } else {
        existingParameterInfo.type = parameterType.trim();
        existingParameterInfo.isOptional = isOptional;
      }
    });
  }
}
