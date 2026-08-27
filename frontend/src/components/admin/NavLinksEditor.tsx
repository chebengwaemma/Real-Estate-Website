import { FormField } from '@/components/forms/FormField'
import { Button } from '@/components/common/Button'
import type { EditableNavItem } from '@/lib/navConfig'

export function NavLinksEditor({
  title,
  hint,
  items,
  onChange,
}: {
  title: string
  hint?: string
  items: EditableNavItem[]
  onChange: (items: EditableNavItem[]) => void
}) {
  const update = (index: number, patch: Partial<EditableNavItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const move = (index: number, dir: -1 | 1) => {
    const next = [...items]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="sm:col-span-2">
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      <div className="mt-3 flex flex-col gap-3">
        {items.map((item, index) => (
          <div key={`${item.to}-${index}`} className="rounded-xl border border-black/10 p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                label="Label"
                value={item.label}
                onChange={(e) => update(index, { label: e.target.value })}
                placeholder="Leadership Board"
              />
              <FormField
                label="Path"
                value={item.to}
                onChange={(e) => update(index, { to: e.target.value })}
                placeholder="/leadership"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="ghost" onClick={() => move(index, -1)} disabled={index === 0}>
                Up
              </Button>
              <Button type="button" variant="ghost" onClick={() => move(index, 1)} disabled={index === items.length - 1}>
                Down
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="secondary"
        className="mt-3"
        onClick={() => onChange([...items, { to: '/', label: 'New link' }])}
      >
        Add link
      </Button>
    </div>
  )
}
