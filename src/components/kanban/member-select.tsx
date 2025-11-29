'use client'

import { Check, ChevronsUpDown } from 'lucide-react'
import type { User } from '@prisma/client'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface MemberSelectProps {
  members: User[]
  value: string | null
  onChange: (value: string | null) => void
}

export function MemberSelect({ members, value, onChange }: MemberSelectProps) {
  const [open, setOpen] = useState(false)
  const selectedUser = members.find((member) => member.supabaseId === value)

  const handleSelect = (memberId: string | null) => {
    // If the same user is selected, do nothing new, just close.
    // The logic to un-assign should be explicit via "Unassigned" option.
    onChange(memberId)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
        >
          {selectedUser ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={selectedUser.avatarUrl ?? ''} alt={selectedUser.name ?? 'User'} />
                <AvatarFallback>
                  {selectedUser.name?.charAt(0).toUpperCase() || selectedUser.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{selectedUser.name || selectedUser.email}</span>
            </div>
          ) : (
            'Unassigned'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0 bg-slate-900 border-slate-800 text-white">
        <Command>
          <CommandInput placeholder="Search members..." />
          <CommandList>
            <CommandEmpty>No members found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => handleSelect(null)}
                className="cursor-pointer"
              >
                Unassigned
              </CommandItem>
              {members.map((member) => (
                <CommandItem
                  key={member.id}
                  value={member.supabaseId}
                  onSelect={(currentValue) => {
                    // The `currentValue` from onSelect is the `value` prop of CommandItem
                    handleSelect(currentValue)
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === member.supabaseId ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                   <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                          <AvatarImage src={member.avatarUrl ?? ''} alt={member.name ?? 'User'} />
                          <AvatarFallback>
                            {member.name?.charAt(0).toUpperCase() || member.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{member.name || member.email}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
