<style lang="less" scoped>
</style>

<template>
  <div>
    <Card :bordered="false" :dis-hover="true">
      <Row type="flex" justify="end">
        <Col span="18"> </Col>
        <Col span="6">
          <Input
            search
            enter-button="搜索"
            placeholder="输入关键字搜索..."
            style="margin-bottom: 15px; width: 315px"
            v-model="wechatSearchKeywords"
            @on-search="GetWechatUserList"
        /></Col>
      </Row>
      <Table border :columns="tableColumnWechat" :data="tableDataWechat">
        <!-- 序号 -->
        <template slot-scope="{ index }" slot="index">
          {{ index + 1 }}
        </template>
        <!-- 微信头像 -->
        <template slot-scope="{ row }" slot="wechatUserAvatarUrl">
          <Avatar :src="row.wechatUserAvatarUrl" />
        </template>
      </Table>
      <Card :bordered="false" :dis-hover="true">
        <Page
          v-if="numWechatTotal != 0"
          :total="numWechatTotal"
          :page-size="numWechatPageSize"
          @on-change="WechatPagesizeChange"
          size="small"
        />
      </Card>
    </Card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      /**
       * 分页数据
       */
      numWechatPageCurrent: 1,
      numWechatPageSize: 10,
      numWechatTotal: 20,
      /**
       * 搜索关键词
       */
      wechatSearchKeywords: "",
      /**
       * 表格数据
       */
      tableColumnWechat: [
        {
          title: "序号",
          slot: "index",
        },
        {
          title: "微信头像",
          key: "wechatUserAvatarUrl",
          slot: "wechatUserAvatarUrl",
        },
        {
          title: "微信昵称",
          key: "wechatUserNickname",
        },
        {
          title: "openid",
          key: "wechatUserOpenid",
        },
        {
          title: "便签数",
          key: "noteCount",
        },
        {
          title: "注册时间",
          key: "wechatUserRegTime",
        },
        {
          title: "上次登录时间",
          key: "wechatUserLastLoginTime",
        },
      ],
      tableDataWechat: [
        // {
        //   wechatUserAvatarUrl: "",
        //   wechatUserNickname: "",
        //   wechatUserOpenid: "",
        //   noteCount: null,
        //   wechatUserRegTime: "",
        //   wechatUserLastLoginTime: "",
        // },
      ],
    };
  },
  methods: {
    //分页改变触发
    WechatPagesizeChange(value) {
      var that = this;
      that.numWechatPageCurrent = value; //设置当前页数
      that.GetWechatUserList();
    },
    //获取微信用户列表
    GetWechatUserList() {
      var that = this;
      var data = {
        pageSize: that.numWechatPageSize,
        currentPage: that.numWechatPageCurrent,
        wechatSearchKeywords: that.wechatSearchKeywords,
      };
      that.$axios
        .post("/api.php?c=account&a=GetWechatUserList&t=web", data)
        .then(function (response) {
          var result = response.data;
          if (result.status == 1) {
            that.tableDataWechat = result.data;
            that.numWechatTotal = result.total;
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
    if (window.sessionStorage.getItem("userRoleType") == 1) {
      this.GetWechatUserList();
    }
  },
};
</script>

<style>
</style>