"use client";
import Spinner from "@/components/snipper";
import { audioFileSize, languages, validFileTypes } from "@/lib/constants";
import { bytesToSize, streamTextAsChucks } from "@/lib/helpers";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";

export const runtime = "experimental-edge";

const Page = () => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [transcription, setTranscription] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("en");
  const router = useRouter();

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const _file = e.target.files[0];
    if (!validFileTypes.includes(_file.type))
      return toast.error("file type not supported");
    if (_file.size > audioFileSize) return toast.error("file size too large");
    setFile(_file);
  };

  const transcribe = async () => {
    if (!file) return toast.error("uplaod a file first");
    setDescription("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", "whisper-1");
      formData.append("language", selectedType);
      formData.append("temperature", "0.7");
      formData.append("prompt", description);

      const res = await fetch("/api/audio", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setLoading(false);
        const data = await res.json();
        streamTextAsChucks(data.text, setTranscription);
      }
    } catch (e) {
      return toast.error("It seems that openai is not available right now");
    }
  };

  const refresh = () => {
    setFile(null);
    setDescription("");
    setTranscription("");
    setSelectedType("en");
    router.refresh();
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      <h1 className="text-4xl font-bold text-center mb-5 text-black">
        Transcribe audio file to text <br /> with Open Ai
      </h1>
      <button onClick={refresh} className="btn btn-outline btn-sm">
        Refresh
      </button>
      <label className="label">
        <span className="label-text text-black font-bold">
          Supported file types: mp3, wav, webm, mp4, m4a, mpga with max size of
          25 MB
        </span>
      </label>
      <div className="max-w-xl w-full flex flex-col justify-center items-center space-y-5  p-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
        <label className="flex justify-center w-full ">
          <span className="flex items-center space-x-2">
            <Image src="/upload.svg" alt="file icon" width={20} height={20} />
            <span className="font-medium text-gray-600">
              Drop files to Attach, or{" "}
              <span className="text-blue-600 underline">browse</span>
            </span>
          </span>
          <input
            type="file"
            name="file_upload"
            className="hidden"
            accept="audio/*"
            onChange={onFileChange}
          />
        </label>

        <div className="flex flex-wrap space-x-2">
          {file && (
            <div className="p-5 text-xs text-black font-bold rounded flex flex-col items-center justify-center shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
              <Image src="/file.svg" alt="file icon" width={25} height={25} />
              <p>{file.name}</p>
              <p>{bytesToSize(file.size)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="form-control w-full max-w-xl">
        <label className="label">
          <span className="label-text text-black font-bold">
            In what language is the provided audio?
          </span>
        </label>
        <select
          className="select select-bordered bg-white"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-control w-full max-w-xl">
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
        onClick={transcribe}
        className="max-w-xl mt-5 w-full p-3 bg-green-500 rounded text-black ring-offset-2  ring-green-500/50 font-bold hover:ring-4"
      >
        Transcribe Audio
      </button>
      {loading ? (
        <div className="mt-5">
          <Spinner />
        </div>
      ) : (
        <div className="w-full max-w-3xl flex flex-col space-y-5 mt-10">
          {transcription && (
            <div className="bg-white p-5 flex flex-col space-y-2 rounded-lg">
              <p className="text-sm font-bold text-black">{transcription}</p>
            </div>
          )}
        </div>
      )}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default Page;
