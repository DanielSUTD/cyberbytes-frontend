const loginBtn = document.querySelector("#login");
const registerBtn = document.querySelector("#register");
const loginForm = document.querySelector(".login-form");
const registerForm = document.querySelector(".register-form");

/* Mostrar o formulário de entrar */
loginBtn.addEventListener('click', () => {
    loginBtn.style.backgroundColor = "#6D9886";
    registerBtn.style.backgroundColor = "rgba(255, 255, 255, 0.2)";

    loginForm.style.left = "50%";
    registerForm.style.left = "-50%";

    loginForm.style.opacity = 1;
    registerForm.style.opacity = 0;
});

/* Mostrar o formulário de cadastrar */
registerBtn.addEventListener('click', () => {
    loginBtn.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    registerBtn.style.backgroundColor = "#6D9886";

    loginForm.style.left = "150%";
    registerForm.style.left = "50%";

    loginForm.style.opacity = 0;
    registerForm.style.opacity = 1;
});

/* Mostrar senha */
const logInputField = document.getElementById('logPassword');
const logInputIcon = document.getElementById('log-pass-icon');

const regInputField = document.getElementById('regPassword');
const regInputIcon = document.getElementById('reg-pass-icon');

/* Mostrar senha no Entrar */
function myLogPassword() {
    if (logInputField.type === "password") {
        logInputField.type = "text";
        logInputIcon.name = "eye-off-outline";
        logInputIcon.style.cursor = "pointer";
    } else {
        logInputField.type = "password";
        logInputIcon.name = "eye-outline";
        logInputIcon.style.cursor = "pointer";
    }
}

/* Mostrar senha no Cadastrar */
function myRegPassword() {
    if (regInputField.type === "password") {
        regInputField.type = "text";
        regInputIcon.name = "eye-off-outline";
        regInputIcon.style.cursor = "pointer";
    } else {
        regInputField.type = "password";
        regInputIcon.name = "eye-outline";
        regInputIcon.style.cursor = "pointer";
    }
}

/* Mudar o ícone quando o usuário digitar a senha */
function changeIcon(value) {
    if (value.length > 0) {
        logInputIcon.name = "eye-outline";
        regInputIcon.name = "eye-outline";
    } else {
        logInputIcon.name = "lock-closed-outline";
        regInputIcon.name = "lock-closed-outline";
    }
}


// Variável que controla qual etapa está ativa
let currentstep = 1;

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
    document.getElementById('btn-previous').disabled = step === 1; // Desativa o botão "Anterior" na primeira etapa
    document.getElementById('btn-next').innerText = step === 2 ? 'Enviar' : 'Próximo'; // Muda o texto para "Enviar" na última etapa

    // Desativa o botão 'Próximo'/'Enviar' se estiver na segunda etapa (onde o código é necessário)
    if (step === 2) {
        document.getElementById('btn-next').disabled = true;
    } else {
        document.getElementById('btn-next').disabled = false;
    }
}

/**
 * Função que valida os campos obrigatórios da etapa atual.
 * Retorna `true` se todos os campos da etapa estiverem preenchidos corretamente.
 */
function validateStep(step) {
    // Seleciona a etapa atual
    const stepElement = document.getElementById(`step${step}`);
    // Seleciona todos os campos de entrada (inputs) obrigatórios dessa etapa
    const inputs = stepElement.querySelectorAll('input[required]');

    // Verifica se cada campo é válido
    for (const input of inputs) {
        if (!input.checkValidity()) { // Se o campo for inválido
            alert(`Por favor, preencha o campo: ${input.placeholder || input.labels[0]?.textContent || input.id}`); // Mostra uma mensagem de alerta mais descritiva
            return false; // Retorna falso para bloquear o avanço
        }
    }
    return true; // Todos os campos estão válidos
}

/**
 * Função que avança para a próxima etapa.
 * Valida os campos antes de permitir a navegação.
 */
async function nextStep() {
    if (!validateStep(currentstep)) return; // Se a validação falhar, interrompe a execução

    if (currentstep < 2) {
        currentstep++; // Avança para a próxima etapa
        showstep(currentstep); // Mostra a nova etapa

        const email = document.getElementById('email').value;
        await genCode(email); // Gera código quando o usuário avança para a segunda etapa
    } else {
        // Manipula o fluxo de registro (que inclui o envio)
        handleRegistrationFlow();
    }
}

/**
 * Função que volta para a etapa anterior.
 */
function prevStep() {
    if (currentstep > 1) {
        currentstep--; // Volta para a etapa anterior
        showstep(currentstep); // Mostra a etapa anterior
    }
}

// Torna as funções acessíveis no escopo global (necessário para os botões)
window.nextStep = nextStep;
window.prevStep = prevStep;

// Chamada inicial para mostrar a primeira etapa quando o DOM é carregado
document.addEventListener('DOMContentLoaded', () => {
    showstep(currentstep);
});


/* Função FETCH (Gerar Código) */
async function genCode(email) {
    try {
        const payload = { email: email };

        const response = await fetch("http://localhost:8080/user/code", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Código de verificação enviado para o seu e-mail! Agora você pode inserir o código e clicar em 'Enviar'.");
            // Ativa o botão 'Enviar'
            document.getElementById('btn-next').disabled = false; 
        } else {
            const errorText = await response.text();
            alert(`Erro ao enviar o código. Por favor, tente novamente mais tarde. Detalhes: ${errorText}`);
            // Botão desativado
            document.getElementById('btn-next').disabled = true; 
        }
    } catch (error) {
        alert("Não foi possível conectar ao servidor para enviar o código. Verifique sua conexão ou tente mais tarde.");
        console.error("Erro:", error);
         // Botão desativado
        document.getElementById('btn-next').disabled = true;
    }
}

/**
 * Função FETCH (Tentativa do Usuário)
 */
async function userAttempt(codeInserted) {
    try {
        //Variáveis do formulário de cadastro
        const name = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('regPassword').value;

        //Objeto user
        const user = {
            name: name,
            email: email,
            password: password
        };

        
        const response = await fetch(`http://localhost:8080/auth/register?attempt=${codeInserted}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });

        console.log("Status da resposta:", response.status);

        if (response.ok) {
            alert('Cadastro realizado com sucesso! Você já pode fazer login.');
            loginBtn.click();
        } else {
            const errorText = await response.text();
            alert(`Erro ao finalizar o cadastro. Por favor, tente novamente. Detalhes: ${errorText}`);
        }
    } catch (error) {
        alert('Não foi possível conectar ao servidor para finalizar o cadastro. Verifique sua conexão ou tente mais tarde.');
        console.error('Erro:', error);
    }
}

/**
 * Controle de Fluxo para Registro
 */
async function handleRegistrationFlow() {
    const codeInserted = document.getElementById('code').value;
    //Verifica o código
    if (!codeInserted) {
        alert("Por favor, insira o código de verificação.");
        return;
    }
    await userAttempt(codeInserted);
}


/**
 * LOGIN
 */
async function login() {
    try {
        //Variáveis de Login
        const email = document.getElementById("emailLogin").value;
        const password = document.getElementById("logPassword").value;


        if (!email || !password) {
            alert("Por favor, insira seu e-mail e senha.");
            return;
        }

        //Objeto user
        const user = {
            email: email,
            password: password
        };

        const response = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });

        if (response.ok) {
            const data = await response.json();

            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("email", email);

            alert("Login realizado com sucesso!");
            window.location.href = "../Home/index.html";
        } else {
            const errorText = await response.text();
            alert(`Erro ao tentar fazer login. Por favor, tente novamente. Detalhes: ${errorText}`);
        }
    } catch (error) {
        alert("Não foi possível conectar ao servidor para fazer login. Verifique sua conexão ou tente mais tarde.");
        console.error("Erro na requisição:", error);
    }
}