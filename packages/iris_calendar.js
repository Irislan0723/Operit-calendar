/*
METADATA
{
    "name": "iris_calendar",
    "display_name": {
        "zh": "拾月日历工具",
        "en": "Shiyue Calendar Tools"
    },
    "description": "提供心情记录、经期标记和日历数据查询工具，支持AI和用户双人记录",
    "author": ["Irislan0723"],
    "category": "Utility",
    "tools": [
        {
            "name": "record_mood",
            "description": "记录心情。AI和用户都可以记录，通过role区分。记录后会在日历上显示对应的心情图标。",
            "parameters": [
                { "name": "date", "description": "日期，格式为YYYY-MM-DD，例如2026-08-10", "type": "string", "required": true },
                { "name": "role", "description": "记录者角色，取值 user 或 ai", "type": "string", "required": true },
                { "name": "mood", "description": "心情类型，取值：happy(开心), calm(平静), tired(疲惫), sad(难过), anxious(焦虑), angry(生气), miss_you(想你), excited(兴奋)", "type": "string", "required": true },
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
            "name": "get_calendar_data",
            "description": "获取指定月份的日历数据，包括心情记录和经期信息",
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
        }
    ]
}
*/
const DATA_DIR = "/storage/emulated/0/Download/Operit/plugins/iris_calendar/data";
const MOOD_FILE = DATA_DIR + "/mood_data.json";
const PERIOD_FILE = DATA_DIR + "/period_data.json";
const SETTINGS_FILE = DATA_DIR + "/settings.json";

const MOOD_TYPES = ["happy", "calm", "tired", "sad", "anxious", "angry", "miss_you", "excited"];
const MOOD_LABELS = {
  happy: "开心", calm: "平静", tired: "疲惫", sad: "难过",
  anxious: "焦虑", angry: "生气", miss_you: "想你", excited: "兴奋"
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
  return (await readJson(SETTINGS_FILE)) || { cycle_length: 28, period_length: 5 };
}

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
  const roleLabel = role === "user" ? "用户" : "Claude";
  return {
    success: true,
    message: `已记录 ${roleLabel} 在 ${date} 的心情：${moodLabel}${note ? "，备注：" + note : ""}`
  };
}

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

async function get_calendar_data(params) {
  const { month } = params;
  if (!month || !month.match(/^\d{4}-\d{2}$/)) {
    return { success: false, error: "月份格式无效，请使用YYYY-MM格式" };
  }
  const moodData = await getMoodData();
  const periodData = await getPeriodData();
  const settings = await getSettings();

  const monthMoods = {};
  for (const [date, record] of Object.entries(moodData.records)) {
    if (date.startsWith(month)) {
      monthMoods[date] = record;
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

  return {
    success: true,
    month: month,
    moods: monthMoods,
    period_dates: periodDates,
    predicted_period_dates: predictedPeriodDates,
    ovulation_dates: ovulationDates,
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

module.exports = { record_mood, record_period, get_calendar_data, get_mood_summary, update_period_settings, delete_mood, delete_period };
