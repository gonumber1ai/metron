"use client";

import Script from "next/script";
import { useEffect } from "react";

/**
 * The browser pixel, on the money pages only.
 *
 * Mounted by the offer and checkout pages and nowhere else — not the quiz, not
 * the result, not the paid app. Meta gets to see a man consider a purchase and
 * make one. It does not get to watch him answer nine questions about his sex
 * life.
 *
 * Renders nothing and does nothing at all when NEXT_PUBLIC_META_PIXEL_ID is
 * unset, so it is inert until you actually start running ads.
 */
export function MetaPixel({ event }: { event?: "ViewContent" | "InitiateCheckout" }) {
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  useEffect(() => {
    if (!id || !event) return;
    const w = window as unknown as { fbq?: (...a: unknown[]) => void };
    // fbq may not have loaded yet on a slow connection; the base snippet
    // queues calls made before it does, so this is safe once it exists.
    w.fbq?.("track", event);
  }, [id, event]);

  if (!id) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${id}');`}
    </Script>
  );
}

/** Fire InitiateCheckout the moment he actually tries to pay. */
export function trackCheckoutStarted(plan: string) {
  const w = window as unknown as { fbq?: (...a: unknown[]) => void };
  w.fbq?.("track", "InitiateCheckout", { content_ids: [plan] });
}
