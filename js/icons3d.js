/* ==========================================================================
   Icon3D —— 统一风格 3D 拟物 SVG 图标系统
   --------------------------------------------------------------------------
   设计语言：明亮的等距/拟物造型，左上亮色渐变 → 右下深色，白色高光，
             底部柔和落地阴影，圆润几何。纯矢量、离线可用、无 CDN 依赖。
   用法：Icon3D.svg("map")            → 纯 <svg> 字符串（塞进任意容器）
         Icon3D.box("map", 56)        → 带尺寸的 <span class="ico3d">
         Icon3D.upgrade(root)         → 把指定容器内的 emoji 图标升级成 3D
   ========================================================================== */
(function (global) {
  "use strict";

  /* 配色：全部收敛到「香云纱」暖色非遗体系——陶土赭石 / 香云金 / 暖象牙 / 砖红 / 墨褐。
     [亮顶面, 主正面, 暗侧面]，每个图标主色 + 点缀色，皆为暖调，杜绝冷青/冷灰的“医疗感”。 */
  var C = {
    clay:  ["#E9C6A0", "#C98A5B", "#8F5530"],   // 陶土赭石
    gold:  ["#F7DCA2", "#E6B35A", "#B5792A"],   // 香云金
    cream: ["#FFFCF2", "#F7ECD6", "#E6D2AF"],   // 暖象牙
    coral: ["#FFC9B0", "#E08A66", "#B05234"],   // 砖红茜色
    ink:   ["#B89A78", "#6E4B33", "#3D281A"],   // 墨褐
    slate: ["#F0E6D8", "#D4C0A4", "#A98C6B"],   // 暖灰褐
    /* 兼容旧键名，全部收敛到上述色组 */
    mint:  ["#E9C6A0", "#C98A5B", "#8F5530"],
    blue:  ["#E9C6A0", "#C98A5B", "#8F5530"],
    green: ["#E9C6A0", "#C98A5B", "#8F5530"],
    orange:["#F7DCA2", "#E6B35A", "#B5792A"],
    purple:["#F7DCA2", "#E6B35A", "#B5792A"],
    brown: ["#F7DCA2", "#E6B35A", "#B5792A"],
    red:   ["#FFC9B0", "#E08A66", "#B05234"],
    pink:  ["#FFC9B0", "#E08A66", "#B05234"]
  };

  /* 每个图标：[主配色, 点缀配色, SVG 图形]。
     占位符：{L}=亮顶面 {M}=主正面 {D}=暗侧面 {W}=奶白
              {A}/{AL}/{AD}=点缀色（主/亮/暗）
     图形均为等距体块：顶面平行四边形 + 圆角正面 + 右侧暗面。 */
  var A = {
    home: ["gold", "coral",
      '<path d="M14 28 L21 21 L51 21 L44 28 Z" fill="{L}"/>' +
      '<path d="M44 28 L51 21 L51 45 L44 52 Z" fill="{D}"/>' +
      '<rect x="14" y="28" width="30" height="24" rx="3" fill="{W}"/>' +
      '<path d="M9 30 L29 13 L49 30 Z" fill="{M}"/>' +
      '<path d="M29 13 L51 30 L44 36 L29 23 Z" fill="{L}"/>' +
      '<path d="M9 30 L29 13 L29 23 L9 39 Z" fill="{D}" opacity=".55"/>' +
      '<rect x="26" y="38" width="10" height="14" rx="2" fill="{A}"/>' +
      '<circle cx="31" cy="45" r="1.3" fill="{W}"/><rect x="36" y="33" width="5" height="5" rx="1.2" fill="{M}" opacity=".55"/>' +
      '<rect x="18" y="33" width="6" height="6" rx="1.5" fill="{M}" opacity=".8"/>'],
    map: ["clay", "gold",
      '<path d="M9 23 L23 16 L23 46 L9 53 Z" fill="{D}"/>' +
      '<path d="M23 16 L37 23 L37 53 L23 46 Z" fill="{M}"/>' +
      '<path d="M37 23 L51 16 L51 46 L37 53 Z" fill="{L}"/>' +
      '<path d="M9 23 L23 16 L37 23 L51 16" stroke="{W}" stroke-width="1.8" fill="none" opacity=".75"/>' +
      '<path d="M15 32 L21 29" stroke="{W}" stroke-width="1.4" stroke-linecap="round" fill="none" opacity=".6"/>' +
      '<path d="M27 32 L33 35" stroke="{W}" stroke-width="1.4" stroke-linecap="round" fill="none" opacity=".6"/>' +
      '<path d="M33 16 a8 8 0 0 0 -8 8 c0 6 8 14 8 14 s8-8 8-14 a8 8 0 0 0 -8-8 z" fill="{A}"/>' +
      '<circle cx="19" cy="37" r="1.5" fill="{W}" opacity=".8"/><circle cx="30" cy="44" r="1.5" fill="{W}" opacity=".8"/><path d="M13 28 L19 25 L26 29" stroke="{W}" stroke-width="1.5" fill="none" opacity=".65" stroke-linecap="round"/>' +
      '<circle cx="33" cy="24" r="3" fill="{W}"/>'],
    task: ["clay", "cream",
      '<path d="M14 15 L21 8 L55 8 L48 15 Z" fill="{L}"/>' +
      '<path d="M48 15 L55 8 L55 45 L48 52 Z" fill="{D}"/>' +
      '<rect x="14" y="15" width="34" height="37" rx="4" fill="{W}"/>' +
      '<rect x="25" y="10" width="13" height="9" rx="4" fill="{A}"/>' +
      '<rect x="25" y="10" width="13" height="4" rx="2" fill="{L}"/>' +
      '<path d="M20 28 l3 3 5-6" stroke="{M}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M33 29 L43 29" stroke="{D}" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".55"/>' +
      '<path d="M20 40 l3 3 5-6" stroke="{M}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<rect x="19" y="46" width="24" height="2" rx="1" fill="{D}" opacity=".35"/><circle cx="42" cy="21" r="2" fill="{A}" opacity=".8"/>' +
      '<path d="M33 41 L41 41" stroke="{D}" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".55"/>'],
    know: ["gold", "cream",
      '<path d="M32 23 C25 17 16 16 8 19 L8 45 C16 42 25 43 32 49 Z" fill="{L}"/>' +
      '<path d="M32 23 C39 17 48 16 56 19 L56 45 C48 42 39 43 32 49 Z" fill="{M}"/>' +
      '<path d="M8 45 C16 42 25 43 32 49 L32 53 C25 47 16 46 8 49 Z" fill="{D}"/>' +
      '<path d="M56 45 C48 42 39 43 32 49 L32 53 C39 47 48 46 56 49 Z" fill="{D}"/>' +
      '<path d="M32 23 L32 49" stroke="{D}" stroke-width="2.2" fill="none"/>' +
      '<path d="M13 26 L26 26" stroke="{W}" stroke-width="2" stroke-linecap="round" fill="none" opacity=".9"/>' +
      '<path d="M13 32 L24 32" stroke="{W}" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".7"/>' +
      '<path d="M38 26 L51 26" stroke="{W}" stroke-width="2" stroke-linecap="round" fill="none" opacity=".9"/>' +
      '<path d="M13 39 h11 M40 39 h11" stroke="{W}" stroke-width="1.8" opacity=".7" stroke-linecap="round"/>' +
      '<path d="M38 32 L50 32" stroke="{W}" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".7"/>'],
    me: ["gold", "coral",
      '<circle cx="30" cy="22" r="11" fill="{M}"/>' +
      '<ellipse cx="26.7" cy="18.0" rx="4.4" ry="2.5" fill="#fff" opacity=".42" transform="rotate(-30 26.7 18.0)"/>' +
      '<path d="M13 50 C13 38 20 33 30 33 C40 33 47 38 47 50 Z" fill="{M}"/>' +
      '<path d="M38 34 C43 37 47 42 47 50 L40 50 C40 42 39 37 38 34 Z" fill="{D}"/>' +
      '<path d="M24 36 C26 34 34 34 36 36 L32 42 Z" fill="{W}" opacity=".6"/>' +
      '<circle cx="26" cy="21" r="1.3" fill="{W}" opacity=".8"/><circle cx="34" cy="21" r="1.3" fill="{W}" opacity=".8"/>' +
      '<polygon points="49.0,7.0 50.8,11.5 55.7,11.8 51.9,15.0 53.1,19.7 49.0,17.1 44.9,19.7 46.1,15.0 42.3,11.8 47.2,11.5" fill="{A}"/>'],
    enc: ["gold", "cream",
      '<path d="M13 11 L21 3 L53 3 L45 11 Z" fill="{L}"/>' +
      '<path d="M45 11 L53 3 L53 45 L45 53 Z" fill="{D}"/>' +
      '<rect x="13" y="11" width="32" height="42" rx="4" fill="{M}"/>' +
      '<rect x="13" y="11" width="8" height="42" rx="3" fill="{D}"/>' +
      '<rect x="25" y="20" width="17" height="3.4" rx="1.7" fill="{W}" opacity=".95"/>' +
      '<rect x="25" y="28" width="13" height="2.8" rx="1.4" fill="{W}" opacity=".7"/>' +
      '<rect x="25" y="35" width="15" height="2.8" rx="1.4" fill="{W}" opacity=".7"/>' +
      '<circle cx="38" cy="45" r="5" fill="{A}"/>' +
      '<rect x="25" y="42" width="9" height="2.2" rx="1.1" fill="{W}" opacity=".55"/>' +
      '<path d="M36 45 l1.5 1.6 2.5-3" stroke="{W}" stroke-width="1.8" fill="none" stroke-linecap="round"/>'],
    story: ["gold", "cream",
      '<rect x="17" y="15" width="30" height="34" rx="3" fill="{W}"/>' +
      '<path d="M17 15 L23 11 L53 11 L47 15 Z" fill="{L}"/>' +
      '<rect x="12" y="10" width="40" height="8" rx="4" fill="{M}"/>' +
      '<rect x="12" y="46" width="40" height="8" rx="4" fill="{D}"/>' +
      '<circle cx="14" cy="14" r="4" fill="{L}"/>' +
      '<circle cx="50" cy="50" r="4" fill="{M}"/>' +
      '<path d="M23 24 L41 24" stroke="{D}" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".6"/>' +
      '<path d="M23 31 L38 31" stroke="{D}" stroke-width="2" stroke-linecap="round" fill="none" opacity=".45"/>' +
      '<path d="M23 38 L40 38" stroke="{D}" stroke-width="2" stroke-linecap="round" fill="none" opacity=".45"/>'],
    master: ["gold", "clay",
      '<path d="M14 52 C14 39 21 34 30 34 C39 34 46 39 46 52 Z" fill="{M}"/>' +
      '<path d="M38 35 C43 38 46 43 46 52 L40 52 C40 42 39 38 38 35 Z" fill="{D}"/>' +
      '<circle cx="30" cy="28" r="9" fill="{W}"/>' +
      '<ellipse cx="27.3" cy="24.8" rx="3.6" ry="2.1" fill="#fff" opacity=".42" transform="rotate(-30 27.3 24.8)"/>' +
      '<circle cx="26" cy="29" r="1.5" fill="{D}"/>' +
      '<circle cx="34" cy="29" r="1.5" fill="{D}"/>' +
      '<path d="M12 24 L30 11 L48 24 Z" fill="{A}"/>' +
      '<path d="M30 11 L48 24 L30 24 Z" fill="{AL}"/>' +
      '<path d="M10 24 L50 24 L50 27 L10 27 Z" fill="{AD}"/>' +
      '<path d="M22 41 L30 45 L38 41" stroke="{A}" stroke-width="2.4" fill="none" stroke-linecap="round"/>'],
    timeline: ["clay", "cream",
      '<circle cx="32" cy="33" r="20" fill="{D}"/>' +
      '<circle cx="32" cy="33" r="16.5" fill="{W}"/>' +
      '<circle cx="32" cy="33" r="16.5" fill="{L}" opacity=".22"/>' +
      '<rect x="27" y="8" width="10" height="6" rx="3" fill="{A}"/>' +
      '<path d="M32 33 L32 22" stroke="{D}" stroke-width="3.2" stroke-linecap="round" fill="none"/>' +
      '<path d="M32 33 L41 37" stroke="{D}" stroke-width="3.2" stroke-linecap="round" fill="none"/>' +
      '<circle cx="32" cy="33" r="2.6" fill="{A}"/>' +
      '<path d="M32 18 L32 20" stroke="{M}" stroke-width="2" stroke-linecap="round" fill="none"/>' +
      '<path d="M46 33 L44 33" stroke="{M}" stroke-width="2" stroke-linecap="round" fill="none"/>'],
    fabric: ["gold", "cream",
      '<path d="M14 25 L48 25 L48 45 L14 45 Z" fill="{M}"/>' +
      '<path d="M48 25 L54 20 L54 40 L48 45 Z" fill="{D}"/>' +
      '<path d="M14 25 L20 20 L54 20 L48 25 Z" fill="{L}"/>' +
      '<ellipse cx="14" cy="35" rx="7" ry="10" fill="{L}"/>' +
      '<ellipse cx="14" cy="35" rx="4.6" ry="6.6" fill="{M}" opacity=".85"/>' +
      '<ellipse cx="14" cy="35" rx="2.2" ry="3.2" fill="{D}"/>' +
      '<path d="M22 29 L44 29" stroke="{W}" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".4"/>' +
      '<path d="M22 41 L44 41" stroke="{D}" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".4"/>'],
    craft: ["clay", "gold",
      '<path d="M14 25 L48 25 L44 50 L18 50 Z" fill="{M}"/>' +
      '<path d="M48 25 L52 22 L48 47 L44 50 Z" fill="{D}"/>' +
      '<ellipse cx="31" cy="25" rx="17" ry="6.5" fill="{L}"/>' +
      '<ellipse cx="31" cy="25" rx="12.5" ry="4.2" fill="{D}" opacity=".75"/>' +
      '<ellipse cx="27" cy="24" rx="4" ry="1.4" fill="{W}" opacity=".4"/>' +
      '<rect x="12" y="20" width="38" height="5" rx="2.5" fill="{D}" opacity=".5"/>'],
    game: ["coral", "gold",
      '<rect x="9" y="26" width="46" height="23" rx="11.5" fill="{D}"/>' +
      '<rect x="9" y="23" width="46" height="23" rx="11.5" fill="{M}"/>' +
      '<path d="M14 27 Q32 20 50 27" stroke="{W}" stroke-width="2.4" fill="none" opacity=".35"/>' +
      '<path d="M20 33 h10 M25 28 v10" stroke="{W}" stroke-width="3.6" stroke-linecap="round" fill="none"/>' +
      '<circle cx="42" cy="31" r="3.2" fill="{A}"/>' +
      '<circle cx="48" cy="37" r="3.2" fill="{AL}"/>' +
      '<rect x="28" y="43" width="8" height="2" rx="1" fill="{W}" opacity=".65"/><circle cx="37" cy="26" r="1.6" fill="{W}" opacity=".7"/>' +
      '<circle cx="32" cy="38" r="2" fill="{W}" opacity=".7"/>'],
    checkin: ["coral", "gold",
      '<path d="M12 19 L18 13 L56 13 L50 19 Z" fill="{L}"/>' +
      '<path d="M50 19 L56 13 L56 46 L50 52 Z" fill="{D}"/>' +
      '<rect x="12" y="19" width="38" height="33" rx="4" fill="{W}"/>' +
      '<rect x="10" y="14" width="42" height="9" rx="4" fill="{M}"/>' +
      '<rect x="10" y="14" width="42" height="4" rx="2" fill="{L}"/>' +
      '<rect x="19" y="11" width="5" height="9" rx="2.5" fill="{A}"/>' +
      '<rect x="40" y="11" width="5" height="9" rx="2.5" fill="{A}"/>' +
      '<rect x="19" y="45" width="6" height="2" rx="1" fill="{D}" opacity=".3"/><rect x="29" y="45" width="6" height="2" rx="1" fill="{D}" opacity=".3"/><rect x="39" y="45" width="6" height="2" rx="1" fill="{D}" opacity=".3"/>' +
      '<path d="M22 36 l6 6 12-13" stroke="{M}" stroke-width="4.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'],
    sign: ["cream", "gold",
      '<path d="M12 16 L18 10 L51 10 L45 16 Z" fill="{L}"/>' +
      '<path d="M45 16 L51 10 L51 42 L45 48 Z" fill="{D}"/>' +
      '<rect x="12" y="16" width="33" height="32" rx="4" fill="{W}"/>' +
      '<path d="M19 26 L38 26" stroke="{D}" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".6"/>' +
      '<path d="M19 33 L34 33" stroke="{D}" stroke-width="2" stroke-linecap="round" fill="none" opacity=".45"/>' +
      '<path d="M19 40 L31 40" stroke="{D}" stroke-width="2" stroke-linecap="round" fill="none" opacity=".45"/>' +
      '<g transform="rotate(38 44 34)">' +
      '<rect x="41" y="13" width="7" height="30" rx="2" fill="{A}"/>' +
      '<rect x="41" y="13" width="7" height="6" rx="2" fill="{AL}"/>' +
      '<path d="M41 43 L48 43 L44.5 50 Z" fill="{D}"/>' +
      '</g>'],
    shop: ["gold", "clay",
      '<path d="M14 28 L22 20 L56 20 L48 28 Z" fill="{W}"/>' +
      '<path d="M48 28 L56 20 L56 44 L48 52 Z" fill="{D}"/>' +
      '<rect x="14" y="28" width="34" height="24" rx="2" fill="{W}"/>' +
      '<path d="M8 29 L32 12 L56 29 Z" fill="{A}"/>' +
      '<path d="M32 12 L56 29 L47 29 Z" fill="{AL}" opacity=".8"/>' +
      '<path d="M8 29 L56 29 L56 33 L8 33 Z" fill="{AD}"/>' +
      '<path d="M13 33 L49 33 L45 40 L17 40 Z" fill="{M}"/>' +
      '<path d="M13 33 L19 40 L25 33 Z M25 33 L31 40 L37 33 Z M37 33 L43 40 L49 33 Z" fill="{W}" opacity=".85"/>' +
      '<rect x="27" y="41" width="11" height="11" rx="1.5" fill="{L}"/>' +
      '<rect x="38" y="41" width="6" height="6" rx="1" fill="{L}" opacity=".8"/><circle cx="31" cy="47" r="1.2" fill="{W}"/>' +
      '<rect x="17" y="41" width="7" height="6" rx="1" fill="{L}" opacity=".85"/>'],
    box: ["gold", "coral",
      '<path d="M14 27 L22 19 L56 19 L48 27 Z" fill="{L}"/>' +
      '<path d="M48 27 L56 19 L56 44 L48 52 Z" fill="{D}"/>' +
      '<rect x="14" y="27" width="34" height="25" rx="3" fill="{M}"/>' +
      '<path d="M14 27 L22 19 L56 19 L48 27 Z" fill="{L}"/>' +
      '<path d="M27 19 L35 19 L35 52 L27 52 Z" fill="{A}"/>' +
      '<path d="M27 19 L35 19 L43 11 L35 11 Z" fill="{AL}"/>' +
      '<path d="M43 27 L51 19 L51 44 L43 52 Z" fill="{D}"/>' +
      '<ellipse cx="24" cy="16" rx="8" ry="5" transform="rotate(-22 24 16)" fill="{A}"/>' +
      '<ellipse cx="42" cy="16" rx="8" ry="5" transform="rotate(22 42 16)" fill="{A}"/>' +
      '<path d="M17 34 L24 34 M17 40 L24 40" stroke="{W}" stroke-width="1.4" opacity=".45" stroke-linecap="round"/>' +
      '<circle cx="33" cy="18" r="4" fill="{AL}"/>'],
    ach: ["gold", "cream",
      '<path d="M17 13 L47 13 L43 33 L21 33 Z" fill="{M}"/>' +
      '<ellipse cx="32" cy="13" rx="15" ry="4.5" fill="{L}"/>' +
      '<ellipse cx="32" cy="13" rx="11" ry="2.8" fill="{D}" opacity=".45"/>' +
      '<path d="M17 17 C8 17 8 31 21 31" stroke="{D}" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M47 17 C56 17 56 31 43 31" stroke="{D}" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M21 33 L43 33 L41 39 L23 39 Z" fill="{D}"/>' +
      '<polygon points="32.0,16.5 33.7,20.7 38.2,21.0 34.7,23.9 35.8,28.3 32.0,25.9 28.2,28.3 29.3,23.9 25.8,21.0 30.3,20.7" fill="{W}"/>' +
      '<rect x="28" y="39" width="8" height="6" fill="{A}"/>' +
      '<path d="M20 45 L44 45 L48 52 L16 52 Z" fill="{A}"/>' +
      '<path d="M16 52 L48 52 L48 55 L16 55 Z" fill="{AD}"/>'],
    cert: ["cream", "coral",
      '<path d="M12 17 L18 11 L56 11 L50 17 Z" fill="{L}"/>' +
      '<path d="M50 17 L56 11 L56 40 L50 46 Z" fill="{D}"/>' +
      '<rect x="12" y="17" width="38" height="29" rx="3" fill="{W}"/>' +
      '<path d="M19 25 L42 25" stroke="{D}" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".55"/>' +
      '<path d="M19 31 L39 31" stroke="{D}" stroke-width="2" stroke-linecap="round" fill="none" opacity=".4"/>' +
      '<path d="M19 37 L35 37" stroke="{D}" stroke-width="2" stroke-linecap="round" fill="none" opacity=".4"/>' +
      '<circle cx="41" cy="38" r="6" fill="{A}"/>' +
      '<circle cx="41" cy="38" r="3.6" fill="{W}" opacity=".55"/>' +
      '<path d="M19 42 h12" stroke="{D}" stroke-width="1.8" opacity=".35" stroke-linecap="round"/>' +
      '<rect x="10" y="46" width="42" height="7" rx="3.5" fill="{M}"/>'],
    report: ["clay", "gold",
      '<path d="M10 44 L14 40 L56 40 L52 44 Z" fill="{L}"/>' +
      '<path d="M52 44 L56 40 L56 49 L52 53 Z" fill="{D}"/>' +
      '<rect x="10" y="44" width="42" height="9" rx="2" fill="{D}"/>' +
      '<path d="M15 32 L19 28 L28 28 L24 32 Z" fill="{L}"/>' +
      '<path d="M24 32 L28 28 L28 41 L24 45 Z" fill="{D}"/>' +
      '<rect x="15" y="32" width="9" height="13" rx="2" fill="{M}"/>' +
      '<path d="M28 21 L32 17 L41 17 L37 21 Z" fill="{AL}"/>' +
      '<path d="M37 21 L41 17 L41 41 L37 45 Z" fill="{AD}"/>' +
      '<rect x="28" y="21" width="9" height="24" rx="2" fill="{A}"/>' +
      '<path d="M41 28 L45 24 L54 24 L50 28 Z" fill="{L}"/>' +
      '<path d="M50 28 L54 24 L54 41 L50 45 Z" fill="{D}"/>' +
      '<rect x="41" y="28" width="9" height="17" rx="2" fill="{M}"/>'],
    title: ["gold", "coral",
      '<circle cx="32" cy="25" r="16" fill="{D}"/>' +
      '<circle cx="32" cy="25" r="13" fill="{M}"/>' +
      '<circle cx="32" cy="25" r="9.5" fill="{L}"/>' +
      '<polygon points="32.0,18.5 33.7,22.7 38.2,23.0 34.7,25.9 35.8,30.3 32.0,27.9 28.2,30.3 29.3,25.9 25.8,23.0 30.3,22.7" fill="{W}"/>' +
      '<path d="M22 38 L18 54 L30 48 L32 38 Z" fill="{A}"/>' +
      '<path d="M42 38 L46 54 L34 48 L32 38 Z" fill="{AD}"/>'],
    inventory: ["gold", "cream",
      '<path d="M12 27 L20 19 L58 19 L50 27 Z" fill="{L}"/>' +
      '<path d="M50 27 L58 19 L58 44 L50 52 Z" fill="{D}"/>' +
      '<rect x="12" y="27" width="38" height="25" rx="3" fill="{M}"/>' +
      '<path d="M10 19 L18 13 L54 13 L46 19 Z" fill="{L}"/>' +
      '<rect x="10" y="19" width="36" height="8" rx="2" fill="{AL}"/>' +
      '<path d="M46 19 L54 13 L54 21 L46 27 Z" fill="{D}"/>' +
      '<rect x="27" y="24" width="8" height="10" rx="2" fill="{A}"/>' +
      '<rect x="27" y="24" width="8" height="4" rx="2" fill="{W}" opacity=".5"/>'],
    share: ["coral", "cream",
      '<path d="M10 22 L16 16 L58 16 L52 22 Z" fill="{L}"/>' +
      '<path d="M52 22 L58 16 L58 46 L52 52 Z" fill="{D}"/>' +
      '<rect x="10" y="22" width="42" height="30" rx="8" fill="{M}"/>' +
      '<circle cx="21" cy="37" r="5" fill="{W}"/>' +
      '<circle cx="42" cy="28" r="5" fill="{W}"/>' +
      '<circle cx="42" cy="46" r="5" fill="{W}"/>' +
      '<path d="M25 35 L38 30" stroke="{W}" stroke-width="2.6" stroke-linecap="round" fill="none"/>' +
      '<path d="M25 39 L38 45" stroke="{W}" stroke-width="2.6" stroke-linecap="round" fill="none"/>'],
    avatar: ["coral", "cream",
      '<path d="M13 11 L19 5 L57 5 L51 11 Z" fill="{L}"/>' +
      '<path d="M51 11 L57 5 L57 47 L51 53 Z" fill="{D}"/>' +
      '<rect x="13" y="11" width="38" height="42" rx="9" fill="{M}"/>' +
      '<rect x="18" y="16" width="28" height="32" rx="7" fill="{W}" opacity=".92"/>' +
      '<circle cx="32" cy="28" r="7" fill="{M}"/>' +
      '<ellipse cx="29.9" cy="25.5" rx="2.8" ry="1.6" fill="#fff" opacity=".42" transform="rotate(-30 29.9 25.5)"/>' +
      '<path d="M21 46 C21 38 26 35 32 35 C38 35 43 38 43 46 Z" fill="{M}"/>' +
      '<path d="M21 46 C21 38 26 35 32 35 C38 35 43 38 43 46 Z" fill="{D}" opacity=".2"/>'],
    frame: ["gold", "cream",
      '<path d="M12 14 L18 8 L56 8 L50 14 Z" fill="{L}"/>' +
      '<path d="M50 14 L56 8 L56 44 L50 50 Z" fill="{D}"/>' +
      '<rect x="12" y="14" width="38" height="36" rx="3" fill="{M}"/>' +
      '<rect x="17" y="19" width="28" height="26" rx="2" fill="{W}"/>' +
      '<path d="M17 40 L26 29 L32 35 L38 27 L45 40 Z" fill="{A}"/>' +
      '<circle cx="38" cy="24" r="3" fill="{AL}"/>'],
    settings: ["gold", "cream",
      '<rect x="29" y="6" width="6" height="12" rx="2" fill="{D}" transform="rotate(0 32 32)"/>' +
      '<rect x="29" y="6" width="6" height="12" rx="2" fill="{D}" transform="rotate(45 32 32)"/>' +
      '<rect x="29" y="6" width="6" height="12" rx="2" fill="{D}" transform="rotate(90 32 32)"/>' +
      '<rect x="29" y="6" width="6" height="12" rx="2" fill="{D}" transform="rotate(135 32 32)"/>' +
      '<rect x="29" y="6" width="6" height="12" rx="2" fill="{D}" transform="rotate(180 32 32)"/>' +
      '<rect x="29" y="6" width="6" height="12" rx="2" fill="{D}" transform="rotate(225 32 32)"/>' +
      '<rect x="29" y="6" width="6" height="12" rx="2" fill="{D}" transform="rotate(270 32 32)"/>' +
      '<rect x="29" y="6" width="6" height="12" rx="2" fill="{D}" transform="rotate(315 32 32)"/>' +
      '<circle cx="32" cy="32" r="17" fill="{M}"/>' +
      '<circle cx="32" cy="32" r="13" fill="{L}" opacity=".55"/>' +
      '<circle cx="32" cy="32" r="7.5" fill="{W}"/>' +
      '<circle cx="32" cy="32" r="4" fill="{A}"/>'],
    teacher: ["gold", "cream",
      '<path d="M10 14 L16 8 L58 8 L52 14 Z" fill="{L}"/>' +
      '<path d="M52 14 L58 8 L58 38 L52 44 Z" fill="{D}"/>' +
      '<rect x="10" y="14" width="42" height="30" rx="3" fill="{D}"/>' +
      '<rect x="15" y="19" width="32" height="20" rx="2" fill="{M}" opacity=".45"/>' +
      '<path d="M20 26 L37 26" stroke="{W}" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".9"/>' +
      '<path d="M20 33 L32 33" stroke="{W}" stroke-width="2" stroke-linecap="round" fill="none" opacity=".7"/>' +
      '<path d="M36 30 l3 3 5-6" stroke="{A}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<rect x="12" y="45" width="38" height="4" rx="2" fill="{L}"/>' +
      '<rect x="16" y="44" width="10" height="3" rx="1.5" fill="{A}"/>' +
      '<path d="M45 42 L52 20" stroke="{A}" stroke-width="2.4" stroke-linecap="round"/>'],
    ue: ["gold", "coral",
      '<path d="M32 11 L54 23 L32 35 L10 23 Z" fill="{L}"/>' +
      '<path d="M10 23 L32 35 L32 55 L10 43 Z" fill="{M}"/>' +
      '<path d="M54 23 L32 35 L32 55 L54 43 Z" fill="{D}"/>' +
      '<path d="M32 11 L54 23 L32 35 L10 23 Z" fill="#fff" opacity=".12"/>' +
      '<path d="M32 11 L32 35" stroke="{W}" stroke-width="1.4" opacity=".35" fill="none"/>' +
      '<circle cx="32" cy="23" r="3" fill="{A}" opacity=".9"/>'],
    map3d: ["clay", "gold",
      '<path d="M32 11 L54 23 L32 35 L10 23 Z" fill="{L}"/>' +
      '<path d="M10 23 L32 35 L32 55 L10 43 Z" fill="{M}"/>' +
      '<path d="M54 23 L32 35 L32 55 L54 43 Z" fill="{D}"/>' +
      '<path d="M32 11 L54 23 L32 35 L10 23 Z" fill="#fff" opacity=".12"/>' +
      '<path d="M33 8 a7 7 0 0 0 -7 7 c0 5 7 12 7 12 s7-7 7-12 a7 7 0 0 0 -7-7 z" fill="{A}"/>' +
      '<circle cx="33" cy="15" r="2.6" fill="{W}"/>'],
    realmap: ["clay", "gold",
      '<circle cx="32" cy="32" r="20" fill="{M}"/>' +
      '<ellipse cx="26.0" cy="24.8" rx="8.0" ry="4.6" fill="#fff" opacity=".42" transform="rotate(-30 26.0 24.8)"/>' +
      '<path d="M19 24 C24 20 29 22 32 25 C36 21 42 22 44 27 C42 32 38 33 35 36 C33 39 30 42 27 43 C23 41 21 36 19 33 Z" fill="{A}" opacity=".9"/>' +
      '<ellipse cx="32" cy="32" rx="20" ry="8" fill="none" stroke="{W}" stroke-width="1.5" opacity=".55"/>' +
      '<ellipse cx="32" cy="32" rx="9" ry="20" fill="none" stroke="{W}" stroke-width="1.5" opacity=".55"/>'],
    ai: ["clay", "gold",
      '<path d="M15 20 L21 14 L55 14 L49 20 Z" fill="{L}"/>' +
      '<path d="M49 20 L55 14 L55 41 L49 47 Z" fill="{D}"/>' +
      '<rect x="15" y="20" width="34" height="27" rx="8" fill="{M}"/>' +
      '<rect x="12" y="28" width="5" height="12" rx="2.5" fill="{A}"/>' +
      '<rect x="47" y="28" width="5" height="12" rx="2.5" fill="{A}"/>' +
      '<path d="M32 20 L32 14" stroke="{D}" stroke-width="2.4" stroke-linecap="round" fill="none"/>' +
      '<circle cx="32" cy="12" r="3" fill="{A}"/>' +
      '<circle cx="25" cy="32" r="4" fill="{W}"/>' +
      '<circle cx="39" cy="32" r="4" fill="{W}"/>' +
      '<circle cx="25" cy="32" r="2" fill="{D}"/>' +
      '<circle cx="39" cy="32" r="2" fill="{D}"/>' +
      '<rect x="22" y="45" width="20" height="2" rx="1" fill="{W}" opacity=".55"/>' +
      '<rect x="27" y="40" width="10" height="2.6" rx="1.3" fill="{W}" opacity=".85"/>'],
    scan: ["clay", "cream",
      '<path d="M11 22 V15 Q11 11 15 11 H22 M42 11 H49 Q53 11 53 15 V22 M53 42 V49 Q53 53 49 53 H42 M22 53 H15 Q11 53 11 49 V42" stroke="{M}" stroke-width="4" stroke-linecap="round" fill="none"/>' +
      '<rect x="18" y="24" width="3" height="18" rx="1" fill="{D}"/>' +
      '<rect x="24" y="24" width="2" height="18" rx="1" fill="{D}"/>' +
      '<rect x="30" y="24" width="4" height="18" rx="1" fill="{D}"/>' +
      '<rect x="37" y="24" width="2" height="18" rx="1" fill="{D}"/>' +
      '<rect x="43" y="24" width="3" height="18" rx="1" fill="{D}"/>' +
      '<rect x="13" y="32" width="38" height="2.6" rx="1.3" fill="{A}"/>'],
    search: ["clay", "cream",
      '<circle cx="27" cy="27" r="15" fill="{D}"/>' +
      '<circle cx="27" cy="27" r="12" fill="{W}"/>' +
      '<circle cx="27" cy="27" r="12" fill="{L}" opacity=".3"/>' +
      '<path d="M18 20 A11 11 0 0 1 27 16" stroke="#fff" stroke-width="2.4" fill="none" opacity=".65" stroke-linecap="round"/>' +
      '<rect x="37" y="37" width="7" height="18" rx="3.5" fill="{M}" transform="rotate(-45 40.5 46)"/>' +
      '<rect x="37" y="37" width="7" height="6" rx="3" fill="{A}" transform="rotate(-45 40.5 46)"/>'],
    notice: ["clay", "gold",
      '<path d="M12 27 L32 27 L46 14 L46 50 L32 37 L12 37 Z" fill="{M}"/>' +
      '<path d="M46 14 L51 11 L51 53 L46 50 Z" fill="{D}"/>' +
      '<path d="M12 27 L18 22 L18 42 L12 37 Z" fill="{L}"/>' +
      '<rect x="22" y="37" width="8" height="12" rx="2" fill="{D}"/>' +
      '<path d="M52 23 Q58 32 52 41" stroke="{A}" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M55 17 Q63 32 55 47" stroke="{A}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".6"/>'],
    quiz: ["cream", "gold",
      '<path d="M12 16 L18 10 L56 10 L50 16 Z" fill="{L}"/>' +
      '<path d="M50 16 L56 10 L56 44 L50 50 Z" fill="{D}"/>' +
      '<rect x="12" y="16" width="38" height="34" rx="4" fill="{W}"/>' +
      '<path d="M26 27 a6 6 0 1 1 6 6 v3.5" stroke="{A}" stroke-width="3.6" fill="none" stroke-linecap="round"/>' +
      '<circle cx="32" cy="42" r="2.4" fill="{A}"/>' +
      '<path d="M19 22 L24 22" stroke="{D}" stroke-width="2" stroke-linecap="round" fill="none" opacity=".5"/>'],
    mud: ["gold", "clay",
      '<path d="M15 26 L47 26 L43 50 L19 50 Z" fill="{M}"/>' +
      '<path d="M47 26 L51 23 L47 47 L43 50 Z" fill="{D}"/>' +
      '<ellipse cx="31" cy="26" rx="16" ry="6" fill="{L}"/>' +
      '<ellipse cx="31" cy="26" rx="11.5" ry="3.8" fill="{D}" opacity=".8"/>' +
      '<path d="M31 8 C36.4 13.4 35.32 18.2 31 18.8 C26.68 18.2 25.6 13.4 31 8 Z" fill="{A}"/>' +
      '<ellipse cx="29" cy="12" rx="1.8" ry="2.4" fill="{W}" opacity=".5"/>'],
    rhythm: ["gold", "coral",
      '<circle cx="24" cy="38" r="12" fill="{D}"/>' +
      '<circle cx="24" cy="38" r="9" fill="{M}"/>' +
      '<ellipse cx="21" cy="35" rx="3.6" ry="2.2" fill="{W}" opacity=".45" transform="rotate(-25 21 35)"/>' +
      '<rect x="44" y="12" width="4" height="30" rx="2" fill="{A}"/>' +
      '<path d="M44 12 Q56 10 56 18 Q56 24 48 24" stroke="{A}" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<circle cx="42" cy="42" r="7" fill="{AL}"/>'],
    sort: ["clay", "gold",
      '<path d="M11 14 L16 9 L38 9 L33 14 Z" fill="{L}"/>' +
      '<path d="M33 14 L38 9 L38 20 L33 25 Z" fill="{D}"/>' +
      '<rect x="11" y="14" width="22" height="11" rx="3" fill="{M}"/>' +
      '<path d="M24 27 L29 22 L51 22 L46 27 Z" fill="{AL}"/>' +
      '<path d="M46 27 L51 22 L51 33 L46 38 Z" fill="{AD}"/>' +
      '<rect x="24" y="27" width="22" height="11" rx="3" fill="{A}"/>' +
      '<path d="M11 40 L16 35 L38 35 L33 40 Z" fill="{L}"/>' +
      '<path d="M33 40 L38 35 L38 46 L33 51 Z" fill="{D}"/>' +
      '<rect x="11" y="40" width="22" height="11" rx="3" fill="{M}"/>' +
      '<path d="M40 16 L48 16 M44 12 L48 16 L44 20" stroke="{W}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M40 45 L48 45 M44 41 L48 45 L44 49" stroke="{W}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'],
    memory: ["gold", "cream",
      '<g transform="rotate(-14 26 32)">' +
      '<path d="M10 18 L15 13 L39 13 L34 18 Z" fill="{L}"/>' +
      '<path d="M34 18 L39 13 L39 43 L34 48 Z" fill="{D}"/>' +
      '<rect x="10" y="18" width="24" height="30" rx="4" fill="{W}"/>' +
      '</g>' +
      '<g transform="rotate(12 38 32)">' +
      '<path d="M27 18 L32 13 L56 13 L51 18 Z" fill="{AL}"/>' +
      '<path d="M51 18 L56 13 L56 43 L51 48 Z" fill="{D}"/>' +
      '<rect x="27" y="18" width="24" height="30" rx="4" fill="{M}"/>' +
      '</g>' +
      '<polygon points="39.0,25.0 40.8,29.5 45.7,29.8 41.9,33.0 43.1,37.7 39.0,35.1 34.9,37.7 36.1,33.0 32.3,29.8 37.2,29.5" fill="{A}"/>'],
    lane: ["clay", "gold",
      '<rect x="10" y="9" width="44" height="45" rx="8" fill="{W}" opacity=".6"/>' +
      '<path d="M21 10 L21 53" stroke="{D}" stroke-width="1.4" stroke-linecap="round" fill="none" opacity=".22"/>' +
      '<path d="M32 10 L32 53" stroke="{D}" stroke-width="1.4" stroke-linecap="round" fill="none" opacity=".22"/>' +
      '<path d="M43 10 L43 53" stroke="{D}" stroke-width="1.4" stroke-linecap="round" fill="none" opacity=".22"/>' +
      '<rect x="10" y="46" width="44" height="3.4" rx="1.7" fill="{A}"/>' +
      '<path d="M13 12 L15 10 L23 10 L21 12 Z" fill="{AL}"/>' +
      '<path d="M21 12 L23 10 L23 20 L21 22 Z" fill="{AD}"/>' +
      '<rect x="13" y="12" width="8" height="10" rx="2" fill="{A}"/>' +
      '<path d="M35 26 L37 24 L45 24 L43 26 Z" fill="{L}"/>' +
      '<path d="M43 26 L45 24 L45 34 L43 36 Z" fill="{D}"/>' +
      '<rect x="35" y="26" width="8" height="10" rx="2" fill="{M}"/>' +
      '<path d="M24 38 L26 36 L34 36 L32 38 Z" fill="{AL}"/>' +
      '<path d="M32 38 L34 36 L34 44 L32 46 Z" fill="{AD}"/>' +
      '<rect x="24" y="38" width="8" height="8" rx="2" fill="{A}"/>'],
    sun: ["gold", "coral",
      '<rect x="30" y="4" width="4" height="10" rx="2" fill="{A}" transform="rotate(0 32 32)"/>' +
      '<rect x="30" y="4" width="4" height="10" rx="2" fill="{A}" transform="rotate(45 32 32)"/>' +
      '<rect x="30" y="4" width="4" height="10" rx="2" fill="{A}" transform="rotate(90 32 32)"/>' +
      '<rect x="30" y="4" width="4" height="10" rx="2" fill="{A}" transform="rotate(135 32 32)"/>' +
      '<rect x="30" y="4" width="4" height="10" rx="2" fill="{A}" transform="rotate(180 32 32)"/>' +
      '<rect x="30" y="4" width="4" height="10" rx="2" fill="{A}" transform="rotate(225 32 32)"/>' +
      '<rect x="30" y="4" width="4" height="10" rx="2" fill="{A}" transform="rotate(270 32 32)"/>' +
      '<rect x="30" y="4" width="4" height="10" rx="2" fill="{A}" transform="rotate(315 32 32)"/>' +
      '<circle cx="32" cy="32" r="14" fill="{M}"/>' +
      '<ellipse cx="27.8" cy="27.0" rx="5.6" ry="3.2" fill="#fff" opacity=".42" transform="rotate(-30 27.8 27.0)"/>' +
      '<circle cx="32" cy="32" r="10" fill="{L}" opacity=".7"/>' +
      '<circle cx="28" cy="28" r="3.4" fill="{W}" opacity=".5"/>'],
    play: ["clay", "cream",
      '<circle cx="32" cy="32" r="20" fill="{M}"/>' +
      '<ellipse cx="26.0" cy="24.8" rx="8.0" ry="4.6" fill="#fff" opacity=".42" transform="rotate(-30 26.0 24.8)"/>' +
      '<circle cx="32" cy="32" r="16.5" fill="{L}" opacity=".35"/>' +
      '<path d="M26 22 L44 32 L26 42 Z" fill="{W}"/>' +
      '<path d="M26 22 L26 42 L29 40 L29 24 Z" fill="{D}" opacity=".25"/>'],
    rain: ["clay", "cream",
      '<circle cx="23" cy="26" r="10" fill="{W}"/>' +
      '<circle cx="35" cy="23" r="12" fill="{W}"/>' +
      '<circle cx="44" cy="28" r="9" fill="{W}"/>' +
      '<path d="M14 28 Q32 16 50 28 L50 35 L14 35 Z" fill="{L}"/>' +
      '<path d="M14 28 Q32 16 50 28" stroke="{W}" stroke-width="2" fill="none" opacity=".8"/>' +
      '<path d="M22 41 C26.5 45.5 25.6 49.5 22 50.0 C18.4 49.5 17.5 45.5 22 41 Z" fill="{M}"/>' +
      '<path d="M33 43 C37.5 47.5 36.6 51.5 33 52.0 C29.4 51.5 28.5 47.5 33 43 Z" fill="{M}"/>' +
      '<path d="M44 41 C48.5 45.5 47.6 49.5 44 50.0 C40.4 49.5 39.5 45.5 44 41 Z" fill="{M}"/>'],
    coin: ["gold", "cream",
      '<g transform="rotate(-16 32 32)">' +
      '<rect x="14" y="25" width="36" height="18" rx="9" fill="{D}"/>' +
      '<ellipse cx="32" cy="25" rx="18" ry="9" fill="{L}"/>' +
      '<ellipse cx="32" cy="25" rx="13.5" ry="6.4" fill="{M}"/>' +
      '<ellipse cx="32" cy="25" rx="9" ry="4" fill="{A}" opacity=".5"/>' +
      '<path d="M28 22 h8 M32 19 v8" stroke="{W}" stroke-width="2.2" stroke-linecap="round"/>' +
      '</g>'],
    flame: ["gold", "coral",
      '<path d="M32 14 C50.0 32.0 46.4 48.0 32 50.0 C17.6 48.0 14.0 32.0 32 14 Z" fill="{M}"/>' +
      '<path d="M32 26 C42.8 36.8 40.64 46.4 32 47.6 C23.36 46.4 21.2 36.8 32 26 Z" fill="{L}"/>' +
      '<path d="M32 36 C37.4 41.4 36.32 46.2 32 46.8 C27.68 46.2 26.6 41.4 32 36 Z" fill="{A}"/>' +
      '<ellipse cx="27" cy="28" rx="3" ry="5" fill="{W}" opacity=".28" transform="rotate(-20 27 28)"/>'],
    signal: ["clay", "gold",
      '<path d="M27 46 L32 16 L37 46 Z" fill="{M}"/>' +
      '<path d="M32 16 L37 46 L34 46 L32 24 Z" fill="{D}"/>' +
      '<ellipse cx="32" cy="48" rx="14" ry="4" fill="{L}"/>' +
      '<path d="M22 22 Q32 8 42 22" stroke="{A}" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M17 15 Q32 -3 47 15" stroke="{A}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".6"/>' +
      '<circle cx="32" cy="14" r="3.5" fill="{A}"/>'],
    river: ["clay", "cream",
      '<path d="M32 12 C48.2 28.2 44.96 42.6 32 44.4 C19.04 42.6 15.8 28.2 32 12 Z" fill="{M}"/>' +
      '<path d="M32 21 C41.9 30.9 39.92 39.7 32 40.8 C24.08 39.7 22.1 30.9 32 21 Z" fill="{L}"/>' +
      '<ellipse cx="27" cy="24" rx="3" ry="5" fill="{W}" opacity=".45" transform="rotate(-20 27 24)"/>' +
      '<path d="M14 47 Q32 40 50 47" stroke="{A}" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M18 53 Q32 48 46 53" stroke="{A}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".6"/>'],
    default: ["clay", "gold",
      '<path d="M32 11 L54 23 L32 35 L10 23 Z" fill="{L}"/>' +
      '<path d="M10 23 L32 35 L32 55 L10 43 Z" fill="{M}"/>' +
      '<path d="M54 23 L32 35 L32 55 L54 43 Z" fill="{D}"/>' +
      '<path d="M32 11 L54 23 L32 35 L10 23 Z" fill="#fff" opacity=".12"/>' +
      '<polygon points="32.0,17.0 33.6,20.9 37.7,21.1 34.5,23.8 35.5,27.9 32.0,25.6 28.5,27.9 29.5,23.8 26.3,21.1 30.4,20.9" fill="{A}"/>'],
  };

  /* emoji / 别名 → 图标名映射（用于全站自动升级） */
  var EMOJI_MAP = {
    "🏠": "home", "🗺️": "map", "🗺": "map", "🎯": "task", "📚": "know", "🏅": "me",
    "👤": "me", "🙋": "me", "📖": "story", "📜": "story", "👨‍🦳": "master", "👨‍🏫": "teacher",
    "📕": "enc", "📔": "enc", "🎮": "game", "🛒": "shop", "🏪": "shop", "🎁": "box",
    "📅": "sign", "🗓️": "sign", "✅": "checkin", "📤": "share", "🤖": "ai", "💡": "quiz",
    "🧠": "quiz", "🖐️": "mud", "🫧": "rhythm", "🔀": "sort", "🃏": "memory", "🍂": "lane",
    "🔗": "ue", "🧊": "map3d", "📍": "realmap", "📷": "scan", "📊": "report", "🏆": "ach",
    "📢": "notice", "📣": "notice", "📣️": "notice",
    "👑": "title", "⭐": "inventory", "⚙️": "settings", "⚙": "settings", "⏰": "timeline",
    "🕰️": "timeline", "🖼️": "avatar", "🖼": "frame", "🧵": "craft", "☀️": "sun",
    "🌊": "river", "🔍": "search", "📄": "cert", "🎓": "cert", "💧": "river",
    "🪙": "ach", "✨": "ach", "🔥": "checkin", "🌿": "craft", "🧾": "cert",
    "🔊": "settings", "📳": "settings", "🗣️": "ai", "🌙": "settings", "🔎": "search",
    "📁": "inventory", "🗂️": "inventory", "🚪": "settings", "🏛️": "enc", "🌍": "realmap",
    "📈": "report", "🎨": "frame", "💬": "ai", "❓": "quiz", "🎵": "rhythm",
    "🧩": "sort", "🎴": "memory", "🌧️": "lane", "🥁": "rhythm",
    "⏳": "timeline", "🎉": "ach", "✎": "settings", "ℹ️": "ai", "⬜": "task",
    "⭕": "task", "🏷️": "enc", "🧭": "map", "🗿": "master",
    "💍": "frame", "🧣": "fabric", "👘": "fabric", "🪭": "craft", "🌾": "craft",
    "📐": "sort", "🛍️": "shop", "💎": "inventory", "🎖️": "ach",
    "📋": "task", "🗒️": "task", "🔔": "sign", "⚡": "ue",
    "🌤️": "sun", "🌞": "sun", "☁️": "lane", "🌱": "craft", "🏡": "home",
    "🔬": "report", "📡": "signal", "🛰️": "ue", "🗣": "ai",
    "▶": "play", "➤": "play", "⏯": "play", "🕹️": "play", "🎬": "play",
    "🌧️": "rain", "🌧": "rain", "☔": "rain", "🌦️": "rain",
    "🪙": "coin", "💰": "coin", "🤑": "coin", "🏅": "coin",
    "🔥": "flame", "🕯️": "flame", "♨️": "flame",
    "📶": "signal", "📡️": "signal", "📻": "signal", "🔅": "signal",
    "🏫": "home", "🏫️": "home", "🏫": "home", "🎭": "avatar", "🧑‍🎓": "cert",
    "🗓": "sign", "🖊️": "settings", "🔖": "inventory", "📇": "me",
    "🏵️": "ach", "🥇": "ach", "🎗️": "ach", "🔡": "settings"
  };

  /* 名称别名 */
  var ALIAS = {
    encyc: "enc", encyclopedia: "enc", stories: "story", masters: "master",
    calendar: "sign", shop: "shop", blindbox: "box", games: "game",
    certificate: "cert", achievement: "ach", profile: "avatar",
    points: "map",     tasks: "task", knowledge: "know", report: "report",
    settings: "settings", realmap: "realmap", map3d: "map3d", ue: "ue",
    play: "play", rain: "rain", coin: "coin", flame: "flame", signal: "signal"
  };

  var seq = 0;

  function resolve(name) {
    name = String(name || "default").toLowerCase();
    name = ALIAS[name] || name;
    return A[name] ? name : "default";
  }

  /** 生成一枚等距 3D 拟物图标（v4.4 精修：加厚体块 + 奶白柔光 + 软圆角 + 柔阴影）。
      图形本身已含「亮顶面 / 主正面 / 暗侧面」；这里统一补四层：
        · 右下暗面副本（+2px 偏移）—— 明确的背光厚度
        · 顶面亮边副本（-3px 偏移）—— 受光的顶面
        · 色块同色圆角描边 —— 软边黏土感
        · 轮廓内奶白柔光斑 + 上亮下暗渐变 —— 大面积亮面
  */
  function svg(name) {
    var key = resolve(name);
    var def = A[key];
    var pal = C[def[0]] || C.clay;
    var acc = C[def[1]] || C.gold;
    var uid = "i3d_" + key + "_" + (++seq);
    var bl = uid + "_bl", cl = uid + "_cl", gl = uid + "_gl", sh = uid + "_sh", rg = uid + "_rg";
    var mt = uid + "_mt", md = uid + "_md";

    /* 占位符替换为 CSS 变量（带原色 fallback）：
       默认主题沿用香云纱暖色；换肤时由 body[data-skin] 定义 --ic-* 让图标整体跟随主题变色。
       注意 recolor()/art 描边也复用这些变量字符串，SVG 内 var() 会被浏览器正确解析。 */
    var raw = def[2]
      .replace(/\{AL\}/g, "var(--ic-al," + acc[0] + ")")
      .replace(/\{AD\}/g, "var(--ic-ad," + acc[2] + ")")
      .replace(/\{A\}/g,  "var(--ic-a,"  + acc[1] + ")")
      .replace(/\{L\}/g,  "var(--ic-l,"  + pal[0] + ")")
      .replace(/\{M\}/g,  "var(--ic-m,"  + pal[1] + ")")
      .replace(/\{D\}/g,  "var(--ic-d,"  + pal[2] + ")")
      .replace(/\{W\}/g,  "var(--ic-w,#FFFCF2)");

    // 只替换实心填充，保留 fill="none" 的线条元素
    function recolor(art, col) {
      return art.replace(/fill="(?!none)[^"]*"/g, 'fill="' + col + '"');
    }
    var darkSide = recolor(raw, "#3A2516");
    var lightTop = recolor(raw, "#FFF6E8");

    // 色块补同色圆角描边：尖角 -> 软边
    var art = raw.replace(/<(path|rect|polygon|ellipse|circle)([^>]*?)\/>/g, function (tag, nm, at) {
      if (/stroke=/.test(at)) return tag;
      var fm = /fill="([^"]+)"/.exec(at);
      if (!fm || fm[1] === "none") return tag;
      return '<' + nm + at + ' stroke="' + fm[1] + '" stroke-width="3" ' +
             'stroke-linejoin="round" stroke-linecap="round"/>';
    });

    var hi = '<path d="M10 20 Q22 7 34 8 Q47 8 54 18" fill="none" stroke="#FFF7EA" ' +
             'stroke-width="2.4" stroke-linecap="round" opacity=".42"/>';

    return '<svg class="ico3d-svg" viewBox="3 3 58 58" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<defs>' +
        '<filter id="' + bl + '" x="-60%" y="-200%" width="220%" height="500%">' +
          '<feGaussianBlur stdDeviation="2.6"/>' +
        '</filter>' +
        '<linearGradient id="' + mt + '_g" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#fff"/>' +
          '<stop offset="46%" stop-color="#fff"/>' +
          '<stop offset="100%" stop-color="#000"/>' +
        '</linearGradient>' +
        '<linearGradient id="' + md + '_g" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#000"/>' +
          '<stop offset="54%" stop-color="#000"/>' +
          '<stop offset="100%" stop-color="#fff"/>' +
        '</linearGradient>' +
        '<mask id="' + mt + '"><rect x="0" y="0" width="64" height="64" fill="url(#' + mt + '_g)"/></mask>' +
        '<mask id="' + md + '"><rect x="0" y="0" width="64" height="64" fill="url(#' + md + '_g)"/></mask>' +
        // 奶白柔光斑：左上大面积亮面（参考图质感）
        '<radialGradient id="' + rg + '" cx="0.26" cy="0.16" r="0.78">' +
          '<stop offset="0%" stop-color="#FFF6E8" stop-opacity=".5"/>' +
          '<stop offset="52%" stop-color="#FFF6E8" stop-opacity=".14"/>' +
          '<stop offset="100%" stop-color="#FFF6E8" stop-opacity="0"/>' +
        '</radialGradient>' +
        '<linearGradient id="' + gl + '" x1="0.1" y1="0" x2="0.3" y2="1">' +
          '<stop offset="0%" stop-color="#FFF6E8" stop-opacity=".42"/>' +
          '<stop offset="55%" stop-color="#FFF6E8" stop-opacity=".1"/>' +
          '<stop offset="100%" stop-color="#FFF6E8" stop-opacity="0"/>' +
        '</linearGradient>' +
        '<linearGradient id="' + sh + '" x1="0" y1="0" x2="0.55" y2="1">' +
          '<stop offset="0%" stop-color="#3B281A" stop-opacity="0"/>' +
          '<stop offset="45%" stop-color="#3B281A" stop-opacity="0"/>' +
          '<stop offset="100%" stop-color="#3B281A" stop-opacity=".22"/>' +
        '</linearGradient>' +
        '<clipPath id="' + cl + '">' + raw + '</clipPath>' +
      '</defs>' +
      // 暖色柔和接地阴影
      '<ellipse cx="33" cy="55" rx="22" ry="5.2" fill="rgba(120,80,50,.24)" filter="url(#' + bl + ')"/>' +
      '<ellipse cx="32" cy="55.5" rx="12" ry="2.4" fill="rgba(120,80,50,.18)"/>' +
      // 右下暗面（背光厚度）
      '<g transform="translate(2.1,2.4)" opacity=".3" mask="url(#' + md + ')">' + darkSide + '</g>' +
      // 顶面亮边（受光顶面）
      '<g transform="translate(-1.1,-3.1)" opacity=".5" mask="url(#' + mt + ')">' + lightTop + '</g>' +
      art +
      '<g clip-path="url(#' + cl + ')" pointer-events="none">' +
        '<rect x="0" y="0" width="64" height="64" fill="url(#' + rg + ')"/>' +
        '<rect x="0" y="0" width="64" height="64" fill="url(#' + gl + ')"/>' +
        '<rect x="0" y="0" width="64" height="64" fill="url(#' + sh + ')"/>' +
      '</g>' +
      hi +
    '</svg>';
  }

  /** 带尺寸的图标盒子 */
  function box(name, size) {
    size = size || 52;
    return '<span class="ico3d" style="width:' + size + 'px;height:' + size + 'px">' + svg(name) + '</span>';
  }

  /** 由 emoji 推断图标名 */
  function guess(text) {
    text = (text || "").trim();
    if (EMOJI_MAP[text]) return EMOJI_MAP[text];
    for (var k in EMOJI_MAP) {
      if (text.indexOf(k) >= 0) return EMOJI_MAP[k];
    }
    return "";
  }

  /* 需要自动升级的容器（白名单，避免误伤正文 emoji） */
  var TARGETS = [
    [".ge-ico", 40], [".de-ico", 38], [".ci-ico", 44], [".gc-ico", 46],
    [".lr-ico", 32], [".bi-box", 34], [".kc-ico", 36],
    [".quick-reward > div:first-child", 40], [".quick-dress > div:first-child", 40],
    [".ico3d-slot", 48], [".tab-ico", 26], [".sec-ico", 34], [".s3d-ico", 44],
    [".statusbar .sb-3d", 15], [".sb-hot .sb-3d", 13]
  ];

  /* 大字号 emoji 元素：命中「内联 font-size >= 24px、纯 emoji 文本、无子元素」的装饰图标，
     用于覆盖百科卡片、商店商品、空状态、引导页等没有统一 class 的老页面。
     游戏舞台 / 彩带 / toast 内的 emoji 属于交互素材，跳过以免干扰逻辑。 */
  var EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u2600-\u27BF\u2B00-\u2BFF\uFE0F]/u;
  function upgradeLarge(root) {
    var nodes;
    try { nodes = root.querySelectorAll("div, span, p, b, i, td"); } catch (e) { return 0; }
    var count = 0;
    Array.prototype.forEach.call(nodes, function (node) {
      if (node.getAttribute("data-i3d") || node.children.length) return;
      if (node.querySelector && node.querySelector("svg")) return;
      var txt = (node.textContent || "").trim();
      if (!txt || txt.length > 8 || !EMOJI_RE.test(txt)) return;
      var fs = parseFloat((node.style && node.style.fontSize) || "0");
      if (!(fs >= 24)) return;
      if (node.closest && node.closest("#gameStage, #confettiLayer, .toast-wrap, .toast, .lane-note")) return;
      var nm = guess(txt);
      if (!nm) { node.setAttribute("data-i3d", "skip"); return; }
      node.setAttribute("data-i3d", nm);
      node.classList.add("ico3d-wrap");
      var sz = Math.min(fs, 64);
      node.style.width = sz + "px";
      node.style.height = sz + "px";
      node.style.display = "inline-flex";
      node.style.alignItems = "center";
      node.style.justifyContent = "center";
      node.innerHTML = svg(nm);
      count++;
    });
    return count;
  }

  /* 一级页面页头装饰：根据标题配一枚 3D 图标，让全站风格统一 */
  var HEAD_MAP = {
    "研学地图": "map", "研学任务": "task", "工艺知识": "know",
    "我的学习": "me", "教学管理端": "teacher", "香云纱百科": "enc",
    "游戏中心": "game", "传承商店": "shop", "研学证书": "cert"
  };
  function upgradeHeads(root) {
    Array.prototype.forEach.call(root.querySelectorAll(".page-head"), function (h) {
      if (h.querySelector(".ph-ico")) return;
      var t = (h.querySelector("h1") || {}).textContent || "";
      var nm = HEAD_MAP[t.trim()];
      if (!nm) return;
      var sp = document.createElement("span");
      sp.className = "ph-ico";
      sp.setAttribute("data-i3d", "head");
      sp.innerHTML = svg(nm);
      h.insertBefore(sp, h.firstChild);
    });
  }

  /* 卡片标题 / 分组名里的 emoji：不替换文案，只套一层茶褐单色滤镜，
     避免彩色 emoji 跳出非遗色板（纯视觉处理，不改任何内容） */
  var TONE_SEL = ".ct-left, .card-title, .btn, .tag, .lr-main > b, .lr-main > span," +
                 ".s3d-plain-head h3, .sec-title, .st-title, .dd-t";
  var EMOJI_ANY = /(?:[\u{1F300}-\u{1FAFF}\u2600-\u27BF\u2B00-\u2BFF]|\u{1F1E6}-\u{1F1FF})[\u{1F3FB}-\u{1F3FF}\uFE0F]?/gu;
  function toneEmoji(root) {
    if (!root || !root.querySelectorAll) return;
    Array.prototype.forEach.call(root.querySelectorAll(TONE_SEL), function (node) {
      if (node.getAttribute("data-tone")) return;
      if (node.classList && node.classList.contains("emoji-tone")) return;
      if (node.closest && node.closest(".emoji-tone")) return;
      node.setAttribute("data-tone", "1");
      var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
      var list = [], n;
      while ((n = walker.nextNode())) {
        if (EMOJI_ANY.test(n.nodeValue || "")) list.push(n);
        EMOJI_ANY.lastIndex = 0;
      }
      list.forEach(function (tn) {
        var txt = tn.nodeValue, frag = document.createDocumentFragment();
        var last = 0, m;
        var re = new RegExp(EMOJI_ANY.source, "gu");
        while ((m = re.exec(txt))) {
          if (m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
          var sp = document.createElement("span");
          sp.className = "emoji-tone";
          sp.textContent = m[0];
          frag.appendChild(sp);
          last = m.index + m[0].length;
        }
        if (!last) return;
        if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
        if (tn.parentNode) tn.parentNode.replaceChild(frag, tn);
      });
    });
  }

  /** 把容器内 emoji 图标升级为 3D SVG */
  function upgrade(root) {
    root = root || document;
    if (!root.querySelectorAll) return 0;
    var n = 0;
    TARGETS.forEach(function (pair) {
      var nodes;
      try { nodes = root.querySelectorAll(pair[0]); } catch (e) { return; }
      Array.prototype.forEach.call(nodes, function (node) {
        if (node.getAttribute("data-i3d")) return;
        if (node.querySelector && node.querySelector("svg")) { node.setAttribute("data-i3d", "skip"); return; }
        var attr = node.getAttribute("data-icon");
        var name = "";
        if (attr) {
          var k = String(attr).toLowerCase();
          k = ALIAS[k] || k;
          name = A[k] ? k : guess(attr);          // 优先按图标名解析，其次按 emoji
        } else {
          name = guess(node.textContent || "");
        }
        if (!name) { node.setAttribute("data-i3d", "skip"); return; }
        node.setAttribute("data-i3d", name);
        node.classList.add("ico3d-wrap");
        node.style.width = pair[1] + "px";
        node.style.height = pair[1] + "px";
        node.innerHTML = svg(name);
        n++;
      });
    });
    n += upgradeLarge(root);
    upgradeHeads(root);
    toneEmoji(root);
    return n;
  }

  /** 启动：全量升级 + 监听 DOM 变化做增量升级 */
  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    (global.requestAnimationFrame || setTimeout)(function () {
      pending = false;
      try { upgrade(document); } catch (e) {}
    }, 16);
  }

  function init() {
    upgrade(document);
    if (typeof MutationObserver === "undefined") return;
    var mo = new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        if (records[i].addedNodes && records[i].addedNodes.length) { schedule(); return; }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  var API = { svg: svg, box: box, upgrade: upgrade, init: init, guess: guess, map: EMOJI_MAP };
  global.Icon3D = API;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    setTimeout(init, 0);
  }
})(window);
