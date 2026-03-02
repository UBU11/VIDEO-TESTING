import type { RefObject } from "react";

interface VideoGridProps {
	localVideoRef: RefObject<HTMLVideoElement | null>;
	remoteVideoRef: RefObject<HTMLVideoElement | null>;
	localStream: MediaStream | null;
	remoteStream: MediaStream | null;
}

export function VideoGrid({
	localVideoRef,
	remoteVideoRef,
	localStream,
	remoteStream,
}: VideoGridProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mx-auto p-4">

			<div className="flex flex-col gap-2">
				<h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
					Local Feed (You)
				</h3>
				<div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-gray-200 shadow-sm">
					{localStream ? (
						<video
							ref={localVideoRef}
							autoPlay
							playsInline
							muted 
							className="w-full h-full object-cover scale-x-[-1]" 
						/>
					) : (
						<div className="flex items-center justify-center h-full text-gray-400 italic">
							Waiting for camera access...
						</div>
					)}
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
					Remote Feed (Peer)
				</h3>
				<div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-gray-200 shadow-sm">
					{remoteStream ? (
						<video
							ref={remoteVideoRef}
							autoPlay
							playsInline
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="flex items-center justify-center h-full text-gray-400 italic">
							Waiting for peer connection...
						</div>
					)}
				</div>
			</div>
		</div>
	);
}