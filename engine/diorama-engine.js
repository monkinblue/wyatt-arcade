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
        const src = p.worldImage || ("images/beanstalk/p" + p.id + "-world.png");
        const img = new Image();
        img.decoding = "async";
        img.src = src;
        this.worldImages[p.id] = img;
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
      this.doggieHopTimer = 0;

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

    drawHotspotShimmer(h, x, y) {
      if (this.clicked.has(h.id)) return;
      const ctx = this.ctx;
      const pulse = 0.55 + 0.45 * Math.sin(this.tick * 0.08 + h.x * 0.01);
      const radius = 22 + pulse * 10;
      const isPink = !!h.isHelper;
      const core = isPink ? "rgba(244, 114, 182, " + (0.35 * pulse) + ")" : "rgba(253, 224, 71, " + (0.4 * pulse) + ")";
      const edge = isPink ? "rgba(244, 114, 182, 0)" : "rgba(253, 224, 71, 0)";
      const aura = ctx.createRadialGradient(x, y, 3, x, y, radius);
      aura.addColorStop(0, core);
      aura.addColorStop(1, edge);
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    render() {
      this.tick++;
      this.pointer.x += (this.pointer.tx - this.pointer.x) * 0.08;
      this.pointer.y += (this.pointer.ty - this.pointer.y) * 0.08;

      const page = window.STORY_DATA.pages[this.pageIndex];
      const px = this.pointer.x;
      const py = this.pointer.y;
      const ctx = this.ctx;

      ctx.clearRect(0, 0, W, H);

      const prebuilt = this.worldImages[page.id];
      if (prebuilt && prebuilt.complete && prebuilt.naturalWidth > 0) {
        ctx.drawImage(prebuilt, px * 12 - 18, py * 6 - 10, W + 36, H + 20);
      } else {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, W, H);
      }

      if (this.doggieHopTimer > 0) this.doggieHopTimer--;
      if (this.dragonBreathTimer > 0) {
        this.dragonBreathTimer--;
        if (this.dragonBreathTimer % 4 === 0) {
          const dragon = page.hotspots.find((h) => h.id === "cloud_dragon" || h.id === "gate_dragon");
          if (dragon) {
            this.spawnSparkleBurst(dragon.x + px * 14 + (Math.random() - 0.5) * 40, dragon.y + py * 7 - 10, "#fde047", 2);
          }
        }
      }

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const h of page.hotspots) {
        if (h.bounce > 0) h.bounce--;
        this.drawHotspotShimmer(h, h.x + px * 14, h.y + py * 7);
      }

      if (this.helperArrow && this.helperArrow.timer > 0) {
        this.helperArrow.timer--;
        const ax = this.helperArrow.x + px * 14;
        const ay = this.helperArrow.y + py * 7 - 32 - Math.abs(Math.sin(this.tick * 0.2)) * 10;
        const trail = 0.55 + 0.45 * Math.sin(this.tick * 0.25);
        ctx.fillStyle = "rgba(253, 224, 71, " + trail + ")";
        ctx.beginPath();
        ctx.arc(ax, ay, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(244, 114, 182, " + (trail * 0.7) + ")";
        ctx.beginPath();
        ctx.arc(ax, ay - 10, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const p of this.particles) {
        p.x = (p.x + p.vx + W) % W;
        p.y = (p.y + p.vy + H) % H;
        const glow = (0.4 + 0.6 * Math.sin(this.tick * 0.05 + p.phase)) * p.alpha;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
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
        ctx.globalAlpha = Math.min(1, b.life / 20);
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      requestAnimationFrame(() => this.render());
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    window.diorama = new ModernRetroDiorama();
  });
})();
