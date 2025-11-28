import { useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  ShoppingCart,
  PiggyBank,
  ShieldCheck,
  Lightbulb,
  Wrench,
  Phone,
  FileText,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { SimulationModal } from '@/components/SimulationModal'
import { Simulator } from '@/components/Simulator'
import { AnimatedSection } from '@/components/AnimatedSection'
import { cn } from '@/lib/utils'

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [simulatedBillValue, setSimulatedBillValue] = useState<
    number | undefined
  >(undefined)

  const openModal = (billValue?: number) => {
    if (billValue) {
      setSimulatedBillValue(billValue)
    }
    setIsModalOpen(true)
  }

  return (
    <div className="w-full overflow-x-hidden bg-white">
      <SimulationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialBillValue={simulatedBillValue}
      />

      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-4 overflow-hidden bg-white">
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-20">
          <img
            src="https://img.usecurling.com/p/1920/1080?q=brazilian%20family%20dinner&color=white"
            alt="Família brasileira jantando"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto max-w-5xl text-center">
          <AnimatedSection>
            <div className="inline-block bg-green-50 text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-6 tracking-wide uppercase border border-primary/20">
              Para contas de luz acima de R$ 150,00
            </div>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6 leading-tight tracking-tight font-heading">
              Corte até <span className="text-primary">20%</span> da sua conta
              de luz todos os meses.
              <span className="block text-2xl md:text-4xl mt-4 font-bold text-gray-600">
                Sem instalar painéis, sem obras e sem fidelidade.
              </span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <p className="text-lg md:text-xl text-foreground/80 mb-10 max-w-3xl mx-auto leading-relaxed font-body">
              Pare de pagar tarifas abusivas. Receba energia limpa direto das
              usinas da COMERC (Grupo Vibra, dona dos Postos BR). Ativamos seu
              desconto remotamente e a rede de distribuição continua a mesma.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={300}>
            <div className="flex flex-col items-center gap-4">
              <Button
                size="lg"
                className="w-full md:w-auto text-lg px-8 py-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-cta hover:bg-cta/90 text-cta-foreground font-bold"
                onClick={() => openModal()}
              >
                SIMULAR MEU DESCONTO AGORA
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <span className="text-sm text-gray-500 font-medium">
                (100% Gratuito • Sem Fidelidade • Tudo pelo App)
              </span>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={500} className="mt-16">
            <p className="text-sm text-gray-400 mb-4 uppercase tracking-widest font-semibold">
              Parceiros e Garantia
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 grayscale opacity-80 hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2">
                <img
                  src="https://img.usecurling.com/i?q=energy&color=black"
                  className="h-8 w-auto"
                  alt="Comerc"
                />
                <span className="font-bold text-xl text-gray-600">COMERC</span>
              </div>
              <div className="flex items-center gap-2">
                <img
                  src="https://img.usecurling.com/i?q=gas%20station&color=black"
                  className="h-8 w-auto"
                  alt="Vibra"
                />
                <span className="font-bold text-xl text-gray-600">VIBRA</span>
              </div>
              <div className="flex items-center gap-2">
                <img
                  src="https://img.usecurling.com/i?q=stock%20market&color=black"
                  className="h-8 w-auto"
                  alt="B3"
                />
                <span className="font-bold text-xl text-gray-600">B3</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 2. O Problema */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-4xl px-4">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-foreground font-heading">
              O dinheiro que a distribuidora leva é a qualidade que falta no seu
              carrinho de compras.
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <div className="prose prose-lg mx-auto text-foreground/80 mb-12 text-center font-body">
              <p className="text-base md:text-lg">
                Você já parou para pensar que a conta de luz é uma das poucas
                coisas que você paga sem ter escolha? Todo mês ela chega, cara,
                e você paga porque não tem opção. Isso afeta diretamente o seu
                orçamento familiar.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <Card className="bg-green-50/30 border-primary/20 shadow-sm">
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0 bg-white p-4 rounded-full shadow-sm border border-primary/10">
                    <ShoppingCart className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-4 font-heading">
                      Faça as contas:
                    </h3>
                    <p className="text-base md:text-lg text-foreground/90 mb-4 font-body">
                      Uma economia de 20% na sua conta de luz pode significar R$
                      50, R$ 100 ou até R$ 200 a mais todo mês no seu bolso.
                    </p>
                    <ul className="space-y-3">
                      {[
                        'É o churrasco de fim de semana que você cortou.',
                        'É a marca de iogurte ou a carne de melhor qualidade.',
                        'É o dinheiro que deveria ser seu, não da companhia elétrica.',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                          <span className="text-foreground font-medium text-base md:text-lg">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      {/* 3. A Solução e o Mecanismo */}
      <section className="py-20 bg-[#F9F9F9]">
        <div className="container mx-auto max-w-6xl px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading text-foreground">
                A Lei mudou. Agora a escolha é sua.
              </h2>
              <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto font-body">
                Como conseguimos te dar 20% de desconto sem cobrar nada?
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Produção Barata',
                desc: 'Produzimos energia Solar e Eólica (muito mais barata que a das hidrelétricas) em nossas usinas remotas.',
                icon: Zap,
              },
              {
                title: 'Injeção na Rede',
                desc: 'Injetamos essa energia limpa na rede da sua distribuidora local.',
                icon: Lightbulb,
              },
              {
                title: 'Crédito na Conta',
                desc: 'A distribuidora abate essa energia injetada da sua conta final.',
                icon: PiggyBank,
              },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 150} className="h-full">
                <Card className="h-full hover:shadow-md transition-shadow duration-300 border border-gray-100 shadow-sm bg-white">
                  <CardContent className="p-8 flex flex-col items-center text-center h-full">
                    <div className="bg-primary/10 p-4 rounded-full mb-6">
                      <item.icon className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 font-heading text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-foreground/70 leading-relaxed font-body text-base md:text-lg">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={400}>
            <div className="mt-12 text-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
              <p className="text-lg font-medium text-foreground">
                O resultado? A mesma luz, na mesma tomada, chegando pela mesma
                rede. A única coisa que muda é o valor final que você paga.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 4. Segurança Técnica e Legal */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-5xl px-4">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-heading text-foreground">
              A energia é nossa. A rede de distribuição continua sendo da
              concessionária local.
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimatedSection className="space-y-6">
              <div className="bg-[#F9F9F9] p-6 rounded-xl border border-gray-100">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2 font-heading text-foreground">
                  <ShieldCheck className="text-primary h-6 w-6" />
                  Segurança Garantida
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100">
                      <Lightbulb className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="text-foreground/80 font-body text-base md:text-lg">
                      <strong>Quem entrega a luz?</strong> A sua distribuidora
                      atual.
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100">
                      <Wrench className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="text-foreground/80 font-body text-base md:text-lg">
                      <strong>Quem faz a manutenção?</strong> A sua
                      distribuidora atual.
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100">
                      <Phone className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="text-foreground/80 font-body text-base md:text-lg">
                      <strong>Se faltar luz?</strong> Você liga para a sua
                      distribuidora.
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100">
                      <PiggyBank className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-foreground/80 font-body text-base md:text-lg">
                      <strong>Quem gera a economia?</strong> Nós.
                    </span>
                  </li>
                </ul>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <div className="bg-primary/5 p-8 rounded-xl border border-primary/10">
                <h3 className="text-2xl font-bold text-foreground mb-4 font-heading">
                  Operação 100% regulamentada pela Lei 14.300/2022
                </h3>
                <p className="text-foreground/70 mb-6 leading-relaxed font-body text-base md:text-lg">
                  Nossa modalidade é conhecida como Geração Compartilhada. O
                  Marco Legal da Geração Distribuída (Lei 14.300) garante seu
                  direito de escolher sua fonte de energia e receber os créditos
                  na sua fatura.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="h-4 w-4" />
                  <span>Lei Federal nº 14.300 de 06 de janeiro de 2022</span>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 5. Autoridade */}
      <section className="py-16 bg-[#F9F9F9] border-y border-gray-200">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-bold mb-8 font-heading text-foreground">
              Garantido por quem abastece o Brasil há décadas.
            </h2>
            <p className="text-foreground/70 text-lg mb-12 max-w-2xl mx-auto font-body">
              Somos parte do grupo que você já confia. A solidez da Vibra (dona
              dos Postos BR) e a transparência de uma empresa listada na B3.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 grayscale">
              <div className="flex flex-col items-center gap-3">
                <img
                  src="https://img.usecurling.com/i?q=gas%20station&color=black"
                  className="h-16 w-auto opacity-80"
                  alt="Vibra"
                />
                <span className="font-bold text-xl tracking-wider text-gray-600">
                  VIBRA
                </span>
              </div>
              <div className="w-px h-16 bg-gray-300 hidden md:block"></div>
              <div className="flex flex-col items-center gap-3">
                <img
                  src="https://img.usecurling.com/i?q=stock%20market&color=black"
                  className="h-16 w-auto opacity-80"
                  alt="B3"
                />
                <span className="font-bold text-xl tracking-wider text-gray-600">
                  B3
                </span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 6. Bônus e App */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading text-foreground">
                Não economize apenas na Luz. Economize na Vida.
              </h2>
              <p className="text-xl text-foreground/80 mb-8 font-body">
                Acesso Gratuito ao nosso Clube de Vantagens e App Exclusivo.
              </p>
              <p className="text-foreground/70 mb-8 font-body text-base md:text-lg">
                Mais de 60.000 estabelecimentos e 500.000 produtos. Tudo
                controlado pelo nosso App, onde você acessa suas faturas
                digitais e resgata descontos reais:
              </p>

              <div className="space-y-4 mb-8">
                {[
                  {
                    title: 'Farmácia',
                    desc: 'Até 70% de desconto em genéricos na Droga Raia e grandes redes.',
                    icon: 'pill',
                  },
                  {
                    title: 'Compras Online',
                    desc: 'Descontos exclusivos na Amazon e grandes varejistas.',
                    icon: 'shopping cart',
                  },
                  {
                    title: 'Lazer',
                    desc: 'Pague menos no cinema e em entretenimento.',
                    icon: 'popcorn',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 bg-[#F9F9F9] p-4 rounded-lg shadow-sm border border-gray-100"
                  >
                    <div className="bg-green-50 p-3 rounded-full">
                      <img
                        src={`https://img.usecurling.com/i?q=${item.icon}&color=green&shape=fill`}
                        className="h-6 w-6"
                        alt={item.title}
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground font-heading">
                        {item.title}
                      </h4>
                      <p className="text-sm text-foreground/70 font-body">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sm font-medium text-primary bg-primary/10 inline-block px-4 py-2 rounded-lg">
                Muitas vezes, a economia que você faz em uma única compra de
                farmácia já paga sua conta de luz inteira.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={300} className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full transform scale-90"></div>
                <img
                  src="https://img.usecurling.com/p/800/600?q=full%20shopping%20cart&color=white"
                  alt="Carrinho de compras cheio"
                  className="relative z-10 rounded-xl shadow-2xl border-4 border-white w-full max-w-[400px] object-cover"
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 7. O Comparativo */}
      <section className="py-20 bg-[#F9F9F9]">
        <div className="container mx-auto max-w-5xl px-4">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-heading text-foreground">
              O que muda e o que NÃO muda na sua rotina:
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[30%] font-bold text-foreground text-lg py-6 font-heading">
                      Item
                    </TableHead>
                    <TableHead className="w-[35%] font-bold text-gray-500 text-lg py-6 font-heading">
                      Como é hoje
                    </TableHead>
                    <TableHead className="w-[35%] font-bold text-primary text-lg py-6 bg-green-50/50 font-heading">
                      Como fica com a gente
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      item: 'A qualidade da luz',
                      before: 'Padrão',
                      after: 'Idêntica (mesma voltagem e estabilidade)',
                      highlight: true,
                    },
                    {
                      item: 'Se acabar a luz',
                      before: 'Você liga p/ a Distribuidora',
                      after: 'Você liga p/ a Distribuidora (nada muda)',
                      highlight: true,
                    },
                    {
                      item: 'Manutenção da rede',
                      before: 'Distribuidora',
                      after: 'Distribuidora (nada muda)',
                      highlight: true,
                    },
                    {
                      item: 'Faturas/Papelada',
                      before: 'Correio/Papel',
                      after: '100% Digital via App (Simples e Rápido)',
                      highlight: false,
                    },
                    {
                      item: 'O preço',
                      before: 'Caro e imprevisível',
                      after: 'Até 20% mais barato + Clube de Descontos',
                      highlight: false,
                      boldAfter: true,
                    },
                  ].map((row, i) => (
                    <TableRow
                      key={i}
                      className={cn(
                        'text-base',
                        i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50',
                      )}
                    >
                      <TableCell className="font-medium py-4 text-foreground font-body">
                        {row.item}
                      </TableCell>
                      <TableCell className="text-gray-500 py-4 font-body">
                        <div className="flex items-center gap-2">
                          {row.highlight && (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                          {row.before}
                        </div>
                      </TableCell>
                      <TableCell
                        className={cn(
                          'py-4 bg-green-50/30 font-body',
                          row.boldAfter
                            ? 'font-bold text-primary'
                            : 'text-foreground',
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          {row.after}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {[
                {
                  item: 'A qualidade da luz',
                  before: 'Padrão',
                  after: 'Idêntica (mesma voltagem e estabilidade)',
                },
                {
                  item: 'Se acabar a luz',
                  before: 'Você liga p/ a Distribuidora',
                  after: 'Você liga p/ a Distribuidora (nada muda)',
                },
                {
                  item: 'Manutenção da rede',
                  before: 'Distribuidora',
                  after: 'Distribuidora (nada muda)',
                },
                {
                  item: 'Faturas/Papelada',
                  before: 'Correio/Papel',
                  after: '100% Digital via App',
                },
                {
                  item: 'O preço',
                  before: 'Caro e imprevisível',
                  after: 'Até 20% mais barato',
                  isHighlight: true,
                },
              ].map((card, i) => (
                <Card
                  key={i}
                  className={cn(
                    'border-gray-200 shadow-sm',
                    card.isHighlight ? 'border-primary/30 bg-green-50/30' : '',
                  )}
                >
                  <CardContent className="p-5">
                    <h3 className="font-bold text-lg mb-3 text-foreground font-heading">
                      {card.item}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-gray-500">
                        <XCircle className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                        <span className="text-sm font-body">{card.before}</span>
                      </div>
                      <div className="flex items-start gap-2 text-foreground">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span
                          className={cn(
                            'text-sm font-body',
                            card.isHighlight ? 'font-bold text-primary' : '',
                          )}
                        >
                          {card.after}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 8. O Simulador */}
      <Simulator onRegister={openModal} />

      {/* 9. FAQ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-3xl px-4">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-heading text-foreground">
              Sem letras miúdas. Entenda a cobrança.
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {[
                {
                  q: 'Como vou receber minha fatura?',
                  a: 'Esqueça os papéis perdidos pela casa. Sua fatura chega de forma digital, segura e prática direto no nosso App.',
                },
                {
                  q: 'Vou receber dois boletos ou um só?',
                  a: 'Depende da sua região e distribuidora. Em alguns estados, o boleto já é unificado. Em outros, você recebe dois (o da distribuidora com as taxas obrigatórias e o nosso com a energia consumida). O importante é: Somando tudo, o valor final é garantidamente menor do que você paga hoje.',
                },
                {
                  q: 'Tenho que pagar adesão para entrar no Clube de Vantagens?',
                  a: 'Não. É um benefício gratuito para nossos clientes.',
                },
                {
                  q: 'E se eu não gostar? Tem multa?',
                  a: 'Não. Sem fidelidade. Você cancela quando quiser, sem burocracia.',
                },
              ].map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="bg-[#F9F9F9] border border-gray-200 rounded-lg px-4"
                >
                  <AccordionTrigger className="text-left font-semibold text-lg py-4 hover:no-underline hover:text-primary transition-colors font-heading text-foreground">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-foreground/70 text-base pb-4 font-body">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AnimatedSection>
        </div>
      </section>

      {/* 10. Chamada Final / CTA */}
      <section className="py-24 bg-[#F9F9F9] text-center border-t border-gray-200">
        <div className="container mx-auto max-w-4xl px-4">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-bold mb-8 font-heading text-foreground">
              Troque uma conta cara por um carrinho mais cheio.
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <p className="text-xl text-foreground/70 mb-12 max-w-3xl mx-auto leading-relaxed font-body">
              A Lei 14.300 te dá o direito de pagar menos. A Vibra te dá a
              segurança de que vai funcionar. O App coloca o controle na palma
              da sua mão. Junte-se a milhares de brasileiros que já estão usando
              energia limpa e aproveitando descontos exclusivos. Leva menos de 5
              minutos para se cadastrar.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="flex flex-col items-center gap-4">
              <Button
                size="lg"
                className="w-full md:w-auto text-lg md:text-xl px-10 py-8 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold bg-cta hover:bg-cta/90 text-cta-foreground"
                onClick={() => openModal()}
              >
                QUERO ATIVAR MEU DESCONTO + CLUBE DE VANTAGENS
              </Button>
              <span className="text-sm text-gray-500 font-medium opacity-90">
                (Necessário conta de luz acima de R$ 150 • Simulação Gratuita)
              </span>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}

export default Index
