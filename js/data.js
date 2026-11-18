/* ==========================================================================
   莨珠记 · 云纱智境 —— 数据层
   点位 / 课程 / 任务 / 知识 / 非遗故事 / 传承人 / 成就 / 等级 / 题库 / 配图
   ========================================================================== */
"use strict";

/* 图片资源路径 */
/* ---------------------------------------------------------------- 真实照片库
   来源：南方日报/南方+、新华网、中国经济网、学习强国等公开报道中的
   香云纱染整技艺纪实摄影作品，已本地化保存于 assets/real/。
   仅用于非遗研学教学演示；正式发布前请按实际情况补充授权与署名。
   注意：每一张照片在全站主图位置只使用一次，避免重复。
   ---------------------------------------------------------------- */
var PHOTO = {
  dryingAerial1: "assets/real/real_02.jpg",
  dryingStripes: "assets/real/real_03.jpg",
  grassPurple: "assets/real/real_04.jpg",
  shuliangRoot: "assets/real/real_05.jpg",
  shuliangHand: "assets/real/real_06.jpg",
  workerGreen: "assets/real/real_07.jpg",
  silkWhite: "assets/real/real_08.jpg",
  workerCarry: "assets/real/real_09.jpg",
  silkSpread: "assets/real/real_10.jpg",
  silkArch: "assets/real/real_11.jpg",
  silkRainbow: "assets/real/real_12.jpg",
  fabricColor: "assets/real/real_13.jpg",
  dyeVat: "assets/real/real_14.jpg",
  historyOld: "assets/real/real_15.jpg",
  washSplash: "assets/real/real_16.jpg",
  washWorker: "assets/real/real_17.jpg",
  mudWorkers: "assets/real/real_18.jpg",
  foldCloth: "assets/real/real_19.jpg",
  mudCoat: "assets/real/real_20.jpg",
  danceSilk: "assets/real/real_21.jpg",
  shuliangPile: "assets/real/real_22.jpg",
  silkWind: "assets/real/real_23.jpg",
  dyePattern: "assets/real/real_24.jpg",
  hallExhibit: "assets/real/real_25.jpg",
  models: "assets/real/real_26.jpg",
  dryingStripes2: "assets/real/real_27.jpg",
  silkRainbow2: "assets/real/real_29.jpg",
  dryingPurple2: "assets/real/real_30.jpg",
  dyeHang: "assets/real/real_31.jpg",
  workshopVat: "assets/real/real_34.jpg",
  mudTeam: "assets/real/real_35.jpg",
  workshopShed: "assets/real/real_36.jpg",
  dryingPanorama: "assets/real/real_37.jpg",
  dryingRedYellow: "assets/real/real_38.jpg",
  workshopWorker: "assets/real/real_39.jpg",
  workshopFold: "assets/real/real_40.jpg",
  dryingBlack: "assets/real/real_41.jpg",
  washMud: "assets/real/real_42.jpg",
  collectCloth: "assets/real/real_43.jpg",
  grassPurple2: "assets/real/real_44.jpg",
  dryingLake: "assets/real/real_46.jpg",
  dyePattern2: "assets/real/real_47.jpg",
  shopExhibit: "assets/real/real_48.jpg",
  qipao: "assets/real/real_49.jpg"
};

var IMG = {
  hall: PHOTO.shopExhibit,          // 主馆 / 展陈实景
  workshop: PHOTO.workshopVat,      // 工坊染缸
  drying: PHOTO.dryingPanorama,     // 晒场全景
  mud: PHOTO.mudCoat,               // 涂河泥
  dryingField: PHOTO.grassPurple,   // 草地晒莨
  shuliang: PHOTO.shuliangRoot,     // 薯莨块茎
  fabric: PHOTO.fabricColor,        // 香云纱面料
  river: PHOTO.washMud,             // 河涌洗纱
  boil: PHOTO.dyeVat                // 浸莨水 / 煮绸
};

/* ---------------------------------------------------------------- 研学点位（四大区域） */
var YS_POINTS = [
  {
    id: "HALL", name: "莨珠记主馆", subtitle: "理论研学 · 布匹展陈",
    icon: "馆", color: "#83533B", x: 68, y: 62, image: PHOTO.hallExhibit,
    description: "参观岭南镬耳屋风格的研学主馆，认识香云纱的历史渊源与基地的研学课程体系。",
    gallery: [PHOTO.qipao, PHOTO.models, PHOTO.fabricColor],
    knowledge: [
      "香云纱发源于岭南，以蚕丝坯绸为底，经薯莨汁液浸染、河泥媒染与反复晒莨而成。",
      "莨珠记主馆以镬耳屋为建筑意象，承担理论研学、非遗展示与布匹陈列的公共功能。",
      "香云纱又被称为「莨绸」「莨纱」，是国家级非物质文化遗产，有「一两黄金一两纱」之说。"
    ],
    tasks: ["TASK_HALL"]
  },
  {
    id: "WORKSHOP", name: "染整工作坊", subtitle: "原料处理 · 工艺学习",
    icon: "坊", color: "#83533B", x: 32, y: 32, image: PHOTO.workshopVat,
    description: "认识生产工作坊的功能分区、原料及工序教学，理解湿作业区与整理区的划分逻辑。",
    gallery: [PHOTO.dyeVat, PHOTO.dyeHang, PHOTO.workshopWorker],
    knowledge: [
      "工作坊需按作业需求划分湿作业区与整理区，浸染、煮绸、过泥、清洗分属不同工位。",
      "「三蒸九煮十八晒」是香云纱染整的核心工序概括，强调反复浸染与晾晒的耐心。",
      "涂河泥是香云纱独特的一步：以珠江流域含铁河泥涂覆布面，与薯莨中的单宁反应显色。"
    ],
    tasks: ["TASK_WORKSHOP"]
  },
  {
    id: "DRYING_FIELD", name: "草地晒莨场", subtitle: "平铺晒莨 · 场地观察",
    icon: "晒", color: "#667B55", x: 62, y: 22, image: PHOTO.dryingPanorama,
    description: "观察大面积草地与长幅布匹，理解晒莨场在香云纱生产中的开阔尺度与工作路线。",
    gallery: [PHOTO.silkRainbow, PHOTO.grassPurple, PHOTO.dryingStripes],
    knowledge: [
      "晒莨场是香云纱生产中最具视觉冲击的空间，长幅布匹直接平铺于草地，阳光下反复晾晒。",
      "草地既能提供柔软支撑，又能让布面均匀受热，是晒莨工序的理想场地。",
      "晒场保留作业通道，便于工人翻布、补浆与检查布面均匀度。"
    ],
    tasks: ["TASK_DRYING"]
  },
  {
    id: "RIVER", name: "河涌泥料区", subtitle: "水乡环境 · 泥料知识",
    icon: "涌", color: "#4C7A78", x: 14, y: 78, image: PHOTO.washMud,
    description: "学习河涌、河泥与泥料处理的空间关系，理解顺德水乡环境对香云纱工艺的滋养。",
    gallery: [PHOTO.mudCoat, PHOTO.washWorker, PHOTO.washSplash],
    knowledge: [
      "顺德水乡的河涌为香云纱提供了含铁河泥，是媒染显色的关键原料。",
      "河涌、取泥来源与实际过泥工位存在空间联系，但并非都在河里直接完成。",
      "研学时应停留在安全观摩区域，未经许可不得靠近河岸或生产设施。"
    ],
    tasks: ["TASK_RIVER"]
  }
];

/* ---------------------------------------------------------------- 课程 */
var YS_COURSE = {
  id: "YS_COURSE_001",
  name: "莨珠记·寻纱之旅",
  subtitle: "四区研学任务",
  duration: "约20分钟",
  description: "从主馆出发，认识工坊、晒场与河涌，完成四项基础知识任务，体验「三蒸九煮十八晒」的匠心。"
};

/* ---------------------------------------------------------------- 研学任务 */
var YS_TASKS = [
  {
    id: "TASK_HALL", point_id: "HALL", title: "认识研学主馆",
    type: "single", order: 1, score: 25, ico: "🏛️", image: PHOTO.shopExhibit,
    question: "莨珠记主馆在本项目中主要承担什么用途？",
    options: [
      { id: "A", text: "香云纱理论研学与布匹展示" },
      { id: "B", text: "河涌取泥作业" },
      { id: "C", text: "露天大面积晒布" }
    ],
    answer: "A",
    explanation: "本项目将主馆规划为理论学习、非遗展示和布匹展示的公共研学场所。"
  },
  {
    id: "TASK_WORKSHOP", point_id: "WORKSHOP", title: "认识工作坊",
    type: "single", order: 2, score: 25, ico: "🏭", image: PHOTO.workshopShed,
    question: "在空间设计中，卷布整理与湿作业设施应该怎样安排？",
    options: [
      { id: "A", text: "全部摆在同一张教学桌上" },
      { id: "B", text: "按作业需求划分湿作业区与整理区" },
      { id: "C", text: "全部安排在河涌水面" }
    ],
    answer: "B",
    explanation: "工作坊按生产用途合理分区：浸染、煮绸等湿作业与卷布整理分开布置。"
  },
  {
    id: "TASK_DRYING", point_id: "DRYING_FIELD", title: "观察草地晒场",
    type: "single", order: 3, score: 25, ico: "🌿", image: PHOTO.dryingStripes,
    question: "根据传统晒莨场的特点，布匹的主要摆放方式是？",
    options: [
      { id: "A", text: "直接平铺在草地上" },
      { id: "B", text: "全部挂在高架上" },
      { id: "C", text: "堆放在室内木箱中" }
    ],
    answer: "A",
    explanation: "本项目重点还原直接铺草地的晒莨场景，长幅布匹平铺以均匀受晒。"
  },
  {
    id: "TASK_RIVER", point_id: "RIVER", title: "认识河涌与泥料",
    type: "single", order: 4, score: 25, ico: "🌊", image: PHOTO.mudWorkers,
    question: "在数字场景中，河涌与泥料处理区应如何表达？",
    options: [
      { id: "A", text: "河泥处理必定在河里直接完成" },
      { id: "B", text: "河涌、取泥与实际过泥工位可分开表现" },
      { id: "C", text: "无需设置任何泥料相关知识" }
    ],
    answer: "B",
    explanation: "河涌、泥料来源和具体过泥工位存在联系，但不应未经调研就认定都在河里进行。"
  }
];

/* ---------------------------------------------------------------- 工艺知识库（图文详情） */
var YS_KNOWLEDGE = [
  {
    id: "K01", point_id: "HALL", title: "认识香云纱", category: "非遗认知", image: PHOTO.silkWind,
    text: "香云纱是具有岭南地域特色的传统丝绸面料，以蚕丝坯绸为底，经薯莨汁液浸染、河泥媒染与反复晒莨而成，被称为「一两黄金一两纱」。",
    detail: "香云纱的制作凝聚了岭南工匠的智慧。它以桑蚕丝织物为坯，用薯莨（一种藤本植物的块茎）捣碎取汁反复浸染，使织物呈棕褐色；再以珠江流域含铁河泥涂覆布面，铁离子与薯莨中的单宁发生络合反应，使布面呈现独特的乌黑光泽与龟裂纹理。整个过程依赖阳光、草地与河泥的自然馈赠，是「天工开物」式的非遗技艺。",
    steps: ["选坯绸", "浸薯莨汁", "晒莨固色", "涂河泥", "清洗", "整理卷布"]
  },
  {
    id: "K02", point_id: "HALL", title: "主馆的研学功能", category: "空间认知", image: PHOTO.qipao,
    text: "莨珠记主馆设计为理论学习、布匹陈列和数字研学入口，镬耳屋风格体现岭南建筑特色。",
    detail: "主馆是整个研学之旅的起点，承担理论讲授、非遗文化展示与布匹实物陈列。其镬耳屋造型（两侧山墙高耸如锅耳）是广府传统民居的标志，象征「独占鳌头」的美好寓意。数字研学平台以此为视觉锚点，让学习者在文化氛围中开始寻纱之旅。",
    steps: []
  },
  {
    id: "K03", point_id: "WORKSHOP", title: "工坊中的湿作业区", category: "工坊观察", image: PHOTO.dyeVat,
    text: "工坊需考虑材料处理、浸染、煮绸、过泥和清洗等工艺相关设施的空间组织。",
    detail: "染整工作坊是香云纱生产的技术核心。湿作业区承担坯布浸薯莨汁、反复煮绸、涂河泥、清洗等环节，需要完善的给排水与通风设施；干整理区则负责检查、卷布、打包与仓储。合理分区能避免交叉污染、提升效率。",
    steps: ["浸染", "煮绸", "过泥", "清洗"]
  },
  {
    id: "K04", point_id: "WORKSHOP", title: "卷布整理与仓储", category: "工坊观察", image: PHOTO.foldCloth,
    text: "工艺完成后的布匹需要检查、整理、卷布与存放等环节，是品质控制的最后一环。",
    detail: "经过反复浸染与晒莨的香云纱，需由经验丰富的工匠逐匹检查色泽均匀度、龟裂纹理与手感，剔除瑕疵后卷布打包。仓储环境需防潮、防虫、避光，以保持香云纱的独特光泽与质感。",
    steps: []
  },
  {
    id: "K05", point_id: "DRYING_FIELD", title: "草地晒场的空间特点", category: "晒场观察", image: PHOTO.grassPurple,
    text: "晒莨场是大面积开阔草地，成组平铺的长条布幅间留有作业通道。",
    detail: "晒莨场的开阔尺度是香云纱生产的重要特征。长幅布匹成组平铺于草地，充分利用阳光与空气进行自然干燥与固色。草地柔软的支撑让布面不易褶皱，开阔的间距保证通风均匀。",
    steps: []
  },
  {
    id: "K06", point_id: "DRYING_FIELD", title: "为什么强调晒场尺度？", category: "数字场景", image: PHOTO.dryingLake,
    text: "草地晒场在基地视觉与生产空间中占据重要位置，数字孪生场景应优先表现其开阔尺度。",
    detail: "在数字孪生场景中，晒莨场的开阔感直接影响研学体验的真实度。数字孪生场景应突出长幅布匹、草地纹理与工作路线的比例关系，让学习者身临其境地感受「十八晒」的壮观。",
    steps: []
  },
  {
    id: "K07", point_id: "RIVER", title: "河涌与泥料", category: "地域环境", image: PHOTO.mudCoat,
    text: "顺德水乡环境与香云纱工艺中的河泥使用有关，需区分河涌环境、取泥来源与过泥操作空间。",
    detail: "顺德地处珠江三角洲水网地带，河涌密布。香云纱涂河泥工序所用的含铁河泥即取自这些河涌。但「取泥」「运泥」「过泥」是不同环节，数字研学应准确区分三者的空间关系，避免概念混淆。",
    steps: []
  },
  {
    id: "K08", point_id: "RIVER", title: "泥料区的安全研学", category: "安全认知", image: PHOTO.washWorker,
    text: "研学者应在安全观摩区域学习，不应未经工作人员许可接近河岸、取泥或生产操作设施。",
    detail: "河涌区域水深泥软，存在溺水与陷落风险；生产设施亦有机械伤害隐患。研学活动必须在划定安全区内进行，服从现场指导老师安排，将安全意识内化为非遗学习的一部分。",
    steps: []
  },
  {
    id: "K09", point_id: "HALL", title: "薯莨：天然植物染料", category: "非遗认知", image: PHOTO.shuliangRoot,
    text: "薯莨是香云纱染色的核心原料，其块茎富含单宁，是天然的植物染料。",
    detail: "薯莨是一种藤本植物，块茎捣碎后可榨取棕红色汁液，富含单宁。将蚕丝坯绸浸入薯莨汁中反复浸染，布面逐渐染上棕褐色。单宁不仅是染料，更是后续与河泥中的铁离子发生络合反应的化学基础，是香云纱独特色泽的关键。",
    steps: ["挖取块茎", "捣碎榨汁", "过滤", "浸染坯绸"]
  },
  {
    id: "K10", point_id: "WORKSHOP", title: "三蒸九煮十八晒", category: "非遗认知", image: PHOTO.dyeHang,
    text: "「三蒸九煮十八晒」概括了香云纱反复浸染、蒸煮与晾晒的繁复工序。",
    detail: "这是对香云纱染整工序的形象概括。「蒸」与「煮」让薯莨汁液充分渗入纤维，「晒」则借助阳光完成固色与氧化。反复多次的循环，才让布面由浅入深、由黄转褐，最终呈现沉稳的乌黑光泽。每一步都考验着工匠的耐心与经验。",
    steps: ["浸染", "蒸煮", "晾晒", "重复循环"],
    video: { src: "assets/video/craft.mp4", poster: "assets/video/poster_craft.jpg", duration: "06:51", title: "三蒸九煮十八晒 · 工序演示" }
  },
  {
    id: "K11", point_id: "DRYING_FIELD", title: "晒莨：阳光的魔法", category: "晒场观察", image: PHOTO.silkRainbow,
    text: "晒莨是香云纱固色的关键，阳光与空气共同作用，让染料与纤维结合。",
    detail: "布匹平铺于草地，阳光中的紫外线促进薯莨单宁的氧化，使颜色由黄褐逐渐转为沉稳的棕褐。晒莨的时长、天气、翻布时机都影响最终色泽，经验丰富的工匠能根据天气变化灵活调整。",
    steps: [],
    video: { src: "assets/video/craft.mp4", poster: "assets/video/poster_craft.jpg", duration: "06:51", title: "晒莨：阳光的魔法" }
  },
  {
    id: "K12", point_id: "HALL", title: "非遗传承的意义", category: "非遗认知", image: PHOTO.danceSilk,
    text: "香云纱染整技艺是国家级非物质文化遗产，承载着岭南的匠心与文化记忆。",
    detail: "香云纱不仅是一种面料，更是一段活态的文化记忆。它记录了岭南水乡的自然环境、桑蚕农业与工匠智慧的交融。数字研学平台的使命，就是让年轻一代通过沉浸式体验，理解并珍视这份「天工开物」的遗产，让非遗在数字时代焕发新生。",
    steps: []
  }
];

/* ---------------------------------------------------------------- 非遗故事 */
var YS_STORIES = [
  {
    id: "S01", title: "一两黄金一两纱", image: PHOTO.fabricColor,
    text: "相传香云纱工艺繁复，从选坯到成纱需经历数十道工序，耗时数月光景，且完全依赖天时、地利与人工。正因如此，旧时一匹上等香云纱的价值堪比黄金，故有「一两黄金一两纱」的美誉。这不仅是价值的象征，更是对岭南工匠「慢工出细活」的礼赞。",
    video: { src: "assets/video/intro.mp4", poster: "assets/video/poster_intro.jpg", duration: "05:13", title: "一两黄金一两纱 · 纪录短片" }
  },
  {
    id: "S02", title: "镬耳屋下的守艺人", image: PHOTO.historyOld,
    text: "在顺德的水乡深处，一座座镬耳屋见证着香云纱的兴衰。老工匠们在工坊里日复一日地浸染、煮绸、晒莨，把一生的时光都揉进了这一匹匹乌黑发亮的绸缎里。他们的双手沾满薯莨的汁液，也承载着这门技艺得以延续的希望。"
  },
  {
    id: "S03", title: "河涌里的铁色秘密", image: PHOTO.washSplash,
    text: "为什么香云纱的黑色如此独特？秘密藏在顺德的河涌里。这里的河泥富含铁元素，当它涂覆在浸过薯莨汁的布面上，铁与单宁发生奇妙的化学反应，布面便泛出乌黑的光泽。这是大自然与人工的完美合谋，是任何化学染料都无法复刻的色泽。"
  },
  {
    id: "S04", title: "晒场的四季", image: PHOTO.dryingRedYellow,
    text: "晒莨场的风景随四季流转。春日阳光温柔，晒出的布色泽淡雅；盛夏烈日炎炎，晒莨最是得力，布面颜色沉稳；秋高气爽，是晒莨的黄金时节；冬日阳光稀薄，工匠们便放缓节奏，等待天时。一匹好纱，是时间与耐心的结晶。"
  }
];

/* ---------------------------------------------------------------- 工艺视频 */
var YS_VIDEOS = [
  { id: "V01", title: "云纱智境 · 非遗纪录片", desc: "香云纱的由来与匠心传承（实拍）", src: "assets/video/intro.mp4", poster: "assets/video/poster_intro.jpg", duration: "05:13", source: "B站《中国非遗香云纱》", point_id: "HALL" },
  { id: "V02", title: "三蒸九煮十八晒 · 工序演示", desc: "浸莨水 · 晒莨 · 过泥全流程实拍", src: "assets/video/craft.mp4", poster: "assets/video/poster_craft.jpg", duration: "06:51", source: "B站《非遗·香云纱》", point_id: "WORKSHOP" }
];

/* ---------------------------------------------------------------- 传承人 */
var YS_MASTERS = [
  {
    id: "M01", name: "梁师傅", title: "香云纱染整技艺传承人", ico: "👨‍🦳",
    image: PHOTO.workerGreen,
    desc: "四十余年坚守晒莨一线，深谙「三蒸九煮十八晒」的火候之道，是莨珠记基地的工艺指导。",
    quote: "做香云纱，急不得，也偷不得懒。",
    years: "从艺 42 年", region: "顺德 · 伦教", skill: "晒莨 / 浸染 / 火候",
    bio: "梁师傅自十八岁起跟随父辈学习香云纱染整，从挑布、浸莨到翻晒、收布，几乎每一个环节都亲手做过。他说，晒莨最看天——晴天的光照、草地的湿度、风的方向，都决定了这一匹纱的成色。如今他带徒传艺，把一辈子的经验留在晒场上。",
    craft: [
      { t: "看天晒莨", d: "凭经验判断当日光照与草地湿度，决定翻布次数与晾晒时辰。" },
      { t: "三蒸九煮", d: "把握浸染与蒸煮的遍数节奏，让薯莨单宁层层渗入蚕丝。" },
      { t: "火候收布", d: "在多次晒莨后准确判断固色程度，及时收布以免过曝。" }
    ],
    gallery: [PHOTO.workerCarry, PHOTO.silkSpread, PHOTO.dryingPanorama]
  },
  {
    id: "M02", name: "陈师傅", title: "涂河泥工序老工匠", ico: "👨‍🏭",
    image: PHOTO.mudTeam,
    desc: "专注涂河泥二十载，一双手能精准把控泥浆的厚薄与均匀，是工坊里公认的「泥手」。",
    quote: "泥要匀，手要稳，心要静。",
    years: "从艺 24 年", region: "顺德 · 伦教", skill: "涂泥 / 媒染 / 匀浆",
    bio: "陈师傅是工坊里涂河泥的一把好手。河泥含铁，与薯莨单宁相遇才显出乌黑光泽，这一步最考验手上功夫——泥厚了发花，薄了不显色。他常说，涂泥是个「慢活」，要一口气平推过去，不能停顿。",
    craft: [
      { t: "选泥调浆", d: "选取含铁量适中的河泥，调至不稀不稠的可涂状态。" },
      { t: "匀速平涂", d: "双手持具一次性平推，保证布面泥层厚薄一致。" },
      { t: "静置媒染", d: "让泥与单宁充分反应后清洗，呈现乌黑龟裂纹理。" }
    ],
    gallery: [PHOTO.mudWorkers, PHOTO.washMud, PHOTO.dryingBlack]
  },
  {
    id: "M03", name: "黄老师", title: "非遗文化研究员", ico: "👩‍🏫",
    image: PHOTO.models,
    desc: "长期从事香云纱文化研究与科普，推动非遗技艺走进校园与数字平台。",
    quote: "让年轻人看见，非遗才有未来。",
    years: "研究 15 年", region: "佛山 · 顺德", skill: "文化研究 / 科普 / 数字化",
    bio: "黄老师把香云纱的历史、工艺与文化整理成一套适合青少年理解的课程体系，并参与把晒场、工坊搬进数字孪生平台。她相信，只有让更多年轻人「看见」并「上手」，这项六百年技艺才能真正活下去。",
    craft: [
      { t: "梳理文脉", d: "整理香云纱六百年源流与文献，建立可教学的脉络。" },
      { t: "编写课程", d: "把复杂工艺拆成中小学生也能懂的研学任务。" },
      { t: "数字传播", d: "借助图文、视频与虚拟引擎让非遗触手可及。" }
    ],
    gallery: [PHOTO.shopExhibit, PHOTO.qipao, PHOTO.danceSilk]
  }
];

/* ---------------------------------------------------------------- 等级体系 */
var YS_LEVELS = [
  { lv: 1,  name: "寻纱学徒",   xp: 0 },
  { lv: 2,  name: "晒莨小工",   xp: 120 },
  { lv: 3,  name: "染整匠人",   xp: 320 },
  { lv: 4,  name: "过泥能手",   xp: 640 },
  { lv: 5,  name: "煮绸师傅",   xp: 1100 },
  { lv: 6,  name: "晒场管事",   xp: 1700 },
  { lv: 7,  name: "香云传承人", xp: 2500 },
  { lv: 8,  name: "莨珠大师",   xp: 3600 },
  { lv: 9,  name: "薯莨妙手",   xp: 5000 },
  { lv: 10, name: "三蒸九煮",   xp: 6800 },
  { lv: 11, name: "河泥洗练",   xp: 9000 },
  { lv: 12, name: "十八晒匠",   xp: 11800 },
  { lv: 13, name: "云纱织造师", xp: 15200 },
  { lv: 14, name: "岭南织云者", xp: 19500 },
  { lv: 15, name: "香云纱宗师", xp: 25000 }
];

/* ---------------------------------------------------------------- 成就体系 */
var YS_ACHIEVEMENTS = [
  { id: "first_login", name: "初入云纱", desc: "首次进入研学平台", ico: "🌅" },
  { id: "first_sign", name: "坚持开始", desc: "完成第一次签到", ico: "📅" },
  { id: "sign_7", name: "七日之约", desc: "连续签到 7 天", ico: "🔥" },
  { id: "first_task", name: "破题之始", desc: "完成第一个研学任务", ico: "✏️" },
  { id: "task_all", name: "寻纱之旅", desc: "完成全部四项研学任务", ico: "🏆" },
  { id: "perfect_task", name: "满分过关", desc: "单次任务获得满分", ico: "💯" },
  { id: "map_all", name: "四区巡礼", desc: "打卡全部四个研学点位", ico: "🗺️" },
  { id: "know_5", name: "博闻强识", desc: "阅读 5 条工艺知识", ico: "📚" },
  { id: "story_1", name: "故事收藏家", desc: "阅读 1 个非遗故事", ico: "📖" },
  { id: "quiz_1", name: "初试身手", desc: "完成一次知识问答竞赛", ico: "🧠" },
  { id: "quiz_90", name: "香云学霸", desc: "知识问答得分超过 90 分", ico: "🎓" },
  { id: "mud_1", name: "抢晴达人", desc: "完成一次晒莨抢晴", ico: "☀️" },
  { id: "mud_100", name: "晴天大师", desc: "晒莨抢晴单局达到 300 分", ico: "🏆" },
  { id: "rhythm_1", name: "调色有方", desc: "完成一次莨水配比", ico: "🎨" },
  { id: "sort_1", name: "工序排序", desc: "完成一次工序排序游戏", ico: "🔀" },
  { id: "memory_1", name: "翻牌记忆", desc: "完成一次翻牌记忆游戏", ico: "🃏" },
  { id: "ue_link", name: "虚实相生", desc: "接收数字孪生的联动数据", ico: "🔗" },
  { id: "cert", name: "研学结业", desc: "生成研学证书", ico: "📜" },
  { id: "xp_1000", name: "积分破千", desc: "累计积分达到 1000", ico: "✨" },
  { id: "all_games", name: "游戏达人", desc: "玩过所有小游戏", ico: "🎮" }
];

/* ---------------------------------------------------------------- 知识问答竞赛题库 */
var YS_QUIZ = [
  { q: "香云纱是哪个地区的传统丝绸面料？", opts: ["岭南", "江南", "西南", "西北"], a: 0, exp: "香云纱发源于岭南（今广东一带），是典型的岭南非遗。" },
  { q: "香云纱浸染所用的植物原料是？", opts: ["薯莨", "靛蓝", "茜草", "苏木"], a: 0, exp: "薯莨的块茎捣碎取汁用于浸染，是香云纱的天然染料。" },
  { q: "涂河泥的作用是？", opts: ["与单宁反应显色", "增加香味", "防水", "防虫"], a: 0, exp: "河泥中的铁离子与薯莨单宁发生络合反应，使布面显乌黑光泽。" },
  { q: "「三蒸九煮十八晒」中的「十八晒」指？", opts: ["反复晾晒", "十八种颜色", "十八个工人", "十八道工序"], a: 0, exp: "强调反复晒莨、耐心固色的匠心过程。" },
  { q: "香云纱的另一个名称是？", opts: ["莨绸", "云锦", "宋锦", "蜀锦"], a: 0, exp: "香云纱又称莨绸、莨纱。" },
  { q: "香云纱是哪个级别的非物质文化遗产？", opts: ["国家级", "省级", "市级", "区级"], a: 0, exp: "香云纱染整技艺是国家级非物质文化遗产。" },
  { q: "晒莨时布匹铺在什么上面？", opts: ["草地", "水泥地", "木架", "石板"], a: 0, exp: "布匹平铺于草地，充分利用阳光与空气。" },
  { q: "镬耳屋是哪里的传统民居？", opts: ["广府", "徽州", "晋中", "闽南"], a: 0, exp: "镬耳屋是广府传统民居的标志性造型。" },
  { q: "「一两黄金一两纱」形容的是？", opts: ["香云纱的珍贵", "金矿", "金线织品", "染金工艺"], a: 0, exp: "形容香云纱工艺繁复、价值珍贵。" },
  { q: "涂河泥后布面呈现什么独特效果？", opts: ["乌黑光泽与龟裂纹", "金色反光", "白色斑点", "透明质地"], a: 0, exp: "铁离子与单宁反应后呈现乌黑光泽与龟裂纹理。" },
  { q: "薯莨属于什么植物？", opts: ["藤本", "乔木", "草本花卉", "水生植物"], a: 0, exp: "薯莨是一种藤本植物，块茎用于取汁。" },
  { q: "研学时接近河涌应？", opts: ["在安全区观摩", "随意下水", "独自靠近河岸", "翻越围栏"], a: 0, exp: "河涌水深泥软，必须在安全观摩区域学习。" },
  { q: "香云纱的坯布主要是什么材质？", opts: ["蚕丝", "棉", "麻", "化纤"], a: 0, exp: "以桑蚕丝织物为坯绸。" },
  { q: "过泥工序使用的河泥来自？", opts: ["珠江流域", "黄河", "长江", "湖泊"], a: 0, exp: "取自珠江流域含铁河泥。" },
  { q: "工作坊湿作业区主要负责？", opts: ["浸染煮绸过泥清洗", "卷布打包", "展陈讲解", "仓储"], a: 0, exp: "湿作业区承担浸染、煮绸、过泥、清洗等环节。" },
  { q: "卷布整理是生产中的？", opts: ["品质控制环节", "染色环节", "种植环节", "运输环节"], a: 0, exp: "卷布整理是品质控制的最后一环。" },
  { q: "晒莨场为什么要留作业通道？", opts: ["便于翻布补浆", "装饰美观", "排水", "停车"], a: 0, exp: "作业通道便于工人翻布、补浆与检查。" },
  { q: "香云纱的数字研学中，数字孪生场景主要表现？", opts: ["晒场开阔尺度", "答题界面", "积分系统", "签到"], a: 0, exp: "数字孪生场景优先表现晒场的开阔尺度与工作路线。" },
  { q: "仓储环境需要注意？", opts: ["防潮防虫避光", "高温暴晒", "潮湿", "强光直射"], a: 0, exp: "仓储需防潮、防虫、避光，保持质感。" },
  { q: "香云纱制作的核心精神是？", opts: ["匠心与耐心", "追求速度", "机械化", "批量复制"], a: 0, exp: "三蒸九煮十八晒体现的是匠心与耐心。" }
];

/* ---------------------------------------------------------------- 工序排序游戏数据 */
var YS_SORT_STEPS = [
  { id: "step1", name: "选坯绸", ico: "🧵", desc: "挑选优质桑蚕丝坯绸" },
  { id: "step2", name: "浸薯莨汁", ico: "🫙", desc: "坯绸浸入薯莨汁液" },
  { id: "step3", name: "晒莨", ico: "☀️", desc: "平铺草地晾晒固色" },
  { id: "step4", name: "涂河泥", ico: "🖐️", desc: "涂覆含铁河泥显色" },
  { id: "step5", name: "清洗", ico: "💧", desc: "清洗去除多余河泥" },
  { id: "step6", name: "卷布整理", ico: "📦", desc: "检查整理卷布打包" }
];

/* ---------------------------------------------------------------- 签到奖励规则 */
var YS_CHECKIN_REWARD = function (streak) {
  return 10 + Math.min(streak, 7) * 5;
};

/* ---------------------------------------------------------------- 雷达图维度 */
var YS_RADAR_DIMS = ["工艺认知", "实践操作", "文化理解", "知识掌握", "安全素养"];

/* ---------------------------------------------------------------- 地理坐标（真实地图锚点）
   顺德区位于佛山市，坐标约为 22.8N, 113.3E。
   莨珠记基地概念位置设为顺德附近（用于真实地图展示）。 */
var YS_GEO = {
  center: { lat: 22.8045, lng: 113.2942 },   // 顺德区中心
  base: { lat: 22.8045, lng: 113.2942 },     // 莨珠记基地
  points: {
    HALL:         { lat: 22.8060, lng: 113.2960, name: "莨珠记主馆" },
    WORKSHOP:     { lat: 22.8030, lng: 113.2930, name: "染整工作坊" },
    DRYING_FIELD: { lat: 22.8080, lng: 113.2980, name: "草地晒莨场" },
    RIVER:        { lat: 22.8000, lng: 113.2900, name: "河涌泥料区" }
  },
  region: "广东省佛山市顺德区"
};

/* 老师端不再内置任何演示学员或班级统计。
   班级数据只能由老师导入学生真实导出的记录（见 views.js 研学数据看板）。 */

/* ==========================================================================
   奖励系统 / Reward System
   双货币：积分 XP（升级） + 传承币 COINS（消费）
   ========================================================================== */

/* ---------------------------------------------------------------- 商店商品 */
var YS_SHOP = [
  { id: "icon_lan", name: "头像·莨纱纹", ico: "🖼️", price: 120, type: "decor", desc: "香云纱纹理头像装饰", av: { ico: "纱", bg: "linear-gradient(135deg,#83533B,#D9AD71)" } },
  { id: "icon_mud", name: "头像·河泥印", ico: "🟫", price: 120, type: "decor", desc: "河泥媒染印象头像", av: { ico: "泥", bg: "linear-gradient(135deg,#5E6B45,#9DAE75)" } },
  { id: "icon_sun", name: "头像·晒莨场", ico: "☀️", price: 120, type: "decor", desc: "草地晒场主题头像", av: { ico: "晒", bg: "linear-gradient(135deg,#D0A24E,#EFD39B)" } },
  { id: "icon_silk", name: "头像·乌光泽", ico: "⚫", price: 160, type: "decor", desc: "香云纱乌黑光泽", av: { ico: "乌", bg: "linear-gradient(135deg,#2E2119,#6E4420)" } },
  /* 主题商品由 YS_THEMES 自动生成（见 reward.js themeShopItems），避免双处维护 */
];

/* ---------------------------------------------------------------- 主题外观（皮肤）
   9 套配色：默认 + 8 款可购买。每款含整套 CSS 变量（app.css）与背景蒙版（theme3d.css）。
   price>0 的主题会出现在传承商店；id="" 为默认免费主题。
   背景 veil 与照片滤镜随主题变化，切换后整屏色调明显不同。 */
var YS_THEMES = [
  { id: "",            skin: "default",  name: "茶褐原色", desc: "香云纱经典茶褐 · 默认配色",       sw: ["#83533B", "#D9AD71"], price: 0 },
  { id: "theme_gold",  skin: "gold",     name: "泥金",      ico: "🌟",     desc: "鎏金暖阳 · 富贵气",              sw: ["#A9742B", "#EBCC8E"], price: 800 },
  { id: "theme_grass", skin: "grass",    name: "草绿",      ico: "🌿",     desc: "晒场草绿 · 清透自然",            sw: ["#5E7A4B", "#BFD08A"], price: 800 },
  { id: "theme_ocean", skin: "ocean",    name: "靛蓝",      ico: "🌊",     desc: "深海靛蓝 · 沉静澄澈",            sw: ["#2E5E96", "#8FC0E8"], price: 1200 },
  { id: "theme_violet",skin: "violet",   name: "紫霞",      ico: "🔮",     desc: "暮色紫霞 · 梦幻雅致",            sw: ["#6E4BA8", "#C9A8EA"], price: 1200 },
  { id: "theme_ink",   skin: "ink",      name: "墨韵",      ico: "🖤",     desc: "水墨青黑 · 沉稳高级（深色氛围）", sw: ["#2C3A38", "#7A9A93"], price: 1500 },
  { id: "theme_sunset",skin: "sunset",   name: "丹霞",      ico: "🌅",     desc: "赭红丹霞 · 热烈明丽",            sw: ["#B0432F", "#EFA98B"], price: 1200 },
  { id: "theme_celadon",skin:"celadon",  name: "青瓷",      ico: "🍵",     desc: "青瓷碧色 · 温润清雅",            sw: ["#3E8078", "#A6D8CF"], price: 1200 },
  { id: "theme_sakura",skin: "sakura",   name: "樱粉",      ico: "🌸",     desc: "暖樱粉黛 · 柔和浪漫",            sw: ["#C25C7E", "#F0B8CC"], price: 1200 }
];

/* ---------------------------------------------------------------- 盲盒奖池（权重） */
var YS_BOX_PRIZES = [
  { name: "传承币 ×20", ico: "🪙", weight: 40, coins: 20 },
  { name: "传承币 ×50", ico: "💰", weight: 25, coins: 50 },
  { name: "传承币 ×100", ico: "💎", weight: 15, coins: 100 },
  { name: "限定头像·莨纱", ico: "🖼️", weight: 10, item: "icon_lan" },
  { name: "稀有称号·巧手", ico: "🎖️", weight: 7, item: "title_master" },
  { name: "传世·香云纱徽章", ico: "🏵️", weight: 3, coins: 300 }
];

/* ---------------------------------------------------------------- 首页大 Banner 轮播（第 1 张保持原版样式） */
var YS_BANNERS = [
  { img: PHOTO.dryingPanorama, badge: "国家级非遗", kicker: "YUNSHA · 云纱智境", title: "发现<em>香云纱</em><br>六百年岭南匠心", sub: "三蒸九煮十八晒 · 薯莨染整 · 数字研学", act: "enc" },
  { img: PHOTO.workshopVat,    badge: "非遗工坊",   kicker: "工坊研学 · 实景课堂", title: "九煮十八晒<br><em>感受匠人手温</em>", sub: "染缸 · 晒架 · 过乌上泥，全流程实景体验", cta: "进工坊看看", act: "point", arg: "WORKSHOP" },
  { img: PHOTO.dryingRedYellow, badge: "数字体验",   kicker: "抢晴晒莨 · 与天争时", title: "接住<em>阳光</em><br>晒出一匹好莨纱", sub: "晒莨抢晴小游戏 · 手速与预判的双重考验", cta: "去玩晒莨抢晴", act: "mudgame" },
  { img: PHOTO.dryingLake,     badge: "数字孪生",    kicker: "数字孪生 · 晒场实况", title: "云端晒莨场<br><em>虚实同步</em>", sub: "数字孪生实时联动 · 天气与晒场状态同步", cta: "看实时数据", act: "ue" }
];

/* ---------------------------------------------------------------- 头像库 */
var YS_AVATARS = [
  { id: "av_cloud", ico: "云", bg: "linear-gradient(135deg,#83533B,#D9AD71)" },
  { id: "av_dye", ico: "染", bg: "linear-gradient(135deg,#8C5A2B,#C08A5B)" },
  { id: "av_sun", ico: "晒", bg: "linear-gradient(135deg,#D9AD71,#E8C896)" },
  { id: "av_mud", ico: "泥", bg: "linear-gradient(135deg,#667B55,#98AE7B)" },
  { id: "av_silk", ico: "纱", bg: "linear-gradient(135deg,#6E4420,#A9805A)" },
  { id: "av_leaf", ico: "莨", bg: "linear-gradient(135deg,#5B6B3A,#8A9A5B)" },
  { id: "av_gold", ico: "锦", bg: "linear-gradient(135deg,#B56576,#D9A0A8)" },
  { id: "av_river", ico: "河", bg: "linear-gradient(135deg,#4A6B7A,#8AB0C0)" }
];

/* ---------------------------------------------------------------- 头像框库 */
var YS_FRAMES = [
  { id: "fr_none", name: "无框", price: 0, color: "transparent", desc: "默认样式" },
  { id: "fr_gold", name: "香云金框", price: 150, color: "linear-gradient(135deg,#D9AD71,#E8C896)", desc: "金边闪耀" },
  { id: "fr_ink", name: "莨棕框", price: 200, color: "linear-gradient(135deg,#40291F,#83533B)", desc: "沉稳大气" },
  { id: "fr_red", name: "莨红框", price: 180, color: "linear-gradient(135deg,#8C5A2B,#C08A5B)", desc: "薯莨之色" },
  { id: "fr_green", name: "草绿框", price: 220, color: "linear-gradient(135deg,#667B55,#98AE7B)", desc: "晒场草地" },
  { id: "fr_rainbow", name: "七彩框", price: 500, color: "linear-gradient(135deg,#C08A5B,#D9AD71,#667B55,#4A6B7A,#8C5A2B)", desc: "晒场彩虹" }
];

/* ---------------------------------------------------------------- 称号库
   tier 稀有度：0 普通 / 1 精良 / 2 稀有 / 3 史诗 / 4 传说(炫彩流光)
   等级越高显示越炫，传说档文字为不断变幻的炫彩色。
   id 命名约定：商店商品 id = "title_" + 称号 id 去掉 "ti_" 前缀，便于自动映射。 */
var YS_TITLES = [
  /* 普通 t0 */
  { id: "ti_none",       name: "无称号",     price: 0,    tier: 0, desc: "默认" },
  { id: "ti_apprentice", name: "寻纱学徒",   price: 0,    tier: 0, desc: "完成首个任务解锁" },
  /* 精良 t1 */
  { id: "ti_craftsman",  name: "晒莨巧手",   price: 200,  tier: 1, desc: "熟练的晒莨工艺" },
  { id: "ti_washer",     name: "过泥学徒",   price: 240,  tier: 1, desc: "初识河泥媒染" },
  { id: "ti_sunner",     name: "晒场学徒",   price: 280,  tier: 1, desc: "看天晒莨的入门手艺" },
  /* 稀有 t2 */
  { id: "ti_master",     name: "工艺大师",   price: 500,  tier: 2, desc: "香云纱工艺大师" },
  { id: "ti_boiler",     name: "煮绸师傅",   price: 600,  tier: 2, desc: "三蒸九煮皆通" },
  { id: "ti_dyer",       name: "染整能手",   price: 680,  tier: 2, desc: "薯莨染整的骨干" },
  /* 史诗 t3 */
  { id: "ti_heritage",   name: "香云传承人", price: 900,  tier: 3, desc: "非遗技艺的传承中坚" },
  { id: "ti_guard",      name: "莨绸守艺人", price: 950,  tier: 3, desc: "守护传统晒莨工序" },
  { id: "ti_weaver",     name: "云纱织造师", price: 1000, tier: 3, desc: "织造云霞般的香云纱" },
  /* 传说 t4 · 炫彩流光 */
  { id: "ti_legend",     name: "非遗宗师",   price: 1000, tier: 4, desc: "最高荣誉 · 炫彩加身" },
  { id: "ti_saint",      name: "香云圣手",   price: 1600, tier: 4, desc: "一代宗匠 · 炫彩流光" },
  { id: "ti_pearl",      name: "莨珠大师",   price: 2000, tier: 4, desc: "莨珠记的传奇人物" },
  { id: "ti_immortal",   name: "一世宗师",   price: 2400, tier: 4, desc: "空前绝后 · 极致炫彩" }
];

/* 等级 → 稀有度档位：15 级分 5 档，每 3 级升一档，越高级特效越多 */
function titleTierOfLevel(lv) {
  if (lv >= 13) return 4; // 传说：炫彩流光
  if (lv >= 10) return 3; // 史诗：紫色流光
  if (lv >= 7)  return 2; // 稀有：蓝色微光
  if (lv >= 4)  return 1; // 精良：绿色
  return 0;               // 普通：1-3 级
}

/* ---------------------------------------------------------------- 7 日签到奖励（递增） */
var YS_SIGN_REWARDS = [
  { day: 1, ico: "🪙", coins: 10, xp: 5 },
  { day: 2, ico: "🪙", coins: 15, xp: 5 },
  { day: 3, ico: "🪙", coins: 20, xp: 10 },
  { day: 4, ico: "🪙", coins: 25, xp: 10 },
  { day: 5, ico: "💎", coins: 40, xp: 15 },
  { day: 6, ico: "🪙", coins: 50, xp: 15 },
  { day: 7, ico: "🎁", coins: 100, xp: 30, box: 1 }
];

/* ---------------------------------------------------------------- 补充成就（奖励系统相关） */
var YS_ACHIEVEMENTS_EXTRA = [
  { id: "sign_30", name: "持之以恒", desc: "累计签到 30 天", ico: "🏆" },
  { id: "box_1", name: "幸运开盒", desc: "开启第一个盲盒", ico: "🎁" },
  { id: "shop_1", name: "初次消费", desc: "在商店购买第一件商品", ico: "🛒" },
  { id: "frame_1", name: "装扮达人", desc: "佩戴一个头像框", ico: "⭕" },
  { id: "coins_500", name: "小有积蓄", desc: "累计获得 500 传承币", ico: "💰" },
  { id: "share_1", name: "分享传承", desc: "生成第一张研学分享卡", ico: "📤" },
  { id: "lane_1", name: "晒莨快手", desc: "完成一次晒莨节奏游戏", ico: "🍂" },
  { id: "all_done", name: "非遗传承人", desc: "解锁全部成就", ico: "👑" }
];

/* 合并奖励系统成就到主成就表 */
YS_ACHIEVEMENTS = YS_ACHIEVEMENTS.concat(YS_ACHIEVEMENTS_EXTRA);

/* ==========================================================================
   香云纱百科 / Encyclopedia —— 集中呈现香云纱的全部知识
   图片：assets/real/ 来源于网络公开报道的纪实摄影作品（详见 PHOTO 表），
        全站主图互不重复；仅用于研学教学演示，正式发布前请补充授权与署名。
   ========================================================================== */
var YS_ENCYC_IMG = {
  history: PHOTO.historyOld,
  shuliang: PHOTO.shuliangRoot,
  shuliang2: PHOTO.shuliangPile,
  workshop: PHOTO.workshopVat,
  drying: PHOTO.dryingPanorama,
  drying2: PHOTO.dryingStripes,
  dryingWork: PHOTO.workerCarry,
  dryingMaster: PHOTO.workerGreen,
  dryingAerial: PHOTO.dryingLake,
  mud: PHOTO.mudCoat,
  mud2: PHOTO.mudTeam,
  wash: PHOTO.washSplash,
  fabric: PHOTO.fabricColor,
  fabric2: PHOTO.silkWhite,
  costume: PHOTO.qipao,
  costume2: PHOTO.models,
  roll: PHOTO.foldCloth,
  wind: PHOTO.silkWind,
  sweep: PHOTO.collectCloth
};

/* ---------------------------------------------------------------- 百科章节 */
var YS_ENCYCLOPEDIA = [
  {
    id: "E01", cat: "溯源", title: "历史渊源：从响云纱到软黄金", ico: "📜",
    image: PHOTO.silkArch,
    gallery: [PHOTO.historyOld, PHOTO.fabricColor, PHOTO.models],
    summary: "香云纱本名「莨纱」，因穿着走路时沙沙作响，最初称「响云纱」，后人以谐音雅化为「香云纱」。有关记载最早可追溯至唐代。",
    paras: [
      "香云纱是广东省佛山市顺德区的特产丝绸面料，中国国家地理标志产品，本名「莨纱」「莨纱绸」，俗称莨绸、云纱，是莨纱与莨绸的合称。因穿着走路时会发出「沙沙」的轻响，最初被称作「响云纱」，后人取谐音雅化为「香云纱」，这个名字也让它多了几分诗意。",
      "有关薯莨染色的记载最早可追溯至唐代。北宋沈括在《梦溪笔谈》中记述过薯莨的染色作用，明代李时珍在《本草纲目》中也提到过这种植物的用途。可见以薯莨汁液浸染织物，在中国有着相当悠久的历史。",
      "明末清初，广东以渔业为主的疍民为适应水上生活，发明了一种凉爽、快干、耐脏的面料，晒莨染整技艺首先在顺德兴起。明代永乐年间，广东莨纱已经出口国外；清道光年间（1821—1850），南海开始织造土蚕丝平纹织物「绸」，经晒莨染整后便是莨绸。",
      "香云纱是世界纺织品中唯一用纯植物染料染色的真丝绸面料，被纺织界誉为「软黄金」「岭南瑰宝」。它的历史几经起落：二战后受人造丝冲击跌入低谷，上世纪七八十年代随改革开放再度流行，2008 年入选国家级非遗名录后重新受到关注。"
    ],
    facts: [
      { k: "最早记载", v: "唐代" },
      { k: "古籍记述", v: "《梦溪笔谈》《本草纲目》" },
      { k: "外销记载", v: "明永乐年间" },
      { k: "地理标志", v: "2011 年获批" }
    ]
  },
  {
    id: "E02", cat: "溯源", title: "名称由来与别称", ico: "🏷️",
    image: PHOTO.dryingStripes2,
    gallery: [PHOTO.dryingAerial1, PHOTO.dryingStripes, PHOTO.silkWhite],
    summary: "响云纱 → 香云纱；莨纱、莨绸、莨纱绸、云纱、软黄金、岭南瑰宝……一串名字背后是它的声音、原料与地位。",
    paras: [
      "「响云纱」是最早的名字：香云纱织物质地挺爽，穿着行走时衣料相互摩擦会发出细微的「沙沙」声，故得名。后人觉得「响」字略显直白，便以谐音改作「香云纱」，既保留了声音的联想，又添了云霞般的意象。",
      "「莨」字来自核心染料薯莨。以桑蚕丝提花纱罗织物为坯、经晒莨染整的称「莨纱」；以平纹织物为坯的称「莨绸」，二者合称「莨纱绸」。「云纱」则是民间对轻薄如云的纱绸的简称。",
      "「软黄金」形容其珍贵：一匹香云纱需经数十道工序、十五六天甚至数月反复染晒，产量稀少、手工成本高，旧时价值堪比黄金。「岭南瑰宝」则强调它是岭南水土与工匠智慧共同孕育的地域性珍品。"
    ],
    facts: [
      { k: "本名", v: "莨纱 / 莨纱绸" },
      { k: "初名", v: "响云纱" },
      { k: "美称", v: "软黄金 · 岭南瑰宝" },
      { k: "英文名", v: "Gambiered Guangdong Gauze" }
    ]
  },
  {
    id: "E03", cat: "地理", title: "地理分布：为什么偏偏是顺德", ico: "🗺️",
    image: PHOTO.grassPurple2,
    gallery: [PHOTO.dryingLake, PHOTO.grassPurple2, PHOTO.dryingRedYellow],
    summary: "桑基鱼塘、充沛日照、未受污染且富含铁离子的河涌泥、柔软的草地——四者缺一不可，共同锁定了珠江三角洲。",
    paras: [
      "香云纱的核心产地在广东省佛山市顺德区（伦教一带），并分布于南海、三水、番禺及中山等珠三角地区。顺德是香云纱生产传承基地，2011 年「香云纱」获国家地理标志保护产品称号，2020 年入选「中欧地理标志协定」第二批保护名单。",
      "为什么是这里？首先是原料：珠三角「桑基鱼塘」的农渔合耕体系提供了优质桑蚕丝，河网密布则提供了富含高价铁离子、未受污染的特殊河泥。薯莨虽不罕见，但河泥的选择极为讲究——必须含有适量的铁离子，才能与薯莨中的单宁充分反应生成乌黑光泽。",
      "其次是天时与地利：晒莨需要充足而稳定的阳光，以及大面积平整、经常修剪的柔软草地。草皮既支撑布匹、避免褶皱，又让布面均匀受热，草地上方的通风与草地一侧的阴凉，还造就了香云纱正反面色泽的差异。",
      "正因阳光、薯莨、河泥、草地、水分与劳动者的配合缺一不可，香云纱几乎无法被完整地异地复制。这也是它被称为「天工开物」式非遗技艺的根本原因。"
    ],
    facts: [
      { k: "核心产地", v: "广东佛山顺德伦教" },
      { k: "地理标志", v: "2011 年国家地理标志保护产品" },
      { k: "关键水土", v: "桑基鱼塘 · 含铁河泥" },
      { k: "气候条件", v: "充足日照 · 柔软草地" }
    ]
  },
  {
    id: "E04", cat: "原料", title: "三大原料：蚕丝、薯莨、河泥", ico: "🌿",
    image: PHOTO.shuliangHand,
    gallery: [PHOTO.shuliangRoot, PHOTO.shuliangPile, PHOTO.shuliangHand],
    summary: "桑蚕丝坯绸为骨，薯莨汁液为色，含铁河泥为媒——三种天然材料，造就世界上唯一用纯植物染料染色的真丝绸。",
    paras: [
      "**坯绸**：以桑蚕丝织成的提花纱罗织物或平纹织物为原料。真丝蛋白纤维既能吸附薯莨汁液中的单宁，又赋予成品轻薄柔软、凉爽透气的穿着体验。",
      "**薯莨**：薯蓣科薯莨的块茎，是一种藤本植物，也是传统中药材。块茎捣碎、榨汁、过滤后得到棕红色染液，富含单宁（鞣酸）与胶质。单宁不仅是天然染料，更是后续与铁离子反应的化学基础。工厂里薯莨常被打碎后蒸煮，以提高出汁率。",
      "**河泥**：取自珠三角河涌、未受污染、富含二价/高价铁离子的黑色塘泥。将河泥均匀涂覆在已浸染薯莨汁的绸面上，铁离子与单宁中的酚羟基反应，生成不溶于水的黑色单宁酸铁沉淀，使涂泥的一面变成油亮的乌黑色，另一面保持薯莨的黄褐色。",
      "这个「植物染料 + 矿物媒染」的组合，让香云纱成为中国丝绸中唯一用纯植物染料染色、且正反异色的面料，也是任何化学染料难以复刻的自然色泽。"
    ],
    facts: [
      { k: "坯料", v: "桑蚕丝纱罗 / 平纹织物" },
      { k: "植物染料", v: "薯莨块茎汁液（单宁）" },
      { k: "矿物媒染", v: "含铁河涌塘泥" },
      { k: "呈色原理", v: "单宁酸铁黑色沉淀" }
    ]
  },
  {
    id: "E05", cat: "工艺", title: "完整工序：三蒸九煮十八晒", ico: "⚙️",
    image: PHOTO.dyePattern,
    gallery: [PHOTO.dyeVat, PHOTO.workshopVat, PHOTO.dyePattern, PHOTO.workshopShed],
    summary: "浸莨水、晾晒、洒莨水、封莨水、煮练、卷绸、过泥、洗涤、晒干、摊雾、拉幅、整装——三十余道工序，多数需反复多次，全程约十五六天。",
    paras: [
      "香云纱的生产流程被形象地概括为「三蒸九煮十八晒」，实际包含三十多道工序，其中多道需要反复进行多次。整个过程几乎无法完全用机器替代，手工才能保证成品精良。",
      "**① 准备薯莨液**：薯莨块茎捣碎、蒸煮、过滤，得到浓度不同的莨水。**② 浸莨水（染纱）**：将练熟的坯绸浸入薯莨汁，反复十几次，布色由白转淡棕，再转棕红。**③ 晒莨**：每浸染一次便在草地上平铺晾晒一次，拉直绷紧、用竹竿固定防风，用葵叶扫帚扫匀使着色均匀。",
      "**④ 洒莨水 / 封莨水**：多次喷洒、封固莨液，让单宁充分渗入纤维。**⑤ 煮练**：用高温煮绸使染料固着，即「三蒸九煮」之意。**⑥ 卷绸**：晒干后卷起，等待下一轮浸染。",
      "**⑦ 过泥（涂河泥）**：最具决定性也最神秘的一步。凌晨开工，将含铁河泥均匀涂在绸面，平摊约半小时至四十分钟，让铁离子与单宁充分反应。**⑧ 洗泥（过水洗泥）**：用加压水冲去河泥，乌黑的一面显现。**⑨ 晒干、摊雾**：再晒，并在夜间摊放吸收草上露水软化。**⑩ 拉幅、整装、入库**：检查色泽与手感，卷布码尺；成品还需存放 3 至 6 个月方可裁制。",
      "晒莨对天气极为依赖：雨天无法开工，夏日烈日最宜，秋高气爽是黄金时节。一匹好纱，是时间、耐心与天时的共同结晶。"
    ],
    facts: [
      { k: "工序数量", v: "30 余道，多数反复" },
      { k: "制作周期", v: "约 15—16 天" },
      { k: "陈化时间", v: "存放 3—6 个月" },
      { k: "核心口诀", v: "三蒸九煮十八晒" }
    ]
  },
  {
    id: "E06", cat: "工艺", title: "晒莨：阳光与草地的魔法", ico: "☀️",
    image: PHOTO.silkRainbow2,
    gallery: [PHOTO.silkArch, PHOTO.silkRainbow, PHOTO.grassPurple, PHOTO.silkSpread],
    summary: "长幅绸缎平铺于草地，风起时如彩虹拱起。晒场尺度、草地软硬、翻布时机，全凭工匠经验。",
    paras: [
      "晒莨场是香云纱生产中最具视觉冲击的空间：一米多宽、约十五米长的布匹被工人们平整摊开、拉紧绷直，成排铺在开阔的草地上，远望如彩色地毯。航拍视角下，红色、褐色、黑色的布幅与绿色草带交织，构成岭南水乡独有的大地景观。",
      "晒莨不只是「晒干」。阳光中的紫外线促进薯莨单宁氧化，使颜色由黄褐逐步转为沉稳的棕褐；草地柔软的支撑避免布面褶皱，通风与光照的均匀度直接影响色泽一致性。因此草地需经常修剪，工人要用扫帚不断扫匀汁液，还要用竹竿、锥子固定布匹防止被风掀起。",
      "有趣的是，向阳的一面颜色会变浅，贴草的一面颜色更深，这种微妙的正反面差异也是手工香云纱的魅力之一。风起时绸缎被拱成一道弧，被摄影者称为「阳光下的彩虹」。",
      "晒场的开阔尺度、长幅布匹与作业通道的比例关系，也是数字孪生场景需要优先还原的视觉特征——这也是本项目与现场设备联动的重点。"
    ],
    facts: [
      { k: "单幅尺寸", v: "约 1m × 15m" },
      { k: "场地要求", v: "平整草地 · 经常修剪" },
      { k: "固色关键", v: "紫外线氧化单宁" },
      { k: "最佳时节", v: "夏日 / 秋高气爽" }
    ]
  },
  {
    id: "E07", cat: "工艺", title: "过泥与洗纱：黑色的诞生", ico: "🖐️",
    image: PHOTO.dryingBlack,
    gallery: [PHOTO.mudCoat, PHOTO.washSplash, PHOTO.dryingBlack, PHOTO.washMud],
    summary: "凌晨四点开工，涂泥、静置反应、加压水冲洗——香云纱标志性的乌黑光泽，诞生在这半小时里。",
    paras: [
      "过河泥是整个工艺中最具决定性和神秘感的一步。工人们往往凌晨四点就开始准备，因为要赶在烈日升起前完成涂泥与反应。将富含二价铁离子的黑色河泥均匀涂抹在已浸染薯莨汁的黄褐色绸面上，涂好后把沉重的布匹平摊在地面或工棚里，静置约半小时到四十分钟。",
      "这半小时里，河泥中的铁离子与薯莨单宁中的酚羟基发生络合反应，生成不溶于水的黑色单宁酸铁沉淀。涂泥的一面变成油亮的乌黑色，成为香云纱的正面；未涂泥的一面保持薯莨的黄褐色，成为背面。这就是香云纱「一面乌黑、一面赭褐」的由来。",
      "随后是洗泥：把过好泥的布抬到水池边，用加压水冲去河泥，水花四溅，乌黑发亮的绸面随之显现。洗泥后再拿到草地上暴晒、摊雾软化，最后卷绸、码尺、整装。",
      "河泥的选择极为讲究：必须未受污染、含有适量高价铁离子。泥质不对，反应不足，黑色就不够油亮、也容易褪色。这正是香云纱难以异地复制的关键。"
    ],
    facts: [
      { k: "开工时间", v: "约凌晨 04:20" },
      { k: "反应时长", v: "30—40 分钟" },
      { k: "化学本质", v: "单宁酸铁黑色沉淀" },
      { k: "成品特征", v: "正面乌黑 / 背面赭褐" }
    ]
  },
  {
    id: "E08", cat: "成品", title: "面料特点：会呼吸的丝绸", ico: "🧵",
    image: PHOTO.silkWhite,
    gallery: [PHOTO.fabricColor, PHOTO.silkWhite, PHOTO.qipao, PHOTO.silkWind],
    summary: "挺爽柔润、凉爽宜人、易洗快干、不沾皮肤、轻薄不易皱、防水耐脏、经久耐穿——真丝与矿物泥共同赋予的特性。",
    paras: [
      "香云纱手感挺爽柔润，柔软而富有「身骨」；因附着了矿物河泥与薯莨胶质，具有凉爽宜人、易洗快干、色深耐脏、不沾皮肤、轻薄而不易折皱的特点，同时日晒和水洗牢度佳、防水性强、经久耐穿。",
      "它一面乌黑发亮、带有独特的龟裂纹理（俗称「莨纹」），另一面呈赭红或棕褐；在光线下会泛出金属般的幽光。穿着行走时的「沙沙」轻响，正是「响云纱」之名的来源。",
      "由于真丝构成，且原料薯莨本身是一味中药，民间也认为它具有一定的保健舒适性。成品衣料还需存放 3 至 6 个月「陈化」，让色泽与手感稳定后，才交给设计师裁制成旗袍、围巾、衬衫等。",
      "广东丝织业专家曾评价香云纱为「具有划时代意义和深远历史影响的创举」——它是优越自然条件与独特染整技艺相结合的产物。"
    ],
    facts: [
      { k: "正面", v: "乌黑油亮 · 龟裂莨纹" },
      { k: "背面", v: "赭红 / 棕褐" },
      { k: "穿着感", v: "凉爽 · 快干 · 不沾身" },
      { k: "成衣", v: "旗袍 · 围巾 · 夏装" }
    ]
  },
  {
    id: "E09", cat: "传承", title: "非遗保护与现代传承", ico: "🏛️",
    image: PHOTO.workshopFold,
    gallery: [PHOTO.shopExhibit, PHOTO.models, PHOTO.danceSilk, PHOTO.workshopFold],
    summary: "2008 年入选第二批国家级非遗名录；从低谷到复兴，数字研学与服装设计正让这门技艺被年轻人看见。",
    paras: [
      "2008 年 6 月，「香云纱染整技艺」入选第二批国家级非物质文化遗产名录，顺德伦教成为传承地。2011 年，顺德香云纱获国家地理标志保护产品称号；2020 年入选「中欧地理标志协定」第二批保护名单。",
      "入选非遗后市场曾短暂升温，但因机器粗放生产导致质量参差，香云纱再次跌入低谷，2011 年顺德一度只剩 4 家工厂。繁复的手工工序决定了它无法完全工业化——这既是困境，也是它不可替代的价值。",
      "近年来，香云纱通过服装设计、T 台走秀、博物馆展陈重新进入公众视野。设计师把它做成旗袍、礼服与围巾，让古老的面料与现代审美对话；博物馆与文化机构则用展陈记录它的历史。",
      "数字研学是另一条路径：本项目正是用 H5/App 的数字孪生场景，把园区导览、工艺体验、知识学习搬到屏幕上，让年轻一代足不出户也能理解并珍视这份非遗。让年轻人看见，非遗才有未来。"
    ],
    facts: [
      { k: "非遗级别", v: "国家级（2008 年）" },
      { k: "传承地", v: "佛山顺德伦教" },
      { k: "中欧地标", v: "2020 年第二批" },
      { k: "传承路径", v: "设计 · 展陈 · 数字研学" }
    ]
  },
  {
    id: "E10", cat: "文化", title: "文化价值与常见误区", ico: "💡",
    image: PHOTO.dryingPurple2,
    gallery: [PHOTO.dyePattern2, PHOTO.collectCloth, PHOTO.workshopWorker, PHOTO.dryingPurple2],
    summary: "它不是普通黑布，也不是机器染色的仿品；它是「天人合一」的造物，是岭南水土与工匠耐心的合谋。",
    paras: [
      "香云纱的价值不止于面料。它记录了岭南水乡的自然环境（桑基鱼塘、河涌、日照）、桑蚕农业与工匠智慧的交融，是一段活态的文化记忆。「天人合一」四个字在它身上格外具体：没有合适的河泥、没有足够的阳光、没有平整的草地，再熟练的工匠也做不出一匹好纱。",
      "**常见误区一**：香云纱是「染黑的丝绸」。其实它的黑色来自薯莨单宁与河泥铁离子的化学反应，是媒染显色而非简单染色，且正反异色。",
      "**常见误区二**：河泥处理都在河里完成。数字研学中应区分「河涌环境」「取泥来源」「实际过泥工位」三者的空间关系，取泥、运泥、过泥是不同环节。",
      "**常见误区三**：机器可以完全替代手工。事实上多数工序需反复多次且高度依赖经验判断（天气、泥质、着色均匀度），机器粗放生产正是历史上品质下滑的原因之一。",
      "**常见误区四**：镬耳屋主馆就是现场建筑实测。本项目中的主馆是概念设计，用于数字研学的文化氛围营造，具体建筑与工位须以基地实地记录为准。"
    ],
    facts: [
      { k: "核心精神", v: "匠心 · 耐心 · 天人合一" },
      { k: "唯一性", v: "唯一纯植物染料真丝绸" },
      { k: "不可复制", v: "水土 + 天时 + 手工" },
      { k: "研学注意", v: "安全区观摩，勿近河岸" }
    ]
  }
];

/* ---------------------------------------------------------------- 历史时间线 */
var YS_TIMELINE = [
  { year: "唐", text: "已有薯莨染色相关记载的溯源", ico: "📜" },
  { year: "北宋", text: "沈括《梦溪笔谈》记述薯莨染色作用", ico: "📖" },
  { year: "明", text: "李时珍《本草纲目》提及薯莨；永乐年间广东莨纱出口国外", ico: "⛵" },
  { year: "明末清初", text: "疍民为适应水上生活发明面料，晒莨技艺在顺德兴起", ico: "🌊" },
  { year: "清道光", text: "南海开始织造土蚕丝平纹织物「绸」，晒莨后成莨绸", ico: "🧵" },
  { year: "20 世纪中期", text: "二战后人造丝冲击，香云纱进入低谷", ico: "📉" },
  { year: "1970—80 年代", text: "改革开放后再度流行", ico: "📈" },
  { year: "2008", text: "香云纱染整技艺入选第二批国家级非遗名录", ico: "🏛️" },
  { year: "2011", text: "顺德香云纱获国家地理标志保护产品称号", ico: "🏅" },
  { year: "2020", text: "入选「中欧地理标志协定」第二批保护名单", ico: "🌍" },
  { year: "今天", text: "数字研学 + 服装设计，让非遗被年轻人看见", ico: "✨" }
];

/* ---------------------------------------------------------------- 百科分类 */
var YS_ENCYC_CATS = ["全部", "溯源", "地理", "原料", "工艺", "成品", "传承", "文化"];

/* ---------------------------------------------------------------- 图片来源署名 */
var YS_IMG_CREDIT = "本章配图来源于网络公开报道（南方日报、学习强国、新华网、佛山+ 等摄影作品）及项目概念图，仅用于研学教学演示，版权归原作者所有。";


/* ==========================================================================
   传承成长体系（香云纱文化语境的游戏化机制 —— 不用游戏术语）
   上瘾感来自：收集（图鉴）/ 进度（研学季）/ 稀缺（限定皮肤）/ 连续（晒莨历）
   ========================================================================== */

/* ---------------------------------------------------------------- 传承图鉴
   卡片引用现有数据 id：kind = master / know / point / craft
   集齐一套解锁套系奖励（传承币 + 积分 + 可能解锁限定皮肤） */
var YS_CODEX = [
  {
    id: "craft", name: "匠心传承", icon: "🧑‍🏭", color: "#83533B",
    desc: "寻访香云纱的背后匠人，记录他们的手艺与故事。",
    cards: [
      { id: "M01", name: "梁师傅 · 晒莨匠", kind: "master" },
      { id: "M02", name: "陈师傅 · 涂泥工", kind: "master" },
      { id: "M03", name: "织造艺人", kind: "master" },
      { id: "M04", name: "染整师傅", kind: "master" },
      { id: "M05", name: "晒场把式", kind: "master" },
      { id: "M06", name: "非遗学者", kind: "master" }
    ],
    reward: { coins: 200, xp: 150, skin: "skin_weave" }
  },
  {
    id: "process", name: "工序密码", icon: "⚗️", color: "#C98A2E",
    desc: "读懂「三蒸九煮十八晒」，解开香云纱的工艺密码。",
    cards: [
      { id: "K01", name: "认识香云纱", kind: "know" },
      { id: "K03", name: "薯莨取材", kind: "know" },
      { id: "K05", name: "浸染上色", kind: "know" },
      { id: "K07", name: "晒莨固色", kind: "know" },
      { id: "K09", name: "河泥媒染", kind: "know" },
      { id: "K11", name: "整理成纱", kind: "know" }
    ],
    reward: { coins: 220, xp: 180, skin: "skin_mud" }
  },
  {
    id: "footprint", name: "寻纱足迹", icon: "📍", color: "#667B55",
    desc: "走遍四大研学点位，把实地打卡的足迹收进图鉴。",
    cards: [
      { id: "HALL", name: "莨珠记主馆", kind: "point" },
      { id: "WORKSHOP", name: "染整工作坊", kind: "point" },
      { id: "DRYING_FIELD", name: "草地晒莨场", kind: "point" },
      { id: "RIVER", name: "河涌泥料区", kind: "point" }
    ],
    reward: { coins: 180, xp: 120, skin: "skin_sun" }
  },
  {
    id: "pattern", name: "纱品纹样", icon: "🧶", color: "#9E3B2F",
    desc: "观察香云纱的色泽与纹理，收集传统纹样之美。",
    cards: [
      { id: "P01", name: "乌黑光泽", kind: "craft" },
      { id: "P02", name: "龟裂纹理", kind: "craft" },
      { id: "P03", name: "莨棕本色", kind: "craft" },
      { id: "P04", name: "旗袍纹样", kind: "craft" }
    ],
    reward: { coins: 200, xp: 150, skin: "skin_silk" }
  }
];

/* 图鉴卡片解锁条件：kind + id 对应的存档/行为判定（由 growth.js 实现） */
var YS_CODEX_UNLOCK = {
  master: { store: "mastersRead", hint: "在「传承人」页阅读该匠人的故事" },
  know:   { store: "knowRead",     hint: "在「工艺知识」页读这条知识" },
  point:  { store: "pointsDone",   hint: "到该点位实地打卡" },
  craft:  { store: "patternsSeen", hint: "在「纹样图鉴」中点亮该纹样" }
};

/* ---------------------------------------------------------------- 研学季（赛季通行证）
   以香云纱四时时令命名，每季 6 阶。传承轨（免费）与匠心轨（进阶，用传承币解锁）。
   任务进度按累积「研习值 seasonXp」推进。 */
var YS_SEASONS = [
  {
    id: "spring", name: "春染季", sub: "万物复苏 · 浸莨初染", icon: "🌱", color: "#667B55",
    tiers: [
      { need: 0,   free: { coins: 30,  xp: 20 },  pro: { coins: 60,  xp: 40,  skin: "skin_sprout" } },
      { need: 100, free: { coins: 40,  xp: 30 },  pro: { coins: 80,  xp: 50 } },
      { need: 250, free: { coins: 50,  xp: 40 },  pro: { coins: 100, xp: 60,  title: "ti_craftsman" } },
      { need: 450, free: { coins: 60,  xp: 50 },  pro: { coins: 120, xp: 80,  frame: "fr_gold" } },
      { need: 700, free: { coins: 80,  xp: 60 },  pro: { coins: 150, xp: 100, skin: "skin_spring" } },
      { need: 1000,free: { coins: 120, xp: 100 }, pro: { coins: 220, xp: 150, title: "ti_master" } }
    ]
  },
  {
    id: "summer", name: "夏晒季", sub: "烈日当空 · 三蒸九晒", icon: "☀️", color: "#C98A2E",
    tiers: [
      { need: 0,   free: { coins: 30,  xp: 20 },  pro: { coins: 60,  xp: 40,  skin: "skin_sun" } },
      { need: 120, free: { coins: 40,  xp: 30 },  pro: { coins: 80,  xp: 50 } },
      { need: 300, free: { coins: 50,  xp: 40 },  pro: { coins: 100, xp: 60,  frame: "fr_red" } },
      { need: 520, free: { coins: 60,  xp: 50 },  pro: { coins: 120, xp: 80,  title: "ti_master" } },
      { need: 800, free: { coins: 80,  xp: 60 },  pro: { coins: 150, xp: 100, skin: "skin_sunset" } },
      { need: 1200,free: { coins: 120, xp: 100 }, pro: { coins: 250, xp: 180, title: "ti_legend" } }
    ]
  },
  {
    id: "autumn", name: "秋织季", sub: "天高云淡 · 织造成纱", icon: "🍂", color: "#9E3B2F",
    tiers: [
      { need: 0,   free: { coins: 30,  xp: 20 },  pro: { coins: 60,  xp: 40,  skin: "skin_weave" } },
      { need: 150, free: { coins: 40,  xp: 30 },  pro: { coins: 80,  xp: 50 } },
      { need: 350, free: { coins: 50,  xp: 40 },  pro: { coins: 100, xp: 60,  frame: "fr_green" } },
      { need: 600, free: { coins: 60,  xp: 50 },  pro: { coins: 120, xp: 80,  title: "ti_weaver" } },
      { need: 900, free: { coins: 80,  xp: 60 },  pro: { coins: 150, xp: 100, skin: "skin_silk" } },
      { need: 1300,free: { coins: 120, xp: 100 }, pro: { coins: 250, xp: 180, title: "ti_legend" } }
    ]
  },
  {
    id: "winter", name: "冬藏季", sub: "藏纱养韵 · 沉淀传承", icon: "❄️", color: "#4E6E8E",
    tiers: [
      { need: 0,   free: { coins: 30,  xp: 20 },  pro: { coins: 60,  xp: 40,  skin: "skin_frost" } },
      { need: 180, free: { coins: 40,  xp: 30 },  pro: { coins: 80,  xp: 50 } },
      { need: 400, free: { coins: 50,  xp: 40 },  pro: { coins: 100, xp: 60,  frame: "fr_rainbow" } },
      { need: 650, free: { coins: 60,  xp: 50 },  pro: { coins: 120, xp: 80,  title: "ti_saint" } },
      { need: 950, free: { coins: 80,  xp: 60 },  pro: { coins: 150, xp: 100, skin: "skin_ink" } },
      { need: 1400,free: { coins: 120, xp: 100 }, pro: { coins: 300, xp: 200, title: "ti_immortal" } }
    ]
  }
];
var YS_SEASON_PRO_COST = 300; /* 解锁匠心轨所需传承币 */

/* ---------------------------------------------------------------- 每日研习
   每天刷新的小目标，全部用研学行为描述。 */
var YS_DAILY = [
  { id: "read",  name: "读一条工艺知识", icon: "📖", goal: 1, coins: 15, xp: 10, seasonXp: 20, act: "v-know" },
  { id: "point", name: "探访一处点位",   icon: "📍", goal: 1, coins: 20, xp: 12, seasonXp: 25, act: "v-map" },
  { id: "quiz",  name: "答一组研学题",   icon: "🧠", goal: 1, coins: 20, xp: 15, seasonXp: 30, act: "v-game" },
  { id: "sign",  name: "完成每日晒莨签到", icon: "📅", goal: 1, coins: 10, xp: 8,  seasonXp: 15, act: "v-sign" }
];

/* 连续研习里程碑（晒莨历）：以晒莨工序隐喻坚持的天数 */
var YS_STREAK_MILES = [
  { days: 3,  name: "初浸薯莨", icon: "🌿", coins: 30,  xp: 20 },
  { days: 7,  name: "一周之晒", icon: "☀️", coins: 60,  xp: 50, skin: "skin_sprout" },
  { days: 14, name: "河泥初成", icon: "🟤", coins: 100, xp: 90, frame: "fr_gold" },
  { days: 30, name: "成纱有期", icon: "🧶", coins: 200, xp: 180, skin: "skin_legend" }
];

/* ---------------------------------------------------------------- 限定皮肤
   复用主题 skin，加稀有度/限定标签/解锁条件。仅在装扮页与图鉴展示。
   skin 值对应 css 的 body[data-skin]，与已有主题一致，可直接穿戴。 */
var YS_SKINS = [
  { id: "skin_sprout", name: "新芽·青篁", skin: "grass",    rarity: 1, limited: false, desc: "初春染坊的青篁之色", from: "研学季·春染 / 连签 7 日" },
  { id: "skin_sun",    name: "骄阳·晒金", skin: "gold",     rarity: 2, limited: false, desc: "盛夏晒场的鎏金光泽", from: "图鉴集齐·寻纱足迹 / 夏晒季" },
  { id: "skin_sunset", name: "丹霞·薯莨", skin: "sunset",   rarity: 3, limited: true,  desc: "薯莨染就的赭红丹霞", from: "夏晒季·匠心轨限定" },
  { id: "skin_weave",  name: "织云·青瓷", skin: "celadon",  rarity: 2, limited: false, desc: "织造车间的青瓷釉色", from: "图鉴集齐·匠心传承 / 秋织季" },
  { id: "skin_silk",   name: "素纱·月光", skin: "sakura",   rarity: 2, limited: false, desc: "香云纱柔美的月色光泽", from: "图鉴集齐·纱品纹样" },
  { id: "skin_mud",    name: "河泥·墨韵", skin: "ink",      rarity: 3, limited: true,  desc: "河泥媒染的深邃墨色", from: "图鉴集齐·工序密码限定" },
  { id: "skin_frost",  name: "凝霜·远山", skin: "ocean",    rarity: 3, limited: true,  desc: "冬日远山的靛蓝霜色", from: "冬藏季·匠心轨限定" },
  { id: "skin_spring", name: "春山·紫霞", skin: "violet",   rarity: 4, limited: true,  desc: "春日山岚流动的紫霞", from: "春染季·匠心轨终极" },
  { id: "skin_ink",    name: "秘染·玄夜", skin: "ink",      rarity: 4, limited: true,  desc: "传说中的秘染玄色", from: "冬藏季·匠心轨终极" },
  { id: "skin_legend", name: "宗师·流光", skin: "gold",     rarity: 5, limited: true,  desc: "仅属于非遗宗师的流光", from: "连续研习 30 日" }
];
var YS_RARITY = ["", "普通", "精良", "稀有", "史诗", "传说"];
