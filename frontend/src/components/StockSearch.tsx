import React, { useState, useCallback } from 'react';
import { AutoComplete, Input, Spin, message } from 'antd';
import { PlusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import type { SelectProps } from 'antd/es/select';
import '../css/StockSearch.css';

// Component props interface
interface StockSearchProps {
  onSelect: (symbol: string) => void;
  style?: React.CSSProperties;
}

// Stock data interface
interface StockSuggestion {
  symbol: string;
  name: string;
  exchange: string;
  logo?: string;
}

const formatCompanyName = (name: string, isMobile: boolean): string => {
  const maxLength = isMobile ? 20 : 35;
  return name.length > maxLength ? `${name.slice(0, maxLength-3)}...` : name;
};

export const StockSearch: React.FC<StockSearchProps> = ({ onSelect, style }) => {
  // State management
  const [options, setOptions] = useState<SelectProps['options']>([]);
  const [loading, setLoading] = useState(false);
  const [searchCache] = useState<Map<string, StockSuggestion[]>>(new Map());

  // Debounced search function to prevent too many API calls
  const searchStocks = useCallback(
    debounce(async (query: string) => {
      if (!query) {
        setOptions([]);
        return;
      }

      try {
        setLoading(true);
        const url = `${process.env.REACT_APP_API_URL}/api/stock/search/${query}`;
        console.log('Searching at URL:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`搜索请求失败: ${response.status} ${errorText}`);
        }

        const suggestions: StockSuggestion[] = await response.json();
        console.log('Search results:', suggestions);
        formatAndSetOptions(suggestions);
      } catch (error) {
        console.error('搜索股票失败:', error);
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          message.error('无法连接到服务器，请确保后端服务正在运行');
        } else {
          message.error('搜索失败: ' + (error instanceof Error ? error.message : String(error)));
        }
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Format search results into dropdown options
  const formatAndSetOptions = (suggestions: StockSuggestion[]) => {
    const isMobile = window.innerWidth < 768;
    const formattedOptions = suggestions.map(item => ({
      value: item.symbol,
      label: (
        <div className="stock-suggestion-item">
          <div className="stock-info">
            <span className="stock-symbol">{item.symbol}</span>
            <span className="stock-name">{formatCompanyName(item.name, isMobile)}</span>
          </div>
          <div className="stock-right-section">
            <span className="stock-exchange">{item.exchange}</span>
            <PlusCircleOutlined
              className="add-stock-icon"
              onClick={(e) => {
                e.stopPropagation();
                handleAddStock(item.symbol);
              }}
            />
          </div>
        </div>
      ),
    }));
    setOptions(formattedOptions);
  };

  // Handle adding a stock to the watchlist
  const handleAddStock = async (symbol: string) => {
    try {
      console.log('开始添加股票:', symbol);
      
      // Check if stock already exists in any group
      const watchlistResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/watchlist`);
      if (!watchlistResponse.ok) {
        throw new Error('获取观察列表失败');
      }
      const watchlistData = await watchlistResponse.json();
      
      // Check if stock exists in any group
      let existingGroup = null;
      Object.entries(watchlistData.groups).forEach(([groupName, group]: [string, any]) => {
        if (group.stocks.includes(symbol)) {
          existingGroup = groupName;
        }
      });
      
      if (existingGroup) {
        message.warning(`股票 ${symbol} 已存在于分组 "${existingGroup}" 中`);
        return;
      }
      
      const requestBody = {
        symbol: symbol,
        group: '默认分组'
      };
      
      console.log('发送请求体:', requestBody);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/watchlist/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
      });

      console.log('添加股票响应状态:', response.status);
      const data = await response.json();
      console.log('添加股票响应数据:', data);

      if (!response.ok) {
        if (data.detail) {
          throw new Error(Array.isArray(data.detail) ? data.detail[0].msg : data.detail);
        }
        throw new Error(data.error || '添加股票失败');
      }

      message.success(data.message || `成功添加 ${symbol} 到观察列表`);
      onSelect(symbol);  // Notify parent component
    } catch (error) {
      console.error('添加股票失败:', error);
      message.error(error instanceof Error ? error.message : '添加股票失败');
    }
  };

  return (
    <AutoComplete
      options={options}
      onSelect={onSelect}
      onSearch={searchStocks}
      notFoundContent={loading ? <Spin size="small" /> : "未找到匹配项，尝试输入完整代码或公司名称"}
      style={style}
      dropdownMatchSelectWidth={false}
    >
      <Input
        placeholder="搜索股票代码或公司名称"
        prefix={<SearchOutlined className="search-icon" />}
        allowClear
      />
    </AutoComplete>
  );
}; 