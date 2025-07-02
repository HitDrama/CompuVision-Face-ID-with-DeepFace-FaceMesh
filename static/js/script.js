// static/js/scripts.js
document.addEventListener('DOMContentLoaded', () => {
    const messageForm = document.querySelector(".prompt__form");
    const chatContainer = document.querySelector(".chats");
    const themeToggle = document.getElementById("themeToggler");
    let isGenerating = false;

    // Null checks for required elements
    if (!messageForm || !chatContainer || !themeToggle) {
        console.error("Required DOM elements not found:", {
            messageForm: !!messageForm,
            chatContainer: !!chatContainer,
            themeToggle: !!themeToggle
        });
        return;
    }

    const loadTheme = () => {
        const isLight = localStorage.getItem("theme") === "light";
        document.body.classList.toggle("light_mode", isLight);
        themeToggle.innerHTML = isLight ? '<i class="bx bx-moon"></i>' : '<i class="bx bx-sun"></i>';
    };

    const createMessage = (html, ...classes) => {
        const div = document.createElement("div");
        div.classList.add("message", ...classes);
        div.innerHTML = html;
        return div;
    };

    const showTyping = (text, element, container, skip = false) => {
        const copyIcon = container.querySelector(".message__icon");
        if (copyIcon) copyIcon.classList.add("hide");
        const loading = container.querySelector(".message__loading-indicator");
        if (loading) loading.remove();

        const parsed = marked.parse(text);
        if (skip) {
            element.innerHTML = parsed;
            if (copyIcon) copyIcon.classList.remove("hide");
            hljs.highlightAll();
            isGenerating = false;
            return;
        }

        const words = text.split(" ");
        let i = 0;
        element.innerText = ""; // Clear text before typing
        const interval = setInterval(() => {
            element.innerText += (i === 0 ? "" : " ") + words[i++];
            if (i === words.length) {
                clearInterval(interval);
                element.innerHTML = parsed;
                if (copyIcon) copyIcon.classList.remove("hide");
                hljs.highlightAll();
                isGenerating = false;
            }
        }, 75);
    };

    const showLoading = () => {
        const html = `
            <div class="message__content">
                <img class="message__avatar" src="/static/chatbot.png" alt="mycode">
                <div>
                    <p class="message__text"></p>
                    <span class="message__icon hide"><i class='bx bx-copy-alt'></i></span>
                    <div class="message__loading-indicator">
                        <div class="message__loading-bar"></div><div class="message__loading-bar"></div><div class="message__loading-bar"></div>
                    </div>
                </div>
            </div>`;
        const loading = createMessage(html, "message--incoming", "message--loading");
        chatContainer.appendChild(loading);
        return loading;
    };



    // const sendMessage = async (message) => {
    //     if (!message || isGenerating) return;
    //     isGenerating = true;

    //     const outgoingHtml = `
    //         <div class="message__content">
    //             <img class="message__avatar" src="/static/logo.png" alt="User">
    //             <div>
    //                 <p class="message__text">${message}</p>
    //             </div>
    //         </div>`;
    //     chatContainer.appendChild(createMessage(outgoingHtml, "message--outgoing"));
    //     const loading = showLoading();

    //     try {
    //         const res = await fetch("/send_message", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/x-www-form-urlencoded" },
    //             body: `message=${encodeURIComponent(message)}`
    //         });
    //         const data = await res.json();
    //         if (res.ok) {
    //             const textElement = loading.querySelector(".message__text");
    //             loading.classList.remove("message--loading");
    //             showTyping(data.api_response, textElement, loading);
    //             document.body.classList.add("hide-header");
    //         } else throw new Error(data.error || "API failed");
    //     } catch (e) {
    //         loading.querySelector(".message__text").innerText = `Error: ${e.message}`;
    //         loading.classList.remove("message--loading");
    //         isGenerating = false;
    //     }
    // };

    const formatMessages = () => {
        document.querySelectorAll(".message--incoming .message__text").forEach(el => {
            const raw = el.getAttribute("data-raw");
            if (raw) el.innerHTML = marked.parse(raw.replace(/&(?!(amp|lt|gt|quot|apos);)/g, "&")), hljs.highlightAll();
        });
    };



    themeToggle.addEventListener("click", () => {
        const isLight = document.body.classList.toggle("light_mode");
        localStorage.setItem("theme", isLight ? "light" : "dark");
        themeToggle.innerHTML = isLight ? '<i class="bx bx-moon"></i>' : '<i class="bx bx-sun"></i>';
    });

    // Removed unused event listeners (clearButton, newChatBtn, deleteChatBtn, chatSessionSelect, suggestions)
    // Add them back if corresponding HTML elements are restored


    const newChatBtn = document.getElementById("newChat");
    newChatBtn.addEventListener("click", async () => {
        const res = await fetch("/new_chat", { method: "POST" });
        const data = await res.json();
        if (res.ok) {
            window.location.href = `/chat-bot?new_question=${data.new_question}`;
        }
    });


    const sendMessage = async (message, new_question) => {
        new_question = new_question || 'default';
        if (!message || isGenerating) return;
        isGenerating = true;

        const outgoingHtml = `
        <div class="message__content">
            <img class="message__avatar" src="/static/logo.png" alt="User">
            <div>
                <p class="message__text">${message}</p>
                <span onclick="toggleEditForm(this)" class="message__edit-icon"><i class='bx bx-edit'></i></span>
            </div>
            <form class="edit-form" style="display: none;">
                <input type="text" class="edit-input form-control" value="${message}">
                <button type="submit" class="btn btn-sm btn-primary"><i class='bx bx-check'></i></button>
                <button type="button" class="btn btn-sm btn-secondary cancel-edit"><i class='bx bx-x'></i></button>
            </form>
        </div>`;
        chatContainer.appendChild(createMessage(outgoingHtml, "message--outgoing"));
        const loading = showLoading();

        try {
            const res = await fetch("/send_message", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `message=${encodeURIComponent(message)}&new_question=${new_question}`
            });

            const data = await res.json();
            console.log('Sending message:', message, 'New question:', new_question);
            if (res.ok) {
                const textElement = loading.querySelector(".message__text");
                loading.classList.remove("message--loading");
                showTyping(data.api_response, textElement, loading);
                document.body.classList.add("hide-header");
            } else throw new Error(data.error || "API failed");
        } catch (e) {
            loading.querySelector(".message__text").innerText = `Error: ${e.message}`;
            loading.classList.remove("message--loading");
            isGenerating = false;
        }
    };


    // // Event listeners with null checks
    messageForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const messageInput = messageForm.querySelector(".prompt__form-input");
        const new_question = messageForm.querySelector("input[name='new_question']").value;
        if (!messageInput) {
            console.error("Message input not found");
            return;
        }
        const message = messageInput.value.trim();
        if (message) {
            sendMessage(message, new_question);
            messageForm.reset();
        }
    });


    const chatSessionSelect = document.getElementById("chatSession");
    chatSessionSelect.addEventListener("change", () => {
        window.location.href = `/chat-bot?new_question=${chatSessionSelect.value}`;
    });

    const deleteChatBtn = document.getElementById("deleteChat");
    deleteChatBtn.addEventListener("click", async () => {
        const question = chatSessionSelect.value;
        if (confirm(`Xóa chat ${question}?`)) {
            const res = await fetch("/delete_chat", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `new_question=${question}`
            });
            const data = await res.json();
            if (res.ok) window.location.href = data.redirect;
        }
    });

    //edit
    const editMessage = async (form) => {
        const chatId = form.closest('.message').dataset.chatId;
        const newMessage = form.querySelector('.edit-input').value.trim();
        if (!newMessage || isGenerating) return;

        isGenerating = true;
        const message = form.closest('.message');
        const text = message.querySelector('.message__text');
        const reply = message.nextElementSibling.querySelector('.message__text');

        try {
            const res = await fetch(`/edit_message/${chatId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `message=${encodeURIComponent(newMessage)}`
            });
            const data = await res.json();
            if (res.ok) {
                text.textContent = data.user_message;
                reply.textContent = '';
                toggleEditForm(message.querySelector('.message__edit-icon'));
                showTyping(data.api_response, reply, message.nextElementSibling);
            } else throw new Error(data.error || "Edit failed");
        } catch (e) {
            reply.textContent = `Error: ${e.message}`;
            isGenerating = false;
        }
    };
    document.addEventListener('submit', (e) => {
        if (e.target.classList.contains('edit-form')) {
            e.preventDefault();
            editMessage(e.target);
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('.cancel-edit')) toggleEditForm(e.target.closest('.message').querySelector('.message__edit-icon'));
    });



    loadTheme();
    formatMessages(); // Format existing messages on page load
});

const copyMessageToClipboard = (btn) => {
    if (btn && btn.previousElementSibling) {
        console.log("ok");
        navigator.clipboard.writeText(btn.previousElementSibling.innerText);
        btn.innerHTML = `<i class='bx bx-check'></i>`;
        setTimeout(() => btn.innerHTML = `<i class='bx bx-copy-alt'></i>`, 1000);
    }
};

const toggleEditForm = (icon) => {
    const content = icon.closest('.message__content');
    const text = content.querySelector('.message__text');
    const form = content.querySelector('.edit-form');
    text.style.display = text.style.display === 'none' ? 'block' : 'none';
    form.style.display = form.style.display === 'none' ? 'flex' : 'none';
    if (form.style.display === 'flex') form.querySelector('.edit-input').focus();
};
