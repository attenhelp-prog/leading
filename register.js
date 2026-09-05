// document.addEventListener('DOMContentLoaded', function() {

//     const username = document.getElementById('username');
//     const email = document.getElementById('email');
//     const password = document.getElementById('password');
//     const passwordConfirm = document.getElementById('passwordConfirm');
//     const policyCheck = document.getElementById('policyCheck');
//     const registerBtn = document.getElementById('registerBtn');

//     function checkForm() {
//         const isUsername = username.value.trim().length >= 2;
//         const isEmail = email.value.trim().includes('@') && email.value.trim().includes('.');
//         const isPassword = password.value.length >= 6;
//         const isPasswordMatch = password.value === passwordConfirm.value && password.value.length > 0;
//         const isPolicyChecked = policyCheck.checked;

//         registerBtn.disabled = !(isUsername && isEmail && isPassword && isPasswordMatch && isPolicyChecked);
//     }

//     username.addEventListener('input', checkForm);
//     email.addEventListener('input', checkForm);
//     password.addEventListener('input', checkForm);
//     passwordConfirm.addEventListener('input', checkForm);
//     policyCheck.addEventListener('change', checkForm);

//     registerBtn.addEventListener('click', function() {
//         if (this.disabled) return;

//         const usernameValue = username.value.trim();
//         const emailValue = email.value.trim();
//         const passwordValue = password.value;   

       
//         localStorage.setItem('currentUser', usernameValue);
//         localStorage.setItem('userEmail', emailValue);
//         localStorage.setItem('userPassword', passwordValue);   

//         this.textContent = '⏳ Регистрация...';
//         this.disabled = true;

//         setTimeout(() => {
//             window.location.href = 'feed.html';
//         }, 1000);
//     });

// });



// ===== РЕГИСТРАЦИЯ ЧЕРЕЗ FIREBASE =====
document.addEventListener('DOMContentLoaded', function() {
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const passwordConfirm = document.getElementById('passwordConfirm');
    const policyCheck = document.getElementById('policyCheck');
    const registerBtn = document.getElementById('registerBtn');

    function checkForm() {
        const isUsername = username.value.trim().length >= 2;
        const isEmail = email.value.trim().includes('@') && email.value.trim().includes('.');
        const isPassword = password.value.length >= 6;
        const isPasswordMatch = password.value === passwordConfirm.value && password.value.length > 0;
        const isPolicyChecked = policyCheck.checked;

        registerBtn.disabled = !(isUsername && isEmail && isPassword && isPasswordMatch && isPolicyChecked);
    }

    username.addEventListener('input', checkForm);
    email.addEventListener('input', checkForm);
    password.addEventListener('input', checkForm);
    passwordConfirm.addEventListener('input', checkForm);
    policyCheck.addEventListener('change', checkForm);

    registerBtn.addEventListener('click', async function() {
        if (this.disabled) return;

        const usernameValue = username.value.trim();
        const emailValue = email.value.trim();
        const passwordValue = password.value;

        try {
            this.textContent = '⏳ Регистрация...';
            this.disabled = true;

            // Создаём пользователя в Firebase Auth
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(emailValue, passwordValue);
            const user = userCredential.user;

            // Сохраняем имя пользователя в Firestore
            await window.db.collection('users').doc(user.uid).set({
                username: usernameValue,
                email: emailValue,
                createdAt: Date.now()
            });

            // Сохраняем в localStorage для быстрого доступа
            localStorage.setItem('currentUser', usernameValue);
            localStorage.setItem('userEmail', emailValue);
            localStorage.setItem('userUid', user.uid);

            alert('✅ Добро пожаловать, ' + usernameValue + '!');
            window.location.href = 'feed.html';
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            alert('❌ Ошибка: ' + error.message);
            this.textContent = 'Зарегистрироваться';
            this.disabled = false;
        }
    });
});