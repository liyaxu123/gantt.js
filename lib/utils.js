import dayjs from "dayjs";

// 一天的毫秒数
export const ONE_DAY_MS = 86400000;
// 图表最小比例
export const MIN_VIEW_RATE = 0.5;
// 图表头部时间轴高度
export const HEADER_HEIGHT = 57;
export const TOP_PADDING = 0;

// 视图日视图、周视图、月视图、季视图、年视图
export const viewTypeList = [
  {
    type: 'day',
    label: '日视图',
    value: 2880, // 一个格子宽度为30px, 一天24*60*60秒 / 30px = 2880秒/px
  },
  {
    type: 'week',
    label: '周视图',
    value: 3600, // 一个格子宽度为168px, 一周24*60*60*7秒 / 168px = 36000秒/px
  },
  {
    type: 'month',
    label: '月视图',
    value: 14400,
  },
  {
    type: 'quarter',
    label: '季视图',
    value: 86400,
  },
  {
    type: 'halfYear',
    label: '年视图',
    value: 115200,
  },
];

export const getViewTypeConfig = (viewType) => {
  return viewTypeList.find((item) => item.type === viewType)
}

// 创建DOM
export const createElement = (tagName, className) => {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  return element;
}

// 创建SVG元素
export const createSvgElement = (tagName, props = {}) => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tagName);

  for (const key in props) {
    const value = props[key];
    element.setAttribute(key, value);
  }

  return element;
}

export const addPrefixCls = (str, prefixCls = 'my-gantt') => {
  return `${prefixCls}-${str}`;
}

// 监听DOM尺寸变化
export const observeDOMResize = (element, callBack) => {
  // 创建一个 ResizeObserver 实例
  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      // 获取元素的新尺寸
      const width = entry.contentRect.width;
      const height = entry.contentRect.height;
      callBack?.({ width, height });
    }
  });

  // 开始观察目标元素
  resizeObserver.observe(element);

  // 停止观察元素（在不需要时，可以调用这个方法）
  // resizeObserver.unobserve(element);

  // 断开观察器（在完成所有操作后调用此方法）
  // resizeObserver.disconnect();
}

// 监听DOM是否在视图内
export const observeDOMInView = (element, callBack) => {
  const observer = new IntersectionObserver((entries) => {
    for (let entry of entries) {
      if (entry.isIntersecting) {
        callBack?.({ isInView: true });
      } else {
        callBack?.({ isInView: false });
      }
    }
  });

  observer.observe(element);

  return observer;
}

// 随机整数
export function getRandomInt(min, max) {
  min = Math.ceil(min); // 确保最小值是包含的
  max = Math.floor(max); // 确保最大值是包含的
  return Math.floor(Math.random() * (max - min + 1)) + min; // 加1是因为区间是开区间
}

// 随机日期时间
export const randomTime = (startYear, endYear) => {
  // 生成随机年份
  const randomYear = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;

  // 生成随机月份（0到11，代表1月到12月）
  const randomMonth = Math.floor(Math.random() * 12);

  // 生成随机日期（1到28天，避免月份长度差异带来的复杂性）
  const randomDate = Math.floor(Math.random() * 28) + 1;

  // 生成随机小时（0到23）
  const randomHour = Math.floor(Math.random() * 24);

  // 生成随机分钟（0到59）
  const randomMinute = Math.floor(Math.random() * 60);

  // 生成随机秒（0到59）
  const randomSecond = Math.floor(Math.random() * 60);

  // 使用 dayjs 构建随机时间
  return dayjs()
    .year(randomYear)
    .month(randomMonth)
    .date(randomDate)
    .hour(randomHour)
    .minute(randomMinute)
    .second(randomSecond);
}

export const handleDrag = (element, { onDragBefore, onDraging, onDragEnd }, step) => {
  let positionX = 0;
  let accumulatedMove = 0;  // 累计移动的距离

  const handleMouseMove = (ev) => {
    ev.stopPropagation();
    ev.preventDefault();

    const moveX = ev.clientX;
    const deltaX = moveX - positionX; // 当前鼠标相对初始位置的位移

    if (step) {
      accumulatedMove += deltaX;  // 累积移动的距离
      positionX = ev.clientX;  // 更新初始位置为当前鼠标位置

      // 判断是否超过步长，如果超过，更新宽度
      if (Math.abs(accumulatedMove) >= step) {
        const steps = Math.floor(accumulatedMove / step);  // 计算完整步长的数量
        onDraging?.(steps);
        accumulatedMove = 0;  // 重置累计移动距离
      }
    } else {
      onDraging?.(deltaX);
    }
  }

  const handleMouseUp = (event) => {
    event.stopPropagation();
    event.preventDefault();

    onDragEnd?.();
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }

  const handleMouseDown = (event) => {
    onDragBefore?.(event);
    event.stopPropagation();
    event.preventDefault();

    positionX = event.clientX;
    accumulatedMove = 0; // 重置累计移动距离 
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  element.addEventListener('mousedown', handleMouseDown)
}

// 给元素添加hover事件
export const useHover = (element, callback) => {
  let isHover = false;

  const handleMouseEnter = (event) => {
    isHover = true;
    callback?.(isHover, event);
  }

  const handleMouseLeave = (event) => {
    isHover = false;
    callback?.(isHover, event);
  }

  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mouseleave', handleMouseLeave);
}

// 使宽度按步长调整
export const snap = (width, step) => Math.round(width / step) * step;