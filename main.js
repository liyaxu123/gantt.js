import './style.less';
import Gantt from './lib/Gantt.js';
import TimeAxis from './lib/TimeAxis.js';
import dayjs from 'dayjs';
import { getRandomInt, randomTime } from './lib/utils.js'

function getBarList() {
  // 状态
  const status = ['success', 'warning', 'error', 'default'];
  // 优先级
  const priority = ['高', '中', '低'];
  const arr = [];
  for (let i = 0; i < 20000; i++) {
    const start = randomTime(2024, 2025);

    arr.push({
      id: i + 1,
      title: `任务${i + 1}`,
      startDate: start.format('YYYY-MM-DD'),
      endDate: dayjs(start + 1000 * 60 * 60 * 24 * getRandomInt(0, 20)).format('YYYY-MM-DD'),
      status: status[getRandomInt(0, 3)],
      priority: priority[getRandomInt(0, 2)],
      progress: getRandomInt(0, 100) / 100,
    });
  }
  return arr;
}

const tasks = getBarList();
console.log('tasks', tasks);

const bgColor = {
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222d',
  default: '#bfbfbf',
}

const priorityIcon = {
  高: '<svg t="1727676116906" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5944" width="200" height="200"><path d="M790.3 385H591.2l128.4-276.1c6.4-19.3-12.8-45-32.1-45H430.7c-12.8 0-25.7 6.4-32.1 19.3L205.9 596.9c-6.4 25.7 12.8 44.9 32.1 44.9h224.8l-64.2 289v6.4c0 12.8 12.8 25.7 25.7 25.7 6.4 0 19.3-6.4 19.3-12.8L816 436.3c12.8-25.7 0-51.3-25.7-51.3z m0 0" fill="#ff0000" p-id="5945"></path></svg>',
  中: '<svg t="1727674660619" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5415" width="200" height="200"><path d="M790.3 385H591.2l128.4-276.1c6.4-19.3-12.8-45-32.1-45H430.7c-12.8 0-25.7 6.4-32.1 19.3L205.9 596.9c-6.4 25.7 12.8 44.9 32.1 44.9h224.8l-64.2 289v6.4c0 12.8 12.8 25.7 25.7 25.7 6.4 0 19.3-6.4 19.3-12.8L816 436.3c12.8-25.7 0-51.3-25.7-51.3z m0 0" fill="#fcf352" p-id="5416"></path></svg>',
  低: '<svg t="1727674646996" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5259" width="200" height="200"><path d="M790.3 385H591.2l128.4-276.1c6.4-19.3-12.8-45-32.1-45H430.7c-12.8 0-25.7 6.4-32.1 19.3L205.9 596.9c-6.4 25.7 12.8 44.9 32.1 44.9h224.8l-64.2 289v6.4c0 12.8 12.8 25.7 25.7 25.7 6.4 0 19.3-6.4 19.3-12.8L816 436.3c12.8-25.7 0-51.3-25.7-51.3z m0 0" fill="#1cd3ec" p-id="5260"></path></svg>',
}

const gantt = new Gantt('#app', tasks, {
  viewType: 'day', // 视图类型：quarter
  showViewTypeSwitch: true, // 是否显示视图切换按钮
  showBackToday: true, // 是否显示返回今日按钮
  lineColor: '#f0f0f0', // 线条颜色
  curDayLineColor: '#1890ff', // 当天日期的线条颜色
  weekBarBg: '#fafbfd', // 周末条的背景色
  onViewTypeChange: (viewType) => {
    console.log(viewType);
  },
  // 点击任务条时触发
  onTaskBarClick: (taskData) => {
    alert(taskData.title);
  },
  // 点击时间轴时触发
  onTimelineClick: (data) => {
    alert(data);
  },
  // 是否显示拖拽时的遮罩层
  showDragMask: true,
  // 是否显示tooltip
  showTooltip: true,
  // 自定义tooltip，当 showTooltip 为 true 时，生效
  renderTooltip: (taskData) => {
    const status = {
      success: '已完成',
      warning: '未完成',
      error: '已超期',
      default: '进行中'
    }

    return `
    <div style="
      min-width: 200px;
      padding: 8px; 
      line-height: 30px; 
      background-color: #fff; 
      border: 1px solid #eee; 
      border-radius: 4px; 
      margin-top: 4px; 
      font-size: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,.15);"
    >
      <div>任务名称：${taskData.title}</div>
      <div>开始时间：${taskData.startDate}</div>
      <div>结束时间：${taskData.endDate}</div>
      <div>完成进度：${Math.round(taskData.progress * 100)}%</div>
      <div>状态：
        <span style="background: ${bgColor[taskData.status]}; border-radius: 4px; padding: 2px 8px; color: #fff;">
          ${status[taskData.status]}
        </span>
      </div>
      <div style="display: flex; align-items: center;">优先级：
        <span style="
        width: 20px;
        height: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 4px;
        ">
          ${priorityIcon[taskData.priority]}
        </span>
        ${taskData.priority}
      </div>
    </div>
    `;
  },
  // 自定义taskbar的内容
  renderTaskbarContent: (taskData) => {
    return `
    <div style="
      width: 100%;
      height: 100%;
      padding: 0 10px;
      background-color: ${bgColor[taskData.status]};
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      color: #fff;
      font-size: 14px;
      overflow: visible;
      white-space: nowrap;
    ">
      <span style="
        width: 20px;
        height: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 4px;
      ">
        ${priorityIcon[taskData.priority]}
      </span>
      ${taskData.title}
    </div>
    `;
  },
});

// gantt.jumpTo('2022-12-01')
// gantt.toggleViewTypeSwitch(false);
// gantt.toggleBackTodayBtn(false);

new TimeAxis('#timeLine', {
  viewType: 'day', // 视图类型
});