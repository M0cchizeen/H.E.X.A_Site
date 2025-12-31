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
  if (!container) return; // elemento pode não existir em algumas páginas
  container.innerHTML = '';
  protocols.forEach(p=>{
    const div = document.createElement('div');
    div.className = 'protocol-item';
    const label = document.createElement('span'); label.textContent = p;
    const input = document.createElement('input');
    input.type = 'number'; input.min = 0; input.max = 3; input.value = 0;
    input.name = p; input.dataset.protocol = p; input.style.width = '60px'; input.style.margin = '0 auto';
    div.appendChild(label); div.appendChild(input);
    container.appendChild(div);
  });
}

  // mostra uma mensagem temporária no canto inferior direito
  function showToast(msg, duration = 2200) {
    let t = document.createElement('div');
    t.textContent = msg;
    t.style.position = 'fixed';
    t.style.right = '20px';
    t.style.bottom = '20px';
    t.style.background = 'linear-gradient(90deg,#00d1ff,#ff33cc)';
    t.style.color = '#050505';
    t.style.padding = '10px 14px';
    t.style.borderRadius = '10px';
    t.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
    t.style.fontFamily = 'Roboto Mono, monospace';
    t.style.zIndex = 9999;
    t.style.opacity = '0';
    t.style.transition = 'opacity 220ms ease, transform 220ms ease';
    document.body.appendChild(t);
    requestAnimationFrame(()=>{ t.style.opacity = '1'; t.style.transform = 'translateY(-4px)'; });
    setTimeout(()=>{ t.style.opacity = '0'; t.style.transform = 'translateY(0px)'; setTimeout(()=>t.remove(), 260); }, duration);
  }

  // reproduz um bip curto via WebAudio
  function playBeep() {
    try{
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = 880;
      g.gain.value = 0.0001;
      o.connect(g); g.connect(ctx.destination);
      const now = ctx.currentTime;
      g.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
      o.start(now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      o.stop(now + 0.2);
      // close context a bit later
      setTimeout(()=>{ try{ ctx.close(); }catch(e){} }, 500);
    }catch(e){ console.log('beep failed', e); }
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
  if (el('protocol-list')) buildProtocols();

  // se abriu com ?edit=sheetId, carregar a ficha do sheetRepo e preencher o formulário
  try{
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');
    if (editId) {
      const sheetRepo = JSON.parse(localStorage.getItem('sheetRepo')) || [];
      const sheet = sheetRepo.find(s => s.sheetId === editId);
      if (sheet) {
        // criar hidden input para indicar edição
        let h = document.getElementById('editingSheetId');
        if (!h) {
          h = document.createElement('input');
          h.type = 'hidden'; h.id = 'editingSheetId'; h.name = 'editingSheetId';
          document.getElementById('character-form').appendChild(h);
        }
        h.value = editId;
        // preencher campos compatíveis (suporta formatos antigos e novos com meta/atributos/recursos)
        const f = document.getElementById('character-form');
        if (f) {
          const meta = sheet.meta || {};
          const atributos = sheet.atributos || {};
          const recursos = sheet.recursos || {};

          const nameVal = sheet.name || meta.name || meta.nome || '';
          const archeVal = sheet.archetype || meta.archetype || meta.arquetipo || '';
          const backgroundVal = sheet.background || meta.background || meta.plano || '';
          const levelVal = meta.level || meta.nivel || sheet.level || '';
          const expVal = meta.exp || sheet.exp || '';

          const setIf = (id, value) => { const el = document.getElementById(id); if (el && (value !== undefined)) el.value = value; };

          setIf('name', nameVal);
          setIf('archetype', archeVal);
          setIf('background', backgroundVal);
          setIf('level', levelVal);
          setIf('exp', expVal);

          // atributos
          ['men','cor','agi','for','cha','con'].forEach(k=>{
            const v = atributos[k] != null ? atributos[k] : sheet[k];
            setIf(k, v);
          });

          // recursos
          setIf('vitalidade', recursos.vitalidade != null ? recursos.vitalidade : (sheet.vitalidade || sheet.hp || ''));
          // unified carga-operacional field: prefer recursos values, fall back to legacy fields
          const cargaVal = (recursos.carga_atual != null ? recursos.carga_atual : (recursos.carga_maxima != null ? recursos.carga_maxima : (sheet['carga-atual'] || sheet['carga-maxima'] || sheet.co || sheet.maxCo || '')));
          setIf('carga-operacional', cargaVal);
          setIf('defesa', recursos.defesa != null ? recursos.defesa : sheet.defesa || '');

          // avatar, implantes, inventario, habilidades
          setIf('avatar', sheet.avatar || meta.avatar || '');
          setIf('implantes', sheet.implantes || '');
          setIf('inventario', sheet.inventario || '');
          setIf('habilidades', sheet.hab_arq || sheet.habilidades || '');

          // preencher protocolos (se existirem)
          try{
            const prot = sheet.protocolos || {};
            document.querySelectorAll('#protocol-list input').forEach(i=>{
              const key = i.dataset.protocol || i.name;
              if (key && (prot[key] !== undefined)) i.value = prot[key];
            });
          }catch(e){}

          // indicar que será atualização
          // removed saveRepo checkbox (sheets are always saved)
        }
      }
    }
  } catch(err){ console.log('erro ao tentar carregar ficha para edição', err); }
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
    console.log('Formulario submetido — entries:');
    for (const pair of formData.entries()) console.log(pair[0], '=', pair[1]);
    const character = {};

    formData.forEach((value, key) => {
        character[key] = value;
    });

    const characters = JSON.parse(localStorage.getItem('characters')) || [];
    characters.push(character);
    localStorage.setItem('characters', JSON.stringify(characters));
    console.log('characters salvo. total now:', characters.length);
    // Sempre adiciona/atualiza a ficha no repositório
    // construir objeto completo da ficha a partir do form
    function buildFullSheetFromForm(fd, existingId) {
          const meta = {
            name: fd.get('name') || fd.get('nome') || 'Sem nome',
            archetype: fd.get('archetype') || fd.get('arquetipo') || '',
            background: fd.get('background') || fd.get('plano') || '',
            level: fd.get('level') || fd.get('nivel') || '',
            exp: fd.get('exp') || ''
          };

          const atributos = {
            men: fd.get('men') || '',
            cor: fd.get('cor') || '',
            agi: fd.get('agi') || '',
            for: fd.get('for') || '',
            cha: fd.get('cha') || '',
            con: fd.get('con') || ''
          };

          const recursos = {
            vitalidade: parseInt(fd.get('vitalidade') || 0) || 0,
            carga_atual: parseInt(fd.get('carga-operacional') || fd.get('carga-atual') || fd.get('co_atual') || 0) || 0,
            carga_maxima: parseInt(fd.get('carga-operacional') || fd.get('carga-maxima') || fd.get('co_max') || 0) || 0,
            defesa: parseInt(fd.get('defesa') || 0) || 0
          };

          // coletar valores de protocolos do DOM
          const protocolosObj = {};
          document.querySelectorAll('#protocol-list input').forEach(i=>{
            const key = i.dataset.protocol || i.name || ('p_' + (i.id || Math.random().toString(36).slice(2,6)));
            protocolosObj[key] = parseInt(i.value) || 0;
          });

          const sheet = {
            sheetId: existingId || ('custom-' + Date.now()),
            meta,
            atributos,
            recursos,
            avatar: fd.get('avatar') || '🙂',
            implantes: fd.get('implantes') || '',
            inventario: fd.get('inventario') || '',
            hab_arq: fd.get('habilidades') || fd.get('hab_arq') || '',
            protocolos: protocolosObj
          };
          return sheet;
        }

        const editingIdInput = document.getElementById('editingSheetId');
        const sheetRepo = JSON.parse(localStorage.getItem('sheetRepo')) || [];
        if (editingIdInput && editingIdInput.value) {
          const editId = editingIdInput.value;
          const updated = buildFullSheetFromForm(formData, editId);
          const idx = sheetRepo.findIndex(s => s.sheetId === editId);
          if (idx !== -1) sheetRepo[idx] = updated; else sheetRepo.push(updated);
          localStorage.setItem('sheetRepo', JSON.stringify(sheetRepo));
          localStorage.setItem('sheetRepoUpdated', JSON.stringify({ sheetId: editId, action: 'updated', time: Date.now() }));
          console.log('Ficha atualizada em sheetRepo:', updated);
          showToast('Ficha atualizada'); playBeep();
          //alert('Ficha atualizada no repositório H.E.X.A!');
        } else {
          const sheet = buildFullSheetFromForm(formData);
          sheetRepo.push(sheet);
          localStorage.setItem('sheetRepo', JSON.stringify(sheetRepo));
          localStorage.setItem('sheetRepoUpdated', JSON.stringify({ sheetId: sheet.sheetId, action: 'created', time: Date.now() }));
          console.log('Ficha salva em sheetRepo:', sheet);
          console.log('sheetRepo length now:', sheetRepo.length);
          showToast('Ficha salva'); playBeep();
          //alert('Ficha salva no repositório H.E.X.A!');
        }

      //alert('Personagem salvo com sucesso! A página principal será notificada para abrir o repositório.');
    // DEBUG: mostrar snapshot do localStorage relevante
    console.log('>>>> localStorage snapshot:');
    console.log('characters =', localStorage.getItem('characters'));
    console.log('sheetRepo =', localStorage.getItem('sheetRepo'));
    console.log('sheetRepoUpdated =', localStorage.getItem('sheetRepoUpdated'));
    // Não redirecionamos: manter a aba de criação aberta e notificar a aba principal via storage event.
    // (Se desejar, a aba pode ser fechada manualmente pelo usuário.)
  });
  });