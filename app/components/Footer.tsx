export const Footer = () => {
  return (
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
  );
};
