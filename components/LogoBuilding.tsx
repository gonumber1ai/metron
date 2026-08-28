/**
 * The mark drawing itself, step by step, while he waits.
 *
 * A generic spinner says "something is happening". This says what — the
 * staircase climbs from the bottom step to the top, which is the product, and
 * a man watching his money leave gets a few seconds of the right idea instead
 * of a rotating circle.
 *
 * The wait is mostly Fapshi's and Whop's: our server has to ask them to create
 * a checkout and wait for the answer. We cannot make that faster, so the least
 * we can do is make the waiting feel deliberate rather than broken.
 *
 * ── HOW IT DRAWS ──────────────────────────────────────────────────────────
 * One stroked path, dashed with a gap as long as the whole line, then the dash
 * offset animated from full to zero. The stroke appears to grow from the first
 * step to the last. `pathLength="1"` normalises the geometry so the dash
 * numbers are fractions rather than measured pixels — change the path and the
 * animation still works.
 *
 * A faint copy of the same path sits underneath, so the shape is a mark being
 * completed rather than a line appearing out of nowhere.
 *
 * Under prefers-reduced-motion the app's global rule collapses the duration to
 * nothing, which lands on the final frame: the finished logo, held still. That
 * is the correct degradation and needs no special case.
 */
export function LogoBuilding({
  className = "h-12 w-12",
  label,
}: {
  className?: string;
  /** announced to screen readers, which cannot see a staircase */
  label?: string;
}) {
  return (
    <>
      <style>{`
        @keyframes metron-build {
          /* Hold empty briefly so each cycle reads as a fresh start rather
             than a line that never stops moving. */
          0%, 8%   { stroke-dashoffset: 1; opacity: 1; }
          70%, 88% { stroke-dashoffset: 0; opacity: 1; }
          /* Fade the FINISHED mark out rather than snapping back to empty.
             opacity is pinned to 1 in every keyframe above on purpose: named
             only in the last one, CSS interpolates it from the base value
             across the whole animation, so the mark faded out while it was
             still drawing and was nearly invisible by the time it completed. */
          100%     { stroke-dashoffset: 0; opacity: 0; }
        }
        .metron-build-path {
          stroke-dasharray: 1 1;
          animation: metron-build 2.1s ease-in-out infinite;
        }
      `}</style>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={className}
        role="img"
        aria-label={label ?? "Working"}
      >
        <path
          d="M3.5 18H10V12H16V6H20.5"
          pathLength="1"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.14"
        />
        <path
          className="metron-build-path"
          d="M3.5 18H10V12H16V6H20.5"
          pathLength="1"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
}
