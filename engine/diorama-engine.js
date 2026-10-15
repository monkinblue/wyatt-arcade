(function () {
  const W = 640;
  const H = 340;

  class ModernRetroDiorama {
    constructor() {
      this.pageIndex = 0;
      this.packed = ["treat"];
      this.clicked = new Set();
      this.tick = 0;
      this.pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      this.particles = [];
      this.bursts = [];
      this.smoke = [];
      this.worldImages = {};
      this.eggHatched = false;
      this.dragonBreathTimer = 0;
      this.doggieHopTimer = 0;
      this.helperArrow = null;
      this.audio = new Audio();
      this.wordTimer = null;
      this.audioCtx = null;

      this.setupStage();
      this.preloadPaintings();
      this.bindInputs();
      this.loadPage(0);
      requestAnimationFrame(() => this.render());
    }

    setupStage() {
      document.querySelectorAll(".hotspot-layer, .hotspot-label, .hotspot-pill, .hotspot-btn, .px-label, #label-layer").forEach((el) => el.remove());

      this.canvas = document.getElementById("diorama-canvas") || document.querySelector("canvas");
      if (!this.canvas) {
        const container = document.querySelector(".diorama-stage, .stage-frame, main") || document.body;
        this.canvas = document.createElement("canvas");
        this.canvas.id = "diorama-canvas";
        container.prepend(this.canvas);
      }
      this.canvas.width = W;
      this.canvas.height = H;
      this.canvas.style.width = "100%";
      this.canvas.style.height = "auto";
      this.canvas.style.display = "block";
      this.canvas.style.borderRadius = "14px";
      this.ctx = this.canvas.getContext("2d");

      const parent = this.canvas.parentElement;
      if (parent && getComputedStyle(parent).position === "static") {
        parent.style.position = "relative";
      }
      this.toastEl = document.getElementById("diorama-toast");
      if (!this.toastEl && parent) {
        this.toastEl = document.createElement("div");
        this.toastEl.id = "diorama-toast";
        this.toastEl.style.cssText =
          "position:absolute;bottom:14px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,0.92);color:#fef08a;padding:8px 18px;border-radius:999px;border:2px solid #fbbf24;font-weight:700;font-size:15px;pointer-events:none;opacity:0;transition:opacity 0.25s;z-index:30;box-shadow:0 8px 24px rgba(0,0,0,0.45);white-space:nowrap;max-width:92%;overflow:hidden;text-overflow:ellipsis;";
        parent.appendChild(this.toastEl);
      }
    }

    preloadPaintings() {
      (window.STORY_DATA.pages || []).forEach((p) => {
        if (p.worldImage) {
          const img = new Image();
          img.src = p.worldImage;
          this.worldImages[p.id] = img;
        }
      });
    }

    bindInputs() {
      window.addEventListener("mousemove", (e) => {
        const r = this.canvas.getBoundingClientRect();
        this.pointer.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
        this.pointer.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
      });

      window.addEventListener("deviceorientation", (e) => {
        if (e.gamma !== null) {
          this.pointer.tx = Math.max(-1, Math.min(1, e.gamma / 22));
          this.pointer.ty = Math.max(-1, Math.min(1, ((e.beta || 45) - 45) / 22));
        }
      });

      this.canvas.addEventListener("pointerdown", (e) => {
        const r = this.canvas.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * W;
        const y = ((e.clientY - r.top) / r.height) * H;
        this.onTap(x, y);
      });

      document.addEventListener("click", (e) => {
        const btn = e.target.closest("button, [data-action]");
        if (!btn) return;
        const txt = (btn.textContent || "").toLowerCase();
        const id = (btn.id || btn.className || "").toLowerCase();
        if (txt.includes("read to me") || id.includes("read") || id.includes("narrate")) {
          e.preventDefault();
          this.narrate();
        } else if (id.includes("prev") || txt === "◀" || txt === "‹" || btn.getAttribute("aria-label") === "Previous page") {
          e.preventDefault();
          this.loadPage(this.pageIndex - 1);
        } else if (id.includes("next") || txt === "▶" || txt === "›" || btn.getAttribute("aria-label") === "Next page") {
          e.preventDefault();
          this.loadPage(this.pageIndex + 1);
        }
      });
    }

    initAudio() {
      if (!this.audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AC();
      }
      if (this.audioCtx.state === "suspended") this.audioCtx.resume();
    }

    playSound(type) {
      this.initAudio();
      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const tone = (f1, f2, dur, wave = "sine", vol = 0.16, delay = 0) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = wave;
        osc.frequency.setValueAtTime(f1, now + delay);
        osc.frequency.exponentialRampToValueAtTime(Math.max(30, f2), now + delay + dur);
        gain.gain.setValueAtTime(vol, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + dur);
      };

      if (type === "squeak") {
        tone(820, 1380, 0.1, "sine", 0.22, 0);
        tone(1050, 680, 0.13, "triangle", 0.2, 0.11);
      } else if (type === "dragon_purr") {
        [196, 246.9, 293.7, 392, 493.9, 587.3].forEach((f, i) => tone(f, f * 1.06, 0.28, "sine", 0.14, i * 0.065));
      } else if (type === "harp" || type === "magic") {
        [523.3, 659.3, 784.0, 987.8, 1046.5, 1318.5].forEach((f, i) => tone(f, f * 1.01, 0.42, "sine", 0.13, i * 0.06));
      } else if (type === "moo") {
        tone(165, 128, 0.45, "sawtooth", 0.08, 0);
      } else if (type === "hatch") {
        tone(340, 960, 0.16, "triangle", 0.2, 0);
        tone(587, 1174, 0.25, "sine", 0.18, 0.14);
      } else {
        tone(520, 780, 0.16, "triangle", 0.16, 0);
      }
    }

    loadPage(idx) {
      const pages = window.STORY_DATA.pages;
      this.pageIndex = Math.max(0, Math.min(pages.length - 1, idx));
      this.clicked.clear();
      this.helperArrow = null;
      this.eggHatched = false;
      this.dragonBreathTimer = 0;

      this.particles = Array.from({ length: 52 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 1.2 + Math.random() * 2.5,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.2 - Math.random() * 0.4,
        alpha: 0.35 + Math.random() * 0.65,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.3 ? "#fef08a" : "#a7f3d0"
      }));

      this.syncPageDOM();
    }

    syncPageDOM() {
      const page = window.STORY_DATA.pages[this.pageIndex];
      document.querySelectorAll(".page-indicator, #page-title, .page-badge").forEach((el) => {
        el.textContent = page.title;
      });

      const textContainers = document.querySelectorAll("#story-text, .story-text, .story-copy, .narration-text");
      textContainers.forEach((el) => {
        el.innerHTML = page.text
          .split(" ")
          .map((w, i) => `<span class="karaoke-word" data-idx="${i}" style="padding:2px 4px;border-radius:6px;transition:background 0.15s;">${w}</span>`)
          .join(" ");
      });
    }

    narrate() {
      const page = window.STORY_DATA.pages[this.pageIndex];
      const words = document.querySelectorAll(".karaoke-word");
      clearInterval(this.wordTimer);
      this.audio.pause();

      const highlightWords = (totalMs) => {
        const step = Math.max(150, totalMs / Math.max(1, words.length));
        let i = 0;
        words.forEach((w) => (w.style.background = "transparent"));
        this.wordTimer = setInterval(() => {
          words.forEach((w) => (w.style.background = "transparent"));
          if (i < words.length) {
            words[i].style.background = "#fde047";
            words[i].style.color = "#0f172a";
            i++;
          } else {
            clearInterval(this.wordTimer);
          }
        }, step);
      };

      this.audio.src = page.audio;
      this.audio.onloadedmetadata = () => {
        const dur = (this.audio.duration || 11) * 1000;
        this.audio.play().then(() => highlightWords(dur)).catch(() => this.speakFallback(page.text, highlightWords));
      };
      this.audio.onerror = () => this.speakFallback(page.text, highlightWords);
    }

    speakFallback(text, highlightWords) {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.93;
        u.pitch = 1.08;
        highlightWords(text.split(" ").length * 330);
        window.speechSynthesis.speak(u);
      } else {
        highlightWords(10000);
      }
    }

    onTap(x, y) {
      const page = window.STORY_DATA.pages[this.pageIndex];
      const px = this.pointer.x * 14;
      const py = this.pointer.y * 7;

      for (const h of page.hotspots) {
        const hx = h.x + px;
        const hy = h.y + py;
        if (Math.hypot(x - hx, y - hy) <= (h.r || 46)) {
          this.triggerHotspot(h, hx, hy);
          return;
        }
      }
      this.spawnSparkleBurst(x, y, "#fde047", 18);
      this.playSound("default");
    }

    triggerHotspot(h, x, y) {
      this.playSound(h.sound);
      this.clicked.add(h.id);
      h.bounce = 24;
      this.spawnSparkleBurst(x, y, h.isHelper ? "#f472b6" : "#fde047", 34);

      if (h.id === "egg") this.eggHatched = true;
      if (h.id === "cloud_dragon" || h.id === "gate_dragon") this.dragonBreathTimer = 85;
      if (h.id === "chimney") {
        for (let i = 0; i < 6; i++) {
          this.smoke.push({ x: x + (Math.random() - 0.5) * 10, y: y - 10, r: 8 + i * 3, alpha: 0.75 });
        }
      }

      if (h.isHelper) {
        this.doggieHopTimer = 50;
        const page = window.STORY_DATA.pages[this.pageIndex];
        const nextSecret = page.hotspots.find((item) => !item.isHelper && !this.clicked.has(item.id));
        if (nextSecret) {
          this.helperArrow = { x: nextSecret.x, y: nextSecret.y, timer: 110 };
          this.spawnSparkleBurst(nextSecret.x, nextSecret.y, "#34d399", 26);
        }
      }

      if (this.toastEl) {
        this.toastEl.textContent = h.toast;
        this.toastEl.style.opacity = "1";
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => (this.toastEl.style.opacity = "0"), 3600);
      }
    }

    spawnSparkleBurst(x, y, color, count = 24) {
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count + Math.random() * 0.25;
        const spd = 1.2 + Math.random() * 3.2;
        this.bursts.push({
          x,
          y,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd - 0.7,
          r: 2 + Math.random() * 2.5,
          life: 32 + Math.random() * 18,
          color: i % 2 === 0 ? color : "#ffffff"
        });
      }
    }

    drawSkyAndLighting(theme, px, py) {
      const ctx = this.ctx;
      const g = ctx.createLinearGradient(0, 0, 0, H);

      if (theme === "morning_cottage") {
        g.addColorStop(0, "#1e3a8a");
        g.addColorStop(0.35, "#3b82f6");
        g.addColorStop(0.72, "#fb923c");
        g.addColorStop(1, "#fef08a");
      } else if (theme === "moonlit_vine") {
        g.addColorStop(0, "#020617");
        g.addColorStop(0.45, "#1e1b4b");
        g.addColorStop(0.8, "#312e81");
        g.addColorStop(1, "#4c1d95");
      } else if (theme === "sky_climb") {
        g.addColorStop(0, "#0284c7");
        g.addColorStop(0.5, "#38bdf8");
        g.addColorStop(0.85, "#fbcfe8");
        g.addColorStop(1, "#fef9c3");
      } else if (theme === "castle_gate") {
        g.addColorStop(0, "#3b0764");
        g.addColorStop(0.45, "#7e22ce");
        g.addColorStop(0.78, "#ec4899");
        g.addColorStop(1, "#fde047");
      } else {
        g.addColorStop(0, "#0f172a");
        g.addColorStop(0.4, "#1e1b4b");
        g.addColorStop(0.8, "#311042");
        g.addColorStop(1, "#78350f");
      }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      if (theme !== "morning_cottage") {
        for (let i = 0; i < 42; i++) {
          const sx = (i * 97 + px * 3) % W;
          const sy = (i * 53) % (H * 0.65);
          const twinkle = 0.35 + 0.65 * Math.sin(this.tick * 0.06 + i);
          ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
          ctx.beginPath();
          ctx.arc(sx, sy, i % 3 === 0 ? 2.2 : 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 4; i++) {
        const rayGrad = ctx.createLinearGradient(80 + i * 140 + px * 4, 0, 180 + i * 140 - px * 6, H);
        rayGrad.addColorStop(0, "rgba(254, 240, 138, 0.16)");
        rayGrad.addColorStop(1, "rgba(254, 240, 138, 0.0)");
        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(60 + i * 140 + px * 4, 0);
        ctx.lineTo(130 + i * 140 + px * 4, 0);
        ctx.lineTo(260 + i * 140 - px * 6, H);
        ctx.lineTo(140 + i * 140 - px * 6, H);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      this.drawCloudBank(68 + py * 2, px * 4, "rgba(255,255,255,0.28)", 0.85);
      this.drawCloudBank(115 + py * 3, px * 7, "rgba(255,247,237,0.45)", 1.1);
    }

    drawCloudBank(baseY, offsetX, color, scale) {
      const ctx = this.ctx;
      ctx.fillStyle = color;
      for (let i = -1; i < 7; i++) {
        const cx = ((i * 125 + offsetX + this.tick * 0.12) % (W + 160)) - 80;
        ctx.beginPath();
        ctx.arc(cx, baseY, 34 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 26 * scale, baseY - 10 * scale, 28 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 52 * scale, baseY, 30 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawMorningCottageScene(px, py) {
      const ctx = this.ctx;
      ctx.fillStyle = "#312e81";
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, 195 + py * 2);
      ctx.quadraticCurveTo(160 + px * 3, 115 + py * 2, 340 + px * 3, 190 + py * 2);
      ctx.quadraticCurveTo(490 + px * 3, 120 + py * 2, W, 185 + py * 2);
      ctx.lineTo(W, H);
      ctx.fill();

      const hillGrad = ctx.createLinearGradient(0, 180, 0, H);
      hillGrad.addColorStop(0, "#10b981");
      hillGrad.addColorStop(0.5, "#059669");
      hillGrad.addColorStop(1, "#064e3b");
      ctx.fillStyle = hillGrad;
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, 220 + py * 4);
      ctx.quadraticCurveTo(220 + px * 6, 175 + py * 4, 440 + px * 6, 225 + py * 4);
      ctx.quadraticCurveTo(560 + px * 6, 200 + py * 4, W, 215 + py * 4);
      ctx.lineTo(W, H);
      ctx.fill();

      ctx.fillStyle = "#d6d3d1";
      ctx.beginPath();
      ctx.moveTo(125 + px * 9, 245 + py * 5);
      ctx.quadraticCurveTo(240 + px * 11, 295 + py * 6, 360 + px * 12, H);
      ctx.lineTo(245 + px * 12, H);
      ctx.quadraticCurveTo(180 + px * 11, 290 + py * 6, 95 + px * 9, 245 + py * 5);
      ctx.fill();

      for (let i = 0; i < 12; i++) {
        const sx = 310 + i * 26 + px * 9;
        const sy = 228 + (i % 2) * 3 + py * 5;
        ctx.fillStyle = i % 2 === 0 ? "#64748b" : "#94a3b8";
        ctx.beginPath();
        ctx.roundRect(sx, sy, 24, 22, 6);
        ctx.fill();
        ctx.fillStyle = "#10b981";
        ctx.fillRect(sx + 3, sy - 2, 16, 4);
      }

      const cx = 55 + px * 8;
      const cy = 115 + py * 4;
      ctx.fillStyle = "#991b1b";
      ctx.beginPath();
      ctx.roundRect(cx + 68, cy - 42, 24, 55, 4);
      ctx.fill();
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(cx + 65, cy - 46, 30, 7);

      ctx.fillStyle = "#fef3c7";
      ctx.beginPath();
      ctx.roundRect(cx, cy + 28, 128, 102, 6);
      ctx.fill();
      ctx.strokeStyle = "#78350f";
      ctx.lineWidth = 5;
      ctx.strokeRect(cx + 2, cy + 28, 124, 100);

      const winGrad = ctx.createRadialGradient(cx + 88, cy + 68, 4, cx + 88, cy + 68, 28);
      winGrad.addColorStop(0, "#fef08a");
      winGrad.addColorStop(0.6, "#f59e0b");
      winGrad.addColorStop(1, "#78350f");
      ctx.fillStyle = winGrad;
      ctx.beginPath();
      ctx.roundRect(cx + 68, cy + 50, 38, 34, 6);
      ctx.fill();
      ctx.strokeStyle = "#451a03";
      ctx.lineWidth = 3;
      ctx.strokeRect(cx + 68, cy + 50, 38, 34);

      ctx.fillStyle = "#78350f";
      ctx.beginPath();
      ctx.roundRect(cx + 22, cy + 66, 32, 64, [16, 16, 0, 0]);
      ctx.fill();
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(cx + 47, cy + 98, 3.5, 0, Math.PI * 2);
      ctx.fill();

      const roofGrad = ctx.createLinearGradient(cx, cy - 15, cx, cy + 42);
      roofGrad.addColorStop(0, "#ea580c");
      roofGrad.addColorStop(0.5, "#b45309");
      roofGrad.addColorStop(1, "#78350f");
      ctx.fillStyle = roofGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 18, cy + 38);
      ctx.quadraticCurveTo(cx + 64, cy - 34, cx + 146, cy + 38);
      ctx.closePath();
      ctx.fill();
    }

    drawBeanstalkScene(px, py, isNight) {
      const ctx = this.ctx;
      if (isNight) {
        const mx = 520 + px * 4;
        const my = 78 + py * 2;
        const moonGlow = ctx.createRadialGradient(mx, my, 12, mx, my, 75);
        moonGlow.addColorStop(0, "rgba(254, 240, 138, 0.95)");
        moonGlow.addColorStop(0.4, "rgba(253, 224, 71, 0.35)");
        moonGlow.addColorStop(1, "rgba(253, 224, 71, 0)");
        ctx.fillStyle = moonGlow;
        ctx.beginPath();
        ctx.arc(mx, my, 75, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#fef9c3";
        ctx.beginPath();
        ctx.arc(mx, my, 32, 0, Math.PI * 2);
        ctx.fill();
      }

      const centerX = 320 + px * 9;
      for (let y = -20; y < H + 20; y += 8) {
        const wave = Math.sin(y * 0.032 - this.tick * 0.025) * 26;
        const wave2 = Math.cos(y * 0.032 - this.tick * 0.025) * 18;

        ctx.fillStyle = "#064e3b";
        ctx.beginPath();
        ctx.arc(centerX + wave - 8, y, 24, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#059669";
        ctx.beginPath();
        ctx.arc(centerX + wave, y, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(centerX + wave2 + 8, y, 13, 0, Math.PI * 2);
        ctx.fill();

        if (y % 48 === 0) {
          const dir = (y / 48) % 2 === 0 ? -1 : 1;
          ctx.fillStyle = "#34d399";
          ctx.beginPath();
          ctx.ellipse(centerX + wave + dir * 42, y, 32, 14, dir * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.fillStyle = isNight ? "#064e3b" : "rgba(255,255,255,0.85)";
      ctx.beginPath();
      ctx.ellipse(320 + px * 11, H - 12, 360, 52, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    drawCloudCastleScene(px, py, isInterior) {
      const ctx = this.ctx;
      if (!isInterior) {
        for (let w = 0; w < 2; w++) {
          const wx = (w === 0 ? 105 : 535) + px * 6;
          const wfGrad = ctx.createLinearGradient(wx, 140, wx, H);
          wfGrad.addColorStop(0, "rgba(186, 230, 253, 0.85)");
          wfGrad.addColorStop(1, "rgba(56, 189, 248, 0.15)");
          ctx.fillStyle = wfGrad;
          ctx.fillRect(wx - 22, 160 + py * 3, 44, H - 150);
        }
      }

      const cx = 320 + px * 8;
      const cy = 65 + py * 4;
      const goldGrad = ctx.createLinearGradient(cx - 180, cy, cx + 180, cy + 210);
      goldGrad.addColorStop(0, "#fef08a");
      goldGrad.addColorStop(0.5, "#f59e0b");
      goldGrad.addColorStop(1, "#b45309");
      ctx.fillStyle = goldGrad;

      ctx.beginPath();
      ctx.roundRect(cx - 175, cy + 45, 350, 175, 14);
      ctx.fill();

      ctx.beginPath();
      ctx.roundRect(cx - 205, cy + 10, 68, 210, 10);
      ctx.roundRect(cx + 137, cy + 10, 68, 210, 10);
      ctx.fill();

      ctx.fillStyle = "#4f46e5";
      ctx.beginPath();
      ctx.moveTo(cx - 215, cy + 14);
      ctx.lineTo(cx - 171, cy - 42);
      ctx.lineTo(cx - 127, cy + 14);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + 127, cy + 14);
      ctx.lineTo(cx + 171, cy - 42);
      ctx.lineTo(cx + 215, cy + 14);
      ctx.fill();

      ctx.fillStyle = isInterior ? "#1e1b4b" : "#451a03";
      ctx.beginPath();
      ctx.roundRect(cx - 85, cy + 88, 170, 132, [85, 85, 0, 0]);
      ctx.fill();
      ctx.strokeStyle = "#fde047";
      ctx.lineWidth = 4;
      ctx.stroke();

      this.drawCloudBank(298 + py * 5, px * 11, "rgba(255, 255, 255, 0.94)", 1.35);
    }

    drawDoggie(x, y, bounce) {
      const ctx = this.ctx;
      const wag = Math.sin(this.tick * 0.22) * 8;
      const earFlop = Math.sin(this.tick * 0.12) * 3;
      const hopY = this.doggieHopTimer > 0 ? Math.abs(Math.sin(this.doggieHopTimer * 0.25)) * 18 : 0;
      if (this.doggieHopTimer > 0) this.doggieHopTimer--;

      const dy = y - bounce - hopY;
      ctx.save();
      ctx.fillStyle = "rgba(15, 23, 42, 0.28)";
      ctx.beginPath();
      ctx.ellipse(x, y + 20, 22, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x - 14, dy + 4);
      ctx.quadraticCurveTo(x - 28, dy - 8 + wag, x - 24, dy - 16 + wag);
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(x, dy + 6, 18, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x - 10, dy - 3);
      ctx.quadraticCurveTo(x + 2, dy + 2, x + 12, dy - 3);
      ctx.stroke();

      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(x + 4, dy + 2, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x + 4, dy - 12, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.ellipse(x - 9, dy - 9 + earFlop, 6, 13, 0.25, 0, Math.PI * 2);
      ctx.ellipse(x + 16, dy - 9 - earFlop, 6, 13, -0.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(x, dy - 14, 2.5, 0, Math.PI * 2);
      ctx.arc(x + 10, dy - 14, 2.5, 0, Math.PI * 2);
      ctx.arc(x + 6, dy - 9, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#f472b6";
      ctx.beginPath();
      ctx.arc(x + 6, dy - 4, 3, 0, Math.PI);
      ctx.fill();
      ctx.restore();
    }

    drawCloudDragon(x, y, bounce, isBig) {
      const ctx = this.ctx;
      const s = isBig ? 1.35 : 0.82;
      const wingFlap = Math.sin(this.tick * 0.1) * 14 * s;
      const dy = y - bounce + Math.sin(this.tick * 0.06) * 5;

      ctx.save();
      const wingGrad = ctx.createLinearGradient(x - 50 * s, dy - 50 * s, x + 50 * s, dy + 10 * s);
      wingGrad.addColorStop(0, "#fde047");
      wingGrad.addColorStop(1, "#f59e0b");
      ctx.fillStyle = wingGrad;

      ctx.beginPath();
      ctx.moveTo(x - 10 * s, dy - 8 * s);
      ctx.quadraticCurveTo(x - 58 * s, dy - 48 * s + wingFlap, x - 44 * s, dy + 6 * s);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x + 10 * s, dy - 8 * s);
      ctx.quadraticCurveTo(x + 58 * s, dy - 48 * s + wingFlap, x + 44 * s, dy + 6 * s);
      ctx.closePath();
      ctx.fill();

      const bodyGrad = ctx.createRadialGradient(x, dy, 4 * s, x, dy, 38 * s);
      bodyGrad.addColorStop(0, "#34d399");
      bodyGrad.addColorStop(0.65, "#10b981");
      bodyGrad.addColorStop(1, "#047857");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(x, dy + 6 * s, 28 * s, 22 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.ellipse(x, dy + 9 * s, 18 * s, 14 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.arc(x, dy - 18 * s, 18 * s, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 4.5 * s;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x - 9 * s, dy - 30 * s);
      ctx.quadraticCurveTo(x - 18 * s, dy - 44 * s, x - 6 * s, dy - 42 * s);
      ctx.moveTo(x + 9 * s, dy - 30 * s);
      ctx.quadraticCurveTo(x + 18 * s, dy - 44 * s, x + 6 * s, dy - 42 * s);
      ctx.stroke();

      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(x - 7 * s, dy - 20 * s, 3 * s, 0, Math.PI * 2);
      ctx.arc(x + 7 * s, dy - 20 * s, 3 * s, 0, Math.PI * 2);
      ctx.fill();

      if (this.dragonBreathTimer > 0) {
        this.dragonBreathTimer--;
        this.spawnSparkleBurst(x + (Math.random() - 0.5) * 40, dy - 10 * s, "#fde047", 2);
      }
      ctx.restore();
    }

    drawHotspotProp(h, x, y, bounce) {
      const ctx = this.ctx;
      const dy = y - bounce + Math.sin(this.tick * 0.08 + h.x) * 3;

      if (!this.clicked.has(h.id)) {
        const aura = ctx.createRadialGradient(x, dy, 4, x, dy, 32);
        aura.addColorStop(0, "rgba(253, 224, 71, 0.45)");
        aura.addColorStop(1, "rgba(253, 224, 71, 0)");
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(x, dy, 32, 0, Math.PI * 2);
        ctx.fill();
      }

      if (h.type === "doggie") {
        this.drawDoggie(x, y, bounce);
      } else if (h.type === "big_dragon") {
        this.drawCloudDragon(x, y, bounce, true);
      } else if (h.type === "baby_dragon") {
        this.drawCloudDragon(x, y, bounce, false);
      } else if (h.type === "dragon_egg") {
        ctx.fillStyle = "#d97706";
        ctx.beginPath();
        ctx.ellipse(x, dy + 12, 26, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        const eggGrad = ctx.createRadialGradient(x - 5, dy - 6, 3, x, dy, 20);
        eggGrad.addColorStop(0, "#e0f2fe");
        eggGrad.addColorStop(0.5, "#38bdf8");
        eggGrad.addColorStop(1, "#0369a1");
        ctx.fillStyle = eggGrad;
        ctx.beginPath();
        ctx.ellipse(x, dy - 2, 16, 21, 0, 0, Math.PI * 2);
        ctx.fill();

        if (this.eggHatched) {
          this.drawCloudDragon(x, dy - 12, bounce, false);
        }
      } else if (h.type === "harp") {
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x - 14, dy + 18);
        ctx.lineTo(x - 14, dy - 22);
        ctx.quadraticCurveTo(x + 4, dy - 28, x + 16, dy - 12);
        ctx.quadraticCurveTo(x + 12, dy + 14, x - 14, dy + 18);
        ctx.stroke();

        ctx.strokeStyle = "#fef08a";
        ctx.lineWidth = 1.5;
        for (let s = -9; s <= 9; s += 4.5) {
          ctx.beginPath();
          ctx.moveTo(x + s, dy - 16);
          ctx.lineTo(x + s * 0.5, dy + 14);
          ctx.stroke();
        }
      } else if (h.type === "beans") {
        ["#f43f5e", "#a855f7", "#38bdf8", "#fbbf24"].forEach((c, idx) => {
          ctx.fillStyle = c;
          ctx.beginPath();
          ctx.ellipse(x - 14 + idx * 9, dy + (idx % 2) * 5, 7, 5, 0.4, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (h.type === "kids") {
        ctx.fillStyle = "#3b82f6";
        ctx.beginPath();
        ctx.roundRect(x - 18, dy - 4, 15, 22, 5);
        ctx.fill();
        ctx.fillStyle = "#fde68a";
        ctx.beginPath();
        ctx.arc(x - 10, dy - 12, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ec4899";
        ctx.beginPath();
        ctx.roundRect(x + 4, dy - 1, 14, 19, 5);
        ctx.fill();
        ctx.fillStyle = "#fde68a";
        ctx.beginPath();
        ctx.arc(x + 11, dy - 9, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (h.type === "cow") {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(x - 22, dy - 8, 42, 24, 10);
        ctx.fill();
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.arc(x - 6, dy, 7, 0, Math.PI * 2);
        ctx.arc(x + 10, dy + 4, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fbcfe8";
        ctx.beginPath();
        ctx.ellipse(x + 22, dy, 9, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    render() {
      this.tick++;
      this.pointer.x += (this.pointer.tx - this.pointer.x) * 0.08;
      this.pointer.y += (this.pointer.ty - this.pointer.y) * 0.08;

      const page = window.STORY_DATA.pages[this.pageIndex];
      const px = this.pointer.x;
      const py = this.pointer.y;

      this.drawSkyAndLighting(page.theme, px, py);

      const prebuilt = this.worldImages[page.id];
      if (prebuilt && prebuilt.complete && prebuilt.naturalWidth > 0) {
        this.ctx.drawImage(prebuilt, px * 10 - 12, py * 5 - 8, W + 24, H + 16);
      } else if (page.theme === "morning_cottage") {
        this.drawMorningCottageScene(px, py);
      } else if (page.theme === "moonlit_vine") {
        this.drawBeanstalkScene(px, py, true);
      } else if (page.theme === "sky_climb") {
        this.drawBeanstalkScene(px, py, false);
      } else if (page.theme === "castle_gate") {
        this.drawCloudCastleScene(px, py, false);
      } else {
        this.drawCloudCastleScene(px, py, true);
      }

      for (const h of page.hotspots) {
        const bounce = h.bounce ? Math.sin(h.bounce * 0.3) * 10 : 0;
        if (h.bounce > 0) h.bounce--;
        this.drawHotspotProp(h, h.x + px * 14, h.y + py * 7, bounce);
      }

      if (this.helperArrow && this.helperArrow.timer > 0) {
        this.helperArrow.timer--;
        const ax = this.helperArrow.x + px * 14;
        const ay = this.helperArrow.y + py * 7 - 32 - Math.abs(Math.sin(this.tick * 0.2)) * 10;
        this.ctx.fillStyle = "#fde047";
        this.ctx.beginPath();
        this.arc(ax, ay, 6, 0, Math.PI * 2);
        this.ctx.fill();
      }

      if (page.theme === "morning_cottage" && this.tick % 28 === 0) {
        this.smoke.push({ x: 135 + px * 8, y: 74 + py * 4, r: 7, alpha: 0.65 });
      }
      for (let i = this.smoke.length - 1; i >= 0; i--) {
        const s = this.smoke[i];
        s.y -= 0.55;
        s.x += Math.sin(this.tick * 0.05 + i) * 0.35;
        s.r += 0.12;
        s.alpha -= 0.006;
        if (s.alpha <= 0) {
          this.smoke.splice(i, 1);
          continue;
        }
        this.ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.save();
      this.ctx.globalCompositeOperation = "lighter";
      for (const p of this.particles) {
        p.x = (p.x + p.vx + W) % W;
        p.y = (p.y + p.vy + H) % H;
        const glow = (0.4 + 0.6 * Math.sin(this.tick * 0.05 + p.phase)) * p.alpha;
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = glow;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        this.ctx.fill();
      }

      for (let i = this.bursts.length - 1; i >= 0; i--) {
        const b = this.bursts[i];
        b.x += b.vx;
        b.y += b.vy;
        b.vy += 0.06;
        b.life--;
        if (b.life <= 0) {
          this.bursts.splice(i, 1);
          continue;
        }
        this.ctx.globalAlpha = Math.min(1, b.life / 20);
        this.ctx.fillStyle = b.color;
        this.ctx.beginPath();
        this.ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();

      requestAnimationFrame(() => this.render());
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    window.diorama = new ModernRetroDiorama();
  });
})();
