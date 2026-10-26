}
        });

        // Rysowanie postawionych ścian poziomych i pionowych zaczepionych w lewym górnym rogu (r, c)
        if (q.hWalls.includes(`${r},${c}`)) {
          const hw = document.createElement('div');
          hw.className = 'q-wall-placed-h';
          cell.appendChild(hw);
        }
        if (q.vWalls.includes(`${r},${c}`)) {
          const vw = document.createElement('div');
          vw.className = 'q-wall-placed-v';
          cell.appendChild(vw);
        }

        cell.onclick = () => {
          if (!canControl) return;
          if (quoridorActionMode === 'MOVE') {
            if (isStep) executeQuoridorMove(r, c);
          } else if (quoridorActionMode === 'WALL_H') {
            if (r < 8 && c < 8) executeQuoridorWall('H', r, c);
          } else if (quoridorActionMode === 'WALL_V') {
            if (r < 8 && c < 8) executeQuoridorWall('V', r, c);
          }
        };

        grid.appendChild(cell);
      }
    }
  }

  /* ==================== 11. CHIŃCZYK, WARCABY, SZACHY, 4 W RZĘDZIE ==================== */
  const LUDO_TRACK = [[4,0],[4,1],[4,2],[4,3],[4,4],[3,4],[2,4],[1,4],[0,4],[0,5],[0,6],[1,6],[2,6],[3,6],[4,6],[4,7],[4,8],[4,9],[4,10],[5,10],[6,10],[6,9],[6,8],[6,7],[6,6],[7,6],[8,6],[9,6],[10,6],[10,5],[10,4],[9,4],[8,4],[7,4],[6,4],[6,3],[6,2],[6,1],[6,0],[5,0]];
  const LUDO_BASES = [[[1,1],[1,2],[2,1],[2,2]],[[1,8],[1,9],[2,8],[2,9]],[[8,8],[8,9],[9,8],[9,9]],[[8,1],[8,2],[9,1],[9,2]]];
  const LUDO_HOMES = [[[5,1],[5,2],[5,3],[5,4]],[[1,5],[2,5],[3,5],[4,5]],[[5,9],[5,8],[5,7],[5,6]],[[9,5],[8,5],[7,5],[6,5]]];
  const LUDO_COLORS = ['#ff7849', '#00e5ff', '#ffca28', '#f06292'];
  const LUDO_NAMES  = ['Wirek', 'Nowy Bytom', 'Halemba', 'Bykowina'];

  function canMoveLudoPawn(pIdx, pawnIdx, dice) {
    const step = gameState.ludo.pawns[pIdx][pawnIdx];
    if (step === -1) return dice === 6;
    if (step + dice > 43) return false;
    if (step + dice >= 40) return !gameState.ludo.pawns[pIdx].includes(step + dice);
    return true;
  }

  function rollLudoDice() {
    if (!gameState || gameState.activeGame !== 'LUDO') return;
    const ludo = gameState.ludo;
    if (ludo.rolled || ludo.winner !== null) return;
    const pCount = Math.min(4, gameState.players.length);
    const curPlayer = gameState.players[ludo.turn % pCount];
    if (!curPlayer.isBot && !canControlTurn(ludo.turn % pCount)) return;

    sfx.dice();
    const dieEl = document.getElementById('ludo-die');
    dieEl?.classList.add('rolling');

    setTimeout(() => {
      dieEl?.classList.remove('rolling');
      const allInBase = ludo.pawns[ludo.turn].every(s => s === -1);
      const luckBoost = hasSecretLuck(curPlayer) ? 0.55 : 0.38;
      const d = (allInBase && Math.random() < luckBoost)
        ? 6
        : (hasSecretLuck(curPlayer) && Math.random() < 0.28 ? 6 : (Math.floor(Math.random() * 6) + 1));

      ludo.dice = d;
      ludo.rolled = true;
      if (dieEl) dieEl.dataset.val = d;

      const anyMove = [0,1,2,3].some(i => canMoveLudoPawn(ludo.turn, i, d));
      if (!anyMove) {
        setTimeout(() => {
          ludo.rolled = false;
          ludo.turn = (ludo.turn + 1) % pCount;
          pushStateSync();
          checkBotForOtherGames();
        }, 550);
      } else {
        pushStateSync();
        if (curPlayer.isBot) {
          setTimeout(() => {
            const movableIdx = [0,1,2,3].find(i => canMoveLudoPawn(ludo.turn, i, ludo.dice));
            if (movableIdx !== undefined) moveLudoPawn(ludo.turn, movableIdx, true);
          }, 500);
        }
      }
    }, 350);
  }

  function moveLudoPawn(pIdx, pawnIdx, isBotCall = false) {
    const ludo = gameState.ludo;
    const pCount = Math.min(4, gameState.players.length);
    if (!ludo.rolled || ludo.turn !== pIdx) return;
    if (!isBotCall && !canControlTurn(pIdx)) return;
    if (!canMoveLudoPawn(pIdx, pawnIdx, ludo.dice)) return;

    let step = ludo.pawns[pIdx][pawnIdx];
    step = (step === -1) ? 0 : (step + ludo.dice);
    ludo.pawns[pIdx][pawnIdx] = step;
    sfx.step();

    if (step < 40) {
      const myGlobalIdx = (step + pIdx * 10) % 40;
      for (let otherP = 0; otherP < pCount; otherP++) {
        if (otherP === pIdx) continue;
        for (let k = 0; k < 4; k++) {
          const oStep = ludo.pawns[otherP][k];
          if (oStep >= 0 && oStep < 40 && ((oStep + otherP * 10) % 40) === myGlobalIdx) {
            ludo.pawns[otherP][k] = -1;
            sfx.rent();
          }
        }
      }
    }
    if (ludo.pawns[pIdx].every(s => s >= 40)) {
      ludo.winner = pIdx;
      sfx.win();
    }
    const extra = (ludo.dice === 6 && ludo.winner === null);
    ludo.rolled = false;
    if (!extra) ludo.turn = (ludo.turn + 1) % pCount;
    pushStateSync();
    checkBotForOtherGames();
  }

  function renderLudoGame() {
    const grid = document.getElementById('ludo-grid');
    if (!grid || !gameState.ludo) return;
    const ludo = gameState.ludo;
    const pCount = Math.min(4, gameState.players.length);
    const curP = gameState.players[ludo.turn % pCount];

    const turnTxt = document.getElementById('ludo-turn-text');
    if (turnTxt) {
      turnTxt.textContent = ludo.winner !== null
        ? `🏆 Wygrywa: ${gameState.players[ludo.winner]?.name || LUDO_NAMES[ludo.winner]}!`
        : `Kolej: ${curP?.name || LUDO_NAMES[ludo.turn]}`;
    }
    const dieEl = document.getElementById('ludo-die');
    if (dieEl) dieEl.dataset.val = ludo.dice;

    grid.innerHTML = '';
    const cells = Array(11).fill(null).map(() => Array(11).fill(null));
    for (let r = 0; r < 11; r++) {
      for (let c = 0; c < 11; c++) {
        const div = document.createElement('div');
        div.className = 'ludo-cell';
        if (r === 5 && c === 5) { div.style.background = '#ff9800'; div.textContent = '⚒️'; }
        cells[r][c] = div;
        grid.appendChild(div);
      }
    }
    LUDO_TRACK.forEach(([r, c]) => cells[r][c].classList.add('track-cell'));
    for (let p = 0; p < 4; p++) {
      const col = gameState.players[p]?.color || LUDO_COLORS[p];
      LUDO_BASES[p].forEach(([r, c]) => { cells[r][c].style.background = col + '24'; cells[r][c].style.border = `2px solid ${col}`; });
      LUDO_HOMES[p].forEach(([r, c]) => { cells[r][c].style.background = col + '38'; cells[r][c].style.border = `2px solid ${col}`; });
    }
    for (let p = 0; p < pCount; p++) {
      const plObj = gameState.players[p];
      const avSvg = getAvatarSvg(plObj?.avatar || 'helmet');
      for (let k = 0; k < 4; k++) {
        const step = ludo.pawns[p][k];
        const coords = (step === -1) ? LUDO_BASES[p][k] : (step < 40 ? LUDO_TRACK[(step + p * 10) % 40] : LUDO_HOMES[p][step - 40]);
        if (coords) {
          const pawnEl = document.createElement('div');
          const movable = ludo.rolled && ludo.turn === p && canControlTurn(p) && canMoveLudoPawn(p, k, ludo.dice);
          pawnEl.className = `ludo-pawn ${movable ? 'movable-pawn' : ''}`;
          pawnEl.style.background = plObj?.color || LUDO_COLORS[p];
          pawnEl.innerHTML = avSvg;
          if (movable) pawnEl.onclick = () => moveLudoPawn(p, k, false);
          cells[coords[0]][coords[1]].appendChild(pawnEl);
        }
      }
    }
  }

  /* WARCABY Z OBSŁUGĄ 2 DRUŻYN */
  let selectedChecker = null;
  function getCheckerMoves(board, r, c) {
    const piece = board[r][c];
    if (!piece) return [];
    const dirs = piece.king ? [[-1,-1],[-1,1],[1,-1],[1,1]] : (piece.p === 0 ? [[-1,-1],[-1,1]] : [[1,-1],[1,1]]);
    const moves = [];
    dirs.forEach(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        if (!board[nr][nc]) moves.push({ r: nr, c: nc, jump: null });
        else if (board[nr][nc].p !== piece.p) {
          const jr = r + dr * 2, jc = c + dc * 2;
          if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8 && !board[jr][jc]) moves.push({ r: jr, c: jc, jump: [nr, nc] });
        }
      }
    });
    return moves;
  }

  function renderCheckersGame() {
    const grid = document.getElementById('checkers-grid');
    if (!grid || !gameState.checkers) return;
    const chk = gameState.checkers;
    const board = JSON.parse(chk.boardJson);
    const activeP = getTeamActivePlayer(chk.turn, chk);

    const teamsTag = document.getElementById('checkers-teams-tag');
    if (teamsTag) {
      teamsTag.textContent = gameState.players.length > 2
        ? `DRUŻYNA WĘGLA (${getTeamNamesSummary(0)}) VS DRUŻYNA STALI (${getTeamNamesSummary(1)})`
        : `WĘGIEL VS STAL`;
    }

    const turnEl = document.getElementById('checkers-turn-text');
    if (turnEl) {
      turnEl.textContent = chk.winner !== null
        ? `🏆 Zwycięstwo: ${getTeamActivePlayer(chk.winner, chk)?.name}!`
        : `Ruch: ${activeP?.name} (${chk.turn === 0 ? 'Pomarańczowe ▲' : 'Błękitne ▼'})`;
    }
    const scoreEl = document.getElementById('checkers-score-text');
    if (scoreEl) scoreEl.textContent = `Zbicia: ${chk.captured[0]} — ${chk.captured[1]}`;

    const canControl = canControl2PSide(chk.turn, chk) && chk.winner === null;
    const validTargets = (canControl && selectedChecker) ? getCheckerMoves(board, selectedChecker.r, selectedChecker.c) : [];
    grid.innerHTML = '';

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = document.createElement('div');
        const isDark = (r + c) % 2 === 1;
        const isSel = selectedChecker && selectedChecker.r === r && selectedChecker.c === c;
        const targetMove = validTargets.find(m => m.r === r && m.c === c);
        sq.className = `board-sq ${isDark ? 'sq-dark' : 'sq-light'} ${isSel ? 'sq-selected' : ''} ${targetMove ? 'sq-valid-move' : ''}`;
        const cell = board[r][c];
        if (cell) {
          const disc = document.createElement('div');
          disc.className = `checker-disc ${cell.p === 0 ? 'p1-disc' : 'p2-disc'}`;
          if (cell.king) disc.textContent = '👑';
          sq.appendChild(disc);
        }
        sq.onclick = () => {
          if (!canControl) return;
          if (targetMove) { executeCheckerMove(selectedChecker.r, selectedChecker.c, targetMove); selectedChecker = null; return; }
          if (cell && cell.p === chk.turn) { selectedChecker = { r, c }; renderCheckersGame(); }
        };
        grid.appendChild(sq);
      }
    }
  }

  function executeCheckerMove(fr, fc, move) {
    const chk = gameState.checkers;
    const board = JSON.parse(chk.boardJson);
    const piece = board[fr][fc];
    if (!piece) return;
    board[fr][fc] = null;
    board[move.r][move.c] = piece;
    if (move.jump) { board[move.jump[0]][move.jump[1]] = null; chk.captured[piece.p] += 1; sfx.rent(); }
    else sfx.step();
    if ((piece.p === 0 && move.r === 0) || (piece.p === 1 && move.r === 7)) piece.king = true;
    if (chk.captured[0] >= 12) { chk.winner = 0; sfx.win(); }
    if (chk.captured[1] >= 12) { chk.winner = 1; sfx.win(); }
    chk.boardJson = JSON.stringify(board);
    if (chk.winner === null) advance2PGameTurn(chk);
    pushStateSync();
    checkBotForOtherGames();
  }

  /* NAPRAWIONE SZACHY Z OBSŁUGĄ 2 DRUŻYN */
  const CHESS_GLYPHS = {
    0: { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' },
    1: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' }
  };
  let selectedChessSq = null;

  function getValidChessMoves(board, r, c) {
    const piece = board[r][c];
    if (!piece) return [];
    const moves = [];
    const p = piece.p;
    const addIfValid = (nr, nc) => {
      if (nr < 0 || nr > 7 || nc < 0 || nc > 7) return false;
      if (!board[nr][nc]) { moves.push({ r: nr, c: nc }); return true; }
      if (board[nr][nc].p !== p) { moves.push({ r: nr, c: nc }); return false; }
      return false;
    };
    if (piece.type === 'P') {
      const dir = p === 0 ? -1 : 1, startRow = p === 0 ? 6 : 1;
      if (r + dir >= 0 && r + dir < 8 && !board[r + dir][c]) {
        moves.push({ r: r + dir, c });
        if (r === startRow && !board[r + dir * 2][c]) moves.push({ r: r + dir * 2, c });
      }
      [-1, 1].forEach(dc => {
        const nr = r + dir, nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] && board[nr][nc].p !== p) moves.push({ r: nr, c: nc });
      });
    }
    if (piece.type === 'N') [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr, dc]) => addIfValid(r + dr, c + dc));
    if (piece.type === 'K') [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr, dc]) => addIfValid(r + dr, c + dc));
    const slideDirs = [];
    if (piece.type === 'R' || piece.type === 'Q') slideDirs.push([-1,0],[1,0],[0,-1],[0,1]);
    if (piece.type === 'B' || piece.type === 'Q') slideDirs.push([-1,-1],[-1,1],[1,-1],[1,1]);
    slideDirs.forEach(([dr, dc]) => { for (let s = 1; s < 8; s++) if (!addIfValid(r + dr * s, c + dc * s)) break; });
    return moves;
  }

  function renderChessGame() {
    const grid = document.getElementById('chess-grid');
    if (!grid || !gameState.chess) return;
    const ch = gameState.chess;
    const board = JSON.parse(ch.boardJson);
    const activeP = getTeamActivePlayer(ch.turn, ch);

    const teamsTag = document.getElementById('chess-teams-tag');
    if (teamsTag) {
      teamsTag.textContent = gameState.players.length > 2
        ? `DRUŻYNA ZŁOTYCH (${getTeamNamesSummary(0)}) VS DRUŻYNA BŁĘKITNYCH (${getTeamNamesSummary(1)})`
        : `HUTA POKÓJ VS KWK HALEMBA`;
    }

    const turnEl = document.getElementById('chess-turn-text');
    if (turnEl) {
      turnEl.textContent = ch.winner !== null
        ? `🏆 Szach-Mat! Wygrywa: ${getTeamActivePlayer(ch.winner, ch)?.name}!`
        : `Ruch: ${activeP?.name} (${ch.turn === 0 ? 'Złote ♔' : 'Błękitne ♚'})`;
    }
    const statusEl = document.getElementById('chess-status-text');
    if (statusEl) statusEl.textContent = ch.lastMove || 'Kliknij swoją figurę, a następnie podświetlone pole';

    const canControl = canControl2PSide(ch.turn, ch) && ch.winner === null;
    const validMoves = (canControl && selectedChessSq) ? getValidChessMoves(board, selectedChessSq.r, selectedChessSq.c) : [];
    grid.innerHTML = '';

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = document.createElement('div');
        const isDark = (r + c) % 2 === 1;
        const isSel = selectedChessSq && selectedChessSq.r === r && selectedChessSq.c === c;
        const target = validMoves.find(m => m.r === r && m.c === c);
        sq.className = `board-sq ${isDark ? 'sq-dark' : 'sq-light'} ${isSel ? 'sq-selected' : ''} ${target ? 'sq-valid-move' : ''}`;
        const piece = board[r][c];
        if (piece) {
          const span = document.createElement('span');
          span.className = `chess-piece-glyph ${piece.p === 0 ? 'white-side' : 'black-side'}`;
          span.textContent = CHESS_GLYPHS[piece.p][piece.type];
          sq.appendChild(span);
        }
        sq.onclick = () => {
          if (!canControl) return;
          if (target) {
            executeChessMove(selectedChessSq.r, selectedChessSq.c, target.r, target.c);
            selectedChessSq = null;
            return;
          }
          if (piece && piece.p === ch.turn) {
            selectedChessSq = { r, c };
            renderChessGame();
          }
        };
        grid.appendChild(sq);
      }
    }
  }

  function executeChessMove(fr, fc, tr, tc) {
    const ch = gameState.chess;
    const board = JSON.parse(ch.boardJson);
    const moving = board[fr][fc];
    if (!moving) return;
    const target = board[tr][tc];
    const activeP = getTeamActivePlayer(ch.turn, ch);

    board[fr][fc] = null;
    board[tr][tc] = moving;
    if (moving.type === 'P' && (tr === 0 || tr === 7)) moving.type = 'Q';

    if (target && target.type === 'K') {
      ch.winner = moving.p;
      ch.lastMove = `👑 ${activeP?.name} zbija Króla i wygrywa partię!`;
      sfx.win();
    } else {
      ch.lastMove = `${activeP?.name}: ${CHESS_GLYPHS[moving.p][moving.type]} ➔ (${tr + 1}, ${tc + 1})`;
      if (target) sfx.rent(); else sfx.step();
    }

    ch.boardJson = JSON.stringify(board);
    if (ch.winner === null) advance2PGameTurn(ch);
    pushStateSync();
    checkBotForOtherGames();
  }

  /* 4 W RZĘDZIE Z OBSŁUGĄ 2 DRUŻYN */
  function dropConnect4Disc(col) {
    const c4 = gameState.connect4;
    if (!c4 || c4.winner !== null) return;
    const board = JSON.parse(c4.boardJson);
    let placedRow = -1;
    for (let r = 5; r >= 0; r--) {
      if (board[r][col] === null) { board[r][col] = c4.turn; placedRow = r; break; }
    }
    if (placedRow === -1) return;
    sfx.step();

    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    const won = dirs.some(([dr, dc]) => {
      let count = 1;
      for (let s = 1; s < 4; s++) { const nr = placedRow + dr * s, nc = col + dc * s; if (nr >= 0 && nr < 6 && nc >= 0 && nc < 7 && board[nr][nc] === c4.turn) count++; else break; }
      for (let s = 1; s < 4; s++) { const nr = placedRow - dr * s, nc = col - dc * s; if (nr >= 0 && nr < 6 && nc >= 0 && nc < 7 && board[nr][nc] === c4.turn) count++; else break; }
      return count >= 4;
    });

    c4.boardJson = JSON.stringify(board);
    if (won) {
      c4.winner = c4.turn;
      sfx.win();
    } else {
      advance2PGameTurn(c4);
    }
    pushStateSync();
    checkBotForOtherGames();
  }

  function renderConnect4Game() {
    const grid = document.getElementById('c4-grid');
    if (!grid || !gameState.connect4) return;
    const c4 = gameState.connect4;
    const board = JSON.parse(c4.boardJson);
    const activeP = getTeamActivePlayer(c4.turn, c4);

    const teamsTag = document.getElementById('c4-teams-tag');
    if (teamsTag) {
      teamsTag.textContent = gameState.players.length > 2
        ? `DRUŻYNA A (${getTeamNamesSummary(0)}) VS DRUŻYNA B (${getTeamNamesSummary(1)})`
        : `SZYB WYDOBYWCZY: 4 W LINII`;
    }

    const turnEl = document.getElementById('c4-turn-text');
    if (turnEl) {
      turnEl.textContent = c4.winner !== null
        ? `🏆 Wygrywa: ${getTeamActivePlayer(c4.winner, c4)?.name}!`
        : `Ruch: ${activeP?.name} (${c4.turn === 0 ? 'Pomarańczowe' : 'Błękitne'})`;
    }

    const canControl = canControl2PSide(c4.turn, c4) && c4.winner === null;
    grid.innerHTML = '';
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 7; c++) {
        const slot = document.createElement('div');
        slot.className = 'c4-slot';
        const val = board[r][c];
        if (val !== null) {
          const disc = document.createElement('div');
          disc.className = 'c4-disc';
          disc.style.background = val === 0 ? '#ff7849' : '#00e5ff';
          slot.appendChild(disc);
        }
        slot.onclick = () => {
          if (canControl) dropConnect4Disc(c);
        };
        grid.appendChild(slot);
      }
    }
  }

  /* ==================== CENTRALNY STEROWNIK BOTÓW WE WSZYSTKICH 8 GRACH ==================== */
  function checkBotForOtherGames() {
    if (!gameState) return;
    if (botActionTimeout) {
      clearTimeout(botActionTimeout);
      botActionTimeout = null;
    }

    const mode = gameState.activeGame;

    if (mode === 'MONOPOLY' && gameState.status === 'PLAYING') {
      const cur = currentTurnPlayer();
      if (cur && cur.isBot && gameState.turnPhase === 'ROLL' && !isRollingLock) {
        botActionTimeout = setTimeout(handleRollDice, 650);
      }
    }

    if (mode === 'LIARS' && !gameState.liars.winnerName) {
      const liars = gameState.liars;
      const cur = gameState.players[liars.turnIndex % gameState.players.length];
      if (cur && cur.isBot) {
        botActionTimeout = setTimeout(() => {
          const hands = JSON.parse(liars.handsJson);
          const botHand = hands[cur.id] || [];
          if (liars.lastPlay && Math.random() < 0.38) {
            callLiarOnLastPlay();
            return;
          }
          if (botHand.length > 0) {
            const rank = liars.requiredRank || ['A','K','Q','J','10'][Math.floor(Math.random() * 5)];
            liars.requiredRank = rank;
            const matching = botHand.filter(c => c.rank === rank);
            const played = matching.length > 0 ? [matching[0]] : [botHand[0]];
            hands[cur.id] = botHand.filter(c => c.id !== played[0].id);
            liars.pile.push(...played);
            liars.lastPlay = { playerId: cur.id, playerName: cur.name, count: played.length, claimedRank: rank, actualCards: played };
            if (hands[cur.id].length === 0) liars.winnerName = cur.name;
            liars.handsJson = JSON.stringify(hands);
            liars.turnIndex = (liars.turnIndex + 1) % gameState.players.length;
            pushStateSync();
            checkBotForOtherGames();
          }
        }, 700);
      }
    }

    if (mode === 'QUORIDOR' && gameState.quoridor.winner === null) {
      const q = gameState.quoridor;
      const activeP = getTeamActivePlayer(q.turn, q);
      if (activeP && activeP.isBot) {
        botActionTimeout = setTimeout(() => {
          const side = q.turn;
          const opp = 1 - side;
          // 30% szans na postawienie ściany przed rywalem, jeśli bot ma ściany
          if (q.wallsLeft[side] > 0 && Math.random() < 0.3) {
            const oppPos = q.pos[opp];
            const wallR = opp === 0 ? Math.max(0, oppPos.r - 1) : Math.min(7, oppPos.r);
            const wallC = Math.min(7, oppPos.c);
            if (canPlaceQuoridorWall('H', wallR, wallC, q)) {
              executeQuoridorWall('H', wallR, wallC);
              return;
            }
          }
          const targetRow = side === 0 ? 0 : 8;
          const shortest = getShortestQuoridorPath(q.pos[side], targetRow, q.hWalls, q.vWalls);
          const validSteps = getValidQuoridorPawnMoves(q, side);
          if (shortest && shortest.length > 0) {
            const nextStep = shortest[0];
            const match = validSteps.find(m => m.r === nextStep.r && m.c === nextStep.c) || validSteps[0];
            if (match) executeQuoridorMove(match.r, match.c);
          } else if (validSteps.length > 0) {
            executeQuoridorMove(validSteps[0].r, validSteps[0].c);
          }
        }, 600);
      }
    }

    if (mode === 'LUDO') {
      const pCount = Math.min(4, gameState.players.length);
      const cur = gameState.players[gameState.ludo.turn % pCount];
      if (cur && cur.isBot && gameState.ludo.winner === null && !gameState.ludo.rolled) {
        botActionTimeout = setTimeout(rollLudoDice, 600);
      }
    }

    if (mode === 'CHECKERS' && gameState.checkers.winner === null) {
      const chk = gameState.checkers;
      const cur = getTeamActivePlayer(chk.turn, chk);
      if (cur && cur.isBot) {
        botActionTimeout = setTimeout(() => {
          const board = JSON.parse(chk.boardJson);
          const all = [];
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              if (board[r][c]?.p === chk.turn) getCheckerMoves(board, r, c).forEach(m => all.push({ fr: r, fc: c, m }));
            }
          }
          if (all.length) {
            const pick = all.find(x => x.m.jump) || all[Math.floor(Math.random() * all.length)];
            executeCheckerMove(pick.fr, pick.fc, pick.m);
          } else {
            chk.winner = 1 - chk.turn;
            pushStateSync();
          }
        }, 600);
      }
    }

    if (mode === 'CHESS' && gameState.chess.winner === null) {
      const ch = gameState.chess;
      const cur = getTeamActivePlayer(ch.turn, ch);
      if (cur && cur.isBot) {
        botActionTimeout = setTimeout(() => {
          const board = JSON.parse(ch.boardJson);
          const all = [];
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              if (board[r][c]?.p === ch.turn) getValidChessMoves(board, r, c).forEach(m => all.push({ fr: r, fc: c, tr: m.r, tc: m.c }));
            }
          }
          if (all.length) {
            const kingMove = all.find(x => board[x.tr][x.tc]?.type === 'K');
            const captureMove = all.find(x => board[x.tr][x.tc] !== null);
            const pick = kingMove || captureMove || all[Math.floor(Math.random() * all.length)];
            executeChessMove(pick.fr, pick.fc, pick.tr, pick.tc);
          }
        }, 600);
      }
    }

    if (mode === 'CONNECT4' && gameState.connect4.winner === null) {
      const c4 = gameState.connect4;
      const cur = getTeamActivePlayer(c4.turn, c4);
      if (cur && cur.isBot) {
        botActionTimeout = setTimeout(() => {
          const board = JSON.parse(c4.boardJson);
          const cols = [0,1,2,3,4,5,6].filter(c => board[0][c] === null);
          if (cols.length) dropConnect4Disc(cols[Math.floor(Math.random() * cols.length)]);
        }, 550);
      }
    }
  }

  /* ==================== 12. RENDEROWANIE INTERFEJSU I ZABEZPIECZONYCH WYMIAN ==================== */
  function renderAll() {
    if (!gameState) return;
    syncMyOnlineIdentity();
    if (gameState.mapId) applyMapTheme(gameState.mapId);

    if (gameState.status === 'FINISHED' && gameState.winnerAnnouncement && lastWinnerShown !== gameState.winnerAnnouncement.winnerName) {
      lastWinnerShown = gameState.winnerAnnouncement.winnerName;
      showGenericModal(
        `👑 ZWYCIĘZCA GRY: ${gameState.winnerAnnouncement.winnerName}!`,
        `<div style="text-align:center;padding:18px;">
          <div style="font-size:3.5rem;margin-bottom:8px;">🏆</div>
          <h2 style="color:#ffca28;margin-bottom:10px;">${gameState.winnerAnnouncement.winnerName} wygrywa Ruda Śląska Monopoly!</h2>
          <p style="font-size:0.95rem;line-height:1.5;margin-bottom:14px;">${gameState.winnerAnnouncement.reason}</p>
          <div style="font-weight:900;color:#2ecc71;font-size:1.1rem;">Końcowy stan konta: $${gameState.winnerAnnouncement.cash}</div>
        </div>`
      );
    }

    const activeMode = gameState.activeGame || 'MONOPOLY';
    ['MONOPOLY', 'LIARS', 'CASINO', 'QUORIDOR', 'LUDO', 'CHECKERS', 'CHESS', 'CONNECT4'].forEach(g => {
      const st = document.getElementById('stage-' + g);
      if (st) st.classList.toggle('hidden', g !== activeMode);
    });
    document.querySelectorAll('.game-nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.switchGame === activeMode));

    renderMonopolyBoard();
    renderCenterHUD();
    renderLiarsGame();
    renderCasinoGame();
    renderQuoridorGame();
    renderLudoGame();
    renderCheckersGame();
    renderChessGame();
    renderConnect4Game();
    renderPlayersRoster();
    renderMyProperties();
    renderTradesList();
    renderChat();
    renderInspector(selectedTileIndex);
  }

  function renderMonopolyBoard() {
    const sub20 = document.getElementById('corner-sub-20');
    if (sub20) sub20.textContent = `$${gameState.vacationPool} w puli`;

    BOARD_TILES.forEach(tile => {
      const prop = gameState.properties[tile.index];
      const capEl = document.getElementById('cap-' + tile.index);
      const bannerEl = document.getElementById('houses-banner-' + tile.index);
      const cellEl = document.querySelector(`.board-tile[data-index="${tile.index}"]`);

      if (capEl && prop) {
        if (prop.ownerId) {
          const owner = getPlayerById(prop.ownerId);
          capEl.classList.remove('hidden');
          capEl.style.background = owner ? owner.color : '#888';
          capEl.textContent = prop.mortgaged ? '🔒' : (prop.level === 5 ? '🏨 HOTEL' : (prop.level > 0 ? `🏠×${prop.level}` : '✓'));
          if (cellEl && owner) cellEl.style.borderColor = owner.color;
        } else {
          capEl.classList.add('hidden');
          if (cellEl) cellEl.style.borderColor = '';
        }
      }

      if (bannerEl && prop) {
        if (prop.level === 5) {
          bannerEl.className = 'tile-houses-banner hotel-banner';
          bannerEl.textContent = '🏨 HOTEL';
        } else if (prop.level > 0) {
          bannerEl.className = 'tile-houses-banner';
          bannerEl.textContent = '🏠'.repeat(prop.level);
        } else {
          bannerEl.className = 'tile-houses-banner hidden';
        }
      }

      if (cellEl && prop) cellEl.classList.toggle('mortgaged-tile', !!prop.mortgaged);

      const tokenBox = document.getElementById('tokens-' + tile.index);
      if (tokenBox) {
        tokenBox.innerHTML = '';
        gameState.players.filter(p => !p.bankrupt && p.position === tile.index).forEach(p => {
          const tok = document.createElement('div');
          tok.className = 'custom-pawn-token';
          tok.style.background = p.color;
          tok.title = p.name;
          tok.innerHTML = getAvatarSvg(p.avatar);
          tokenBox.appendChild(tok);
        });
      }
    });
    renderBoardHighlights();
  }

  function renderBoardHighlights() {
    document.querySelectorAll('.board-tile').forEach(el => el.classList.toggle('selected-tile', Number(el.dataset.index) === selectedTileIndex));
  }

  function renderCenterHUD() {
    const active = currentTurnPlayer();
    if (!active) return;
    const roundEl = document.getElementById('hud-round');
    if (roundEl) roundEl.textContent = `Okrążenie #${gameState.round}`;
    const d1El = document.getElementById('die-box-1');
    const d2El = document.getElementById('die-box-2');
    if (d1El) d1El.dataset.val = gameState.lastDice[0];
    if (d2El) d2El.dataset.val = gameState.lastDice[1];

    const canBuildHere = canUpgradeProperty(active.position, active.id);
    const buyoutHere = canBuyoutProperty(active.position, active.id);
    const quotaEl = document.getElementById('hud-build-quota');
    if (quotaEl) {
      const airCount = AIRPORT_INDICES.filter(idx => gameState.properties[idx]?.ownerId === active.id).length;
      quotaEl.textContent = canBuildHere.ok
        ? '🏠 Stoisz na swoim polu — możesz zbudować dom!'
        : `✈️ Lotniska gracza ${active.name}: ${airCount}/4`;
      quotaEl.className = canBuildHere.ok ? 'hub-pill quota-ready' : 'hub-pill quota-used';
    }

    document.getElementById('debt-warning-banner')?.classList.toggle('hidden', !(active.cash < 0));
    const avatarDot = document.getElementById('playing-now-avatar');
    if (avatarDot) {
      avatarDot.style.background = active.color;
      avatarDot.innerHTML = getAvatarSvg(active.avatar);
      document.getElementById('playing-now-label').textContent = `Kolej gracza: ${active.name}`;
    }

    const isMyTurn = canControlTurn();
    document.getElementById('wait-turn-notice')?.classList.toggle('hidden', isMyTurn);
    document.getElementById('action-buttons-wrap')?.classList.toggle('hidden', !isMyTurn);

    const tile = BOARD_TILES[active.position];
    document.getElementById('btn-roll')?.classList.toggle('hidden', gameState.turnPhase !== 'ROLL');
    document.getElementById('btn-buy')?.classList.toggle('hidden', gameState.turnPhase !== 'DECIDE');
    document.getElementById('btn-auction')?.classList.toggle('hidden', gameState.turnPhase !== 'DECIDE');
    document.getElementById('btn-end-turn')?.classList.toggle('hidden', gameState.turnPhase === 'ROLL');

    if (gameState.turnPhase === 'DECIDE' && tile) {
      const btnBuy = document.getElementById('btn-buy');
      if (btnBuy) {
        btnBuy.textContent = `💰 Kup ${tile.shortName} ($${tile.price})`;
        btnBuy.disabled = active.cash < tile.price;
      }
    }

    const btnBuildQuick = document.getElementById('btn-build-quick');
    if (btnBuildQuick) {
      btnBuildQuick.classList.toggle('hidden', !canBuildHere.ok);
      if (canBuildHere.ok && tile) btnBuildQuick.textContent = `🏠 Zbuduj Dom na ${tile.shortName} ($${tile.buildCost})`;
    }

    const btnBuyout = document.getElementById('btn-buyout-field');
    if (btnBuyout) {
      btnBuyout.classList.toggle('hidden', !buyoutHere.ok);
      if (buyoutHere.ok && tile) btnBuyout.textContent = `💼 Wykup ${tile.shortName} ($${buyoutHere.cost})`;
    }

    const hasAnythingToSell = BOARD_TILES.some(t => gameState.properties[t.index]?.ownerId === active.id);
    document.getElementById('btn-sell-emergency')?.classList.toggle('hidden', !(active.cash < 150 && hasAnythingToSell));
    document.getElementById('btn-jail-pay')?.classList.toggle('hidden', !(active.inJail && gameState.turnPhase === 'ROLL' && active.cash >= 100));
    document.getElementById('btn-jail-card')?.classList.toggle('hidden', !(active.inJail && gameState.turnPhase === 'ROLL' && active.pardonCards > 0));
    const feedEl = document.getElementById('center-feed-log');
    if (feedEl) feedEl.innerHTML = gameState.feed.map(item => `<div class="feed-line">${item.text}</div>`).join('');
  }

  function renderPlayersRoster() {
    const viewer = getMyViewerPlayer();
    const idBadge = document.getElementById('my-identity-badge');
    if (idBadge && viewer) {
      idBadge.textContent = `Ty: ${viewer.name}`;
      idBadge.style.borderColor = viewer.color;
    }

    const rosterEl = document.getElementById('players-roster');
    if (rosterEl) {
      rosterEl.innerHTML = gameState.players.map((p, idx) => {
        const airCnt = AIRPORT_INDICES.filter(i => gameState.properties[i]?.ownerId === p.id).length;
        const teamLabel = gameState.players.length > 2 ? ((idx % 2 === 0) ? ' • Druż. A' : ' • Druż. B') : '';
        return `
          <div class="roster-player-row ${idx === gameState.turnIndex ? 'is-active' : ''} ${p.bankrupt ? 'is-bankrupt' : ''}" style="border-left-color:${p.color}">
            <div class="roster-left">
              <div class="roster-avatar" style="background:${p.color}">${getAvatarSvg(p.avatar)}</div>
              <div>
                <div class="roster-name-title">${p.name} ${p.id === viewer?.id ? '(Ty)' : ''} ${p.isBot ? '🤖' : ''}</div>
                <div class="roster-meta-sub">${BOARD_TILES[p.position].shortName}${teamLabel} ${airCnt > 0 ? `• ✈️×${airCnt}` : ''}</div>
              </div>
            </div>
            <div class="roster-money ${p.cash < 0 ? 'negative' : ''}">$${p.cash}</div>
          </div>
        `;
      }).join('');
    }
  }

  function renderMyProperties() {
    const viewer = getMyViewerPlayer();
    const listEl = document.getElementById('my-properties-scroll');
    if (!viewer || !listEl) return;

    const ownedTiles = BOARD_TILES.filter(t => gameState.properties[t.index]?.ownerId === viewer.id);
    const headTxt = document.getElementById('my-props-header-text');
    if (headTxt) headTxt.textContent = `🏘️ Pola gracza ${viewer.name} (${ownedTiles.length})`;
    let totalWorth = viewer.cash;
    ownedTiles.forEach(t => { totalWorth += t.price + (gameState.properties[t.index].level * (t.buildCost || 0)); });
    const worthBadge = document.getElementById('my-networth-badge');
    if (worthBadge) worthBadge.textContent = `Majątek: $${totalWorth}`;

    if (!ownedTiles.length) {
      listEl.innerHTML = `<div style="font-size:0.76rem;color:var(--text-muted);">Brak kupionych pól.</div>`;
      return;
    }

    listEl.innerHTML = ownedTiles.map(t => {
      const pr = gameState.properties[t.index];
      const grp = GROUPS[t.group];
      const upCheck = canUpgradeProperty(t.index, viewer.id);
      const lvlBadge = pr.mortgaged ? '🔒 Hipoteka' : (t.type === 'PROPERTY' ? (pr.level === 5 ? '🏨 HOTEL' : `🏠 Poz. ${pr.level}/5`) : '✈️ Lotnisko');
      const buildBtnHtml = (t.type === 'PROPERTY' && upCheck.ok) ? `<button type="button" class="btn-quick-up" data-build-idx="${t.index}">+🏠 $${t.buildCost}</button>` : '';
      const sellBtnHtml = (t.type === 'PROPERTY' && pr.level > 0)
        ? `<button type="button" class="btn-quick-sell" data-sell-house-idx="${t.index}">-🏠 +$${Math.floor(t.buildCost * 0.5)}</button>`
        : `<button type="button" class="btn-quick-sell" data-sell-land-idx="${t.index}">💵 Sprzedaj (+$${Math.floor(t.price * 0.75)})</button>`;

      return `
        <div class="owned-prop-item" data-open-idx="${t.index}">
          <div class="owned-prop-left"><span class="owned-dot" style="background:${grp ? grp.color : '#888'}"></span><span class="owned-name">${t.shortName}</span></div>
          <div class="owned-prop-right"><span class="lvl-tag">${lvlBadge}</span>${buildBtnHtml}${sellBtnHtml}</div>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('[data-open-idx]').forEach(row => {
      row.onclick = (e) => { if (!e.target.closest('button')) openPropertyModal(Number(row.dataset.openIdx)); };
    });
    listEl.querySelectorAll('[data-build-idx]').forEach(btn => {
      btn.onclick = (e) => { e.stopPropagation(); buildHouseOnProperty(Number(btn.dataset.buildIdx), viewer.id); };
    });
    listEl.querySelectorAll('[data-sell-house-idx]').forEach(btn => {
      btn.onclick = (e) => { e.stopPropagation(); sellHouseOnProperty(Number(btn.dataset.sellHouseIdx), viewer.id); };
    });
    listEl.querySelectorAll('[data-sell-land-idx]').forEach(btn => {
      btn.onclick = (e) => { e.stopPropagation(); sellLandToBank(Number(btn.dataset.sellLandIdx), viewer.id); };
    });
  }

  function renderInspector(tileIndex) {
    const tile = BOARD_TILES[tileIndex];
    if (!tile) return;
    const prop = gameState.properties[tileIndex];
    const grp = tile.group ? GROUPS[tile.group] : null;
    const tagEl = document.getElementById('spotlight-tag');
    const titleEl = document.getElementById('spotlight-title');
    const content = document.getElementById('spotlight-content');
    if (tagEl) tagEl.textContent = tile.district || grp?.name || 'RUDA ŚLĄSKA';
    if (titleEl) titleEl.textContent = tile.name;
    if (!content) return;
    if (!prop) { content.innerHTML = `<div style="font-size:0.78rem;color:#b5abd6;">${tile.subtitle || 'Pole specjalne.'}</div>`; return; }
    const owner = prop.ownerId ? getPlayerById(prop.ownerId) : null;
    const bCost = getBuyoutCost(tileIndex);
    content.innerHTML = `
      <div class="spot-grid">
        <div class="spot-stat"><span>Cena</span><strong>$${tile.price}</strong></div>
        <div class="spot-stat"><span>Właściciel</span><strong>${owner ? owner.name : 'Wolne'}</strong></div>
        <div class="spot-stat"><span>Poziom</span><strong>${tile.type === 'AIRPORT' ? '✈️' : prop.level+'/5'}</strong></div>
        <div class="spot-stat"><span>Wykup</span><strong>${bCost ? '$'+bCost : 'Chronione'}</strong></div>
      </div>
    `;
  }

  function openPropertyModal(tileIndex) {
    selectedTileIndex = tileIndex;
    const tile = BOARD_TILES[tileIndex];
    const prop = gameState.properties[tileIndex];
    if (!tile || !prop) return;

    const modal = document.getElementById('prop-modal');
    if (!modal) return;
    const viewer = getMyViewerPlayer();
    const owner = prop.ownerId ? getPlayerById(prop.ownerId) : null;
    const grp = tile.group ? GROUPS[tile.group] : null;

    document.getElementById('prop-modal-banner').style.background = grp ? `linear-gradient(135deg, ${grp.color}, #1c162e)` : '#2a2244';
    document.getElementById('prop-modal-group').textContent = grp ? grp.name : tile.district;
    document.getElementById('prop-modal-name').textContent = tile.name;
    document.getElementById('pm-price').textContent = `$${tile.price}`;
    document.getElementById('pm-owner').textContent = owner ? owner.name : 'Brak (Wolne)';
    document.getElementById('pm-level').textContent = tile.type === 'AIRPORT' ? 'Lotnisko (4 = Wygrana)' : `${prop.level} / 5`;
    document.getElementById('pm-rent').textContent = `$${calculateRent(tileIndex)}`;

    const bCost = getBuyoutCost(tileIndex);
    const buyoutEl = document.getElementById('pm-buyout-cost');
    if (buyoutEl) buyoutEl.textContent = bCost ? `$${bCost}` : 'Chronione (Lotnisko)';

    const tbody = document.getElementById('pm-rent-tbody');
    if (tile.type === 'PROPERTY') {
      const labels = ['Poziom 0 (Działka)','Poziom 1 (1 Dom)','Poziom 2 (2 Domy)','Poziom 3 (3 Domy)','Poziom 4 (4 Domy)','Poziom 5 (Hotel — Chroniony)'];
      tbody.innerHTML = tile.rents.map((r, lvl) => `<tr class="${prop.level === lvl ? 'current-lvl-row' : ''}"><td>${labels[lvl]}</td><td>${lvl === 5 ? '🏨' : (lvl > 0 ? '🏠×'+lvl : '—')}</td><td><strong>$${r}</strong></td></tr>`).join('');
    } else if (tile.type === 'AIRPORT') {
      tbody.innerHTML = `
        <tr><td>1 Lotnisko</td><td>✈️</td><td><strong>$50</strong></td></tr>
        <tr><td>2 Lotniska</td><td>✈️✈️</td><td><strong>$110</strong></td></tr>
        <tr><td>3 Lotniska</td><td>✈️✈️✈️</td><td><strong>$220</strong></td></tr>
        <tr class="current-lvl-row"><td>4 Lotniska</td><td>🏆</td><td><strong>NATYCHMIASTOWA WYGRANA GRY!</strong></td></tr>
      `;
    } else {
      tbody.innerHTML = `<tr><td>Czynsz przemysłowy</td><td>⚡</td><td><strong>$${calculateRent(tileIndex)}</strong></td></tr>`;
    }

    const btnBuild = document.getElementById('btn-pm-build');
    const btnBuyout = document.getElementById('btn-pm-buyout');
    const btnSell = document.getElementById('btn-pm-sell');
    const btnSellLand = document.getElementById('btn-pm-sell-land');
    const btnMort = document.getElementById('btn-pm-mortgage');

    const upCheck = canUpgradeProperty(tileIndex, viewer.id);
    const buyoutCheck = canBuyoutProperty(tileIndex, viewer.id);

    document.getElementById('pm-build-cost').textContent = tile.buildCost ? `$${tile.buildCost}` : '—';
    document.getElementById('pm-status-note').textContent = prop.ownerId === viewer.id ? upCheck.reason : buyoutCheck.reason;

    if (btnBuild) {
      btnBuild.classList.toggle('hidden', tile.type !== 'PROPERTY');
      btnBuild.disabled = !upCheck.ok;
      btnBuild.onclick = () => { if (buildHouseOnProperty(tileIndex, viewer.id)) openPropertyModal(tileIndex); };
    }
    if (btnSell) {
      btnSell.classList.toggle('hidden', tile.type !== 'PROPERTY');
      btnSell.disabled = !(prop.ownerId === viewer.id && prop.level > 0);
      btnSell.onclick = () => { if (sellHouseOnProperty(tileIndex, viewer.id)) openPropertyModal(tileIndex); };
    }
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

  /* ZABEZPIECZONA DAROWIZNA (WYSYŁASZ TYLKO WŁASNE ŚRODKI) */
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

  /* ZABEZPIECZONA WYMIANA HANDLOWA (TYLKO ADRESAT MOŻE ZAAKCEPTOWAĆ!) */
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

      // Czy ten ekran ma prawo kliknąć "Akceptuj"? Tylko jeśli to oferta skierowana DO MNIE!
      const canAccept = gameState.isOnline
        ? (viewer && viewer.id === tr.toId)
        : (currentTurnPlayer()?.id === tr.toId);

      return `
        <div class="trade-offer-card">
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
        return `<button type="button" class="color-dot-pick ${c.hex === onlinePickedColor ? 'active' : ''} ${isTaken ? 'color-locked' : ''}" style="background:${c.hex}" data-hex="${c.hex}" ${isTaken ? 'disabled title="Zajęty przez innego gracza"' : ''}></button>`;
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

  /* ==================== KOMPLETNA KSIĘGA ZASAD WSZYSTKICH 8 GIER ==================== */
  function openRulesModal(initialTab = null) {
    const activeTab = initialTab || (gameState ? gameState.activeGame : 'MONOPOLY');
    const rulesData = {
      MONOPOLY: {
        title: '🏭 Monopoly Ruda Śląska',
        body: `
          <p><strong>✈️ 1. 4 Lotniska = Natychmiastowa Wygrana:</strong> Na planszy znajdują się 4 Lotniska Strategiczne. Zgromadzenie wszystkich 4 kończy grę natychmiastowym zwycięstwem! Lotnisk nie da się od nikogo odkupić siłą — można je przejąć tylko na wymianie lub gdy zadłużony gracz musi je sprzedać.</p>
          <p><strong>💼 2. Przymusowy wykup cudzych pól:</strong> Gdy staniesz na zwykłej dzielnicy innego gracza (poniżej poziomu Hotelu), płacisz czynsz, a następnie możesz odkupić to pole za dwukrotność wartości.</p>
          <p><strong>🏠 3. Budowa domów:</strong> Po zakupie działki musisz przejechać pełne okrążenie planszy i stanąć na niej ponownie, aby wybudować dom (maks. 1 dom na turę, poziom 5 to chroniony Hotel).</p>
        `
      },
      LIARS: {
        title: '🃏 Szynk Kłamców (Blef Karciany)',
        body: `
          <p><strong>🎯 Cel gry:</strong> Pozbądź się wszystkich swoich kart z ręki jako pierwszy (+$500 nagrody do portfela).</p>
          <p><strong>🂠 Rozgrywka:</strong> Pierwszy gracz wybiera figurę (Asy, Króle, Damy, Walety lub 10) i wykłada od 1 do 4 zakrytych kart. Kolejni gracze muszą dokładać karty (twierdząc, że to ta sama figura) albo krzyknąć <strong>„SPRAWDZAM!”</strong>.</p>
          <p><strong>🚨 Sprawdzanie:</strong> Jeśli poprzednik kłamał — zabiera całą pulę ze stołu do ręki. Jeśli mówił prawdę — pulę za karę zabiera sprawdzający!</p>
        `
      },
      CASINO: {
        title: '🌸 Kwiaciarnia Godula (Ruletka 0–36 & Automat 777)',
        body: `
          <p><strong>🏆 Cel zwycięstwa:</strong> Pomnóż swój portfel i jako pierwszy osiągnij cel majątkowy ($5 000, $10 000 lub $25 000).</p>
          <p><strong>🎡 Stół Ruletki (0–36):</strong> Wybierz nominał żetonu ($10–$500) i klikaj na konkretne liczby (wypłata <strong>x36</strong>), tuziny (<strong>x3</strong>) lub kolory/parzystość (<strong>x2</strong>), a następnie zakręć kołem!</p>
          <p><strong>🎰 Automat 777:</strong> Trzy siódemki lub diamenty płacą <strong>x15</strong>, trzy róże <strong>x8</strong>, a dowolna para zwraca <strong>x2</strong>.</p>
        `
      },
      QUORIDOR: {
        title: '🧱 Sztolnia Labirynt (Quoridor 9×9)',
        body: `
          <p><strong>🎯 Cel gry:</strong> Przeprowadź swojego górnika na przeciwległy koniec planszy 9×9 jako pierwszy!</p>
          <p><strong>🧱 Stawianie ścian:</strong> W swojej turze możesz przesunąć pionek o 1 pole (w górę, dół, lewo, prawo) ALBO postawić jedną ze swoich 10 ścian (poziomą lub pionową o długości 2 pól), aby wydłużyć drogę przeciwnikowi.</p>
          <p><strong>⚠️ Zakaz całkowitego zamurowania:</strong> Nie wolno postawić ściany, która zamknęłaby przeciwnikowi ostatnią możliwą ścieżkę do mety (system sprawdza to automatycznie).</p>
        `
      },
      LUDO: {
        title: '🎲 Chińczyk (Wyścig 4 Dzielnic)',
        body: `
          <p><strong>🎯 Cel gry:</strong> Wprowadź wszystkie 4 swoje pionki z bazy przez całą pętlę do kolorowego domku na środku.</p>
          <p><strong>🎲 Zasady:</strong> Wyjście z bazy wymaga wyrzucenia <strong>6</strong> (daje też dodatkowy rzut). Stanięcie na polu zajętym przez rywala zbija jego pionek z powrotem do bazy.</p>
        `
      },
      CHECKERS: {
        title: '⚫ Warcaby (Węgiel vs Stal + Drużyny)',
        body: `
          <p><strong>🎯 Zasady:</strong> Poruszaj się po ciemnych polach na ukos. Przeskakuj nad pionkami rywala, aby je zbić. Dojście do ostatniego rzędu promuje pionek w <strong>Damkę (👑)</strong>.</p>
          <p><strong>👥 System 2 Drużyn:</strong> Gdy w pokoju jest więcej niż 2 graczy, gra automatycznie dzieli wszystkich na 2 drużyny, które wykonują ruchy na zmianę!</p>
        `
      },
      CHESS: {
        title: '♟️ Szachy (Huta Pokój vs KWK Halemba + Drużyny)',
        body: `
          <p><strong>🎯 Zasady:</strong> Kliknij swoją figurę, aby podświetlić na zielono wszystkie dozwolone ruchy. Dojście pionkiem do końca szachownicy automatycznie promuje go w Hetmana (♕). Zbicie Króla rywala kończy partię.</p>
          <p><strong>👥 System 2 Drużyn:</strong> Przy >2 osobach przy stole gracze dzieleni są na Drużynę Złotych i Drużynę Błękitnych.</p>
        `
      },
      CONNECT4: {
        title: '🪙 Sztolnia 4 w Rzędzie',
        body: `
          <p><strong>🎯 Zasady:</strong> Wrzucaj krążki do wybranych kolumn. Wygrywa gracz lub drużyna, która jako pierwsza ułoży <strong>4 krążki własnego koloru</strong> w linii poziomej, pionowej lub ukośnej.</p>
        `
      }
    };

    const tabsHtml = Object.keys(rulesData).map(k => `
      <button type="button" class="btn-ghost rules-tab-btn ${k === activeTab ? 'active' : ''}" data-rtab="${k}">${rulesData[k].title.split(' ')[0]} ${k}</button>
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

  /* ==================== 13. INICJALIZACJA ZDARZEŃ ==================== */
  function initEvents() {
    // Ukryty wyzwalacz Trybu Sztygara: 5 szybkich kliknięć w logo ⚒️ lub wpisanie "sztygar"
    const secretLogo = document.getElementById('brand-secret-trigger');
    if (secretLogo) {
      secretLogo.onclick = () => {
        emblemTapCount += 1;
        if (emblemTapTimer) clearTimeout(emblemTapTimer);
        if (emblemTapCount >= 5) {
          emblemTapCount = 0;
          toggleSecretLuckMode();
        } else {
          emblemTapTimer = setTimeout(() => { emblemTapCount = 0; }, 1400);
        }
      };
    }

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

    // Nawigacja mobilna
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

    // Przyciski trybu Sztolnia Labirynt (Quoridor)
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

    // Kwiaciarnia Godula (Żetony, Stół 0-36, Cel)
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

    // Zabezpieczona Wymiana Handlowa (wysyłasz ze swojego konta, a jeśli partnerem jest Bot, bot ocenia uczciwość oferty)
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

      // Jeśli wysyłasz ofertę do Bota AI — Bot ocenia wartość (nie pozwoli się okraść za darmo!)
      if (target.isBot) {
        const giveVal = giveCash + giveProps.reduce((a, i) => a + BOARD_TILES[i].price, 0);
        const takeVal = takeCash + takeProps.reduce((a, i) => a + BOARD_TILES[i].price, 0);
        const minRatio = hasSecretLuck(sender) ? 0.7 : 1.05;
        if (giveVal >= takeVal * minRatio && takeVal > 0) {
          sender.cash = sender.cash - giveCash + takeCash;
          target.cash = target.cash - takeCash + giveCash;
          giveProps.forEach(idx => { gameState.properties[idx].ownerId = target.id; });
          takeProps.forEach(idx => { gameState.properties[idx].ownerId = sender.id; });
          addFeedEvent(`🤖 <strong>${target.name}</strong> przeanalizował i zaakceptował uczciwą wymianę z <strong>${sender.name}</strong>!`);
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
