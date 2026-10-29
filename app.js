if (btnBuyout) {
      btnBuyout.classList.toggle('hidden', !buyoutCheck.ok);
      if (buyoutCheck.ok) {
        btnBuyout.textContent = `💼 Wykup to pole od gracza za $${buyoutCheck.cost}!`;
        btnBuyout.onclick = () => {
          if (executeHostileBuyout(tileIndex, viewer.id)) openPropertyModal(tileIndex);
        };
      }
    }
    if (btnSellLand) {
      btnSellLand.disabled = !(prop.ownerId === viewer.id);
      btnSellLand.textContent = `💵 Sprzedaj Pole do Banku (+$${Math.floor(tile.price * 0.75)})`;
      btnSellLand.onclick = () => { if (sellLandToBank(tileIndex, viewer.id)) modal.classList.add('hidden'); };
    }
    if (btnMort) {
      btnMort.disabled = !(prop.ownerId === viewer.id && prop.level === 0);
      btnMort.onclick = () => { if (toggleMortgageProperty(tileIndex, viewer.id)) openPropertyModal(tileIndex); };
    }

    document.getElementById('pm-history-list').innerHTML = prop.history.map(h => `<li>${h}</li>`).join('');
    modal.classList.remove('hidden');
  }

  /* ==================== ZABEZPIECZONA DAROWIZNA ==================== */
  function openGiftModal() {
    const sender = getMyViewerPlayer();
    if (!sender || sender.isBot) return;
    const others = gameState.players.filter(p => !p.bankrupt && p.id !== sender.id);
    if (!others.length) return;
    const sNameEl = document.getElementById('gift-sender-name');
    if (sNameEl) sNameEl.textContent = `${sender.name} ($${sender.cash})`;
    document.getElementById('gift-error-msg').textContent = '';
    document.getElementById('gift-cash-amount').value = 0;
    document.getElementById('gift-target-player').innerHTML = others.map(p => `<option value="${p.id}">${p.name} ($${p.cash})</option>`).join('');
    const myProps = BOARD_TILES.filter(t => gameState.properties[t.index]?.ownerId === sender.id);
    document.getElementById('gift-props-list').innerHTML = myProps.length
      ? myProps.map(t => `<label><input type="checkbox" value="${t.index}" class="chk-gift-prop"/> ${t.name}</label>`).join('')
      : '<span style="color:#b5abd6;font-size:0.76rem;">Brak własnych działek.</span>';
    document.getElementById('gift-modal')?.classList.remove('hidden');
  }

  function executeGiftTransfer() {
    const sender = getMyViewerPlayer();
    if (!sender || sender.isBot) return;
    const receiver = getPlayerById(document.getElementById('gift-target-player').value);
    const cashVal = Math.max(0, Number(document.getElementById('gift-cash-amount').value) || 0);
    const propIndices = Array.from(document.querySelectorAll('.chk-gift-prop:checked')).map(el => Number(el.value));
    if (!receiver || receiver.id === sender.id) return;
    if (cashVal > sender.cash) {
      document.getElementById('gift-error-msg').textContent = 'Nie masz tylu własnych pieniędzy!';
      return;
    }
    if (cashVal === 0 && propIndices.length === 0) return;

    const summary = [];
    if (cashVal > 0) { sender.cash -= cashVal; receiver.cash += cashVal; summary.push(`$${cashVal}`); }
    propIndices.forEach(idx => {
      const pr = gameState.properties[idx];
      if (pr && pr.ownerId === sender.id) { pr.ownerId = receiver.id; summary.push(BOARD_TILES[idx].shortName); }
    });
    addFeedEvent(`🎁 <strong>${sender.name}</strong> podarował graczowi <strong>${receiver.name}</strong>: <strong>${summary.join(', ')}</strong>!`);
    sfx.buy();
    document.getElementById('gift-modal')?.classList.add('hidden');
    checkMonopolyVictory();
    pushStateSync();
  }

  /* ==================== ZABEZPIECZONA WYMIANA HANDLOWA ==================== */
  function renderTradesList() {
    const panel = document.getElementById('trades-panel-box');
    const box = document.getElementById('trades-list-box');
    if (!panel || !box) return;
    if (!gameState.trades || !gameState.trades.length) { panel.classList.add('hidden'); return; }
    panel.classList.remove('hidden');

    const viewer = getMyViewerPlayer();

    box.innerHTML = gameState.trades.map(tr => {
      const from = getPlayerById(tr.fromId), to = getPlayerById(tr.toId);
      const giveNames = (tr.giveProps || []).map(i => BOARD_TILES[i]?.shortName).join(', ') || 'brak działek';
      const takeNames = (tr.takeProps || []).map(i => BOARD_TILES[i]?.shortName).join(', ') || 'brak działek';

      const canAccept = gameState.isOnline
        ? (viewer && viewer.id === tr.toId)
        : (currentTurnPlayer()?.id === tr.toId);

      return `
        <div class="trade-offer-card" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.14);padding:8px;border-radius:10px;font-size:0.75rem;margin-bottom:6px;">
          <div><strong>${from?.name}</strong> ➔ <strong>${to?.name}</strong></div>
          <div style="font-size:0.71rem;color:#b5abd6;margin:3px 0;">
            Daje: <strong>$${tr.giveCash}</strong> (${giveNames})<br/>
            Żąda: <strong>$${tr.takeCash}</strong> (${takeNames})
          </div>
          <div style="display:flex;gap:6px;margin-top:6px;align-items:center;">
            ${canAccept
              ? `<button type="button" class="btn-quick-up" data-acc="${tr.id}">✅ Akceptuj (Jako ${to?.name})</button>`
              : `<span style="font-size:0.68rem;color:#ffca28;">⏳ Czeka na decyzję: ${to?.name}</span>`}
            <button type="button" class="btn-ghost" data-rej="${tr.id}">Odrzuć / Anuluj</button>
          </div>
        </div>
      `;
    }).join('');

    box.querySelectorAll('[data-acc]').forEach(b => {
      b.onclick = () => {
        const tr = gameState.trades.find(x => x.id === b.dataset.acc);
        if (!tr) return;
        const s = getPlayerById(tr.fromId), t = getPlayerById(tr.toId);
        if (!s || !t || s.cash < tr.giveCash || t.cash < tr.takeCash) {
          alert('Jedna ze stron nie ma już wymaganej gotówki!');
          return;
        }
        s.cash = s.cash - tr.giveCash + tr.takeCash;
        t.cash = t.cash - tr.takeCash + tr.giveCash;
        (tr.giveProps || []).forEach(idx => { if (gameState.properties[idx]?.ownerId === s.id) gameState.properties[idx].ownerId = t.id; });
        (tr.takeProps || []).forEach(idx => { if (gameState.properties[idx]?.ownerId === t.id) gameState.properties[idx].ownerId = s.id; });
        addFeedEvent(`🤝 <strong>${t.name}</strong> zaakceptował wymianę z <strong>${s.name}</strong>!`);
        gameState.trades = gameState.trades.filter(x => x.id !== tr.id);
        checkMonopolyVictory();
        pushStateSync();
      };
    });

    box.querySelectorAll('[data-rej]').forEach(b => {
      b.onclick = () => {
        gameState.trades = gameState.trades.filter(x => x.id !== b.dataset.rej);
        pushStateSync();
      };
    });
  }

  function renderChat() {
    const stream = document.getElementById('chat-stream');
    if (!stream) return;
    stream.innerHTML = gameState.chat.map(m => `
      <div class="chat-bubble-row">
        <span class="player-pawn-inline" style="background:${m.color || '#7c4dff'};width:16px;height:16px;flex-shrink:0;margin-top:3px;"></span>
        <div class="chat-msg-bubble"><span class="chat-msg-author">${m.author} • ${m.time}</span><div>${m.text}</div></div>
      </div>
    `).join('');
    stream.scrollTop = stream.scrollHeight;
  }

  function sendChatMessage(text) {
    if (!text.trim() || !gameState) return;
    const sender = getMyViewerPlayer() || currentTurnPlayer();
    gameState.chat.push({ author: sender.name, color: sender.color, text: text.trim(), time: nowTime() });
    pushStateSync();
  }

  /* ==================== LOBBY Z UNIKALNYMI KOLORAMI ==================== */
  function ensureUniqueLobbyColors() {
    const used = [localPickedColor];
    lobbyOpponents.forEach(o => {
      if (!o.color || used.includes(o.color)) {
        o.color = getFirstAvailableColor(used);
      }
      used.push(o.color);
    });
  }

  function renderLobbySetup() {
    ensureUniqueLobbyColors();

    // Dynamiczne dodanie kafelka Sztolnia Labirynt w Lobby, jeśli brakowało go w HTML
    const lobbyGrid = document.getElementById('lobby-game-picker');
    if (lobbyGrid && !lobbyGrid.querySelector('[data-game="QUORIDOR"]')) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'game-pick-card';
      card.dataset.game = 'QUORIDOR';
      card.innerHTML = `<span class="gp-icon">🧱</span><strong>Sztolnia Labirynt</strong><small>Ściany & Ścieżka</small>`;
      card.onclick = () => {
        document.querySelectorAll('.game-pick-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedGameMode = 'QUORIDOR';
      };
      lobbyGrid.appendChild(card);
    }

    const mapCardsEl = document.getElementById('lobby-map-cards');
    if (mapCardsEl) {
      mapCardsEl.innerHTML = RUDA_MAPS.map(m => `
        <div class="map-thumb-card ${m.id === selectedMapId ? 'active' : ''}" data-map-id="${m.id}" style="background-image:url('${m.photoUrl}'), ${m.fallbackGradient}">
          <span>${m.shortTitle}</span>
        </div>
      `).join('');
      mapCardsEl.querySelectorAll('.map-thumb-card').forEach(card => {
        card.onclick = () => {
          applyMapTheme(card.dataset.mapId);
          if (gameState) { gameState.mapId = card.dataset.mapId; pushStateSync(); }
        };
      });
    }

    const localPicker = document.getElementById('local-color-picker');
    if (localPicker) {
      localPicker.innerHTML = PLAYER_COLORS.map(c => `<button type="button" class="color-dot-pick ${c.hex === localPickedColor ? 'active' : ''}" style="background:${c.hex}" data-hex="${c.hex}" title="${c.name}"></button>`).join('');
      localPicker.querySelectorAll('.color-dot-pick').forEach(btn => {
        btn.onclick = () => {
          localPickedColor = btn.dataset.hex;
          ensureUniqueLobbyColors();
          renderLobbySetup();
        };
      });
    }

    const localAvPicker = document.getElementById('local-avatar-picker');
    if (localAvPicker) {
      localAvPicker.innerHTML = PAWN_AVATARS.map(a => `<button type="button" class="avatar-pick-btn ${a.id === localPickedAvatar ? 'active' : ''}" data-av="${a.id}" title="${a.name}">${a.svg}</button>`).join('');
      localAvPicker.querySelectorAll('.avatar-pick-btn').forEach(btn => { btn.onclick = () => { localPickedAvatar = btn.dataset.av; renderLobbySetup(); }; });
    }

    const onlinePicker = document.getElementById('online-color-picker');
    if (onlinePicker) {
      const takenOnline = (gameState && gameState.isOnline)
        ? gameState.players.filter(p => p.clientToken !== myClientToken).map(p => p.color)
        : [];
      onlinePicker.innerHTML = PLAYER_COLORS.map(c => {
        const isTaken = takenOnline.includes(c.hex);
        return `<button type="button" class="color-dot-pick ${c.hex === onlinePickedColor ? 'active' : ''}" style="background:${c.hex};${isTaken ? 'opacity:0.2;cursor:not-allowed;' : ''}" data-hex="${c.hex}" ${isTaken ? 'disabled title="Zajęty przez innego gracza"' : ''}></button>`;
      }).join('');
      onlinePicker.querySelectorAll('.color-dot-pick:not([disabled])').forEach(btn => {
        btn.onclick = () => { onlinePickedColor = btn.dataset.hex; renderLobbySetup(); };
      });
    }

    const onlineAvPicker = document.getElementById('online-avatar-picker');
    if (onlineAvPicker) {
      onlineAvPicker.innerHTML = PAWN_AVATARS.map(a => `<button type="button" class="avatar-pick-btn ${a.id === onlinePickedAvatar ? 'active' : ''}" data-av="${a.id}" title="${a.name}">${a.svg}</button>`).join('');
      onlineAvPicker.querySelectorAll('.avatar-pick-btn').forEach(btn => { btn.onclick = () => { onlinePickedAvatar = btn.dataset.av; renderLobbySetup(); }; });
    }

    const oppBox = document.getElementById('local-opponents-list');
    if (oppBox) {
      oppBox.innerHTML = lobbyOpponents.map((o, idx) => `
        <div class="opp-row">
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="player-pawn-inline" style="background:${o.color};">${getAvatarSvg(o.avatar)}</span>
            <strong>${o.name}</strong>
            <span style="font-size:0.68rem;color:#b5abd6;">(${o.isBot ? 'Bot AI' : 'Człowiek'})</span>
          </div>
          ${lobbyOpponents.length > 1 ? `<button type="button" class="btn-ghost" data-rm-opp="${idx}">Usuń</button>` : ''}
        </div>
      `).join('');
      oppBox.querySelectorAll('[data-rm-opp]').forEach(btn => {
        btn.onclick = () => { lobbyOpponents.splice(Number(btn.dataset.rmOpp), 1); renderLobbySetup(); };
      });
    }
  }

  function updateLobbyWaitingRoom() {
    if (!gameState || !currentRoomCode || currentRoomCode === 'LOKALNY') return;
    document.getElementById('room-waiting-box')?.classList.remove('hidden');
    const codeDisp = document.getElementById('lobby-room-code-display');
    if (codeDisp) codeDisp.textContent = currentRoomCode;
    const plBox = document.getElementById('lobby-room-players');
    if (plBox) {
      plBox.innerHTML = gameState.players.map(p => `
        <div class="btn-ghost" style="border-left:4px solid ${p.color};display:flex;align-items:center;gap:6px;">
          <span class="player-pawn-inline" style="background:${p.color};width:18px;height:18px;">${getAvatarSvg(p.avatar)}</span>
          <span>${p.name} ${p.isBot ? '🤖' : '👤'} ${p.clientToken === myClientToken ? '(Ty)' : ''}</span>
        </div>
      `).join('');
    }
  }

  function addOrReconnectPlayerToRoom(roomState, myName, myColor, myAvatar, tokenToUse = myClientToken) {
    roomState = normalizeState(roomState);
    const existing = roomState.players.find(p => p.clientToken === tokenToUse);
    if (existing) {
      existing.name = myName || existing.name;
      existing.avatar = myAvatar || existing.avatar;
      myOnlinePlayerId = existing.id;
      activePerspectiveId = existing.id;
      return roomState;
    }
    const usedColors = roomState.players.map(p => p.color);
    const uniqueColor = (!myColor || usedColors.includes(myColor)) ? getFirstAvailableColor(usedColors) : myColor;
    const newId = 'p' + (roomState.players.length + 1);
    roomState.players.push({
      id: newId, clientToken: tokenToUse, name: myName, color: uniqueColor, avatar: myAvatar || 'cool',
      isBot: false, cash: 2000, position: 0, inJail: false, jailTurns: 0, pardonCards: 0, bankrupt: false
    });
    myOnlinePlayerId = newId;
    activePerspectiveId = newId;
    roomState.liars = createLiarsGameState(roomState.players);
    roomState.feed.unshift({ text: `👋 <strong>${myName}</strong> dołączył do pokoju!`, time: nowTime() });
    return roomState;
  }

  function showRankingModal() {
    if (!gameState) return;
    const getNetWorth = (pl) => {
      let w = pl.cash;
      BOARD_TILES.forEach(t => {
        if (gameState.properties[t.index]?.ownerId === pl.id) {
          w += t.price + (gameState.properties[t.index].level * (t.buildCost || 0));
        }
      });
      return w;
    };

    const sorted = [...gameState.players].sort((a, b) => {
      if (a.bankrupt !== b.bankrupt) return a.bankrupt ? 1 : -1;
      return getNetWorth(b) - getNetWorth(a);
    });

    const winner = sorted[0];
    const spot = document.getElementById('ranking-champion-spotlight');
    if (spot && winner) {
      spot.innerHTML = `
        <span class="champ-crown-icon">👑</span>
        <h3 style="color:#ffca28;font-size:1.3rem;margin:4px 0;">Lider Areny: ${winner.name}</h3>
        <p style="font-size:0.84rem;color:#b5abd6;">Łączny majątek: <strong>$${getNetWorth(winner)}</strong> (Gotówka: $${winner.cash})</p>
      `;
    }

    const tbody = document.getElementById('ranking-tbody');
    if (tbody) {
      tbody.innerHTML = sorted.map((p, idx) => {
        const airCnt = AIRPORT_INDICES.filter(i => gameState.properties[i]?.ownerId === p.id).length;
        return `
          <tr class="${idx === 0 ? 'top-winner-row' : ''}">
            <td><strong>#${idx + 1}</strong></td>
            <td style="display:flex;align-items:center;gap:7px;">
              <span class="player-pawn-inline" style="background:${p.color};width:20px;height:20px;">${getAvatarSvg(p.avatar)}</span>
              ${p.name} ${idx === 0 ? '👑' : ''} ${p.isBot ? '🤖' : ''}
            </td>
            <td>${p.bankrupt ? '❌ Bankrut' : `🟢 Aktywny • ✈️×${airCnt}/4`}</td>
            <td><strong>$${getNetWorth(p)}</strong> <small style="color:#b5abd6;">($${p.cash})</small></td>
          </tr>
        `;
      }).join('');
    }
    document.getElementById('ranking-modal')?.classList.remove('hidden');
  }

  /* ==================== KSIĘGA ZASAD WSZYSTKICH 8 GIER ==================== */
  function openRulesModal(initialTab = null) {
    const activeTab = initialTab || (gameState ? gameState.activeGame : 'MONOPOLY');
    const rulesData = {
      MONOPOLY: {
        title: '🏭 Monopoly Ruda Śląska',
        body: `
          <p><strong>✈️ 1. 4 Lotniska = Natychmiastowa Wygrana:</strong> Na planszy są 4 Lotniska Strategiczne. Zgromadzenie wszystkich 4 daje natychmiastowe zwycięstwo! Lotnisk nie da się od nikogo odkupić siłą.</p>
          <p><strong>💼 2. Przymusowy wykup cudzych pól:</strong> Gdy staniesz na zwykłej dzielnicy innego gracza (poniżej Hotelu), płacisz czynsz, a następnie możesz odkupić to pole po zawyżonej cenie.</p>
          <p><strong>🏠 3. Budowa domów:</strong> Po zakupie działki musisz przejechać pełne okrążenie planszy i stanąć na niej ponownie, aby wybudować dom.</p>
        `
      },
      LIARS: {
        title: '🃏 Szynk Kłamców (Blef Karciany)',
        body: `
          <p><strong>🎯 Cel gry:</strong> Pozbądź się wszystkich swoich kart z ręki jako pierwszy (+$500 nagrody).</p>
          <p><strong>🂠 Rozgrywka:</strong> Pierwszy gracz wybiera figurę (A, K, Q, J, 10) i wykłada od 1 do 4 zakrytych kart. Kolejni gracze dokładają karty albo klikają <strong>„SPRAWDZAM!”</strong>.</p>
          <p><strong>🚨 Sprawdzanie:</strong> Jeśli poprzednik kłamał — zabiera całą pulę ze stołu. Jeśli mówił prawdę — pulę zabiera sprawdzający!</p>
        `
      },
      CASINO: {
        title: '🌸 Kwiaciarnia Godula (Ruletka 0–36 & Automat 777)',
        body: `
          <p><strong>🏆 Cel zwycięstwa:</strong> Jako pierwszy osiągnij wybrany cel majątkowy ($5 000, $10 000 lub $25 000).</p>
          <p><strong>🎡 Stół Ruletki (0–36):</strong> Wybierz żeton ($10–$500), klikaj na liczby (wypłata <strong>x36</strong>), tuziny (<strong>x3</strong>) lub kolory (<strong>x2</strong>) i zakręć kołem!</p>
        `
      },
      QUORIDOR: {
        title: '🧱 Sztolnia Labirynt (Quoridor 9×9)',
        body: `
          <p><strong>🎯 Cel gry:</strong> Przeprowadź swojego górnika na przeciwległy koniec planszy 9×9 jako pierwszy!</p>
          <p><strong>🧱 Stawianie ścian:</strong> W swojej turze przesuń pionek o 1 pole ALBO postaw jedną ze swoich 10 ścian (poziomą lub pionową), aby zablokować rywala.</p>
          <p><strong>⚠️ Zakaz zamurowania:</strong> Nie wolno zamknąć przeciwnikowi ostatniej możliwej drogi do mety.</p>
        `
      },
      LUDO: {
        title: '🎲 Chińczyk (Wyścig 4 Dzielnic)',
        body: `
          <p><strong>🎯 Cel gry:</strong> Wprowadź wszystkie 4 swoje pionki z bazy do domku na środku. Wyjście z bazy wymaga wyrzucenia <strong>6</strong>.</p>
        `
      },
      CHECKERS: {
        title: '⚫ Warcaby (2 Graczy lub 2 Drużyny)',
        body: `
          <p><strong>🎯 Zasady:</strong> Ruch po ciemnych polach na ukos. Przy >2 graczach przy stole tworzone są 2 drużyny wykonujące ruchy rotacyjnie.</p>
        `
      },
      CHESS: {
        title: '♟️ Szachy (2 Graczy lub 2 Drużyny)',
        body: `
          <p><strong>🎯 Zasady:</strong> Kliknij swoją figurę, a następnie zielone pole. Zbicie Króla rywala kończy partię. Przy >2 graczach działa tryb 2 drużyn.</p>
        `
      },
      CONNECT4: {
        title: '🪙 Sztolnia 4 w Rzędzie',
        body: `
          <p><strong>🎯 Zasady:</strong> Ułóż 4 krążki swojego koloru w linii poziomej, pionowej lub ukośnej.</p>
        `
      }
    };

    const tabsHtml = Object.keys(rulesData).map(k => `
      <button type="button" class="btn-ghost rules-tab-btn" style="${k === activeTab ? 'background:#ffca28;color:#111;font-weight:900;' : ''}" data-rtab="${k}">${rulesData[k].title.split(' ')[0]} ${k}</button>
    `).join('');

    const cur = rulesData[activeTab] || rulesData.MONOPOLY;
    showGenericModal(
      '❓ Księga Zasad — 8 Gier Ruda Śląska Arena',
      `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">${tabsHtml}</div>
       <div class="action-box" style="line-height:1.65;font-size:0.86rem;">
         <h3 style="color:#ffca28;margin-bottom:6px;">${cur.title}</h3>
         ${cur.body}
       </div>`
    );

    document.querySelectorAll('.rules-tab-btn').forEach(btn => {
      btn.onclick = () => openRulesModal(btn.dataset.rtab);
    });
  }

  function showGenericModal(title, htmlContent) {
    const tEl = document.getElementById('generic-modal-title');
    const bEl = document.getElementById('generic-modal-body');
    if (tEl) tEl.textContent = title;
    if (bEl) bEl.innerHTML = htmlContent;
    document.getElementById('generic-modal')?.classList.remove('hidden');
  }

  /* ==================== 13. INICJALIZACJA ZDARZEŃ I CHEATÓW ==================== */
  function initEvents() {
    // Wyzwalacz Cheatów #1: 5 kliknięć w logo ⚒️ w lewym górnym rogu
    const secretLogo = document.querySelector('.brand-emblem');
    if (secretLogo) {
      secretLogo.onclick = () => {
        emblemTapCount += 1;
        if (emblemTapTimer) clearTimeout(emblemTapTimer);
        if (emblemTapCount >= 5) {
          emblemTapCount = 0;
          toggleSecretLuckMode();
        } else {
          emblemTapTimer = setTimeout(() => { emblemTapCount = 0; }, 1600);
        }
      };
    }

    // Wyzwalacz Cheatów #2: 3 kliknięcia w pastylkę "Okrążenie #1" na środku planszy
    const roundPill = document.getElementById('hud-round');
    if (roundPill) {
      let rTaps = 0;
      let rTimer = null;
      roundPill.style.cursor = 'pointer';
      roundPill.onclick = () => {
        rTaps += 1;
        if (rTimer) clearTimeout(rTimer);
        if (rTaps >= 3) {
          rTaps = 0;
          toggleSecretLuckMode();
        } else {
          rTimer = setTimeout(() => { rTaps = 0; }, 1400);
        }
      };
    }

    // Wyzwalacz Cheatów #3: Wpisanie na klawiaturze słowa "sztygar"
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (e.key && e.key.length === 1) {
        secretKeyBuffer = (secretKeyBuffer + e.key.toLowerCase()).slice(-7);
        if (secretKeyBuffer === 'sztygar') {
          secretKeyBuffer = '';
          toggleSecretLuckMode();
        }
      }
    });

    // Dolny pasek mobilny
    document.querySelectorAll('.mob-nav-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.mob-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.mobTab;
        if (tab === 'ranking') { showRankingModal(); return; }
        if (tab === 'lobby') { document.getElementById('lobby-overlay')?.classList.remove('hidden'); return; }

        const stageBoard = document.getElementById('mobile-pane-board');
        const sidePanel = document.getElementById('mobile-pane-sidebar');
        if (stageBoard && sidePanel && window.innerWidth <= 1280) {
          if (tab === 'board') {
            stageBoard.style.display = 'flex';
            sidePanel.style.display = 'none';
          } else if (tab === 'players') {
            stageBoard.style.display = 'none';
            sidePanel.style.display = 'flex';
            document.getElementById('side-panel-players')?.scrollIntoView({ behavior: 'smooth' });
          } else if (tab === 'chat') {
            stageBoard.style.display = 'none';
            sidePanel.style.display = 'flex';
            document.getElementById('side-panel-chat')?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      };
    });

    bindClick('btn-show-ranking', showRankingModal);
    bindClick('btn-close-ranking', () => document.getElementById('ranking-modal')?.classList.add('hidden'));
    bindClick('btn-ranking-continue', () => document.getElementById('ranking-modal')?.classList.add('hidden'));
    bindClick('btn-ranking-rematch', () => {
      document.getElementById('ranking-modal')?.classList.add('hidden');
      document.getElementById('btn-reset-board')?.click();
    });

    bindClick('btn-toggle-theme', () => {
      document.body.classList.toggle('theme-light');
      document.body.classList.toggle('theme-dark');
    });

    document.querySelectorAll('.game-pick-card').forEach(card => {
      card.onclick = () => {
        document.querySelectorAll('.game-pick-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedGameMode = card.dataset.game;
      };
    });

    document.querySelectorAll('[data-switch-game]').forEach(btn => {
      btn.onclick = () => {
        if (!gameState) return;
        gameState.activeGame = btn.dataset.switchGame;
        pushStateSync();
        checkBotForOtherGames();
      };
    });

    document.querySelectorAll('[data-rules-jump]').forEach(btn => {
      btn.onclick = () => openRulesModal(btn.dataset.rulesJump);
    });

    const triggerMapRoulette = () => {
      playMapRouletteAnimation((newMapId) => {
        if (gameState) { gameState.mapId = newMapId; pushStateSync(); }
      });
    };
    bindClick('btn-random-map', triggerMapRoulette);
    bindClick('btn-lobby-rand-map', triggerMapRoulette);

    document.querySelectorAll('.lobby-tab').forEach(tab => {
      tab.onclick = () => {
        document.querySelectorAll('.lobby-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.lobby-pane').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-' + tab.dataset.tab)?.classList.add('active');
      };
    });

    bindClick('btn-save-firebase', () => {
      if (!connectFirebaseDatabase(document.getElementById('firebase-url-input')?.value)) {
        setBannerStatus('❌ Nieprawidłowy adres URL Firebase.', '#ff5252');
      }
    });

    bindClick('btn-create-room', () => {
      const typedUrl = document.getElementById('firebase-url-input')?.value.trim();
      if (typedUrl && !firebaseDb) connectFirebaseDatabase(typedUrl);
      const hostName = document.getElementById('online-name-input')?.value.trim() || 'Sztygar';
      const code = document.getElementById('join-code-input')?.value.trim().toUpperCase() || ('RUDA' + Math.floor(100 + Math.random() * 900));
      const players = [{ id: 'p1', clientToken: myClientToken, name: hostName, color: onlinePickedColor, avatar: onlinePickedAvatar, isBot: false }];
      myOnlinePlayerId = 'p1';
      activePerspectiveId = 'p1';
      gameState = createFreshGameState(players, 2000, code, true, selectedGameMode, selectedMapId);
      subscribeToRoom(code);
      pushStateSync();
      updateLobbyWaitingRoom();
    });

    bindClick('btn-join-room', () => {
      const typedUrl = document.getElementById('firebase-url-input')?.value.trim();
      if (typedUrl && !firebaseDb) connectFirebaseDatabase(typedUrl);
      const code = document.getElementById('join-code-input')?.value.trim().toUpperCase();
      if (!code) return;
      const myName = document.getElementById('online-name-input')?.value.trim() || ('Górnik_' + Math.floor(10 + Math.random() * 89));

      if (firebaseDb) {
        firebaseDb.ref('rooms/' + code).once('value').then((snap) => {
          const cloudRoom = snap.val();
          if (cloudRoom) {
            gameState = addOrReconnectPlayerToRoom(cloudRoom, myName, onlinePickedColor, onlinePickedAvatar, myClientToken);
            subscribeToRoom(code);
            pushStateSync();
            updateLobbyWaitingRoom();
          } else setBannerStatus(`❌ Pokój "${code}" nie istnieje.`, '#ff5252');
        });
        return;
      }
      const savedRaw = localStorage.getItem('ruda_room_' + code);
      if (savedRaw) {
        gameState = addOrReconnectPlayerToRoom(JSON.parse(savedRaw), myName, onlinePickedColor, onlinePickedAvatar, myClientToken);
        subscribeToRoom(code);
        pushStateSync();
        updateLobbyWaitingRoom();
      }
    });

    bindClick('btn-room-add-bot', () => {
      if (!gameState || gameState.players.length >= 6) return;
      const idx = gameState.players.length + 1;
      const used = gameState.players.map(p => p.color);
      gameState.players.push({
        id: 'p' + idx, clientToken: '', name: 'Bot Górnik #' + idx,
        color: getFirstAvailableColor(used), avatar: PAWN_AVATARS[idx % PAWN_AVATARS.length].id,
        isBot: true, cash: 2000, position: 0, inJail: false, jailTurns: 0, pardonCards: 0, bankrupt: false
      });
      gameState.liars = createLiarsGameState(gameState.players);
      pushStateSync();
      updateLobbyWaitingRoom();
    });

    bindClick('btn-launch-room-game', () => {
      if (!gameState) return;
      if (gameState.players.length < 2) document.getElementById('btn-room-add-bot')?.click();
      document.getElementById('lobby-overlay')?.classList.add('hidden');
      playMapRouletteAnimation((pickedMapId) => {
        gameState.lobbyOpen = false;
        gameState.activeGame = selectedGameMode;
        gameState.mapId = pickedMapId;
        pushStateSync();
        checkBotForOtherGames();
      });
    });

    bindClick('btn-copy-invite-lobby', () => navigator.clipboard?.writeText(buildShareInviteLink(currentRoomCode)));
    bindClick('btn-copy-invite-top', () => navigator.clipboard?.writeText(buildShareInviteLink(currentRoomCode)));

    bindClick('btn-add-bot', () => {
      if (lobbyOpponents.length >= 5) return;
      const used = [localPickedColor, ...lobbyOpponents.map(o => o.color)];
      lobbyOpponents.push({
        name: 'Bot KWK #' + (lobbyOpponents.length + 1),
        isBot: true,
        color: getFirstAvailableColor(used),
        avatar: PAWN_AVATARS[(lobbyOpponents.length + 2) % PAWN_AVATARS.length].id
      });
      renderLobbySetup();
    });

    bindClick('btn-add-human', () => {
      if (lobbyOpponents.length >= 5) return;
      const used = [localPickedColor, ...lobbyOpponents.map(o => o.color)];
      lobbyOpponents.push({
        name: `Gracz ${lobbyOpponents.length + 2}`,
        isBot: false,
        color: getFirstAvailableColor(used),
        avatar: PAWN_AVATARS[(lobbyOpponents.length + 2) % PAWN_AVATARS.length].id
      });
      renderLobbySetup();
    });

    bindClick('btn-start-local-game', () => {
      ensureUniqueLobbyColors();
      const mainName = document.getElementById('local-name-input')?.value.trim() || 'Sztygar';
      const startCash = Number(document.getElementById('local-cash-select')?.value) || 2000;
      const allPlayers = [
        { id: 'p1', clientToken: myClientToken, name: mainName, color: localPickedColor, avatar: localPickedAvatar, isBot: false },
        ...lobbyOpponents.map((o, i) => ({ id: 'p' + (i + 2), name: o.name, color: o.color, avatar: o.avatar, isBot: o.isBot }))
      ];
      myOnlinePlayerId = null;
      isRollingLock = false;
      lastWinnerShown = null;
      document.getElementById('lobby-overlay')?.classList.add('hidden');

      playMapRouletteAnimation((pickedMapId) => {
        gameState = createFreshGameState(allPlayers, startCash, 'LOKALNY', false, selectedGameMode, pickedMapId);
        activePerspectiveId = 'p1';
        subscribeToRoom('LOKALNY');
        pushStateSync();
        checkBotForOtherGames();
      });
    });

    bindClick('btn-roll', handleRollDice);
    bindClick('dice-stage', handleRollDice);
    bindClick('btn-buy', buyCurrentField);
    bindClick('btn-end-turn', endCurrentTurn);
    bindClick('btn-ludo-roll', rollLudoDice);
    bindClick('ludo-die', rollLudoDice);

    bindClick('btn-q-mode-move', () => { quoridorActionMode = 'MOVE'; renderQuoridorGame(); });
    bindClick('btn-q-mode-wall-h', () => { quoridorActionMode = 'WALL_H'; renderQuoridorGame(); });
    bindClick('btn-q-mode-wall-v', () => { quoridorActionMode = 'WALL_V'; renderQuoridorGame(); });

    bindClick('btn-build-quick', () => {
      const active = currentTurnPlayer();
      if (canUpgradeProperty(active.position, active.id).ok) buildHouseOnProperty(active.position, active.id);
    });

    bindClick('btn-buyout-field', () => {
      const active = currentTurnPlayer();
      if (canBuyoutProperty(active.position, active.id).ok) executeHostileBuyout(active.position, active.id);
    });

    bindClick('btn-sell-emergency', () => {
      const active = currentTurnPlayer();
      const firstOwned = BOARD_TILES.find(t => gameState.properties[t.index]?.ownerId === active.id);
      if (firstOwned) openPropertyModal(firstOwned.index);
    });

    bindClick('btn-jail-pay', () => {
      const active = currentTurnPlayer();
      if (canControlTurn() && active.inJail && active.cash >= 100) { active.cash -= 100; active.inJail = false; active.jailTurns = 0; pushStateSync(); }
    });

    bindClick('btn-jail-card', () => {
      const active = currentTurnPlayer();
      if (canControlTurn() && active.inJail && active.pardonCards > 0) { active.pardonCards -= 1; active.inJail = false; active.jailTurns = 0; pushStateSync(); }
    });

    bindClick('btn-liars-play', playLiarsCards);
    bindClick('btn-liars-call', callLiarOnLastPlay);
    bindClick('btn-liars-new-match', () => {
      if (!gameState) return;
      gameState.liars = createLiarsGameState(gameState.players);
      selectedLiarCardIds = [];
      pushStateSync();
      checkBotForOtherGames();
    });

    document.querySelectorAll('.casino-chip-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.casino-chip-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCasinoChip = Number(btn.dataset.chip) || 25;
      };
    });
    const goalSel = document.getElementById('casino-target-select');
    if (goalSel) {
      goalSel.onchange = () => {
        if (gameState) { gameState.casinoGoal = Number(goalSel.value) || 5000; pushStateSync(); }
      };
    }
    bindClick('btn-clear-roulette-bets', clearRouletteBets);
    bindClick('btn-spin-roulette', spinFullGodulaRoulette);
    bindClick('btn-spin-slots', spinGodulaSlots);

    bindClick('btn-reset-board', () => {
      if (!gameState) return;
      isRollingLock = false;
      if (gameState.activeGame === 'MONOPOLY') {
        gameState = createFreshGameState(gameState.players, 2000, gameState.roomCode, gameState.isOnline, 'MONOPOLY', gameState.mapId);
      }
      if (gameState.activeGame === 'LIARS') gameState.liars = createLiarsGameState(gameState.players);
      if (gameState.activeGame === 'QUORIDOR') gameState.quoridor = createQuoridorState();
      if (gameState.activeGame === 'LUDO') gameState.ludo = createLudoState();
      if (gameState.activeGame === 'CHECKERS') gameState.checkers = createCheckersState();
      if (gameState.activeGame === 'CHESS') gameState.chess = createChessState();
      if (gameState.activeGame === 'CONNECT4') gameState.connect4 = createConnect4State();
      pushStateSync();
      checkBotForOtherGames();
    });

    bindClick('btn-bankrupt', () => {
      const viewer = getMyViewerPlayer();
      if (viewer && confirm(`Ogłosić bankructwo dla swojego konta (${viewer.name})?`)) declareBankruptcy(viewer.id, null);
    });

    bindClick('btn-open-gift', openGiftModal);
    bindClick('btn-confirm-gift', executeGiftTransfer);
    bindClick('btn-close-gift', () => document.getElementById('gift-modal')?.classList.add('hidden'));

    let auctionState = null;
    bindClick('btn-auction', () => {
      const active = currentTurnPlayer();
      const tile = BOARD_TILES[active.position];
      auctionState = { tileIndex: tile.index, highBid: Math.max(20, Math.floor(tile.price * 0.4)), leaderId: null };
      document.getElementById('auc-title').textContent = tile.name;
      document.getElementById('auc-current-bid').textContent = `$${auctionState.highBid}`;
      document.getElementById('auc-bidder-select').innerHTML = gameState.players.filter(p => !p.bankrupt && !p.isBot).map(p => `<option value="${p.id}">${p.name} ($${p.cash})</option>`).join('');
      document.getElementById('auction-modal')?.classList.remove('hidden');
    });

    document.querySelectorAll('.btn-auc-add').forEach(btn => {
      btn.onclick = () => {
        if (!auctionState) return;
        const bidder = getPlayerById(document.getElementById('auc-bidder-select').value);
        const inc = Number(btn.dataset.inc);
        if (bidder && bidder.cash >= auctionState.highBid + inc) {
          auctionState.highBid += inc; auctionState.leaderId = bidder.id;
          document.getElementById('auc-current-bid').textContent = `$${auctionState.highBid}`;
          document.getElementById('auc-leader-name').textContent = `Prowadzi: ${bidder.name}`;
        }
      };
    });

    bindClick('btn-auc-finalize', () => {
      if (auctionState && auctionState.leaderId) {
        const winner = getPlayerById(auctionState.leaderId);
        winner.cash -= auctionState.highBid;
        gameState.properties[auctionState.tileIndex].ownerId = winner.id;
        gameState.properties[auctionState.tileIndex].boughtInRound = gameState.round;
      }
      document.getElementById('auction-modal')?.classList.add('hidden');
      gameState.turnPhase = 'END';
      checkMonopolyVictory();
      pushStateSync();
    });

    bindClick('btn-auc-cancel', () => {
      document.getElementById('auction-modal')?.classList.add('hidden');
      gameState.turnPhase = 'END';
      pushStateSync();
    });

    bindClick('btn-new-trade', () => {
      const sender = getMyViewerPlayer();
      if (!sender || sender.isBot) return;
      const partners = gameState.players.filter(p => !p.bankrupt && p.id !== sender.id);
      if (!partners.length) return;
      document.getElementById('trade-error-msg').textContent = '';
      document.getElementById('trade-sender-title').textContent = `Twoja Oferta (${sender.name})`;
      document.getElementById('trade-give-cash').value = 0;
      document.getElementById('trade-take-cash').value = 0;

      const pSel = document.getElementById('trade-partner-select');
      pSel.innerHTML = partners.map(p => `<option value="${p.id}">${p.name} ($${p.cash})</option>`).join('');
      const myProps = BOARD_TILES.filter(t => gameState.properties[t.index]?.ownerId === sender.id);
      document.getElementById('trade-give-props').innerHTML = myProps.map(t => `<label><input type="checkbox" value="${t.index}" class="chk-give-prop"/> ${t.name} ($${t.price})</label>`).join('');
      const renderTarget = () => {
        const theirProps = BOARD_TILES.filter(t => gameState.properties[t.index]?.ownerId === pSel.value);
        document.getElementById('trade-take-props').innerHTML = theirProps.map(t => `<label><input type="checkbox" value="${t.index}" class="chk-take-prop"/> ${t.name} ($${t.price})</label>`).join('');
      };
      pSel.onchange = renderTarget;
      renderTarget();
      document.getElementById('trade-modal')?.classList.remove('hidden');
    });

    bindClick('btn-send-trade-offer', () => {
      const sender = getMyViewerPlayer();
      const target = getPlayerById(document.getElementById('trade-partner-select').value);
      if (!sender || !target) return;
      const giveCash = Math.max(0, Number(document.getElementById('trade-give-cash').value) || 0);
      const takeCash = Math.max(0, Number(document.getElementById('trade-take-cash').value) || 0);
      const giveProps = Array.from(document.querySelectorAll('.chk-give-prop:checked')).map(el => Number(el.value));
      const takeProps = Array.from(document.querySelectorAll('.chk-take-prop:checked')).map(el => Number(el.value));

      if (giveCash > sender.cash) {
        document.getElementById('trade-error-msg').textContent = 'Nie masz tyle gotówki!';
        return;
      }
      if (takeCash > target.cash) {
        document.getElementById('trade-error-msg').textContent = 'Partner nie ma tyle gotówki!';
        return;
      }
      if (takeProps.some(idx => BOARD_TILES[idx].type === 'AIRPORT') && !hasSecretLuck(sender)) {
        document.getElementById('trade-error-msg').textContent = '✈️ Lotniska są strategiczne i nie podlegają zwykłemu wykupowi!';
        return;
      }

      if (target.isBot) {
        const giveVal = giveCash + giveProps.reduce((a, i) => a + BOARD_TILES[i].price, 0);
        const takeVal = takeCash + takeProps.reduce((a, i) => a + BOARD_TILES[i].price, 0);
        const minRatio = hasSecretLuck(sender) ? 0.65 : 1.05;
        if (giveVal >= takeVal * minRatio && takeVal > 0) {
          sender.cash = sender.cash - giveCash + takeCash;
          target.cash = target.cash - takeCash + giveCash;
          giveProps.forEach(idx => { gameState.properties[idx].ownerId = target.id; });
          takeProps.forEach(idx => { gameState.properties[idx].ownerId = sender.id; });
          addFeedEvent(`🤖 <strong>${target.name}</strong> zaakceptował wymianę z <strong>${sender.name}</strong>!`);
          document.getElementById('trade-modal')?.classList.add('hidden');
          checkMonopolyVictory();
          pushStateSync();
        } else {
          document.getElementById('trade-error-msg').textContent = `🤖 ${target.name} odrzuca tę ofertę! Zaproponuj uczciwszą równowartość ($${takeVal}+).`;
        }
        return;
      }

      gameState.trades.push({ id: 'tr_' + Date.now(), fromId: sender.id, toId: target.id, giveCash, takeCash, giveProps, takeProps });
      document.getElementById('trade-modal')?.classList.add('hidden');
      pushStateSync();
    });

    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
      chatForm.onsubmit = (e) => {
        e.preventDefault();
        const inp = document.getElementById('chat-text-input');
        if (inp) { sendChatMessage(inp.value); inp.value = ''; }
      };
    }
    document.querySelectorAll('.emoji-chip').forEach(btn => { btn.onclick = () => sendChatMessage(btn.dataset.emoji); });

    bindClick('btn-open-lobby', () => document.getElementById('lobby-overlay')?.classList.remove('hidden'));
    bindClick('btn-close-lobby', () => document.getElementById('lobby-overlay')?.classList.add('hidden'));
    bindClick('btn-toggle-sound', (e) => { sfx.enabled = !sfx.enabled; e.currentTarget.textContent = sfx.enabled ? '🔊' : '🔇'; });
    bindClick('btn-open-rules', () => openRulesModal());

    bindClick('btn-close-prop-modal', () => document.getElementById('prop-modal')?.classList.add('hidden'));
    bindClick('btn-close-trade', () => document.getElementById('trade-modal')?.classList.add('hidden'));
    bindClick('btn-close-generic', () => document.getElementById('generic-modal')?.classList.add('hidden'));

    if (turnTimerInterval) clearInterval(turnTimerInterval);
    turnTimerInterval = setInterval(() => {
      if (!gameState) return;
      if (gameState.turnSecondsLeft > 0) gameState.turnSecondsLeft -= 1;
      const m = String(Math.floor(gameState.turnSecondsLeft / 60)).padStart(2, '0');
      const s = String(gameState.turnSecondsLeft % 60).padStart(2, '0');
      const hudTimer = document.getElementById('hud-timer');
      if (hudTimer) hudTimer.textContent = `${m}:${s}`;
    }, 1000);
  }

  window.addEventListener('DOMContentLoaded', () => {
    ensureQuoridorDOMExists();
    buildMonopolyBoardDOM();
    buildRouletteFeltGrid();
    applyMapTheme(selectedMapId);
    renderLobbySetup();
    initEvents();

    const params = new URLSearchParams(window.location.search);
    const dbParam = params.get('db');
    const savedFb = localStorage.getItem('ruda_firebase_url');

    if (dbParam) { try { connectFirebaseDatabase(atob(dbParam)); } catch (e) {} }
    else if (HARDCODED_FIREBASE_URL) connectFirebaseDatabase(HARDCODED_FIREBASE_URL);
    else if (savedFb) connectFirebaseDatabase(savedFb);

    gameState = createFreshGameState([
      { id: 'p1', clientToken: myClientToken, name: 'Sztygar', color: PLAYER_COLORS[0].hex, avatar: localPickedAvatar, isBot: false },
      ...lobbyOpponents.map((o, i) => ({ id: 'p' + (i + 2), name: o.name, color: o.color, avatar: o.avatar, isBot: o.isBot }))
    ], 2000, 'LOKALNY', false, 'MONOPOLY', selectedMapId);
    renderAll();

    const roomParam = params.get('room');
    if (roomParam && roomParam.toUpperCase() !== 'LOKALNY') {
      document.querySelector('[data-tab="online"]')?.click();
      const jInp = document.getElementById('join-code-input');
      if (jInp) jInp.value = roomParam.toUpperCase();
    }
  });
})();
