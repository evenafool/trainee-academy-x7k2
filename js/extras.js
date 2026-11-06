// 延伸字：每天 3 個，都挑自當天短劇／情境對話裡真的出現的字（教育部國中小英語參考字彙表為主）
// 上課流程：演完對話後「延伸字快閃」→ 跟念英文 → 收進單字本；舞台對話裡會用金色標出來
// ex：{ d: 對話第幾句, en: 英文要標亮的字, ko: 韓文要標亮的字 }，或 { s: [角色, 英, 韓, 拼音, 中], en, ko }（自訂例句）
const X = (id, emoji, zh, en, ko, kr, note, ex) => ({ id, emoji, zh, en, ko, kr, note, ex });
const C = (who, en, ko, kr, zh) => [who, en, ko, kr, zh];

export const EXTRAS = {
  d1: [
    X('what', '❓', '什麼', 'what', '뭐', 'mwo', '「뭐」是「무엇」的口語，問東西時用', { d: 1, en: 'What', ko: '뭐' }),
    X('my', '🙋', '我的', 'my', '제', 'je', '「제」＝「저의」，有禮貌地說「我的」', { d: 2, en: 'My', ko: '제' }),
    X('we', '👭', '我們', 'we', '우리', 'uri', '韓國人很愛說「우리」，連「我媽媽」都說「우리 엄마」', { s: C('me', 'We are friends!', '우리는 친구예요!', 'Urineun chinguyeyo!', '我們是朋友！'), en: 'We', ko: '우리' }),
  ],
  d2: [
    X('really', '😲', '真的', 'really', '진짜', 'jinjja', '「진짜요?」＝「真的嗎？」，韓劇超常聽到', { s: C('me', "Really? I didn't know!", '진짜요? 몰랐어요!', 'Jinjjayo? Mollasseoyo!', '真的嗎？我都不知道！'), en: 'Really', ko: '진짜' }),
    X('know', '💡', '知道', 'know', '알아요', 'arayo', '不知道是「몰라요 mollayo」，兩個一起記', { s: C('mina', "I know NOVA's song!", '노바 노래 알아요!', 'Noba norae arayo!', '我知道 NOVA 的歌！'), en: 'know', ko: '알아요' }),
    X('secret', '🤫', '祕密', 'secret', '비밀', 'bimil', '敏雅的祕密：她以前是練習生！', { s: C('mina', "It's a secret!", '비밀이에요!', 'Bimirieyo!', '這是祕密喔！'), en: 'secret', ko: '비밀' }),
  ],
  d3: [
    X('dangerous', '⚠️', '危險的', 'dangerous', '위험해요', 'wiheomhaeyo', '傳說開電風扇睡覺很危險…其實沒事啦！', { s: C('mina', "It's dangerous!", '위험해요!', 'Wiheomhaeyo!', '很危險！'), en: 'dangerous', ko: '위험해요' }),
    X('joke', '😜', '玩笑', 'joke', '농담', 'nongdam', '「농담이에요」＝我開玩笑的', { s: C('me', "It's just a joke!", '농담이에요!', 'Nongdamieyo!', '開玩笑的啦！'), en: 'joke', ko: '농담' }),
    X('air', '🌬️', '空氣', 'air', '공기', 'gonggi', '電風扇只是讓空氣流動，不會怎樣', { s: C('leo', 'The air is cool.', '공기가 시원해요.', 'Gonggiga siwonhaeyo.', '空氣好涼。'), en: 'air', ko: '공기' }),
  ],
  d4: [
    X('love', '💖', '愛', 'love', '사랑해요', 'saranghaeyo', '粉絲最常喊：「사랑해요！」', { s: C('me', 'I love you, NOVA!', '노바, 사랑해요!', 'Noba, saranghaeyo!', 'NOVA，我愛你！'), en: 'love', ko: '사랑해요' }),
    X('everyone', '🙌', '大家', 'everyone', '여러분', 'yeoreobun', '偶像對粉絲說話，常用「여러분」開頭', { s: C('nova', 'Everyone, thank you!', '여러분, 감사합니다!', 'Yeoreobun, gamsahamnida!', '大家，謝謝你們！'), en: 'Everyone', ko: '여러분' }),
    X('want', '💭', '想要', 'want', '하고 싶어요', 'hago sipeoyo', '「動作＋고 싶어요」＝想做某件事', { s: C('me', 'I want to stand on the stage.', '무대에 서고 싶어요.', 'Mudaee seogo sipeoyo.', '我想站上舞台。'), en: 'want', ko: '싶어요' }),
  ],
  d5: [
    X('when', '🕒', '什麼時候', 'when', '언제', 'eonje', '問時間的好朋友：when＝언제', { d: 1, en: 'When', ko: '언제' }),
    X('lucky', '🍀', '幸運的', 'lucky', '운이 좋아요', 'uni joayo', '搶到票就是「운이 좋아요」（運氣好）', { s: C('leo', 'Lucky you!', '운이 좋네요!', 'Uni jonneyo!', '你好幸運！'), en: 'Lucky', ko: '운이 좋' }),
    X('meet', '🤝', '見面', 'meet', '만나요', 'mannayo', '見面會的「見面」就是 meet', { s: C('me', 'I will meet NOVA!', '노바를 만나요!', 'Nobareul mannayo!', '我要見到 NOVA 了！'), en: 'meet', ko: '만나요' }),
  ],
  d6: [
    X('who', '🧐', '誰', 'who', '누구', 'nugu', '「누구예요?」＝是誰？', { d: 0, en: 'Who', ko: '누구' }),
    X('and', '➕', '還有、和', 'and', '그리고', 'geurigo', '句子開頭說「還有…」用「그리고」', { d: 3, en: 'And', ko: '그리고' }),
    X('can', '💪', '能、會', 'can', '할 수 있어요', 'hal su isseoyo', '露娜說：「할 수 있어요！」你可以的！', { s: C('nova', 'You can do it!', '할 수 있어요!', 'Hal su isseoyo!', '你可以的！'), en: 'can', ko: '할 수 있어요' }),
  ],
  d7: [
    X('have', '🎒', '有', 'have', '있어요', 'isseoyo', '「있어요」＝有；沒有是「없어요 eopseoyo」', { d: 0, en: 'have', ko: '있어요' }),
    X('too', '🙋‍♀️', '也', 'too', '저도요', 'jeodoyo', '「Me too!」＝「저도요！」我也是！', { d: 1, en: 'too', ko: '저도요' }),
    X('ask', '✋', '問', 'ask', '물어봐요', 'mureobwayo', '不會就問老師：「물어봐요！」', { d: 2, en: 'ask', ko: '물어봐요' }),
  ],
  d8: [
    X('finish', '✅', '做完', 'finish', '다 했어요', 'da haesseoyo', '「다 했어요」＝全部做完了', { d: 0, en: 'finish', ko: '다 했어요' }),
    X('library', '🏛️', '圖書館', 'library', '도서관', 'doseogwan', '「도서」是書、「관」是館，跟中文很像', { d: 2, en: 'library', ko: '도서관' }),
    X('good', '👍', '好的', 'good', '좋아요', 'joayo', '好主意、好喔，都可以說「좋아요」', { d: 3, en: 'Good', ko: '좋아요' }),
  ],
  d9: [
    X('busy', '🏃', '忙碌的', 'busy', '바빠요', 'bappayo', '「오늘은 바빠요」＝今天很忙', { d: 1, en: 'busy', ko: '바빠요' }),
    X('but', '🔀', '但是', 'but', '하지만', 'hajiman', '轉折語氣：busy, but…＝忙，但是…', { d: 1, en: 'but', ko: '하지만' }),
    X('see', '👀', '看見', 'see', '봐요', 'bwayo', '「내일 봐요」＝明天見', { d: 3, en: 'See', ko: '봐요' }),
  ],
  d10: [
    X('try', '🥤', '試試看', 'try', '마셔 봐요', 'masyeo bwayo', '「動作＋어 봐요」＝試試看，這裡是「喝喝看」', { d: 0, en: 'Try', ko: '마셔 봐요' }),
    X('thirsty', '🥵', '口渴的', 'thirsty', '목말라요', 'mongmallayo', '「목」是喉嚨，「말라요」是乾：喉嚨乾＝口渴', { d: 3, en: 'thirsty', ko: '목말라요' }),
    X('please', '🙏', '請', 'please', '주세요', 'juseyo', '點東西時「東西＋주세요」就好', { d: 3, en: 'please', ko: '주세요' }),
  ],
  d11: [
    X('money', '💰', '錢', 'money', '돈', 'don', '韓國的錢叫「원 won」', { s: C('me', 'I saved my money!', '돈을 모았어요!', 'Doneul moasseoyo!', '我存了錢！'), en: 'money', ko: '돈' }),
    X('price', '🏷️', '價錢', 'price', '가격', 'gagyeok', '問價錢也可以直接說「얼마예요?」', { s: C('mina', 'What is the price?', '가격이 얼마예요?', 'Gagyeogi eolmayeyo?', '價錢是多少？'), en: 'price', ko: '가격' }),
    X('sell', '🛍️', '賣', 'sell', '팔아요', 'parayo', '買是「사요」、賣是「팔아요」，一對反義詞', { s: C('leo', 'They sell albums here.', '여기서 앨범을 팔아요.', 'Yeogiseo aelbeomeul parayo.', '這裡有賣專輯。'), en: 'sell', ko: '팔아요' }),
  ],
  d12: [
    X('come', '🛬', '來', 'come', '와요', 'wayo', '來是「와요」、去是「가요」', { d: 0, en: 'Come', ko: '와요' }),
    X('next', '⏭️', '下一個', 'next', '다음', 'daeum', '「다음 달」＝下個月、「다음 주」＝下星期', { d: 0, en: 'next', ko: '다음' }),
    X('go', '🚶', '去', 'go', '가요', 'gayo', '「한국에 가요」＝去韓國', { s: C('me', 'I go to Korea!', '한국에 가요!', 'Hanguge gayo!', '我要去韓國！'), en: 'go', ko: '가요' }),
  ],
  d13: [
    X('from', '🧳', '來自', 'from', '에서 왔어요', 'eseo wasseoyo', '自我介紹必備：저는 대만에서 왔어요（我來自台灣）', { d: 1, en: 'from', ko: '에서 왔어요' }),
    X('here', '📍', '這裡', 'here', '여기', 'yeogi', '這裡 여기、那裡 저기，一組記', { s: C('seoyun', 'Here is your room.', '여기가 방이에요.', 'Yeogiga bangieyo.', '這裡是你的房間。'), en: 'Here', ko: '여기' }),
    X('window', '🪟', '窗戶', 'window', '창문', 'changmun', '宿舍窗戶看得到首爾的夜景', { s: C('me', 'I can see Seoul from the window!', '창문으로 서울이 보여요!', 'Changmuneuro seouri boyeoyo!', '從窗戶可以看到首爾！'), en: 'window', ko: '창문' }),
  ],
  d14: [
    X('look', '👁️', '看', 'look', '보세요', 'boseyo', '「보세요」＝請看（客氣地說）', { d: 0, en: 'look', ko: '보세요' }),
    X('wrong', '❌', '錯的', 'wrong', '틀렸어요', 'teullyeosseoyo', '答錯、跳錯都可以說「틀렸어요」', { d: 1, en: 'wrong', ko: '틀렸어요' }),
    X('more', '📈', '更多', 'more', '더', 'deo', '「더 연습할게요」＝我會再多練習', { d: 3, en: 'more', ko: '더' }),
  ],
  d15: [
    X('hear', '👂', '聽到', 'hear', '들었어요', 'deureosseoyo', 'hear 是「聽到」、listen 是「專心聽」，考試常考', { d: 0, en: 'hear', ko: '들었어요' }),
    X('turnon', '🔆', '打開（電器）', 'turn on', '켜요', 'kyeoyo', '開燈＝불 켜요；關燈＝불 꺼요', { d: 1, en: 'Turn on', ko: '켜' }),
    X('quiet', '🔇', '安靜的', 'quiet', '조용해요', 'joyonghaeyo', '半夜要小聲：「조용히 해요」', { s: C('seoyun', 'Be quiet, please.', '조용히 해 주세요.', 'Joyonghi hae juseyo.', '請安靜。'), en: 'quiet', ko: '조용' }),
  ],
  d16: [
    X('wakeup', '⏰', '起床', 'wake up', '일어나요', 'ireonayo', '「일어나요！」＝起床啦！', { d: 0, en: 'Wake up', ko: '일어나요' }),
    X('tonight', '🌙', '今晚', 'tonight', '오늘 밤', 'oneul bam', '「오늘」今天＋「밤」晚上＝今晚', { d: 2, en: 'tonight', ko: '오늘' }),
    X('clock', '🕰️', '時鐘', 'clock', '시계', 'sigye', '時鐘、手錶在韓文都叫「시계」', { s: C('seoyun', "Look at the clock! It's six!", '시계 봐요! 여섯 시예요!', 'Sigye bwayo! Yeoseot siyeyo!', '看時鐘！六點了！'), en: 'clock', ko: '시계' }),
  ],
  d17: [
    X('after', '⏩', '在…之後', 'after', '후에', 'hue', '「수업 후에」＝下課後', { d: 0, en: 'after', ko: '후에' }),
    X('need', '🔋', '需要', 'need', '필요해요', 'piryohaeyo', '「힘이 필요해요」＝需要力氣', { d: 3, en: 'need', ko: '필요해요' }),
    X('well', '😋', '好好地', 'well', '잘', 'jal', '「잘 먹어요」好好吃飯、「잘 자요」晚安', { d: 3, en: 'well', ko: '잘' }),
  ],
  d18: [
    X('stop', '🛑', '停下', 'stop', '멈춰요', 'meomchwoyo', '「멈춰！」＝停！', { d: 1, en: 'Stop', ko: '멈춰요' }),
    X('health', '🩺', '健康', 'health', '건강', 'geongang', '健康第一：「건강이 먼저예요」', { d: 3, en: 'Health', ko: '건강' }),
    X('careful', '🦺', '小心的', 'careful', '조심해요', 'josimhaeyo', '「조심해요！」＝小心！', { s: C('coach', 'Be careful!', '조심해요!', 'Josimhaeyo!', '要小心！'), en: 'careful', ko: '조심해요' }),
  ],
  d19: [
    X('happen', '❔', '發生', 'happen', '무슨 일', 'museun il', '「무슨 일이에요?」＝發生什麼事了？', { d: 0, en: 'happened', ko: '무슨 일' }),
    X('holiday', '🏖️', '假期', 'holiday', '휴가', 'hyuga', '放假可以回台灣了！', { d: 2, en: 'holiday', ko: '휴가' }),
    X('visit', '🏡', '拜訪', 'visit', '방문해요', 'bangmunhaeyo', '「방문」＝訪問，跟中文發音很像', { s: C('me', 'I will visit my grandma.', '할머니 댁에 방문할 거예요.', 'Halmeoni daege bangmunhal geoyeyo.', '我要去拜訪奶奶。'), en: 'visit', ko: '방문' }),
  ],
  d20: [
    X('very', '💯', '非常', 'very', '아주', 'aju', '「아주 오래됐어요」＝非常古老', { d: 1, en: 'very', ko: '아주' }),
    X('wall', '🧱', '牆壁', 'wall', '벽', 'byeok', '劍獅掛在房子的牆上，保護一家人', { s: C('me', 'The lion is on the wall.', '사자가 벽에 있어요.', 'Sajaga byeoge isseoyo.', '獅子在牆上。'), en: 'wall', ko: '벽' }),
    X('temple', '🛕', '寺廟', 'temple', '절', 'jeol', '台南有好多老廟，韓文的寺廟叫「절」', { s: C('mina', 'Tainan has many old temples.', '타이난에는 오래된 절이 많아요.', 'Tainaneneun oraedoen jeori manayo.', '台南有很多老廟。'), en: 'temples', ko: '절' }),
  ],
  d21: [
    X('alittle', '🤏', '一點點', 'a little', '조금', 'jogeum', '「조금요」＝一點點', { d: 1, en: 'A little', ko: '조금' }),
    X('smell', '👃', '味道', 'smell', '냄새', 'naemsae', '臭豆腐：聞起來臭、吃起來香！', { s: C('mina', 'What is that smell?', '이게 무슨 냄새예요?', 'Ige museun naemsaeyeyo?', '這是什麼味道？'), en: 'smell', ko: '냄새' }),
    X('food', '🍢', '食物', 'food', '음식', 'eumsik', '「대만 음식」＝台灣料理', { s: C('me', 'Taiwanese food is the best!', '대만 음식 최고예요!', 'Daeman eumsik choegoyeyo!', '台灣食物最棒了！'), en: 'food', ko: '음식' }),
  ],
  d22: [
    X('make', '🛠️', '做、組成', 'make', '만들어요', 'mandeureoyo', '做蛋糕、組隊伍，都可以用「만들어요」', { d: 0, en: 'Make', ko: '만들어요' }),
    X('same', '🟰', '一樣的', 'same', '같은', 'gateun', '「같은 팀」＝同一隊', { s: C('me', 'We are on the same team!', '우리 같은 팀이에요!', 'Uri gateun timieyo!', '我們同一隊！'), en: 'same', ko: '같은' }),
    X('group', '👯', '團體', 'group', '그룹', 'geurup', 'K-pop 團體就叫「그룹」', { s: C('coach', 'Make a group of four.', '네 명씩 그룹을 만들어요.', 'Ne myeongssik geurubeul mandeureoyo.', '四個人一組。'), en: 'group', ko: '그룹' }),
  ],
  d23: [
    X('before', '⏪', '在…之前', 'before', '전에', 'jeone', 'before 之前、after 之後，一對記', { d: 2, en: 'before', ko: '전에' }),
    X('twelve', '🕛', '十二', 'twelve', '열둘', 'yeoldul', '說幾點用「열두 시」（十二點）', { d: 2, en: 'twelve', ko: '열두' }),
    X('finger', '🤙', '手指', 'finger', '손가락', 'songarak', '打勾勾用小指：새끼손가락', { s: C('seoyun', 'Give me your little finger!', '새끼손가락 줘요!', 'Saekkisongarak jwoyo!', '小指伸出來！'), en: 'finger', ko: '손가락' }),
  ],
  d24: [
    X('front', '⬆️', '前面', 'front', '앞', 'ap', '「앞으로 나와요」＝到前面來', { d: 0, en: 'front', ko: '앞' }),
    X('ninety', '9️⃣', '九十', 'ninety', '구십', 'gusip', '95 分＝구십오 점（漢字數字）', { d: 2, en: 'Ninety', ko: '95' }),
    X('point', '🎯', '分（分數）', 'point', '점', 'jeom', '「95점」＝95 分', { d: 2, en: 'points', ko: '점' }),
  ],
  d25: [
    X('where', '🧭', '哪裡', 'where', '어디', 'eodi', '問路必備：「어디예요?」＝在哪裡？', { d: 0, en: 'Where', ko: '어디' }),
    X('think', '🤔', '認為、覺得', 'think', '것 같아요', 'geot gatayo', '「…것 같아요」＝我覺得好像…', { d: 1, en: 'think', ko: '것 같아요' }),
    X('map', '🗺️', '地圖', 'map', '지도', 'jido', '迷路了就看「지도」', { d: 2, en: 'map', ko: '지도' }),
  ],
  d26: [
    X('wet', '💦', '濕的', 'wet', '젖었어요', 'jeojeosseoyo', '淋雨全身濕：「다 젖었어요」', { d: 1, en: 'wet', ko: '젖었' }),
    X('cut', '✂️', '剪', 'cut', '깎아요', 'kkakkayo', '剪指甲用「깎다」；剪頭髮用「자르다」', { d: 2, en: 'cut', ko: '깎' }),
    X('nail', '💅', '指甲', 'nail', '손톱', 'sontop', '韓國傳說：晚上剪指甲，老鼠吃了會變成你！', { d: 2, en: 'nails', ko: '손톱' }),
  ],
  d27: [
    X('free', '🆓', '免費的', 'free', '공짜', 'gongjja', '1+1 就是買一送一，第二個免費！', { s: C('leo', 'Buy one, get one free!', '하나 사면 하나 공짜!', 'Hana samyeon hana gongjja!', '買一送一！'), en: 'free', ko: '공짜' }),
    X('half', '🌗', '一半', 'half', '반', 'ban', '「반반」＝一人一半', { s: C('me', "Let's share half and half.", '반반 나눠 먹어요.', 'Banban nanwo meogeoyo.', '我們一人一半。'), en: 'half', ko: '반반' }),
    X('candy', '🍬', '糖果', 'candy', '사탕', 'satang', '餅乾零食是「과자」、糖果是「사탕」', { s: C('mina', 'I want this candy!', '이 사탕 갖고 싶어요!', 'I satang gatgo sipeoyo!', '我想要這顆糖果！'), en: 'candy', ko: '사탕' }),
  ],
  d28: [
    X('dress', '👗', '洋裝', 'dress', '원피스', 'wonpiseu', '韓文的洋裝叫「원피스」（one-piece）', { s: C('mina', 'Try on this dress!', '이 원피스 입어 봐요!', 'I wonpiseu ibeo bwayo!', '試穿這件洋裝！'), en: 'dress', ko: '원피스' }),
    X('shoes', '👟', '鞋子', 'shoes', '신발', 'sinbal', '一雙鞋要說 shoes（加 s）', { s: C('me', 'The shoes are white too!', '신발도 흰색이에요!', 'Sinbaldo huinsaegieyo!', '鞋子也是白色的！'), en: 'shoes', ko: '신발' }),
    X('hat', '🧢', '帽子', 'hat', '모자', 'moja', '戴帽子的「戴」韓文用「쓰다」', { s: C('mina', 'Wear this hat too!', '이 모자도 써요!', 'I mojado sseoyo!', '這頂帽子也戴上！'), en: 'hat', ko: '모자' }),
  ],
  d29: [
    X('ready', '🚦', '準備好的', 'ready', '준비됐어요', 'junbidwaesseoyo', '上台前問：「준비됐어요?」準備好了嗎？', { s: C('coach', 'Are you ready?', '준비됐어요?', 'Junbidwaesseoyo?', '準備好了嗎？'), en: 'ready', ko: '준비됐어요' }),
    X('heart', '💓', '心', 'heart', '마음', 'maeum', '用心唱歌：「마음으로 노래해요」', { s: C('seoyun', 'Sing with your heart.', '마음으로 노래해요.', 'Maeumeuro noraehaeyo.', '用心唱歌。'), en: 'heart', ko: '마음' }),
    X('voice', '🎙️', '（人的）聲音', 'voice', '목소리', 'moksori', '人的聲音是「목소리」，一般聲響是「소리」', { s: C('coach', 'Your voice is so good!', '목소리 정말 좋아요!', 'Moksori jeongmal joayo!', '你的聲音真好聽！'), en: 'voice', ko: '목소리' }),
  ],
  d30: [
    X('cometrue', '🌈', '實現、成真', 'come true', '이루어져요', 'irueojyeoyo', '「꿈은 이루어져요」＝夢想會成真', { d: 2, en: 'come true', ko: '이루어져요' }),
    X('famous', '🌟', '有名的', 'famous', '유명해요', 'yumyeonghaeyo', '「유명」就是中文的「有名」，發音很像', { s: C('leo', 'You will be famous!', '유명해질 거예요!', 'Yumyeonghaejil geoyeyo!', '你會變有名的！'), en: 'famous', ko: '유명' }),
    X('shine', '✨', '閃耀', 'shine', '빛나요', 'binnayo', '「빛」是光，「빛나요」＝發光、閃耀', { s: C('nova', 'You shine on the stage!', '무대에서 빛나요!', 'Mudaeeseo binnayo!', '你在舞台上閃閃發光！'), en: 'shine', ko: '빛나요' }),
  ],
  d31: [
    X('show', '🎬', '節目', 'show', '방송', 'bangsong', '音樂節目＝음악 방송，簡稱「음방」', { d: 0, en: 'show', ko: '방송' }),
    X('take', '📸', '拍（照）', 'take', '찍어요', 'jjigeoyo', '拍照：take a photo＝사진 찍어요', { d: 3, en: 'take', ko: '찍어도' }),
    X('tv', '📺', '電視', 'TV', '텔레비전', 'tellebijeon', 'TV＝television；韓文口語常說「티비」', { s: C('mina', 'Grandma is watching you on TV!', '할머니가 텔레비전으로 보고 있어요!', 'Halmeoniga tellebijeoneuro bogo isseoyo!', '奶奶在電視上看你！'), en: 'TV', ko: '텔레비전' }),
  ],
  d32: [
    X('never', '🚫', '從來不', 'never', '한 번도 안', 'han beondo an', '「한 번도 안…」＝一次都沒有…', { d: 2, en: 'never', ko: '한 번도 안' }),
    X('part', '🧩', '部分', 'part', '일부', 'ilbu', '「꿈의 일부」＝夢想的一部分', { d: 3, en: 'part', ko: '일부' }),
    X('correct', '✔️', '正確的', 'correct', '맞아요', 'majayo', '答對了就說「맞아요！」', { s: C('kong', 'Correct! Good job!', '맞아요! 잘했어요!', 'Majayo! Jalhaesseoyo!', '答對了！做得好！'), en: 'Correct', ko: '맞아요' }),
  ],
  d33: [
    X('ghost', '👻', '鬼', 'ghost', '귀신', 'gwisin', '韓國的「도깨비」是愛惡作劇的妖怪，不是鬼喔', { s: C('me', 'Is it a ghost?!', '귀신이에요?!', 'Gwisinieyo?!', '是鬼嗎？！'), en: 'ghost', ko: '귀신' }),
    X('hide', '🙈', '躲', 'hide', '숨어요', 'sumeoyo', '捉迷藏＝숨바꼭질', { s: C('seoyun', 'Hide behind me!', '제 뒤에 숨어요!', 'Je dwie sumeoyo!', '躲到我後面！'), en: 'Hide', ko: '숨어요' }),
    X('behind', '🔙', '在…後面', 'behind', '뒤에', 'dwie', '前面 앞、後面 뒤，一組記', { s: C('me', 'Something is behind the door!', '문 뒤에 뭐가 있어요!', 'Mun dwie mwoga isseoyo!', '門後面有東西！'), en: 'behind', ko: '뒤에' }),
  ],
  d34: [
    X('quick', '⚡', '快', 'quick', '빨리', 'ppalli', '韓國人口頭禪「빨리빨리」＝快點快點', { d: 1, en: 'quick', ko: '빨리' }),
    X('tell', '🗣️', '告訴', 'tell', '말해 줘요', 'malhae jwoyo', '「말해 줘요」＝告訴我嘛', { d: 1, en: 'Tell', ko: '말해 줘요' }),
    X('chance', '🎟️', '機會', 'chance', '기회', 'gihoe', '一位候補，這是大好機會！', { s: C('mina', 'This is your chance!', '이건 기회예요!', 'Igeon gihoeyeyo!', '這是你的機會！'), en: 'chance', ko: '기회' }),
  ],
  d35: [
    X('already', '⌛', '已經', 'already', '벌써', 'beolsseo', '「벌써」＝已經（比想像的早）', { d: 0, en: 'already', ko: '벌써' }),
    X('why', '🤷', '為什麼', 'why', '왜', 'wae', '「왜요?」＝為什麼？', { d: 0, en: 'Why', ko: '왜' }),
    X('bed', '🛏️', '床', 'bed', '침대', 'chimdae', 'go to bed＝上床睡覺', { s: C('seoyun', 'Go to bed early!', '일찍 침대에 누워요!', 'Iljjik chimdaee nuwoyo!', '早點上床！'), en: 'bed', ko: '침대' }),
  ],
  d36: [
    X('cheer', '📣', '加油、歡呼', 'cheer', '응원해요', 'eungwonhaeyo', '粉絲的應援就是 cheer！', { s: C('me', 'Thank you for cheering for us!', '응원해 줘서 고마워요!', 'Eungwonhae jwoseo gomawoyo!', '謝謝你們幫我們加油！'), en: 'cheering', ko: '응원' }),
    X('clap', '👏', '拍手', 'clap', '박수', 'baksu', '「박수 쳐 주세요」＝請拍手', { s: C('mina', 'Everyone is clapping!', '모두 박수 쳐요!', 'Modu baksu chyeoyo!', '大家都在拍手！'), en: 'clapping', ko: '박수' }),
    X('shout', '📢', '大喊', 'shout', '소리쳐요', 'sorichyeoyo', '「소리」聲音＋「쳐요」＝大喊', { s: C('leo', 'The fans shout your name!', '팬들이 이름을 소리쳐요!', 'Paendeuri ireumeul sorichyeoyo!', '粉絲大喊你的名字！'), en: 'shout', ko: '소리쳐요' }),
  ],
  d37: [
    X('radio', '📻', '廣播、電台', 'radio', '라디오', 'radio', '韓文直接借英文：라디오', { s: C('me', 'I am on the radio!', '라디오에 나왔어요!', 'Radioe nawasseoyo!', '我上電台了！'), en: 'radio', ko: '라디오' }),
    X('word', '🔤', '字、單字', 'word', '단어', 'daneo', '「영어 단어」＝英文單字', { s: C('leo', 'Say one English word!', '영어 단어 하나 말해 봐요!', 'Yeongeo daneo hana malhae bwayo!', '說一個英文單字！'), en: 'word', ko: '단어' }),
    X('sentence', '📝', '句子', 'sentence', '문장', 'munjang', '造句＝문장을 만들어요', { s: C('kong', 'Make a sentence in English.', '영어로 문장을 만들어요.', 'Yeongeoro munjangeul mandeureoyo.', '用英文造一個句子。'), en: 'sentence', ko: '문장' }),
  ],
  d38: [
    X('game', '🎮', '遊戲', 'game', '게임', 'geim', '綜藝節目最愛玩遊戲！', { s: C('mina', "Let's play a dance game!", '댄스 게임 해요!', 'Daenseu geim haeyo!', '來玩跳舞遊戲！'), en: 'game', ko: '게임' }),
    X('funny', '🤣', '好笑的', 'funny', '웃겨요', 'utgyeoyo', 'fun 是好玩、funny 是好笑，考試常考！', { s: C('leo', 'Your dance is so funny!', '춤이 너무 웃겨요!', 'Chumi neomu utgyeoyo!', '你的舞好好笑！'), en: 'funny', ko: '웃겨요' }),
    X('follow', '👣', '跟著（做）', 'follow', '따라 해요', 'ttara haeyo', '「따라 해요」＝跟著我做', { s: C('coach', 'Follow me! One, two!', '따라 해요! 하나, 둘!', 'Ttara haeyo! Hana, dul!', '跟著我做！一、二！'), en: 'Follow', ko: '따라 해요' }),
  ],
  d39: [
    X('tomato', '🍅', '番茄', 'tomato', '토마토', 'tomato', '番茄炒蛋＝토마토 달걀 볶음', { d: 2, en: 'tomatoes', ko: '토마토' }),
    X('kitchen', '🍽️', '廚房', 'kitchen', '부엌', 'bueok', '宿舍的小廚房也能煮台灣菜', { s: C('seoyun', "Let's go to the kitchen!", '부엌으로 가요!', 'Bueogeuro gayo!', '去廚房吧！'), en: 'kitchen', ko: '부엌' }),
    X('fry', '🍳', '炒、煎', 'fry', '볶아요', 'bokkayo', '番茄炒蛋的「炒」', { s: C('me', 'I fry the eggs and tomatoes.', '계란이랑 토마토를 볶아요.', 'Gyeranirang tomatoreul bokkayo.', '我把蛋和番茄一起炒。'), en: 'fry', ko: '볶아요' }),
  ],
  d40: [
    X('some', '🧑‍🤝‍🧑', '有些、一些', 'some', '어떤', 'eotteon', '「어떤 팬」＝有些粉絲', { d: 2, en: 'Some', ko: '어떤' }),
    X('pen', '🖊️', '筆', 'pen', '펜', 'pen', '簽名要用簽字筆', { s: C('mina', 'Here is a pen for you.', '여기 펜이요.', 'Yeogi penieyo.', '筆給你。'), en: 'pen', ko: '펜' }),
    X('card', '🪪', '卡片', 'card', '카드', 'kadeu', '小卡在韓文叫「포카」（photo card）', { s: C('me', 'I wrote a card for my fan.', '팬에게 카드를 썼어요.', 'Paenege kadeureul sseosseoyo.', '我寫了一張卡片給粉絲。'), en: 'card', ko: '카드' }),
  ],
  d41: [
    X('all', '🌐', '全部', 'all', '다', 'da', '「다 읽어요」＝全部讀完', { d: 0, en: 'all', ko: '다' }),
    X('paper', '📄', '紙', 'paper', '종이', 'jongi', '信紙＝편지지', { s: C('me', 'Pink paper, pink letters!', '분홍색 종이, 분홍색 편지!', 'Bunhongsaek jongi, bunhongsaek pyeonji!', '粉紅色的紙、粉紅色的信！'), en: 'paper', ko: '종이' }),
    X('envelope', '✉️', '信封', 'envelope', '봉투', 'bongtu', '紅包袋在韓國也叫「봉투」', { s: C('seoyun', 'Open the envelope!', '봉투를 열어 봐요!', 'Bongtureul yeoreo bwayo!', '打開信封看看！'), en: 'envelope', ko: '봉투' }),
  ],
  d42: [
    X('surprise', '🎉', '驚喜', 'surprise', '깜짝', 'kkamjjak', '「깜짝 파티」＝驚喜派對', { d: 0, en: 'Surprise', ko: '깜짝' }),
    X('party', '🥳', '派對', 'party', '파티', 'pati', '韓文直接借英文：파티', { s: C('me', "Let's have a party!", '파티해요!', 'Patihaeyo!', '來開派對吧！'), en: 'party', ko: '파티' }),
    X('candle', '🕯️', '蠟燭', 'candle', '초', 'cho', '生日蠟燭＝생일 초', { s: C('leo', 'Blow out the candles!', '초를 꺼요!', 'Choreul kkeoyo!', '吹蠟燭！'), en: 'candles', ko: '초' }),
  ],
  d43: [
    X('leave', '🛫', '出發、離開', 'leave', '출발해요', 'chulbalhaeyo', '「출발」＝出發，跟中文很像', { d: 0, en: 'leaves', ko: '출발해요' }),
    X('hour', '⏳', '小時', 'hour', '시간', 'sigan', '「시간」可以是時間，也可以是「小時」', { d: 0, en: 'hour', ko: '시간' }),
    X('trip', '🏝️', '旅行', 'trip', '여행', 'yeohaeng', '「좋은 여행 되세요」＝旅途愉快', { s: C('mina', 'Have a good trip!', '좋은 여행 되세요!', 'Joeun yeohaeng doeseyo!', '旅途愉快！'), en: 'trip', ko: '여행' }),
  ],
  d44: [
    X('there', '👉', '那裡', 'there', '저기', 'jeogi', 'over there＝저기（那邊）', { d: 0, en: 'over there', ko: '저기' }),
    X('hold', '🪧', '拿著、舉著', 'hold', '들고 있어요', 'deulgo isseoyo', '舉著應援牌：「들고 있어요」', { d: 0, en: 'holding', ko: '들고' }),
    X('feel', '🤗', '感覺', 'feel', '느껴요', 'neukkyeoyo', '回到台北，有回家的感覺', { s: C('me', 'I feel warm at home.', '집에서 따뜻함을 느껴요.', 'Jibeseo ttatteuthameul neukkyeoyo.', '在家感覺好溫暖。'), en: 'feel', ko: '느껴요' }),
  ],
  d45: [
    X('river', '🏞️', '河', 'river', '강', 'gang', '首爾有漢江「한강」', { d: 2, en: 'river', ko: '강' }),
    X('find', '🔍', '找到', 'find', '찾아요', 'chajayo', 'find 的過去式是 found', { d: 2, en: 'found', ko: '찾' }),
    X('full', '🈵', '滿的', 'full', '가득해요', 'gadeukhaeyo', '吃飽了是「배불러요」', { d: 3, en: 'full', ko: '가득해요' }),
  ],
  d46: [
    X('wear', '👚', '穿', 'wear', '입어요', 'ibeoyo', '穿衣服用「입어요」、戴帽子用「써요」', { d: 2, en: 'Wear', ko: '입어요' }),
    X('coat', '🧥', '外套', 'coat', '코트', 'koteu', '首爾的冬天一定要穿厚外套', { s: C('seoyun', 'Wear my coat!', '제 코트 입어요!', 'Je koteu ibeoyo!', '穿我的外套吧！'), en: 'coat', ko: '코트' }),
    X('wish', '🌠', '願望', 'wish', '소원', 'sowon', '韓國說：初雪的時候許願會成真！', { d: 3, en: 'wish', ko: '소원' }),
  ],
  d47: [
    X('give', '🤲', '給', 'give', '줘요', 'jwoyo', '「손 줘 봐요」＝把手給我', { d: 0, en: 'Give', ko: '줘' }),
    X('beautiful', '🌹', '美麗的', 'beautiful', '아름다워요', 'areumdawoyo', 'pretty 是可愛漂亮、beautiful 是很美', { s: C('me', 'The sea of lights is beautiful!', '불빛 바다가 아름다워요!', 'Bulbit badaga areumdawoyo!', '燈海好美！'), en: 'beautiful', ko: '아름다워요' }),
    X('wave', '🖐️', '揮手', 'wave', '손을 흔들어요', 'soneul heundeureoyo', '走紅毯要向粉絲揮手', { s: C('nova', 'Wave to the fans!', '팬들에게 손을 흔들어요!', 'Paendeurege soneul heundeureoyo!', '向粉絲揮手！'), en: 'Wave', ko: '흔들어요' }),
  ],
  d48: [
    X('get', '🏅', '得到', 'get', '받아요', 'badayo', 'get 的過去式是 got', { d: 0, en: 'got', ko: '받았어요' }),
    X('future', '🔮', '未來', 'future', '미래', 'mirae', '「미래」＝未來，發音很像', { s: C('nova', 'Your future is bright!', '미래가 밝아요!', 'Miraega balgayo!', '你的未來很光明！'), en: 'future', ko: '미래' }),
    X('life', '🌱', '人生、生活', 'life', '인생', 'insaeng', '「인생 최고의 날」＝人生最棒的一天', { s: C('me', 'This is the best day of my life!', '인생 최고의 날이에요!', 'Insaeng choegoui narieyo!', '這是我人生最棒的一天！'), en: 'life', ko: '인생' }),
  ],
};
