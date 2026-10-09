import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'https://eletrorecicla-backend.onrender.com/api/v1'

const profiles = [
  { id: 'citizen', icon: '♧', title: 'Sou cidadão', text: 'Quero descartar meus eletrônicos com responsabilidade.', action: 'signup' },
  { id: 'company', icon: '▦', title: 'Sou uma empresa', text: 'Quero fazer parte de uma rede de reciclagem sustentável.', action: 'company' },
  { id: 'point', icon: '⌖', title: 'Sou ponto de coleta', text: 'Quero receber resíduos eletrônicos na minha região.', action: 'point' },
]

const inputClass = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10'
const labelClass = 'block text-sm font-medium text-slate-700'

async function api(path, options = {}, auth = true) {
  const token = localStorage.getItem('er-token') || localStorage.getItem('token') || ''
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const body = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) throw new Error(body?.erro || body?.message || (response.status === 401 ? 'E-mail ou senha inválidos.' : `Não foi possível concluir a solicitação (${response.status}).`))
  return body
}

function Brand({ light = false }) {
  return <a href="#/" className="flex shrink-0 items-center gap-3" onClick={e => { e.preventDefault(); window.dispatchEvent(new CustomEvent('er-navigate', { detail: 'home' })) }}>
    <span className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl font-bold ${light ? 'bg-white/15 text-white' : 'bg-emerald-800 text-white'}`}>↻</span>
    <span><span className={`block text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-emerald-950'}`}>EletroRecicla</span><span className={`block text-[11px] ${light ? 'text-emerald-100' : 'text-slate-500'}`}>Um futuro mais sustentável</span></span>
  </a>
}

function Field({ label, name, type = 'text', required = true, placeholder, autoComplete, ...props }) {
  return <label className={labelClass}>{label}<input className={inputClass} name={name} type={type} required={required} placeholder={placeholder || label} autoComplete={autoComplete} {...props} /></label>
}

function App() {
  const [page, setPage] = useState(() => window.location.hash.replace('#/', '') || 'home')
  const [profile, setProfile] = useState('citizen')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [noticeType, setNoticeType] = useState('success')
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('er-user') || 'null') } catch { return null } })
  const [collections, setCollections] = useState([])
  const [points, setPoints] = useState([])
  const [search, setSearch] = useState('')

  function go(next) {
    setPage(next)
    window.location.hash = '/' + next
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setNotice('')
  }

  function notify(message, type = 'success') {
    setNotice(message)
    setNoticeType(type)
  }

  useEffect(() => {
    const handler = e => go(e.detail)
    window.addEventListener('er-navigate', handler)
    const hashHandler = () => setPage(window.location.hash.replace('#/', '') || 'home')
    window.addEventListener('hashchange', hashHandler)
    return () => { window.removeEventListener('er-navigate', handler); window.removeEventListener('hashchange', hashHandler) }
  }, [])

  useEffect(() => {
    if (!user) return
    if (page === 'dashboard' || page === 'history') {
      api('/coletas/me').then(data => setCollections(Array.isArray(data) ? data : data?.content || [])).catch(() => setCollections([]))
    }
    if (page === 'points') {
      api('/empresas/aprovadas', {}, false).then(data => setPoints(Array.isArray(data) ? data : [])).catch(() => setPoints([]))
    }
  }, [page, user])

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    const values = Object.fromEntries(new FormData(e.currentTarget))
    try {
      if (page === 'login') {
        const result = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email: values.email, senha: values.senha }) }, false)
        localStorage.setItem('er-token', result.token)
        localStorage.setItem('token', result.token)
        const me = await api('/usuarios/me')
        setUser(me)
        localStorage.setItem('er-user', JSON.stringify(me))
        notify('Login realizado. Bem-vindo ao EletroRecicla!')
        go('dashboard')
      } else if (page === 'signup') {
        if (values.senha !== values.confirmacao) throw new Error('As senhas não coincidem.')
        const created = await api('/usuarios', { method: 'POST', body: JSON.stringify({ nome: values.nome, email: values.email, senha: values.senha, telefone: values.telefone, cpf: values.cpf }) }, false)
        notify(`Cadastro enviado com sucesso${created?.nome ? ', ' + created.nome : ''}! Agora você já pode entrar.`)
        go('login')
      } else if (page === 'company' || page === 'point') {
        await api('/empresas', { method: 'POST', body: JSON.stringify({ razaoSocial: values.razaoSocial, cnpj: values.cnpj, email: values.email, telefone: values.telefone, endereco: values.endereco, latitude: values.latitude ? Number(values.latitude) : null, longitude: values.longitude ? Number(values.longitude) : null }) }, false)
        notify('Cadastro enviado para análise. Você receberá uma atualização após a avaliação.')
        go('home')
      } else if (page === 'recovery') {
        notify('A recuperação de senha ainda não está disponível no serviço. Entre em contato com o administrador.', 'error')
      }
    } catch (error) {
      notify(error.message || 'Ocorreu um erro inesperado.', 'error')
    } finally {
      setBusy(false)
    }
  }

  function logout() {
    localStorage.removeItem('er-token')
    localStorage.removeItem('token')
    localStorage.removeItem('er-user')
    setUser(null)
    go('home')
  }

  const formTitles = {
    signup: ['Crie sua conta', 'Comece a transformar o descarte em uma atitude consciente.'],
    company: ['Cadastre sua empresa', 'Conecte seu negócio a um futuro mais sustentável.'],
    point: ['Cadastre um ponto de coleta', 'Ajude sua comunidade a descartar eletrônicos corretamente.'],
    login: ['Que bom ter você de volta!', 'Entre na sua conta para continuar.'],
    recovery: ['Recuperar acesso', 'Informe seu e-mail cadastrado para receber orientações.'],
  }

  const navLink = (text, target) => <button key={target} onClick={() => go(target)} className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition ${page === target ? 'bg-emerald-50 text-emerald-900' : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-900'}`}>{text}</button>

  return <div className="min-h-screen bg-[#f7faf8] text-slate-800">
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 lg:px-8">
        <Brand />
        <nav className="hidden items-center gap-1 md:flex">
          {navLink('Início', 'home')}
          {navLink('Como funciona', 'how')}
          {navLink('Pontos de coleta', 'points')}
        </nav>
        <div className="flex items-center gap-2">
          {user ? <><button onClick={() => go('dashboard')} className="hidden rounded-full px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-50 sm:block">Meu painel</button><button onClick={logout} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">Sair</button></> : <><button onClick={() => go('login')} className="rounded-full px-3 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-50">Entrar</button><button onClick={() => go('register')} className="rounded-full bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900">Começar agora</button></>}
        </div>
      </div>
    </header>

    {notice && <div role="status" className={`mx-auto mt-4 flex max-w-7xl items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm ${noticeType === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Fechar aviso">×</button></div>}

    {page === 'home' && <main>
      <section className="relative isolate overflow-hidden bg-emerald-950">
        <div className="absolute -right-20 -top-28 -z-10 h-96 w-96 rounded-full bg-emerald-700/40 blur-3xl" />
        <div className="absolute -bottom-48 left-1/3 -z-10 h-96 w-96 rounded-full bg-lime-500/10 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700 bg-emerald-900/70 px-3.5 py-2 text-xs font-semibold tracking-wide text-emerald-100"><span className="h-2 w-2 rounded-full bg-lime-300" /> SUSTENTABILIDADE EM AÇÃO</span>
            <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">Seu eletrônico antigo pode ter <span className="text-lime-300">um novo destino.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-emerald-100/85 sm:text-lg">Encontre pontos de coleta, descarte com responsabilidade e faça parte de uma comunidade que cuida do planeta.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => go('points')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime-300 px-6 py-3.5 font-bold text-emerald-950 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-lime-200">Encontrar ponto de coleta <span>↗</span></button>
              <button onClick={() => go('how')} className="rounded-xl border border-emerald-700 px-6 py-3.5 font-semibold text-white transition hover:bg-white/5">Como funciona</button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-emerald-100/80"><span>✓ Descarte consciente</span><span>✓ Comunidade conectada</span><span>✓ Mais circularidade</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-4 rounded-[2rem] bg-emerald-700/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-800 to-emerald-900 p-7 shadow-2xl sm:p-9">
              <div className="flex items-center justify-between"><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">CICLO CONSCIENTE</span><span className="text-2xl text-lime-300">↻</span></div>
              <div className="mx-auto my-8 flex h-48 w-48 items-center justify-center rounded-full border border-lime-200/20 bg-emerald-700/60 shadow-inner sm:h-56 sm:w-56">
                <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full border border-lime-200/30 bg-emerald-600/40 sm:h-44 sm:w-44"><span className="text-6xl text-lime-300">♻</span><span className="mt-2 text-xs font-semibold tracking-widest text-emerald-50">REUTILIZAR</span></div>
              </div>
              <div className="grid grid-cols-3 gap-3">{[['01','Conectar'],['02','Descartar'],['03','Transformar']].map(([n,t])=><div key={n} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center"><span className="block text-xs font-bold text-lime-300">{n}</span><span className="mt-1 block text-xs text-white">{t}</span></div>)}</div>
              <p className="mt-5 text-center text-xs text-emerald-100/70">Pequenas atitudes. Grandes transformações.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center"><span className="text-xs font-bold tracking-[.2em] text-emerald-700">UM CAMINHO SIMPLES</span><h2 className="mt-3 text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">Reciclar fica mais fácil juntos.</h2><p className="mt-4 leading-7 text-slate-600">A plataforma aproxima quem quer descartar de quem pode dar o destino correto aos eletrônicos.</p></div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">{[{n:'01',icon:'⌖',title:'Encontre',text:'Localize pontos de coleta e descubra opções perto de você.'},{n:'02',icon:'↻',title:'Descarte',text:'Registre sua atitude e acompanhe seu histórico de descarte.'},{n:'03',icon:'✳',title:'Faça a diferença',text:'Acompanhe seu impacto e inspire mais pessoas a participar.'}].map(x=><article key={x.n} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl text-emerald-800">{x.icon}</span><span className="text-sm font-bold text-slate-300">{x.n}</span></div><h3 className="mt-5 text-lg font-bold text-emerald-950">{x.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{x.text}</p></article>)}</div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8"><div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-emerald-100/70 p-7 sm:p-10 md:flex-row md:items-center"><div><h2 className="text-2xl font-extrabold text-emerald-950">Qual é o seu papel nessa mudança?</h2><p className="mt-2 max-w-xl text-sm leading-6 text-emerald-900/75">Cidadãos, empresas e pontos de coleta: todos fazem parte da solução.</p></div><button onClick={() => go('register')} className="shrink-0 rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white hover:bg-emerald-900">Quero participar ↗</button></div></section>
    </main>}

    {page === 'register' && <main className="mx-auto max-w-6xl px-5 py-14 sm:py-20"><div className="mx-auto max-w-2xl text-center"><span className="text-xs font-bold tracking-[.2em] text-emerald-700">FAÇA PARTE</span><h1 className="mt-3 text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">Como você quer participar?</h1><p className="mt-4 text-slate-600">Escolha o perfil que melhor representa você.</p></div><div className="mt-10 grid gap-5 md:grid-cols-3">{profiles.map(p=><button key={p.id} onClick={() => { setProfile(p.id); go(p.action) }} className={`group rounded-2xl border bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl ${profile === p.id ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200'}`}><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-3xl text-emerald-800 transition group-hover:bg-emerald-800 group-hover:text-white">{p.icon}</span><h2 className="mt-5 text-lg font-bold text-emerald-950">{p.title}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{p.text}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-800">Continuar <span className="transition group-hover:translate-x-1">→</span></span></button>)}</div><p className="mt-8 text-center text-sm text-slate-500">Já tem uma conta? <button onClick={() => go('login')} className="font-bold text-emerald-800 underline underline-offset-4">Entrar</button></p></main>}

    {formTitles[page] && <main className="mx-auto grid min-h-[calc(100vh-145px)] max-w-7xl items-start gap-10 px-5 py-10 sm:py-14 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
      <aside className="hidden rounded-3xl bg-emerald-950 p-8 text-white lg:block"><span className="text-xs font-bold tracking-[.2em] text-lime-300">ELETRORECICLA</span><h2 className="mt-6 text-3xl font-extrabold leading-tight">{page === 'login' ? 'Sua jornada sustentável continua aqui.' : 'Cada atitude conta para um planeta melhor.'}</h2><p className="mt-4 text-sm leading-7 text-emerald-100/80">Conectamos pessoas e iniciativas para que os resíduos eletrônicos recebam um destino mais responsável.</p><div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5"><span className="text-3xl text-lime-300">♻</span><p className="mt-3 text-sm font-semibold">Pequenas atitudes. Grandes transformações.</p></div></aside>
      <section className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-9">
        <button onClick={() => go(page === 'login' || page === 'recovery' ? 'home' : 'register')} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-800">← Voltar</button>
        <h1 className="text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-3xl">{formTitles[page][0]}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{formTitles[page][1]}</p>
        <form onSubmit={submit} className="mt-7 space-y-5">
          {page === 'signup' && <><Field label="Nome completo" name="nome" autoComplete="name" placeholder="Seu nome e sobrenome" /><div className="grid gap-5 sm:grid-cols-2"><Field label="CPF" name="cpf" placeholder="000.000.000-00" /><Field label="Telefone" name="telefone" type="tel" autoComplete="tel" placeholder="(00) 00000-0000" /></div><Field label="E-mail" name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" /><div className="grid gap-5 sm:grid-cols-2"><Field label="Senha" name="senha" type="password" autoComplete="new-password" minLength={6} placeholder="Mínimo de 6 caracteres" /><Field label="Confirmar senha" name="confirmacao" type="password" autoComplete="new-password" minLength={6} /></div><label className="flex items-start gap-3 text-sm leading-5 text-slate-600"><input type="checkbox" required className="mt-1 accent-emerald-700" />Concordo com os termos de uso e a política de privacidade.</label></>}
          {(page === 'company' || page === 'point') && <><div className="grid gap-5 sm:grid-cols-2"><Field label="Razão social" name="razaoSocial" placeholder="Nome registrado da empresa" /><Field label="CNPJ" name="cnpj" placeholder="00.000.000/0000-00" /></div>{page === 'point' && <p className="rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-900">O cadastro será enviado para aprovação antes de o ponto aparecer na busca pública.</p>}<Field label="E-mail de contato" name="email" type="email" autoComplete="email" /><div className="grid gap-5 sm:grid-cols-2"><Field label="Telefone" name="telefone" type="tel" /><Field label="Endereço completo" name="endereco" autoComplete="street-address" placeholder="Rua, número, bairro, cidade - UF" /></div><div className="grid gap-5 sm:grid-cols-2"><Field label="Latitude (opcional)" name="latitude" type="number" required={false} step="any" placeholder="-23.5505" /><Field label="Longitude (opcional)" name="longitude" type="number" required={false} step="any" placeholder="-46.6333" /></div></>}
          {page === 'login' && <><Field label="E-mail" name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" /><Field label="Senha" name="senha" type="password" autoComplete="current-password" /><div className="text-right"><button type="button" onClick={() => go('recovery')} className="text-sm font-semibold text-emerald-800 hover:underline">Esqueci minha senha</button></div></>}
          {page === 'recovery' && <Field label="E-mail cadastrado" name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" />}
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3.5 font-bold text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-60">{busy ? 'Aguarde...' : page === 'login' ? 'Entrar na conta' : page === 'signup' ? 'Criar minha conta' : page === 'recovery' ? 'Continuar' : 'Enviar cadastro'} <span>→</span></button>
        </form>
        {page === 'login' && <p className="mt-6 text-center text-sm text-slate-500">Ainda não tem conta? <button onClick={() => go('register')} className="font-bold text-emerald-800 underline underline-offset-4">Cadastre-se</button></p>}
      </section>
    </main>}

    {page === 'how' && <main className="mx-auto max-w-5xl px-5 py-16"><span className="text-xs font-bold tracking-[.2em] text-emerald-700">COMO FUNCIONA</span><h1 className="mt-3 text-3xl font-extrabold text-emerald-950 sm:text-4xl">Do descarte ao impacto positivo.</h1><p className="mt-4 max-w-2xl leading-7 text-slate-600">A EletroRecicla facilita a conexão entre cidadãos, empresas e pontos de coleta para incentivar o descarte responsável de resíduos eletrônicos.</p><div className="mt-10 grid gap-5 sm:grid-cols-3">{[['01','Crie sua conta','Cadastre-se para acompanhar sua jornada.'],['02','Encontre um local','Busque pontos de coleta aprovados.'],['03','Acompanhe sua jornada','Consulte seu histórico de descartes.']].map(x=><div key={x[0]} className="rounded-2xl bg-white p-6 shadow-sm"><span className="text-sm font-extrabold text-emerald-600">{x[0]}</span><h2 className="mt-3 font-bold text-emerald-950">{x[1]}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{x[2]}</p></div>)}</div><button onClick={() => go('register')} className="mt-8 rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white">Participar agora →</button></main>}

    {page === 'points' && <main className="mx-auto max-w-6xl px-5 py-12 sm:py-16"><span className="text-xs font-bold tracking-[.2em] text-emerald-700">DESCARTE RESPONSÁVEL</span><h1 className="mt-3 text-3xl font-extrabold text-emerald-950 sm:text-4xl">Encontre um ponto de coleta</h1><p className="mt-3 max-w-2xl leading-7 text-slate-600">Busque locais cadastrados para encaminhar seus resíduos eletrônicos.</p><div className="mt-7 flex max-w-2xl gap-3"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por empresa ou endereço..." className={inputClass + ' mt-0'} /><button onClick={() => { if (!user) { notify('Entre na sua conta para consultar os pontos de coleta.', 'error'); return } api('/empresas/aprovadas', {}, false).then(data => setPoints(Array.isArray(data) ? data : [])).catch(e => notify(e.message, 'error')) }} className="shrink-0 rounded-xl bg-emerald-800 px-5 font-bold text-white hover:bg-emerald-900">Buscar</button></div>{!user && <div className="mt-6 rounded-2xl border border-emerald-100 bg-white p-6"><h2 className="font-bold text-emerald-950">Entre para continuar</h2><p className="mt-2 text-sm text-slate-600">Faça login para acessar as funcionalidades de descarte.</p><button onClick={() => go('login')} className="mt-4 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white">Entrar</button></div>}<div className="mt-6 grid gap-4 md:grid-cols-2">{points.filter(p => `${p.razaoSocial || ''} ${p.endereco || ''}`.toLowerCase().includes(search.toLowerCase())).map(p=><article key={p.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-800">⌖</span><div><h2 className="font-bold text-emerald-950">{p.razaoSocial || 'Ponto de coleta'}</h2><p className="mt-1 text-sm text-slate-600">{p.endereco || 'Endereço não informado'}</p><span className="mt-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">Cadastro aprovado</span></div></div></article>)}</div>{user && points.length === 0 && <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><span className="text-3xl">⌖</span><h2 className="mt-3 font-bold text-emerald-950">Nenhum ponto carregado</h2><p className="mt-2 text-sm text-slate-500">Tente buscar novamente em instantes.</p></div>}</main>}

    {(page === 'dashboard' || page === 'history') && <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold text-emerald-700">ÁREA DO CIDADÃO</p><h1 className="mt-2 text-3xl font-extrabold text-emerald-950">{page === 'history' ? 'Meu histórico' : `Olá${user?.nome ? ', ' + user.nome.split(' ')[0] : ''}!`}</h1><p className="mt-2 text-slate-600">{page === 'history' ? 'Acompanhe os registros das suas atitudes sustentáveis.' : 'Pronto para dar um destino melhor aos seus eletrônicos?'}</p></div><button onClick={() => go('points')} className="rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white hover:bg-emerald-900">Encontrar ponto ↗</button></div>{page === 'dashboard' && <div className="mt-8 grid gap-4 sm:grid-cols-3">{[['↻','Descartes registrados',collections.length],['♻','Jornada sustentável','Em andamento'],['✳','Próximo passo','Encontrar um ponto']].map(x=><div key={x[1]} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><span className="text-2xl text-emerald-700">{x[0]}</span><p className="mt-4 text-sm text-slate-500">{x[1]}</p><p className="mt-1 text-xl font-extrabold text-emerald-950">{x[2]}</p></div>)}</div>}<section className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-lg font-bold text-emerald-950">{page === 'history' ? 'Registros de descarte' : 'Atividade recente'}</h2><button onClick={() => go(page === 'history' ? 'dashboard' : 'history')} className="text-sm font-semibold text-emerald-800 hover:underline">{page === 'history' ? 'Voltar ao painel' : 'Ver histórico'}</button></div>{collections.length ? <div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-slate-100 text-slate-500"><tr><th className="py-3 pr-4 font-medium">Data</th><th className="py-3 pr-4 font-medium">Status</th><th className="py-3 font-medium">Quantidade</th></tr></thead><tbody>{collections.map((x,i)=><tr key={x.id || i} className="border-b border-slate-50"><td className="py-3 pr-4">{x.dataColeta ? new Date(x.dataColeta).toLocaleDateString('pt-BR') : '—'}</td><td className="py-3 pr-4">{x.status || 'Registrado'}</td><td className="py-3">{x.quantidadeKg ?? '—'} kg</td></tr>)}</tbody></table></div> : <div className="py-10 text-center"><span className="text-3xl text-emerald-700">♻</span><h3 className="mt-3 font-bold text-emerald-950">Sua jornada começa com uma atitude</h3><p className="mt-2 text-sm text-slate-500">Quando houver registros, eles aparecerão aqui.</p><button onClick={() => go('points')} className="mt-5 rounded-xl border border-emerald-800 px-4 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-50">Encontrar pontos de coleta</button></div>}</section></main>}

    {!['home','register','signup','company','point','login','recovery','how','points','dashboard','history'].includes(page) && <main className="mx-auto max-w-3xl px-5 py-20 text-center"><span className="text-4xl text-emerald-700">♻</span><h1 className="mt-4 text-3xl font-extrabold text-emerald-950">Essa área está sendo preparada</h1><p className="mt-3 text-slate-600">Vamos evoluir esta tela nas próximas etapas.</p><button onClick={() => go(user ? 'dashboard' : 'home')} className="mt-6 rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white">Voltar</button></main>}

    <footer className="border-t border-slate-100 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8"><Brand /><p className="text-sm text-slate-500">Pequenas atitudes. Grandes transformações.</p><p className="text-xs text-slate-400">© {new Date().getFullYear()} EletroRecicla</p></div></footer>
  </div>
}

export default App
