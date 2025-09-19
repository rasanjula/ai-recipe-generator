// amplify/functions/askBedrockGql/handler.ts
// Minimal handler: takes { ingredients: string[] } and returns a Recipe-like object
// Matches the schema we'll define in amplify/data/resource.ts

type Event = {
  arguments: {
    ingredients: string[];
  };
};

export const handler = async (event: Event) => {
  const ingredients = event.arguments?.ingredients ?? [];

  // Build a very simple "recipe" without any external calls
  const title =
    ingredients.length > 0
      ? `Quick Dish with ${ingredients[0]}`
      : 'Quick Dish';

  const steps = [
    `Gather ingredients: ${ingredients.join(', ') || 'your basics'}.`,
    'Mix everything in a bowl.',
    'Cook for 10–12 minutes.',
    'Serve warm and enjoy!',
  ];

  return {
    title,
    steps,
  };
};
