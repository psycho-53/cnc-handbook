(() => {
'use strict';
const DB = window.CNC_DATA;
if(!DB) {document.getElementById('app').textContent='Ошибка загрузки справочника';return;}
const qs = (s) => document.querySelector(s);
const safe = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const iconPaths = {
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-8h6v8"/>',
 calc:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h2m4 0h2M8 16h2m4 0h2M8 19h2m4 0h2"/>',
 book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/><path d="M8 7h8M8 11h6"/>',
 wrench:'<path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4l-3.3 3.3-3.6-3.6z"/>',
 layers:'<path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/>',
 monitor:'<rect x="2" y="3" width="20" height="15" rx="2"/><path d="M8 22h8m-4-4v4M6 7h12M6 11h8"/>',
 graduation:'<path d="m2 10 10-6 10 6-10 6-10-6ZM6 12.5v5c3 3 9 3 12 0v-5M22 10v6"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
 bookmark:'<path d="M5 3h14v18l-7-4-7 4V3Z"/>',
 arrow:'<path d="M4 12h16m-7-7 7 7-7 7"/>',
 chevron:'<path d="m9 18 6-6-6-6"/>',
 down:'<path d="m6 9 6 6 6-6"/>',
 up:'<path d="m6 15 6-6 6 6"/>',
 back:'<path d="m15 18-6-6 6-6"/>',
 info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v5m0-9h.01"/>',
 warning:'<path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v4m0 4h.01"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2"/>',
 external:'<path d="M13 4h7v7M20 4l-9 9"/><path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5"/>',
 file:'<path d="M6 2h9l5 5v15H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M14 2v6h6M8 13h8m-8 4h6"/>',
 sliders:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="white"/><circle cx="15" cy="17" r="2" fill="white"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4"/>',
 gauge:'<path d="M5 17a9 9 0 1 1 14 0M5 17l-2 3h18l-2-3M12 13l4-5"/>',
 alert:'<circle cx="12" cy="12" r="10"/><path d="M12 7v6m0 4h.01"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'
};
const ic = (name,cls='') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name]||iconPaths.info}</svg>`;
const link = (route) => `#/${route}`;
const byId = id => DB.articles.find(a=>a.id===id);
const byCat = id => DB.categories.find(c=>c.id===id);
let saved;
try {saved = new Set(JSON.parse(localStorage.getItem('cnc-handbook-saved')||'[]').filter(x=>typeof x==='string'));} catch(e){saved=new Set()}
let academyDone;try{academyDone=new Set(JSON.parse(localStorage.getItem('cnc-academy-done')||'[]').filter(x=>typeof x==='string'))}catch(_){academyDone=new Set()}
const state = {academyDone, academyQuiz:{}, academyFields:{D:'10',n:'4800',z:'4',fz:'0,05',apA:'20',aeA:'1',apB:'5',aeB:'10'}, saved, category:'all', query:'', codesQuery:'', codesGroup:'Все', control:'siemens', siwordQuery:'', siwordGroup:'Все группы', siwordDoc:'all', siwordLimit:24, fanwordQuery:'', fanwordGroup:'Все группы', fanwordLimit:24, mode:'milling', expanded:new Set(), calc:{
 milling:{D:'10',Vc:'160',z:'3',fz:'0,05',ap:'5',ae:'2',L:'100'},
 drilling:{D:'6',Vc:'80',fn:'0,08',L:'40'},
 reverse:{D:'10',n:'4800',z:'4',Vf:'600'},
 time:{L:'100',Vf:'600',passes:'3'},
 scallop:{D:'10',step:'1'},
 ramp:{depth:'5',angle:'3'},
 drillpoint:{D:'10',angle:'118'},
 thermal:{L:'200',alpha:'12',delta:'10'}
}};
const NAV = [
 ['home','Главная','home'],['calc','Калькулятор','calc'],['library','Справочник','book'],['category/problems','Проблемы','wrench'],['category/technology','Технология','layers'],['guide','Навигатор технолога','book'],['academy','Академия фрезерования','graduation'],['codes','Стойки ЧПУ','monitor'],['siemens-words','Слова SINUMERIK','book'],['fanuc-words','Слова FANUC','book'],['category/theory','База знаний','graduation']
];
function route(){try{let r=decodeURIComponent((location.hash||'#/home').replace(/^#\/?/,'').split('?')[0]);return r||'home'}catch(_){return 'missing'}}
function activeNav(key,r){return key==='library' ? (r==='library'||r.startsWith('article/')||r.startsWith('category/') ) : key===r}
function pageName(r){if(r==='home')return'Главная';if(r==='calc')return'Калькулятор режимов';if(r==='library')return'Библиотека';if(r==='guide')return'Навигатор технолога';if(r==='academy')return'Академия фрезерования';if(r==='codes')return'Стойки ЧПУ';if(r==='siemens-words')return'Слова SINUMERIK';if(r==='fanuc-words')return'Слова FANUC';if(r==='saved')return'Избранное';if(r==='sources')return'Источники';if(r.startsWith('category/'))return byCat(r.split('/')[1])?.title||'Раздел';if(r.startsWith('article/'))return byId(r.split('/')[1])?.title||'Статья';return'Справочник'}
function sidebar(r){return `<aside class="sidebar">
 <a class="brand" href="#/home"><div class="brand-emblem">CNC</div><div><span class="brand-title">Handbook</span><span class="brand-sub">Фрезерная обработка</span></div></a>
 <div class="side-label">Навигация</div>
 ${NAV.map(([id,t,i])=>`<a class="side-link ${activeNav(id,r)?'active':''}" href="${link(id)}">${ic(i)}${safe(t)}</a>`).join('')}
 <div class="side-label">Личное</div>
 <a class="side-link ${r==='saved'?'active':''}" href="#/saved">${ic('bookmark')}Избранное <span class="small" style="margin-left:auto;opacity:.6">${state.saved.size}</span></a>
 <div class="side-bottom"><strong>Справочник · v0.3</strong><p>Без регистрации, рекламы и ИИ. Основные материалы доступны офлайн после первого открытия по HTTPS.</p></div>
 </aside>`}
function topbar(r){return `<div class="topbar"><a class="mobile-brand" href="#/home" aria-label="Главная CNC Handbook"><span class="brand-emblem">CNC</span> Handbook</a><div><div class="topbar-title">${safe(pageName(r))}</div><div class="topbar-sub">Техническая база фрезеровщика</div></div><div class="top-actions"><a class="icon-btn" href="#/library" aria-label="Поиск по справочнику" title="Поиск">${ic('search')}</a><a class="icon-btn" href="#/saved" aria-label="Избранное" title="Избранное">${ic('bookmark')}</a></div></div>`}
function bottomNav(r){let mobile=[['home','Главная','home'],['calc','Расчёты','calc'],['library','Поиск','search'],['codes','Стойки','monitor'],['academy','Академия','graduation']];return `<nav class="nav-bottom" aria-label="Основная навигация">${mobile.map(([id,t,i])=>`<a class="${id==='library'?(r==='library'||r.startsWith('article/')||r.startsWith('category/')?'active':''):(id===r?'active':'')}" href="${link(id)}" aria-label="${safe(t)}">${ic(i)}<span>${t}</span></a>`).join('')}</nav>`}
function footer(){return `<footer class="footer"><span>CNC Handbook · версия 0.9.0 · 2026</span><a href="#/sources">Источники и ограничения</a></footer>`}
function shell(r,body){return `<div class="app-shell">${sidebar(r)}<div class="page-wrap">${topbar(r)}<main class="main" id="main-content">${body}${footer()}</main></div>${bottomNav(r)}</div>`}
function crumb(links){return `<div class="breadcrumb">${links.map(([t,r],i)=>`${i?ic('chevron'):''}${r?`<a href="${link(r)}">${safe(t)}</a>`:`<span>${safe(t)}</span>`}`).join('')}</div>`}
function header(title,desc,sub=''){return `<div class="page-intro">${sub?`<div class="eyebrow mb-3">${safe(sub)}</div>`:''}<h1>${safe(title)}</h1><p>${safe(desc)}</p></div>`}
function feature(id,title,desc,iconName){return `<a class="feature-card" href="${link(id)}"><div class="feature-icon">${ic(iconName,'lg')}</div><div class="feature-title">${safe(title)}</div><p>${safe(desc)}</p><span class="arrow">${ic('arrow')}</span></a>`}
function articleCard(a){let cat=byCat(a.cat);return `<article class="article-card"><div class="article-card-head"><div><div class="eyebrow">${safe(cat?.title||'Статья')} · ${a.time} мин</div><h3 class="mt-2">${safe(a.title)}</h3></div><button class="bookmark-btn ${state.saved.has(a.id)?'saved':''}" data-action="bookmark" data-id="${a.id}" title="${state.saved.has(a.id)?'Убрать из избранного':'В избранное'}" aria-label="${state.saved.has(a.id)?'Убрать из избранного':'В избранное'}">${ic('bookmark')}</button></div><p>${safe(a.quick)}</p><div class="article-meta"><span class="tag">${safe(a.subtitle)}</span><a href="${link('article/'+a.id)}" class="btn btn-sm btn-quiet">Открыть ${ic('chevron')}</a></div></article>`}
function articleGrid(arr){return arr.length?`<div class="article-grid">${arr.map(articleCard).join('')}</div>`:empty('Ничего не найдено','Попробуй другой запрос или категорию.')}
function empty(title,desc){return `<div class="empty">${ic('search')}<h3>${safe(title)}</h3><p>${safe(desc)}</p></div>`}
function callout(text,warn=false){return `<div class="callout ${warn?'alert':''}">${ic(warn?'warning':'info')}<div>${text}</div></div>`}
function heroMark(){return `<svg viewBox="0 0 260 240" aria-hidden="true"><defs><linearGradient id="steel" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#7bafed" stop-opacity=".7"/><stop offset="1" stop-color="#236fbc" stop-opacity=".2"/></linearGradient></defs><path d="M35 155 122 203l103-50-93-47z" fill="none" stroke="#79b8fa" stroke-width="2"/><path d="M35 155V96l90-48 100 45v60" fill="none" stroke="#4383c0" stroke-width="1.8"/><path d="M125 48v57M225 93l-100 56-90-53" stroke="#5ba2e6" fill="none" stroke-width="1.6"/><path d="m70 125 53-28 61 30-53 27z" fill="url(#steel)" stroke="#7ebcf2"/><path d="m70 125v22l61 30v-23m53-27v20l-53 30" fill="none" stroke="#7ebcf2"/><path d="M105 67v52m-8-51h16M97 58h16l5 9H92z" stroke="#b8d8f9" stroke-width="2" fill="#2a6baf"/><path d="m105 119 4 4-4 4-4-4z" fill="#5ecbd3"/><path d="M105 26v20m-4-5 4 5 4-5M105 120h-25" stroke="#77c8ff" stroke-dasharray="4 5"/><path d="M35 155 10 170M35 155v-28" stroke="#72b8ec" stroke-width="1.4"/><path d="m10 170 9-1-4-7" stroke="#72b8ec" fill="none"/><path d="M225 153h18" stroke="#72b8ec" stroke-width="1.5"/><circle cx="125" cy="149" r="3" fill="#8dddfa"/></svg>`}
function home(){let priority=['drawing-tech','rough-finish-sequence','corner-overload','cam-risk-review'];return `<section class="hero"><div class="hero-copy"><div class="eyebrow">Справочник фрезерной обработки / v0.9.0</div><h1>Всё важное —<br>под рукой у станка.</h1><p>Режимы, технология, типовые проблемы и команды стоек. Коротко для работы, подробно для понимания.</p><div class="hero-actions"><a class="btn btn-hero" href="#/calc">${ic('calc')} Рассчитать режимы</a><a class="btn btn-dark-outline" href="#/academy">${ic('graduation')} Академия фрезерования</a><a class="btn btn-dark-outline" href="#/guide">${ic('layers')} Навигатор технолога</a><a class="btn btn-dark-outline" href="#/library">${ic('search')} Найти тему</a></div></div><div class="hero-mark">${heroMark()}</div></section>
 <div class="mt-3 stats"><span>${DB.articles.length} проверяемых тем</span><span class="dot"></span><span>3 группы стоек</span><span class="dot"></span><span>Без ИИ</span></div>
 <section class="mt-5"><div class="section-heading"><div><h2>Рабочие разделы</h2><p class="small muted mb-0">Нужная информация — в два касания</p></div></div><div class="feature-grid">
 ${feature('calc','Калькуляторы','Обороты, подача, съём, время','calc')}
 ${feature('library','Справочник','Таблицы, понятия, инструмент','book')}
 ${feature('category/problems','Типовые проблемы','Вибрации, сколы, размер','wrench')}
 ${feature('category/technology','Технология','Базы, установы, стратегии','layers')}
 ${feature('codes','Стойки ЧПУ','Редкие G-коды и режимы','monitor')}
 ${feature('siemens-words','Язык SINUMERIK',DB.siWords.length+' команд и слов','book')}
 ${feature('fanuc-words','Язык FANUC',DB.fanucWords.length+' макрокоманд и слов','book')}
 ${feature('category/theory','База знаний','Причины и физика процессов','graduation')}
 ${feature('academy','Академия фрезерования','10 уроков и живой разбор ap / ae','graduation')}
 ${feature('guide','Маршруты технолога','Подборки тем по реальным задачам','layers')}
 </div></section>
 <section class="mt-5"><div class="section-heading"><div><h2>Часто нужно на смене</h2><p class="small muted mb-0">Начни с готовой краткой справки</p></div><a class="text-link" href="#/library">Все темы ${ic('arrow')}</a></div>${articleGrid(priority.map(byId))}</section>
 <section class="mt-4">${callout('<strong>Как пользоваться:</strong> каждая статья начинается с короткой справки и проверок. Нажми «Читать подробно», чтобы увидеть объяснение, примеры и источники.')}</section>`}
const processRoutes = [["От чертежа до первого установа","Где базы, какие припуски, как закрепить заготовку и не потерять размер",["drawing-tech","blank-prep","datum-321","datum-types","setup-repeatability","dim-chain","process-card"]],["Черновая, получистовая и чистовая","Когда нужна каждая стадия, как управлять оставленным материалом",["rough-finish-sequence","allowance-wall-floor","ae-ap","stepover-when","constant-engagement","rest-machining","finishing-surfaces"]],["Карман, паз и сложные переходы","Врезания, перегрузка во внутренних углах, глубокие полости и заусенцы",["slot-milling","corner-overload","milling-entry","deep-pocket-reach","chips-deep-pocket","pocket-parameters","bottom-surface","burrs-exit"]],["Отверстия и резьбы","Положение отверстий, сверление, развёртывание и интерполяция",["hole-spotting","blind-hole-depth","drill-intersect","reaming","precision-boring","hole-position","thread-milling-technology"]],["Детали, которые деформируются","Плита после черновой, тонкая стенка, погрешность формы",["stress-release","flatness","perpendicularity","thinwall-spring","finish-cutter-deflection","workholding-stiffness"]],["Режущая кромка и обрабатываемость","Стойкость, материал, твёрдость, толщина стружки и условия резания",["tool-geometry","chip-thickness-min","hard-steel-cutting","aluminum-bue","stainless-milling","cast-iron-milling","wear-symptom-tree","thermo-tool"]],["CAM и наладка","Как не перепутать нули, коррекции и технологические условия",["two-sided-part","fourth-axis-index","fixture-clearance","cam-risk-review","tool-correction-errors","run-check","first-article"]],["Контроль и поиск дефектов","Почему размер ушёл, стенка конусная, фреза скололась",["inspection-plan","measurement-temperature","manufacturing-drawing-gdt","chatter-vs-forced","dimension-drift","tools-breakdown","process-fmea","tool-life-record"]]];
function guidePage(){return `${header('Навигатор технолога','Собранные в маршруты статьи: от изучения чертежа до поиска причин брака. Можно начинать с любого блока.','ПРАКТИКА И ТЕОРИЯ')}
 <div class="panel mb-4"><h2>Как проходить тему</h2><p class="muted mb-0">Открой сначала короткую памятку, затем подробную теорию и связанные темы. Для реального производства сверяй режимы, программу и контроль с документацией станка и инструментальной оснастки.</p></div>
 ${processRoutes.map(([title,description,ids],index)=>`<section class="panel mt-4"><div class="eyebrow">Блок ${index+1} из ${processRoutes.length}</div><h2 class="mt-2">${safe(title)}</h2><p class="muted">${safe(description)}</p><div class="related-links">${ids.map(byId).filter(Boolean).map(a=>`<a href="${link('article/'+a.id)}">${safe(a.title)} ${ic('chevron','xs')}</a>`).join('')}</div></section>`).join('')}
 `;}
function searchableText(a){return [a.title,a.subtitle,a.quick,a.cat,a.tags.join(' '),...(a.sections||[]).flatMap(s=>[s.h,s.p||'',...(s.bullets||[])])].join(' ').toLocaleLowerCase('ru')}
function normalizeSearch(s){return String(s).toLocaleLowerCase('ru').replace(/ё/g,'е').replace(/\b([gm])\s+(\d+)/g,'$1$2').replace(/\s+/g,' ').trim()}
function filteredArticles(){let words=normalizeSearch(state.query).split(' ').filter(Boolean);return DB.articles.filter(a=>(state.category==='all'||a.cat===state.category)&&words.every(w=>normalizeSearch(searchableText(a)).includes(w)))}
function libraryResults(){let arr=filteredArticles();return `<div class="section-heading" style="margin-bottom:14px"><h3 class="mb-0">${state.query?'Результаты поиска':'Все статьи'}</h3><span class="count">${arr.length} из ${DB.articles.length}</span></div>${articleGrid(arr)}`}
function library(){return `${header('Библиотека знаний','Короткие объяснения и развёрнутые технические статьи. Поиск работает по названиям, содержанию и обозначениям.','СПРАВОЧНИК')}
 <label class="search-box">${ic('search')}<input id="library-search" type="search" placeholder="Например: H7, вибрация, G54, припуск" autocomplete="off" value="${safe(state.query)}" aria-label="Поиск по справочнику"></label>
 <div class="filters">${[['all','Все разделы'],...DB.categories.map(x=>[x.id,x.title])].map(([id,t])=>`<button class="chip ${state.category===id?'active':''}" data-action="category-filter" data-cat="${id}" aria-pressed="${state.category===id}">${safe(t)}</button>`).join('')}</div>
 <div id="library-results" aria-live="polite">${libraryResults()}</div>`}
function categoryPage(id){let cat=byCat(id);if(!cat)return missing();let arts=DB.articles.filter(a=>a.cat===id);return `${crumb([['Библиотека','library'],[cat.title,null]])}${header(cat.title,cat.desc,'БАЗА ЗНАНИЙ / '+cat.title.toLocaleUpperCase('ru'))}${articleGrid(arts)}`}
function articlePage(id){let a=byId(id);if(!a)return missing();let cat=byCat(a.cat),expanded=state.expanded.has(id),isAcad=DB.academy?.lessons?.some(x=>x.id===id);return `${crumb(isAcad?[['Академия','academy'],[a.title,null]]:[['Библиотека','library'],[cat.title,'category/'+a.cat],[a.title,null]])}
 <div class="article-hero"><div class="article-card-head"><div><div class="eyebrow">${safe(cat.title)} · ${a.time} мин чтения</div><h1>${safe(a.title)}</h1><div class="subtitle">${safe(a.subtitle)}</div></div><button class="bookmark-btn ${state.saved.has(id)?'saved':''}" data-action="bookmark" data-id="${id}" aria-label="Избранное" title="В избранное">${ic('bookmark','lg')}</button></div>
 <div class="quick-panel"><div class="eyebrow">Коротко / ответ за 30 секунд</div><p>${safe(a.quick)}</p></div>
 <h3>Что проверить в первую очередь</h3><ol class="actions-list">${a.actions.map(s=>`<li>${safe(s)}</li>`).join('')}</ol>
 <div class="mt-4"><button class="btn btn-sm" data-action="print-article" data-id="${safe(id)}">Печать полной статьи</button></div><div class="mt-4"><button class="full-button" data-action="expand" data-id="${id}" aria-expanded="${expanded}">${ic(expanded?'up':'down')} ${expanded?'Свернуть подробную справку':'Читать подробно: причины, примеры, нюансы'}</button></div></div>
 ${expanded?`<div class="article-content"><div class="article-content-inner"><div class="eyebrow mb-3">Подробная справка</div>${a.sections.map(s=>`<section><h3>${safe(s.h)}</h3>${s.diagram?s.diagram:''}${s.p?`<p>${safe(s.p)}</p>`:''}${s.bullets?`<ul>${s.bullets.map(b=>`<li>${safe(b)}</li>`).join('')}</ul>`:''}</section>`).join('')}</div></div>`:''}
 <section class="mt-5"><div class="section-heading"><h2>Связанные темы</h2></div><div class="related-links">${a.linked.map(id=>byId(id)).filter(Boolean).map(x=>`<a href="${link('article/'+x.id)}">${safe(x.title)} ${ic('chevron','xs')}</a>`).join('')}<a href="#/calc">${ic('calc','xs')} Калькуляторы</a></div></section>
 ${a.sources.length?`<section class="mt-5"><div class="section-heading"><h2>Источники</h2></div><ul class="source-list">${a.sources.map(s=>DB.sources[s]).filter(Boolean).map(s=>sourceItem(s)).join('')}</ul></section>`:''}
 ${isAcad?`<div class="panel mt-4"><div class="eyebrow">Академия фрезерования · глава 1</div><p class="small muted mt-3">Разобрал выводы и ограничения модели? Отметь урок как пройденный и переходи к следующему.</p><div class="acad-lesson-actions"><button type="button" class="btn btn-primary" data-action="academy-complete" data-id="${safe(id)}">${state.academyDone.has(id)?'✓ Пройдено':'Отметить урок пройденным'}</button><a class="btn btn-quiet" href="#/academy">Все уроки главы</a></div></div>`:''}
 <div class="mt-4">${callout('<strong>Важно:</strong> справочник объясняет принципы и типовые проверки. Настройки станка, инструмент и режимы всегда сверяй с документацией производителя и техпроцессом.',true)}</div>`}
function savedPage(){let arr=DB.articles.filter(a=>state.saved.has(a.id));return `${header('Избранное','Твои сохранённые справочные статьи. Список хранится только в браузере на этом устройстве.','ЛИЧНОЕ')}${arr.length?articleGrid(arr):empty('Пока ничего нет','Нажимай значок закладки на статьях — они появятся здесь.')}`}
function codesRows(){
 const c=DB.codes[state.control], words=normalizeSearch(state.codesQuery).split(' ').filter(Boolean);
 const all=c.entries||[];
 const rows=all.filter(x=>(state.codesGroup==='Все'||x.group===state.codesGroup)&&
  words.every(word=>normalizeSearch([x.code,x.name,x.group,x.purpose,x.use,x.caution].join(' ')).includes(word)));
 return `<div class="section-heading" style="margin-bottom:16px"><h3 class="mb-0">Расширенные функции</h3><span class="count">${rows.length} из ${all.length}</span></div>
 ${rows.length?`<div class="advanced-code-grid">${rows.map(x=>{
   const src=DB.sources[x.source];
   return `<article class="advanced-code-card">
      <div class="advanced-code-heading"><div class="advanced-code-sign">${safe(x.code)}</div><span class="advanced-code-type">${safe(x.group)}</span></div>
      <h3>${safe(x.name)}</h3>
      <p class="advanced-code-purpose">${safe(x.purpose)}</p>
      <div class="advanced-code-details"><strong>Где пригодится</strong><p>${safe(x.use)}</p></div>
      <div class="advanced-code-warning"><strong>Нюанс / ограничения</strong><p>${safe(x.caution)}</p></div>
      ${x.example?`<div class="advanced-code-example"><strong>Иллюстрация синтаксиса — не запускать без проверки</strong><pre>${safe(x.example)}</pre></div>`:''}
      ${src?`<div class="advanced-code-source">${src.url?`<a href="${safe(src.url)}" target="_blank" rel="noopener noreferrer">Руководство: ${safe(src.name)} ${ic('external','xs')}</a>`:`Источник: ${safe(src.name)}`}</div>`:''}
   </article>`;
 }).join('')}</div>`:empty('Функций по запросу нет','Попробуй другой термин или выбери другой раздел.')}`;}
function codesPage(){
 const c=DB.codes[state.control], groups=c.groups||['Все'];
 return `${header('Продвинутые функции стоек','Редкие и полезные команды, преобразования, режимы и циклы. Без очевидных G0/G1/G2.','SIEMENS · FANUC · HAAS')}
 <div class="mt-3 mb-4 reference-buttons"><a class="btn btn-primary" href="#/siemens-words">${ic('book')} SINUMERIK: ${DB.siWords.length} слов</a><a class="btn btn-primary" href="#/fanuc-words">${ic('book')} FANUC Macro B: ${DB.fanucWords.length} слов</a></div>
 <div class="controller-tabs">${Object.entries(DB.codes).map(([id,ctl])=>`<button class="btn ${state.control===id?'btn-primary':''}" data-action="control" data-control="${id}" aria-pressed="${state.control===id}">${safe(ctl.title)}</button>`).join('')}</div>
 <div class="panel mb-4"><div class="eyebrow">Выбрана система</div><h2 class="mt-2 mb-0">${safe(c.title)}</h2><p class="muted small mt-2 mb-0">${safe(c.intro)}</p><p class="small muted mt-3 mb-0">Важно: один и тот же номер G может означать разные функции на Siemens, FANUC и Haas. Поддержка определяется серией, версиями ПО, опциями и настройками изготовителя станка.</p></div>
 <label class="search-box mb-3">${ic('search')}<input id="code-search" type="search" placeholder="G291, SUPA, CYCLE832, G05.1, G187…" value="${safe(state.codesQuery)}" autocomplete="off" aria-label="Поиск расширенной команды"></label>
 <div class="filters advanced-code-filters" aria-label="Разделы расширенных команд">${groups.map(g=>`<button class="chip ${state.codesGroup===g?'active':''}" data-action="code-group" data-group="${safe(g)}" aria-pressed="${state.codesGroup===g}">${safe(g)}</button>`).join('')}</div>
 <div id="code-results" aria-live="polite">${codesRows()}</div>
 <section class="mt-5"><div class="section-heading"><h2>Теория рядом с командами</h2></div><div class="related-links"><a href="#/article/gcode-state">Модальные состояния</a><a href="#/article/path-tolerance">Точный останов и LookAhead</a><a href="#/article/fourth-axis-index">Индексная 4-я ось</a><a href="#/article/tool-offsets">Коррекции инструмента</a><a href="#/article/cam-review">Проверка после постпроцессора</a></div></section>`;}
function siwordFilter(){
 const words=normalizeSearch(state.siwordQuery).split(' ').filter(Boolean);
 return (DB.siWords||[]).filter(w=>
  (state.siwordGroup==='Все группы'||w.group===state.siwordGroup)&&
  (state.siwordDoc==='all'||w.doc===state.siwordDoc)&&
  words.every(term=>normalizeSearch([w.word,w.group,w.summary,w.detail,w.practical,w.caution,w.syntax].join(' ')).includes(term)));
}
function siwordResults(){
 const a=siwordFilter(),shown=a.slice(0,state.siwordLimit);
 const d=DB.siWordDocs||{};
 return `<div class="section-heading"><h3>Записи словаря</h3><span class="count">${a.length} из ${DB.siWords.length}</span></div>
 ${shown.length?`<div class="advanced-code-grid">${shown.map((w,index)=>{
 const doc=d[w.doc]||{};
 return `<article class="advanced-code-card">
 <div class="advanced-code-heading"><div class="advanced-code-sign">${safe(w.word)}</div><span class="advanced-code-type">${safe(w.group)}</span></div>
 <h3>${safe(w.summary)}</h3>
 <p class="advanced-code-purpose">${safe(w.detail)}</p>
 <div class="advanced-code-details"><strong>Для чего полезно</strong><p>${safe(w.practical)}</p></div>
 <div class="advanced-code-warning"><strong>Что важно знать</strong><p>${safe(w.caution)}</p></div>
 ${w.syntax?`<div class="advanced-code-example"><strong>Учебный фрагмент синтаксиса, не полноценная программа</strong><pre>${safe(w.syntax)}</pre></div>`:''}
 <div class="advanced-code-source"><strong>${safe(doc.title||'Руководство Siemens')}</strong> · ${safe(doc.edition||'')} · ${safe(w.page)}
 ${w.doc==='advanced2006'?'<div class="siword-option-note">Исторический справочник 840D/810D. Поддержка на 828D не подтверждена.</div>':''}</div>
 </article>`;
 }).join('')}</div>
 ${a.length>shown.length?`<div class="mt-4" style="text-align:center"><button type="button" class="btn btn-primary" data-action="siword-more">Показать ещё (${a.length-shown.length})</button></div>`:''}`:empty('Совпадений нет','Попробуй название команды, например SUPA, ROT, POSA, или другую группу.')}`;
}
function siemensWordsPage(){
 const d=DB.siWordDocs||{},arr=DB.siWords||[],groups=['Все группы',...new Set(arr.map(x=>x.group))].sort((a,b)=>a==='Все группы'?-1:b==='Все группы'?1:a.localeCompare(b,'ru'));
 return `${header('Словарь языка SINUMERIK','SUPA, ROT, STOPRE, POSA, системные переменные и другие слова языка управления — с примерами, ограничениями и страницами руководств.','SIEMENS · ПРОДВИНУТОЕ ПРОГРАММИРОВАНИЕ')}
 <div class="panel mb-4"><div class="eyebrow">Не только G-коды</div><p class="mb-2">В SINUMERIK есть <strong>операторы, адресные слова, системные переменные и функции</strong>. Например, ROT изменяет программную систему координат, а SUPA подавляет ряд смещений в одном кадре.</p><p class="small muted mb-0">Словарь разделён по источникам. Базовое руководство охватывает 828D/840D sl, а расширенное руководство 2006 года описывает 840D/810D: наличие его функций на конкретной 828D проверяется отдельно. Текст пересказан своими словами.</p></div>
 <div class="mt-3 mb-4"><a class="btn btn-quiet btn-sm" href="#/codes">${ic('back')} К расширенным G-кодам</a></div>
 <label class="search-box mb-3">${ic('search')}<input id="siword-search" type="search" value="${safe(state.siwordQuery)}" placeholder="SUPA, ROT, TOFF, TRAORI, IF, параметры..." autocomplete="off" aria-label="Поиск слова SINUMERIK"></label>
 <div class="siword-filters">
  <label><span>Назначение</span><select id="siword-group" aria-label="Группа команд">${groups.map(g=>`<option value="${safe(g)}" ${state.siwordGroup===g?'selected':''}>${safe(g)}</option>`).join('')}</select></label>
  <label><span>Источник / применимость</span><select id="siword-doc" aria-label="Руководство и модель"><option value="all" ${state.siwordDoc==='all'?'selected':''}>Все источники</option><option value="basic2011" ${state.siwordDoc==='basic2011'?'selected':''}>828D / 840D sl · 2011</option><option value="advanced2006" ${state.siwordDoc==='advanced2006'?'selected':''}>840D / 810D · 2006 (проверять)</option></select></label>
 </div>
 <div id="siword-results" aria-live="polite">${siwordResults()}</div>
 <section class="mt-5"><div class="section-heading"><h2>Документация</h2></div><ul class="source-list">${Object.values(d).map(x=>`<li><strong>${safe(x.title)} · ${safe(x.edition)}</strong><p class="small muted">${safe(x.note)}</p></li>`).join('')}</ul></section>
 `;}
function fanwordFilter(){
 const words=normalizeSearch(state.fanwordQuery).split(' ').filter(Boolean);
 return (DB.fanucWords||[]).filter(w=>
 (state.fanwordGroup==='Все группы'||w.group===state.fanwordGroup)
 &&words.every(t=>normalizeSearch([w.word,w.group,w.summary,w.detail,w.practical,w.caution,w.syntax].join(' ')).includes(t)));
}
function fanwordResults(){
 const list=fanwordFilter(),shown=list.slice(0,state.fanwordLimit),doc=DB.fanucWordDocs?.fanuc0imate||{};
 return `<div class="section-heading"><h3>Команды и переменные</h3><span class="count">${list.length} из ${DB.fanucWords.length}</span></div>
 ${shown.length?`<div class="advanced-code-grid">${shown.map(w=>`<article class="advanced-code-card">
 <div class="advanced-code-heading"><div class="advanced-code-sign">${safe(w.word)}</div><span class="advanced-code-type">${safe(w.group)}</span></div>
 <h3>${safe(w.summary)}</h3><p class="advanced-code-purpose">${safe(w.detail)}</p>
 <div class="advanced-code-details"><strong>Когда полезно</strong><p>${safe(w.practical)}</p></div>
 <div class="advanced-code-warning"><strong>Ограничения и риски</strong><p>${safe(w.caution)}</p></div>
 ${w.syntax?`<div class="advanced-code-example"><strong>Учебный фрагмент, не программа для запуска</strong><pre>${safe(w.syntax)}</pre></div>`:''}
 <div class="advanced-code-source"><strong>${safe(doc.edition||'FANUC')}</strong> · ${safe(w.section)} · ${safe(doc.file||'загруженное руководство')}</div>
 </article>`).join('')}</div>
 ${list.length>shown.length?`<div class="mt-4" style="text-align:center"><button type="button" class="btn btn-primary" data-action="fanword-more">Показать ещё (${list.length-shown.length})</button></div>`:''}
 `:empty('Ничего не найдено','Попробуй другую переменную или команду: #3000, G65, G54.1, Skip.')}`;}
function fanucWordsPage(){
 const arr=DB.fanucWords||[],groups=['Все группы',...new Set(arr.map(x=>x.group))];
 const d=DB.fanucWordDocs?.fanuc0imate||{};
 return `${header('Словарь FANUC Macro B','Макропрограммирование, системные переменные #, редкие G-коды и измерительные функции для фрезерных ЧПУ.','FANUC 0i Mate-MC · ПРОДВИНУТЫЙ УРОВЕНЬ')}
 <div class="panel mb-4"><div class="eyebrow">Практическая документация</div>
 <p class="mb-2">Здесь не повторяются основы G0/G1. Разобраны <strong>локальные и общие переменные, системные данные, макросы, измерительные функции, преобразования и опасные управляющие команды</strong>.</p>
 <p class="small muted mb-0"><strong>Источник:</strong> ${safe(d.title||'FANUC')} · ${safe(d.edition||'')}. Функции Custom Macro B, измерения, расширенные нули и часть специальных кодов могут требовать опций. Значения сигналов PMC назначаются производителем станка. Перед применением проверь серию, комплектацию и процедуру безопасности.</p></div>
 <div class="mt-3 mb-4 reference-buttons"><a class="btn btn-quiet btn-sm" href="#/codes">${ic('back')} К расширенным G-кодам</a><a class="btn btn-quiet btn-sm" href="#/siemens-words">Сравнить с SINUMERIK</a></div>
 <label class="search-box mb-3">${ic('search')}<input id="fanword-search" type="search" value="${safe(state.fanwordQuery)}" placeholder="#3000, #5221, G65, IF, G54.1…" autocomplete="off" aria-label="Поиск команд FANUC"></label>
 <div class="siword-filters"><label><span>Группа</span><select id="fanword-group" aria-label="Группа команд FANUC">${groups.map(g=>`<option value="${safe(g)}" ${state.fanwordGroup===g?'selected':''}>${safe(g)}</option>`).join('')}</select></label>
 <label><span>Руководство</span><select aria-label="Источники" disabled><option>${safe(d.edition||'FANUC 0i Mate-MC')}</option></select></label></div>
 <div id="fanword-results" aria-live="polite">${fanwordResults()}</div>
 <section class="mt-5"><div class="section-heading"><h2>Что следует помнить</h2></div>
 <div class="panel"><p class="mb-2">Все описания — учебная интерпретация загруженного руководства. Они не подтверждают наличие конкретной опции на станке. Особенно осторожно обращайся с записью в #1100…, #2001…, #3003/#3004 и #5201… — такие действия способны менять состояние машины и коррекции.</p><p class="small muted mb-0">Диапазоны системных переменных и их значение могут различаться у FANUC 0i-F, 0i-MF и других серий. Не переносить команды между стойками без первоисточника.</p></div></section>`;}
function sourceItem(s){return `<li>${s.url?`<a href="${safe(s.url)}" target="_blank" rel="noopener noreferrer">${safe(s.name)} ${ic('external','xs')}</a>`:`<strong>${safe(s.name)}</strong>`}${s.details?`<p class="small muted">${safe(s.details)}</p>`:''}</li>`}
function sourcesPage(){return `${header('Источники и ограничения','Документы производителей, на которых основаны формулы и часть пояснений.','О ПРОЕКТЕ')}
 <div class="panel"><h2>Проверяемые материалы</h2><ul class="source-list">${Object.values(DB.sources).map(s=>sourceItem(s)).join('')}</ul><hr><h3>Границы применимости</h3><p class="small muted">Калькулятор производит арифметический расчёт, а не подбирает инструмент за тебя. Значения Vc, fz, fn, ap и ae следует назначать по материалу, маркировке и геометрии инструмента, жёсткости станка и рекомендациям производителя. Примеры чисел не являются готовыми производственными режимами.</p><p class="small muted">Таблица команд не заменяет руководство системы ЧПУ, инструкции производителя станка, утверждённый техпроцесс и требования охраны труда. Для размеров с допусками нужны актуальные стандарты и официальные таблицы; непроверенные численные поля допусков здесь не приводятся.</p><p class="small muted mb-0">Сайт не отправляет расчёты, сохранённые статьи или запросы поиска на сервер. Данные избранного хранятся локально в этом браузере.</p></div>`}

function academyMetrics(values){
 const fields=['D','n','z','fz','apA','aeA','apB','aeB'];
 const v={};for(const field of fields)v[field]=toNum(values[field]);
 if(fields.some(x=>!Number.isFinite(v[x])||v[x]<=0))return {error:'Заполни все поля положительными числами. Разрешена десятичная запятая.'};
 if(!Number.isInteger(v.z)||v.z>32||v.D>200||v.n>100000||v.fz>5||v.apA>500||v.apB>500||v.aeA>v.D||v.aeB>v.D)return {error:'Проверь диапазоны: z — целое до 32; ae не больше D; значения должны быть физически осмысленными.'};
 const vf=v.n*v.z*v.fz;
 function one(ap,ae){
  const r=ae/v.D,phi=Math.acos(Math.max(-1,Math.min(1,1-2*r)));
  const factor=r<0.5?2*Math.sqrt(r*(1-r)):1;
  return {ap,ae,r,phiDeg:phi*180/Math.PI,hmax:factor*v.fz,chipFactor:factor,zMean:v.z*phi/(2*Math.PI),q:ap*ae*vf/1000};
 }
 return {D:v.D,n:v.n,z:v.z,fz:v.fz,vf,A:one(v.apA,v.aeA),B:one(v.apB,v.aeB)};
}
function academyPlot(m){
 const originX=53,originY=188,width=460,height=134;
 const pts=[];for(let i=0;i<=100;i++){let r=i/100;let factor=r<0.5?2*Math.sqrt(r*(1-r)):1;pts.push((i===0?'M':'L')+(originX+r*width).toFixed(2)+' '+(originY-factor*height).toFixed(2))}
 const mark=(v,color,label)=>{let x=originX+v.r*width,y=originY-v.chipFactor*height;return '<line x1="'+x+'" y1="'+originY+'" x2="'+x+'" y2="'+y+'" stroke="'+color+'" stroke-width="2" stroke-dasharray="5 4"/><circle cx="'+x+'" cy="'+y+'" r="6" fill="'+color+'" stroke="white" stroke-width="2"/><text x="'+Math.max(30,Math.min(520,x))+'" y="'+Math.max(27,y-10)+'" text-anchor="middle" fill="'+color+'" font-size="12" font-weight="700">'+label+'</text>'};
 return '<svg class="acad-plot" viewBox="0 0 570 250" role="img" aria-label="Коэффициент максимальной толщины стружки в зависимости от радиального контакта ae/D">'
 +'<line x1="53" y1="188" x2="520" y2="188" stroke="#8095ad" stroke-width="1.5"/><line x1="53" y1="48" x2="53" y2="188" stroke="#8095ad" stroke-width="1.5"/>'
 +'<path d="'+pts.join(' ')+'" fill="none" stroke="#246ddb" stroke-width="3.5" stroke-linecap="round"/>'
 +'<line x1="283" y1="48" x2="283" y2="188" stroke="#cbd6e5" stroke-dasharray="5 6"/><text x="35" y="57" font-size="12" fill="#56708d">1,0</text><text x="35" y="189" font-size="12" fill="#56708d">0</text>'
 +'<text x="53" y="207" text-anchor="middle" font-size="12" fill="#56708d">0</text><text x="283" y="207" text-anchor="middle" font-size="12" fill="#56708d">50%</text><text x="513" y="207" text-anchor="middle" font-size="12" fill="#56708d">100%</text>'
 +'<text x="285" y="230" text-anchor="middle" font-size="13" fill="#345574">Радиальный контакт ae / D</text><text x="80" y="28" font-size="12" fill="#345574">hmax / fz</text>'
 +mark(m.A,'#1d6fe5','A')+mark(m.B,'#c07822','B')+'</svg>';
}
function academyCompareCard(symbol,v){
 return `<div class="acad-case acad-case-${symbol.toLowerCase()}"><div class="acad-case-top"><strong>Вариант ${symbol}</strong><span>ap = ${pretty(v.ap,2)} мм · ae = ${pretty(v.ae,2)} мм</span></div>
 <div class="acad-case-row"><span>Радиальный контакт</span><b>${pretty(v.r*100,1)} % D</b></div>
 <div class="acad-case-row"><span>Дуга контакта</span><b>${pretty(v.phiDeg,1)}°</b></div>
 <div class="acad-case-row"><span>Макс. толщина hmax</span><b>${pretty(v.hmax,4)} мм</b></div>
 <div class="acad-case-row"><span>Среднее число зубьев*</span><b>${pretty(v.zMean,2)}</b></div>
 <div class="acad-case-row"><span>Объёмный съём Q</span><b>${pretty(v.q,2)} см³/мин</b></div>
 </div>`;
}
function academyResults(){
 const m=academyMetrics(state.academyFields);
 if(m.error)return `<div class="callout alert" role="status">${ic('warning')}<div>${safe(m.error)}</div></div>`;
 return `<div class="acad-metrics-heading"><strong>Общая минутная подача:</strong> ${pretty(m.vf,1)} мм/мин <span>(n×z×fz)</span></div>
 <div class="acad-compare">${academyCompareCard('A',m.A)}${academyCompareCard('B',m.B)}</div>
 <div class="acad-chart"><h3>Как меняется hmax при изменении ae / D</h3>${academyPlot(m)}</div>
 <div class="acad-insight"><strong>Сравнение Q:</strong> при этих введённых значениях вариант ${m.A.q===m.B.q?'A имеет тот же съём, что и B':m.A.q>m.B.q?'A геометрически удаляет больше материала, чем B':'B геометрически удаляет больше материала, чем A'}.
 ${m.A.q===m.B.q?'':`Соотношение Qmax/Qmin ≈ ${pretty(Math.max(m.A.q,m.B.q)/Math.min(m.A.q,m.B.q),2)}.`}
 <p>Однако <strong>меньший Q не гарантирует устойчивость</strong>. Оцени вылет, распределение усилий вдоль ap, отвод стружки, реальное ae в углах и пределы инструмента.</p></div>
 <p class="small muted">*Среднее число зубьев — условная угловая оценка z×φ/360° для равномерного шага зубьев в плоском разрезе. Винтовые кромки и большая ap меняют реальное одновременное зацепление. Модель для прямой 90° кромки; она НЕ рассчитывает реальные силы, безопасность или допустимые режимы.</p>`;
}
function academyQuizBlock(){
 const questions=DB.academy.quiz;
 const answered=Object.keys(state.academyQuiz).length;
 const correct=questions.reduce((total,q,i)=>total+(state.academyQuiz[i]===q.correct?1:0),0);
 return `<div class="acad-quiz-progress">${answered} из ${questions.length} вопросов разобрано · верных решений: ${correct}</div>`
 +questions.map((q,i)=>{const selected=state.academyQuiz[i];return `<article class="acad-question"><div class="eyebrow">Задача ${i+1} из ${questions.length}</div><h3>${safe(q.question)}</h3>
 <div class="acad-options">${q.options.map((answer,j)=>`<button class="acad-option ${selected===j?'selected':''}" type="button" data-action="academy-answer" data-q="${i}" data-opt="${j}" aria-pressed="${selected===j}">${safe(answer)}</button>`).join('')}</div>
 ${selected!==undefined?`<div class="acad-feedback ${selected===q.correct?'correct':'incorrect'}"><strong>${selected===q.correct?'Верно.':'Не совсем.'}</strong> ${safe(q.feedback)}</div>`:''}</article>`}).join('');
}
function academyPage(){
 const course=DB.academy;const done=state.academyDone,finished=course.lessons.filter(x=>done.has(x.id)).length;
 const config=[['D','Диаметр D','мм'],['n','Обороты n','об/мин'],['z','Число зубьев z','шт'],['fz','Подача fz','мм/зуб'],['apA','A: глубина ap','мм'],['aeA','A: ширина ae','мм'],['apB','B: глубина ap','мм'],['aeB','B: ширина ae','мм']];
 return `${header('Академия фрезерования', 'Первый большой раздел: механика резания, реальные ограничения инструмента и самостоятельный выбор стратегии.', 'ГЛАВА 1 · 10 УРОКОВ')}
 <section class="acad-hero"><div class="eyebrow">ТВОЙ МАРШРУТ ОБУЧЕНИЯ</div><h2>От стружки к обоснованной технологии</h2><p>Не заучиваем G0 и названия кнопок. Разбираем физику фрезерования так, чтобы ты мог объяснить другому оператору, почему выбранный режим работает.</p>
 <div class="acad-progress-top"><span>Пройдено ${finished} из ${course.lessons.length} уроков</span><span>${Math.round(finished/course.lessons.length*100)}%</span></div><div class="acad-progress-track"><div style="width:${finished/course.lessons.length*100}%"></div></div></section>
 <section class="mt-5"><div class="section-heading"><div><h2>Уроки главы</h2><p class="small muted mb-0">В каждой статье — объяснение, формулы, ограничения и производственные проверки.</p></div></div>
 <div class="acad-lesson-list">${course.lessons.map(lesson=>{const a=byId(lesson.id);return `<article class="acad-lesson">
 <div class="acad-lesson-index">${safe(lesson.unit)}</div><div class="acad-lesson-body"><h3>${safe(a?.title||lesson.id)}</h3><p>${safe(lesson.objective)}</p><div class="acad-lesson-task">Практический вопрос: ${safe(lesson.task)}</div>
 <div class="acad-lesson-actions"><a class="btn btn-sm btn-primary" href="#/article/${safe(lesson.id)}">Читать урок ${ic('chevron','xs')}</a><button type="button" class="btn btn-sm ${done.has(lesson.id)?'btn-quiet':''}" data-action="academy-complete" data-id="${safe(lesson.id)}">${done.has(lesson.id)?'✓ Пройдено':'Отметить пройденным'}</button></div></div></article>`}).join('')}</div></section>
 <section class="mt-5" id="academy-lab"><div class="section-heading"><div><h2>Лаборатория: ap и ae</h2><p class="small muted mb-0">Изменяй значения и сравнивай два варианта на одной фрезе.</p></div></div>
 <div class="acad-lab-layout"><div class="panel"><h3>Исходные данные</h3><div class="acad-input-grid">${config.map(([id,label,unit])=>`<div class="acad-field"><label for="acad-${id}">${safe(label)} <small>${safe(unit)}</small></label><input type="text" inputmode="decimal" id="acad-${id}" data-acad-field="${id}" value="${safe(state.academyFields[id])}" autocomplete="off"></div>`).join('')}</div>
 <button type="button" class="btn btn-quiet btn-sm mt-3" data-action="academy-reset">Вернуть пример Ø10</button><p class="small muted mt-3 mb-0">Пример не является подобранным режимом резания. Проверка ограничений инструмента и станка здесь не выполняется.</p></div>
 <div class="acad-lab-results" id="academy-results" aria-live="polite">${academyResults()}</div></div></section>
 <section class="mt-5"><div class="section-heading"><div><h2>Проверка понимания</h2><p class="small muted mb-0">Вопросы на расчёт и принятие решения, а не на знание простых команд.</p></div></div><div id="academy-quiz">${academyQuizBlock()}</div></section>
 <section class="mt-5"><div class="section-heading"><h2>Первоисточники и границы модели</h2></div><div class="panel"><p>${safe(course.modelNotes)}</p><ul class="source-list"><li><a target="_blank" rel="noopener noreferrer" href="https://www.sandvik.coromant.com/en-gb/knowledge/machining-formulas-definitions/milling-formulas-definitions">Sandvik Coromant — формулы фрезерования</a></li><li><a target="_blank" rel="noopener noreferrer" href="https://www.sandvik.coromant.com/fi-fi/knowledge/milling/pages/entering-angle-and-chip-thickness.aspx">Sandvik Coromant — толщина стружки и угол в плане</a></li><li><a target="_blank" rel="noopener noreferrer" href="https://www.sandvik.coromant.com/en-gb/milling-appl-guide">Sandvik Coromant — руководство по фрезерованию</a></li></ul></div></section>`;
}
function missing(){return `${header('Раздел не найден','Такой страницы пока нет.')}<a class="btn btn-primary" href="#/home">На главную</a>`}
const cfg={
 milling:{label:'Фрезерование',fields:[['D','Диаметр фрезы D','мм'],['Vc','Скорость резания Vc','м/мин'],['z','Рабочих зубьев z','шт'],['fz','Подача на зуб fz','мм/зуб'],['ap','Глубина резания ap','мм'],['ae','Ширина резания ae','мм'],['L','Длина резания L','мм']]},
 drilling:{label:'Сверление',fields:[['D','Диаметр сверла D','мм'],['Vc','Скорость резания Vc','м/мин'],['fn','Подача на оборот fn','мм/об'],['L','Длина резания L','мм']]},
 reverse:{label:'Обратный расчёт',fields:[['D','Диаметр фрезы D','мм'],['n','Обороты шпинделя n','об/мин'],['z','Рабочих зубьев z','шт'],['Vf','Минутная подача Vf','мм/мин']]},
 time:{label:'Машинное время',fields:[['L','Длина одного рабочего хода L','мм'],['Vf','Рабочая подача Vf','мм/мин'],['passes','Число одинаковых ходов','шт']]},
 scallop:{label:'Гребешок 3D',fields:[['D','Диаметр сферической фрезы D','мм'],['step','Поперечный шаг s','мм']]},
 ramp:{label:'Наклонное врезание',fields:[['depth','Опускание по Z h','мм'],['angle','Угол рампы к плоскости','°']]},
 drillpoint:{label:'Конус сверла',fields:[['D','Диаметр сверла D','мм'],['angle','Угол при вершине','°']]},
 thermal:{label:'Тепловое расширение',fields:[['L','Длина детали L','мм'],['alpha','Коэффициент α ×10⁻⁶','1/К'],['delta','Перепад температуры ΔT','К']]}
};
const toNum = value => {
 const s=String(value??'').trim().replace(/\s/g,'').replace(',','.');
 if(!s || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))return NaN;
 return Number(s);
};
const pretty=(v,max=1)=>Number.isFinite(v)?new Intl.NumberFormat('ru-RU',{minimumFractionDigits:0,maximumFractionDigits:max}).format(v):'—';
function calculator(mode,values){const get=k=>toNum(values[k]);const keys=cfg[mode].fields.map(x=>x[0]);if(keys.some(k=>!Number.isFinite(get(k))||get(k)<=0))return {error:'Заполни все поля положительными числами (допускается десятичная запятая).'};
 if(['milling','reverse'].includes(mode)&&(!Number.isInteger(get('z'))||get('z')>100))return {error:'Число зубьев z должно быть целым положительным числом.'};
 if(mode==='time'&&(!Number.isInteger(get('passes'))||get('passes')>1000000))return {error:'Количество ходов должно быть целым положительным числом.'};
 const n=['milling','drilling','reverse'].includes(mode)?(mode==='reverse'?get('n'):1000*get('Vc')/(Math.PI*get('D'))):null;
 if(n!==null&&(!Number.isFinite(n)||n>1e12))return {error:'Проверь значения: результат выходит за разумные пределы.'};
 if(mode==='milling'){
  if(get('ae')>get('D'))return {error:'Ширина резания ae не должна превышать диаметр фрезы D для этого упрощённого расчёта.'};
  const vf=n*get('z')*get('fz'),q=get('ap')*get('ae')*vf/1000,t=get('L')/vf;
  return {items:[['Обороты шпинделя','n',n,'об/мин',0],['Минутная подача','Vf',vf,'мм/мин',1],['Объём съёма материала','Q',q,'см³/мин',2],['Время рабочего хода','t',t,'мин',3]],note:'Q рассчитан для прямолинейного прохода с постоянными ap и ae. Время не включает холостые перемещения, разгон и смену инструмента.'};
 }
 if(mode==='drilling'){
  const vf=n*get('fn');return{items:[['Обороты шпинделя','n',n,'об/мин',0],['Минутная подача','Vf',vf,'мм/мин',1],['Время прохода','t',get('L')/vf,'мин',3]],note:'Время без входных/выходных перемещений, пауз и циклов дробления стружки. L — реальная длина движения с подачей.'};
 }
 if(mode==='reverse')return{items:[['Фактическая скорость резания','Vc',Math.PI*get('D')*n/1000,'м/мин',2],['Подача на зуб','fz',get('Vf')/(n*get('z')),'мм/зуб',4]],note:'Это восстановление параметров по заданным оборотам и минутной подаче, не проверка пригодности режима.'};
 if(mode==='time')return{items:[['Время одного прохода','t',get('L')/get('Vf'),'мин',3],['Общее время рабочих ходов','T',get('passes')*get('L')/get('Vf'),'мин',3]],note:'Упрощённая оценка постоянной подачи; не учитывает смену инструментов, холостой ход и ускорения.'};
 if(mode==='scallop'){
   if(get('step')>=get('D'))return {error:'Шаг s должен быть меньше диаметра D.'};
   const R=get('D')/2, s=get('step'), h=R-Math.sqrt(R*R-s*s/4);
   return {items:[['Геометрическая высота гребешка','h',h,'мм',4],['Та же высота','h',h*1000,'мкм',1]],note:'Только сферическая фреза на условной плоской поверхности. h не равна шероховатости Ra; на 3D-поверхности, при наклоне и прогибе результат отличается.'};
 }
 if(mode==='ramp'){
   if(get('angle')>=90)return {error:'Угол наклона должен быть меньше 90°.'};
   const rad=get('angle')*Math.PI/180;
   return {items:[['Горизонтальная длина рампы','Lxy',get('depth')/Math.tan(rad),'мм',2],['Длина наклонного участка','L',get('depth')/Math.sin(rad),'мм',2]],note:'Треугольная геометрия линейного входа. Допустимый угол и траекторию назначают по инструменту, не по расчёту.'};
 }
 if(mode==='drillpoint'){
   if(get('angle')>=180)return {error:'Угол вершины должен быть меньше 180°.'};
   return {items:[['Высота конуса сверла','h',get('D')/(2*Math.tan(get('angle')*Math.PI/360)),'мм',3]],note:'Геометрическая оценка для идеальной конической вершины. Реальная заточка и допуски могут отличаться.'};
 }
 if(mode==='thermal'){
   return {items:[['Изменение длины по модулю','ΔL',get('L')*get('alpha')*1e-6*get('delta'),'мм',4]],note:'Линейное приближение для однородной детали. Введён положительный модуль перепада температуры; при остывании направление изменения обратное. Точное α зависит от марки материала.'};
 }
 return {error:'Неизвестный режим'};
}
function resultsHtml(result){if(result.error)return `<div class="calc-error">${safe(result.error)}</div>`;return `<div class="eyebrow">Результат расчёта</div>${result.items.map(([label,key,v,unit,d])=>`<div class="result-block"><div class="result-value">${pretty(v,d)} <span>${safe(unit)}</span></div><div class="result-label">${safe(label)} · ${key}</div></div>`).join('')}<div class="result-extra">${safe(result.note)}</div>`}
function calcPage(){const m=state.mode;let calc=calculator(m,state.calc[m]);return `${header('Калькулятор режимов','Режимы резания и дополнительные геометрические расчёты. Вводи параметры своего инструмента и детали.','ПРАКТИЧЕСКИЕ ИНСТРУМЕНТЫ')}
 <div class="calculator-layout calc-wrap"><div class="panel"><div class="calc-tabs" role="tablist" aria-label="Вид расчёта">${Object.entries(cfg).map(([id,c])=>`<button type="button" role="tab" aria-selected="${m===id}" class="${m===id?'active':''}" data-action="calc-mode" data-mode="${id}">${c.label}</button>`).join('')}</div>
 <div class="calc-form" role="group" aria-label="Исходные данные">${cfg[m].fields.map(([id,t,unit])=>`<div class="field"><label for="field-${id}">${safe(t)}</label><div class="field-input"><input type="text" inputmode="decimal" id="field-${id}" data-calc="${id}" value="${safe(state.calc[m][id])}" autocomplete="off" aria-label="${safe(t)}"><span class="unit">${safe(unit)}</span></div></div>`).join('')}</div>
 <div class="calc-note">Вводи десятичную точку или запятую. Результат пересчитывается автоматически.</div>
 <div class="mt-4"><button class="btn btn-sm btn-quiet" data-action="calc-example">${ic('target')} Вернуть пример</button></div>
 </div><div class="result-panel" id="calc-results" aria-live="polite">${resultsHtml(calc)}</div></div>
 <div class="mt-4">${callout('<strong>Формулы:</strong> n = 1000 · Vc / (π · D); Vf = n · z · fz; Q = ap · ae · Vf / 1000; h(гребешок) = R − √(R² − s²/4); Lxy(рампа) = глубина / tan(угол); ΔL ≈ α · L · ΔT. Для геометрических расчётов действуют ограничения, указанные рядом с результатом.')}</div>
 <div class="mt-4">${callout('<strong>Ограничение:</strong> это калькулятор, а не подбор рекомендованных режимов. Проверь максимальные обороты шпинделя и инструмента, подачу станка, материал и жёсткость.',true)}</div>
 <section class="mt-5"><div class="section-heading"><h2>Разобраться в расчётах</h2></div><div class="related-links"><a href="#/article/cutting">Обороты и минутная подача</a><a href="#/article/drilling">Сверление</a><a href="#/article/chip">Толщина стружки</a><a href="#/article/scallop-formula">Гребешок на 3D-поверхности</a><a href="#/article/measurement-temperature">Температура и размер</a><a href="${safe(DB.sources.sandvik.url)}" rel="noopener noreferrer" target="_blank">Источник формул ${ic('external','xs')}</a></div></section>`}
function render(keepScroll=false){let current=route(),body;
 if(current==='home')body=home();else if(current==='guide')body=guidePage();else if(current==='academy')body=academyPage();else if(current==='calc')body=calcPage();else if(current==='library')body=library();else if(current==='codes')body=codesPage();else if(current==='siemens-words')body=siemensWordsPage();else if(current==='fanuc-words')body=fanucWordsPage();else if(current==='saved')body=savedPage();else if(current==='sources')body=sourcesPage();else if(current.startsWith('category/'))body=categoryPage(current.split('/')[1]);else if(current.startsWith('article/'))body=articlePage(current.split('/')[1]);else body=missing();
 let y=window.scrollY;qs('#app').innerHTML=shell(current,body);if(keepScroll)window.scrollTo({top:y,behavior:'instant'});
}
const defaultCalc=JSON.parse(JSON.stringify(state.calc));
let toastTimeout;
function toast(msg){let t=qs('#cnc-toast');if(!t){t=document.createElement('div');t.id='cnc-toast';t.style.cssText='position:fixed;z-index:50;bottom:82px;left:50%;transform:translateX(-50%);background:#102844;color:#fff;border-radius:10px;padding:12px 18px;font-size:13px;box-shadow:0 10px 25px #10284440;max-width:90%;text-align:center';document.body.appendChild(t)}t.textContent=msg;t.hidden=false;clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>{t.hidden=true},2200)}
document.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(!el)return;let ac=el.dataset.action;
 if(ac==='print-article'){state.expanded.add(el.dataset.id);render(true);window.print()}
 if(ac==='bookmark'){let id=el.dataset.id;if(!byId(id))return;state.saved.has(id)?state.saved.delete(id):state.saved.add(id);try{localStorage.setItem('cnc-handbook-saved',JSON.stringify([...state.saved]))}catch(_){}render(true);toast(state.saved.has(id)?'Сохранено в избранном':'Убрано из избранного')}
 if(ac==='category-filter'){state.category=el.dataset.cat;render(true)}
 if(ac==='expand'){let id=el.dataset.id;state.expanded.has(id)?state.expanded.delete(id):state.expanded.add(id);render(true)}
 if(ac==='control'){state.control=el.dataset.control;state.codesQuery='';state.codesGroup='Все';render(true)}
 if(ac==='academy-reset'){state.academyFields={D:'10',n:'4800',z:'4',fz:'0,05',apA:'20',aeA:'1',apB:'5',aeB:'10'};render(true)}
 if(ac==='academy-answer'){const i=Number(el.dataset.q),j=Number(el.dataset.opt);if(DB.academy.quiz[i]?.options[j]===undefined)return;state.academyQuiz[i]=j;const node=qs('#academy-quiz');if(node)node.innerHTML=academyQuizBlock()}
 if(ac==='academy-complete'){const id=el.dataset.id;if(!DB.academy.lessons.some(x=>x.id===id))return;state.academyDone.has(id)?state.academyDone.delete(id):state.academyDone.add(id);try{localStorage.setItem('cnc-academy-done',JSON.stringify([...state.academyDone]))}catch(_){}render(true)}
 if(ac==='fanword-more'){state.fanwordLimit+=24;const node=qs('#fanword-results');if(node)node.innerHTML=fanwordResults()}
 if(ac==='siword-more'){state.siwordLimit+=24;const node=qs('#siword-results');if(node)node.innerHTML=siwordResults()}
 if(ac==='code-group'){state.codesGroup=el.dataset.group;let node=qs('#code-results');const group=qs('.advanced-code-filters');if(group)group.querySelectorAll('button').forEach(btn=>{btn.classList.toggle('active',btn.dataset.group===state.codesGroup);btn.setAttribute('aria-pressed',String(btn.dataset.group===state.codesGroup))});if(node)node.innerHTML=codesRows()}
 if(ac==='calc-mode'){state.mode=el.dataset.mode;render(true)}
 if(ac==='calc-example'){state.calc[state.mode]={...defaultCalc[state.mode]};render(true);toast('Пример восстановлен')}
});
document.addEventListener('change',e=>{if(e.target.id==='fanword-group'){state.fanwordGroup=e.target.value;state.fanwordLimit=24;const node=qs('#fanword-results');if(node)node.innerHTML=fanwordResults()}else if(e.target.id==='siword-group'){state.siwordGroup=e.target.value;state.siwordLimit=24;const node=qs('#siword-results');if(node)node.innerHTML=siwordResults()}else if(e.target.id==='siword-doc'){state.siwordDoc=e.target.value;state.siwordLimit=24;const node=qs('#siword-results');if(node)node.innerHTML=siwordResults()}});
document.addEventListener('input',e=>{
 if(e.target.dataset.acadField){state.academyFields[e.target.dataset.acadField]=e.target.value;const node=qs('#academy-results');if(node)node.innerHTML=academyResults()}
 else if(e.target.id==='fanword-search'){state.fanwordQuery=e.target.value;state.fanwordLimit=24;const node=qs('#fanword-results');if(node)node.innerHTML=fanwordResults()}
 else if(e.target.id==='siword-search'){state.siwordQuery=e.target.value;state.siwordLimit=24;const node=qs('#siword-results');if(node)node.innerHTML=siwordResults()}
 else if(e.target.id==='library-search'){state.query=e.target.value;let node=qs('#library-results');if(node)node.innerHTML=libraryResults()}
 else if(e.target.id==='code-search'){state.codesQuery=e.target.value;let node=qs('#code-results');if(node)node.innerHTML=codesRows()}
 else if(e.target.dataset.calc){state.calc[state.mode][e.target.dataset.calc]=e.target.value;let node=qs('#calc-results');if(node)node.innerHTML=resultsHtml(calculator(state.mode,state.calc[state.mode]))}
});
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0)});
render();
if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
 window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
window.CNC_TEST={calculator,toNum,pretty,DB,normalizeSearch,filteredArticles,academyMetrics};
})();


