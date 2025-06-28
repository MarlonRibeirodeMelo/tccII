import db from '../db';

export const saveToLocalDB = async (data, showNotification) => {
  try {
    // Salva os dados no banco local
    if (data.formasPagamentos) {
      await db.formasPagamentos.bulkPut(data.formasPagamentos);
    }
    if (data.precos) {
      await db.precos.bulkPut(data.precos);
    }
    if (data.produtos) {
      await db.produtos.bulkPut(data.produtos);
    }
    if (data.condicaoPagamento) {
      await db.condicaoPagamento.bulkPut(data.condicaoPagamento);
    }
    if (data.ramosDeAtividade) {
      await db.ramosDeAtividade.bulkPut(data.ramosDeAtividade);
    }
    if (data.tiposOperacao) {
      await db.tiposOperacao.bulkPut(data.tiposOperacao);
    }
    console.log(data.clientes)

     if (data.clientes) {     
       await db.clientes.bulkPut(data.clientes);
    }
       // Salvar diretamente os estadosCSV
    if (data.estadosCSV) {
      await db.estadosCSV.bulkPut(data.estadosCSV);
      console.log(`${data.estadosCSV.length} estados adicionados.`);
    }

    // Salvar diretamente as cidadesCSV
    if (data.cidadesCSV) {
      await db.cidadesCSV.bulkPut(data.cidadesCSV);
      console.log(`${data.cidadesCSV.length} cidades adicionadas.`);
    } 

    
    if (data.cidades) {
      await db.cidades.bulkPut(data.cidades);
      console.log(`${data.cidades.length} cidades adicionadas.`);
    }




    /*  // Adicionar cidades ao banco
      // Adicionar cidades ao banco
       // Adicionar cidades ao banco
    if (data.cidades) {
        const cidadesNoBanco = await db.cidades.toArray();
        const estadosNoBanco = await db.estados.toArray();
  
        // Mapeia estados para facilitar busca por sigla
        const estadosMap = new Map(
          estadosNoBanco.map((estado) => [estado.sigla, estado.id])
        );
  
        const cidadesMap = new Map(
          cidadesNoBanco.map((cidade) => [`${cidade.nome}-${cidade.estadoId}`, true])
        );
  
        const cidadesParaAdicionar = [];
  
        for (const cidade of data.cidades) {
          if (!cidade.nome || !cidade.estado) {
            console.warn('Dados incompletos para a cidade:', cidade);
            continue;
          }
  
          const estadoId = estadosMap.get(cidade.estado);
          if (!estadoId) {
            console.warn(`Estado não encontrado para a cidade: ${cidade.nome}`);
            continue;
          }
  
          const cidadeKey = `${cidade.nome}-${estadoId}`;
          if (!cidadesMap.has(cidadeKey)) {
            cidadesParaAdicionar.push({
              nome: cidade.nome,
              estadoId: estadoId,
            });
            cidadesMap.set(cidadeKey, true);
          }
        }
  
        if (cidadesParaAdicionar.length > 0) {
          try {
            await db.cidades.bulkAdd(cidadesParaAdicionar);
            console.log(`${cidadesParaAdicionar.length} cidades adicionadas`);
          } catch (addError) {
            console.error('Erro ao adicionar cidades:', addError);
          }
        }
      }
  */



    showNotification('Dados locais atualizados com sucesso!', 'success');
  } catch (error) {
    console.error('Erro ao salvar dados no banco local:', error);
    showNotification('Erro ao salvar dados locais.', 'error');
  }
};
 