<style lang="less" scoped>
.ivu-list-item:hover {
  background: #cacaca;
}
</style>

<template>
  <div>
    <Row :gutter="16">
      <Col span="6">
        <Card
          :bordered="true"
          :dis-hover="false"
          style="height: calc(100vh - 104px)"
        >
          <Input
            slot="title"
            placeholder="标题..."
            :border="false"
            style="width: 85%"
            v-model="formCurrentSelect.className"
            @on-change="EditClass"
            :readonly="formCurrentSelect.classTitleReadonly"
          />
          <Button
            slot="title"
            type="text"
            icon="md-trash"
            style="float: right; color: #ed4014"
            v-if="formCurrentSelect.classId > 0"
            @click="DelClass"
          ></Button>

          <!-- 搜索和添加笔记 -->
          <Row style="margin-bottom: 10px">
            <Col span="20">
              <Input
                placeholder="搜索全部笔记"
                v-model="formNoteInfo.searchNoteKeyWord"
                size="large"
                @on-change="GetNoteList"
              >
                <Icon type="md-search" size="22" slot="prefix" />
              </Input>
            </Col>
            <Col span="4">
              <Icon
                type="md-add-circle"
                size="45"
                color="#fb0"
                style="cursor: pointer"
                @click="AddNote"
              />
            </Col>
          </Row>
          <!-- 查看方式 -->
          <Row
            style="margin-bottom: 10px; font-size: 12px"
            type="flex"
            justify="space-between"
          >
            <Col span="12"> 共{{ formNoteInfo.noteCount }}条笔记 </Col>
            <Col span="7">
              <Dropdown
                trigger="click"
                :transfer="true"
                @on-click="DropdownSortType"
              >
                <a href="javascript:void(0)">
                  <span v-if="formNoteInfo.sortType == 0">按编辑时间</span>
                  <span v-else>按创建时间</span>
                  <Icon type="md-arrow-dropdown" />
                </a>
                <DropdownMenu slot="list">
                  <DropdownItem style="font-size: 12px !important" name="0"
                    >按编辑时间</DropdownItem
                  >
                  <DropdownItem style="font-size: 12px !important" name="1"
                    >按创建时间</DropdownItem
                  >
                </DropdownMenu>
              </Dropdown>
            </Col>
          </Row>
          <!-- 列表 -->
          <Scroll height="442">
            <List :border="true" size="small" style="margin-right: 5px">
              <ListItem
                :style="formCurrentSelect.noteIndex==indexNote?'cursor: pointer;background: #cacaca;':'cursor: pointer;'"
                v-for="(itemNote, indexNote) in formNoteInfo.noteList"
                :key="indexNote"
                @click.native="ClickNote(indexNote)"
              >
                <ListItemMeta
                  :title="itemNote.noteTitle"
                  :description="itemNote.noteDescription"
                />
                <template slot="action">
                  <!-- 锁图标 表示有没有进行过解密 -->
                  <!-- 由于vue版本和格式化的问题 此处不能换行格式化 -->
                  <li
                    v-if="itemNote.noteEncryptStatus == 1 &&itemNote.noteLockStatus == 1"
                  >
                    <Icon type="ios-lock-outline" />
                  </li>
                  <!-- 由于vue版本和格式化的问题 此处不能换行格式化 -->
                  <li
                    v-if="itemNote.noteEncryptStatus == 1 &&itemNote.noteLockStatus != 1"
                  >
                    <Icon type="ios-unlock-outline" />
                  </li>
                  <li>
                    <!-- 不仅将DropdownItem的name值拿到 同时将下标值也拿到 -->
                    <Dropdown
                      trigger="hover"
                      :transfer="true"
                      @on-click="(value) => DropdownNote(value, indexNote)"
                    >
                      <a href="javascript:void(0)">
                        <Icon type="ios-more" />
                      </a>
                      <DropdownMenu
                        slot="list"
                        v-if="formCurrentSelect.classId >= 0"
                      >
                        <DropdownItem
                          name="EditNoteTitle"
                          style="font-size: 12px !important"
                          >标题</DropdownItem
                        >
                        <DropdownItem
                          name="EncryptNote"
                          style="font-size: 12px !important"
                          v-if="
                            formNoteInfo.noteList[indexNote]
                              .noteEncryptStatus == 0
                          "
                          >加密</DropdownItem
                        >
                        <DropdownItem
                          name="DecryptNote"
                          style="font-size: 12px !important"
                          v-if="
                            formNoteInfo.noteList[indexNote]
                              .noteEncryptStatus == 1
                          "
                          >解密</DropdownItem
                        >
                        <DropdownItem
                          name="DelNote"
                          style="font-size: 12px !important"
                          >删除</DropdownItem
                        >
                        <DropdownItem
                          name="RemoveNote"
                          style="font-size: 12px !important"
                          >移动</DropdownItem
                        >
                      </DropdownMenu>
                      <DropdownMenu slot="list" v-else>
                        <DropdownItem
                          name="RecoveryNote"
                          style="font-size: 12px !important"
                          >恢复</DropdownItem
                        >
                        <DropdownItem
                          name="DelNote"
                          style="font-size: 12px !important"
                          >彻底删除</DropdownItem
                        >
                      </DropdownMenu>
                    </Dropdown>
                  </li>
                </template>
              </ListItem>
            </List>
          </Scroll>
        </Card>
      </Col>
      <Col span="18">
        <Card
          :bordered="true"
          :dis-hover="false"
          style="height: calc(100vh - 104px)"
        >
          <mavon-editor
            :editable="formCurrentSelect.classId != -1&&formNoteInfo.noteList!=''"
            :boxShadow="true"
            v-model="tempContent"
            @change="EditNoteContent"
            style="height: calc(100vh - 204px); z-index: auto"
          />
          <Card :bordered="true" :dis-hover="true" style="margin-top: 10px">
            <Tag
              type="dot"
              v-for="(item, index) in tempTagList"
              :key="index"
              :name="item.tagId"
              closable
              @on-close="DelNoteTag"
              color="primary"
              >{{ item.tagName }}</Tag
            >
            <Button
              icon="ios-add"
              type="dashed"
              size="small"
              :disabled="formCurrentSelect.classId == -1||formNoteInfo.noteList==''"
              @click="modalAddNoteTag = true"
              >添加标签</Button
            >
          </Card>
        </Card>
      </Col>
    </Row>
    <!-- 解密笔记 -->
    <Modal v-model="modalDecryptNote" title="解密笔记" @on-ok="DecryptNote">
      <Form :label-width="120" @submit.native.prevent>
        <FormItem label="请输入隐私密码">
          <Input v-model="tempPrivatePass" />
        </FormItem>
      </Form>
    </Modal>
    <!-- 修改笔记标题 -->
    <Modal
      v-model="modalEditNoteTitle"
      title="修改笔记标题"
      @on-ok="EditNoteTitle"
    >
      <Form :label-width="120" @submit.native.prevent>
        <FormItem label="请输入新标题">
          <Input v-model="tempNoteTitle" />
        </FormItem>
      </Form>
    </Modal>
    <!-- 移动笔记 -->
    <Modal v-model="modalRemoveNote" title="移动笔记到文件夹">
      <Scroll>
        <Table
          border
          highlight-row
          ref="currentRowTable"
          @on-current-change="RemoveNote"
          :columns="tableColumnClass"
          :data="tableDataClass"
        >
          <template slot-scope="{ row }" slot="selectStatus">
            <Button
              type="info"
              size="small"
              v-if="row.selectStatus == 1"
              >已选中</Button
            >
          </template>
        </Table>
      </Scroll>
    </Modal>
    <!-- 解锁笔记查看内容 -->
    <Modal
      v-model="modalUnlockNote"
      title="解锁笔记查看内容"
      @on-ok="UnlockNote"
    >
      <Form :label-width="120" @submit.native.prevent>
        <FormItem label="请输入隐私密码">
          <Input v-model="tempPrivatePass" />
        </FormItem>
      </Form>
    </Modal>
    <!-- 添加标签 -->
    <Modal v-model="modalAddNoteTag" title="添加标签" @on-ok="AddNoteTag">
      <Form :label-width="120" @submit.native.prevent>
        <FormItem label="请输入标签名称">
          <Input v-model="tempTagName" />
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
      //解密笔记
      modalDecryptNote: false,
      //修改笔记标题
      modalEditNoteTitle: false,
      //移动笔记
      modalRemoveNote: false,
      //解锁笔记
      modalUnlockNote: false,
      //添加标签
      modalAddNoteTag: false,

      /**
       * 临时变量
       */
      //编辑框内容
      tempContent: "",
      //隐私密码
      tempPrivatePass: "",
      //笔记标题
      tempNoteTitle: "",
      //标签名称
      tempTagName: "",
      //标签列表
      tempTagList: [],

      /**
       * 表格
       */
      tableColumnClass: [
        {
          title: "文件夹名称",
          key: "className",
        },
        {
          title: "选中状态",
          width: 100,
          slot: "selectStatus",
        },
      ],
      tableDataClass: [],

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
        //当前选中的笔记分类下标
        classId: 0,
        //当前选中的笔记下标
        noteIndex: 0,
        //笔记栏的标题内容
        className: "",
        //笔记栏的标题可编辑状态
        classTitleReadonly: false,
      },
    };
  },
  methods: {
    //设置信息
    SetCurrentInfo() {
      var that = this;
      //检查变量 如果类型没有说明则设置为0
      if (window.sessionStorage.getItem("currentSelectClassId") == undefined) {
        window.sessionStorage.setItem("currentSelectClassId", 0);
        window.sessionStorage.setItem("currentSelectClassName",'全部笔记');
      }
      var classId = window.sessionStorage.currentSelectClassId;
      //当前选中的分类id
      that.formCurrentSelect.classId = classId;
      //-1代表回收站
      if (classId == -1) {
        that.formCurrentSelect.className = "回收站";
        that.formCurrentSelect.classTitleReadonly = true;
      } else if (classId == 0) {
        //0代表无分类
        that.formCurrentSelect.className = "全部笔记";
        that.formCurrentSelect.classTitleReadonly = true;
      } else {
        //其它正整数代表分类id
        that.formCurrentSelect.className =
          window.sessionStorage.currentSelectClassName;
        that.formCurrentSelect.classTitleReadonly = false;
      }
    },

    //添加笔记
    AddNote() {
      var that = this;
      var data = {
        classId: that.formCurrentSelect.classId,
      };
      that.$axios
        .post("/api.php?c=note&a=AddNote&t=mini", data)
        .then(function (response) {
          var result = response.data;
          if (result.status == 1) {
            that.$Message.success(result.message);
            that.GetNoteList();
          } else {
            that.$Message.error(result.message);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    //获取个人的笔记列表 可选择全部笔记、按找分类、回收站等
    GetNoteList() {
      var that = this;
      var data = {
        /**
         * 当前分类类型
         *
         * 0 没有分类
         * -1 垃圾桶
         * 正整数 分类id
         */
        classId: that.formCurrentSelect.classId,
        //排序方式
        sortType: that.formNoteInfo.sortType,
        //搜索关键词
        searchNoteKeyWord: that.formNoteInfo.searchNoteKeyWord,
      };
      that.$axios
        .post("/api.php?c=note&a=GetNoteList&t=mini", data)
        .then(function (response) {
          var result = response.data;
          if (result.status == 1) {
            that.formNoteInfo.noteList = result.data;
            that.formNoteInfo.noteCount = result.noteCount;
            /**
             * 反向同步笔记内容+标签内容
             */
            if(result.data==''){
              return;
            }
            if(that.formCurrentSelect.classId == -1){
              return;
            }
            that.tempContent = that.formNoteInfo.noteList[that.formCurrentSelect.noteIndex].noteContent;
            that.tempTagList = that.formNoteInfo.noteList[that.formCurrentSelect.noteIndex].tagList;
          } else {
            that.$Message.error(result.message);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    //点击每条笔记的更多选项
    DropdownNote(name, indexNote) {
      /**
       * 切换笔记下标
       */
      this.formCurrentSelect.noteIndex = indexNote;
      window.sessionStorage.setItem("currentSelectNoteIndex", indexNote);
      /**
       * 正向同步笔记内容+标签内容
       */
      if(this.formCurrentSelect.classId != -1){
        this.tempContent = this.formNoteInfo.noteList[this.formCurrentSelect.noteIndex].noteContent;
        this.tempTagList = this.formNoteInfo.noteList[this.formCurrentSelect.noteIndex].tagList;
      }
      //switch
      switch (name) {
        case "EncryptNote":
          //加密笔记前先检查是否设置了隐私密码
          this.GetPrivatePassInfo();
          break;
        case "DecryptNote":
          //解密笔记
          this.modalDecryptNote = true;
          break;
        case "EditNoteTitle":
          //修改笔记标题
          this.modalEditNoteTitle = true;
          break;
        case "DelNote":
          //删除笔记
          this.DelNote();
          break;
        case "RemoveNote":
          //移动笔记到文件夹
          this.GetClassList2();
          break;
        case "RecoveryNote":
          //从回收站恢复笔记
          this.RecoveryNote();
          break;
        default:
          break;
      }
    },
    //点击切换排序方式
    DropdownSortType(sortType) {
      //切换排序方式
      this.formNoteInfo.sortType = sortType;
      //重新获取列表
      this.GetNoteList();
    },
    //点击某条笔记
    ClickNote(indexNote) {
      var that = this;
      //检查是否处于回收站
      if (that.formCurrentSelect.classId == -1) {
        that.$Message.error("请恢复笔记后查看内容");
        return;
      }
      /**
       * 同步之前的数据
       * 反向同步笔记内容+标签内容
       */
      that.formNoteInfo.noteList[that.formCurrentSelect.noteIndex].noteContent = that.tempContent;
      that.formNoteInfo.noteList[that.formCurrentSelect.noteIndex].tagList = that.tempTagList;
      /**
       * 切换笔记下标
       */
      that.formCurrentSelect.noteIndex = indexNote;
      window.sessionStorage.setItem("currentSelectNoteIndex", indexNote);
      //检查是否为加密未解锁状态
      if (
        that.formNoteInfo.noteList[indexNote].noteEncryptStatus == 1 &&
        that.formNoteInfo.noteList[indexNote].noteLockStatus == 1
      ) {
        that.modalUnlockNote = true;
        return;
      }
      //获取笔记列表
      that.GetNoteList();
    },
    //修改笔记标题
    EditNoteTitle() {
      var that = this;
      var data = {
        noteId:
          that.formNoteInfo.noteList[that.formCurrentSelect.noteIndex].noteId,
        noteTitle: that.tempNoteTitle,
      };
      that.$axios
        .post("/api.php?c=note&a=EditNoteTitle&t=mini", data)
        .then(function (response) {
          var result = response.data;
          if (result.status == 1) {
            that.$Message.success(result.message);
            that.tempNoteTitle = "";
            that.GetNoteList();
          } else {
            that.$Message.error(result.message);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    //加密笔记
    EncryptNote() {
      var that = this;
      var data = {
        noteId:
          that.formNoteInfo.noteList[that.formCurrentSelect.noteIndex].noteId,
      };
      that.$axios
        .post("/api.php?c=note&a=EncryptNote&t=mini", data)
        .then(function (response) {
          var result = response.data;
          if (result.status == 1) {
            that.$Message.success(result.message);
            that.GetNoteList();
          } else {
            that.$Message.error(result.message);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    //解密笔记
    DecryptNote() {
      var that = this;
      var data = {
        noteId:
          that.formNoteInfo.noteList[that.formCurrentSelect.noteIndex].noteId,
        wechatUserEncrptPass: that.tempPrivatePass,
      };
      that.$axios
        .post("/api.php?c=note&a=DecryptNote&t=mini", data)
        .then(function (response) {
          var result = response.data;
          if (result.status == 1) {
            that.$Message.success(result.message);
            //清空输入框
            that.tempPrivatePass = "";
            that.GetNoteList();
          } else {
            that.$Message.error(result.message);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
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
              that.$Message.error("请先设置隐私密码");
            } else if (result.data == 2) {
              that.EncryptNote();
            }
          } else {
            that.$Message.error(result.message);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    //删除笔记
    DelNote() {
      var that = this;
      that.$Modal.confirm({
        title: "警告",
        content: "确定要删除该条笔记吗？",
        onOk: () => {
          var data = {
            noteId:
              that.formNoteInfo.noteList[that.formCurrentSelect.noteIndex]
                .noteId,
          };
          that.$axios
            .post("/api.php?c=note&a=DelNote&t=mini", data)
            .then(function (response) {
              var result = response.data;
              if (result.status == 1) {
                //成功提示
                that.$Message.success(result.message);
                that.GetNoteList();
              } else {
                that.$Message.error(result.message);
              }
            })
            .catch(function (error) {
              console.log(error);
            });
        },
        onCancel: () => {},
      });
    },
    //移动笔记到文件夹
    RemoveNote(e) {
      if(e==null){
        $this.$Message.error('请重试');
        return;
      }
      var that = this;
      var data = {
        noteId:
          that.formNoteInfo.noteList[that.formCurrentSelect.noteIndex].noteId,
        classId: e.classId,
      };
      that.$axios
        .post("/api.php?c=note&a=RemoveNote&t=mini", data)
        .then(function (response) {
          var result = response.data;
          if (result.status == 1) {
            that.GetClassList2();
          } else {
            that.$Message.error(result.message);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },

    //解锁笔记
    UnlockNote() {
      var that = this;
      var data = {
        noteId:
          that.formNoteInfo.noteList[that.formCurrentSelect.noteIndex].noteId,
        wechatUserEncrptPass: that.tempPrivatePass,
      };
      that.$axios
        .post("/api.php?c=note&a=UnlockNote&t=mini", data)
        .then(function (response) {
          var result = response.data;
          if (result.status == 1) {
            that.$Message.success(result.message);
            //清空编辑器
            that.tempPrivatePass = "";
            that.GetNoteList();
          } else {
            that.$Message.error(result.message);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    //编辑笔记内容
    EditNoteContent(value,render) {
      if (render == "") {
        return;
      }
      var that = this;
      /**
       * 正向同步笔记内容+标签内容
       */
      that.formNoteInfo.noteList[that.formCurrentSelect.noteIndex].noteContent =that.tempContent ;
      that.formNoteInfo.noteList[that.formCurrentSelect.noteIndex].tagList =that.tempTagList;
      var data = {
        noteId:
          that.formNoteInfo.noteList[that.formCurrentSelect.noteIndex].noteId,
        noteContent: render,
      };
      that.$axios
        .post("/api.php?c=note&a=EditNoteContent&t=mini", data)
        .then(function (response) {
          var result = response.data;
          if (result.status == 1) {
            // that.$Message.success(result.message);
          } else {
            that.$Message.error(result.message);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },

    //添加标签
    AddNoteTag() {
      var that = this;
      var data = {
        noteId:
          that.formNoteInfo.noteList[that.formCurrentSelect.noteIndex].noteId,
        tagName: that.tempTagName,
      };
      that.$axios
        .post("/api.php?c=tag&a=AddNoteTag&t=mini", data)
        .then(function (response) {
          var result = response.data;
          if (result.status == 1) {
            that.$Message.success(result.message);
            //清空输入框
            that.tempTagName = "";
            that.GetNoteList();
          } else {
            that.$Message.error(result.message);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    //删除标签
    DelNoteTag(event, name) {
      var that = this;
      var data = {
        noteId:
          that.formNoteInfo.noteList[that.formCurrentSelect.noteIndex].noteId,
        tagId: name,
      };
      that.$axios
        .post("/api.php?c=tag&a=DelNoteTag&t=mini", data)
        .then(function (response) {
          var result = response.data;
          if (result.status == 1) {
            that.$Message.success(result.message);
            that.GetNoteList();
          } else {
            that.$Message.error(result.message);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },

    //编辑文件夹名称
    EditClass() {
      var that = this;
      //回收站或者全部分类
      if (that.formCurrentSelect.classId <= 0) {
        return;
      }
      var data = {
        classId: that.formCurrentSelect.classId,
        className: that.formCurrentSelect.className,
      };
      that.$axios
        .post("/api.php?c=classs&a=EditClass&t=mini", data)
        .then(function (response) {
          var result = response.data;
          if (result.status == 1) {
            // that.GetNoteList();
          } else {
            that.$Message.error(result.message);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    //删除文件夹
    DelClass() {
      var that = this;
      that.$Modal.confirm({
        title: "警告",
        content: "删除文件夹会同步删除包含的笔记，确定要继续吗？",
        onOk: () => {
          var data = {
            classId: that.formCurrentSelect.classId,
          };
          that.$axios
            .post("/api.php?c=classs&a=DelClass&t=mini", data)
            .then(function (response) {
              var result = response.data;
              if (result.status == 1) {
                //成功提示
                that.$Message.success(result.message);
                //将分类重置为0
                window.sessionStorage.setItem("currentSelectClassId", 0);
                //刷新
                that.$router.go(0);
              } else {
                that.$Message.error(result.message);
              }
            })
            .catch(function (error) {
              console.log(error);
            });
        },
        onCancel: () => {},
      });
    },
    //获取文件夹列表
    GetClassList2() {
      var that = this;
      var data = {
        noteId:
          that.formNoteInfo.noteList[that.formCurrentSelect.noteIndex].noteId,
      };
      that.$axios
        .post("/api.php?c=classs&a=GetClassList2&t=mini", data)
        .then(function (response) {
          var result = response.data;
          if (result.status == 1) {
            that.tableDataClass = result.data;
            that.modalRemoveNote = true;
          } else {
            that.$Message.error(result.message);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },

    //恢复笔记
    RecoveryNote() {
      var that = this;
      var data = {
        noteId:
          that.formNoteInfo.noteList[that.formCurrentSelect.noteIndex].noteId,
      };
      that.$axios
        .post("/api.php?c=recyclebin&a=RecoveryNote&t=mini", data)
        .then(function (response) {
          var result = response.data;
          if (result.status == 1) {
            that.$Message.success(result.message);
            that.GetNoteList();
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
    //判断是否为微信用户
    if (window.sessionStorage.getItem("userRoleType") == 0) {
      that.SetCurrentInfo();
      that.GetNoteList();
    }
  },
};
</script>

<style>
</style>