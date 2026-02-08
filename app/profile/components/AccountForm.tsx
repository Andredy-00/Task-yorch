'use client'

import { useState, useEffect } from 'react'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CircleUserRound, Loader2, LoaderCircle, Pencil } from "lucide-react"
import toast from 'react-hot-toast'

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Image from 'next/image'
import PhoneInput from '@/components/PhoneInput'


const profileSchema = z.object({
    name: z.string().min(2, {
        message: "El nombre debe tener al menos 2 caracteres.",
    }),
    email: z.email().optional(),
    avatar_url: z.string().nullable().optional(),
    phone: z.string().optional().nullable(),
    country_code: z.string().optional().nullable(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function AccountForm({
    user,
    onSuccess
}: {
    user: any;
    onSuccess?: () => void
}) {

    const [loading, setLoading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || null)
    const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            avatar_url: user?.avatar_url || null,
            phone: user?.phone || '',
            country_code: user?.country_code || 'VE',
        },
    })

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name || '',
                email: user.email || '',
                avatar_url: user.avatar_url || null,
                phone: user.phone || '',
                country_code: user.country_code || 'VE',
            })
            setAvatarUrl(user.avatar_url || null)
        }
    }, [user, form])

    async function onSubmit(values: ProfileFormValues) {
        try {
            setLoading(true)

            console.log(values);

            if (onSuccess) onSuccess()
        } catch (error) {
            toast.error('Hubo un error al actualizar el perfil.')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // ======== Choose a profile image ========
    const chooseImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]

        if (!file) return

        // Validar tipo de archivo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!validTypes.includes(file.type)) {
            toast.error('Formato no válido. Use JPG, PNG o WebP.')
            return
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen es muy grande. Máximo 5MB.')
            return
        }
        setIsLoadingImage(true)

        try {



        } catch (error: any) {
            console.error('Error al actualizar avatar:', error)
            toast.error(error.message || 'Error al actualizar el avatar', { duration: 2500 })
        } finally {
            setIsLoadingImage(false)
            // Limpiar el input file
            event.target.value = ''
        }
    }



    return (
        <div className="space-y-6">

            {isLoadingImage ? (
                <div className="flex justify-center items-center">
                    <LoaderCircle className="w-14 h-14 animate-spin mb-3" />
                </div>
            ) : (
                <>

                    <div className="relative w-26 h-26 mx-auto mb-3">
                        {avatarUrl ? (

                            <Image
                                className="object-cover w-full h-full rounded-full"
                                src={avatarUrl}
                                width={1000}
                                height={1000}
                                alt="user-img"
                                onError={() => setAvatarUrl('')} // Si hay error, mostrar icono por defecto
                            />
                        ) : (
                            <CircleUserRound className="w-full h-full" />
                        )}

                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                            <div>
                                <input
                                    id="files"
                                    type="file"
                                    className="hidden"
                                    accept="image/png, image/webp, image/jpeg, image/jpg"
                                    onChange={chooseImage}
                                    disabled={isLoadingImage}
                                />
                                <label htmlFor="files">
                                    <div className="w-[40px] h-[28px] cursor-pointer rounded-full text-slate-950 bg-white flex justify-center items-center hover:bg-gray-100 transition-colors">
                                        {isLoadingImage ? (
                                            <LoaderCircle className="w-[18px] h-[18px] animate-spin" />
                                        ) : (
                                            <Pencil className="w-[18px] h-[18px]" />
                                        )}
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </>
            )}



            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre Completo</FormLabel>
                                <FormControl>
                                    <Input placeholder="Tu nombre" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número de Teléfono</FormLabel>
                                <FormControl>
                                    <PhoneInput
                                        defaultCountryCode={form.getValues('country_code') || 'VE'}
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        onCountryChange={(country) => {
                                            form.setValue('country_code', country.code)
                                        }}
                                        placeholder="Número de teléfono"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full my-4" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? 'Guardando...' : 'Actualizar Perfil'}
                    </Button>
                </form>
            </Form>
        </div>
    )
}