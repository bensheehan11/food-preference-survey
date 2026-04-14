import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { supabase } from "@/lib/supabase";
import type { SurveyResponse } from "@/lib/supabase";
import Footer from "@/components/Footer";

const ACCENT = "#8A3BDB";

const CUISINE_ORDER = [
  "American",
  "Italian",
  "Mexican",
  "Chinese",
  "Japanese",
  "Indian",
  "Mediterranean",
  "Thai",
  "Other",
];

const FREQUENCY_ORDER = [
  "Daily",
  "A few times a week",
  "Once a week",
  "A few times a month",
  "Rarely",
];

function normalizeFood(food: string): string {
  const trimmed = food.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

function buildCuisineData(responses: SurveyResponse[]) {
  const counts: Record<string, number> = {};
  for (const cuisine of CUISINE_ORDER) counts[cuisine] = 0;
  for (const r of responses) {
    if (r.cuisine_type in counts) counts[r.cuisine_type]++;
  }
  return CUISINE_ORDER.map((name) => ({ name, count: counts[name] }));
}

function buildFoodData(responses: SurveyResponse[]) {
  const counts: Record<string, number> = {};
  for (const r of responses) {
    for (const food of r.enjoyed_foods) {
      if (food === "Other") {
        if (r.other_food && r.other_food.trim()) {
          const label = normalizeFood(r.other_food);
          counts[label] = (counts[label] ?? 0) + 1;
        }
      } else {
        counts[food] = (counts[food] ?? 0) + 1;
      }
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function buildFrequencyData(responses: SurveyResponse[]) {
  const counts: Record<string, number> = {};
  for (const f of FREQUENCY_ORDER) counts[f] = 0;
  for (const r of responses) {
    if (r.eating_frequency in counts) counts[r.eating_frequency]++;
  }
  return FREQUENCY_ORDER.map((name) => ({ name, count: counts[name] }));
}

function ChartCard({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="border border-neutral-200 rounded-xl p-6 shadow-sm bg-white"
    >
      <h2 id={id} className="text-base font-semibold text-neutral-800 mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Results() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data, error } = await supabase
        .from("survey_responses")
        .select("*");
      if (error) {
        setError("Failed to load results. Please try again.");
      } else {
        setResponses(data ?? []);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const cuisineData = buildCuisineData(responses);
  const foodData = buildFoodData(responses);
  const frequencyData = buildFrequencyData(responses);
  const total = responses.length;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
        <span className="text-lg font-semibold text-neutral-900">
          Survey Results
        </span>
        <Link
          href="/"
          className="text-sm font-medium text-[#8A3BDB] hover:underline focus:outline-none focus:underline"
        >
          Home
        </Link>
      </header>

      <main className="flex-1 px-4 py-10">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-neutral-900">
            Aggregated Survey Results
          </h1>
          <p className="text-sm text-neutral-500">
            All data is aggregated and anonymous. Individual responses are never shown.
          </p>

          {loading && (
            <div
              className="flex items-center justify-center py-20"
              aria-live="polite"
              aria-busy="true"
            >
              <div
                className="w-8 h-8 rounded-full border-2 border-[#8A3BDB] border-t-transparent animate-spin"
                role="status"
                aria-label="Loading results"
              />
            </div>
          )}

          {error && !loading && (
            <div
              role="alert"
              className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700"
            >
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Total Responses */}
              <section
                aria-labelledby="total-heading"
                className="border border-neutral-200 rounded-xl p-6 shadow-sm bg-white text-center"
              >
                <h2
                  id="total-heading"
                  className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-1"
                >
                  Total Responses
                </h2>
                <p
                  className="text-6xl font-bold text-[#8A3BDB]"
                  aria-label={`${total} total responses`}
                >
                  {total}
                </p>
              </section>

              {total === 0 && (
                <p className="text-center text-neutral-500 py-8">
                  No responses yet. Be the first to{" "}
                  <Link href="/survey" className="text-[#8A3BDB] underline">
                    take the survey
                  </Link>
                  !
                </p>
              )}

              {total > 0 && (
                <>
                  {/* Cuisine Chart */}
                  <ChartCard id="cuisine-heading" title="Favorite Type of Cuisine">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart
                        data={cuisineData}
                        margin={{ top: 4, right: 8, left: -10, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "#374151" }}
                          angle={-35}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 12, fill: "#374151" }}
                        />
                        <Tooltip
                          formatter={(value: number) => [value, "Responses"]}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            fontSize: "13px",
                          }}
                        />
                        <Bar dataKey="count" name="Responses" radius={[4, 4, 0, 0]}>
                          {cuisineData.map((_, i) => (
                            <Cell key={i} fill={ACCENT} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  {/* Popular Foods Chart */}
                  <ChartCard id="foods-heading" title="Most Popular Foods">
                    {foodData.length === 0 ? (
                      <p className="text-neutral-500 text-sm">
                        No food data available.
                      </p>
                    ) : (
                      <ResponsiveContainer
                        width="100%"
                        height={Math.max(200, foodData.length * 36)}
                      >
                        <BarChart
                          data={foodData}
                          layout="vertical"
                          margin={{ top: 4, right: 24, left: 70, bottom: 4 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e5e7eb"
                            horizontal={false}
                          />
                          <XAxis
                            type="number"
                            allowDecimals={false}
                            tick={{ fontSize: 12, fill: "#374151" }}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fontSize: 12, fill: "#374151" }}
                            width={65}
                          />
                          <Tooltip
                            formatter={(value: number) => [value, "Responses"]}
                            contentStyle={{
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              fontSize: "13px",
                            }}
                          />
                          <Bar dataKey="count" name="Responses" radius={[0, 4, 4, 0]}>
                            {foodData.map((_, i) => (
                              <Cell key={i} fill={ACCENT} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </ChartCard>

                  {/* Frequency Chart */}
                  <ChartCard
                    id="frequency-heading"
                    title="How Often People Eat Their Favorite Food"
                  >
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart
                        data={frequencyData}
                        layout="vertical"
                        margin={{ top: 4, right: 24, left: 140, bottom: 4 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          allowDecimals={false}
                          tick={{ fontSize: 12, fill: "#374151" }}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 12, fill: "#374151" }}
                          width={135}
                        />
                        <Tooltip
                          formatter={(value: number) => [value, "Responses"]}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            fontSize: "13px",
                          }}
                        />
                        <Bar dataKey="count" name="Responses" radius={[0, 4, 4, 0]}>
                          {frequencyData.map((_, i) => (
                            <Cell key={i} fill={ACCENT} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
