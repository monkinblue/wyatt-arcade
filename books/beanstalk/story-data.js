/* Beanstalk story configuration for the living pixel diorama.
   Narration text matches the ElevenLabs recordings. Pages 3-5 keep their
   audio paths ready; set hasAudio to true after those MP3s are added. */
(function () {
  'use strict';

  window.BEANSTALK_BOOK = {
    id: 'beanstalk',
    title: 'Wyatt, Emma & the Magic Beanstalk',
    imageDir: 'images/beanstalk/',
    paintingCatalog: 'images/beanstalk/paintings.json',
    defaultPack: ['flashlight', 'wand'],
    gear: [
      { id: 'flashlight', name: 'Flashlight', sprite: 'flashlight', msg: 'FLASH! Super bright beam!', sfx: 'flash' },
      { id: 'dino', name: 'Toy Dino', sprite: 'dino', msg: 'ROOOAR! Dino power!', sfx: 'roar' },
      { id: 'wand', name: 'Sunflower Wand', sprite: 'wand', msg: 'Sparkle magic!', sfx: 'magic' },
      { id: 'cookie', name: 'Giant Cookie', sprite: 'cookie', msg: 'CRUNCH! Yum yum!', sfx: 'crunch' }
    ],
    pages: [
      {
        id: 1,
        scene: 'garden',
        audio: 'audio/beanstalk-p1.mp3',
        hasAudio: true,
        text: 'One sunny morning, Wyatt and Emma traded their silly spotted cow for five magic glowing beans! They planted them right beside the garden fence.',
        hotspots: [
          { id: 'cottage', sprite: 'cottage', label: 'Family Cottage', x: 0.22, y: 0.90, anchor: 'feet', scenery: true, anim: 'shake', sfx: 'knock', msg: 'Knock knock! Time for an adventure!' },
          { id: 'cow', sprite: 'cow', label: 'Daisy the Cow', x: 0.48, y: 0.90, anchor: 'feet', anim: 'bounce', sfx: 'moo', msg: 'MOOOOO! Good luck with those beans!' },
          { id: 'beans', sprite: 'beans', label: 'Magic Beans', x: 0.64, y: 0.78, anchor: 'center', magic: true, anim: 'spin', sfx: 'magic', msg: 'ZZZAP! Magic bean power!' },
          { id: 'wyatt', sprite: 'wyatt', label: 'Wyatt', x: 0.74, y: 0.90, anchor: 'feet', anim: 'bounce', sfx: 'jump', msg: 'Whoa! Look how shiny they are!' },
          { id: 'emma', sprite: 'emma', label: 'Emma', x: 0.88, y: 0.90, anchor: 'feet', anim: 'bounce', sfx: 'chime', msg: "Let's plant them right here!" }
        ]
      },
      {
        id: 2,
        scene: 'night',
        audio: 'audio/beanstalk-p2.mp3',
        hasAudio: true,
        gearSelect: true,
        text: 'That night while the moon shone bright, a giant green beanstalk sprouted all the way into the clouds! Pick two items to pack in your backpack before you climb!',
        hotspots: [
          { id: 'moon', sprite: 'moon', label: 'Sleepy Moon', x: 0.16, y: 0.22, anchor: 'center', anim: 'spin', sfx: 'chime', msg: 'Yaaaawn! Have a safe climb!' },
          { id: 'stalk', sprite: 'leaf', label: 'Giant Stalk', x: 0.70, y: 0.42, anchor: 'center', anim: 'bounce', sfx: 'jump', msg: 'SPROING! Growing higher and higher!' },
          { id: 'owl', sprite: 'owl', label: 'Night Owl', x: 0.16, y: 0.62, anchor: 'feet', anim: 'bounce', sfx: 'hoot', msg: 'HOO-HOO! Pack your best gear!' }
        ]
      },
      {
        id: 3,
        scene: 'climb',
        audio: 'audio/beanstalk-p3.mp3',
        hasAudio: false,
        text: 'Up, up, up they climbed! Higher than the tallest trees and right through the fluffy white clouds until they saw a glittering road in the sky.',
        hotspots: [
          { id: 'vine-high', sprite: 'leaf', label: 'Giant Vine', x: 0.50, y: 0.28, anchor: 'center', anim: 'shake', sfx: 'jump', msg: 'Rustle rustle! Big leafy steps!' },
          { id: 'vine-low', sprite: 'leaf', label: 'Leafy Step', x: 0.56, y: 0.70, anchor: 'center', anim: 'shake', sfx: 'jump', msg: 'Hold on tight!' },
          { id: 'wyatt-climb', sprite: 'wyatt', label: 'Wyatt Climbing', x: 0.34, y: 0.48, anchor: 'feet', anim: 'bounce', sfx: 'chime', msg: 'I can see our backyard from way up here!' },
          { id: 'emma-climb', sprite: 'emma', label: 'Emma Climbing', x: 0.68, y: 0.58, anchor: 'feet', anim: 'bounce', sfx: 'chime', msg: 'The clouds feel like cotton candy!' },
          { id: 'cloud', sprite: 'cloud', label: 'Tickle Cloud', x: 0.16, y: 0.34, anchor: 'center', anim: 'bounce', sfx: 'magic', msg: 'PFFFT! Fluffy cloud puff!' },
          { id: 'rainbow', sprite: 'rainbow', label: 'Sky Rainbow', x: 0.84, y: 0.30, anchor: 'center', magic: true, anim: 'spin', sfx: 'harp', msg: 'Sliding across the sky!' }
        ]
      },
      {
        id: 4,
        scene: 'hall',
        audio: 'audio/beanstalk-p4.mp3',
        hasAudio: false,
        castle: true,
        text: 'At the top stood a tremendous Cloud Castle! Inside, a sleepy Giant snored loudly at his table beside a singing Golden Harp and a friendly Golden Goose. Tap your packed gear to use it!',
        hotspots: [
          { id: 'crest', sprite: 'crest', label: 'Cloud Castle', x: 0.16, y: 0.42, anchor: 'center', anim: 'shake', sfx: 'knock', msg: 'BOOM! Everything inside is huge!' },
          { id: 'giant', sprite: 'giant', label: 'Sleepy Giant', x: 0.40, y: 0.84, anchor: 'feet', anim: 'bounce', sfx: 'moo', msg: 'FEE-FI-FO-FUM... Zzzzzzz!' },
          { id: 'goose', sprite: 'goose', label: 'Golden Goose', x: 0.62, y: 0.84, anchor: 'feet', magic: true, anim: 'bounce', sfx: 'magic', msg: 'HONK! Take me home with you!' },
          { id: 'harp', sprite: 'harp', label: 'Magic Harp', x: 0.84, y: 0.78, anchor: 'feet', magic: true, anim: 'spin', sfx: 'harp', msg: 'Pluck! Pluck! A lullaby for the Giant!' }
        ]
      },
      {
        id: 5,
        scene: 'home',
        audio: 'audio/beanstalk-p5.mp3',
        hasAudio: false,
        text: "With a wiggle and a giggle, Wyatt and Emma zoomed all the way down the beanstalk right into Dad's arms! The Golden Goose honked happily, and they all had golden pancakes for dinner!",
        hotspots: [
          { id: 'dad', sprite: 'dad', label: 'Dad', x: 0.24, y: 0.90, anchor: 'feet', anim: 'bounce', sfx: 'harp', msg: 'Welcome back, my brave explorers!' },
          { id: 'wyatt-home', sprite: 'wyatt', label: 'Wyatt', x: 0.44, y: 0.90, anchor: 'feet', anim: 'bounce', sfx: 'jump', msg: "Dad! You won't believe what was in the clouds!" },
          { id: 'emma-home', sprite: 'emma', label: 'Emma', x: 0.62, y: 0.90, anchor: 'feet', anim: 'bounce', sfx: 'chime', msg: 'We brought home a new friend!' },
          { id: 'goose-home', sprite: 'goose', label: 'Golden Goose', x: 0.82, y: 0.90, anchor: 'feet', magic: true, anim: 'spin', sfx: 'magic', msg: 'Golden pancakes for everyone!' }
        ]
      }
    ]
  };
})();
