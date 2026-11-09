// 第二季「練習生日記」：第 13～30 天（6 章、54 個新字）
// 主線：通過試鏡 → 練習生宿舍 → 對手徐允 → 月末評價 → 首爾生活 → 出道舞台
// 都市傳說穿插：午夜練習室鏡子、安平劍獅（台灣歷史）、晚上不能剪指甲
// 新角色：seoyun 徐允（同期練習生，高馬尾，嘴硬心軟的對手）、coach 姜教練（舞蹈老師）

const S = (who, en, ko, kr, zh, bg) => ({ who, en, ko, kr, zh, bg });
const L = (c, en, ko, kr, zh) => ({ c, en, ko, kr, zh });
const P = (bg, cast, say, extra = {}) => ({ bg, cast: cast.map(([c, e, pose]) => ({ c, e, pose })), say: say.map(([c, t, sub, opt]) => ({ c, t, sub, ...opt })), ...extra });
const W = (emoji, zh, en, ko, kr, note, scenes) => ({ emoji, zh, en, ko, kr, note, scenes });

export const CHAPTERS2 = [
  { id: 5, title: '練習生報到', emoji: '🏠', bg: 'room', desc: '搬進練習生宿舍，遇見實力超強的徐允' },
  { id: 6, title: '地獄訓練', emoji: '💪', bg: 'practice', desc: '早起、練舞、吃飽、受傷也要學會休息' },
  { id: 7, title: '回家・台灣篇', emoji: '🏮', bg: 'street', desc: '中秋放假，帶徐允和 Leo 認識台灣' },
  { id: 8, title: '月末評價', emoji: '🏆', bg: 'stage', desc: '對手變隊友，一起挑戰第一次月末評價' },
  { id: 9, title: '首爾生活', emoji: '🚇', bg: 'street', desc: '地鐵、雨天、便利商店，一個人也能生活' },
  { id: 10, title: '出道舞台', emoji: '🌟', bg: 'stage', desc: '奶茶色的出道服，夢想終於實現' },
];

export const WORDS2 = {
  // ── 第五章 練習生報到 ──
  nicetomeet: W('😊', '很高興認識你', 'nice to meet you', '반가워요', 'bangawoyo', '반갑다＝見到很高興；更有禮貌的說法是 반갑습니다', [
    S('seoyun', 'Nice to meet you. I am Seoyun.', '반가워요. 저는 서윤이에요.', 'Bangawoyo. Jeoneun Seoyunieyo.', '很高興認識你，我是徐允。', 'room'),
    S('me', 'Nice to meet you, coach!', '코치님, 반갑습니다!', 'Kochinim, bangapseumnida!', '教練，很高興認識您！', 'practice')]),
  room: W('🚪', '房間', 'room', '방', 'bang', '방＝房間；練習室叫 연습실', [
    S('mina', 'This is your room.', '여기가 방이에요.', 'Yeogiga bangieyo.', '這裡是你的房間。', 'room'),
    S('me', 'My room is small but cute.', '제 방은 작지만 귀여워요.', 'Je bangeun jakjiman gwiyeowoyo.', '我的房間很小但很可愛。', 'room')]),
  together: W('👭', '一起', 'together', '같이', 'gachi', '같이 念起來像「卡七」，意思跟 함께 一樣', [
    S('seoyun', "Let's practice together.", '같이 연습해요.', 'Gachi yeonseuphaeyo.', '一起練習吧。', 'practice'),
    S('me', "Let's eat together!", '같이 밥 먹어요!', 'Gachi bap meogeoyo!', '一起吃飯吧！', 'cafe')]),
  mirror: W('🪞', '鏡子', 'mirror', '거울', 'geoul', '練習室整面牆都是 거울，看著鏡子練動作', [
    S('coach', 'Look at the mirror.', '거울을 보세요.', 'Geoureul boseyo.', '看著鏡子。', 'practice'),
    S('me', 'The mirror is so big!', '거울이 정말 커요!', 'Geouri jeongmal keoyo!', '鏡子好大！', 'practice')]),
  practice: W('💪', '練習', 'practice', '연습', 'yeonseup', '練習生＝연습생，就是「練習的學生」', [
    S('coach', 'Practice every day.', '매일 연습하세요.', 'Maeil yeonseuphaseyo.', '每天都要練習。', 'practice'),
    S('seoyun', 'I practice for five hours.', '저는 다섯 시간 연습해요.', 'Jeoneun daseot sigan yeonseuphaeyo.', '我練習五個小時。', 'practice')]),
  again: W('🔁', '再一次', 'again', '다시', 'dasi', '老師最常說的話：다시！＝再來一次！', [
    S('coach', 'One more time!', '다시 한 번!', 'Dasi han beon!', '再一次！', 'practice'),
    S('me', 'Please say it again.', '다시 말해 주세요.', 'Dasi malhae juseyo.', '請再說一次。', 'classroom')]),
  night: W('🌙', '晚上', 'night', '밤', 'bam', '밤＝夜晚；晚安是 잘 자요（好好睡）', [
    S('leo', 'It is late at night.', '밤이 늦었어요.', 'Bami neujeosseoyo.', '夜深了。', 'night'),
    S('me', 'Good night!', '잘 자요!', 'Jal jayo!', '晚安！', 'room')]),
  scary: W('😱', '可怕', 'scary', '무서워요', 'museowoyo', '무섭다＝可怕；我好怕就說 무서워요!', [
    S('me', 'This story is scary!', '이 이야기 무서워요!', 'I iyagi museowoyo!', '這個故事好可怕！', 'night'),
    S('leo', "Don't be scared!", '무서워하지 마세요!', 'Museowohaji maseyo!', '不要怕！', 'night')]),
  light: W('💡', '燈', 'light', '불', 'bul', '불＝火、燈；開燈＝불을 켜요、關燈＝불을 꺼요', [
    S('seoyun', 'Turn on the light, please.', '불 좀 켜 주세요.', 'Bul jom kyeo juseyo.', '請開一下燈。', 'night'),
    S('me', 'The light went out!', '불이 꺼졌어요!', 'Buri kkeojyeosseoyo!', '燈熄了！', 'night')]),
  // ── 第六章 地獄訓練 ──
  morning: W('☀️', '早上', 'morning', '아침', 'achim', '아침＝早上，也有「早餐」的意思', [
    S('coach', 'Practice starts in the morning.', '아침에 연습을 시작해요.', 'Achime yeonseubeul sijakhaeyo.', '早上開始練習。', 'practice'),
    S('me', 'Good morning!', '좋은 아침이에요!', 'Joeun achimieyo!', '早安！', 'room')]),
  sleep: W('😴', '睡覺', 'sleep', '자요', 'jayo', '자다＝睡；晚安＝잘 자요（睡好覺）', [
    S('mina', 'Go to sleep early.', '일찍 자요.', 'Iljjik jayo.', '早點睡。', 'room'),
    S('me', 'I want to sleep more.', '더 자고 싶어요.', 'Deo jago sipeoyo.', '我想再睡一下。', 'room')]),
  tired: W('🥱', '累', 'tired', '피곤해요', 'pigonhaeyo', '피곤＝疲困；累了就說 피곤해요', [
    S('me', "I'm so tired.", '너무 피곤해요.', 'Neomu pigonhaeyo.', '我好累。', 'practice'),
    S('seoyun', 'Are you tired?', '피곤해요?', 'Pigonhaeyo?', '你累了嗎？', 'practice')]),
  rice: W('🍚', '飯', 'rice / meal', '밥', 'bap', '밥＝飯，也泛指一餐；韓國人打招呼常問「밥 먹었어요?（吃飯了嗎）」', [
    S('mina', 'Did you eat?', '밥 먹었어요?', 'Bap meogeosseoyo?', '吃飯了嗎？', 'cafe'),
    S('me', 'Rice and kimchi, please.', '밥하고 김치 주세요.', 'Bapago gimchi juseyo.', '請給我飯和泡菜。', 'cafe')]),
  eat: W('🥢', '吃', 'eat', '먹어요', 'meogeoyo', '먹다＝吃；開動前說 잘 먹겠습니다（我會好好吃的）', [
    S('leo', "Let's eat!", '먹어요!', 'Meogeoyo!', '來吃吧！', 'cafe'),
    S('me', 'I eat a lot.', '저는 많이 먹어요.', 'Jeoneun mani meogeoyo.', '我吃很多。', 'cafe')]),
  hungry: W('🍙', '餓', 'hungry', '배고파요', 'baegopayo', '배＝肚子＋고프다＝空空的 → 肚子餓', [
    S('leo', "I'm hungry!", '배고파요!', 'Baegopayo!', '我好餓！', 'practice'),
    S('seoyun', 'Are you hungry?', '배고파요?', 'Baegopayo?', '你餓了嗎？', 'practice')]),
  hurt: W('🤕', '痛', 'it hurts', '아파요', 'apayo', '아프다＝痛、生病；哪裡痛？＝어디가 아파요?', [
    S('me', 'My leg hurts.', '다리가 아파요.', 'Dariga apayo.', '我的腳好痛。', 'practice'),
    S('coach', 'Where does it hurt?', '어디가 아파요?', 'Eodiga apayo?', '哪裡痛？', 'practice')]),
  rest: W('🛋️', '休息', 'rest', '쉬어요', 'swieoyo', '쉬다＝休息；休息一下＝좀 쉬어요', [
    S('coach', 'Rest today.', '오늘은 쉬어요.', 'Oneureun swieoyo.', '今天休息。', 'practice'),
    S('seoyun', 'Take a little rest.', '좀 쉬어요.', 'Jom swieoyo.', '休息一下吧。', 'room')]),
  help: W('🆘', '幫忙', 'help', '도와주세요', 'dowajuseyo', '도와주다＝幫忙；請人幫忙、求救都說 도와주세요', [
    S('me', 'Help me, please!', '도와주세요!', 'Dowajuseyo!', '請幫幫我！', 'practice'),
    S('seoyun', 'I will help you.', '내가 도와줄게요.', 'Naega dowajulgeyo.', '我來幫你。', 'practice')]),
  // ── 第七章 回家・台灣篇 ──
  family: W('👨‍👩‍👧', '家人', 'family', '가족', 'gajok', '漢字詞「家族」，就是家人', [
    S('me', 'I love my family.', '저는 우리 가족을 사랑해요.', 'Jeoneun uri gajogeul saranghaeyo.', '我愛我的家人。', 'room'),
    S('mina', 'How many people are in your family?', '가족이 몇 명이에요?', 'Gajogi myeot myeongieyo?', '你家有幾個人？', 'cafe')]),
  mom: W('👩', '媽媽', 'mom', '엄마', 'eomma', '엄마 跟中文「媽媽」聽起來很像！爸爸是 아빠', [
    S('me', 'Mom, I miss you!', '엄마, 보고 싶어요!', 'Eomma, bogo sipeoyo!', '媽媽，我好想你！', 'room'),
    S('leo', 'My mom is in America.', '우리 엄마는 미국에 있어요.', 'Uri eommaneun miguge isseoyo.', '我媽媽在美國。', 'room')]),
  miss: W('🥺', '想念', 'I miss you', '보고 싶어요', 'bogo sipeoyo', '直譯是「想看見你」，韓國人說想念都這樣說', [
    S('mina', 'I miss you too.', '저도 보고 싶어요.', 'Jeodo bogo sipeoyo.', '我也想你。', 'room'),
    S('me', 'I miss Taiwan.', '대만이 보고 싶어요.', 'Daemani bogo sipeoyo.', '我想念台灣。', 'night')]),
  old: W('🏚️', '古老的', 'old', '오래된', 'oraedoen', '오래＝很久；오래된 집＝老房子', [
    S('kong', 'This is a very old castle.', '이건 아주 오래된 성이에요.', 'Igeon aju oraedoen seongieyo.', '這是一座很古老的城堡。', 'street'),
    S('me', 'This house is old.', '이 집은 오래됐어요.', 'I jibeun oraedwaesseoyo.', '這棟房子很老了。', 'street')]),
  history: W('📜', '歷史', 'history', '역사', 'yeoksa', '漢字詞「歷史」，念起來像「有沙」', [
    S('kong', 'Taiwan has a long history.', '대만은 역사가 길어요.', 'Daemaneun yeoksaga gireoyo.', '台灣的歷史很長。', 'classroom'),
    S('seoyun', 'I like history.', '저는 역사를 좋아해요.', 'Jeoneun yeoksareul joahaeyo.', '我喜歡歷史。', 'street')]),
  lion: W('🦁', '獅子', 'lion', '사자', 'saja', '漢字詞「獅子」→ 사자', [
    S('seoyun', 'A lion with a sword!', '칼을 문 사자예요!', 'Kareul mun sajayeyo!', '咬著劍的獅子！', 'street'),
    S('me', 'The lion protects the house.', '사자가 집을 지켜요.', 'Sajaga jibeul jikyeoyo.', '獅子保護這個家。', 'street')]),
  market: W('🏮', '市場', 'market', '시장', 'sijang', '漢字詞「市場」；夜市＝야시장', [
    S('me', "Let's go to the night market!", '야시장에 가요!', 'Yasijange gayo!', '去夜市吧！', 'night'),
    S('leo', 'There are so many people at the market!', '시장에 사람이 많아요!', 'Sijange sarami manayo!', '市場人好多！', 'night')]),
  spicy: W('🌶️', '辣', 'spicy', '매워요', 'maewoyo', '맵다＝辣；韓國人超愛吃辣！', [
    S('leo', "It's too spicy!", '너무 매워요!', 'Neomu maewoyo!', '太辣了！', 'night'),
    S('seoyun', 'I like spicy food.', '저는 매운 음식을 좋아해요.', 'Jeoneun maeun eumsigeul joahaeyo.', '我喜歡吃辣。', 'cafe')]),
  sweet: W('🍬', '甜', 'sweet', '달아요', 'darayo', '달다＝甜；也可以說 달콤해요（甜甜的）', [
    S('me', 'This is sweet.', '이거 달아요.', 'Igeo darayo.', '這個很甜。', 'night'),
    S('seoyun', 'Sweet and delicious!', '달고 맛있어요!', 'Dalgo masisseoyo!', '又甜又好吃！', 'night')]),
  // ── 第八章 月末評價 ──
  choose: W('👆', '選', 'choose', '골라요', 'gollayo', '고르다＝選；選一個吧＝하나 골라요', [
    S('coach', 'Choose a song.', '노래를 골라요.', 'Noraereul gollayo.', '選一首歌。', 'practice'),
    S('me', 'I choose this one!', '저는 이거 골라요!', 'Jeoneun igeo gollayo!', '我選這個！', 'practice')]),
  team: W('👥', '隊伍', 'team', '팀', 'tim', '外來語 team → 팀', [
    S('seoyun', 'We are one team.', '우리는 한 팀이에요.', 'Urineun han timieyo.', '我們是同一隊。', 'practice'),
    S('coach', 'Four people make one team.', '네 명이 한 팀이에요.', 'Ne myeongi han timieyo.', '四個人一隊。', 'practice')]),
  leader: W('👑', '隊長', 'leader', '리더', 'rideo', '外來語 leader → 리더；韓團隊長都叫 리더', [
    S('leo', 'Who is the leader?', '리더가 누구예요?', 'Rideoga nuguyeyo?', '誰是隊長？', 'practice'),
    S('seoyun', 'You be the leader!', '네가 리더 해!', 'Nega rideo hae!', '你來當隊長！', 'practice')]),
  hard: W('🔥', '努力地', 'hard (work hard)', '열심히', 'yeolsimhi', '열심＝熱心；加油可以說 열심히 해요（努力做）', [
    S('coach', 'Practice hard!', '열심히 연습해요!', 'Yeolsimhi yeonseuphaeyo!', '努力練習！', 'practice'),
    S('me', 'I study hard.', '저는 열심히 공부해요.', 'Jeoneun yeolsimhi gongbuhaeyo.', '我很努力讀書。', 'classroom')]),
  mistake: W('💦', '失誤', 'mistake', '실수', 'silsu', '漢字詞「失手」；失誤也沒關係＝실수해도 괜찮아요', [
    S('me', 'I made a mistake.', '실수했어요.', 'Silsuhaesseoyo.', '我失誤了。', 'practice'),
    S('seoyun', 'Mistakes are okay.', '실수해도 괜찮아요.', 'Silsuhaedo gwaenchanayo.', '失誤也沒關係。', 'practice')]),
  promise: W('🤙', '約定', 'promise', '약속', 'yaksok', '漢字詞「約束」＝約定；打勾勾時就喊 약속!', [
    S('seoyun', 'Promise!', '약속!', 'Yaksok!', '說好了！', 'practice'),
    S('me', 'I will keep my promise.', '약속 지킬게요.', 'Yaksok jikilgeyo.', '我會遵守約定。', 'night')]),
  score: W('💯', '分數', 'score', '점수', 'jeomsu', '漢字詞「點數」＝分數', [
    S('coach', 'Your score is ninety-five.', '점수는 95점이에요.', 'Jeomsuneun gusibo-jeomieyo.', '你的分數是 95 分。', 'stage'),
    S('me', 'What is my score?', '제 점수는 몇 점이에요?', 'Je jeomsuneun myeot jeomieyo?', '我的分數是幾分？', 'stage')]),
  first: W('🥇', '第一名', 'first place', '1등', 'ildeung', '1등＝一等＝第一名；音樂節目拿第一叫 1위', [
    S('leo', 'You are first!', '1등이에요!', 'Ildeungieyo!', '你是第一名！', 'stage'),
    S('seoyun', 'We got first place together.', '우리 같이 1등 했어요.', 'Uri gachi ildeung haesseoyo.', '我們一起拿到第一名。', 'stage')]),
  proud: W('🌟', '驕傲', 'proud', '자랑스러워요', 'jarangseureowoyo', '자랑＝誇耀；我以你為傲＝네가 자랑스러워', [
    S('mina', "I'm so proud of you!", '정말 자랑스러워요!', 'Jeongmal jarangseureowoyo!', '我真為你驕傲！', 'stage'),
    S('me', 'My family is proud of me.', '가족이 저를 자랑스러워해요.', 'Gajogi jeoreul jarangseureowohaeyo.', '我的家人以我為傲。', 'room')]),
  // ── 第九章 首爾生活 ──
  subway: W('🚇', '地鐵', 'subway', '지하철', 'jihacheol', '漢字詞「地下鐵」→ 지하철', [
    S('leo', "Let's take the subway.", '지하철 타요.', 'Jihacheol tayo.', '搭地鐵吧。', 'street'),
    S('me', 'Where is the subway station?', '지하철역이 어디예요?', 'Jihacheollyeogi eodiyeyo?', '地鐵站在哪裡？', 'street')]),
  left: W('⬅️', '左邊', 'left', '왼쪽', 'oenjjok', '왼＝左＋쪽＝邊', [
    S('mina', 'Go left.', '왼쪽으로 가요.', 'Oenjjogeuro gayo.', '往左走。', 'street'),
    S('me', 'It is on the left.', '왼쪽에 있어요.', 'Oenjjoge isseoyo.', '在左邊。', 'street')]),
  right: W('➡️', '右邊', 'right', '오른쪽', 'oreunjjok', '오른＝右（也有「正確」的意思）＋쪽＝邊', [
    S('leo', 'Go right!', '오른쪽으로 가요!', 'Oreunjjogeuro gayo!', '往右走！', 'street'),
    S('me', 'It is on the right.', '오른쪽에 있어요.', 'Oreunjjoge isseoyo.', '在右邊。', 'street')]),
  rain: W('🌧️', '雨', 'rain', '비', 'bi', '下雨了＝비가 와요（雨來了）', [
    S('seoyun', "It's raining.", '비가 와요.', 'Biga wayo.', '下雨了。', 'night'),
    S('me', 'I like rainy days.', '저는 비 오는 날을 좋아해요.', 'Jeoneun bi oneun nareul joahaeyo.', '我喜歡下雨天。', 'room')]),
  umbrella: W('☂️', '雨傘', 'umbrella', '우산', 'usan', '漢字詞「雨傘」→ 우산', [
    S('mina', 'Take an umbrella.', '우산 가져가요.', 'Usan gajyeogayo.', '帶把傘吧。', 'street'),
    S('me', "I don't have an umbrella!", '우산이 없어요!', 'Usani eopseoyo!', '我沒有傘！', 'street')]),
  cold: W('🥶', '冷', 'cold', '추워요', 'chuwoyo', '춥다＝天氣冷；東西冰冰的是 차가워요', [
    S('leo', "It's so cold!", '너무 추워요!', 'Neomu chuwoyo!', '好冷！', 'street'),
    S('seoyun', 'Are you cold?', '추워요?', 'Chuwoyo?', '你會冷嗎？', 'room')]),
  snack: W('🍪', '零食', 'snack', '과자', 'gwaja', '과자＝餅乾零食（漢字「菓子」）', [
    S('leo', "Let's buy snacks!", '과자 사요!', 'Gwaja sayo!', '買零食吧！', 'street'),
    S('me', 'This snack is delicious.', '이 과자 맛있어요.', 'I gwaja masisseoyo.', '這個零食好好吃。', 'room')]),
  cheap: W('🪙', '便宜', 'cheap', '싸요', 'ssayo', '싸다＝便宜；超便宜＝진짜 싸요', [
    S('me', "It's cheap!", '싸요!', 'Ssayo!', '好便宜！', 'street'),
    S('leo', 'Buy one, get one free! So cheap!', '원 플러스 원! 정말 싸요!', 'Won peulleoseu won! Jeongmal ssayo!', '買一送一！好便宜！', 'street')]),
  expensive: W('💎', '貴', 'expensive', '비싸요', 'bissayo', '비싸다＝貴，比「싸다（便宜）」多一個 비', [
    S('me', "It's too expensive!", '너무 비싸요!', 'Neomu bissayo!', '太貴了！', 'street'),
    S('mina', 'Is it expensive?', '비싸요?', 'Bissayo?', '很貴嗎？', 'street')]),
  // ── 第十章 出道舞台 ──
  clothes: W('👗', '衣服', 'clothes', '옷', 'ot', '옷＝衣服；換衣服＝옷을 갈아입어요', [
    S('mina', 'These are your stage clothes.', '이게 무대 옷이에요.', 'Ige mudae osieyo.', '這是你的舞台服裝。', 'stage'),
    S('me', 'I like these clothes.', '이 옷이 좋아요.', 'I osi joayo.', '我喜歡這件衣服。', 'room')]),
  color: W('🎨', '顏色', 'color', '색깔', 'saekkal', '색＝色；你喜歡什麼顏色？＝무슨 색깔 좋아해요?', [
    S('seoyun', 'What color do you like?', '무슨 색깔 좋아해요?', 'Museun saekkal joahaeyo?', '你喜歡什麼顏色？', 'stage'),
    S('me', 'I like pink.', '분홍색을 좋아해요.', 'Bunhongsaegeul joahaeyo.', '我喜歡粉紅色。', 'stage')]),
  pretty: W('💐', '漂亮', 'pretty', '예뻐요', 'yeppeoyo', '예쁘다＝漂亮；超級漂亮＝진짜 예뻐요', [
    S('mina', "You're so pretty!", '정말 예뻐요!', 'Jeongmal yeppeoyo!', '你好漂亮！', 'stage'),
    S('me', 'The stage is pretty.', '무대가 예뻐요.', 'Mudaega yeppeoyo.', '舞台好漂亮。', 'stage')]),
  nervous: W('😰', '緊張', 'nervous', '떨려요', 'tteollyeoyo', '떨리다＝發抖；心在抖＝好緊張', [
    S('me', "I'm so nervous.", '너무 떨려요.', 'Neomu tteollyeoyo.', '我好緊張。', 'stage'),
    S('leo', 'Are you nervous?', '떨려요?', 'Tteollyeoyo?', '你緊張嗎？', 'stage')]),
  smile: W('😊', '笑', 'smile', '웃어요', 'useoyo', '웃다＝笑；笑一個！＝웃어요!', [
    S('coach', 'Smile on stage!', '무대에서 웃어요!', 'Mudaeeseo useoyo!', '在舞台上要笑！', 'stage'),
    S('seoyun', 'You smile a lot.', '너 많이 웃네.', 'Neo mani unne.', '你很常笑耶。', 'practice')]),
  believe: W('🤞', '相信', 'believe', '믿어요', 'mideoyo', '믿다＝相信；我相信你！＝믿어요!', [
    S('mina', 'I believe in you!', '믿어요!', 'Mideoyo!', '我相信你！', 'stage'),
    S('me', 'Believe in yourself!', '자신을 믿어요!', 'Jasineul mideoyo!', '相信你自己！', 'stage')]),
  dream: W('🌠', '夢想', 'dream', '꿈', 'kkum', '꿈＝夢、夢想；夢想實現了＝꿈이 이루어졌어요', [
    S('nova', 'Your dream will come true.', '꿈은 이루어져요.', 'Kkumeun irueojyeoyo.', '夢想會實現。', 'stage'),
    S('me', 'My dream is the stage.', '제 꿈은 무대예요.', 'Je kkumeun mudaeyeyo.', '我的夢想是舞台。', 'stage')]),
  fan: W('🙌', '粉絲', 'fan', '팬', 'paen', '外來語 fan → 팬；粉絲團叫 팬덤（fandom）', [
    S('me', 'Thank you, fans!', '팬 여러분, 감사합니다!', 'Paen yeoreobun, gamsahamnida!', '粉絲們，謝謝大家！', 'stage'),
    S('mina', "I'm your first fan!", '내가 첫 번째 팬이에요!', 'Naega cheot beonjjae paenieyo!', '我是你的第一號粉絲！', 'stage')]),
  happy: W('🌈', '幸福', 'happy', '행복해요', 'haengbokhaeyo', '漢字詞「幸福」→ 행복；祝你幸福＝행복하세요', [
    S('me', "I'm so happy!", '너무 행복해요!', 'Neomu haengbokhaeyo!', '我好幸福！', 'stage'),
    S('seoyun', 'Be happy!', '행복하세요!', 'Haengbokhaseyo!', '祝你幸福！', 'stage')]),
};

export const LEVELS2 = [
  { id: 'd13', ch: 5, title: '新室友', words: ['nicetomeet', 'room', 'together'], bg: 'room', with: 'seoyun',
    dialogue: [L('seoyun', 'Hi. Are you the new trainee?', '안녕하세요. 새 연습생이에요?', 'Annyeonghaseyo. Sae yeonseupsaengieyo?', '你好，你是新來的練習生嗎？'),
      L('me', 'Yes! Nice to meet you. I am from Taiwan.', '네! 반가워요. 저는 대만에서 왔어요.', 'Ne! Bangawoyo. Jeoneun daemaneseo wasseoyo.', '對！很高興認識你，我從台灣來。'),
      L('seoyun', 'This is our room.', '여기가 우리 방이에요.', 'Yeogiga uri bangieyo.', '這裡是我們的房間。'),
      L('me', "Let's do our best together!", '같이 열심히 해요!', 'Gachi yeolsimhi haeyo!', '一起加油吧！')] },
  { id: 'd14', ch: 5, title: '再跳一次', words: ['mirror', 'practice', 'again'], bg: 'practice', with: 'coach',
    dialogue: [L('coach', 'Everyone, look at the mirror.', '여러분, 거울을 보세요.', 'Yeoreobun, geoureul boseyo.', '大家，看著鏡子。'),
      L('me', 'Coach, I made a wrong move…', '코치님, 틀렸어요…', 'Kochinim, teullyeosseoyo…', '教練，我跳錯了…'),
      L('coach', "It's okay. Again!", '괜찮아요. 다시!', 'Gwaenchanayo. Dasi!', '沒關係，再一次！'),
      L('me', 'Yes! I will practice more!', '네! 더 연습할게요!', 'Ne! Deo yeonseuphalgeyo!', '好！我會再多練習！')] },
  { id: 'd15', ch: 5, title: '半夜的腳步聲', words: ['night', 'scary', 'light'], bg: 'night', with: 'leo',
    dialogue: [L('leo', 'Did you hear that? The mirror…', '들었어요? 거울이…', 'Deureosseoyo? Geouri…', '你聽到了嗎？鏡子…'),
      L('me', "I'm scared! Turn on the light, please!", '무서워요! 불 켜 주세요!', 'Museowoyo! Bul kyeo juseyo!', '好可怕！快開燈！'),
      L('leo', "Look, it's just Seoyun practicing!", '봐요, 서윤이 연습하고 있어요!', 'Bwayo, Seoyuni yeonseuphago isseoyo!', '你看，只是徐允在練習！'),
      L('me', 'At night? She is amazing…', '밤에요? 정말 대단해요…', 'Bameyo? Jeongmal daedanhaeyo…', '半夜？她真的好厲害…')] },
  { id: 'b5', ch: 5, boss: true, title: '第五章 BOSS：宿舍生存挑戰' },
  { id: 'd16', ch: 6, title: '早上六點', words: ['morning', 'sleep', 'tired'], bg: 'room', with: 'seoyun',
    dialogue: [L('seoyun', 'Wake up! It is morning!', '일어나요! 아침이에요!', 'Ireonayo! Achimieyo!', '起床！早上了！'),
      L('me', 'Five more minutes… I am so tired.', '오 분만… 너무 피곤해요.', 'O bunman… neomu pigonhaeyo.', '再五分鐘…我好累。'),
      L('seoyun', 'Sleep early tonight. Let’s go!', '오늘은 일찍 자요. 가요!', 'Oneureun iljjik jayo. Gayo!', '今天早點睡。走吧！'),
      L('me', 'Thank you, Seoyun!', '고마워요, 서윤 씨!', 'Gomawoyo, Seoyun ssi!', '謝謝你，徐允！')] },
  { id: 'd17', ch: 6, title: '好好吃飯', words: ['rice', 'eat', 'hungry'], bg: 'cafe', with: 'leo',
    dialogue: [L('leo', "I'm so hungry after dance class!", '댄스 수업 후에 너무 배고파요!', 'Daenseu sueop hue neomu baegopayo!', '舞蹈課後好餓！'),
      L('me', "Me too. Let's eat rice!", '저도요. 밥 먹어요!', 'Jeodoyo. Bap meogeoyo!', '我也是，去吃飯吧！'),
      L('leo', 'Should we eat only salad?', '샐러드만 먹어야 돼요?', 'Saelleodeuman meogeoya dwaeyo?', '我們只能吃沙拉嗎？'),
      L('me', 'No! We need energy. Eat well!', '아니요! 힘이 필요해요. 잘 먹어요!', 'Aniyo! Himi piryohaeyo. Jal meogeoyo!', '才不是！我們需要體力，要好好吃！')] },
  { id: 'd18', ch: 6, title: '休息也是練習', words: ['hurt', 'rest', 'help'], bg: 'practice', with: 'seoyun',
    dialogue: [L('me', 'Ouch! My ankle hurts…', '아야! 발목이 아파요…', 'Aya! Balmogi apayo…', '哎唷！我的腳踝好痛…'),
      L('seoyun', 'Stop dancing. Rest!', '춤 멈춰요. 쉬어요!', 'Chum meomchwoyo. Swieoyo!', '別跳了，休息！'),
      L('me', 'But the evaluation is soon…', '그런데 평가가 곧이에요…', 'Geureonde pyeonggaga gotieyo…', '可是評價快到了…'),
      L('seoyun', 'Health comes first. I will help you later.', '건강이 먼저예요. 나중에 도와줄게요.', 'Geongangi meonjeoyeyo. Najunge dowajulgeyo.', '健康第一，之後我幫你。')] },
  { id: 'b6', ch: 6, boss: true, title: '第六章 BOSS：體力大考驗' },
  { id: 'd19', ch: 7, title: '想家的夜晚', words: ['family', 'mom', 'miss'], bg: 'night', with: 'mina',
    dialogue: [L('mina', 'You look sad. What happened?', '슬퍼 보여요. 무슨 일이에요?', 'Seulpeo boyeoyo. Museun irieyo?', '你看起來很難過，怎麼了？'),
      L('me', 'I miss my family. I miss my mom.', '가족이 보고 싶어요. 엄마가 보고 싶어요.', 'Gajogi bogo sipeoyo. Eommaga bogo sipeoyo.', '我想家人，我想媽媽。'),
      L('mina', 'Next week is a holiday. Go to Taiwan!', '다음 주에 휴가예요. 대만에 가요!', 'Daeum jue hyugayeyo. Daemane gayo!', '下週放假，回台灣吧！'),
      L('me', 'Really? I can see my family!', '진짜요? 가족을 볼 수 있어요!', 'Jinjjayo? Gajogeul bol su isseoyo!', '真的嗎？我可以見到家人了！')] },
  { id: 'd20', ch: 7, title: '咬著劍的獅子', words: ['old', 'history', 'lion'], bg: 'street', with: 'seoyun',
    dialogue: [L('seoyun', 'What is that? A lion with a sword?', '저게 뭐예요? 칼을 문 사자?', 'Jeoge mwoyeyo? Kareul mun saja?', '那是什麼？咬著劍的獅子？'),
      L('me', 'It is the Sword Lion of Anping. It is very old.', '안핑의 칼 사자예요. 아주 오래됐어요.', 'Anpingui kal sajayeyo. Aju oraedwaesseoyo.', '那是安平劍獅，很古老喔。'),
      L('seoyun', 'Wow, Taiwan history is interesting!', '와, 대만 역사 재미있어요!', 'Wa, daeman yeoksa jaemiisseoyo!', '哇，台灣歷史好有趣！'),
      L('me', 'The lion protects the family.', '사자가 가족을 지켜요.', 'Sajaga gajogeul jikyeoyo.', '獅子會保護家人。')] },
  { id: 'd21', ch: 7, title: '夜市大冒險', words: ['market', 'spicy', 'sweet'], bg: 'night', with: 'leo',
    dialogue: [L('leo', 'Is the stinky tofu spicy?', '취두부 매워요?', 'Chwidubu maewoyo?', '臭豆腐會辣嗎？'),
      L('me', 'A little. Try it at the market!', '조금요. 시장에서 먹어 봐요!', 'Jogeumyo. Sijangeseo meogeo bwayo!', '有一點，在夜市吃吃看！'),
      L('leo', "Wow, it's spicy! Water, please!", '와, 매워요! 물 주세요!', 'Wa, maewoyo! Mul juseyo!', '哇，好辣！請給我水！'),
      L('me', 'Then eat this. It is sweet.', '그럼 이거 먹어요. 달아요.', 'Geureom igeo meogeoyo. Darayo.', '那吃這個，這個甜的。')] },
  { id: 'b7', ch: 7, boss: true, title: '第七章 BOSS：台灣小導遊' },
  { id: 'd22', ch: 8, title: '對手變隊友', words: ['choose', 'team', 'leader'], bg: 'practice', with: 'coach',
    dialogue: [L('coach', 'The monthly evaluation is next week. Make a team.', '다음 주에 월말 평가예요. 팀을 만들어요.', 'Daeum jue wolmal pyeonggayeyo. Timeul mandeureoyo.', '下週是月末評價，組一隊吧。'),
      L('me', "Seoyun, let's be one team!", '서윤 씨, 같은 팀 해요!', 'Seoyun ssi, gateun tim haeyo!', '徐允，我們同一隊吧！'),
      L('coach', 'Who is the leader? Choose now.', '리더는 누구예요? 지금 골라요.', 'Rideoneun nuguyeyo? Jigeum gollayo.', '誰是隊長？現在選吧。'),
      L('me', 'I will be the leader!', '제가 리더 할게요!', 'Jega rideo halgeyo!', '我來當隊長！')] },
  { id: 'd23', ch: 8, title: '打勾勾', words: ['hard', 'mistake', 'promise'], bg: 'night', with: 'seoyun',
    dialogue: [L('seoyun', 'I made a mistake again…', '또 실수했어요…', 'Tto silsuhaesseoyo…', '我又失誤了…'),
      L('me', "It's okay. Let's practice hard together.", '괜찮아요. 같이 열심히 연습해요.', 'Gwaenchanayo. Gachi yeolsimhi yeonseuphaeyo.', '沒關係，一起努力練習。'),
      L('seoyun', 'But we sleep before twelve. Promise?', '근데 열두 시 전에 자요. 약속?', 'Geunde yeoldu si jeone jayo. Yaksok?', '可是十二點前要睡喔，約定？'),
      L('me', 'Promise!', '약속!', 'Yaksok!', '約定！')] },
  { id: 'd24', ch: 8, title: '月末評價', words: ['score', 'first', 'proud'], bg: 'stage', with: 'coach',
    dialogue: [L('coach', 'Team leader, come to the front.', '팀 리더, 앞으로 나와요.', 'Tim rideo, apeuro nawayo.', '隊長，到前面來。'),
      L('me', 'Yes! What is our score?', '네! 우리 점수는요?', 'Ne! Uri jeomsuneunyo?', '是！我們的分數是？'),
      L('coach', 'Ninety-five points. First place!', '95점, 1등이에요!', 'Gusibo-jeom, ildeungieyo!', '95 分，第一名！'),
      L('me', 'Thank you! I am so proud of my team!', '감사합니다! 우리 팀이 정말 자랑스러워요!', 'Gamsahamnida! Uri timi jeongmal jarangseureowoyo!', '謝謝！我好以我的隊伍為傲！')] },
  { id: 'b8', ch: 8, boss: true, title: '第八章 BOSS：月末評價總複習' },
  { id: 'd25', ch: 9, title: '首爾迷路記', words: ['subway', 'left', 'right'], bg: 'street', with: 'leo',
    dialogue: [L('leo', 'Where is the subway station?', '지하철역이 어디예요?', 'Jihacheollyeogi eodiyeyo?', '地鐵站在哪裡？'),
      L('me', 'I think it is on the left.', '왼쪽에 있는 것 같아요.', 'Oenjjoge inneun geot gatayo.', '我覺得在左邊。'),
      L('leo', 'No, the map says it is on the right!', '아니요, 지도에 오른쪽이라고 해요!', 'Aniyo, jidoe oreunjjogirago haeyo!', '不對，地圖說在右邊！'),
      L('me', "Oops! Let's go right!", '앗! 오른쪽으로 가요!', 'At! Oreunjjogeuro gayo!', '哎呀！往右走吧！')] },
  { id: 'd26', ch: 9, title: '下雨的晚上', words: ['rain', 'umbrella', 'cold'], bg: 'room', with: 'seoyun',
    dialogue: [L('me', "It's raining and I have no umbrella!", '비가 오는데 우산이 없어요!', 'Biga oneunde usani eopseoyo!', '下雨了，我又沒帶傘！'),
      L('seoyun', "You're all wet! Aren't you cold?", '다 젖었네요! 안 추워요?', 'Da jeojeonneyo! An chuwoyo?', '你全身濕了！不冷嗎？'),
      L('me', 'Very cold… I will cut my nails and sleep.', '너무 추워요… 손톱 깎고 잘게요.', 'Neomu chuwoyo… Sontop kkakgo jalgeyo.', '好冷…我剪個指甲就睡。'),
      L('seoyun', 'Wait! Not at night! There is a legend…', '잠깐! 밤에는 안 돼요! 전설이 있어요…', 'Jamkkan! Bameneun an dwaeyo! Jeonseori isseoyo…', '等等！晚上不行！有個傳說…')] },
  { id: 'd27', ch: 9, title: '便利商店的 1+1', words: ['snack', 'cheap', 'expensive'], bg: 'street', with: 'leo',
    dialogue: [L('leo', 'Look! Banana milk and snacks!', '봐요! 바나나 우유하고 과자!', 'Bwayo! Banana uyuhago gwaja!', '你看！香蕉牛奶和零食！'),
      L('me', 'How much is it? Is it expensive?', '얼마예요? 비싸요?', 'Eolmayeyo? Bissayo?', '多少錢？會很貴嗎？'),
      L('leo', "No, it's cheap! One plus one!", '아니요, 싸요! 원 플러스 원!', 'Aniyo, ssayo! Won peulleoseu won!', '不會，很便宜！買一送一！'),
      L('me', "Let's buy one for Seoyun too!", '서윤 씨 것도 사요!', 'Seoyun ssi geotdo sayo!', '也幫徐允買一個吧！')] },
  { id: 'b9', ch: 9, boss: true, title: '第九章 BOSS：首爾生存遊戲' },
  { id: 'd28', ch: 10, title: '奶茶色的出道服', words: ['clothes', 'color', 'pretty'], bg: 'stage', with: 'mina',
    dialogue: [L('mina', 'Your debut clothes are here!', '데뷔 옷이 나왔어요!', 'Debwi osi nawasseoyo!', '你們的出道服裝做好了！'),
      L('me', 'Wow! What a pretty color!', '와! 색깔이 정말 예뻐요!', 'Wa! Saekkari jeongmal yeppeoyo!', '哇！顏色好漂亮！'),
      L('mina', 'Milk tea and white, your favorite colors!', '밀크티색이랑 흰색, 네가 좋아하는 색!', 'Milkeutisaegirang huinsaek, nega joahaneun saek!', '奶茶色和白色，你最喜歡的顏色！'),
      L('me', 'I love it! Thank you, Mina!', '너무 좋아요! 고마워요, 민아 씨!', 'Neomu joayo! Gomawoyo, Mina ssi!', '我好喜歡！謝謝敏雅！')] },
  { id: 'd29', ch: 10, title: '彩排好緊張', words: ['nervous', 'smile', 'believe'], bg: 'stage', with: 'seoyun',
    dialogue: [L('me', "I'm so nervous. My hands are shaking.", '너무 떨려요. 손이 떨려요.', 'Neomu tteollyeoyo. Soni tteollyeoyo.', '我好緊張，手在發抖。'),
      L('seoyun', 'Look at me. Smile!', '나 봐요. 웃어요!', 'Na bwayo. Useoyo!', '看著我，笑一個！'),
      L('me', 'Like this?', '이렇게요?', 'Ireokeyo?', '像這樣嗎？'),
      L('seoyun', 'Yes. I believe in you. We are one team.', '네. 믿어요. 우리는 한 팀이에요.', 'Ne. Mideoyo. Urineun han timieyo.', '嗯，我相信你，我們是一隊的。')] },
  { id: 'd30', ch: 10, title: '出道舞台', words: ['dream', 'fan', 'happy'], bg: 'stage', with: 'nova',
    dialogue: [L('nova', 'Congratulations on your debut!', '데뷔 축하해요!', 'Debwi chukahaeyo!', '恭喜出道！'),
      L('me', 'Luna! You came!', '루나 선배님! 오셨어요!', 'Runa seonbaenim! Osyeosseoyo!', '露娜前輩！您來了！'),
      L('nova', 'I told you. Dreams come true.', '말했죠? 꿈은 이루어져요.', 'Malhaetjyo? Kkumeun irueojyeoyo.', '我說過吧？夢想會實現。'),
      L('me', 'Thank you. I am so happy, fans!', '감사합니다. 팬 여러분, 정말 행복해요!', 'Gamsahamnida. Paen yeoreobun, jeongmal haengbokhaeyo!', '謝謝您。粉絲們，我真的好幸福！')] },
  { id: 'b10', ch: 10, boss: true, title: '第二季最終 BOSS：出道演唱會' },
];

export const STORIES2 = {
  d13: { kind: '練習生篇', title: '宿舍的新室友',
    panels: [P('room', [['me', 'shock']], [['me', '여기가 제 방이에요?', '這裡是我的房間？', { think: true, w: 'room', hl: '방' }]], { cap: '第一天搬進星夢娛樂的練習生宿舍' }),
      P('room', [['seoyun', 'cool'], ['me', 'shock']], [['seoyun', '반가워. 나는 서윤. 춤은 내가 1등이야.', '很高興認識你。我是徐允。跳舞，我是第一名。', { w: 'nicetomeet', hl: '반가워' }]]),
      P('room', [['seoyun', 'cool'], ['me', 'happy']], [['me', '같이 열심히 해요! 저도 안 질 거예요!', '一起加油吧！我也不會輸的！', { shout: true, w: 'together', hl: '같이' }]])],
    fact: '韓國練習生多半住在公司安排的宿舍，幾個人一間房，一起上課、練舞，也一起分擔打掃。' },
  d14: { kind: '練習生篇', title: '徐允的第一名',
    panels: [P('practice', [['seoyun', 'cool']], [['seoyun', '거울 봐.', '看鏡子。', { w: 'mirror', hl: '거울' }], ['seoyun', '다시 해 봐.', '再跳一次看看。', { w: 'again', hl: '다시' }]], { cap: '第一堂舞蹈課，徐允跳得超完美' }),
      P('burst', [['me', 'shock']], [['me', '와… 진짜 잘해요!', '哇…她跳得真好！', { shout: true }]]),
      P('practice', [['me', 'cool']], [['me', '나도 매일 연습할 거야!', '我也要每天練習！', { think: true, w: 'practice', hl: '연습' }]], { cap: '那天晚上，你一個人留下來多練了一小時' })],
    fact: '韓國的練習室常常整面都是鏡子，練習生要一直看自己的動作和表情。老師喊「다시！」就是「再來一次！」' },
  d15: { kind: '都市傳說', title: '午夜練習室的鏡子',
    panels: [P('night', [['leo', 'shock'], ['me', 'shock']], [['leo', 'The mirror moves at night!', '鏡子晚上會動！', { w: 'night', hl: 'night' }]], { cap: '練習生之間流傳的怪談' }),
      P('burst', [['me', 'shock']], [['me', '무서워요!', '好可怕！', { shout: true, w: 'scary', hl: '무서워요' }], ['me', '불 켜 주세요!', '快開燈！', { w: 'light', hl: '불' }]]),
      P('practice', [['seoyun', 'cool'], ['me', 'think']], [['seoyun', '나야. 밤에 혼자 연습했어.', '是我啦，我晚上自己在練習。', { w: 'night', hl: '밤' }]])],
    fact: '練習生圈真的流傳「半夜練習室鏡子會動」的怪談，真相多半是有人偷偷加練。不過睡飽也很重要，休息不夠反而容易受傷！' },
  d16: { kind: '練習生篇', title: '徐允的鬧鐘',
    panels: [P('room', [['me', 'cry']], [['me', '아침 5시 50분…?', '早上五點五十分…？', { think: true, w: 'morning', hl: '아침' }], ['me', '너무 피곤해요…', '好累…', { think: true, w: 'tired', hl: '피곤해요' }]], { cap: '練習生的早晨來得特別早' }),
      P('room', [['seoyun', 'cool'], ['me', 'shock']], [['seoyun', '일어나요! 오늘 밤엔 일찍 자요!', '起來！今天晚上要早點睡！', { shout: true, w: 'sleep', hl: '자요' }]]),
      P('practice', [['seoyun', 'smile'], ['me', 'happy']], [['seoyun', '같이 가자.', '一起走吧。'], ['me', '응!', '嗯！']])],
    fact: '練習生一早就要上課、練舞、練唱，晚上還有語言課。不過醫生都說：青少年每天要睡 8～10 小時，睡飽才長得高、記得住！' },
  d17: { kind: '練習生篇', title: '吃飽才有力氣跳',
    panels: [P('cafe', [['leo', 'cry']], [['leo', '배고파요… 밥…', '好餓…飯…', { w: 'hungry', hl: '배고파요' }]], { cap: '練舞四小時後的員工餐廳' }),
      P('cafe', [['coach', 'happy'], ['leo', 'shock']], [['coach', '밥을 잘 먹어야 춤도 잘 춰요!', '要好好吃飯，才能跳得好！', { w: 'rice', hl: '밥' }]]),
      P('cafe', [['me', 'happy'], ['leo', 'happy']], [['me', '잘 먹겠습니다!', '我要開動了！', { w: 'eat', hl: '먹겠습니다' }], ['leo', "Let's eat!", '開動！']])],
    fact: '韓國人吃飯前說「잘 먹겠습니다（我會好好吃的）」，吃完說「잘 먹었습니다」。正在長大的練習生一定要吃飽、吃均衡，不能靠節食！' },
  d18: { kind: '練習生篇', title: '徐允伸出的手',
    panels: [P('practice', [['me', 'cry']], [['me', '아야! 아파요!', '哎唷！好痛！', { shout: true, w: 'hurt', hl: '아파요' }]], { cap: '轉圈的時候，腳踝扭到了' }),
      P('practice', [['seoyun', 'shock'], ['me', 'cry']], [['seoyun', '괜찮아?! 내가 도와줄게.', '你沒事吧？！我來幫你。', { w: 'help', hl: '도와줄게' }]]),
      P('room', [['seoyun', 'smile'], ['me', 'happy']], [['seoyun', '쉬는 것도 연습이야.', '休息也是練習的一部分。', { w: 'rest', hl: '쉬는' }], ['me', '고마워요…', '謝謝你…']])],
    fact: '受傷時最重要的是馬上停下來、冰敷、休息，並告訴大人或老師。真正厲害的練習生都知道：休息也是訓練的一部分。' },
  d19: { kind: '練習生篇', title: '月亮下的心事',
    panels: [P('night', [['me', 'cry']], [['me', '엄마…', '媽媽…', { think: true, w: 'mom', hl: '엄마' }], ['me', '보고 싶어요.', '好想你。', { think: true, w: 'miss', hl: '보고 싶어요' }]], { cap: '中秋節前，宿舍窗外的月亮好圓' }),
      P('night', [['mina', 'gentle'], ['me', 'cry']], [['mina', '가족이 보고 싶으면 말해도 돼요.', '想家人的話，說出來也沒關係。', { w: 'family', hl: '가족' }]]),
      P('room', [['mina', 'happy'], ['me', 'happy']], [['mina', '추석에 대만 가요!', '中秋節回台灣吧！'], ['me', '네!', '好！', { shout: true }]])],
    fact: '韓國的中秋節叫「추석（秋夕）」，是全家團圓的大節日，會連放好幾天假。台灣的中秋節則是烤肉、吃月餅和柚子！' },
  d20: { kind: '都市傳說・台灣歷史', title: '安平劍獅的傳說',
    panels: [P('street', [['seoyun', 'shock'], ['me', 'happy']], [['seoyun', '사자가 칼을 물고 있어!', '獅子咬著一把劍！', { shout: true, w: 'lion', hl: '사자' }]], { cap: '放假帶徐允回台南，走進安平老街' }),
      P('street', [['kong', 'happy'], ['seoyun', 'think']], [['kong', '傳說以前駐守安平的士兵，回家後把畫著獅頭的盾牌和刀掛在門口，大家就說這戶人家有「劍獅」守護。', ''], ['seoyun', '와, 오래된 이야기네요.', '哇，好古老的故事。', { w: 'old', hl: '오래된' }]], { cap: '剛好遇到回老家的孔老師' }),
      P('street', [['seoyun', 'love'], ['me', 'happy']], [['seoyun', '대만 역사 재미있어요! 나도 칼 사자 갖고 싶어!', '台灣歷史好有趣！我也想要一隻劍獅！', { w: 'history', hl: '역사' }], ['me', '같이 사러 가요!', '一起去買吧！']])],
    fact: '台南安平的「劍獅」常畫在門楣和牆上，獅子嘴裡咬著劍，用來避邪、保平安。它的由來有好幾種說法，最有名的就是士兵把獅頭盾牌和刀掛在家門口。現在劍獅已經是安平最有代表性的文化！' },
  d21: { kind: '台灣篇', title: '臭豆腐挑戰',
    panels: [P('night', [['me', 'happy']], [['me', '여기가 대만 야시장이에요!', '這裡就是台灣夜市！', { w: 'market', hl: '시장' }]], { cap: '晚上帶 Leo 和徐允逛夜市' }),
      P('burst', [['leo', 'shock']], [['leo', 'What is that smell?!', '那是什麼味道？！', { shout: true }]]),
      P('night', [['leo', 'happy'], ['me', 'happy']], [['leo', 'Spicy but yummy!', '辣辣的，但好好吃！', { w: 'spicy', hl: 'Spicy' }], ['me', '이건 달아요. 먹어 봐요!', '這個是甜的，吃吃看！', { w: 'sweet', hl: '달아요' }]])],
    fact: '台灣夜市是外國觀光客最愛的景點之一。臭豆腐的韓文叫「취두부」，珍珠奶茶叫「버블티」，台灣雞排在韓國則常被叫做「지파이」！' },
  d22: { kind: '練習生篇', title: '對手變隊友？',
    panels: [P('practice', [['coach', 'cool']], [['coach', '월말 평가는 팀으로 해요.', '月末評價要分隊比賽。', { w: 'team', hl: '팀' }]], { cap: '練習室貼出月末評價公告' }),
      P('practice', [['seoyun', 'think'], ['me', 'shock']], [['seoyun', '…나랑 같은 팀 할래? 네가 리더 해.', '…要跟我同一隊嗎？你來當隊長。', { w: 'leader', hl: '리더' }]]),
      P('burst', [['me', 'love']], [['me', '네!!! 저를 골라 줘서 고마워요!', '好！！！謝謝你選我！', { shout: true, w: 'choose', hl: '골라' }]])],
    fact: '韓國經紀公司每個月會舉辦「월말 평가（月末評價）」，練習生要表演唱歌和跳舞，由老師打分數，決定誰能進出道組。' },
  d23: { kind: '練習生篇', title: '徐允也會害怕',
    panels: [P('night', [['seoyun', 'cry']], [['seoyun', '또 실수했어… 사실 무대가 무서워.', '我又失誤了…其實我很怕上台。', { w: 'mistake', hl: '실수' }]], { cap: '評價前一晚，練習室只剩你們兩個' }),
      P('night', [['me', 'gentle'], ['seoyun', 'cry']], [['me', '같이 열심히 하면 안 무서워요.', '一起努力的話，就不可怕了。', { w: 'hard', hl: '열심히' }]]),
      P('night', [['seoyun', 'happy'], ['me', 'happy']], [['seoyun', '약속이야. 끝까지 같이.', '說好了，一起到最後。', { w: 'promise', hl: '약속' }], ['me', '약속!', '約定！']])],
    fact: '就算是很厲害的人也會緊張害怕。研究發現：把緊張說出來、跟朋友一起準備，表現反而會更好。' },
  d24: { kind: '練習生篇・精彩', title: '第一次月末評價',
    panels: [P('stage', [['me', 'cool'], ['seoyun', 'cool']], [['me', '하나, 둘, 셋, 넷!', '一、二、三、四！', { shout: true }]], { cap: '月末評價，你們的隊伍上場了' }),
      P('stage', [['coach', 'smile']], [['coach', '점수는… 95점!', '分數是…95 分！', { w: 'score', hl: '점수' }], ['coach', '1등!', '第一名！', { shout: true, w: 'first', hl: '1등' }]]),
      P('burst', [['seoyun', 'cry'], ['me', 'cry']], [['seoyun', '우리가 해냈어!', '我們做到了！'], ['me', '우리 팀이 정말 자랑스러워요!', '我真為我們的隊伍驕傲！', { w: 'proud', hl: '자랑스러워요' }]])],
    fact: '練習生要經過很多次月末評價，有人練了好幾年才出道。重要的不是每次都拿第一，而是每個月都比上個月的自己更進步！' },
  d25: { kind: '首爾生活篇', title: '第一次自己出門',
    panels: [P('street', [['me', 'think'], ['leo', 'think']], [['leo', 'Left or right?', '左邊還是右邊？', { w: 'left', hl: 'Left' }]], { cap: '第一個休假日，和 Leo 去逛首爾' }),
      P('burst', [['me', 'shock']], [['me', '길을 잃었어요! 왼쪽? 오른쪽?', '我們迷路了！左邊？右邊？', { shout: true, w: 'right', hl: '오른쪽' }]]),
      P('street', [['leo', 'happy'], ['me', 'happy']], [['leo', 'Found it!', '找到了！'], ['me', '지하철역이다!', '是地鐵站！', { w: 'subway', hl: '지하철' }]])],
    fact: '首爾地鐵有二十多條路線，每條線都有自己的顏色和號碼，站名會用韓文、英文、漢字標示。學會「왼쪽／오른쪽」就不怕迷路！' },
  d26: { kind: '都市傳說', title: '晚上不能剪指甲',
    panels: [P('street', [['me', 'cry']], [['me', '비가 와요…', '下雨了…', { w: 'rain', hl: '비' }], ['me', '우산이 없어요!', '我沒有傘！', { w: 'umbrella', hl: '우산' }]], { cap: '回宿舍的路上，突然下起大雨' }),
      P('room', [['seoyun', 'shock'], ['me', 'think']], [['seoyun', '추워요? 그리고… 밤에 손톱 깎으면 안 돼!', '會冷嗎？還有…晚上不能剪指甲！', { shout: true, w: 'cold', hl: '추워요' }]], { cap: '宿舍裡，你正要剪指甲' }),
      P('night', [['seoyun', 'think'], ['me', 'happy']], [['seoyun', '쥐가 손톱을 먹고 너로 변한대.', '聽說老鼠吃了指甲，會變成你。'], ['me', '그럼 내일 깎을게요 ㅋㅋ', '那我明天再剪 哈哈']], { cap: '韓國的古老傳說' })],
    fact: '「晚上剪指甲，老鼠吃了會變成你」是韓國流傳很久的民間故事。真正的原因可能是：以前晚上只有油燈，太暗容易剪傷手。' },
  d27: { kind: '首爾生活篇', title: '便利商店天堂',
    panels: [P('street', [['leo', 'love'], ['me', 'happy']], [['leo', 'Snacks! Banana milk!', '零食！香蕉牛奶！', { w: 'snack', hl: 'Snacks' }]], { cap: '練習結束，宿舍樓下的便利商店' }),
      P('street', [['me', 'shock']], [['me', '비싸요?', '很貴嗎？', { w: 'expensive', hl: '비싸요' }], ['me', '아니, 싸요! 원 플러스 원?!', '不，好便宜！買一送一？！', { shout: true, w: 'cheap', hl: '싸요' }]]),
      P('room', [['seoyun', 'happy'], ['me', 'happy']], [['me', '서윤 씨 과자예요!', '這是給徐允的零食！', { w: 'snack', hl: '과자' }], ['seoyun', '…고마워.', '…謝謝。']])],
    fact: '韓國便利商店常有「1+1（원 플러스 원）」買一送一。香蕉口味牛奶「바나나맛 우유」是很多人到韓國必喝的飲料！' },
  d28: { kind: '出道篇', title: '奶茶色的出道服',
    panels: [P('stage', [['mina', 'happy']], [['mina', '짜잔! 데뷔 옷!', '噹噹！出道服裝！', { shout: true, w: 'clothes', hl: '옷' }]], { cap: '出道前一週，敏雅帶來一個大箱子' }),
      P('stage', [['me', 'love']], [['me', '밀크티 색깔… 내가 제일 좋아하는 색!', '奶茶色…我最喜歡的顏色！', { w: 'color', hl: '색깔' }]]),
      P('stage', [['seoyun', 'smile'], ['me', 'happy']], [['seoyun', '예뻐. 잘 어울려.', '好漂亮，很適合你。', { w: 'pretty', hl: '예뻐' }], ['me', '너도!', '你也是！']])],
    fact: '韓團出道時，造型師會為每位成員設計服裝和代表色。很多團的應援色，就是從出道時的顏色來的喔！' },
  d29: { kind: '出道篇', title: '出道前夜',
    panels: [P('stage', [['me', 'cry']], [['me', '떨려…', '好緊張…', { think: true, w: 'nervous', hl: '떨려' }]], { cap: '出道舞台彩排，台下一個人都沒有' }),
      P('stage', [['seoyun', 'gentle'], ['me', 'cry']], [['seoyun', '웃어. 무대는 즐기는 거야.', '笑一個。舞台是要享受的。', { w: 'smile', hl: '웃어' }]]),
      P('night', [['leo', 'happy'], ['mina', 'happy']], [['leo', 'We believe in you!', '我們相信你！', { shout: true, w: 'believe', hl: 'believe' }], ['mina', '믿어요! 내일 꼭 보러 갈게요!', '我相信你！明天一定去看你！', { w: 'believe', hl: '믿어요' }]])],
    fact: '就算是大明星，上台前也會緊張。深呼吸、對著鏡子微笑、想著支持你的人，都是偶像們常用的放鬆方法。' },
  d30: { kind: '出道篇・精彩', title: '出道舞台',
    panels: [P('stage', [['me', 'cool'], ['seoyun', 'cool']], [['me', '안녕하세요! 저희는…', '大家好！我們是…', { shout: true }]], { cap: '出道舞台，燈光亮起' }),
      P('stage', [['mina', 'cry'], ['leo', 'happy']], [['mina', '우리 애가 데뷔했어…! 팬들이 다 울어요!', '我們家的孩子出道了…！粉絲們都哭了！', { w: 'fan', hl: '팬' }], ['leo', 'She did it!', '她做到了！', { shout: true }]], { cap: '台下的應援棒，變成一片奶茶色的海' }),
      P('burst', [['me', 'love'], ['seoyun', 'love']], [['me', '꿈이 이루어졌어요!', '夢想實現了！', { shout: true, w: 'dream', hl: '꿈' }], ['me', '너무 행복해요!', '好幸福！', { w: 'happy', hl: '행복해요' }]])],
    fact: '韓團的出道舞台通常在音樂節目上，第一次表演叫「데뷔 무대」。出道不是終點，而是成為偶像的第一天！' },
};

export const TEASERS2 = {
  d13: '第一堂舞蹈課，徐允在鏡子前跳了一段…全場都安靜了。',
  d14: '練習生之間流傳一個傳說：半夜十二點，練習室的鏡子會自己動…',
  d15: '明天早上五點五十分，有人會來搖醒你…',
  b5: '第六章：地獄訓練開始！早起、餓肚子、還有…受傷？',
  d16: '練舞四小時後，Leo 餓到快哭了，可是聽說練習生只能吃沙拉？',
  d17: '轉圈的時候，你的腳踝突然一陣劇痛…',
  d18: '中秋節快到了，你看著窗外的月亮，突然好想家…',
  b6: '第七章：放假回台灣！你要帶徐允和 Leo 看看你的家鄉。',
  d19: '回到台南，徐允看到門上咬著劍的獅子，嚇了一跳…',
  d20: '晚上去夜市，Leo 聞到一股「神祕的味道」…',
  d21: '回到首爾，練習室貼出一張公告：「月末評價，分隊進行」。',
  b7: '第八章：月末評價！對手徐允，竟然主動來找你…',
  d22: '評價前一晚，徐允一個人坐在練習室角落，眼眶紅紅的…',
  d23: '評價當天，你們的隊伍最後一個上場…',
  d24: '第一次月末評價過關！明天是休假日，你和 Leo 決定自己去逛首爾…',
  b8: '第九章：一個人在首爾生活！地鐵、雨天、便利商店，你應付得來嗎？',
  d25: '回宿舍的路上下起大雨，你沒帶傘…',
  d26: '樓下的便利商店，今天好像有特別的活動…',
  d27: '公司突然通知：「下個月，你們出道。」',
  b9: '第十章：出道倒數！敏雅帶來一個神祕的大箱子…',
  d28: '出道舞台彩排，你的手一直在發抖…',
  d29: '明天，就是出道的日子。',
  d30: '第二季完結！第三季「新人偶像篇」：音樂節目、粉絲見面會、還有第一次的一位…',
  b10: '第三季即將開始：成為新人偶像的你，會遇到什麼挑戰？',
};

export const INTROS2 = {
  d13: '來到首爾宿舍！走廊另一頭竟然是 Leo——他也偷偷報名了試鏡，跟你成了同期練習生；敏雅也回到首爾，在公司當練習生的韓文小老師。放好行李，新室友徐允走了過來。先自我介紹吧！',
  d14: '舞蹈課上，姜教練一直盯著鏡子裡的你。',
  d15: '午夜的走廊，你和 Leo 聽到練習室傳來聲音…',
  d16: '鬧鐘響了第三次，徐允直接拉開你的棉被。',
  d17: '下課鐘一響，Leo 第一個衝向員工餐廳。',
  d18: '腳踝扭到後，徐允扶你坐下。',
  d19: '敏雅來宿舍探班，看到你一個人望著月亮。',
  d20: '安平老街上，徐允指著門上的劍獅問你。',
  d21: '夜市人山人海，Leo 停在臭豆腐攤前面。',
  d22: '公告貼出來後，姜教練要大家馬上分組。',
  d23: '評價前一晚，你在練習室找到徐允。',
  d24: '表演結束，姜教練拿著分數走上台。',
  d25: '從地鐵站出來，你和 Leo 看著手機地圖發呆。',
  d26: '你全身濕透地跑回宿舍，徐允嚇了一跳。',
  d27: '便利商店門口貼著大大的「1+1」。',
  d28: '敏雅打開大箱子，裡面是閃閃發亮的出道服。',
  d29: '彩排結束，徐允走到發抖的你身邊。',
  d30: '表演結束，後台出現一個熟悉的身影。',
};

export const KEEPSAKES2 = {
  d13: { kind: 'item', name: '宿舍房間鑰匙', emoji: '🔑', desc: '練習生宿舍 301 號房的鑰匙', rarity: 'R' },
  d14: { kind: 'scene', name: '劇照・徐允的第一名', rarity: 'R' },
  d15: { kind: 'scene', name: '劇照・午夜練習室', rarity: 'R' },
  d16: { kind: 'item', name: '徐允的鬧鐘', emoji: '⏰', desc: '每天 5:50 準時響的小鬧鐘', rarity: 'R' },
  d17: { kind: 'item', name: '員工餐廳餐券', emoji: '🍱', desc: '吃飽才有力氣跳舞！', rarity: 'R' },
  d18: { kind: 'item', name: '冰敷袋', emoji: '🧊', desc: '徐允幫你準備的，上面畫了一個笑臉', rarity: 'SR' },
  d19: { kind: 'scene', name: '劇照・月亮下的心事', rarity: 'R' },
  d20: { kind: 'item', name: '安平劍獅吊飾', emoji: '🦁', desc: '和徐允一人一個的劍獅吊飾', rarity: 'SR' },
  d21: { kind: 'scene', name: '劇照・夜市大冒險', rarity: 'R' },
  d22: { kind: 'item', name: '隊長臂章', emoji: '🎗️', desc: '月末評價隊長的臂章', rarity: 'R' },
  d23: { kind: 'item', name: '打勾勾約定卡', emoji: '🤙', desc: '「끝까지 같이（一起到最後）」', rarity: 'SR' },
  d24: { kind: 'scene', name: '劇照・第一次月末評價', rarity: 'SSR' },
  d25: { kind: 'item', name: '首爾地鐵卡', emoji: '💳', desc: '第一次自己搭地鐵的交通卡', rarity: 'R' },
  d26: { kind: 'item', name: '透明雨傘', emoji: '☂️', desc: '那天晚上徐允借你的傘', rarity: 'R' },
  d27: { kind: 'item', name: '香蕉牛奶', emoji: '🥛', desc: '1+1 買到的香蕉牛奶，一瓶給徐允', rarity: 'R' },
  d28: { kind: 'item', name: '奶茶色出道服', emoji: '👗', desc: '你最喜歡的奶茶色和白色', rarity: 'SR' },
  d29: { kind: 'scene', name: '劇照・出道前夜', rarity: 'R' },
  d30: { kind: 'scene', name: '劇照・出道舞台', rarity: 'SSR' },
};
