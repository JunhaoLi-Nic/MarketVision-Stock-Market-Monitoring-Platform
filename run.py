import os
import subprocess
import threading
import sys
import time
import signal

def run_backend():
    """运行后端服务"""
    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
    os.chdir(backend_dir)
    print("启动后端服务...")
    
    # 在 Windows 上使用 cmd.exe
    if sys.platform == 'win32':
        backend_process = subprocess.Popen(
            'uvicorn main:app --reload --port 8002',
            shell=True,
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
        )
    else:
        backend_process = subprocess.Popen(
            ['uvicorn', 'main:app', '--reload', '--port', '8002']
        )
    
    return backend_process

def run_frontend():
    """运行前端服务"""
    frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend')
    os.chdir(frontend_dir)
    print("启动前端服务...")
    
    # 在 Windows 上使用 cmd.exe
    if sys.platform == 'win32':
        frontend_process = subprocess.Popen(
            'npm.cmd start',  # Use npm.cmd instead of npm
            shell=True,
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
        )
    else:
        frontend_process = subprocess.Popen(
            ['npm', 'start']
        )
    
    return frontend_process

def main():
    # 存储原始工作目录
    original_dir = os.getcwd()
    
    try:
        # 启动后端
        backend_process = run_backend()
        
        # 等待几秒钟确保后端启动
        time.sleep(2)
        
        # 返回原始目录
        os.chdir(original_dir)
        
        # 启动前端
        frontend_process = run_frontend()
        
        # 等待用户按 Ctrl+C
        try:
            backend_process.wait()
            frontend_process.wait()
        except KeyboardInterrupt:
            print("\n正在关闭服务...")
            
            # 在 Windows 上使用特定的终止方法
            if sys.platform == 'win32':
                # Send Ctrl+C signal to process group
                os.kill(backend_process.pid, signal.CTRL_BREAK_EVENT)
                os.kill(frontend_process.pid, signal.CTRL_BREAK_EVENT)
                
                # Give processes time to shut down gracefully
                time.sleep(2)
                
                # Force terminate if still running
                if backend_process.poll() is None:
                    backend_process.terminate()
                if frontend_process.poll() is None:
                    frontend_process.terminate()
            else:
                # 在 Unix 系统上发送 SIGTERM 信号
                backend_process.send_signal(signal.SIGTERM)
                frontend_process.send_signal(signal.SIGTERM)
            
            # 等待进程结束
            try:
                backend_process.wait(timeout=5)
                frontend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                # Force kill if timeout
                backend_process.kill()
                frontend_process.kill()
            
            print("服务已关闭")
            
    except Exception as e:
        print(f"发生错误: {e}")
        # 确保进程被终止
        try:
            backend_process.terminate()
            frontend_process.terminate()
        except:
            pass
        
        sys.exit(1)

if __name__ == "__main__":
    main() 