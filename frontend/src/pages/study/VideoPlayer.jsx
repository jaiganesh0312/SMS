import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import Hls from 'hls.js';
import { studyMaterialService } from '@/services';

export default function VideoPlayer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [videoData, setVideoData] = useState(null);

    useEffect(() => {
        const fetchStream = async () => {
            try {
                // Get token-based secure URL
                const response = await studyMaterialService.getStreamUrl(id);
                if (response.success) {
                    const { streamUrl, material } = response.data;
                    setVideoData(material);
                    initializePlayer(streamUrl);
                }
            } catch (err) {
                setError(err.message || "Could not load video");
                setLoading(false);
            }
        };

        fetchStream();

        return () => {
            // Cleanup HLS instance
            if (window.hls) {
                window.hls.destroy();
            }
        };
    }, [id]);

    const initializePlayer = (src) => {
        const video = videoRef.current;
        if (!video) return;

        // Use base URL for HLS src if needed, but here src is full relative URL from backend
        // e.g., /api/study-materials/hls/<token>/master.m3u8

        // Full absolute URL is needed by some players, but browser handles relative fine.
        // Let's ensure it handles auth correctly. The token is in URL so cookies/headers not strictly needed for the segments if backend handles it via token.
        // My backend streams segments via /hls/:token/:filename, so auth is embedded.

        if (Hls.isSupported()) {
            const hls = new Hls({
                xhrSetup: function (xhr, url) {
                    // If we needed to pass cookies/headers we could do it here
                    // xhr.withCredentials = true; 
                }
            });
            window.hls = hls; // Save to window for cleanup
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                setLoading(false);
                // video.play().catch(e => console.log("Auto-play prevented", e)); 
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                    console.error("HLS Error:", data);
                    setError(`Video playback error: ${data.type} - ${data.details}`);
                    setLoading(false);
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native support (Safari)
            video.src = src;
            video.addEventListener('loadedmetadata', function () {
                setLoading(false);
                // video.play();
            });
        } else {
            setError("Your browser does not support HLS video playback.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            {/* Header / Back Button */}
            <div className="absolute top-4 left-4 z-10">
                <Button
                    variant="flat"
                    className="bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                    startContent={<Icon icon="mdi:arrow-left" />}
                    onPress={() => navigate(-1)}
                >
                    Back to Materials
                </Button>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-5xl space-y-4">
                {/* Video Container */}
                <div className="relative aspect-video bg-zinc-900 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 bg-zinc-900/80 backdrop-blur-sm">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                                <p className="text-white/70">Loading secured stream...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 bg-zinc-900">
                            <div className="text-center text-red-400 max-w-md p-6 bg-red-900/20 rounded-xl border border-red-900/50">
                                <Icon icon="mdi:alert-circle" className="text-5xl mx-auto mb-3" />
                                <h3 className="text-lg font-semibold mb-1">Playback Error</h3>
                                <p>{error}</p>
                                <Button className="mt-4" size="sm" variant="flat" color="danger" onPress={() => navigate(-1)}>
                                    Go Back
                                </Button>
                            </div>
                        </div>
                    )}

                    <video
                        ref={videoRef}
                        className="w-full h-full object-contain"
                        controls
                        controlsList="nodownload noplaybackrate remoteplayback" // Security measures
                        disablePictureInPicture
                        playsInline
                        onContextMenu={(e) => e.preventDefault()} // Disable right click
                    />
                </div>

                {/* Video Info */}
                {videoData && (
                    <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6 text-white max-w-5xl w-full">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h1 className="text-2xl font-bold mb-2">{videoData.title}</h1>
                                <div className="flex items-center gap-3 text-sm text-zinc-400 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Icon icon="mdi:clock-outline" />
                                        {Math.floor((videoData.duration || 0) / 60)}:{String((videoData.duration || 0) % 60).padStart(2, '0')} min
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                                    <span className="text-green-400 flex items-center gap-1">
                                        <Icon icon="mdi:shield-check" />
                                        Secure Stream
                                    </span>
                                </div>
                                <p className="text-zinc-300 leading-relaxed">
                                    {videoData.description || "No description provided."}
                                </p>
                            </div>
                            <div className="hidden sm:block">
                                <Chip variant="flat" className="bg-white/10 text-white">
                                    Study Material
                                </Chip>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
