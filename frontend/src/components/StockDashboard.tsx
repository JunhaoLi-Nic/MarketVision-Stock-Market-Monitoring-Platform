import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Spin, message, Layout, Menu, Input, Button, Modal, Form, Dropdown, Space, notification, Badge, AutoComplete, DatePicker, Tree, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, FolderOutlined, MoreOutlined, AlertOutlined, StockOutlined, ExpandOutlined, CompressOutlined, EditOutlined } from '@ant-design/icons';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';
import type { CardProps } from 'antd';
import StockAnalysis from './StockAnalysis';
import dayjs from 'dayjs';
import type { RangePickerProps } from 'antd/es/date-picker';
import type { DataNode, TreeProps, EventDataNode } from 'antd/es/tree';
import type { Key } from 'rc-tree/lib/interface';
import type { MenuProps } from 'antd';
import { StockSearch } from './StockSearch';

const { Sider, Content } = Layout;
const { Search } = Input;

interface StockCardProps {
  symbol: string;
  timeframe: "1" | "3" | "5" | "15" | "30" | "60" | "120" | "180" | "240" | "D" | "W" | "BACKTEST";
  backTestRange?: [dayjs.Dayjs | null, dayjs.Dayjs | null];
}

interface StockGroup {
  description: string;
  stocks: string[];
  subGroups?: { [key: string]: StockGroup };  // 添加子文件夹
}

interface GroupData {
  [key: string]: StockGroup;
}

interface AlertData {
  type: string;
  message: string;
  value: number;
  threshold: number;
}

// 添加 WatchlistData 接口
interface WatchlistData {
  groups: {
    [key: string]: StockGroup;
  };
}

const timeframeOptions = [
  { label: '实时', options: [
    { value: "1", label: '1分钟' },
    { value: "5", label: '5分钟' },
    { value: "15", label: '15分钟' },
    { value: "30", label: '30分钟' },
    { value: "60", label: '1小时' },
  ]},
  { label: '历史', options: [
    { value: "D", label: '日线' },
    { value: "W", label: '周线' }
  ]},
  { label: '回测', options: [
    { value: "BACKTEST", label: '自定义' }
  ]}
];

const StockCard: React.FC<StockCardProps> = ({ symbol, timeframe, backTestRange }) => {
  const getChartRange = () => {
    if (timeframe === "BACKTEST" && backTestRange && backTestRange[0] && backTestRange[1]) {
      const diffDays = backTestRange[1].diff(backTestRange[0], 'day');
      if (diffDays <= 30) return "1M";
      if (diffDays <= 90) return "3M";
      if (diffDays <= 180) return "6M";
      return "12M";
    }
    return timeframe === "D" ? "12M" : 
           timeframe === "W" ? "60M" : "1D";
  };

  // 计算开始时间和结束时间
  const getFromTo = () => {
    if (timeframe === "BACKTEST" && backTestRange && backTestRange[0] && backTestRange[1]) {
      return {
        from: backTestRange[0].format('YYYY-MM-DD'),
        to: backTestRange[1].format('YYYY-MM-DD')
      };
    }
    return undefined;
  };

  const dateRange = getFromTo();

  return (
    <Card 
      title={symbol} 
      style={{ marginBottom: 16 }}
      bodyStyle={{ padding: '12px' }}
    >
      <Row gutter={16}>
        <Col span={16}>
          <div style={{ height: 400 }}>
            <AdvancedRealTimeChart
              symbol={symbol}
              interval={timeframe === "BACKTEST" ? "D" : timeframe}
              theme="light"
              width="100%"
              height={400}
              allow_symbol_change={true}
              hide_side_toolbar={false}
              range={getChartRange()}
              timezone="America/New_York"
            />
          </div>
        </Col>
        <Col span={8} style={{ maxHeight: 400, overflowY: 'auto' }}>
          <StockAnalysis symbol={symbol} />
        </Col>
      </Row>
    </Card>
  );
};

const StockDashboard: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistData>({ groups: {} });
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [timeframe, setTimeframe] = useState<StockCardProps['timeframe']>("D");
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

  // 添加 ref 映射来存储每个股票卡片的引用
  const stockRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 滚动到指定股票的函数
  const scrollToStock = (symbol: string) => {
    const element = stockRefs.current[symbol];
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // 获取观察列表
  const fetchWatchlist = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/watchlist`);
      if (!response.ok) {
        throw new Error('获取观察列表失败');
      }
      const data = await response.json();
      
      // 完全替换现有的 watchlist 状态
      setWatchlist({ groups: data.groups || {} });
      
      // 清理 stockRefs
      stockRefs.current = {};
      
      // 清除选中状态
      setSelectedStock(null);
      setSelectedKeys([]);
      
      // 默认展开所有分组
      setExpandedKeys(getAllFolderKeys(data.groups));
    } catch (error) {
      console.error('获取观察列表失败:', error);
      message.error('获取观察列表失败');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchWatchlist();
  }, []);

  // 获取所有唯一的股票
  const getAllStocks = () => {
    const allStocks = new Set<string>();
    Object.values(watchlist.groups).forEach(group => {
      group.stocks.forEach(stock => allStocks.add(stock));
    });
    return Array.from(allStocks);
  };

  // 获取已分组的股票
  const getGroupedStocks = () => {
    const groupedStocks = new Set<string>();
    Object.entries(watchlist.groups).forEach(([groupName, group]) => {
      if (groupName !== "默认分组") {
        group.stocks.forEach(stock => groupedStocks.add(stock));
      }
    });
    return groupedStocks;
  };

  // 获取未分组的股票
  const getUngroupedStocks = () => {
    const allStocks = getAllStocks();
    const groupedStocks = getGroupedStocks();
    return allStocks.filter(stock => !groupedStocks.has(stock));
  };

  // 修改 handleDeleteStock 函数
  const handleDeleteStock = async (groupName: string, symbol: string) => {
    try {
      // 首先找到股票实际所在的分组
      let actualGroup = groupName;
      if (groupName === '默认分组') {
        // 查找股票实际所在的分组
        for (const [name, group] of Object.entries(watchlist.groups)) {
          if (group.stocks.includes(symbol)) {
            actualGroup = name;
            break;
          }
        }
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/watchlist/${encodeURIComponent(actualGroup)}/${encodeURIComponent(symbol)}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '删除股票失败');
      }

      // 删除成功后立即更新状态
      setWatchlist(prevState => {
        const newState = {
          groups: { ...prevState.groups }
        };
        
        // 从指定分组中删除股票
        if (newState.groups[actualGroup]) {
          newState.groups[actualGroup] = {
            ...newState.groups[actualGroup],
            stocks: newState.groups[actualGroup].stocks.filter(s => s !== symbol)
          };
        }

        // 如果是默认分组，还需要确保从其他分组中也删除该股票
        if (actualGroup === "默认分组") {
          Object.keys(newState.groups).forEach(group => {
            if (group !== "默认分组") {
              newState.groups[group] = {
                ...newState.groups[group],
                stocks: newState.groups[group].stocks.filter(s => s !== symbol)
              };
            }
          });
        }

        return newState;
      });

      // 如果删除的是当前选中的股票，清除选中状态
      if (selectedStock === symbol) {
        setSelectedStock(null);
      }

      // 从 stockRefs 中移除引用
      delete stockRefs.current[symbol];

      // 清除选中状态
      setSelectedKeys(prevKeys => prevKeys.filter(key => key !== `stock-${symbol}`));

      message.success(`成功从 ${actualGroup} 删除 ${symbol}`);
    } catch (error) {
      console.error('删除股票失败:', error);
      message.error(error instanceof Error ? error.message : '删除股票失败');
    }
  };

  // 修改 onDrop 处理函数
  const onDrop: TreeProps['onDrop'] = async (info) => {
    const dropKey = info.node.key as string;
    const dragKey = info.dragNode.key as string;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    
    // 处理文件夹的拖拽
    if (dragKey.startsWith('folder-')) {
      const sourceFolder = dragKey.replace('folder-', '');
      let targetFolder = '';
      
      // 根据放置位置决定目标位置
      if (dropPosition === -1 || dropPosition === 1) {
        // 放在目标的前面或后面，移动到同级
        const targetParts = dropKey.replace(/^(folder|stock)-/, '').split('/');
        targetParts.pop(); // 移除最后一个部分
        targetFolder = targetParts.join('/');
      } else {
        // 放在目标内部
        targetFolder = dropKey.replace(/^(folder|stock)-/, '');
      }
      
      // 防止将文件夹移动到自己下面
      if (targetFolder.startsWith(sourceFolder)) {
        message.error('不能将文件夹移动到其子文件夹中');
        return;
      }
      
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/groups/move`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source_group: sourceFolder,
            target_group: targetFolder,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '移动文件夹失败');
        }
        
        await fetchWatchlist();
        message.success('移动成功');
      } catch (error) {
        console.error('移动文件夹失败:', error);
        message.error(error instanceof Error ? error.message : '移动文件夹失败');
      }
      return;
    }
    
    // 处理股票的拖拽
    if (dragKey.startsWith('stock-')) {
      const symbol = dragKey.replace('stock-', '');
      let fromGroup = '';
      let toGroup = '';

      // 确定源分组
      for (const [groupName, group] of Object.entries(watchlist.groups)) {
        if (group.stocks.includes(symbol)) {
          fromGroup = groupName;
          break;
        }
      }

      // 确定目标分组
      if (dropKey.startsWith('folder-')) {
        toGroup = dropKey.replace('folder-', '');
      } else {
        // 如果拖到了未分组区域
        toGroup = '默认分组';
      }

      // 如果没有找到源分组，设为默认分组
      if (!fromGroup) {
        fromGroup = '默认分组';
      }

      // 如果源分组和目标分组相同，不执行移动
      if (fromGroup === toGroup) {
        return;
      }

      try {
        // 获取要移动的所有股票
        let stocksToMove: string[] = [];
        if (selectedKeys.length > 1 && selectedKeys.includes(dragKey)) {
          // 如果有多个选中项且包含被拖拽的项，移动所有选中的股票
          stocksToMove = selectedKeys
            .filter(key => typeof key === 'string' && key.startsWith('stock-'))
            .map(key => (key as string).replace('stock-', ''));
        } else {
          // 否则只移动被拖拽的股票
          stocksToMove = [symbol];
        }

        // 依次移动每个股票
        for (const stockSymbol of stocksToMove) {
          console.log(`Moving stock ${stockSymbol} from ${fromGroup} to ${toGroup}`);
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/watchlist/move`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              symbol: stockSymbol,
              from_group: fromGroup,
              to_group: toGroup,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '移动股票失败');
          }
        }

        // 移动成功后立即更新状态
        setWatchlist(prevState => {
          const newState = {
            groups: { ...prevState.groups }
          };

          // 从源分组中移除股票
          if (newState.groups[fromGroup]) {
            newState.groups[fromGroup] = {
              ...newState.groups[fromGroup],
              stocks: newState.groups[fromGroup].stocks.filter(s => !stocksToMove.includes(s))
            };
          }

          // 添加到目标分组
          if (newState.groups[toGroup]) {
            newState.groups[toGroup] = {
              ...newState.groups[toGroup],
              stocks: [...newState.groups[toGroup].stocks, ...stocksToMove]
            };
          }

          return newState;
        });

        message.success(`成功移动 ${stocksToMove.length} 个股票到 ${toGroup}`);
        setSelectedKeys([]); // 清除选中状态
      } catch (error) {
        console.error('移动股票失败:', error);
        message.error(error instanceof Error ? error.message : '移动股票失败');
      }
    }
  };

  // 新建文件夹
  const handleAddFolder = async (values: { name: string; description: string }) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
        }),
      });

      if (!response.ok) throw new Error('创建分组失败');

      await fetchWatchlist();
      setIsModalVisible(false);
      form.resetFields();
      message.success('创建分组成功');
    } catch (error) {
      console.error('创建分组失败:', error);
      message.error('创建分组失败');
    }
  };

  // 修改 Tree 的 onSelect 处理函数
  const handleTreeSelect = (selectedKeys: Key[]) => {
    const key = selectedKeys[0] as string;
    if (key?.startsWith('stock-')) {
      const symbol = key.replace('stock-', '');
      setSelectedStock(symbol);
      scrollToStock(symbol);
    }
  };

  // 添加 handleExpand 函数
  const handleExpand = (
    expandedKeys: Key[],
    info: {
      node: EventDataNode<DataNode>;
      expanded: boolean;
      nativeEvent: MouseEvent;
    }
  ) => {
    setExpandedKeys(expandedKeys.map(key => String(key)));
  };

  // 修改删除文件夹的处理函数
  const handleDeleteFolder = async (groupPath: string) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/groups/${encodeURIComponent(groupPath)}`, 
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '删除文件夹失败');
      }

      await fetchWatchlist();
      message.success('删除成功');
    } catch (error) {
      console.error('删除文件夹失败:', error);
      message.error(error instanceof Error ? error.message : '删除文件夹失败');
    }
  };

  // 修改 handleRenameFolder 函数
  const handleRenameFolder = async (groupPath: string, newName: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/groups/rename`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          old_path: encodeURIComponent(groupPath),  // 编码路径中的特殊字符
          new_name: newName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '重命名文件夹失败');
      }

      await fetchWatchlist();
      message.success('重命名成功');
    } catch (error) {
      console.error('重命名文件夹失败:', error);
      message.error(error instanceof Error ? error.message : '重命名文件夹失败');
    }
  };

  // 修改 generateTreeData 函数
  const generateTreeData = (group: StockGroup, groupPath: string): DataNode => {
    const stockNodes: DataNode[] = group.stocks.map((stock: string) => ({
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StockOutlined />
            <span>{stock}</span>
          </div>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: '删除',
                  onClick: () => handleDeleteStock(groupPath, stock)
                }
              ]
            }}
            trigger={['click']}
          >
            <MoreOutlined
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              style={{ cursor: 'pointer' }}
            />
          </Dropdown>
        </div>
      ),
      key: `stock-${stock}`,
      isLeaf: true,
    }));

    // 创建子文件夹节点
    const subGroupNodes: DataNode[] = group.subGroups ? 
      Object.entries(group.subGroups).map(([subName, subGroup]) =>
        generateTreeData(subGroup, `${groupPath}/${subName}`)
      ) : [];

    // 返回当前文件夹节点
    return {
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderOutlined />
            <span>{groupPath.split('/').pop()}</span>
          </div>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'rename',
                  icon: <EditOutlined />,
                  label: '重命名',
                  onClick: () => {
                    const currentName = groupPath.split('/').pop() || '';
                    let inputRef: any = null;

                    Modal.confirm({
                      title: '重命名文件夹',
                      icon: <EditOutlined />,
                      content: (
                        <Input 
                          placeholder="请输入新名称"
                          defaultValue={currentName}
                          ref={node => {
                            if (node) {
                              inputRef = node;
                              setTimeout(() => node.select(), 100);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const value = inputRef.input.value.trim();
                              if (value) {
                                handleRenameFolder(groupPath, value);
                                Modal.destroyAll();
                              }
                            }
                          }}
                        />
                      ),
                      async onOk() {
                        const value = inputRef.input.value.trim();
                        if (value) {
                          await handleRenameFolder(groupPath, value);
                        }
                      },
                      okButtonProps: {
                        disabled: false
                      }
                    });
                  }
                },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: '删除文件夹',
                  onClick: () => {
                    Modal.confirm({
                      title: '确认删除',
                      content: '删除文件夹后，其中的股票将被移动到默认分组。确定要删除吗？',
                      onOk: () => handleDeleteFolder(groupPath),
                    });
                  }
                }
              ]
            }}
            trigger={['click']}
          >
            <MoreOutlined
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              style={{ cursor: 'pointer' }}
            />
          </Dropdown>
        </div>
      ),
      key: `folder-${groupPath}`,
      children: [...stockNodes, ...subGroupNodes],
      selectable: false  // 添加这个属性，使文件夹不可选择
    };
  };

  // 修改 treeData 的生成
  const treeData: DataNode[] = [
    // 未分组的股票
    ...getUngroupedStocks().map((stock: string) => ({
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StockOutlined />
            <span>{stock}</span>
          </div>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: '删除',
                  onClick: () => handleDeleteStock('默认分组', stock)
                }
              ]
            }}
            trigger={['click']}
          >
            <MoreOutlined
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              style={{ cursor: 'pointer' }}
            />
          </Dropdown>
        </div>
      ),
      key: `stock-${stock}`,
      isLeaf: true,
    })),
    // 分组的股票和子分组
    ...Object.entries(watchlist.groups)
      .filter(([groupName]) => groupName !== "默认分组")
      .map(([groupName, group]) => generateTreeData(group, groupName))
  ];

  // 添加获取所有文件夹 key 的函数
  const getAllFolderKeys = (groups: GroupData): string[] => {
    const keys: string[] = [];
    
    const addFolderKeys = (groupPath: string, group: StockGroup) => {
      keys.push(`folder-${groupPath}`);
      if (group.subGroups) {
        Object.entries(group.subGroups).forEach(([subName, subGroup]) => {
          addFolderKeys(`${groupPath}/${subName}`, subGroup);
        });
      }
    };

    Object.entries(groups)
      .filter(([groupName]) => groupName !== "默认分组")
      .forEach(([groupName, group]) => {
        addFolderKeys(groupName, group);
      });

    return keys;
  };

  // 添加展开/折叠所有文件夹的处理函数
  const handleExpandAll = (expand: boolean) => {
    if (expand) {
      // 展开所有文件夹
      const allKeys = getAllFolderKeys(watchlist.groups);
      setExpandedKeys(allKeys);
    } else {
      // 折叠所有文件夹
      setExpandedKeys([]);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={300} theme="light" style={{ padding: '16px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <StockSearch 
            onSelect={(symbol) => {
              setSelectedStock(symbol);
              fetchWatchlist();  // 刷新观察列表
            }} 
            style={{ width: '100%' }}
          />
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
              style={{ flex: 1 }}
            >
              新建文件夹
            </Button>
            <Tooltip 
              title={expandedKeys.length === 0 ? "展开所有文件夹" : "折叠所有文件夹"}
              placement="bottom"
            >
              <Button
                onClick={() => handleExpandAll(expandedKeys.length === 0)}
                icon={expandedKeys.length === 0 ? <ExpandOutlined /> : <CompressOutlined />}
              />
            </Tooltip>
          </div>
        </div>
        
        {loading ? (
          <Spin />
        ) : (
          <Tree
            treeData={treeData}
            expandedKeys={expandedKeys}
            selectedKeys={selectedKeys}
            onExpand={handleExpand}
            onSelect={(keys) => {
              const validKeys = keys.filter(key => 
                typeof key === 'string' && key.startsWith('stock-')
              );
              setSelectedKeys(validKeys);
              
              if (validKeys.length === 1) {
                const symbol = (validKeys[0] as string).replace('stock-', '');
                setSelectedStock(symbol);
                scrollToStock(symbol);
              }
            }}
            draggable
            onDrop={onDrop}
            showIcon
          />
        )}

        <Modal
          title="新建文件夹"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onOk={() => form.submit()}
        >
          <Form form={form} onFinish={handleAddFolder}>
            <Form.Item
              name="name"
              label="名称"
              rules={[{ required: true, message: '请输入文件夹名称' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="描述"
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </Sider>

      <Content style={{ padding: '24px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '16px' }}>
          <Select
            style={{ width: 120 }}
            value={timeframe}
            onChange={setTimeframe}
            options={timeframeOptions}
          />
        </div>
        
        {/* 修改未分组股票的渲染 */}
        {getUngroupedStocks().length > 0 && (
          <div>
            <h2 style={{ margin: '16px 0' }}>未分组股票</h2>
            {getUngroupedStocks().map(symbol => (
              <div 
                key={symbol}
                ref={(el: HTMLDivElement | null) => {
                  stockRefs.current[symbol] = el;
                  return undefined;
                }}
                id={`stock-${symbol}`}
              >
                <StockCard
                  symbol={symbol}
                  timeframe={timeframe}
                />
              </div>
            ))}
          </div>
        )}
        
        {/* 修改分组股票的渲染 */}
        {Object.entries(watchlist.groups)
          .filter(([groupName]) => groupName !== "默认分组")
          .map(([groupName, group]) => (
            <div key={groupName}>
              <h2 style={{ margin: '16px 0' }}>{groupName}</h2>
              {group.stocks.map(symbol => (
                <div 
                  key={symbol}
                  ref={(el: HTMLDivElement | null) => {
                    stockRefs.current[symbol] = el;
                    return undefined;
                  }}
                  id={`stock-${symbol}`}
                >
                  <StockCard
                    symbol={symbol}
                    timeframe={timeframe}
                  />
                </div>
              ))}
            </div>
          ))}
      </Content>
    </Layout>
  );
};

export default StockDashboard; 