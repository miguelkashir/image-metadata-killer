export const Footer = () => {
  return (
    <footer className="w-full max-w-2xl mx-auto px-6 py-6 flex flex-col items-center gap-3">
      <a
        href="https://ko-fi.com/kashir"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 bg-orange/5 border border-orange/30 hover:border-orange hover:bg-orange/10 transition-all duration-200 px-5 py-2.5 rounded-full"
      >
        <span className="text-lg leading-none">☕</span>
        <span className="font-mono text-sm text-orange/60 group-hover:text-orange transition-colors duration-200">
          buy me a coffee
        </span>
      </a>
      <p className="font-mono text-xs text-muted/40">
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
  );
};
