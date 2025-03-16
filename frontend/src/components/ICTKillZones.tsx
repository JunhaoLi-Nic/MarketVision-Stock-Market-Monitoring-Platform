import React, { useState, useEffect } from 'react';
import { Typography, Tag, Space, Table, Row, Col, Card } from 'antd';
import { FireOutlined, GlobalOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ICTKillZones: React.FC = () => {
  // State for current time in different time zones
  const [currentTime, setCurrentTime] = useState({
    us: '',
    melbourne: '',
    china: '',
    usHour: 0,
    usMinute: 0
  });

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // Get US Eastern Time
      const usDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const usHour = usDate.getHours();
      const usMinute = usDate.getMinutes();
      
      // US Eastern Time
      const usOptions = { 
        timeZone: 'America/New_York',
        hour12: true,
        hour: 'numeric' as const,
        minute: 'numeric' as const,
        second: 'numeric' as const
      };
      
      // Melbourne Time
      const melbourneOptions = { 
        timeZone: 'Australia/Melbourne',
        hour12: true,
        hour: 'numeric' as const,
        minute: 'numeric' as const,
        second: 'numeric' as const
      };
      
      // China Time
      const chinaOptions = { 
        timeZone: 'Asia/Shanghai',
        hour12: true,
        hour: 'numeric' as const,
        minute: 'numeric' as const,
        second: 'numeric' as const
      };
      
      setCurrentTime({
        us: now.toLocaleTimeString('en-US', usOptions) + ' EST',
        melbourne: now.toLocaleTimeString('en-US', melbourneOptions) + ' AEST',
        china: now.toLocaleTimeString('en-US', chinaOptions) + ' CST',
        usHour,
        usMinute
      });
    };
    
    // Initial update
    updateTime();
    
    // Set interval for updates
    const intervalId = setInterval(updateTime, 1000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Function to check if a kill zone is currently active
  const isKillZoneActive = (startTime: string, endTime: string): boolean => {
    if (!startTime || !endTime) return false;
    
    // Parse the time ranges (format: "HH:MM")
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const { usHour, usMinute } = currentTime;
    
    // Check if current time is within the range
    if (startHour < endHour) {
      // Simple case: start time is before end time in the same day
      return (usHour > startHour || (usHour === startHour && usMinute >= startMinute)) && 
             (usHour < endHour || (usHour === endHour && usMinute <= endMinute));
    } else if (startHour > endHour) {
      // Complex case: range spans across midnight
      return (usHour > startHour || (usHour === startHour && usMinute >= startMinute)) || 
             (usHour < endHour || (usHour === endHour && usMinute <= endMinute));
    } else {
      // Edge case: start hour equals end hour
      return usHour === startHour && 
             usMinute >= startMinute && 
             usMinute <= endMinute;
    }
  };

  // ICT Kill Zones data with corresponding times
  const killZonesData = [
    {
      key: '1',
      killZone: 'Asian Kill Zone',
      usTime: '19:00-22:00 EST',
      usStartTime: '19:00',
      usEndTime: '22:00',
      melbourneTime: '10:00-13:00 AEST',
      chinaTime: '08:00-11:00 CST',
      description: 'Asian market opening, potential for early price action setups'
    },
    {
      key: '2',
      killZone: 'London Kill Zone',
      usTime: '02:00-05:00 EST',
      usStartTime: '02:00',
      usEndTime: '05:00',
      melbourneTime: '17:00-20:00 AEST',
      chinaTime: '15:00-18:00 CST',
      description: 'European market opening, high liquidity and volatility'
    },
    {
      key: '3',
      killZone: 'New York Kill Zone',
      usTime: '08:00-10:00 EST',
      usStartTime: '08:00',
      usEndTime: '10:00',
      melbourneTime: '23:00-01:00 AEST',
      chinaTime: '21:00-23:00 CST',
      description: 'US market opening, major price movements and trading opportunities'
    },
    {
      key: '4',
      killZone: 'London Close Kill Zone',
      usTime: '11:00-12:00 EST',
      usStartTime: '11:00',
      usEndTime: '12:00',
      melbourneTime: '02:00-03:00 AEST',
      chinaTime: '00:00-01:00 CST',
      description: 'European market closing, potential reversals and continuation patterns'
    }
  ];

  const killZonesColumns = [
    {
      title: 'ICT Kill Zone',
      dataIndex: 'killZone',
      key: 'killZone',
      render: (text: string, record: any) => (
        <Space>
          {text}
          {isKillZoneActive(record.usStartTime, record.usEndTime) && (
            <Tag color="red"><FireOutlined /> ACTIVE NOW</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'US Time (EST)',
      dataIndex: 'usTime',
      key: 'usTime',
    },
    {
      title: 'Melbourne Time (AEST)',
      dataIndex: 'melbourneTime',
      key: 'melbourneTime',
    },
    {
      title: 'China Time (CST)',
      dataIndex: 'chinaTime',
      key: 'chinaTime',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  return (
    <div className="kill-zones-section">
      <Title level={2}><GlobalOutlined /> ICT Kill Zones</Title>
      
      {/* Current Time Display */}
      <div className="current-time-display" style={{ marginBottom: '20px', background: '#f0f2f5', padding: '15px', borderRadius: '8px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card bordered={false} style={{ textAlign: 'center' }}>
              <Text strong>US (EST)</Text>
              <div style={{ fontSize: '20px', marginTop: '10px' }}>{currentTime.us}</div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} style={{ textAlign: 'center' }}>
              <Text strong>Melbourne (AEST)</Text>
              <div style={{ fontSize: '20px', marginTop: '10px' }}>{currentTime.melbourne}</div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} style={{ textAlign: 'center' }}>
              <Text strong>China (CST)</Text>
              <div style={{ fontSize: '20px', marginTop: '10px' }}>{currentTime.china}</div>
            </Card>
          </Col>
        </Row>
      </div>
      
      <p style={{ marginBottom: '20px' }}>
        Inner Circle Trader (ICT) kill zones represent optimal trading times with high liquidity and potential market movements.
        Times below are shown in US Eastern Time (EST), Melbourne Time (AEST), and China Time (CST).
        <strong> Currently active kill zones are highlighted.</strong>
      </p>
      <Table 
        dataSource={killZonesData} 
        columns={killZonesColumns} 
        pagination={false}
        bordered
        style={{ marginBottom: '40px' }}
      />
    </div>
  );
};

export default ICTKillZones; 