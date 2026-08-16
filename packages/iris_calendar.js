/*
METADATA
{
    "name": "iris_calendar",
    "display_name": {
        "zh": "拾月日历工具",
        "en": "Shiyue Calendar Tools"
    },
    "description": "提供心情记录、经期标记和详情记录、生病记录、日期备注、纪念日和日历数据查询工具，支持AI和用户双人记录",
    "author": ["Irislan0723"],
    "category": "Utility",
    "tools": [
        {
            "name": "record_mood",
            "description": "记录心情。AI和用户都可以记录，通过role区分。记录后会在日历上显示对应的心情图标。",
            "parameters": [
                { "name": "date", "description": "日期，格式为YYYY-MM-DD，例如2026-08-10", "type": "string", "required": true },
                { "name": "role", "description": "记录者角色，取值 user 或 ai", "type": "string", "required": true },
                { "name": "mood", "description": "心情类型，取值：happy(开心), loved(被爱), calm(平静), tired(疲惫), sad(难过), anxious(焦虑), angry(生气), miss_you(想你), excited(兴奋)", "type": "string", "required": true },
                { "name": "note", "description": "可选，心情备注文字", "type": "string", "required": false }
            ]
        },
        {
            "name": "record_period",
            "description": "记录经期信息。可标记经期开始或结束日期。AI可在聊天中主动调用来帮用户记录。",
            "parameters": [
                { "name": "date", "description": "日期，格式为YYYY-MM-DD", "type": "string", "required": true },
                { "name": "action", "description": "操作类型，取值 start(标记经期开始) 或 end(标记经期结束)", "type": "string", "required": true }
            ]
        },
        {
            "name": "record_period_detail",
            "description": "记录经期当天的详细信息，包括流量、颜色、疼痛程度和症状。AI可在用户描述经期状况时主动调用。",
            "parameters": [
                { "name": "date", "description": "日期，格式为YYYY-MM-DD", "type": "string", "required": true },
                { "name": "flow", "description": "流量，取值：light(少量)、medium(中等)、heavy(大量)", "type": "string", "required": false },
                { "name": "color", "description": "颜色，取值：bright_red(鲜红)、dark_red(暗红)、brown(褐色)、pink(粉色)", "type": "string", "required": false },
                { "name": "pain", "description": "疼痛等级，0(无痛)到4(剧痛)", "type": "number", "required": false },
                { "name": "symptoms", "description": "症状列表，逗号分隔，可选值：cramps(痉挛),backache(腰痛),headache(头痛),bloating(腹胀),fatigue(疲劳),mood_swing(情绪波动),breast_pain(胸痛),acne(痘痘)", "type": "string", "required": false },
                { "name": "note", "description": "补充备注", "type": "string", "required": false }
            ]
        },
        {
            "name": "record_sick",
            "description": "记录生病信息。可记录症状描述，会在日历上显示生病图标🤒。AI可在用户提到身体不舒服时主动调用。",
            "parameters": [
                { "name": "date", "description": "日期，格式为YYYY-MM-DD", "type": "string", "required": true },
                { "name": "note", "description": "症状描述，如'喉咙痛'、'发烧38.5度'、'胃疼'", "type": "string", "required": true }
            ]
        },
        {
            "name": "record_pin",
            "description": "给指定日期添加重要备注/便签。会在日历上显示📌图标。适合标记重要事件、提醒等。",
            "parameters": [
                { "name": "date", "description": "日期，格式为YYYY-MM-DD", "type": "string", "required": true },
                { "name": "note", "description": "备注内容", "type": "string", "required": true }
            ]
        },
        {
            "name": "set_anniversary",
            "description": "设置纪念日。纪念日会在日历上每年同一天高亮显示♡。",
            "parameters": [
                { "name": "date", "description": "纪念日日期，格式为MM-DD（每年重复）或YYYY-MM-DD（记录起始年份）", "type": "string", "required": true },
                { "name": "label", "description": "纪念日名称，如'相识纪念日'、'在一起纪念日'", "type": "string", "required": true }
            ]
        },
        {
            "name": "get_calendar_data",
            "description": "获取指定月份的日历数据，包括心情记录、经期信息、经期详情、生病记录、日期备注和纪念日",
            "parameters": [
                { "name": "month", "description": "月份，格式为YYYY-MM，例如2026-08", "type": "string", "required": true }
            ]
        },
        {
            "name": "get_mood_summary",
            "description": "获取指定月份的心情统计汇总",
            "parameters": [
                { "name": "month", "description": "月份，格式为YYYY-MM", "type": "string", "required": true }
            ]
        },
        {
            "name": "update_period_settings",
            "description": "更新经期设置，包括周期时长和经期时长",
            "parameters": [
                { "name": "cycle_length", "description": "月经周期时长（天），默认28天", "type": "number", "required": false },
                { "name": "period_length", "description": "经期时长（天），默认5天", "type": "number", "required": false }
            ]
        },
        {
            "name": "delete_mood",
            "description": "删除指定日期的心情记录",
            "parameters": [
                { "name": "date", "description": "日期，格式为YYYY-MM-DD", "type": "string", "required": true },
                { "name": "role", "description": "要删除的角色记录，取值 user 或 ai。不指定则删除该日全部心情记录", "type": "string", "required": false }
            ]
        },
        {
            "name": "delete_period",
            "description": "删除包含指定日期的经期记录",
            "parameters": [
                { "name": "date", "description": "日期，格式为YYYY-MM-DD，将删除包含该日期的经期记录", "type": "string", "required": true }
            ]
        },
        {
            "name": "delete_period_detail",
            "description": "删除指定日期的经期详情记录",
            "parameters": [
                { "name": "date", "description": "日期，格式为YYYY-MM-DD", "type": "string", "required": true }
            ]
        },
        {
            "name": "delete_sick",
            "description": "删除指定日期的生病记录",
            "parameters": [
                { "name": "date", "description": "日期，格式为YYYY-MM-DD", "type": "string", "required": true }
            ]
        },
        {
            "name": "delete_pin",
            "description": "删除指定日期的备注",
            "parameters": [
                { "name": "date", "description": "日期，格式为YYYY-MM-DD", "type": "string", "required": true }
            ]
        },
        {
            "name": "delete_anniversary",
            "description": "删除指定纪念日",
            "parameters": [
                { "name": "date", "description": "纪念日日期，格式为MM-DD", "type": "string", "required": true }
            ]
        },
        {
            "name": "get_anniversaries",
            "description": "获取所有已设置的纪念日列表",
            "parameters": []
        }
    ]
}
*/
const DATA_DIR = "/storage/emulated/0/Download/Operit/plugins/iris_calendar/data";
const MOOD_FILE = DATA_DIR + "/mood_data.json";
const PERIOD_FILE = DATA_DIR + "/period_data.json";
const SETTINGS_FILE = DATA_DIR + "/settings.json";
const SICK_FILE = DATA_DIR + "/sick_data.json";
const PIN_FILE = DATA_DIR + "/pin_data.json";
const PERIOD_DETAIL_FILE = DATA_DIR + "/period_detail_data.json";

const MOOD_TYPES = ["happy", "loved", "calm", "tired", "sad", "anxious", "angry", "miss_you", "excited"];
const MOOD_LABELS = {
  happy: "开心", loved: "被爱", calm: "平静", tired: "疲惫", sad: "难过",
  anxious: "焦虑", angry: "生气", miss_you: "想你", excited: "兴奋"
};

const FLOW_OPTIONS = ["light", "medium", "heavy"];
const FLOW_LABELS = { light: "少量", medium: "中等", heavy: "大量" };
const COLOR_OPTIONS = ["bright_red", "dark_red", "brown", "pink"];
const COLOR_LABELS = { bright_red: "鲜红", dark_red: "暗红", brown: "褐色", pink: "粉色" };
const SYMPTOM_TYPES = ["cramps", "backache", "headache", "bloating", "fatigue", "mood_swing", "breast_pain", "acne"];
const SYMPTOM_LABELS = {
  cramps: "痉挛", backache: "腰痛", headache: "头痛", bloating: "腹胀",
  fatigue: "疲劳", mood_swing: "情绪波动", breast_pain: "胸痛", acne: "痘痘"
};

async function ensureDataDir() {
  const checkResult = await Tools.Files.exists(DATA_DIR);
  if (!checkResult.exists) {
    await Tools.Files.mkdir(DATA_DIR);
  }
}

async function readJson(path) {
  const checkResult = await Tools.Files.exists(path);
  if (!checkResult.exists) return null;
  const readResult = await Tools.Files.read(path);
  try {
    return JSON.parse(readResult.content);
  } catch (e) {
    return null;
  }
}

async function writeJson(path, data) {
  await ensureDataDir();
  await Tools.Files.write(path, JSON.stringify(data, null, 2));
}

async function getMoodData() {
  return (await readJson(MOOD_FILE)) || { records: {} };
}

async function getPeriodData() {
  return (await readJson(PERIOD_FILE)) || { periods: [], settings: { cycle_length: 28, period_length: 5 } };
}

async function getSettings() {
  return (await readJson(SETTINGS_FILE)) || { cycle_length: 28, period_length: 5, anniversaries: [] };
}

async function getSickData() {
  return (await readJson(SICK_FILE)) || { records: {} };
}

async function getPinData() {
  return (await readJson(PIN_FILE)) || { records: {} };
}

async function getPeriodDetailData() {
  return (await readJson(PERIOD_DETAIL_FILE)) || { records: {} };
}

// ========== 心情 ==========

async function record_mood(params) {
  const { date, role, mood, note } = params;
  if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return { success: false, error: "日期格式无效，请使用YYYY-MM-DD格式" };
  }
  if (!["user", "ai"].includes(role)) {
    return { success: false, error: "角色无效，请使用 user 或 ai" };
  }
  if (!MOOD_TYPES.includes(mood)) {
    return { success: false, error: "心情类型无效，可选：" + MOOD_TYPES.join(", ") };
  }
  const data = await getMoodData();
  if (!data.records[date]) {
    data.records[date] = {};
  }
  data.records[date][role] = {
    mood: mood,
    note: note || "",
    timestamp: Date.now()
  };
  await writeJson(MOOD_FILE, data);
  const moodLabel = MOOD_LABELS[mood];
  const roleLabel = role === "user" ? "用户" : "AI";
  return {
    success: true,
    message: `已记录 ${roleLabel} 在 ${date} 的心情：${moodLabel}${note ? "，备注：" + note : ""}`
  };
}

async function delete_mood(params) {
  const { date, role } = params;
  if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return { success: false, error: "日期格式无效，请使用YYYY-MM-DD格式" };
  }
  const data = await getMoodData();
  if (!data.records[date]) {
    return { success: false, error: "该日期没有心情记录" };
  }
  if (role) {
    if (!["user", "ai"].includes(role)) {
      return { success: false, error: "角色无效，请使用 user 或 ai" };
    }
    delete data.records[date][role];
    if (!data.records[date].user && !data.records[date].ai) {
      delete data.records[date];
    }
  } else {
    delete data.records[date];
  }
  await writeJson(MOOD_FILE, data);
  return { success: true, message: "已删除 " + date + " 的心情记录" };
}

// ========== 经期 ==========

async function record_period(params) {
  const { date, action } = params;
  if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return { success: false, error: "日期格式无效，请使用YYYY-MM-DD格式" };
  }
  if (!["start", "end"].includes(action)) {
    return { success: false, error: "操作类型无效，请使用 start 或 end" };
  }
  const data = await getPeriodData();
  if (action === "start") {
    const lastPeriod = data.periods[data.periods.length - 1];
    if (lastPeriod && !lastPeriod.end_date) {
      return { success: false, error: "上一次经期尚未标记结束，请先标记结束日期" };
    }
    data.periods.push({ start_date: date, end_date: null });
    await writeJson(PERIOD_FILE, data);
    return { success: true, message: `已标记 ${date} 为经期开始日` };
  } else {
    const lastPeriod = data.periods[data.periods.length - 1];
    if (!lastPeriod || lastPeriod.end_date) {
      return { success: false, error: "没有未结束的经期记录，请先标记开始日期" };
    }
    lastPeriod.end_date = date;
    await writeJson(PERIOD_FILE, data);
    const startMs = new Date(lastPeriod.start_date).getTime();
    const endMs = new Date(date).getTime();
    const days = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
    return { success: true, message: `已标记 ${date} 为经期结束日，本次经期共${days}天` };
  }
}

async function delete_period(params) {
  const { date } = params;
  if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return { success: false, error: "日期格式无效，请使用YYYY-MM-DD格式" };
  }
  const data = await getPeriodData();
  let found = false;
  for (let i = data.periods.length - 1; i >= 0; i--) {
    const p = data.periods[i];
    const startDate = p.start_date;
    const endDate = p.end_date || "9999-12-31";
    if (date >= startDate && date <= endDate) {
      data.periods.splice(i, 1);
      found = true;
      break;
    }
  }
  if (!found) {
    return { success: false, error: "该日期没有经期记录" };
  }
  await writeJson(PERIOD_FILE, data);
  return { success: true, message: "已删除包含 " + date + " 的经期记录" };
}

async function update_period_settings(params) {
  const { cycle_length, period_length } = params;
  const settings = await getSettings();
  if (cycle_length !== undefined) {
    const cl = parseInt(cycle_length);
    if (isNaN(cl) || cl < 1) {
      return { success: false, error: "请输入有效的周期时长" };
    }
    settings.cycle_length = cl;
  }
  if (period_length !== undefined) {
    const pl = parseInt(period_length);
    if (isNaN(pl) || pl < 1) {
      return { success: false, error: "请输入有效的经期时长" };
    }
    settings.period_length = pl;
  }
  await writeJson(SETTINGS_FILE, settings);
  const periodData = await getPeriodData();
  periodData.settings = settings;
  await writeJson(PERIOD_FILE, periodData);
  return {
    success: true,
    message: `已更新设置：周期${settings.cycle_length}天，经期${settings.period_length}天`,
    settings: settings
  };
}

// ========== 经期详情 ==========

async function record_period_detail(params) {
  const { date, flow, color, pain, symptoms, note } = params;
  if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return { success: false, error: "日期格式无效，请使用YYYY-MM-DD格式" };
  }
  if (flow && !FLOW_OPTIONS.includes(flow)) {
    return { success: false, error: "流量取值无效，可选：light(少量), medium(中等), heavy(大量)" };
  }
  if (color && !COLOR_OPTIONS.includes(color)) {
    return { success: false, error: "颜色取值无效，可选：bright_red(鲜红), dark_red(暗红), brown(褐色), pink(粉色)" };
  }
  var painVal = null;
  if (pain !== undefined && pain !== null) {
    painVal = parseInt(pain);
    if (isNaN(painVal) || painVal < 0 || painVal > 4) {
      return { success: false, error: "疼痛等级无效，请输入0-4之间的数字" };
    }
  }
  var symptomList = [];
  if (symptoms) {
    symptomList = symptoms.split(",").map(function(s) { return s.trim(); }).filter(function(s) { return SYMPTOM_TYPES.indexOf(s) >= 0; });
  }
  const data = await getPeriodDetailData();
  data.records[date] = {
    flow: flow || null,
    color: color || null,
    pain: painVal,
    symptoms: symptomList,
    note: note || "",
    timestamp: Date.now()
  };
  await writeJson(PERIOD_DETAIL_FILE, data);

  var parts = [];
  if (flow) parts.push("流量" + FLOW_LABELS[flow]);
  if (color) parts.push("颜色" + COLOR_LABELS[color]);
  if (painVal !== null) parts.push("疼痛" + painVal + "级");
  if (symptomList.length > 0) parts.push("症状：" + symptomList.map(function(s) { return SYMPTOM_LABELS[s] || s; }).join("、"));
  if (note) parts.push("备注：" + note);

  return {
    success: true,
    message: "已记录 " + date + " 的经期详情" + (parts.length > 0 ? "：" + parts.join("，") : "")
  };
}

async function delete_period_detail(params) {
  const { date } = params;
  if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return { success: false, error: "日期格式无效，请使用YYYY-MM-DD格式" };
  }
  const data = await getPeriodDetailData();
  if (!data.records[date]) {
    return { success: false, error: "该日期没有经期详情记录" };
  }
  delete data.records[date];
  await writeJson(PERIOD_DETAIL_FILE, data);
  return { success: true, message: "已删除 " + date + " 的经期详情记录" };
}

// ========== 生病记录 ==========

async function record_sick(params) {
  const { date, note } = params;
  if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return { success: false, error: "日期格式无效，请使用YYYY-MM-DD格式" };
  }
  if (!note || !note.trim()) {
    return { success: false, error: "请填写症状描述" };
  }
  const data = await getSickData();
  data.records[date] = {
    note: note.trim(),
    timestamp: Date.now()
  };
  await writeJson(SICK_FILE, data);
  return {
    success: true,
    message: `已记录 ${date} 的生病信息：${note.trim()}`
  };
}

async function delete_sick(params) {
  const { date } = params;
  if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return { success: false, error: "日期格式无效，请使用YYYY-MM-DD格式" };
  }
  const data = await getSickData();
  if (!data.records[date]) {
    return { success: false, error: "该日期没有生病记录" };
  }
  delete data.records[date];
  await writeJson(SICK_FILE, data);
  return { success: true, message: "已删除 " + date + " 的生病记录" };
}

// ========== 日期备注 ==========

async function record_pin(params) {
  const { date, note } = params;
  if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return { success: false, error: "日期格式无效，请使用YYYY-MM-DD格式" };
  }
  if (!note || !note.trim()) {
    return { success: false, error: "请填写备注内容" };
  }
  const data = await getPinData();
  data.records[date] = {
    note: note.trim(),
    timestamp: Date.now()
  };
  await writeJson(PIN_FILE, data);
  return {
    success: true,
    message: `已为 ${date} 添加备注：${note.trim()}`
  };
}

async function delete_pin(params) {
  const { date } = params;
  if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return { success: false, error: "日期格式无效，请使用YYYY-MM-DD格式" };
  }
  const data = await getPinData();
  if (!data.records[date]) {
    return { success: false, error: "该日期没有备注" };
  }
  delete data.records[date];
  await writeJson(PIN_FILE, data);
  return { success: true, message: "已删除 " + date + " 的备注" };
}

// ========== 纪念日 ==========

async function set_anniversary(params) {
  const { date, label } = params;
  if (!label || !label.trim()) {
    return { success: false, error: "请填写纪念日名称" };
  }
  let mmdd = date;
  if (date && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    mmdd = date.substring(5);
  }
  if (!mmdd || !mmdd.match(/^\d{2}-\d{2}$/)) {
    return { success: false, error: "日期格式无效，请使用MM-DD或YYYY-MM-DD格式" };
  }
  const settings = await getSettings();
  if (!settings.anniversaries) settings.anniversaries = [];
  const existing = settings.anniversaries.findIndex(a => a.date === mmdd);
  if (existing >= 0) {
    settings.anniversaries[existing] = { date: mmdd, label: label.trim(), origin: date };
  } else {
    settings.anniversaries.push({ date: mmdd, label: label.trim(), origin: date });
  }
  await writeJson(SETTINGS_FILE, settings);
  return {
    success: true,
    message: `已设置纪念日：每年 ${mmdd} — ${label.trim()}`
  };
}

async function delete_anniversary(params) {
  const { date } = params;
  let mmdd = date;
  if (date && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    mmdd = date.substring(5);
  }
  if (!mmdd || !mmdd.match(/^\d{2}-\d{2}$/)) {
    return { success: false, error: "日期格式无效，请使用MM-DD格式" };
  }
  const settings = await getSettings();
  if (!settings.anniversaries) settings.anniversaries = [];
  const idx = settings.anniversaries.findIndex(a => a.date === mmdd);
  if (idx < 0) {
    return { success: false, error: "该日期没有纪念日记录" };
  }
  const removed = settings.anniversaries.splice(idx, 1)[0];
  await writeJson(SETTINGS_FILE, settings);
  return { success: true, message: "已删除纪念日：" + removed.label };
}

async function get_anniversaries() {
  const settings = await getSettings();
  const list = settings.anniversaries || [];
  if (list.length === 0) {
    return { success: true, message: "还没有设置纪念日", anniversaries: [] };
  }
  return { success: true, anniversaries: list };
}

// ========== 日历数据查询 ==========

async function get_calendar_data(params) {
  const { month } = params;
  if (!month || !month.match(/^\d{4}-\d{2}$/)) {
    return { success: false, error: "月份格式无效，请使用YYYY-MM格式" };
  }
  const moodData = await getMoodData();
  const periodData = await getPeriodData();
  const settings = await getSettings();
  const sickData = await getSickData();
  const pinData = await getPinData();
  const periodDetailData = await getPeriodDetailData();

  const monthMoods = {};
  for (const [date, record] of Object.entries(moodData.records)) {
    if (date.startsWith(month)) {
      monthMoods[date] = record;
    }
  }

  const monthSick = {};
  for (const [date, record] of Object.entries(sickData.records)) {
    if (date.startsWith(month)) {
      monthSick[date] = record;
    }
  }

  const monthPins = {};
  for (const [date, record] of Object.entries(pinData.records)) {
    if (date.startsWith(month)) {
      monthPins[date] = record;
    }
  }

  const monthPeriodDetails = {};
  for (const [date, record] of Object.entries(periodDetailData.records)) {
    if (date.startsWith(month)) {
      monthPeriodDetails[date] = record;
    }
  }

  const [year, mon] = month.split("-").map(Number);
  const firstDay = new Date(year, mon - 1, 1);
  const lastDay = new Date(year, mon, 0);
  const periodDates = [];
  const predictedPeriodDates = [];
  const ovulationDates = [];

  for (const period of periodData.periods) {
    const start = new Date(period.start_date);
    const end = period.end_date ? new Date(period.end_date) : new Date(start.getTime() + (settings.period_length - 1) * 86400000);
    for (let d = new Date(start); d <= end && d <= lastDay; d.setDate(d.getDate() + 1)) {
      if (d >= firstDay) {
        periodDates.push(d.toISOString().split("T")[0]);
      }
    }
  }

  if (periodData.periods.length > 0) {
    const lastCompletePeriod = [...periodData.periods].reverse().find(p => p.end_date);
    if (lastCompletePeriod) {
      const lastStart = new Date(lastCompletePeriod.start_date);
      const cycleLen = settings.cycle_length;
      const periodLen = settings.period_length;
      for (let i = 1; i <= 3; i++) {
        const predictedStart = new Date(lastStart.getTime() + cycleLen * i * 86400000);
        const predictedEnd = new Date(predictedStart.getTime() + (periodLen - 1) * 86400000);
        const ovulation = new Date(predictedStart.getTime() + (cycleLen - 14) * 86400000);
        for (let d = new Date(predictedStart); d <= predictedEnd && d <= lastDay; d.setDate(d.getDate() + 1)) {
          if (d >= firstDay) {
            const ds = d.toISOString().split("T")[0];
            if (!periodDates.includes(ds)) {
              predictedPeriodDates.push(ds);
            }
          }
        }
        if (ovulation >= firstDay && ovulation <= lastDay) {
          ovulationDates.push(ovulation.toISOString().split("T")[0]);
        }
      }
    }
  }

  const anniversaryDates = [];
  const anniversaries = settings.anniversaries || [];
  for (const ann of anniversaries) {
    const mmdd = ann.date;
    const annDateStr = month + "-" + mmdd.split("-")[1];
    if (mmdd.split("-")[0] === month.split("-")[1]) {
      anniversaryDates.push({ date: annDateStr, label: ann.label });
    }
  }

  return {
    success: true,
    month: month,
    moods: monthMoods,
    sick_records: monthSick,
    pin_records: monthPins,
    period_details: monthPeriodDetails,
    period_dates: periodDates,
    predicted_period_dates: predictedPeriodDates,
    ovulation_dates: ovulationDates,
    anniversaries: anniversaryDates,
    settings: settings
  };
}

async function get_mood_summary(params) {
  const { month } = params;
  if (!month || !month.match(/^\d{4}-\d{2}$/)) {
    return { success: false, error: "月份格式无效，请使用YYYY-MM格式" };
  }
  const moodData = await getMoodData();
  const userSummary = {};
  const aiSummary = {};
  for (const type of MOOD_TYPES) {
    userSummary[type] = 0;
    aiSummary[type] = 0;
  }
  let userTotal = 0;
  let aiTotal = 0;
  for (const [date, record] of Object.entries(moodData.records)) {
    if (date.startsWith(month)) {
      if (record.user) {
        userSummary[record.user.mood]++;
        userTotal++;
      }
      if (record.ai) {
        aiSummary[record.ai.mood]++;
        aiTotal++;
      }
    }
  }
  return {
    success: true,
    month: month,
    user: { total: userTotal, breakdown: userSummary },
    ai: { total: aiTotal, breakdown: aiSummary },
    mood_labels: MOOD_LABELS
  };
}

module.exports = {
  record_mood, record_period, record_period_detail, record_sick, record_pin, set_anniversary,
  get_calendar_data, get_mood_summary, get_anniversaries,
  update_period_settings,
  delete_mood, delete_period, delete_period_detail, delete_sick, delete_pin, delete_anniversary
};
