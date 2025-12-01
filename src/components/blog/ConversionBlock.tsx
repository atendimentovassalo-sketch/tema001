import { Button } from '@/components/ui/button'
import { ArrowRight, Zap } from 'lucide-react'

interface ConversionBlockProps {
  type: 'simulator' | 'licensee'
}

export function ConversionBlock({ type }: ConversionBlockProps) {
  const isSimulator = type === 'simulator'

  return (
    <div
      className={`
        w-full h-full min-h-[400px] rounded-xl p-8 flex flex-col justify-center items-center text-center
        ${isSimulator ? 'bg-primary' : 'bg-gray-900'}
        text-white shadow-lg relative overflow-hidden group
    `}
    >
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <img
          src="https://img.usecurling.com/i?q=energy%20pattern&color=white"
          alt="pattern"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 max-w-xs mx-auto">
        <div className="mb-6 bg-white/20 p-4 rounded-full inline-block backdrop-blur-sm">
          <Zap className="h-8 w-8 text-white" />
        </div>

        <h3 className="text-2xl font-bold mb-4 font-heading">
          {isSimulator
            ? 'Cansado de pagar caro na conta de luz?'
            : 'Busca uma nova fonte de renda?'}
        </h3>

        <p className="text-white/80 mb-8 text-lg font-body">
          {isSimulator
            ? 'Descubra agora quanto você pode economizar sem gastar nada.'
            : 'Torne-se um licenciado iGreen e lucre com o mercado de energia.'}
        </p>

        <Button
          variant={isSimulator ? 'secondary' : 'default'}
          size="lg"
          className={`
            w-full font-bold text-lg py-6 shadow-md
            ${
              isSimulator
                ? 'bg-white text-primary hover:bg-gray-100'
                : 'bg-primary text-white hover:bg-primary/90'
            }
          `}
        >
          {isSimulator ? 'SIMULAR AGORA' : 'QUERO SER LICENCIADO'}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
