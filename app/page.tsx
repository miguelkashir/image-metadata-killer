export default function Home() {
  return (
    <div className="flex flex-col min-h-screen text-fg font-sans">
      {/* Header */}
      <header className="w-full max-w-2xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
        <span className="font-mono text-sm tracking-tight">
          <span className="text-pink">~/</span>
          <span className="text-purple font-semibold">metakill</span>
        </span>
        <span className="font-mono text-xs text-muted">v0.1.0</span>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 w-full max-w-2xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-10 w-full">
          <p className="font-mono text-xs text-muted mb-4 tracking-widest uppercase">
            image metadata remover
          </p>
          <h1 className="font-mono text-4xl sm:text-5xl font-bold leading-tight mb-5">
            Strip your images{" "}
            <span className="text-purple">clean.</span>
          </h1>
          <p className="text-muted text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Remove EXIF data, GPS coordinates, camera info, and all hidden
            metadata from your photos.{" "}
            <span className="text-cyan">No uploads. No server. Your files never leave your device.</span>
          </p>
        </div>

        {/* Drop zone */}
        <div className="w-full rounded-xl border-2 border-dashed border-overlay hover:border-purple transition-colors duration-200 cursor-pointer group mb-8">
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-8 text-center">
            <div>
              <p className="font-mono text-fg text-sm font-medium">
                Drop your image here
              </p>
              <p className="font-mono text-muted text-xs mt-1">
                or click to browse
              </p>
            </div>
            <p className="font-mono text-xs text-muted/50 mt-2">
              JPG · PNG · WEBP · HEIC · TIFF
            </p>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
          <span className="bg-surface text-green px-3 py-1.5 rounded-full">
            ✓ no uploads
          </span>
          <span className="bg-surface text-cyan px-3 py-1.5 rounded-full">
            ✓ instant processing
          </span>
          <span className="bg-surface text-purple px-3 py-1.5 rounded-full">
            ✓ 100% private
          </span>
          <span className="bg-surface text-orange px-3 py-1.5 rounded-full">
            ✓ open source
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-2xl mx-auto px-6 py-6 text-center">
        <p className="font-mono text-xs text-muted/40">
          your metadata never leaves your device
        </p>
        <p className="font-mono text-xs text-muted/40 mt-2">
          Made with ❤️ by{" "}
          <a
            href="https://github.com/miguelkashir"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted/60 hover:text-purple transition-colors duration-150"
          >
            miguelkashir
          </a>
        </p>
      </footer>
    </div>
  );
}
