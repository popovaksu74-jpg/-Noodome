/**
 * Noôdome · Приглашения. Общее хранилище команды и приём заявок.
 *
 * Скрипт создаётся ИЗ Google-таблицы (Расширения → Apps Script), поэтому он привязан к ней.
 * Что где хранится:
 *   таблица, вкладка «Заявки»       — заявки кандидатов (статус и комментарий можно править прямо в таблице);
 *   таблица, вкладка «Приглашения»  — список приглашений (сами приглашения лежат файлами на Диске, в ячейку не помещаются фото);
 *   таблица, вкладка «Журнал»       — кто и что менял;
 *   папка на Диске                  — приглашения и общие блоки клуба.
 * Вход для команды: общий пароль в свойствах скрипта (TEAM_TOKEN). Заявки и публичные страницы открыты всем.
 * Публикация: Развернуть → Новое развертывание → Веб-приложение → Запуск от имени: Я, Доступ: Все.
 */
var LEADS = 'Заявки';
var INDEX = 'Приглашения';
var JOURNAL = 'Журнал';
var LEAD_STATUS = ['Новая', 'Связались', 'Встреча', 'Вступил', 'Не подошло'];
var DOC_STATUS = { draft: 'Черновик', approved: 'Согласовано' };
var SHARED = ['about', 'community', 'events', 'steps', 'apply'];
var HEADERS = {
  'Заявки': ['Дата', 'Кандидат', 'Контакт', 'О себе', 'Коннектор', 'Код', 'Статус', 'Комментарий команды', 'Страница', 'Метки'],
  'Приглашения': ['Код', 'Имя', 'Кто он', 'Статус', 'Обновлено', 'Кто обновил', 'Ссылка', 'Файл', 'Версия'],
  'Журнал': ['Время', 'Кто', 'Что сделал', 'С чем']
};

/* ============================== Вход ============================== */

function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    if (p.action === 'page') return out_(pageData_(String(p.ref || '')));
    return out_({ ok: true, service: 'noodome-invites' });
  } catch (err) { return out_({ ok: false, error: msg_(err) }); }
}

function doPost(e) {
  var res;
  try {
    var d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    res = route_(d);
  } catch (err) { res = { ok: false, error: msg_(err) }; }
  return out_(res);
}

function route_(d) {
  if (d.action === 'lead') return submitLead_(d);
  var who = auth_(d);
  switch (d.action) {
    case 'ping': return { ok: true, who: who };
    case 'list': return list_();
    case 'get': return get_(d.slug);
    case 'save': return save_(d, who);
    case 'delete': return delete_(d, who);
    case 'club': return getClub_();
    case 'saveClub': return saveClub_(d, who);
    case 'leads': return { ok: true, leads: leadRows_() };
    case 'setLead': return setLead_(d, who);
    default: throw new Error('Неизвестное действие');
  }
}

function auth_(d) {
  var real = prop_('TEAM_TOKEN');
  if (!real) throw new Error('Не задан пароль команды: Настройки проекта → Свойства скрипта → TEAM_TOKEN.');
  var cache = CacheService.getScriptCache(), key = 'bad:' + Math.floor(Date.now() / 60000);
  var bad = Number(cache.get(key) || 0);
  if (bad > 20) throw new Error('Слишком много неверных паролей. Подождите минуту.');
  if (String(d.token || '') !== real) { cache.put(key, String(bad + 1), 120); throw new Error('auth'); }
  return clean_(d.who, 80) || 'без имени';
}

/* ============================== Приглашения ============================== */

function list_() {
  var leads = leadRows_();
  var invites = indexRows_().map(function (r) {
    var mine = leads.filter(function (l) { return l.ref === r.slug; });
    return {
      slug: r.slug, name: r.name, role: r.role, status: r.statusLabel === DOC_STATUS.approved ? 'approved' : 'draft',
      updatedAt: r.updatedAt, updatedBy: r.updatedBy, rev: r.rev, leads: mine.length,
      joined: mine.filter(function (l) { return l.status === 'Вступил'; }).length
    };
  });
  var c = readClub_();
  return { ok: true, invites: invites, club: { rev: c.rev, updatedAt: c.updatedAt, updatedBy: c.updatedBy }, activity: activity_(30) };
}

function get_(slug) {
  var entry = findIndex_(slug);
  if (!entry) return { ok: false, error: 'not_found' };
  var doc = readDoc_(entry);
  doc.status = entry.statusLabel === DOC_STATUS.approved ? 'approved' : 'draft';
  doc.rev = entry.rev || doc.rev || 0;
  return { ok: true, doc: doc };
}

function save_(d, who) {
  var doc = d.doc || {}, baseRev = Number(d.baseRev) || 0;
  doc.slug = String(doc.slug || '').trim();
  if (!doc.slug || !/^[a-z0-9-]{1,80}$/.test(doc.slug)) throw new Error('Неверный код приглашения.');
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var entry = findIndex_(doc.slug);
    var isNew = !entry;
    if (isNew && baseRev > 0) return { ok: true, conflict: true, deleted: true, rev: 0 };
    if (!isNew && (entry.rev || 0) !== baseRev) {
      return { ok: true, conflict: true, rev: entry.rev || 0, updatedBy: entry.updatedBy, updatedAt: entry.updatedAt };
    }
    ['url', 'dirty', 'club'].forEach(function (k) { delete doc[k]; });
    doc.rev = baseRev + 1;
    doc.updatedAt = new Date().toISOString();
    doc.updatedBy = who;
    if (doc.status !== 'approved') doc.status = 'draft';
    var body = JSON.stringify(doc);
    if (body.length > 9000000) throw new Error('Приглашение слишком большое: уменьшите фото.');
    var fileId;
    if (entry) { DriveApp.getFileById(entry.fileId).setContent(body); fileId = entry.fileId; }
    else fileId = DriveApp.getFolderById(dataFolder_()).createFile(doc.slug + '.json', body, 'application/json').getId();
    var row = [doc.slug, clean_(doc.name, 200), clean_(doc.role, 300), DOC_STATUS[doc.status], new Date(), who, clean_(d.link, 300), fileId, doc.rev];
    var sh = tab_(INDEX);
    if (entry) sh.getRange(entry.row, 1, 1, row.length).setValues([row]); else sh.appendRow(row);
    var prev = entry ? entry.statusLabel : '';
    var action = isNew ? 'Создал приглашение' : (prev !== DOC_STATUS[doc.status] ? (doc.status === 'approved' ? 'Согласовал приглашение' : 'Вернул в черновик') : 'Изменил приглашение');
    log_(who, action, doc.name, !isNew && action === 'Изменил приглашение' ? 'edit:' + doc.slug : '');
    return { ok: true, rev: doc.rev, updatedAt: doc.updatedAt, updatedBy: who };
  } finally { lock.releaseLock(); }
}

function delete_(d, who) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var entry = findIndex_(d.slug);
    if (!entry) return { ok: true };
    try { DriveApp.getFileById(entry.fileId).setTrashed(true); } catch (e) {}
    tab_(INDEX).deleteRow(entry.row);
    log_(who, 'Удалил приглашение', entry.name, '');
    return { ok: true };
  } finally { lock.releaseLock(); }
}

/* ============================== Общие блоки клуба ============================== */

function getClub_() {
  var c = readClub_();
  return { ok: true, rev: c.rev, data: c.data, updatedAt: c.updatedAt, updatedBy: c.updatedBy };
}

function saveClub_(d, who) {
  var baseRev = Number(d.baseRev) || 0;
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var cur = readClub_();
    if (cur.rev !== baseRev) return { ok: true, conflict: true, rev: cur.rev, updatedBy: cur.updatedBy, updatedAt: cur.updatedAt };
    var data = {};
    SHARED.forEach(function (k) { if (d.data && d.data[k]) data[k] = d.data[k]; });
    var o = { rev: baseRev + 1, updatedAt: new Date().toISOString(), updatedBy: who, data: data };
    var body = JSON.stringify(o);
    if (body.length > 9000000) throw new Error('Общие блоки слишком большие: уменьшите фото.');
    var id = prop_('CLUB_FILE_ID');
    if (id) DriveApp.getFileById(id).setContent(body);
    else PropertiesService.getScriptProperties().setProperty('CLUB_FILE_ID', DriveApp.getFolderById(dataFolder_()).createFile('club.json', body, 'application/json').getId());
    log_(who, 'Изменил общие блоки клуба', '', 'club');
    return { ok: true, rev: o.rev, updatedAt: o.updatedAt, updatedBy: who };
  } finally { lock.releaseLock(); }
}

function readClub_() {
  var id = prop_('CLUB_FILE_ID');
  if (!id) return { rev: 0, data: null, updatedAt: '', updatedBy: '' };
  try { return JSON.parse(DriveApp.getFileById(id).getBlob().getDataAsString('UTF-8')); }
  catch (e) { return { rev: 0, data: null, updatedAt: '', updatedBy: '' }; }
}

/* ============================== Публичная страница ============================== */

/** Только то, что видит кандидат: без исходников, профиля и заметок команды. Только согласованные. */
function pageData_(ref) {
  var entry = findIndex_(ref);
  if (!entry || entry.statusLabel !== DOC_STATUS.approved) return { ok: false, error: 'not_found' };
  var doc = readDoc_(entry), out = {};
  ['slug', 'name', 'nameGenitive', 'signoff', 'role', 'photo', 'photoIsPortrait', 'blocks'].forEach(function (k) { if (doc[k] !== undefined) out[k] = doc[k]; });
  var club = readClub_().data || {}, cl = {};
  (out.blocks || []).forEach(function (b) { if (SHARED.indexOf(b.type) >= 0 && club[b.type]) cl[b.type] = club[b.type]; });
  out.club = cl;
  return { ok: true, doc: out };
}

/* ============================== Заявки ============================== */

function leadRows_() {
  var sh = tab_(LEADS), n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, 10).getValues().map(function (r, i) {
    return {
      row: i + 2, createdAt: r[0] instanceof Date ? r[0].toISOString() : String(r[0] || ''),
      name: String(r[1]), contact: String(r[2]), note: String(r[3]), connector: String(r[4]),
      ref: String(r[5]), status: String(r[6] || 'Новая'), comment: String(r[7]), page: String(r[8])
    };
  }).filter(function (l) { return l.name || l.contact; });
}

function setLead_(d, who) {
  var row = Number(d.row);
  if (!(row >= 2)) throw new Error('Неверная строка.');
  var sh = tab_(LEADS);
  if (String(sh.getRange(row, 3).getValue()) !== String(d.contact)) throw new Error('Таблица изменилась, обновите список заявок.');
  var name = String(sh.getRange(row, 2).getValue());
  if (d.status !== undefined) {
    if (LEAD_STATUS.indexOf(d.status) < 0) throw new Error('Неизвестный статус.');
    sh.getRange(row, 7).setValue(d.status);
    log_(who, 'Сменил статус заявки на «' + d.status + '»', name, '');
  }
  if (d.comment !== undefined) {
    sh.getRange(row, 8).setValue(clean_(d.comment, 2000, true));
    log_(who, 'Оставил комментарий к заявке', name, 'cm:' + row);
  }
  return { ok: true };
}

/** Публичный приём заявки со страницы приглашения. */
function submitLead_(d) {
  if (d.website) return { ok: true, mode: 'saved' }; // ловушка для роботов
  var name = clean_(d.name, 120), contact = clean_(d.contact, 160);
  if (!name || !contact) throw new Error('Укажите имя и контакт.');
  var cache = CacheService.getScriptCache(), key = 'rate:' + Math.floor(Date.now() / 60000);
  var n = Number(cache.get(key) || 0);
  if (n > 40) throw new Error('Слишком много заявок за минуту. Попробуйте чуть позже.');
  cache.put(key, String(n + 1), 120);
  var ref = clean_(d.ref, 80), entry = ref ? findIndex_(ref) : null;
  var row = [new Date(), name, contact, clean_(d.note, 2000, true), entry ? clean_(entry.name, 200) : '', ref, 'Новая', '', clean_(d.page, 300), clean_(d.utm, 300)];
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { tab_(LEADS).appendRow(row); } finally { lock.releaseLock(); }
  return { ok: true, mode: 'saved' };
}

/* ============================== Таблицы и журнал ============================== */

function indexRows_() {
  var sh = tab_(INDEX), n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, 9).getValues().map(function (r, i) {
    return {
      row: i + 2, slug: String(r[0]).trim(), name: String(r[1]), role: String(r[2]), statusLabel: String(r[3]),
      updatedAt: r[4] instanceof Date ? r[4].toISOString() : String(r[4] || ''), updatedBy: String(r[5]),
      fileId: String(r[7]).trim(), rev: Number(r[8]) || 0
    };
  }).filter(function (r) { return r.slug && r.fileId; });
}

function findIndex_(slug) {
  slug = String(slug || '').trim();
  if (!slug) return null;
  var rows = indexRows_();
  for (var i = 0; i < rows.length; i++) if (rows[i].slug === slug) return rows[i];
  return null;
}

function readDoc_(entry) {
  var doc = JSON.parse(DriveApp.getFileById(entry.fileId).getBlob().getDataAsString('UTF-8'));
  doc.slug = entry.slug;
  return doc;
}

/** Запись в журнал. Частые правки одного и того же сливаются: не чаще раза в 10 минут. */
function log_(who, action, what, throttleKey) {
  var cache = CacheService.getScriptCache();
  if (throttleKey) {
    var k = 'log:' + throttleKey + ':' + who;
    if (cache.get(k)) return;
    cache.put(k, '1', 600);
  }
  try { tab_(JOURNAL).appendRow([new Date(), clean_(who, 80), clean_(action, 200), clean_(what, 200)]); } catch (e) {}
}

function activity_(n) {
  var sh = tab_(JOURNAL), last = sh.getLastRow();
  if (last < 2) return [];
  var from = Math.max(2, last - n + 1);
  return sh.getRange(from, 1, last - from + 1, 4).getValues().map(function (r) {
    return { at: r[0] instanceof Date ? r[0].toISOString() : String(r[0] || ''), who: String(r[1]), action: String(r[2]), what: String(r[3]) };
  }).reverse();
}

function dataFolder_() {
  var id = prop_('DATA_FOLDER_ID');
  if (id) { try { DriveApp.getFolderById(id).getName(); return id; } catch (e) {} }
  id = DriveApp.createFolder('Noôdome · данные приглашений').getId();
  PropertiesService.getScriptProperties().setProperty('DATA_FOLDER_ID', id);
  return id;
}

function tab_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, HEADERS[name].length).setValues([HEADERS[name]]);
    sh.setFrozenRows(1);
  }
  return sh;
}

/* ============================== Утилиты ============================== */

function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function msg_(err) { return String((err && err.message) || err); }
function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k) || ''; }

/** Текст для ячейки: без управляющих символов, с ограничением длины и без превращения в формулу. */
function clean_(v, max, multiline) {
  var s = String(v == null ? '' : v);
  s = multiline ? s.replace(/\r\n?/g, '\n') : s.replace(/[\r\n\t]+/g, ' ');
  s = s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max || 500);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

/* ============================== Для владельца ============================== */

/** Запустите один раз: создаст вкладки и папку, проверит пароль команды. */
function setup() {
  var log = [];
  [LEADS, INDEX, JOURNAL].forEach(function (n) { tab_(n); log.push('вкладка «' + n + '» готова'); });
  log.push('папка данных: ' + DriveApp.getFolderById(dataFolder_()).getName());
  log.push(prop_('TEAM_TOKEN') ? 'пароль команды задан' : 'НЕТ пароля команды: Настройки проекта → Свойства скрипта → добавить TEAM_TOKEN');
  Logger.log(log.join('\n'));
  return log;
}
