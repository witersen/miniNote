let util = {

};
util.title = function (title) {
    title = title ? title + ' - 网络记事本' : '网络记事本';
    window.document.title = title;
};

export default util;
