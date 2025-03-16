import React from 'react';
import { Card, List, Typography, Tag, Space, Divider } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import MarketRelationships from './MarketRelationships';

const { Title } = Typography;

const DailyTask: React.FC = () => {
  // Example tasks - in a real app, these would come from your backend
  const tasks = [
    {
      id: 1,
      title: 'Pre-Market Preparation',
      status: 'pending',
      time: '09:00',
      description: 'Check schedule for important economic data releases'
    },
    {
      id: 2,
      title: 'Market Monitoring',
      status: 'ongoing',
      time: '09:30-16:00',
      description: 'Monitor key stock price movements and trading volumes'
    },
    {
      id: 3,
      title: 'Closing Summary',
      status: 'completed',
      time: '16:30',
      description: 'Record daily trading performance and market observations'
    }
  ];

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'pending':
        return <Tag color="default"><ClockCircleOutlined /> Pending</Tag>;
      case 'ongoing':
        return <Tag color="processing"><ClockCircleOutlined /> In Progress</Tag>;
      case 'completed':
        return <Tag color="success"><CheckCircleOutlined /> Completed</Tag>;
      default:
        return null;
    }
  };

  return (
    <div className="daily-task-container" style={{ padding: '24px' }}>
      <Title level={2}>Daily Tasks</Title>
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
                <div><strong>Time: </strong>{task.time}</div>
                <div><strong>Description: </strong>{task.description}</div>
              </Space>
            </Card>
          </List.Item>
        )}
      />
      
      <Divider style={{ margin: '40px 0 20px' }} />
      
      {/* Market Relationships Component */}
      <MarketRelationships />
    </div>
  );
};

export default DailyTask;
