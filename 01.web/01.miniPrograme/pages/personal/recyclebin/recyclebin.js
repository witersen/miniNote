//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //搜索笔记关键词
    searchNoteKeyword: '',
    //导航栏
    CustomBar: app.globalData.CustomBar,
    /**
     * 对话框
     */
    modalShowNote: false,//笔记对话框显示

    /**
     * 笔记信息
     */
    formNoteInfo: {
      //导航类型
      navTitle: "全部笔记", //全部笔记、按分类查看笔记、回收站笔记
      //导航类型
      navType: 0, //全部笔记 0、按分类查看笔记 1、回收站笔记 2
      //笔记数量
      noteCount: 9,
      //排序方式
      sortType: 1, //按照编辑时间排序 0、按照创建时间排序 1
      //是否可编辑内容
      editAble: 1, //可编辑 0、不可编辑 1
      //当前笔记搜索关键词
      searchNoteKeyWord: "",
      //笔记内容
      noteList: [],
    },
    /**
     * 选中信息
     */
    formCurrentSelect: {
      classId: 0,
      classIndex: 0,
      noteIndex: 0,
      noteId: 0,
      //笔记栏的标题内容
      className: "",
      //笔记栏的标题可编辑状态
      classTitleReadonly: false,
    },
  },

  //搜索框的输入值
  BindNoteSearch(e) {
    var that = this;
    that.setData({
      ['formNoteInfo.searchNoteKeyWord']: e.detail.value
    })
    //请求
    that.GetNoteList();
  },

  //点击笔记跳转
  ClickNote(e) {
    wx.showToast({
      title: '请先恢复',
      icon: 'error',
      duration: 1500
    })
  },

  //隐藏笔记对话框
  ModalHideNote() {
    this.setData({
      modalShowNote: false
    })
  },

  //删除笔记
  DelNote() {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.domain + '/api.php?c=note&a=DelNote&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {
          noteId: that.data.formCurrentSelect.noteId
        },
        success: res => {
          var result = res.data;
          if (result.status == 1) {
            that.setData({
              modalShowNote: false
            })
            wx.showToast({
              title: result.message,
              icon: 'success',
              duration: 1500
            })
            that.GetNoteList()
          } else {
            wx.showToast({
              title: result.message,
              icon: 'error',
              duration: 1500
            })
          }
          resolve(res);
        },
        fail: res => {
          reject(res);
        }
      })
    })
  },

  /**
   * 长按笔记触发
   * 
   * 设置为私密
   * 删除
   * 移动到
   */
  LongperssNote(e) {
    var that = this;
    //存储
    wx.setStorageSync('currentSelectNoteId', e.currentTarget.dataset.noteid);
    wx.setStorageSync('currentSelectNoteIndex', e.currentTarget.dataset.noteindex);
    //赋值
    that.setData({
      //保存index可用于渲染时直接使用下标拿到更到的值
      ['formCurrentSelect.noteIndex']: e.currentTarget.dataset.noteindex,
      //保存id可用于请求时直接传递id
      ['formCurrentSelect.noteId']: e.currentTarget.dataset.noteid,
      modalShowNote: true
    })
  },

  //获取笔记列表
  GetNoteList() {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.domain + '/api.php?c=note&a=GetNoteList&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {
          //由于存在长按操作 所以classId要从storage取值 不能从变量取值
          classId: wx.getStorageSync('currentSelectClassId'),
          sortType: that.data.formNoteInfo.sortType,
          searchNoteKeyWord: that.data.formNoteInfo.searchNoteKeyWord
        },
        success: res => {
          var result = res.data;
          if (result.status == 1) {
            that.setData({
              ['formNoteInfo.noteList']: result.data
            })
          } else {
            wx.showToast({
              title: result.message,
              icon: 'error',
              duration: 1500
            })
          }
          resolve(res);
        },
        fail: res => {
          reject(res);
        }
      })
    })
  },

  //取消删除笔记
  RecoveryNote() {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.domain + '/api.php?c=recyclebin&a=RecoveryNote&t=mini',
        method: "post",
        header: {
          'content-type': 'application/json',
          'token': wx.getStorageSync('token')
        },
        data: {
          noteId: that.data.formCurrentSelect.noteId
        },
        success: res => {
          var result = res.data;
          if (result.status == 1) {
            wx.showToast({
              title: result.message,
              icon: 'success',
              duration: 1500
            })
            that.setData({
              modalShowNote: false
            })
            that.GetNoteList();
          } else {
            wx.showToast({
              title: result.message,
              icon: 'error',
              duration: 1500
            })
          }
          resolve(res);
        },
        fail: res => {
          reject(res);
        }
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //设置
    this.GetNoteList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //在此页面要恢复选中的class信息为-1
    var that = this;
    //存储
    wx.setStorageSync('currentSelectClassId', -1);
    //赋值
    that.setData({
      ['formCurrentSelect.classIndex']: -1,
    })
    //
    that.onLoad();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})