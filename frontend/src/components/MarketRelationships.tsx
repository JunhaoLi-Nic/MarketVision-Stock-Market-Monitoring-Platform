import React from 'react';
import { Card, Typography, Table, Divider } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface MarketRelationship {
  key: string;
  primary: string;
  primaryDirection: 'up' | 'down';
  related: string;
  relatedDirection: 'up' | 'down';
  notes?: string;
}

const MarketRelationships: React.FC = () => {
  // Market relationships based on Inner Circle Trader principles
  const relationships: MarketRelationship[] = [
    {
      key: '1',
      primary: 'Bonds',
      primaryDirection: 'up',
      related: 'Stocks',
      relatedDirection: 'down',
      notes: 'Higher bond prices typically mean lower yields, which can make stocks less attractive'
    },
    {
      key: '2',
      primary: 'USD Index',
      primaryDirection: 'up',
      related: 'Gold',
      relatedDirection: 'down',
      notes: 'Strong dollar typically weakens gold prices as gold is priced in USD'
    },
    {
      key: '3',
      primary: 'Gold',
      primaryDirection: 'up',
      related: 'AUD/USD',
      relatedDirection: 'up',
      notes: 'Australia is a major gold producer, so its currency often correlates with gold'
    },
    {
      key: '4',
      primary: 'Gold',
      primaryDirection: 'up',
      related: 'NZD/USD',
      relatedDirection: 'up',
      notes: 'Similar to AUD, the NZD often follows gold price movements'
    },
    {
      key: '5',
      primary: 'Crude Oil',
      primaryDirection: 'up',
      related: 'CAD',
      relatedDirection: 'up',
      notes: 'Canada is a major oil exporter, so CAD strengthens with oil prices'
    },
    {
      key: '6',
      primary: 'USD Index',
      primaryDirection: 'up',
      related: 'Commodities',
      relatedDirection: 'down',
      notes: 'Most commodities are priced in USD, so a stronger dollar makes them more expensive'
    },
    {
      key: '7',
      primary: 'VIX (Volatility Index)',
      primaryDirection: 'up',
      related: 'S&P 500',
      relatedDirection: 'down',
      notes: 'Higher market fear (VIX) typically correlates with falling stock prices'
    },
    {
      key: '8',
      primary: 'US 10-Year Yield',
      primaryDirection: 'up',
      related: 'USD/JPY',
      relatedDirection: 'up',
      notes: 'Higher US yields attract capital from Japan, strengthening USD vs JPY'
    },
    {
      key: '9',
      primary: 'Federal Funds Rate',
      primaryDirection: 'up',
      related: 'Gold',
      relatedDirection: 'down',
      notes: 'Higher interest rates increase opportunity cost of holding non-yielding assets like gold'
    },
    {
      key: '10',
      primary: 'Inflation',
      primaryDirection: 'up',
      related: 'TIPS (Treasury Inflation-Protected Securities)',
      relatedDirection: 'up',
      notes: 'TIPS are designed to protect against inflation'
    },
    {
      key: '11',
      primary: 'USD Index',
      primaryDirection: 'up',
      related: 'Emerging Market Currencies',
      relatedDirection: 'down',
      notes: 'Strong dollar puts pressure on emerging markets with dollar-denominated debt'
    },
    {
      key: '12',
      primary: 'US Treasury Yields',
      primaryDirection: 'up',
      related: 'Real Estate',
      relatedDirection: 'down',
      notes: 'Higher yields lead to higher mortgage rates, reducing real estate demand'
    },
    {
      key: '13',
      primary: 'Crude Oil',
      primaryDirection: 'up',
      related: 'NOK (Norwegian Krone)',
      relatedDirection: 'up',
      notes: 'Norway is a major oil exporter, so NOK strengthens with oil prices'
    },
    {
      key: '14',
      primary: 'Risk Sentiment',
      primaryDirection: 'up',
      related: 'CHF (Swiss Franc)',
      relatedDirection: 'down',
      notes: 'Swiss Franc is a safe-haven currency that weakens when risk appetite increases'
    },
    {
      key: '15',
      primary: 'US Manufacturing',
      primaryDirection: 'up',
      related: 'Copper Prices',
      relatedDirection: 'up',
      notes: 'Copper is widely used in manufacturing and construction'
    }
  ];

  const columns = [
    {
      title: 'Primary Market',
      dataIndex: 'primary',
      key: 'primary',
    },
    {
      title: 'Direction',
      dataIndex: 'primaryDirection',
      key: 'primaryDirection',
      render: (direction: string) => (
        direction === 'up' ? 
          <ArrowUpOutlined style={{ color: 'green' }} /> : 
          <ArrowDownOutlined style={{ color: 'red' }} />
      ),
    },
    {
      title: 'Related Market',
      dataIndex: 'related',
      key: 'related',
    },
    {
      title: 'Direction',
      dataIndex: 'relatedDirection',
      key: 'relatedDirection',
      render: (direction: string) => (
        direction === 'up' ? 
          <ArrowUpOutlined style={{ color: 'green' }} /> : 
          <ArrowDownOutlined style={{ color: 'red' }} />
      ),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
    },
  ];

  return (
    <div className="market-relationships-container" style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>Market Correlations & Relationships</Title>
        <Paragraph>
          Understanding market relationships is crucial for traders. These correlations, based on Inner Circle Trader principles,
          can help identify potential market movements and trading opportunities.
        </Paragraph>
        <Divider />
        <Table 
          dataSource={relationships} 
          columns={columns} 
          pagination={{ pageSize: 10 }}
          bordered
          rowKey="key"
        />
      </Card>
    </div>
  );
};

export default MarketRelationships; 