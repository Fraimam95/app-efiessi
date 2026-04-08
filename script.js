let listaDeModulos = [];
let contadorId = 0;
let idEmEdicao = null; 
const TAXA_JUROS = 1.19; 

let ambienteAtual = "Cozinha"; 

const catalogoPecas = {
    "Cozinha": [
        { val: "comum", txt: "Módulo Comum (Portas/Prateleiras)" },
        { val: "gaveteiro", txt: "Módulo de Gavetas" },
        { val: "basculante", txt: "Aéreo Basculante" }
    ],
    "Quarto": [
        { val: "guardaroupa", txt: "Guarda-Roupa Planejado (Inteligente)" },
        { val: "comum", txt: "Painel / Cabeceira" },
        { val: "gaveteiro", txt: "Mesa de Cabeceira / Cômoda" }
    ],
    "Banheiro": [
        { val: "comum", txt: "Gabinete de Pia" },
        { val: "gaveteiro", txt: "Gabinete com Gavetas" }
    ],
    "Sala": [
        { val: "comum", txt: "Painel de TV" },
        { val: "gaveteiro", txt: "Rack com Gavetas" }
    ]
};

function selecionarAmbiente(amb, elementoAba) {
    ambienteAtual = amb;
    document.getElementById('tituloAmbienteForm').innerText = `🪑 Adicionar à ${amb}`;
    
    let abas = document.querySelectorAll('.aba');
    abas.forEach(aba => aba.classList.remove('ativa'));
    if(elementoAba) elementoAba.classList.add('ativa');

    let selectTipo = document.getElementById("tipoModulo");
    selectTipo.innerHTML = "";
    catalogoPecas[amb].forEach(peca => {
        let opt = document.createElement('option');
        opt.value = peca.val;
        opt.innerText = peca.txt;
        selectTipo.appendChild(opt);
    });

    verificarCamposDinamicos();
}

function verificarCamposDinamicos() {
    let tipo = document.getElementById("tipoModulo").value;
    let divCampos = document.getElementById("divCamposExtras");
    let divMods = document.getElementById("divInputModulos");
    let divGavs = document.getElementById("divInputGavetas");
    let lblGavs = document.getElementById("labelGavetas");
    let divPortas = document.getElementById("divInputPortas"); // Novo

    divCampos.style.display = "none";
    divMods.style.display = "none";
    divGavs.style.display = "none";
    
    // Proteção caso o divInputPortas não exista no HTML ainda
    if (divPortas) divPortas.style.display = "none";

    if (tipo === "guardaroupa") {
        divCampos.style.display = "block";
        divMods.style.display = "block";
        divGavs.style.display = "block";
        if (divPortas) divPortas.style.display = "block";
        lblGavs.innerText = "Qtd. Gavetas Internas";
    } else if (tipo === "gaveteiro" || tipo === "basculante") {
        divCampos.style.display = "block";
        divGavs.style.display = "block";
        lblGavs.innerText = tipo === "gaveteiro" ? "Qtd. de Gavetas" : "Qtd. Basculantes";
    }
}

function calcularPreco(largMM, altMM, profMM, valCaixa, valPorta, valTampo, tipo, qtdModulos, qtdGavetas, sisPortas) {
    let altM = altMM / 1000;
    let largM = largMM / 1000;
    let profM = profMM / 1000; 

    let custoM2Branco = 50; 
    let custoM2Cor = 144; 
    let custoCorredica = 20; 
    let custoDobradica = 4; 
    let margemLucro = 3; 
    
    let resultado = { precoFinal: 0, detalhesHTML: "" };

    if(tipo === "guardaroupa") {
        let largMod = largM / qtdModulos; 
        let peças = [];

        // Tamponamento
        let m2Tampo = 0;
        if (valTampo !== 'sem') {
            m2Tampo = (altM * profM * 2); 
            peças.push({ nome: "Tamponamento Ext.", qtd: 2, alt: altM, larg: profM, m2: m2Tampo });
        }

        // Laterais
        let altLat = altM - 0.05; 
        let profLat = profM - 0.03; 
        let m2Lat = altLat * profLat * (qtdModulos * 2);
        peças.push({ nome: "Laterais", qtd: qtdModulos * 2, alt: altLat, larg: profLat, m2: m2Lat });

        // Bases
        let largBase = largMod - 0.01;
        let m2Base = largBase * profLat * (qtdModulos * 2);
        peças.push({ nome: "Bases", qtd: qtdModulos * 2, alt: profLat, larg: largBase, m2: m2Base });

        // Prateleiras
        let profPrat = profM - 0.05;
        let m2Prat = largBase * profPrat * (qtdModulos * 2);
        peças.push({ nome: "Prateleiras", qtd: qtdModulos * 2, alt: profPrat, larg: largBase, m2: m2Prat });

        // Rodapés
        let m2Rodape = largBase * 0.1 * (qtdModulos * 2);
        peças.push({ nome: "Rodapés", qtd: qtdModulos * 2, alt: 0.10, larg: largBase, m2: m2Rodape });

        // Fundos
        let m2Fundo = (altM - 0.15) * (largMod + 0.02) * qtdModulos;
        peças.push({ nome: "Fundos Traseiros", qtd: qtdModulos, alt: (altM - 0.15), larg: (largMod + 0.02), m2: m2Fundo });

        // Portas
        let altPorta = altM - 0.054;
        let largPorta = (largMod / 2) + 0.006;
        let m2Portas = altPorta * largPorta * (qtdModulos * 2);
        peças.push({ nome: "Portas", qtd: qtdModulos * 2, alt: altPorta, larg: largPorta, m2: m2Portas });

        // Gavetas
        let m2FrenteGav = 0;
        let m2CaixaGav = 0;
        if (qtdGavetas > 0) {
            m2FrenteGav = 0.15 * (largMod - 0.016) * qtdGavetas;
            peças.push({ nome: "Frentes de Gaveta", qtd: qtdGavetas, alt: 0.15, larg: (largMod - 0.016), m2: m2FrenteGav });
            
            m2CaixaGav = 0.654 * 0.45 * qtdGavetas; 
            peças.push({ nome: "Caixas/Fundos Gav.", qtd: qtdGavetas, alt: 0.65, larg: 0.45, m2: m2CaixaGav });
        }

        // --- SOMA DE CUSTOS ---
        let totalM2Caixa = (m2Lat + m2Base + m2Prat + m2Rodape + m2Fundo + m2CaixaGav) * 1.10; // +10% Perda
        let totalM2Portas = (m2Portas + m2FrenteGav) * 1.10;
        
        let custoCaixa = totalM2Caixa * (valCaixa === 'cor' ? custoM2Cor : custoM2Branco);
        let custoPortas = totalM2Portas * (valPorta === 'cor' ? custoM2Cor : custoM2Branco);
        if(valPorta === 'vidro') custoPortas = totalM2Portas * 350; 
        let custoAcabamento = (m2Tampo * 1.10) * (valTampo === 'cor' ? custoM2Cor : custoM2Branco);

        // --- LÓGICA DE PORTAS (GIRO OU CORRER) ---
        let qtdPortas = qtdModulos * 2; 
        let ferragensPortas = 0;
        let textoInsumosPortas = "";

        if (sisPortas === "correr") {
            let custoKitTrilho = 200;
            let custoRoldanas = qtdPortas * 2 * 35; // 2 roldanas por porta
            ferragensPortas = custoKitTrilho + custoRoldanas;
            textoInsumosPortas = `Kit Trilho Correr + ${qtdPortas * 2} Roldanas`;
        } else {
            let dobradicasPorPorta = altM > 2.2 ? 5 : 4; 
            let totalDobradicas = qtdPortas * dobradicasPorPorta;
            ferragensPortas = totalDobradicas * custoDobradica; 
            textoInsumosPortas = `${totalDobradicas} Dobradiças`;
        }
        
        let ferragensGavetas = qtdGavetas * custoCorredica;
        let insumos = 50 + 116.50 + 20.40; // Parafusos, Fita e Cabideiros

        let custoTotalFabrica = custoCaixa + custoPortas + custoAcabamento + ferragensPortas + ferragensGavetas + insumos;
        resultado.precoFinal = custoTotalFabrica * margemLucro;

        // --- GERAÇÃO DA TABELA HTML (RAIO-X) ---
        let linhasTabela = "";
        peças.forEach(p => {
            linhasTabela += `
            <tr>
                <td>${p.nome}</td>
                <td style="text-align: center;">${p.qtd}</td>
                <td style="text-align: center;">${p.alt.toFixed(2)} x ${p.larg.toFixed(2)}</td>
                <td style="text-align: right;">${p.m2.toFixed(2)} m²</td>
            </tr>`;
        });

        resultado.detalhesHTML = `
            <div style="background: #f1f8ff; border: 1px solid #b8daff; padding: 12px; margin-top: 15px; border-radius: 6px;">
                <strong style="color: #0056b3; font-size: 13px;">📊 Modo Depuração: Plano de Corte Gerado</strong><br>
                <p style="font-size: 11px; color: #666; margin-top: 2px;">Simulação de quebra de peças para este módulo.</p>
                
                <table class="tabela-raiox">
                    <thead>
                        <tr>
                            <th>Peça</th>
                            <th style="text-align: center;">Qtd.</th>
                            <th style="text-align: center;">Medida (A x L)</th>
                            <th style="text-align: right;">Área Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${linhasTabela}
                    </tbody>
                </table>
                
                <div style="font-size: 11px; margin-top: 10px; color: #444;">
                    <strong>Insumos:</strong> ${textoInsumosPortas} | ${qtdGavetas} Corrediças | R$ ${insumos.toFixed(2)} Diversos (Fita/Parafusos)<br>
                    <strong>Resumo de Área (C/ Perda):</strong> Caixa ${(totalM2Caixa).toFixed(2)}m² | Portas ${(totalM2Portas).toFixed(2)}m²
                </div>
                
                <hr style="border: 0; border-top: 1px dashed #b8daff; margin: 10px 0;">
                <div style="display: flex; justify-content: space-between; font-size: 12px;">
                    <span style="color: #dc3545; font-weight: bold;">Custo de Produção: R$ ${custoTotalFabrica.toFixed(2)}</span>
                    <span style="color: #28a745; font-weight: bold;">Margem: ${margemLucro}x</span>
                </div>
            </div>
        `;

        return resultado;
    } 
    else {
        // Cálculo Simples para módulos comuns
        let m2 = largM * altM;
        let precoEstimado = m2 * 1250; 
        
        if (valCaixa === 'cor') precoEstimado *= 1.15; 
        if (valPorta === 'cor') precoEstimado *= 1.20;
        else if (valPorta === 'vidro') precoEstimado *= 1.45;
        if (valTampo === 'branco') precoEstimado += (m2 * 220);
        else if (valTampo === 'cor') precoEstimado += (m2 * 380);
        
        if (tipo === "gaveteiro") precoEstimado += (75 * qtdGavetas);
        if (tipo === "basculante") precoEstimado += (55 * qtdGavetas);
        
        resultado.precoFinal = precoEstimado;
        resultado.detalhesHTML = `<div style="font-size: 10px; color: #aaa; margin-top: 8px;">(Cálculo baseado em preço genérico por m² frontal para peças simples)</div>`;
        return resultado;
    }
}

function salvarModulo() {
    let cNome = document.getElementById("clienteNome").value;
    if (!cNome) { alert("Preencha 'Os Seus Dados' primeiro!"); return; }

    let ambiente = ambienteAtual;
    let tipo = document.getElementById("tipoModulo").value;
    let qtdModulos = parseInt(document.getElementById("qtdModulos").value) || 1;
    let qtdGavetas = parseInt(document.getElementById("qtdGavetas").value) || 0;
    let nome = document.getElementById("nomeModulo").value;
    let largMM = parseFloat(document.getElementById("largura").value);
    let altMM = parseFloat(document.getElementById("altura").value);
    let profMM = parseFloat(document.getElementById("profundidade").value);
    
    if (!nome || !largMM || !altMM || !profMM) { alert("Preencha todas as medidas!"); return; }

    // --- TRAVAS DE MEDIDA (Limites de Fabricação) ---
    if (altMM > 2700) {
        alert("A altura máxima permitida para fabricação é de 2700mm.");
        return;
    }
    if (profMM > 1800) {
        alert("A profundidade máxima permitida para fabricação é de 1800mm.");
        return;
    }

    let cx = document.getElementById("caixaria");
    let pt = document.getElementById("portas");
    let tp = document.getElementById("tamponamento");

    // Captura o sistema de portas se for guarda-roupa
    let sisPortasObj = document.getElementById("sistemaPortasQuarto");
    let sisPortas = (tipo === 'guardaroupa' && sisPortasObj) ? sisPortasObj.value : 'giro';

    let calculo = calcularPreco(largMM, altMM, profMM, cx.value, pt.value, tp.value, tipo, qtdModulos, qtdGavetas, sisPortas);
    
    let textoQtd = "";
    if(tipo === 'gaveteiro') textoQtd = ` (${qtdGavetas} Gavetas)`;
    if(tipo === 'basculante') textoQtd = ` (${qtdGavetas} Basculantes)`;
    if(tipo === 'guardaroupa') {
        let txtPorta = sisPortas === 'correr' ? 'Portas de Correr' : 'Portas de Giro';
        textoQtd = ` (${qtdModulos} Módulos / ${qtdGavetas} Gav. / ${txtPorta})`;
    }

    let dadosModulo = {
        id: idEmEdicao || ++contadorId,
        ambiente, tipo, qtdModulos, qtdGavetas, nomePuro: nome,
        nome: nome + textoQtd,
        largMM, altMM, profMM, sisPortas,
        preco: calculo.precoFinal,
        relatorioTecnico: calculo.detalhesHTML, 
        valCaixaria: cx.value, valPortas: pt.value, valTamponamento: tp.value,
        descCaixa: cx.options[cx.selectedIndex].text,
        descPorta: pt.options[pt.selectedIndex].text,
        descTampo: tp.options[tp.selectedIndex].text
    };

    if (idEmEdicao) {
        let idx = listaDeModulos.findIndex(m => m.id === idEmEdicao);
        listaDeModulos[idx] = dadosModulo;
        cancelarEdicao();
    } else {
        listaDeModulos.push(dadosModulo);
        document.getElementById("nomeModulo").value = "";
        document.getElementById("largura").value = "";
    }

    atualizarTela();
}

function prepararEdicao(id) {
    let m = listaDeModulos.find(i => i.id === id);
    idEmEdicao = id;
    
    let abas = document.querySelectorAll('.aba');
    selecionarAmbiente(m.ambiente, Array.from(abas).find(a => a.innerText.includes(m.ambiente)));

    document.getElementById("tipoModulo").value = m.tipo;
    document.getElementById("qtdModulos").value = m.qtdModulos || 1;
    document.getElementById("qtdGavetas").value = m.qtdGavetas || 0;
    document.getElementById("nomeModulo").value = m.nomePuro;
    document.getElementById("largura").value = m.largMM;
    document.getElementById("altura").value = m.altMM;
    document.getElementById("profundidade").value = m.profMM;
    document.getElementById("caixaria").value = m.valCaixaria;
    document.getElementById("portas").value = m.valPortas;
    document.getElementById("tamponamento").value = m.valTamponamento;
    
    verificarCamposDinamicos();
    
    let sisPortasObj = document.getElementById("sistemaPortasQuarto");
    if(m.tipo === "guardaroupa" && sisPortasObj) sisPortasObj.value = m.sisPortas || "giro";

    document.getElementById("tituloPainel").innerText = "Alterar Peça";
    document.getElementById("btnPrincipal").innerText = "Atualizar Peça";
    document.getElementById("btnPrincipal").style.background = "var(--accent)";
    document.getElementById("btnPrincipal").style.color = "#000";
    document.getElementById("btnCancelar").style.display = "block";
}

function cancelarEdicao() {
    idEmEdicao = null;
    document.getElementById("tituloPainel").innerText = "Monte o seu Projeto";
    document.getElementById("btnPrincipal").innerText = "+ Adicionar ao Projeto";
    document.getElementById("btnPrincipal").style.background = "var(--primary)";
    document.getElementById("btnPrincipal").style.color = "#fff";
    document.getElementById("btnCancelar").style.display = "none";
    document.getElementById("nomeModulo").value = "";
}

function removerModulo(id) {
    listaDeModulos = listaDeModulos.filter(m => m.id !== id);
    atualizarTela();
}

function aplicarCoresEmLote(amb) {
    let cx = document.getElementById("caixaria");
    let pt = document.getElementById("portas");
    let tp = document.getElementById("tamponamento");

    if(!confirm(`Deseja pintar todos os móveis do(a) ${amb} com as cores atuais?`)) return;

    listaDeModulos.forEach(m => {
        if (m.ambiente === amb) {
            m.valCaixaria = cx.value; m.descCaixa = cx.options[cx.selectedIndex].text;
            m.valPortas = pt.value; m.descPorta = pt.options[pt.selectedIndex].text;
            m.valTamponamento = tp.value; m.descTampo = tp.options[tp.selectedIndex].text;
            
            let calc = calcularPreco(m.largMM, m.altMM, m.profMM, m.valCaixaria, m.valPortas, m.valTamponamento, m.tipo, m.qtdModulos, m.qtdGavetas, m.sisPortas);
            m.preco = calc.precoFinal;
            m.relatorioTecnico = calc.detalhesHTML;
        }
    });
    atualizarTela();
}

function atualizarTela() {
    let area = document.getElementById("listaAmbientes");
    let areaTotais = document.getElementById("areaTotais");
    let secaoPagamento = document.getElementById("secaoPagamento");
    let secaoDadosCliente = document.getElementById("secaoDadosCliente");
    
    area.innerHTML = "";
    let totalGeral = 0;
    let entrada = parseFloat(document.getElementById("valorEntrada").value) || 0;
    let parcelas = parseInt(document.getElementById("qtdParcelas").value) || 1;

    if (listaDeModulos.length === 0) {
        area.innerHTML = '<p style="text-align: center; color: #999; margin-top: 40px; margin-bottom: 40px;">Seu projeto ainda está vazio. Comece adicionando um móvel!</p>';
        secaoPagamento.style.display = "none"; 
        secaoDadosCliente.style.display = "block"; 
        salvarNoLocalStorage(); 
        return;
    }

    secaoPagamento.style.display = "block"; 
    secaoDadosCliente.style.display = "none"; 

    let ambs = [...new Set(listaDeModulos.map(m => m.ambiente))];
    
    ambs.forEach(a => {
        let itens = listaDeModulos.filter(m => m.ambiente === a);
        let subtotalAmbiente = itens.reduce((acc, cur) => acc + cur.preco, 0);
        totalGeral += subtotalAmbiente;

        // <details> NÃO POSSUI 'open', PORTANTO NASCE FECHADO!
        let html = `<details><summary><div style="display: flex; align-items: center;"><span class="icone-expandir">▼</span><span style="font-size: 15px;">${a} <small style="color:#888; font-weight:normal; margin-left:5px;">(${itens.length} peças)</small></span></div><span>${subtotalAmbiente.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</span></summary>`;
        
        itens.forEach(m => {
            let refParcela = (m.preco * TAXA_JUROS) / parcelas;
            let textoRef = parcelas > 1 ? `<span class="preco-parcelado">💳 Ref. se 100% Cartão: ${parcelas}x de ${refParcela.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</span>` : "";

            html += `
            <div class="item-modulo">
                <div class="item-linha-principal">
                    <div>
                        <strong>${m.nome}</strong> <small>(${m.largMM}x${m.altMM}x${m.profMM}mm)</small><br>
                        <span style="font-size: 11px; color: #888;">${m.descCaixa} | ${m.descPorta} | ${m.descTampo}</span><br>
                    </div>
                    <div class="info-preco">
                        <span class="preco-vista">${m.preco.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</span>
                        ${textoRef}
                    </div>
                    <div style="display:flex; flex-direction:column; gap:5px; margin-left: 15px;">
                        <button class="btn-editar" onclick="prepararEdicao(${m.id})">✏️ Editar</button>
                        <button class="btn-remover" onclick="removerModulo(${m.id})">🗑️ Apagar</button>
                    </div>
                </div>
                ${m.relatorioTecnico}
            </div>`;
        });
        html += `<button class="btn-lote" onclick="aplicarCoresEmLote('${a}')">🎨 Pintar todos os móveis deste ambiente com as cores atuais</button></details>`;
        area.innerHTML += html;
    });

    if (entrada > totalGeral) entrada = totalGeral;
    let saldoParaCartao = totalGeral - entrada;
    let saldoComJuros = saldoParaCartao * TAXA_JUROS;
    let valorDaParcela = saldoComJuros / parcelas;

    let htmlTotais = `<div style="font-size: 22px; color: var(--text); font-weight: bold; margin-top: 10px; border-top: 1px solid #ddd; padding-top: 10px;">Valor Total Estimado: ${totalGeral.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</div>`;
    if (entrada > 0) htmlTotais += `<div style="color: var(--secondary); font-weight: bold; font-size: 18px; margin-top: 5px;">- Simulação PIX: ${entrada.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</div>`;
    
    if (saldoParaCartao > 0) {
        if (parcelas === 1) htmlTotais += `<div style="margin-top: 15px; font-size: 24px; color: var(--primary); font-weight: bold;">Falta pagar: ${saldoParaCartao.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</div>`;
        else htmlTotais += `<div style="margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 15px;"><span style="color: #666; font-size: 14px;">💳 Simulação no Cartão:</span><br><span style="font-size: 28px; color: var(--primary); font-weight: 900;">${parcelas}x de ${valorDaParcela.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</span><br><small style="font-size:11px; color:#aaa;">(O parcelamento inclui taxa de operadora. Total a prazo R$ ${saldoComJuros.toLocaleString('pt-BR')})</small></div>`;
    } else htmlTotais += `<div style="margin-top: 15px; color: var(--secondary); font-size: 20px; font-weight: bold;">✅ Projeto 100% simulado à vista!</div>`;

    areaTotais.innerHTML = htmlTotais;
    salvarNoLocalStorage();
}

function salvarNoLocalStorage() {
    let dadosGerais = {
        nome: document.getElementById("clienteNome").value,
        telefone: document.getElementById("clienteTelefone").value,
        endereco: document.getElementById("clienteEndereco").value,
        entrada: document.getElementById("valorEntrada").value,
        parcelas: document.getElementById("qtdParcelas").value
    };

    localStorage.setItem('orcamento_efiessi_b2c', JSON.stringify(listaDeModulos));
    localStorage.setItem('contador_id_b2c', contadorId);
    localStorage.setItem('dados_gerais_b2c', JSON.stringify(dadosGerais));
}

function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem('orcamento_efiessi_b2c');
    const contadorSalvo = localStorage.getItem('contador_id_b2c');
    const dadosGeraisSalvos = localStorage.getItem('dados_gerais_b2c');

    if (dadosSalvos) {
        listaDeModulos = JSON.parse(dadosSalvos);
        contadorId = parseInt(contadorSalvo) || 0;
    }

    if (dadosGeraisSalvos) {
        let dadosGerais = JSON.parse(dadosGeraisSalvos);
        document.getElementById("clienteNome").value = dadosGerais.nome || "";
        document.getElementById("clienteTelefone").value = dadosGerais.telefone || "";
        document.getElementById("clienteEndereco").value = dadosGerais.endereco || "";
        document.getElementById("valorEntrada").value = dadosGerais.entrada || "";
        if(dadosGerais.parcelas) document.getElementById("qtdParcelas").value = dadosGerais.parcelas;
    }

    atualizarTela();
    verificarCamposDinamicos(); 
}

function limparOrcamento() {
    if(confirm("Deseja realmente apagar todas as peças e começar um novo projeto?")) {
        listaDeModulos = [];
        contadorId = 0;
        document.getElementById("clienteNome").value = "";
        document.getElementById("clienteTelefone").value = "";
        document.getElementById("clienteEndereco").value = "";
        document.getElementById("valorEntrada").value = "";
        localStorage.clear();
        atualizarTela();
    }
}

function enviarWhatsApp() {
    if (listaDeModulos.length === 0) return;
    let nome = document.getElementById("clienteNome").value || "Visitante do Site";
    let telefone = document.getElementById("clienteTelefone").value || "Não informado";
    let endereco = document.getElementById("clienteEndereco").value || "Não informado";

    let txt = `Olá Efiessi Planejados! 👋\n\nMontei o meu projeto no simulador do site e gostaria de conversar com um consultor. Seguem os detalhes da minha simulação:\n\n`;
    txt += `👤 *Meu Nome:* ${nome}\n📞 *Contato:* ${telefone}\n📍 *Local:* ${endereco}\n\n`;
    
    let entrada = parseFloat(document.getElementById("valorEntrada").value) || 0;
    let parcelas = parseInt(document.getElementById("qtdParcelas").value) || 1;
    let totalGeral = listaDeModulos.reduce((acc, cur) => acc + cur.preco, 0);

    if (entrada > totalGeral) entrada = totalGeral;
    let saldoParaCartao = totalGeral - entrada;

    txt += `➖➖➖➖➖➖➖➖\n*MÓVEIS QUE EU CONFIGUREI:*\n`;
    listaDeModulos.forEach(m => {
        txt += `\n*${m.ambiente}* - ${m.nome}\n`;
        txt += `📏 ${m.largMM}x${m.altMM}x${m.profMM}mm\n`;
        txt += `🎨 Cores: ${m.descCaixa} / ${m.descPorta}\n`;
        txt += `💰 Valor estimado: ${m.preco.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}\n`;
    });
    
    txt += `\n➖➖➖➖➖➖➖➖\n*COMO PENSEI EM PAGAR:*\n`;
    txt += `🛒 *Total dos Móveis:* ${totalGeral.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}\n`;
    
    if (entrada > 0) txt += `💵 *Daria no PIX:* ${entrada.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}\n`;
    
    if (saldoParaCartao > 0 && parcelas > 1) {
        let saldoComJuros = saldoParaCartao * TAXA_JUROS;
        let valorDaParcela = saldoComJuros / parcelas;
        txt += `💳 *Parcelaria em:* ${parcelas}x de ${valorDaParcela.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}`;
    } else if (saldoParaCartao > 0 && parcelas === 1) {
        txt += `💵 *Restante à vista:* ${saldoParaCartao.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}`;
    }
    txt += `\n\nPodemos agendar para refinar este projeto?`;
    window.open(`https://wa.me/5521983254365?text=${encodeURIComponent(txt)}`, '_blank');
}

function gerarPDF() {
    if (listaDeModulos.length === 0) return;
    let nome = document.getElementById("clienteNome").value || "Cliente";
    let telefone = document.getElementById("clienteTelefone").value || "Não informado";
    let endereco = document.getElementById("clienteEndereco").value || "Não informado";
    let dataAtual = new Date().toLocaleDateString('pt-BR');

    let totalGeral = listaDeModulos.reduce((acc, cur) => acc + cur.preco, 0);
    let entrada = parseFloat(document.getElementById("valorEntrada").value) || 0;
    let parcelas = parseInt(document.getElementById("qtdParcelas").value) || 1;

    if (entrada > totalGeral) entrada = totalGeral;
    let saldoParaCartao = totalGeral - entrada;
    let saldoComJuros = saldoParaCartao * TAXA_JUROS;
    let valorDaParcela = saldoComJuros / parcelas;

    let htmlPDF = `
        <div style="padding: 10px 20px; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #333;">
            <div style="border-bottom: 3px solid #1a3a5f; padding-bottom: 10px; margin-bottom: 20px;">
                <h1 style="color: #1a3a5f; margin: 0; font-size: 42px; font-family: 'Dancing Script', cursive; font-weight: 700;">Efiessi Planejados</h1>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">Proposta Comercial e Simulação de Projeto</p>
            </div>
            
            <table style="width: 100%; margin-bottom: 25px; font-size: 13px;">
                <tr>
                    <td><strong>Projeto de:</strong> ${nome}</td>
                    <td style="text-align: right;"><strong>Data:</strong> ${dataAtual}</td>
                </tr>
                <tr>
                    <td><strong>Contato:</strong> ${telefone}</td>
                    <td style="text-align: right;"><strong>Local:</strong> ${endereco}</td>
                </tr>
            </table>
            
            <h2 style="color: #1a3a5f; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Móveis do Projeto</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px;">
                <thead>
                    <tr style="background-color: #f0f2f5;">
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Ambiente / Peça</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Cores e Materiais</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Valor Estimado</th>
                    </tr>
                </thead>
                <tbody>
    `;

    listaDeModulos.forEach(m => {
        htmlPDF += `
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">
                    <strong style="color: #1a3a5f;">${m.ambiente}</strong><br>
                    ${m.nome}<br>
                    <span style="color: #888; font-size: 10px;">Dimensões: ${m.largMM} x ${m.altMM} x ${m.profMM} mm</span>
                </td>
                <td style="padding: 10px; border: 1px solid #ddd;">
                    Interno: ${m.descCaixa}<br>
                    Externo: ${m.descPorta}
                </td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">
                    ${m.preco.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}
                </td>
            </tr>
        `;
    });

    htmlPDF += `
                </tbody>
            </table>
            
            <h2 style="color: #1a3a5f; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 30px;">Resumo Financeiro</h2>
            <table style="width: 100%; margin-top: 10px; font-size: 14px;">
                <tr>
                    <td>Valor Total dos Móveis:</td>
                    <td style="text-align: right;"><strong>${totalGeral.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</strong></td>
                </tr>
    `;

    if(entrada > 0) htmlPDF += `<tr><td style="padding-top: 8px; color: #28a745;">Simulação de Entrada (PIX/Dinheiro):</td><td style="padding-top: 8px; text-align: right; color: #28a745;"><strong>- ${entrada.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</strong></td></tr>`;

    if(saldoParaCartao > 0) {
         if (parcelas === 1) htmlPDF += `<tr><td style="padding-top: 12px; font-size: 16px; color: #1a3a5f;"><strong>Saldo a Pagar (À vista):</strong></td><td style="padding-top: 12px; text-align: right; font-size: 16px; color: #1a3a5f;"><strong>${saldoParaCartao.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</strong></td></tr>`;
         else htmlPDF += `<tr><td style="padding-top: 20px;"><strong style="color: #1a3a5f;">Simulação de Parcelamento:</strong><br><span style="font-size: 10px; color: #888;">*Valores com taxa da operadora de cartão já inclusa.</span></td><td style="padding-top: 20px; text-align: right; font-size: 18px; color: #1a3a5f;"><strong>${parcelas}x de ${valorDaParcela.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</strong></td></tr>`;
    } else htmlPDF += `<tr><td colspan="2" style="padding-top: 15px; text-align: center; color: #28a745; font-weight: bold;">Projeto simulado 100% à vista.</td></tr>`;

    htmlPDF += `
            </table>
            
            <div style="margin-top: 35px; background-color: #f8f9fa; padding: 15px; border-radius: 6px; border: 1px solid #eaeaea;">
                <h3 style="color: #1a3a5f; font-size: 14px; margin-top: 0; margin-bottom: 8px;">📋 Informações Importantes</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 11px; line-height: 1.6;">
                    <li><strong>Validade:</strong> Esta simulação de valores é válida por <strong>10 dias úteis</strong>.</li>
                    <li><strong>Prazo de Entrega:</strong> Estimativa de <strong>30 a 45 dias úteis</strong> após a assinatura do contrato e medição técnica final no local.</li>
                    <li><strong>Garantia de Qualidade:</strong> Oferecemos <strong>5 anos de garantia</strong> contra defeitos de fabricação em ferragens e MDF.</li>
                    <li><strong>Aviso:</strong> Este documento é uma simulação gerada automaticamente. Os valores finais podem sofrer pequenos ajustes após a visita técnica da nossa equipa de montagem.</li>
                </ul>
            </div>
        </div>
    `;

    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlPDF;
    let nomeArquivo = 'Projeto_Efiessi_' + nome.replace(/\s+/g, '_') + '.pdf';

    html2pdf().from(tempDiv).set({
        margin: [10, 10, 10, 10], 
        filename: nomeArquivo,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save();
}

window.onload = function() {
    // Como você dividiu em arquivos, verifica se os elementos existem antes de chamar
    let abaCozinha = document.querySelector('.aba.ativa');
    if (abaCozinha) selecionarAmbiente('Cozinha', abaCozinha);
    
    carregarDoLocalStorage();
};