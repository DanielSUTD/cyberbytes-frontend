document.addEventListener('DOMContentLoaded', function () {

    const token = sessionStorage.getItem('token');
    const email = sessionStorage.getItem('email');
    let currentUserId = null;

    if (!token) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = '/LoginRegister/index.html';
        return;
    }

    /**
     * Popula o formulário com os dados do usuário
     */
    function populateForm(user) {
        if (!user) return;
        currentUserId = user.id;
        document.getElementById('fullName').value = user.name || '';
        document.getElementById('email').value = user.email || '';
    }

    /**
     * Carrega os dados do perfil do usuário
     */
    async function loadProfile() {
        try {
            const response = await fetch(`http://localhost:8080/user/email/${encodeURIComponent(email)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const user = await response.json();
                populateForm(user);
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Erro ao carregar o perfil.');
            }
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            sessionStorage.clear();
            alert('Sessão inválida ou erro ao carregar o perfil. Faça login novamente.');
            window.location.href = '/LoginRegister/index.html';
        }
    }

    /**
     * Salva as alterações do perfil
     */
    async function saveChanges() {
        if (!currentUserId) {
            alert('Não foi possível identificar o usuário para a atualização.');
            return;
        }

        const fullName = document.getElementById('fullName').value;
        const newEmail = document.getElementById('email').value;
        const newPassword = document.getElementById('newPassword').value;
        const repeatNewPassword = document.getElementById('repeatNewPassword').value;

        if (newPassword && newPassword !== repeatNewPassword) {
            alert('As novas senhas não coincidem!');
            return;
        }

        const payload = {
            name: fullName,
            email: newEmail
        };

        if (newPassword) {
            payload.password = newPassword;
        }

        try {
            const response = await fetch(`http://localhost:8080/user/${currentUserId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Dados atualizados com sucesso!');

                // Atualiza o email salvo no sessionStorage
                if (newEmail !== email) {
                    sessionStorage.setItem('email', newEmail);
                    alert('Email alterado, faça o Login novamente!');
                    window.location.href = '/LoginRegister/index.html';
                    return;
                }

                // Limpa os campos de senha
                document.getElementById('newPassword').value = '';
                document.getElementById('repeatNewPassword').value = '';
                document.getElementById('currentPassword').value = '';

            } else {
                const errorText = await response.text();
                alert(`Erro ao atualizar dados. Detalhes: ${errorText}`);
            }
        } catch (error) {
            console.error('Falha ao atualizar usuário:', error);
            alert('Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente.');
        }
    }


    // Botão de salvar
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.addEventListener('click', saveChanges);
    }

    // Botão de cancelar
    const cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
        cancelButton.addEventListener('click', function () {
            window.location.href = '/Home/index.html';
        });
    }

    // Carrega o perfil ao iniciar a página
    loadProfile();

});
