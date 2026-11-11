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
const state = {saved, category:'all', query:'', codesQuery:'', control:'siemens', mode:'milling', expanded:new Set(), calc:{
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
 ['home','Главная','home'],['calc','Калькулятор','calc'],['library','Справочник','book'],['category/problems','Проблемы','wrench'],['category/technology','Технология','layers'],['guide','Навигатор технолога','book'],['codes','Стойки ЧПУ','monitor'],['category/theory','База знаний','graduation']
];
function route(){try{let r=decodeURIComponent((location.hash||'#/home').replace(/^#\/?/,'').split('?')[0]);return r||'home'}catch(_){return 'missing'}}
function activeNav(key,r){return key==='library' ? (r==='library'||r.startsWith('article/')||r.startsWith('category/') ) : key===r}
function pageName(r){if(r==='home')return'Главная';if(r==='calc')return'Калькулятор режимов';if(r==='library')return'Библиотека';if(r==='guide')return'Навигатор технолога';if(r==='codes')return'Стойки ЧПУ';if(r==='saved')return'Избранное';if(r==='sources')return'Источники';if(r.startsWith('category/'))return byCat(r.split('/')[1])?.title||'Раздел';if(r.startsWith('article/'))return byId(r.split('/')[1])?.title||'Статья';return'Справочник'}
function sidebar(r){return `<aside class="sidebar">
 <a class="brand" href="#/home"><div class="brand-emblem">CNC</div><div><span class="brand-title">Handbook</span><span class="brand-sub">Фрезерная обработка</span></div></a>
 <div class="side-label">Навигация</div>
 ${NAV.map(([id,t,i])=>`<a class="side-link ${activeNav(id,r)?'active':''}" href="${link(id)}">${ic(i)}${safe(t)}</a>`).join('')}
 <div class="side-label">Личное</div>
 <a class="side-link ${r==='saved'?'active':''}" href="#/saved">${ic('bookmark')}Избранное <span class="small" style="margin-left:auto;opacity:.6">${state.saved.size}</span></a>
 <div class="side-bottom"><strong>Справочник · v0.3</strong><p>Без регистрации, рекламы и ИИ. Основные материалы доступны офлайн после первого открытия по HTTPS.</p></div>
 </aside>`}
function topbar(r){return `<div class="topbar"><a class="mobile-brand" href="#/home" aria-label="Главная CNC Handbook"><span class="brand-emblem">CNC</span> Handbook</a><div><div class="topbar-title">${safe(pageName(r))}</div><div class="topbar-sub">Техническая база фрезеровщика</div></div><div class="top-actions"><a class="icon-btn" href="#/library" aria-label="Поиск по справочнику" title="Поиск">${ic('search')}</a><a class="icon-btn" href="#/saved" aria-label="Избранное" title="Избранное">${ic('bookmark')}</a></div></div>`}
function bottomNav(r){let mobile=[['home','Главная','home'],['calc','Расчёты','calc'],['library','Поиск','search'],['codes','Стойки','monitor'],['saved','Избранное','bookmark']];return `<nav class="nav-bottom" aria-label="Основная навигация">${mobile.map(([id,t,i])=>`<a class="${id==='library'?(r==='library'||r.startsWith('article/')||r.startsWith('category/')?'active':''):(id===r?'active':'')}" href="${link(id)}" aria-label="${safe(t)}">${ic(i)}<span>${t}</span></a>`).join('')}</nav>`}
function footer(){return `<footer class="footer"><span>CNC Handbook · версия 0.5.2 · 2026</span><a href="#/sources">Источники и ограничения</a></footer>`}
function shell(r,body){return `<div class="app-shell">${sidebar(r)}<div class="page-wrap">${topbar(r)}<main class="main" id="main-content">${body}${footer()}</main></div>${bottomNav(r)}</div>`}
function crumb(links){return `<div class="breadcrumb">${links.map(([t,r],i)=>`${i?ic('chevron'):''}${r?`<a href="${link(r)}">${safe(t)}</a>`:`<span>${safe(t)}</span>`}`).join('')}</div>`}
function header(title,desc,sub=''){return `<div class="page-intro">${sub?`<div class="eyebrow mb-3">${safe(sub)}</div>`:''}<h1>${safe(title)}</h1><p>${safe(desc)}</p></div>`}
function feature(id,title,desc,iconName){return `<a class="feature-card" href="${link(id)}"><div class="feature-icon">${ic(iconName,'lg')}</div><div class="feature-title">${safe(title)}</div><p>${safe(desc)}</p><span class="arrow">${ic('arrow')}</span></a>`}
function articleCard(a){let cat=byCat(a.cat);return `<article class="article-card"><div class="article-card-head"><div><div class="eyebrow">${safe(cat?.title||'Статья')} · ${a.time} мин</div><h3 class="mt-2">${safe(a.title)}</h3></div><button class="bookmark-btn ${state.saved.has(a.id)?'saved':''}" data-action="bookmark" data-id="${a.id}" title="${state.saved.has(a.id)?'Убрать из избранного':'В избранное'}" aria-label="${state.saved.has(a.id)?'Убрать из избранного':'В избранное'}">${ic('bookmark')}</button></div><p>${safe(a.quick)}</p><div class="article-meta"><span class="tag">${safe(a.subtitle)}</span><a href="${link('article/'+a.id)}" class="btn btn-sm btn-quiet">Открыть ${ic('chevron')}</a></div></article>`}
function articleGrid(arr){return arr.length?`<div class="article-grid">${arr.map(articleCard).join('')}</div>`:empty('Ничего не найдено','Попробуй другой запрос или категорию.')}
function empty(title,desc){return `<div class="empty">${ic('search')}<h3>${safe(title)}</h3><p>${safe(desc)}</p></div>`}
function callout(text,warn=false){return `<div class="callout ${warn?'alert':''}">${ic(warn?'warning':'info')}<div>${text}</div></div>`}
function heroMark(){return `<svg viewBox="0 0 260 240" aria-hidden="true"><defs><linearGradient id="steel" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#7bafed" stop-opacity=".7"/><stop offset="1" stop-color="#236fbc" stop-opacity=".2"/></linearGradient></defs><path d="M35 155 122 203l103-50-93-47z" fill="none" stroke="#79b8fa" stroke-width="2"/><path d="M35 155V96l90-48 100 45v60" fill="none" stroke="#4383c0" stroke-width="1.8"/><path d="M125 48v57M225 93l-100 56-90-53" stroke="#5ba2e6" fill="none" stroke-width="1.6"/><path d="m70 125 53-28 61 30-53 27z" fill="url(#steel)" stroke="#7ebcf2"/><path d="m70 125v22l61 30v-23m53-27v20l-53 30" fill="none" stroke="#7ebcf2"/><path d="M105 67v52m-8-51h16M97 58h16l5 9H92z" stroke="#b8d8f9" stroke-width="2" fill="#2a6baf"/><path d="m105 119 4 4-4 4-4-4z" fill="#5ecbd3"/><path d="M105 26v20m-4-5 4 5 4-5M105 120h-25" stroke="#77c8ff" stroke-dasharray="4 5"/><path d="M35 155 10 170M35 155v-28" stroke="#72b8ec" stroke-width="1.4"/><path d="m10 170 9-1-4-7" stroke="#72b8ec" fill="none"/><path d="M225 153h18" stroke="#72b8ec" stroke-width="1.5"/><circle cx="125" cy="149" r="3" fill="#8dddfa"/></svg>`}
function home(){let priority=['drawing-tech','rough-finish-sequence','corner-overload','cam-risk-review'];return `<section class="hero"><div class="hero-copy"><div class="eyebrow">Справочник фрезерной обработки / v0.5.2</div><h1>Всё важное —<br>под рукой у станка.</h1><p>Режимы, технология, типовые проблемы и команды стоек. Коротко для работы, подробно для понимания.</p><div class="hero-actions"><a class="btn btn-hero" href="#/calc">${ic('calc')} Рассчитать режимы</a><a class="btn btn-dark-outline" href="#/guide">${ic('layers')} Навигатор технолога</a><a class="btn btn-dark-outline" href="#/library">${ic('search')} Найти тему</a></div></div><div class="hero-mark">${heroMark()}</div></section>
 <div class="mt-3 stats"><span>${DB.articles.length} проверяемых тем</span><span class="dot"></span><span>3 группы стоек</span><span class="dot"></span><span>Без ИИ</span></div>
 <section class="mt-5"><div class="section-heading"><div><h2>Рабочие разделы</h2><p class="small muted mb-0">Нужная информация — в два касания</p></div></div><div class="feature-grid">
 ${feature('calc','Калькуляторы','Обороты, подача, съём, время','calc')}
 ${feature('library','Справочник','Таблицы, понятия, инструмент','book')}
 ${feature('category/problems','Типовые проблемы','Вибрации, сколы, размер','wrench')}
 ${feature('category/technology','Технология','Базы, установы, стратегии','layers')}
 ${feature('codes','Стойки ЧПУ','Haas, Fanuc, Siemens 828D','monitor')}
 ${feature('category/theory','База знаний','Причины и физика процессов','graduation')}
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
function articlePage(id){let a=byId(id);if(!a)return missing();let cat=byCat(a.cat),expanded=state.expanded.has(id);return `${crumb([['Библиотека','library'],[cat.title,'category/'+a.cat],[a.title,null]])}
 <div class="article-hero"><div class="article-card-head"><div><div class="eyebrow">${safe(cat.title)} · ${a.time} мин чтения</div><h1>${safe(a.title)}</h1><div class="subtitle">${safe(a.subtitle)}</div></div><button class="bookmark-btn ${state.saved.has(id)?'saved':''}" data-action="bookmark" data-id="${id}" aria-label="Избранное" title="В избранное">${ic('bookmark','lg')}</button></div>
 <div class="quick-panel"><div class="eyebrow">Коротко / ответ за 30 секунд</div><p>${safe(a.quick)}</p></div>
 <h3>Что проверить в первую очередь</h3><ol class="actions-list">${a.actions.map(s=>`<li>${safe(s)}</li>`).join('')}</ol>
 <div class="mt-4"><button class="btn btn-sm" data-action="print-article" data-id="${safe(id)}">Печать полной статьи</button></div><div class="mt-4"><button class="full-button" data-action="expand" data-id="${id}" aria-expanded="${expanded}">${ic(expanded?'up':'down')} ${expanded?'Свернуть подробную справку':'Читать подробно: причины, примеры, нюансы'}</button></div></div>
 ${expanded?`<div class="article-content"><div class="article-content-inner"><div class="eyebrow mb-3">Подробная справка</div>${a.sections.map(s=>`<section><h3>${safe(s.h)}</h3>${s.diagram?s.diagram:''}${s.p?`<p>${safe(s.p)}</p>`:''}${s.bullets?`<ul>${s.bullets.map(b=>`<li>${safe(b)}</li>`).join('')}</ul>`:''}</section>`).join('')}</div></div>`:''}
 <section class="mt-5"><div class="section-heading"><h2>Связанные темы</h2></div><div class="related-links">${a.linked.map(id=>byId(id)).filter(Boolean).map(x=>`<a href="${link('article/'+x.id)}">${safe(x.title)} ${ic('chevron','xs')}</a>`).join('')}<a href="#/calc">${ic('calc','xs')} Калькуляторы</a></div></section>
 ${a.sources.length?`<section class="mt-5"><div class="section-heading"><h2>Источники</h2></div><ul class="source-list">${a.sources.map(s=>DB.sources[s]).filter(Boolean).map(s=>sourceItem(s)).join('')}</ul></section>`:''}
 <div class="mt-4">${callout('<strong>Важно:</strong> справочник объясняет принципы и типовые проверки. Настройки станка, инструмент и режимы всегда сверяй с документацией производителя и техпроцессом.',true)}</div>`}
function savedPage(){let arr=DB.articles.filter(a=>state.saved.has(a.id));return `${header('Избранное','Твои сохранённые справочные статьи. Список хранится только в браузере на этом устройстве.','ЛИЧНОЕ')}${arr.length?articleGrid(arr):empty('Пока ничего нет','Нажимай значок закладки на статьях — они появятся здесь.')}`}
function codesRows(){let c=DB.codes[state.control];let q=state.codesQuery.trim().toLocaleLowerCase('ru');let rows=c.entries.filter(x=>!q||x.join(' ').toLocaleLowerCase('ru').includes(q));return `${rows.length?`<div class="code-grid">${rows.map(([code,name,note])=>`<div class="code-card"><div class="code-title">${safe(code)}</div><strong>${safe(name)}</strong><p>${safe(note)}</p></div>`).join('')}</div>`:empty('Команда не найдена','Попробуй другой код или выбери другую систему.')}`}
function codesPage(){let c=DB.codes[state.control];return `${header('Команды стоек ЧПУ','Быстрая памятка по распространённым командам. Для реального запуска всегда проверяй руководство станка и режим программирования.','SIEMENS · FANUC · HAAS')}
 <div class="controller-tabs">${Object.entries(DB.codes).map(([id,ctl])=>`<button class="btn ${state.control===id?'btn-primary':''}" data-action="control" data-control="${id}" aria-pressed="${state.control===id}">${safe(ctl.title)}</button>`).join('')}</div>
 <div class="panel mb-4"><div class="eyebrow">Выбрана система</div><h2 class="mt-2 mb-0">${safe(c.title)}</h2><p class="muted small mt-2 mb-0">${safe(c.intro)}</p>${c.source?`<div class="mt-3 small"><a href="${safe(DB.sources[c.source].url)}" target="_blank" rel="noopener noreferrer">Официальная документация ${ic('external','xs')}</a></div>`:''}</div>
 <label class="search-box mb-4">${ic('search')}<input id="code-search" type="search" placeholder="Найти G54, G43, M06..." value="${safe(state.codesQuery)}" autocomplete="off" aria-label="Поиск команды"></label>
 <div id="code-results">${codesRows()}</div>
 <div class="mt-4">${callout('<strong>Команды не взаимозаменяемы.</strong> Например, у Siemens 828D вызов инструмента и коррекции отличается от Haas/Fanuc-подобных команд G43 H… . Учитывай DIN/ISO, опции и настройки станкостроителя.',true)}</div>
 <section class="mt-5"><div class="section-heading"><h2>Подробнее по теме</h2></div><div class="related-links"><a href="#/article/work-offset">G54 и ноль детали</a><a href="#/article/tool-offsets">Корректоры инструмента</a><a href="#/article/run-check">Проверка перед запуском</a></div></section>`}
function sourceItem(s){return `<li>${s.url?`<a href="${safe(s.url)}" target="_blank" rel="noopener noreferrer">${safe(s.name)} ${ic('external','xs')}</a>`:`<strong>${safe(s.name)}</strong>`}${s.details?`<p class="small muted">${safe(s.details)}</p>`:''}</li>`}
function sourcesPage(){return `${header('Источники и ограничения','Документы производителей, на которых основаны формулы и часть пояснений.','О ПРОЕКТЕ')}
 <div class="panel"><h2>Проверяемые материалы</h2><ul class="source-list">${Object.values(DB.sources).map(s=>sourceItem(s)).join('')}</ul><hr><h3>Границы применимости</h3><p class="small muted">Калькулятор производит арифметический расчёт, а не подбирает инструмент за тебя. Значения Vc, fz, fn, ap и ae следует назначать по материалу, маркировке и геометрии инструмента, жёсткости станка и рекомендациям производителя. Примеры чисел не являются готовыми производственными режимами.</p><p class="small muted">Таблица команд не заменяет руководство системы ЧПУ, инструкции производителя станка, утверждённый техпроцесс и требования охраны труда. Для размеров с допусками нужны актуальные стандарты и официальные таблицы; непроверенные численные поля допусков здесь не приводятся.</p><p class="small muted mb-0">Сайт не отправляет расчёты, сохранённые статьи или запросы поиска на сервер. Данные избранного хранятся локально в этом браузере.</p></div>`}
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
 if(current==='home')body=home();else if(current==='guide')body=guidePage();else if(current==='calc')body=calcPage();else if(current==='library')body=library();else if(current==='codes')body=codesPage();else if(current==='saved')body=savedPage();else if(current==='sources')body=sourcesPage();else if(current.startsWith('category/'))body=categoryPage(current.split('/')[1]);else if(current.startsWith('article/'))body=articlePage(current.split('/')[1]);else body=missing();
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
 if(ac==='control'){state.control=el.dataset.control;state.codesQuery='';render(true)}
 if(ac==='calc-mode'){state.mode=el.dataset.mode;render(true)}
 if(ac==='calc-example'){state.calc[state.mode]={...defaultCalc[state.mode]};render(true);toast('Пример восстановлен')}
});
document.addEventListener('input',e=>{
 if(e.target.id==='library-search'){state.query=e.target.value;let node=qs('#library-results');if(node)node.innerHTML=libraryResults()}
 else if(e.target.id==='code-search'){state.codesQuery=e.target.value;let node=qs('#code-results');if(node)node.innerHTML=codesRows()}
 else if(e.target.dataset.calc){state.calc[state.mode][e.target.dataset.calc]=e.target.value;let node=qs('#calc-results');if(node)node.innerHTML=resultsHtml(calculator(state.mode,state.calc[state.mode]))}
});
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0)});
render();
if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
 window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
window.CNC_TEST={calculator,toNum,pretty,DB,normalizeSearch,filteredArticles};
})();


