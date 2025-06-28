import Dexie from 'dexie';
import { syncDataFromDB } from '../services/sync/completeDataSync';

// Criação do banco de dados
const db = new Dexie('ClientesDB');

// Configuração das versões e tabelas
db.version(27).stores({
  // Tabelas existentes
  clientes: '++id, nome, cpf, cnpj,documento, endereco, bairro, cidade, estado, cep, telefone, email, status, isDeleted, [nome+cpf], [cidade+estado],numero,sincronismo,idCliente,complemento,codigo',
 
  pedidos: `
  ++idLocal,
  idPedido,
   uuidMobile,
  numeroPedido, 
  idCliente, 
  descricao, 
  status, 
  metodoPagamento, 
  dataPedido, 
  observacoes, 
  valorTotal, 
  valorFrete, 
  valorDesconto, 
  idCondicaoPagamento, 
  sincronismo, 
  status_nota, 
  status_sefaz, 
  [numeroPedido+idCliente]
`,

itensPedido: `
  ++id, 
  idPedido, 
  idProduto, 
  quantidade, 
  valorUnitario, 
  valorTotal, 
  codigoProduto,
  descricaoProduto, 
  sincronismo, 
  [idPedido+idProduto]
`,

ultimoUsuarioLogado: '++id, idVendedor',
  cidades: '++id, nome, sigla',
  currentUser: 'id, token, empresa, matriz, vendedorModel,dataUltimaSincronizacao',
  vendedorModel: '++idLocal,id, nome, status, codigoVendedor',
  produtos: '++id, codigoProduto, descricao, unidade, medida, pesoBruto, idSubgrupoProduto, idProdutoPrecificacao, idProduto, inclusao, embalagemTransporte, quantidadeDisponivel, financeiroVenda, qtdProdVendidaMes, codigoEan, [codigoProduto+descricao]',
  ramosDeAtividade: '++id, idRamoAtividade, descricao, [idRamoAtividade+descricao]',
  tiposOperacao: '++id, idNaturezaOperacao, descricaoCompleta, numero, inclusao, [idNaturezaOperacao+descricaoCompleta]',
  precos: '++id, idProdutoPrecificacao, precoPrazoAtacado, precoMinimoAtacado, precoMinimoVarejo, precoVistaAtacado, precoPrazoVarejo, precoVistaVarejo, financeiroVenda, promocao1, promocao2, inclusao, precoVistaAtacadoSt, precoPrazoAtacadoSt, precoVistaVarejoSt, precoPrazoVarejoSt, [idProdutoPrecificacao+precoPrazoAtacado]',
  formasPagamentos: '++id, idFormaPagamento, descricao, inclusao, [idFormaPagamento+descricao]',
  condicaoPagamento: '++id, idCondicaoPagamento, descricao, prazoMedio, inclusao, [idCondicaoPagamento+descricao],dias',
  empresa: '++id, descricaoFilial, logo,casasDecimaisValorUnitario,casasDecimaisQuantidadeProduto,casasDecimaisCustoProduto, [id+descricaoFilial]',
  vendedor: '++id, nome, status, [id+nome]',
  cidadesCSV: '++id, nome, localidadeSemAcentos, microrregiao, mesorregiao, estadoId,cepInicial, cepFinal, [nome+estadoId]',
  estadosCSV: '++id, nome, sigla, regiao, [nome+sigla]',
  themeSettings: 'id, mode, navbarColor, windowColor, fontSize'
});


// Inicialização de valores padrão, se necessário
db.on('populate', () => {
  db.themeSettings.add({
    id: 'default', // Chave fixa para as configurações de tema
    mode: 'light',
    navbarColor: '#673AB7',
    windowColor: '#FFFFFF',
    fontSize: 14,
  });
});





// Exporta o banco de dados
export default db;
