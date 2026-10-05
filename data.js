/**
 * [data.js]
 * 6학년 학급관리 웹 앱 - 기본 데이터셋 및 데이터 스토리지 관리자
 */

// 레벨 설정 (누적 획득 화폐 EXP 기준)
const LEVEL_CONFIG = [
  { level: 1, title: '새싹 탐험가', minExp: 0, maxExp: 99, icon: '🌱', color: '#10b981', badgeClass: 'lvl-1' },
  { level: 2, title: '성실한 시민', minExp: 100, maxExp: 299, icon: '⭐', color: '#3b82f6', badgeClass: 'lvl-2' },
  { level: 3, title: '우수 기여생', minExp: 300, maxExp: 599, icon: '🔥', color: '#8b5cf6', badgeClass: 'lvl-3' },
  { level: 4, title: '학급 리더', minExp: 600, maxExp: 999, icon: '👑', color: '#f59e0b', badgeClass: 'lvl-4' },
  { level: 5, title: '전설의 6학년', minExp: 1000, maxExp: Infinity, icon: '🏆', color: '#ef4444', badgeClass: 'lvl-5' },
];

// 기본 1인 1역 목록 (초등 6학년 교실 맞춤 25개)
const DEFAULT_ROLES = [
  { id: 'r1', name: '칠판 지우미', desc: '쉬는 시간과 수업 후 칠판을 깨끗이 닦고 분필 가루를 정리해요.' },
  { id: 'r2', name: '우유 도우미', desc: '우유 배부를 돕고 남은 우유팩을 깔끔하게 분리배출해요.' },
  { id: 'r3', name: '환기 지킴이', desc: '쉬는 시간마다 앞뒤 창문을 열어 교실 공기를 맑게 해요.' },
  { id: 'r4', name: '줄서기 반장', desc: '급식실이나 특별실 이동 시 두 줄 바르게 서기를 안내해요.' },
  { id: 'r5', name: '에너지 지킴이', desc: '교실을 비울 때 불과 에어컨/히터를 끄고 전기 절약을 실천해요.' },
  { id: 'r6', name: '도서 도우미', desc: '학급 문고 책장 책들을 번호순과 종류별로 가지런히 정돈해요.' },
  { id: 'r7', name: '분리수거 대장', desc: '재활용 분리수거통을 확인하고 플라스틱/종이를 바르게 분리해요.' },
  { id: 'r8', name: '시간 지킴이', desc: '수업 시작 1분 전 알림과 자리 정돈을 독려해요.' },
  { id: 'r9', name: '체육 부장', desc: '체육 시간 공과 준비물을 챙기고 수업 후 제자리에 정리해요.' },
  { id: 'r10', name: '온도·습도 요원', desc: '교실 온습도계를 체크하고 쾌적한 학습 환경을 살펴요.' },
  { id: 'r11', name: '신발장 지킴이', desc: '신발장과 사물함 위가 어질러지지 않도록 단정히 살펴요.' },
  { id: 'r12', name: '학급 우체부', desc: '가정통신문과 배부물을 모둠별로 바르게 나눠줘요.' },
  { id: 'r13', name: '식물 사랑이', desc: '교실 화분에 주기적으로 물을 주고 건강히 자라도록 돌봐요.' },
  { id: 'r14', name: '보건 알리미', desc: '손 씻기 및 마스크 착용 등 교실 위생 수칙을 안내해요.' },
  { id: 'r15', name: '청소 도구함장', desc: '빗자루와 걸레가 청소함에 바르게 걸려 있는지 정리해요.' },
  { id: 'r16', name: '전자칠판 관리', desc: '수업 후 전자칠판 전원과 스타일러스 펜을 제자리에 둬요.' },
  { id: 'r17', name: '칭찬 배달부', desc: '하루 동안 친구들의 착한 행동을 찾아 학급 칭찬함에 기록해요.' },
  { id: 'r18', name: '분실물 수사대', desc: '교실 바닥에 떨어진 연필·지우개 주인을 찾아줘요.' },
  { id: 'r19', name: '출석 확인관', desc: '아침 자습 시간 친구들의 출석과 건강 상태를 살펴요.' },
  { id: 'r20', name: '우산꽂이 정돈', desc: '비 오는 날 우산이 가지런히 꽂히도록 정리해요.' },
  { id: 'r21', name: '급식 알리미', desc: '오늘의 급식 메뉴와 알레르기 정보를 칠판 구석에 적어요.' },
  { id: 'r22', name: '모둠 지원관', desc: '모둠 활동 시 도움이 필요한 모둠을 교사에게 전달해요.' },
  { id: 'r23', name: '미술 재료함장', desc: '공용 가위, 풀, 색연필 통을 깨끗하게 정리해요.' },
  { id: 'r24', name: '바른 말 지킴이', desc: '교실 내 고운 말과 바른 언어 사용 캠페인을 이끌어요.' },
  { id: 'r25', name: '하루 마무리 요원', desc: '하교 전 책상 서랍 검사와 바닥 쓰레기 줍기를 안내해요.' },
];

// 초기 학생 25명 데이터
const DEFAULT_STUDENTS = [
  { id: 1, no: 1, name: '강민준', balance: 280, totalEarned: 350, roleId: 'r1', taskDone: true, inventory: ['item-3'] },
  { id: 2, no: 2, name: '김도윤', balance: 140, totalEarned: 220, roleId: 'r2', taskDone: false, inventory: [] },
  { id: 3, no: 3, name: '김서준', balance: 520, totalEarned: 640, roleId: 'r3', taskDone: true, inventory: ['item-1', 'item-4'] },
  { id: 4, no: 4, name: '김시우', balance: 310, totalEarned: 410, roleId: 'r4', taskDone: true, inventory: [] },
  { id: 5, no: 5, name: '김예준', balance: 90,  totalEarned: 90,  roleId: 'r5', taskDone: false, inventory: [] },
  { id: 6, no: 6, name: '김유찬', balance: 450, totalEarned: 580, roleId: 'r6', taskDone: true, inventory: ['item-2'] },
  { id: 7, no: 7, name: '김지호', balance: 680, totalEarned: 890, roleId: 'r7', taskDone: true, inventory: ['item-1', 'item-6'] },
  { id: 8, no: 8, name: '김하율', balance: 220, totalEarned: 320, roleId: 'r8', taskDone: false, inventory: [] },
  { id: 9, no: 9, name: '박서아', balance: 360, totalEarned: 460, roleId: 'r9', taskDone: true, inventory: ['item-5'] },
  { id: 10, no: 10, name: '박서진', balance: 180, totalEarned: 280, roleId: 'r10', taskDone: false, inventory: [] },
  { id: 11, no: 11, name: '박예은', balance: 830, totalEarned: 1120, roleId: 'r11', taskDone: true, inventory: ['item-1', 'item-2', 'item-5'] },
  { id: 12, no: 12, name: '박지유', balance: 400, totalEarned: 500, roleId: 'r12', taskDone: true, inventory: ['item-4'] },
  { id: 13, no: 13, name: '백서현', balance: 150, totalEarned: 150, roleId: 'r13', taskDone: false, inventory: [] },
  { id: 14, no: 14, name: '송민재', balance: 290, totalEarned: 390, roleId: 'r14', taskDone: true, inventory: [] },
  { id: 15, no: 15, name: '신도현', balance: 510, totalEarned: 670, roleId: 'r15', taskDone: true, inventory: ['item-3'] },
  { id: 16, no: 16, name: '안유진', balance: 60,  totalEarned: 60,  roleId: 'r16', taskDone: false, inventory: [] },
  { id: 17, no: 17, name: '오세은', balance: 330, totalEarned: 430, roleId: 'r17', taskDone: true, inventory: [] },
  { id: 18, no: 18, name: '윤지후', balance: 470, totalEarned: 570, roleId: 'r18', taskDone: true, inventory: ['item-6'] },
  { id: 19, no: 19, name: '이도현', balance: 250, totalEarned: 350, roleId: 'r19', taskDone: false, inventory: [] },
  { id: 20, no: 20, name: '이서윤', balance: 750, totalEarned: 950, roleId: 'r20', taskDone: true, inventory: ['item-1', 'item-3'] },
  { id: 21, no: 21, name: '이수아', balance: 380, totalEarned: 480, roleId: 'r21', taskDone: true, inventory: [] },
  { id: 22, no: 22, name: '이준우', balance: 190, totalEarned: 290, roleId: 'r22', taskDone: false, inventory: [] },
  { id: 23, no: 23, name: '정하은', balance: 620, totalEarned: 780, roleId: 'r23', taskDone: true, inventory: ['item-2'] },
  { id: 24, no: 24, name: '조은우', balance: 410, totalEarned: 510, roleId: 'r24', taskDone: true, inventory: ['item-4'] },
  { id: 25, no: 25, name: '한지민', balance: 320, totalEarned: 420, roleId: 'r25', taskDone: false, inventory: [] },
];

// 초기 상점 상품 목록
const DEFAULT_SHOP_ITEMS = [
  { id: 'item-1', name: '원하는 자리 앉기권', price: 300, icon: '🪑', category: 'coupon', desc: '다음 자리 바꾸기 때 원하는 자리를 우선 선택할 수 있어요.' },
  { id: 'item-2', name: '숙제 1회 면제권', price: 500, icon: '📝', category: 'coupon', desc: '일일 과제나 일기 1회를 기분 좋게 쉴 수 있어요.' },
  { id: 'item-3', name: '오늘의 음악 선곡권', price: 150, icon: '🎵', category: 'coupon', desc: '점심시간 또는 청소시간에 내가 좋아하는 노래를 틀 수 있어요.' },
  { id: 'item-4', name: '급식 1등 줄서기', price: 200, icon: '🍱', category: 'coupon', desc: '점심시간에 가장 먼저 맛있는 급식을 받으러 갈 수 있어요.' },
  { id: 'item-5', name: '1일 청소 면제권', price: 400, icon: '🧹', category: 'coupon', desc: '오늘 하루 방과 후 청소 구역 청소를 면제받아요.' },
  { id: 'item-6', name: '간식 박스 교환권', price: 100, icon: '🍬', category: 'goods', desc: '선생님의 보물 간식 상자에서 맛있는 간식 1개를 골라요.' },
  { id: 'item-7', name: '선생님과 1:1 보드게임', price: 350, icon: '🎲', category: 'coupon', desc: '점심시간에 선생님과 신나는 보드게임 한 판을 즐겨요.' },
  { id: 'item-8', name: '선생님의 칭찬 스티커 3장', price: 80,  icon: '⭐', category: 'goods', desc: '모둠 판이나 개인 학습장에 붙일 수 있는 특별 스티커!' },
];

// 초기 거래 내역 기록
const DEFAULT_TRANSACTIONS = [
  { id: 'tx-1', studentId: 11, studentName: '박예은', type: 'earn', amount: 50, reason: '1인 1역(신발장 지킴이) 성실 수행', time: '2026-10-05 09:10' },
  { id: 'tx-2', studentId: 7,  studentName: '김지호', type: 'earn', amount: 100, reason: '수학 모둠 협동 활동 우수', time: '2026-10-05 10:45' },
  { id: 'tx-3', studentId: 3,  studentName: '김서준', type: 'spend', amount: 300, reason: '상점 구매: 원하는 자리 앉기권', time: '2026-10-05 12:30' },
  { id: 'tx-4', studentId: 20, studentName: '이서윤', type: 'earn', amount: 50, reason: '교실 바른 말 고운 말 실천', time: '2026-10-05 14:15' },
];

// LocalStorage 키 상수
const STORAGE_KEYS = {
  STUDENTS: 'class_mgmt_students_v1',
  ROLES: 'class_mgmt_roles_v1',
  SHOP_ITEMS: 'class_mgmt_shop_items_v1',
  TRANSACTIONS: 'class_mgmt_transactions_v1',
  APP_SETTINGS: 'class_mgmt_settings_v1',
};

// 스토리지 관리 헬퍼
class StorageManager {
  static getStudents() {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) {
      this.saveStudents(DEFAULT_STUDENTS);
      return JSON.parse(JSON.stringify(DEFAULT_STUDENTS));
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error(e);
      return DEFAULT_STUDENTS;
    }
  }

  static saveStudents(students) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }

  static getRoles() {
    const raw = localStorage.getItem(STORAGE_KEYS.ROLES);
    if (!raw) {
      this.saveRoles(DEFAULT_ROLES);
      return JSON.parse(JSON.stringify(DEFAULT_ROLES));
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return DEFAULT_ROLES;
    }
  }

  static saveRoles(roles) {
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
  }

  static getShopItems() {
    const raw = localStorage.getItem(STORAGE_KEYS.SHOP_ITEMS);
    if (!raw) {
      this.saveShopItems(DEFAULT_SHOP_ITEMS);
      return JSON.parse(JSON.stringify(DEFAULT_SHOP_ITEMS));
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return DEFAULT_SHOP_ITEMS;
    }
  }

  static saveShopItems(items) {
    localStorage.setItem(STORAGE_KEYS.SHOP_ITEMS, JSON.stringify(items));
  }

  static getTransactions() {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      this.saveTransactions(DEFAULT_TRANSACTIONS);
      return JSON.parse(JSON.stringify(DEFAULT_TRANSACTIONS));
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return DEFAULT_TRANSACTIONS;
    }
  }

  static saveTransactions(txs) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  }

  static getSettings() {
    const raw = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    const defaults = {
      currencyName: '골드',
      currencyUnit: 'G',
      className: '초등 6학년 1반 학급본부',
    };
    if (!raw) return defaults;
    try {
      return { ...defaults, ...JSON.parse(raw) };
    } catch (e) {
      return defaults;
    }
  }

  static saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
  }

  static resetToDefault() {
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.ROLES);
    localStorage.removeItem(STORAGE_KEYS.SHOP_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.APP_SETTINGS);
  }
}

// EXP에 따른 레벨 계산 유틸 함수
function calculateLevel(exp) {
  for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
    if (exp >= LEVEL_CONFIG[i].minExp) {
      const current = LEVEL_CONFIG[i];
      const next = LEVEL_CONFIG[i + 1] || null;
      let progress = 100;
      let nextExpNeeded = 0;

      if (next) {
        const range = next.minExp - current.minExp;
        const currentProgress = exp - current.minExp;
        progress = Math.min(100, Math.floor((currentProgress / range) * 100));
        nextExpNeeded = next.minExp - exp;
      }

      return {
        level: current.level,
        title: current.title,
        icon: current.icon,
        color: current.color,
        badgeClass: current.badgeClass,
        currentExp: exp,
        progress,
        nextExpNeeded,
        nextTitle: next ? next.title : '최고 레벨 도달',
      };
    }
  }
  return {
    level: 1,
    title: LEVEL_CONFIG[0].title,
    icon: LEVEL_CONFIG[0].icon,
    color: LEVEL_CONFIG[0].color,
    badgeClass: LEVEL_CONFIG[0].badgeClass,
    currentExp: exp,
    progress: 0,
    nextExpNeeded: 100,
    nextTitle: LEVEL_CONFIG[1].title,
  };
}
