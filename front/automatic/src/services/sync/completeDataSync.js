import { data } from 'react-router-dom';
import axios from '../axios';
import db from '../db';
import { format } from 'date-fns';

export const completeSync = async (showNotification, user) => {
  try {
    if (!user) {
      showNotification('Erro: Usuário não autenticado.', 'error');
      return;
    }

    showNotification('Iniciando sincronização completa...', 'info');

    const storedUser = await db.currentUser.get('currentUser');
    const dataUltimaSincronizacao = storedUser.dataUltimaSincronizacao || null; // Enviar `null` se não existir
    let ultimoUsuarioLogado;
    if (storedUser.dataUltimaSincronizacao ? false : true) {

      try {
        ultimoUsuarioLogado = await db.ultimoUsuarioLogado
          .get({ idVendedor: user.vendedorModel.id })
          .catch(() => null); // Captura erros de consulta
      } catch (error) {
        ultimoUsuarioLogado = null;
      }
    }



    const limparRegistrosOnline = Boolean(ultimoUsuarioLogado);
    console.log(dataUltimaSincronizacao)

    // Definir a data de última sincronização corretamente

    const offlineData = {
      clientes: await db.clientes.where('sincronismo').equals('false').toArray(),
      pedidos: await db.pedidos.where('sincronismo').equals('false').toArray(),
    };

    const offlineDataRetorno = {
      dataUltimaSincronizacao, // Enviar ao backend
      primeira: storedUser.dataUltimaSincronizacao == null ? true : false,
    };


    let response;
    try {
      response = await axios.post('/api/mobile/sincronizar', offlineData);
    } catch (apiError) {
      console.error('Erro ao conectar à API:', apiError);
      showNotification('Erro ao conectar ao servidor. Tente novamente.', 'error');
      return;
    }

    try {
      response = await axios.post('/api/mobile/retornaRegistrosAtualizados', offlineDataRetorno);
      if (!response || !response.data) {
        throw new Error('Resposta inválida da API');
      }
    } catch (apiError) {
      console.error('Erro ao conectar à API:', apiError);
      showNotification('Erro ao conectar ao servidor. Tente novamente.', 'error');
      return;
    }


    console.log(response)
    showNotification('Dados carregados.. Guardando seus dados!!', 'success');


    const {
      clientes,
      pedidos,
      formasPagamentos,
      precos,
      produtos,
      condicaoPagamento,
      ramosDeAtividade,
      tiposOperacao,
      cidades,
      estadosCSV,
      cidadesCSV,
    } = response.data;
    console.log(response.data)
    // Salvar as referências para futura comparação
    const offlineClientesEnviados = offlineData.clientes;
    const offlinePedidosEnviados = offlineData.pedidos;


    // Usa transação para garantir velocidade máxima
    await db.transaction('rw', db.clientes, db.pedidos, db.formasPagamentos, db.precos, db.produtos,
      db.condicaoPagamento, db.ramosDeAtividade, db.tiposOperacao, db.cidades, db.estadosCSV, db.cidadesCSV, async () => {

        if (limparRegistrosOnline || storedUser.dataUltimaSincronizacao == null ? true : false) {
          await Promise.all([
            db.clientes.where('sincronismo').equals('true').delete(),
            db.pedidos.where('sincronismo').equals('true').delete(),
            db.formasPagamentos.clear(),
            db.precos.clear(),
            db.produtos.clear(),
            db.condicaoPagamento.clear(),
            db.ramosDeAtividade.clear(),
            db.tiposOperacao.clear(),
            db.cidades.clear(),
            db.cidadesCSV.clear(),
            db.cidadesCSV.clear(),

            db.tiposOperacao.clear(),

          ]);
        }


        // **Clientes** - Usar `bulkPut` ao invés de `for + add`
        if (clientes.length) {
          // Antes de deletar os offline (não sincronizados), verifique se foram retornados pela API
          // 1) Montar sets/arrays de IDs retornados
          const clientesApiIds = new Set((clientes || []).map(cli => cli.documento));
          // 2) Verificar clientes offline enviados
          for (const c of offlineClientesEnviados) {
            // Se esse ID não está na resposta da API, exibe erro e "interrompe" a transação
            if (!clientesApiIds.has(c.cpfCnpj)) {
              showNotification(
                `Erro na sincronização completa: Cliente (DOCUMENTO: ${c.cpfCnpj}) salvo offline não retornado pela API. Solicite suporte.`,
                'error'
              );
              // Jogar um erro para abortar a transação e não prosseguir
              throw new Error(`Cliente offline (DOCUMENTO: ${c.documento}) não retornado pela API`);
            }
          }

          await db.clientes.bulkPut(clientes.map(cliente => ({ ...cliente, sincronismo: 'true', isDeleted: false })));
        }





        if (pedidos.length) {
          // Inserir os novos pedidos sincronizados
          const pedidosApiIds = new Set((pedidos || []).map(ped => ped.uuidMobile));
          // 3) Verificar pedidos offline enviados
          for (const p of offlinePedidosEnviados) {
            if (!pedidosApiIds.has(p.uuidMobile)) {
              showNotification(
                `Erro na sincronização completa: Pedido (ID: ${p.idLocal}) salvo offline não retornado pela API. Solicite suporte.`,
                'error'
              );
              throw new Error(`Pedido offline (ID: ${p.idLocal}) não retornado pela API`);
            }
          }

          await db.pedidos.bulkPut(pedidos.map(pedido => ({ ...pedido, sincronismo: 'true', isDeleted: false })));
        }








        // Se chegou aqui, significa que todos offline foram retornados corretamente
        // Agora podemos deletar os que estavam offline
        await db.clientes.where('sincronismo').equals('false').delete();
        await db.pedidos.where('sincronismo').equals('false').delete();



        // **Tabelas que podem ser sincronizadas diretamente**
        await Promise.all([
          formasPagamentos && formasPagamentos.length ? db.formasPagamentos.bulkPut(formasPagamentos) : null,
          precos && precos.length ? db.precos.bulkPut(precos) : null,
          produtos && produtos.length ? db.produtos.bulkPut(produtos) : null,
          condicaoPagamento && condicaoPagamento.length ? db.condicaoPagamento.bulkPut(condicaoPagamento) : null,
          ramosDeAtividade && ramosDeAtividade.length ? db.ramosDeAtividade.bulkPut(ramosDeAtividade) : null,
          tiposOperacao && tiposOperacao.length ? db.tiposOperacao.bulkPut(tiposOperacao) : null,
          cidades && cidades.length ? db.cidades.bulkPut(cidades) : null,
          cidadesCSV && cidadesCSV.length ? db.cidadesCSV.bulkPut(cidadesCSV) : null,
        ]);


      });

    // Atualizar data de última sincronização no usuário
    const novaDataSincronizacao = format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS');
    await db.currentUser.update('currentUser', { dataUltimaSincronizacao: novaDataSincronizacao });

    showNotification('Sincronização realizada com sucesso!', 'success');

  } catch (error) {
    console.log(error)
    showNotification(`Erro na sincronização completa: ${error.message}`, 'error');
  }

};

// Método acessível pelo db.js
export const syncDataFromDB = async (user) => {
  try {
    await completeSync(console.log, user);
  } catch (error) {
    console.error('Erro ao sincronizar dados do IndexedDB:', error);
  }
};
