"use client";

interface LayoutSelectProps {
  onSelectLayout: (layout: "single" | "double") => void;
}

export function LayoutSelect({ onSelectLayout }: LayoutSelectProps) {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-white dark:bg-black px-6">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/[0.02] to-black/[0.05] dark:from-transparent dark:via-white/[0.02] dark:to-white/[0.05] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-2xl">
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="animate-fade-in-up text-center text-5xl font-semibold tracking-tight text-black dark:text-white md:text-6xl">
            Choose Layout
          </h1>
          <p className="animate-fade-in-up-delay-1 text-center text-base font-light tracking-wide text-black/50 dark:text-white/50">
            Select your preferred photo arrangement
          </p>
        </div>

        {/* Layout Options */}
        <div className="animate-fade-in-up-delay-2 grid w-full gap-6 md:grid-cols-2">
          {/* Single Strip - 4 photos */}
          <button
            onClick={() => onSelectLayout("single")}
            className="group relative flex flex-col items-center gap-8 rounded-3xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 p-10 backdrop-blur-sm transition-all duration-500 hover:border-black/30 dark:hover:border-white/30 hover:bg-black/[0.02] dark:hover:bg-white/10 hover:scale-[1.02]"
          >
            {/* Visual representation */}
            <div className="flex flex-col gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-12 rounded-md border-2 border-black/20 dark:border-white/30 bg-black/5 dark:bg-white/10 transition-all duration-300 group-hover:border-black/40 dark:group-hover:border-white/50"
                  style={{ transitionDelay: `${i * 50}ms` }}
                />
              ))}
            </div>

            {/* Label */}
            <div className="flex flex-col items-center gap-1">
              <h3 className="text-xl font-medium tracking-tight text-black dark:text-white">
                Classic Strip
              </h3>
              <p className="text-sm font-light text-black/40 dark:text-white/40">
                4 photos
              </p>
            </div>

            {/* Hover indicator */}
            <span className="absolute bottom-6 text-xs font-light tracking-widest text-black/0 dark:text-white/0 uppercase transition-all duration-300 group-hover:text-black/40 dark:group-hover:text-white/40">
              Select
            </span>
          </button>

          {/* Short Strip - 3 photos */}
          <button
            onClick={() => onSelectLayout("double")}
            className="group relative flex flex-col items-center gap-8 rounded-3xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 p-10 backdrop-blur-sm transition-all duration-500 hover:border-black/30 dark:hover:border-white/30 hover:bg-black/[0.02] dark:hover:bg-white/10 hover:scale-[1.02]"
          >
            {/* Visual representation */}
            <div className="flex flex-col gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-12 rounded-md border-2 border-black/20 dark:border-white/30 bg-black/5 dark:bg-white/10 transition-all duration-300 group-hover:border-black/40 dark:group-hover:border-white/50"
                  style={{ transitionDelay: `${i * 50}ms` }}
                />
              ))}
            </div>

            {/* Label */}
            <div className="flex flex-col items-center gap-1">
              <h3 className="text-xl font-medium tracking-tight text-black dark:text-white">
                Short Strip
              </h3>
              <p className="text-sm font-light text-black/40 dark:text-white/40">
                3 photos
              </p>
            </div>

            {/* Hover indicator */}
            <span className="absolute bottom-6 text-xs font-light tracking-widest text-black/0 dark:text-white/0 uppercase transition-all duration-300 group-hover:text-black/40 dark:group-hover:text-white/40">
              Select
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
