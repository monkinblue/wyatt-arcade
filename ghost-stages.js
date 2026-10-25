// Silly Ghost Roster + Mansion Fallback & Obstacle Renderers
window.SILLY_GHOSTS = [
    { id: 'cupcake', name: 'Cupcake Ghost', hat: '🧁', color: '#F472B6', giggle: 'Yum yum! Boo!' },
    { id: 'pirate',  name: 'Pirate Ghost',  hat: '🏴‍☠️', color: '#38BDF8', giggle: 'Yarrr! Silly Boo!' },
    { id: 'crown',   name: 'Royal Ghost',   hat: '👑', color: '#FDE047', giggle: 'Tee-hee! Royal Boo!' },
    { id: 'wizard',  name: 'Starry Ghost',  hat: '🧙', color: '#A855F7', giggle: 'Abracadabra Boo!' },
    { id: 'party',   name: 'Party Ghost',   hat: '🥳', color: '#06D6A0', giggle: 'Happy Party Boo!' },
    { id: 'pumpkin', name: 'Pumpkin Ghost', hat: '🎃', color: '#FB923C', giggle: 'Trick or Treat Boo!' }
  ];
  
  window.DECOY_FRIENDS = [
    { icon: '🐈‍⬛', say: 'Meow! Just a kitty!' },
    { icon: '🦇',   say: 'Flap flap! Sleepy bat!' },
    { icon: '🎃',   say: 'Giggle pumpkin!' },
    { icon: '🦉',   say: 'Hoo-hoo! Friendly owl!' }
  ];
  
  window.GhostArt = {
    // Draw Cute Smiling Sheet Ghost Wearing a Silly Costume Hat!
    drawSillyGhost(ctx, x, y, scale, ghost, tick) {
      const bob = Math.sin(tick * 0.1) * 7;
      ctx.save();
      ctx.translate(x, y + bob);
      ctx.scale(scale, scale);
  
      // Outer Friendly Glow
      ctx.shadowColor = ghost.color;
      ctx.shadowBlur = 24;
  
      // Sheet Body with Wavy Scalloped Skirt
      ctx.fillStyle = '#F8FAFC';
      ctx.strokeStyle = ghost.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, -14, 38, Math.PI, 0, false);
      ctx.lineTo(38, 34);
      const wave = Math.sin(tick * 0.18) * 4;
      ctx.quadraticCurveTo(25, 24 - wave, 13, 34);
      ctx.quadraticCurveTo(0, 44 + wave, -13, 34);
      ctx.quadraticCurveTo(-25, 24 - wave, -38, 34);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
  
      // Rosy Cheeks & Big Happy Smile
      ctx.fillStyle = '#FDA4AF';
      ctx.beginPath(); ctx.arc(-20, -4, 7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(20, -4, 7, 0, Math.PI * 2); ctx.fill();
  
      ctx.fillStyle = '#0F172A';
      ctx.beginPath(); ctx.arc(-13, -15, 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(13, -15, 5.5, 0, Math.PI * 2); ctx.fill();
  
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, -8, 10, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
  
      // Silly Costume Hat on Top!
      ctx.font = '38px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ghost.hat, 0, -54);
      ctx.restore();
    },
  
    // Built-in Cozy Haunted Parlor Fallback (if images/ghost-mansion.jpg isn't saved yet)
    drawMansionFallback(ctx, W, H) {
      const wall = ctx.createLinearGradient(0, 0, 0, H);
      wall.addColorStop(0, '#3B0764');
      wall.addColorStop(0.72, '#4C1D95');
      wall.addColorStop(0.72, '#451A03');
      wall.addColorStop(1, '#270E02');
      ctx.fillStyle = wall;
      ctx.fillRect(0, 0, W, H);
  
      // Moonlit Arched Window in Center
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = '#92400E';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.roundRect(W / 2 - 75, 70, 150, 195, [75, 75, 8, 8]);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath(); ctx.arc(W / 2 + 24, 130, 26, 0, Math.PI * 2); ctx.fill();
  
      // Bookshelf Left & Cozy Armchair Right
      ctx.fillStyle = '#78350F';
      ctx.fillRect(95, 115, 135, 260);
      ctx.fillStyle = '#B91C1C';
      ctx.beginPath(); ctx.roundRect(W - 265, 250, 155, 125, 24); ctx.fill();
    },
  
    // Blinking Peek-a-Boo Eyes in the Dark Shadow Layer!
    drawPeekingEyes(ctx, x, y, tick, seed) {
      if (Math.sin(tick * 0.06 + seed) < -0.65) return; // Cute blink!
      ctx.save();
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath(); ctx.ellipse(x - 9, y, 6, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + 9, y, 6, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0F172A';
      ctx.beginPath(); ctx.arc(x - 9, y, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 9, y, 3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  };