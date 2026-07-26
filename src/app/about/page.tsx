export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
        À propos
      </h1>
      <div className="prose prose-lg max-w-3xl text-muted-foreground">
        <p>
          Bienvenue sur notre boutique en ligne. Nous sommes passionnés par la
          qualité et le service client.
        </p>
        <p>
          Cette application est construite avec Next.js, Shopify (headless
          commerce) et Sanity (CMS headless).
        </p>
      </div>
    </div>
  )
}