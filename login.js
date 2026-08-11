document.addEventListener('DOMContentLoaded', function() {
    const email = document.getElementById('loginEmail');
    const password = document.getElementById('loginPassword');
    const loginBtn = document.getElementById('loginBtn');

    function showError(inputElement, message) {
        inputElement.style.borderColor = '#ef4444';
        inputElement.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.15)';
        inputElement.style.animation = 'shake 0.4s ease';
        setTimeout(() => {
            inputElement.style.borderColor = '#1a1a24';
            inputElement.style.boxShadow = 'none';
            inputElement.style.animation = '';
        }, 2000);
    }

    loginBtn.addEventListener('click', function() {
        const emailValue = email.value.trim();
        const passwordValue = password.value.trim();

        console.log('🔍 Введённый email:', emailValue);
        console.log('🔍 Введённый пароль:', passwordValue);

        if (!emailValue || !passwordValue) {
            if (!emailValue) showError(email, 'Введите email');
            if (!passwordValue) showError(password, 'Введите пароль');
            return;
        }

        if (passwordValue.length < 6) {
            showError(password, 'Пароль должен быть не менее 6 символов');
            return;
        }

        const savedUser = localStorage.getItem('currentUser');
        const savedEmail = localStorage.getItem('userEmail');
        const savedPassword = localStorage.getItem('userPassword');

        console.log('💾 Сохранённый email:', savedEmail);
        console.log('💾 Сохранённый пароль:', savedPassword);
        console.log('💾 Сохранённый ник:', savedUser);

        if (emailValue === savedEmail && passwordValue === savedPassword) {
            localStorage.setItem('currentUser', savedUser);
        
            window.location.href = 'feed.html';
        } else {
            showError(email, 'Неверный email или пароль');
            showError(password, 'Неверный email или пароль');
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });
});