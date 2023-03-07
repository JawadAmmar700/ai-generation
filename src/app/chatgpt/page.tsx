"use client";
import Spinner from "@/components/snipper";
import Image from "next/image";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface MapObj {
  id: number;
  question: string;
  answer: string;
}

const Page = () => {
  const [questions, setQuestions] = useState<string>("");
  const [generating, setGenerating] = useState<number>(0);
  const [choices, setChoices] = useState<Map<number, MapObj>>(new Map());

  const generate = async () => {
    // add question to map
    const id = choices.size + 1;
    setGenerating(id);
    const obj = {
      id,
      question: questions,
      answer: "",
    };
    choices.set(id, obj);

    const response = await fetch("/api/chatgpt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: questions }),
    });
    if (response.ok) {
      const data = response.body;
      if (!data) {
        return;
      }
      const reader = data.getReader();
      const decoder = new TextDecoder();
      setQuestions("");
      setGenerating(0);
      let text = "";

      while (true) {
        const { value, done } = await reader.read();
        const chunk = decoder.decode(value);
        text += chunk;
        // update the obj to set the answer
        obj.answer += chunk;
        choices.set(id, obj);
        setChoices(new Map(choices));
        if (done) {
          break;
        }
      }
    }
  };

  return (
    <div className="h-full flex flex-col items-center w-full ">
      <div className="flex-1 flex flex-col space-y-5 w-full md:max-w-4xl max-w-full sm:w-full overflow-y-auto p-2">
        {choices.size > 0 && (
          <>
            {Array.from(choices.values()).map((choice, idx) => (
              <div
                key={choice.id}
                className="flex flex-col space-x-5 justify-center bg-white p-2 rounded-lg"
              >
                <div className="flex space-x-5 bg-white p-2 rounded-lg">
                  <Image
                    src="/user.svg"
                    alt="user"
                    width={24}
                    height={24}
                    className="ring ring-indigo-800 rounded-full"
                  />

                  <p className="text-sm text-black font-medium">
                    {choice.question}
                  </p>
                </div>

                {generating === idx + 1 ? (
                  <div className="flex w-full items-center">
                    <Spinner loadingText="generating" />
                  </div>
                ) : (
                  choices.get(idx + 1)?.answer && (
                    <div className="flex space-x-5 bg-white p-2 rounded-lg overflow-x-auto">
                      <div className="w-6 h-6 relative p-4">
                        <Image src="/openai.svg" alt="openai" fill />
                      </div>

                      <ReactMarkdown className="rounded shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] text-black text-sm p-2 flex flex-wrap">
                        {choice.answer}
                      </ReactMarkdown>
                    </div>
                  )
                )}
              </div>
            ))}
          </>
        )}
      </div>
      <div className="flex-none h-16 flex justify-center items-center w-full">
        <div className="form-control w-full md:max-w-4xl max-w-full flex flex-row space-x-2">
          <textarea
            className="textarea flex-1  textarea-bordered bg-white text-black placeholder-black/50 textarea-xs shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]"
            placeholder="How can I help you?"
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
          ></textarea>
          <button
            disabled={!questions}
            onClick={generate}
            className="btn btn-square btn-outline flex-none"
          >
            <Image src="/send.svg" alt="openai" width={24} height={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
