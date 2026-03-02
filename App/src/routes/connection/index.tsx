import { createFileRoute } from "@tanstack/react-router";
import { useRTC } from "@/hooks/useRTC";
import { VideoGrid } from "@/components/videoGrid";
import { useState, useRef, useEffect, useMemo } from "react";

export const Route = createFileRoute("/connection/")({
  component: HomeComponent,
});

export default function HomeComponent() {
  const [target, setTarget] = useState("");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const myUniqueId = useMemo(() => `User${Math.floor(Math.random() * 1000)}`, []);

  const { startCall, remoteStream, localStream } = useRTC(myUniqueId, target);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto mb-8 flex gap-2">
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm font-bold">
            Your ID: <span className="text-blue-600">{myUniqueId}</span>
          </p>
          <p className="text-xs text-gray-500 italic">
            Share this ID with the other peer.
          </p>
        </div>
        <input
          className="flex-1 border p-2 rounded-lg bg-white"
          placeholder="Enter Peer ID..."
          onChange={(e) => setTarget(e.target.value)}
        />
        <button
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          onClick={startCall}
        >
          Call
        </button>
      </div>

      <VideoGrid
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        localStream={localStream}
        remoteStream={remoteStream}
      />
    </main>
  );
}
