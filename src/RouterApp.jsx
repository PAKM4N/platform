import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import HomeExperience from "./HomeExperience";
import SectorExperience from "./SectorExperience";
import GenericDemoExperience from "./GenericDemoExperience";
import ChatWidget from "./ChatWidget";
import { Link } from "./router";
import { DEMOS_BY_SLUG } from "./demo-catalog";
import { SERVICES_BY_SLUG } from "./service-models";

const defaultDescription =
  "Simuladores sectoriales y chatbots web creados a medida por Mercamicro.";

function currentPath() {
  let path = window.location.pathname;
  try { path = decodeURIComponent(path); } catch { /* Una URL incompleta muestra la página 404. */ }
  path = path.replace(/\/+$/, "");
  return path || "/";
}

function usePathname() {
  const [pathname, setPathname] = useState(currentPath);

  useEffect(() => {
    const update = () => setPathname(currentPath());
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);

  return pathname;
}

function updateMetadata({ service, demo, pathname }) {
  const activeExperience = demo || service;
  document.title = !activeExperience && !["/", "/demos"].includes(pathname)
    ? "Demo no encontrada — Mercamicro"
    : activeExperience
    ? `${activeExperience.name} — Demo Mercamicro`
    : "Mercamicro — Demos de automatización";

  const description =
    demo?.description || service?.heroLead || defaultDescription;
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.append(meta);
  }
  meta.setAttribute("content", description);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.append(canonical);
  }
  canonical.setAttribute(
    "href",
    `https://demos.mercamicro.es${pathname === "/demos" ? "/" : pathname}`,
  );
}

function NotFound() {
  useEffect(() => {
    document.title = "Sector no encontrado — Mercamicro";
  }, []);

  return (
    <main className="not-found" id="contenido-principal" tabIndex={-1}>
      <span>404 / SECTOR NO ENCONTRADO</span>
      <h1>Esta demo no existe.</h1>
      <p>Vuelve al selector para elegir uno de los sectores disponibles.</p>
      <Link to="/">
        <ArrowLeft size={16} /> Elegir sector
      </Link>
    </main>
  );
}

export default function RouterApp() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const slug = segments[0];
  const service = segments.length === 1 && slug ? SERVICES_BY_SLUG[slug] : null;
  const demo =
    segments.length === 2 && segments[0] === "demos"
      ? DEMOS_BY_SLUG[segments[1]]
      : null;

  useEffect(() => {
    updateMetadata({ service, demo, pathname });
    if (window.location.hash) {
      const frame = window.requestAnimationFrame(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: "instant" }));
      return () => window.cancelAnimationFrame(frame);
    }
  }, [pathname, service, demo]);

  let page = <NotFound />;
  if (pathname === "/" || pathname === "/demos") page = <HomeExperience />;
  else if (demo) {
    page = <GenericDemoExperience demo={demo} key={demo.id} />;
  }
  else if (service && pathname === `/${service.slug}`) {
    page = <SectorExperience serviceId={service.id} key={service.id} />;
  }

  return (
    <>
      <a className="skip-link" href="#contenido-principal" onClick={() => document.querySelector("main")?.focus()}>Saltar al contenido</a>
      {page}
      {!demo && (service || pathname === "/" || pathname === "/demos") && <ChatWidget pathname={pathname} key={`chat-${service?.id || "home"}`} />}
    </>
  );
}
