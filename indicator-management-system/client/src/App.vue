<template>
  <el-container class="app-container">
    <el-aside width="200px" class="sidebar">
      <div class="logo">指标管理系统</div>
      <el-menu
        :default-active="$route.path"
        router
        class="menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/indicators">
          <el-icon><Document /></el-icon>
          <span>指标管理</span>
        </el-menu-item>
        <el-menu-item index="/groups">
          <el-icon><Folder /></el-icon>
          <span>分组管理</span>
        </el-menu-item>
        <el-menu-item index="/sources">
          <el-icon><DataLine /></el-icon>
          <span>数据来源</span>
        </el-menu-item>
        <el-menu-item index="/logs">
          <el-icon><Timer /></el-icon>
          <span>操作日志</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
}
.app-container {
  height: 100vh;
}
.sidebar {
  background-color: #304156;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #1f2d3d;
}
.menu {
  border-right: none;
}
.main-content {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
