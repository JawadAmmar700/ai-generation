"use client";
import { categoryTypes } from "@/lib/constants";
import { Inter } from "next/font/google";
import { useState } from "react";
import Spinner from "@/components/snipper";

export const runtime = "experimental-edge";

const inter = Inter({ subsets: ["latin"] });

type Choice = {
  title: string;
  description: string;
};

export default function Home() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>("tv show or movie");
  const [description, setDescription] = useState<string>("");
  const [choices, setChoices] = useState<Choice[]>([]);
  const [generating, setGenerating] = useState<boolean>(false);

  const handleCategoryChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    category: string
  ) => {
    if (e.target.checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    }
  };

  const generatePreferences = async () => {
    const searchTerm = `Give me a list of 5 ${selectedType} recommendations ${
      selectedCategories
        ? `that fit all of the following categories: ${selectedCategories}`
        : ""
    }. ${
      description
        ? `Make sure it fits the following description as well: ${description}.`
        : ""
    } ${
      selectedCategories || description
        ? `If you do not have 5 recommendations that fit these criteria perfectly, do your best to suggest other ${selectedType}'s that I might like.`
        : ""
    } Please return this response as a numbered list with the ${selectedType}'s title, followed by a colon, and then a brief description of the ${selectedType}. There should be a line of whitespace between each item in the list.`;

    setGenerating(true);

    const response = await fetch("/api/completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: searchTerm }),
    });
    if (response.ok) {
      const data = response.body;
      if (!data) {
        return;
      }
      const reader = data.getReader();
      const decoder = new TextDecoder();
      setGenerating(false);
      let text = "";
      while (true) {
        const { value, done } = await reader.read();
        const chunk = decoder.decode(value);
        text += chunk;
        const d = text
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
          .map((line) => {
            const [title, ...description] = line.split(":");
            return {
              title,
              description: description.join(":"),
            };
          });
        setChoices(d);

        if (done) {
          break;
        }
      }
    }
  };

  return (
    <main
      className={`${inter.className} w-full flex flex-col space-y-5  items-center p-10 text-black`}
    >
      <h1 className="text-4xl font-bold text-center">
        Get curated show and movie <br /> recommendation with Open Ai
      </h1>
      <div className="form-control w-full max-w-3xl">
        <label className="label">
          <span className="label-text text-black font-bold">
            What kind of cinema you are searching for?
          </span>
        </label>
        <select
          className="select select-bordered bg-white"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="tv show or movie">No Preference</option>
          <option value="tv show"> TV Show </option>
          <option value="movie"> Movie </option>
        </select>
      </div>
      <div className="flex flex-col space-y-2 w-full max-w-3xl items-start">
        <h1 className="label-text text-black font-bold">
          Select all categories that you like including.
        </h1>
        <div className="flex flex-wrap">
          {categoryTypes.map((category, idx) => (
            <label key={idx} className="label cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-sm mr-2"
                onChange={(e) => handleCategoryChange(e, category)}
                name={category}
              />
              <span className="label-text text-black font-medium">
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div className="form-control w-full max-w-3xl">
        <label className="label">
          <span className="label-text font-bold text-black">
            Write any other specification here. Be as picky as you'd like.
          </span>
        </label>
        <textarea
          className="textarea textarea-bordered h-24 bg-white"
          placeholder="write a description here"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
      </div>
      <button
        onClick={generatePreferences}
        className="max-w-3xl w-full p-3 bg-green-500 rounded ring-offset-2  ring-green-500/50 font-bold hover:ring-4"
      >
        Generate your Preferences
      </button>
      {generating ? (
        <Spinner />
      ) : (
        <div className="w-full max-w-3xl flex flex-col space-y-5">
          {choices.map((choice, idx) => (
            <div
              key={idx}
              className="bg-white p-5 flex flex-col space-y-2 rounded-lg"
            >
              <h1 className="text-lg font-bold">{choice.title}</h1>
              <p className="text-sm">{choice.description}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
