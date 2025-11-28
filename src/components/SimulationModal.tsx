import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.',
  }),
  email: z.string().email({
    message: 'Por favor, insira um e-mail válido.',
  }),
  phone: z.string().min(10, {
    message: 'Por favor, insira um telefone válido com DDD.',
  }),
  billValue: z.coerce.number().min(150, {
    message: 'O valor mínimo da conta deve ser R$ 150,00.',
  }),
  distributor: z.string().min(1, {
    message: 'Selecione sua distribuidora.',
  }),
  terms: z.boolean().refine((val) => val === true, {
    message: 'Você deve concordar com os termos.',
  }),
})

interface SimulationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialBillValue?: number
}

export function SimulationModal({
  open,
  onOpenChange,
  initialBillValue,
}: SimulationModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      billValue: 150,
      distributor: '',
      terms: false,
    },
  })

  // Update form value when initialBillValue changes
  useEffect(() => {
    if (initialBillValue) {
      form.setValue('billValue', initialBillValue)
    }
  }, [initialBillValue, form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      console.log(values)
      setIsLoading(false)
      onOpenChange(false)
      toast({
        title: 'Simulação enviada com sucesso!',
        description:
          'Entraremos em contato em breve com sua proposta de economia.',
        duration: 5000,
      })
      form.reset()
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary font-heading">
            Simule seu Desconto Agora!
          </DialogTitle>
          <DialogDescription className="font-body">
            Preencha os dados abaixo para descobrir quanto você pode economizar.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-heading">Nome Completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Seu nome"
                      {...field}
                      disabled={isLoading}
                      className="font-body"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-heading">E-mail</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="seu@email.com"
                        type="email"
                        {...field}
                        disabled={isLoading}
                        className="font-body"
                      />
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
                    <FormLabel className="font-heading">
                      Telefone (com DDD)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(11) 99999-9999"
                        {...field}
                        disabled={isLoading}
                        className="font-body"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="billValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-heading">
                    Valor médio da conta (R$)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={150}
                      step="0.01"
                      {...field}
                      disabled={isLoading}
                      className="font-body"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="distributor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-heading">
                    Sua distribuidora
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="font-body">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="enel_sp">Enel SP</SelectItem>
                      <SelectItem value="cpfl">CPFL</SelectItem>
                      <SelectItem value="edp">EDP</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="cemig">Cemig</SelectItem>
                      <SelectItem value="copel">Copel</SelectItem>
                      <SelectItem value="neoenergia">Neoenergia</SelectItem>
                      <SelectItem value="equatorial">Equatorial</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-body">
                      Concordo com os Termos de Uso e Política de Privacidade
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            {form.formState.errors.terms && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.terms.message}
              </p>
            )}

            <Button
              type="submit"
              className="w-full text-lg font-bold py-6 bg-cta hover:bg-cta/90 text-cta-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'VER MEU DESCONTO'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
