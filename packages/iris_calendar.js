/*
METADATA
{
    "name": "iris_calendar",
    "display_name": {
        "zh": "拾月日历工具",
        "en": "Shiyue Calendar Tools"
    },
    "description": "提供心情记录、经期追踪与详情、生病记录、日程管理（含分类）、课程表、纪念日和日历数据查询工具",
    "author": ["Irislan0723"],
    "category": "Utility",
    "tools": [
        {
            "name": "record_mood",
            "description": "记录心情。AI和用户都可以记录，通过role区分。",
            "parameters": [
                { "name": "date", "description": "日期 YYYY-MM-DD", "type": "string", "required": true },
                { "name": "role", "description": "记录者 user 或 ai", "type": "string", "required": true },
                { "name": "mood", "description": "心情：happy(开心), calm(平静), tired(疲惫), sad(难过), anxious(焦虑), angry(生气), miss_you(想你), excited(兴奋)", "type": "string", "required": true },
                { "name": "note", "description": "备注", "type": "string", "required": false }
            ]
        },
        {
            "name": "record_period",
            "description": "标记经期开始或结束。",
            "parameters": [
                { "name": "date", "description": "日期 YYYY-MM-DD", "type": "string", "required": true },
                { "name": "action", "description": "start 或 end", "type": "string", "required": true }
            ]
        },
        {
            "name": "record_period_detail",
            "description": "记录经期当天详情：经血量、颜色、疼痛、症状。",
            "parameters": [
                { "name": "date", "description": "日期 YYYY-MM-DD", "type": "string", "required": true },
                { "name": "flow", "description": "经血量：light(少量), medium(中等), heavy(较多)", "type": "string", "required": false },
                { "name": "color", "description": "颜色：bright_red(鲜红), dark_red(暗红), brown(褐色), pink(粉色)", "type": "string", "required": false },
                { "name": "pain", "description": "疼痛 0(无痛)~4(严重)", "type": "number", "required": false },
                { "name": "symptoms", "description": "症状逗号分隔：cramps(痛经),backache(腰痛),headache(头痛),bloating(腹胀),fatigue(疲劳),mood_swing(情绪波动),breast_pain(胸胀),acne(长痘)", "type": "string", "required": false },
                { "name": "note", "description": "备注", "type": "string", "required": false }
            ]
        },
        {
            "name": "record_sick",
            "description": "记录生病信息，会显示在经期板块。",
            "parameters": [
                { "name": "date", "description": "日期 YYYY-MM-DD", "type": "string", "required": true },
                { "name": "note", "description": "症状描述", "type": "string", "required": true }
            ]
        },
        {
            "name": "record_schedule",
            "description": "添加日程事件，支持分类。",
            "parameters": [
                { "name": "date", "description": "日期 YYYY-MM-DD", "type": "string", "required": true },
                { "name": "title", "description": "日程标题", "type": "string", "required": true },
                { "name": "category", "description": "分类：anniversary(纪念日), exam(考试), party(聚会), date_event(约会), trip(旅行), meeting(会议), birthday(生日), other(其他)", "type": "string", "required": false },
                { "name": "start_time", "description": "开始时间 HH:MM", "type": "string", "required": false },
                { "name": "end_time", "description": "结束时间 HH:MM", "type": "string", "required": false },
                { "name": "location", "description": "地点", "type": "string", "required": false },
                { "name": "note", "description": "备注", "type": "string", "required": false }
            ]
        },
        {
            "name": "set_anniversary",
            "description": "设置纪念日，每年同日显示。",
            "parameters": [
                { "name": "date", "description": "日期 MM-DD 或 YYYY-MM-DD", "type": "string", "required": true },
                { "name": "label", "description": "纪念日名称", "type": "string", "required": true }
            ]
        },
        {
            "name": "record_course",
            "description": "添加课程到课程表。",
            "parameters": [
                { "name": "name", "description": "课程名称", "type": "string", "required": true },
                { "name": "day", "description": "星期几 1(一)~7(日)", "type": "number", "required": true },
                { "name": "start_period", "description": "起始节次", "type": "number", "required": true },
                { "name": "end_period", "description": "结束节次", "type": "number", "required": true },
                { "name": "week_start", "description": "起始周数，默认1", "type": "number", "required": false },
                { "name": "week_end", "description": "结束周数，默认16", "type": "number", "required": false },
                { "name": "week_type", "description": "周类型：all(每周), odd(单周), even(双周)，默认all", "type": "string", "required": false },
                { "name": "location", "description": "教室/地点", "type": "string", "required": false },
                { "name": "teacher", "description": "教师", "type": "string", "required": false }
            ]
        },
        {
            "name": "update_semester_start",
            "description": "设置学期开始日期。",
            "parameters": [
                { "name": "date", "description": "学期开始日期 YYYY-MM-DD", "type": "string", "required": true }
            ]
        },
        {
            "name": "get_calendar_data",
            "description": "获取指定月份的所有日历数据，含课程信息。",
            "parameters": [
                { "name": "month", "description": "月份 YYYY-MM", "type": "string", "required": true }
            ]
        },
        {
            "name": "get_mood_summary",
            "description": "获取月份心情统计。",
            "parameters": [
                { "name": "month", "description": "月份 YYYY-MM", "type": "string", "required": true }
            ]
        },
        {
            "name": "get_schedules",
            "description": "获取月份日程和纪念日。",
            "parameters": [
                { "name": "month", "description": "月份 YYYY-MM", "type": "string", "required": true }
            ]
        },
        {
            "name": "get_courses",
            "description": "获取所有课程和学期信息。",
            "parameters": []
        },
        {
            "name": "update_period_settings",
            "description": "更新周期设置。",
            "parameters": [
                { "name": "cycle_length", "description": "周期天数", "type": "number", "required": false },
                { "name": "period_length", "description": "经期天数", "type": "number", "required": false }
            ]
        },
        {
            "name": "get_anniversaries",
            "description": "获取纪念日列表。",
            "parameters": []
        },
        {
            "name": "delete_mood",
            "description": "删除心情记录。",
            "parameters": [
                { "name": "date", "description": "日期 YYYY-MM-DD", "type": "string", "required": true },
                { "name": "role", "description": "user 或 ai，不指定则全部删除", "type": "string", "required": false }
            ]
        },
        {
            "name": "delete_period",
            "description": "删除经期记录。",
            "parameters": [
                { "name": "date", "description": "日期 YYYY-MM-DD", "type": "string", "required": true }
            ]
        },
        {
            "name": "delete_period_detail",
            "description": "删除经期详情。",
            "parameters": [
                { "name": "date", "description": "日期 YYYY-MM-DD", "type": "string", "required": true }
            ]
        },
        {
            "name": "delete_sick",
            "description": "删除生病记录。",
            "parameters": [
                { "name": "date", "description": "日期 YYYY-MM-DD", "type": "string", "required": true }
            ]
        },
        {
            "name": "delete_schedule",
            "description": "删除日程事件。",
            "parameters": [
                { "name": "date", "description": "日期 YYYY-MM-DD", "type": "string", "required": true },
                { "name": "title", "description": "日程标题", "type": "string", "required": true }
            ]
        },
        {
            "name": "delete_anniversary",
            "description": "删除纪念日。",
            "parameters": [
                { "name": "date", "description": "日期 MM-DD", "type": "string", "required": true }
            ]
        },
        {
            "name": "delete_course",
            "description": "删除课程。",
            "parameters": [
                { "name": "id", "description": "课程ID", "type": "string", "required": true }
            ]
        }
    ]
}
*/
const DATA_DIR = "/storage/emulated/0/Download/Operit/plugins/iris_calendar/data";
const MOOD_FILE = DATA_DIR + "/mood_data.json";
const PERIOD_FILE = DATA_DIR + "/period_data.json";
const SETTINGS_FILE = DATA_DIR + "/settings.json";
const SICK_FILE = DATA_DIR + "/sick_data.json";
const PERIOD_DETAIL_FILE = DATA_DIR + "/period_detail_data.json";
const SCHEDULE_FILE = DATA_DIR + "/schedule_data.json";
const COURSE_FILE = DATA_DIR + "/course_data.json";
const THEME_FILE = DATA_DIR + "/theme_data.json";

const MOOD_TYPES = ["happy", "calm", "tired", "sad", "anxious", "angry", "miss_you", "excited"];
const MOOD_LABELS = {
  happy: "开心", calm: "平静", tired: "疲惫", sad: "难过",
  anxious: "焦虑", angry: "生气", miss_you: "想你", excited: "兴奋"
};

const FLOW_OPTIONS = ["light", "medium", "heavy"];
const FLOW_LABELS = { light: "少量", medium: "中等", heavy: "较多" };
const COLOR_OPTIONS = ["bright_red", "dark_red", "brown", "pink"];
const COLOR_LABELS = { bright_red: "鲜红", dark_red: "暗红", brown: "褐色", pink: "粉色" };
const SYMPTOM_TYPES = ["cramps", "backache", "headache", "bloating", "fatigue", "mood_swing", "breast_pain", "acne"];
const SYMPTOM_LABELS = {
  cramps: "痛经", backache: "腰痛", headache: "头痛", bloating: "腹胀",
  fatigue: "疲劳", mood_swing: "情绪波动", breast_pain: "胸胀", acne: "长痘"
};

const SCHEDULE_CATEGORIES = ["anniversary", "exam", "party", "date_event", "trip", "meeting", "birthday", "other"];
const CATEGORY_LABELS = {
  anniversary: "纪念日", exam: "考试", party: "聚会", date_event: "约会",
  trip: "旅行", meeting: "会议", birthday: "生日", other: "其他"
};

// ========== 通用工具 ==========

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

async function getPeriodDetailData() {
  return (await readJson(PERIOD_DETAIL_FILE)) || { records: {} };
}

async function getScheduleData() {
  return (await readJson(SCHEDULE_FILE)) || { events: {} };
}

async function getCourseData() {
  return (await readJson(COURSE_FILE)) || { semester_start: "", courses: [] };
}

// ========== 心情 ==========

async function record_mood(params) {
  const { date, role, mood, note } = params;
  if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) return { success: false, error: "日期格式无效，请使用YYYY-MM-DD格式" };
  if (!["user", "ai"].includes(role)) return { success: false, error: "角色无效，请使用 user 或 ai" };
  if (!MOOD_TYPES.includes(mood)) return { success: false, error: "心情类型无效，可选：" + MOOD_TYPES.join(", ") };
  const data = await getMoodData();
  if (!data.records[date]) data.records[date] = {};
  data.records[date][role] = { mood: mood, note: note || "", timestamp: Date.now() };
  await writeJson(MOOD_FILE, data);
  var roleLabel = role === "user" ? "用户" : "AI";
  return { success: true, message: "已记录 " + roleLabel + " 在 " + date + " 的心情：" + MOOD_LABELS[mood] + (note ? "，备注：" + note : "") };
}

async function delete_mood(params) {
  const { date, role } = params;
  if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) return { success: false, error: "日期格式无效" };
  const data = await getMoodData();
  if (!data.records[date]) return { success: false, error: "该日期没有心情记录" };
  if (role) {
    if (!["user", "ai"].includes(role)) return { success: false, error: "角色无效" };
    delete data.records[date][role];
    if (!data.records[date].user && !data.records[date].ai) delete data.records[date];
  } else {
    delete data.records[date];
  }
  await writeJson(MOOD_FILE, data);
  return { success: true, message: "已删除 " + date + " 的心情记录" };
}

// ========== 经期 ==========

async function record_period(params) {
  const { date, action } = params;
  if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) return { success: false, error: "日期格式无效" };
  if (!["start", "end"].includes(action)) return { success: false, error: "操作类型无效，请使用 start 或 end" };
  const data = await getPeriodData();
  if (action === "start") {
    var lastPeriod = data.periods[data.periods.length - 1];
    if (lastPeriod && !lastPeriod.end_date) return { success: false, error: "上一次经期尚未标记结束" };
    data.periods.push({ start_date: date, end_date: null });
    await writeJson(PERIOD_FILE, data);
    return { success: true, message: "已标记 " + date + " 为经期开始日" };
  } else {
    var last = data.periods[data.periods.length - 1];
    if (!last || last.end_date) return { success: false, error: "没有未结束的经期记录" };
    last.end_date = date;
    await writeJson(PERIOD_FILE, data);
    var days = Math.round((new Date(date).getTime() - new Date(last.start_date).getTime()) / 86400000) + 1;
    return { success: true, message: "已标记 " + date + " 为经期结束日，本次经期共" + days + "天" };
  }
}

async function delete_period(params) {
  const { date } = params;
  if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) return { success: false, error: "日期格式无效" };
  const data = await getPeriodData();
  var found = false;
  for (var i = data.periods.length - 1; i >= 0; i--) {
    var p = data.periods[i];
    var endDate = p.end_date || "9999-12-31";
    if (date >= p.start_date && date <= endDate) { data.periods.splice(i, 1); found = true; break; }
  }
  if (!found) return { success: false, error: "该日期没有经期记录" };
  await writeJson(PERIOD_FILE, data);
  return { success: true, message: "已删除包含 " + date + " 的经期记录" };
}

async function update_period_settings(params) {
  const { cycle_length, period_length } = params;
  const settings = await getSettings();
  if (cycle_length !== undefined) {
    var cl = parseInt(cycle_length);
    if (isNaN(cl) || cl < 1) return { success: false, error: "请输入有效的周期时长" };
    settings.cycle_length = cl;
  }
  if (period_length !== undefined) {
    var pl = parseInt(period_length);
    if (isNaN(pl) || pl < 1) return { success: false, error: "请输入有效的经期时长" };
    settings.period_length = pl;
  }
  await writeJson(SETTINGS_FILE, settings);
  var periodData = await getPeriodData();
  periodData.settings = { cycle_length: settings.cycle_length, period_length: settings.period_length };
  await writeJson(PERIOD_FILE, periodData);
  return { success: true, message: "已更新设置：周期" + settings.cycle_length + "天，经期" + settings.period_length + "天", settings: settings };
}

// ========== 经期详情 ==========

async function record_period_detail(params) {
  const { date, flow, color, pain, symptoms, note } = params;
  if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) return { success: false, error: "日期格式无效" };
  if (flow && !FLOW_OPTIONS.includes(flow)) return { success: false, error: "经血量取值无效" };
  if (color && !COLOR_OPTIONS.includes(color)) return { success: false, error: "颜色取值无效" };
  var painVal = null;
  if (pain !== undefined && pain !== null) {
    painVal = parseInt(pain);
    if (isNaN(painVal) || painVal < 0 || painVal > 4) return { success: false, error: "疼痛等级无效(0-4)" };
  }
  var symptomList = [];
  if (symptoms) {
    symptomList = symptoms.split(",").map(function(s) { return s.trim(); }).filter(function(s) { return SYMPTOM_TYPES.indexOf(s) >= 0; });
  }
  const data = await getPeriodDetailData();
  data.records[date] = { flow: flow || null, color: color || null, pain: painVal, symptoms: symptomList, note: note || "", timestamp: Date.now() };
  await writeJson(PERIOD_DETAIL_FILE, data);
  var parts = [];
  if (flow) parts.push("经血量" + FLOW_LABELS[flow]);
  if (color) parts.push("颜色" + COLOR_LABELS[color]);
  if (painVal !== null) parts.push("疼痛" + painVal + "级");
  if (symptomList.length > 0) parts.push("症状：" + symptomList.map(function(s) { return SYMPTOM_LABELS[s] || s; }).join("、"));
  if (note) parts.push("备注：" + note);
  return { success: true, message: "已记录 " + date + " 的经期详情" + (parts.length > 0 ? "：" + parts.join("，") : "") };
}

async function delete_period_detail(params) {
  const { date } = params;
  if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) return { success: false, error: "日期格式无效" };
  const data = await getPeriodDetailData();
  if (!data.records[date]) return { success: false, error: "该日期没有经期详情" };
  delete data.records[date];
  await writeJson(PERIOD_DETAIL_FILE, data);
  return { success: true, message: "已删除 " + date + " 的经期详情" };
}

// ========== 生病记录 ==========

async function record_sick(params) {
  const { date, note } = params;
  if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) return { success: false, error: "日期格式无效" };
  if (!note || !note.trim()) return { success: false, error: "请填写症状描述" };
  const data = await getSickData();
  data.records[date] = { note: note.trim(), timestamp: Date.now() };
  await writeJson(SICK_FILE, data);
  return { success: true, message: "已记录 " + date + " 的生病信息：" + note.trim() };
}

async function delete_sick(params) {
  const { date } = params;
  if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) return { success: false, error: "日期格式无效" };
  const data = await getSickData();
  if (!data.records[date]) return { success: false, error: "该日期没有生病记录" };
  delete data.records[date];
  await writeJson(SICK_FILE, data);
  return { success: true, message: "已删除 " + date + " 的生病记录" };
}

// ========== 日程 ==========

async function record_schedule(params) {
  const { date, title, category, start_time, end_time, location, note } = params;
  if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) return { success: false, error: "日期格式无效" };
  if (!title || !title.trim()) return { success: false, error: "请填写日程标题" };
  var cat = category || "other";
  if (SCHEDULE_CATEGORIES.indexOf(cat) < 0) cat = "other";
  const data = await getScheduleData();
  if (!data.events[date]) data.events[date] = [];
  data.events[date].push({
    id: String(Date.now()), title: title.trim(), category: cat,
    start_time: start_time || "", end_time: end_time || "",
    location: location || "", note: note || "", timestamp: Date.now()
  });
  await writeJson(SCHEDULE_FILE, data);
  var msg = "已添加 " + date + " 的日程：" + title.trim() + "（" + CATEGORY_LABELS[cat] + "）";
  if (start_time) msg += " " + start_time + (end_time ? "-" + end_time : "");
  return { success: true, message: msg };
}

async function delete_schedule(params) {
  const { date, title } = params;
  if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) return { success: false, error: "日期格式无效" };
  if (!title || !title.trim()) return { success: false, error: "请提供日程标题" };
  const data = await getScheduleData();
  if (!data.events[date] || data.events[date].length === 0) return { success: false, error: "该日期没有日程" };
  var idx = -1;
  for (var i = 0; i < data.events[date].length; i++) {
    if (data.events[date][i].title === title.trim()) { idx = i; break; }
  }
  if (idx < 0) return { success: false, error: "未找到该日程" };
  data.events[date].splice(idx, 1);
  if (data.events[date].length === 0) delete data.events[date];
  await writeJson(SCHEDULE_FILE, data);
  return { success: true, message: "已删除 " + date + " 的日程：" + title.trim() };
}

async function get_schedules(params) {
  const { month } = params;
  if (!month || !month.match(/^\d{4}-\d{2}$/)) return { success: false, error: "月份格式无效" };
  const data = await getScheduleData();
  var monthEvents = {};
  for (const [date, events] of Object.entries(data.events)) {
    if (date.startsWith(month)) monthEvents[date] = events;
  }
  const settings = await getSettings();
  return { success: true, month: month, events: monthEvents, anniversaries: settings.anniversaries || [], category_labels: CATEGORY_LABELS };
}

// ========== 课程 ==========

async function record_course(params) {
  const { name, day, start_period, end_period, week_start, week_end, week_type, location, teacher } = params;
  if (!name || !name.trim()) return { success: false, error: "请填写课程名称" };
  var d = parseInt(day);
  if (isNaN(d) || d < 1 || d > 7) return { success: false, error: "星期无效(1-7)" };
  var sp = parseInt(start_period);
  var ep = parseInt(end_period);
  if (isNaN(sp) || isNaN(ep) || sp < 1 || ep < sp) return { success: false, error: "节次无效" };
  var ws = week_start !== undefined ? parseInt(week_start) : 1;
  var we = week_end !== undefined ? parseInt(week_end) : 16;
  if (isNaN(ws) || isNaN(we) || ws < 1 || we < ws) return { success: false, error: "周数无效" };
  var wt = week_type || "all";
  if (["all", "odd", "even"].indexOf(wt) < 0) wt = "all";

  const data = await getCourseData();
  var course = {
    id: String(Date.now()), name: name.trim(), day: d,
    start_period: sp, end_period: ep,
    week_start: ws, week_end: we, week_type: wt,
    location: location || "", teacher: teacher || ""
  };
  data.courses.push(course);
  await writeJson(COURSE_FILE, data);
  var dayLabels = ["", "一", "二", "三", "四", "五", "六", "日"];
  var wtLabels = { all: "每周", odd: "单周", even: "双周" };
  return {
    success: true,
    message: "已添加课程：" + name.trim() + "（星期" + dayLabels[d] + " 第" + sp + "-" + ep + "节 " + wtLabels[wt] + " 第" + ws + "-" + we + "周）",
    course: course
  };
}

async function delete_course(params) {
  const { id } = params;
  if (!id) return { success: false, error: "请提供课程ID" };
  const data = await getCourseData();
  var idx = -1;
  for (var i = 0; i < data.courses.length; i++) {
    if (data.courses[i].id === id) { idx = i; break; }
  }
  if (idx < 0) return { success: false, error: "未找到该课程" };
  var removed = data.courses.splice(idx, 1)[0];
  await writeJson(COURSE_FILE, data);
  return { success: true, message: "已删除课程：" + removed.name };
}

async function get_courses() {
  const data = await getCourseData();
  return { success: true, semester_start: data.semester_start, courses: data.courses, total: data.courses.length };
}

async function update_semester_start(params) {
  const { date } = params;
  if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) return { success: false, error: "日期格式无效" };
  const data = await getCourseData();
  data.semester_start = date;
  await writeJson(COURSE_FILE, data);
  return { success: true, message: "已设置学期开始日期：" + date };
}

// ========== 纪念日 ==========

async function set_anniversary(params) {
  const { date, label } = params;
  if (!label || !label.trim()) return { success: false, error: "请填写纪念日名称" };
  var mmdd = date;
  if (date && date.match(/^\d{4}-\d{2}-\d{2}$/)) mmdd = date.substring(5);
  if (!mmdd || !mmdd.match(/^\d{2}-\d{2}$/)) return { success: false, error: "日期格式无效" };
  const settings = await getSettings();
  if (!settings.anniversaries) settings.anniversaries = [];
  var existing = settings.anniversaries.findIndex(function(a) { return a.date === mmdd; });
  if (existing >= 0) {
    settings.anniversaries[existing] = { date: mmdd, label: label.trim(), origin: date };
  } else {
    settings.anniversaries.push({ date: mmdd, label: label.trim(), origin: date });
  }
  await writeJson(SETTINGS_FILE, settings);
  return { success: true, message: "已设置纪念日：每年 " + mmdd + " — " + label.trim() };
}

async function delete_anniversary(params) {
  const { date } = params;
  var mmdd = date;
  if (date && date.match(/^\d{4}-\d{2}-\d{2}$/)) mmdd = date.substring(5);
  if (!mmdd || !mmdd.match(/^\d{2}-\d{2}$/)) return { success: false, error: "日期格式无效" };
  const settings = await getSettings();
  if (!settings.anniversaries) settings.anniversaries = [];
  var idx = settings.anniversaries.findIndex(function(a) { return a.date === mmdd; });
  if (idx < 0) return { success: false, error: "该日期没有纪念日" };
  var removed = settings.anniversaries.splice(idx, 1)[0];
  await writeJson(SETTINGS_FILE, settings);
  return { success: true, message: "已删除纪念日：" + removed.label };
}

async function get_anniversaries() {
  const settings = await getSettings();
  var list = settings.anniversaries || [];
  if (list.length === 0) return { success: true, message: "还没有设置纪念日", anniversaries: [] };
  return { success: true, anniversaries: list };
}

// ========== 日历数据查询 ==========

async function get_calendar_data(params) {
  const { month } = params;
  if (!month || !month.match(/^\d{4}-\d{2}$/)) return { success: false, error: "月份格式无效" };
  const moodData = await getMoodData();
  const periodData = await getPeriodData();
  const settings = await getSettings();
  const sickData = await getSickData();
  const periodDetailData = await getPeriodDetailData();
  const scheduleData = await getScheduleData();
  const courseData = await getCourseData();

  var monthMoods = {};
  for (const [date, record] of Object.entries(moodData.records)) {
    if (date.startsWith(month)) monthMoods[date] = record;
  }
  var monthSick = {};
  for (const [date, record] of Object.entries(sickData.records)) {
    if (date.startsWith(month)) monthSick[date] = record;
  }
  var monthPeriodDetails = {};
  for (const [date, record] of Object.entries(periodDetailData.records)) {
    if (date.startsWith(month)) monthPeriodDetails[date] = record;
  }
  var monthSchedules = {};
  for (const [date, events] of Object.entries(scheduleData.events)) {
    if (date.startsWith(month)) monthSchedules[date] = events;
  }

  var parts = month.split("-").map(Number);
  var year = parts[0], mon = parts[1];
  var firstDay = new Date(year, mon - 1, 1);
  var lastDay = new Date(year, mon, 0);
  var periodDates = [];
  var predictedPeriodDates = [];
  var ovulationDates = [];

  for (var pi = 0; pi < periodData.periods.length; pi++) {
    var period = periodData.periods[pi];
    var start = new Date(period.start_date);
    var end = period.end_date ? new Date(period.end_date) : new Date(start.getTime() + (settings.period_length - 1) * 86400000);
    for (var d = new Date(start); d <= end && d <= lastDay; d.setDate(d.getDate() + 1)) {
      if (d >= firstDay) periodDates.push(d.toISOString().split("T")[0]);
    }
  }

  var refPeriod = null;
  for (var j = periodData.periods.length - 1; j >= 0; j--) {
    refPeriod = periodData.periods[j];
    break;
  }
  if (refPeriod) {
    var ls = new Date(refPeriod.start_date);
    var cycleLen = settings.cycle_length;
    var periodLen = settings.period_length;
    for (var i = 1; i <= 6; i++) {
      var ps = new Date(ls.getTime() + cycleLen * i * 86400000);
      var pe = new Date(ps.getTime() + (periodLen - 1) * 86400000);
      var ov = new Date(ps.getTime() + (cycleLen - 14) * 86400000);
      for (var dd = new Date(ps); dd <= pe && dd <= lastDay; dd.setDate(dd.getDate() + 1)) {
        if (dd >= firstDay) {
          var ds = dd.toISOString().split("T")[0];
          if (periodDates.indexOf(ds) < 0) predictedPeriodDates.push(ds);
        }
      }
      if (ov >= firstDay && ov <= lastDay) ovulationDates.push(ov.toISOString().split("T")[0]);
    }
  }

  var anniversaryDates = [];
  var anniversaries = settings.anniversaries || [];
  var monthMM = month.split("-")[1];
  for (var ai = 0; ai < anniversaries.length; ai++) {
    if (anniversaries[ai].date.split("-")[0] === monthMM) {
      anniversaryDates.push({ date: month + "-" + anniversaries[ai].date.split("-")[1], label: anniversaries[ai].label });
    }
  }

  return {
    success: true, month: month,
    moods: monthMoods, sick_records: monthSick,
    period_details: monthPeriodDetails, schedules: monthSchedules,
    period_dates: periodDates, predicted_period_dates: predictedPeriodDates,
    ovulation_dates: ovulationDates, anniversaries: anniversaryDates,
    settings: settings, category_labels: CATEGORY_LABELS,
    courses: courseData.courses, semester_start: courseData.semester_start
  };
}

async function get_mood_summary(params) {
  const { month } = params;
  if (!month || !month.match(/^\d{4}-\d{2}$/)) return { success: false, error: "月份格式无效" };
  const moodData = await getMoodData();
  var userSummary = {}, aiSummary = {};
  for (var ti = 0; ti < MOOD_TYPES.length; ti++) { userSummary[MOOD_TYPES[ti]] = 0; aiSummary[MOOD_TYPES[ti]] = 0; }
  var userTotal = 0, aiTotal = 0;
  for (const [date, record] of Object.entries(moodData.records)) {
    if (date.startsWith(month)) {
      if (record.user) { userSummary[record.user.mood]++; userTotal++; }
      if (record.ai) { aiSummary[record.ai.mood]++; aiTotal++; }
    }
  }
  return {
    success: true, month: month,
    user: { total: userTotal, breakdown: userSummary },
    ai: { total: aiTotal, breakdown: aiSummary },
    mood_labels: MOOD_LABELS
  };
}

module.exports = {
  record_mood, record_period, record_period_detail, record_sick,
  record_schedule, set_anniversary,
  record_course, update_semester_start,
  get_calendar_data, get_mood_summary, get_anniversaries, get_schedules, get_courses,
  update_period_settings,
  delete_mood, delete_period, delete_period_detail, delete_sick,
  delete_schedule, delete_anniversary, delete_course
};
