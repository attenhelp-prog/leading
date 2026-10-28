// ===== ВХОД ЧЕРЕЗ FIREBASE =====
document.addEventListener('DOMContentLoaded', function() {
    const email = document.getElementById('loginEmail');
    const password = document.getElementById('loginPassword');
    const loginBtn = document.getElementById('loginBtn');

    function showError(inputElement) {
        inputElement.style.borderColor = '#ef4444';
        inputElement.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.15)';
        inputElement.style.animation = 'shake 0.4s ease';
        setTimeout(() => {
            inputElement.style.borderColor = '#1a1a24';
            inputElement.style.boxShadow = 'none';
            inputElement.style.animation = '';
        }, 2000);
    }

    loginBtn.addEventListener('click', async function() {
        const emailValue = email.value.trim();
        const passwordValue = password.value.trim();

        if (!emailValue || !passwordValue) {
            if (!emailValue) showError(email);
            if (!passwordValue) showError(password);
            return;
        }

        try {
            this.textContent = 'Вход...';
            this.disabled = true;

            const userCredential = await firebase.auth().signInWithEmailAndPassword(emailValue, passwordValue);
            const user = userCredential.user;

            // Загружаем имя пользователя из Firestore
            const doc = await window.db.collection('users').doc(user.uid).get();
            const username = doc.exists ? doc.data().username : 'user';

            localStorage.setItem('currentUser', username);
            localStorage.setItem('userEmail', emailValue);
            localStorage.setItem('userUid', user.uid);

            
            window.location.href = 'feed.html';
        } catch (error) {
            console.error('Ошибка входа:', error);
            showError(email);
            showError(password);
            alert('❌ Неверный email или пароль');
            this.textContent = 'Войти';
            this.disabled = false;
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });
});














import { getAuth, onAuthStateChanged } from "https://gstatic.com";

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Пользователь УЖЕ вошел в систему. Ему НЕЛЬЗЯ находиться на страницах реги/логина.
        // Перенаправляем его строго в ленту с учетом подпапки GitHub Pages
        window.location.href = "/leading/feed.html";
    } else {
        // Пользователь гость. Ничего не делаем, он может спокойно регистрироваться или логиниться
        console.log("Пользователь не авторизован, доступ открыт.");
    }
});
