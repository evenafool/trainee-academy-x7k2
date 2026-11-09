// 練習小遊戲的陪玩角色：每個遊戲由劇情裡的一個角色負責，站在畫面右下角，答對答錯會說話
// 吉祥物「波波」（珍奶小熊）會在角色旁邊做表情：assets/art/icons/mascot-<表情>.webp
import { esc } from './util.js';

export const HOSTS = {
  bank: { who: 'seoyun', name: '徐允', hello: '一起背單字吧！我每天睡前都背 8 個～', right: ['記住了！', '好強！', '對！就是這個字！'], wrong: ['沒關係，我也常忘記', '再看一次就記住了'], end: '今天的單字收好了，晚安～' },
  quiz: { who: 'leo', name: 'Leo', hello: 'Quiz time! 我來出題！', right: ['Nice!', 'Perfect!', '答對了！'], wrong: ['差一點點！', 'Next time!'], end: 'Good job! 下次再來挑戰！' },
  test: { who: 'kong', name: '孔老師', hello: '認證考試開始，慢慢來，不要緊張。', right: ['正確。', '很好。', '沒錯！'], wrong: ['再想想看。', '這題記下來。'], end: '辛苦了，考得很認真。' },
  match: { who: 'mina', name: '敏雅', hello: '翻牌配對！看誰記得比較快～', right: ['配對成功！', '哇，好厲害！'], wrong: ['再翻翻看！', '差一點～'], end: '全部配對完成！' },
  speed: { who: 'nova', name: '露娜', hello: '60 秒快問快答，像上台一樣大聲說出來！', right: ['舞台感滿分！', '好聽！'], wrong: ['沒關係，下一題！', '深呼吸～'], end: '表演結束，台下好多掌聲！' },
  practice: { who: 'coach', name: '姜教練', hello: '想練哪一個？每種都能蓋一個章！', right: ['很好！'], wrong: ['再一次！'], end: '練得好！' },
};
const pick = (a) => a[Math.floor(Math.random() * a.length)];

// 掛上陪玩角色；回傳 { say, right, wrong, end }
export function mountHost(key, $root = document.body) {
  document.querySelector('.npc-host')?.remove();
  const h = HOSTS[key];
  if (!h) return { say() {}, right() {}, wrong() {}, end() {} };
  const box = document.createElement('div');
  box.className = `npc-host who-${h.who}`;
  box.innerHTML = `
    <p class="npc-bubble" aria-live="polite"></p>
    <div class="npc-body">
      <img class="npc-sprite" src="assets/art/sprite-${h.who}.webp" alt="${esc(h.name)}">
      <img class="npc-mascot" src="assets/art/icons/mascot-happy.webp" alt="" onerror="this.remove()">
      <span class="npc-name">${esc(h.name)}</span>
    </div>`;
  $root.append(box);
  const $b = box.querySelector('.npc-bubble');
  const $m = box.querySelector('.npc-mascot');
  let timer = null;
  const say = (text, mood = 'happy') => {
    $b.textContent = text;
    box.classList.remove('talk');
    void box.offsetWidth;
    box.classList.add('talk');
    if ($m) $m.src = `assets/art/icons/mascot-${mood}.webp`;
    clearTimeout(timer);
    timer = setTimeout(() => box.classList.remove('talk'), 2600);
  };
  // 換頁就收起來
  const off = () => { box.remove(); window.removeEventListener('hashchange', off); };
  window.addEventListener('hashchange', off);
  box.querySelector('.npc-body').onclick = () => say(pick([h.hello, ...h.right]), 'cheer');
  setTimeout(() => say(h.hello, 'happy'), 300);
  return {
    say,
    right: () => say(pick(h.right), 'cheer'),
    wrong: () => say(pick(h.wrong), 'think'),
    end: () => say(h.end, 'party'),
  };
}
