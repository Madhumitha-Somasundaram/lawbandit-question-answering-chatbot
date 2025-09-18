"use client";
import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import ChatBox from "@/components/ChatBox";


export default function Home() {
  const [chatStarted, setChatStarted] = useState(false);

  return (
    <div className="p-6">
      {!chatStarted ? (
        <FileUpload onUploadComplete={() => setChatStarted(true)} />
      ) : (
        <ChatBox onEnd={() => setChatStarted(false)} />
      )}
    </div>
  );
}
