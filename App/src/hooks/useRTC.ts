import { useEffect, useRef, useState, useCallback } from "react";

export function useRTC(myId: string, targetId: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const pc = useRef<RTCPeerConnection | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const candidateQueue = useRef<RTCIceCandidateInit[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);

  const getMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error("Media access denied:", err);
      throw err;
    }
  }, []);

  const setupPeerConnection = useCallback(() => {
    if (pc.current) return pc.current;

    const connection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    connection.onicecandidate = (event) => {
      if (event.candidate && ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            type: "candidate",
            target: targetId,
            candidate: event.candidate,
          }),
        );
      }
    };

    connection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    pc.current = connection;
    return connection;
  }, [targetId]);

  const processQueuedCandidates = useCallback(async () => {
    while (candidateQueue.current.length > 0 && pc.current?.remoteDescription) {
      const candidate = candidateQueue.current.shift();
      if (candidate)
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }, []);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    ws.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "login", username: myId }));
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "offer":
            try {
              console.log("Received offer from", data.sender);

              const conn = setupPeerConnection();

              if (conn.signalingState !== "stable") return;

              const stream = localStreamRef.current || (await getMedia());
              stream.getTracks().forEach((track) => conn.addTrack(track, stream));

              await conn.setRemoteDescription(
                new RTCSessionDescription(data.offer),
              );
              const answer = await conn.createAnswer();
              await conn.setLocalDescription(answer);
              socket.send(
                JSON.stringify({ type: "answer", target: data.sender, answer }),
              );

              while (candidateQueue.current.length > 0) {
                const cand = candidateQueue.current.shift();
                if (cand)
                  await conn.addIceCandidate(new RTCIceCandidate(cand));
              }
            } catch (error) {
              console.error("Error handling offer:", error);
            }
            break;

          case "answer":
            try {
              if (pc.current?.signalingState === "have-local-offer") {
                await pc.current.setRemoteDescription(
                  new RTCSessionDescription(data.answer),
                );
                processQueuedCandidates();
              }
            } catch (error) {
              console.error("Error handling answer:", error);
            }
            break;

          case "candidate":
            try {
              if (pc.current?.remoteDescription) {
                await pc.current.addIceCandidate(
                  new RTCIceCandidate(data.candidate),
                );
              } else {
                candidateQueue.current.push(data.candidate);
              }
            } catch (error) {
              console.error("Error handling candidate:", error);
            }
            break;
        }
      } catch (err) {
        console.error("Signaling error:", err);
      }
    };

    return () => {
      socket.close();
      if (pc.current) {
        pc.current.close();
        pc.current = null;
      }
    };

  }, [myId, setupPeerConnection, getMedia, processQueuedCandidates]);

  const startCall = useCallback(async () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not open");
      return;
    }

    if (!targetId) {
      console.error("Target ID is not provided");
      return;
    }

    try {
      console.log(`Initiating call from ${myId} to ${targetId}`);
      if (pc.current) {
        pc.current.close();
        pc.current = null;
      }

      const conn = setupPeerConnection();

      const stream = localStreamRef.current || (await getMedia());
      stream.getTracks().forEach((track) => conn.addTrack(track, stream));

      const offer = await conn.createOffer();
      await conn.setLocalDescription(offer);
      ws.current?.send(
        JSON.stringify({ type: "offer", target: targetId, offer }),
      );
    } catch (err) {
      console.error("Start call failed:", err);
    }
  }, [myId, targetId, setupPeerConnection, getMedia]);

  return { startCall, localStream, remoteStream };
}
