import yfinance as yf
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import plotly.graph_objects as go
from pathlib import Path
import logging
import pytz

logger = logging.getLogger(__name__)

class StockAnalyzer:
    def __init__(self):
        # 创建图表保存目录
        self.charts_dir = Path(__file__).parent.parent / 'static' / 'charts'
        self.charts_dir.mkdir(parents=True, exist_ok=True)

    def get_stock_data(self, ticker, period='1y'):
        """增强型数据抓取函数"""
        try:
            stock = yf.Ticker(ticker)
            
            # 多时间维度数据
            hist = stock.history(period=period, interval='1d', prepost=True)
            
            # 关键基本面数据
            info = {
                'sector': stock.info.get('sector', 'N/A'),
                'marketCap': stock.info.get('marketCap', 0),
                'peRatio': stock.info.get('trailingPE', 0),
                'beta': stock.info.get('beta', 1),
                'dividendYield': stock.info.get('dividendYield', 0)*100 if stock.info.get('dividendYield') else 0,
                'debtToEquity': stock.info.get('debtToEquity', 0)
            }
            
            return hist, info
        except Exception as e:
            logger.error(f"Error getting stock data for {ticker}: {str(e)}")
            return None, None

    def generate_daily_report(self, ticker):
        """生成每日分析报告"""
        try:
            # 获取数据
            hist, info = self.get_stock_data(ticker, '5d')
            if hist is None or info is None:
                return {"error": "无法获取股票数据"}
            
            # 计算关键指标
            latest = hist.iloc[-1]
            prev_close = hist.iloc[-2]['Close']
            daily_change = (latest['Close'] - prev_close) / prev_close * 100
            
            # 波动分析
            atr = (hist['High'] - hist['Low']).mean()
            
            # 生成报告
            report = {
                "date": datetime.today().strftime('%Y-%m-%d'),
                "price": latest['Close'],
                "change": daily_change,
                "volume": latest['Volume']/1e6,
                "atr": atr,
                "volume_alert": self.detect_abnormal_volume(hist),
                "technical_signals": self.generate_technical_signals(hist),
                "volatility_alert": self.volatility_cluster_alert(hist),
                "money_flow": self.money_flow_analysis(hist)
            }
            
            return report
        except Exception as e:
            logger.error(f"Error generating daily report for {ticker}: {str(e)}")
            return {"error": str(e)}

    def detect_abnormal_volume(self, data):
        """成交量异动检测"""
        avg_volume = data['Volume'].rolling(5).mean().iloc[-1]
        latest_volume = data['Volume'].iloc[-1]
        
        if latest_volume > avg_volume * 2:
            return "成交量突破：当前成交量是5日均值的2倍以上"
        elif latest_volume < avg_volume * 0.5:
            return "交易清淡：当前成交量不足5日均值一半"
        else:
            return "成交量处于正常波动区间"

    def generate_technical_signals(self, data):
        """生成技术信号"""
        signals = []
        
        # 计算MACD
        exp1 = data['Close'].ewm(span=12, adjust=False).mean()
        exp2 = data['Close'].ewm(span=26, adjust=False).mean()
        macd = exp1 - exp2
        signal = macd.ewm(span=9, adjust=False).mean()
        
        if macd.iloc[-1] > signal.iloc[-1] and macd.iloc[-2] <= signal.iloc[-2]:
            signals.append("MACD金叉")
        elif macd.iloc[-1] < signal.iloc[-1] and macd.iloc[-2] >= signal.iloc[-2]:
            signals.append("MACD死叉")
            
        # 计算RSI
        delta = data['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        
        if rsi.iloc[-1] > 70:
            signals.append(f"RSI超买 ({rsi.iloc[-1]:.1f})")
        elif rsi.iloc[-1] < 30:
            signals.append(f"RSI超卖 ({rsi.iloc[-1]:.1f})")
            
        return signals

    def volatility_cluster_alert(self, data):
        """波动率聚类分析"""
        returns = data['Close'].pct_change().dropna()
        clusters = []
        threshold = returns.std() * 1.5
        
        for r in returns[-5:]:
            if abs(r) > threshold:
                clusters.append(1)
            else:
                clusters.append(0)
        
        if sum(clusters) >= 3:
            return "波动率聚集预警：近期出现3次以上异常波动"
        return "波动率正常"

    def money_flow_analysis(self, data):
        """
        更敏感的资金流向分析，快速响应市场变化
        """
        try:
            # 计算价格变化率
            price_change = data['Close'].pct_change() * 100
            
            # 计算成交量变化率
            volume_change = data['Volume'].pct_change() * 100
            
            # 计算典型价格
            typical_price = (data['High'] + data['Low'] + data['Close']) / 3
            
            # 计算 Money Flow
            raw_money_flow = typical_price * data['Volume']
            
            # 使用更短期的资金流指标
            positive_flow = raw_money_flow.where(typical_price > typical_price.shift(1), 0).rolling(window=10).sum()
            negative_flow = raw_money_flow.where(typical_price < typical_price.shift(1), 0).rolling(window=10).sum()
            
            # 计算 MFI（使用更短的周期）
            mfi = 100 - (100 / (1 + positive_flow / negative_flow))
            
            # 计算 OBV 和短期变化
            obv = (data['Volume'] * (~data['Close'].diff().le(0) * 2 - 1)).cumsum()
            obv_change = obv.diff(3) / obv.abs().mean() * 100  # 缩短为3天
            
            # 获取最新值
            current_price_change = price_change.iloc[-1]
            current_volume_change = volume_change.iloc[-1]
            current_mfi = mfi.iloc[-1]
            current_obv_change = obv_change.iloc[-1]
            
            # 更敏感的上涨特征判断
            is_strong_uptrend = (
                current_price_change > 2 and  # 降低到2%
                current_volume_change > 30 and  # 降低到30%
                current_obv_change > 3  # 降低到3%
            )
            
            # 更敏感的下跌特征判断
            is_strong_downtrend = (
                current_price_change < -2 and  # 提高到-2%
                current_volume_change > 30 and  # 降低到30%
                current_obv_change < -3  # 提高到-3%
            )
            
            # 综合分析（更敏感的判断标准）
            if is_strong_uptrend:
                if current_mfi > 70:  # 降低阈值
                    return "主力资金大量涌入：强势上涨"
                else:
                    return "资金加速流入：看涨信号"
            elif is_strong_downtrend:
                if current_mfi < 30:  # 提高阈值
                    return "资金加速流出：看空信号"
                else:
                    return "资金持续流出：注意风险"
            else:
                if current_mfi > 70 and current_obv_change < -3:
                    return "资金流出警告：获利回吐"
                elif current_mfi < 30 and current_obv_change > 3:
                    return "资金流入信号：低位吸筹"
                elif current_mfi > 55 and current_obv_change > 2:  # 降低阈值
                    return "资金持续流入：多头占优"
                elif current_mfi < 45 and current_obv_change < -2:  # 提高阈值
                    return "资金逐步流出：空头占优"
                elif current_price_change > 0.5 and current_volume_change > 10:  # 更敏感的短期判断
                    return "资金小幅流入：短线看多"
                elif current_price_change < -0.5 and current_volume_change > 10:
                    return "资金小幅流出：短线谨慎"
                else:
                    return "资金流向观望：等待信号"
            
        except Exception as e:
            logger.error(f"Error in money flow analysis: {str(e)}")
            return "资金流向分析异常"

    def backtest_analysis(self, ticker: str, start_date: str, end_date: str):
        """获取指定日期的分析报告并验证其准确性"""
        try:
            stock = yf.Ticker(ticker)
            
            # 直接尝试获取历史数据
            from datetime import datetime, timedelta
            import pytz

            # 创建带时区的日期
            ny_tz = pytz.timezone('America/New_York')
            end_date_dt = datetime.strptime(end_date, '%Y-%m-%d')
            end_date_dt = ny_tz.localize(end_date_dt)
            
            # 获取数据时多往后取几天，以确保能获取到下一个交易日
            next_date = (end_date_dt + timedelta(days=10)).strftime('%Y-%m-%d')
            analysis_start = (end_date_dt - timedelta(days=60)).strftime('%Y-%m-%d')
            
            logger.info(f"Attempting to fetch data for {ticker}")
            logger.info(f"Date range: {analysis_start} to {next_date}")
            
            # 直接尝试获取历史数据
            hist = stock.history(start=analysis_start, end=next_date)
            
            if hist.empty:
                logger.error(f"No data available for {ticker}")
                return {"error": "无法获取历史数据"}
            
            logger.info(f"Successfully fetched data: {len(hist)} days")
            logger.info(f"Data range: from {hist.index[0]} to {hist.index[-1]}")
            
            if len(hist) < 2:
                logger.error(f"Insufficient data for {ticker}: only {len(hist)} days")
                return {"error": "数据量不足"}
            
            # 找到目标日期的数据（使用带时区的日期）
            target_date = pd.to_datetime(end_date).tz_localize(ny_tz)
            logger.info(f"Looking for target date: {target_date}")
            logger.info(f"Available dates: {hist.index.tolist()}")
            
            try:
                target_idx = hist.index.get_indexer([target_date], method='nearest')[0]
                logger.info(f"Found target index: {target_idx}")
            except Exception as e:
                logger.error(f"Error finding target date: {str(e)}")
                return {"error": f"查找目标日期失败: {str(e)}"}
            
            if target_idx >= len(hist) - 1:
                logger.error(f"No next day data available for {ticker} at {target_date}")
                return {"error": f"无法获取 {end_date} 的下一个交易日数据"}
            
            # 记录找到的具体日期
            test_date = hist.index[target_idx]
            next_date = hist.index[target_idx + 1]
            logger.info(f"Using test date: {test_date}")
            logger.info(f"Next trading day: {next_date}")
            
            # 使用目标日期的数据生成分析报告
            test_data = hist.iloc[target_idx:target_idx+1]
            next_day = hist.iloc[target_idx+1]
            analysis_data = hist[:target_idx+1]
            
            # 生成分析报告
            report = {
                "date": test_data.index[0].strftime('%Y-%m-%d'),
                "price": test_data['Close'].iloc[0],
                "change": ((test_data['Close'].iloc[0] - test_data['Open'].iloc[0]) / 
                          test_data['Open'].iloc[0] * 100),
                "volume": test_data['Volume'].iloc[0]/1e6,
                "technical_signals": self.generate_technical_signals(analysis_data),
                "volatility_alert": self.volatility_cluster_alert(analysis_data),
                "money_flow": self.money_flow_analysis(analysis_data),
                "volume_alert": self.detect_abnormal_volume(analysis_data),
                "next_day": {
                    "date": next_day.name.strftime('%Y-%m-%d'),
                    "price": next_day['Close'],
                    "change": ((next_day['Close'] - next_day['Open']) / next_day['Open'] * 100)
                }
            }
            
            # 验证预测的准确性
            predictions = []
            for signal in report["technical_signals"]:
                prediction = {
                    "signal": signal,
                    "prediction": "价格上涨" if "金叉" in signal or "超卖" in signal else "价格下跌",
                    "correct": (next_day['Close'] > test_data['Close'].iloc[0]) 
                              if ("金叉" in signal or "超卖" in signal) 
                              else (next_day['Close'] < test_data['Close'].iloc[0])
                }
                predictions.append(prediction)
            
            report["predictions_verified"] = predictions
            
            # 计算预测准确率
            if predictions:
                correct_count = sum(1 for p in predictions if p["correct"])
                report["accuracy"] = (correct_count / len(predictions)) * 100
            else:
                report["accuracy"] = None
            
            return report
            
        except Exception as e:
            logger.error(f"Unexpected error in backtest analysis for {ticker}: {str(e)}")
            return {"error": str(e)} 