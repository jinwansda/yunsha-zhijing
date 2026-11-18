# API 接口与 UE4 虚拟引擎联调说明

前端 H5 与 UE 虚拟引擎同学通过后端 RESTful API 实现数据互通。

所有 API 前缀为 `/api`，接口文档可在 `http://127.0.0.1:8000/docs` 交互测试。

## 一、接口清单

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/health` | 服务检查 |
| GET | `/api/points` | 研学点位列表 |
| GET | `/api/courses` | 课程列表 |
| GET | `/api/tasks` | 任务列表（不含正确答案） |
| GET | `/api/knowledge?point_id=HALL` | 指定点位知识 |
| POST | `/api/sessions` | 新建会话（无请求体） |
| POST | `/api/records` | 服务端判题、提交记录 |
| GET | `/api/sessions/{sid}/progress` | 实时完成进度 |
| GET | `/api/sessions/{sid}/report` | 学习报告（含 UE 事件） |
| POST | `/api/ask` | 本地规则式知识检索 |
| POST | `/api/ue/events` | UE4 提交工艺操作结果（演示专用） |

---

## 二、UE4 提交工艺操作事件

UE4 可在 HTTP 模块或合规蓝图插件中发起 POST：

```
POST http://[局域网IP]:8000/api/ue/events
Content-Type: application/json
X-UE-Key: CHANGE_ME_FOR_DEPLOYMENT
```

请求体：

```json
{
  "event_id": "ue4-workshop-event-0001",
  "session_id": "YS-实际创建的会话编号",
  "task_id": "UE_CRAFT_001",
  "point_id": "WORKSHOP",
  "course_id": "YS_COURSE_001",
  "operation_result": "correct"
}
```

成功响应：

```json
{
  "ok": true,
  "event_id": "ue4-workshop-event-0001",
  "operation_result": "correct"
}
```

**响应码说明**：
- `200` 提交成功
- `401` 认证失败（`X-UE-Key` 不正确）
- `404` 体验编号无效
- `409` 事件重复冲突

> 网络超时重试时应保持**相同 event_id**，利用服务端幂等处理避免重复记录。

---

## 三、命令行模拟 UE4 联调（无需打开 UE4）

```powershell
# 1. 创建体验编号
$session = Invoke-RestMethod -Method POST -Uri http://127.0.0.1:8000/api/sessions
$session.session_id

# 2. 提交一个工艺演示事件
$body = @{
  event_id = [guid]::NewGuid().ToString()
  session_id = $session.session_id
  task_id = 'UE_CRAFT_001'
  point_id = 'WORKSHOP'
  course_id = 'YS_COURSE_001'
  operation_result = 'correct'
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri http://127.0.0.1:8000/api/ue/events `
  -Headers @{ 'X-UE-Key' = 'CHANGE_ME_FOR_DEPLOYMENT' } `
  -ContentType 'application/json' -Body $body

# 3. 查询手机可显示的报告（含 ue_events）
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/sessions/$($session.session_id)/report"
```

---

## 四、UE4.27 蓝图接入建议

1. 新建研学场景中的 `BP_CraftInteraction` 蓝图，保存当前 `SessionId` 和本次 `EventId`。
2. 用户完成工艺步骤时构建请求对象（见上文 JSON）。
3. 使用适配 UE4.27 的 HTTP 模块或经许可的蓝图 HTTP 插件发起 POST。
4. 仅在受控本地演示环境中使用 `X-UE-Key`，不要将长期密钥硬编码进公开客户端。
5. 收到 200 响应显示「提交成功」；按响应码处理错误。

> 本工程只提供 UE4 通信协议和模拟接口，**不包含已在 UE4 编辑器内编译运行的蓝图工程**，需学生按目标版本配置插件后实际接入、调试、打包验证。

---

## 五、前端本地会话编号

- 手机默认把会话编号存在浏览器 localStorage 的 `yunsha_v1` 记录中（`API.session_id`）。
- 演示同一会话的 UE4 联动时，需把该会话编号提供给 UE4 终端。
- 生产版本应使用独立的安全配对功能，不应要求学生公开复制个人令牌。

---

## 六、安全与部署界限

- 默认 `CHANGE_ME_FOR_DEPLOYMENT` 仅用于可信本地教学环境。正式部署前配置环境变量 `YUNSHA_UE_API_KEY` 为高强度随机密钥。
- 会话编号是匿名标识而非认证令牌，正式上线需设计会话有效期、权限与防滥用机制。
- 不采集姓名、手机号等敏感字段。
- 目前题目示例题无「已通过基地专家审定」属性，不得宣传为真实认证题库。
