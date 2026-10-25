// Castle Siege Artillery — Clear Castle/Turret Hitboxes, Reachable Range & Safe Heightmap
window.SIEGE_WORLDS = [
  { id: 'valley',  name: '🌍 Valley',  grav: 0.21, skyTop: '#1D4ED8', skyBot: '#93C5FD', dirt: '#3F6212', rock: '#365314' },
  { id: 'volcano', name: '🌋 Volcano', grav: 0.22, skyTop: '#450A0A', skyBot: '#EA580C', dirt: '#44403C', rock: '#1C1917' },
  { id: 'moon',    name: '🌙 Low-G',   grav: 0.12, skyTop: '#020617', skyBot: '#312E81', dirt: '#64748B', rock: '#334155' }
];

window.SiegeBuilder = {
  groundAt(ground, x) {
    if (!ground || ground.length === 0) return 500;
    const idx = Math.max(0, Math.min(ground.length - 1, Math.floor(x)));
    return ground[idx];
  },

  createTerrain(W, H, wave) {
    const ground = new Float32Array(W);
    const leftPadY = H - 105 - (wave % 2) * 20;
    const rightPadY = H - 108 - ((wave + 1) % 3) * 20;
    const peakH = 80 + (wave % 3) * 26;
    const peakX = W * 0.50;

    for (let x = 0; x < W; x++) {
      if (x < 330) {
        ground[x] = leftPadY;
      } else if (x > W - 330) {
        ground[x] = rightPadY;
      } else {
        const t = (x - 330) / (W - 660);
        const base = leftPadY + (rightPadY - leftPadY) * t;
        const distPeak = Math.abs(x - peakX);
        const ridge = Math.max(0, Math.cos((distPeak / 200) * (Math.PI / 2))) * peakH;
        const bumps = Math.sin(x * 0.028 + wave) * 7;
        ground[x] = Math.max(H * 0.38, base - ridge - (distPeak < 185 ? bumps : 0));
      }
    }
    return ground;
  },

  carveCrater(ground, cx, cy, radius, H) {
    if (!ground) return;
    const startX = Math.max(12, Math.floor(cx - radius));
    const endX = Math.min(ground.length - 12, Math.ceil(cx + radius));
    for (let x = startX; x <= endX; x++) {
      const dx = x - cx;
      const dy = Math.sqrt(Math.max(0, radius * radius - dx * dx));
      const craterBottom = cy + dy;
      if (craterBottom > ground[x]) {
        ground[x] = Math.min(H - 24, craterBottom);
      }
    }
  },

  // Build Fortress + Destructible Cannon Turret Target!
  buildFortress(side, ground, W, wave, isEmma, includeTurret) {
    const blocks = [];
    const bw = 24, bh = 20, gap = 2;
    const cols = side === 'right' ? 4 : 3;
    const stories = side === 'right' ? (isEmma ? 2 : 3) : 2;

    // Bring castles comfortably within mid-power range (Left: x=115..195, Right: x=985..1089)
    const baseX = side === 'left' ? 115 : (W - 115 - cols * (bw + gap));

    for (let row = 0; row < stories; row++) {
      for (let col = 0; col < cols; col++) {
        const x = baseX + col * (bw + gap);
        const groundY = this.groundAt(ground, x + bw / 2);
        const y = groundY - (row + 1) * bh;

        // Big glowing TNT Keg in the center of the enemy castle!
        if (row === 0 && (col === 1 || col === 2) && side === 'right') {
          if (col === 1) blocks.push({ side, x, y, w: bw, h: bh, vy: 0, mat: 'tnt', hp: 1, maxHp: 1 });
          else blocks.push({ side, x, y, w: bw, h: bh, vy: 0, mat: 'wood', hp: 2, maxHp: 2 });
          continue;
        }

        const mat = row === 0 ? 'stone' : (row < stories - 1 ? 'wood' : 'ice');
        const hp = mat === 'stone' ? 2 : (mat === 'wood' ? 2 : 1);
        blocks.push({ side, x, y, w: bw, h: bh, vy: 0, mat, hp, maxHp: hp });
      }
    }

    const targets = [];
    const centerFortX = baseX + (cols * (bw + gap)) / 2;

    if (side === 'right') {
      // 1. King Boss on the Roof (Big 18px hitbox!)
      targets.push({
        side: 'right', kind: 'king',
        x: centerFortX, y: this.groundAt(ground, centerFortX) - stories * bh - 16,
        r: 18, vy: 0, hp: 2, maxHp: 2, icon: '👹'
      });
      // 2. Enemy Cannon Turret IS NOW A REAL DESTRUCTIBLE TARGET!
      if (includeTurret) {
        const tx = W - 265;
        targets.push({
          side: 'right', kind: 'turret',
          x: tx, y: this.groundAt(ground, tx) - 14,
          r: 20, vy: 0, hp: 2, maxHp: 2, icon: '🎯'
        });
      }
    } else {
      targets.push({
        side: 'left', kind: 'king',
        x: centerFortX, y: this.groundAt(ground, centerFortX) - stories * bh - 16,
        r: 18, vy: 0, hp: 3, maxHp: 3, icon: isEmma ? '🐶' : '🐉'
      });
      if (includeTurret) {
        const tx = 265;
        targets.push({
          side: 'left', kind: 'turret',
          x: tx, y: this.groundAt(ground, tx) - 14,
          r: 20, vy: 0, hp: 3, maxHp: 3, icon: '🛡️'
        });
      }
    }
    return { blocks, targets };
  },

  solveAIShot(fromX, fromY, targetX, targetY, wind, grav, wave, dtStep, speedMul) {
    let best = { angle: 132, power: 62, err: 99999 };
    for (let deg = 115; deg <= 158; deg += 4) {
      for (let pwr = 32; pwr <= 92; pwr += 3) {
        const rad = (deg * Math.PI) / 180;
        const speed = pwr * speedMul;
        let x = fromX + Math.cos(rad) * 22;
        let y = fromY - Math.sin(rad) * 22;
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
    const jitter = Math.max(4.0, 11.5 - wave * 1.2);
    return {
      angle: best.angle + (Math.random() - 0.5) * jitter,
      power: Math.max(30, Math.min(95, best.power + (Math.random() - 0.5) * jitter))
    };
  }
};