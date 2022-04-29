<style scoped>
@import "./index.css";
.ivu-layout {
  background: whitesmoke;
}
</style>

<template>
  <div>
    <Layout style="height: calc(100vh)">
      <!-- 左侧侧边导航 -->
      <Sider :collapsed-width="78" :style="{ background: 'whitesmoke' }">
        <Menu
          theme="light"
          style="
            background-color: whitesmoke;
            color: #2a2a2a;
            height: calc(100vh);
          "
          width="auto"
          :active-name="currentActiveName"
          :open-names="['myClass']"
          @on-select="ClickMenu"
        >
          <!-- 左侧logo -->
          <div
            style="
              color: #1e1e1e;
              height: 64px;
              line-height: 64px;
              text-align: center;
            "
          >
            <h3>{{ logoContent }}</h3>
          </div>
          <!-- 侧边导航 -->
          <!-- 笔记 -->
          <MenuGroup title="笔记" v-if="currentUserInfo.userRoleType == 0">
            <!-- 全部笔记 -->
            <MenuItem name="note">
              <Icon type="md-document" />
              全部笔记
            </MenuItem>
            <!-- 我的文件夹 -->
            <Submenu name="myClass">
              <template slot="title">
                <Icon type="ios-folder-open" />
                我的文件夹
              </template>
              <MenuGroup title="选项">
                <MenuItem name="addClass" style="margin-left: 10px">
                  <Icon type="ios-add" />新增文件夹
                </MenuItem>
              </MenuGroup>
              <MenuGroup title="文件夹列表">
                <MenuItem
                  v-for="(item, index) in listClass"
                  :key="index"
                  :name="item.classId+'.'+index"
                  style="margin-left: 10px"
                >
                  <Icon type="ios-folder-open-outline" />
                  {{ item.className }}</MenuItem
                >
              </MenuGroup>
            </Submenu>
            <!-- 回收站 -->
            <MenuItem name="recyclebin">
              <Icon type="md-archive" />
              回收站
            </MenuItem>
          </MenuGroup>
          <!-- 高级 -->
          <MenuGroup title="高级">
            <!-- 用户信息 -->
            <MenuItem name="wechat" v-if="currentUserInfo.userRoleType == 1">
              <Icon type="md-person" />
              用户信息
            </MenuItem>
            <!-- 账号信息 -->
            <MenuItem name="personal">
              <Icon type="md-finger-print" />
              账号信息
            </MenuItem>
          </MenuGroup>
        </Menu>
      </Sider>
      <!-- 右侧内容 -->
      <Layout>
        <!-- 头部 -->
        <Header
          style="
            position: absolute;
            z-index: 1;
            width: 100%;
            height: 64px;
            right: 0px;
            background: whitesmoke;
            boxshadow: 0 2px 3px 2px rgba(0, 0, 0, 0.1);
            border-bottom: 1px solid #dfe0e4;
          "
        >
          <!-- 用户名和下拉操作 -->
          <Dropdown
            trigger="click"
            transfer
            @on-click="LogOut"
            style="float: right; zindex: 1"
          >
            <a href="javascript:void(0)" style="margin-left: 8px">
              {{ currentUserInfo.userName }}
              <Icon type="ios-arrow-down"></Icon>
            </a>
            <DropdownMenu slot="list">
              <DropdownItem>退出</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <div style="float: right">
            <!-- 默认头像 -->
            <Avatar icon="ios-person" :src="currentUserInfo.userAvatar" />
            <!-- 用户角色 -->
            <a style="margin-left: 8px">{{ currentUserInfo.userRoleName }}</a>
          </div>
        </Header>
        <!-- 内容 -->
        <Content
          :style="{
            minHeight: '260px',
            margin: '84px 20px 0px 20px',
          }"
        >
          <!-- 路由填充 -->
          <router-view></router-view>
        </Content>
      </Layout>
    </Layout>
    <Modal v-model="modalAddClass" title="新增文件夹" @on-ok="AddClass()">
      <Form :label-width="100" @submit.native.prevent>
        <FormItem label="文件夹名称">
          <Input v-model="tempAddClass" />
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      /**
       * 对话框控制
       */
      //添加文件夹
      modalAddClass: false,
      /**
       * 临时变量
       */
      tempAddClass: "",
      /**
       * 文件夹列表
       */
      listClass: [],
      /**
       * 当前用户信息
       */
      currentUserInfo: {
        userId: window.sessionStorage.getItem("userId"),
        userName: window.sessionStorage.getItem("userName"),
        userAvatar: window.sessionStorage.getItem("userAvatar"),
        userRoleType: window.sessionStorage.getItem("userRoleType"),
        userRoleName: window.sessionStorage.getItem("userRoleName"),
        token: window.sessionStorage.getItem("token"),
      },
      //当前选中的导航
      currentActiveName: "",
      //logo文字内容
      logoContent: "网络记事本",
      //当前选中的分类
      currentSelectClassId: window.sessionStorage.getItem(
        "currentSelectClassId"
      ),
    };
  },
  methods: {
    //新增文件夹
    AddClass() {
      var that = this;
      var data = {
        className: that.tempAddClass,
      };
      that.$axios
        .post("/api.php?c=classs&a=AddClass&t=mini", data)
        .then(function (response) {
          var result = response.data;
          if (result.status == 1) {
            that.tempAddClass = '';
            that.$Message.success(result.message);
            that.GetClassList();
          } else {
            that.$Message.error(result.message);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    //获取文件夹列表
    GetClassList() {
      var that = this;
      var data = {};
      that.$axios
        .post("/api.php?c=classs&a=GetClassList&t=mini", data)
        .then(function (response) {
          var result = response.data;
          if (result.status == 1) {
            that.listClass = result.data;
            // that.$Message.success(result.message);
          } else {
            that.$Message.error(result.message);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    //点击导航
    ClickMenu(name) {
      switch (name) {
        case "note":
          //设置当前选中的分类信息
          //0代表没有分类
          window.sessionStorage.setItem("currentSelectClassId", 0);
          //跳转到笔记页面
          this.$router.push({ name: "note" });
          //刷新
          this.$router.go(0);
          break;
        case "addClass":
          //新增文件夹
          this.modalAddClass = true;
          break;
        case "recyclebin":
          //设置当前选中的分类信息
          //-1代表没有垃圾桶
          window.sessionStorage.setItem("currentSelectClassId", -1);
          this.$router.push({ name: "note" });
          //刷新
          this.$router.go(0);
          break;
        case "wechat":
          this.$router.push({ name: name });
          break;
        case "personal":
          this.$router.push({ name: name });
          break;
        default:
          //将 classId.index 的字符串拆开
          var arr = name.split('.');
          var classId = arr[0];
          var index = arr[1];
          //选中的为分类 保存分类的id
          window.sessionStorage.setItem("currentSelectClassId", classId);
          //保存分类的名称
          window.sessionStorage.setItem("currentSelectClassName", this.listClass[index].className);
          //跳转
          this.$router.push({ name: "note" });
          //刷新
          this.$router.go(0);
          break;
      }
    },
    //退出登录
    LogOut() {
      window.sessionStorage.removeItem("userId");
      window.sessionStorage.removeItem("userName");
      window.sessionStorage.removeItem("userAvatar");
      window.sessionStorage.removeItem("userRoleType");
      window.sessionStorage.removeItem("userRoleName");
      window.sessionStorage.removeItem("token");

      this.$router.push({ name: "login" });
      this.$Message.success("退出登录成功");
    },
    // 退出登录下拉组件
    handleCommand(command) {
      switch (command) {
        case "logOut":
          this.logOUt();
          break;
      }
    },
    //路由变化后自动设置导航选中状态
    SetActiveName() {
      var that = this;
      // that.currentActiveName = that.$route.name;
    },
  },
  mounted() {
    //路由变化后自动设置导航选中状态
    this.SetActiveName();
    //检查变量 如果类型没有说明则设置为0
    if (window.sessionStorage.getItem("currentSelectClassId") == undefined) {
      window.sessionStorage.setItem("currentSelectClassId", 0);
    }
    //如果为微信用户则请求文件夹列表
    if (window.sessionStorage.getItem("userRoleType") == 0) {
      this.GetClassList();
    }
  },
  watch: {},
};
</script>