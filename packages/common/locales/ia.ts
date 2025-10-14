/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY.
const u = undefined;

function plural(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
return 5;
}

export default ["ia",[["AM","PM"]],u,[["d","l","m","m","j","v","s"],["dom","lun","mar","mer","jov","ven","sab"],["dominica","lunedi","martedi","mercuridi","jovedi","venerdi","sabbato"],["do","lu","ma","me","jo","ve","sa"]],u,[["j","f","m","a","m","j","j","a","s","o","n","d"],["jan","feb","mar","apr","mai","jun","jul","aug","sep","oct","nov","dec"],["januario","februario","martio","april","maio","junio","julio","augusto","septembre","octobre","novembre","decembre"]],[["1","2","3","4","5","6","7","8","9","10","11","12"],["jan","feb","mar","apr","mai","jun","jul","aug","sep","oct","nov","dec"],["januario","februario","martio","april","maio","junio","julio","augusto","septembre","octobre","novembre","decembre"]],[["a.Chr.","p.Chr."],u,["ante Christo","post Christo"]],1,[6,0],["dd-MM-y","d MMM y","d 'de' MMMM y","EEEE 'le' d 'de' MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,"{1} 'a' {0}",u],[",",".",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤ #,##0.00","#E0"],u,u,u,{"JPY":["JP¥","¥"],"NLG":["ƒ"],"RUB":["₽"],"USD":["US$","$"]},"ltr", plural];
