const API_URL = "https://pyladiesindicacoesintegracao.onrender.com/profissionais";
const API_AREA = "https://pyladiesindicacoesintegracao.onrender.com/profissionais/area/";

window.onload = () => {
    const selectArea = document.getElementById("area");
    const novaAreaInput = document.getElementById("nova-area");

    let areasDisponiveis = [];


    async function carregarProfissionais() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error("Erro ao carregar profissionais");
            const profissionais = await response.json();

            const tbody = document.querySelector("#tabela-profissionais tbody");
            tbody.innerHTML = "";

            profissionais.forEach(p => {
                const tr = document.createElement("tr");

                const extras = p.camposEspecificos
                    ? Object.entries(p.camposEspecificos)
                        .map(([chave, valor]) => `${chave}: ${valor}`)
                        .join(", ")
                    : "";

                tr.innerHTML = `
                    <td>${p.nome}</td>
                    <td>${p.area}</td>
                    <td>${p.contato}</td>
                    <td>${extras}</td>
                    <td>
                        <button class="editar">Editar</button>
                        <button class="deletar">Deletar</button>
                    </td>
                `;

                tr.querySelector(".editar").addEventListener("click", () => abrirEditar(p));
                tr.querySelector(".deletar").addEventListener("click", () => deletarProfissional(p.id));

                tbody.appendChild(tr);
            });
        } catch (err) {
            console.error(err);
        }
    }


    async function carregarAreas() {
        try {
            const response = await fetch(API_AREA);
            if (!response.ok) throw new Error("Erro ao carregar áreas");
            const areas = await response.json();
            areasDisponiveis = areas;

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
            console.error(err);
        }
    }


    selectArea.addEventListener("change", () => {
        if (selectArea.value === "__outra__") {
            novaAreaInput.style.display = "block";
            novaAreaInput.focus();
        } else {
            novaAreaInput.style.display = "none";
        }
    });


    function adicionarCampoEspecifico() {
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
        const email = document.getElementById("email").value;
        let area = selectArea.value;

        if (area === "__outra__") {
            area = novaAreaInput.value.trim();
            if (area && !areasDisponiveis.includes(area)) {
                areasDisponiveis.push(area);
                const option = document.createElement("option");
                option.value = area;
                option.textContent = area;
                selectArea.insertBefore(option, selectArea.lastChild);
            }
        }

        const contato = document.getElementById("contato").value;

        const camposEspecificos = {};
        document.querySelectorAll("#campos-especificos .campo-extra").forEach(div => {
            const [campoInput, valorInput] = div.querySelectorAll("input");
            if (campoInput.value && valorInput.value) {
                camposEspecificos[campoInput.value] = valorInput.value;
            }
        });

        const profissional = { nome, email, area, contato, camposEspecificos };

        await fetch(API_URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(profissional)
        });

        e.target.reset();
        document.getElementById("campos-especificos").innerHTML = "";
        novaAreaInput.style.display = "none";
        carregarProfissionais();
    });


    function abrirEditar(profissional) {
        const tbody = document.querySelector("#tabela-profissionais tbody");
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td><input type="text" id="edit-nome" value="${profissional.nome}"></td>
            <td><input type="text" id="edit-area" value="${profissional.area}"></td>
            <td><input type="text" id="edit-contato" value="${profissional.contato}"></td>
            <td>
                ${profissional.camposEspecificos ? Object.entries(profissional.camposEspecificos).map(([k,v]) => `${k}: ${v}`).join(", ") : ""}
            </td>
            <td>
                <button id="btn-salvar">Salvar</button>
                <button id="btn-cancelar">Cancelar</button>
            </td>
        `;

        tbody.insertBefore(tr, tbody.firstChild);

        tr.querySelector("#btn-salvar").addEventListener("click", async () => {
            const novosDados = {
                nome: document.getElementById("edit-nome").value,
                email: profissional.email,
                area: document.getElementById("edit-area").value,
                contato: document.getElementById("edit-contato").value,
                camposEspecificos: profissional.camposEspecificos || {}
            };

            const response = await fetch(`${API_URL}/${profissional.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(novosDados)
            });

            if (response.ok) {
                alert("Profissional atualizado!");
                tr.remove();
                carregarProfissionais();
            }
        });

        tr.querySelector("#btn-cancelar").addEventListener("click", () => tr.remove());
    }


    async function deletarProfissional(id) {
        if (!confirm("Deseja realmente deletar este profissional?")) return;

        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

        if (response.ok) {
            alert("Profissional deletado!");
            carregarProfissionais();
        }
    }

    const tooltip = document.querySelector(".tooltip-icon");
    const descricao = document.querySelector(".descricao-campos");

    tooltip.addEventListener("click", () => {
        if (descricao.style.display === "none" || descricao.style.display === "") {
            descricao.style.display = "block";
        } else {
            descricao.style.display = "none";
        }
    });


    carregarAreas();
    carregarProfissionais();
};
