/* Mostrar senha */
const forgotInputField = document.getElementById('forgotPassword');
const forgotInputIcon = document.getElementById('forgot-pass-icon');

/* Mostrar senha no Cadastrar */
function myForgotPassword() {
    if (forgotInputField.type === "password") {
        forgotInputField.type = "text";
        forgotInputIcon.name = "eye-off-outline";
        forgotInputIcon.style.cursor = "pointer";
    } else {
        forgotInputField.type = "password";
        forgotInputIcon.name = "eye-outline";
        forgotInputIcon.style.cursor = "pointer";
    }
}

/* Mudar o ícone quando o usuário digitar a senha */
function changeIcon(value) {
    if (value.length > 0) {
        if (forgotInputField.type === "password") {
            forgotInputIcon.name = "eye-outline";
        }
    } else {
        forgotInputIcon.name = "lock-closed-outline"
    }
}

/*Parte para o controle do formulário multi-step*/
let currentstep = 1; // Inicia na primeira etapa

/**
 * Função que exibe a etapa atual do formulário.
 * Ela altera a visibilidade dos campos e atualiza os indicadores de etapa.
 */
function showstep(step) {
    // Remove a classe 'active' de todas as etapas (todas ficam escondidas)
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));

    // Adiciona a classe 'active' apenas na etapa atual
    document.getElementById(`step${step}`).classList.add('active');

    // Atualiza os botões de navegação
    document.getElementById('btn-previous').disabled = step === 1; // Desativa o botão "Voltar" na primeira etapa
    // O botão "Próximo" agora será "Enviar" apenas na última etapa (step 3)
    document.getElementById('btn-next').innerText = step === 3 ? 'Enviar' : 'Próximo';

    // Ajusta o ícone da senha na etapa 3 caso o campo já esteja preenchido
    if (step === 3 && forgotInputField.value.length > 0) {
        forgotInputIcon.name = "eye-outline";
    } else if (step === 3 && forgotInputField.value.length === 0) {
        forgotInputIcon.name = "lock-closed-outline";
    }
}


/**
 * Função que valida os campos obrigatórios da etapa atual.
 * Retorna `true` se todos os campos da etapa estiverem preenchidos corretamente.
 */
function validateStep(step) {
    const stepElement = document.getElementById(`step${step}`);
    const inputs = stepElement.querySelectorAll('input[required]'); // Apenas inputs que são 'required'

    for (const input of inputs) {
        if (!input.checkValidity()) {
            alert(`Preencha o campo: ${input.placeholder || input.labels[0]?.textContent || input.id}`);
            input.focus(); // Foca no campo inválido para melhorar a UX
            return false;
        }
    }
    return true;
}

/**
 * Função que avança para a próxima etapa.
 * Valida os campos antes de permitir a navegação.
 */
async function nextStep() {
    if (!validateStep(currentstep)) return; // Se a validação falhar, interrompe a execução

    const nextButton = document.getElementById('btn-next'); // Obtém o botão "Próximo"

    try {
        // Lógica para enviar o e-mail na primeira etapa
        if (currentstep === 1) {
            nextButton.disabled = true; // Desativa o botão para evitar cliques múltiplos
            nextButton.innerText = 'Enviando...'; // Altera o texto para indicar que está processando

            const email = document.getElementById('email').value;

            const payload = { email: email };

            const response = await fetch("http://localhost:8080/user/forgot-password", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.text();

            if (response.ok) {
                alert(data);
                currentstep++;
                showstep(currentstep);
            } else {
                alert(`Erro: ${data}`);
            }
            nextButton.disabled = false; // Reativa o botão
            nextButton.innerText = 'Próximo'; // Restaura o texto original
            return;
        }

        // Lógica para avançar para a tela de senha na segunda etapa
        if (currentstep === 2) {
            currentstep++;
            showstep(currentstep);
            return;
        }

        // Lógica para mudar a senha na terceira e última etapa
        if (currentstep === 3) {
            nextButton.disabled = true; // Desativa o botão "Enviar"
            nextButton.innerText = 'Enviando...'; // Altera o texto

            const email = document.getElementById('email').value;
            const code = document.getElementById('code').value;
            const newPassword = document.getElementById('forgotPassword').value;

            const forgotPasswordDto = {
                email: email,
                password: newPassword
            };

            const response = await fetch(`http://localhost:8080/user/recover-account?attempt=${parseInt(code)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(forgotPasswordDto)
            });

            const data = await response.text();

            if (response.ok) {
                alert("Senha redefinida com sucesso!");
                window.location.href = "/LoginRegister/index.html";
            } else {
                alert(`Erro ao redefinir senha: ${data}`);
                nextButton.disabled = false; // Reativa o botão em caso de erro
                nextButton.innerText = 'Enviar'; // Restaura o texto
            }
        }
    } catch (error) {
        console.error("Ocorreu um erro na requisição:", error);
        alert("Ocorreu um erro inesperado. Por favor, tente novamente.");
        nextButton.disabled = false; // Reativa o botão em caso de erro inesperado
        nextButton.innerText = currentstep === 3 ? 'Enviar' : 'Próximo'; // Restaura o texto original
    }
}

/**
 * Função que volta para a etapa anterior.
 */
function prevStep() {
    if (currentstep > 1) {
        currentstep--;
        showstep(currentstep);
    }
}

// Inicializa o formulário mostrando a primeira etapa ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    showstep(currentstep);
});

// Torna as funções acessíveis no escopo global (necessário para os botões)
window.nextStep = nextStep;
window.prevStep = prevStep;
window.myForgotPassword = myForgotPassword;
window.changeIcon = changeIcon;