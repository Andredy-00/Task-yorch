'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { Loader2 } from 'lucide-react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileInput } from '@/components/FileInput';
import { Task, TaskStatus, TaskPriority } from '@/interfaces/task';
import { createTask } from '@/actions/tasks/create-task';
import { updateTask } from '@/actions/tasks/update-task';
import { uploadTaskImage } from '@/actions/tasks/upload-image';
import { toast } from 'sonner';

interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    onSuccess: () => void;
}

const taskSchema = z.object({
    title: z.string().min(1, 'El título es requerido'),
    description: z.string().optional(),
    status: z.enum(['todo', 'in-progress', 'review', 'done'] as const),
    priority: z.enum(['low', 'medium', 'high'] as const),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function TaskForm({ isOpen, onClose, task, onSuccess }: TaskFormProps) {
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [removeImage, setRemoveImage] = useState(false);

    const form = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema) as any,
        defaultValues: {
            title: '',
            description: '',
            status: 'todo',
            priority: 'medium',
        },
    });

    useEffect(() => {
        if (task) {
            form.reset({
                title: task.title,
                description: task.description || '',
                status: task.status,
                priority: task.priority,
            });
            setSelectedFile(null);
            setRemoveImage(false);
        } else {
            form.reset({
                title: '',
                description: '',
                status: 'todo',
                priority: 'medium',
            });
            setSelectedFile(null);
            setRemoveImage(false);
        }
    }, [task, form, isOpen]);

    const onSubmit = async (data: TaskFormValues) => {
        setLoading(true);

        try {
            let imageUrl = task?.image || null;

            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                imageUrl = await uploadTaskImage(formData);
            } else if (removeImage) {
                imageUrl = null;
            }

            const taskData: Partial<Task> = {
                title: data.title,
                description: data.description || null,
                status: data.status as TaskStatus,
                priority: data.priority as TaskPriority,
                image: imageUrl
            };

            if (task) {
                await updateTask(task.id, taskData);
                toast.success('Tarea actualizada correctamente');
            } else {
                await createTask(taskData);
                toast.success('Tarea creada correctamente');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error saving task:', error);
            toast.error('Error al guardar la tarea: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="lg:w-xl md:w-full w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{task ? 'Editar Tarea' : 'Nueva Tarea'}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Título de la tarea" disabled={loading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Describe lo que hay que hacer..." rows={3} disabled={loading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger disabled={loading}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="todo">Pendiente</SelectItem>
                                                <SelectItem value="in-progress">En curso</SelectItem>
                                                <SelectItem value="review">En revisión</SelectItem>
                                                <SelectItem value="done">Completado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prioridad</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger disabled={loading}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="low">Baja</SelectItem>
                                                <SelectItem value="medium">Media</SelectItem>
                                                <SelectItem value="high">Alta</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <FileInput
                                accept="image/jpeg, image/png, image/gif, image/webp"
                                multiple={false}
                                onFilesSelected={(files) => {
                                    if (files.length > 0) {
                                        setSelectedFile(files[0] as File);
                                        setRemoveImage(false);
                                    } else {
                                        setSelectedFile(null);
                                        if (task?.image) setRemoveImage(true);
                                    }
                                }}
                                initialImageUrl={task?.image || undefined}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {task ? 'Actualizar' : 'Crear'}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
