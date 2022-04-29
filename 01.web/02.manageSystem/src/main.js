import Vue from 'vue';
import ViewUI from 'view-design';
import VueRouter from 'vue-router';
import Routers from './router';
import Util from './libs/util';
import App from './app.vue';
import 'view-design/dist/styles/iview.css';

/**
 * 以下为手动安装配置的依赖
 * 通过 Vue.prototype.$name 的方式 使$name在所有的Vue实例中可用
 */
//http请求 -> axios
import axios from 'axios';
Vue.prototype.$axios = axios;

//markdown编辑器
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
Vue.use(mavonEditor)

Vue.use(VueRouter);
Vue.use(ViewUI);

// 路由配置
const RouterConfig = {
    mode: 'hash',
    routes: Routers
};
const router = new VueRouter(RouterConfig);

//路由拦截器 beforeEach
router.beforeEach((to, from, next) => {
    ViewUI.LoadingBar.start();
    Util.title(to.meta.title);
    //页面跳转逻辑
    if (to.path == '/login' && window.sessionStorage.token) {
        if (window.sessionStorage.getItem('userRoleType') == 0) {
            next({ path: '/note' })
        } else {
            next({ path: '/wechat' })
        }
    }
    else {
        next();
    }
});

//路由拦截器 afterEach
router.afterEach((to, from, next) => {
    ViewUI.LoadingBar.finish();
    window.scrollTo(0, 0);
});

/**
 * 手动配置请求拦截器
 */
axios.interceptors.request.use(function (config) {
    if (window.sessionStorage.token) {
        config.headers.common['token'] = window.sessionStorage.token; //将token加入到请求头
    }
    return config
}, function (error) {
    return Promise.reject(error);
});

/**
 * 手动配置添加响应拦截器
 */
axios.interceptors.response.use(function (response) {
    if (response.data.code != undefined && response.data.code != '') {
        if (response.data.code != 200) {
            window.sessionStorage.removeItem('token');//清除本地token
            router.push('/');
        }
    }
    return response;
}, function (error) {
    return Promise.reject(error);
});

new Vue({
    el: '#app',
    router: router,
    render: h => h(App)
});
