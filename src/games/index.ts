import { gameRegistry } from './GameRegistry';

// Core standard diagnostic games
import { MemoryTrainingGame } from './MemoryTrainingGame';
import { TouchSequenceGame } from './TouchSequenceGame';
import { ConcentrationGame } from './ConcentrationGame';
import { IconIdentificationGame } from './IconIdentificationGame';
import { GraphInterpretationGame } from './GraphInterpretationGame';
import { VisionAdaptationGame } from './VisionAdaptationGame';

// 1. Memory & Recall
import {
  MemoryCardMatchGame,
  RememberObjectsGame,
  WhichDisappearedGame,
  RememberPictureGame,
  WhichOneDidYouSeeGame,
} from './MemoryGames';

// 2. Attention & Observation
import {
  FindDifferentGame,
  SameOrDifferentGame,
  RememberColorsGame,
  ObjectSpottingGame,
  VisualSearchGame,
} from './AttentionGames';

// 3. Association & Recognition
import {
  MatchObjectPlaceGame,
  MatchObjectUseGame,
  WordAssociationGame,
  FamiliarObjectGame,
  AnimalFoodGame,
} from './AssociationGames';

// 4. Sequence & Ordering
import {
  WhatComesNextGame,
  RememberOrderGame,
  PictureOrderingGame,
  DailyRoutineGame,
  NumberMemoryGame,
} from './SequenceGames';

// 5. Daily Life & Familiarity
import {
  DailyLifeRecallGame,
  MorningOrNightGame,
  FamilyTableGame,
  RememberPlaceGame,
  MemoryStoryGame,
} from './DailyLifeGames';

// 6. Visual & Spatial Thinking
import {
  RememberLocationGame,
  ColorShapeMatchingGame,
  ShapeMatchingGame,
  ColorMatchingGame,
  VisualMemoryGridGame,
} from './VisualSpatialGames';

// ==========================================
// CATEGORY 1: MEMORY & RECALL (6 Games)
// ==========================================
gameRegistry.registerGame({
  gameId: 'memory_card_match',
  category: 'MEMORY_RECALL',
  domain: 'memory',
  title: 'Memory Card Match',
  description: 'Flip and match pairs of cards to sharpen short-term memory.',
  instructions: 'Tap any card to flip it over. Find and match pairs of matching items with as few attempts as possible.',
  icon: '🧠',
  targetTimeSeconds: 40,
  component: MemoryCardMatchGame,
});

gameRegistry.registerGame({
  gameId: 'remember_objects',
  category: 'MEMORY_RECALL',
  domain: 'memory',
  title: 'Remember the Objects',
  description: 'Study a collection of items and recall which ones were shown.',
  instructions: 'Look closely at the objects displayed. After time runs out, select all objects that you saw earlier.',
  icon: '📦',
  targetTimeSeconds: 35,
  component: RememberObjectsGame,
});

gameRegistry.registerGame({
  gameId: 'which_disappeared',
  category: 'MEMORY_RECALL',
  domain: 'memory',
  title: 'Which Object Disappeared?',
  description: 'Memorize objects, watch one disappear, and identify the missing one.',
  instructions: 'Study all objects on screen. When one object vanishes, pick which item is missing from the group.',
  icon: '👀',
  targetTimeSeconds: 35,
  component: WhichDisappearedGame,
});

gameRegistry.registerGame({
  gameId: 'remember_picture',
  category: 'MEMORY_RECALL',
  domain: 'memory',
  title: 'Remember the Picture',
  description: 'Explore a detailed scene narrative and answer recall questions.',
  instructions: 'Read and picture the scene description in your mind, then answer questions about the visual details.',
  icon: '🖼️',
  targetTimeSeconds: 45,
  component: RememberPictureGame,
});

gameRegistry.registerGame({
  gameId: 'which_one_did_you_see',
  category: 'MEMORY_RECALL',
  domain: 'memory',
  title: 'Which One Did You See?',
  description: 'Instant target flash identification among similar alternatives.',
  instructions: 'An object will flash briefly on your screen. Tap the correct matching item from the options.',
  icon: '✨',
  targetTimeSeconds: 25,
  component: WhichOneDidYouSeeGame,
});

gameRegistry.registerGame({
  gameId: 'memory_training',
  category: 'MEMORY_RECALL',
  domain: 'memory',
  title: 'Structured Memory Matrix',
  description: 'Standardized clinical pair recall matching with timed tracking.',
  instructions: 'Memorize and match all matching symbol pairs across the structured diagnostic matrix.',
  icon: '🎴',
  targetTimeSeconds: 40,
  component: MemoryTrainingGame,
  isCoreDiagnostic: true,
});

// ==========================================
// CATEGORY 2: ATTENTION & OBSERVATION (6 Games)
// ==========================================
gameRegistry.registerGame({
  gameId: 'find_different',
  category: 'ATTENTION_OBSERVATION',
  domain: 'attention',
  title: 'Find the Different Object',
  description: 'Spot the odd one out in a grid of similar visual items.',
  instructions: 'Look across all items in the grid. Spot the single object that is different and tap it quickly.',
  icon: '🔍',
  targetTimeSeconds: 30,
  component: FindDifferentGame,
});

gameRegistry.registerGame({
  gameId: 'same_or_different',
  category: 'ATTENTION_OBSERVATION',
  domain: 'attention',
  title: 'Same or Different?',
  description: 'Compare two side-by-side items and determine if they match.',
  instructions: 'Compare the two displayed symbols. Tap SAME if they match exactly, or DIFFERENT if they do not.',
  icon: '⚖️',
  targetTimeSeconds: 25,
  component: SameOrDifferentGame,
});

gameRegistry.registerGame({
  gameId: 'remember_colors',
  category: 'ATTENTION_OBSERVATION',
  domain: 'attention',
  title: 'Remember the Colors',
  description: 'Observe animated color sequence flashes and repeat in order.',
  instructions: 'Watch the sequence of color flashes carefully, then tap the color buttons in the exact same order.',
  icon: '🎨',
  targetTimeSeconds: 35,
  component: RememberColorsGame,
});

gameRegistry.registerGame({
  gameId: 'object_spotting',
  category: 'ATTENTION_OBSERVATION',
  domain: 'attention',
  title: 'Object Spotting',
  description: 'Find target items hidden in a mixed clutter of distractor items.',
  instructions: 'Search through the cluttered board and tap all hidden target keys as fast as you can.',
  icon: '🎯',
  targetTimeSeconds: 35,
  component: ObjectSpottingGame,
});

gameRegistry.registerGame({
  gameId: 'visual_search',
  category: 'ATTENTION_OBSERVATION',
  domain: 'attention',
  title: 'Simple Visual Search',
  description: 'Rapid scanning and detection of a specific target symbol.',
  instructions: 'Scan the grid to spot the target symbol shown at the top of the screen.',
  icon: '🔎',
  targetTimeSeconds: 30,
  component: VisualSearchGame,
});

gameRegistry.registerGame({
  gameId: 'concentration',
  category: 'ATTENTION_OBSERVATION',
  domain: 'attention',
  title: 'Focus Flanker & Target Finder',
  description: 'Standardized flanker discrimination amidst visual distractors.',
  instructions: 'Focus on the target arrows or symbols while ignoring conflicting surrounding distractors.',
  icon: '🎯',
  targetTimeSeconds: 35,
  component: ConcentrationGame,
  isCoreDiagnostic: true,
});

// ==========================================
// CATEGORY 3: ASSOCIATION & RECOGNITION (6 Games)
// ==========================================
gameRegistry.registerGame({
  gameId: 'match_object_place',
  category: 'ASSOCIATION_RECOGNITION',
  domain: 'logic',
  title: 'Match Object to Place',
  description: 'Connect everyday household items to their natural room or place.',
  instructions: 'Look at the object and choose the room or location where it naturally belongs.',
  icon: '📍',
  targetTimeSeconds: 30,
  component: MatchObjectPlaceGame,
});

gameRegistry.registerGame({
  gameId: 'match_object_use',
  category: 'ASSOCIATION_RECOGNITION',
  domain: 'logic',
  title: 'Match Object to Use',
  description: 'Identify functional uses of common tools and household objects.',
  instructions: 'Read the options and choose what the displayed object is commonly used for.',
  icon: '🛠️',
  targetTimeSeconds: 30,
  component: MatchObjectUseGame,
});

gameRegistry.registerGame({
  gameId: 'word_association',
  category: 'ASSOCIATION_RECOGNITION',
  domain: 'logic',
  title: 'Word Association',
  description: 'Link related concepts, professions, and familiar pairs.',
  instructions: 'Choose the word that has the strongest and most natural connection to the prompt word.',
  icon: '🔗',
  targetTimeSeconds: 30,
  component: WordAssociationGame,
});

gameRegistry.registerGame({
  gameId: 'familiar_object',
  category: 'ASSOCIATION_RECOGNITION',
  domain: 'logic',
  title: 'Familiar Object Recognition',
  description: 'Identify everyday objects based on descriptive clues and icons.',
  instructions: 'Read the clue and choose the correct name of the familiar object shown.',
  icon: '💡',
  targetTimeSeconds: 30,
  component: FamiliarObjectGame,
});

gameRegistry.registerGame({
  gameId: 'animal_food',
  category: 'ASSOCIATION_RECOGNITION',
  domain: 'logic',
  title: 'Animal & Food Recognition',
  description: 'Identify and classify animals, fruits, and vegetable items.',
  instructions: 'Look at the picture and identify the correct animal or food item from the choices.',
  icon: '🍎',
  targetTimeSeconds: 30,
  component: AnimalFoodGame,
});

gameRegistry.registerGame({
  gameId: 'icon_identification',
  category: 'ASSOCIATION_RECOGNITION',
  domain: 'logic',
  title: 'Daily Item & Category Naming',
  description: 'Classify items into functional semantic categories.',
  instructions: 'Examine each item and classify it into its broader functional category.',
  icon: '❤️',
  targetTimeSeconds: 35,
  component: IconIdentificationGame,
  isCoreDiagnostic: true,
});

// ==========================================
// CATEGORY 4: SEQUENCE & ORDERING (7 Games)
// ==========================================
gameRegistry.registerGame({
  gameId: 'what_comes_next',
  category: 'SEQUENCE_ORDERING',
  domain: 'logic',
  title: 'What Comes Next?',
  description: 'Identify sequential pattern rules and complete the next item.',
  instructions: 'Look at the sequence of symbols. Deduce the repeating pattern and pick what comes next.',
  icon: '➡️',
  targetTimeSeconds: 35,
  component: WhatComesNextGame,
});

gameRegistry.registerGame({
  gameId: 'remember_order',
  category: 'SEQUENCE_ORDERING',
  domain: 'logic',
  title: 'Remember the Order',
  description: 'Memorize animated object display order and tap in exact sequence.',
  instructions: 'Watch items appear one by one. Tap the options to reproduce the exact display order.',
  icon: '🔢',
  targetTimeSeconds: 35,
  component: RememberOrderGame,
});

gameRegistry.registerGame({
  gameId: 'picture_ordering',
  category: 'SEQUENCE_ORDERING',
  domain: 'logic',
  title: 'Picture & Step Ordering',
  description: 'Arrange everyday activity steps into chronological order.',
  instructions: 'Tap the activity steps in order from first step to final step.',
  icon: '📋',
  targetTimeSeconds: 45,
  component: PictureOrderingGame,
});

gameRegistry.registerGame({
  gameId: 'daily_routine',
  category: 'SEQUENCE_ORDERING',
  domain: 'logic',
  title: 'Complete the Daily Routine',
  description: 'Identify the missing procedural step in daily morning/evening habits.',
  instructions: 'Review the steps of the routine and select the missing step to complete it.',
  icon: '🌅',
  targetTimeSeconds: 35,
  component: DailyRoutineGame,
});

gameRegistry.registerGame({
  gameId: 'number_memory',
  category: 'SEQUENCE_ORDERING',
  domain: 'logic',
  title: 'Simple Number Memory',
  description: 'Memorize number sequences and type them back in order.',
  instructions: 'Memorize the digits shown on screen, then enter them in the same order using the number pad.',
  icon: '⏰',
  targetTimeSeconds: 35,
  component: NumberMemoryGame,
});

gameRegistry.registerGame({
  gameId: 'touch_sequence',
  category: 'SEQUENCE_ORDERING',
  domain: 'response_time',
  title: 'Chime Sequence Recall',
  description: 'Psychomotor chime sequence recall and reaction speed.',
  instructions: 'Watch the illuminated musical colored pads and tap the sequence in order.',
  icon: '⚡',
  targetTimeSeconds: 30,
  component: TouchSequenceGame,
  isCoreDiagnostic: true,
});

gameRegistry.registerGame({
  gameId: 'graph_interpretation',
  category: 'SEQUENCE_ORDERING',
  domain: 'logic',
  title: 'Trail Connect & Sequence Matrix',
  description: 'Trail Making Test connecting numbers and letters alternately.',
  instructions: 'Connect numbers and letters in alternating sequence (1 -> A -> 2 -> B) without crossing trails.',
  icon: '📊',
  targetTimeSeconds: 45,
  component: GraphInterpretationGame,
  isCoreDiagnostic: true,
});

// ==========================================
// CATEGORY 5: DAILY LIFE & FAMILIARITY (5 Games)
// ==========================================
gameRegistry.registerGame({
  gameId: 'daily_life_recall',
  category: 'DAILY_LIFE_FAMILIARITY',
  domain: 'memory',
  title: 'Daily Life Recall',
  description: 'Recall everyday knowledge, calendar facts, and practical habits.',
  instructions: 'Answer practical everyday questions about household items, meals, and daily routines.',
  icon: '🏠',
  targetTimeSeconds: 35,
  component: DailyLifeRecallGame,
});

gameRegistry.registerGame({
  gameId: 'morning_or_night',
  category: 'DAILY_LIFE_FAMILIARITY',
  domain: 'memory',
  title: 'Morning or Night?',
  description: 'Classify daily habits, meals, and routines as day or night.',
  instructions: 'Read the activity and choose whether it usually happens in the Morning or at Night.',
  icon: '☀️',
  targetTimeSeconds: 30,
  component: MorningOrNightGame,
});

gameRegistry.registerGame({
  gameId: 'family_table',
  category: 'DAILY_LIFE_FAMILIARITY',
  domain: 'memory',
  title: 'Remember the Family Table',
  description: 'Recall family seating positions and dinner arrangements.',
  instructions: 'Study where each family member is seated around the dinner table, then answer seating questions.',
  icon: '👥',
  targetTimeSeconds: 40,
  component: FamilyTableGame,
});

gameRegistry.registerGame({
  gameId: 'remember_place',
  category: 'DAILY_LIFE_FAMILIARITY',
  domain: 'memory',
  title: 'Remember the Place',
  description: 'Explore household rooms and recall specific objects and colors.',
  instructions: 'Picture the room and its details, then answer recall questions about what was in the room.',
  icon: '🛋️',
  targetTimeSeconds: 40,
  component: RememberPlaceGame,
});

gameRegistry.registerGame({
  gameId: 'memory_story',
  category: 'DAILY_LIFE_FAMILIARITY',
  domain: 'memory',
  title: 'Memory Story',
  description: 'Read a short warm narrative followed by story comprehension questions.',
  instructions: 'Read the short story carefully, take your time, and answer questions about the story.',
  icon: '📖',
  targetTimeSeconds: 50,
  component: MemoryStoryGame,
});

// ==========================================
// CATEGORY 6: VISUAL & SPATIAL THINKING (6 Games)
// ==========================================
gameRegistry.registerGame({
  gameId: 'remember_location',
  category: 'VISUAL_SPATIAL',
  domain: 'attention',
  title: 'Remember the Location',
  description: 'Memorize grid placement and place items back into their coordinates.',
  instructions: 'Look where each item is placed on the grid. Then place each item back in its exact square.',
  icon: '🗺️',
  targetTimeSeconds: 40,
  component: RememberLocationGame,
});

gameRegistry.registerGame({
  gameId: 'color_shape_matching',
  category: 'VISUAL_SPATIAL',
  domain: 'attention',
  title: 'Color & Shape Matching',
  description: 'Match items based on both color and geometric shape simultaneously.',
  instructions: 'Look at the target shape and color. Tap the choice that matches BOTH shape and color.',
  icon: '🔷',
  targetTimeSeconds: 30,
  component: ColorShapeMatchingGame,
});

gameRegistry.registerGame({
  gameId: 'shape_matching',
  category: 'VISUAL_SPATIAL',
  domain: 'attention',
  title: 'Shape Matching',
  description: 'Identify geometric shapes and silhouettes.',
  instructions: 'Identify the target shape and tap the matching geometric shape from the options.',
  icon: '🔺',
  targetTimeSeconds: 25,
  component: ShapeMatchingGame,
});

gameRegistry.registerGame({
  gameId: 'color_matching',
  category: 'VISUAL_SPATIAL',
  domain: 'attention',
  title: 'Color Matching',
  description: 'Compare color hues and shades for precise visual discrimination.',
  instructions: 'Look at the target color swatch and choose the matching color name or shade.',
  icon: '🎨',
  targetTimeSeconds: 25,
  component: ColorMatchingGame,
});

gameRegistry.registerGame({
  gameId: 'visual_memory_grid',
  category: 'VISUAL_SPATIAL',
  domain: 'attention',
  title: 'Visual Memory Grid',
  description: 'Matrix spatial recall of illuminated grid cells.',
  instructions: 'Watch which tiles light up blue. When they turn off, tap the exact same tiles.',
  icon: '▦',
  targetTimeSeconds: 35,
  component: VisualMemoryGridGame,
});

gameRegistry.registerGame({
  gameId: 'vision_adaptation',
  category: 'VISUAL_SPATIAL',
  domain: 'attention',
  title: 'Contrast & Spatial Search',
  description: 'Standardized spatial orientation search and contrast adaptation.',
  instructions: 'Identify contrast variations and spatial grid orientation changes under adaptive contrast.',
  icon: '👁️',
  targetTimeSeconds: 30,
  component: VisionAdaptationGame,
  isCoreDiagnostic: true,
});

export { gameRegistry };
