// 國中 1,200 字庫：教育部「參考字彙表」基本 1,200 字裡，主線課程還沒教到的字（依字表的主題分組）
// 每行：英文|中文|韓文|韓文拼音|圖示|韓文字典形（動詞、形容詞才填，給考試對照用）
// 主線（每日關卡＋延伸字＋章末主題）已經教過的字不會重複出現在這裡；用 node tools/exam-map.mjs --missing 檢查還缺哪些
const BANK_RAW = [
  ['people', '人物', 'People', '🧑', `
boy|男孩|남자아이|namjaai|👦
girl|女孩|여자아이|yeojaai|👧
child|小孩|아이|ai|🧒
kid|小朋友|꼬마|kkoma|🧒
man|男人|남자|namja|👨
woman|女人|여자|yeoja|👩
guy|傢伙、男生|녀석|nyeoseok|🧔
people|人們|사람들|saramdeul|👥
neighbor|鄰居|이웃|iut|🏘️
stranger|陌生人|낯선 사람|natseon saram|🕵️
visitor|訪客|방문객|bangmungaek|🧳
teenager|青少年|십 대|sip dae|🧑‍🎤
king|國王|왕|wang|🤴
queen|女王|여왕|yeowang|👸
giant|巨人|거인|geoin|🗿
fool|傻瓜|바보|babo|🤪`],
  ['character', '個性和外表', 'Personal characteristics', '💁', `
tall|高的（身高）|키가 커요|kiga keoyo|🦒|크다
young|年輕的|어려요|eoryeoyo|👶|어리다
fat|胖的|뚱뚱해요|ttungttunghaeyo|🍩|뚱뚱하다
thin|瘦的；薄的|말랐어요|mallasseoyo|🥢|마르다
slim|苗條的|날씬해요|nalssinhaeyo|💃|날씬하다
handsome|英俊的|잘생겼어요|jalsaenggyeosseoyo|😎|잘생기다
ugly|醜的|못생겼어요|motsaenggyeosseoyo|👹|못생기다
blind|看不見的|눈이 안 보여요|nuni an boyeoyo|🦯|보이다
bad|壞的、不好的|나빠요|nappayo|👎|나쁘다
boring|無聊的（讓人覺得）|지루해요|jiruhaeyo|🥱|지루하다
exciting|刺激有趣的|흥미진진해요|heungmijinjinhaeyo|🎢|흥미진진하다
crazy|瘋狂的|미쳤어요|michyeosseoyo|🤪|미치다
friendly|友善的|다정해요|dajeonghaeyo|😊|다정하다
hard-working|勤勞的|부지런해요|bujireonhaeyo|🐝|부지런하다
honest|誠實的|정직해요|jeongjikaeyo|😇|정직하다
interested|感興趣的|관심 있어요|gwansim isseoyo|👀|관심
lazy|懶惰的|게을러요|geeulleoyo|🦥|게으르다
lovely|可愛的、美好的|사랑스러워요|sarangseureowoyo|🥰|사랑스럽다
mad|生氣的；瘋的|화났어요|hwanasseoyo|😠|화나다
polite|有禮貌的|예의 발라요|yeui ballayo|🙇|예의
poor|窮的；可憐的|가난해요|gananhaeyo|🥺|가난하다
rich|有錢的|부자예요|bujayeyo|🤑|부자
scared|害怕的|겁이 나요|geobi nayo|😨|겁
smart|聰明的|똑똑해요|ttokttokaeyo|🧠|똑똑하다
stupid|笨的|멍청해요|meongcheonghaeyo|🙃|멍청하다
successful|成功的|성공했어요|seonggonghaesseoyo|🏆|성공하다
unhappy|不快樂的|불행해요|bulhaenghaeyo|😞|불행하다
wise|有智慧的|지혜로워요|jihyerowoyo|🦉|지혜롭다`],
  ['body', '身體部位', 'Parts of body', '🫀', `
hair|頭髮|머리카락|meorikarak|💇
lip|嘴唇|입술|ipsul|👄
body|身體|몸|mom|🧍
back|背部；後面|등|deung|🔙
neck|脖子|목|mok|🧣
shoulder|肩膀|어깨|eokkae|🤷
knee|膝蓋|무릎|mureup|🦵
toe|腳趾|발가락|balgarak|🦶
throat|喉嚨|목구멍|mokgumeong|🗣️
stomach|肚子、胃|배|bae|🫃`],
  ['health', '健康', 'Health', '🩺', `
healthy|健康的|건강해요|geonganghaeyo|🍎|건강하다
sick|生病的|아파요|apayo|🤒|아프다
strong|強壯的|힘이 세요|himi seyo|💪|세다
weak|虛弱的|약해요|yakaeyo|🥀|약하다
comfortable|舒服的|편해요|pyeonhaeyo|🛋️|편하다
headache|頭痛|두통|dutong|🤕
fever|發燒|열|yeol|🌡️
medicine|藥|약|yak|💊
death|死亡|죽음|jugeum|🪦`],
  ['address', '稱呼', 'Forms of address', '🎩', `
Mr.|先生（放在姓前面）|씨|ssi|👨‍💼
Mrs.|太太（放在姓前面）|여사|yeosa|👩‍💼
Ms.|女士（放在姓前面）|씨|ssi|👩
sir|先生（尊稱）|선생님|seonsaengnim|🎩`],
  ['family', '家人', 'Family', '👨‍👩‍👧', `
son|兒子|아들|adeul|👦
daughter|女兒|딸|ttal|👧
husband|丈夫|남편|nampyeon|🤵
wife|妻子|아내|anae|👰
relative|親戚|친척|chincheok|👪
born|出生|태어났어요|taeeonasseoyo|👶|태어나다
grow|長大；種|자라요|jarayo|📏|자라다
live|住；生活|살아요|sarayo|🏠|살다
married|結婚的|결혼했어요|gyeolhonhaesseoyo|💒|결혼하다`],
  ['numbers', '數字', 'Numbers', '🔢', `
zero|零|영|yeong|0️⃣
eleven|十一|십일|sibil|🔢
thirteen|十三|십삼|sipsam|🔢
fourteen|十四|십사|sipsa|🔢
fifteen|十五|십오|sibo|🔢
sixteen|十六|십육|simnyuk|🔢
seventeen|十七|십칠|sipchil|🔢
eighteen|十八|십팔|sippal|🔢
nineteen|十九|십구|sipgu|🔢
twenty|二十|이십|isip|🔢
thirty|三十|삼십|samsip|🔢
forty|四十|사십|sasip|🔢
fifty|五十|오십|osip|🔢
sixty|六十|육십|yuksip|🔢
seventy|七十|칠십|chilsip|🔢
eighty|八十|팔십|palsip|🔢
hundred|一百|백|baek|💯
thousand|一千|천|cheon|🔢
million|一百萬|백만|baengman|💰
second|第二（的）；秒|두 번째|du beonjjae|🥈
third|第三（的）|세 번째|se beonjjae|🥉
last|最後的|마지막|majimak|🔚
number|數字、號碼|숫자|sutja|🔢
a few|幾個|몇 개|myeot gae|🤏
a lot|很多|많이|mani|📚
little|小的；少的|작은|jageun|🐭|작다
any|任何|아무|amu|❔
both|兩者都|둘 다|dul da|✌️
several|幾個、好幾個|여러|yeoreo|🔢
less|較少的|덜|deol|📉
total|總共|합계|hapgye|🧮`],
  ['time', '時間和月份', 'Time', '🕐', `
noon|中午|정오|jeongo|🌞
evening|傍晚、晚上|저녁|jeonyeok|🌆
a.m.|上午|오전|ojeon|🌅
p.m.|下午|오후|ohu|🌇
January|一月|일월|irwol|📅
February|二月|이월|iwol|📅
March|三月|삼월|samwol|📅
April|四月|사월|sawol|📅
May|五月|오월|owol|📅
June|六月|유월|yuwol|📅
July|七月|칠월|chirwol|📅
August|八月|팔월|parwol|📅
September|九月|구월|guwol|📅
October|十月|시월|siwol|📅
November|十一月|십일월|sibirwol|📅
December|十二月|십이월|sibiwol|📅
season|季節|계절|gyejeol|🍂
watch|手錶；觀看|손목시계|sonmoksigye|⌚
moment|片刻、時刻|순간|sungan|⏱️
past|過去|과거|gwageo|📜
quarter|四分之一；十五分鐘|사분의 일|sabunui il|🕒
ago|…以前|전|jeon|⏮️
once|一次|한 번|han beon|1️⃣`],
  ['money', '金錢', 'Money', '💵', `
dollar|元|달러|dalleo|💵
cent|分（錢）|센트|senteu|🪙
change|零錢；改變|잔돈|jandon|🪙
cost|費用；花費|비용|biyong|💸
pay|付錢|돈을 내요|doneul naeyo|💳|내다
spend|花（錢、時間）|써요|sseoyo|🛒|쓰다
borrow|借（進來）|빌려요|billyeoyo|📚|빌리다
lend|借（出去）|빌려줘요|billyeojwoyo|🤝|빌려주다`],
  ['food', '食物和飲料', 'Food & drinks', '🍽️', `
grape|葡萄|포도|podo|🍇
guava|芭樂|구아바|guaba|🍏
lemon|檸檬|레몬|remon|🍋
papaya|木瓜|파파야|papaya|🥭
peach|桃子|복숭아|boksunga|🍑
pear|梨子|배|bae|🍐
strawberry|草莓|딸기|ttalgi|🍓
watermelon|西瓜|수박|subak|🍉
vegetable|蔬菜|채소|chaeso|🥦
bean|豆子|콩|kong|🫘
pumpkin|南瓜|호박|hobak|🎃
meat|肉|고기|gogi|🍖
beef|牛肉|소고기|sogogi|🐄
pork|豬肉|돼지고기|dwaejigogi|🐖
ham|火腿|햄|haem|🥓
steak|牛排|스테이크|seuteikeu|🥩
hamburger|漢堡|햄버거|haembeogeo|🍔
hot dog|熱狗|핫도그|hatdogeu|🌭
pizza|披薩|피자|pija|🍕
fries|薯條|감자튀김|gamjatwigim|🍟
sandwich|三明治|샌드위치|saendeuwichi|🥪
salad|沙拉|샐러드|saelleodeu|🥗
soup|湯|국|guk|🍲
bun|小圓麵包、包子|찐빵|jjinppang|🥟
toast|吐司|토스트|toseuteu|🍞
breakfast|早餐|아침밥|achimbap|🥞
lunch|午餐|점심|jeomsim|🍱
coffee|咖啡|커피|keopi|☕
drink|喝；飲料|마셔요|masyeoyo|🧃|마시다
ice|冰|얼음|eoreum|🧊
cheese|起司|치즈|chijeu|🧀
chocolate|巧克力|초콜릿|chokollit|🍫
cookie|餅乾|쿠키|kuki|🍪
pie|派|파이|pai|🥧
popcorn|爆米花|팝콘|papkon|🍿
butter|奶油|버터|beoteo|🧈
oil|油|기름|gireum|🫒
salt|鹽|소금|sogeum|🧂
sugar|糖|설탕|seoltang|🍭
yummy|好好吃|냠냠|nyamnyam|🤤
bake|烤（麵包、蛋糕）|구워요|guwoyo|🧁|굽다
boil|煮滾、水煮|끓여요|kkeuryeoyo|♨️|끓이다
burn|燒焦、燃燒|타요|tayo|🔥|타다
order|點（餐）；命令|주문해요|jumunhaeyo|🧾|주문하다
menu|菜單|메뉴|menyu|📋`],
  ['tableware', '餐具', 'Tableware', '🍴', `
bowl|碗|그릇|geureut|🥣
chopsticks|筷子|젓가락|jeotgarak|🥢
spoon|湯匙|숟가락|sutgarak|🥄
fork|叉子|포크|pokeu|🍴
knife|刀子|칼|kal|🔪
plate|盤子|접시|jeopsi|🍽️
dish|一道菜；盤子|요리|yori|🥘
cup|杯子|컵|keop|🍵
glass|玻璃杯；玻璃|유리컵|yurikeop|🥛`],
  ['clothing', '衣服和配件', 'Clothing & accessories', '👕', `
shirt|襯衫|셔츠|syeocheu|👔
T-shirt|T 恤|티셔츠|tisyeocheu|👕
pants|長褲|바지|baji|👖
jeans|牛仔褲|청바지|cheongbaji|👖
shorts|短褲|반바지|banbaji|🩳
skirt|裙子|치마|chima|💃
sweater|毛衣|스웨터|seuweteo|🧶
jacket|夾克|재킷|jaekit|🧥
uniform|制服|교복|gyobok|🎽
socks|襪子|양말|yangmal|🧦
cap|鴨舌帽|야구 모자|yagu moja|🧢
glove|手套|장갑|janggap|🧤
mask|口罩；面具|마스크|maseukeu|😷
bag|包包|가방|gabang|👜
wallet|錢包|지갑|jigap|👛
belt|皮帶|벨트|belteu|➰
tie|領帶|넥타이|nektai|👔
button|鈕扣；按鈕|단추|danchu|🔘
pocket|口袋|주머니|jumeoni|🫙
ring|戒指|반지|banji|💍
comb|梳子|빗|bit|🪮`],
  ['colors', '顏色', 'Colors', '🎨', `
gray|灰色|회색|hoesaek|🩶`],
  ['hobbies', '運動和興趣', 'Sports, interests & hobbies', '⚽', `
sports|運動|운동|undong|🤸
soccer|足球|축구|chukgu|⚽
baseball|棒球|야구|yagu|⚾
basketball|籃球|농구|nonggu|🏀
badminton|羽毛球|배드민턴|baedeuminteon|🏸
tennis|網球|테니스|teniseu|🎾
race|賽跑、比賽|경주|gyeongju|🏁
exercise|運動、練習|운동해요|undonghaeyo|🏋️|운동하다
jog|慢跑|조깅해요|joginghaeyo|🏃|조깅
hike|健行、爬山|등산해요|deungsanhaeyo|🥾|등산하다
climb|爬|올라가요|ollagayo|🧗|올라가다
camp|露營|캠프|kaempeu|⛺
picnic|野餐|소풍|sopung|🧺
sail|航行|항해해요|hanghaehaeyo|⛵|항해하다
surf|衝浪；上網瀏覽|서핑해요|seopinghaeyo|🏄|서핑
hobby|嗜好|취미|chwimi|🎨
movie|電影|영화|yeonghwa|🎞️
comic|漫畫|만화|manhwa|📖
toy|玩具|장난감|jangnangam|🧸
doll|洋娃娃|인형|inhyeong|🪆
kite|風箏|연|yeon|🪁
stamp|郵票|우표|upyo|📮
paint|畫（上顏料）；油漆|칠해요|chilhaeyo|🖌️|칠하다
band|樂團|밴드|baendeu|🎶
guitar|吉他|기타|gita|🎸
piano|鋼琴|피아노|piano|🎹
violin|小提琴|바이올린|baiollin|🎻
drum|鼓|드럼|deureom|🥁`],
  ['house', '房子和家裡', 'Houses & apartments', '🏠', `
house|房子|집|jip|🏠
apartment|公寓|아파트|apateu|🏢
bedroom|臥室|침실|chimsil|🛏️
bathroom|浴室|욕실|yoksil|🛁
living room|客廳|거실|geosil|🛋️
dining room|飯廳|식당|sikdang|🍽️
garden|花園|정원|jeongwon|🌷
yard|院子|마당|madang|🏡
balcony|陽台|베란다|beranda|🪴
floor|地板；樓層|바닥|badak|🟫
gate|大門|대문|daemun|⛩️
stairs|樓梯|계단|gyedan|🪜
bath|洗澡；浴缸|목욕|mogyok|🛀
table|桌子|탁자|takja|🪑
sofa|沙發|소파|sopa|🛋️
couch|長沙發|긴 의자|gin uija|🛋️
bench|長椅|벤치|benchi|🪑
drawer|抽屜|서랍|seorap|🗄️
lamp|檯燈|스탠드|seutaendeu|💡
blanket|毯子|담요|damyo|🧣
towel|毛巾|수건|sugeon|🧻
computer|電腦|컴퓨터|keompyuteo|💻
machine|機器|기계|gigye|⚙️
refrigerator|冰箱|냉장고|naengjanggo|🥶
video|影片|영상|yeongsang|📹
tape|膠帶；錄音帶|테이프|teipeu|📼
basket|籃子|바구니|baguni|🧺
key|鑰匙|열쇠|yeolsoe|🔑
pot|鍋子|냄비|naembi|🍲
clean|打掃；乾淨的|청소해요|cheongsohaeyo|🧹|청소하다
wash|洗|씻어요|ssiseoyo|🧼|씻다
fix|修理|고쳐요|gochyeoyo|🔧|고치다
build|蓋（房子）|지어요|jieoyo|🏗️|짓다
road|道路|길|gil|🛣️
street|街道|거리|geori|🏙️`],
  ['school', '學校', 'School', '🏫', `
elementary school|國小|초등학교|chodeunghakgyo|🏫
junior high school|國中|중학교|junghakgyo|🏫
senior high school|高中|고등학교|godeunghakgyo|🏫
classroom|教室|교실|gyosil|🧑‍🏫
classmate|同學|반 친구|ban chingu|🧑‍🤝‍🧑
gym|體育館|체육관|cheyukgwan|🏋️
playground|操場、遊樂場|놀이터|noriteo|🛝
slide|溜滑梯|미끄럼틀|mikkeureomteul|🛝
seesaw|翹翹板|시소|siso|⚖️
blackboard|黑板|칠판|chilpan|⬛
chalk|粉筆|분필|bunpil|🖍️
marker|麥克筆|마커|makeo|🖍️
glue|膠水|풀|pul|🧴
dictionary|字典|사전|sajeon|📕
workbook|作業本、習作|문제집|munjejip|📒
page|頁|페이지|peiji|📃
picture|圖畫、照片|그림|geurim|🖼️
postcard|明信片|엽서|yeopseo|🖼️
glasses|眼鏡|안경|angyeong|👓
present|禮物；現在的|선물|seonmul|🎁
course|課程|과정|gwajeong|🗂️
lesson|一課|과|gwa|📖
PE|體育課|체육|cheyuk|🤾
quiz|小考|퀴즈|kwijeu|📝
test|測驗|테스트|teseuteu|💯
grade|年級；成績|학년|hangnyeon|🎓
problem|問題|문제|munje|❓
example|例子|예|ye|💡
knowledge|知識|지식|jisik|📚
say|說|말해요|malhaeyo|💬|말하다
talk|說話、聊天|이야기해요|iyagihaeyo|🗨️|이야기하다
teach|教|가르쳐요|gareuchyeoyo|🧑‍🏫|가르치다
understand|了解|이해해요|ihaehaeyo|💡|이해하다
explain|解釋|설명해요|seolmyeonghaeyo|🗣️|설명하다
repeat|重複|반복해요|banbokaeyo|🔁|반복하다
spell|拼字|철자를 써요|cheoljareul sseoyo|🅰️|철자
prepare|準備|준비해요|junbihaeyo|🎒|준비하다
pass|通過；傳遞|통과해요|tonggwahaeyo|✅|통과하다
fail|失敗；不及格|실패해요|silpaehaeyo|❌|실패하다
mark|記號；分數|표시|pyosi|✏️`],
  ['places', '地點和方位', 'Places & locations', '🗺️', `
east|東邊|동쪽|dongjjok|➡️
west|西邊|서쪽|seojjok|⬅️
south|南邊|남쪽|namjjok|⬇️
north|北邊|북쪽|bukjjok|⬆️
top|頂端|위|wi|🔝
middle|中間|가운데|gaunde|🎯
place|地方|장소|jangso|📍
city|城市|도시|dosi|🏙️
town|城鎮|마을|maeul|🏘️
farm|農場|농장|nongjang|🚜
zoo|動物園|동물원|dongmurwon|🦁
museum|博物館|박물관|bangmulgwan|🏛️
theater|劇院|극장|geukjang|🎭
hotel|飯店|호텔|hotel|🏨
restaurant|餐廳|식당|sikdang|🍴
bakery|麵包店|빵집|ppangjip|🥐
bookstore|書店|서점|seojeom|📚
shop|商店|상점|sangjeom|🏪
supermarket|超級市場|슈퍼마켓|syupeomaket|🛒
department store|百貨公司|백화점|baekwajeom|🏬
post office|郵局|우체국|ucheguk|🏤
office|辦公室|사무실|samusil|🏢
factory|工廠|공장|gongjang|🏭
church|教堂|교회|gyohoe|⛪
pool|游泳池|수영장|suyeongjang|🏊
beach|海灘|해변|haebyeon|🏖️
restroom|洗手間|화장실|hwajangsil|🚻`],
  ['transport', '交通', 'Transportation', '🚌', `
boat|小船|보트|boteu|🚣
ship|船|배|bae|🚢
truck|卡車|트럭|teureok|🚚
motorcycle|摩托車|오토바이|otobai|🏍️
scooter|機車、滑板車|스쿠터|seukuteo|🛵
traffic|交通|교통|gyotong|🚦
bridge|橋|다리|dari|🌉
sidewalk|人行道|인도|indo|🚶
block|街區|블록|beullok|🧱
drive|開車|운전해요|unjeonhaeyo|🚗|운전하다
ride|騎、搭乘|타요|tayo|🚲|타다
fly|飛|날아요|narayo|🕊️|날다
arrive|到達|도착해요|dochakaeyo|🏁|도착하다
cross|穿越、過（馬路）|건너요|geonneoyo|🚸|건너다
land|陸地；降落|땅|ttang|🛬`],
  ['sizes', '尺寸和度量', 'Sizes & measurements', '📏', `
size|尺寸|크기|keugi|📐
height|高度、身高|키|ki|📏
large|大的|커요|keoyo|🐘|크다
medium|中等的|중간|junggan|🟡
low|低的|낮아요|najayo|⬇️|낮다
deep|深的|깊어요|gipeoyo|🌊|깊다
far|遠的|멀어요|meoreoyo|🔭|멀다
wide|寬的|넓어요|neolbeoyo|↔️|넓다
straight|直的|똑바로|ttokbaro|📏
round|圓的|둥글어요|dunggeureoyo|🔵|둥글다
circle|圓形|동그라미|donggeurami|⭕
square|正方形；廣場|네모|nemo|🟥
shape|形狀|모양|moyang|🔷
angle|角度|각도|gakdo|📐
line|線；隊伍|줄|jul|➖
row|一排|열|yeol|🪑
dot|點|점|jeom|⚫
centimeter|公分|센티미터|sentimiteo|📏
inch|英寸|인치|inchi|📏
mile|英里|마일|mail|🛣️
gram|公克|그램|geuraem|⚖️
kilogram|公斤|킬로그램|killogeuraem|⚖️
pound|磅；英鎊|파운드|paundeu|⚖️
bottle|瓶子|병|byeong|🍾
dozen|一打（十二個）|다스|daseu|🥚
pack|一包、一盒|팩|paek|📦
package|包裹|소포|sopo|📦
pair|一雙、一對|켤레|kyeolle|🧦
piece|一片、一塊|조각|jogak|🍰`],
  ['countries', '國家', 'Countries and areas', '🌏', `
R.O.C.|中華民國|중화민국|junghwaminguk|🇹🇼
U.S.A.|美國|미국|miguk|🇺🇸`],
  ['holidays', '節日', 'Holidays & festivals', '🎊', `
festival|節慶|축제|chukje|🎊
celebrate|慶祝|축하해요|chukahaeyo|🎉|축하하다
vacation|假期（寒暑假）|방학|banghak|🌴
Christmas|聖誕節|크리스마스|keuriseumaseu|🎄
Easter|復活節|부활절|buhwaljeol|🐣
Halloween|萬聖節|핼러윈|haelleowin|🎃`],
  ['jobs', '職業', 'Occupations', '💼', `
job|工作、職業|직업|jigeop|💼
work|工作|일해요|ilhaeyo|🛠️|일하다
worker|工人|노동자|nodongja|👷
business|生意|사업|saeop|📈
businessman|商人|사업가|saeopga|💼
boss|老闆|사장님|sajangnim|🧑‍💼
clerk|店員|점원|jeomwon|🏷️
shopkeeper|店主|가게 주인|gage juin|🏪
salesman|業務員|판매원|panmaewon|🤝
waiter|服務生（男）|웨이터|weiteo|🍽️
waitress|服務生（女）|웨이트리스|weiteuriseu|🍽️
actress|女演員|여배우|yeobaeu|🎭
reporter|記者|기자|gija|🎤
driver|司機|운전기사|unjeongisa|🚕
dentist|牙醫|치과 의사|chigwa uisa|🦷
engineer|工程師|엔지니어|enjinieo|👷
lawyer|律師|변호사|byeonhosa|⚖️
secretary|祕書|비서|biseo|🗂️
soldier|軍人|군인|gunin|🪖
farmer|農夫|농부|nongbu|🧑‍🌾
fisherman|漁夫|어부|eobu|🎣
mailman|郵差|우체부|uchebu|📬
housewife|家庭主婦|주부|jubu|🏠`],
  ['weather', '天氣和自然', 'Weather & nature', '🌤️', `
sunny|晴天的|화창해요|hwachanghaeyo|🌞|화창하다
cloudy|多雲的|흐려요|heuryeoyo|☁️|흐리다
rainy|下雨的|비가 와요|biga wayo|🌧️|비
snowy|下雪的|눈이 와요|nuni wayo|🌨️|눈
windy|風很大的|바람이 불어요|barami bureoyo|🍃|바람
clear|晴朗的；清楚的|맑아요|malgayo|🌤️|맑다
dry|乾的|건조해요|geonjohaeyo|🏜️|건조하다
shower|陣雨；淋浴|소나기|sonagi|🌦️
typhoon|颱風|태풍|taepung|🌀
blow|吹|불어요|bureoyo|💨|불다
earthquake|地震|지진|jijin|🫨
nature|大自然|자연|jayeon|🍃
earth|地球|지구|jigu|🌏
moon|月亮|달|dal|🌕`],
  ['geography', '地理', 'Geographical terms', '🏔️', `
sea|海|바다|bada|🌊
island|島|섬|seom|🏝️
lake|湖|호수|hosu|🏞️
pond|池塘|연못|yeonmot|🪷
hill|小山丘|언덕|eondeok|⛰️
area|區域|지역|jiyeok|🗾`],
  ['animals', '動物和昆蟲', 'Animals & insects', '🐾', `
animal|動物|동물|dongmul|🐾
pet|寵物|반려동물|ballyeodongmul|🐶
puppy|小狗|강아지|gangaji|🐕
pig|豬|돼지|dwaeji|🐷
cow|母牛|소|so|🐄
sheep|綿羊|양|yang|🐑
goat|山羊|염소|yeomso|🐐
duck|鴨子|오리|ori|🦆
goose|鵝|거위|geowi|🪿
hen|母雞|암탉|amtak|🐔
mouse|老鼠（小）|생쥐|saengjwi|🐭
rat|老鼠（大）|쥐|jwi|🐀
fox|狐狸|여우|yeou|🦊
frog|青蛙|개구리|gaeguri|🐸
elephant|大象|코끼리|kokkiri|🐘
zebra|斑馬|얼룩말|eollungmal|🦓
snake|蛇|뱀|baem|🐍
turtle|烏龜|거북이|geobugi|🐢
insect|昆蟲|곤충|gonchung|🐞
bug|蟲|벌레|beolle|🐛
ant|螞蟻|개미|gaemi|🐜
bee|蜜蜂|벌|beol|🐝
butterfly|蝴蝶|나비|nabi|🦋
spider|蜘蛛|거미|geomi|🕷️
bat|蝙蝠；球棒|박쥐|bakjwi|🦇
tail|尾巴|꼬리|kkori|🐈
bite|咬|물어요|mureoyo|🦷|물다`],
  ['articles', '冠詞和指示詞', 'Articles & determiners', '📘', `
a/an|一（個）|한|han|1️⃣
the|這、那（特定的）|그|geu|👆
that|那個|저것|jeogeot|👉
these|這些|이것들|igeotdeul|👇
those|那些|저것들|jeogeotdeul|👉`],
  ['pronouns', '代名詞', 'Pronouns', '🙋', `
you|你|너|neo|🫵
he|他|그|geu|👦
she|她|그녀|geunyeo|👧
it|它|그것|geugeot|📦
they|他們|그들|geudeul|👥
each|每一個|각각|gakgak|☝️
other|其他的|다른|dareun|🔀
another|另一個|또 하나|tto hana|➕
most|大部分；最|대부분|daebubun|📊
anyone|任何人|누구든지|nugudeunji|🙋
someone|某個人|누군가|nugunga|👤
nobody|沒有人|아무도|amudo|🚷
anything|任何東西|아무거나|amugeona|🎲
something|某樣東西|무언가|mueonga|🎁
nothing|什麼都沒有|아무것도|amugeotdo|🫙
everything|每樣東西|모든 것|modeun geot|🌐`],
  ['wh', '疑問詞', 'Wh-words', '❓', `
which|哪一個|어느|eoneu|🤔
whose|誰的|누구의|nuguui|🧐
whether|是不是|인지 아닌지|inji aninji|⚖️
while|當…的時候|동안|dongan|⏳`],
  ['aux', 'be 動詞和助動詞', 'Be & auxiliaries', '⚙️', `
be|是；在|이에요|ieyo|🟰|이다
do|做|해요|haeyo|🛠️|하다
could|可以（can 的過去式）|할 수 있었어요|hal su isseosseoyo|💪|수
will|將會|할 거예요|hal geoyeyo|🔮|거
must|必須|해야 해요|haeya haeyo|❗|하다
should|應該|하는 게 좋아요|haneun ge joayo|👉|좋다
may|可以；也許|해도 돼요|haedo dwaeyo|🙆|되다`],
  ['prep', '介系詞', 'Prepositions', '📍', `
in|在…裡面|안에|ane|📥
on|在…上面|위에|wie|🔝
under|在…下面|밑에|mite|⬇️
above|在…上方|위쪽에|wijjoge|⬆️
below|在…下方|아래에|araee|🔽
over|越過；在…上方|넘어서|neomeoseo|🦘
beside|在…旁邊|옆에|yeope|↔️
between|在…中間|사이에|saie|🥪
near|在…附近|근처에|geuncheoe|📍
around|在…周圍|주위에|juwie|🔄
inside|在裡面|안쪽|anjjok|🏠
outside|在外面|밖에|bakke|🌳
into|進入…裡面|안으로|aneuro|🚪
out|出去|밖으로|bakkeuro|🏃
up|向上|위로|wiro|⏫
down|向下|아래로|araero|⏬
off|離開；關掉|꺼요|kkeoyo|📴|끄다
at|在（地點、時間）|에|e|📌
to|給（某人）；到|에게|ege|➡️
for|為了；給|위해|wihae|🎁
of|…的|의|ui|🔗
with|和…一起|와 함께|wa hamkke|🤝
without|沒有…|없이|eopsi|🚫
about|關於|에 대해|e daehae|💬
by|藉由；在…旁邊|로|ro|🚌
across|橫越；在對面|건너편|geonneopyeon|🌉
along|沿著|따라서|ttaraseo|🛤️
through|穿過|통해서|tonghaeseo|🚇
during|在…期間|동안에|dongane|⏳
until|直到|까지|kkaji|⏱️
since|自從|부터|buteo|🏁
than|比|보다|boda|⚖️
except|除了…以外|빼고|ppaego|✂️`],
  ['conj', '連接詞', 'Conjunctions', '🔗', `
or|或者|아니면|animyeon|🔀
because|因為|왜냐하면|waenyahamyeon|💡
if|如果|만약|manyak|🤔
as|如同；當…|처럼|cheoreom|🟰
however|然而|그러나|geureona|↩️
though|雖然|비록|birok|🌦️`],
  ['interj', '打招呼和感嘆詞', 'Interjections', '😮', `
hi|嗨|안녕|annyeong|🙋
hey|嘿|야|ya|📣
good-bye|再見|안녕히 가세요|annyeonghi gaseyo|👋|안녕히`],
  ['nouns', '更多名詞', 'Other nouns', '📦', `
thing|東西、事情|것|geot|📦
idea|主意、點子|아이디어|aidieo|💡
fact|事實|사실|sasil|📰
reason|理由|이유|iyu|❔
way|方法；路|방법|bangbeop|🧭
matter|事情；要緊|일|il|❗
trouble|麻煩|곤란|gollan|😣
choice|選擇|선택|seontaek|☑️
habit|習慣|습관|seupgwan|🔁
experience|經驗|경험|gyeongheom|🧗
age|年紀|나이|nai|🎂
level|程度、等級|수준|sujun|📶
rule|規則|규칙|gyuchik|📏
action|動作、行動|행동|haengdong|🎬
power|力量；電力|힘|him|⚡
joy|喜悅|기쁨|gippeum|😄
pleasure|樂趣|즐거움|jeulgeoum|😊
interest|興趣|관심|gwansim|👀
mind|心思、頭腦|마음|maeum|🧠
excuse|藉口|핑계|pinggye|🙄
error|錯誤|오류|oryu|⚠️
case|情況；盒子|경우|gyeongu|🗂️
item|物品、項目|물건|mulgeon|🏷️
set|一組|세트|seteu|🧩
side|邊、側|쪽|jjok|↔️
center|中心|중심|jungsim|🎯
corner|轉角、角落|모퉁이|motungi|📐
bottom|底部|밑바닥|mitbadak|⬇️
space|空間；太空|공간|gonggan|🚀
planet|行星|행성|haengseong|🪐
sight|視力；景象|시력|siryeok|👓
noise|噪音|소음|soeum|🔊
fire|火|불|bul|🔥
heat|熱|열|yeol|♨️
gas|瓦斯；汽油|가스|gaseu|⛽
flower|花|꽃|kkot|🌸
rose|玫瑰|장미|jangmi|🌹
tree|樹|나무|namu|🌳
grass|草|풀|pul|🌿
seed|種子|씨앗|ssiat|🌰
root|根|뿌리|ppuri|🫚
rock|岩石|바위|bawi|🪨
mud|泥巴|진흙|jinheuk|🟤
ground|地面|땅|ttang|🟫
garbage|垃圾|쓰레기|sseuregi|🗑️
trash|垃圾（美式）|쓰레기|sseuregi|🗑️
box|箱子|상자|sangja|📦
bell|鈴鐺、鐘|종|jong|🔔
castle|城堡|성|seong|🏰
robot|機器人|로봇|robot|🤖
tool|工具|도구|dogu|🧰
pipe|管子|파이프|paipeu|🪈
rope|繩子|밧줄|batjul|🪢
string|細繩、線|끈|kkeun|🧵
pin|別針、大頭針|핀|pin|📌
swing|鞦韆|그네|geune|🎠
seat|座位|자리|jari|💺
screen|螢幕|화면|hwamyeon|🖥️
cellphone|手機|휴대폰|hyudaepon|📱
Internet|網路|인터넷|inteonet|🛜
e-mail|電子郵件|이메일|imeil|📧
file|檔案|파일|pail|📁
program|節目；程式|프로그램|peurogeuraem|🖥️
mail|郵件|우편|upyeon|📬
newspaper|報紙|신문|sinmun|📰
note|筆記、便條|메모|memo|🗒️
blank|空格|빈칸|binkan|⬜
report|報告|보고서|bogoseo|📑
topic|主題|주제|juje|🗣️
subject|科目；主題|과목|gwamok|📚
interview|面試、採訪|인터뷰|inteobyu|🎙️
meeting|會議|회의|hoeui|🗓️
member|成員|멤버|membeo|🧑‍🤝‍🧑
club|社團|동아리|dongari|🎯
player|選手|선수|seonsu|🏃
prize|獎品|상품|sangpum|🏆
sale|特價、拍賣|세일|seil|🏷️
service|服務|서비스|seobiseu|🛎️
tip|小費；祕訣|팁|tip|💡
treat|請客、招待|대접|daejeop|🍰
trick|把戲、惡作劇|속임수|sogimsu|🃏
metro|捷運、地鐵|지하철|jihacheol|🚇
foreigner|外國人|외국인|oegugin|🧳
American|美國人；美國的|미국 사람|miguk saram|🇺🇸
god|神|신|sin|✨
eve|前一天、前夕|전날|jeonnal|🌃
honey|蜂蜜|꿀|kkul|🍯`],
  ['verbs', '更多動詞', 'Other verbs', '🏃', `
use|使用|사용해요|sayonghaeyo|🧰|사용하다
put|放|놓아요|noayo|📥|놓다
bring|帶來|가져와요|gajyeowayo|🎒|가져오다
carry|搬、提|들고 가요|deulgo gayo|📦|들다
move|移動；搬家|움직여요|umjigyeoyo|🚚|움직이다
become|變成|돼요|dwaeyo|🦋|되다
begin|開始|시작돼요|sijakdwaeyo|🎬|시작되다
keep|保持；保存|지켜요|jikyeoyo|🔐|지키다
let|讓|하게 해요|hage haeyo|🙆|하다
enjoy|享受|즐겨요|jeulgyeoyo|😆|즐기다
hope|希望|바라요|barayo|🌠|바라다
hate|討厭|싫어해요|sireohaeyo|😤|싫어하다
forget|忘記|잊어요|ijeoyo|🫥|잊다
guess|猜|맞혀 봐요|machyeo bwayo|🎯|맞히다
taste|嚐；味道|맛봐요|matbwayo|👅|맛보다
check|檢查|확인해요|hwaginhaeyo|☑️|확인하다
notice|注意到|알아차려요|arachaeryeoyo|👀|알아차리다
decide|決定|결정해요|gyeoljeonghaeyo|🎲|결정하다
plan|計畫|계획|gyehoek|🗓️
agree|同意|동의해요|donguihaeyo|👍|동의하다
allow|允許|허락해요|heorakaeyo|🙆|허락하다
expect|期待|기대해요|gidaehaeyo|🤩|기대하다
mean|意思是|뜻해요|tteutaeyo|💭|뜻
care|照顧；在乎|돌봐요|dolbwayo|🤱|돌보다
share|分享|나눠요|nanwoyo|🤲|나누다
send|寄、送|보내요|bonaeyo|📨|보내다
invite|邀請|초대해요|chodaehaeyo|💌|초대하다
join|加入|참가해요|chamgahaeyo|🙋|참가하다
welcome|歡迎|환영해요|hwanyeonghaeyo|🤗|환영하다
stay|停留|머물러요|meomulleoyo|🏨|머무르다
enter|進入|들어가요|deureogayo|🚪|들어가다
appear|出現|나타나요|natanayo|✨|나타나다
reach|到達；伸手拿到|닿아요|daayo|🙌|닿다
belong|屬於|속해요|sokaeyo|🏷️|속하다
own|擁有；自己的|자기의|jagiui|🔑|자기
lead|帶領|이끌어요|ikkeureoyo|🚩|이끌다
save|拯救；存（錢）|구해요|guhaeyo|🛟|구하다
raise|舉起；養|올려요|ollyeoyo|🙋|올리다
rise|升起|떠요|tteoyo|🌅|뜨다
fall|落下；秋天|떨어져요|tteoreojyeoyo|🍁|떨어지다
drop|弄掉、掉落|떨어뜨려요|tteoreotteuryeoyo|💧|떨어뜨리다
fill|裝滿|채워요|chaewoyo|🫗|채우다
cover|蓋住|덮어요|deopeoyo|🛡️|덮다
hang|掛|걸어요|georeoyo|🖼️|걸다
paste|貼上|붙여요|butyeoyo|📎|붙이다
copy|影印、複製|복사해요|boksahaeyo|📄|복사하다
type|打字|타자 쳐요|taja chyeoyo|⌨️|타자
sign|簽名；標誌|사인해요|sainhaeyo|✍️|사인
list|清單|목록|mongnok|📋
count|數（數）|세요|seyo|🔢|세다
collect|收集|모아요|moayo|🧺|모으다
pick|摘；挑|따요|ttayo|🍎|따다
plant|植物；種|식물|singmul|🪴
dig|挖|파요|payo|⛏️|파다
pull|拉|당겨요|danggyeoyo|🧲|당기다
push|推|밀어요|mireoyo|🫸|밀다
throw|丟|던져요|deonjyeoyo|🥏|던지다
catch|接住、抓住|잡아요|jabayo|🧤|잡다
kick|踢|차요|chayo|🦵|차다
hit|打|때려요|ttaeryeoyo|🥊|때리다
fight|打架；奮鬥|싸워요|ssawoyo|🤼|싸우다
attack|攻擊|공격해요|gonggyeokaeyo|⚔️|공격하다
hunt|打獵|사냥해요|sanyanghaeyo|🏹|사냥하다
kill|殺|죽여요|jugyeoyo|☠️|죽이다
die|死|죽어요|jugeoyo|🥀|죽다
break|打破|깨요|kkaeyo|💔|깨다
roll|滾|굴러요|gulleoyo|🎳|구르다
shake|搖|흔들어요|heundeureoyo|🥤|흔들다
touch|摸|만져요|manjyeoyo|👆|만지다
knock|敲（門）|두드려요|dudeuryeoyo|🚪|두드리다
brush|刷|닦아요|dakkayo|🪥|닦다
mop|拖地|걸레질해요|geollejilhaeyo|🧹|걸레
hurry|趕快|서둘러요|seodulleoyo|🏃‍♀️|서두르다
laugh|笑出聲|웃어요|useoyo|😆|웃다
kiss|親|뽀뽀해요|ppoppohaeyo|😘|뽀뽀하다
bow|鞠躬|인사해요|insahaeyo|🙇‍♀️|인사하다
act|表演；行動|연기해요|yeongihaeyo|🎭|연기하다
pray|祈禱|기도해요|gidohaeyo|🙏|기도하다
lie|說謊；躺|거짓말해요|geojinmalhaeyo|🤥|거짓말
cheat|作弊；欺騙|커닝해요|keoninghaeyo|🙈|커닝
deal|交易|거래|georae|🤝
date|日期；約會|날짜|naljja|📅
feed|餵|먹이를 줘요|meogireul jwoyo|🐟|먹이
define|下定義|정의해요|jeonguihaeyo|📖|정의하다
smoke|煙；抽菸|연기|yeongi|💨
download|下載|다운로드해요|daunlodeuhaeyo|⬇️|다운로드
upload|上傳|업로드해요|eomnodeuhaeyo|⬆️|업로드
lose|輸；弄丟|잃어버려요|ireobeoryeoyo|😢|잃어버리다`],
  ['adjs', '更多形容詞', 'Other adjectives', '✨', `
easy|簡單的|쉬워요|swiwoyo|👌|쉽다
difficult|困難的|어려워요|eoryeowoyo|🧗|어렵다
simple|簡單的|간단해요|gandanhaeyo|🟢|간단하다
different|不同的|달라요|dallayo|🔀|다르다
special|特別的|특별해요|teukbyeolhaeyo|⭐|특별하다
strange|奇怪的|이상해요|isanghaeyo|👽|이상하다
important|重要的|중요해요|jungyohaeyo|❗|중요하다
interesting|有趣的|흥미로워요|heungmirowoyo|🧐|흥미롭다
great|很棒的|대단해요|daedanhaeyo|🎉|대단하다
wonderful|太棒的|멋져요|meotjyeoyo|🤩|멋지다
excellent|優秀的|훌륭해요|hullyunghaeyo|🥇|훌륭하다
fine|好的；晴朗的|괜찮아요|gwaenchanayo|🙂|괜찮다
glad|高興的|기뻐요|gippeoyo|😁|기쁘다
afraid|害怕的|두려워요|duryeowoyo|😱|두렵다
sure|確定的|확실해요|hwaksilhaeyo|💯|확실하다
real|真實的|실제|silje|✅
possible|可能的|가능해요|ganeunghaeyo|🆗|가능하다
enough|足夠的|충분해요|chungbunhaeyo|🈵|충분하다
only|唯一的；只|오직|ojik|☝️
else|其他的|그 밖의|geu bakkui|➕
main|主要的|주요|juyo|🔑
common|常見的；共同的|흔해요|heunhaeyo|👥|흔하다
popular|受歡迎的|인기 있어요|ingi isseoyo|🔥|인기
pop|流行（音樂）|팝|pap|🎵
modern|現代的|현대적|hyeondaejeok|🏙️
national|國家的|국가의|gukgaui|🏳️
public|公共的|공공|gonggong|🏛️
magic|魔術；神奇的|마술|masul|🪄
fresh|新鮮的|신선해요|sinseonhaeyo|🥬|신선하다
dirty|髒的|더러워요|deoreowoyo|🦠|더럽다
tidy|整齊的|깔끔해요|kkalkkeumhaeyo|🧺|깔끔하다
safe|安全的|안전해요|anjeonhaeyo|🛡️|안전하다
dead|死掉的|죽은|jugeun|🥀|죽다
serious|嚴肅的；嚴重的|심각해요|simgakaeyo|😐|심각하다
terrible|糟糕的|끔찍해요|kkeumjjikaeyo|😖|끔찍하다
bright|明亮的；聰明的|밝아요|balgayo|🔆|밝다
loud|大聲的|소리가 커요|soriga keoyo|📢|소리
noisy|吵鬧的|시끄러워요|sikkeureowoyo|🔊|시끄럽다
sharp|尖銳的|날카로워요|nalkarowoyo|🔪|날카롭다
thick|厚的|두꺼워요|dukkeowoyo|📚|두껍다
convenient|方便的|편리해요|pyeollihaeyo|🏪|편리하다
useful|有用的|유용해요|yuyonghaeyo|🧰|유용하다
helpful|有幫助的|도움이 돼요|doumi dwaeyo|🤝|도움
able|能夠的|할 수 있는|hal su inneun|💪|수
dear|親愛的|사랑하는|saranghaneun|💌|사랑하다
sore|痠痛的|쑤셔요|ssusyeoyo|🤕|쑤시다`],
  ['advs', '更多副詞', 'Other adverbs', '🔁', `
often|常常|자주|jaju|🔁
usually|通常|보통|botong|📆
seldom|很少|거의 안|geoui an|🐢
ever|曾經|한 번이라도|han beonirado|❔
also|也|또한|ttohan|➕
just|只是；剛剛|그냥|geunyang|🤷
still|仍然|아직|ajik|⏳
yet|還（沒）|아직|ajik|⌛
so|所以|그래서|geuraeseo|➡️
then|然後|그다음에|geudaeume|⏭️
finally|終於|드디어|deudieo|🎉
even|甚至|심지어|simjieo|😮
almost|幾乎|거의|geoui|🔜
maybe|也許|아마|ama|🤔
perhaps|或許|어쩌면|eojjeomyeon|🌀
probably|大概|아마도|amado|🎲
actually|其實|사실|sasil|🤫
quite|相當|꽤|kkwae|👌
twice|兩次|두 번|du beon|✌️
away|離開、遠離|멀리|meolli|🏃
abroad|在國外|해외에|haeoee|✈️
ahead|在前面|앞에|ape|⏩
somewhere|在某處|어딘가|eodinga|🗺️
either|兩者之一|둘 중 하나|dul jung hana|☯️
least|最少|가장 적게|gajang jeokge|📉|적다
not|不|안|an|🙅`],
];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const used = new Set();
export const BANK = BANK_RAW.map(([id, zh, en, emoji, raw]) => ({
  id, zh, en, emoji,
  words: raw.trim().split('\n').map((line) => {
    const [wen, wzh, ko, kr, em, lemma] = line.split('|');
    let wid = `v_${slug(wen)}`;
    while (used.has(wid)) wid += '_2'; // May（五月）和 may（可以）這種同拼字的
    used.add(wid);
    return { id: wid, en: wen, zh: wzh, ko, kr, emoji: em || emoji, note: '', lemma: lemma || '', bank: id, scenes: [] };
  }),
}));
