import logging
import yfinance as yf
import pandas as pd

# Configure logging
logger = logging.getLogger(__name__)

def get_market_prices():
    """
    Fetches market prices for various financial instruments and returns them in a structured format.
    
    Returns:
        dict: A dictionary containing market price data or an error message
    """
    # Define the tickers we want to fetch
    tickers = {
        'Bonds': '^TYX',  # 30-Year Treasury Yield
        'US Treasury Yields': '^TNX',  # 10-Year Treasury Yield
        'US 10-Year Yield': '^TNX',  # 10-Year Treasury Yield
        'Federal Funds Rate': '^IRX',  # 13-Week Treasury Bill
        'USD Index': 'DX-Y.NYB',  # US Dollar Index
        'Gold': 'GC=F',  # Gold Futures
        'Crude Oil': 'CL=F',  # Crude Oil Futures
        'Commodities': 'GSG',  # iShares S&P GSCI Commodity-Indexed Trust
        'Copper Prices': 'HG=F',  # Copper Futures
        'VIX (Volatility Index)': '^VIX',  # CBOE Volatility Index
        'S&P 500': '^GSPC',  # S&P 500 Index
        'Growth Stocks': 'IWF',  # iShares Russell 1000 Growth ETF
        'Value Stocks': 'IWD',  # iShares Russell 1000 Value ETF
        'US Multinational Companies': 'XLK',  # Technology Select Sector SPDR Fund
        'AUD/USD': 'AUDUSD=X',  # Australian Dollar to US Dollar
        'NZD/AUD': 'NZDAUD=X',  # New Zealand Dollar to Australian Dollar
        'CAD': 'CADUSD=X',  # Canadian Dollar to US Dollar
        'NOK (Norwegian Krone)': 'NOKUSD=X',  # Norwegian Krone to US Dollar
        'CHF (Swiss Franc)': 'CHFUSD=X',  # Swiss Franc to US Dollar
        'Emerging Market Currencies': 'CEW',  # WisdomTree Emerging Currency Strategy Fund
        'TIPS (Treasury Inflation-Protected Securities)': 'TIP',  # iShares TIPS Bond ETF
        'Real Estate': 'IYR',  # iShares U.S. Real Estate ETF
        'Stocks': '^GSPC',  # S&P 500 as a proxy for stocks
        'USD/JPY': 'JPY=X',  # US Dollar to Japanese Yen
        'Inflation': 'RINF',  # ProShares Inflation Expectations ETF
        'Currency Pair': 'EURUSD=X',  # EUR/USD as a generic currency pair
        'Currency Strength': 'DX-Y.NYB',  # USD Index as a proxy for currency strength
        'Risk Sentiment': 'VIX'  # VIX as a proxy for risk sentiment
    }
    
    # Fetch the data
    prices = {}
    try:
        for name, ticker in tickers.items():
            try:
                logger.info(f"Fetching data for {name} ({ticker})")
                data = yf.Ticker(ticker).history(period='1d')
                if not data.empty:
                    # Convert to float to ensure JSON serialization works
                    prices[name] = {
                        'price': float(round(data['Close'].iloc[-1], 2)),
                        'change': float(round(data['Close'].iloc[-1] - data['Open'].iloc[0], 2)),
                        'change_percent': float(round(((data['Close'].iloc[-1] - data['Open'].iloc[0]) / data['Open'].iloc[0]) * 100, 2))
                    }
                else:
                    prices[name] = {'price': 0, 'change': 0, 'change_percent': 0}
                    logger.warning(f"Empty data for {name} ({ticker})")
            except Exception as e:
                logger.error(f"Error fetching {name} ({ticker}): {str(e)}")
                # Use zeros instead of 'N/A' to avoid type issues
                prices[name] = {'price': 0, 'change': 0, 'change_percent': 0}
        
        return {'success': True, 'data': prices}
    except Exception as e:
        logger.error(f"General error: {str(e)}")
        return {'success': False, 'error': str(e)} 