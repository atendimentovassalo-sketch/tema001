import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setIsSuccess(true)
    toast.success('Inscrição realizada com sucesso!')
    setEmail('')
  }

  return (
    <section className="w-full bg-primary/5 border-y border-primary/10 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-primary p-8 md:p-12 text-primary-foreground flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/2 -translate-y-1/2">
              <Mail className="w-64 h-64" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold font-heading mb-4">
                Fique por dentro da revolução energética
              </h3>
              <p className="text-primary-foreground/90 font-body text-lg">
                Receba dicas de economia, novidades sobre energia solar e
                ofertas exclusivas diretamente no seu e-mail.
              </p>
            </div>
          </div>

          <div className="md:w-1/2 p-8 md:p-12 flex items-center">
            {isSuccess ? (
              <div className="w-full text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-800">
                  Obrigado por se inscrever!
                </h4>
                <p className="text-muted-foreground">
                  Em breve você receberá nossas melhores dicas.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsSuccess(false)}
                  className="mt-4"
                >
                  Cadastrar outro e-mail
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="newsletter-email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Seu melhor e-mail
                  </label>
                  <Input
                    id="newsletter-email"
                    type="email"
                    placeholder="joao@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-slate-50 border-slate-200"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-base font-bold shadow-md bg-cta hover:bg-cta/90 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Inscrevendo...
                    </>
                  ) : (
                    'QUERO RECEBER NOVIDADES'
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground pt-2">
                  Respeitamos sua privacidade. Cancele quando quiser.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
