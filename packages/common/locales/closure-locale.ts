/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY.

import {registerLocaleData} from '../src/i18n/locale_data';

const u = undefined;


function plural_locale_af(val: number): number {
const n = val;

if (n === 1)
    return 1;
return 5;
}

export const locale_af = ["af",[["v","n"],["vm.","nm."],u],u,[["S","M","D","W","D","V","S"],["So.","Ma.","Di.","Wo.","Do.","Vr.","Sa."],["Sondag","Maandag","Dinsdag","Woensdag","Donderdag","Vrydag","Saterdag"],["So.","Ma.","Di.","Wo.","Do.","Vr.","Sa."]],u,[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jan.","Feb.","Mrt.","Apr.","Mei","Jun.","Jul.","Aug.","Sep.","Okt.","Nov.","Des."],["Januarie","Februarie","Maart","April","Mei","Junie","Julie","Augustus","September","Oktober","November","Desember"]],u,[["v.C.","n.C."],u,["voor Christus","na Christus"]],0,[6,0],["y-MM-dd","dd MMM y","dd MMMM y","EEEE dd MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,u,u],[","," ",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"ZAR","R","Suid-Afrikaanse rand",{"BYN":[u,"р."],"CAD":[u,"$"],"JPY":["JP¥","¥"],"MXN":[u,"$"],"PHP":[u,"₱"],"RON":[u,"leu"],"THB":["฿"],"TWD":["NT$"],"USD":[u,"$"],"ZAR":["R"]},"ltr", plural_locale_af];
export const locale_extra_af = [[["mn","o","m","a","n"],["middernag","die oggend","die middag","die aand","die nag"],u],[["mn","o","m","a","n"],["middernag","oggend","middag","aand","nag"],u],["00:00",["05:00","12:00"],["12:00","18:00"],["18:00","24:00"],["00:00","05:00"]]];




function plural_locale_am(val: number): number {
const n = val, i = Math.floor(Math.abs(val));

if (i === 0 || n === 1)
    return 1;
return 5;
}

export const locale_am = ["am",[["ጠ","ከ"],["ጥዋት","ከሰዓት"],u],u,[["እ","ሰ","ማ","ረ","ሐ","ዓ","ቅ"],["እሑድ","ሰኞ","ማክሰ","ረቡዕ","ሐሙስ","ዓርብ","ቅዳሜ"],["እሑድ","ሰኞ","ማክሰኞ","ረቡዕ","ሐሙስ","ዓርብ","ቅዳሜ"],["እ","ሰ","ማ","ረ","ሐ","ዓ","ቅ"]],u,[["ጃ","ፌ","ማ","ኤ","ሜ","ጁ","ጁ","ኦ","ሴ","ኦ","ኖ","ዲ"],["ጃንዩ","ፌብሩ","ማርች","ኤፕሪ","ሜይ","ጁን","ጁላይ","ኦገስ","ሴፕቴ","ኦክቶ","ኖቬም","ዲሴም"],["ጃንዩወሪ","ፌብሩወሪ","ማርች","ኤፕሪል","ሜይ","ጁን","ጁላይ","ኦገስት","ሴፕቴምበር","ኦክቶበር","ኖቬምበር","ዲሴምበር"]],u,[["ዓ/ዓ","ዓ/ም"],u,["ዓመተ ዓለም","ዓመተ ምሕረት"]],0,[6,0],["dd/MM/y","d MMM y","d MMMM y","y MMMM d, EEEE"],["h:mm a","h:mm:ss a","h:mm:ss a z","h:mm:ss a zzzz"],["{1} {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"ETB","ብር","የኢትዮጵያ ብር",{"AUD":["AU$","$"],"BYN":[u,"р."],"CNH":["የቻይና ዩዋን"],"ETB":["ብር"],"JPY":["JP¥","¥"],"PHP":[u,"₱"],"THB":["฿"],"TWD":["NT$"],"USD":["US$","$"]},"ltr", plural_locale_am];
export const locale_extra_am = [[["እኩለ ሌሊት","ቀ","ጥዋት1","ከሰዓት1","ማታ1","ሌሊት1"],["እኩለ ሌሊት","ቀትር","ጥዋት1","ከሰዓት 7","ማታ1","ሌሊት1"],["እኩለ ሌሊት","ቀትር","ጥዋት1","ከሰዓት 7 ሰዓት","ማታ1","ሌሊት1"]],[["እኩለ ሌሊት","ቀትር","ጥዋት","ከሰዓት በኋላ","ማታ","ሌሊት"],["እኩለ ሌሊት","ቀትር","ጥዋት1","ከሰዓት በኋላ","ማታ","ሌሊት"],u],["00:00","12:00",["06:00","12:00"],["12:00","18:00"],["18:00","24:00"],["00:00","06:00"]]];




function plural_locale_ar(val: number): number {
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

export const locale_ar = ["ar",[["ص","م"],u,u],[["ص","م"],u,["صباحًا","مساءً"]],[["ح","ن","ث","ر","خ","ج","س"],["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],u,["أحد","إثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت"]],u,[["ي","ف","م","أ","و","ن","ل","غ","س","ك","ب","د"],["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],u],u,[["ق.م","م"],u,["قبل الميلاد","ميلادي"]],6,[5,6],["d‏/M‏/y","dd‏/MM‏/y","d MMMM y","EEEE، d MMMM y"],["h:mm a","h:mm:ss a","h:mm:ss a z","h:mm:ss a zzzz"],["{1}, {0}",u,"{1} في {0}",u],[".",",",";","‎%‎","‎+","‎-","E","×","‰","∞","ليس رقمًا",":"],["#,##0.###","#,##0%","¤ #,##0.00","#E0"],"EGP","ج.م.‏","جنيه مصري",{"AED":["د.إ.‏"],"ARS":[u,"AR$"],"AUD":["AU$"],"BBD":[u,"BB$"],"BHD":["د.ب.‏"],"BMD":[u,"BM$"],"BND":[u,"BN$"],"BSD":[u,"BS$"],"BYN":[u,"р."],"BZD":[u,"BZ$"],"CAD":["CA$"],"CLP":[u,"CL$"],"CNY":["CN¥"],"COP":[u,"CO$"],"CUP":[u,"CU$"],"DOP":[u,"DO$"],"DZD":["د.ج.‏"],"EGP":["ج.م.‏","E£"],"FJD":[u,"FJ$"],"GBP":["UK£"],"GYD":[u,"GY$"],"HKD":["HK$"],"IQD":["د.ع.‏"],"IRR":["ر.إ."],"JMD":[u,"JM$"],"JOD":["د.أ.‏"],"JPY":["JP¥"],"KWD":["د.ك.‏"],"KYD":[u,"KY$"],"LBP":["ل.ل.‏","L£"],"LRD":[u,"$LR"],"LYD":["د.ل.‏"],"MAD":["د.م.‏"],"MRU":["أ.م."],"MXN":["MX$"],"NZD":["NZ$"],"OMR":["ر.ع.‏"],"PHP":[u,"₱"],"QAR":["ر.ق.‏"],"SAR":["ر.س.‏"],"SBD":[u,"SB$"],"SDD":["د.س.‏"],"SDG":["ج.س."],"SRD":[u,"SR$"],"SYP":["ل.س.‏","£"],"THB":["฿"],"TND":["د.ت.‏"],"TTD":[u,"TT$"],"TWD":["NT$"],"USD":["US$"],"UYU":[u,"UY$"],"YER":["ر.ي.‏"]},"rtl", plural_locale_ar];
export const locale_extra_ar = [[["فجرًا","صباحًا","ظهرًا","بعد الظهر","مساءً","منتصف الليل","ليلاً"],["فجرًا","ص","ظهرًا","بعد الظهر","مساءً","في المساء","ليلاً"],["في الصباح","صباحًا","ظهرًا","بعد الظهر","مساءً","في المساء","ليلاً"]],[["فجرًا","صباحًا","ظهرًا","بعد الظهر","مساءً","منتصف الليل","ليلاً"],["فجرًا","ص","ظهرًا","بعد الظهر","مساءً","منتصف الليل","ليلاً"],["فجرًا","صباحًا","ظهرًا","بعد الظهر","مساءً","منتصف الليل","ليلاً"]],[["03:00","06:00"],["06:00","12:00"],["12:00","13:00"],["13:00","18:00"],["18:00","24:00"],["00:00","01:00"],["01:00","03:00"]]];




function plural_locale_ar_DZ(val: number): number {
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

export const locale_ar_DZ = ["ar-DZ",[["ص","م"],u,u],[["ص","م"],u,["صباحًا","مساءً"]],[["ح","ن","ث","ر","خ","ج","س"],["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],u,["أحد","إثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت"]],u,[["ج","ف","م","أ","م","ج","ج","أ","س","أ","ن","د"],["جانفي","فيفري","مارس","أفريل","ماي","جوان","جويلية","أوت","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],u],u,[["ق.م","م"],u,["قبل الميلاد","ميلادي"]],6,[5,6],["d‏/M‏/y","dd‏/MM‏/y","d MMMM y","EEEE، d MMMM y"],["h:mm a","h:mm:ss a","h:mm:ss a z","h:mm:ss a zzzz"],["{1}, {0}",u,"{1} في {0}",u],[",",".",";","‎%‎","‎+","‎-","E","×","‰","∞","ليس رقمًا",":"],["#,##0.###","#,##0%","¤ #,##0.00","#E0"],"DZD","د.ج.‏","دينار جزائري",{"AED":["د.إ.‏"],"ARS":[u,"AR$"],"AUD":["AU$"],"BBD":[u,"BB$"],"BHD":["د.ب.‏"],"BMD":[u,"BM$"],"BND":[u,"BN$"],"BSD":[u,"BS$"],"BYN":[u,"р."],"BZD":[u,"BZ$"],"CAD":["CA$"],"CLP":[u,"CL$"],"CNY":["CN¥"],"COP":[u,"CO$"],"CUP":[u,"CU$"],"DOP":[u,"DO$"],"DZD":["د.ج.‏"],"EGP":["ج.م.‏","E£"],"FJD":[u,"FJ$"],"GBP":["UK£"],"GYD":[u,"GY$"],"HKD":["HK$"],"IQD":["د.ع.‏"],"IRR":["ر.إ."],"JMD":[u,"JM$"],"JOD":["د.أ.‏"],"JPY":["JP¥"],"KWD":["د.ك.‏"],"KYD":[u,"KY$"],"LBP":["ل.ل.‏","L£"],"LRD":[u,"$LR"],"LYD":["د.ل.‏"],"MAD":["د.م.‏"],"MRU":["أ.م."],"MXN":["MX$"],"NZD":["NZ$"],"OMR":["ر.ع.‏"],"PHP":[u,"₱"],"QAR":["ر.ق.‏"],"SAR":["ر.س.‏"],"SBD":[u,"SB$"],"SDD":["د.س.‏"],"SDG":["ج.س."],"SRD":[u,"SR$"],"SYP":["ل.س.‏","£"],"THB":["฿"],"TND":["د.ت.‏"],"TTD":[u,"TT$"],"TWD":["NT$"],"USD":["US$"],"UYU":[u,"UY$"],"YER":["ر.ي.‏"]},"rtl", plural_locale_ar_DZ];
export const locale_extra_ar_DZ = [[["فجرًا","صباحًا","ظهرًا","بعد الظهر","مساءً","منتصف الليل","ليلاً"],["فجرًا","ص","ظهرًا","بعد الظهر","مساءً","في المساء","ليلاً"],["في الصباح","صباحًا","ظهرًا","بعد الظهر","مساءً","في المساء","ليلاً"]],[["فجرًا","صباحًا","ظهرًا","بعد الظهر","مساءً","منتصف الليل","ليلاً"],["فجرًا","ص","ظهرًا","بعد الظهر","مساءً","منتصف الليل","ليلاً"],["فجرًا","صباحًا","ظهرًا","بعد الظهر","مساءً","منتصف الليل","ليلاً"]],[["03:00","06:00"],["06:00","12:00"],["12:00","13:00"],["13:00","18:00"],["18:00","24:00"],["00:00","01:00"],["01:00","03:00"]]];




function plural_locale_az(val: number): number {
const n = val;

if (n === 1)
    return 1;
return 5;
}

export const locale_az = ["az",[["a","p"],["AM","PM"],u],[["AM","PM"],u,u],[["7","1","2","3","4","5","6"],["B.","B.e.","Ç.a.","Ç.","C.a.","C.","Ş."],["bazar","bazar ertəsi","çərşənbə axşamı","çərşənbə","cümə axşamı","cümə","şənbə"],["B.","B.E.","Ç.A.","Ç.","C.A.","C.","Ş."]],[["7","1","2","3","4","5","6"],["B.","B.E.","Ç.A.","Ç.","C.A.","C.","Ş."],["bazar","bazar ertəsi","çərşənbə axşamı","çərşənbə","cümə axşamı","cümə","şənbə"],["B.","B.E.","Ç.A.","Ç.","C.A.","C.","Ş."]],[["1","2","3","4","5","6","7","8","9","10","11","12"],["yan","fev","mar","apr","may","iyn","iyl","avq","sen","okt","noy","dek"],["yanvar","fevral","mart","aprel","may","iyun","iyul","avqust","sentyabr","oktyabr","noyabr","dekabr"]],u,[["e.ə.","y.e."],u,["eramızdan əvvəl","yeni era"]],1,[6,0],["dd.MM.yy","d MMM y","d MMMM y","d MMMM y, EEEE"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,u,u],[",",".",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"AZN","₼","Azərbaycan Manatı",{"AZN":["₼"],"BYN":[u,"р."],"JPY":["JP¥","¥"],"PHP":[u,"₱"],"RON":[u,"ley"],"SYP":[u,"S£"],"THB":["฿"],"TWD":["NT$"],"USD":["US$","$"]},"ltr", plural_locale_az];
export const locale_extra_az = [[["gecəyarı","g","sübh","səhər","gündüz","axşamüstü","axşam","gecə"],["gecəyarı","günorta","sübh","səhər","gündüz","axşamüstü","axşam","gecə"],u],[["gecəyarı","günorta","sübh","səhər","gündüz","axşamüstü","axşam","gecə"],u,u],["00:00","12:00",["04:00","06:00"],["06:00","12:00"],["12:00","17:00"],["17:00","19:00"],["19:00","24:00"],["00:00","04:00"]]];




function plural_locale_be(val: number): number {
const n = val;

if (n % 10 === 1 && !(n % 100 === 11))
    return 1;
if (n % 10 === Math.floor(n % 10) && (n % 10 >= 2 && n % 10 <= 4) && !(n % 100 >= 12 && n % 100 <= 14))
    return 3;
if (n % 10 === 0 || (n % 10 === Math.floor(n % 10) && (n % 10 >= 5 && n % 10 <= 9) || n % 100 === Math.floor(n % 100) && (n % 100 >= 11 && n % 100 <= 14)))
    return 4;
return 5;
}

export const locale_be = ["be",[["am","pm"],["AM","PM"],u],[["AM","PM"],u,u],[["н","п","а","с","ч","п","с"],["нд","пн","аў","ср","чц","пт","сб"],["нядзеля","панядзелак","аўторак","серада","чацвер","пятніца","субота"],["нд","пн","аў","ср","чц","пт","сб"]],u,[["с","л","с","к","м","ч","л","ж","в","к","л","с"],["сту","лют","сак","кра","мая","чэр","ліп","жні","вер","кас","ліс","сне"],["студзеня","лютага","сакавіка","красавіка","мая","чэрвеня","ліпеня","жніўня","верасня","кастрычніка","лістапада","снежня"]],[["с","л","с","к","м","ч","л","ж","в","к","л","с"],["сту","лют","сак","кра","май","чэр","ліп","жні","вер","кас","ліс","сне"],["студзень","люты","сакавік","красавік","май","чэрвень","ліпень","жнівень","верасень","кастрычнік","лістапад","снежань"]],[["да н.э.","н.э."],u,["да нараджэння Хрыстова","ад нараджэння Хрыстова"]],1,[6,0],["d.MM.yy","d MMM y 'г'.","d MMMM y 'г'.","EEEE, d MMMM y 'г'."],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss, zzzz"],["{1}, {0}",u,"{1} 'у' {0}",u],[","," ",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"BYN","Br","беларускі рубель",{"AUD":["A$"],"BBD":[u,"Bds$"],"BMD":[u,"BD$"],"BRL":[u,"R$"],"BSD":[u,"B$"],"BYN":["Br"],"BZD":[u,"BZ$"],"CAD":[u,"CA$"],"CUC":[u,"CUC$"],"CUP":[u,"$MN"],"DOP":[u,"RD$"],"FJD":[u,"FJ$"],"FKP":[u,"FK£"],"GYD":[u,"G$"],"ISK":[u,"Íkr"],"JMD":[u,"J$"],"KYD":[u,"CI$"],"LRD":[u,"L$"],"MXN":["MX$"],"NAD":[u,"N$"],"NZD":[u,"NZ$"],"PHP":[u,"₱"],"RUB":["₽","руб."],"SBD":[u,"SI$"],"SGD":[u,"S$"],"TTD":[u,"TT$"],"UYU":[u,"$U"],"XCD":["EC$"]},"ltr", plural_locale_be];
export const locale_extra_be = [];




function plural_locale_bg(val: number): number {
const n = val;

if (n === 1)
    return 1;
return 5;
}

export const locale_bg = ["bg",[["am","pm"],u,["пр.об.","сл.об."]],[["am","pm"],u,u],[["н","п","в","с","ч","п","с"],["нд","пн","вт","ср","чт","пт","сб"],["неделя","понеделник","вторник","сряда","четвъртък","петък","събота"],["нд","пн","вт","ср","чт","пт","сб"]],u,[["я","ф","м","а","м","ю","ю","а","с","о","н","д"],["яну","фев","март","апр","май","юни","юли","авг","сеп","окт","ное","дек"],["януари","февруари","март","април","май","юни","юли","август","септември","октомври","ноември","декември"]],u,[["пр.Хр.","сл.Хр."],u,["преди Христа","след Христа"]],1,[6,0],["d.MM.yy 'г'.","d.MM.y 'г'.","d MMMM y 'г'.","EEEE, d MMMM y 'г'."],["H:mm 'ч'.","H:mm:ss 'ч'.","H:mm:ss 'ч'. z","H:mm:ss 'ч'. zzzz"],["{1}, {0}",u,u,u],[","," ",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","0.00 ¤","#E0"],"BGN","лв.","Български лев",{"AFN":[u,"Af"],"AMD":[],"ARS":[],"AUD":[],"AZN":[],"BBD":[],"BDT":[],"BGN":["лв."],"BMD":[],"BND":[],"BRL":[],"BSD":[],"BZD":[],"CAD":[],"CLP":[],"CNY":[],"COP":[],"CRC":[],"CUP":[],"DOP":[],"FJD":[],"FKP":[],"GBP":[u,"£"],"GHS":[],"GIP":[],"GYD":[],"HKD":[],"ILS":[],"INR":[],"JMD":[],"JPY":[u,"¥"],"KHR":[],"KRW":[],"KYD":[],"KZT":[],"LAK":[],"LRD":[],"MNT":[],"MXN":[],"NAD":[],"NGN":[],"NZD":[],"PHP":[],"PYG":[],"RON":[],"SBD":[],"SGD":[],"SRD":[],"SSP":[],"TRY":[],"TTD":[],"TWD":[],"UAH":[],"USD":["щ.д.","$"],"UYU":[],"VND":[],"XCD":[u,"$"]},"ltr", plural_locale_bg];
export const locale_extra_bg = [[["полунощ","сутринта","на обяд","следобед","вечерта","през нощта"],u,u],u,["00:00",["04:00","11:00"],["11:00","14:00"],["14:00","18:00"],["18:00","22:00"],["22:00","04:00"]]];




function plural_locale_bn(val: number): number {
const n = val, i = Math.floor(Math.abs(val));

if (i === 0 || n === 1)
    return 1;
return 5;
}

export const locale_bn = ["bn",[["AM","PM"],u,u],u,[["র","সো","ম","বু","বৃ","শু","শ"],["রবি","সোম","মঙ্গল","বুধ","বৃহস্পতি","শুক্র","শনি"],["রবিবার","সোমবার","মঙ্গলবার","বুধবার","বৃহস্পতিবার","শুক্রবার","শনিবার"],["রঃ","সোঃ","মঃ","বুঃ","বৃঃ","শুঃ","শনি"]],u,[["জা","ফে","মা","এ","মে","জুন","জু","আ","সে","অ","ন","ডি"],["জানু","ফেব","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"],["জানুয়ারী","ফেব্রুয়ারী","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"]],[["জা","ফে","মা","এ","মে","জুন","জু","আ","সে","অ","ন","ডি"],["জানুয়ারী","ফেব্রুয়ারী","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"],u],[["খ্রিস্টপূর্ব","খৃষ্টাব্দ"],u,["খ্রিস্টপূর্ব","খ্রীষ্টাব্দ"]],0,[6,0],["d/M/yy","d MMM, y","d MMMM, y","EEEE, d MMMM, y"],["h:mm a","h:mm:ss a","h:mm:ss a z","h:mm:ss a zzzz"],["{1} {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##,##0.###","#,##,##0%","#,##,##0.00¤","#E0"],"BDT","৳","বাংলাদেশী টাকা",{"BDT":["৳"],"BYN":[u,"р."],"JPY":["JP¥","¥"],"PHP":[u,"₱"],"THB":["฿"],"TWD":["NT$"],"USD":["US$","$"]},"ltr", plural_locale_bn];
export const locale_extra_bn = [[["ভোর","সকাল","দুপুর","বিকাল","সন্ধ্যা","রাত্রি"],u,["ভোর","সকাল","দুপুর","বিকাল","সন্ধ্যা","রাত্রিতে"]],[["ভোর","সকাল","দুপুর","বিকাল","সন্ধ্যা","রাত্রি"],u,u],[["04:00","06:00"],["06:00","12:00"],["12:00","16:00"],["16:00","18:00"],["18:00","20:00"],["20:00","04:00"]]];




function plural_locale_br(val: number): number {
const n = val;

if (n % 10 === 1 && !(n % 100 === 11 || (n % 100 === 71 || n % 100 === 91)))
    return 1;
if (n % 10 === 2 && !(n % 100 === 12 || (n % 100 === 72 || n % 100 === 92)))
    return 2;
if (n % 10 === Math.floor(n % 10) && (n % 10 >= 3 && n % 10 <= 4 || n % 10 === 9) && !(n % 100 >= 10 && n % 100 <= 19 || (n % 100 >= 70 && n % 100 <= 79 || n % 100 >= 90 && n % 100 <= 99)))
    return 3;
if (!(n === 0) && n % 1000000 === 0)
    return 4;
return 5;
}

export const locale_br = ["br",[["am","gm"],["A.M.","G.M."],u],[["A.M.","G.M."],u,u],[["Su","L","Mz","Mc","Y","G","Sa"],["Sul","Lun","Meu.","Mer.","Yaou","Gwe.","Sad."],["Sul","Lun","Meurzh","Mercʼher","Yaou","Gwener","Sadorn"],["Sul","Lun","Meu.","Mer.","Yaou","Gwe.","Sad."]],u,[["01","02","03","04","05","06","07","08","09","10","11","12"],["Gen.","Cʼhwe.","Meur.","Ebr.","Mae","Mezh.","Goue.","Eost","Gwen.","Here","Du","Kzu."],["Genver","Cʼhwevrer","Meurzh","Ebrel","Mae","Mezheven","Gouere","Eost","Gwengolo","Here","Du","Kerzu"]],u,[["a-raok J.K.","goude J.K."],u,["a-raok Jezuz-Krist","goude Jezuz-Krist"]],1,[6,0],["dd/MM/y","d MMM y","d MMMM y","EEEE d MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}","{1}, {0}","{1} 'da' {0}",u],[","," ",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"EUR","€","euro",{"AUD":["$A","$"],"BRL":[u,"R$"],"BYN":[u,"р."],"CAD":["$CA","$"],"CNY":[u,"¥"],"EGP":[u,"£ E"],"GBP":["£ RU","£"],"HKD":["$ HK","$"],"ILS":[u,"₪"],"JPY":[u,"¥"],"KRW":[u,"₩"],"LBP":[u,"£L"],"NZD":["$ ZN","$"],"PHP":[u,"₱"],"RUR":[u,"р."],"TOP":[u,"$ T"],"TWD":[u,"$"],"USD":["$ SU","$"],"VND":[u,"₫"],"XCD":[u,"$"],"XXX":[]},"ltr", plural_locale_br];
export const locale_extra_br = [];




function plural_locale_bs(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length, f = parseInt(val.toString().replace(/^[^.]*\.?/, ''), 10) || 0;

if (v === 0 && (i % 10 === 1 && !(i % 100 === 11)) || f % 10 === 1 && !(f % 100 === 11))
    return 1;
if (v === 0 && (i % 10 === Math.floor(i % 10) && (i % 10 >= 2 && i % 10 <= 4) && !(i % 100 >= 12 && i % 100 <= 14)) || f % 10 === Math.floor(f % 10) && (f % 10 >= 2 && f % 10 <= 4) && !(f % 100 >= 12 && f % 100 <= 14))
    return 3;
return 5;
}

export const locale_bs = ["bs",[["prijepodne","popodne"],["AM","PM"],["prijepodne","popodne"]],u,[["N","P","U","S","Č","P","S"],["ned","pon","uto","sri","čet","pet","sub"],["nedjelja","ponedjeljak","utorak","srijeda","četvrtak","petak","subota"],["ned","pon","uto","sri","čet","pet","sub"]],[["n","p","u","s","č","p","s"],["ned","pon","uto","sri","čet","pet","sub"],["nedjelja","ponedjeljak","utorak","srijeda","četvrtak","petak","subota"],["ned","pon","uto","sri","čet","pet","sub"]],[["j","f","m","a","m","j","j","a","s","o","n","d"],["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"],["januar","februar","mart","april","maj","juni","juli","august","septembar","oktobar","novembar","decembar"]],u,[["p.n.e.","n. e."],["p. n. e.","n. e."],["prije nove ere","nove ere"]],1,[6,0],["d. M. y.","d. MMM y.","d. MMMM y.","EEEE, d. MMMM y."],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,"{1} 'u' {0}",u],[",",".",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"BAM","KM","Bosanskohercegovačka konvertibilna marka",{"AUD":[u,"$"],"BAM":["KM"],"BRL":[u,"R$"],"BYN":[u,"р."],"CAD":[u,"$"],"CNY":[u,"¥"],"GBP":[u,"£"],"HKD":[u,"$"],"HRK":["kn"],"ILS":[u,"₪"],"MXN":[u,"$"],"NZD":[u,"$"],"PHP":[u,"₱"],"RSD":["din."],"THB":["฿"],"TWD":["NT$"],"USD":[u,"$"],"XCD":[u,"$"],"XPF":[]},"ltr", plural_locale_bs];
export const locale_extra_bs = [[["ponoć","podne","ujutro","poslijepodne","navečer","po noći"],u,u],u,["00:00","12:00",["04:00","12:00"],["12:00","18:00"],["18:00","21:00"],["21:00","04:00"]]];




function plural_locale_ca(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
return 5;
}

export const locale_ca = ["ca",[["a. m.","p. m."],u,u],u,[["dg","dl","dt","dc","dj","dv","ds"],["dg.","dl.","dt.","dc.","dj.","dv.","ds."],["diumenge","dilluns","dimarts","dimecres","dijous","divendres","dissabte"],["dg.","dl.","dt.","dc.","dj.","dv.","ds."]],u,[["GN","FB","MÇ","AB","MG","JN","JL","AG","ST","OC","NV","DS"],["de gen.","de febr.","de març","d’abr.","de maig","de juny","de jul.","d’ag.","de set.","d’oct.","de nov.","de des."],["de gener","de febrer","de març","d’abril","de maig","de juny","de juliol","d’agost","de setembre","d’octubre","de novembre","de desembre"]],[["GN","FB","MÇ","AB","MG","JN","JL","AG","ST","OC","NV","DS"],["gen.","febr.","març","abr.","maig","juny","jul.","ag.","set.","oct.","nov.","des."],["gener","febrer","març","abril","maig","juny","juliol","agost","setembre","octubre","novembre","desembre"]],[["aC","dC"],u,["abans de Crist","després de Crist"]],1,[6,0],["d/M/yy","d MMM y","d MMMM 'de' y","EEEE, d MMMM 'de' y"],["H:mm","H:mm:ss","H:mm:ss z","H:mm:ss (zzzz)"],["{1} {0}","{1}, {0}","{1}, 'a' 'les' {0}",u],[",",".",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"EUR","€","euro",{"AUD":["AU$","$"],"BRL":[u,"R$"],"BYN":[u,"р."],"CAD":[u,"$"],"CNY":[u,"¥"],"ESP":["₧"],"MXN":[u,"$"],"PHP":[u,"₱"],"THB":["฿"],"USD":[u,"$"],"VEF":[u,"Bs F"],"XCD":[u,"$"],"XXX":[]},"ltr", plural_locale_ca];
export const locale_extra_ca = [[["mitjanit","mat.","matí","md","tarda","vespre","nit"],["mitjanit","matinada","matí","migdia","tarda","vespre","nit"],u],[["mitjanit","matinada","matí","migdia","tarda","vespre","nit"],u,u],["00:00",["00:00","06:00"],["06:00","12:00"],["12:00","13:00"],["13:00","19:00"],["19:00","21:00"],["21:00","24:00"]]];




function plural_locale_chr(val: number): number {
const n = val;

if (n === 1)
    return 1;
return 5;
}

export const locale_chr = ["chr",[["Ꮜ","Ꮢ"],["ᏌᎾᎴ","ᏒᎯᏱᎢ"],["ᏌᎾᎴ","ᏒᎯᏱᎢᏗᏢ"]],[["ᏌᎾᎴ","ᏒᎯᏱᎢ"],u,["ᏌᎾᎴ","ᏒᎯᏱᎢᏗᏢ"]],[["Ꮖ","Ꮙ","Ꮤ","Ꮶ","Ꮕ","Ꮷ","Ꭴ"],["ᏆᏍᎬ","ᏉᏅᎯ","ᏔᎵᏁ","ᏦᎢᏁ","ᏅᎩᏁ","ᏧᎾᎩ","ᏈᏕᎾ"],["ᎤᎾᏙᏓᏆᏍᎬ","ᎤᎾᏙᏓᏉᏅᎯ","ᏔᎵᏁᎢᎦ","ᏦᎢᏁᎢᎦ","ᏅᎩᏁᎢᎦ","ᏧᎾᎩᎶᏍᏗ","ᎤᎾᏙᏓᏈᏕᎾ"],["ᏍᎬ","ᏅᎯ","ᏔᎵ","ᏦᎢ","ᏅᎩ","ᏧᎾ","ᏕᎾ"]],u,[["Ꭴ","Ꭷ","Ꭰ","Ꭷ","Ꭰ","Ꮥ","Ꭻ","Ꭶ","Ꮪ","Ꮪ","Ꮕ","Ꭵ"],["ᎤᏃ","ᎧᎦ","ᎠᏅ","ᎧᏬ","ᎠᏂ","ᏕᎭ","ᎫᏰ","ᎦᎶ","ᏚᎵ","ᏚᏂ","ᏅᏓ","ᎥᏍ"],["ᎤᏃᎸᏔᏅ","ᎧᎦᎵ","ᎠᏅᏱ","ᎧᏬᏂ","ᎠᏂᏍᎬᏘ","ᏕᎭᎷᏱ","ᎫᏰᏉᏂ","ᎦᎶᏂ","ᏚᎵᏍᏗ","ᏚᏂᏅᏗ","ᏅᏓᏕᏆ","ᎥᏍᎩᏱ"]],u,[["BC","AD"],u,["ᏧᏓᎷᎸ ᎤᎷᎯᏍᏗ ᎦᎶᏁᏛ","ᎠᏃ ᏙᎻᏂ"]],0,[6,0],["M/d/yy","MMM d, y","MMMM d, y","EEEE, MMMM d, y"],["h:mm a","h:mm:ss a","h:mm:ss a z","h:mm:ss a zzzz"],["{1}, {0}",u,"{1} ᎤᎾᎢ {0}",u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"USD","$","US ᎠᏕᎳ",{"BYN":[u,"р."],"JPY":["JP¥","¥"],"PHP":[u,"₱"]},"ltr", plural_locale_chr];
export const locale_extra_chr = [[["Ꭲ","ᏌᎾᎴ","ᏒᎯᏱᎢᏗᏢ"],["ᎢᎦ","ᏌᎾᎴ","ᏒᎯᏱᎢᏗᏢ"],u],[["ᎢᎦ","ᏌᎾᎴ","ᏒᎯᏱᎢᏗᏢ"],u,u],["12:00",["00:00","12:00"],["12:00","24:00"]]];




function plural_locale_cs(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
if (i === Math.floor(i) && (i >= 2 && i <= 4) && v === 0)
    return 3;
if (!(v === 0))
    return 4;
return 5;
}

export const locale_cs = ["cs",[["dop.","odp."],u,u],u,[["N","P","Ú","S","Č","P","S"],["ne","po","út","st","čt","pá","so"],["neděle","pondělí","úterý","středa","čtvrtek","pátek","sobota"],["ne","po","út","st","čt","pá","so"]],u,[["1","2","3","4","5","6","7","8","9","10","11","12"],["led","úno","bře","dub","kvě","čvn","čvc","srp","zář","říj","lis","pro"],["ledna","února","března","dubna","května","června","července","srpna","září","října","listopadu","prosince"]],[["1","2","3","4","5","6","7","8","9","10","11","12"],["led","úno","bře","dub","kvě","čvn","čvc","srp","zář","říj","lis","pro"],["leden","únor","březen","duben","květen","červen","červenec","srpen","září","říjen","listopad","prosinec"]],[["př.n.l.","n.l."],["př. n. l.","n. l."],["před naším letopočtem","našeho letopočtu"]],1,[6,0],["dd.MM.yy","d. M. y","d. MMMM y","EEEE d. MMMM y"],["H:mm","H:mm:ss","H:mm:ss z","H:mm:ss zzzz"],["{1} {0}",u,u,u],[","," ",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"CZK","Kč","česká koruna",{"AUD":["AU$","$"],"BYN":[u,"р."],"CSK":["Kčs"],"CZK":["Kč"],"ILS":[u,"₪"],"INR":[u,"₹"],"JPY":["JP¥","¥"],"PHP":[u,"₱"],"RON":[u,"L"],"RUR":[u,"р."],"TWD":["NT$"],"USD":["US$","$"],"VND":[u,"₫"],"XEU":["ECU"],"XXX":[]},"ltr", plural_locale_cs];
export const locale_extra_cs = [[["půl.","pol.","r.","d.","o.","v.","n."],["půln.","pol.","r.","dop.","odp.","več.","v n."],["půlnoc","poledne","ráno","dopoledne","odpoledne","večer","v noci"]],[["půl.","pol.","ráno","dop.","odp.","več.","noc"],["půlnoc","poledne","ráno","dopoledne","odpoledne","večer","noc"],u],["00:00","12:00",["04:00","09:00"],["09:00","12:00"],["12:00","18:00"],["18:00","22:00"],["22:00","04:00"]]];




function plural_locale_cy(val: number): number {
const n = val;

if (n === 0)
    return 0;
if (n === 1)
    return 1;
if (n === 2)
    return 2;
if (n === 3)
    return 3;
if (n === 6)
    return 4;
return 5;
}

export const locale_cy = ["cy",[["b","h"],["AM","PM"],["yb","yh"]],[["AM","PM"],u,u],[["S","Ll","M","M","I","G","S"],["Sul","Llun","Maw","Mer","Iau","Gwen","Sad"],["Dydd Sul","Dydd Llun","Dydd Mawrth","Dydd Mercher","Dydd Iau","Dydd Gwener","Dydd Sadwrn"],["Su","Ll","Ma","Me","Ia","Gw","Sa"]],[["S","Ll","M","M","I","G","S"],["Sul","Llun","Maw","Mer","Iau","Gwe","Sad"],["Dydd Sul","Dydd Llun","Dydd Mawrth","Dydd Mercher","Dydd Iau","Dydd Gwener","Dydd Sadwrn"],["Su","Ll","Ma","Me","Ia","Gw","Sa"]],[["I","Ch","M","E","M","M","G","A","M","H","T","Rh"],["Ion","Chwef","Maw","Ebr","Mai","Meh","Gorff","Awst","Medi","Hyd","Tach","Rhag"],["Ionawr","Chwefror","Mawrth","Ebrill","Mai","Mehefin","Gorffennaf","Awst","Medi","Hydref","Tachwedd","Rhagfyr"]],[["I","Ch","M","E","M","M","G","A","M","H","T","Rh"],["Ion","Chw","Maw","Ebr","Mai","Meh","Gor","Awst","Medi","Hyd","Tach","Rhag"],["Ionawr","Chwefror","Mawrth","Ebrill","Mai","Mehefin","Gorffennaf","Awst","Medi","Hydref","Tachwedd","Rhagfyr"]],[["C","O"],["CC","OC"],["Cyn Crist","Oed Crist"]],1,[6,0],["dd/MM/yy","d MMM y","d MMMM y","EEEE, d MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,"{1} 'am' {0}",u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"GBP","£","Punt Prydain",{"BDT":[u,"TK"],"BWP":[],"BYN":[u,"р."],"HKD":["HK$"],"JPY":["JP¥","¥"],"KRW":[u,"₩"],"PHP":[u,"₱"],"THB":["฿"],"TWD":["NT$"],"USD":["US$","$"],"XXX":[],"ZAR":[],"ZMW":[]},"ltr", plural_locale_cy];
export const locale_extra_cy = [[["canol nos","canol dydd","yn y bore","yn y prynhawn","min nos"],["canol nos","canol dydd","y bore","y prynhawn","yr hwyr"],u],[["canol nos","canol dydd","bore","prynhawn","min nos"],["canol nos","canol dydd","bore","prynhawn","yr hwyr"],["canol nos","canol dydd","y bore","y prynhawn","yr hwyr"]],["00:00","12:00",["00:00","12:00"],["12:00","18:00"],["18:00","24:00"]]];




function plural_locale_da(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), t = parseInt(val.toString().replace(/^[^.]*\.?|0+$/g, ''), 10) || 0;

if (n === 1 || !(t === 0) && (i === 0 || i === 1))
    return 1;
return 5;
}

export const locale_da = ["da",[["a","p"],["AM","PM"],u],[["AM","PM"],u,u],[["S","M","T","O","T","F","L"],["søn.","man.","tir.","ons.","tor.","fre.","lør."],["søndag","mandag","tirsdag","onsdag","torsdag","fredag","lørdag"],["sø","ma","ti","on","to","fr","lø"]],[["S","M","T","O","T","F","L"],["søn","man","tir","ons","tor","fre","lør"],["søndag","mandag","tirsdag","onsdag","torsdag","fredag","lørdag"],["sø","ma","ti","on","to","fr","lø"]],[["J","F","M","A","M","J","J","A","S","O","N","D"],["jan.","feb.","mar.","apr.","maj","jun.","jul.","aug.","sep.","okt.","nov.","dec."],["januar","februar","marts","april","maj","juni","juli","august","september","oktober","november","december"]],u,[["fKr","eKr"],["f.Kr.","e.Kr."],u],1,[6,0],["dd.MM.y","d. MMM y","d. MMMM y","EEEE 'den' d. MMMM y"],["HH.mm","HH.mm.ss","HH.mm.ss z","HH.mm.ss zzzz"],["{1} {0}",u,"{1} 'kl'. {0}",u],[",",".",";","%","+","-","E","×","‰","∞","NaN","."],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"DKK","kr.","dansk krone",{"AUD":["AU$","$"],"BYN":[u,"Br."],"DKK":["kr."],"ISK":[u,"kr."],"JPY":["JP¥","¥"],"NOK":[u,"kr."],"PHP":[u,"₱"],"RON":[u,"L"],"SEK":[u,"kr."],"THB":["฿"],"TWD":["NT$"],"USD":["US$","$"]},"ltr", plural_locale_da];
export const locale_extra_da = [[["midnat","om morgenen","om formiddagen","om eftermiddagen","om aftenen","om natten"],u,u],[["midnat","morgen","formiddag","eftermiddag","aften","nat"],u,u],["00:00",["05:00","10:00"],["10:00","12:00"],["12:00","18:00"],["18:00","24:00"],["00:00","05:00"]]];




function plural_locale_de(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
return 5;
}

export const locale_de = ["de",[["AM","PM"],u,u],u,[["S","M","D","M","D","F","S"],["So.","Mo.","Di.","Mi.","Do.","Fr.","Sa."],["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],["So.","Mo.","Di.","Mi.","Do.","Fr.","Sa."]],[["S","M","D","M","D","F","S"],["So","Mo","Di","Mi","Do","Fr","Sa"],["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],["So.","Mo.","Di.","Mi.","Do.","Fr.","Sa."]],[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jan.","Feb.","März","Apr.","Mai","Juni","Juli","Aug.","Sept.","Okt.","Nov.","Dez."],["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"]],[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"],["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"]],[["v. Chr.","n. Chr."],u,u],1,[6,0],["dd.MM.yy","dd.MM.y","d. MMMM y","EEEE, d. MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}",u,"{1} 'um' {0}",u],[",",".",";","%","+","-","E","·","‰","∞","NaN",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"EUR","€","Euro",{"ATS":["öS"],"AUD":["AU$","$"],"BGM":["BGK"],"BGO":["BGJ"],"BYN":[u,"р."],"CUC":[u,"Cub$"],"DEM":["DM"],"FKP":[u,"Fl£"],"GHS":[u,"₵"],"GNF":[u,"F.G."],"KMF":[u,"FC"],"PHP":[u,"₱"],"RON":[u,"L"],"RUR":[u,"р."],"RWF":[u,"F.Rw"],"SYP":[],"THB":["฿"],"TWD":["NT$"],"XXX":[],"ZMW":[u,"K"]},"ltr", plural_locale_de];
export const locale_extra_de = [[["Mitternacht","morgens","vorm.","mittags","nachm.","abends","nachts"],u,["Mitternacht","morgens","vormittags","mittags","nachmittags","abends","nachts"]],[["Mitternacht","Morgen","Vorm.","Mittag","Nachm.","Abend","Nacht"],u,["Mitternacht","Morgen","Vormittag","Mittag","Nachmittag","Abend","Nacht"]],["00:00",["05:00","10:00"],["10:00","12:00"],["12:00","13:00"],["13:00","18:00"],["18:00","24:00"],["00:00","05:00"]]];




function plural_locale_de_AT(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
return 5;
}

export const locale_de_AT = ["de-AT",[["AM","PM"],u,u],[["vm.","nm."],["AM","PM"],u],[["S","M","D","M","D","F","S"],["So.","Mo.","Di.","Mi.","Do.","Fr.","Sa."],["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],["So.","Mo.","Di.","Mi.","Do.","Fr.","Sa."]],[["S","M","D","M","D","F","S"],["So","Mo","Di","Mi","Do","Fr","Sa"],["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],["So.","Mo.","Di.","Mi.","Do.","Fr.","Sa."]],[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jän.","Feb.","März","Apr.","Mai","Juni","Juli","Aug.","Sep.","Okt.","Nov.","Dez."],["Jänner","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"]],[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jän","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"],["Jänner","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"]],[["v. Chr.","n. Chr."],u,u],1,[6,0],["dd.MM.yy","dd.MM.y","d. MMMM y","EEEE, d. MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}",u,"{1} 'um' {0}",u],[","," ",";","%","+","-","E","·","‰","∞","NaN",":",u,"."],["#,##0.###","#,##0 %","¤ #,##0.00","#E0"],"EUR","€","Euro",{"ATS":["öS"],"AUD":["AU$","$"],"BGM":["BGK"],"BGO":["BGJ"],"BYN":[u,"р."],"CUC":[u,"Cub$"],"DEM":["DM"],"FKP":[u,"Fl£"],"GHS":[u,"₵"],"GNF":[u,"F.G."],"KMF":[u,"FC"],"PHP":[u,"₱"],"RON":[u,"L"],"RUR":[u,"р."],"RWF":[u,"F.Rw"],"SYP":[],"THB":["฿"],"TWD":["NT$"],"XXX":[],"ZMW":[u,"K"]},"ltr", plural_locale_de_AT];
export const locale_extra_de_AT = [[["Mitternacht","morgens","vorm.","mittags","nachm.","abends","nachts"],u,["Mitternacht","morgens","vormittags","mittags","nachmittags","abends","nachts"]],[["Mitternacht","Morgen","Vorm.","Mittag","Nachm.","Abend","Nacht"],u,["Mitternacht","Morgen","Vormittag","Mittag","Nachmittag","Abend","Nacht"]],["00:00",["05:00","10:00"],["10:00","12:00"],["12:00","13:00"],["13:00","18:00"],["18:00","24:00"],["00:00","05:00"]]];




function plural_locale_de_CH(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
return 5;
}

export const locale_de_CH = ["de-CH",[["AM","PM"],u,u],u,[["S","M","D","M","D","F","S"],["So.","Mo.","Di.","Mi.","Do.","Fr.","Sa."],["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],["So","Mo","Di","Mi","Do","Fr","Sa"]],[["S","M","D","M","D","F","S"],["So","Mo","Di","Mi","Do","Fr","Sa"],["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],["So.","Mo.","Di.","Mi.","Do.","Fr.","Sa."]],[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jan.","Feb.","März","Apr.","Mai","Juni","Juli","Aug.","Sept.","Okt.","Nov.","Dez."],["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"]],[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"],["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"]],[["v. Chr.","n. Chr."],u,u],1,[6,0],["dd.MM.yy","dd.MM.y","d. MMMM y","EEEE, d. MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}",u,"{1} 'um' {0}",u],[".","’",";","%","+","-","E","·","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤ #,##0.00;¤-#,##0.00","#E0"],"CHF","CHF","Schweizer Franken",{"ATS":["öS"],"AUD":["AU$","$"],"BGM":["BGK"],"BGO":["BGJ"],"BYN":[u,"р."],"CUC":[u,"Cub$"],"DEM":["DM"],"EUR":[],"FKP":[u,"Fl£"],"GHS":[u,"₵"],"GNF":[u,"F.G."],"KMF":[u,"FC"],"PHP":[u,"₱"],"RON":[u,"L"],"RUR":[u,"р."],"RWF":[u,"F.Rw"],"SYP":[],"THB":["฿"],"TWD":["NT$"],"XXX":[],"ZMW":[u,"K"]},"ltr", plural_locale_de_CH];
export const locale_extra_de_CH = [[["Mitternacht","morgens","vorm.","mittags","nachm.","abends","nachts"],u,["Mitternacht","morgens","vormittags","mittags","nachmittags","abends","nachts"]],[["Mitternacht","Morgen","Vorm.","Mittag","Nachm.","Abend","Nacht"],u,["Mitternacht","Morgen","Vormittag","Mittag","Nachmittag","Abend","Nacht"]],["00:00",["05:00","10:00"],["10:00","12:00"],["12:00","13:00"],["13:00","18:00"],["18:00","24:00"],["00:00","05:00"]]];




function plural_locale_el(val: number): number {
const n = val;

if (n === 1)
    return 1;
return 5;
}

export const locale_el = ["el",[["πμ","μμ"],["π.μ.","μ.μ."],u],u,[["Κ","Δ","Τ","Τ","Π","Π","Σ"],["Κυρ","Δευ","Τρί","Τετ","Πέμ","Παρ","Σάβ"],["Κυριακή","Δευτέρα","Τρίτη","Τετάρτη","Πέμπτη","Παρασκευή","Σάββατο"],["Κυ","Δε","Τρ","Τε","Πέ","Πα","Σά"]],u,[["Ι","Φ","Μ","Α","Μ","Ι","Ι","Α","Σ","Ο","Ν","Δ"],["Ιαν","Φεβ","Μαρ","Απρ","Μαΐ","Ιουν","Ιουλ","Αυγ","Σεπ","Οκτ","Νοε","Δεκ"],["Ιανουαρίου","Φεβρουαρίου","Μαρτίου","Απριλίου","Μαΐου","Ιουνίου","Ιουλίου","Αυγούστου","Σεπτεμβρίου","Οκτωβρίου","Νοεμβρίου","Δεκεμβρίου"]],[["Ι","Φ","Μ","Α","Μ","Ι","Ι","Α","Σ","Ο","Ν","Δ"],["Ιαν","Φεβ","Μάρ","Απρ","Μάι","Ιούν","Ιούλ","Αύγ","Σεπ","Οκτ","Νοέ","Δεκ"],["Ιανουάριος","Φεβρουάριος","Μάρτιος","Απρίλιος","Μάιος","Ιούνιος","Ιούλιος","Αύγουστος","Σεπτέμβριος","Οκτώβριος","Νοέμβριος","Δεκέμβριος"]],[["π.Χ.","μ.Χ."],u,["προ Χριστού","μετά Χριστόν"]],1,[6,0],["d/M/yy","d MMM y","d MMMM y","EEEE d MMMM y"],["h:mm a","h:mm:ss a","h:mm:ss a z","h:mm:ss a zzzz"],["{1}, {0}",u,"{1} - {0}",u],[",",".",";","%","+","-","e","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"EUR","€","Ευρώ",{"BYN":[u,"р."],"GRD":["Δρχ"],"JPY":["JP¥","¥"],"PHP":[u,"₱"],"THB":["฿"]},"ltr", plural_locale_el];
export const locale_extra_el = [[["πρωί","μεσημ.","απόγ.","βράδυ"],u,["το πρωί","το μεσημέρι","το απόγευμα","το βράδυ"]],[["πρωί","μεσημ.","απόγ.","βράδυ"],u,["πρωί","μεσημέρι","απόγευμα","βράδυ"]],[["04:00","12:00"],["12:00","17:00"],["17:00","20:00"],["20:00","04:00"]]];




function plural_locale_en_AU(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
return 5;
}

export const locale_en_AU = ["en-AU",[["am","pm"],u,u],u,[["Su.","M.","Tu.","W.","Th.","F.","Sa."],["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],["Su","Mon","Tu","Wed","Th","Fri","Sat"]],u,[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jan","Feb","Mar","Apr","May","June","July","Aug","Sept","Oct","Nov","Dec"],["January","February","March","April","May","June","July","August","September","October","November","December"]],[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],["January","February","March","April","May","June","July","August","September","October","November","December"]],[["B","A"],["BC","AD"],["Before Christ","Anno Domini"]],1,[6,0],["d/M/yy","d MMM y","d MMMM y","EEEE, d MMMM y"],["h:mm a","h:mm:ss a","h:mm:ss a z","h:mm:ss a zzzz"],["{1}, {0}",u,"{1} 'at' {0}",u],[".",",",";","%","+","-","e","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"AUD","$","Australian Dollar",{"AUD":["$"],"BDT":[u,"Tk"],"BRL":[u,"R$"],"CAD":[u,"$"],"CNY":[u,"¥"],"CUP":[u,"₱"],"EGP":[u,"£"],"EUR":[u,"€"],"GBP":[u,"£"],"HKD":[u,"$"],"ILS":[u,"₪"],"INR":[u,"₹"],"ISK":[u,"Kr"],"JPY":[u,"¥"],"KRW":[u,"₩"],"MXN":[u,"$"],"NZD":[u,"$"],"PHP":[u,"₱"],"PYG":[u,"Gs"],"SCR":["Rs"],"SEK":[u,"Kr"],"TWD":[u,"$"],"USD":[u,"$"],"UYU":[u,"$U"],"VND":[u,"₫"],"XAF":[],"XCD":[u,"$"],"XOF":[],"XPF":["CFP"]},"ltr", plural_locale_en_AU];
export const locale_extra_en_AU = [[["midnight","midday","morning","afternoon","evening","night"],u,["midnight","midday","in the morning","in the afternoon","in the evening","at night"]],[["midnight","midday","morning","afternoon","evening","night"],u,u],["00:00","12:00",["06:00","12:00"],["12:00","18:00"],["18:00","21:00"],["21:00","06:00"]]];




function plural_locale_en_CA(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
return 5;
}

export const locale_en_CA = ["en-CA",[["am","pm"],["a.m.","p.m."],u],[["a.m.","pm"],["a.m.","p.m."],u],[["S","M","T","W","T","F","S"],["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],["Su","Mo","Tu","We","Th","Fr","Sa"]],u,[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec"],["January","February","March","April","May","June","July","August","September","October","November","December"]],u,[["B","A"],["BC","AD"],["Before Christ","Anno Domini"]],0,[6,0],["y-MM-dd","MMM d, y","MMMM d, y","EEEE, MMMM d, y"],["h:mm a","h:mm:ss a","h:mm:ss a z","h:mm:ss a zzzz"],["{1}, {0}",u,"{1} 'at' {0}",u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"CAD","$","Canadian Dollar",{"CAD":["$"],"JPY":["JP¥","¥"],"USD":["US$","$"]},"ltr", plural_locale_en_CA];
export const locale_extra_en_CA = [[["mid","n","mor","aft","eve","night"],["midnight","noon","in the morning","in the afternoon","in the evening","at night"],u],[["mid","noon","mor","aft","eve","night"],["midnight","noon","morning","afternoon","evening","night"],u],["00:00","12:00",["06:00","12:00"],["12:00","18:00"],["18:00","21:00"],["21:00","06:00"]]];




function plural_locale_en_GB(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
return 5;
}

export const locale_en_GB = ["en-GB",[["a","p"],["am","pm"],u],[["am","pm"],u,u],[["S","M","T","W","T","F","S"],["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],["Su","Mo","Tu","We","Th","Fr","Sa"]],u,[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec"],["January","February","March","April","May","June","July","August","September","October","November","December"]],u,[["B","A"],["BC","AD"],["Before Christ","Anno Domini"]],1,[6,0],["dd/MM/y","d MMM y","d MMMM y","EEEE, d MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}",u,"{1} 'at' {0}",u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"GBP","£","British Pound",{"JPY":["JP¥","¥"],"USD":["US$","$"]},"ltr", plural_locale_en_GB];
export const locale_extra_en_GB = [[["mi","n","in the morning","in the afternoon","in the evening","at night"],["midnight","noon","in the morning","in the afternoon","in the evening","at night"],u],[["midnight","noon","morning","afternoon","evening","night"],u,u],["00:00","12:00",["06:00","12:00"],["12:00","18:00"],["18:00","21:00"],["21:00","06:00"]]];




function plural_locale_en_IE(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
return 5;
}

export const locale_en_IE = ["en-IE",[["a","p"],["am","pm"],["a.m.","p.m."]],[["am","pm"],u,u],[["S","M","T","W","T","F","S"],["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],["Su","Mo","Tu","We","Th","Fr","Sa"]],u,[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec"],["January","February","March","April","May","June","July","August","September","October","November","December"]],u,[["B","A"],["BC","AD"],["Before Christ","Anno Domini"]],1,[6,0],["dd/MM/y","d MMM y","d MMMM y","EEEE d MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}",u,"{1} 'at' {0}",u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"EUR","€","Euro",{"JPY":["JP¥","¥"],"USD":["US$","$"]},"ltr", plural_locale_en_IE];
export const locale_extra_en_IE = [[["mi","n","in the morning","in the afternoon","in the evening","at night"],["midnight","noon","in the morning","in the afternoon","in the evening","at night"],u],[["midnight","noon","morning","afternoon","evening","night"],u,u],["00:00","12:00",["06:00","12:00"],["12:00","18:00"],["18:00","21:00"],["21:00","06:00"]]];




function plural_locale_en_IN(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
return 5;
}

export const locale_en_IN = ["en-IN",[["a","p"],["am","pm"],u],[["am","pm"],u,u],[["S","M","T","W","T","F","S"],["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],["Su","Mo","Tu","We","Th","Fr","Sa"]],u,[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec"],["January","February","March","April","May","June","July","August","September","October","November","December"]],u,[["B","A"],["BC","AD"],["Before Christ","Anno Domini"]],0,[0,0],["dd/MM/yy","dd-MMM-y","d MMMM y","EEEE, d MMMM, y"],["h:mm a","h:mm:ss a","h:mm:ss a z","h:mm:ss a zzzz"],["{1}, {0}",u,"{1} 'at' {0}",u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##,##0.###","#,##,##0%","¤#,##,##0.00","#E0"],"INR","₹","Indian Rupee",{"JPY":["JP¥","¥"]},"ltr", plural_locale_en_IN];
export const locale_extra_en_IN = [[["mi","n","in the morning","in the afternoon","in the evening","at night"],["midnight","noon","in the morning","in the afternoon","in the evening","at night"],u],[["midnight","noon","morning","afternoon","evening","night"],u,u],["00:00","12:00",["06:00","12:00"],["12:00","18:00"],["18:00","21:00"],["21:00","06:00"]]];




function plural_locale_en_SG(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
return 5;
}

export const locale_en_SG = ["en-SG",[["a","p"],["am","pm"],u],[["am","pm"],u,u],[["S","M","T","W","T","F","S"],["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],["Su","Mo","Tu","We","Th","Fr","Sa"]],u,[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec"],["January","February","March","April","May","June","July","August","September","October","November","December"]],u,[["B","A"],["BC","AD"],["Before Christ","Anno Domini"]],0,[6,0],["d/M/yy","d MMM y","d MMMM y","EEEE, d MMMM y"],["h:mm a","h:mm:ss a","h:mm:ss a z","h:mm:ss a zzzz"],["{1}, {0}",u,"{1} 'at' {0}",u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"SGD","$","Singapore Dollar",{"JPY":["JP¥","¥"],"SGD":["$"],"USD":["US$","$"]},"ltr", plural_locale_en_SG];
export const locale_extra_en_SG = [[["mi","n","in the morning","in the afternoon","in the evening","at night"],["midnight","noon","in the morning","in the afternoon","in the evening","at night"],u],[["midnight","noon","morning","afternoon","evening","night"],u,u],["00:00","12:00",["06:00","12:00"],["12:00","18:00"],["18:00","21:00"],["21:00","06:00"]]];




function plural_locale_en_ZA(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
return 5;
}

export const locale_en_ZA = ["en-ZA",[["a","p"],["am","pm"],u],[["am","pm"],u,u],[["S","M","T","W","T","F","S"],["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],["Su","Mo","Tu","We","Th","Fr","Sa"]],u,[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec"],["January","February","March","April","May","June","July","August","September","October","November","December"]],u,[["B","A"],["BC","AD"],["Before Christ","Anno Domini"]],0,[6,0],["y/MM/dd","dd MMM y","dd MMMM y","EEEE, dd MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}",u,"{1} 'at' {0}",u],[","," ",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"ZAR","R","South African Rand",{"JPY":["JP¥","¥"],"USD":["US$","$"],"ZAR":["R"]},"ltr", plural_locale_en_ZA];
export const locale_extra_en_ZA = [[["mi","n","in the morning","in the afternoon","in the evening","at night"],["midnight","noon","in the morning","in the afternoon","in the evening","at night"],u],[["midnight","noon","morning","afternoon","evening","night"],u,u],["00:00","12:00",["06:00","12:00"],["12:00","18:00"],["18:00","21:00"],["21:00","06:00"]]];




function plural_locale_es(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length, e = parseInt(val.toString().replace(/^[^e]*(e([-+]?\d+))?/, '$2')) || 0;

if (n === 1)
    return 1;
if (e === 0 && (!(i === 0) && (i % 1000000 === 0 && v === 0)) || !(e >= 0 && e <= 5))
    return 4;
return 5;
}

export const locale_es = ["es",[["a. m.","p. m."],u,u],u,[["D","L","M","X","J","V","S"],["dom","lun","mar","mié","jue","vie","sáb"],["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],["DO","LU","MA","MI","JU","VI","SA"]],u,[["E","F","M","A","M","J","J","A","S","O","N","D"],["ene","feb","mar","abr","may","jun","jul","ago","sept","oct","nov","dic"],["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"]],u,[["a. C.","d. C."],u,["antes de Cristo","después de Cristo"]],1,[6,0],["d/M/yy","d MMM y","d 'de' MMMM 'de' y","EEEE, d 'de' MMMM 'de' y"],["H:mm","H:mm:ss","H:mm:ss z","H:mm:ss (zzzz)"],["{1}, {0}",u,u,u],[",",".",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"EUR","€","euro",{"AUD":[u,"$"],"BRL":[u,"R$"],"BYN":[u,"р."],"CAD":[u,"$"],"CNY":[u,"¥"],"EGP":[],"ESP":["₧"],"GBP":[u,"£"],"HKD":[u,"$"],"ILS":[u,"₪"],"INR":[u,"₹"],"JPY":[u,"¥"],"KRW":[u,"₩"],"MXN":[u,"$"],"NZD":[u,"$"],"PHP":[u,"₱"],"RON":[u,"L"],"THB":["฿"],"TWD":[u,"NT$"],"USD":["US$","$"],"XAF":[],"XCD":[u,"$"],"XOF":[]},"ltr", plural_locale_es];
export const locale_extra_es = [[["del mediodía","de la madrugada","de la mañana","de la tarde","de la noche"],u,u],[["mediodía","madrugada","mañana","tarde","noche"],u,u],["12:00",["00:00","06:00"],["06:00","12:00"],["12:00","20:00"],["20:00","24:00"]]];




function plural_locale_es_419(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length, e = parseInt(val.toString().replace(/^[^e]*(e([-+]?\d+))?/, '$2')) || 0;

if (n === 1)
    return 1;
if (e === 0 && (!(i === 0) && (i % 1000000 === 0 && v === 0)) || !(e >= 0 && e <= 5))
    return 4;
return 5;
}

export const locale_es_419 = ["es-419",[["a. m.","p. m."],u,u],u,[["d","l","m","m","j","v","s"],["dom","lun","mar","mié","jue","vie","sáb"],["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],["DO","LU","MA","MI","JU","VI","SA"]],[["D","L","M","M","J","V","S"],["dom","lun","mar","mié","jue","vie","sáb"],["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],["DO","LU","MA","MI","JU","VI","SA"]],[["E","F","M","A","M","J","J","A","S","O","N","D"],["ene","feb","mar","abr","may","jun","jul","ago","sept","oct","nov","dic"],["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"]],u,[["a. C.","d. C."],u,["antes de Cristo","después de Cristo"]],1,[6,0],["d/M/yy","d MMM y","d 'de' MMMM 'de' y","EEEE, d 'de' MMMM 'de' y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}","{1} {0}","{1}, {0}",u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","¤#,##0.00","#E0"],"EUR","EUR","euro",{"AUD":[u,"$"],"BRL":[u,"R$"],"BYN":[u,"р."],"CAD":[u,"$"],"CNY":[u,"¥"],"ESP":["₧"],"EUR":[u,"€"],"FKP":[u,"FK£"],"GBP":[u,"£"],"HKD":[u,"$"],"ILS":[u,"₪"],"INR":[u,"₹"],"JPY":[u,"¥"],"KRW":[u,"₩"],"MXN":[u,"$"],"NZD":[u,"$"],"PHP":[u,"₱"],"RON":[u,"L"],"SSP":[u,"SD£"],"SYP":[u,"S£"],"TWD":[u,"NT$"],"USD":[u,"$"],"VEF":[u,"BsF"],"VND":[u,"₫"],"XAF":[],"XCD":[u,"$"],"XOF":[]},"ltr", plural_locale_es_419];
export const locale_extra_es_419 = [[["del mediodía","de la madrugada","de la mañana","de la tarde","de la noche"],u,u],[["mediodía","madrugada","mañana","tarde","noche"],u,u],["12:00",["00:00","06:00"],["06:00","12:00"],["12:00","20:00"],["20:00","24:00"]]];




function plural_locale_es_MX(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length, e = parseInt(val.toString().replace(/^[^e]*(e([-+]?\d+))?/, '$2')) || 0;

if (n === 1)
    return 1;
if (e === 0 && (!(i === 0) && (i % 1000000 === 0 && v === 0)) || !(e >= 0 && e <= 5))
    return 4;
return 5;
}

export const locale_es_MX = ["es-MX",[["a. m.","p. m."],u,u],u,[["D","L","M","M","J","V","S"],["dom","lun","mar","mié","jue","vie","sáb"],["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],["DO","LU","MA","MI","JU","VI","SA"]],u,[["E","F","M","A","M","J","J","A","S","O","N","D"],["ene","feb","mar","abr","may","jun","jul","ago","sept","oct","nov","dic"],["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"]],u,[["a. C.","d. C."],u,["antes de Cristo","después de Cristo"]],0,[6,0],["dd/MM/yy","d MMM y","d 'de' MMMM 'de' y","EEEE, d 'de' MMMM 'de' y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}","{1} {0}","{1}, {0}",u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","¤#,##0.00","#E0"],"MXN","$","peso mexicano",{"AUD":[u,"$"],"BRL":[u,"R$"],"BYN":[u,"p."],"CAD":[u,"$"],"CNY":[u,"¥"],"ESP":["₧"],"EUR":[u,"€"],"GBP":[u,"£"],"HKD":[u,"$"],"ILS":[u,"₪"],"INR":[u,"₹"],"JPY":[u,"¥"],"KRW":[u,"₩"],"MRO":["MRU"],"MRU":["UM"],"MXN":["$"],"NZD":[u,"$"],"PHP":[u,"₱"],"TWD":[u,"NT$"],"USD":[u,"$"],"VND":[u,"₫"],"XAF":[],"XCD":[u,"$"],"XOF":[]},"ltr", plural_locale_es_MX];
export const locale_extra_es_MX = [[["del mediodía","de la madrugada","mañana","de la tarde","de la noche"],["del mediodía","de la madrugada","de la mañana","de la tarde","de la noche"],u],[["mediodía","madrugada","mañana","tarde","noche"],u,u],["12:00",["00:00","06:00"],["06:00","12:00"],["12:00","20:00"],["20:00","24:00"]]];




function plural_locale_es_US(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length, e = parseInt(val.toString().replace(/^[^e]*(e([-+]?\d+))?/, '$2')) || 0;

if (n === 1)
    return 1;
if (e === 0 && (!(i === 0) && (i % 1000000 === 0 && v === 0)) || !(e >= 0 && e <= 5))
    return 4;
return 5;
}

export const locale_es_US = ["es-US",[["a. m.","p. m."],u,u],u,[["D","L","M","M","J","V","S"],["dom","lun","mar","mié","jue","vie","sáb"],["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],["DO","LU","MA","MI","JU","VI","SA"]],u,[["E","F","M","A","M","J","J","A","S","O","N","D"],["ene","feb","mar","abr","may","jun","jul","ago","sept","oct","nov","dic"],["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"]],u,[["a. C.","d. C."],u,["antes de Cristo","después de Cristo"]],0,[6,0],["d/M/y","d MMM y","d 'de' MMMM 'de' y","EEEE, d 'de' MMMM 'de' y"],["h:mm a","h:mm:ss a","h:mm:ss a z","h:mm:ss a zzzz"],["{1}, {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","¤#,##0.00","#E0"],"USD","$","dólar estadounidense",{"AUD":[u,"$"],"BRL":[u,"R$"],"BYN":[u,"р."],"CAD":[u,"$"],"CNY":[u,"¥"],"ESP":["₧"],"EUR":[u,"€"],"GBP":[u,"£"],"HKD":[u,"$"],"ILS":[u,"₪"],"INR":[u,"₹"],"KRW":[u,"₩"],"MXN":[u,"$"],"NZD":[u,"$"],"PHP":[u,"₱"],"TWD":[u,"NT$"],"VND":[u,"₫"],"XAF":[],"XCD":[u,"$"],"XOF":[]},"ltr", plural_locale_es_US];
export const locale_extra_es_US = [[["del mediodía","de la madrugada","de la mañana","de la tarde","de la noche"],u,u],[["mediodía","madrugada","mañana","tarde","noche"],u,u],["12:00",["00:00","06:00"],["06:00","12:00"],["12:00","20:00"],["20:00","24:00"]]];




function plural_locale_et(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
return 5;
}

export const locale_et = ["et",[["AM","PM"],u,u],u,[["P","E","T","K","N","R","L"],u,["Pühapäev","Esmaspäev","Teisipäev","Kolmapäev","Neljapäev","Reede","Laupäev"],["P","E","T","K","N","R","L"]],u,[["J","V","M","A","M","J","J","A","S","O","N","D"],["jaan","veebr","märts","apr","mai","juuni","juuli","aug","sept","okt","nov","dets"],["jaanuar","veebruar","märts","aprill","mai","juuni","juuli","august","september","oktoober","november","detsember"]],u,[["eKr","pKr"],u,["enne Kristust","pärast Kristust"]],1,[6,0],["dd.MM.yy","d. MMM y","d. MMMM y","EEEE, d. MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,u,u],[","," ",";","%","+","−","×10^","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"EUR","€","euro",{"AUD":["AU$","$"],"EEK":["kr"],"PHP":[u,"₱"],"THB":["฿"],"TWD":["NT$"]},"ltr", plural_locale_et];
export const locale_extra_et = [[["keskööl","keskpäeval","hommikul","pärastlõunal","õhtul","öösel"],u,u],[["kesköö","keskpäev","hommik","pärastlõuna","õhtu","öö"],u,u],["00:00","12:00",["05:00","12:00"],["12:00","18:00"],["18:00","23:00"],["23:00","05:00"]]];




function plural_locale_eu(val: number): number {
const n = val;

if (n === 1)
    return 1;
return 5;
}

export const locale_eu = ["eu",[["g","a"],["AM","PM"],u],[["AM","PM"],u,u],[["I","A","A","A","O","O","L"],["ig.","al.","ar.","az.","og.","or.","lr."],["igandea","astelehena","asteartea","asteazkena","osteguna","ostirala","larunbata"],["ig.","al.","ar.","az.","og.","or.","lr."]],u,[["U","O","M","A","M","E","U","A","I","U","A","A"],["urt.","ots.","mar.","api.","mai.","eka.","uzt.","abu.","ira.","urr.","aza.","abe."],["urtarrilak","otsailak","martxoak","apirilak","maiatzak","ekainak","uztailak","abuztuak","irailak","urriak","azaroak","abenduak"]],[["U","O","M","A","M","E","U","A","I","U","A","A"],["urt.","ots.","mar.","api.","mai.","eka.","uzt.","abu.","ira.","urr.","aza.","abe."],["urtarrila","otsaila","martxoa","apirila","maiatza","ekaina","uztaila","abuztua","iraila","urria","azaroa","abendua"]],[["a","o"],["K.a.","K.o."],["K.a.","Kristo ondoren"]],1,[6,0],["yy/M/d","y('e')'ko' MMM d('a')","y('e')'ko' MMMM'ren' d('a')","y('e')'ko' MMMM'ren' d('a'), EEEE"],["HH:mm","HH:mm:ss","HH:mm:ss (z)","HH:mm:ss (zzzz)"],["{1} {0}",u,u,u],[",",".",";","%","+","−","E","×","‰","∞","NaN",":"],["#,##0.###","% #,##0","#,##0.00 ¤","#E0"],"EUR","€","euroa",{"BYN":[u,"р."],"ESP":["₧"],"JPY":["JP¥","¥"],"PHP":[u,"₱"],"THB":["฿"],"TWD":["NT$"],"USD":["US$","$"]},"ltr", plural_locale_eu];
export const locale_extra_eu = [[["gauerdia","goizald.","goizeko","eguerd.","arrats.","iluntz.","gaueko"],u,["gauerdia","goizaldeko","goizeko","eguerdiko","arratsaldeko","iluntzeko","gaueko"]],[["gauerdia","goizald.","goiza","eguerd.","arrats.","iluntz.","gaua"],["gauerdia","goiz.","goiza","eguerd.","arrats.","iluntz.","gaua"],["gauerdia","goizaldea","goiza","eguerdia","arratsaldea","iluntzea","gaua"]],["00:00",["00:00","06:00"],["06:00","12:00"],["12:00","14:00"],["14:00","19:00"],["19:00","21:00"],["21:00","24:00"]]];




function plural_locale_fa(val: number): number {
const n = val, i = Math.floor(Math.abs(val));

if (i === 0 || n === 1)
    return 1;
return 5;
}

export const locale_fa = ["fa",[["ق","ب"],["ق.ظ.","ب.ظ."],["قبل‌ازظهر","بعدازظهر"]],u,[["ی","د","س","چ","پ","ج","ش"],["یکشنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنجشنبه","جمعه","شنبه"],u,["۱ش","۲ش","۳ش","۴ش","۵ش","ج","ش"]],u,[["ژ","ف","م","آ","م","ژ","ژ","ا","س","ا","ن","د"],["ژانویه","فوریه","مارس","آوریل","مه","ژوئن","ژوئیه","اوت","سپتامبر","اکتبر","نوامبر","دسامبر"],["ژانویهٔ","فوریهٔ","مارس","آوریل","مهٔ","ژوئن","ژوئیهٔ","اوت","سپتامبر","اکتبر","نوامبر","دسامبر"]],[["ژ","ف","م","آ","م","ژ","ژ","ا","س","ا","ن","د"],["ژانویه","فوریه","مارس","آوریل","مه","ژوئن","ژوئیه","اوت","سپتامبر","اکتبر","نوامبر","دسامبر"],u],[["ق","م"],["ق.م.","م."],["قبل از میلاد","میلادی"]],6,[5,5],["y/M/d","d MMM y","d MMMM y","EEEE d MMMM y"],["H:mm","H:mm:ss","H:mm:ss (z)","H:mm:ss (zzzz)"],["{1}،‏ {0}",u,"{1}، ساعت {0}",u],[".",",",";","%","‎+","‎−","E","×","‰","∞","ناعدد",":"],["#,##0.###","#,##0%","‎¤ #,##0.00","#E0"],"IRR","ریال","ریال ایران",{"AFN":["؋"],"BYN":[u,"р."],"CAD":["$CA","$"],"CNY":["¥CN","¥"],"HKD":["$HK","$"],"IRR":["ریال"],"MXN":["$MX","$"],"NZD":["$NZ","$"],"PHP":[u,"₱"],"THB":["฿"],"XCD":["$EC","$"],"XOF":["فرانک CFA"]},"rtl", plural_locale_fa];
export const locale_extra_fa = [[["ب","ص","ظ","ع","ش","ن"],["بامداد","صبح","ظهر","عصر","شب","نیمه‌شب"],["بامداد","صبح","بعدازظهر","عصر","شب","نیمه‌شب"]],[["ب","ص","ظ","ع","ش","ن"],["بامداد","صبح","ظهر","عصر","شب","نیمه‌شب"],u],[["01:00","04:00"],["04:00","12:00"],["12:00","13:00"],["13:00","19:00"],["19:00","24:00"],["00:00","01:00"]]];




function plural_locale_fi(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
return 5;
}

export const locale_fi = ["fi",[["ap.","ip."],u,u],u,[["S","M","T","K","T","P","L"],["su","ma","ti","ke","to","pe","la"],["sunnuntaina","maanantaina","tiistaina","keskiviikkona","torstaina","perjantaina","lauantaina"],["su","ma","ti","ke","to","pe","la"]],[["S","M","T","K","T","P","L"],["su","ma","ti","ke","to","pe","la"],["sunnuntai","maanantai","tiistai","keskiviikko","torstai","perjantai","lauantai"],["su","ma","ti","ke","to","pe","la"]],[["T","H","M","H","T","K","H","E","S","L","M","J"],["tammik.","helmik.","maalisk.","huhtik.","toukok.","kesäk.","heinäk.","elok.","syysk.","lokak.","marrask.","jouluk."],["tammikuuta","helmikuuta","maaliskuuta","huhtikuuta","toukokuuta","kesäkuuta","heinäkuuta","elokuuta","syyskuuta","lokakuuta","marraskuuta","joulukuuta"]],[["T","H","M","H","T","K","H","E","S","L","M","J"],["tammi","helmi","maalis","huhti","touko","kesä","heinä","elo","syys","loka","marras","joulu"],["tammikuu","helmikuu","maaliskuu","huhtikuu","toukokuu","kesäkuu","heinäkuu","elokuu","syyskuu","lokakuu","marraskuu","joulukuu"]],[["eKr","jKr"],["eKr.","jKr."],["ennen Kristuksen syntymää","jälkeen Kristuksen syntymän"]],1,[6,0],["d.M.y",u,"d. MMMM y","cccc d. MMMM y"],["H.mm","H.mm.ss","H.mm.ss z","H.mm.ss zzzz"],["{1} {0}","{1} 'klo' {0}",u,u],[","," ",";","%","+","−","E","×","‰","∞","epäluku","."],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"EUR","€","euro",{"AOA":[],"ARS":[],"AUD":[],"BAM":[],"BBD":[],"BDT":[],"BMD":[],"BND":[],"BOB":[],"BRL":[],"BSD":[],"BWP":[],"BZD":[],"CAD":[],"CLP":[],"CNY":[],"COP":[],"CRC":[],"CUC":[],"CUP":[],"CZK":[],"DKK":[],"DOP":[],"EGP":[],"ESP":[],"FIM":["mk"],"FJD":[],"FKP":[],"GEL":[],"GIP":[],"GNF":[],"GTQ":[],"GYD":[],"HKD":[],"HNL":[],"HRK":[],"HUF":[],"IDR":[],"ILS":[],"INR":[],"ISK":[],"JMD":[],"KHR":[],"KMF":[],"KPW":[],"KRW":[],"KYD":[],"KZT":[],"LAK":[],"LBP":[],"LKR":[],"LRD":[],"LTL":[],"LVL":[],"MGA":[],"MMK":[],"MNT":[],"MUR":[],"MXN":[],"MYR":[],"NAD":[],"NGN":[],"NIO":[],"NOK":[],"NPR":[],"NZD":[],"PHP":[],"PKR":[],"PLN":[],"PYG":[],"RON":[],"RWF":[],"SBD":[],"SEK":[],"SGD":[],"SHP":[],"SRD":[],"SSP":[],"STN":[u,"STD"],"SYP":[],"THB":[],"TOP":[],"TRY":[],"TTD":[],"TWD":[],"UAH":[],"UYU":[],"VEF":[],"VND":[],"XCD":[],"XPF":[],"XXX":[],"ZAR":[],"ZMW":[]},"ltr", plural_locale_fi];
export const locale_extra_fi = [[["ky.","kp.","aamulla","ap.","ip.","illalla","yöllä"],["keskiyöllä","keskip.","aamulla","aamup.","iltap.","illalla","yöllä"],["keskiyöllä","keskipäivällä","aamulla","aamupäivällä","iltapäivällä","illalla","yöllä"]],[["ky.","kp.","aamu","ap.","ip.","ilta","yö"],["keskiyö","keskip.","aamu","aamup.","iltap.","ilta","yö"],["keskiyö","keskipäivä","aamu","aamupäivä","iltapäivä","ilta","yö"]],["00:00","12:00",["05:00","10:00"],["10:00","12:00"],["12:00","18:00"],["18:00","23:00"],["23:00","05:00"]]];




function plural_locale_fr(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length, e = parseInt(val.toString().replace(/^[^e]*(e([-+]?\d+))?/, '$2')) || 0;

if (i === 0 || i === 1)
    return 1;
if (e === 0 && (!(i === 0) && (i % 1000000 === 0 && v === 0)) || !(e >= 0 && e <= 5))
    return 4;
return 5;
}

export const locale_fr = ["fr",[["AM","PM"],u,u],u,[["D","L","M","M","J","V","S"],["dim.","lun.","mar.","mer.","jeu.","ven.","sam."],["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],["di","lu","ma","me","je","ve","sa"]],u,[["J","F","M","A","M","J","J","A","S","O","N","D"],["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."],["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"]],u,[["av. J.-C.","ap. J.-C."],u,["avant Jésus-Christ","après Jésus-Christ"]],1,[6,0],["dd/MM/y","d MMM y","d MMMM y","EEEE d MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}","{1}, {0}","{1} 'à' {0}",u],[","," ",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"EUR","€","euro",{"ARS":["$AR","$"],"AUD":["$AU","$"],"BEF":["FB"],"BMD":["$BM","$"],"BND":["$BN","$"],"BYN":[u,"р."],"BZD":["$BZ","$"],"CAD":["$CA","$"],"CLP":["$CL","$"],"CNY":[u,"¥"],"COP":["$CO","$"],"CYP":["£CY"],"EGP":[u,"£E"],"FJD":["$FJ","$"],"FKP":["£FK","£"],"FRF":["F"],"GBP":["£GB","£"],"GIP":["£GI","£"],"HKD":[u,"$"],"IEP":["£IE"],"ILP":["£IL"],"ITL":["₤IT"],"JPY":[u,"¥"],"KMF":[u,"FC"],"LBP":["£LB","£L"],"MTP":["£MT"],"MXN":["$MX","$"],"NAD":["$NA","$"],"NIO":[u,"$C"],"NZD":["$NZ","$"],"PHP":[u,"₱"],"RHD":["$RH"],"RON":[u,"L"],"RWF":[u,"FR"],"SBD":["$SB","$"],"SGD":["$SG","$"],"SRD":["$SR","$"],"TOP":[u,"$T"],"TTD":["$TT","$"],"TWD":[u,"NT$"],"USD":["$US","$"],"UYU":["$UY","$"],"WST":["$WS"],"XCD":[u,"$"],"XPF":["FCFP"],"ZMW":[u,"Kw"]},"ltr", plural_locale_fr];
export const locale_extra_fr = [[["minuit","midi","mat.","ap.m.","soir","nuit"],u,["minuit","midi","du matin","de l’après-midi","du soir","du matin"]],[["minuit","midi","mat.","ap.m.","soir","nuit"],u,["minuit","midi","matin","après-midi","soir","nuit"]],["00:00","12:00",["04:00","12:00"],["12:00","18:00"],["18:00","24:00"],["00:00","04:00"]]];




function plural_locale_fr_CA(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length, e = parseInt(val.toString().replace(/^[^e]*(e([-+]?\d+))?/, '$2')) || 0;

if (i === 0 || i === 1)
    return 1;
if (e === 0 && (!(i === 0) && (i % 1000000 === 0 && v === 0)) || !(e >= 0 && e <= 5))
    return 4;
return 5;
}

export const locale_fr_CA = ["fr-CA",[["a","p"],["a.m.","p.m."],u],[["a.m.","p.m."],u,u],[["D","L","M","M","J","V","S"],["dim.","lun.","mar.","mer.","jeu.","ven.","sam."],["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],["di","lu","ma","me","je","ve","sa"]],u,[["J","F","M","A","M","J","J","A","S","O","N","D"],["janv.","févr.","mars","avr.","mai","juin","juill.","août","sept.","oct.","nov.","déc."],["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"]],u,[["av. J.-C.","ap. J.-C."],u,["avant Jésus-Christ","après Jésus-Christ"]],0,[6,0],["y-MM-dd","d MMM y","d MMMM y","EEEE d MMMM y"],["HH 'h' mm","HH 'h' mm 'min' ss 's'","HH 'h' mm 'min' ss 's' z","HH 'h' mm 'min' ss 's' zzzz"],["{1} {0}","{1}, {0}","{1} 'à' {0}",u],[","," ",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"CAD","$","dollar canadien",{"AUD":["$ AU","$"],"BEF":["FB"],"BYN":[u,"Br"],"CAD":["$"],"CYP":["£CY"],"EGP":[u,"£E"],"FRF":["F"],"GEL":[],"HKD":["$ HK","$"],"IEP":["£IE"],"ILP":["£IL"],"ILS":[u,"₪"],"INR":[u,"₹"],"ITL":["₤IT"],"KRW":[u,"₩"],"LBP":[u,"£L"],"MTP":["£MT"],"MXN":[u,"$"],"NZD":["$ NZ","$"],"PHP":[u,"₱"],"RHD":["$RH"],"RON":[u,"L"],"RWF":[u,"FR"],"SGD":["$ SG","$"],"TOP":[u,"$T"],"TWD":[u,"NT$"],"USD":["$ US","$"],"VND":[u,"₫"],"XAF":[],"XCD":[u,"$"],"XOF":[],"XPF":[]},"ltr", plural_locale_fr_CA];
export const locale_extra_fr_CA = [[["minuit","midi","mat.","après-midi","soir","mat."],["minuit","midi","du mat.","après-midi","du soir","du mat."],["minuit","midi","du matin","de l’après-midi","du soir","du matin"]],[["minuit","midi","mat.","après-midi","soir","mat."],["minuit","midi","mat.","après-midi","soir","nuit"],["minuit","midi","matin","après-midi","soir","nuit"]],["00:00","12:00",["04:00","12:00"],["12:00","18:00"],["18:00","24:00"],["00:00","04:00"]]];




function plural_locale_ga(val: number): number {
const n = val;

if (n === 1)
    return 1;
if (n === 2)
    return 2;
if (n === Math.floor(n) && (n >= 3 && n <= 6))
    return 3;
if (n === Math.floor(n) && (n >= 7 && n <= 10))
    return 4;
return 5;
}

export const locale_ga = ["ga",[["r.n.","i.n."],u,u],u,[["D","L","M","C","D","A","S"],["Domh","Luan","Máirt","Céad","Déar","Aoine","Sath"],["Dé Domhnaigh","Dé Luain","Dé Máirt","Dé Céadaoin","Déardaoin","Dé hAoine","Dé Sathairn"],["Do","Lu","Má","Cé","Dé","Ao","Sa"]],u,[["E","F","M","A","B","M","I","L","M","D","S","N"],["Ean","Feabh","Márta","Aib","Beal","Meith","Iúil","Lún","MFómh","DFómh","Samh","Noll"],["Eanáir","Feabhra","Márta","Aibreán","Bealtaine","Meitheamh","Iúil","Lúnasa","Meán Fómhair","Deireadh Fómhair","Samhain","Nollaig"]],u,[["RC","AD"],u,["Roimh Chríost","Anno Domini"]],1,[6,0],["dd/MM/y","d MMM y","d MMMM y","EEEE d MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","Nuimh",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"EUR","€","Euro",{"RUR":[u,"р."],"THB":["฿"],"TWD":["NT$"],"XXX":[]},"ltr", plural_locale_ga];
export const locale_extra_ga = [];




function plural_locale_gl(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
return 5;
}

export const locale_gl = ["gl",[["a.m.","p.m."],u,u],u,[["d.","l.","m.","m.","x.","v.","s."],["dom.","luns","mar.","mér.","xov.","ven.","sáb."],["domingo","luns","martes","mércores","xoves","venres","sábado"],["do.","lu.","ma.","mé.","xo.","ve.","sá."]],[["D","L","M","M","X","V","S"],["Dom.","Luns","Mar.","Mér.","Xov.","Ven.","Sáb."],["Domingo","Luns","Martes","Mércores","Xoves","Venres","Sábado"],["Do","Lu","Ma","Mé","Xo","Ve","Sá"]],[["x.","f.","m.","a.","m.","x.","x.","a.","s.","o.","n.","d."],["xan.","feb.","mar.","abr.","maio","xuño","xul.","ago.","set.","out.","nov.","dec."],["xaneiro","febreiro","marzo","abril","maio","xuño","xullo","agosto","setembro","outubro","novembro","decembro"]],[["X","F","M","A","M","X","X","A","S","O","N","D"],["Xan.","Feb.","Mar.","Abr.","Maio","Xuño","Xul.","Ago.","Set.","Out.","Nov.","Dec."],["Xaneiro","Febreiro","Marzo","Abril","Maio","Xuño","Xullo","Agosto","Setembro","Outubro","Novembro","Decembro"]],[["a.C.","d.C."],u,["antes de Cristo","despois de Cristo"]],1,[6,0],["dd/MM/yy","d 'de' MMM 'de' y","d 'de' MMMM 'de' y","EEEE, d 'de' MMMM 'de' y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{0}, {1}",u,"{0} 'do' {1}",u],[",",".",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"EUR","€","euro",{"BYN":[u,"Br"],"ESP":["₧"],"JPY":["JP¥","¥"],"KMF":[u,"FC"],"MXN":["$MX","$"],"PHP":[u,"₱"],"RUB":[u,"руб"],"THB":["฿"],"TWD":["NT$"],"XCD":[u,"$"]},"ltr", plural_locale_gl];
export const locale_extra_gl = [[["da noite","da madrugada","da mañá","do mediodía","da tarde","da noite"],u,u],[["medianoite","madrugada","mañá","mediodía","tarde","noite"],u,u],["00:00",["00:00","06:00"],["06:00","12:00"],["12:00","13:00"],["13:00","21:00"],["21:00","24:00"]]];




function plural_locale_gsw(val: number): number {
const n = val;

if (n === 1)
    return 1;
return 5;
}

export const locale_gsw = ["gsw",[["vorm.","nam."],u,["am Vormittag","am Namittag"]],[["vorm.","nam."],u,["Vormittag","Namittag"]],[["S","M","D","M","D","F","S"],["Su.","Mä.","Zi.","Mi.","Du.","Fr.","Sa."],["Sunntig","Määntig","Ziischtig","Mittwuch","Dunschtig","Friitig","Samschtig"],["Su.","Mä.","Zi.","Mi.","Du.","Fr.","Sa."]],u,[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"],["Januar","Februar","März","April","Mai","Juni","Juli","Auguscht","Septämber","Oktoober","Novämber","Dezämber"]],u,[["v. Chr.","n. Chr."],u,u],1,[6,0],["dd.MM.yy","dd.MM.y","d. MMMM y","EEEE, d. MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,u,u],[".","’",";","%","+","−","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"CHF","CHF","Schwiizer Franke",{"ATS":["öS"]},"ltr", plural_locale_gsw];
export const locale_extra_gsw = [[["Mitternacht","am Morge","zmittag","am Namittag","zaabig","znacht"],u,u],[["Mitternacht","am Morge","zmittag","am Namittag","zaabig","znacht"],u,["Mitternacht","Morge","Mittag","Namittag","Aabig","Nacht"]],["00:00",["05:00","12:00"],["12:00","14:00"],["14:00","18:00"],["18:00","24:00"],["00:00","05:00"]]];




function plural_locale_gu(val: number): number {
const n = val, i = Math.floor(Math.abs(val));

if (i === 0 || n === 1)
    return 1;
return 5;
}

export const locale_gu = ["gu",[["AM","PM"],u,u],u,[["ર","સો","મં","બુ","ગુ","શુ","શ"],["રવિ","સોમ","મંગળ","બુધ","ગુરુ","શુક્ર","શનિ"],["રવિવાર","સોમવાર","મંગળવાર","બુધવાર","ગુરુવાર","શુક્રવાર","શનિવાર"],["ર","સો","મં","બુ","ગુ","શુ","શ"]],u,[["જા","ફે","મા","એ","મે","જૂ","જુ","ઑ","સ","ઑ","ન","ડિ"],["જાન્યુ","ફેબ્રુ","માર્ચ","એપ્રિલ","મે","જૂન","જુલાઈ","ઑગસ્ટ","સપ્ટે","ઑક્ટો","નવે","ડિસે"],["જાન્યુઆરી","ફેબ્રુઆરી","માર્ચ","એપ્રિલ","મે","જૂન","જુલાઈ","ઑગસ્ટ","સપ્ટેમ્બર","ઑક્ટોબર","નવેમ્બર","ડિસેમ્બર"]],u,[["ઇ સ પુ","ઇસ"],["ઈ.સ.પૂર્વે","ઈ.સ."],["ઈસવીસન પૂર્વે","ઇસવીસન"]],0,[0,0],["d/M/yy","d MMM, y","d MMMM, y","EEEE, d MMMM, y"],["hh:mm a","hh:mm:ss a","hh:mm:ss a z","hh:mm:ss a zzzz"],["{1} {0}",u,"{1} એ {0} વાગ્યે",u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##,##0.###","#,##,##0%","¤#,##,##0.00","[#E0]"],"INR","₹","ભારતીય રૂપિયા",{"BYN":[u,"р."],"JPY":["JP¥","¥"],"MUR":[u,"રૂ."],"PHP":[u,"₱"],"THB":["฿"],"TWD":["NT$"],"USD":["US$","$"]},"ltr", plural_locale_gu];
export const locale_extra_gu = [[["મ.રાત્રિ","સવારે","બપોરે","સાંજે","રાત્રે"],["મધ્યરાત્રિ","સવારે","બપોરે","સાંજે","રાત્રે"],u],[["મધ્યરાત્રિ","સવારે","બપોરે","સાંજે","રાત્રે"],u,["મધ્યરાત્રિ","સવાર","બપોર","સાંજ","રાત્રિ"]],["00:00",["04:00","12:00"],["12:00","16:00"],["16:00","20:00"],["20:00","04:00"]]];




function plural_locale_haw(val: number): number {
const n = val;

if (n === 1)
    return 1;
return 5;
}

export const locale_haw = ["haw",[["AM","PM"],u,u],u,[["S","M","T","W","T","F","S"],["LP","P1","P2","P3","P4","P5","P6"],["Lāpule","Poʻakahi","Poʻalua","Poʻakolu","Poʻahā","Poʻalima","Poʻaono"],["LP","P1","P2","P3","P4","P5","P6"]],u,[["1","2","3","4","5","6","7","8","9","10","11","12"],["Ian.","Pep.","Mal.","ʻAp.","Mei","Iun.","Iul.","ʻAu.","Kep.","ʻOk.","Now.","Kek."],["Ianuali","Pepeluali","Malaki","ʻApelila","Mei","Iune","Iulai","ʻAukake","Kepakemapa","ʻOkakopa","Nowemapa","Kekemapa"]],u,[["BCE","CE"],u,u],0,[6,0],["d/M/yy","d MMM y","d MMMM y","EEEE, d MMMM y"],["h:mm a","h:mm:ss a","h:mm:ss a z","h:mm:ss a zzzz"],["{1} {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"USD","$","USD",{"JPY":["JP¥","¥"]},"ltr", plural_locale_haw];
export const locale_extra_haw = [];




function plural_locale_hi(val: number): number {
const n = val, i = Math.floor(Math.abs(val));

if (i === 0 || n === 1)
    return 1;
return 5;
}

export const locale_hi = ["hi",[["am","pm"],u,u],u,[["र","सो","मं","बु","गु","शु","श"],["रवि","सोम","मंगल","बुध","गुरु","शुक्र","शनि"],["रविवार","सोमवार","मंगलवार","बुधवार","गुरुवार","शुक्रवार","शनिवार"],["र","सो","मं","बु","गु","शु","श"]],u,[["ज","फ़","मा","अ","म","जू","जु","अ","सि","अ","न","दि"],["जन॰","फ़र॰","मार्च","अप्रैल","मई","जून","जुल॰","अग॰","सित॰","अक्तू॰","नव॰","दिस॰"],["जनवरी","फ़रवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्तूबर","नवंबर","दिसंबर"]],u,[["ईसा-पूर्व","ईस्वी"],u,["ईसा-पूर्व","ईसवी सन"]],0,[0,0],["d/M/yy","d MMM y","d MMMM y","EEEE, d MMMM y"],["h:mm a","h:mm:ss a","h:mm:ss a z","h:mm:ss a zzzz"],["{1}, {0}",u,"{1} को {0}",u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##,##0.###","#,##,##0%","¤#,##,##0.00","[#E0]"],"INR","₹","भारतीय रुपया",{"BYN":[u,"р."],"JPY":["JP¥","¥"],"PHP":[u,"₱"],"RON":[u,"लेई"],"THB":["฿"],"TWD":["NT$"]},"ltr", plural_locale_hi];
export const locale_extra_hi = [[["मध्यरात्रि","सुबह","दोपहर","शाम","रात"],u,u],[["आधी रात","सुबह","दोपहर","शाम","रात"],["मध्यरात्रि","सुबह","दोपहर","शाम","रात"],u],["00:00",["04:00","12:00"],["12:00","16:00"],["16:00","20:00"],["20:00","04:00"]]];




function plural_locale_hr(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length, f = parseInt(val.toString().replace(/^[^.]*\.?/, ''), 10) || 0;

if (v === 0 && (i % 10 === 1 && !(i % 100 === 11)) || f % 10 === 1 && !(f % 100 === 11))
    return 1;
if (v === 0 && (i % 10 === Math.floor(i % 10) && (i % 10 >= 2 && i % 10 <= 4) && !(i % 100 >= 12 && i % 100 <= 14)) || f % 10 === Math.floor(f % 10) && (f % 10 >= 2 && f % 10 <= 4) && !(f % 100 >= 12 && f % 100 <= 14))
    return 3;
return 5;
}

export const locale_hr = ["hr",[["AM","PM"],u,u],u,[["N","P","U","S","Č","P","S"],["ned","pon","uto","sri","čet","pet","sub"],["nedjelja","ponedjeljak","utorak","srijeda","četvrtak","petak","subota"],["ned","pon","uto","sri","čet","pet","sub"]],[["n","p","u","s","č","p","s"],["ned","pon","uto","sri","čet","pet","sub"],["nedjelja","ponedjeljak","utorak","srijeda","četvrtak","petak","subota"],["ned","pon","uto","sri","čet","pet","sub"]],[["1.","2.","3.","4.","5.","6.","7.","8.","9.","10.","11.","12."],["sij","velj","ožu","tra","svi","lip","srp","kol","ruj","lis","stu","pro"],["siječnja","veljače","ožujka","travnja","svibnja","lipnja","srpnja","kolovoza","rujna","listopada","studenoga","prosinca"]],[["1.","2.","3.","4.","5.","6.","7.","8.","9.","10.","11.","12."],["sij","velj","ožu","tra","svi","lip","srp","kol","ruj","lis","stu","pro"],["siječanj","veljača","ožujak","travanj","svibanj","lipanj","srpanj","kolovoz","rujan","listopad","studeni","prosinac"]],[["pr.n.e.","AD"],["pr. Kr.","po. Kr."],["prije Krista","poslije Krista"]],1,[6,0],["dd. MM. y.","d. MMM y.","d. MMMM y.","EEEE, d. MMMM y."],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss (zzzz)"],["{1} {0}",u,"{1} 'u' {0}",u],[",",".",";","%","+","−","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"HRK","kn","hrvatska kuna",{"AUD":[u,"$"],"BRL":[u,"R$"],"BYN":[u,"р."],"CAD":[u,"$"],"CNY":[u,"¥"],"EUR":[u,"€"],"GBP":[u,"£"],"HKD":[u,"$"],"HRK":["kn"],"ILS":[u,"₪"],"INR":[u,"₹"],"JPY":[u,"¥"],"KRW":[u,"₩"],"MXN":[u,"$"],"NZD":[u,"$"],"PHP":[u,"₱"],"RUR":[u,"р."],"TWD":[u,"NT$"],"USD":[u,"$"],"VND":[u,"₫"],"XCD":[u,"$"],"XPF":[],"XXX":[]},"ltr", plural_locale_hr];
export const locale_extra_hr = [[["ponoć","podne","ujutro","popodne","navečer","noću"],u,["ponoć","podne","ujutro","poslije podne","navečer","noću"]],[["ponoć","podne","ujutro","popodne","navečer","noću"],u,u],["00:00","12:00",["04:00","12:00"],["12:00","18:00"],["18:00","21:00"],["21:00","04:00"]]];




function plural_locale_hu(val: number): number {
const n = val;

if (n === 1)
    return 1;
return 5;
}

export const locale_hu = ["hu",[["de.","du."],u,u],u,[["V","H","K","Sz","Cs","P","Sz"],["V","H","K","Sze","Cs","P","Szo"],["vasárnap","hétfő","kedd","szerda","csütörtök","péntek","szombat"],["V","H","K","Sze","Cs","P","Szo"]],u,[["J","F","M","Á","M","J","J","A","Sz","O","N","D"],["jan.","febr.","márc.","ápr.","máj.","jún.","júl.","aug.","szept.","okt.","nov.","dec."],["január","február","március","április","május","június","július","augusztus","szeptember","október","november","december"]],u,[["ie.","isz."],["i. e.","i. sz."],["Krisztus előtt","időszámításunk szerint"]],1,[6,0],["y. MM. dd.","y. MMM d.","y. MMMM d.","y. MMMM d., EEEE"],["H:mm","H:mm:ss","H:mm:ss z","H:mm:ss zzzz"],["{1} {0}",u,u,u],[","," ",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"HUF","Ft","magyar forint",{"AUD":[u,"$"],"BRL":[u,"R$"],"BYN":[u,"р."],"CAD":[u,"$"],"CNY":[u,"¥"],"EUR":[u,"€"],"GBP":[u,"£"],"HKD":[u,"$"],"HUF":["Ft"],"ILS":[u,"₪"],"INR":[u,"₹"],"KRW":[u,"₩"],"MXN":[u,"$"],"NZD":[u,"$"],"PHP":[u,"₱"],"TWD":[u,"NT$"],"USD":[u,"$"],"VND":[u,"₫"],"XCD":[u,"$"]},"ltr", plural_locale_hu];
export const locale_extra_hu = [[["éjfél","dél","reggel","de.","du.","este","éjjel","hajnal"],u,["éjfél","dél","reggel","délelőtt","délután","este","éjjel","hajnal"]],u,["00:00","12:00",["06:00","09:00"],["09:00","12:00"],["12:00","18:00"],["18:00","21:00"],["21:00","04:00"],["04:00","06:00"]]];




function plural_locale_hy(val: number): number {
const n = val, i = Math.floor(Math.abs(val));

if (i === 0 || i === 1)
    return 1;
return 5;
}

export const locale_hy = ["hy",[["ա","հ"],["AM","PM"],u],[["AM","PM"],u,u],[["Կ","Ե","Ե","Չ","Հ","Ո","Շ"],["կիր","երկ","երք","չրք","հնգ","ուր","շբթ"],["կիրակի","երկուշաբթի","երեքշաբթի","չորեքշաբթի","հինգշաբթի","ուրբաթ","շաբաթ"],["կր","եկ","եք","չք","հգ","ու","շբ"]],u,[["Հ","Փ","Մ","Ա","Մ","Հ","Հ","Օ","Ս","Հ","Ն","Դ"],["հնվ","փտվ","մրտ","ապր","մյս","հնս","հլս","օգս","սեպ","հոկ","նոյ","դեկ"],["հունվարի","փետրվարի","մարտի","ապրիլի","մայիսի","հունիսի","հուլիսի","օգոստոսի","սեպտեմբերի","հոկտեմբերի","նոյեմբերի","դեկտեմբերի"]],[["Հ","Փ","Մ","Ա","Մ","Հ","Հ","Օ","Ս","Հ","Ն","Դ"],["հնվ","փտվ","մրտ","ապր","մյս","հնս","հլս","օգս","սեպ","հոկ","նոյ","դեկ"],["հունվար","փետրվար","մարտ","ապրիլ","մայիս","հունիս","հուլիս","օգոստոս","սեպտեմբեր","հոկտեմբեր","նոյեմբեր","դեկտեմբեր"]],[["մ.թ.ա.","մ.թ."],u,["Քրիստոսից առաջ","Քրիստոսից հետո"]],1,[6,0],["dd.MM.yy","dd MMM, y թ.","dd MMMM, y թ.","y թ. MMMM d, EEEE"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}",u,u,u],[","," ",";","%","+","-","E","×","‰","∞","ՈչԹ",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"AMD","֏","հայկական դրամ",{"AMD":["֏"],"BYN":[u,"р."],"JPY":["JP¥","¥"],"PHP":[u,"₱"],"THB":["฿"],"TWD":["NT$"]},"ltr", plural_locale_hy];
export const locale_extra_hy = [[["կգ․","կօ․","առվ","ցրկ","երկ","գշր"],["կեսգիշեր","կեսօր","առավոտյան","ցերեկը","երեկոյան","գիշերը"],["կեսգիշերին","կեսօրին","առավոտյան","ցերեկվա","երեկոյան","գիշերվա"]],[["կեսգիշեր","կեսօր","առավոտ","ցերեկ","երեկո","գիշեր"],u,u],["00:00","12:00",["06:00","12:00"],["12:00","18:00"],["18:00","24:00"],["00:00","06:00"]]];




function plural_locale_id(val: number): number {
const n = val;

return 5;
}

export const locale_id = ["id",[["AM","PM"],u,u],u,[["M","S","S","R","K","J","S"],["Min","Sen","Sel","Rab","Kam","Jum","Sab"],["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"],["Min","Sen","Sel","Rab","Kam","Jum","Sab"]],u,[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"],["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]],u,[["SM","M"],u,["Sebelum Masehi","Masehi"]],0,[6,0],["dd/MM/yy","d MMM y","d MMMM y","EEEE, dd MMMM y"],["HH.mm","HH.mm.ss","HH.mm.ss z","HH.mm.ss zzzz"],["{1} {0}",u,u,u],[",",".",";","%","+","-","E","×","‰","∞","NaN","."],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"IDR","Rp","Rupiah Indonesia",{"AUD":["AU$","$"],"BYN":[u,"р."],"IDR":["Rp"],"INR":["Rs","₹"],"JPY":["JP¥","¥"],"PHP":[u,"₱"],"THB":["฿"],"TWD":["NT$"],"USD":["US$","$"],"XXX":[]},"ltr", plural_locale_id];
export const locale_extra_id = [[["tengah malam","tengah hari","pagi","siang","sore","malam"],u,u],u,["00:00","12:00",["00:00","10:00"],["10:00","15:00"],["15:00","18:00"],["18:00","24:00"]]];

export const locale_in = locale_id;
export const locale_extra_in = locale_extra_id;

function plural_locale_is(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), t = parseInt(val.toString().replace(/^[^.]*\.?|0+$/g, ''), 10) || 0;

if (t === 0 && (i % 10 === 1 && !(i % 100 === 11)) || !(t === 0))
    return 1;
return 5;
}

export const locale_is = ["is",[["f.","e."],["f.h.","e.h."],u],[["f.h.","e.h."],u,u],[["S","M","Þ","M","F","F","L"],["sun.","mán.","þri.","mið.","fim.","fös.","lau."],["sunnudagur","mánudagur","þriðjudagur","miðvikudagur","fimmtudagur","föstudagur","laugardagur"],["su.","má.","þr.","mi.","fi.","fö.","la."]],u,[["J","F","M","A","M","J","J","Á","S","O","N","D"],["jan.","feb.","mar.","apr.","maí","jún.","júl.","ágú.","sep.","okt.","nóv.","des."],["janúar","febrúar","mars","apríl","maí","júní","júlí","ágúst","september","október","nóvember","desember"]],u,[["f.k.","e.k."],["f.Kr.","e.Kr."],["fyrir Krist","eftir Krist"]],1,[6,0],["d.M.y","d. MMM y","d. MMMM y","EEEE, d. MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}",u,"{1} 'kl'. {0}",u],[",",".",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"ISK","ISK","íslensk króna",{"AUD":[u,"$"],"BRL":[u,"R$"],"CAD":[u,"$"],"EUR":[u,"€"],"GBP":[u,"£"],"INR":[u,"₹"],"JPY":["JP¥","¥"],"KRW":[u,"₩"],"MXN":[u,"$"],"NZD":[u,"$"],"PHP":[u,"₱"],"TWD":[u,"NT$"],"USD":[u,"$"],"VND":[u,"₫"]},"ltr", plural_locale_is];
export const locale_extra_is = [[["mn.","h.","mrg.","sd.","kv.","n."],["miðnætti","hádegi","að morgni","síðdegis","að kvöldi","að nóttu"],u],[["mn.","hd.","mrg.","sd.","kv.","n."],["miðnætti","hádegi","morgunn","síðdegis","kvöld","nótt"],["miðnætti","hádegi","morgunn","eftir hádegi","kvöld","nótt"]],["00:00","12:00",["06:00","12:00"],["12:00","18:00"],["18:00","24:00"],["00:00","06:00"]]];




function plural_locale_it(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length, e = parseInt(val.toString().replace(/^[^e]*(e([-+]?\d+))?/, '$2')) || 0;

if (i === 1 && v === 0)
    return 1;
if (e === 0 && (!(i === 0) && (i % 1000000 === 0 && v === 0)) || !(e >= 0 && e <= 5))
    return 4;
return 5;
}

export const locale_it = ["it",[["m.","p."],["AM","PM"],u],u,[["D","L","M","M","G","V","S"],["dom","lun","mar","mer","gio","ven","sab"],["domenica","lunedì","martedì","mercoledì","giovedì","venerdì","sabato"],["dom","lun","mar","mer","gio","ven","sab"]],u,[["G","F","M","A","M","G","L","A","S","O","N","D"],["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"],["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"]],u,[["aC","dC"],["a.C.","d.C."],["avanti Cristo","dopo Cristo"]],1,[6,0],["dd/MM/yy","d MMM y","d MMMM y","EEEE d MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}",u,"{1} {0}",u],[",",".",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"EUR","€","euro",{"BRL":[u,"R$"],"BYN":[u,"Br"],"EGP":[u,"£E"],"HKD":[u,"$"],"INR":[u,"₹"],"JPY":[u,"¥"],"KRW":[u,"₩"],"MXN":[u,"$"],"NOK":[u,"NKr"],"THB":["฿"],"TWD":[u,"NT$"],"USD":[u,"$"],"VND":[u,"₫"]},"ltr", plural_locale_it];
export const locale_extra_it = [[["mezzanotte","mezzogiorno","di mattina","di pomeriggio","di sera","di notte"],u,["mezzanotte","mezzogiorno","di mattina","del pomeriggio","di sera","di notte"]],[["mezzanotte","mezzogiorno","mattina","pomeriggio","sera","notte"],u,u],["00:00","12:00",["06:00","12:00"],["12:00","18:00"],["18:00","24:00"],["00:00","06:00"]]];




function plural_locale_he(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
if (i === 2 && v === 0)
    return 2;
if (v === 0 && (!(n >= 0 && n <= 10) && n % 10 === 0))
    return 4;
return 5;
}

export const locale_he = ["he",[["לפנה״צ","אחה״צ"],u,u],[["לפנה״צ","אחה״צ"],["AM","PM"],u],[["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"],["יום א׳","יום ב׳","יום ג׳","יום ד׳","יום ה׳","יום ו׳","שבת"],["יום ראשון","יום שני","יום שלישי","יום רביעי","יום חמישי","יום שישי","יום שבת"],["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"]],u,[["1","2","3","4","5","6","7","8","9","10","11","12"],["ינו׳","פבר׳","מרץ","אפר׳","מאי","יוני","יולי","אוג׳","ספט׳","אוק׳","נוב׳","דצמ׳"],["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"]],u,[["לפני","אחריי"],["לפנה״ס","לספירה"],["לפני הספירה","לספירה"]],0,[5,6],["d.M.y","d בMMM y","d בMMMM y","EEEE, d בMMMM y"],["H:mm","H:mm:ss","H:mm:ss z","H:mm:ss zzzz"],["{1}, {0}",u,"{1} בשעה {0}",u],[".",",",";","%","‎+","‎-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","‏#,##0.00 ¤;‏-#,##0.00 ¤","#E0"],"ILS","₪","שקל חדש",{"BYN":[u,"р"],"CNY":["‎CN¥‎","¥"],"ILP":["ל״י"],"PHP":[u,"₱"],"THB":["฿"],"TWD":["NT$"]},"rtl", plural_locale_he];
export const locale_extra_he = [[["חצות","בבוקר","בצהריים","אחה״צ","בערב","בלילה","לפנות בוקר"],["חצות","בוקר","צהריים","אחר הצהריים","ערב","לילה","לפנות בוקר"],["חצות","בבוקר","בצהריים","אחר הצהריים","בערב","בלילה","לפנות בוקר"]],[["חצות","בוקר","צהריים","אחה״צ","ערב","לילה","לפנות בוקר"],u,["חצות","בוקר","צהריים","אחר הצהריים","ערב","לילה","לפנות בוקר"]],["00:00",["06:00","12:00"],["12:00","16:00"],["16:00","18:00"],["18:00","22:00"],["22:00","03:00"],["03:00","06:00"]]];

export const locale_iw = locale_he;
export const locale_extra_iw = locale_extra_he;

function plural_locale_ja(val: number): number {
const n = val;

return 5;
}

export const locale_ja = ["ja",[["午前","午後"],u,u],u,[["日","月","火","水","木","金","土"],u,["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"],["日","月","火","水","木","金","土"]],u,[["1","2","3","4","5","6","7","8","9","10","11","12"],["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],u],u,[["BC","AD"],["紀元前","西暦"],u],0,[6,0],["y/MM/dd",u,"y年M月d日","y年M月d日EEEE"],["H:mm","H:mm:ss","H:mm:ss z","H時mm分ss秒 zzzz"],["{1} {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"JPY","￥","日本円",{"BYN":[u,"р."],"CNY":["元","￥"],"JPY":["￥"],"PHP":[u,"₱"],"RON":[u,"レイ"],"XXX":[]},"ltr", plural_locale_ja];
export const locale_extra_ja = [[["真夜中","正午","朝","昼","夕方","夜","夜中"],u,u],u,["00:00","12:00",["04:00","12:00"],["12:00","16:00"],["16:00","19:00"],["19:00","23:00"],["23:00","04:00"]]];




function plural_locale_ka(val: number): number {
const n = val;

if (n === 1)
    return 1;
return 5;
}

export const locale_ka = ["ka",[["a","p"],["AM","PM"],u],[["AM","PM"],u,u],[["კ","ო","ს","ო","ხ","პ","შ"],["კვი","ორშ","სამ","ოთხ","ხუთ","პარ","შაბ"],["კვირა","ორშაბათი","სამშაბათი","ოთხშაბათი","ხუთშაბათი","პარასკევი","შაბათი"],["კვ","ორ","სმ","ოთ","ხთ","პრ","შბ"]],u,[["ი","თ","მ","ა","მ","ი","ი","ა","ს","ო","ნ","დ"],["იან","თებ","მარ","აპრ","მაი","ივნ","ივლ","აგვ","სექ","ოქტ","ნოე","დეკ"],["იანვარი","თებერვალი","მარტი","აპრილი","მაისი","ივნისი","ივლისი","აგვისტო","სექტემბერი","ოქტომბერი","ნოემბერი","დეკემბერი"]],u,[["ძვ. წ.","ახ. წ."],u,["ძველი წელთაღრიცხვით","ახალი წელთაღრიცხვით"]],1,[6,0],["dd.MM.yy","d MMM. y","d MMMM, y","EEEE, dd MMMM, y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}",u,u,u],[","," ",";","%","+","-","E","×","‰","∞","არ არის რიცხვი",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"GEL","₾","ქართული ლარი",{"AUD":[u,"$"],"BYN":[u,"р."],"CNY":[u,"¥"],"GEL":["₾"],"HKD":[u,"$"],"ILS":[u,"₪"],"INR":[u,"₹"],"JPY":[u,"¥"],"KRW":[u,"₩"],"NZD":[u,"$"],"PHP":[u,"₱"],"TWD":["NT$"],"USD":["US$","$"],"VND":[u,"₫"]},"ltr", plural_locale_ka];
export const locale_extra_ka = [[["შუაღამეს","შუადღ.","დილ.","ნაშუადღ.","საღ.","ღამ."],u,["შუაღამეს","შუადღეს","დილით","ნაშუადღევს","საღამოს","ღამით"]],[["შუაღამე","შუადღე","დილა","ნაშუადღევი","საღამო","ღამე"],u,u],["00:00","12:00",["05:00","12:00"],["12:00","18:00"],["18:00","21:00"],["21:00","05:00"]]];




function plural_locale_kk(val: number): number {
const n = val;

if (n === 1)
    return 1;
return 5;
}

export const locale_kk = ["kk",[["AM","PM"],u,u],u,[["Ж","Д","С","С","Б","Ж","С"],["жс","дс","сс","ср","бс","жм","сб"],["жексенбі","дүйсенбі","сейсенбі","сәрсенбі","бейсенбі","жұма","сенбі"],["жс","дс","сс","ср","бс","жм","сб"]],u,[["Қ","А","Н","С","М","М","Ш","Т","Қ","Қ","Қ","Ж"],["қаң.","ақп.","нау.","сәу.","мам.","мау.","шіл.","там.","қыр.","қаз.","қар.","жел."],["қаңтар","ақпан","наурыз","сәуір","мамыр","маусым","шілде","тамыз","қыркүйек","қазан","қараша","желтоқсан"]],[["Қ","А","Н","С","М","М","Ш","Т","Қ","Қ","Қ","Ж"],["қаң.","ақп.","нау.","сәу.","мам.","мау.","шіл.","там.","қыр.","қаз.","қар.","жел."],["Қаңтар","Ақпан","Наурыз","Сәуір","Мамыр","Маусым","Шілде","Тамыз","Қыркүйек","Қазан","Қараша","Желтоқсан"]],[["б.з.д.","б.з."],u,["Біздің заманымызға дейін","біздің заманымыз"]],1,[6,0],["dd.MM.yy","y 'ж'. dd MMM","y 'ж'. d MMMM","y 'ж'. d MMMM, EEEE"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}",u,u,u],[","," ",";","%","+","-","E","×","‰","∞","сан емес",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"KZT","₸","Қазақстан теңгесі",{"BYN":[u,"р."],"JPY":["JP¥","¥"],"KZT":["₸"],"LSL":["ЛСЛ"],"PHP":[u,"₱"],"RUB":["₽"],"THB":["฿"],"TWD":["NT$"]},"ltr", plural_locale_kk];
export const locale_extra_kk = [[["түнгі","түскі","таңғы","түстен кейінгі","кешкі","түнгі"],["түн жарымы","түскі","таңғы","түстен кейінгі","кешкі","түнгі"],u],[["түн жарымы","талтүс","таң","түстен кейін","кеш","түн"],u,u],["00:00","12:00",["06:00","12:00"],["12:00","18:00"],["18:00","21:00"],["21:00","06:00"]]];




function plural_locale_km(val: number): number {
const n = val;

return 5;
}

export const locale_km = ["km",[["a","p"],["AM","PM"],u],[["AM","PM"],u,u],[["អ","ច","អ","ព","ព","ស","ស"],["អាទិត្យ","ចន្ទ","អង្គារ","ពុធ","ព្រហ","សុក្រ","សៅរ៍"],["អាទិត្យ","ច័ន្ទ","អង្គារ","ពុធ","ព្រហស្បតិ៍","សុក្រ","សៅរ៍"],["អា","ច","អ","ពុ","ព្រ","សុ","ស"]],[["អ","ច","អ","ព","ព","ស","ស"],["អាទិត្យ","ចន្ទ","អង្គារ","ពុធ","ព្រហ","សុក្រ","សៅរ៍"],["អាទិត្យ","ចន្ទ","អង្គារ","ពុធ","ព្រហស្បតិ៍","សុក្រ","សៅរ៍"],["អា","ច","អ","ពុ","ព្រ","សុ","ស"]],[["ម","ក","ម","ម","ឧ","ម","ក","ស","ក","ត","វ","ធ"],["មករា","កុម្ភៈ","មីនា","មេសា","ឧសភា","មិថុនា","កក្កដា","សីហា","កញ្ញា","តុលា","វិច្ឆិកា","ធ្នូ"],u],u,[["មុន គ.ស.","គ.ស."],u,["មុន​គ្រិស្តសករាជ","គ្រិស្តសករាជ"]],0,[6,0],["d/M/yy","d MMM y","d MMMM y","EEEE d MMMM y"],["h:mm a","h:mm:ss a","h:mm:ss a z","h:mm:ss a zzzz"],["{1}, {0}",u,"{1} នៅ​ម៉ោង {0}",u],[",",".",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","#,##0.00¤","#E0"],"KHR","៛","រៀល​កម្ពុជា",{"BYN":[u,"р."],"JPY":["JP¥","¥"],"KHR":["៛"],"LSL":["ឡូទី"],"PHP":[u,"₱"],"THB":["฿"],"TWD":["NT$"]},"ltr", plural_locale_km];
export const locale_extra_km = [[["អធ្រាត្រ","ថ្ងៃត្រង់","នៅពេល​ព្រឹក","នៅពេលរសៀល","នៅពេល​ល្ងាច","នៅពេល​យប់"],u,u],[["អធ្រាត្រ","ថ្ងៃ​ត្រង់","ព្រឹក","រសៀល","ល្ងាច","យប់"],u,u],["00:00","12:00",["00:00","12:00"],["12:00","18:00"],["18:00","21:00"],["21:00","24:00"]]];




function plural_locale_kn(val: number): number {
const n = val, i = Math.floor(Math.abs(val));

if (i === 0 || n === 1)
    return 1;
return 5;
}

export const locale_kn = ["kn",[["ಪೂ","ಅ"],["ಪೂರ್ವಾಹ್ನ","ಅಪರಾಹ್ನ"],u],[["ಪೂರ್ವಾಹ್ನ","ಅಪರಾಹ್ನ"],u,u],[["ಭಾ","ಸೋ","ಮಂ","ಬು","ಗು","ಶು","ಶ"],["ಭಾನು","ಸೋಮ","ಮಂಗಳ","ಬುಧ","ಗುರು","ಶುಕ್ರ","ಶನಿ"],["ಭಾನುವಾರ","ಸೋಮವಾರ","ಮಂಗಳವಾರ","ಬುಧವಾರ","ಗುರುವಾರ","ಶುಕ್ರವಾರ","ಶನಿವಾರ"],["ಭಾನು","ಸೋಮ","ಮಂಗಳ","ಬುಧ","ಗುರು","ಶುಕ್ರ","ಶನಿ"]],u,[["ಜ","ಫೆ","ಮಾ","ಏ","ಮೇ","ಜೂ","ಜು","ಆ","ಸೆ","ಅ","ನ","ಡಿ"],["ಜನವರಿ","ಫೆಬ್ರವರಿ","ಮಾರ್ಚ್","ಏಪ್ರಿ","ಮೇ","ಜೂನ್","ಜುಲೈ","ಆಗ","ಸೆಪ್ಟೆಂ","ಅಕ್ಟೋ","ನವೆಂ","ಡಿಸೆಂ"],["ಜನವರಿ","ಫೆಬ್ರವರಿ","ಮಾರ್ಚ್","ಏಪ್ರಿಲ್","ಮೇ","ಜೂನ್","ಜುಲೈ","ಆಗಸ್ಟ್","ಸೆಪ್ಟೆಂಬರ್","ಅಕ್ಟೋಬರ್","ನವೆಂಬರ್","ಡಿಸೆಂಬರ್"]],[["ಜ","ಫೆ","ಮಾ","ಏ","ಮೇ","ಜೂ","ಜು","ಆ","ಸೆ","ಅ","ನ","ಡಿ"],["ಜನ","ಫೆಬ್ರ","ಮಾರ್ಚ್","ಏಪ್ರಿ","ಮೇ","ಜೂನ್","ಜುಲೈ","ಆಗ","ಸೆಪ್ಟೆಂ","ಅಕ್ಟೋ","ನವೆಂ","ಡಿಸೆಂ"],["ಜನವರಿ","ಫೆಬ್ರವರಿ","ಮಾರ್ಚ್","ಏಪ್ರಿಲ್","ಮೇ","ಜೂನ್","ಜುಲೈ","ಆಗಸ್ಟ್","ಸೆಪ್ಟೆಂಬರ್","ಅಕ್ಟೋಬರ್","ನವೆಂಬರ್","ಡಿಸೆಂಬರ್"]],[["ಕ್ರಿ.ಪೂ","ಕ್ರಿ.ಶ"],u,["ಕ್ರಿಸ್ತ ಪೂರ್ವ","ಕ್ರಿಸ್ತ ಶಕ"]],0,[0,0],["d/M/yy","MMM d, y","MMMM d, y","EEEE, MMMM d, y"],["hh:mm a","hh:mm:ss a","hh:mm:ss a z","hh:mm:ss a zzzz"],["{1} {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"INR","₹","ಭಾರತೀಯ ರೂಪಾಯಿ",{"BYN":[u,"р."],"JPY":["JP¥","¥"],"PHP":[u,"₱"],"RON":[u,"ಲೀ"],"THB":["฿"],"TWD":["NT$"]},"ltr", plural_locale_kn];
export const locale_extra_kn = [[["ಮಧ್ಯರಾತ್ರಿ","ಬೆಳಗ್ಗೆ","ಮಧ್ಯಾಹ್ನ","ಸಂಜೆ","ರಾತ್ರಿ"],["ಮಧ್ಯ ರಾತ್ರಿ","ಬೆಳಗ್ಗೆ","ಮಧ್ಯಾಹ್ನ","ಸಂಜೆ","ರಾತ್ರಿ"],u],[["ಮಧ್ಯರಾತ್ರಿ","ಬೆಳಗ್ಗೆ","ಮಧ್ಯಾಹ್ನ","ಸಂಜೆ","ರಾತ್ರಿ"],u,u],["00:00",["06:00","12:00"],["12:00","18:00"],["18:00","21:00"],["21:00","06:00"]]];




function plural_locale_ko(val: number): number {
const n = val;

return 5;
}

export const locale_ko = ["ko",[["AM","PM"],u,["오전","오후"]],u,[["일","월","화","수","목","금","토"],u,["일요일","월요일","화요일","수요일","목요일","금요일","토요일"],["일","월","화","수","목","금","토"]],u,[["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],u,u],u,[["BC","AD"],u,["기원전","서기"]],0,[6,0],["yy. M. d.","y. M. d.","y년 M월 d일","y년 M월 d일 EEEE"],["a h:mm","a h:mm:ss","a h시 m분 s초 z","a h시 m분 s초 zzzz"],["{1} {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"KRW","₩","대한민국 원",{"AUD":["AU$","$"],"BYN":[u,"р."],"JPY":["JP¥","¥"],"PHP":[u,"₱"],"RON":[u,"L"],"TWD":["NT$"],"USD":["US$","$"]},"ltr", plural_locale_ko];
export const locale_extra_ko = [[["자정","정오","새벽","오전","오후","저녁","밤"],u,u],u,["00:00","12:00",["03:00","06:00"],["06:00","12:00"],["12:00","18:00"],["18:00","21:00"],["21:00","03:00"]]];




function plural_locale_ky(val: number): number {
const n = val;

if (n === 1)
    return 1;
return 5;
}

export const locale_ky = ["ky",[["тң","тк"],u,["таңкы","түштөн кийинки"]],u,[["Ж","Д","Ш","Ш","Б","Ж","И"],["жек.","дүй.","шейш.","шарш.","бейш.","жума","ишм."],["жекшемби","дүйшөмбү","шейшемби","шаршемби","бейшемби","жума","ишемби"],["жш.","дш.","шш.","шр.","бш.","жм.","иш."]],u,[["Я","Ф","М","А","М","И","И","А","С","О","Н","Д"],["янв.","фев.","мар.","апр.","май","июн.","июл.","авг.","сен.","окт.","ноя.","дек."],["январь","февраль","март","апрель","май","июнь","июль","август","сентябрь","октябрь","ноябрь","декабрь"]],[["Я","Ф","М","А","М","И","И","А","С","О","Н","Д"],["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"],["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"]],[["б.з.ч.","б.з."],u,["биздин заманга чейин","биздин заман"]],1,[6,0],["d/M/yy","y-'ж'., d-MMM","y-'ж'., d-MMMM","y-'ж'., d-MMMM, EEEE"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,u,u],[","," ",";","%","+","-","E","×","‰","∞","сан эмес",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"KGS","сом","Кыргызстан сому",{"AUD":[u,"$"],"BMD":[u,"BD$"],"BRL":[u,"R$"],"BSD":[u,"B$"],"BYN":[u,"р."],"BZD":[u,"BZ$"],"CAD":[u,"C$"],"DOP":[u,"RD$"],"EGP":[u,"LE"],"GBP":[u,"£"],"HKD":[u,"HK$"],"HRK":[u,"Kn"],"ILS":[u,"₪"],"INR":[u,"₹"],"JMD":[u,"J$"],"JPY":["JP¥","¥"],"KGS":["сом"],"KRW":[u,"₩"],"MXN":[u,"$"],"NZD":[u,"$"],"PHP":[u,"₱"],"THB":["฿"],"TTD":[u,"TT$"],"TWD":[u,"NT$"],"USD":[u,"$"],"XCD":[u,"$"]},"ltr", plural_locale_ky];
export const locale_extra_ky = [[["түн орт","чт","эртң мн","түшт кйн","кечк","түн"],["түн ортосу","чак түш","эртең менен","түштөн кийин","кечинде","түн ичинде"],u],[["түн ортосу","чак түш","эртең менен","түштөн кийин","кечкурун","түн"],u,u],["00:00","12:00",["06:00","12:00"],["12:00","18:00"],["18:00","21:00"],["21:00","06:00"]]];




function plural_locale_ln(val: number): number {
const n = val;

if (n === Math.floor(n) && (n >= 0 && n <= 1))
    return 1;
return 5;
}

export const locale_ln = ["ln",[["ntɔ́ngɔ́","mpókwa"],u,u],u,[["e","y","m","m","m","m","p"],["eye","ybo","mbl","mst","min","mtn","mps"],["eyenga","mokɔlɔ mwa yambo","mokɔlɔ mwa míbalé","mokɔlɔ mwa mísáto","mokɔlɔ ya mínéi","mokɔlɔ ya mítáno","mpɔ́sɔ"],["eye","ybo","mbl","mst","min","mtn","mps"]],u,[["y","f","m","a","m","y","y","a","s","ɔ","n","d"],["yan","fbl","msi","apl","mai","yun","yul","agt","stb","ɔtb","nvb","dsb"],["sánzá ya yambo","sánzá ya míbalé","sánzá ya mísáto","sánzá ya mínei","sánzá ya mítáno","sánzá ya motóbá","sánzá ya nsambo","sánzá ya mwambe","sánzá ya libwa","sánzá ya zómi","sánzá ya zómi na mɔ̌kɔ́","sánzá ya zómi na míbalé"]],u,[["libóso ya","nsima ya Y"],u,["Yambo ya Yézu Krís","Nsima ya Yézu Krís"]],1,[6,0],["d/M/y","d MMM y","d MMMM y","EEEE d MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,u,u],[",",".",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"CDF","FC","Falánga ya Kongó",{"CDF":["FC"],"JPY":["JP¥","¥"],"USD":["US$","$"]},"ltr", plural_locale_ln];
export const locale_extra_ln = [];




function plural_locale_lo(val: number): number {
const n = val;

return 5;
}

export const locale_lo = ["lo",[["ກ່ອນທ່ຽງ","ຫຼັງທ່ຽງ"],u,u],u,[["ອາ","ຈ","ອ","ພ","ພຫ","ສຸ","ສ"],["ອາທິດ","ຈັນ","ອັງຄານ","ພຸດ","ພະຫັດ","ສຸກ","ເສົາ"],["ວັນອາທິດ","ວັນຈັນ","ວັນອັງຄານ","ວັນພຸດ","ວັນພະຫັດ","ວັນສຸກ","ວັນເສົາ"],["ອາ.","ຈ.","ອ.","ພ.","ພຫ.","ສຸ.","ສ."]],u,[["1","2","3","4","5","6","7","8","9","10","11","12"],["ມ.ກ.","ກ.ພ.","ມ.ນ.","ມ.ສ.","ພ.ພ.","ມິ.ຖ.","ກ.ລ.","ສ.ຫ.","ກ.ຍ.","ຕ.ລ.","ພ.ຈ.","ທ.ວ."],["ມັງກອນ","ກຸມພາ","ມີນາ","ເມສາ","ພຶດສະພາ","ມິຖຸນາ","ກໍລະກົດ","ສິງຫາ","ກັນຍາ","ຕຸລາ","ພະຈິກ","ທັນວາ"]],u,[["ກ່ອນ ຄ.ສ.","ຄ.ສ."],u,["ກ່ອນຄຣິດສັກກະລາດ","ຄຣິດສັກກະລາດ"]],0,[6,0],["d/M/y","d MMM y","d MMMM y","EEEE ທີ d MMMM G y"],["H:mm","H:mm:ss","H ໂມງ m ນາທີ ss ວິນາທີ z","H ໂມງ m ນາທີ ss ວິນາທີ zzzz"],["{1}, {0}",u,u,u],[",",".",";","%","+","-","E","×","‰","∞","ບໍ່​ແມ່ນ​ໂຕ​ເລກ",":"],["#,##0.###","#,##0%","¤#,##0.00;¤-#,##0.00","#"],"LAK","₭","ລາວ ກີບ",{"BYN":[u,"р."],"JPY":["JP¥","¥"],"LAK":["₭"],"PHP":[u,"₱"],"THB":["฿"],"TWD":["NT$"],"USD":["US$","$"]},"ltr", plural_locale_lo];
export const locale_extra_lo = [[["ທ່ຽງຄືນ","ຕອນທ່ຽງ","ຕອນເຊົ້າ","ຕອນທ່ຽງ","ຕອນແລງ","ກາງຄືນ"],["ທ່ຽງຄືນ","ຕອນທ່ຽງ","ຕອນເຊົ້າ","ຕອນບ່າຍ","ຕອນແລງ","ກາງຄືນ"],["ທ່ຽງຄືນ","ຕອນທ່ຽງ","ຕອນເຊົ້າ","ຕອນບ່າຍ","ຕອນແລງ","ຕອນກາງຄືນ"]],[["ທ່ຽງ​ຄືນ","ຕອນທ່ຽງ","​ເຊົ້າ","ສ","ແລງ","​ກາງ​ຄືນ"],["ທ່ຽງ​ຄືນ","ທ່ຽງ","​ເຊົ້າ","ສວຍ","ແລງ","​ກາງ​ຄືນ"],["ທ່ຽງຄືນ","ຕອນທ່ຽງ","​ເຊົ້າ","ສວຍ","ແລງ","​ກາງ​ຄືນ"]],["00:00","12:00",["05:00","12:00"],["12:00","16:00"],["16:00","20:00"],["20:00","05:00"]]];




function plural_locale_lt(val: number): number {
const n = val, f = parseInt(val.toString().replace(/^[^.]*\.?/, ''), 10) || 0;

if (n % 10 === 1 && !(n % 100 >= 11 && n % 100 <= 19))
    return 1;
if (n % 10 === Math.floor(n % 10) && (n % 10 >= 2 && n % 10 <= 9) && !(n % 100 >= 11 && n % 100 <= 19))
    return 3;
if (!(f === 0))
    return 4;
return 5;
}

export const locale_lt = ["lt",[["pr. p.","pop."],["priešpiet","popiet"],u],u,[["S","P","A","T","K","P","Š"],["sk","pr","an","tr","kt","pn","št"],["sekmadienis","pirmadienis","antradienis","trečiadienis","ketvirtadienis","penktadienis","šeštadienis"],["Sk","Pr","An","Tr","Kt","Pn","Št"]],u,[["S","V","K","B","G","B","L","R","R","S","L","G"],["saus.","vas.","kov.","bal.","geg.","birž.","liep.","rugp.","rugs.","spal.","lapkr.","gruod."],["sausio","vasario","kovo","balandžio","gegužės","birželio","liepos","rugpjūčio","rugsėjo","spalio","lapkričio","gruodžio"]],[["S","V","K","B","G","B","L","R","R","S","L","G"],["saus.","vas.","kov.","bal.","geg.","birž.","liep.","rugp.","rugs.","spal.","lapkr.","gruod."],["sausis","vasaris","kovas","balandis","gegužė","birželis","liepa","rugpjūtis","rugsėjis","spalis","lapkritis","gruodis"]],[["pr. Kr.","po Kr."],u,["prieš Kristų","po Kristaus"]],1,[6,0],["y-MM-dd",u,"y 'm'. MMMM d 'd'.","y 'm'. MMMM d 'd'., EEEE"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,u,u],[","," ",";","%","+","−","×10^","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"EUR","€","Euras",{"AUD":[u,"$"],"BDT":[],"BRL":[u,"R$"],"BYN":[u,"Br"],"CAD":[u,"$"],"CNY":[u,"¥"],"GBP":[u,"£"],"HKD":[u,"$"],"ILS":[],"INR":[],"JPY":[u,"¥"],"KHR":[],"KRW":[u,"₩"],"LAK":[],"MNT":[],"MXN":[u,"$"],"NZD":[u,"$"],"PHP":[u,"₱"],"PLN":[u,"zl"],"PYG":[u,"Gs"],"RUB":[u,"rb"],"TWD":[u,"$"],"USD":[u,"$"],"VND":[],"XAF":[],"XCD":[u,"$"],"XOF":[],"XPF":[]},"ltr", plural_locale_lt];
export const locale_extra_lt = [[["vidurnaktis","perpiet","rytas","popietė","vakaras","naktis"],u,u],[["vidurnaktis","vidurdienis","rytas","diena","vakaras","naktis"],u,u],["00:00","12:00",["06:00","12:00"],["12:00","18:00"],["18:00","24:00"],["00:00","06:00"]]];




function plural_locale_lv(val: number): number {
const n = val, v = val.toString().replace(/^[^.]*\.?/, '').length, f = parseInt(val.toString().replace(/^[^.]*\.?/, ''), 10) || 0;

if (n % 10 === 0 || (n % 100 === Math.floor(n % 100) && (n % 100 >= 11 && n % 100 <= 19) || v === 2 && (f % 100 === Math.floor(f % 100) && (f % 100 >= 11 && f % 100 <= 19))))
    return 0;
if (n % 10 === 1 && !(n % 100 === 11) || (v === 2 && (f % 10 === 1 && !(f % 100 === 11)) || !(v === 2) && f % 10 === 1))
    return 1;
return 5;
}

export const locale_lv = ["lv",[["priekšp.","pēcp."],u,["priekšpusdienā","pēcpusdienā"]],[["priekšp.","pēcpusd."],u,["priekšpusdiena","pēcpusdiena"]],[["S","P","O","T","C","P","S"],["svētd.","pirmd.","otrd.","trešd.","ceturtd.","piektd.","sestd."],["svētdiena","pirmdiena","otrdiena","trešdiena","ceturtdiena","piektdiena","sestdiena"],["Sv","Pr","Ot","Tr","Ce","Pk","Se"]],[["S","P","O","T","C","P","S"],["Svētd.","Pirmd.","Otrd.","Trešd.","Ceturtd.","Piektd.","Sestd."],["Svētdiena","Pirmdiena","Otrdiena","Trešdiena","Ceturtdiena","Piektdiena","Sestdiena"],["Sv","Pr","Ot","Tr","Ce","Pk","Se"]],[["J","F","M","A","M","J","J","A","S","O","N","D"],["janv.","febr.","marts","apr.","maijs","jūn.","jūl.","aug.","sept.","okt.","nov.","dec."],["janvāris","februāris","marts","aprīlis","maijs","jūnijs","jūlijs","augusts","septembris","oktobris","novembris","decembris"]],u,[["p.m.ē.","m.ē."],u,["pirms mūsu ēras","mūsu ērā"]],1,[6,0],["dd.MM.yy","y. 'gada' d. MMM","y. 'gada' d. MMMM","EEEE, y. 'gada' d. MMMM"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,u,u],[","," ",";","%","+","-","E","×","‰","∞","NS",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"EUR","€","eiro",{"AUD":["AU$","$"],"BYN":[u,"р."],"GHS":[],"LVL":["Ls"],"PHP":[u,"₱"],"THB":["฿"],"TWD":["NT$"]},"ltr", plural_locale_lv];
export const locale_extra_lv = [[["pusnaktī","pusd.","no rīta","pēcpusd.","vakarā","naktī"],u,["pusnaktī","pusdienlaikā","no rīta","pēcpusdienā","vakarā","naktī"]],[["pusnakts","pusd.","rīts","pēcpusd.","vakars","nakts"],u,["pusnakts","pusdienlaiks","rīts","pēcpusdiena","vakars","nakts"]],["00:00","12:00",["06:00","12:00"],["12:00","18:00"],["18:00","23:00"],["23:00","06:00"]]];




function plural_locale_mk(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length, f = parseInt(val.toString().replace(/^[^.]*\.?/, ''), 10) || 0;

if (v === 0 && (i % 10 === 1 && !(i % 100 === 11)) || f % 10 === 1 && !(f % 100 === 11))
    return 1;
return 5;
}

export const locale_mk = ["mk",[["претпл.","попл."],u,["претпладне","попладне"]],u,[["н","п","в","с","ч","п","с"],["нед.","пон.","вто.","сре.","чет.","пет.","саб."],["недела","понеделник","вторник","среда","четврток","петок","сабота"],["нед.","пон.","вто.","сре.","чет.","пет.","саб."]],u,[["ј","ф","м","а","м","ј","ј","а","с","о","н","д"],["јан.","фев.","мар.","апр.","мај","јун.","јул.","авг.","септ.","окт.","ноем.","дек."],["јануари","февруари","март","април","мај","јуни","јули","август","септември","октомври","ноември","декември"]],u,[["п.н.е.","н.е."],u,["пред нашата ера","од нашата ера"]],1,[6,0],["d.M.yy","d.M.y","d MMMM y","EEEE, d MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, 'во' {0}",u,u,u],[",",".",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"MKD","ден.","Македонски денар",{"AUD":[u,"$"],"BYN":[u,"р."],"CNY":[u,"¥"],"GBP":[u,"£"],"HKD":[u,"$"],"ILS":[u,"₪"],"INR":[u,"₹"],"JPY":[u,"¥"],"KRW":[u,"₩"],"MKD":["ден."],"NZD":[u,"$"],"PHP":[u,"₱"],"TWD":[u,"NT$"],"USD":["US$","$"],"VND":[u,"₫"]},"ltr", plural_locale_mk];
export const locale_extra_mk = [[["полн.","напл.","утро","претпл.","попл.","веч.","ноќе"],["полноќ","напладне","наутро","претпладне","попладне","навечер","ноќе"],["полноќ","напладне","наутро","претпладне","попладне","навечер","по полноќ"]],[["полноќ","пладне","наутро","претпл.","попл.","навечер","по полноќ"],["полноќ","напладне","наутро","претпл.","попл.","навечер","по полноќ"],["на полноќ","напладне","наутро","претпладне","попладне","навечер","по полноќ"]],["00:00","12:00",["04:00","10:00"],["10:00","12:00"],["12:00","18:00"],["18:00","24:00"],["00:00","04:00"]]];




function plural_locale_ml(val: number): number {
const n = val;

if (n === 1)
    return 1;
return 5;
}

export const locale_ml = ["ml",[["AM","PM"],u,u],u,[["ഞ","തി","ചൊ","ബു","വ്യാ","വെ","ശ"],["ഞായർ","തിങ്കൾ","ചൊവ്വ","ബുധൻ","വ്യാഴം","വെള്ളി","ശനി"],["ഞായറാഴ്‌ച","തിങ്കളാഴ്‌ച","ചൊവ്വാഴ്ച","ബുധനാഴ്‌ച","വ്യാഴാഴ്‌ച","വെള്ളിയാഴ്‌ച","ശനിയാഴ്‌ച"],["ഞാ","തി","ചൊ","ബു","വ്യാ","വെ","ശ"]],[["ഞാ","തി","ചൊ","ബു","വ്യാ","വെ","ശ"],["ഞായർ","തിങ്കൾ","ചൊവ്വ","ബുധൻ","വ്യാഴം","വെള്ളി","ശനി"],["ഞായറാഴ്‌ച","തിങ്കളാഴ്‌ച","ചൊവ്വാഴ്‌ച","ബുധനാഴ്‌ച","വ്യാഴാഴ്‌ച","വെള്ളിയാഴ്‌ച","ശനിയാഴ്‌ച"],["ഞാ","തി","ചൊ","ബു","വ്യാ","വെ","ശ"]],[["ജ","ഫെ","മാ","ഏ","മെ","ജൂൺ","ജൂ","ഓ","സെ","ഒ","ന","ഡി"],["ജനു","ഫെബ്രു","മാർ","ഏപ്രി","മേയ്","ജൂൺ","ജൂലൈ","ഓഗ","സെപ്റ്റം","ഒക്ടോ","നവം","ഡിസം"],["ജനുവരി","ഫെബ്രുവരി","മാർച്ച്","ഏപ്രിൽ","മേയ്","ജൂൺ","ജൂലൈ","ഓഗസ്റ്റ്","സെപ്റ്റംബർ","ഒക്‌ടോബർ","നവംബർ","ഡിസംബർ"]],u,[["ക്രി.മു.","എഡി"],u,["ക്രിസ്‌തുവിന് മുമ്പ്","ആന്നോ ഡൊമിനി"]],0,[0,0],["d/M/yy","y, MMM d","y, MMMM d","y, MMMM d, EEEE"],["h:mm a","h:mm:ss a","h:mm:ss a z","h:mm:ss a zzzz"],["{1} {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##,##0.###","#,##0%","¤#,##0.00","#E0"],"INR","₹","ഇന്ത്യൻ രൂപ",{"BYN":[u,"р."],"PHP":[u,"₱"],"THB":["฿"],"TWD":["NT$"]},"ltr", plural_locale_ml];
export const locale_extra_ml = [[["അ","ഉച്ച","പുലർച്ചെ","രാവിലെ","ഉച്ചയ്ക്ക്","ഉച്ചതിരിഞ്ഞ്","വൈകുന്നേരം","സന്ധ്യ","രാത്രി"],["അർദ്ധരാത്രി","ഉച്ച","പുലർച്ചെ","രാവിലെ","ഉച്ചയ്ക്ക്","ഉച്ചതിരിഞ്ഞ്","വൈകുന്നേരം","സന്ധ്യ","രാത്രി"],u],[["അർദ്ധരാത്രി","ഉച്ച","പുലർച്ചെ","രാവിലെ","ഉച്ചയ്ക്ക്","ഉച്ചതിരിഞ്ഞ്","വൈകുന്നേരം","സന്ധ്യ","രാത്രി"],u,u],["00:00","12:00",["03:00","06:00"],["06:00","12:00"],["12:00","14:00"],["14:00","15:00"],["15:00","18:00"],["18:00","19:00"],["19:00","03:00"]]];




function plural_locale_mn(val: number): number {
const n = val;

if (n === 1)
    return 1;
return 5;
}

export const locale_mn = ["mn",[["ү.ө.","ү.х."],u,u],u,[["Ня","Да","Мя","Лх","Пү","Ба","Бя"],u,["ням","даваа","мягмар","лхагва","пүрэв","баасан","бямба"],["Ня","Да","Мя","Лх","Пү","Ба","Бя"]],[["Ня","Да","Мя","Лх","Пү","Ба","Бя"],u,["Ням","Даваа","Мягмар","Лхагва","Пүрэв","Баасан","Бямба"],["Ня","Да","Мя","Лх","Пү","Ба","Бя"]],[["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"],["1-р сар","2-р сар","3-р сар","4-р сар","5-р сар","6-р сар","7-р сар","8-р сар","9-р сар","10-р сар","11-р сар","12-р сар"],["нэгдүгээр сар","хоёрдугаар сар","гуравдугаар сар","дөрөвдүгээр сар","тавдугаар сар","зургаадугаар сар","долоодугаар сар","наймдугаар сар","есдүгээр сар","аравдугаар сар","арван нэгдүгээр сар","арван хоёрдугаар сар"]],[["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"],["1-р сар","2-р сар","3-р сар","4-р сар","5-р сар","6-р сар","7-р сар","8-р сар","9-р сар","10-р сар","11-р сар","12-р сар"],["Нэгдүгээр сар","Хоёрдугаар сар","Гуравдугаар сар","Дөрөвдүгээр сар","Тавдугаар сар","Зургаадугаар сар","Долоодугаар сар","Наймдугаар сар","Есдүгээр сар","Аравдугаар сар","Арван нэгдүгээр сар","Арван хоёрдугаар сар"]],[["МЭӨ","МЭ"],u,["манай эриний өмнөх","манай эриний"]],1,[6,0],["y.MM.dd","y 'оны' MMM'ын' d","y 'оны' MMMM'ын' d","y 'оны' MMMM'ын' d, EEEE 'гараг'"],["HH:mm","HH:mm:ss","HH:mm:ss (z)","HH:mm:ss (zzzz)"],["{1} {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤ #,##0.00","#E0"],"MNT","₮","Монгол төгрөг",{"BYN":[u,"р."],"JPY":["JP¥","¥"],"MNT":["₮"],"PHP":[u,"₱"],"SEK":[u,"кр"],"THB":["฿"],"TWD":["NT$"]},"ltr", plural_locale_mn];
export const locale_extra_mn = [[["шөнө дунд","үд дунд","өглөө","өдөр","орой","шөнө"],u,u],u,["00:00","12:00",["06:00","12:00"],["12:00","18:00"],["18:00","21:00"],["21:00","06:00"]]];




function plural_locale_ro_MD(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
if (!(v === 0) || (n === 0 || n % 100 === Math.floor(n % 100) && (n % 100 >= 2 && n % 100 <= 19)))
    return 3;
return 5;
}

export const locale_ro_MD = ["ro-MD",[["a.m.","p.m."],u,u],u,[["D","L","Ma","Mi","J","V","S"],["Dum","Lun","Mar","Mie","Joi","Vin","Sâm"],["duminică","luni","marți","miercuri","joi","vineri","sâmbătă"],["Du","Lu","Ma","Mi","Jo","Vi","Sâ"]],u,[["I","F","M","A","M","I","I","A","S","O","N","D"],["ian.","feb.","mar.","apr.","mai","iun.","iul.","aug.","sept.","oct.","nov.","dec."],["ianuarie","februarie","martie","aprilie","mai","iunie","iulie","august","septembrie","octombrie","noiembrie","decembrie"]],u,[["î.Hr.","d.Hr."],u,["înainte de Hristos","după Hristos"]],1,[6,0],["dd.MM.y","d MMM y","d MMMM y","EEEE, d MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}",u,u,u],[",",".",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"MDL","L","leu moldovenesc",{"AUD":[u,"$"],"BRL":[u,"R$"],"BYN":[u,"р."],"CAD":[u,"$"],"CNY":[u,"¥"],"EUR":[u,"€"],"GBP":[u,"£"],"HKD":[u,"$"],"ILS":[u,"₪"],"INR":[u,"₹"],"JPY":[u,"¥"],"KRW":[u,"₩"],"MDL":["L"],"MXN":[u,"$"],"NZD":[u,"$"],"PHP":[u,"₱"],"TWD":[u,"NT$"],"USD":[u,"$"],"VND":[u,"₫"],"XCD":[u,"$"]},"ltr", plural_locale_ro_MD];
export const locale_extra_ro_MD = [[["miezul nopții","amiază","dimineață","după-amiază","seară","noapte"],["miezul nopții","amiază","dimineața","după-amiaza","seara","noaptea"],u],u,["00:00","12:00",["05:00","12:00"],["12:00","18:00"],["18:00","22:00"],["22:00","05:00"]]];

export const locale_mo = locale_ro_MD;
export const locale_extra_mo = locale_extra_ro_MD;

function plural_locale_mr(val: number): number {
const n = val;

if (n === 1)
    return 1;
return 5;
}

export const locale_mr = ["mr",[["a","p"],["AM","PM"],u],[["AM","PM"],u,u],[["र","सो","मं","बु","गु","शु","श"],["रवि","सोम","मंगळ","बुध","गुरु","शुक्र","शनि"],["रविवार","सोमवार","मंगळवार","बुधवार","गुरुवार","शुक्रवार","शनिवार"],["र","सो","मं","बु","गु","शु","श"]],u,[["जा","फे","मा","ए","मे","जू","जु","ऑ","स","ऑ","नो","डि"],["जाने","फेब्रु","मार्च","एप्रि","मे","जून","जुलै","ऑग","सप्टें","ऑक्टो","नोव्हें","डिसें"],["जानेवारी","फेब्रुवारी","मार्च","एप्रिल","मे","जून","जुलै","ऑगस्ट","सप्टेंबर","ऑक्टोबर","नोव्हेंबर","डिसेंबर"]],u,[["इ. स. पू.","इ. स."],u,["ईसवीसनपूर्व","ईसवीसन"]],0,[0,0],["d/M/yy","d MMM, y","d MMMM, y","EEEE, d MMMM, y"],["h:mm a","h:mm:ss a","h:mm:ss a z","h:mm:ss a zzzz"],["{1}, {0}",u,"{1} रोजी {0}",u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##,##0.###","#,##0%","¤#,##0.00","[#E0]"],"INR","₹","भारतीय रुपया",{"JPY":["JP¥","¥"],"PHP":[u,"₱"],"THB":["฿"],"TWD":["NT$"]},"ltr", plural_locale_mr];
export const locale_extra_mr = [[["म.रा.","दु","प","स","दु","सं","सा","रा"],["मध्यरात्र","मध्यान्ह","पहाट","सकाळ","दुपार","संध्याकाळ","सायंकाळ","रात्र"],u],[["म.रा.","म","प","स","दु","सं","सा","रात्र"],["मध्यरात्र","मध्यान्ह","पहाट","सकाळ","दुपार","संध्याकाळ","सायंकाळ","रात्र"],u],["00:00","12:00",["04:00","06:00"],["06:00","12:00"],["12:00","16:00"],["16:00","18:00"],["18:00","21:00"],["21:00","04:00"]]];




function plural_locale_ms(val: number): number {
const n = val;

return 5;
}

export const locale_ms = ["ms",[["a","p"],["PG","PTG"],u],u,[["A","I","S","R","K","J","S"],["Ahd","Isn","Sel","Rab","Kha","Jum","Sab"],["Ahad","Isnin","Selasa","Rabu","Khamis","Jumaat","Sabtu"],["Ah","Is","Se","Ra","Kh","Ju","Sa"]],u,[["J","F","M","A","M","J","J","O","S","O","N","D"],["Jan","Feb","Mac","Apr","Mei","Jun","Jul","Ogo","Sep","Okt","Nov","Dis"],["Januari","Februari","Mac","April","Mei","Jun","Julai","Ogos","September","Oktober","November","Disember"]],u,[["S.M.","TM"],u,u],1,[6,0],["d/MM/yy","d MMM y","d MMMM y","EEEE, d MMMM y"],["h:mm a","h:mm:ss a","h:mm:ss a z","h:mm:ss a zzzz"],["{1}, {0}",u,"{1} {0}",u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"MYR","RM","Ringgit Malaysia",{"BYN":[u,"р."],"CAD":[u,"$"],"JPY":["JP¥","¥"],"MXN":[u,"$"],"MYR":["RM"],"PHP":[u,"₱"],"TWD":["NT$"],"USD":[u,"$"]},"ltr", plural_locale_ms];
export const locale_extra_ms = [[["pagi","pagi","tengah hari","petang","malam"],u,["tengah malam","pagi","tengah hari","petang","malam"]],[["pagi","pagi","tengah hari","petang","malam"],["tengah malam","pagi","tengah hari","petang","malam"],u],[["00:00","01:00"],["01:00","12:00"],["12:00","14:00"],["14:00","19:00"],["19:00","24:00"]]];




function plural_locale_mt(val: number): number {
const n = val;

if (n === 1)
    return 1;
if (n === 0 || n % 100 === Math.floor(n % 100) && (n % 100 >= 2 && n % 100 <= 10))
    return 3;
if (n % 100 === Math.floor(n % 100) && (n % 100 >= 11 && n % 100 <= 19))
    return 4;
return 5;
}

export const locale_mt = ["mt",[["am","pm"],["AM","PM"],u],u,[["Ħd","T","Tl","Er","Ħm","Ġm","Sb"],["Ħad","Tne","Tli","Erb","Ħam","Ġim","Sib"],["Il-Ħadd","It-Tnejn","It-Tlieta","L-Erbgħa","Il-Ħamis","Il-Ġimgħa","Is-Sibt"],["Ħad","Tne","Tli","Erb","Ħam","Ġim","Sib"]],[["Ħd","Tn","Tl","Er","Ħm","Ġm","Sb"],["Ħad","Tne","Tli","Erb","Ħam","Ġim","Sib"],["Il-Ħadd","It-Tnejn","It-Tlieta","L-Erbgħa","Il-Ħamis","Il-Ġimgħa","Is-Sibt"],["Ħad","Tne","Tli","Erb","Ħam","Ġim","Sib"]],[["J","F","M","A","M","Ġ","L","A","S","O","N","D"],["Jan","Fra","Mar","Apr","Mej","Ġun","Lul","Aww","Set","Ott","Nov","Diċ"],["Jannar","Frar","Marzu","April","Mejju","Ġunju","Lulju","Awwissu","Settembru","Ottubru","Novembru","Diċembru"]],[["Jn","Fr","Mz","Ap","Mj","Ġn","Lj","Aw","St","Ob","Nv","Dċ"],["Jan","Fra","Mar","Apr","Mej","Ġun","Lul","Aww","Set","Ott","Nov","Diċ"],["Jannar","Frar","Marzu","April","Mejju","Ġunju","Lulju","Awwissu","Settembru","Ottubru","Novembru","Diċembru"]],[["QK","WK"],u,["Qabel Kristu","Wara Kristu"]],0,[6,0],["dd/MM/y","dd MMM y","d 'ta'’ MMMM y","EEEE, d 'ta'’ MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"EUR","€","ewro",{"BYN":[u,"р."],"JPY":["JP¥","¥"],"PHP":[u,"₱"],"USD":["US$","$"]},"ltr", plural_locale_mt];
export const locale_extra_mt = [];




function plural_locale_my(val: number): number {
const n = val;

return 5;
}

export const locale_my = ["my",[["နံနက်","ညနေ"],u,u],u,[["တ","တ","အ","ဗ","က","သ","စ"],["တနင်္ဂနွေ","တနင်္လာ","အင်္ဂါ","ဗုဒ္ဓဟူး","ကြာသပတေး","သောကြာ","စနေ"],u,u],u,[["ဇ","ဖ","မ","ဧ","မ","ဇ","ဇ","ဩ","စ","အ","န","ဒ"],["ဇန်","ဖေ","မတ်","ဧ","မေ","ဇွန်","ဇူ","ဩ","စက်","အောက်","နို","ဒီ"],["ဇန်နဝါရီ","ဖေဖော်ဝါရီ","မတ်","ဧပြီ","မေ","ဇွန်","ဇူလိုင်","ဩဂုတ်","စက်တင်ဘာ","အောက်တိုဘာ","နိုဝင်ဘာ","ဒီဇင်ဘာ"]],u,[["ဘီစီ","အဒေီ"],u,["ခရစ်တော် မပေါ်မီနှစ်","ခရစ်နှစ်"]],0,[6,0],["dd-MM-yy","y- MMM d","y- MMMM d","y- MMMM d- EEEE"],["H:mm","H:mm:ss","z HH:mm:ss","zzzz HH:mm:ss"],["{1} {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","ဂဏန်းမဟုတ်သော",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"MMK","K","မြန်မာ ကျပ်",{"ANG":["NAf"],"AWG":["Afl"],"BBD":[u,"Bds$"],"BSD":[u,"B$"],"BYN":[u,"р."],"HTG":["G"],"JPY":["JP¥","¥"],"MMK":["K"],"PAB":["B/."],"PHP":[u,"₱"],"THB":["฿"],"TTD":["TT$","$"],"USD":["US$","$"]},"ltr", plural_locale_my];
export const locale_extra_my = [[["သန်းခေါင်ယံ","မွန်းတည့်","နံနက်","နေ့လယ်","ညနေ","ည"],u,u],u,["00:00","12:00",["00:00","12:00"],["12:00","16:00"],["16:00","19:00"],["19:00","24:00"]]];




function plural_locale_ne(val: number): number {
const n = val;

if (n === 1)
    return 1;
return 5;
}

export const locale_ne = ["ne",[["पूर्वाह्न","अपराह्न"],u,u],u,[["आ","सो","म","बु","बि","शु","श"],["आइत","सोम","मङ्गल","बुध","बिहि","शुक्र","शनि"],["आइतबार","सोमबार","मङ्गलबार","बुधबार","बिहिबार","शुक्रबार","शनिबार"],["आइत","सोम","मङ्गल","बुध","बिहि","शुक्र","शनि"]],u,[["जन","फेब","मार्च","अप्र","मे","जुन","जुल","अग","सेप","अक्टो","नोभे","डिसे"],["जनवरी","फेब्रुअरी","मार्च","अप्रिल","मे","जुन","जुलाई","अगस्ट","सेप्टेम्बर","अक्टोबर","नोभेम्बर","डिसेम्बर"],u],[["जन","फेेब","मार्च","अप्र","मे","जुन","जुल","अग","सेप","अक्टो","नोभे","डिसे"],["जनवरी","फेब्रुअरी","मार्च","अप्रिल","मे","जुन","जुलाई","अगस्ट","सेप्टेम्बर","अक्टोबर","नोभेम्बर","डिसेम्बर"],u],[["ईसा पूर्व","सन्"],u,u],0,[6,0],["yy/M/d","y MMM d","y MMMM d","y MMMM d, EEEE"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}",u,"{1} {0}",u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##,##0.###","#,##,##0%","¤ #,##,##0.00","#E0"],"NPR","नेरू","नेपाली रूपैयाँ",{"BYN":[u,"р."],"JPY":["JP¥","¥"],"NPR":["नेरू","रू"],"PHP":[u,"₱"],"THB":["฿"],"USD":["US$","$"]},"ltr", plural_locale_ne];
export const locale_extra_ne = [[["मध्यरात","मध्यान्ह","बिहान","अपरान्ह","साँझ","बेलुकी","रात"],u,u],u,["00:00","12:00",["04:00","12:00"],["12:00","16:00"],["16:00","19:00"],["19:00","22:00"],["22:00","04:00"]]];




function plural_locale_nl(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
return 5;
}

export const locale_nl = ["nl",[["a.m.","p.m."],u,u],u,[["Z","M","D","W","D","V","Z"],["zo","ma","di","wo","do","vr","za"],["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],["zo","ma","di","wo","do","vr","za"]],u,[["J","F","M","A","M","J","J","A","S","O","N","D"],["jan.","feb.","mrt.","apr.","mei","jun.","jul.","aug.","sep.","okt.","nov.","dec."],["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"]],u,[["v.C.","n.C."],["v.Chr.","n.Chr."],["voor Christus","na Christus"]],1,[6,0],["dd-MM-y","d MMM y","d MMMM y","EEEE d MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,"{1} 'om' {0}",u],[",",".",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤ #,##0.00;¤ -#,##0.00","#E0"],"EUR","€","Euro",{"AUD":["AU$","$"],"BYN":[u,"р."],"CAD":["C$","$"],"FJD":["FJ$","$"],"JPY":["JP¥","¥"],"PHP":[u,"₱"],"RUR":[u,"р."],"SBD":["SI$","$"],"THB":["฿"],"TWD":["NT$"],"USD":["US$","$"],"XPF":[],"XXX":[]},"ltr", plural_locale_nl];
export const locale_extra_nl = [[["middernacht","’s ochtends","’s middags","’s avonds","’s nachts"],u,u],[["middernacht","ochtend","middag","avond","nacht"],u,u],["00:00",["06:00","12:00"],["12:00","18:00"],["18:00","24:00"],["00:00","06:00"]]];




function plural_locale_nb(val: number): number {
const n = val;

if (n === 1)
    return 1;
return 5;
}

export const locale_nb = ["nb",[["a","p"],["a.m.","p.m."],u],[["a.m.","p.m."],u,u],[["S","M","T","O","T","F","L"],["søn.","man.","tir.","ons.","tor.","fre.","lør."],["søndag","mandag","tirsdag","onsdag","torsdag","fredag","lørdag"],["sø.","ma.","ti.","on.","to.","fr.","lø."]],u,[["J","F","M","A","M","J","J","A","S","O","N","D"],["jan.","feb.","mar.","apr.","mai","jun.","jul.","aug.","sep.","okt.","nov.","des."],["januar","februar","mars","april","mai","juni","juli","august","september","oktober","november","desember"]],[["J","F","M","A","M","J","J","A","S","O","N","D"],["jan","feb","mar","apr","mai","jun","jul","aug","sep","okt","nov","des"],["januar","februar","mars","april","mai","juni","juli","august","september","oktober","november","desember"]],[["f.Kr.","e.Kr."],u,["før Kristus","etter Kristus"]],1,[6,0],["dd.MM.y","d. MMM y","d. MMMM y","EEEE d. MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}",u,"{1} 'kl'. {0}",u],[","," ",";","%","+","−","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","¤ #,##0.00;¤ -#,##0.00","#E0"],"NOK","kr","norske kroner",{"AUD":[u,"$"],"BRL":[u,"R$"],"BYN":[u,"р."],"CAD":[u,"$"],"CNY":[u,"¥"],"HKD":[u,"$"],"ILS":[u,"₪"],"INR":[u,"₹"],"JPY":[u,"¥"],"KRW":[u,"₩"],"MXN":[u,"$"],"NOK":["kr"],"NZD":[u,"$"],"PHP":[u,"₱"],"RON":[u,"L"],"TWD":[u,"NT$"],"USD":[u,"$"],"VND":[u,"₫"],"XAF":[],"XCD":[u,"$"],"XPF":[],"XXX":[]},"ltr", plural_locale_nb];
export const locale_extra_nb = [[["mn.","mg.","fm.","em.","kv.","nt."],["midn.","morg.","form.","etterm.","kveld","natt"],["midnatt","på morgenen","på formiddagen","på ettermiddagen","på kvelden","på natten"]],[["mn.","mg.","fm.","em.","kv.","nt."],["midn.","morg.","form.","etterm.","kveld","natt"],["midnatt","morgen","formiddag","ettermiddag","kveld","natt"]],["00:00",["06:00","10:00"],["10:00","12:00"],["12:00","18:00"],["18:00","24:00"],["00:00","06:00"]]];

export const locale_no = locale_nb;
export const locale_no_NO = locale_nb;
export const locale_extra_no = locale_extra_nb;
export const locale_extra_no_NO = locale_extra_nb;

function plural_locale_or(val: number): number {
const n = val;

if (n === 1)
    return 1;
return 5;
}

export const locale_or = ["or",[["ପୂ","ଅ"],["AM","PM"],u],[["AM","ଅପରାହ୍ନ"],["ପୂର୍ବାହ୍ନ","ଅପରାହ୍ନ"],u],[["ର","ସୋ","ମ","ବୁ","ଗୁ","ଶୁ","ଶ"],["ରବି","ସୋମ","ମଙ୍ଗଳ","ବୁଧ","ଗୁରୁ","ଶୁକ୍ର","ଶନି"],["ରବିବାର","ସୋମବାର","ମଙ୍ଗଳବାର","ବୁଧବାର","ଗୁରୁବାର","ଶୁକ୍ରବାର","ଶନିବାର"],["ରବି","ସୋମ","ମଙ୍ଗଳ","ବୁଧ","ଗୁରୁ","ଶୁକ୍ର","ଶନି"]],u,[["ଜା","ଫେ","ମା","ଅ","ମଇ","ଜୁ","ଜୁ","ଅ","ସେ","ଅ","ନ","ଡି"],["ଜାନୁଆରୀ","ଫେବୃଆରୀ","ମାର୍ଚ୍ଚ","ଅପ୍ରେଲ","ମଇ","ଜୁନ","ଜୁଲାଇ","ଅଗଷ୍ଟ","ସେପ୍ଟେମ୍ବର","ଅକ୍ଟୋବର","ନଭେମ୍ବର","ଡିସେମ୍ବର"],u],u,[["BC","AD"],u,["ଖ୍ରୀଷ୍ଟପୂର୍ବ","ଖ୍ରୀଷ୍ଟାବ୍ଦ"]],0,[0,0],["M/d/yy","MMM d, y","MMMM d, y","EEEE, MMMM d, y"],["h:mm a","h:mm:ss a","h:mm:ss a z","h:mm:ss a zzzz"],["{1}, {0}",u,"{0} ଠାରେ {1}",u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##,##0.###","#,##0%","¤#,##0.00","#E0"],"INR","₹","ଭାରତୀୟ ଟଙ୍କା",{"BYN":[u,"р."],"PHP":[u,"₱"]},"ltr", plural_locale_or];
export const locale_extra_or = [];




function plural_locale_pa(val: number): number {
const n = val;

if (n === Math.floor(n) && (n >= 0 && n <= 1))
    return 1;
return 5;
}

export const locale_pa = ["pa",[["ਸ.","ਸ਼."],["ਪੂ.ਦੁ.","ਬਾ.ਦੁ."],u],[["ਪੂ.ਦੁ.","ਬਾ.ਦੁ."],u,u],[["ਐ","ਸੋ","ਮੰ","ਬੁੱ","ਵੀ","ਸ਼ੁੱ","ਸ਼"],["ਐਤ","ਸੋਮ","ਮੰਗਲ","ਬੁੱਧ","ਵੀਰ","ਸ਼ੁੱਕਰ","ਸ਼ਨਿੱਚਰ"],["ਐਤਵਾਰ","ਸੋਮਵਾਰ","ਮੰਗਲਵਾਰ","ਬੁੱਧਵਾਰ","ਵੀਰਵਾਰ","ਸ਼ੁੱਕਰਵਾਰ","ਸ਼ਨਿੱਚਰਵਾਰ"],["ਐਤ","ਸੋਮ","ਮੰਗ","ਬੁੱਧ","ਵੀਰ","ਸ਼ੁੱਕ","ਸ਼ਨਿੱ"]],u,[["ਜ","ਫ਼","ਮਾ","ਅ","ਮ","ਜੂ","ਜੁ","ਅ","ਸ","ਅ","ਨ","ਦ"],["ਜਨ","ਫ਼ਰ","ਮਾਰਚ","ਅਪ੍ਰੈ","ਮਈ","ਜੂਨ","ਜੁਲਾ","ਅਗ","ਸਤੰ","ਅਕਤੂ","ਨਵੰ","ਦਸੰ"],["ਜਨਵਰੀ","ਫ਼ਰਵਰੀ","ਮਾਰਚ","ਅਪ੍ਰੈਲ","ਮਈ","ਜੂਨ","ਜੁਲਾਈ","ਅਗਸਤ","ਸਤੰਬਰ","ਅਕਤੂਬਰ","ਨਵੰਬਰ","ਦਸੰਬਰ"]],u,[["ਈ.ਪੂ.","ਸੰਨ"],["ਈ. ਪੂ.","ਸੰਨ"],["ਈਸਵੀ ਪੂਰਵ","ਈਸਵੀ ਸੰਨ"]],0,[0,0],["d/M/yy","d MMM y","d MMMM y","EEEE, d MMMM y"],["h:mm a","h:mm:ss a","h:mm:ss a z","h:mm:ss a zzzz"],["{1}, {0}",u,"{1} {0}",u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##,##0.###","#,##,##0%","¤ #,##,##0.00","[#E0]"],"INR","₹","ਭਾਰਤੀ ਰੁਪਇਆ",{"BYN":[u,"р."],"JPY":["JP¥","¥"],"PHP":[u,"₱"],"THB":["฿"],"TWD":["NT$"],"USD":["US$","$"],"XXX":[]},"ltr", plural_locale_pa];
export const locale_extra_pa = [[["ਅੱਧੀ ਰਾਤ","ਸਵੇਰੇ","ਦੁਪਹਿਰੇ","ਸ਼ਾਮੀਂ","ਰਾਤੀਂ"],u,u],[["ਅੱਧੀ ਰਾਤ","ਸਵੇਰੇ","ਦੁਪਹਿਰੇ","ਸ਼ਾਮੀਂ","ਰਾਤੀਂ"],u,["ਅੱਧੀ ਰਾਤ","ਸਵੇਰੇ","ਦੁਪਹਿਰੇ","ਸ਼ਾਮ","ਰਾਤ"]],["00:00",["04:00","12:00"],["12:00","16:00"],["16:00","21:00"],["21:00","04:00"]]];




function plural_locale_pl(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
if (v === 0 && (i % 10 === Math.floor(i % 10) && (i % 10 >= 2 && i % 10 <= 4) && !(i % 100 >= 12 && i % 100 <= 14)))
    return 3;
if (v === 0 && (!(i === 1) && (i % 10 === Math.floor(i % 10) && (i % 10 >= 0 && i % 10 <= 1))) || (v === 0 && (i % 10 === Math.floor(i % 10) && (i % 10 >= 5 && i % 10 <= 9)) || v === 0 && (i % 100 === Math.floor(i % 100) && (i % 100 >= 12 && i % 100 <= 14))))
    return 4;
return 5;
}

export const locale_pl = ["pl",[["a","p"],["AM","PM"],u],u,[["n","p","w","ś","c","p","s"],["niedz.","pon.","wt.","śr.","czw.","pt.","sob."],["niedziela","poniedziałek","wtorek","środa","czwartek","piątek","sobota"],["nie","pon","wto","śro","czw","pią","sob"]],[["N","P","W","Ś","C","P","S"],["niedz.","pon.","wt.","śr.","czw.","pt.","sob."],["niedziela","poniedziałek","wtorek","środa","czwartek","piątek","sobota"],["nie","pon","wto","śro","czw","pią","sob"]],[["s","l","m","k","m","c","l","s","w","p","l","g"],["sty","lut","mar","kwi","maj","cze","lip","sie","wrz","paź","lis","gru"],["stycznia","lutego","marca","kwietnia","maja","czerwca","lipca","sierpnia","września","października","listopada","grudnia"]],[["S","L","M","K","M","C","L","S","W","P","L","G"],["sty","lut","mar","kwi","maj","cze","lip","sie","wrz","paź","lis","gru"],["styczeń","luty","marzec","kwiecień","maj","czerwiec","lipiec","sierpień","wrzesień","październik","listopad","grudzień"]],[["p.n.e.","n.e."],u,["przed naszą erą","naszej ery"]],1,[6,0],["d.MM.y","d MMM y","d MMMM y","EEEE, d MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}",u,"{1} {0}",u],[","," ",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"PLN","zł","złoty polski",{"AUD":[u,"$"],"CAD":[u,"$"],"CNY":[u,"¥"],"GBP":[u,"£"],"HKD":[u,"$"],"ILS":[u,"₪"],"INR":[u,"₹"],"JPY":[u,"¥"],"KRW":[u,"₩"],"MXN":[u,"$"],"NZD":[u,"$"],"PHP":[u,"₱"],"PLN":["zł"],"RON":[u,"lej"],"TWD":[u,"NT$"],"USD":[u,"$"],"VND":[u,"₫"]},"ltr", plural_locale_pl];
export const locale_extra_pl = [[["o półn.","w poł.","rano","przed poł.","po poł.","wiecz.","w nocy"],["o północy","w południe","rano","przed południem","po południu","wieczorem","w nocy"],u],[["półn.","poł.","rano","przedpoł.","popoł.","wiecz.","noc"],["północ","południe","rano","przedpołudnie","popołudnie","wieczór","noc"],u],["00:00","12:00",["06:00","10:00"],["10:00","12:00"],["12:00","18:00"],["18:00","21:00"],["21:00","06:00"]]];




function plural_locale_pt(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length, e = parseInt(val.toString().replace(/^[^e]*(e([-+]?\d+))?/, '$2')) || 0;

if (i === Math.floor(i) && (i >= 0 && i <= 1))
    return 1;
if (e === 0 && (!(i === 0) && (i % 1000000 === 0 && v === 0)) || !(e >= 0 && e <= 5))
    return 4;
return 5;
}

export const locale_pt = ["pt",[["AM","PM"],u,u],u,[["D","S","T","Q","Q","S","S"],["dom.","seg.","ter.","qua.","qui.","sex.","sáb."],["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"],["dom.","seg.","ter.","qua.","qui.","sex.","sáb."]],u,[["J","F","M","A","M","J","J","A","S","O","N","D"],["jan.","fev.","mar.","abr.","mai.","jun.","jul.","ago.","set.","out.","nov.","dez."],["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"]],u,[["a.C.","d.C."],u,["antes de Cristo","depois de Cristo"]],0,[6,0],["dd/MM/y","d 'de' MMM 'de' y","d 'de' MMMM 'de' y","EEEE, d 'de' MMMM 'de' y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,u,u],[",",".",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤ #,##0.00","#E0"],"BRL","R$","Real brasileiro",{"AUD":["AU$","$"],"BYN":[u,"р."],"JPY":["JP¥","¥"],"PHP":[u,"₱"],"PTE":["Esc."],"RON":[u,"L"],"SYP":[u,"S£"],"THB":["฿"],"TWD":["NT$"],"USD":["US$","$"]},"ltr", plural_locale_pt];
export const locale_extra_pt = [[["meia-noite","meio-dia","da manhã","da tarde","da noite","da madrugada"],u,u],[["meia-noite","meio-dia","manhã","tarde","noite","madrugada"],u,u],["00:00","12:00",["06:00","12:00"],["12:00","19:00"],["19:00","24:00"],["00:00","06:00"]]];

export const locale_pt_BR = locale_pt;
export const locale_extra_pt_BR = locale_extra_pt;

function plural_locale_pt_PT(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length, e = parseInt(val.toString().replace(/^[^e]*(e([-+]?\d+))?/, '$2')) || 0;

if (i === Math.floor(i) && (i >= 0 && i <= 1))
    return 1;
if (e === 0 && (!(i === 0) && (i % 1000000 === 0 && v === 0)) || !(e >= 0 && e <= 5))
    return 4;
return 5;
}

export const locale_pt_PT = ["pt-PT",[["a.m.","p.m."],u,["da manhã","da tarde"]],[["a.m.","p.m."],u,["manhã","tarde"]],[["D","S","T","Q","Q","S","S"],["domingo","segunda","terça","quarta","quinta","sexta","sábado"],["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"],["dom.","seg.","ter.","qua.","qui.","sex.","sáb."]],u,[["J","F","M","A","M","J","J","A","S","O","N","D"],["jan.","fev.","mar.","abr.","mai.","jun.","jul.","ago.","set.","out.","nov.","dez."],["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"]],u,[["a.C.","d.C."],u,["antes de Cristo","depois de Cristo"]],0,[6,0],["dd/MM/yy","dd/MM/y","d 'de' MMMM 'de' y","EEEE, d 'de' MMMM 'de' y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}",u,"{1} 'às' {0}",u],[","," ",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"EUR","€","euro",{"AUD":["AU$","$"],"BYN":[u,"р."],"JPY":["JP¥","¥"],"PHP":[u,"₱"],"PTE":["​"],"RON":[u,"L"],"THB":["฿"],"TWD":["NT$"],"USD":["US$","$"]},"ltr", plural_locale_pt_PT];
export const locale_extra_pt_PT = [[["meia-noite","meio-dia","manhã","tarde","noite","madrugada"],["meia-noite","meio-dia","da manhã","da tarde","da noite","da madrugada"],u],[["meia-noite","meio-dia","manhã","tarde","noite","madrugada"],u,u],["00:00","12:00",["06:00","12:00"],["12:00","19:00"],["19:00","24:00"],["00:00","06:00"]]];




function plural_locale_ro(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
if (!(v === 0) || (n === 0 || n % 100 === Math.floor(n % 100) && (n % 100 >= 2 && n % 100 <= 19)))
    return 3;
return 5;
}

export const locale_ro = ["ro",[["a.m.","p.m."],u,u],u,[["D","L","M","M","J","V","S"],["dum.","lun.","mar.","mie.","joi","vin.","sâm."],["duminică","luni","marți","miercuri","joi","vineri","sâmbătă"],["du.","lu.","ma.","mi.","joi","vi.","sâ."]],u,[["I","F","M","A","M","I","I","A","S","O","N","D"],["ian.","feb.","mar.","apr.","mai","iun.","iul.","aug.","sept.","oct.","nov.","dec."],["ianuarie","februarie","martie","aprilie","mai","iunie","iulie","august","septembrie","octombrie","noiembrie","decembrie"]],u,[["î.Hr.","d.Hr."],u,["înainte de Hristos","după Hristos"]],1,[6,0],["dd.MM.y","d MMM y","d MMMM y","EEEE, d MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}",u,u,u],[",",".",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"RON","RON","leu românesc",{"AUD":[u,"$"],"BRL":[u,"R$"],"BYN":[u,"р."],"CAD":[u,"$"],"CNY":[u,"¥"],"EUR":[u,"€"],"GBP":[u,"£"],"HKD":[u,"$"],"ILS":[u,"₪"],"INR":[u,"₹"],"JPY":[u,"¥"],"KRW":[u,"₩"],"MXN":[u,"$"],"NZD":[u,"$"],"PHP":[u,"₱"],"TWD":[u,"NT$"],"USD":[u,"$"],"VND":[u,"₫"],"XCD":[u,"$"]},"ltr", plural_locale_ro];
export const locale_extra_ro = [[["miezul nopții","la amiază","dimineața","după-amiaza","seara","noaptea"],["miezul nopții","amiază","dimineața","după-amiaza","seara","noaptea"],["la miezul nopții","la amiază","dimineața","după-amiaza","seara","noaptea"]],[["miezul nopții","amiază","dimineața","după-amiaza","seara","noaptea"],u,["la miezul nopții","la amiază","dimineața","după-amiaza","seara","noaptea"]],["00:00","12:00",["05:00","12:00"],["12:00","18:00"],["18:00","22:00"],["22:00","05:00"]]];




function plural_locale_ru(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (v === 0 && (i % 10 === 1 && !(i % 100 === 11)))
    return 1;
if (v === 0 && (i % 10 === Math.floor(i % 10) && (i % 10 >= 2 && i % 10 <= 4) && !(i % 100 >= 12 && i % 100 <= 14)))
    return 3;
if (v === 0 && i % 10 === 0 || (v === 0 && (i % 10 === Math.floor(i % 10) && (i % 10 >= 5 && i % 10 <= 9)) || v === 0 && (i % 100 === Math.floor(i % 100) && (i % 100 >= 11 && i % 100 <= 14))))
    return 4;
return 5;
}

export const locale_ru = ["ru",[["AM","PM"],u,u],u,[["В","П","В","С","Ч","П","С"],["вс","пн","вт","ср","чт","пт","сб"],["воскресенье","понедельник","вторник","среда","четверг","пятница","суббота"],["вс","пн","вт","ср","чт","пт","сб"]],u,[["Я","Ф","М","А","М","И","И","А","С","О","Н","Д"],["янв.","февр.","мар.","апр.","мая","июн.","июл.","авг.","сент.","окт.","нояб.","дек."],["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"]],[["Я","Ф","М","А","М","И","И","А","С","О","Н","Д"],["янв.","февр.","март","апр.","май","июнь","июль","авг.","сент.","окт.","нояб.","дек."],["январь","февраль","март","апрель","май","июнь","июль","август","сентябрь","октябрь","ноябрь","декабрь"]],[["до н.э.","н.э."],["до н. э.","н. э."],["до Рождества Христова","от Рождества Христова"]],1,[6,0],["dd.MM.y","d MMM y 'г'.","d MMMM y 'г'.","EEEE, d MMMM y 'г'."],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}",u,u,u],[","," ",";","%","+","-","E","×","‰","∞","не число",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"RUB","₽","российский рубль",{"BYN":[u,"р."],"GEL":[u,"ლ"],"PHP":[u,"₱"],"RON":[u,"L"],"RUB":["₽"],"RUR":["р."],"THB":["฿"],"TMT":["ТМТ"],"TWD":["NT$"],"UAH":["₴"],"XXX":["XXXX"]},"ltr", plural_locale_ru];
export const locale_extra_ru = [[["полн.","полд.","утра","дня","веч.","ночи"],["полн.","полд.","утра","дня","вечера","ночи"],["полночь","полдень","утра","дня","вечера","ночи"]],[["полн.","полд.","утро","день","веч.","ночь"],u,["полночь","полдень","утро","день","вечер","ночь"]],["00:00","12:00",["04:00","12:00"],["12:00","18:00"],["18:00","22:00"],["22:00","04:00"]]];




function plural_locale_sr_Latn(val: number): number {
const n = val;

return 5;
}

export const locale_sr_Latn = ["sr-Latn",[["AM","PM"],u,u],[["pre podne","po podne"],["AM","PM"],u],[["n","p","u","s","č","p","s"],["ned","pon","uto","sre","čet","pet","sub"],["nedelja","ponedeljak","utorak","sreda","četvrtak","petak","subota"],["ne","po","ut","sr","če","pe","su"]],u,[["j","f","m","a","m","j","j","a","s","o","n","d"],["jan","feb","mar","apr","maj","jun","jul","avg","sep","okt","nov","dec"],["januar","februar","mart","april","maj","jun","jul","avgust","septembar","oktobar","novembar","decembar"]],u,[["p.n.e.","n.e."],["p. n. e.","n. e."],["pre nove ere","nove ere"]],1,[6,0],["d.M.yy.","d. M. y.","d. MMMM y.","EEEE, d. MMMM y."],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,u,u],[",",".",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"RSD","RSD","srpski dinar",{"AUD":[u,"$"],"BAM":["KM"],"BYN":[u,"r."],"GEL":[u,"ლ"],"KRW":[u,"₩"],"NZD":[u,"$"],"PHP":[u,"₱"],"TWD":["NT$"],"USD":["US$","$"],"VND":[u,"₫"]},"ltr", plural_locale_sr_Latn];
export const locale_extra_sr_Latn = [[["ponoć","podne","ujutru","po podne","uveče","noću"],["ponoć","podne","ujutro","po podne","uveče","noću"],u],[["ponoć","podne","jutro","popodne","veče","noć"],u,u],["00:00","12:00",["06:00","12:00"],["12:00","18:00"],["18:00","21:00"],["21:00","06:00"]]];

export const locale_sh = locale_sr_Latn;
export const locale_extra_sh = locale_extra_sr_Latn;

function plural_locale_si(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), f = parseInt(val.toString().replace(/^[^.]*\.?/, ''), 10) || 0;

if (n === 0 || n === 1 || i === 0 && f === 1)
    return 1;
return 5;
}

export const locale_si = ["si",[["පෙ","ප"],["පෙ.ව.","ප.ව."],u],[["පෙ.ව.","ප.ව."],u,u],[["ඉ","ස","අ","බ","බ්‍ර","සි","සෙ"],["ඉරිදා","සඳුදා","අඟහ","බදාදා","බ්‍රහස්","සිකු","සෙන"],["ඉරිදා","සඳුදා","අඟහරුවාදා","බදාදා","බ්‍රහස්පතින්දා","සිකුරාදා","සෙනසුරාදා"],["ඉරි","සඳු","අඟ","බදා","බ්‍රහ","සිකු","සෙන"]],u,[["ජ","පෙ","මා","අ","මැ","ජූ","ජූ","අ","සැ","ඔ","නෙ","දෙ"],["ජන","පෙබ","මාර්තු","අප්‍රේල්","මැයි","ජූනි","ජූලි","අගෝ","සැප්","ඔක්","නොවැ","දෙසැ"],["ජනවාරි","පෙබරවාරි","මාර්තු","අප්‍රේල්","මැයි","ජූනි","ජූලි","අගෝස්තු","සැප්තැම්බර්","ඔක්තෝබර්","නොවැම්බර්","දෙසැම්බර්"]],[["ජ","පෙ","මා","අ","මැ","ජූ","ජූ","අ","සැ","ඔ","නෙ","දෙ"],["ජන","පෙබ","මාර්","අප්‍රේල්","මැයි","ජූනි","ජූලි","අගෝ","සැප්","ඔක්","නොවැ","දෙසැ"],["ජනවාරි","පෙබරවාරි","මාර්තු","අප්‍රේල්","මැයි","ජූනි","ජූලි","අගෝස්තු","සැප්තැම්බර්","ඔක්තෝබර්","නොවැම්බර්","දෙසැම්බර්"]],[["ක්‍රි.පූ.","ක්‍රි.ව."],u,["ක්‍රිස්තු පූර්ව","ක්‍රිස්තු වර්ෂ"]],1,[6,0],["y-MM-dd","y MMM d","y MMMM d","y MMMM d, EEEE"],["HH.mm","HH.mm.ss","HH.mm.ss z","HH.mm.ss zzzz"],["{1} {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","NaN","."],["#,##0.###","#,##0%","¤#,##0.00","#"],"LKR","රු.","ශ්‍රී ලංකා රුපියල",{"BYN":[u,"р."],"JPY":["JP¥","¥"],"LKR":["රු."],"PHP":[u,"₱"],"THB":["฿"],"TWD":["NT$"],"USD":["US$","$"],"XOF":["සිෆ්එ"]},"ltr", plural_locale_si];
export const locale_extra_si = [[["මැ","ම","පා","උ","ද","හ","රෑ","මැ"],["මැදියම","මධ්‍යාහ්නය","පාන්දර","උදේ","දවල්","හවස","රෑ","මැදියමට පසු"],u],[["මැදියම","මධ්‍යාහ්නය","පාන්දර","උදේ","දවල්","හවස","රෑ","මැදියමට පසු"],u,u],["00:00","12:00",["01:00","06:00"],["06:00","12:00"],["12:00","14:00"],["14:00","18:00"],["18:00","24:00"],["00:00","01:00"]]];




function plural_locale_sk(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
if (i === Math.floor(i) && (i >= 2 && i <= 4) && v === 0)
    return 3;
if (!(v === 0))
    return 4;
return 5;
}

export const locale_sk = ["sk",[["AM","PM"],u,u],u,[["n","p","u","s","š","p","s"],["ne","po","ut","st","št","pi","so"],["nedeľa","pondelok","utorok","streda","štvrtok","piatok","sobota"],["ne","po","ut","st","št","pi","so"]],u,[["j","f","m","a","m","j","j","a","s","o","n","d"],["jan","feb","mar","apr","máj","jún","júl","aug","sep","okt","nov","dec"],["januára","februára","marca","apríla","mája","júna","júla","augusta","septembra","októbra","novembra","decembra"]],[["j","f","m","a","m","j","j","a","s","o","n","d"],["jan","feb","mar","apr","máj","jún","júl","aug","sep","okt","nov","dec"],["január","február","marec","apríl","máj","jún","júl","august","september","október","november","december"]],[["pred Kr.","po Kr."],u,["pred Kristom","po Kristovi"]],1,[6,0],["d. M. y",u,"d. MMMM y","EEEE d. MMMM y"],["H:mm","H:mm:ss","H:mm:ss z","H:mm:ss zzzz"],["{1} {0}","{1}, {0}",u,u],[","," ",";","%","+","-","e","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"EUR","€","euro",{"AUD":[u,"$"],"BRL":[u,"R$"],"BYN":[u,"р."],"CAD":[u,"$"],"CNY":[u,"¥"],"GBP":[u,"£"],"HKD":[u,"$"],"ILS":["NIS","₪"],"INR":[u,"₹"],"JPY":[u,"¥"],"KRW":[u,"₩"],"NZD":[u,"$"],"PHP":[u,"₱"],"RUR":[u,"р."],"TWD":[u,"NT$"],"USD":[u,"$"],"VND":[u,"₫"],"XXX":[]},"ltr", plural_locale_sk];
export const locale_extra_sk = [[["o poln.","nap.","ráno","dop.","pop.","več.","v n."],["o poln.","napol.","ráno","dopol.","popol.","večer","v noci"],["o polnoci","napoludnie","ráno","dopoludnia","popoludní","večer","v noci"]],[["poln.","pol.","ráno","dop.","pop.","več.","noc"],["poln.","pol.","ráno","dopol.","popol.","večer","noc"],["polnoc","poludnie","ráno","dopoludnie","popoludnie","večer","noc"]],["00:00","12:00",["04:00","09:00"],["09:00","12:00"],["12:00","18:00"],["18:00","22:00"],["22:00","04:00"]]];




function plural_locale_sl(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (v === 0 && i % 100 === 1)
    return 1;
if (v === 0 && i % 100 === 2)
    return 2;
if (v === 0 && (i % 100 === Math.floor(i % 100) && (i % 100 >= 3 && i % 100 <= 4)) || !(v === 0))
    return 3;
return 5;
}

export const locale_sl = ["sl",[["d","p"],["dop.","pop."],u],[["d","p"],["dop.","pop."],["dopoldne","popoldne"]],[["n","p","t","s","č","p","s"],["ned.","pon.","tor.","sre.","čet.","pet.","sob."],["nedelja","ponedeljek","torek","sreda","četrtek","petek","sobota"],["ned.","pon.","tor.","sre.","čet.","pet.","sob."]],u,[["j","f","m","a","m","j","j","a","s","o","n","d"],["jan.","feb.","mar.","apr.","maj","jun.","jul.","avg.","sep.","okt.","nov.","dec."],["januar","februar","marec","april","maj","junij","julij","avgust","september","oktober","november","december"]],u,[["pr. Kr.","po Kr."],u,["pred Kristusom","po Kristusu"]],1,[6,0],["d. MM. yy","d. MMM y","d. MMMM y","EEEE, d. MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}",u,"{1} {0}",u],[",",".",";","%","+","−","e","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"EUR","€","evro",{"AUD":[u,"$"],"BRL":[u,"R$"],"BYN":[u,"р."],"CAD":[u,"$"],"GBP":[u,"£"],"MXN":[u,"$"],"NZD":[u,"$"],"PHP":[u,"₱"],"TWD":[u,"NT$"],"XCD":[u,"$"]},"ltr", plural_locale_sl];
export const locale_extra_sl = [[["24.00","12.00","zj","d","p","zv","po"],["opoln.","opold.","zjut.","dop.","pop.","zveč.","ponoči"],["opolnoči","opoldne","zjutraj","dopoldan","popoldan","zvečer","ponoči"]],[["24.00","12.00","j","d","p","v","n"],["poln.","pold.","jut.","dop.","pop.","zveč.","noč"],["polnoč","poldne","jutro","dopoldne","popoldne","večer","noč"]],["00:00","12:00",["06:00","10:00"],["10:00","12:00"],["12:00","18:00"],["18:00","22:00"],["22:00","06:00"]]];




function plural_locale_sq(val: number): number {
const n = val;

if (n === 1)
    return 1;
return 5;
}

export const locale_sq = ["sq",[["p.d.","m.d."],u,["e paradites","e pasdites"]],[["p.d.","m.d."],u,["paradite","pasdite"]],[["d","h","m","m","e","p","sh"],["Die","Hën","Mar","Mër","Enj","Pre","Sht"],["e diel","e hënë","e martë","e mërkurë","e enjte","e premte","e shtunë"],["die","hën","mar","mër","enj","pre","sht"]],[["d","h","m","m","e","p","sh"],["die","hën","mar","mër","enj","pre","sht"],["e diel","e hënë","e martë","e mërkurë","e enjte","e premte","e shtunë"],["die","hën","mar","mër","enj","pre","sht"]],[["j","sh","m","p","m","q","k","g","sh","t","n","dh"],["jan","shk","mar","pri","maj","qer","korr","gush","sht","tet","nën","dhj"],["janar","shkurt","mars","prill","maj","qershor","korrik","gusht","shtator","tetor","nëntor","dhjetor"]],u,[["p.K.","mb.K."],u,["para Krishtit","mbas Krishtit"]],1,[6,0],["d.M.yy","d MMM y","d MMMM y","EEEE, d MMMM y"],["h:mm a","h:mm:ss a","h:mm:ss a, z","h:mm:ss a, zzzz"],["{1}, {0}",u,"{1} 'në' {0}",u],[","," ",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"ALL","Lekë","Leku shqiptar",{"AFN":[],"ALL":["Lekë"],"AMD":[],"AOA":[],"ARS":[],"AUD":["A$","AUD"],"AZN":[],"BAM":[],"BBD":[],"BDT":[],"BMD":[],"BND":[],"BOB":[],"BRL":[],"BSD":[],"BWP":[],"BZD":[],"CAD":["CA$","CAD"],"CLP":[],"CNY":["CN¥","CNY"],"COP":[],"CRC":[],"CUC":[],"CUP":[],"CZK":[],"DKK":[],"DOP":[],"EGP":[],"FJD":[],"FKP":[],"GBP":["£","GBP"],"GEL":[],"GIP":[],"GNF":[],"GTQ":[],"GYD":[],"HKD":["HK$","HKS"],"HNL":[],"HRK":[],"HUF":[],"IDR":[],"ILS":["₪","ILS"],"INR":["₹","INR"],"ISK":[],"JMD":[],"JPY":["JP¥","JPY"],"KHR":[],"KMF":[],"KPW":[],"KRW":["₩","KRW"],"KYD":[],"KZT":[],"LAK":[],"LBP":[],"LKR":[],"LRD":[],"MGA":[],"MMK":[],"MNT":[],"MUR":[],"MXN":["MX$","MXN"],"MYR":[],"NAD":[],"NGN":[],"NIO":[],"NOK":[],"NPR":[],"NZD":["NZ$","NZD"],"PHP":[],"PKR":[],"PLN":[],"PYG":[],"RON":[],"RUB":[],"RWF":[],"SBD":[],"SEK":[],"SGD":[],"SHP":[],"SRD":[],"SSP":[],"STN":[],"SYP":[],"THB":["฿","THB"],"TOP":[],"TRY":[],"TTD":[],"TWD":["NT$","TWD"],"UAH":[],"USD":["US$","USD"],"UYU":[],"VND":["₫","VND"],"XCD":["EC$","XCD"],"ZAR":[],"ZMW":[]},"ltr", plural_locale_sq];
export const locale_extra_sq = [[["e mesnatës","e mesditës","e mëngjesit","e paradites","e pasdites","e mbrëmjes","e natës"],u,u],[["mesnatë","mesditë","mëngjes","paradite","pasdite","mbrëmje","natë"],u,u],["00:00","12:00",["04:00","09:00"],["09:00","12:00"],["12:00","18:00"],["18:00","24:00"],["00:00","04:00"]]];




function plural_locale_sr(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length, f = parseInt(val.toString().replace(/^[^.]*\.?/, ''), 10) || 0;

if (v === 0 && (i % 10 === 1 && !(i % 100 === 11)) || f % 10 === 1 && !(f % 100 === 11))
    return 1;
if (v === 0 && (i % 10 === Math.floor(i % 10) && (i % 10 >= 2 && i % 10 <= 4) && !(i % 100 >= 12 && i % 100 <= 14)) || f % 10 === Math.floor(f % 10) && (f % 10 >= 2 && f % 10 <= 4) && !(f % 100 >= 12 && f % 100 <= 14))
    return 3;
return 5;
}

export const locale_sr = ["sr",[["AM","PM"],u,u],[["пре подне","по подне"],["AM","PM"],u],[["н","п","у","с","ч","п","с"],["нед","пон","уто","сре","чет","пет","суб"],["недеља","понедељак","уторак","среда","четвртак","петак","субота"],["не","по","ут","ср","че","пе","су"]],u,[["ј","ф","м","а","м","ј","ј","а","с","о","н","д"],["јан","феб","мар","апр","мај","јун","јул","авг","сеп","окт","нов","дец"],["јануар","фебруар","март","април","мај","јун","јул","август","септембар","октобар","новембар","децембар"]],u,[["п.н.е.","н.е."],["п. н. е.","н. е."],["пре нове ере","нове ере"]],1,[6,0],["d.M.yy.","d. M. y.","d. MMMM y.","EEEE, d. MMMM y."],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,u,u],[",",".",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"RSD","RSD","српски динар",{"AUD":[u,"$"],"BAM":["КМ","KM"],"BYN":[u,"р."],"GEL":[u,"ლ"],"KRW":[u,"₩"],"NZD":[u,"$"],"PHP":[u,"₱"],"TWD":["NT$"],"USD":["US$","$"],"VND":[u,"₫"]},"ltr", plural_locale_sr];
export const locale_extra_sr = [[["поноћ","подне","ујутру","по подне","увече","ноћу"],["поноћ","подне","ујутро","по подне","увече","ноћу"],u],[["поноћ","подне","јутро","поподне","вече","ноћ"],u,u],["00:00","12:00",["06:00","12:00"],["12:00","18:00"],["18:00","21:00"],["21:00","06:00"]]];




function plural_locale_sv(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
return 5;
}

export const locale_sv = ["sv",[["fm","em"],u,u],[["fm","em"],["f.m.","e.m."],["förmiddag","eftermiddag"]],[["S","M","T","O","T","F","L"],["sön","mån","tis","ons","tors","fre","lör"],["söndag","måndag","tisdag","onsdag","torsdag","fredag","lördag"],["sö","må","ti","on","to","fr","lö"]],u,[["J","F","M","A","M","J","J","A","S","O","N","D"],["jan.","feb.","mars","apr.","maj","juni","juli","aug.","sep.","okt.","nov.","dec."],["januari","februari","mars","april","maj","juni","juli","augusti","september","oktober","november","december"]],u,[["f.Kr.","e.Kr."],u,["före Kristus","efter Kristus"]],1,[6,0],["y-MM-dd","d MMM y","d MMMM y","EEEE d MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,u,u],[","," ",";","%","+","−","×10^","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"SEK","kr","svensk krona",{"AUD":[u,"$"],"BBD":["Bds$","$"],"BMD":["BM$","$"],"BRL":["BR$","R$"],"BSD":["BS$","$"],"BYN":[u,"р."],"BZD":["BZ$","$"],"CNY":[u,"¥"],"DKK":["Dkr","kr"],"DOP":["RD$","$"],"EEK":["Ekr"],"EGP":["EG£","E£"],"ESP":[],"GBP":[u,"£"],"HKD":[u,"$"],"IEP":["IE£"],"INR":[u,"₹"],"ISK":["Ikr","kr"],"JMD":["JM$","$"],"JPY":[u,"¥"],"KRW":[u,"₩"],"NOK":["Nkr","kr"],"NZD":[u,"$"],"PHP":[u,"₱"],"RON":[u,"L"],"SEK":["kr"],"TWD":[u,"NT$"],"USD":["US$","$"],"VND":[u,"₫"]},"ltr", plural_locale_sv];
export const locale_extra_sv = [[["midn.","på morg.","på förm.","på efterm.","på kvällen","på natten"],["midnatt","på morg.","på förm.","på efterm.","på kvällen","på natten"],["midnatt","på morgonen","på förmiddagen","på eftermiddagen","på kvällen","på natten"]],[["midn.","morg.","förm.","efterm.","kväll","natt"],["midnatt","morgon","förm.","efterm.","kväll","natt"],["midnatt","morgon","förmiddag","eftermiddag","kväll","natt"]],["00:00",["05:00","10:00"],["10:00","12:00"],["12:00","18:00"],["18:00","24:00"],["00:00","05:00"]]];




function plural_locale_sw(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
return 5;
}

export const locale_sw = ["sw",[["am","pm"],["AM","PM"],u],[["AM","PM"],u,u],[["S","M","T","W","T","F","S"],["Jumapili","Jumatatu","Jumanne","Jumatano","Alhamisi","Ijumaa","Jumamosi"],u,u],u,[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jan","Feb","Mac","Apr","Mei","Jun","Jul","Ago","Sep","Okt","Nov","Des"],["Januari","Februari","Machi","Aprili","Mei","Juni","Julai","Agosti","Septemba","Oktoba","Novemba","Desemba"]],u,[["KK","BK"],u,["Kabla ya Kristo","Baada ya Kristo"]],1,[6,0],["dd/MM/y","d MMM y","d MMMM y","EEEE, d MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤ #,##0.00","#E0"],"TZS","TSh","Shilingi ya Tanzania",{"BYN":[u,"р."],"JPY":["JP¥","¥"],"KES":["Ksh"],"PHP":[u,"₱"],"THB":["฿"],"TWD":["NT$"],"TZS":["TSh"],"USD":["US$","$"]},"ltr", plural_locale_sw];
export const locale_extra_sw = [[["usiku","mchana","alfajiri","asubuhi","mchana","jioni","usiku"],["saa sita za usiku","adhuhuri","alfajiri","asubuhi","mchana","jioni","usiku"],["saa sita za usiku","saa sita za mchana","alfajiri","asubuhi","mchana","jioni","usiku"]],[["saa sita za usiku","saa sita za mchana","alfajiri","asubuhi","mchana","jioni","usiku"],["saa sita za usiku","adhuhuri","alfajiri","asubuhi","alasiri","jioni","usiku"],["saa sita za usiku","saa sita za mchana","alfajiri","asubuhi","mchana","jioni","usiku"]],["00:00","12:00",["04:00","07:00"],["07:00","12:00"],["12:00","16:00"],["16:00","19:00"],["19:00","04:00"]]];




function plural_locale_ta(val: number): number {
const n = val;

if (n === 1)
    return 1;
return 5;
}

export const locale_ta = ["ta",[["மு.ப","பி.ப"],["முற்பகல்","பிற்பகல்"],u],u,[["ஞா","தி","செ","பு","வி","வெ","ச"],["ஞாயி.","திங்.","செவ்.","புத.","வியா.","வெள்.","சனி"],["ஞாயிறு","திங்கள்","செவ்வாய்","புதன்","வியாழன்","வெள்ளி","சனி"],["ஞா","தி","செ","பு","வி","வெ","ச"]],u,[["ஜ","பி","மா","ஏ","மே","ஜூ","ஜூ","ஆ","செ","அ","ந","டி"],["ஜன.","பிப்.","மார்.","ஏப்.","மே","ஜூன்","ஜூலை","ஆக.","செப்.","அக்.","நவ.","டிச."],["ஜனவரி","பிப்ரவரி","மார்ச்","ஏப்ரல்","மே","ஜூன்","ஜூலை","ஆகஸ்ட்","செப்டம்பர்","அக்டோபர்","நவம்பர்","டிசம்பர்"]],u,[["கி.மு.","கி.பி."],u,["கிறிஸ்துவுக்கு முன்","அன்னோ டோமினி"]],0,[0,0],["d/M/yy","d MMM, y","d MMMM, y","EEEE, d MMMM, y"],["a h:mm","a h:mm:ss","a h:mm:ss z","a h:mm:ss zzzz"],["{1}, {0}",u,"{1} அன்று {0}",u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##,##0.###","#,##,##0%","¤ #,##,##0.00","#E0"],"INR","₹","இந்திய ரூபாய்",{"BYN":[u,"р."],"PHP":[u,"₱"],"THB":["฿"],"TWD":["NT$"]},"ltr", plural_locale_ta];
export const locale_extra_ta = [[["நள்.","நண்.","அதி.","கா.","மதி.","பிற்.","மா.","அந்தி மா.","இர."],["நள்ளிரவு","நண்பகல்","அதிகாலை","காலை","மதியம்","பிற்பகல்","மாலை","அந்தி மாலை","இரவு"],u],[["நள்.","நண்.","அதி.","கா.","மதி.","பிற்.","மா.","அந்தி மா.","இ."],["நள்ளிரவு","நண்பகல்","அதிகாலை","காலை","மதியம்","பிற்பகல்","மாலை","அந்தி மாலை","இரவு"],u],["00:00","12:00",["03:00","05:00"],["05:00","12:00"],["12:00","14:00"],["14:00","16:00"],["16:00","18:00"],["18:00","21:00"],["21:00","03:00"]]];




function plural_locale_te(val: number): number {
const n = val;

if (n === 1)
    return 1;
return 5;
}

export const locale_te = ["te",[["ఉ","సా"],["AM","PM"],u],[["AM","PM"],u,u],[["ఆ","సో","మ","బు","గు","శు","శ"],["ఆది","సోమ","మంగళ","బుధ","గురు","శుక్ర","శని"],["ఆదివారం","సోమవారం","మంగళవారం","బుధవారం","గురువారం","శుక్రవారం","శనివారం"],["ఆది","సోమ","మం","బుధ","గురు","శుక్ర","శని"]],u,[["జ","ఫి","మా","ఏ","మే","జూ","జు","ఆ","సె","అ","న","డి"],["జన","ఫిబ్ర","మార్చి","ఏప్రి","మే","జూన్","జులై","ఆగ","సెప్టెం","అక్టో","నవం","డిసెం"],["జనవరి","ఫిబ్రవరి","మార్చి","ఏప్రిల్","మే","జూన్","జులై","ఆగస్టు","సెప్టెంబర్","అక్టోబర్","నవంబర్","డిసెంబర్"]],u,[["క్రీపూ","క్రీశ"],u,["క్రీస్తు పూర్వం","క్రీస్తు శకం"]],0,[0,0],["dd-MM-yy","d MMM, y","d MMMM, y","d, MMMM y, EEEE"],["h:mm a","h:mm:ss a","h:mm:ss a z","h:mm:ss a zzzz"],["{1} {0}",u,"{1} {0}కి",u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##,##0.###","#,##0%","¤#,##,##0.00","#E0"],"INR","₹","భారతదేశ రూపాయి",{"BYN":[u,"р."],"JPY":["JP¥","¥"],"PHP":[u,"₱"],"THB":["฿"],"TWD":["NT$"]},"ltr", plural_locale_te];
export const locale_extra_te = [[["అర్ధరాత్రి","ఉదయం","మధ్యాహ్నం","సాయంత్రం","రాత్రి"],u,u],u,["00:00",["06:00","12:00"],["12:00","18:00"],["18:00","21:00"],["21:00","06:00"]]];




function plural_locale_th(val: number): number {
const n = val;

return 5;
}

export const locale_th = ["th",[["a","p"],["ก่อนเที่ยง","หลังเที่ยง"],u],[["ก่อนเที่ยง","หลังเที่ยง"],u,u],[["อา","จ","อ","พ","พฤ","ศ","ส"],["อา.","จ.","อ.","พ.","พฤ.","ศ.","ส."],["วันอาทิตย์","วันจันทร์","วันอังคาร","วันพุธ","วันพฤหัสบดี","วันศุกร์","วันเสาร์"],["อา.","จ.","อ.","พ.","พฤ.","ศ.","ส."]],u,[["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."],u,["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"]],u,[["ก่อน ค.ศ.","ค.ศ."],u,["ปีก่อนคริสตกาล","คริสต์ศักราช"]],0,[6,0],["d/M/yy","d MMM y","d MMMM G y","EEEEที่ d MMMM G y"],["HH:mm","HH:mm:ss","H นาฬิกา mm นาที ss วินาที z","H นาฬิกา mm นาที ss วินาที zzzz"],["{1} {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"THB","฿","บาท",{"AUD":["AU$","$"],"BYN":[u,"р."],"PHP":[u,"₱"],"THB":["฿"],"TWD":["NT$"],"USD":["US$","$"],"XXX":[]},"ltr", plural_locale_th];
export const locale_extra_th = [[["เที่ยงคืน","เที่ยง","เช้า","เที่ยง","บ่าย","เย็น","ค่ำ","กลางคืน"],["เที่ยงคืน","เที่ยง","ในตอนเช้า","ในตอนบ่าย","บ่าย","ในตอนเย็น","ค่ำ","กลางคืน"],u],[["เที่ยงคืน","เที่ยง","เช้า","ช่วงเที่ยง","บ่าย","เย็น","ค่ำ","กลางคืน"],["เที่ยงคืน","เที่ยง","ในตอนเช้า","ในตอนบ่าย","บ่าย","ในตอนเย็น","ค่ำ","กลางคืน"],u],["00:00","12:00",["06:00","12:00"],["12:00","13:00"],["13:00","16:00"],["16:00","18:00"],["18:00","21:00"],["21:00","06:00"]]];




function plural_locale_fil(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length, f = parseInt(val.toString().replace(/^[^.]*\.?/, ''), 10) || 0;

if (v === 0 && (i === 1 || (i === 2 || i === 3)) || (v === 0 && !(i % 10 === 4 || (i % 10 === 6 || i % 10 === 9)) || !(v === 0) && !(f % 10 === 4 || (f % 10 === 6 || f % 10 === 9))))
    return 1;
return 5;
}

export const locale_fil = ["fil",[["am","pm"],["AM","PM"],u],[["AM","PM"],u,u],[["Lin","Lun","Mar","Miy","Huw","Biy","Sab"],u,["Linggo","Lunes","Martes","Miyerkules","Huwebes","Biyernes","Sabado"],["Li","Lu","Ma","Mi","Hu","Bi","Sa"]],u,[["Ene","Peb","Mar","Abr","May","Hun","Hul","Ago","Set","Okt","Nob","Dis"],u,["Enero","Pebrero","Marso","Abril","Mayo","Hunyo","Hulyo","Agosto","Setyembre","Oktubre","Nobyembre","Disyembre"]],[["E","P","M","A","M","Hun","Hul","Ago","Set","Okt","Nob","Dis"],["Ene","Peb","Mar","Abr","May","Hun","Hul","Ago","Set","Okt","Nob","Dis"],["Enero","Pebrero","Marso","Abril","Mayo","Hunyo","Hulyo","Agosto","Setyembre","Oktubre","Nobyembre","Disyembre"]],[["BC","AD"],u,["Before Christ","Anno Domini"]],0,[6,0],["M/d/yy","MMM d, y","MMMM d, y","EEEE, MMMM d, y"],["h:mm a","h:mm:ss a","h:mm:ss a z","h:mm:ss a zzzz"],["{1}, {0}",u,"{1} 'nang' {0}",u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"PHP","₱","Piso ng Pilipinas",{"BYN":[u,"р."],"THB":["฿"],"TWD":["NT$"]},"ltr", plural_locale_fil];
export const locale_extra_fil = [[["hatinggabi","tanghaling-tapat","umaga","madaling-araw","sa hapon","sa gabi","gabi"],["hatinggabi","tanghaling-tapat","nang umaga","madaling-araw","tanghali","ng hapon","gabi"],["hatinggabi","tanghaling-tapat","nang umaga","madaling-araw","tanghali","ng hapon","ng gabi"]],[["hatinggabi","tanghaling-tapat","umaga","madaling-araw","tanghali","gabi","gabi"],["hatinggabi","tanghaling-tapat","umaga","madaling-araw","tanghali","hapon","gabi"],u],["00:00","12:00",["00:00","06:00"],["06:00","12:00"],["12:00","16:00"],["16:00","18:00"],["18:00","24:00"]]];

export const locale_tl = locale_fil;
export const locale_extra_tl = locale_extra_fil;

function plural_locale_tr(val: number): number {
const n = val;

if (n === 1)
    return 1;
return 5;
}

export const locale_tr = ["tr",[["öö","ös"],["ÖÖ","ÖS"],u],[["ÖÖ","ÖS"],u,u],[["P","P","S","Ç","P","C","C"],["Paz","Pzt","Sal","Çar","Per","Cum","Cmt"],["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"],["Pa","Pt","Sa","Ça","Pe","Cu","Ct"]],u,[["O","Ş","M","N","M","H","T","A","E","E","K","A"],["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"],["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"]],u,[["MÖ","MS"],u,["Milattan Önce","Milattan Sonra"]],1,[6,0],["d.MM.y","d MMM y","d MMMM y","d MMMM y EEEE"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,u,u],[",",".",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","%#,##0","¤#,##0.00","#E0"],"TRY","₺","Türk Lirası",{"AUD":["AU$","$"],"BYN":[u,"р."],"PHP":[u,"₱"],"RON":[u,"L"],"RUR":[u,"р."],"THB":["฿"],"TRY":["₺"],"TWD":["NT$"]},"ltr", plural_locale_tr];
export const locale_extra_tr = [[["gece","ö","sabah","öğleden önce","öğleden sonra","akşamüstü","akşam","gece"],["gece yarısı","öğle","sabah","öğleden önce","öğleden sonra","akşamüstü","akşam","gece"],u],[["gece yarısı","öğle","sabah","öğleden önce","öğleden sonra","akşamüstü","akşam","gece"],u,u],["00:00","12:00",["06:00","11:00"],["11:00","12:00"],["12:00","18:00"],["18:00","19:00"],["19:00","21:00"],["21:00","06:00"]]];




function plural_locale_uk(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (v === 0 && (i % 10 === 1 && !(i % 100 === 11)))
    return 1;
if (v === 0 && (i % 10 === Math.floor(i % 10) && (i % 10 >= 2 && i % 10 <= 4) && !(i % 100 >= 12 && i % 100 <= 14)))
    return 3;
if (v === 0 && i % 10 === 0 || (v === 0 && (i % 10 === Math.floor(i % 10) && (i % 10 >= 5 && i % 10 <= 9)) || v === 0 && (i % 100 === Math.floor(i % 100) && (i % 100 >= 11 && i % 100 <= 14))))
    return 4;
return 5;
}

export const locale_uk = ["uk",[["дп","пп"],u,u],u,[["Н","П","В","С","Ч","П","С"],["нд","пн","вт","ср","чт","пт","сб"],["неділя","понеділок","вівторок","середа","четвер","пʼятниця","субота"],["нд","пн","вт","ср","чт","пт","сб"]],u,[["с","л","б","к","т","ч","л","с","в","ж","л","г"],["січ.","лют.","бер.","квіт.","трав.","черв.","лип.","серп.","вер.","жовт.","лист.","груд."],["січня","лютого","березня","квітня","травня","червня","липня","серпня","вересня","жовтня","листопада","грудня"]],[["С","Л","Б","К","Т","Ч","Л","С","В","Ж","Л","Г"],["січ","лют","бер","кві","тра","чер","лип","сер","вер","жов","лис","гру"],["січень","лютий","березень","квітень","травень","червень","липень","серпень","вересень","жовтень","листопад","грудень"]],[["до н.е.","н.е."],["до н. е.","н. е."],["до нашої ери","нашої ери"]],1,[6,0],["dd.MM.yy","d MMM y 'р'.","d MMMM y 'р'.","EEEE, d MMMM y 'р'."],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1}, {0}",u,"{1} 'о' {0}",u],[","," ",";","%","+","-","Е","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"UAH","₴","українська гривня",{"AUD":[u,"$"],"BRL":[u,"R$"],"BYN":[u,"р."],"CAD":[u,"$"],"CNY":[u,"¥"],"EUR":[u,"€"],"GBP":[u,"£"],"HKD":[u,"$"],"ILS":[u,"₪"],"INR":[u,"₹"],"KRW":[u,"₩"],"MXN":[u,"$"],"NZD":[u,"$"],"PHP":[u,"₱"],"RUR":[u,"р."],"TWD":[u,"$"],"UAH":["₴"],"UAK":["крб."],"USD":[u,"$"],"VND":[u,"₫"],"XCD":[u,"$"]},"ltr", plural_locale_uk];
export const locale_extra_uk = [[["північ","п","ранку","дня","вечора","ночі"],["опівночі","пополудні","ранку","дня","вечора","ночі"],u],[["північ","полудень","ранок","день","вечір","ніч"],u,u],["00:00","12:00",["04:00","12:00"],["12:00","18:00"],["18:00","24:00"],["00:00","04:00"]]];




function plural_locale_ur(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
return 5;
}

export const locale_ur = ["ur",[["a","p"],["AM","PM"],u],[["AM","PM"],u,u],[["S","M","T","W","T","F","S"],["اتوار","پیر","منگل","بدھ","جمعرات","جمعہ","ہفتہ"],u,u],u,[["J","F","M","A","M","J","J","A","S","O","N","D"],["جنوری","فروری","مارچ","اپریل","مئی","جون","جولائی","اگست","ستمبر","اکتوبر","نومبر","دسمبر"],u],u,[["قبل مسیح","عیسوی"],u,u],0,[6,0],["d/M/yy","d MMM، y","d MMMM، y","EEEE، d MMMM، y"],["h:mm a","h:mm:ss a","h:mm:ss a z","h:mm:ss a zzzz"],["{1} {0}",u,u,u],[".",",",";","%","‎+","‎-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤ #,##0.00","#E0"],"PKR","Rs","پاکستانی روپیہ",{"BYN":[u,"р."],"JPY":["JP¥","¥"],"PHP":[u,"₱"],"PKR":["Rs"],"THB":["฿"],"TWD":["NT$"]},"rtl", plural_locale_ur];
export const locale_extra_ur = [[["آدھی رات","صبح","دوپہر","سہ پہر","شام","رات"],u,["آدھی رات","صبح میں","دوپہر میں","سہ پہر","شام میں","رات میں"]],[["آدھی رات","صبح","دوپہر","سہ پہر","شام","رات"],u,u],["00:00",["04:00","12:00"],["12:00","16:00"],["16:00","18:00"],["18:00","20:00"],["20:00","04:00"]]];




function plural_locale_uz(val: number): number {
const n = val;

if (n === 1)
    return 1;
return 5;
}

export const locale_uz = ["uz",[["TO","TK"],u,u],u,[["Y","D","S","C","P","J","S"],["Yak","Dush","Sesh","Chor","Pay","Jum","Shan"],["yakshanba","dushanba","seshanba","chorshanba","payshanba","juma","shanba"],["Ya","Du","Se","Ch","Pa","Ju","Sh"]],u,[["Y","F","M","A","M","I","I","A","S","O","N","D"],["yan","fev","mar","apr","may","iyn","iyl","avg","sen","okt","noy","dek"],["yanvar","fevral","mart","aprel","may","iyun","iyul","avgust","sentabr","oktabr","noyabr","dekabr"]],[["Y","F","M","A","M","I","I","A","S","O","N","D"],["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"],["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"]],[["m.a.","milodiy"],u,["miloddan avvalgi","milodiy"]],1,[6,0],["dd/MM/yy","d-MMM, y","d-MMMM, y","EEEE, d-MMMM, y"],["HH:mm","HH:mm:ss","H:mm:ss (z)","H:mm:ss (zzzz)"],["{1}, {0}",u,u,u],[","," ",";","%","+","-","E","×","‰","∞","son emas",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"UZS","soʻm","O‘zbekiston so‘mi",{"BYN":[u,"р."],"JPY":["JP¥","¥"],"PHP":[u,"₱"],"USD":["US$","$"],"UZS":["soʻm"]},"ltr", plural_locale_uz];
export const locale_extra_uz = [[["yarim tun","tush payti","ertalab","kunduzi","kechqurun","kechasi"],u,u],u,["00:00","12:00",["06:00","11:00"],["11:00","18:00"],["18:00","22:00"],["22:00","06:00"]]];




function plural_locale_vi(val: number): number {
const n = val;

return 5;
}

export const locale_vi = ["vi",[["s","c"],["SA","CH"],u],[["SA","CH"],u,u],[["CN","T2","T3","T4","T5","T6","T7"],["CN","Th 2","Th 3","Th 4","Th 5","Th 6","Th 7"],["Chủ Nhật","Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy"],["CN","T2","T3","T4","T5","T6","T7"]],u,[["1","2","3","4","5","6","7","8","9","10","11","12"],["thg 1","thg 2","thg 3","thg 4","thg 5","thg 6","thg 7","thg 8","thg 9","thg 10","thg 11","thg 12"],["tháng 1","tháng 2","tháng 3","tháng 4","tháng 5","tháng 6","tháng 7","tháng 8","tháng 9","tháng 10","tháng 11","tháng 12"]],[["1","2","3","4","5","6","7","8","9","10","11","12"],["Thg 1","Thg 2","Thg 3","Thg 4","Thg 5","Thg 6","Thg 7","Thg 8","Thg 9","Thg 10","Thg 11","Thg 12"],["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"]],[["tr. CN","sau CN"],["Trước CN","Sau CN"],["Trước Thiên Chúa","Sau Công Nguyên"]],1,[6,0],["dd/MM/y","d MMM, y","d MMMM, y","EEEE, d MMMM, y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{0}, {1}",u,"{0} {1}",u],[",",".",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","#,##0.00 ¤","#E0"],"VND","₫","Đồng Việt Nam",{"AUD":["AU$","$"],"BYN":[u,"р."],"PHP":[u,"₱"],"THB":["฿"],"TWD":["NT$"],"USD":["US$","$"],"XXX":[]},"ltr", plural_locale_vi];
export const locale_extra_vi = [[["nửa đêm","tr","sáng","chiều","tối","đêm"],["nửa đêm","TR","sáng","chiều","tối","đêm"],u],[["nửa đêm","trưa","sáng","chiều","tối","đêm"],["nửa đêm","TR","sáng","chiều","tối","đêm"],["nửa đêm","trưa","sáng","chiều","tối","đêm"]],["00:00","12:00",["04:00","12:00"],["12:00","18:00"],["18:00","21:00"],["21:00","04:00"]]];




function plural_locale_zh(val: number): number {
const n = val;

return 5;
}

export const locale_zh = ["zh",[["上午","下午"],u,u],u,[["日","一","二","三","四","五","六"],["周日","周一","周二","周三","周四","周五","周六"],["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],["周日","周一","周二","周三","周四","周五","周六"]],u,[["1","2","3","4","5","6","7","8","9","10","11","12"],["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"]],u,[["公元前","公元"],u,u],0,[6,0],["y/M/d","y年M月d日",u,"y年M月d日EEEE"],["HH:mm","HH:mm:ss","z HH:mm:ss","zzzz HH:mm:ss"],["{1} {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"CNY","¥","人民币",{"AUD":["AU$","$"],"BYN":[u,"р."],"CNY":["¥"],"ILR":["ILS"],"JPY":["JP¥","¥"],"KRW":["￦","₩"],"PHP":[u,"₱"],"RUR":[u,"р."],"TWD":["NT$"],"USD":["US$","$"],"XXX":[]},"ltr", plural_locale_zh];
export const locale_extra_zh = [[["午夜","早上","上午","中午","下午","晚上","凌晨"],u,["午夜","清晨","上午","中午","下午","晚上","凌晨"]],[["午夜","早上","上午","中午","下午","晚上","凌晨"],u,u],["00:00",["05:00","08:00"],["08:00","12:00"],["12:00","13:00"],["13:00","19:00"],["19:00","24:00"],["00:00","05:00"]]];




function plural_locale_zh_Hans(val: number): number {
const n = val;

return 5;
}

export const locale_zh_Hans = ["zh-Hans",[["上午","下午"],u,u],u,[["日","一","二","三","四","五","六"],["周日","周一","周二","周三","周四","周五","周六"],["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],["周日","周一","周二","周三","周四","周五","周六"]],u,[["1","2","3","4","5","6","7","8","9","10","11","12"],["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"]],u,[["公元前","公元"],u,u],0,[6,0],["y/M/d","y年M月d日",u,"y年M月d日EEEE"],["HH:mm","HH:mm:ss","z HH:mm:ss","zzzz HH:mm:ss"],["{1} {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"CNY","¥","人民币",{"AUD":["AU$","$"],"BYN":[u,"р."],"CNY":["¥"],"ILR":["ILS"],"JPY":["JP¥","¥"],"KRW":["￦","₩"],"PHP":[u,"₱"],"RUR":[u,"р."],"TWD":["NT$"],"USD":["US$","$"],"XXX":[]},"ltr", plural_locale_zh_Hans];
export const locale_extra_zh_Hans = [[["午夜","早上","上午","中午","下午","晚上","凌晨"],u,["午夜","清晨","上午","中午","下午","晚上","凌晨"]],[["午夜","早上","上午","中午","下午","晚上","凌晨"],u,u],["00:00",["05:00","08:00"],["08:00","12:00"],["12:00","13:00"],["13:00","19:00"],["19:00","24:00"],["00:00","05:00"]]];

export const locale_zh_Hans_CN = locale_zh_Hans;
export const locale_zh_CN = locale_zh_Hans;
export const locale_extra_zh_Hans_CN = locale_extra_zh_Hans;
export const locale_extra_zh_CN = locale_extra_zh_Hans;

function plural_locale_zh_Hant_HK(val: number): number {
const n = val;

return 5;
}

export const locale_zh_Hant_HK = ["zh-Hant-HK",[["上午","下午"],u,u],u,[["日","一","二","三","四","五","六"],["週日","週一","週二","週三","週四","週五","週六"],["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],["日","一","二","三","四","五","六"]],u,[["1","2","3","4","5","6","7","8","9","10","11","12"],["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],u],u,[["公元前","公元"],u,u],0,[6,0],["d/M/y","y年M月d日",u,"y年M月d日EEEE"],["ah:mm","ah:mm:ss","ah:mm:ss [z]","ah:mm:ss [zzzz]"],["{1} {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","非數值",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"HKD","HK$","港元",{"AUD":["AU$","$"],"BYN":[u,"р."],"PHP":[u,"₱"],"RON":[u,"L"],"RUR":[u,"р."],"USD":["US$","$"],"XXX":[]},"ltr", plural_locale_zh_Hant_HK];
export const locale_extra_zh_Hant_HK = [[["午夜","早上","上午","中午","下午","晚上","凌晨"],u,u],u,["00:00",["05:00","08:00"],["08:00","12:00"],["12:00","13:00"],["13:00","19:00"],["19:00","24:00"],["00:00","05:00"]]];

export const locale_zh_HK = locale_zh_Hant_HK;
export const locale_extra_zh_HK = locale_extra_zh_Hant_HK;

function plural_locale_zh_Hant(val: number): number {
const n = val;

return 5;
}

export const locale_zh_Hant = ["zh-Hant",[["上午","下午"],u,u],u,[["日","一","二","三","四","五","六"],["週日","週一","週二","週三","週四","週五","週六"],["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],["日","一","二","三","四","五","六"]],u,[["1","2","3","4","5","6","7","8","9","10","11","12"],["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],u],u,[["西元前","西元"],u,u],0,[6,0],["y/M/d","y年M月d日",u,"y年M月d日 EEEE"],["Bh:mm","Bh:mm:ss","Bh:mm:ss [z]","Bh:mm:ss [zzzz]"],["{1} {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","非數值",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"TWD","$","新台幣",{"AUD":["AU$","$"],"BYN":[u,"р."],"KRW":["￦","₩"],"PHP":[u,"₱"],"RON":[u,"L"],"RUR":[u,"р."],"TWD":["$"],"USD":["US$","$"],"XXX":[]},"ltr", plural_locale_zh_Hant];
export const locale_extra_zh_Hant = [[["午夜","清晨","上午","中午","下午","晚上","凌晨"],u,u],u,["00:00",["05:00","08:00"],["08:00","12:00"],["12:00","13:00"],["13:00","19:00"],["19:00","24:00"],["00:00","05:00"]]];

export const locale_zh_Hant_TW = locale_zh_Hant;
export const locale_zh_TW = locale_zh_Hant;
export const locale_extra_zh_Hant_TW = locale_extra_zh_Hant;
export const locale_extra_zh_TW = locale_extra_zh_Hant;

function plural_locale_zu(val: number): number {
const n = val, i = Math.floor(Math.abs(val));

if (i === 0 || n === 1)
    return 1;
return 5;
}

export const locale_zu = ["zu",[["a","p"],["AM","PM"],u],[["AM","PM"],u,u],[["S","M","B","T","S","H","M"],["Son","Mso","Bil","Tha","Sin","Hla","Mgq"],["ISonto","UMsombuluko","ULwesibili","ULwesithathu","ULwesine","ULwesihlanu","UMgqibelo"],["Son","Mso","Bil","Tha","Sin","Hla","Mgq"]],u,[["J","F","M","E","M","J","J","A","S","O","N","D"],["Jan","Feb","Mas","Eph","Mey","Jun","Jul","Aga","Sep","Okt","Nov","Dis"],["Januwari","Februwari","Mashi","Ephreli","Meyi","Juni","Julayi","Agasti","Septhemba","Okthoba","Novemba","Disemba"]],[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jan","Feb","Mas","Eph","Mey","Jun","Jul","Aga","Sep","Okt","Nov","Dis"],["Januwari","Februwari","Mashi","Ephreli","Meyi","Juni","Julayi","Agasti","Septhemba","Okthoba","Novemba","Disemba"]],[["BC","AD"],u,u],0,[6,0],["M/d/yy","MMM d, y","MMMM d, y","EEEE, MMMM d, y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,u,u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"ZAR","R","i-South African Rand",{"BYN":[u,"P."],"DKK":[u,"Kr"],"HRK":[u,"Kn"],"ISK":[u,"Kr"],"JPY":["JP¥","¥"],"NOK":[u,"Kr"],"PHP":[u,"₱"],"PLN":[u,"Zł"],"SEK":[u,"Kr"],"THB":["฿"],"TWD":["NT$"],"ZAR":["R"]},"ltr", plural_locale_zu];
export const locale_extra_zu = [[["entathakusa","ekuseni","emini","ntambama","ebusuku"],u,u],u,[["00:00","06:00"],["06:00","10:00"],["10:00","13:00"],["13:00","19:00"],["19:00","24:00"]]];




let l: any;
let e: any;
let locales: string[] = [];

switch (goog.LOCALE) {

case 'af':
  l = locale_af;
  e = locale_extra_af;
  locales = ["af"];
  break;
case 'am':
  l = locale_am;
  e = locale_extra_am;
  locales = ["am"];
  break;
case 'ar':
  l = locale_ar;
  e = locale_extra_ar;
  locales = ["ar"];
  break;
case 'ar-DZ':
case 'ar_DZ':
  l = locale_ar_DZ;
  e = locale_extra_ar_DZ;
  locales = ["ar-DZ", "ar_DZ"];
  break;
case 'az':
  l = locale_az;
  e = locale_extra_az;
  locales = ["az"];
  break;
case 'be':
  l = locale_be;
  e = locale_extra_be;
  locales = ["be"];
  break;
case 'bg':
  l = locale_bg;
  e = locale_extra_bg;
  locales = ["bg"];
  break;
case 'bn':
  l = locale_bn;
  e = locale_extra_bn;
  locales = ["bn"];
  break;
case 'br':
  l = locale_br;
  e = locale_extra_br;
  locales = ["br"];
  break;
case 'bs':
  l = locale_bs;
  e = locale_extra_bs;
  locales = ["bs"];
  break;
case 'ca':
  l = locale_ca;
  e = locale_extra_ca;
  locales = ["ca"];
  break;
case 'chr':
  l = locale_chr;
  e = locale_extra_chr;
  locales = ["chr"];
  break;
case 'cs':
  l = locale_cs;
  e = locale_extra_cs;
  locales = ["cs"];
  break;
case 'cy':
  l = locale_cy;
  e = locale_extra_cy;
  locales = ["cy"];
  break;
case 'da':
  l = locale_da;
  e = locale_extra_da;
  locales = ["da"];
  break;
case 'de':
  l = locale_de;
  e = locale_extra_de;
  locales = ["de"];
  break;
case 'de-AT':
case 'de_AT':
  l = locale_de_AT;
  e = locale_extra_de_AT;
  locales = ["de-AT", "de_AT"];
  break;
case 'de-CH':
case 'de_CH':
  l = locale_de_CH;
  e = locale_extra_de_CH;
  locales = ["de-CH", "de_CH"];
  break;
case 'el':
  l = locale_el;
  e = locale_extra_el;
  locales = ["el"];
  break;
case 'en-AU':
case 'en_AU':
  l = locale_en_AU;
  e = locale_extra_en_AU;
  locales = ["en-AU", "en_AU"];
  break;
case 'en-CA':
case 'en_CA':
  l = locale_en_CA;
  e = locale_extra_en_CA;
  locales = ["en-CA", "en_CA"];
  break;
case 'en-GB':
case 'en_GB':
  l = locale_en_GB;
  e = locale_extra_en_GB;
  locales = ["en-GB", "en_GB"];
  break;
case 'en-IE':
case 'en_IE':
  l = locale_en_IE;
  e = locale_extra_en_IE;
  locales = ["en-IE", "en_IE"];
  break;
case 'en-IN':
case 'en_IN':
  l = locale_en_IN;
  e = locale_extra_en_IN;
  locales = ["en-IN", "en_IN"];
  break;
case 'en-SG':
case 'en_SG':
  l = locale_en_SG;
  e = locale_extra_en_SG;
  locales = ["en-SG", "en_SG"];
  break;
case 'en-ZA':
case 'en_ZA':
  l = locale_en_ZA;
  e = locale_extra_en_ZA;
  locales = ["en-ZA", "en_ZA"];
  break;
case 'es':
  l = locale_es;
  e = locale_extra_es;
  locales = ["es"];
  break;
case 'es-419':
case 'es_419':
  l = locale_es_419;
  e = locale_extra_es_419;
  locales = ["es-419", "es_419"];
  break;
case 'es-MX':
case 'es_MX':
  l = locale_es_MX;
  e = locale_extra_es_MX;
  locales = ["es-MX", "es_MX"];
  break;
case 'es-US':
case 'es_US':
  l = locale_es_US;
  e = locale_extra_es_US;
  locales = ["es-US", "es_US"];
  break;
case 'et':
  l = locale_et;
  e = locale_extra_et;
  locales = ["et"];
  break;
case 'eu':
  l = locale_eu;
  e = locale_extra_eu;
  locales = ["eu"];
  break;
case 'fa':
  l = locale_fa;
  e = locale_extra_fa;
  locales = ["fa"];
  break;
case 'fi':
  l = locale_fi;
  e = locale_extra_fi;
  locales = ["fi"];
  break;
case 'fr':
  l = locale_fr;
  e = locale_extra_fr;
  locales = ["fr"];
  break;
case 'fr-CA':
case 'fr_CA':
  l = locale_fr_CA;
  e = locale_extra_fr_CA;
  locales = ["fr-CA", "fr_CA"];
  break;
case 'ga':
  l = locale_ga;
  e = locale_extra_ga;
  locales = ["ga"];
  break;
case 'gl':
  l = locale_gl;
  e = locale_extra_gl;
  locales = ["gl"];
  break;
case 'gsw':
  l = locale_gsw;
  e = locale_extra_gsw;
  locales = ["gsw"];
  break;
case 'gu':
  l = locale_gu;
  e = locale_extra_gu;
  locales = ["gu"];
  break;
case 'haw':
  l = locale_haw;
  e = locale_extra_haw;
  locales = ["haw"];
  break;
case 'hi':
  l = locale_hi;
  e = locale_extra_hi;
  locales = ["hi"];
  break;
case 'hr':
  l = locale_hr;
  e = locale_extra_hr;
  locales = ["hr"];
  break;
case 'hu':
  l = locale_hu;
  e = locale_extra_hu;
  locales = ["hu"];
  break;
case 'hy':
  l = locale_hy;
  e = locale_extra_hy;
  locales = ["hy"];
  break;
case 'id':
case 'in':
  l = locale_id;
  e = locale_extra_id;
  locales = ["id", "in"];
  break;
case 'is':
  l = locale_is;
  e = locale_extra_is;
  locales = ["is"];
  break;
case 'it':
  l = locale_it;
  e = locale_extra_it;
  locales = ["it"];
  break;
case 'he':
case 'iw':
  l = locale_he;
  e = locale_extra_he;
  locales = ["he", "iw"];
  break;
case 'ja':
  l = locale_ja;
  e = locale_extra_ja;
  locales = ["ja"];
  break;
case 'ka':
  l = locale_ka;
  e = locale_extra_ka;
  locales = ["ka"];
  break;
case 'kk':
  l = locale_kk;
  e = locale_extra_kk;
  locales = ["kk"];
  break;
case 'km':
  l = locale_km;
  e = locale_extra_km;
  locales = ["km"];
  break;
case 'kn':
  l = locale_kn;
  e = locale_extra_kn;
  locales = ["kn"];
  break;
case 'ko':
  l = locale_ko;
  e = locale_extra_ko;
  locales = ["ko"];
  break;
case 'ky':
  l = locale_ky;
  e = locale_extra_ky;
  locales = ["ky"];
  break;
case 'ln':
  l = locale_ln;
  e = locale_extra_ln;
  locales = ["ln"];
  break;
case 'lo':
  l = locale_lo;
  e = locale_extra_lo;
  locales = ["lo"];
  break;
case 'lt':
  l = locale_lt;
  e = locale_extra_lt;
  locales = ["lt"];
  break;
case 'lv':
  l = locale_lv;
  e = locale_extra_lv;
  locales = ["lv"];
  break;
case 'mk':
  l = locale_mk;
  e = locale_extra_mk;
  locales = ["mk"];
  break;
case 'ml':
  l = locale_ml;
  e = locale_extra_ml;
  locales = ["ml"];
  break;
case 'mn':
  l = locale_mn;
  e = locale_extra_mn;
  locales = ["mn"];
  break;
case 'ro-MD':
case 'ro_MD':
case 'mo':
  l = locale_ro_MD;
  e = locale_extra_ro_MD;
  locales = ["ro-MD", "ro_MD", "mo"];
  break;
case 'mr':
  l = locale_mr;
  e = locale_extra_mr;
  locales = ["mr"];
  break;
case 'ms':
  l = locale_ms;
  e = locale_extra_ms;
  locales = ["ms"];
  break;
case 'mt':
  l = locale_mt;
  e = locale_extra_mt;
  locales = ["mt"];
  break;
case 'my':
  l = locale_my;
  e = locale_extra_my;
  locales = ["my"];
  break;
case 'ne':
  l = locale_ne;
  e = locale_extra_ne;
  locales = ["ne"];
  break;
case 'nl':
  l = locale_nl;
  e = locale_extra_nl;
  locales = ["nl"];
  break;
case 'nb':
case 'no':
case 'no-NO':
case 'no_NO':
  l = locale_nb;
  e = locale_extra_nb;
  locales = ["nb", "no", "no-NO", "no_NO"];
  break;
case 'or':
  l = locale_or;
  e = locale_extra_or;
  locales = ["or"];
  break;
case 'pa':
  l = locale_pa;
  e = locale_extra_pa;
  locales = ["pa"];
  break;
case 'pl':
  l = locale_pl;
  e = locale_extra_pl;
  locales = ["pl"];
  break;
case 'pt':
case 'pt-BR':
case 'pt_BR':
  l = locale_pt;
  e = locale_extra_pt;
  locales = ["pt", "pt-BR", "pt_BR"];
  break;
case 'pt-PT':
case 'pt_PT':
  l = locale_pt_PT;
  e = locale_extra_pt_PT;
  locales = ["pt-PT", "pt_PT"];
  break;
case 'ro':
  l = locale_ro;
  e = locale_extra_ro;
  locales = ["ro"];
  break;
case 'ru':
  l = locale_ru;
  e = locale_extra_ru;
  locales = ["ru"];
  break;
case 'sr-Latn':
case 'sr_Latn':
case 'sh':
  l = locale_sr_Latn;
  e = locale_extra_sr_Latn;
  locales = ["sr-Latn", "sr_Latn", "sh"];
  break;
case 'si':
  l = locale_si;
  e = locale_extra_si;
  locales = ["si"];
  break;
case 'sk':
  l = locale_sk;
  e = locale_extra_sk;
  locales = ["sk"];
  break;
case 'sl':
  l = locale_sl;
  e = locale_extra_sl;
  locales = ["sl"];
  break;
case 'sq':
  l = locale_sq;
  e = locale_extra_sq;
  locales = ["sq"];
  break;
case 'sr':
  l = locale_sr;
  e = locale_extra_sr;
  locales = ["sr"];
  break;
case 'sv':
  l = locale_sv;
  e = locale_extra_sv;
  locales = ["sv"];
  break;
case 'sw':
  l = locale_sw;
  e = locale_extra_sw;
  locales = ["sw"];
  break;
case 'ta':
  l = locale_ta;
  e = locale_extra_ta;
  locales = ["ta"];
  break;
case 'te':
  l = locale_te;
  e = locale_extra_te;
  locales = ["te"];
  break;
case 'th':
  l = locale_th;
  e = locale_extra_th;
  locales = ["th"];
  break;
case 'fil':
case 'tl':
  l = locale_fil;
  e = locale_extra_fil;
  locales = ["fil", "tl"];
  break;
case 'tr':
  l = locale_tr;
  e = locale_extra_tr;
  locales = ["tr"];
  break;
case 'uk':
  l = locale_uk;
  e = locale_extra_uk;
  locales = ["uk"];
  break;
case 'ur':
  l = locale_ur;
  e = locale_extra_ur;
  locales = ["ur"];
  break;
case 'uz':
  l = locale_uz;
  e = locale_extra_uz;
  locales = ["uz"];
  break;
case 'vi':
  l = locale_vi;
  e = locale_extra_vi;
  locales = ["vi"];
  break;
case 'zh':
  l = locale_zh;
  e = locale_extra_zh;
  locales = ["zh"];
  break;
case 'zh-Hans':
case 'zh_Hans':
case 'zh-Hans-CN':
case 'zh_Hans_CN':
case 'zh-CN':
case 'zh_CN':
  l = locale_zh_Hans;
  e = locale_extra_zh_Hans;
  locales = ["zh-Hans", "zh_Hans", "zh-Hans-CN", "zh_Hans_CN", "zh-CN", "zh_CN"];
  break;
case 'zh-Hant-HK':
case 'zh_Hant_HK':
case 'zh-HK':
case 'zh_HK':
  l = locale_zh_Hant_HK;
  e = locale_extra_zh_Hant_HK;
  locales = ["zh-Hant-HK", "zh_Hant_HK", "zh-HK", "zh_HK"];
  break;
case 'zh-Hant':
case 'zh_Hant':
case 'zh-Hant-TW':
case 'zh_Hant_TW':
case 'zh-TW':
case 'zh_TW':
  l = locale_zh_Hant;
  e = locale_extra_zh_Hant;
  locales = ["zh-Hant", "zh_Hant", "zh-Hant-TW", "zh_Hant_TW", "zh-TW", "zh_TW"];
  break;
case 'zu':
  l = locale_zu;
  e = locale_extra_zu;
  locales = ["zu"];
  break;}

if (l) {
  locales.forEach(locale => registerLocaleData(l, locale, e));
}
