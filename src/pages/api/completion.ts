import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";

export const config = {
  runtime: "edge",
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

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  let counter = 0;

  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === "event") {
          const data = event.data;
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].text;
            if (counter < 2 && (text.match(/\n/) || []).length) {
              return;
            }
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            controller.error(e);
          }
        }
      }

      const parser = createParser(onParse);
      for await (const chunk of response.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return new Response(stream);
}
