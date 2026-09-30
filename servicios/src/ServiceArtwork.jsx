import './service-artwork.css';

function Platform({ x, y, width = 190, depth = 108, color = '#edf1ff' }) {
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M${-halfWidth} 8 0 ${halfDepth + 8} ${halfWidth} 8 0 ${-halfDepth + 8}Z`} fill="#17213a" opacity=".045" transform="translate(0 12)" />
      <path d={`M${-halfWidth} 0 0 ${halfDepth} 0 ${halfDepth + 8} ${-halfWidth} 8Z`} fill="#d8e0f5" />
      <path d={`M0 ${halfDepth} ${halfWidth} 0 ${halfWidth} 8 0 ${halfDepth + 8}Z`} fill="#bac9ed" />
      <path d={`M${-halfWidth} 0 0 ${-halfDepth} ${halfWidth} 0 0 ${halfDepth}Z`} fill={color} stroke="#cbd6f0" strokeWidth="1" />
    </g>
  );
}

function Rack({ x, y, light = false }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0 27-15 68 8 41 23Z" fill={light ? '#b1c4ff' : '#708ee3'} />
      <path d="M0 0 41 23 41 98 0 75Z" fill={light ? '#315bd8' : '#1d2b4b'} />
      <path d="M41 23 68 8 68 83 41 98Z" fill={light ? '#294ebf' : '#263d71'} />
      {[19, 40, 61].map((offset) => (
        <g key={offset} transform={`translate(0 ${offset})`}>
          <path d="M6 0 34 16 34 28 6 12Z" fill={light ? '#244bbf' : '#30456d'} />
          <path d="M11 7 24 14" fill="none" stroke={light ? '#bdd0ff' : '#91a4cc'} strokeWidth="2" />
          <path d="M29 17 31 18" fill="none" stroke="#7ee2cf" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ))}
      <path d="M48 30 61 23M48 36 61 29M48 42 61 35" fill="none" stroke={light ? '#7196fb' : '#506795'} strokeWidth="1.5" />
    </g>
  );
}

function Storage({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-22 0V27c0 7 44 7 44 0V0" fill="#7a99ec" />
      <ellipse rx="22" ry="10" fill="#d8e2ff" stroke="#9bb2ee" />
      <path d="M-22 9c0 13 44 13 44 0M-22 19c0 13 44 13 44 0" fill="none" stroke="#b7cbff" strokeWidth="1.5" />
      <path d="M12 17h2M12 27h2" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Workflow({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g fill="none" stroke="#6987d6" strokeWidth="2.5" strokeLinejoin="round">
        <path d="M-57 4-22 24 26-3 55 13" />
        <path d="M-22 24-22-10 10-28" />
      </g>
      <g transform="translate(-57 -6)">
        <path d="M-19 0 0-11 19 0 0 11Z" fill="#bbccfc" />
        <path d="M-19 0 0 11 0 31-19 20Z" fill="#315bd8" />
        <path d="M0 11 19 0 19 20 0 31Z" fill="#264cbe" />
        <path d="m-6-1 5 3 8-4" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g transform="translate(-22 12)">
        <path d="M-23 0 0-13 23 0 0 13Z" fill="#85a1f0" />
        <path d="M-23 0 0 13 0 34-23 21Z" fill="#243653" />
        <path d="M0 13 23 0 23 21 0 34Z" fill="#375480" />
        <path d="M-7 0H7M0-4v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g transform="translate(15 -38)">
        <path d="M-19 0 0-11 19 0 0 11Z" fill="#c8d5f6" />
        <path d="M-19 0 0 11 0 29-19 18Z" fill="#7b98dd" />
        <path d="M0 11 19 0 19 18 0 29Z" fill="#577ac9" />
        <ellipse rx="5" ry="3" fill="none" stroke="#fff" strokeWidth="2" />
      </g>
      <g transform="translate(60 1)">
        <path d="M-19 0 0-11 19 0 0 11Z" fill="#a4e2dc" />
        <path d="M-19 0 0 11 0 30-19 19Z" fill="#48a99e" />
        <path d="M0 11 19 0 19 19 0 30Z" fill="#358e8a" />
        <path d="m-6-1 5 3 8-4" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </g>
    </g>
  );
}

function WebWindow({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0 7-4 132 31 125 35Z" fill="#c6d4f8" />
      <path d="M125 35 132 31 132 123 125 127Z" fill="#7998e8" />
      <g transform="matrix(1 .28 0 1 0 0)">
        <rect width="125" height="92" rx="4" fill="#fff" stroke="#a8bdec" strokeWidth="1.5" />
        <path d="M4 0h117a4 4 0 0 1 4 4v14H0V4a4 4 0 0 1 4-4Z" fill="#dfe7fb" />
        <g fill="#7b93c6"><circle cx="9" cy="9" r="2" /><circle cx="17" cy="9" r="2" /><circle cx="25" cy="9" r="2" /></g>
        <path d="M13 32h43M13 38h33" stroke="#223759" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M13 49h46M13 55h37" stroke="#c5cfdf" strokeWidth="2" strokeLinecap="round" />
        <rect x="12" y="67" width="33" height="11" rx="2" fill="#315bd8" />
        <rect x="73" y="28" width="39" height="50" rx="3" fill="#e9eeff" />
        <path d="M78 66 91 47 106 61v12H78Z" fill="#8ca9f2" />
        <circle cx="101" cy="39" r="5" fill="#bdcef9" />
      </g>
      <g transform="matrix(1 .28 0 1 78 88)">
        <path d="M0 5a5 5 0 0 1 5-5h53a5 5 0 0 1 5 5v29a5 5 0 0 1-5 5H20L8 48v-9H5a5 5 0 0 1-5-5Z" fill="#213352" />
        <path d="M12 13h38M12 20h27" stroke="#c3d2f1" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="48" cy="29" r="3" fill="#84dccc" />
      </g>
    </g>
  );
}

export function HeroArtwork() {
  return (
    <figure className="service-artwork">
      <svg className="service-artwork__canvas" viewBox="0 0 560 440" fill="none" aria-hidden="true" focusable="false">
        <path d="m61 304 208 118 250-143M41 294l20 10M269 422l19-11" stroke="#dfe5f2" strokeWidth="1" />
        <path d="m150 258 82 47 70-40M245 208l91-52M375 187v34l-28 16" stroke="#8ba5df" strokeWidth="2" strokeLinejoin="round" />
        <path d="m150 266 82 47 69-40M247 216l90-52M383 189v36l-27 16" stroke="#e2e8f6" strokeWidth="1.5" strokeLinejoin="round" />
        <circle className="service-artwork__signal" cx="278" cy="189" r="4" fill="#315bd8" stroke="#f7f9ff" strokeWidth="2" />
        <circle className="service-artwork__signal service-artwork__signal--second" cx="261" cy="288" r="4" fill="#3aa99b" stroke="#f7f9ff" strokeWidth="2" />
        <Platform x={373} y={132} width={190} depth={108} />
        <Workflow x={373} y={126} />
        <Platform x={153} y={226} width={212} depth={120} />
        <Rack x={119} y={118} light />
        <Rack x={82} y={150} />
        <Storage x={200} y={222} />
        <Platform x={378} y={322} width={224} depth={126} color="#e6edff" />
        <WebWindow x={307} y={209} />
        <path d="m361 376 17 9 18-10" stroke="#718fd8" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <figcaption className="service-artwork__labels">
        <span className="service-artwork__label service-artwork__label--systems"><i aria-hidden="true" />Infraestructura</span>
        <span className="service-artwork__label service-artwork__label--automation"><i aria-hidden="true" />Automatización</span>
        <span className="service-artwork__label service-artwork__label--web"><i aria-hidden="true" />Web y chatbots</span>
      </figcaption>
    </figure>
  );
}

export function AreaArtwork({ area }) {
  return (
    <svg className={`area-artwork area-artwork--${area}`} viewBox="0 0 320 120" fill="none" aria-hidden="true" focusable="false">
      {area === 'sistemas' && (
        <>
          <path d="m64 91 87-50 103 59M181 59l44-25" stroke="#bdcdee" strokeWidth="1.5" />
          <path d="M227 21c-3-10-17-12-23-3-11-3-17 10-11 17h45c9-8 0-22-11-14Z" fill="#e4ecff" stroke="#a9bdeb" strokeWidth="1.5" />
          <g transform="translate(128 12) scale(.72)"><Rack x={0} y={0} light /><Rack x={-38} y={23} /></g>
          <Storage x={222} y={74} />
          <circle cx="73" cy="86" r="4" fill="#88cfca" />
        </>
      )}
      {area === 'automatizacion' && (
        <>
          <path d="m72 91 88-51 92 53" stroke="#d8e2f6" strokeWidth="1.5" />
          <g transform="translate(157 52) scale(1.18)"><Workflow x={0} y={0} /></g>
          <path d="m71 47 18 10M235 82l18 10" stroke="#bacded" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {area === 'webs' && (
        <>
          <path d="m76 77 87-50 90 52-51 29" stroke="#d5e0f5" strokeWidth="1.5" />
          <g transform="translate(110 0) scale(.75)"><WebWindow x={0} y={0} /></g>
          <path d="m81 36-8 5 8 5M249 55l8 5-8 5" stroke="#829de0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="85" cy="78" r="4" fill="#88cfca" />
        </>
      )}
    </svg>
  );
}
