window.STORY_DATA = {
  title: "Wyatt, Emma & the Magic Beanstalk",
  pages: [
    {
      id: 1,
      title: "Page 1 of 5 • Morning at the Cozy Cottage",
      audio: "audio/beanstalk-p1.mp3",
      theme: "morning_cottage",
      text: "One sunny morning, Wyatt and Emma were playing in the garden with Emma's favorite white stuffed animal, Doggie. Suddenly, Doggie wiggled his soft floppy ears and sniffed out a pouch of glowing rainbow beans by the mossy stone wall! Wyatt dug a cozy little hole in the dirt, and together they planted the magic beans.",
      hotspots: [
        {
          id: "doggie",
          name: "Emma's Stuffed Doggie",
          type: "doggie",
          x: 290,
          y: 268,
          r: 44,
          isHelper: true,
          sound: "squeak",
          toast: "Squeak-woof! Doggie wagged his floppy white ears and sniffed toward the glowing magic beans!"
        },
        {
          id: "wyatt_emma",
          name: "Wyatt & Emma",
          type: "kids",
          x: 210,
          y: 252,
          r: 48,
          sound: "giggle",
          toast: "Wyatt and Emma high-five! 'Let's plant these glowing beans right here!'"
        },
        {
          id: "beans",
          name: "Glowing Rainbow Beans",
          type: "beans",
          x: 425,
          y: 278,
          r: 42,
          sound: "magic",
          toast: "Shhh-plink! The rainbow beans swirl with golden stardust in the garden soil!"
        },
        {
          id: "chimney",
          name: "Cottage Hearth Chimney",
          type: "chimney",
          x: 138,
          y: 88,
          r: 42,
          sound: "puff",
          toast: "Puff, puff! Sweet cinnamon pancake smoke curls up into the golden morning sky!"
        },
        {
          id: "cow",
          name: "Daisy the Meadow Cow",
          type: "cow",
          x: 545,
          y: 242,
          r: 48,
          sound: "moo",
          toast: "Moooo! Daisy rings her golden bell and munches on sweet pink clover!"
        }
      ]
    },
    {
      id: 2,
      title: "Page 2 of 5 • The Moonlit Beanstalk & Adventure Bag",
      audio: "audio/beanstalk-p2.mp3",
      theme: "moonlit_vine",
      requiresPacking: true,
      text: "That night, purple and gold starlight floated through the window—and the magic dust made Emma's stuffed Doggie wag his tail! Outside, a colossal emerald beanstalk was twisting all the way up toward the stars, where a friendly cloud dragon lived. 'Quick, Emma and Doggie!' whispered Wyatt. 'Let's pack two special items in our backpack before we climb!'",
      gearChoices: [
        { id: "treat", name: "Golden Dragon Treat", icon: "🍥" },
        { id: "whistle", name: "Starlight Dragon Flute", icon: "🪈" },
        { id: "lantern", name: "Firefly Lantern", icon: "🏮" },
        { id: "compass", name: "Cloud Compass", icon: "🧭" }
      ],
      hotspots: [
        {
          id: "doggie",
          name: "Emma's Stuffed Doggie",
          type: "doggie",
          x: 185,
          y: 272,
          r: 44,
          isHelper: true,
          sound: "squeak",
          toast: "Arf-squeak! Doggie does a magical moonlit backflip!"
        },
        {
          id: "vine",
          name: "Colossal Emerald Beanstalk",
          type: "vine_heart",
          x: 325,
          y: 180,
          r: 60,
          sound: "magic",
          toast: "Vwoooosh! Golden sap pulses up the giant spiraling vine toward the stars!"
        },
        {
          id: "moon",
          name: "Crescent Harvest Moon",
          type: "moon",
          x: 520,
          y: 78,
          r: 48,
          sound: "harp",
          toast: "Twinkle-chime! Look closely—a friendly dragon silhouette glides across the moon!"
        }
      ]
    },
    {
      id: 3,
      title: "Page 3 of 5 • Climbing Into the Dragon Clouds",
      audio: "audio/beanstalk-p3.mp3",
      theme: "sky_climb",
      text: "Up, up, up they climbed through the warm sunrise clouds, hopping from giant dewdrop leaves to billowy pink cloud islands. Doggie hopped right behind Emma, barking happily at a glowing sapphire dragon egg tucked inside a golden nest! High above them, a friendly baby dragon fluttered toward a shimmering sky castle.",
      hotspots: [
        {
          id: "doggie",
          name: "Emma's Stuffed Doggie",
          type: "doggie",
          x: 215,
          y: 262,
          r: 44,
          isHelper: true,
          sound: "squeak",
          toast: "Sniff, sniff! Doggie bounces over to the glowing sapphire dragon egg!"
        },
        {
          id: "egg",
          name: "Glowing Sapphire Dragon Egg",
          type: "dragon_egg",
          x: 430,
          y: 245,
          r: 46,
          sound: "hatch",
          toast: "CRACK-POP! A tiny emerald baby dragon pokes its nose out and puffs rainbow sparkles!"
        },
        {
          id: "baby_dragon",
          name: "Baby Cloud Dragon",
          type: "baby_dragon",
          x: 495,
          y: 108,
          r: 48,
          sound: "dragon_purr",
          toast: "Chirp-purrrr! The baby dragon does a joyful loop-de-loop for Wyatt!"
        }
      ]
    },
    {
      id: 4,
      title: "Page 4 of 5 • The Cloud Dragon's Waterfall Gate",
      audio: "audio/beanstalk-p4.mp3",
      theme: "castle_gate",
      text: "At the very top of the beanstalk stood a magnificent golden sky castle surrounded by cascading starlight waterfalls. A sleepy baby green dragon was curled up right in front of the towering carved doors! Wyatt reached into their adventure backpack, while Doggie gave a gentle little squeak to say hello.",
      hotspots: [
        {
          id: "doggie",
          name: "Emma's Stuffed Doggie",
          type: "doggie",
          x: 165,
          y: 274,
          r: 44,
          isHelper: true,
          sound: "squeak",
          toast: "Squeak-woof! Doggie boops noses with the sleepy baby dragon!"
        },
        {
          id: "gate_dragon",
          name: "Sleepy Guardian Dragon",
          type: "baby_dragon",
          x: 330,
          y: 256,
          r: 52,
          sound: "dragon_purr",
          toast: "Yaaaawn-purrrr! The little dragon wakes up, munches Wyatt's Golden Dragon Treat, and wags its tail!"
        },
        {
          id: "castle_door",
          name: "Sunburst Castle Gates",
          type: "castle_door",
          x: 475,
          y: 185,
          r: 58,
          sound: "harp",
          toast: "SHIMMER-CHIME! The grand golden gates swing open into the dragon's sanctuary!"
        }
      ]
    },
    {
      id: 5,
      title: "Page 5 of 5 • Sparky the Friendly Cloud Dragon",
      audio: "audio/beanstalk-p5.mp3",
      theme: "dragon_hall",
      text: "The golden doors opened into a breathtaking crystal hall where Sparky, a magnificent emerald Cloud Dragon, was listening to a magical self-playing harp! Sparky puffed a warm cloud of golden starlight that made Wyatt, Emma, and Doggie giggle and float. Then the friendly dragon scooped all three onto his cozy back and flew them safely home for bedtime.",
      hotspots: [
        {
          id: "doggie",
          name: "Emma's Stuffed Doggie",
          type: "doggie",
          x: 175,
          y: 275,
          r: 44,
          isHelper: true,
          sound: "squeak",
          toast: "Woof-woof! Doggie dances in the floating golden starlight!"
        },
        {
          id: "cloud_dragon",
          name: "Sparky the Emerald Cloud Dragon",
          type: "big_dragon",
          x: 365,
          y: 215,
          r: 72,
          sound: "dragon_purr",
          toast: "PURRRR-WHOOSH! Sparky breathes a dazzling aurora of warm golden sparkles across the hall!"
        },
        {
          id: "harp",
          name: "Celestial Singing Harp",
          type: "harp",
          x: 535,
          y: 238,
          r: 48,
          sound: "harp",
          toast: "Plink-plonk-shimmer! The celestial harp plays a sweet bedtime lullaby for Wyatt and Emma!"
        }
      ]
    }
  ]
};
