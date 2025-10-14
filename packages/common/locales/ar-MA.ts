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
const n = val;

if (n === 0)
    return 0;
if (n === 1)
    return 1;
if (n === 2)
    return 2;
if (n % 100 === Math.floor(n % 100) && (n % 100 >= 3 && n % 100 <= 10))
    return 3;
if (n % 100 === Math.floor(n % 100) && (n % 100 >= 11 && n % 100 <= 99))
    return 4;
return 5;
}

export default ["ar-MA",[["ص","م"]],[["ص","م"],u,["صباحًا","مساءً"]],[["ح","ن","ث","ر","خ","ج","س"],["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],u,["أحد","إثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت"]],u,[["ي","ف","م","أ","م","ن","ل","غ","ش","ك","ب","د"],["يناير","فبراير","مارس","أبريل","ماي","يونيو","يوليوز","غشت","شتنبر","أكتوبر","نونبر","دجنبر"]],u,[["ق.م","م"],u,["قبل الميلاد","ميلادي"]],1,[6,0],["d‏/M‏/y","dd‏/MM‏/y","d MMMM y","EEEE، d MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}",u,"{1} في {0}",u],[",",".",";","‎%‎","‎+","‎-","E","×","‰","∞","ليس رقمًا",":"],["#,##0.###","#,##0%","¤ #,##0.00","#E0"],"MAD","د.م.‏","درهم مغربي",{"AED":["د.إ.‏"],"ARS":[u,"AR$"],"AUD":["AU$"],"BBD":[u,"BB$"],"BHD":["د.ب.‏"],"BMD":[u,"BM$"],"BND":[u,"BN$"],"BSD":[u,"BS$"],"BYN":[u,"р."],"BZD":[u,"BZ$"],"CAD":["CA$"],"CLP":[u,"CL$"],"CNY":["CN¥"],"COP":[u,"CO$"],"CUP":[u,"CU$"],"DOP":[u,"DO$"],"DZD":["د.ج.‏"],"EGP":["ج.م.‏","E£"],"FJD":[u,"FJ$"],"GBP":["UK£"],"GYD":[u,"GY$"],"HKD":["HK$"],"IQD":["د.ع.‏"],"IRR":["ر.إ."],"JMD":[u,"JM$"],"JOD":["د.أ.‏"],"JPY":["JP¥"],"KWD":["د.ك.‏"],"KYD":[u,"KY$"],"LBP":["ل.ل.‏","L£"],"LRD":[u,"$LR"],"LYD":["د.ل.‏"],"MAD":["د.م.‏"],"MRU":["أ.م."],"MXN":["MX$"],"NZD":["NZ$"],"OMR":["ر.ع.‏"],"PHP":[u,"₱"],"QAR":["ر.ق.‏"],"SAR":["ر.س.‏"],"SBD":[u,"SB$"],"SDD":["د.س.‏"],"SDG":["ج.س."],"SRD":[u,"SR$"],"SYP":["ل.س.‏","£"],"THB":["฿"],"TND":["د.ت.‏"],"TTD":[u,"TT$"],"TWD":["NT$"],"USD":["US$"],"UYU":[u,"UY$"],"YER":["ر.ي.‏"]},"rtl", plural];
