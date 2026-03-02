
import { useEffect, useRef } from "react";


export const useRTC = (signalingSocket:any, roomId:string)=>{
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef(new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  }));
    new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    }),

    useEffect(() => {
      const config = {
        video: true,
        audio: true,
      }
      const initMedia = async () => {
        const stream = await navigator.mediaDevices.getUserMedia(config)
        if(localVideoRef.current){
          localVideoRef.current.srcObject = stream
        }
        stream.getTracks().forEach( track => {
          pc.current.addTrack(track, stream)

        })

      }
      initMedia()

      pc.current.ontrack = event => {
        if(remoteVideoRef.current){
          remoteVideoRef.current.srcObject = event.streams[0]
        }
      }
      pc.current.onicecandidate = event => {
        if(event.candidate){
          signalingSocket.emit('candidate',{ candidate:event.candidate, roomId})
        }
      };

      signalingSocket.on('offer', async (offer:any) => {
        await pc.current.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await pc.current.createAnswer()
        await pc.current.setLocalDescription(answer)
        signalingSocket.emit('answer', async (answer:any)=>{
          await pc.current.setRemoteDescription(new RTCSessionDescription(answer))
        });
        signalingSocket.emit('candidate', async (candidate:any) => {
          await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
        })

        return () => {
          pc.current.close();

        }
      })

    }, [roomId, signalingSocket])

    const createOffer = async () => {
      const offer = await pc.current.createOffer()
      await pc.current.setLocalDescription(offer)
      signalingSocket.emit('offer', {offer, roomId})
    }
   return { localVideoRef, remoteVideoRef, createOffer}
}
