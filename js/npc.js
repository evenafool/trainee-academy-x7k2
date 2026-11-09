// 練習小遊戲的陪玩老師：每個遊戲由「最擅長那一項」的劇情角色負責，站在畫面右下角
// 開場先用 2～3 句教你怎麼玩（點角色可以跳下一句），答錯時給對應題型的小撇步，連續答對會誇你
// 吉祥物「露露」（露娜的小貓化身）在角色旁邊做表情：assets/art/icons/mascot-<表情>.webp
import { esc } from './util.js';

// 擅長：徐允＝背單字（每天睡前背 8 個）、Leo＝英文（台灣長大的英文通）、敏雅＝韓文（韓國交換生）、
//       露娜＝舞台上大聲說、孔老師＝考試、姜教練＝練習計畫
export const HOSTS = {
  bank: { who: 'seoyun', name: '徐允', role: '背單字達人',
    intro: ['我是徐允，我每天睡前都背 8 個字，教你我的方法！', '先看卡片：看圖、聽英文、再聽韓文，跟著小聲念一次。', '看完 8 張就小測驗，答錯的字最後會再考一次，一定記得住！'],
    right: ['記住了！', '好強！這個字收進單字本了', '對！就是這個字！'], wrong: ['沒關係，我也常忘記。看一下答案，等等還會再考一次', '先記住答案的樣子，下一輪就會了'],
    streak: '連續答對！跟我一樣厲害了！', end: '今天的 8 個字收好了，睡前再想一次會記得更牢喔～' },
  quiz: { who: 'leo', name: 'Leo', role: '英文通',
    intro: ["Hi! 我是 Leo，英文交給我！", '題目有四種：看中文選英文、聽英文、拼字、句子填空。', '聽力題可以按喇叭一直重聽，不用急！'],
    right: ['Nice!', 'Perfect!', 'Good job!'], wrong: ['差一點點！看看正確答案', 'No problem! 下一題加油'], streak: "You're on fire! 連續答對！", end: 'Great job! 下次再來挑戰！' },
  test: { who: 'kong', name: '孔老師', role: '考試老師',
    intro: ['我是孔老師，認證考試由我來監考。', '一共 20 題，答對 16 題就發證書。不會的先刪掉不可能的答案再選。', '慢慢來，不要緊張，題目都是你學過的字。'],
    right: ['正確。', '很好。', '沒錯！'], wrong: ['這題記下來，考完再複習。', '再想想看，下一題穩住。'], streak: '很穩，保持這個節奏。', end: '辛苦了，考得很認真。' },
  hub: { who: 'kong', name: '孔老師', role: '考試老師',
    intro: ['這裡看得到你離考試目標還有多遠。', '先去「單字庫」學新字，字數夠了就能考認證。'], right: [], wrong: [], streak: '', end: '' },
  'match-ko': { who: 'mina', name: '敏雅', role: '韓文交換生',
    intro: ['我是敏雅！韓文配對交給我～', '一次翻兩張：一張是圖，一張是韓文。配成一對就會念給你聽。', '翻錯沒關係，記住每張牌的位置就好！'],
    right: ['配對成功！발음 좋아요！', '哇，好厲害！'], wrong: ['再翻翻看，記住位置！', '差一點～'], streak: '連續配對！대박！', end: '全部配對完成！최고예요！' },
  'match-en': { who: 'leo', name: 'Leo', role: '英文通',
    intro: ["Hi! 英文配對我來陪你！", '一次翻兩張：一張是圖，一張是英文。配成一對就會念給你聽。', '先記位置，再配對，越少步越厲害！'],
    right: ['Nice match!', 'Great!'], wrong: ['Try again! 記住位置', '差一點～'], streak: 'Combo! 連續配對！', end: 'All matched! 太強了！' },
  speed: { who: 'nova', name: '露娜', role: '舞台前輩',
    intro: ['我是露娜！快問快答就像上台，要大聲說出來！', '看到圖和中文，就用外語說出來，說對自動換下一題。', '卡住了就按「跳過」，60 秒內答越多越好！'],
    right: ['舞台感滿分！', '好聽！', '就是這樣！'], wrong: ['沒關係，下一題！', '深呼吸～再大聲一點'], streak: '台下開始尖叫了！連續答對！', end: '表演結束，台下好多掌聲！' },
  hangul: { who: 'mina', name: '敏雅', role: '韓文交換生',
    intro: ['我是敏雅！韓文從 40 音開始，我教你～', '一個一個點字母，聽我念，再跟著念一次。注意嘴巴的形狀喔！', '全部聽過就挑戰小測驗，80 分就過關！'],
    right: ['맞아요！答對了！', '發音好標準！', '대박！'], wrong: ['沒關係，再聽一次就記住了', '差一點點～'], streak: '連續答對！你有韓文天分！', end: '辛苦了！수고했어요！' },
  practice: { who: 'coach', name: '姜教練', role: '練習教練',
    intro: ['我是姜教練！今天想練哪一個？', '每完成一種練習都能蓋一個章，集滿 3 個章就達標！'], right: [], wrong: [], streak: '', end: '' },
  deck: { who: 'mina', name: '敏雅', role: '陪你練題庫',
    intro: ['題庫練習！我陪你一題一題來～', '答錯的題目會進錯題本，答對兩次就畢業。'], right: ['答對了！', '好棒！'], wrong: ['沒關係，看一下解說', '記下來，下次就會了'], streak: '連續答對！', end: '練完了，辛苦了！' },
};
// 題型對應的小撇步（答錯時給）
export const TIPS = {
  spell: '拼字小撇步：先按「聽發音」，一個音一個音拼，像 te-a-cher。',
  listen: '聽力小撇步：多按幾次喇叭，先抓第一個音。',
  cloze: '填空小撇步：先看整句的意思，再想哪個字放進去最通順。',
  zh2en: '想想看這個字在劇情裡出現過嗎？畫面會幫你記住。',
  zh2ko: '韓文小撇步：念一次看看，聲音對了答案就對了。',
  kolisten: '韓文聽力：注意最後的「요」前面是什麼音。',
  ko2zh: '看韓文的第一個字，想想它在哪一集出現過。',
};
const pick = (a) => a[Math.floor(Math.random() * a.length)];

// 掛上陪玩角色；回傳 { say, right, wrong(type), end }
export function mountHost(key, $root = document.body) {
  document.querySelector('.npc-host')?.remove();
  const h = HOSTS[key];
  if (!h) return { say() {}, right() {}, wrong() {}, end() {} };
  const box = document.createElement('div');
  box.className = `npc-host who-${h.who}`;
  box.innerHTML = `
    <p class="npc-bubble" aria-live="polite"></p>
    <div class="npc-body" role="button" tabindex="0" aria-label="${esc(h.name)}：點我看下一句">
      <img class="npc-sprite" src="assets/art/sprite-${h.who}.webp" alt="${esc(h.name)}">
      <img class="npc-mascot" src="assets/art/icons/mascot-happy.webp" alt="" onerror="this.remove()">
      <span class="npc-name">${esc(h.name)}<small>${esc(h.role)}</small></span>
    </div>`;
  $root.append(box);
  const $b = box.querySelector('.npc-bubble');
  const $m = box.querySelector('.npc-mascot');
  let timer = null;
  let streak = 0;
  const say = (text, mood = 'happy', ms = 3200) => {
    if (!text) return;
    $b.textContent = text;
    box.classList.remove('talk');
    void box.offsetWidth;
    box.classList.add('talk');
    if ($m) $m.src = `assets/art/icons/mascot-${mood}.webp`;
    clearTimeout(timer);
    timer = setTimeout(() => box.classList.remove('talk'), ms);
  };
  // 開場教學：一句一句講，點角色可以跳下一句
  let step = 0;
  let introTimer = null;
  const nextTip = () => {
    clearTimeout(introTimer);
    if (step < h.intro.length) {
      say(`${h.intro[step]}${step < h.intro.length - 1 ? '　（點我看下一句）' : ''}`, step ? 'cheer' : 'happy', 4200);
      step++;
      introTimer = setTimeout(nextTip, 4300);
    }
  };
  const off = () => { clearTimeout(introTimer); box.remove(); window.removeEventListener('hashchange', off); };
  window.addEventListener('hashchange', off);
  const body = box.querySelector('.npc-body');
  body.onclick = () => (step < h.intro.length ? nextTip() : say(pick([...h.intro, ...(h.right.length ? h.right : [h.intro[0]])]), 'cheer'));
  body.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); body.click(); } };
  setTimeout(nextTip, 300);
  const stopIntro = () => { clearTimeout(introTimer); step = h.intro.length; };
  return {
    say,
    right: () => { stopIntro(); streak++; say(streak >= 3 && h.streak ? h.streak : pick(h.right), 'cheer'); },
    wrong: (type) => { stopIntro(); streak = 0; say(TIPS[type] ? `${pick(h.wrong)}\n${TIPS[type]}` : pick(h.wrong), 'think', 5200); },
    end: () => { stopIntro(); say(h.end, 'party', 5000); },
  };
}
