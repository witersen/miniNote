//app.js
App({
  onLaunch: function () {
    //获取系统状态栏信息
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let capsule = wx.getMenuButtonBoundingClientRect();
        if (capsule) {
          this.globalData.Custom = capsule;
          this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
        } else {
          this.globalData.CustomBar = e.statusBarHeight + 50;
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    openid: '',
    domain: "你的接口地址 https://domain.com 注意最后不用添加斜杠"
  },

  //静默登录 获取token
  GetTokenByCode() {
    let that = this;
    return new Promise(function (resolve, reject) {
      wx.login({
        success: res => {
          if (res.code) {
            wx.request({
              url: that.globalData.domain + '/api.php?c=login&a=GetTokenByCode&t=mini',
              data: {
                code: res.code
              },
              header: {
                'content-type': 'application/json',
                'token': ''
              },
              method: 'POST',
              success: res => {
                var result = res.data;
                if (result.status == 1) {
                  //将token存入本地
                  wx.setStorageSync('token', result.data)
                  console.log('app.js GetTokenByCode函数获取token成功')
                }
                resolve(res);
              }
            })
          } else {
            console.log('app.js 获取用户登录态失败！' + res.errMsg);
            reject('error');
          }
        }
      })
    })
  },

  //存储用户信息到后端
  setWechatuserAvatarNickname() {
    let that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: that.globalData.domain + '/api.php?c=login&a=setWechatuserAvatarNickname&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {
          wechatUserNickname: that.globalData.userInfo.nickName,
          wechatUserAvatarUrl: that.globalData.userInfo.avatarUrl 
        },
        success: res => {
          resolve(res);
        },
        fail: res => {
          reject(res);
        }
      })
    })
  }
})