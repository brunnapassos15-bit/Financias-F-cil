// ============================================
// DADOS DO SISTEMA
// ============================================

let configuracao = { salario: 0, meta: 0 };
let transacoes = [];
let historico = [];

const meses = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function formatarDinheiro(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function converterValor(texto) {
  // Aceita tanto 45.00 quanto 45,00
  let limpo = texto.replace(/\./g, '').replace(',', '.');
  return parseFloat(limpo);
}

function mesAtual() {
  let d = new Date();
  return meses[d.getMonth()] + ' ' + d.getFullYear();
}

function salvarDados() {
  localStorage.setItem('transacoes', JSON.stringify(transacoes));
  localStorage.setItem('configuracao', JSON.stringify(configuracao));
  localStorage.setItem('historico', JSON.stringify(historico));
}

function carregarDados() {
  let t = localStorage.getItem('transacoes');
  let c = localStorage.getItem('configuracao');
  let h = localStorage.getItem('historico');

  if (t) transacoes = JSON.parse(t);
  if (h) historico = JSON.parse(h);
  if (c) {
    configuracao = JSON.parse(c);
    document.getElementById('salario').value = configuracao.salario || '';
    document.getElementById('meta').value = configuracao.meta || '';
  }

  atualizarLista();
  atualizarPainel();
  atualizarHistorico();
}

// ============================================
// ATUALIZA A TELA
// ============================================

function calcularTotais() {
  let totalEntradas = 0;
  let totalSaidas = 0;

  for (let i = 0; i < transacoes.length; i++) {
    if (transacoes[i].tipo === 'entrada') {
      totalEntradas += transacoes[i].valor;
    } else {
      totalSaidas += transacoes[i].valor;
    }
  }

  let saldo = totalEntradas - totalSaidas;
  let metaGuardada = saldo >= configuracao.meta ? configuracao.meta : saldo;
  if (metaGuardada < 0) metaGuardada = 0;

  return { totalEntradas, totalSaidas, saldo, metaGuardada };
}

function atualizarPainel() {
  let totais = calcularTotais();
  document.getElementById('total-entradas').textContent = formatarDinheiro(totais.totalEntradas);
  document.getElementById('total-saidas').textContent = formatarDinheiro(totais.totalSaidas);
  document.getElementById('saldo').textContent = formatarDinheiro(totais.saldo);
  document.getElementById('meta-guardada').textContent = formatarDinheiro(totais.metaGuardada);
}

function atualizarLista() {
  let lista = document.getElementById('lista-transacoes');

  if (transacoes.length === 0) {
    lista.innerHTML = '<li>Nenhuma transação ainda.</li>';
    return;
  }

  lista.innerHTML = '';
  for (let i = transacoes.length - 1; i >= 0; i--) {
    let t = transacoes[i];
    let sinal = t.tipo === 'entrada' ? '+' : '-';
    let cor = t.tipo === 'entrada' ? 'entrada' : 'saida';

    lista.innerHTML += `
      <li class="transacao ${cor}">
        <span class="transacao-desc">${t.descricao}</span>
        <span class="transacao-cat">${t.categoria}</span>
        <span class="transacao-valor">${sinal} ${formatarDinheiro(t.valor)}</span>
        <button class="btn-deletar" onclick="deletarTransacao(${t.id})">✕</button>
      </li>
    `;
  }
}

// ============================================
// HISTÓRICO POR MÊS
// ============================================

function atualizarHistorico() {
  let container = document.getElementById('lista-historico');

  if (historico.length === 0) {
    container.innerHTML = '<p class="vazio">Nenhum mês fechado ainda.</p>';
    return;
  }

  container.innerHTML = '';
  for (let i = historico.length - 1; i >= 0; i--) {
    let m = historico[i];
    let itens = m.transacoes.map(t => {
      let sinal = t.tipo === 'entrada' ? '+' : '-';
      let cor = t.tipo === 'entrada' ? 'entrada' : 'saida';
      return `<li class="transacao ${cor}">
        <span class="transacao-desc">${t.descricao}</span>
        <span class="transacao-cat">${t.categoria}</span>
        <span class="transacao-valor">${sinal} ${formatarDinheiro(t.valor)}</span>
      </li>`;
    }).join('');

    container.innerHTML += `
      <div class="mes-card">
        <div class="mes-header" onclick="toggleMes(this)">
          <h3>📅 ${m.mes}</h3>
          <div class="mes-resumo">
            <span>Entradas: <span class="ev">${formatarDinheiro(m.totalEntradas)}</span></span>
            <span>Saídas: <span class="es">${formatarDinheiro(m.totalSaidas)}</span></span>
            <span>Saldo: <strong>${formatarDinheiro(m.saldo)}</strong></span>
          </div>
        </div>
        <div class="mes-body" style="display:none">
          <ul>${itens}</ul>
        </div>
      </div>
    `;
  }
}

function toggleMes(header) {
  let body = header.nextElementSibling;
  body.style.display = body.style.display === 'none' ? 'block' : 'none';
}

function fecharMes() {
  if (transacoes.length === 0) {
    alert('Não há transações para fechar o mês.');
    return;
  }

  let totais = calcularTotais();
  let mes = {
    mes: mesAtual(),
    transacoes: [...transacoes],
    totalEntradas: totais.totalEntradas,
    totalSaidas: totais.totalSaidas,
    saldo: totais.saldo
  };

  historico.push(mes);
  transacoes = [];
  configuracao = { salario: 0, meta: 0 };

  document.getElementById('salario').value = '';
  document.getElementById('meta').value = '';

  salvarDados();
  atualizarLista();
  atualizarPainel();
  atualizarHistorico();

  alert('Mês fechado e salvo no histórico!');
  mostrarAba('historico');
}

// ============================================
// ABAS
// ============================================

function mostrarAba(aba) {
  document.getElementById('aba-inicio').classList.toggle('escondido', aba !== 'inicio');
  document.getElementById('aba-historico').classList.toggle('escondido', aba !== 'historico');

  document.querySelectorAll('.aba').forEach(function(btn) {
    btn.classList.remove('ativa');
  });

  let abas = document.querySelectorAll('.aba');
  if (aba === 'inicio') abas[0].classList.add('ativa');
  if (aba === 'historico') abas[1].classList.add('ativa');
}

// ============================================
// DELETAR TRANSAÇÃO
// ============================================

function deletarTransacao(id) {
  transacoes = transacoes.filter(function(t) { return t.id !== id; });
  salvarDados();
  atualizarLista();
  atualizarPainel();
}

// ============================================
// AÇÕES DOS BOTÕES
// ============================================

document.getElementById('btn-salvar-config').addEventListener('click', function() {
  let salario = converterValor(document.getElementById('salario').value);
  let meta = converterValor(document.getElementById('meta').value);

  if (isNaN(salario) || salario <= 0) { alert('Digite um salário válido.'); return; }
  if (isNaN(meta) || meta <= 0) { alert('Digite uma meta válida.'); return; }
  if (meta >= salario) { alert('A meta não pode ser maior ou igual ao salário.'); return; }

  configuracao.salario = salario;
  configuracao.meta = meta;

  salvarDados();
  alert(`Configuração salva! Você pode gastar até ${formatarDinheiro(salario - meta)} este mês.`);
  atualizarPainel();
});

document.getElementById('btn-adicionar').addEventListener('click', function() {
  let descricao = document.getElementById('descricao').value.trim();
  let valor = converterValor(document.getElementById('valor').value);
  let tipo = document.getElementById('tipo').value;
  let categoria = document.getElementById('categoria').value;

  if (descricao === '') { alert('Digite uma descrição.'); return; }
  if (isNaN(valor) || valor <= 0) { alert('Digite um valor válido.'); return; }

  transacoes.push({ id: Date.now(), descricao, valor, tipo, categoria });

  document.getElementById('descricao').value = '';
  document.getElementById('valor').value = '';

  salvarDados();
  atualizarLista();
  atualizarPainel();
});

// Adiciona botão fechar mês na seção de transações
document.getElementById('historico-mes').insertAdjacentHTML('beforeend',
  '<button class="btn-fechar-mes" onclick="fecharMes()">📦 Fechar mês e arquivar</button>'
);

// Carrega tudo ao abrir
carregarDados();
