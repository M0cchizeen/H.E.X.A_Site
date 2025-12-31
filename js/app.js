// Estrutura básica e export/import via arquivo (sem localStorage)

const protocols = [
  "Atirar","Adestrar","Brigar","Cibermedicina","Ciências","Conectar","Conhecimento",
  "Crime","Criptomança","Dirigir","Esconder","Esquivar","Estrategiar","Hacker",
  "Iniciativa","Intimidar","Investigar","Manutenção","Manipulação","Movimentação",
  "Performar","Pilotar","Perceber","Persistir","Persuadir","Programar","Resistir",
  "Seduzir","Sobreviver"
];

function el(id){return document.getElementById(id)}

// popula lista de protocolos com campos editáveis
function buildProtocols(){
  const container = el('protocol-list');
  container.innerHTML = '';
  protocols.forEach(p=>{
    const div = document.createElement('div');
    div.className = 'protocol-item';
    const label = document.createElement('span'); label.textContent = p;
    const input = document.createElement('input'); input.type='text'; input.dataset.protocol=p;
    input.placeholder = 'valor...'; input.style.width='60px';
    div.appendChild(label); div.appendChild(input);
    container.appendChild(div);
  });
}

function gatherData(){
  // campos simples
  const data = {
    meta: {
      nome: el('nome').value, jogador: el('jogador').value, arquetipo: el('arquetipo').value,
      plano: el('plano').value, nivel: el('nivel').value, exp: el('exp').value
    },
    atributos: {
      men: el('men').value, cor: el('cor').value, agi: el('agi').value,
      for: el('for').value, cha: el('cha').value, con: el('con').value
    },
    recursos: {
      vit_atual: el('vit_atual').value, vit_max: el('vit_max').value,
      co_atual: el('co_atual').value, co_max: el('co_max').value, defesa: el('defesa').value
    },
    implantes: el('implantes').value,
    inventario: el('inventario').value,
    hab_arq: el('hab_arq').value,
    protocolos: {}
  };

  document.querySelectorAll('#protocol-list input').forEach(i=>{
    data.protocolos[i.dataset.protocol] = i.value;
  });

  return data;
}

function applyData(data){
  if(!data) return;
  const m = data.meta||{};
  el('nome').value = m.nome||''
  el('jogador').value = m.jogador||''
  el('arquetipo').value = m.arquetipo||''
  el('plano').value = m.plano||''
  el('nivel').value = m.nivel||''
  el('exp').value = m.exp||''
  const a = data.atributos||{};
  ['men','cor','agi','for','cha','con'].forEach(k=>el(k).value = a[k]||'')
  const r = data.recursos||{};
  ['vit_atual','vit_max','co_atual','co_max','defesa'].forEach(k=>el(k).value = r[k]||'')
  el('implantes').value = data.implantes||''
  el('inventario').value = data.inventario||''
  el('hab_arq').value = data.hab_arq||''
  const p = data.protocolos||{};
  document.querySelectorAll('#protocol-list input').forEach(i=>i.value = p[i.dataset.protocol]||'')
}

function exportJSON(){
  const data = gatherData();
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = (data.meta.nome || 'ficha') + '.json';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

function importJSON(file){
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try{
      const parsed = JSON.parse(e.target.result);
      applyData(parsed);
    }catch(err){
      alert('Arquivo JSON inválido.');
    }
  };
  reader.readAsText(file);
}

function clearAll(){
  document.querySelectorAll('input,textarea').forEach(i=>{
    if(i.type === 'number' || i.type === 'text' || i.type === 'file') i.value = '';
    else i.value = '';
  });
  buildProtocols();
}

document.addEventListener('DOMContentLoaded', ()=>{
  buildProtocols();
  const exportBtn = el('exportBtn');
  if(exportBtn) exportBtn.addEventListener('click', exportJSON);

  const importFile = el('importFile');
  if(importFile) importFile.addEventListener('change', e=>importJSON(e.target.files[0]));

  const clearBtn = el('clearBtn');
  if(clearBtn) clearBtn.addEventListener('click', clearAll);

  const charForm = document.getElementById('character-form');
  if(charForm) charForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const character = {};

    formData.forEach((value, key) => {
        character[key] = value;
    });

    const characters = JSON.parse(localStorage.getItem('characters')) || [];
    characters.push(character);
    localStorage.setItem('characters', JSON.stringify(characters));
    // Se o usuário marcou para salvar no repositório, também adiciona à lista de fichas
    const saveRepo = formData.get('saveRepo');
    if (saveRepo === 'on') {
      const sheetRepo = JSON.parse(localStorage.getItem('sheetRepo')) || [];
      const sheet = {
        sheetId: 'custom-' + Date.now(),
        name: formData.get('name') || formData.get('nome') || 'Sem nome',
        archetype: formData.get('archetype') || formData.get('arquetipo') || '',
        avatar: formData.get('avatar') || '🙂',
        // usar Vitalidade da ficha como PV (pv atual e pv máximo)
        hp: parseInt(formData.get('vitalidade') || 0),
        maxHp: parseInt(formData.get('vitalidade') || 0),
        // usar carga operacional atual/máxima como CO
        co: parseInt(formData.get('carga-atual') || formData.get('co_atual') || 0),
        maxCo: parseInt(formData.get('carga-maxima') || formData.get('co_max') || 0)
      };
      sheetRepo.push(sheet);
      localStorage.setItem('sheetRepo', JSON.stringify(sheetRepo));
      console.log('Ficha salva em sheetRepo:', sheet);
      alert('Ficha salva no repositório H.E.X.A!');
    }

    alert('Personagem salvo com sucesso!');
    window.location.href = '../index.html';
});
});