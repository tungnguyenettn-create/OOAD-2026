export default function PageTitle({ eyebrow, title, subtitle, children }) {
  return (
    <div className="pt-welcome">
      <div>
        <p className="pt-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {subtitle && <p className="pt-sub">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
