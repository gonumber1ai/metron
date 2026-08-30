/**
 * The Metron mark: three ascending steps.
 *
 * Rebuilt as vector rather than kept as the generated raster — it stays crisp
 * at 20px in a nav bar and at 512px on a home screen, and it inherits colour
 * from CSS so one file serves the dark app, a light email header and a
 * one-colour print version.
 *
 * It passes the test that actually matters: on a home screen it reads as a
 * progress or fitness app. Nobody glancing at his phone learns anything.
 *
 * Drawn as a single stroked path with round caps and joins, which is why the
 * corners look soft at every size without any extra geometry.
 */

export function LogoMark({
  className = "h-6 w-6",
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path
        d="M3.5 18H10V12H16V6H20.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Mark plus wordmark. `tone` picks the text colour so the same lockup works on
 * the dark app and the light funnel pages.
 */
export function Logo({
  className = "",
  size = "md",
  tone = "dark",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  tone?: "dark" | "light";
}) {
  const mark = { sm: "h-[18px] w-[18px]", md: "h-[22px] w-[22px]", lg: "h-7 w-7" }[size];
  const text = { sm: "text-[15px]", md: "text-[17px]", lg: "text-[21px]" }[size];
  const word = tone === "light" ? "text-graphite" : "text-bone";

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="text-jade">
        <LogoMark className={mark} />
      </span>
      {/* Set as real capitals rather than CSS uppercase: a screen reader
          announces "METRON" as a word either way, but a text-transform gets
          lost the moment this lockup is copied into an email or a PDF, and the
          wordmark on every piece of brand artwork is capitals. Letter-spacing
          is opened up because caps set tight read as shouting. */}
      <span className={`${text} ${word} font-bold tracking-[0.08em]`}>METRON</span>
    </span>
  );
}
