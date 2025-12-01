import { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SimulationModal } from '@/components/SimulationModal'
import { ArrowRight, Calculator, PiggyBank } from 'lucide-react'

export const Simulator = () => {
  const [billValue, setBillValue] = useState([300])
  const [savings, setSavings] = useState(0)
  const [annualSavings, setAnnualSavings] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Average savings calculation (approx 15-20%)
  useEffect(() => {
    const val = billValue[0]
    const monthly = val * 0.18 // 18% savings
    setSavings(monthly)
    setAnnualSavings(monthly * 12)
  }, [billValue])

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="border-2 border-primary/10 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2 pb-8">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-800">
            Simule sua Economia
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            Descubra o quanto você pode deixar de pagar para a distribuidora.
          </p>
        </CardHeader>
        <CardContent className="space-y-10">
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Valor médio da sua conta de luz
              </label>
              <span className="text-3xl font-bold text-primary">
                R$ {billValue[0].toLocaleString('pt-BR')}
              </span>
            </div>
            <Slider
              value={billValue}
              onValueChange={setBillValue}
              max={2000}
              min={100}
              step={50}
              className="py-4 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>R$ 100</span>
              <span>R$ 1.000</span>
              <span>R$ 2.000+</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-xl p-6 space-y-2 border border-blue-100">
              <p className="text-sm font-medium text-blue-600">
                Economia Mensal Estimada
              </p>
              <p className="text-4xl font-extrabold text-blue-700">
                R${' '}
                {savings.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-blue-400">
                *Valor aproximado baseado na média de 18%
              </p>
            </div>
            <div className="bg-primary/10 rounded-xl p-6 space-y-2 border border-primary/20">
              <div className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium text-primary">
                  Economia Anual
                </p>
              </div>
              <p className="text-4xl font-extrabold text-primary">
                R${' '}
                {annualSavings.toLocaleString('pt-BR', {
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="text-xs text-green-600/70">
                Dinheiro extra no seu bolso todo ano
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={() => setIsModalOpen(true)}
              size="lg"
              className="w-full text-lg font-bold h-14 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              Quero garantir essa economia
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-4">
              Simulação gratuita e sem compromisso.
            </p>
          </div>
        </CardContent>
      </Card>

      <SimulationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        savingsValue={annualSavings}
      />
    </div>
  )
}
