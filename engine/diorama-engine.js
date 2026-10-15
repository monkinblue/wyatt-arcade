/* Reusable 2.5D living pixel diorama.
   320x180 stage, parallax, weather, sprites, narration, and retro synth. */
(function () {
  'use strict';

  var W = 320;
  var H = 180;
  var BLEED = 10;

  var PAL = {
    '.': null,
    'k': '#1A1220',
    'w': '#F4F7FF',
    's': '#F3C29A',
    'p': '#E89A8C',
    'e': '#1A1220',
    'b': '#2F6FE0',
    'n': '#1C3E86',
    'r': '#D83A4A',
    'z': '#FF8AD0',
    'g': '#2E9B45',
    'G': '#1B6B32',
    'l': '#B6E88A',
    'y': '#FFD15C',
    'o': '#F08A24',
    'm': '#8A5A32',
    'h': '#3A2418',
    'a': '#8FD4F0',
    'u': '#7A4E9A',
    'f': '#F4E7B0',
    'c': '#F0D8B0'
  };

  function rows(text) {
    return text.split('|');
  }

  var GRIDS = {
    wyatt: rows('....hhhh....|...hhhhhh...|..hssssssh..|..hs.e.e.sh.|..hssssssh..|...hpppph...|....ssss....|..bbbbbbbb..|.bbbbbbbbbb.|.bbb.bb.bbb.|..bbbbbbbb..|....bb.bb...|....bb.bb...|....bb.bb...|...kkk.kkk..|..kkkk.kkkk.'),
    emma: rows('...yyyyyy...|..yhhhhhhy..|..hssssssh..|..hs.e.e.sh.|..hssssssh..|...hpppph...|....ssss....|..zzzzzzzz..|.zzzzzzzzzz.|.zzz.zz.zzz.|..zzzzzzzz..|....zz.zz...|....ss.ss...|....ss.ss...|...kkk.kkk..|..kkkk.kkkk.'),
    dad: rows('....hhhh....|...hhhhhh...|..hssssssh..|..hs.e.e.sh.|..hssssssh..|...hpppph...|....mmmm....|...mmmmmm...|..gggggggg..|.gggggggggg.|.ggg.gg.ggg.|..gggggggg..|...gg..gg...|...gg..gg...|...gg..gg...|...kk..kk...|..kkk..kkk..|..kkk..kkk..'),
    cow: rows('......wwww......|.....wwwwww.....|....wwkwwkww....|...wwwwwwwwww...|..wwwwwwwwwwww..|..wwkkwwwwkkww..|...wwwwwwwwww...|....wwwwwwww....|.....wwwwww.....|......w..w......|.....kk..kk.....|.....kk..kk.....'),
    owl: rows('....mmmm....|..mmmmmmmm..|..mwwmmwwm..|..mkemmkem..|..mwwmmwwm..|..moooomm...|....yyyy....|...yyyyyy...|....yy.yy...|....kk.kk...'),
    giant: rows('....hhhhhh....|..hhsssssshh..|..hs.e.e.ssh..|..hssssssssh..|...hpppppph...|....ssssss....|....mmmmmm....|..uuuuuuuuuu..|.uuuuuuuuuuuu.|.uuu.uuuu.uuu.|..uuuuuuuuuu..|...uu....uu...|...uu....uu...|...kk....kk...|..kkk....kkk..'),
    goose: rows('....yyyyyy....|..yyyyyyyyyy..|.yyywwwwyyyyy.|.yyyyyyyyyyyy.|...yykkkyyyy..|..yyyyyyyyyy..|...yyyyyyyy...|....yy..yy....|....oo..oo....'),
    dino: rows('......gggg......|.....gggggg.....|....ggwggwgg....|....gggggggg....|...gggggggggg...|..gggggggggggg..|..ggllgggggggg..|...gggggggggg...|....gggg..gg....|....gg....gg....|...kkk....kkk...')
  };

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function box(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
  }

  function disc(ctx, cx, cy, r, color) {
    ctx.fillStyle = color;
    var rr = r * r;
    for (var y = -r; y <= r; y++) {
      for (var x = -r; x <= r; x++) {
        if (x * x + y * y <= rr) ctx.fillRect(cx + x, cy + y, 1, 1);
      }
    }
  }

  function blit(ctx, lines, ox, oy, scale) {
    var s = scale || 1;
    var maxW = 0;
    for (var y = 0; y < lines.length; y++) {
      var line = lines[y];
      if (line.length > maxW) maxW = line.length;
      for (var x = 0; x < line.length; x++) {
        var color = PAL[line.charAt(x)];
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(ox + x * s, oy + y * s, s, s);
      }
    }
    return { w: maxW * s, h: lines.length * s };
  }

  function drawShadow(ctx, cx, feet, rx) {
    ctx.fillStyle = '#102018';
    for (var row = -1; row <= 1; row++) {
      var half = rx - Math.abs(row) * 2;
      for (var x = -half; x < half; x++) {
        if (((x + row) & 1) === 0) ctx.fillRect(cx + x, feet + row, 1, 1);
      }
    }
  }

  function drawCottage(ctx, x, y, time) {
    var glow = Math.sin(time * 3) > 0 ? '#FFE08A' : '#9FD8F2';
    box(ctx, x + 10, y + 30, 66, 38, '#F0D2A8');
    box(ctx, x + 10, y + 30, 66, 3, '#6B3E22');
    box(ctx, x + 10, y + 46, 66, 3, '#6B3E22');
    box(ctx, x + 10, y + 30, 3, 38, '#6B3E22');
    box(ctx, x + 73, y + 30, 3, 38, '#6B3E22');
    box(ctx, x + 40, y + 30, 3, 38, '#6B3E22');
    for (var i = 0; i < 12; i++) {
      box(ctx, x + 6 + i, y + 20 - i, 74 - i * 2, 3, (i % 2) ? '#A8483C' : '#C85A48');
    }
    box(ctx, x + 58, y + 4, 12, 18, '#8A4038');
    box(ctx, x + 56, y + 2, 16, 4, '#5C2C28');
    box(ctx, x + 58, y + 10, 12, 2, '#D7B08A');
    box(ctx, x + 58, y + 16, 12, 2, '#D7B08A');
    box(ctx, x + 32, y + 46, 16, 22, '#5C3317');
    box(ctx, x + 42, y + 56, 3, 3, '#FFD166');
    box(ctx, x + 16, y + 36, 16, 12, glow);
    box(ctx, x + 23, y + 36, 2, 12, '#6B3E22');
    box(ctx, x + 16, y + 41, 16, 2, '#6B3E22');
    box(ctx, x + 28, y + 66, 24, 4, '#8B95A1');
  }

  function drawMoon(ctx, x, y) {
    var cx = x + 12;
    var cy = y + 12;
    disc(ctx, cx, cy, 11, '#FFE8A8');
    disc(ctx, cx + 4, cy - 2, 8, '#1B2450');
    box(ctx, cx - 4, cy - 1, 2, 2, '#FFF6D2');
    box(ctx, cx - 2, cy + 3, 1, 1, '#FFF6D2');
  }

  function drawCloud(ctx, x, y) {
    box(ctx, x + 6, y + 6, 28, 8, '#F7FBFF');
    box(ctx, x + 12, y + 2, 16, 6, '#F7FBFF');
    box(ctx, x + 2, y + 10, 36, 6, '#E7F0FA');
    box(ctx, x + 8, y + 14, 22, 3, '#D5E2F0');
  }

  function drawLeaf(ctx, x, y) {
    box(ctx, x + 2, y + 6, 16, 4, '#1B6B32');
    box(ctx, x, y + 3, 10, 5, '#2E9B45');
    box(ctx, x + 8, y + 1, 12, 6, '#8ED36A');
    box(ctx, x + 6, y + 4, 8, 1, '#145C30');
  }

  function drawBeans(ctx, x, y, time) {
    var glow = Math.sin(time * 5) > 0 ? '#FFF3B0' : '#FFD15C';
    disc(ctx, x + 8, y + 10, 5, '#E0A020');
    disc(ctx, x + 8, y + 10, 3, glow);
    disc(ctx, x + 16, y + 8, 5, '#E0A020');
    disc(ctx, x + 16, y + 8, 3, '#FFE38A');
    disc(ctx, x + 12, y + 14, 4, '#C4882E');
    box(ctx, x + 12, y + 4, 2, 4, '#2E9B45');
  }

  function drawRainbow(ctx, x, y) {
    var colors = ['#E23D4A', '#F08A24', '#FFD15C', '#2E9B45', '#2F6FE0', '#7A4E9A'];
    for (var i = 0; i < colors.length; i++) {
      var r = 18 - i * 2;
      ctx.fillStyle = colors[i];
      for (var a = 0; a <= 16; a++) {
        var t = Math.PI + (a / 16) * Math.PI;
        var px = x + 20 + Math.round(Math.cos(t) * r);
        var py = y + 20 + Math.round(Math.sin(t) * r);
        ctx.fillRect(px, py, 2, 2);
      }
    }
  }

  function drawHarp(ctx, x, y) {
    box(ctx, x + 4, y + 4, 4, 26, '#E0A020');
    box(ctx, x + 4, y + 2, 14, 4, '#FFD15C');
    box(ctx, x + 14, y + 4, 4, 22, '#E0A020');
    box(ctx, x + 4, y + 26, 16, 4, '#C4882E');
    box(ctx, x + 8, y + 8, 1, 16, '#FFF6D2');
    box(ctx, x + 11, y + 8, 1, 16, '#FFF6D2');
    box(ctx, x + 6, y + 30, 12, 3, '#8A5A32');
  }

  function drawFlashlight(ctx, x, y) {
    box(ctx, x + 6, y + 10, 8, 22, '#243044');
    box(ctx, x + 4, y + 6, 12, 6, '#FFD15C');
    box(ctx, x + 7, y + 2, 6, 4, '#FFF6D2');
    box(ctx, x + 8, y + 16, 4, 2, '#8FD4F0');
  }

  function drawCookie(ctx, x, y) {
    disc(ctx, x + 11, y + 11, 10, '#E0A86A');
    disc(ctx, x + 11, y + 11, 8, '#C4884A');
    box(ctx, x + 6, y + 8, 3, 3, '#5C3317');
    box(ctx, x + 12, y + 6, 3, 3, '#5C3317');
    box(ctx, x + 10, y + 13, 3, 3, '#5C3317');
    box(ctx, x + 15, y + 12, 2, 2, '#3A2418');
  }

  function drawWand(ctx, x, y) {
    box(ctx, x + 10, y + 16, 3, 20, '#6B3E22');
    disc(ctx, x + 11, y + 10, 8, '#FFD15C');
    disc(ctx, x + 11, y + 10, 4, '#8A5A32');
    box(ctx, x + 10, y + 2, 2, 4, '#2E9B45');
  }

  function drawCrest(ctx, x, y) {
    box(ctx, x + 4, y + 6, 18, 20, '#FFD15C');
    box(ctx, x + 6, y + 8, 14, 14, '#1A103C');
    box(ctx, x + 8, y + 4, 10, 4, '#E23D4A');
    box(ctx, x + 10, y + 12, 6, 6, '#FFD15C');
    box(ctx, x + 2, y + 24, 22, 4, '#8A5A32');
  }

  var SPRITES = {
    wyatt: { rows: GRIDS.wyatt, scale: 3, anchor: 'feet', idle: 'bob', shadow: 12 },
    emma: { rows: GRIDS.emma, scale: 3, anchor: 'feet', idle: 'bob', shadow: 12 },
    dad: { rows: GRIDS.dad, scale: 3, anchor: 'feet', idle: 'bob', shadow: 12 },
    cow: { rows: GRIDS.cow, scale: 2, anchor: 'feet', idle: 'bob', shadow: 14 },
    owl: { rows: GRIDS.owl, scale: 3, anchor: 'feet', idle: 'bob', shadow: 10 },
    giant: { rows: GRIDS.giant, scale: 3, anchor: 'feet', idle: 'bob', shadow: 16 },
    goose: { rows: GRIDS.goose, scale: 3, anchor: 'feet', idle: 'bob', shadow: 12 },
    dino: { rows: GRIDS.dino, scale: 2, anchor: 'feet', idle: 'bob', shadow: 10 },
    cottage: { draw: drawCottage, w: 88, h: 74, anchor: 'feet', idle: 'still', shadow: 24, chimney: { x: 64, y: 2 } },
    moon: { draw: drawMoon, w: 24, h: 24, anchor: 'center', idle: 'bob', shadow: 0 },
    cloud: { draw: drawCloud, w: 40, h: 18, anchor: 'center', idle: 'sway', shadow: 0 },
    leaf: { draw: drawLeaf, w: 20, h: 12, anchor: 'center', idle: 'sway', shadow: 0 },
    beans: { draw: drawBeans, w: 26, h: 20, anchor: 'center', idle: 'bob', shadow: 8 },
    rainbow: { draw: drawRainbow, w: 42, h: 24, anchor: 'center', idle: 'still', shadow: 0 },
    harp: { draw: drawHarp, w: 24, h: 36, anchor: 'feet', idle: 'still', shadow: 8 },
    flashlight: { draw: drawFlashlight, w: 20, h: 36, anchor: 'feet', idle: 'still', shadow: 6 },
    cookie: { draw: drawCookie, w: 24, h: 24, anchor: 'center', idle: 'bob', shadow: 8 },
    wand: { draw: drawWand, w: 24, h: 40, anchor: 'feet', idle: 'sway', shadow: 6 },
    crest: { draw: drawCrest, w: 26, h: 30, anchor: 'center', idle: 'still', shadow: 0 }
  };

  function spriteSize(def, scaleOverride) {
    if (def.rows) {
      var scale = scaleOverride || def.scale || 1;
      var width = 0;
      for (var i = 0; i < def.rows.length; i++) {
        if (def.rows[i].length > width) width = def.rows[i].length;
      }
      return { w: width * scale, h: def.rows.length * scale, scale: scale };
    }
    return { w: def.w, h: def.h, scale: 1 };
  }

  function paintSprite(ctx, name, anchorX, anchorY, time, motion, scaleOverride) {
    var def = SPRITES[name];
    if (!def) return null;
    var size = spriteSize(def, scaleOverride);
    var anchor = (motion && motion.anchor) || def.anchor || 'center';
    var left = Math.round(anchorX - size.w / 2);
    var top = Math.round(anchor === 'feet' ? anchorY - size.h : anchorY - size.h / 2);
    var cx = left + size.w / 2;
    var cy = top + size.h / 2;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (def.shadow) drawShadow(ctx, cx, anchor === 'feet' ? anchorY : top + size.h - 1, def.shadow);
    if (motion && motion.angle) {
      ctx.translate(cx, cy);
      ctx.rotate(motion.angle);
      ctx.translate(-cx, -cy);
    }
    if (def.rows) blit(ctx, def.rows, left, top, size.scale);
    else def.draw(ctx, left, top, time || 0);
    ctx.restore();
    return {
      x: left,
      y: top,
      w: size.w,
      h: size.h,
      cx: cx,
      feet: top + size.h,
      chimney: def.chimney ? { x: left + def.chimney.x, y: top + def.chimney.y } : null
    };
  }

  function hill(ctx, x, foot, width, height, color) {
    for (var i = 0; i < width; i++) {
      var t = i / (width - 1);
      var rise = Math.round(Math.sin(t * Math.PI) * height);
      ctx.fillStyle = color;
      ctx.fillRect(x + i, foot - rise, 1, rise + (H + BLEED - foot));
    }
  }

  function stalk(ctx, x, y0, y1, amp, turns) {
    var span = Math.max(1, y0 - y1);
    for (var i = 0; i <= span; i++) {
      var t = i / span;
      var px = Math.round(x + Math.sin(t * Math.PI * turns) * amp);
      var py = y0 - i;
      box(ctx, px, py, 7, 2, '#145C30');
      box(ctx, px + 2, py, 3, 2, '#3FA34D');
      box(ctx, px + 3, py, 1, 2, '#C6F09A');
      if (i > 10 && i % 16 === 0) {
        var leftLeaf = Math.cos(t * Math.PI * turns) < 0;
        var lx = leftLeaf ? px - 14 : px + 7;
        box(ctx, lx, py - 3, 14, 5, '#217A3A');
        box(ctx, lx + (leftLeaf ? 0 : 6), py - 6, 8, 4, '#8ED36A');
      }
    }
  }

  function fallsColumn(ctx, x, y, w, hgt) {
    box(ctx, x, y, w, hgt, '#67C6DE');
    box(ctx, x, y, 2, hgt, '#F4FCFF');
    box(ctx, x + w - 2, y, 2, hgt, '#2E7F99');
    for (var i = 0; i < hgt; i += 3) box(ctx, x + (i % (w - 2)), y + i, 2, 1, '#F7FDFF');
  }

  function wall(ctx, x, y, cols, rowCount) {
    for (var r = 0; r < rowCount; r++) {
      for (var c = 0; c < cols; c++) {
        var ox = (r % 2) * 5;
        box(ctx, x + ox + c * 11, y + r * 7, 10, 6, ((c + r) % 2) ? '#9AA4B0' : '#D5DEE6');
        box(ctx, x + ox + c * 11, y + r * 7 + 5, 10, 1, '#66717C');
      }
    }
  }

  function flowers(ctx, x, y, n) {
    var colors = ['#FF5D8F', '#FFD166', '#FFFFFF', '#C77DFF', '#FF8A5B'];
    for (var i = 0; i < n; i++) {
      box(ctx, x + i * 8, y, 1, 5, '#1B6B32');
      box(ctx, x + i * 8 - 1, y - 2, 3, 3, colors[i % colors.length]);
    }
  }

  function skyBands(ctx, bands) {
    for (var i = 0; i < bands.length; i++) {
      var band = bands[i];
      box(ctx, -BLEED, band.y, W + BLEED * 2, band.h, band.a);
      ctx.fillStyle = band.b;
      for (var y = band.y; y < band.y + band.h; y += 2) {
        var start = -BLEED + (y & 1);
        for (var x = start; x < W + BLEED; x += 2) ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  function stars(ctx, seed, count) {
    var s = seed >>> 0;
    for (var i = 0; i < count; i++) {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      var x = s % W;
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      var y = s % 90;
      box(ctx, x, y, (i % 4 === 0) ? 2 : 1, (i % 4 === 0) ? 2 : 1, '#FFF6D0');
    }
  }

  function beginLayer(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.setTransform(1, 0, 0, 1, BLEED, BLEED);
  }

  function paintGarden(sky, world, meta) {
    skyBands(sky, [
      { y: -BLEED, h: 36, a: '#7ED6F8', b: '#B7EBFF' },
      { y: 26, h: 40, a: '#9FE3FB', b: '#D7F4FF' },
      { y: 66, h: 50, a: '#C8F0FF', b: '#EAF9FF' }
    ]);
    disc(sky, 46, 30, 14, '#FFE38A');
    disc(sky, 46, 30, 8, '#FFF8D2');
    hill(world, -20, 132, 180, 28, '#7FBF63');
    hill(world, 90, 146, 260, 36, '#4E9A45');
    box(world, 118, 146, 36, 20, '#C4A574');
    box(world, 124, 150, 8, 16, '#A68455');
    wall(world, 168, 124, 6, 3);
    flowers(world, 16, 156, 8);
    flowers(world, 210, 158, 6);
    meta.clouds = 'day';
    meta.grass = true;
    meta.grassY = 162;
    meta.path = { x: 118, w: 36 };
  }

  function paintNight(sky, world, meta) {
    skyBands(sky, [
      { y: -BLEED, h: 70, a: '#12183A', b: '#1C2754' },
      { y: 60, h: 50, a: '#24325F', b: '#31467A' }
    ]);
    stars(sky, 42, 36);
    hill(world, -10, 140, 200, 26, '#1C3A32');
    hill(world, 120, 150, 230, 30, '#163228');
    drawCottage(world, 18, 78, 0);
    stalk(world, 168, 168, 4, 26, 3.2);
    wall(world, 108, 132, 4, 2);
    meta.clouds = 'night';
    meta.grass = true;
    meta.grassY = 164;
    meta.chimney = { x: 18 + 64, y: 78 + 2 };
  }

  function paintClimb(sky, world, meta) {
    skyBands(sky, [
      { y: -BLEED, h: 50, a: '#49C6EA', b: '#8FE0F6' },
      { y: 40, h: 70, a: '#B7EFFB', b: '#E7FAFF' }
    ]);
    box(world, -BLEED, 150, W + BLEED * 2, 40, '#3E8C46');
    box(world, 20, 146, 40, 8, '#2F6B38');
    stalk(world, 150, 176, -6, 18, 2.4);
    box(world, 176, 78, 120, 16, '#F7FBFF');
    box(world, 190, 70, 80, 10, '#FFFFFF');
    box(world, 186, 92, 100, 6, '#E7C85A');
    box(world, 196, 94, 80, 2, '#FFF1A8');
    fallsColumn(world, 286, 90, 10, 70);
    meta.clouds = 'day';
    meta.grass = false;
    meta.falls = [{ x: 286, y: 90, w: 10, h: 70 }];
  }

  function paintHall(sky, world, meta) {
    skyBands(sky, [
      { y: -BLEED, h: 80, a: '#CDB4DB', b: '#E8C8F0' },
      { y: 70, h: 40, a: '#F3D6E8', b: '#FBE7F1' }
    ]);
    box(world, -BLEED, 24, W + BLEED * 2, 120, '#7A4030');
    box(world, -BLEED, 24, W + BLEED * 2, 8, '#C45A48');
    box(world, 18, 36, 36, 48, '#8FD4F0');
    box(world, 266, 36, 36, 48, '#8FD4F0');
    fallsColumn(world, 30, 40, 8, 40);
    fallsColumn(world, 278, 40, 8, 40);
    box(world, 70, 36, 28, 90, '#E7C56A');
    box(world, 222, 36, 28, 90, '#E7C56A');
    box(world, 78, 44, 12, 70, '#FFF0B0');
    box(world, 230, 44, 12, 70, '#FFF0B0');
    box(world, -BLEED, 128, W + BLEED * 2, 70, '#E2B03E');
    for (var y = 128; y < H + BLEED; y += 2) {
      for (var x = -BLEED; x < W + BLEED; x += 2) {
        if (((x + y) & 3) === 0) box(world, x, y, 1, 1, '#C4882E');
      }
    }
    box(world, 108, 108, 104, 10, '#8A5A32');
    box(world, 112, 100, 96, 8, '#A56B3C');
    box(world, 40, 28, 8, 22, '#E23D4A');
    box(world, 250, 28, 8, 22, '#2F6FE0');
    meta.clouds = 'none';
    meta.grass = false;
    meta.falls = [{ x: 30, y: 40, w: 8, h: 40 }, { x: 278, y: 40, w: 8, h: 40 }];
  }

  function paintHome(sky, world, meta) {
    skyBands(sky, [
      { y: -BLEED, h: 34, a: '#F6C98A', b: '#FFE0A8' },
      { y: 24, h: 40, a: '#F7D7A2', b: '#BFE7F8' },
      { y: 64, h: 40, a: '#C8F0FF', b: '#EAF9FF' }
    ]);
    disc(sky, 270, 28, 12, '#FFE38A');
    hill(world, -20, 136, 200, 30, '#8FCB6A');
    hill(world, 100, 148, 250, 34, '#4E9A45');
    drawCottage(world, 196, 76, 0);
    stalk(world, 150, 168, 70, 10, 1.4);
    box(world, 36, 140, 28, 8, '#8A5A32');
    box(world, 40, 132, 8, 4, '#F3D2A0');
    box(world, 52, 132, 8, 4, '#FFD15C');
    flowers(world, 8, 158, 5);
    flowers(world, 250, 158, 6);
    meta.clouds = 'day';
    meta.grass = true;
    meta.grassY = 164;
    meta.chimney = { x: 196 + 64, y: 76 + 2 };
  }

  var PAINTERS = {
    garden: paintGarden,
    night: paintNight,
    climb: paintClimb,
    hall: paintHall,
    home: paintHome
  };

  function mount(root, book) {
    if (!root || !book || !book.pages || !book.pages.length) return;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var packed = book.defaultPack.slice();
    try {
      var saved = JSON.parse(sessionStorage.getItem('beanstalk-pack') || 'null');
      if (saved && saved.length && saved.every(function (id) { return book.gear.some(function (g) { return g.id === id; }); })) {
        packed = saved.slice(0, 2);
      }
    } catch (err) { /* keep the default pack */ }

    root.innerHTML = ''
      + '<div id="stage-wrap">'
      + '  <header>'
      + '    <a class="hud-btn" href="index.html">Library</a>'
      + '    <div class="backpack-bar">Adventure Gear'
      + '      <button type="button" class="pack-slot" id="slot-0"></button>'
      + '      <button type="button" class="pack-slot" id="slot-1"></button>'
      + '    </div>'
      + '  </header>'
      + '  <div class="story-card">'
      + '    <button type="button" class="nav-arrow" id="prev-btn" aria-label="Previous page">&#9664;</button>'
      + '    <div class="story-content">'
      + '      <div class="story-toolbar">'
      + '        <button type="button" class="read-btn" id="read-btn">Read to Me</button>'
      + '        <span class="page-indicator" id="page-num"></span>'
      + '      </div>'
      + '      <div class="sentence-box" id="sentence-box"></div>'
      + '    </div>'
      + '    <button type="button" class="nav-arrow" id="next-btn" aria-label="Next page">&#9654;</button>'
      + '  </div>'
      + '  <div class="pixel-frame" id="pixel-frame">'
      + '    <div class="pixel-screen" id="pixel-screen">'
      + '      <canvas class="scene" id="scene-canvas" width="320" height="180"></canvas>'
      + '      <canvas class="sprites" id="sprite-canvas" width="320" height="180"></canvas>'
      + '      <div id="label-layer"></div>'
      + '      <div id="overlay-layer"></div>'
      + '      <div id="bubble-layer"></div>'
      + '      <div id="fx-flash"></div>'
      + '    </div>'
      + '  </div>'
      + '</div>';

    var audioEl = document.createElement('audio');
    audioEl.id = 'page-audio';
    audioEl.preload = 'auto';
    root.appendChild(audioEl);

    var sceneCanvas = document.getElementById('scene-canvas');
    var spriteCanvas = document.getElementById('sprite-canvas');
    var sceneCtx = sceneCanvas.getContext('2d');
    var spriteCtx = spriteCanvas.getContext('2d');
    var screen = document.getElementById('pixel-screen');
    var skyLayer = makeLayer();
    var worldLayer = makeLayer();

    var pageIndex = 0;
    var hotspots = [];
    var placed = [];
    var labelKey = '';
    var labelEls = {};
    var particles = [];
    var live = { clouds: 'none', grass: false, grassY: 160, path: null, chimney: null, falls: [] };
    var cloudPuffs = [
      { base: 10, y: 16, w: 48, speed: 7 },
      { base: 140, y: 28, w: 62, speed: 4.5 },
      { base: 230, y: 12, w: 40, speed: 9 }
    ];
    var parallax = { x: 0, y: 0 };
    var target = { x: 0, y: 0 };
    var pointerAt = 0;
    var catalogPromise = null;
    var artToken = 0;
    var pageToken = 0;
    var currentWords = [];
    var demoTimers = [];
    var isPlaying = false;
    var wordStop = null;
    var audioCtx = null;
    var smokeClock = 0;
    var raf = 0;
    var last = performance.now();
    var paintings = { sky: null, world: null };

    function makeLayer() {
      var canvas = document.createElement('canvas');
      canvas.width = W + BLEED * 2;
      canvas.height = H + BLEED * 2;
      var ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      return { canvas: canvas, ctx: ctx };
    }

    function savePack() {
      try { sessionStorage.setItem('beanstalk-pack', JSON.stringify(packed)); } catch (err) {}
    }

    function getCatalog() {
      if (!catalogPromise) {
        catalogPromise = fetch(book.paintingCatalog)
          .then(function (res) { return res.ok ? res.json() : {}; })
          .catch(function () { return {}; });
      }
      return catalogPromise;
    }

    function loadImage(src) {
      return new Promise(function (resolve) {
        var img = new Image();
        img.onload = function () { resolve(img); };
        img.onerror = function () { resolve(null); };
        img.src = src;
      });
    }

    function cover(ctx, img) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    function paintLayers(page) {
      var meta = { clouds: 'none', grass: false, grassY: 160, path: null, chimney: null, falls: [] };
      if (!paintings.sky) beginLayer(skyLayer.ctx);
      if (!paintings.world) beginLayer(worldLayer.ctx);
      if (paintings.sky) cover(skyLayer.ctx, paintings.sky);
      if (paintings.world) cover(worldLayer.ctx, paintings.world);
      var painter = PAINTERS[page.scene] || paintGarden;
      if (!paintings.sky || !paintings.world) painter(paintings.sky ? noopCtx(skyLayer.ctx) : skyLayer.ctx, paintings.world ? noopCtx(worldLayer.ctx) : worldLayer.ctx, meta);
      if (paintings.sky) meta.clouds = meta.clouds;
      live = meta;
      particles = particles.filter(function (p) { return p.kind === 'burst'; });
    }

    function noopCtx(real) {
      return {
        canvas: real.canvas,
        fillStyle: '#000',
        fillRect: function () {},
        setTransform: function () {},
        clearRect: function () {},
        save: function () {},
        restore: function () {},
        translate: function () {},
        rotate: function () {},
        drawImage: function () {},
        imageSmoothingEnabled: false
      };
    }

    function prepareArt(page) {
      paintings = { sky: null, world: null };
      paintLayers(page);
      var token = ++artToken;
      getCatalog().then(function (catalog) {
        if (token !== artToken) return null;
        var skyKey = 'p' + page.id + '-sky';
        var worldKey = 'p' + page.id + '-world';
        var jobs = [];
        jobs.push(catalog[skyKey] === true ? loadImage(book.imageDir + skyKey + '.png') : Promise.resolve(null));
        jobs.push(catalog[worldKey] === true ? loadImage(book.imageDir + worldKey + '.png') : Promise.resolve(null));
        return Promise.all(jobs);
      }).then(function (imgs) {
        if (!imgs || token !== artToken) return;
        if (!imgs[0] && !imgs[1]) return;
        paintings = { sky: imgs[0], world: imgs[1] };
        paintLayers(page);
      }).catch(function () {});
    }

    function buildHotspots(page) {
      var list = page.hotspots.map(function (h) {
        return Object.assign({ phase: Math.random() * Math.PI * 2, animStart: 0 }, h);
      });
      if (page.castle) {
        packed.forEach(function (id, index) {
          var gear = book.gear.find(function (g) { return g.id === id; });
          if (!gear) return;
          list.push({
            id: 'packed-' + gear.id,
            sprite: gear.sprite,
            label: gear.name,
            x: 0.28 + index * 0.2,
            y: 0.58,
            anchor: 'center',
            magic: gear.sfx === 'magic',
            anim: 'spin',
            sfx: gear.sfx,
            msg: gear.msg,
            phase: index,
            animStart: 0
          });
        });
      }
      return list;
    }

    function generateNaturalWordTimings(text, totalAudioDuration) {
      var rawWords = text.trim().split(/\s+/);
      var weights = rawWords.map(function (w) {
        var cleanLen = w.replace(/[^a-zA-Z]/g, '').length || 2;
        var speakWeight = 1.0 + (cleanLen * 0.22);
        var pauseWeight = 0.08;
        if (w.endsWith(',')) pauseWeight = 0.75;
        else if (w.endsWith('!') || w.endsWith('.')) pauseWeight = 1.35;
        return { word: w, speakWeight: speakWeight, pauseWeight: pauseWeight, total: speakWeight + pauseWeight };
      });
      var sumWeights = weights.reduce(function (acc, item) { return acc + item.total; }, 0);
      var targetSpan = totalAudioDuration ? Math.max(1.5, totalAudioDuration - 0.22) : sumWeights * 0.23;
      var scale = targetSpan / sumWeights;
      var cursor = 0.08;
      return weights.map(function (item) {
        var start = Number(cursor.toFixed(2));
        var speakDuration = item.speakWeight * scale;
        var end = Number((start + speakDuration).toFixed(2));
        cursor += item.total * scale;
        return { word: item.word, start: start, end: end };
      });
    }

    function bindWords() {
      var sentence = document.getElementById('sentence-box');
      sentence.innerHTML = '';
      currentWords.forEach(function (word, idx) {
        var span = document.createElement('span');
        span.className = 'story-word';
        span.id = 'word-' + idx;
        span.textContent = word.word;
        span.addEventListener('click', function () { playSingleWord(idx); });
        sentence.appendChild(span);
      });
    }

    function highlightWord(idx) {
      var nodes = document.querySelectorAll('.story-word');
      for (var i = 0; i < nodes.length; i++) nodes[i].classList.toggle('highlight', i === idx);
    }

    function stopNarration() {
      isPlaying = false;
      demoTimers.forEach(function (t) { clearTimeout(t); });
      demoTimers = [];
      audioEl.pause();
      if (wordStop) {
        audioEl.removeEventListener('timeupdate', wordStop);
        wordStop = null;
      }
      highlightWord(-1);
      var btn = document.getElementById('read-btn');
      if (btn) {
        btn.classList.remove('playing');
        btn.textContent = 'Read to Me';
      }
    }

    function armAudio(page) {
      var token = ++pageToken;
      audioEl.onloadedmetadata = function () {
        if (token !== pageToken) return;
        if (audioEl.duration && isFinite(audioEl.duration)) {
          currentWords = generateNaturalWordTimings(page.text, audioEl.duration);
        }
      };
      if (page.hasAudio) audioEl.src = page.audio;
      else audioEl.removeAttribute('src');
    }

    function renderSlots() {
      for (var i = 0; i < 2; i++) {
        var slot = document.getElementById('slot-' + i);
        slot.innerHTML = '';
        var gear = book.gear.find(function (g) { return g.id === packed[i]; });
        if (!gear) continue;
        var canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 40;
        var ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        paintSprite(ctx, gear.sprite, 20, 36, 0, { anchor: 'feet' }, 2);
        slot.appendChild(canvas);
        slot.setAttribute('aria-label', gear.name);
      }
    }

    function renderGearTray(page) {
      var layer = document.getElementById('overlay-layer');
      layer.innerHTML = '';
      if (!page.gearSelect) return;
      var tray = document.createElement('div');
      tray.className = 'gear-tray';
      var title = document.createElement('div');
      title.className = 'gear-title';
      title.textContent = 'Tap 2 items to pack for the climb!';
      var grid = document.createElement('div');
      grid.className = 'gear-grid';
      book.gear.forEach(function (gear) {
        var card = document.createElement('button');
        card.type = 'button';
        card.className = 'gear-card' + (packed.indexOf(gear.id) >= 0 ? ' selected' : '');
        var canvas = document.createElement('canvas');
        canvas.width = 48;
        canvas.height = 48;
        canvas.className = 'gear-pixel';
        var ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        paintSprite(ctx, gear.sprite, 24, 44, 0, { anchor: 'feet' }, 2);
        var name = document.createElement('div');
        name.className = 'gear-name';
        name.textContent = gear.name;
        card.appendChild(canvas);
        card.appendChild(name);
        card.addEventListener('click', function () { toggleGear(gear.id); });
        grid.appendChild(card);
      });
      tray.appendChild(title);
      tray.appendChild(grid);
      layer.appendChild(tray);
    }

    function toggleGear(id) {
      if (packed.indexOf(id) >= 0) {
        if (packed.length > 1) packed = packed.filter(function (item) { return item !== id; });
      } else {
        if (packed.length >= 2) packed.shift();
        packed.push(id);
      }
      savePack();
      playSound('chime');
      renderSlots();
      renderGearTray(book.pages[pageIndex]);
      if (book.pages[pageIndex].castle) {
        hotspots = buildHotspots(book.pages[pageIndex]);
        labelKey = '';
      }
    }

    function showPage(index) {
      stopNarration();
      pageIndex = index;
      var page = book.pages[pageIndex];
      hotspots = buildHotspots(page);
      labelKey = '';
      particles = [];
      prepareArt(page);
      currentWords = generateNaturalWordTimings(page.text, null);
      bindWords();
      document.getElementById('page-num').textContent = 'Page ' + (pageIndex + 1) + ' of ' + book.pages.length + ' · Tap any word or picture!';
      document.getElementById('prev-btn').disabled = pageIndex === 0;
      document.getElementById('next-btn').disabled = pageIndex === book.pages.length - 1;
      renderGearTray(page);
      renderSlots();
      armAudio(page);
    }

    function changePage(dir) {
      var next = pageIndex + dir;
      if (next < 0 || next >= book.pages.length) return;
      playSound('chime');
      showPage(next);
    }

    function initAudio() {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    }

    function tone(type, freq, when, dur, gainVal) {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, when);
      gain.gain.setValueAtTime(gainVal, when);
      gain.gain.exponentialRampToValueAtTime(0.001, when + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(when);
      osc.stop(when + dur);
      return osc;
    }

    function noise(when, dur, freq, gainVal) {
      var frames = Math.max(1, Math.floor(audioCtx.sampleRate * dur));
      var buffer = audioCtx.createBuffer(1, frames, audioCtx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
      var src = audioCtx.createBufferSource();
      var filter = audioCtx.createBiquadFilter();
      var gain = audioCtx.createGain();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq, when);
      gain.gain.setValueAtTime(gainVal, when);
      src.buffer = buffer;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      src.start(when);
    }

    function playSound(type, customFreq) {
      initAudio();
      var now = audioCtx.currentTime;
      if (type === 'word-pluck') {
        tone('sine', customFreq || 523.25, now, 0.14, 0.18);
      } else if (type === 'magic' || type === 'harp' || type === 'chime') {
        var notes = type === 'harp' ? [523, 659, 784, 1046, 1318] : (type === 'chime' ? [659, 880] : [587, 784, 987, 1174]);
        notes.forEach(function (freq, i) { tone('triangle', freq, now + i * 0.06, 0.3, 0.22); });
      } else if (type === 'moo' || type === 'roar') {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(type === 'roar' ? 90 : 140, now);
        osc.frequency.linearRampToValueAtTime(type === 'roar' ? 50 : 95, now + 0.45);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'jump' || type === 'hoot') {
        var jump = audioCtx.createOscillator();
        var jumpGain = audioCtx.createGain();
        jump.type = 'sine';
        jump.frequency.setValueAtTime(type === 'hoot' ? 420 : 280, now);
        jump.frequency.exponentialRampToValueAtTime(type === 'hoot' ? 260 : 620, now + 0.22);
        jumpGain.gain.setValueAtTime(0.28, now);
        jumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        jump.connect(jumpGain);
        jumpGain.connect(audioCtx.destination);
        jump.start(now);
        jump.stop(now + 0.24);
      } else if (type === 'knock') {
        noise(now, 0.08, 240, 0.4);
        noise(now + 0.12, 0.08, 180, 0.35);
      } else if (type === 'crunch') {
        noise(now, 0.18, 900, 0.35);
      } else if (type === 'flash') {
        tone('square', 880, now, 0.08, 0.12);
        noise(now, 0.12, 1800, 0.2);
      } else {
        tone('triangle', 659, now, 0.16, 0.22);
        tone('triangle', 880, now + 0.08, 0.18, 0.18);
      }
    }

    function burst(x, y, color, count) {
      for (var i = 0; i < count; i++) {
        var angle = Math.random() * Math.PI * 2;
        var speed = 18 + Math.random() * 46;
        particles.push({
          kind: 'burst',
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 12,
          life: 0.45 + Math.random() * 0.25,
          age: 0,
          color: color,
          size: Math.random() < 0.4 ? 2 : 1
        });
      }
    }

    function spawnBubble(x, y, text) {
      var layer = document.getElementById('bubble-layer');
      layer.innerHTML = '';
      var el = document.createElement('div');
      el.className = 'fx-bubble';
      el.textContent = text;
      el.style.left = (x / W * screen.clientWidth) + 'px';
      el.style.top = (y / H * screen.clientHeight) + 'px';
      layer.appendChild(el);
      setTimeout(function () { if (el.parentNode) el.remove(); }, 1150);
    }

    function feedback(sfx, msg, x, y) {
      playSound(sfx);
      var color = sfx === 'magic' || sfx === 'harp' ? '#FFD15C' : (sfx === 'flash' ? '#FFF6D2' : '#F4FBFF');
      burst(x, y, color, 16);
      spawnBubble(x, y - 8, msg);
      if (sfx === 'flash') {
        var flash = document.getElementById('fx-flash');
        flash.classList.remove('on');
        void flash.offsetWidth;
        flash.classList.add('on');
      }
      if (sfx === 'roar' || sfx === 'knock') {
        screen.classList.remove('shake');
        void screen.offsetWidth;
        screen.classList.add('shake');
      }
    }

    function activate(hit) {
      var now = performance.now() / 1000;
      hit.hotspot.animStart = now;
      feedback(hit.hotspot.sfx, hit.hotspot.msg, hit.cx, hit.y + 8);
    }

    function playPageNarration() {
      if (isPlaying) {
        stopNarration();
        return;
      }
      stopNarration();
      isPlaying = true;
      var page = book.pages[pageIndex];
      var btn = document.getElementById('read-btn');
      btn.classList.add('playing');
      btn.textContent = 'Reading...';
      var startDemo = function () {
        var scale = [523.25, 587.33, 659.25, 783.99, 880, 783.99, 659.25, 587.33];
        currentWords.forEach(function (word, idx) {
          demoTimers.push(setTimeout(function () {
            highlightWord(idx);
            playSound('word-pluck', scale[idx % scale.length]);
          }, word.start * 1000));
        });
        var lastEnd = currentWords[currentWords.length - 1].end;
        demoTimers.push(setTimeout(stopNarration, lastEnd * 1000 + 250));
      };
      if (!page.hasAudio) {
        startDemo();
        return;
      }
      audioEl.currentTime = 0;
      audioEl.play().then(function () {
        if (audioEl.duration && isFinite(audioEl.duration)) {
          currentWords = generateNaturalWordTimings(page.text, audioEl.duration);
        }
        var sync = function () {
          if (!isPlaying) return;
          var t = audioEl.currentTime;
          var active = -1;
          for (var i = 0; i < currentWords.length; i++) {
            var nextStart = currentWords[i + 1] ? currentWords[i + 1].start : currentWords[i].end + 0.2;
            if (t >= currentWords[i].start && t < nextStart) active = i;
          }
          highlightWord(active);
          if (!audioEl.paused && !audioEl.ended) requestAnimationFrame(sync);
        };
        requestAnimationFrame(sync);
        audioEl.onended = stopNarration;
      }).catch(startDemo);
    }

    function playSingleWord(idx) {
      stopNarration();
      var page = book.pages[pageIndex];
      var word = currentWords[idx];
      if (!word) return;
      highlightWord(idx);
      if (!page.hasAudio) {
        playSound('chime');
        setTimeout(function () { highlightWord(-1); }, Math.max(400, (word.end - word.start) * 1000));
        return;
      }
      audioEl.currentTime = word.start;
      audioEl.play().then(function () {
        wordStop = function () {
          if (audioEl.currentTime >= word.end) {
            audioEl.pause();
            audioEl.removeEventListener('timeupdate', wordStop);
            wordStop = null;
            highlightWord(-1);
          }
        };
        audioEl.addEventListener('timeupdate', wordStop);
      }).catch(function () {
        playSound('chime');
        setTimeout(function () { highlightWord(-1); }, 500);
      });
    }

    function eventToPixel(e) {
      var rect = spriteCanvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) / rect.width * W,
        y: (e.clientY - rect.top) / rect.height * H
      };
    }

    function hitTest(x, y) {
      for (var i = placed.length - 1; i >= 0; i--) {
        var hit = placed[i];
        var pad = 8;
        if (x >= hit.x - pad && x <= hit.x + hit.w + pad && y >= hit.y - pad && y <= hit.y + hit.h + pad) return hit;
      }
      return null;
    }

    function fit() {
      var frame = document.getElementById('pixel-frame');
      if (!frame) return;
      var cs = window.getComputedStyle(frame);
      var fw = frame.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      var fh = frame.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      if (fw < 40 || fh < 40) return;
      var ratio = 16 / 9;
      var w = fw;
      var h = Math.floor(w / ratio);
      if (h > fh) {
        h = fh;
        w = Math.floor(h * ratio);
      }
      screen.style.width = w + 'px';
      screen.style.height = h + 'px';
    }

    function syncLabels() {
      var key = hotspots.map(function (h) { return h.id; }).join('|');
      if (key === labelKey) return;
      labelKey = key;
      var layer = document.getElementById('label-layer');
      layer.innerHTML = '';
      labelEls = {};
      hotspots.forEach(function (h) {
        var el = document.createElement('div');
        el.className = 'px-label';
        el.textContent = h.label;
        layer.appendChild(el);
        labelEls[h.id] = el;
      });
    }

    function placeLabels() {
      var sx = screen.clientWidth / W;
      var sy = screen.clientHeight / H;
      placed.forEach(function (hit) {
        var el = labelEls[hit.hotspot.id];
        if (!el) return;
        el.style.left = (hit.cx * sx) + 'px';
        el.style.top = (hit.y * sy) + 'px';
      });
    }

    function drawCloud(ctx, x, y, w, night) {
      var fill = night ? '#465274' : '#F7FBFF';
      var shade = night ? '#2C3654' : '#D5E4F2';
      box(ctx, x, y, w, 6, fill);
      box(ctx, x + 4, y - 4, w - 12, 5, fill);
      box(ctx, x + 2, y + 6, w - 6, 3, shade);
    }

    function updateParticles(dt) {
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.age += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.kind === 'smoke') p.vx += Math.sin(p.age * 3) * 2 * dt;
        if (p.kind === 'burst' || p.kind === 'drop') p.vy += 40 * dt;
        if (p.age >= p.life) particles.splice(i, 1);
      }
    }

    function spawnAmbient(dt, time) {
      if (particles.length > 220) return;
      smokeClock += dt;
      var chimney = null;
      for (var i = 0; i < placed.length; i++) {
        if (placed[i].chimney) chimney = placed[i].chimney;
      }
      if (!chimney && live.chimney) {
        var smokeShift = worldShift();
        chimney = { x: live.chimney.x + smokeShift.x, y: live.chimney.y + smokeShift.y };
      }
      if (chimney && smokeClock > 0.28) {
        smokeClock = 0;
        particles.push({ kind: 'smoke', x: chimney.x, y: chimney.y, vx: (Math.random() - 0.5) * 8, vy: -16, life: 1.5, age: 0, size: 2 });
      }
      if (live.falls) {
        live.falls.forEach(function (fall) {
          particles.push({
            kind: 'drop',
            x: fall.x + Math.random() * fall.w + worldShift(time).x,
            y: fall.y + Math.random() * fall.h,
            vx: 0,
            vy: 30 + Math.random() * 20,
            life: 0.45,
            age: 0,
            color: '#F4FCFF',
            size: 1
          });
        });
      }
      hotspots.forEach(function (h) {
        if (!h.magic || Math.random() > 0.35) return;
        var spot = null;
        for (var s = 0; s < placed.length; s++) if (placed[s].hotspot === h) spot = placed[s];
        if (!spot) return;
        particles.push({
          kind: 'spark',
          x: spot.x + Math.random() * spot.w,
          y: spot.y + Math.random() * spot.h,
          vx: 0,
          vy: -8,
          life: 0.6,
          age: 0,
          size: 2
        });
      });
    }

    function worldShift() {
      return {
        x: Math.round(-parallax.x * 6),
        y: Math.round(-parallax.y * 3)
      };
    }

    function drawScene(time) {
      sceneCtx.imageSmoothingEnabled = false;
      sceneCtx.clearRect(0, 0, W, H);
      var skyShiftX = clamp(BLEED + Math.round(parallax.x * 3), 0, BLEED * 2);
      var skyShiftY = clamp(BLEED + Math.round(parallax.y * 2), 0, BLEED * 2);
      var worldShiftX = clamp(BLEED + Math.round(parallax.x * 6), 0, BLEED * 2);
      var worldShiftY = clamp(BLEED + Math.round(parallax.y * 3), 0, BLEED * 2);
      sceneCtx.drawImage(skyLayer.canvas, skyShiftX, skyShiftY, W, H, 0, 0, W, H);
      if (live.clouds !== 'none' && !reduce) {
        cloudPuffs.forEach(function (puff) {
          var x = ((puff.base + time * puff.speed) % (W + puff.w)) - puff.w;
          x += Math.round(-parallax.x * 4);
          drawCloud(sceneCtx, x, puff.y, puff.w, live.clouds === 'night');
        });
      }
      sceneCtx.drawImage(worldLayer.canvas, worldShiftX, worldShiftY, W, H, 0, 0, W, H);
      var shift = worldShift();
      if (live.grass && !reduce) {
        for (var x = 0; x < W; x += 3) {
          if (live.path && x > live.path.x && x < live.path.x + live.path.w) continue;
          var sway = Math.round(Math.sin(time * 2 + x * 0.35) * 1);
          var tall = 3 + (x % 5);
          sceneCtx.fillStyle = (x % 2) ? '#8ED36A' : '#217A3A';
          sceneCtx.fillRect(x + shift.x + sway, live.grassY + shift.y - tall, 1, tall);
        }
      }
      if (live.falls) {
        live.falls.forEach(function (fall) {
          for (var i = 0; i < fall.h; i += 2) {
            var drift = Math.floor((time * 28 + i) % Math.max(2, fall.w));
            sceneCtx.fillStyle = '#F7FDFF';
            sceneCtx.fillRect(fall.x + shift.x + drift, fall.y + shift.y + i, 1, 1);
          }
        });
      }
    }

    function drawSprites(time) {
      spriteCtx.imageSmoothingEnabled = false;
      spriteCtx.clearRect(0, 0, W, H);
      var shiftX = Math.round(-parallax.x * 8);
      var shiftY = Math.round(-parallax.y * 4);
      var hideScenery = !!paintings.world;
      placed = [];
      var ordered = hotspots.slice().sort(function (a, b) { return a.y - b.y; });
      ordered.forEach(function (hotspot) {
        var bob = 0;
        var sway = 0;
        var angle = 0;
        var def = SPRITES[hotspot.sprite];
        var idle = def ? def.idle : 'still';
        if (!reduce && idle === 'bob') bob = Math.sin(time * 2.2 + hotspot.phase) * 1.5;
        if (!reduce && idle === 'sway') sway = Math.sin(time * 1.7 + hotspot.phase) * 1.4;
        if (hotspot.animStart) {
          var p = (time - hotspot.animStart) / 0.55;
          if (p >= 0 && p < 1) {
            if (hotspot.anim === 'bounce') bob -= Math.sin(p * Math.PI) * 8;
            if (hotspot.anim === 'shake') sway += Math.sin(p * Math.PI * 6) * 3;
            if (hotspot.anim === 'spin') angle = p * Math.PI * 2;
          }
        }
        var ax = hotspot.x * W + shiftX + sway;
        var ay = hotspot.y * H + shiftY + bob;
        if (hideScenery && hotspot.scenery) {
          placed.push({ hotspot: hotspot, x: ax - 36, y: ay - 64, w: 72, h: 64, cx: ax, yTop: ay - 64, chimney: null });
          return;
        }
        var bounds = paintSprite(spriteCtx, hotspot.sprite, ax, ay, time, { angle: angle, anchor: hotspot.anchor });
        if (!bounds) return;
        placed.push({
          hotspot: hotspot,
          x: bounds.x,
          y: bounds.y,
          w: bounds.w,
          h: bounds.h,
          cx: bounds.cx,
          chimney: bounds.chimney
        });
      });
      particles.forEach(function (p) {
        var alpha = 1 - p.age / p.life;
        if (alpha <= 0) return;
        if (p.kind === 'smoke') {
          var size = 2 + Math.floor(p.age * 4);
          spriteCtx.fillStyle = 'rgba(226,226,232,' + (alpha * 0.85) + ')';
          spriteCtx.fillRect(p.x | 0, p.y | 0, size, size);
        } else if (p.kind === 'spark') {
          spriteCtx.globalAlpha = alpha;
          spriteCtx.fillStyle = (Math.floor(p.age * 12) % 2) ? '#FFF6D2' : '#FFD15C';
          spriteCtx.fillRect(p.x | 0, p.y | 0, p.size, p.size);
          spriteCtx.globalAlpha = 1;
        } else {
          spriteCtx.globalAlpha = alpha;
          spriteCtx.fillStyle = p.color || '#F4FBFF';
          spriteCtx.fillRect(p.x | 0, p.y | 0, p.size || 1, p.size || 1);
          spriteCtx.globalAlpha = 1;
        }
      });
    }

    function frame(now) {
      var dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      var ease = reduce ? 1 : 0.08;
      parallax.x += (target.x - parallax.x) * ease;
      parallax.y += (target.y - parallax.y) * ease;
      var time = now / 1000;
      drawSprites(time);
      if (!reduce) spawnAmbient(dt, time);
      updateParticles(dt);
      drawScene(time);
      drawSprites(time);
      syncLabels();
      placeLabels();
      raf = requestAnimationFrame(frame);
    }

    document.getElementById('prev-btn').addEventListener('click', function () { changePage(-1); });
    document.getElementById('next-btn').addEventListener('click', function () { changePage(1); });
    document.getElementById('read-btn').addEventListener('click', playPageNarration);
    document.getElementById('slot-0').addEventListener('click', function () {
      var gear = book.gear.find(function (g) { return g.id === packed[0]; });
      if (gear) feedback(gear.sfx, gear.msg, W * 0.62, 36);
    });
    document.getElementById('slot-1').addEventListener('click', function () {
      var gear = book.gear.find(function (g) { return g.id === packed[1]; });
      if (gear) feedback(gear.sfx, gear.msg, W * 0.75, 36);
    });

    var down = null;
    spriteCanvas.addEventListener('pointerdown', function (e) {
      down = { x: e.clientX, y: e.clientY };
      pointerAt = performance.now();
      var point = eventToPixel(e);
      target.x = clamp(point.x / W * 2 - 1, -1, 1);
      target.y = clamp(point.y / H * 2 - 1, -1, 1);
    });
    spriteCanvas.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'mouse' || down) {
        pointerAt = performance.now();
        var point = eventToPixel(e);
        target.x = clamp(point.x / W * 2 - 1, -1, 1);
        target.y = clamp(point.y / H * 2 - 1, -1, 1);
        var hit = hitTest(point.x, point.y);
        spriteCanvas.style.cursor = hit ? 'pointer' : 'default';
      }
    });
    spriteCanvas.addEventListener('pointerup', function (e) {
      if (!down) return;
      var dx = e.clientX - down.x;
      var dy = e.clientY - down.y;
      down = null;
      if (dx * dx + dy * dy > 144) return;
      var point = eventToPixel(e);
      var hit = hitTest(point.x, point.y);
      if (hit) activate(hit);
    });
    spriteCanvas.addEventListener('pointerleave', function () { down = null; });

    window.addEventListener('deviceorientation', function (e) {
      if (e.gamma == null || performance.now() - pointerAt < 1200) return;
      target.x = clamp(e.gamma / 28, -1, 1);
      target.y = clamp(((e.beta || 0) - 45) / 32, -1, 1);
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') changePage(1);
      if (e.key === 'ArrowLeft') changePage(-1);
    });
    window.addEventListener('resize', fit);
    if (window.ResizeObserver) new ResizeObserver(fit).observe(document.getElementById('pixel-frame'));
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });

    fit();
    showPage(0);
    raf = requestAnimationFrame(frame);
  }

  window.DioramaEngine = { mount: mount };
})();
