import {MethodMemberDoc} from 'dgeni-packages/typescript/api-doc-types/MethodMemberDoc';

export class NormalizedMethodMemberDoc extends MethodMemberDoc {
  params?: MethodParameterInfo[];
}

export interface MethodParameterInfo {
  name: string;
  type: string;
  isOptional: boolean;
}

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
export function normalizeMethodParameters(method: NormalizedMethodMemberDoc) {
  if (method.parameters) {
    method.parameters.forEach(parameter => {
      let [parameterName, parameterType] = parameter.split(':');

      // If the parameter is optional, the name here will contain a '?'. We store whether the
      // parameter is optional and remove the '?' for comparison.
      let isOptional = false;
      if (parameterName.includes('?')) {
        isOptional = true;
        parameterName = parameterName.replace('?', '');
      }

      if (!method.params) {
        method.params = [];
      }

      if (!parameterType) {
        console.warn(`Missing parameter type information (${parameterName}) in ` +
          `${method.fileInfo.relativePath}:${method.startingLine}`);
        return;
      }

      const existingParameterInfo = method.params.find(p => p.name == parameterName);

      if (!existingParameterInfo) {
        method.params.push({
          name: parameterName,
          type: parameterType.trim(),
          isOptional: isOptional
        });
      } else {
        existingParameterInfo.type = parameterType.trim();
        existingParameterInfo.isOptional = isOptional;
      }
    });
  }
}
