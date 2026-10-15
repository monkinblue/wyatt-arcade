(function () {
  const W = 640;
  const H = 360;

  class LivingStorybookEngine {
    constructor() {
      this.pageIndex = 0;
      this.tick = 0;
      this.cam = { x: 0, y: 0, tx: 0, ty: 0, dragging: false, startX: 0, startY: 0 };
      this.worldImages = {};
      this.activeAnims = [];
      this.bursts = [];
      this.smokeRings = [];
      this.leapingFish = [];
      this.musicNotes = [];
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
      document
        .querySelectorAll(
          ".hotspot-layer, .hotspot-label, .hotspot-pill, .hotspot-btn, .px-label, #label-layer, #adventure-gear, .adventure-gear, .gear-pill"
        )
        .forEach((el) => el.remove());

      document.querySelectorAll("button, div").forEach((el) => {
        if ((el.textContent || "").trim().startsWith("Adventure Gear")) {
          el.style.display = "none";
        }
      });

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
      this.canvas.style.touchAction = "none";
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
          "position:absolute;bottom:14px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,0.92);color:#fef08a;padding:8px 18px;border-radius:999px;border:2px solid #fbbf24;font-weight:700;font-size:15px;pointer-events:none;opacity:0;transition:opacity 0.25s;z-index:30;box-shadow:0 8px 24px rgba(0,0,0,0.5);white-space:nowrap;max-width:92%;overflow:hidden;text-overflow:ellipsis;";
        parent.appendChild(this.toastEl);
      }
    }

    preloadPaintings() {
      (window.STORY_DATA.pages || []).forEach((p, idx) => {
        const id = p.id || idx + 1;
        const img = new Image();
        img.src = p.worldImage || `images/beanstalk/p${id}-world.png`;
        this.worldImages[id] = img;
      });
    }

    bindInputs() {
      window.addEventListener("mousemove", (e) => {
        if (this.cam.dragging) return;
        const r = this.canvas.getBoundingClientRect();
        this.cam.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
        this.cam.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
      });

      this.canvas.addEventListener("pointerdown", (e) => {
        const r = this.canvas.getBoundingClientRect();
        this.cam.dragging = true;
        this.cam.startX = e.clientX;
        this.cam.startY = e.clientY;
        this.cam.moved = false;
        const x = ((e.clientX - r.left) / r.width) * W;
        const y = ((e.clientY - r.top) / r.height) * H;
        this.lastTapPos = { x, y };
      });

      window.addEventListener("pointermove", (e) => {
        if (!this.cam.dragging) return;
        const dx = e.clientX - this.cam.startX;
        const dy = e.clientY - this.cam.startY;
        if (Math.hypot(dx, dy) > 12) this.cam.moved = true;
        this.cam.tx = Math.max(-1, Math.min(1, this.cam.tx - dx * 0.005));
        this.cam.ty = Math.max(-1, Math.min(1, this.cam.ty - dy * 0.005));
        this.cam.startX = e.clientX;
        this.cam.startY = e.clientY;
      });

      window.addEventListener("pointerup", () => {
        if (this.cam.dragging && !this.cam.moved && this.lastTapPos) {
          this.onTap(this.lastTapPos.x, this.lastTapPos.y);
        }
        this.cam.dragging = false;
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
        tone(850, 1420, 0.1, "sine", 0.22, 0);
        tone(1080, 660, 0.14, "triangle", 0.2, 0.11);
      } else if (type === "dragon_purr") {
        [196, 246.9, 293.7, 392, 493.9, 587.3].forEach((f, i) => tone(f, f * 1.05, 0.28, "sine", 0.15, i * 0.065));
      } else if (type === "harp" || type === "magic") {
        [523.3, 659.3, 784.0, 987.8, 1046.5, 1318.5].forEach((f, i) => tone(f, f * 1.01, 0.42, "sine", 0.14, i * 0.06));
      } else if (type === "splash") {
        tone(420, 880, 0.12, "sine", 0.18, 0);
        tone(680, 240, 0.22, "triangle", 0.16, 0.12);
      } else if (type === "knock") {
        tone(180, 90, 0.09, "triangle", 0.25, 0);
        tone(190, 95, 0.09, "triangle", 0.25, 0.14);
      } else if (type === "puff") {
        tone(260, 520, 0.2, "sine", 0.15, 0);
      } else if (type === "hatch") {
        tone(340, 960, 0.15, "triangle", 0.2, 0);
        tone(587, 1174, 0.24, "sine", 0.18, 0.14);
      } else {
        tone(520, 780, 0.14, "sine", 0.12, 0);
      }
    }

    loadPage(idx) {
      const pages = window.STORY_DATA.pages;
      this.pageIndex = Math.max(0, Math.min(pages.length - 1, idx));
      this.activeAnims = [];
      this.bursts = [];
      this.smokeRings = [];
      this.leapingFish = [];
      this.musicNotes = [];
      this.cam.tx = 0;
      this.cam.ty = 0;
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
      const panX = this.getPanX();
      const panY = this.getPanY();

      const worldX = ((x - panX) / (W + 28)) * W;
      const worldY = ((y - panY) / (H + 16)) * H;

      for (const h of page.hotspots) {
        if (Math.hypot(worldX - h.x, worldY - h.y) <= (h.r || 48)) {
          this.triggerHotspot(h, x, y);
          return;
        }
      }
      this.spawnSparkleBurst(x, y, "#fde047", 12);
      this.playSound("default");
    }

    triggerHotspot(h, screenX, screenY) {
      this.playSound(h.sound);
      this.spawnSparkleBurst(screenX, screenY, "#fde047", 28);

      this.activeAnims = this.activeAnims.filter((a) => a.hotspot.id !== h.id);
      this.activeAnims.push({ hotspot: h, timer: 0, maxTimer: 52 });

      if (h.anim === "smoke_puff") {
        for (let i = 0; i < 4; i++) {
          this.smokeRings.push({ x: screenX, y: screenY - 6, r: 6 + i * 4, alpha: 0.9, vy: -0.9 - i * 0.2 });
        }
      } else if (h.anim === "fish_jump") {
        this.leapingFish.push({ x: screenX - 35, y: screenY + 10, vx: 2.1, vy: -5.2, life: 48 });
      } else if (h.anim === "harp_play" || h.anim === "moon_chime") {
        for (let i = 0; i < 5; i++) {
          this.musicNotes.push({
            x: screenX + (Math.random() - 0.5) * 30,
            y: screenY,
            vy: -0.8 - Math.random() * 0.6,
            phase: i,
            life: 60
          });
        }
      } else if (h.anim === "dragon_breath") {
        for (let i = 0; i < 45; i++) {
          this.bursts.push({
            x: screenX + 20,
            y: screenY - 18,
            vx: 1.5 + Math.random() * 3.5,
            vy: (Math.random() - 0.5) * 2.2,
            size: 4,
            life: 40 + Math.random() * 20,
            color: i % 2 === 0 ? "#fde047" : "#34d399"
          });
        }
      }

      if (this.toastEl) {
        this.toastEl.textContent = h.toast;
        this.toastEl.style.opacity = "1";
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => (this.toastEl.style.opacity = "0"), 3600);
      }
    }

    spawnSparkleBurst(x, y, color, count = 20) {
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count + Math.random() * 0.2;
        const spd = 1.0 + Math.random() * 2.8;
        this.bursts.push({
          x,
          y,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd - 0.5,
          size: i % 3 === 0 ? 4 : 2,
          life: 26 + Math.random() * 14,
          color: i % 2 === 0 ? color : "#ffffff"
        });
      }
    }

    getPanX() {
      const sway = Math.sin(this.tick * 0.015) * 0.25;
      return Math.round((this.cam.x + sway) * 14 - 14);
    }

    getPanY() {
      const sway = Math.cos(this.tick * 0.012) * 0.2;
      return Math.round((this.cam.y + sway) * 8 - 8);
    }

    drawAnimatedWaterfalls(painting, page, panX, panY) {
      if (!page.waterfalls || !page.waterfalls.length) return;
      const ctx = this.ctx;
      const imgW = painting.naturalWidth;
      const imgH = painting.naturalHeight;
      const scaleX = (W + 28) / W;
      const scaleY = (H + 16) / H;

      for (const wf of page.waterfalls) {
        const sx = (wf.x / W) * imgW;
        const sy = (wf.y / H) * imgH;
        const sw = (wf.w / W) * imgW;
        const sh = (wf.h / H) * imgH;

        const dx = panX + wf.x * scaleX;
        const dy = panY + wf.y * scaleY;
        const dw = wf.w * scaleX;
        const dh = wf.h * scaleY;

        const offset = (this.tick * 1.8) % dh;
        ctx.save();
        ctx.beginPath();
        ctx.rect(dx, dy, dw, dh);
        ctx.clip();

        ctx.drawImage(painting, sx, sy, sw, sh, dx, dy + offset, dw, dh);
        ctx.drawImage(painting, sx, sy, sw, sh, dx, dy + offset - dh, dw, dh);

        ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
        for (let m = 0; m < 5; m++) {
          const mx = dx + ((m * 13 + this.tick * 0.8) % dw);
          const my = dy + dh - 6 - Math.abs(Math.sin(this.tick * 0.15 + m)) * 6;
          ctx.fillRect(Math.round(mx), Math.round(my), 3, 3);
        }
        ctx.restore();
      }
    }

    drawActiveCharacterAnims(painting, panX, panY) {
      const ctx = this.ctx;
      const imgW = painting.naturalWidth;
      const imgH = painting.naturalHeight;
      const scaleX = (W + 28) / W;
      const scaleY = (H + 16) / H;

      for (let i = this.activeAnims.length - 1; i >= 0; i--) {
        const a = this.activeAnims[i];
        a.timer++;
        if (a.timer >= a.maxTimer) {
          this.activeAnims.splice(i, 1);
          continue;
        }

        const p = a.timer / a.maxTimer;
        const h = a.hotspot;
        const r = h.r || 44;

        const sx = Math.max(0, ((h.x - r) / W) * imgW);
        const sy = Math.max(0, ((h.y - r) / H) * imgH);
        const sw = ((r * 2) / W) * imgW;
        const sh = ((r * 2) / H) * imgH;

        const cx = panX + h.x * scaleX;
        const cy = panY + h.y * scaleY;

        let jumpY = 0;
        let rot = 0;
        let scX = 1;
        let scY = 1;

        if (h.anim === "jump_flip") {
          jumpY = -Math.sin(p * Math.PI) * 32;
          rot = Math.sin(p * Math.PI * 4) * 0.22;
          scX = 1 + Math.sin(p * Math.PI * 2) * 0.12;
          scY = 1 - Math.sin(p * Math.PI * 2) * 0.12;
        } else if (h.anim === "egg_wobble" || h.anim === "wake_dragon") {
          rot = Math.sin(p * Math.PI * 6) * 0.25 * (1 - p);
          jumpY = -Math.abs(Math.sin(p * Math.PI * 3)) * 12;
        } else if (h.anim === "dragon_loop") {
          jumpY = -Math.sin(p * Math.PI * 2) * 24;
          rot = p * Math.PI * 2;
        } else {
          scX = 1 + Math.sin(p * Math.PI * 3) * 0.15 * (1 - p);
          scY = 1 - Math.sin(p * Math.PI * 3) * 0.15 * (1 - p);
          jumpY = -Math.sin(p * Math.PI) * 10;
        }

        ctx.save();
        ctx.translate(cx, cy + jumpY);
        ctx.rotate(rot);
        ctx.scale(scX, scY);
        ctx.beginPath();
        ctx.arc(0, 0, r * scaleX, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(painting, sx, sy, sw, sh, -r * scaleX, -r * scaleY, r * 2 * scaleX, r * 2 * scaleY);
        ctx.restore();
      }
    }

    drawCustomSkits() {
      const ctx = this.ctx;

      for (let i = this.smokeRings.length - 1; i >= 0; i--) {
        const s = this.smokeRings[i];
        s.y += s.vy;
        s.x += Math.sin(this.tick * 0.08 + i) * 0.5;
        s.r += 0.22;
        s.alpha -= 0.015;
        if (s.alpha <= 0) {
          this.smokeRings.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (let i = this.leapingFish.length - 1; i >= 0; i--) {
        const f = this.leapingFish[i];
        f.x += f.vx;
        f.y += f.vy;
        f.vy += 0.24;
        f.life--;
        if (f.life <= 0) {
          this.leapingFish.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(Math.atan2(f.vy, f.vx));
        ctx.fillStyle = "#fb923c";
        ctx.fillRect(-10, -5, 16, 10);
        ctx.fillStyle = "#fde047";
        ctx.fillRect(-4, -3, 8, 6);
        ctx.fillStyle = "#f43f5e";
        ctx.fillRect(-16, -7, 6, 14);
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(2, -3, 3, 3);
        ctx.restore();
      }

      for (let i = this.musicNotes.length - 1; i >= 0; i--) {
        const n = this.musicNotes[i];
        n.y += n.vy;
        n.x += Math.sin(this.tick * 0.1 + n.phase) * 0.6;
        n.life--;
        if (n.life <= 0) {
          this.musicNotes.splice(i, 1);
          continue;
        }
        ctx.fillStyle = "#fde047";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText(n.phase % 2 === 0 ? "♪" : "♫", n.x, n.y);
      }

      for (let i = this.bursts.length - 1; i >= 0; i--) {
        const b = this.bursts[i];
        b.x += b.vx;
        b.y += b.vy;
        b.vy += 0.05;
        b.life--;
        if (b.life <= 0) {
          this.bursts.splice(i, 1);
          continue;
        }
        ctx.fillStyle = b.color;
        ctx.fillRect(Math.round(b.x), Math.round(b.y), b.size, b.size);
      }
    }

    render() {
      this.tick++;
      this.cam.x += (this.cam.tx - this.cam.x) * 0.08;
      this.cam.y += (this.cam.ty - this.cam.y) * 0.08;

      const page = window.STORY_DATA.pages[this.pageIndex];
      const pageId = page.id || this.pageIndex + 1;
      const panX = this.getPanX();
      const panY = this.getPanY();

      const painting = this.worldImages[pageId];
      if (painting && painting.complete && painting.naturalWidth > 0) {
        this.ctx.drawImage(painting, panX, panY, W + 28, H + 16);
        this.drawAnimatedWaterfalls(painting, page, panX, panY);
        this.drawActiveCharacterAnims(painting, panX, panY);
      }

      this.drawCustomSkits();
      requestAnimationFrame(() => this.render());
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    window.diorama = new LivingStorybookEngine();
  });
})();
