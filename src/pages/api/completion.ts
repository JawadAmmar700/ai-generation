import streamWrapper from "@/lib/stream";

export const config = {
  runtime: "experimental-edge",
};

export default async function handler(request: Request) {
  if (request.method !== "POST")
    return new Response("Method not allowed", { status: 405 });
  const { prompt } = await request.json();

  const openaiOptions = {
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 0.7,
    max_tokens: 2048,
    top_p: 1.0,
    frequency_penalty: 0.0,
    stream: true,
    presence_penalty: 0.0,
    n: 1,
  };

  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(openaiOptions),
  });

  const stream = await streamWrapper(response);

  return new Response(stream);
}
