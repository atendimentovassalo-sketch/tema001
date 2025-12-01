import { Button } from '@/components/ui/button'
import { Simulator } from '@/components/Simulator'
import { AnimatedSection } from '@/components/AnimatedSection'
import {
  CheckCircle2,
  Leaf,
  Wallet,
  Zap,
  ShieldCheck,
  ArrowDown,
} from 'lucide-react'

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-green-50 to-white pt-16">
        <div className="container px-4 md:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80 animate-fade-in">
              Nova tecnologia disponível
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 animate-fade-in-up">
              Reduza sua conta de luz em até{' '}
              <span className="text-primary">20%</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-[600px] mx-auto lg:mx-0 animate-fade-in-up">
              Sem obras, sem custo de adesão e sem fidelidade. Apenas energia
              mais barata e limpa chegando na sua casa ou empresa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up">
              <Button
                size="lg"
                className="h-14 text-lg px-8 font-bold shadow-lg"
                onClick={() =>
                  document
                    .getElementById('simulador')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                Simular minha economia
              </Button>
              <Button size="lg" variant="outline" className="h-14 text-lg px-8">
                Como funciona?
              </Button>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground animate-fade-in-up">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Sem fidelidade</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Zero investimento</span>
              </div>
            </div>
          </div>
          <div className="relative lg:block animate-fade-in">
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl -z-10" />
            <img
              src="https://img.usecurling.com/p/600/600?q=solar%20energy%20happy%20family&dpr=2"
              alt="Família economizando energia"
              className="rounded-2xl shadow-2xl object-cover w-full h-auto border-8 border-white"
            />
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown className="text-muted-foreground" />
        </div>
      </section>

      {/* Features Section */}
      <section id="como-funciona" className="py-24 bg-white">
        <div className="container px-4 md:px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Por que escolher a EcoLuz?
            </h2>
            <p className="mx-auto mt-4 max-w-[700px] text-gray-500 md:text-xl">
              Nós conectamos você a usinas de energia renovável. A energia
              gerada é injetada na rede e chega até você como créditos de
              desconto.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <AnimatedSection
              delay={100}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="h-16 w-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                <Wallet className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Economia Garantida</h3>
              <p className="text-muted-foreground">
                Desconto todo mês na sua conta de luz, garantido em contrato,
                sem você precisar fazer nada.
              </p>
            </AnimatedSection>

            <AnimatedSection
              delay={200}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                <Leaf className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Energia 100% Limpa</h3>
              <p className="text-muted-foreground">
                Toda a energia compensada vem de fontes renováveis como solar,
                eólica ou biomassa.
              </p>
            </AnimatedSection>

            <AnimatedSection
              delay={300}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="h-16 w-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Sem Obras</h3>
              <p className="text-muted-foreground">
                Não precisa instalar painéis solares nem mudar nada na sua casa.
                Tudo é feito digitalmente.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Simulator Section */}
      <section id="simulador" className="py-24 bg-slate-50">
        <div className="container px-4 md:px-6">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Quanto você pode economizar?
            </h2>
            <p className="mx-auto mt-4 max-w-[600px] text-gray-500 md:text-xl">
              Use nosso simulador e veja o impacto no seu bolso ao longo de um
              ano.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <Simulator />
          </AnimatedSection>
        </div>
      </section>

      {/* How it works Steps */}
      <section className="py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <img
                src="https://img.usecurling.com/p/600/800?q=wind%20turbine%20field&dpr=2"
                alt="Parque Eólico"
                className="rounded-2xl shadow-2xl object-cover"
              />
            </AnimatedSection>
            <div className="space-y-10">
              <AnimatedSection>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  É simples, rápido e 100% digital
                </h2>
              </AnimatedSection>

              <div className="space-y-8">
                {[
                  {
                    step: '01',
                    title: 'Faça seu cadastro',
                    desc: 'Preencha seus dados e envie uma foto da sua conta de luz atual.',
                  },
                  {
                    step: '02',
                    title: 'Nós fazemos a conexão',
                    desc: 'Conectamos sua unidade consumidora a uma de nossas usinas de energia renovável.',
                  },
                  {
                    step: '03',
                    title: 'Comece a economizar',
                    desc: 'Você recebe a conta com o desconto aplicado e paga menos todo mês.',
                  },
                ].map((item, index) => (
                  <AnimatedSection
                    key={index}
                    delay={index * 100}
                    className="flex gap-6"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-24 bg-primary/5">
        <div className="container px-4 md:px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Quem usa, aprova
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Carlos Mendes',
                role: 'Proprietário de Padaria',
                text: 'Minha conta reduziu cerca de R$ 400 por mês. No final do ano, isso paga o 13º de um funcionário. Recomendo demais!',
                img: 'https://img.usecurling.com/ppl/medium?gender=male&seed=1',
              },
              {
                name: 'Ana Paula Souza',
                role: 'Residencial',
                text: 'Achei que fosse complicado, mas foi super rápido. O atendimento é excelente e a economia é real. Já estou usando há 6 meses.',
                img: 'https://img.usecurling.com/ppl/medium?gender=female&seed=2',
              },
              {
                name: 'Roberto Ferreira',
                role: 'Síndico',
                text: 'Implantamos no condomínio e a economia nas áreas comuns foi surpreendente. Os moradores adoraram a iniciativa sustentável.',
                img: 'https://img.usecurling.com/ppl/medium?gender=male&seed=3',
              },
            ].map((testimonial, i) => (
              <AnimatedSection
                key={i}
                delay={i * 150}
                className="bg-white p-8 rounded-2xl shadow-sm border"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={testimonial.img}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-slate-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Zap
                      key={s}
                      className="w-4 h-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-slate-600 italic">"{testimonial.text}"</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
              Pronto para começar a economizar?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-10 max-w-[600px] mx-auto">
              Junte-se a milhares de brasileiros que já estão pagando menos na
              conta de luz e ajudando o planeta.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="h-16 text-lg px-10 font-bold shadow-xl"
              onClick={() =>
                document
                  .getElementById('simulador')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Quero meu desconto agora
              <ArrowRight className="ml-2" />
            </Button>
            <div className="mt-8 flex items-center justify-center gap-2 text-primary-foreground/70 text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Garantia de economia ou seu dinheiro de volta</span>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
