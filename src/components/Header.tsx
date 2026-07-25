"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

const navItems = [
  { name: "Accueil", href: "/" },
  { name: "Boutique", href: "/shop" },
  { name: "À propos", href: "/about" },
  { name: "Contact", href: "/contact" },
]

function CartButton({ count }: { count: number }) {
  return (
    <Link href="/cart" className="relative inline-flex items-center justify-center">
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
          {count}
        </Badge>
      )}
      <span className="sr-only">Voir le panier</span>
    </Link>
  )
}

export default function Header() {
  const cartItemCount = 0

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
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

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.name}>
                  <NavigationMenuLink
                    className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-muted/50 data-[active=true]:text-foreground"
                    href={item.href}
                  >
                    {item.name}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Cart & Mobile Menu */}
        <div className="flex items-center space-x-2">
          {/* Cart Button */}
          <Button variant="ghost" size="icon" className="[&_svg]:size-5">
            <CartButton count={cartItemCount} />
          </Button>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Ouvrir le menu</span>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col space-y-4 pt-8 px-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-sm font-medium transition-colors hover:text-foreground"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}