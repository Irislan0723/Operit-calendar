/// <reference path="../../../../types/index.d.ts" />

// ========== 数据路径 ==========
var DATA_DIR = "/storage/emulated/0/Download/Operit/plugins/iris_calendar/data";
var MOOD_FILE = DATA_DIR + "/mood_data.json";
var PERIOD_FILE = DATA_DIR + "/period_data.json";
var SETTINGS_FILE = DATA_DIR + "/settings.json";
var SICK_FILE = DATA_DIR + "/sick_data.json";
var PERIOD_DETAIL_FILE = DATA_DIR + "/period_detail_data.json";
var SCHEDULE_FILE = DATA_DIR + "/schedule_data.json";
var COURSE_FILE = DATA_DIR + "/course_data.json";
var THEME_FILE = DATA_DIR + "/theme_data.json";

// ========== 心情定义（8种）==========
var MOOD_TYPES = ["happy", "calm", "tired", "sad", "anxious", "angry", "miss_you", "excited"];
var MOOD_LABELS = {
  happy: "开心", calm: "平静", tired: "疲惫", sad: "难过",
  anxious: "焦虑", angry: "生气", miss_you: "想你", excited: "兴奋"
};
var MOOD_COLORS = {
  happy: "#FFD700", calm: "#87CEEB", tired: "#A0A0A0", sad: "#6495ED",
  anxious: "#FFA500", angry: "#FF4444", miss_you: "#FF69B4", excited: "#FF6347"
};

// ========== 心情图标 URL ==========
var BASE_URL = "https://ndkdgiohgnelvkxgdkjk.supabase.co/storage/v1/object/public/xinqing";
var MOOD_ICONS_USER = {
  happy: BASE_URL + "/happy_circle.png", calm: BASE_URL + "/calm_circle.png",
  tired: BASE_URL + "/tired_circle.png", sad: BASE_URL + "/sad_circle.png",
  anxious: BASE_URL + "/anxious_circle.png", angry: BASE_URL + "/angry_circle.png",
  miss_you: BASE_URL + "/miss_you_circle.png", excited: BASE_URL + "/excited_circle.png"
};
var MOOD_ICONS_AI = {
  happy: BASE_URL + "/happy_square.png", calm: BASE_URL + "/calm_square.png",
  tired: BASE_URL + "/tired_square.png", sad: BASE_URL + "/sad_square.png",
  anxious: BASE_URL + "/anxious_square.png", angry: BASE_URL + "/angry_square.png",
  miss_you: BASE_URL + "/miss_you_square.png", excited: BASE_URL + "/excited_square.png"
};

// ========== 经期详情定义 ==========
var FLOW_LABELS = { light: "少量", medium: "中等", heavy: "较多" };
var FLOW_COLORS = { light: "#FFB74D", medium: "#FF9800", heavy: "#E65100" };
var COLOR_LABELS = { bright_red: "鲜红", dark_red: "暗红", brown: "褐色", pink: "粉色" };
var COLOR_HEX = { bright_red: "#FF1744", dark_red: "#B71C1C", brown: "#795548", pink: "#F48FB1" };
var PAIN_LABELS = ["无痛", "轻微", "中等", "较重", "严重"];
var SYMPTOM_TYPES = ["cramps", "backache", "headache", "bloating", "fatigue", "mood_swing", "breast_pain", "acne"];
var SYMPTOM_LABELS = {
  cramps: "痛经", backache: "腰痛", headache: "头痛", bloating: "腹胀",
  fatigue: "疲劳", mood_swing: "情绪波动", breast_pain: "胸胀", acne: "长痘"
};

// ========== 日程分类 ==========
var SCHEDULE_CATEGORIES = ["anniversary", "exam", "party", "date_event", "trip", "meeting", "birthday", "other"];
var CATEGORY_LABELS = {
  anniversary: "纪念日", exam: "考试", party: "聚会", date_event: "约会",
  trip: "旅行", meeting: "会议", birthday: "生日", other: "其他"
};
var CATEGORY_COLORS = {
  anniversary: "#E91E63", exam: "#FF9800", party: "#9C27B0", date_event: "#FF4081",
  trip: "#4CAF50", meeting: "#2196F3", birthday: "#FF5722", other: "#607D8B"
};

// ========== 经期阶段色（莫兰迪，不随主题变化）==========
var PH = {
  men: "#D4A0A0", menBg: "#F2DCDC",
  fol: "#7BA8CC", folBg: "#DCE8F0",
  ovu: "#8BBF90", ovuBg: "#DCF0DE",
  lut: "#C8B080", lutBg: "#F0E8D8"
};

// ========== 主题 ==========
var THEMES = {
  mint_choco: { name: "薄荷生巧", bg: "#EBF6F7", pri: "#705854", sec: "#A49E99", acc: "#C1E6E4", priL: "#EDE5E3" },
  blue_ice:   { name: "雾蓝冰美式", bg: "#F0F0E9", pri: "#2D3E59", sec: "#869BC0", acc: "#C7D9F3", priL: "#E0E5EE" }
};

// ========== 取色器调色板 ==========
var COLOR_PALETTE = [
  "#FFFFFF", "#F5F5F5", "#E0E0E0", "#9E9E9E", "#616161", "#000000",
  "#FFCDD2", "#EF5350", "#C62828", "#F48FB1", "#E91E63", "#880E4F",
  "#CE93D8", "#9C27B0", "#4A148C", "#90CAF9", "#2196F3", "#0D47A1",
  "#80DEEA", "#00BCD4", "#006064", "#A5D6A7", "#4CAF50", "#1B5E20",
  "#FFF59D", "#FFEB3B", "#F9A825", "#FFCC80", "#FF9800", "#E65100",
  "#BCAAA4", "#795548", "#4E342E", "#C1E6E4", "#C7D9F3", "#EBF6F7"
];

// ========== 异步数据读写 ==========
async function readJsonAsync(path) {
  try {
    var r = await Tools.Files.exists(path);
    if (!r || !r.exists) return null;
    var f = await Tools.Files.read(path);
    if (!f || !f.content) return null;
    return JSON.parse(String(f.content));
  } catch (e) { return null; }
}
async function writeJsonAsync(path, data) {
  await Tools.Files.mkdir(DATA_DIR, true);
  await Tools.Files.write(path, JSON.stringify(data, null, 2));
}

// ========== 日历计算 ==========
function getDaysInMonth(y, m) { return new Date(y, m, 0).getDate(); }
function getFirstDayOfWeek(y, m) {
  var d = new Date(y, m - 1, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

// ==================== Screen ====================
function Screen(ctx) {
  var UI = ctx.UI;
  var Modifier = ctx.Modifier;
  var now = new Date();
  var TY = now.getFullYear(), TM = now.getMonth() + 1, TD = now.getDate();

  // ======= State =======
  var yearState = ctx.useState("y", TY), year = yearState[0], setYear = yearState[1];
  var monthState = ctx.useState("m", TM), month = monthState[0], setMonth = monthState[1];
  var tabState = ctx.useState("tab", 0), tab = tabState[0], setTab = tabState[1];
  var selDayState = ctx.useState("sd", 0), selDay = selDayState[0], setSelDay = selDayState[1];
  var popupState = ctx.useState("pop", ""), popup = popupState[0], setPopup = popupState[1];
  var recMoodState = ctx.useState("rm", ""), recMood = recMoodState[0], setRecMood = recMoodState[1];
  var recNoteState = ctx.useState("rn", ""), recNote = recNoteState[0], setRecNote = recNoteState[1];
  var pYearState = ctx.useState("py", TY), pYear = pYearState[0], setPYear = pYearState[1];
  var sCycleState = ctx.useState("sc", 28), sCycle = sCycleState[0], setSCycle = sCycleState[1];
  var sPeriodState = ctx.useState("sp", 5), sPeriod = sPeriodState[0], setSPeriod = sPeriodState[1];

  // Data state
  var moodsState = ctx.useState("moods", { records: {} }), moods = moodsState[0], setMoods = moodsState[1];
  var periodsState = ctx.useState("periods", { periods: [], settings: { cycle_length: 28, period_length: 5 } });
  var periods = periodsState[0], setPeriods = periodsState[1];
  var settState = ctx.useState("sett", { cycle_length: 28, period_length: 5, anniversaries: [] });
  var sett = settState[0], setSett = settState[1];
  var sickState = ctx.useState("sick", { records: {} }), sickData = sickState[0], setSickData = sickState[1];
  var pdtState = ctx.useState("pdt", { records: {} }), pdtData = pdtState[0], setPdtData = pdtState[1];
  var schedState = ctx.useState("sched", { events: {} }), schedData = schedState[0], setSchedData = schedState[1];
  var courseState = ctx.useState("crs", { semester_start: "", courses: [] }), courseData = courseState[0], setCourseData = courseState[1];
  var dataLoadedState = ctx.useState("dl", false), dataLoaded = dataLoadedState[0], setDataLoaded = dataLoadedState[1];

  // Theme state
  var themeIdState = ctx.useState("thm", "mint_choco"), themeId = themeIdState[0], setThemeId = themeIdState[1];
  var customThState = ctx.useState("cthm", []), customThemes = customThState[0], setCustomThemes = customThState[1];

  // Sick form
  var sickNoteState = ctx.useState("skn", ""), sickNote = sickNoteState[0], setSickNote = sickNoteState[1];

  // Period detail form
  var pdFlowState = ctx.useState("pdf", ""), pdFlow = pdFlowState[0], setPdFlow = pdFlowState[1];
  var pdColorState = ctx.useState("pdc", ""), pdColor = pdColorState[0], setPdColor = pdColorState[1];
  var pdPainState = ctx.useState("pdp", -1), pdPain = pdPainState[0], setPdPain = pdPainState[1];
  var pdSympState = ctx.useState("pds", ""), pdSymp = pdSympState[0], setPdSymp = pdSympState[1];
  var pdNoteState = ctx.useState("pdn", ""), pdNoteVal = pdNoteState[0], setPdNoteVal = pdNoteState[1];

  // Schedule form
  var schTitleState = ctx.useState("sct", ""), schTitle = schTitleState[0], setSchTitle = schTitleState[1];
  var schCatState = ctx.useState("sccat", "other"), schCat = schCatState[0], setSchCat = schCatState[1];
  var schStState = ctx.useState("scst", ""), schSt = schStState[0], setSchSt = schStState[1];
  var schEtState = ctx.useState("scet", ""), schEt = schEtState[0], setSchEt = schEtState[1];
  var schLocState = ctx.useState("scl", ""), schLoc = schLocState[0], setSchLoc = schLocState[1];
  var schNoteState = ctx.useState("scn", ""), schNote = schNoteState[0], setSchNote = schNoteState[1];

  // Course form
  var crNameState = ctx.useState("crn", ""), crName = crNameState[0], setCrName = crNameState[1];
  var crDayState = ctx.useState("crd", 1), crDay = crDayState[0], setCrDay = crDayState[1];
  var crSpState = ctx.useState("crsp", ""), crSp = crSpState[0], setCrSp = crSpState[1];
  var crEpState = ctx.useState("crep", ""), crEp = crEpState[0], setCrEp = crEpState[1];
  var crWsState = ctx.useState("crws", "1"), crWs = crWsState[0], setCrWs = crWsState[1];
  var crWeState = ctx.useState("crwe", "16"), crWe = crWeState[0], setCrWe = crWeState[1];
  var crWtState = ctx.useState("crwt", "all"), crWt = crWtState[0], setCrWt = crWtState[1];
  var crLocState = ctx.useState("crloc", ""), crLoc = crLocState[0], setCrLoc = crLocState[1];
  var crTchState = ctx.useState("crtch", ""), crTch = crTchState[0], setCrTch = crTchState[1];
  var semStartState = ctx.useState("sems", ""), semStart = semStartState[0], setSemStart = semStartState[1];

  // Custom theme form
  var ctNameState = ctx.useState("ctn", ""), ctName = ctNameState[0], setCtName = ctNameState[1];
  var ctBgState = ctx.useState("ctb", "#EBF6F7"), ctBg = ctBgState[0], setCtBg = ctBgState[1];
  var ctPriState = ctx.useState("ctp", "#705854"), ctPri = ctPriState[0], setCtPri = ctPriState[1];
  var ctSecState = ctx.useState("cts", "#A49E99"), ctSec = ctSecState[0], setCtSec = ctSecState[1];
  var ctAccState = ctx.useState("cta", "#C1E6E4"), ctAcc = ctAccState[0], setCtAcc = ctAccState[1];

  // Color picker target
  var cpTargetState = ctx.useState("cpt", ""), cpTarget = cpTargetState[0], setCpTarget = cpTargetState[1];

  // ======= Theme colors =======
  var themeData = THEMES[themeId];
  if (!themeData) {
    for (var ti = 0; ti < customThemes.length; ti++) {
      if (customThemes[ti].id === themeId) { themeData = customThemes[ti]; break; }
    }
  }
  if (!themeData) themeData = THEMES.mint_choco;

  var C = {
    bg: themeData.bg, card: "#FFFFFF", pri: themeData.pri,
    priL: themeData.priL || themeData.acc, sec: themeData.sec, acc: themeData.acc,
    txt: "#3C3C3C", light: "#CCCCCC", white: "#FFFFFF",
    brd: "#EEEBE8", dim: "#EEEBE8", overlay: "#66000000"
  };

  // ======= Calendar math =======
  var dim = getDaysInMonth(year, month);
  var off = getFirstDayOfWeek(year, month);
  var ms = year + "-" + String(month).padStart(2, "0");

  // ======= 经期阶段（区分实际/预测）=======
  function getPhase(dateStr) {
    if (!periods.periods || periods.periods.length === 0) return null;
    // 先检查实际经期
    for (var idx = 0; idx < periods.periods.length; idx++) {
      var p = periods.periods[idx];
      var endStr = p.end_date;
      if (!endStr) {
        var st = new Date(p.start_date);
        endStr = new Date(st.getTime() + (sett.period_length - 1) * 86400000).toISOString().split("T")[0];
      }
      if (dateStr >= p.start_date && dateStr <= endStr) {
        return { phase: "menstrual", label: "经期", color: PH.men, bg: PH.menBg, predicted: false };
      }
    }
    // 根据最近实际经期计算周期阶段
    var lastP = null;
    for (var j = periods.periods.length - 1; j >= 0; j--) {
      if (periods.periods[j].start_date <= dateStr) { lastP = periods.periods[j]; break; }
    }
    if (!lastP) return null;
    var lastMs = new Date(lastP.start_date).getTime();
    var dateMs = new Date(dateStr).getTime();
    var daySince = Math.floor((dateMs - lastMs) / 86400000);
    var cycDay = ((daySince % sett.cycle_length) + sett.cycle_length) % sett.cycle_length;
    if (cycDay < sett.period_length) return { phase: "menstrual", label: "预测经期", color: PH.men, bg: PH.menBg, predicted: true };
    if (cycDay < sett.cycle_length - 14) return { phase: "follicular", label: "卵泡期", color: PH.fol, bg: PH.folBg, predicted: true };
    if (cycDay < sett.cycle_length - 14 + 3) return { phase: "ovulation", label: "排卵期", color: PH.ovu, bg: PH.ovuBg, predicted: true };
    return { phase: "luteal", label: "黄体期", color: PH.lut, bg: PH.lutBg, predicted: true };
  }

  // ======= 纪念日检查 =======
  function getAnnForDay(day) {
    if (!sett.anniversaries || sett.anniversaries.length === 0) return null;
    var mmdd = String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");
    for (var i = 0; i < sett.anniversaries.length; i++) {
      if (sett.anniversaries[i].date === mmdd) return sett.anniversaries[i];
    }
    return null;
  }

  // ======= 当天课程检查 =======
  function getCoursesForDate(dateStr) {
    if (!courseData.semester_start || courseData.courses.length === 0) return [];
    var semMs = new Date(courseData.semester_start).getTime();
    var dateMs = new Date(dateStr).getTime();
    if (dateMs < semMs) return [];
    var daysSince = Math.floor((dateMs - semMs) / 86400000);
    var weekNum = Math.floor(daysSince / 7) + 1;
    var dateObj = new Date(dateStr);
    var dow = dateObj.getDay();
    dow = dow === 0 ? 7 : dow;
    var result = [];
    for (var i = 0; i < courseData.courses.length; i++) {
      var cr = courseData.courses[i];
      if (cr.day !== dow) continue;
      if (weekNum < cr.week_start || weekNum > cr.week_end) continue;
      if (cr.week_type === "odd" && weekNum % 2 === 0) continue;
      if (cr.week_type === "even" && weekNum % 2 === 1) continue;
      result.push(cr);
    }
    result.sort(function(a, b) { return a.start_period - b.start_period; });
    return result;
  }

  // ======= 数据加载 =======
  async function loadAllData() {
    try { var m = await readJsonAsync(MOOD_FILE); if (m) setMoods(m); } catch (e) {}
    try { var p = await readJsonAsync(PERIOD_FILE); if (p) setPeriods(p); } catch (e) {}
    try { var s = await readJsonAsync(SETTINGS_FILE); if (s) setSett(s); } catch (e) {}
    try { var sk = await readJsonAsync(SICK_FILE); if (sk) setSickData(sk); } catch (e) {}
    try { var pd = await readJsonAsync(PERIOD_DETAIL_FILE); if (pd) setPdtData(pd); } catch (e) {}
    try { var sc = await readJsonAsync(SCHEDULE_FILE); if (sc) setSchedData(sc); } catch (e) {}
    try { var cr = await readJsonAsync(COURSE_FILE); if (cr) { setCourseData(cr); if (cr.semester_start) setSemStart(cr.semester_start); } } catch (e) {}
    try {
      var th = await readJsonAsync(THEME_FILE);
      if (th) {
        if (th.current) setThemeId(th.current);
        if (th.custom) setCustomThemes(th.custom);
      }
    } catch (e) {}
    setDataLoaded(true);
  }

  // ======= 基础操作 =======
  function close() {
    setPopup(""); setRecMood(""); setRecNote(""); setSickNote("");
    setPdFlow(""); setPdColor(""); setPdPain(-1); setPdSymp(""); setPdNoteVal("");
    setSchTitle(""); setSchCat("other"); setSchSt(""); setSchEt(""); setSchLoc(""); setSchNote("");
    setCrName(""); setCrDay(1); setCrSp(""); setCrEp(""); setCrWs("1"); setCrWe("16"); setCrWt("all"); setCrLoc(""); setCrTch("");
    setCpTarget("");
  }
  function prev() {
    if (month === 1) { setYear(year - 1); setMonth(12); } else setMonth(month - 1);
    close();
  }
  function next() {
    if (month === 12) { setYear(year + 1); setMonth(1); } else setMonth(month + 1);
    close();
  }
  function goToday() { setYear(TY); setMonth(TM); close(); }
  function tapDay(d) { setSelDay(d); setPopup("detail"); }
  function jumpTo(y, m) { setYear(y); setMonth(m); close(); }

  // ======= 心情操作 =======
  async function saveMood(mood) {
    if (!selDay) return;
    var ds = ms + "-" + String(selDay).padStart(2, "0");
    var d = JSON.parse(JSON.stringify(moods));
    if (!d.records) d.records = {};
    if (!d.records[ds]) d.records[ds] = {};
    d.records[ds].user = { mood: mood, note: recNote || "", timestamp: Date.now() };
    try { await writeJsonAsync(MOOD_FILE, d); setMoods(d); ctx.showToast("已保存"); } catch (e) { ctx.showToast("保存失败"); }
    close();
  }
  async function deleteMoodAsync() {
    if (!selDay) return;
    var ds = ms + "-" + String(selDay).padStart(2, "0");
    var d = JSON.parse(JSON.stringify(moods));
    if (!d.records || !d.records[ds]) { ctx.showToast("没有心情记录"); return; }
    delete d.records[ds];
    try { await writeJsonAsync(MOOD_FILE, d); setMoods(d); ctx.showToast("已删除"); } catch (e) { ctx.showToast("删除失败"); }
    close();
  }

  // ======= 经期操作 =======
  async function savePeriodMark(action) {
    if (!selDay) return;
    var ds = ms + "-" + String(selDay).padStart(2, "0");
    var d = JSON.parse(JSON.stringify(periods));
    if (!d.periods) d.periods = [];
    if (action === "start") {
      var last = d.periods.length > 0 ? d.periods[d.periods.length - 1] : null;
      if (last && !last.end_date) { ctx.showToast("请先标记上次结束"); return; }
      d.periods.push({ start_date: ds, end_date: null });
    } else {
      var last2 = d.periods.length > 0 ? d.periods[d.periods.length - 1] : null;
      if (!last2 || last2.end_date) { ctx.showToast("请先标记开始"); return; }
      last2.end_date = ds;
    }
    try {
      await writeJsonAsync(PERIOD_FILE, d); setPeriods(d);
      ctx.showToast(action === "start" ? "已标记开始" : "已标记结束");
    } catch (e) { ctx.showToast("保存失败"); }
    close();
  }
  async function deletePeriodAsync() {
    if (!selDay) return;
    var ds = ms + "-" + String(selDay).padStart(2, "0");
    var d = JSON.parse(JSON.stringify(periods));
    var found = false;
    for (var i = d.periods.length - 1; i >= 0; i--) {
      var p = d.periods[i];
      if (ds >= p.start_date && ds <= (p.end_date || "9999-12-31")) { d.periods.splice(i, 1); found = true; break; }
    }
    if (!found) { ctx.showToast("没有经期记录"); return; }
    try { await writeJsonAsync(PERIOD_FILE, d); setPeriods(d); ctx.showToast("已删除"); } catch (e) { ctx.showToast("删除失败"); }
    close();
  }

  // ======= 生病操作 =======
  async function saveSick() {
    if (!selDay || !sickNote || !sickNote.trim()) { ctx.showToast("请填写症状"); return; }
    var ds = ms + "-" + String(selDay).padStart(2, "0");
    var d = JSON.parse(JSON.stringify(sickData));
    if (!d.records) d.records = {};
    d.records[ds] = { note: sickNote.trim(), timestamp: Date.now() };
    try { await writeJsonAsync(SICK_FILE, d); setSickData(d); ctx.showToast("已记录"); } catch (e) { ctx.showToast("保存失败"); }
    close();
  }
  async function deleteSickAsync() {
    if (!selDay) return;
    var ds = ms + "-" + String(selDay).padStart(2, "0");
    var d = JSON.parse(JSON.stringify(sickData));
    if (!d.records || !d.records[ds]) { ctx.showToast("没有生病记录"); return; }
    delete d.records[ds];
    try { await writeJsonAsync(SICK_FILE, d); setSickData(d); ctx.showToast("已删除"); } catch (e) { ctx.showToast("删除失败"); }
    close();
  }

  // ======= 经期详情操作 =======
  async function savePeriodDetail() {
    if (!selDay) return;
    var ds = ms + "-" + String(selDay).padStart(2, "0");
    var d = JSON.parse(JSON.stringify(pdtData));
    if (!d.records) d.records = {};
    var sympArr = pdSymp ? pdSymp.split(",").filter(function(x) { return x.length > 0; }) : [];
    d.records[ds] = {
      flow: pdFlow || null, color: pdColor || null, pain: pdPain >= 0 ? pdPain : null,
      symptoms: sympArr, note: pdNoteVal || "", timestamp: Date.now()
    };
    try { await writeJsonAsync(PERIOD_DETAIL_FILE, d); setPdtData(d); ctx.showToast("已保存详情"); } catch (e) { ctx.showToast("保存失败"); }
    close();
  }
  async function deletePdtAsync() {
    if (!selDay) return;
    var ds = ms + "-" + String(selDay).padStart(2, "0");
    var d = JSON.parse(JSON.stringify(pdtData));
    if (!d.records || !d.records[ds]) { ctx.showToast("没有经期详情"); return; }
    delete d.records[ds];
    try { await writeJsonAsync(PERIOD_DETAIL_FILE, d); setPdtData(d); ctx.showToast("已删除"); } catch (e) { ctx.showToast("删除失败"); }
    close();
  }
  function openPdPopup() {
    var ds = ms + "-" + String(selDay).padStart(2, "0");
    var ex = pdtData.records && pdtData.records[ds];
    if (ex) {
      setPdFlow(ex.flow || ""); setPdColor(ex.color || "");
      setPdPain(ex.pain !== null && ex.pain !== undefined ? ex.pain : -1);
      setPdSymp(ex.symptoms ? ex.symptoms.join(",") : ""); setPdNoteVal(ex.note || "");
    } else { setPdFlow(""); setPdColor(""); setPdPain(-1); setPdSymp(""); setPdNoteVal(""); }
    setPopup("periodDetail");
  }

  // ======= 日程操作 =======
  async function saveSchedule() {
    if (!selDay || !schTitle || !schTitle.trim()) { ctx.showToast("请填写标题"); return; }
    var ds = ms + "-" + String(selDay).padStart(2, "0");
    var d = JSON.parse(JSON.stringify(schedData));
    if (!d.events) d.events = {};
    if (!d.events[ds]) d.events[ds] = [];
    d.events[ds].push({
      id: String(Date.now()), title: schTitle.trim(), category: schCat || "other",
      start_time: schSt || "", end_time: schEt || "",
      location: schLoc || "", note: schNote || "", timestamp: Date.now()
    });
    try { await writeJsonAsync(SCHEDULE_FILE, d); setSchedData(d); ctx.showToast("已添加日程"); } catch (e) { ctx.showToast("保存失败"); }
    close();
  }
  async function deleteScheduleByIdx(ds, idx) {
    var d = JSON.parse(JSON.stringify(schedData));
    if (!d.events || !d.events[ds]) return;
    d.events[ds].splice(idx, 1);
    if (d.events[ds].length === 0) delete d.events[ds];
    try { await writeJsonAsync(SCHEDULE_FILE, d); setSchedData(d); ctx.showToast("已删除日程"); } catch (e) { ctx.showToast("删除失败"); }
  }

  // ======= 课程操作 =======
  async function saveCourse() {
    if (!crName || !crName.trim()) { ctx.showToast("请填写课程名称"); return; }
    var sp = parseInt(crSp); var ep = parseInt(crEp);
    if (isNaN(sp) || isNaN(ep) || sp < 1 || ep < sp) { ctx.showToast("节次无效"); return; }
    var ws = parseInt(crWs) || 1; var we = parseInt(crWe) || 16;
    if (ws < 1 || we < ws) { ctx.showToast("周数无效"); return; }
    var d = JSON.parse(JSON.stringify(courseData));
    d.courses.push({
      id: String(Date.now()), name: crName.trim(), day: crDay,
      start_period: sp, end_period: ep,
      week_start: ws, week_end: we, week_type: crWt,
      location: crLoc || "", teacher: crTch || ""
    });
    try { await writeJsonAsync(COURSE_FILE, d); setCourseData(d); ctx.showToast("已添加课程"); } catch (e) { ctx.showToast("保存失败"); }
    close();
    setPopup("courseList");
  }
  async function deleteCourseById(id) {
    var d = JSON.parse(JSON.stringify(courseData));
    for (var i = 0; i < d.courses.length; i++) {
      if (d.courses[i].id === id) { d.courses.splice(i, 1); break; }
    }
    try { await writeJsonAsync(COURSE_FILE, d); setCourseData(d); ctx.showToast("已删除课程"); } catch (e) { ctx.showToast("删除失败"); }
  }
  async function saveSemesterStart() {
    if (!semStart || !semStart.match(/^\d{4}[-\/]\d{2}[-\/]\d{2}$/)) { ctx.showToast("日期格式无效"); return; }
    var normalized = semStart.replace(/\//g, "-");
    var d = JSON.parse(JSON.stringify(courseData));
    d.semester_start = normalized;
    try { await writeJsonAsync(COURSE_FILE, d); setCourseData(d); setSemStart(normalized); ctx.showToast("已设置学期开始"); } catch (e) { ctx.showToast("保存失败"); }
  }

  // ======= 设置操作 =======
  async function saveSettingsFn() {
    var s = JSON.parse(JSON.stringify(sett));
    s.cycle_length = sCycle; s.period_length = sPeriod;
    try {
      await writeJsonAsync(SETTINGS_FILE, s); setSett(s);
      var pd = JSON.parse(JSON.stringify(periods));
      pd.settings = { cycle_length: sCycle, period_length: sPeriod };
      await writeJsonAsync(PERIOD_FILE, pd); setPeriods(pd);
      ctx.showToast("设置已保存");
    } catch (e) { ctx.showToast("保存失败"); }
    close();
  }

  // ======= 主题操作 =======
  async function applyTheme(id) {
    setThemeId(id);
    try {
      var td = { current: id, custom: customThemes };
      await writeJsonAsync(THEME_FILE, td);
      ctx.showToast("已切换主题");
    } catch (e) {}
  }
  async function saveCustomTheme() {
    if (!ctName || !ctName.trim()) { ctx.showToast("请输入主题名称"); return; }
    var id = "custom_" + Date.now();
    var nt = { id: id, name: ctName.trim(), bg: ctBg, pri: ctPri, sec: ctSec, acc: ctAcc, priL: ctAcc };
    var list = JSON.parse(JSON.stringify(customThemes));
    list.push(nt);
    setCustomThemes(list); setThemeId(id);
    try { await writeJsonAsync(THEME_FILE, { current: id, custom: list }); ctx.showToast("已保存主题"); } catch (e) { ctx.showToast("保存失败"); }
  }
  async function deleteCustomTheme(id) {
    var list = JSON.parse(JSON.stringify(customThemes));
    var newList = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id !== id) newList.push(list[i]);
    }
    setCustomThemes(newList);
    if (themeId === id) setThemeId("mint_choco");
    try {
      await writeJsonAsync(THEME_FILE, { current: themeId === id ? "mint_choco" : themeId, custom: newList });
      ctx.showToast("已删除主题");
    } catch (e) { ctx.showToast("删除失败"); }
  }

  // ==================== UI 组件 ====================

  // ---- Tab 栏 ----
  var TAB_LABELS = ["心情", "经期", "日程", "设置"];
  function mkTab(label, idx) {
    var on = tab === idx;
    return UI.Box({
      key: "tab" + idx, contentAlignment: "center",
      modifier: Modifier.weight(1)
        .background(on ? C.pri : "transparent", { type: "pill" })
        .clickable(function() { setTab(idx); close(); })
    }, UI.Box({ padding: { top: 9, bottom: 9 }, key: "tbi" + idx },
      UI.Text({ text: label, fontSize: 13, fontWeight: on ? "bold" : "normal", color: on ? C.white : C.sec, key: "tbt" + idx })
    ));
  }
  var tabBarItems = [];
  for (var tbi = 0; tbi < TAB_LABELS.length; tbi++) tabBarItems.push(mkTab(TAB_LABELS[tbi], tbi));
  var tabBar = UI.Card({
    containerColor: C.priL, shape: { type: "pill" }, elevation: 0,
    fillMaxWidth: true, padding: 3, key: "tabbar"
  }, UI.Row({ fillMaxWidth: true }, tabBarItems));

  // ---- 月份导航 ----
  var mNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
  var monthHeader = UI.Row({
    fillMaxWidth: true, horizontalArrangement: "spaceBetween",
    verticalAlignment: "center", padding: { top: 4, bottom: 4 }, key: "mhdr"
  }, [
    UI.Box({
      key: "pbtn", width: 40, height: 40, contentAlignment: "center",
      modifier: Modifier.background(C.card, { type: "circle" }).border(1, C.brd, { type: "circle" }).clickable(prev)
    }, UI.Text({ text: "<", fontSize: 18, color: C.sec, key: "pi" })),
    UI.Column({
      horizontalAlignment: "center", key: "mc",
      modifier: Modifier.clickable(function() { setPYear(year); setPopup("picker"); })
    }, [
      UI.Text({ text: "" + year, fontSize: 12, color: C.sec, key: "yrtxt" }),
      UI.Text({ text: mNames[month - 1], fontSize: 20, fontWeight: "bold", color: C.txt, key: "motxt" })
    ]),
    UI.Box({
      key: "nbtn", width: 40, height: 40, contentAlignment: "center",
      modifier: Modifier.background(C.card, { type: "circle" }).border(1, C.brd, { type: "circle" }).clickable(next)
    }, UI.Text({ text: ">", fontSize: 18, color: C.sec, key: "ni" }))
  ]);

  // ---- 星期表头 ----
  var wks = ["一", "二", "三", "四", "五", "六", "日"];
  var weekHeaders = [];
  for (var wi = 0; wi < wks.length; wi++) {
    weekHeaders.push(UI.Box({
      modifier: Modifier.weight(1), contentAlignment: "center", key: "w" + wi
    }, UI.Text({ text: wks[wi], fontSize: 12, color: wi >= 5 ? C.pri : C.sec, key: "wt" + wi })));
  }
  var weekRow = UI.Row({ fillMaxWidth: true, padding: { top: 8, bottom: 4 }, key: "wkr" }, weekHeaders);

  // ---- 日历网格 ----
  function buildGrid() {
    var cells = [];
    var cellH = tab === 0 ? 76 : 50;
    for (var i = 0; i < off; i++) {
      cells.push(UI.Box({ key: "e" + i, modifier: Modifier.weight(1), height: cellH }));
    }
    for (var day = 1; day <= dim; day++) {
      var ds = ms + "-" + String(day).padStart(2, "0");
      var rec = moods.records[ds];
      var isToday = year === TY && month === TM && day === TD;
      var isSel = selDay === day && popup !== "";
      var annInfo = getAnnForDay(day);
      var phaseInfo = tab === 1 ? getPhase(ds) : null;
      var hasEvents = tab === 2 && schedData.events && schedData.events[ds] && schedData.events[ds].length > 0;
      var hasCourses = tab === 2 && getCoursesForDate(ds).length > 0;

      var parts = [];

      // 日期数字
      if (isToday) {
        parts.push(UI.Box({
          key: "td" + day, width: 22, height: 22, contentAlignment: "center",
          modifier: Modifier.background(C.pri, { type: "circle" })
        }, UI.Text({ text: String(day), fontSize: 11, color: C.white, fontWeight: "bold", key: "d" + day })));
      } else {
        parts.push(UI.Text({ text: String(day), fontSize: 12, color: C.txt, key: "d" + day }));
      }

      // Tab-specific content
      if (tab === 0) {
        if (rec && rec.user) {
          parts.push(UI.Image({
            url: MOOD_ICONS_USER[rec.user.mood], contentDescription: MOOD_LABELS[rec.user.mood] || "",
            contentScale: "fit", width: 22, height: 22, key: "u" + day
          }));
        } else {
          parts.push(UI.Box({ key: "ue" + day, width: 22, height: 22, modifier: Modifier.background(C.dim, { type: "circle" }) }));
        }
        if (rec && rec.ai) {
          parts.push(UI.Image({
            url: MOOD_ICONS_AI[rec.ai.mood], contentDescription: MOOD_LABELS[rec.ai.mood] || "",
            contentScale: "fit", width: 22, height: 22, key: "a" + day
          }));
        } else {
          parts.push(UI.Box({ key: "ae" + day, width: 22, height: 22, modifier: Modifier.background(C.dim, { type: "rounded", cornerRadius: 4 }) }));
        }
      } else if (tab === 1) {
        if (phaseInfo) {
          parts.push(UI.Box({ key: "pd" + day, width: 6, height: 6, modifier: Modifier.background(phaseInfo.color, { type: "circle" }) }));
        }
      } else if (tab === 2) {
        if (annInfo) {
          parts.push(UI.Text({ text: "♡", fontSize: 10, color: "#E91E63", key: "ann" + day }));
        } else if (hasEvents) {
          // 显示第一个日程的分类颜色
          var firstEvt = schedData.events[ds][0];
          var evtColor = CATEGORY_COLORS[firstEvt.category] || CATEGORY_COLORS.other;
          parts.push(UI.Box({ key: "ev" + day, width: 6, height: 6, modifier: Modifier.background(evtColor, { type: "circle" }) }));
        } else if (hasCourses) {
          parts.push(UI.Box({ key: "cr" + day, width: 6, height: 6, modifier: Modifier.background(C.pri, { type: "rounded", cornerRadius: 1 }) }));
        }
      }

      // 背景色 & 边框
      var bg = "transparent";
      var bw = 0, bc = "transparent";
      if (tab === 1 && phaseInfo) {
        if (phaseInfo.phase === "menstrual" && phaseInfo.predicted) {
          // 预测经期：虚线框效果（用边框表示）
          bw = 1.5; bc = PH.men;
        } else {
          bg = phaseInfo.bg;
        }
      }
      if (isSel) { bg = C.priL; bw = 1.5; bc = C.pri; }

      cells.push(UI.Box({
        key: "c" + day, height: cellH, contentAlignment: "center",
        modifier: Modifier.weight(1)
          .background(bg, { type: "rounded", cornerRadius: 10 })
          .border(bw, bc, { type: "rounded", cornerRadius: 10 })
          .clickable(function(day) { return function() { tapDay(day); }; }(day))
      }, UI.Column({ horizontalAlignment: "center", spacing: 1 }, parts)));
    }
    var rem = (off + dim) % 7;
    if (rem > 0) {
      for (var pi2 = 0; pi2 < 7 - rem; pi2++) {
        cells.push(UI.Box({ key: "p" + pi2, modifier: Modifier.weight(1), height: cellH }));
      }
    }
    var rows = [];
    for (var ri = 0; ri < cells.length; ri += 7) {
      rows.push(UI.Row({ key: "r" + ri, fillMaxWidth: true, spacing: 2 }, cells.slice(ri, ri + 7)));
    }
    return UI.Column({ spacing: 2, key: "grid" }, rows);
  }

  // ---- 日历卡片 ----
  function buildCalendarCard() {
    return UI.Card({
      containerColor: C.card, shape: { type: "rounded", cornerRadius: 16 },
      elevation: 0, fillMaxWidth: true, padding: 12, key: "calcrd"
    }, UI.Column({ spacing: 0 }, [monthHeader, weekRow, buildGrid()]));
  }

  // ---- 图例 ----
  function dot(color, shape, label, k) {
    return UI.Row({ spacing: 4, verticalAlignment: "center", key: k }, [
      UI.Box({ width: 10, height: 10, key: k + "d", modifier: Modifier.background(color, shape) }),
      UI.Text({ text: label, fontSize: 11, color: C.sec, key: k + "t" })
    ]);
  }
  function dotOutline(color, label, k) {
    return UI.Row({ spacing: 4, verticalAlignment: "center", key: k }, [
      UI.Box({ width: 10, height: 10, key: k + "d", modifier: Modifier.border(1.5, color, { type: "circle" }) }),
      UI.Text({ text: label, fontSize: 11, color: C.sec, key: k + "t" })
    ]);
  }
  function buildLegend() {
    if (tab === 0) {
      return UI.Card({
        containerColor: C.card, shape: { type: "rounded", cornerRadius: 12 },
        elevation: 0, fillMaxWidth: true, padding: 12, key: "lgd"
      }, UI.Row({ spacing: 16, key: "lgr" }, [
        dot(C.dim, { type: "circle" }, "我", "l1"),
        dot(C.dim, { type: "rounded", cornerRadius: 3 }, "TA", "l2"),
        UI.Text({ text: "点击日期查看详情", fontSize: 10, color: C.light, key: "lh" })
      ]));
    }
    if (tab === 1) {
      return UI.Card({
        containerColor: C.card, shape: { type: "rounded", cornerRadius: 12 },
        elevation: 0, fillMaxWidth: true, padding: 12, key: "lgd"
      }, UI.Column({ spacing: 6, key: "lgc" }, [
        UI.Row({ spacing: 10, key: "lgr1" }, [
          dot(PH.men, { type: "circle" }, "经期", "lp1"),
          dotOutline(PH.men, "预测经期", "lp5"),
          dot(PH.fol, { type: "circle" }, "卵泡期", "lp2")
        ]),
        UI.Row({ spacing: 10, key: "lgr2" }, [
          dot(PH.ovu, { type: "circle" }, "排卵期", "lp3"),
          dot(PH.lut, { type: "circle" }, "黄体期", "lp4")
        ])
      ]));
    }
    return UI.Spacer({ height: 0, key: "lgdn" });
  }

  // ---- 心情 tab: 记录按钮 ----
  function buildRecordBtn() {
    if (tab !== 0) return UI.Spacer({ height: 0, key: "nrb" });
    return UI.Box({
      fillMaxWidth: true, contentAlignment: "center", key: "rbtn",
      modifier: Modifier.background(C.pri, { type: "pill" })
        .clickable(function() { if (!selDay) setSelDay(TD); setPopup("record"); })
    }, UI.Box({ padding: { top: 14, bottom: 14 }, key: "rbi" },
      UI.Text({ text: "记录今日心情", fontSize: 15, fontWeight: "bold", color: C.white, key: "rbt" })
    ));
  }

  // ---- 心情 tab: 统计 ----
  function makeBars(counts, total, iconMap, prefix) {
    var entries = [];
    var keys = Object.keys(counts);
    for (var i = 0; i < keys.length; i++) entries.push([keys[i], counts[keys[i]]]);
    entries.sort(function(a, b) { return b[1] - a[1]; });
    var bars = [];
    for (var bi = 0; bi < entries.length; bi++) {
      var mood = entries[bi][0], cnt = entries[bi][1];
      var pct = Math.round(cnt / total * 100);
      bars.push(UI.Row({
        spacing: 8, fillMaxWidth: true, verticalAlignment: "center", key: prefix + "b" + mood
      }, [
        UI.Image({ url: iconMap[mood], contentDescription: MOOD_LABELS[mood] || "", contentScale: "fit", width: 18, height: 18, key: prefix + "bi" + mood }),
        UI.Text({ text: MOOD_LABELS[mood], fontSize: 11, color: C.sec, key: prefix + "bl" + mood }),
        UI.Box({
          key: prefix + "bb" + mood, height: 8,
          modifier: Modifier.weight(1).background("#F5F0EE", { type: "pill" }).clip({ type: "pill" })
        }, UI.Box({ key: prefix + "bf" + mood, height: 8, modifier: Modifier.fillMaxWidth(pct / 100).background(MOOD_COLORS[mood] || "#CCC", { type: "pill" }) })),
        UI.Text({ text: "" + cnt, fontSize: 11, color: C.sec, key: prefix + "bc" + mood })
      ]));
    }
    return bars;
  }
  function buildStats() {
    if (tab !== 0) return UI.Spacer({ height: 0, key: "ns" });
    var userCounts = {}, aiCounts = {}, userTotal = 0, aiTotal = 0;
    var dates = Object.keys(moods.records);
    for (var di = 0; di < dates.length; di++) {
      if (dates[di].indexOf(ms) === 0) {
        var rec = moods.records[dates[di]];
        if (rec.user) { userCounts[rec.user.mood] = (userCounts[rec.user.mood] || 0) + 1; userTotal++; }
        if (rec.ai) { aiCounts[rec.ai.mood] = (aiCounts[rec.ai.mood] || 0) + 1; aiTotal++; }
      }
    }
    if (userTotal === 0 && aiTotal === 0) {
      return UI.Card({
        containerColor: C.card, shape: { type: "rounded", cornerRadius: 16 },
        elevation: 0, fillMaxWidth: true, padding: 20, key: "se"
      }, UI.Text({ text: "本月还没有心情记录", fontSize: 13, color: C.light, key: "set" }));
    }
    var content = [];
    if (userTotal > 0) {
      content.push(UI.Row({ fillMaxWidth: true, horizontalArrangement: "spaceBetween", key: "ush" }, [
        UI.Text({ text: "我的心情", fontSize: 14, fontWeight: "bold", color: C.txt, key: "ust" }),
        UI.Text({ text: userTotal + " 天", fontSize: 12, color: C.sec, key: "usc" })
      ]));
      var ub = makeBars(userCounts, userTotal, MOOD_ICONS_USER, "u");
      for (var ui2 = 0; ui2 < ub.length; ui2++) content.push(ub[ui2]);
    }
    if (aiTotal > 0) {
      if (userTotal > 0) content.push(UI.Spacer({ height: 10, key: "sdiv" }));
      content.push(UI.Row({ fillMaxWidth: true, horizontalArrangement: "spaceBetween", key: "ash" }, [
        UI.Text({ text: "TA的心情", fontSize: 14, fontWeight: "bold", color: C.txt, key: "ast" }),
        UI.Text({ text: aiTotal + " 天", fontSize: 12, color: C.sec, key: "asc" })
      ]));
      var ab = makeBars(aiCounts, aiTotal, MOOD_ICONS_AI, "a");
      for (var ai2 = 0; ai2 < ab.length; ai2++) content.push(ab[ai2]);
    }
    return UI.Card({
      containerColor: C.card, shape: { type: "rounded", cornerRadius: 16 },
      elevation: 0, fillMaxWidth: true, padding: 16, key: "sc"
    }, UI.Column({ spacing: 8 }, content));
  }

  // ---- 经期 tab: 阶段+设置 ----
  function buildPeriodInfo() {
    if (tab !== 1) return UI.Spacer({ height: 0, key: "npi" });
    var todayStr = TY + "-" + String(TM).padStart(2, "0") + "-" + String(TD).padStart(2, "0");
    var todayPhase = getPhase(todayStr);
    var content = [];

    if (todayPhase) {
      content.push(UI.Card({
        containerColor: todayPhase.bg, shape: { type: "pill" },
        elevation: 0, fillMaxWidth: true, padding: { start: 16, end: 16, top: 10, bottom: 10 }, key: "phcard"
      }, UI.Row({ spacing: 8, verticalAlignment: "center", horizontalArrangement: "center", key: "phr" }, [
        UI.Box({ width: 10, height: 10, key: "phd", modifier: Modifier.background(todayPhase.color, { type: "circle" }) }),
        UI.Text({ text: "当前阶段：" + todayPhase.label, fontSize: 14, fontWeight: "bold", color: todayPhase.color, key: "pht" })
      ])));
    }

    content.push(UI.Card({
      containerColor: C.card, shape: { type: "rounded", cornerRadius: 16 },
      elevation: 0, fillMaxWidth: true, padding: 16, key: "pic"
    }, UI.Column({ spacing: 12 }, [
      UI.Row({ fillMaxWidth: true, horizontalArrangement: "spaceBetween", verticalAlignment: "center", key: "pih" }, [
        UI.Text({ text: "周期设置", fontSize: 15, fontWeight: "bold", color: C.txt, key: "pit" }),
        UI.Box({
          key: "piedit", contentAlignment: "center",
          modifier: Modifier.background(C.priL, { type: "pill" })
            .clickable(function() { setSCycle(sett.cycle_length); setSPeriod(sett.period_length); setPopup("settings"); })
        }, UI.Box({ padding: { start: 14, end: 14, top: 6, bottom: 6 }, key: "piei" },
          UI.Text({ text: "编辑", fontSize: 12, color: C.pri, key: "piet" })
        ))
      ]),
      UI.Row({ fillMaxWidth: true, spacing: 16, key: "pir" }, [
        UI.Column({ horizontalAlignment: "center", modifier: Modifier.weight(1), key: "pcc" }, [
          UI.Text({ text: String(sett.cycle_length), fontSize: 30, fontWeight: "bold", color: C.pri, key: "pcv" }),
          UI.Text({ text: "天/周期", fontSize: 12, color: C.sec, key: "pcl" })
        ]),
        UI.Box({ width: 1, height: 40, modifier: Modifier.background(C.brd), key: "pdiv" }),
        UI.Column({ horizontalAlignment: "center", modifier: Modifier.weight(1), key: "ppc" }, [
          UI.Text({ text: String(sett.period_length), fontSize: 30, fontWeight: "bold", color: PH.men, key: "ppv" }),
          UI.Text({ text: "天/经期", fontSize: 12, color: C.sec, key: "ppl" })
        ])
      ]),
      UI.Row({ fillMaxWidth: true, spacing: 10, key: "pmr" }, [
        UI.Box({
          key: "pms", contentAlignment: "center",
          modifier: Modifier.weight(1).background(PH.menBg, { type: "pill" })
            .clickable(function() { if (!selDay) setSelDay(TD); savePeriodMark("start"); })
        }, UI.Box({ padding: { top: 10, bottom: 10 }, key: "pmsi" },
          UI.Text({ text: "标记经期开始", fontSize: 13, color: PH.men, fontWeight: "bold", key: "pmst" })
        )),
        UI.Box({
          key: "pme", contentAlignment: "center",
          modifier: Modifier.weight(1).background(PH.ovuBg, { type: "pill" })
            .clickable(function() { if (!selDay) setSelDay(TD); savePeriodMark("end"); })
        }, UI.Box({ padding: { top: 10, bottom: 10 }, key: "pmei" },
          UI.Text({ text: "标记经期结束", fontSize: 13, color: PH.ovu, fontWeight: "bold", key: "pmet" })
        ))
      ]),
      UI.Box({
        key: "pdtbtn", contentAlignment: "center", fillMaxWidth: true,
        modifier: Modifier.background(C.priL, { type: "pill" })
          .clickable(function() { if (!selDay) setSelDay(TD); openPdPopup(); })
      }, UI.Box({ padding: { top: 10, bottom: 10 }, key: "pdtbi" },
        UI.Text({ text: "记录今日详情", fontSize: 13, color: C.pri, fontWeight: "bold", key: "pdtbt" })
      ))
    ])));

    return UI.Column({ spacing: 12, key: "piw" }, content);
  }

  // ---- 日程 tab 内容 ----
  function buildScheduleContent() {
    if (tab !== 2) return UI.Spacer({ height: 0, key: "nsc" });
    var content = [];

    // 本月纪念日
    var annList = [];
    if (sett.anniversaries) {
      var curMM = String(month).padStart(2, "0");
      for (var ai = 0; ai < sett.anniversaries.length; ai++) {
        if (sett.anniversaries[ai].date.split("-")[0] === curMM) annList.push(sett.anniversaries[ai]);
      }
    }
    if (annList.length > 0) {
      var annItems = [];
      for (var aii = 0; aii < annList.length; aii++) {
        annItems.push(UI.Row({ spacing: 8, verticalAlignment: "center", key: "ani" + aii }, [
          UI.Text({ text: annList[aii].date.split("-")[1] + "日", fontSize: 12, fontWeight: "bold", color: "#E91E63", key: "and" + aii }),
          UI.Text({ text: annList[aii].label, fontSize: 13, color: C.txt, key: "anl" + aii })
        ]));
      }
      content.push(UI.Card({
        containerColor: C.card, shape: { type: "rounded", cornerRadius: 12 },
        elevation: 0, fillMaxWidth: true, padding: 12, key: "anncard"
      }, UI.Column({ spacing: 6 }, [
        UI.Text({ text: "本月纪念日", fontSize: 13, fontWeight: "bold", color: "#E91E63", key: "anntl" })
      ].concat(annItems))));
    }

    // 今日课程
    var todayDs = TY + "-" + String(TM).padStart(2, "0") + "-" + String(TD).padStart(2, "0");
    var todayCourses = getCoursesForDate(todayDs);
    if (todayCourses.length > 0) {
      var crItems = [];
      var dayLabels = ["", "一", "二", "三", "四", "五", "六", "日"];
      for (var ci = 0; ci < todayCourses.length; ci++) {
        var cr = todayCourses[ci];
        crItems.push(UI.Row({ spacing: 8, fillMaxWidth: true, verticalAlignment: "center", key: "tci" + ci }, [
          UI.Box({ width: 4, height: 28, key: "tcd" + ci, modifier: Modifier.background(C.acc, { type: "pill" }) }),
          UI.Column({ modifier: Modifier.weight(1), key: "tcc" + ci }, [
            UI.Text({ text: cr.name + "  第" + cr.start_period + "-" + cr.end_period + "节", fontSize: 13, color: C.txt, key: "tcn" + ci }),
            cr.location ? UI.Text({ text: cr.location + (cr.teacher ? " · " + cr.teacher : ""), fontSize: 11, color: C.sec, key: "tcl" + ci }) : UI.Spacer({ height: 0, key: "tcls" + ci })
          ])
        ]));
      }
      content.push(UI.Card({
        containerColor: C.card, shape: { type: "rounded", cornerRadius: 16 },
        elevation: 0, fillMaxWidth: true, padding: 16, key: "tcrsc"
      }, UI.Column({ spacing: 8 }, [
        UI.Text({ text: "今日课程", fontSize: 15, fontWeight: "bold", color: C.txt, key: "tcrstl" })
      ].concat(crItems))));
    }

    // 今日日程
    var todayEvts = schedData.events && schedData.events[todayDs] ? schedData.events[todayDs] : [];
    var evtItems = [];
    if (todayEvts.length === 0 && todayCourses.length === 0) {
      evtItems.push(UI.Text({ text: "今天没有日程安排", fontSize: 13, color: C.light, key: "noe" }));
    } else {
      for (var ei = 0; ei < todayEvts.length; ei++) {
        var evt = todayEvts[ei];
        var evtColor = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.other;
        var evtText = evt.title;
        if (evt.start_time) evtText += "  " + evt.start_time + (evt.end_time ? "-" + evt.end_time : "");
        if (evt.location) evtText += "  " + evt.location;
        evtItems.push(UI.Row({ spacing: 8, fillMaxWidth: true, verticalAlignment: "center", key: "tei" + ei }, [
          UI.Box({ width: 4, height: 28, key: "ted" + ei, modifier: Modifier.background(evtColor, { type: "pill" }) }),
          UI.Column({ modifier: Modifier.weight(1), key: "tec" + ei }, [
            UI.Row({ spacing: 6, verticalAlignment: "center", key: "ter" + ei }, [
              UI.Text({ text: CATEGORY_LABELS[evt.category] || "其他", fontSize: 10, color: evtColor, key: "tecat" + ei }),
              UI.Text({ text: evtText, fontSize: 13, color: C.txt, key: "tet" + ei })
            ]),
            evt.note ? UI.Text({ text: evt.note, fontSize: 11, color: C.sec, key: "ten" + ei }) : UI.Spacer({ height: 0, key: "tens" + ei })
          ])
        ]));
      }
    }
    if (todayEvts.length > 0 || (todayEvts.length === 0 && todayCourses.length === 0)) {
      content.push(UI.Card({
        containerColor: C.card, shape: { type: "rounded", cornerRadius: 16 },
        elevation: 0, fillMaxWidth: true, padding: 16, key: "tesc"
      }, UI.Column({ spacing: 8 }, [
        UI.Text({ text: "今日日程", fontSize: 15, fontWeight: "bold", color: C.txt, key: "testl" })
      ].concat(evtItems))));
    }

    // 两个操作按钮并排
    content.push(UI.Row({ fillMaxWidth: true, spacing: 10, key: "scbr" }, [
      UI.Box({
        key: "clbtn", contentAlignment: "center",
        modifier: Modifier.weight(1).background(C.priL, { type: "pill" })
          .clickable(function() { setPopup("courseList"); })
      }, UI.Box({ padding: { top: 14, bottom: 14 }, key: "clbi" },
        UI.Text({ text: "课表管理", fontSize: 15, fontWeight: "bold", color: C.pri, key: "clbt" })
      )),
      UI.Box({
        key: "asbtn", contentAlignment: "center",
        modifier: Modifier.weight(1).background(C.pri, { type: "pill" })
          .clickable(function() { if (!selDay) setSelDay(TD); setPopup("addSchedule"); })
      }, UI.Box({ padding: { top: 14, bottom: 14 }, key: "asbi" },
        UI.Text({ text: "添加日程", fontSize: 15, fontWeight: "bold", color: C.white, key: "asbt" })
      ))
    ]));

    return UI.Column({ spacing: 12, key: "scw" }, content);
  }

  // ---- 设置 tab 内容 ----
  function buildSettingsContent() {
    if (tab !== 3) return UI.Spacer({ height: 0, key: "nstc" });
    var content = [];

    content.push(UI.Text({ text: "选择主题", fontSize: 18, fontWeight: "bold", color: C.txt, key: "stttl" }));
    content.push(UI.Spacer({ height: 8, key: "sts1" }));

    // 内置+自定义主题（可滑动的行）
    var presetItems = [];
    var themeKeys = Object.keys(THEMES);
    for (var tki = 0; tki < themeKeys.length; tki++) {
      (function(tk) {
        var t = THEMES[tk];
        var isOn = themeId === tk;
        presetItems.push(UI.Column({
          horizontalAlignment: "center", spacing: 4, key: "tp" + tk, width: 80,
          modifier: Modifier.clickable(function() { applyTheme(tk); })
        }, [
          UI.Box({
            width: 56, height: 56, contentAlignment: "center", key: "tpc" + tk,
            modifier: Modifier.background(t.acc, { type: "circle" })
              .border(isOn ? 3 : 0, isOn ? t.pri : "transparent", { type: "circle" })
          }, UI.Box({ width: 28, height: 28, key: "tpi" + tk, modifier: Modifier.background(t.pri, { type: "circle" }) })),
          UI.Text({ text: t.name, fontSize: 11, color: isOn ? C.pri : C.sec, fontWeight: isOn ? "bold" : "normal", key: "tpn" + tk })
        ]));
      })(themeKeys[tki]);
    }
    for (var ci2 = 0; ci2 < customThemes.length; ci2++) {
      (function(ct, idx) {
        var isOn = themeId === ct.id;
        presetItems.push(UI.Column({
          horizontalAlignment: "center", spacing: 4, key: "tc" + idx, width: 80,
          modifier: Modifier.clickable(function() { applyTheme(ct.id); })
        }, [
          UI.Box({
            width: 56, height: 56, contentAlignment: "center", key: "tcc" + idx,
            modifier: Modifier.background(ct.acc || "#DDD", { type: "circle" })
              .border(isOn ? 3 : 0, isOn ? (ct.pri || "#333") : "transparent", { type: "circle" })
          }, UI.Box({ width: 28, height: 28, key: "tci" + idx, modifier: Modifier.background(ct.pri || "#333", { type: "circle" }) })),
          UI.Text({ text: ct.name, fontSize: 11, color: isOn ? C.pri : C.sec, fontWeight: isOn ? "bold" : "normal", key: "tcn" + idx }),
          UI.Box({
            key: "tcdel" + idx, contentAlignment: "center",
            modifier: Modifier.clickable(function() { deleteCustomTheme(ct.id); })
          }, UI.Text({ text: "删除", fontSize: 9, color: "#FF4444", key: "tcdt" + idx }))
        ]));
      })(customThemes[ci2], ci2);
    }
    content.push(UI.Card({
      containerColor: C.card, shape: { type: "rounded", cornerRadius: 16 },
      elevation: 0, fillMaxWidth: true, padding: 16, key: "tpcard"
    }, UI.Row({ fillMaxWidth: true, spacing: 12, horizontalArrangement: "start" }, presetItems)));

    content.push(UI.Spacer({ height: 12, key: "sts2" }));

    // 创建自定义主题
    content.push(UI.Card({
      containerColor: C.card, shape: { type: "rounded", cornerRadius: 16 },
      elevation: 0, fillMaxWidth: true, padding: 16, key: "ctcard"
    }, UI.Column({ spacing: 10, fillMaxWidth: true }, [
      UI.Text({ text: "创建自定义主题", fontSize: 15, fontWeight: "bold", color: C.txt, key: "cttl" }),
      UI.Card({
        containerColor: "#FAFAFA", shape: { type: "rounded", cornerRadius: 10 },
        elevation: 0, fillMaxWidth: true, key: "ctnc"
      }, UI.TextField({
        value: ctName, onValueChange: function(v) { setCtName(v); },
        placeholder: "主题名称", singleLine: true, fillMaxWidth: true, key: "ctntf"
      })),
      buildColorInput("背景色", ctBg, setCtBg, "ctbg"),
      buildColorInput("主色", ctPri, setCtPri, "ctpr"),
      buildColorInput("辅色", ctSec, setCtSec, "ctsc"),
      buildColorInput("点缀色", ctAcc, setCtAcc, "ctac"),
      // 预览条
      UI.Row({ fillMaxWidth: true, spacing: 0, key: "ctpv" }, [
        UI.Box({ height: 24, modifier: Modifier.weight(1).background(ctBg), key: "ctpv1" }),
        UI.Box({ height: 24, modifier: Modifier.weight(1).background(ctPri), key: "ctpv2" }),
        UI.Box({ height: 24, modifier: Modifier.weight(1).background(ctSec), key: "ctpv3" }),
        UI.Box({ height: 24, modifier: Modifier.weight(1).background(ctAcc), key: "ctpv4" })
      ]),
      UI.Box({
        fillMaxWidth: true, contentAlignment: "center", key: "ctsb",
        modifier: Modifier.background(C.pri, { type: "pill" }).clickable(saveCustomTheme)
      }, UI.Box({ padding: { top: 12, bottom: 12 }, key: "ctsbi" },
        UI.Text({ text: "保存预设", fontSize: 14, fontWeight: "bold", color: C.white, key: "ctsbt" })
      ))
    ])));

    return UI.Column({ spacing: 8, key: "stw" }, content);
  }

  function buildColorInput(label, value, setter, k) {
    return UI.Row({ fillMaxWidth: true, spacing: 10, verticalAlignment: "center", key: k + "r" }, [
      UI.Column({ modifier: Modifier.weight(1), key: k + "lc" }, [
        UI.Text({ text: label, fontSize: 13, fontWeight: "bold", color: C.txt, key: k + "l" })
      ]),
      UI.Card({
        containerColor: "#FAFAFA", shape: { type: "rounded", cornerRadius: 8 },
        elevation: 0, key: k + "fc"
      }, UI.Box({ width: 100, key: k + "fw" },
        UI.TextField({
          value: value, onValueChange: function(v) { setter(v); },
          singleLine: true, key: k + "tf"
        })
      )),
      UI.Box({
        width: 28, height: 28, key: k + "cv",
        modifier: Modifier.background(value, { type: "circle" }).border(1, C.brd, { type: "circle" })
          .clickable(function() { setCpTarget(k); setPopup("colorPicker"); })
      })
    ]);
  }

  // ==================== 弹窗系统 ====================
  function overlayWrap(content, key) {
    return UI.Box({
      fillMaxSize: true, contentAlignment: "bottomCenter", key: key + "_ov",
      modifier: Modifier.background(C.overlay).clickable(close)
    }, UI.Box({
      fillMaxWidth: true, padding: { start: 12, end: 12, bottom: 12 }, key: key + "_pw"
    }, UI.Card({
      containerColor: C.card, shape: { type: "rounded", cornerRadius: 24 },
      elevation: 8, fillMaxWidth: true, padding: 24, key: key + "_c",
      modifier: Modifier.clickable(function() {})
    }, UI.Column({ spacing: 8, fillMaxWidth: true }, content))));
  }

  function closeBtn(k) {
    return UI.Box({
      key: k, width: 28, height: 28, contentAlignment: "center",
      modifier: Modifier.background("#F0F0F0", { type: "circle" }).clickable(close)
    }, UI.Text({ text: "x", fontSize: 13, color: C.sec, key: k + "t" }));
  }

  // ---- 日详情弹窗 ----
  function popDetail() {
    if (popup !== "detail" || !selDay) return null;
    var ds = ms + "-" + String(selDay).padStart(2, "0");
    var c = [];

    c.push(UI.Row({ fillMaxWidth: true, horizontalArrangement: "spaceBetween", verticalAlignment: "center", key: "dh" }, [
      UI.Text({ text: year + "." + String(month).padStart(2, "0") + "." + String(selDay).padStart(2, "0"), fontSize: 18, fontWeight: "bold", color: C.txt, key: "dd" }),
      closeBtn("dx")
    ]));
    c.push(UI.Spacer({ height: 4, key: "ds0" }));

    if (tab === 0) {
      // ---- 心情 tab 详情 ----
      var rec = moods.records[ds];
      if (rec && (rec.user || rec.ai)) {
        if (rec.user) {
          c.push(UI.Row({ spacing: 10, verticalAlignment: "center", key: "du" }, [
            UI.Image({ url: MOOD_ICONS_USER[rec.user.mood], contentDescription: MOOD_LABELS[rec.user.mood] || "", contentScale: "fit", width: 36, height: 36, key: "dui" }),
            UI.Text({ text: "我：" + (MOOD_LABELS[rec.user.mood] || rec.user.mood), fontSize: 14, color: C.txt, key: "dum" })
          ]));
          if (rec.user.note) {
            c.push(UI.Card({ containerColor: "#FFF5F0", shape: { type: "rounded", cornerRadius: 10 }, elevation: 0, fillMaxWidth: true, padding: 10, key: "dunc" },
              UI.Text({ text: rec.user.note, fontSize: 12, color: C.sec, key: "dunt" })));
          }
        }
        if (rec.ai) {
          c.push(UI.Spacer({ height: 4, key: "ds2a" }));
          c.push(UI.Row({ spacing: 10, verticalAlignment: "center", key: "da" }, [
            UI.Image({ url: MOOD_ICONS_AI[rec.ai.mood], contentDescription: MOOD_LABELS[rec.ai.mood] || "", contentScale: "fit", width: 36, height: 36, key: "dai" }),
            UI.Text({ text: "TA：" + (MOOD_LABELS[rec.ai.mood] || rec.ai.mood), fontSize: 14, color: C.txt, key: "dam" })
          ]));
          if (rec.ai.note) {
            c.push(UI.Card({ containerColor: "#F0F5FF", shape: { type: "rounded", cornerRadius: 10 }, elevation: 0, fillMaxWidth: true, padding: 10, key: "danc" },
              UI.Text({ text: rec.ai.note, fontSize: 12, color: C.sec, key: "dant" })));
          }
        }
      } else {
        c.push(UI.Text({ text: "这天还没有心情记录", fontSize: 13, color: C.light, key: "dnr" }));
      }
      c.push(UI.Spacer({ height: 8, key: "ds3" }));
      var mBtns = [
        UI.Box({
          key: "drb", contentAlignment: "center",
          modifier: Modifier.weight(1).background(C.pri, { type: "pill" }).clickable(function() { setPopup("record"); })
        }, UI.Box({ padding: { top: 10, bottom: 10 }, key: "drbi" },
          UI.Text({ text: "记录心情", fontSize: 12, fontWeight: "bold", color: C.white, key: "drbt" })
        ))
      ];
      if (rec && (rec.user || rec.ai)) {
        mBtns.push(UI.Box({
          key: "ddb", contentAlignment: "center",
          modifier: Modifier.weight(1).background("#FFEBEE", { type: "pill" }).clickable(deleteMoodAsync)
        }, UI.Box({ padding: { top: 10, bottom: 10 }, key: "ddbi" },
          UI.Text({ text: "删除心情", fontSize: 12, fontWeight: "bold", color: "#FF4444", key: "ddbt" })
        )));
      }
      c.push(UI.Row({ fillMaxWidth: true, spacing: 6, key: "dacts" }, mBtns));

    } else if (tab === 1) {
      // ---- 经期 tab 详情 ----
      var phaseInfo = getPhase(ds);
      var pdRec = pdtData.records && pdtData.records[ds];
      var sickRec = sickData.records && sickData.records[ds];
      var isPer = false;
      for (var pi3 = 0; pi3 < periods.periods.length; pi3++) {
        var pp = periods.periods[pi3];
        var ppEnd = pp.end_date || "9999-12-31";
        if (ds >= pp.start_date && ds <= ppEnd) { isPer = true; break; }
      }

      if (phaseInfo) {
        c.push(UI.Row({ spacing: 6, verticalAlignment: "center", key: "dphi" }, [
          UI.Box({ width: 8, height: 8, key: "dphd", modifier: Modifier.background(phaseInfo.color, { type: "circle" }) }),
          UI.Text({ text: phaseInfo.label + (phaseInfo.predicted ? "（预测）" : ""), fontSize: 14, fontWeight: "bold", color: phaseInfo.color, key: "dph" })
        ]));
      }

      if (pdRec) {
        c.push(UI.Spacer({ height: 4, key: "dspd" }));
        c.push(UI.Text({ text: "经期详情", fontSize: 12, color: C.light, key: "pdlbl" }));
        var pdItems = [];
        if (pdRec.flow) {
          pdItems.push(UI.Box({
            key: "pdfi", contentAlignment: "center",
            modifier: Modifier.background(FLOW_COLORS[pdRec.flow] || "#F5F0EE", { type: "pill" })
          }, UI.Box({ padding: { start: 10, end: 10, top: 4, bottom: 4 }, key: "pdfii" },
            UI.Text({ text: FLOW_LABELS[pdRec.flow] || pdRec.flow, fontSize: 11, color: "#FFF", key: "pdfit" })
          )));
        }
        if (pdRec.color) {
          pdItems.push(UI.Row({ spacing: 4, verticalAlignment: "center", key: "pdci" }, [
            UI.Box({ width: 12, height: 12, key: "pdcid", modifier: Modifier.background(COLOR_HEX[pdRec.color] || "#CCC", { type: "circle" }) }),
            UI.Text({ text: COLOR_LABELS[pdRec.color] || pdRec.color, fontSize: 11, color: C.sec, key: "pdcit" })
          ]));
        }
        if (pdRec.pain !== null && pdRec.pain !== undefined) {
          pdItems.push(UI.Text({ text: "疼痛：" + PAIN_LABELS[pdRec.pain], fontSize: 11, color: C.sec, key: "pdpni" }));
        }
        if (pdItems.length > 0) c.push(UI.Row({ spacing: 8, fillMaxWidth: true, verticalAlignment: "center", key: "pdir" }, pdItems));
        if (pdRec.symptoms && pdRec.symptoms.length > 0) {
          c.push(UI.Text({ text: "症状：" + pdRec.symptoms.map(function(s) { return SYMPTOM_LABELS[s] || s; }).join("、"), fontSize: 11, color: C.sec, key: "pdsi" }));
        }
        if (pdRec.note) c.push(UI.Text({ text: "备注：" + pdRec.note, fontSize: 11, color: C.sec, key: "pdni" }));
      }

      if (sickRec) {
        c.push(UI.Spacer({ height: 4, key: "dssk" }));
        c.push(UI.Card({
          containerColor: "#FFF3E0", shape: { type: "rounded", cornerRadius: 10 },
          elevation: 0, fillMaxWidth: true, padding: 10, key: "skc"
        }, UI.Column({ spacing: 2, key: "skcol" }, [
          UI.Text({ text: "生病记录", fontSize: 12, fontWeight: "bold", color: "#E65100", key: "sklt" }),
          UI.Text({ text: sickRec.note, fontSize: 11, color: C.sec, key: "sknt" })
        ])));
      }

      c.push(UI.Spacer({ height: 8, key: "ds5" }));
      // 经期操作按钮
      var pBtns = [];
      pBtns.push(UI.Box({
        key: "dps", contentAlignment: "center",
        modifier: Modifier.weight(1).background(PH.menBg, { type: "pill" }).clickable(function() { savePeriodMark("start"); })
      }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "dpsi" },
        UI.Text({ text: "标记开始", fontSize: 11, fontWeight: "bold", color: PH.men, key: "dpst" })
      )));
      pBtns.push(UI.Box({
        key: "dpe", contentAlignment: "center",
        modifier: Modifier.weight(1).background(PH.ovuBg, { type: "pill" }).clickable(function() { savePeriodMark("end"); })
      }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "dpei" },
        UI.Text({ text: "标记结束", fontSize: 11, fontWeight: "bold", color: PH.ovu, key: "dpet" })
      )));
      c.push(UI.Row({ fillMaxWidth: true, spacing: 6, key: "dacts1" }, pBtns));

      var pBtns2 = [];
      pBtns2.push(UI.Box({
        key: "dpdr", contentAlignment: "center",
        modifier: Modifier.weight(1).background(C.priL, { type: "pill" }).clickable(openPdPopup)
      }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "dpdri" },
        UI.Text({ text: "记录详情", fontSize: 11, color: C.pri, key: "dpdrt" })
      )));
      if (isPer) {
        pBtns2.push(UI.Box({
          key: "dpd", contentAlignment: "center",
          modifier: Modifier.weight(1).background("#FFEBEE", { type: "pill" }).clickable(deletePeriodAsync)
        }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "dpdi" },
          UI.Text({ text: "删除标记", fontSize: 11, color: "#FF4444", key: "dpdt" })
        )));
      }
      // 经期详情删除按钮
      if (pdRec) {
        pBtns2.push(UI.Box({
          key: "dpdel", contentAlignment: "center",
          modifier: Modifier.weight(1).background("#FFEBEE", { type: "pill" }).clickable(deletePdtAsync)
        }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "dpdeli" },
          UI.Text({ text: "删除详情", fontSize: 11, color: "#FF4444", key: "dpdelt" })
        )));
      }
      c.push(UI.Spacer({ height: 4, key: "ds6" }));
      c.push(UI.Row({ fillMaxWidth: true, spacing: 6, key: "dacts2" }, pBtns2));

      // 生病操作
      var skBtns = [];
      if (sickRec) {
        skBtns.push(UI.Box({
          key: "dskd", contentAlignment: "center",
          modifier: Modifier.weight(1).background("#FFF3E0", { type: "pill" }).clickable(deleteSickAsync)
        }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "dskdi" },
          UI.Text({ text: "删除生病记录", fontSize: 11, color: "#E65100", key: "dskdt" })
        )));
      } else {
        skBtns.push(UI.Box({
          key: "dskr", contentAlignment: "center",
          modifier: Modifier.weight(1).background("#FFF3E0", { type: "pill" }).clickable(function() { setPopup("recordSick"); })
        }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "dskri" },
          UI.Text({ text: "记录生病", fontSize: 11, color: "#E65100", key: "dskrt" })
        )));
      }
      c.push(UI.Spacer({ height: 4, key: "ds7" }));
      c.push(UI.Row({ fillMaxWidth: true, spacing: 6, key: "dacts3" }, skBtns));

    } else if (tab === 2) {
      // ---- 日程 tab 详情 ----
      var annInfo = getAnnForDay(selDay);
      var dayEvts = schedData.events && schedData.events[ds] ? schedData.events[ds] : [];
      var dayCrs = getCoursesForDate(ds);

      if (annInfo) {
        c.push(UI.Card({
          containerColor: "#FFF0F5", shape: { type: "rounded", cornerRadius: 10 },
          elevation: 0, fillMaxWidth: true, padding: 10, key: "dannc"
        }, UI.Text({ text: annInfo.label, fontSize: 13, fontWeight: "bold", color: "#E91E63", key: "dannt" })));
        c.push(UI.Spacer({ height: 4, key: "dsann" }));
      }

      // 当天课程
      if (dayCrs.length > 0) {
        for (var dci = 0; dci < dayCrs.length; dci++) {
          var dcr = dayCrs[dci];
          c.push(UI.Row({ spacing: 8, fillMaxWidth: true, verticalAlignment: "center", key: "dcri" + dci }, [
            UI.Box({ width: 4, height: 30, key: "dcrd" + dci, modifier: Modifier.background(C.acc, { type: "pill" }) }),
            UI.Column({ modifier: Modifier.weight(1), key: "dcrc" + dci }, [
              UI.Text({ text: dcr.name + "  第" + dcr.start_period + "-" + dcr.end_period + "节", fontSize: 13, color: C.txt, key: "dcrn" + dci }),
              dcr.location ? UI.Text({ text: dcr.location + (dcr.teacher ? " · " + dcr.teacher : ""), fontSize: 11, color: C.sec, key: "dcrl" + dci }) : UI.Spacer({ height: 0, key: "dcrls" + dci })
            ])
          ]));
        }
        c.push(UI.Spacer({ height: 4, key: "dcrspc" }));
      }

      if (dayEvts.length === 0 && dayCrs.length === 0 && !annInfo) {
        c.push(UI.Text({ text: "这天没有日程安排", fontSize: 13, color: C.light, key: "dne" }));
      } else {
        for (var dei = 0; dei < dayEvts.length; dei++) {
          (function(evt, idx) {
            var evtColor = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS.other;
            var evtInfo = evt.title;
            if (evt.start_time) evtInfo += "  " + evt.start_time + (evt.end_time ? "-" + evt.end_time : "");
            c.push(UI.Row({ spacing: 8, fillMaxWidth: true, verticalAlignment: "center", key: "dei" + idx }, [
              UI.Box({ width: 4, height: 30, key: "ded" + idx, modifier: Modifier.background(evtColor, { type: "pill" }) }),
              UI.Column({ modifier: Modifier.weight(1), key: "dec" + idx }, [
                UI.Row({ spacing: 6, verticalAlignment: "center", key: "decr" + idx }, [
                  UI.Box({
                    key: "decc" + idx, contentAlignment: "center",
                    modifier: Modifier.background(evtColor + "22", { type: "pill" })
                  }, UI.Box({ padding: { start: 6, end: 6, top: 2, bottom: 2 }, key: "decci" + idx },
                    UI.Text({ text: CATEGORY_LABELS[evt.category] || "其他", fontSize: 9, color: evtColor, key: "decct" + idx })
                  )),
                  UI.Text({ text: evtInfo, fontSize: 13, color: C.txt, key: "det" + idx })
                ]),
                evt.location ? UI.Text({ text: evt.location, fontSize: 11, color: C.sec, key: "del" + idx }) : UI.Spacer({ height: 0, key: "dels" + idx }),
                evt.note ? UI.Text({ text: evt.note, fontSize: 11, color: C.sec, key: "den" + idx }) : UI.Spacer({ height: 0, key: "dens" + idx })
              ]),
              UI.Box({
                key: "ded2" + idx, width: 24, height: 24, contentAlignment: "center",
                modifier: Modifier.background("#FFEBEE", { type: "circle" }).clickable(function() { deleteScheduleByIdx(ds, idx); })
              }, UI.Text({ text: "x", fontSize: 11, color: "#FF4444", key: "dedt" + idx }))
            ]));
          })(dayEvts[dei], dei);
        }
      }

      c.push(UI.Spacer({ height: 8, key: "ds8" }));
      c.push(UI.Box({
        fillMaxWidth: true, contentAlignment: "center", key: "dasb",
        modifier: Modifier.background(C.pri, { type: "pill" }).clickable(function() { setPopup("addSchedule"); })
      }, UI.Box({ padding: { top: 10, bottom: 10 }, key: "dasbi" },
        UI.Text({ text: "添加日程", fontSize: 13, fontWeight: "bold", color: C.white, key: "dasbt" })
      )));
    }

    c.push(UI.Spacer({ height: 4, key: "ds9" }));
    c.push(UI.Box({
      fillMaxWidth: true, contentAlignment: "center", key: "dcb",
      modifier: Modifier.clickable(close)
    }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "dcbi" },
      UI.Text({ text: "关闭", fontSize: 12, color: C.sec, key: "dcbt" })
    )));

    return overlayWrap(c, "det");
  }

  // ---- 记录心情弹窗（2x4）----
  function popRecord() {
    if (popup !== "record") return null;
    var targetDay = selDay || TD;
    var c = [];
    c.push(UI.Row({ fillMaxWidth: true, horizontalArrangement: "spaceBetween", verticalAlignment: "center", key: "rth" }, [
      UI.Text({ text: "记录心情", fontSize: 18, fontWeight: "bold", color: C.txt, key: "rt" }),
      closeBtn("rx")
    ]));
    c.push(UI.Text({ text: year + "年" + month + "月" + targetDay + "日", fontSize: 12, color: C.sec, key: "rs" }));
    c.push(UI.Spacer({ height: 12, key: "rs1" }));

    for (var row = 0; row < 2; row++) {
      var rowItems = [];
      for (var col = 0; col < 4; col++) {
        var idx = row * 4 + col;
        (function(m, s) {
          rowItems.push(UI.Column({
            horizontalAlignment: "center", spacing: 4, key: "m" + m,
            modifier: Modifier.weight(1)
              .background(s ? C.priL : "transparent", { type: "rounded", cornerRadius: 12 })
              .border(s ? 1.5 : 0, s ? C.pri : "transparent", { type: "rounded", cornerRadius: 12 })
              .clickable(function() { setRecMood(m); })
          }, [
            UI.Spacer({ height: 4, key: "ms" + m }),
            UI.Image({ url: MOOD_ICONS_USER[m], contentDescription: MOOD_LABELS[m] || "", contentScale: "fit", width: 40, height: 40, key: "mi" + m }),
            UI.Text({ text: MOOD_LABELS[m], fontSize: 11, color: s ? C.pri : C.sec, key: "ml" + m }),
            UI.Spacer({ height: 4, key: "me" + m })
          ]));
        })(MOOD_TYPES[idx], recMood === MOOD_TYPES[idx]);
      }
      c.push(UI.Row({ fillMaxWidth: true, spacing: 6, key: "mr" + row }, rowItems));
      if (row < 1) c.push(UI.Spacer({ height: 4, key: "mrs" + row }));
    }

    c.push(UI.Spacer({ height: 10, key: "rs3" }));
    c.push(UI.Card({
      containerColor: "#FAFAFA", shape: { type: "rounded", cornerRadius: 14 },
      elevation: 0, fillMaxWidth: true, border: { width: 1, color: C.brd }, key: "rntfc"
    }, UI.TextField({
      value: recNote, onValueChange: function(v) { setRecNote(v); },
      placeholder: "写点什么吧...", singleLine: false, maxLines: 3, fillMaxWidth: true, key: "rntf"
    })));
    c.push(UI.Spacer({ height: 12, key: "rs3b" }));
    c.push(UI.Box({
      fillMaxWidth: true, contentAlignment: "center", key: "rsb",
      modifier: Modifier.background(recMood ? C.pri : C.light, { type: "pill" })
        .clickable(function() { if (recMood) saveMood(recMood); })
    }, UI.Box({ padding: { top: 12, bottom: 12 }, key: "rsbi" },
      UI.Text({ text: "保存", fontSize: 14, fontWeight: "bold", color: C.white, key: "rsbt" })
    )));
    c.push(UI.Spacer({ height: 6, key: "rs4" }));
    c.push(UI.Box({ fillMaxWidth: true, contentAlignment: "center", key: "rcb", modifier: Modifier.clickable(close) },
      UI.Box({ padding: { top: 8, bottom: 8 }, key: "rcbi" },
        UI.Text({ text: "取消", fontSize: 13, color: C.sec, key: "rcbt" })
    )));
    return overlayWrap(c, "rec");
  }

  // ---- 记录生病弹窗 ----
  function popRecordSick() {
    if (popup !== "recordSick") return null;
    var targetDay = selDay || TD;
    var c = [];
    c.push(UI.Row({ fillMaxWidth: true, horizontalArrangement: "spaceBetween", verticalAlignment: "center", key: "skth" }, [
      UI.Text({ text: "记录生病", fontSize: 18, fontWeight: "bold", color: C.txt, key: "skt" }),
      closeBtn("skx")
    ]));
    c.push(UI.Text({ text: year + "年" + month + "月" + targetDay + "日", fontSize: 12, color: C.sec, key: "sks" }));
    c.push(UI.Spacer({ height: 12, key: "sks1" }));
    c.push(UI.Card({
      containerColor: "#FAFAFA", shape: { type: "rounded", cornerRadius: 14 },
      elevation: 0, fillMaxWidth: true, border: { width: 1, color: C.brd }, key: "skntfc"
    }, UI.TextField({
      value: sickNote, onValueChange: function(v) { setSickNote(v); },
      placeholder: "描述症状，如喉咙痛、发烧...",
      singleLine: false, maxLines: 3, fillMaxWidth: true, key: "skntf"
    })));
    c.push(UI.Spacer({ height: 12, key: "sks2" }));
    c.push(UI.Box({
      fillMaxWidth: true, contentAlignment: "center", key: "sksb",
      modifier: Modifier.background(sickNote && sickNote.trim() ? C.pri : C.light, { type: "pill" }).clickable(saveSick)
    }, UI.Box({ padding: { top: 12, bottom: 12 }, key: "sksbi" },
      UI.Text({ text: "保存", fontSize: 14, fontWeight: "bold", color: C.white, key: "sksbt" })
    )));
    c.push(UI.Spacer({ height: 6, key: "sks3" }));
    c.push(UI.Box({ fillMaxWidth: true, contentAlignment: "center", key: "skcb", modifier: Modifier.clickable(close) },
      UI.Box({ padding: { top: 8, bottom: 8 }, key: "skcbi" },
        UI.Text({ text: "取消", fontSize: 13, color: C.sec, key: "skcbt" })
    )));
    return overlayWrap(c, "sk");
  }

  // ---- 经期详情弹窗 ----
  function popPeriodDetail() {
    if (popup !== "periodDetail") return null;
    var targetDay = selDay || TD;
    var c = [];
    c.push(UI.Row({ fillMaxWidth: true, horizontalArrangement: "spaceBetween", verticalAlignment: "center", key: "pdth" }, [
      UI.Text({ text: "经期详情", fontSize: 18, fontWeight: "bold", color: C.txt, key: "pdtt" }),
      closeBtn("pdx")
    ]));
    c.push(UI.Text({ text: year + "年" + month + "月" + targetDay + "日", fontSize: 12, color: C.sec, key: "pdts" }));
    c.push(UI.Spacer({ height: 12, key: "pd1" }));

    // 经血量
    c.push(UI.Text({ text: "经血量", fontSize: 13, fontWeight: "bold", color: C.txt, key: "pdfl" }));
    c.push(UI.Spacer({ height: 6, key: "pd2" }));
    var flowKeys = ["light", "medium", "heavy"];
    var flowChips = [];
    for (var fi = 0; fi < flowKeys.length; fi++) {
      (function(fk) {
        var sel = pdFlow === fk;
        flowChips.push(UI.Box({
          key: "fl" + fk, contentAlignment: "center",
          modifier: Modifier.weight(1).background(sel ? FLOW_COLORS[fk] : "#F5F0EE", { type: "pill" })
            .clickable(function() { setPdFlow(sel ? "" : fk); })
        }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "fli" + fk },
          UI.Text({ text: FLOW_LABELS[fk], fontSize: 12, color: sel ? "#FFF" : C.txt, key: "flt" + fk })
        )));
      })(flowKeys[fi]);
    }
    c.push(UI.Row({ fillMaxWidth: true, spacing: 8, key: "flr" }, flowChips));
    c.push(UI.Spacer({ height: 12, key: "pd3" }));

    // 颜色
    c.push(UI.Text({ text: "颜色", fontSize: 13, fontWeight: "bold", color: C.txt, key: "pdcl" }));
    c.push(UI.Spacer({ height: 6, key: "pd4" }));
    var colorKeys = ["bright_red", "dark_red", "brown", "pink"];
    var colorChips = [];
    for (var ci3 = 0; ci3 < colorKeys.length; ci3++) {
      (function(ck) {
        var sel = pdColor === ck;
        colorChips.push(UI.Column({
          horizontalAlignment: "center", spacing: 4, key: "cl" + ck,
          modifier: Modifier.weight(1)
            .background(sel ? "#FFF0ED" : "transparent", { type: "rounded", cornerRadius: 10 })
            .border(sel ? 1.5 : 0, sel ? COLOR_HEX[ck] : "transparent", { type: "rounded", cornerRadius: 10 })
            .clickable(function() { setPdColor(sel ? "" : ck); })
        }, [
          UI.Spacer({ height: 4, key: "cls" + ck }),
          UI.Box({ width: 24, height: 24, key: "cld" + ck, modifier: Modifier.background(COLOR_HEX[ck], { type: "circle" }) }),
          UI.Text({ text: COLOR_LABELS[ck], fontSize: 10, color: sel ? COLOR_HEX[ck] : C.sec, key: "clt" + ck }),
          UI.Spacer({ height: 4, key: "cle" + ck })
        ]));
      })(colorKeys[ci3]);
    }
    c.push(UI.Row({ fillMaxWidth: true, spacing: 6, key: "clr" }, colorChips));
    c.push(UI.Spacer({ height: 12, key: "pd5" }));

    // 疼痛程度
    c.push(UI.Text({ text: "疼痛程度", fontSize: 13, fontWeight: "bold", color: C.txt, key: "pdpl" }));
    c.push(UI.Spacer({ height: 6, key: "pd6" }));
    var painChips = [];
    for (var pai = 0; pai <= 4; pai++) {
      (function(pv) {
        var sel = pdPain === pv;
        painChips.push(UI.Box({
          key: "pn" + pv, contentAlignment: "center",
          modifier: Modifier.weight(1).background(sel ? C.pri : "#F5F0EE", { type: "pill" })
            .clickable(function() { setPdPain(sel ? -1 : pv); })
        }, UI.Box({ padding: { top: 6, bottom: 6 }, key: "pni" + pv },
          UI.Text({ text: PAIN_LABELS[pv], fontSize: 10, color: sel ? "#FFF" : C.txt, key: "pnl" + pv })
        )));
      })(pai);
    }
    c.push(UI.Row({ fillMaxWidth: true, spacing: 4, key: "pnr" }, painChips));
    c.push(UI.Spacer({ height: 12, key: "pd7" }));

    // 伴随症状
    c.push(UI.Text({ text: "伴随症状（可多选）", fontSize: 13, fontWeight: "bold", color: C.txt, key: "pdsyl" }));
    c.push(UI.Spacer({ height: 6, key: "pd8" }));
    function mkSympRow(startIdx, endIdx, rowKey) {
      var chips = [];
      for (var si = startIdx; si < endIdx; si++) {
        (function(sk) {
          var sympArr = pdSymp ? pdSymp.split(",").filter(function(x) { return x.length > 0; }) : [];
          var sel = sympArr.indexOf(sk) >= 0;
          chips.push(UI.Box({
            key: "sy" + sk, contentAlignment: "center",
            modifier: Modifier.weight(1).background(sel ? "#FFE0E0" : "#F5F0EE", { type: "pill" })
              .border(sel ? 1 : 0, sel ? PH.men : "transparent", { type: "pill" })
              .clickable(function() {
                var arr = pdSymp ? pdSymp.split(",").filter(function(x) { return x.length > 0; }) : [];
                var idx = arr.indexOf(sk);
                if (idx >= 0) arr.splice(idx, 1); else arr.push(sk);
                setPdSymp(arr.join(","));
              })
          }, UI.Box({ padding: { top: 6, bottom: 6 }, key: "syi" + sk },
            UI.Text({ text: SYMPTOM_LABELS[sk], fontSize: 10, color: sel ? PH.men : C.txt, key: "syt" + sk })
          )));
        })(SYMPTOM_TYPES[si]);
      }
      return UI.Row({ fillMaxWidth: true, spacing: 4, key: rowKey }, chips);
    }
    c.push(mkSympRow(0, 4, "syr1"));
    c.push(UI.Spacer({ height: 4, key: "pd9" }));
    c.push(mkSympRow(4, 8, "syr2"));
    c.push(UI.Spacer({ height: 10, key: "pd10" }));

    // 备注
    c.push(UI.Card({
      containerColor: "#FAFAFA", shape: { type: "rounded", cornerRadius: 14 },
      elevation: 0, fillMaxWidth: true, border: { width: 1, color: C.brd }, key: "pdntfc"
    }, UI.TextField({
      value: pdNoteVal, onValueChange: function(v) { setPdNoteVal(v); },
      placeholder: "其他备注...（可选）", singleLine: false, maxLines: 3, fillMaxWidth: true, key: "pdntf"
    })));
    c.push(UI.Spacer({ height: 12, key: "pd11" }));

    // 保存 + 删除按钮
    c.push(UI.Row({ fillMaxWidth: true, spacing: 8, key: "pdbtnr" }, [
      UI.Box({
        key: "pdsb", contentAlignment: "center",
        modifier: Modifier.weight(1).background(C.pri, { type: "pill" }).clickable(savePeriodDetail)
      }, UI.Box({ padding: { top: 12, bottom: 12 }, key: "pdsbi" },
        UI.Text({ text: "保存详情", fontSize: 14, fontWeight: "bold", color: C.white, key: "pdsbt" })
      )),
      UI.Box({
        key: "pddelb", contentAlignment: "center",
        modifier: Modifier.weight(1).background("#FFEBEE", { type: "pill" }).clickable(deletePdtAsync)
      }, UI.Box({ padding: { top: 12, bottom: 12 }, key: "pddelbi" },
        UI.Text({ text: "删除记录", fontSize: 14, fontWeight: "bold", color: "#FF4444", key: "pddelbt" })
      ))
    ]));
    c.push(UI.Spacer({ height: 6, key: "pd12" }));
    c.push(UI.Box({ fillMaxWidth: true, contentAlignment: "center", key: "pdcb", modifier: Modifier.clickable(close) },
      UI.Box({ padding: { top: 8, bottom: 8 }, key: "pdcbi" },
        UI.Text({ text: "取消", fontSize: 13, color: C.sec, key: "pdcbt" })
    )));
    return overlayWrap(c, "pdl");
  }

  // ---- 添加日程弹窗（含分类）----
  function popAddSchedule() {
    if (popup !== "addSchedule") return null;
    var targetDay = selDay || TD;
    var c = [];
    c.push(UI.Row({ fillMaxWidth: true, horizontalArrangement: "spaceBetween", verticalAlignment: "center", key: "asth" }, [
      UI.Text({ text: "添加日程", fontSize: 18, fontWeight: "bold", color: C.txt, key: "astt" }),
      closeBtn("asx")
    ]));
    c.push(UI.Spacer({ height: 12, key: "as1" }));

    // 日程名称
    c.push(UI.Text({ text: "日程名称", fontSize: 13, fontWeight: "bold", color: C.txt, key: "astl" }));
    c.push(UI.Card({
      containerColor: "#FAFAFA", shape: { type: "rounded", cornerRadius: 10 },
      elevation: 0, fillMaxWidth: true, border: { width: 1, color: C.brd }, key: "asttfc"
    }, UI.TextField({
      value: schTitle, onValueChange: function(v) { setSchTitle(v); },
      placeholder: "例：考试、聚会、约会...", singleLine: true, fillMaxWidth: true, key: "astttf"
    })));
    c.push(UI.Spacer({ height: 8, key: "as1b" }));

    // 分类选择
    c.push(UI.Text({ text: "分类", fontSize: 13, fontWeight: "bold", color: C.txt, key: "ascatl" }));
    c.push(UI.Spacer({ height: 4, key: "as1c" }));
    var catRow1 = [], catRow2 = [];
    for (var sci = 0; sci < SCHEDULE_CATEGORIES.length; sci++) {
      (function(cat) {
        var sel = schCat === cat;
        var chip = UI.Box({
          key: "scc" + cat, contentAlignment: "center",
          modifier: Modifier.weight(1)
            .background(sel ? CATEGORY_COLORS[cat] : "#F5F0EE", { type: "pill" })
            .clickable(function() { setSchCat(cat); })
        }, UI.Box({ padding: { top: 6, bottom: 6 }, key: "scci" + cat },
          UI.Text({ text: CATEGORY_LABELS[cat], fontSize: 10, color: sel ? "#FFF" : C.txt, key: "scct" + cat })
        ));
        if (sci < 4) catRow1.push(chip); else catRow2.push(chip);
      })(SCHEDULE_CATEGORIES[sci]);
    }
    c.push(UI.Row({ fillMaxWidth: true, spacing: 4, key: "scr1" }, catRow1));
    c.push(UI.Spacer({ height: 4, key: "as1d" }));
    c.push(UI.Row({ fillMaxWidth: true, spacing: 4, key: "scr2" }, catRow2));
    c.push(UI.Spacer({ height: 8, key: "as2" }));

    // 日期
    c.push(UI.Text({ text: "日期", fontSize: 13, fontWeight: "bold", color: C.txt, key: "asdl" }));
    c.push(UI.Card({
      containerColor: "#FAFAFA", shape: { type: "rounded", cornerRadius: 10 },
      elevation: 0, fillMaxWidth: true, padding: { start: 12, end: 12, top: 10, bottom: 10 }, key: "asdc"
    }, UI.Text({ text: year + "/" + String(month).padStart(2, "0") + "/" + String(targetDay).padStart(2, "0"), fontSize: 14, color: C.txt, key: "asdt" })));
    c.push(UI.Spacer({ height: 8, key: "as3" }));

    // 开始/结束时间
    c.push(UI.Row({ fillMaxWidth: true, spacing: 10, key: "astr" }, [
      UI.Column({ modifier: Modifier.weight(1), key: "asstc" }, [
        UI.Text({ text: "开始时间", fontSize: 13, fontWeight: "bold", color: C.txt, key: "asstl" }),
        UI.Card({
          containerColor: "#FAFAFA", shape: { type: "rounded", cornerRadius: 10 },
          elevation: 0, fillMaxWidth: true, border: { width: 1, color: C.brd }, key: "asstfc"
        }, UI.TextField({
          value: schSt, onValueChange: function(v) { setSchSt(v); },
          placeholder: "如 09:00", singleLine: true, fillMaxWidth: true, key: "assttf"
        }))
      ]),
      UI.Column({ modifier: Modifier.weight(1), key: "asetc" }, [
        UI.Text({ text: "结束时间", fontSize: 13, fontWeight: "bold", color: C.txt, key: "asetl" }),
        UI.Card({
          containerColor: "#FAFAFA", shape: { type: "rounded", cornerRadius: 10 },
          elevation: 0, fillMaxWidth: true, border: { width: 1, color: C.brd }, key: "asetfc"
        }, UI.TextField({
          value: schEt, onValueChange: function(v) { setSchEt(v); },
          placeholder: "如 11:00", singleLine: true, fillMaxWidth: true, key: "asettf"
        }))
      ])
    ]));
    c.push(UI.Spacer({ height: 8, key: "as4" }));

    // 地点
    c.push(UI.Text({ text: "地点", fontSize: 13, fontWeight: "bold", color: C.txt, key: "asll" }));
    c.push(UI.Card({
      containerColor: "#FAFAFA", shape: { type: "rounded", cornerRadius: 10 },
      elevation: 0, fillMaxWidth: true, border: { width: 1, color: C.brd }, key: "aslfc"
    }, UI.TextField({
      value: schLoc, onValueChange: function(v) { setSchLoc(v); },
      placeholder: "选填", singleLine: true, fillMaxWidth: true, key: "asltf"
    })));
    c.push(UI.Spacer({ height: 8, key: "as5" }));

    // 备注
    c.push(UI.Text({ text: "备注", fontSize: 13, fontWeight: "bold", color: C.txt, key: "asnl" }));
    c.push(UI.Card({
      containerColor: "#FAFAFA", shape: { type: "rounded", cornerRadius: 10 },
      elevation: 0, fillMaxWidth: true, border: { width: 1, color: C.brd }, key: "asnfc"
    }, UI.TextField({
      value: schNote, onValueChange: function(v) { setSchNote(v); },
      placeholder: "选填", singleLine: false, maxLines: 3, fillMaxWidth: true, key: "asntf"
    })));
    c.push(UI.Spacer({ height: 12, key: "as6" }));

    c.push(UI.Box({
      fillMaxWidth: true, contentAlignment: "center", key: "assb",
      modifier: Modifier.background(schTitle && schTitle.trim() ? C.pri : C.light, { type: "pill" }).clickable(saveSchedule)
    }, UI.Box({ padding: { top: 12, bottom: 12 }, key: "assbi" },
      UI.Text({ text: "保存日程", fontSize: 14, fontWeight: "bold", color: C.white, key: "assbt" })
    )));
    c.push(UI.Spacer({ height: 6, key: "as7" }));
    c.push(UI.Box({ fillMaxWidth: true, contentAlignment: "center", key: "ascb", modifier: Modifier.clickable(close) },
      UI.Box({ padding: { top: 8, bottom: 8 }, key: "ascbi" },
        UI.Text({ text: "取消", fontSize: 13, color: C.sec, key: "ascbt" })
    )));
    return overlayWrap(c, "asc");
  }

  // ---- 课表管理弹窗 ----
  function popCourseList() {
    if (popup !== "courseList") return null;
    var c = [];
    c.push(UI.Row({ fillMaxWidth: true, horizontalArrangement: "spaceBetween", verticalAlignment: "center", key: "clth" }, [
      UI.Text({ text: "我的课表", fontSize: 18, fontWeight: "bold", color: C.txt, key: "cltt" }),
      closeBtn("clx")
    ]));
    c.push(UI.Spacer({ height: 12, key: "cl1" }));

    // 学期开始
    c.push(UI.Row({ fillMaxWidth: true, spacing: 10, verticalAlignment: "center", key: "clsr" }, [
      UI.Text({ text: "学期开始", fontSize: 13, fontWeight: "bold", color: C.txt, key: "clsl" }),
      UI.Card({
        containerColor: "#FAFAFA", shape: { type: "rounded", cornerRadius: 10 },
        elevation: 0, key: "clsfc"
      }, UI.Box({ width: 140, key: "clsfw" },
        UI.TextField({
          value: semStart, onValueChange: function(v) { setSemStart(v); },
          placeholder: "YYYY-MM-DD", singleLine: true, key: "clstf"
        })
      )),
      UI.Box({
        key: "clssv", contentAlignment: "center",
        modifier: Modifier.background(C.priL, { type: "pill" }).clickable(saveSemesterStart)
      }, UI.Box({ padding: { start: 10, end: 10, top: 6, bottom: 6 }, key: "clssi" },
        UI.Text({ text: "保存", fontSize: 11, color: C.pri, key: "clsst" })
      ))
    ]));
    c.push(UI.Spacer({ height: 12, key: "cl2" }));

    // 课程列表
    if (courseData.courses.length === 0) {
      c.push(UI.Text({ text: "还没有添加课程", fontSize: 13, color: C.light, key: "clne" }));
    } else {
      var dayLabels = ["", "一", "二", "三", "四", "五", "六", "日"];
      var wtLabels = { all: "每周", odd: "单周", even: "双周" };
      for (var cli = 0; cli < courseData.courses.length; cli++) {
        (function(cr, idx) {
          c.push(UI.Card({
            containerColor: C.priL, shape: { type: "rounded", cornerRadius: 10 },
            elevation: 0, fillMaxWidth: true, padding: 10, key: "crci" + idx
          }, UI.Row({ fillMaxWidth: true, spacing: 8, verticalAlignment: "center", key: "crcr" + idx }, [
            UI.Column({ modifier: Modifier.weight(1), key: "crcc" + idx }, [
              UI.Text({ text: cr.name, fontSize: 13, fontWeight: "bold", color: C.txt, key: "crcn" + idx }),
              UI.Text({
                text: "星期" + dayLabels[cr.day] + " 第" + cr.start_period + "-" + cr.end_period + "节 " + wtLabels[cr.week_type || "all"] + " 第" + cr.week_start + "-" + cr.week_end + "周",
                fontSize: 11, color: C.sec, key: "crci2" + idx
              }),
              (cr.location || cr.teacher) ? UI.Text({
                text: (cr.location || "") + (cr.teacher ? " · " + cr.teacher : ""),
                fontSize: 11, color: C.sec, key: "crcl" + idx
              }) : UI.Spacer({ height: 0, key: "crcls" + idx })
            ]),
            UI.Box({
              key: "crcd" + idx, width: 24, height: 24, contentAlignment: "center",
              modifier: Modifier.background("#FFEBEE", { type: "circle" }).clickable(function() { deleteCourseById(cr.id); })
            }, UI.Text({ text: "x", fontSize: 11, color: "#FF4444", key: "crcdt" + idx }))
          ])));
        })(courseData.courses[cli], cli);
        if (cli < courseData.courses.length - 1) c.push(UI.Spacer({ height: 6, key: "crsp" + cli }));
      }
    }

    c.push(UI.Spacer({ height: 12, key: "cl3" }));
    c.push(UI.Box({
      fillMaxWidth: true, contentAlignment: "center", key: "clac",
      modifier: Modifier.background(C.pri, { type: "pill" }).clickable(function() { setPopup("addCourse"); })
    }, UI.Box({ padding: { top: 12, bottom: 12 }, key: "claci" },
      UI.Text({ text: "+ 添加课程", fontSize: 14, fontWeight: "bold", color: C.white, key: "clact" })
    )));
    c.push(UI.Spacer({ height: 6, key: "cl4" }));
    c.push(UI.Box({ fillMaxWidth: true, contentAlignment: "center", key: "clcb", modifier: Modifier.clickable(close) },
      UI.Box({ padding: { top: 8, bottom: 8 }, key: "clcbi" },
        UI.Text({ text: "关闭", fontSize: 13, color: C.sec, key: "clcbt" })
    )));
    return overlayWrap(c, "cl");
  }

  // ---- 添加课程弹窗 ----
  function popAddCourse() {
    if (popup !== "addCourse") return null;
    var c = [];
    c.push(UI.Row({ fillMaxWidth: true, horizontalArrangement: "spaceBetween", verticalAlignment: "center", key: "acth" }, [
      UI.Text({ text: "添加课程", fontSize: 18, fontWeight: "bold", color: C.txt, key: "actt" }),
      closeBtn("acx")
    ]));
    c.push(UI.Spacer({ height: 12, key: "ac1" }));

    // 课程名称
    c.push(UI.Text({ text: "课程名称", fontSize: 13, fontWeight: "bold", color: C.txt, key: "acnl" }));
    c.push(UI.Card({
      containerColor: "#FAFAFA", shape: { type: "rounded", cornerRadius: 10 },
      elevation: 0, fillMaxWidth: true, border: { width: 1, color: C.brd }, key: "acnfc"
    }, UI.TextField({
      value: crName, onValueChange: function(v) { setCrName(v); },
      placeholder: "例：数据新闻与信息可视化", singleLine: true, fillMaxWidth: true, key: "acntf"
    })));
    c.push(UI.Spacer({ height: 8, key: "ac2" }));

    // 星期选择
    c.push(UI.Text({ text: "星期", fontSize: 13, fontWeight: "bold", color: C.txt, key: "acdl" }));
    c.push(UI.Spacer({ height: 4, key: "ac2b" }));
    var dayChips = [];
    var dayNames = ["一", "二", "三", "四", "五", "六", "日"];
    for (var di = 0; di < 7; di++) {
      (function(dayIdx) {
        var sel = crDay === (dayIdx + 1);
        dayChips.push(UI.Box({
          key: "acd" + dayIdx, width: 38, height: 38, contentAlignment: "center",
          modifier: Modifier.background(sel ? C.pri : "#F5F0EE", { type: "circle" })
            .clickable(function() { setCrDay(dayIdx + 1); })
        }, UI.Text({ text: dayNames[dayIdx], fontSize: 12, color: sel ? "#FFF" : C.txt, key: "acdt" + dayIdx })));
      })(di);
    }
    c.push(UI.Row({ fillMaxWidth: true, spacing: 4, horizontalArrangement: "center", key: "acdr" }, dayChips));
    c.push(UI.Spacer({ height: 8, key: "ac3" }));

    // 节次
    c.push(UI.Row({ fillMaxWidth: true, spacing: 10, key: "acpr" }, [
      UI.Column({ modifier: Modifier.weight(1), key: "acspc" }, [
        UI.Text({ text: "节次", fontSize: 13, fontWeight: "bold", color: C.txt, key: "acspl" }),
        UI.Row({ spacing: 6, verticalAlignment: "center", key: "acspr" }, [
          UI.Card({
            containerColor: "#FAFAFA", shape: { type: "rounded", cornerRadius: 10 },
            elevation: 0, key: "acspfc"
          }, UI.Box({ width: 50, key: "acspfw" },
            UI.TextField({ value: crSp, onValueChange: function(v) { setCrSp(v); }, placeholder: "起", singleLine: true, key: "acsptf" })
          )),
          UI.Card({
            containerColor: "#FAFAFA", shape: { type: "rounded", cornerRadius: 10 },
            elevation: 0, key: "acepfc"
          }, UI.Box({ width: 50, key: "acepfw" },
            UI.TextField({ value: crEp, onValueChange: function(v) { setCrEp(v); }, placeholder: "止", singleLine: true, key: "aceptf" })
          ))
        ])
      ])
    ]));
    c.push(UI.Spacer({ height: 8, key: "ac4" }));

    // 周数
    c.push(UI.Row({ fillMaxWidth: true, spacing: 10, key: "acwr" }, [
      UI.Column({ modifier: Modifier.weight(1), key: "acwsc" }, [
        UI.Text({ text: "周数起", fontSize: 13, fontWeight: "bold", color: C.txt, key: "acwsl" }),
        UI.Card({
          containerColor: "#FAFAFA", shape: { type: "rounded", cornerRadius: 10 },
          elevation: 0, fillMaxWidth: true, key: "acwsfc"
        }, UI.TextField({ value: crWs, onValueChange: function(v) { setCrWs(v); }, singleLine: true, fillMaxWidth: true, key: "acwstf" }))
      ]),
      UI.Column({ modifier: Modifier.weight(1), key: "acwec" }, [
        UI.Text({ text: "周数止", fontSize: 13, fontWeight: "bold", color: C.txt, key: "acwel" }),
        UI.Card({
          containerColor: "#FAFAFA", shape: { type: "rounded", cornerRadius: 10 },
          elevation: 0, fillMaxWidth: true, key: "acwefc"
        }, UI.TextField({ value: crWe, onValueChange: function(v) { setCrWe(v); }, singleLine: true, fillMaxWidth: true, key: "acwetf" }))
      ])
    ]));
    c.push(UI.Spacer({ height: 8, key: "ac5" }));

    // 周类型（每周/单周/双周）
    var wtChips = [];
    var wtOpts = [["all", "每周"], ["odd", "单周"], ["even", "双周"]];
    for (var wti = 0; wti < wtOpts.length; wti++) {
      (function(wk, wl) {
        var sel = crWt === wk;
        wtChips.push(UI.Box({
          key: "acwt" + wk, contentAlignment: "center",
          modifier: Modifier.weight(1).background(sel ? C.pri : "#F5F0EE", { type: "pill" })
            .clickable(function() { setCrWt(wk); })
        }, UI.Box({ padding: { top: 6, bottom: 6 }, key: "acwti" + wk },
          UI.Text({ text: wl, fontSize: 12, color: sel ? "#FFF" : C.txt, key: "acwtt" + wk })
        )));
      })(wtOpts[wti][0], wtOpts[wti][1]);
    }
    c.push(UI.Row({ fillMaxWidth: true, spacing: 6, key: "acwtr" }, wtChips));
    c.push(UI.Spacer({ height: 8, key: "ac6" }));

    // 教室/地点
    c.push(UI.Text({ text: "教室/地点", fontSize: 13, fontWeight: "bold", color: C.txt, key: "acll" }));
    c.push(UI.Card({
      containerColor: "#FAFAFA", shape: { type: "rounded", cornerRadius: 10 },
      elevation: 0, fillMaxWidth: true, border: { width: 1, color: C.brd }, key: "aclfc"
    }, UI.TextField({
      value: crLoc, onValueChange: function(v) { setCrLoc(v); },
      placeholder: "例：文渊楼411", singleLine: true, fillMaxWidth: true, key: "acltf"
    })));
    c.push(UI.Spacer({ height: 8, key: "ac7" }));

    // 教师
    c.push(UI.Text({ text: "教师", fontSize: 13, fontWeight: "bold", color: C.txt, key: "actl" }));
    c.push(UI.Card({
      containerColor: "#FAFAFA", shape: { type: "rounded", cornerRadius: 10 },
      elevation: 0, fillMaxWidth: true, border: { width: 1, color: C.brd }, key: "actfc"
    }, UI.TextField({
      value: crTch, onValueChange: function(v) { setCrTch(v); },
      placeholder: "选填", singleLine: true, fillMaxWidth: true, key: "acttf"
    })));
    c.push(UI.Spacer({ height: 12, key: "ac8" }));

    c.push(UI.Box({
      fillMaxWidth: true, contentAlignment: "center", key: "acsb",
      modifier: Modifier.background(crName && crName.trim() ? C.pri : C.light, { type: "pill" }).clickable(saveCourse)
    }, UI.Box({ padding: { top: 12, bottom: 12 }, key: "acsbi" },
      UI.Text({ text: "保存课程", fontSize: 14, fontWeight: "bold", color: C.white, key: "acsbt" })
    )));
    c.push(UI.Spacer({ height: 6, key: "ac9" }));
    c.push(UI.Box({ fillMaxWidth: true, contentAlignment: "center", key: "accb", modifier: Modifier.clickable(function() { setPopup("courseList"); }) },
      UI.Box({ padding: { top: 8, bottom: 8 }, key: "accbi" },
        UI.Text({ text: "取消", fontSize: 13, color: C.sec, key: "accbt" })
    )));
    return overlayWrap(c, "ac");
  }

  // ---- 取色器弹窗 ----
  function popColorPicker() {
    if (popup !== "colorPicker" || !cpTarget) return null;
    var c = [];
    c.push(UI.Row({ fillMaxWidth: true, horizontalArrangement: "spaceBetween", verticalAlignment: "center", key: "cpth" }, [
      UI.Text({ text: "选择颜色", fontSize: 18, fontWeight: "bold", color: C.txt, key: "cptt" }),
      closeBtn("cpx")
    ]));
    c.push(UI.Spacer({ height: 12, key: "cp1" }));

    // 颜色网格 6x6
    for (var crow = 0; crow < 6; crow++) {
      var rowItems = [];
      for (var ccol = 0; ccol < 6; ccol++) {
        var cidx = crow * 6 + ccol;
        if (cidx < COLOR_PALETTE.length) {
          (function(hex) {
            rowItems.push(UI.Box({
              key: "cpc" + cidx, width: 40, height: 40, contentAlignment: "center",
              modifier: Modifier.background(hex, { type: "rounded", cornerRadius: 8 })
                .border(1, "#E0E0E0", { type: "rounded", cornerRadius: 8 })
                .clickable(function() {
                  if (cpTarget === "ctbg") setCtBg(hex);
                  else if (cpTarget === "ctpr") setCtPri(hex);
                  else if (cpTarget === "ctsc") setCtSec(hex);
                  else if (cpTarget === "ctac") setCtAcc(hex);
                  setCpTarget(""); setPopup("");
                })
            }));
          })(COLOR_PALETTE[cidx]);
        }
      }
      c.push(UI.Row({ fillMaxWidth: true, spacing: 6, horizontalArrangement: "center", key: "cpr" + crow }, rowItems));
      if (crow < 5) c.push(UI.Spacer({ height: 4, key: "cprs" + crow }));
    }

    c.push(UI.Spacer({ height: 8, key: "cp2" }));
    c.push(UI.Box({ fillMaxWidth: true, contentAlignment: "center", key: "cpcb", modifier: Modifier.clickable(close) },
      UI.Box({ padding: { top: 8, bottom: 8 }, key: "cpcbi" },
        UI.Text({ text: "取消", fontSize: 13, color: C.sec, key: "cpcbt" })
    )));
    return overlayWrap(c, "cp");
  }

  // ---- 年月选择弹窗 ----
  function popPicker() {
    if (popup !== "picker") return null;
    var c = [];
    c.push(UI.Row({
      fillMaxWidth: true, horizontalArrangement: "spaceBetween", verticalAlignment: "center", key: "pyr"
    }, [
      UI.Box({
        key: "pyp", width: 36, height: 36, contentAlignment: "center",
        modifier: Modifier.background("#F5F0EE", { type: "circle" }).clickable(function() { setPYear(pYear - 1); })
      }, UI.Text({ text: "<", fontSize: 16, color: C.sec, key: "pypt" })),
      UI.Text({ text: pYear + "年", fontSize: 20, fontWeight: "bold", color: C.txt, key: "pyt" }),
      UI.Box({
        key: "pyn", width: 36, height: 36, contentAlignment: "center",
        modifier: Modifier.background("#F5F0EE", { type: "circle" }).clickable(function() { setPYear(pYear + 1); })
      }, UI.Text({ text: ">", fontSize: 16, color: C.sec, key: "pynt" }))
    ]));
    c.push(UI.Spacer({ height: 12, key: "ps1" }));
    var mLabels = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
    for (var row = 0; row < 3; row++) {
      var cells = [];
      for (var col = 0; col < 4; col++) {
        var m = row * 4 + col + 1;
        var isCur = pYear === year && m === month;
        var isNow = pYear === TY && m === TM;
        cells.push((function(mm, cur, nw) {
          return UI.Box({
            key: "pm" + mm, contentAlignment: "center",
            modifier: Modifier.weight(1).background(cur ? C.pri : nw ? C.priL : "transparent", { type: "rounded", cornerRadius: 10 })
              .clickable(function() { jumpTo(pYear, mm); })
          }, UI.Box({ padding: { top: 12, bottom: 12 }, key: "pmi" + mm },
            UI.Text({ text: mLabels[mm - 1], fontSize: 14, fontWeight: cur ? "bold" : "normal", color: cur ? C.white : nw ? C.pri : C.txt, key: "pmt" + mm })
          ));
        })(m, isCur, isNow));
      }
      c.push(UI.Row({ fillMaxWidth: true, spacing: 6, key: "pmr" + row }, cells));
    }
    c.push(UI.Spacer({ height: 12, key: "ps2" }));
    c.push(UI.Row({ fillMaxWidth: true, spacing: 10, key: "pacts" }, [
      UI.Box({
        key: "ptb", contentAlignment: "center",
        modifier: Modifier.weight(1).background(C.priL, { type: "pill" }).clickable(goToday)
      }, UI.Box({ padding: { top: 10, bottom: 10 }, key: "ptbi" },
        UI.Text({ text: "回到今天", fontSize: 13, color: C.pri, key: "ptbt" })
      )),
      UI.Box({
        key: "pcb", contentAlignment: "center",
        modifier: Modifier.weight(1).background("#F5F0EE", { type: "pill" }).clickable(close)
      }, UI.Box({ padding: { top: 10, bottom: 10 }, key: "pcbi" },
        UI.Text({ text: "取消", fontSize: 13, color: C.sec, key: "pcbt" })
      ))
    ]));
    return overlayWrap(c, "pk");
  }

  // ---- 周期设置弹窗 ----
  function popSettings() {
    if (popup !== "settings") return null;
    var c = [];
    c.push(UI.Row({ fillMaxWidth: true, horizontalArrangement: "spaceBetween", verticalAlignment: "center", key: "stth" }, [
      UI.Text({ text: "周期设置", fontSize: 18, fontWeight: "bold", color: C.txt, key: "stt" }),
      closeBtn("stx")
    ]));
    c.push(UI.Spacer({ height: 16, key: "ss1" }));
    c.push(UI.Text({ text: "月经周期（天）", fontSize: 13, color: C.sec, key: "scl" }));
    c.push(UI.Spacer({ height: 6, key: "ss2" }));
    c.push(UI.Row({
      fillMaxWidth: true, horizontalArrangement: "center", verticalAlignment: "center", spacing: 20, key: "scr"
    }, [
      UI.Box({
        key: "scm", width: 44, height: 44, contentAlignment: "center",
        modifier: Modifier.background("#F5F0EE", { type: "circle" }).clickable(function() { if (sCycle > 1) setSCycle(sCycle - 1); })
      }, UI.Text({ text: "-", fontSize: 22, color: C.txt, key: "scmt" })),
      UI.Text({ text: String(sCycle), fontSize: 36, fontWeight: "bold", color: C.pri, key: "scv" }),
      UI.Box({
        key: "scp", width: 44, height: 44, contentAlignment: "center",
        modifier: Modifier.background("#F5F0EE", { type: "circle" }).clickable(function() { setSCycle(sCycle + 1); })
      }, UI.Text({ text: "+", fontSize: 22, color: C.txt, key: "scpt" }))
    ]));
    c.push(UI.Spacer({ height: 16, key: "ss3" }));
    c.push(UI.Text({ text: "经期时长（天）", fontSize: 13, color: C.sec, key: "spl" }));
    c.push(UI.Spacer({ height: 6, key: "ss4" }));
    c.push(UI.Row({
      fillMaxWidth: true, horizontalArrangement: "center", verticalAlignment: "center", spacing: 20, key: "spr"
    }, [
      UI.Box({
        key: "spm", width: 44, height: 44, contentAlignment: "center",
        modifier: Modifier.background("#F5F0EE", { type: "circle" }).clickable(function() { if (sPeriod > 1) setSPeriod(sPeriod - 1); })
      }, UI.Text({ text: "-", fontSize: 22, color: C.txt, key: "spmt" })),
      UI.Text({ text: String(sPeriod), fontSize: 36, fontWeight: "bold", color: PH.men, key: "spv" }),
      UI.Box({
        key: "spp", width: 44, height: 44, contentAlignment: "center",
        modifier: Modifier.background("#F5F0EE", { type: "circle" }).clickable(function() { setSPeriod(sPeriod + 1); })
      }, UI.Text({ text: "+", fontSize: 22, color: C.txt, key: "sppt" }))
    ]));
    c.push(UI.Spacer({ height: 20, key: "ss5" }));
    c.push(UI.Box({
      fillMaxWidth: true, contentAlignment: "center", key: "ssb",
      modifier: Modifier.background(C.pri, { type: "pill" }).clickable(saveSettingsFn)
    }, UI.Box({ padding: { top: 12, bottom: 12 }, key: "ssbi" },
      UI.Text({ text: "保存设置", fontSize: 14, fontWeight: "bold", color: C.white, key: "ssbt" })
    )));
    c.push(UI.Spacer({ height: 6, key: "ss6" }));
    c.push(UI.Box({ fillMaxWidth: true, contentAlignment: "center", key: "scnb", modifier: Modifier.clickable(close) },
      UI.Box({ padding: { top: 8, bottom: 8 }, key: "scnbi" },
        UI.Text({ text: "取消", fontSize: 13, color: C.sec, key: "scnbt" })
    )));
    return overlayWrap(c, "st");
  }

  // ==================== 组装 ====================
  var mainItems = [tabBar];

  if (tab < 3) {
    mainItems.push(buildCalendarCard());
    mainItems.push(buildLegend());
  }

  mainItems.push(buildRecordBtn());
  mainItems.push(buildStats());
  mainItems.push(buildPeriodInfo());
  mainItems.push(buildScheduleContent());
  mainItems.push(buildSettingsContent());
  mainItems.push(UI.Spacer({ height: 24, key: "bs" }));

  var mainContent = UI.LazyColumn({
    fillMaxSize: true, padding: 16, spacing: 12, background: C.bg, key: "lc",
    onLoad: async function() { if (!dataLoaded) await loadAllData(); }
  }, mainItems);

  var activePopup = popDetail() || popRecord() || popRecordSick() || popPeriodDetail()
    || popAddSchedule() || popCourseList() || popAddCourse() || popColorPicker()
    || popPicker() || popSettings();
  if (activePopup) {
    return UI.Box({ fillMaxSize: true, key: "root" }, [mainContent, activePopup]);
  }
  return mainContent;
}

exports.default = Screen;
