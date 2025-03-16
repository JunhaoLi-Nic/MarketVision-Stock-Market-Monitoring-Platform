import React, { useEffect } from 'react';
import { Row, Col, Card, Typography } from 'antd';

const { Title } = Typography;

declare global {
  interface Window {
    TradingView: any;
  }
}

const MarketIndices: React.FC = () => {
  const indices = [
    {
      symbol: 'CME_MINI:ES1!',
      name: 'S&P 500 E-mini Futures',
      containerId: 'sp500-chart'
    },
    {
      symbol: 'CME_MINI:NQ1!',
      name: 'NASDAQ E-mini Futures',
      containerId: 'nasdaq-chart'
    },
    {
      symbol: 'CME_MINI:YM1!',
      name: 'Dow Jones E-mini Futures',
      containerId: 'dowjones-chart'
    },
    {
      symbol: 'CME_MINI:RTY1!',
      name: 'Russell 2000 E-mini Futures',
      containerId: 'russell-chart'
    }
  ];

  useEffect(() => {
    const loadTradingViewWidget = () => {
      indices.forEach(index => {
        new window.TradingView.widget({
          width: '100%',
          height: 300,
          symbol: index.symbol,
          interval: 'D',
          timezone: 'Etc/UTC',
          theme: 'light',
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          allow_symbol_change: false,
          container_id: index.containerId,
        });
      });
    };

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = loadTradingViewWidget;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="market-indices-container">
      <Title level={2}>Market Indices</Title>
      <Row gutter={[16, 16]}>
        {indices.map(index => (
          <Col xs={24} sm={24} md={12} lg={12} key={index.symbol}>
            <Card title={index.name}>
              <div id={index.containerId} style={{ height: '300px' }}></div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default MarketIndices; 