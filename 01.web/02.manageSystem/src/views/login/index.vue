<style scoped>
@import "./index.css";
</style>

<template>
  <Card shadow class="myCard">
    <Tabs>
      <TabPane label="小程序扫码登录" icon="md-qr-scanner">
        <div class="qr">
          <div class="qrTitle">普通用户请打开微信小程序扫码登录</div>
          <!-- 二维码 -->
          <div class="qrContent">
            <!-- 扫码二维码 -->
            <img :src="imgBase64" class="qrImage" />
            <!-- 二维码失效遮罩 -->
            <div v-if="isQrValid != true" @click="GetQrInfo" class="qrMask">
              <Icon class="qrIcon" type="md-refresh" size="45" />
              <span class="qrValid">二维码已失效</span>
              <span class="qrFlush">点击刷新</span>
            </div>
            <!-- 二维码扫码成功遮罩 -->
            <div v-if="isQrSuccess == true" class="qrMask">
              <Icon class="qrIcon" type="md-checkmark" size="45" />
              <span class="qrSuccess">扫描成功</span>
              <span class="qrLogin">登陆中...</span>
            </div>
          </div>
        </div>
      </TabPane>
      <TabPane label="账号密码登录(管理员)" icon="md-contact">
        <Form
          :model="formUserLogin"
          status-icon
          :rules="rules"
          ref="formUserLogin"
          :label-width="100"
          class="demo-formUserLogin"
          @keydown.enter.native="SubmitForm('formUserLogin')"
        >
          <FormItem label="用户名" prop="userName">
            <Input v-model.number="formUserLogin.userName"></Input>
          </FormItem>
          <FormItem label="密码" prop="userPass">
            <Input
              type="password"
              v-model="formUserLogin.userPass"
              autocomplete="on"
            ></Input>
          </FormItem>
          <FormItem>
            <Button type="primary" @click="SubmitForm('formUserLogin')"
              >登录</Button
            >
          </FormItem>
        </Form>
      </TabPane>
    </Tabs>
  </Card>
</template>

<script>
export default {
  data() {
    //   用户名不为空校验
    var checkUserName = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("用户名不能为空"));
      } else {
        callback();
      }
    };
    // 密码不为空校验
    var checkUserpass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("密码不能为空"));
      } else {
        callback();
      }
    };
    return {
      //定时器
      timer: null,
      //二维码图片信息
      imgBase64: "",
      //二维码内容信息
      qrContent: "",
      //二维码是否失效
      isQrValid: true,
      //二维码是否成功扫码登陆
      isQrSuccess: false,
      // 登录表单
      formUserLogin: {
        userName: "",
        userPass: "",
      },
      // 登录校验规则
      rules: {
        userPass: [{ validator: checkUserpass, trigger: "blur" }],
        userName: [{ validator: checkUserName, trigger: "blur" }],
      },
    };
  },
  methods: {
    //表单提交
    SubmitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.Login();
        } else {
          return false;
        }
      });
    },
    //登录
    Login() {
      var that = this;
      var data = {
        userName: that.formUserLogin.userName,
        userPass: that.formUserLogin.userPass,
      };
      that.$axios
        .post("/api.php?c=login&a=Login&t=web", data)
        .then(function (response) {
          var result = response.data;
          if (result.status == 1) {
            //存储信息
            window.sessionStorage.setItem("userId", result.userId);
            window.sessionStorage.setItem("userName", result.userName);
            window.sessionStorage.setItem("userAvatar", result.userAvatar);
            window.sessionStorage.setItem("userRoleType", result.userRoleType);
            window.sessionStorage.setItem("userRoleName", result.userRoleName);
            window.sessionStorage.setItem("token", result.token);
            //跳转到微信用户展示页面
            that.$router.push({ name: "wechat" });
            //成功提示
            that.$Message.success("登录成功");
          } else {
            that.$Message.error(result.message);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    //web端请求新的QR信息
    GetQrInfo() {
      var that = this;
      that.isQrValid = true;
      var data = {};
      that.$axios
        .post("/api.php?c=login&a=GetQrInfo&t=web", data)
        .then(function (response) {
          var result = response.data;
          if (result.status == 1) {
            //渲染二维码
            that.imgBase64 = result.data.imgBase64;
            that.qrContent = result.data.qrContent;
            //设置定时器
            that.timer = window.setInterval(() => {
              setTimeout(that.GetQrStatus(), 0);
            }, 1000);
            //离开页面清除定时器
            that.$once("hook:beforeDestroy", () => {
              clearInterval(that.timer);
            });
          } else {
            that.$Message.error(result.message);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    //web端请求查询QR状态
    GetQrStatus() {
      var that = this;
      var data = {
        qrContent: that.qrContent,
      };
      that.$axios
        .post("/api.php?c=login&a=GetQrStatus&t=web", data)
        .then(function (response) {
          var result = response.data;
          if (result.status == 1) {
            if (result.data == 1) {
              //销毁定时器
              clearInterval(that.timer);
              //过期提示
              that.isQrValid = false;
            } else if (result.data == 2) {
              //未扫码提示
              // that.$Message.success(result.message);
            } else {
              //销毁定时器
              clearInterval(that.timer);
              //扫码成功
              that.isQrSuccess = true;
              //存储信息
              window.sessionStorage.setItem("userId", result.userId);
              window.sessionStorage.setItem("userName", result.userName);
              window.sessionStorage.setItem("userAvatar", result.userAvatar);
              window.sessionStorage.setItem(
                "userRoleType",
                result.userRoleType
              );
              window.sessionStorage.setItem(
                "userRoleName",
                result.userRoleName
              );
              window.sessionStorage.setItem("token", result.token);
              //延时跳转
              setTimeout(function () {
                //跳转到首页
                that.$router.push({ name: "note" });
                //成功提示
                that.$Message.success("登录成功");
              }, 2000);
            }
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
    this.GetQrInfo();
  },
};
</script>