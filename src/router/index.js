import {createRouter, createWebHistory} from 'vue-router';
import Cookies from 'js-cookie';
import axios from "axios";
import api from "../http/axiosConfig.js";

const routes = [
    {
        path : '/ui/login',
        name : 'Login',
        component: () => import('../AuthSystem/Login/Login.vue'),
    },
    {
        path : '/ui/register',
        name : 'Register',
        component: () => import('../AuthSystem/Login/Register.vue'),
    },
    {
        path : '/ui/forgotpwd',
        name : 'Forgotpwd',
        component: () => import('../AuthSystem/Login/ForgotPwd.vue'),
    },
    {
        path: '/auth/logout',
        name: 'Logout',
        async beforeEnter(to, from, next) {

            try {
                const response = await api.post(`${import.meta.env.APP_API_URL}/auth/logout`);
                if (response.status === 200) {
                    Cookies.remove('token');
                    Cookies.remove('refreshToken');
                }
            } catch (error) {
                console.error("Error fetching chats:", error);
            }

            next({name: 'Login'});
        }
    },
    {
        path : '/',
        name : 'NewChat',
        component: () => import('../Pages/Chat/NewChat/NewChat.vue'),
        meta: { requiresAuth: true }
    },
    {
        path : '/chat/:chatId',
        name : 'Chat',
        component: () => import('../Pages/Chat/Chat/Chat.vue'),
        props: true,
        meta: { requiresAuth: true }
    },
    // {
    //     path : '/test',
    //     name : 'testConsole',
    //     component: () => import('../Console/Chat/TestConsole.vue'),
    //     meta: { requiresAuth: true }
    // },

];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async (to, from, next) => {
    const token = Cookies.get('token');


    // Если пользователь авторизован и пытается попасть на страницы аутентификации, перенаправляем на защищённую страницу
    if (token && ['Login', 'Register', 'Forgotpwd'].includes(to.name)) {
        next({name: 'NewChat'}); // Перенаправление на защищённую страницу
    }
    // Если требуется аутентификация, но токена нет, перенаправляем на страницу логина
    else if (to.meta.requiresAuth && !token) {
        next({name: 'Login'});
    } else {
        next(); // Продолжаем маршрут
    }
});

// router.afterEach((to, from, failure) => {
//     if (!failure) {
//         setTimeout(() => {
//
//         }, 100)
//     }
// });

export default router;