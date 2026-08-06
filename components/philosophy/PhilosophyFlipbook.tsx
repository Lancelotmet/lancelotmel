"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PhilosophyVolume } from "@/lib/philosophy-library";

type BookPage = { volumeId: string; volumeNumber: string; volumeTitle: string; title: string; content: string };

function cleanHeading(line: string) {
  return line.replace(/#/g, "").replace(/\*\*/g, "").trim();
}

function headingLevel(line: string) {
  return (line.match(/^#+/)?.[0].length ?? 1);
}

function parseTableRow(line: string) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cleanHeading(cell));
}

function isTableDivider(line: string) {
  return /^\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());
}

function MarkdownTable({ content }: { content: string }) {
  const lines = content.split("\n").filter(Boolean);
  const headers = parseTableRow(lines[0]);
  const rows = lines.slice(2).filter((line) => line.trim().startsWith("|")).map(parseTableRow);

  return <div className="philosophy-table-scroll">
    <table className="philosophy-table">
      <thead><tr>{headers.map((header, index) => <th key={`${header}-${index}`} scope="col">{header}</th>)}</tr></thead>
      <tbody>{rows.map((row, rowIndex) => <tr key={`${rowIndex}-${row.join("-")}`}>{headers.map((_, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{row[cellIndex] ?? ""}</td>)}</tr>)}</tbody>
    </table>
  </div>;
}

function buildPages(volumes: PhilosophyVolume[]): BookPage[] {
  return volumes.flatMap((volume) => {
    const sections = volume.content
      .trim()
      .split(/(?=^#{1,2}\s*(?:CAP[IÍ]TULO|Cap[ií]tulo|Pr[oó]logo|Ep[ií]logo))/m)
      .map((content) => content.trim())
      .filter(Boolean);

    return sections.map((content, index) => {
      const heading = content.split("\n").find((line) => /^#{1,3}\s+/.test(line));
      return {
        volumeId: volume.id,
        volumeNumber: volume.number,
        volumeTitle: volume.title,
        title: heading ? cleanHeading(heading) : index === 0 ? volume.title : `Lectura ${index + 1}`,
        content
      };
    });
  });
}

function MarkdownPage({ content }: { content: string }) {
  return <div className="philosophy-page-content">
    {content.split(/\n{2,}/).map((block, index) => {
      const text = block.trim();
      if (!text || text === "---") return null;
      const lines = text.split("\n").filter(Boolean);
      const isHeadingStack = lines.length > 1 && lines.every((line) => /^#{1,6}\s+/.test(line));
      if (isHeadingStack) {
        const isVolumeCover = lines.some((line) => /VOLUMEN\s+[IVX]+/i.test(cleanHeading(line)));
        return <header className={isVolumeCover ? "philosophy-volume-cover" : "philosophy-heading-stack"} key={index}>
          {lines.map((line, lineIndex) => {
            const title = cleanHeading(line);
            if (isVolumeCover && /BRAND BIBLE/i.test(title)) return <p className="philosophy-cover-brand" key={line}>{title}</p>;
            if (isVolumeCover && /VOLUMEN\s+[IVX]+/i.test(title)) return <p className="philosophy-cover-volume" key={line}>{title}</p>;
            if (isVolumeCover && headingLevel(line) >= 2) return <p className="philosophy-cover-subtitle" key={line}>{title}</p>;
            const Heading = headingLevel(line) === 1 ? "h2" : headingLevel(line) === 2 ? "h3" : "h4";
            return <Heading key={lineIndex}>{title}</Heading>;
          })}
        </header>;
      }
      if (/^###\s+/.test(text)) return <h4 key={index}>{cleanHeading(text)}</h4>;
      if (/^##\s+/.test(text)) return <h3 key={index}>{cleanHeading(text)}</h3>;
      if (/^#\s+/.test(text)) return <h2 key={index}>{cleanHeading(text)}</h2>;
      if (text.startsWith(">")) return <blockquote key={index}>{cleanHeading(text.replace(/^>\s?/gm, ""))}</blockquote>;
      if (/^(?:[-*]|\d+\.)\s/m.test(text)) return <ul key={index}>{text.split("\n").filter(Boolean).map((line) => <li key={line}>{cleanHeading(line.replace(/^(?:[-*]|\d+\.)\s+/, ""))}</li>)}</ul>;
      if (text.startsWith("|") && isTableDivider(text.split("\n")[1] ?? "")) return <MarkdownTable content={text} key={index} />;
      return <p key={index}>{cleanHeading(text)}</p>;
    })}
  </div>;
}

export function PhilosophyFlipbook({ volumes }: { volumes: PhilosophyVolume[] }) {
  const pages = useMemo(() => buildPages(volumes), [volumes]);
  const [pageIndex, setPageIndex] = useState(0);
  const page = pages[pageIndex];
  const currentVolume = volumes.find((volume) => volume.id === page?.volumeId) ?? volumes[0];

  const selectVolume = (id: string) => {
    const firstPage = pages.findIndex((item) => item.volumeId === id);
    if (firstPage >= 0) setPageIndex(firstPage);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") setPageIndex((current) => Math.max(0, current - 1));
      if (event.key === "ArrowRight") setPageIndex((current) => Math.min(pages.length - 1, current + 1));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pages.length]);

  if (!page) return null;

  const volumePages = pages.filter((item) => item.volumeId === currentVolume.id);
  const pageInVolume = volumePages.findIndex((item) => item === page) + 1;
  const progress = Math.round(((pageIndex + 1) / pages.length) * 100);

  return <main className="philosophy-reader">
    <header className="philosophy-reader-nav">
      <Link className="philosophy-reader-brand" href="/"><img src="/brand/lancelot-logo-official.png" alt="LANCELOT — Desde el ser para el saber" /></Link>
      <p>Biblioteca de filosofía</p>
      <Link className="philosophy-reader-exit" href="/">Volver a Lancelot</Link>
    </header>

    <section className="philosophy-reader-hero">
      <p className="philosophy-reader-eyebrow">Una obra en cuatro volúmenes</p>
      <h1>La filosofía Lancelot</h1>
      <p>Una lectura para comprender cómo el conocimiento revela capacidad, criterio, lenguaje y cultura.</p>
      <span>Lectura web · sin descargas</span>
    </section>

    <section className="philosophy-library" aria-label="Biblioteca Lancelot">
      <aside className="philosophy-toc">
        <p>Índice de volúmenes</p>
        {volumes.map((volume) => <button className={volume.id === currentVolume.id ? "active" : ""} key={volume.id} onClick={() => selectVolume(volume.id)} type="button"><b>{volume.number}</b><span><strong>{volume.title}</strong><small>{volume.subtitle}</small></span></button>)}
        <div className="philosophy-toc-note"><strong>Cómo leer</strong><span>Usa las flechas del libro o las teclas ← y → para avanzar.</span></div>
      </aside>

      <div className="philosophy-book-wrap">
        <div className="philosophy-book-status"><span>Volumen {page.volumeNumber} · {page.volumeTitle}</span><span>Página {pageInVolume} de {volumePages.length}</span></div>
        <article className="philosophy-book-page" key={`${page.volumeId}-${pageIndex}`}>
          <div className="philosophy-book-page-top"><span>LANCELOT</span><span>{String(pageInVolume).padStart(2, "0")}</span></div>
          <MarkdownPage content={page.content} />
          <div className="philosophy-book-page-bottom"><span>Desde el ser para el saber</span><span>Vol. {page.volumeNumber}</span></div>
        </article>
        <div className="philosophy-book-controls"><button disabled={pageIndex === 0} onClick={() => setPageIndex((current) => Math.max(0, current - 1))} type="button">← Anterior</button><span>{pageIndex + 1} / {pages.length}</span><button disabled={pageIndex === pages.length - 1} onClick={() => setPageIndex((current) => Math.min(pages.length - 1, current + 1))} type="button">Siguiente →</button></div>
        <div aria-label={`${progress}% de lectura`} className="philosophy-progress"><i style={{ width: `${progress}%` }} /></div>
      </div>
    </section>
    <footer className="philosophy-reader-footer"><p>© LANCELOT. Desde el ser para el saber.</p></footer>
  </main>;
}
