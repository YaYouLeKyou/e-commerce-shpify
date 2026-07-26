// ============================================================
// CartSheet — Sliding Drawer Cart (Client Component)
// ============================================================
// A shadcn/ui Sheet-based drawer that displays:
//   - All cart line items (image, title, quantity, price)
//   - Subtotal
//   - "Proceed to Checkout" button → redirects to cart.checkoutUrl
//
// Controlled by the CartContext (open/close state).
// ============================================================

"use client"

import Image from "next/image"
import { Trash2, ShoppingCart, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { useCart, formatPrice } from "@/context/cart-context"

// ============================================================
// Component
// ============================================================

export default function CartSheet() {
  const {
    cart,
    items,
    itemCount,
    subtotal,
    isLoading,
    isCartOpen,
    removeItem,
    updateItem,
    closeCart,
  } = useCart()

  // --- Handlers ---

  const handleQuantityChange = (lineId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(lineId)
    } else {
      updateItem(lineId, newQuantity)
    }
  }

  const handleCheckout = () => {
    if (cart?.checkoutUrl) {
      window.location.href = cart.checkoutUrl
    }
  }

  // --- Render ---

  return (
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent side="right" className="flex w-full max-w-md flex-col">
        <SheetHeader>
          <SheetTitle>
            Votre panier
            {itemCount > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({itemCount} {itemCount === 1 ? "article" : "articles"})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium text-foreground">
                Votre panier est vide
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ajoutez des produits pour commencer vos achats.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 items-start">
                  {/* Product Image */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover object-center"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-1">
                    <h3 className="font-medium text-foreground line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.price.amount, item.price.currencyCode)}
                    </p>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 rounded-full p-0"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                        disabled={isLoading || item.quantity <= 1}
                        aria-label="Diminuer"
                      >
                        −
                      </Button>
                      <span className="w-6 text-center text-xs">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 rounded-full p-0"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                        disabled={isLoading || !item.availableForSale}
                        aria-label="Augmenter"
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 shrink-0 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                    disabled={isLoading}
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subtotal & Checkout */}
        {items.length > 0 && (
          <SheetFooter className="border-t pt-4">
            <div className="w-full space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="font-medium text-foreground">
                  {formatPrice(subtotal.amount, subtotal.currencyCode)}
                </span>
              </div>

              {/* Proceed to Checkout */}
              <Button
                size="lg"
                className="w-full"
                onClick={handleCheckout}
                disabled={isLoading || !cart?.checkoutUrl}
              >
                Procéder au paiement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {/* Continue Shopping */}
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={closeCart}
              >
                Continuer les achats
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
