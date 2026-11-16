/* Noôdome · именной лендинг Коннектора из блоков.
   Один рендерер для редактора, превью и отдельного HTML-файла.
   Документ: {slug, name, nameGenitive, signoff, role, photo, blocks:[{id, type, theme, data}], club}
   Блоки 1–3 (обложка, «Для меня Noôdome», список, проект) свои у каждого участника.
   Общие блоки (shared: о клубе, сообщество, мероприятия, шаги, форма) берут данные из doc.club[type],
   их правят один раз для всех приглашений.
   NDL.render(doc, {selected}) -> HTML, NDL.bind(root, doc, {submit}) -> форма заявки. */
(function () {
  var CLUB = {
    email: "customers@nd.club", site: "https://noodome.club", phone: "+7 963 721 65 34",
    address: "Москва, Романов переулок, д.2, стр.1", map: "https://yandex.ru/maps/-/CPEFnUnU",
    hours: ["Будние дни с 08-00 до 23-00", "Выходные дни с 10-00 до 23-00"],
    nav: [["Сообщество", "#community"], ["О нас", "#about"], ["Участие", "#membership"], ["Программа", "#events"], ["Инсайты", "#insights"], ["Noôlab", "#noolab"], ["Партнёры", "#partners"], ["Контакты", "#contacts"]],
    social: [["YouTube", "https://www.youtube.com/channel/UCvgTLmVKwmfFULLf4NQTHvA"], ["Telegram", "https://t.me/noodome"], ["VK", "https://vk.com/noodomeclub"]],
    legal: [["Политика конфиденциальности", "/privacy"], ["Правила Клуба", "/rules"], ["Условия оплаты", "/payment"]],
    app: "https://t.me/noodome_com_bot"
  };
  var DOME = "M70.05 20C62.54 8.06 49.61 0 35.03 0 20.29 0 7.52 7.91 0 20h70.05Z";
  var WORDMARK = "M892.684 113.842C908.688 113.842 925.275 117.334 933.423 121.99V43.4222L908.106 22.7618V21.0158L970.961 0.355469H975.325V310.552L999.769 330.631V332.958L937.788 350.709L933.714 314.917H931.095C908.397 341.688 891.811 351 867.659 351C813.534 351 775.705 306.478 775.705 243.915C775.705 170.585 827.793 113.842 892.684 113.842ZM889.485 321.617C908.981 321.617 923.531 313.179 933.133 299.211V142.076C922.949 134.51 907.235 130.145 890.649 130.145C845.254 130.145 814.7 165.064 814.7 222.098C814.991 280.588 845.836 321.617 889.485 321.617ZM47.6464 80.3775L237.373 344.307H251.631V65.8279L275.202 34.1099V31.7819H196.343V34.1099L230.389 65.8279V256.427L69.1798 31.7819H0.505859V34.1099L26.4041 58.5531V310.261L2.5428 341.979V344.307H81.1104V341.979L47.6464 310.261V80.3775ZM297.897 235.768C297.897 165.639 343.001 113.843 405.855 113.843C466.09 113.843 508.575 161.274 508.575 229.075C508.575 299.495 463.471 351 400.617 351C339.8 351 297.897 303.569 297.897 235.768ZM464.926 242.465C464.926 174.664 437.573 128.687 397.998 128.687C362.788 128.687 341.837 163.024 341.837 222.387C341.837 290.77 368.608 336.164 408.765 336.164C443.393 336.164 464.926 301.827 464.926 242.465ZM645.05 113.843C582.196 113.843 537.093 165.639 537.093 235.768C537.093 303.569 578.995 351 639.812 351C702.667 351 747.77 299.495 747.77 229.075C747.77 161.274 705.286 113.843 645.05 113.843ZM637.19 128.687C676.765 128.687 704.118 174.664 704.118 242.465C704.118 301.827 682.584 336.164 647.957 336.164C607.8 336.164 581.029 290.77 581.029 222.387C581.029 163.024 601.98 128.687 637.19 128.687ZM1124.31 113.843C1061.46 113.843 1016.35 165.639 1016.35 235.768C1016.35 303.569 1058.55 351 1119.07 351C1181.93 351 1227.03 299.495 1227.03 229.075C1227.03 161.274 1184.55 113.843 1124.31 113.843ZM1116.46 128.687C1156.03 128.687 1183.38 174.664 1183.38 242.465C1183.38 301.827 1161.85 336.164 1127.22 336.164C1087.07 336.164 1060.3 290.77 1060.3 222.387C1060.3 163.024 1081.25 128.687 1116.46 128.687ZM1383.88 341.387V343.715V344.006H1468.85V341.678L1447.31 324.219V171.448V167.956C1466.23 149.915 1483.69 141.767 1500.57 141.767C1524.14 141.767 1538.98 157.481 1538.98 182.797V323.928L1517.44 342.26V344.588H1601.83V342.26L1580.3 324.51V171.739C1580.3 137.402 1557.31 114.123 1521.52 114.123C1497.07 114.123 1475.54 125.762 1447.02 154.862H1445.28C1439.17 129.836 1418.21 114.123 1389.12 114.123C1364.38 114.123 1341.68 126.053 1315.79 153.407H1313.46L1310.84 114.123H1306.47L1247.11 133.619V135.947L1272.43 156.026V323.928L1250.89 341.678V344.006H1335.57V341.678L1314.04 323.928V167.665C1332.95 149.624 1350.41 141.476 1367.29 141.476C1390.86 141.476 1405.7 156.899 1405.7 182.215V323.637L1383.88 341.387ZM1726.08 113.843C1667.3 113.843 1620.74 167.094 1620.74 237.514C1620.74 305.315 1663.23 351 1723.46 351C1774.1 351 1809.6 318.7 1819.49 266.613L1817.16 265.74C1797.96 300.95 1771.77 318.409 1739.18 318.409C1688.55 318.409 1654.5 277.38 1654.5 215.399V213.071H1817.45C1805.52 148.18 1773.81 113.843 1726.08 113.843ZM1775.84 199.121H1655.37C1660.03 155.473 1683.31 129.284 1717.06 128.993C1747.32 128.993 1765.07 149.944 1775.84 199.121ZM643.598 31.4925C671.824 31.4925 696.849 47.206 711.399 70.4853H575.797C590.346 46.915 615.081 31.4925 643.598 31.4925Z";

  /* Типы блоков. fields: [ключ, подпись, вид]; вид: "" строка, "area" абзац, "paras" абзацы через пустую строку, "photo" фото пункта.
     photo: у блока есть своё фото; docPhoto: фото по умолчанию берётся из карточки участника; shared: общий блок клуба. */
  var TYPES = {
    hero: { label: "Обложка", theme: "olive", single: true,
      fields: [["eyebrow", "Надпись в углу"], ["title", "Текст обложки", "area"], ["role", "Строка под текстом (можно оставить пустой)", "area"], ["button", "Кнопка"]],
      make: function () { return { eyebrow: "Личное приглашение", title: "{name} приглашает вас познакомиться с Noôdome", role: "", button: "Познакомиться" }; } },
    why: { label: "Для меня Noôdome", theme: "paper", photo: true, docPhoto: true,
      fields: [["eyebrow", "Надпись"], ["title", "Заголовок"], ["text", "Один абзац от первого лица", "paras"], ["caption", "Подпись к фото"], ["signoff", "Подпись"]],
      make: function () { return { eyebrow: "Для меня Noôdome", title: "Почему я здесь", text: "", caption: "", signoff: "{name}" }; } },
    list: { label: "Что мне здесь близко", theme: "olive",
      fields: [["eyebrow", "Надпись"], ["title", "Заголовок"], ["intro", "Вступление", "area"]], items: [["label", "Пункт"], ["text", "Пояснение", "area"]],
      make: function () { return { eyebrow: "Мой Noôdome", title: "Что мне здесь близко", intro: "", items: [{ label: "", text: "" }] }; } },
    story: { label: "Проект с Noôdome", theme: "light", photo: true,
      fields: [["eyebrow", "Надпись"], ["title", "Название"], ["text", "Текст от первого лица", "paras"], ["quote", "Цитата (по желанию)", "area"], ["caption", "Подпись к фото"], ["linkText", "Текст ссылки"], ["linkUrl", "Адрес ссылки"]],
      make: function () { return { eyebrow: "Мой проект с Noôdome", title: "", text: "", quote: "", photo: "", caption: "", linkText: "", linkUrl: "" }; } },
    about: { label: "Что такое Noôdome", theme: "paper", shared: true, photo: true,
      fields: [["eyebrow", "Надпись"], ["title", "Заголовок"], ["text", "Текст", "paras"], ["caption", "Подпись к фото"], ["linkText", "Текст ссылки"], ["linkUrl", "Адрес ссылки"]],
      make: function () { return { eyebrow: "Что такое Noôdome", title: "Сообщество и клубное пространство в центре Москвы",
        text: "Noôdome объединяет людей, которые предчувствуют будущее, инициируют перемены и выстраивают связи, — тех, кто готов брать на себя ответственность за свои действия сегодня ради лучшего завтра.",
        photo: "", caption: "", linkText: "Подробнее о клубе", linkUrl: "https://noodome.club/about" }; } },
    community: { label: "Сообщество Noôdome", theme: "light", shared: true,
      fields: [["eyebrow", "Надпись"], ["title", "Заголовок"], ["text", "Текст", "paras"], ["stats", "Цифры: по одной в строке, «число | подпись»", "area"], ["peopleTitle", "Заголовок над людьми"], ["linkText", "Текст ссылки"], ["linkUrl", "Адрес ссылки"]],
      items: [["photo", "Фото", "photo"], ["name", "Имя"], ["role", "Кто это"]],
      make: function () { return { eyebrow: "Сообщество Noôdome", title: "Люди из разных сфер с общими ценностями",
        text: "Сообщество Noôdome — это представители разных сфер с общими ценностями, готовые инвестировать в развитие себя, усиливать своё окружение и менять мир к лучшему.",
        stats: "1000 | участников\n26 | амбассадоров\n800+ | событий в год", peopleTitle: "Амбассадоры клуба", linkText: "Все герои", linkUrl: "https://noodome.club/community", items: [] }; } },
    events: { label: "Чем живёт клуб", theme: "paper", shared: true,
      fields: [["eyebrow", "Надпись"], ["title", "Заголовок"], ["intro", "Вступление", "area"], ["linkText", "Текст ссылки"], ["linkUrl", "Адрес ссылки"]],
      items: [["photo", "Картинка", "photo"], ["date", "Дата"], ["tag", "Рубрика"], ["title", "Название"], ["text", "Коротко", "area"], ["url", "Ссылка на событие"]],
      make: function () { return { eyebrow: "Чем живёт клуб", title: "Мероприятия, на которые можно прийти вместе", intro: "Программа Noôdome — это больше 800 событий в год.",
        linkText: "Вся программа", linkUrl: "https://noodome.club/events", items: [] }; } },
    steps: { label: "Как проходит знакомство", theme: "light", shared: true,
      fields: [["eyebrow", "Надпись"], ["title", "Заголовок"]], items: [["title", "Шаг"], ["text", "Текст", "area"]],
      make: function () { return { eyebrow: "Как проходит вступление", title: "Четыре шага, первый уже сделан", items: [
        { title: "Рекомендация {nameGenitive}", text: "Участник клуба ручается за вас. Этот шаг уже сделан." },
        { title: "Встреча-знакомство", text: "Команда клуба пригласит вас в пространство, покажет его и расскажет об участии." },
        { title: "Анкета и решение", text: "Вы заполняете анкету, адмиссионный комитет принимает решение." },
        { title: "Приглашение", text: "Вы получаете приглашение стать участником сообщества." }] }; } },
    apply: { label: "Форма заявки", theme: "dark", single: true, shared: true,
      fields: [["eyebrow", "Надпись"], ["title", "Заголовок"], ["text", "Текст над формой", "area"]],
      make: function () { return { eyebrow: "Заявка", title: "Давайте познакомимся", text: "Оставьте контакт, и команда Noôdome пригласит вас на встречу в пространстве. Мы скажем, что вы от {nameGenitive}." }; } },
    letter: { label: "Личное письмо", theme: "paper",
      fields: [["greeting", "Обращение"], ["paragraphs", "Текст письма (абзацы через пустую строку)", "paras"], ["signoff", "Подпись"]],
      make: function () { return { greeting: "Здравствуйте!", paragraphs: [""], signoff: "{signoff}" }; } },
    quote: { label: "Цитата", theme: "light",
      fields: [["text", "Цитата", "area"], ["author", "Автор"]],
      make: function () { return { text: "", author: "{name}" }; } },
    text: { label: "Текстовый блок", theme: "light",
      fields: [["eyebrow", "Надпись"], ["title", "Заголовок"], ["text", "Текст (абзацы через пустую строку)", "paras"]],
      make: function () { return { eyebrow: "", title: "", text: "" }; } },
    photo: { label: "Фотография", theme: "light", photo: true,
      fields: [["caption", "Подпись"]],
      make: function () { return { photo: "", caption: "" }; } },
    figures: { label: "Клуб в цифрах", theme: "light",
      fields: [["eyebrow", "Надпись"], ["title", "Заголовок"]], items: [["figure", "Число"], ["unit", "К числу"], ["label", "Заголовок"], ["text", "Текст", "area"]],
      make: function () { return { eyebrow: "Noôdome в цифрах", title: "", items: [
        { figure: "1000", unit: "участников", label: "Сообщество", text: "Предприниматели, учёные, художники, филантропы, люди образования." },
        { figure: "4000", unit: "м² в центре Москвы", label: "Пространство", text: "Три террасы, студии для встреч, ресторан и залы для событий." },
        { figure: "800+", unit: "событий в год", label: "Программа", text: "Дискуссии, концерты, кинопоказы, путешествия и семейная программа." }] }; } },
    faq: { label: "Вопросы и ответы", theme: "paper",
      fields: [["eyebrow", "Надпись"], ["title", "Заголовок"]], items: [["q", "Вопрос"], ["a", "Ответ", "area"]],
      make: function () { return { eyebrow: "Вопросы", title: "Что важно знать до встречи", items: [
        { q: "Что будет на встрече-знакомстве?", a: "Команда клуба покажет пространство, расскажет о программе и сообществах и предложит заполнить анкету." },
        { q: "Нужно ли платить сразу?", a: "Нет. Взносы вносятся только после решения адмиссионного комитета и приглашения стать участником." }] }; } }
  };
  var SHARED = Object.keys(TYPES).filter(function (k) { return TYPES[k].shared; });
  var THEMES = [["auto", "Авто"], ["light", "Светлый"], ["paper", "Бумага"], ["olive", "Олива"], ["dark", "Тёмный"]];

  var CSS = [
    ":root{--nd-bg:#F6F4EF;--nd-paper:#EFEADF;--nd-ink:#181918;--nd-ink2:#4D4745;--nd-muted:#77796F;--nd-line:#D8D4C8;",
    "--nd-olive:#576C4A;--nd-on-olive:#F6F4EF;--nd-sage:#9AA594;--nd-sand:#B48F63;--nd-deep:#181918;--nd-on-deep:#EFEADF;",
    "--nd-serif:'Wremena','Cormorant Garamond','PT Serif',Georgia,serif;--nd-sans:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}",
    "@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--nd-bg:#131412;--nd-paper:#1C1E1A;--nd-ink:#EFEADF;--nd-ink2:#C9C3B5;--nd-muted:#9A9C92;--nd-line:#34372F;--nd-olive:#4F6244;--nd-on-olive:#F6F4EF;--nd-sage:#9AA594;--nd-sand:#CBAA80;--nd-deep:#0C0D0B;--nd-on-deep:#EFEADF;color-scheme:dark}}",
    ":root[data-theme=dark]{--nd-bg:#131412;--nd-paper:#1C1E1A;--nd-ink:#EFEADF;--nd-ink2:#C9C3B5;--nd-muted:#9A9C92;--nd-line:#34372F;--nd-olive:#4F6244;--nd-on-olive:#F6F4EF;--nd-sage:#9AA594;--nd-sand:#CBAA80;--nd-deep:#0C0D0B;--nd-on-deep:#EFEADF;color-scheme:dark}",
    ".ndl [hidden]{display:none!important}",
    ".ndl{container-type:inline-size;background:var(--nd-bg);color:var(--nd-ink);font-family:var(--nd-sans);font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}",
    ".ndl *{box-sizing:border-box}",
    ".ndl .w{max-width:1120px;margin:0 auto;padding-left:max(20px,env(safe-area-inset-left,0px));padding-right:max(20px,env(safe-area-inset-right,0px))}",
    ".ndl h1,.ndl h2,.ndl h3{font-family:var(--nd-serif);font-weight:300;margin:0;text-wrap:balance;letter-spacing:0}",
    ".ndl p{margin:0}",
    ".ndl img{max-width:100%}",
    /* фоны блоков: каждый задаёт свои вторичные цвета, поэтому любой блок читается на любом фоне */
    ".ndl .b{--fg:var(--nd-ink);--fg2:var(--nd-ink2);--mut:var(--nd-muted);--ln:var(--nd-line);--acc:var(--nd-olive);--hi:var(--nd-sand);--card:var(--nd-paper);background:var(--nd-bg);color:var(--fg);padding-block:56px}",
    ".ndl .t-paper{background:var(--nd-paper);--card:var(--nd-bg)}",
    ".ndl .t-olive{background:var(--nd-olive);--fg:var(--nd-on-olive);--fg2:color-mix(in srgb,var(--nd-on-olive) 86%,transparent);--mut:color-mix(in srgb,var(--nd-on-olive) 70%,transparent);--ln:color-mix(in srgb,var(--nd-on-olive) 28%,transparent);--acc:var(--nd-on-olive);--hi:#E6D3B8;--card:color-mix(in srgb,var(--nd-on-olive) 10%,transparent)}",
    ".ndl .t-dark{background:var(--nd-deep);--fg:var(--nd-on-deep);--fg2:color-mix(in srgb,var(--nd-on-deep) 82%,transparent);--mut:color-mix(in srgb,var(--nd-on-deep) 58%,transparent);--ln:color-mix(in srgb,var(--nd-on-deep) 20%,transparent);--acc:var(--nd-sand);--hi:var(--nd-sand);--card:color-mix(in srgb,var(--nd-on-deep) 8%,transparent)}",
    ".ndl .b.sel{box-shadow:inset 0 0 0 3px var(--nd-sand)}",
    ".ndl.editing [data-bid]{cursor:pointer}",
    ".ndl.editing [data-bid]:hover{box-shadow:inset 0 0 0 1px var(--nd-sand)}",
    ".ndl .cap{font:500 11px/1.4 var(--nd-sans);letter-spacing:.14em;text-transform:uppercase;color:var(--mut,var(--nd-muted))}",
    ".ndl .h{font-size:36px;line-height:1.1;margin:12px 0 24px}",
    ".ndl .lead{max-width:640px;font-size:17px;line-height:1.7;color:var(--fg2)}",
    ".ndl .more-link{display:inline-flex;gap:8px;align-items:center;font:500 15px/1.3 var(--nd-sans);color:var(--fg);text-decoration:none;border-bottom:1px solid var(--ln);padding-bottom:4px;transition:border-color .2s}",
    ".ndl .more-link::after{content:'→';color:var(--hi)}",
    ".ndl .more-link:hover{border-bottom-color:var(--hi)}",
    ".ndl .ph{margin:0;display:grid;gap:10px}",
    ".ndl .ph img{width:100%;display:block;object-fit:cover}",
    ".ndl .ph figcaption{font-size:13px;line-height:1.5;color:var(--mut)}",
    ".ndl .paras{display:grid;gap:14px;max-width:660px}",
    ".ndl .paras p{font-size:16px;line-height:1.7;color:var(--fg2)}",
    ".ndl .empty-b{padding:18px;border:1px dashed var(--ln);color:var(--mut);font-size:14px}",
    /* шапка, если первым идёт не обложка */
    ".ndl .top{display:flex;justify-content:space-between;align-items:center;padding-block:18px;border-bottom:1px solid var(--nd-line)}",
    ".ndl .mark{display:inline-flex;align-items:center;gap:10px;font:300 24px/1 var(--nd-serif);letter-spacing:.02em;color:inherit;text-decoration:none}",
    ".ndl .mark svg{width:30px;height:auto;fill:currentColor;display:block}",
    /* 1. обложка */
    ".ndl .b-hero{padding-block:18px 40px;min-height:min(94svh,860px);display:flex}",
    ".ndl .b-hero>.w{width:100%;display:flex;flex-direction:column}",
    ".ndl .cv-top{display:flex;justify-content:space-between;align-items:center;gap:12px}",
    ".ndl .cv{flex:1;display:grid;align-content:center;justify-items:center;text-align:center;padding-block:48px 8px}",
    ".ndl .arc{display:block;width:min(86%,560px);height:auto;color:var(--hi);overflow:visible}",
    ".ndl .arc path{fill:none;stroke:currentColor;stroke-width:1.4;vector-effect:non-scaling-stroke}",
    ".ndl .cv h1{font-size:42px;line-height:1.08;max-width:13em;margin-top:30px}",
    ".ndl .cv .role{margin-top:20px;max-width:34em;font-size:15px;line-height:1.6;color:var(--fg2)}",
    ".ndl .cv .btn{justify-self:center;margin-top:36px}",
    /* 2. для меня Noôdome */
    ".ndl .why{display:grid;gap:28px}",
    ".ndl .why .ph{width:min(100%,440px)}",
    ".ndl .why .ph img{aspect-ratio:4/5;object-position:50% 22%}",
    ".ndl .why-t{display:grid;gap:18px;align-content:center;min-width:0}",
    ".ndl .why-t .h{margin:2px 0 0}",
    ".ndl .say{display:grid;gap:14px}",
    ".ndl .say p{font:300 24px/1.4 var(--nd-serif);color:var(--fg)}",
    ".ndl .sign{font:italic 300 24px/1.2 var(--nd-serif);color:var(--acc)}",
    ".ndl .sign::before{content:'— '}",
    /* список */
    ".ndl .items{display:grid;margin-top:26px;border-top:1px solid var(--ln)}",
    ".ndl .item{display:grid;gap:6px;align-content:start;padding-block:18px;border-bottom:1px solid var(--ln)}",
    ".ndl .item b{font:300 23px/1.25 var(--nd-serif)}",
    ".ndl .item p{font-size:15px;line-height:1.65;color:var(--fg2)}",
    /* 3. проект */
    ".ndl .story{display:grid;gap:28px}",
    ".ndl .story-t{display:grid;gap:18px;align-content:start;min-width:0}",
    ".ndl .story-t h2{font-size:34px;line-height:1.12}",
    ".ndl .pull{margin:0;padding-left:18px;border-left:2px solid var(--hi);font:italic 300 22px/1.4 var(--nd-serif);color:var(--fg)}",
    ".ndl .story .ph img{aspect-ratio:4/3}",
    /* 4. что такое Noôdome */
    ".ndl .about{display:grid;gap:28px}",
    ".ndl .about-t{display:grid;gap:20px;align-content:start;min-width:0}",
    ".ndl .about-t .h{margin:0}",
    ".ndl .about .paras p:first-child{font:300 24px/1.4 var(--nd-serif);color:var(--fg)}",
    ".ndl .about .ph img{aspect-ratio:4/5}",
    /* 5. сообщество */
    ".ndl .stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-block:30px 40px;padding-top:20px;border-top:1px solid var(--ln)}",
    ".ndl .stat{display:grid;gap:4px;min-width:0}",
    ".ndl .stat b{font:300 38px/1 var(--nd-serif);color:var(--acc)}",
    ".ndl .stat span{font-size:13px;line-height:1.35;color:var(--mut)}",
    ".ndl .people-h{font:300 26px/1.2 var(--nd-serif);margin-bottom:18px}",
    ".ndl .people{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 14px}",
    ".ndl .person{display:grid;gap:8px;align-content:start;min-width:0}",
    ".ndl .person .pi{aspect-ratio:3/4;background:var(--card);overflow:hidden}",
    ".ndl .person img{width:100%;height:100%;object-fit:cover;object-position:50% 18%;display:block;filter:grayscale(1)}",
    ".ndl .person b{font:400 19px/1.2 var(--nd-serif)}",
    ".ndl .person span{font-size:13px;line-height:1.45;color:var(--fg2)}",
    ".ndl .b-community .more-link,.ndl .b-events .more-link{margin-top:32px}",
    /* 6. мероприятия */
    ".ndl .evs{display:grid;grid-auto-flow:column;grid-auto-columns:min(80%,300px);gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:10px;margin-top:8px;scrollbar-width:thin}",
    ".ndl .ev{scroll-snap-align:start;display:grid;grid-template-rows:auto 1fr;background:var(--card);color:inherit;text-decoration:none;min-width:0}",
    ".ndl .ev .im{aspect-ratio:16/10;background:#fff;overflow:hidden}",
    ".ndl .ev .im img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s}",
    ".ndl a.ev:hover .im img{transform:scale(1.03)}",
    ".ndl .ev .tx{display:grid;gap:8px;align-content:start;padding:16px 16px 20px}",
    ".ndl .ev b{font:300 21px/1.22 var(--nd-serif)}",
    ".ndl .ev p{font-size:14px;line-height:1.55;color:var(--fg2)}",
    /* шаги */
    ".ndl .steps{list-style:none;margin:0;padding:0;display:grid;border-top:1px solid var(--ln)}",
    ".ndl .steps li{display:grid;grid-template-columns:44px 1fr;gap:4px 12px;align-content:start;padding-block:18px;border-bottom:1px solid var(--ln)}",
    ".ndl .steps .n{grid-row:span 2;font:300 30px/1 var(--nd-serif);color:var(--nd-sage)}",
    ".ndl .steps b{font-weight:500;font-size:16px}",
    ".ndl .steps p{font-size:15px;color:var(--fg2)}",
    ".ndl .steps li.done .n,.ndl .steps li.done b::after{color:var(--acc)}",
    ".ndl .steps li.done b::after{content:'  ✓'}",
    /* прочие блоки */
    ".ndl .letter{max-width:620px;margin:0 auto;display:grid;gap:18px}",
    ".ndl .letter h2{font-size:30px;line-height:1.2;margin-bottom:6px}",
    ".ndl .letter p{font-size:17px;line-height:1.75}",
    ".ndl .letter .sign::before{content:''}",
    ".ndl .bq{max-width:820px;margin:0;display:grid;gap:16px}",
    ".ndl .bq p{font:300 32px/1.2 var(--nd-serif)}",
    ".ndl .bq footer{font-size:14px;color:var(--mut)}",
    ".ndl .qm{color:var(--hi)}",
    ".ndl .b-photo .ph img{max-height:640px}",
    ".ndl .pillars{display:grid;gap:28px}",
    ".ndl .pillar{display:grid;gap:8px;align-content:start}",
    ".ndl .fig{font:300 52px/1 var(--nd-serif);color:var(--acc)}",
    ".ndl .fig small{display:block;margin-top:6px;font:400 13px/1.3 var(--nd-sans);color:var(--mut)}",
    ".ndl .pillar h3{font-size:22px;margin-top:6px}",
    ".ndl .pillar p{font-size:15px;line-height:1.65;color:var(--fg2)}",
    ".ndl .faq{display:grid;border-top:1px solid var(--ln);max-width:760px}",
    ".ndl .faq details{border-bottom:1px solid var(--ln);padding-block:16px}",
    ".ndl .faq summary{cursor:pointer;font:300 22px/1.3 var(--nd-serif);list-style:none;display:flex;justify-content:space-between;gap:16px}",
    ".ndl .faq summary::-webkit-details-marker{display:none}",
    ".ndl .faq summary::after{content:'+';color:var(--acc);font-family:var(--nd-sans);font-weight:300}",
    ".ndl .faq details[open] summary::after{content:'−'}",
    ".ndl .faq p{margin-top:10px;font-size:15px;line-height:1.65;color:var(--fg2)}",
    /* форма */
    ".ndl form{display:grid;gap:14px;margin-top:28px;max-width:560px}",
    ".ndl label{display:grid;gap:6px;font-size:13px;color:var(--fg2)}",
    ".ndl input,.ndl textarea{width:100%;font:16px/1.4 var(--nd-sans);color:var(--fg);background:transparent;border:0;border-bottom:1px solid var(--ln);padding:10px 0;border-radius:0}",
    ".ndl textarea{resize:vertical;min-height:72px}",
    ".ndl input:focus,.ndl textarea:focus{outline:none;border-bottom-color:var(--hi)}",
    ".ndl .from{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:14px;padding:12px 14px;border:1px solid var(--ln)}",
    ".ndl .from b{font-weight:500;color:var(--hi)}",
    ".ndl .btn{display:inline-block;justify-self:start;font:500 15px/1 var(--nd-sans);color:var(--nd-deep);background:var(--nd-on-deep);border:0;border-radius:50px;padding:16px 28px;cursor:pointer;text-decoration:none;transition:background .2s,color .2s}",
    ".ndl .t-light .btn,.ndl .t-paper .btn{background:var(--nd-ink);color:var(--nd-bg)}",
    ".ndl .btn:hover{background:var(--nd-sand);color:var(--nd-deep)}",
    ".ndl .btn:focus-visible,.ndl a:focus-visible,.ndl summary:focus-visible{outline:2px solid var(--nd-sand);outline-offset:3px}",
    ".ndl .btn[disabled]{opacity:.5;cursor:default}",
    ".ndl .fine{font-size:12px;color:var(--mut)}",
    ".ndl .done-box{margin-top:28px;max-width:560px;display:grid;gap:12px;padding:22px;border:1px solid var(--ln)}",
    ".ndl .done-box h3{font-size:26px}",
    ".ndl .done-box pre{white-space:pre-wrap;font:13px/1.5 var(--nd-sans);margin:0;padding:12px;background:color-mix(in srgb,var(--fg) 8%,transparent)}",
    ".ndl .done-box a{color:var(--hi)}",
    ".ndl .err{color:#E39A84;font-size:14px}",
    ".ndl .t-light .err,.ndl .t-paper .err{color:#B4462E}",
    /* подвал как на noodome.club: всегда чёрный */
    ".ndl .ft{background:#181918;color:#EFEADF;padding-block:52px 28px;border-top:1px solid rgba(239,234,223,.12);font-size:15px;line-height:1.55}",
    ".ndl .ft a{color:inherit;text-decoration:none;transition:color .2s}",
    ".ndl .ft a:hover{color:#C9A9B4}",
    ".ndl .ft-nav{display:flex;flex-wrap:wrap;gap:10px 22px;font-size:16px;padding-bottom:28px;border-bottom:1px solid rgba(239,234,223,.16)}",
    ".ndl .ft-cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:26px 20px;padding-block:28px}",
    ".ndl .ft-col{display:grid;gap:6px;align-content:start;min-width:0;overflow-wrap:anywhere}",
    ".ndl .ft-h{font:500 11px/1.4 var(--nd-sans);letter-spacing:.14em;text-transform:uppercase;color:rgba(239,234,223,.5);margin-bottom:4px}",
    ".ndl .ft-col span{color:rgba(239,234,223,.72);font-size:14px}",
    ".ndl .ft-pills{display:flex;flex-wrap:wrap;gap:8px}",
    ".ndl .ft-pills a{border:1px solid rgba(239,234,223,.4);border-radius:50px;padding:8px 16px;font-size:14px}",
    ".ndl .ft-pills a:hover{border-color:#C9A9B4}",
    ".ndl .ft-word{display:block;width:100%;height:auto;fill:#97838A;margin-block:12px 28px}",
    ".ndl .ft-legal{display:flex;flex-wrap:wrap;gap:8px 22px;font-size:13px;color:rgba(239,234,223,.6)}",
    /* широкий экран */
    "@container (min-width:760px){",
    ".ndl .b{padding-block:88px}",
    ".ndl .b-hero{padding-block:24px 56px}",
    ".ndl .cv h1{font-size:76px}",
    ".ndl .cv .role{font-size:17px}",
    ".ndl .h{font-size:48px;margin-bottom:32px}",
    ".ndl .why{grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:72px;align-items:center}",
    ".ndl .say p{font-size:30px}",
    ".ndl .items{grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0 32px;border-top:0}",
    ".ndl .item{border-top:1px solid var(--ln);border-bottom:0}",
    ".ndl .story{grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:64px;align-items:start}",
    ".ndl .story-t h2{font-size:48px}",
    ".ndl .about{grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:64px;align-items:center}",
    ".ndl .about .paras p:first-child{font-size:28px}",
    ".ndl .stats{gap:32px}",
    ".ndl .stat b{font-size:64px}",
    ".ndl .people{grid-template-columns:repeat(4,minmax(0,1fr));gap:36px 24px}",
    ".ndl .evs{grid-auto-flow:row;grid-template-columns:repeat(3,minmax(0,1fr));overflow:visible;gap:20px}",
    ".ndl .letter h2{font-size:38px}",
    ".ndl .bq p{font-size:44px}",
    ".ndl .pillars{grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:40px}",
    ".ndl .steps{grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:0 28px;border-top:0}",
    ".ndl .steps li{grid-template-columns:1fr;border-bottom:0;border-top:1px solid var(--ln)}",
    ".ndl .steps .n{grid-row:auto;margin-bottom:8px}",
    ".ndl .ft-cols{grid-template-columns:repeat(4,minmax(0,1fr))}",
    "}",
    "@media (prefers-reduced-motion:reduce){.ndl *{transition:none!important}}"
  ].join("\n");

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function sub(s, c) {
    return String(s == null ? "" : s).replace(/\{nameGenitive\}/g, c.nameGenitive || c.name || "").replace(/\{name\}/g, c.name || "").replace(/\{signoff\}/g, signoff(c));
  }
  function signoff(c) { return c.signoff || String(c.name || "").split(/\s+/)[0] || ""; }
  function paras(v) {
    var a = Array.isArray(v) ? v : String(v || "").split(/\n\s*\n/);
    return a.map(function (x) { return String(x || "").trim(); }).filter(Boolean);
  }
  function url(u) { u = String(u || "").trim(); return /^(https?:|mailto:|tel:|#|\/)/i.test(u) ? u : ""; }
  function ext(u) { return /^https?:/i.test(u) ? ' target="_blank" rel="noopener"' : ""; }
  function link(text, u, c) { u = url(u); return text && u ? '<a class="more-link" href="' + esc(u) + '"' + ext(u) + ">" + esc(sub(text, c)) + "</a>" : ""; }
  var seq = 0;
  function newId() { seq++; return "b" + Date.now().toString(36) + seq.toString(36) + Math.floor(Math.random() * 1296).toString(36); }
  function block(type, data, theme) { return { id: newId(), type: type, theme: theme || "auto", data: data || (TYPES[type].shared ? {} : TYPES[type].make()) }; }
  function isEmpty(o) { if (!o) return true; for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) return false; return true; }
  /* Данные блока: у общих блоков из doc.club, иначе свои. */
  function dataOf(b, c) {
    var T = TYPES[b.type] || {};
    if (T.shared) { var cd = c && c.club && c.club[b.type]; if (cd) return cd; if (isEmpty(b.data)) return T.make(); }
    return b.data || {};
  }

  /* Фон «Авто»: берём фон, привычный для типа, и не ставим два одинаковых цветных фона подряд. */
  function themes(blocks) {
    var prev = "", out = [];
    (blocks || []).forEach(function (b) {
      var t = b.theme && b.theme !== "auto" ? b.theme : (TYPES[b.type] || {}).theme || "light";
      if ((!b.theme || b.theme === "auto") && t === prev) t = t === "paper" ? "light" : t === "light" ? "paper" : t === "olive" ? "paper" : "light";
      out.push(t); prev = t;
    });
    return out;
  }

  function markHtml(tag) {
    return "<" + tag + ' class="mark"' + (tag === "a" ? ' href="' + CLUB.site + '" target="_blank" rel="noopener"' : "") + '><svg viewBox="0 0 70.06 20" aria-hidden="true"><path d="' + DOME + '"/></svg>Noôdome</' + tag + ">";
  }
  function fig(src, cap, alt, c, cls) {
    return src ? '<figure class="ph' + (cls ? " " + cls : "") + '"><img src="' + esc(src) + '" alt="' + esc(sub(alt || cap || "", c)) + '" loading="lazy">' + (cap ? "<figcaption>" + esc(sub(cap, c)) + "</figcaption>" : "") + "</figure>" : "";
  }
  function head(d, c) {
    return (d.eyebrow ? '<p class="cap">' + esc(sub(d.eyebrow, c)) + "</p>" : "") + (d.title ? '<h2 class="h">' + esc(sub(d.title, c)) + "</h2>" : "");
  }
  function ps(v, c) { return paras(v).map(function (p) { return "<p>" + esc(sub(p, c)) + "</p>"; }).join(""); }

  var R = {
    hero: function (d, c) {
      var title = d.title || (d.quote ? "" : "{name} приглашает вас познакомиться с Noôdome");
      return '<div class="cv-top">' + markHtml("span") + (d.eyebrow ? '<span class="cap">' + esc(sub(d.eyebrow, c)) + "</span>" : "") + "</div>" +
        '<div class="cv"><svg class="arc" viewBox="-1 -1 72.05 21" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="M0 20C7.52 7.91 20.29 0 35.03 0 49.61 0 62.54 8.06 70.05 20"/></svg>' +
        "<h1>" + esc(sub(title || d.quote, c)) + "</h1>" + (d.role ? '<p class="role">' + esc(sub(d.role, c)) + "</p>" : "") +
        (d.button !== "" ? '<a class="btn" href="#apply" data-ndl-go>' + esc(sub(d.button || "Познакомиться", c)) + "</a>" : "") + "</div>";
    },
    why: function (d, c) {
      var photo = d.photo || c.photo, t = paras(d.text);
      return '<div class="why">' + (photo ? fig(photo, d.caption, c.name, c) : "") + '<div class="why-t">' +
        (d.eyebrow ? '<p class="cap">' + esc(sub(d.eyebrow, c)) + "</p>" : "") + (d.title ? '<h2 class="h">' + esc(sub(d.title, c)) + "</h2>" : "") +
        (t.length ? '<div class="say">' + ps(t, c) + "</div>" : '<p class="empty-b">Абзац «почему я здесь» пока пуст</p>') +
        (d.signoff ? '<p class="sign">' + esc(sub(d.signoff, c)) + "</p>" : "") + "</div></div>";
    },
    list: function (d, c) {
      var it = (d.items || []).filter(function (x) { return x && (x.label || x.text); });
      return head(d, c) + (d.intro ? '<p class="lead">' + esc(sub(d.intro, c)) + "</p>" : "") +
        (it.length ? '<div class="items">' + it.map(function (x) { return '<div class="item"><b>' + esc(sub(x.label, c)) + "</b><p>" + esc(sub(x.text, c)) + "</p></div>"; }).join("") + "</div>" : "");
    },
    story: function (d, c) {
      return '<div class="story"><div class="story-t">' + (d.eyebrow ? '<p class="cap">' + esc(sub(d.eyebrow, c)) + "</p>" : "") +
        (d.title ? "<h2>" + esc(sub(d.title, c)) + "</h2>" : "") + '<div class="paras">' + ps(d.text, c) + "</div>" +
        (d.quote ? '<blockquote class="pull">«' + esc(sub(d.quote, c)) + "»</blockquote>" : "") + link(d.linkText, d.linkUrl, c) + "</div>" +
        fig(d.photo, d.caption, d.title, c) + "</div>";
    },
    about: function (d, c) {
      return '<div class="about"><div class="about-t">' + head(d, c) + '<div class="paras">' + ps(d.text, c) + "</div>" + link(d.linkText, d.linkUrl, c) + "</div>" +
        fig(d.photo, d.caption, "Пространство Noôdome", c) + "</div>";
    },
    community: function (d, c) {
      var st = String(d.stats || "").split("\n").map(function (l) { var p = l.split("|"); return { n: (p[0] || "").trim(), t: p.slice(1).join("|").trim() }; }).filter(function (x) { return x.n; });
      var pp = (d.items || []).filter(function (x) { return x && x.name; });
      return head(d, c) + '<div class="paras">' + ps(d.text, c) + "</div>" +
        (st.length ? '<div class="stats">' + st.map(function (x) { return '<div class="stat"><b>' + esc(x.n) + "</b><span>" + esc(x.t) + "</span></div>"; }).join("") + "</div>" : "") +
        (pp.length ? (d.peopleTitle ? '<h3 class="people-h">' + esc(sub(d.peopleTitle, c)) + "</h3>" : "") + '<div class="people">' + pp.map(function (x) {
          return '<div class="person"><div class="pi">' + (x.photo ? '<img src="' + esc(x.photo) + '" alt="' + esc(x.name) + '" loading="lazy">' : "") + "</div><b>" + esc(x.name) + "</b>" + (x.role ? "<span>" + esc(x.role) + "</span>" : "") + "</div>";
        }).join("") + "</div>" : "") + link(d.linkText, d.linkUrl, c);
    },
    events: function (d, c) {
      var it = (d.items || []).filter(function (x) { return x && x.title; });
      return head(d, c) + (d.intro ? '<p class="lead" style="margin-bottom:24px">' + esc(sub(d.intro, c)) + "</p>" : "") +
        (it.length ? '<div class="evs">' + it.map(function (x) {
          var u = url(x.url), tag = u ? "a" : "div";
          return "<" + tag + ' class="ev"' + (u ? ' href="' + esc(u) + '"' + ext(u) : "") + '><div class="im">' + (x.photo ? '<img src="' + esc(x.photo) + '" alt="" loading="lazy">' : "") + '</div><div class="tx">' +
            '<p class="cap">' + esc([x.date, x.tag].filter(Boolean).join(" · ")) + "</p><b>" + esc(sub(x.title, c)) + "</b>" + (x.text ? "<p>" + esc(sub(x.text, c)) + "</p>" : "") + "</div></" + tag + ">";
        }).join("") + "</div>" : '<p class="empty-b">Добавьте мероприятия</p>') + link(d.linkText, d.linkUrl, c);
    },
    steps: function (d, c) {
      return head(d, c) + '<ol class="steps">' + (d.items || []).map(function (s, i) {
        return '<li class="' + (i === 0 ? "done" : "") + '"><span class="n">' + (i + 1) + "</span><b>" + esc(sub(s.title, c)) + "</b><p>" + esc(sub(s.text, c)) + "</p></li>";
      }).join("") + "</ol>";
    },
    apply: function (d, c) {
      return head(d, c) + (d.text ? '<p class="lead">' + esc(sub(d.text, c)) + "</p>" : "") +
        '<form novalidate data-ndl-form>' +
        '<label for="ndl-name">Как к вам обращаться<input id="ndl-name" name="name" autocomplete="name" required></label>' +
        '<label for="ndl-contact">Телефон или Telegram<input id="ndl-contact" name="contact" autocomplete="tel" required></label>' +
        '<label for="ndl-note">Пара слов о себе, если хочется<textarea id="ndl-note" name="note" rows="2"></textarea></label>' +
        '<div class="from">Рекомендатель: <b>' + esc(c.name) + "</b></div>" +
        '<p class="err" data-ndl-err hidden></p><button class="btn" type="submit">Отправить заявку</button>' +
        '<p class="fine">Заявка ни к чему не обязывает. Команда клуба свяжется с вами в течение нескольких дней.</p></form><div data-ndl-done hidden></div>';
    },
    letter: function (d, c) {
      var p = paras(d.paragraphs);
      return '<div class="letter"><h2>' + esc(sub(d.greeting || "Здравствуйте!", c)) + "</h2>" +
        (p.length ? ps(p, c) : '<p class="empty-b">Текст письма пока пуст</p>') + '<p class="sign">' + esc(sub(d.signoff || "{signoff}", c)) + "</p></div>";
    },
    quote: function (d, c) {
      return '<blockquote class="bq"><p><span class="qm">«</span>' + esc(sub(d.text, c)) + '<span class="qm">»</span></p>' + (d.author ? "<footer>" + esc(sub(d.author, c)) + "</footer>" : "") + "</blockquote>";
    },
    text: function (d, c) { return head(d, c) + '<div class="paras">' + ps(d.text, c) + "</div>"; },
    photo: function (d, c) { return d.photo ? fig(d.photo, d.caption, d.caption, c) : '<p class="empty-b">Загрузите фотографию для этого блока</p>'; },
    figures: function (d, c) {
      return head(d, c) + '<div class="pillars">' + (d.items || []).map(function (p) {
        return '<div class="pillar"><div class="fig">' + esc(sub(p.figure, c)) + (p.unit ? "<small>" + esc(sub(p.unit, c)) + "</small>" : "") + "</div><h3>" + esc(sub(p.label, c)) + "</h3><p>" + esc(sub(p.text, c)) + "</p></div>";
      }).join("") + "</div>";
    },
    faq: function (d, c) {
      return head(d, c) + '<div class="faq">' + (d.items || []).filter(function (x) { return x && x.q; }).map(function (x) {
        return "<details><summary>" + esc(sub(x.q, c)) + "</summary><p>" + esc(sub(x.a, c)) + "</p></details>";
      }).join("") + "</div>";
    }
  };

  function footer() {
    var a = function (x, cls) { var u = /^#/.test(x[1]) ? CLUB.site + "/" + x[1] : /^\//.test(x[1]) ? CLUB.site + x[1] : x[1]; return '<a href="' + esc(u) + '" target="_blank" rel="noopener"' + (cls ? ' class="' + cls + '"' : "") + ">" + esc(x[0]) + "</a>"; };
    return '<footer class="ft"><div class="w">' +
      '<nav class="ft-nav" aria-label="Разделы сайта Noôdome">' + CLUB.nav.map(function (x) { return a(x); }).join("") + "</nav>" +
      '<div class="ft-cols">' +
      '<div class="ft-col"><p class="ft-h">Адрес</p>' + a([CLUB.address, CLUB.map]) + "<span>Время работы:<br>" + CLUB.hours.map(esc).join("<br>") + "</span></div>" +
      '<div class="ft-col"><p class="ft-h">Контакты</p><a href="tel:' + CLUB.phone.replace(/[^+\d]/g, "") + '">' + esc(CLUB.phone) + '</a><a href="mailto:' + CLUB.email + '">' + esc(CLUB.email) + "</a></div>" +
      '<div class="ft-col"><p class="ft-h">Мы в соцсетях</p>' + CLUB.social.map(function (x) { return a(x); }).join("") + "</div>" +
      '<div class="ft-col"><p class="ft-h">Приложение</p><div class="ft-pills">' + a(["App Store", CLUB.app]) + a(["Google Play", CLUB.app]) + "</div></div>" +
      "</div>" +
      '<svg class="ft-word" viewBox="0 0 1820 351" role="img" aria-label="Noôdome"><path fill-rule="evenodd" clip-rule="evenodd" d="' + WORDMARK + '"/></svg>' +
      '<div class="ft-legal">' + CLUB.legal.map(function (x) { return a(x); }).join("") + "<span>© Noôdome</span></div>" +
      "</div></footer>";
  }

  function render(c, opts) {
    opts = opts || {};
    c = c || {};
    var blocks = c.blocks && c.blocks.length ? c.blocks : toBlocks(c);
    var th = themes(blocks), h = "";
    if (!blocks.length || blocks[0].type !== "hero") h += '<header class="w top">' + markHtml("span") + '<span class="cap">Личное приглашение</span></header>';
    blocks.forEach(function (b, i) {
      var fn = R[b.type];
      if (!fn) return;
      h += '<section class="b b-' + b.type + " t-" + th[i] + (opts.selected === b.id ? " sel" : "") + '" data-bid="' + esc(b.id) + '"' + (b.type === "apply" ? ' id="apply"' : "") +
        '><div class="w">' + fn(dataOf(b, c), c) + "</div></section>";
    });
    return h + footer();
  }

  /* Набор блоков нового приглашения: 1–3 свои, дальше общие блоки клуба. */
  function defaultBlocks(t) {
    t = t || {};
    var bs = [block("hero", TYPES.hero.make())];
    var w = TYPES.why.make(); if (t.why) w.text = t.why; if (t.whyTitle) w.title = t.whyTitle;
    bs.push(block("why", w));
    var m = t.mine || {};
    if ((m.items || []).length) bs.push(block("list", { eyebrow: "Мой Noôdome", title: m.title || "Что мне здесь близко", intro: m.intro || "", items: m.items }));
    var s = t.story;
    if (s && (s.title || s.text)) bs.push(block("story", Object.assign(TYPES.story.make(), { eyebrow: s.label || "Мой проект с Noôdome", title: s.title || "", text: s.text || "", quote: s.quote || "", linkUrl: s.linkUrl || "", linkText: s.linkUrl ? (s.linkText || "Подробнее о проекте") : "" })));
    SHARED.forEach(function (k) { bs.push(block(k, {})); });
    return bs;
  }
  /* Старые документы без блоков. */
  function toBlocks(c) { return defaultBlocks(c); }

  function leadText(c, lead) {
    return "Заявка по рекомендации: " + c.name + " (код " + c.slug + ")\nИмя: " + lead.name + "\nКонтакт: " + lead.contact + (lead.note ? "\nО себе: " + lead.note : "");
  }
  function bind(root, c, opts) {
    opts = opts || {};
    root.addEventListener("click", function (e) {
      var go = e.target.closest && e.target.closest("[data-ndl-go]");
      if (!go) return;
      e.preventDefault();
      var t = root.querySelector(".b-apply") || root.querySelector("[data-ndl-form]");
      if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    var form = root.querySelector("[data-ndl-form]");
    if (!form) return;
    var err = root.querySelector("[data-ndl-err]"), done = root.querySelector("[data-ndl-done]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var lead = { name: form.elements.name.value.trim(), contact: form.elements.contact.value.trim(), note: form.elements.note.value.trim(), ref: c.slug, connectorName: c.name };
      if (!lead.name || !lead.contact) { err.textContent = "Напишите, как к вам обращаться и как с вами связаться."; err.hidden = false; return; }
      err.hidden = true;
      var btn = form.querySelector("button");
      btn.disabled = true; btn.textContent = "Отправляем…";
      Promise.resolve(opts.submit ? opts.submit(lead) : { mode: "manual" }).then(function (res) {
        form.hidden = true; done.hidden = false;
        if (res && res.mode === "manual") {
          var txt = leadText(c, lead);
          done.innerHTML = '<div class="done-box"><h3>Остался один шаг</h3><p>Отправьте этот текст команде клуба на <b>' + CLUB.email + "</b>. Мы сразу увидим, что вы от " +
            esc(c.nameGenitive || c.name) + ".</p><pre>" + esc(txt) + '</pre><p><button class="btn" type="button" data-copy>Скопировать текст</button></p><p class="fine"><a href="mailto:' + CLUB.email +
            "?subject=" + encodeURIComponent("Заявка по рекомендации: " + c.name) + "&body=" + encodeURIComponent(txt) + '">Открыть в почте</a></p></div>';
          var cb = done.querySelector("[data-copy]");
          cb.addEventListener("click", function () {
            try { navigator.clipboard.writeText(txt).then(function () { cb.textContent = "Скопировано"; }, function () { selectPre(done); }); } catch (x) { selectPre(done); }
          });
        } else {
          done.innerHTML = '<div class="done-box"><h3>Спасибо, заявка у нас</h3><p>Команда Noôdome свяжется с вами в ближайшие дни и пригласит на встречу. ' + esc(signoff(c)) + " тоже узнает, что вы откликнулись.</p></div>";
        }
      }, function () {
        btn.disabled = false; btn.textContent = "Отправить заявку";
        err.textContent = "Не получилось отправить. Попробуйте ещё раз или напишите на " + CLUB.email + "."; err.hidden = false;
      });
    });
  }
  function selectPre(scope) {
    var pre = scope.querySelector("pre"); if (!pre) return;
    var r = document.createRange(); r.selectNodeContents(pre);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }

  window.NDL = { css: CSS, club: CLUB, TYPES: TYPES, SHARED: SHARED, THEMES: THEMES, render: render, bind: bind, esc: esc, sub: sub, paras: paras, themes: themes,
    block: block, newId: newId, defaultBlocks: defaultBlocks, toBlocks: toBlocks, dataOf: dataOf, leadText: leadText };
})();
