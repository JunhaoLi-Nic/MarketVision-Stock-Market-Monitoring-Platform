import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();
const watchlistPath = path.join(__dirname, '../../data/watchlist.json');

// 读取 watchlist 文件
async function readWatchlist() {
  const data = await fs.readFile(watchlistPath, 'utf8');
  return JSON.parse(data);
}

// 写入 watchlist 文件
async function writeWatchlist(data: any) {
  await fs.writeFile(watchlistPath, JSON.stringify(data, null, 2), 'utf8');
}

// 添加股票
router.post('/add', async (req, res) => {
  try {
    const { symbol, group = '默认分组' } = req.body;
    const watchlist = await readWatchlist();

    if (!watchlist[group]) {
      watchlist[group] = {
        description: null,
        stocks: [],
        subGroups: {}
      };
    }

    if (!watchlist[group].stocks.includes(symbol)) {
      watchlist[group].stocks.push(symbol);
    }

    await writeWatchlist(watchlist);
    res.json({ success: true });
  } catch (error) {
    console.error('添加股票失败:', error);
    res.status(500).json({ error: '添加股票失败' });
  }
});

// 删除股票
router.post('/remove', async (req, res) => {
  try {
    const { symbol, group = '默认分组' } = req.body;
    const watchlist = await readWatchlist();

    if (watchlist[group]) {
      watchlist[group].stocks = watchlist[group].stocks.filter((s: string) => s !== symbol);
      
      // 如果分组为空且不是默认分组，则删除该分组
      if (watchlist[group].stocks.length === 0 && 
          Object.keys(watchlist[group].subGroups).length === 0 && 
          group !== '默认分组') {
        delete watchlist[group];
      }
    }

    await writeWatchlist(watchlist);
    res.json({ success: true });
  } catch (error) {
    console.error('删除股票失败:', error);
    res.status(500).json({ error: '删除股票失败' });
  }
});

// 移动股票
router.post('/move', async (req, res) => {
  try {
    const { symbol, fromGroup, toGroup } = req.body;
    const watchlist = await readWatchlist();

    // 从源分组删除
    if (watchlist[fromGroup]) {
      watchlist[fromGroup].stocks = watchlist[fromGroup].stocks.filter((s: string) => s !== symbol);
    }

    // 添加到目标分组
    if (!watchlist[toGroup]) {
      watchlist[toGroup] = {
        description: null,
        stocks: [],
        subGroups: {}
      };
    }
    
    if (!watchlist[toGroup].stocks.includes(symbol)) {
      watchlist[toGroup].stocks.push(symbol);
    }

    await writeWatchlist(watchlist);
    res.json({ success: true });
  } catch (error) {
    console.error('移动股票失败:', error);
    res.status(500).json({ error: '移动股票失败' });
  }
});

export default router; 