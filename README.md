# 2025 Blog 部署指南

## 1. 安装

按照以下步骤完成部署服务的配置：

- Fork 本项目到你的 GitHub 账户
- **最好不要修改原项目文件名**

> 该项目可以先不做本地开发，直接部署然后配置环境变量即可。

## 2. 部署

以 Vercel 部署为例：

1. 登录 Vercel 官网：https://vercel.com
2. 点击 **Add new** 按钮 → **Project**
3. 选择刚 Fork 的项目 → 点击 **Import**
4. 点击 **Deploy** 直接部署

---

## 3. 创建 GitHub App 链接仓库

### 3.1 创建 GitHub App

1. 进入 GitHub **个人设置** → 左侧找到最下面的 **Developer Settings**
2. 点击 **New GitHub App**

### 3.2 填写 App 信息

| 字段                 | 建议填写 |
|------               |----------|
| **GitHub App name** | `自己随便写点`    |
| **Homepage URL**    | `https://ss.com` |

> 输入内容不影响功能，但有格式要求，按建议填写即可。

### 3.3 配置权限

- **Webhook** 功能 → **关闭**（不需要）
- **Permissions** → **Repository permissions** → **Contents** 设为 `Read and write`

点击 **Create GitHub App** 完成创建。

### 3.4 下载私钥和获取 App ID

1. 点击蓝色 **Generate private key** 按钮，下载私钥文件
   - 保存好私钥文件（丢失后可重新创建下载）
2. 复制页面上的 **App ID**，稍后填入环境变量 `NEXT_PUBLIC_GITHUB_APP_ID`

### 3.5 安装 App 到仓库

1. 在 GitHub 界面左侧找到 **App Install**
2. 点击 **Install**
3. 选择 **Only select repositories** → 选择你 Fork 的项目
4. 点击 **Install** 完成权限设置

### 3.6 配置 Vercel 环境变量

1. 进入 Vercel 主界面 → 左侧找到 **Environment Variables**
2. 点击右上角 **Add Environment Variables**

添加以下变量：
> 一般只需设置 `OWNER` 和 `APP_ID`，其它配置不用管。(前提是你没改项目名)
> 设置时将 **Sensitive** 开关关闭。
> 
| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_GITHUB_OWNER` | 你的 GitHub 账户名 |
(在仓库主页面的网址处 https://github.com/这个地方的昵称/你fork的项目名)
| `NEXT_PUBLIC_GITHUB_APP_ID` | 你之前复制的 App ID |
| `NEXT_PUBLIC_GITHUB_REPO` | 如果不是test_blog, 则需要填写你fork的项目名 |

1. 设置完成后，点击右下角的 **Redeploy** 按钮重新部署
2. 若没有该按钮，需手动再部署一次，让环境变量生效

---

## 4. 完成

部署的网站现在可以开始使用前端修改内容了。
修改的内容必须在密钥实现提交之后vercel部署成功才会生效.

##

## 5. 写东西
1. 注意: 每次修改的时候都要提供之前下载好的私钥文件[一定要保存好了啊] ; (防止别人编辑,实现验证写入)
2. 写文章后面的白点处可以修改整个博客页面(可以自己魔改魔改 (≧▽≦) )
3. 写文章的地方 slug 是文章的唯一标识, 建议[weekly/daily]-[随便写点什么] , 后期会使用这个直接拉取文章内容

## 从现在开始, 你也拥有一个自己的小网站需要自己去维护了, 加油吧, lec未来的的诸位大佬们 (ゝ∀･) !!!

## By LEC最懒惰之人

> ⚠️ 每次使用私钥提交之后 , 需要等待1分钟左右,vercel那边会部署的,每次提交都会触发部署,等待部署成功,才能继续下一次修改提交,修改后的内容也会在部署后生效
