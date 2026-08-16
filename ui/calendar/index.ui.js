/// <reference path="../../../../types/index.d.ts" />

// ========== 数据路径（不可修改）==========
const DATA_DIR = "/storage/emulated/0/Download/Operit/plugins/iris_calendar/data";
const MOOD_FILE = DATA_DIR + "/mood_data.json";
const PERIOD_FILE = DATA_DIR + "/period_data.json";
const SETTINGS_FILE = DATA_DIR + "/settings.json";
const SICK_FILE = DATA_DIR + "/sick_data.json";
const PIN_FILE = DATA_DIR + "/pin_data.json";
const PERIOD_DETAIL_FILE = DATA_DIR + "/period_detail_data.json";

// ========== 心情定义（9种心情）==========
const MOOD_TYPES = ["happy", "loved", "calm", "tired", "sad", "anxious", "angry", "miss_you", "excited"];
const MOOD_LABELS = {
  happy: "开心", loved: "被爱", calm: "平静", tired: "疲惫", sad: "难过",
  anxious: "焦虑", angry: "生气", miss_you: "想你", excited: "兴奋"
};
const MOOD_COLORS = {
  happy: "#FFD700", loved: "#F2AABA", calm: "#87CEEB", tired: "#A0A0A0", sad: "#6495ED",
  anxious: "#FFA500", angry: "#FF4444", miss_you: "#FF69B4", excited: "#FF6347"
};

// ========== 心情图标 URL（不可修改）==========
const BASE_URL = "https://ndkdgiohgnelvkxgdkjk.supabase.co/storage/v1/object/public/xinqing";
const MOOD_ICONS_USER = {
  happy: BASE_URL + "/happy_circle.png",
  loved: BASE_URL + "/miss_you_circle.png",
  calm: BASE_URL + "/calm_circle.png",
  tired: BASE_URL + "/tired_circle.png",
  sad: BASE_URL + "/sad_circle.png",
  anxious: BASE_URL + "/anxious_circle.png",
  angry: BASE_URL + "/angry_circle.png",
  miss_you: BASE_URL + "/miss_you_circle.png",
  excited: BASE_URL + "/excited_circle.png"
};
const MOOD_ICONS_AI = {
  happy: BASE_URL + "/happy_square.png",
  loved: BASE_URL + "/miss_you_square.png",
  calm: BASE_URL + "/calm_square.png",
  tired: BASE_URL + "/tired_square.png",
  sad: BASE_URL + "/sad_square.png",
  anxious: BASE_URL + "/anxious_square.png",
  angry: BASE_URL + "/angry_square.png",
  miss_you: BASE_URL + "/miss_you_square.png",
  excited: BASE_URL + "/excited_square.png"
};

// ========== 经期详情定义 ==========
const FLOW_LABELS = { light: "少量", medium: "中等", heavy: "大量" };
const FLOW_COLORS = { light: "#FFB74D", medium: "#FF9800", heavy: "#E65100" };
const COLOR_LABELS = { bright_red: "鲜红", dark_red: "暗红", brown: "褐色", pink: "粉色" };
const COLOR_HEX = { bright_red: "#FF1744", dark_red: "#B71C1C", brown: "#795548", pink: "#F48FB1" };
const PAIN_LABELS = ["无痛", "轻微", "中等", "较强", "剧痛"];
const SYMPTOM_TYPES = ["cramps", "backache", "headache", "bloating", "fatigue", "mood_swing", "breast_pain", "acne"];
const SYMPTOM_LABELS = {
  cramps: "痉挛", backache: "腰痛", headache: "头痛", bloating: "腹胀",
  fatigue: "疲劳", mood_swing: "情绪波动", breast_pain: "胸痛", acne: "痘痘"
};

// ========== 异步数据读写（使用 Tools.Files）==========
async function readJsonAsync(path) {
  try {
    var r = await Tools.Files.exists(path);
    if (!r || !r.exists) return null;
    var f = await Tools.Files.read(path);
    if (!f || !f.content) return null;
    return JSON.parse(String(f.content));
  } catch (e) {
    return null;
  }
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

function computePeriodInfo(year, month, periodData, settings) {
  var firstDay = new Date(year, month - 1, 1);
  var lastDay = new Date(year, month, 0);
  var actual = [], predicted = [], ovulation = [];

  for (var idx = 0; idx < periodData.periods.length; idx++) {
    var p = periodData.periods[idx];
    var s = new Date(p.start_date);
    var e = p.end_date ? new Date(p.end_date) : new Date(s.getTime() + (settings.period_length - 1) * 86400000);
    for (var d = new Date(s); d <= e && d <= lastDay; d.setDate(d.getDate() + 1)) {
      if (d >= firstDay) actual.push(d.getDate());
    }
  }

  var completed = [];
  for (var j = periodData.periods.length - 1; j >= 0; j--) {
    if (periodData.periods[j].end_date) { completed.push(periodData.periods[j]); break; }
  }
  if (completed.length > 0) {
    var lc = completed[0];
    var ls = new Date(lc.start_date);
    for (var i = 1; i <= 6; i++) {
      var ps = new Date(ls.getTime() + settings.cycle_length * i * 86400000);
      var pe = new Date(ps.getTime() + (settings.period_length - 1) * 86400000);
      var ov = new Date(ps.getTime() + (settings.cycle_length - 14) * 86400000);
      for (var dd = new Date(ps); dd <= pe && dd <= lastDay; dd.setDate(dd.getDate() + 1)) {
        if (dd >= firstDay && actual.indexOf(dd.getDate()) === -1) predicted.push(dd.getDate());
      }
      if (ov >= firstDay && ov <= lastDay) ovulation.push(ov.getDate());
    }
  }
  return { actual: actual, predicted: predicted, ovulation: ovulation };
}

// ==================== Screen ====================
function Screen(ctx) {
  var UI = ctx.UI;
  var Modifier = ctx.Modifier;
  var now = new Date();
  var TY = now.getFullYear(), TM = now.getMonth() + 1, TD = now.getDate();

  // ======= State =======
  var yearState = ctx.useState("y", TY);
  var year = yearState[0], setYear = yearState[1];
  var monthState = ctx.useState("m", TM);
  var month = monthState[0], setMonth = monthState[1];
  var tabState = ctx.useState("tab", 0);
  var tab = tabState[0], setTab = tabState[1];
  var selDayState = ctx.useState("sd", 0);
  var selDay = selDayState[0], setSelDay = selDayState[1];
  var popupState = ctx.useState("pop", "");
  var popup = popupState[0], setPopup = popupState[1];
  var recMoodState = ctx.useState("rm", "");
  var recMood = recMoodState[0], setRecMood = recMoodState[1];
  var recNoteState = ctx.useState("rn", "");
  var recNote = recNoteState[0], setRecNote = recNoteState[1];
  var pYearState = ctx.useState("py", TY);
  var pYear = pYearState[0], setPYear = pYearState[1];
  var sCycleState = ctx.useState("sc", 28);
  var sCycle = sCycleState[0], setSCycle = sCycleState[1];
  var sPeriodState = ctx.useState("sp", 5);
  var sPeriod = sPeriodState[0], setSPeriod = sPeriodState[1];

  // 数据 State
  var moodsState = ctx.useState("moods", { records: {} });
  var moods = moodsState[0], setMoods = moodsState[1];
  var periodsState = ctx.useState("periods", { periods: [], settings: { cycle_length: 28, period_length: 5 } });
  var periods = periodsState[0], setPeriods = periodsState[1];
  var settState = ctx.useState("sett", { cycle_length: 28, period_length: 5, anniversaries: [] });
  var sett = settState[0], setSett = settState[1];
  var dataLoadedState = ctx.useState("dl", false);
  var dataLoaded = dataLoadedState[0], setDataLoaded = dataLoadedState[1];

  // 新增数据 State
  var sickState = ctx.useState("sick", { records: {} });
  var sickData = sickState[0], setSickData = sickState[1];
  var pinState = ctx.useState("pin", { records: {} });
  var pinData = pinState[0], setPinData = pinState[1];
  var pdtState = ctx.useState("pdt", { records: {} });
  var pdtData = pdtState[0], setPdtData = pdtState[1];

  // 新增弹窗 State
  var sickNoteState = ctx.useState("skn", "");
  var sickNote = sickNoteState[0], setSickNote = sickNoteState[1];
  var pinNoteState = ctx.useState("pnn", "");
  var pinNote = pinNoteState[0], setPinNote = pinNoteState[1];
  var pdFlowState = ctx.useState("pdf", "");
  var pdFlow = pdFlowState[0], setPdFlow = pdFlowState[1];
  var pdColorState = ctx.useState("pdc", "");
  var pdColor = pdColorState[0], setPdColor = pdColorState[1];
  var pdPainState = ctx.useState("pdp", -1);
  var pdPain = pdPainState[0], setPdPain = pdPainState[1];
  var pdSympState = ctx.useState("pds", "");
  var pdSymp = pdSympState[0], setPdSymp = pdSympState[1];
  var pdNoteState = ctx.useState("pdn", "");
  var pdNoteVal = pdNoteState[0], setPdNoteVal = pdNoteState[1];

  // ======= 计算 =======
  var dim = getDaysInMonth(year, month);
  var off = getFirstDayOfWeek(year, month);
  var pi = computePeriodInfo(year, month, periods, sett);
  var ms = year + "-" + String(month).padStart(2, "0");

  // ======= 配色 =======
  var C = {
    bg: "#FFF8F4", card: "#FFFFFF", pri: "#D4837D", priL: "#F5E0DC",
    txt: "#3C3C3C", sec: "#999999", light: "#CCCCCC", white: "#FFFFFF",
    today: "#D4837D", todayBg: "#FFF0ED",
    period: "#FF8A80", periodBg: "#FFEBEE",
    pred: "#FFCC80", predBg: "#FFF8E1",
    ovu: "#81C784", ovuBg: "#E8F5E9",
    brd: "#F0E8E4", dim: "#EEEBE8",
    overlay: "#66000000",
    ann: "#E91E63"
  };

  // ======= 经期阶段计算 =======
  function getPhase(dateStr) {
    if (!periods.periods || periods.periods.length === 0) return null;
    for (var idx = 0; idx < periods.periods.length; idx++) {
      var p = periods.periods[idx];
      var endStr = p.end_date;
      if (!endStr) {
        var st = new Date(p.start_date);
        endStr = new Date(st.getTime() + (sett.period_length - 1) * 86400000).toISOString().split("T")[0];
      }
      if (dateStr >= p.start_date && dateStr <= endStr) {
        return { phase: "menstrual", label: "经期中", color: "#D4A0A0" };
      }
    }
    var lastP = null;
    for (var j = periods.periods.length - 1; j >= 0; j--) {
      if (periods.periods[j].end_date && periods.periods[j].start_date <= dateStr) {
        lastP = periods.periods[j]; break;
      }
    }
    if (!lastP) return null;
    var lastMs = new Date(lastP.start_date).getTime();
    var dateMs = new Date(dateStr).getTime();
    var daySince = Math.floor((dateMs - lastMs) / 86400000);
    var cycDay = ((daySince % sett.cycle_length) + sett.cycle_length) % sett.cycle_length;
    if (cycDay < sett.period_length) return { phase: "menstrual", label: "经期", color: "#D4A0A0" };
    if (cycDay < sett.cycle_length - 14) return { phase: "follicular", label: "卵泡期", color: "#7BA8CC" };
    if (cycDay < sett.cycle_length - 14 + 3) return { phase: "ovulation", label: "排卵期", color: "#8BBF90" };
    return { phase: "luteal", label: "黄体期", color: "#C8B080" };
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

  // ======= 异步数据加载 =======
  async function loadAllData() {
    try { var m = await readJsonAsync(MOOD_FILE); if (m) setMoods(m); } catch (e) {}
    try { var p = await readJsonAsync(PERIOD_FILE); if (p) setPeriods(p); } catch (e) {}
    try { var s = await readJsonAsync(SETTINGS_FILE); if (s) setSett(s); } catch (e) {}
    try { var sk = await readJsonAsync(SICK_FILE); if (sk) setSickData(sk); } catch (e) {}
    try { var pn = await readJsonAsync(PIN_FILE); if (pn) setPinData(pn); } catch (e) {}
    try { var pd = await readJsonAsync(PERIOD_DETAIL_FILE); if (pd) setPdtData(pd); } catch (e) {}
    setDataLoaded(true);
  }

  // ======= 操作 =======
  function close() {
    setPopup(""); setRecMood(""); setRecNote("");
    setSickNote(""); setPinNote("");
    setPdFlow(""); setPdColor(""); setPdPain(-1); setPdSymp(""); setPdNoteVal("");
  }

  function prev() {
    if (month === 1) { setYear(year - 1); setMonth(12); }
    else { setMonth(month - 1); }
    close();
  }

  function next() {
    if (month === 12) { setYear(year + 1); setMonth(1); }
    else { setMonth(month + 1); }
    close();
  }

  function goToday() { setYear(TY); setMonth(TM); close(); }
  function tapDay(d) { setSelDay(d); setPopup("detail"); }
  function jumpTo(y, m) { setYear(y); setMonth(m); close(); }

  // ======= 保存/删除 心情 =======
  async function saveMood(mood) {
    if (!selDay) return;
    var ds = ms + "-" + String(selDay).padStart(2, "0");
    var d = JSON.parse(JSON.stringify(moods));
    if (!d.records) d.records = {};
    if (!d.records[ds]) d.records[ds] = {};
    d.records[ds].user = { mood: mood, note: recNote || "", timestamp: Date.now() };
    try {
      await writeJsonAsync(MOOD_FILE, d);
      setMoods(d);
      ctx.showToast("已保存");
    } catch (e) { ctx.showToast("保存失败"); }
    close();
  }

  async function deleteMoodAsync() {
    if (!selDay) return;
    var ds = ms + "-" + String(selDay).padStart(2, "0");
    var d = JSON.parse(JSON.stringify(moods));
    if (!d.records || !d.records[ds]) { ctx.showToast("该日期没有心情记录"); return; }
    delete d.records[ds];
    try {
      await writeJsonAsync(MOOD_FILE, d);
      setMoods(d);
      ctx.showToast("已删除心情记录");
    } catch (e) { ctx.showToast("删除失败"); }
    close();
  }

  // ======= 保存/删除 经期 =======
  async function savePeriodMark(action) {
    if (!selDay) return;
    var ds = ms + "-" + String(selDay).padStart(2, "0");
    var d = JSON.parse(JSON.stringify(periods));
    if (!d.periods) d.periods = [];
    if (action === "start") {
      var last = d.periods.length > 0 ? d.periods[d.periods.length - 1] : null;
      if (last && !last.end_date) { ctx.showToast("请先标记上次经期结束"); return; }
      d.periods.push({ start_date: ds, end_date: null });
    } else {
      var last2 = d.periods.length > 0 ? d.periods[d.periods.length - 1] : null;
      if (!last2 || last2.end_date) { ctx.showToast("请先标记经期开始"); return; }
      last2.end_date = ds;
    }
    try {
      await writeJsonAsync(PERIOD_FILE, d);
      setPeriods(d);
      ctx.showToast(action === "start" ? "已标记经期开始" : "已标记经期结束");
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
      var endDate = p.end_date || "9999-12-31";
      if (ds >= p.start_date && ds <= endDate) { d.periods.splice(i, 1); found = true; break; }
    }
    if (!found) { ctx.showToast("该日期没有经期记录"); return; }
    try {
      await writeJsonAsync(PERIOD_FILE, d);
      setPeriods(d);
      ctx.showToast("已删除经期记录");
    } catch (e) { ctx.showToast("删除失败"); }
    close();
  }

  // ======= 保存/删除 生病 =======
  async function saveSick() {
    if (!selDay) return;
    if (!sickNote || !sickNote.trim()) { ctx.showToast("请填写症状描述"); return; }
    var ds = ms + "-" + String(selDay).padStart(2, "0");
    var d = JSON.parse(JSON.stringify(sickData));
    if (!d.records) d.records = {};
    d.records[ds] = { note: sickNote.trim(), timestamp: Date.now() };
    try {
      await writeJsonAsync(SICK_FILE, d);
      setSickData(d);
      ctx.showToast("已记录生病信息");
    } catch (e) { ctx.showToast("保存失败"); }
    close();
  }

  async function deleteSickAsync() {
    if (!selDay) return;
    var ds = ms + "-" + String(selDay).padStart(2, "0");
    var d = JSON.parse(JSON.stringify(sickData));
    if (!d.records || !d.records[ds]) { ctx.showToast("没有生病记录"); return; }
    delete d.records[ds];
    try {
      await writeJsonAsync(SICK_FILE, d);
      setSickData(d);
      ctx.showToast("已删除生病记录");
    } catch (e) { ctx.showToast("删除失败"); }
    close();
  }

  // ======= 保存/删除 备注 =======
  async function savePin() {
    if (!selDay) return;
    if (!pinNote || !pinNote.trim()) { ctx.showToast("请填写备注内容"); return; }
    var ds = ms + "-" + String(selDay).padStart(2, "0");
    var d = JSON.parse(JSON.stringify(pinData));
    if (!d.records) d.records = {};
    d.records[ds] = { note: pinNote.trim(), timestamp: Date.now() };
    try {
      await writeJsonAsync(PIN_FILE, d);
      setPinData(d);
      ctx.showToast("已添加备注");
    } catch (e) { ctx.showToast("保存失败"); }
    close();
  }

  async function deletePinAsync() {
    if (!selDay) return;
    var ds = ms + "-" + String(selDay).padStart(2, "0");
    var d = JSON.parse(JSON.stringify(pinData));
    if (!d.records || !d.records[ds]) { ctx.showToast("没有备注"); return; }
    delete d.records[ds];
    try {
      await writeJsonAsync(PIN_FILE, d);
      setPinData(d);
      ctx.showToast("已删除备注");
    } catch (e) { ctx.showToast("删除失败"); }
    close();
  }

  // ======= 保存/删除 经期详情 =======
  async function savePeriodDetail() {
    if (!selDay) return;
    var ds = ms + "-" + String(selDay).padStart(2, "0");
    var d = JSON.parse(JSON.stringify(pdtData));
    if (!d.records) d.records = {};
    var sympArr = pdSymp ? pdSymp.split(",").filter(function(x) { return x.length > 0; }) : [];
    d.records[ds] = {
      flow: pdFlow || null,
      color: pdColor || null,
      pain: pdPain >= 0 ? pdPain : null,
      symptoms: sympArr,
      note: pdNoteVal || "",
      timestamp: Date.now()
    };
    try {
      await writeJsonAsync(PERIOD_DETAIL_FILE, d);
      setPdtData(d);
      ctx.showToast("已保存经期详情");
    } catch (e) { ctx.showToast("保存失败"); }
    close();
  }

  async function deletePdtAsync() {
    if (!selDay) return;
    var ds = ms + "-" + String(selDay).padStart(2, "0");
    var d = JSON.parse(JSON.stringify(pdtData));
    if (!d.records || !d.records[ds]) { ctx.showToast("没有经期详情记录"); return; }
    delete d.records[ds];
    try {
      await writeJsonAsync(PERIOD_DETAIL_FILE, d);
      setPdtData(d);
      ctx.showToast("已删除经期详情");
    } catch (e) { ctx.showToast("删除失败"); }
    close();
  }

  function openPdPopup() {
    var ds = ms + "-" + String(selDay).padStart(2, "0");
    var existing = pdtData.records && pdtData.records[ds];
    if (existing) {
      setPdFlow(existing.flow || "");
      setPdColor(existing.color || "");
      setPdPain(existing.pain !== null && existing.pain !== undefined ? existing.pain : -1);
      setPdSymp(existing.symptoms ? existing.symptoms.join(",") : "");
      setPdNoteVal(existing.note || "");
    } else {
      setPdFlow(""); setPdColor(""); setPdPain(-1); setPdSymp(""); setPdNoteVal("");
    }
    setPopup("periodDetail");
  }

  // ======= 周期设置 =======
  async function saveSettingsFn() {
    var s = JSON.parse(JSON.stringify(sett));
    s.cycle_length = sCycle;
    s.period_length = sPeriod;
    try {
      await writeJsonAsync(SETTINGS_FILE, s);
      setSett(s);
      var pd = JSON.parse(JSON.stringify(periods));
      pd.settings = { cycle_length: sCycle, period_length: sPeriod };
      await writeJsonAsync(PERIOD_FILE, pd);
      setPeriods(pd);
      ctx.showToast("设置已保存");
    } catch (e) { ctx.showToast("保存失败"); }
    close();
  }

  // ==================== UI 组件 ====================

  // ---- Tab 切换栏 ----
  function mkTab(label, idx) {
    var on = tab === idx;
    return UI.Box({
      key: "tab" + idx, contentAlignment: "center",
      modifier: Modifier.weight(1)
        .background(on ? C.pri : "transparent", { type: "pill" })
        .clickable(function() { setTab(idx); close(); })
    }, UI.Box({ padding: { top: 10, bottom: 10 }, key: "tbi" + idx },
      UI.Text({ text: label, fontSize: 14, fontWeight: on ? "bold" : "normal", color: on ? C.white : C.sec, key: "tbt" + idx })
    ));
  }

  var tabBar = UI.Card({
    containerColor: C.priL, shape: { type: "pill" }, elevation: 0,
    fillMaxWidth: true, padding: 3, key: "tabbar"
  }, UI.Row({ fillMaxWidth: true }, [mkTab("心情", 0), mkTab("经期", 1)]));

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
      var isPer = pi.actual.indexOf(day) !== -1;
      var isPred = pi.predicted.indexOf(day) !== -1;
      var isOvu = pi.ovulation.indexOf(day) !== -1;
      var annInfo = getAnnForDay(day);

      var parts = [];

      // 日期数字（纪念日高亮）
      if (isToday) {
        parts.push(UI.Box({
          key: "td" + day, width: 22, height: 22, contentAlignment: "center",
          modifier: Modifier.background(C.today, { type: "circle" })
        }, UI.Text({ text: String(day), fontSize: 11, color: C.white, fontWeight: "bold", key: "d" + day })));
      } else {
        parts.push(UI.Text({
          text: String(day), fontSize: 12,
          color: annInfo ? C.ann : C.txt,
          fontWeight: annInfo ? "bold" : "normal",
          key: "d" + day
        }));
      }

      // 纪念日 ♡ 标记
      if (annInfo) {
        parts.push(UI.Text({ text: "♡", fontSize: 8, color: C.ann, key: "ann" + day }));
      }

      // 心情 tab：显示心情图标
      if (tab === 0) {
        if (rec && rec.user) {
          parts.push(UI.Image({
            url: MOOD_ICONS_USER[rec.user.mood],
            contentDescription: MOOD_LABELS[rec.user.mood] || "",
            contentScale: "fit", width: 22, height: 22, key: "u" + day
          }));
        } else {
          parts.push(UI.Box({
            key: "ue" + day, width: 22, height: 22,
            modifier: Modifier.background(C.dim, { type: "circle" })
          }));
        }
        if (rec && rec.ai) {
          parts.push(UI.Image({
            url: MOOD_ICONS_AI[rec.ai.mood],
            contentDescription: MOOD_LABELS[rec.ai.mood] || "",
            contentScale: "fit", width: 22, height: 22, key: "a" + day
          }));
        } else {
          parts.push(UI.Box({
            key: "ae" + day, width: 22, height: 22,
            modifier: Modifier.background(C.dim, { type: "rounded", cornerRadius: 4 })
          }));
        }
      } else {
        // 经期 tab：显示经期状态点
        if (isPer) {
          parts.push(UI.Box({ key: "pd" + day, width: 6, height: 6,
            modifier: Modifier.background(C.period, { type: "circle" }) }));
        } else if (isOvu) {
          parts.push(UI.Box({ key: "od" + day, width: 6, height: 6,
            modifier: Modifier.background(C.ovu, { type: "circle" }) }));
        } else if (isPred) {
          parts.push(UI.Box({ key: "prd" + day, width: 6, height: 6,
            modifier: Modifier.background(C.pred, { type: "circle" }) }));
        }
      }

      var bg = "transparent";
      if (tab === 1) {
        if (isPer) bg = C.periodBg;
        else if (isPred) bg = C.predBg;
        else if (isOvu) bg = C.ovuBg;
      }

      cells.push(UI.Box({
        key: "c" + day, height: cellH, contentAlignment: "center",
        modifier: Modifier.weight(1)
          .background(isSel ? C.todayBg : bg, { type: "rounded", cornerRadius: 10 })
          .border(isSel ? 1.5 : 0, isSel ? C.pri : "transparent", { type: "rounded", cornerRadius: 10 })
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

  // ---- 图例 ----
  function buildLegend() {
    function dot(color, shape, label, k) {
      return UI.Row({ spacing: 4, verticalAlignment: "center", key: k }, [
        UI.Box({ width: 10, height: 10, key: k + "d", modifier: Modifier.background(color, shape) }),
        UI.Text({ text: label, fontSize: 11, color: C.sec, key: k + "t" })
      ]);
    }
    if (tab === 0) {
      return UI.Card({
        containerColor: C.card, shape: { type: "rounded", cornerRadius: 12 },
        elevation: 0, fillMaxWidth: true, padding: 12, key: "lgd"
      }, UI.Row({ spacing: 16, key: "lgr" }, [
        dot(C.dim, { type: "circle" }, "你", "l1"),
        dot(C.dim, { type: "rounded", cornerRadius: 3 }, "TA", "l2"),
        UI.Text({ text: "♡ 纪念日", fontSize: 10, color: C.ann, key: "lann" })
      ]));
    }
    return UI.Card({
      containerColor: C.card, shape: { type: "rounded", cornerRadius: 12 },
      elevation: 0, fillMaxWidth: true, padding: 12, key: "lgd"
    }, UI.Row({ spacing: 14, key: "lgr" }, [
      dot(C.period, { type: "circle" }, "经期", "lp1"),
      dot(C.pred, { type: "circle" }, "预测", "lp2"),
      dot(C.ovu, { type: "circle" }, "排卵日", "lp3")
    ]));
  }

  // ---- 记录心情按钮 ----
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

  // ---- 本月心情统计 ----
  function makeBars(counts, total, iconMap, prefix) {
    var entries = [];
    var keys = Object.keys(counts);
    for (var i = 0; i < keys.length; i++) entries.push([keys[i], counts[keys[i]]]);
    entries.sort(function(a, b) { return b[1] - a[1]; });
    var bars = [];
    for (var bi = 0; bi < entries.length; bi++) {
      var mood = entries[bi][0];
      var cnt = entries[bi][1];
      var pct = Math.round(cnt / total * 100);
      bars.push(UI.Row({
        spacing: 8, fillMaxWidth: true, verticalAlignment: "center", key: prefix + "b" + mood
      }, [
        UI.Image({
          url: iconMap[mood], contentDescription: MOOD_LABELS[mood] || "",
          contentScale: "fit", width: 18, height: 18, key: prefix + "bi" + mood
        }),
        UI.Text({ text: MOOD_LABELS[mood], fontSize: 11, color: C.sec, key: prefix + "bl" + mood }),
        UI.Box({
          key: prefix + "bb" + mood, height: 8,
          modifier: Modifier.weight(1).background("#F5F0EE", { type: "pill" }).clip({ type: "pill" })
        }, UI.Box({
          key: prefix + "bf" + mood, height: 8,
          modifier: Modifier.fillMaxWidth(pct / 100).background(MOOD_COLORS[mood] || "#CCC", { type: "pill" })
        })),
        UI.Text({ text: "" + cnt, fontSize: 11, color: C.sec, key: prefix + "bc" + mood })
      ]));
    }
    return bars;
  }

  function buildStats() {
    if (tab !== 0) return UI.Spacer({ height: 0, key: "ns" });
    var userCounts = {}, aiCounts = {};
    var userTotal = 0, aiTotal = 0;
    var dates = Object.keys(moods.records);
    for (var di = 0; di < dates.length; di++) {
      var dateKey = dates[di];
      if (dateKey.indexOf(ms) === 0) {
        var rec = moods.records[dateKey];
        if (rec.user) { var um = rec.user.mood; userCounts[um] = (userCounts[um] || 0) + 1; userTotal++; }
        if (rec.ai) { var am = rec.ai.mood; aiCounts[am] = (aiCounts[am] || 0) + 1; aiTotal++; }
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
        UI.Text({ text: "你的心情", fontSize: 14, fontWeight: "bold", color: C.txt, key: "ust" }),
        UI.Text({ text: userTotal + " 天", fontSize: 12, color: C.sec, key: "usc" })
      ]));
      var ub = makeBars(userCounts, userTotal, MOOD_ICONS_USER, "u");
      for (var ui2 = 0; ui2 < ub.length; ui2++) content.push(ub[ui2]);
    }
    if (aiTotal > 0) {
      if (userTotal > 0) content.push(UI.Spacer({ height: 10, key: "sdiv" }));
      content.push(UI.Row({ fillMaxWidth: true, horizontalArrangement: "spaceBetween", key: "ash" }, [
        UI.Text({ text: "TA 的心情", fontSize: 14, fontWeight: "bold", color: C.txt, key: "ast" }),
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

  // ---- 经期信息 + 设置卡片 ----
  function buildPeriodInfo() {
    if (tab !== 1) return UI.Spacer({ height: 0, key: "npi" });

    // 当前周期阶段
    var todayStr = TY + "-" + String(TM).padStart(2, "0") + "-" + String(TD).padStart(2, "0");
    var todayPhase = getPhase(todayStr);

    var content = [];

    // 今日阶段指示
    if (todayPhase) {
      content.push(UI.Row({
        fillMaxWidth: true, spacing: 10, verticalAlignment: "center", key: "phrow"
      }, [
        UI.Box({
          width: 12, height: 12, key: "phdot",
          modifier: Modifier.background(todayPhase.color, { type: "circle" })
        }),
        UI.Text({ text: "当前：" + todayPhase.label, fontSize: 14, fontWeight: "bold", color: todayPhase.color, key: "phtxt" })
      ]));
      content.push(UI.Spacer({ height: 8, key: "phs" }));
    }

    // 周期设置标题行
    content.push(UI.Row({
      fillMaxWidth: true, horizontalArrangement: "spaceBetween",
      verticalAlignment: "center", key: "pih"
    }, [
      UI.Text({ text: "周期设置", fontSize: 15, fontWeight: "bold", color: C.txt, key: "pit" }),
      UI.Box({
        key: "piedit", contentAlignment: "center",
        modifier: Modifier.background(C.priL, { type: "pill" })
          .clickable(function() { setSCycle(sett.cycle_length); setSPeriod(sett.period_length); setPopup("settings"); })
      }, UI.Box({ padding: { start: 14, end: 14, top: 6, bottom: 6 }, key: "piei" },
        UI.Text({ text: "编辑", fontSize: 12, color: C.pri, key: "piet" })
      ))
    ]));

    // 数值显示
    content.push(UI.Row({ fillMaxWidth: true, spacing: 16, key: "pir" }, [
      UI.Column({ horizontalAlignment: "center", modifier: Modifier.weight(1), key: "pcc" }, [
        UI.Text({ text: String(sett.cycle_length), fontSize: 30, fontWeight: "bold", color: C.pri, key: "pcv" }),
        UI.Text({ text: "天/周期", fontSize: 12, color: C.sec, key: "pcl" })
      ]),
      UI.Box({ width: 1, height: 40, modifier: Modifier.background(C.brd), key: "pdiv" }),
      UI.Column({ horizontalAlignment: "center", modifier: Modifier.weight(1), key: "ppc" }, [
        UI.Text({ text: String(sett.period_length), fontSize: 30, fontWeight: "bold", color: C.period, key: "ppv" }),
        UI.Text({ text: "天/经期", fontSize: 12, color: C.sec, key: "ppl" })
      ])
    ]));

    // 标记按钮
    content.push(UI.Row({ fillMaxWidth: true, spacing: 10, key: "pmr" }, [
      UI.Box({
        key: "pms", contentAlignment: "center",
        modifier: Modifier.weight(1).background(C.periodBg, { type: "pill" })
          .clickable(function() { if (!selDay) setSelDay(TD); savePeriodMark("start"); })
      }, UI.Box({ padding: { top: 10, bottom: 10 }, key: "pmsi" },
        UI.Text({ text: "标记经期开始", fontSize: 13, color: C.period, fontWeight: "bold", key: "pmst" })
      )),
      UI.Box({
        key: "pme", contentAlignment: "center",
        modifier: Modifier.weight(1).background(C.ovuBg, { type: "pill" })
          .clickable(function() { if (!selDay) setSelDay(TD); savePeriodMark("end"); })
      }, UI.Box({ padding: { top: 10, bottom: 10 }, key: "pmei" },
        UI.Text({ text: "标记经期结束", fontSize: 13, color: C.ovu, fontWeight: "bold", key: "pmet" })
      ))
    ]));

    return UI.Card({
      containerColor: C.card, shape: { type: "rounded", cornerRadius: 16 },
      elevation: 0, fillMaxWidth: true, padding: 16, key: "pic"
    }, UI.Column({ spacing: 12 }, content));
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

  // ---- 日期详情弹窗 ----
  function popDetail() {
    if (popup !== "detail" || !selDay) return null;

    var ds = ms + "-" + String(selDay).padStart(2, "0");
    var rec = moods.records[ds];
    var isPer = pi.actual.indexOf(selDay) !== -1;
    var isPred = pi.predicted.indexOf(selDay) !== -1;
    var isOvu = pi.ovulation.indexOf(selDay) !== -1;
    var sickRec = sickData.records && sickData.records[ds] ? sickData.records[ds] : null;
    var pinRec = pinData.records && pinData.records[ds] ? pinData.records[ds] : null;
    var pdRec = pdtData.records && pdtData.records[ds] ? pdtData.records[ds] : null;
    var annInfo = getAnnForDay(selDay);
    var phaseInfo = getPhase(ds);

    var c = [];

    // ---- 标题行 ----
    c.push(UI.Row({
      fillMaxWidth: true, horizontalArrangement: "spaceBetween",
      verticalAlignment: "center", key: "dh"
    }, [
      UI.Text({
        text: year + "." + String(month).padStart(2, "0") + "." + String(selDay).padStart(2, "0"),
        fontSize: 18, fontWeight: "bold", color: C.txt, key: "dd"
      }),
      UI.Box({
        key: "dx", width: 28, height: 28, contentAlignment: "center",
        modifier: Modifier.background("#F0F0F0", { type: "circle" }).clickable(close)
      }, UI.Text({ text: "x", fontSize: 13, color: C.sec, key: "dxt" }))
    ]));

    // ---- 纪念日 ----
    if (annInfo) {
      c.push(UI.Spacer({ height: 6, key: "ds_ann" }));
      c.push(UI.Card({
        containerColor: "#FFF0F5", shape: { type: "rounded", cornerRadius: 10 },
        elevation: 0, fillMaxWidth: true, padding: 10, key: "annc"
      }, UI.Row({ spacing: 8, verticalAlignment: "center", key: "annr" }, [
        UI.Text({ text: "♡", fontSize: 16, color: C.ann, key: "anni" }),
        UI.Text({ text: annInfo.label, fontSize: 13, fontWeight: "bold", color: C.ann, key: "annt" })
      ])));
    }

    c.push(UI.Spacer({ height: 8, key: "ds1" }));

    // ---- 心情内容 ----
    if (rec && (rec.user || rec.ai)) {
      c.push(UI.Text({ text: "双人心情", fontSize: 12, color: C.light, key: "dsub" }));
      c.push(UI.Spacer({ height: 6, key: "ds2" }));
      if (rec.user) {
        c.push(UI.Row({ spacing: 10, verticalAlignment: "center", key: "du" }, [
          UI.Image({
            url: MOOD_ICONS_USER[rec.user.mood],
            contentDescription: MOOD_LABELS[rec.user.mood] || "",
            contentScale: "fit", width: 36, height: 36, key: "dui"
          }),
          UI.Text({
            text: "你：" + (MOOD_LABELS[rec.user.mood] || rec.user.mood),
            fontSize: 14, color: C.txt, key: "dum"
          })
        ]));
        if (rec.user.note) {
          c.push(UI.Card({
            containerColor: "#FFF5F0", shape: { type: "rounded", cornerRadius: 10 },
            elevation: 0, fillMaxWidth: true, padding: 10, key: "dunc"
          }, UI.Text({ text: rec.user.note, fontSize: 12, color: C.sec, key: "dunt" })));
        }
        c.push(UI.Spacer({ height: 4, key: "ds3" }));
      }
      if (rec.ai) {
        c.push(UI.Row({ spacing: 10, verticalAlignment: "center", key: "da" }, [
          UI.Image({
            url: MOOD_ICONS_AI[rec.ai.mood],
            contentDescription: MOOD_LABELS[rec.ai.mood] || "",
            contentScale: "fit", width: 36, height: 36, key: "dai"
          }),
          UI.Text({
            text: "TA：" + (MOOD_LABELS[rec.ai.mood] || rec.ai.mood),
            fontSize: 14, color: C.txt, key: "dam"
          })
        ]));
        if (rec.ai.note) {
          c.push(UI.Card({
            containerColor: "#F0F5FF", shape: { type: "rounded", cornerRadius: 10 },
            elevation: 0, fillMaxWidth: true, padding: 10, key: "danc"
          }, UI.Text({ text: rec.ai.note, fontSize: 12, color: C.sec, key: "dant" })));
        }
      }
    } else if (tab === 0) {
      c.push(UI.Text({ text: "这天还没有心情记录", fontSize: 13, color: C.light, key: "dnr" }));
    }

    // ---- 经期状态 + 阶段 ----
    if (isPer || isPred || isOvu || phaseInfo) {
      c.push(UI.Spacer({ height: 6, key: "ds4" }));
      if (isPer) {
        c.push(UI.Row({ spacing: 6, verticalAlignment: "center", key: "dpmi" }, [
          UI.Box({ width: 8, height: 8, key: "dpmd", modifier: Modifier.background(C.period, { type: "circle" }) }),
          UI.Text({ text: "经期中", fontSize: 13, color: C.period, key: "dpm" })
        ]));
      }
      if (isPred) {
        c.push(UI.Row({ spacing: 6, verticalAlignment: "center", key: "dprmi" }, [
          UI.Box({ width: 8, height: 8, key: "dprmd", modifier: Modifier.background(C.pred, { type: "circle" }) }),
          UI.Text({ text: "预测经期", fontSize: 13, color: "#FF9800", key: "dprm" })
        ]));
      }
      if (isOvu) {
        c.push(UI.Row({ spacing: 6, verticalAlignment: "center", key: "domi" }, [
          UI.Box({ width: 8, height: 8, key: "domd", modifier: Modifier.background(C.ovu, { type: "circle" }) }),
          UI.Text({ text: "预测排卵日", fontSize: 13, color: C.ovu, key: "dom" })
        ]));
      }
      if (phaseInfo && !isPer) {
        c.push(UI.Row({ spacing: 6, verticalAlignment: "center", key: "dphi" }, [
          UI.Box({ width: 8, height: 8, key: "dphd", modifier: Modifier.background(phaseInfo.color, { type: "circle" }) }),
          UI.Text({ text: phaseInfo.label, fontSize: 13, color: phaseInfo.color, key: "dph" })
        ]));
      }
    }

    // ---- 经期详情 ----
    if (pdRec) {
      c.push(UI.Spacer({ height: 6, key: "ds_pd" }));
      c.push(UI.Text({ text: "经期详情", fontSize: 12, color: C.light, key: "pdlbl" }));
      c.push(UI.Spacer({ height: 4, key: "ds_pd2" }));
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
          UI.Box({ width: 12, height: 12, key: "pdcid",
            modifier: Modifier.background(COLOR_HEX[pdRec.color] || "#CCC", { type: "circle" })
          }),
          UI.Text({ text: COLOR_LABELS[pdRec.color] || pdRec.color, fontSize: 11, color: C.sec, key: "pdcit" })
        ]));
      }
      if (pdRec.pain !== null && pdRec.pain !== undefined) {
        pdItems.push(UI.Text({ text: "疼痛：" + PAIN_LABELS[pdRec.pain], fontSize: 11, color: C.sec, key: "pdpni" }));
      }
      if (pdItems.length > 0) {
        c.push(UI.Row({ spacing: 8, fillMaxWidth: true, verticalAlignment: "center", key: "pdir" }, pdItems));
      }
      if (pdRec.symptoms && pdRec.symptoms.length > 0) {
        var sympText = pdRec.symptoms.map(function(s) { return SYMPTOM_LABELS[s] || s; }).join("、");
        c.push(UI.Text({ text: "症状：" + sympText, fontSize: 11, color: C.sec, key: "pdsi" }));
      }
      if (pdRec.note) {
        c.push(UI.Text({ text: "备注：" + pdRec.note, fontSize: 11, color: C.sec, key: "pdni" }));
      }
    }

    // ---- 生病记录 ----
    if (sickRec) {
      c.push(UI.Spacer({ height: 6, key: "ds_sk" }));
      c.push(UI.Card({
        containerColor: "#FFF3E0", shape: { type: "rounded", cornerRadius: 10 },
        elevation: 0, fillMaxWidth: true, padding: 10, key: "skc"
      }, UI.Row({ spacing: 8, verticalAlignment: "center", fillMaxWidth: true, key: "skr" }, [
        UI.Text({ text: "🤒", fontSize: 16, key: "ski" }),
        UI.Column({ modifier: Modifier.weight(1), key: "skcol" }, [
          UI.Text({ text: "生病记录", fontSize: 12, fontWeight: "bold", color: "#E65100", key: "sklt" }),
          UI.Text({ text: sickRec.note, fontSize: 11, color: C.sec, key: "sknt" })
        ])
      ])));
    }

    // ---- 日期备注 ----
    if (pinRec) {
      c.push(UI.Spacer({ height: 6, key: "ds_pn" }));
      c.push(UI.Card({
        containerColor: "#E3F2FD", shape: { type: "rounded", cornerRadius: 10 },
        elevation: 0, fillMaxWidth: true, padding: 10, key: "pnc"
      }, UI.Row({ spacing: 8, verticalAlignment: "center", fillMaxWidth: true, key: "pnr" }, [
        UI.Text({ text: "📌", fontSize: 16, key: "pni" }),
        UI.Column({ modifier: Modifier.weight(1), key: "pncol" }, [
          UI.Text({ text: "备注", fontSize: 12, fontWeight: "bold", color: "#1565C0", key: "pnlt" }),
          UI.Text({ text: pinRec.note, fontSize: 11, color: C.sec, key: "pnnt" })
        ])
      ])));
    }

    c.push(UI.Spacer({ height: 12, key: "ds7" }));

    // ---- 底部按钮 ----
    if (tab === 0) {
      // 心情 tab 主操作
      var moodBtns = [];
      moodBtns.push(UI.Box({
        key: "drb", contentAlignment: "center",
        modifier: Modifier.weight(1).background(C.pri, { type: "pill" })
          .clickable(function() { setPopup("record"); })
      }, UI.Box({ padding: { top: 10, bottom: 10 }, key: "drbi" },
        UI.Text({ text: "记录心情", fontSize: 12, fontWeight: "bold", color: C.white, key: "drbt" })
      )));
      if (rec && (rec.user || rec.ai)) {
        moodBtns.push(UI.Box({
          key: "ddb", contentAlignment: "center",
          modifier: Modifier.weight(1).background("#FFEBEE", { type: "pill" }).clickable(deleteMoodAsync)
        }, UI.Box({ padding: { top: 10, bottom: 10 }, key: "ddbi" },
          UI.Text({ text: "删除心情", fontSize: 12, fontWeight: "bold", color: "#FF4444", key: "ddbt" })
        )));
      }
      c.push(UI.Row({ fillMaxWidth: true, spacing: 6, key: "dacts1" }, moodBtns));

      // 生病/备注 操作
      var extraBtns = [];
      if (sickRec) {
        extraBtns.push(UI.Box({
          key: "dskd", contentAlignment: "center",
          modifier: Modifier.weight(1).background("#FFF3E0", { type: "pill" }).clickable(deleteSickAsync)
        }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "dskdi" },
          UI.Text({ text: "删除生病", fontSize: 11, color: "#E65100", key: "dskdt" })
        )));
      } else {
        extraBtns.push(UI.Box({
          key: "dskr", contentAlignment: "center",
          modifier: Modifier.weight(1).background("#FFF3E0", { type: "pill" })
            .clickable(function() { setPopup("recordSick"); })
        }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "dskri" },
          UI.Text({ text: "记录生病", fontSize: 11, color: "#E65100", key: "dskrt" })
        )));
      }
      if (pinRec) {
        extraBtns.push(UI.Box({
          key: "dpnd", contentAlignment: "center",
          modifier: Modifier.weight(1).background("#E3F2FD", { type: "pill" }).clickable(deletePinAsync)
        }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "dpndi" },
          UI.Text({ text: "删除备注", fontSize: 11, color: "#1565C0", key: "dpndt" })
        )));
      } else {
        extraBtns.push(UI.Box({
          key: "dpnr", contentAlignment: "center",
          modifier: Modifier.weight(1).background("#E3F2FD", { type: "pill" })
            .clickable(function() { setPopup("recordPin"); })
        }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "dpnri" },
          UI.Text({ text: "添加备注", fontSize: 11, color: "#1565C0", key: "dpnrt" })
        )));
      }
      c.push(UI.Spacer({ height: 4, key: "ds8" }));
      c.push(UI.Row({ fillMaxWidth: true, spacing: 6, key: "dacts2" }, extraBtns));

      // 关闭
      c.push(UI.Spacer({ height: 4, key: "ds9" }));
      c.push(UI.Box({
        key: "dcb", fillMaxWidth: true, contentAlignment: "center",
        modifier: Modifier.background("#F5F0EE", { type: "pill" }).clickable(close)
      }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "dcbi" },
        UI.Text({ text: "关闭", fontSize: 12, color: C.sec, key: "dcbt" })
      )));
    } else {
      // 经期 tab
      var perBtns = [];
      perBtns.push(UI.Box({
        key: "dps", contentAlignment: "center",
        modifier: Modifier.weight(1).background(C.periodBg, { type: "pill" })
          .clickable(function() { savePeriodMark("start"); })
      }, UI.Box({ padding: { top: 10, bottom: 10 }, key: "dpsi" },
        UI.Text({ text: "标记开始", fontSize: 12, fontWeight: "bold", color: C.period, key: "dpst" })
      )));
      perBtns.push(UI.Box({
        key: "dpe", contentAlignment: "center",
        modifier: Modifier.weight(1).background(C.ovuBg, { type: "pill" })
          .clickable(function() { savePeriodMark("end"); })
      }, UI.Box({ padding: { top: 10, bottom: 10 }, key: "dpei" },
        UI.Text({ text: "标记结束", fontSize: 12, fontWeight: "bold", color: C.ovu, key: "dpet" })
      )));
      c.push(UI.Row({ fillMaxWidth: true, spacing: 6, key: "dacts1" }, perBtns));

      // 经期详情 + 删除
      var perBtns2 = [];
      perBtns2.push(UI.Box({
        key: "dpdr", contentAlignment: "center",
        modifier: Modifier.weight(1).background(C.priL, { type: "pill" }).clickable(openPdPopup)
      }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "dpdri" },
        UI.Text({ text: "记录详情", fontSize: 11, color: C.pri, key: "dpdrt" })
      )));
      if (isPer) {
        perBtns2.push(UI.Box({
          key: "dpd", contentAlignment: "center",
          modifier: Modifier.weight(1).background("#FFEBEE", { type: "pill" }).clickable(deletePeriodAsync)
        }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "dpdi" },
          UI.Text({ text: "删除标记", fontSize: 11, color: "#FF4444", key: "dpdt" })
        )));
      }
      if (pdRec) {
        perBtns2.push(UI.Box({
          key: "dpdd", contentAlignment: "center",
          modifier: Modifier.weight(1).background("#FFEBEE", { type: "pill" }).clickable(deletePdtAsync)
        }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "dpddi" },
          UI.Text({ text: "删除详情", fontSize: 11, color: "#FF4444", key: "dpddt" })
        )));
      }
      c.push(UI.Spacer({ height: 4, key: "ds8" }));
      c.push(UI.Row({ fillMaxWidth: true, spacing: 6, key: "dacts2" }, perBtns2));

      // 生病/备注 操作
      var extraBtns2 = [];
      if (sickRec) {
        extraBtns2.push(UI.Box({
          key: "dskd2", contentAlignment: "center",
          modifier: Modifier.weight(1).background("#FFF3E0", { type: "pill" }).clickable(deleteSickAsync)
        }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "dskdi2" },
          UI.Text({ text: "删除生病", fontSize: 11, color: "#E65100", key: "dskdt2" })
        )));
      } else {
        extraBtns2.push(UI.Box({
          key: "dskr2", contentAlignment: "center",
          modifier: Modifier.weight(1).background("#FFF3E0", { type: "pill" })
            .clickable(function() { setPopup("recordSick"); })
        }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "dskri2" },
          UI.Text({ text: "记录生病", fontSize: 11, color: "#E65100", key: "dskrt2" })
        )));
      }
      if (pinRec) {
        extraBtns2.push(UI.Box({
          key: "dpnd2", contentAlignment: "center",
          modifier: Modifier.weight(1).background("#E3F2FD", { type: "pill" }).clickable(deletePinAsync)
        }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "dpndi2" },
          UI.Text({ text: "删除备注", fontSize: 11, color: "#1565C0", key: "dpndt2" })
        )));
      } else {
        extraBtns2.push(UI.Box({
          key: "dpnr2", contentAlignment: "center",
          modifier: Modifier.weight(1).background("#E3F2FD", { type: "pill" })
            .clickable(function() { setPopup("recordPin"); })
        }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "dpnri2" },
          UI.Text({ text: "添加备注", fontSize: 11, color: "#1565C0", key: "dpnrt2" })
        )));
      }
      c.push(UI.Spacer({ height: 4, key: "ds9" }));
      c.push(UI.Row({ fillMaxWidth: true, spacing: 6, key: "dacts3" }, extraBtns2));

      // 关闭
      c.push(UI.Spacer({ height: 4, key: "ds10" }));
      c.push(UI.Box({
        key: "dcb2", fillMaxWidth: true, contentAlignment: "center",
        modifier: Modifier.background("#F5F0EE", { type: "pill" }).clickable(close)
      }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "dcbi2" },
        UI.Text({ text: "关闭", fontSize: 12, color: C.sec, key: "dcbt2" })
      )));
    }

    return overlayWrap(c, "det");
  }

  // ---- 记录心情弹窗（3x3 网格）----
  function popRecord() {
    if (popup !== "record") return null;
    var targetDay = selDay || TD;
    var c = [];

    c.push(UI.Text({ text: "记录心情", fontSize: 18, fontWeight: "bold", color: C.txt, key: "rt" }));
    c.push(UI.Text({
      text: year + "年" + month + "月" + targetDay + "日",
      fontSize: 12, color: C.sec, key: "rs"
    }));
    c.push(UI.Spacer({ height: 12, key: "rs1" }));

    // 3x3 心情网格
    for (var row = 0; row < 3; row++) {
      var rowItems = [];
      for (var col = 0; col < 3; col++) {
        var idx = row * 3 + col;
        (function(m, s) {
          rowItems.push(UI.Column({
            horizontalAlignment: "center", spacing: 4, key: "m" + m,
            modifier: Modifier.weight(1)
              .background(s ? C.priL : "transparent", { type: "rounded", cornerRadius: 12 })
              .border(s ? 1.5 : 0, s ? C.pri : "transparent", { type: "rounded", cornerRadius: 12 })
              .clickable(function() { setRecMood(m); })
          }, [
            UI.Spacer({ height: 4, key: "ms" + m }),
            UI.Image({
              url: MOOD_ICONS_USER[m], contentDescription: MOOD_LABELS[m] || "",
              contentScale: "fit", width: 40, height: 40, key: "mi" + m
            }),
            UI.Text({ text: MOOD_LABELS[m], fontSize: 11, color: s ? C.pri : C.sec, key: "ml" + m }),
            UI.Spacer({ height: 4, key: "me" + m })
          ]));
        })(MOOD_TYPES[idx], recMood === MOOD_TYPES[idx]);
      }
      c.push(UI.Row({ fillMaxWidth: true, spacing: 6, key: "mr" + row }, rowItems));
      if (row < 2) c.push(UI.Spacer({ height: 4, key: "mrs" + row }));
    }

    c.push(UI.Spacer({ height: 10, key: "rs3" }));

    // 心情备注
    c.push(UI.Card({
      containerColor: "#FFF9F6", shape: { type: "rounded", cornerRadius: 14 },
      elevation: 0, fillMaxWidth: true, border: { width: 1, color: C.brd }, key: "rntfc"
    }, UI.TextField({
      value: recNote, onValueChange: function(v) { setRecNote(v); },
      placeholder: "写点什么吧...（可选）",
      singleLine: false, maxLines: 3, fillMaxWidth: true, key: "rntf"
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
    c.push(UI.Box({
      fillMaxWidth: true, contentAlignment: "center", key: "rcb",
      modifier: Modifier.clickable(close)
    }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "rcbi" },
      UI.Text({ text: "取消", fontSize: 13, color: C.sec, key: "rcbt" })
    )));

    return overlayWrap(c, "rec");
  }

  // ---- 记录生病弹窗 ----
  function popRecordSick() {
    if (popup !== "recordSick") return null;
    var targetDay = selDay || TD;
    var c = [];

    c.push(UI.Text({ text: "记录生病 🤒", fontSize: 18, fontWeight: "bold", color: C.txt, key: "skt" }));
    c.push(UI.Text({
      text: year + "年" + month + "月" + targetDay + "日",
      fontSize: 12, color: C.sec, key: "sks"
    }));
    c.push(UI.Spacer({ height: 12, key: "sks1" }));

    c.push(UI.Card({
      containerColor: "#FFF9F6", shape: { type: "rounded", cornerRadius: 14 },
      elevation: 0, fillMaxWidth: true, border: { width: 1, color: C.brd }, key: "skntfc"
    }, UI.TextField({
      value: sickNote, onValueChange: function(v) { setSickNote(v); },
      placeholder: "描述症状，如喉咙痛、发烧...",
      singleLine: false, maxLines: 3, fillMaxWidth: true, key: "skntf"
    })));
    c.push(UI.Spacer({ height: 12, key: "sks2" }));

    c.push(UI.Box({
      fillMaxWidth: true, contentAlignment: "center", key: "sksb",
      modifier: Modifier.background(sickNote && sickNote.trim() ? C.pri : C.light, { type: "pill" })
        .clickable(function() { if (sickNote && sickNote.trim()) saveSick(); })
    }, UI.Box({ padding: { top: 12, bottom: 12 }, key: "sksbi" },
      UI.Text({ text: "保存", fontSize: 14, fontWeight: "bold", color: C.white, key: "sksbt" })
    )));
    c.push(UI.Spacer({ height: 6, key: "sks3" }));
    c.push(UI.Box({
      fillMaxWidth: true, contentAlignment: "center", key: "skcb",
      modifier: Modifier.clickable(close)
    }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "skcbi" },
      UI.Text({ text: "取消", fontSize: 13, color: C.sec, key: "skcbt" })
    )));

    return overlayWrap(c, "sk");
  }

  // ---- 添加备注弹窗 ----
  function popRecordPin() {
    if (popup !== "recordPin") return null;
    var targetDay = selDay || TD;
    var c = [];

    c.push(UI.Text({ text: "添加备注 📌", fontSize: 18, fontWeight: "bold", color: C.txt, key: "pntt" }));
    c.push(UI.Text({
      text: year + "年" + month + "月" + targetDay + "日",
      fontSize: 12, color: C.sec, key: "pnts"
    }));
    c.push(UI.Spacer({ height: 12, key: "pns1" }));

    c.push(UI.Card({
      containerColor: "#FFF9F6", shape: { type: "rounded", cornerRadius: 14 },
      elevation: 0, fillMaxWidth: true, border: { width: 1, color: C.brd }, key: "pnntfc"
    }, UI.TextField({
      value: pinNote, onValueChange: function(v) { setPinNote(v); },
      placeholder: "写下重要备忘...",
      singleLine: false, maxLines: 3, fillMaxWidth: true, key: "pnntf"
    })));
    c.push(UI.Spacer({ height: 12, key: "pns2" }));

    c.push(UI.Box({
      fillMaxWidth: true, contentAlignment: "center", key: "pnsb",
      modifier: Modifier.background(pinNote && pinNote.trim() ? C.pri : C.light, { type: "pill" })
        .clickable(function() { if (pinNote && pinNote.trim()) savePin(); })
    }, UI.Box({ padding: { top: 12, bottom: 12 }, key: "pnsbi" },
      UI.Text({ text: "保存", fontSize: 14, fontWeight: "bold", color: C.white, key: "pnsbt" })
    )));
    c.push(UI.Spacer({ height: 6, key: "pns3" }));
    c.push(UI.Box({
      fillMaxWidth: true, contentAlignment: "center", key: "pncb",
      modifier: Modifier.clickable(close)
    }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "pncbi" },
      UI.Text({ text: "取消", fontSize: 13, color: C.sec, key: "pncbt" })
    )));

    return overlayWrap(c, "pn");
  }

  // ---- 经期详情弹窗 ----
  function popPeriodDetail() {
    if (popup !== "periodDetail") return null;
    var targetDay = selDay || TD;
    var c = [];

    c.push(UI.Text({ text: "经期详情", fontSize: 18, fontWeight: "bold", color: C.txt, key: "pdtt" }));
    c.push(UI.Text({
      text: year + "年" + month + "月" + targetDay + "日",
      fontSize: 12, color: C.sec, key: "pdts"
    }));
    c.push(UI.Spacer({ height: 12, key: "pd1" }));

    // 流量
    c.push(UI.Text({ text: "流量", fontSize: 13, color: C.sec, key: "pdfl" }));
    c.push(UI.Spacer({ height: 6, key: "pd2" }));
    var flowKeys = ["light", "medium", "heavy"];
    var flowChips = [];
    for (var fi = 0; fi < flowKeys.length; fi++) {
      (function(fk) {
        var sel = pdFlow === fk;
        flowChips.push(UI.Box({
          key: "fl" + fk, contentAlignment: "center",
          modifier: Modifier.weight(1)
            .background(sel ? FLOW_COLORS[fk] : "#F5F0EE", { type: "pill" })
            .clickable(function() { setPdFlow(sel ? "" : fk); })
        }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "fli" + fk },
          UI.Text({ text: FLOW_LABELS[fk], fontSize: 12, color: sel ? "#FFF" : C.txt, key: "flt" + fk })
        )));
      })(flowKeys[fi]);
    }
    c.push(UI.Row({ fillMaxWidth: true, spacing: 8, key: "flr" }, flowChips));
    c.push(UI.Spacer({ height: 12, key: "pd3" }));

    // 颜色
    c.push(UI.Text({ text: "颜色", fontSize: 13, color: C.sec, key: "pdcl" }));
    c.push(UI.Spacer({ height: 6, key: "pd4" }));
    var colorKeys = ["bright_red", "dark_red", "brown", "pink"];
    var colorChips = [];
    for (var ci = 0; ci < colorKeys.length; ci++) {
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
          UI.Box({ width: 24, height: 24, key: "cld" + ck,
            modifier: Modifier.background(COLOR_HEX[ck], { type: "circle" })
          }),
          UI.Text({ text: COLOR_LABELS[ck], fontSize: 10, color: sel ? COLOR_HEX[ck] : C.sec, key: "clt" + ck }),
          UI.Spacer({ height: 4, key: "cle" + ck })
        ]));
      })(colorKeys[ci]);
    }
    c.push(UI.Row({ fillMaxWidth: true, spacing: 6, key: "clr" }, colorChips));
    c.push(UI.Spacer({ height: 12, key: "pd5" }));

    // 疼痛程度
    c.push(UI.Text({ text: "疼痛程度", fontSize: 13, color: C.sec, key: "pdpl" }));
    c.push(UI.Spacer({ height: 6, key: "pd6" }));
    var painChips = [];
    for (var pai = 0; pai <= 4; pai++) {
      (function(pv) {
        var sel = pdPain === pv;
        painChips.push(UI.Box({
          key: "pn" + pv, contentAlignment: "center",
          modifier: Modifier.weight(1)
            .background(sel ? C.pri : "#F5F0EE", { type: "pill" })
            .clickable(function() { setPdPain(sel ? -1 : pv); })
        }, UI.Box({ padding: { top: 6, bottom: 6 }, key: "pni" + pv },
          UI.Text({ text: PAIN_LABELS[pv], fontSize: 10, color: sel ? "#FFF" : C.txt, key: "pnl" + pv })
        )));
      })(pai);
    }
    c.push(UI.Row({ fillMaxWidth: true, spacing: 4, key: "pnr" }, painChips));
    c.push(UI.Spacer({ height: 12, key: "pd7" }));

    // 症状（可多选）
    c.push(UI.Text({ text: "症状（可多选）", fontSize: 13, color: C.sec, key: "pdsyl" }));
    c.push(UI.Spacer({ height: 6, key: "pd8" }));

    function mkSympRow(startIdx, endIdx, rowKey) {
      var chips = [];
      for (var si = startIdx; si < endIdx; si++) {
        (function(sk) {
          var sympArr = pdSymp ? pdSymp.split(",").filter(function(x) { return x.length > 0; }) : [];
          var sel = sympArr.indexOf(sk) >= 0;
          chips.push(UI.Box({
            key: "sy" + sk, contentAlignment: "center",
            modifier: Modifier.weight(1)
              .background(sel ? "#FFE0E0" : "#F5F0EE", { type: "pill" })
              .border(sel ? 1 : 0, sel ? C.period : "transparent", { type: "pill" })
              .clickable(function() {
                var arr = pdSymp ? pdSymp.split(",").filter(function(x) { return x.length > 0; }) : [];
                var idx = arr.indexOf(sk);
                if (idx >= 0) arr.splice(idx, 1); else arr.push(sk);
                setPdSymp(arr.join(","));
              })
          }, UI.Box({ padding: { top: 6, bottom: 6 }, key: "syi" + sk },
            UI.Text({ text: SYMPTOM_LABELS[sk], fontSize: 10, color: sel ? C.period : C.txt, key: "syt" + sk })
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
      containerColor: "#FFF9F6", shape: { type: "rounded", cornerRadius: 14 },
      elevation: 0, fillMaxWidth: true, border: { width: 1, color: C.brd }, key: "pdntfc"
    }, UI.TextField({
      value: pdNoteVal, onValueChange: function(v) { setPdNoteVal(v); },
      placeholder: "补充备注...（可选）",
      singleLine: false, maxLines: 3, fillMaxWidth: true, key: "pdntf"
    })));
    c.push(UI.Spacer({ height: 12, key: "pd11" }));

    // 保存
    c.push(UI.Box({
      fillMaxWidth: true, contentAlignment: "center", key: "pdsb",
      modifier: Modifier.background(C.pri, { type: "pill" }).clickable(savePeriodDetail)
    }, UI.Box({ padding: { top: 12, bottom: 12 }, key: "pdsbi" },
      UI.Text({ text: "保存", fontSize: 14, fontWeight: "bold", color: C.white, key: "pdsbt" })
    )));
    c.push(UI.Spacer({ height: 6, key: "pd12" }));
    c.push(UI.Box({
      fillMaxWidth: true, contentAlignment: "center", key: "pdcb",
      modifier: Modifier.clickable(close)
    }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "pdcbi" },
      UI.Text({ text: "取消", fontSize: 13, color: C.sec, key: "pdcbt" })
    )));

    return overlayWrap(c, "pdl");
  }

  // ---- 年月选择弹窗 ----
  function popPicker() {
    if (popup !== "picker") return null;
    var c = [];

    c.push(UI.Row({
      fillMaxWidth: true, horizontalArrangement: "spaceBetween",
      verticalAlignment: "center", key: "pyr"
    }, [
      UI.Box({
        key: "pyp", width: 36, height: 36, contentAlignment: "center",
        modifier: Modifier.background("#F5F0EE", { type: "circle" })
          .clickable(function() { setPYear(pYear - 1); })
      }, UI.Text({ text: "<", fontSize: 16, color: C.sec, key: "pypt" })),
      UI.Text({ text: pYear + "年", fontSize: 20, fontWeight: "bold", color: C.txt, key: "pyt" }),
      UI.Box({
        key: "pyn", width: 36, height: 36, contentAlignment: "center",
        modifier: Modifier.background("#F5F0EE", { type: "circle" })
          .clickable(function() { setPYear(pYear + 1); })
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
            modifier: Modifier.weight(1)
              .background(cur ? C.pri : nw ? C.todayBg : "transparent", { type: "rounded", cornerRadius: 10 })
              .clickable(function() { jumpTo(pYear, mm); })
          }, UI.Box({ padding: { top: 12, bottom: 12 }, key: "pmi" + mm },
            UI.Text({
              text: mLabels[mm - 1], fontSize: 14,
              fontWeight: cur ? "bold" : "normal",
              color: cur ? C.white : nw ? C.pri : C.txt, key: "pmt" + mm
            })
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

    c.push(UI.Text({ text: "周期设置", fontSize: 18, fontWeight: "bold", color: C.txt, key: "stt" }));
    c.push(UI.Spacer({ height: 16, key: "ss1" }));

    c.push(UI.Text({ text: "月经周期（天）", fontSize: 13, color: C.sec, key: "scl" }));
    c.push(UI.Spacer({ height: 6, key: "ss2" }));
    c.push(UI.Row({
      fillMaxWidth: true, horizontalArrangement: "center",
      verticalAlignment: "center", spacing: 20, key: "scr"
    }, [
      UI.Box({
        key: "scm", width: 44, height: 44, contentAlignment: "center",
        modifier: Modifier.background("#F5F0EE", { type: "circle" })
          .clickable(function() { if (sCycle > 1) setSCycle(sCycle - 1); })
      }, UI.Text({ text: "-", fontSize: 22, color: C.txt, key: "scmt" })),
      UI.Text({ text: String(sCycle), fontSize: 36, fontWeight: "bold", color: C.pri, key: "scv" }),
      UI.Box({
        key: "scp", width: 44, height: 44, contentAlignment: "center",
        modifier: Modifier.background("#F5F0EE", { type: "circle" })
          .clickable(function() { setSCycle(sCycle + 1); })
      }, UI.Text({ text: "+", fontSize: 22, color: C.txt, key: "scpt" }))
    ]));
    c.push(UI.Spacer({ height: 16, key: "ss3" }));

    c.push(UI.Text({ text: "经期时长（天）", fontSize: 13, color: C.sec, key: "spl" }));
    c.push(UI.Spacer({ height: 6, key: "ss4" }));
    c.push(UI.Row({
      fillMaxWidth: true, horizontalArrangement: "center",
      verticalAlignment: "center", spacing: 20, key: "spr"
    }, [
      UI.Box({
        key: "spm", width: 44, height: 44, contentAlignment: "center",
        modifier: Modifier.background("#F5F0EE", { type: "circle" })
          .clickable(function() { if (sPeriod > 1) setSPeriod(sPeriod - 1); })
      }, UI.Text({ text: "-", fontSize: 22, color: C.txt, key: "spmt" })),
      UI.Text({ text: String(sPeriod), fontSize: 36, fontWeight: "bold", color: C.period, key: "spv" }),
      UI.Box({
        key: "spp", width: 44, height: 44, contentAlignment: "center",
        modifier: Modifier.background("#F5F0EE", { type: "circle" })
          .clickable(function() { setSPeriod(sPeriod + 1); })
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
    c.push(UI.Box({
      fillMaxWidth: true, contentAlignment: "center", key: "scnb",
      modifier: Modifier.clickable(close)
    }, UI.Box({ padding: { top: 8, bottom: 8 }, key: "scnbi" },
      UI.Text({ text: "取消", fontSize: 13, color: C.sec, key: "scnbt" })
    )));

    return overlayWrap(c, "st");
  }

  // ==================== 组装主界面 ====================

  var mainContent = UI.LazyColumn({
    fillMaxSize: true, padding: 16, spacing: 12, background: C.bg, key: "lc",
    onLoad: async function() {
      if (!dataLoaded) {
        await loadAllData();
      }
    }
  }, [
    tabBar,
    monthHeader,
    weekRow,
    buildGrid(),
    buildLegend(),
    buildRecordBtn(),
    buildStats(),
    buildPeriodInfo(),
    UI.Spacer({ height: 24, key: "bs" })
  ]);

  var activePopup = popDetail() || popRecord() || popRecordSick() || popRecordPin() || popPeriodDetail() || popPicker() || popSettings();
  if (activePopup) {
    return UI.Box({ fillMaxSize: true, key: "root" }, [mainContent, activePopup]);
  }
  return mainContent;
}

exports.default = Screen;
