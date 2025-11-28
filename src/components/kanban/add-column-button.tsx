'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { PlusIcon } from '@radix-ui/react-icons'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { createColumn } from '@/app/actions'

interface AddColumnButtonProps {
  projectId: string;
}

export function AddColumnButton({ projectId }: AddColumnButtonProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateColumn = async () => {
    if (isSubmitting || title.trim() === '') return;

    setIsSubmitting(true);
    try {
      const result = await createColumn({ projectId, title });
      if (result.status === 'error') {
        throw new Error(result.message);
      }
      toast.success('Column created');
      setOpen(false);
      setTitle('');
    } catch (e: any) {
      toast.error(e.message || 'Failed to create column');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="bg-transparent border-white/10 hover:bg-white/10">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Column
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-slate-900 border-slate-800 text-white">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">New Column</h4>
            <p className="text-sm text-muted-foreground">
              Enter a title for your new column.
            </p>
          </div>
          <div className="grid gap-2">
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateColumn()}
              placeholder="e.g. 'Backlog'"
              className="bg-slate-800 border-slate-700"
              disabled={isSubmitting}
            />
            <Button onClick={handleCreateColumn} disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Column'}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
