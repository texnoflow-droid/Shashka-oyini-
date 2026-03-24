(() => {
    const FLAGS = [
        ['russian', '🇷🇺 Rus', 8, true, true, true, true],
        ['english', '🇺🇸 English', 8, true, false, false, false],
        ['international', '🇫🇷 International 10×10', 10, true, true, true, true],
        ['brazilian', '🇧🇷 Brazilian', 8, true, true, true, true],
        ['canadian', '🇨🇦 Canadian 12×12', 12, true, true, true, true],
        ['spanish', '🇪🇸 Spanish', 8, true, false, true, true],
        ['italian', '🇮🇹 Italian', 8, true, true, false, true],
        ['polish', '🇵🇱 Polish (Int.)', 10, true, true, true, true],
        ['dutch', '🇳🇱 Dutch (Int.)', 10, true, true, true, true],
        ['german', '🇩🇪 German', 8, true, true, false, true],
        ['czech', '🇨🇿 Czech', 8, true, true, false, true],
        ['estonian', '🇪🇪 Estonian', 8, true, true, true, true],
        ['latvian', '🇱🇻 Latvian', 8, true, true, true, true],
        ['lithuanian', '🇱🇹 Lithuanian', 8, true, true, true, true],
        ['finnish', '🇫🇮 Finnish', 8, true, true, false, true],
        ['swedish', '🇸🇪 Swedish', 8, true, true, false, true],
        ['norwegian', '🇳🇴 Norwegian', 8, true, true, false, true],
        ['icelandic', '🇮🇸 Icelandic', 8, true, true, false, true],
        ['ukrainian', '🇺🇦 Ukrainian', 8, true, true, true, true],
        ['belarusian', '🇧🇾 Belarusian', 8, true, true, true, true],
        ['kazakh', '🇰🇿 Kazakh', 8, true, true, true, true],
        ['azerbaijani', '🇦🇿 Azerbaijani', 8, true, true, true, true],
        ['georgian', '🇬🇪 Georgian', 8, true, true, true, true],
        ['armenian', '🇦🇲 Armenian', 8, true, true, true, true],
        ['moldovan', '🇲🇩 Moldovan', 8, true, true, true, true],
        ['romanian', '🇷🇴 Romanian', 8, true, true, true, true],
        ['hungarian', '🇭🇺 Hungarian', 8, true, true, false, true],
        ['serbian', '🇷🇸 Serbian', 8, true, true, false, true],
        ['bulgarian', '🇧🇬 Bulgarian', 8, true, true, false, true],
        ['uk', '🇬🇧 British', 8, true, false, false, false]
    ];

    const boardEl = document.getElementById('board');
    const turnTag = document.getElementById('turnTag');
    const wrapEl = document.getElementById('wrap');
    const newBtn = document.getElementById('newBtn');
    const twoBtn = document.getElementById('twoBtn');
    const botBtn = document.getElementById('botBtn');
    const ruleNote = document.getElementById('ruleNote');
    const flagsEl = document.getElementById('flags');
    const winbar = document.getElementById('winbar');
    const confetti = document.getElementById('confetti');

    let ruleKey = 'russian';
    let board, turn, mode, selected = null, activeSeqs = null;

    FLAGS.forEach(([key, label]) => {
        const el = document.createElement('div');
        el.className = 'flag' + (key === ruleKey ? ' active' : '');
        el.dataset.key = key;
        el.textContent = label;
        el.onclick = () => {
            document.querySelectorAll('.flag').forEach(x => x.classList.remove('active'));
            el.classList.add('active');
            ruleKey = key;
            init();
        };
        flagsEl.appendChild(el);
    });

    twoBtn.onclick = () => start('2');
    botBtn.onclick = () => start('bot');
    newBtn.onclick = () => init();

    function start(m) {
        mode = m;
        wrapEl.classList.remove('hidden');
        init();
    }

    function currentRule() {
        const [key, label, size, menForwardOnly, menCaptureBackward, kingFlying, mandatoryMax] = FLAGS.find(x => x[0] === ruleKey);
        return { key, label, size, menForwardOnly, menCaptureBackward, kingFlying, mandatoryMax };
    }

    function init() {
        const R = currentRule();
        boardEl.style.gridTemplateColumns = `repeat(${R.size}, 1fr)`;
        boardEl.style.gridTemplateRows = `repeat(${R.size}, 1fr)`;
        const rows = (R.size === 8 ? 3 : R.size === 10 ? 4 : 5);
        board = Array.from({ length: R.size }, (_, r) => Array.from({ length: R.size }, (_, c) => {
            if ((r + c) % 2 === 0) return null;
            if (r < rows) return { color: 'black', king: false };
            if (r >= R.size - rows) return { color: 'white', king: false };
            return null;
        }));
        turn = 'white'; selected = null; activeSeqs = null;
        ruleNote.textContent = ruleSummary(R);
        render();
    }

    function ruleSummary(R) {
        return `${R.label}: taxta ${R.size}×${R.size}. Odamcha ${R.menForwardOnly ? 'faqat oldinga yuradi' : ''}${R.menCaptureBackward ? ', olishda orqaga ham sakraydi' : ''}${!R.menCaptureBackward ? ', orqaga olish yo‘q' : ''}. Dama ${R.kingFlying ? 'uchuvchi' : '1 qadam'}; ${R.mandatoryMax ? 'eng ko‘p olish majburiy' : 'olish majburiy (max emas)'}.'`;
    }

    const DIRS = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    const inRange = (r, c, size) => r >= 0 && r < size && c >= 0 && c < size;

    function render() {
        boardEl.innerHTML = '';
        const R = currentRule();
        for (let r = 0; r < R.size; r++) {
            for (let c = 0; c < R.size; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
                if ((r + c) % 2 === 1) cell.addEventListener('click', () => onCell(r, c));
                const p = board[r][c];
                if (p) {
                    const el = document.createElement('div');
                    el.className = 'piece ' + (p.color === 'white' ? 'white' : 'black') + (p.king ? ' king' : '');
                    cell.appendChild(el);
                }
                boardEl.appendChild(cell);
            }
        }
        turnTag.textContent = 'Navbat: ' + (turn === 'white' ? 'Oq' : (mode === 'bot' ? 'Qora (bot)' : 'Qora'));
        if (mode === 'bot' && turn === 'black') setTimeout(botTurn, 450);
    }

    function onCell(r, c) {
        if (mode === 'bot' && turn === 'black') return;
        const R = currentRule();
        if (activeSeqs && selected) {
            const allowed = new Map();
            for (const seq of activeSeqs) { if (seq.length) { const st = seq[0]; allowed.set(st.to.r + ',' + st.to.c, st); } }
            const k = r + ',' + c;
            if (allowed.has(k)) {
                const st = allowed.get(k);
                applyStep(selected.r, selected.c, st);
                const next = [];
                for (const seq of activeSeqs) { if (seq.length && seq[0].to.r === r && seq[0].to.c === c) next.push(seq.slice(1)); }
                activeSeqs = next;
                if (activeSeqs.some(s => s.length > 0)) { selected = { r, c }; render(); return; }
                else { selected = null; activeSeqs = null; endTurn(); return; }
            } else return;
        }
        const p = board[r][c];
        if (p && p.color === turn) {
            const caps = allCaptureSequences(turn);
            if (caps.mustCapture) {
                const list = caps.byPiece.get(r + ',' + c);
                if (!list) return;
                selected = { r, c }; activeSeqs = list.map(s => s.slice()); return;
            } else {
                selected = { r, c }; activeSeqs = null; return;
            }
        }
        if (selected && !board[r][c]) {
            const { r: sr, c: sc } = selected; const piece = board[sr][sc];
            const caps = allCaptureSequences(turn);
            if (caps.mustCapture) return;
            if (!piece.king) {
                const dr = r - sr, dc = c - sc;
                if (Math.abs(dr) === 1 && Math.abs(dc) === 1) {
                    if (!R.menForwardOnly || (piece.color === 'white' ? dr === -1 : dr === 1)) {
                        board[r][c] = piece; board[sr][sc] = null; maybePromote(r, c);
                        selected = null; endTurn();
                    }
                }
            } else {
                const dr = r - sr, dc = c - sc;
                if (R.kingFlying) {
                    if (Math.abs(dr) === Math.abs(dc) && clearPath(sr, sc, r, c)) {
                        board[r][c] = piece; board[sr][sc] = null; selected = null; endTurn();
                    }
                } else if (Math.abs(dr) === 1 && Math.abs(dc) === 1) {
                    board[r][c] = piece; board[sr][sc] = null; selected = null; endTurn();
                }
            }
        }
    }

    function endTurn() {
        const whites = board.flat().filter(p => p && p.color === 'white').length;
        const blacks = board.flat().filter(p => p && p.color === 'black').length;
        let winner = null;
        if (!whites) winner = 'black';
        else if (!blacks) winner = 'white';
        else {
            const wMoves = enumerateLegalMoves('white').length;
            const bMoves = enumerateLegalMoves('black').length;
            if (wMoves === 0 && bMoves === 0) winner = 'draw';
            else if (wMoves === 0) winner = 'black';
            else if (bMoves === 0) winner = 'white';
        }
        if (winner) { showWin(winner); init(); return; }
        turn = (turn === 'white' ? 'black' : 'white'); render();
    }

    function showWin(winner) {
        const text = winner === 'draw' ? '🤝 Durrang' : (winner === 'white' ? '🎉 Oq g‘olib!' : '🎉 Qora g‘olib!');
        winbar.textContent = text + '  •  Yaratuvchi: Orziqulov Nurulloh Fayzulla o`g`li';
        winbar.classList.remove('hidden');
        setTimeout(() => winbar.classList.add('show'), 10);
        burst();
        setTimeout(() => { winbar.classList.add('hidden'); winbar.classList.remove('show'); confetti.innerHTML = ''; }, 3200);
    }

    function allCaptureSequences(color) {
        const R = currentRule();
        let globalMax = 0, anyCapture = false;
        const tempMap = new Map();
        for (let r = 0; r < R.size; r++) for (let c = 0; c < R.size; c++) {
            const p = board[r][c]; if (!p || p.color !== color) continue;
            const list = genCaptures(r, c, p, R);
            if (list.length) anyCapture = true;
            const m = list.length ? Math.max(...list.map(s => s.length)) : 0;
            if (m > 0) tempMap.set(r + ',' + c, list);
            if (m > globalMax) globalMax = m;
        }
        let mustCapture = false, byPiece = new Map();
        if (anyCapture) {
            if (R.mandatoryMax) {
                for (const [k, seqs] of tempMap.entries()) {
                    const kept = seqs.filter(s => s.length === globalMax);
                    if (kept.length) byPiece.set(k, kept);
                }
            } else byPiece = tempMap;
            mustCapture = true;
        }
        return { mustCapture, byPiece, globalMax };
    }

    function genCaptures(r, c, p, R) {
        const out = []; const seen = new Set();
        function dfs(brd, rr, cc, piece, chain) {
            let found = false;
            if (piece.king && R.kingFlying) {
                for (const [dr, dc] of DIRS) {
                    let r1 = rr + dr, c1 = cc + dc, enc = null;
                    while (inRange(r1, c1, R.size)) {
                        const cell = brd[r1][c1];
                        if (cell) {
                            if (cell.color === piece.color || enc) break;
                            const key = r1 + ',' + c1; if (seen.has(key)) break;
                            enc = { r: r1, c: c1 };
                        } else if (enc) {
                            const nb = clone(brd); nb[enc.r][enc.c] = null; nb[rr][cc] = null;
                            nb[r1][c1] = { color: piece.color, king: true };
                            seen.add(enc.r + ',' + enc.c);
                            dfs(nb, r1, c1, nb[r1][c1], chain.concat([{ to: { r: r1, c: c1 }, cap: { r: enc.r, c: enc.c } }]));
                            seen.delete(enc.r + ',' + enc.c);
                            found = true;
                        }
                        r1 += dr; c1 += dc;
                    }
                }
            } else {
                for (const [dr, dc] of DIRS) {
                    const r1 = rr + dr, c1 = cc + dc, r2 = rr + 2 * dr, c2 = cc + 2 * dc;
                    if (!inRange(r2, c2, R.size)) continue;
                    const mid = brd[r1][c1];
                    if (mid && mid.color !== piece.color && !brd[r2][c2]) {
                        if (!R.menCaptureBackward && ((piece.color === 'white' && dr > 0) || (piece.color === 'black' && dr < 0))) continue;
                        const key = r1 + ',' + c1; if (seen.has(key)) continue;
                        const nb = clone(brd); nb[r1][c1] = null; nb[rr][cc] = null;
                        const becomesKing = (!piece.king && ((piece.color === 'white' && r2 === 0) || (piece.color === 'black' && r2 === R.size - 1)));
                        nb[r2][c2] = { color: piece.color, king: becomesKing || piece.king };
                        seen.add(key);
                        dfs(nb, r2, c2, nb[r2][c2], chain.concat([{ to: { r: r2, c: c2 }, cap: { r: r1, c: c1 } }]));
                        seen.delete(key);
                        found = true;
                    }
                }
            }
            if (!found && chain.length) out.push(chain);
        }
        dfs(board, r, c, p, []);
        return out;
    }

    function applyStep(sr, sc, step) {
        const p = board[sr][sc]; const { r, c } = step.to;
        board[r][c] = { color: p.color, king: p.king }; board[sr][sc] = null;
        if (step.cap) board[step.cap.r][step.cap.c] = null;
        maybePromote(r, c);
    }

    function maybePromote(r, c) {
        const R = currentRule(); const p = board[r][c];
        if (!p.king && ((p.color === 'white' && r === 0) || (p.color === 'black' && r === R.size - 1))) p.king = true;
    }

    function clearPath(sr, sc, r, c) {
        const dr = Math.sign(r - sr), dc = Math.sign(c - sc);
        let rr = sr + dr, cc = sc + dc;
        while (rr !== r || cc !== c) { if (board[rr][cc]) return false; rr += dr; cc += dc; }
        return true;
    }

    function clone(b) { return b.map(row => row.map(cell => cell ? { ...cell } : null)); }

    function botTurn() {
        const legal = enumerateLegalMoves('black');
        if (legal.length === 0) { endTurn(); return; }
        let best = null, bestScore = -Infinity;
        for (const mv of legal) {
            const save = clone(board); playMove(mv);
            let score = evaluate(); board = save;
            if (score > bestScore) { bestScore = score; best = mv; }
        }
        playMove(best); endTurn();
    }

    function playMove(move) {
        let { r, c } = move.from;
        for (const st of move.steps) { applyStep(r, c, st); r = st.to.r; c = st.to.c; }
    }

    function evaluate() {
        let s = 0;
        for (const row of board) for (const p of row) {
            if (!p) continue;
            const v = p.king ? 3 : 1; s += (p.color === 'black' ? v : -v);
        }
        return s;
    }

    function enumerateLegalMoves(color) {
        const caps = allCaptureSequences(color);
        if (caps.mustCapture) {
            const list = [];
            for (const [key, seqs] of caps.byPiece.entries()) {
                const [r, c] = key.split(',').map(Number);
                for (const s of seqs) list.push({ from: { r, c }, steps: s });
            }
            return list;
        }
        const R = currentRule(); const out = [];
        for (let r = 0; r < R.size; r++) for (let c = 0; c < R.size; c++) {
            const p = board[r][c]; if (!p || p.color !== color) continue;
            for (const [dr, dc] of DIRS) {
                let rr = r + dr, cc = c + dc;
                if (!inRange(rr, cc, R.size) || board[rr][cc]) continue;
                if (!p.king && R.menForwardOnly && ((color === 'white' && dr !== -1) || (color === 'black' && dr !== 1))) continue;
                out.push({ from: { r, c }, steps: [{ to: { r: rr, c: cc } }] });
                if (p.king && R.kingFlying) {
                    rr += dr; cc += dc;
                    while (inRange(rr, cc, R.size) && !board[rr][cc]) {
                        out.push({ from: { r, c }, steps: [{ to: { r: rr, c: cc } }] });
                        rr += dr; cc += dc;
                    }
                }
            }
        }
        return out;
    }

    function burst() {
        for (let i = 0; i < 150; i++) {
            const el = document.createElement('i');
            el.style.setProperty('--x', Math.random());
            el.style.setProperty('--h', Math.floor(Math.random() * 360));
            el.style.setProperty('--r', Math.floor(Math.random() * 360));
            el.style.setProperty('--d', (3 + Math.random() * 2).toFixed(2));
            el.style.setProperty('--delay', (Math.random() * 0.2).toFixed(2));
            confetti.appendChild(el);
        }
    }

    document.getElementById('year').textContent = new Date().getFullYear();
})();