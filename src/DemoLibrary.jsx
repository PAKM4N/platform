import { useMemo, useState } from "react";
import { ArrowRight, Clock3, Layers3, Search, X } from "lucide-react";
import { Link } from "./router";
import { DEMO_CATALOG, DEMO_CATEGORIES } from "./demo-catalog";
import { iconForDemo } from "./demo-icons";

export default function DemoLibrary() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const visibleDemos = useMemo(
    () =>
      DEMO_CATALOG.filter((demo) =>
        (activeCategory === "all" || demo.category === activeCategory) &&
        normalize(`${demo.name} ${demo.description} ${demo.capabilities.join(" ")}`).includes(normalize(search.trim())),
      ),
    [activeCategory, search],
  );

  return (
    <section className="demo-library" id="biblioteca-demos">
      <div className="demo-library-heading">
        <div>
          <span className="portal-eyebrow">PRUÉBALO COMO UN CLIENTE</span>
          <h2>Una necesidad.<br />Una conversación más fácil.</h2>
        </div>
        <p>
          Elige un ejemplo y descubre cómo atender una reserva, preparar un pedido
          o resolver una consulta. Sin registro y con respuestas que puedes cambiar.
        </p>
      </div>

      <div className="demo-library-search-row">
        <label className="demo-library-search">
          <Search size={19} aria-hidden="true" />
          <span className="demo-visually-hidden">Buscar una demostración</span>
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Busca reservas, taller, pedidos…" />
        </label>
        <span className="demo-library-time"><Clock3 size={16} /> Alrededor de 1 minuto por prueba</span>
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
          {visibleDemos.length} {visibleDemos.length === 1 ? "demostración" : "demostraciones"}
        </span>
      </div>

      <div className="demo-library-grid">
        {visibleDemos.map((demo) => {
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
                <small>{demo.questions.length} preguntas</small>
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
                Probar demo <ArrowRight size={17} />
              </span>
            </Link>
          );
        })}
      </div>
      {visibleDemos.length === 0 && <div className="demo-library-empty">
        <Search size={28} aria-hidden="true" />
        <h3>No encontramos ese ejemplo.</h3>
        <p>Prueba con otra palabra o vuelve a ver todas las demostraciones.</p>
        <button type="button" onClick={() => { setSearch(""); setActiveCategory("all"); }}><X size={16} /> Quitar filtros</button>
      </div>}

      <div className="demo-library-legacy-note">
        <span><Layers3 size={21} /></span>
        <div>
          <strong>¿Prefieres ver también un presupuesto?</strong>
          <p>
            Prueba los siete ejemplos por sector: elige servicios, compara opciones
            y consulta un desglose de precios orientativos.
          </p>
        </div>
        <a href="#sectores">Ver ejemplos con precios <ArrowRight size={16} /></a>
      </div>
    </section>
  );
}
