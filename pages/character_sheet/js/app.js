// Estrutura básica e export/import via arquivo (sem localStorage)

const protocols = [
  "Atirar","Adestrar","Brigar","Cibermedicina","Ciências","Conectar","Conhecimento",
  "Crime","Criptomança","Dirigir","Esconder","Esquivar","Estrategiar","Hacker",
  "Iniciativa","Intimidar","Investigar","Manutenção","Manipulação","Movimentação",
  "Performar","Pilotar","Perceber","Persistir","Persuadir","Programar","Resistir",
  "Seduzir","Sobreviver"
];

// Variável global para itens do inventário
let characterItems = [];

function el(id){return document.getElementById(id)}

// Funções para gerenciar itens na ficha
function openAddItemModal() {
    const modalHtml = `
        <div class="item-modal-backdrop" onclick="closeItemModal(event)" style="position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999;">
            <div class="item-modal" onclick="event.stopPropagation()" style="background:#1f1f1f;border:2px solid var(--accent-pink);padding:20px;border-radius:12px;width:400px;max-width:90vw;">
                <h3 style="color:var(--accent-blue);margin-bottom:15px;"><i class="fas fa-plus"></i> ADICIONAR NOVO ITEM</h3>
                
                <form id="addItemForm" onsubmit="addItem(event)">
                    <div style="margin-bottom:12px;">
                        <label style="color:var(--accent-pink);display:block;margin-bottom:6px;">Nome do Item</label>
                        <input type="text" id="itemName" name="itemName" required placeholder="Ex: Poção de Cura" style="width:100%;padding:8px;background:#0f0f0f;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:var(--text);">
                    </div>
                    
                    <div style="margin-bottom:12px;">
                        <label style="color:var(--accent-pink);display:block;margin-bottom:6px;">Efeito do Item</label>
                        <textarea id="itemEffect" name="itemEffect" required placeholder="Ex: Restaura 20 pontos de vida" style="width:100%;min-height:60px;padding:8px;background:#0f0f0f;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:var(--text);"></textarea>
                    </div>
                    
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
                        <div>
                            <label style="color:var(--accent-pink);display:block;margin-bottom:6px;">É Consumível?</label>
                            <select id="itemConsumable" name="itemConsumable" required onchange="toggleConsumableFields()" style="width:100%;padding:8px;background:#0f0f0f;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:var(--text);">
                                <option value="true">Sim</option>
                                <option value="false">Não</option>
                            </select>
                        </div>
                        
                        <div id="usesGroup">
                            <label style="color:var(--accent-pink);display:block;margin-bottom:6px;">Usos Restantes</label>
                            <input type="number" id="itemUses" name="itemUses" min="0" value="1" style="width:100%;padding:8px;background:#0f0f0f;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:var(--text);">
                        </div>
                    </div>
                    
                    <div style="margin-bottom:12px;">
                        <label style="color:var(--accent-pink);display:block;margin-bottom:6px;">Espaço no Inventário</label>
                        <input type="number" id="itemSpace" name="itemSpace" min="1" value="1" required placeholder="Quantos espaços ocupa" style="width:100%;padding:8px;background:#0f0f0f;border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:var(--text);">
                    </div>
                    
                    <div style="display:flex;gap:10px;justify-content:flex-end;">
                        <button type="button" onclick="closeItemModal()" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:var(--text);padding:8px 16px;border-radius:6px;cursor:pointer;">CANCELAR</button>
                        <button type="submit" style="background:linear-gradient(90deg,var(--accent-blue),var(--accent-pink));border:none;color:#050505;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:700;">ADICIONAR ITEM</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Criar modal temporariamente
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHtml;
    document.body.appendChild(modalDiv.firstElementChild);
}

function closeItemModal(e) {
    if (e && e.target !== e.currentTarget) return;
    const modal = document.querySelector('.item-modal-backdrop');
    if (modal) modal.remove();
}

function toggleConsumableFields() {
    const isConsumable = document.getElementById('itemConsumable').value === 'true';
    const usesGroup = document.getElementById('usesGroup');
    
    if (isConsumable) {
        usesGroup.style.display = 'block';
        document.getElementById('itemUses').required = true;
    } else {
        usesGroup.style.display = 'none';
        document.getElementById('itemUses').required = false;
        document.getElementById('itemUses').value = '0';
    }
}

function addItem(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const isConsumable = formData.get('itemConsumable') === 'true';
    
    const newItem = {
        id: Date.now(),
        name: formData.get('itemName'),
        effect: formData.get('itemEffect'),
        consumable: isConsumable,
        uses: isConsumable ? parseInt(formData.get('itemUses')) : 0,
        space: parseInt(formData.get('itemSpace')),
        targetable: false // Adicionar campo targetable para compatibilidade
    };
    
    characterItems.push(newItem);
    updateItemsList();
    updateInventoryField();
    
    // Sincronizar com a página principal
    syncItemsToMain();
    
    closeItemModal();
    showToast('Item adicionado com sucesso!');
}

function removeItem(itemId) {
    const index = characterItems.findIndex(i => i.id == itemId);
    if (index !== -1) {
        const removedItem = characterItems.splice(index, 1)[0];
        updateItemsList();
        updateInventoryField();
        
        // Sincronizar com a página principal
        syncItemsToMain();
        
        showToast(`"${removedItem.name}" removido do inventário`);
    }
}

// Sincronizar itens com a página principal
function syncItemsToMain() {
    // Obter ID da ficha atual
    const urlParams = new URLSearchParams(window.location.search);
    const sheetId = urlParams.get('edit');
    
    console.log('🔄 SyncItemsToMain - sheetId:', sheetId, 'items:', characterItems.length);
    
    if (sheetId) {
        // Salvar itens específicos da ficha usando seu ID
        const characterKey = `characterItems_${sheetId}`;
        localStorage.setItem(characterKey, JSON.stringify(characterItems));
        console.log('💾 Salvou itens em:', characterKey);
        
        // Salvar também informações da ficha para compatibilidade
        const characterInfo = {
            characterId: sheetId,
            characterName: el('nome')?.value || 'Sem nome',
            items: characterItems
        };
        localStorage.setItem('characterItems', JSON.stringify(characterInfo));
    } else {
        // Se não for edição, salvar como itens genéricos
        localStorage.setItem('characterItems', JSON.stringify(characterItems));
    }
    
    // Disparar evento para notificar outras páginas
    localStorage.setItem('itemsUpdated', Date.now().toString());
    console.log('📢 Evento itemsUpdated disparado');
}

// Carregar itens da página principal
function loadItemsFromMain() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const sheetId = urlParams.get('edit');
        
        console.log('📥 LoadItemsFromMain - sheetId:', sheetId);
        
        if (sheetId) {
            // Tentar carregar itens específicos da ficha
            const characterKey = `characterItems_${sheetId}`;
            const savedItems = localStorage.getItem(characterKey);
            
            if (savedItems) {
                const items = JSON.parse(savedItems);
                if (Array.isArray(items)) {
                    characterItems = items;
                    updateItemsList();
                    updateInventoryField();
                    console.log('✅ Carregou itens específicos da ficha:', items.length);
                }
            } else {
                // Tentar carregar do characterInfo geral
                const characterInfo = localStorage.getItem('characterItems');
                if (characterInfo) {
                    const info = JSON.parse(characterInfo);
                    if (info.characterId === sheetId && Array.isArray(info.items)) {
                        characterItems = info.items;
                        updateItemsList();
                        updateInventoryField();
                        console.log('✅ Carregou itens do characterInfo:', info.items.length);
                    }
                }
            }
        } else {
            // Se não for edição, carregar itens genéricos
            const savedItems = localStorage.getItem('characterItems');
            if (savedItems) {
                const items = JSON.parse(savedItems);
                if (Array.isArray(items)) {
                    characterItems = items;
                    updateItemsList();
                    updateInventoryField();
                    console.log('✅ Carregou itens genéricos:', items.length);
                }
            }
        }
    } catch(e) {
        console.error('Erro ao carregar itens da página principal:', e);
    }
}

function updateItemsList() {
    const itemsList = el('items-list');
    if (!itemsList) return;
    
    if (characterItems.length === 0) {
        itemsList.innerHTML = '<div class="empty-items">Nenhum item no inventário</div>';
        return;
    }
    
    itemsList.innerHTML = '';
    
    characterItems.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        
        const usesText = item.consumable ? ` (${item.uses} usos)` : '';
        const spaceText = item.space > 1 ? ` [${item.space} espaços]` : '';
        
        itemCard.innerHTML = `
            <div class="item-info">
                <div class="item-name">${item.name}${usesText}${spaceText}</div>
                <div class="item-effect">${item.effect}</div>
                <div class="item-details">${item.consumable ? 'Consumível' : 'Permanente'}</div>
            </div>
            <div class="item-controls">
                <button class="item-btn" onclick="removeItem('${item.id}')" style="background:rgba(255,51,204,0.2);border-color:var(--accent-pink);">REMOVER</button>
            </div>
        `;
        itemsList.appendChild(itemCard);
    });
}

function updateInventoryField() {
    const inventoryField = el('inventario');
    if (!inventoryField) return;
    
    // Converter itens para texto formatado
    const inventoryText = characterItems.map(item => {
        const usesText = item.consumable ? ` (${item.uses} usos)` : '';
        const spaceText = item.space > 1 ? ` [${item.space} espaços]` : '';
        return `${item.name}${usesText}${spaceText} - ${item.effect}`;
    }).join('\n');
    
    inventoryField.value = inventoryText;
}

// Inicializar sistema de itens
function initializeItems() {
  // Primeiro tentar carregar itens compartilhados
  loadItemsFromMain();
  
  // Se não houver itens compartilhados, carregar do campo inventário
  if (characterItems.length === 0) {
    const inventoryField = el('inventario');
    if (inventoryField && inventoryField.value) {
      try {
        // Tentar parsear como JSON primeiro
        const parsed = JSON.parse(inventoryField.value);
        if (Array.isArray(parsed)) {
          characterItems = parsed;
        } else {
          // Se não for JSON, tratar como texto simples
          characterItems = [];
        }
      } catch(e) {
        // Se não for JSON, tratar como texto simples
        characterItems = [];
      }
    }
  }
  
  updateItemsList();
  
  // Adicionar listener para sincronização entre páginas
  window.addEventListener('storage', (e) => {
    if (e.key === 'itemsUpdated') {
      loadItemsFromMain();
    }
  });
}

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
          const cargaVal = recursos.carga_operacional != null ? recursos.carga_operacional : (sheet.co || sheet.maxCo || '');
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
          
          // Carregar itens do inventário se existirem
          if (sheet.inventory && Array.isArray(sheet.inventory)) {
            characterItems = sheet.inventory;
            updateItemsList();
          }
          
          // Inicializar sistema de itens após carregar ficha existente
          initializeItems();
        }
        
        // indicar que será atualização
        // removed saveRepo checkbox (sheets are always saved)
      }
    }
  } catch(e) {
    console.error('Erro ao carregar ficha:', e);
  }
  
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

    // Adicionar inventário ao personagem
    character.inventory = characterItems;

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
            level: parseInt(fd.get('level') || fd.get('nivel') || '1'),
            exp: parseInt(fd.get('exp') || '0'),
            avatar: fd.get('avatar') || ''
          };
          const atributos = {
            men: parseInt(fd.get('men') || '0'),
            cor: parseInt(fd.get('cor') || '0'),
            agi: parseInt(fd.get('agi') || '0'),
            for: parseInt(fd.get('for') || '0'),
            cha: parseInt(fd.get('cha') || '0'),
            con: parseInt(fd.get('con') || '0')
          };
          const recursos = {
            vitalidade: parseInt(fd.get('vitalidade') || '0'),
            carga_operacional: parseInt(fd.get('carga-operacional') || '0'),
            defesa: parseInt(fd.get('defesa') || '0')
          };
          const outros = {
            implantes: fd.get('implantes') || '',
            inventario: fd.get('inventario') || '',
            hab_arq: fd.get('habilidades') || ''
          };
          const protocolos = {};
          document.querySelectorAll('#protocol-list input').forEach(i=>{
            const key = i.dataset.protocol || i.name;
            protocolos[key] = parseInt(i.value) || 0;
          });

          const sheet = {
            sheetId: existingId || 'sheet_' + Date.now(),
            meta, atributos, recursos, outros, protocolos,
            inventory: characterItems // Adicionar inventário
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
          playBeep(); showToast('Ficha atualizada');
          //alert('Ficha atualizada no repositório H.E.X.A!');
        } else {
          const sheet = buildFullSheetFromForm(formData);
          sheetRepo.push(sheet);
          localStorage.setItem('sheetRepo', JSON.stringify(sheetRepo));
          localStorage.setItem('sheetRepoUpdated', JSON.stringify({ sheetId: sheet.sheetId, action: 'created', time: Date.now() }));
          playBeep(); showToast('Ficha criada');
          //alert('Ficha salva no repositório H.E.X.A!');
        }
    console.log('>>>> localStorage snapshot:');
    console.log('characters =', localStorage.getItem('characters'));
    console.log('sheetRepo =', localStorage.getItem('sheetRepo'));
    console.log('sheetRepoUpdated =', localStorage.getItem('sheetRepoUpdated'));
    // Não redirecionamos: manter a aba de criação aberta e notificar a aba principal via storage event.
    // (Se desejar, a aba pode ser fechada manualmente pelo usuário.)
  });
  
  // Inicializar itens após carregar ficha
  initializeItems();
});