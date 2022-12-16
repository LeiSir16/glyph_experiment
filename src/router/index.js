import VueRouter from "vue-router";
import MainPage from "@/pages/MainPage";
import UserDataCollect from "@/pages/UserDataCollect";

const router = new VueRouter({
    base:'/experiment/',
    routes: [
        {
            path: '/',
            redirect: '/User'
        },
        {
            name: 'User',
            path: '/User',
            component: UserDataCollect
        },
        {
            name: 'MainPage',
            path: '/MainPage',
            component: MainPage
        }
    ]
});

export default router;