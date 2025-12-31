const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname + '/public'));
app.use(express.json());

// Estado in-memory
const state = {
	// repositório de fichas H.E.X.A (pode ser preenchido via socket)
	repo: [
		// exemplo de ficha
		{ id: 'f1', name: 'Soldado HEXA', image: 'https://via.placeholder.com/128?text=Soldado' }
	],
	order: [], // lista de personagens em combate { id, fichaId, name, image, coSpent, damage }
	activeIndex: -1, // -1 = nenhum ativo
	turnCount: 0,
	roundCount: 0,
	turnStart: null // timestamp ms quando o turno atual começou
};

function emitState() {
	io.emit('state', {
		repo: state.repo,
		order: state.order,
		activeIndex: state.activeIndex,
		turnCount: state.turnCount,
		roundCount: state.roundCount,
		turnStart: state.turnStart
	});
}

io.on('connection', (socket) => {
	// enviar estado inicial
	socket.emit('state', {
		repo: state.repo,
		order: state.order,
		activeIndex: state.activeIndex,
		turnCount: state.turnCount,
		roundCount: state.roundCount,
		turnStart: state.turnStart
	});

	socket.on('addFicha', (ficha) => {
		// ficha: { name, image }
		const id = 'f' + Date.now();
		const newFicha = { id, name: ficha.name || 'Ficha', image: ficha.image || 'https://via.placeholder.com/128' };
		state.repo.push(newFicha);
		emitState();
	});

	socket.on('addCharacter', (fichaId) => {
		const ficha = state.repo.find(f => f.id === fichaId);
		if (!ficha) return;
		const id = 'c' + Date.now();
		state.order.push({ id, fichaId: ficha.id, name: ficha.name, image: ficha.image, coSpent: 0, damage: 0 });
		emitState();
	});

	socket.on('nextTurn', () => {
		if (state.order.length === 0) return;
		if (state.activeIndex === -1) {
			state.activeIndex = 0;
		} else {
			state.activeIndex = (state.activeIndex + 1) % state.order.length;
			// se voltou ao índice 0 incrementa round
			if (state.activeIndex === 0) state.roundCount += 1;
		}
		state.turnCount += 1;
		state.turnStart = Date.now();
		emitState();
	});

	socket.on('reset', () => {
		state.activeIndex = -1;
		state.turnCount = 0;
		state.roundCount = 0;
		state.turnStart = null;
		// reset stats
		state.order.forEach(c => { c.coSpent = 0; c.damage = 0; });
		emitState();
	});

	socket.on('updateTurnStats', (stats) => {
		// stats: { coDelta, damageDelta } applied to current active character
		if (state.activeIndex === -1) return;
		const cur = state.order[state.activeIndex];
		if (!cur) return;
		if (typeof stats.coDelta === 'number') cur.coSpent += stats.coDelta;
		if (typeof stats.damageDelta === 'number') cur.damage += stats.damageDelta;
		emitState();
	});

	socket.on('removeCharacter', (charId) => {
		const idx = state.order.findIndex(c => c.id === charId);
		if (idx === -1) return;
		state.order.splice(idx, 1);
		// ajustar activeIndex se necessário
		if (state.order.length === 0) {
			state.activeIndex = -1;
			state.turnStart = null;
		} else if (state.activeIndex >= state.order.length) {
			state.activeIndex = 0;
		}
		emitState();
	});

	socket.on('disconnect', () => {});
});

// opcional: emitir heartbeat com tempo decorrido a cada 1s (cliente calcula localmente também)
setInterval(() => {
	io.emit('timeTick', { now: Date.now() });
}, 1000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
