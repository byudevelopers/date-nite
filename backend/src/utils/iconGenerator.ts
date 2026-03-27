// Map keywords to emojis
const ICON_MAPPING: Record<string, string> = {
  // Food & Drink
  ice: '🍦', cream: '🍦', coffee: '☕', pizza: '🍕', burger: '🍔',
  restaurant: '🍽️', dinner: '🍽️', lunch: '🥗', breakfast: '🥞',
  dessert: '🍰', bakery: '🧁', taco: '🌮', sushi: '🍣',

  // Entertainment
  movie: '🎬', cinema: '🎬', theater: '🎭', concert: '🎵',
  music: '🎶', game: '🎮', bowling: '🎳', arcade: '🕹️',

  // Outdoor
  park: '🌳', hike: '🥾', beach: '🏖️', picnic: '🧺',
  bike: '🚴', walk: '🚶', trail: '🥾',

  // Activities
  art: '🎨', museum: '🖼️', paint: '🎨', cook: '👨‍🍳',
  book: '📚', read: '📖', dance: '💃', yoga: '🧘',

  // Sports
  sport: '⚽', basketball: '🏀', tennis: '🎾', golf: '⛳',
  swim: '🏊', gym: '💪',

  // Default
  default: '❤️'
};

export function generateIcon(name: string, type: 'venue' | 'non-venue'): string {
  const lowerName = name.toLowerCase();

  // Check each keyword in mapping
  for (const [keyword, emoji] of Object.entries(ICON_MAPPING)) {
    if (lowerName.includes(keyword)) {
      return emoji;
    }
  }

  // Default emoji
  return ICON_MAPPING.default;
}
