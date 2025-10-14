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
if (i === 2 && v === 0)
    return 2;
if (v === 0 && (!(n >= 0 && n <= 10) && n % 10 === 0))
    return 4;
return 5;
}

export default ["he",[["לפנה״צ","אחה״צ"]],[["לפנה״צ","אחה״צ"],["AM","PM"]],[["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"],["יום א׳","יום ב׳","יום ג׳","יום ד׳","יום ה׳","יום ו׳","שבת"],["יום ראשון","יום שני","יום שלישי","יום רביעי","יום חמישי","יום שישי","יום שבת"],["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"]],u,[["1","2","3","4","5","6","7","8","9","10","11","12"],["ינו׳","פבר׳","מרץ","אפר׳","מאי","יוני","יולי","אוג׳","ספט׳","אוק׳","נוב׳","דצמ׳"],["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"]],u,[["לפני","אחריי"],["לפנה״ס","לספירה"],["לפני הספירה","לספירה"]],0,[5,6],["d.M.y","d בMMM y","d בMMMM y","EEEE, d בMMMM y"],["H:mm","H:mm:ss","H:mm:ss z","H:mm:ss zzzz"],["{1}, {0}",u,"{1} בשעה {0}",u],[".",",",";","%","‎+","‎-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","‏#,##0.00 ¤;‏-#,##0.00 ¤","#E0"],"ILS","₪","שקל חדש",{"BYN":[u,"р"],"CNY":["‎CN¥‎","¥"],"ILP":["ל״י"],"PHP":[u,"₱"],"THB":["฿"],"TWD":["NT$"]},"rtl", plural];
