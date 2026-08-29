import { useMemo, useState } from "react";
import { ArrowRight, Layers3 } from "lucide-react";
import { Link } from "./router";
import { DEMO_CATALOG, DEMO_CATEGORIES } from "./demo-catalog";
import { iconForDemo } from "./demo-icons";

export default function DemoLibrary() {
  const [activeCategory, setActiveCategory] = useState("all");
  const visibleDemos = useMemo(
    () =>
      activeCategory === "all"
        ? DEMO_CATALOG
        : DEMO_CATALOG.filter((demo) => demo.category === activeCategory),
    [activeCategory],
  );

  return (
    <section className="demo-library" id="biblioteca-demos">
      <div className="demo-library-heading">
        <div>
          <span className="portal-eyebrow">BIBLIOTECA INTERACTIVA</span>
          <h2>Elige qué proceso quieres automatizar.</h2>
        </div>
        <p>
          Dieciocho recorridos construidos sobre el mismo motor. Cambian las
          preguntas, reglas y resultado; la base técnica es compartida.
        </p>
      </div>

      <div className="demo-library-toolbar">
        <div className="demo-library-filters" aria-label="Filtrar demostraciones">
          <button
            type="button"
            className={activeCategory === "all" ? "active" : ""}
            aria-pressed={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
          >
            Todas <span>{DEMO_CATALOG.length}</span>
          </button>
          {DEMO_CATEGORIES.map((category) => {
            const count = DEMO_CATALOG.filter(
              (demo) => demo.category === category.id,
            ).length;
            return (
              <button
                type="button"
                key={category.id}
                className={activeCategory === category.id ? "active" : ""}
                aria-pressed={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label} <span>{count}</span>
              </button>
            );
          })}
        </div>
        <span className="demo-library-count" aria-live="polite">
          {visibleDemos.length} demostraciones
        </span>
      </div>

      <div className="demo-library-grid">
        {visibleDemos.map((demo, index) => {
          const Icon = iconForDemo(demo.icon);
          return (
            <Link
              className="demo-library-card"
              to={`/demos/${demo.slug}`}
              key={demo.id}
              style={{ "--demo-accent": demo.accent, "--demo-tint": demo.tint }}
              aria-label={`Abrir demo de ${demo.name}`}
            >
              <span className="demo-library-card-top">
                <span className="demo-library-icon">
                  <Icon size={23} />
                </span>
                <small>{String(index + 1).padStart(2, "0")}</small>
              </span>
              <span className="demo-library-card-copy">
                <small>{demo.eyebrow}</small>
                <strong>{demo.name}</strong>
                <span>{demo.description}</span>
              </span>
              <span className="demo-library-capabilities">
                {demo.capabilities.slice(0, 2).map((capability) => (
                  <small key={capability}>{capability}</small>
                ))}
              </span>
              <span className="demo-library-card-action">
                Probar recorrido <ArrowRight size={17} />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="demo-library-legacy-note">
        <span><Layers3 size={21} /></span>
        <div>
          <strong>¿Quieres una simulación con cálculo detallado?</strong>
          <p>
            Debajo conservamos los siete simuladores sectoriales completos, con
            formularios extensos y desglose económico.
          </p>
        </div>
        <a href="#sectores">Ver simuladores sectoriales <ArrowRight size={16} /></a>
      </div>
    </section>
  );
}
