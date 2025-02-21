from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from services.stock_monitor import StockMonitor
from services.alert_service import AlertService
from services.stock_scanner import StockScanner
from services.stock_analyzer import StockAnalyzer
import logging
import sys
from pydantic import BaseModel
from typing import Optional, List, Dict
import yfinance as yf
import requests
import time
import json
import os
from pathlib import Path
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import urllib.parse

# 设置更详细的日志
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Stock Monitor API", debug=True)

# 更新 CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 明确指定前端域名
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 添加错误处理
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": str(exc.detail)}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={"error": str(exc)}
    )

# 初始化服务
# stock_monitor = StockMonitor()
# alert_service = AlertService()
# stock_scanner = StockScanner()
stock_analyzer = StockAnalyzer()

# 创建数据目录
data_dir = Path(__file__).parent / 'data'
data_dir.mkdir(exist_ok=True)
watchlist_file = data_dir / 'watchlist.json'

# 初始化数据
if not watchlist_file.exists():
    initial_data = {
        "默认分组": {
            "description": "默认分组",
            "stocks": ["NVDA", "TSLA", "MARA", "RIOT", "COIN"]
        },
        "科技股": {
            "description": "科技类股票",
            "stocks": ["NVDA", "TSLA"]
        },
        "加密货币相关": {
            "description": "加密货币相关股票",
            "stocks": ["MARA", "RIOT", "COIN"]
        }
    }
    watchlist_file.write_text(json.dumps(initial_data, ensure_ascii=False, indent=2))

def load_watchlist():
    """从文件加载观察列表"""
    try:
        return json.loads(watchlist_file.read_text())
    except Exception as e:
        logger.error(f"Error loading watchlist: {str(e)}")
        return {}

def save_watchlist(data):
    """保存观察列表到文件"""
    try:
        watchlist_file.write_text(json.dumps(data, ensure_ascii=False, indent=2))
    except Exception as e:
        logger.error(f"Error saving watchlist: {str(e)}")
        raise

# 修改全局变量
STOCK_GROUPS = load_watchlist()

class StockAdd(BaseModel):
    symbol: str
    group: Optional[str] = "默认分组"

@app.post("/api/watchlist/add")
async def add_to_watchlist(stock: StockAdd, request: Request):
    try:
        # 记录接收到的原始请求数据
        raw_data = await request.json()
        logger.info(f"Received raw request data: {raw_data}")
        logger.info(f"Parsed stock data: {stock}")
        logger.info(f"Adding stock {stock.symbol} to group {stock.group}")
        
        # # 验证股票代码是否存在于本地数据库
        # stock_data_path = Path(__file__).parent / 'data' / 'us_stocks.json'
        # with open(stock_data_path, 'r') as f:
        #     stock_database = json.load(f)
            
        # if stock.symbol not in stock_database:
        #     logger.error(f"Stock {stock.symbol} not found in database")
        #     raise HTTPException(status_code=400, detail="无效的股票代码")
        
        # 确保分组存在
        if stock.group not in STOCK_GROUPS:
            logger.info(f"Creating new group {stock.group}")
            STOCK_GROUPS[stock.group] = {
                "description": stock.group,
                "stocks": [],
                "subGroups": {}
            }
        
        # 检查股票是否已在分组中
        if stock.symbol not in STOCK_GROUPS[stock.group]["stocks"]:
            STOCK_GROUPS[stock.group]["stocks"].append(stock.symbol)
            logger.info(f"Added {stock.symbol} to {stock.group}")
            
            # 保存更改
            save_watchlist(STOCK_GROUPS)
            return {
                "success": True,
                "message": f"成功添加 {stock.symbol} 到 {stock.group}",
                "groups": STOCK_GROUPS
            }
        else:
            logger.info(f"Stock {stock.symbol} already in group {stock.group}")
            return {
                "success": True,
                "message": f"股票 {stock.symbol} 已在 {stock.group} 中",
                "groups": STOCK_GROUPS
            }
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding stock to watchlist: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

class StockGroup(BaseModel):
    name: str
    description: Optional[str] = None

class StockMove(BaseModel):
    symbol: str
    from_group: str
    to_group: str

class GroupMove(BaseModel):
    source_group: str
    target_group: str

class GroupRename(BaseModel):
    old_path: str
    new_name: str

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up FastAPI application")

@app.get("/", status_code=200)
async def root():
    logger.info("Handling root endpoint request")
    try:
        response = {"message": "Welcome to Stock Monitor API"}
        logger.info(f"Returning response: {response}")
        return response
    except Exception as e:
        logger.error(f"Error in root endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/watchlist")
async def get_watchlist():
    logger.info("Fetching watchlist")
    try:
        return {"groups": STOCK_GROUPS}
    except Exception as e:
        logger.error(f"Error in get_watchlist: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# @app.get("/api/alerts/{symbol}")
# async def check_alerts(symbol: str):
#     try:
#         alerts = stock_monitor.check_alerts(symbol)
#         return alerts
#     except Exception as e:
#         logger.error(f"Error checking alerts for {symbol}: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# @app.get("/api/scanner")
# async def scan_stocks():
#     try:
#         results = stock_scanner.scan_market()
#         return results
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/watchlist/{group}/{symbol}")
async def remove_stock(group: str, symbol: str):
    try:
        if group not in STOCK_GROUPS or symbol not in STOCK_GROUPS[group]["stocks"]:
            raise HTTPException(status_code=404, detail="Stock not found")
        STOCK_GROUPS[group]["stocks"].remove(symbol)
        # 保存更改
        save_watchlist(STOCK_GROUPS)
        return {"status": "success", "message": f"Removed {symbol} from {group}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/groups")
async def add_group(group: StockGroup):
    try:
        if group.name in STOCK_GROUPS:
            raise HTTPException(status_code=400, detail="Group already exists")
        STOCK_GROUPS[group.name] = {"description": group.description, "stocks": []}
        # 保存更改
        save_watchlist(STOCK_GROUPS)
        return {"status": "success", "message": f"Added group {group.name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stock/validate/{symbol}")
async def validate_stock(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period='1d')
        
        if hist.empty:
            return {"valid": False, "error": "无法获取股票数据"}
            
        info = ticker.info
        return {
            "valid": True,
            "name": info.get('longName', '') or info.get('shortName', ''),
            "price": hist['Close'][-1] if not hist.empty else 0
        }
    except Exception as e:
        return {"valid": False, "error": str(e)}

@app.get("/api/stock/search/{query}")
async def search_stocks(query: str):
    try:
        # 添加请求头和延迟
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # 添加重试机制
        max_retries = 3
        retry_delay = 1  # 秒
        
        for attempt in range(max_retries):
            try:
                search_url = f"https://query2.finance.yahoo.com/v1/finance/search?q={query}"
                response = requests.get(search_url, headers=headers)
                
                if response.status_code == 429:  # Rate limit
                    if attempt < max_retries - 1:
                        time.sleep(retry_delay)
                        continue
                    else:
                        return []  # 达到最大重试次数
                
                response.raise_for_status()
                data = response.json()
                
                # 过滤并格式化结果
                suggestions = []
                for item in data.get('quotes', [])[:10]:
                    if item.get('quoteType') == 'EQUITY':
                        suggestions.append({
                            'symbol': item.get('symbol'),
                            'name': item.get('longname') or item.get('shortname'),
                            'exchange': item.get('exchange')
                        })
                return suggestions
                
            except requests.exceptions.RequestException as e:
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                    continue
                logger.error(f"Request failed after {max_retries} attempts: {str(e)}")
                return []
                
    except Exception as e:
        logger.error(f"Error in stock search: {str(e)}")
        # 返回空列表而不是抛出错误，这样前端不会崩溃
        return []

@app.get("/api/stock/analysis/{symbol}")
async def analyze_stock(symbol: str):
    """获取股票分析报告"""
    try:
        report = stock_analyzer.generate_daily_report(symbol)
        return report
    except Exception as e:
        logger.error(f"Error analyzing stock {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stock/backtest/{symbol}")
async def backtest_stock(symbol: str, start_date: str, end_date: str):
    """获取股票回测分析结果"""
    try:
        logger.info(f"Starting backtest for {symbol} from {start_date} to {end_date}")
        results = stock_analyzer.backtest_analysis(symbol, start_date, end_date)
        
        if isinstance(results, dict) and "error" in results:
            raise HTTPException(status_code=400, detail=results["error"])
            
        logger.info(f"Backtest completed successfully")
        return results
    except Exception as e:
        logger.error(f"Error in backtest analysis for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/watchlist/move")
async def move_stock(move: StockMove):
    try:
        logger.info(f"Moving stock {move.symbol} from {move.from_group} to {move.to_group}")
        
        # 分割目标路径，处理嵌套的情况
        path_parts = move.to_group.split('/')
        
        # 递归查找目标分组
        current_groups = STOCK_GROUPS
        for i, part in enumerate(path_parts):
            if i == len(path_parts) - 1:  # 最后一个部分
                if part not in current_groups:
                    raise HTTPException(status_code=404, detail=f"目标分组 {part} 不存在")
                target_group = current_groups[part]
                
                # 检查股票是否已在目标分组中
                if move.symbol in target_group["stocks"]:
                    raise HTTPException(status_code=400, detail=f"股票 {move.symbol} 已在目标分组中")
                
                # 从所有分组中移除该股票
                for group_name, group in STOCK_GROUPS.items():
                    if move.symbol in group["stocks"]:
                        group["stocks"].remove(move.symbol)
                        logger.info(f"Removed {move.symbol} from {group_name}")
                    
                # 添加到目标分组
                target_group["stocks"].append(move.symbol)
                logger.info(f"Added {move.symbol} to {move.to_group}")
            else:
                if part not in current_groups:
                    raise HTTPException(status_code=404, detail=f"分组 {part} 不存在")
                if 'subGroups' not in current_groups[part]:
                    current_groups[part]['subGroups'] = {}
                current_groups = current_groups[part]['subGroups']
        
        # 保存更改
        save_watchlist(STOCK_GROUPS)
        return {"status": "success", "message": f"已将 {move.symbol} 移动到 {move.to_group}"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error moving stock: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/groups/move")
async def move_group(move: GroupMove):
    try:
        logger.info(f"Moving group {move.source_group} to {move.target_group}")
        
        # 解析源路径和目标路径
        source_parts = move.source_group.split('/')
        target_parts = move.target_group.split('/')
        
        # 查找源文件夹及其父文件夹
        source_parent_groups = STOCK_GROUPS
        source_current = STOCK_GROUPS
        for i, part in enumerate(source_parts[:-1]):
            if part not in source_current:
                raise HTTPException(status_code=404, detail=f"源路径 {part} 不存在")
            source_parent_groups = source_current
            source_current = source_current[part].get('subGroups', {})
        
        if source_parts[-1] not in source_current:
            raise HTTPException(status_code=404, detail=f"源文件夹 {source_parts[-1]} 不存在")
            
        # 获取要移动的文件夹内容
        moving_group = source_current.pop(source_parts[-1])
        
        # 如果目标路径为空，表示移动到顶层
        if not move.target_group:
            # 直接添加到 STOCK_GROUPS
            STOCK_GROUPS[source_parts[-1]] = moving_group
        else:
            # 查找目标文件夹
            target_current = STOCK_GROUPS
            for i, part in enumerate(target_parts):
                if part not in target_current:
                    raise HTTPException(status_code=404, detail=f"目标路径 {part} 不存在")
                if i == len(target_parts) - 1:
                    # 确保目标文件夹有 subGroups
                    if 'subGroups' not in target_current[part]:
                        target_current[part]['subGroups'] = {}
                    # 将文件夹移动到目标位置
                    target_current[part]['subGroups'][source_parts[-1]] = moving_group
                else:
                    target_current = target_current[part].get('subGroups', {})
        
        # 保存更改
        save_watchlist(STOCK_GROUPS)
        return {"status": "success", "message": f"已移动文件夹 {move.source_group}"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error moving group: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/groups/{group_path}")
async def delete_group(group_path: str):
    try:
        # 分割路径，处理嵌套的情况
        path_parts = group_path.split('/')
        
        if path_parts[0] == "默认分组":
            raise HTTPException(status_code=400, detail="不能删除默认分组")
        
        # 递归查找要删除的分组
        current_groups = STOCK_GROUPS
        parent_groups = None
        target_group_name = None
        
        for i, part in enumerate(path_parts):
            if part not in current_groups:
                raise HTTPException(status_code=404, detail=f"分组 {part} 不存在")
            
            if i == len(path_parts) - 1:  # 最后一个部分
                parent_groups = current_groups
                target_group_name = part
            else:
                current_groups = current_groups[part].get('subGroups', {})
        
        if not parent_groups or not target_group_name:
            raise HTTPException(status_code=404, detail="找不到目标分组")
            
        # 将该分组的股票移动到默认分组
        group_to_delete = parent_groups[target_group_name]
        default_stocks = set(STOCK_GROUPS["默认分组"]["stocks"])
        
        # 递归收集所有子分组中的股票
        def collect_stocks(group):
            stocks = set(group.get("stocks", []))
            for subgroup in group.get("subGroups", {}).values():
                stocks.update(collect_stocks(subgroup))
            return stocks
        
        all_stocks = collect_stocks(group_to_delete)
        STOCK_GROUPS["默认分组"]["stocks"] = list(default_stocks | all_stocks)
        
        # 删除分组
        del parent_groups[target_group_name]
        
        # 保存更改
        save_watchlist(STOCK_GROUPS)
        return {"status": "success", "message": f"已删除分组 {group_path}"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting group: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/groups/rename")
async def rename_group(rename: GroupRename):
    try:
        # 解码路径
        old_path = urllib.parse.unquote(rename.old_path)
        
        if old_path == "默认分组":
            raise HTTPException(status_code=400, detail="不能重命名默认分组")
            
        # 查找要重命名的分组
        if old_path not in STOCK_GROUPS:
            raise HTTPException(status_code=404, detail=f"分组 {old_path} 不存在")
            
        # 检查新名称是否已存在
        if rename.new_name in STOCK_GROUPS:
            raise HTTPException(status_code=400, detail=f"分组名称 {rename.new_name} 已存在")
            
        # 重命名分组
        STOCK_GROUPS[rename.new_name] = STOCK_GROUPS.pop(old_path)
        
        # 保存更改
        save_watchlist(STOCK_GROUPS)
        return {"status": "success", "message": f"已将分组 {old_path} 重命名为 {rename.new_name}"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error renaming group: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))