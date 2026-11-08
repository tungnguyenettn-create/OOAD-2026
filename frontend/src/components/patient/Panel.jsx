export default function Panel({ title, description, action, className = "", children }) {
  return (
    <section className={`pt-panel ${className}`}>
      {title && (
        <div className="pt-panel-head">
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
