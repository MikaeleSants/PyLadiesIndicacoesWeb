const API_URL = "https://pyladiesindica-bddhcadba7bsgcgy.canadacentral-01.azurewebsites.net/profissionais";
const API_AREA = "https://pyladiesindica-bddhcadba7bsgcgy.canadacentral-01.azurewebsites.net/profissionais/area/";
const API_NOME = "https://pyladiesindica-bddhcadba7bsgcgy.canadacentral-01.azurewebsites.net/profissionais/nome/";

window.onload = () => {
    try {
        console.log('Inicializando script de profissionais');
        const selectArea = document.getElementById("area");
        const novaAreaInput = document.getElementById("nova-area");


        const searchType = document.getElementById("search-type");
        const searchInput = document.getElementById("search-input");
        const btnBuscar = document.getElementById("btn-buscar");
        const btnLimpar = document.getElementById("btn-limpar");

        let areasDisponiveis = [];

        const dataCriacaoInput = document.getElementById("data-criacao");
        const dataCriacaoExibicao = document.getElementById("data-criacao-exibicao");
        if (dataCriacaoInput) {
            const now = new Date();
            dataCriacaoInput.value = now.toISOString();
            if (dataCriacaoExibicao) {
                dataCriacaoExibicao.textContent = `Data de criação: ${now.toLocaleString('pt-BR')}`;
            }
            console.log(`Campo de data de criação inicializado: ${dataCriacaoInput.value}`);
        }


        function renderProfissionais(profissionais) {
            try {
                console.log(`Renderizando lista de profissionais: ${profissionais.length} registro(s)`);
                const tbody = document.querySelector("#tabela-profissionais tbody");
                tbody.innerHTML = "";

                const setCollapsed = (span, full, limit = 60) => {
                    span.dataset.full = full || "";
                    const texto = full || "";
                    const colapsado = texto.length > limit ? `${texto.slice(0, limit)}...` : texto;
                    span.textContent = colapsado;
                    span.dataset.state = "collapsed";
                };
                const toggleSpan = (span, btn, limit = 60) => {
                    const full = span.dataset.full || "";
                    const state = span.dataset.state || "collapsed";
                    if (state === "collapsed") {
                        span.textContent = full;
                        span.dataset.state = "expanded";
                        btn.textContent = "-";
                    } else {
                        const colapsado = full.length > limit ? `${full.slice(0, limit)}...` : full;
                        span.textContent = colapsado;
                        span.dataset.state = "collapsed";
                        btn.textContent = "+";
                    }
                };

                profissionais.forEach(p => {
                    console.log(`Renderizando profissional: ${p.nome || '<sem nome>'} (id: ${p.id || 'n/a'})`);
                    const tr = document.createElement("tr");

                    const extras = p.camposEspecificos
                        ? Object.entries(p.camposEspecificos)
                            .map(([chave, valor]) => `${chave}: ${valor}`)
                            .join(", ")
                        : "";

                    const descHas = !!(p.descricao && p.descricao.trim().length);
                    const extrasHas = !!(extras && extras.trim().length);

                    tr.innerHTML = `
                        <td>${p.nome && p.nome.trim().length ? p.nome : `<span class="muted">não fornecido</span>`}</td>
                        <td>${p.area && p.area.trim().length ? p.area : `<span class="muted">não fornecido</span>`}</td>
                        <td>
                            ${descHas ? `
                                <span class="collapsible-text" data-type="desc"></span>
                                <button type="button" class="toggle-btn toggle-purple" data-type="desc">+</button>
                            ` : `<span class="muted">não fornecido</span>`}
                        </td>
                        <td>${p.email && p.email.trim().length ? p.email : `<span class="muted">não fornecido</span>`}</td>
                        <td>${p.contato && p.contato.trim().length ? p.contato : `<span class="muted">não fornecido</span>`}</td>
                        <td>${p.linkedIn ? `<a href="${p.linkedIn}" target="_blank">LinkedIn</a>` : `<span class="muted">não fornecido</span>`}</td>
                        <td>${p.redeSocial && p.redeSocial.trim().length ? p.redeSocial : `<span class="muted">não fornecido</span>`}</td>
                        <td>
                            ${extrasHas ? `
                                <span class="collapsible-text" data-type="extras"></span>
                                <button type="button" class="toggle-btn toggle-purple" data-type="extras">+</button>
                            ` : `<span class="muted">não fornecido</span>`}
                        </td>
                        <td>
                            <button class="editar">Editar</button>
                            <button class="deletar">Deletar</button>
                        </td>
                    `;

                    if (descHas) {
                        const spanDesc = tr.querySelector('span.collapsible-text[data-type="desc"]');
                        const btnDesc = tr.querySelector('button.toggle-btn[data-type="desc"]');
                        setCollapsed(spanDesc, p.descricao);
                        btnDesc.addEventListener("click", () => toggleSpan(spanDesc, btnDesc));
                    }
                    if (extrasHas) {
                        const spanExtras = tr.querySelector('span.collapsible-text[data-type="extras"]');
                        const btnExtras = tr.querySelector('button.toggle-btn[data-type="extras"]');
                        setCollapsed(spanExtras, extras);
                        btnExtras.addEventListener("click", () => toggleSpan(spanExtras, btnExtras));
                    }

                    tr.querySelector(".editar").addEventListener("click", () => abrirEditar(p, tr));
                    tr.querySelector(".deletar").addEventListener("click", () => deletarProfissional(p.id));

                    tbody.appendChild(tr);
                });
            } catch (err) {
                console.error('Falha ao renderizar profissionais:', err);
            }
        }

        async function carregarProfissionais() {
            try {
                console.log('Iniciando carregamento de profissionais...');
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error("Erro ao carregar profissionais");
                const profissionais = await response.json();
                console.log(`Profissionais carregados: ${profissionais.length} registro(s)`);

                renderProfissionais(profissionais);
            } catch (err) {
                console.error('Falha ao carregar profissionais:', err);
            }
        }


        async function buscarProfissionais(tipo, termo) {
            termo = (termo || "").trim();
            if (!termo) {
                console.log('Termo de busca vazio — carregando todos os profissionais');
                return carregarProfissionais();
            }

            try {
                if (tipo === 'area') {
                    console.log(`Iniciando busca por área: ${termo}`);
                    const res = await fetch(`${API_AREA}${encodeURIComponent(termo)}`);
                    if (!res.ok) {
                        console.error(`Busca por área falhou com status: ${res.status}`);
                        return;
                    }
                    const dados = await res.json();
                    console.log(`Resultados da busca por área: ${dados.length} registro(s)`);
                    return renderProfissionais(dados);
                }


                console.log(`Iniciando busca por nome: ${termo}`);
                const res = await fetch(`${API_NOME}${encodeURIComponent(termo)}`);
                if (!res.ok) {
                    console.error(`Busca por nome falhou com status: ${res.status}`);
                    return;
                }
                const dados = await res.json();
                console.log(`Resultados da busca por nome: ${dados.length} registro(s)`);
                return renderProfissionais(dados);
            } catch (err) {
                console.error('Erro durante a busca:', err);
            }
        }


        if (btnBuscar) {
            btnBuscar.addEventListener('click', () => {
                const tipo = (searchType && searchType.value) || 'nome';
                const termo = (searchInput && searchInput.value) || '';
                console.log(`Ação de busca solicitada - tipo: ${tipo}, termo: ${termo}`);
                buscarProfissionais(tipo, termo);
            });
        }
        if (btnLimpar) {
            btnLimpar.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                console.log('Busca limpa pelo usuário — recarregando todos os profissionais');
                carregarProfissionais();
            });
        }


        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const tipo = (searchType && searchType.value) || 'nome';
                    const termo = searchInput.value || '';
                    console.log(`Busca acionada por Enter - tipo: ${tipo}, termo: ${termo}`);
                    buscarProfissionais(tipo, termo);
                }
            });
        }

        async function carregarAreas() {
            try {
                console.log('Iniciando carregamento de áreas...');
                const response = await fetch(API_AREA);
                if (!response.ok) throw new Error("Erro ao carregar áreas");
                const areas = await response.json();
                areasDisponiveis = areas;
                console.log(`Áreas carregadas: ${areasDisponiveis.length} item(ns)`);

                selectArea.innerHTML = '<option value="" disabled selected>Selecione uma área</option>';

                areasDisponiveis.forEach(area => {
                    const option = document.createElement("option");
                    option.value = area;
                    option.textContent = area;
                    selectArea.appendChild(option);
                });

                const outraOption = document.createElement("option");
                outraOption.value = "__outra__";
                outraOption.textContent = "Outra...";
                selectArea.appendChild(outraOption);
            } catch (err) {
                console.error('Falha ao carregar áreas:', err);
            }
        }

        selectArea.addEventListener("change", () => {
            console.log(`Área selecionada: ${selectArea.value}`);
            if (selectArea.value === "__outra__") {
                console.log('Opção Outra selecionada - exibindo campo para nova área');
                novaAreaInput.style.display = "block";
                novaAreaInput.focus();
            } else {
                novaAreaInput.style.display = "none";
            }
        });

        function adicionarCampoEspecifico() {
            console.log('Adicionando novo campo específico (UI)');
            const div = document.createElement("div");
            div.classList.add("campo-extra");
            div.innerHTML = `
                <input type="text" placeholder="Nome do campo">
                <input type="text" placeholder="Conteudo">
                <button type="button" class="remover">Remover</button>
            `;
            div.querySelector(".remover").addEventListener("click", () => div.remove());
            document.getElementById("campos-especificos").appendChild(div);
        }

        document.getElementById("adicionar-campo").addEventListener("click", adicionarCampoEspecifico);

        document.getElementById("form-profissional").addEventListener("submit", async (e) => {
            e.preventDefault();

            const nome = document.getElementById("nome").value;
            const descricao = document.getElementById("descricao").value;
            const email = document.getElementById("email").value;
            const contato = document.getElementById("contato").value;
            const linkedin = document.getElementById("linkedin").value;
            const redeSocial = document.getElementById("rede-social").value;
            const registradorNome = document.getElementById("registrador-nome").value;
            const registradorEmail = document.getElementById("registrador-email").value;
            const dataCriacaoInput = document.getElementById("data-criacao");
            const dataDeCriacao = dataCriacaoInput?.value || new Date().toISOString();


            let area = selectArea.value;

            console.log(`Submissão de formulário iniciada - nome: ${nome || '<sem nome>'}, área: ${area}`);

            if (area === "__outra__") {
                area = novaAreaInput.value.trim();
                if (area && !areasDisponiveis.includes(area)) {
                    areasDisponiveis.push(area);
                    const option = document.createElement("option");
                    option.value = area;
                    option.textContent = area;
                    selectArea.insertBefore(option, selectArea.lastChild);
                    console.log(`Nova área adicionada à lista: ${area}`);
                }
            }

            const camposEspecificos = {};
            document.querySelectorAll("#campos-especificos .campo-extra").forEach(div => {
                const inputs = div.querySelectorAll("input");
                const campoInput = inputs[0];
                const valorInput = inputs[1];
                if (campoInput && valorInput && campoInput.value && valorInput.value) {
                    camposEspecificos[campoInput.value] = valorInput.value;
                }
            });

            const profissional = { 
                nome, 
                area, 
                descricao, 
                email, 
                contato, 
                linkedIn: linkedin, 
                redeSocial, 
                registradorNome, 
                registradorEmail, 
                dataDeCriacao, 
                camposEspecificos 
            };

            console.log('Enviando requisição para criar profissional');
            try {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(profissional)
                });

                console.log(`Resposta do servidor (POST): ${response.status} ${response.statusText}`);

                if (!response.ok) {

                    let texto = '';
                    try { texto = await response.text(); } catch (e) { texto = '<sem corpo ou falha ao ler corpo>'; }
                    console.error('Falha ao criar profissional. Status:', response.status, 'Resposta:', texto);
                } else {
                    console.log('Criação do profissional confirmada pelo servidor.');
                }
            } catch (err) {
                console.error('Erro de rede ao enviar POST para criar profissional:', err);
            }
            console.log('Requisição POST (tentativa) concluída');

            e.target.reset();
            document.getElementById("campos-especificos").innerHTML = "";
            novaAreaInput.style.display = "none";
            if (dataCriacaoInput) {
                const now = new Date();
                dataCriacaoInput.value = now.toISOString();
                if (dataCriacaoExibicao) {
                    dataCriacaoExibicao.textContent = `Data de criação: ${now.toLocaleString('pt-BR')}`;
                }
            }
            carregarProfissionais();
        });


        (function attachSubmitButtonDiagnostic() {
            try {
                const form = document.getElementById('form-profissional');
                if (!form) return;
                const submitBtn = form.querySelector('button[type="submit"]');
                if (!submitBtn) return;

                submitBtn.addEventListener('click', (ev) => {

                    const valido = form.checkValidity();
                    console.log(`Botão Cadastrar clicado. Validação HTML5: ${valido ? 'ok' : 'inválido'}`);
                    if (!valido) {

                        form.reportValidity();
                        ev.preventDefault();
                        return;
                    }


                    try {
                        if (typeof form.requestSubmit === 'function') {
                            ev.preventDefault();
                            form.requestSubmit();
                        }
                    } catch (err) {
                        console.error('Erro ao tentar acionar o submit programaticamente:', err);
                    }
                });
            } catch (err) {
                console.error('Erro ao anexar diagnóstico ao botão de submit:', err);
            }
        })();

        function escapeHtml(str = "") {
            return String(str)
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll('"', "&quot;")
                .replaceAll("'", "&#39;");
        }

        function abrirEditar(profissional, tr) {
            if (!tr || tr.classList.contains("editing")) return;

            console.log(`Abrindo edição para profissional id: ${profissional.id || 'n/a'}, nome: ${profissional.nome || '<sem nome>'}`);
            tr.classList.add("editing");
            tr.dataset.original = tr.innerHTML;

            tr.innerHTML = `
            <td><input class="edit-nome" value="${escapeHtml(profissional.nome || "")} "></td>
            <td><input class="edit-area" value="${escapeHtml(profissional.area || "")} "></td>
            <td><input class="edit-descricao" value="${escapeHtml(profissional.descricao || "")} "></td>
            <td><input class="edit-email" value="${escapeHtml(profissional.email || "")} "></td>
            <td><input class="edit-contato" value="${escapeHtml(profissional.contato || "")} "></td>
            <td><input class="edit-linkedin" value="${escapeHtml(profissional.linkedIn || "")} "></td>
            <td><input class="edit-rede" value="${escapeHtml(profissional.redeSocial || "")} "></td>
            <td>${profissional.camposEspecificos ? escapeHtml(Object.entries(profissional.camposEspecificos).map(([k,v]) => `${k}: ${v}`).join(", ")) : ""}</td>
            <td>
                <button class="btn-salvar">Salvar</button>
                <button class="btn-cancelar">Cancelar</button>
            </td>
        `;

            tr.querySelector(".btn-cancelar").addEventListener("click", () => {
                console.log(`Edição cancelada para id: ${profissional.id || 'n/a'}`);
                tr.innerHTML = tr.dataset.original;
                tr.classList.remove("editing");
                delete tr.dataset.original;

                const btnEditar = tr.querySelector(".editar");
                const btnDeletar = tr.querySelector(".deletar");
                if (btnEditar) btnEditar.addEventListener("click", () => abrirEditar(profissional, tr));
                if (btnDeletar) btnDeletar.addEventListener("click", () => deletarProfissional(profissional.id));
            });

            tr.querySelector(".btn-salvar").addEventListener("click", async () => {
                const novosDados = {
                    nome: tr.querySelector(".edit-nome").value.trim(),
                    area: tr.querySelector(".edit-area").value.trim(),
                    descricao: tr.querySelector(".edit-descricao").value.trim(),
                    email: tr.querySelector(".edit-email").value.trim(),
                    contato: tr.querySelector(".edit-contato").value.trim(),
                    linkedIn: tr.querySelector(".edit-linkedin").value.trim(),
                    redeSocial: tr.querySelector(".edit-rede").value.trim(),
                    camposEspecificos: profissional.camposEspecificos || {}
                };

                try {
                    console.log(`Enviando atualização para profissional id: ${profissional.id || 'n/a'}`);
                    const response = await fetch(`${API_URL}/${profissional.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(novosDados)
                    });

                    if (!response.ok) {
                        console.error("Erro ao atualizar:", response.status);
                        alert("Falha ao atualizar.");
                        return;
                    }

                    console.log(`Atualização bem-sucedida para id: ${profissional.id || 'n/a'}`);
                    tr.classList.remove("editing");
                    delete tr.dataset.original;

                    const extrasText = novosDados.camposEspecificos
                        ? Object.entries(novosDados.camposEspecificos).map(([k,v]) => `${k}: ${v}`).join(", ")
                        : "";

                    tr.innerHTML = `
                    <td>${escapeHtml(novosDados.nome || "")}</td>
                    <td>${escapeHtml(novosDados.area || "")}</td>
                    <td>${escapeHtml(novosDados.descricao || "")}</td>
                    <td>${escapeHtml(novosDados.email || "")}</td>
                    <td>${escapeHtml(novosDados.contato || "")}</td>
                    <td>${novosDados.linkedIn ? `<a href="${escapeHtml(novosDados.linkedIn)}" target="_blank">LinkedIn</a>` : `<span class="muted">não fornecido</span>`}</td>
                    <td>${escapeHtml(novosDados.redeSocial || "")}</td>
                    <td>${escapeHtml(extrasText)}</td>
                    <td>
                        <button class="editar">Editar</button>
                        <button class="deletar">Deletar</button>
                    </td>
                `;

                    tr.querySelector(".editar").addEventListener("click", () => abrirEditar(Object.assign({ id: profissional.id }, novosDados), tr));
                    tr.querySelector(".deletar").addEventListener("click", () => deletarProfissional(profissional.id));
                } catch (err) {
                    console.error(err);
                    alert("Erro ao salvar alterações.");
                }
            });
        }

        async function deletarProfissional(id) {
            console.log(`Solicitando exclusão do profissional id: ${id}`);
            if (!confirm("Deseja realmente deletar este profissional?")) {
                console.log(`Exclusão cancelada para id: ${id}`);
                return;
            }

            const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

            if (response.ok) {
                console.log(`Profissional excluído com sucesso: id ${id}`);
                alert("Profissional deletado!");
                carregarProfissionais();
            } else {
                console.error(`Falha ao excluir profissional id: ${id}`);
            }
        }

        const tooltip = document.querySelector(".tooltip-icon");
        const descricao = document.querySelector(".descricao-campos");

        if (tooltip && descricao) {
            tooltip.addEventListener("click", () => {
                console.log('Alternando exibição da descrição dos campos adicionais');
                if (descricao.style.display === "none" || descricao.style.display === "") {
                    descricao.style.display = "block";
                } else {
                    descricao.style.display = "none";
                }
            });
        } else {
            console.log('Aviso: elementos de tooltip/descrição não foram encontrados no DOM');
        }

        carregarAreas();
        carregarProfissionais();
        console.log('Inicialização do script concluída');
    } catch (err) {
        console.error('Erro crítico ao inicializar o script:', err);
    }
};
