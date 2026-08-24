export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-lg leading-8 text-slate-600">{description}</p>
      ) : null}
    </div>
  );
}

export function PageBand({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="bg-slate-900">
      <div className="container-x py-16 sm:py-20">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="mb-3 text-xs font-bold tracking-widest text-amber-400 uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 text-lg leading-8 text-slate-300">{description}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
