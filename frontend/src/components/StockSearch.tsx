import React, { useState } from 'react';
import { AutoComplete, Input, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { SelectProps } from 'antd/es/select';
import type { CSSProperties } from 'react';

interface StockSearchProps {
  onSelect: (symbol: string) => void;
  style?: CSSProperties;
}

interface StockOption {
  symbol: string;
  name: string;
  exchange: string;
}

interface FolderOperation {
  type: 'ADD' | 'DELETE' | 'MOVE';
  timestamp: number;
  data: {
    symbol: string;
    fromGroup?: string;
    toGroup?: string;
  };
}

export const StockSearch: React.FC<StockSearchProps> = ({ onSelect, style }) => {
  const [options, setOptions] = useState<SelectProps['options']>([]);
  const [loading, setLoading] = useState(false);
  const [operationHistory, setOperationHistory] = useState<FolderOperation[]>([]);

  const handleAddStock = async (symbol: string) => {
    try {
      setLoading(true);
      console.log('Adding stock:', symbol);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/watchlist/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          group: "默认分组"
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '添加股票失败');
      }

      // 记录添加操作
      setOperationHistory(prev => [...prev, {
        type: 'ADD',
        timestamp: Date.now(),
        data: {
          symbol: symbol.toUpperCase(),
          toGroup: "默认分组"
        }
      }]);

      message.success(`成功添加 ${symbol}`);
      onSelect(symbol.toUpperCase());
    } catch (error) {
      console.error('添加股票失败:', error);
      message.error(error instanceof Error ? error.message : '添加股票失败');
    } finally {
      setLoading(false);
    }
  };

  const searchStocks = async (query: string) => {
    if (!query) {
      setOptions([]);
      return;
    }

    try {
      console.log('Searching for stocks:', query);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/stock/search/${query}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('搜索请求失败');
      }

      const data: StockOption[] = await response.json();
      console.log('Search results:', data);
      
      const formattedOptions = data.map(item => ({
        value: item.symbol,
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ marginRight: 8 }}>{item.symbol}</span>
              <span style={{ color: '#666' }}>{item.name}</span>
            </div>
            <Button
              type="text"
              icon={<PlusOutlined />}
              size="small"
              loading={loading}
              onClick={(e) => {
                e.stopPropagation();
                handleAddStock(item.symbol);
              }}
            />
          </div>
        ),
      }));
      
      setOptions(formattedOptions);
    } catch (error) {
      console.error('搜索股票失败:', error);
      message.error('搜索股票失败');
      setOptions([]);
    }
  };

  return (
    <AutoComplete
      style={style}
      options={options}
      onSelect={onSelect}
      onSearch={searchStocks}
    >
      <Input.Search placeholder="搜索股票" />
    </AutoComplete>
  );
}; 