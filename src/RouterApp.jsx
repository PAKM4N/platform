import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import HomeExperience from "./HomeExperience";
import SectorExperience from "./SectorExperience";
import ChatWidget from "./ChatWidget";
import { Link } from "./router";
import { SERVICES_BY_SLUG } from "./service-models";

const defaultDescription =
  "Simuladores sectoriales y chatbots web creados a medida por Mercamicro.";

function currentPath() {
  const path = decodeURIComponent(window.location.pathname).replace(/\/+$/, "");
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

function updateMetadata(service) {
  document.title = service
    ? `${service.name} — Mercamicro`
    : "Mercamicro — Demos sectoriales";

  const description = service?.heroLead || defaultDescription;
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.append(meta);
  }
  meta.setAttribute("content", description);
}

function NotFound() {
  useEffect(() => {
    document.title = "Sector no encontrado — Mercamicro";
  }, []);

  return (
    <main className="not-found">
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
  const slug = pathname.split("/").filter(Boolean)[0];
  const service = slug ? SERVICES_BY_SLUG[slug] : null;

  useEffect(() => {
    updateMetadata(service);
  }, [pathname, service]);

  let page = <NotFound />;
  if (pathname === "/") page = <HomeExperience />;
  else if (service && pathname === `/${service.slug}`) {
    page = <SectorExperience serviceId={service.id} />;
  }

  return (
    <>
      {page}
      <ChatWidget pathname={pathname} />
    </>
  );
}
