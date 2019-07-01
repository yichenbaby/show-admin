<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-row :gutter="40">
      <el-col :span="6">
        <el-input
          placeholder="请输入内容"
          v-model="query"
          class="input-with-select"
          @keyup.enter.native="search"
        >
          <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
        </el-input>
      </el-col>
      <el-col :span="6">
        <el-button type="success" plain @click="addUser">添加用户</el-button>
      </el-col>
    </el-row>
    <el-table :data="userlist" stripe style="width: 100%">
      <el-table-column prop="username" label="姓名" width="180"></el-table-column>
      <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
      <el-table-column prop="mobile" label="电话" width="200"></el-table-column>
      <el-table-column label="用户状态" width="200">
        <template v-slot="{row}">
          <!-- v-slot可以获取到 row, column, $index 和 store（table 内部的状态管理）的数据 -->
          <el-switch
            v-model="row.mg_state"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="changeState(row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template v-slot="{row}">
          <el-button type="primary" icon="el-icon-edit" plain size="mini" @click="editUser(row)"></el-button>
          <el-button type="danger" icon="el-icon-delete" plain size="mini" @click="delUser(row.id)"></el-button>
          <el-button
            type="success"
            icon="el-icon-check"
            plain
            size="mini"
            @click="classUser(row.id,row.username)"
          >分配角色</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="pagesize"
      :current-page="currentPage"
      @current-change="currentChange"
    ></el-pagination>
    <!-- 添加模态框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="isAddUserShow"
      width="50%"
      @close="closeAddUser('addUserForm')"
    >
      <el-form
        :model="addUserForm"
        ref="addUserForm"
        class="demo-ruleForm"
        label-width="100px"
        :rules="addUserFormRules"
      >
        <el-form-item label="用户名" prop="username">
          <el-input type="text" autocomplete="off" v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" autocomplete="off" v-model="addUserForm.password" show-password></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input type="text" autocomplete="off" v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input type="text" autocomplete="off" v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isAddUserShow = false">取 消</el-button>
        <el-button type="primary" @click="submitForm('addUserForm')">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 修改模态框 -->
    <el-dialog title="编辑用户" :visible.sync="isEditUserShow" width="50%">
      <el-form
        :model="editUserForm"
        ref="editUserForm"
        class="demo-ruleForm"
        label-width="100px"
        :rules="editUserFormRules"
      >
        <el-form-item label="用户名">
          <el-tag type="info">{{editUserForm.username}}</el-tag>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input type="text" autocomplete="off" v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input type="text" autocomplete="off" v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isEditUserShow = false">取 消</el-button>
        <el-button type="primary" @click="submitEditForm('editUserForm')">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 分配角色模态框 -->
    <el-dialog title="分配角色" :visible.sync="isClassModelShow">
      <el-form :model="classUserForm">
        <el-form-item label="用户名">
          <el-tag type="info">{{classUserForm.username}}</el-tag>
        </el-form-item>
        <el-form-item label="角色列表" label-width="100px">
          <el-select v-model="value" placeholder="请选择角色" @change="select">
            <!-- <el-table :data="classUserForm.class" style="width: 100%">
              <el-table-column width="80px" prop="roleName"></el-table-column>
            </el-table>-->
            <el-option
              v-for="item in classLIst"
              :key="item.id"
              :label="item.label"
              :value="item.roleName"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isClassModelShow = false">取 消</el-button>
        <el-button type="primary" @click="finishClass">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
// import { type } from "os";
// import axios from "axios";
export default {
  data() {
    return {
      userlist: [],
      currentPage: 1,
      pagesize: 3,
      query: "",
      total: 0,
      isAddUserShow: false,
      addUserForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      addUserFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 5,
            max: 12,
            message: "用户名必须在5~12之间",
            trigger: "change"
          }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "用户名必须在6~15之间",
            trigger: "change"
          }
        ],
        email: [
          {
            type: "email",
            message: "邮箱格式有误",
            trigger: "change"
          }
        ],
        mobile: [
          {
            pattern: /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/,
            message: "电话格式有误",
            trigger: "change"
          }
        ]
        // 正则校验完成了，接下啦是点击确定按钮发送请求
      },
      isEditUserShow: false,
      editUserForm: {
        id: 0,
        username: "",
        email: "",
        mobile: ""
      },
      editUserFormRules: {
        email: [
          {
            type: "email",
            message: "邮箱格式有误",
            trigger: "change"
          }
        ],
        mobile: [
          {
            pattern: /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/,
            message: "电话格式有误",
            trigger: "change"
          }
        ]
      },
      isClassModelShow: false,
      classUserForm: {
        id: 0,
        username: ""
      },
      classLIst: [],
      // 绑定最后选中的角色值
      value: "",
      rid: 0
    };
  },
  async created() {
    this.getUserList();
    // 进入页面先获取角色列表
    let res = await this.$http({
      url: "roles"
    });
    this.classLIst = res.data.data;
    // console.log(this.class);
  },
  methods: {
    async getUserList() {
      let {
        data: { data, meta }
      } = await this.$http({
        url: "users",
        params: {
          query: this.query,
          pagenum: this.currentPage,
          pagesize: this.pagesize
        }
      });
      this.userlist = data.users;
      this.total = data.total;
    },
    getMsg(type, msg) {
      this.$message({
        type: type,
        message: msg,
        duration: 1000
      });
    },
    async changeState(user) {
      // console.log(user);
      let {
        data: { data, meta }
      } = await this.$http({
        url: `users/${user.id}/state/${user.mg_state}`,
        method: "put"
      });
      if (meta.status === 200) {
        this.getMsg("success", meta.msg);
      } else {
        this.getMsg("error", meta.msg);
        user.mg_state = !user.mg_state;
      }
    },
    async delUser(id) {
      try {
        await this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        });
        let {
          data: { data, meta }
        } = await this.$http({
          url: `users/${id}`,
          method: "delete"
        });
        // console.log(meta);
        if (meta.status == 200) {
          this.getMsg("success", meta.msg);
          // this.currentPage = 1;
          this.getUserList();
        } else {
          this.getMsg("error", meta.msg);
        }
      } catch (err) {
        this.getMsg("error", "已取消删除");
      }
    },
    search() {
      this.getUserList();
    },
    currentChange(page) {
      // console.log(page);
      this.currentPage = page;
      this.getUserList();
    },
    addUser() {
      // 让模态框显示
      this.isAddUserShow = true;
    },
    submitForm(formName) {
      this.$refs[formName].validate(async valid => {
        if (valid) {
          // alert("submit!");
          let {
            data: { data, meta }
          } = await this.$http({
            url: "users",
            method: "post",
            data: this.addUserForm
          });
          if (meta.status === 201) {
            // 添加成功后，弹出成功消息框，并且隐藏添加模态框，重新渲染列表
            this.getMsg("success", meta.msg);
            this.isAddUserShow = false;
            // this.currentPage = 1;
            this.getUserList();
          } else {
            this.getMsg("error", meta.msg);
          }
        } else {
          return false;
        }
      });
    },
    closeAddUser(formName) {
      // 关闭模态框前，重置表格
      this.$refs[formName].resetFields();
    },
    // 编辑
    editUser(user) {
      this.editUserForm = user;
      this.isEditUserShow = true;
    },
    submitEditForm(formName) {
      this.$refs[formName].validate(async valid => {
        let res = await this.$http({
          url: `users/${this.editUserForm.id}`,
          method: "put",
          data: this.editUserForm
        });
        console.log(res);
        if (res.data.meta.status == 200) {
          this.getMsg("success", res.data.meta.msg); //弹出成功消息框
          this.isEditUserShow = false; //关闭编辑模态框
        }
      });
    },
    // 分配角色
    classUser(id, name) {
      this.classUserForm.id = id;
      this.classUserForm.username = name;
      this.isClassModelShow = true;
    },
    // 当选中某一项时，函数会执行，参数就是选中的值
    select(roleName) {
      // 根据选中的值，从角色列表中找到对应的角色id
      this.rid = this.classLIst.find(v => v.roleName === roleName).id;
    },
    async finishClass() {
      let res = await this.$http({
        url: `users/${this.classUserForm.id}/role`,
        method: "put",
        data: {
          id: this.classUserForm.id,
          rid: this.rid
        }
      });
      console.log(res);
      if (res.data.meta.status == 200) {
        // 设置成功后，弹出消息框，同时关闭角色模态框
        this.getMsg("success", res.data.meta.msg);
        this.isClassModelShow = false;
      } else {
        this.getMsg("error", res.data.meta.msg);
      }
    }
  }
};
</script>
<style lang="less" scoped>
.el-breadcrumb {
  background-color: #d4dae0;
  height: 50px !important;
  line-height: 50px !important;
  font-size: 16px;
  padding-left: 10px;
}
form {
  border: none;
  padding: 0 20px;
}
</style>
