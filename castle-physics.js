// Castle Siege Artillery — Zoomed-Out Battlefield, Front Turrets & Slow-Mo Ballistics
window.SIEGE_WORLDS = [
  { id: 'valley',  name: '🌍 Valley',  grav: 0.22, skyTop: '#1D4ED8', skyBot: '#93C5FD', dirt: '#3F6212', rock: '#365314' },
  { id: 'volcano', name: '🌋 Volcano', grav: 0.23, skyTop: '#450A0A', skyBot: '#EA580C', dirt: '#44403C', rock: '#1C1917' },
  { id: 'moon',    name: '🌙 Low-G',   grav: 0.12, skyTop: '#020617', skyBot: '#312E81', dirt: '#64748B', rock: '#334155' }
];

window.SiegeBuilder = {
  // Wide zoomed-out 1D heightmap: Left Fortress + Front Turret | Valley & Central Hill | Front Turret + Right Fortress
  createTerrain(W, H, wave) {
    const ground = new Float32Array(W);
    const leftPadY = H - 105 - (wave % 2) * 24;
    const rightPadY = H - 110 - ((wave + 1) % 3) * 24;
    const peakH = 95 + (wave % 3) * 32;
    const peakX = W * (0.50 + ((wave % 3) - 1) * 0.04);

    for (let x = 0; x < W; x++) {
      if (x < 290) {
        ground[x] = leftPadY;
      } else if (x > W - 290) {
        ground[x] = rightPadY;
      } else {
        const t = (x - 290) / (W - 580);
        const base = leftPadY + (rightPadY - leftPadY) * t;
        const distPeak = Math.abs(x - peakX);
        const ridge = Math.max(0, Math.cos((distPeak / 220) * (Math.PI / 2))) * peakH;
        const bumps = Math.sin(x * 0.028 + wave) * 9;
        ground[x] = Math.max(H * 0.34, base - ridge - (distPeak < 200 ? bumps : 0));
      }
    }
    return ground;
  },

  carveCrater(ground, cx, cy, radius, H) {
    const startX = Math.max(12, Math.floor(cx - radius));
    const endX = Math.min(ground.length - 12, Math.ceil(cx + radius));
    for (let x = startX; x <= endX; x++) {
      const dx = x - cx;
      const dy = Math.sqrt(Math.max(0, radius * radius - dx * dx));
      const craterBottom = cy + dy;
      if (craterBottom > ground[x]) {
        ground[x] = Math.min(H - 22, craterBottom);
      }
    }
  },

  // Compact, Scaled-Down Multi-Story Fortresses Safely Behind Each Cannon's Front Turret!
  buildFortress(side, ground, W, wave, isEmma) {
    const blocks = [];
    const bw = 22, bh = 18, gap = 2;
    const cols = side === 'right' ? 5 : 4;
    const stories = side === 'right' ? (isEmma ? 3 : 4) : 3;

    // Left fortress sits at x=48..142 (Left Cannon sits IN FRONT at x=210!)
    // Right fortress sits at x=(W-166)..(W-48) (Right Cannon sits IN FRONT at x=W-210!)
    const baseX = side === 'left' ? 52 : (W - 52 - cols * (bw + gap));

    for (let row = 0; row < stories; row++) {
      for (let col = 0; col < cols; col++) {
        const x = baseX + col * (bw + gap);
        const groundY = ground[Math.floor(x + bw / 2)];
        const y = groundY - (row + 1) * bh;

        // Explosive TNT Keg tucked inside ground floor
        if (row === 0 && col === Math.floor(cols / 2) && side === 'right') {
          blocks.push({ side, x, y, w: bw, h: bh, vy: 0, mat: 'tnt', hp: 1, maxHp: 1 });
          continue;
        }
        // Leave inner courtyard alcoves for Goblin minions
        if (row === 1 && col === 1 && side === 'right') continue;
        if (row === 1 && col === 3 && side === 'right' && cols >= 5) continue;

        const mat = row === 0 ? 'stone' : (row < stories - 1 ? 'wood' : 'ice');
        const hp = mat === 'stone' ? 3 : (mat === 'wood' ? 2 : 1);
        blocks.push({ side, x, y, w: bw, h: bh, vy: 0, mat, hp, maxHp: hp });
      }
    }

    const targets = [];
    const centerFortX = baseX + (cols * (bw + gap)) / 2;
    if (side === 'right') {
      targets.push({
        side: 'right', x: centerFortX, y: ground[Math.floor(centerFortX)] - stories * bh - 12,
        r: 12, vy: 0, hp: 2, icon: '👹', isKing: true
      });
      const g1X = baseX + 1.5 * (bw + gap);
      targets.push({
        side: 'right', x: g1X, y: ground[Math.floor(g1X)] - bh - 11,
        r: 10, vy: 0, hp: 1, icon: '👾', isKing: false
      });
      if (!isEmma) {
        const g2X = baseX + 3.5 * (bw + gap);
        targets.push({
          side: 'right', x: g2X, y: ground[Math.floor(g2X)] - bh - 11,
          r: 10, vy: 0, hp: 1, icon: '👾', isKing: false
        });
      }
    } else {
      targets.push({
        side: 'left', x: centerFortX, y: ground[Math.floor(centerFortX)] - stories * bh - 12,
        r: 12, vy: 0, hp: 3, icon: isEmma ? '🐶' : '🐉', isKing: true
      });
    }
    return { blocks, targets };
  },

  // AI Ballistic Solver Matched to Exact Slow-Motion Physics Step (dt = 0.46)
  solveAIShot(fromX, fromY, targetX, targetY, wind, grav, wave, dtStep) {
    let best = { angle: 130, power: 68, err: 99999 };
    for (let deg = 112; deg <= 162; deg += 4) {
      for (let pwr = 35; pwr <= 96; pwr += 3) {
        const rad = (deg * Math.PI) / 180;
        const speed = pwr * 0.195;
        let x = fromX + Math.cos(rad) * 20;
        let y = fromY - Math.sin(rad) * 20;
        let vx = Math.cos(rad) * speed;
        let vy = -Math.sin(rad) * speed;
        for (let step = 0; step < 420; step++) {
          vx += wind * dtStep;
          vy += grav * dtStep;
          x += vx * dtStep;
          y += vy * dtStep;
          const d = Math.hypot(x - targetX, y - targetY);
          if (d < best.err) best = { angle: deg, power: pwr, err: d };
          if (y > 800 || x < 0) break;
        }
      }
    }
    const jitter = Math.max(2.5, 9.0 - wave * 1.2);
    return {
      angle: best.angle + (Math.random() - 0.5) * jitter,
      power: Math.max(32, Math.min(98, best.power + (Math.random() - 0.5) * jitter))
    };
  }
};