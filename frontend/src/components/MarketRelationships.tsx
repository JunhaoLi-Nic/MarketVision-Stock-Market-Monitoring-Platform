import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Divider, Tabs, TabsProps, Button, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import axios from 'axios';
import { mockMarketPrices, MarketPrice, MarketPrices } from '../mockData';

const { Title, Paragraph } = Typography;

interface MarketRelationship {
  key: string;
  primary: string;
  primaryDirection: 'up' | 'down';
  related: string;
  relatedDirection: 'up' | 'down';
  notes?: string;
  category: 'bonds' | 'commodities' | 'stocks' | 'currencies';
  starred?: boolean;
  primaryPrice?: MarketPrice;
  relatedPrice?: MarketPrice;
}

const MarketRelationships: React.FC = () => {
  const [relationships, setRelationships] = useState<MarketRelationship[]>([
    // Bonds Category
    {
      key: '1',
      primary: 'Bonds',
      primaryDirection: 'up',
      related: 'Stocks',
      relatedDirection: 'down',
      notes: 'Higher bond prices typically mean lower yields, which can make stocks less attractive',
      category: 'bonds',
      starred: false
    },
    {
      key: '2',
      primary: 'US Treasury Yields',
      primaryDirection: 'up',
      related: 'Real Estate',
      relatedDirection: 'down',
      notes: 'Higher yields lead to higher mortgage rates, reducing real estate demand',
      category: 'bonds',
      starred: false
    },
    {
      key: '3',
      primary: 'US 10-Year Yield',
      primaryDirection: 'up',
      related: 'USD/JPY',
      relatedDirection: 'up',
      notes: 'Higher US yields attract capital from Japan, strengthening USD vs JPY',
      category: 'bonds',
      starred: false
    },
    {
      key: '4',
      primary: 'Federal Funds Rate',
      primaryDirection: 'up',
      related: 'Gold',
      relatedDirection: 'down',
      notes: 'Higher interest rates increase opportunity cost of holding non-yielding assets like gold',
      category: 'bonds',
      starred: false
    },
    
    // Commodities Category
    {
      key: '5',
      primary: 'USD Index',
      primaryDirection: 'up',
      related: 'Gold',
      relatedDirection: 'down',
      notes: 'Strong dollar typically weakens gold prices as gold is priced in USD',
      category: 'commodities',
      starred: false
    },
    {
      key: '6',
      primary: 'Gold',
      primaryDirection: 'up',
      related: 'AUD/USD',
      relatedDirection: 'up',
      notes: 'Australia is a major gold producer, so its currency often correlates with gold',
      category: 'commodities',
      starred: false
    },
    {
      key: '7',
      primary: 'Crude Oil',
      primaryDirection: 'up',
      related: 'CAD',
      relatedDirection: 'up',
      notes: 'Canada is a major oil exporter, so CAD strengthens with oil prices',
      category: 'commodities',
      starred: false
    },
    {
      key: '8',
      primary: 'USD Index',
      primaryDirection: 'up',
      related: 'Commodities',
      relatedDirection: 'down',
      notes: 'Most commodities are priced in USD, so a stronger dollar makes them more expensive',
      category: 'commodities',
      starred: false
    },
    {
      key: '9',
      primary: 'Crude Oil',
      primaryDirection: 'up',
      related: 'NOK (Norwegian Krone)',
      relatedDirection: 'up',
      notes: 'Norway is a major oil exporter, so NOK strengthens with oil prices',
      category: 'commodities',
      starred: false
    },
    {
      key: '10',
      primary: 'US Manufacturing',
      primaryDirection: 'up',
      related: 'Copper Prices',
      relatedDirection: 'up',
      notes: 'Copper is widely used in manufacturing and construction',
      category: 'commodities',
      starred: false
    },
    {
      key: '11',
      primary: 'Inflation',
      primaryDirection: 'up',
      related: 'TIPS (Treasury Inflation-Protected Securities)',
      relatedDirection: 'up',
      notes: 'TIPS are designed to protect against inflation',
      category: 'commodities',
      starred: false
    },
    
    // Stocks Category
    {
      key: '12',
      primary: 'VIX (Volatility Index)',
      primaryDirection: 'up',
      related: 'S&P 500',
      relatedDirection: 'down',
      notes: 'Higher market fear (VIX) typically correlates with falling stock prices',
      category: 'stocks',
      starred: false
    },
    {
      key: '13',
      primary: 'US Treasury Yields',
      primaryDirection: 'up',
      related: 'Growth Stocks',
      relatedDirection: 'down',
      notes: 'Higher yields make future earnings of growth stocks less valuable in present terms',
      category: 'stocks',
      starred: false
    },
    {
      key: '14',
      primary: 'Inflation',
      primaryDirection: 'up',
      related: 'Value Stocks',
      relatedDirection: 'up',
      notes: 'Value stocks often perform better during inflationary periods',
      category: 'stocks',
      starred: false
    },
    {
      key: '15',
      primary: 'USD Strength',
      primaryDirection: 'up',
      related: 'US Multinational Companies',
      relatedDirection: 'down',
      notes: 'Strong dollar hurts US companies with significant international revenue',
      category: 'stocks',
      starred: false
    },
    
    // Currencies Category
    {
      key: '16',
      primary: 'Gold',
      primaryDirection: 'up',
      related: 'NZD/AUD',
      relatedDirection: 'up',
      notes: 'Similar to AUD, the NZD often follows gold price movements',
      category: 'currencies',
      starred: false
    },
    {
      key: '17',
      primary: 'USD Index',
      primaryDirection: 'up',
      related: 'Emerging Market Currencies',
      relatedDirection: 'down',
      notes: 'Strong dollar puts pressure on emerging markets with dollar-denominated debt',
      category: 'currencies',
      starred: false
    },
    {
      key: '18',
      primary: 'Risk Sentiment',
      primaryDirection: 'up',
      related: 'CHF (Swiss Franc)',
      relatedDirection: 'down',
      notes: 'Swiss Franc is a safe-haven currency that weakens when risk appetite increases',
      category: 'currencies',
      starred: false
    },
    {
      key: '19',
      primary: 'Interest Rate Differential',
      primaryDirection: 'up',
      related: 'Currency Pair',
      relatedDirection: 'up',
      notes: 'Currencies with higher interest rates tend to appreciate against those with lower rates',
      category: 'currencies',
      starred: false
    },
    {
      key: '20',
      primary: 'Trade Balance',
      primaryDirection: 'up',
      related: 'Currency Strength',
      relatedDirection: 'up',
      notes: 'Countries with trade surpluses often see currency appreciation over time',
      category: 'currencies',
      starred: false
    }
  ]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState<boolean>(false);

  useEffect(() => {
    const fetchMarketPrices = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from real API
        try {
          console.log('Fetching from API...');
          const response = await axios.get('http://localhost:8002/api/market-prices');
          
          if (response.data.success) {
            console.log('API data received successfully');
            updatePrices(response.data.data);
            setError(null);
            setUsingMockData(false);
            return;
          }
        } catch (apiError) {
          console.error('API error:', apiError);
          // Fall back to mock data
        }
        
        // Use mock data as fallback
        console.log('Using mock data as fallback');
        updatePrices(mockMarketPrices);
        setError('Could not connect to the market data API. Using mock data instead.');
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    };
    
    // Helper function to update prices
    const updatePrices = (prices: MarketPrices) => {
      setRelationships(prevRelationships => 
        prevRelationships.map(rel => ({
          ...rel,
          primaryPrice: prices[rel.primary] || null,
          relatedPrice: prices[rel.related] || null
        }))
      );
    };

    fetchMarketPrices();
    
    // Refresh every 5 minutes
    const intervalId = setInterval(fetchMarketPrices, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const toggleStar = (key: string) => {
    setRelationships(prevRelationships =>
      prevRelationships.map(rel =>
        rel.key === key ? { ...rel, starred: !rel.starred } : rel
      )
    );
  };

  const renderPrice = (price?: MarketPrice) => {
    if (!price) return 'N/A';
    
    const changeColor = price.change > 0 ? 'green' : price.change < 0 ? 'red' : 'gray';
    
    return (
      <div>
        <div>{price.price}</div>
        <div style={{ color: changeColor }}>
          {price.change > 0 ? '+' : ''}{price.change} 
          ({price.change_percent > 0 ? '+' : ''}{price.change_percent}%)
        </div>
      </div>
    );
  };

  const columns = [
    {
      title: 'Primary Market',
      dataIndex: 'primary',
      key: 'primary',
    },
    {
      title: 'Price',
      key: 'primaryPrice',
      render: (record: MarketRelationship) => renderPrice(record.primaryPrice),
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
      title: 'Price',
      key: 'relatedPrice',
      render: (record: MarketRelationship) => renderPrice(record.relatedPrice),
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
    {
      title: 'Star',
      key: 'star',
      render: (_: any, record: MarketRelationship) => (
        <Button type="text" onClick={() => toggleStar(record.key)}>
          {record.starred ? <StarFilled style={{ color: 'gold' }} /> : <StarOutlined />}
        </Button>
      ),
    },
  ];

  // Filter relationships by category
  const bondsRelationships = relationships.filter(r => r.category === 'bonds');
  const commoditiesRelationships = relationships.filter(r => r.category === 'commodities');
  const stocksRelationships = relationships.filter(r => r.category === 'stocks');
  const currenciesRelationships = relationships.filter(r => r.category === 'currencies');
  const starredRelationships = relationships.filter(r => r.starred);

  const items: TabsProps['items'] = [
    {
      key: 'all',
      label: 'All Relationships',
      children: <Table 
        dataSource={relationships} 
        columns={columns} 
        pagination={{ pageSize: 10 }}
        bordered
        rowKey="key"
        loading={loading}
      />
    },
    {
      key: 'bonds',
      label: 'Bonds',
      children: <Table 
        dataSource={bondsRelationships} 
        columns={columns} 
        pagination={{ pageSize: 10 }}
        bordered
        rowKey="key"
        loading={loading}
      />
    },
    {
      key: 'commodities',
      label: 'Commodities',
      children: <Table 
        dataSource={commoditiesRelationships} 
        columns={columns} 
        pagination={{ pageSize: 10 }}
        bordered
        rowKey="key"
        loading={loading}
      />
    },
    {
      key: 'stocks',
      label: 'Stocks',
      children: <Table 
        dataSource={stocksRelationships} 
        columns={columns} 
        pagination={{ pageSize: 10 }}
        bordered
        rowKey="key"
        loading={loading}
      />
    },
    {
      key: 'currencies',
      label: 'Currencies',
      children: <Table 
        dataSource={currenciesRelationships} 
        columns={columns} 
        pagination={{ pageSize: 10 }}
        bordered
        rowKey="key"
        loading={loading}
      />
    },
    {
      key: 'starred',
      label: 'Starred',
      children: <Table 
        dataSource={starredRelationships} 
        columns={columns} 
        pagination={{ pageSize: 10 }}
        bordered
        rowKey="key"
        loading={loading}
      />
    },
  ];

  return (
    <div className="market-relationships-container">
      <Card>
        <Title level={2}>Market Correlations & Relationships</Title>
        <Paragraph>
          Understanding market relationships is crucial for traders. These correlations, based on Inner Circle Trader principles,
          can help identify potential market movements and trading opportunities.
        </Paragraph>
        {usingMockData && (
          <div style={{ marginBottom: '16px', padding: '10px', background: '#fff7e6', borderRadius: '4px', border: '1px solid #ffe58f' }}>
            <strong>Note:</strong> Using mock market data. {error}
          </div>
        )}
        {error && !usingMockData && (
          <div style={{ marginBottom: '16px', padding: '10px', background: '#fff1f0', borderRadius: '4px', border: '1px solid #ffa39e' }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        <Divider />
        <Tabs defaultActiveKey="all" items={items} />
      </Card>
    </div>
  );
};

export default MarketRelationships; 