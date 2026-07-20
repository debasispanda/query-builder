import type { QueryInputContext } from '@repo/core/types/jql'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface SuggestionPopoverProps {
  isOpen?: boolean
  suggestions?: string[]
  onSelect?: (suggestion: string) => void
  onActiveIndexChange?: (index: number) => void
  activeIndex?: number
  context?: QueryInputContext
  anchorEl?: HTMLElement | null
  partial?: string
}

function getGroupHeading(context: QueryInputContext) {
  if (context === 'FIELD') {
    return 'Fields'
  }

  if (context === 'OPERATOR') {
    return 'Operators'
  }

  if (context === 'CONNECTOR') {
    return 'Connectors'
  }

  return 'Values'
}

function renderSuggestionLabel(suggestion: string, partial: string) {
  if (!partial) {
    return suggestion
  }

  const lowerSuggestion = suggestion.toLowerCase()
  const lowerPartial = partial.toLowerCase()
  const matchIndex = lowerSuggestion.indexOf(lowerPartial)

  if (matchIndex === -1) {
    return suggestion
  }

  const start = suggestion.slice(0, matchIndex)
  const match = suggestion.slice(matchIndex, matchIndex + partial.length)
  const end = suggestion.slice(matchIndex + partial.length)

  return (
    <>
      {start}
      <span className="font-semibold text-slate-900">{match}</span>
      {end}
    </>
  )
}

export function SuggestionPopover({
  isOpen = false,
  suggestions = [],
  onSelect,
  onActiveIndexChange,
  activeIndex = 0,
  context = 'FIELD',
  anchorEl,
  partial = '',
}: SuggestionPopoverProps) {
  return (
    <Popover open={isOpen}>
      <PopoverAnchor asChild>
        <div
          aria-hidden="true"
          className="block h-0 w-full"
          data-anchor-present={anchorEl ? 'true' : 'false'}
        />
      </PopoverAnchor>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={8}
        className="w-[min(28rem,var(--radix-popover-trigger-width,100%))] p-1"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onMouseDown={(event) => event.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList>
            {suggestions.length === 0 ? (
              <CommandEmpty>No suggestions</CommandEmpty>
            ) : (
              <CommandGroup heading={getGroupHeading(context)}>
                {suggestions.map((suggestion, index) => (
                  <CommandItem
                    key={`${context}-${suggestion}`}
                    value={suggestion}
                    onSelect={() => onSelect?.(suggestion)}
                    onMouseEnter={() => onActiveIndexChange?.(index)}
                    className={cn(
                      activeIndex === index && 'bg-slate-100 text-slate-900',
                    )}
                  >
                    {renderSuggestionLabel(suggestion, partial)}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
