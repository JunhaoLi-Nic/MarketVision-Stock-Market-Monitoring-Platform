import React, { useState, useCallback } from 'react';
import { AutoComplete, Input, Spin, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import type { SelectProps } from 'antd/es/select';

interface StockSearchProps {
  onSelect: (symbol: string) => void;
  style?: React.CSSProperties;
}

interface StockSuggestion {
  ticker: string;
  name: string;
  exchange: string;
  logo?: string;
}

// 使用普通的 CSS 类和内联样式替代 styled-components
const styles = {
  suggestionItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
  },
  stockInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  ticker: {
    fontWeight: 600,
    color: '#1a1a1a',
  },
  companyName: {
    color: '#666',
    fontSize: '12px',
  },
  exchangeTag: {
    fontSize: '11px',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: '#f0f0f0',
    color: '#666',
  },
  addButton: {
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    opacity: 0.6,
    ':hover': {
      opacity: 1,
    },
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
};

const formatCompanyName = (name: string, isMobile: boolean): string => {
  const maxLength = isMobile ? 20 : 35;
  return name.length > maxLength ? `${name.slice(0, maxLength-3)}...` : name;
};

export const StockSearch: React.FC<StockSearchProps> = ({ onSelect, style }) => {
  const [options, setOptions] = useState<SelectProps['options']>([]);
  const [loading, setLoading] = useState(false);
  const [searchCache] = useState<Map<string, StockSuggestion[]>>(new Map());

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

  const formatAndSetOptions = (suggestions: StockSuggestion[]) => {
    const isMobile = window.innerWidth < 768;
    const formattedOptions = suggestions.map(item => ({
      value: item.ticker,
      label: (
        <div style={styles.suggestionItem}>
          <div style={styles.stockInfo}>
            <span style={styles.ticker}>{item.ticker}</span>
            <span style={styles.companyName}>
              {formatCompanyName(item.name, isMobile)}
            </span>
          </div>
          <div style={styles.rightSection}>
            <span style={styles.exchangeTag}>{item.exchange}</span>
            <PlusOutlined
              style={styles.addButton}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item.ticker);
              }}
            />
          </div>
        </div>
      ),
    }));

    setOptions(formattedOptions);
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
        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
        allowClear
      />
    </AutoComplete>
  );
}; 