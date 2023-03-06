import { Dispatch, SetStateAction } from "react";

export function bytesToSize(bytes: number): string {
  const sizes: string[] = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "n/a";
  const i: number = parseInt(
    Math.floor(Math.log(bytes) / Math.log(1024)).toString()
  );
  if (i === 0) return `${bytes} ${sizes[i]}`;
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export const streamTextAsChucks = (
  text: string,
  setTranscription: Dispatch<SetStateAction<string>>
): Promise<void> => {
  const chunks = text.split(" ");
  let i = 0;
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (i >= chunks.length) {
        clearInterval(interval);
        resolve();
        setTranscription((prev) => prev + ".");
        return;
      }
      const str = chunks[i];
      i++;
      setTranscription((prev) => prev + " " + str);
    }, 100);
    return () => clearInterval(interval);
  });
};
