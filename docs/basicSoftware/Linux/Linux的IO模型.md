
## 阻塞I/O（Blocking I/O）
当应用程序发起一个I/O请求时，操作系统会进入内核等待数据准备好，数据读取完成后再返回到用户态。此时进程会因为等待I/O操作而长时间阻塞。
```cpp
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <time.h>
#include <string.h>
#include <sys/time.h>
#include <errno.h>

void print_timestamp(const char* prefix) {
    struct timeval tv;
    gettimeofday(&tv, NULL);
    char timestamp[64];
    strftime(timestamp, sizeof(timestamp), "%H:%M:%S", localtime(&tv.tv_sec));
    printf("%s: %s.%06ld\n", prefix, timestamp, tv.tv_usec);
}

int main() {
    const char* fifo_path = "test_fifo";
    
    // 创建FIFO（命名管道）
    unlink(fifo_path); // 如果已存在则删除
    if (mkfifo(fifo_path, 0666) == -1) {
        perror("mkfifo failed");
        return 1;
    }
    
    printf("FIFO created. Waiting for data...\n");
    printf("To write to the FIFO, use: echo \"your message\" > test_fifo\n\n");
    
    // 以阻塞模式打开FIFO
    int fd = open(fifo_path, O_RDONLY);
    if (fd == -1) {
        perror("open failed");
        unlink(fifo_path);
        return 1;
    }
    
    char buffer[1024];
    int read_count = 0;
    
    while (read_count < 5) { // 读取5次后退出
        print_timestamp("Waiting for data");
        printf("Attempting read #%d... (blocked until data arrives)\n", read_count + 1);
        
        // 阻塞读取
        ssize_t bytes = read(fd, buffer, sizeof(buffer) - 1);
        // 不能立马执行打印，只有当读取到数据之后再回继续
        print_timestamp("Read completed");
        
        if (bytes > 0) {
            buffer[bytes] = '\0';
            printf("Read %zd bytes: %s\n", bytes, buffer);
        } else if (bytes == 0) {
            printf("Writer closed the FIFO\n");
            break;
        } else {
            perror("read failed");
            break;
        }
        
        read_count++;
        printf("\nWaiting for next input...\n\n");
    }
    
    close(fd);
    unlink(fifo_path);
    return 0;
}
```

## 非阻塞I/O（Non-blocking I/O）
非阻塞I/O模型使应用程序可以在I/O未就绪时立即返回，而不是被阻塞。应用程序在非阻塞模式下，会不断轮询（polling）内核检查I/O状态，直到数据准备好。这种方式避免了进程阻塞，但轮询消耗CPU资源，使其适合对实时响应性要求高的场景，但在大量I/O情况下效率不佳。而且应用程序无法得知数据什么时候就绪，只能做到插入一段逻辑之后继续轮询。

```cpp
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <time.h>
#include <string.h>
#include <sys/time.h>
#include <errno.h>

void print_timestamp(const char* prefix) {
    struct timeval tv;
    gettimeofday(&tv, NULL);
    char timestamp[64];
    strftime(timestamp, sizeof(timestamp), "%H:%M:%S", localtime(&tv.tv_sec));
    printf("%s: %s.%06ld\n", prefix, timestamp, tv.tv_usec);
}

void set_nonblocking(int fd) {
    int flags = fcntl(fd, F_GETFL, 0);
    if (flags == -1) {
        perror("fcntl F_GETFL failed");
        exit(1);
    }
    if (fcntl(fd, F_SETFL, flags | O_NONBLOCK) == -1) {
        perror("fcntl F_SETFL failed");
        exit(1);
    }
}

int main() {
    const char* fifo_path = "test_fifo";
    
    // 创建FIFO
    unlink(fifo_path);
    if (mkfifo(fifo_path, 0666) == -1) {
        perror("mkfifo failed");
        return 1;
    }
    
    printf("FIFO created. Demo of non-blocking I/O...\n");
    printf("To write to the FIFO, use: echo \"your message\" > test_fifo\n\n");
    
    // 以非阻塞模式打开FIFO
    int fd = open(fifo_path, O_RDONLY | O_NONBLOCK);
    if (fd == -1) {
        perror("open failed");
        unlink(fifo_path);
        return 1;
    }
    
    char buffer[1024];
    int read_count = 0;
    
    // 持续运行，直到读取到5次数据
    while (read_count < 5) {
        print_timestamp("Attempting read");
        printf("Waiting for data... (read count: %d/5)\n", read_count);
        
        // 非阻塞读取
        ssize_t bytes = read(fd, buffer, sizeof(buffer) - 1);
        
        if (bytes > 0) {
            // 成功读取数据
            buffer[bytes] = '\0';
            print_timestamp("Data received");
            printf("Read %zd bytes: %s\n", bytes, buffer);
            read_count++;
            printf("\nWaiting for next input...\n\n");
        } else if (bytes == 0) {
            // 写入端关闭
            read_count++;
            printf("Writer closed the FIFO\n");
        } else if (errno == EAGAIN || errno == EWOULDBLOCK) {
            // 没有数据可读
            printf("No data available right now\n");
            printf("Process can do other things here instead of blocking...\n");
        } else {
            // 其他错误
            perror("read failed");
            break;
        }
        
        printf("-----------------------------------\n");
        sleep(2);  // 等待2秒再次尝试
    }
    
    printf("Successfully read 5 messages. Exiting...\n");
    close(fd);
    unlink(fifo_path);
    return 0;
}
```

## I/O多路复用（I/O Multiplexing）
I/O多路复用使用select、poll或epoll等系统调用来监控多个文件描述符，一旦某个描述符的状态发生变化，就通知应用程序。这样就可以在单个线程或进程中管理多个I/O操作，常用于高并发场景。I/O多路复用避免了轮询消耗的CPU资源，是Web服务器等高并发应用的常用模型。   
该模型仍然会阻塞线程来等待结果，任意一个文件描述符就绪都会解除阻塞。
### 常用函数
select：适合少量文件描述符的情况，但随着文件描述符数量增加性能会下降。
poll：和select类似，但没有文件描述符数量的限制。
epoll：Linux特有的多路复用接口，相比select和poll更高效，适合处理大量连接的场景，如Nginx、Redis等。
```cpp
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <sys/types.h>
#include <sys/epoll.h>
#include <sys/stat.h>
#include <time.h>
#include <sys/time.h>

#define MAX_EVENTS 10
#define FIFO_COUNT 2
#define BUFFER_SIZE 1024

// FIFO结构体
typedef struct {
    char *path;           // FIFO路径
    int fd;              // 文件描述符
    int writer_existed;   // 是否曾经有写入端
} FifoInfo;

void print_timestamp(const char* prefix) {
    struct timeval tv;
    gettimeofday(&tv, NULL);
    char timestamp[64];
    strftime(timestamp, sizeof(timestamp), "%H:%M:%S", localtime(&tv.tv_sec));
    printf("%s: %s.%06ld\n", prefix, timestamp, tv.tv_usec);
}

// 设置非阻塞模式
void set_nonblocking(int fd) {
    int flags = fcntl(fd, F_GETFL, 0);
    if (flags == -1) {
        perror("fcntl F_GETFL failed");
        exit(EXIT_FAILURE);
    }
    if (fcntl(fd, F_SETFL, flags | O_NONBLOCK) == -1) {
        perror("fcntl F_SETFL failed");
        exit(EXIT_FAILURE);
    }
}

// 创建和初始化FIFO
void init_fifo(FifoInfo *fifo) {
    unlink(fifo->path);
    if (mkfifo(fifo->path, 0666) == -1) {
        perror("mkfifo failed");
        exit(EXIT_FAILURE);
    }
    
    // 以非阻塞模式打开FIFO
    fifo->fd = open(fifo->path, O_RDONLY | O_NONBLOCK);
    if (fifo->fd == -1) {
        perror("open fifo failed");
        unlink(fifo->path);
        exit(EXIT_FAILURE);
    }
    set_nonblocking(fifo->fd);
    fifo->writer_existed = 0;
    
    printf("FIFO created: %s\n", fifo->path);
}

// 处理FIFO的读取事件
void handle_fifo_read(FifoInfo *fifo) {
    char buffer[BUFFER_SIZE];
    print_timestamp(fifo->path);
    
    ssize_t bytes = read(fifo->fd, buffer, sizeof(buffer) - 1);
    
    if (bytes > 0) {
        // 成功读取数据
        buffer[bytes] = '\0';
        printf("%s: Read %zd bytes: %s\n", fifo->path, bytes, buffer);
        fifo->writer_existed = 1;
    } else if (bytes == 0) {
        if (fifo->writer_existed) {
            printf("%s: All writers closed\n", fifo->path);
        } else {
            printf("%s: No writer has opened yet\n", fifo->path);
        }
    } else {
        if (errno == EAGAIN || errno == EWOULDBLOCK) {
            printf("%s: No data available\n", fifo->path);
        } else {
            perror("read failed");
        }
    }
    printf("-----------------------------------\n");
}

int main() {
    // 初始化FIFO信息
    FifoInfo fifos[FIFO_COUNT] = {
        {.path = "fifo1"},
        {.path = "fifo2"}
    };
    
    // 创建epoll实例
    int epfd = epoll_create1(0);
    if (epfd == -1) {
        perror("epoll_create1 failed");
        exit(EXIT_FAILURE);
    }
    
    // 初始化所有FIFO并添加到epoll
    struct epoll_event ev;
    for (int i = 0; i < FIFO_COUNT; i++) {
        init_fifo(&fifos[i]);
        
        ev.events = EPOLLIN | EPOLLET;  // 边缘触发模式
        ev.data.ptr = &fifos[i];
        
        if (epoll_ctl(epfd, EPOLL_CTL_ADD, fifos[i].fd, &ev) == -1) {
            perror("epoll_ctl failed");
            exit(EXIT_FAILURE);
        }
    }
    
    printf("\nWaiting for data. To write to FIFOs, use:\n");
    printf("echo \"message\" > fifo1\n");
    printf("echo \"message\" > fifo2\n\n");
    
    // 事件循环
    struct epoll_event events[MAX_EVENTS];
    while (1) {
        // 会阻塞当前线程，任意一个文件描述符就绪都会解除阻塞，这时候就需要再次调用epoll_wait
        int nfds = epoll_wait(epfd, events, MAX_EVENTS, 5000);  // 5秒超时
        
        if (nfds == -1) {
            perror("epoll_wait failed");
            break;
        } else if (nfds == 0) {
            printf("No data received in last 5 seconds...\n");
            continue;
        }
        
        // 处理所有就绪的文件描述符
        for (int n = 0; n < nfds; n++) {
            FifoInfo *fifo = (FifoInfo *)events[n].data.ptr;
            
            if (events[n].events & EPOLLIN) {
                handle_fifo_read(fifo);
            }
            
            if (events[n].events & (EPOLLHUP | EPOLLERR)) {
                printf("EPOLL error or HUP on %s\n", fifo->path);
            }
        }
    }
    
    // 清理资源
    for (int i = 0; i < FIFO_COUNT; i++) {
        close(fifos[i].fd);
        unlink(fifos[i].path);
    }
    close(epfd);
    
    return 0;
}
```
## 信号驱动I/O（Signal-driven I/O）
在信号驱动I/O中，应用程序通过注册一个信号处理程序来处理I/O事件。I/O准备好时，操作系统会向进程发送一个信号，通知应用程序处理该I/O事件。  
**信号驱动I/O通知的是I/O 准备就绪的时间点，应用程序主动进行读取/写入。**
```cpp
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <signal.h>
#include <string.h>
#include <errno.h>


#define FIFO_PATH "signal_fifo"
#define BUFFER_SIZE 1024

// 定义文件描述符变量
int fifo_fd;

// 信号处理函数
void handle_io_signal(int signum) {
    if (signum == SIGIO) {
        char buffer[BUFFER_SIZE];
        ssize_t bytes_read;

        // 从FIFO读取数据
        while ((bytes_read = read(fifo_fd, buffer, sizeof(buffer) - 1)) > 0) {
            buffer[bytes_read] = '\0';
            printf("Received %zd bytes: %s\n", bytes_read, buffer);
        }

        // 检查是否没有数据可读
        if (bytes_read == -1 && errno != EAGAIN) {
            perror("read failed");
            exit(EXIT_FAILURE);
        }
    }
}

int main() {
    // 创建FIFO
    unlink(FIFO_PATH);
    if (mkfifo(FIFO_PATH, 0666) == -1) {
        perror("mkfifo failed");
        exit(EXIT_FAILURE);
    }

    // 打开FIFO并设置非阻塞模式
    fifo_fd = open(FIFO_PATH, O_RDONLY | O_NONBLOCK);
    if (fifo_fd == -1) {
        perror("open fifo failed");
        exit(EXIT_FAILURE);
    }

    // 设置信号处理程序
    struct sigaction sa;
    sa.sa_handler = handle_io_signal;
    sa.sa_flags = 0;
    sigemptyset(&sa.sa_mask);
    if (sigaction(SIGIO, &sa, NULL) == -1) {
        perror("sigaction failed");
        exit(EXIT_FAILURE);
    }

    // 配置文件描述符接收SIGIO信号
    if (fcntl(fifo_fd, F_SETOWN, getpid()) == -1) {
        perror("fcntl F_SETOWN failed");
        exit(EXIT_FAILURE);
    }

    // 设置文件描述符的信号驱动I/O和非阻塞标志
    int flags = fcntl(fifo_fd, F_GETFL);
    if (flags == -1) {
        perror("fcntl F_GETFL failed");
        exit(EXIT_FAILURE);
    }
    if (fcntl(fifo_fd, F_SETFL, flags | O_ASYNC | O_NONBLOCK) == -1) {
        perror("fcntl F_SETFL failed");
        exit(EXIT_FAILURE);
    }

    printf("Waiting for data. To write to FIFO, use:\n");
    printf("echo \"message\" > %s\n\n", FIFO_PATH);

    // 主事件循环
    while (1) {
        printf("Doing other work...\n");
        sleep(5);  // 模拟其它任务
    }

    // 清理资源
    close(fifo_fd);
    unlink(FIFO_PATH);
    return 0;
}

```


## 异步I/O（Asynchronous I/O）
异步I/O模型让应用程序在发起I/O请求后可以继续执行其他操作，而不需等待I/O完成。当I/O完成后，操作系统会通知应用程序，并将数据传递给它。Linux的aio库提供了对异步I/O的支持。异步I/O效率最高，但编程复杂度较高，适合于要求高吞吐量的系统，如数据库服务器等。  
（下面的例子可能不大好，感觉还是通过轮询io_getevents实现的）
**异步I/O通知的是I/O操作何时已经完成。**
```cpp
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <libaio.h>
#include <sys/stat.h>

#define FIFO_PATH "asynchronous_fifo"
#define BUFFER_SIZE 1024

// 异步 I/O 上下文和缓冲区
io_context_t ctx;
char buffer[BUFFER_SIZE];

// 异步 I/O 完成回调
void handle_aio_complete(struct io_event *event) {
    // 检查读取结果
    if ((long)event->res > 0) {
        buffer[event->res] = '\0';
        printf("Read %ld bytes asynchronously: %s\n", (long)event->res, buffer);
    } else {
        printf("No data read asynchronously or error occurred.\n");
    }
}

int main() {
    int ret;

    // 初始化异步 I/O 上下文
    memset(&ctx, 0, sizeof(ctx));
    ret = io_setup(10, &ctx);
    if (ret < 0) {
        perror("io_setup failed");
        exit(EXIT_FAILURE);
    }

    // 创建 FIFO
    unlink(FIFO_PATH);
    if (mkfifo(FIFO_PATH, 0666) == -1) {
        perror("mkfifo failed");
        exit(EXIT_FAILURE);
    }

    // 打开 FIFO 并设置为非阻塞模式
    int fifo_fd = open(FIFO_PATH, O_RDONLY | O_NONBLOCK);
    if (fifo_fd == -1) {
        perror("open FIFO failed");
        exit(EXIT_FAILURE);
    }

    printf("Waiting for data. To write to FIFO, use:\n");
    printf("echo \"message\" > %s\n\n", FIFO_PATH);

    while (1) {
        struct iocb cb;
        struct iocb *cbs[1] = { &cb };
        struct io_event events[1];

        // 准备异步读取操作
        io_prep_pread(&cb, fifo_fd, buffer, BUFFER_SIZE - 1, 0);

        // 提交异步读取请求
        ret = io_submit(ctx, 1, cbs);
        if (ret < 0) {
            perror("io_submit failed");
            break;
        }

        // 等待 I/O 完成事件
        ret = io_getevents(ctx, 1, 1, events, NULL);
        if (ret < 0) {
            perror("io_getevents failed");
            break;
        }

        // 调用回调处理完成事件
        handle_aio_complete(&events[0]);

        // 模拟处理其他任务
        printf("Doing other work...\n");
        sleep(5);
    }

    // 关闭 FIFO 并清理异步 I/O 上下文
    close(fifo_fd);
    io_destroy(ctx);
    unlink(FIFO_PATH);

    return 0;
}

```