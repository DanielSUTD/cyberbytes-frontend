document.addEventListener('DOMContentLoaded', function () {
    // Seleção dos Elementos do DOM
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotModalElement = document.getElementById('chatbotModal');
    const chatHistory = document.getElementById('chat-history');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');

    // Inicializa o componente Modal do Bootstrap para podermos controlá-lo via JavaScript.
    const chatbotModal = new bootstrap.Modal(chatbotModalElement);


    /**
     * Cria e adiciona uma nova "bolha" de mensagem ao histórico do chat.
     * text - O conteúdo de texto da mensagem a ser exibida.
     * type - O tipo de mensagem, que define o estilo ('user' para o usuário, 'ai' para a IA).
     */
    function addMessageToHistory(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', `${type}-message`);

        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        messageDiv.appendChild(paragraph);

        chatHistory.appendChild(messageDiv);
        // Garante que a visualização do chat sempre role para a mensagem mais recente.
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    /**
     * Controla a exibição do indicador "está digitando..." para dar feedback ao usuário.
     * show - Se true, mostra o indicador; se false, o remove.
     */
    function toggleTypingIndicator(show) {
        let indicator = document.getElementById('typing-indicator');
        // Se for para mostrar e o indicador ainda não existir, cria-o.
        if (show && !indicator) {
            indicator = document.createElement('div');
            indicator.id = 'typing-indicator';
            indicator.classList.add('typing-indicator');
            indicator.textContent = 'CyberBytes Assistant está digitando...';
            chatHistory.appendChild(indicator);
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }
        // Se for para esconder e o indicador existir, remove-o.
        else if (!show && indicator) {
            indicator.remove();
        }
    }

    /**
     * Orquestra o processo de enviar uma mensagem:
     * 1. Valida e exibe a mensagem do usuário.
     * 2. Mostra o feedback "digitando...".
     * 3. Envia a mensagem para a API.
     * 4. Exibe a resposta da API ou uma mensagem de erro.
     */
    async function sendMessage() {
        const userMessage = chatInput.value.trim();
        if (userMessage === '') return; // Não faz nada se a mensagem estiver vazia.

        // Exibe a mensagem do usuário na tela imediatamente para uma UI responsiva.
        addMessageToHistory(userMessage, 'user');
        chatInput.value = ''; // Limpa o campo de texto.

        // Informa que a IA está "pensando".
        toggleTypingIndicator(true);

        try {
            // Envia a mensagem do usuário para o backend.
            const response = await fetch('http://localhost:8080/ia/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: userMessage
            });

            if (!response.ok) {
                throw new Error('Erro na resposta da API.');
            }

            const aiMessage = await response.text();

            // Remove o indicador "digitando..." e mostra a resposta final da IA.
            toggleTypingIndicator(false);
            addMessageToHistory(aiMessage, 'ai');

        } catch (error) {
            console.error('Erro ao contatar a API do chatbot:', error);
            toggleTypingIndicator(false);
            addMessageToHistory('Desculpe, estou com problemas para me conectar. Tente novamente mais tarde.', 'ai');
        }
    }

    // Abrir o modal ao clicar
    chatbotToggle.addEventListener('click', (event) => {
        event.preventDefault();
        chatbotModal.show();
    });

    // Enviar mensagem ao clicar em enviar
    sendButton.addEventListener('click', sendMessage);

    // Enviar mensagem com Enter
    chatInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
});