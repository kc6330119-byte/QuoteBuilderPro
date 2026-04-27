export const dynamic = "force-dynamic";

export function GET() {
  const script = `(() => {
  const currentScript = document.currentScript;
  if (!currentScript) return;

  const slug = currentScript.getAttribute("data-slug") || currentScript.getAttribute("data-calculator");
  if (!slug) {
    console.warn("QuoteBuilder Pro embed: missing data-slug or data-calculator.");
    return;
  }

  const scriptUrl = new URL(currentScript.src);
  const baseUrl = scriptUrl.origin;
  const targetSelector = currentScript.getAttribute("data-target");
  let container = targetSelector ? document.querySelector(targetSelector) : null;

  if (!container) {
    container = document.createElement("div");
    currentScript.insertAdjacentElement("afterend", container);
  }

  container.setAttribute("data-quotebuilder-container", slug);
  container.style.width = "100%";
  container.style.maxWidth = "100%";

  const iframe = document.createElement("iframe");
  iframe.src = baseUrl + "/embed/" + encodeURIComponent(slug);
  iframe.title = "Quote calculator";
  iframe.loading = "lazy";
  iframe.style.width = "100%";
  iframe.style.maxWidth = "100%";
  iframe.style.minHeight = currentScript.getAttribute("data-min-height") || "680px";
  iframe.style.border = "0";
  iframe.style.display = "block";
  iframe.style.overflow = "hidden";
  iframe.setAttribute("scrolling", "no");
  iframe.setAttribute("data-quotebuilder-frame", slug);

  container.innerHTML = "";
  container.appendChild(iframe);

  function handleResize(event) {
    if (event.origin !== baseUrl) return;
    const data = event.data || {};
    if (data.type !== "quotebuilder:resize" || data.slug !== slug || !data.height) return;

    iframe.style.height = Math.max(Number(data.height), 520) + "px";
  }

  window.addEventListener("message", handleResize);

  function fitFrame() {
    iframe.style.width = "100%";
  }

  window.addEventListener("resize", fitFrame);
  fitFrame();
})();`;

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300"
    }
  });
}
