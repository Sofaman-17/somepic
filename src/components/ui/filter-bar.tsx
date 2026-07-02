'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface FilterOption {
  value: string
  label: string
}

interface FilterBarProps {
  searchPlaceholder?: string
  filters?: {
    key: string
    placeholder: string
    options: FilterOption[]
  }[]
  className?: string
}

// Componente reutilizable de búsqueda + filtros.
// Usa URL search params — el estado vive en la URL, no en React state.
// Esto significa que los filtros son compartibles, persistentes al recargar
// y compatibles con el sistema de caché de Next.js.
export function FilterBar({ searchPlaceholder = 'Buscar…', filters = [], className }: FilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Actualiza un parámetro en la URL sin perder los demás
  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'todos') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page') // reset paginación al filtrar
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  function clearAll() {
    router.replace(pathname, { scroll: false })
  }

  const hasActiveFilters = searchParams.toString().length > 0

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {/* Búsqueda por texto */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          className="pl-9 h-9 text-sm"
          defaultValue={searchParams.get('q') ?? ''}
          onChange={(e) => {
            // Debounce: espera 300ms antes de actualizar la URL
            const timer = setTimeout(() => updateParam('q', e.target.value), 300)
            return () => clearTimeout(timer)
          }}
        />
      </div>

      {/* Filtros de select */}
      {filters.map((filter) => (
        <Select
          key={filter.key}
          value={searchParams.get(filter.key) ?? 'todos'}
          onValueChange={(v) => updateParam(filter.key, v)}
        >
          <SelectTrigger className="h-9 text-sm w-auto min-w-[130px]">
            <SelectValue placeholder={filter.placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">{filter.placeholder}</SelectItem>
            {filter.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {/* Botón limpiar filtros */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 text-xs text-muted-foreground gap-1"
          onClick={clearAll}
        >
          <X className="h-3 w-3" />
          Limpiar
        </Button>
      )}
    </div>
  )
}
