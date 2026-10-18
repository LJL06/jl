window.PUBLIC_JOURNAL_DATA = {
  "articles": [
    {
      "id": "study-note-001",
      "title": "为什么要把材料、器件与系统连在一起？",
      "category": "学习记录",
      "date": "2026.09",
      "summary": "做材料输运计算时，我逐渐意识到，公式和曲线不是终点。真正有意思的问题是：电子在材料中的行为，最终怎样影响器件，又怎样进入一个可以运行的系统。",
      "body_markdown": "SPR-KKR 的计算让我从能带、散射与有限温度输运出发观察材料；半导体物理与微电子器件的学习，则提供了理解载流子、结与器件结构的另一套尺度。\n\n嵌入式项目和树莓派服务器把视角继续向外推。它们要求我处理通信、接口、软件和部署，也让我看到理论知识如何落到工程约束里。\n\n> 我现在更关心的不是单独掌握多少工具，而是能否理解一条从物理机制到工程实现的完整链路。\n\n这条路径仍在形成中。手记会保留推导、失败和判断变化，而不只陈列最后的结果。"
    },
    {
      "id": "note-from-draft",
      "title": "从草稿到发布",
      "category": "网站记录",
      "date": "2026.09",
      "summary": "用一篇短手记检查从 Markdown 编辑、草稿预览到公开发布的流程。",
      "body_markdown": "这次用一篇短手记检查个人网站的内容更新流程。\n\n我先用 Markdown 写下内容，在 NAS 管理页保存为草稿并检查排版；确认无误后，再把选中的文章发布到公开网站。\n\n这也是一次小小的工程练习：把内容编辑、版本管理和网站部署连成一条清楚的流程。"
    },
    {
      "id": "note-1790432275902",
      "title": "把一次发布拆成可检查的步骤",
      "category": "工程记录",
      "date": "2026.09",
      "summary": "记录个人网站从 Markdown 草稿、预览到公开发布的内容更新流程。",
      "body_markdown": "## 从编辑到发布\n\n我希望写手记时，不必直接修改网页代码。现在可以在 NAS 的“个人网站”区域用 Markdown 写作、预览，并先保存为草稿；确认内容后，再单独发布到公开网站。\n\n## 为什么把它们分开\n\n保存草稿和公开发布是两件不同的事。先预览、再决定是否发布，能让我在内容真正上线前检查文字和排版，也避免未确认的内容直接公开。\n\n## 这次要验证什么\n\n这篇手记也作为一次小型流程检查：确认新增文章能从编辑页面进入草稿，再由我主动发布到 GitHub，并出现在公开网站的手记目录中。\n\n之后我会继续记录实际使用中发现的问题，让内容管理流程和网站本身一起慢慢完善。"
    }
  ],
  "site_content": {
    "profile": {
      "name_cn": "李佳乐",
      "name_en": "JIALE LI",
      "location": "HUBEI · CHINA / 2026",
      "headline_main": "A life",
      "headline_accent": "in progress.",
      "lede_markdown": "从材料输运与器件物理出发，\n走向真实运行的电子系统。"
    },
    "sections": [
      {
        "id": "resume",
        "eyebrow": "PROFILE / LEARNING TRAJECTORY",
        "title": "从材料中的电子输运，走向芯片里的器件与系统。",
        "aside": "2026 — WIP",
        "body_markdown": "### 当前学习与研究路径\n\n- **材料输运**：SPR-KKR · 有限温度计算\n- **器件物理**：半导体物理 · 微电子器件\n- **集成电路工程**：器件 · 电路 · 系统实现\n\n以集成电路工程为升学方向，在反铁磁材料输运科研、器件物理学习与嵌入式系统实践之间，逐步建立从理论计算到工程实现的完整认识。",
        "visible": true,
        "order": 1
      },
      {
        "id": "skills",
        "eyebrow": "CAPABILITY MAP",
        "title": "能力谱系",
        "aside": "能力与项目逐项对应",
        "body_markdown": "- **材料与输运计算**：SPR-KKR 8.6 / KKRCHI · SCF / SIGMA · CPA · 有限温度声子与自旋无序。`FeRh · Cr · CrSb`\n- **数据分析与表达**：Python · pandas · NumPy · Matplotlib · Origin · VESTA，从计算结果到趋势判断与图形表达。`科研数据链路`\n- **嵌入式与通信**：C/C++ · STM32 · ESP32-S3 / ESP-IDF · Wi-Fi CSI · LoRa · I²C / SPI / UART。`飞控 · CSI`\n- **建模与系统实现**：MATLAB / Simulink · Linux · Git · FastAPI · React · SQLite · Nginx。`仿真 · NAS`",
        "visible": true,
        "order": 2
      },
      {
        "id": "projects",
        "eyebrow": "SELECTED WORK",
        "title": "研究主线与工程实践",
        "aside": "主线优先，保留完整工程能力",
        "body_markdown": "### 反铁磁材料的有限温度输运\n\n围绕材料计算、温度无序与自旋霍尔响应形成连续研究线索。页面只呈现已经核实的工作，未确认的方法与结果保留空白。\n\n- **FeRh** — 完成 SCF / SIGMA 计算与异常排查，重新设置反平行磁矩并分析电荷、输运张量。`计算与排障`\n- **Cr** — 由文献磁性数据构造有限温度输入，分析 Néel 温区附近的非单调自旋霍尔响应。`数据处理与比较`\n- **CrSb** — 材料计算与数据分析进行中；方法、分工和阶段结论将在工程记录核实后补充。`进行中 · 待完善`\n\n### 工程实践 · 从建模、采集到部署\n\n- **STM32 无线通信与无人机飞控** — 已完成 STM32 板卡无线通信的 MATLAB / Simulink 建模与仿真；在教师指导下参与无人机飞控实验，目前处于学习与测试阶段。`Simulink · STM32 · LoRa`\n- **Wi-Fi CSI 室内状态感知** — 建立 CSI 采集、UDP 回传、记录 / 回放和离线审计链路。10 分钟记录 57,644 帧；当前 pilot 结论仍为 inconclusive。`ESP32-S3 · 集创赛华中三等奖`\n- **Raspberry Pi 4B 个人 NAS 与协作平台** — 基于 FastAPI、React、SQLite 与 Nginx 部署于树莓派，提供登录鉴权、分用户文件空间、网站内容编辑与发布及系统监控；共享项目支持成员权限、资料管理、任务、讨论与活动记录。`Linux · FastAPI · React · SQLite · Nginx · Tailscale`\n\n研究与实验状态如实标注；尚未验证的结果不会写成既成成果。",
        "visible": true,
        "order": 3
      },
      {
        "id": "journal",
        "eyebrow": "JOURNAL / NOTES",
        "title": "手记与思考",
        "aside": "标题卡片 · 点击阅读手记",
        "body_markdown": "研究、工程与学习留下的真实过程。",
        "visible": true,
        "order": 4
      },
      {
        "id": "about",
        "eyebrow": "EDUCATION & AWARDS",
        "title": "教育、方向与荣誉",
        "aside": "",
        "body_markdown": "湖北师范大学 · 集成电路设计（电子信息方向）· 本科在读。\n\n当前升学意向：电子科技大学 031 集成电路科学与工程学院，优先考虑 085403 集成电路工程（专硕）01 微电子器件与集成电路方向；考试科目按政治、英语一、数学一、832 微电子器件准备，以报考年度招生目录为准。\n\n集创赛华中赛区三等奖（Wi-Fi CSI 相关项目）；蓝桥杯单片机组省级二等奖；校二等奖学金；CET-4。",
        "visible": true,
        "order": 5
      }
    ]
  }
};
