import { a, defineData } from '@aws-amplify/backend';
import { askBedrock } from '../functions/askBedrockGql/resource';

// define & export schema
export const schema = a.schema({
  Recipe: a.customType({
    title: a.string(),
    steps: a.string().array(),
  }),

  askBedrock: a
    .query()
    .arguments({ ingredients: a.string().array().required() })
    .returns(a.ref('Recipe'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(askBedrock)),
});

// pass schema into defineData
export const data = defineData({ schema });

// export type for frontend
export type Schema = typeof schema;
