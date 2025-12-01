import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Nome deve ter pelo menos 2 caracteres.' }),
  email: z.string().email({ message: 'Email inválido.' }),
  phone: z.string().min(10, { message: 'Telefone inválido.' }),
})

interface SimulationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  savingsValue: number
}

export const SimulationModal = ({
  open,
  onOpenChange,
  savingsValue,
}: SimulationModalProps) => {
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    console.log(values)
    setIsSuccess(true)
    toast.success('Solicitação enviada com sucesso!')
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setIsSuccess(false)
      form.reset()
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {isSuccess ? 'Sucesso!' : 'Garanta sua economia'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isSuccess
              ? 'Um de nossos especialistas entrará em contato em breve.'
              : `Preencha seus dados para garantir a economia anual estimada de R$ ${savingsValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-4 animate-fade-in">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <p className="text-center text-muted-foreground">
              Verifique seu email para mais detalhes sobre os próximos passos.
            </p>
            <Button onClick={handleClose} className="w-full mt-4">
              Fechar
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="joao@exemplo.com" {...field} />
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
                    <FormLabel>WhatsApp / Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full text-lg font-semibold h-12 mt-2"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Quero economizar agora'
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Seus dados estão seguros. Não enviamos spam.
              </p>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
