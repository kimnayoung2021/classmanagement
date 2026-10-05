/**
 * [app.js]
 * 6학년 학급관리 웹 앱 - 메인 애플리케이션 컨트롤러
 */

// 애플리케이션 상태 객체
const state = {
  currentMode: 'teacher', // 'teacher' | 'student-picker' | 'student-detail'
  currentStudentId: null,
  currentStudentTab: 'shop', // 'shop' | 'inventory' | 'history'
  students: [],
  roles: [],
  shopItems: [],
  transactions: [],
  settings: {},
  selectedStudentIds: new Set(),
  filterQuery: '',
  filterSort: 'no-asc',
  filterStatus: 'all', // 'all' | 'done' | 'undone'
};

// ==========================================================================
// 초기화 및 이벤트 리스너 바인딩
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  bindGlobalEvents();
  renderApp();
  initConfettiCanvas();
});

// 데이터 로드
function loadData() {
  state.students = StorageManager.getStudents();
  state.roles = StorageManager.getRoles();
  state.shopItems = StorageManager.getShopItems();
  state.transactions = StorageManager.getTransactions();
  state.settings = StorageManager.getSettings();
}

// 데이터 저장
function persistData() {
  StorageManager.saveStudents(state.students);
  StorageManager.saveRoles(state.roles);
  StorageManager.saveShopItems(state.shopItems);
  StorageManager.saveTransactions(state.transactions);
}

// 글로벌 이벤트 바인딩
function bindGlobalEvents() {
  // 모드 전환 버튼
  document.getElementById('btn-mode-teacher').addEventListener('click', () => {
    switchMode('teacher');
  });

  document.getElementById('btn-mode-student').addEventListener('click', () => {
    if (state.currentStudentId) {
      switchMode('student-detail');
    } else {
      switchMode('student-picker');
    }
  });

  // 데이터 초기화 버튼
  document.getElementById('btn-reset-data').addEventListener('click', () => {
    if (confirm('초기 예시 데이터로 되돌리시겠습니까? 모든 변경 사항이 초기화됩니다.')) {
      StorageManager.resetToDefault();
      loadData();
      state.selectedStudentIds.clear();
      renderApp();
      showToast('초기 데이터로 깔끔하게 리셋되었습니다.', 'info');
    }
  });

  // 검색 및 정렬 필터
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.filterQuery = e.target.value.trim().toLowerCase();
      renderTeacherTable();
    });
  }

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.filterSort = e.target.value;
      renderTeacherTable();
    });
  }

  const statusFilter = document.getElementById('status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      state.filterStatus = e.target.value;
      renderTeacherTable();
    });
  }
}

// 모드 전환
function switchMode(newMode) {
  state.currentMode = newMode;

  // 헤더 활성 버튼 갱신
  const teacherBtn = document.getElementById('btn-mode-teacher');
  const studentBtn = document.getElementById('btn-mode-student');

  if (newMode === 'teacher') {
    teacherBtn.classList.add('active');
    studentBtn.classList.remove('active');
  } else {
    teacherBtn.classList.remove('active');
    studentBtn.classList.add('active');
  }

  renderApp();
}

// 전체 화면 렌더링 디스패처
function renderApp() {
  const teacherView = document.getElementById('view-teacher');
  const studentPickerView = document.getElementById('view-student-picker');
  const studentDetailView = document.getElementById('view-student-detail');

  teacherView.classList.remove('active');
  studentPickerView.classList.remove('active');
  studentDetailView.classList.remove('active');

  if (state.currentMode === 'teacher') {
    teacherView.classList.add('active');
    renderTeacherDashboard();
  } else if (state.currentMode === 'student-picker') {
    studentPickerView.classList.add('active');
    renderStudentPicker();
  } else if (state.currentMode === 'student-detail') {
    studentDetailView.classList.add('active');
    renderStudentDetail();
  }
}

// ==========================================================================
// 1. 교사 대시보드 뷰 렌더링
// ==========================================================================
function renderTeacherDashboard() {
  // 상단 요약 통계 계산
  const totalStudents = state.students.length;
  const doneCount = state.students.filter(s => s.taskDone).length;
  const donePercent = totalStudents > 0 ? Math.round((doneCount / totalStudents) * 100) : 0;
  const totalCirculation = state.students.reduce((acc, s) => acc + s.balance, 0);

  // 오늘 지급된 화폐 계산 (간이 기준)
  const todayEarned = state.transactions
    .filter(t => t.type === 'earn')
    .reduce((acc, t) => acc + t.amount, 0);

  document.getElementById('stat-total-students').textContent = `${totalStudents}명`;
  document.getElementById('stat-task-progress').textContent = `${donePercent}%`;
  document.getElementById('stat-task-sub').textContent = `(완료 ${doneCount}명 / 미완료 ${totalStudents - doneCount}명)`;
  document.getElementById('stat-circulation').textContent = `${totalCirculation.toLocaleString()} ${state.settings.currencyUnit}`;
  document.getElementById('stat-today-issued').textContent = `+${todayEarned.toLocaleString()} ${state.settings.currencyUnit}`;

  renderTeacherTable();
}

// 학생 목록 테이블 렌더링
function renderTeacherTable() {
  const tbody = document.getElementById('student-table-body');
  if (!tbody) return;

  // 필터링 및 정렬
  let list = [...state.students];

  if (state.filterQuery) {
    list = list.filter(s =>
      s.name.toLowerCase().includes(state.filterQuery) ||
      s.no.toString().includes(state.filterQuery)
    );
  }

  if (state.filterStatus === 'done') {
    list = list.filter(s => s.taskDone);
  } else if (state.filterStatus === 'undone') {
    list = list.filter(s => !s.taskDone);
  }

  // 정렬
  switch (state.filterSort) {
    case 'no-asc':
      list.sort((a, b) => a.no - b.no);
      break;
    case 'name-asc':
      list.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
      break;
    case 'balance-desc':
      list.sort((a, b) => b.balance - a.balance);
      break;
    case 'level-desc':
      list.sort((a, b) => b.totalEarned - a.totalEarned);
      break;
  }

  // 선택된 인원수 뱃지
  const selBadge = document.getElementById('selected-count-badge');
  if (selBadge) {
    selBadge.textContent = `${state.selectedStudentIds.size}명 선택됨`;
  }

  // 전체 선택 체크박스 상태
  const selectAllBox = document.getElementById('select-all-students');
  if (selectAllBox) {
    selectAllBox.checked = list.length > 0 && list.every(s => state.selectedStudentIds.has(s.id));
  }

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-text">조건에 맞는 학생이 없습니다.</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(s => {
    const lvl = calculateLevel(s.totalEarned);
    const role = state.roles.find(r => r.id === s.roleId) || { name: '미배정' };
    const isSelected = state.selectedStudentIds.has(s.id);

    return `
      <tr class="${isSelected ? 'selected' : ''}">
        <td>
          <input type="checkbox" class="student-checkbox" data-id="${s.id}" ${isSelected ? 'checked' : ''} onchange="toggleSelectStudent(${s.id})">
        </td>
        <td style="font-weight: 700; color: var(--slate-500); font-family: var(--font-display);">${s.no}번</td>
        <td>
          <div class="student-name-cell">
            <div class="student-avatar">${s.name.slice(1)}</div>
            <div>
              <div class="student-name">${s.name}</div>
              <div class="student-no">누적 수입: ${s.totalEarned.toLocaleString()} ${state.settings.currencyUnit}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="level-badge ${lvl.badgeClass}">
            <span>${lvl.icon}</span> Lv.${lvl.level} ${lvl.title}
          </span>
        </td>
        <td>
          <span class="currency-val gold">
            <span class="coin-icon">G</span>
            ${s.balance.toLocaleString()}
          </span>
        </td>
        <td>
          <span class="role-tag">
            <span>📌</span> ${role.name}
          </span>
        </td>
        <td>
          <span class="status-tag ${s.taskDone ? 'done' : 'undone'}" style="cursor: pointer;" onclick="toggleStudentTaskDone(${s.id})" title="클릭하여 완료 상태 변경">
            ${s.taskDone ? '✓ 오늘 완료' : '○ 미완료'}
          </span>
        </td>
        <td>
          <div class="row-actions">
            <button class="action-btn-pill give" onclick="openCurrencyModal('give', [${s.id}])">
              + 지급
            </button>
            <button class="action-btn-pill deduct" onclick="openCurrencyModal('deduct', [${s.id}])">
              - 차감
            </button>
            <button class="action-btn-pill" style="background: var(--slate-100); color: var(--slate-700);" onclick="openStudentViewDirectly(${s.id})">
              보기
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// 학생 선택 체크박스 토글
function toggleSelectStudent(id) {
  if (state.selectedStudentIds.has(id)) {
    state.selectedStudentIds.delete(id);
  } else {
    state.selectedStudentIds.add(id);
  }
  renderTeacherTable();
}

// 전체 선택 토글
function toggleSelectAllStudents() {
  const selectAllBox = document.getElementById('select-all-students');
  if (!selectAllBox) return;

  if (selectAllBox.checked) {
    state.students.forEach(s => state.selectedStudentIds.add(s.id));
  } else {
    state.selectedStudentIds.clear();
  }
  renderTeacherTable();
}

// 교사 화면에서 학생 1인 1역 완료 토글
function toggleStudentTaskDone(studentId) {
  const student = state.students.find(s => s.id === studentId);
  if (!student) return;

  student.taskDone = !student.taskDone;
  persistData();
  renderTeacherDashboard();
  showToast(`${student.name} 학생의 1인 1역 완료 상태를 변경했습니다.`, 'info');
}

// 교사 화면에서 바로 학생 상세로 이동
function openStudentViewDirectly(studentId) {
  state.currentStudentId = studentId;
  switchMode('student-detail');
}

// ==========================================================================
// 2. 학생 선택 그리드 뷰 (Student Picker)
// ==========================================================================
function renderStudentPicker() {
  const grid = document.getElementById('student-picker-grid');
  if (!grid) return;

  const avatarEmojis = ['🐯', '🐻', '🐼', '🦊', '🐰', '🦁', '🐨', '🦄', '🐬', '🐥', '🌟', '🚀', '🎨', '⚽', '🎯'];

  grid.innerHTML = state.students.map((s, idx) => {
    const lvl = calculateLevel(s.totalEarned);
    const role = state.roles.find(r => r.id === s.roleId) || { name: '미배정' };
    const emoji = avatarEmojis[idx % avatarEmojis.length];

    return `
      <div class="student-select-card" onclick="selectStudentForView(${s.id})">
        <span class="card-number-badge">${s.no}번</span>
        <div class="card-avatar-lg">${emoji}</div>
        <div class="card-student-name">${s.name}</div>
        <div class="card-role-line">
          <span>📌</span> ${role.name}
        </div>
        <div style="margin-bottom: 0.75rem;">
          <span class="level-badge ${lvl.badgeClass}">
            ${lvl.icon} Lv.${lvl.level} ${lvl.title}
          </span>
        </div>
        <div class="card-footer-info">
          <span class="currency-val gold" style="font-size: 0.95rem;">
            <span class="coin-icon" style="width: 17px; height: 17px; font-size: 0.65rem;">G</span>
            ${s.balance.toLocaleString()}
          </span>
          <span class="status-tag ${s.taskDone ? 'done' : 'undone'}" style="font-size: 0.72rem;">
            ${s.taskDone ? '✓ 역할완료' : '○ 역할미완료'}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

function selectStudentForView(studentId) {
  state.currentStudentId = studentId;
  switchMode('student-detail');
}

// ==========================================================================
// 3. 학생 대시보드 뷰 (Student Detail View)
// ==========================================================================
function renderStudentDetail() {
  const student = state.students.find(s => s.id === state.currentStudentId);
  if (!student) {
    switchMode('student-picker');
    return;
  }

  const lvl = calculateLevel(student.totalEarned);
  const role = state.roles.find(r => r.id === student.roleId) || {
    name: '아직 배정된 역할이 없어요',
    desc: '선생님께서 역할을 정해주시면 여기에 안내됩니다.',
  };

  // 1) 상단 영웅 프로필 바인딩
  document.getElementById('hero-student-number').textContent = `${student.no}번`;
  document.getElementById('hero-student-name').textContent = student.name;
  document.getElementById('hero-level-icon').textContent = lvl.icon;
  document.getElementById('hero-level-text').textContent = `Lv.${lvl.level} ${lvl.title}`;
  document.getElementById('hero-exp-progress').textContent = `${lvl.progress}%`;
  document.getElementById('hero-exp-bar-fill').style.width = `${lvl.progress}%`;
  document.getElementById('hero-exp-desc').textContent = lvl.nextExpNeeded > 0
    ? `다음 [${lvl.nextTitle}]까지 ${lvl.nextExpNeeded} EXP 남음`
    : '최고 레벨을 달성했습니다!';

  document.getElementById('hero-balance-val').textContent = student.balance.toLocaleString();
  document.getElementById('hero-total-earned').textContent = `총 누적 수입: ${student.totalEarned.toLocaleString()} ${state.settings.currencyUnit}`;

  // 2) 오늘 할 일(1인 1역) 카드 바인딩
  const taskCard = document.getElementById('daily-task-card');
  const taskRoleName = document.getElementById('daily-task-name');
  const taskRoleDesc = document.getElementById('daily-task-desc');
  const taskBtn = document.getElementById('btn-task-toggle');

  taskRoleName.textContent = role.name;
  taskRoleDesc.textContent = role.desc;

  if (student.taskDone) {
    taskCard.classList.add('completed');
    taskBtn.className = 'btn-task-toggle done';
    taskBtn.innerHTML = '<span>✓ 오늘 수행 완료!</span>';
  } else {
    taskCard.classList.remove('completed');
    taskBtn.className = 'btn-task-toggle undone';
    taskBtn.innerHTML = '<span>오늘 할 일 완료하기 ✨</span>';
  }

  // 3) 하단 탭 내용 렌더링
  renderStudentTabContent(student);
}

// 학생 1인 1역 완료 토글 (학생 본인이 클릭)
function toggleCurrentStudentTask() {
  const student = state.students.find(s => s.id === state.currentStudentId);
  if (!student) return;

  student.taskDone = !student.taskDone;
  persistData();

  if (student.taskDone) {
    triggerConfetti();
    showToast(`🎉 멋져요! 오늘 ${student.name} 학생의 1인 1역 임무를 완료했습니다!`, 'success');
  } else {
    showToast('오늘 1인 1역 수행을 미완료 상태로 되돌렸습니다.', 'info');
  }

  renderStudentDetail();
}

// 학생 탭 전환
function switchStudentTab(tabName) {
  state.currentStudentTab = tabName;

  document.querySelectorAll('.student-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  const student = state.students.find(s => s.id === state.currentStudentId);
  if (student) {
    renderStudentTabContent(student);
  }
}

// 탭별 콘텐츠 렌더링
function renderStudentTabContent(student) {
  const shopSection = document.getElementById('student-tab-shop');
  const invSection = document.getElementById('student-tab-inventory');
  const histSection = document.getElementById('student-tab-history');

  shopSection.style.display = 'none';
  invSection.style.display = 'none';
  histSection.style.display = 'none';

  if (state.currentStudentTab === 'shop') {
    shopSection.style.display = 'block';
    renderShopItems(student);
  } else if (state.currentStudentTab === 'inventory') {
    invSection.style.display = 'block';
    renderInventory(student);
  } else if (state.currentStudentTab === 'history') {
    histSection.style.display = 'block';
    renderStudentHistory(student);
  }

  // 탭 뱃지 개수 업데이트
  const invBadge = document.getElementById('inventory-count-badge');
  if (invBadge) {
    invBadge.textContent = student.inventory.length;
  }
}

// 상점 상품 렌더링
function renderShopItems(student) {
  const grid = document.getElementById('shop-grid-container');
  if (!grid) return;

  if (state.shopItems.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🛒</div>
        <div class="empty-state-text">현재 판매 중인 상점 상품이 없습니다.</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = state.shopItems.map(item => {
    const canAfford = student.balance >= item.price;
    const catLabel = item.category === 'coupon' ? '혜택 쿠폰' : '학급 물품';

    return `
      <div class="shop-item-card">
        <div class="item-top-row">
          <div class="item-icon-box">${item.icon || '🎁'}</div>
          <span class="item-category-tag ${item.category}">${catLabel}</span>
        </div>
        <div class="item-name">${item.name}</div>
        <div class="item-desc">${item.desc}</div>
        <div class="item-bottom-row">
          <div class="item-price">
            <span class="coin-icon">G</span>
            ${item.price.toLocaleString()}
          </div>
          <button class="btn-buy" ${canAfford ? '' : 'disabled'} onclick="buyShopItem('${item.id}')">
            ${canAfford ? '구매하기' : '잔액 부족'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// 상점 상품 구매 로직
function buyShopItem(itemId) {
  const student = state.students.find(s => s.id === state.currentStudentId);
  const item = state.shopItems.find(i => i.id === itemId);
  if (!student || !item) return;

  if (student.balance < item.price) {
    showToast('잔액이 부족하여 상품을 구매할 수 없습니다.', 'danger');
    return;
  }

  if (!confirm(`[${item.name}] 상품을 ${item.price} ${state.settings.currencyName}로 구매하시겠습니까?`)) {
    return;
  }

  // 잔액 차감
  student.balance -= item.price;

  // 인벤토리에 보관
  student.inventory.push(item.id);

  // 거래 내역 기록
  const tx = {
    id: 'tx-' + Date.now(),
    studentId: student.id,
    studentName: student.name,
    type: 'spend',
    amount: item.price,
    reason: `상점 구매: ${item.name}`,
    time: formatCurrentTime(),
  };
  state.transactions.unshift(tx);

  persistData();
  triggerConfetti();
  showToast(`🛍️ [${item.name}] 구매 완료! 보관함에 쏙 들어갔어요!`, 'gold');
  renderStudentDetail();
}

// 인벤토리(보관함) 렌더링
function renderInventory(student) {
  const container = document.getElementById('inventory-list-container');
  if (!container) return;

  if (!student.inventory || student.inventory.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🎒</div>
        <div class="empty-state-text">아직 보관 중인 쿠폰이나 물품이 없습니다. 상점에서 마음에 드는 상품을 구매해 보세요!</div>
      </div>
    `;
    return;
  }

  container.innerHTML = student.inventory.map((itemId, index) => {
    const item = state.shopItems.find(i => i.id === itemId) || {
      name: '사용 가능한 쿠폰',
      icon: '🎟️',
      desc: '선생님께 확인받고 사용할 수 있는 쿠폰입니다.',
    };

    return `
      <div class="inventory-card">
        <div class="inventory-icon">${item.icon}</div>
        <div class="inventory-info">
          <div class="inventory-title">${item.name}</div>
          <span class="inventory-status-badge active">● 사용 가능</span>
        </div>
        <button class="btn-use-toggle" onclick="useInventoryItem(${index})">
          사용 처리
        </button>
      </div>
    `;
  }).join('');
}

// 보관함 아이템 사용 처리 (학생/오프라인 구두 확인)
function useInventoryItem(itemIndex) {
  const student = state.students.find(s => s.id === state.currentStudentId);
  if (!student) return;

  const itemId = student.inventory[itemIndex];
  const item = state.shopItems.find(i => i.id === itemId);
  const itemName = item ? item.name : '쿠폰';

  if (confirm(`선생님께 확인받으셨나요?\n[${itemName}]을(를) 사용 완료 처리하시겠습니까?`)) {
    student.inventory.splice(itemIndex, 1);
    persistData();
    showToast(`✨ [${itemName}] 사용 처리가 완료되었습니다!`, 'success');
    renderStudentDetail();
  }
}

// 학생별 거래 내역 타임라인 렌더링
function renderStudentHistory(student) {
  const container = document.getElementById('history-list-container');
  if (!container) return;

  const userTxs = state.transactions.filter(t => t.studentId === student.id);

  if (userTxs.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📜</div>
        <div class="empty-state-text">아직 화폐 거래 내역이 없습니다.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = userTxs.map(t => {
    const isEarn = t.type === 'earn';
    return `
      <div class="history-item">
        <div class="history-left">
          <div class="history-type-icon ${t.type}">
            ${isEarn ? '💰' : '🛒'}
          </div>
          <div>
            <div class="history-reason">${t.reason}</div>
            <div class="history-time">${t.time}</div>
          </div>
        </div>
        <div class="history-amount ${t.type}">
          ${isEarn ? '+' : '-'}${t.amount.toLocaleString()} ${state.settings.currencyUnit}
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================================================
// 4. 모달 시스템 (화폐 지급/차감, 상점 관리, 1인 1역 관리)
// ==========================================================================
let modalState = {
  currencyType: 'give', // 'give' | 'deduct'
  targetStudentIds: [],
};

// 화폐 지급/차감 모달 열기
function openCurrencyModal(type, targetIds = null) {
  modalState.currencyType = type;

  if (targetIds && targetIds.length > 0) {
    modalState.targetStudentIds = targetIds;
  } else {
    // 선택된 학생이 있으면 해당 학생들, 없으면 전체 대상 안내
    if (state.selectedStudentIds.size > 0) {
      modalState.targetStudentIds = Array.from(state.selectedStudentIds);
    } else {
      modalState.targetStudentIds = state.students.map(s => s.id);
    }
  }

  const isGive = type === 'give';
  document.getElementById('modal-currency-title').textContent = isGive ? '💰 학급 화폐 지급하기' : '💸 학급 화폐 차감하기';
  document.getElementById('btn-currency-submit').className = isGive ? 'btn btn-gold' : 'btn btn-danger-outline';
  document.getElementById('btn-currency-submit').textContent = isGive ? '화폐 지급 완료' : '화폐 차감 완료';

  // 대상 학생 설명 문구
  const targetNames = modalState.targetStudentIds.map(id => {
    const s = state.students.find(st => st.id === id);
    return s ? `${s.no}번 ${s.name}` : '';
  }).slice(0, 5).join(', ');

  const totalTargetCount = modalState.targetStudentIds.length;
  const extraText = totalTargetCount > 5 ? ` 외 ${totalTargetCount - 5}명` : '';
  document.getElementById('currency-target-label').textContent = `${totalTargetCount}명 (${targetNames}${extraText})`;

  // 기본값 리셋
  document.getElementById('currency-amount-input').value = isGive ? '50' : '30';
  document.getElementById('currency-reason-input').value = isGive ? '1인 1역 성실 실천' : '교실 규칙 미준수';

  openModal('modal-currency');
}

// 화폐 빠른 금액 칩 클릭
function setQuickAmount(amt) {
  document.getElementById('currency-amount-input').value = amt;
}

// 사유 프리셋 칩 클릭
function setQuickReason(reason) {
  document.getElementById('currency-reason-input').value = reason;
}

// 화폐 지급/차감 폼 제출
function submitCurrencyAction(e) {
  e.preventDefault();

  const amount = parseInt(document.getElementById('currency-amount-input').value, 10);
  const reason = document.getElementById('currency-reason-input').value.trim();

  if (isNaN(amount) || amount <= 0) {
    showToast('유효한 금액을 입력해 주세요.', 'danger');
    return;
  }
  if (!reason) {
    showToast('사유를 입력해 주세요.', 'danger');
    return;
  }

  const isGive = modalState.currencyType === 'give';
  const now = formatCurrentTime();
  let affectedCount = 0;

  modalState.targetStudentIds.forEach(id => {
    const s = state.students.find(st => st.id === id);
    if (!s) return;

    if (isGive) {
      // 지급: 잔액 증가 + 누적 수입 증가(경험치 1:1 자동 적립)
      s.balance += amount;
      s.totalEarned += amount;
      affectedCount++;

      // 거래 기록
      state.transactions.unshift({
        id: 'tx-' + Date.now() + '-' + s.id,
        studentId: s.id,
        studentName: s.name,
        type: 'earn',
        amount: amount,
        reason: reason,
        time: now,
      });
    } else {
      // 차감: 잔액만 차감 (0 미만 방지, 누적 수입/레벨은 감소하지 않음)
      const actualDeduct = Math.min(s.balance, amount);
      s.balance -= actualDeduct;
      affectedCount++;

      state.transactions.unshift({
        id: 'tx-' + Date.now() + '-' + s.id,
        studentId: s.id,
        studentName: s.name,
        type: 'spend',
        amount: actualDeduct,
        reason: reason,
        time: now,
      });
    }
  });

  persistData();
  closeModal('modal-currency');

  if (isGive) {
    triggerConfetti();
    showToast(`🎉 ${affectedCount}명에게 +${amount}${state.settings.currencyUnit} 지급이 완료되었습니다! (경험치 자동 누적)`, 'gold');
  } else {
    showToast(`${affectedCount}명의 화폐 ${amount}${state.settings.currencyUnit} 차감이 완료되었습니다.`, 'info');
  }

  renderApp();
}

// 상점 관리 모달 열기
function openShopManageModal() {
  renderShopManageList();
  openModal('modal-shop-manage');
}

// 상점 관리 목록 렌더링
function renderShopManageList() {
  const container = document.getElementById('shop-manage-list');
  if (!container) return;

  container.innerHTML = state.shopItems.map(item => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border: 1px solid var(--slate-200); border-radius: var(--radius-md); margin-bottom: 0.5rem; background: var(--white);">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-size: 1.5rem;">${item.icon}</span>
        <div>
          <strong style="font-size: 0.95rem; color: var(--slate-900);">${item.name}</strong>
          <div style="font-size: 0.8rem; color: var(--slate-500);">${item.desc}</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span class="currency-val gold" style="font-size: 0.95rem;">${item.price} G</span>
        <button class="btn btn-sm btn-danger-outline" onclick="deleteShopItem('${item.id}')">삭제</button>
      </div>
    </div>
  `).join('');
}

// 신규 상점 상품 등록
function handleAddShopItem(e) {
  e.preventDefault();
  const name = document.getElementById('new-item-name').value.trim();
  const price = parseInt(document.getElementById('new-item-price').value, 10);
  const icon = document.getElementById('new-item-icon').value.trim() || '🎁';
  const category = document.getElementById('new-item-category').value;
  const desc = document.getElementById('new-item-desc').value.trim();

  if (!name || isNaN(price) || price <= 0 || !desc) {
    showToast('모든 항목을 올바르게 채워주세요.', 'danger');
    return;
  }

  const newItem = {
    id: 'item-' + Date.now(),
    name,
    price,
    icon,
    category,
    desc,
  };

  state.shopItems.push(newItem);
  persistData();

  // 폼 리셋
  document.getElementById('form-add-item').reset();
  renderShopManageList();
  showToast(`신규 상품 [${name}] 등록이 완료되었습니다.`, 'success');
}

// 상점 상품 삭제
function deleteShopItem(itemId) {
  if (confirm('이 상품을 상점에서 삭제하시겠습니까?')) {
    state.shopItems = state.shopItems.filter(i => i.id !== itemId);
    persistData();
    renderShopManageList();
    showToast('상품이 상점에서 삭제되었습니다.', 'info');
  }
}

// 1인 1역 관리 모달 열기
function openRoleManageModal() {
  const container = document.getElementById('role-assign-table-body');
  if (!container) return;

  container.innerHTML = state.students.map(s => {
    const roleOptions = state.roles.map(r => `
      <option value="${r.id}" ${r.id === s.roleId ? 'selected' : ''}>${r.name}</option>
    `).join('');

    return `
      <tr>
        <td style="font-weight: 700; width: 60px;">${s.no}번</td>
        <td style="font-weight: 700; width: 100px;">${s.name}</td>
        <td>
          <select class="form-select role-select-input" data-student-id="${s.id}" style="padding: 0.35rem 0.65rem; font-size: 0.88rem;">
            <option value="">(역할 미배정)</option>
            ${roleOptions}
          </select>
        </td>
      </tr>
    `;
  }).join('');

  openModal('modal-role-manage');
}

// 1인 1역 배정 저장
function saveRoleAssignments() {
  const selects = document.querySelectorAll('.role-select-input');
  selects.forEach(sel => {
    const studentId = parseInt(sel.dataset.studentId, 10);
    const newRoleId = sel.value;
    const s = state.students.find(st => st.id === studentId);
    if (s) {
      s.roleId = newRoleId;
    }
  });

  persistData();
  closeModal('modal-role-manage');
  showToast('25명 학생의 1인 1역 배정이 성공적으로 저장되었습니다.', 'success');
  renderTeacherDashboard();
}

// 오늘 할 일(1인 1역) 전체 리셋
function resetAllDailyTasks() {
  if (confirm('모든 학생의 [오늘 할 일]을 미완료 상태로 초기화하시겠습니까?\n새로운 하루를 시작할 때 유용합니다.')) {
    state.students.forEach(s => s.taskDone = false);
    persistData();
    renderTeacherDashboard();
    showToast('새로운 하루! 모든 학생의 오늘 할 일이 미완료로 초기화되었습니다.', 'info');
  }
}

// 모달 공통 제어
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// ==========================================================================
// 5. 토스트 알림 & 축하 컨페티 효과
// ==========================================================================
function showToast(message, type = 'primary') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3200);
}

// 순수 자바스크립트 캔버스 컨페티(폭죽) 파티클 시스템
let confettiCtx = null;
let confettiParticles = [];
let confettiAnimationId = null;

function initConfettiCanvas() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  confettiCtx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();
}

function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas || !confettiCtx) return;

  const colors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#8b5cf6', '#3b82f6'];
  const particleCount = 80;

  for (let i = 0; i < particleCount; i++) {
    confettiParticles.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
      y: window.innerHeight * 0.4 + (Math.random() - 0.5) * 100,
      w: Math.random() * 9 + 5,
      h: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.7) * 18,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
      decay: Math.random() * 0.015 + 0.01,
    });
  }

  if (!confettiAnimationId) {
    updateConfetti();
  }
}

function updateConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  confettiCtx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    const p = confettiParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.45; // 중력
    p.vx *= 0.98; // 공기 저항
    p.rotation += p.rotationSpeed;
    p.opacity -= p.decay;

    if (p.opacity <= 0 || p.y > canvas.height) {
      confettiParticles.splice(i, 1);
      continue;
    }

    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate((p.rotation * Math.PI) / 180);
    confettiCtx.globalAlpha = Math.max(0, p.opacity);
    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    confettiCtx.restore();
  }

  if (confettiParticles.length > 0) {
    confettiAnimationId = requestAnimationFrame(updateConfetti);
  } else {
    confettiAnimationId = null;
    confettiCtx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// 시간 포맷팅 헬퍼
function formatCurrentTime() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}`;
}
