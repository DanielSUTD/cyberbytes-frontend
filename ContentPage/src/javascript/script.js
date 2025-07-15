document.addEventListener("DOMContentLoaded", () => {

    // --- Mapeamento e Funções de Exibição de Conteúdo ---
    // Mapeamento dos IDs HTML para os campos do DTO da API
    const ELEMENT_MAPPINGS = {
        'title': 'title',
        'introduction': 'introduction',
        'subtitle': 'subtitle',
        'content': 'content',
        'conclusion': 'conclusion'
    };

    // Preencher um elemento com dados, se o elemento existir
    const fillElement = (elementId, dataValue, isHtml = false) => {
        const element = document.getElementById(elementId);
        if (element) {
            if (isHtml) {
                element.innerHTML = dataValue || '';
            } else {
                element.textContent = dataValue || '';
            }
        } else {
            console.warn(`Elemento com ID '${elementId}' não encontrado no DOM.`);
        }
    };

    // Exibir mensagens de erro na página de conteúdo
    const displayPageError = (messageTitle, messageContent) => {
        fillElement('title', messageTitle);
        fillElement('introduction', messageContent);
        fillElement('subtitle', '');
        fillElement('content', '');
        fillElement('conclusion', '');
        document.title = 'CyberBytes - Erro';
    };

    // Carregar e exibir o conteúdo da página principal
    const loadMainPageContent = async (slug) => {
        try {
            const API_URL_CONTENT = `http://localhost:8080/page/slug?slug=${encodeURIComponent(slug)}`;
            const response = await fetch(API_URL_CONTENT);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Página não encontrada.');
                }
                throw new Error(`Erro HTTP! Status: ${response.status}`);
            }

            const data = await response.json();

            fillElement('title', data.title ? `<b>${data.title}</b>` : '', true);
            fillElement('introduction', data.introduction);
            fillElement('subtitle', data.subtitle ? `<b>${data.subtitle}</b>` : '', true);
            fillElement('content', data.content);
            fillElement('conclusion', data.conclusion);
            document.title = data.title ? `CyberBytes - ${data.title}` : 'CyberBytes - Conteúdo';

            if (data.topic) {
                loadRelatedTopics(data.topic);
            }

        } catch (error) {
            console.error('Erro ao buscar o conteúdo da página:', error);
            displayPageError('Erro ao carregar o conteúdo', 'Não foi possível encontrar a página solicitada ou ocorreu um erro no servidor.');
        }
    };

    // --- Lógica de Pesquisa ---
    const searchContainer = document.getElementById("search-container");
    const searchButton = document.getElementById("btn-search");

    // Declarações com let para garantir que sejam acessíveis
    let searchInput;
    let searchResultsDiv;

    // Inicializa elementos de pesquisa se o contêiner existir
    if (searchContainer) {
        searchInput = searchContainer.querySelector("input");
        searchResultsDiv = document.createElement('div');
        searchResultsDiv.id = 'search-results';
        searchContainer.appendChild(searchResultsDiv);
    } else {
        console.warn("Elemento 'search-container' não encontrado no DOM. A funcionalidade de pesquisa não será inicializada.");
        // Se o search-container não existe, a funcionalidade de pesquisa não pode operar
        // então não precisamos anexar listeners relacionados à pesquisa.
        return;
    }

    /**
     * Realiza a pesquisa e exibe/navega para os resultados.
     * query - Termo de pesquisa.
     * navigateToFirst - Se true, navega para o primeiro resultado.
     */
    const performSearch = async (query, navigateToFirst = false) => {
        if (!searchResultsDiv || !searchInput) return;

        if (query.length < 2) {
            searchResultsDiv.innerHTML = '';
            searchResultsDiv.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/page/search?query=${encodeURIComponent(query)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
            }

            const pages = await response.json();
            searchResultsDiv.innerHTML = '';

            if (pages.length > 0) {
                if (navigateToFirst) {
                    window.location.href = `/ContentPage/index.html?slug=${encodeURIComponent(pages[0].slug)}`;
                    return;
                }

                pages.forEach(page => {
                    const resultItem = document.createElement('a');
                    resultItem.href = `/ContentPage/index.html?slug=${encodeURIComponent(page.slug)}`;
                    resultItem.textContent = page.title; // Exibe o título legível
                    resultItem.classList.add('search-result-item');

                    resultItem.addEventListener('click', (event) => {
                        event.preventDefault();
                        window.location.href = resultItem.href;
                    });
                    searchResultsDiv.appendChild(resultItem);
                });
                searchResultsDiv.style.display = 'block';
            } else {
                searchResultsDiv.innerHTML = '<p class="no-results-message">Sem resultados encontrados.</p>';
                searchResultsDiv.style.display = 'block';
            }

        } catch (error) {
            console.error('Erro na pesquisa:', error);
            searchResultsDiv.innerHTML = '<p class="error-message">Ocorreu um erro ao buscar os resultados. Tente novamente.</p>';
            searchResultsDiv.style.display = 'block';
        }
    };

    const loadRelatedTopics = async (topic) => {
        try {
            const response = await fetch(`http://localhost:8080/page/related?topic=${encodeURIComponent(topic)}`);
            if (!response.ok) return;

            const pages = await response.json();
            const list = document.getElementById("related-topics-list");
            if (!list) return;

            list.innerHTML = '';

            pages.forEach(page => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `/ContentPage/index.html?slug=${encodeURIComponent(page.slug)}`;
                a.textContent = page.title;
                li.appendChild(a);
                list.appendChild(li);
            });
        } catch (error) {
            console.error("Erro ao carregar tópicos relacionados:", error);
        }
    };

    // --- Listeners de Eventos da Pesquisa ---
    // Configura o comportamento do botão de pesquisa
    searchButton.addEventListener("click", function () {
        if (!searchContainer.classList.contains("active")) {
            searchContainer.classList.add("active");
            searchInput.focus();
        } else {
            if (searchInput.value.trim() !== "") {
                performSearch(searchInput.value.trim(), true); // Pesquisa e navega
            } else {
                searchContainer.classList.remove("active");
                searchResultsDiv.style.display = 'none';
            }
        }
    });

    // Dispara pesquisa em tempo real conforme o usuário digita
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        performSearch(query);
    });

    // Dispara pesquisa e seleciona o primeiro item ao pressionar 'Enter'
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Evita envio de formulário padrão
            const query = searchInput.value.trim();
            if (query.length >= 4) {
                performSearch(query, true); // Pesquisa e navega
            }
        }
    });

    // Esconde resultados quando o campo de pesquisa perde o foco
    searchInput.addEventListener('blur', (event) => {
        setTimeout(() => {
            if (!searchContainer.contains(document.activeElement) && !searchResultsDiv.contains(document.activeElement)) {
                searchResultsDiv.style.display = 'none';
            }
        }, 100);
    });

    // Esconde resultados e desativa o contêiner ao clicar fora
    document.addEventListener('click', (event) => {
        if (!searchContainer.contains(event.target) && !searchButton.contains(event.target)) {
            searchResultsDiv.style.display = 'none';
            //searchContainer.classList.remove("active"); // Fecha o contêiner ao clicar fora
        }
    });

    // --- Carregamento Inicial do Conteúdo da Página ---
    const params = new URLSearchParams(window.location.search);
    const slugParam = params.get('slug');

    if (slugParam) {
        loadMainPageContent(slugParam);
    } else {
        displayPageError('Título da página não especificado', 'Por favor, selecione um tópico na página inicial.');
    }
});