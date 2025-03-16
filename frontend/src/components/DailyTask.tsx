import React from 'react';
import { Card, List, Typography, Tag, Space } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

const DailyTask: React.FC = () => {
  // Example tasks - in a real app, these would come from your backend
  const tasks = [
    {
      id: 1,
      title: '市场开盘前准备',
      status: 'pending',
      time: '09:00',
      description: '检查今日重要经济数据发布时间表'
    },
    {
      id: 2,
      title: '盘中监控',
      status: 'ongoing',
      time: '09:30-16:00',
      description: '关注重点股票价格变动和成交量'
    },
    {
      id: 3,
      title: '收盘总结',
      status: 'completed',
      time: '16:30',
      description: '记录今日交易表现和市场观察'
    }
  ];

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'pending':
        return <Tag color="default"><ClockCircleOutlined /> 待处理</Tag>;
      case 'ongoing':
        return <Tag color="processing"><ClockCircleOutlined /> 进行中</Tag>;
      case 'completed':
        return <Tag color="success"><CheckCircleOutlined /> 已完成</Tag>;
      default:
        return null;
    }
  };

  return (
    <div className="daily-task-container" style={{ padding: '24px' }}>
      <Title level={2}>每日任务</Title>
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
        dataSource={tasks}
        renderItem={task => (
          <List.Item>
            <Card 
              title={task.title}
              extra={getStatusTag(task.status)}
              hoverable
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div><strong>时间：</strong>{task.time}</div>
                <div><strong>描述：</strong>{task.description}</div>
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default DailyTask;
