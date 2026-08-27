export interface AnimalFoodItem {
  emoji: string;
  answer: string;
  others: string[];
  category: 'Animal' | 'Food';
}

export interface FamiliarObjectItem {
  emoji: string;
  answer: string;
  clue: string;
  others: string[];
}

export interface MatchObjectPlaceItem {
  object: string;
  name: string;
  place: string;
  others: string[];
}

export interface MatchObjectUseItem {
  object: string;
  name: string;
  use: string;
  others: string[];
}

export interface WordAssociationItem {
  prompt: string;
  answer: string;
  others: string[];
  relation: string;
}

export interface SameOrDifferentItem {
  item1: string;
  item2: string;
  isSame: boolean;
  label1: string;
  label2: string;
}

export interface FindDifferentSet {
  normal: string;
  odd: string;
  desc: string;
}

export interface ColorSequenceItem {
  name: string;
  hex: string;
  emoji: string;
  bgClass: string;
}

export interface MorningOrNightActivity {
  activity: string;
  time: 'Morning' | 'Night';
  icon: string;
}

export interface DailyLifeQuestion {
  question: string;
  options: string[];
  answer: string;
  icon: string;
}

export interface MemoryStory {
  title: string;
  icon: string;
  story: string;
  questions: {
    question: string;
    options: string[];
    answer: string;
  }[];
}

export interface RememberPlaceScene {
  name: string;
  icon: string;
  description: string;
  details: string[];
  questions: {
    question: string;
    options: string[];
    answer: string;
  }[];
}

export interface FamilyTableSeat {
  position: string;
  member: string;
  emoji: string;
  food: string;
}

export interface FamilyTableScene {
  tableName: string;
  seats: FamilyTableSeat[];
  questions: {
    question: string;
    options: string[];
    answer: string;
  }[];
}

export interface WhatComesNextPattern {
  seq: string[];
  answer: string;
  options: string[];
  explanation: string;
}

export interface PictureOrderingTask {
  title: string;
  icon: string;
  steps: {
    step: number;
    text: string;
    emoji: string;
  }[];
}

export interface DailyRoutineTask {
  routineName: string;
  steps: string[];
  missingStep: string;
  options: string[];
  icon: string;
}

export interface ShapeMatchingItem {
  name: string;
  emoji: string;
  shapeType: string;
}

export interface ColorMatchingItem {
  name: string;
  hex: string;
  bgClass: string;
  borderClass: string;
}

export const GAME_DATASETS = {
  animalFoodData: [
    { emoji: '🐶', answer: 'Dog', others: ['Cat', 'Bird', 'Fish'], category: 'Animal' },
    { emoji: '🐱', answer: 'Cat', others: ['Dog', 'Rabbit', 'Mouse'], category: 'Animal' },
    { emoji: '🍎', answer: 'Apple', others: ['Pear', 'Orange', 'Plum'], category: 'Food' },
    { emoji: '🍌', answer: 'Banana', others: ['Apple', 'Mango', 'Pear'], category: 'Food' },
    { emoji: '🐦', answer: 'Bird', others: ['Fish', 'Dog', 'Frog'], category: 'Animal' },
    { emoji: '🐟', answer: 'Fish', others: ['Bird', 'Snake', 'Frog'], category: 'Animal' },
    { emoji: '🍊', answer: 'Orange', others: ['Apple', 'Lemon', 'Grape'], category: 'Food' },
    { emoji: '🐴', answer: 'Horse', others: ['Cow', 'Dog', 'Sheep'], category: 'Animal' },
    { emoji: '🍇', answer: 'Grapes', others: ['Berries', 'Cherries', 'Plums'], category: 'Food' },
    { emoji: '🐘', answer: 'Elephant', others: ['Lion', 'Bear', 'Horse'], category: 'Animal' },
    { emoji: '🥕', answer: 'Carrot', others: ['Potato', 'Onion', 'Pepper'], category: 'Food' },
    { emoji: '🐢', answer: 'Turtle', others: ['Frog', 'Snake', 'Fish'], category: 'Animal' },
    { emoji: '🍞', answer: 'Bread', others: ['Cheese', 'Egg', 'Rice'], category: 'Food' },
    { emoji: '🦁', answer: 'Lion', others: ['Tiger', 'Wolf', 'Leopard'], category: 'Animal' },
    { emoji: '🥛', answer: 'Milk', others: ['Juice', 'Water', 'Tea'], category: 'Food' },
  ] as AnimalFoodItem[],

  familiarObjectData: [
    { emoji: '🪥', answer: 'Toothbrush', clue: 'Used to brush your teeth every morning and evening', others: ['Hairbrush', 'Spoon', 'Pencil'] },
    { emoji: '🔑', answer: 'Key', clue: 'Used to lock and unlock doors securely', others: ['Coin', 'Ring', 'Button'] },
    { emoji: '👓', answer: 'Glasses', clue: 'Helps you read books and see clearly', others: ['Watch', 'Necklace', 'Hat'] },
    { emoji: '⏰', answer: 'Clock', clue: 'Tells you the time of day and rings alarms', others: ['Radio', 'Mirror', 'Scale'] },
    { emoji: '☕', answer: 'Teacup', clue: 'Holds warm tea or coffee in the morning', others: ['Bowl', 'Plate', 'Vase'] },
    { emoji: '🌂', answer: 'Umbrella', clue: 'Keeps you dry when it rains outside', others: ['Cane', 'Broom', 'Fan'] },
    { emoji: '📱', answer: 'Telephone', clue: 'Used to call family and talk with friends', others: ['Calculator', 'Remote', 'Camera'] },
    { emoji: '🥄', answer: 'Spoon', clue: 'Used for eating warm soup and cereal', others: ['Fork', 'Knife', 'Straw'] },
    { emoji: '📚', answer: 'Book', clue: 'Has pages full of interesting stories', others: ['Newspaper', 'Notebook', 'Envelope'] },
    { emoji: '🛏️', answer: 'Bed', clue: 'Where you sleep comfortably at night', others: ['Sofa', 'Chair', 'Bench'] },
  ] as FamiliarObjectItem[],

  matchObjectPlaceData: [
    { object: '🪥', name: 'Toothbrush', place: 'Bathroom', others: ['Kitchen', 'Bedroom', 'Garden'] },
    { object: '🍳', name: 'Frying Pan', place: 'Kitchen', others: ['Bathroom', 'Garden', 'Office'] },
    { object: '🛏️', name: 'Pillow', place: 'Bedroom', others: ['Kitchen', 'Garage', 'Garden'] },
    { object: '🚗', name: 'Car', place: 'Garage', others: ['Bedroom', 'Kitchen', 'Bathroom'] },
    { object: '🌺', name: 'Flower', place: 'Garden', others: ['Kitchen', 'Office', 'Bathroom'] },
    { object: '💻', name: 'Computer', place: 'Office / Study', others: ['Garden', 'Bathroom', 'Kitchen'] },
    { object: '📚', name: 'Books', place: 'Library / Shelf', others: ['Kitchen', 'Garage', 'Bathroom'] },
    { object: '🧼', name: 'Soap', place: 'Bathroom', others: ['Office', 'Garden', 'Library'] },
    { object: '🥄', name: 'Spoon', place: 'Kitchen', others: ['Bedroom', 'Garden', 'Office'] },
    { object: '🧸', name: 'Teddy Bear', place: 'Bedroom', others: ['Kitchen', 'Garage', 'Office'] },
  ] as MatchObjectPlaceItem[],

  matchObjectUseData: [
    { object: '🌂', name: 'Umbrella', use: 'Stay dry from rain', others: ['Cut paper', 'Tell time', 'Open doors'] },
    { object: '🧹', name: 'Broom', use: 'Sweep the floor', others: ['Cook food', 'Write letters', 'Comb hair'] },
    { object: '🔑', name: 'Key', use: 'Open a door', others: ['Eat food', 'Read books', 'Water plants'] },
    { object: '✂️', name: 'Scissors', use: 'Cut paper & thread', others: ['Sweep floor', 'Tell time', 'Open doors'] },
    { object: '📞', name: 'Phone', use: 'Talk to family', others: ['Cook food', 'Sweep floor', 'Cut paper'] },
    { object: '🪥', name: 'Toothbrush', use: 'Clean teeth', others: ['Cook food', 'Write notes', 'Open doors'] },
    { object: '🥄', name: 'Spoon', use: 'Eat soup & cereal', others: ['Cut paper', 'Sweep floor', 'Open doors'] },
    { object: '📚', name: 'Book', use: 'Read stories', others: ['Cook food', 'Clean teeth', 'Tell time'] },
    { object: '⏰', name: 'Clock', use: 'Tell the time', others: ['Cut paper', 'Sweep floor', 'Eat food'] },
    { object: '🧤', name: 'Gloves', use: 'Keep hands warm', others: ['Cut paper', 'Read books', 'Tell time'] },
  ] as MatchObjectUseItem[],

  wordAssociationData: [
    { prompt: '🐝 Bee', answer: 'Honey', others: ['Bread', 'Shoe', 'Car'], relation: 'Bees produce sweet honey' },
    { prompt: '🌧️ Rain', answer: 'Umbrella', others: ['Stove', 'Hammer', 'Bicycle'], relation: 'Used during rainy weather' },
    { prompt: '🩺 Doctor', answer: 'Hospital', others: ['Bakery', 'Garage', 'Airport'], relation: 'Where medical doctors practice' },
    { prompt: '🍞 Bread', answer: 'Butter', others: ['Shovel', 'Clock', 'Lamp'], relation: 'Classic breakfast pairing' },
    { prompt: '⚽ Football', answer: 'Goal', others: ['Pencil', 'Blanket', 'Kettle'], relation: 'Scored in football match' },
    { prompt: '🐟 Fish', answer: 'Water', others: ['Fire', 'Desert', 'Sky'], relation: 'Natural habitat of fish' },
    { prompt: '🐦 Bird', answer: 'Nest', others: ['Garage', 'Cupboard', 'Sink'], relation: 'Home built by birds' },
    { prompt: '🖊️ Pen', answer: 'Paper', others: ['Fork', 'Shoe', 'Towel'], relation: 'Used to write on paper' },
    { prompt: '🚗 Car', answer: 'Road', others: ['River', 'Cloud', 'Shelf'], relation: 'Vehicles travel on roads' },
    { prompt: '☕ Coffee', answer: 'Cup', others: ['Sock', 'Plate', 'Book'], relation: 'Poured into a warm cup' },
  ] as WordAssociationItem[],

  sameOrDifferentData: [
    { item1: '🍎', item2: '🍎', isSame: true, label1: 'Red Apple', label2: 'Red Apple' },
    { item1: '🐶', item2: '🐱', isSame: false, label1: 'Dog', label2: 'Cat' },
    { item1: '⭐', item2: '⭐', isSame: true, label1: 'Yellow Star', label2: 'Yellow Star' },
    { item1: '🔵', item2: '🔴', isSame: false, label1: 'Blue Circle', label2: 'Red Circle' },
    { item1: '☕', item2: '☕', isSame: true, label1: 'Coffee Cup', label2: 'Coffee Cup' },
    { item1: '🚗', item2: '🚲', isSame: false, label1: 'Car', label2: 'Bicycle' },
    { item1: '🌸', item2: '🌸', isSame: true, label1: 'Flower', label2: 'Flower' },
    { item1: '🔺', item2: '🔻', isSame: false, label1: 'Up Triangle', label2: 'Down Triangle' },
    { item1: '📖', item2: '📖', isSame: true, label1: 'Open Book', label2: 'Open Book' },
    { item1: '☀️', item2: '🌙', isSame: false, label1: 'Sun', label2: 'Moon' },
  ] as SameOrDifferentItem[],

  findDifferentSets: [
    { normal: '🐱', odd: '🐶', desc: 'Find the puppy hidden among cats' },
    { normal: '🍎', odd: '🍊', desc: 'Find the orange among apples' },
    { normal: '⭐', odd: '🌙', desc: 'Find the crescent moon among stars' },
    { normal: '🔵', odd: '🟢', desc: 'Find the green orb among blue ones' },
    { normal: '🚗', odd: '🚕', desc: 'Find the taxi among regular cars' },
    { normal: '🌸', odd: '🌻', desc: 'Find the sunflower in cherry blossoms' },
    { normal: '🐦', odd: '🐟', desc: 'Find the fish among birds' },
    { normal: '☕', odd: '🍵', desc: 'Find the green matcha among coffee cups' },
  ] as FindDifferentSet[],

  colorSequences: [
    { name: 'Red', hex: '#ef4444', emoji: '🔴', bgClass: 'bg-red-500 hover:bg-red-600' },
    { name: 'Blue', hex: '#3b82f6', emoji: '🔵', bgClass: 'bg-blue-500 hover:bg-blue-600' },
    { name: 'Green', hex: '#10b981', emoji: '🟢', bgClass: 'bg-emerald-500 hover:bg-emerald-600' },
    { name: 'Yellow', hex: '#f59e0b', emoji: '🟡', bgClass: 'bg-amber-400 hover:bg-amber-500' },
    { name: 'Purple', hex: '#8b5cf6', emoji: '🟣', bgClass: 'bg-purple-500 hover:bg-purple-600' },
    { name: 'Orange', hex: '#f97316', emoji: '🟠', bgClass: 'bg-orange-500 hover:bg-orange-600' },
  ] as ColorSequenceItem[],

  morningOrNightActivities: [
    { activity: 'Eat a warm bowl of breakfast cereal', time: 'Morning', icon: '🥣' },
    { activity: 'Put on soft pyjamas for sleep', time: 'Night', icon: '👕' },
    { activity: 'Wake up as sunshine comes through', time: 'Morning', icon: '⏰' },
    { activity: 'Read a calming bedtime story', time: 'Night', icon: '📖' },
    { activity: 'Get dressed for a morning garden walk', time: 'Morning', icon: '👔' },
    { activity: 'Turn off the lights to rest', time: 'Night', icon: '💡' },
    { activity: 'Brush teeth before going to sleep', time: 'Night', icon: '🪥' },
    { activity: 'Open curtains to welcome morning light', time: 'Morning', icon: '🪟' },
    { activity: 'Say goodnight to family', time: 'Night', icon: '🌙' },
    { activity: 'Make the bed after waking up', time: 'Morning', icon: '🛏️' },
    { activity: 'Have a freshly brewed morning tea', time: 'Morning', icon: '☕' },
    { activity: 'Watch the beautiful evening sunset', time: 'Night', icon: '🌅' },
    { activity: 'Take morning prescribed vitamins', time: 'Morning', icon: '💊' },
    { activity: 'Lock the front door safely for the night', time: 'Night', icon: '🔒' },
  ] as MorningOrNightActivity[],

  dailyLifeRecallQuestions: [
    { question: 'What do we use to tell what time it is?', options: ['Clock', 'Spoon', 'Shoe'], answer: 'Clock', icon: '⏰' },
    { question: 'Where in the home do we prepare and cook meals?', options: ['Kitchen', 'Bedroom', 'Garden'], answer: 'Kitchen', icon: '🍳' },
    { question: 'What do we use to unlock the front door?', options: ['Key', 'Cup', 'Book'], answer: 'Key', icon: '🔑' },
    { question: 'What warm beverage do many enjoy in the morning?', options: ['Tea', 'Paint', 'Glue'], answer: 'Tea', icon: '☕' },
    { question: 'What eating utensil do we use for hot soup?', options: ['Spoon', 'Hammer', 'Pencil'], answer: 'Spoon', icon: '🥄' },
    { question: 'Where do we comfortably lie down to sleep at night?', options: ['Bed', 'Table', 'Oven'], answer: 'Bed', icon: '🛏️' },
    { question: 'What do we put on to stay warm on a chilly winter day?', options: ['Warm Coat', 'Sandals', 'Swimsuit'], answer: 'Warm Coat', icon: '🧥' },
    { question: 'What household tool is used to sweep the floor?', options: ['Broom', 'Fork', 'Plate'], answer: 'Broom', icon: '🧹' },
    { question: 'Which friendly animal barks and wags its tail?', options: ['Dog', 'Fish', 'Turtle'], answer: 'Dog', icon: '🐶' },
    { question: 'What do we put on our feet before wearing shoes?', options: ['Socks', 'Gloves', 'Scarf'], answer: 'Socks', icon: '🧦' },
    { question: 'What shines brightly in the clear daytime sky?', options: ['Sun', 'Moon', 'Stars'], answer: 'Sun', icon: '☀️' },
    { question: 'Where do we go to purchase fresh fruits and groceries?', options: ['Supermarket', 'Post Office', 'Bank'], answer: 'Supermarket', icon: '🛒' },
  ] as DailyLifeQuestion[],

  memoryStories: [
    {
      title: 'A Sunday Morning in the Garden',
      icon: '🌻',
      story: 'On a sunny Sunday morning, Mary walked into her blooming garden. She wore a bright yellow sunhat and gently watered her red roses. Her fluffy grey cat, Whiskers, sat peacefully by the wooden bench listening to the birds.',
      questions: [
        { question: 'What day of the week was it?', options: ['Sunday', 'Wednesday', 'Friday'], answer: 'Sunday' },
        { question: 'What color was Mary’s sunhat?', options: ['Yellow', 'Blue', 'Green'], answer: 'Yellow' },
        { question: 'What flowers did Mary water?', options: ['Red roses', 'Tulips', 'Daisies'], answer: 'Red roses' },
        { question: 'What was the cat’s name?', options: ['Whiskers', 'Barnaby', 'Shadow'], answer: 'Whiskers' },
        { question: 'Where did Whiskers sit?', options: ['By the wooden bench', 'On the roof', 'In the kitchen'], answer: 'By the wooden bench' },
      ],
    },
    {
      title: 'Baking Fresh Apple Pies',
      icon: '🥧',
      story: 'Grandpa Thomas baked a warm apple pie with cinnamon. He placed three shiny green apples on the kitchen table, rolled the pie crust, and set the oven timer for forty minutes until the kitchen smelled sweet.',
      questions: [
        { question: 'Who was baking in the kitchen?', options: ['Grandpa Thomas', 'Uncle David', 'Chef Robert'], answer: 'Grandpa Thomas' },
        { question: 'What kind of pie did he bake?', options: ['Apple pie', 'Cherry pie', 'Peach pie'], answer: 'Apple pie' },
        { question: 'How many green apples were on the table?', options: ['Three', 'Five', 'Two'], answer: 'Three' },
        { question: 'What spice did he use?', options: ['Cinnamon', 'Pepper', 'Ginger'], answer: 'Cinnamon' },
      ],
    },
    {
      title: 'An Afternoon at the Seaside Harbor',
      icon: '⛵',
      story: 'Arthur and his granddaughter Lily visited the coastal harbor. They watched two blue boats glide across the calm water, shared a paper bag of warm roasted peanuts, and enjoyed the cool ocean breeze.',
      questions: [
        { question: 'Where did Arthur and Lily visit?', options: ['Coastal harbor', 'Train museum', 'Forest park'], answer: 'Coastal harbor' },
        { question: 'What color were the boats?', options: ['Blue', 'Red', 'Yellow'], answer: 'Blue' },
        { question: 'What treat did they share?', options: ['Roasted peanuts', 'Ice cream', 'Popcorn'], answer: 'Roasted peanuts' },
        { question: 'How many boats did they watch?', options: ['Two', 'Four', 'Six'], answer: 'Two' },
      ],
    },
  ] as MemoryStory[],

  rememberPlaceScenes: [
    {
      name: 'A Cozy Kitchen',
      icon: '🍳',
      description: 'A cheerful kitchen featuring a red tea kettle on the stove, a sky-blue ceramic mug on the table, freshly baked cookies on a white platter, and a green succulent on the windowsill.',
      details: ['Red kettle on stove', 'Sky-blue mug on table', 'Cookies on white platter', 'Green succulent by window'],
      questions: [
        { question: 'What color was the kettle on the stove?', options: ['Red', 'Blue', 'Yellow', 'Black'], answer: 'Red' },
        { question: 'What treat was on the white platter?', options: ['Cookies', 'Sandwiches', 'Fruit', 'Cake'], answer: 'Cookies' },
        { question: 'What color was the ceramic mug?', options: ['Sky-blue', 'Red', 'Purple', 'Orange'], answer: 'Sky-blue' },
        { question: 'What plant was on the windowsill?', options: ['Green succulent', 'Red rose', 'Fern', 'Orchid'], answer: 'Green succulent' },
      ],
    },
    {
      name: 'The Quiet Living Room',
      icon: '🛋️',
      description: 'A cozy living room with a warm brown armchair, a large round wall clock, a bright yellow decorative cushion, and a sweet cat asleep on the woven rug.',
      details: ['Brown armchair', 'Round wall clock', 'Yellow cushion', 'Cat asleep on rug'],
      questions: [
        { question: 'What color was the armchair?', options: ['Brown', 'Green', 'Navy', 'White'], answer: 'Brown' },
        { question: 'What shape was the wall clock?', options: ['Round', 'Square', 'Triangle', 'Hexagon'], answer: 'Round' },
        { question: 'What color was the decorative cushion?', options: ['Yellow', 'Red', 'Blue', 'Pink'], answer: 'Yellow' },
        { question: 'Who was resting on the woven rug?', options: ['A sleeping cat', 'A puppy', 'A teddy bear', 'A book'], answer: 'A sleeping cat' },
      ],
    },
  ] as RememberPlaceScene[],

  familyTableScenes: [
    {
      tableName: 'Family Dinner Table',
      seats: [
        { position: 'Top Head', member: 'Grandfather Arthur', emoji: '👴', food: 'Roast Chicken' },
        { position: 'Left Side', member: 'Daughter Sarah', emoji: '👩', food: 'Steamed Greens' },
        { position: 'Right Side', member: 'Granddaughter Lily', emoji: '👧', food: 'Apple Salad' },
        { position: 'Bottom End', member: 'Son-in-law David', emoji: '👨', food: 'Warm Bread' },
      ],
      questions: [
        { question: 'Who sat at the Head (Top) of the table?', options: ['Grandfather Arthur', 'Daughter Sarah', 'Granddaughter Lily', 'David'], answer: 'Grandfather Arthur' },
        { question: 'Who was seated on the Left Side?', options: ['Daughter Sarah', 'Grandfather Arthur', 'David', 'Lily'], answer: 'Daughter Sarah' },
        { question: 'Who was seated on the Right Side?', options: ['Granddaughter Lily', 'Sarah', 'David', 'Arthur'], answer: 'Granddaughter Lily' },
        { question: 'Who was seated at the Bottom End?', options: ['Son-in-law David', 'Arthur', 'Sarah', 'Lily'], answer: 'Son-in-law David' },
      ],
    },
  ] as FamilyTableScene[],

  whatComesNextPatterns: [
    { seq: ['🔴', '🔵', '🔴', '🔵'], answer: '🔴', options: ['🔴', '🔵', '🟢', '🟡'], explanation: 'Alternates Red then Blue' },
    { seq: ['🍎', '🍌', '🍎', '🍌'], answer: '🍎', options: ['🍎', '🍌', '🍊', '🍇'], explanation: 'Alternates Apple then Banana' },
    { seq: ['⭐', '🌙', '⭐', '🌙'], answer: '⭐', options: ['⭐', '🌙', '☀️', '🌟'], explanation: 'Alternates Star then Crescent Moon' },
    { seq: ['🐶', '🐱', '🐶', '🐱'], answer: '🐶', options: ['🐶', '🐱', '🐦', '🐟'], explanation: 'Alternates Puppy then Kitten' },
    { seq: ['🔴', '🔵', '🟢', '🔴', '🔵', '🟢'], answer: '🔴', options: ['🔴', '🔵', '🟢', '🟡'], explanation: 'Repeats sequence Red, Blue, Green' },
    { seq: ['1️⃣', '2️⃣', '3️⃣', '1️⃣', '2️⃣', '3️⃣'], answer: '1️⃣', options: ['1️⃣', '2️⃣', '3️⃣', '4️⃣'], explanation: 'Repeats counting digits 1, 2, 3' },
    { seq: ['☀️', '🌤️', '🌧️', '☀️', '🌤️', '🌧️'], answer: '☀️', options: ['☀️', '🌤️', '🌧️', '⛈️'], explanation: 'Weather sequence cycle' },
    { seq: ['🔺', '🔷', '🔺', '🔷'], answer: '🔺', options: ['🔺', '🔷', '⭐', '⬛'], explanation: 'Alternates Triangle then Diamond' },
  ] as WhatComesNextPattern[],

  pictureOrderingTasks: [
    {
      title: 'Brewing a Fresh Cup of Tea',
      icon: '🍵',
      steps: [
        { step: 1, text: 'Boil fresh water in the kettle', emoji: '🫖' },
        { step: 2, text: 'Place a tea bag into the cup', emoji: '☕' },
        { step: 3, text: 'Pour the hot water over tea bag', emoji: '💧' },
        { step: 4, text: 'Enjoy your soothing warm tea', emoji: '😋' },
      ],
    },
    {
      title: 'Brushing Teeth Morning Routine',
      icon: '🪥',
      steps: [
        { step: 1, text: 'Pick up your toothbrush', emoji: '🪥' },
        { step: 2, text: 'Squeeze toothpaste on the bristles', emoji: '🫧' },
        { step: 3, text: 'Brush teeth all around cleanly', emoji: '✨' },
        { step: 4, text: 'Rinse mouth with fresh water', emoji: '💧' },
      ],
    },
    {
      title: 'Mailing a Letter to Family',
      icon: '✉️',
      steps: [
        { step: 1, text: 'Write a heartfelt letter on paper', emoji: '✍️' },
        { step: 2, text: 'Fold and place letter into envelope', emoji: '✉️' },
        { step: 3, text: 'Attach the postal stamp on corner', emoji: '🏷️' },
        { step: 4, text: 'Drop envelope into the mailbox', emoji: '📮' },
      ],
    },
  ] as PictureOrderingTask[],

  dailyRoutines: [
    {
      routineName: 'Morning Routine',
      steps: ['Wake up in morning', 'Wash face & brush teeth', 'MISSING_STEP', 'Enjoy breakfast'],
      missingStep: 'Get dressed for the day',
      options: ['Get dressed for the day', 'Go to sleep for night', 'Turn off room lights', 'Lock front door'],
      icon: '🌅',
    },
    {
      routineName: 'Making a Fresh Sandwich',
      steps: ['Take two slices of bread', 'Spread butter or mayonnaise', 'MISSING_STEP', 'Slice and enjoy eating'],
      missingStep: 'Add cheese or preferred fillings',
      options: ['Add cheese or preferred fillings', 'Put on winter boots', 'Open an umbrella', 'Wash the car'],
      icon: '🥪',
    },
    {
      routineName: 'Evening Bedtime Routine',
      steps: ['Put on cozy pyjamas', 'Brush teeth cleanly', 'MISSING_STEP', 'Fall asleep peacefully'],
      missingStep: 'Turn off the bedside lamp',
      options: ['Turn off the bedside lamp', 'Go for morning jog', 'Bake breakfast cookies', 'Mow lawn'],
      icon: '🌙',
    },
  ] as DailyRoutineTask[],

  shapeMatchingList: [
    { name: 'Circle', emoji: '⚪', shapeType: 'circle' },
    { name: 'Square', emoji: '⬛', shapeType: 'square' },
    { name: 'Triangle', emoji: '🔺', shapeType: 'triangle' },
    { name: 'Star', emoji: '⭐', shapeType: 'star' },
    { name: 'Diamond', emoji: '🔷', shapeType: 'diamond' },
    { name: 'Heart', emoji: '❤️', shapeType: 'heart' },
  ] as ShapeMatchingItem[],

  colorMatchingList: [
    { name: 'Crimson Red', hex: '#ef4444', bgClass: 'bg-red-500', borderClass: 'border-red-600' },
    { name: 'Ocean Blue', hex: '#3b82f6', bgClass: 'bg-blue-500', borderClass: 'border-blue-600' },
    { name: 'Emerald Green', hex: '#10b981', bgClass: 'bg-emerald-500', borderClass: 'border-emerald-600' },
    { name: 'Amber Yellow', hex: '#f59e0b', bgClass: 'bg-amber-400', borderClass: 'border-amber-500' },
    { name: 'Royal Purple', hex: '#8b5cf6', bgClass: 'bg-purple-500', borderClass: 'border-purple-600' },
    { name: 'Coral Orange', hex: '#f97316', bgClass: 'bg-orange-500', borderClass: 'border-orange-600' },
  ] as ColorMatchingItem[],

  recallObjectPool: ['🍎', '🔑', '📱', '☕', '📚', '⏰', '🥄', '🔔', '✂️', '🖊️', '👟', '🎩', '👓', '🌺', '🧸'],
};
