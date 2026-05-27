function LinkedinIcon({ size = 14 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className="shrink-0"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 px-6 md:px-8 py-6 shrink-0">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <p className="text-slate-400 font-semibold tracking-wider">
          SIFA &copy; 2026
        </p>
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-slate-400">
          <span className="text-slate-500">Desarrollado por</span>
          <a
            href="https://www.linkedin.com/in/leonel-briones-palacios/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-blue-400 transition-colors"
          >
            <LinkedinIcon size={14} />
            Leonel Briones Palacios
          </a>
          <span className="text-slate-600">|</span>
          <a
            href="https://www.linkedin.com/in/andres-ortega-suazo/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-blue-400 transition-colors"
          >
            <LinkedinIcon size={14} />
            Andrés Ortega Suazo
          </a>
          <span className="text-slate-600">|</span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-300">
            <LinkedinIcon size={14} className="text-slate-500" />
            Nicolás López
          </span>
        </p>
      </div>
    </footer>
  );
}
