document.addEventListener('DOMContentLoaded', function () {
    
    //Variáveis
    const loginRegisterLink = document.getElementById("login-register");
    const userLoggedSection = document.getElementById("user-logged");
    const userDropdownMenu = document.getElementById("user-dropdown");
    const userIcon = document.querySelector(".user-icon");
    const logoutButton = document.getElementById("logout-button"); 

    //Atualiza a Interface
    function updateAuthUI(isLoggedIn) {
        if (loginRegisterLink) {
            loginRegisterLink.style.display = isLoggedIn ? 'none' : 'block';
        }
        if (userLoggedSection) {
            userLoggedSection.style.display = isLoggedIn ? 'block' : 'none';
        }
    }

    //Requisição de dados da API
    async function fetchUserData(token, email) {
        const apiUrl = `http://localhost:8080/user/email/${encodeURIComponent(email)}`;
        try {
            const response = await fetch(apiUrl, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Token inválido ou falha na rede.");
            return await response.json();
        } catch (error) {
            console.error("Erro de Autenticação:", error.message);
            sessionStorage.clear();
            throw error;
        }
    }

    //Visibilidade do Menu dropdown
    function toggleUserMenu() {
        userDropdownMenu?.classList.toggle('is-active');
    }

    //Logout do usuário
    function logout() {
        sessionStorage.clear();
        window.location.reload();
    }

    //Verifica a autenticação
    async function checkAuthentication() {
        const token = sessionStorage.getItem("token");
        const email = sessionStorage.getItem("email");

        if (token && email) {
            //Usuário já logado
            updateAuthUI(true);
            try {
                await fetchUserData(token, email);
            } catch (error) {
                //Usuário deslogado
                updateAuthUI(false);
            }
        } else {
            //Usuário deslogado
            updateAuthUI(false);
        }
    }


    // Adiciona o evento de clique ao ícone do usuário para abrir/fechar o menu.
    if (userIcon) {
        userIcon.addEventListener('click', toggleUserMenu);
    }

    // Adiciona o evento de clique ao botão de sair (logout).
    if (logoutButton) {
        logoutButton.addEventListener('click', function(event) {
            event.preventDefault();
            logout();
        });
    }
    
    // Adiciona um evento de clique global para fechar o dropdown se o usuário clicar fora dele.
    document.addEventListener("click", function (event) {
        if (userIcon && userDropdownMenu && !userIcon.contains(event.target) && !userDropdownMenu.contains(event.target)) {
            userDropdownMenu.classList.remove('is-active');
        }
    });

    // Inicia o processo de verificação de autenticação assim que o script é carregado.
    checkAuthentication();
});