import { useRef, useState } from "react";
import { Play } from "lucide-react";
import landingVideo from "@/assets/videos/landingVideo.mp4";
import { cn } from "@/lib/utils";
import { bandAlt, bandTight, eyebrow, sec, wrap } from "./landingUi";

const FLOW_TAGS = [
  "Dashboard",
  "Leads",
  "Transcripts",
  "Generate",
  "Activate",
] as const;

export function LandingWatchItWork() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      await video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <section className={cn(bandTight, bandAlt)} id="watch">
      <div className={wrap}>
        <div className="mx-auto max-w-[700px] text-center">
          <p className={eyebrow}>Watch it work</p>
          <h2 className={sec}>See the whole flow in one run.</h2>
        </div>

        <figure data-reveal className="mx-auto mb-0 mt-10 max-w-[940px]">
          <div className="relative overflow-hidden rounded-2xl border border-landing-line bg-landing-steel shadow-[0_50px_100px_-40px_rgba(0,0,0,0.9)]">
            <div className="relative aspect-video bg-black/40">
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover"
                src={landingVideo}
                playsInline
                preload="metadata"
                controls
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
                onClick={togglePlayback}
              />

              {!playing ? (
                <button
                  type="button"
                  onClick={togglePlayback}
                  className={cn(
                    "absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center gap-4 border-0",
                    "bg-landing-steel/60 transition-opacity duration-200",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-landing-sky",
                  )}
                  aria-label="Play product walkthrough"
                >
                  <span
                    className={cn(
                      "flex h-16 w-16 items-center justify-center rounded-full",
                      "bg-landing-sky text-landing-steel",
                      "shadow-[0_12px_36px_-8px_rgba(79,156,249,0.9)]",
                      "transition-transform duration-200 hover:scale-105",
                    )}
                  >
                    <Play className="ml-0.5 h-7 w-7 fill-current" />
                  </span>
                  <span className="font-landing-sans text-[15px] font-semibold text-landing-fog">
                    Play walkthrough
                  </span>
                </button>
              ) : null}
            </div>

            <div className="flex flex-wrap justify-center gap-2 border-t border-landing-line px-4 py-3.5">
              {FLOW_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-landing-line px-2.5 py-1 font-landing-mono text-[11px] uppercase tracking-[0.08em] text-landing-fog/55"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <figcaption className="mt-4 text-center font-landing-mono text-[12.5px] leading-[1.5] text-landing-fog/45">
            A single session through the app: leads, transcripts, sequence,
            activate.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
