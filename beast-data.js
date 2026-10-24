// 3 Grid Sprite Sheets (4 columns x 2 rows = 8 beasts per sheet!)
// Cell index 0..3 = Top Row (Left to Right), 4..7 = Bottom Row (Left to Right)
window.BEAST_ROSTER = {
  sharks: [
    { id: 'megalodon',  name: 'Megalodon',     sheet: 'sharks', cell: 0, icon: '🦈', color: '#0284C7', pwr: 5, spd: 4, def: 4, fact: 'Megalodon had teeth as big as your whole hand!' },
    { id: 'greatwhite', name: 'Great White',   sheet: 'sharks', cell: 1, icon: '🦈', color: '#0EA5E9', pwr: 4, spd: 5, def: 3, fact: 'Great White Sharks can leap right out of the ocean!' },
    { id: 'orca',       name: 'Killer Whale',  sheet: 'sharks', cell: 2, icon: '🐋', color: '#1E293B', pwr: 5, spd: 5, def: 4, fact: 'Orcas hunt together in super-smart family pods!' },
    { id: 'hammerhead', name: 'Hammerhead',    sheet: 'sharks', cell: 3, icon: '🦈', color: '#06B6D4', pwr: 3, spd: 5, def: 3, fact: 'Its wide hammer head lets it see all around in 360 degrees!' },
    { id: 'giantsquid', name: 'Giant Squid',   sheet: 'sharks', cell: 4, icon: '🦑', color: '#E11D48', pwr: 4, spd: 4, def: 3, fact: 'Giant Squid have eyes the size of dinner plates and ten tentacles!' },
    { id: 'narwhal',    name: 'Narwhal',       sheet: 'sharks', cell: 5, icon: '🦄', color: '#38BDF8', pwr: 3, spd: 4, def: 4, fact: 'The Narwhal has a spiral unicorn tusk up to nine feet long!' },
    { id: 'mantaray',   name: 'Giant Manta',   sheet: 'sharks', cell: 6, icon: '🌊', color: '#2563EB', pwr: 3, spd: 5, def: 4, fact: 'Manta Rays glide like underwater spaceships with twenty-foot wings!' },
    { id: 'sawfish',    name: 'Sawfish',       sheet: 'sharks', cell: 7, icon: '⚔️', color: '#0D9488', pwr: 4, spd: 4, def: 4, fact: 'The Sawfish swings its spiky snout like a knight sword!' }
  ],
  jungle: [
    { id: 'lion',       name: 'King Lion',     sheet: 'jungle', cell: 0, icon: '🦁', color: '#D97706', pwr: 5, spd: 4, def: 3, fact: 'A Lion roar is so loud you can hear it five miles away!' },
    { id: 'tiger',      name: 'Bengal Tiger',  sheet: 'jungle', cell: 1, icon: '🐯', color: '#EA580C', pwr: 5, spd: 5, def: 3, fact: 'Tigers are the biggest cats on Earth and love to swim!' },
    { id: 'gorilla',    name: 'Silverback',    sheet: 'jungle', cell: 2, icon: '🦍', color: '#475569', pwr: 5, spd: 3, def: 4, fact: 'A Silverback Gorilla is stronger than ten grown-up weightlifting champions!' },
    { id: 'grizzly',    name: 'Grizzly Bear',  sheet: 'jungle', cell: 3, icon: '🐻', color: '#78350F', pwr: 5, spd: 4, def: 4, fact: 'Grizzly Bears can sprint as fast as a racehorse!' },
    { id: 'elephant',   name: 'Bull Elephant', sheet: 'jungle', cell: 4, icon: '🐘', color: '#64748B', pwr: 5, spd: 3, def: 5, fact: 'Elephants have forty thousand muscles in their trunk alone!' },
    { id: 'rhino',      name: 'Armored Rhino', sheet: 'jungle', cell: 5, icon: '🦏', color: '#52525B', pwr: 4, spd: 4, def: 5, fact: 'A Rhino horn is made of super-tough packed armor!' },
    { id: 'hippo',      name: 'River Hippo',   sheet: 'jungle', cell: 6, icon: '🦛', color: '#7C3AED', pwr: 5, spd: 3, def: 5, fact: 'Hippos have the strongest jaw chomp in the whole river!' },
    { id: 'croc',       name: 'Saltwater Croc',sheet: 'jungle', cell: 7, icon: '🐊', color: '#15803D', pwr: 5, spd: 3, def: 5, fact: 'Saltwater Crocodiles have dinosaur-style armor plates on their back!' }
  ],
  dinos: [
    { id: 'trex',       name: 'T-Rex',         sheet: 'dinos',  cell: 0, icon: '🦖', color: '#DC2626', pwr: 5, spd: 4, def: 4, fact: 'Tyrannosaurus Rex had the most powerful bite of any land animal ever!' },
    { id: 'triceratops',name: 'Triceratops',   sheet: 'dinos',  cell: 1, icon: '🦕', color: '#CA8A04', pwr: 4, spd: 3, def: 5, fact: 'Triceratops had three giant horns and a solid bone shield!' },
    { id: 'spinosaurus',name: 'Spinosaurus',   sheet: 'dinos',  cell: 2, icon: '🐉', color: '#059669', pwr: 5, spd: 4, def: 4, fact: 'Spinosaurus had a giant sail on its back and swam in rivers!' },
    { id: 'raptor',     name: 'Velociraptor',  sheet: 'dinos',  cell: 3, icon: '⚡', color: '#EA580C', pwr: 3, spd: 5, def: 3, fact: 'Velociraptors were lightning-fast sprinters with curved sickle claws!' },
    { id: 'ankylo',     name: 'Ankylosaurus',  sheet: 'dinos',  cell: 4, icon: '🛡️', color: '#65A30D', pwr: 4, spd: 2, def: 5, fact: 'Ankylosaurus was a living tank with a heavy club tail!' },
    { id: 'stego',      name: 'Stegosaurus',   sheet: 'dinos',  cell: 5, icon: '🌿', color: '#16A34A', pwr: 4, spd: 3, def: 4, fact: 'Stegosaurus had seventeen kite-shaped plates along its back and tail spikes!' },
    { id: 'ptero',      name: 'Pteranodon',    sheet: 'dinos',  cell: 6, icon: '🦅', color: '#9333EA', pwr: 3, spd: 5, def: 3, fact: 'Pteranodon soared high through the clouds with wings like an airplane!' },
    { id: 'brachio',    name: 'Brachiosaurus', sheet: 'dinos',  cell: 7, icon: '🦕', color: '#0284C7', pwr: 4, spd: 2, def: 5, fact: 'Brachiosaurus stood taller than a four-story building!' }
  ],
  wildcards: [
    { id: 'sparky', name: 'Sparky Dragon', sheet: null, cell: 0, icon: '🐉', color: '#10B981', pwr: 5, spd: 5, def: 5, fact: 'Sparky the Emerald Cloud Dragon zooms across the sky breathing golden starlight!' },
    { id: 'doggie', name: 'Super Doggie',  sheet: null, cell: 0, icon: '🐶', color: '#EC4899', pwr: 5, spd: 5, def: 5, fact: 'Emma’s fluffy white Doggie has the mightiest supersonic squeak-bark in the universe!' }
  ]
};