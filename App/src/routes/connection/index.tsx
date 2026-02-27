import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";

export const Route = createFileRoute("/connection/")({
  component: RouteComponent,
});

function RouteComponent() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const setupMedia = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(localStream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    };

    setupMedia();


    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="video-container">
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="local-video"
      />
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="remote-video"
      />
    </div>
  );
}
