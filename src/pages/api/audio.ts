export const config = {
  runtime: "experimental-edge",
};

export default async function handler(request: Request) {
  if (request.method !== "POST")
    return new Response("Method not allowed", { status: 405 });
  const data = await request.formData();

  try {
    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: data,
    });

    const result = await res.json();
    return new Response(JSON.stringify(result));
  } catch (err: any) {
    new Response("Error", {
      status: 500,
      statusText: err,
    });
  }
}
