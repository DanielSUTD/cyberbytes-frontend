document.addEventListener("DOMContentLoaded", function () {
    // Referências aos elementos do DOM
    const searchContainer = document.getElementById("search-container");
    const searchInput = searchContainer.querySelector("input");
    const searchButton = document.getElementById("btn-search");

    // Contêiner para exibir resultados da pesquisa dinamicamente
    const searchResultsDiv = document.createElement('div');
    searchResultsDiv.id = 'search-results';
    searchContainer.appendChild(searchResultsDiv);

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


    // Alterna visibilidade da barra de pesquisa e dispara pesquisa final ao clicar no botão
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
            if (query.length >= 2) {
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
});