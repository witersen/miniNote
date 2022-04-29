<style lang="less" scoped>
</style>

<template>
  <div>
    <Card :bordered="false" :dis-hover="true">
      <Tabs>
        <TabPane
          label="隐私密码"
          icon="md-finger-print"
          v-if="currentUserInfo.userRoleType == 0"
        >
          <Row>
            <Col span="8">
              <Card
                :bordered="true"
                :dis-hover="true"
                v-if="isSetPrivatePass == false"
              >
                <p slot="title">隐私密码初始化</p>
                <Form
                  ref="formInitPrivatePass"
                  :model="formInitPrivatePass"
                  :label-width="80"
                >
                  <FormItem label="新密码">
                    <Input
                      v-model="formInitPrivatePass.wechatUserEncrptPass"
                      password
                      type="password"
                    />
                  </FormItem>
                  <FormItem label="确认密码">
                    <Input
                      v-model="formInitPrivatePass.wechatUserEncrptPassConfirm"
                      password
                      type="password"
                    />
                  </FormItem>
                  <FormItem>
                    <Button type="primary" @click="InitPrivatePass()"
                      >确认设置</Button
                    >
                  </FormItem>
                </Form>
              </Card>
              <Card :bordered="true" :dis-hover="true" v-else>
                <p slot="title">隐私密码修改</p>
                <Form
                  ref="formEditPrivatePass"
                  :model="formEditPrivatePass"
                  :label-width="80"
                >
                  <FormItem label="原密码">
                    <Input
                      v-model="formEditPrivatePass.wechatUserEncrptPassOld"
                      password
                      type="password"
                    />
                  </FormItem>
                  <FormItem label="新密码">
                    <Input
                      v-model="formEditPrivatePass.wechatUserEncrptPassNew"
                      password
                      type="password"
                    />
                  </FormItem>
                  <FormItem label="确认密码">
                    <!-- 由于vue版本问题 此处不可格式化 -->
                    <Input
                      v-model="formEditPrivatePass.wechatUserEncrptPassNewConfirm"
                      password
                      type="password"
                    />
                  </FormItem>
                  <FormItem>
                    <Button type="primary" @click="EditPrivatePass()"
                      >确认修改</Button
                    >
                  </FormItem>
                </Form>
              </Card>
            </Col>
            <Col span="8" offset="1"> </Col>
          </Row>
        </TabPane>
        <TabPane
          label="管理员密码"
          icon="md-finger-print"
          v-if="currentUserInfo.userRoleType == 1"
        >
          <Row>
            <Col span="8">
              <Card :bordered="true" :dis-hover="true">
                <p slot="title">管理员密码修改</p>
                <Form ref="formAdmin" :model="formAdmin" :label-width="80">
                  <FormItem label="用户名">
                    <Input v-model="formAdmin.webUserName" disabled />
                  </FormItem>
                  <FormItem label="新密码">
                    <Input
                      v-model="formAdmin.webUserPass"
                      password
                      type="password"
                    />
                  </FormItem>
                  <FormItem label="确认密码">
                    <Input
                      v-model="formAdmin.webUserPassConfirm"
                      password
                      type="password"
                    />
                  </FormItem>
                  <FormItem>
                    <Button type="primary" @click="EditAdminInfo()"
                      >确认修改</Button
                    >
                  </FormItem>
                </Form>
              </Card>
            </Col>
            <Col span="8" offset="1"> </Col>
          </Row>
        </TabPane>
      </Tabs>
    </Card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //微信用户的隐私密码设置装填
      isSetPrivatePass: false,
      /**
       * 表单
       */
      //微信用户初始化隐私密码
      formInitPrivatePass: {
        wechatUserEncrptPass: "",
        wechatUserEncrptPassConfirm: "",
      },
      //微信用户修改隐私密码
      formEditPrivatePass: {
        wechatUserEncrptPassOld: "",
        wechatUserEncrptPassNew: "",
        wechatUserEncrptPassNewConfirm: "",
      },
      //管理员用户信息修改
      formAdmin: {
        webUserName: window.sessionStorage.getItem('userName'),
        webUserPass: "",
        webUserPassConfirm: "",
      },
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
    };
  },
  methods: {
    //获取微信用户隐私密码设置状态
    GetPrivatePassInfo() {
      var that = this;
      var data = {};
      that.$axios
        .post("/api.php?c=account&a=GetPrivatePassInfo&t=mini", data)
        .then(function (response) {
          var result = response.data;
          if (result.status == 1) {
            if (result.data == 1) {
              that.isSetPrivatePass = false;
            } else if (result.data == 2) {
              that.isSetPrivatePass = true;
            }
          } else {
            that.$Message.error(result.message);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    //微信用户初次设置隐私密码
    InitPrivatePass() {
      var that = this;
      var data = {
        wechatUserEncrptPass: that.formInitPrivatePass.wechatUserEncrptPass,
        wechatUserEncrptPassConfirm:
          that.formInitPrivatePass.wechatUserEncrptPassConfirm,
      };
      that.$axios
        .post("/api.php?c=account&a=InitPrivatePass&t=mini", data)
        .then(function (response) {
          var result = response.data;
          if (result.status == 1) {
            that.$Message.success(result.message);
            that.GetPrivatePassInfo();
          } else {
            that.$Message.error(result.message);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    //微信用户修改隐私密码
    EditPrivatePass() {
      var that = this;
      var data = {
        wechatUserEncrptPassOld:
          that.formEditPrivatePass.wechatUserEncrptPassOld,
        wechatUserEncrptPassNew:
          that.formEditPrivatePass.wechatUserEncrptPassNew,
        wechatUserEncrptPassNewConfirm:
          that.formEditPrivatePass.wechatUserEncrptPassNewConfirm,
      };
      that.$axios
        .post("/api.php?c=account&a=EditPrivatePass&t=mini", data)
        .then(function (response) {
          var result = response.data;
          if (result.status == 1) {
            that.$Message.success(result.message);
          } else {
            that.$Message.error(result.message);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    //修改管理员密码
    EditAdminInfo() {
      var that = this;
      var data = {
        webUserName: that.formAdmin.webUserName,
        webUserPass: that.formAdmin.webUserPass,
        webUserPassConfirm: that.formAdmin.webUserPassConfirm,
      };
      that.$axios
        .post("/api.php?c=account&a=EditAdminInfo&t=web", data)
        .then(function (response) {
          var result = response.data;
          if (result.status == 1) {
            that.$Message.success(result.message);
          } else {
            that.$Message.error(result.message);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
  },
  created() {},
  mounted() {
    var that = this;
    //如果为微信用户 则进行请求
    if (that.currentUserInfo.userRoleType == 0) {
      that.GetPrivatePassInfo();
    }
  },
};
</script>

<style>
</style>