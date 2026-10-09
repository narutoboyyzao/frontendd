import React from 'react'

const GREEN = '#0c3a2b'
const primary = '#10b981'

function BrandMark() {
  return <div className="er-mark">↻</div>
}

function SideLink({ active, icon, children, onClick }) {
  return <button onClick={onClick} className={`er-side-link ${active ? 'active' : ''}`}><span>{icon}</span>{children}</button>
}

function CitizenLayout({ page, user, go, logout, children }) {
  const links = [
    ['dashboard', '▦', 'Visão geral'], ['points', '⌖', 'Buscar pontos'], ['history', '◷', 'Meu histórico'],
    ['score', '✳', 'Minha pontuação'], ['ranking', '♧', 'Ranking'], ['profile', '♙', 'Meu perfil'],
  ]
  return <div className="er-app-shell">
    <aside className="er-sidebar">
      <div className="er-sidebar-brand"><BrandMark/><div><b>EletroRecicla</b><small>Um futuro mais sustentável</small></div></div>
      <div className="er-sidebar-caption">MENU PRINCIPAL</div>
      {links.map(([id, icon, label]) => <SideLink key={id} active={page === id} icon={icon} onClick={() => go(id)}>{label}</SideLink>)}
      <div className="er-sidebar-bottom"><div className="er-user-chip"><span className="er-avatar">{(user?.nome || 'U').slice(0,1).toUpperCase()}</span><div><b>{user?.nome || 'Usuário'}</b><small>Cidadão</small></div></div><SideLink icon="↪" onClick={logout}>Sair da conta</SideLink></div>
    </aside>
    <main className="er-workspace"><header className="er-topbar"><div><span className="er-eyebrow">ÁREA DO CIDADÃO</span><p>Olá, {user?.nome?.split(' ')[0] || 'pessoa'}! <span>Que bom ter você por aqui.</span></p></div><button className="er-notification" aria-label="Notificações">♧</button></header><div className="er-content">{children}</div></main>
  </div>
}

function AdminLayout({ page, go, logout, children }) {
  const links = [
    ['admin', '▦', 'Dashboard'], ['users', '♙', 'Gerenciar usuários'], ['approvals', '✓', 'Aprovação de empresas'],
    ['partners', '⌖', 'Empresas parceiras'], ['point-form', '+', 'Cadastro de ponto'], ['reports', '▤', 'Relatórios'], ['education', '▧', 'Publicações educativas'],
  ]
  return <div className="er-app-shell">
    <aside className="er-sidebar"><div className="er-sidebar-brand"><BrandMark/><div><b>EletroRecicla</b><small>Painel administrativo</small></div></div><div className="er-sidebar-caption">ADMINISTRAÇÃO</div>
    {links.map(([id, icon, label]) => <SideLink key={id} active={page === id} icon={icon} onClick={() => go(id)}>{label}</SideLink>)}
    <div className="er-sidebar-bottom"><SideLink icon="↪" onClick={logout}>Sair da conta</SideLink></div></aside>
    <main className="er-workspace"><header className="er-topbar"><div><span className="er-eyebrow">PAINEL ADMINISTRATIVO</span><p>Gestão EletroRecicla <span>Controle e acompanhe a plataforma.</span></p></div><span className="er-admin-pill">● Administrador</span></header><div className="er-content">{children}</div></main>
  </div>
}

function Stat({ label, value, note, icon }) {
  return <article className="er-stat"><span className="er-stat-icon">{icon}</span><p>{label}</p><strong>{value}</strong>{note && <small>{note}</small>}</article>
}
function PageHeading({ eyebrow, title, description, action, onAction }) {
  return <div className="er-page-heading"><div><span className="er-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action && <button className="er-primary-btn" onClick={onAction}>{action}</button>}</div>
}
function EmptyState({ icon='♻', title, text, action, onAction }) {
  return <div className="er-empty"><span>{icon}</span><h3>{title}</h3><p>{text}</p>{action && <button className="er-outline-btn" onClick={onAction}>{action}</button>}</div>
}

export default function FigmaScreens({ page, user, go, logout, collections = [], points = [], search = '', setSearch = () => {} }) {
  const adminPages = ['admin','users','approvals','partners','point-form','reports','education']
  if (adminPages.includes(page)) return <AdminLayout page={page} go={go} logout={logout}>
    {page === 'admin' && <>
      <PageHeading eyebrow="VISÃO GERAL" title="Dashboard" description="Acompanhe os principais indicadores da plataforma." action="Ver relatórios →" onAction={() => go('reports')}/>
      <div className="er-stats-grid"><Stat icon="♙" label="Usuários cadastrados" value="—" note="Total de cidadãos na plataforma"/><Stat icon="⌖" label="Empresas parceiras" value={points.length || '—'} note="Pontos de coleta disponíveis"/><Stat icon="◷" label="Solicitações pendentes" value="—" note="Aguardando análise"/><Stat icon="♻" label="Coletas registradas" value={collections.length} note="Registros recebidos"/></div>
      <section className="er-panel"><div className="er-panel-heading"><div><h2>Atividade recente</h2><p>Últimas movimentações na plataforma</p></div><button className="er-text-btn" onClick={() => go('reports')}>Ver relatórios →</button></div><EmptyState title="Sem atividades recentes" text="As atividades aparecerão aqui conforme a plataforma receber novos registros."/></section>
      <section className="er-quick-grid"><button onClick={() => go('approvals')}><span>✓</span><b>Analisar cadastros</b><small>Revise empresas que aguardam aprovação</small></button><button onClick={() => go('users')}><span>♙</span><b>Gerenciar usuários</b><small>Consulte e administre as contas</small></button><button onClick={() => go('education')}><span>▧</span><b>Conteúdo educativo</b><small>Compartilhe boas práticas de descarte</small></button></section>
    </>}
    {page === 'users' && <><PageHeading eyebrow="ADMINISTRAÇÃO" title="Gerenciar usuários" description="Consulte e gerencie as contas cadastradas na plataforma."/><section className="er-panel"><div className="er-panel-heading"><div><h2>Todos os usuários</h2><p>Lista de contas registradas</p></div><input className="er-search" placeholder="Buscar usuário..." aria-label="Buscar usuário"/></div><EmptyState icon="♙" title="Nenhum usuário para exibir" text="Quando houver usuários disponíveis, eles aparecerão nesta lista."/></section></>}
    {page === 'approvals' && <><PageHeading eyebrow="ADMINISTRAÇÃO" title="Aprovação de empresas" description="Analise os cadastros antes de disponibilizar os pontos de coleta."/><section className="er-panel"><div className="er-panel-heading"><div><h2>Cadastros pendentes</h2><p>Empresas aguardando avaliação</p></div><span className="er-count-pill">Em análise</span></div><EmptyState icon="✓" title="Tudo em dia!" text="Não há cadastros pendentes para analisar no momento."/></section></>}
    {page === 'partners' && <><PageHeading eyebrow="REDE DE RECICLAGEM" title="Empresas parceiras" description="Veja os parceiros que fazem parte da rede EletroRecicla." action="Cadastrar ponto +" onAction={() => go('point-form')}/><section className="er-panel"><div className="er-panel-heading"><div><h2>Parceiros cadastrados</h2><p>Empresas e pontos de coleta aprovados</p></div></div>{points.length ? <div className="er-table-wrap"><table className="er-table"><thead><tr><th>Empresa</th><th>Endereço</th><th>Status</th></tr></thead><tbody>{points.map((p,i)=><tr key={p.id || i}><td>{p.razaoSocial || 'Empresa parceira'}</td><td>{p.endereco || '—'}</td><td><span className="er-status">Aprovada</span></td></tr>)}</tbody></table></div> : <EmptyState icon="⌖" title="Nenhum parceiro cadastrado" text="Os pontos aprovados serão exibidos aqui."/>}</section></>}
    {page === 'point-form' && <><PageHeading eyebrow="REDE DE RECICLAGEM" title="Cadastro de ponto" description="Cadastre um novo ponto de coleta na rede."/><section className="er-panel"><h2>Dados do ponto de coleta</h2><p className="er-panel-description">Use o formulário de cadastro público para registrar os dados e enviar para análise.</p><button className="er-primary-btn" onClick={() => go('point')}>Abrir cadastro de ponto →</button></section></>}
    {page === 'reports' && <><PageHeading eyebrow="DADOS E INDICADORES" title="Relatórios" description="Acompanhe os indicadores e a evolução da plataforma."/><div className="er-stats-grid"><Stat icon="♙" label="Usuários" value="—"/><Stat icon="⌖" label="Pontos ativos" value={points.length || '—'}/><Stat icon="♻" label="Coletas registradas" value={collections.length}/><Stat icon="✓" label="Aprovações" value="—"/></div><section className="er-panel"><h2>Resumo da plataforma</h2><p className="er-panel-description">Os relatórios serão preenchidos com os dados disponíveis na API.</p><EmptyState icon="▤" title="Dados insuficientes para o relatório" text="Assim que houver dados consolidados, os indicadores serão exibidos aqui."/></section></>}
    {page === 'education' && <><PageHeading eyebrow="CONSCIENTIZAÇÃO" title="Publicações educativas" description="Conteúdos para incentivar o descarte correto de resíduos eletrônicos." action="Nova publicação +" onAction={() => window.alert('A criação de publicações será conectada ao serviço de conteúdo.')}/><section className="er-panel"><div className="er-panel-heading"><div><h2>Biblioteca de conteúdos</h2><p>Materiais educativos da plataforma</p></div></div><EmptyState icon="▧" title="Nenhuma publicação cadastrada" text="Quando houver conteúdos publicados, eles serão listados aqui."/></section></>}
  </AdminLayout>

  return <CitizenLayout page={page} user={user} go={go} logout={logout}>
    {page === 'dashboard' && <><PageHeading eyebrow="SEU IMPACTO COMEÇA AQUI" title="Visão geral" description="Pequenas atitudes constroem um futuro mais sustentável." action="Encontrar ponto de coleta" onAction={() => go('points')}/><div className="er-stats-grid"><Stat icon="♻" label="Descartes registrados" value={collections.length} note="Sua contribuição até agora"/><Stat icon="✳" label="Pontos conquistados" value="0" note="Continue participando"/><Stat icon="⌖" label="Pontos de coleta" value={points.length || '—'} note="Na rede EletroRecicla"/></div><div className="er-dashboard-grid"><section className="er-panel"><div className="er-panel-heading"><div><h2>Atividade recente</h2><p>Acompanhe seus últimos descartes</p></div><button className="er-text-btn" onClick={() => go('history')}>Ver histórico →</button></div>{collections.length ? <div className="er-table-wrap"><table className="er-table"><thead><tr><th>Data</th><th>Status</th><th>Quantidade</th></tr></thead><tbody>{collections.slice(0,5).map((x,i)=><tr key={x.id || i}><td>{x.dataColeta ? new Date(x.dataColeta).toLocaleDateString('pt-BR') : '—'}</td><td>{x.status || 'Registrado'}</td><td>{x.quantidadeKg ?? '—'} kg</td></tr>)}</tbody></table></div> : <EmptyState title="Sua jornada começa agora" text="Seus registros de descarte aparecerão aqui." action="Buscar pontos de coleta" onAction={() => go('points')}/>}</section><aside className="er-impact-card"><span>♻</span><small>ATITUDE SUSTENTÁVEL</small><h2>O planeta agradece cada escolha consciente.</h2><p>Encontre um ponto de coleta e dê um destino responsável aos seus eletrônicos.</p><button onClick={() => go('points')}>Encontrar um ponto ↗</button></aside></div></>}
    {page === 'history' && <><PageHeading eyebrow="SUA JORNADA" title="Meu histórico" description="Acompanhe os registros das suas atitudes sustentáveis."/><section className="er-panel"><div className="er-panel-heading"><div><h2>Registros de descarte</h2><p>Histórico das suas contribuições</p></div><span className="er-count-pill">{collections.length} registros</span></div>{collections.length ? <div className="er-table-wrap"><table className="er-table"><thead><tr><th>Data</th><th>Status</th><th>Quantidade</th></tr></thead><tbody>{collections.map((x,i)=><tr key={x.id || i}><td>{x.dataColeta ? new Date(x.dataColeta).toLocaleDateString('pt-BR') : '—'}</td><td>{x.status || 'Registrado'}</td><td>{x.quantidadeKg ?? '—'} kg</td></tr>)}</tbody></table></div> : <EmptyState title="Nenhum registro por enquanto" text="Quando você tiver descartes registrados, eles aparecerão nesta página." action="Encontrar ponto de coleta" onAction={() => go('points')}/>}</section></>}
    {page === 'points' && <><PageHeading eyebrow="DESCARTE RESPONSÁVEL" title="Buscar pontos de coleta" description="Encontre locais aprovados para destinar seus eletrônicos corretamente."/><section className="er-panel"><div className="er-search-row"><input className="er-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por empresa ou endereço..." aria-label="Buscar por empresa ou endereço"/><span className="er-count-pill">{points.filter(p => `${p.razaoSocial || ''} ${p.endereco || ''}`.toLowerCase().includes(search.toLowerCase())).length} locais</span></div>{points.filter(p => `${p.razaoSocial || ''} ${p.endereco || ''}`.toLowerCase().includes(search.toLowerCase())).length ? <div className="er-points-grid">{points.filter(p => `${p.razaoSocial || ''} ${p.endereco || ''}`.toLowerCase().includes(search.toLowerCase())).map((p,i)=><article className="er-point-card" key={p.id || i}><span className="er-point-icon">⌖</span><span className="er-status">Aprovado</span><h3>{p.razaoSocial || 'Ponto de coleta'}</h3><p>{p.endereco || 'Endereço não informado'}</p><button className="er-text-btn" onClick={() => go('profile')}>Ver detalhes →</button></article>)}</div> : <EmptyState icon="⌖" title="Nenhum ponto encontrado" text="Tente outro termo de busca ou volte mais tarde para consultar novos locais."/>}</section></>}
    {page === 'score' && <><PageHeading eyebrow="SEU IMPACTO" title="Minha pontuação" description="Acompanhe sua participação na construção de um futuro sustentável."/><div className="er-score-card"><span>✳</span><small>PONTUAÇÃO TOTAL</small><strong>0 <em>pontos</em></strong><p>Continue descartando corretamente para acompanhar sua evolução.</p></div><section className="er-panel"><h2>Como ganhar pontos</h2><div className="er-steps"><div><b>01</b><span><strong>Encontre um ponto</strong><small>Escolha um local de coleta aprovado.</small></span></div><div><b>02</b><span><strong>Faça o descarte consciente</strong><small>Encaminhe seus eletrônicos corretamente.</small></span></div><div><b>03</b><span><strong>Acompanhe seu impacto</strong><small>Consulte seus registros e evolução.</small></span></div></div></section></>}
    {page === 'ranking' && <><PageHeading eyebrow="COMUNIDADE ELETRORECICLA" title="Ranking sustentável" description="Inspire-se na comunidade e celebre atitudes que fazem a diferença."/><section className="er-panel"><div className="er-panel-heading"><div><h2>Participantes em destaque</h2><p>Classificação baseada nos pontos conquistados</p></div><span className="er-count-pill">Ranking geral</span></div><EmptyState icon="♧" title="O ranking está começando" text="Quando houver pontuações registradas, os participantes aparecerão aqui."/></section></>}
    {page === 'profile' && <><PageHeading eyebrow="SUA CONTA" title="Meu perfil" description="Confira suas informações cadastrais."/><section className="er-panel er-profile-card"><div className="er-profile-avatar">{(user?.nome || 'U').slice(0,1).toUpperCase()}</div><div><h2>{user?.nome || 'Usuário EletroRecicla'}</h2><p>{user?.email || 'E-mail não informado'}</p><span className="er-status">Conta de cidadão</span></div></section><section className="er-panel"><h2>Informações pessoais</h2><div className="er-profile-fields"><div><small>Nome completo</small><b>{user?.nome || '—'}</b></div><div><small>E-mail</small><b>{user?.email || '—'}</b></div><div><small>Telefone</small><b>{user?.telefone || 'Não informado'}</b></div></div></section></>}
  </CitizenLayout>
}
