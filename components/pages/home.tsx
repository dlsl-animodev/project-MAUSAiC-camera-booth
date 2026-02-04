"use client";

interface HomeProps {
  onStart: () => void;
}

// Floating bubble component
const FloatingBubble = ({
  size,
  position,
  delay,
  animation,
}: {
  size: number;
  position: { top?: string; bottom?: string; left?: string; right?: string };
  delay: string;
  animation: string;
}) => (
  <div
    className={`absolute rounded-full bg-black/5 dark:bg-white/5 backdrop-blur-sm ${animation}`}
    style={{
      width: size,
      height: size,
      ...position,
      animationDelay: delay,
    }}
  />
);

export function Home({ onStart }: HomeProps) {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-white dark:bg-black">
      {/* Floating Bubbles Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatingBubble
          size={400}
          position={{ top: "-10%", left: "-5%" }}
          delay="0s"
          animation="animate-float-bubble"
        />
        <FloatingBubble
          size={300}
          position={{ top: "20%", right: "-8%" }}
          delay="2s"
          animation="animate-float-bubble-reverse"
        />
        <FloatingBubble
          size={250}
          position={{ bottom: "10%", left: "10%" }}
          delay="1s"
          animation="animate-float-bubble-slow"
        />
        <FloatingBubble
          size={180}
          position={{ bottom: "30%", right: "15%" }}
          delay="3s"
          animation="animate-float-bubble"
        />
        <FloatingBubble
          size={120}
          position={{ top: "50%", left: "25%" }}
          delay="4s"
          animation="animate-float-bubble-reverse"
        />
        <FloatingBubble
          size={200}
          position={{ top: "5%", right: "30%" }}
          delay="1.5s"
          animation="animate-float-bubble-slow"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-16 px-6">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-10">
          {/* Minimal Logo */}
          <div className="animate-fade-in-up flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-black dark:bg-white transition-transform hover:scale-105">
              <svg
                className="h-10 w-10 text-white dark:text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col items-center gap-4">
            <h1 className="animate-fade-in-up-delay-1 text-center text-6xl font-semibold tracking-tight text-black dark:text-white md:text-7xl lg:text-8xl">
              Photobooth by MAUSAiC
            </h1>
            <p className="animate-fade-in-up-delay-2 text-center text-lg font-light tracking-wide text-black/60 dark:text-white/60 md:text-xl">
              Capture moments. Create memories.
            </p>
          </div>
        </div>

        {/* Start Button - Backgroundless with blink */}
        <button
          onClick={onStart}
          className="animate-fade-in-up-delay-3 group relative"
        >
          <span className="animate-blink text-xl font-medium tracking-widest text-black/80 dark:text-white/80 uppercase transition-all group-hover:text-black dark:group-hover:text-white group-hover:tracking-[0.3em]">
            Tap to Begin
          </span>
          <span className="absolute -bottom-2 left-1/2 h-px w-0 -translate-x-1/2 bg-black dark:bg-white transition-all duration-500 group-hover:w-full" />
        </button>
      </div>

      {/* Bottom attribution */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <p className="text-medium font-light tracking-widest text-black/30 dark:text-white uppercase">
          Made by Animo.dev
        </p>
      </div>
    </div>
  );
}
