const socket = io();

let state = null;

// elementos
const turnCountEl = document.getElementById('turnCount');
const roundCountEl = document.getElementById('roundCount');
const turnTimerEl = document.getElementById('turnTimer');
const noActiveEl = document.getElementById('noActive');
const activeCardEl = document.getElementById('activeCard');
const activeImage = document.getElementById('activeImage');
const activeName = document.getElementById('activeName');
const activeCO = document.getElementById('activeCO');
const activeDmg = document.getElementById('activeDmg');
const orderList = document.getElementById('orderList');

const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');
const addBtn = document.getElementById('addBtn');
const openRepoBtn = document.getElementById('openRepoBtn');

const repoModal = document.getElementById('repoModal');
const addFichaForm = document.getElementById('addFichaForm');
const fichaName = document.getElementById('fichaName');
const fichaImage = document.getElementById('fichaImage');
const repoList = document.getElementById('repoList');
const closeRepo = document.getElementById('closeRepo');

socket.on('state', (s) => { state = s; render(); });
socket.on('timeTick', () => { renderTimer(); });

nextBtn.onclick = () => socket.emit('nextTurn');
resetBtn.onclick = () => socket.emit('reset');
openRepoBtn.onclick = () => { repoModal.style.display = 'flex'; renderRepo(); };
closeRepo.onclick = () => repoModal.style.display = 'none';

addFichaForm.onsubmit = (e) => {
	e.preventDefault();
	socket.emit('addFicha', { name: fichaName.value, image: fichaImage.value });
	fichaName.value = '';
	fichaImage.value = '';
	renderRepo();
};

addBtn.onclick = () => {
	// abrir repositório para escolher uma ficha para adicionar
	repoModal.style.display = 'flex';
	renderRepo(true);
};

function renderRepo(selectMode) {
	repoList.innerHTML = '';
	(state && state.repo ? state.repo : []).forEach(f => {
		const li = document.createElement('li');
		li.innerHTML = `${f.name} <img src="${f.image}" style="width:40px;height:40px;object-fit:cover;margin-left:8px" />`;
		if (selectMode) {
			const btn = document.createElement('button');
			btn.textContent = 'Adicionar à ordem';
			btn.onclick = () => {
				socket.emit('addCharacter', f.id);
				repoModal.style.display = 'none';
			};
			li.appendChild(btn);
		}
		repoList.appendChild(li);
	});
}

function render() {
	if (!state) return;
	turnCountEl.textContent = state.turnCount;
	roundCountEl.textContent = state.roundCount;
	renderTimer();

	// ativo
	if (state.activeIndex === -1) {
		noActiveEl.style.display = 'block';
		activeCardEl.style.display = 'none';
	} else {
		const cur = state.order[state.activeIndex];
		if (cur) {
			noActiveEl.style.display = 'none';
			activeCardEl.style.display = 'block';
			activeImage.src = cur.image;
			activeName.textContent = cur.name;
			activeCO.textContent = cur.coSpent;
			activeDmg.textContent = cur.damage;
		}
	}

	// ordem
	orderList.innerHTML = '';
	state.order.forEach((c, idx) => {
		const li = document.createElement('li');
		li.innerHTML = `<strong>${idx+1}.</strong> ${c.name} <img src="${c.image}" style="width:40px;height:40px;object-fit:cover;margin-left:8px" /> CO:${c.coSpent} Dmg:${c.damage}`;
		// botão para remover
		const rm = document.createElement('button');
		rm.textContent = 'Remover';
		rm.onclick = () => socket.emit('removeCharacter', c.id);
		li.appendChild(rm);

		// se é atual, destacar
		if (state.activeIndex === idx) li.style.background = '#eef';
		orderList.appendChild(li);
	});
}

function renderTimer() {
	if (!state || !state.turnStart) {
		turnTimerEl.textContent = '00:00';
		return;
	}
	const elapsed = Math.floor((Date.now() - state.turnStart) / 1000);
	const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
	const ss = String(elapsed % 60).padStart(2, '0');
	turnTimerEl.textContent = `${mm}:${ss}`;
}

// atalhos simples: incrementar CO/damage no turno atual pelo prompt (pode ser adaptado para UI)
document.addEventListener('keydown', (e) => {
	if (e.key === 'c') {
		const v = parseInt(prompt('CO gasto neste turno (valor posse)') || '0', 10);
		if (!isNaN(v)) socket.emit('updateTurnStats', { coDelta: v });
	}
	if (e.key === 'd') {
		const v = parseInt(prompt('Dano causado neste turno') || '0', 10);
		if (!isNaN(v)) socket.emit('updateTurnStats', { damageDelta: v });
	}
});
