// 每日關卡課程：一天一關、一關 3 個字，中文／英文／韓文同時學
// scenes：每個字的情境例句（會畫成漫畫格）；dialogue：當天的情境對話（英／韓兩種版本）

export const CHAPTERS = [
  { id: 1, title: '初次見面', emoji: '👋', bg: 'classroom', desc: '新來的交換生敏雅，竟然也是 NOVA 粉！' },
  { id: 2, title: '追星日常', emoji: '🎤', bg: 'stage', desc: '第一次看演唱會、在見面會見到露娜' },
  { id: 3, title: '學校生活', emoji: '🏫', bg: 'classroom', desc: '讀書和夢想，兩個都要' },
  { id: 4, title: '首爾試鏡', emoji: '✈️', bg: 'airport', desc: '出發去首爾參加星夢娛樂的試鏡！' },
];

const S = (who, en, ko, kr, zh, bg) => ({ who, en, ko, kr, zh, bg });

export const WORDS = {
  hello: { emoji: '👋', zh: '你好', en: 'hello', ko: '안녕하세요', kr: 'annyeonghaseyo', note: '韓文直譯是「您平安嗎？」，對長輩、陌生人都能用',
    scenes: [S('mina', "Hello! I'm Mina.", '안녕하세요! 저는 민아예요.', 'Annyeonghaseyo! Jeoneun Minayeyo.', '你好！我是敏雅。', 'classroom'),
      S('me', 'Hello, teacher!', '선생님, 안녕하세요!', 'Seonsaengnim, annyeonghaseyo!', '老師好！', 'street')] },
  name: { emoji: '🏷️', zh: '名字', en: 'name', ko: '이름', kr: 'ireum', note: '이름 念起來像「一勒恩」',
    scenes: [S('me', "What's your name?", '이름이 뭐예요?', 'Ireumi mwoyeyo?', '你叫什麼名字？', 'classroom'),
      S('leo', 'My name is Leo.', '제 이름은 레오예요.', 'Je ireumeun Reoyeyo.', '我的名字是 Leo。', 'street')] },
  friend: { emoji: '🤝', zh: '朋友', en: 'friend', ko: '친구', kr: 'chingu', note: '漢字詞「親舊」，親近的老朋友',
    scenes: [S('mina', "Let's be friends!", '우리 친구 해요!', 'Uri chingu haeyo!', '我們當朋友吧！', 'classroom'),
      S('me', 'This is my friend.', '이 사람은 제 친구예요.', 'I sarameun je chinguyeyo.', '這是我的朋友。', 'cafe')] },

  thanks: { emoji: '🙏', zh: '謝謝', en: 'thank you', ko: '감사합니다', kr: 'gamsahamnida', note: '漢字詞「感謝」＋합니다；對朋友可以說 고마워요',
    scenes: [S('me', 'Thank you so much!', '정말 감사합니다!', 'Jeongmal gamsahamnida!', '真的很謝謝你！', 'cafe'),
      S('mina', 'Thanks for the gift.', '선물 감사합니다.', 'Seonmul gamsahamnida.', '謝謝你的禮物。', 'room')] },
  sorry: { emoji: '🙇', zh: '對不起', en: 'sorry', ko: '미안해요', kr: 'mianhaeyo', note: '對朋友用 미안해요；正式道歉用 죄송합니다',
    scenes: [S('leo', "Sorry, I'm late!", '늦어서 미안해요!', 'Neujeoseo mianhaeyo!', '抱歉，我遲到了！', 'street'),
      S('me', "Sorry, I didn't know.", '몰랐어요, 미안해요.', 'Mollasseoyo, mianhaeyo.', '抱歉，我不知道。', 'classroom')] },
  okay: { emoji: '👌', zh: '沒關係', en: "it's okay", ko: '괜찮아요', kr: 'gwaenchanayo', note: '語尾上揚就變成問句「你還好嗎？」',
    scenes: [S('me', "It's okay!", '괜찮아요!', 'Gwaenchanayo!', '沒關係！', 'street'),
      S('mina', 'Are you okay?', '괜찮아요?', 'Gwaenchanayo?', '你還好嗎？', 'room')] },

  yes: { emoji: '✅', zh: '是／對', en: 'yes', ko: '네', kr: 'ne', note: '네 聽起來像「內」，但它是 yes！',
    scenes: [S('me', "Yes, I'm Taiwanese.", '네, 저는 대만 사람이에요.', 'Ne, jeoneun daeman saramieyo.', '是的，我是台灣人。', 'classroom'),
      S('mina', 'Yes, I know!', '네, 알아요!', 'Ne, arayo!', '對，我知道！', 'cafe')] },
  no: { emoji: '❌', zh: '不是', en: 'no', ko: '아니요', kr: 'aniyo', note: '아니＝不；아니요 是比較有禮貌的說法',
    scenes: [S('me', "No, I'm a student.", '아니요, 저는 학생이에요.', 'Aniyo, jeoneun haksaengieyo.', '不，我是學生。', 'classroom'),
      S('leo', 'No, thank you.', '아니요, 괜찮아요.', 'Aniyo, gwaenchanayo.', '不用了，謝謝。', 'cafe')] },
  like: { emoji: '💖', zh: '喜歡', en: 'like', ko: '좋아해요', kr: 'joahaeyo', note: '좋다＝好；喜歡某樣東西用 ～을/를 좋아해요',
    scenes: [S('me', 'I like K-pop.', '저는 케이팝을 좋아해요.', 'Jeoneun keipabeul joahaeyo.', '我喜歡 K-pop。', 'stage'),
      S('mina', 'Do you like bubble tea?', '버블티 좋아해요?', 'Beobeulti joahaeyo?', '你喜歡珍珠奶茶嗎？', 'cafe')] },

  song: { emoji: '🎵', zh: '歌', en: 'song', ko: '노래', kr: 'norae', note: '노래＝歌，노래방＝KTV（歌房）',
    scenes: [S('mina', 'I love this song!', '이 노래 너무 좋아요!', 'I norae neomu joayo!', '我超愛這首歌！', 'room'),
      S('me', "Let's sing a song.", '같이 노래해요.', 'Gachi noraehaeyo.', '一起唱歌吧。', 'stage')] },
  dance: { emoji: '💃', zh: '跳舞', en: 'dance', ko: '춤', kr: 'chum', note: '춤＝舞蹈，跳舞是 춤춰요',
    scenes: [S('mina', "Let's dance together!", '같이 춤춰요!', 'Gachi chumchwoyo!', '一起跳舞吧！', 'stage'),
      S('me', 'Her dance is amazing.', '춤이 대박이에요.', 'Chumi daebagieyo.', '她的舞超強。', 'stage')] },
  stage: { emoji: '🎤', zh: '舞台', en: 'stage', ko: '무대', kr: 'mudae', note: '漢字詞「舞臺」，念起來就像「舞台」！',
    scenes: [S('me', 'The stage is so cool!', '무대 진짜 멋있어요!', 'Mudae jinjja meosisseoyo!', '舞台真的好帥！', 'stage'),
      S('leo', 'NOVA is on stage now.', '지금 노바가 무대에 있어요.', 'Jigeum Nobaga mudaee isseoyo.', 'NOVA 現在在舞台上。', 'stage')] },

  ticket: { emoji: '🎫', zh: '票', en: 'ticket', ko: '티켓', kr: 'tiket', note: '直接來自英文 ticket，超好記',
    scenes: [S('leo', 'I got the ticket!', '티켓 구했어요!', 'Tiket guhaesseoyo!', '我搶到票了！', 'room'),
      S('me', 'How much is the ticket?', '티켓 얼마예요?', 'Tiket eolmayeyo?', '票多少錢？', 'street')] },
  concert: { emoji: '🏟️', zh: '演唱會', en: 'concert', ko: '콘서트', kr: 'konseoteu', note: '來自英文 concert',
    scenes: [S('mina', 'The concert is tomorrow.', '콘서트는 내일이에요.', 'Konseoteuneun naeirieyo.', '演唱會在明天。', 'room'),
      S('me', "Let's go to the concert!", '콘서트 가요!', 'Konseoteu gayo!', '去看演唱會吧！', 'street')] },
  wait: { emoji: '⏳', zh: '等待', en: 'wait', ko: '기다려요', kr: 'gidaryeoyo', note: '기다리다＝等；기다려져요＝好期待',
    scenes: [S('me', "I'm waiting for NOVA.", '노바를 기다려요.', 'Nobareul gidaryeoyo.', '我在等 NOVA。', 'airport'),
      S('leo', 'Please wait a moment!', '잠깐만 기다려 주세요!', 'Jamkkanman gidaryeo juseyo!', '請等一下！', 'street')] },

  cute: { emoji: '🥰', zh: '可愛', en: 'cute', ko: '귀여워요', kr: 'gwiyeowoyo', note: '粉絲最常留言的一句！',
    scenes: [S('mina', 'Your photocard is so cute!', '포카 너무 귀여워요!', 'Poka neomu gwiyeowoyo!', '你的小卡好可愛！', 'cafe'),
      S('me', 'The puppy is cute.', '강아지가 귀여워요.', 'Gangajiga gwiyeowoyo.', '小狗好可愛。', 'street')] },
  cool: { emoji: '😎', zh: '帥／酷', en: 'cool', ko: '멋있어요', kr: 'meosisseoyo', note: '멋＝帥氣＋있어요＝有 → 「有帥氣」',
    scenes: [S('me', 'NOVA is so cool!', '노바 진짜 멋있어요!', 'Noba jinjja meosisseoyo!', 'NOVA 好帥！', 'stage'),
      S('leo', 'Your jacket is cool.', '재킷 멋있어요.', 'Jaekit meosisseoyo.', '你的外套好帥。', 'street')] },
  favorite: { emoji: '⭐', zh: '最愛／本命', en: 'favorite', ko: '최애', kr: 'choeae', note: '漢字詞「最愛」，英文粉絲圈也說 bias',
    scenes: [S('mina', 'Who is your favorite?', '최애가 누구예요?', 'Choeaega nuguyeyo?', '你的本命是誰？', 'room'),
      S('me', 'NOVA is my favorite.', '제 최애는 노바예요.', 'Je choeaeneun Nobayeyo.', '我的本命是 NOVA。', 'stage')] },

  school: { emoji: '🏫', zh: '學校', en: 'school', ko: '학교', kr: 'hakgyo', note: '漢字詞「學校」，학 跟台語「學（ha̍k）」的發音很像',
    scenes: [S('me', 'I go to school by bus.', '버스로 학교에 가요.', 'Beoseuro hakgyoe gayo.', '我搭公車上學。', 'street'),
      S('mina', 'Our school is big.', '우리 학교는 커요.', 'Uri hakgyoneun keoyo.', '我們學校很大。', 'classroom')] },
  teacher: { emoji: '🧑‍🏫', zh: '老師', en: 'teacher', ko: '선생님', kr: 'seonsaengnim', note: '「先生」＋님（敬稱）',
    scenes: [S('mina', 'Our teacher is kind.', '우리 선생님은 친절해요.', 'Uri seonsaengnimeun chinjeolhaeyo.', '我們老師很親切。', 'classroom'),
      S('me', 'Teacher, I have a question!', '선생님, 질문 있어요!', 'Seonsaengnim, jilmun isseoyo!', '老師，我有問題！', 'classroom')] },
  exam: { emoji: '📝', zh: '考試', en: 'exam', ko: '시험', kr: 'siheom', note: '漢字詞「試驗」',
    scenes: [S('leo', 'I have an exam tomorrow.', '내일 시험이 있어요.', 'Naeil siheomi isseoyo.', '我明天有考試。', 'night'),
      S('me', 'The exam was easy!', '시험 쉬웠어요!', 'Siheom swiwosseoyo!', '考試好簡單！', 'classroom')] },

  homework: { emoji: '📒', zh: '作業', en: 'homework', ko: '숙제', kr: 'sukje', note: '漢字詞「宿題」，回家要做的題目',
    scenes: [S('me', 'I finished my homework!', '숙제 다 했어요!', 'Sukje da haesseoyo!', '我寫完作業了！', 'room'),
      S('leo', 'There is a lot of homework.', '숙제가 많아요.', 'Sukjega manayo.', '作業好多。', 'night')] },
  book: { emoji: '📚', zh: '書', en: 'book', ko: '책', kr: 'chaek', note: '漢字詞「冊」',
    scenes: [S('mina', "I'm reading a book.", '책을 읽고 있어요.', 'Chaegeul ilgo isseoyo.', '我在看書。', 'cafe'),
      S('me', 'This book is fun.', '이 책 재미있어요.', 'I chaek jaemiisseoyo.', '這本書好好看。', 'room')] },
  study: { emoji: '✏️', zh: '讀書／學習', en: 'study', ko: '공부해요', kr: 'gongbuhaeyo', note: '漢字詞「工夫」＋해요，下工夫＝讀書',
    scenes: [S('me', 'I study English every day.', '저는 매일 영어를 공부해요.', 'Jeoneun maeil yeongeoreul gongbuhaeyo.', '我每天讀英文。', 'night'),
      S('leo', "Let's study at the library.", '도서관에서 공부해요.', 'Doseogwaneseo gongbuhaeyo.', '我們去圖書館讀書吧。', 'classroom')] },

  today: { emoji: '📅', zh: '今天', en: 'today', ko: '오늘', kr: 'oneul', note: '念 o-neul，最後一樣是舌尖輕碰的 l 音',
    scenes: [S('mina', 'Today is my birthday!', '오늘은 제 생일이에요!', 'Oneureun je saengirieyo!', '今天是我生日！', 'cafe'),
      S('me', "It's hot today.", '오늘 더워요.', 'Oneul deowoyo.', '今天好熱。', 'street')] },
  tomorrow: { emoji: '🌅', zh: '明天', en: 'tomorrow', ko: '내일', kr: 'naeil', note: '漢字詞「來日」',
    scenes: [S('leo', 'See you tomorrow!', '내일 봐요!', 'Naeil bwayo!', '明天見！', 'street'),
      S('me', 'Tomorrow is Saturday.', '내일은 토요일이에요.', 'Naeireun toyoirieyo.', '明天是星期六。', 'room')] },
  time: { emoji: '⏰', zh: '時間', en: 'time', ko: '시간', kr: 'sigan', note: '漢字詞「時間」，念法也很像！',
    scenes: [S('me', 'Do you have time?', '시간 있어요?', 'Sigan isseoyo?', '你有空嗎？', 'classroom'),
      S('mina', 'Time flies!', '시간이 빨리 가요!', 'Sigani ppalli gayo!', '時間過得好快！', 'night')] },

  delicious: { emoji: '😋', zh: '好吃', en: 'delicious', ko: '맛있어요', kr: 'masisseoyo', note: '맛＝味道＋있어요＝有 → 「有味道」就是好吃',
    scenes: [S('mina', 'This is delicious!', '이거 맛있어요!', 'Igeo masisseoyo!', '這個好好吃！', 'cafe'),
      S('me', 'Korean food is delicious.', '한국 음식은 맛있어요.', 'Hanguk eumsigeun masisseoyo.', '韓國菜好好吃。', 'cafe')] },
  water: { emoji: '💧', zh: '水', en: 'water', ko: '물', kr: 'mul', note: '念 mul，最後舌尖輕碰上排牙齒後面（像英文的 l），不是捲舌',
    scenes: [S('me', 'Water, please.', '물 주세요.', 'Mul juseyo.', '請給我水。', 'cafe'),
      S('leo', 'I drink a lot of water.', '물을 많이 마셔요.', 'Mureul mani masyeoyo.', '我喝很多水。', 'street')] },
  bubbletea: { emoji: '🧋', zh: '珍珠奶茶', en: 'bubble tea', ko: '버블티', kr: 'beobeulti', note: '韓國也超愛台灣珍奶！',
    scenes: [S('me', 'Bubble tea is from Taiwan!', '버블티는 대만에서 왔어요!', 'Beobeultineun daemaneseo wasseoyo!', '珍珠奶茶來自台灣！', 'cafe'),
      S('mina', 'One bubble tea, please.', '버블티 하나 주세요.', 'Beobeulti hana juseyo.', '請給我一杯珍珠奶茶。', 'cafe')] },

  howmuch: { emoji: '💰', zh: '多少錢', en: 'how much', ko: '얼마예요', kr: 'eolmayeyo', note: '逛街必備：이거 얼마예요?',
    scenes: [S('me', 'How much is this?', '이거 얼마예요?', 'Igeo eolmayeyo?', '這個多少錢？', 'street'),
      S('leo', 'How much is the album?', '앨범 얼마예요?', 'Aelbeom eolmayeyo?', '專輯多少錢？', 'street')] },
  buy: { emoji: '🛍️', zh: '買', en: 'buy', ko: '사요', kr: 'sayo', note: '사다＝買，過去式 샀어요＝買了',
    scenes: [S('mina', 'I buy an album.', '앨범을 사요.', 'Aelbeomeul sayo.', '我買專輯。', 'street'),
      S('me', 'What did you buy?', '뭐 샀어요?', 'Mwo sasseoyo?', '你買了什麼？', 'cafe')] },
  this: { emoji: '👉', zh: '這個', en: 'this', ko: '이거', kr: 'igeo', note: '點餐、購物時指著東西說 이거！',
    scenes: [S('me', 'This one, please!', '이거 주세요!', 'Igeo juseyo!', '我要這個！', 'cafe'),
      S('leo', 'What is this?', '이거 뭐예요?', 'Igeo mwoyeyo?', '這是什麼？', 'street')] },

  airport: { emoji: '✈️', zh: '機場', en: 'airport', ko: '공항', kr: 'gonghang', note: '漢字詞「空港」，日文也這樣寫',
    scenes: [S('leo', 'See you at the airport!', '공항에서 봐요!', 'Gonghangeseo bwayo!', '機場見！', 'street'),
      S('me', 'The airport is so big.', '공항이 정말 커요.', 'Gonghangi jeongmal keoyo.', '機場好大。', 'airport')] },
  korea: { emoji: '🇰🇷', zh: '韓國', en: 'Korea', ko: '한국', kr: 'hanguk', note: '漢字詞「韓國」，한국어＝韓國語',
    scenes: [S('me', 'I want to go to Korea.', '한국에 가고 싶어요.', 'Hanguge gago sipeoyo.', '我想去韓國。', 'room'),
      S('leo', "I'm learning Korean.", '한국어를 배워요.', 'Hangugeoreul baewoyo.', '我在學韓文。', 'classroom')] },
  taiwan: { emoji: '🇹🇼', zh: '台灣', en: 'Taiwan', ko: '대만', kr: 'daeman', note: '漢字詞「臺灣」，韓國人念 대만',
    scenes: [S('me', "I'm from Taiwan.", '저는 대만에서 왔어요.', 'Jeoneun daemaneseo wasseoyo.', '我來自台灣。', 'airport'),
      S('mina', 'Come to Taiwan!', '대만에 놀러 오세요!', 'Daemane nolleo oseyo!', '來台灣玩吧！', 'street')] },
};

const L = (c, en, ko, kr, zh) => ({ c, en, ko, kr, zh });

// 每天一關；boss 關＝章節總複習
export const LEVELS = [
  { id: 'd1', ch: 1, title: '交換生來了', words: ['hello', 'name', 'friend'], bg: 'classroom', with: 'mina',
    dialogue: [L('mina', 'Hello!', '안녕하세요!', 'Annyeonghaseyo!', '你好！'),
      L('me', "Hello! What's your name?", '안녕하세요! 이름이 뭐예요?', 'Annyeonghaseyo! Ireumi mwoyeyo?', '你好！你叫什麼名字？'),
      L('mina', 'My name is Mina.', '제 이름은 민아예요.', 'Je ireumeun Minayeyo.', '我的名字是敏雅。'),
      L('me', "Let's be friends!", '우리 친구 해요!', 'Uri chingu haeyo!', '我們當朋友吧！')] },
  { id: 'd2', ch: 1, title: 'Leo 遲到了', words: ['thanks', 'sorry', 'okay'], bg: 'street', with: 'leo',
    dialogue: [L('leo', "Sorry, I'm late!", '늦어서 미안해요!', 'Neujeoseo mianhaeyo!', '抱歉，我遲到了！'),
      L('me', "It's okay!", '괜찮아요!', 'Gwaenchanayo!', '沒關係！'),
      L('leo', 'This is a gift for you.', '이거 선물이에요.', 'Igeo seonmurieyo.', '這是給你的禮物。'),
      L('me', 'Thank you so much!', '정말 감사합니다!', 'Jeongmal gamsahamnida!', '真的很謝謝你！')] },
  { id: 'd3', ch: 1, title: '你喜歡 K-pop 嗎？', words: ['yes', 'no', 'like'], bg: 'cafe', with: 'mina',
    dialogue: [L('mina', 'Do you like K-pop?', '케이팝 좋아해요?', 'Keipap joahaeyo?', '你喜歡 K-pop 嗎？'),
      L('me', 'Yes! I like NOVA.', '네! 노바 좋아해요.', 'Ne! Noba joahaeyo.', '喜歡！我喜歡 NOVA。'),
      L('mina', 'Are you a dancer?', '댄서예요?', 'Daenseoyeyo?', '你是舞者嗎？'),
      L('me', "No, I'm a student.", '아니요, 저는 학생이에요.', 'Aniyo, jeoneun haksaengieyo.', '不是，我是學生。')] },
  { id: 'b1', ch: 1, boss: true, title: '第一章 BOSS：自我介紹大挑戰' },

  { id: 'd4', ch: 2, title: 'NOVA 上台了！', words: ['song', 'dance', 'stage'], bg: 'stage', with: 'mina',
    dialogue: [L('me', "It's NOVA's stage!", '노바 무대예요!', 'Noba mudaeyeyo!', '是 NOVA 的舞台！'),
      L('mina', 'I love this song!', '이 노래 너무 좋아요!', 'I norae neomu joayo!', '我超愛這首歌！'),
      L('me', 'Her dance is amazing.', '춤이 대박이에요.', 'Chumi daebagieyo.', '她的舞超強。'),
      L('mina', "Let's dance together!", '같이 춤춰요!', 'Gachi chumchwoyo!', '一起跳舞吧！')] },
  { id: 'd5', ch: 2, title: '搶票成功', words: ['ticket', 'concert', 'wait'], bg: 'room', with: 'leo',
    dialogue: [L('leo', 'I got the ticket!', '티켓 구했어요!', 'Tiket guhaesseoyo!', '我搶到票了！'),
      L('me', 'Really? When is the concert?', '진짜요? 콘서트 언제예요?', 'Jinjjayo? Konseoteu eonjeyeyo?', '真的嗎？演唱會什麼時候？'),
      L('leo', 'The concert is tomorrow.', '콘서트는 내일이에요.', 'Konseoteuneun naeirieyo.', '演唱會在明天。'),
      L('me', "I can't wait!", '너무 기다려져요!', 'Neomu gidaryeojyeoyo!', '好期待！')] },
  { id: 'd6', ch: 2, title: '你的本命是誰？', words: ['cute', 'cool', 'favorite'], bg: 'room', with: 'mina',
    dialogue: [L('mina', 'Who is your favorite?', '최애가 누구예요?', 'Choeaega nuguyeyo?', '你的本命是誰？'),
      L('me', 'NOVA is my favorite!', '제 최애는 노바예요!', 'Je choeaeneun Nobayeyo!', '我的本命是 NOVA！'),
      L('mina', 'NOVA is so cool!', '노바 진짜 멋있어요!', 'Noba jinjja meosisseoyo!', 'NOVA 好帥！'),
      L('me', 'And so cute!', '그리고 너무 귀여워요!', 'Geurigo neomu gwiyeowoyo!', '而且好可愛！')] },
  { id: 'b2', ch: 2, boss: true, title: '第二章 BOSS：應援大會' },

  { id: 'd7', ch: 3, title: '明天要考試', words: ['school', 'teacher', 'exam'], bg: 'classroom', with: 'mina',
    dialogue: [L('mina', 'We have an exam at school tomorrow.', '내일 학교에서 시험이 있어요.', 'Naeil hakgyoeseo siheomi isseoyo.', '我們明天在學校有考試。'),
      L('me', "Me too! Let's study together.", '저도요! 같이 공부해요.', 'Jeodoyo! Gachi gongbuhaeyo.', '我也是！一起讀書吧。'),
      L('mina', 'Our teacher is kind. Let\'s ask her.', '선생님은 친절해요. 같이 물어봐요.', 'Seonsaengnimeun chinjeolhaeyo. Gachi mureobwayo.', '老師很親切，一起去問吧。'),
      L('me', 'Okay! Fighting!', '좋아요! 화이팅!', 'Joayo! Hwaiting!', '好！加油！')] },
  { id: 'd8', ch: 3, title: '作業好多', words: ['homework', 'book', 'study'], bg: 'night', with: 'leo',
    dialogue: [L('leo', 'Did you finish your homework?', '숙제 다 했어요?', 'Sukje da haesseoyo?', '你作業寫完了嗎？'),
      L('me', 'No… there is a lot of homework.', '아니요… 숙제가 많아요.', 'Aniyo… sukjega manayo.', '還沒…作業好多。'),
      L('leo', "Let's read books and study at the library!", '도서관에서 책 읽고 같이 공부해요!', 'Doseogwaneseo chaek ilkko gachi gongbuhaeyo!', '一起去圖書館看書、讀書吧！'),
      L('me', 'Good idea! Thank you!', '좋아요! 고마워요!', 'Joayo! Gomawoyo!', '好主意！謝謝！')] },
  { id: 'd9', ch: 3, title: '明天有空嗎？', words: ['today', 'tomorrow', 'time'], bg: 'classroom', with: 'mina',
    dialogue: [L('mina', 'Do you have time tomorrow?', '내일 시간 있어요?', 'Naeil sigan isseoyo?', '你明天有空嗎？'),
      L('me', "I'm busy today, but tomorrow is okay!", '오늘은 바빠요. 하지만 내일은 괜찮아요!', 'Oneureun bappayo. Hajiman naeireun gwaenchanayo!', '今天很忙，但是明天可以！'),
      L('mina', "Let's eat together!", '같이 밥 먹어요!', 'Gachi bap meogeoyo!', '一起吃飯吧！'),
      L('me', 'Okay! See you tomorrow!', '좋아요! 내일 봐요!', 'Joayo! Naeil bwayo!', '好！明天見！')] },
  { id: 'b3', ch: 3, boss: true, title: '第三章 BOSS：期末考衝刺' },

  { id: 'd10', ch: 4, title: '請你喝珍奶', words: ['delicious', 'water', 'bubbletea'], bg: 'cafe', with: 'mina',
    dialogue: [L('me', "Try this! It's bubble tea.", '이거 마셔 봐요! 버블티예요.', 'Igeo masyeo bwayo! Beobeultiyeyo.', '喝喝看！這是珍珠奶茶。'),
      L('mina', "Wow, it's delicious!", '와, 맛있어요!', 'Wa, masisseoyo!', '哇，好好喝！'),
      L('me', 'Bubble tea is from Taiwan!', '버블티는 대만에서 왔어요!', 'Beobeultineun daemaneseo wasseoyo!', '珍珠奶茶來自台灣！'),
      L('mina', "I'm thirsty… water, please!", '목말라요… 물 주세요!', 'Mongmallayo… mul juseyo!', '好渴…請給我水！')] },
  { id: 'd11', ch: 4, title: '買專輯', words: ['howmuch', 'buy', 'this'], bg: 'street', with: 'mina',
    dialogue: [L('me', 'What is this?', '이거 뭐예요?', 'Igeo mwoyeyo?', '這是什麼？'),
      L('mina', "It's NOVA's new album!", '노바 새 앨범이에요!', 'Noba sae aelbeomieyo!', '是 NOVA 的新專輯！'),
      L('me', 'How much is this?', '이거 얼마예요?', 'Igeo eolmayeyo?', '這個多少錢？'),
      L('mina', "It's 20,000 won.", '이만 원이에요.', 'Iman wonieyo.', '兩萬韓元。'),
      L('me', 'I will buy this one!', '이거 살게요!', 'Igeo salgeyo!', '我要買這個！')] },
  { id: 'd12', ch: 4, title: '機場的約定', words: ['airport', 'korea', 'taiwan'], bg: 'airport', with: 'mina',
    dialogue: [L('mina', 'Congratulations! Come to Korea next month!', '축하해요! 다음 달에 한국에 와요!', 'Chukahaeyo! Daeum dare hanguge wayo!', '恭喜！下個月來韓國吧！'),
      L('me', "Yes! But I will miss Taiwan.", '네! 그런데 대만이 보고 싶을 거예요.', 'Ne! Geureonde daemani bogo sipeul geoyeyo.', '好！可是我會想念台灣。'),
      L('mina', 'I will wait for you at the airport!', '공항에서 기다릴게요!', 'Gonghangeseo gidarilgeyo!', '我會在機場等你！'),
      L('me', 'Thank you, my friend!', '고마워, 친구야!', 'Gomawo, chinguya!', '謝謝你，我的朋友！')] },
  { id: 'b4', ch: 4, boss: true, title: '最終 BOSS：首爾之旅' },
];

export const wordsOfLevel = (lv) => lv.boss ? LEVELS.filter((x) => x.ch === lv.ch && !x.boss).flatMap((x) => x.words) : lv.words;

// 勳章：check(state) 回傳 true 代表達成
export const BADGES = [
  { id: 'first', emoji: '🌱', name: '練習生報到', desc: '完成第一個關卡', color: '#10b981', check: (s) => clearedCount(s) >= 1 },
  { id: 'streak3', emoji: '🔥', name: '三天打卡', desc: '連續學習 3 天', color: '#f97316', check: (s) => s.streak >= 3 },
  { id: 'streak7', emoji: '🗓️', name: '一週不間斷', desc: '連續學習 7 天', color: '#ef4444', check: (s) => s.streak >= 7 },
  { id: 'ch1', emoji: '👋', name: '初次見面', desc: '通過第一章 BOSS', color: '#3b82f6', check: (s) => !!s.course.cleared.b1 },
  { id: 'ch2', emoji: '🎤', name: '應援達人', desc: '通過第二章 BOSS', color: '#8b5cf6', check: (s) => !!s.course.cleared.b2 },
  { id: 'ch3', emoji: '🏫', name: '學霸認證', desc: '通過第三章 BOSS', color: '#0ea5e9', check: (s) => !!s.course.cleared.b3 },
  { id: 'ch4', emoji: '✈️', name: '首爾之旅', desc: '通過最終 BOSS', color: '#ec4899', check: (s) => !!s.course.cleared.b4 },
  { id: 'star3', emoji: '⭐', name: '三星練習生', desc: '拿到 3 次三星', color: '#eab308', check: (s) => Object.values(s.course.cleared).filter((v) => v === 3).length >= 3 },
  { id: 'words12', emoji: '📖', name: '單字收藏家', desc: '學會 12 個單字', color: '#14b8a6', check: (s) => Object.keys(s.course.learned).length >= 12 },
  { id: 'words36', emoji: '📚', name: '三語小達人', desc: '學會 36 個單字', color: '#6366f1', check: (s) => Object.keys(s.course.learned).length >= 36 },
  { id: 'speak10', emoji: '🎙️', name: '發音小歌手', desc: '跟讀成功 10 次', color: '#f43f5e', check: (s) => s.course.spoken >= 10 },
  { id: 'talk5', emoji: '💬', name: '對話高手', desc: '完成 5 段情境對話', color: '#a855f7', check: (s) => s.course.dialogues >= 5 },
  { id: 'review10', emoji: '🔁', name: '複習之王', desc: '複習答對 10 題', color: '#22c55e', check: (s) => s.course.reviewed >= 10 },
];

function clearedCount(s) { return Object.keys(s.course.cleared).length; }

// 間隔複習：答對就拉長間隔（天）
export const SRS_DAYS = [1, 2, 4, 7, 15, 30];

// 下集預告：每集都停在讓人想看下去的地方（明天解鎖的那一集）
export const TEASERS = {
  d1: '敏雅看著你的手機，小聲說：「其實我以前…」她到底有什麼祕密？',
  d2: '敏雅要來你家一起追直播，她說要講一個「韓國人都知道的恐怖傳說」…',
  d3: 'NOVA 演唱會就在下週！你第一次要親眼看到她們…',
  b1: '第二章：第一次看演唱會！舞台上的露娜，會說出改變你一生的一句話…',
  d4: '見面會門票明天開賣！聽說有一個祕密儀式，做了就一定搶得到…',
  d5: '見面會那天，露娜走到你面前，問了你一個問題…',
  d6: '回家後你一直睡不著…可是學校的期中考也要來了！',
  b2: '第三章：你決定要當偶像了！但功課和練習，要怎麼兼顧？',
  d7: '讀書讀到半夜，圖書館傳出翻書聲…可是裡面明明一個人都沒有…',
  d8: '手機突然跳出一則通知：「星夢娛樂 公開試鏡」…',
  d9: '報名表要用筆寫，你隨手拿起一枝紅筆，敏雅突然大叫…',
  b3: '第四章：出發去首爾試鏡！',
  d10: '飛機降落首爾，星夢娛樂的大樓就在眼前…可是電梯好像怪怪的…',
  d11: '試鏡結束了，回台灣前，手機響了…',
  d12: '報到第一天，你遇到一個舞跳得超強的同期，她看你的眼神有點不服氣…',
  b4: '第一季完結！第二季「練習生篇」：實力超強的同期徐允出現了，她是對手還是朋友？',
};

// 每日情境短劇：主線是主角（孩子自己）從追星到成為韓團女星的「出道之路」，約每 3 集穿插 1 集都市傳說
// 經紀公司、前輩女團的名字由孩子決定，目前暫用「星夢娛樂」「NOVA」；每篇最後的 fact 是「真相／小知識」
const P = (bg, cast, say, extra = {}) => ({ bg, cast: cast.map(([c, e, pose]) => ({ c, e, pose })), say: say.map(([c, t, sub, opt]) => ({ c, t, sub, ...opt })), ...extra });

export const STORIES = {
  d1: { kind: '追星篇', title: '交換生也是 NOVA 粉！',
    panels: [P('classroom', [['me', 'love']], [['me', '노바 진짜 멋있어요…', 'NOVA 真的好帥…', { think: true }]], { cap: '下課偷看 NOVA 的舞台影片' }),
      P('classroom', [['mina', 'shock'], ['me', 'shock']], [['mina', '저도 노바 좋아해요!', '我也喜歡 NOVA！', { shout: true }]]),
      P('classroom', [['mina', 'happy', 'wave'], ['me', 'happy']], [['mina', '우리 친구 해요!', '我們當朋友吧！'], ['me', '좋아요!', '好！']])],
    fact: '「덕질」就是追星。很多偶像出道前也是別人的粉絲，追星的熱情可以變成努力的動力！' },
  d2: { kind: '追星篇', title: '敏雅的祕密',
    panels: [P('room', [['mina', 'smile'], ['me', 'think']], [['mina', '사실… 저 연습생이었어요.', '其實…我以前是練習生。']], { cap: '一起看 NOVA 直播的晚上' }),
      P('burst', [['me', 'shock']], [['me', '진짜요?!', '真的嗎？！', { shout: true }]]),
      P('room', [['mina', 'gentle'], ['me', 'smile']], [['mina', '지금은 선생님이 꿈이에요.', '現在我的夢想是當老師。']])],
    fact: '真實世界：練習生每個月都要接受考核（월말평가），不是每個人都會出道。但練習時學會的語言、舞蹈和毅力，會一直留在身上。' },
  d3: { kind: '都市傳說', title: '開電風扇睡覺會…？',
    panels: [P('night', [['mina', 'shock'], ['me', 'shock']], [['mina', '선풍기 켜고 자면 안 돼요!', '不能開電風扇睡覺！', { shout: true }], ['me', '真的假的？！', '', { think: true }]], { cap: '敏雅來家裡一起追直播，聊到半夜…' }),
      P('room', [['leo', 'think', 'think']], [['leo', 'Is that true?', '那是真的嗎？']]),
      P('burst', [['me', 'happy', 'wave']], [['me', '아니요! 괜찮아요!', '不是啦！沒事的！']], { fx: '破解！' })],
    fact: '「선풍기 사망설（電風扇死亡說）」：韓國以前流傳關窗開電風扇睡覺會死掉。科學上沒有根據！不過很多韓國電風扇真的都有定時關機功能 😂' },
  d4: { kind: '追星篇', title: '第一次看演唱會',
    panels: [P('stage', [['nova', 'cool', 'wave']], [['nova', '여러분, 꿈은 말해야 이루어져요!', '大家，夢想要說出來才會實現！']], { cap: 'NOVA 演唱會，台上的露娜' }),
      P('stage', [['me', 'love', 'cheer'], ['mina', 'happy', 'cheer']], [['me', '노바 화이팅!', 'NOVA 加油！']]),
      P('night', [['me', 'think', 'think']], [['me', '나도… 무대에 서고 싶어.', '我也…想站上舞台。', { think: true }]])],
    fact: '看演唱會時跟著應援口號喊、不推擠、不拍禁止拍攝的段落，才是最帥的粉絲。' },
  d5: { kind: '追星篇', title: '搶到見面會門票！',
    panels: [P('room', [['me', 'think', 'think']], [['me', '聽說搶票前要先拜拜…還要穿幸運色…', '', { think: true }]], { cap: '見面會門票開賣前 1 分鐘' }),
      P('room', [['leo', 'happy'], ['me', 'shock']], [['leo', "Just wait. Don't refresh too fast!", '耐心等，不要一直狂按重新整理！']]),
      P('burst', [['me', 'love', 'cheer']], [['me', '티켓 구했어요!', '我搶到票了！', { shout: true }]], { fx: '成功！' })],
    fact: '搶票靠的是網路速度和運氣，「穿幸運色」「先拜拜」都是粉絲間的玄學都市傳說 😆 記得只在官方管道買票，小心黃牛詐騙！' },
  d6: { kind: '追星篇', title: '露娜對我說的話',
    panels: [P('stage', [['nova', 'smile'], ['me', 'shock']], [['nova', '꿈이 뭐예요?', '你的夢想是什麼？']], { cap: '粉絲見面會，終於見到露娜' }),
      P('stage', [['me', 'cry']], [['me', '가수가 되고 싶어요!', '我想當歌手！', { shout: true }]]),
      P('stage', [['nova', 'happy', 'wave']], [['nova', '할 수 있어요! 화이팅!', '你可以的！加油！']])],
    fact: '見面會（팬미팅）可以和偶像說話。先想好一句韓文，例如「가수가 되고 싶어요（我想當歌手）」，就算很緊張也能說出口！' },
  d7: { kind: '都市傳說', title: '考前不能喝海帶湯！',
    panels: [P('cafe', [['mina', 'shock'], ['me', 'think']], [['mina', '시험 전에 미역국 먹으면 안 돼요!', '考試前不能喝海帶湯！', { shout: true }], ['me', '為什麼？', '', { think: true }]], { cap: '期中考前一天，你也在偷偷練舞' }),
      P('cafe', [['mina', 'cry']], [['mina', '미끄러져요!', '會「滑掉」（落榜）！']]),
      P('cafe', [['mina', 'happy', 'wave'], ['me', 'love']], [['mina', '찹쌀떡 먹고 시험 붙어요!', '吃糯米糕，考試會「黏」上！'], ['me', '台灣是吃包子粽子「包中」！', '']])],
    fact: '韓國考生的迷信：海帶湯滑滑的＝「미끄러지다（滑倒＝落榜）」；糯米糕、麥芽糖黏黏的＝「붙다（黏住＝考上）」。台灣考生則吃包子、粽子＝「包中」！' },
  d8: { kind: '都市傳說', title: '半夜會看書的銅像',
    panels: [P('night', [['leo', 'shock'], ['me', 'shock']], [['leo', 'The statue reads books at night!', '銅像半夜會看書！', { shout: true }]], { cap: '讀書和練舞兩頭燒的晚上' }),
      P('night', [['me', 'cry']], [['me', '책을 읽고 있어요…?!', '它在看書…？！']], { fx: '沙沙…' }),
      P('classroom', [['kong', 'happy', 'point'], ['leo', 'shock']], [['kong', '那是值夜班的工友在看書啦！', '']], { board: '真相大白' })],
    fact: '韓國很多學校有世宗大王、李舜臣將軍的銅像，「半夜銅像會動、會看書」是韓國版學校怪談。台灣也有「半夜銅像會動」的傳說，是不是很像？' },
  d9: { kind: '出道之路', title: '星夢娛樂試鏡公告',
    panels: [P('room', [['me', 'shock']], [['me', '오디션이에요!', '是試鏡！', { shout: true }]], { cap: '手機跳出星夢娛樂的試鏡公告' }),
      P('classroom', [['mina', 'smile', 'point'], ['me', 'think']], [['mina', '한국어로 자기소개 해야 돼요.', '要用韓文自我介紹喔。']]),
      P('night', [['me', 'cool', 'cheer']], [['me', '매일 연습할 거예요!', '我每天都會練習！']])],
    fact: '真實世界：韓國經紀公司常辦公開試鏡（공개 오디션），也有線上試鏡。試鏡時常要用韓文自我介紹，所以語言是第一步！' },
  d10: { kind: '都市傳說', title: '不能用紅筆寫名字',
    panels: [P('cafe', [['me', 'smile'], ['mina', 'shock']], [['mina', '빨간색으로 이름 쓰면 안 돼요!', '不能用紅筆寫名字！', { shout: true }]], { cap: '填試鏡報名表的時候…' }),
      P('cafe', [['me', 'think', 'think']], [['me', '왜요?', '為什麼？']]),
      P('cafe', [['leo', 'happy'], ['mina', 'smile']], [['leo', "It's just a superstition!", '那只是迷信啦！'], ['mina', '그래도 검은색으로 써요 ㅋㅋ', '但還是用黑筆寫吧 哈哈']])],
    fact: '韓國以前會用紅色寫往生者的名字，所以有「紅筆寫名字不吉利」的說法；台灣也有類似禁忌。現在知道由來，就不用害怕啦！' },
  d11: { kind: '都市傳說', title: '沒有 4 樓的經紀公司',
    panels: [P('street', [['me', 'shock']], [['me', '4층이 없어요!', '沒有 4 樓！', { shout: true }]], { cap: '來到首爾的星夢娛樂大樓' }),
      P('street', [['mina', 'smile', 'point'], ['me', 'think']], [['mina', '4는 사라서 F라고 써요.', '4 念「사」，跟「死」同音，所以寫 F']]),
      P('classroom', [['me', 'happy', 'cheer']], [['me', '오디션 화이팅!', '試鏡加油！']])],
    fact: '韓文「4（사）」和「死（사）」同音，所以很多韓國電梯把 4 樓寫成 F（Four）。台灣也有很多大樓沒有 4 樓，西方則是避開 13。' },
  d12: { kind: '出道之路', title: '試鏡結果出爐',
    panels: [P('airport', [['me', 'cry']], [['me', '떨려요…', '好緊張…']], { cap: '回台灣前，在機場等試鏡結果' }),
      P('airport', [['me', 'shock'], ['mina', 'shock']], [['me', '합격했어요!', '我通過了！', { shout: true }]], { fx: '叮咚！' }),
      P('airport', [['mina', 'love', 'cheer'], ['me', 'love', 'cheer']], [['mina', '축하해요! 이제 연습생이에요!', '恭喜！你現在是練習生了！']])],
    fact: '「합격」是通過、錄取的意思，考試考上也用這個字。你的練習生生活，從這一天開始！' },
};

// 每天上完課的收藏品：跟那一集劇情呼應的「劇照小卡」或「回憶小物」
// scene 用短劇圖當卡面；item 有 assets/art/item-<關卡>.webp 就用插圖，沒有就用表情符號
export const KEEPSAKES = {
  d1: { kind: 'scene', name: '劇照・交換生也是 NOVA 粉', rarity: 'R' },
  d2: { kind: 'item', name: '敏雅的練習生名牌', emoji: '🏷️', desc: '敏雅老師以前的練習生名牌，她說送你當護身符', rarity: 'R' },
  d3: { kind: 'scene', name: '劇照・電風扇都市傳說', rarity: 'R' },
  d4: { kind: 'item', name: 'NOVA 演唱會票根', emoji: '🎫', desc: '人生第一場演唱會的票根', rarity: 'R' },
  d5: { kind: 'item', name: '見面會入場券', emoji: '🎟️', desc: '拼了命搶到的見面會門票', rarity: 'R' },
  d6: { kind: 'item', name: '露娜的簽名小卡', emoji: '✍️', desc: '露娜在見面會上簽給你：「꿈은 이루어져요（夢想會實現）」', rarity: 'SR' },
  d7: { kind: 'item', name: '糯米糕護身符', emoji: '🍡', desc: '敏雅說吃了考試就會「黏」上', rarity: 'R' },
  d8: { kind: 'scene', name: '劇照・半夜的圖書館', rarity: 'R' },
  d9: { kind: 'item', name: '試鏡報名表', emoji: '📝', desc: '用黑筆認真寫好的報名表', rarity: 'R' },
  d10: { kind: 'item', name: '寫著名字的珍奶杯', emoji: '🧋', desc: '用黑筆寫上名字的珍奶杯', rarity: 'R' },
  d11: { kind: 'item', name: '星夢娛樂訪客證', emoji: '🪪', desc: '第一次走進經紀公司大樓的訪客證', rarity: 'SR' },
  d12: { kind: 'item', name: '練習生識別證', emoji: '🌟', desc: '印著你名字的練習生識別證！', rarity: 'SSR' },
};

// 每個單字記下自己的 id（用來找 assets/art/icons/w-<id>.webp 圖示）
for (const [id, w] of Object.entries(WORDS)) w.id = id;

// 短劇和對話接起來：演完短劇後，老師用一句話帶到「同一個故事的下一幕」
export const INTROS = {
  d1: '下課鐘響，敏雅走到你的座位旁邊。你們都是 NOVA 粉，先來正式自我介紹吧！',
  d2: '直播看到一半，Leo 才氣喘吁吁地衝進來，手上還拿著一個小禮物…',
  d3: '隔天在咖啡廳，敏雅還在笑你昨晚嚇到躲進被子裡。她想多認識你一點！',
  d4: '演唱會開始了！露娜一上台，你和敏雅一起尖叫…',
  d5: '搶票成功之後，Leo 衝過來要確認日期。',
  d6: '見面會結束，回家路上敏雅一直問你：「所以你的本命是誰？」',
  d7: '試鏡之前還有期中考！敏雅說要跟你一起準備。',
  d8: '銅像的謎解開了，可是作業還是好多…Leo 想到一個好主意。',
  d9: '看到試鏡公告，敏雅說要幫你練自我介紹，約你明天見面。',
  d10: '換上黑筆填好報名表，你請敏雅喝她人生第一杯珍奶！',
  d11: '試鏡前還有一點時間，敏雅帶你去首爾的專輯店放鬆一下。',
  d12: '收到合格通知！在機場，敏雅抱著你，和你做了一個約定。',
};

// ───────── 第二季「練習生日記」（第 13～30 天）併進主課程 ─────────
import { CHAPTERS2, WORDS2, LEVELS2, STORIES2, TEASERS2, INTROS2, KEEPSAKES2 } from './course2.js';
for (const id of Object.keys(WORDS2)) if (WORDS[id]) throw new Error(`單字 id 重複：${id}`);
CHAPTERS.push(...CHAPTERS2);
Object.assign(WORDS, WORDS2);
LEVELS.push(...LEVELS2);
Object.assign(STORIES, STORIES2);
Object.assign(TEASERS, TEASERS2);
Object.assign(INTROS, INTROS2);
Object.assign(KEEPSAKES, KEEPSAKES2);
BADGES.push(
  { id: 'ch5', emoji: '🏠', name: '宿舍生存王', desc: '通過第五章 BOSS', color: '#b08968', check: (s) => !!s.course.cleared.b5 },
  { id: 'ch8', emoji: '🏆', name: '月末評價第一', desc: '通過第八章 BOSS', color: '#c97b84', check: (s) => !!s.course.cleared.b8 },
  { id: 'debut', emoji: '🌟', name: '正式出道', desc: '完成第 30 天「出道舞台」', color: '#f0b429', check: (s) => !!s.course.cleared.d30 },
  { id: 'words60', emoji: '📗', name: '六十字達人', desc: '學會 60 個單字', color: '#10b981', check: (s) => Object.keys(s.course.learned).length >= 60 },
  { id: 'words90', emoji: '📘', name: '九十字練習生', desc: '學會 90 個單字', color: '#3b82f6', check: (s) => Object.keys(s.course.learned).length >= 90 },
);
for (const [id, w] of Object.entries(WORDS)) w.id = id;

// ───────── 第三季「新人偶像篇」（第 31～48 天）併進主課程 ─────────
import { CHAPTERS3, WORDS3, LEVELS3, STORIES3, TEASERS3, INTROS3, KEEPSAKES3 } from './course3.js';
for (const id of Object.keys(WORDS3)) if (WORDS[id]) throw new Error(`單字 id 重複：${id}`);
CHAPTERS.push(...CHAPTERS3);
Object.assign(WORDS, WORDS3);
LEVELS.push(...LEVELS3);
Object.assign(STORIES, STORIES3);
Object.assign(TEASERS, TEASERS3);
Object.assign(INTROS, INTROS3);
Object.assign(KEEPSAKES, KEEPSAKES3);
BADGES.push(
  { id: 'ch11', emoji: '🎬', name: '打歌新人', desc: '通過第十一章 BOSS', color: '#e8590c', check: (s) => !!s.course.cleared.b11 },
  { id: 'ch16', emoji: '🏅', name: '年度新人', desc: '通過第三季最終 BOSS', color: '#d4a017', check: (s) => !!s.course.cleared.b16 },
  { id: 'words144', emoji: '📙', name: '144 字新人王', desc: '學會 144 個單字', color: '#8b5cf6', check: (s) => Object.keys(s.course.learned).length >= 144 },
);
for (const [id, w] of Object.entries(WORDS)) w.id = id;

// ───────── 第一季短劇補上「發光單字」（2026-11-06）─────────
// 第一季寫的時候短劇台詞沒有放進當天的 3 個字；這裡把字自然地放進台詞並標記 { w, hl }，
// 看劇時會發光讓孩子點擊收集，上課時也能回到這一格復習。null＝那一格維持原本台詞。
// 有多格分鏡圖的集數（1、4、6、11、12）台詞都配合畫面內容。
{
  const SAY = (c, t, sub, opt = {}) => ({ c, t, sub, ...opt });
  const S1 = {
    d1: [null,
      [SAY('mina', '안녕하세요! 저도 노바 좋아해요!', '你好！我也喜歡 NOVA！', { shout: true, w: 'hello', hl: '안녕하세요' })],
      [SAY('mina', '제 이름은 민아예요.', '我的名字是敏雅。', { w: 'name', hl: '이름' }), SAY('mina', '우리 친구 해요!', '我們當朋友吧！', { w: 'friend', hl: '친구' }), SAY('me', '좋아요!', '好！')]],
    d2: [null,
      [SAY('me', '진짜요?! 미안해요, 몰랐어요!', '真的嗎？！對不起，我都不知道！', { shout: true, w: 'sorry', hl: '미안해요' })],
      [SAY('mina', '괜찮아요. 지금은 선생님이 꿈이에요.', '沒關係。現在我的夢想是當老師。', { w: 'okay', hl: '괜찮아요' }), SAY('me', '말해 줘서 감사합니다!', '謝謝你告訴我！', { w: 'thanks', hl: '감사합니다' })]],
    d3: [[SAY('mina', '선풍기 켜고 자면 안 돼요!', '不能開電風扇睡覺！'), SAY('me', '真的假的？！', ''), SAY('mina', '네! 진짜예요!', '對！是真的！', { w: 'yes', hl: '네' })],
      null,
      [SAY('me', '아니요! 괜찮아요!', '不是啦！沒事的！', { w: 'no', hl: '아니요' }), SAY('me', '저는 선풍기 좋아해요 ㅋㅋ', '我喜歡電風扇啦 哈哈', { w: 'like', hl: '좋아해요' })]],
    d4: [null,
      [SAY('me', '이 노래 최고예요!', '這首歌最棒了！', { w: 'song', hl: '노래' }), SAY('mina', '춤도 대박이에요!', '舞也超厲害！', { w: 'dance', hl: '춤' }), SAY('me', '노바 화이팅!', 'NOVA 加油！', { shout: true })],
      [SAY('me', '나도… 무대에 서고 싶어.', '我也…想站上舞台。', { think: true, w: 'stage', hl: '무대' })]],
    d5: [null,
      [SAY('leo', "Just wait. Don't refresh too fast!", '耐心等，不要一直狂按重新整理！', { w: 'wait', hl: 'wait' })],
      [SAY('me', '티켓 구했어요!', '我搶到票了！', { shout: true, w: 'ticket', hl: '티켓' }), SAY('leo', 'A fan meeting and a concert! Lucky you!', '見面會加演唱會！你好幸運！', { w: 'concert', hl: 'concert' })]],
    d6: [[SAY('me', '루나 언니가 제 최애예요…!', '露娜姐姐是我的本命…！', { think: true, w: 'favorite', hl: '최애' }), SAY('nova', '꿈이 뭐예요?', '你的夢想是什麼？')],
      null,
      [SAY('nova', '할 수 있어요! 화이팅!', '你可以的！加油！'), SAY('nova', '그리고… 진짜 귀여워요!', '還有…你好可愛！', { w: 'cute', hl: '귀여워요' }), SAY('me', '언니, 진짜 멋있어요!', '姐姐，你真的好帥氣！', { w: 'cool', hl: '멋있어요' })]],
    d7: [[SAY('mina', '시험 전에 미역국 먹으면 안 돼요!', '考試前不能喝海帶湯！', { w: 'exam', hl: '시험' }), SAY('me', '為什麼？', '')],
      null,
      [SAY('mina', '찹쌀떡 먹고 시험 붙어요!', '吃糯米糕，考試會「黏」上！'), SAY('me', '台灣是吃包子粽子「包中」！', ''),
        SAY('mina', '내일 학교에 가져가요!', '明天帶去學校吧！', { w: 'school', hl: '학교' }), SAY('me', '선생님한테도 드릴래요!', '我也要送給老師！', { w: 'teacher', hl: '선생님' })]],
    d8: [[SAY('me', '숙제가 너무 많아요…', '作業好多…', { w: 'homework', hl: '숙제' }), SAY('leo', 'The statue reads books at night!', '銅像半夜會看書！')],
      [SAY('me', '책을 읽고 있어요…?!', '它在看書…？！', { shout: true, w: 'book', hl: '책' })],
      [SAY('kong', '那是值夜班的工友在看書啦！', ''), SAY('leo', '그럼 우리도 같이 공부해요!', '那我們也一起讀書吧！', { w: 'study', hl: '공부해요' })]],
    d9: [[SAY('me', '오디션이에요!', '是試鏡！', { shout: true }), SAY('me', '오늘 밤까지 신청해야 돼요!', '今天晚上之前要報名！', { w: 'today', hl: '오늘' })],
      [SAY('mina', '한국어로 자기소개 해야 돼요.', '要用韓文自我介紹喔。'), SAY('mina', '내일부터 같이 연습해요!', '明天開始一起練習吧！', { w: 'tomorrow', hl: '내일' })],
      [SAY('me', '시간이 없어도 매일 연습할 거예요!', '就算沒時間，我也會每天練習！', { w: 'time', hl: '시간' })]],
    d10: [[SAY('me', '버블티 마시면서 써요~', '邊喝珍奶邊寫～', { w: 'bubbletea', hl: '버블티' }), SAY('mina', '빨간색으로 이름 쓰면 안 돼요!', '不能用紅筆寫名字！', { shout: true })],
      null,
      [SAY('leo', "It's just a superstition!", '那只是迷信啦！'), SAY('mina', '그래도 검은색으로 써요 ㅋㅋ', '但還是用黑筆寫吧 哈哈'),
        SAY('mina', '그런데 버블티 진짜 맛있어요!', '不過珍奶真的好好喝！', { w: 'delicious', hl: '맛있어요' }), SAY('leo', '저는 물 마실게요 ㅋㅋ', '我喝水就好 哈哈', { w: 'water', hl: '물' })]],
    d11: [[SAY('me', '이거 봐요! 4층이 없어요!', '你看這個！沒有 4 樓！', { shout: true, w: 'this', hl: '이거' })],
      [SAY('mina', '4는 사라서 F라고 써요.', '4 念「사」，跟「死」同音，所以寫 F'), SAY('mina', '오디션 끝나고 앨범 사요!', '試鏡結束後去買專輯吧！', { w: 'buy', hl: '사요' }), SAY('me', '앨범 얼마예요?', '專輯多少錢？', { w: 'howmuch', hl: '얼마예요' })],
      null],
    d12: [[SAY('me', '떨려요…', '好緊張…', { think: true }), SAY('me', '공항에서 결과를 기다려요…', '在機場等結果…', { think: true, w: 'airport', hl: '공항' })],
      null,
      [SAY('mina', '축하해요! 이제 연습생이에요!', '恭喜！你現在是練習生了！'), SAY('mina', '다음 달에 한국에 와요!', '下個月來韓國吧！', { w: 'korea', hl: '한국' }),
        SAY('me', '대만에 가서 가족한테 말할게요!', '我先回台灣跟家人說！', { w: 'taiwan', hl: '대만' })]],
  };
  for (const [id, panels] of Object.entries(S1)) panels.forEach((say, i) => { if (say && STORIES[id]?.panels[i]) STORIES[id].panels[i].say = say; });
}

// ───────── 章末 BOSS 關＝主題單字特訓（16 關、160 字）─────────
import { THEMES } from './themes.js';
for (const lv of LEVELS.filter((l) => l.boss)) {
  const th = THEMES[lv.id];
  if (!th) continue;
  for (const w of th.words) {
    if (WORDS[w.id]) throw new Error(`主題單字 id 重複：${w.id}`);
    WORDS[w.id] = { ...w, theme: lv.id };
  }
  lv.words = th.words.map((w) => w.id);
  lv.theme = th.title;
}


// ───────── 延伸字：每天 3 個（從當天的對話挑，對照教育部國中小英語參考字彙表）─────────
import { EXTRAS } from './extras.js';
for (const lv of LEVELS.filter((l) => !l.boss)) {
  const xs = EXTRAS[lv.id];
  if (!xs) continue;
  for (const x of xs) {
    if (WORDS[x.id]) throw new Error(`延伸字 id 重複：${x.id}`);
    const d = x.ex.d != null ? lv.dialogue[x.ex.d] : null;
    const [who, en, ko, kr, zh] = d ? [d.c, d.en, d.ko, d.kr, d.zh] : x.ex.s;
    WORDS[x.id] = { id: x.id, emoji: x.emoji, zh: x.zh, en: x.en, ko: x.ko, kr: x.kr, note: x.note, extra: lv.id,
      scenes: [S(who, en, ko, kr, zh, lv.bg)], hl: { en: x.ex.en, ko: x.ex.ko }, inDialogue: !!d };
  }
  lv.extra = xs.map((x) => x.id);
}

// ───────── 國中 1,200 字庫：教育部基本 1,200 字裡主線還沒教到的字（在「考試準備度 → 單字庫」學）─────────
import { BANK } from './bank.js';
for (const th of BANK) for (const w of th.words) {
  if (WORDS[w.id]) throw new Error(`字庫 id 重複：${w.id}`);
  WORDS[w.id] = w;
}
