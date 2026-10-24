// Castle Siege Artillery — Destructible Terrain, Fortress Blueprints & Ballistic AI
window.SIEGE_WORLDS = [
  { id: 'valley',  name: '🌍 Valley',  grav: 0.24, skyTop: '#1D4ED8', skyBot: '#93C5FD', dirt: '#3F6212', rock: '#365314' },
  { id: 'volcano', name: '🌋 Volcano', grav: 0.25, skyTop: '#450A0A', skyBot: '#EA580C', dirt: '#44403C', rock: '#1C1917' },
  { id: 'moon',    name: '🌙 Low-G',   grav: 0.13, skyTop: '#020617', skyBot: '#312E81', dirt: '#64748B', rock: '#334155' }
];

window.SiegeBuilder = {
  // Generate 1D destructible heightmap with flat castle pads on Left/Right & jagged central mountain!
  createTerrain(W, H, wave) {
    const ground = new Float32Array(W);
    const leftPadY = H - 95 - (wave % 2) * 28;
    const rightPadY = H - 100 - ((wave + 1) % 3) * 26;
    const peakH = 125 + (wave % 3) * 38;
    const peakX = W * (0.46 + ((wave % 3) - 1) * 0.05);

    for (let x = 0; x < W; x++) {
      if (x < 225) {
        ground[x] = leftPadY;
      } else if (x > W - 245) {
        ground[x] = rightPadY;
      } else {
        const t = (x - 225) / (W - 470);
        const base = leftPadY + (rightPadY - leftPadY) * t;
        const distPeak = Math.abs(x - peakX);
        const ridge = Math.max(0, Math.cos((distPeak / 210) * (Math.PI / 2))) * peakH;
        const bumps = Math.sin(x * 0.035 + wave) * 12;
        ground[x] = Math.max(135, base - ridge - (distPeak < 190 ? bumps : 0));
      }
    }
    return ground;
  },

  // Carve circular explosion crater into terrain heightmap!
  carveCrater(ground, cx, cy, radius, H) {
    const startX = Math.max(10, Math.floor(cx - radius));
    const endX = Math.min(ground.length - 10, Math.ceil(cx + radius));
    for (let x = startX; x <= endX; x++) {
      const dx = x - cx;
      const dy = Math.sqrt(Math.max(0, radius * radius - dx * dx));
      const craterBottom = cy + dy;
      if (craterBottom > ground[x]) {
        // Keep a minimum bedrock floor so cannons never fall off screen
        ground[x] = Math.min(H - 26, craterBottom);
      }
    }
  },

  // Build Multi-Material Physics Fortress (Stone, Wood, Ice, TNT Kegs, and Targets!)
  buildFortress(side, baseX, ground, wave, isEmma) {
    const blocks = [];
    const bw = 34, bh = 28;
    const cols = side === 'right' ? 4 : 3;
    const stories = side === 'right' ? (isEmma ? 2 : 3) : 2;

    for (let row = 0; row < stories; row++) {
      for (let col = 0; col < cols; col++) {
        const x = baseX + col * (bw + 2);
        const groundY = ground[Math.floor(x + bw / 2)];
        const y = groundY - (row + 1) * bh;

        // Place explosive TNT Keg in the heart of the castle for epic chain reactions!
        if (row === 0 && col === 1 && side === 'right') {
          blocks.push({ side, x, y, w: bw, h: bh, vy: 0, mat: 'tnt', hp: 1, maxHp: 1 });
          continue;
        }
        // Leave windows/archways for targets on upper floors
        if (row === 1 && col === 2 && side === 'right') continue;

        const mat = row === 0 ? 'stone' : (row === 1 ? 'wood' : 'ice');
        const hp = mat === 'stone' ? 3 : (mat === 'wood' ? 2 : 1);
        blocks.push({ side, x, y, w: bw, h: bh, vy: 0, mat, hp, maxHp: hp });
      }
    }

    // Place Targets (Goblin King & Minions on Right; Hero Crown Banner on Left)
    const targets = [];
    if (side === 'right') {
      const midX = baseX + 1.5 * (bw + 2);
      targets.push({
        side: 'right', x: midX, y: ground[Math.floor(midX)] - stories * bh - 18,
        r: 18, vy: 0, hp: 2, icon: '👹', isKing: true
      });
      const guardX = baseX + 2.35 * (bw + 2);
      targets.push({
        side: 'right', x: guardX, y: ground[Math.floor(guardX)] - bh - 16,
        r: 15, vy: 0, hp: 1, icon: '👾', isKing: false
      });
    } else {
      const heroX = baseX + 1.1 * (bw + 2);
      targets.push({
        side: 'left', x: heroX, y: ground[Math.floor(heroX)] - stories * bh - 18,
        r: 18, vy: 0, hp: 3, icon: isEmma ? '🐶' : '🐉', isKing: true
      });
    }
    return { blocks, targets };
  },

  // Smart Ballistic Solver for Enemy Goblin Cannon (Accounts for Wind, Gravity & Ridge Height!)
  solveAIShot(fromX, fromY, targetX, targetY, wind, grav, wave) {
    let best = { angle: 125, power: 68, err: 99999 };
    for (let deg = 108; deg <= 158; deg += 4) {
      for (let pwr = 38; pwr <= 96; pwr += 3) {
        const rad = (deg * Math.PI) / 180;
        const speed = pwr * 0.175;
        let x = fromX, y = fromY;
        let vx = Math.cos(rad) * speed, vy = -Math.sin(rad) * speed;
        for (let t = 0; t < 190; t++) {
          vx += wind; vy += grav;
          x += vx; y += vy;
          const d = Math.hypot(x - targetX, y - targetY);
          if (d < best.err) best = { angle: deg, power: pwr, err: d };
          if (y > 600 || x < 0) break;
        }
      }
    }
    // Add natural AI scatter (wider scatter early, sharper aim on higher waves!)
    const jitter = Math.max(2.5, 9.5 - wave * 1.3);
    return {
      angle: best.angle + (Math.random() - 0.5) * jitter,
      power: Math.max(30, Math.min(98, best.power + (Math.random() - 0.5) * jitter))
    };
  }
};