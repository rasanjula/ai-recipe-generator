// amplify/backend.ts
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';          // already in your tree
import { data } from './data/resource';
import { askBedrock } from './functions/askBedrockGql/resource';

export const backend = defineBackend({
  auth,
  data,
  askBedrock,
});
