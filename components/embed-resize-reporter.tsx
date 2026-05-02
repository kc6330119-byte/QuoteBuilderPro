"use client";

import { useEffect } from "react";

export function EmbedResizeReporter({ frameKey }: { frameKey: string }) {
  useEffect(() => {
    let frame = 0;

    function sendHeight() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const height = Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight,
          document.documentElement.offsetHeight,
          document.body.offsetHeight,
          520
        );

        window.parent.postMessage(
          {
            type: "quotebuilder:resize",
            key: frameKey,
            slug: frameKey,
            height
          },
          "*"
        );
      });
    }

    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);
    window.addEventListener("load", sendHeight);
    window.addEventListener("resize", sendHeight);
    sendHeight();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("load", sendHeight);
      window.removeEventListener("resize", sendHeight);
    };
  }, [frameKey]);

  return null;
}
