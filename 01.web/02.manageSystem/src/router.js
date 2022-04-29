const routers = [
    {
        name: 'login',
        path: '/login',
        meta: {
            title: ''
        },
        component: (resolve) => require(['./views/login/index.vue'], resolve)
    },
    {
        name: 'manage',
        path: '/',
        redirect: { name: 'login' },
        meta: {
            title: '首页',
        },
        component: (resolve) => require(['./views/layout/basicLayout/index.vue'], resolve),
        children: [
            {
                name: 'note',
                path: '/note',
                meta: {
                    title: '笔记',
                },
                component: (resolve) => require(['./views/note/index.vue'], resolve)
            },
            {
                name: 'wechat',
                path: '/wechat',
                meta: {
                    title: '信息统计',
                },
                component: (resolve) => require(['./views/wechat/index.vue'], resolve),
            },
            {
                name: 'personal',
                path: '/personal',
                meta: {
                    title: '账号信息',
                },
                component: (resolve) => require(['./views/personal/index.vue'], resolve),
            }
        ]
    },
];
export default routers;