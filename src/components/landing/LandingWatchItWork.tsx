import { useRef, useState } from "react";
import { Play } from "lucide-react";
import landingVideo from "@/assets/videos/landingVideo.mp4";
import { cn } from "@/lib/utils";
import {
  bandDark,
  eyebrow,
  eyebrowOnDark,
  sec,
  secOnDark,
  wrap,
} from "./landingUi";

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
    <section
      className={cn(
        bandDark,
        "pb-[clamp(64px,8vw,116px)] pt-[clamp(24px,3vw,40px)]",
      )}
      id="watch"
    >
      <div className={wrap}>
        <div className="mx-auto max-w-[720px] text-center">
          <p className={cn(eyebrow, eyebrowOnDark, "justify-center")}>
            Watch it work
          </p>
          <h2 className={cn(sec, secOnDark, "mx-auto max-w-[16ch]")}>
            See the whole flow in one run.
          </h2>
        </div>

        <figure data-reveal className="mx-auto mt-10 max-w-[920px]">
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl border border-white/[0.12]",
              "bg-[#151836] shadow-[0_24px_80px_rgba(0,0,0,0.35)]",
            )}
          >
            <div className="relative aspect-video bg-[#10132a]">
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
                    "absolute inset-0 z-10 flex flex-col items-center justify-center gap-4",
                    "bg-[radial-gradient(ellipse_at_center,rgba(91,77,245,0.18)_0%,rgba(16,19,42,0.55)_55%,rgba(16,19,42,0.72)_100%)]",
                    "transition-opacity duration-200",
                    "focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-[-6px] focus-visible:outline-landing-indigo",
                  )}
                  aria-label="Play product walkthrough"
                >
                  <span
                    className={cn(
                      "flex h-16 w-16 items-center justify-center rounded-full",
                      "bg-landing-indigo text-white",
                      "shadow-[0_12px_36px_-8px_rgba(91,77,245,0.9)]",
                      "transition-transform duration-200 hover:scale-105",
                    )}
                  >
                    <Play className="ml-0.5 h-7 w-7 fill-current" />
                  </span>
                  <span className="font-landing-sans text-[15px] font-medium text-white/90">
                    Play walkthrough
                  </span>
                </button>
              ) : null}
            </div>

            <div className="flex flex-wrap justify-center gap-2 border-t border-white/[0.08] px-4 py-3.5 sm:gap-2.5 sm:px-5">
              {FLOW_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-white/15 bg-white/[0.03] px-2.5 py-1 font-landing-mono text-[11px] uppercase tracking-[0.08em] text-white/55"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <figcaption className="mt-4 text-center font-landing-mono text-[13px] leading-[1.5] text-white/[0.42]">
            A single session through the app — leads, transcripts, sequence,
            activate.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
