// export const runtime = "experimental-edge";

export async function POST(request: Request) {
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

  const reader = response.body?.getReader();

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      function push() {
        reader?.read().then(({ done, value }) => {
          try {
            if (done) {
              controller.close();
              return;
            }
            const decoded = decoder.decode(value).split("data:")[1];
            const chuckData = JSON.parse(decoded).choices[0].text;
            const encode = encoder.encode(chuckData);
            controller.enqueue(encode);
            push();
          } catch (e) {
            controller.close();
            return;
          }
        });
      }

      push();
    },
  });

  return new Response(stream);
}

// export const config = {
//   runtime: "edge",
// };
