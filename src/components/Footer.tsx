import Link from "next/link"
import Image from "next/image"

const footerLinks = [
  {
    title: "Boutique",
    links: [
      { name: "Produits", href: "/shop" },
      { name: "Nouveautés", href: "/shop/new" },
      { name: "Meilleures ventes", href: "/shop/best-sellers" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { name: "À propos", href: "/about" },
      { name: "Carrières", href: "/careers" },
      { name: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Service client",
    links: [
      { name: "FAQ", href: "/faq" },
      { name: "Livraison", href: "/shipping" },
      { name: "Retours", href: "/returns" },
      { name: "Confidentialité", href: "/privacy" },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Logo & Description */}
          <div className="flex flex-col space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/vercel.svg"
                alt="Logo"
                width={32}
                height={32}
                className="dark:invert"
              />
              <span className="font-bold text-xl">E-Commerce</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Votre boutique en ligne de confiance. Livraison rapide et
              satisfait ou remboursé.
            </p>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section) => (
            <div key={section.title} className="flex flex-col space-y-3">
              <h3 className="text-sm font-semibold">{section.title}</h3>
              <nav className="flex flex-col space-y-2">
                {section.links.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t pt-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} E-Commerce. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
