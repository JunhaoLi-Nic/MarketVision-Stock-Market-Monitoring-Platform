from flask import Blueprint, jsonify
from flask_cors import cross_origin
import yfinance as yf

stock_bp = Blueprint('stock', __name__)

@stock_bp.route('/stock/search/<query>', methods=['GET'])
@cross_origin(supports_credentials=True)
def search_stock(query):
    try:
        # 预定义热门股票列表
        popular_stocks = {
            'AAPL': {'name': 'Apple Inc.', 'exchange': 'NASDAQ'},
            'MSFT': {'name': 'Microsoft Corporation', 'exchange': 'NASDAQ'},
            'GOOGL': {'name': 'Alphabet Inc.', 'exchange': 'NASDAQ'},
            'AMZN': {'name': 'Amazon.com Inc.', 'exchange': 'NASDAQ'},
            'TSLA': {'name': 'Tesla, Inc.', 'exchange': 'NASDAQ'},
            'NVDA': {'name': 'NVIDIA Corporation', 'exchange': 'NASDAQ'},
            'META': {'name': 'Meta Platforms, Inc.', 'exchange': 'NASDAQ'},
            'NFLX': {'name': 'Netflix, Inc.', 'exchange': 'NASDAQ'},
            'BABA': {'name': 'Alibaba Group Holding Ltd.', 'exchange': 'NYSE'},
            'ABNB': {'name': 'Airbnb, Inc.', 'exchange': 'NASDAQ'},
            'LULU': {'name': 'Lululemon Athletica Inc.', 'exchange': 'NASDAQ'},
            'HIMS': {'name': 'Hims & Hers Health, Inc.', 'exchange': 'NYSE'}
        }
        
        # 过滤匹配的股票
        results = []
        query = query.upper()
        
        for ticker, info in popular_stocks.items():
            if query in ticker or query.lower() in info['name'].lower():
                results.append({
                    "ticker": ticker,
                    "name": info['name'],
                    "exchange": info['exchange']
                })
                
        # 如果没有找到匹配项且查询长度大于1，尝试使用 yfinance 搜索
        if not results and len(query) > 1:
            try:
                stock = yf.Ticker(query)
                info = stock.info
                if info and 'symbol' in info:
                    results.append({
                        "ticker": info['symbol'],
                        "name": info.get('longName', info.get('shortName', '')),
                        "exchange": info.get('exchange', 'Unknown')
                    })
            except Exception as e:
                print(f"YFinance search error: {str(e)}")
                # 继续使用本地结果
                pass
        
        return jsonify(results)
        
    except Exception as e:
        print(f"Search error: {str(e)}")
        return jsonify({"error": str(e)}), 500 