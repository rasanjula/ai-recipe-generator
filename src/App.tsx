import { useState, type FormEvent } from "react";
import "./App.css";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";

const client = generateClient<Schema>();

type Recipe = { title: string; steps: string[] };
type AskBedrockResp = { data: Recipe; errors?: { message?: string }[] }; // ✅ added

export default function App() {
  const [ingredientsText, setIngredientsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecipe(null);

    try {
      const ingredients = ingredientsText
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);

      // ✅ cast only this call; keeps the rest strongly typed
      const res = (await (client as any).queries.askBedrock({ ingredients })) as AskBedrockResp;

      if (res.errors?.length) {
        throw new Error(
          res.errors.map((er: { message?: string }) => er.message ?? "").join("; ")
        );
      }
      setRecipe(res.data as Recipe);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header-container">
        <h1 className="main-header">
          Meet Your Personal <span className="highlight">Recipe AI</span>
        </h1>
        <p className="description">
          Type a few ingredients like{" "}
          <em>chicken, white rice, yellow squash, onion</em> and generate a quick recipe.
        </p>
      </header>

      <form className="form-container" onSubmit={onSubmit}>
        <div className="search-container">
          <input
            className="wide-input"
            placeholder="ingredient1, ingredient2, ingredient3"
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
          />
          <button className="search-button" type="submit" disabled={loading}>
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </form>

      <div className="result-container" style={{ minHeight: 40 }}>
        {loading && <div className="loader-container">Working on your recipe…</div>}
        {error && <div className="result">Error: {error}</div>}
        {recipe && (
          <div className="result">
            <h3 style={{ marginTop: 0 }}>{recipe.title}</h3>
            <ol style={{ paddingLeft: 18, margin: 0 }}>
              {recipe.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
