/// <reference types="node" />
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION ?? "us-east-1" });
const MODEL_ID = process.env.MODEL_ID ?? "anthropic.claude-3-sonnet-20240229-v1:0";

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const method = event.requestContext?.http?.method;
  if (method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "content-type,authorization",
        "access-control-allow-methods": "POST,OPTIONS",
      },
      body: "",
    };
  }

  try {
    const input = event.body ? (JSON.parse(event.body) as {
      ingredients?: string[];
      cuisine?: string;
      diet?: string;
      servings?: number;
    }) : {};

    const { ingredients = [], cuisine = "any", diet = "none", servings = 2 } = input;

    const userPrompt = [
      "You are a helpful recipe generator.",
      `Ingredients: ${ingredients.join(", ") || "any pantry staples"}.`,
      `Cuisine: ${cuisine}. Diet: ${diet}.`,
      `Make one recipe for ${servings} servings with steps and quantities.`,
      "Return concise markdown: Title, Ingredients (bulleted), Steps (numbered).",
    ].join(" ");

    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 400,
      temperature: 0.6,
      messages: [{ role: "user", content: [{ type: "text", text: userPrompt }] }],
    };

    const resp = await client.send(new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: Buffer.from(JSON.stringify(payload)),
    }));

    const json = JSON.parse(Buffer.from(resp.body as Uint8Array).toString("utf-8"));
    const text =
      Array.isArray(json?.content) && json.content[0]?.text
        ? json.content[0].text
        : "No content";

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "content-type,authorization",
        "access-control-allow-methods": "POST,OPTIONS",
      },
      body: JSON.stringify({ ok: true, modelId: MODEL_ID, recipe: text }),
    };
  } catch (err: any) {
    console.error(err);
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
      },
      body: JSON.stringify({ ok: false, error: err?.message ?? "Error" }),
    };
  }
};
