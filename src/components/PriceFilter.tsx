"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useCallback } from "react"

// ============================================================
// PriceFilter — Client Component for price range inputs
// ============================================================

interface PriceFilterProps {
  minPrice?: string
  maxPrice?: string
  activeCollection?: string
}

export default function PriceFilter({
  minPrice,
  maxPrice,
  activeCollection,
}: PriceFilterProps) {
  const router = useRouter()
  const pathname = usePathname()

  const buildUrl = useCallback(
    (min: string, max: string) => {
      const params = new URLSearchParams()
      if (activeCollection) params.set("collection", activeCollection)
      if (min) params.set("minPrice", min)
      if (max) params.set("maxPrice", max)
      const qs = params.toString()
      return qs ? `${pathname}?${qs}` : pathname
    },
    [activeCollection, pathname]
  )

  return (
    <div className="space-y-2">
      <div>
        <label htmlFor="min-price" className="text-xs text-muted-foreground">
          Prix min
        </label>
        <input
          id="min-price"
          type="number"
          min="0"
          step="0.01"
          defaultValue={minPrice ?? ""}
          placeholder="0 €"
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          onChange={(e) => {
            const val = e.target.value
            router.push(buildUrl(val, maxPrice ?? ""))
          }}
        />
      </div>
      <div>
        <label htmlFor="max-price" className="text-xs text-muted-foreground">
          Prix max
        </label>
        <input
          id="max-price"
          type="number"
          min="0"
          step="0.01"
          defaultValue={maxPrice ?? ""}
          placeholder="Max"
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          onChange={(e) => {
            const val = e.target.value
            router.push(buildUrl(minPrice ?? "", val))
          }}
        />
      </div>
    </div>
  )
}