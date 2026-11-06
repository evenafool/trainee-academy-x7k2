// 第三季「新人偶像篇」：第 31～48 天（6 章、54 個新字）
// 主線：第一次上音樂節目 → 第一個一位 → 電台與綜藝 → 粉絲簽名會 → 亞洲巡演・台北場 → 年末頒獎典禮（新人賞）
// 都市傳說穿插：電視台的도깨비（韓國民間傳說）、九份・金瓜石的黃金傳說（台灣歷史）
// 健康的偶像夢：睡飽、吃好、線上課照上、對粉絲溫柔、不用為了追星花大錢

const S = (who, en, ko, kr, zh, bg) => ({ who, en, ko, kr, zh, bg });
const L = (c, en, ko, kr, zh) => ({ c, en, ko, kr, zh });
const P = (bg, cast, say, extra = {}) => ({ bg, cast: cast.map(([c, e, pose]) => ({ c, e, pose })), say: say.map(([c, t, sub, opt]) => ({ c, t, sub, ...opt })), ...extra });
const W = (emoji, zh, en, ko, kr, note, scenes) => ({ emoji, zh, en, ko, kr, note, scenes });

export const CHAPTERS3 = [
  { id: 11, title: '新人打歌期', emoji: '🎬', bg: 'stage', desc: '第一次上音樂節目，待機室裡也要上線上課' },
  { id: 12, title: '第一個一位', emoji: '🏆', bg: 'stage', desc: '一位候補、早點睡覺，還有人生第一座獎盃' },
  { id: 13, title: '電台與綜藝', emoji: '📻', bg: 'room', desc: '用英文上電台、挑戰兩倍速跳舞、在宿舍做晚餐' },
  { id: 14, title: '粉絲簽名會', emoji: '✍️', bg: 'cafe', desc: '第一次簽名會、讀粉絲的信、幫徐允過生日' },
  { id: 15, title: '亞洲巡演・台北場', emoji: '✈️', bg: 'airport', desc: '巡演最後一站是台北，家人就在台下' },
  { id: 16, title: '年末頒獎典禮', emoji: '🏅', bg: 'stage', desc: '首爾的初雪、紅毯，還有一生只有一次的新人賞' },
];

export const WORDS3 = {
  // ── 第十一章 新人打歌期 ──
  music: W('🎶', '音樂', 'music', '음악', 'eumak', '漢字詞「音樂」→ 음악；音樂節目叫 음악 방송，簡稱「음방」', [
    S('mina', 'This is a music show.', '여기는 음악 방송이에요.', 'Yeogineun eumak bangsongieyo.', '這裡是音樂節目。', 'stage'),
    S('me', 'I love music!', '음악이 정말 좋아요!', 'Eumagi jeongmal joayo!', '我好愛音樂！', 'room')]),
  camera: W('📷', '攝影機／相機', 'camera', '카메라', 'kamera', '外來語 camera → 카메라；攝影機亮紅燈，就代表正在拍！', [
    S('mina', 'Look at the camera!', '카메라를 보세요!', 'Kamerareul boseyo!', '看鏡頭！', 'stage'),
    S('seoyun', 'The camera is coming!', '카메라가 와요!', 'Kameraga wayo!', '鏡頭來了！', 'stage')]),
  photo: W('📸', '照片', 'photo', '사진', 'sajin', '漢字詞「寫真」→ 사진；拍照＝사진을 찍어요', [
    S('me', "Let's take a photo!", '사진 찍어요!', 'Sajin jjigeoyo!', '我們來拍照吧！', 'street'),
    S('mina', 'This photo is so pretty.', '이 사진 정말 예뻐요.', 'I sajin jeongmal yeppeoyo.', '這張照片好漂亮。', 'room')]),
  class: W('💻', '課', 'class', '수업', 'sueop', '漢字詞「授業」＝上課；線上課＝온라인 수업', [
    S('kong', 'Class starts now.', '이제 수업 시작해요.', 'Ije sueop sijakhaeyo.', '現在開始上課。', 'classroom'),
    S('me', 'I have an online class today.', '오늘 온라인 수업이 있어요.', 'Oneul ollain sueobi isseoyo.', '我今天有線上課。', 'room')]),
  question: W('❓', '問題', 'question', '질문', 'jilmun', '漢字詞「質問」＝提問；我有問題＝질문 있어요!', [
    S('seoyun', 'Can I ask a question?', '질문해도 돼요?', 'Jilmunhaedo dwaeyo?', '我可以問問題嗎？', 'room'),
    S('kong', 'Any questions?', '질문 있어요?', 'Jilmun isseoyo?', '有問題嗎？', 'classroom')]),
  answer: W('🙋', '回答', 'answer', '대답', 'daedap', '漢字詞「對答」＝回答；答對了是 정답！（正答）', [
    S('kong', 'Please answer.', '대답해 보세요.', 'Daedaphae boseyo.', '請回答看看。', 'classroom'),
    S('me', "I'll answer!", '제가 대답할게요!', 'Jega daedaphalgeyo!', '我來回答！', 'classroom')]),
  sound: W('🔊', '聲音', 'sound', '소리', 'sori', '소리＝聲音；咚咚的聲音＝쿵쿵 소리', [
    S('leo', 'What is that sound?', '이게 무슨 소리예요?', 'Ige museun soriyeyo?', '那是什麼聲音？', 'night'),
    S('me', 'Turn up the sound, please.', '소리 좀 키워 주세요.', 'Sori jom kiwo juseyo.', '請把聲音開大一點。', 'room')]),
  dark: W('🌑', '暗', 'dark', '어두워요', 'eoduwoyo', '어둡다＝暗；太暗了就開燈：불 켜요!', [
    S('me', "It's too dark!", '너무 어두워요!', 'Neomu eoduwoyo!', '太暗了！', 'night'),
    S('seoyun', 'The hallway is dark.', '복도가 어두워요.', 'Bokdoga eoduwoyo.', '走廊好暗。', 'night')]),
  door: W('🚪', '門', 'door', '문', 'mun', '漢字詞「門」→ 문；開門＝문을 열어요', [
    S('leo', 'Open the door, please!', '문 열어 주세요!', 'Mun yeoreo juseyo!', '請開門！', 'room'),
    S('me', "Don't open the door!", '문 열지 마요!', 'Mun yeolji mayo!', '不要開門！', 'night')]),
  // ── 第十二章 第一個一位 ──
  phone: W('📱', '手機', 'phone', '핸드폰', 'haendeupon', '韓國人說「hand phone」→ 핸드폰，也常說 휴대폰', [
    S('mina', 'Check your phone!', '핸드폰 봐요!', 'Haendeupon bwayo!', '看一下手機！', 'room'),
    S('me', 'Where is my phone?', '제 핸드폰 어디 있어요?', 'Je haendeupon eodi isseoyo?', '我的手機在哪裡？', 'room')]),
  news: W('📢', '消息', 'news', '소식', 'sosik', '漢字詞「消息」，跟中文一模一樣！好消息＝좋은 소식', [
    S('mina', 'I have good news!', '좋은 소식이 있어요!', 'Joeun sosigi isseoyo!', '我有好消息！', 'room'),
    S('seoyun', 'What news?', '무슨 소식이에요?', 'Museun sosigieyo?', '什麼消息？', 'room')]),
  week: W('🗓️', '週', 'week', '주', 'ju', '漢字詞「週」；這週＝이번 주、下週＝다음 주、一週＝일주일', [
    S('mina', 'This week is special.', '이번 주는 특별해요.', 'Ibeon juneun teukbyeolhaeyo.', '這週很特別。', 'room'),
    S('me', 'See you next week!', '다음 주에 봐요!', 'Daeum jue bwayo!', '下週見！', 'street')]),
  worry: W('😟', '擔心', 'worry', '걱정해요', 'geokjeonghaeyo', '걱정＝擔心；不要擔心＝걱정하지 마요', [
    S('coach', "Don't worry.", '걱정하지 마요.', 'Geokjeonghaji mayo.', '別擔心。', 'practice'),
    S('me', "I'm worried about tomorrow.", '내일이 걱정돼요.', 'Naeiri geokjeongdwaeyo.', '我擔心明天。', 'night')]),
  late: W('🕙', '晚／遲', 'late', '늦어요', 'neujeoyo', '늦다＝晚、遲到；已經很晚了＝벌써 늦었어요', [
    S('coach', "It's late. Go to sleep.", '늦었어요. 자요.', 'Neujeosseoyo. Jayo.', '很晚了，去睡吧。', 'night'),
    S('me', "Don't be late!", '늦지 마요!', 'Neutji mayo!', '不要遲到！', 'street')]),
  early: W('🌄', '早', 'early', '일찍', 'iljjik', '일찍＝早一點；早點睡＝일찍 자요', [
    S('mina', 'Go to bed early tonight.', '오늘은 일찍 자요.', 'Oneureun iljjik jayo.', '今天早點睡。', 'room'),
    S('me', 'I woke up early.', '일찍 일어났어요.', 'Iljjik ireonasseoyo.', '我很早就起床了。', 'room')]),
  win: W('🏆', '贏', 'win', '이겨요', 'igyeoyo', '이기다＝贏；音樂節目拿第一，韓國人說「1위 했어요」', [
    S('seoyun', "Let's win together!", '같이 이겨요!', 'Gachi igyeoyo!', '一起贏吧！', 'stage'),
    S('leo', 'We won!', '우리가 이겼어요!', 'Uriga igyeosseoyo!', '我們贏了！', 'stage')]),
  cry: W('😭', '哭', 'cry', '울어요', 'ureoyo', '울다＝哭；不要哭＝울지 마요；開心到哭也說 울어요', [
    S('mina', "Don't cry!", '울지 마요!', 'Ulji mayo!', '不要哭！', 'stage'),
    S('me', 'I cried because I was so happy.', '너무 기뻐서 울었어요.', 'Neomu gippeoseo ureosseoyo.', '我太開心了，所以哭了。', 'stage')]),
  best: W('👍', '最棒', 'best', '최고', 'choego', '漢字詞「最高」→ 최고；你最棒了！＝최고예요!', [
    S('leo', "You're the best!", '최고예요!', 'Choegoyeyo!', '你最棒了！', 'stage'),
    S('me', 'Our fans are the best!', '우리 팬들이 최고예요!', 'Uri paendeuri choegoyeyo!', '我們的粉絲最棒了！', 'stage')]),
  // ── 第十三章 電台與綜藝 ──
  listen: W('🎧', '聽', 'listen', '들어요', 'deureoyo', '듣다＝聽（變化成 들어요）；請聽聽看＝들어 보세요', [
    S('me', 'Please listen to our song!', '저희 노래 들어 주세요!', 'Jeohui norae deureo juseyo!', '請聽我們的歌！', 'stage'),
    S('mina', 'I listen to the radio every night.', '저는 매일 밤 라디오를 들어요.', 'Jeoneun maeil bam radioreul deureoyo.', '我每天晚上都聽廣播。', 'night')]),
  speak: W('🗣️', '說話', 'speak', '말해요', 'malhaeyo', '말＝話、語言；말하다＝說話；慢慢說＝천천히 말해요', [
    S('leo', 'Please speak slowly.', '천천히 말해 주세요.', 'Cheoncheonhi malhae juseyo.', '請慢慢說。', 'classroom'),
    S('me', 'I can speak three languages!', '저는 세 나라 말을 할 수 있어요!', 'Jeoneun se nara mareul hal su isseoyo!', '我會說三種語言！', 'stage')]),
  english: W('🔤', '英文', 'English', '영어', 'yeongeo', '漢字詞「英語」→ 영어；韓文＝한국어、中文＝중국어', [
    S('leo', 'Can you speak English?', '영어 할 수 있어요?', 'Yeongeo hal su isseoyo?', '你會說英文嗎？', 'classroom'),
    S('me', 'English is fun!', '영어는 재미있어요!', 'Yeongeoneun jaemiisseoyo!', '英文很有趣！', 'classroom')]),
  fast: W('⚡', '快', 'fast', '빨라요', 'ppallayo', '빠르다＝快（變化成 빨라요）；快一點＝빨리 해요', [
    S('coach', 'Too fast!', '너무 빨라요!', 'Neomu ppallayo!', '太快了！', 'practice'),
    S('leo', 'The subway is fast.', '지하철이 빨라요.', 'Jihacheori ppallayo.', '地鐵很快。', 'street')]),
  slow: W('🐢', '慢', 'slow', '느려요', 'neuryeoyo', '느리다＝慢；慢慢地＝천천히', [
    S('me', "I'm too slow!", '저 너무 느려요!', 'Jeo neomu neuryeoyo!', '我太慢了！', 'practice'),
    S('seoyun', 'Slow is okay. One step at a time.', '느려도 괜찮아요. 하나씩 해요.', 'Neuryeodo gwaenchanayo. Hanassik haeyo.', '慢一點也沒關係，一步一步來。', 'practice')]),
  fun: W('🎡', '好玩／有趣', 'fun', '재미있어요', 'jaemiisseoyo', '재미＝樂趣＋있어요＝有 → 有趣；無聊是 재미없어요', [
    S('leo', 'This game is fun!', '이 게임 재미있어요!', 'I geim jaemiisseoyo!', '這個遊戲好好玩！', 'room'),
    S('me', 'Today was so fun!', '오늘 정말 재미있었어요!', 'Oneul jeongmal jaemiisseosseoyo!', '今天好好玩！', 'stage')]),
  cook: W('👩‍🍳', '做菜', 'cook', '요리해요', 'yorihaeyo', '漢字詞「料理」→ 요리；做菜＝요리해요', [
    S('me', 'I will cook for you!', '제가 요리할게요!', 'Jega yorihalgeyo!', '我來做菜給你吃！', 'room'),
    S('seoyun', 'Can you cook?', '요리할 수 있어요?', 'Yorihal su isseoyo?', '你會做菜嗎？', 'room')]),
  egg: W('🥚', '蛋', 'egg', '계란', 'gyeran', '漢字詞「雞卵」→ 계란；也可以說 달걀', [
    S('me', 'Two eggs, please.', '계란 두 개 주세요.', 'Gyeran du gae juseyo.', '請給我兩顆蛋。', 'cafe'),
    S('leo', 'I like eggs.', '저는 계란을 좋아해요.', 'Jeoneun gyeraneul joahaeyo.', '我喜歡吃蛋。', 'cafe')]),
  dinner: W('🍽️', '晚餐', 'dinner', '저녁', 'jeonyeok', '저녁＝傍晚，也是晚餐；吃晚餐了嗎？＝저녁 먹었어요?', [
    S('mina', 'Did you eat dinner?', '저녁 먹었어요?', 'Jeonyeok meogeosseoyo?', '吃晚餐了嗎？', 'room'),
    S('me', "Let's eat dinner together!", '같이 저녁 먹어요!', 'Gachi jeonyeok meogeoyo!', '一起吃晚餐吧！', 'cafe')]),
  // ── 第十四章 粉絲簽名會 ──
  write: W('✍️', '寫', 'write', '써요', 'sseoyo', '쓰다＝寫（變化成 써요）；寫名字＝이름을 써요', [
    S('me', "I'll write your name.", '이름 써 줄게요.', 'Ireum sseo julgeyo.', '我幫你寫名字。', 'cafe'),
    S('mina', 'Write it in Korean.', '한국어로 써요.', 'Hangugeoro sseoyo.', '用韓文寫。', 'classroom')]),
  draw: W('🖍️', '畫', 'draw', '그려요', 'geuryeoyo', '그리다＝畫；畫出來的圖＝그림', [
    S('me', "I'll draw a heart for you.", '하트 그려 줄게요.', 'Hateu geuryeo julgeyo.', '我幫你畫一顆愛心。', 'cafe'),
    S('leo', 'Can you draw a lion?', '사자 그릴 수 있어요?', 'Saja geuril su isseoyo?', '你會畫獅子嗎？', 'room')]),
  learn: W('🎓', '學', 'learn', '배워요', 'baewoyo', '배우다＝學；我在學中文＝중국어를 배워요', [
    S('seoyun', 'I want to learn Chinese.', '중국어를 배우고 싶어요.', 'Junggugeoreul baeugo sipeoyo.', '我想學中文。', 'classroom'),
    S('me', 'I learn new words every day.', '매일 새 단어를 배워요.', 'Maeil sae daneoreul baewoyo.', '我每天都學新的單字。', 'room')]),
  letter: W('💌', '信', 'letter', '편지', 'pyeonji', '漢字詞「便紙」→ 편지；寫信＝편지를 써요', [
    S('mina', 'A letter from a fan!', '팬 편지예요!', 'Paen pyeonjiyeyo!', '是粉絲寫的信！', 'room'),
    S('me', 'I will write a letter back.', '답장 편지를 쓸게요.', 'Dapjang pyeonjireul sseulgeyo.', '我會寫回信。', 'night')]),
  read: W('👓', '讀／唸', 'read', '읽어요', 'ilgeoyo', '읽다＝讀；看書＝책을 읽어요', [
    S('me', 'I read every letter.', '편지를 다 읽어요.', 'Pyeonjireul da ilgeoyo.', '每封信我都會讀。', 'night'),
    S('kong', 'Read it out loud.', '소리 내서 읽어 보세요.', 'Sori naeseo ilgeo boseyo.', '大聲唸出來看看。', 'classroom')]),
  remember: W('💭', '記得', 'remember', '기억해요', 'gieokhaeyo', '漢字詞「記憶」→ 기억；我會記得你＝기억할게요', [
    S('me', 'I will remember you.', '기억할게요.', 'Gieokhalgeyo.', '我會記得你。', 'cafe'),
    S('seoyun', 'Do you remember?', '기억나요?', 'Gieongnayo?', '你還記得嗎？', 'room')]),
  birthday: W('🎂', '生日', 'birthday', '생일', 'saengil', '漢字詞「生日」→ 생일；生日快樂＝생일 축하해요', [
    S('me', 'Happy birthday!', '생일 축하해요!', 'Saengil chukahaeyo!', '生日快樂！', 'room'),
    S('mina', 'When is your birthday?', '생일이 언제예요?', 'Saengiri eonjeyeyo?', '你的生日是什麼時候？', 'cafe')]),
  cake: W('🍰', '蛋糕', 'cake', '케이크', 'keikeu', '外來語 cake → 케이크；做蛋糕＝케이크를 만들어요', [
    S('leo', "Let's make a cake!", '케이크 만들어요!', 'Keikeu mandeureoyo!', '我們來做蛋糕吧！', 'room'),
    S('seoyun', 'This cake is delicious!', '이 케이크 맛있어요!', 'I keikeu masisseoyo!', '這個蛋糕好好吃！', 'room')]),
  gift: W('🎁', '禮物', 'gift', '선물', 'seonmul', '漢字詞「膳物」→ 선물；這是禮物＝선물이에요', [
    S('mina', 'The fans sent a gift!', '팬들이 선물을 보냈어요!', 'Paendeuri seonmureul bonaesseoyo!', '粉絲送來了禮物！', 'room'),
    S('seoyun', 'Thank you for the gift!', '선물 고마워요!', 'Seonmul gomawoyo!', '謝謝你的禮物！', 'room')]),
  // ── 第十五章 亞洲巡演・台北場 ──
  plane: W('🛫', '飛機', 'plane', '비행기', 'bihaenggi', '漢字詞「飛行機」→ 비행기；搭飛機＝비행기를 타요', [
    S('leo', 'Our plane leaves at nine.', '비행기가 아홉 시에 출발해요.', 'Bihaenggiga ahop sie chulbalhaeyo.', '我們的飛機九點出發。', 'airport'),
    S('me', 'I like taking planes.', '저는 비행기 타는 걸 좋아해요.', 'Jeoneun bihaenggi taneun geol joahaeyo.', '我喜歡搭飛機。', 'airport')]),
  passport: W('🛂', '護照', 'passport', '여권', 'yeogwon', '漢字詞「旅券」→ 여권；出國一定要帶！', [
    S('mina', "Don't forget your passport!", '여권 잊지 마세요!', 'Yeogwon itji maseyo!', '別忘了帶護照！', 'airport'),
    S('seoyun', 'Where is my passport?!', '제 여권 어디 있어요?!', 'Je yeogwon eodi isseoyo?!', '我的護照在哪裡？！', 'airport')]),
  world: W('🌏', '世界', 'world', '세계', 'segye', '漢字詞「世界」→ 세계；世界巡演＝월드 투어', [
    S('me', 'I want to sing for fans all over the world.', '전 세계 팬들 앞에서 노래하고 싶어요.', 'Jeon segye paendeul apeseo noraehago sipeoyo.', '我想在全世界的粉絲面前唱歌。', 'stage'),
    S('leo', 'The world is so big!', '세계는 정말 넓어요!', 'Segyeneun jeongmal neolbeoyo!', '世界好大！', 'airport')]),
  dad: W('👨', '爸爸', 'dad', '아빠', 'appa', '아빠 跟「爸爸」很像；韓國人說「我爸」習慣說 우리 아빠', [
    S('me', 'Dad, I miss you!', '아빠, 보고 싶어요!', 'Appa, bogo sipeoyo!', '爸爸，我好想你！', 'room'),
    S('me', 'My dad is tall.', '우리 아빠는 키가 커요.', 'Uri appaneun kiga keoyo.', '我爸爸很高。', 'room')]),
  grandma: W('👵', '奶奶／外婆', 'grandma', '할머니', 'halmeoni', '할머니＝奶奶、外婆、阿嬤；爺爺是 할아버지', [
    S('me', "My grandma's cooking is the best.", '우리 할머니 요리가 최고예요.', 'Uri halmeoni yoriga choegoyeyo.', '我阿嬤做的菜最好吃。', 'room'),
    S('mina', 'Hello, Grandma!', '할머니, 안녕하세요!', 'Halmeoni, annyeonghaseyo!', '阿嬤好！', 'street')]),
  home: W('🏠', '家', 'home', '집', 'jip', '집＝家、房子；回家＝집에 가요', [
    S('me', "Let's go home.", '집에 가요.', 'Jibe gayo.', '我們回家吧。', 'street'),
    S('me', 'Home is the best!', '집이 최고예요!', 'Jibi choegoyeyo!', '家裡最棒了！', 'room')]),
  mountain: W('⛰️', '山', 'mountain', '산', 'san', '漢字詞「山」→ 산，念法也很像！爬山＝등산', [
    S('kong', 'There was gold in this mountain.', '이 산에는 금이 있었어요.', 'I saneneun geumi isseosseoyo.', '這座山裡以前有金子。', 'street'),
    S('leo', "Let's climb the mountain!", '산에 올라가요!', 'Sane ollagayo!', '我們去爬山吧！', 'street')]),
  gold: W('⛏️', '金子', 'gold', '금', 'geum', '漢字詞「金」→ 금；金牌＝금메달', [
    S('seoyun', 'Is this real gold?', '이거 진짜 금이에요?', 'Igeo jinjja geumieyo?', '這是真的金子嗎？', 'street'),
    S('me', 'Gold is shiny!', '금이 반짝반짝해요!', 'Geumi banjjakbanjjakhaeyo!', '金子亮晶晶的！', 'street')]),
  story: W('💬', '故事', 'story', '이야기', 'iyagi', '이야기＝故事，也是聊天；講故事＝이야기해요', [
    S('kong', 'Let me tell you an old story.', '오래된 이야기를 해 줄게요.', 'Oraedoen iyagireul hae julgeyo.', '我來講一個古老的故事。', 'street'),
    S('me', 'What a fun story!', '이야기가 정말 재미있어요!', 'Iyagiga jeongmal jaemiisseoyo!', '這個故事好有趣！', 'street')]),
  // ── 第十六章 年末頒獎典禮 ──
  winter: W('⛄', '冬天', 'winter', '겨울', 'gyeoul', '겨울＝冬天；春夏秋冬＝봄・여름・가을・겨울', [
    S('mina', 'Winter in Seoul is cold.', '서울의 겨울은 추워요.', 'Seoure gyeoureun chuwoyo.', '首爾的冬天很冷。', 'street'),
    S('me', 'I like winter.', '저는 겨울을 좋아해요.', 'Jeoneun gyeoureul joahaeyo.', '我喜歡冬天。', 'night')]),
  snow: W('❄️', '雪', 'snow', '눈', 'nun', '눈＝雪，也是「眼睛」！下雪了＝눈이 와요', [
    S('me', "It's snowing!", '눈이 와요!', 'Nuni wayo!', '下雪了！', 'street'),
    S('seoyun', 'This is the first snow!', '첫눈이에요!', 'Cheonnunieyo!', '是初雪耶！', 'night')]),
  warm: W('🧣', '溫暖', 'warm', '따뜻해요', 'ttatteuthaeyo', '따뜻하다＝溫暖；穿暖一點＝따뜻하게 입어요', [
    S('mina', 'Dress warmly.', '따뜻하게 입어요.', 'Ttatteuthage ibeoyo.', '穿暖一點。', 'street'),
    S('me', 'The tea is warm.', '차가 따뜻해요.', 'Chaga ttatteuthaeyo.', '茶暖暖的。', 'cafe')]),
  star: W('💫', '星星', 'star', '별', 'byeol', '별＝天上的星星；偶像明星多半說 스타', [
    S('me', 'Look at the stars!', '별 좀 봐요!', 'Byeol jom bwayo!', '你看星星！', 'night'),
    S('nova', 'Shine like a star!', '별처럼 빛나요!', 'Byeolcheoreom binnayo!', '像星星一樣閃耀吧！', 'stage')]),
  hand: W('✋', '手', 'hand', '손', 'son', '손＝手；牽手＝손을 잡아요；洗手＝손을 씻어요', [
    S('seoyun', 'Hold my hand.', '손 잡아요.', 'Son jabayo.', '牽著我的手。', 'stage'),
    S('me', 'Wash your hands before you eat.', '먹기 전에 손 씻어요.', 'Meokgi jeone son ssiseoyo.', '吃飯前要洗手。', 'cafe')]),
  call: W('📣', '叫（名字）', 'call', '불러요', 'bulleoyo', '부르다＝叫名字，也是「唱歌」：노래를 불러요', [
    S('me', 'The fans are calling our names!', '팬들이 우리 이름을 불러요!', 'Paendeuri uri ireumeul bulleoyo!', '粉絲們在喊我們的名字！', 'stage'),
    S('mina', 'Call me anytime.', '언제든지 불러요.', 'Eonjedeunji bulleoyo.', '隨時叫我。', 'room')]),
  award: W('🏅', '獎', 'award', '상', 'sang', '漢字詞「賞」→ 상；新人賞＝신인상、得獎＝상을 받아요', [
    S('mina', 'You got an award!', '상 받았어요!', 'Sang badasseoyo!', '你得獎了！', 'stage'),
    S('me', 'This award is for our fans.', '이 상은 팬 여러분 거예요.', 'I sangeun paen yeoreobun geoyeyo.', '這個獎是屬於粉絲們的。', 'stage')]),
  end: W('🔚', '結束／最後', 'end', '끝', 'kkeut', '끝＝結束、最後；到最後＝끝까지', [
    S('coach', 'Smile until the end!', '끝까지 웃어요!', 'Kkeutkkaji useoyo!', '笑到最後！', 'stage'),
    S('me', 'The concert is over.', '콘서트가 끝났어요.', 'Konseoteuga kkeunnasseoyo.', '演唱會結束了。', 'stage')]),
  start: W('🚦', '開始', 'start', '시작해요', 'sijakhaeyo', '漢字詞「始作」→ 시작；開始！＝시작!', [
    S('coach', "Let's start!", '시작해요!', 'Sijakhaeyo!', '開始吧！', 'practice'),
    S('me', 'A new year is starting.', '새해가 시작돼요.', 'Saehaega sijakdwaeyo.', '新的一年要開始了。', 'night')]),
};
export const LEVELS3 = [
  { id: 'd31', ch: 11, title: '第一次音樂節目', words: ['music', 'camera', 'photo'], bg: 'stage', with: 'mina',
    dialogue: [L('mina', 'Today is your first music show!', '오늘은 첫 음악 방송이에요!', 'Oneureun cheot eumak bangsongieyo!', '今天是你們第一次上音樂節目！'),
      L('me', 'Wow, there are so many cameras!', '와, 카메라가 정말 많아요!', 'Wa, kameraga jeongmal manayo!', '哇，攝影機好多！'),
      L('mina', 'When the red light is on, smile at the camera.', '빨간 불이 켜지면 카메라를 보고 웃어요.', 'Ppalgan buri kyeojimyeon kamerareul bogo useoyo.', '紅燈亮的時候，就看著鏡頭笑。'),
      L('me', 'Okay! Can we take a photo together after the show?', '네! 끝나고 같이 사진 찍어도 돼요?', 'Ne! Kkeunnago gachi sajin jjigeodo dwaeyo?', '好！表演完可以一起拍照嗎？')] },
  { id: 'd32', ch: 11, title: '待機室上課', words: ['class', 'question', 'answer'], bg: 'room', with: 'kong',
    dialogue: [L('kong', 'Who can answer this question?', '이 질문에 누가 대답할 수 있어요?', 'I jilmune nuga daedaphal su isseoyo?', '誰能回答這個問題？'),
      L('me', "Me! I'll answer!", '저요! 제가 대답할게요!', 'Jeoyo! Jega daedaphalgeyo!', '我！我來回答！'),
      L('kong', 'Good answer! You never miss a class.', '좋은 대답이에요! 수업을 한 번도 안 빠지네요.', 'Joeun daedabieyo! Sueobeul han beondo an ppajineyo.', '答得好！你一次課都沒缺過呢。'),
      L('me', 'Studying is part of my dream, too!', '공부도 제 꿈의 일부예요!', 'Gongbudo je kkumui ilbuyeyo!', '讀書也是我夢想的一部分！')] },
  { id: 'd33', ch: 11, title: '走廊的怪聲', words: ['sound', 'dark', 'door'], bg: 'night', with: 'leo',
    dialogue: [L('leo', 'Did you hear that sound?', '그 소리 들었어요?', 'Geu sori deureosseoyo?', '你聽到那個聲音了嗎？'),
      L('me', "Yes! It's so dark here. I'm scared.", '네! 여기 너무 어두워요. 무서워요.', 'Ne! Yeogi neomu eoduwoyo. Museowoyo.', '有！這裡好暗，好可怕。'),
      L('leo', "Let's open the door together.", '같이 문 열어 봐요.', 'Gachi mun yeoreo bwayo.', '我們一起打開門看看。'),
      L('me', 'Okay… one, two, three!', '좋아요… 하나, 둘, 셋!', 'Joayo… hana, dul, set!', '好…一、二、三！')] },
  { id: 'b11', ch: 11, boss: true, title: '第十一章 BOSS：打歌大作戰' },
  { id: 'd34', ch: 12, title: '一位候補', words: ['phone', 'news', 'week'], bg: 'practice', with: 'mina',
    dialogue: [L('mina', 'Look at my phone! Good news!', '제 핸드폰 좀 봐요! 좋은 소식이에요!', 'Je haendeupon jom bwayo! Joeun sosigieyo!', '看我的手機！是好消息！'),
      L('me', 'What news? Tell me, quick!', '무슨 소식이에요? 빨리 말해 줘요!', 'Museun sosigieyo? Ppalli malhae jwoyo!', '什麼消息？快告訴我！'),
      L('mina', 'This week, you are a first-place candidate!', '이번 주 1위 후보예요!', 'Ibeon ju irwi huboyeyo!', '這週你們是一位候補！'),
      L('me', "This week? Really? I can't believe it!", '이번 주요? 진짜요? 믿을 수 없어요!', 'Ibeon juyo? Jinjjayo? Mideul su eopseoyo!', '這週？真的嗎？不敢相信！')] },
  { id: 'd35', ch: 12, title: '早點睡', words: ['worry', 'late', 'early'], bg: 'night', with: 'coach',
    dialogue: [L('coach', "It's already late. Why are you here?", '벌써 늦었어요. 왜 여기 있어요?', 'Beolsseo neujeosseoyo. Wae yeogi isseoyo?', '已經很晚了，你們怎麼在這裡？'),
      L('me', "I'm worried about tomorrow…", '내일이 걱정돼요…', 'Naeiri geokjeongdwaeyo…', '我好擔心明天…'),
      L('coach', "Don't worry. Go to bed early.", '걱정하지 마요. 일찍 자요.', 'Geokjeonghaji mayo. Iljjik jayo.', '別擔心，早點睡。'),
      L('me', 'Okay. We will go to bed early tonight!', '네. 오늘은 일찍 잘게요!', 'Ne. Oneureun iljjik jalgeyo!', '好，我們今天會早點睡！')] },
  { id: 'd36', ch: 12, title: '第一個一位', words: ['win', 'cry', 'best'], bg: 'stage', with: 'seoyun',
    dialogue: [L('seoyun', 'Did we win? Is this real?', '우리가 이긴 거예요? 진짜예요?', 'Uriga igin geoyeyo? Jinjjayeyo?', '我們贏了嗎？是真的嗎？'),
      L('me', "Yes! Don't cry… or I will cry too!", '네! 울지 마요… 저도 울 것 같아요!', 'Ne! Ulji mayo… jeodo ul geot gatayo!', '對！別哭…不然我也要哭了！'),
      L('seoyun', 'Our fans are the best!', '우리 팬들이 최고예요!', 'Uri paendeuri choegoyeyo!', '我們的粉絲最棒了！'),
      L('me', 'You are the best, too. Thank you!', '서윤 씨도 최고예요. 고마워요!', 'Seoyun ssido choegoyeyo. Gomawoyo!', '徐允你也最棒了，謝謝你！')] },
  { id: 'b12', ch: 12, boss: true, title: '第十二章 BOSS：一位之路' },
  { id: 'd37', ch: 13, title: '電台初登場', words: ['listen', 'speak', 'english'], bg: 'room', with: 'leo',
    dialogue: [L('leo', 'The DJ wants you to speak English!', 'DJ가 영어로 말해 달래요!', 'Dijeiga yeongeoro malhae dallaeyo!', 'DJ 要你說英文喔！'),
      L('me', 'English? I am so nervous!', '영어요? 너무 떨려요!', 'Yeongeoyo? Neomu tteollyeoyo!', '英文？我好緊張！'),
      L('leo', 'Just speak slowly. I will listen.', '천천히 말하면 돼요. 제가 들어 볼게요.', 'Cheoncheonhi malhamyeon dwaeyo. Jega deureo bolgeyo.', '慢慢說就好，我來聽聽看。'),
      L('me', "Hi, I'm from Taiwan. Please listen to our song!", '안녕하세요, 대만에서 왔어요. 저희 노래 들어 주세요!', 'Annyeonghaseyo, daemaneseo wasseoyo. Jeohui norae deureo juseyo!', '大家好，我來自台灣。請聽我們的歌！')] },
  { id: 'd38', ch: 13, title: '兩倍速跳舞', words: ['fast', 'slow', 'fun'], bg: 'stage', with: 'seoyun',
    dialogue: [L('seoyun', 'The music is twice as fast!', '음악이 두 배로 빨라요!', 'Eumagi du baero ppallayo!', '音樂快了兩倍！'),
      L('me', "I'm too slow! Wait for me!", '저 너무 느려요! 기다려 줘요!', 'Jeo neomu neuryeoyo! Gidaryeo jwoyo!', '我太慢了！等等我！'),
      L('seoyun', "It's okay. Mistakes are fun on a variety show!", '괜찮아요. 예능에서는 실수도 재미있어요!', 'Gwaenchanayo. Yeneungeseoneun silsudo jaemiisseoyo!', '沒關係，綜藝節目裡失誤也很有趣！'),
      L('me', "You're right! This is so fun!", '맞아요! 진짜 재미있어요!', 'Majayo! Jinjja jaemiisseoyo!', '你說得對！真的好好玩！')] },
  { id: 'd39', ch: 13, title: '宿舍晚餐', words: ['cook', 'egg', 'dinner'], bg: 'room', with: 'leo',
    dialogue: [L('leo', "I'm hungry. What's for dinner?", '배고파요. 저녁은 뭐예요?', 'Baegopayo. Jeonyeogeun mwoyeyo?', '我好餓，晚餐吃什麼？'),
      L('me', 'I will cook a Taiwanese dish!', '제가 대만 요리를 할게요!', 'Jega daeman yorireul halgeyo!', '我來做一道台灣菜！'),
      L('leo', 'With eggs and tomatoes? Yummy!', '계란이랑 토마토요? 맛있겠어요!', 'Gyeranirang tomatoyo? Masitgesseoyo!', '用蛋和番茄？看起來好好吃！'),
      L('me', "Yes! Let's eat dinner together.", '네! 같이 저녁 먹어요.', 'Ne! Gachi jeonyeok meogeoyo.', '對！一起吃晚餐吧。')] },
  { id: 'b13', ch: 13, boss: true, title: '第十三章 BOSS：綜藝咖挑戰' },
  { id: 'd40', ch: 14, title: '簽名會', words: ['write', 'draw', 'learn'], bg: 'cafe', with: 'mina',
    dialogue: [L('mina', 'The fans will ask you to write their names.', '팬들이 이름을 써 달라고 할 거예요.', 'Paendeuri ireumeul sseo dallago hal geoyeyo.', '粉絲們會請你寫他們的名字。'),
      L('me', 'I will write slowly and neatly.', '천천히, 예쁘게 쓸게요.', 'Cheoncheonhi, yeppeuge sseulgeyo.', '我會慢慢地、漂亮地寫。'),
      L('mina', 'Some fans are even learning Chinese.', '어떤 팬은 중국어도 배워요.', 'Eotteon paeneun junggugeodo baewoyo.', '有些粉絲還在學中文喔。'),
      L('me', 'Really? Then I will draw a heart and write a cheer in Chinese!', '진짜요? 그럼 하트를 그리고 중국어로 응원도 써 줄게요!', 'Jinjjayo? Geureom hateureul geurigo junggugeoro eungwondo sseo julgeyo!', '真的嗎？那我要畫愛心，再用中文寫一句加油！')] },
  { id: 'd41', ch: 14, title: '粉絲的信', words: ['letter', 'read', 'remember'], bg: 'night', with: 'seoyun',
    dialogue: [L('seoyun', 'So many letters! Can you read them all?', '편지가 정말 많아요! 다 읽을 수 있어요?', 'Pyeonjiga jeongmal manayo! Da ilgeul su isseoyo?', '信好多！你全部讀得完嗎？'),
      L('me', 'Yes. I read one letter every night.', '네. 매일 밤 편지 하나씩 읽어요.', 'Ne. Maeil bam pyeonji hanassik ilgeoyo.', '可以，我每天晚上讀一封。'),
      L('seoyun', 'This fan says she remembers your first stage.', '이 팬은 첫 무대를 기억한대요.', 'I paeneun cheot mudaereul gieokhandaeyo.', '這位粉絲說，她還記得你的第一個舞台。'),
      L('me', 'I will remember her, too. I will write back!', '저도 기억할게요. 답장 쓸게요!', 'Jeodo gieokhalgeyo. Dapjang sseulgeyo!', '我也會記得她，我要回信！')] },
  { id: 'd42', ch: 14, title: '生日驚喜', words: ['birthday', 'cake', 'gift'], bg: 'room', with: 'seoyun',
    dialogue: [L('me', 'Surprise! Happy birthday, Seoyun!', '깜짝 파티! 서윤 씨, 생일 축하해요!', 'Kkamjjak pati! Seoyun ssi, saengil chukahaeyo!', '驚喜！徐允，生日快樂！'),
      L('seoyun', 'Wow! Did you make this cake?', '와! 이 케이크 직접 만들었어요?', 'Wa! I keikeu jikjeop mandeureosseoyo?', '哇！這個蛋糕是你們自己做的嗎？'),
      L('me', 'Leo and I made it. And this is your gift!', '레오랑 같이 만들었어요. 그리고 이건 선물이에요!', 'Reorang gachi mandeureosseoyo. Geurigo igeon seonmurieyo!', '我和 Leo 一起做的。還有，這是你的禮物！'),
      L('seoyun', 'A handwritten letter… This is the best gift!', '손편지… 최고의 선물이에요!', 'Sonpyeonji… choegoui seonmurieyo!', '手寫信…這是最棒的禮物！')] },
  { id: 'b14', ch: 14, boss: true, title: '第十四章 BOSS：粉絲見面大會' },
  { id: 'd43', ch: 15, title: '出發巡演', words: ['plane', 'passport', 'world'], bg: 'airport', with: 'leo',
    dialogue: [L('leo', 'Our plane leaves in one hour!', '비행기가 한 시간 후에 출발해요!', 'Bihaenggiga han sigan hue chulbalhaeyo!', '我們的飛機一小時後起飛！'),
      L('me', 'Wait! Where is my passport?', '잠깐만요! 제 여권 어디 있어요?', 'Jamkkanmanyo! Je yeogwon eodi isseoyo?', '等一下！我的護照在哪裡？'),
      L('leo', 'Here! You left it on the chair.', '여기요! 의자에 두고 갔어요.', 'Yeogiyo! Uijae dugo gasseoyo.', '在這裡！你把它忘在椅子上了。'),
      L('me', "Thank you! Let's go see the world!", '고마워요! 이제 세계로 가요!', 'Gomawoyo! Ije segyero gayo!', '謝謝你！我們出發去看世界吧！')] },
  { id: 'd44', ch: 15, title: '台北場', words: ['dad', 'grandma', 'home'], bg: 'stage', with: 'seoyun',
    dialogue: [L('seoyun', 'Who is holding up your name over there?', '저기 이름 들고 있는 분들은 누구예요?', 'Jeogi ireum deulgo inneun bundeureun nuguyeyo?', '那邊舉著你名字的是誰？'),
      L('me', 'My dad, my mom and my grandma!', '우리 아빠, 엄마, 그리고 할머니예요!', 'Uri appa, eomma, geurigo halmeoniyeyo!', '是我爸爸、媽媽，還有阿嬤！'),
      L('seoyun', 'Wow, your grandma came too!', '와, 할머니도 오셨어요!', 'Wa, halmeonido osyeosseoyo!', '哇，阿嬤也來了！'),
      L('me', "Yes! It feels like I'm home!", '네! 집에 온 것 같아요!', 'Ne! Jibe on geot gatayo!', '對！感覺好像回到家了！')] },
  { id: 'd45', ch: 15, title: '九份的黃金', words: ['mountain', 'gold', 'story'], bg: 'street', with: 'kong',
    dialogue: [L('kong', 'This mountain has a golden story.', '이 산에는 금 이야기가 있어요.', 'I saneneun geum iyagiga isseoyo.', '這座山有一個黃金的故事。'),
      L('me', 'A story about gold? Please tell me!', '금 이야기요? 들려주세요!', 'Geum iyagiyo? Deullyeojuseyo!', '黃金的故事？請講給我聽！'),
      L('kong', 'People found gold in the river first, then in the mountain.', '사람들이 강에서 먼저 금을 찾고, 그다음에 산에서 찾았어요.', 'Saramdeuri gangeseo meonjeo geumeul chatgo, geudaeume saneseo chajasseoyo.', '人們先在河裡找到金子，後來又在山裡找到。'),
      L('me', 'Wow! This mountain is full of history!', '와! 이 산은 역사가 가득해요!', 'Wa! I saneun yeoksaga gadeukhaeyo!', '哇！這座山充滿了歷史！')] },
  { id: 'b15', ch: 15, boss: true, title: '第十五章 BOSS：亞洲巡演總複習' },
  { id: 'd46', ch: 16, title: '初雪', words: ['winter', 'snow', 'warm'], bg: 'street', with: 'mina',
    dialogue: [L('mina', "Look! It's snowing!", '봐요! 눈이 와요!', 'Bwayo! Nuni wayo!', '你看！下雪了！'),
      L('me', 'My first snow in Korea! Winter is so pretty.', '한국에서 처음 보는 눈이에요! 겨울이 정말 예뻐요.', 'Hangugeseo cheoeum boneun nunieyo! Gyeouri jeongmal yeppeoyo.', '這是我在韓國看到的第一場雪！冬天好美。'),
      L('mina', "It's cold. Wear something warm.", '추워요. 따뜻하게 입어요.', 'Chuwoyo. Ttatteuthage ibeoyo.', '很冷喔，穿暖一點。'),
      L('me', 'Okay! I will make a wish on the first snow.', '네! 첫눈에 소원을 빌게요.', 'Ne! Cheonnune sowoneul bilgeyo.', '好！我要對著初雪許願。')] },
  { id: 'd47', ch: 16, title: '紅毯', words: ['star', 'hand', 'call'], bg: 'stage', with: 'nova',
    dialogue: [L('nova', 'Are you nervous? Give me your hand.', '떨려요? 손 줘 봐요.', 'Tteollyeoyo? Son jwo bwayo.', '緊張嗎？手給我。'),
      L('me', 'My hands are cold… Luna, were you nervous too?', '손이 차가워요… 루나 선배님도 떨렸어요?', 'Soni chagawoyo… Runa seonbaenimdo tteollyeosseoyo?', '我的手好冰…露娜前輩以前也會緊張嗎？'),
      L('nova', 'Of course. Listen, the fans are calling your name.', '당연하죠. 들어 봐요, 팬들이 이름을 불러요.', 'Dangyeonhajyo. Deureo bwayo, paendeuri ireumeul bulleoyo.', '當然。你聽，粉絲們在喊你們的名字。'),
      L('me', 'Wow… the lightsticks look like stars!', '와… 응원봉이 별 같아요!', 'Wa… eungwonbongi byeol gatayo!', '哇…應援棒看起來就像星星！')] },
  { id: 'd48', ch: 16, title: '新人賞', words: ['award', 'end', 'start'], bg: 'stage', with: 'seoyun',
    dialogue: [L('seoyun', 'We got the rookie award! Is this a dream?', '우리가 신인상을 받았어요! 꿈이에요?', 'Uriga sininsangeul badasseoyo! Kkumieyo?', '我們拿到新人賞了！這是夢嗎？'),
      L('me', "It's not a dream! This award is for our fans.", '꿈 아니에요! 이 상은 팬들 거예요.', 'Kkum anieyo! I sangeun paendeul geoyeyo.', '不是夢！這個獎是屬於粉絲的。'),
      L('seoyun', 'This year is coming to an end…', '올해도 이제 끝나요…', 'Olhaedo ije kkeunnayo…', '今年也快要結束了…'),
      L('me', "It's not the end. Our story starts now!", '끝이 아니에요. 우리 이야기는 이제 시작이에요!', 'Kkeuchi anieyo. Uri iyagineun ije sijagieyo!', '這不是結束，我們的故事現在才開始！')] },
  { id: 'b16', ch: 16, boss: true, title: '第三季最終 BOSS：年末舞台' },
];

export const STORIES3 = {
  d31: { kind: '新人篇', title: '第一次上音樂節目',
    panels: [P('street', [['me', 'shock'], ['seoyun', 'happy']], [['me', '와… 팬들이 우리 사진을 찍어요!', '哇…粉絲在拍我們的照片！', { shout: true, w: 'photo', hl: '사진' }]], { cap: '出道第二天，早上七點的電視台門口' }),
      P('stage', [['mina', 'smile', 'point'], ['me', 'think']], [['mina', '빨간 불이 켜진 카메라를 봐요!', '要看紅燈亮著的那台攝影機！', { w: 'camera', hl: '카메라' }]], { cap: '第一次走進音樂節目的攝影棚' }),
      P('burst', [['me', 'shock'], ['seoyun', 'happy']], [['me', '음악이 끝났는데… 뭐 하지?!', '音樂結束了…我要做什麼？！', { think: true, w: 'music', hl: '음악' }], ['seoyun', '하트! 하트 해!', '比愛心！快比愛心！', { shout: true }]], { cap: '歌曲最後一秒，鏡頭推到你面前——' })],
    fact: '韓國音樂節目每首歌結束時，攝影機會給成員一個特寫，粉絲叫它「엔딩 요정（ending 小精靈）」。很多新人第一次都緊張到忘記要做什麼表情！' },
  d32: { kind: '新人篇', title: '待機室裡的線上課',
    panels: [P('room', [['me', 'happy'], ['seoyun', 'smile']], [['me', '리허설 끝! 이제 수업 시간이에요.', '彩排結束！現在是上課時間。', { w: 'class', hl: '수업' }]], { cap: '彩排和正式播出之間，有三個小時的空檔' }),
      P('room', [['kong', 'happy', 'point'], ['me', 'think']], [['kong', '今天的問題：「一舉兩得」是什麼意思？', ''], ['me', '제가 대답할게요!', '我來回答！', { shout: true, w: 'answer', hl: '대답' }], ['me', '한 번에 두 가지를 얻어요!', '一次得到兩個好處！']], { cap: '平板裡，孔老師的線上國文課開始了' }),
      P('room', [['seoyun', 'think'], ['kong', 'happy']], [['seoyun', '저도 질문 있어요!', '我也有問題！', { w: 'question', hl: '질문' }], ['seoyun', '한국어 일거양득이랑 같아요?', '跟韓文的「一舉兩得」一樣嗎？'], ['kong', '沒錯！很多韓文成語跟中文一模一樣喔！', '']])],
    fact: '很多韓文成語跟中文一模一樣：「一舉兩得」韓文是 일거양득，「一石二鳥」是 일석이조。新人偶像打歌期很忙，但還在讀書的成員，一樣要上課、寫作業！' },
  d33: { kind: '都市傳說', title: '電視台的도깨비',
    panels: [P('night', [['leo', 'shock'], ['me', 'shock']], [['leo', 'Did you hear that?', '你有聽到嗎？'], ['me', '뚝딱뚝딱… 이상한 소리가 나요!', '咚咚鏘鏘…有奇怪的聲音！', { w: 'sound', hl: '소리' }]], { cap: '彩排完的傍晚，Leo 拉著你走進電視台地下室的走廊' }),
      P('burst', [['me', 'cry'], ['leo', 'shock']], [['me', '너무 어두워요!', '好暗喔！', { shout: true, w: 'dark', hl: '어두워요' }], ['me', '도깨비가 나올 것 같아요…', '感覺韓國妖怪要跑出來了…'], ['leo', 'Dokkaebi? The Korean goblin?', '是韓國傳說裡的那種妖怪嗎？']], { fx: '뚝딱뚝딱…' }),
      P('stage', [['mina', 'happy'], ['me', 'shock']], [['me', '문을 여니까… 무대를 만들고 있어요!', '打開門一看…原來是在搭舞台！', { w: 'door', hl: '문' }], ['mina', '내일 무대를 만드는 소리예요.', '那是在做明天舞台的聲音啦。'], ['mina', '뚝딱뚝딱! 도깨비 방망이 같죠?', '咚咚鏘鏘！很像妖怪的魔法棒吧？']], { cap: '門的另一邊，舞台工作人員正在敲敲打打' })],
    fact: '도깨비 是韓國民間故事裡的妖怪，但它不是鬼，而是愛惡作劇、愛唱歌跳舞、愛玩摔角的調皮傢伙。傳說它的魔法棒一敲「뚝딱」，就能變出金銀財寶。韓文的「뚝딱뚝딱」也是敲敲打打的聲音——電視台傳出的怪聲，其實是工作人員在搭明天的舞台！' },
  d34: { kind: '新人篇', title: '一位候補！',
    panels: [P('practice', [['mina', 'shock'], ['me', 'think']], [['mina', '핸드폰 봐요! 빨리!', '快看手機！快點！', { shout: true, w: 'phone', hl: '핸드폰' }]], { cap: '練舞練到一半，敏雅衝進練習室' }),
      P('burst', [['me', 'shock'], ['seoyun', 'shock']], [['me', '이번 주 1위 후보…? 우리가요?!', '這週的一位候補…？我們嗎？！', { shout: true, w: 'week', hl: '이번 주' }]], { fx: '一位候補！' }),
      P('practice', [['seoyun', 'cool'], ['me', 'happy']], [['seoyun', '좋은 소식이네. 평소처럼 하자.', '是好消息。我們照平常那樣就好。', { w: 'news', hl: '소식' }], ['me', '응! 평소처럼!', '嗯！照平常那樣！']])],
    fact: '韓國音樂節目每週會選出 2～3 組「1위 후보（一位候補）」，再加總音源、播放次數和觀眾投票等分數，決定誰拿一位。出道不久就當上候補，是很大的鼓勵！' },
  d35: { kind: '新人篇', title: '早點睡也是練習',
    panels: [P('practice', [['me', 'cry'], ['seoyun', 'think']], [['me', '내일 1위 발표인데… 너무 걱정돼요.', '明天就要公布一位了…我好擔心。', { w: 'worry', hl: '걱정돼요' }]], { cap: '晚上九點半，兩個人偷偷回到練習室' }),
      P('practice', [['coach', 'cool'], ['me', 'shock']], [['coach', '늦었어요! 오늘 연습은 끝!', '很晚了！今天的練習結束！', { shout: true, w: 'late', hl: '늦었어요' }]]),
      P('room', [['coach', 'smile'], ['seoyun', 'happy']], [['coach', '일찍 자는 것도 연습이에요.', '早點睡也是練習。', { w: 'early', hl: '일찍' }], ['coach', '몸이 다 기억해요.', '你們的身體都記得。'], ['seoyun', '네! 안녕히 주무세요!', '好！教練晚安！']])],
    fact: '睡覺的時候，大腦會整理白天練過的動作和學過的東西，所以睡飽真的會讓舞跳得更好、單字記得更牢。韓國也有法律保護未成年藝人：限制每週的工作時間、不能隨便讓他們工作到深夜，還要保障他們上學、睡覺和休息的權利。' },
  d36: { kind: '新人篇・精彩', title: '第一個一位',
    panels: [P('stage', [['seoyun', 'gentle'], ['me', 'cry']], [['seoyun', '이기든 지든, 우리는 끝까지 같이야.', '不管贏還是輸，我們都會一起到最後。', { w: 'win', hl: '이기든' }]], { cap: '公布一位前，你們在舞台上緊緊牽著手' }),
      P('burst', [['me', 'cry'], ['seoyun', 'cry']], [['seoyun', '우리야! 우리가 1위야!', '是我們！我們是一位！', { shout: true }], ['me', '울면 안 되는데… 눈물이 나요!', '不能哭的…可是眼淚一直掉！', { w: 'cry', hl: '울면' }]], { fx: '1위！' }),
      P('stage', [['me', 'love', 'cheer'], ['mina', 'cry']], [['me', '팬 여러분, 고마워요!', '粉絲們，謝謝你們！'], ['me', '여러분이 최고예요!', '你們最棒了！', { shout: true, w: 'best', hl: '최고' }], ['mina', '앵콜 무대예요! 마음껏 노래해요!', '安可舞台！盡情地唱吧！']], { cap: '安可舞台，台下的應援聲比音樂還大聲' })],
    fact: '在音樂節目拿到一位後，會再唱一次「앵콜 무대（安可舞台）」，很多偶像都是邊哭邊笑地唱完。第一次拿一位，韓文叫「첫 1위」，是每個新人最難忘的一天！' },
  d37: { kind: '綜藝篇', title: '第一次上電台',
    panels: [P('room', [['leo', 'happy', 'point'], ['me', 'think']], [['leo', 'Just speak slowly. You can do it!', '慢慢說就好，你可以的！'], ['me', '네, 천천히 말해 볼게요!', '好，我慢慢說說看！', { w: 'speak', hl: '말해' }]], { cap: '電台直播前，Leo 陪你練英文自我介紹' }),
      P('burst', [['me', 'shock']], [['me', '영어로요? 지금요?!', '用英文？現在嗎？！', { shout: true, w: 'english', hl: '영어' }]], { cap: '直播中，DJ 突然說：「請用英文跟大家打招呼！」' }),
      P('room', [['me', 'cool'], ['leo', 'love']], [['me', "Hi! I'm from Taiwan. Please listen to our song!", '大家好！我來自台灣。請聽我們的歌！', { w: 'listen', hl: 'listen' }], ['leo', 'Perfect!', '太完美了！', { shout: true }]])],
    fact: '韓國的「보이는 라디오（看得見的電台）」會一邊廣播、一邊直播錄音室的畫面，偶像常在節目裡用好幾種語言打招呼。說外語不用怕說錯，慢慢說、笑著說，聽的人都感受得到你的用心！' },
  d38: { kind: '綜藝篇', title: '兩倍速跳舞挑戰',
    panels: [P('practice', [['coach', 'cool'], ['me', 'shock']], [['coach', '2배속 댄스는 진짜 빨라요!', '兩倍速跳舞真的很快！', { w: 'fast', hl: '빨라요' }], ['coach', '기본 동작부터 해요.', '先從基本動作開始。']], { cap: '綜藝節目錄影前一天，練習室' }),
      P('burst', [['me', 'cry'], ['seoyun', 'cool']], [['me', '저만 느려요! 다리가 꼬였어요!', '只有我好慢！腳打結了！', { shout: true, w: 'slow', hl: '느려요' }]], { cap: '錄影當天，音樂一開就是兩倍速', fx: '2倍速！' }),
      P('stage', [['seoyun', 'happy'], ['me', 'happy']], [['seoyun', '괜찮아! 다들 웃잖아.', '沒關係！大家都在笑啊。'], ['me', '맞아요, 진짜 재미있어요!', '對啊，真的好好玩！', { w: 'fun', hl: '재미있어요' }]])],
    fact: '「2배속 댄스（兩倍速跳舞）」是韓國綜藝節目的經典挑戰：把歌曲加快兩倍，看偶像能不能跟上。跳錯也沒關係，綜藝節目最重要的是讓大家開心——笑著面對失誤，也是一種實力！' },
  d39: { kind: '綜藝篇', title: '宿舍實境秀：番茄炒蛋',
    panels: [P('room', [['me', 'think'], ['leo', 'shock']], [['me', '계란이랑 토마토밖에 없어요…', '只剩下蛋和番茄…', { think: true, w: 'egg', hl: '계란' }]], { cap: '實境節目在宿舍拍攝，打開冰箱——' }),
      P('room', [['me', 'cool', 'cheer'], ['leo', 'happy']], [['me', '제가 요리할게요!', '我來做菜！', { shout: true, w: 'cook', hl: '요리' }], ['me', '대만식 토마토 계란 볶음!', '台灣的番茄炒蛋！']]),
      P('room', [['seoyun', 'love'], ['leo', 'love']], [['seoyun', '오늘 저녁 진짜 맛있어!', '今天的晚餐真的好好吃！', { w: 'dinner', hl: '저녁' }], ['leo', 'Best dinner ever!', '史上最棒的晚餐！']], { cap: '當天的晚餐時間' })],
    fact: '「番茄炒蛋」是很多台灣家庭的家常菜，簡單又營養：蛋有蛋白質、番茄有維生素。正在長大的偶像要吃飽、吃均衡，自己學會做幾道簡單的菜，也是很棒的生活能力！' },
  d40: { kind: '粉絲篇', title: '第一次簽名會',
    panels: [P('cafe', [['me', 'happy']], [['me', '와 줘서 고마워요! 이름 써 줄게요.', '謝謝你來！我幫你寫名字。', { w: 'write', hl: '써 줄게요' }]], { cap: '第一次粉絲簽名會，一個國中女生害羞地遞上專輯' }),
      P('cafe', [['me', 'love']], [['me', '한 장이면 충분해요!', '一張就很夠了！'], ['me', '중국어를 배워요? 대단해요!', '你在學中文？好厲害！', { w: 'learn', hl: '배워요' }]], { cap: '她小聲說：「我只買得起一張…還有，我在學中文！」' }),
      P('cafe', [['seoyun', 'happy'], ['me', 'happy']], [['seoyun', '나도 하트 그려 줄게!', '我也幫你畫一顆愛心！', { w: 'draw', hl: '그려' }], ['me', '우리 같이 열심히 해요!', '我們一起加油吧！']])],
    fact: '「팬사인회（粉絲簽名會）」上，偶像會在專輯上簽名，再跟每位粉絲聊幾十秒。偶像最希望粉絲開心、健康地追星：不用為了見偶像買很多專輯，量力而為的粉絲才是最帥的粉絲！' },
  d41: { kind: '粉絲篇', title: '一封粉絲信',
    panels: [P('room', [['mina', 'happy'], ['me', 'shock']], [['mina', '이거 다 팬들이 쓴 편지예요!', '這些全部都是粉絲寫的信！', { w: 'letter', hl: '편지' }]], { cap: '簽名會結束後，敏雅搬來一個大箱子' }),
      P('night', [['me', 'cry']], [['me', '이 편지, 읽고 또 읽었어요.', '這封信，我讀了一遍又一遍。', { think: true, w: 'read', hl: '읽고' }]], { cap: '一封台灣小粉絲的信：「看了你的舞台，我也想變勇敢。」' }),
      P('night', [['seoyun', 'gentle'], ['me', 'happy']], [['seoyun', '오늘 이 마음, 꼭 기억하자.', '今天的這份心情，一定要記住。', { w: 'remember', hl: '기억하자' }], ['me', '응. 답장 쓰고 일찍 잘게!', '嗯，我寫完回信就早點睡！']])],
    fact: '很多偶像會在宿舍讀粉絲寫的信，有些還會在直播裡回應。寫信給喜歡的人時，最打動人的不是昂貴的禮物，而是真心的話——你也可以試著用韓文或英文寫一張小卡片！' },
  d42: { kind: '粉絲篇', title: '徐允的生日',
    panels: [P('room', [['leo', 'happy'], ['me', 'think']], [['leo', "Let's bake a cake for Seoyun!", '我們來幫徐允烤一個蛋糕吧！', { w: 'cake', hl: 'cake' }]], { cap: '徐允生日前一天，你和 Leo 偷偷借了公司的廚房' }),
      P('burst', [['seoyun', 'shock'], ['me', 'happy', 'cheer']], [['me', '서윤아, 생일 축하해!', '徐允，生日快樂！', { shout: true, w: 'birthday', hl: '생일' }]], { cap: '生日當天，燈一關——', fx: '驚喜！' }),
      P('room', [['mina', 'happy'], ['seoyun', 'cry']], [['mina', '팬들도 선물을 보냈어요.', '粉絲也送了禮物喔。', { w: 'gift', hl: '선물' }], ['mina', '서윤 씨 이름으로 기부했대요!', '他們用你的名字去捐款了！'], ['seoyun', '…최고의 생일이야.', '…這是最棒的生日。']], { cap: '粉絲用徐允的名字，捐款給動物收容所' })],
    fact: '韓國粉絲很流行在偶像生日時「用偶像的名字做好事」，像是捐款給動物收容所、一起種一片樹林。對偶像來說，這種禮物最珍貴，因為粉絲把愛分享給了更多人。' },
  d43: { kind: '巡演篇', title: '出發！亞洲巡演',
    panels: [P('airport', [['me', 'shock'], ['seoyun', 'think']], [['me', '여권이… 없어요!', '護照…不見了！', { shout: true, w: 'passport', hl: '여권' }]], { cap: '亞洲巡演出發的早上，機場' }),
      P('airport', [['leo', 'happy', 'wave'], ['me', 'cry']], [['leo', 'Found it! Now we can get on the plane!', '找到了！現在可以上飛機了！', { w: 'plane', hl: 'plane' }]], { cap: '這次巡演，Leo 被選為伴舞，一起出發' }),
      P('airport', [['me', 'happy', 'wave'], ['seoyun', 'smile']], [['me', '팬 여러분, 천천히 오세요!', '粉絲們，慢慢走，別跑喔！'], ['me', '세계 어디서든 또 만나요!', '我們在世界各地再見！', { w: 'world', hl: '세계' }]])],
    fact: '偶像出國時，常有粉絲到機場送機。最貼心的粉絲會保持距離、不推擠，讓偶像和其他旅客都能安全通過。出國前記得再檢查一次：護照、錢包、手機都帶了嗎？' },
  d44: { kind: '巡演篇・精彩', title: '台北場：家人在台下',
    panels: [P('stage', [['me', 'shock']], [['me', '저기… 우리 아빠예요!', '那邊…是我爸爸！', { shout: true, w: 'dad', hl: '아빠' }]], { cap: '亞洲巡演最後一站：台北小巨蛋' }),
      P('stage', [['seoyun', 'happy'], ['me', 'cry']], [['seoyun', '할머니가 손을 흔드셔! 빨리 인사해!', '阿嬤在跟你揮手！快打招呼！', { w: 'grandma', hl: '할머니' }], ['me', '台北，我回來了！', '', { shout: true }]], { cap: '阿嬤特地從台南搭高鐵上來，手上舉著自己做的手幅' }),
      P('room', [['me', 'love'], ['seoyun', 'love']], [['me', '할머니가 만든 루러우판이에요!', '是阿嬤做的滷肉飯！'], ['me', '집에 온 것 같아요.', '感覺好像回到家了。', { w: 'home', hl: '집' }], ['seoyun', '진짜 맛있다…!', '真的好好吃…！']], { cap: '表演結束，後台出現一個熟悉的保溫袋' })],
    fact: '韓團的海外巡演常常會到台北開唱，台北小巨蛋就是很多 K-pop 演唱會的場地。對從台灣出發的偶像來說，在家鄉的舞台上看到家人，是最特別的一場演出！' },
  d45: { kind: '都市傳說・台灣歷史', title: '九份的黃金傳說',
    panels: [P('street', [['seoyun', 'shock'], ['me', 'happy']], [['seoyun', '이 산에 진짜 금이 있었어요?', '這座山裡真的有過金子嗎？', { w: 'mountain', hl: '산' }]], { cap: '巡演後的休假日，和孔老師一起來到九份' }),
      P('street', [['kong', 'happy', 'point'], ['leo', 'shock']], [['kong', '1890 年，工人在基隆河蓋鐵路橋，在河裡發現了砂金！', ''], ['kong', '大家順著河往上游找，在九份、金瓜石的山裡找到金礦。', ''], ['leo', '금이요? 진짜 금?!', '金子？真的金子？！', { shout: true, w: 'gold', hl: '금' }]]),
      P('night', [['kong', 'smile'], ['seoyun', 'love']], [['kong', '傳說很久以前，這裡只住了九戶人家。', ''], ['kong', '每次採買都要買「九份」，所以叫九份！', ''], ['seoyun', '이야기가 정말 재미있어요!', '這個故事好有趣！', { w: 'story', hl: '이야기' }]], { cap: '晚上，老街的紅燈籠一盞一盞亮起來' })],
    fact: '1890 年，工人在基隆河蓋鐵路橋時發現砂金，掀起一陣淘金熱，後來在九份、金瓜石的山裡找到金礦。日治時期九份非常熱鬧，被叫做「小香港」。後來金礦停止開採，九份變成現在的老街和觀光景點；金瓜石的黃金博物館裡，還有一塊 220 公斤的大金磚可以摸摸看！' },
  d46: { kind: '頒獎典禮篇', title: '首爾的初雪',
    panels: [P('street', [['seoyun', 'love'], ['me', 'shock']], [['seoyun', '눈이다! 첫눈이야!', '下雪了！是初雪！', { shout: true, w: 'snow', hl: '눈' }]], { cap: '十二月，首爾下起今年的第一場雪' }),
      P('street', [['mina', 'happy'], ['me', 'love']], [['mina', '이번 겨울, 신인상 후보가 됐어요!', '這個冬天，你們入圍新人賞了！', { w: 'winter', hl: '겨울' }]]),
      P('night', [['mina', 'gentle'], ['me', 'happy']], [['mina', '시상식 전에 감기 걸리면 안 돼요.', '頒獎典禮前可不能感冒喔。'], ['mina', '따뜻하게 입어요!', '要穿暖一點！', { w: 'warm', hl: '따뜻하게' }], ['me', '네! 목도리 고마워요!', '好！謝謝你的圍巾！']])],
    fact: '韓國有個浪漫的說法：「첫눈（初雪）落下時許願，願望就會實現。」首爾的冬天常常是零下好幾度，偶像們都要記得戴圍巾、多喝溫水，好好保護身體和喉嚨！' },
  d47: { kind: '頒獎典禮篇', title: '紅毯上的星星',
    panels: [P('stage', [['me', 'shock'], ['seoyun', 'happy']], [['me', '팬들이 우리 이름을 불러요!', '粉絲們在喊我們的名字！', { shout: true, w: 'call', hl: '불러요' }]], { cap: '年末頒獎典禮，第一次走紅毯' }),
      P('room', [['nova', 'gentle'], ['me', 'cry']], [['nova', '저도 신인 때 손이 떨렸어요.', '我當新人的時候，手也在抖。'], ['nova', '떨리면 서로 손을 잡아요.', '緊張的話，就牽著彼此的手。', { w: 'hand', hl: '손을 잡아요' }]], { cap: '後台走廊，露娜前輩在等你' }),
      P('stage', [['me', 'love'], ['seoyun', 'love']], [['me', '응원봉이… 별처럼 반짝여요.', '應援棒…像星星一樣閃閃發亮。', { w: 'star', hl: '별' }], ['seoyun', '우리 팬들이야.', '那是我們的粉絲。']], { cap: '坐在藝人席往上看，是一整片星海' })],
    fact: '頒獎典禮開始前，藝人會先走「紅毯」，接受拍照和訪問。台下的粉絲揮著應援棒、喊著成員的名字，從舞台上看過去，就像一整片星海！' },
  d48: { kind: '頒獎典禮篇・精彩', title: '新人賞',
    panels: [P('stage', [['nova', 'smile'], ['me', 'shock']], [['nova', '올해의 신인상은… 바로 여러분이에요!', '今年的新人賞…就是你們！', { shout: true, w: 'award', hl: '신인상' }]], { cap: '頒獎人是露娜，她打開信封，對你們笑了' }),
      P('burst', [['me', 'cry'], ['seoyun', 'cry']], [['me', '팬 여러분, 감사합니다.', '粉絲們，謝謝大家。'], ['me', '이건 끝이 아니에요.', '這不是結束。', { w: 'end', hl: '끝' }], ['me', '우리 이야기는 지금부터 시작이에요!', '我們的故事，從現在才開始！', { shout: true, w: 'start', hl: '시작' }]], { cap: '得獎感言' }),
      P('stage', [['mina', 'cry'], ['coach', 'smile']], [['mina', '우리 애들이 신인상을 받았어요…!', '我們家的孩子拿到新人賞了…！'], ['coach', '이제부터가 진짜 시작이에요.', '從現在起，才是真正的開始。']], { cap: '台下的敏雅和姜教練；台灣的家裡，爸爸、媽媽和阿嬤也在看直播' })],
    fact: '「신인상（新人賞）」只頒給剛出道的新人，所以偶像們常說它是「一生只有一次的獎」。拿到新人賞不是終點，而是代表：從今天開始，大家都記住你們的名字了！' },
};

export const TEASERS3 = {
  d31: '回到待機室，桌上的平板突然響起視訊鈴聲——是孔老師！「上課時間到囉！」',
  d32: '下課後，Leo 跑來待機室：「地下室的走廊，一直傳出很奇怪的聲音…」',
  d33: '下週的音樂節目錄完，敏雅盯著手機，突然大叫一聲…',
  b11: '第十二章：你們的名字，竟然出現在「一位候補」的名單上…',
  d34: '一位公布的前一晚，你們兩個怎麼樣都睡不著，偷偷溜回練習室…',
  d35: '公布一位的時刻到了。主持人打開信封：「這週的一位是——」',
  d36: '拿到一位的隔天，電台節目打電話來邀請你們…還說要用英文自我介紹！',
  b12: '第十三章：上電台、上綜藝！要用英文打招呼，還要挑戰兩倍速跳舞？',
  d37: '下一個通告是綜藝節目，題目是…「兩倍速跳舞挑戰」？！',
  d38: '製作人說：「下一集要拍你們在宿舍的一天。」可是冰箱裡只剩下雞蛋和番茄…',
  d39: '節目播出後，公司宣布：「第一次粉絲簽名會，就在這個週末！」',
  b13: '第十四章：第一次粉絲簽名會！排隊的粉絲裡，有一個跟你差不多大的女孩…',
  d40: '簽名會結束後，敏雅搬來一個大箱子：「這些，全部都是給你們的信。」',
  d41: '回信寫到一半，你瞄到月曆上畫了一個大愛心——明天是徐允的生日！',
  d42: '派對結束時，敏雅宣布：「你們的第一次亞洲巡演，最後一站是台北！」',
  b14: '第十五章：亞洲巡演出發！最後一站——台北，你長大的地方。',
  d43: '東京、曼谷…最後一站台北。開場前，你從布幕縫隙偷看，看到一面寫著你名字的手幅…',
  d44: '隔天放假，孔老師傳訊息來：「要不要來九份？那座山裡藏著黃金的傳說喔。」',
  d45: '回到首爾，窗外飄下今年的第一場雪…敏雅拿著手機跑過來。',
  b15: '第十六章：年末頒獎典禮！入圍名單上，出現了你們的名字…',
  d46: '頒獎典禮當天，紅毯的另一頭，有個熟悉的身影在對你揮手…',
  d47: '新人賞的頒獎人走上台——竟然是露娜！她慢慢打開信封…',
  d48: '第三季完結！下一季：新的一年、第一次回歸，還有一首新歌的祕密…',
  b16: '第四季即將開始：拿到新人賞的你們，第一次「回歸」會是什麼樣子？',
};

export const INTROS3 = {
  d31: '倒帶回上台前：敏雅帶你們走進攝影棚，你第一次看到這麼多攝影機。',
  d32: '線上課開始了，孔老師在平板裡出了一道題目。',
  d33: '黑漆漆的走廊盡頭有一扇門，Leo 拉了拉你的袖子。',
  d34: '敏雅舉著手機衝進練習室，上氣不接下氣。',
  d35: '練習室的燈突然亮了，姜教練站在門口。',
  d36: '安可舞台結束，回到後台，徐允還在掉眼淚。',
  d37: '直播開始前，Leo 陪你在錄音室外面做最後的練習。',
  d38: '音樂一下，速度快到嚇人，徐允轉頭對你喊——',
  d39: '實境節目的攝影機還在拍，Leo 摸著肚子走進廚房。',
  d40: '簽名會開始前，敏雅先跟你說明等一下要做什麼。',
  d41: '睡前，徐允看著你桌上堆成小山的信。',
  d42: '燈重新打開，徐允看著蛋糕，眼睛紅紅的。',
  d43: '機場大廳裡，Leo 看了看手錶。',
  d44: '開場前，徐允從布幕縫隙往觀眾席指了指。',
  d45: '站在九份的山路上，孔老師指著遠方的山。',
  d46: '走出公司大樓，敏雅突然停下腳步，指著天空。',
  d47: '紅毯走完，露娜前輩在後台走廊等著你。',
  d48: '走下舞台，徐允緊緊抱著獎盃，聲音還在發抖。',
};

export const KEEPSAKES3 = {
  d31: { kind: 'scene', name: '劇照・第一次 ending 小精靈', rarity: 'R' },
  d32: { kind: 'item', name: '待機室筆記本', emoji: '📓', desc: '寫滿成語和韓文漢字詞的小筆記本', rarity: 'R' },
  d33: { kind: 'item', name: '뚝딱 小木槌', emoji: '🔨', desc: '舞台工作人員送你的迷你木槌，敲一下就「뚝딱」！', rarity: 'R' },
  d34: { kind: 'scene', name: '劇照・一位候補！', rarity: 'R' },
  d35: { kind: 'item', name: '教練的晚安紙條', emoji: '🌙', desc: '「早點睡也是練習。」——姜教練', rarity: 'R' },
  d36: { kind: 'item', name: '第一座一位獎盃', emoji: '🏆', desc: '人生第一個一位！獎盃上還留著你們的眼淚', rarity: 'SSR' },
  d37: { kind: 'item', name: '電台來賓證', emoji: '📻', desc: '第一次上電台的來賓證', rarity: 'R' },
  d38: { kind: 'scene', name: '劇照・兩倍速跳舞挑戰', rarity: 'R' },
  d39: { kind: 'item', name: '番茄炒蛋食譜卡', emoji: '🍅', desc: '手寫的台灣家常菜食譜，Leo 說他也要學', rarity: 'R' },
  d40: { kind: 'item', name: '第一支簽名筆', emoji: '🖊️', desc: '第一次簽名會用的筆，畫了好多顆愛心', rarity: 'SR' },
  d41: { kind: 'item', name: '台灣小粉絲的信', emoji: '💌', desc: '「看了你的舞台，我也想變勇敢。」', rarity: 'SR' },
  d42: { kind: 'item', name: '手作生日蛋糕', emoji: '🍰', desc: '你和 Leo 一起做的，有點歪但超好吃', rarity: 'R' },
  d43: { kind: 'item', name: '巡演行李吊牌', emoji: '🧳', desc: '寫著「ASIA TOUR」的行李吊牌', rarity: 'R' },
  d44: { kind: 'item', name: '阿嬤做的手幅', emoji: '🎏', desc: '阿嬤一針一線縫的，上面寫著你的名字', rarity: 'SR' },
  d45: { kind: 'item', name: '九份紅燈籠吊飾', emoji: '🏮', desc: '和孔老師、徐允、Leo 一起逛九份時買的', rarity: 'R' },
  d46: { kind: 'item', name: '奶茶色圍巾', emoji: '🧣', desc: '敏雅送的，跟出道服一樣是奶茶色', rarity: 'R' },
  d47: { kind: 'scene', name: '劇照・紅毯上的星海', rarity: 'SR' },
  d48: { kind: 'scene', name: '劇照・新人賞', rarity: 'SSR' },
};
