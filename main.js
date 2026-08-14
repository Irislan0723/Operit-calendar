"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerToolPkg = void 0;
const index_ui_js_1 = __importDefault(require("./ui/calendar/index.ui.js"));

const CALENDAR_ROUTE = "toolpkg:com.iris.calendar:ui:iris_calendar_main";

function registerToolPkg() {
    ToolPkg.registerUiRoute({
        id: "iris_calendar_main",
        route: CALENDAR_ROUTE,
        runtime: "compose_dsl",
        screen: index_ui_js_1.default,
        params: {},
        title: { zh: "拾月日历", en: "Shiyue Calendar" }
    });

    ToolPkg.registerNavigationEntry({
        id: "iris_calendar_sidebar",
        route: CALENDAR_ROUTE,
        surface: "main_sidebar_plugins",
        title: { zh: "拾月日历", en: "Shiyue Calendar" },
        icon: Icons.CalendarMonth,
        order: 10
    });

    return true;
}
exports.registerToolPkg = registerToolPkg;
