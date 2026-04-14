import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import type { SurveyFormData } from "@/lib/supabase";
import Footer from "@/components/Footer";

const CUISINE_OPTIONS = [
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

const FREQUENCY_OPTIONS = [
  "Daily",
  "A few times a week",
  "Once a week",
  "A few times a month",
  "Rarely",
];

const FOOD_OPTIONS = [
  "Pizza",
  "Pasta",
  "Burgers",
  "Tacos",
  "Sushi",
  "Salad",
  "Other",
];

interface FormErrors {
  favorite_food?: string;
  cuisine_type?: string;
  eating_frequency?: string;
  enjoyed_foods?: string;
  other_food?: string;
}

interface SubmissionSummary {
  favorite_food: string;
  cuisine_type: string;
  eating_frequency: string;
  enjoyed_foods: string[];
  other_food: string;
}

export default function Survey() {
  const [formData, setFormData] = useState<SurveyFormData>({
    favorite_food: "",
    cuisine_type: "",
    eating_frequency: "",
    enjoyed_foods: [],
    other_food: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [summary, setSummary] = useState<SubmissionSummary | null>(null);

  const favoriteFoodRef = useRef<HTMLInputElement>(null);
  const otherFoodRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    favoriteFoodRef.current?.focus();
  }, []);

  const otherChecked = formData.enjoyed_foods.includes("Other");

  useEffect(() => {
    if (otherChecked) {
      otherFoodRef.current?.focus();
    }
  }, [otherChecked]);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!formData.favorite_food.trim()) {
      errs.favorite_food = "Please enter your favorite food.";
    }
    if (!formData.cuisine_type) {
      errs.cuisine_type = "Please select a cuisine type.";
    }
    if (!formData.eating_frequency) {
      errs.eating_frequency = "Please select how often you eat your favorite food.";
    }
    if (formData.enjoyed_foods.length === 0) {
      errs.enjoyed_foods = "Please select at least one food.";
    }
    if (otherChecked && !formData.other_food.trim()) {
      errs.other_food = "Please describe the other food you enjoy.";
    }
    return errs;
  }

  function handleCheckbox(food: string, checked: boolean) {
    setFormData((prev) => ({
      ...prev,
      enjoyed_foods: checked
        ? [...prev.enjoyed_foods, food]
        : prev.enjoyed_foods.filter((f) => f !== food),
      other_food: !checked && food === "Other" ? "" : prev.other_food,
    }));
    if (errors.enjoyed_foods || (food === "Other" && errors.other_food)) {
      setErrors((prev) => ({ ...prev, enjoyed_foods: undefined, other_food: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstErrorKey = Object.keys(errs)[0];
      const firstErrorEl = document.getElementById(`field-${firstErrorKey}`);
      firstErrorEl?.focus();
      return;
    }
    setErrors({});
    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      favorite_food: formData.favorite_food.trim(),
      cuisine_type: formData.cuisine_type,
      eating_frequency: formData.eating_frequency,
      enjoyed_foods: formData.enjoyed_foods,
      other_food: otherChecked ? formData.other_food.trim() : null,
    };

    const { error } = await supabase.from("survey_responses").insert([payload]);

    setSubmitting(false);
    if (error) {
      setSubmitError(
        "Something went wrong saving your response. Please try again."
      );
      return;
    }

    setSummary({
      favorite_food: payload.favorite_food,
      cuisine_type: payload.cuisine_type,
      eating_frequency: payload.eating_frequency,
      enjoyed_foods: payload.enjoyed_foods,
      other_food: payload.other_food ?? "",
    });
    setSubmitted(true);
  }

  if (submitted && summary) {
    const displayFoods = summary.enjoyed_foods.map((f) =>
      f === "Other" && summary.other_food ? summary.other_food : f
    );
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <header className="border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-neutral-900">
            Student Hobbies Survey
          </Link>
          <Link
            href="/results"
            className="text-sm font-medium text-[#8A3BDB] hover:underline focus:outline-none focus:underline"
          >
            View Results
          </Link>
        </header>
        <main className="flex-1 flex items-start justify-center px-4 py-12">
          <div className="max-w-lg w-full">
            <div className="rounded-xl border border-neutral-200 p-8 shadow-sm">
              <div className="text-center mb-6">
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-100 mb-4"
                  aria-hidden="true"
                >
                  <svg
                    className="w-7 h-7 text-[#8A3BDB]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                  Thank you!
                </h1>
                <p className="text-neutral-600">Your response has been recorded.</p>
              </div>

              <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                Your Answers
              </h2>
              <dl className="space-y-3 mb-8 text-neutral-900">
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Favorite food</dt>
                  <dd className="mt-0.5">{summary.favorite_food}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Favorite cuisine</dt>
                  <dd className="mt-0.5">{summary.cuisine_type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-500">How often you eat it</dt>
                  <dd className="mt-0.5">{summary.eating_frequency}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Foods you enjoy most</dt>
                  <dd className="mt-0.5">{displayFoods.join(", ")}</dd>
                </div>
              </dl>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/results"
                  className="flex-1 text-center px-5 py-2.5 rounded-lg font-semibold text-white bg-[#8A3BDB] hover:bg-[#7a2fcb] focus:outline-none focus:ring-2 focus:ring-[#8A3BDB] focus:ring-offset-2 transition-colors"
                >
                  View Results
                </Link>
                <Link
                  href="/"
                  className="flex-1 text-center px-5 py-2.5 rounded-lg font-semibold text-[#8A3BDB] border border-[#8A3BDB] hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-[#8A3BDB] focus:ring-offset-2 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-neutral-900">
          Student Hobbies Survey
        </Link>
        <Link
          href="/results"
          className="text-sm font-medium text-[#8A3BDB] hover:underline focus:outline-none focus:underline"
        >
          View Results
        </Link>
      </header>

      <main className="flex-1 px-4 py-10">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">
            Food Preferences Survey
          </h1>
          <p className="text-neutral-500 text-sm mb-8">
            All fields are required unless noted otherwise.
          </p>

          <form onSubmit={handleSubmit} noValidate aria-label="Food preferences survey">
            {/* Q1 - Favorite Food */}
            <div className="mb-7">
              <label
                htmlFor="field-favorite_food"
                className="block text-sm font-semibold text-neutral-800 mb-1"
              >
                1. What is your favorite food?
                <span className="sr-only"> (required)</span>
              </label>
              <input
                ref={favoriteFoodRef}
                id="field-favorite_food"
                type="text"
                name="favorite_food"
                placeholder="e.g. Pizza"
                required
                aria-required="true"
                aria-describedby={errors.favorite_food ? "err-favorite_food" : undefined}
                aria-invalid={!!errors.favorite_food}
                value={formData.favorite_food}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, favorite_food: e.target.value }));
                  if (errors.favorite_food)
                    setErrors((p) => ({ ...p, favorite_food: undefined }));
                }}
                className={`w-full px-3 py-2 rounded-lg border text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3BDB] transition-colors ${
                  errors.favorite_food
                    ? "border-red-500"
                    : "border-neutral-300 hover:border-neutral-400"
                }`}
              />
              {errors.favorite_food && (
                <p
                  id="err-favorite_food"
                  role="alert"
                  className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
                >
                  <span aria-hidden="true">&#x26A0;</span> {errors.favorite_food}
                </p>
              )}
            </div>

            {/* Q2 - Cuisine Type */}
            <div className="mb-7">
              <label
                htmlFor="field-cuisine_type"
                className="block text-sm font-semibold text-neutral-800 mb-1"
              >
                2. What type of cuisine do you like best?
                <span className="sr-only"> (required)</span>
              </label>
              <select
                id="field-cuisine_type"
                name="cuisine_type"
                required
                aria-required="true"
                aria-describedby={errors.cuisine_type ? "err-cuisine_type" : undefined}
                aria-invalid={!!errors.cuisine_type}
                value={formData.cuisine_type}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, cuisine_type: e.target.value }));
                  if (errors.cuisine_type)
                    setErrors((p) => ({ ...p, cuisine_type: undefined }));
                }}
                className={`w-full px-3 py-2 rounded-lg border text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3BDB] transition-colors ${
                  errors.cuisine_type
                    ? "border-red-500"
                    : "border-neutral-300 hover:border-neutral-400"
                }`}
              >
                <option value="">Select a cuisine...</option>
                {CUISINE_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.cuisine_type && (
                <p
                  id="err-cuisine_type"
                  role="alert"
                  className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
                >
                  <span aria-hidden="true">&#x26A0;</span> {errors.cuisine_type}
                </p>
              )}
            </div>

            {/* Q3 - Eating Frequency */}
            <fieldset
              className="mb-7"
              aria-describedby={errors.eating_frequency ? "err-eating_frequency" : undefined}
            >
              <legend className="text-sm font-semibold text-neutral-800 mb-2">
                3. How often do you eat your favorite food?
                <span className="sr-only"> (required)</span>
              </legend>
              <div className="space-y-2">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="eating_frequency"
                      value={opt}
                      checked={formData.eating_frequency === opt}
                      onChange={() => {
                        setFormData((p) => ({ ...p, eating_frequency: opt }));
                        if (errors.eating_frequency)
                          setErrors((p) => ({ ...p, eating_frequency: undefined }));
                      }}
                      className="w-4 h-4 accent-[#8A3BDB] cursor-pointer"
                    />
                    <span className="text-neutral-800 group-hover:text-neutral-900 text-sm">
                      {opt}
                    </span>
                  </label>
                ))}
              </div>
              {errors.eating_frequency && (
                <p
                  id="err-eating_frequency"
                  role="alert"
                  className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
                >
                  <span aria-hidden="true">&#x26A0;</span> {errors.eating_frequency}
                </p>
              )}
            </fieldset>

            {/* Q4 - Foods Enjoyed */}
            <fieldset
              className="mb-8"
              aria-describedby={errors.enjoyed_foods ? "err-enjoyed_foods" : undefined}
            >
              <legend className="text-sm font-semibold text-neutral-800 mb-2">
                4. Which foods do you enjoy most? (select all that apply)
                <span className="sr-only"> (required)</span>
              </legend>
              <div className="space-y-2">
                {FOOD_OPTIONS.map((food) => (
                  <div key={food}>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        value={food}
                        checked={formData.enjoyed_foods.includes(food)}
                        onChange={(e) => handleCheckbox(food, e.target.checked)}
                        className="w-4 h-4 accent-[#8A3BDB] cursor-pointer"
                      />
                      <span className="text-neutral-800 group-hover:text-neutral-900 text-sm">
                        {food}
                      </span>
                    </label>
                    {food === "Other" && otherChecked && (
                      <div className="mt-2 ml-7">
                        <label
                          htmlFor="field-other_food"
                          className="block text-sm font-medium text-neutral-700 mb-1"
                        >
                          Please describe the other food:
                          <span className="sr-only"> (required)</span>
                        </label>
                        <input
                          ref={otherFoodRef}
                          id="field-other_food"
                          type="text"
                          name="other_food"
                          required
                          aria-required="true"
                          aria-describedby={errors.other_food ? "err-other_food" : undefined}
                          aria-invalid={!!errors.other_food}
                          value={formData.other_food}
                          onChange={(e) => {
                            setFormData((p) => ({ ...p, other_food: e.target.value }));
                            if (errors.other_food)
                              setErrors((p) => ({ ...p, other_food: undefined }));
                          }}
                          placeholder="e.g. Ramen"
                          className={`w-full px-3 py-2 rounded-lg border text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3BDB] transition-colors ${
                            errors.other_food
                              ? "border-red-500"
                              : "border-neutral-300 hover:border-neutral-400"
                          }`}
                        />
                        {errors.other_food && (
                          <p
                            id="err-other_food"
                            role="alert"
                            className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
                          >
                            <span aria-hidden="true">&#x26A0;</span> {errors.other_food}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {errors.enjoyed_foods && (
                <p
                  id="err-enjoyed_foods"
                  role="alert"
                  className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
                >
                  <span aria-hidden="true">&#x26A0;</span> {errors.enjoyed_foods}
                </p>
              )}
            </fieldset>

            {submitError && (
              <div
                role="alert"
                className="mb-5 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm"
              >
                <span className="font-bold">Error:</span> {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 rounded-lg font-semibold text-white bg-[#8A3BDB] hover:bg-[#7a2fcb] focus:outline-none focus:ring-2 focus:ring-[#8A3BDB] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Submitting..." : "Submit Survey"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
