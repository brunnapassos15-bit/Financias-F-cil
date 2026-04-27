// ============================================
// DADOS DO SISTEMA
// ============================================

let configuracao = {
  salario: 0,
  meta: 0
};

let transacoes = [];

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function formatarDinheiro(valor) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

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

// ============================================
// ATUALIZA A TELA
// ============================================

function atualizarPainel() {
  let totais = calcularTotais();

  document.getElementById('total-entradas').textContent = formatarDinheiro(totais.totalEntradas);
  document.getElementById('total-saidas').textContent = formatarDinheiro(totais.totalSaidas);
  document.getElementById('saldo').textContent = formatarDinheiro(totais.saldo);
  document.getElementById('meta-guardada').textContent = formatarDinheiro(totais.metaGuardada);

  atualizarConselho(totais);
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
// CONSELHO INTELIGENTE
// ============================================

function atualizarConselho(totais) {
  let conselho = document.getElementById('conselho');

  if (configuracao.salario === 0) {
    conselho.textContent = 'Configure seu salário e meta para receber sugestões.';
    return;
  }

  let deficit = configuracao.meta - totais.metaGuardada;

  if (deficit <= 0) {
    conselho.innerHTML = `
      Parabéns! Você guardou ${formatarDinheiro(totais.metaGuardada)} este mês
      e atingiu sua meta de ${formatarDinheiro(configuracao.meta)}.
      Continue assim no próximo mês!
    `;
    return;
  }

  let limiteProximoMes = configuracao.salario - configuracao.meta - deficit;
  let corteNecessario = deficit;

  conselho.innerHTML = `
    Você não conseguiu guardar os ${formatarDinheiro(configuracao.meta)} esse mês.
    Faltaram ${formatarDinheiro(deficit)}.
    <br><br>
    <strong>Para o próximo mês:</strong><br>
    Seu limite de gastos será ${formatarDinheiro(limiteProximoMes)}.
    Corte ${formatarDinheiro(corteNecessario)} dos gastos de lazer,
    assinaturas e restaurantes para repor o que faltou
    e ainda guardar sua meta.
  `;
}

// ============================================
// DELETAR TRANSAÇÃO
// ============================================

function deletarTransacao(id) {
  transacoes = transacoes.filter(function(t) {
    return t.id !== id;
  });

  atualizarLista();
  atualizarPainel();
}

// ============================================
// AÇÕES DOS BOTÕES
// ============================================

document.getElementById('btn-salvar-config').addEventListener('click', function() {
  let salario = parseFloat(document.getElementById('salario').value);
  let meta = parseFloat(document.getElementById('meta').value);

  if (isNaN(salario) || salario <= 0) {
    alert('Digite um salário válido.');
    return;
  }

  if (isNaN(meta) || meta <= 0) {
    alert('Digite uma meta válida.');
    return;
  }

  if (meta >= salario) {
    alert('A meta não pode ser maior ou igual ao salário.');
    return;
  }

  configuracao.salario = salario;
  configuracao.meta = meta;

  alert(`Configuração salva! Você pode gastar até ${formatarDinheiro(salario - meta)} este mês.`);
  atualizarPainel();
});

document.getElementById('btn-adicionar').addEventListener('click', function() {
  let descricao = document.getElementById('descricao').value.trim();
  let valor = parseFloat(document.getElementById('valor').value);
  let tipo = document.getElementById('tipo').value;
  let categoria = document.getElementById('categoria').value;

  if (descricao === '') {
    alert('Digite uma descrição.');
    return;
  }

  if (isNaN(valor) || valor <= 0) {
    alert('Digite um valor válido.');
    return;
  }

  let novaTransacao = {
    id: Date.now(),
    descricao,
    valor,
    tipo,
    categoria
  };

  transacoes.push(novaTransacao);

  document.getElementById('descricao').value = '';
  document.getElementById('valor').value = '';

  atualizarLista();
  atualizarPainel();
});