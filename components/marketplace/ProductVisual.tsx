type ProductVisualProps = {
  title: string;
  level?: string;
  resourceType?: string;
  variant?: "cover" | "preview" | "path";
};

export function ProductVisual({ title, level, resourceType, variant = "cover" }: ProductVisualProps) {
  return (
    <div className={`product-visual ${variant}`}>
      <div className="visual-grid" aria-hidden="true" />
      <div className="visual-content">
        <span className="visual-kicker">LANCELOT</span>
        <strong>{title}</strong>
        <span>{[level, resourceType].filter(Boolean).join(" / ")}</span>
      </div>
      {variant === "preview" ? <div className="watermark">PREVIEW</div> : null}
    </div>
  );
}
