import './style.less';
import Gantt from './lib/Gantt.js';
import TimeAxis from './lib/TimeAxis.js';
import dayjs from 'dayjs';
import { getRandomInt, randomTime } from './lib/utils.js'

function getBarList() {
  const arr = [];
  for (let i = 0; i < 200; i++) {
    const start = randomTime(2024, 2025);

    arr.push({
      id: i + 1,
      title: `任务${i + 1}`,
      startDate: start.format('YYYY-MM-DD'),
      endDate: dayjs(start + 1000 * 60 * 60 * 24 * getRandomInt(0, 20)).format('YYYY-MM-DD'),
    });
  }
  return arr;
}

const tasks = getBarList();
console.log('tasks', tasks);


const gantt = new Gantt('#app', tasks, {
  viewType: 'day', // 视图类型
  showViewTypeSwitch: true, // 是否显示视图切换按钮
  showBackToday: true, // 是否显示返回今日按钮
  lineColor: '#f0f0f0', // 线条颜色
  curDayLineColor: '#1890ff', // 当天日期的线条颜色
  weekBarBg: '#fafbfd', // 周末条的背景色
  onViewTypeChange: (viewType) => {
    console.log(viewType);
  },
});

new TimeAxis('#timeLine', {
  viewType: 'day', // 视图类型
});