import Link from "next/link";
import React from "react";

const Sidebar = () => {
  return (
    <aside className="w-full p-6 sm:w-60 bg-[#EEF2F4] rounded-lg shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
      <nav className="space-y-8 text-sm">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold tracking-widest uppercase dark:text-gray-400">
            Play with AI
          </h2>
          <div className="flex flex-col space-y-1 font-bold">
            <Link href="/" className="hover:text-gray-500">
              Flim Generation
            </Link>
            <Link href="/audio-tr" className="hover:text-gray-500">
              Audio Translation
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
