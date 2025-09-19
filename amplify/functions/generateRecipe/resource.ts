import { defineFunction } from "@aws-amplify/backend";

export const generateRecipe = defineFunction({
  name: "generateRecipe",
  entry: "./handler.ts",
  timeoutSeconds: 30,
  memoryMB: 512,
});
