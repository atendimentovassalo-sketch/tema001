import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Calculator, ShoppingCart, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedSection } from '@/components/AnimatedSection'

const simulatorSchema = z.object({
  cep: z
    .string()
    .min(8, 'O CEP deve ter 8 dígitos')
    .regex(/^\d{5}-?\d{3}$/, 'Formato de CEP inválido (00000-000)'),
  billValue: z.coerce
    .number()
    .min(150, 'O valor mínimo para economia é R$ 150,00'),
})

interface SimulatorProps {
  onRegister: (billValue: number) => void
}

export function Simulator({ onRegister }: SimulatorProps) {
  const [results, setResults] = useState<{
    monthly: number
    annual: number
    carts: number
  } | null>(null)

  const form = useForm<z.infer<typeof simulatorSchema>>({
    resolver: zodResolver(simulatorSchema),
    defaultValues: {
      cep: '',
      billValue: undefined,
    },
  })

  function onSubmit(values: z.infer<typeof simulatorSchema>) {
    const monthly = values.billValue * 0.2
    const annual = monthly * 12
    // Calculation: up to R$500 equals 1 cart, R$501 to R$1000 equals 2 carts, etc.
    // This is effectively Math.ceil(annual / 500)
    const carts = Math.ceil(annual / 500)

    setResults({
      monthly,
      annual,
      carts,
    })
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto max-w-4xl px-4">
        <AnimatedSection>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
              <Calculator className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-heading">
              Pare de imaginar. Veja os números reais.
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto font-body">
              Digite seu CEP e o valor da sua conta para descobrir quanto
              dinheiro volta para o seu bolso.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          {/* Simulator Box with distinct background and shadow */}
          <Card className="border-none shadow-elevation bg-[#F9F9F9] overflow-hidden rounded-2xl">
            <CardContent className="p-6 md:p-10">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-foreground font-heading">
                            Seu CEP:
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="00000-000"
                              className="h-12 text-lg bg-white"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Para verificar a disponibilidade da rede na sua
                            região
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="billValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-foreground font-heading">
                            Valor médio da sua conta (R$):
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ex: 350,00"
                              className="h-12 text-lg bg-white"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Valor mensal aproximado da sua fatura de energia
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-center">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full md:w-auto px-8 py-6 text-lg font-bold shadow-md hover:shadow-lg transition-all bg-cta hover:bg-cta/90 text-white"
                    >
                      CALCULAR MEU DESCONTO AGORA
                    </Button>
                  </div>
                </form>
              </Form>

              {results && (
                <div className="mt-10 pt-10 border-t border-gray-200 animate-fade-in-up">
                  <h3 className="text-2xl font-bold text-center mb-8 text-foreground font-heading">
                    Diagnóstico de Economia:
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 flex flex-col justify-center items-center text-center shadow-sm">
                      <span className="text-gray-500 font-medium mb-2 text-sm uppercase tracking-wide">
                        Economia Mensal Estimada
                      </span>
                      <span className="text-4xl md:text-5xl font-extrabold text-primary font-heading">
                        R$ {results.monthly.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-sm text-gray-500 mt-2 font-body">
                        a mais todo mês
                      </span>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 flex flex-col justify-center items-center text-center shadow-sm">
                      <span className="text-gray-500 font-medium mb-2 text-sm uppercase tracking-wide">
                        Economia em 1 Ano
                      </span>
                      <span className="text-4xl md:text-5xl font-extrabold text-primary font-heading">
                        R$ {results.annual.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-sm text-gray-500 mt-2 font-body">
                        acumulados
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-shrink-0 flex flex-wrap justify-center gap-2 max-w-[200px]">
                        {Array.from({
                          length: Math.min(results.carts, 10),
                        }).map((_, i) => (
                          <ShoppingCart
                            key={i}
                            className="h-6 w-6 text-primary fill-primary/20"
                          />
                        ))}
                        {results.carts > 10 && (
                          <span className="text-xs font-bold text-primary flex items-center">
                            +{results.carts - 10}
                          </span>
                        )}
                      </div>
                      <p className="text-lg text-foreground/80 text-center md:text-left font-body">
                        Com{' '}
                        <span className="font-bold text-foreground">
                          R$ {results.annual.toFixed(2).replace('.', ',')}
                        </span>{' '}
                        livres no ano, você paga quase{' '}
                        <span className="font-bold text-primary text-xl">
                          {results.carts}
                        </span>{' '}
                        carrinhos de supermercado a mais. Sem investir um
                        centavo.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={() => onRegister(form.getValues('billValue'))}
                      size="lg"
                      className="w-full md:w-auto px-10 py-8 text-xl font-bold rounded-full shadow-xl hover:scale-105 transition-all bg-cta hover:bg-cta/90 text-white animate-pulse"
                    >
                      QUERO GARANTIR ESSES R${' '}
                      {results.annual.toFixed(2).replace('.', ',')} AGORA
                      <ArrowRight className="ml-2 h-6 w-6" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </section>
  )
}
