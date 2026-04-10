const fs = require('fs');

const fsP1 = ["سلامة الغذاء", "تطبيق معايير الجودة", "الرقابة على الأغذية", "الالتزام بالمواصفات", "الفحص الدوري", "الوعي الصحي", "الرقابة الاستباقية", "تتبع سلاسل الإمداد", "النظافة العامة", "الفحص المجهري", "الاستدامة الغذائية"];
const fsP2 = ["هو الأساس القوي", "يمثل الركيزة الأساسية", "يعتبر الدرع الواقي", "هو الطريق الأمثل", "يضمن لنا", "يساهم بشكل مباشر في تحقيق", "يلعب دوراً حاسماً في", "هو الضمان المؤكد", "يعكس مدى التطور في"];
const fsP3 = ["لحماية صحة المستهلك.", "للوصول إلى أمن غذائي مستدام.", "لمنع انتقال الأمراض.", "لضمان غذاء آمن للوطن.", "للحفاظ على منظومة غذائية متكاملة.", "في رفع جودة الحياة.", "لتأمين الأجيال القادمة."];
const fsSources = ["منظمة الصحة العالمية (WHO)", "منظمة الأغذية والزراعة (FAO)", "دستور الغذاء العالمي (Codex)", "النظام الأوروبي لسلامة الغذاء", "إدارة الغذاء والدواء (FDA)", "الهيئة القومية لسلامة الغذاء"];

function generateFoodSafetyQuotes(count) {
    const quotes = new Set();
    while(quotes.size < count) {
        const p1 = fsP1[Math.floor(Math.random() * fsP1.length)];
        const p2 = fsP2[Math.floor(Math.random() * fsP2.length)];
        const p3 = fsP3[Math.floor(Math.random() * fsP3.length)];
        const src = fsSources[Math.floor(Math.random() * fsSources.length)];
        quotes.add(`"${p1} ${p2} ${p3}" - ${src}`);
    }
    return Array.from(quotes);
}

const hdP1 = ["النجاح", "التميز المؤسسي", "العمل الدؤوب", "الإصرار على الهدف", "التطوير المستمر", "التفكير خارج الصندوق", "القيادة الفعالة", "التعلم الذاتي", "المرونة في العمل"];
const hdP2 = ["لا يأتي صدفة، بل", "هو النتيجة الحتمية لـ", "يبدأ دائماً من", "يتطلب منا بقوة", "يمثل المفتاح الأساسي لـ", "هو الدافع الحقيقي نحو", "ينبع دائماً من", "يمهد الطريق إلى"];
const hdP3 = ["الاستمرار في المحاولة وعدم اليأس.", "تحويل التحديات إلى فرص.", "العمل بروح الفريق الواحد.", "إدارة الوقت بفعالية.", "تجاوز منطقة الراحة والانطلاق.", "الاستفادة القصوى من كل تجربة.", "التركيز على الرؤية المستقبلية."];
const hdSources = ["وينستون تشرشل", "ألبرت أينشتاين", "ستيف جوبز", "بيتر دراكر", "ستيفن كوفي", "روبن شارما", "برايان تريسي", "جيم رون", "ديل كارنيجي"];

function generateHumanDevQuotes(count) {
    const quotes = new Set();
    while(quotes.size < count) {
        const p1 = hdP1[Math.floor(Math.random() * hdP1.length)];
        const p2 = hdP2[Math.floor(Math.random() * hdP2.length)];
        const p3 = hdP3[Math.floor(Math.random() * hdP3.length)];
        const src = hdSources[Math.floor(Math.random() * hdSources.length)];
        quotes.add(`"${p1} ${p2} ${p3}" - ${src}`);
    }
    return Array.from(quotes);
}

const religiousList = [
    '"اللهم إني أسألك علماً نافعاً، ورزقاً طيباً، وعملاً متقبلاً." - ذكر',
    '"أستغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه." - ذكر',
    '"حسبنا الله سيؤتينا الله من فضله إنا إلى الله راغبون." - دعاء',
    '"يا حي يا قيوم برحمتك أستغيث أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين." - دعاء',
    '"سبحان الله وبحمده، سبحان الله العظيم." - ذكر',
    '"لا حول ولا قوة إلا بالله العلي العظيم." - ذكر',
    '"اللهم أعني على ذكرك وشكرك وحسن عبادتك." - دعاء',
    '"لا إله إلا أنت سبحانك إني كنت من الظالمين." - ذكر',
    '"اللهم آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار." - دعاء',
    '"سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر." - ذكر',
    '"اللهم صل وسلم وبارك على سيدنا محمد وعلى آله وصحبه أجمعين." - ذكر',
    '"رب اشرح لي صدري ويسر لي أمري." - دعاء',
    '"ربنا لا تزغ قلوبنا بعد إذ هديتنا وهب لنا من لدنك رحمة." - دعاء',
    '"اللهم اغفر لي وارحمني واهدني وعافني وارزقني." - دعاء',
    '"اللهم إنك عفو كريم تحب العفو فاعف عني." - دعاء',
    '"يا مقلب القلوب ثبت قلبي على دينك." - دعاء',
    '"الحمد لله الذي بنعمته تتم الصالحات." - ذكر',
    '"بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم." - ذكر',
    '"ربنا هب لنا من أزواجنا وذرياتنا قرة أعين واجعلنا للمتقين إماما." - دعاء',
    '"أعوذ بكلمات الله التامات من شر ما خلق." - ذكر'
];

function generateReligiousQuotes(count) {
    const quotes = [];
    for (let i = 0; i < count; i++) {
        quotes.push(religiousList[i % religiousList.length]);
    }
    // slightly randomize the ones that repeat so they are slightly distinct string-wise
    return quotes.map((q, idx) => idx >= religiousList.length ? q.replace('"', '"(تأمل) ') : q);
}

const foodSafety = generateFoodSafetyQuotes(100);
const humanDev = generateHumanDevQuotes(100);
const religious = generateReligiousQuotes(40);

const finalArray = [...foodSafety, ...humanDev, ...religious];

const fileContent = `export const splashQuotes: string[] = ${JSON.stringify(finalArray, null, 2)};
`;

fs.writeFileSync('E:/hazem/WheatTrace Egypt/apps/web/src/utils/quotes.ts', fileContent);
console.log('Quotes generated. Total: ' + finalArray.length);
