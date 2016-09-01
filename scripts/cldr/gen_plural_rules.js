/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const cldr = require('cldr');
// locale list
const locales = cldr.localeIds;
const langToRule = {};
const ruleToLang = {};
const variants = [];
const localeToVariant = {};
const DEFAULT_RULE = `function anonymous(n\n/**/) {\nreturn"other"\n}`;

locales.forEach(locale => {
  const rule = normalizeRule(cldr.extractPluralRuleFunction(locale).toString());
  const lang = getVariantLang(locale, rule);

  if (!lang || !rule) {
    return;
  }

  if (!ruleToLang[rule]) {
    ruleToLang[rule] = [];
  } else if (ruleToLang[rule].indexOf(lang) > -1) {
    return;
  }

  ruleToLang[rule].push(lang);
});

var nextVariantCode = 'a'.charCodeAt(0);

variants.forEach(locale => {
  const rule = normalizeRule(cldr.extractPluralRuleFunction(locale).toString());

  if (!rule) {
    return;
  }

  var mapTo = null;

  if (ruleToLang[rule]) {
    mapTo = ruleToLang[rule][0];
    localeToVariant[locale] = mapTo;
    return;
  }

  if (!mapTo) {
    mapTo = '_' + String.fromCharCode(nextVariantCode++);

    langToRule[mapTo] = rule;
    ruleToLang[rule] = [mapTo];
    localeToVariant[locale] = mapTo;
  }
});

console.log(generateCode());

function generateCode() {
  checkMapping();

  return `
// This is generated code DO NOT MODIFY
// see angular2/script/cldr/gen_plural_rules.js

enum Plural {
  Zero,
  One,
  Two,
  Few,
  Many,
  Other
}

function getPluralCase(locale: string, n: number|string): Plural {
` + generateVars() +
    generateRules() + `
}`;
}


function generateRules() {
  const codeParts = [`
const lang = locale.split('_')[0].toLowerCase();

switch (lang) {`];

  Object.keys(ruleToLang).forEach(rule => {
    const langs = ruleToLang[rule];
    codeParts.push(...langs.map(l => `  case '${l}': `));
    codeParts.push(`    ${rule}`);
  });

  codeParts.push(`  default:
   return Plural.Other;
}`);

  return codeParts.join('\n');
}

function generateVars(){
  return `
function getPluralCase(locale: string, nLike: number | string): Plural {
// TODO(vicb): lazy compute
if (typeof nLike === 'string') {
  nLike = parseInt(<string>nLike, 10);
}
const n: number = nLike as number;
const nDecimal = n.toString().replace(/^[^.]*\\.?/, ""); 
const i = Math.floor(Math.abs(n));
const v = nDecimal.length;
const f = parseInt(nDecimal, 10); 
const t = parseInt(n.toString().replace(/^[^.]*\\.?|0+$/g,""), 10) || 0;
`;
}

function checkMapping() {
  if (localeToVariant.length) {
    console.log(`Mapping required:`);
    console.log(localeToVariant);
    throw new Error('not implemented');
  }
}


/**
 * If the language rule do not match an existing language rule, flag it as variant and handle it at the end
 */
function getVariantLang(locale, rule) {
  var lang = locale.split('_')[0];

  if (!langToRule[lang]) {
    langToRule[lang] = rule;
    return lang;
  }

  if (langToRule[lang] === rule) {
    return lang;
  }

  variants.push(locale);
  return null;
}

function normalizeRule(fn) {
  if (fn === DEFAULT_RULE) return;

  return fn
    .replace(toRegExp('function anonymous(n\n/**/) {\n'), '')
    .replace(toRegExp('var'), 'let')
    .replace(toRegExp('"zero"'), ' Plural.Zero')
    .replace(toRegExp('"one"'), ' Plural.One')
    .replace(toRegExp('"two"'), ' Plural.Two')
    .replace(toRegExp('"few"'), ' Plural.Few')
    .replace(toRegExp('"many"'), ' Plural.Many')
    .replace(toRegExp('"other"'), ' Plural.Other')
    .replace(toRegExp('\n}'), '')
    .replace(toRegExp('let'), '')
    .replace(toRegExp('if(typeof n==="string")n=parseInt(n,10);'), '')
    .replace(toRegExp('i=Math.floor(Math.abs(n))'), '')
    .replace(/v=n.toString.*?.length/g, '')
    .replace(/f=parseInt.*?\|\|0/g, '')
    .replace(/t=parseInt.*?\|\|0/g, '')
    .replace(/^[ ,;]*/, '')
  + ';';
}

function toRegExp(s) {
  return new RegExp(s.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1'), 'g');
}