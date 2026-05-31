export const dynamic = "force-dynamic";

export function GET() {
  const script = `(() => {
  const currentScript = document.currentScript;
  if (!currentScript) return;

  const publicId = currentScript.getAttribute("data-public-id");
  const slug = currentScript.getAttribute("data-slug") || currentScript.getAttribute("data-calculator");
  if (!publicId || !slug) {
    console.warn("QuoteBuilder Pro embed: missing data-public-id or data-slug.");

    const targetSelector = currentScript.getAttribute("data-target");
    let fallbackContainer = targetSelector ? document.querySelector(targetSelector) : null;
    if (!fallbackContainer) {
      fallbackContainer = document.createElement("div");
      currentScript.insertAdjacentElement("afterend", fallbackContainer);
    }
    fallbackContainer.innerHTML = '<div style="box-sizing:border-box;width:100%;border:1px solid #dbe5f4;border-radius:14px;background:#f8fbff;padding:24px;text-align:center;font-family:Inter,system-ui,sans-serif;color:#111827;"><p style="margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#0f766e;">Quote unavailable</p><p style="margin:0;font-size:16px;font-weight:800;">This calculator needs an updated secure embed code.</p></div>';
    return;
  }
  const frameKey = publicId + "/" + slug;

  const scriptUrl = new URL(currentScript.src);
  const baseUrl = scriptUrl.origin;
  const returnUrl = currentScript.getAttribute("data-return-url") || window.location.href;
  const returnLabel =
    currentScript.getAttribute("data-return-label") || document.title || window.location.hostname || "website";
  const targetSelector = currentScript.getAttribute("data-target");
  let container = targetSelector ? document.querySelector(targetSelector) : null;

  if (!container) {
    container = document.createElement("div");
    currentScript.insertAdjacentElement("afterend", container);
  }

  container.setAttribute("data-quotebuilder-container", frameKey);
  container.style.width = "100%";
  container.style.maxWidth = "100%";

  const iframe = document.createElement("iframe");
  const iframeParams = new URLSearchParams();
  iframeParams.set("embedded", "1");
  iframeParams.set("returnUrl", returnUrl);
  iframeParams.set("returnLabel", returnLabel.slice(0, 90));

  iframe.src =
    baseUrl +
    "/embed/" +
    encodeURIComponent(publicId) +
    "/" +
    encodeURIComponent(slug) +
    "?" +
    iframeParams.toString();
  iframe.title = "Quote calculator";
  iframe.loading = "lazy";
  iframe.style.width = "100%";
  iframe.style.maxWidth = "100%";
  iframe.style.minHeight = currentScript.getAttribute("data-min-height") || "680px";
  iframe.style.border = "0";
  iframe.style.display = "block";
  iframe.style.overflow = "hidden";
  iframe.setAttribute("scrolling", "no");
  iframe.setAttribute("data-quotebuilder-frame", frameKey);

  container.innerHTML = "";
  container.appendChild(iframe);

  function handleResize(event) {
    if (event.origin !== baseUrl) return;
    const data = event.data || {};
    if (data.type !== "quotebuilder:resize" || (data.key || data.slug) !== frameKey || !data.height) return;

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
