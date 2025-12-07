// @file: src/components/settings/profile-form.tsx
'use client'

import { useState, useTransition, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { type User } from '@prisma/client'

import { UpdateProfileSchema } from '@/lib/schemas'
import { updateProfile } from '@/app/actions'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Loader2 } from 'lucide-react'

type ProfileFormValues = z.infer<typeof UpdateProfileSchema>

interface ProfileFormProps {
  initialUser: User
}

export function ProfileForm({ initialUser }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: initialUser.name || '',
      avatar: undefined,
    },
  })

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const MAX_FILE_SIZE = 1024 * 1024; // 1MB

      if (file.size > MAX_FILE_SIZE) {
        toast.error("Avatar image must be less than 1MB");
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Reset file input
        }
        setAvatarPreview(null); // Clear any previous preview
        form.resetField('avatar'); // Clear form value for avatar
        return;
      }

      form.setValue('avatar', file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = (values: ProfileFormValues) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('name', values.name)
      // Only append avatar if it's a new file and not just the default undefined
      if (values.avatar instanceof File && values.avatar.size > 0) {
        formData.append('avatar', values.avatar)
      }

      const response = await updateProfile(formData)

      if (response.status === 'success') {
        toast.success(response.data)
        setAvatarPreview(null) // Reset preview after successful upload
        if (fileInputRef.current) {
          fileInputRef.current.value = '' // Clear file input
        }
        // Force re-fetch user data to update avatar in sidebar
        // No explicit refresh needed here, revalidatePath in action handles it
      } else {
        toast.error(response.message)
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center space-x-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarPreview || initialUser.avatarUrl || ''} />
            <AvatarFallback>{initialUser.name?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
             <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleAvatarChange}
                accept="image/png, image/jpeg, image/gif"
             />
             <Button type="button" onClick={() => fileInputRef.current?.click()}>
                Change Avatar
             </Button>
             <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 1MB.</p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={initialUser.email} disabled />
            <p className="text-sm text-muted-foreground">
                Your email address cannot be changed.
            </p>
        </div>


        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </Form>
  )
}
