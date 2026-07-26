// ============================================================
// Cart Context — Headless Shopify Cart Management
// ============================================================
// React Context that manages the Shopify cart via GraphQL mutations:
//   cartCreate, cartLinesAdd, cartLinesRemove, cartLinesUpdate
// The cartId is persisted in localStorage for session continuity.
// ============================================================

"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import {
  createCart,
  getCart,
  addCartLines,
  removeCartLines,
  updateCartLines,
  CART_COOKIE_NAME,
} from "@/lib/shopify"

import type { ShopifyCart } from "@/lib/shopify/types"

// ============================================================
// Types
// ============================================================

/**
 * Simplified cart item for UI consumption.
 * Maps from ShopifyCartLine.merchandise to a flat structure.
 */
export interface CartItem {
  id: string
  variantId: string
  title: string
  quantity: number
  price: { amount: string; currencyCode: string }
  image: string | null
  productHandle: string
  availableForSale: boolean
}

/**
 * Price object returned by the cart context.
 */
export interface CartPrice {
  amount: string
  currencyCode: string
}

/**
 * The full cart context value.
 */
export interface CartContextType {
  cart: ShopifyCart | null
  items: CartItem[]
  itemCount: number
  subtotal: CartPrice
  isLoading: boolean
  isCartOpen: boolean
  addItem: (variantId: string, quantity?: number) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
  updateItem: (lineId: string, quantity: number) => Promise<void>
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
}

// ============================================================
// Price Formatting Helper
// ============================================================

/**
 * Format a price string from Shopify into a localized currency string.
 */
export function formatPrice(
  amount: string,
  currencyCode: string = "EUR"
): string {
  const numericAmount = parseFloat(amount)
  if (isNaN(numericAmount)) return amount

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount)
}

// ============================================================
// Context
// ============================================================

const CartContext = createContext<CartContextType | undefined>(undefined)

/**
 * Hook to access the cart context.
 * Must be used within a <CartProvider>.
 */
export function useCart(): CartContextType {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

// ============================================================
// Provider
// ============================================================

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  // --- Initialize cart from localStorage on mount ---
  useEffect(() => {
    const cartId = localStorage.getItem(CART_COOKIE_NAME)
    if (cartId) {
      getCart(cartId)
        .then((fetchedCart) => {
          if (fetchedCart) {
            setCart(fetchedCart)
          } else {
            // Cart expired or invalid — clean up
            localStorage.removeItem(CART_COOKIE_NAME)
          }
        })
        .catch(() => {
          localStorage.removeItem(CART_COOKIE_NAME)
        })
    }
  }, [])

  // --- Derived state: cart items ---
  const items: CartItem[] =
    cart?.lines.map((line) => ({
      id: line.id,
      variantId: line.merchandise.id,
      title: line.merchandise.title,
      quantity: line.quantity,
      price: line.cost.totalAmount,
      image: line.merchandise.image?.url ?? null,
      productHandle: line.merchandise.product.handle,
      availableForSale: line.merchandise.availableForSale,
    })) ?? []

  // --- Derived state: total item count ---
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  // --- Derived state: subtotal ---
  const subtotal: CartPrice = cart?.cost.subtotalAmount ?? {
    amount: "0",
    currencyCode: "EUR",
  }

  // ============================================================
  // Cart Actions
  // ============================================================

  /**
   * Add a line item to the cart.
   * Creates a new cart if none exists.
   * Opens the cart drawer after adding.
   */
  const addItem = async (variantId: string, quantity: number = 1) => {
    if (!variantId) return

    setIsLoading(true)
    try {
      let currentCart = cart

      // Create a new cart if we don't have one yet
      if (!currentCart) {
        currentCart = await createCart()
        localStorage.setItem(CART_COOKIE_NAME, currentCart.id)
      }

      // Add the line item
      const updatedCart = await addCartLines(currentCart.id, [
        { quantity, merchandiseId: variantId },
      ])

      setCart(updatedCart)
      setIsCartOpen(true)
    } catch (error) {
      console.error("Failed to add item to cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Remove a line item from the cart.
   */
  const removeItem = async (lineId: string) => {
    if (!cart) return

    setIsLoading(true)
    try {
      const updatedCart = await removeCartLines(cart.id, [lineId])
      setCart(updatedCart)
    } catch (error) {
      console.error("Failed to remove item from cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Update a line item's quantity in the cart.
   * If quantity is 0 or less, the item is removed.
   */
  const updateItem = async (lineId: string, quantity: number) => {
    if (!cart) return

    if (quantity <= 0) {
      await removeItem(lineId)
      return
    }

    setIsLoading(true)
    try {
      const updatedCart = await updateCartLines(cart.id, [
        { id: lineId, quantity },
      ])
      setCart(updatedCart)
    } catch (error) {
      console.error("Failed to update item in cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Clear the cart — removes the cartId from localStorage and resets state.
   */
  const clearCart = () => {
    localStorage.removeItem(CART_COOKIE_NAME)
    setCart(null)
  }

  /**
   * Open the cart drawer.
   */
  const openCart = () => setIsCartOpen(true)

  /**
   * Close the cart drawer.
   */
  const closeCart = () => setIsCartOpen(false)

  // ============================================================
  // Context Value
  // ============================================================

  const value: CartContextType = {
    cart,
    items,
    itemCount,
    subtotal,
    isLoading,
    isCartOpen,
    addItem,
    removeItem,
    updateItem,
    clearCart,
    openCart,
    closeCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
