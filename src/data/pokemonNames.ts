export const pokemonNameMap: Record<string, string> = {
  // 1세대
  "이상해꽃": "venusaur", "리자몽": "charizard", "거북왕": "blastoise", "피카츄": "pikachu", "라이츄": "raichu",
  "나인테일": "ninetales", "푸린": "jigglypuff", "괴력몬": "machamp", "팬텀": "gengar", "후딘": "alakazam",
  "럭키": "chansey", "켄타로스": "tauros", "갸라도스": "gyarados", "라프라스": "lapras", "이브이": "eevee",
  "프테라": "aerodactyl", "잠만보": "snorlax", "망나뇽": "dragonite", "뮤츠": "mewtwo", "뮤": "mew",
  "질뻑이": "grimer", "코일": "magnemite", "파르셀": "cloyster", "고지": "sandslash",
  
  // 2세대
  "메가니움": "meganium", "블레이범": "typhlosion", "장크로다일": "feraligatr", "마릴리": "azumarill",
  "마기라스": "tyranitar", "해피너스": "blissey", "전룡": "ampharos", "크로뱃": "crobat",
  "핫삼": "scizor", "헤라클로스": "heracross", "무장조": "skarmory", "폴리곤2": "porygon2",
  "라이코": "raikou", "앤테이": "entei", "스이쿤": "suicune", "루기아": "lugia", "칠색조": "ho-oh",

  // 3세대
  "나무킹": "sceptile", "번치코": "blaziken", "대짱이": "swampert", "가디안": "gardevoir",
  "입치트": "mawile", "보만다": "salamence", "메타그로스": "metagross", "레지락": "regirock",
  "라티아스": "latias", "라티오스": "latios", "가이오가": "kyogre", "그란돈": "groudon",
  "레쿠쟈": "rayquaza", "지라치": "jirachi", "테오키스": "deoxys-normal",

  // 4세대
  "토대부기": "torterra", "초염몽": "infernape", "엠페르트": "empoleon", "한카리아스": "garchomp",
  "루카리오": "lucario", "토게키스": "togekiss", "포푸니라": "weavile", "글라이온": "gliscor",
  "디아루가": "dialga", "펄기아": "palkia", "히드런": "heatran", "기라티나": "giratina-altere",
  "크레세리아": "cresselia", "다크라이": "darkrai", "아르세우스": "arceus",

  // 5세대
  "샤로다": "serperior", "염무왕": "emboar", "대검귀": "samurott", "엘풍": "whimsicott",
  "불카모스": "volcarona", "삼삼드래": "hydreigon", "너트령": "ferrothorn", "불비달마": "darmanitan-standard",
  "몰드류": "excadrill", "테라키온": "terrakion", "볼트로스": "thundurus-incarnate", "랜드로스": "landorus-incarnate",
  "제크로무": "zekrom", "레시라무": "reshiramm", "큐레무": "kyurem",

  // 6세대
  "개굴닌자": "greninja", "파이어로": "talonflame", "킬가르도": "aegislash-shield", "님피아": "sylveon",
  "미끄래곤": "goodra", "음번": "noivern", "제르네아스": "xerneas", "이벨타르": "yveltal",
  "디안시": "diancie", "후파": "hoopa", "볼케니온": "volcanion",

  // 7세대
  "모크나이퍼": "decidueye", "어흥염": "incineroar", "누리레느": "primarina", "따라큐": "mimikyu",
  "실버디": "silvally", "카푸꼬꼬꼭": "tapu-koko", "카푸나비나": "tapu-lele", "카푸브루루": "tapu-bulu",
  "카푸느지느": "tapu-fini", "솔가레오": "solgaleo", "루나아라": "lunala", "철화구야": "celesteela",

  // 8세대
  "고릴타": "rillaboom", "에이스번": "cinderace", "인텔리레온": "inteleon", "드래펄트": "dragapult",
  "자시안": "zacian", "자마젠타": "zamazenta", "우라오스": "urshifu-single-strike", "레지에레키": "regieleki",
  "레지드래고": "regidrago", "버드렉스": "calyrex", "신비록": "wyrdeer",

  // 9세대
  "마스카나": "meowscarada", "라우드본": "skeledirge", "웨이니발": "quaquaval", "파오젠": "chien-pao",
  "딩루": "ting-lu", "총재": "chi-yu", "위유이": "chi-yu", "날개치는머리": "flutter-mane",
  "무쇠보따리": "iron-bundle", "무쇠손": "iron-hands", "무쇠독나방": "iron-moth", "오거폰": "ogerpon",
  "타부자고": "gholdengo", "테라파고스": "terapagos", "굽이치는물결": "walking-wake",
};

export const getEnglishName = (koName: string): string => {
  return pokemonNameMap[koName] || koName.toLowerCase();
};
