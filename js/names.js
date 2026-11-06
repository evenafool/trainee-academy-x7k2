// 偶像世界的名字：經紀公司、前輩女團、自己未來的團名，由孩子自己取
// 課程資料裡寫的是暫定名（星夢娛樂、NOVA／노바），啟動時換成孩子取的名字；韓文助詞會依收尾音自動調整
export const DEFAULT_NAMES = { agency: '星夢娛樂', agencyEn: 'STARDREAM', group: 'NOVA', groupKo: '노바', myGroup: '' };

// 名字最後一個字有沒有收尾音（韓文看字本身；英文字母用母音結尾粗略判斷）
function hasBatchim(word) {
  const ch = String(word).trim().at(-1) || '';
  const c = ch.codePointAt(0) - 0xac00;
  if (c >= 0 && c <= 11171) return c % 28 !== 0;
  return !/[aeiouy]$/i.test(ch);
}
const JOSA = { 를: ['을', '를'], 가: ['이', '가'], 는: ['은', '는'], 와: ['과', '와'], 예요: ['이에요', '예요'], 야: ['이야', '야'], 랑: ['이랑', '랑'] };
const JOSA_ROM = { reul: ['eul', 'reul'], ga: ['i', 'ga'], neun: ['eun', 'neun'], wa: ['gwa', 'wa'], yeyo: ['ieyo', 'yeyo'], ya: ['iya', 'ya'] };

export function nameText(text, n) {
  if (typeof text !== 'string' || !n) return text;
  const ko = (n.groupKo || n.group || DEFAULT_NAMES.groupKo).trim();
  const g = (n.group || DEFAULT_NAMES.group).trim();
  const b = hasBatchim(ko);
  return text
    .replace(/노바(를|가|는|와|예요|야|랑)?/g, (_, p) => ko + (p ? JOSA[p][b ? 0 : 1] : ''))
    .replace(/Noba(reul|ga|neun|wa|yeyo|ya)?/g, (_, p) => g + (p ? '-' + JOSA_ROM[p][hasBatchim(g) ? 0 : 1] : ''))
    .replaceAll('NOVA', g)
    .replaceAll('星夢娛樂', (n.agency || DEFAULT_NAMES.agency).trim())
    .replaceAll('STARDREAM', (n.agencyEn || n.agency || DEFAULT_NAMES.agencyEn).trim());
}

// 把物件裡所有字串換成孩子取的名字（就地修改）
export function applyNames(obj, n) {
  if (!obj || typeof obj !== 'object') return obj;
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (typeof v === 'string') obj[k] = nameText(v, n);
    else if (v && typeof v === 'object') applyNames(v, n);
  }
  return obj;
}
