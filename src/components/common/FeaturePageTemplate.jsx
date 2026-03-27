function FeaturePageTemplate({ title, description, data }) {
  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-600">{description}</p>
      </header>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <pre className="overflow-auto text-xs text-slate-700">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </section>
  );
}

export default FeaturePageTemplate;
